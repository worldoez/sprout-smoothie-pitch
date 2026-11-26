// Shared SVG art (PLACEHOLDER mascot "Mo" + smoothie cup).
// Every animatable part has a class so GSAP can target it:
//   Mo:  .mo-root .mo-legs .mo-leg-l .mo-leg-r .mo-body .mo-leaf .mo-eyes .mo-pupils .mo-mouth .mo-mouth-sad .mo-arm-l .mo-arm-r .mo-hand-cup
//   Cup: .cup-root .cup-fill .cup-layer-a .cup-layer-b .cup-straw .cup-lid .cup-label
// To swap in a new mascot later: keep these class names on the new SVG groups.
(function () {
  let uid = 0;

  function mascot(opts = {}) {
    const id = "mo" + (++uid);
    const cup = opts.cup ? `<g class="mo-hand-cup" transform="translate(150 118) rotate(8)">${cupInner({ id: id + "c", scale: 0.42, colorA: opts.colorA, colorB: opts.colorB })}</g>` : "";
    return `
<svg class="mo-root" viewBox="0 0 220 280" xmlns="http://www.w3.org/2000/svg" overflow="visible" aria-label="Mo the mango mascot">
  <defs>
    <radialGradient id="${id}g" cx="35%" cy="30%" r="80%">
      <stop offset="0" stop-color="#FFE27A"/><stop offset=".45" stop-color="#FFB020"/><stop offset=".85" stop-color="#FF7A1F"/><stop offset="1" stop-color="#E8502A"/>
    </radialGradient>
    <radialGradient id="${id}b" cx="80%" cy="75%" r="45%"><stop offset="0" stop-color="#E8364F" stop-opacity=".55"/><stop offset="1" stop-color="#E8364F" stop-opacity="0"/></radialGradient>
  </defs>
  <ellipse class="mo-shadow" cx="110" cy="268" rx="62" ry="9" fill="#2A1A10" opacity=".15"/>
  <g class="mo-legs" stroke="#2A1A10" stroke-width="9" stroke-linecap="round" fill="none">
    <g class="mo-leg-l" style="transform-origin:88px 218px"><path d="M88 218 L84 252"/><ellipse cx="78" cy="256" rx="14" ry="7" fill="#B0244A" stroke="none"/></g>
    <g class="mo-leg-r" style="transform-origin:132px 218px"><path d="M132 218 L136 252"/><ellipse cx="142" cy="256" rx="14" ry="7" fill="#B0244A" stroke="none"/></g>
  </g>
  <g class="mo-arm-l" style="transform-origin:52px 150px"><path d="M52 150 Q22 160 20 190" stroke="#2A1A10" stroke-width="9" stroke-linecap="round" fill="none"/><circle cx="20" cy="192" r="9" fill="#FFF4E2" stroke="#2A1A10" stroke-width="4"/></g>
  <g class="mo-body" style="transform-origin:110px 150px">
    <path d="M110 58 C168 52 196 104 186 156 C176 210 138 232 104 228 C62 224 32 196 34 146 C36 96 66 62 110 58 Z" fill="url(#${id}g)" stroke="#2A1A10" stroke-width="5"/>
    <path d="M110 58 C168 52 196 104 186 156 C176 210 138 232 104 228 C62 224 32 196 34 146 C36 96 66 62 110 58 Z" fill="url(#${id}b)"/>
    <ellipse cx="72" cy="98" rx="16" ry="9" fill="#FFF" opacity=".55" transform="rotate(-30 72 98)"/>
    <g class="mo-leaf" style="transform-origin:112px 60px">
      <path d="M112 60 Q110 44 116 34" stroke="#5B3A22" stroke-width="5" stroke-linecap="round" fill="none"/>
      <path d="M116 38 C130 18 160 20 168 30 C154 44 130 48 116 38 Z" fill="#2FA84F" stroke="#1E7A38" stroke-width="3"/>
      <path d="M118 38 C136 32 150 30 164 30" stroke="#1E7A38" stroke-width="2" fill="none"/>
    </g>
    <g class="mo-eyes" style="transform-origin:110px 132px">
      <ellipse cx="88" cy="132" rx="15" ry="18" fill="#FFF" stroke="#2A1A10" stroke-width="4"/>
      <ellipse cx="132" cy="132" rx="15" ry="18" fill="#FFF" stroke="#2A1A10" stroke-width="4"/>
      <g class="mo-pupils"><circle cx="91" cy="135" r="8" fill="#2A1A10"/><circle cx="135" cy="135" r="8" fill="#2A1A10"/>
      <circle cx="94" cy="131" r="3" fill="#FFF"/><circle cx="138" cy="131" r="3" fill="#FFF"/></g>
    </g>
    <ellipse cx="70" cy="166" rx="11" ry="7" fill="#E8364F" opacity=".45"/><ellipse cx="152" cy="166" rx="11" ry="7" fill="#E8364F" opacity=".45"/>
    <path class="mo-mouth" d="M94 168 Q110 186 126 168" stroke="#2A1A10" stroke-width="5" stroke-linecap="round" fill="#B0244A"/>
    <path class="mo-mouth-sad" d="M96 180 Q110 166 124 180" stroke="#2A1A10" stroke-width="5" stroke-linecap="round" fill="none" opacity="0"/>
  </g>
  <g class="mo-arm-r" style="transform-origin:180px 150px"><path d="M180 150 Q204 140 206 124" stroke="#2A1A10" stroke-width="9" stroke-linecap="round" fill="none"/><circle cx="206" cy="122" r="9" fill="#FFF4E2" stroke="#2A1A10" stroke-width="4"/></g>
  ${cup}
</svg>`;
  }

  // Cup drawn in a 120x200 box; fill clipped to the cup body.
  function cupInner(o = {}) {
    const id = o.id || "cup" + (++uid);
    const a = o.colorA || "#FFB020", b = o.colorB || "#E8364F", s = o.scale || 1;
    const label = o.label ? `<g class="cup-label"><rect x="22" y="104" width="76" height="34" rx="8" fill="#FFF4E2" stroke="#2A1A10" stroke-width="3"/><text x="60" y="126" text-anchor="middle" font-family="Fraunces, serif" font-weight="900" font-size="16" fill="#2A1A10">${o.label}</text></g>` : "";
    return `<g class="cup-root" transform="scale(${s}) translate(-60 -100)">
      <defs><clipPath id="${id}clip"><path d="M18 52 L102 52 L92 190 Q60 198 28 190 Z"/></clipPath></defs>
      <path class="cup-straw" d="M70 60 L84 -6 L100 -6" stroke="#2FA84F" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <g clip-path="url(#${id}clip)">
        <rect x="0" y="52" width="120" height="150" fill="#FFF" opacity=".35"/>
        <g class="cup-fill">
          <path class="cup-layer-b" d="M0 120 Q30 110 60 120 T120 120 L120 210 L0 210 Z" fill="${b}"/>
          <path class="cup-layer-a" d="M0 70 Q30 60 60 70 T120 70 L120 125 Q90 115 60 125 T0 125 Z" fill="${a}"/>
        </g>
      </g>
      <path d="M18 52 L102 52 L92 190 Q60 198 28 190 Z" fill="none" stroke="#2A1A10" stroke-width="5" stroke-linejoin="round"/>
      <path d="M28 62 L36 180" stroke="#FFF" stroke-width="5" stroke-linecap="round" opacity=".6"/>
      <g class="cup-lid"><path d="M12 52 Q60 14 108 52 Z" fill="#FFF" fill-opacity=".55" stroke="#2A1A10" stroke-width="5" stroke-linejoin="round"/><rect x="8" y="48" width="104" height="10" rx="5" fill="#FFF4E2" stroke="#2A1A10" stroke-width="4"/></g>
      ${label}
    </g>`;
  }

  function cup(o = {}) {
    return `<svg class="cup-svg" viewBox="-70 -120 140 230" xmlns="http://www.w3.org/2000/svg" overflow="visible">${cupInner(o)}</svg>`;
  }

  window.SproutArt = { mascot, cup, cupInner };
})();
