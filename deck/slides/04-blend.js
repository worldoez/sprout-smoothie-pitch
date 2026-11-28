/* Stage 4: BLEND (Role 4) — slides 14–15: fruit race, base + add-ons (slide 13 is in 04-place.js). */
(function () {
  const D = () => CONTENT.data, M = () => CONTENT.menu;
  const pct = Kit.pct;

  // Slide 13 (place) lives in 04-place.js.

  // ---------------- 14. Fruit race (professor's fruit gets a badge) ----------------
  Deck.add({
    n: 14, stage: "blend", title: "Fruit race", budget: 40, usesOrder: true,
    notes: "Role 4. Mango wins with 73%. The professor's fruit picks get a crown.",
    html: () => `
      <div class="pad">
        <div class="s-kicker">Blend: the fruit</div>
        <h2 class="s-title" style="font-size:96px;margin:12px 0 40px">The fruit race</h2>
        <div class="race" style="display:grid;gap:22px">${M().fruits.map(f => `
          <div class="lane" data-key="${f.key}" style="position:relative;height:110px;border-radius:55px;background:rgba(37, 41, 43,.12)">
            <div class="runner" data-w="${f.pct / 0.8 * 100}" style="position:absolute;left:0;top:0;height:110px;width:110px;border-radius:55px;background:${f.color};display:flex;align-items:center;justify-content:flex-end;padding-right:6px">
              <span class="fruit-emoji" style="font-size:84px">${f.emoji}</span></div>
            <span style="position:absolute;left:30px;top:50%;transform:translateY(-50%);font-weight:700;font-size:34px;color:#25292B;mix-blend-mode:multiply">${f.name}</span>
            <span class="pv" style="position:absolute;right:30px;top:50%;transform:translateY(-50%);font-weight:900;font-size:44px;font-family:var(--font-display)">${pct(f.pct)}</span>
            <span class="crown" style="position:absolute;right:150px;top:-26px;font-size:60px;opacity:0"><span style="display:inline-block;background:#9A3E4B;color:#F2D9C2;border:4px solid #25292B;border-radius:99px;padding:4px 16px;font-size:26px;font-weight:700;vertical-align:middle">Order #1 pick</span></span>
          </div>`).join("")}</div>
      </div>
      <div class="source">04_fruit.csv: share of ${Kit.nUsable()} students who picked each fruit</div>`,
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
      <path d="M70 40 H330 L300 440 H100 Z" fill="#FFFFFF" fill-opacity=".35" stroke="#25292B" stroke-width="10" stroke-linejoin="round"/>
      <clipPath id="jar"><path d="M70 40 H330 L300 440 H100 Z"/></clipPath>
      <g clip-path="url(#jar)"><rect class="liquid" x="0" y="440" width="400" height="420" fill="#FFB020"/></g>
      <rect x="40" y="10" width="320" height="40" rx="14" fill="#25292B"/>
      <path d="M80 440 H320 L340 600 H60 Z" fill="#9A3E4B" stroke="#25292B" stroke-width="10" stroke-linejoin="round"/>
      <circle cx="200" cy="525" r="30" fill="#E8C26A" stroke="#25292B" stroke-width="8"/></svg>`;
  Deck.add({
    n: 15, stage: "blend", title: "Base and add-ons", budget: 40, usesOrder: true,
    notes: "Role 4. Yogurt and juice tie at 53%. Protein powder (51%) and vitamins (49%) lead the boosts. Matcha and coffee were asked as one combined energy boost (40%).",
    html: () => `${blender}
      <style>.stage-blend .cols .bar{grid-template-columns:200px 1fr 84px;gap:12px;font-size:28px}.stage-blend .cols .bar .track{height:38px}</style><div class="pad" style="right:760px">
        <div class="s-kicker">Blend: base and boosts</div>
        <h2 class="s-title" style="font-size:96px;margin:12px 0 30px">Into the blender</h2>
        <div class="cols" style="display:grid;grid-template-columns:1fr 1fr;gap:40px">
          <div><h3 style="font-size:40px;margin-bottom:16px">Base</h3>${Kit.barsHTML(M().bases.map(b => ({ key: b.key, label: b.name, value: b.pct })), 0.6)}</div>
          <div><h3 style="font-size:40px;margin-bottom:16px">Boosts</h3>${Kit.barsHTML(M().addons.map(a => ({ key: a.key, label: a.fancy, value: a.pct })), 0.6)}<div style="font-size:22px;opacity:.7;margin-top:14px">Matcha + coffee: the survey asked them as one combined energy boost.</div></div>
        </div>
      </div>
      <div class="falling" style="position:absolute;right:340px;top:0;font-size:90px">${["🥛", "🍓", "🥭", "🌾", "💪"].map(e => `<span class="fall" style="position:absolute">${e}</span>`).join("")}</div>
      <div class="source">04_base.csv, 04_addons.csv (n = ${Kit.nUsable()})</div>`,
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
