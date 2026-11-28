// CUE order app — home / detail sheet / bag / checkout / ticket, plus Me tab.
// Submit contract (do not change): SproutOrders.submit({ name, fruits, base, addons, size, price, drinkName, items }).
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

  var SWEETS = [{ k: "0", l: "0%" }, { k: "30", l: "30%" }, { k: "50", l: "50%" }, { k: "100", l: "100%" }];
  var ICES = [{ k: "no", l: "No ice" }, { k: "less", l: "Less ice" }, { k: "regular", l: "Regular ice" }];
  var pickK = function (arr, k) { return arr.filter(function (o) { return o.k === k; })[0]; };
  var iceLabel = function (k) { return (pickK(ICES, k) || ICES[2]).l.toLowerCase(); };
  var sweetLabel = function (k) { return (pickK(SWEETS, k) || SWEETS[2]).l + " sweet"; };

  // Named drinks come straight from content/menu.js (single source of truth).
  var slugify = function (s) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  };
  var PRESETS = M.drinks.map(function (d) {
    var sec = M.sections.filter(function (s) { return s.title === d.section; })[0] || {};
    return {
      slug: slugify(d.name), name: d.name, desc: d.desc, section: d.section,
      fruits: d.fruits.slice(), base: d.base, addons: (d.addons || []).slice(),
      signature: !!d.signature,
      // Named price where the team set one; Morning Blends are still "to be confirmed".
      price: sec.price == null ? null : sec.price,
      tbc: !!sec.priceText
    };
  });
  function preset(slug) { return PRESETS.filter(function (x) { return x.slug === slug; })[0]; }

  var STORE = { line: "CUE · YIA Building", where: "YIA Building, CUHK", hours: "Weekdays 10:00 to 17:00", how: "Pick up at YIA · Ground floor · smoothie cart" };

  var state = {
    tab: "home", cat: "layers", q: "",
    bag: [],
    checkout: { time: "ASAP", name: "" },
    placing: false
  };

  // ---------- tiny svg icons (no emoji as UI) ----------
  var ICON = {
    pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/></svg>',
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>',
    x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 5 8 12l6.5 7"/></svg>',
    trash: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M9 7V5h6v2M7 7l1 13h8l1-13"/><path d="M10 11v6M14 11v6"/></svg>',
    home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 11.5 12 4l8.5 7.5"/><path d="M6 10.5V20h4.5v-5h3V20H18v-9.5"/></svg>',
    link: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14a4.5 4.5 0 0 0 6.4 0l2.6-2.6a4.5 4.5 0 1 0-6.4-6.4L11.4 6.4"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0L5 12.6a4.5 4.5 0 1 0 6.4 6.4l1.2-1.2"/></svg>',
    radio: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M8.5 12.2l2.4 2.4 4.6-5"/></svg>'
  };

  // ---------- pricing + art ----------
  function unitPrice(c) {
    var t = size(c.size).price;
    c.addons.forEach(function (k) { t += addon(k).price; });
    return t;
  }
  function subtotal() {
    return state.bag.reduce(function (t, it) { return t + unitPrice(it) * it.qty; }, 0);
  }
  function bagCount() {
    return state.bag.reduce(function (t, it) { return t + it.qty; }, 0);
  }
  function cupColors(fruits) {
    var f = (fruits || []).map(fruit).filter(Boolean).map(function (o) { return o.color; });
    return { colorA: f[0] || "#FFB020", colorB: f[1] || f[0] || "#E08A45" };
  }
  function cupSVG(fruits) { return window.SproutArt.cup(cupColors(fruits)); }
  function recolorCup(box, fruits) {
    if (!box) return;
    var c = cupColors(fruits), a = box.querySelector(".cup-layer-a"), b = box.querySelector(".cup-layer-b");
    if (a) a.setAttribute("fill", c.colorA);
    if (b) b.setAttribute("fill", c.colorB);
  }
  function optionSummary(it) {
    var fr = it.fruits.map(function (k) { return fruit(k).name.toLowerCase(); });
    var s = fr.length === 2 ? fr[0] + " and " + fr[1] : fr[0] || "no fruit";
    s += " with " + base(it.base).name.toLowerCase() + ", " + size(it.size).name + " (" + it.size + ")";
    s += ", " + sweetLabel(it.sweetness) + ", " + iceLabel(it.ice);
    if (it.addons.length) s += ", " + it.addons.map(function (k) { return addon(k).fancy; }).join(" and ");
    return s;
  }
  function cardBadge(fruitKey) {
    var f = fruit(fruitKey);
    if (!f) return "";
    return '<span class="svy-badge">' + pct(f.pct) + "% picked " + f.name.toLowerCase() + "</span>";
  }
  // Morning Blends have no confirmed price — show TBC, never a number.
  function priceTag(p) {
    return p.tbc ? '<span class="price tbc">TBC</span>' : '<span class="price">HK$' + p.price + "</span>";
  }
  function addonBadge(a) {
    return '<span class="svy-badge"' + (a.pctNote ? ' title="Survey: ' + esc(a.pctNote) + '"' : "") + ">" +
      pct(a.pct) + "% " + (a.pctNote ? "want an energy boost" : "picked") + "</span>";
  }

  // ---------- screen plumbing ----------
  var screens = $("#screens");
  var current = null;
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
      setTimeout(function () { old.remove(); }, 430);
    }
    el.scrollTop = 0;
    return el;
  }

  function syncBadge(pop) {
    var b = $("#bagBadge"), n = bagCount();
    b.textContent = n;
    b.hidden = n === 0;
    if (pop && n) { b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop"); }
  }

  function setTab(tab) {
    state.tab = tab;
    document.querySelectorAll(".tab").forEach(function (t) {
      t.classList.toggle("on", t.dataset.tab === tab);
      t.setAttribute("aria-current", t.dataset.tab === tab ? "page" : "false");
    });
    if (tab === "home") renderHome("fade");
    else if (tab === "menu") renderMenu("fade");
    else if (tab === "bag") renderBag("fade");
    else renderMe("fade");
  }

  // ---------- home ----------
  function drinkCard(p) {
    var c = cupColors(p.fruits);
    return '<button type="button" class="card" data-open="' + p.slug + '">' +
      '<span class="art" style="background:' + c.colorA + '22">' + cupSVG(p.fruits) + "</span>" +
      '<span class="body"><span class="nm">' + esc(p.name) +
      (p.signature ? '<span class="sig-pill">Signature</span>' : "") + "</span>" +
      '<span class="ds">' + esc(p.desc) + "</span>" +
      '<span class="row">' + priceTag(p) + cardBadge(p.fruits[0]) + "</span></span></button>";
  }
  function byoCard() {
    return '<button type="button" class="card wide" data-open="build">' +
      '<span class="art" style="background:var(--cream)">' + cupSVG([]) + "</span>" +
      '<span class="body"><span class="nm">Mix your own</span>' +
      '<span class="ds">Pick 1–' + M.maxFruits + " fruits, one base and up to " + M.maxAddons + " boosts (+HK$5 each).</span>" +
      '<span class="row"><span class="price">from HK$' + size("S").price + "</span>" +
      '<span class="svy-badge">' + pct(M.sizeEvidence.pct) + "% want a size choice</span></span></span></button>";
  }
  function boostRow(a) {
    return '<button type="button" class="boost-row" data-open="boost" data-key="' + a.key + '">' +
      '<span class="body"><span class="fancy">' + esc(a.fancy) + '</span>' +
      (a.pctNote ? '<span class="plain">' + esc(a.pctNote) + "</span>" : "") + "</span>" +
      '<span class="price">+HK$' + a.price + "</span>" + addonBadge(a) + "</button>";
  }
  function matches(p, q) {
    var hay = (p.name + " " + p.desc + " " + p.fruits.map(function (k) { return fruit(k).name; }).join(" ")).toLowerCase();
    return hay.indexOf(q) > -1;
  }

  function greeting() {
    var h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  }

  function feedHTML() {
    var q = state.q.trim().toLowerCase();
    if (q) {
      var hits = PRESETS.filter(function (p) { return matches(p, q); });
      var boostHits = M.addons.filter(function (a) { return (a.name + " " + a.fancy).toLowerCase().indexOf(q) > -1; });
      var wantByo = /(build|own|custom|your|mix)/.test(q);
      if (!hits.length && !boostHits.length && !wantByo) {
        return '<p class="empty">Nothing matches “' + esc(state.q) + "”. Try mango, or mix your own.</p>";
      }
      var cards = hits.map(drinkCard);
      if (wantByo) cards.push(byoCard());
      return (cards.length ? '<div class="grid">' + cards.join("") + "</div>" : "") +
        boostHits.map(boostRow).join("");
    }
    if (state.cat === "build") return '<div class="grid">' + byoCard() + "</div>";
    if (state.cat === "boost") return M.addons.map(boostRow).join("");
    var list = PRESETS.filter(function (p) {
      var s = M.sections.filter(function (x) { return x.title === p.section; })[0];
      return s && s.key === state.cat;
    });
    var promo = state.cat === "layers" ? promoHTML() : "";
    return promo + (list.length ? '<div class="grid">' + list.map(drinkCard).join("") + "</div>" : "");
  }

  function promoHTML() {
    var p = preset("mango-sunrise");
    return '<button type="button" class="promo" data-open="' + p.slug + '">' +
      '<span class="txt"><span class="pill">Signature</span><span class="display ttl">' + esc(p.name) + "</span>" +
      '<span class="ds">' + esc(p.desc) + "</span>" +
      '<span class="price">HK$' + p.price + "</span></span>" +
      '<span class="cupbox">' + cupSVG(p.fruits) + "</span></button>";
  }

  function renderHome(dir) {
    show(
      '<h1 class="hello display">' + greeting() + "<em>.</em></h1>" +
      '<button type="button" class="store-chip" id="storeChip">' + ICON.pin + "<span>" + STORE.line + "</span></button>" +
      '<div class="search">' + ICON.search +
      '<input id="q" type="search" placeholder="Search drinks" value="' + esc(state.q) + '" aria-label="Search drinks"></div>' +
      '<div class="chips">' +
      M.sections.map(function (s) { return s.key + "|" + s.title; })
        .concat(["build|Mix your own", "boost|Boosters"]).map(function (s) {
        var p = s.split("|");
        return '<button type="button" class="chip' + (state.cat === p[0] && !state.q.trim() ? " on" : "") + '" data-cat="' + p[0] + '">' + p[1] + "</button>";
      }).join("") + "</div>" +
      '<div id="feed">' + feedHTML() + "</div>",
      dir,
      function (el) {
        var qi = el.querySelector("#q");
        qi.addEventListener("input", function () {
          state.q = qi.value;
          el.querySelector("#feed").innerHTML = feedHTML();
          el.querySelectorAll(".chip").forEach(function (c) {
            c.classList.toggle("on", c.dataset.cat === state.cat && !state.q.trim());
          });
        });
        el.addEventListener("click", function (e) {
          if (e.target.closest("#storeChip")) return openStore();
          var chip = e.target.closest(".chip");
          if (chip) {
            state.cat = chip.dataset.cat;
            state.q = "";
            return renderHome("fade");
          }
          var card = e.target.closest("[data-open]");
          if (!card) return;
          if (card.dataset.open === "build") return openDrink({});
          if (card.dataset.open === "boost") return openDrink({ addons: [card.dataset.key] });
          var p = preset(card.dataset.open);
          if (p) openDrink({ preset: p });
        });
      }
    );
  }

  // ---------- menu ----------
  function renderMenu(dir) {
    show(
      '<h2 class="h2 display">Menu</h2><p class="empty" style="text-align:left;padding:0 0 12px">Ten named blends, or mix your own from the same fruit.</p>' +
      M.sections.map(function (s) {
        var list = PRESETS.filter(function (p) { return p.section === s.title; });
        return '<h3 class="h2 display sec-head">' + esc(s.title) +
          '<span class="sec-meta">' + (s.price != null ? "HK$" + s.price + " · " + s.ml + " ml" : "price " + esc(s.priceText)) + "</span></h3>" +
          '<div class="grid">' + list.map(drinkCard).join("") + "</div>";
      }).join("") +
      '<h3 class="h2 display sec-head" style="margin-top:22px">Mix your own</h3>' +
      '<div class="grid">' + byoCard() + "</div>" +
      '<h2 class="h2 display" style="margin-top:22px">Boosters</h2>' +
      M.addons.map(boostRow).join("") +
      '<p class="me-note">' + esc(M.pickupLine) + "</p>",
      dir,
      function (el) {
        el.addEventListener("click", function (e) {
          var card = e.target.closest("[data-open]");
          if (!card) return;
          if (card.dataset.open === "build") return openDrink({});
          if (card.dataset.open === "boost") return openDrink({ addons: [card.dataset.key] });
          var p = preset(card.dataset.open);
          if (p) openDrink({ preset: p });
        });
      }
    );
  }

  // ---------- bag ----------
  function renderBag(dir) {
    var body;
    if (!state.bag.length) {
      body = '<p class="empty">Your bag is empty.<br>Pick a named blend or mix your own.</p>' +
        '<button type="button" class="btn leaf" id="toMenu" style="display:flex;margin:8px auto 0">Browse the menu</button>';
    } else {
      body = state.bag.map(function (it) {
        return '<div class="bag-item"><div class="cupbox">' + cupSVG(it.fruits) + "</div>" +
          '<div class="body"><div class="nm">' + esc(it.drinkName) + "</div>" +
          '<div class="opts-sum">' + esc(optionSummary(it)) + "</div>" +
          '<div class="row"><div class="stepper">' +
          '<button type="button" data-act="q-" data-uid="' + it.uid + '" aria-label="One less">−</button>' +
          '<span class="qty">' + it.qty + "</span>" +
          '<button type="button" data-act="q+" data-uid="' + it.uid + '" aria-label="One more">+</button></div>' +
          '<span class="line-price">HK$' + unitPrice(it) * it.qty + "</span>" +
          '<button type="button" class="trash" data-act="rm" data-uid="' + it.uid + '" aria-label="Remove ' + esc(it.drinkName) + '">' + ICON.trash + "</button>" +
          "</div></div></div>";
      }).join("");
    }
    var cta = state.bag.length ?
      '<div class="sticky-cta"><div class="tot">HK$' + subtotal() + "<small>subtotal</small></div>" +
      '<button type="button" class="btn leaf" id="toCheckout">Checkout</button></div>' : "";

    show('<h2 class="h2 display">Your bag</h2>' + body + cta, dir, function (el) {
      el.addEventListener("click", function (e) {
        if (e.target.closest("#toMenu")) return setTab("menu");
        if (e.target.closest("#toCheckout")) return renderCheckout("push");
        var b = e.target.closest("[data-act]");
        if (!b) return;
        var it = state.bag.filter(function (x) { return x.uid === b.dataset.uid; })[0];
        if (!it) return;
        if (b.dataset.act === "q+") it.qty++;
        if (b.dataset.act === "q-") { it.qty--; if (it.qty < 1) state.bag = state.bag.filter(function (x) { return x !== it; }); }
        if (b.dataset.act === "rm") state.bag = state.bag.filter(function (x) { return x !== it; });
        syncBadge();
        renderBag("fade");
      });
    });
  }

  // ---------- me ----------
  function renderMe(dir) {
    var on = window.SproutOrders.linked();
    show(
      '<h2 class="h2 display">Me</h2>' +
      '<a class="me-row" href="../index.html">' + ICON.home +
      '<span class="body">Back to CUE home page<span class="sub">The pitch site and the big deck</span></span></a>' +
      '<div class="me-row" id="stageRow">' + ICON.link +
      '<span class="body">Stage connection<span class="sub">' + (on ? "Linked: your order goes straight to the big screen" : "Not linked. Scan the QR on the slide to link") + "</span></span>" +
      '<span class="dot' + (on ? " on" : "") + '"></span></div>' +
      '<p class="me-note">Orders are saved on this phone. When you open the app from the QR on the slide, they also appear on the big screen.</p>',
      dir
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
    setTimeout(function () { if (!sheetHost.classList.contains("open")) { sheetHost.hidden = true; sheet.innerHTML = ""; } }, 400);
  }
  $("#sheetBackdrop").addEventListener("click", closeSheet);

  function openStore() {
    openSheet(
      '<button type="button" class="close" data-close aria-label="Close">' + ICON.x + "</button>" +
      '<div class="scroll store-sheet"><h2 class="display store-brand">' +
      '<img class="store-logo" src="../assets/img/cue-logo.png" alt="CUE — smoothie cup logo" onerror="this.style.display=\'none\'">' + esc(B.name) + "</h2>" +
      '<div class="rows"><div class="ln"><b>Where</b><span>' + STORE.where + "</span></div>" +
      '<div class="ln"><b>Open</b><span>' + STORE.hours + "</span></div>" +
      '<div class="ln"><b>Pickup</b><span>' + STORE.how + "</span></div></div></div>" +
      '<div class="foot-cta"><button type="button" class="btn leaf" data-close style="flex:1;justify-content:center;min-height:50px">Back to the menu</button></div>',
      function (el) { el.addEventListener("click", function (e) { if (e.target.closest("[data-close]")) closeSheet(); }); }
    );
  }

  // ---------- drink detail ----------
  function openDrink(opts) {
    var p = opts.preset;
    var cfg = {
      name: p ? p.name : "Mix your own",
      desc: p ? p.desc : "Pick 1–" + M.maxFruits + " fruits, one base and up to " + M.maxAddons + " boosts. We blend it fresh.",
      slug: p ? p.slug : "build",
      fruits: p ? p.fruits.slice() : [],
      base: p ? p.base : null,
      addons: (opts.addons || (p ? p.addons : [])).slice(),
      size: "M",
      sweetness: "50",
      ice: "regular",
      qty: 1
    };

    function fruitOpts() {
      return M.fruits.map(function (f) {
        return '<button type="button" class="opt" data-act="fruit" data-key="' + f.key + '" aria-pressed="false">' +
          '<span class="dot" style="background:' + f.color + '"></span>' + f.name +
          '<span class="svy">' + pct(f.pct) + "%</span></button>";
      }).join("");
    }
    function baseOpts() {
      return M.bases.map(function (b) {
        return '<button type="button" class="opt" data-act="base" data-key="' + b.key + '" aria-pressed="false">' + b.name +
          '<span class="svy">' + pct(b.pct) + "%</span></button>";
      }).join("");
    }
    function sizeOpts() {
      return M.sizes.map(function (s) {
        return '<button type="button" class="size-opt" data-act="size" data-key="' + s.key + '" aria-pressed="false">' +
          '<span class="k">' + s.key + '</span><span class="nm">' + s.name + '</span><span class="ml">' + s.ml +
          ' ml</span><span class="price">HK$' + s.price + "</span></button>";
      }).join("");
    }
    function sweetOpts() {
      return SWEETS.map(function (s) {
        return '<button type="button" class="opt" data-act="sweet" data-key="' + s.k + '" aria-pressed="false">' + s.l + "</button>";
      }).join("");
    }
    function iceOpts() {
      return ICES.map(function (s) {
        return '<button type="button" class="opt" data-act="ice" data-key="' + s.k + '" aria-pressed="false">' + s.l + "</button>";
      }).join("");
    }
    function boostOpts() {
      return M.addons.map(function (a) {
        return '<button type="button" class="boost-pick" data-act="addon" data-key="' + a.key + '" aria-pressed="false">' +
          '<span class="body"><span class="fancy">' + esc(a.fancy) + '</span>' +
          (a.pctNote ? '<span class="plain">' + esc(a.pctNote) + "</span>" : "") + "</span>" +
          '<span class="price">+HK$' + a.price + "</span>" + addonBadge(a) +
          '<span class="tick"></span></button>';
      }).join("");
    }

    openSheet(
      '<button type="button" class="close" data-close aria-label="Close">' + ICON.x + "</button>" +
      '<div class="scroll">' +
      '<div class="detail-hero"><div class="cupbox" id="dCup">' + cupSVG(cfg.fruits) + "</div>" +
      '<div><h2 class="display">' + esc(cfg.name) + '</h2><p class="ds">' + esc(cfg.desc) + "</p></div></div>" +
      '<div class="sect"><div class="hd"><h3 class="display">Fruit</h3><span class="hint" id="fruitHint"></span></div>' +
      '<div class="opts">' + fruitOpts() + "</div></div>" +
      '<div class="sect"><div class="hd"><h3 class="display">Base</h3><span class="hint">pick one</span></div>' +
      '<div class="opts">' + baseOpts() + "</div></div>" +
      '<div class="sect"><div class="hd"><h3 class="display">Size</h3><span class="hint">HK dollars</span></div>' +
      '<div class="size-row">' + sizeOpts() + "</div>" +
      '<div class="size-note"><span class="svy-badge">' + pct(M.sizeEvidence.pct) + "% " + M.sizeEvidence.text.replace(/^\d+%\s*/, "") + "</span></div></div>" +
      '<div class="sect"><div class="hd"><h3 class="display">Sweetness</h3></div><div class="opts">' + sweetOpts() + "</div></div>" +
      '<div class="sect"><div class="hd"><h3 class="display">Ice</h3></div><div class="opts">' + iceOpts() + "</div></div>" +
      '<div class="sect"><div class="hd"><h3 class="display">Boosters</h3><span class="hint">up to ' + M.maxAddons + ", +HK$5 each</span></div>" +
      boostOpts() + "</div>" +
      '<div class="qty-row"><span class="lbl">Quantity</span><div class="stepper">' +
      '<button type="button" data-act="qty" data-key="-" aria-label="One less">−</button>' +
      '<span class="qty" id="dQty">1</span>' +
      '<button type="button" data-act="qty" data-key="+" aria-label="One more">+</button></div></div>' +
      "</div>" +
      '<div class="foot-cta"><button type="button" class="btn leaf" id="addBtn" disabled>Add to bag</button></div>',
      function (el) {
        function valid() { return cfg.fruits.length >= 1 && !!cfg.base; }
        function sync() {
          el.querySelectorAll("[data-act]").forEach(function (b) {
            var a = b.dataset.act, k = b.dataset.key, on = false;
            if (a === "fruit") on = cfg.fruits.indexOf(k) > -1;
            if (a === "base") on = cfg.base === k;
            if (a === "addon") on = cfg.addons.indexOf(k) > -1;
            if (a === "size") on = cfg.size === k;
            if (a === "sweet") on = cfg.sweetness === k;
            if (a === "ice") on = cfg.ice === k;
            if (a === "qty") return;
            b.classList.toggle("sel", on);
            b.setAttribute("aria-pressed", on);
          });
          el.querySelector("#fruitHint").textContent = cfg.fruits.length + " of " + M.maxFruits + " picked";
          el.querySelector("#dQty").textContent = cfg.qty;
          var btn = el.querySelector("#addBtn");
          if (p && p.tbc) {
            // Named Morning Blends have no confirmed price: never show or charge a number.
            btn.disabled = true;
            btn.textContent = "Price to be confirmed";
          } else {
            btn.disabled = !valid();
            btn.textContent = "Add to bag · HK$" + unitPrice(cfg) * cfg.qty;
          }
          recolorCup(el.querySelector("#dCup"), cfg.fruits);
        }
        el.addEventListener("click", function (e) {
          if (e.target.closest("[data-close]")) return closeSheet();
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
          else if (a === "qty") {
            cfg.qty += k === "+" ? 1 : -1;
            if (cfg.qty < 1) cfg.qty = 1;
          } else return;
          if (navigator.vibrate) try { navigator.vibrate(8); } catch (err) {}
          if (a !== "qty") {
            cfg.name = p ? p.name : window.CONTENT.drinkName(cfg.fruits, cfg.base);
            el.querySelector(".detail-hero h2").textContent = cfg.name;
          }
          sync();
        });
        el.querySelector("#addBtn").addEventListener("click", function () {
          addToBag(cfg);
          closeSheet();
        });
        sync();
      }
    );
  }

  function addToBag(cfg) {
    var line = {
      uid: "u" + Date.now().toString(36) + Math.floor(Math.random() * 1e4),
      drinkName: cfg.name,
      fruits: cfg.fruits.slice(0, M.maxFruits),
      base: cfg.base,
      addons: cfg.addons.slice(0, M.maxAddons),
      size: cfg.size,
      sweetness: cfg.sweetness,
      ice: cfg.ice,
      qty: cfg.qty
    };
    var twin = state.bag.filter(function (it) {
      return it.drinkName === line.drinkName && it.base === line.base && it.size === line.size &&
        it.sweetness === line.sweetness && it.ice === line.ice &&
        it.fruits.join() === line.fruits.join() && it.addons.join() === line.addons.join();
    })[0];
    if (twin) twin.qty += line.qty; else state.bag.push(line);
    syncBadge(true);
  }

  // ---------- checkout ----------
  function renderCheckout(dir) {
    var times = ["ASAP", "15 min", "30 min"];
    show(
      '<div class="stack-bar"><button type="button" class="icon-round" id="coBack" aria-label="Back to bag">' + ICON.back + "</button>" +
      '<h2 class="display">Checkout</h2></div>' +
      '<h3 class="h2 display">Pickup</h3>' +
      '<div class="co-card fixed">' + ICON.pin + '<span class="body"><span class="t1">' + STORE.line + "</span>" +
      '<span class="t2">' + STORE.how + "</span></span></div>" +
      '<div class="opts">' + times.map(function (t) {
        return '<button type="button" class="opt' + (state.checkout.time === t ? " sel" : "") + '" data-time="' + t + '" aria-pressed="' + (state.checkout.time === t) + '">' + t + "</button>";
      }).join("") + "</div>" +
      '<h3 class="h2 display" style="margin-top:20px">Payment</h3>' +
      '<div class="co-card pay-row">' + ICON.radio + '<span class="body"><span class="t1">Pay at pickup</span>' +
      '<span class="t2">Cash or Octopus when you collect</span></span><span class="co-check"></span></div>' +
      '<div class="name-field"><label for="coName">Name for your order</label>' +
      '<p class="req">Required — it goes on the ticket.</p>' +
      '<input id="coName" maxlength="24" autocomplete="off" placeholder="e.g. Wing" value="' + esc(state.checkout.name) + '"></div>' +
      '<div class="sticky-cta"><div class="tot">HK$' + subtotal() + "<small>total</small></div>" +
      '<button type="button" class="btn leaf" id="placeBtn"' + (state.checkout.name.trim() ? "" : " disabled") + ">Place order</button></div>",
      dir,
      function (el) {
        el.querySelector("#coBack").addEventListener("click", function () { renderBag("pop"); setTabSilent("bag"); });
        el.addEventListener("click", function (e) {
          var t = e.target.closest("[data-time]");
          if (t) {
            state.checkout.time = t.dataset.time;
            el.querySelectorAll("[data-time]").forEach(function (b) {
              var on = b.dataset.time === state.checkout.time;
              b.classList.toggle("sel", on);
              b.setAttribute("aria-pressed", on);
            });
          }
          if (e.target.closest("#placeBtn")) place();
        });
        var nameIn = el.querySelector("#coName");
        nameIn.addEventListener("input", function () {
          state.checkout.name = nameIn.value;
          el.querySelector("#placeBtn").disabled = !nameIn.value.trim();
        });
      }
    );
  }
  function setTabSilent(tab) {
    state.tab = tab;
    document.querySelectorAll(".tab").forEach(function (t) {
      t.classList.toggle("on", t.dataset.tab === tab);
      t.setAttribute("aria-current", t.dataset.tab === tab ? "page" : "false");
    });
  }

  // ---------- place order + ticket ----------
  function place() {
    if (state.placing || !state.bag.length) return;
    state.placing = true;
    var btn = current.querySelector("#placeBtn");
    if (btn) btn.disabled = true;

    var items = state.bag.map(function (it) {
      return {
        drinkName: it.drinkName, fruits: it.fruits.slice(), base: it.base, addons: it.addons.slice(),
        size: it.size, sweetness: it.sweetness, ice: it.ice, qty: it.qty, price: unitPrice(it) * it.qty
      };
    });
    var first = state.bag[0];
    var payload = {
      name: state.checkout.name.trim() || "Guest",
      fruits: first.fruits.slice(0, M.maxFruits),
      base: first.base,
      addons: first.addons.slice(0, M.maxAddons),
      size: first.size,
      price: subtotal(),
      drinkName: first.drinkName,
      items: items
    };
    var minWait = new Promise(function (r) { setTimeout(r, 700); });
    Promise.all([
      window.SproutOrders.submit(payload).catch(function () { return { ok: true, where: "local", order: payload }; }),
      minWait
    ]).then(function (r) {
      state.placing = false;
      var lines = items, total = payload.price, name = payload.name;
      state.bag = [];
      syncBadge();
      ticket(r[0], lines, total, name);
    });
  }

  function ticket(res, lines, total, name) {
    var where = res && res.where === "stage" ? "On the big screen now" : res && res.where === "sent" ? "Sent to the big screen" : "Saved on this phone";
    var c = cupColors(lines[0].fruits);
    show(
      '<div class="ticket">' +
      '<div class="cupbox">' + window.SproutArt.cup({ colorA: c.colorA, colorB: c.colorB }) + "</div>" +
      '<h2 class="display">Order #1</h2>' +
      '<div class="stub"><div class="lbl">Pickup number</div><div class="num">1</div>' +
      '<div class="who">for ' + esc(name) + "</div></div>" +
      '<div class="receipt">' + lines.map(function (it) {
        return '<div class="ln"><span>' + it.qty + " × " + esc(it.drinkName) +
          "<small>" + size(it.size).name + " (" + it.size + "), " + sweetLabel(it.sweetness) + "</small></span>" +
          "<span>HK$" + it.price + "</span></div>";
      }).join("") +
      '<div class="tot"><span>Total</span><span>HK$' + total + "</span></div></div>" +
      '<div class="saved' + (res && res.where !== "local" ? "" : " local") + '">' + where + "</div>" +
      '<button type="button" class="btn ghost again" id="againBtn">Order again</button></div>',
      "push",
      function (el) {
        el.querySelector("#againBtn").addEventListener("click", function () { setTab("home"); });
        var fill = el.querySelector(".cup-fill");
        if (fill && fill.animate) {
          fill.animate([{ transform: "translateY(130px)" }, { transform: "translateY(0)" }],
            { duration: 1600, easing: "cubic-bezier(.3,.8,.3,1)", fill: "both" });
        }
        var colors = ["#E08A45", "#6A9467", "#9A3E4B", "#E8C26A", "#9EC4C0"];
        setTimeout(function () {
          if (!window.confetti) return;
          window.confetti({ particleCount: 90, spread: 80, origin: { y: 0.55 }, colors: colors });
          setTimeout(function () {
            window.confetti({ particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors: colors });
            window.confetti({ particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors: colors });
          }, 350);
        }, 500);
      }
    );
  }

  // ---------- boot ----------
  $("#tabs").addEventListener("click", function (e) {
    var t = e.target.closest(".tab");
    if (t) setTab(t.dataset.tab);
  });
  syncBadge();
  setTab("home");
})();
