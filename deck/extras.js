/* Deck extras: random mascot pop-ups.
 *
 * While a teammate is presenting, the mascot (Cuethie) occasionally peeks in from the left, right or top edge,
 * waves, says something short and leaves. It only appears on slides where the mascot is NOT already on screen,
 * never during transitions, interactive slides, open panels, the grid, print/PDF or reduced-motion.
 * K (or the menu) turns it on/off; the choice is remembered. It sits inside #slide, so any re-render removes it,
 * and it has pointer-events:none so it can never eat a click that should advance the deck.
 */
(function () {
  const PRINT = new URLSearchParams(location.search).has("print");
  const KEY = "cue_mascot_popups";
  const LINES = ["Sip sip!", "Nice pitch!", "Questions? Ask me!", "Still awake?", "Looking good, team!", "Fresh idea!", "On cue!", "Don't forget to smile", "Mango approved", "Hi, professor!"];
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = (a) => a[Math.floor(Math.random() * a.length)];

  let enabled = true, timer = null, lastAt = 0, curN = null, live = null;
  try { enabled = localStorage.getItem(KEY) !== "0"; } catch {}

  function canShow() {
    if (PRINT || !enabled || !window.Deck || !window.CueArt) return false;
    if (!Deck.started || Deck.busy || Deck.reduceMotion || document.hidden || live) return false;
    if (window.Transitions && Transitions.active) return false;
    const cur = Deck.current, el = Deck.slideEl;
    if (!cur || !el || cur.interactive) return false;
    if (el.querySelector(".mo-root")) return false; // mascot already on this slide
    if (document.querySelector(".panel.open, #grid.open")) return false;
    if (Date.now() - lastAt < 40000) return false;
    return true;
  }

  function schedule(ms) {
    clearTimeout(timer);
    if (PRINT || !enabled) return;
    timer = setTimeout(() => { if (canShow() && Math.random() < 0.85) peek(); else schedule(rnd(7000, 14000)); }, ms == null ? rnd(9000, 26000) : ms);
  }

  function peek() {
    const slide = Deck.slideEl; if (!slide) return;
    const sz = 300, w = sz * 220 / 280, h = sz;
    const side = pick(["left", "right", "top"]);
    const wrap = document.createElement("div");
    wrap.className = "cue-peek";
    wrap.style.cssText = `position:absolute;left:0;top:0;width:${w}px;height:${h}px;z-index:25;pointer-events:none;transform-origin:50% 50%`;
    wrap.innerHTML = CueArt.mascot();
    const sv = wrap.firstElementChild; sv.style.cssText = "width:100%;height:100%;overflow:visible";
    const bubble = document.createElement("div");
    bubble.className = "cue-peek-bubble";
    bubble.textContent = pick(LINES);
    slide.appendChild(wrap); slide.appendChild(bubble);
    Deck.rig(wrap);

    // Positions keep clear of the bottom corners (source line left, section cup right).
    const W = 1920, H = 1080, out = 30;
    let from, to, rot, bx, by;
    if (side === "left") {
      const y = rnd(170, 560); rot = 90;
      from = { x: -h / 2 - out - w / 2, y }; to = { x: 0.1 * h - w / 2, y };
      bx = 250; by = y + h / 2 - 90;
    } else if (side === "right") {
      const y = rnd(170, 560); rot = -90;
      from = { x: W + h / 2 + out - w / 2, y }; to = { x: W - 0.1 * h - w / 2, y };
      bx = W - 250 - 340; by = y + h / 2 - 90;
    } else {
      const x = rnd(380, W - 380 - w); rot = 180;
      from = { x, y: -h - out }; to = { x, y: -h * 0.36 };
      bx = x + w + 20; by = 40;
    }
    bubble.style.cssText = `position:absolute;left:${bx}px;top:${by}px;z-index:26;pointer-events:none;opacity:0;white-space:nowrap`;
    gsap.set(wrap, { x: from.x, y: from.y, rotation: rot });
    live = wrap; lastAt = Date.now();
    const arm = wrap.querySelector(".mo-arm-r"), eyes = wrap.querySelector(".mo-eyes");
    const done = () => { wrap.remove(); bubble.remove(); live = null; schedule(rnd(50000, 100000)); };
    const tl = gsap.timeline({ onComplete: done });
    tl.call(() => Deck.ctx.sfx("pop"), null, 0.05)
      .to(wrap, { x: to.x, y: to.y, duration: 0.5, ease: "back.out(2.4)" }, 0)
      .to(bubble, { opacity: 1, y: -6, duration: 0.3, ease: "back.out(2)" }, 0.45);
    if (arm) tl.to(arm, { rotation: -35, duration: 0.18, yoyo: true, repeat: 5, ease: "sine.inOut", svgOrigin: "180 150" }, 0.55);
    if (eyes) tl.to(eyes, { scaleY: 0.1, duration: 0.08, yoyo: true, repeat: 1, svgOrigin: "110 100", transformOrigin: "50% 50%" }, 1.6);
    tl.to(bubble, { opacity: 0, duration: 0.25 }, 2.5)
      .to(wrap, { x: from.x, y: from.y, duration: 0.4, ease: "back.in(2)" }, 2.6);
  }

  document.addEventListener("deck:state", (e) => {
    const n = e.detail && e.detail.n;
    if (n !== curN) { curN = n; live = null; schedule(); }
  });

  window.DeckExtras = {
    peek,
    get mascotOn() { return enabled; },
    toggleMascot() {
      enabled = !enabled;
      try { localStorage.setItem(KEY, enabled ? "1" : "0"); } catch {}
      if (enabled) schedule(); else clearTimeout(timer);
      Deck.toast(enabled ? "Mascot pop-ups on" : "Mascot pop-ups off");
    }
  };
})();
