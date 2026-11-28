// CUE menu page. Renders the collections, the size-price table, the extras panel,
// the mix-your-own panel and the background info blocks from content/menu.js.
// Images: ONLY drinks with an `image` field get a picture (Berry Dusk, Banana Boost,
// Matcha Banana). Everything else renders text-only, full width. No per-drink prices.
(function () {
  "use strict";

  var M = window.CONTENT.menu;
  var D = window.CONTENT.data;
  function pct(x) { return Math.round(x * 100); }

  function el(id) { return document.getElementById(id); }

  /* ---------- drink rows ---------- */
  function drinkRow(d) {
    var img = d.image
      ? '<img class="row-img" src="../' + d.image + '" alt="CUE cup of the ' + d.name + ' smoothie" loading="lazy">'
      : ""; // no image field = no thumbnail at all, no placeholder
    return '<li class="menu-row' + (d.image ? "" : " row-noimg") + '">' + img +
      '<div class="row-body">' +
      '<div class="row-main">' +
      '<span class="row-name">' + d.name + (d.signature ? ' <span class="sig-pill">Signature</span>' : "") + "</span>" +
      "</div>" +
      '<p class="row-desc">' + d.desc + "</p>" +
      "</div></li>";
  }

  /* ---------- the three collections ---------- */
  var board = M.sections.map(function (sec) {
    var rows = M.drinks.filter(function (d) { return d.section === sec.title; });
    return '<section class="menu-sec" id="' + sec.key + '">' +
      '<div class="menu-sec-head"><h2 class="menu-sec-title">' + sec.title + "</h2></div>" +
      '<ul class="menu-list">' + rows.map(drinkRow).join("") + "</ul>" +
      "</section>";
  }).join("");

  /* ---------- size table: two price rows, three cup columns, straight from menu.sizes ---------- */
  var table = '<section class="menu-sec" id="sizes">' +
    '<div class="menu-sec-head"><h2 class="menu-sec-title">Cup sizes and prices</h2></div>' +
    '<p class="panel-lede">Pick your cup — the price follows the size, not the drink.</p>' +
    '<div class="table-scroll"><table class="size-table">' +
    "<thead><tr><th scope=\"col\">Cup</th>" +
    M.sizes.map(function (s) { return '<th scope="col">' + s.name + " " + s.oz + " oz</th>"; }).join("") +
    "</tr></thead><tbody>" +
    '<tr><th scope="row">CUHK students with student ID</th>' +
    M.sizes.map(function (s) { return '<td class="row-price">HK$' + s.price + "</td>"; }).join("") + "</tr>" +
    '<tr><th scope="row">Everyone else</th>' +
    M.sizes.map(function (s) { return '<td class="row-price">HK$' + s.walkIn + "</td>"; }).join("") + "</tr>" +
    "</tbody></table></div></section>";

  /* ---------- extras panel: first one free, then HK$5 ---------- */
  var extras = '<section class="menu-sec" id="extras">' +
    '<div class="menu-sec-head"><h2 class="menu-sec-title">Extras — first one free, then HK$5 each</h2></div>' +
    '<p class="panel-lede">One extra comes with every drink. Add a second for HK$5.</p>' +
    '<ul class="extra-list">' +
    M.addons.map(function (a) {
      return '<li class="extra"><span class="row-name">' + a.name + "</span>" +
        '<span class="row-dots" aria-hidden="true"></span>' +
        '<span class="extra-what">' + a.what + "</span></li>";
    }).join("") +
    "</ul></section>";

  /* ---------- mix your own: 1–2 fruits, 1 base ---------- */
  var mix = '<section class="mix-panel" id="mix">' +
    '<h2 class="menu-sec-title">Mix your own</h2>' +
    '<ul class="mix-rules">' +
    "<li>Pick 1–" + M.maxFruits + " fruits <em>" +
    M.fruits.map(function (f) { return f.name; }).join(", ") + "</em></li>" +
    "<li>Pick 1 base <em>" +
    M.bases.map(function (b) { return b.name; }).join(", ") + "</em></li>" +
    "<li>Prices follow the cup sizes above</li>" +
    "</ul>" +
    '<a class="btn mix-btn" href="../order/index.html">Mix it in the order app</a>' +
    "</section>";

  /* ---------- background info blocks ---------- */
  var mango = M.fruits.filter(function (f) { return f.key === "mango"; })[0];
  var strawb = M.fruits.filter(function (f) { return f.key === "strawberry"; })[0];

  var info =
    '<section class="info-block" id="collections">' +
    "<h2>Flavors for different campus occasions</h2>" +
    '<p>CUE offers three collections. <strong>Golden Hour</strong> is the signature show — visible layers of fruit puree, creamy bases and slush. <strong>Fruit Classics</strong> are familiar combinations: an easy first order and dependable repeats. <strong>Morning Blends</strong> bring matcha, coffee and oats for a pre-class pickup.</p>' +
    "</section>" +
    '<section class="info-block" id="insight">' +
    "<h2>From the survey</h2>" +
    "<p>Mango (<strong>" + pct(mango.pct) + "%</strong>) and strawberry (<strong>" + pct(strawb.pct) + "%</strong>) were the two most selected fruits of the " +
    ((D.results.n && D.results.n.usable) || 55) + " usable respondents. Both anchor <strong>Mango Sunrise</strong>, the signature blend.</p>" +
    "</section>" +
    '<section class="info-block" id="packaging">' +
    "<h2>Packaging</h2>" +
    "<p>Clear cups that show the drink, in three sizes (<strong>" + pct(M.sizeEvidence.pct) + "%</strong> of respondents wanted a choice of cup sizes). Striped straws and vintage CUE labels. Kraft paper bags with fruit illustrations and a ticket-shaped tag for takeaway.</p>" +
    "</section>";

  el("menuBoard").innerHTML = board + table + extras + mix + info;
})();
