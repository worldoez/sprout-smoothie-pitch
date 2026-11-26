/* Stage 5: POUR (Role 4) — slide 16: the professor's cup is poured, revealed, and slides off to the right
   (so the cardboard cut-out can be "pulled out" from behind the screen). */
(function () {
  Deck.add({
    n: 16, stage: "pour", title: "Product reveal: Order #1", budget: 35, usesOrder: true,
    notes: "Role 4.\nClick 1: the blender pours into the cup.\nClick 2: the cup is revealed with the professor's name and every choice next to its survey number.\nClick 3: the cup slides off to the right. Pull the cardboard cup from behind the screen and hand it to the professor.",
    html: (ctx) => {
      const o = ctx.order || CONTENT.menu.exampleOrder;
      const f = (o.fruits || []).map(k => ctx.fruit(k)).filter(Boolean);
      return `
      <div style="position:absolute;inset:0;background:radial-gradient(circle at 40% 55%, #D93A63 0%, #B0244A 55%, #7A1430 100%)"></div>
      <div class="rays" style="position:absolute;left:720px;top:620px;width:2400px;height:2400px;margin:-1200px;background:repeating-conic-gradient(from 0deg, rgba(255,244,226,.09) 0 10deg, transparent 10deg 20deg);border-radius:50%;opacity:0"></div>
      <svg class="jar" viewBox="0 0 400 640" style="position:absolute;left:330px;top:-40px;width:330px;overflow:visible;transform-origin:80% 20%">
        <path d="M70 40 H330 L300 440 H100 Z" fill="#FFF" fill-opacity=".35" stroke="#2A1A10" stroke-width="10" stroke-linejoin="round"/>
        <path d="M100 160 H320 L300 440 H100 Z" fill="${f[0] ? f[0].color : "#FFB020"}"/>
        <rect x="40" y="10" width="320" height="40" rx="14" fill="#2A1A10"/></svg>
      <div class="stream" style="position:absolute;left:670px;top:330px;width:46px;height:0;border-radius:23px;background:linear-gradient(${f[0] ? f[0].color : "#FFB020"}, ${f[1] ? f[1].color : "#E8364F"})"></div>
      <div class="cupbox" style="position:absolute;left:470px;top:440px;width:500px;height:820px">${ctx.art.cup({ colorA: f[0] ? f[0].color : "#FFB020", colorB: f[1] ? f[1].color : (f[0] ? f[0].color : "#E8364F"), label: "Order #1" })}</div>
      <div class="reveal" style="position:absolute;left:1080px;top:110px;width:720px;color:#FFF4E2">
        <div class="s-kicker" style="color:#F6C445">Poured fresh for</div>
        <h2 class="s-title who-name" style="font-size:110px;margin:6px 0 24px">${o.name || "Professor"}</h2>
        <div class="order-card oc" style="position:relative;width:720px">${Kit.orderCardHTML(o, ctx)}</div>
      </div>
      <div class="handoff" style="position:absolute;left:130px;top:430px;font-family:var(--font-display);font-weight:900;font-size:76px;color:#FFF4E2;max-width:11ch;opacity:0">Your smoothie is on its way, Professor →</div>`;
    },
    steps: [
      (el) => {
        const cup = el.querySelector(".cup-fill");
        gsap.set(cup, { y: 140 });
        gsap.set(el.querySelectorAll(".reveal, .reveal .oc"), { opacity: 0 });
        return gsap.timeline()
          .from(el.querySelector(".cupbox"), { y: 600, duration: 0.6, ease: "back.out(1.4)" })
          .from(el.querySelector(".jar"), { x: -500, y: -200, duration: 0.6, ease: "power2.out" }, 0.1)
          .to(el.querySelector(".jar"), { rotate: 70, duration: 0.6, ease: "power2.inOut" }, 0.7)
          .add(() => Deck.ctx.sfx("pour"), 1.0)
          .to(el.querySelector(".stream"), { height: 380, duration: 0.35, ease: "power1.in" }, 1.0)
          .to(cup, { y: 0, duration: 1.5, ease: "power1.inOut" }, 1.2)
          .to(el.querySelector(".stream"), { top: 710, height: 0, duration: 0.3 }, 2.6)
          .to(el.querySelector(".jar"), { rotate: 0, x: -700, duration: 0.6, ease: "power2.in" }, 2.7);
      },
      (el) => gsap.timeline()
        .add(() => Deck.ctx.sfx("tada"))
        .to(el.querySelector(".rays"), { opacity: 1, duration: 0.5 }, 0)
        .to(el.querySelector(".rays"), { rotate: 360, duration: 30, ease: "none", repeat: -1 }, 0)
        .to(el.querySelector(".cupbox"), { scale: 1.08, y: -20, duration: 0.4, yoyo: true, repeat: 1, ease: "power2.out" }, 0)
        .to(el.querySelector(".reveal"), { opacity: 1, duration: 0.01 }, 0.1)
        .from(el.querySelector(".who-name"), { y: 60, opacity: 0, duration: 0.5, ease: "back.out(2)" }, 0.1)
        .fromTo(el.querySelector(".oc"), { opacity: 0, rotateY: 90 }, { opacity: 1, rotateY: 0, duration: 0.6, ease: "back.out(1.6)" }, 0.35)
        .from(el.querySelectorAll(".oc .line"), { x: 40, opacity: 0, stagger: 0.08, duration: 0.3 }, 0.7)
        .add(() => window.confetti && confetti({ particleCount: 120, spread: 80, origin: { x: 0.37, y: 0.55 } }), 0.2),
      (el) => gsap.timeline()
        .add(() => Deck.ctx.sfx("swoosh"))
        .to(el.querySelector(".cupbox"), { x: 260, rotate: -8, duration: 0.25, ease: "power2.out" })
        .to(el.querySelector(".cupbox"), { x: 1900, rotate: 12, duration: 0.7, ease: "power3.in" }, 0.25)
        .to(el.querySelector(".rays"), { opacity: 0.3, duration: 0.6 }, 0.3)
        .fromTo(el.querySelector(".handoff"), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.5, ease: "back.out(2)" }, 0.9)
    ],
    // Re-render the cup and card if a newer order arrives while on this slide.
    onOrder: (el, o, ctx) => {
      const oc = el.querySelector(".oc"); if (oc) oc.innerHTML = Kit.orderCardHTML(o, ctx);
      const nm = el.querySelector(".who-name"); if (nm) nm.textContent = o.name || "Professor";
    }
  });
})();
