/* Stage 7: CHEERS (Role 6) — slides 20–21: evidence + risks, then the finale. */
(function () {
  // ---- slide 20 scene styles ----
  const css20 = document.createElement("style");
  css20.textContent = `
  .ck-card{width:980px;background:#FFFDF8;border-radius:30px;padding:26px 40px;color:#2A1A10;box-shadow:0 24px 60px rgba(0,0,0,.22)}
  .ck-row{display:flex;align-items:center;gap:26px;min-height:70px;padding:8px 0;border-bottom:3px dashed rgba(42,26,16,.12);font-size:34px;font-weight:600;line-height:1.15}
  .ck-row:last-child{border-bottom:0}
  .ck-row b{color:#B0244A}
  .stamp{margin-left:auto;flex:0 0 auto;width:66px;height:66px;border-radius:50%;display:grid;place-items:center;font-family:var(--font-display);font-weight:900;font-size:38px;color:#FFFDF8;box-shadow:0 8px 0 rgba(0,0,0,.15);transform:rotate(-8deg)}
  .stamp.ok{background:#2FA84F}
  .stamp.warn{background:#F6C445;color:#2A1A10}
  .ck-pp b{color:#7A1430}
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
  const nUsable = () => (D20().results && D20().results.n && D20().results.n.usable) || 53;

  function storeSVG() {
    const tabs = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i =>
      `<path class="k-tab" d="M${110 + i * 50} 182 h50 v54 a25 22 0 0 1 -50 0 z" fill="${i % 2 ? "#B0244A" : "#FFF4E2"}" stroke="#2A1A10" stroke-width="5"/>`).join("");
    return `<svg class="kiosk" viewBox="0 0 820 640" style="width:720px;height:561px;overflow:visible">
      <ellipse cx="400" cy="608" rx="330" ry="24" fill="#2A1A10" opacity=".12"/>
      <rect x="130" y="170" width="20" height="432" fill="#8B5A2B" stroke="#2A1A10" stroke-width="5"/>
      <rect x="670" y="170" width="20" height="432" fill="#8B5A2B" stroke="#2A1A10" stroke-width="5"/>
      <g class="k-sign">
        <rect x="150" y="34" width="520" height="128" rx="26" fill="#FF8A1F" stroke="#2A1A10" stroke-width="8"/>
        <text x="410" y="126" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="900" font-size="92" fill="#FFF4E2">Sprout</text>
      </g>
      <g class="k-awn">${tabs}</g>
      <rect x="150" y="300" width="520" height="300" rx="18" fill="#FFF4E2" stroke="#2A1A10" stroke-width="8"/>
      <rect x="190" y="332" width="300" height="158" rx="12" fill="#8FD3F4" stroke="#2A1A10" stroke-width="6"/>
      <g class="k-blender">
        <path d="M262 372 H338 L328 462 H272 Z" fill="#FFF" fill-opacity=".55" stroke="#2A1A10" stroke-width="5"/>
        <path d="M270 410 H330 L328 462 H272 Z" fill="#FFB020"/>
        <rect x="252" y="358" width="96" height="18" rx="8" fill="#2A1A10"/>
      </g>
      <circle cx="382" cy="440" r="22" fill="#FFB020" stroke="#2A1A10" stroke-width="4"/>
      <circle cx="428" cy="450" r="16" fill="#E8364F" stroke="#2A1A10" stroke-width="4"/>
      <rect x="520" y="332" width="120" height="112" rx="10" fill="#1E2A1F" stroke="#8B5A2B" stroke-width="6"/>
      <line x1="540" y1="362" x2="620" y2="362" stroke="#FFF4E2" stroke-width="6" stroke-linecap="round" opacity=".8"/>
      <line x1="540" y1="390" x2="604" y2="390" stroke="#FFF4E2" stroke-width="6" stroke-linecap="round" opacity=".6"/>
      <line x1="540" y1="418" x2="614" y2="418" stroke="#FFF4E2" stroke-width="6" stroke-linecap="round" opacity=".45"/>
      <rect x="170" y="500" width="480" height="26" rx="12" fill="#8B5A2B" stroke="#2A1A10" stroke-width="5"/>
    </svg>`;
  }

  Deck.add({
    n: 20, stage: "cheers", title: "The evidence", budget: 90,
    notes: "Role 6.\nClick 1: the pop-up store builds itself and Mo steps up with the cup.\nClick 2: every evidence line gets stamped — green where it holds, amber for the caveats (thunk).\nClick 3: risks and the next step.\nStore art is a placeholder; swap in assets/img/store.png later (see comment in 07-cheers.js).",
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

  // ---------------- 21. Finale: Mo throws the cup at the screen ----------------
  Deck.add({
    n: 21, stage: "cheers", title: "Finale", budget: 30,
    notes: "Role 6. Click 1: Mo dances. Click 2: Mo throws the cup at the screen. Throw the real confetti now!",
    html: (ctx) => `${Kit.sceneBG}
      <div style="position:absolute;inset:0;background:rgba(255,111,163,.35)"></div>
      <div class="mo" style="position:absolute;left:760px;top:330px;width:420px;height:540px">${ctx.art.mascot({ cup: true })}</div>
      <h2 class="s-title thanks" style="position:absolute;left:0;right:0;top:120px;text-align:center;font-size:150px;color:#2A1A10">Thank you!</h2>
      <div class="splat-wrap" style="position:absolute;inset:0">${Kit.splatSVG()}</div>
      <div class="end" style="position:absolute;inset:0;display:grid;place-items:center;text-align:center;color:#2A1A10;opacity:0">
        <div><div style="font-family:var(--font-display);font-weight:900;font-size:220px;line-height:.9">${CONTENT.brand.name}</div><div style="font-size:54px;font-family:var(--font-display)">${CONTENT.brand.slogan}</div><div style="font-size:34px;margin-top:30px">Questions?</div></div></div>`,
    steps: [
      (el) => {
        gsap.set(el.querySelectorAll(".sp-main, .sp-drop"), { scale: 0, transformOrigin: "50% 50%" });
        gsap.set(el.querySelectorAll(".sp-drip"), { scaleY: 0, transformOrigin: "50% 0%" });
        const mo = el.querySelector(".mo");
        return gsap.timeline()
          .add(() => Deck.ctx.sfx("cheer"))
          .from(el.querySelector(".thanks"), { scale: 0, rotate: -10, duration: 0.6, ease: "back.out(2)" })
          .to(mo, { y: -120, duration: 0.3, yoyo: true, repeat: 5, ease: "power2.out" }, 0)
          .to(mo, { rotate: 360, duration: 0.6, ease: "power2.inOut" }, 0.6)
          .to(mo.querySelector(".mo-arm-l"), { rotate: 120, duration: 0.15, yoyo: true, repeat: 9 }, 0)
          .to(mo.querySelector(".mo-arm-r"), { rotate: -60, duration: 0.15, yoyo: true, repeat: 9 }, 0)
          .add(() => window.confetti && confetti({ particleCount: 80, spread: 100, origin: { y: 0.6 } }), 0.4);
      },
      (el) => {
        const mo = el.querySelector(".mo"), cup = mo.querySelector(".mo-hand-cup");
        return gsap.timeline()
          .to(mo.querySelector(".mo-arm-r"), { rotate: 60, duration: 0.25, ease: "power2.in" })
          .to(mo.querySelector(".mo-arm-r"), { rotate: -120, duration: 0.15, ease: "power4.out" }, 0.25)
          .add(() => Deck.ctx.sfx("whoosh"), 0.25)
          .to(cup, { x: -60, y: -160, rotate: 720, scale: 9, duration: 0.5, ease: "power2.in" }, 0.3)
          .to(cup, { opacity: 0, duration: 0.05 }, 0.8)
          .to(el.querySelector(".sp-main"), { scale: 2.6, duration: 0.3, ease: "back.out(1.2)" }, 0.8)
          .to(el.querySelectorAll(".sp-drop"), { scale: 1.6, duration: 0.3, ease: "back.out(2)", stagger: 0.006 }, 0.82)
          .add(() => Deck.ctx.sfx("splat"), 0.8)
          .to(el.querySelectorAll(".sp-drip"), { scaleY: 2, duration: 2, ease: "power1.in", stagger: 0.1 }, 1.0)
          .to(el.querySelector(".end"), { opacity: 1, duration: 0.5 }, 1.4)
          .from(el.querySelector(".end > div"), { scale: 0.6, duration: 0.6, ease: "back.out(2)" }, 1.4)
          .add(() => {
            if (!window.confetti) return;
            const end = Date.now() + 2500;
            (function f() { confetti({ particleCount: 6, angle: 60, spread: 60, origin: { x: 0 } }); confetti({ particleCount: 6, angle: 120, spread: 60, origin: { x: 1 } }); if (Date.now() < end) requestAnimationFrame(f); })();
          }, 1.2);
      }
    ]
  });
})();
