/* Sprout deck engine.
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
  const STAGES = {
    plant:   { name: "Plant the seed", bg: "#3B2414", fg: "#FFF4E2", accent: "#FF8A1F" },
    water:   { name: "Water & grow",   bg: "#8FD3F4", fg: "#10324A", accent: "#2FA84F" },
    harvest: { name: "Harvest",        bg: "#F6C445", fg: "#2A1A10", accent: "#B0244A" },
    blend:   { name: "Blend",          bg: "#FF8A1F", fg: "#2A1A10", accent: "#FFF4E2", sfx: "blender" },
    pour:    { name: "Pour",           bg: "#B0244A", fg: "#FFF4E2", accent: "#F6C445" },
    serve:   { name: "Serve",          bg: "#2FA84F", fg: "#FFFDF8", accent: "#F6C445" },
    cheers:  { name: "Cheers",         bg: "#FF6FA3", fg: "#2A1A10", accent: "#FFF4E2" }
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
    $, $$, gsap: window.gsap, art: window.SproutArt,
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
  const PIVOTS = { ".mo-leg-l": "88 218", ".mo-leg-r": "132 218", ".mo-arm-l": "52 150", ".mo-arm-r": "180 150",
    ".mo-body": "110 150", ".mo-leaf": "112 60", ".mo-eyes": "110 132", ".mo-hand-cup": "150 118" };
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
    const swap = () => {
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
    };
    if (transition && stageChange && !toEnd) await liquidWipe(STAGES[s.stage], swap);
    else if (transition && idx >= 0) await softSwap(swap, toEnd ? -1 : 1);
    else swap();
    busy = false;
  }

  // Stage change: a wave of the next stage's colour sweeps up the screen.
  function liquidWipe(st, mid) {
    return new Promise(res => {
      const w = $("#wipe");
      w.style.setProperty("--wipe", st.bg);
      $("#wipe-label").textContent = st.name;
      $("#wipe-label").style.color = st.fg;
      ctx.sfx("whoosh"); if (st.sfx) ctx.sfx(st.sfx);
      const tl = gsap.timeline({ onComplete: res });
      tl.set(w, { display: "block", yPercent: 110 })
        .to(w, { yPercent: 0, duration: 0.55, ease: "power3.in" })
        .fromTo("#wipe-label", { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: "back.out(2)" }, "-=0.1")
        .add(mid)
        .to({}, { duration: 0.35 })
        .to("#wipe-label", { opacity: 0, y: -40, duration: 0.2 })
        .to(w, { yPercent: -115, duration: 0.55, ease: "power3.out" })
        .set(w, { display: "none" });
    });
  }
  function softSwap(mid, dir) {
    return new Promise(res => {
      const el = $("#slide");
      gsap.timeline({ onComplete: res })
        .to(el, { opacity: 0, x: -40 * dir, duration: 0.18, ease: "power1.in" })
        .add(mid)
        .fromTo(el, { opacity: 0, x: 40 * dir }, { opacity: 1, x: 0, duration: 0.25, ease: "power2.out" });
    });
  }

  function next() {
    if (busy) return;
    window.DeckAudio && DeckAudio.unlock();
    if (!started) startTimer();
    if (currentTl && currentTl.isActive()) { currentTl.progress(1); return; }
    const s = slides[idx];
    if (s.steps && stepIdx < s.steps.length - 1) { playStep(stepIdx + 1); return; }
    enter(idx + 1);
  }
  function prev() {
    if (busy) return;
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
  const go = (i) => enter(i, { transition: true });

  // ---------- order ----------
  async function refreshOrder(manual) {
    const btn = $("#btn-order"); btn && btn.classList.add("spin");
    try {
      const o = await window.SproutOrders.latest();
      const changed = JSON.stringify(o) !== JSON.stringify(ctx.order);
      ctx.order = o;
      const s = slides[idx];
      if (s && s.onOrder) s.onOrder($("#slide"), o, ctx);
      if (changed) updateUI();
      if (manual || changed) toast(o.source === "example" ? "No live order yet: showing Example Order #1" : `Order #1 loaded: ${o.name}, ${o.drinkName || ""} (${o.source})`);
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
  function updateTimer() {
    const el = $("#timer"); if (!el || !started) return;
    const s = slides[idx], used = Date.now() - (stageStart[s.stage] || Date.now()), budget = stageBudget(s.stage);
    const total = Date.now() - started;
    el.innerHTML = `<b>${fmt(total)}</b> / 20:00 <span class="sep"></span><span class="stg">${STAGES[s.stage].name} ${fmt(used)} / ${fmt(budget)}</span>`;
    el.classList.toggle("warn", used > budget * 0.9 && used <= budget);
    el.classList.toggle("over", used > budget || total > 18.5 * 60000);
  }
  function updateUI() {
    const s = slides[idx]; if (!s) return;
    $("#counter").textContent = `${idx + 1} / ${slides.length}`;
    $("#stage-name").textContent = STAGES[s.stage].name;
    $("#stage-name").style.setProperty("--dot", STAGES[s.stage].bg);
    const steps = (s.steps || []).length;
    $("#steps").innerHTML = steps > 1 ? Array.from({ length: steps }, (_, k) => `<i class="${k <= stepIdx ? "on" : ""}"></i>`).join("") : "";
    $("#notes-body").innerHTML = `<h3>${s.n}. ${s.title}</h3><p>${(s.notes || "No notes yet.").replace(/\n/g, "<br>")}</p><p class="meta">Budget ${fmt((s.budget || 0) * 1000)} · step ${stepIdx + 1} of ${steps || 1}</p>`;
    $("#btn-prev").disabled = idx === 0 && stepIdx === 0;
    $("#btn-next").disabled = idx === slides.length - 1 && stepIdx >= steps - 1;
    $("#progress").style.width = `${((idx + (steps ? (stepIdx + 1) / steps : 1)) / slides.length) * 100}%`;
    updateTimer();
    document.dispatchEvent(new CustomEvent("deck:state", { detail: state() }));
  }
  // Everything a phone remote / presenter view needs to show.
  function state() {
    const s = slides[idx] || {}, nx = slides[idx + 1];
    return {
      now: Date.now(), i: idx, total: slides.length, n: s.n, title: s.title, notes: s.notes || "",
      stage: s.stage, stageName: (STAGES[s.stage] || {}).name, stageColor: (STAGES[s.stage] || {}).bg, stageFg: (STAGES[s.stage] || {}).fg,
      step: stepIdx, steps: (s.steps || []).length, budget: s.budget || 0,
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
      SproutOrders.setManual({ name: $("#mo-name").value, fruits, base: $("#mo-base").value, addons, size, price, drinkName: CONTENT.drinkName(fruits), at: new Date().toISOString() });
      toggle("#order-panel", false); refreshOrder(true);
    };
    $("#mo-clear").onclick = () => { SproutOrders.setManual(null); toggle("#order-panel", false); refreshOrder(true); };
  }

  function bindUI() {
    $("#btn-prev").onclick = prev; $("#btn-next").onclick = next;
    $("#btn-grid").onclick = () => toggle("#grid");
    $("#btn-full").onclick = fullscreen;
    $("#btn-order").onclick = () => refreshOrder(true);
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
      if (act === "restart") { started = null; clearInterval(timerHandle); stageStart = {}; go(0); toast("Timer reset"); }
      if (act === "home") location.href = "../index.html";
      if (act === "remote" && window.DeckRemote) DeckRemote.open();
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
      else if (k === "?") toggle("#keys");
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
    ctx.order = await window.SproutOrders.latest();
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
      SproutOrders.latest().then(o => { ctx.order = o; });
    },
    next, prev, go, toast, refreshOrder, state, command,
    get index() { return idx; }
  };
})();
