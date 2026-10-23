/*
 * Tiny pixel-art sprites (NES / Hello Kitty World vibes).
 * Each sprite is a grid of letters; each letter maps to a color, "." is empty.
 */
window.Pixel = (function () {
  const ART = {
    chicken: {
      colors: { W: "#ffffff", G: "#e2dbef", R: "#ff4d6d", Y: "#ffb62e", K: "#2b1a52" },
      grid: [
        "...RR.......",
        "..RRRR......",
        "..WWWW......",
        ".WWKWWW.....",
        "YYWWWWW.....",
        ".RWWWWW..WW.",
        "..WWWWWWWWW.",
        "..WWGGGGWWW.",
        "..WWWGGGWW..",
        "...WWWWWW...",
        ".....Y.Y....",
        "....YY.YY...",
      ],
    },
    flower: {
      colors: { P: "#ff8cc6", Y: "#ffd23f", G: "#3f8f2e", L: "#7cd35a" },
      grid: [
        "..PPP..",
        ".PPPPP.",
        "PPPYPPP",
        "PPYYYPP",
        "PPPYPPP",
        ".PPPPP.",
        "..PGP..",
        "...G...",
        ".LLG...",
        "..LG.LL",
        "...GLL.",
        "...G...",
      ],
    },
    sprout: {
      colors: { L: "#7cd35a", G: "#3f8f2e", B: "#c8743a", D: "#9a5427" },
      grid: [
        ".LL...LL.",
        "LLLL.LLLL",
        "LLLLGLLLL",
        ".LLLGLLL.",
        "....G....",
        "....G....",
        ".BBBBBBB.",
        "..BDDDB..",
        "..BBBBB..",
        "...BBB...",
      ],
    },
    silly: {
      colors: { Y: "#ffd23f", K: "#2b1a52", P: "#ff6fa8" },
      grid: [
        "..YYYYY..",
        ".YYYYYYY.",
        "YYKYYYKYY",
        "YYKYYYKYY",
        "YYYYYYYYY",
        "YKYYYYYKY",
        "YYKKKKKYY",
        ".YYYPPYY.",
        "..YYYYY..",
      ],
    },
    mystery: {
      colors: { P: "#8a3fd1", S: "#ffd23f" },
      grid: [
        "S.PPPPP..",
        ".PP...PP.",
        ".PP...PPS",
        "......PP.",
        "....PPP..",
        "....PP...",
        "S...PP...",
        ".........",
        "....PP..S",
      ],
    },
    tomato: {
      colors: { G: "#3f8f2e", R: "#e8352e", W: "#ffb3a8" },
      grid: [
        "...G.G...",
        "..RGGGR..",
        ".RRRGRRR.",
        "RRWRRRRRR",
        "RWRRRRRRR",
        "RRRRRRRRR",
        ".RRRRRRR.",
        "..RRRRR..",
      ],
    },
    bowl: {
      colors: { K: "#a0643a", L: "#ffd6ec", P: "#ff8cc6", D: "#c9579a" },
      grid: [
        "...KK.K...",
        "..KKKKKK..",
        "LLLLLLLLLL",
        "PPPPPPPPPP",
        ".PPPDDPPP.",
        "..PPPPPP..",
      ],
    },
    heart: {
      colors: { P: "#ff6fa8", H: "#ffc2df" },
      grid: [
        ".PP.PP.",
        "PHPPPPP",
        "PPPPPPP",
        ".PPPPP.",
        "..PPP..",
        "...P...",
      ],
    },

    // Critter of the Month sprites (they act out their moves on the big trading card). All face left.
    riot: { // Buff Laced Polish: a giant pom-pom that covers her eyes
      colors: { C: "#f7e2c2", B: "#f2d3a8", L: "#c99a62", Y: "#ffb62e" },
      grid: [
        "..CCCC......",
        ".CCCCCC.....",
        "CCCCCCCC....",
        ".CCCCCC.....",
        "YYBBBB......",
        ".BBBBBB..BB.",
        "..BLBLBBBBB.",
        "..BBLBLBLBB.",
        "..BLBLBLBB..",
        "...BBBBBB...",
        ".....Y.Y....",
        "....YY.YY...",
      ],
    },
    beyonce: { // Golden Laced Polish: dark-laced gold, and you can see her glare
      colors: { G: "#e8a33a", D: "#6b3e12", K: "#2b1a52", Y: "#ffb62e" },
      grid: [
        "..DGDG......",
        ".GDGDGD.....",
        "DGDGDGDG....",
        ".GDGDGD.....",
        "YYGKGG......",
        ".GGGGGG..DD.",
        "..GDGDGGGDD.",
        "..GGDGDGDGG.",
        "..GDGDGDGG..",
        "...GGGGGG...",
        ".....Y.Y....",
        "....YY.YY...",
      ],
    },
    snow: { // Silkie: one big white puff with turquoise ears and fluffy feet
      colors: { W: "#ffffff", F: "#e2dbef", K: "#2b1a52", T: "#37c6e6", Y: "#ffb62e", S: "#8a84a3" },
      grid: [
        "..WWWW......",
        ".WWWWWW.....",
        "WWWWWWWW....",
        ".WWKWWWW....",
        "YYWWTWWW....",
        ".WWWWWWW.WW.",
        "WWWWWWWWWWWW",
        "WWFWWFWWWFWW",
        ".WWWWWWWWWW.",
        "..WWWWWWWW..",
        "...SSS.SSS..",
        "...S.....S..",
      ],
    },
    peaches: { // Fox-faced Pomeranian: an orange fluffball with a curled-up tail
      colors: { O: "#f5a04a", L: "#ffd6a0", K: "#2b1a52" },
      grid: [
        "............",
        "..O.O.......",
        "..OOOO......",
        ".OKOOOO...O.",
        "KOLLOOOO.OO.",
        ".LLOOOOOOOO.",
        "..OOOOOOOOO.",
        "..OOOOOOOOO.",
        "..LOOOOOOOO.",
        "..OOOOOOOO..",
        "..OO....OO..",
        "..OO....OO..",
      ],
    },
    bojjii: { // German Shepherd × Aussie: big, tan, black saddle, ears up
      colors: { T: "#c98a4a", B: "#3a2a2a", L: "#f0d9b0", K: "#2b1a52" },
      grid: [
        "..B.B.......",
        "..BTT.......",
        ".TKTT.......",
        "BTTTT.......",
        ".LTTTBBBBB.T",
        "..TTBBBBBBTT",
        "..TTTBBBBTT.",
        "..TTTTTTTT..",
        "..LT....TL..",
        "..T.....T...",
        "..T.....T...",
        ".TT....TT...",
      ],
    },
    lychee: { // Tabby cat: stripes, pink nose, tail up
      colors: { G: "#9a8a78", D: "#5a4a3e", L: "#d8ccb8", K: "#2b1a52", P: "#ff8cc6" },
      grid: [
        "............",
        "............",
        "..G.G.......",
        "..GGG......G",
        ".GKGG......G",
        "PGLGG......G",
        ".LLGG.....G.",
        "..GGDGDGDGG.",
        "..GGGDGDGGG.",
        "..GDGGGGDGG.",
        "..GG....GG..",
        "..GG....GG..",
      ],
    },
    penny: { // Chug (Chihuahua × Pug): fawn with a black mask and a curly tail
      colors: { F: "#e8c590", M: "#3a2a2a", K: "#ffffff", P: "#ff6fa8" },
      grid: [
        "............",
        "............",
        "..M..M......",
        "..MFFM......",
        ".MKFF.......",
        "MMMFF....F..",
        "PMFFFFFFFFF.",
        "..FFFFFFFFF.",
        "..FFFFFFFF..",
        "..FF....FF..",
        "..FF....FF..",
        "..MM....MM..",
      ],
    },
  };

  function svg(name, scale, colorOverrides) {
    const art = ART[name];
    if (!art) return "";
    const colors = Object.assign({}, art.colors, colorOverrides);
    const h = art.grid.length;
    const w = art.grid[0].length;
    let rects = "";
    art.grid.forEach((row, y) => {
      [...row].forEach((ch, x) => {
        if (colors[ch]) rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${colors[ch]}"/>`;
      });
    });
    const s = scale || 4;
    return `<svg class="px" viewBox="0 0 ${w} ${h}" width="${w * s}" height="${h * s}" shape-rendering="crispEdges" aria-hidden="true">${rects}</svg>`;
  }

  return { svg, ART };
})();
