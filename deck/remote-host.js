/* Phone remote — the deck side.
 * Two transports, both optional:
 *  1. BroadcastChannel "sprout-deck": a presenter view in another window/tab of the SAME browser (works offline).
 *  2. PeerJS (WebRTC): a phone on any network. The free PeerJS cloud only introduces the two devices;
 *     the commands and notes then flow directly between phone and laptop.
 * The remote page is ../remote/index.html?code=XXXXX
 */
(function () {
  const PEER_PREFIX = "sprout-deck-";
  let peer = null, conns = [], code = null, status = "off";
  const bc = ("BroadcastChannel" in window) ? new BroadcastChannel("sprout-deck") : null;

  function getCode() {
    try { code = sessionStorage.getItem("sprout_remote_code"); } catch {}
    if (!code) {
      const a = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
      code = Array.from({ length: 5 }, () => a[Math.floor(Math.random() * a.length)]).join("");
      try { sessionStorage.setItem("sprout_remote_code", code); } catch {}
    }
    return code;
  }
  const remoteURL = () => new URL("../remote/index.html?code=" + getCode(), location.href).href;

  function send(msg) {
    if (bc) bc.postMessage(msg);
    conns.forEach(c => { try { c.open && c.send(msg); } catch {} });
  }
  function onMsg(m) {
    if (!m) return;
    if (m.type === "cmd") Deck.command(m);
    if (m.type === "hello") send({ type: "state", state: Deck.state() });
  }
  if (bc) bc.onmessage = (e) => onMsg(e.data);
  document.addEventListener("deck:state", (e) => send({ type: "state", state: e.detail }));

  function setStatus(s, text) {
    status = s;
    const el = document.getElementById("remote-status");
    if (el) { el.textContent = text; el.dataset.s = s; }
    const b = document.getElementById("btn-remote"); if (b) b.classList.toggle("on", s === "connected");
  }

  function startPeer() {
    if (peer || !window.Peer) { if (!window.Peer) setStatus("error", "Phone pairing needs internet (PeerJS could not load). A second window on this laptop still works."); return; }
    setStatus("waiting", "Starting…");
    peer = new Peer(PEER_PREFIX + getCode(), { debug: 0 });
    peer.on("open", () => setStatus("waiting", "Waiting for your phone…"));
    peer.on("connection", (c) => {
      conns.push(c);
      c.on("open", () => { setStatus("connected", "Phone connected"); c.send({ type: "state", state: Deck.state() }); Deck.toast("Phone remote connected"); });
      c.on("data", onMsg);
      c.on("close", () => { conns = conns.filter(x => x !== c); setStatus(conns.length ? "connected" : "waiting", conns.length ? "Phone connected" : "Phone disconnected. Waiting…"); });
    });
    peer.on("disconnected", () => { try { peer.reconnect(); } catch {} });
    peer.on("error", (e) => {
      if (e.type === "unavailable-id") { // code taken (e.g. an old tab): make a new one
        try { sessionStorage.removeItem("sprout_remote_code"); } catch {}
        code = null; peer.destroy(); peer = null; startPeer(); renderPanel(); return;
      }
      setStatus("error", "Pairing problem: " + e.type + ". Close and open this panel to retry.");
    });
  }

  function renderPanel() {
    const body = document.getElementById("remote-body"); if (!body) return;
    body.innerHTML = `
      <p>Scan with your phone to get <b>Next/Back buttons, your notes and the timer</b> in your hand.</p>
      <div class="remote-qr">${Kit.qrSVG(remoteURL(), 220)}</div>
      <p class="remote-code">Code <b>${getCode()}</b></p>
      <p id="remote-status" data-s="${status}">…</p>
      <p class="meta">Or open <a href="${remoteURL()}" target="_blank" rel="noopener">the remote in a new window</a> on this laptop (presenter view; works offline).</p>`;
    setStatus(status, status === "connected" ? "Phone connected" : status === "error" ? "Pairing problem" : "Waiting for your phone…");
  }

  window.DeckRemote = {
    open() {
      startPeer();
      renderPanel();
      document.getElementById("remote-panel").classList.add("open");
    },
    url: remoteURL
  };
})();
