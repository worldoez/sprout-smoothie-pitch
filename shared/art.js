// Shared SVG art: mascot "Cuethie" (a vintage rubber-hose monkey with bowler hat (.mo-leaf = the hat) and neckerchief; the CUE cup is held in .mo-hand-cup) + smoothie cup.
// Every animatable part has a class so GSAP can target it:
//   Cuethie: .mo-root .mo-shadow .mo-legs .mo-leg-l .mo-leg-r .mo-body .mo-tail .mo-leaf(hat) .mo-eyes .mo-pupils .mo-mouth .mo-mouth-sad .mo-arm-l .mo-arm-r .mo-hand-cup
//   Cup: .cup-root .cup-fill .cup-layer-a .cup-layer-b .cup-straw .cup-lid .cup-label
// Style: flat cartoon, bold ink outlines, flat fills, one highlight + one shadow shape per object (DESIGN.md).
// Keep these class names and the 220x280 viewBox if the art is ever swapped for an AI render.
(function () {
  let uid = 0;
  const INK = "#25292B";

  function mascot(opts = {}) {
    // Vintage "rubber hose" monkey: chocolate fur, tan face, cream gloves, bowler hat and neckerchief.
    const id = "mo" + (++uid);
    const FUR = "#6E4529", FUR_L = "#94603A", TAN = "#EBCDA4", TAN_D = "#DDB584", GLOVE = "#F7ECD6", LN = "#2B1D14";
    const cup = opts.cup ? `<g class="mo-hand-cup" transform="translate(204 108) rotate(10)">${cupInner({ id: id + "c", scale: 0.42, colorA: opts.colorA, colorB: opts.colorB })}</g>` : "";
    const hose = (d, w) => `<path d="${d}" stroke="${LN}" stroke-width="${w + 7}" stroke-linecap="round" fill="none"/><path d="${d}" stroke="${FUR}" stroke-width="${w}" stroke-linecap="round" fill="none"/>`;
    const glove = (cx, cy, rot) => `<g transform="rotate(${rot} ${cx} ${cy})">
        <rect x="${cx - 9}" y="${cy + 6}" width="18" height="9" rx="4" fill="${GLOVE}" stroke="${LN}" stroke-width="3.5"/>
        <path d="M${cx - 13} ${cy} C${cx - 13} ${cy - 11} ${cx - 5} ${cy - 15} ${cx + 1} ${cy - 15} C${cx + 9} ${cy - 15} ${cx + 14} ${cy - 8} ${cx + 13} ${cy} C${cx + 12} ${cy + 9} ${cx + 5} ${cy + 12} ${cx} ${cy + 12} C${cx - 7} ${cy + 12} ${cx - 13} ${cy + 8} ${cx - 13} ${cy} Z" fill="${GLOVE}" stroke="${LN}" stroke-width="3.5" stroke-linejoin="round"/>
        <path d="M${cx - 5} ${cy - 13} Q${cx - 6} ${cy - 5} ${cx - 3} ${cy} M${cx + 4} ${cy - 14} Q${cx + 5} ${cy - 5} ${cx + 3} ${cy}" stroke="${LN}" stroke-width="2.4" stroke-linecap="round" fill="none"/></g>`;
    const foot = (cx, flip) => `<path d="M${cx - 18 * flip} 262 C${cx - 24 * flip} 250 ${cx - 8 * flip} 244 ${cx + 6 * flip} 247 C${cx + 22 * flip} 250 ${cx + 24 * flip} 262 ${cx + 14 * flip} 263 Z" fill="${TAN}" stroke="${LN}" stroke-width="3.8" stroke-linejoin="round"/><path d="M${cx + 8 * flip} 262 L${cx + 8 * flip} 255 M${cx + 15 * flip} 261 L${cx + 14 * flip} 254" stroke="${LN}" stroke-width="2.6" stroke-linecap="round"/>`;
    const ear = (cx, s) => `<circle cx="${cx}" cy="98" r="23" fill="${FUR}" stroke="${LN}" stroke-width="4"/><circle cx="${cx - 2 * s}" cy="99" r="15" fill="${TAN}" stroke="${LN}" stroke-width="2.6"/><path d="M${cx - 6 * s} 94 Q${cx + 4 * s} 90 ${cx + 3 * s} 101 Q${cx} 108 ${cx - 5 * s} 104" stroke="${TAN_D}" stroke-width="3" stroke-linecap="round" fill="none"/>`;
    const face = [[88, 92, 25, 22], [132, 92, 25, 22], [110, 116, 47, 34]];
    const faceStroke = face.map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${TAN}" stroke="${LN}" stroke-width="3.6"/>`).join("");
    const faceFill = face.map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx - 1}" ry="${ry - 1}" fill="${TAN}"/>`).join("");
    const freckles = (cx, s = 1) => [[-6, 0], [2, -3], [5, 4], [-1, 6], [-9, 6]].map(([x, y]) => `<circle cx="${cx + x * s}" cy="${123 + y}" r="1.4" fill="#A8683F"/>`).join("");
    return `
<svg class="mo-root" viewBox="0 0 220 280" xmlns="http://www.w3.org/2000/svg" overflow="visible" aria-label="Cuethie the monkey mascot">
  <ellipse class="mo-shadow" cx="110" cy="270" rx="64" ry="8" fill="${LN}" opacity=".16"/>
  <g class="mo-legs">
    <g class="mo-leg-l" style="transform-origin:96px 222px">${hose("M98 226 Q92 238 88 250", 12)}${foot(84, 1)}</g>
    <g class="mo-leg-r" style="transform-origin:124px 222px">${hose("M122 226 Q128 238 132 250", 12)}${foot(136, -1)}</g>
  </g>
  <g class="mo-arm-l" style="transform-origin:78px 168px">${hose("M80 170 Q50 178 46 208", 11)}${glove(46, 214, 8)}</g>
  <g class="mo-body" style="transform-origin:110px 150px">
    ${hose("M138 226 C188 252 218 222 206 194 C199 180 180 188 188 200", 9)}
    <ellipse cx="110" cy="190" rx="37" ry="44" fill="${FUR}" stroke="${LN}" stroke-width="4"/>
    <ellipse cx="110" cy="198" rx="23" ry="31" fill="${TAN}"/>
    ${ear(48, 1)}${ear(172, -1)}
    <ellipse cx="110" cy="98" rx="62" ry="58" fill="${FUR}" stroke="${LN}" stroke-width="4"/>
    <path d="M64 62 Q82 46 104 46" stroke="${FUR_L}" stroke-width="7" stroke-linecap="round" fill="none" opacity=".9"/>
    ${faceStroke}${faceFill}
    <path d="M86 150 L110 158 L134 150 L122 176 L110 164 L98 176 Z" fill="${GLOVE}" stroke="${LN}" stroke-width="3.6" stroke-linejoin="round"/>
    <path d="M100 152 Q110 160 120 152" stroke="${LN}" stroke-width="3" fill="none"/>
    <circle cx="110" cy="158" r="6.5" fill="${GLOVE}" stroke="${LN}" stroke-width="3.2"/>
    <ellipse cx="78" cy="120" rx="13" ry="9" fill="#D98A6A" opacity=".55"/><ellipse cx="142" cy="120" rx="13" ry="9" fill="#D98A6A" opacity=".55"/>
    ${freckles(78)}${freckles(142, -1)}
    <g class="mo-eyes" style="transform-origin:110px 100px">
      <ellipse cx="92" cy="96" rx="13" ry="17" fill="#FFF" stroke="${LN}" stroke-width="3.4"/>
      <ellipse cx="128" cy="96" rx="13" ry="17" fill="#FFF" stroke="${LN}" stroke-width="3.4"/>
      <g class="mo-pupils">
        <ellipse cx="96" cy="99" rx="8" ry="11.5" fill="${LN}"/><ellipse cx="132" cy="99" rx="8" ry="11.5" fill="${LN}"/>
        <circle cx="99" cy="93" r="3.4" fill="#FFF"/><circle cx="135" cy="93" r="3.4" fill="#FFF"/>
      </g>
    </g>
    <path d="M80 72 Q88 66 98 70 M122 70 Q132 66 140 72" stroke="${LN}" stroke-width="3" stroke-linecap="round" fill="none"/>
    <path d="M103 112 Q110 108 117 112 Q117 119 110 121 Q103 119 103 112 Z" fill="#C98E6A" stroke="${LN}" stroke-width="2.6" stroke-linejoin="round"/>
    <g class="mo-mouth">
      <path d="M90 126 Q110 150 130 126 Q110 134 90 126 Z" fill="#6B1F2E" stroke="${LN}" stroke-width="3.8" stroke-linejoin="round"/>
      <path d="M100 135 Q110 130 120 135 Q116 143 110 143 Q104 143 100 135 Z" fill="#F08A8F"/>
    </g>
    <path class="mo-mouth-sad" d="M96 138 Q110 126 124 138" stroke="${LN}" stroke-width="4" stroke-linecap="round" fill="none" opacity="0"/>
    <g class="mo-leaf" style="transform-origin:110px 62px">
      <path d="M62 52 Q110 66 158 52 Q160 62 150 62 Q110 74 70 62 Q60 62 62 52 Z" fill="${LN}" stroke="${LN}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M72 54 C70 22 90 12 110 12 C130 12 150 22 148 54 Q110 66 72 54 Z" fill="#33363A" stroke="${LN}" stroke-width="3.6" stroke-linejoin="round"/>
      <path d="M72 48 Q110 60 148 48 L148 40 Q110 52 72 40 Z" fill="${GLOVE}" stroke="${LN}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M84 26 Q92 17 104 16" stroke="#6A6E72" stroke-width="4" stroke-linecap="round" fill="none"/>
    </g>
  </g>
  ${cup}
  <g class="mo-arm-r" style="transform-origin:142px 168px">${hose("M140 170 Q192 178 190 158", 11)}${glove(190, 146, -4)}</g>
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
    tl.to(eyes, { scaleY: 0.08, duration: 0.07, ease: "power2.in", svgOrigin: "110 100", yoyo: true, repeat: o.double ? 3 : 1 });
    return tl;
  }

  window.CueArt = { mascot, cup, cupInner, blink };
})();
