/* CUE deck engine.
 *
 * A slide is registered with Deck.add({...}):
 *   n        slide number (sort order)
 *   stage    "plant" | "water" | "harvest" | "blend" | "pour" | "serve" | "cheers"
 *   title    short title (grid, notes, print)
 *   budget   seconds planned for this slide (timer)
 *   notes    speaker notes (N key)
 *   html     markup string or function(ctx) -> string, placed inside .slide
 *   steps    array of functions (el, ctx) -> gsap timeline | void.
 *            steps[0] plays on entry; each Next click plays the next one.
 *            If a step is still animating, Next fast-forwards it instead.
 *   ambient  optional (el, ctx) -> timeline that loops while on the slide
 *   usesOrder  true -> the latest order is fetched on entry; onOrder(el, order, ctx) is called
 *   music    loop key for this slide (defaults to its stage); "brand" plays the brand song
 *   interactive  true -> clicks on the slide do NOT advance (e.g. the dart throw)
 *
 * ctx = { $, $$, sfx, order, data, menu, brand, gsap, art }
 */
(function () {
  // Printed-label palette (see base.css tokens): charcoal / peach grounds alternate;
  // accents are straw-red or one muted product colour. Keys and shape are stable — slides read them.
  const STAGES = {
    plant:   { name: "Plant the seed", bg: "#25292B", fg: "#F2D9C2", accent: "#B83A32" },
    water:   { name: "Water & grow",   bg: "#F2D9C2", fg: "#25292B", accent: "#B83A32" },
    harvest: { name: "Harvest",        bg: "#30363A", fg: "#F2D9C2", accent: "#E3B23C" },
    blend:   { name: "Blend",          bg: "#E9CDB0", fg: "#25292B", accent: "#B83A32", sfx: "blender" },
    pour:    { name: "Pour",           bg: "#25292B", fg: "#F2D9C2", accent: "#B5506A" },
    serve:   { name: "Serve",          bg: "#F2D9C2", fg: "#25292B", accent: "#9BB36A" },
    cheers:  { name: "Cheers",         bg: "#30363A", fg: "#F2D9C2", accent: "#B83A32" }
  };
  const W = 1920, H = 1080;
  const slides = [];
  let idx = -1, stepIdx = 0, currentTl = null, ambientTl = null, busy = false;
  let started = null, stageStart = {}, timerHandle = null;
  const params = new URLSearchParams(location.search);
  const PRINT = params.has("print");

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const ctx = {
    $, $$, gsap: window.gsap, art: window.CueArt,
    get data() { return window.CONTENT.data; },
    get menu() { return window.CONTENT.menu; },
    get brand() { return window.CONTENT.brand; },
    order: null,
    sfx: (n) => window.DeckAudio && window.DeckAudio.sfx(n),
    stages: STAGES,
    pct: (x) => Math.round(x * 100) + "%",
    fruit: (k) => window.CONTENT.menu.fruits.find(f => f.key === k),
    base: (k) => window.CONTENT.menu.bases.find(f => f.key === k),
    addon: (k) => window.CONTENT.menu.addons.find(f => f.key === k),
    size: (k) => window.CONTENT.menu.sizes.find(f => f.key === k)
  };

  // ---------- layout ----------
  function fit() {
    const stage = $("#stage"); if (!stage || PRINT) return;
    const bar = document.fullscreenElement ? 0 : $("#toolbar").offsetHeight;
    const s = Math.min(innerWidth / W, (innerHeight - bar) / H);
    stage.style.transform = `translate(-50%, -50%) scale(${s})`;
    stage.style.top = `${(innerHeight - bar) / 2}px`;
  }

  // ---------- slide lifecycle ----------
  function render(i, slideEl) {
    const s = slides[i], st = STAGES[s.stage] || STAGES.plant;
    slideEl.className = `slide stage-${s.stage}`;
    slideEl.style.setProperty("--bg", st.bg); slideEl.style.setProperty("--fg", st.fg); slideEl.style.setProperty("--accent", st.accent);
    slideEl.dataset.n = s.n;
    slideEl.innerHTML = typeof s.html === "function" ? s.html(ctx) : (s.html || "");
    rig(slideEl);
    return slideEl;
  }

  // Give every mascot part its pivot point (SVG transform origins).
  const PIVOTS = { ".mo-leg-l": "96 222", ".mo-leg-r": "124 222", ".mo-arm-l": "78 168", ".mo-arm-r": "142 168",
    ".mo-body": "110 150", ".mo-leaf": "110 62", ".mo-eyes": "110 100", ".mo-hand-cup": "150 118" };
  function rig(root) {
    root.querySelectorAll(".mo-root").forEach(mo => {
      for (const [sel, o] of Object.entries(PIVOTS)) mo.querySelectorAll(sel).forEach(p => gsap.set(p, { svgOrigin: o }));
    });
  }

  function killAll() {
    if (currentTl) { currentTl.kill(); currentTl = null; }
    if (ambientTl) { ambientTl.kill(); ambientTl = null; }
    const el = $("#slide"); if (el) gsap.killTweensOf(el.querySelectorAll("*"));
  }

  function playStep(k, instant) {
    const s = slides[idx], el = $("#slide");
    const fn = s.steps && s.steps[k]; if (!fn) return;
    const tl = fn(el, ctx);
    currentTl = tl && tl.progress ? tl : null;
    if (instant && currentTl) currentTl.progress(1);
    stepIdx = k;
    updateUI();
  }

  async function enter(i, { toEnd = false, transition = true } = {}) {
    if (i < 0 || i >= slides.length || busy) return;
    const prevStage = idx >= 0 ? slides[idx].stage : null;
    const s = slides[i];
    const stageChange = prevStage !== null && prevStage !== s.stage;
    busy = true;
    let swapped = false;
    const swap = () => {
      if (swapped) return; swapped = true;
      killAll();
      idx = i; stepIdx = 0;
      render(i, $("#slide"));
      if (!stageStart[s.stage] && started) stageStart[s.stage] = Date.now();
      if (s.ambient && !toEnd) ambientTl = s.ambient($("#slide"), ctx);
      if (s.ambient && toEnd) { ambientTl = s.ambient($("#slide"), ctx); }
      if (toEnd) { for (let k = 0; k < (s.steps || []).length; k++) playStep(k, true); }
      else playStep(0);
      if (s.usesOrder) refreshOrder(false);
      if (window.DeckAudio) DeckAudio.loop(s.music || s.stage, s.musicVol);
      history.replaceState(null, "", "#" + s.n);
      updateUI();
      if (window.Transitions && !PRINT) Transitions.onEnter(s.n, i);
    };
    try {
      const T = window.Transitions, calm = reduceMotion();
      if (transition && stageChange && !calm && T && T.has(s.stage)) await T.stage(s.stage, swap);
      else if (transition && stageChange && !calm) await liquidWipe(STAGES[s.stage], swap);
      else if (transition && idx >= 0 && !calm && T) await T.push(swap, toEnd ? -1 : 1);
      else if (transition && idx >= 0) await softSwap(swap, toEnd ? -1 : 1, calm);
      else swap();
    } catch (e) { console.error(e); }
    finally { swap(); busy = false; }
  }
  const reduceMotion = () => !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  // Presenter pressed a key mid-transition: jump it to its end (swap still runs) and release `busy`.
  function skipTransition() { if (window.Transitions) Transitions.finish(); }

  // Stage change: one hairline sweeps down the screen in 350 ms while the slide swaps under it.
  function liquidWipe(st, mid) {
    return new Promise(res => {
      const w = $("#wipe");
      w.style.background = st.fg;
      ctx.sfx("whoosh"); if (st.sfx) ctx.sfx(st.sfx);
      const tl = gsap.timeline({ onComplete: res });
      tl.set(w, { display: "block", top: 0, opacity: 1 })
        .to(w, { top: "55%", duration: 0.15, ease: "power2.in" })
        .add(mid)
        .to(w, { top: "100%", duration: 0.2, ease: "power2.out" })
        .set(w, { display: "none" });
    });
  }
  function softSwap(mid, dir, calm) {
    return new Promise(res => {
      const el = $("#slide");
      gsap.timeline({ onComplete: res })
        .to(el, { opacity: 0, x: calm ? 0 : -18 * dir, duration: 0.15, ease: "power1.in" })
        .add(mid)
        .fromTo(el, { opacity: 0, x: calm ? 0 : 18 * dir }, { opacity: 1, x: 0, duration: 0.2, ease: "power2.out" });
    });
  }

  function next() {
    if (busy) { skipTransition(); return; }
    window.DeckAudio && DeckAudio.unlock();
    if (!started) startTimer();
    if (currentTl && currentTl.isActive()) { currentTl.progress(1); return; }
    const s = slides[idx];
    if (s.steps && stepIdx < s.steps.length - 1) { playStep(stepIdx + 1); return; }
    enter(idx + 1);
  }
  function prev() {
    if (busy) { skipTransition(); return; }
    if (stepIdx > 0) { // rebuild this slide at the previous step
      const target = stepIdx - 1;
      killAll(); render(idx, $("#slide"));
      const s = slides[idx];
      if (s.ambient) ambientTl = s.ambient($("#slide"), ctx);
      for (let k = 0; k <= target; k++) playStep(k, true);
      if (s.usesOrder && ctx.order && s.onOrder) s.onOrder($("#slide"), ctx.order, ctx);
      return;
    }
    enter(idx - 1, { toEnd: true });
  }
  const go = (i) => { if (busy) { skipTransition(); setTimeout(() => enter(i, { transition: true }), 0); } else enter(i, { transition: true }); };

  // ---------- order ----------
  async function refreshOrder(manual) {
    const btn = $("#btn-order"); btn && btn.classList.add("spin");
    try {
      const o = await window.CueOrders.latest();
      const changed = JSON.stringify(o) !== JSON.stringify(ctx.order);
      ctx.order = o;
      const s = slides[idx];
      if (s && s.onOrder) s.onOrder($("#slide"), o, ctx);
      if (changed) updateUI();
      const ob = $("#btn-order"); if (ob) { ob.querySelector(".olabel").textContent = o.source === "example" ? "#1" : `#1 ${(o.name || "Guest").split(" ")[0].slice(0, 10)}`; ob.title = (o.source === "example" ? "No live order yet" : `Order #1 from ${o.name || "Guest"}`) + ". Click to reload (R)"; ob.classList.toggle("live", o.source !== "example"); }
      if (manual || changed) toast(o.source === "example" ? "No live order yet: showing Example Order #1" : `Order #1 ${o.source === "live" ? "arrived" : "loaded"}: ${o.name}, ${o.drinkName || ""}`);
    } finally { btn && btn.classList.remove("spin"); }
  }

  // ---------- UI ----------
  function toast(msg) {
    const t = $("#toast"); t.textContent = msg;
    gsap.killTweensOf(t);
    gsap.timeline().fromTo(t, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.25 }).to(t, { opacity: 0, duration: 0.4, delay: 2.6 });
  }
  const fmt = (ms) => { const s = Math.max(0, Math.floor(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };
  function stageBudget(stage) { return slides.filter(s => s.stage === stage).reduce((a, s) => a + (s.budget || 0), 0) * 1000; }
  function startTimer() {
    started = Date.now(); stageStart = { [slides[idx].stage]: started };
    timerHandle = setInterval(updateTimer, 500);
  }
  // Two separate clocks, two separate warnings:
  //  - SECTION (stage) budget: chip "Water 3:21 left" in the toolbar + the drip-cup on the slide ("section 12s").
  //  - WHOLE TALK: chip "Talk 4:10 of 20:00" + an on-slide banner at 18:30 / 19:30 / 20:00 (visible in fullscreen).
  const TALK_LIMIT = 20 * 60000, TALK_WARN = 18.5 * 60000, TALK_FINAL = 19.5 * 60000;
  const plannedTotal = () => slides.reduce((a, x) => a + (x.budget || 0), 0) * 1000;
  const shortStage = (k) => k.charAt(0).toUpperCase() + k.slice(1);
  let warned = {}, banner = null;
  function talkLevel(total) { return total >= TALK_LIMIT ? "over" : total >= TALK_FINAL ? "final" : total >= TALK_WARN ? "warn" : ""; }
  function updateTimer() {
    const el = $("#timer"); if (!el) return;
    const s = slides[idx]; if (!s) return;
    const budget = stageBudget(s.stage), tk = $("#talk"), sc = $("#stagechip");
    const tkb = tk.querySelector("b"), tkof = tk.querySelector(".of"), scn = sc.querySelector(".sn"), scl = sc.querySelector(".sl");
    tkof.textContent = `of ${fmt(TALK_LIMIT)}`;
    scn.textContent = shortStage(s.stage);
    if (!started) {
      tkb.textContent = "0:00"; scl.textContent = `${fmt(budget)} planned`;
      tk.title = `Talk clock: starts at your first Next. Planned ${fmt(plannedTotal())} of ${fmt(TALK_LIMIT)}`;
      sc.title = `${STAGES[s.stage].name}: ${fmt(budget)} planned for this section`;
      tk.dataset.lv = ""; sc.dataset.lv = ""; showBanner("");
      return;
    }
    const used = Date.now() - (stageStart[s.stage] || Date.now()), total = Date.now() - started, left = budget - used;
    tkb.textContent = fmt(total);
    scl.textContent = left >= 0 ? `${fmt(left)} left` : `${fmt(-left)} over`;
    const tl = talkLevel(total);
    tk.dataset.lv = tl; tk.title = `Whole talk: ${fmt(total)} of ${fmt(TALK_LIMIT)} (planned ${fmt(plannedTotal())}). ${tl === "over" ? "Out of time" : fmt(TALK_LIMIT - total) + " left"}`;
    const sl = used > budget ? "over" : used > budget * 0.8 ? "warn" : "";
    sc.dataset.lv = sl; sc.title = `${STAGES[s.stage].name}: ${left >= 0 ? fmt(left) + " left in this section" : fmt(-left) + " over this section"}`;
    showBanner(tl, total);
    cupTimer(s.stage, used, budget);
  }
  // Whole-talk wrap-up cue, drawn on the slide stage (not the toolbar) so it is visible in fullscreen.
  function showBanner(level, total) {
    if (!banner) banner = $("#talkbanner"); if (!banner) return;
    if (!level || talkHidden) { banner.classList.remove("show"); return; }
    const left = TALK_LIMIT - total;
    const text = level === "over" ? "Time is up. Say thank you." : level === "final" ? `Last ${Math.max(1, Math.ceil(left / 1000))} seconds. Finish now.` : `Wrap up the talk: ${fmt(left)} left`;
    banner.querySelector(".tbt").textContent = text;
    banner.dataset.lv = level; banner.classList.add("show");
    if (!warned["talk" + level]) { warned["talk" + level] = true; gsap.fromTo(banner, { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }); }
  }
  // Time warning on the slide itself: a small line cup that drains during the last 20% of a section,
  // quietly pulses at 90%, and drips when the section runs over. T hides it.
  let cupHidden = false, talkHidden = false;
  function cupTimer(stage, used, budget) {
    const c = $("#cuptimer"); if (!c) return;
    const frac = used / budget, show = !cupHidden && frac >= 0.8;
    c.classList.toggle("show", show);
    if (!show) return;
    const st = STAGES[stage] || STAGES.plant;
    c.style.setProperty("--ct-fg", st.fg);
    const remain = Math.max(0, Math.min(1, (1 - frac) / 0.2));
    gsap.to(c.querySelector(".ct-fill"), { attr: { y: 30 + (1 - remain) * 76 }, duration: 0.4, overwrite: true });
    c.querySelector(".ct-fill").setAttribute("fill", st.accent);
    const left = budget - used;
    c.querySelector(".ct-label").innerHTML = `<i>section</i>${left > 0 ? Math.ceil(left / 1000) + "s" : "wrap up"}`;
    const key = stage + (frac >= 1 ? "over" : frac >= 0.9 ? "90" : "80");
    if (!warned[key]) {
      warned[key] = true;
      if (frac >= 0.9) gsap.fromTo(c, { opacity: 0.35 }, { opacity: 1, duration: 0.4, ease: "power2.out" });
      if (frac >= 1) gsap.fromTo(c.querySelector(".ct-drip"), { opacity: 1, y: 0 }, { y: 24, opacity: 0, duration: 0.8, repeat: 2, ease: "power1.in" });
    }
  }
  function updateUI() {
    const s = slides[idx]; if (!s) return;
    const inStage = slides.filter(x => x.stage === s.stage), posInStage = inStage.indexOf(s) + 1;
    $("#counter").innerHTML = `<b>${idx + 1}</b><span> of ${slides.length}</span>`;
    $("#counter").title = `Slide ${idx + 1} of ${slides.length}`;
    $("#stage-name").innerHTML = `${STAGES[s.stage].name}<small>${posInStage} of ${inStage.length}</small>`;
    $("#stage-name").title = `${STAGES[s.stage].name}: slide ${posInStage} of ${inStage.length} in this section`;
    $("#stage-name").style.setProperty("--dot", STAGES[s.stage].accent);
    $("#stage-name").style.setProperty("--dotfg", STAGES[s.stage].fg);
    const steps = (s.steps || []).length;
    $("#steps").innerHTML = steps > 1 ? Array.from({ length: steps }, (_, k) => `<i class="${k <= stepIdx ? "on" : ""}"></i>`).join("") : "";
    $("#notes-body").innerHTML = `<h3>${s.n}. ${s.title}</h3><p>${(s.notes || "No notes yet.").replace(/\n/g, "<br>")}</p><p class="meta">Budget ${fmt((s.budget || 0) * 1000)} · step ${stepIdx + 1} of ${steps || 1}</p>`;
    $("#btn-prev").disabled = idx === 0 && stepIdx === 0;
    $("#btn-next").disabled = idx === slides.length - 1 && stepIdx >= steps - 1;
    // progress: one segment per stage, coloured, filled up to the current step
    const segs = $("#progress-segs");
    if (segs && !segs.childElementCount) segs.innerHTML = Object.keys(STAGES).map(k => { const n = slides.filter(x => x.stage === k).length; return n ? `<i data-st="${k}" style="flex:${n};--c:${STAGES[k].accent}"><b></b></i>` : ""; }).join("");
    if (segs) segs.querySelectorAll("i").forEach(seg => {
      const list = slides.map((x, j) => [x, j]).filter(([x]) => x.stage === seg.dataset.st), first = list[0][1], n = list.length;
      const pos = idx + (steps ? (stepIdx + 1) / steps : 1) - first;
      seg.querySelector("b").style.width = `${Math.max(0, Math.min(1, pos / n)) * 100}%`;
      seg.classList.toggle("cur", s.stage === seg.dataset.st);
    });
    updateTimer(); updatePreflight();
    document.dispatchEvent(new CustomEvent("deck:state", { detail: state() }));
  }
  // Everything a phone remote / presenter view needs to show.
  function state() {
    const s = slides[idx] || {}, nx = slides[idx + 1];
    return {
      now: Date.now(), i: idx, total: slides.length, n: s.n, title: s.title, notes: s.notes || "",
      stage: s.stage, stageName: (STAGES[s.stage] || {}).name, stageColor: (STAGES[s.stage] || {}).bg, stageFg: (STAGES[s.stage] || {}).fg,
      step: stepIdx, steps: (s.steps || []).length, budget: s.budget || 0, interactive: !!s.interactive,
      remoteLocked, talkLimit: TALK_LIMIT / 1000, plannedTotal: plannedTotal() / 1000,
      next: nx ? { n: nx.n, title: nx.title, stageName: STAGES[nx.stage].name } : null,
      started, stageStart: stageStart[s.stage] || null, stageBudget: stageBudget(s.stage) / 1000,
      muted: window.DeckAudio ? DeckAudio.muted : false,
      order: ctx.order ? { name: ctx.order.name, drinkName: ctx.order.drinkName, source: ctx.order.source } : null,
      slides: slides.map(x => ({ n: x.n, title: x.title, stageName: STAGES[x.stage].name }))
    };
  }
  // Commands from a remote: {cmd:"next"|"prev"|"go"|"reload"|"mute"|"start", i}
  function command(c) {
    if (!c || !c.cmd) return;
    // Safety: when the presenter locks the phone, it can only look (state/notes), never drive the deck.
    if (remoteLocked && c.cmd !== "ping") { const t = Date.now(); if (t - lastLockToast > 4000) { lastLockToast = t; toast("Phone remote is locked (press L to unlock)"); } return; }
    if (c.cmd === "next") next();
    else if (c.cmd === "prev") prev();
    else if (c.cmd === "go" && Number.isInteger(c.i)) { if (!started) startTimer(); go(c.i); }
    else if (c.cmd === "reload") refreshOrder(true);
    else if (c.cmd === "mute") $("#btn-mute").click();
    else if (c.cmd === "ping") document.dispatchEvent(new CustomEvent("deck:state", { detail: state() }));
  }
  function buildGrid() {
    const g = $("#grid-list");
    g.innerHTML = slides.map((s, i) => {
      const st = STAGES[s.stage];
      return `<button class="thumb" data-i="${i}" style="--bg:${st.bg};--fg:${st.fg}"><span class="n">${s.n}</span><span class="t">${s.title}</span><span class="st">${st.name}</span></button>`;
    }).join("");
    g.onclick = (e) => { const b = e.target.closest(".thumb"); if (b) { toggle("#grid", false); go(+b.dataset.i); } };
  }
  function toggle(sel, force) { const el = $(sel); const on = force ?? !el.classList.contains("open"); el.classList.toggle("open", on); return on; }
  function fullscreen() { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen().catch(() => {}); }

  function manualOrderPanel() {
    const m = ctx.menu, o = ctx.order || m.exampleOrder;
    const opts = (arr, sel) => arr.map(x => `<option value="${x.key}" ${[].concat(sel).includes(x.key) ? "selected" : ""}>${x.name}</option>`).join("");
    $("#order-panel-body").innerHTML = `
      <label>Name <input id="mo-name" value="${o.name || "Professor"}"></label>
      <label>Fruit (hold ⌘ for 2) <select id="mo-fruit" multiple size="5">${opts(m.fruits, o.fruits || [])}</select></label>
      <label>Base <select id="mo-base">${opts(m.bases, o.base)}</select></label>
      <label>Add-ons <select id="mo-addons" multiple size="4">${opts(m.addons, o.addons || [])}</select></label>
      <label>Size <select id="mo-size">${opts(m.sizes, o.size)}</select></label>
      <div class="row"><button class="btn leaf" id="mo-save">Use this order</button><button class="btn ghost" id="mo-clear">Clear manual order</button></div>
      <p class="meta">Current source: ${ctx.order ? ctx.order.source : "none"}. A manual order overrides GitHub until cleared.</p>`;
    const sel = (id) => [...$(id).selectedOptions].map(x => x.value);
    $("#mo-save").onclick = () => {
      const fruits = sel("#mo-fruit").slice(0, 2), addons = sel("#mo-addons").slice(0, 2), size = $("#mo-size").value;
      const price = (ctx.size(size).price) + addons.reduce((a, k) => a + ctx.addon(k).price, 0);
      CueOrders.setManual({ name: $("#mo-name").value, fruits, base: $("#mo-base").value, addons, size, price, drinkName: CONTENT.drinkName(fruits, $("#mo-base").value), at: new Date().toISOString() });
      toggle("#order-panel", false); refreshOrder(true);
    };
    $("#mo-clear").onclick = () => { CueOrders.setManual(null); toggle("#order-panel", false); refreshOrder(true); };
  }

  // ---------- safety: lock / unlock the phone remote ----------
  let remoteLocked = false, lastLockToast = 0;
  try { remoteLocked = localStorage.getItem("cue_remote_locked") === "1"; } catch {}
  function setRemoteLock(on, quiet) {
    remoteLocked = !!on;
    try { localStorage.setItem("cue_remote_locked", remoteLocked ? "1" : "0"); } catch {}
    const b = $("#btn-remote"); if (b) { b.classList.toggle("locked", remoteLocked); b.title = remoteLocked ? "Phone remote is LOCKED: it can read notes but cannot change slides (L to unlock)" : "Phone remote: notes + clicker on your phone (L to lock)"; }
    const lm = document.querySelector('#menu [data-act="lock"] span'); if (lm) lm.textContent = remoteLocked ? "Unlock phone control" : "Lock phone control (disable clicker)";
    const pl = $("#pf-lock"); if (pl) { pl.classList.toggle("on", remoteLocked); pl.querySelector("span").textContent = remoteLocked ? "Phone control: locked" : "Phone control: on"; }
    if (!quiet) { toast(remoteLocked ? "Phone control disabled. It still shows notes and the timer." : "Phone control enabled"); window.DeckAudio && DeckAudio.sfx(remoteLocked ? "click" : "pop"); }
    document.dispatchEvent(new CustomEvent("deck:state", { detail: state() }));
  }

  // ---------- start-of-talk sound check ----------
  function testAudio() {
    if (!window.DeckAudio) { toast("Audio engine not loaded"); return; }
    DeckAudio.unlock();
    if (DeckAudio.muted) { toast("Sound is muted. Press M to turn it on, then test again."); const m = $("#btn-mute"); m && gsap.fromTo(m, { scale: 1.2 }, { scale: 1, duration: 0.4, ease: "power2.out" }); return; }
    DeckAudio.sfx("jingle");
    toast("Playing a short jingle. Can the back row hear it? If not, raise the volume or check the output device.");
    const b = $("#pf-test"); if (b) { b.classList.add("played"); gsap.fromTo(b, { scale: 1.08 }, { scale: 1, duration: 0.4, ease: "power2.out" }); }
  }
  // The pre-flight card is only visible until the timer starts (first Next).
  function updatePreflight() {
    const c = $("#preflight"); if (!c) return;
    c.classList.toggle("show", !started && !PRINT && !pfClosed);
  }
  let pfClosed = false;

  function bindUI() {
    $("#pf-test").onclick = (e) => { e.stopPropagation(); testAudio(); };
    $("#pf-lock").onclick = (e) => { e.stopPropagation(); setRemoteLock(!remoteLocked); };
    $("#pf-x").onclick = (e) => { e.stopPropagation(); pfClosed = true; updatePreflight(); };
    setRemoteLock(remoteLocked, true);
    $("#btn-prev").onclick = prev; $("#btn-next").onclick = next;
    $("#btn-grid").onclick = () => toggle("#grid");
    $("#btn-full").onclick = fullscreen;
    $("#btn-order").onclick = () => refreshOrder(true);
    // Live orders: the phone sends Order #1 over the relay; it shows up here without pressing anything.
    if (window.CueOrders.listen) CueOrders.listen(() => { refreshOrder(false); window.DeckAudio && DeckAudio.sfx("chime"); });
    $("#btn-mute").onclick = () => { const m = DeckAudio.toggleMute(); $("#btn-mute").classList.toggle("off", m); toast(m ? "Sound off" : "Sound on"); };
    $("#btn-menu").onclick = (e) => { e.stopPropagation(); toggle("#menu"); };
    document.addEventListener("click", (e) => { if (!e.target.closest("#menu")) toggle("#menu", false); });
    $("#menu").onclick = (e) => {
      const a = e.target.closest("[data-act]"); if (!a) return;
      const act = a.dataset.act; toggle("#menu", false);
      if (act === "pdf") window.open("index.html?print", "_blank");
      if (act === "notes") toggle("#notes");
      if (act === "order") { manualOrderPanel(); toggle("#order-panel", true); }
      if (act === "pptx") toast("PPTX/MP4: run tools/export on a laptop with Node (see PLAN.md §8)");
      if (act === "html") toast("HTML: share the GitHub Pages link, or zip the PRESENTATION folder");
      if (act === "keys") toggle("#keys");
      if (act === "restart") { started = null; clearInterval(timerHandle); stageStart = {}; warned = {}; go(0); toast("Timer reset"); }
      if (act === "home") location.href = "../index.html";
      if (act === "fresh") { CueOrders.reset(); location.reload(); }
      if (act === "remote" && window.DeckRemote) DeckRemote.open();
      if (act === "lock") setRemoteLock(!remoteLocked);
      if (act === "audiotest") testAudio();
      if (act === "mascot" && window.DeckExtras) DeckExtras.toggleMascot();
    };
    $$(".panel .close").forEach(b => b.onclick = () => b.closest(".panel").classList.remove("open"));
    let lastPointer = "mouse", tStart = null, swiped = false;
    document.addEventListener("pointerdown", (e) => { lastPointer = e.pointerType; }, true);
    $("#stage").addEventListener("click", (e) => {
      if (swiped) { swiped = false; return; }
      if (e.target.closest("a, button, input, select, [data-interactive]")) return;
      if (slides[idx] && slides[idx].interactive && lastPointer !== "touch") return;
      // On touch screens: tap the left quarter to go back, anywhere else to go forward.
      if (lastPointer === "touch" && e.clientX < innerWidth * 0.25) prev(); else next();
    });
    document.addEventListener("touchstart", (e) => { if (e.target.closest("#toolbar, .panel, #grid, .menu")) { tStart = null; return; } const t = e.touches[0]; tStart = { x: t.clientX, y: t.clientY, at: Date.now() }; }, { passive: true });
    document.addEventListener("touchend", (e) => {
      if (!tStart) return; const t = e.changedTouches[0], dx = t.clientX - tStart.x, dy = t.clientY - tStart.y;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5 && Date.now() - tStart.at < 700) { swiped = true; setTimeout(() => swiped = false, 400); dx < 0 ? next() : prev(); }
      tStart = null;
    }, { passive: true });
    document.addEventListener("keydown", (e) => {
      if (e.target.closest("input, select, textarea")) return;
      const k = e.key;
      if (["ArrowRight", " ", "PageDown", "Enter"].includes(k)) { e.preventDefault(); next(); }
      else if (["ArrowLeft", "PageUp", "Backspace"].includes(k)) { e.preventDefault(); prev(); }
      else if (k === "Home") go(0);
      else if (k === "End") go(slides.length - 1);
      else if (k === "f" || k === "F") fullscreen();
      else if (k === "r" || k === "R") refreshOrder(true);
      else if (k === "m" || k === "M") $("#btn-mute").click();
      else if (k === "g" || k === "G") toggle("#grid");
      else if (k === "n" || k === "N") toggle("#notes");
      else if (k === "o" || k === "O") { manualOrderPanel(); toggle("#order-panel"); }
      else if (k === "x" || k === "X") window.Transitions && Transitions.surprise();
      else if (k === "?") toggle("#keys");
      else if (k === "t" || k === "T") { cupHidden = talkHidden = !cupHidden; toast(cupHidden ? "On-slide time cues hidden" : "On-slide time cues shown"); updateTimer(); }
      else if (k === "l" || k === "L") setRemoteLock(!remoteLocked);
      else if (k === "s" || k === "S") testAudio();
      else if ((k === "k" || k === "K") && window.DeckExtras) DeckExtras.toggleMascot();
      else if ((k === "p" || k === "P") && window.DeckRemote) DeckRemote.open();
      else if (k === "Escape") $$(".panel.open, #grid.open").forEach(p => p.classList.remove("open"));
    });
    // toolbar auto-hide in fullscreen
    let hideT; document.addEventListener("mousemove", () => {
      document.body.classList.remove("idle"); clearTimeout(hideT);
      if (document.fullscreenElement) hideT = setTimeout(() => document.body.classList.add("idle"), 2200);
    });
    document.addEventListener("fullscreenchange", () => { document.body.classList.toggle("fs", !!document.fullscreenElement); fit(); });
    addEventListener("resize", fit);
  }

  // ---------- print mode: every slide at its final state, one per page ----------
  async function printMode() {
    document.body.classList.add("print");
    const holder = $("#print-pages");
    ctx.order = await window.CueOrders.latest();
    for (let i = 0; i < slides.length; i++) {
      const page = document.createElement("section"); page.className = "print-page";
      const el = document.createElement("div"); page.appendChild(el); holder.appendChild(page);
      idx = i; render(i, el);
      const s = slides[i];
      if (s.steps) s.steps.forEach(fn => { const tl = fn(el, ctx); if (tl && tl.progress) tl.progress(1); });
      if (s.onOrder) s.onOrder(el, ctx.order, ctx);
      if (s.printFix) s.printFix(el, ctx);
    }
    gsap.globalTimeline.getChildren().forEach(t => t.progress && t.progress(1));
    setTimeout(() => window.print(), 900);
  }

  window.Deck = {
    STAGES, ctx,
    add(s) { slides.push(s); },
    start() {
      slides.sort((a, b) => a.n - b.n);
      if (PRINT) return printMode();
      bindUI(); buildGrid(); fit();
      const fromHash = slides.findIndex(s => String(s.n) === location.hash.slice(1));
      enter(fromHash >= 0 ? fromHash : 0, { transition: false });
      CueOrders.latest().then(o => { ctx.order = o; });
    },
    next, prev, go, toast, refreshOrder, state, command, rig, setRemoteLock, testAudio,
    get remoteLocked() { return remoteLocked; },
    get busy() { return busy; }, get started() { return !!started; }, get reduceMotion() { return reduceMotion(); },
    get slideEl() { return $("#slide"); }, get current() { return slides[idx]; },
    get index() { return idx; }
  };
})();
