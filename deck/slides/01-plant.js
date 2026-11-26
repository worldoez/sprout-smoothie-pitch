/* Stage 1: PLANT THE SEED (Role 1) — slides 1–6 */
(function () {
  const B = () => CONTENT.brand;

  // Seeded random so the splat looks identical every time (and in the PDF).
  function rng(seed) { return () => (seed = (seed * 16807) % 2147483647) / 2147483647; }
  function blobPath(cx, cy, r, pts, seed, wob = 0.35) {
    const rand = rng(seed), p = [];
    for (let i = 0; i < pts; i++) { const a = (i / pts) * Math.PI * 2, rr = r * (1 - wob / 2 + rand() * wob); p.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
    let d = `M${(p[0][0] + p[pts - 1][0]) / 2} ${(p[0][1] + p[pts - 1][1]) / 2}`;
    for (let i = 0; i < pts; i++) { const a = p[i], b = p[(i + 1) % pts]; d += ` Q${a[0]} ${a[1]} ${(a[0] + b[0]) / 2} ${(a[1] + b[1]) / 2}`; }
    return d + "Z";
  }
  function splatSVG() {
    const rand = rng(7);
    let drops = "";
    for (let i = 0; i < 26; i++) {
      const a = rand() * Math.PI * 2, d = 380 + rand() * 520, r = 14 + rand() * 46;
      drops += `<circle class="sp-drop" cx="${960 + Math.cos(a) * d}" cy="${540 + Math.sin(a) * d * 0.7}" r="${r}" fill="${i % 3 ? "#FFB020" : "#E8364F"}"/>`;
    }
    let drips = "";
    for (let i = 0; i < 9; i++) { const x = 640 + i * 80 + rand() * 30, w = 26 + rand() * 26; drips += `<rect class="sp-drip" x="${x}" y="560" width="${w}" height="${180 + rand() * 300}" rx="${w / 2}" fill="#FF9E1F"/>`; }
    return `<svg class="splat" viewBox="0 0 1920 1080" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none">
      <g class="sp-main" style="transform-origin:960px 540px">
        ${drips}
        <path d="${blobPath(960, 520, 470, 22, 3, 0.6)}" fill="#FF9E1F"/>
        <path d="${blobPath(930, 520, 330, 16, 11, 0.5)}" fill="#FFB020"/>
        <path d="${blobPath(1010, 470, 190, 12, 5, 0.5)}" fill="#E8364F" opacity=".85"/>
        <ellipse cx="840" cy="400" rx="70" ry="30" fill="#FFF" opacity=".45" transform="rotate(-25 840 400)"/>
      </g>
      ${drops}
    </svg>`;
  }

  // Walk cycle: legs swing, body bobs. Returns a repeating timeline (kill when done).
  function walkCycle(mo, cycles = 6) {
    return gsap.timeline({ repeat: cycles - 1 })
      .to(mo.querySelector(".mo-leg-l"), { rotate: 22, duration: 0.18, ease: "sine.inOut" }, 0)
      .to(mo.querySelector(".mo-leg-r"), { rotate: -22, duration: 0.18, ease: "sine.inOut" }, 0)
      .to(mo.querySelector(".mo-body"), { y: -8, duration: 0.18, ease: "sine.out" }, 0)
      .to(mo.querySelector(".mo-leg-l"), { rotate: -22, duration: 0.18, ease: "sine.inOut" }, 0.18)
      .to(mo.querySelector(".mo-leg-r"), { rotate: 22, duration: 0.18, ease: "sine.inOut" }, 0.18)
      .to(mo.querySelector(".mo-body"), { y: 0, duration: 0.18, ease: "sine.in" }, 0.18)
      .add(() => Deck.ctx.sfx("step"), 0.1);
  }
  const idle = (mo) => gsap.timeline({ repeat: -1, yoyo: true })
    .to(mo.querySelector(".mo-body"), { y: -6, scaleY: 1.02, duration: 0.9, ease: "sine.inOut" }, 0)
    .to(mo.querySelector(".mo-leaf"), { rotate: 8, duration: 0.9, ease: "sine.inOut" }, 0);

  const sceneBG = `<div style="position:absolute;inset:0;background:linear-gradient(#FFE4B8 0%, #FFD08A 62%, #2FA84F 62%, #24903F 100%)"></div>
    <div class="sun" style="position:absolute;right:180px;top:120px;width:220px;height:220px;border-radius:50%;background:#FFF4E2;box-shadow:0 0 0 30px rgba(255,244,226,.35),0 0 0 70px rgba(255,244,226,.18)"></div>
    <svg style="position:absolute;left:0;bottom:350px;width:100%" viewBox="0 0 1920 120" preserveAspectRatio="none"><path d="M0 120 Q240 30 480 90 T960 70 T1440 90 T1920 50 V120Z" fill="#7CC576"/></svg>`;

  Object.assign(Kit, { splatSVG, walkCycle, idle, sceneBG, blobPath });

  // ---------------- 1. Brand intro ----------------
  const ORBIT = ["🥭", "🍓", "🍌", "🫐", "🍑", "🥝", "🍍", "🍊"];
  Deck.add({
    n: 1, stage: "plant", title: "Brand intro", budget: 20, music: "brand", musicVol: 0.3,
    notes: "Role 1. Let the logo loop while you greet the room.\n\"Hi, we're team ___. This is Sprout: smoothies grown from what CUHK students told us.\"",
    html: () => `
      <div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 45%, #FFB347 0%, #FF8A1F 38%, #D9481F 75%, #B0244A 100%)"></div>
      <div class="orbit" style="position:absolute;left:960px;top:520px;width:0;height:0">
        ${ORBIT.map((f, i) => `<div class="orb" style="position:absolute;transform:rotate(${i * 45}deg) translateX(560px) rotate(${-i * 45}deg)"><span class="orb-in fruit-emoji" style="display:block;font-size:110px;margin:-60px">${f}</span></div>`).join("")}
      </div>
      <div style="position:absolute;inset:0;display:grid;place-items:center;text-align:center;color:#FFF4E2">
        <div>
          <div class="pill" style="display:inline-block;padding:14px 30px;border-radius:99px;background:#FFF4E2;color:#B0244A;font-weight:700;font-size:30px">Fresh smoothies for CUHK</div>
          <h1 class="logo" style="font-family:var(--font-display);font-weight:900;font-size:330px;line-height:.9;margin:20px 0 70px;text-shadow:0 14px 0 rgba(90,20,20,.25)">${Kit.splitLetters(B().name)}</h1>
          <div class="slogan" style="font-size:54px;font-family:var(--font-display);font-weight:500">${Kit.splitLetters(B().slogan, "sl")}</div>
        </div>
      </div>`,
    ambient: (el) => {
      const tl = gsap.timeline();
      tl.to(el.querySelector(".orbit"), { rotate: 360, duration: 40, ease: "none", repeat: -1 }, 0);
      tl.to(el.querySelectorAll(".orb-in"), { rotate: -360, duration: 40, ease: "none", repeat: -1 }, 0);
      tl.to(el.querySelectorAll(".logo .ch"), { y: -14, duration: 1.1, ease: "sine.inOut", stagger: { each: 0.12, repeat: -1, yoyo: true } }, 2);
      return tl;
    },
    steps: [
      (el) => gsap.timeline()
        .from(el.querySelectorAll(".logo .ch"), { y: -700, rotate: () => gsap.utils.random(-40, 40), duration: 0.9, ease: "bounce.out", stagger: 0.08 })
        .add(() => Deck.ctx.sfx("pop"), 0.5)
        .from(el.querySelector(".pill"), { scale: 0, duration: 0.5, ease: "back.out(3)" }, 0.6)
        .from(el.querySelectorAll(".slogan .sl"), { opacity: 0, duration: 0.01, stagger: 0.035 }, 0.9)
        .from(el.querySelectorAll(".orb-in"), { scale: 0, duration: 0.6, ease: "back.out(2)", stagger: 0.06 }, 0.4)
    ]
  });

  // ---------------- 2. Mo walks out with the drink ----------------
  Deck.add({
    n: 2, stage: "plant", title: "Mo walks out", budget: 20, music: "brand", musicVol: 0.2,
    notes: "\"Meet Mo, our mascot. Mo has been carrying our first smoothie all week...\"",
    html: (ctx) => `${sceneBG}
      <div class="mo" style="position:absolute;left:760px;top:330px;width:420px;height:540px">${ctx.art.mascot({ cup: true })}</div>
      <div class="bubble b1" style="left:1150px;top:220px">Fresh mango, coming through!</div>
      <div class="sparkles" style="position:absolute;left:1060px;top:300px;font-size:60px">✨</div>
      <h2 class="s-title t" style="position:absolute;left:130px;top:110px;color:#2A1A10;font-size:110px">Meet Mo.</h2>`,
    steps: [
      (el) => {
        const mo = el.querySelector(".mo");
        gsap.set([el.querySelector(".b1"), el.querySelector(".sparkles")], { opacity: 0, scale: 0.5 });
        const walk = walkCycle(mo, 7);
        return gsap.timeline({ onComplete: () => walk.kill() })
          .from(mo, { x: -1300, duration: 2.5, ease: "none" }, 0)
          .add(walk, 0)
          .from(el.querySelector(".t"), { y: -80, opacity: 0, duration: 0.5, ease: "back.out(2)" }, 0.4)
          .to(mo.querySelectorAll(".mo-leg-l, .mo-leg-r"), { rotate: 0, duration: 0.15 }, 2.5)
          .to(el.querySelector(".b1"), { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2.5)" }, 2.55)
          .add(() => Deck.ctx.sfx("pop"), 2.55);
      },
      (el) => {
        const mo = el.querySelector(".mo");
        return gsap.timeline()
          .add(() => Deck.ctx.sfx("tada"))
          .to(mo, { scaleX: -1, duration: 0.25, yoyo: true, repeat: 3, ease: "power1.inOut" })
          .to(mo.querySelector(".mo-arm-r"), { rotate: -35, duration: 0.3, ease: "back.out(2)" }, 0.2)
          .to(mo.querySelector(".mo-hand-cup"), { y: -60, rotate: -8, duration: 0.3, ease: "back.out(2)" }, 0.2)
          .to(el.querySelector(".sparkles"), { opacity: 1, scale: 1.4, rotate: 20, duration: 0.4, ease: "back.out(3)" }, 0.5)
          .add(() => Deck.ctx.sfx("sparkle"), 0.5)
          .to(mo, { y: -40, duration: 0.25, yoyo: true, repeat: 1, ease: "power2.out" }, 1.0);
      }
    ]
  });

  // ---------------- 3. The spill ----------------
  Deck.add({
    n: 3, stage: "plant", title: "The spill", budget: 20, music: "brand", musicVol: 0.15,
    notes: "Click once: Mo trips and the smoothie splats. Act surprised: \"Oh no, Mo!\"\nClick again: \"That's okay. We'll show you how to make a new one, from the seed up.\"",
    html: (ctx) => `${sceneBG}
      <div class="mo" style="position:absolute;left:760px;top:330px;width:420px;height:540px">${ctx.art.mascot({ cup: true })}</div>
      <div class="splat-wrap">${splatSVG()}</div>
      <div class="bubble b1" style="left:250px;top:150px;font-size:110px;background:#B0244A;color:#FFF4E2">Oh no!!</div>
      <div class="bubble b2" style="left:250px;top:150px;font-size:58px;max-width:900px;line-height:1.1">That's okay… we'll show you how to make a new one.</div>`,
    ambient: (el) => idle(el.querySelector(".mo")),
    steps: [
      (el) => {
        gsap.set(el.querySelectorAll(".sp-main, .sp-drop"), { scale: 0, transformOrigin: "50% 50%" });
        gsap.set(el.querySelectorAll(".sp-drip"), { scaleY: 0, transformOrigin: "50% 0%" });
        gsap.set(el.querySelectorAll(".b1, .b2"), { opacity: 0, scale: 0.4 });
        return gsap.timeline().from(el.querySelector(".mo"), { y: 20, duration: 0.3 });
      },
      (el) => {
        const mo = el.querySelector(".mo"), cup = mo.querySelector(".mo-hand-cup");
        return gsap.timeline()
          .to(mo.querySelector(".mo-body"), { rotate: 18, duration: 0.15, ease: "power2.in" })
          .to(mo.querySelector(".mo-leg-r"), { rotate: -50, duration: 0.15 }, 0)
          .to(mo.querySelector(".mo-arm-r"), { rotate: -80, duration: 0.15 }, 0)
          .add(() => Deck.ctx.sfx("whoosh"), 0.05)
          .to(cup, { x: 120, y: -420, rotate: 540, scale: 3.4, duration: 0.55, ease: "power2.out" }, 0.08)
          .to(cup, { opacity: 0, duration: 0.05 }, 0.6)
          .to(el.querySelector(".sp-main"), { scale: 1, duration: 0.25, ease: "back.out(1.4)" }, 0.6)
          .to(el.querySelectorAll(".sp-drop"), { scale: 1, duration: 0.3, ease: "back.out(2)", stagger: 0.008 }, 0.62)
          .add(() => Deck.ctx.sfx("splat"), 0.6)
          .to(el.querySelectorAll(".sp-drip"), { scaleY: 1, duration: 2.2, ease: "power1.in", stagger: 0.12 }, 0.9)
          .to(mo.querySelector(".mo-body"), { rotate: 0, duration: 0.3, ease: "back.out(2)" }, 0.8)
          .to(mo.querySelectorAll(".mo-leg-r, .mo-arm-r"), { rotate: 0, duration: 0.3 }, 0.8)
          .to(mo.querySelector(".mo-mouth"), { opacity: 0, duration: 0.1 }, 0.9)
          .to(mo.querySelector(".mo-mouth-sad"), { opacity: 1, duration: 0.1 }, 0.9)
          .to(el.querySelector(".b1"), { opacity: 1, scale: 1, rotate: -4, duration: 0.35, ease: "back.out(3)" }, 1.0)
          .add(() => Deck.ctx.sfx("sad"), 1.1);
      },
      (el) => {
        const mo = el.querySelector(".mo");
        return gsap.timeline()
          .to(el.querySelector(".b1"), { opacity: 0, scale: 0.6, duration: 0.2 })
          .to(el.querySelector(".b2"), { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" }, 0.1)
          .to(mo.querySelector(".mo-mouth-sad"), { opacity: 0, duration: 0.1 }, 0.3)
          .to(mo.querySelector(".mo-mouth"), { opacity: 1, duration: 0.1 }, 0.3)
          .to(mo.querySelector(".mo-arm-l"), { rotate: 60, duration: 0.3, yoyo: true, repeat: 1 }, 0.3)
          .to(mo.querySelector(".mo-arm-r"), { rotate: -60, duration: 0.3, yoyo: true, repeat: 1 }, 0.3);
      }
    ]
  });

  // ---------------- 4. Let's grow something new + professor's order ----------------
  Deck.add({
    n: 4, stage: "plant", title: "Let's grow something new", budget: 40, usesOrder: true,
    notes: "Hand the phone to the professor (order app already open).\n\"Professor, you're our first customer. Build your smoothie as we go: we'll reveal it at the end of Blend.\"\nPress R any time to pull in the newest order.",
    html: (ctx) => `
      <div style="position:absolute;inset:0;background:#FF9E1F"></div>
      <div class="splat-wrap">${splatSVG()}</div>
      <div class="pad" style="display:grid;grid-template-columns:1fr 520px 620px;gap:60px;align-items:center">
        <div>
          <h2 class="s-title big" style="font-size:150px;color:#2A1A10">${Kit.splitLetters("Let's grow", "w")}<br>${Kit.splitLetters("something new.", "w")}</h2>
          <p class="s-sub ask" style="color:#2A1A10;margin-top:40px">What should we make? <b>Professor, you decide.</b> Your order is Order #1.</p>
        </div>
        <div class="qrbox" style="text-align:center;color:#2A1A10">${Kit.qrSVG(Kit.siteURL("order/index.html"), 440)}<div style="font-weight:700;font-size:28px;margin-top:16px">Scan to order</div></div>
        <div class="order-card oc" style="position:relative">${Kit.orderCardHTML(null, ctx)}</div>
      </div>`,
    onOrder: (el, o, ctx) => { const c = el.querySelector(".oc"); if (c) c.innerHTML = o.source === "example" ? `<div class="who">Order #1</div><h4>Waiting for the professor…</h4><div class="src">Press R to check again</div>` : Kit.orderCardHTML(o, ctx); },
    steps: [
      (el) => {
        gsap.set(el.querySelectorAll(".sp-drip"), { scaleY: 1, transformOrigin: "50% 0%" });
        gsap.set(el.querySelectorAll(".qrbox, .oc, .ask"), { opacity: 0, y: 40 });
        return gsap.timeline()
          .add(() => Deck.ctx.sfx("riser"))
          .to(el.querySelector(".splat-wrap"), { scale: 0.02, rotate: 200, duration: 0.8, ease: "power3.in", transformOrigin: "50% 48%" })
          .add(() => Deck.ctx.sfx("pop"))
          .from(el.querySelectorAll(".big .w"), { y: 120, opacity: 0, rotate: 10, duration: 0.5, ease: "back.out(2)", stagger: 0.03 });
      },
      (el) => gsap.timeline()
        .to(el.querySelector(".ask"), { opacity: 1, y: 0, duration: 0.4 })
        .to(el.querySelector(".qrbox"), { opacity: 1, y: 0, duration: 0.5, ease: "back.out(2)" }, 0.15)
        .to(el.querySelector(".oc"), { opacity: 1, y: 0, duration: 0.5, ease: "back.out(2)" }, 0.3)
    ]
  });

  // ---------------- 5. The seed: our idea + Booster Juice ----------------
  Deck.add({
    n: 5, stage: "plant", title: "The seed: our idea", budget: 45,
    notes: "Role 1: who we are and the idea.\nBooster Juice: PLACEHOLDER — add 1–2 sourced facts (founded in Canada, smoothies with 'boosters').",
    html: () => `
      <div style="position:absolute;left:0;right:0;bottom:0;height:330px;background:#5B3A22"></div>
      <div style="position:absolute;left:0;right:0;bottom:300px;height:60px;background:radial-gradient(circle at 20px 60px,#5B3A22 34px,transparent 35px) 0 0/80px 60px repeat-x"></div>
      <svg class="plant" viewBox="0 0 400 600" style="position:absolute;right:300px;bottom:240px;width:400px;height:600px;overflow:visible">
        <ellipse class="hole" cx="200" cy="520" rx="70" ry="16" fill="#2E1C0F"/>
        <path class="stem" d="M200 520 C200 430 190 380 205 300" stroke="#2FA84F" stroke-width="16" stroke-linecap="round" fill="none"/>
        <path class="leaf1" d="M203 340 C150 300 120 320 110 350 C150 370 180 360 203 340Z" fill="#2FA84F" stroke="#1E7A38" stroke-width="4"/>
        <path class="leaf2" d="M205 300 C250 240 300 250 310 280 C270 310 235 315 205 300Z" fill="#41C163" stroke="#1E7A38" stroke-width="4"/>
        <ellipse class="seed" cx="200" cy="510" rx="22" ry="30" fill="#8B5A2B" stroke="#2A1A10" stroke-width="4"/>
      </svg>
      <div class="pad">
        <div class="s-kicker">Plant the seed</div>
        <h2 class="s-title tt" style="font-size:104px;margin:12px 0 40px;max-width:14ch">It started with one idea.</h2>
        <ul class="points pp" style="max-width:26ch">
          <li><span>Campus drinks are <b>canteen tea and vending cans</b>. Fresh fruit is hard to find.</span></li>
          <li><span>Inspired by <b>Booster Juice</b> in Canada: fresh smoothies plus "boosters". <i>(facts to add)</i></span></li>
          <li><span>Our question: would CUHK students buy one, and <b>which one</b>?</span></li>
        </ul>
      </div>`,
    steps: [
      (el) => {
        gsap.set(el.querySelectorAll(".pp li"), { opacity: 0, x: -30 });
        gsap.set(el.querySelector(".stem"), { strokeDasharray: 260, strokeDashoffset: 260 });
        gsap.set(el.querySelectorAll(".leaf1, .leaf2"), { scale: 0, transformOrigin: "100% 100%" });
        return gsap.timeline()
          .from(el.querySelector(".tt"), { y: 40, opacity: 0, duration: 0.5 })
          .from(el.querySelector(".seed"), { y: -900, duration: 0.8, ease: "bounce.out" }, 0.1)
          .add(() => Deck.ctx.sfx("seed"), 0.5)
          .to(el.querySelector(".seed"), { scaleY: 0.4, y: 14, duration: 0.3 }, 1.0)
          .to(el.querySelector(".stem"), { strokeDashoffset: 0, duration: 1.0, ease: "power2.out" }, 1.1)
          .to(el.querySelector(".leaf1"), { scale: 1, duration: 0.5, ease: "back.out(2.5)" }, 1.6)
          .to(el.querySelector(".leaf2"), { scale: 1, duration: 0.5, ease: "back.out(2.5)" }, 1.8)
          .add(() => Deck.ctx.sfx("pop"), 1.7);
      },
      (el) => gsap.timeline().to(el.querySelectorAll(".pp li"), { opacity: 1, x: 0, stagger: 0.15, duration: 0.35 })
    ]
  });

  // ---------------- 6. Competition on campus ----------------
  const shopNames = { canteens: "Canteens", vending: "Vending machines", uc_boba: "UC bubble tea", tuck_shop: "Tuck shops", cafe_tolo: "Café Tolo", cc_kunkle: "Kunkle (CC)" };
  const shops = () => (CONTENT.data["02_shops_used"] || []).filter(r => shopNames[r.shop]).slice(0, 6)
    .map((r, i) => ({ label: shopNames[r.shop], value: r.share, hl: i === 0 }));
  Kit.content({
    n: 6, stage: "plant", title: "Where students drink now", kicker: "Competition", budget: 60,
    visual: { bars: shops() },
    points: [
      "<b>78%</b> use canteens and <b>60%</b> vending machines.",
      "Usual spend today is only <b>HK$10</b>: cheap, not fresh.",
      "No fresh-smoothie stall on campus: a gap to fill."
    ],
    source: "02_shops_used.csv, 03_price_summary.csv (n = 53)",
    notes: "Role 1. Shares are the share of respondents who used each shop."
  });
})();
