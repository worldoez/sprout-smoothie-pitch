// MENU (PLACEHOLDER names; survey shares come from output/tables). Role 4 + Role 5 own this file.
// pct = share of the 53 usable respondents who chose it (04_fruit/04_base/04_addons.csv).
window.CONTENT = window.CONTENT || {};
window.CONTENT.menu = {
  fruits: [
    { key: "mango",      name: "Mango",      emoji: "🥭", color: "#FFB020", pct: 0.717 },
    { key: "strawberry", name: "Strawberry", emoji: "🍓", color: "#E8364F", pct: 0.604 },
    { key: "banana",     name: "Banana",     emoji: "🍌", color: "#F5D547", pct: 0.472 },
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
  // fancy: PLACEHOLDER "booster" names — team to decide.
  addons: [
    { key: "protein", name: "Protein powder",          fancy: "Muscle Sprout",  price: 5, pct: 0.509 },
    { key: "vitamin", name: "Vitamin boost",           fancy: "Sunshine Shot",  price: 5, pct: 0.491 },
    { key: "energy",  name: "Energy boost (matcha or coffee)", fancy: "Exam Fuel", price: 5, pct: 0.415 },
    { key: "oats",    name: "Oats",                    fancy: "Morning Field",  price: 5, pct: 0.377 }
  ],
  maxAddons: 2,
  // The survey did not ask which size; 74% agree they want a size choice (02_likert_summary.csv).
  sizes: [
    { key: "S", name: "Sprout",  ml: 350, price: 22 },
    { key: "M", name: "Bloom",   ml: 500, price: 25 },
    { key: "L", name: "Harvest", ml: 700, price: 30 }
  ],
  sizeEvidence: { pct: 0.736, text: "74% want a choice of cup size" },
  // 03_candidate_prices.csv — share who would pay at each price
  priceLadder: [
    { price: 25, share: 0.774 }, { price: 28, share: 0.604 }, { price: 30, share: 0.528 },
    { price: 32, share: 0.415 }, { price: 35, share: 0.396 }
  ],
  // Fallback when no live order is found
  exampleOrder: {
    id: "example", name: "Guest", fruits: ["mango", "strawberry"], base: "yogurt",
    addons: ["protein"], size: "M", price: 30, drinkName: "Mango Sunrise", at: "2026-12-01T10:00:00Z", example: true
  }
};

// Helper: a fun drink name from the chosen fruits (PLACEHOLDER naming rule).
window.CONTENT.drinkName = function (fruits) {
  const n = { mango: "Mango", strawberry: "Berry", banana: "Banana", blueberry: "Blue", peach: "Peach" };
  const s = { mango: "Sunrise", strawberry: "Blush", banana: "Boost", blueberry: "Moon", peach: "Breeze" };
  if (!fruits || !fruits.length) return "House Blend";
  return (n[fruits[0]] || "Fruit") + " " + (s[fruits[1] || fruits[0]] || "Splash");
};
