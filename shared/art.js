// Shared SVG art: mascot "Cue" (a monkey in a CUE tee; the CUE cup is held in .mo-hand-cup) + smoothie cup.
// Every animatable part has a class so GSAP can target it:
//   Cue: .mo-root .mo-shadow .mo-legs .mo-leg-l .mo-leg-r .mo-body .mo-tail .mo-leaf(head tuft) .mo-eyes .mo-pupils .mo-mouth .mo-mouth-sad .mo-arm-l .mo-arm-r .mo-hand-cup
//   Cup: .cup-root .cup-fill .cup-layer-a .cup-layer-b .cup-straw .cup-lid .cup-label
// Style: flat cartoon, bold ink outlines, flat fills, one highlight + one shadow shape per object (DESIGN.md).
// Keep these class names and the 220x280 viewBox if the art is ever swapped for an AI render.
(function () {
  let uid = 0;
  const INK = "#25292B";

  function mascot(opts = {}) {
    const id = "mo" + (++uid);
    const FUR = "#B07B50", FUR_D = "#8A5C3A", SKIN = "#F2D9C2";
    const cup = opts.cup ? `<g class="mo-hand-cup" transform="translate(204 108) rotate(10)">${cupInner({ id: id + "c", scale: 0.42, colorA: opts.colorA, colorB: opts.colorB })}</g>` : "";
    const limb = (d, w) => `<path d="${d}" stroke="${INK}" stroke-width="${w + 8}" stroke-linecap="round" fill="none"/><path d="${d}" stroke="${FUR}" stroke-width="${w}" stroke-linecap="round" fill="none"/>`;
    const paw = (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="14" fill="${FUR}" stroke="${INK}" stroke-width="5"/><circle cx="${cx}" cy="${cy + 1}" r="6" fill="${SKIN}"/>`;
    const foot = (cx, flip) => `<ellipse cx="${cx}" cy="252" rx="21" ry="11" fill="${FUR}" stroke="${INK}" stroke-width="5"/><ellipse cx="${cx + 6 * flip}" cy="254" rx="9" ry="5" fill="${SKIN}"/>`;
    const ear = cx => `<circle cx="${cx}" cy="116" r="25" fill="${FUR}" stroke="${INK}" stroke-width="5.5"/><circle cx="${cx + (cx < 110 ? 3 : -3)}" cy="117" r="14" fill="${SKIN}"/>`;
    // Heart-shaped face mask: two brow bumps + lower face, stroked first then filled so the outline is one shape.
    const face = [[86, 122, 25, 24], [134, 122, 25, 24], [110, 146, 50, 34]];
    const faceStroke = face.map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${SKIN}" stroke="${INK}" stroke-width="5"/>`).join("");
    const faceFill = face.map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx - 1}" ry="${ry - 1}" fill="${SKIN}"/>`).join("");
    return `
<svg class="mo-root" viewBox="0 0 220 280" xmlns="http://www.w3.org/2000/svg" overflow="visible" aria-label="Cue the monkey mascot">
  <ellipse class="mo-shadow" cx="110" cy="270" rx="62" ry="8" fill="${INK}" opacity=".18"/>
  <g class="mo-legs">
    <g class="mo-leg-l" style="transform-origin:88px 218px">${limb("M90 224 L88 248", 18)}${foot(84, 1)}</g>
    <g class="mo-leg-r" style="transform-origin:132px 218px">${limb("M130 224 L132 248", 18)}${foot(136, -1)}</g>
  </g>
  <g class="mo-arm-l" style="transform-origin:62px 190px">${limb("M66 196 Q44 204 42 226", 15)}${paw(42, 232)}</g>
  <g class="mo-body" style="transform-origin:110px 150px">
    ${limb("M144 232 C190 258 216 232 208 204 C205 194 192 196 196 206", 11)}
    <ellipse cx="110" cy="208" rx="46" ry="36" fill="${FUR}" stroke="${INK}" stroke-width="5.5"/>
    <ellipse cx="110" cy="212" rx="29" ry="23" fill="${SKIN}"/>
    <path d="M90 206 Q100 199 110 206 T130 206" stroke="${INK}" stroke-width="4.5" stroke-linecap="round" fill="none"/>
    <path d="M90 220 Q100 213 110 220 T130 220" stroke="${INK}" stroke-width="4.5" stroke-linecap="round" fill="none"/>
    ${ear(38)}${ear(182)}
    <ellipse cx="110" cy="122" rx="72" ry="60" fill="${FUR}" stroke="${INK}" stroke-width="5.5"/>
    <path d="M150 70 C184 92 190 140 160 174 C176 140 172 96 150 70 Z" fill="${FUR_D}" opacity=".5"/>
    <path d="M62 84 Q78 68 100 66" stroke="#D9A97E" stroke-width="7" stroke-linecap="round" fill="none" opacity=".8"/>
    ${faceStroke}${faceFill}
    <g class="mo-leaf" style="transform-origin:110px 66px">
      <path d="M108 66 C100 44 124 36 128 50 C130 58 120 60 118 54" stroke="${INK}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <path d="M108 66 C100 44 124 36 128 50 C130 58 120 60 118 54" stroke="${FUR}" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </g>
    <ellipse cx="62" cy="150" rx="9" ry="6" fill="#E8A597" opacity=".75"/><ellipse cx="158" cy="150" rx="9" ry="6" fill="#E8A597" opacity=".75"/>
    <g class="mo-eyes" style="transform-origin:110px 132px">
      <g class="mo-pupils">
        <ellipse cx="87" cy="126" rx="10" ry="12.5" fill="${INK}"/><ellipse cx="133" cy="126" rx="10" ry="12.5" fill="${INK}"/>
        <circle cx="91" cy="121" r="4" fill="#FFF"/><circle cx="137" cy="121" r="4" fill="#FFF"/>
        <circle cx="84" cy="131" r="1.8" fill="#FFF"/><circle cx="130" cy="131" r="1.8" fill="#FFF"/>
      </g>
    </g>
    <ellipse cx="104" cy="144" rx="2.6" ry="3.2" fill="${INK}"/><ellipse cx="116" cy="144" rx="2.6" ry="3.2" fill="${INK}"/>
    <g class="mo-mouth">
      <path d="M94 154 Q110 176 126 154 Q110 160 94 154 Z" fill="#5E2431" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>
      <path d="M102 164 Q110 160 118 164 Q114 171 110 171 Q106 171 102 164 Z" fill="#E8A597"/>
    </g>
    <path class="mo-mouth-sad" d="M98 168 Q110 156 122 168" stroke="${INK}" stroke-width="5" stroke-linecap="round" fill="none" opacity="0"/>
  </g>
  ${cup}
  <g class="mo-arm-r" style="transform-origin:158px 190px">${limb("M154 196 Q192 198 190 160", 15)}${paw(190, 150)}</g>
</svg>`;
  }

  // Cup drawn in a 120x200 box; fill clipped to the cup body (clip + geometry unchanged so pour animations keep working).
  function cupInner(o = {}) {
    const id = o.id || "cup" + (++uid);
    const a = o.colorA || "#FFB020", b = o.colorB || "#E8364F", s = o.scale || 1;
    	const labelText = o.label ?? "CUE";
	const label = `<g class="cup-label"><rect x="19" y="104" width="82" height="34" rx="9" fill="#FFF4E2" stroke="${INK}" stroke-width="3"/><text x="60" y="126" text-anchor="middle" font-family="Fraunces, serif" font-weight="900" font-size="${labelText.length > 6 ? 13 : 16}" textLength="${labelText.length > 6 ? 70 : 0}" lengthAdjust="spacingAndGlyphs" fill="${INK}">${labelText}</text></g>`;
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
      <g class="cup-straw"><path d="M72 40 L86 -6 L102 -6" stroke="${INK}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M72 40 L86 -6 L102 -6" stroke="#FFF4E2" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M72 40 L86 -6" stroke="${INK}" stroke-width="8" stroke-dasharray="5 8" fill="none"/></g>
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

  window.CueArt = { mascot, cup, cupInner, blink };
})();
