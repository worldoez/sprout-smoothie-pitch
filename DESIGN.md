# CUE design direction v2 — "printed label" (2026-11-28)

The logo is the brief: a charcoal speckled sticker, peach ink, thin inset ring, soft Cooper-like lettering, a striped straw, four sparkles. Everything (hub, website, order app, deck) must look like it was printed on that sticker. **Mature, quiet, crafted. Not cartoon, not childish, not "app template".**

## Tokens (shared/base.css — use the variables, never hard-code hexes)
| Role | Token | Hex |
| --- | --- | --- |
| Ink / dark ground | `--charcoal` (`--charcoal-2` #2F3436, `--charcoal-3` #3B4144) | #25292B |
| Paper / light ground | `--peach` (`--paper` #F8EBDA, `--paper-2` #EBCDB1) | #F2D9C2 |
| Accent (actions, prices, one highlight) | `--straw` | #B83A32 |
| Hairlines | `--rule` (on dark) / `--rule-ink` (on light) | peach/charcoal @ 22% / 18% |
| Drink identity only | `--p-mango` #E3B23C, `--p-matcha` #9BB36A, `--p-berry` #B5506A, `--p-plum` #6B3F7A | never decoration |

Type: **Fraunces** (soft, weight 800 for headlines/prices — echoes the logo's lettering) + **Hanken Grotesk** (body/UI). Sentence case. Line length < 70ch. No ALL-CAPS labels, no mono data labels.

## Form language
- Flat colour, hairline (1px) rules, 10–16px radii. **No** thick dark outlines, **no** hard offset "3D" shadows, **no** blobs, **no** floating fruit, **no** emoji as UI, **no** gradient washes, **no** identical rounded-card grids with grey shadows, **no** "→" on every button, **no** middle-dot meta strings.
- Dark sections (charcoal + speckle grain) alternate with peach sections. Structure comes from hairlines and spacing, not boxes.
- The **logo sticker** (`assets/img/cue-logo.png`) and the **drink renders** are the heroes. Render files (transparent PNG on peach-cream, product shot of the logo cup):
  - `assets/img/drinks/mango.png` — yellow mango smoothie
  - `assets/img/drinks/matcha.png` — green matcha/banana smoothie
  - `assets/img/drinks/berry-layers.png` — layered strawberry / yogurt / blueberry
  Use them large, uncropped, on peach (`--peach`/`--paper`) or on charcoal with a soft ellipse of `--paper-2` behind. Mapping (shared helper `CONTENT.drinkImage(drink|fruits[,base])` in content/menu.js): matcha addon → matcha; strawberry or blueberry (not mango-only) → berry-layers; otherwise → mango; no fruit (Coffee Oat) → the logo sticker.
- The sparkle (4-point star from the logo) is the only ornament; use sparingly as a bullet/separator, drawn as inline SVG.
- Product colours appear only as small chips on a drink (a 10px dot), never as section backgrounds.

## Motion (Emil-style restraint)
- Default is still. One orchestrated entrance per page at most, ≤ 400 ms, ease-out. Hover/press: colour or 1–2 px translate only. No bobbing, waving, floating, bouncing, confetti-spam. Respect `prefers-reduced-motion`.
- **Cel-line boil** (shared/boil.js, class `.boil`): the single signature motion. Apply ONLY to small line art — logo sticker, mascot, step icons, map outlines — so ink outlines jitter a few times a second like hand-inked cels. Never on text, photos/renders, or whole screens.

## Components
- Buttons: `.btn` (straw red), `.btn.solid` (peach on dark), `.btn.ghost` (hairline). 46px+ tall (44px touch minimum), verb labels ("Add to bag", "Place order").
- Lists/menus: name left, dotted hairline, price right in Fraunces; description below in soft text.
- Facts: large Fraunces numeral + one plain sentence, separated by hairlines, in a row — not stamped cards.
- Forms: 1px hairline inputs, 48px high, focus = straw-red 2px outline.

## Copy
Plain, specific, sentence case, active verbs. Never write "for the professor". Numbers must come from `content/data.js` / `output/tables`. Never invent a number or a price.
