// Shared SVG art: mascot "Cue" (a vintage rubber-hose monkey with bowler hat (.mo-leaf = the hat) and neckerchief; the CUE cup is held in .mo-hand-cup) + smoothie cup.
// Every animatable part has a class so GSAP can target it:
//   Cue: .mo-root .mo-shadow .mo-legs .mo-leg-l .mo-leg-r .mo-body .mo-tail .mo-leaf(hat) .mo-eyes .mo-pupils .mo-mouth .mo-mouth-sad .mo-arm-l .mo-arm-r .mo-hand-cup
//   Cup: .cup-root .cup-fill .cup-layer-a .cup-layer-b .cup-straw .cup-lid .cup-label
// Style: flat cartoon, bold ink outlines, flat fills, one highlight + one shadow shape per object (DESIGN.md).
// Keep these class names and the 220x280 viewBox if the art is ever swapped for an AI render.
(function () {
  let uid = 0;
  const INK = "#25292B";

  function mascot(opts = {}) {
    // Vintage "rubber hose" monkey: chocolate fur, tan heart face, cream gloves, small bowler hat and neckerchief.
    const id = "mo" + (++uid);
    const FUR = "#6E4529", FUR_L = "#9A653D", FUR_D = "#563420", TAN = "#EBCDA4", TAN_D = "#D9AE7E", GLOVE = "#F7ECD6", LN = "#2B1D14";
    const cup = opts.cup ? `<g class="mo-hand-cup" transform="translate(204 108) rotate(10)">${cupInner({ id: id + "c", scale: 0.42, colorA: opts.colorA, colorB: opts.colorB })}</g>` : "";
    const hose = (d, w) => `<path d="${d}" stroke="${LN}" stroke-width="${w + 6}" stroke-linecap="round" fill="none"/><path d="${d}" stroke="${FUR}" stroke-width="${w}" stroke-linecap="round" fill="none"/>`;
    // Open glove: palm + four capsule fingers + thumb, drawn at (cx,cy) pointing up, then rotated.
    const hand = (cx, cy, rot) => {
      const f = [[-8, -3, -13, -17], [-2.7, -6, -4, -21], [2.7, -6, 5, -21], [8, -3, 13, -17], [-10, 3, -20, -5]];
      const line = (w, c) => f.map(([x1, y1, x2, y2]) => `<path d="M${cx + x1} ${cy + y1} L${cx + x2} ${cy + y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`).join("");
      return `<g transform="rotate(${rot} ${cx} ${cy})">
        <rect x="${cx - 8}" y="${cy + 8}" width="16" height="9" rx="3.5" fill="${GLOVE}" stroke="${LN}" stroke-width="3.2"/>
        ${line(10, LN)}<circle cx="${cx}" cy="${cy + 1}" r="11" fill="${GLOVE}" stroke="${LN}" stroke-width="3.2"/>${line(4.6, GLOVE)}
        <path d="M${cx - 6} ${cy + 3} Q${cx} ${cy + 7} ${cx + 6} ${cy + 3}" stroke="${TAN_D}" stroke-width="2" stroke-linecap="round" fill="none"/></g>`;
    };
    // Fist gripping the cup: rounded glove with finger creases.
    const fist = (cx, cy, rot) => `<g transform="rotate(${rot} ${cx} ${cy})">
        <rect x="${cx - 8}" y="${cy + 8}" width="16" height="9" rx="3.5" fill="${GLOVE}" stroke="${LN}" stroke-width="3.2"/>
        <rect x="${cx - 13}" y="${cy - 12}" width="26" height="24" rx="11" fill="${GLOVE}" stroke="${LN}" stroke-width="3.4"/>
        <path d="M${cx - 13} ${cy - 5} L${cx - 3} ${cy - 5} M${cx - 13} ${cy + 1} L${cx - 3} ${cy + 1} M${cx - 13} ${cy + 7} L${cx - 3} ${cy + 7}" stroke="${LN}" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M${cx + 13} ${cy - 2} Q${cx + 4} ${cy - 10} ${cx - 2} ${cy - 8}" stroke="${LN}" stroke-width="2.2" stroke-linecap="round" fill="none"/></g>`;
    const foot = (cx, flip) => `<path d="M${cx - 20 * flip} 264 C${cx - 26 * flip} 250 ${cx - 10 * flip} 243 ${cx + 6 * flip} 246 C${cx + 24 * flip} 250 ${cx + 27 * flip} 264 ${cx + 16 * flip} 265 Z" fill="${TAN}" stroke="${LN}" stroke-width="3.6" stroke-linejoin="round"/><path d="M${cx + 7 * flip} 264 L${cx + 8 * flip} 256 M${cx + 15 * flip} 263 L${cx + 16 * flip} 255" stroke="${LN}" stroke-width="2.4" stroke-linecap="round"/>`;
    const ear = (cx, s) => `<circle cx="${cx}" cy="98" r="24" fill="${FUR}" stroke="${LN}" stroke-width="3.8"/><circle cx="${cx - 2 * s}" cy="99" r="16" fill="${TAN}" stroke="${LN}" stroke-width="2.4"/><path d="M${cx - 7 * s} 95 Q${cx + 3 * s} 90 ${cx + 3 * s} 101 Q${cx} 108 ${cx - 5 * s} 104" stroke="${TAN_D}" stroke-width="3" stroke-linecap="round" fill="none"/>`;
    const face = [[90, 96, 23, 20], [130, 96, 23, 20], [110, 120, 42, 30]];
    const faceStroke = face.map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${TAN}" stroke="${LN}" stroke-width="3.4"/>`).join("");
    const faceFill = face.map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx - 1}" ry="${ry - 1}" fill="${TAN}"/>`).join("");
    const freckles = (cx, s = 1) => [[-6, 0], [2, -3], [5, 4], [-1, 6], [-9, 6]].map(([x, y]) => `<circle cx="${cx + x * s}" cy="${125 + y}" r="1.3" fill="#A8683F"/>`).join("");
    return `
<svg class="mo-root" viewBox="0 0 220 280" xmlns="http://www.w3.org/2000/svg" overflow="visible" aria-label="Cue the monkey mascot">
  <ellipse class="mo-shadow" cx="110" cy="270" rx="64" ry="8" fill="${LN}" opacity=".16"/>
  <g class="mo-legs">
    <g class="mo-leg-l" style="transform-origin:98px 222px">${hose("M100 226 Q94 238 90 250", 9)}${foot(86, 1)}</g>
    <g class="mo-leg-r" style="transform-origin:122px 222px">${hose("M120 226 Q126 238 130 250", 9)}${foot(134, -1)}</g>
  </g>
  <g class="mo-arm-l" style="transform-origin:82px 170px">${hose("M84 172 Q52 176 46 204", 8)}${hand(46, 214, 172)}</g>
  <g class="mo-body" style="transform-origin:110px 150px">
    ${hose("M134 224 C186 252 218 222 206 192 C199 177 180 186 188 199", 7)}
    <path d="M84 140 C74 168 74 214 86 228 C98 236 122 236 134 228 C146 214 146 168 136 140 Z" fill="${FUR}" stroke="${LN}" stroke-width="3.8" stroke-linejoin="round"/>
    <ellipse cx="110" cy="198" rx="21" ry="29" fill="${TAN}"/>
    ${ear(44, 1)}${ear(176, -1)}
    <ellipse cx="110" cy="96" rx="66" ry="60" fill="${FUR}" stroke="${LN}" stroke-width="3.8"/>
    <clipPath id="${id}h"><ellipse cx="110" cy="96" rx="64" ry="58"/></clipPath><path clip-path="url(#${id}h)" d="M146 40 C186 70 190 124 150 156 C168 120 164 78 146 40 Z" fill="${FUR_D}" opacity=".5"/>
    <path d="M52 82 Q54 66 66 56" stroke="${FUR_L}" stroke-width="6" stroke-linecap="round" fill="none"/>
    ${faceStroke}${faceFill}
    <path d="M94 152 L110 159 L126 152 L119 172 L110 165 L101 172 Z" fill="${GLOVE}" stroke="${LN}" stroke-width="3.2" stroke-linejoin="round"/>
    <circle cx="110" cy="158" r="5" fill="${GLOVE}" stroke="${LN}" stroke-width="2.8"/>
    <ellipse cx="80" cy="122" rx="12" ry="8" fill="#D98A6A" opacity=".5"/><ellipse cx="140" cy="122" rx="12" ry="8" fill="#D98A6A" opacity=".5"/>
    ${freckles(80)}${freckles(140, -1)}
    <g class="mo-eyes" style="transform-origin:110px 100px">
      <path d="M81 98 C81 84 96 80 101 90 C105 100 99 114 91 114 C84 114 81 107 81 98 Z" fill="#FFF" stroke="${LN}" stroke-width="3"/>
      <path d="M139 98 C139 84 124 80 119 90 C115 100 121 114 129 114 C136 114 139 107 139 98 Z" fill="#FFF" stroke="${LN}" stroke-width="3"/>
      <g class="mo-pupils">
        <ellipse cx="94" cy="100" rx="7" ry="10.5" fill="${LN}"/><ellipse cx="126" cy="100" rx="7" ry="10.5" fill="${LN}"/>
        <circle cx="96.5" cy="95" r="2.8" fill="#FFF"/><circle cx="128.5" cy="95" r="2.8" fill="#FFF"/>
      </g>
    </g>
    <path d="M80 80 Q88 72 98 76 M122 76 Q132 72 140 80" stroke="${LN}" stroke-width="3" stroke-linecap="round" fill="none"/>
    <path d="M103 117 Q110 112 117 117 Q116 124 110 126 Q104 124 103 117 Z" fill="#C98E6A" stroke="${LN}" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M110 126 L110 132" stroke="${LN}" stroke-width="2.2" stroke-linecap="round"/>
    <g class="mo-mouth">
      <path d="M90 131 Q110 154 130 131 Q110 139 90 131 Z" fill="#6B1F2E" stroke="${LN}" stroke-width="3.6" stroke-linejoin="round"/>
      <path d="M100 140 Q110 135 120 140 Q116 148 110 148 Q104 148 100 140 Z" fill="#F08A8F"/>
    </g>
    <path class="mo-mouth-sad" d="M96 142 Q110 130 124 142" stroke="${LN}" stroke-width="4" stroke-linecap="round" fill="none" opacity="0"/>
    <g class="mo-leaf" style="transform-origin:112px 58px"><g transform="translate(-2 8) rotate(-8 112 48)">
      <ellipse cx="112" cy="50" rx="36" ry="7.5" fill="#33363A" stroke="${LN}" stroke-width="3.4"/>
      <path d="M90 48 C88 24 100 16 112 16 C124 16 136 24 134 48 Q112 56 90 48 Z" fill="#33363A" stroke="${LN}" stroke-width="3.4" stroke-linejoin="round"/>
      <path d="M90 44 Q112 52 134 44 L134 36 Q112 44 90 36 Z" fill="${GLOVE}" stroke="${LN}" stroke-width="2.8" stroke-linejoin="round"/>
      <path d="M98 28 Q104 21 113 20" stroke="#6A6E72" stroke-width="3.5" stroke-linecap="round" fill="none"/>
    </g></g>
  </g>
  ${cup}
  <g class="mo-arm-r" style="transform-origin:142px 168px">${hose("M138 172 Q190 180 190 160", 8)}${fist(190, 148, -4)}</g>
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
