# Proxy card files

Print-shop images of the garden cards (kept off the live site, see `_config.yml`).

| File | Size |
|---|---|
| `pumpkling-front-300dpi.png`, `pumpkling-back-300dpi.png` | 822 × 1122 px |
| `pumpkling-front-600dpi.png`, `pumpkling-back-600dpi.png` | 1644 × 2244 px (sharper; use these if the shop takes them) |
| `argie-front-300dpi.png`, `argie-back-300dpi.png` | 822 × 1122 px (the garden spider's card: `?plant=garden-spider`) |
| `argie-front-600dpi.png`, `argie-back-600dpi.png` | 1644 × 2244 px |
| `pollie-front-300dpi.png`, `pollie-back-300dpi.png` | 822 × 1122 px (the honeybee's card: `?plant=honeybee`) |
| `pollie-front-600dpi.png`, `pollie-back-600dpi.png` | 1644 × 2244 px |
| `bunchling-front-300dpi.png`, `bunchling-back-300dpi.png` | 822 × 1122 px (the root veggies' card: `?plant=root-veggies`) |
| `bunchling-front-600dpi.png`, `bunchling-back-600dpi.png` | 1644 × 2244 px |

Every file is **poker size** (2.5 × 3.5 in, like Pokémon cards) **plus 0.12 in of bleed** on each side. The bleed is the
extra frame color past the cut line, so a slightly off cut never leaves a white edge. The text stays at least
2.5 mm inside the cut. Corners are square in the file; the shop rounds them.

## Ordering (MakePlayingCards and similar shops)

1. Pick **poker size** cards (2.5 × 3.5 in), custom front and back.
2. Upload the **front** image as the front and the **back** image as the back.
3. The images already include bleed: if the shop asks, choose "fit" or "already has bleed", not "add bleed" or
   "crop", and check its preview that the cut line falls inside the green (front) and yellow (back) frames.

At home, print the PDF from the card page instead (`plants/pumpkin/card.html`): it's already real size.

## Making them again

The card is drawn by `plants/plants.js` from `plants/plants-data.js` → `card`. `proxies/index.html?plant=pumpkin&side=front`
shows one face at print size (add `&guides=1` to see the cut line in red and the safe area in blue). With the
local server running (`python -m http.server 8080`), headless Chrome saves each face:

```bash
chrome --headless=new --hide-scrollbars --window-size=822,1122 --force-device-scale-factor=2 --virtual-time-budget=5000 --screenshot=proxies/pumpkling-front-600dpi.png "http://localhost:8080/proxies/?plant=pumpkin&side=front"
```

(`--force-device-scale-factor=1` for 300 dpi, `side=back` for the back), then tag the dpi with Pillow:
`Image.open(f).save(f, dpi=(600, 600))`.
