/* Stage 3: HARVEST — STP (Role 3) — slides 10–12 */
(function () {
  const D = () => CONTENT.data;
  const field = `<div style="position:absolute;left:0;right:0;bottom:0;height:150px;background:#EBCDB1"></div>
    <div style="position:absolute;left:0;right:0;bottom:150px;height:3px;background:repeating-linear-gradient(90deg,#25292B 0 26px,transparent 26px 44px)"></div>`;
  const PAPER = `#F8EBDA`;

  // ---------------- 10. What matters: fruit fills six baskets ----------------
  Deck.add({
    n: 10, stage: "harvest", title: "What matters", budget: 40,
    notes: "Role 3. Each student split 100 points across six factors. Taste got the most (28%), then price (22%). Health, convenience, wait time and freshness each got 11–14%.",
    html: () => {
      const rows = D()["02_importance"] || [];
      const DOT = ["#E3B23C", "#B5506A", "#E3B23C", "#B5506A"];
      return `<div style="position:absolute;inset:0;background:${PAPER};color:#25292B">${field}
      <div class="pad" style="bottom:auto">
        <div class="s-kicker" style="color:#B83A32">Harvest: what matters</div>
        <h2 class="s-title tt" style="font-size:104px;margin:12px 0 0;color:#25292B">Taste comes first.</h2>
      </div>
      <div class="baskets" style="position:absolute;left:130px;right:130px;bottom:150px;display:grid;grid-template-columns:repeat(${rows.length},1fr);gap:34px;align-items:end">
        ${rows.map((r, i) => `
          <div class="bk" style="display:flex;flex-direction:column;align-items:center;gap:12px">
            <div class="pile" style="position:relative;width:100%;height:${Math.ceil(Math.round(r.mean * 50) / 4) * 40 + 20}px">
              ${Array.from({ length: Math.round(r.mean * 50) }, (_, k) => { const row = Math.floor(k / 4), col = k % 4; return `<span class="fr" style="position:absolute;left:${14 + col * 24 + (row % 2) * 10}%;bottom:${row * 40}px;width:34px;height:34px;border-radius:50%;background:${DOT[(k + i) % 4]};border:2px solid #25292B;transform:translateX(-50%)"></span>`; }).join("")}
            </div>
            <div style="width:100%;height:120px;border-radius:0 0 40px 40px;background:repeating-linear-gradient(45deg,#EBCDB1 0 14px,#F2D9C2 14px 28px);border:2px solid #25292B;display:grid;place-items:center;color:#25292B;font-family:var(--font-display);font-weight:800;font-size:${i === 0 ? 64 : 48}px">${Math.round(r.mean * 100)}%</div>
            <div style="font-weight:700;font-size:32px;color:${i === 0 ? "#B83A32" : "#25292B"}">${r.factor}</div>
          </div>`).join("")}
      </div>
      <div class="source" style="color:#25292B;opacity:.75">02_importance.csv: mean share of 100 points, n = ${Kit.nUsable()}</div>
      </div>`;
    },
    steps: [
      (el) => {
        const tl = gsap.timeline().from(el.querySelector(".tt"), { y: 40, opacity: 0, duration: 0.5, ease: "power2.out" });
        el.querySelectorAll(".bk").forEach((b, i) => {
          tl.from(b, { y: 300, opacity: 0, duration: 0.5, ease: "power2.out" }, 0.1 + i * 0.08);
          tl.from(b.querySelectorAll(".fr"), { y: -900, opacity: 0, duration: 0.6, ease: "power2.out", stagger: 0.035 }, 0.5 + i * 0.12);
        });
        return tl.add(() => Deck.ctx.sfx("drop"), 0.6).add(() => Deck.ctx.sfx("tada"), 2.2)
          .to(el.querySelector(".bk"), { scale: 1.06, transformOrigin: "50% 100%", duration: 0.3, yoyo: true, repeat: 1, ease: "power2.inOut" }, 2.2);
      }
    ]
  });

  // ---------------- 11. Would they buy: a glass fills to the top-2 share ----------------
  Deck.add({
    n: 11, stage: "harvest", title: "Would they buy?", budget: 40,
    notes: "Role 3. 69% said they probably or definitely would buy (95% range 56–80%). People overstate, so a calibrated estimate is about 30%. Three small segments; taste + fresh is keenest (79%). The smallest segment has 13 people, so describe, don't over-sell.",
    html: () => {
      const it = (D().results || {}).intent || {};
      const segs = D()["05_segments"] || [];
      return `<div style="position:absolute;inset:0;background:${PAPER};color:#25292B">${field}
      <div class="pad" style="right:1000px">
        <div class="s-kicker" style="color:#B83A32">Harvest: would they buy?</div>
        <h2 class="s-title tt" style="font-size:104px;margin:12px 0 30px;color:#25292B">7 in 10 said yes.</h2>
        <div class="segs" style="display:grid;gap:16px">${segs.map(s => `
          <div class="sg" style="display:grid;grid-template-columns:1fr auto;align-items:center;background:#F8EBDA;border:2px solid #25292B;border-radius:14px;padding:16px 26px;font-size:30px;color:#25292B">
            <span><b>${s.label}</b> <small style="opacity:.6">${s.n} people</small></span><b style="font-family:var(--font-display);font-size:44px;color:#B83A32">${Math.round(s.pct_top2 * 100)}%</b></div>`).join("")}
          <div style="font-size:22px;color:#25292B;opacity:.7">Share in each segment who would buy</div>
        </div>
      </div>
      <div class="glass" style="position:absolute;left:1180px;top:110px;width:420px;height:720px">
        <div style="position:absolute;inset:0;border:2px solid #25292B;border-top:0;border-radius:0 0 70px 70px;overflow:hidden;background:rgba(37,41,43,.04)">
          <div class="liq" style="position:absolute;left:0;right:0;bottom:0;height:0;background:#E3B23C">
            <svg viewBox="0 0 840 40" preserveAspectRatio="none" style="position:absolute;top:-38px;left:0;width:200%;height:40px"><path class="wv" d="M0 20 Q52 0 105 20 T210 20 T315 20 T420 20 T525 20 T630 20 T735 20 T840 20 V40 H0Z" fill="#E3B23C"/></svg></div>
        </div>
        <div class="cal" style="position:absolute;left:-30px;right:-30px;bottom:${(it.calibrated || 0.301) * 100}%;border-top:2px dashed #25292B;opacity:0"><span style="position:absolute;right:-250px;top:-26px;font-size:28px;font-weight:700;width:230px;color:#25292B">Realistic: ${Math.round((it.calibrated || 0.301) * 100)}%</span></div>
        <div class="big" style="position:absolute;left:0;right:0;top:34%;text-align:center;font-family:var(--font-display);font-weight:800;font-size:170px;color:#25292B"><span class="num">0</span>%</div>
      </div>
      <div class="source" style="color:#25292B;opacity:.75">05_intent_distribution.csv, 05_segments.csv, results.json (top-2-box, 95% CI ${Math.round((it.ci_lo || .56) * 100)}–${Math.round((it.ci_hi || .797) * 100)}%)</div>
      </div>`;
    },
    ambient: (el) => gsap.timeline().to(el.querySelector(".wv"), { x: -210, duration: 6, ease: "none", repeat: -1 }),
    steps: [
      (el) => {
        const top2 = ((D().results || {}).intent || {}).top2 || 0.691, o = { v: 0 };
        gsap.set(el.querySelectorAll(".sg"), { opacity: 0, x: -40 });
        return gsap.timeline()
          .from(el.querySelector(".tt"), { y: 40, opacity: 0, duration: 0.5, ease: "power2.out" })
          .add(() => Deck.ctx.sfx("pour"), 0.2)
          .to(el.querySelector(".liq"), { height: top2 * 100 + "%", duration: 1.8, ease: "power2.out" }, 0.2)
          .to(o, { v: Math.round(top2 * 100), duration: 1.8, ease: "power2.out", onUpdate: () => el.querySelector(".num").textContent = Math.round(o.v) }, 0.2)
          .add(() => Deck.ctx.sfx("tada"), 2.0);
      },
      (el) => gsap.timeline()
        .to(el.querySelector(".cal"), { opacity: 1, duration: 0.4 })
        .from(el.querySelector(".cal"), { scaleX: 0, duration: 0.5, ease: "power2.out" }, 0)
        .to(el.querySelectorAll(".sg"), { opacity: 1, x: 0, stagger: 0.15, duration: 0.4, ease: "power2.out" }, 0.3)
    ]
  });

  // ---------------- 12. Target + position: the spotlight ----------------
  const POS = "For CUHK students who want fresh fruit that tastes great between classes, CUE is the smoothie made the way they asked for it.";
  Deck.add({
    n: 12, stage: "harvest", title: "Target and position", budget: 40,
    notes: "Role 3. We target the taste + fresh segment: 19 people, the highest share who would buy (79%) and the most who have bought a smoothie before (37%). We pick them where the youth market is dense: Sha Tin is HK's most populous district (687,300 people) but only 7.7% are aged 15–24 (C&SD 2025) — the campus micro-market is the youth market itself. Positioning line is a PLACEHOLDER for the team to confirm.",
    html: () => {
      const segs = D()["05_segments"] || [];
      const X = [420, 960, 1500];
      const FILL = ["#EBCDB1", "#F2D9C2", "#B83A32"];
      const INK = ["#25292B", "#25292B", "#F8EBDA"];
      return `
      <div style="position:absolute;inset:0;background:#25292B"></div>
      <div class="spot" style="position:absolute;left:0;top:0;width:900px;height:900px;margin:-450px 0 0 -450px;border-radius:50%;background:radial-gradient(circle,rgba(248,235,218,.42),rgba(248,235,218,.12) 45%,transparent 70%)"></div>
      ${segs.map((s, i) => `<div class="seg ${s.segment === 2 ? "target" : ""}" style="position:absolute;left:${X[i]}px;top:330px;transform:translate(-50%,-50%);text-align:center;color:#F2D9C2">
        <div style="width:${160 + s.n * 9}px;height:${160 + s.n * 9}px;border-radius:50%;margin:0 auto;background:${FILL[i]};display:grid;place-items:center;font-family:var(--font-display);font-weight:800;font-size:56px;color:${INK[i]}">${Math.round(s.pct_top2 * 100)}%</div>
        <div style="font-family:var(--font-display);font-weight:800;font-size:46px;margin-top:16px">${s.label}</div>
        <div style="font-size:28px;opacity:.8">${s.n} people in this group</div></div>`).join("")}
      <div class="pos" style="position:absolute;left:180px;right:180px;bottom:120px;text-align:center;font-family:var(--font-display);font-size:54px;line-height:1.2;color:#F2D9C2"><span class="typed"></span><span class="caret" style="color:#F2D9C2">|</span></div>
      <div class="badge" style="position:absolute;left:960px;top:70px;transform:translateX(-50%);background:#B83A32;color:#F8EBDA;padding:12px 30px;border-radius:999px;font-weight:600;font-size:30px;opacity:0">Our target</div>
      <div class="source" style="color:#F2D9C2;opacity:.8">05_segments.csv; positioning line is a placeholder</div>`;
    },
    steps: [
      (el) => {
        const spot = el.querySelector(".spot"), segs = el.querySelectorAll(".seg");
        gsap.set(spot, { x: -400, y: 330 });
        const tl = gsap.timeline().from(segs, { scale: 0, opacity: 0, stagger: 0.12, duration: 0.5, ease: "power2.out" });
        [420, 1500, 960].forEach((x, i) => tl.to(spot, { x, duration: 0.55, ease: "power2.inOut" }, 0.4 + i * 0.55));
        const target = el.querySelector(".seg.target");
        tl.to([...segs].filter(s => s !== target), { opacity: 0.35, duration: 0.4 }, 2.1)
          .to(target, { scale: 1.12, duration: 0.4, ease: "power2.out" }, 2.1)
          .to(el.querySelector(".badge"), { opacity: 1, y: 10, duration: 0.3, ease: "power2.out" }, 2.2)
          .add(() => Deck.ctx.sfx("tada"), 2.1);
        return tl;
      },
      (el) => {
        const o = { n: 0 }, out = el.querySelector(".typed");
        return gsap.timeline().to(o, { n: POS.length, duration: 2.4, ease: "none", onUpdate: () => out.textContent = POS.slice(0, Math.round(o.n)) })
          .add(() => Deck.ctx.sfx("click"), 0);
      }
    ]
  });
})();
