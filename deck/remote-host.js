/* Phone remote: the deck side.
 * Uses SproutRelay (shared/relay.js): public MQTT relays + BroadcastChannel, so a phone on 4G
 * and a laptop on campus Wi-Fi can talk (no peer-to-peer connection needed).
 * Remote page: ../remote/index.html?code=XXXXX
 */
(function () {
  let relay = null, code = null, phones = 0, lastSeen = 0;

  function getCode() {
    try { code = code || sessionStorage.getItem("sprout_remote_code"); } catch {}
    if (!code) { code = SproutRelay.code(); try { sessionStorage.setItem("sprout_remote_code", code); } catch {} }
    return code;
  }
  const remoteURL = () => new URL("../remote/index.html?code=" + getCode(), location.href).href;

  function setStatus() {
    const el = document.getElementById("remote-status");
    const connected = Date.now() - lastSeen < 15000;
    const s = !relay ? "off" : connected ? "connected" : relay.online ? "waiting" : "connecting";
    const text = { off: "Not started", connecting: "Connecting to the relay…", waiting: "Ready. Waiting for your phone…", connected: "Phone connected" }[s];
    if (el) { el.textContent = text; el.dataset.s = s; }
    const b = document.getElementById("btn-remote"); if (b) b.classList.toggle("on", connected);
  }

  function start() {
    if (relay || !window.SproutRelay) return;
    relay = SproutRelay.open(getCode(), (type, data) => {
      if (type === "hello" || type === "ping") { lastSeen = Date.now(); pushState(); setStatus(); if (type === "hello") Deck.toast("Phone remote connected"); }
      if (type === "cmd") { lastSeen = Date.now(); Deck.command(data); setStatus(); }
    }, { onStatus: setStatus });
    document.addEventListener("deck:state", pushState);
    setInterval(setStatus, 3000);
  }
  function pushState() { if (relay) relay.send("state", Deck.state(), { retain: true }); }

  function renderPanel() {
    const body = document.getElementById("remote-body"); if (!body) return;
    body.innerHTML = `
      <p>Scan with your phone for <b>Next and Back buttons, your notes and the timer</b>. Works on Wi-Fi or mobile data.</p>
      <div class="remote-qr">${Kit.qrSVG(remoteURL(), 220)}</div>
      <p class="remote-code">Code <b>${getCode()}</b></p>
      <p id="remote-status" data-s="off">…</p>
      <p class="meta">Or open <a href="${remoteURL()}" target="_blank" rel="noopener">the remote in a new window</a> on this laptop as a presenter view.</p>`;
    setStatus();
  }

  window.DeckRemote = {
    open() { start(); renderPanel(); document.getElementById("remote-panel").classList.add("open"); },
    url: remoteURL
  };
  // Start quietly in the background so a phone that already has the link reconnects after a reload.
  window.addEventListener("load", () => { try { if (sessionStorage.getItem("sprout_remote_code")) start(); } catch {} });
})();
