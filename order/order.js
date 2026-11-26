(function () {
  var M = window.CONTENT.menu;
  var $ = function (s) { return document.querySelector(s); };
  var pct = function (x) { return Math.round(x * 100); };
  var by = function (arr, k) { return arr.filter(function (o) { return o.key === k; })[0]; };

  var state = { name: "Professor", fruits: [], base: null, addons: [], size: null };
  var step = 0, LAST = 6, placing = false, current = null;
  var screens = $("#screens"), next = $("#next"), back = $("#back"), foot = $("#foot"), info = $("#footInfo");

  // decorative floaters (desktop)
  $(".floaters").innerHTML = ["🥭:6%:12%:0s", "🍓:10%:70%:-2s", "🍌:84%:10%:-4s", "🫐:88%:62%:-1s", "🍑:22%:88%:-5s", "🥭:72%:86%:-3s"].map(function (s) {
    var p = s.split(":"); return '<span style="left:' + p[1] + ';top:' + p[2] + ';animation-delay:' + p[3] + '">' + p[0] + "</span>";
  }).join("");

  function total() {
    var sz = by(M.sizes, state.size), t = sz ? sz.price : 0;
    state.addons.forEach(function (k) { t += by(M.addons, k).price; });
    return t;
  }
  function cupColors() {
    var f = state.fruits.map(function (k) { return by(M.fruits, k).color; });
    return { colorA: f[0] || "#FFB020", colorB: f[1] || f[0] || "#FF8A1F" };
  }
  function survey(p) {
    return '<div class="svy"><span>' + pct(p) + '% of students picked this</span><div class="track"><b data-w="' + pct(p) + '"></b></div></div>';
  }
  function tick() { return '<span class="tick">&#10003;</span>'; }

  var steps = [
    { // welcome
      title: "", valid: function () { return state.name.trim().length > 0; }, label: "Start",
      render: function () {
        return '<div class="welcome"><div class="mo">' + SproutArt.mascot({ cup: true }) + '</div>' +
          '<h1 class="display">Order <span>ahead</span>,<br>skip the queue.</h1>' +
          '<p class="sub">Build your own smoothie in six quick taps.</p>' +
          '<div class="field"><label for="nm">Your name</label><input id="nm" maxlength="24" value="' + state.name.replace(/"/g, "&quot;") + '" autocomplete="off"></div></div>';
      },
      bind: function (el) { var i = el.querySelector("#nm"); i.addEventListener("input", function () { state.name = i.value; update(); }); },
      note: function () { return ""; }
    },
    { title: "Pick your <em>fruit</em>", sub: "Choose up to " + M.maxFruits + ".", label: "Next",
      valid: function () { return state.fruits.length >= 1; },
      render: function () {
        return grid("two", M.fruits.map(function (f) {
          return opt("fruit", f.key, '<span class="emoji">' + f.emoji + '</span><span class="nm">' + f.name + "</span>" + survey(f.pct), state.fruits);
        }));
      },
      note: function () { return state.fruits.length + " of " + M.maxFruits + " picked"; } },
    { title: "Choose a <em>base</em>", sub: "Exactly one.", label: "Next",
      valid: function () { return !!state.base; },
      render: function () {
        return grid("", M.bases.map(function (b) {
          return opt("base", b.key, '<div class="body"><span class="nm">' + b.name + "</span>" + survey(b.pct) + "</div>", [state.base], "full");
        }));
      }, note: function () { return state.base ? by(M.bases, state.base).name : "Pick one"; } },
    { title: "Add a <em>booster</em>", sub: "Optional, up to " + M.maxAddons + ".", label: "Next",
      valid: function () { return true; },
      render: function () {
        return grid("", M.addons.map(function (a) {
          return opt("addon", a.key, '<div class="body"><span class="fancy">' + a.fancy + '</span><span class="plain">' + a.name + '</span><span class="price">+HK$' + a.price + "</span>" + survey(a.pct) + "</div>", state.addons, "full");
        }));
      }, note: function () { return state.addons.length ? state.addons.length + " of " + M.maxAddons + " picked" : "Skip if you like"; } },
    { title: "Pick your <em>size</em>", sub: "", label: "Review",
      valid: function () { return !!state.size; },
      render: function () {
        return grid("", M.sizes.map(function (s, i) {
          var w = 30 + i * 8;
          return opt("size", s.key, '<div class="size-cup" style="width:' + w + 'px">' + SproutArt.cup(cupColors()) + '</div><div class="body"><span class="nm">' + s.name + ' <small>(' + s.key + ')</small></span><span class="plain">' + s.ml + ' ml</span><span class="price">HK$' + s.price + "</span></div>", [state.size], "full");
        })) + '<div class="size-note">' + M.sizeEvidence.text.replace(/^(\d+%)\s*want/, "$1 of students want") + "</div>";
      }, note: function () { return state.size ? "HK$" + total() : "Pick a size"; } },
    { title: "Looks <em>delicious</em>", label: "Place order", valid: function () { return !placing; },
      render: function () {
        var sz = by(M.sizes, state.size), rows = '<div class="ln"><span>' + sz.name + " <small>" + sz.ml + " ml</small></span><span>HK$" + sz.price + "</span></div>";
        state.addons.forEach(function (k) { var a = by(M.addons, k); rows += '<div class="ln"><span>' + a.fancy + " <small>" + a.name + "</small></span><span>+HK$" + a.price + "</span></div>"; });
        var fr = state.fruits.map(function (k) { var f = by(M.fruits, k); return f.emoji + " " + f.name; }).join(" + ");
        return '<div class="review"><div class="cupbox">' + SproutArt.cup(cupColors()) + "</div>" +
          '<h2 class="display">' + CONTENT.drinkName(state.fruits) + '</h2><p class="sub" style="margin:0">' + fr + " &middot; " + by(M.bases, state.base).name + "</p>" +
          '<div class="receipt">' + rows + '<div class="tot"><span>Total</span><span>HK$' + total() + "</span></div></div></div>";
      }, note: function () { return "for " + state.name.trim(); } },
    { title: "", ticket: true, render: function () { return '<div class="spinner"></div>'; } }
  ];

  function grid(cls, items) { return '<div class="grid ' + cls + '">' + items.join("") + "</div>"; }
  function opt(kind, key, inner, selList, cls) {
    var sel = selList.indexOf(key) > -1;
    return '<button type="button" class="opt ' + (cls || "") + (sel ? " sel" : "") + '" data-kind="' + kind + '" data-key="' + key + '" aria-pressed="' + sel + '">' + inner + tick() + "</button>";
  }

  function toggle(kind, key) {
    var list = kind === "fruit" ? state.fruits : state.addons, max = kind === "fruit" ? M.maxFruits : M.maxAddons;
    if (kind === "base") state.base = key;
    else if (kind === "size") state.size = key;
    else {
      var i = list.indexOf(key);
      if (i > -1) list.splice(i, 1); else { if (list.length >= max) list.shift(); list.push(key); }
    }
    if (navigator.vibrate) try { navigator.vibrate(10); } catch (e) {}
    // refresh selection classes
    current.querySelectorAll(".opt").forEach(function (b) {
      var k = b.dataset.kind, on = k === "fruit" ? state.fruits : k === "addon" ? state.addons : k === "base" ? [state.base] : [state.size];
      var s = on.indexOf(b.dataset.key) > -1;
      if (s !== b.classList.contains("sel")) { b.classList.toggle("sel", s); }
      b.setAttribute("aria-pressed", s);
    });
    update();
  }

  function update() {
    var s = steps[step];
    next.disabled = !s.valid || !s.valid();
    next.textContent = s.label || "Next";
    info.textContent = s.note ? s.note() : "";
    $("#bar").style.width = (step / (LAST - 1) * 100) + "%";
    back.hidden = step === 0 || step === LAST;
    var home = document.getElementById("home"); if (home) home.hidden = !back.hidden;
    foot.classList.toggle("hide", step === LAST);
  }

  function show(n, dir) {
    var old = current, s = steps[n];
    step = n;
    var el = document.createElement("section");
    el.className = "screen " + (dir > 0 ? "enter-right" : "enter-left");
    var head = s.title ? "<h2 class=\"display\">" + s.title + "</h2>" + (s.sub ? '<p class="sub">' + s.sub + "</p>" : '<p class="sub"></p>') : "";
    el.innerHTML = head + s.render();
    screens.appendChild(el);
    current = el;
    el.addEventListener("click", function (e) { var b = e.target.closest(".opt"); if (b) toggle(b.dataset.kind, b.dataset.key); });
    if (s.bind) s.bind(el);
    void el.offsetWidth;
    el.className = "screen";
    if (old) { old.classList.add(dir > 0 ? "leave-left" : "leave-right"); setTimeout(function () { old.remove(); }, 450); }
    setTimeout(function () { el.querySelectorAll(".track b").forEach(function (b) { b.style.width = b.dataset.w + "%"; }); }, 60);
    update();
    el.scrollTop = 0;
  }

  next.addEventListener("click", function () {
    if (next.disabled) return;
    if (step === 5) return place();
    show(step + 1, 1);
  });
  back.addEventListener("click", function () { if (step > 0 && step < LAST) show(step - 1, -1); });

  function place() {
    placing = true; next.disabled = true;
    var order = { name: state.name.trim() || "Guest", fruits: state.fruits.slice(), base: state.base, addons: state.addons.slice(), size: state.size, price: total(), drinkName: CONTENT.drinkName(state.fruits) };
    var minWait = new Promise(function (r) { setTimeout(r, 700); });
    Promise.all([SproutOrders.submit(order).catch(function () { return { ok: true, where: "local", order: order }; }), minWait]).then(function (r) {
      placing = false; ticket(r[0], order);
    });
  }

  function ticket(res, order) {
    show(LAST, 1);
    var pickup = 1;
    var cols = cupColors();
    current.innerHTML = '<div class="ticket"><div class="cupbox">' + SproutArt.cup({ colorA: cols.colorA, colorB: cols.colorB, label: "" }) + "</div>" +
      '<h2 class="display">Order #1 for ' + esc(order.name) + '</h2>' +
      '<div class="stub"><div class="lbl">Pickup number</div><div class="num">' + pickup + '</div><div class="dn">' + order.drinkName + " &middot; HK$" + order.price + "</div></div>" +
      '<div class="saved ' + (res.where === "github" ? "" : "local") + '">' + (res.where === "github" ? "Sent to the stage screen" : "Saved on this phone") + "</div></div>";
    var fill = current.querySelector(".cup-fill");
    if (fill && fill.animate) fill.animate([{ transform: "translateY(130px)" }, { transform: "translateY(0)" }], { duration: 1600, easing: "cubic-bezier(.3,.8,.3,1)", fill: "both" });
    var fire = function (o) { if (window.confetti) window.confetti(o); };
    setTimeout(function () {
      var c = ["#FF8A1F", "#2FA84F", "#B0244A", "#F6C445", "#8FD3F4"];
      fire({ particleCount: 90, spread: 80, origin: { y: .55 }, colors: c });
      setTimeout(function () { fire({ particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: .7 }, colors: c }); fire({ particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: .7 }, colors: c }); }, 350);
    }, 500);
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  // token dialog
  var dlg = $("#tokenDlg"), dot = $("#keyDot");
  function refreshDot() { dot.classList.toggle("on", !!SproutOrders.getToken()); }
  $("#keyBtn").addEventListener("click", function () {
    $("#tokenIn").value = SproutOrders.getToken();
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
  });
  $("#tokenSave").addEventListener("click", function () { SproutOrders.setToken($("#tokenIn").value || ""); refreshDot(); });
  refreshDot();

  show(0, 1);
})();
