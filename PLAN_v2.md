# Deck v2 plan: crosshatch style + the new team script (draft for approval, nothing built yet)

## 1. The style: "crosshatch" (from cth9191/animate, MIT)
What the repo means by it: a sketchy ink line that **re-draws itself every 2 frames (12 fps "on twos")**, crosshatch / coloured-pencil shading **clipped inside each shape**, light from the top-left, stipple dots, and paper grain. Warm paper by day, a dark "inside the screen" world for app moments. Red pencil dashes = "the plan".

How we reproduce it in our plain-HTML deck (no video render):
- **Line boil:** SVG `feTurbulence` + `feDisplacementMap`, seed stepped every ~83 ms (12 fps). We already have this in `shared/boil.js`; we upgrade the step to 12 fps for the deck and keep it slower on the website.
- **Hatching:** SVG `<pattern>` lines at two angles, clipped to each shape, with a top-left light mask (dense hatch on the bottom-right edge of cups, fruit, monkey).
- **Draw-on:** `pathLength=1` + dashoffset for outlines (the logo straw, map route, price ladder), then fill + hatch fade in.
- **Paper grain:** our existing speckle overlay, re-seeded each boil step.
- **Palette (brand-adapted):** paper `#F6E7D5`, ink = warm charcoal `#25292B`, straw red `#B83A32` for the "plan" dashes and highlights, muted product colours only on fruit. "Inside the app" slides flip to charcoal with peach lines (the repo's navy-world rule).
- **Rule we keep from the repo:** every filled shape gets a texture; the line always boils; day and app worlds must look clearly different; **hatch never on text, charts or photos** (readability for a projector).
- **Less animated than today:** one drawing moment per slide, then stillness except the boil.

## 2. Slide 1 (opener): "the cup gets drawn"
Today: a flat sticker, a chip, a tagline. Proposed (about 15 s, one click to skip ahead):
1. Cream paper with a quick crosshatched sketch of a **cart counter at YIA** (awning, stairwell hint) along the bottom third.
2. A **hand-drawn cup draws itself** on the counter (outline strokes on, then hatch shading), the straw gets its red/cream stripes, four sparkles pop in on twos.
3. The **CUE sticker stamps** onto the cup (slight overshoot, settles).
4. **Cuethie the monkey** (crosshatched, no drink) peeks over the counter and taps a small bell; the heavy "Smoothie" wordmark types in beside the logo (same lockup as the hub), then "Blended fresh on your cue." fades in.
5. Chip becomes a quiet line: team names + course. No pill.

## 3. Storyline from the pasted script (20:00 hard limit)
Speaker owns a section; "Order #1" activity stays near the end. Budgets are targets.

| # | Section | Who | Time | Slides (draft) |
|---|---|---|---|---|
| 0 | Opener | Evan | 0:30 | 1 title (above) |
| 1 | Background & competitors | Family | 2:30 | 2 "Why drinks, why CUHK"; 3 what students drink now (shops chart: canteen/vending lead, specialists small); 4 the gap + the catch (cheap meal add-ons, convenience) |
| 2 | Customer & methodology | Caleb | 2:30 | 5 interview (daily fruit-tea buyer) then survey; 6 66 answers to 55 usable (funnel); 7 what mattered: price, location, taste, health; 8 who buys and why |
| 3 | STP | (name missing, text empty) | 2:00 | 9 segments, 10 target, 11 positioning. **Needs the script.** |
| 4 | Product & place | Uki | 3:00 | 12 three collections with the drink renders; 13 mix your own; 14 Fruit Ticket packaging (clear cups, striped straws, kraft bags); 15 sizes; 16 YIA map (47% each for YIA and Central Campus) |
| 5 | Price & promotion | Icey | 3:30 | 17 spend vs willingness to pay; 18 price ladder / menu architecture; 19 buddy bundle; 20 skip-the-queue app (dark "inside the app" world, live demo: professor places Order #1); 21 music A/B test plan |
| 6 | Conclusion & limits | Idham | 2:00 | 22 what to advertise first (taste, then fresh/less sugar/online ordering); 23 why YIA; 24 what we'd do better (align survey with interviews, near-stratified sampling) |
| 7 | Order #1 reveal + close | Evan | 1:30 | 25 read the order back, 26 thanks / Q&A |

Cut candidates if we run long: slide 4 or 8, the A/B test detail (keep one slide), the Mix-your-own slide.

## 4. Things I found in the script that need a team decision (I will not guess)
1. **Prices and sizes disagree with the app/menu.** Script: Regular 16 oz ~470 ml HK$25 (CUHK ID) / HK$28 (others), Large 20 oz +HK$5, XL 24 oz. App/menu today: one price, 350/500/700 ml at HK$22/25/30. Which is final?
2. **XL step:** "+$5 +$4" vs "10 dollars more" vs table HK$33/37. Which?
3. **Ml values:** 460 vs 470 ml for 16 oz (we should use 473 or just oz).
4. **Respondent count:** script says 53 and "around 70"; our data is 66 raw, 55 usable. Slides must use 55 unless the team re-cuts.
5. **Numbers I can't trace to our tables yet:** median spend HK$10, median WTP HK$30, "92% will pay above usual spend", revenue index 19.3, "45–55% cheaper than chains", 53% hanging out with friends, 49% afternoon treats, 75% lunch peak, 64% vs our 65% pre-order app. I will check each against `output/tables`; anything not found gets flagged, not shown.
6. **Section 3 (STP) is empty** and Caleb's "main potential buyers and why" is blank.
7. The **R&B music link** is a third-party track page; I'd cite it as a source on the slide instead of embedding.
8. "Buy 2, get 10% off" and the CUHK-ID price rule are new offers; the order app has neither yet.

## 5. Build order (once you approve)
1. Update `SCRIPT.md` from the script above, flagged items marked TBD.
2. Crosshatch kit (`shared/hatch.js`: boil at 12 fps, hatch patterns, draw-on helpers, grain re-seed).
3. Slide 1, then one sample content slide in the style for your sign-off.
4. Rebuild the remaining slides in batches (cheaper workers, then I review each in the browser).
5. Re-sync numbers with `tools/sync_data.py`, check the 20:00 timing.
