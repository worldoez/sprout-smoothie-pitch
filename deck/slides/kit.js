/* Slide kit: helpers + a reusable "content slide" so most slides are just data.
 *
 * Kit.content({ n, stage, title, kicker, points, visual, source, notes, budget, steps })
 *   visual: one of
 *     { figure: "04_fruit.png" }                          image from assets/figures
 *     { bars: [{label, value(0-1), hl?}], max? }           animated bar chart
 *     { stat: "70%", label: "would probably or definitely buy" }
 *     { html: "<div>…</div>", animate(el, tl) }             anything custom
 *   Click 1: title + visual animate in. Click 2: the text points appear.
 */
(function () {
  const pct = (x) => Math.round(x * 100) + "%";

  function splitLetters(text, cls = "ch") {
    return [...text].map(c => c === " " ? " " : `<span class="${cls}" style="display:inline-block">${c}</span>`).join("");
  }

  function barsHTML(rows, max) {
    const m = max || Math.max(...rows.map(r => r.value));
    return `<div class="bars">${rows.map(r => `
      <div class="bar ${r.hl ? "hl" : ""}" data-key="${r.key || ""}"><span class="lab">${r.label}</span>
        <span class="track"><span class="fill" data-w="${(r.value / m) * 100}"></span></span>
        <span class="val" data-v="${r.value}">${r.text || pct(r.value)}</span></div>`).join("")}</div>`;
  }
  function animateBars(el, tl, at = 0) {
    const fills = el.querySelectorAll(".bar .fill");
    tl.from(el.querySelectorAll(".bar"), { opacity: 0, x: -40, stagger: 0.06, duration: 0.3 }, at);
    fills.forEach((f, i) => tl.to(f, { width: f.dataset.w + "%", duration: 0.8, ease: "power3.out" }, at + 0.15 + i * 0.06));
    return tl;
  }

  function qrSVG(url, px = 360, dark = "#2A1A10") {
    if (!window.qrcode) return `<div style="width:${px}px;height:${px}px;display:grid;place-items:center;background:#fff;color:#2A1A10;font-size:22px;border-radius:20px">QR needs internet</div>`;
    const q = qrcode(0, "M"); q.addData(url); q.make();
    const n = q.getModuleCount(), c = px / (n + 4);
    let d = "";
    for (let r = 0; r < n; r++) for (let k = 0; k < n; k++) if (q.isDark(r, k)) d += `M${(k + 2) * c} ${(r + 2) * c}h${c}v${c}h-${c}z`;
    return `<svg class="qr" width="${px}" height="${px}" viewBox="0 0 ${px} ${px}"><rect width="${px}" height="${px}" rx="${px * 0.06}" fill="#FFFDF8"/><path d="${d}" fill="${dark}"/></svg>`;
  }
  // Absolute URL to a page in this site (works on GitHub Pages and localhost).
  const siteURL = (path) => new URL("../" + path, location.href).href;

  function orderCardHTML(o, ctx) {
    if (!o) return `<div class="who">Waiting for Order #1…</div>`;
    const f = (o.fruits || []).map(k => ctx.fruit(k)).filter(Boolean);
    const b = ctx.base(o.base), sz = ctx.size(o.size);
    const adds = (o.addons || []).map(k => ctx.addon(k)).filter(Boolean);
    const src = { github: "live from the order app", local: "saved in this browser", manual: "entered by hand", example: "example order (no live order yet)" }[o.source] || "";
    return `
      <div class="who">Order #1, ${o.name || "Guest"}</div>
      <h4>${o.drinkName || CONTENT.drinkName(o.fruits)}</h4>
      ${f.map(x => `<div class="line"><span>${x.emoji} ${x.name}<small>fruit</small></span><span class="ev">${pct(x.pct)} picked it</span></div>`).join("")}
      ${b ? `<div class="line"><span>${b.name}<small>base</small></span><span class="ev">${pct(b.pct)}</span></div>` : ""}
      ${adds.map(a => `<div class="line"><span>${a.fancy}<small>${a.name}</small></span><span class="ev">${pct(a.pct)}</span></div>`).join("")}
      ${sz ? `<div class="line"><span>${sz.name}, ${sz.ml} ml<small>size</small></span><span class="ev">HK$${o.price || sz.price}</span></div>` : ""}
      <div class="src">${src}</div>`;
  }

  function content(cfg) {
    const v = cfg.visual || {};
    let visual = "";
    if (v.figure) visual = `<div class="figure k-vis" style="width:820px;height:640px"><img src="../assets/figures/${v.figure}" alt="${cfg.title}"></div>`;
    else if (v.bars) visual = `<div class="k-vis" style="width:900px">${barsHTML(v.bars, v.max)}</div>`;
    else if (v.stat) visual = `<div class="k-vis" style="text-align:right"><div class="stat">${v.stat}</div><div class="s-sub" style="margin-left:auto">${v.label || ""}</div></div>`;
    else if (v.html) visual = `<div class="k-vis">${v.html}</div>`;

    Deck.add({
      n: cfg.n, stage: cfg.stage, title: cfg.title, budget: cfg.budget, notes: cfg.notes,
      usesOrder: cfg.usesOrder, onOrder: cfg.onOrder, music: cfg.music, musicVol: cfg.musicVol, ambient: cfg.ambient,
      html: () => `
        <div class="pad" style="display:grid;grid-template-columns:1fr auto;gap:70px;align-items:center">
          <div class="k-text">
            ${cfg.kicker ? `<div class="s-kicker k-kick">${cfg.kicker}</div>` : ""}
            <h2 class="s-title k-title" style="font-size:${cfg.titleSize || 96}px;margin:12px 0 44px">${cfg.title}</h2>
            <ul class="points k-points">${(cfg.points || []).map(p => `<li><span>${p}</span></li>`).join("")}</ul>
          </div>
          ${visual}
        </div>
        ${cfg.source ? `<div class="source">Source: ${cfg.source}</div>` : ""}
        ${cfg.extraHTML || ""}`,
      steps: [
        (el) => {
          const tl = gsap.timeline();
          tl.from(el.querySelectorAll(".k-kick, .k-title"), { y: 50, opacity: 0, stagger: 0.08, duration: 0.5, ease: "back.out(1.6)" });
          gsap.set(el.querySelectorAll(".k-points li"), { opacity: 0, x: -30 });
          const vis = el.querySelector(".k-vis");
          if (vis) {
            if (v.bars) animateBars(vis, tl, 0.2);
            else if (v.stat) tl.from(vis.querySelector(".stat"), { scale: 0.3, opacity: 0, duration: 0.6, ease: "back.out(2)" }, 0.2);
            else tl.from(vis, { y: 60, opacity: 0, rotate: 2, duration: 0.6, ease: "power3.out" }, 0.15);
            if (v.animate) v.animate(vis, tl);
          }
          if (cfg.onEnter) cfg.onEnter(el, tl);
          return tl;
        },
        ...(cfg.points && cfg.points.length ? [(el) => gsap.timeline().to(el.querySelectorAll(".k-points li"), { opacity: 1, x: 0, stagger: 0.12, duration: 0.35, ease: "power2.out" })] : []),
        ...(cfg.steps || [])
      ]
    });
  }

  window.Kit = { content, barsHTML, animateBars, splitLetters, qrSVG, siteURL, orderCardHTML, pct };
})();
