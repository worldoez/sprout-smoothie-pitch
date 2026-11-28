/* Cel-line boil for CUE (technique from deenukhan/animation-styles, style 16):
   ink outlines jitter "on twos/threes" — a feTurbulence + feDisplacementMap filter whose seed steps
   through 4 variants a few times a second. We run it slow (about 7 fps) so it reads as hand-inked, not wobbly.
   Use: add class "boil" to a small line-art element (logo img, mascot svg, icon). Never on text or full screens.
   Disabled under prefers-reduced-motion (filter stays at seed 1, a static hand-drawn wobble). */
(function () {
  "use strict";
  if (document.getElementById("cue-boil-defs")) return;
  var NS = "http://www.w3.org/2000/svg";
  var svg = document.createElementNS(NS, "svg");
  svg.setAttribute("id", "cue-boil-defs");
  svg.setAttribute("width", "0"); svg.setAttribute("height", "0");
  svg.setAttribute("aria-hidden", "true");
  svg.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
  svg.innerHTML =
    '<filter id="cue-boil" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">' +
    '<feTurbulence id="cue-boil-turb" type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="1" result="n"/>' +
    '<feDisplacementMap in="SourceGraphic" in2="n" scale="3" xChannelSelector="R" yChannelSelector="G"/>' +
    "</filter>";
  function mount() { (document.body || document.documentElement).appendChild(svg); }
  if (document.body) mount(); else document.addEventListener("DOMContentLoaded", mount);

  var reduce = false;
  try { reduce = matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
  if (reduce) return;
  var seed = 1, last = 0, STEP = 140; // ms per drawing
  function tick(t) {
    if (t - last >= STEP) {
      last = t; seed = seed % 4 + 1;
      var el = document.getElementById("cue-boil-turb");
      if (el && !document.hidden) el.setAttribute("seed", String(seed));
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
