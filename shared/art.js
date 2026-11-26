// Shared SVG art: mascot "Mo" (a mango) + smoothie cup.
// Every animatable part has a class so GSAP can target it:
//   Mo:  .mo-root .mo-shadow .mo-legs .mo-leg-l .mo-leg-r .mo-body .mo-leaf .mo-eyes .mo-pupils .mo-mouth .mo-mouth-sad .mo-arm-l .mo-arm-r .mo-hand-cup
//   Cup: .cup-root .cup-fill .cup-layer-a .cup-layer-b .cup-straw .cup-lid .cup-label
// Style: flat cartoon, bold ink outlines, flat fills, one highlight + one shadow shape per object (DESIGN.md).
// Keep these class names and the 220x280 viewBox if the art is ever swapped for an AI render.
(function () {
  let uid = 0;
  const INK = "#2A1A10";

  function mascot(opts = {}) {
    const id = "mo" + (++uid);
    const cup = opts.cup ? `<g class="mo-hand-cup" transform="translate(204 108) rotate(10)">${cupInner({ id: id + "c", scale: 0.42, colorA: opts.colorA, colorB: opts.colorB })}</g>` : "";
    const body = "M104 58 C152 50 194 88 190 146 C186 202 150 236 106 234 C60 232 28 200 30 148 C32 98 60 62 104 58 Z";
    const mitten = (cx, cy, flip) => `
        <path d="M${cx - 11 * flip} ${cy + 2} C${cx - 11 * flip} ${cy - 10} ${cx - 3 * flip} ${cy - 14} ${cx + 5 * flip} ${cy - 13} C${cx + 13 * flip} ${cy - 12} ${cx + 15 * flip} ${cy - 2} ${cx + 12 * flip} ${cy + 6} C${cx + 8 * flip} ${cy + 15} ${cx - 8 * flip} ${cy + 14} ${cx - 11 * flip} ${cy + 2} Z" fill="#FFF4E2" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
        <path d="M${cx + 1 * flip} ${cy - 12} C${cx - 6 * flip} ${cy - 10} ${cx - 7 * flip} ${cy - 3} ${cx - 3 * flip} ${cy + 1}" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`;
    const shoe = (cx, flip) => `
        <path d="M${cx - 17 * flip} 262 C${cx - 21 * flip} 262 ${cx - 21 * flip} 250 ${cx - 12 * flip} 247 L${cx + 2 * flip} 244 C${cx + 14 * flip} 243 ${cx + 22 * flip} 250 ${cx + 22 * flip} 258 C${cx + 22 * flip} 262 ${cx + 20 * flip} 262 ${cx + 18 * flip} 262 Z" fill="#FFF4E2" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>
        <path d="M${cx - 18 * flip} 258 L${cx + 21 * flip} 258 L${cx + 21 * flip} 262 L${cx - 18 * flip} 262 Z" fill="#B0244A" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
        <path d="M${cx - 2 * flip} 249 L${cx + 6 * flip} 253 M${cx + 3 * flip} 247 L${cx + 11 * flip} 251" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`;
    return `
<svg class="mo-root" viewBox="0 0 220 280" xmlns="http://www.w3.org/2000/svg" overflow="visible" aria-label="Mo the mango mascot">
  <defs><clipPath id="${id}clip"><path d="${body}"/></clipPath></defs>
  <ellipse class="mo-shadow" cx="110" cy="268" rx="66" ry="9" fill="${INK}" opacity=".16"/>
  <g class="mo-legs">
    <g class="mo-leg-l" style="transform-origin:88px 218px"><path d="M88 214 L86 246" stroke="${INK}" stroke-width="8" stroke-linecap="round" fill="none"/>${shoe(82, 1)}</g>
    <g class="mo-leg-r" style="transform-origin:132px 218px"><path d="M132 214 L134 246" stroke="${INK}" stroke-width="8" stroke-linecap="round" fill="none"/>${shoe(138, -1)}</g>
  </g>
  <g class="mo-arm-l" style="transform-origin:52px 150px"><path d="M54 152 Q28 160 24 186" stroke="${INK}" stroke-width="8" stroke-linecap="round" fill="none"/>${mitten(23, 192, 1)}</g>
  <g class="mo-body" style="transform-origin:110px 150px">
    <path d="${body}" fill="#FFA21F"/>
    <g clip-path="url(#${id}clip)">
      <path d="M190 120 C196 190 150 244 96 236 C132 222 166 190 168 138 C169 126 180 116 190 120 Z" fill="#F4691F"/>
      <path d="M52 92 C58 76 72 66 88 64 C80 74 70 84 66 98 C62 110 58 112 54 108 C50 102 50 98 52 92 Z" fill="#FFD36B"/>
    </g>
    <path d="${body}" fill="none" stroke="${INK}" stroke-width="5.5" stroke-linejoin="round"/>
    <g class="mo-leaf" style="transform-origin:112px 60px">
      <path d="M106 62 Q102 46 112 36" stroke="${INK}" stroke-width="10" stroke-linecap="round" fill="none"/>
      <path d="M106 62 Q102 46 112 36" stroke="#8B5A2B" stroke-width="4.5" stroke-linecap="round" fill="none"/>
      <path d="M104 52 C86 52 78 40 86 31 C93 25 100 32 96 37" stroke="${INK}" stroke-width="7" stroke-linecap="round" fill="none"/>
      <path d="M104 52 C86 52 78 40 86 31 C93 25 100 32 96 37" stroke="#4CC46A" stroke-width="3" stroke-linecap="round" fill="none"/>
      <path d="M112 40 C120 12 158 8 172 22 C164 46 134 54 112 40 Z" fill="#2FA84F" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>
      <path d="M124 26 C136 20 150 20 160 24 C152 28 138 30 126 32 Z" fill="#6FD98A"/>
      <path d="M114 40 C132 34 150 30 168 24" stroke="${INK}" stroke-width="2.5" stroke-linecap="round" fill="none" opacity=".55"/>
    </g>
    <ellipse cx="68" cy="164" rx="13" ry="8" fill="#FF5C7A" opacity=".65"/><ellipse cx="152" cy="164" rx="13" ry="8" fill="#FF5C7A" opacity=".65"/>
    <g class="mo-eyes" style="transform-origin:110px 132px">
      <ellipse cx="86" cy="131" rx="18" ry="22" fill="#FFF" stroke="${INK}" stroke-width="4.5"/>
      <ellipse cx="134" cy="131" rx="18" ry="22" fill="#FFF" stroke="${INK}" stroke-width="4.5"/>
      <g class="mo-pupils">
        <ellipse cx="89" cy="135" rx="12" ry="14" fill="${INK}"/><ellipse cx="131" cy="135" rx="12" ry="14" fill="${INK}"/>
        <circle cx="94" cy="128" r="5" fill="#FFF"/><circle cx="136" cy="128" r="5" fill="#FFF"/>
        <circle cx="85" cy="141" r="2.5" fill="#FFF"/><circle cx="127" cy="141" r="2.5" fill="#FFF"/>
      </g>
    </g>
    <g class="mo-mouth">
      <path d="M92 164 Q110 196 128 164 Q110 170 92 164 Z" fill="#7A1430" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>
      <path d="M99 178 Q110 172 121 178 Q116 188 110 188 Q104 188 99 178 Z" fill="#FF7A8F"/>
    </g>
    <path class="mo-mouth-sad" d="M96 182 Q110 166 124 182" stroke="${INK}" stroke-width="5" stroke-linecap="round" fill="none" opacity="0"/>
  </g>
  ${cup}
  <g class="mo-arm-r" style="transform-origin:180px 150px"><path d="M178 152 Q198 148 190 130" stroke="${INK}" stroke-width="8" stroke-linecap="round" fill="none"/>${mitten(189, 124, -1)}</g>
</svg>`;
  }

  // Cup drawn in a 120x200 box; fill clipped to the cup body (clip + geometry unchanged so pour animations keep working).
  function cupInner(o = {}) {
    const id = o.id || "cup" + (++uid);
    const a = o.colorA || "#FFB020", b = o.colorB || "#E8364F", s = o.scale || 1;
    const label = o.label ? `<g class="cup-label"><rect x="19" y="104" width="82" height="34" rx="9" fill="#FFF4E2" stroke="${INK}" stroke-width="3"/><text x="60" y="126" text-anchor="middle" font-family="Fraunces, serif" font-weight="900" font-size="${o.label.length > 6 ? 13 : 16}" textLength="${o.label.length > 6 ? 70 : 0}" lengthAdjust="spacingAndGlyphs" fill="${INK}">${o.label}</text></g>` : "";
    const chunk = (x, y, r, fill, rot) => `<rect x="${x - r}" y="${y - r}" width="${r * 2}" height="${r * 2}" rx="${r * 0.35}" fill="${fill}" stroke="${INK}" stroke-width="2.5" transform="rotate(${rot} ${x} ${y})"/>`;
    return `<g class="cup-root" transform="scale(${s}) translate(-60 -100)">
      <defs><clipPath id="${id}clip"><path d="M18 52 L102 52 L92 190 Q60 198 28 190 Z"/></clipPath></defs>
      <g clip-path="url(#${id}clip)">
        <rect x="0" y="52" width="120" height="150" fill="#FFF" opacity=".4"/>
        <path d="M66 50 L78 140" stroke="${INK}" stroke-width="10" stroke-linecap="round" opacity=".25"/>
        <g class="cup-fill">
          <path class="cup-layer-b" d="M0 120 Q30 110 60 120 T120 120 L120 210 L0 210 Z" fill="${b}"/>
          <path class="cup-layer-a" d="M0 70 Q30 60 60 70 T120 70 L120 125 Q90 115 60 125 T0 125 Z" fill="${a}"/>
          ${chunk(42, 98, 8, "#FFC83A", -18)}${chunk(80, 90, 7, "#FFC83A", 24)}
          <circle cx="62" cy="108" r="7" fill="#E8364F" stroke="${INK}" stroke-width="2.5"/>
          ${chunk(36, 150, 8, "#FFC83A", 14)}<circle cx="72" cy="146" r="8" fill="#B0244A" stroke="${INK}" stroke-width="2.5"/>${chunk(56, 172, 7, "#FFC83A", -26)}<circle cx="84" cy="172" r="6" fill="#E8364F" stroke="${INK}" stroke-width="2.5"/>
          <circle cx="50" cy="132" r="3" fill="#FFF" opacity=".6"/><circle cx="88" cy="128" r="2.5" fill="#FFF" opacity=".6"/><circle cx="30" cy="112" r="2.5" fill="#FFF" opacity=".6"/>
        </g>
      </g>
      <path d="M18 52 L102 52 L92 190 Q60 198 28 190 Z" fill="none" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M29 66 L36 178" stroke="#FFF" stroke-width="6" stroke-linecap="round" opacity=".65"/>
      <ellipse cx="90" cy="84" rx="2.6" ry="3.6" fill="#FFF" opacity=".75"/><ellipse cx="86" cy="104" rx="2.2" ry="3.2" fill="#FFF" opacity=".7"/><ellipse cx="92" cy="128" rx="2.4" ry="3.4" fill="#FFF" opacity=".7"/>
      <g class="cup-lid"><path d="M14 54 Q14 18 60 16 Q106 18 106 54 Z" fill="#FFF" fill-opacity=".6" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><path d="M28 44 Q32 28 52 24" stroke="#FFF" stroke-width="5" stroke-linecap="round" fill="none" opacity=".85"/><rect x="8" y="48" width="104" height="11" rx="5.5" fill="#FFF4E2" stroke="${INK}" stroke-width="4"/></g>
      <g class="cup-straw"><path d="M72 40 L86 -6 L102 -6" stroke="${INK}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M72 40 L86 -6 L102 -6" stroke="#2FA84F" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M77 24 L81 12" stroke="#FFF" stroke-width="3" stroke-linecap="round" opacity=".7"/></g>
      ${label}
    </g>`;
  }

  function cup(o = {}) {
    return `<svg class="cup-svg" viewBox="-70 -120 140 230" xmlns="http://www.w3.org/2000/svg" overflow="visible">${cupInner(o)}</svg>`;
  }

  // Optional: blink Mo's eyes. Returns a gsap timeline (one blink; pass {double:true} or {loop:true}).
  function blink(root, o = {}) {
    const eyes = root && root.querySelectorAll ? root.querySelectorAll(".mo-eyes") : [];
    const tl = gsap.timeline(o.loop ? { repeat: -1, repeatDelay: o.every || 2.8 } : {});
    tl.to(eyes, { scaleY: 0.08, duration: 0.07, ease: "power2.in", svgOrigin: "110 132", yoyo: true, repeat: o.double ? 3 : 1 });
    return tl;
  }

  window.SproutArt = { mascot, cup, cupInner, blink };
})();
