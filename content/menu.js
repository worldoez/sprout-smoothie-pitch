// MENU — the CUE menu, single source of truth. Role 4 + Role 5 own this file.
// pct = share of the 55 usable respondents who chose it (04_fruit/04_base/04_addons.csv).
// Never invent a survey number, never invent a price (Morning Blends are still "to be confirmed").
window.CONTENT = window.CONTENT || {};
window.CONTENT.menu = {
  fruits: [
    { key: "mango",      name: "Mango",      emoji: "🥭", color: "#FFB020", pct: 0.717 },
    { key: "strawberry", name: "Strawberry", emoji: "🍓", color: "#E8364F", pct: 0.604 },
    { key: "banana",     name: "Banana",     emoji: "🍌", color: "#E8C26A", pct: 0.472 },
    { key: "blueberry",  name: "Blueberry",  emoji: "🫐", color: "#4F5BD5", pct: 0.377 },
    { key: "peach",      name: "Peach",      emoji: "🍑", color: "#FF9E7A", pct: 0.358 }
  ],
  maxFruits: 2,
  bases: [
    { key: "yogurt",     name: "Yogurt",       pct: 0.528 },
    { key: "juice",      name: "Fruit juice",  pct: 0.528 },
    { key: "fresh_milk", name: "Fresh milk",   pct: 0.434 },
    { key: "coconut",    name: "Coconut milk", pct: 0.302 }
  ],
  // Boosts: plain names only. fancy is kept populated (= name) so older slide
  // code reading .fancy keeps working.
  // Survey only asked about a combined energy boost (matcha or coffee): one
  // share for both, with pctNote. Do not split it.
  addons: [
    { key: "protein", name: "Protein powder", fancy: "Protein powder", price: 5, pct: 0.509 },
    { key: "vitamin", name: "Vitamins",        fancy: "Vitamins",        price: 5, pct: 0.491 },
    { key: "matcha",  name: "Matcha",          fancy: "Matcha",          price: 5, pct: 0.415,
      pctNote: "energy boost (matcha or coffee) combined" },
    { key: "coffee",  name: "Coffee",          fancy: "Coffee",          price: 5, pct: 0.415,
      pctNote: "energy boost (matcha or coffee) combined" },
    { key: "oats",    name: "Oats",            fancy: "Oats",            price: 5, pct: 0.377 }
  ],
  maxAddons: 2,
  // The survey did not ask which size; 74% agree they want a size choice (02_likert_summary.csv).
  sizes: [
    { key: "S", name: "350 ml", ml: 350, price: 22 },
    { key: "M", name: "500 ml", ml: 500, price: 25 },
    { key: "L", name: "700 ml", ml: 700, price: 30 }
  ],
  sizeEvidence: { pct: 0.736, text: "74% want a choice of cup size" },
  // 03_candidate_prices.csv — share who would pay at each price
  priceLadder: [
    { price: 25, share: 0.774 }, { price: 28, share: 0.604 }, { price: 30, share: 0.528 },
    { price: 32, share: 0.415 }, { price: 35, share: 0.396 }
  ],
  // Menu sections. priceText (never a number) instead of price where the team
  // has not confirmed pricing yet.
  sections: [
    { key: "layers",   title: "CUE Layers",     ml: 500, price: 25 },
    { key: "classics", title: "Fruit Classics", ml: 500, price: 25 },
    { key: "morning",  title: "Morning Blends", priceText: "to be confirmed" }
  ],
  // Named drinks. section is the title in menu.sections above.
  drinks: [
    // CUE Layers — 500 ml, HK$25
    { name: "Mango Sunrise", section: "CUE Layers", signature: true,
      desc: "Strawberry purée, plain yogurt, mango slush.",
      fruits: ["strawberry", "mango"], base: "yogurt", addons: [] },
    { name: "Berry Dusk", section: "CUE Layers",
      desc: "Blueberry purée, yogurt, strawberry slush.",
      fruits: ["blueberry", "strawberry"], base: "yogurt", addons: [] },
    { name: "Peach Cloud", section: "CUE Layers",
      desc: "Peach purée, coconut milk, mango slush.",
      fruits: ["peach", "mango"], base: "coconut", addons: [] },
    // Fruit Classics — 500 ml, HK$25
    { name: "Berry Blush", section: "Fruit Classics",
      desc: "Strawberry, blueberry, fresh milk.",
      fruits: ["strawberry", "blueberry"], base: "fresh_milk", addons: [] },
    { name: "Banana Boost", section: "Fruit Classics",
      desc: "Banana, mango, fresh milk.",
      fruits: ["banana", "mango"], base: "fresh_milk", addons: [] },
    { name: "Peach Breeze", section: "Fruit Classics",
      desc: "Peach, mango, fruit juice.",
      fruits: ["peach", "mango"], base: "juice", addons: [] },
    { name: "Blue Moon", section: "Fruit Classics",
      desc: "Blueberry, banana, yogurt.",
      fruits: ["blueberry", "banana"], base: "yogurt", addons: [] },
    // Morning Blends — price to be confirmed (no number, ever)
    { name: "Matcha Banana", section: "Morning Blends",
      desc: "Matcha, banana, fresh milk.",
      fruits: ["banana"], base: "fresh_milk", addons: ["matcha"] },
    { name: "Coffee Oat", section: "Morning Blends",
      desc: "Coffee, oats, fresh milk.",
      fruits: [], base: "fresh_milk", addons: ["coffee", "oats"] },
    { name: "Berry Oat", section: "Morning Blends",
      desc: "Strawberry, oats, yogurt.",
      fruits: ["strawberry"], base: "yogurt", addons: ["oats"] }
  ],
  // Mix your own: pick 1–2 fruits, pick 1 base, up to 2 boosts at +HK$5 each,
  // sizes 350 ml HK$22 / 500 ml HK$25 / 700 ml HK$30 (see sizes above).
  pickupLine: "Pick up at YIA · Ground floor · smoothie cart",
  // Fallback when no live order is found
  exampleOrder: {
    id: "example", name: "Professor", fruits: ["mango", "strawberry"], base: "yogurt",
    addons: [], size: "M", price: 25, drinkName: "Mango Sunrise", at: "2026-12-01T10:00:00Z", example: true
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
