/* CUE site. Reads CONTENT.brand / CONTENT.menu / CONTENT.data and CueArt.
   Works from file:// : classic script, no fetch, no modules. No GSAP — the only
   entrance is a 400 ms CSS fade on the hero, disabled under reduced motion. */
(function () {
  "use strict";

  var B = window.CONTENT.brand;
  var M = window.CONTENT.menu;
  var D = window.CONTENT.data;

  var reduce = false;
  try { reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function pct(x) { return Math.round(x * 100); }

  /* ---------- real numbers, straight from the generated tables ---------- */
  var intentPct = pct(D.results.intent.top2);                                  // 69
  var mango = D["04_fruit"].filter(function (f) { return f.key === "mango"; })[0] || D["04_fruit"][0];
  var price25 = D["03_candidate_prices"].filter(function (r) { return r.price === 25; })[0] || D["03_candidate_prices"][0];
  var appAgree = 0;
  D["02_likert_summary"].forEach(function (r) {
    if (r.item === "Would use pre-order app") appAgree = r.pct_agree;
  });

  /* ---------- page copy ---------- */
  document.title = B.name + " — " + B.slogan;
  // Brand marks: the sticker image carries the logo; .bm-text is the fallback
  // (shown only when the image fails to load) and the accessible name.
  $all(".bm-text").forEach(function (el) { el.textContent = B.name; });
  $("#heroSlogan").textContent = B.slogan;
  $("#heroTagline").textContent = B.tagline;
  $("#surveyTitle").textContent = "See the survey we ran";

  /* ---------- survey numbers (markup already carries the finals; JS counts them up) ---------- */
  var badges = { nIntent: intentPct, nMango: pct(mango.pct), nPrice: pct(price25.share), nApp: pct(appAgree) };
  Object.keys(badges).forEach(function (id) {
    var el = document.getElementById(id);
    if (el) { el.setAttribute("data-final", badges[id]); el.textContent = String(badges[id]); }
  });
  $("#factsSrc").textContent = ((D.results.n && D.results.n.usable) || 55) + " usable responses, harvested " + D.results.generated +
    ". Purchase intent Q31, fruit Q25, price Q29, pre-order app Q19.";

  /* ---------- hero: Cuethie, no cup in hand, just standing with the cups ---------- */
  var heroMo = $("#heroMo");
  if (heroMo && window.CueArt) heroMo.innerHTML = CueArt.mascot();

  /* ---------- menu board, rendered from content/menu.js ----------
     Each named drink shows its render beside the row. drinkImage returns a path
     relative to the PRESENTATION root, so pages in /site/ prefix "../". */
  function renderSrc(d) {
    var p = window.CONTENT.drinkImage(d);
    return p.indexOf("assets/") === 0 ? "../" + p : p;
  }
  function renderAlt(d) {
    return (d.fruits && d.fruits.length) ? "CUE cup of the " + d.name + " smoothie" : "CUE logo sticker cup";
  }
  function sectionPrice(sec) {
    // Morning Blends have no confirmed price: "TBC", never a number.
    return sec.price != null ? "HK$" + sec.price : "TBC";
  }
  function sectionMeta(sec) {
    return sec.price != null ? "HK$" + sec.price : "price " + sec.priceText;
  }
  function drinkRow(d, sec) {
    var img = window.CONTENT.drinkImage(d);
    var imgCls = "row-img" + (img.indexOf("cue-logo") > -1 ? " row-logo" : "");
    return '<li class="menu-row">' +
      '<img class="' + imgCls + '" src="' + renderSrc(d) + '" alt="' + renderAlt(d) + '" loading="lazy">' +
      '<div class="row-body">' +
      '<div class="row-main">' +
      '<span class="row-name">' + d.name + (d.signature ? ' <span class="sig-pill">Signature</span>' : "") + "</span>" +
      '<span class="row-dots" aria-hidden="true"></span>' +
      '<span class="row-price">' + sectionPrice(sec) + "</span>" +
      "</div>" +
      '<p class="row-desc">' + d.desc + "</p>" +
      "</div>" +
      "</li>";
  }
  function mixPanel() {
    var fruits = M.fruits.map(function (f) { return f.name.toLowerCase(); }).join(", ");
    var bases = M.bases.map(function (b) { return b.name.toLowerCase(); }).join(", ");
    var boosts = M.addons.map(function (a) { return a.name.toLowerCase(); }).join(", ");
    return '<section class="mix-panel">' +
      '<h3 class="menu-sec-title">Mix your own</h3>' +
      '<ul class="mix-rules">' +
      "<li>Pick 1–" + M.maxFruits + " fruits <em>" + fruits + "</em></li>" +
      "<li>Pick 1 base <em>" + bases + "</em></li>" +
      "<li>Up to " + M.maxAddons + " boosts <em>" + boosts + "</em></li>" +
      "<li>Each boost <em>+HK$5</em></li>" +
      "</ul>" +
      '<ul class="mix-sizes">' + M.sizes.map(function (s) {
        return "<li><span>" + s.name + '</span><span class="row-price">HK$' + s.price + "</span></li>";
      }).join("") + "</ul>" +
      '<a class="btn mix-btn" href="../order/index.html">Mix it in the order app</a>' +
      "</section>";
  }
  $("#menuBoard").innerHTML = M.sections.map(function (sec) {
    var rows = M.drinks.filter(function (d) { return d.section === sec.title; });
    return '<section class="menu-sec">' +
      '<div class="menu-sec-head">' +
      '<h3 class="menu-sec-title">' + sec.title + (sec.ml ? '<span class="menu-sec-ml">' + sec.ml + " ml</span>" : "") + "</h3>" +
      '<span class="menu-sec-meta">' + sectionMeta(sec) + "</span>" +
      "</div>" +
      '<ul class="menu-list">' + rows.map(function (d) { return drinkRow(d, sec); }).join("") + "</ul>" +
      "</section>";
  }).join("") + mixPanel();
  $("#menuFoot").textContent = M.pickupLine;
  $("#footPickup").textContent = M.pickupLine;

  /* ---------- count-up on scroll; finals already in the markup ---------- */
  var ioOK = typeof IntersectionObserver === "function";
  function countTo(el) {
    var end = parseFloat(el.getAttribute("data-final"));
    if (reduce || !isFinite(end)) return;    // reduced motion: keep the final number
    var t0 = null, dur = 900;
    function frame(t) {
      if (t0 === null) t0 = t;
      var p = Math.min(1, (t - t0) / dur);
      p = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(end * p));
      if (p < 1) requestAnimationFrame(frame);
    }
    el.textContent = "0";
    requestAnimationFrame(frame);
  }
  if (ioOK) {
    var counted = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { counted.unobserve(en.target); countTo(en.target); }
      });
    }, { threshold: 0.6 });
    $all(".facts .num").forEach(function (el) { counted.observe(el); });
  }
})();
