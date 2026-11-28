# CUE design direction (all pages)

**Style: flat cartoon with one soft shading layer** (think Mixue / Coco Fresh Tea, not SaaS).
Bold dark outlines (#2A1A10, 4–6 px at 1920 scale), flat fills, ONE highlight + ONE shadow shape per object (no multi-stop gradients on characters), chunky rounded shapes, big friendly type. Soft-3D (Pixar-style) only for AI-rendered still images that the team drops into `assets/img/`.

## Logo theme (2026-11-28)
Palette follows the CUE logo: charcoal #25292B + peach cream #F2D9C2, muted vintage accents (rust/apricot, sage, dusty teal, mustard). Soft Fraunces (SOFT 100) for Cooper-like type, speckle grain overlay on the deck stage, thin inset rule on slides. Mascot Cuethie is a monkey (brown fur, peach face, CUE tee, curled tail, head tuft = `.mo-leaf`).

## Tokens (shared/base.css)
mango #E08A45 · leaf #6A9467 · cream #F2D9C2 · berry #9A3E4B · ink #25292B · gold #E8C26A · sky #9EC4C0
Display: Fraunces 900 (headlines, prices, big numbers). Body: DM Sans.

## Brand references
- Mixue (my.mixue.com): red/white mascot-led, huge product shots, stamp-like badges, playful but disciplined grid.
- Coco Fresh Tea (cocofreshtea.ca): product photography on solid colour fields, category tabs, clean menu cards.
- Order-app references: home with greeting + search + category chips + product cards; product detail with large drink, size/sweetness/ice/add-ons, quantity stepper, sticky "Add to bag"; bag; checkout; bottom tab bar.

## Anti-slop rules (from frontend-design / taste / impeccable skills)
- One bold idea per screen; everything else quiet. No decoration that carries no meaning.
- No ALL-CAPS eyebrow labels, no "→" appended to every button, no "A · B · C" meta strings, no identical rounded card grids with grey shadows, no gradient washes as background decoration, no emoji used as UI icons (use simple inline SVG icons).
- Copy: plain, specific, sentence case, active verbs. Button says exactly what happens ("Add to bag", "Place order").
- Real hierarchy: price and product name biggest; survey numbers shown as small, honest badges ("72% of students picked mango").
- Motion answers an action or tells the story; entrances ≤ 0.5 s, story beats ≤ 3 s; respect prefers-reduced-motion on web pages.
- Touch targets ≥ 44 px; visible keyboard focus; works at 360 px wide with 16 px gutters, no horizontal scroll.
- Never write "for the professor" / "Professor, …" in on-screen copy. The person's own typed name may appear on their order.
