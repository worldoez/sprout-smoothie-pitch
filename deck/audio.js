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

  // Blender: motor spins up, whines with wobble, liquid churns, ice chunks knock, spins down.
  function blenderSound(dur = 2.4) {
    const c = ac(); if (!c) return;
    const now = c.currentTime, end = now + dur, out = c.createGain();
    out.gain.setValueAtTime(0.0001, now);
    out.gain.exponentialRampToValueAtTime(0.5, now + 0.25);
    out.gain.setValueAtTime(0.5, end - 0.35);
    out.gain.exponentialRampToValueAtTime(0.0001, end);
    out.connect(c.destination);
    // motor: two detuned saws + a square, pitch ramps up then down, wobble LFO
    const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1400; lp.Q.value = 2;
    const hp = c.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 70;
    lp.connect(hp).connect(out);
    const lfo = c.createOscillator(), lfoG = c.createGain(); lfo.frequency.value = 9; lfoG.gain.value = 9; lfo.connect(lfoG);
    [["sawtooth", 1, 0.16], ["sawtooth", 1.012, 0.12], ["square", 2, 0.05]].forEach(([type, mul, vol]) => {
      const o = c.createOscillator(), g = c.createGain(); o.type = type;
      o.frequency.setValueAtTime(45 * mul, now);
      o.frequency.exponentialRampToValueAtTime(205 * mul, now + 0.45);
      o.frequency.setValueAtTime(205 * mul, end - 0.4);
      o.frequency.exponentialRampToValueAtTime(60 * mul, end);
      lfoG.connect(o.frequency); g.gain.value = vol; o.connect(g).connect(lp); o.start(now); o.stop(end + 0.05);
    });
    lfo.start(now); lfo.stop(end + 0.05);
    // churning liquid: band-passed noise with a fast tremolo
    const len = Math.floor(c.sampleRate * dur), buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const n = c.createBufferSource(), bp = c.createBiquadFilter(), ng = c.createGain(), trem = c.createOscillator(), tg = c.createGain();
    n.buffer = buf; bp.type = "bandpass"; bp.frequency.value = 1800; bp.Q.value = 0.8; ng.gain.value = 0.22;
    trem.frequency.value = 13; tg.gain.value = 0.12; trem.connect(tg).connect(ng.gain);
    n.connect(bp).connect(ng).connect(out); n.start(now); trem.start(now); trem.stop(end);
    // ice/fruit chunks knocking the jar
    for (let k = 0; k < 9; k++) {
      const t0 = now + 0.3 + (k / 9) * (dur - 0.8) + Math.random() * 0.08, o = c.createOscillator(), g = c.createGain();
      o.type = "triangle"; o.frequency.setValueAtTime(900 + Math.random() * 900, t0); o.frequency.exponentialRampToValueAtTime(300, t0 + 0.05);
      g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.18, t0 + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.07);
      o.connect(g).connect(out); o.start(t0); o.stop(t0 + 0.1);
    }
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
    blender: () => blenderSound(2.4),
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
