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
    const FUR = "#8B6347", FUR_D = "#6B4A33", SKIN = "#F2D9C2";
    const cup = opts.cup ? `<g class="mo-hand-cup" transform="translate(204 108) rotate(10)">${cupInner({ id: id + "c", scale: 0.42, colorA: opts.colorA, colorB: opts.colorB })}</g>` : "";
    // Monkey hand: round brown paw with a peach palm.
    const paw = (cx, cy, flip) => `
        <path d="M${cx - 12 * flip} ${cy + 2} C${cx - 12 * flip} ${cy - 11} ${cx - 3 * flip} ${cy - 15} ${cx + 5 * flip} ${cy - 14} C${cx + 14 * flip} ${cy - 13} ${cx + 16 * flip} ${cy - 2} ${cx + 12 * flip} ${cy + 7} C${cx + 8 * flip} ${cy + 16} ${cx - 9 * flip} ${cy + 15} ${cx - 12 * flip} ${cy + 2} Z" fill="${FUR}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
        <ellipse cx="${cx + 1 * flip}" cy="${cy + 1}" rx="6.5" ry="7.5" fill="${SKIN}"/>`;
    // Monkey foot: brown, peach sole and toe line.
    const foot = (cx, flip) => `
        <path d="M${cx - 17 * flip} 262 C${cx - 21 * flip} 262 ${cx - 21 * flip} 250 ${cx - 12 * flip} 247 L${cx + 2 * flip} 244 C${cx + 14 * flip} 243 ${cx + 22 * flip} 250 ${cx + 22 * flip} 258 C${cx + 22 * flip} 262 ${cx + 20 * flip} 262 ${cx + 18 * flip} 262 Z" fill="${FUR}" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>
        <path d="M${cx - 15 * flip} 259 L${cx + 19 * flip} 259" stroke="${SKIN}" stroke-width="4" stroke-linecap="round"/>
        <path d="M${cx + 4 * flip} 250 L${cx + 12 * flip} 254" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`;
    const ear = cx => `<circle cx="${cx}" cy="124" r="22" fill="${FUR}" stroke="${INK}" stroke-width="5.5"/><circle cx="${cx + (cx < 110 ? 2 : -2)}" cy="125" r="12" fill="${SKIN}"/>`;
    // Face mask shapes: two eye patches, a bridge and a muzzle (stroked first, then filled so the outline reads as one shape).
    const face = [[86, 131, 27, 29], [134, 131, 27, 29], [110, 140, 24, 22], [110, 167, 38, 27]];
    const faceStroke = face.map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${SKIN}" stroke="${INK}" stroke-width="5"/>`).join("");
    const faceFill = face.map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx - 1}" ry="${ry - 1}" fill="${SKIN}"/>`).join("");
    return `
<svg class="mo-root" viewBox="0 0 220 280" xmlns="http://www.w3.org/2000/svg" overflow="visible" aria-label="Cue the monkey mascot">
  <ellipse class="mo-shadow" cx="110" cy="268" rx="66" ry="9" fill="${INK}" opacity=".16"/>
  <g class="mo-legs">
    <g class="mo-leg-l" style="transform-origin:88px 218px"><path d="M88 214 L86 246" stroke="${INK}" stroke-width="15" stroke-linecap="round" fill="none"/><path d="M88 214 L86 246" stroke="${FUR}" stroke-width="8" stroke-linecap="round" fill="none"/>${foot(82, 1)}</g>
    <g class="mo-leg-r" style="transform-origin:132px 218px"><path d="M132 214 L134 246" stroke="${INK}" stroke-width="15" stroke-linecap="round" fill="none"/><path d="M132 214 L134 246" stroke="${FUR}" stroke-width="8" stroke-linecap="round" fill="none"/>${foot(138, -1)}</g>
  </g>
  <g class="mo-arm-l" style="transform-origin:62px 190px"><path d="M62 190 Q36 196 34 218" stroke="${INK}" stroke-width="16" stroke-linecap="round" fill="none"/><path d="M62 190 Q36 196 34 218" stroke="${FUR}" stroke-width="9" stroke-linecap="round" fill="none"/>${paw(33, 224, 1)}</g>
  <g class="mo-body" style="transform-origin:110px 150px">
    <path class="mo-tail" d="M148 236 C196 262 226 234 212 200 C208 190 194 192 197 202" stroke="${INK}" stroke-width="16" stroke-linecap="round" fill="none"/>
    <path d="M148 236 C196 262 226 234 212 200 C208 190 194 192 197 202" stroke="${FUR}" stroke-width="8" stroke-linecap="round" fill="none"/>
    <ellipse cx="110" cy="206" rx="52" ry="37" fill="${FUR}" stroke="${INK}" stroke-width="5.5"/>
    <ellipse cx="110" cy="212" rx="33" ry="26" fill="${SKIN}"/>
    <text x="110" y="219" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="900" font-size="19" letter-spacing="1" fill="${INK}">CUE</text>
    ${ear(48)}${ear(172)}
    <ellipse cx="110" cy="124" rx="62" ry="66" fill="${FUR}" stroke="${INK}" stroke-width="5.5"/>
    <path d="M154 78 C178 110 176 150 152 184 C166 150 166 110 154 78 Z" fill="${FUR_D}" opacity=".55"/>
    ${faceStroke}${faceFill}
    <g class="mo-leaf" style="transform-origin:110px 62px">
      <path d="M108 62 C100 40 124 32 128 46 C130 54 120 56 118 50" stroke="${INK}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <path d="M108 62 C100 40 124 32 128 46 C130 54 120 56 118 50" stroke="${FUR}" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </g>
    <ellipse cx="66" cy="162" rx="9" ry="6" fill="#E8A597" opacity=".8"/><ellipse cx="154" cy="162" rx="9" ry="6" fill="#E8A597" opacity=".8"/>
    <g class="mo-eyes" style="transform-origin:110px 132px">
      <ellipse cx="86" cy="131" rx="18" ry="22" fill="#FFF" stroke="${INK}" stroke-width="4.5"/>
      <ellipse cx="134" cy="131" rx="18" ry="22" fill="#FFF" stroke="${INK}" stroke-width="4.5"/>
      <g class="mo-pupils">
        <ellipse cx="89" cy="135" rx="12" ry="14" fill="${INK}"/><ellipse cx="131" cy="135" rx="12" ry="14" fill="${INK}"/>
        <circle cx="94" cy="128" r="5" fill="#FFF"/><circle cx="136" cy="128" r="5" fill="#FFF"/>
        <circle cx="85" cy="141" r="2.5" fill="#FFF"/><circle cx="127" cy="141" r="2.5" fill="#FFF"/>
      </g>
    </g>
    <ellipse cx="103" cy="156" rx="2.6" ry="3.4" fill="${INK}"/><ellipse cx="117" cy="156" rx="2.6" ry="3.4" fill="${INK}"/>
    <g class="mo-mouth">
      <path d="M92 168 Q110 196 128 168 Q110 174 92 168 Z" fill="#5E2431" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>
      <path d="M100 180 Q110 175 120 180 Q115 189 110 189 Q105 189 100 180 Z" fill="#E8A597"/>
    </g>
    <path class="mo-mouth-sad" d="M96 184 Q110 170 124 184" stroke="${INK}" stroke-width="5" stroke-linecap="round" fill="none" opacity="0"/>
  </g>
  ${cup}
  <g class="mo-arm-r" style="transform-origin:158px 190px"><path d="M158 190 Q196 192 192 154" stroke="${INK}" stroke-width="16" stroke-linecap="round" fill="none"/><path d="M158 190 Q196 192 192 154" stroke="${FUR}" stroke-width="9" stroke-linecap="round" fill="none"/>${paw(191, 144, -1)}</g>
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

  window.SproutArt = { mascot, cup, cupInner, blink };
})();
