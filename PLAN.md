# CUE Pitch Site: Build Plan

*As of 2026-11-26. Role 7 owns this file. Everything marked PLACEHOLDER can be swapped without code changes.*

We are building one static GitHub Pages site. It holds an animated farm-to-cup pitch deck that runs at most 20 minutes, plus a phone order app. The professor's live "Order #1" from the app appears inside the deck.

---

## 1. Goals and constraints

- **Time:** 20:00 hard limit. The deck runs 17:50 of talk (including the 0:45 audience game and the 0:40 background slide), leaving about 2:10 of buffer. Each animation beat lasts 3 s or less and plays *while the speaker talks*. One click skips any beat.
- **Hosting:** GitHub Pages, static files only. There is no build step: edit a file, push, done.
- **Submission:** the live HTML link is the primary file. We also produce a PDF (the final frame of every slide) and a PPTX with each animated slide embedded as an MP4.
- **Evidence:** every product choice in the deck cites a survey number from `../output/tables/*.csv` or a figure from `../output/figures/`.
- **Placeholders:** brand, mascot, music, images and copy are placeholders kept in `content/`.

## 2. Site map

| Page | Path | What it does |
| --- | --- | --- |
| Hub | `/index.html` | Animated brand splash with three doors: View website, Order on your phone, View pitch |
| Product website | `/site/` | Launch-style landing page: hero, menu, "built from your answers" stats, find us, order button |
| Order app | `/order/` | Mobile-first ordering flow: name → fruit → base → add-ons → size → price → pickup ticket. On a laptop it shows inside a phone frame. Every option shows its survey share. |
| Pitch deck | `/deck/` | Animated slideshow with a Google Slides-style toolbar, section timer, audio, Export and Reload Order |
| Survey copy | `/survey/` | Read-only HTML copy of the Google Form (QR code on the Water slides) |

## 3. Placeholder brand and look (PLACEHOLDER)

- **Name:** **CUE** (CUHK smoothie cart). **Slogan:** "Your smoothie, on cue." Logo sticker: `assets/img/cue-logo.png` (dark charcoal oval, cream cup, striped straw, sparkles).
- **Mascot:** "Cue", a monkey in a CUE tee (holding the CUE cup) with big eyes and stubby arms, drawn in SVG with separate limbs so it can be animated. It can later be replaced by an AI or hand-drawn SVG, a Lottie file or a PNG sequence.
- **Colour:** mango `#FF8A1F`, leaf `#2FA84F`, cream `#FFF4E2`, berry `#B0244A` (a nod to the red Canva template), ink `#2A1A10`.
- **Type:** Fraunces (soft serif display, echoes the Canva headlines) and DM Sans (body, data).
- **What we keep from Canva:** big serif titles, fruit cut-outs and leaves at the edges, a large product image beside short text.
- **What we change:** each stage gets its own colour mood: soil for Plant, sky for Water, golden field for Harvest, orange for Blend, berry for Pour, cream counter for Serve, confetti pink for Cheers. The fruit *moves*.

## 4. Deck storyline, slide by slide

There are 22 slides in 7 stages, running 17:50 of talk (including the 0:45 audience game and the 0:40 background slide). That leaves 2:10 of buffer under 20:00. On each click a short animation plays (3 s or less), then the text points appear while the speaker keeps talking.

| # | Stage (role) | Slide | Time | Clicks: animation, then text | Audio | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Plant (R1) | Brand intro | 0:20 | Fruit orbits the logo in a loop; the slogan types itself | Brand theme, quiet | none |
| 2 | Plant (R1) | Cue walks out | 0:20 | Cue walks in holding a cup, spins and shows it off | Footsteps, ta-da | none |
| 3 | Plant (R1) | The spill | 0:20 | Cue trips, the cup flies, the smoothie splats across the screen; "Oh no!" | Whoosh, splat | none |
| 4 | Plant (R1) | Let's grow something new | 0:40 | Splat wipes into the title; QR code for the professor's Order #1 | Riser, pop | none |
| 5 | Plant (R1) | The seed: the idea and Booster Juice | 0:45 | A seed drops, a sprout pops; Booster Juice inspiration card | Seed drop, Plant loop | external facts |
| 5.5 | Plant (R1) | Why CUHK, why now | 0:40 | Big "~25,000 people on campus every day" stat with three background points | none | external facts: CUHK Facts & Figures; Finance Office outlet list; CRI; Euromonitor; C&SD Sha Tin |
| 6 | Plant (R1) | Competition on campus | 1:00 | Shop icons pop onto a campus strip with share bars | Plant loop | 02_shops_used: canteens 78%, vending 61%; spend HK$10 |
| 7 | Water (R2) | Two interviews | 1:00 | A watering can tips, the sprout grows leaves; interview themes | Water pour, Water loop | 06_theme_bars, interview notes |
| 8 | Water (R2) | Survey design | 1:15 | Leaves unfold into question categories; QR code to the survey copy | Water loop | 10_question_coverage |
| 9 | Water (R2) | Who answered and cleaning | 1:15 | Fruit is washed: 72 drops shrink to 55 through the funnel | Splash | 01_funnel 72 → 55; 93% undergraduates |
| 10 | Harvest (R3) | What matters | 0:40 | Fruit falls into baskets sized by importance | Harvest loop | 02_importance: taste 28.1% |
| 11 | Harvest (R3) | Would they buy, and segments | 0:40 | A meter fills to 69%; baskets sort into segments | Harvest loop | intent 69%; 05_segments |
| 12 | Harvest (R3) | Target and positioning | 0:40 | A spotlight on the target; the positioning line writes itself | Harvest loop | 05_segments, 12_factor_ranking_tests |
| 13 | Blend (R4) | Place: earth to CUHK | 0:50 | Globe zooms to HK, then CUHK; a dart sticks on the spot | Whoosh, thunk | 04_where |
| 14 | Blend (R4) | Fruit race | 0:40 | Fruit race to the finish; the professor's fruit gets a badge | Blend loop | 04_fruit: mango 73% |
| 15 | Blend (R4) | Base and add-ons | 0:40 | Ingredients drop into a blender jar; the professor's picks glow | Blender | 04_base, 04_addons |
| 16 | Pour (R4) | Product reveal: the professor's cup | 0:35 | Pour into the cup; the Order #1 card flips; **the cup slides off to the right** (cardboard cut-out hand-off) | Pour, cheer | order + evidence |
| 17 | Serve (R5) | Price and menu board | 1:00 | The demand curve draws itself; menu prices flip in | Blend loop | 03_demand_curve: HK$25, 75% would pay |
| 18 | Serve (R5) | Order-ahead app | 0:35 | Phone mockup replays the professor's order | UI clicks | app 65%, loyalty 44% |
| 19 | Serve (R5) | Promotion | 1:10 | Poster slides in; 20 s promo video | **Brand song, quiet** | 04_occasion |
| 20 | Cheers (R6) | Evidence, risks, next steps | 1:30 | Store image; checklist ticks; Cue holds the cup | Pour loop | 08_tier_stability, 09_sample_size_targets |
| 21 | Cheers (R6) | Finale | 0:30 | Cue dances, throws the cup at the screen, smoothie covers it all, confetti | Celebration | none |

**The seven stages and why each fits the farm-to-cup story:**

| Stage | Story meaning | Outline part |
| --- | --- | --- |
| Plant | The idea is a seed: who we are, what students drink now | 1 Introduction + 4 Competition |
| Water | Research makes it grow: interviews, then the survey | 2 Data and Survey |
| Harvest | Pick the ripe insights: what matters, who buys | STP |
| Blend | Combine the picks into a drink: place, fruit, base, add-ons | 3 Product and Place |
| Pour | The drink exists: the professor's cup is revealed and leaves the screen | 3 Product (reveal) |
| Serve | Hand it to customers: what it costs, how they order, how they hear of it | 3 Price and Promotion |
| Cheers | A toast to the verdict: evidence, risks, next steps, then celebration | 5 Conclusion |

**Two changes from the team outline that need team sign-off:**
- Competition moves into Plant (slide 6).
- The professor's order is revealed at slide 16 (Pour), not in the Conclusion, so the cardboard hand-off happens during the product talk.

## 5. Professor's Order #1

Orders go live over the public relay (`shared/relay.js`) from the order app straight to the deck. The deck **never reloads the page**, so fullscreen and the current slide stay put.

1. **Placing the order.** The professor scans the QR on slide 4, which opens the order app linked to the deck's room code. Placing the order sends it over the public relay (shared/relay.js, MQTT over WebSocket); the deck shows it within a second or two and acknowledges it. No GitHub token. Fallbacks: O key to type it in, or the example order.
2. **Saving.** The app keeps a copy on the phone, sends the order to the deck's room, waits for the deck's acknowledgement, then shows a pickup ticket.
3. **Showing in the deck.** The deck listens on its room the whole time; the order appears (with a chime and a toast) on whatever slide is up, and the order slides (14, 15, 16, 18) use it. The R key or the #1 chip re-reads the saved copy. Only the data changes, not the page.

**Backups:**
- "Example Order #1" loads if nothing is fetched.
- A presenter panel (O key) lets you type the order in by hand if the Wi-Fi fails.
- The order app keeps a local copy in the browser for a laptop demo; same-browser demos work fully offline.

## 6. Architecture and folder layout

Plain HTML, CSS and JS with no build step. Content is kept apart from code.

```
PRESENTATION/
  PLAN.md               this file
  index.html            hub with three doors
  site/index.html       product website
  order/index.html      mobile order app
  deck/index.html       deck shell: stage, toolbar, timer
  deck/engine.js        step engine: clicks, transitions, audio, Reload Order, export
  deck/slides/*.js      one file per slide: scene, steps, speaker notes
  survey/index.html     copy of the Google Form
  content/brand.js      name, slogan, colours, music file names     (PLACEHOLDER)
  content/menu.js       fruit, bases, add-ons, sizes, prices, names (PLACEHOLDER)
  content/data.js       survey numbers, generated from ../output/tables
  shared/               mascot SVG, styles, order API, audio helper
  assets/audio/         music loops and sound effects (drop files in)
  assets/img/           AI images, poster, store (drop files in)
  assets/figures/       copied from ../output/figures
  tools/sync_data.py    rebuilds content/data.js from the R outputs
  tools/export/         Playwright scripts: PDF, MP4 per slide, PPTX
```

- **Content as `.js` files** (`window.CONTENT = {...}`) so the site also runs opened straight from disk.
- **Each slide** = a list of steps; each step = a short GSAP timeline. Next plays the next step; if a step is still animating, Next jumps it to its end first.
- **Libraries** (open source, pinned from cdnjs): GSAP 3.12.5 (motion), Howler 2.2.4 (audio), canvas-confetti 1.9.3, qrcode-generator 1.4.4, Leaflet 1.9.4 (earth-to-CUHK zoom).
- **Toolbar:** back, next, slide *x* / 22, section timer, grid overview, mute, fullscreen, **Reload Order**, and a ☰ menu with Export (PDF, PPTX, HTML zip) and speaker notes. Keys: ←/→/space, F fullscreen, R reload order, M mute, G grid, N notes, O order panel.

## 7. Asset pipeline (music, brand song, images)

Other AI tools make the media; the site just reads file names from `content/brand.js`.

| Asset | Where it goes | Made with | Notes |
| --- | --- | --- | --- |
| Section loops (Plant, Water, Harvest, Blend, Pour) | `assets/audio/loop-*.mp3` | Suno or Udio, or Pixabay Music | 60–90 s, seamless loop, played at about 25% volume |
| Brand song | `assets/audio/brand-song.mp3` | Suno or Udio | Plays quietly on slide 19 and in the promo video |
| Sound effects | `assets/audio/sfx-*.mp3` | Pixabay or Freesound (check licence) | Until files exist, built-in synth effects play (Web Audio) |
| Mascot | `shared/mascot.js` (SVG) | AI or hand drawn | Keep separate layers for body, arms, legs, eyes so it can still be animated |
| Store, poster, Booster Juice card, product photo | `assets/img/` | AI image tool | 16:9 or square, 1600 px wide, WebP or PNG |

## 8. Export plan

| Format | How | Keeps animation? |
| --- | --- | --- |
| HTML (primary) | The GitHub Pages link, plus a zip of `PRESENTATION/` | Yes, fully |
| PDF | `deck/?print` shows every slide in its final state; Playwright or DeckTape prints it | No, final frames only |
| PPTX | Playwright records each slide's steps to MP4; pptxgenjs puts one video per slide | As video, not interactive |

The Export entry in the deck menu opens print mode for PDF; PPTX and MP4 are made by running `tools/export/` on a laptop with Node.

## 9. Build phases and who builds what

| Phase | Deliverable | Builder |
| --- | --- | --- |
| 0 | Plan (this file), folder skeleton, brand + content files | Claude (lead) |
| 1, proof of concept | Deck engine + toolbar, slides 1–4 (intro, Cue walks, spill, let's grow) and slide 16 (pour + cup exit), order app, order storage, hub | Lead writes the engine and the hero scenes; Sonnet subagents build the order app and hub |
| 2 | All 22 slides with real data and figures | Sonnet / worker agents, one stage each, following the engine's slide API |
| 3 | Website, survey copy, audio, promo video, exports | Workers; lead reviews |
| 4 | Rehearsal: timing pass, Wi-Fi-off test, phone test | Team |

## 10. Risks and open decisions

| Risk | What to do |
| --- | --- |
| Wi-Fi fails in the room | Example Order #1 + O-key panel; all libraries can be vendored into `shared/vendor/` |
| Professor declines to order | Use Example Order #1; ask the instructor in advance |
| Overrun | Section timer turns amber at 90% of each budget; every beat skippable |
| Relay blocked on campus Wi-Fi | Three brokers at once; laptop on a phone hotspot; O key to type the order in |
| Browser blocks audio | Audio starts on first click; a mute button is always visible |

**Open decisions for the team:** the fancy add-on names; whether Competition moves into Plant; whether the reveal happens at slide 16; the CUHK spot for the dart.
