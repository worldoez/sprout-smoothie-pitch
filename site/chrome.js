// CUE site chrome: one source for the sticky nav and the footer, injected on every
// page in /site/. Classic script, no fetch, no modules — everything is a plain
// relative href so the pages also work from file://.
(function () {
  "use strict";

  var PICKUP = "Find us at the YIA Building, ground floor, next to the stairwell.";
  var IMG = "../assets/img/cue-logo.png";
  var FALLBACK = "onerror=\"this.parentNode.classList.add('txt')\"";

  // Site links (relative to /site/). "Survey" points at the untouched /survey page.
  var PAGES = [
    { href: "menu.html", label: "Menu" },
    { href: "story.html", label: "Our story" },
    { href: "find.html", label: "Find us" },
    { href: "../survey/index.html", label: "Survey" }
  ];

  var here = location.href.split("#")[0].split("?")[0].split("/").pop() || "index.html";
  function link(p, extraCls) {
    var cur = p.href === here ? " cur" : "";
    var aria = p.href === here ? ' aria-current="page"' : "";
    return '<a class="' + extraCls + cur + '" href="' + p.href + '"' + aria + ">" + p.label + "</a>";
  }
  // The footer lists every page plus the pitch deck.
  var FOOT = PAGES.concat([
    { href: "index.html", label: "Home" },
    { href: "../deck/index.html", label: "Watch the pitch" }
  ]);

  var brandmark =
    '<span class="brandmark">' +
    '<img src="' + IMG + '" alt="CUE logo sticker" ' + FALLBACK + ">" +
    '<span class="bm-text display">CUE</span></span>';

  var header = document.createElement("header");
  header.className = "nav on-dark dark";
  header.innerHTML =
    '<div class="nav-inner">' +
    '<a class="nav-logo" href="index.html" aria-label="CUE — home">' +
    brandmark + '<span class="nav-word">Smoothie</span></a>' +
    '<nav class="nav-links" aria-label="Site">' +
    PAGES.map(function (p) { return link(p, "nav-link"); }).join("") +
    '</nav>' +
    '<a class="btn nav-order" href="../order/index.html">Order ahead</a>' +
    "</div>";
  document.body.insertBefore(header, document.body.firstChild);

  var footer = document.createElement("footer");
  footer.className = "foot dark on-dark";
  footer.innerHTML =
    '<div class="wrap foot-grid">' +
    '<p class="foot-logo">' + brandmark + "</p>" +
    '<nav class="foot-links" aria-label="Site links">' +
    FOOT.map(function (p) { return link(p, "foot-link"); }).join("") +
    "</nav>" +
    '<p class="foot-pickup">' + PICKUP + "</p>" +
    "</div>";
  document.body.appendChild(footer);

  // The readable labels of the sticker fallback are set here (nav + footer).
  Array.prototype.forEach.call(document.querySelectorAll(".bm-text"), function (el) {
    el.textContent = "CUE";
  });
})();
