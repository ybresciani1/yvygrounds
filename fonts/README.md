# Fonts

Copies of the Google Fonts files the site uses (Latin and Latin Extended subsets only), served from here
instead of fonts.googleapis.com so the page doesn't wait on two other servers. `css/fonts.css` lists them.

| File | Font | Designer |
|---|---|---|
| `chewy-latin.woff2` | Chewy | Sideshow |
| `fredoka-latin*.woff2` | Fredoka (one variable file for every weight) | Milena Brandão, Hafontia |
| `gochi-hand-latin.woff2` | Gochi Hand | Huerta Tipográfica |
| `press-start-2p-latin*.woff2` | Press Start 2P | CodeMan38 |

All are under the [SIL Open Font License 1.1](https://openfontlicense.org/). To add a font or weight, copy the
`@font-face` rules from Google's CSS (`https://fonts.googleapis.com/css2?family=...`, opened in a browser) and
download the `latin` / `latin-ext` `.woff2` files it points to.
