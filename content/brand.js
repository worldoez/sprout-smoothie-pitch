// BRAND (PLACEHOLDER) — edit freely; every page reads from here.
window.CONTENT = window.CONTENT || {};
window.CONTENT.brand = {
  name: "Sprout",
  slogan: "Grown from what you told us.",
  tagline: "Fresh smoothies for CUHK, built from 53 student answers.",
  mascot: { name: "Mo", kind: "mango" },
  colors: {
    mango: "#FF8A1F", leaf: "#2FA84F", cream: "#FFF4E2",
    berry: "#B0244A", ink: "#2A1A10", soil: "#5B3A22", sky: "#8FD3F4", gold: "#F6C445"
  },
  // GitHub repo that stores orders (data/orders.json). Fill in after creating the repo.
  // Unused since orders moved to the live relay (shared/orders.js); kept for reference.
  repo: { owner: "worldoez", name: "sprout-smoothie-pitch", branch: "main", path: "data/orders.json" },
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
