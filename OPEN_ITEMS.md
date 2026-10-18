# YvyGrounds open items

Live now at **https://ybresciani1.github.io/yvygrounds/**

## 1. Connect the domains (next up)

- [ ] **Buy `yvygrounds.com` and `ybresciani.com`** at any registrar (Porkbun, Namecheap, Cloudflare...). Turn on free WHOIS privacy if it's offered.
- [ ] **Add DNS records for both domains** (the same records work for both):

  | Type  | Host / Name | Value |
  |-------|-------------|-------|
  | A     | `@`   | `185.199.108.153` |
  | A     | `@`   | `185.199.109.153` |
  | A     | `@`   | `185.199.110.153` |
  | A     | `@`   | `185.199.111.153` |
  | CNAME | `www` | `ybresciani1.github.io` |

  Delete any default "parking" A/CNAME records the registrar added. If you use Cloudflare, set these records to **DNS only** (gray cloud).
- [ ] **Ask Claude to connect them.** It sets the custom domain on both GitHub repos and turns on HTTPS:
  - `ybresciani1/yvygrounds` → `yvygrounds.com`
  - `ybresciani1/ybresciani-redirect` → `ybresciani.com` (redirects to yvygrounds.com)
- [ ] Optional: verify both domains under GitHub → Settings → Pages → *Add a verified domain*, so nobody else can claim them on GitHub Pages.

## 2. Swap placeholder content (in `js/data.js`)

- [ ] Real chickens (names, breeds, fun facts, photos)
- [ ] Real pets
- [ ] "This Day in Yvy History" facts
- [x] About letter text and contact email
- [ ] Other links in the letter (itch.io, GitHub, etc.)
- [ ] Photos for Yvy, garden club, garden students, pets and chickens (get a parent/guardian OK for photos of kids)

## 3. Double-checks

- [ ] OK to list *Mike & Yvy's Love Adventure* on the public portal?
- [ ] Remove the "rough draft" tag from *Tijuana Estuary Explorer* once it's done
