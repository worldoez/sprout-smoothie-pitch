// CUE order app — home / menu / drink detail / your order (review) / order status / me.
// ONE DRINK PER PERSON for now: a single drink, a one-item review, a live status screen.
// Submit contract (do not change): CueOrders.submit({ name, fruits, base, addons, size, price, drinkName, items })
//   with items = [one item]. Every price goes through CONTENT.menu.priceOf(sizeKey, nExtras, walkIn).
(function () {
  "use strict";
  var B = window.CONTENT.brand;
  var M = window.CONTENT.menu;
  var $ = function (s) { return document.querySelector(s); };
  var pct = function (x) { return Math.round(x * 100); };
  var by = function (arr, k) { return arr.filter(function (o) { return o.key === k; })[0]; };
  var fruit = function (k) { return by(M.fruits, k); };
  var base = function (k) { return by(M.bases, k); };
  var addon = function (k) { return by(M.addons, k); };
  var size = function (k) { return by(M.sizes, k); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var priceOf = function (sizeKey, nExtras, walkIn) { return M.priceOf(sizeKey, nExtras, walkIn); };

  var SWEETS = [{ k: "0", l: "0%" }, { k: "30", l: "30%" }, { k: "50", l: "50%" }, { k: "100", l: "100%" }];
  var ICES = [{ k: "no", l: "No ice" }, { k: "less", l: "Less ice" }, { k: "regular", l: "Regular ice" }];
  var pickK = function (arr, k) { return arr.filter(function (o) { return o.k === k; })[0]; };
  var iceLabel = function (k) { return (pickK(ICES, k) || ICES[2]).l.toLowerCase(); };
  var sweetLabel = function (k) { return (pickK(SWEETS, k) || SWEETS[2]).l + " sweet"; };

  // ---------- storage ----------
  var ORDER_KEY = "cue_app_order", NAME_KEY = "cue_app_name", RECENT_KEY = "cue_app_recent", ASKED_KEY = "cue_app_notify_asked";
  var get = function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } };
  var set = function (k, v) { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) {} };
  var loadName = function () { return get(NAME_KEY) || ""; };
  var loadOrder = function () {
    try { return JSON.parse(get(ORDER_KEY) || "null"); } catch (e) { return null; }
  };

  // ---------- named drinks (content/menu.js is the single source of truth) ----------
  var slugify = function (s) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  };
  var PRESETS = M.drinks.map(function (d) {
    return {
      slug: slugify(d.name), name: d.name, desc: d.desc, section: d.section,
      fruits: d.fruits.slice(), base: d.base, addons: (d.addons || []).slice(),
      signature: !!d.signature,
      image: d.image || null                       // ONLY designed drinks have a render
    };
  });
  function preset(slug) { return PRESETS.filter(function (x) { return x.slug === slug; })[0]; }
  var SIGNATURE = PRESETS.filter(function (p) { return p.signature; })[0] || PRESETS[0];

  var STORE = { line: "CUE · YIA Building", where: "YIA Building, CUHK", hours: "Weekdays 10:00 to 17:00", how: "Pick up at YIA · Ground floor · smoothie cart" };

  var state = {
    tab: "home", q: "",
    cfg: null,                 // the one drink being customised
    reviewName: "", walkIn: false, placing: false,
    order: loadOrder()         // the placed drink + its status ("received" | "making" | "ready")
  };

  // ---------- tiny svg icons (no emoji as UI) ----------
  var ICON = {
    pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/></svg>',
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>',
    home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 11.5 12 4l8.5 7.5"/><path d="M6 10.5V20h4.5v-5h3V20H18v-9.5"/></svg>'
  };

  // ---------- pricing + art ----------
  function fruitColors(fruits) {
    var f = (fruits || []).map(fruit).filter(Boolean).map(function (o) { return o.color; });
    return { colorA: f[0] || "#E3B23C", colorB: f[1] || f[0] || "#E08A45" };
  }
  // A picture ONLY when the drink has a designed render. Otherwise nothing — no blank box.
  function photoOf(cfg) {
    if (cfg.image) return cfg.image;
    if (cfg.preset) return null;
    return window.CONTENT.drinkPhoto(cfg.fruits, cfg.base);
  }
  function chipDot(fruits, cls) {
    return '<span class="chip-dot' + (cls ? " " + cls : "") + '" style="background:' + fruitColors(fruits).colorA + '"></span>';
  }
  function fruitBadge(f) {
    if (!f || f.pct == null) return "";
    return '<span class="svy-badge">' + pct(f.pct) + "% picked " + esc(f.name.toLowerCase()) + "</span>";
  }
  function extraBadge(a) {
    if (!a || a.pct == null) return "";
    return '<span class="svy-badge"' + (a.pctNote ? ' title="Survey: ' + esc(a.pctNote) + '"' : "") + ">" +
      pct(a.pct) + "% " + (a.pctNote ? "want more energy" : "picked") + "</span>";
  }
  function sizeBadge() {
    if (M.sizeEvidence == null || M.sizeEvidence.pct == null) return "";
    return '<span class="svy-badge">' + pct(M.sizeEvidence.pct) + "% want a size choice</span>";
  }

  // ---------- screen plumbing ----------
  var screens = $("#screens"), current = null, backFn = null;
  function setBack(fn) {
    backFn = fn || null;
    var b = $("#topBack");
    if (b) b.hidden = !backFn;
  }
  function show(html, dir, onMount) {
    var old = current;
    var el = document.createElement("section");
    el.className = "screen " + (dir === "push" ? "in-right" : dir === "pop" ? "in-left" : "in-fade");
    el.innerHTML = html;
    screens.appendChild(el);
    current = el;
    if (onMount) onMount(el);
    void el.offsetWidth;
    el.className = "screen";
    if (old) {
      old.classList.add(dir === "push" ? "out-left" : dir === "pop" ? "out-right" : "out-fade");
      setTimeout(function () { old.remove(); }, 300);
    }
    el.scrollTop = 0;
    return el;
  }
  function syncBadge() {
    var b = $("#orderBadge");
    if (b) b.hidden = !state.order;
  }
  function setTab(tab) {
    state.tab = tab;
    setBack(null);
    document.querySelectorAll(".tab").forEach(function (t) {
      t.classList.toggle("on", t.dataset.tab === tab);
      t.setAttribute("aria-current", t.dataset.tab === tab ? "page" : "false");
    });
    if (tab === "home") renderHome("fade");
    else if (tab === "menu") renderMenu("fade");
    else if (tab === "order") renderOrder("fade");
    else renderMe("fade");
    syncBadge();
  }

  // ---------- one drink per person ----------
  function tryOpen(fn) {
    if (state.order) return onePerPerson();
    fn();
  }
  function onePerPerson() {
    openSheet(
      '<div class="notice"><h2 class="display">One drink per person for now</h2>' +
      "<p>You already have a drink on the way. Follow it on the order screen.</p></div>" +
      '<div class="foot-cta"><button type="button" class="btn ghost" data-close>Close</button>' +
      '<button type="button" class="btn" id="toStatus" style="flex:1;justify-content:center">See order status</button></div>',
      function (el) {
        el.addEventListener("click", function (e) {
          if (e.target.closest("[data-close]")) return closeSheet();
          if (e.target.closest("#toStatus")) { closeSheet(); setTab("order"); }
        });
      }
    );
  }

  // ---------- home ----------
  function greeting() {
    var h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  }
  function railCard(p) {
    var body = '<span class="nm">' + esc(p.name) + '</span><span class="ds">' + esc(p.desc) + '</span>' +
      '<span class="price">HK$' + priceOf("S", 0) + "</span>";
    if (p.image) {
      return '<button type="button" class="rail-card" data-open="' + p.slug + '">' +
        '<span class="art"><img src="../' + p.image + '" alt=""></span>' + body + "</button>";
    }
    return '<button type="button" class="rail-card text-first" data-open="' + p.slug + '">' +
      chipDot(p.fruits) + body + "</button>";
  }
  function byoTile() {
    return '<button type="button" class="byo-tile" data-open="build">' +
      '<span class="nm display">Mix your own</span>' +
      '<span class="ds">Pick 1–' + M.maxFruits + " fruits, one base and up to " + M.maxAddons + " extras. First extra free, then HK$5 each.</span>" +
      '<span class="price">from HK$' + priceOf("S", 0) + "</span></button>";
  }
  function renderHome(dir) {
    var sig = SIGNATURE;
    var recent = preset(get(RECENT_KEY));
    var rail = PRESETS.slice();
    if (recent) rail = [recent].concat(rail.filter(function (p) { return p.slug !== recent.slug; }));
    show(
      '<h1 class="hello display">' + greeting() + "<em>.</em></h1>" +
      '<button type="button" class="store-chip" id="storeChip">' + ICON.pin + "<span>" + esc(STORE.line) + "</span></button>" +
      '<section class="hero">' +
        '<h2 class="hero-ttl display">Skip the queue, grab your CUE.</h2>' +
        '<div class="hero-drink">' + chipDot(sig.fruits) +
          '<div><span class="hero-nm display">' + esc(sig.name) + "</span>" +
          '<span class="hero-ds">' + esc(sig.desc) + "</span></div></div>" +
        '<div class="hero-row"><span class="price">HK$' + priceOf("S", 0) + "</span>" +
        '<button type="button" class="btn" id="heroOrder">Order now</button></div>' +
      "</section>" +
      '<h3 class="rail-head display">' + (recent ? "Pick up where you left off" : "Popular with students") + "</h3>" +
      '<div class="rail">' + rail.map(railCard).join("") + "</div>" +
      byoTile() +
      '<h3 class="h3 display">How pickup works</h3>' +
      '<ol class="how">' +
        '<li><b>1</b><span class="t">Order here</span><span class="d">Pick a blend and send it to the cart.</span></li>' +
        '<li><b>2</b><span class="t">We blend it</span><span class="d">Made fresh while you walk over.</span></li>' +
        '<li><b>3</b><span class="t">Collect at the YIA cart</span><span class="d">Say your name at the ground-floor cart.</span></li>' +
      "</ol>" +
      '<div class="info-strip"><span>CUHK ID price <b class="price">HK$' + priceOf("S", 0) + "</b></span>" +
      '<span class="vs">vs</span><span>walk-in <b>HK$' + priceOf("S", 0, true) + "</b></span></div>",
      dir,
      function (el) {
        el.addEventListener("click", function (e) {
          if (e.target.closest("#storeChip")) return openStore();
          if (e.target.closest("#heroOrder")) return tryOpen(function () { openDetail(newCfg(sig), "push"); });
          var card = e.target.closest("[data-open]");
          if (!card) return;
          var open = card.dataset.open;
          tryOpen(function () {
            if (open === "build") return openDetail(newCfg(null), "push");
            var p = preset(open);
            if (p) openDetail(newCfg(p), "push");
          });
        });
      }
    );
  }

  // ---------- menu ----------
  function rowCard(p) {
    var thumb = p.image
      ? '<span class="thumb"><img src="../' + p.image + '" alt=""></span>'
      : chipDot(p.fruits);
    return '<button type="button" class="row-card" data-open="' + p.slug + '">' + thumb +
      '<span class="body"><span class="line1"><span class="nm">' + esc(p.name) +
      (p.signature ? '<span class="sig-pill">Signature</span>' : "") + '</span><span class="lead"></span>' +
      '<span class="price">HK$' + priceOf("S", 0) + "</span></span>" +
      '<span class="ds">' + esc(p.desc) + "</span></span></button>";
  }
  function extraRow(a) {
    return '<button type="button" class="row-card extra-row" data-extra="' + a.key + '">' +
      '<span class="body"><span class="line1"><span class="nm">' + esc(a.name) + '</span><span class="lead"></span>' +
      '<span class="price">+HK$' + a.price + "</span></span>" +
      '<span class="ds">' + esc(a.what) + "</span></span></button>";
  }
  function matches(p, q) {
    var hay = (p.name + " " + p.desc + " " + p.fruits.map(function (k) { return fruit(k).name; }).join(" ")).toLowerCase();
    return hay.indexOf(q) > -1;
  }
  function menuFeed() {
    var q = state.q.trim().toLowerCase();
    if (q) {
      var hits = PRESETS.filter(function (p) { return matches(p, q); });
      var extraHits = M.addons.filter(function (a) { return (a.name + " " + a.what).toLowerCase().indexOf(q) > -1; });
      var wantByo = /(build|own|custom|your|mix)/.test(q);
      if (!hits.length && !extraHits.length && !wantByo) {
        return '<p class="empty">Nothing matches “' + esc(state.q) + "”. Try mango, or mix your own.</p>";
      }
      return (hits.length ? '<div class="rows">' + hits.map(rowCard).join("") + "</div>" : "") +
        (extraHits.length ? extrasHead() + '<div class="rows">' + extraHits.map(extraRow).join("") + "</div>" : "") +
        (wantByo ? byoTile() : "");
    }
    return M.sections.map(function (s) {
      var list = PRESETS.filter(function (p) { return p.section === s.title; });
      return '<h3 class="sec-head display">' + esc(s.title) +
        '<span class="sec-meta">' + list.length + " blends</span></h3>" +
        '<div class="rows">' + list.map(rowCard).join("") + "</div>";
    }).join("") +
      extrasHead() + '<div class="rows">' + M.addons.map(extraRow).join("") + "</div>" +
      '<h3 class="sec-head display">Mix your own</h3>' + byoTile();
  }
  function extrasHead() {
    return '<h3 class="sec-head display">Extras<span class="sec-meta">first extra free, then HK$5 each</span></h3>';
  }
  function renderMenu(dir) {
    show(
      '<h2 class="h2 display">Menu</h2>' +
      '<div class="search">' + ICON.search +
      '<input id="q" type="search" placeholder="Search drinks" value="' + esc(state.q) + '" aria-label="Search drinks"></div>' +
      '<div id="feed">' + menuFeed() + "</div>" +
      '<p class="me-note">' + esc(M.pickupLine) + "</p>",
      dir,
      function (el) {
        var qi = el.querySelector("#q");
        qi.addEventListener("input", function () {
          state.q = qi.value;
          el.querySelector("#feed").innerHTML = menuFeed();
        });
        el.addEventListener("click", function (e) {
          var card = e.target.closest("[data-open], [data-extra]");
          if (!card) return;
          var extraKey = card.dataset.extra, open = card.dataset.open;
          tryOpen(function () {
            if (extraKey) return openDetail(newCfg(null, { addons: [extraKey] }), "push");
            if (open === "build") return openDetail(newCfg(null), "push");
            var p = preset(open);
            if (p) openDetail(newCfg(p), "push");
          });
        });
      }
    );
  }

  // ---------- drink detail ----------
  function newCfg(p, opts) {
    opts = opts || {};
    return {
      preset: p || null,
      name: p ? p.name : "Mix your own",
      desc: p ? p.desc : "Pick 1–" + M.maxFruits + " fruits, one base and up to " + M.maxAddons + " extras. We blend it fresh.",
      image: p ? p.image : null,
      fruits: p ? p.fruits.slice() : [],
      base: p ? p.base : null,
      addons: (opts.addons || (p ? p.addons : [])).slice(),
      size: "S",
      sweetness: "50",
      ice: "regular"
    };
  }
  function heroHTML(cfg) {
    var photo = photoOf(cfg);
    if (photo) {
      return '<div class="detail-hero"><div class="hero-photo"><img class="drink-img" src="../' + photo +
        '" alt="' + esc(cfg.name) + ' render"></div>' +
        '<div class="hero-txt"><h2 class="display">' + esc(cfg.name) + '</h2><p class="ds">' + esc(cfg.desc) + "</p></div></div>";
    }
    return '<div class="detail-hero text-first">' + chipDot(cfg.fruits, "big") +
      '<div class="hero-txt"><h2 class="display">' + esc(cfg.name) + '</h2><p class="ds">' + esc(cfg.desc) + "</p></div></div>";
  }
  function openDetail(cfg, dir) {
    state.cfg = cfg;
    if (cfg.preset) set(RECENT_KEY, cfg.preset.slug);
    setBack(function () { setTab(state.tab); });
    var fruitOpts = M.fruits.map(function (f) {
      return '<button type="button" class="opt" data-act="fruit" data-key="' + f.key + '" aria-pressed="false">' +
        '<span class="dot" style="background:' + f.color + '"></span>' + f.name +
        (f.pct != null ? '<span class="svy">' + pct(f.pct) + "%</span>" : "") + "</button>";
    }).join("");
    var baseOpts = M.bases.map(function (b) {
      return '<button type="button" class="opt" data-act="base" data-key="' + b.key + '" aria-pressed="false">' + b.name +
        (b.pct != null ? '<span class="svy">' + pct(b.pct) + "%</span>" : "") + "</button>";
    }).join("");
    var sizeOpts = M.sizes.map(function (s) {
      return '<button type="button" class="size-opt" data-act="size" data-key="' + s.key + '" aria-pressed="false">' +
        '<span class="nm">' + esc(s.name) + '</span><span class="oz">' + s.oz + ' oz</span>' +
        '<span class="price">HK$' + priceOf(s.key, 0) + "</span></button>";
    }).join("");
    var extraOpts = M.addons.map(function (a) {
      return '<button type="button" class="extra-pick" data-act="addon" data-key="' + a.key + '" aria-pressed="false">' +
        '<span class="body"><span class="fancy">' + esc(a.fancy) + "</span>" +
        '<span class="plain">' + esc(a.what) + "</span></span>" +
        '<span class="price">+HK$' + a.price + "</span>" + extraBadge(a) +
        '<span class="tick"></span></button>';
    }).join("");
    var sweetOpts = SWEETS.map(function (s) {
      return '<button type="button" class="opt" data-act="sweet" data-key="' + s.k + '" aria-pressed="false">' + s.l + "</button>";
    }).join("");
    var iceOpts = ICES.map(function (s) {
      return '<button type="button" class="opt" data-act="ice" data-key="' + s.k + '" aria-pressed="false">' + s.l + "</button>";
    }).join("");

    show(
      heroHTML(cfg) +
      '<div class="sect"><div class="hd"><h3 class="display">Fruit</h3><span class="hint" id="fruitHint"></span></div>' +
      '<div class="opts">' + fruitOpts + "</div></div>" +
      '<div class="sect"><div class="hd"><h3 class="display">Base</h3><span class="hint">pick one</span></div>' +
      '<div class="opts">' + baseOpts + "</div></div>" +
      '<div class="sect"><div class="hd"><h3 class="display">Size</h3><span class="hint">CUHK ID price</span></div>' +
      '<div class="size-row">' + sizeOpts + "</div>" +
      '<div class="size-note">' + sizeBadge() + "</div></div>" +
      '<div class="sect"><div class="hd"><h3 class="display">Extras</h3><span class="hint">first extra free, then HK$5 each</span></div>' +
      extraOpts + "</div>" +
      '<div class="sect"><div class="hd"><h3 class="display">Sweetness</h3></div><div class="opts">' + sweetOpts + "</div></div>" +
      '<div class="sect"><div class="hd"><h3 class="display">Ice</h3></div><div class="opts">' + iceOpts + "</div></div>" +
      '<div class="sticky-cta"><button type="button" class="btn split" id="placeBtn">' +
      '<span>Place order</span><span class="cta-price" id="ctaPrice">HK$' + priceOf(cfg.size, cfg.addons.length) + "</span></button></div>",
      dir,
      function (el) {
        function sync() {
          el.querySelectorAll("[data-act]").forEach(function (b) {
            var a = b.dataset.act, k = b.dataset.key, on = false;
            if (a === "fruit") on = cfg.fruits.indexOf(k) > -1;
            if (a === "base") on = cfg.base === k;
            if (a === "addon") on = cfg.addons.indexOf(k) > -1;
            if (a === "size") on = cfg.size === k;
            if (a === "sweet") on = cfg.sweetness === k;
            if (a === "ice") on = cfg.ice === k;
            b.classList.toggle("sel", on);
            b.setAttribute("aria-pressed", on);
          });
          var fh = el.querySelector("#fruitHint");
          if (fh) fh.textContent = cfg.fruits.length + " of " + M.maxFruits + " picked";
          el.querySelector("#ctaPrice").textContent = "HK$" + priceOf(cfg.size, cfg.addons.length);
        }
        el.addEventListener("click", function (e) {
          var b = e.target.closest("[data-act]");
          if (!b) return;
          var a = b.dataset.act, k = b.dataset.key;
          if (a === "fruit") {
            var i = cfg.fruits.indexOf(k);
            if (i > -1) cfg.fruits.splice(i, 1);
            else { if (cfg.fruits.length >= M.maxFruits) cfg.fruits.shift(); cfg.fruits.push(k); }
          } else if (a === "base") cfg.base = k;
          else if (a === "addon") {
            var j = cfg.addons.indexOf(k);
            if (j > -1) cfg.addons.splice(j, 1);
            else { if (cfg.addons.length >= M.maxAddons) cfg.addons.shift(); cfg.addons.push(k); }
          } else if (a === "size") cfg.size = k;
          else if (a === "sweet") cfg.sweetness = k;
          else if (a === "ice") cfg.ice = k;
          else return;
          if (navigator.vibrate) try { navigator.vibrate(8); } catch (err) {}
          if (!cfg.preset && (a === "fruit" || a === "base")) {
            cfg.name = window.CONTENT.drinkName(cfg.fruits, cfg.base);
            var h = el.querySelector(".detail-hero h2");
            if (h) h.textContent = cfg.name;
          }
          sync();
        });
        el.querySelector("#placeBtn").addEventListener("click", function () { tryOpen(function () { openReview("push"); }); });
        sync();
      }
    );
  }

  // ---------- your order (one-item review) ----------
  function openReview(dir) {
    state.reviewName = state.reviewName || loadName();
    setBack(function () { openDetail(state.cfg, "pop"); });
    renderReview(dir);
  }
  function renderReview(dir) {
    var cfg = state.cfg;
    var n = cfg.addons.length;
    var photo = photoOf(cfg);
    var summary = (function () {
      var fr = cfg.fruits.map(function (k) { return fruit(k).name.toLowerCase(); });
      var s = fr.length === 2 ? fr[0] + " and " + fr[1] : fr[0] || "no fruit";
      var b = cfg.base ? base(cfg.base).name.toLowerCase() : "no base";
      s += " with " + b + ", " + sweetLabel(cfg.sweetness) + ", " + iceLabel(cfg.ice);
      return s;
    })();
    show(
      '<h2 class="h2 display">Your order</h2>' +
      '<div class="review-card">' +
        (photo ? '<span class="thumb"><img src="../' + photo + '" alt=""></span>' : chipDot(cfg.fruits, "big")) +
        '<span class="body"><span class="nm display">' + esc(cfg.name) + '</span><span class="ds">' + esc(summary) + "</span></span>" +
      "</div>" +
      '<div class="name-field"><label for="rvName">Name for your order</label>' +
      '<p class="req">Required — it goes on the ticket.</p>' +
      '<input id="rvName" maxlength="24" autocomplete="off" placeholder="e.g. Wing" value="' + esc(state.reviewName) + '"></div>' +
      '<div class="sect"><div class="hd"><h3 class="display">Size</h3><span class="hint">CUHK ID price</span></div>' +
      '<div class="opts">' + M.sizes.map(function (s) {
        return '<button type="button" class="opt" data-act="size" data-key="' + s.key + '" aria-pressed="false">' +
          esc(s.name) + " " + s.oz + " oz</button>";
      }).join("") + "</div></div>" +
      '<div class="sect"><div class="hd"><h3 class="display">Extras</h3><span class="hint">first extra free, then HK$5 each</span></div>' +
      '<div class="opts">' + M.addons.map(function (a) {
        return '<button type="button" class="opt" data-act="addon" data-key="' + a.key + '" aria-pressed="false">' +
          esc(a.name) + "</button>";
      }).join("") + "</div></div>" +
      '<div class="total-row"><span class="tl">Total<small id="totNote">CUHK student-ID price</small></span>' +
      '<span class="price big" id="rvTotal">HK$' + priceOf(cfg.size, n, state.walkIn) + "</span></div>" +
      '<button type="button" class="switch-row" id="walkIn" role="switch" aria-checked="' + state.walkIn + '">' +
      '<span class="body"><span class="t1">Not a CUHK student?</span>' +
      '<span class="t2">Walk-in price HK$' + priceOf(cfg.size, n, true) + "</span></span>" +
      '<span class="switch"></span></button>' +
      '<p class="me-note">Pay at the cart when you collect — cash or Octopus.</p>' +
      '<div class="sticky-cta"><button type="button" class="btn" id="placeBtn"' + (state.reviewName.trim() ? "" : " disabled") + ">Place order</button></div>",
      dir,
      function (el) {
        function sync() {
          el.querySelectorAll("[data-act]").forEach(function (b) {
            var on = b.dataset.act === "size" ? cfg.size === b.dataset.key : cfg.addons.indexOf(b.dataset.key) > -1;
            b.classList.toggle("sel", on);
            b.setAttribute("aria-pressed", on);
          });
          var total = priceOf(cfg.size, cfg.addons.length, state.walkIn);
          el.querySelector("#rvTotal").textContent = "HK$" + total;
          el.querySelector("#totNote").textContent = state.walkIn ? "Walk-in price" : "CUHK student-ID price";
          el.querySelector("#walkIn .t2").textContent = "Walk-in price HK$" + priceOf(cfg.size, cfg.addons.length, true);
          el.querySelector("#walkIn").setAttribute("aria-checked", String(state.walkIn));
          el.querySelector("#placeBtn").disabled = !state.reviewName.trim();
        }
        el.addEventListener("click", function (e) {
          if (e.target.closest("#walkIn")) { state.walkIn = !state.walkIn; return sync(); }
          if (e.target.closest("#placeBtn")) return place();
          var b = e.target.closest("[data-act]");
          if (!b) return;
          if (b.dataset.act === "size") cfg.size = b.dataset.key;
          else if (b.dataset.act === "addon") {
            var j = cfg.addons.indexOf(b.dataset.key);
            if (j > -1) cfg.addons.splice(j, 1);
            else { if (cfg.addons.length >= M.maxAddons) cfg.addons.shift(); cfg.addons.push(b.dataset.key); }
          } else return;
          if (navigator.vibrate) try { navigator.vibrate(8); } catch (err) {}
          sync();
        });
        var nameIn = el.querySelector("#rvName");
        nameIn.addEventListener("input", function () {
          state.reviewName = nameIn.value;
          set(NAME_KEY, nameIn.value.trim() || null);
          el.querySelector("#placeBtn").disabled = !nameIn.value.trim();
        });
        sync();
      }
    );
  }

  // ---------- place order + status ----------
  function shortCode(id) {
    var s = String(id || "").replace(/^o/, "");
    return (s.slice(-4) || "0000").toUpperCase();
  }
  function place() {
    if (state.placing || state.order) return;
    var cfg = state.cfg, name = state.reviewName.trim();
    if (!cfg || !name) return;
    state.placing = true;
    var btn = current.querySelector("#placeBtn");
    if (btn) btn.disabled = true;

    var price = priceOf(cfg.size, cfg.addons.length, state.walkIn);
    var item = {
      drinkName: cfg.name, fruits: cfg.fruits.slice(0, M.maxFruits), base: cfg.base,
      addons: cfg.addons.slice(0, M.maxAddons), size: cfg.size,
      sweetness: cfg.sweetness, ice: cfg.ice, qty: 1, price: price
    };
    var payload = {
      name: name,
      fruits: item.fruits, base: item.base, addons: item.addons, size: item.size,
      price: price, drinkName: item.drinkName, items: [item]
    };
    var minWait = new Promise(function (r) { setTimeout(r, 600); });
    Promise.all([
      window.CueOrders.submit(payload).catch(function () { return { ok: true, where: "local", order: payload }; }),
      minWait
    ]).then(function (r) {
      state.placing = false;
      var res = r[0] || {}, o = res.order || payload;
      var id = o.id || ("o" + Date.now().toString(36));
      state.order = {
        id: id,
        code: shortCode(id),
        name: name, drinkName: item.drinkName,
        fruits: item.fruits, base: item.base, addons: item.addons,
        size: item.size, sweetness: item.sweetness, ice: item.ice,
        price: price, walkIn: !!state.walkIn,
        status: "received", at: o.at || new Date().toISOString(), where: res.where || "local"
      };
      set(ORDER_KEY, JSON.stringify(state.order));
      state.cfg = null;
      setTab("order");
      startWatch();
    });
  }

  var watchHandle = null;
  function startWatch() {
    if (watchHandle) { try { watchHandle.close(); } catch (e) {} watchHandle = null; }
    if (!state.order || !window.CueOrders || !CueOrders.watch) return;
    watchHandle = CueOrders.watch(state.order.id, setOrderStatus);
  }
  function setOrderStatus(s) {
    if (!state.order || state.order.status === s) return;
    state.order.status = s;
    set(ORDER_KEY, JSON.stringify(state.order));
    if (s === "ready") readyAlert();
    if (state.tab === "order") renderOrder("fade");
    syncBadge();
  }

  function trackerHTML(status) {
    var steps = ["Order received", "Being blended", "Ready for pickup"];
    var idx = status === "ready" ? 2 : status === "making" ? 1 : 0;
    return '<ol class="tracker">' + steps.map(function (t, i) {
      var cls = i < idx ? "done" : i === idx ? "on" : "";
      return '<li class="step ' + cls + '"' + (i === idx ? ' aria-current="step"' : "") + ">" +
        '<span class="dot"></span><span class="lbl">' + t + "</span></li>";
    }).join("") + "</ol>";
  }
  function askNotifyHTML() {
    if (!state.order || state.order.status === "ready") return "";
    if (!window.Notification || Notification.permission !== "default" || get(ASKED_KEY)) return "";
    return '<div class="notice-strip" id="notifyStrip"><span>Want a note when it is ready?</span>' +
      '<span class="acts"><button type="button" class="lnk" id="notifyYes">Enable</button>' +
      '<button type="button" class="lnk" id="notifyNo">Not now</button></span></div>';
  }
  function renderOrder(dir) {
    var o = state.order;
    if (!o) {
      show('<h2 class="h2 display">Order</h2>' +
        '<p class="empty">No order right now.<br>One drink per person for now — it shows up here.</p>' +
        '<button type="button" class="btn" id="toMenu" style="display:flex;margin:8px auto 0">See the menu</button>',
        dir,
        function (el) {
          el.addEventListener("click", function (e) { if (e.target.closest("#toMenu")) setTab("menu"); });
        });
      return;
    }
    var extras = o.addons.map(function (k) { var a = addon(k); return a ? a.fancy : k; });
    var linked = window.CueOrders && CueOrders.linked();
    show(
      '<h2 class="h2 display">Order</h2>' +
      '<div class="status-card">' +
        '<div class="stub"><div class="lbl">Pickup number</div><div class="num">1</div>' +
        '<div class="code">Code ' + esc(o.code) + '</div><div class="who">for ' + esc(o.name) + "</div></div>" +
        '<div class="receipt">' +
          '<div class="ln"><span>' + esc(o.drinkName) + "</span><span>HK$" + o.price + "</span></div>" +
          '<div class="ln"><span>' + esc(size(o.size).name) + " " + size(o.size).oz + " oz</span><span>" +
            (o.walkIn ? "walk-in" : "CUHK ID price") + "</span></div>" +
          '<div class="ln"><span>' + (extras.length ? esc(extras.join(", ")) : "No extras") + "</span><span>" +
            (o.addons.length ? o.addons.length + " of " + M.maxAddons : "") + "</span></div>" +
        "</div>" +
      "</div>" +
      '<p class="status-head">' + (o.status === "ready" ? "Ready for pickup" : "Order in progress") + "</p>" +
      trackerHTML(o.status) +
      (linked ? "" : '<p class="me-note">Live updates are off. Open this page from the QR on the slide to follow along.</p>') +
      askNotifyHTML(),
      dir,
      function (el) {
        el.addEventListener("click", function (e) {
          if (e.target.closest("#notifyYes")) {
            set(ASKED_KEY, "1");
            if (window.Notification && Notification.requestPermission) {
              Notification.requestPermission().then(function () { renderOrder("fade"); });
            }
            return;
          }
          if (e.target.closest("#notifyNo")) { set(ASKED_KEY, "1"); renderOrder("fade"); }
        });
      }
    );
  }

  function chime() {
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      var ac = new AC();
      [880, 1318.5].forEach(function (f, i) {
        var t = ac.currentTime + i * 0.14;
        var o = ac.createOscillator(), g = ac.createGain();
        o.type = "sine"; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.22, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
        o.connect(g); g.connect(ac.destination);
        o.start(t); o.stop(t + 0.6);
      });
      setTimeout(function () { try { ac.close(); } catch (e) {} }, 1400);
    } catch (e) {}
  }
  function readyAlert() {
    var o = state.order;
    if (!o) return;
    var host = $("#readyHost");
    host.innerHTML =
      '<div class="ready-card" role="alertdialog" aria-modal="true" aria-label="Your smoothie is ready">' +
      '<h2 class="display">Your smoothie is ready</h2>' +
      '<p class="rs">Collect at the YIA cart</p>' +
      '<div class="rcode"><span class="lbl">Code</span><span class="num">' + esc(o.code) + "</span>" +
      '<span class="who">Order #1 for ' + esc(o.name) + "</span></div>" +
      '<button type="button" class="btn" id="readyOk">Got it</button></div>';
    host.hidden = false;
    void host.offsetWidth;
    host.classList.add("open");
    host.querySelector("#readyOk").addEventListener("click", function () {
      host.classList.remove("open");
      host.hidden = true;
      host.innerHTML = "";
    });
    if (navigator.vibrate) try { navigator.vibrate([120, 60, 180]); } catch (e) {}
    chime();
    if (window.Notification && Notification.permission === "granted") {
      try { new Notification("Your CUE is ready", { body: "Collect at the YIA cart — code " + o.code }); } catch (e) {}
    }
  }

  // ---------- me ----------
  function naRow(title, sub) {
    return '<div class="me-row na" aria-disabled="true"><span class="body">' + esc(title) +
      (sub ? '<span class="sub">' + esc(sub) + "</span>" : "") +
      '</span><span class="pill">Not available yet</span></div>';
  }
  function renderMe(dir) {
    var on = window.CueOrders && CueOrders.linked();
    var room = window.CueOrders ? CueOrders.joinRoom() : "";
    show(
      '<h2 class="h2 display">Me</h2>' +
      '<div class="name-field me-field"><label for="meName">Name on your tickets</label>' +
      '<p class="req">Saved on this device.</p>' +
      '<input id="meName" maxlength="24" autocomplete="off" placeholder="e.g. Wing" value="' + esc(loadName()) + '"></div>' +
      '<a class="me-row" href="../index.html">' + ICON.home +
      '<span class="body">Back to CUE site<span class="sub">The pitch site and the big deck</span></span></a>' +
      naRow("Payments", "Pay at the cart for now") +
      naRow("Order history") +
      naRow("Notification settings") +
      naRow("Loyalty and rewards") +
      '<details class="dev"><summary>Developer options</summary><div class="dev-body">' +
        '<div class="me-row"><span class="body">Stage connection<span class="sub">' +
          (on ? "Linked: orders go to the big screen" : "Not linked to a stage screen") + "</span></span>" +
          '<span class="dot' + (on ? " on" : "") + '"></span></div>' +
        '<div class="me-row"><span class="body">Room code<span class="sub">' + esc(room || "none") + "</span></span></div>" +
        '<div class="dev-acts">' +
          '<button type="button" class="btn ghost" id="markReady"' + (state.order ? "" : " disabled") + ">Mark as ready (demo)</button>" +
          '<button type="button" class="btn ghost" id="resetOrder"' + (state.order ? "" : " disabled") + ">Reset order</button>" +
        "</div>" +
      "</div></details>",
      dir,
      function (el) {
        var nameIn = el.querySelector("#meName");
        nameIn.addEventListener("input", function () {
          state.reviewName = nameIn.value;
          set(NAME_KEY, nameIn.value.trim() || null);
        });
        el.addEventListener("click", function (e) {
          if (e.target.closest("#markReady")) return setOrderStatus("ready");
          if (e.target.closest("#resetOrder")) {
            if (watchHandle) { try { watchHandle.close(); } catch (err) {} watchHandle = null; }
            state.order = null;
            set(ORDER_KEY, null);
            var host = $("#readyHost");
            host.classList.remove("open"); host.hidden = true; host.innerHTML = "";
            syncBadge();
            renderMe("fade");
          }
        });
      }
    );
  }

  // ---------- sheets ----------
  var sheetHost = $("#sheetHost"), sheet = $("#sheet");
  function openSheet(html, onMount) {
    sheet.innerHTML = '<div class="handle" aria-hidden="true"></div>' + html;
    sheetHost.hidden = false;
    void sheetHost.offsetWidth;
    sheetHost.classList.add("open");
    if (onMount) onMount(sheet);
  }
  function closeSheet() {
    sheetHost.classList.remove("open");
    setTimeout(function () { if (!sheetHost.classList.contains("open")) { sheetHost.hidden = true; sheet.innerHTML = ""; } }, 300);
  }
  $("#sheetBackdrop").addEventListener("click", closeSheet);

  function openStore() {
    openSheet(
      '<div class="scroll store-sheet"><h2 class="display store-brand">' +
      '<img class="store-logo" src="../assets/img/cue-logo.png" alt="" onerror="this.style.display=\'none\'">' + esc(B.name) + "</h2>" +
      '<div class="rows"><div class="ln"><b>Where</b><span>' + STORE.where + "</span></div>" +
      '<div class="ln"><b>Open</b><span>' + STORE.hours + "</span></div>" +
      '<div class="ln"><b>Pickup</b><span>' + STORE.how + "</span></div></div></div>" +
      '<div class="foot-cta"><button type="button" class="btn" data-close style="flex:1;justify-content:center">Close</button></div>',
      function (el) { el.addEventListener("click", function (e) { if (e.target.closest("[data-close]")) closeSheet(); }); }
    );
  }

  // ---------- boot ----------
  $("#topBack").addEventListener("click", function () { if (backFn) backFn(); });
  $("#tabs").addEventListener("click", function (e) {
    var t = e.target.closest(".tab");
    if (t) setTab(t.dataset.tab);
  });
  state.reviewName = loadName();
  syncBadge();
  setTab("home");
  if (state.order) startWatch();   // a reload keeps the order and follows it again
})();
