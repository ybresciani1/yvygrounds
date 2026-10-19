# YvyGrounds open items

Live now at **http://yvygrounds.com/** (HTTPS certificate provisioning is pending).

## 1. Connect the domains

- [x] **Connect `yvygrounds.com`** (October 18, 2026): active in Cloudflare, with the DNS-only records below. GitHub Pages custom domain is set, and its `CNAME` commit is synced locally. HTTP loads the site; `www` redirects to the apex domain.
- [x] **Install and sign in to the official Cloudflare CLI** globally (`cf` / `cloudflare`, version `1.0.0-beta.18`). Credentials stay in the user's Cloudflare CLI configuration, outside this repository. Inspect DNS with `cf dns records list --zone yvygrounds.com`.
- [ ] **Enable HTTPS enforcement for `yvygrounds.com`** after GitHub finishes issuing its certificate.
- [ ] **Buy/connect `ybresciani.com`** for the redirect site. It currently returns NXDOMAIN; its GitHub Pages custom domain is not set.

  DNS records (`yvygrounds.com` is done; use the same values for `ybresciani.com` when available):

  | Type  | Host / Name | Value |
  |-------|-------------|-------|
  | A     | `@`   | `185.199.108.153` |
  | A     | `@`   | `185.199.109.153` |
  | A     | `@`   | `185.199.110.153` |
  | A     | `@`   | `185.199.111.153` |
  | CNAME | `www` | `ybresciani1.github.io` |

  Delete any default "parking" A/CNAME records the registrar added. If you use Cloudflare, set these records to **DNS only** (gray cloud).
  GitHub Pages mapping:
  - `ybresciani1/yvygrounds` → `yvygrounds.com` (configured)
  - `ybresciani1/ybresciani-redirect` → `ybresciani.com` (pending; redirects to yvygrounds.com)
- [ ] Optional: verify both domains under GitHub → Settings → Pages → *Add a verified domain*, so nobody else can claim them on GitHub Pages.

## 2. Swap placeholder content (in `js/data.js`)

- [x] The flock: Riot, Beyonce and Snow 🌈 (21 chicken photos)
- [ ] Real pets
- [ ] "This Day in Yvy History" facts
- [x] About letter text and contact email
- [ ] Other links in the letter (itch.io, GitHub, etc.)
- [x] Photos of Yvy (17 in the album; 48 feelings stickers saved in images/yvy-feelings, not shown)
- [ ] Photos for garden club, garden students and pets (get a parent/guardian OK for photos of kids)

## 3. Double-checks

- [ ] OK to list *Mike & Yvy's Love Adventure* on the public portal?
- [ ] Remove the "rough draft" tag from *Tijuana Estuary Explorer* once it's done

## 4. Arcade release calendar (one new mini game on the 18th of each month)

Each game lives in `arcade/<game>/` and gets an entry in `js/data.js` dated its release day.
A future date keeps it locked in the portal ("🔒 coming Nov 18") and it unlocks by itself that day,
so a game can be built and pushed early. (The files are still reachable by direct link before then.)

| Release | Game | Idea |
|---|---|---|
| Oct 18, 2026 | ✅ Tomato Tussle | Splat garden pests with tomatoes, don't splat the chickens |
| Oct 18, 2026 | ✅ Bowl Brawl | Peaches vs. Lychee quick-draw duel over the food bowl (1 or 2 players) |
| Nov 18, 2026 | Egg Catch | Riot and Beyonce lay eggs from the coop roof; catch them in a basket (teaser already listed) |
| Dec 18, 2026 | Bojjii's Pancake Catch | Holiday pancakes flip off the pan; Bojjii jumps for the tiny ones |
| Jan 18, 2027 | Handstand Hero | New Year's resolution: hold Yvy's handstand longer than one hiccup |
| Feb 18, 2027 | Kibble Rush | Peaches races Lychee to gobble spilled kibble |
| Mar 18, 2027 | Watering Can Dash | Spring planting! Water wilting plants before they droop |
| Apr 18, 2027 | Compost Stacker | Earth Day month: Tetris-style compost bin with Wallace the worm |
| May 18, 2027 | Coop Roundup | Herd the flock back into the coop at bedtime |
| Jun 18, 2027 | Paddleboard Panic | Summer endless runner on the water: stay (mostly) standing |
| Jul 18, 2027 | Battle for the Bowl | The big one: Peaches vs. Lychee mini fighting game with a Dignity Meter |

- [ ] Build each game a few days before its release date, then push (it stays locked until the 18th)
