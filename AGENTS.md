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
| `js/veg-icons.js` | Hand-drawn 32×32 SVG vegetable icons for crops with no accurate emoji (cauliflower, beets, kale...). Use `icon: "name"` in `data.js`; shown at emoji size |
| `js/main.js` | Renders everything from `data.js`; no framework. Includes the Lesson Board (`#lessons`, under the Hall of Fame): what garden class is learning and where it is in Rabbit & Frog: Gardenbound (`lessons`). Includes Critter of the Month (`critterOfTheMonth`; cards in `flock[].card` / `pets[].card`): that month's critter swaps its Critter Corner card for a trading card that opens big, and its pixel sprite (`js/pixels.js`, named after it) acts out each move. Preview with `?cotm=Lychee` |
| `arcade/<game>/` | Mini games that run right on the site (`index.html` + `game.js`, shared `arcade/arcade.css`). Listed in `data.js` with `play:` |
| `js/pixel-emoji.js`, `js/emoji-sprites.js` | Swaps every emoji on the main page for an original hand-drawn 12×12 pixel sprite (`emoji-sprites.js`, one per emoji, each drawn for how it's used on the site), including content added later. An emoji with no sprite (e.g. a new caption, or 🏃 which Yvy wanted left alone) falls back to a 16×16 pixelated copy of the device's emoji. Skips the Garden Almanac (`#growing`), form fields, SVG and `.no-pixel`. Switch: `data.js` → `pixelEmoji`. New sprites: 12 rows × 12 characters, `K` = `#2b1a52` outline, site palette |
| `arcade/scores.js` | Shared high-score box (3-letter initials, top 10). A game calls `YvyScores.show({ game, score, better, format, onPlayAgain, onClose })` after a round and ignores its own keys while `YvyScores.isOpen()`. Add the game to `GAMES` in `society-api/src/index.js` and to `arcadeScores` in `data.js` |
| `images/<album>/` | Photos: `me`, `club`, `students`, `pets`, `chickens`; game thumbnails in `games`; Compost-tab photos in `compost` (listed in `data.js` → `society.compost.photos`) |
| `images/<album>/thumbs/` | Small copies (~240px) the background photo wall loads instead of full photos. Made by `python tools/photos.py thumbs` (needs Pillow); a photo with no thumbnail yet falls back to the full one |
| `tools/photos.py` | Photo helper: `thumbs` makes wall thumbnails, `shrink` recompresses photos over 250 KB. Run both after adding photos. Excluded from Pages |
| `images/yvy-feelings/` | Yvy's sticker-sheet "feelings" poses, saved for later. **Not shown** on the site and excluded from Pages in `_config.yml`; `stickerSet()` in `data.js` can bring a sheet back |
| `js/portfolio.js`, `css/portfolio.css` | Portfolio sections: résumé as an RPG character sheet (`#resume`), "Hire me" shop counter with Venmo/Zelle (`#shop`), guestbook (`#guestbook`), and the "Behind the Game" devlog plaques (📜 button on each game). Content in `data.js` → `resume`, `shop`, `guestbook`, `devlogs` |
| `js/extras.js`, `css/extras.css` | Little extras: "Currently…" AIM away message (`currently`), pet-able critters with a community "Most Petted" board (counts in the API; a new critter must also be added to `CRITTERS` in `society-api/src/index.js`), Konami code egg (↑↑↓↓←→←→BA, or tap the logo chicken 7×), seasonal decorations (`seasons`, preview with `?season=winter`), "You are visitor #…", the portal's High Scores box (`arcadeScores`) and the Rabbit & Frog Hall of Fame (`hallOfFame`). Each has an on/off switch in `ON` at the bottom |
| `resume.html`, `js/resume-page.js`, `css/resume-page.css` | Plain printable résumé ("📄 boring printable version"), built from the same `data.js` → `resume`. Print → Save as PDF |
| `js/society.js`, `css/society.css` | Garden Society section (journal, projects, compost chart, submit form). Talks to `society-api/`. The Almanac and 🗺️ Map tabs are already on the page. "Submit an entry" also takes compost temps and bed feedings from members (pending until Yvy approves) |
| `js/garden-map.js` | The Central Garden as a pixel map (Map tab; links to `#map` open it). Spots in `data.js` → `gardenMap`, traced on a 40×52 grid; textures are 4×4 SVG tiles in `css/society.css` (`--t-*`). Each bed shows its to-dos (crossed off from the admin page), feeding calendar and feeding log; feedings and crossed-off to-dos come from the API (`/api/garden`), keyed by the spot's `id`. The admin page loads this file too, for `window.YvyGarden` (to-do ids, next-feeding dates) |
| `society-admin.html`, `js/society-admin.js` | Yvy's private admin page: approve/reject Society submissions and guestbook signatures, manage projects, log compost temps, cross off garden to-dos and log feedings (🌱 Garden tab, also where members' temps and feedings get approved), add Hall of Fame students and photos, delete arcade scores (password-protected by the API; `noindex`) |
| `society-api/` | Cloudflare Worker + D1 database + KV photo storage backend for the Garden Society, garden map log (feedings, crossed-off to-dos), guestbook, visitor counter, arcade high scores and hall of fame (deploy steps in its README). Excluded from Pages |
| `OPEN_ITEMS.md` | Running to-do list for the project |

## Conventions

- Plain HTML/CSS/vanilla JS. No build step, no npm dependencies, no frameworks. External assets are Google Fonts only.
- Content changes go in `js/data.js`, not hard-coded into HTML/JS. Escape user-facing strings with `esc()` in `main.js`.
- All asset paths are **relative** (`images/...`, not `/images/...`) so the site works both at a subpath and at a custom domain.
- `index.html` loads `css/style.css` and `js/*.js` with a `?v=` date. Bump it (all of them together) whenever you change CSS or JS, so visitors don't mix a new page with old cached files (GitHub Pages caches for 10 minutes).
- Game types are `garden`, `silly`, `story` and `mystery` (for unannounced games) (see `TYPES` in `main.js`); `type` can also be a list like `["silly", "story"]`, and the first one picks the icon. Filter buttons only show types that have games.
- Missing images fall back to an emoji placeholder automatically (`data-fallback`), so a typo in a photo path won't break the layout.
- Frames crop with `object-fit: cover`, defaulting to `object-position: 50% 30%`. When a subject is off-center, set `focus` on the photo/card/game entry in `data.js` (`"top"`, `"left"`, `"30% 20%"`...) instead of making a new cropped file. `imgTag()` applies it. The scrapbook polaroid is a fixed square (crops, uses `focus`); only the lightbox shows whole photos. `wall: false` keeps a photo off the background wall.
- Respect `prefers-reduced-motion` (animations, typewriter text and cursor sparkles already turn off), keep buttons as real `<button>`s, and give images alt text.
- Keep it working at phone width (~375px) with no horizontal scrolling. Breakpoints live at the bottom of `style.css`.
- Keep image files small: game thumbnails ~400–640px wide, photos ≤1200px.
- Photos of garden students may show minors. Don't add or caption them without Yvy confirming permission.
- **The résumé is public**: no phone number and no names of private families (nanny jobs are one "Private Families" entry). The PDF in Yvy's Downloads has both, so don't publish it as-is.
- **Hall of Fame**: students are first name + last initial only, and photos go up only with a parent's OK (Yvy adds both on the admin page). **Arcade scores** use 3-letter initials only.
- **Guestbook signatures** may come from kids too: first name/initials only, no links/emails/phone numbers (the API rejects them), pending until Yvy approves.
- **Garden Society submissions** may come from kids: collect first name/initials only (no emails), keep everything pending until Yvy approves, and keep the in-browser photo shrink (it strips EXIF/GPS). Secrets (`SOCIETY_PASSCODE`, `ADMIN_PASSWORD`) live only in Cloudflare (`wrangler secret put`), never in the repo.

## Games

Yvy's games are deployed on **Vercel**, mostly from GitHub repos under `ybresciani1`. To find new ones:
```bash
gh repo list ybresciani1 --json name,homepageUrl,description
```
Small games can also live **on the site itself** in `arcade/<game>/` (plain canvas + vanilla JS, no libraries; see `arcade/tomato-tussle/`). Give the `data.js` entry `play: "arcade/<game>/"` instead of `url`, and the portal opens it in the pop-up arcade player (an iframe; the game page adds `body.embedded` and fills the frame). Opened directly, the same page works as a standalone game page. Esc inside a game pauses, then posts `{ yvyArcade: "close" }` to the parent to close the pop-up. Menus over the canvas are real `<button>`s in an `.arcade-menu` (see `arcade/bowl-brawl/`).

New arcade games come out **one a month, on the 18th** (calendar in `OPEN_ITEMS.md`). A game whose `date` is in the future stays locked in the portal ("🔒 coming Nov 18") and unlocks by itself that day, so it can be built and pushed early.

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
