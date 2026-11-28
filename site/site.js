/* CUE site. Reads CONTENT.brand / CONTENT.menu / CONTENT.data and CueArt.
   Works from file:// : classic script, no fetch, no modules. GSAP is optional —
   every animated element starts at its final state, so the page is complete
   without it and unchanged under prefers-reduced-motion. */
(function () {
  "use strict";

  var B = window.CONTENT.brand;
  var M = window.CONTENT.menu;
  var D = window.CONTENT.data;

  var reduce = false;
  try { reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
  var gsapOK = false;
  try { gsapOK = !reduce && typeof window.gsap === "function" && typeof window.ScrollTrigger === "object"; } catch (e) {}

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

  /* ---------- hero: huge cup + mascot + fruit chunks ---------- */
  $("#heroCup").innerHTML = CueArt.cup({ label: B.name });
  $("#heroMo").innerHTML = CueArt.mascot(); // no cup in hand: both arms free, one waves

  var chunkPos = [
    { left: "6%",  top: "18%", size: 54 },
    { left: "20%", top: "4%",  size: 40 },
    { left: "76%", top: "10%", size: 46 },
    { left: "88%", top: "38%", size: 60 },
    { left: "10%", top: "58%", size: 34 }
  ];
  var fruitHolder = $("#heroFruits");
  M.fruits.forEach(function (f, i) {
    var pos = chunkPos[i % chunkPos.length];
    var span = document.createElement("span");
    span.style.left = pos.left;
    span.style.top = pos.top;
    span.innerHTML =
      '<svg width="' + pos.size + '" height="' + pos.size + '" viewBox="0 0 100 100">' +
      '<circle cx="50" cy="50" r="42" fill="' + f.color + '" stroke="#25292B" stroke-width="8"/>' +
      '<ellipse cx="38" cy="36" rx="11" ry="6" fill="#FFF" opacity=".6" transform="rotate(-28 38 36)"/>' +
      '<path d="M30 64 Q50 76 70 64" fill="none" stroke="rgba(37, 41, 43,.35)" stroke-width="6" stroke-linecap="round"/>' +
      "</svg>";
    fruitHolder.appendChild(span);
  });

  /* ---------- menu board, rendered from content/menu.js ---------- */
  function sectionPrice(sec) {
    // Morning Blends have no confirmed price: "TBC", never a number.
    return sec.price != null ? "HK$" + sec.price : "TBC";
  }
  function sectionMeta(sec) {
    return sec.price != null ? "HK$" + sec.price : "price " + sec.priceText;
  }
  function drinkRow(d, sec) {
    return '<li class="menu-row">' +
      '<div class="row-main">' +
      '<span class="row-name">' + d.name + (d.signature ? ' <span class="sig-pill">Signature</span>' : "") + "</span>" +
      '<span class="row-dots" aria-hidden="true"></span>' +
      '<span class="row-price">' + sectionPrice(sec) + "</span>" +
      "</div>" +
      '<p class="row-desc">' + d.desc + "</p>" +
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
      '<a class="btn leaf mix-btn" href="../order/index.html">Mix it in the order app</a>' +
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

  /* ---------- hero load: cup pops, Mo slides in, copy follows (one timeline only) ---------- */
  function heroMoment() {
    if (!gsapOK) return; // final states are already in the markup
    try {
      var tl = window.gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from("#heroCup", { y: 36, scale: 0.9, opacity: 0, duration: 0.6 })
        .from(".hero-halo", { scale: 0.7, opacity: 0, duration: 0.5, transformOrigin: "50% 100%" }, "-=0.35")
        .from("#heroFruits svg", { y: 20, opacity: 0, duration: 0.4, stagger: 0.06 }, "-=0.3")
        .from("#heroMo", { x: 60, y: 30, rotation: 10, opacity: 0, duration: 0.5, ease: "back.out(1.7)" }, "-=0.35")
        .from("#heroTitle", { y: 26, opacity: 0, duration: 0.5 }, "-=0.4")
        .from(["#heroSlogan", "#heroTagline"], { y: 16, opacity: 0, duration: 0.45, stagger: 0.09 }, "-=0.3")
        .from("#heroBtns a", { y: 12, opacity: 0, duration: 0.4, stagger: 0.07 }, "-=0.25");
    } catch (e) { /* leave final states */ }
  }

  function init() { heroMoment(); }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
