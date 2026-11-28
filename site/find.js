// CUE find-us page. A real Leaflet map (CARTO light tiles) with one large straw-red
// pin for the CUE cart at YIA and small hairline dots for the other survey spots.
// If Leaflet or the tiles fail (offline / file:// without net), a tidy fallback card
// lists the places instead — never an empty box.
(function () {
  "use strict";

  var P = window.CONTENT.places;
  var D = window.CONTENT.data;
  var M = window.CONTENT.menu;

  function el(id) { return document.getElementById(id); }
  function pct(x) { return Math.round(x * 100); }

  /* ---------- pickup line, straight from menu.js ---------- */
  el("pickLineFallback").textContent = M.pickupLine;

  /* ---------- "Why YIA?" text with the real 04_where values ---------- */
  function whereRow(key) {
    var v = null;
    D["04_where"].forEach(function (r) { if (r.key === key) v = r; });
    return v;
  }
  (function whyYia() {
    var yia = whereRow("yia") || { pct: 0 };
    var cc = whereRow("cc") || { pct: 0 };
    var both = Math.max(pct(yia.pct), pct(cc.pct));
    el("whyYiaText").innerHTML =
      "Asked where on campus they would buy, respondents picked YIA (" +
      "<strong>" + pct(yia.pct) + "%</strong>) and the Central Campus teaching buildings (" +
      "<strong>" + pct(cc.pct) + "%</strong>) about evenly — each took roughly " + both +
      "% of the selections, ahead of every other location.";
  })();

  /* ---------- place ranking list ---------- */
  (function ranking() {
    var rows = D["04_where"].map(function (r) {
      return '<li class="rank-row">' +
        '<span class="rank-name">' + r.option + "</span>" +
        '<span class="rank-count">' + r.count + "</span>" +
        '<span class="rank-pct display">' + pct(r.pct) + "%</span>" +
        "</li>";
    }).join("");
    el("rankList").innerHTML = rows;
    el("rankSrc").textContent = "Survey Q33, " + D["04_where"][0].n_answered + " answers. " +
      D["04_where"][0].option + " got the most votes, and it is the nearer cart spot to the MTR station.";
  })();

  /* ---------- offline fallback: a tidy card, never an empty box ---------- */
  function showFallback(reason) {
    var map = el("map");
    if (map) map.setAttribute("hidden", "");
    el("mapBox").setAttribute("hidden", "");
    var fb = el("mapFallback");
    fb.removeAttribute("hidden");
    fb.querySelector(".find-line").textContent =
      "The map could not load " + reason + ". The places it was going to show:";
    el("fallbackList").innerHTML = P.spots.map(function (s) {
      return '<li class="rank-row"><span class="rank-name">' + s.name +
        (s.key === P.target ? " — CUE cart" : "") + "</span></li>";
    }).join("");
  }

  if (typeof window.L === "undefined") { showFallback("offline"); return; }

  /* ---------- the map ---------- */
  var spots = P.spots;
  var midLat = spots.reduce(function (a, s) { return a + s.lat; }, 0) / spots.length;
  var midLng = spots.reduce(function (a, s) { return a + s.lng; }, 0) / spots.length;

  var map = L.map("map", {
    center: [midLat, midLng],
    zoom: 15,
    scrollWheelZoom: false           // page scroll must not be hijacked
  });

  var tilesOk = true;
  var tileLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
    attribution: "© OpenStreetMap contributors © CARTO",
    subdomains: "abcd",
    maxZoom: 19
  });
  var tileErrors = 0;
  tileLayer.on("tileerror", function () {
    tileErrors += 1;
    if (tileErrors >= 4 && tilesOk) { tilesOk = false; showFallback("offline"); }
  });
  tileLayer.addTo(map);
  map.on("click", function () { map.scrollWheelZoom.enable(); });
  map.on("mouseout", function () { map.scrollWheelZoom.disable(); });

  /* ---------- markers ---------- */
  function yiaIcon() {
    // Large straw-red teardrop with a permanent label, built as one divIcon.
    return L.divIcon({
      className: "cue-yia-icon",
      html:
        '<span class="yia-wrap">' +
        '<svg class="yia-pin" viewBox="0 0 32 44" aria-hidden="true">' +
        '<path d="M16 2C7.7 2 1 8.4 1 16.4 1 27 16 42 16 42S31 27 31 16.4C31 8.4 24.3 2 16 2Z"/>' +
        '<circle cx="16" cy="16" r="5.5"/></svg>' +
        '<span class="yia-label">CUE cart: YIA Building</span>' +
        "</span>",
      iconSize: [210, 46],
      iconAnchor: [16, 44]
    });
  }
  function dotIcon(spot) {
    var label = '<span class="dot-label dot-' + (spot.label || "right") + '">' + spot.name + "</span>";
    return L.divIcon({
      className: "cue-dot-icon",
      html: '<span class="dot"></span>' + label,
      iconSize: [0, 0]
    });
  }

  spots.forEach(function (s) {
    if (s.key === P.target) {
      L.marker([s.lat, s.lng], { icon: yiaIcon(), keyboard: true, title: "CUE cart: YIA Building" }).addTo(map);
    } else {
      L.marker([s.lat, s.lng], { icon: dotIcon(s), keyboard: true, title: s.name }).addTo(map);
    }
  });

  // Frame every spot.
  var lats = spots.map(function (s) { return s.lat; });
  var lngs = spots.map(function (s) { return s.lng; });
  try {
    map.fitBounds([[Math.min.apply(null, lats), Math.min.apply(null, lngs)],
                   [Math.max.apply(null, lats), Math.max.apply(null, lngs)]],
                  { padding: [90, 40], maxZoom: P.finalZoom || 16 });
  } catch (e) { /* keep the centre+zoom default */ }
})();
