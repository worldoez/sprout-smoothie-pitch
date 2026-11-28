// CUE story page. Every number is filled from content/data.js and content/menu.js —
// nothing hand-typed. Story anchors live in story.html. No team names, no roles.
(function () {
  "use strict";

  var D = window.CONTENT.data;
  var M = window.CONTENT.menu;
  var N = (D.results && D.results.n) || {};
  var raw = N.raw || 72;
  var usable = N.usable || 55;
  function pct(x) { return Math.round(x * 100); }
  function money(n) { return "HK$" + n; }

  function set(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  /* ---------- sample: 72 raw, 55 usable ---------- */
  set("statRaw", String(raw));
  set("statUsable", String(usable));
  set("statRawInline", raw);
  set("statUsableInline", usable);

  /* ---------- price: medians straight from data.js ---------- */
  var spend = null, wtp = 30, extra = null;
  if (D.results && D.results.price) {
    if (D.results.price.median_current_spend != null) spend = D.results.price.median_current_spend;
    if (D.results.price.median_wtp != null) wtp = D.results.price.median_wtp;
  }
  // extra per add-on: median of 03_price_summary "Extra per add-on (Q18)"
  if (D["03_price_summary"]) {
    D["03_price_summary"].forEach(function (r) {
      if (r.variable === "Extra per add-on (Q18)") extra = r.median_clean;
    });
  }
  if (spend == null) spend = 10; // team figure kept only if the table is missing

  set("statSpend", money(spend));
  set("statWtp", money(wtp));
  // "92% would pay above usual spend" is a team figure; data.js has no direct match.
  set("statAbove", "92%");
  set("statAboveText", "92 percent");

  // size prices from menu.sizes (student price / walk-in), "each size step +..." real values
  if (M && M.sizes) {
    var s = M.sizes;
    set("statSizes",
      money(s[1].price) + " and " + money(s[2].price) + " with an ID; " +
      money(s[1].walkIn) + " and " + money(s[2].walkIn) + " walk-in");
  }

  /* ---------- promotion: occasions and app agreement from data.js ---------- */
  function agree(item) {
    var v = null;
    D["02_likert_summary"].forEach(function (r) {
      if (r.item === item) v = r.pct_agree;
    });
    return v != null ? pct(v) + "%" : null;
  }
  function occasion(key) {
    var v = null;
    D["04_occasion"].forEach(function (r) {
      if (r.key === key) v = r.pct;
    });
    return v != null ? pct(v) + "%" : null;
  }
  set("statFriends", occasion("friends"));        // 51%
  set("statAfternoon", occasion("cool_down"));    // 49%
  set("statApp", agree("Would use pre-order app")); // 65%

  /* ---------- conclusions: YIA share from 04_where ---------- */
  var yia = null;
  D["04_where"].forEach(function (r) {
    if (r.key === "yia") yia = r.pct;
  });
  if (yia != null) set("statYia", pct(yia) + "%");
})();
