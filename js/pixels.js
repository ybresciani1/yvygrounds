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
