/* Sprout site. Reads CONTENT.brand / CONTENT.menu / CONTENT.data and SproutArt.
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
  var intentPct = pct(D.results.intent.top2);                                  // 70
  var mango = D["04_fruit"].filter(function (f) { return f.key === "mango"; })[0] || D["04_fruit"][0];
  var price25 = D["03_candidate_prices"].filter(function (r) { return r.price === 25; })[0] || D["03_candidate_prices"][0];
  var appAgree = 0;
  D["02_likert_summary"].forEach(function (r) {
    if (r.item === "Would use pre-order app") appAgree = r.pct_agree;
  });

  /* ---------- page copy ---------- */
  document.title = B.name + " — " + B.slogan;
  function splitLogo(el) {
    el.innerHTML = B.name.length > 1
      ? B.name.slice(0, -1) + "<i>" + B.name.slice(-1) + "</i>"
      : B.name;
  }
  $("#heroTitle").textContent = B.name; // title stays plain text, logo colouring lives in the nav
  $("#heroSlogan").textContent = B.slogan;
  $("#heroTagline").textContent = B.tagline;
  $("#surveyTitle").textContent = "See the survey we ran";
  splitLogo($(".nav-logo"));
  splitLogo($(".foot-logo"));

  /* ---------- survey numbers (markup already carries the finals; JS counts them up) ---------- */
  var badges = { nIntent: intentPct, nMango: pct(mango.pct), nPrice: pct(price25.share), nApp: pct(appAgree) };
  Object.keys(badges).forEach(function (id) {
    var el = document.getElementById(id);
    if (el) { el.setAttribute("data-final", badges[id]); el.textContent = String(badges[id]); }
  });
  $("#factsSrc").textContent = "53 usable responses, harvested " + D.results.generated +
    ". Purchase intent Q31, fruit Q25, price Q29, pre-order app Q19.";

  /* ---------- drink colours ---------- */
  function rgb(hex) {
    var h = hex.replace("#", "");
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16)
    };
  }
  function inkText(hex) { // WCAG-ish luminance: pick ink or cream for readable type on a tile
    var c = rgb(hex);
    var l = (0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b) / 255;
    return l > 0.62 ? "#2A1A10" : "#FFF4E2";
  }

  function fruit(key) { return M.fruits.filter(function (f) { return f.key === key; })[0]; }
  function baseName(key) {
    var b = M.bases.filter(function (x) { return x.key === key; })[0];
    return b ? b.name : key;
  }

  /* Signature lineup: exactly the five drinks the team named. Cup colours come
     from CONTENT.menu.fruits, base names from CONTENT.menu.bases. */
  var DRINKS = [
    { name: "Mango Sunrise", fruits: ["mango", "strawberry"], base: "yogurt", label: "Sunrise" },
    { name: "Berry Blush",   fruits: ["strawberry", "blueberry"], base: "fresh_milk", label: "Blush" },
    { name: "Banana Boost",  fruits: ["banana", "mango"], base: "fresh_milk", label: "Boost", boost: "Muscle Sprout" },
    { name: "Peach Breeze",  fruits: ["peach", "mango"], base: "juice", label: "Breeze" },
    { name: "Blue Moon",     fruits: ["blueberry", "banana"], base: "yogurt", label: "Moon" }
  ];
  var priceFrom = (M.sizes.filter(function (s) { return s.key === "M"; })[0] || M.sizes[0]).price; // 25

  /* ---------- hero: huge cup + Mo + fruit chunks ---------- */
  $("#heroCup").innerHTML = SproutArt.cup({ label: B.name });
  $("#heroMo").innerHTML = SproutArt.mascot(); // no cup in hand: both arms free, one waves

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
      '<circle cx="50" cy="50" r="42" fill="' + f.color + '" stroke="#2A1A10" stroke-width="8"/>' +
      '<ellipse cx="38" cy="36" rx="11" ry="6" fill="#FFF" opacity=".6" transform="rotate(-28 38 36)"/>' +
      '<path d="M30 64 Q50 76 70 64" fill="none" stroke="rgba(42,26,16,.35)" stroke-width="6" stroke-linecap="round"/>' +
      "</svg>";
    fruitHolder.appendChild(span);
  });

  /* ---------- menu: signature drink tiles ---------- */
  var grid = $("#drinkGrid");
  grid.innerHTML = DRINKS.map(function (d) {
    var a = fruit(d.fruits[0]) || { name: d.fruits[0], color: "#FFB020" };
    var b = fruit(d.fruits[1]) || { name: d.fruits[1], color: "#E8364F" };
    var tile = a.color;
    var text = inkText(tile);
    var lines = b.name + " + " + a.name;
    var boost = d.boost ? '<span class="drink-boost">' + d.boost + " +$5</span>" : "";
    return (
      '<article class="drink" style="background:' + tile + ";color:" + text + '">' +
      '<div class="drink-cup">' + SproutArt.cup({ colorA: a.color, colorB: b.color, label: d.label }) + "</div>" +
      '<h3 class="drink-name display">' + d.name + "</h3>" +
      '<p class="drink-line">' + lines + "</p>" +
      '<p class="drink-base">' + baseName(d.base) + " base</p>" +
      '<p class="drink-foot"><span class="drink-price display">From HK$' + priceFrom + "</span>" + boost + "</p>" +
      "</article>"
    );
  }).join("");

  /* ---------- menu: build your own ---------- */
  $("#byoFruits").innerHTML = M.fruits.map(function (f) {
    return '<li><span class="fruit-dot" style="--dot:' + f.color + '" aria-hidden="true"></span>' +
      "<span>" + f.name + "</span><em>" + pct(f.pct) + "% picked it</em></li>";
  }).join("");

  $("#byoBases").innerHTML = M.bases.map(function (b) {
    return "<li><span>" + b.name + "</span><span>" + pct(b.pct) + "% picked it</span></li>";
  }).join("");

  $("#byoSizes").innerHTML = M.sizes.map(function (s) {
    return "<li><span>" + s.name + "</span><span>" + s.ml + " ml, HK$" + s.price + "</span></li>";
  }).join("");
  $("#byoNote").textContent = "Mix it on your phone in the order app — the cup shows your blend as you build.";

  /* ---------- menu: boosters ---------- */
  $("#boosterList").innerHTML = M.addons.map(function (a) {
    return "<li><span class=\"b-name\">" + a.fancy + "</span>" +
      '<span class="b-plain">' + a.name + "</span>" +
      '<span class="b-dots" aria-hidden="true"></span>' +
      '<span class="b-price">+$' + a.price + "</span></li>";
  }).join("");
  $("#boosterNote").textContent = "Up to two boosters per cup. " + pct(M.sizeEvidence.pct) + "% of the survey asked for a size choice too.";

  /* ---------- tabs (arrow keys, roving tabindex) ---------- */
  var tabs = $all('[role="tab"]');
  function selectTab(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute("aria-controls"));
      if (panel) panel.hidden = !on;
    });
    tab.focus();
  }
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () { selectTab(tab); });
    tab.addEventListener("keydown", function (e) {
      var i = tabs.indexOf(tab), next = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next = tabs[(i + 1) % tabs.length];
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === "Home") next = tabs[0];
      else if (e.key === "End") next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); selectTab(next); }
    });
  });

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
