// PLACES on the CUHK campus for slide 13 (earth → CUHK dart throw).
// key must match a row "key" in output/tables/04_where.csv.
// COORDINATES ARE APPROXIMATE (placeholder): check each one on Google Maps
// (right-click a building → copy the "lat, lng") and paste it here.
// label: "left" or "right" (default) of the dot, to stop labels overlapping.
window.CONTENT = window.CONTENT || {};
window.CONTENT.places = {
  target: "yia",                // where the dart lands (our pick)
  finalZoom: 16.4,              // satellite zoom when the dart lands (higher = closer)
  spots: [
    { key: "yia",          name: "YIA Building",       lat: 22.4160, lng: 114.2093, label: "left" },
    { key: "cc",           name: "Central Campus",     lat: 22.4196, lng: 114.2062, label: "left" },
    { key: "lsk",          name: "LSK Building",       lat: 22.4192, lng: 114.2080 },
    { key: "colleges",     name: "College areas",      lat: 22.4216, lng: 114.2055 },
    { key: "univ_station", name: "University Station", lat: 22.4137, lng: 114.2101 }
  ]
};
