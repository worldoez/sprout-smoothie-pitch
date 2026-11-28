/* CUE deck transitions (printed-label edition): calm stage change, quiet slide push, surprise moments.
 *
 *   Transitions.stage(stageKey, mid) -> Promise   350 ms hairline wipe + cross-fade; mid() swaps the slide
 *   Transitions.push(mid, dir)       -> Promise   quick quiet push for slides inside one stage (<= 0.35 s)
 *   Transitions.has(stageKey)        -> bool
 *   Transitions.finish()                          jump the running transition to its end (callbacks still fire)
 *   Transitions.surprise(kind?)                   "mo" | "fruit" | "glitch" (random if omitted); X key
 *   Transitions.onEnter(n)                        called by the engine when a slide opens (auto surprises)
 *
 * Everything is drawn in #fx (fixed, z-index 40, below the toolbar), clipped to a 1920x1080 box that
 * mirrors the scaled #stage, so artwork is authored in slide coordinates.
 * Motion rule: one calm idea, <= 0.4 s, power2 easings — no splashes, waves, confetti or bounce.
 */
(function () {
  const NS = "http://www.w3.org/2000/svg";
  const W = 1920, H = 1080, CX = 960, CY = 540;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const gsap = () => window.gsap;
  const sfx = (n) => { try { window.Deck && Deck.ctx.sfx(n); } catch (e) {} };
  const reduced = () => window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const FRUIT = ["#E3B23C", "#B5506A", "#9BB36A", "#6B3F7A", "#D99A5B", "#8E4B4F", "#7F8F6A"];

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
      fontFamily: 'var(--font-display, "Fraunces", Georgia, serif)', fontWeight: "800", fontSize: "170px", lineHeight: "1",
      letterSpacing: "-0.02em", display: "flex", justifyContent: "center"
    });
    flash = css(document.createElement("div"), { position: "absolute", inset: "0", background: "#fff", opacity: "0" });
    shake.append(svg, label); box.append(shake, flash); fx.append(box);
    document.body.appendChild(fx);
  }

  // Mirror the scaled #stage so we can draw in 1920x1080 slide units.
  function syncBox() {
    const st = document.getElementById("stage"); if (!st) return;
    css(box, { left: "50%", top: st.style.top || "50%", transform: st.style.transform || "translate(-50%,-50%)", borderRadius: "8px" });
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

  // ---------- shapes (kept for the surprise moments) ----------
  function fruitShape(parent, kind, col, r) {
    const g = s("g", {}, parent);
    if (kind === 0) {            // round fruit with highlight and tiny leaf
      s("circle", { r, fill: col }, g);
      s("circle", { cx: -r * .3, cy: -r * .3, r: r * .28, fill: "#F8EBDA", opacity: .3 }, g);
      s("path", { d: `M0 ${-r} q ${r * .1} ${-r * .35} ${r * .42} ${-r * .38} q ${-r * .1} ${r * .3} ${-r * .42} ${r * .38}z`, fill: "#7F8F6A" }, g);
    } else if (kind === 1) {     // leaf
      s("path", { d: `M0 ${-r} C${r * .9} ${-r * .6} ${r * .9} ${r * .6} 0 ${r} C${-r * .9} ${r * .6} ${-r * .9} ${-r * .6} 0 ${-r}Z`, fill: "#7F8F6A" }, g);
      s("path", { d: `M0 ${-r * .9} L0 ${r * .9}`, stroke: "#5F6E4D", "stroke-width": r * .08, fill: "none", "stroke-linecap": "round" }, g);
    } else {                     // half slice
      s("path", { d: `M${-r} 0 A${r} ${r} 0 0 0 ${r} 0Z`, fill: col }, g);
      s("path", { d: `M${-r * .8} 0 A${r * .8} ${r * .8} 0 0 0 ${r * .8} 0Z`, fill: "#F2D9C2", opacity: .9 }, g);
      s("path", { d: `M${-r * .6} 0 A${r * .6} ${r * .6} 0 0 0 ${r * .6} 0Z`, fill: col, opacity: .75 }, g);
    }
    return g;
  }

  // ---------- running ----------
  function finishNow() {
    if (!current) return;
    const tl = current;
    try { tl.progress(1, false); } catch (e) {}
    if (current === tl && tl._done) tl._done();
  }

  const T = {
    has: (k) => !!(window.Deck && Deck.STAGES && Deck.STAGES[k]),
    // Stage change: one 2px hairline sweeps down the stage in 350 ms; the slide swaps under it and fades in.
    stage(key, mid) {
      const st = (window.Deck && Deck.STAGES[key]) || {};
      ensure(); syncBox(); clearFx(); resetSlide();
      const g = gsap(), sl = document.getElementById("slide");
      fx.style.display = "block"; activeCount++;
      const line = s("rect", { x: 0, y: 0, width: W, height: 2, fill: st.fg || "#F2D9C2", opacity: 0.9 }, svg);
      sfx("whoosh"); if (st.sfx) sfx(st.sfx);
      return new Promise(resolve => {
        let midDone = false;
        const doMid = () => { if (midDone) return; midDone = true; try { mid && mid(); } catch (e) { console.error(e); } };
        const done = () => {
          doMid(); clearFx(); resetSlide(); fx.style.display = "none";
          current = null; activeCount = Math.max(0, activeCount - 1); resolve();
        };
        const tl = g.timeline({ onComplete: done }); current = tl; tl._done = done;
        tl.fromTo(line, { y: 0 }, { y: H - 2, duration: 0.35, ease: "power2.inOut" }, 0)
          .to(sl, { opacity: 0, duration: 0.15, ease: "power1.in" }, 0)
          .call(doMid, null, 0.15)
          .fromTo(sl, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "power2.out" }, 0.15);
      });
    },
    push(mid, dir = 1) {
      const g = gsap(), sl = document.getElementById("slide");
      ensure(); syncBox();
      return new Promise(resolve => {
        let midDone = false;
        const doMid = () => { if (midDone) return; midDone = true; try { mid(); } catch (e) { console.error(e); } };
        activeCount++;
        const done = () => {
          doMid(); g.set(sl, { clearProps: "transform,opacity,filter" });
          current = null; activeCount = Math.max(0, activeCount - 1); resolve();
        };
        const tl = g.timeline({ onComplete: done }); current = tl; tl._done = done;
        g.set(sl, { transformOrigin: "50% 50%" });
        tl.to(sl, { x: -18 * dir, opacity: 0, duration: 0.12, ease: "power1.in" })
          .call(doMid)
          .fromTo(sl, { x: 18 * dir, opacity: 0 }, { x: 0, opacity: 1, duration: 0.2, ease: "power2.out" }, "<");
      });
    },
    finish: finishNow,
    _cur: () => current,
    get active() { return activeCount > 0; }
  };

  // ---------- surprises (presenter gag on X; kept, but calmed and muted) ----------
  const surprises = {
    mo() {
      const g = gsap(); if (!window.CueArt) return Promise.resolve();
      const edges = ["bottom", "left", "right", "top"], e = pick(edges), sz = 420;
      const wrap = css(document.createElement("div"), { position: "absolute", width: sz * 220 / 280 + "px", height: sz + "px", transformOrigin: "50% 50%" });
      wrap.innerHTML = CueArt.mascot();
      const sv = wrap.firstElementChild; css(sv, { width: "100%", height: "100%", overflow: "visible" });
      box.appendChild(wrap);
      const w = sz * 220 / 280, h = sz, off = 40;
      const eyes = wrap.querySelector(".mo-eyes");
      if (eyes) {
        s("ellipse", { cx: 86, cy: 131, rx: 21, ry: 25, fill: "#E3B23C", class: "wink-cover", opacity: 0 }, eyes);
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
        tl.call(() => sfx("pop"), null, 0.05)
          .to(wrap, Object.assign({ duration: 0.4, ease: "power2.out" }, pos.to), 0)
          .set(wink, { opacity: 1 }, 0.6).set(wink, { opacity: 0 }, 0.9)
          .call(() => sfx("pop"), null, 0.6)
          .to(wrap, Object.assign({ duration: 0.3, ease: "power2.in" }, back), 1.2);
      });
    },
    fruit() {
      const g = gsap();
      const sz = 380, col = pick(FRUIT), kind = 0;
      const sv = s("svg", { viewBox: "-200 -200 400 400", width: sz, height: sz }); css(sv, { position: "absolute", overflow: "visible" });
            const inner = s("g", {}, sv);
      const fg = fruitShape(inner, 0, col, 170); fg.firstChild.setAttribute("stroke", "#25292B"); fg.firstChild.setAttribute("stroke-width", 10);
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
          tl.call(() => sfx("pop"), null, t + d);
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

  // Auto-surprises are off in the printed-label deck (quiet motion). The X key still fires one on demand;
  // to bring auto moments back, fill AUTO with slide numbers again: const AUTO = { 6: true, 10: true }.
  const AUTO = {}, seen = {};
  T.onEnter = function (n) {
    if (!AUTO[n] || seen[n]) return;
    seen[n] = true;
    setTimeout(() => { if (window.Deck && Deck.state().n === n) T.surprise(); }, 2500);
  };

  window.Transitions = T;
})();
