/* Slide 13 (Blend, Role 4): PLACE — a dart flies from outer space at a real 3D Earth,
   dives into real satellite imagery of CUHK, sticks into our pick, then the photo
   turns into the deck's animated style and the survey hotspots pop up.

   Click 1 (entry): Earth in space, slowly turning.
   Click 2: the dart flies in, the camera dives to Hong Kong, then satellite zoom to CUHK, THUNK.
   Click 3: building-level close-up of our pick + "Why here?" card.
   Click 4: pull back; the satellite photo turns "animated"; hotspots + survey shares pop in.
   Click 5: the verdict card.

   Libraries: three.js r128 (globe), Leaflet 1.9.4 + Esri World Imagery tiles (satellite).
   Places/coordinates: content/places.js. Textures: assets/img/earth/ (NASA Blue Marble).
   Needs internet for the satellite tiles; without it the slide still shows the globe + hotspots. */
(function () {
  const P = () => CONTENT.places;
  const where = () => Object.fromEntries((CONTENT.data["04_where"] || []).map(r => [r.key, r]));
  const DEG = Math.PI / 180;
  const ESRI = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

  // A dart seen from behind (flying away from us into the screen) and from the side (stuck in).
  const dartBack = `<svg viewBox="-100 -100 200 200" width="200" height="200" style="overflow:visible">
    <g class="spin">
      <path d="M0 0 L-70 -70 Q-40 -88 -12 -60 Z" fill="#9A3E4B" stroke="#25292B" stroke-width="5"/>
      <path d="M0 0 L70 -70 Q88 -40 60 -12 Z" fill="#E08A45" stroke="#25292B" stroke-width="5"/>
      <path d="M0 0 L70 70 Q40 88 12 60 Z" fill="#9A3E4B" stroke="#25292B" stroke-width="5"/>
      <path d="M0 0 L-70 70 Q-88 40 -60 12 Z" fill="#E08A45" stroke="#25292B" stroke-width="5"/>
      <circle r="18" fill="#25292B"/><circle r="8" fill="#C9CED6"/>
    </g></svg>`;
  const dartSide = `<svg viewBox="0 0 320 120" width="320" height="120" style="overflow:visible">
    <g class="wob" style="transform-origin:0px 60px">
      <path d="M0 60 L60 52 L60 68 Z" fill="#C9CED6" stroke="#25292B" stroke-width="4"/>
      <rect x="58" y="48" width="120" height="24" rx="10" fill="#25292B"/>
      <rect x="80" y="50" width="16" height="20" fill="#E8C26A"/><rect x="120" y="50" width="16" height="20" fill="#E8C26A"/>
      <rect x="176" y="55" width="50" height="10" fill="#4B4239"/>
      <path d="M220 60 L310 6 L300 60 Z" fill="#9A3E4B" stroke="#25292B" stroke-width="4"/>
      <path d="M220 60 L310 114 L300 60 Z" fill="#E08A45" stroke="#25292B" stroke-width="4"/>
    </g></svg>`;

  // ---------- 3D globe ----------
  function makeGlobe(canvas) {
    if (!window.THREE) return null;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(1920, 1080, false);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1920 / 1080, 0.01, 100);
    camera.position.set(0, 0, 6.2);
    const loader = new THREE.TextureLoader();
    const tilt = new THREE.Group(); scene.add(tilt);
    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(1, 128, 128),
      new THREE.MeshPhongMaterial({
        map: loader.load("../assets/img/earth/earth-blue-marble.jpg"),
        bumpMap: loader.load("../assets/img/earth/earth-topology.png"),
        bumpScale: 0.04, specular: new THREE.Color(0x333333), shininess: 14
      }));
    tilt.add(earth);
    // Atmosphere glow (fresnel rim)
    const glow = new THREE.Mesh(new THREE.SphereGeometry(1.08, 64, 64), new THREE.ShaderMaterial({
      vertexShader: "varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
      fragmentShader: "varying vec3 vN; void main(){ float i = pow(0.72 - dot(vN, vec3(0.0,0.0,1.0)), 3.0); gl_FragColor = vec4(0.35,0.7,1.0,1.0) * i; }",
      side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true
    }));
    scene.add(glow);
    scene.add(new THREE.AmbientLight(0x666677));
    const sun = new THREE.DirectionalLight(0xffffff, 1.0); sun.position.set(-4, 2, 5); scene.add(sun);
    earth.rotation.y = -(0 + 90) * DEG;     // start over the Atlantic/Africa
    tilt.rotation.x = 10 * DEG;
    const g = { renderer, scene, camera, earth, tilt, spinning: true, alive: true };
    (function loop() {
      if (!g.alive || !canvas.isConnected) { g.alive = false; renderer.dispose(); return; }
      if (g.spinning) earth.rotation.y += 0.0012;
      renderer.render(scene, camera);
      requestAnimationFrame(loop);
    })();
    return g;
  }

  // ---------- satellite map ----------
  function makeMap(div) {
    if (!window.L) return null;
    const t = P().spots.find(s => s.key === P().target);
    const map = L.map(div, { zoomControl: false, attributionControl: true, dragging: false, scrollWheelZoom: false, doubleClickZoom: false,
      boxZoom: false, keyboard: false, touchZoom: false, zoomSnap: 0, fadeAnimation: true, inertia: false });
    L.tileLayer(ESRI, { maxZoom: 19, attribution: "Imagery © Esri, Maxar, Earthstar Geographics" }).addTo(map);
    map.setView([t.lat, t.lng], 6, { animate: false });
    prefetchTiles(t.lat, t.lng);
    return { map, t };
  }

  // Download the satellite tiles the dive will need (zoom 6 → 17) into the browser cache,
  // so the fly-in shows imagery instead of dark gaps. Runs once per page load.
  let prefetched = false;
  function prefetchTiles(lat, lng) {
    if (prefetched) return; prefetched = true;
    window._cueTiles = [];
    // landing zooms first (what the audience stares at), then the fly-through zooms
    for (const z of [18, 16, 17, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6]) {
      const n = 2 ** z, x = Math.floor((lng + 180) / 360 * n);
      const r = lat * DEG, y = Math.floor((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * n);
      const rx = z >= 16 ? 4 : z >= 12 ? 3 : 2, ry = z >= 16 ? 3 : z >= 12 ? 2 : 1;
      for (let dx = -rx; dx <= rx; dx++) for (let dy = -ry; dy <= ry; dy++) {
        const img = new Image(); img.src = ESRI.replace("{z}", z).replace("{y}", y + dy).replace("{x}", x + dx); window._cueTiles.push(img);
      }
    }
  }
  // Start prefetching as soon as the deck loads (well before slide 13).
  window.addEventListener("load", () => setTimeout(() => { const t = P().spots.find(s => s.key === P().target); if (t) prefetchTiles(t.lat, t.lng); }, 1500));

  Deck.add({
    n: 13, stage: "blend", title: "Place: a dart from space", budget: 50,
    notes: "Role 4. Click 2: the dart flies from space into CUHK and sticks at YIA (pause on the thunk).\nClick 3: close-up of YIA and why it works.\nClick 4: the photo turns animated; the hotspots are where students want the shop: YIA 47% and Central Campus 45% lead, colleges 36%.\nClick 5: the verdict. Coordinates are approximate placeholders in content/places.js.",
    html: () => `
      <div class="space" style="position:absolute;inset:0;background:#02040A url(../assets/img/earth/night-sky.png) center/cover"></div>
      <canvas class="globe3d" width="1920" height="1080" style="position:absolute;inset:0;width:1920px;height:1080px"></canvas>
      <div class="sat" style="position:absolute;inset:0;opacity:0;background:#0B1B33"></div>
      <div class="toon" style="position:absolute;inset:0;opacity:0;pointer-events:none;background:rgba(255,244,226,.42);mix-blend-mode:normal"></div>
      <svg class="hot" viewBox="0 0 1920 1080" style="position:absolute;inset:0;width:1920px;height:1080px;pointer-events:none"></svg>
      <div class="flash" style="position:absolute;inset:0;background:#F8EBDA;opacity:0;pointer-events:none"></div>
      <div class="dart-back" style="position:absolute;left:0;top:0;width:200px;height:200px;margin:-100px 0 0 -100px;opacity:0;pointer-events:none">${dartBack}</div>
      <div class="dart-side" style="position:absolute;left:960px;top:540px;width:320px;height:120px;margin:-60px 0 0 0;transform-origin:0 50%;opacity:0;pointer-events:none;filter:drop-shadow(0 18px 10px rgba(0,0,0,.45))">${dartSide}</div>
      <div class="ring" style="position:absolute;left:960px;top:540px;width:40px;height:40px;margin:-20px;border-radius:50%;border:8px solid #F8EBDA;opacity:0;pointer-events:none"></div>
      <div class="head" style="position:absolute;left:110px;top:90px;color:#F2D9C2;text-shadow:0 4px 24px rgba(0,0,0,.6)">
        <div class="s-kicker" style="color:#E8C26A">Blend: place</div>
        <h2 class="s-title" style="font-size:110px;margin-top:10px">Where should<br>CUE live?</h2>
      </div>
      <div class="why order-card" style="left:90px;top:110px;width:680px;opacity:0"></div>
      <div class="verdict order-card" style="left:90px;bottom:90px;width:660px;opacity:0">
        <div class="who">Our pick</div><h4 class="vt">YIA Building</h4>
        <div class="vlines"></div>
        <div class="src">04_where.csv (n = ${Kit.nUsable()}). Students passing between University Station and classes. Second cart at Central Campus in phase 2.</div>
      </div>
      <div class="source" style="color:#F2D9C2;text-shadow:0 2px 8px rgba(0,0,0,.6)">Earth: NASA Blue Marble. Satellite: Esri World Imagery. Data: 04_where.csv</div>`,
    steps: [
      // 1. Earth in space
      (el) => {
        const g = makeGlobe(el.querySelector(".globe3d")); el._g = g;
        el._m = makeMap(el.querySelector(".sat"));
        const tl = gsap.timeline()
          .from(el.querySelector(".globe3d"), { opacity: 0, scale: 0.6, duration: 1.2, ease: "power3.out" })
          .from(el.querySelector(".head"), { x: -60, opacity: 0, duration: 0.6, ease: "power3.out" }, 0.3);
        if (g) tl.from(g.camera.position, { z: 11, duration: 1.6, ease: "power3.out" }, 0);
        return tl;
      },
      // 2. Dart from space → dive → satellite → THUNK
      (el) => {
        const g = el._g, m = el._m, P0 = P(), t = P0.spots.find(s => s.key === P0.target);
        const db = el.querySelector(".dart-back");
        const tl = gsap.timeline({ onComplete: () => { if (m) { m.map.stop(); m.map.setView([t.lat, t.lng], P0.landZoom || 17.8, { animate: false }); } } });
        tl.to(el.querySelector(".head"), { opacity: 0, x: -60, duration: 0.4 }, 0)
          .add(() => Deck.ctx.sfx("dartflight"), 0)
          .fromTo(db, { x: 2050, y: 1250, scale: 3.4, opacity: 1 }, { x: 960, y: 540, scale: 0.42, duration: 1.7, ease: "power2.in" }, 0)
          .fromTo(db.querySelector(".spin"), { rotate: 0 }, { rotate: 900, duration: 4.6, ease: "none", transformOrigin: "50% 50%" }, 0);
        if (g) {
          g.spinning = false;
          // rotate the shortest way so CUHK faces the camera, then dive
          const target = -(t.lng + 90) * DEG; let cur = g.earth.rotation.y;
          const twoPi = Math.PI * 2; const delta = ((target - cur) % twoPi + twoPi * 1.5) % twoPi - Math.PI;
          tl.to(g.earth.rotation, { y: cur + delta, duration: 1.8, ease: "power2.inOut" }, 0)
            .to(g.tilt.rotation, { x: t.lat * DEG, duration: 1.8, ease: "power2.inOut" }, 0)
            .to(g.camera.position, { z: 1.32, duration: 2.0, ease: "power3.in" }, 0.3);
        }
        tl.to(el.querySelector(".flash"), { opacity: 0.55, duration: 0.15 }, 2.15)
          .to(el.querySelector(".sat"), { opacity: 1, duration: 0.3 }, 2.2)
          .to(el.querySelector(".flash"), { opacity: 0, duration: 0.5 }, 2.3)
          .to(el.querySelector(".globe3d"), { opacity: 0, duration: 0.3 }, 2.25)
          .add(() => { if (m) { m.map.setView([t.lat, t.lng], 6, { animate: false }); m.map.flyTo([t.lat, t.lng], P0.landZoom || 17.8, { duration: 2.3, easeLinearity: 0.1 }); } }, 2.2)
          .to(db, { scale: 0.22, duration: 2.3, ease: "power1.in" }, 2.2)
          // impact
          .set(db, { opacity: 0 }, 4.55)
          .fromTo(el.querySelector(".dart-side"), { opacity: 1, x: 220, y: -260, rotate: -38, scale: 1.25 }, { x: 0, y: 0, rotate: -32, scale: 1, duration: 0.12, ease: "power4.in", immediateRender: false }, 4.45)
          .add(() => Deck.ctx.sfx("thunk"), 4.57)
          .fromTo(el.querySelector(".ring"), { scale: 0.3, opacity: 1 }, { scale: 9, opacity: 0, duration: 0.7, ease: "power2.out" }, 4.57)
          .fromTo(el.querySelector(".dart-side .wob"), { rotate: 0 }, { rotate: 7, duration: 0.07, yoyo: true, repeat: 9, ease: "sine.inOut" }, 4.6)
          .to(el.querySelector(".sat"), { x: 10, duration: 0.05, yoyo: true, repeat: 5 }, 4.57);
        return tl;
      },
      // 3. Close-up: why this spot (building level)
      (el) => {
        const W = where(), L = (CONTENT.data["02_likert_summary"] || []).find(r => /pre-order/i.test(r.item));
        const t = P().spots.find(s => s.key === P().target), st = W.univ_station;
        el.querySelector(".why").innerHTML = `<div class="who">Close-up</div><h4>Why ${t.name}?</h4>
          <div class="line"><span>Students who want the shop here</span><span class="ev">${W[t.key] ? Math.round(W[t.key].pct * 100) + "%" : ""}</span></div>
          ${st ? `<div class="line"><span>University Station, next door</span><span class="ev">${Math.round(st.pct * 100)}%</span></div>` : ""}
          ${L ? `<div class="line"><span>Would pre-order and pick up on the way</span><span class="ev">${Math.round(L.pct_agree * 100)}%</span></div>` : ""}
          <div class="src">04_where.csv, 02_likert_summary.csv (n = ${Kit.nUsable()})</div>`;
        return gsap.timeline()
          .fromTo(el.querySelector(".why"), { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: 0.5, ease: "back.out(1.8)" })
          .fromTo(el.querySelector(".ring"), { scale: 0.3, opacity: 0.9 }, { scale: 5, opacity: 0, duration: 1.1, ease: "power2.out", repeat: 1 }, 0)
          .add(() => Deck.ctx.sfx("chime"), 0.1);
      },
      // 4. Pull back: satellite photo turns "animated" + hotspots for every option
      (el) => {
        const m = el._m, W = where(), svg = el.querySelector(".hot"), P0 = P();
        gsap.to(el.querySelector(".why"), { opacity: 0, x: -60, duration: 0.3 });
        gsap.to(el.querySelector(".dart-side"), { scale: 0.6, duration: 0.6, ease: "power2.inOut" });
        if (m) { m.map.stop(); const t = P0.spots.find(s => s.key === P0.target); m.map.setView([t.lat, t.lng], P0.finalZoom, { animate: false });
          // the map jumps to the wider zoom; scaling it from the old size back to 1 reads as a smooth pull-back
          gsap.fromTo(el.querySelector(".sat"), { scale: 2 ** ((P0.landZoom || 17.8) - P0.finalZoom), transformOrigin: "50% 50%" }, { scale: 1, duration: 0.9, ease: "power3.inOut" }); }
        const pt = (s) => m ? m.map.latLngToContainerPoint([s.lat, s.lng]) : { x: 960 + (s.lng - 114.2093) * 9000, y: 540 - (s.lat - 22.416) * 9000 };
        svg.innerHTML = P0.spots.map(s => {
          const p = pt(s), r = W[s.key] ? W[s.key].pct : 0, on = s.key === P0.target, lab = `${s.name} ${Math.round(r * 100)}%`;
          const lw = lab.length * 17 + 40, lx = (s.label === "left" || p.x > 1500) ? p.x - lw - 40 : p.x + 40;
          return `<g class="hs" data-k="${s.key}">
            <circle cx="${p.x}" cy="${p.y}" r="${40 + r * 160}" fill="${on ? "#E08A45" : "#E8C26A"}" fill-opacity=".38" stroke="${on ? "#9A3E4B" : "#25292B"}" stroke-width="${on ? 8 : 4}" stroke-dasharray="${on ? "0" : "12 10"}"/>
            <circle cx="${p.x}" cy="${p.y}" r="14" fill="#9A3E4B" stroke="#F8EBDA" stroke-width="5"/>
            <g class="lab"><rect x="${lx}" y="${p.y - 64}" rx="22" width="${lw}" height="52" fill="#F8EBDA" stroke="#25292B" stroke-width="4"/>
            <text x="${lx + 20}" y="${p.y - 28}" font-family="DM Sans, sans-serif" font-weight="700" font-size="30" fill="#25292B">${lab}</text></g></g>`;
        }).join("");
        const tl = gsap.timeline()
          .to(el.querySelector(".sat"), { filter: "saturate(0.35) contrast(1.15) brightness(1.1) blur(1px)", duration: 0.8 }, 0)
          .to(el.querySelector(".toon"), { opacity: 1, duration: 0.8 }, 0)
          .add(() => Deck.ctx.sfx("sparkle"), 0.3);
        svg.querySelectorAll(".hs").forEach((h, i) => tl.from(h, { scale: 0, transformOrigin: "50% 50%", opacity: 0, duration: 0.45, ease: "back.out(2.2)" }, 0.4 + i * 0.14).add(() => Deck.ctx.sfx("pop"), 0.4 + i * 0.14));
        const tgt = svg.querySelector(`.hs[data-k="${P0.target}"] circle`);
        if (tgt) tl.add(() => gsap.to(tgt, { attr: { r: "+=26" }, duration: 0.6, yoyo: true, repeat: -1, ease: "sine.inOut" }), 1.4);
        return tl;
      },
      // 4. Verdict
      (el) => {
        const W = where(), P0 = P();
        el.querySelector(".vlines").innerHTML = P0.spots.filter(s => W[s.key]).sort((a, b) => W[b.key].pct - W[a.key].pct).slice(0, 3)
          .map(s => `<div class="line"><span>${s.name}${s.key === P0.target ? " (our pick)" : ""}</span><span class="ev">${Math.round(W[s.key].pct * 100)}%</span></div>`).join("");
        return gsap.timeline().fromTo(el.querySelector(".verdict"), { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.5, ease: "back.out(2)" });
      }
    ],
    printFix: (el) => {
      gsap.set(el.querySelectorAll(".dart-back, .flash, .ring, .why"), { opacity: 0 });
      gsap.set(el.querySelector(".dart-side"), { scale: 0.6 });
      gsap.set(el.querySelector(".dart-side"), { opacity: 1, x: 0, y: 0, rotate: -32 });
    }
  });
})();
