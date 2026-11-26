// Order storage via the GitHub Contents API (same pattern as strategy-in-the-news).
// Writes need a fine-grained token saved on the ordering phone (localStorage "sprout_gh_token").
// Reads are public (unauthenticated API, 60/hour) — no page reload, just fetch().
(function () {
  const cfg = () => window.CONTENT.brand.repo;
  const TOKEN_KEY = "sprout_gh_token";
  const LOCAL_KEY = "sprout_orders_local";
  const MANUAL_KEY = "sprout_order_manual";
  const apiUrl = () => `https://api.github.com/repos/${cfg().owner}/${cfg().name}/contents/${cfg().path}?ref=${cfg().branch}`;
  const configured = () => cfg().owner && !cfg().owner.startsWith("YOUR-");

  const b64decode = (s) => decodeURIComponent(escape(atob(s.replace(/\n/g, ""))));
  const b64encode = (s) => btoa(unescape(encodeURIComponent(s)));

  function readLocal() { try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]"); } catch { return []; } }
  function writeLocal(list) { try { localStorage.setItem(LOCAL_KEY, JSON.stringify(list)); } catch {} }

  async function fetchRemote(token) {
    const headers = { Accept: "application/vnd.github+json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(apiUrl() + "&t=" + Date.now(), { headers, cache: "no-store" });
    if (!res.ok) throw new Error("GitHub " + res.status);
    const json = await res.json();
    return { sha: json.sha, orders: JSON.parse(b64decode(json.content) || "[]") };
  }

  window.SproutOrders = {
    getToken() { try { return localStorage.getItem(TOKEN_KEY) || ""; } catch { return ""; } },
    setToken(t) { try { localStorage.setItem(TOKEN_KEY, t.trim()); } catch {} },
    configured,

    /** Save an order. Returns {ok, where: "github"|"local", error?} */
    async submit(order) {
      order = { id: "o" + Date.now().toString(36), at: new Date().toISOString(), ...order };
      writeLocal([...readLocal(), order]);
      const token = this.getToken();
      if (!configured() || !token) return { ok: true, where: "local", order };
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const { sha, orders } = await fetchRemote(token);
          orders.push(order);
          const res = await fetch(apiUrl().split("?")[0], {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
            body: JSON.stringify({ message: `Order from ${order.name}`, content: b64encode(JSON.stringify(orders, null, 2)), sha, branch: cfg().branch })
          });
          if (res.ok) return { ok: true, where: "github", order };
          if (res.status !== 409) throw new Error("PUT " + res.status);
        } catch (e) { if (attempt === 2) return { ok: true, where: "local", order, error: String(e) }; }
      }
      return { ok: true, where: "local", order };
    },

    /** Latest order: manual override > GitHub > this browser > example. Never throws. */
    async latest() {
      try { const m = JSON.parse(localStorage.getItem(MANUAL_KEY) || "null"); if (m) return { ...m, source: "manual" }; } catch {}
      if (configured()) {
        try { const { orders } = await fetchRemote(); if (orders.length) return { ...orders[orders.length - 1], source: "github" }; } catch (e) { console.warn("[orders]", e); }
      }
      const local = readLocal();
      if (local.length) return { ...local[local.length - 1], source: "local" };
      return { ...window.CONTENT.menu.exampleOrder, source: "example" };
    },
    setManual(order) { try { order ? localStorage.setItem(MANUAL_KEY, JSON.stringify(order)) : localStorage.removeItem(MANUAL_KEY); } catch {} }
  };
})();
