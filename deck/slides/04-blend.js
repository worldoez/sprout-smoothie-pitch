/* Stage 4: BLEND (Role 4) — slides 13–15: place, fruit race, base + add-ons. */
(function () {
  const D = () => CONTENT.data, M = () => CONTENT.menu;
  const pct = Kit.pct;

  // ---------------- 13. Place: earth → CUHK → dart ----------------
  // PROOF OF CONCEPT: stylised zoom (globe → HK → campus map) + a dart throw. Swap for Leaflet tiles later.
  const spots = () => {
    const pos = { yia: [1120, 470], cc: [800, 640], colleges: [1300, 300], lsk: [640, 420], univ_station: [560, 860] };
    return (D()["04_where"] || []).filter(r => pos[r.key]).map(r => ({ ...r, x: pos[r.key][0], y: pos[r.key][1] }));
  };
  Deck.add({
    n: 13, stage: "blend", title: "Place: where on campus", budget: 50, interactive: true,
    notes: "Role 4. Click 1: zoom from the Earth to CUHK. Click 2: the dart (or click the map anywhere to throw it). Click 3: the evidence.\nYIA and Central Campus tie at 47%.",
    html: () => `
      <div class="zoom" style="position:absolute;inset:0;background:#0B1B33;overflow:hidden">
        <div class="stars" style="position:absolute;inset:0;background-image:radial-gradient(2px 2px at 20% 30%,#fff,transparent),radial-gradient(2px 2px at 70% 20%,#fff,transparent),radial-gradient(1px 1px at 40% 80%,#fff,transparent),radial-gradient(2px 2px at 85% 65%,#fff,transparent);"></div>
        <div class="globe" style="position:absolute;left:960px;top:540px;width:700px;height:700px;margin:-350px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#5DADE2,#1F618D 60%,#0B2E4F);box-shadow:inset -60px -40px 120px rgba(0,0,0,.5),0 0 80px rgba(93,173,226,.5)">
          <div class="land" style="position:absolute;left:52%;top:30%;width:180px;height:140px;border-radius:40% 60% 50% 50%;background:#2FA84F"></div>
          <div class="land" style="position:absolute;left:20%;top:50%;width:140px;height:180px;border-radius:50% 40% 60% 50%;background:#2FA84F"></div>
          <div class="hk" style="position:absolute;left:66%;top:44%;width:18px;height:18px;border-radius:50%;background:#F6C445;box-shadow:0 0 0 8px rgba(246,196,69,.4)"></div>
        </div>
        <div class="campus" style="position:absolute;inset:0;background:#CFE8C4;opacity:0">
          <svg viewBox="0 0 1920 1080" style="position:absolute;inset:0;width:100%;height:100%">
            <path d="M0 900 Q500 820 900 900 T1920 860 V1080 H0Z" fill="#8FD3F4"/>
            <path d="M200 300 Q600 200 1000 320 T1700 260" stroke="#FFF4E2" stroke-width="30" fill="none" stroke-linecap="round"/>
            <path d="M620 820 Q800 640 1040 520 T1260 360" stroke="#FFF4E2" stroke-width="22" fill="none" stroke-linecap="round"/>
            ${spots().map(s => `<g class="spot" data-key="${s.key}"><circle cx="${s.x}" cy="${s.y}" r="${30 + s.pct * 120}" fill="#FF8A1F" opacity=".25"/><circle cx="${s.x}" cy="${s.y}" r="16" fill="#B0244A"/><text x="${s.x + 30}" y="${s.y - 24}" font-family="DM Sans" font-weight="700" font-size="30" fill="#2A1A10">${s.option.replace(" (CC) teaching buildings", "").replace(" (residential colleges)", "")} · ${pct(s.pct)}</text></g>`).join("")}
          </svg>
          <div style="position:absolute;left:60px;top:40px;font-family:var(--font-display);font-weight:900;font-size:64px;color:#2A1A10">CUHK campus <span style="font-size:28px;font-family:var(--font-body);font-weight:500">(stylised, placeholder)</span></div>
        </div>
        <div class="dart" style="position:absolute;left:0;top:0;font-size:120px;opacity:0;pointer-events:none">🎯</div>
        <div class="verdict order-card" style="right:80px;bottom:90px;width:640px;opacity:0">
          <div class="who">Our pick</div><h4>YIA Building</h4>
          <div class="line"><span>Want it at YIA</span><span class="ev">47%</span></div>
          <div class="line"><span>Central Campus (tie)</span><span class="ev">47%</span></div>
          <div class="line"><span>Colleges</span><span class="ev">36%</span></div>
          <div class="src">04_where.csv, n = 53. Second cart at CC in phase 2.</div>
        </div>
      </div>`,
    steps: [
      (el) => gsap.timeline().from(el.querySelector(".globe"), { scale: 0.3, opacity: 0, duration: 0.8, ease: "back.out(1.5)" })
        .to(el.querySelector(".globe"), { rotate: 25, duration: 1.2, ease: "power1.inOut" }, 0.2),
      (el) => gsap.timeline()
        .add(() => Deck.ctx.sfx("whoosh"))
        .to(el.querySelector(".globe"), { scale: 14, x: -1150, y: 280, duration: 1.4, ease: "power3.in" })
        .to(el.querySelector(".campus"), { opacity: 1, duration: 0.4 }, 1.1)
        .from(el.querySelectorAll(".spot"), { scale: 0, transformOrigin: "50% 50%", stagger: 0.1, duration: 0.4, ease: "back.out(2)" }, 1.4),
      (el) => throwDart(el, 1120, 470),
      (el) => gsap.timeline().to(el.querySelector(".verdict"), { opacity: 1, y: 0, duration: 0.5, ease: "back.out(2)" })
    ],
    printFix: (el) => { gsap.set(el.querySelector(".dart"), { x: 1070, y: 390, opacity: 1 }); }
  });
  function throwDart(el, x, y) {
    return gsap.timeline()
      .set(el.querySelector(".dart"), { x: 1900, y: 1000, scale: 3, opacity: 1, rotate: -30 })
      .to(el.querySelector(".dart"), { x: x - 50, y: y - 80, scale: 1, rotate: 0, duration: 0.5, ease: "power2.in" })
      .add(() => Deck.ctx.sfx("thunk"))
      .to(el.querySelector(".zoom"), { x: 8, duration: 0.05, yoyo: true, repeat: 5 });
  }

  // ---------------- 14. Fruit race (professor's fruit gets a badge) ----------------
  Deck.add({
    n: 14, stage: "blend", title: "Fruit race", budget: 40, usesOrder: true,
    notes: "Role 4. Mango wins with 72%. The professor's fruit picks get a crown.",
    html: () => `
      <div class="pad">
        <div class="s-kicker">Blend: the fruit</div>
        <h2 class="s-title" style="font-size:96px;margin:12px 0 40px">The fruit race</h2>
        <div class="race" style="display:grid;gap:22px">${M().fruits.map(f => `
          <div class="lane" data-key="${f.key}" style="position:relative;height:110px;border-radius:55px;background:rgba(42,26,16,.12)">
            <div class="runner" data-w="${f.pct / 0.8 * 100}" style="position:absolute;left:0;top:0;height:110px;width:110px;border-radius:55px;background:${f.color};display:flex;align-items:center;justify-content:flex-end;padding-right:6px">
              <span class="fruit-emoji" style="font-size:84px">${f.emoji}</span></div>
            <span style="position:absolute;left:30px;top:50%;transform:translateY(-50%);font-weight:700;font-size:34px;color:#2A1A10;mix-blend-mode:multiply">${f.name}</span>
            <span class="pv" style="position:absolute;right:30px;top:50%;transform:translateY(-50%);font-weight:900;font-size:44px;font-family:var(--font-display)">${pct(f.pct)}</span>
            <span class="crown" style="position:absolute;right:150px;top:-26px;font-size:60px;opacity:0">👑 <small style="font-size:26px;font-weight:700;vertical-align:middle">Professor's pick</small></span>
          </div>`).join("")}</div>
      </div>
      <div class="source">04_fruit.csv: share of 53 students who picked each fruit</div>`,
    steps: [
      (el) => {
        const tl = gsap.timeline();
        el.querySelectorAll(".runner").forEach((r, i) => tl.to(r, { width: `max(110px, ${r.dataset.w}%)`, duration: 1.6 + i * 0.15, ease: "power2.inOut" }, 0));
        tl.from(el.querySelectorAll(".pv"), { opacity: 0, duration: 0.3, stagger: 0.1 }, 1.4).add(() => Deck.ctx.sfx("tada"), 1.6);
        return tl;
      }
    ],
    onOrder: (el, o) => el.querySelectorAll(".lane").forEach(l => {
      const on = (o.fruits || []).includes(l.dataset.key), c = l.querySelector(".crown");
      gsap.to(c, { opacity: on ? 1 : 0, y: on ? 0 : 20, duration: 0.4, ease: "back.out(2)" });
    })
  });

  // ---------------- 15. Base + add-ons into the blender ----------------
  const blender = `<svg class="blender" viewBox="0 0 400 640" style="position:absolute;right:220px;bottom:90px;width:400px;overflow:visible">
      <path d="M70 40 H330 L300 440 H100 Z" fill="#FFFFFF" fill-opacity=".35" stroke="#2A1A10" stroke-width="10" stroke-linejoin="round"/>
      <clipPath id="jar"><path d="M70 40 H330 L300 440 H100 Z"/></clipPath>
      <g clip-path="url(#jar)"><rect class="liquid" x="0" y="440" width="400" height="420" fill="#FFB020"/></g>
      <rect x="40" y="10" width="320" height="40" rx="14" fill="#2A1A10"/>
      <path d="M80 440 H320 L340 600 H60 Z" fill="#B0244A" stroke="#2A1A10" stroke-width="10" stroke-linejoin="round"/>
      <circle cx="200" cy="525" r="30" fill="#F6C445" stroke="#2A1A10" stroke-width="8"/></svg>`;
  Deck.add({
    n: 15, stage: "blend", title: "Base and add-ons", budget: 40, usesOrder: true,
    notes: "Role 4. Yogurt and juice tie at 53%. Protein (51%) and vitamin (49%) lead the add-ons. Fancy names are placeholders.",
    html: () => `${blender}
      <style>.stage-blend .cols .bar{grid-template-columns:200px 1fr 84px;gap:12px;font-size:28px}.stage-blend .cols .bar .track{height:38px}</style><div class="pad" style="right:760px">
        <div class="s-kicker">Blend: base and boosters</div>
        <h2 class="s-title" style="font-size:96px;margin:12px 0 30px">Into the blender</h2>
        <div class="cols" style="display:grid;grid-template-columns:1fr 1fr;gap:40px">
          <div><h3 style="font-size:40px;margin-bottom:16px">Base</h3>${Kit.barsHTML(M().bases.map(b => ({ key: b.key, label: b.name, value: b.pct })), 0.6)}</div>
          <div><h3 style="font-size:40px;margin-bottom:16px">Boosters</h3>${Kit.barsHTML(M().addons.map(a => ({ key: a.key, label: a.fancy, value: a.pct })), 0.6)}</div>
        </div>
      </div>
      <div class="falling" style="position:absolute;right:340px;top:0;font-size:90px">${["🥛", "🍓", "🥭", "🌾", "💪"].map(e => `<span class="fall" style="position:absolute">${e}</span>`).join("")}</div>
      <div class="source">04_base.csv, 04_addons.csv (n = 53)</div>`,
    steps: [
      (el) => {
        const tl = gsap.timeline();
        el.querySelectorAll(".cols > div").forEach((c, i) => Kit.animateBars(c, tl, i * 0.3));
        el.querySelectorAll(".bar .lab").forEach(l => gsap.set(l, { fontSize: 28 }));
        tl.fromTo(el.querySelectorAll(".fall"), { y: -200, x: () => gsap.utils.random(-60, 60), rotate: 0, opacity: 1 },
          { y: 560, rotate: () => gsap.utils.random(-200, 200), opacity: 0, duration: 0.9, ease: "power2.in", stagger: 0.25 }, 0.2)
          .add(() => Deck.ctx.sfx("drop"), 0.9)
          .to(el.querySelector(".liquid"), { attr: { y: 140 }, duration: 1.6, ease: "power2.out" }, 0.6)
          .add(() => Deck.ctx.sfx("blender"), 1.6)
          .to(el.querySelector(".blender"), { x: 6, duration: 0.05, yoyo: true, repeat: 23, ease: "none" }, 1.6)
          .to(el.querySelector(".liquid"), { fill: "#FF8A3D", duration: 1.2 }, 1.6);
        return tl;
      }
    ],
    onOrder: (el, o) => el.querySelectorAll(".bar").forEach(b => {
      const on = b.dataset.key && (o.base === b.dataset.key || (o.addons || []).includes(b.dataset.key));
      b.classList.toggle("hl", !!on);
    })
  });
})();
