// Shared SVG art: mascot "Cuethie" (a vintage rubber-hose monkey with bowler hat (.mo-leaf = the hat) and neckerchief; the CUE cup is held in .mo-hand-cup) + smoothie cup.
// Every animatable part has a class so GSAP can target it:
//   Cuethie: .mo-root .mo-shadow .mo-legs .mo-leg-l .mo-leg-r .mo-body .mo-tail .mo-leaf(hat) .mo-eyes .mo-pupils .mo-mouth .mo-mouth-sad .mo-arm-l .mo-arm-r .mo-hand-cup
//   Cup: .cup-root .cup-fill .cup-layer-a .cup-layer-b .cup-straw .cup-lid .cup-label
// Style: printed label (DESIGN.md) — muted fills (brown fur, peach face/gloves), thin #25292B ink outlines,
// one highlight + one shadow shape per object. Root <svg> carries class "boil" (cel-line ink jitter, shared/boil.js).
// Keep these class names and the 220x280 viewBox if the art is ever swapped for an AI render.
(function () {
  let uid = 0;
  const INK = "#25292B";

  // Desaturate caller-supplied drink colours so custom fills stay inside the printed-label palette.
  function desat(hex) {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex || "");
    if (!m) return hex;
    const n = parseInt(m[1], 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    const y = 0.299 * r + 0.587 * g + 0.114 * b, k = 0.55;
    r = Math.round(y + (r - y) * k); g = Math.round(y + (g - y) * k); b = Math.round(y + (b - y) * k);
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  function mascot(opts = {}) {
    // Vintage "rubber hose" monkey, muted: brown fur, peach face, cream gloves, charcoal bowler hat and straw-red neckerchief.
    const id = "mo" + (++uid);
    const FUR = "#5A4A3E", FUR_L = "#6E5C4D", TAN = "#E9CDB0", TAN_D = "#C9A583", GLOVE = "#F2D9C2", STRAW = "#B83A32", LN = INK;
    const cup = opts.cup ? `<g class="mo-hand-cup" transform="translate(203 106) rotate(10)">${cupInner({ id: id + "c", scale: 0.42, colorA: opts.colorA, colorB: opts.colorB })}</g>` : "";
    const hose = (d, w) => `<path d="${d}" stroke="${LN}" stroke-width="${w + 5}" stroke-linecap="round" fill="none"/><path d="${d}" stroke="${FUR}" stroke-width="${w}" stroke-linecap="round" fill="none"/>`;
    // Cartoon glove (fingers up, wrist at the bottom): cuff, round palm, three sausage fingers and a thumb. Rotate to aim it.
    const glove = (cx, cy, rot) => {
      const f = [[-6, -3, -7, -14], [0, -4, 0, -17], [6, -3, 7, -14], [-9, 3, -17, -4]];
      const line = (w, c) => f.map(([x1, y1, x2, y2]) => `<path d="M${cx + x1} ${cy + y1} L${cx + x2} ${cy + y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`).join("");
      return `<g transform="rotate(${rot} ${cx} ${cy})">
        <rect x="${cx - 10}" y="${cy + 8}" width="20" height="9" rx="4" fill="${GLOVE}" stroke="${LN}" stroke-width="2.7"/>
        ${line(10.5, LN)}<ellipse cx="${cx}" cy="${cy + 1}" rx="11.5" ry="10" fill="${GLOVE}" stroke="${LN}" stroke-width="2.7"/>${line(5, GLOVE)}</g>`;
    };
    // Fist wrapped round the cup: cuff, rounded back of hand, finger creases and a thumb on top.
    const fist = (cx, cy, rot) => `<g transform="rotate(${rot} ${cx} ${cy})">
        <rect x="${cx - 10}" y="${cy + 9}" width="20" height="9" rx="4" fill="${GLOVE}" stroke="${LN}" stroke-width="2.7"/>
        <rect x="${cx - 16}" y="${cy - 11}" width="32" height="23" rx="10.5" fill="${GLOVE}" stroke="${LN}" stroke-width="2.9"/>
        <path d="M${cx - 16} ${cy - 5} Q${cx - 8} ${cy - 4} ${cx - 5} ${cy - 5} M${cx - 16} ${cy + 1} Q${cx - 8} ${cy + 2} ${cx - 5} ${cy + 1} M${cx - 15} ${cy + 7} Q${cx - 8} ${cy + 8} ${cx - 5} ${cy + 7}" stroke="${LN}" stroke-width="2" stroke-linecap="round" fill="none"/>
        <ellipse cx="${cx + 7}" cy="${cy - 11}" rx="6.5" ry="5" fill="${GLOVE}" stroke="${LN}" stroke-width="2.6"/></g>`;
    const foot = (cx, flip) => `<path d="M${cx - 20 * flip} 264 C${cx - 26 * flip} 250 ${cx - 10 * flip} 243 ${cx + 6 * flip} 246 C${cx + 24 * flip} 250 ${cx + 27 * flip} 264 ${cx + 16 * flip} 265 Z" fill="${TAN}" stroke="${LN}" stroke-width="3" stroke-linejoin="round"/><path d="M${cx + 9 * flip} 260 Q${cx + 11 * flip} 256 ${cx + 9.5 * flip} 252.5 M${cx + 16 * flip} 260 Q${cx + 18 * flip} 257 ${cx + 16.5 * flip} 253.5" stroke="${LN}" stroke-width="2" stroke-linecap="round" fill="none"/>`;
    const ear = (cx, s) => `<circle cx="${cx}" cy="98" r="23" fill="${FUR}" stroke="${LN}" stroke-width="3.4"/><circle cx="${cx - 2 * s}" cy="99" r="15" fill="${TAN}" stroke="${LN}" stroke-width="2.2"/><path d="M${cx - 6 * s} 94 Q${cx + 4 * s} 90 ${cx + 3 * s} 101 Q${cx} 108 ${cx - 5 * s} 104" stroke="${TAN_D}" stroke-width="2.5" stroke-linecap="round" fill="none"/>`;
    const face = [[88, 92, 25, 22], [132, 92, 25, 22], [110, 116, 47, 34]];
    const faceStroke = face.map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${TAN}" stroke="${LN}" stroke-width="3"/>`).join("");
    const faceFill = face.map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx - 1}" ry="${ry - 1}" fill="${TAN}"/>`).join("");
    const freckles = (cx, s = 1) => [[-6, 0], [2, -3], [5, 4], [-1, 6], [-9, 6]].map(([x, y]) => `<circle cx="${cx + x * s}" cy="${123 + y}" r="1.4" fill="#8A6A50"/>`).join("");
    return `
<svg class="mo-root boil" viewBox="0 0 220 280" xmlns="http://www.w3.org/2000/svg" overflow="visible" aria-label="Cuethie the monkey mascot">
  <ellipse class="mo-shadow" cx="110" cy="270" rx="64" ry="8" fill="${LN}" opacity=".16"/>
  <g class="mo-legs">
    <g class="mo-leg-l" style="transform-origin:96px 222px">${hose("M98 226 Q92 238 88 250", 12)}${foot(84, 1)}</g>
    <g class="mo-leg-r" style="transform-origin:124px 222px">${hose("M122 226 Q128 238 132 250", 12)}${foot(136, -1)}</g>
  </g>
  <g class="mo-arm-l" style="transform-origin:78px 168px">${hose("M80 170 Q50 178 46 208", 11)}${glove(46, 222, 186)}</g>
  <g class="mo-body" style="transform-origin:110px 150px">
    ${hose("M138 226 C188 252 218 222 206 194 C199 180 180 188 188 200", 9)}
    <ellipse cx="110" cy="190" rx="37" ry="44" fill="${FUR}" stroke="${LN}" stroke-width="3.4"/>
    <ellipse cx="110" cy="198" rx="23" ry="31" fill="${TAN}"/>
    ${ear(48, 1)}${ear(172, -1)}
    <ellipse cx="110" cy="98" rx="62" ry="58" fill="${FUR}" stroke="${LN}" stroke-width="3.4"/>
    <path d="M64 62 Q82 46 104 46" stroke="${FUR_L}" stroke-width="7" stroke-linecap="round" fill="none" opacity=".9"/>
    ${faceStroke}${faceFill}
    <path d="M86 150 L110 158 L134 150 L122 176 L110 164 L98 176 Z" fill="${STRAW}" stroke="${LN}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M100 152 Q110 160 120 152" stroke="${LN}" stroke-width="2.5" fill="none"/>
    <circle cx="110" cy="158" r="6.5" fill="${STRAW}" stroke="${LN}" stroke-width="2.7"/>
    <ellipse cx="78" cy="120" rx="13" ry="9" fill="#C08A6E" opacity=".45"/><ellipse cx="142" cy="120" rx="13" ry="9" fill="#C08A6E" opacity=".45"/>
    ${freckles(78)}${freckles(142, -1)}
    <g class="mo-eyes" style="transform-origin:110px 100px">
      <ellipse cx="92" cy="96" rx="13" ry="17" fill="#F8EBDA" stroke="${LN}" stroke-width="2.9"/>
      <ellipse cx="128" cy="96" rx="13" ry="17" fill="#F8EBDA" stroke="${LN}" stroke-width="2.9"/>
      <g class="mo-pupils">
        <ellipse cx="96" cy="99" rx="8" ry="11.5" fill="${LN}"/><ellipse cx="132" cy="99" rx="8" ry="11.5" fill="${LN}"/>
        <circle cx="99" cy="93" r="3.4" fill="#F8EBDA"/><circle cx="135" cy="93" r="3.4" fill="#F8EBDA"/>
      </g>
    </g>
    <path d="M80 72 Q88 66 98 70 M122 70 Q132 66 140 72" stroke="${LN}" stroke-width="2.5" stroke-linecap="round" fill="none"/>
    <path d="M103 112 Q110 108 117 112 Q117 119 110 121 Q103 119 103 112 Z" fill="#C49A78" stroke="${LN}" stroke-width="2.2" stroke-linejoin="round"/>
    <g class="mo-mouth">
      <path d="M90 126 Q110 150 130 126 Q110 134 90 126 Z" fill="#5B2E2A" stroke="${LN}" stroke-width="3.2" stroke-linejoin="round"/>
      <path d="M100 135 Q110 130 120 135 Q116 143 110 143 Q104 143 100 135 Z" fill="#D99A93"/>
    </g>
    <path class="mo-mouth-sad" d="M96 138 Q110 126 124 138" stroke="${LN}" stroke-width="3.2" stroke-linecap="round" fill="none" opacity="0"/>
    <g class="mo-leaf" style="transform-origin:110px 62px">
      <path d="M62 52 Q110 66 158 52 Q160 62 150 62 Q110 74 70 62 Q60 62 62 52 Z" fill="${INK}" stroke="${LN}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M72 54 C70 22 90 12 110 12 C130 12 150 22 148 54 Q110 66 72 54 Z" fill="${INK}" stroke="${LN}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M72 48 Q110 60 148 48 L148 40 Q110 52 72 40 Z" fill="${GLOVE}" stroke="${LN}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M84 26 Q92 17 104 16" stroke="#4A5054" stroke-width="4" stroke-linecap="round" fill="none"/>
    </g>
  </g>
  ${cup}
  <g class="mo-arm-r" style="transform-origin:142px 168px">${opts.cup ? `${hose("M140 170 Q192 180 193 158", 11)}${fist(197, 136, 8)}` : `${hose("M140 170 Q192 178 190 158", 11)}${glove(190, 146, -4)}`}</g>
</svg>`;
  }

  // Cup drawn in a 120x200 box; fill clipped to the cup body (clip + geometry unchanged so pour animations keep working).
  // Printed-label look: peach body with the logo's charcoal wavy bands, red/cream striped straw.
  // colorA/colorB still drive the two layers but are desaturated to stay in palette.
  function cupInner(o = {}) {
    const id = o.id || "cup" + (++uid);
    const a = desat(o.colorA || INK), b = desat(o.colorB || INK), s = o.scale || 1;
    	const labelText = o.label ?? "CUE";
	const label = `<g class="cup-label"><rect x="19" y="104" width="82" height="34" rx="9" fill="#F8EBDA" stroke="${INK}" stroke-width="2.4"/><text x="60" y="126" text-anchor="middle" font-family="Fraunces, serif" font-weight="800" font-size="${labelText.length > 6 ? 13 : 16}" textLength="${labelText.length > 6 ? 70 : 0}" lengthAdjust="spacingAndGlyphs" fill="${INK}">${labelText}</text></g>`;
    const chunk = (x, y, r, fill, rot) => `<rect x="${x - r}" y="${y - r}" width="${r * 2}" height="${r * 2}" rx="${r * 0.35}" fill="${fill}" stroke="${INK}" stroke-width="2" transform="rotate(${rot} ${x} ${y})"/>`;
    return `<g class="cup-root" transform="scale(${s}) translate(-60 -100)">
      <defs><clipPath id="${id}clip"><path d="M18 52 L102 52 L92 190 Q60 198 28 190 Z"/></clipPath></defs>
      <g clip-path="url(#${id}clip)">
        <rect x="0" y="52" width="120" height="150" fill="#F2D9C2"/>
        <path d="M66 50 L78 140" stroke="${INK}" stroke-width="10" stroke-linecap="round" opacity=".12"/>
        <g class="cup-fill">
          <path class="cup-layer-b" d="M0 120 Q30 110 60 120 T120 120 L120 210 L0 210 Z" fill="${b}"/>
          <path class="cup-layer-a" d="M0 70 Q30 60 60 70 T120 70 L120 125 Q90 115 60 125 T0 125 Z" fill="${a}"/>
          ${chunk(42, 98, 8, "#D9B77A", -18)}${chunk(80, 90, 7, "#D9B77A", 24)}
          <circle cx="62" cy="108" r="7" fill="#8E4B4F" stroke="${INK}" stroke-width="2"/>
          ${chunk(36, 150, 8, "#D9B77A", 14)}<circle cx="72" cy="146" r="8" fill="#B5506A" stroke="${INK}" stroke-width="2"/>${chunk(56, 172, 7, "#D9B77A", -26)}<circle cx="84" cy="172" r="6" fill="#8E4B4F" stroke="${INK}" stroke-width="2"/>
          <circle cx="50" cy="132" r="3" fill="#F8EBDA" opacity=".35"/><circle cx="88" cy="128" r="2.5" fill="#F8EBDA" opacity=".35"/><circle cx="30" cy="112" r="2.5" fill="#F8EBDA" opacity=".35"/>
        </g>
      </g>
      <path d="M18 52 L102 52 L92 190 Q60 198 28 190 Z" fill="none" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M29 66 L36 178" stroke="#F8EBDA" stroke-width="6" stroke-linecap="round" opacity=".5"/>
      <ellipse cx="90" cy="84" rx="2.6" ry="3.6" fill="#F8EBDA" opacity=".6"/><ellipse cx="86" cy="104" rx="2.2" ry="3.2" fill="#F8EBDA" opacity=".55"/><ellipse cx="92" cy="128" rx="2.4" ry="3.4" fill="#F8EBDA" opacity=".55"/>
      <g class="cup-lid"><path d="M14 54 Q14 18 60 16 Q106 18 106 54 Z" fill="#F2D9C2" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M28 44 Q32 28 52 24" stroke="#F8EBDA" stroke-width="5" stroke-linecap="round" fill="none" opacity=".85"/><rect x="8" y="48" width="104" height="11" rx="5.5" fill="#F8EBDA" stroke="${INK}" stroke-width="3.2"/></g>
      <g class="cup-straw"><path d="M72 40 L86 -6 L102 -6" stroke="${INK}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M72 40 L86 -6 L102 -6" stroke="#F2D9C2" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M72 40 L86 -6 L102 -6" stroke="#B83A32" stroke-width="7" stroke-dasharray="5 8" stroke-linecap="butt" fill="none"/></g>
      ${label}
    </g>`;
  }

  function cup(o = {}) {
    return `<svg class="cup-svg boil" viewBox="-70 -120 140 230" xmlns="http://www.w3.org/2000/svg" overflow="visible">${cupInner(o)}</svg>`;
  }

  // Optional: blink Mo's eyes. Returns a gsap timeline (one blink; pass {double:true} or {loop:true}).
  function blink(root, o = {}) {
    const eyes = root && root.querySelectorAll ? root.querySelectorAll(".mo-eyes") : [];
    const tl = gsap.timeline(o.loop ? { repeat: -1, repeatDelay: o.every || 2.8 } : {});
    tl.to(eyes, { scaleY: 0.08, duration: 0.07, ease: "power2.in", svgOrigin: "110 100", yoyo: true, repeat: o.double ? 3 : 1 });
    return tl;
  }

  window.CueArt = { mascot, cup, cupInner, blink, desat };
})();
