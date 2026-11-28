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

  // --- shared master chain: compressor + gentle reverb, built once ---
  let busIn = null, noiseBuf = null;
  function bus() {
    const c = ac(); if (!c) return null;
    if (busIn) return busIn;
    // gentle compressor so layered voices sit together without clipping
    const comp = c.createDynamicsCompressor();
    comp.threshold.setValueAtTime(-16, c.currentTime);
    comp.knee.setValueAtTime(18, c.currentTime);
    comp.ratio.setValueAtTime(5, c.currentTime);
    comp.attack.setValueAtTime(0.004, c.currentTime);
    comp.release.setValueAtTime(0.22, c.currentTime);
    comp.connect(c.destination);
    // generated impulse response: decaying noise, ~1.3s tail
    const irLen = Math.floor(c.sampleRate * 1.3), ir = c.createBuffer(2, irLen, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      for (let i = 0; i < irLen; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / irLen, 3);
    }
    const conv = c.createConvolver(); conv.buffer = ir;
    const wet = c.createGain(); wet.gain.value = 0.18;
    conv.connect(wet); wet.connect(comp);
    const dry = c.createGain(); dry.gain.value = 1; dry.connect(comp);
    busIn = c.createGain(); busIn.gain.value = 1;
    busIn.connect(dry); busIn.connect(conv);
    return busIn;
  }
  function getNoise(c) {
    if (!noiseBuf) {
      const len = Math.floor(c.sampleRate * 2);
      noiseBuf = c.createBuffer(1, len, c.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    return noiseBuf;
  }
  const rand = (min, max) => min + Math.random() * (max - min);
  const det = (cents) => (Math.random() - 0.5) * 2 * (cents == null ? 12 : cents); // random detune per play
  const OUT = () => bus();

  // --- tiny synth helpers ---
  function tone({ f = 440, f2 = null, t = 0.15, type = "sine", vol = 0.25, delay = 0, attack = 0.008, pan = null, panTo = null, detune = 12 }) {
    const c = ac(), out = OUT(); if (!c || !out) return;
    const o = c.createOscillator(), g = c.createGain(), now = c.currentTime + delay;
    o.type = type; o.frequency.setValueAtTime(f, now); o.detune.value = det(detune);
    if (f2) o.frequency.exponentialRampToValueAtTime(Math.max(1, f2), now + t);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(vol, now + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, now + t);
    o.connect(g);
    let node = g;
    if (pan !== null) { const p = c.createStereoPanner(); if (panTo !== null) { p.pan.setValueAtTime(pan, now); p.pan.linearRampToValueAtTime(panTo, now + t); } else p.pan.setValueAtTime(pan, now); g.connect(p); node = p; }
    node.connect(out);
    o.start(now); o.stop(now + t + 0.05);
  }
  // triangle voice with a slight two-oscillator chorus (±7 cents)
  function chorusTone({ f, t, vol, delay = 0, type = "triangle" }) {
    [-7, 7].forEach(cents => {
      const c = ac(), out = OUT(); if (!c || !out) return;
      const o = c.createOscillator(), g = c.createGain(), now = c.currentTime + delay;
      o.type = type; o.frequency.setValueAtTime(f, now); o.detune.value = cents + det(4);
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(vol, now + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, now + t);
      o.connect(g).connect(out);
      o.start(now); o.stop(now + t + 0.05);
    });
  }
  function noise({ t = 0.3, vol = 0.3, from = 800, to = 200, type = "lowpass", delay = 0, q = 1, pan = null, panTo = null, attack = 0.005 }) {
    const c = ac(), out = OUT(); if (!c || !out) return;
    const s = c.createBufferSource(); s.buffer = getNoise(c); s.loop = true;
    const f = c.createBiquadFilter(), g = c.createGain(), now = c.currentTime + delay;
    f.type = type; f.Q.value = q;
    f.frequency.setValueAtTime(Math.max(20, from), now);
    f.frequency.exponentialRampToValueAtTime(Math.max(20, to), now + t);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(vol, now + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, now + t);
    s.connect(f); f.connect(g);
    let node = g;
    if (pan !== null) {
      const p = c.createStereoPanner();
      if (panTo !== null) { p.pan.setValueAtTime(pan, now); p.pan.linearRampToValueAtTime(panTo, now + t); }
      else p.pan.setValueAtTime(pan, now);
      g.connect(p); node = p;
    }
    node.connect(out);
    s.start(now); s.stop(now + t + 0.05);
  }
  // band-passed noise with fast random filter sweeps — the "liquid" texture
  function liquidNoise({ t = 1, vol = 0.25, delay = 0, min = 400, max = 1400, q = 2, sweeps = 9 }) {
    const c = ac(), out = OUT(); if (!c || !out) return;
    const s = c.createBufferSource(); s.buffer = getNoise(c); s.loop = true;
    const f = c.createBiquadFilter(), g = c.createGain(), now = c.currentTime + delay;
    f.type = "bandpass"; f.Q.value = q;
    f.frequency.setValueAtTime(rand(min, max), now);
    for (let i = 1; i <= sweeps; i++) f.frequency.exponentialRampToValueAtTime(rand(min, max), now + (t * i) / sweeps);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(vol, now + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, now + t);
    s.connect(f); f.connect(g); g.connect(out);
    s.start(now); s.stop(now + t + 0.05);
  }
  // low body thump underlying liquid hits
  function thump({ f = 100, f2 = 45, t = 0.25, vol = 0.4, delay = 0 }) {
    tone({ f, f2, t, type: "sine", vol, delay, attack: 0.006 });
  }
  // scattered droplet blips after a splash/pour
  function droplets(n, delay, vol) {
    for (let i = 0; i < n; i++) {
      tone({ f: rand(750, 1650), f2: rand(320, 750), t: rand(0.05, 0.1), type: "sine", vol: vol * rand(0.5, 1), delay: delay + rand(0.02, 0.75) });
    }
  }
  // bright tada chord, shared by tada and cheer
  function tadaChord(delay = 0, vol = 0.16) {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      chorusTone({ f, t: i === 3 ? 0.75 : 0.2, vol, delay: delay + i * 0.09 });
    });
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

  // Dart flight from space (slide 13), timed to its 4.57 s animation:
  // 0–1.7 s the dart streaks in, fins fluttering, air tearing past; 2.15 s it punches through the
  // atmosphere (boom); 2.2–4.45 s a falling whistle as it dives to campus; 4.45 s close fly-by.
  function dartFlightSound() {
    const c = ac(), out = OUT(); if (!c || !out) return;
    const now = c.currentTime;
    // 1) rushing air with fin flutter (tremolo) that speeds up as the dart nears
    const src = c.createBufferSource(); src.buffer = getNoise(c); src.loop = true;
    const bp = c.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 1.4;
    bp.frequency.setValueAtTime(350, now); bp.frequency.exponentialRampToValueAtTime(2600, now + 1.7);
    bp.frequency.exponentialRampToValueAtTime(700, now + 2.3); bp.frequency.exponentialRampToValueAtTime(3800, now + 4.45);
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.32, now + 1.5); g.gain.exponentialRampToValueAtTime(0.12, now + 2.4);
    g.gain.exponentialRampToValueAtTime(0.38, now + 4.4); g.gain.exponentialRampToValueAtTime(0.0001, now + 4.6);
    const trem = c.createGain(); trem.gain.value = 0.65;
    const lfo = c.createOscillator(), lfoG = c.createGain(); lfo.type = "triangle";
    lfo.frequency.setValueAtTime(7, now); lfo.frequency.exponentialRampToValueAtTime(22, now + 1.7);
    lfo.frequency.setValueAtTime(14, now + 2.2); lfo.frequency.exponentialRampToValueAtTime(34, now + 4.45);
    lfoG.gain.value = 0.35; lfo.connect(lfoG).connect(trem.gain);
    let tail = g;
    if (c.createStereoPanner) { const pn = c.createStereoPanner(); pn.pan.setValueAtTime(0.7, now); pn.pan.linearRampToValueAtTime(0, now + 1.7); pn.pan.linearRampToValueAtTime(-0.3, now + 4.4); g.connect(pn); tail = pn; }
    src.connect(bp).connect(trem).connect(g); tail.connect(out);
    src.start(now); lfo.start(now); src.stop(now + 4.7); lfo.stop(now + 4.7);
    // 2) incoming whine (pitch falls slightly as it streaks away into the screen)
    tone({ f: 2400, f2: 1300, t: 1.7, type: "sine", vol: 0.05, attack: 0.4 });
    tone({ f: 2412, f2: 1306, t: 1.7, type: "sine", vol: 0.03, attack: 0.4 });
    // 3) atmosphere entry: low boom + crackle at the flash
    tone({ f: 70, f2: 32, t: 0.9, type: "sine", vol: 0.5, delay: 2.12, attack: 0.01 });
    noise({ t: 0.6, vol: 0.3, from: 2200, to: 180, delay: 2.12, attack: 0.005 });
    for (let i = 0; i < 10; i++) noise({ t: 0.02, vol: rand(0.06, 0.16), from: rand(2500, 5000), to: rand(1500, 3000), type: "highpass", delay: 2.15 + rand(0, 0.45), pan: rand(-0.7, 0.7) });
    // 4) the classic falling whistle while it dives to campus
    tone({ f: 1900, f2: 520, t: 2.25, type: "sine", vol: 0.09, delay: 2.2, attack: 0.3 });
    tone({ f: 3800, f2: 1040, t: 2.25, type: "triangle", vol: 0.018, delay: 2.2, attack: 0.3 });
    // 5) close fly-by right before the THUNK
    noise({ t: 0.18, vol: 0.4, from: 900, to: 5200, type: "bandpass", q: 1.4, delay: 4.38, pan: 0.6, panTo: -0.6, attack: 0.02 });
  }

  const SYNTH = {
    pop: () => { tone({ f: 480, f2: 1120, t: 0.12, type: "triangle", vol: 0.32 }); tone({ f: 240, f2: 560, t: 0.1, type: "sine", vol: 0.2 }); },
    click: () => { tone({ f: 1500, t: 0.03, type: "square", vol: 0.06, detune: 30 }); noise({ t: 0.02, vol: 0.09, from: 3200, to: 2400, type: "highpass" }); },
    step: () => { noise({ t: 0.09, vol: 0.28, from: 500, to: 110 }); tone({ f: 95, f2: 55, t: 0.09, type: "sine", vol: 0.24 }); },
    whoosh: () => { noise({ t: 0.5, vol: 0.38, from: 240, to: 3300, type: "bandpass", q: 1.1, pan: -0.75, panTo: 0.75, attack: 0.02 }); tone({ f: 300, f2: 900, t: 0.45, type: "sine", vol: 0.05, pan: -0.5, panTo: 0.5 }); },
    swoosh: () => noise({ t: 0.38, vol: 0.34, from: 2800, to: 260, type: "bandpass", q: 1.1, pan: 0.75, panTo: -0.75, attack: 0.015 }),
    splat: () => {
      thump({ f: 125, f2: 46, t: 0.3, vol: 0.48 });
      liquidNoise({ t: 0.3, vol: 0.5, min: 350, max: 1500, q: 1.4, sweeps: 7 });
      droplets(3, 0.14, 0.22);
    },
    drop: () => { tone({ f: 870, f2: 285, t: 0.17, type: "sine", vol: 0.28 }); tone({ f: 1740, f2: 570, t: 0.1, type: "triangle", vol: 0.08, delay: 0.02 }); noise({ t: 0.1, vol: 0.18, from: 700, to: 110, delay: 0.15 }); },
    thunk: () => { tone({ f: 172, f2: 57, t: 0.2, type: "triangle", vol: 0.5 }); tone({ f: 86, f2: 43, t: 0.22, type: "sine", vol: 0.3 }); noise({ t: 0.06, vol: 0.34, from: 1900, to: 320 }); },
    sad: () => [392, 370, 349, 294].forEach((f, i) => {
      tone({ f, f2: f * 0.97, t: i === 3 ? 0.7 : 0.28, type: "sawtooth", vol: 0.085, delay: i * 0.3, detune: 8 });
      tone({ f: f * 1.005, f2: f * 0.975, t: i === 3 ? 0.7 : 0.28, type: "sawtooth", vol: 0.06, delay: i * 0.3, detune: 8 });
    }),
    tada: () => tadaChord(0, 0.16),
    riser: () => { tone({ f: 185, f2: 1550, t: 0.92, type: "sawtooth", vol: 0.065, attack: 0.05 }); noise({ t: 0.92, vol: 0.08, from: 300, to: 4200, type: "bandpass", q: 2.5, attack: 0.05 }); },
    pour: () => { liquidNoise({ t: 1.35, vol: 0.28, min: 480, max: 1150, q: 2.4, sweeps: 12 }); droplets(4, 0.15, 0.12); thump({ f: 115, f2: 68, t: 0.22, vol: 0.2, delay: 1.15 }); },
    water: () => { liquidNoise({ t: 1.15, vol: 0.23, min: 950, max: 2600, q: 1.8, sweeps: 11 }); droplets(4, 0.1, 0.15); },
    blender: () => blenderSound(2.4),
    dartflight: () => dartFlightSound(),
    sparkle: () => [1568, 2093, 2637, 3136].forEach((f, i) => tone({ f, t: 0.2, type: "sine", vol: 0.085, delay: i * 0.055, detune: 20 })),
    seed: () => { tone({ f: 660, f2: 205, t: 0.18, type: "sine", vol: 0.24 }); noise({ t: 0.1, vol: 0.3, from: 520, to: 95, delay: 0.18 }); tone({ f: 1320, f2: 660, t: 0.07, type: "triangle", vol: 0.06, delay: 0.02 }); },
    cheer: () => {
      liquidNoise({ t: 1.5, vol: 0.2, min: 1100, max: 2500, q: 0.6, sweeps: 14 });
      chorusTone({ f: 523.25, t: 0.9, vol: 0.09, delay: 0.35 });
      chorusTone({ f: 659.25, t: 0.9, vol: 0.09, delay: 0.42 });
      chorusTone({ f: 784, t: 1.0, vol: 0.09, delay: 0.49 });
    },
    splash: () => {
      thump({ f: 98, f2: 38, t: 0.38, vol: 0.52 });
      noise({ t: 0.5, vol: 0.48, from: 2900, to: 260, type: "lowpass", attack: 0.004 });
      liquidNoise({ t: 0.5, vol: 0.32, min: 500, max: 1800, q: 1.2, sweeps: 8, delay: 0.02 });
      droplets(6, 0.22, 0.2);
    },
    glass: () => {
      const f = rand(1950, 2300);
      tone({ f, t: 0.9, type: "sine", vol: 0.2, detune: 6 });
      tone({ f: f * 2.76, t: 0.55, type: "sine", vol: 0.11, detune: 6 });
      tone({ f: f * 5.4, t: 0.28, type: "sine", vol: 0.05, detune: 6 });
      noise({ t: 0.02, vol: 0.08, from: 5000, to: 3800, type: "highpass" });
    },
    boing: () => {
      const c = ac(), out = OUT(); if (!c || !out) return;
      const o = c.createOscillator(), g = c.createGain(), now = c.currentTime;
      o.type = "triangle"; o.detune.value = det(10);
      o.frequency.setValueAtTime(95, now);
      o.frequency.exponentialRampToValueAtTime(340, now + 0.09);
      o.frequency.exponentialRampToValueAtTime(125, now + 0.21);
      o.frequency.exponentialRampToValueAtTime(225, now + 0.32);
      o.frequency.exponentialRampToValueAtTime(140, now + 0.45);
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.4, now + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
      o.connect(g).connect(out);
      o.start(now); o.stop(now + 0.55);
      tone({ f: 48, f2: 40, t: 0.18, type: "sine", vol: 0.18 });
    },
    dart: () => {
      noise({ t: 0.32, vol: 0.3, from: 480, to: 3900, type: "bandpass", q: 1.6, pan: -0.6, panTo: 0.6, attack: 0.01 });
      tone({ f: 1500, f2: 2550, t: 0.3, type: "sine", vol: 0.055, pan: -0.4, panTo: 0.5 });
      tone({ f: 225, f2: 68, t: 0.13, type: "triangle", vol: 0.42, delay: 0.34 });
      noise({ t: 0.04, vol: 0.22, from: 1500, to: 350, delay: 0.34 });
    },
    confetti: () => {
      tone({ f: 155, f2: 58, t: 0.12, type: "sine", vol: 0.4 });
      noise({ t: 0.03, vol: 0.3, from: 900, to: 400 });
      for (let i = 0; i < 26; i++) {
        noise({ t: 0.012, vol: rand(0.08, 0.26), from: rand(1600, 4200), to: rand(1200, 3000), type: "highpass", delay: rand(0.03, 0.52), pan: rand(-0.8, 0.8) });
      }
      tone({ f: 2093, t: 0.15, type: "triangle", vol: 0.06, delay: 0.18, detune: 25 });
    },
    scratch: () => {
      noise({ t: 0.16, vol: 0.2, from: 5200, to: 900, type: "bandpass", q: 2, attack: 0.004 });
      tone({ f: 1100, f2: 150, t: 0.2, type: "sawtooth", vol: 0.07, attack: 0.004 });
      noise({ t: 0.12, vol: 0.16, from: 900, to: 4800, type: "bandpass", q: 2, delay: 0.17, attack: 0.004 });
    },
    // Sound check at the start: a tiny rising "ding-ding-ding-DING" with a sparkle on top (C major arpeggio).
    jingle: () => {
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
        tone({ f, t: i === 3 ? 0.7 : 0.18, type: "triangle", vol: 0.2, delay: i * 0.12, attack: 0.006, detune: 4 });
        tone({ f: f * 2, t: 0.25, type: "sine", vol: 0.05, delay: i * 0.12 + 0.01, detune: 4 });
      });
      tone({ f: 2093, t: 0.5, type: "sine", vol: 0.04, delay: 0.5, detune: 4 });
    },
    chime: () => {
      tone({ f: 880, t: 0.9, type: "sine", vol: 0.16, attack: 0.01 });
      tone({ f: 1318.5, t: 0.7, type: "sine", vol: 0.09, delay: 0.02, attack: 0.01 });
      tone({ f: 1760, t: 0.4, type: "triangle", vol: 0.045, delay: 0.04, attack: 0.01 });
    }
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
