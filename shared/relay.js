/* CueRelay: realtime messages between devices on ANY network (phone on 4G, laptop on campus Wi-Fi).
 * Uses free public MQTT-over-WebSocket brokers; connects to all of them at once and de-duplicates,
 * so if one broker is down or blocked the others still carry the messages.
 * Also uses BroadcastChannel so windows on the same computer talk instantly (and offline).
 *
 *   const r = CueRelay.open("ABCDE", (type, data, msg) => {...}, { onStatus: s => {} });
 *   r.send("cmd", { cmd: "next" });          // fire-and-forget
 *   r.send("state", {...}, { retain: true }); // late joiners receive the latest copy immediately
 *
 * Messages are small JSON; rooms are random codes. Don't send anything private (it is a public relay).
 * Needs mqtt.js (https://cdn.jsdelivr.net/npm/mqtt@5.10.1/dist/mqtt.min.js) loaded before this file.
 */
(function () {
  const BROKERS = ["wss://broker.emqx.io:8084/mqtt", "wss://test.mosquitto.org:8081", "wss://broker.hivemq.com:8884/mqtt"];
  const BASE = "cue-pitch/v1/";

  function open(room, onMessage, opts = {}) {
    const me = Math.random().toString(36).slice(2, 10);
    const seen = new Set(), seenQ = [];
    const clients = [], up = new Set();
    const topic = (ch) => BASE + room + "/" + ch;
    const status = () => opts.onStatus && opts.onStatus(up.size ? "online" : "connecting", up.size);

    function deliver(raw, via) {
      let m; try { m = typeof raw === "string" ? JSON.parse(raw) : raw; } catch { return; }
      if (!m || !m.id || m.from === me || seen.has(m.id)) return;
      seen.add(m.id); seenQ.push(m.id); if (seenQ.length > 500) seen.delete(seenQ.shift());
      try { onMessage(m.type, m.data, m, via); } catch (e) { console.warn("[relay]", e); }
    }

    const bc = ("BroadcastChannel" in window) ? new BroadcastChannel("cue-relay-" + room) : null;
    if (bc) bc.onmessage = (e) => deliver(e.data, "local");

    if (window.mqtt) {
      BROKERS.forEach((url) => {
        let c;
        try { c = mqtt.connect(url, { clientId: "cue_" + me + "_" + clients.length, connectTimeout: 8000, reconnectPeriod: 3000, keepalive: 30, clean: true }); }
        catch { return; }
        clients.push(c);
        c.on("connect", () => { up.add(url); c.subscribe(BASE + room + "/#", { qos: 0 }); status(); });
        c.on("close", () => { up.delete(url); status(); });
        c.on("offline", () => { up.delete(url); status(); });
        c.on("error", () => {});
        c.on("message", (_t, payload) => deliver(payload.toString(), "net"));
      });
    }
    status();

    return {
      me,
      send(type, data, o = {}) {
        const msg = { id: me + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6), from: me, type, data, at: Date.now() };
        const s = JSON.stringify(msg);
        if (bc) bc.postMessage(s);
        clients.forEach(c => { if (c.connected) c.publish(topic(o.channel || type), s, { qos: 0, retain: !!o.retain }); });
      },
      get online() { return up.size; },
      close() { clients.forEach(c => c.end(true)); if (bc) bc.close(); }
    };
  }

  // Short, unambiguous room codes (no 0/O/1/I).
  function code(n = 5) { const a = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; return Array.from({ length: n }, () => a[Math.floor(Math.random() * a.length)]).join(""); }

  window.CueRelay = { open, code };
})();
