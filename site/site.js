// CUE home page. Reads CONTENT.brand / CONTENT.menu / CONTENT.data and CueArt.
// Works from file:// : classic script, no fetch, no modules. No GSAP — the only
// entrance is a 400 ms CSS fade on the hero, disabled under reduced motion.
// Nav and footer come from chrome.js; this file is home-page-only.
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
  $("#heroSlogan").textContent = B.slogan;
  $("#heroTagline").textContent = B.tagline;

  /* ---------- facts: markup carries the finals; JS counts them up ---------- */
  var badges = { nIntent: intentPct, nMango: pct(mango.pct), nPrice: pct(price25.share), nApp: pct(appAgree) };
  Object.keys(badges).forEach(function (id) {
    var el = document.getElementById(id);
    if (el) { el.setAttribute("data-final", badges[id]); el.textContent = String(badges[id]); }
  });
  $("#factsSrc").textContent = ((D.results.n && D.results.n.usable) || 55) + " usable responses, harvested " + D.results.generated +
    ". Purchase intent Q31, fruit Q25, price Q29, pre-order app Q19.";

  /* ---------- mascot: Cuethie waves, no jellying filter, no cup in hand ---------- */
  function putMonkey(sel) {
    $all(sel).forEach(function (el) {
      if (window.CueArt) el.innerHTML = CueArt.mascot({ wave: true, boil: false });
    });
  }
  putMonkey(".hero-mo");
  putMonkey(".order-band-mo");

  /* ---------- menu teaser: the signature drink, straight from menu.js ---------- */
  var sig = M.drinks.filter(function (d) { return d.signature; })[0] || M.drinks[0];
  var strawberry = D["04_fruit"].filter(function (f) { return f.key === "strawberry"; })[0];
  if (sig && $("#teaserSig")) {
    $("#teaserSig").innerHTML =
      '<p class="row-main"><span class="row-name">' + sig.name +
      (sig.signature ? ' <span class="sig-pill">Signature</span>' : "") + "</span></p>" +
      '<p class="teaser-desc">' + sig.desc + "</p>" +
      '<p class="teaser-note">Mango (<strong>' + pct(mango.pct) + "%</strong>) and strawberry (<strong>" +
      pct(strawberry ? strawberry.pct : 0) + "%</strong>) were the two fruits most picked in the survey.</p>";
  }

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
