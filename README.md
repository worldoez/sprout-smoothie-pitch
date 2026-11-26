# Sprout: smoothie pitch site

Static site for our CUHK smoothie marketing project, hosted on GitHub Pages.

| Page | Path |
| --- | --- |
| Home (three doors) | `index.html` |
| Product website | `site/` |
| Phone order app | `order/` |
| Animated pitch deck | `deck/` |
| Survey copy (read-only) | `survey/` |
| Phone remote / presenter view | `remote/` |

- Plan and storyline: `PLAN.md`. Slide words: `SCRIPT.md`. How to edit: `AGENTS.md`.
- Phone remote: in the deck press P (or the phone icon), scan the QR with your phone: big Next/Back, speaker notes, timer, reload order, jump to slide. `remote/index.html` also works as a presenter view in a second window on the laptop (offline).
- Deck keys: → / space next, ← back, F fullscreen, R reload Order #1, O enter order by hand, G all slides, N notes, M sound.
- PDF: open `deck/index.html?print` and print to PDF.
- Orders are stored in `data/orders.json` through the GitHub API. The ordering phone needs a fine-grained token (this repo only, Contents read/write), pasted via the key icon in the order app. Never commit a token.
- Run locally: `python3 -m http.server` in this folder, then open http://localhost:8000.
