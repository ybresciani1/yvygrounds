# YvyGrounds 🌱🐔🎮

The game portal of **Yvy** (ybresciani): gardening games, silly games, garden club, pets and chickens.
It mixes Amanda Please, iCarly, Newgrounds, kawaii and Animal Crossing.

Plain HTML/CSS/JS with no build step, so it runs on any static host (GitHub Pages, Netlify, Cloudflare Pages).

## Editing content

Almost everything lives in **`js/data.js`**:

| What | Where in `data.js` |
|---|---|
| Games | `games` (title, type `garden`/`silly`, url, thumb, date, featured) |
| Photos | `photos.me / club / students / pets / chickens` |
| Chickens and pets | `flock`, `pets` |
| Welcome bubble, announcement, ticker | `welcome`, `announcement`, `ticker` |
| "This Day in Yvy History" | `history` |
| About letter, email, links | `about`, `email`, `links` |

Anything marked **SAMPLE** is placeholder content.

### Adding photos
1. Drop the image into the matching folder: `images/me`, `images/club`, `images/students`, `images/pets`, `images/chickens`.
2. List it in `data.js`, for example:
   ```js
   chickens: [
     { src: "images/chickens/coop-day.jpg", caption: "The girls inspecting the new coop" },
   ],
   ```
3. Every listed photo also shows up in the oval photo wall in the background. The first `me` photo becomes the "click on Yvy's head" picture.

Keep photos around 1200px wide or smaller so the page loads fast.
Get a parent/guardian OK before posting photos of students who are kids.

### Adding a game
```js
{ title: "My New Game", type: "garden", url: "https://ybresciani.itch.io/my-new-game",
  thumb: "images/games/my-new-game.png", date: "2026-11-01", featured: true,
  blurb: "One funny sentence about it." },
```

## Previewing locally
```bash
python -m http.server 8080
```
Then open http://localhost:8080
