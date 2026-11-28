/* Stage 6: SERVE (Role 5) — slides 17–19: price + menu board, order-ahead app, promotion. */
(function () {
  const M = () => CONTENT.menu, D = () => CONTENT.data, B = () => CONTENT.brand;
  const pct = (x) => Math.round(x * 100) + "%";

  // ---- shared styles for these three scenes ----
  const css = document.createElement("style");
  css.textContent = `
  /* 17: chalk board + split-flap prices */
  .sf-board{width:440px;background:#20301F;border:14px solid #8A6A4A;border-radius:26px;padding:28px 30px 34px;box-shadow:0 24px 50px rgba(0,0,0,.35);color:#F2D9C2;transform:rotate(-1.2deg)}
  .sf-h{font-family:var(--font-display);font-weight:900;font-size:50px;line-height:1}
  .sf-squig{display:block;width:190px;height:16px;margin-top:2px}
  .sf-row{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:7px 0;border-bottom:2px dashed rgba(255,244,226,.22)}
  .sf-row:last-child{border-bottom:0;padding-bottom:0}
  .sf-div{font-weight:700;font-size:22px;opacity:.7;margin-top:14px;padding-bottom:6px;border-bottom:2px dashed rgba(255,244,226,.22)}
  .sf-tbc{font-weight:700;font-size:24px;line-height:1.2;max-width:150px;text-align:right;color:#E8C26A}
  .sf-name{font-family:var(--font-display);font-weight:700;font-size:32px;line-height:1.05}
  .sf-name small{display:block;font-family:var(--font-body);font-weight:500;font-size:18px;opacity:.65;margin-top:2px}
  .flap{position:relative;display:block;width:170px;height:76px;border-radius:10px;overflow:hidden;background:linear-gradient(#3C3C3C 0 49%,#232323 51% 100%);box-shadow:inset 0 0 0 3px #101010,0 6px 0 rgba(0,0,0,.35)}
  .flap-roll{position:absolute;left:0;top:0;width:100%;height:228px}
  .flap-v{display:grid;place-items:center;height:76px;font-family:var(--font-display);font-weight:900;font-size:39px;color:#E8C26A}
  .flap-hinge{position:absolute;left:0;right:0;top:36px;height:4px;background:rgba(0,0,0,.6)}
  /* 17: demand curve card */
  .dc-card{width:620px;background:#F8EBDA;border-radius:26px;padding:22px 20px 10px;box-shadow:0 24px 60px rgba(0,0,0,.3);color:#25292B}
  .dc-h{font-family:var(--font-display);font-weight:900;font-size:38px;padding:0 14px 6px}
  /* 18: phone mockup */
  .pb-phone{width:540px;height:980px;border-radius:70px;background:#25292B;padding:16px;box-shadow:0 40px 80px rgba(0,0,0,.4)}
  .pb-screen{position:relative;width:508px;height:948px;border-radius:56px;background:#F2D9C2;overflow:hidden;color:#25292B}
  .pb-notch{position:absolute;left:50%;top:14px;transform:translateX(-50%);width:150px;height:26px;border-radius:14px;background:#25292B;z-index:5}
  .pb-bar{display:flex;justify-content:space-between;font-size:22px;font-weight:700;padding:52px 34px 0;opacity:.75}
  .pstage{position:absolute;left:0;right:0;top:104px;bottom:0;overflow:hidden}
  .pstep{position:absolute;inset:0;padding:8px 28px;background:#F2D9C2}
  .pstep-h{font-size:30px;font-weight:700;margin-bottom:20px}
  .pstep-h b{color:#6A9467}
  .pgrid{display:grid;grid-template-columns:1fr 1fr;gap:18px}
  .pchip{position:relative;display:flex;align-items:center;min-height:100px;border-radius:22px;background:#F8EBDA;border:3px solid rgba(37, 41, 43,.12);padding:14px 60px 14px 20px;font:700 28px/1.15 var(--font-body);text-align:left;color:#25292B}
  .pchip em{font-style:normal;display:block;font-weight:500;font-size:20px;opacity:.6;margin-top:4px}
  .ptick{position:absolute;right:14px;top:14px;width:42px;height:42px;border-radius:50%;background:#6A9467;color:#F8EBDA;display:grid;place-items:center;font-size:24px;font-weight:900;transform:scale(0)}
  .pb-finger{position:absolute;left:0;top:0;width:74px;height:74px;border-radius:50%;background:rgba(37, 41, 43,.22);border:5px solid #F8EBDA;box-shadow:0 8px 20px rgba(0,0,0,.25);z-index:6}
  .pticket{position:absolute;left:24px;right:24px;top:118px;bottom:36px;background:#F8EBDA;border-radius:28px;box-shadow:0 24px 60px rgba(0,0,0,.25);padding:40px 38px;text-align:center;display:flex;flex-direction:column;justify-content:center;gap:14px;opacity:0}
  .pt-ok{font-family:var(--font-display);font-weight:900;font-size:52px;color:#6A9467}
  .pt-no{font-size:26px;font-weight:700;opacity:.7}
  .pt-drink{font-family:var(--font-display);font-weight:900;font-size:56px;line-height:1}
  .pt-lines{font-size:24px;line-height:1.35;opacity:.8}
  .pt-price{font-family:var(--font-display);font-weight:900;font-size:64px;color:#9A3E4B}
  .pt-cta{font-size:24px;font-weight:700;background:#6A9467;color:#F8EBDA;border-radius:99px;padding:14px 24px}
  /* 19: wall, poster, promo video */
  .w-wall{position:absolute;inset:0;background:linear-gradient(#FFE7C4 0%, #FFD9A6 55%, #E8B877 100%)}
  .w-bricks{position:absolute;inset:0;background:repeating-linear-gradient(0deg, rgba(37, 41, 43,.05) 0 2px, transparent 2px 90px),repeating-linear-gradient(90deg, rgba(37, 41, 43,.05) 0 2px, transparent 2px 170px)}
  .w-shelf{position:absolute;left:0;right:0;bottom:0;height:90px;background:#8A6A4A;box-shadow:0 -12px 30px rgba(0,0,0,.15)}
  .po-poster{position:absolute;left:210px;top:420px;width:410px;height:552px;border-radius:14px;background:linear-gradient(160deg,#E08A45,#9A3E4B 80%);color:#F2D9C2;padding:38px 34px;box-shadow:0 26px 50px rgba(0,0,0,.35);display:flex;flex-direction:column;align-items:center;text-align:center;gap:16px}
  .po-brand{font-family:var(--font-display);font-weight:900;font-size:88px;line-height:.95}
  .po-mo{width:230px;height:290px;margin:4px 0}
  .po-slogan{font-family:var(--font-display);font-weight:500;font-size:33px;line-height:1.15}
  .po-cta{font-size:25px;font-weight:700;background:#F2D9C2;color:#9A3E4B;border-radius:99px;padding:12px 26px}
  .po-pin{position:absolute;left:392px;top:396px;width:44px;height:44px;border-radius:50%;background:#E8C26A;border:5px solid #25292B;box-shadow:0 8px 14px rgba(0,0,0,.3);z-index:3}
  .v-wrap{position:absolute;left:800px;top:170px;width:1060px}
  .v-frame{position:relative;width:1000px;height:575px;border-radius:26px;background:#1B1E20;padding:14px;box-shadow:0 30px 70px rgba(0,0,0,.35)}
  .ad{position:relative;width:972px;height:547px;border-radius:14px;overflow:hidden;color:#F2D9C2}
  .ad-bg{position:absolute;inset:0;background:radial-gradient(circle at 30% 30%, #FFB347 0%, #E08A45 42%, #9A3E4B 100%)}
  .ad-brand{position:absolute;left:0;right:0;top:96px;text-align:center;font-family:var(--font-display);font-weight:900;font-size:120px;line-height:.95;text-shadow:0 8px 0 rgba(90,20,20,.25)}
  .ad-slogan{position:absolute;left:0;right:0;top:240px;text-align:center;font-family:var(--font-display);font-weight:500;font-size:44px}
  .ad-sl{display:inline-block}
  .ad-cta{position:absolute;left:50%;bottom:52px;transform:translateX(-50%);font-size:30px;font-weight:700;background:#F2D9C2;color:#9A3E4B;border-radius:99px;padding:16px 36px;white-space:nowrap}
  .ad-mo{position:absolute;right:70px;bottom:24px;width:250px;height:320px}
  .ad-fruit{position:absolute;font-size:84px;line-height:1}
  .v-rec{position:absolute;left:34px;top:30px;display:flex;align-items:center;gap:12px;font-size:22px;font-weight:700;color:#F2D9C2;opacity:.9;z-index:2}
  .v-rec i{width:16px;height:16px;border-radius:50%;background:#E8364F;display:block}
  .v-cap{margin:18px 0 0 6px;font-size:22px;opacity:.75}
  .occ-row{display:flex;gap:24px;margin-top:26px}
  .occ-chip{display:flex;align-items:center;gap:14px;background:#F8EBDA;color:#25292B;border-radius:22px;padding:16px 24px;box-shadow:0 12px 28px rgba(0,0,0,.18);width:330px}
  .occ-e{font-size:42px;line-height:1}
  .occ-t{font-size:23px;font-weight:600;line-height:1.15}
  .occ-p{margin-left:auto;font-family:var(--font-display);font-weight:900;font-size:42px;color:#9A3E4B}
  `;
  document.head.appendChild(css);

  // ---------- numbers (all from content/data.js) ----------
  const cand = () => D()["03_candidate_prices"] || [];
  const candShare = (p) => pct((cand().find(r => r.price === p) || { share: 0 }).share);
  const priceSummary = (prefix) => (D()["03_price_summary"] || []).find(r => (r.variable || "").startsWith(prefix)) || {};
  const likert = (item) => pct(((D()["02_likert_summary"] || []).find(r => r.item === item) || { pct_agree: 0 }).pct_agree);
  const occPct = (key) => pct(((D()["04_occasion"] || []).find(r => r.key === key) || { pct: 0 }).pct);

  // ---------- split-flap price tile ----------
  function flapHTML(text) {
    const junkA = text.indexOf("$") >= 0 ? text.replace(/\d+/g, "··") : "····";
    const junkB = text.indexOf("$") >= 0 ? text.replace(/\d+/g, "99") : "8888";
    return `<span class="flap"><span class="flap-roll"><span class="flap-v">${junkA}</span><span class="flap-v">${junkB}</span><span class="flap-v">${text}</span></span><i class="flap-hinge"></i></span>`;
  }

  // ---------- 17 geometry: demand curve ----------
  const CH = { VW: 640, VH: 680, X0: 78, Y0: 46, W: 520, H: 540, P0: 10, P1: 40 };
  function chartGeom() {
    const rows = (D()["03_demand_curve"] || []).filter(r => r.price >= CH.P0 && r.price <= CH.P1);
    const px = (p) => CH.X0 + ((p - CH.P0) / (CH.P1 - CH.P0)) * CH.W;
    const py = (s) => CH.Y0 + (1 - s) * CH.H;
    return { rows, px, py };
  }
  function chartSVG() {
    const g = chartGeom();
    const path = g.rows.map((r, i) => `${i ? "L" : "M"}${g.px(r.price).toFixed(1)} ${g.py(r.share).toFixed(1)}`).join("");
    let grid = "", ylab = "", xlab = "";
    [0, 0.25, 0.5, 0.75, 1].forEach(s => {
      grid += `<line x1="${CH.X0}" y1="${g.py(s)}" x2="${CH.X0 + CH.W}" y2="${g.py(s)}" stroke="#25292B" stroke-opacity=".12" stroke-width="2"/>`;
      ylab += `<text x="${CH.X0 - 14}" y="${g.py(s) + 8}" text-anchor="end" font-size="22" fill="#25292B" fill-opacity=".7">${Math.round(s * 100)}%</text>`;
    });
    [10, 15, 20, 25, 30, 35, 40].forEach(p => {
      xlab += `<text x="${g.px(p)}" y="${CH.Y0 + CH.H + 38}" text-anchor="middle" font-size="22" fill="#25292B" fill-opacity=".7">${p}</text>`;
    });
    const mk = (p, dx, dy) => {
      const r = cand().find(x => x.price === p) || { share: 0 };
      return `<g class="dc-mk"><circle cx="${g.px(p)}" cy="${g.py(r.share)}" r="10" fill="#9A3E4B"/>
        <text x="${g.px(p) + dx}" y="${g.py(r.share) + dy}" font-size="24" font-weight="700" fill="#25292B">HK$${p} = ${pct(r.share)}</text></g>`;
    };
    const x25 = g.px(25), y25 = g.py((cand().find(x => x.price === 25) || { share: 0 }).share);
    return `<svg class="dc-svg" viewBox="0 0 ${CH.VW} ${CH.VH}" style="display:block;width:580px">
      ${grid}${ylab}${xlab}
      <line x1="${CH.X0}" y1="${CH.Y0}" x2="${CH.X0}" y2="${CH.Y0 + CH.H}" stroke="#25292B" stroke-width="4"/>
      <line x1="${CH.X0}" y1="${CH.Y0 + CH.H}" x2="${CH.X0 + CH.W}" y2="${CH.Y0 + CH.H}" stroke="#25292B" stroke-width="4"/>
      <text x="${CH.X0}" y="${CH.Y0 - 14}" font-size="22" fill="#25292B" fill-opacity=".7">share who would pay, by price (HK$)</text>
      <text x="${CH.X0 + CH.W}" y="${CH.Y0 + CH.H + 38}" text-anchor="end" font-size="22" fill="#25292B" fill-opacity="0"></text>
      <path class="dc-path" d="${path}" fill="none" stroke="#9A3E4B" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
      ${mk(28, 18, -10)}${mk(30, 18, 36)}
      <circle class="dc-dot" cx="${g.px(10)}" cy="${g.py(1)}" r="15" fill="#E8C26A" stroke="#25292B" stroke-width="6"/>
      <g class="dc-flag">
        <rect x="${x25 - 118}" y="${y25 - 96}" width="236" height="56" rx="16" fill="#E8C26A" stroke="#25292B" stroke-width="5"/>
        <text x="${x25}" y="${y25 - 58}" text-anchor="middle" font-size="27" font-weight="700" fill="#25292B">HK$25 = ${candShare(25)}</text>
      </g>
    </svg>`;
  }

  // ---------------- 17. HK$25 keeps the live share in ----------------
  Deck.add({
    n: 17, stage: "serve", title: `HK$25 keeps ${candShare(25)} in`, budget: 60,
    notes: `Role 5.\nClick 1: the chalk menu board drops in and the prices flip in like a split-flap display.\nClick 2: the demand curve draws itself, markers land at HK$28 and HK$30, the gold dot slides to HK$25 = ${candShare(25)}.\nClick 3: the three points.`,
    html: () => `
      <div class="pad" style="right:auto;width:620px;display:flex;flex-direction:column;justify-content:center">
        <div class="s-kicker">Serve: price</div>
        <h2 class="s-title tt" style="font-size:98px;margin:12px 0 44px">HK$25 keeps ${candShare(25)} in</h2>
        <ul class="points pp">
          <li><span>At <b>HK$25</b>, <b>${candShare(25)}</b> would still buy.</span></li>
          <li><span>HK$28 keeps only <b>${candShare(28)}</b>; HK$30, <b>${candShare(30)}</b>.</span></li>
          <li><span>Usual spend <b>HK$${Math.round(priceSummary("Usual spend").median_clean || 0)}</b>; median top price <b>HK$${Math.round(priceSummary("Max for any drink").median_clean || 0)}</b>.</span></li>
        </ul>
      </div>
      <div class="board sf-board" style="position:absolute;left:790px;top:130px">
        <div class="sf-h">Menu</div>
        <svg class="sf-squig" viewBox="0 0 190 16"><path d="M4 10 Q30 2 56 10 T108 10 T160 10 T186 8" stroke="#F2D9C2" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/></svg>
        <div class="sf-sub">${B().name} smoothies</div>
        ${(M().sections || []).map(sec => `<div class="sf-row"><span class="sf-name">${sec.title}${sec.ml ? `<small>${sec.ml} ml</small>` : ""}</span>${sec.price ? flapHTML("HK$" + sec.price) : `<span class="sf-tbc">price to be confirmed</span>`}</div>`).join("")}
        <div class="sf-div">Cup sizes</div>
        ${M().sizes.map(s => `<div class="sf-row"><span class="sf-name">${s.name}</span>${flapHTML("HK$" + s.price)}</div>`).join("")}
        <div class="sf-row"><span class="sf-name">Boosts<small>one scoop each</small></span>${flapHTML("+HK$5")}</div>
      </div>
      <div class="chartcard dc-card" style="position:absolute;left:1260px;top:190px">
        <div class="dc-h">What they would pay</div>
        ${chartSVG()}
      </div>
      <div class="source">Source: 03_demand_curve.csv, 03_candidate_prices.csv, 03_price_summary.csv (n = ${Kit.nUsable()})</div>`,
    steps: [
      (el) => {
        gsap.set(el.querySelectorAll(".pp li"), { opacity: 0, x: -30 });
        el.querySelectorAll(".flap-roll").forEach(roll => gsap.set(roll, { y: 0 }));
        const tl = gsap.timeline();
        tl.from(el.querySelector(".tt"), { y: 50, opacity: 0, duration: 0.5, ease: "back.out(1.6)" })
          .from(el.querySelector(".board"), { y: -500, rotate: -8, opacity: 0, duration: 0.7, ease: "bounce.out" }, 0.1)
          .add(() => Deck.ctx.sfx("thunk"), 0.1);
        el.querySelectorAll(".sf-row .flap").forEach((f, i) => {
          const at = 0.55 + i * 0.18;
          tl.from(f, { rotateX: -95, opacity: 0, duration: 0.3, ease: "back.out(2)" }, at)
            .to(f.querySelector(".flap-roll"), { keyframes: [{ yPercent: -33.33, duration: 0.1, ease: "none" }, { yPercent: -66.67, duration: 0.1, ease: "none" }] }, at + 0.12)
            .add(() => Deck.ctx.sfx("click"), at + 0.12);
        });
        return tl;
      },
      (el) => {
        const g = chartGeom();
        const path = el.querySelector(".dc-path");
        const len = path.getTotalLength ? path.getTotalLength() : 1200;
        const dot = el.querySelector(".dc-dot");
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
        gsap.set(el.querySelectorAll(".dc-mk"), { scale: 0, transformOrigin: "50% 50%" });
        gsap.set(el.querySelector(".dc-flag"), { scale: 0, opacity: 0 });
        gsap.set(dot, { opacity: 0, attr: { cx: g.px(10), cy: g.py(1) } });
        const tl = gsap.timeline();
        tl.from(el.querySelector(".dc-card"), { y: 90, opacity: 0, duration: 0.5, ease: "power3.out" })
          .to(path, { strokeDashoffset: 0, duration: 1.2, ease: "power2.inOut" }, 0.15)
          .to(el.querySelectorAll(".dc-mk"), { scale: 1, duration: 0.3, ease: "back.out(2.5)", stagger: 0.1 }, 0.95)
          .add(() => Deck.ctx.sfx("pop"), 0.95);
        tl.set(dot, { opacity: 1 }, 1.15);
        g.rows.filter(r => r.price > 10 && r.price <= 25).forEach((r, i) => {
          tl.to(dot, { attr: { cx: g.px(r.price), cy: g.py(r.share) }, duration: 0.05, ease: "none" }, 1.2 + i * 0.05);
        });
        tl.to(el.querySelector(".dc-flag"), { scale: 1, opacity: 1, duration: 0.35, ease: "back.out(2.2)" }, 2.15)
          .add(() => Deck.ctx.sfx("sparkle"), 2.15);
        return tl;
      },
      (el) => gsap.timeline().to(el.querySelectorAll(".pp li"), { opacity: 1, x: 0, stagger: 0.14, duration: 0.35, ease: "power2.out" })
    ]
  });

  // ---------------- 18. Skip the queue (order-ahead app) ----------------
  let pbPhase = 0, pbSig = "";
  const orderSig = (o) => JSON.stringify([o.name, o.fruits, o.base, o.addons, o.size, o.price]);

  function pbScreens(o, ctx) {
    const pick = (label, sub, on) => `<button class="pchip pick-target" type="button">${label}${sub ? `<em>${sub}</em>` : ""}<span class="ptick">✓</span></button>`;
    const anyChip = (label, sub) => `<button class="pchip" type="button">${label}${sub ? `<em>${sub}</em>` : ""}</button>`;
    const chosen = (arr) => (o[arr] || []);
    const rows = (list, isOn, lab, sub) => list.map(x => isOn(x) ? pick(lab(x), sub(x)) : anyChip(lab(x), sub(x))).join("");
    const p1 = rows(M().fruits, f => chosen("fruits").includes(f.key), f => `${f.emoji} ${f.name}`, () => "");
    const p2 = rows(M().bases, b => b.key === o.base, b => b.name, () => "");
    const p3 = rows(M().addons, a => chosen("addons").includes(a.key), a => a.fancy,
      a => a.fancy === a.name ? `${a.pctNote ? a.pctNote + " · " : ""}+HK$${a.price}` : `${a.name} +HK$${a.price}`);
    const p4 = rows(M().sizes, s => s.key === o.size, s => s.name, s => s.name.includes("ml") ? `HK$${s.price}` : `HK$${s.price} · ${s.ml} ml`);
    const panel = (n, head, chips, off) => `<div class="pstep" data-n="${n}" ${off ? `style="transform:translateX(110%)"` : ""}>
        <div class="pstep-h"><b>${n} / 4</b> ${head}</div><div class="pgrid">${chips}</div></div>`;
    return `<div class="pstage">
        ${panel(1, "Choose fruit", p1)}
        ${panel(2, "Pick a base", p2, true)}
        ${panel(3, "Add boosts", p3, true)}
        ${panel(4, "Cup size", p4, true)}
      </div>`;
  }
  function pbTicket(o, ctx) {
    const sz = ctx.size(o.size);
    const fr = (o.fruits || []).map(k => ctx.fruit(k)).filter(Boolean);
    const b = ctx.base(o.base);
    const adds = (o.addons || []).map(k => ctx.addon(k)).filter(Boolean);
    const price = o.price != null ? o.price : (sz ? sz.price : 0) + adds.reduce((a, x) => a + (x.price || 0), 0);
    const parts = [...fr.map(f => `${f.emoji} ${f.name}`), b && b.name, ...adds.map(a => a.fancy), sz && (sz.name.includes("ml") ? sz.name : `${sz.name} ${sz.ml} ml`)].filter(Boolean);
    return `<div class="pticket">
      <img src="../${CONTENT.drinkImage(o)}" alt="" style="width:160px;height:200px;object-fit:contain;margin:0 auto 6px">
      <div class="pt-ok">✓ Order placed</div>
      <div class="pt-no">Order #1, ${o.name || "Guest"}</div>
      <div class="pt-drink">${o.drinkName || CONTENT.drinkName(o.fruits, o.base)}</div>
      <div class="pt-lines">${parts.join(", ")}</div>
      <div class="pt-price">HK$${price}</div>
      <div class="pt-cta">Ready at YIA — skip the queue</div>
    </div>`;
  }
  function pbLocalPos(target, root) {
    let x = 0, y = 0, el = target;
    while (el && el !== root) { x += el.offsetLeft; y += el.offsetTop; el = el.offsetParent; }
    return { x, y };
  }
  function pbTap(tl, el, chip, at) {
    const finger = el.querySelector(".pb-finger");
    const scr = el.querySelector(".pb-screen");
    const pos = pbLocalPos(chip, scr);
    const x = pos.x + chip.offsetWidth * 0.5 - 20, y = pos.y + chip.offsetHeight * 0.5 - 24;
    tl.to(finger, { x, y, opacity: 1, duration: 0.2, ease: "power2.out" }, at)
      .to(finger, { scale: 0.8, duration: 0.07, yoyo: true, repeat: 1 }, at + 0.2)
      .to(chip, { scale: 0.94, duration: 0.08, yoyo: true, repeat: 1 }, at + 0.22)
      .to(chip, { backgroundColor: "#6A9467", borderColor: "#6A9467", color: "#F8EBDA", duration: 0.18 }, at + 0.22)
      .add(() => Deck.ctx.sfx("click"), at + 0.22)
      .to(chip.querySelector(".ptick"), { scale: 1, duration: 0.25, ease: "back.out(3)" }, at + 0.28);
    return at + 0.5;
  }
  function pbStepA(el) {
    pbPhase = 1;
    const tl = gsap.timeline();
    const p = (n) => el.querySelector(`.pstep[data-n="${n}"]`);
    gsap.set([p(2), p(3), p(4)], { xPercent: 110 });
    gsap.set(p(1), { xPercent: 0 });
    gsap.set(el.querySelectorAll(".ptick"), { scale: 0 });
    gsap.set(el.querySelector(".pticket"), { opacity: 0, y: 60, scale: 0.85 });
    gsap.set(el.querySelector(".pstage"), { y: 0, opacity: 1 });
    gsap.set(el.querySelector(".pb-finger"), { x: 420, y: 800, opacity: 0 });
    gsap.set(el.querySelectorAll(".pp li"), { opacity: 0, x: -30 });
    tl.from(el.querySelector(".pb-phone"), { y: 1100, duration: 0.6, ease: "back.out(1.2)" })
      .from(el.querySelector(".tt"), { y: 50, opacity: 0, duration: 0.45, ease: "back.out(1.6)" }, 0.1)
      .from(el.querySelector(".pstep-h"), { y: -24, opacity: 0, duration: 0.3, ease: "power2.out" }, 0.4);
    let at = 0.6;
    p(1).querySelectorAll(".pchip.pick-target").forEach(c => { at = pbTap(tl, el, c, at); });
    return tl;
  }
  function pbStepB(el) {
    pbPhase = 2;
    const tl = gsap.timeline();
    const p = (n) => el.querySelector(`.pstep[data-n="${n}"]`);
    let at = 0;
    [2, 3, 4].forEach(n => {
      tl.to(p(n - 1), { xPercent: -110, duration: 0.26, ease: "power2.inOut" }, at)
        .to(p(n), { xPercent: 0, duration: 0.26, ease: "power2.out" }, at);
      at += 0.3;
      p(n).querySelectorAll(".pchip.pick-target").forEach(c => { at = pbTap(tl, el, c, at); });
    });
    return tl;
  }
  function pbStepC(el) {
    pbPhase = 3;
    const tl = gsap.timeline();
    tl.to(el.querySelector(".pstage"), { y: -40, opacity: 0.25, duration: 0.3, ease: "power2.in" })
      .to(el.querySelector(".pb-finger"), { opacity: 0, duration: 0.2 }, 0)
      .to(el.querySelector(".pticket"), { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.7)" }, 0.2)
      .to(el.querySelector(".pstage"), { opacity: 0, duration: 0.3 }, 0.2)
      .add(() => Deck.ctx.sfx("tada"), 0.35)
      .from(el.querySelector(".pt-ok"), { scale: 0.3, opacity: 0, duration: 0.35, ease: "back.out(2.5)" }, 0.4)
      .from(el.querySelectorAll(".pt-no, .pt-drink, .pt-lines, .pt-price, .pt-cta"), { y: 24, opacity: 0, stagger: 0.07, duration: 0.3, ease: "power2.out" }, 0.5);
    return tl;
  }
  function pbApplyPhase(el) {
    const p = (n) => el.querySelector(`.pstep[data-n="${n}"]`);
    // After step 1 panel 1 is done and visible; after step 2 every panel is done and panel 4 shows.
    const vis = pbPhase >= 2 ? 4 : 1;
    const donePanels = pbPhase >= 2 ? [1, 2, 3, 4] : (pbPhase >= 1 ? [1] : []);
    [1, 2, 3, 4].forEach(n => {
      gsap.set(p(n), { xPercent: n < vis ? -110 : (n === vis ? 0 : 110) });
      p(n).querySelectorAll(".pchip.pick-target").forEach(c => {
        const on = donePanels.indexOf(n) >= 0;
        gsap.set(c, on ? { backgroundColor: "#6A9467", borderColor: "#6A9467", color: "#F8EBDA" }
                      : { backgroundColor: "#F8EBDA", borderColor: "rgba(37, 41, 43,.12)", color: "#25292B" });
        gsap.set(c.querySelector(".ptick"), { scale: on ? 1 : 0 });
      });
    });
    gsap.set(el.querySelector(".pb-finger"), { x: 420, y: 800, opacity: 0 });
    gsap.set(el.querySelector(".pticket"), pbPhase >= 3 ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 60, scale: 0.85 });
    if (pbPhase >= 3 && el.querySelector(".pstage")) gsap.set(el.querySelector(".pstage"), { opacity: 0 });
    gsap.set(el.querySelector(".pstage"), pbPhase >= 3 ? { y: -40, opacity: 0.25 } : { y: 0, opacity: 1 });
  }

  Deck.add({
    n: 18, stage: "serve", title: "Skip the queue", budget: 35, usesOrder: true,
    notes: "Role 5.\nClick 1: the phone slides up and taps the professor's fruit.\nClick 2: base, boosters and size get tapped in turn.\nClick 3: the Order placed ticket.\nClick 4: the points.\nIf a new live order arrives (toolbar Reload Order or R), the flow rebuilds and replays.",
    html: (ctx) => {
      const o = ctx.order || M().exampleOrder;
      pbSig = orderSig(o); pbPhase = 0;
      return `
      <div class="pad" style="right:auto;width:640px;display:flex;flex-direction:column;justify-content:center">
        <div class="s-kicker">Serve: order ahead</div>
        <h2 class="s-title tt" style="font-size:118px;margin:12px 0 44px">Skip the queue</h2>
        <ul class="points pp">
          <li><span>Order ahead in the app, pick up at YIA.</span></li>
          <li><span><b>${likert("Would use pre-order app")}</b> would use a pre-order app.</span></li>
          <li><span><b>${likert("Would join loyalty program")}</b> would join a loyalty programme.</span></li>
        </ul>
      </div>
      <div class="pb-phone" style="position:absolute;left:1080px;top:50px">
        <div class="pb-screen">
          <div class="pb-notch"></div>
          <div class="pb-bar"><span>9:41</span><span>${B().name}, YIA pickup</span></div>
          ${pbScreens(o, ctx)}
          ${pbTicket(o, ctx)}
          <div class="pb-finger"></div>
        </div>
      </div>
      <div class="source">Source: 02_likert_summary.csv (agree or strongly agree, n = ${Kit.nUsable()})</div>`;
    },
    steps: [pbStepA, pbStepB, pbStepC,
      (el) => gsap.timeline().to(el.querySelectorAll(".pp li"), { opacity: 1, x: 0, stagger: 0.14, duration: 0.35, ease: "power2.out" })],
    onOrder: (el, o, ctx) => {
      const sig = orderSig(o);
      if (sig === pbSig) return; // same order: leave the running flow alone
      pbSig = sig;
      const scr = el.querySelector(".pb-screen");
      if (!scr) return;
      scr.querySelectorAll(".pstage, .pticket").forEach(n => n.remove());
      scr.querySelector(".pb-finger").insertAdjacentHTML("beforebegin", pbScreens(o, ctx) + pbTicket(o, ctx));
      gsap.killTweensOf(scr.querySelectorAll("*"));
      if (pbPhase >= 3) { // parked on the ticket: replay the flow for the new order
        pbPhase = 0;
        gsap.timeline().add(pbStepA(el)).add(pbStepB(el)).add(pbStepC(el));
      } else pbApplyPhase(el);
    }
  });

  // ---------------- 19. Made for hanging out (promotion) ----------------
  const AD_SLOGAN = B().slogan;
  function adHTML(ctx) {
    const fruits = [["🥭", 130, 150], ["🍓", 320, 330], ["🍌", 70, 380], ["🫐", 260, 90], ["🍑", 430, 220]];
    return `<div class="ad">
      <div class="ad-bg"></div>
      ${fruits.map(([e, x, y]) => `<span class="ad-fruit" style="left:${x}px;top:${y}px">${e}</span>`).join("")}
      <div class="ad-brand">${B().name}</div>
      <div class="ad-slogan">${AD_SLOGAN.split(" ").map(w => `<span class="ad-sl">${w}</span>`).join(" ")}</div>
      <div class="ad-cta">Order ahead at YIA</div>
      <div class="ad-mo">${ctx.art.mascot({ cup: true })}</div>
    </div>`;
  }
  const occEmoji = { friends: "🎉", dessert: "🍨", cool_down: "☀️" };
  function occHTML() {
    return (D()["04_occasion"] || []).filter(r => occEmoji[r.key]).map(r => `
      <div class="occ-chip"><span class="occ-e">${occEmoji[r.key]}</span><span class="occ-t">${r.option}</span><b class="occ-p">${pct(r.pct)}</b></div>`).join("");
  }

  Deck.add({
    n: 19, stage: "serve", title: "Made for hanging out", budget: 70, music: "brand", musicVol: 0.18,
    notes: "Role 5.\nClick 1: the poster flies in and pins to the wall (it swings, then settles).\nClick 2: the promo frame lights up and the occasion chips pop. The brand song plays quietly.\nPLACEHOLDER: drop assets/video/promo.mp4 in and swap the animated .ad for a <video> tag (see comment in 06-serve.js).",
    html: (ctx) => `
      <div class="w-wall"></div><div class="w-bricks"></div><div class="w-shelf"></div>
      <div class="pad" style="right:auto;width:640px;color:#25292B">
        <div class="s-kicker">Serve: promotion</div>
        <h2 class="s-title tt" style="font-size:104px;margin:12px 0 40px">Made for hanging out</h2>
        
      </div>
      <div class="po-pin"></div>
      <div class="po-poster">
        <img class="po-logo" src="../assets/img/cue-logo.png" alt="CUE" style="height:110px;width:auto">
        <div class="po-mo">${ctx.art.mascot({ cup: true })}</div>
        <span class="po-slogan">${B().slogan}</span>
        <span class="po-cta">Order ahead at YIA</span>
      </div>
      <div class="v-wrap">
        <!-- PLACEHOLDER promo video. To use the real file later, replace everything inside .v-frame with:
             <video class="ad" src="../assets/video/promo.mp4" autoplay muted loop playsinline></video>
             The animated GSAP mini-ad below stands in until assets/video/promo.mp4 exists. -->
        <div class="v-frame">
          ${adHTML(ctx)}
          <div class="v-rec"><i></i> promo, looping</div>
        </div>
        <div class="occ-row">${occHTML()}</div>
      </div>
      <div class="source">Source: 04_occasion.csv (n = ${Kit.nUsable()}); brand placeholder from content/brand.js</div>`,
    ambient: (el) => {
      const ad = el.querySelector(".ad");
      const fruits = ad.querySelectorAll(".ad-fruit");
      const mo = ad.querySelector(".ad-mo");
      const sl = ad.querySelectorAll(".ad-sl");
      const cta = ad.querySelector(".ad-cta");
      const tl = gsap.timeline({ repeat: -1 });
      // fruit bursts every 6 s
      for (let k = 0; k < 3; k++) {
        fruits.forEach((f, i) => {
          tl.to(f, { scale: 1.4, rotate: 28, y: -22, duration: 0.35, ease: "back.out(2)" }, k * 6 + i * 0.09)
            .to(f, { scale: 1, rotate: 0, y: 0, duration: 0.5, ease: "power2.out" }, k * 6 + 0.45 + i * 0.09);
        });
        tl.to(mo, { y: -14, rotate: 3, duration: 0.45, ease: "power2.out" }, k * 6)
          .to(mo, { y: 0, rotate: 0, duration: 0.5, ease: "bounce.out" }, k * 6 + 0.45)
          .to(ad.querySelector(".mo-arm-r"), { rotate: -50, duration: 0.3, ease: "back.out(2)" }, k * 6 + 0.2)
          .to(ad.querySelector(".mo-arm-r"), { rotate: 0, duration: 0.3 }, k * 6 + 0.9);
      }
      // slogan wave (18 s loop)
      sl.forEach((w, i) => tl.to(w, { y: -9, duration: 0.45, ease: "sine.inOut", yoyo: true, repeat: 37 }, i * 0.22));
      // cta pulse
      [1.5, 7.5, 13.5].forEach(t => tl.to(cta, { scale: 1.07, duration: 0.3, yoyo: true, repeat: 1, ease: "power2.out" }, t));
      return tl;
    },
    steps: [
      (el) => {
        gsap.set(el.querySelectorAll(".pp li"), { opacity: 0, x: -30 });
        gsap.set(el.querySelectorAll(".occ-chip"), { opacity: 0, y: 30 });
        gsap.set(el.querySelector(".po-pin"), { scale: 0, transformOrigin: "50% 50%" });
        const poster = el.querySelector(".po-poster");
        return gsap.timeline()
          .from(el.querySelector(".tt"), { y: 50, opacity: 0, duration: 0.5, ease: "back.out(1.6)" })
          .fromTo(poster, { x: -900, y: -140, rotate: -34, opacity: 0 }, { x: 0, y: 0, rotate: -3.5, opacity: 1, duration: 0.9, ease: "power3.out" }, 0.15)
          .add(() => Deck.ctx.sfx("whoosh"), 0.2)
          .to(el.querySelector(".po-pin"), { scale: 1, duration: 0.25, ease: "back.out(3)" }, 0.95)
          .add(() => Deck.ctx.sfx("thunk"), 0.95)
          .to(poster, { rotate: 1.2, duration: 0.28, ease: "power2.inOut" }, 1.05)
          .to(poster, { rotate: -4.6, duration: 0.3, ease: "power2.inOut" }, 1.33)
          .to(poster, { rotate: -3.5, duration: 0.35, ease: "sine.out" }, 1.63);
      },
      (el) => {
        const frame = el.querySelector(".v-frame");
        return gsap.timeline()
          .from(frame, { scale: 0.94, opacity: 0.4, duration: 0.35, ease: "power2.out" })
          .to(frame, { scale: 1.02, duration: 0.14, yoyo: true, repeat: 1, ease: "power1.inOut" }, 0.3)
          .add(() => Deck.ctx.sfx("pop"), 0.35)
          .to(el.querySelectorAll(".occ-chip"), { opacity: 1, y: 0, stagger: 0.14, duration: 0.35, ease: "back.out(1.8)" }, 0.5);
      }
    ],
    // Print/PDF: the ambient mini-ad never runs, so pin the frame to its endcard look.
    printFix: (el) => {
      gsap.set(el.querySelectorAll(".ad-fruit, .ad-mo, .ad-sl, .ad-cta, .ad-brand, .ad-slogan"), { clearProps: "transform,opacity" });
    }
  });
})();
