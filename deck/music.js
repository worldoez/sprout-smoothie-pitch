/* Celebration music for the finale (slide 21).
 * Uses assets/audio/celebration.mp3 if it exists; otherwise plays a synthesized upbeat
 * party loop (124 bpm: kick, clap, hats, bass, chords, lead) with the Web Audio API.
 * Starts when the finale opens, fades out when you leave it. Respects the deck's mute.
 */
(function () {
  const FINALE = 21, BPM = 124, FILE = "../assets/audio/celebration.mp3";
  let ac = null, master = null, timer = null, nextTime = 0, step = 0, playing = false, fileEl = null, fileOk = null;

  const N = (m) => 440 * Math.pow(2, (m - 69) / 12);          // midi → Hz
  const CHORDS = [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]]; // C G Am F
  const BASS = [36, 31, 33, 29];
  // 16 sixteenth-steps per bar, 4 bars; lead melody (midi or 0 = rest)
  const LEAD = [
    76, 0, 79, 0, 81, 0, 79, 76, 0, 74, 76, 0, 72, 0, 0, 0,
    74, 0, 79, 0, 83, 0, 81, 79, 0, 76, 74, 0, 71, 0, 0, 0,
    72, 0, 76, 0, 81, 0, 84, 83, 0, 81, 79, 0, 76, 0, 0, 0,
    77, 0, 76, 0, 74, 0, 72, 74, 0, 76, 79, 0, 84, 0, 0, 0];

  function ctx() {
    if (!ac) {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      const comp = ac.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
      master = ac.createGain(); master.gain.value = 0;
      master.connect(comp).connect(ac.destination);
    }
    if (ac.state === "suspended") ac.resume();
    return ac;
  }
  function env(g, t, a, peak, d) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); }
  function osc(type, f, t, dur, peak, dest, a = 0.005) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t);
    env(g, t, a, peak, dur); o.connect(g).connect(dest || master); o.start(t); o.stop(t + a + dur + 0.05); return o;
  }
  let noiseBuf = null;
  function noise(t, dur, peak, hp) {
    if (!noiseBuf) { noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = noiseBuf; f.type = "highpass"; f.frequency.value = hp; env(g, t, 0.002, peak, dur);
    s.connect(f).connect(g).connect(master); s.start(t); s.stop(t + dur + 0.05);
  }
  function kick(t) { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.12); env(g, t, 0.002, 0.9, 0.22); o.connect(g).connect(master); o.start(t); o.stop(t + 0.3); }

  function schedule(t, s) {
    const bar = Math.floor(s / 16) % 4, i = s % 16, sixteenth = 60 / BPM / 4;
    if (i % 4 === 0) kick(t);
    if (i === 4 || i === 12) { noise(t, 0.12, 0.35, 1200); noise(t + 0.012, 0.1, 0.25, 1500); } // clap
    if (i % 2 === 0) noise(t, 0.03, i % 4 === 2 ? 0.12 : 0.06, 7000);                     // hats
    if (i % 2 === 0) osc("sawtooth", N(BASS[bar] + (i % 8 === 6 ? 12 : 0)), t, sixteenth * 1.6, 0.16);
    if (i === 0 || i === 6 || i === 10) CHORDS[bar].forEach(m => osc("square", N(m), t, sixteenth * 2.5, 0.045, null, 0.01));
    const l = LEAD[(bar * 16 + i) % LEAD.length];
    if (l) { osc("triangle", N(l), t, sixteenth * 1.8, 0.13); osc("sine", N(l + 12), t, sixteenth * 1.2, 0.04); }
  }
  function tick() {
    const sixteenth = 60 / BPM / 4;
    while (nextTime < ac.currentTime + 0.15) { schedule(nextTime, step); nextTime += sixteenth; step++; }
  }
  const muted = () => !!(window.DeckAudio && DeckAudio.muted);

  function start() {
    if (playing) return; playing = true;
    if (fileOk !== false) {
      fileEl = fileEl || new Audio(FILE); fileEl.loop = true; fileEl.volume = muted() ? 0 : 0.55;
      fileEl.play().then(() => { fileOk = true; }).catch(() => { fileOk = false; if (playing) startSynth(); });
      fileEl.onerror = () => { fileOk = false; if (playing && !timer) startSynth(); };
      if (fileOk === true) return;
    } else startSynth();
  }
  function startSynth() {
    if (timer) return; ctx();
    step = 0; nextTime = ac.currentTime + 0.05;
    master.gain.cancelScheduledValues(ac.currentTime);
    master.gain.setValueAtTime(0.0001, ac.currentTime);
    master.gain.exponentialRampToValueAtTime(muted() ? 0.0001 : 0.32, ac.currentTime + 0.4);
    timer = setInterval(tick, 40); tick();
  }
  function stop() {
    if (!playing) return; playing = false;
    if (fileEl) { const el = fileEl, v0 = el.volume; let k = 0; const iv = setInterval(() => { k++; el.volume = Math.max(0, v0 * (1 - k / 15)); if (k >= 15) { clearInterval(iv); el.pause(); } }, 50); }
    if (timer && ac) {
      master.gain.cancelScheduledValues(ac.currentTime);
      master.gain.setValueAtTime(master.gain.value || 0.0001, ac.currentTime);
      master.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.8);
      const t = timer; timer = null; setTimeout(() => clearInterval(t), 850);
    }
  }
  function applyMute() {
    if (fileEl) fileEl.volume = muted() ? 0 : 0.55;
    if (ac && timer) master.gain.setTargetAtTime(muted() ? 0.0001 : 0.32, ac.currentTime, 0.05);
  }

  document.addEventListener("deck:state", (e) => {
    const s = e.detail || {};
    if (s.n === FINALE) { start(); if (window.DeckAudio) DeckAudio.loop("none"); } else stop();
    applyMute();
  });
  window.DeckMusic = { start, stop };
})();
