// Audio: section loops + sound effects.
// Files in assets/audio/ are used when present; otherwise sound effects are synthesised (Web Audio),
// so the deck always has sound even before the team adds real files.
(function () {
  let ctx = null, muted = false, loopEl = null, loopKey = null, fadeTimer = null;
  const fileOk = {}; // name -> true/false once probed
  const LOOP_VOL = 0.28;

  function ac() {
    if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { return null; } }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  // --- tiny synth helpers ---
  function tone({ f = 440, f2 = null, t = 0.15, type = "sine", vol = 0.25, delay = 0 }) {
    const c = ac(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain(), now = c.currentTime + delay;
    o.type = type; o.frequency.setValueAtTime(f, now);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, now + t);
    g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(vol, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, now + t);
    o.connect(g).connect(c.destination); o.start(now); o.stop(now + t + 0.05);
  }
  function noise({ t = 0.3, vol = 0.3, from = 800, to = 200, type = "lowpass", delay = 0, q = 1 }) {
    const c = ac(); if (!c) return;
    const len = Math.floor(c.sampleRate * t), buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(), now = c.currentTime + delay;
    s.buffer = buf; f.type = type; f.Q.value = q;
    f.frequency.setValueAtTime(from, now); f.frequency.exponentialRampToValueAtTime(Math.max(20, to), now + t);
    g.gain.setValueAtTime(vol, now); g.gain.exponentialRampToValueAtTime(0.0001, now + t);
    s.connect(f).connect(g).connect(c.destination); s.start(now);
  }

  const SYNTH = {
    pop: () => tone({ f: 500, f2: 1100, t: 0.12, type: "triangle", vol: 0.3 }),
    click: () => tone({ f: 1400, t: 0.04, type: "square", vol: 0.08 }),
    step: () => noise({ t: 0.08, vol: 0.25, from: 400, to: 120 }),
    whoosh: () => noise({ t: 0.45, vol: 0.35, from: 300, to: 3000, type: "bandpass", q: 0.8 }),
    swoosh: () => noise({ t: 0.35, vol: 0.3, from: 3000, to: 300, type: "bandpass", q: 0.8 }),
    splat: () => { noise({ t: 0.35, vol: 0.6, from: 1200, to: 80 }); tone({ f: 120, f2: 50, t: 0.3, vol: 0.4 }); },
    drop: () => { tone({ f: 900, f2: 300, t: 0.18, vol: 0.25 }); noise({ t: 0.12, vol: 0.2, from: 600, to: 100, delay: 0.16 }); },
    thunk: () => { tone({ f: 180, f2: 60, t: 0.18, type: "triangle", vol: 0.5 }); noise({ t: 0.06, vol: 0.4, from: 2000, to: 400 }); },
    sad: () => [392, 370, 349, 294].forEach((f, i) => tone({ f, f2: f * 0.97, t: i === 3 ? 0.7 : 0.28, type: "sawtooth", vol: 0.09, delay: i * 0.3 })),
    tada: () => [523, 659, 784, 1047].forEach((f, i) => tone({ f, t: i === 3 ? 0.6 : 0.16, type: "triangle", vol: 0.2, delay: i * 0.09 })),
    riser: () => tone({ f: 200, f2: 1600, t: 0.9, type: "sawtooth", vol: 0.06 }),
    pour: () => noise({ t: 1.4, vol: 0.25, from: 900, to: 500, type: "bandpass", q: 2 }),
    water: () => noise({ t: 1.2, vol: 0.22, from: 2500, to: 1200, type: "bandpass", q: 1.5 }),
    blender: () => { noise({ t: 1.6, vol: 0.18, from: 600, to: 900, type: "bandpass", q: 4 }); tone({ f: 110, f2: 160, t: 1.6, type: "sawtooth", vol: 0.05 }); },
    sparkle: () => [1568, 2093, 2637].forEach((f, i) => tone({ f, t: 0.18, vol: 0.08, delay: i * 0.06 })),
    seed: () => { tone({ f: 700, f2: 200, t: 0.2, vol: 0.2 }); noise({ t: 0.1, vol: 0.3, from: 500, to: 100, delay: 0.2 }); },
    cheer: () => { noise({ t: 1.4, vol: 0.2, from: 1500, to: 2500, type: "bandpass", q: 0.5 }); SYNTH.tada(); }
  };

  function sfx(name) {
    if (muted) return;
    const url = `../assets/audio/sfx-${name}.mp3`;
    if (fileOk[name] === true) { const a = new Audio(url); a.volume = 0.8; a.play().catch(() => {}); return; }
    if (fileOk[name] === false) { SYNTH[name] && SYNTH[name](); return; }
    const a = new Audio(url); a.volume = 0.8;
    a.addEventListener("canplaythrough", () => { fileOk[name] = true; }, { once: true });
    a.addEventListener("error", () => { fileOk[name] = false; SYNTH[name] && SYNTH[name](); }, { once: true });
    a.play().catch(() => {});
  }

  function fadeTo(el, target, ms, done) {
    clearInterval(fadeTimer);
    const start = el.volume, t0 = performance.now();
    fadeTimer = setInterval(() => {
      const k = Math.min(1, (performance.now() - t0) / ms);
      el.volume = Math.max(0, Math.min(1, start + (target - start) * k));
      if (k >= 1) { clearInterval(fadeTimer); done && done(); }
    }, 40);
  }

  /** Switch the background loop. key = stage name or "brand"; vol optional. */
  function loop(key, vol = LOOP_VOL) {
    const b = window.CONTENT.brand.audio;
    const src = key === "brand" ? b.brandSong : (b.loops[key] || null);
    if (key === loopKey && loopEl) { fadeTo(loopEl, muted ? 0 : vol, 600); return; }
    loopKey = key;
    const old = loopEl;
    if (old) fadeTo(old, 0, 700, () => old.pause());
    if (!src) { loopEl = null; return; }
    const el = new Audio("../" + src); el.loop = true; el.volume = 0;
    el.addEventListener("error", () => { if (loopEl === el) loopEl = null; }, { once: true });
    loopEl = el;
    el.play().then(() => fadeTo(el, muted ? 0 : vol, 1200)).catch(() => {});
  }

  window.DeckAudio = {
    sfx, loop,
    unlock: ac,
    get muted() { return muted; },
    toggleMute() { muted = !muted; if (loopEl) loopEl.volume = muted ? 0 : LOOP_VOL; return muted; },
    stop() { if (loopEl) { loopEl.pause(); loopEl = null; loopKey = null; } }
  };
})();
