/* Stage 2: WATER & GROW (Role 2) — slides 7–9 */
(function () {
  const D = () => CONTENT.data;
  const ground = `<div style="position:absolute;left:0;right:0;bottom:0;height:200px;background:#5B3A22"></div>
    <div style="position:absolute;left:0;right:0;bottom:180px;height:40px;background:radial-gradient(circle at 20px 40px,#5B3A22 24px,transparent 25px) 0 0/60px 40px repeat-x"></div>`;

  // ---------------- 7. Two interviews: watering the sprout ----------------
  Deck.add({
    n: 7, stage: "water", title: "Two interviews first", budget: 60,
    notes: "Role 2. Before the survey we ran 2 exploratory interviews (a Year 2 undergraduate; an informal chat with a friend) to find what matters and which ideas were worth testing. They are not part of the 53. Team: confirm which transcript is Caleb's.",
    html: () => `${ground}
      <svg class="can" viewBox="0 0 320 220" style="position:absolute;left:1180px;top:140px;width:340px;overflow:visible">
        <path d="M70 70 h150 v120 h-150z" fill="#FFF4E2" stroke="#10324A" stroke-width="9" stroke-linejoin="round"/>
        <path d="M220 100 L310 44" stroke="#10324A" stroke-width="16" stroke-linecap="round"/>
        <ellipse cx="312" cy="42" rx="16" ry="10" fill="#10324A"/>
        <path d="M70 90 Q10 120 70 170" stroke="#10324A" stroke-width="12" fill="none"/>
        <rect x="70" y="110" width="150" height="26" fill="#2FA84F"/></svg>
      <div class="drops" style="position:absolute;left:1490px;top:200px">${Array.from({ length: 14 }, (_, i) => `<i class="dr" style="position:absolute;left:${(i % 5) * 14}px;top:0;width:14px;height:22px;border-radius:50% 50% 50% 50%/60% 60% 40% 40%;background:#2E86C1"></i>`).join("")}</div>
      <svg class="plant" viewBox="0 0 600 700" style="position:absolute;left:1180px;bottom:180px;width:600px;height:700px;overflow:visible">
        <path class="stem" d="M300 700 C300 600 280 520 300 440 C320 360 290 300 300 220" stroke="#2FA84F" stroke-width="20" stroke-linecap="round" fill="none"/>
        <path class="lf l1" d="M296 520 C220 470 150 490 130 540 C190 570 250 560 296 520Z" fill="#2FA84F" stroke="#1E7A38" stroke-width="5"/>
        <path class="lf l2" d="M304 380 C380 320 450 330 475 380 C410 420 350 420 304 380Z" fill="#41C163" stroke="#1E7A38" stroke-width="5"/>
        <path class="lf l3" d="M300 240 C260 180 270 140 300 110 C330 140 340 180 300 240Z" fill="#2FA84F" stroke="#1E7A38" stroke-width="5"/></svg>
      <div class="tag t1" style="position:absolute;left:1000px;top:560px;width:300px;background:#FFFDF8;color:#10324A;border-radius:22px;padding:20px 24px;font-size:26px;box-shadow:0 12px 30px rgba(16,50,74,.2)"><b style="font-family:var(--font-display);font-size:34px">Interview 1</b><br>Year 2 CUHK undergraduate, semi-structured</div>
      <div class="tag t2" style="position:absolute;left:1560px;top:300px;width:300px;background:#FFFDF8;color:#10324A;border-radius:22px;padding:20px 24px;font-size:26px;box-shadow:0 12px 30px rgba(16,50,74,.2)"><b style="font-family:var(--font-display);font-size:34px">Interview 2</b><br>Informal chat with a friend</div>
      <div class="pad" style="right:900px">
        <div class="s-kicker" style="color:#1E7A38">Water: we started small</div>
        <h2 class="s-title tt" style="font-size:104px;margin:14px 0 44px">Two interviews came first.</h2>
        <ul class="points pp">
          <li><span><b>2 exploratory interviews</b> before any survey.</span></li>
          <li><span>They showed <b>what matters</b> and which ideas were worth testing.</span></li>
          <li><span>Their words became the <b>survey's answer options</b>.</span></li>
        </ul>
      </div>
      <div class="source">Interview notes (n = 2, exploratory, not part of the survey sample)</div>`,
    steps: [
      (el) => {
        gsap.set(el.querySelectorAll(".pp li"), { opacity: 0, x: -30 });
        gsap.set(el.querySelectorAll(".dr"), { opacity: 0 });
        gsap.set(el.querySelector(".stem"), { strokeDasharray: 620, strokeDashoffset: 470 });
        gsap.set(el.querySelectorAll(".lf"), { scale: 0, transformOrigin: "50% 100%" });
        gsap.set(el.querySelectorAll(".tag"), { opacity: 0, scale: 0.6 });
        const tl = gsap.timeline()
          .from(el.querySelector(".tt"), { y: 40, opacity: 0, duration: 0.5, ease: "back.out(1.6)" })
          .from(el.querySelector(".can"), { x: 700, rotate: -20, duration: 0.7, ease: "power3.out" }, 0)
          .to(el.querySelector(".can"), { rotate: 32, transformOrigin: "40% 60%", duration: 0.45, ease: "power2.inOut" }, 0.7)
          .add(() => Deck.ctx.sfx("water"), 0.9);
        el.querySelectorAll(".dr").forEach((d, i) => tl.fromTo(d, { y: 0, x: 0, opacity: 1 }, { y: 520, x: -30 - (i % 3) * 20, opacity: 0, duration: 0.7, ease: "power1.in", repeat: 1 }, 0.95 + i * 0.07));
        tl.to(el.querySelector(".stem"), { strokeDashoffset: 0, duration: 1.4, ease: "power2.out" }, 1.1)
          .to(el.querySelector(".l1"), { scale: 1, duration: 0.5, ease: "back.out(2.4)" }, 1.5)
          .to(el.querySelector(".t1"), { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2.4)" }, 1.6)
          .add(() => Deck.ctx.sfx("pop"), 1.6)
          .to(el.querySelector(".l2"), { scale: 1, duration: 0.5, ease: "back.out(2.4)" }, 1.9)
          .to(el.querySelector(".t2"), { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2.4)" }, 2.0)
          .add(() => Deck.ctx.sfx("pop"), 2.0)
          .to(el.querySelector(".l3"), { scale: 1, duration: 0.5, ease: "back.out(2.4)" }, 2.3)
          .to(el.querySelector(".can"), { x: 700, opacity: 0, duration: 0.5, ease: "power2.in" }, 2.4);
        return tl;
      },
      (el) => gsap.timeline().to(el.querySelectorAll(".pp li"), { opacity: 1, x: 0, stagger: 0.14, duration: 0.35, ease: "power2.out" })
    ]
  });

  // ---------------- 8. Survey design: a vine of question blocks ----------------
  const BLOCKS = ["Eligibility: on campus?", "Drink habits and spend", "Six factors: what matters", "Agree or disagree (+ attention check)", "Menu: fruit, base, add-ons", "Price and would you buy", "In your own words", "Where on campus", "About you"];
  Deck.add({
    n: 8, stage: "water", title: "Survey design", budget: 75,
    notes: "Role 2. The survey runs in this order: eligibility, habits and spend, importance of six factors, agreement statements with a hidden attention check, product choices, price and intent, two free-text questions, location, demographics.\nThe QR opens a read-only copy of the form.",
    html: () => {
      const n = (D()["10_question_coverage"] || []).length;
      return `${ground}
      <svg class="vine" viewBox="0 0 400 900" style="position:absolute;left:1100px;top:60px;width:400px;height:900px;overflow:visible">
        <path class="vp" d="M200 900 C120 800 280 720 200 620 C120 520 280 440 200 340 C120 240 280 160 200 40" stroke="#2FA84F" stroke-width="16" fill="none" stroke-linecap="round"/></svg>
      ${BLOCKS.map((b, i) => {
        const y = 880 - i * 92, left = i % 2 === 0;
        return `<div class="qb" style="position:absolute;top:${y - 30}px;${left ? "right:" + (1920 - 1290) + "px" : "left:1310px"};background:#FFFDF8;color:#10324A;border-radius:18px;padding:12px 22px;font-size:26px;font-weight:700;white-space:nowrap;box-shadow:0 8px 20px rgba(16,50,74,.18);border-${left ? "right" : "left"}:10px solid #2FA84F">${i + 1}. ${b}</div>`;
      }).join("")}
      <div class="pad" style="right:1100px">
        <div class="s-kicker" style="color:#1E7A38">Water: the survey</div>
        <h2 class="s-title tt" style="font-size:100px;margin:14px 0 30px">${n} questions, grown in order.</h2>
        <div class="qrbox" style="display:flex;gap:28px;align-items:center;margin-bottom:34px">${Kit.qrSVG(Kit.siteURL("survey/index.html"), 230, "#10324A")}<div style="font-size:30px;font-weight:700;max-width:9ch">Scan to see the survey</div></div>
        <ul class="points pp" style="font-size:34px">
          <li><span>Price asked twice: <b>any drink</b> and <b>a smoothie</b>.</span></li>
          <li><span>A hidden <b>attention check</b> caught rushed answers.</span></li>
        </ul>
      </div>
      <div class="source">10_question_coverage.csv; report section "Survey design"</div>`;
    },
    steps: [
      (el) => {
        gsap.set(el.querySelectorAll(".pp li"), { opacity: 0, x: -30 });
        gsap.set(el.querySelector(".vp"), { strokeDasharray: 1300, strokeDashoffset: 1300 });
        const tl = gsap.timeline()
          .from(el.querySelector(".tt"), { y: 40, opacity: 0, duration: 0.5 })
          .to(el.querySelector(".vp"), { strokeDashoffset: 0, duration: 2.2, ease: "power1.inOut" }, 0.1);
        el.querySelectorAll(".qb").forEach((q, i) => tl.from(q, { scale: 0, opacity: 0, x: i % 2 ? -40 : 40, duration: 0.35, ease: "back.out(2.2)" }, 0.25 + i * 0.22));
        tl.add(() => Deck.ctx.sfx("pop"), 0.3).add(() => Deck.ctx.sfx("sparkle"), 2.2)
          .from(el.querySelector(".qrbox"), { scale: 0.5, opacity: 0, duration: 0.5, ease: "back.out(2)" }, 2.2);
        return tl;
      },
      (el) => gsap.timeline().to(el.querySelectorAll(".pp li"), { opacity: 1, x: 0, stagger: 0.14, duration: 0.35 })
    ]
  });

  // ---------------- 9. Washing the fruit: 69 → 53 ----------------
  Deck.add({
    n: 9, stage: "water", title: "69 answers, 53 kept", budget: 75,
    notes: "Role 2. Cleaning is washing the fruit. 4 were rarely on campus, 1 was a duplicate, 11 failed the attention check. 53 remain. 94% are undergraduates.\nEvery result was re-checked under 3 cleaning levels (A, B, C).",
    html: () => {
      const f = D()["01_funnel"] || [];
      const prof = D()["02_sample_profile"] || [];
      const p = (v, l) => (prof.find(r => r.variable === v && r.level === l) || {}).pct;
      const COLS = 12, S = 46;
      const dots = Array.from({ length: f.length ? f[0].n : 69 }, (_, i) => `<i class="dot" data-i="${i}" style="position:absolute;left:${(i % COLS) * S}px;top:${Math.floor(i / COLS) * S}px;width:36px;height:36px;border-radius:50%;background:${["#FFB020", "#E8364F", "#FF9E7A", "#4F5BD5", "#F5D547"][i % 5]};box-shadow:inset -5px -5px 0 rgba(0,0,0,.12)"></i>`).join("");
      const steps = f.slice(1).map((r, i) => ({ label: r.step, n: r.n, removed: f[i].n - r.n }));
      return `
      <div class="pad" style="right:1000px">
        <div class="s-kicker" style="color:#1E7A38">Water: washing the fruit</div>
        <h2 class="s-title tt" style="font-size:100px;margin:14px 0 26px"><span class="count">${f.length ? f[0].n : 69}</span> answers</h2>
        <div class="rinse" style="display:grid;gap:12px;font-size:28px">${steps.map((s, i) => `<div class="rs" data-k="${i}" style="display:flex;justify-content:space-between;gap:20px;padding:12px 20px;border-radius:14px;background:rgba(255,253,248,.55)"><span>${s.label}</span><b>${s.removed ? "−" + s.removed : "0"}</b></div>`).join("")}</div>
        <div class="chips" style="display:flex;flex-wrap:wrap;gap:14px;margin-top:30px">
          <span class="chip">${Math.round(p("affil_group", "Undergraduate") || 94)}% undergraduates</span>
          <span class="chip">${Math.round(p("origin_group", "Hong Kong") || 57)}% from Hong Kong</span>
          <span class="chip">${Math.round(p("gender", "Female") || 40)}% female, ${Math.round(p("gender", "Male") || 60)}% male</span>
        </div>
      </div>
      <div class="basin" style="position:absolute;left:1060px;top:170px;width:${COLS * S}px;height:${Math.ceil(69 / COLS) * S}px">${dots}</div>
      <svg style="position:absolute;left:1010px;top:500px;width:650px;height:300px" viewBox="0 0 650 300"><path d="M10 10 H640 L560 260 Q325 300 90 260 Z" fill="#FFFDF8" fill-opacity=".5" stroke="#10324A" stroke-width="8"/>${Array.from({ length: 24 }, (_, i) => `<circle cx="${80 + (i % 12) * 44}" cy="${110 + Math.floor(i / 12) * 60}" r="7" fill="#10324A" opacity=".5"/>`).join("")}</svg>
      <style>.stage-water .chip{background:#10324A;color:#FFF4E2;padding:10px 20px;border-radius:99px;font-size:26px;font-weight:700}</style>
      <div class="source">01_funnel.csv, 02_sample_profile.csv</div>`;
    },
    steps: [
      (el) => {
        gsap.set(el.querySelectorAll(".chip"), { opacity: 0, y: 20 });
        gsap.set(el.querySelectorAll(".rs"), { opacity: 0.35 });
        return gsap.timeline()
          .from(el.querySelector(".tt"), { y: 40, opacity: 0, duration: 0.4 })
          .from(el.querySelectorAll(".dot"), { y: -700, opacity: 0, duration: 0.6, ease: "bounce.out", stagger: { each: 0.012, from: "random" } }, 0.1)
          .add(() => Deck.ctx.sfx("drop"), 0.4);
      },
      (el) => {
        // Rinse: removed dots fly off at each cleaning step, the counter ticks down.
        const f = D()["01_funnel"] || [];
        const dots = [...el.querySelectorAll(".dot")].reverse();
        const counter = { v: f[0] ? f[0].n : 69 }, out = el.querySelector(".count");
        const tl = gsap.timeline().add(() => Deck.ctx.sfx("water"));
        let used = 0, t = 0;
        f.slice(1).forEach((r, i) => {
          const rm = f[i].n - r.n, batch = dots.slice(used, used + rm); used += rm;
          tl.to(el.querySelector(`.rs[data-k="${i}"]`), { opacity: 1, background: "#FFFDF8", duration: 0.2 }, t);
          if (batch.length) tl.to(batch, { x: 520, y: () => gsap.utils.random(-120, 200), rotate: 200, opacity: 0, duration: 0.6, ease: "power2.in", stagger: 0.03 }, t + 0.1)
            .to(counter, { v: r.n, duration: 0.5, ease: "none", onUpdate: () => out.textContent = Math.round(counter.v) }, t + 0.1);
          t += batch.length ? 0.7 : 0.3;
        });
        tl.to(dots.slice(used), { scale: 1.15, duration: 0.2, yoyo: true, repeat: 1, stagger: 0.005 }, t).add(() => Deck.ctx.sfx("tada"), t);
        return tl;
      },
      (el) => gsap.timeline().to(el.querySelectorAll(".chip"), { opacity: 1, y: 0, stagger: 0.12, duration: 0.35, ease: "back.out(2)" })
    ]
  });
})();
