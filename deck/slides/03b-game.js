/* Stage 3: HARVEST — audience game "Guess the number" (slide 10.5, sits between 10 and 11).
 * The audience scans a QR, guesses on their phones what % of the 55 students would buy;
 * click 2 drops the real answer on a number line and crowns the three closest guesses. */
(function () {
  const PRINT = new URLSearchParams(location.search).has("print");
  const LINE = { x0: 0, w: 1010 };                       // number line width inside .ng-right
  const COLORS = ["#E08A45", "#9A3E4B", "#6A9467", "#E8A597", "#9EC4C0", "#F8EBDA"];
  const answer = () => Math.round((Kit.intentTop2()) * 100);

  // Room code survives a reload (sessionStorage), so phones that already joined keep working.
  function roomCode() {
    let r = null;
    try { r = sessionStorage.getItem("sprout-game-room"); } catch {}
    if (!r) { r = SproutRelay.code(); try { sessionStorage.setItem("sprout-game-room", r); } catch {} }
    return r;
  }
  const ROOM = roomCode();
  const playURL = () => Kit.siteURL("play/index.html?room=" + ROOM);

  const guesses = new Map();       // relay client id -> { name, value, c }
  let open = true, relay = null, lastPop = 0;

  const slideEl = () => document.querySelector("#slide .ng-dots");
  const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function dotHTML(c) {
    return `<svg viewBox="0 0 40 40" width="48" height="48"><circle cx="20" cy="23" r="15" fill="${c}" stroke="#25292B" stroke-width="4"/><path d="M20 9 Q22 1 31 3 Q29 11 20 9Z" fill="#6A9467" stroke="#25292B" stroke-width="3" stroke-linejoin="round"/></svg>`;
  }
  // Stack dots that land near the same value (4-point buckets) straight up.
  function placeDot(host, g, animate) {
    const bucket = Math.floor(g.value / 4);
    host._stack = host._stack || {};
    const k = host._stack[bucket] = (host._stack[bucket] || 0) + 1;
    const d = document.createElement("div");
    d.className = "ng-dot";
    d.style.cssText = `position:absolute;left:${g.value / 100 * LINE.w - 24}px;bottom:${(k - 1) * 42}px`;
    d.innerHTML = dotHTML(g.c);
    host.appendChild(d);
    if (animate) {
      gsap.from(d, { y: -420, opacity: 0, duration: 0.55, ease: "bounce.out" });
      const now = performance.now();
      if (now - lastPop > 140) { lastPop = now; Deck.ctx.sfx("pop"); }
    }
  }
  function refreshCount() {
    const el = document.querySelector("#slide .ng-count"); if (!el) return;
    const n = guesses.size;
    el.querySelector("b").textContent = n;
    el.querySelector("span").textContent = n === 1 ? "guess" : "guesses";
    gsap.fromTo(el, { scale: 1.12 }, { scale: 1, duration: 0.3, ease: "back.out(3)" });
  }
  function onGuess(data, from) {
    if (!open || !data || typeof data.value !== "number") return;
    const v = Math.max(0, Math.min(100, Math.round(data.value)));
    if (guesses.has(from)) return;                     // one guess per phone
    const g = { name: String(data.name || "Guest").slice(0, 14), value: v, c: COLORS[guesses.size % COLORS.length] };
    guesses.set(from, g);
    const host = slideEl();
    if (host) { placeDot(host, g, true); refreshCount(); }
  }
  function ensureRelay() {
    if (relay || PRINT || !window.SproutRelay) return;
    relay = SproutRelay.open(ROOM, (type, data, msg) => { if (type === "guess") onGuess(data, msg.from); });
  }
  const send = (type, data, o) => { try { relay && relay.send(type, data, o); } catch {} };

  const css = `<style>
    .ng-l { position:absolute; left:130px; top:290px; width:540px; }
    .ng-card { background:#F8EBDA; border:6px solid #25292B; border-radius:36px; padding:26px 26px 22px; box-shadow:0 12px 0 #25292B; text-align:center; }
    .ng-card .qr { display:block; margin:0 auto; border-radius:20px; }
    .ng-url { font:700 26px var(--font-body); margin-top:14px; word-break:break-all; line-height:1.2; }
    .ng-code { font:900 66px/1 var(--font-display); letter-spacing:.12em; color:#9A3E4B; margin-top:6px; }
    .ng-right { position:absolute; left:760px; top:90px; width:1030px; height:880px; }
    .ng-count { position:absolute; right:0; top:0; text-align:right; transform-origin:100% 50%; }
    .ng-count b { font:900 150px/.9 var(--font-display); color:#9A3E4B; }
    .ng-count span { font:700 44px var(--font-body); margin-left:14px; }
    .ng-line { position:absolute; left:0; top:600px; width:1010px; height:14px; background:#25292B; border-radius:8px; }
    .ng-tick { position:absolute; top:24px; transform:translateX(-50%); font:700 30px var(--font-body); }
    .ng-tick::before { content:""; position:absolute; left:50%; top:-24px; width:6px; height:20px; margin-left:-3px; background:#25292B; }
    .ng-dots { position:absolute; left:0; top:586px; width:1010px; height:0; }
    .ng-pin { position:absolute; top:150px; width:0; height:470px; opacity:0; }
    .ng-pin .stem { position:absolute; left:-4px; top:60px; width:8px; height:380px; background:#9A3E4B; border-radius:4px; }
    .ng-pin .head { position:absolute; left:-30px; top:410px; width:0; height:0; border-left:30px solid transparent; border-right:30px solid transparent; border-top:58px solid #9A3E4B; filter:drop-shadow(0 0 0 #25292B); }
    .ng-pin .tag { position:absolute; left:50%; top:-14px; transform:translateX(-50%); white-space:nowrap; background:#9A3E4B; color:#F8EBDA; border:5px solid #25292B; border-radius:20px; padding:6px 24px 8px; font:900 64px/1 var(--font-display); }
    .ng-avg { position:absolute; top:650px; opacity:0; transform:translateX(-50%); text-align:center; }
    .ng-avg i { display:block; margin:0 auto; width:0; height:0; border-left:18px solid transparent; border-right:18px solid transparent; border-bottom:28px solid #25292B; }
    .ng-avg span { display:inline-block; margin-top:6px; background:#9EC4C0; border:5px solid #25292B; border-radius:16px; padding:4px 18px; font:700 32px var(--font-body); white-space:nowrap; }
    .ng-result { position:absolute; left:0; top:800px; width:1030px; white-space:nowrap; font:900 54px/1.05 var(--font-display); opacity:0; }
    .ng-result em { font-style:normal; color:#9A3E4B; }
    .ng-pod { position:absolute; left:130px; top:290px; width:540px; opacity:0; }
    .ng-pod h3 { font:900 44px var(--font-display); margin-bottom:14px; }
    .ng-places { border-bottom:8px solid #25292B; display:flex; align-items:flex-end; gap:12px; height:470px; }
    .ng-pl { flex:1; text-align:center; min-width:0; }
    .ng-pl .nm { font:700 28px/1.1 var(--font-body); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .ng-pl .gv { font:900 40px var(--font-display); color:#9A3E4B; margin-bottom:6px; }
    .ng-pl .blk { border:6px solid #25292B; border-bottom:0; border-radius:20px 20px 0 0; display:grid; place-items:center; font:900 72px var(--font-display); }
    .ng-big { background:#F8EBDA; border:6px solid #25292B; border-radius:36px; padding:34px; box-shadow:0 12px 0 #25292B; text-align:center; }
    .ng-big b { display:block; font:900 190px/1 var(--font-display); color:#9A3E4B; }
    .ng-big span { font:700 38px var(--font-body); }
  </style>`;

  Deck.add({
    n: 10.5, stage: "harvest", title: "Audience game", budget: 45, interactive: false,
    notes: "Game, about 45 seconds. Say: 'Before I show you the result, guess it. Scan the code, slide to what percent of the 55 students said they would buy, tap Lock in.' Let guesses land for about 20 seconds, point at the cluster. Click: guessing closes, the arrow drops on the real answer (69%), read the room average and call the three closest names. If nobody joins, skip the chatter and click straight to the answer. Then continue to slide 11.",
    html: () => {
      const ticks = [0, 25, 50, 75, 100].map(t => `<div class="ng-tick" style="left:${t / 100 * LINE.w}px">${t}%</div>`).join("");
      return `${css}
      <div class="pad" style="bottom:auto">
        <div class="s-kicker">Harvest: your turn</div>
        <h2 class="s-title ng-title" style="font-size:104px;margin:12px 0 0">Guess the number.</h2>
      </div>
      <div class="ng-l">
        <div class="ng-card">${Kit.qrSVG(playURL(), 380)}
          <div class="ng-url">${esc(playURL().replace(/^https?:\/\//, "").replace(/\?.*/, ""))}</div>
          <div class="ng-code">${ROOM}</div></div>
      </div>
      <div class="ng-pod"><h3>Closest guesses</h3><div class="ng-places"></div></div>
      <div class="ng-right">
        <div class="s-kicker ng-q" style="position:absolute;left:0;top:185px;width:600px;font:700 40px/1.15 var(--font-body);color:#25292B">What % of the ${Kit.nUsable()} students said they would buy a CUE smoothie?</div>
        <div class="ng-count"><b>0</b><span>guesses</span></div>
        <div class="ng-line">${ticks}</div>
        <div class="ng-pin"><div class="stem"></div><div class="head"></div><div class="tag">${answer()}%</div></div>
        <div class="ng-dots"></div>
        <div class="ng-avg"><i></i><span></span></div>
        <div class="ng-result"></div>
      </div>
      <div class="source">Source: results.json (top-2-box, n = ${Kit.nUsable()}); guesses come from phones in this room</div>`;
    },
    steps: [
      (el) => {
        // (re)build the dots already received, so Back from click 2 or a re-entry shows them.
        open = true; ensureRelay();
        send("state", { open: true }, { retain: true });
        const host = el.querySelector(".ng-dots"); host._stack = {};
        guesses.forEach(g => placeDot(host, g, false));
        const n = guesses.size;
        el.querySelector(".ng-count b").textContent = n;
        el.querySelector(".ng-count span").textContent = n === 1 ? "guess" : "guesses";
        return gsap.timeline()
          .from(el.querySelector(".ng-title"), { y: 40, opacity: 0, duration: 0.5, ease: "back.out(1.6)" })
          .from(el.querySelector(".ng-card"), { y: 80, opacity: 0, rotate: -3, duration: 0.6, ease: "back.out(1.6)" }, 0.15)
          .from(el.querySelectorAll(".ng-q, .ng-count, .ng-line"), { opacity: 0, y: 30, stagger: 0.1, duration: 0.4 }, 0.3);
      },
      (el) => {
        open = false;
        send("state", { open: false }, { retain: true });
        const ans = answer(), list = [...guesses.values()];
        const n = list.length, avg = n ? Math.round(list.reduce((a, g) => a + g.value, 0) / n) : null;
        const ranked = list.slice().sort((a, b) => Math.abs(a.value - ans) - Math.abs(b.value - ans)).slice(0, 3);
        send("reveal", { answer: ans, winners: ranked.map(g => g.name) });

        const x = ans / 100 * LINE.w, pin = el.querySelector(".ng-pin");
        pin.style.left = x + "px";
        const res = el.querySelector(".ng-result");
        res.innerHTML = n
          ? `Room average: <em>${avg}%</em>. Real answer: <em>${ans}%</em>.`
          : `Real answer: <em>${ans}%</em>. 7 in 10 said yes.`;
        const avgEl = el.querySelector(".ng-avg");
        if (n) { avgEl.style.left = (avg / 100 * LINE.w) + "px"; avgEl.querySelector("span").textContent = "Average " + avg + "%"; }
        else avgEl.style.display = "none";
        // Podium (or a big stat when nobody played).
        const pod = el.querySelector(".ng-pod");
        if (n) {
          const H = { 1: 270, 2: 200, 3: 140 }, CL = { 1: "#9A3E4B", 2: "#9EC4C0", 3: "#E08A45" };
          const order = [ranked[1], ranked[0], ranked[2]].map((g, i) => g && { g, r: [2, 1, 3][i] }).filter(Boolean);
          pod.querySelector(".ng-places").innerHTML = order.map(({ g, r }) =>
            `<div class="ng-pl"><div class="nm">${esc(g.name)}</div><div class="gv">${g.value}%</div><div class="blk" style="height:${H[r]}px;background:${CL[r]};${r === 1 ? "color:#F8EBDA" : ""}">${r}</div></div>`).join("");
        } else {
          pod.innerHTML = `<div class="ng-big"><b>${ans}%</b><span>of ${Kit.nUsable()} students would buy</span></div>`;
        }

        const tl = gsap.timeline();
        tl.to(el.querySelector(".ng-card"), { y: 60, opacity: 0, scale: 0.85, duration: 0.4, ease: "power2.in" })
          .set(pin, { opacity: 1, y: -700 }, 0.2)
          .to(pin, { y: 0, duration: 0.6, ease: "power2.in" }, 0.35)
          .add(() => Deck.ctx.sfx("thunk"), 0.95)
          .to(pin, { y: -14, duration: 0.12, ease: "power2.out", yoyo: true, repeat: 1 }, 0.95)
          .fromTo(el.querySelector(".ng-line"), { scaleY: 1 }, { scaleY: 2.2, duration: 0.1, yoyo: true, repeat: 1 }, 0.95)
          .to(avgEl, { opacity: 1, y: 0, duration: 0.4, ease: "back.out(2)" }, 1.3)
          .fromTo(pod, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.5)" }, 1.1)
          .to(res, { opacity: 1, duration: 0.4 }, 1.5)
          .from(res, { y: 30, duration: 0.4, ease: "power2.out" }, 1.5)
          .add(() => Deck.ctx.sfx(n ? "tada" : "pop"), 1.5);
        if (n) tl.from(pod.querySelectorAll(".blk"), { scaleY: 0, transformOrigin: "50% 100%", stagger: 0.12, duration: 0.4, ease: "back.out(1.4)" }, 1.3);
        return tl;
      }
    ]
  });
})();
