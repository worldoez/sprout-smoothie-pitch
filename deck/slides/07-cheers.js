/* Stage 7: CHEERS (Role 6) — slides 20–21: evidence + risks, then the finale. */
(function () {
  // ---- slide 20 scene styles ----
  const css20 = document.createElement("style");
  css20.textContent = `
  .ck-card{width:980px;background:#F8EBDA;border-radius:30px;padding:26px 40px;color:#25292B;box-shadow:0 24px 60px rgba(0,0,0,.22)}
  .ck-row{display:flex;align-items:center;gap:26px;min-height:70px;padding:8px 0;border-bottom:3px dashed rgba(37, 41, 43,.12);font-size:34px;font-weight:600;line-height:1.15}
  .ck-row:last-child{border-bottom:0}
  .ck-row b{color:#9A3E4B}
  .stamp{margin-left:auto;flex:0 0 auto;width:66px;height:66px;border-radius:50%;display:grid;place-items:center;font-family:var(--font-display);font-weight:900;font-size:38px;color:#F8EBDA;box-shadow:0 8px 0 rgba(0,0,0,.15);transform:rotate(-8deg)}
  .stamp.ok{background:#6A9467}
  .stamp.warn{background:#E8C26A;color:#25292B}
  .ck-pp b{color:#5E2431}
  `;
  document.head.appendChild(css20);

  // Evidence numbers, all read from content/data.js at load time.
  const D20 = () => CONTENT.data;
  const pct20 = (x) => Math.round(x * 100) + "%";
  const intent = () => (D20().results && D20().results.intent) || { top2: 0, calibrated: 0 };
  const fruitPct = (key) => pct20(((D20()["04_fruit"] || []).find(r => r.key === key) || { pct: 0 }).pct);
  const basePct = (key) => pct20(((D20()["04_base"] || []).find(r => r.key === key) || { pct: 0 }).pct);
  const candShare = (p) => pct20(((D20()["03_candidate_prices"] || []).find(r => r.price === p) || { share: 0 }).share);
  const stability = () => {
    const rows = D20()["08_tier_stability"] || [];
    return { changes: rows.filter(r => r.conclusion_changes === "TRUE").length, total: rows.length };
  };
  const nUsable = () => (D20().results && D20().results.n && D20().results.n.usable) || Kit.nUsable();

  function storeSVG() {
    const tabs = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i =>
      `<path class="k-tab" d="M${110 + i * 50} 182 h50 v54 a25 22 0 0 1 -50 0 z" fill="${i % 2 ? "#9A3E4B" : "#F2D9C2"}" stroke="#25292B" stroke-width="5"/>`).join("");
    return `<svg class="kiosk" viewBox="0 0 820 640" style="width:720px;height:561px;overflow:visible">
      <ellipse cx="400" cy="608" rx="330" ry="24" fill="#25292B" opacity=".12"/>
      <rect x="130" y="170" width="20" height="432" fill="#8A6A4A" stroke="#25292B" stroke-width="5"/>
      <rect x="670" y="170" width="20" height="432" fill="#8A6A4A" stroke="#25292B" stroke-width="5"/>
      <g class="k-sign">
        <rect x="150" y="34" width="520" height="128" rx="26" fill="#E08A45" stroke="#25292B" stroke-width="8"/>
        <text x="410" y="126" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="900" font-size="92" fill="#F2D9C2">CUE</text>
      </g>
      <g class="k-awn">${tabs}</g>
      <rect x="150" y="300" width="520" height="300" rx="18" fill="#F2D9C2" stroke="#25292B" stroke-width="8"/>
      <rect x="190" y="332" width="300" height="158" rx="12" fill="#9EC4C0" stroke="#25292B" stroke-width="6"/>
      <g class="k-blender">
        <path d="M262 372 H338 L328 462 H272 Z" fill="#FFF" fill-opacity=".55" stroke="#25292B" stroke-width="5"/>
        <path d="M270 410 H330 L328 462 H272 Z" fill="#FFB020"/>
        <rect x="252" y="358" width="96" height="18" rx="8" fill="#25292B"/>
      </g>
      <circle cx="382" cy="440" r="22" fill="#FFB020" stroke="#25292B" stroke-width="4"/>
      <circle cx="428" cy="450" r="16" fill="#E8364F" stroke="#25292B" stroke-width="4"/>
      <rect x="520" y="332" width="120" height="112" rx="10" fill="#1E2A1F" stroke="#8A6A4A" stroke-width="6"/>
      <line x1="540" y1="362" x2="620" y2="362" stroke="#F2D9C2" stroke-width="6" stroke-linecap="round" opacity=".8"/>
      <line x1="540" y1="390" x2="604" y2="390" stroke="#F2D9C2" stroke-width="6" stroke-linecap="round" opacity=".6"/>
      <line x1="540" y1="418" x2="614" y2="418" stroke="#F2D9C2" stroke-width="6" stroke-linecap="round" opacity=".45"/>
      <rect x="170" y="500" width="480" height="26" rx="12" fill="#8A6A4A" stroke="#25292B" stroke-width="5"/>
    </svg>`;
  }

  Deck.add({
    n: 20, stage: "cheers", title: "The evidence", budget: 90,
    notes: "Role 6.\nClick 1: the pop-up store builds itself and Cue steps up with the cup.\nClick 2: every evidence line gets stamped — green where it holds, amber for the caveats (thunk).\nClick 3: risks and the next step.\nStore art is a placeholder; swap in assets/img/store.png later (see comment in 07-cheers.js).",
    html: (ctx) => {
      const st = stability();
      const it = intent();
      const rows = [
        [`<b>${pct20(it.top2)}</b> would buy (calibrated <b>~${pct20(it.calibrated)}</b>)`, "ok"],
        [`<b>HK$25</b> keeps <b>${candShare(25)}</b>`, "ok"],
        [`<b>Mango ${fruitPct("mango")}</b> and <b>yogurt ${basePct("yogurt")}</b> lead`, "ok"],
        [`<b>${st.changes} of ${st.total}</b> tests change with cleaning`, "warn"],
        [`<b>${nUsable()} answers</b> is a small sample`, "warn"]
      ];
      return `
      <div class="pad" style="right:auto;width:1020px">
        <div class="s-kicker">Cheers: why it works</div>
        <h2 class="s-title tt" style="font-size:100px;margin:10px 0 24px">The evidence</h2>
        <div class="ck-card">
          ${rows.map(([t, kind]) => `<div class="ck-row"><span class="ck-t">${t}</span><span class="stamp ${kind}">${kind === "ok" ? "✓" : "!"}</span></div>`).join("")}
        </div>
        <ul class="points pp ck-pp" style="max-width:1000px;margin-top:22px;font-size:32px;gap:14px">
          <li><span>Risks: real buying is lower than stated; cost per cup not yet measured.</span></li>
          <li><span>Next step: a <b>one-week pop-up at YIA</b> to test demand and price.</span></li>
        </ul>
      </div>
      <div class="kiosk-zone" style="position:absolute;left:1160px;top:250px">
        <!-- PLACEHOLDER store illustration. When the AI render exists, replace storeSVG() with:
             <img src="../assets/img/store.png" style="width:720px"> -->
        ${storeSVG()}
      </div>
      <div class="k-mo" style="position:absolute;left:1530px;top:368px;width:330px;height:420px">${ctx.art.mascot({ cup: true })}</div>
      <div class="source">Source: 08_tier_stability.csv, 09_sample_size_targets.csv, Role 6 checklist</div>`;
    },
    steps: [
      (el) => {
        gsap.set(el.querySelectorAll(".pp li"), { opacity: 0, x: -30 });
        gsap.set(el.querySelectorAll(".ck-row"), { opacity: 0, x: 50 });
        gsap.set(el.querySelectorAll(".stamp"), { scale: 0, transformOrigin: "50% 50%" });
        return gsap.timeline()
          .from(el.querySelector(".tt"), { y: 50, opacity: 0, duration: 0.5, ease: "back.out(1.6)" })
          .from(el.querySelector(".kiosk"), { y: 240, opacity: 0, duration: 0.7, ease: "power3.out" }, 0.1)
          .from(el.querySelector(".k-sign"), { y: -140, rotate: -8, opacity: 0, duration: 0.5, ease: "bounce.out" }, 0.5)
          .add(() => Deck.ctx.sfx("thunk"), 0.85)
          .from(el.querySelectorAll(".k-tab"), { scaleY: 0, transformOrigin: "50% 0%", stagger: 0.03, duration: 0.3, ease: "back.out(2)" }, 0.7)
          .from(el.querySelector(".ck-card"), { y: 60, opacity: 0, duration: 0.5, ease: "power3.out" }, 0.6)
          .from(el.querySelector(".k-mo"), { scale: 0, rotate: -20, opacity: 0, duration: 0.5, ease: "back.out(2)" }, 0.9)
          .add(() => Deck.ctx.sfx("pop"), 1.1);
      },
      (el) => {
        const tl = gsap.timeline();
        el.querySelectorAll(".ck-row").forEach((row, i) => {
          const at = i * 0.42;
          tl.to(row, { opacity: 1, x: 0, duration: 0.22, ease: "power2.out" }, at)
            .to(row.querySelector(".stamp"), { scale: 1, duration: 0.18, ease: "power3.in" }, at + 0.14)
            .to(row.querySelector(".stamp"), { rotate: -8, scale: 1.06, duration: 0.1, yoyo: true, repeat: 1 }, at + 0.32)
            .add(() => Deck.ctx.sfx("thunk"), at + 0.3);
        });
        return tl;
      },
      (el) => gsap.timeline().to(el.querySelectorAll(".pp li"), { opacity: 1, x: 0, stagger: 0.14, duration: 0.35, ease: "power2.out" })
    ]
  });

  // ---------------- 21. Finale: Cue throws the cup at the screen, then the end card ----------------
  const INK21 = "#25292B";
  const fin = document.createElement("style");
  fin.textContent = `
  .fin-tile{position:absolute;top:330px;width:500px;height:410px;background:#F8EBDA;border:6px solid ${INK21};border-radius:34px;box-shadow:0 12px 0 ${INK21};display:flex;flex-direction:column;align-items:center;padding-top:30px;color:${INK21};text-decoration:none}
  .fin-tile .qr{border-radius:16px;border:4px solid ${INK21}}
  .fin-tile h3{font-family:var(--font-display);font-weight:900;font-size:46px;line-height:1.05;margin:24px 0 6px;text-align:center}
  .fin-tile p{font-size:28px;font-weight:600;margin:0;opacity:.75}
  `;
  document.head.appendChild(fin);

  // Dedicated front view of the cup (no ids, so copies can be cloned for the motion trail).
  function frontCupSVG() {
    const L = (y) => 44 + (y - 104) / 218 * 24, R = (y) => 196 - (y - 104) / 218 * 24;
    const body = "M44 104 L196 104 L172 322 Q170 340 150 340 L90 340 Q70 340 68 322 Z";
    const chunk = (x, y, r, rot) => `<rect x="${x - r}" y="${y - r}" width="${r * 2}" height="${r * 2}" rx="${r * 0.35}" fill="#FFC83A" stroke="${INK21}" stroke-width="3.5" transform="rotate(${rot} ${x} ${y})"/>`;
    return `<svg class="fcup" viewBox="0 -40 240 400" width="240" height="400" overflow="visible" xmlns="http://www.w3.org/2000/svg" style="display:block">
      <path d="${body}" fill="#F8EBDA" fill-opacity=".55"/>
      <path d="M${L(128)} 128 L${R(128)} 128 L${R(340)} 340 L${L(340)} 340 Z" fill="none"/>
      <path d="M${L(126)} 126 Q80 112 120 126 T${R(126)} 126 L${R(246)} 246 Q150 262 120 248 T${L(246)} 246 Z" fill="#FFB020"/>
      <path d="M${L(246)} 246 Q90 262 120 250 T${R(246)} 246 L172 322 Q170 340 150 340 L90 340 Q70 340 68 322 Z" fill="#E8364F"/>
      ${chunk(84, 160, 12, -16)}${chunk(158, 150, 11, 22)}<circle cx="120" cy="176" r="11" fill="#E8364F" stroke="${INK21}" stroke-width="3.5"/>
      <circle cx="90" cy="300" r="10" fill="#9A3E4B" stroke="${INK21}" stroke-width="3.5"/>${chunk(150, 296, 10, 18)}
      <path d="${body}" fill="none" stroke="${INK21}" stroke-width="7" stroke-linejoin="round"/>
      <path d="M62 140 L74 300" stroke="#FFF" stroke-width="11" stroke-linecap="round" opacity=".6"/>
      <ellipse cx="172" cy="150" rx="4" ry="6" fill="#FFF" opacity=".75"/><ellipse cx="164" cy="190" rx="3.4" ry="5" fill="#FFF" opacity=".7"/><ellipse cx="176" cy="226" rx="3.6" ry="5.4" fill="#FFF" opacity=".7"/>
      <g class="fc-label"><rect x="62" y="208" width="116" height="74" rx="14" fill="#F2D9C2" stroke="${INK21}" stroke-width="5"/>
        <path d="M120 218 Q116 228 124 233 Q130 224 120 218 Z" fill="#6A9467" stroke="${INK21}" stroke-width="2"/>
        <text x="120" y="266" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="900" font-size="29" fill="${INK21}">CUE</text></g>
      <path d="M130 44 L150 -12 L186 -12" stroke="${INK21}" stroke-width="20" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <path d="M130 44 L150 -12 L186 -12" stroke="#6A9467" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <path d="M136 28 L142 10" stroke="#FFF" stroke-width="4" stroke-linecap="round" opacity=".7"/>
      <path d="M44 90 C44 44 80 24 120 24 C160 24 196 44 196 90 Z" fill="#F8EBDA" fill-opacity=".8" stroke="${INK21}" stroke-width="7" stroke-linejoin="round"/>
      <path d="M62 74 C64 54 82 42 100 40" stroke="#FFF" stroke-width="8" stroke-linecap="round" fill="none"/>
      <rect x="34" y="84" width="172" height="24" rx="12" fill="#F2D9C2" stroke="${INK21}" stroke-width="7"/>
    </svg>`;
  }

  // Big front splash: layered blobs, thick drips, flying droplets, plus a wet-glass layer.
  function frontSplashSVG() {
    let s = 91; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const bp = (cx, cy, rad, pts, seed, wob) => Kit.blobPath(cx, cy, rad, pts, seed, wob);
    let drips = "";
    const dx = [250, 380, 520, 660, 790, 930, 1060, 1190, 1330, 1470, 1610, 1720];
    dx.forEach((x, i) => {
      const w = 40 + r() * 40, y0 = 430 + r() * 200, len = 180 + r() * 300, c = i % 4 === 1 ? "#E8364F" : "#E08A45";
      drips += `<g class="fs-drip" data-ox="${x}" data-oy="${y0}"><path d="M${x - w * 0.95} ${y0} Q${x - w / 2} ${y0 + 20} ${x - w / 2} ${y0 + 110} L${x - w / 2} ${y0 + len} a${w / 2} ${w / 2} 0 0 0 ${w} 0 L${x + w / 2} ${y0 + 110} Q${x + w / 2} ${y0 + 20} ${x + w * 0.95} ${y0} Z" fill="${c}"/>
        <circle cx="${x}" cy="${y0 + len}" r="${w * 0.62}" fill="${c}"/><ellipse cx="${x - w * 0.18}" cy="${y0 + len * 0.55}" rx="${w * 0.1}" ry="${len * 0.2}" fill="#FFF" opacity=".4"/></g>`;
    });
    let star = "";
    { let d = ""; const N = 22;
      for (let i = 0; i < N * 2; i++) { const a = (i / (N * 2)) * Math.PI * 2, rad = i % 2 ? 820 + r() * 100 : 1000 + r() * 420; d += (i ? "L" : "M") + (960 + Math.cos(a) * rad * 1.3).toFixed(1) + " " + (540 + Math.sin(a) * rad * 0.78).toFixed(1); }
      star = `<path d="${d}Z" fill="#E69A55" stroke="#E69A55" stroke-width="40" stroke-linejoin="round"/>`; }
    let drops = "";
    for (let i = 0; i < 44; i++) {
      const a = r() * Math.PI * 2, d = 520 + r() * 520, rad = 8 + r() * 34;
      const cx = 960 + Math.cos(a) * d * 1.25, cy = 540 + Math.sin(a) * d * 0.8;
      if (cx < -20 || cx > 1940 || cy < -20 || cy > 1100) continue;
      drops += `<g class="fs-drop" data-cx="${cx}" data-cy="${cy}"><circle cx="${cx}" cy="${cy}" r="${rad}" fill="${i % 3 ? "#FFB020" : i % 3 === 0 && i % 2 ? "#E8364F" : "#E69A55"}"/><circle cx="${cx - rad * 0.3}" cy="${cy - rad * 0.3}" r="${rad * 0.28}" fill="#FFF" opacity=".6"/></g>`;
    }
    let beads = "";
    for (let i = 0; i < 46; i++) {
      const x = 40 + r() * 1840, y = 30 + r() * 1020, rad = 5 + r() * 13;
      beads += `<g class="fs-bead"><circle cx="${x}" cy="${y}" r="${rad}" fill="#FFF" fill-opacity=".16" stroke="#FFF" stroke-opacity=".7" stroke-width="2.5"/><circle cx="${x - rad * 0.35}" cy="${y - rad * 0.35}" r="${rad * 0.25}" fill="#FFF" opacity=".9"/></g>`;
    }
    return `<svg class="fsplash" viewBox="0 0 1920 1080" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none">
      <g class="fs-slide">
        <g class="fs-main" style="transform-origin:960px 540px">
          ${star}
          <path d="${bp(960, 520, 930, 30, 3, 0.45)}" fill="#E69A55" transform="translate(960 540) scale(1.04 .78) translate(-960 -540)"/>
          <path d="${bp(930, 500, 700, 24, 11, 0.5)}" fill="#FFB020" transform="translate(930 520) scale(1.1 .8) translate(-930 -520)"/>
          <path d="${bp(1250, 420, 300, 18, 5, 0.55)}" fill="#E8364F"/>
          <path d="${bp(620, 660, 220, 16, 8, 0.55)}" fill="#E8364F"/>
          <path d="${bp(1280, 400, 110, 12, 21, 0.5)}" fill="#9A3E4B"/>
          ${drips}
          <ellipse cx="560" cy="300" rx="190" ry="46" fill="#FFF" opacity=".45" transform="rotate(-22 560 300)"/>
          <ellipse cx="330" cy="420" rx="60" ry="22" fill="#FFF" opacity=".4" transform="rotate(-35 330 420)"/>
          <ellipse cx="1390" cy="290" rx="120" ry="30" fill="#FFF" opacity=".35" transform="rotate(-18 1390 290)"/>
        </g>
        ${drops}
      </g>
      <g class="fs-glass">
        <path d="M-40 260 L720 -40 L880 -40 L-40 420 Z" fill="#FFF" fill-opacity=".16"/>
        <path d="M980 1120 L1920 700 L1920 840 L1180 1120 Z" fill="#FFF" fill-opacity=".14"/>
        ${beads}
      </g>
    </svg>`;
  }

  const TILES = [
    { path: "site/index.html", title: "Visit our website", sub: "Menu and the story", x: 160 },
    { path: "order/index.html", title: "Try the order app", sub: "Build your own drink", x: 710 },
    { path: "survey/index.html", title: "See our survey", sub: "What students told us", x: 1260 }
  ];
  const MO_DANCE = { left: 760, top: 330, width: 420, height: 540 };
  const MO_PEEK = { left: 1500, top: 790, width: 300, height: 386 };

  Deck.add({
    n: 21, stage: "cheers", title: "Finale", budget: 30,
    notes: "Role 6. Click 1: Cue says thank you and dances. Click 2: Cue throws the cup at the audience; it splats on the glass. Click 3: the smoothie slides away and the end card with three QR codes appears. Throw the real confetti now!",
    html: (ctx) => `<div class="fin-wrap" style="position:absolute;inset:0">${Kit.sceneBG}
      <div style="position:absolute;inset:0;background:rgba(255,111,163,.35)"></div>
      <div class="fin-endbg" style="position:absolute;inset:0;background:#E8A597;opacity:0"></div>
      <div class="fin-end" style="position:absolute;inset:0;opacity:0">
        <h2 class="s-title fin-ty" style="position:absolute;left:0;right:0;top:70px;text-align:center;font-size:170px;line-height:1;margin:0;color:${INK21}">Thank you</h2>
        ${TILES.map(t => `<div class="fin-tile" style="left:${t.x}px">${Kit.qrSVG(Kit.siteURL(t.path), 200)}<h3>${t.title}</h3><p>${t.sub}</p></div>`).join("")}
        <div class="fin-q" style="position:absolute;left:160px;top:850px;font-family:var(--font-display);font-weight:900;font-size:60px;color:${INK21}">Questions?</div>
        <img class="fin-logo" src="../assets/img/cue-logo.png" alt="CUE" style="position:absolute;right:160px;top:790px;width:150px;height:auto">
      </div>
      <div class="mo" style="position:absolute;left:${MO_DANCE.left}px;top:${MO_DANCE.top}px;width:${MO_DANCE.width}px;height:${MO_DANCE.height}px">${ctx.art.mascot({ cup: true })}</div>
      <h2 class="s-title thanks" style="position:absolute;left:0;right:0;top:120px;text-align:center;font-size:150px;color:${INK21}">Thank you!</h2>
      <div class="fin-fly" style="position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;overflow:hidden;opacity:1">
        ${[0.2, 0.34, 1].map(o => `<div class="fly" data-o="${o}" style="position:absolute;left:1088px;top:550px;width:240px;height:400px;margin:-200px 0 0 -120px;opacity:0;transform-origin:50% 55%">${frontCupSVG()}</div>`).join("")}
      </div>
      <div class="fin-flash" style="position:absolute;inset:0;background:#FFF;opacity:0;pointer-events:none"></div>
      <div class="fin-splash" style="position:absolute;inset:0;pointer-events:none">${frontSplashSVG()}</div>
      </div>`,
    steps: [
      (el) => {
        gsap.set(el.querySelectorAll(".fs-main, .fs-drop"), { scale: 0, transformOrigin: "50% 50%", opacity: 0 });
        gsap.set(el.querySelectorAll(".fs-bead, .fs-glass path"), { opacity: 0 });
        el.querySelectorAll(".fs-drip").forEach(d => gsap.set(d, { scaleY: 0.05, opacity: 0, svgOrigin: `${d.dataset.ox} ${d.dataset.oy}` }));
        const mo = el.querySelector(".mo");
        return gsap.timeline()
          .add(() => Deck.ctx.sfx("cheer"))
          .from(el.querySelector(".thanks"), { scale: 0, rotate: -10, duration: 0.6, ease: "back.out(2)" })
          .to(mo, { y: -120, duration: 0.3, yoyo: true, repeat: 5, ease: "power2.out" }, 0)
          .to(mo, { rotate: 360, duration: 0.6, ease: "power2.inOut" }, 0.6)
          .to(mo.querySelector(".mo-arm-l"), { rotate: 120, duration: 0.15, yoyo: true, repeat: 9 }, 0)
          .to(mo.querySelector(".mo-arm-r"), { rotate: -60, duration: 0.15, yoyo: true, repeat: 9 }, 0)
          .to(mo.querySelector(".mo-body"), { scaleY: 0.94, scaleX: 1.04, duration: 0.15, yoyo: true, repeat: 11, ease: "sine.inOut" }, 0)
          .add(() => window.confetti && confetti({ particleCount: 80, spread: 100, origin: { y: 0.6 } }), 0.4);
      },
      (el) => {
        const mo = el.querySelector(".mo"), hand = mo.querySelector(".mo-hand-cup"), arm = mo.querySelector(".mo-arm-r");
        const wrap = el.querySelector(".fin-wrap");
        const flies = [...el.querySelectorAll(".fly")];
        const main = el.querySelector(".fs-main"), drops = el.querySelectorAll(".fs-drop");
        const T = 0.55;      // release time
        const D = 0.45;      // flight time
        const hit = T + D;   // impact time
        const tl = gsap.timeline();
        // wind up: lean back, arm and cup pull behind the head
        tl.to(mo.querySelector(".mo-body"), { rotate: -10, duration: 0.3, ease: "power2.out" }, 0)
          .to(arm, { rotate: 55, duration: 0.3, ease: "power2.out" }, 0)
          .to(hand, { x: 221, y: 126, rotate: 40, duration: 0.3, ease: "power2.out" }, 0)
          .to(mo.querySelector(".mo-leg-l"), { rotate: -12, duration: 0.3 }, 0)
          .to(el.querySelector(".thanks"), { opacity: 0, y: -40, duration: 0.25 }, 0)
          // throw
          .to(mo.querySelector(".mo-body"), { rotate: 8, duration: 0.14, ease: "power4.out" }, 0.38)
          .to(arm, { rotate: -70, duration: 0.14, ease: "power4.out" }, 0.38)
          .to(hand, { x: 172, y: 114, rotate: -8, duration: 0.14, ease: "power4.out" }, 0.38)
          .add(() => Deck.ctx.sfx("whoosh"), 0.4)
          .set(hand, { opacity: 0 }, T);
        // the flying cup (+ two fading trail copies for motion blur)
        flies.forEach((f, i) => {
          const o = +f.dataset.o, lag = (flies.length - 1 - i) * 0.035;
          const t0 = T + lag;
          tl.set(f, { opacity: o, scale: 0.35, x: 0, y: 0, rotate: 12, filter: "blur(0px)" }, T)
            .to(f, { scale: 6, x: -150, y: 40, rotate: -4, duration: D, ease: "power3.in" }, t0)
            .to(f, { filter: i === flies.length - 1 ? "blur(5px)" : "blur(14px)", duration: D, ease: "power2.in" }, t0)
            .set(f, { opacity: 0 }, hit + 0.02);
        });
        // impact: freeze-frame flash, shake, big front splash
        const shake = [[-26, 14], [24, -18], [-18, -10], [14, 12], [-8, 6], [4, -3], [0, 0]];
        tl.set(el.querySelector(".fin-flash"), { opacity: 0.85 }, hit)
          .to(el.querySelector(".fin-flash"), { opacity: 0, duration: 0.25, ease: "power2.out" }, hit + 0.04)
          .add(() => { Deck.ctx.sfx("splash"); Deck.ctx.sfx("splat"); }, hit);
        shake.forEach((p, i) => tl.to(wrap, { x: p[0], y: p[1], duration: 0.05, ease: "none" }, hit + i * 0.05));
        tl.set(main, { opacity: 1 }, hit)
          .fromTo(main, { scale: 0.15 }, { scale: 1, duration: 0.4, ease: "back.out(1.3)" }, hit)
          .set(drops, { opacity: 1 }, hit);
        drops.forEach((d, i) => {
          const cx = +d.dataset.cx, cy = +d.dataset.cy;
          tl.fromTo(d, { x: (960 - cx) * 0.95, y: (540 - cy) * 0.95, scale: 0.1 }, { x: 0, y: 0, scale: 1, duration: 0.38 + (i % 5) * 0.03, ease: "power3.out", transformOrigin: "50% 50%" }, hit + 0.02);
        });
        tl.to(el.querySelectorAll(".fs-drip"), { opacity: 1, duration: 0.01 }, hit + 0.1)
          .to(el.querySelectorAll(".fs-drip"), { scaleY: 1, duration: 1.1, ease: "power1.in", stagger: { each: 0.05, from: "random" } }, hit + 0.15)
          // wet glass: sheen and beads appear on the "screen"
          .to(el.querySelectorAll(".fs-glass path"), { opacity: 1, duration: 0.5 }, hit + 0.2)
          .to(el.querySelectorAll(".fs-bead"), { opacity: 1, duration: 0.4, stagger: 0.012 }, hit + 0.25)
          // Cue steps out of frame, empty-handed, behind the splash
          .set(mo, { opacity: 0 }, hit + 0.1);
        return tl;
      },
      (el) => {
        const mo = el.querySelector(".mo"), arm = mo.querySelector(".mo-arm-r");
        const slide = el.querySelector(".fs-slide");
        const tl = gsap.timeline();
        // set up the end card (hidden behind the splash)
        tl.set(el.querySelector(".fin-endbg"), { opacity: 1 }, 0)
          .set(el.querySelector(".fin-end"), { opacity: 1 }, 0)
          .set(el.querySelector(".thanks"), { opacity: 0 }, 0)
          .set(mo, { left: MO_PEEK.left, top: MO_PEEK.top, width: MO_PEEK.width, height: MO_PEEK.height, x: 0, y: 150, rotate: 0, opacity: 1 }, 0)
          .set(mo.querySelector(".mo-body"), { rotate: 0, scaleX: 1, scaleY: 1 }, 0)
          .set(mo.querySelector(".mo-leg-l"), { rotate: 0 }, 0)
          .set(mo.querySelector(".mo-arm-l"), { rotate: 0 }, 0)
          .set(arm, { rotate: -20 }, 0)
          .set(mo.querySelector(".mo-hand-cup"), { opacity: 0 }, 0)
          .set(el.querySelector(".fin-wrap"), { x: 0, y: 0 }, 0)
          .set(el.querySelectorAll(".fin-tile, .fin-q, .fin-ty, .fin-logo"), { opacity: 0, y: 40 }, 0)
          .add(() => Deck.ctx.sfx("drop"), 0.1)
          // the smoothie slowly slides down the glass
          .to(el.querySelectorAll(".fs-glass path, .fs-bead"), { opacity: 0, duration: 1.2, ease: "power1.in" }, 0.2)
          .to(el.querySelectorAll(".fs-drip"), { scaleY: 1.5, duration: 2, ease: "power1.in" }, 0.1)
          .to(slide, { y: 2000, duration: 2.0, ease: "power1.in" }, 0.2)
          // the end card builds as it clears
          .to(el.querySelector(".fin-ty"), { opacity: 1, y: 0, duration: 0.6, ease: "back.out(1.6)" }, 1.0)
          .to(el.querySelectorAll(".fin-tile"), { opacity: 1, y: 0, duration: 0.5, stagger: 0.14, ease: "back.out(1.4)" }, 1.3)
          .to(el.querySelector(".fin-q"), { opacity: 1, y: 0, duration: 0.4 }, 1.7)
          .to(el.querySelector(".fin-logo"), { opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.6)" }, 1.7)
          .add(() => Deck.ctx.sfx("pop"), 1.7)
          // Cue peeks up from the bottom edge and waves
          .to(mo, { y: 0, duration: 0.6, ease: "back.out(1.7)" }, 1.7)
          .to(arm, { rotate: 20, duration: 0.22, yoyo: true, repeat: 5, ease: "sine.inOut" }, 2.2)
          .to(mo.querySelector(".mo-leaf"), { rotate: 8, duration: 0.5, yoyo: true, repeat: 3, ease: "sine.inOut" }, 2.2)
          .add(() => {
            if (!window.confetti || document.body.classList.contains("print")) return;
            const end = Date.now() + 1800;
            (function f() { confetti({ particleCount: 5, angle: 60, spread: 60, origin: { x: 0 } }); confetti({ particleCount: 5, angle: 120, spread: 60, origin: { x: 1 } }); if (Date.now() < end) requestAnimationFrame(f); })();
          }, 1.4);
        if (window.SproutArt && SproutArt.blink) tl.add(SproutArt.blink(mo, { double: true }), 2.6);
        return tl;
      }
    ]
  });
})();
