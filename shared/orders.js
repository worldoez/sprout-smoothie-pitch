// Orders travel live over CueRelay (shared/relay.js): no GitHub token, no page reload.
//
//   Deck:  CueOrders.room()  → a 5-letter room code; the slide's order QR carries it (?room=CODE).
//          CueOrders.listen(cb) → cb(order) the moment a phone places an order; the deck acks it.
//   Phone: CueOrders.submit(order) → sends to the room from the URL, waits for the deck's ack.
//
// The order is also kept in this browser (local), so ordering on the same laptop works offline.
// Only drink choices and the typed name are sent (public relay, so nothing private).
(function () {
  const LOCAL_KEY = "cue_orders_local";
  const LIVE_KEY = "cue_order_live";
  const MANUAL_KEY = "cue_order_manual";
  const DECK_ROOM_KEY = "cue_order_room";
  const JOIN_ROOM_KEY = "cue_order_join";

  const get = (k, store = localStorage) => { try { return store.getItem(k); } catch { return null; } };
  const set = (k, v, store = localStorage) => { try { v == null ? store.removeItem(k) : store.setItem(k, v); } catch {} };
  const readJSON = (k, d) => { try { return JSON.parse(get(k) || "null") ?? d; } catch { return d; } };
  const readLocal = () => readJSON(LOCAL_KEY, []);

  // The room the phone should send to: ?room= in the URL, remembered while the app is open.
  function joinRoom() {
    const q = new URLSearchParams(location.search).get("room");
    if (q && /^[A-Z0-9]{5}$/i.test(q)) { set(JOIN_ROOM_KEY, q.toUpperCase(), sessionStorage); return q.toUpperCase(); }
    return get(JOIN_ROOM_KEY, sessionStorage) || "";
  }
  const wait = (ms) => new Promise(r => setTimeout(r, ms));

  window.CueOrders = {
    /** Deck side: this deck's order room (kept across reloads so the QR on screen stays valid). */
    room() {
      let r = get(DECK_ROOM_KEY);
      if (!r && window.CueRelay) { r = CueRelay.code(); set(DECK_ROOM_KEY, r); }
      return r || "";
    },
    /** Phone side: the room this order app is linked to ("" if opened without the slide QR). */
    joinRoom,
    linked: () => !!joinRoom(),

    /** Deck side: receive orders live. cb(order) runs for each new order. */
    listen(cb) {
      if (!window.CueRelay || this._relay) return;
      const r = this._relay = CueRelay.open(this.room(), (type, data) => {
        if (type !== "order" || !data || !data.id) return;
        r.send("ack", { id: data.id });
        const prev = readJSON(LIVE_KEY, null);
        if (prev && prev.id === data.id) return;          // retained copy of an order we already have
        set(LIVE_KEY, JSON.stringify(data));
        cb && cb(data);
      });
    },

    /** Phone side: send an order. Returns {ok, where: "stage"|"sent"|"local", order}. */
    async submit(order) {
      order = { id: "o" + Date.now().toString(36), at: new Date().toISOString(), ...order };
      set(LOCAL_KEY, JSON.stringify([...readLocal(), order]));
      const room = joinRoom();
      if (!room || !window.CueRelay) return { ok: true, where: "local", order };
      let acked = false;
      const r = CueRelay.open(room, (type, data) => { if (type === "ack" && data && data.id === order.id) acked = true; });
      for (let i = 0; i < 25 && !r.online; i++) await wait(200);   // up to 5 s to reach a relay
      const sent = r.online > 0;
      r.send("order", order, { retain: true });                    // retained: a deck that reloads still gets it
      for (let i = 0; i < 20 && !acked; i++) { await wait(200); if (i === 9 && !acked) r.send("order", order, { retain: true }); }
      setTimeout(() => r.close(), 1500);
      return { ok: true, where: acked ? "stage" : sent ? "sent" : "local", order };
    },

    /** Latest order: typed by hand > live from a phone > this browser > example. Never throws. */
    async latest() {
      const m = readJSON(MANUAL_KEY, null); if (m) return { ...m, source: "manual" };
      const live = readJSON(LIVE_KEY, null); if (live) return { ...live, source: "live" };
      const local = readLocal();
      if (local.length) return { ...local[local.length - 1], source: "local" };
      return { ...window.CONTENT.menu.exampleOrder, source: "example" };
    },
    setManual(order) { set(MANUAL_KEY, order ? JSON.stringify(order) : null); },
    /** Start fresh before the real talk: forget every order on this computer and use a new room
     *  (so a rehearsal order retained on the relay can't come back). The slide QR changes too. */
    reset() {
      [LIVE_KEY, MANUAL_KEY, LOCAL_KEY, DECK_ROOM_KEY].forEach(k => set(k, null));
      if (this._relay) { this._relay.close(); this._relay = null; }
    }
  };
})();
