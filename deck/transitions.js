/* CUE deck transitions: bespoke stage-change motion graphics, slide push, surprise moments.
 *
 *   Transitions.stage(stageKey, mid) -> Promise   full-screen transition; mid() runs once while the screen is covered
 *   Transitions.push(mid, dir)       -> Promise   quick directional push for slides inside one stage (<= 0.35 s)
 *   Transitions.has(stageKey)        -> bool
 *   Transitions.finish()                          jump the running transition to its end (callbacks still fire)
 *   Transitions.surprise(kind?)                   "mo" | "fruit" | "glitch" (random if omitted); X key
 *   Transitions.onEnter(n)                        called by the engine when a slide opens (auto surprises)
 *
 * Everything is drawn in #fx (fixed, z-index 40, below the toolbar), clipped to a 1920x1080 box that
 * mirrors the scaled #stage, so artwork is authored in slide coordinates.
 */
(function () {
  const NS = "http://www.w3.org/2000/svg";
  const W = 1920, H = 1080, CX = 960, CY = 540;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const gsap = () => window.gsap;
  const sfx = (n) => { try { window.Deck && Deck.ctx.sfx(n); } catch (e) {} };
  const reduced = () => window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const FRUIT = ["#E8344E", "#E08A45", "#E8C26A", "#7BC043", "#E8A597", "#8E4BC0", "#6A9467"];

  let fx, box, shake, svg, label, flash, current = null, finishGuard = null;
  let activeCount = 0;

  function css(el, o) { Object.assign(el.style, o); return el; }
  function s(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  function ensure() {
    if (fx) return;
    fx = document.createElement("div"); fx.id = "fx";
    css(fx, { position: "fixed", inset: "0", zIndex: "40", pointerEvents: "none", display: "none" });
    box = css(document.createElement("div"), { position: "absolute", width: W + "px", height: H + "px", overflow: "hidden", transformOrigin: "50% 50%" });
    shake = css(document.createElement("div"), { position: "absolute", inset: "0" });
    svg = s("svg", { viewBox: `0 0 ${W} ${H}`, width: W, height: H });
    css(svg, { position: "absolute", left: "0", top: "0", overflow: "visible" });
    label = css(document.createElement("div"), {
      position: "absolute", left: "0", width: W + "px", top: CY + "px", textAlign: "center", whiteSpace: "nowrap",
      fontFamily: 'var(--font-display, "Fraunces", Georgia, serif)', fontWeight: "900", fontSize: "170px", lineHeight: "1",
      letterSpacing: "-0.02em", display: "flex", justifyContent: "center",
      filter: "drop-shadow(0 12px 0 rgba(0,0,0,.2))"
    });
    flash = css(document.createElement("div"), { position: "absolute", inset: "0", background: "#fff", opacity: "0" });
    shake.append(svg, label); box.append(shake, flash); fx.append(box);
    document.body.appendChild(fx);
  }

  // Mirror the scaled #stage so we can draw in 1920x1080 slide units.
  function syncBox() {
    const st = document.getElementById("stage"); if (!st) return;
    css(box, { left: "50%", top: st.style.top || "50%", transform: st.style.transform || "translate(-50%,-50%)", borderRadius: "6px" });
  }
  function clearFx() {
    const g = gsap();
    g.killTweensOf([svg, shake, label, flash, ...label.children]);
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    label.innerHTML = "";
    g.set([shake, svg, flash], { clearProps: "all" });
    css(flash, { position: "absolute", inset: "0", background: "#fff", opacity: "0" });
    css(svg, { position: "absolute", left: "0", top: "0", overflow: "visible" });
    css(shake, { position: "absolute", inset: "0" });
    g.set(label, { clearProps: "transform,opacity" });
  }
  function resetSlide() {
    const el = document.getElementById("slide");
    if (el) { gsap().killTweensOf(el); gsap().set(el, { clearProps: "transform,opacity,filter,x,y,rotation,scale" }); }
  }

  // ---------- kinetic stage name ----------
  function setLabel(st) {
    label.innerHTML = "";
    css(label, { color: st.fg, webkitTextStroke: `16px ${st.bg}`, paintOrder: "stroke fill" });
    [...st.name].forEach(ch => {
      const sp = document.createElement("span");
      sp.textContent = ch === " " ? " " : ch;
      css(sp, { display: "inline-block", willChange: "transform,filter" });
      label.appendChild(sp);
    });
    gsap().set(label.children, { opacity: 0 }); gsap().set(label, { yPercent: -50 });
  }
  function labelIn(tl, at, fromY) {
    const g = gsap(), sp = label.children;
    tl.fromTo(sp, { y: fromY ?? 230, skewX: -30, scaleY: 1.7, scaleX: 0.75, opacity: 0, filter: "blur(16px)" },
      { y: 0, skewX: 0, scaleY: 1, scaleX: 1, opacity: 1, filter: "blur(0px)", duration: 0.34, ease: "back.out(2.8)", stagger: 0.02 }, at);
    tl.fromTo(label, { scale: 1.3 }, { scale: 1, duration: 0.45, ease: "power4.out" }, at);
    return tl;
  }
  function labelOut(tl, at) {
    tl.to(label.children, { y: -140, skewX: 22, scaleY: 1.4, opacity: 0, filter: "blur(10px)", duration: 0.2, ease: "power2.in", stagger: 0.008 }, at);
    return tl;
  }

  // ---------- shapes ----------
  function wavePath(x0, x1, y, amp, len, phase = 0, step = 30) {
    let d = "";
    for (let x = x0; x <= x1; x += step) d += (d ? "L" : "M") + x + " " + (y + amp * Math.sin((x / len) + phase)).toFixed(1) + " ";
    return d;
  }
  function starPts(n, rOut, rIn) {
    let p = "";
    for (let i = 0; i < n * 2; i++) {
      const r = i % 2 ? rIn : rOut, a = (i / (n * 2)) * Math.PI * 2;
      p += (CX + Math.cos(a) * r).toFixed(1) + "," + (CY + Math.sin(a) * r).toFixed(1) + " ";
    }
    return p;
  }
  function fruitShape(parent, kind, col, r) {
    const g = s("g", {}, parent);
    if (kind === 0) {            // round fruit with highlight and tiny leaf
      s("circle", { r, fill: col }, g);
      s("circle", { cx: -r * .3, cy: -r * .3, r: r * .28, fill: "#fff", opacity: .35 }, g);
      s("path", { d: `M0 ${-r} q ${r * .1} ${-r * .35} ${r * .42} ${-r * .38} q ${-r * .1} ${r * .3} ${-r * .42} ${r * .38}z`, fill: "#6A9467" }, g);
    } else if (kind === 1) {     // leaf
      s("path", { d: `M0 ${-r} C${r * .9} ${-r * .6} ${r * .9} ${r * .6} 0 ${r} C${-r * .9} ${r * .6} ${-r * .9} ${-r * .6} 0 ${-r}Z`, fill: "#3FAE4F" }, g);
      s("path", { d: `M0 ${-r * .9} L0 ${r * .9}`, stroke: "#1E7A34", "stroke-width": r * .08, fill: "none", "stroke-linecap": "round" }, g);
    } else {                     // half slice
      s("path", { d: `M${-r} 0 A${r} ${r} 0 0 0 ${r} 0Z`, fill: col }, g);
      s("path", { d: `M${-r * .8} 0 A${r * .8} ${r * .8} 0 0 0 ${r * .8} 0Z`, fill: "#F2D9C2", opacity: .9 }, g);
      s("path", { d: `M${-r * .6} 0 A${r * .6} ${r * .6} 0 0 0 ${r * .6} 0Z`, fill: col, opacity: .75 }, g);
    }
    return g;
  }

  // ---------- stage builders: (tl, st, mid, api) -> adds tweens, calls mid at the covered moment ----------
  const B = {};

  B.water = (tl, st, mid) => {
    const g = gsap();
    const hole = s("defs", {}, svg);
    const mk = s("mask", { id: "fxm" }, hole);
    s("rect", { x: -200, y: -200, width: W + 400, height: H + 400, fill: "#fff" }, mk);
    const cut = s("circle", { cx: CX, cy: CY, r: 0, fill: "#000" }, mk);
    const flood = s("g", { mask: "url(#fxm)" }, svg);
    const fc = s("circle", { cx: CX, cy: CY, r: 0, fill: st.bg }, flood);
    const rings = [0, 1, 2, 3].map(i => s("circle", { cx: CX, cy: CY, r: 10, fill: "none", stroke: i % 2 ? st.bg : "#fff", "stroke-width": 34 - i * 6, opacity: 0 }, svg));
    const dots = Array.from({ length: 26 }, (_, i) => s("circle", { cx: CX, cy: CY, r: rnd(10, 30), fill: i % 2 ? "#fff" : st.bg }, svg));
    const edge = s("circle", { cx: CX, cy: CY, r: 0, fill: "none", stroke: "#fff", "stroke-width": 26, opacity: 0 }, svg);
    tl.call(() => { sfx("whoosh"); sfx("splash"); }, null, 0);
    tl.to(fc, { attr: { r: 1300 }, duration: 0.6, ease: "power2.in" }, 0.04);
    rings.forEach((r, i) => tl.fromTo(r, { attr: { r: 10 }, opacity: 0.95 }, { attr: { r: 1250 }, opacity: 0, duration: 0.7, ease: "power2.out" }, i * 0.08));
    dots.forEach((d, i) => {
      const a = (i / dots.length) * Math.PI * 2 + rnd(-0.1, 0.1), dist = rnd(300, 900), up = rnd(120, 360);
      tl.to(d, { x: Math.cos(a) * dist, y: Math.sin(a) * dist * 0.7 - up, duration: 0.32, ease: "power2.out" }, 0.02)
        .to(d, { y: "+=" + (up + 260), opacity: 0, duration: 0.3, ease: "power1.in" }, 0.34);
    });
    labelIn(tl, 0.42);
    tl.call(mid, null, 0.64);
    labelOut(tl, 1.02);
    tl.set(edge, { opacity: 0.9 }, 1.0)
      .to(cut, { attr: { r: 1400 }, duration: 0.55, ease: "power2.in" }, 1.0)
      .to(edge, { attr: { r: 1400 }, opacity: 0, duration: 0.55, ease: "power2.in" }, 1.0);
    sfxAt(tl, "drop", 1.0);
  };

  B.harvest = (tl, st, mid) => {
    const bg = s("rect", { x: -100, y: -100, width: W + 200, height: H + 200, fill: st.bg, opacity: 0 }, svg);
    const COLS = 11, ROWS = 7, items = [];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const x = (c / (COLS - 1)) * (W + 60) - 30 + (r % 2 ? 40 : -20) + rnd(-18, 18), y = H - 30 - r * 150 + rnd(-12, 12);
      const rad = rnd(95, 125), kind = Math.random() < 0.18 ? 1 : Math.random() < 0.15 ? 2 : 0;
      const f = fruitShape(svg, kind, pick(FRUIT), rad);
      items.push({ f, x, y, r, rot: rnd(-60, 60) });
    }
    items.sort((a, b) => a.r - b.r);
    const gg = gsap();
    items.forEach(it => gg.set(it.f, { x: it.x, y: -260, rotation: it.rot - 120 }));
    tl.call(() => sfx("whoosh"), null, 0);
    tl.to(bg, { opacity: 1, duration: 0.3, ease: "power1.in" }, 0.4);
    items.forEach(it => {
      const d = it.r * 0.06 + rnd(0, 0.06);
      tl.to(it.f, { y: it.y, rotation: it.rot, duration: 0.38, ease: "power2.in" }, d);
    });
    tl.call(() => sfx("thunk"), null, 0.34).call(() => sfx("splat"), null, 0.6);
    labelIn(tl, 0.55, -230);
    tl.call(mid, null, 0.8);
    labelOut(tl, 0.92);
    tl.call(() => sfx("whoosh"), null, 0.9);
    items.forEach(it => tl.to(it.f, { y: H + 450, rotation: it.rot + rnd(-90, 90), duration: 0.42, ease: "power2.in" }, 0.92 + rnd(0, 0.1) + (ROWS - 1 - it.r) * 0.01));
    tl.to(bg, { y: H + 300, duration: 0.42, ease: "power2.in" }, 0.98);
  };

  B.blend = (tl, st, mid) => {
    const sl = document.getElementById("slide"), g = gsap();
    const vx = s("g", {}, svg);
    s("circle", { cx: CX, cy: CY, r: 1700, fill: st.bg }, vx);
    const cols = [st.bg, "#E8C26A", "#9A3E4B", "#F2D9C2", "#6A9467", "#E8A597", "#9EC4C0", "#D9743A"];
    const N = 8, twist = 2.6;
    for (let k = 0; k < N; k++) {
      const t0 = (k / N) * Math.PI * 2, t1 = ((k + 0.5) / N) * Math.PI * 2;
      let d = "", back = [];
      for (let r = 0; r <= 1700; r += 85) {
        const a0 = t0 + (r / 1700) * twist * Math.PI, a1 = t1 + (r / 1700) * twist * Math.PI;
        d += (d ? "L" : "M") + (CX + Math.cos(a0) * r).toFixed(1) + " " + (CY + Math.sin(a0) * r).toFixed(1) + " ";
        back.push("L" + (CX + Math.cos(a1) * r).toFixed(1) + " " + (CY + Math.sin(a1) * r).toFixed(1) + " ");
      }
      s("path", { d: d + back.reverse().join("") + "Z", fill: cols[k % cols.length], opacity: k % 2 ? 1 : 0.95 }, vx);
    }
    s("circle", { cx: CX, cy: CY, r: 90, fill: "#F2D9C2", opacity: 0.9 }, vx);
    const O = `${CX} ${CY}`;
    g.set(vx, { scale: 0, rotation: 0, svgOrigin: O });
    g.set(sl, { transformOrigin: "50% 50%" });
    tl.call(() => { sfx("whoosh"); sfx("blender"); }, null, 0);
    tl.to(sl, { rotation: 380, scale: 0.06, duration: 0.5, ease: "power3.in" }, 0)
      .to(vx, { scale: 1.15, rotation: 300, svgOrigin: O, duration: 0.5, ease: "power2.in" }, 0);
    labelIn(tl, 0.42);
    tl.call(mid, null, 0.52);
    tl.set(sl, { rotation: -380, scale: 0.06 }, 0.53);
    labelOut(tl, 0.92);
    tl.to(vx, { scale: 0, rotation: -240, svgOrigin: O, duration: 0.55, ease: "power2.inOut" }, 0.82)
      .to(sl, { rotation: 0, scale: 1, duration: 0.6, ease: "power3.out" }, 0.8);
  };

  B.pour = (tl, st, mid) => {
    const g = gsap(), body = s("g", {}, svg);
    const top = wavePath(-120, W + 120, 0, 26, 70, 0, 30);
    let bot = "";
    for (let x = W + 120; x >= -120; x -= 30) bot += "L" + x + " " + (1700 + 34 * Math.sin(x / 80)).toFixed(1) + " ";
    s("path", { d: top + bot + "Z", fill: st.bg }, body);
    for (let x = 90, i = 0; x < W; x += rnd(170, 260), i++) {
      const len = rnd(110, 300), w = rnd(70, 120);
      s("rect", { x: x - w / 2, y: 1690, width: w, height: len, rx: w / 2, fill: st.bg }, body);
      s("circle", { cx: x, cy: 1690 + len, r: w * 0.62, fill: st.bg }, body);
    }
    s("path", { d: `M180 20 L180 1650 M420 20 L420 1500`, stroke: "#fff", "stroke-width": 26, opacity: 0.16, "stroke-linecap": "round" }, body);
    s("path", { d: top, fill: "none", stroke: "#FFB3C6", "stroke-width": 10, opacity: 0.6 }, body);
    g.set(body, { y: -2000 });
    tl.call(() => { sfx("whoosh"); sfx("pour"); }, null, 0);
    tl.to(body, { y: -480, duration: 0.64, ease: "power2.in" }, 0);
    tl.to(body, { x: 70, duration: 0.7, ease: "sine.inOut", yoyo: true, repeat: 1 }, 0);
    labelIn(tl, 0.46, -230);
    tl.call(mid, null, 0.66);
    labelOut(tl, 1.0);
    tl.to(body, { y: 1230, duration: 0.55, ease: "power2.in" }, 0.98);
    sfxAt(tl, "drop", 1.02);
  };

  B.serve = (tl, st, mid) => {
    const g = gsap();
    const halfT = s("rect", { x: -200, y: -200, width: W + 400, height: CY + 200, fill: st.bg }, svg);
    const halfB = s("rect", { x: -200, y: CY, width: W + 400, height: CY + 200, fill: st.bg }, svg);
    g.set([halfT, halfB], { opacity: 0 });
    const lines = [s("g", {}, svg), s("g", {}, svg)];
    for (let i = 0; i < 64; i++) {
      const a = (i / 64) * 360 + rnd(-3, 3), w = rnd(6, 26), r0 = rnd(250, 420), r1 = rnd(1250, 1700);
      s("path", { d: `M${r0} ${-w} L${r1} 0 L${r0} ${w}Z`, fill: i % 3 ? st.fg : st.accent, transform: `translate(${CX} ${CY}) rotate(${a})` }, lines[i % 2]);
    }
    g.set(lines, { opacity: 0 });
    const ring = s("circle", { cx: CX, cy: CY, r: 10, fill: "none", stroke: "#fff", "stroke-width": 40, opacity: 0 }, svg);
    const cup = s("g", {}, svg), cupIn = s("g", { transform: `translate(${CX} ${CY})` }, cup);
    s("path", { d: "M-150 -190 L150 -190 L112 200 Q110 220 90 220 L-90 220 Q-110 220 -112 200Z", fill: "#F8EBDA", stroke: "#25292B", "stroke-width": 12, "stroke-linejoin": "round" }, cupIn);
    s("path", { d: "M-136 -60 L136 -60 L124 70 L-124 70Z", fill: st.accent }, cupIn);
    s("rect", { x: -165, y: -235, width: 330, height: 52, rx: 20, fill: "#F8EBDA", stroke: "#25292B", "stroke-width": 12 }, cupIn);
    s("path", { d: "M30 -235 L80 -430", stroke: "#9A3E4B", "stroke-width": 26, "stroke-linecap": "round" }, cupIn);
    s("circle", { cx: 0, cy: 10, r: 30, fill: "#25292B", opacity: 0.85 }, cupIn);
    const OC = `${CX} ${CY}`;
    g.set(cup, { y: -1100, scale: 1.5, rotation: 8, svgOrigin: OC });
    const shake = (amp) => {
      g.fromTo(document.getElementById("fx").firstChild.firstChild, { x: 0, y: 0 }, { keyframes: [{ x: amp, y: -amp * .7 }, { x: -amp, y: amp * .6 }, { x: amp * .6, y: amp * .4 }, { x: -amp * .4, y: -amp * .3 }, { x: 0, y: 0 }], duration: 0.34, ease: "none" });
      const sl = document.getElementById("slide");
      g.fromTo(sl, { x: 0, y: 0 }, { keyframes: [{ x: -amp, y: amp }, { x: amp * .6, y: -amp * .6 }, { x: 0, y: 0 }], duration: 0.3, ease: "none" });
    };
    tl.call(() => sfx("whoosh"), null, 0);
    tl.to(cup, { y: -40, rotation: 0, svgOrigin: OC, duration: 0.34, ease: "power4.in" }, 0);
    tl.set([halfT, halfB], { opacity: 1 }, 0.34).set(flash, { opacity: 0.85 }, 0.34).to(flash, { opacity: 0, duration: 0.18 }, 0.36);
    tl.call(() => { sfx("thunk"); shake(26); }, null, 0.34);
    tl.set(lines, { opacity: 1 }, 0.34);
    lines.forEach((l, i) => tl.fromTo(l, { scale: 0.45, svgOrigin: `${CX} ${CY}` }, { scale: 1.25 + i * 0.12, svgOrigin: `${CX} ${CY}`, duration: 0.6, ease: "power3.out" }, 0.34)
      .to(l, { opacity: 0, duration: 0.3, ease: "power1.in" }, 0.58 + i * 0.08));
    tl.fromTo(ring, { attr: { r: 20 }, opacity: 1 }, { attr: { r: 900 }, opacity: 0, duration: 0.5, ease: "power2.out" }, 0.34);
    tl.fromTo(cup, { scaleX: 1.5, scaleY: 1.5, svgOrigin: OC }, { scaleX: 1.9, scaleY: 1.1, svgOrigin: OC, duration: 0.07, ease: "power2.out", yoyo: true, repeat: 1 }, 0.34);
    labelIn(tl, 0.42, 160);
    tl.call(mid, null, 0.44);
    tl.to(cup, { opacity: 0, scale: 0.4, svgOrigin: OC, duration: 0.18, ease: "power2.in" }, 0.62);
    labelOut(tl, 0.98);
    tl.call(() => sfx("whoosh"), null, 0.98);
    tl.to(halfT, { y: -CY - 220, duration: 0.42, ease: "power3.in" }, 1.0)
      .to(halfB, { y: CY + 220, duration: 0.42, ease: "power3.in" }, 1.0);
  };

  B.cheers = (tl, st, mid) => {
    const g = gsap();
    const defs = s("defs", {}, svg), mk = s("mask", { id: "fxs" }, defs);
    s("rect", { x: -300, y: -300, width: W + 600, height: H + 600, fill: "#fff" }, mk);
    const cut = s("polygon", { points: starPts(18, 1900, 1150), fill: "#000" }, mk);
    const grp = s("g", { mask: "url(#fxs)" }, svg);
    const star2 = s("polygon", { points: starPts(18, 1900, 1180), fill: st.accent }, grp);
    const star = s("polygon", { points: starPts(18, 1900, 1150), fill: st.bg }, grp);
    g.set([star, star2], { svgOrigin: `${CX} ${CY}`, scale: 0 });
    g.set(cut, { svgOrigin: `${CX} ${CY}`, scale: 0 });
    const cols = [...FRUIT, "#F2D9C2", "#fff"];
    const bits = [];
    for (let i = 0; i < 150; i++) {
      const left = i % 2 === 0, w = rnd(24, 48), h = rnd(14, 30);
      const p = s(Math.random() < 0.3 ? "circle" : "rect", Math.random() < 0.3 ? { r: w / 2, fill: pick(cols) } : { x: -w / 2, y: -h / 2, width: w, height: h, fill: pick(cols), rx: 2 }, svg);
      const ang = (left ? rnd(-80, -48) : rnd(-132, -100)) * Math.PI / 180, sp = rnd(700, 1500);
      const x0 = left ? 20 : W - 20, y0 = H - 10;
      g.set(p, { x: x0, y: y0, opacity: 0 });
      bits.push({ p, x1: x0 + Math.cos(ang) * sp, y1: y0 + Math.sin(ang) * sp });
    }
    const pops = [0, 1].map(i => s("circle", { cx: i ? W : 0, cy: H, r: 10, fill: "#fff", opacity: 0 }, svg));
    tl.call(() => { sfx("confetti"); }, null, 0.02);
    pops.forEach(p => tl.fromTo(p, { attr: { r: 20 }, opacity: 1 }, { attr: { r: 260 }, opacity: 0, duration: 0.3, ease: "power2.out" }, 0));
    bits.forEach(b => {
      const dly = rnd(0, 0.08), t = rnd(0.5, 0.75);
      tl.set(b.p, { opacity: 1 }, dly)
        .to(b.p, { x: b.x1, duration: t, ease: "power1.out" }, dly)
        .to(b.p, { y: b.y1, duration: t * 0.55, ease: "power2.out" }, dly)
        .to(b.p, { y: "+=" + rnd(500, 1000), duration: 1.1, ease: "power1.in" }, dly + t * 0.55)
        .to(b.p, { rotation: rnd(-720, 720), duration: 1.4, ease: "none" }, dly);
    });
    tl.to(star2, { scale: 1, rotation: 90, duration: 0.6, ease: "power3.in" }, 0.08)
      .to(star, { scale: 1, rotation: 80, duration: 0.6, ease: "power3.in" }, 0.12);
    tl.call(() => sfx("sparkle"), null, 0.5);
    labelIn(tl, 0.46);
    tl.call(() => sfx("tada"), null, 0.55);
    tl.call(mid, null, 0.72);
    labelOut(tl, 1.05);
    tl.to(cut, { scale: 1, rotation: -90, duration: 0.5, ease: "power2.in" }, 1.05);
    tl.to(bits.map(b => b.p), { opacity: 0, duration: 0.3 }, 1.25);
  };

  B.plant = (tl, st, mid) => {
    const g = gsap(), soil = s("g", {}, svg);
    const top = wavePath(-60, W + 60, 0, 34, 85, 0, 30);
    s("path", { d: top + `L${W + 60} 1700 L-60 1700Z`, fill: st.bg }, soil);
    s("path", { d: top, fill: "none", stroke: "#5E4A3A", "stroke-width": 14 }, soil);
    for (let i = 0; i < 46; i++) s("circle", { cx: rnd(0, W), cy: rnd(80, 1500), r: rnd(5, 22), fill: pick(["#5A3A22", "#2A190D", "#6E5A46"]), opacity: 0.8 }, soil);
    for (let i = 0; i < 9; i++) s("ellipse", { cx: rnd(60, W - 60), cy: rnd(120, 900), rx: rnd(24, 50), ry: rnd(10, 18), fill: "#2A190D", opacity: 0.4 }, soil);
    g.set(soil, { y: 1250 });
    const sp = s("g", {}, svg);
    s("ellipse", { cx: 0, cy: 6, rx: 120, ry: 26, fill: "#5E4A3A" }, sp);
    s("ellipse", { cx: 0, cy: 2, rx: 84, ry: 16, fill: "#6E5A46" }, sp);
    s("path", { d: "M0 0 C0 -50 -6 -100 6 -150", stroke: "#25292B", "stroke-width": 26, fill: "none", "stroke-linecap": "round" }, sp);
    s("path", { d: "M0 0 C0 -50 -6 -100 6 -150", stroke: "#4CC46A", "stroke-width": 14, fill: "none", "stroke-linecap": "round" }, sp);
    s("path", { d: "M6 -150 C-20 -230 -120 -230 -150 -170 C-110 -120 -30 -120 6 -150Z", fill: "#6A9467", stroke: "#25292B", "stroke-width": 8, "stroke-linejoin": "round" }, sp);
    s("path", { d: "M6 -150 C30 -240 130 -250 165 -190 C130 -125 40 -115 6 -150Z", fill: "#6FD98A", stroke: "#25292B", "stroke-width": 8, "stroke-linejoin": "round" }, sp);
    g.set(sp, { x: CX, y: 395, scale: 0, svgOrigin: `${CX} 395` });
    tl.call(() => sfx("whoosh"), null, 0);
    tl.to(soil, { y: -280, duration: 0.6, ease: "power3.out" }, 0);
    tl.fromTo(sp, { scale: 0 }, { scale: 1, svgOrigin: `${CX} 395`, duration: 0.45, ease: "back.out(3.5)" }, 0.46);
    tl.call(() => sfx("seed"), null, 0.5);
    tl.fromTo(sp, { rotation: -6 }, { rotation: 6, svgOrigin: `${CX} 395`, duration: 0.22, ease: "sine.inOut", yoyo: true, repeat: 1 }, 0.9);
    labelIn(tl, 0.55, 220);
    tl.call(mid, null, 0.66);
    labelOut(tl, 1.0);
    tl.to(sp, { scale: 0, svgOrigin: `${CX} 395`, duration: 0.2, ease: "back.in(3)" }, 1.0);
    tl.to(soil, { y: 1350, duration: 0.5, ease: "power3.in" }, 1.02);
  };

  function sfxAt(tl, name, t) { tl.call(() => sfx(name), null, t); }

  // ---------- running ----------
  function start(build, st, mid, dur) {
    ensure(); syncBox();
    finishNow();
    clearFx(); resetSlide();
    const g = gsap();
    fx.style.display = "block";
    activeCount++;
    return new Promise(resolve => {
      let doneFlag = false, midDone = false;
      const doMid = () => { if (midDone) return; midDone = true; try { mid && mid(); } catch (e) { console.error(e); } };
      const done = () => {
        if (doneFlag) return; doneFlag = true;
        clearTimeout(finishGuard);
        doMid();
        clearFx(); resetSlide();
        fx.style.display = "none";
        current = null; activeCount = Math.max(0, activeCount - 1);
        resolve();
      };
      const tl = g.timeline({ onComplete: done });
      current = tl;
      tl._done = done;
      try { build(tl, st, doMid); } catch (e) { console.error("transition build failed", e); done(); return; }
      if (dur && tl.duration() > dur) tl.timeScale(tl.duration() / dur);
      const guard = () => { if (doneFlag) return; if (tl.paused()) { finishGuard = setTimeout(guard, 3500); return; } try { tl.progress(1, false); } catch (e) {} done(); };
      finishGuard = setTimeout(guard, 3500);
    });
  }
  function finishNow() {
    if (!current) return;
    const tl = current;
    try { tl.progress(1, false); } catch (e) {}
    if (current === tl && tl._done) tl._done();
  }

  const T = {
    has: (k) => !!B[k],
    stage(key, mid) {
      const st = (window.Deck && Deck.STAGES[key]) || {};
      if (!B[key]) { mid(); return Promise.resolve(); }
      ensure();
      return start((tl, st2, doMid) => { setLabel(st); B[key](tl, st, doMid); }, st, mid, 1.6);
    },
    push(mid, dir = 1) {
      const g = gsap(), sl = document.getElementById("slide");
      ensure();
      const stg = window.Deck && Deck.STAGES[(sl.className.split("stage-")[1] || "").split(" ")[0]] || {};
      return new Promise(resolve => {
        let midDone = false;
        const doMid = () => { if (midDone) return; midDone = true; try { mid(); } catch (e) { console.error(e); } };
        syncBox(); clearFx(); fx.style.display = "block"; activeCount++;
        const col = (stg && stg.accent) || "#fff";
        css(flash, { background: col });
        const done = () => {
          doMid(); g.set(sl, { clearProps: "transform,opacity,filter" });
          css(flash, { background: "#fff", opacity: "0" }); fx.style.display = "none";
          current = null; activeCount = Math.max(0, activeCount - 1); resolve();
        };
        const tl = g.timeline({ onComplete: done }); current = tl; tl._done = done;
        g.set(sl, { transformOrigin: "50% 50%" });
        tl.to(sl, { x: -150 * dir, scale: 0.94, opacity: 0.2, duration: 0.12, ease: "power2.in" })
          .set(flash, { opacity: 0.3 })
          .call(doMid)
          .to(flash, { opacity: 0, duration: 0.07, ease: "none" })
          .fromTo(sl, { x: 190 * dir, scale: 1.05, opacity: 0.4 }, { x: 0, scale: 1, opacity: 1, duration: 0.2, ease: "power3.out" }, "<");
      });
    },
    finish: finishNow,
    _cur: () => current,
    get active() { return activeCount > 0; }
  };

  // ---------- surprises ----------
  const surprises = {
    mo() {
      const g = gsap(); if (!window.SproutArt) return Promise.resolve();
      const edges = ["bottom", "left", "right", "top"], e = pick(edges), sz = 420;
      const wrap = css(document.createElement("div"), { position: "absolute", width: sz * 220 / 280 + "px", height: sz + "px", transformOrigin: "50% 50%" });
      wrap.innerHTML = SproutArt.mascot();
      const sv = wrap.firstElementChild; css(sv, { width: "100%", height: "100%", overflow: "visible" });
      box.appendChild(wrap);
      const w = sz * 220 / 280, h = sz, off = 40;
      const eyes = wrap.querySelector(".mo-eyes");
      if (eyes) {
        s("ellipse", { cx: 86, cy: 131, rx: 21, ry: 25, fill: "#FFA21F", class: "wink-cover", opacity: 0 }, eyes);
        s("path", { d: "M68 133 Q86 147 104 133", stroke: "#25292B", "stroke-width": 6, "stroke-linecap": "round", fill: "none", class: "wink-cover", opacity: 0 }, eyes);
      }
      const wink = wrap.querySelectorAll(".wink-cover");
      const pos = {
        bottom: { x: rnd(300, W - 300 - w), y: H + 20, rot: 0, to: { y: H - h * 0.62 } },
        top: { x: rnd(300, W - 300 - w), y: -h - 20, rot: 180, to: { y: -h * 0.38 } },
        left: { x: -h / 2 - 20 - w / 2, y: rnd(150, H - 150 - h), rot: 90, to: { x: 0.12 * h - w / 2 } },
        right: { x: W + h / 2 + 20 - w / 2, y: rnd(150, H - 150 - h), rot: -90, to: { x: W - 0.12 * h - w / 2 } }
      }[e];
      g.set(wrap, { x: pos.x, y: pos.y, rotation: pos.rot });
      const back = Object.fromEntries(Object.keys(pos.to).map(k => [k, k === "x" ? pos.x : pos.y]));
      fx.style.display = "block"; syncBox(); activeCount++;
      return new Promise(res => {
        const tl = g.timeline({ onComplete: () => { wrap.remove(); activeCount = Math.max(0, activeCount - 1); if (!current) fx.style.display = "none"; res(); } });
        tl.call(() => sfx("boing"), null, 0.05)
          .to(wrap, Object.assign({ duration: 0.5, ease: "back.out(2.6)" }, pos.to), 0)
          .to(wrap, { rotation: pos.rot + 5, duration: 0.12, yoyo: true, repeat: 3, ease: "sine.inOut" }, 0.55)
          .set(wink, { opacity: 1 }, 0.75).set(wink, { opacity: 0 }, 1.05)
          .call(() => sfx("pop"), null, 0.75)
          .to(wrap, Object.assign({ duration: 0.38, ease: "back.in(2)" }, back), 1.25);
      });
    },
    fruit() {
      const g = gsap();
      const sz = 380, col = pick(FRUIT), kind = 0;
      const sv = s("svg", { viewBox: "-200 -200 400 400", width: sz, height: sz }); css(sv, { position: "absolute", overflow: "visible" });
            const inner = s("g", {}, sv);
      const fg = fruitShape(inner, 0, col, 170); fg.firstChild.setAttribute("stroke", "#25292B"); fg.firstChild.setAttribute("stroke-width", 12);
      s("circle", { cx: 60, cy: 20, r: 12, fill: "#000", opacity: 0 }, inner);
      box.appendChild(sv);
      fx.style.display = "block"; syncBox(); activeCount++;
      const floor = H - sz - 20, dirR = Math.random() < 0.5, x0 = dirR ? -sz - 40 : W + 40, x1 = dirR ? W + 40 : -sz - 40;
      g.set(sv, { x: x0, y: -sz, rotation: 0 });
      return new Promise(res => {
        const tl = g.timeline({ onComplete: () => { sv.remove(); activeCount = Math.max(0, activeCount - 1); if (!current) fx.style.display = "none"; res(); } });
        tl.to(sv, { x: x1, rotation: dirR ? 900 : -900, duration: 2.4, ease: "none" }, 0);
        let t = 0, hgt = floor;
        [0.55, 0.5, 0.42, 0.36].forEach((d, i) => {
          const ph = [floor, floor - 340 * (1 - i * 0.2)];
          tl.fromTo(sv, { y: i ? ph[1] : -sz }, { y: floor, duration: d, ease: "power2.in" }, t);
          tl.call(() => sfx(i ? "boing" : "pop"), null, t + d);
          tl.to(inner, { scaleY: 0.7, scaleX: 1.2, svgOrigin: "0 170", duration: 0.07, yoyo: true, repeat: 1 }, t + d - 0.02);
          t += d;
          if (i < 3) { tl.to(sv, { y: floor - 360 + i * 80, duration: 0.42 - i * 0.04, ease: "power2.out" }, t); t += 0.42 - i * 0.04; }
        });
        tl.to(sv, { y: floor, duration: 0.3, ease: "power2.in" }, t);
      });
    },
    glitch() {
      const g = gsap(), sl = document.getElementById("slide"); if (!sl) return Promise.resolve();
      let defs = document.getElementById("fx-glitch-svg");
      if (!defs) {
        const d = document.createElement("div");
        d.innerHTML = `<svg id="fx-glitch-svg" width="0" height="0" style="position:absolute"><filter id="fx-glitch" x="-6%" y="-6%" width="112%" height="112%" color-interpolation-filters="sRGB">
          <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r"/><feOffset in="r" dx="0" dy="0" id="fx-g-r" result="ro"/>
          <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g"/>
          <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b"/><feOffset in="b" dx="0" dy="0" id="fx-g-b" result="bo"/>
          <feBlend in="ro" in2="g" mode="screen" result="rg"/><feBlend in="rg" in2="bo" mode="screen"/></filter></svg>`;
        document.body.appendChild(d.firstElementChild);
      }
      const fr = document.getElementById("fx-g-r"), fb = document.getElementById("fx-g-b");
      ensure(); syncBox(); clearFx(); fx.style.display = "block"; activeCount++;
      sfx("scratch");
      sl.style.filter = "url(#fx-glitch)";
      const bars = Array.from({ length: 7 }, () => s("rect", { x: 0, y: 0, width: W, height: 10, fill: pick(["#00F0FF", "#FF2E93", "#fff", "#FFE600"]), opacity: 0 }, svg));
      return new Promise(res => {
        const o = { t: 0 };
        const end = () => {
          sl.style.filter = ""; g.set(sl, { clearProps: "transform,x,y,skewX" });
          while (svg.firstChild) svg.removeChild(svg.firstChild);
          activeCount = Math.max(0, activeCount - 1); if (!current) fx.style.display = "none"; res();
        };
        g.to(o, {
          t: 1, duration: 0.42, ease: "none", onComplete: end, onUpdate() {
            const k = 1 - o.t, a = (Math.random() < 0.5 ? -1 : 1) * rnd(8, 34) * (0.4 + k);
            fr.setAttribute("dx", a); fb.setAttribute("dx", -a * 0.9); fr.setAttribute("dy", rnd(-5, 5));
            g.set(sl, { x: rnd(-18, 18) * k, y: rnd(-6, 6) * k, skewX: rnd(-3, 3) * k });
            bars.forEach(b => { const on = Math.random() < 0.45; b.setAttribute("opacity", on ? 0.75 : 0); b.setAttribute("y", rnd(0, H)); b.setAttribute("height", rnd(6, 70)); b.setAttribute("x", rnd(-60, 60)); });
          }
        });
      });
    }
  };
  let lastKind = null;
  T.surprise = function (kind) {
    if (reduced() || document.body.classList.contains("print")) return Promise.resolve();
    if (activeCount > 0) return Promise.resolve();
    const k = surprises[kind] ? kind : pick(Object.keys(surprises).filter(x => x !== lastKind));
    lastKind = k;
    try { return surprises[k](); } catch (e) { console.error(e); return Promise.resolve(); }
  };

  // First time slide 6 (competition) and 10 (what matters) open, surprise 2.5 s later.
  const AUTO = { 6: true, 10: true }, seen = {};
  T.onEnter = function (n) {
    if (!AUTO[n] || seen[n]) return;
    seen[n] = true;
    setTimeout(() => { if (window.Deck && Deck.state().n === n) T.surprise(); }, 2500);
  };

  window.Transitions = T;
})();
