// BRAND — CUE (CUHK smoothie cart). Edit freely; every page reads from here.
window.CONTENT = window.CONTENT || {};
window.CONTENT.brand = {
  name: "CUE",
  slogan: "Blended fresh on your cue.",
  tagline: "Fresh smoothies for CUHK, built from 55 student answers.",
  mascot: { name: "Cue", kind: "monkey" },
  // Logo sticker (dark charcoal oval, cream cup with striped straw). Paths are
  // relative to the PRESENTATION root; pages in subfolders prefix with "../".
  logo: "assets/img/cue-logo.png",
  colors: {
    mango: "#E08A45", leaf: "#6A9467", cream: "#F2D9C2",
    berry: "#9A3E4B", ink: "#25292B", soil: "#4B4239", sky: "#9EC4C0", gold: "#E8C26A",
    charcoal: "#25292B", sun: "#E8C26A", rust: "#C4501E"
  },
  // GitHub repo that stores orders (data/orders.json). Fill in after creating the repo.
  // Unused since orders moved to the live relay (shared/orders.js); kept for reference.
  repo: { owner: "worldoez", name: "cue-smoothie-pitch", branch: "main", path: "data/orders.json" },
  // Drop files into assets/audio/ with these names. Missing files fall back to synth sounds.
  audio: {
    brandSong: "assets/audio/brand-song.mp3",
    loops: {
      plant: "assets/audio/loop-plant.mp3", water: "assets/audio/loop-water.mp3",
      harvest: "assets/audio/loop-harvest.mp3", blend: "assets/audio/loop-blend.mp3",
      pour: "assets/audio/loop-pour.mp3", serve: "assets/audio/loop-serve.mp3",
      cheers: "assets/audio/loop-cheers.mp3"
    }
  }
};
