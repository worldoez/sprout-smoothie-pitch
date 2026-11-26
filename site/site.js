/* Sprout launch page. Reads CONTENT.brand / CONTENT.menu / CONTENT.data and SproutArt.
   Works from file:// : classic script, no fetch. GSAP is optional — every animation
   starts from a final state that is complete without it. */
(function () {
  "use strict";

  var B = window.CONTENT.brand;
  var M = window.CONTENT.menu;
  var D = window.CONTENT.data;

  var reduce = false;
  try { reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
  var gsapOK = !reduce && typeof window.gsap === "function" && typeof window.ScrollTrigger === "object";
  if (gsapOK) { try { window.gsap.registerPlugin(window.ScrollTrigger); } catch (e) { gsapOK = false; } }

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function pct(x) { return Math.round(x * 100); }

  /* ---------- real numbers, straight from the generated tables ---------- */
  var intentPct = pct(D.results.intent.top2);                 // 70 % would buy
  var mango = D.results.fruit.filter(function (f) { return f.option === "Mango"; })[0] || D.results.fruit[0];
  var berry = D.results.fruit[1];
  var price25 = D["03_candidate_prices"].filter(function (r) { return r.price === 25; })[0] || D["03_candidate_prices"][0];
  var yia = D["04_where"].filter(function (r) { return r.key === "yia"; })[0] || D["04_where"][0];
  var appAgree = 0;
  D["02_likert_summary"].forEach(function (r) {
    if (r.item === "Would use pre-order app") appAgree = r.pct_agree;
  });

  /* ---------- hero copy ---------- */
  document.title = B.name + " — " + B.slogan;
  var title = $("#heroTitle");
  if (B.name.length > 1) title.innerHTML = B.name.slice(0, -1) + "<i>" + B.name.slice(-1) + "</i>";
  $("#heroSlogan").textContent = B.slogan;
  $("#heroTagline").textContent = B.tagline;

  $("#heroCup").innerHTML = SproutArt.cup({ label: B.name });
  $("#heroMo").innerHTML = SproutArt.mascot({ cup: false });
  $("#dropCup").innerHTML = SproutArt.cup({});

  /* ---------- facts ---------- */
  var nums = $all(".fact .num");
  var factTargets = [intentPct, pct(mango.pct), pct(price25.share)];
  nums.forEach(function (el, i) { el.setAttribute("data-count", factTargets[i]); });
  var strawPct = pct(berry.pct);
  $all("#factRow .inline-num").forEach(function (el) { el.setAttribute("data-count", strawPct); });
  $all("#find .inline-num").forEach(function (el) { el.setAttribute("data-count", pct(yia.pct)); });
  $all("#app .inline-num").forEach(function (el) { el.setAttribute("data-count", pct(appAgree)); });

  /* ---------- menu ---------- */
  var fruitList = $("#fruitList");
  fruitList.innerHTML = M.fruits.map(function (f) {
    return '<li class="fruit-li">' +
      '<span class="fruit-em" aria-hidden="true">' + f.emoji + "</span>" +
      '<span class="fruit-name">' + f.name + "</span>" +
      '<span class="fruit-bar"><span class="fruit-fill" data-w="' + pct(f.pct) + '" style="background:' + f.color + '"></span></span>' +
      '<span class="fruit-pct"><span class="inline-num" data-count="' + pct(f.pct) + '">0</span>% picked</span>' +
      "</li>";
  }).join("");

  $("#baseList").innerHTML = M.bases.map(function (b) {
    return '<li class="base-li">' + b.name + "<em>" + pct(b.pct) + "% picked</em></li>";
  }).join("");

  $("#boosterList").innerHTML = M.addons.map(function (a) {
    return '<li class="booster-li">' +
      '<span class="b-name">' + a.fancy + "</span>" +
      '<span class="b-plain">' + a.name + "</span>" +
      '<span class="b-dots" aria-hidden="true"></span>' +
      '<span class="b-price">+$' + a.price + "</span>" +
      "</li>";
  }).join("");

  $("#sizeList").innerHTML = M.sizes.map(function (s) {
    return '<li class="size-li"><big>' + s.name + "</big>" +
      '<span>' + s.ml + " ml &mdash; $" + s.price + "</span></li>";
  }).join("");

  /* ---------- where ranks ---------- */
  var whereTop = D["04_where"].slice(0, 4);
  $("#whereRanks").innerHTML = whereTop.map(function (w) {
    return '<li><span class="w-rank">' + pct(w.pct) + "%</span>" +
      '<span class="w-bar"><span class="fruit-fill" data-w="' + pct(w.pct) + '" style="background:var(--leaf)"></span></span>' +
      "<span>" + w.option + "</span></li>";
  }).join("");

  /* ---------- app phone ---------- */
  var ex = M.exampleOrder;
  var size = M.sizes.filter(function (s) { return s.key === ex.size; })[0] || M.sizes[0];
  var addSum = 0;
  var addNames = (ex.addons || []).map(function (k) {
    var a = M.addons.filter(function (x) { return x.key === k; })[0];
    if (a) addSum += a.price;
    return a ? a.fancy : k;
  });
  var fruitNames = (ex.fruits || []).map(function (k) {
    var f = M.fruits.filter(function (x) { return x.key === k; })[0];
    return f ? f.name : k;
  });
  $("#pDrinkName").textContent = ex.drinkName;
  $("#pDrinkMeta").textContent = fruitNames.join(" + ") + " — " +
    (M.bases.filter(function (b) { return b.key === ex.base; })[0] || { name: ex.base }).name +
    " — " + size.name + " " + size.ml + " ml";
  var steps = [
    "Pick your fruits &mdash; " + fruitNames.join(" + "),
    "Choose a base &mdash; " + (M.bases.filter(function (b) { return b.key === ex.base; })[0] || { name: ex.base }).name,
    (addNames.length ? "Add boosters &mdash; " + addNames.join(", ") + " (+$" + addSum + ")" : "No boosters"),
    "Pick a size &mdash; " + size.name + " " + size.ml + " ml",
    "Confirm &mdash; $" + ex.price
  ];
  $("#pSteps").innerHTML = steps.map(function (s) { return '<li class="p-step">' + s + "</li>"; }).join("");
  $("#pTicketNum").textContent = "Order #1";
  $("#pTicketNote").textContent = "Pick up at YIA — we blend when you arrive";

  $("#footLogo").innerHTML = B.name.length > 1 ?
    B.name.slice(0, -1) + "<i>" + B.name.slice(-1) + "</i>" : B.name;
  $("#footNote").textContent = B.slogan;

  /* ---------- count-up (no GSAP needed) ---------- */
  function countTo(el) {
    var end = parseFloat(el.getAttribute("data-count")) || 0;
    if (reduce || end === 0) { el.textContent = String(end); return; }
    var t0 = null, dur = 1000;
    function frame(t) {
      if (t0 === null) t0 = t;
      var p = Math.min(1, (t - t0) / dur);
      p = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(end * p));
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function fillBars(container) {
    $all(".fruit-fill[data-w]", container).forEach(function (el) {
      el.style.width = el.getAttribute("data-w") + "%";
    });
  }

  /* fallback: if IntersectionObserver is missing, show everything final */
  var ioOK = typeof IntersectionObserver === "function";
  function once(el, fn) {
    if (!ioOK || reduce) { fn(); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { io.disconnect(); fn(); }
      });
    }, { threshold: 0.35 });
    io.observe(el);
  }

  /* facts + percent labels + bars */
  $all(".inline-num").forEach(function (el, i) { once(el, function () { countTo(el); }); });
  once($("#factRow"), function () {
    $all(".fact .num").forEach(countTo);
  });
  once($("#fruitList"), function () { fillBars(fruitList); });
  once($("#whereRanks"), function () { fillBars($("#whereRanks")); });

  /* ---------- hero: the cup fills as the page loads, Mo peeks in ---------- */
  function heroMoment() {
    if (!gsapOK) return; // final states are already in the markup
    var fill = $("#heroCup .cup-fill");
    if (!fill) return;
    window.gsap.set(fill, { y: 130 });
    window.gsap.set("#heroMo", { x: 70, y: 26, rotation: 12, opacity: 0 });
    var tl = window.gsap.timeline();
    tl.to(fill, { y: 0, duration: 1.5, ease: "power3.out" })
      .to("#heroMo", { x: 0, y: 0, rotation: 5, opacity: 1, duration: 0.7, ease: "back.out(1.8)" }, "-=0.55")
      .from("#heroTitle", { y: 28, opacity: 0, duration: 0.6, ease: "power3.out" }, "-=0.5")
      .from(["#heroSlogan", "#heroTagline"], { y: 18, opacity: 0, duration: 0.5, ease: "power3.out", stagger: 0.1 }, "-=0.35")
      .from("#heroBtns a", { y: 14, opacity: 0, duration: 0.4, ease: "power3.out", stagger: 0.08 }, "-=0.25");
  }

  /* ---------- menu: the fruits drop into the cup ---------- */
  var CHIPS = [
    { k: "mango",      left: "22%", top: "30%" },
    { k: "strawberry", left: "38%", top: "20%" },
    { k: "banana",     left: "56%", top: "32%" },
    { k: "blueberry",  left: "28%", top: "19%" },
    { k: "peach",      left: "48%", top: "25%" }
  ];
  var dropStage = $("#dropStage");
  CHIPS.forEach(function (c) {
    var f = M.fruits.filter(function (x) { return x.key === c.k; })[0];
    var el = document.createElement("span");
    el.className = "chip";
    el.textContent = f ? f.emoji : "🍎";
    el.style.left = c.left;
    el.style.top = c.top;
    dropStage.appendChild(el);
  });

  function dropMoment() {
    if (!gsapOK) return;
    var chips = $all(".chip", dropStage);
    window.gsap.set(chips, { y: -230, rotation: -16, opacity: 0 });
    ScrollTrigger.create({
      trigger: dropStage, start: "top 75%", once: true,
      onEnter: function () {
        var tl = window.gsap.timeline();
        tl.to(chips, { opacity: 1, duration: 0.18, stagger: 0.12 })
          .to(chips, { y: 0, rotation: 0, duration: 0.5, ease: "power2.in", stagger: 0.12 }, "<")
          .to(chips, { y: -7, duration: 0.18, ease: "power2.out", stagger: 0.06 }, ">")
          .to(chips, { y: 0, duration: 0.18, ease: "power1.in", stagger: 0.06 }, ">");
      }
    });
  }

  /* ---------- phone: steps light up in flow order ---------- */
  function phoneMoment() {
    var rows = $all(".p-step");
    var ticket = $("#pTicket");
    function allLive() {
      rows.forEach(function (r) { r.classList.add("live"); });
      ticket.classList.add("live");
    }
    if (reduce || !ioOK) { allLive(); return; }
    once($("#phoneBox"), function () {
      rows.forEach(function (r, i) {
        setTimeout(function () { r.classList.add("live"); }, 380 * i);
      });
      setTimeout(function () { ticket.classList.add("live"); }, 380 * rows.length);
    });
  }

  function init() {
    heroMoment();
    dropMoment();
    phoneMoment();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
