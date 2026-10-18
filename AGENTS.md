# AGENTS.md

Guidance for AI coding agents working on **YvyGrounds**, the personal game portal of Yvy (username **ybresciani**).

## What this is

A static, no-build website that links to Yvy's browser games. The look deliberately mixes:
- **Amanda Please** (lavender wall of oval photos, white card, sticker buttons, "This Day in History" box, scrapbook with arrows)
- **iCarly** (bright yellow/orange "Game of the Week" TV, LED countdown)
- **Newgrounds** (dark portal panel, orange tabs, "Latest 5" list, game rows with icon + "TITLE - blurb")
- **Kawaii** and **NES Hello Kitty** pixel art (sparkle cursor, pixel sprites)
- **Animal Crossing** (speech box with nameplate, grass texture, rainbow train tracks, letter-style About)

Keep new work in that retro-but-cute style. It's meant to feel 2000s-maximalist, not modern-minimal.

## Layout

| Path | What it holds |
|---|---|
| `index.html` | All page sections (single page, anchor nav) |
| `css/style.css` | All styles; colors and fonts are CSS variables in `:root` |
| `js/data.js` | **All content**: games, photos, chickens, pets, ticker, about text, history facts |
| `js/pixels.js` | Pixel-art sprites defined as letter grids → inline SVG (`Pixel.svg(name, scale, colorOverrides)`) |
| `js/main.js` | Renders everything from `data.js`; no framework |
| `images/<album>/` | Photos: `me`, `club`, `students`, `pets`, `chickens`; game thumbnails in `games` |
| `OPEN_ITEMS.md` | Running to-do list for the project |

## Conventions

- Plain HTML/CSS/vanilla JS. No build step, no npm dependencies, no frameworks. External assets are Google Fonts only.
- Content changes go in `js/data.js`, not hard-coded into HTML/JS. Escape user-facing strings with `esc()` in `main.js`.
- All asset paths are **relative** (`images/...`, not `/images/...`) so the site works both at a subpath and at a custom domain.
- Game types are `garden`, `silly` and `story` (see `TYPES` in `main.js`). Filter buttons only show types that have games.
- Missing images fall back to an emoji placeholder automatically (`data-fallback`), so a typo in a photo path won't break the layout.
- Frames crop with `object-fit: cover`, defaulting to `object-position: 50% 30%`. When a subject is off-center, set `focus` on the photo/card/game entry in `data.js` (`"top"`, `"left"`, `"30% 20%"`...) instead of making a new cropped file. `imgTag()` applies it. The scrapbook polaroid is a fixed square (crops, uses `focus`); only the lightbox shows whole photos. `wall: false` keeps a photo off the background wall.
- Respect `prefers-reduced-motion` (animations, typewriter text and cursor sparkles already turn off), keep buttons as real `<button>`s, and give images alt text.
- Keep it working at phone width (~375px) with no horizontal scrolling. Breakpoints live at the bottom of `style.css`.
- Keep image files small: game thumbnails ~400–640px wide, photos ≤1200px.
- Photos of garden students may show minors. Don't add or caption them without Yvy confirming permission.

## Games

Yvy's games are deployed on **Vercel**, mostly from GitHub repos under `ybresciani1`. To find new ones:
```bash
gh repo list ybresciani1 --json name,homepageUrl,description
```
Thumbnails come from the game's own logo, or a screenshot of its title screen (headless Chrome works; give it its own `--user-data-dir`).

## Preview locally

```bash
python -m http.server 8080
```
Then open http://localhost:8080 (`.claude/launch.json` has this as the `yvygrounds` preview config).

## Deploying

- Hosted on **GitHub Pages** from `main` of `ybresciani1/yvygrounds`. **Pushing to `main` publishes the site**, so only push when Yvy asks.
- The repo is public. Don't commit secrets or private notes. Markdown files are kept off the live site via `_config.yml` (`exclude:`).
- `ybresciani1/ybresciani-redirect` is a separate one-page Pages site that redirects `ybresciani.com` to `https://yvygrounds.com/`.
- Domains: `yvygrounds.com` (main) and `ybresciani.com` (redirect). See `OPEN_ITEMS.md` for the DNS records and connection status.
