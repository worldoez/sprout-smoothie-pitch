// MENU — the CUE menu, single source of truth. Role 4 + Role 5 own this file.
// pct = share of the 55 usable respondents who chose it (04_fruit/04_base/04_addons.csv).
// Prices come from the printed menu v16 only.
window.CONTENT = window.CONTENT || {};
window.CONTENT.menu = {
  fruits: [
    { key: "mango",      name: "Mango",      emoji: "🥭", color: "#FFB020", pct: 0.727 },
    { key: "strawberry", name: "Strawberry", emoji: "🍓", color: "#E8364F", pct: 0.600 },
    { key: "banana",     name: "Banana",     emoji: "🍌", color: "#E8C26A", pct: 0.472 },
    { key: "blueberry",  name: "Blueberry",  emoji: "🫐", color: "#4F5BD5", pct: 0.377 },
    { key: "peach",      name: "Peach",      emoji: "🍑", color: "#FF9E7A", pct: 0.358 },
    // On the printed menu but not in the survey list: pct is null (show no survey badge).
    { key: "watermelon", name: "Watermelon",    emoji: "🍉", color: "#E8576B", pct: null },
    { key: "apple",      name: "Apple",         emoji: "🍎", color: "#C9D27A", pct: null },
    { key: "passion",    name: "Passion fruit", emoji: "🥭", color: "#E8A33C", pct: null },
    { key: "pineapple",  name: "Pineapple",     emoji: "🍍", color: "#F0CD52", pct: null }
  ],
  maxFruits: 2,
  bases: [
    { key: "yogurt",     name: "Yogurt",       pct: 0.528 },
    { key: "juice",      name: "Fruit juice",  pct: 0.528 },
    { key: "fresh_milk", name: "Fresh milk",   pct: 0.434 },
    { key: "coconut",    name: "Coconut milk", pct: 0.302 }
  ],
  // Extras (never "boosters"). The first extra is free, each further one is HK$5 (printed menu v16).
  // name/fancy = the menu name; what = what is in it. price = cost of an extra beyond the free one.
  // pct: survey share where the survey asked (protein, vitamins, matcha-or-coffee, oats); else null.
  addons: [
    { key: "vitamin",   name: "Glow Getter",  fancy: "Glow Getter",  what: "Vitamin blend",           price: 5, pct: 0.491 },
    { key: "protein",   name: "Power Up",     fancy: "Power Up",     what: "Protein powder",          price: 5, pct: 0.509 },
    { key: "wake",      name: "Wake-Up Cue",  fancy: "Wake-Up Cue",  what: "Matcha or coffee shot",   price: 5, pct: 0.415,
      pctNote: "energy boost (matcha or coffee)" },
    { key: "chia",      name: "Tiny Mighty",  fancy: "Tiny Mighty",  what: "Chia seeds",              price: 5, pct: null },
    { key: "oats",      name: "Oat So Good",  fancy: "Oat So Good",  what: "Oats",                    price: 5, pct: 0.377 },
    { key: "nuts",      name: "Go Nuts",      fancy: "Go Nuts",      what: "Peanut or almond butter", price: 5, pct: null },
    { key: "probiotic", name: "Happy Tummy",  fancy: "Happy Tummy",  what: "Probiotics",              price: 5, pct: null }
  ],
  freeExtras: 1,
  maxAddons: 2,
  // Printed menu v16 (PRESENTATION/ARTIFACTS/CUE_Studio_Menu_v16.pdf). Keys S/M/L are kept for the
  // order app and deck: S = Regular, M = Large, L = XL. price = CUHK student-ID price, walkIn = everyone else.
  sizes: [
    { key: "S", name: "Regular", oz: 16, price: 25, walkIn: 28 },
    { key: "M", name: "Large",   oz: 20, price: 30, walkIn: 33 },
    { key: "L", name: "XL",      oz: 24, price: 34, walkIn: 37 }
  ],
  sizeEvidence: { pct: 0.736, text: "74% want a choice of cup size" },
  // 03_candidate_prices.csv — share who would pay at each price
  priceLadder: [
    { price: 25, share: 0.774 }, { price: 28, share: 0.604 }, { price: 30, share: 0.528 },
    { price: 32, share: 0.415 }, { price: 35, share: 0.396 }
  ],
  // Menu sections: every drink is priced by cup size (see sizes), so no per-section price.
  sections: [
    { key: "golden",   title: "Golden Hour" },
    { key: "classics", title: "Fruit Classics" },
    { key: "morning",  title: "Morning Blends" }
  ],
  // Named drinks. image = a finished product render; drinks WITHOUT image are not designed yet and show no picture.
  drinks: [
    { name: "Mango Sunrise", section: "Golden Hour", signature: true,
      desc: "Strawberry purée, plain yogurt, mango slush.",
      fruits: ["strawberry", "mango"], base: "yogurt", addons: [] },
    { name: "Berry Dusk", section: "Golden Hour", image: "assets/img/drinks/berry-layers.png",
      desc: "Blueberry purée, yogurt, strawberry slush.",
      fruits: ["blueberry", "strawberry"], base: "yogurt", addons: [] },
    { name: "Peach Cloud", section: "Golden Hour",
      desc: "Peach purée, coconut milk, mango slush.",
      fruits: ["peach", "mango"], base: "coconut", addons: [] },
    { name: "Berry Blush", section: "Fruit Classics",
      desc: "Strawberry, blueberry, fresh milk.",
      fruits: ["strawberry", "blueberry"], base: "fresh_milk", addons: [] },
    { name: "Banana Boost", section: "Fruit Classics", image: "assets/img/drinks/mango.png",
      desc: "Banana, mango, fresh milk.",
      fruits: ["banana", "mango"], base: "fresh_milk", addons: [] },
    { name: "Peach Breeze", section: "Fruit Classics",
      desc: "Peach, mango, fruit juice.",
      fruits: ["peach", "mango"], base: "juice", addons: [] },
    { name: "Blue Moon", section: "Fruit Classics",
      desc: "Blueberry, banana, yogurt.",
      fruits: ["blueberry", "banana"], base: "yogurt", addons: [] },
    { name: "Matcha Banana", section: "Morning Blends", image: "assets/img/drinks/matcha.png",
      desc: "Matcha, banana, fresh milk.",
      fruits: ["banana"], base: "fresh_milk", addons: ["wake"] },
    { name: "Coffee Oat", section: "Morning Blends",
      desc: "Coffee, oats, fresh milk.",
      fruits: [], base: "fresh_milk", addons: ["wake", "oats"] },
    { name: "Berry Oat", section: "Morning Blends",
      desc: "Strawberry, oats, yogurt.",
      fruits: ["strawberry"], base: "yogurt", addons: ["oats"] }
  ],
  // Price of a drink: size price (CUHK ID) + HK$5 for every extra after the first free one.
  priceOf: function (sizeKey, nExtras, walkIn) {
    var m = window.CONTENT.menu, s = m.sizes.filter(function (z) { return z.key === sizeKey; })[0] || m.sizes[0];
    return (walkIn ? s.walkIn : s.price) + 5 * Math.max(0, (nExtras || 0) - m.freeExtras);
  },
  pickupLine: "Pick up at the YIA Building, ground floor",
  // Fallback when no live order is found
  exampleOrder: {
    id: "example", name: "Professor", fruits: ["mango", "strawberry"], base: "yogurt",
    addons: [], size: "S", price: 25, drinkName: "Mango Sunrise", at: "2026-12-01T10:00:00Z", example: true
  }
};

// Helper: the named drink for a fruit+base combo, else "Mix your own".
// base is optional (older callers pass fruits only); fruit sets are unique per
// drink except Peach Cloud / Peach Breeze, which are told apart by the base.
window.CONTENT.drinkName = function (fruits, base) {
  var f = (fruits || []).slice().sort().join(",");
  if (!f && base == null) return "Mix your own";
  var drinks = window.CONTENT.menu.drinks;
  for (var i = 0; i < drinks.length; i++) {
    var d = drinks[i];
    if (d.fruits.slice().sort().join(",") !== f) continue;
    if (base != null && d.base !== base) continue;
    return d.name;
  }
  return "Mix your own";
};

// Drink render. ONLY the designed drinks (menu.drinks[].image) have a picture. Anything else (undesigned
// named drinks, custom mixes) gets the CUE logo sticker so callers never get a broken path.
// Accepts a drink object, or (fruits, base, addons). Paths are relative to the PRESENTATION root.
window.CONTENT.drinkPhoto = function (a, base) {
  var d = a;
  if (Array.isArray(a)) {
    var nm = window.CONTENT.drinkName(a, base);
    d = window.CONTENT.menu.drinks.filter(function (x) { return x.name === nm; })[0];
  } else if (a && !a.image && a.drinkName) {
    d = window.CONTENT.menu.drinks.filter(function (x) { return x.name === a.drinkName; })[0];
  }
  return (d && d.image) || null;
};
window.CONTENT.drinkImage = function (a, base) {
  return window.CONTENT.drinkPhoto(a, base) || "assets/img/cue-logo.png";
};
