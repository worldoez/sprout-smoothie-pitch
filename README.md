# Sprout: smoothie pitch site

Static site for our CUHK smoothie marketing project, hosted on GitHub Pages.

| Page | Path |
| --- | --- |
| Home (three doors) | `index.html` |
| Product website | `site/` |
| Phone order app | `order/` |
| Animated pitch deck | `deck/` |
| Survey copy (read-only) | `survey/` |

- Plan and storyline: `PLAN.md`. Slide words: `SCRIPT.md`. How to edit: `AGENTS.md`.
- Deck keys: → / space next, ← back, F fullscreen, R reload Order #1, O enter order by hand, G all slides, N notes, M sound.
- PDF: open `deck/index.html?print` and print to PDF.
- Orders are stored in `data/orders.json` through the GitHub API. The ordering phone needs a fine-grained token (this repo only, Contents read/write), pasted via the key icon in the order app. Never commit a token.
- Run locally: `python3 -m http.server` in this folder, then open http://localhost:8000.
