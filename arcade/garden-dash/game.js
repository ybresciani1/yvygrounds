/*
 * 🌱 Garden Society Dash: a tiny YvyGrounds arcade game, Diner Dash style.
 * The Garden Society keeps the garden going! Beds ask for seeds, water,
 * weeding, compost and harvesting, each with a patience meter. Grab the right
 * tool from the shed, tap the bed, and bring the harvest to the farm stand.
 * Five garden days, each busier than the last.
 *
 * The ten students are placeholders (Player 1-10) until Yvy describes them.
 *
 * Plain canvas, no libraries. Drawn on a 320x240 "pixel" grid, scaled K times.
 */
(function () {
  "use strict";

  const W = 320, H = 240, K = 3;
  const HUD_H = 20;
  const SPEED = 140;            // how fast the student walks (px/s)
  const WORK_MS = 450;          // time spent doing a job at a bed
  const HANDS = 2;              // things you can carry at once
  const SAVE_KEY = "yvy-garden-dash";
  const MUTE_KEY = "yvy-arcade-muted";

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const muteBtn = document.getElementById("mute");
  const titleMenu = document.getElementById("titleMenu");
  const selectMenu = document.getElementById("select");
  const daysMenu = document.getElementById("days");
  const endMenu = document.getElementById("endMenu");
  const embedded = window.self !== window.top;
  if (embedded) document.body.classList.add("embedded");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage blocked */ } },
  };
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (list) => list[Math.floor(Math.random() * list.length)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  if (document.fonts) {
    document.fonts.load('8px "Press Start 2P"');
    document.fonts.load('40px "Chewy"');
  }

  /* ---------- Pixel art ---------- */
  // Tools and veggies are the same pixel emoji the main site uses (js/emoji-sprites.js)
  const FX_ART = {
    "💧": {
      c: { K: "#2b1a52", S: "#7cc6ff", W: "#ffffff", B: "#5aa8f0" },
      g: [".....KK.....", "....KSSK....", "...KSSSSK...", "..KSSSSSSK..", ".KSWSSSSSBK.", ".KSWSSSSSBK.", ".KSWSSSSSBK.", ".KSSSSSSBBK.", ".KSSSSSSBBK.", "..KSSSSBBK..", "...KKKKKK...", "............"],
    },
    "🌱": {
      c: { K: "#2b1a52", L: "#a8e384", g: "#7cc85a", D: "#3f8f2e", N: "#a0643a", n: "#6b4224" },
      g: ["............", ".KKK....KKK.", "KLLgK..KgLLK", "KLggDKKDggLK", ".KgggDDgggK.", "..KKKDDKKK..", "....KDDK....", "....KDDK....", "..KKNDDNKK..", ".KNNNNNNNNK.", "KNnNNNNNNnNK", "KKKKKKKKKKKK"],
    },
    "🌿": {
      c: { K: "#2b1a52", G: "#7cc85a", L: "#a8e384", D: "#3f8f2e" },
      g: [".....KK.....", "....KLGK....", "....KLGK....", ".KK.KLGK.KK.", "KLGKKLGKKGDK", "KLGGKLGKGGDK", ".KLGGKKGGDK.", "..KKGGDDKK..", "....KDDK....", "....KDDK....", "....KDDK....", ".....KK....."],
    },
    "🧺": {
      c: { K: "#2b1a52", N: "#a0643a", R: "#e8352e", W: "#ffffff", T: "#e0c98e" },
      g: ["...KKKKKK...", "..KNKKKKNK..", "..KNK..KNK..", "..KNK..KNK..", ".KRWRWRWRWK.", "KNNNNNNNNNNK", ".KTTNTTNTTK.", ".KNTTNTTNTK.", ".KTTNTTNTTK.", "..KTNTTNTK..", "..KNTTNTTK..", "...KKKKKK..."],
    },
    "🪱": {
      c: { K: "#2b1a52", P: "#ff8cc6", H: "#ff4d8d" },
      g: ["............", "......KKKK..", ".....KPPPPK.", ".....KPKPPK.", ".....KPPHPK.", "......KPPPK.", "..KK..KHPPK.", ".KPPK.KPPPK.", ".KHPK.KPHPK.", ".KPPKKKPPK..", "..KPPPPPK...", "...KKKKK...."],
    },
    "🍅": {
      c: { K: "#2b1a52", R: "#e8352e", D: "#b8241f", W: "#ffffff", G: "#7cc85a" },
      g: [".....KK.....", "..KKKGGKKK..", ".KRGGGGGGRK.", "KRRRGRRGRRRK", "KRWWRRRRRRRK", "KRWRRRRRRRRK", "KRRRRRRRRRDK", "KRRRRRRRRRDK", ".KRRRRRRRDK.", "..KDRRRRDK..", "...KKKKKK...", "............"],
    },
    "🥕": {
      c: { K: "#2b1a52", G: "#7cc85a", O: "#ff8a1e", E: "#d9620b", W: "#ffd23f" },
      g: ["............", "...KK..KK...", "..KGGKKGGK..", "...KGGGGK...", "..KKKGGKKK..", "..KOWOOOEK..", "..KOOOKOEK..", "...KOOOEK...", "...KOKOEK...", "....KOOK....", ".....KK.....", "............"],
    },
    "🥒": {
      c: { K: "#2b1a52", G: "#3f8f2e", L: "#7cc85a", D: "#2a6a20", B: "#a0643a" },
      g: ["........KKKB", ".......KLGGK", "......KLGGDK", ".....KLGLDK.", "....KLGGDK..", "...KLLGDK...", "..KLGGDK....", ".KLGLDK.....", "KLGGDK......", "KGGDK.......", ".KKK........", "............"],
    },
    "🍓": {
      c: { K: "#2b1a52", E: "#3f8f2e", R: "#e8352e", G: "#7cc85a", Q: "#ff6b6b", Y: "#ffd23f", r: "#b31f2a" },
      g: [".....KK.....", "..KKKEEKKK..", ".KRGGEEGGRK.", "KRRRKGGKRRRK", "KRQRRRRRYRRK", "KRRRYRRRRRRK", ".KRRRRRYRRK.", ".KRYRRRRRrK.", "..KRRRYRrK..", "...KRRRrK...", "....KRrK....", ".....KK....."],
    },
    "🐛": {
      c: { K: "#2b1a52", G: "#7cc85a", D: "#3f8f2e", P: "#ff8cc6" },
      g: ["............", ".....K.....K", "......K...K.", "......KKKKK.", ".....KGGGGGK", ".KKKKKGKGKGK", "KGDGDKPGGGPK", "KGDGDKGGKGGK", "KGDGDGKGGGK.", ".KKKKKKKKKK.", "..K.K.K.....", "............"],
    },
    "✨": {
      c: { Y: "#ffd23f", G: "#e0a800", W: "#ffffff" },
      g: ["............", ".........Y..", "....G...YWY.", "....Y....Y..", "...YYY......", "..YYWYY.....", "GYYWWWYYG...", "..YYWYY.....", "...YYY...Y..", "....Y...YWY.", "....G....Y..", "............"],
    },
    "💥": {
      c: { K: "#2b1a52", R: "#e8352e", O: "#ff8a1e", Y: "#ffd23f" },
      g: [".K...KK...K.", "KRK.KRRK.KRK", ".KRKKRRKKRK.", "..KROOOORK..", ".KKOOYYOOKK.", "KRROYYYYORRK", "KRROYYYYORRK", ".KKOOYYOOKK.", "..KROOOORK..", ".KRKKRRKKRK.", "KRK.KRRK.KRK", ".K...KK...K."],
    },
    "❤️": {
      c: { K: "#2b1a52", R: "#e8352e", Q: "#ff6b6b", r: "#b31f2a" },
      g: ["............", "..KKK..KKK..", ".KRRRKKRRRK.", "KRQQRRRRRRRK", "KRQRRRRRRRRK", "KRRRRRRRRRrK", ".KRRRRRRRrK.", "..KRRRRRrK..", "...KRRRrK...", "....KRrK....", ".....KK.....", "............"],
    },
    "🌻": {
      c: { K: "#2b1a52", Y: "#ffd23f", G: "#e0a800", n: "#6b4224", N: "#a0643a", g: "#7cc85a", D: "#3f8f2e", L: "#a8e384" },
      g: ["....KKKK....", "..KKYGGYKK..", ".KYYKKKKYYK.", ".KGKnNNnKGK.", "KYYKNNnNKYYK", "KYYKNnNNKYYK", ".KGKnNNnKGK.", ".KYYKKKKYYK.", "..KKYGGYKK..", "....KKgKK.KK", "....KgDKKgLK", "....KgDKKKK."],
    },
    "🥬": {
      c: { K: "#2b1a52", g: "#7cc85a", D: "#3f8f2e", L: "#a8e384" },
      g: ["....KK.KK...", "..KKgDKgDKK.", ".KgDgLgDggDK", "KgDDgLgDDgK.", ".KgDgLggDgDK", "KgggDLgDggK.", ".KDggLgggDK.", "..KgDLDgDK..", "...KKLLKK...", "....KLLK....", "....KLLK....", ".....KK....."],
    },
  };

  function bakeGrid(grid, colors) {
    const c = document.createElement("canvas");
    c.width = grid[0].length;
    c.height = grid.length;
    const g = c.getContext("2d");
    grid.forEach((row, y) => [...row].forEach((ch, x) => {
      if (colors[ch]) { g.fillStyle = colors[ch]; g.fillRect(x, y, 1, 1); }
    }));
    return c;
  }
  const FX = {};
  Object.keys(FX_ART).forEach((k) => { FX[k] = bakeGrid(FX_ART[k].g, FX_ART[k].c); });

  // ----- The Garden Society: thirteen students (first names only) -----
  // Everyone wears the green Garden Society apron (unless their shirt should show). Looks are built from
  // one body plus a hairstyle; name is first name only.
  const KID_BASE = [
    "....HHHH....",
    "...HHHHHH...",
    "..HHHHHHHH..",
    "..HSSSSSSH..",
    "..SSESSESS..",
    "..SSSSSSSS..",
    "...SSMMSS...",
    "....SSSS....",
    "..TTAAAATT..",
    ".STTAAAATTS.",
    ".S.TAGAAT.S.",
    "...TAAAAT...",
    "...PPPPPP...",
    "...PP..PP...",
    "...PP..PP...",
    "..BBB..BBB..",
  ];
  const SKIN = ["#f6d2b5", "#e9b48f", "#c98e62", "#a0663f", "#7a4a2a"];
  const BLACK_HAIR = ["#141014", "#2c2633", "#5a5470"];   // black with a cool sheen
  const STUDENTS = [
    { name: "Aiden", skin: SKIN[2], hair: "#1e1414", shirt: "#ffffff", style: "swoop", catShirt: true, cat: "#2b2433", blurb: ["Swoopy hair,", "cat shirt!"] },
    // Long dark brown hair with chestnut and sand-beige highlights framing her face down to her waist, fair peach
    // skin, freckles, brown eyes; maroon-and-white baby tee, watch, hoops, black pants, Converse
    { name: "Vivian", skin: "#f8dcc8", skinShade: "#d9a5ad", hair: "#3b2416", tones: ["#3b2416", "#7b4a2b", "#d8bf94"], eye: "#5a3a26",
      style: "longHair", tall: true, freckles: true, hoops: true,
      outfit: "babyTee", shirt: "#ffffff", trim: "#7a1f3a", pants: "#2b2433", converse: true, blurb: ["Baby tee, hoops", "and Converse!"] },
    // Blonde boy, fair, side-swept bangs; gym clothes: gray tee, navy shorts with white stripes, socks, sneakers
    { name: "Andrew", skin: SKIN[0], hair: "#e8c25a", tones: ["#b98a34", "#e8c25a", "#fff0b0"], style: "sweep",
      outfit: "gym", shirt: "#c8ced6", trim: "#2b3a7a", pants: "#2b3a7a", shoes: "#e8352e", blurb: ["Side-swept bangs", "and gym clothes!"] },
    // Pale, hazel eyes, freckles, dark brown low ponytail; a pullover with an anime face on it
    { name: "Phoebe", skin: "#fbe3d3", hair: "#3a2418", eye: "#7a6a2e", freckles: true, style: "lowpony", tall: true,
      outfit: "anime", shirt: "#3d3a6a", blurb: ["Low ponytail,", "anime pullover!"] },
    // Same skin tone as Aiden, long black hair like Player 2's
    { name: "Ayra", skin: SKIN[2], hair: "#141014", tones: BLACK_HAIR, shirt: "#7cc6ff", style: "longHair", blurb: ["Long black", "hair!"] },
    // Blonde long bob, glasses, brown eyes
    { name: "Ella", skin: SKIN[1], hair: "#e8c25a", eye: "#5a3a26", shirt: "#ff8a1e", style: "bob", bobTo: 17, glasses: true,
      blurb: ["Blonde long bob", "and glasses!"] },
    // Brown side-swept bangs (swept the other way), a little tan, jeans
    { name: "Emmett", skin: SKIN[1], hair: "#5a3a22", style: "sweep", sweepRight: true, shirt: "#37c6e6", pants: "#4f78b0", jeans: true,
      blurb: ["Side-swept bangs", "and jeans!"] },
    // Brown shoulder-length bob with the top half pulled up in a claw clip; black Converse
    { name: "Roweena", skin: "#f8dcc8", hair: "#6b4a2e", shirt: "#c9b8f2", style: "bobknot", tall: true, converse: true, blurb: ["Half-up bob,", "black Converse!"] },
    // Tall, tan, dark brown bob
    { name: "Tessa", skin: "#d9a173", hair: "#3a2418", tones: ["#24160e", "#3a2418", "#7b4a2b"], shirt: "#fff8e4", style: "bob", tall: true,
      blurb: ["Tall, with a", "dark brown bob!"] },
    // Tall, long black hair like Player 2's, with face-framing bangs
    { name: "Juleesa", skin: SKIN[2], hair: "#141014", tones: BLACK_HAIR, shirt: "#3d5aa8", style: "longHair", tall: true, bangs: true,
      blurb: ["Tall, long black", "hair with bangs!"] },
    // Long dark brown hair past her shoulders, light tan; red sweatshirt, frayed denim skirt over black leggings
    { name: "Maddy", skin: "#e2b08a", hair: "#2a1a12", tones: ["#1a0f0a", "#2e1d14", "#6a4a36"], eye: "#3a2418", style: "longHair", hairTo: 20,
      outfit: "sweater", shirt: "#b3262c", skirt: "#7d98bd", pants: "#1e1a24", shoes: "#2b2433",
      blurb: ["Red sweatshirt,", "denim skirt!"] },
    // Short hair, thin
    { name: "Landon", skin: "#f0c8a8", hair: "#7b5236", style: "crew", thin: true, shirt: "#9b7be0", blurb: ["Short hair,", "and thin!"] },
    // Aiden's skin tone, a touch lighter; black hair combed over to the side
    { name: "Lucas", skin: "#d39a6e", hair: "#141014", tones: BLACK_HAIR, style: "combover", shirt: "#ffd23f", blurb: ["Black hair,", "combed over!"] },
  ];
  // Outfits that show instead of the apron bib (rows 8-11 of the body)
  const OUTFITS = {
    cat: ["..TTCTTCTT..", ".STTCCCCTTS.", ".S.TICCIT.S.", "...TCNNCT..."],            // a cat face on the shirt
    anime: ["..TTJJJJTT..", ".TTTJCCJTTT.", ".STTICCITTS.", "...TCCCCT..."],          // pullover: long sleeves, anime face
    babyTee: ["..YYTYYTYY..", ".SYTTTTTTYX.", ".S.TTTTTT.S.", "...TTTTTT..."],         // maroon sleeves and collar, a watch
    gym: ["..TTTTTTTT..", ".STTTTTTTTS.", ".S.TTYYTT.S.", "...TTTTTT..."],              // gym tee with a little logo
    sweater: ["..TTTTTTTT..", ".TTTTTTTTTT.", ".S.TTTTTT.S.", "...TTTTTT..."],          // sweatshirt: sleeves to the wrists
  };
  function kidGrid(k) {
    const style = k.style;
    const g = KID_BASE.map((r) => [...r]);
    const outfit = k.outfit || (k.catShirt ? "cat" : null);
    if (outfit) OUTFITS[outfit].forEach((row, n) => { g[8 + n] = [...row]; });
    if (outfit === "anime") g[7] = [..."...TSSSST..."];                                     // the hood around the neck
    if (outfit === "gym") g[14] = [..."...SS..SS..."];                                      // shorts: bare knees below
    if (k.skirt) g[12] = [..."..KKKKKKKK.."];                                               // a skirt over leggings
    if (k.thin) {                                                                           // narrower shoulders and body
      g[8] = [..."...TAAAAT..."]; g[9] = [..."..STAAAATS.."]; g[10] = [..."..STAGAATS.."]; g[11] = [..."...TAAAAT..."];
    }
    const set = (x, y, c) => { if (y >= 0 && y < g.length && x >= 0 && x < 12) g[y][x] = c; };
    if (style === "long") { for (let y = 3; y <= 9; y++) { set(1, y, "H"); set(10, y, "H"); } set(2, 3, "H"); set(9, 3, "H"); }
    else if (style === "pony") { set(10, 2, "H"); for (let y = 2; y <= 7; y++) set(11, y, "H"); set(10, 3, "R"); }
    else if (style === "curly") { for (let x = 1; x <= 10; x++) { set(x, 1, "H"); set(x, 2, "H"); } set(2, 0, "H"); set(9, 0, "H"); [3, 4].forEach((y) => { set(1, y, "H"); set(10, y, "H"); }); }
    else if (style === "buns") { [[2, 0], [3, 0], [8, 0], [9, 0], [1, 1], [2, 1], [9, 1], [10, 1]].forEach(([x, y]) => set(x, y, "H")); }
    else if (style === "braids") { for (let y = 3; y <= 10; y++) { set(1, y, "H"); set(10, y, "H"); } set(1, 11, "R"); set(10, 11, "R"); }
    else if (style === "spiky") { [3, 5, 7].forEach((x) => set(x, 0, ".")); [2, 4, 6, 8].forEach((x) => { set(x, 0, "H"); }); set(9, 0, "H"); }
    else if (style === "bucket") { for (let x = 3; x <= 8; x++) { set(x, 0, "U"); set(x, 1, "U"); } for (let x = 2; x <= 9; x++) set(x, 2, "U"); for (let x = 1; x <= 10; x++) set(x, 3, "V"); }
    else if (style === "cap") { for (let x = 3; x <= 8; x++) { set(x, 0, "U"); set(x, 1, "U"); set(x, 2, "U"); } set(2, 2, "U"); set(9, 2, "U"); for (let x = 2; x <= 9; x++) set(x, 3, "V"); }
    else if (style === "swoop") {   // side-swept bangs, Justin Bieber style
      ["...HHHHH....", "..HHHHHHHH..", ".HHHHHHHHHH.", ".HHHHHHHSSH.", "..HSESSESS.."].forEach((row, y) => { g[y] = [...row]; });
    } else if (style === "lowpony") {   // hair pulled back into a low ponytail
      set(2, 4, "H"); set(9, 4, "H"); set(10, 5, "R"); for (let y = 5; y <= 10; y++) set(11, y, "H");
    } else if (style === "longback") {  // long hair, past the shoulders to mid-back
      for (let y = 3; y <= 8; y++) { set(1, y, "H"); set(10, y, "H"); } set(2, 3, "H"); set(9, 3, "H"); set(2, 4, "H"); set(9, 4, "H");
      for (let y = 8; y <= 11; y++) { set(0, y, "H"); set(11, y, "H"); }   // the rest hangs down behind her arms
    } else if (style === "bobknot") {   // shoulder-length bob
      for (let x = 1; x <= 10; x++) set(x, 2, "H"); for (let y = 3; y <= 7; y++) { set(1, y, "H"); set(10, y, "H"); } set(2, 8, "H"); set(9, 8, "H");
    } else if (style === "headband") { for (let x = 2; x <= 9; x++) set(x, 2, "R"); for (let y = 3; y <= 8; y++) { set(1, y, "H"); set(10, y, "H"); } }
    if (k.freckles) { set(3, 5, "F"); set(8, 5, "F"); }
    if (k.hoops) { set(1, 5, "O"); set(10, 5, "O"); }
    if (k.converse) g[15] = [..."..BWB..BWB.."];                                            // high-tops with white toe caps
    // Tall kids get a longer body and longer legs
    if (k.tall) { g.splice(11, 0, [...g[11]]); g.splice(14, 0, [...g[14]]); }
    // Half-up ponytail on top, held with a claw clip (added last: it sits above the head)
    if (style === "bobknot") { g.unshift([..."....HHH....."]); g[1][4] = "Q"; g[1][7] = "Q"; }
    return g.map((r) => r.join(""));
  }
  // Double the resolution: each pixel becomes 2x2, so detail can be painted on top
  const upscale = (rows) => rows.flatMap((r) => { const w = [...r].map((c) => c + c).join(""); return [w, w]; });
  function painter(g) {
    const set = (x, y, c) => { if (y >= 0 && y < g.length && x >= 0 && x < g[0].length) g[y][x] = c; };
    const fill = (x, y, w, h, c) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) set(x + i, y + j, c); };
    return { set, fill };
  }
  // Finer detail for every kid, painted on the doubled grid: a shine in the eyes, brows, a smile,
  // blush or freckles, soft shading on the jaw, neck, arms and clothes, hair outline and shine,
  // shoe highlights (light comes from the top left, so shading sits on the right and bottom edges)
  const SKINISH = "SsbFMEWk";
  const CLOTH_SHADE = { T: "t", A: "a", P: "p", U: "u" };
  function refine(g, k) {
    const h = g.length, w = g[0].length;
    const { set } = painter(g);
    // Round off the square corners of hair, hats, shoulders and shoes (runs at least 3 wide)
    let src = g.map((r) => [...r]);
    let at = (x, y) => (y >= 0 && y < h && x >= 0 && x < w ? src[y][x] : ".");
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const c = src[y][x];
      if (!"HUTB".includes(c) || at(x, y - 1) !== ".") continue;
      if (at(x - 1, y) === "." && at(x + 1, y) === c && at(x + 2, y) === c) set(x, y, ".");
      if (at(x + 1, y) === "." && at(x - 1, y) === c && at(x - 2, y) === c) set(x, y, ".");
    }
    // ...and the jaw: the bottom corners of the face
    let mouthRow = -1;
    for (let y = 0; y < h; y++) if (src[y].includes("M")) mouthRow = y;
    for (let y = 0; y <= mouthRow; y++) for (let x = 0; x < w; x++) {
      if (src[y][x] !== "S" || src[y].includes("E") || at(x, y + 1) === "S" || at(x, y + 1) === "M") continue;
      if (y < mouthRow - 4) continue;
      if (at(x - 1, y) !== "S" && at(x + 1, y) === "S") set(x, y, at(x - 1, y));
      else if (at(x + 1, y) !== "S" && at(x - 1, y) === "S") set(x, y, at(x + 1, y));
    }
    src = g.map((r) => [...r]);
    at = (x, y) => (y >= 0 && y < h && x >= 0 && x < w ? src[y][x] : ".");
    const eyes = [];
    let mouthX = -1, mouthY = -1, top = -1;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const c = src[y][x];
      if (c === "E" && at(x - 1, y) !== "E" && at(x, y - 1) !== "E") eyes.push([x, y]);
      if (c === "M") { if (mouthX < 0) mouthX = x; mouthY = y; }
      if (c === "H" && top < 0) top = y;
    }
    const eyeY = eyes.length ? eyes[0][1] : 8;
    const neckY = mouthY + 1;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const c = src[y][x];
      if (c === "S") {
        const edge = !SKINISH.includes(at(x - 1, y)) || !SKINISH.includes(at(x + 1, y)) || !SKINISH.includes(at(x, y + 1));
        if (y >= eyeY + 2 && y <= mouthY && edge) set(x, y, "s");                      // jaw
        else if (y === neckY) set(x, y, "s");                                           // under the chin
        else if (y > neckY + 1 && !SKINISH.includes(at(x + 1, y))) set(x, y, "s");      // arms
      } else if (CLOTH_SHADE[c] && (at(x + 1, y) !== c || at(x, y + 1) !== c)) {
        set(x, y, CLOTH_SHADE[c]);
      } else if (c === "H") {
        if ([at(x - 1, y), at(x + 1, y), at(x, y - 1), at(x, y + 1)].includes(".")) set(x, y, "h");
        else if (y < eyeY - 2 && ((y === top + 2 && x >= 7 && x <= 10) || (y === top + 3 && (x === 6 || x === 15 || x === 16)))) set(x, y, "l");
      } else if (c === "B") {
        if (at(x, y + 1) === ".") set(x, y, k.converse || k.shoes ? "W" : "z");          // soles (Converse, sneakers: white)
        else if (at(x - 1, y) !== "B" && at(x, y - 1) !== "B") set(x, y, "w");
      } else if (c === "W" && k.converse && at(x, y + 1) === ".") set(x, y, "W");
    }
    // Eyes: a white shine; brows two rows up
    eyes.forEach(([x, y]) => {
      set(x + 1, y, "W");
      [x, x + 1].forEach((bx) => { if (at(bx, y - 2) === "S") set(bx, y - 2, "k"); });
    });
    // A little smile with the corners up
    if (mouthX >= 0) {
      for (let x = mouthX; x < mouthX + 4; x++) { set(x, mouthY - 1, "S"); set(x, mouthY, "S"); }
      set(mouthX, mouthY - 1, "M"); set(mouthX + 3, mouthY - 1, "M"); set(mouthX + 1, mouthY, "M"); set(mouthX + 2, mouthY, "M");
    }
    // Freckles scattered across the cheeks, or a soft blush
    if (eyes.length === 2) {
      const [[lx], [rx]] = eyes, cy = eyeY + 3;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (src[y][x] === "F") set(x, y, "S");
      if (k.freckles) [[lx - 2, cy - 1], [lx, cy], [rx + 1, cy], [rx + 3, cy - 1]].forEach(([x, y]) => set(x, y, "F"));
      else [lx - 2, lx - 1, rx + 2, rx + 3].forEach((x) => set(x, cy, "b"));
    }
  }
  // Gym clothes: white stripes down the shorts and white socks. Jeans: light cuffs and seams
  function clothesDetail(g, k) {
    const { set } = painter(g);
    if (k.skirt) {
      const hem = g.reduce((last, r, y) => (r.includes("K") ? y : last), -1);
      g.forEach((r, y) => r.forEach((c, x) => { if (c === "K" && r[x + 1] !== "K") set(x, y, "f"); }));
      g[hem].forEach((c, x) => { if ((c === "K" || c === "f") && x % 2) set(x, hem, "e"); });   // frayed hem
    }
    if (k.outfit !== "gym" && !k.jeans) return;
    const shoeY = g.findIndex((r) => r.some((c) => "Bwz".includes(c)));
    const legs = g.map((r) => r.map((c, x) => (c === "P" || c === "p" ? x : -1)).filter((x) => x >= 0));
    if (k.outfit === "gym") {
      g.forEach((r, y) => { if (legs[y].length) { set(Math.min(...legs[y]), y, "W"); set(Math.max(...legs[y]), y, "W"); } });
      for (let x = 0; x < g[0].length; x++) if ("Ss".includes(g[shoeY - 1][x])) set(x, shoeY - 1, "W");
    } else {
      for (let x = 0; x < g[0].length; x++) if ("Pp".includes(g[shoeY - 1][x])) set(x, shoeY - 1, "d");
      g.forEach((r, y) => { if (y < shoeY - 1 && legs[y].length > 4) { set(9, y, "d"); set(14, y, "d"); } });
    }
  }
  // Glasses: a frame around each eye with a clear lens on the outer side, a bridge, arms to the ears
  function glasses(g) {
    const { set } = painter(g);
    const eyes = [];
    g.forEach((r, y) => r.forEach((c, x) => { if (c === "E" && r[x - 1] !== "E" && (y === 0 || g[y - 1][x] !== "E")) eyes.push([x, y]); }));
    eyes.forEach(([x, y], n) => {
      const a = n === 0 ? x - 2 : x - 1, b = a + 4;
      for (let i = a; i <= b; i++) { set(i, y - 1, "q"); set(i, y + 2, "q"); }
      for (let j = y; j <= y + 1; j++) { set(a, j, "q"); set(b, j, "q"); set(n === 0 ? a + 1 : b - 1, j, "L"); }
      if (n === 0) for (let i = b + 1; i < eyes[1][0] - 1; i++) set(i, y, "q");   // bridge
      const arm = n === 0 ? a - 1 : b + 1;
      if ("Ssb".includes(g[y][arm])) set(arm, y, "q");
    });
  }
  // Hairstyles painted at the fine level (24-wide grid). Hair tones: 1 dark, 2 mid, 3 highlight;
  // 4 is the skin's shading
  const DETAIL = {
    // Short hair: a close crop with a little texture, short sideburns
    crew(g) {
      const { set, fill } = painter(g);
      fill(0, 0, 24, 6, ".");
      [[8, 15], [6, 17], [5, 18], [4, 19], [4, 19]].forEach(([a, b], y) => {
        for (let x = a; x <= b; x++) set(x, y + 1, y === 0 || x === a || x === b ? "1" : "2");
      });
      for (let x = 6; x <= 17; x++) set(x, 6, x % 2 ? "1" : "2");                    // a short, choppy fringe line
      [4, 5, 18, 19].forEach((x) => { set(x, 6, x === 4 || x === 19 ? "1" : "2"); set(x, 7, x === 4 || x === 19 ? "1" : "2"); });
      [[9, 2], [10, 2], [14, 3], [15, 3], [7, 4], [8, 4], [12, 4]].forEach(([x, y]) => set(x, y, "3"));   // a soft shine
    },
    // Combed over from a side part, with a little lift in the front
    combover(g) {
      const { set, fill } = painter(g);
      fill(0, 0, 24, 6, ".");
      [[9, 16], [7, 18], [5, 19], [4, 19], [4, 19], [4, 19]].forEach(([a, b], y) => {
        for (let x = a; x <= b; x++) set(x, y, y === 0 || x === a || x === b ? "1" : "2");
      });
      for (let y = 3; y <= 5; y++) set(8, y, "4");                                    // the part
      [4, 5, 18, 19].forEach((x) => { set(x, 6, x === 4 || x === 19 ? "1" : "2"); set(x, 7, x === 4 || x === 19 ? "1" : "2"); });
      [[10, 1], [11, 1], [12, 2], [13, 2], [14, 2], [15, 3], [16, 3], [10, 3], [11, 4], [12, 4], [13, 5], [14, 5], [6, 3], [5, 4]].forEach(([x, y]) => set(x, y, "3"));
    },
    // A short cut with side-swept bangs falling across the forehead (k.sweepRight sweeps them the other way)
    sweep(g, k) {
      const { set, fill } = painter(g);
      const px = (x, y, c) => set(k.sweepRight ? 23 - x : x, y, c);
      fill(0, 0, 24, 6, ".");
      [[8, 15], [6, 17], [5, 18], [4, 19], [4, 19], [4, 19]].forEach(([a, b], y) => {
        for (let x = a; x <= b; x++) px(x, y, y === 0 || x === a || x === b ? "1" : "2");
      });
      // Bangs: long over one eye, short over the other, sideburns by the ears
      for (let x = 4; x <= 13; x++) px(x, 6, x === 4 || x === 13 ? "1" : "2");
      for (let x = 4; x <= 9; x++) px(x, 7, x === 4 || x === 9 ? "1" : "2");
      px(4, 8, "1"); px(5, 8, "1");
      [18, 19].forEach((x) => { px(x, 6, x === 19 ? "1" : "2"); px(x, 7, x === 19 ? "1" : "2"); });
      // Highlight strands, combed the way the bangs fall
      [[15, 1], [14, 2], [13, 3], [12, 4], [11, 5], [10, 6], [9, 2], [8, 3], [7, 4], [6, 5], [6, 6], [17, 3], [18, 4]].forEach(([x, y]) => px(x, y, "3"));
    },
    // A bob with a side part; k.bobTo is the row it ends on (14 at the chin, 17 for a long bob to the shoulders)
    bob(g, k) {
      const { set, fill } = painter(g);
      const end = k.bobTo || 14;
      fill(0, 0, 24, 6, ".");
      [[8, 15], [6, 17], [4, 19], [3, 20], [3, 20], [2, 21]].forEach(([a, b], y) => {
        for (let x = a; x <= b; x++) set(x, y, y === 0 || x === a || x === b ? "1" : "2");
      });
      for (let y = 1; y <= 5; y++) set(9, y, "1");                                   // the part
      [[11, 1], [12, 2], [13, 3], [14, 4], [7, 2], [6, 3], [5, 4], [16, 2], [17, 3], [18, 4]].forEach(([x, y]) => set(x, y, "3"));
      // Swoop over the forehead from the part
      fill(10, 6, 6, 1, "2"); set(16, 6, "1"); fill(13, 7, 3, 1, "2"); set(16, 7, "1");
      // Sides falling to the bob's edge, curling under at the end
      for (let y = 6; y <= end; y++) {
        const strand = y % 4 === 2 ? "2" : "3";
        const tip = y === end;
        set(tip ? 3 : 2, y, "1"); set(3, y, tip ? "1" : "2"); set(4, y, strand); set(5, y, "2");
        set(tip ? 20 : 21, y, "1"); set(20, y, tip ? "1" : "2"); set(19, y, strand); set(18, y, "2");
      }
    },
    // Long hair parted in the middle, framing the face in two columns down to the waist
    longHair(g, k) {
      const { set, fill } = painter(g);
      const waist = g.findIndex((r) => r.includes("P") || r.includes("p") || r.includes("K")) - 1;
      const end = k.hairTo || waist;                                         // where the hair ends
      fill(0, 0, 24, 16, ".");
      // Crown, parted in the middle, with highlights
      [[8, 15], [6, 17], [5, 18], [4, 19], [4, 19]].forEach(([a, b], y) => {
        for (let x = a; x <= b; x++) set(x, y, y === 0 || x === a || x === b ? "1" : "2");
      });
      for (let y = 1; y <= 4; y++) { set(11, y, "1"); set(12, y, "1"); }
      [[10, 1], [9, 2], [8, 3], [7, 4], [5, 4], [13, 1], [14, 2], [15, 3], [16, 4], [18, 4]].forEach(([x, y]) => set(x, y, "3"));
      if (k.band) fill(4, 3, 16, 2, "R");                                    // a headband across the crown
      // Face, soft shading under the hair and along the jaw
      fill(7, 5, 10, 9, "S"); fill(8, 14, 8, 1, "S"); fill(10, 15, 4, 1, "4");
      set(7, 5, "2"); set(16, 5, "2");
      for (let y = 11; y <= 13; y++) { set(7, y, "4"); set(16, y, "4"); }
      set(8, 14, "4"); set(15, 14, "4");
      // Face-framing bangs: parted in the middle, sweeping out past the brows and down the cheeks
      if (k.bangs) {
        [["2321", 7, 5], ["1232", 13, 5], ["21", 7, 6], ["12", 15, 6], ["2", 7, 7], ["2", 16, 7]]
          .forEach(([row, x0, y]) => [...row].forEach((c, i) => set(x0 + i, y, c)));
        for (let y = 8; y <= 11; y++) { const c = y === 11 ? "1" : "2"; set(7, y, c); set(16, y, c); }
      }
      // Brows, eyes with a shine, freckles or blush, nose, smile
      fill(9, 7, 2, 1, "2"); fill(13, 7, 2, 1, "2");
      fill(9, 8, 2, 2, "E"); fill(13, 8, 2, 2, "E"); set(10, 8, "W"); set(14, 8, "W");
      if (k.freckles) [[8, 10], [9, 11], [15, 10], [14, 11]].forEach(([x, y]) => set(x, y, "F"));
      else [8, 9, 14, 15].forEach((x) => set(x, 11, "b"));
      set(11, 11, "4"); set(12, 11, "4");
      set(11, 13, "M"); set(12, 13, "M");
      if (k.hoops) { set(7, 14, "O"); set(7, 15, "O"); set(16, 14, "O"); set(16, 15, "O"); }
      // Baby tee: white, round maroon collar, maroon sleeves out past her hair; a watch
      if (k.outfit === "babyTee") {
        fill(5, 16, 14, waist - 15, "T");
        set(9, 15, "Y"); set(14, 15, "Y"); fill(9, 16, 6, 1, "Y");
        fill(2, 16, 3, 4, "Y"); fill(19, 16, 3, 4, "Y");
        fill(2, 20, 2, 3, "S"); fill(20, 20, 2, 3, "S"); set(3, 20, "4"); set(20, 20, "4");
        fill(20, 21, 2, 1, "X");
      }
      // Two long columns of hair down to the waist
      for (let y = 5; y <= end; y++) {
        const strand = y % 4 === 1 ? "2" : "3";   // highlights broken into strands
        if (y < end) { set(4, y, "1"); set(19, y, "1"); }
        set(5, y, strand); set(18, y, strand);
        set(6, y, "2"); set(17, y, "2");
      }
    },
  };
  const KIDS = STUDENTS.map((s, i) => {
    const tones = s.tones || [shade(s.hair, 0.8), s.hair, mix(s.hair, "#ffffff", 0.4)];
    const skinShade = mix(shade(s.skin, 0.86), "#7a3a5a", 0.12);
    const colors = {
      H: s.hair, S: s.skin, E: s.eye || "#2b1a52", M: "#e8607a", T: s.shirt, A: "#5aa83c", G: "#3f8f2e",
      P: s.pants || "#3d5aa8", B: s.shoes || (s.converse ? "#2b2433" : "#5a3a26"), U: s.hat || "#e6c35c", V: s.hat ? shade(s.hat) : "#c9a23c",
      R: s.ribbon || s.band || "#ff8cc6", C: s.cat || "#fff8e4", I: "#5aa8f0", N: "#ff8cc6",
      F: "#b5734a", O: "#ffd23f", Q: "#c98a4a", W: "#ffffff", J: "#ff8cc6", Y: s.trim || "#7a1f3a", X: "#2b1a52",
      1: tones[0], 2: tones[1], 3: tones[2], 4: s.skinShade || skinShade, q: "#2b1a52", L: "#eaf4ff",
      // Detail shades (see refine)
      k: shade(s.hair, 0.85), h: shade(s.hair, 0.7), l: mix(s.hair, "#d8cce8", 0.3),
      s: skinShade, b: mix(s.skin, "#ff6f8f", 0.3),
      t: shade(s.shirt, 0.82), a: shade("#5aa83c", 0.82), p: shade(s.pants || "#3d5aa8", 0.8), u: shade(s.hat || "#e6c35c", 0.88),
      K: s.skirt || "#7d98bd", e: mix(s.skirt || "#7d98bd", "#ffffff", 0.5), f: shade(s.skirt || "#7d98bd", 0.82),
      w: mix(s.shoes || (s.converse ? "#2b2433" : "#5a3a26"), "#ffffff", 0.3), d: mix(s.pants || "#3d5aa8", "#ffffff", 0.35), z: shade("#5a3a26", 0.7),
    };
    const fine = upscale(kidGrid(s)).map((r) => [...r]);
    refine(fine, s);
    if (DETAIL[s.style]) DETAIL[s.style](fine, s);
    if (s.glasses) glasses(fine);
    clothesDetail(fine, s);
    return { name: s.name || `Player ${i + 1}`, blurb: s.blurb, img: bakeGrid(fine.map((r) => r.join("")), colors) };
  });
  function shade(hex, by = 0.75) {
    const n = parseInt(hex.slice(1), 16);
    const f = (v) => Math.max(0, Math.round(v * by));
    return `#${[(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => f(v).toString(16).padStart(2, "0")).join("")}`;
  }

  function mix(a, b, t) {
    const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
    const A = rgb(a), B = rgb(b);
    return `#${A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join("")}`;
  }

  /* ---------- The garden ---------- */
  const TOOLS = [
    { tool: "seeds", emoji: "🌱", label: "SEEDS" },
    { tool: "water", emoji: "💧", label: "WATER" },
    { tool: "weed", emoji: "🌿", label: "WEEDS" },
    { tool: "compost", emoji: "🪱", label: "COMPOST" },
  ];
  TOOLS.forEach((t, i) => Object.assign(t, { x: 6, y: 26 + i * 40, w: 50, h: 36 }));
  const STAND = { x: 6, y: 190, w: 50, h: 44 };
  const TASK_EMOJI = { seeds: "🌱", water: "💧", weed: "🌿", compost: "🪱", harvest: "🧺" };
  const CROPS = ["🍅", "🥕", "🥒", "🍓", "🥬", "🌻"];
  const BED_SLOTS = [[94, 40], [168, 40], [242, 40], [94, 126], [168, 126], [242, 126]];
  const BED_ORDER = [0, 2, 4, 1, 3, 5];
  const BED_W = 62, BED_H = 40;

  // Five garden days, each busier than the last
  const DAYS = [
    { name: "Monday", beds: 3, time: 90, goal: 500, expert: 900, patience: 18, extra: 0.25 },
    { name: "Tuesday", beds: 4, time: 100, goal: 650, expert: 1100, patience: 17, extra: 0.35 },
    { name: "Wednesday", beds: 5, time: 110, goal: 750, expert: 1250, patience: 16, extra: 0.45 },
    { name: "Thursday", beds: 6, time: 125, goal: 800, expert: 1250, patience: 15, extra: 0.5 },
    { name: "Garden Day!", beds: 6, time: 135, goal: 850, expert: 1300, patience: 14, extra: 0.6 },
  ];

  /* ---------- Sound (tiny WebAudio bleeps) ---------- */
  let actx = null;
  let noiseBuf = null;
  let muted = store.get(MUTE_KEY) === "1";
  function audio() {
    if (!actx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) actx = new AC({ latencyHint: "interactive" });
    }
    if (actx && actx.state === "suspended") actx.resume();
    return actx;
  }
  function tone(freq, freq2, dur, type, vol, delay) {
    if (muted) return;
    const a = audio();
    if (!a) return;
    const t = a.currentTime + (delay || 0);
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type || "square";
    o.frequency.setValueAtTime(freq, t);
    if (freq2) o.frequency.exponentialRampToValueAtTime(freq2, t + dur);
    g.gain.setValueAtTime(vol || 0.06, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(a.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  }
  function noise(dur, vol, cutoff, delay) {
    if (muted) return;
    const a = audio();
    if (!a) return;
    if (!noiseBuf) {
      noiseBuf = a.createBuffer(1, a.sampleRate, a.sampleRate);
      const data = noiseBuf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    }
    const t = a.currentTime + (delay || 0);
    const src = a.createBufferSource();
    const filter = a.createBiquadFilter();
    const g = a.createGain();
    src.buffer = noiseBuf;
    filter.type = "lowpass";
    filter.frequency.value = cutoff;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(filter).connect(g).connect(a.destination);
    src.start(t, Math.random() * (1 - dur), dur);
  }
  const SFX = {
    grab: () => tone(520, 780, 0.08, "square", 0.05),
    queue: () => tone(900, 0, 0.03, "square", 0.025),
    task: (combo) => { const f = 520 + Math.min(combo, 8) * 60; tone(f, f * 1.5, 0.1, "square", 0.05); },
    water: () => { noise(0.25, 0.12, 2500); tone(700, 400, 0.15, "triangle", 0.04); },
    dig: () => noise(0.12, 0.15, 900),
    pluck: () => tone(300, 900, 0.1, "triangle", 0.07),
    sell: () => [988, 1319, 1568].forEach((f, i) => tone(f, 0, 0.09, "square", 0.05, i * 0.06)),
    wrong: () => tone(200, 150, 0.15, "sawtooth", 0.05),
    wilt: () => tone(500, 140, 0.4, "triangle", 0.07),
    need: () => tone(1200, 0, 0.04, "triangle", 0.03),
    tick: () => tone(880, 0, 0.05, "square", 0.04),
    start: () => [523, 659, 784].forEach((f, i) => tone(f, 0, 0.12, "square", 0.05, i * 0.1)),
    win: () => [523, 659, 784, 1046, 784, 1046].forEach((f, i) => tone(f, 0, 0.14, "square", 0.05, i * 0.11)),
    lose: () => [392, 370, 349, 294].forEach((f, i) => tone(f, i === 3 ? 200 : 0, i === 3 ? 0.5 : 0.18, "triangle", 0.07, i * 0.2)),
  };
  function setMuted(on) {
    muted = on;
    store.set(MUTE_KEY, on ? "1" : "0");
    muteBtn.textContent = on ? "🔇" : "🔊";
    muteBtn.setAttribute("aria-pressed", String(on));
    muteBtn.setAttribute("aria-label", on ? "Turn sound on" : "Mute sound");
  }
  setMuted(muted);
  muteBtn.addEventListener("click", () => { setMuted(!muted); canvas.focus({ preventScroll: true }); });

  /* ---------- Game state ---------- */
  let state = "title";      // title, select, days, intro, play, end, champion, paused
  let pausedFrom = null, pausedT = 0;
  let stateT = 0;
  let hero = 0, preview = 0;
  let dayIdx = 0, day = DAYS[0];
  let timeLeft = 0, score = 0, combo = 0, lastTask = null, lastTick = 99;
  let stats = null, result = null;
  let beds = [];
  const kid = { x: 140, y: 110, hands: [], queue: [], target: null, workT: 0, face: 1, walking: false };
  let save = { stars: [0, 0, 0, 0, 0] };
  try { Object.assign(save, JSON.parse(store.get(SAVE_KEY)) || {}); } catch (e) { /* fresh save */ }
  const bits = [];
  const popups = [];
  let cheerT = 0;

  function setState(s) { state = s; stateT = 0; syncMenus(); }
  const unlocked = () => { let n = 1; for (let i = 0; i < DAYS.length - 1; i++) if (save.stars[i] > 0) n = i + 2; return n; };

  function showTitle() { setState("title"); document.getElementById("startBtn").focus({ preventScroll: true }); }
  function showSelect() {
    setState("select");
    setPreview(hero);
    selectMenu.querySelector(`[data-pick="${hero}"]`).focus({ preventScroll: true });
  }
  function setPreview(i) {
    preview = i;
    selectMenu.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.pick === i)));
  }
  function showDays() {
    setState("days");
    const n = unlocked();
    daysMenu.querySelectorAll("[data-day]").forEach((b) => {
      const d = +b.dataset.day;
      b.disabled = d >= n;
      b.textContent = `Day ${d + 1}${save.stars[d] ? " " + "★".repeat(save.stars[d]) : d >= n ? " 🔒" : ""}`;
    });
    const first = daysMenu.querySelector(`[data-day="${Math.min(n - 1, DAYS.length - 1)}"]`);
    first.focus({ preventScroll: true });
  }

  function startDay(i) {
    audio();
    dayIdx = i;
    day = DAYS[i];
    timeLeft = day.time * 1000;
    score = 0; combo = 0; lastTask = null; lastTick = 99;
    stats = { tasks: 0, sold: 0, wilted: 0, bestCombo: 0 };
    bits.length = popups.length = 0;
    Object.assign(kid, { x: 130, y: 112, hands: [], queue: [], target: null, workT: 0, face: 1, walking: false });
    beds = BED_ORDER.slice(0, day.beds).map((slot, n) => ({
      x: BED_SLOTS[slot][0], y: BED_SLOTS[slot][1], state: "rest", restT: 600 + n * 1600,
      task: null, patience: 0, maxPatience: 1, stage: 0, crop: pick(CROPS), growT: 0, extra: null, shake: 0, wiltT: 0,
    }));
    canvas.focus({ preventScroll: true });
    setState("intro");
    SFX.start();
  }

  function endDay() {
    const stars = score >= day.expert ? (stats.wilted === 0 ? 3 : 2) : score >= day.goal ? 1 : 0;
    result = { stars, passed: stars > 0, last: dayIdx === DAYS.length - 1 };
    if (stars > save.stars[dayIdx]) { save.stars[dayIdx] = stars; store.set(SAVE_KEY, JSON.stringify(save)); }
    kid.queue.length = 0; kid.target = null;
    (result.passed ? SFX.win : SFX.lose)();
    setState("end");
  }

  function pause() {
    if (state === "intro" || state === "play") { pausedFrom = state; pausedT = stateT; setState("paused"); }
  }
  function resume() { if (state === "paused") { setState(pausedFrom); stateT = pausedT; } }

  /* ---------- Garden beds ---------- */
  function needs(b, task) {
    b.state = "need";
    b.task = task;
    b.maxPatience = (day.patience + (task === "harvest" ? 3 : 0)) * 1000;
    b.patience = b.maxPatience;
    SFX.need();
  }
  function grow(b, ms, then) { b.state = "grow"; b.task = null; b.growT = ms; b.growMax = ms; b.then = then; }

  function updateBeds(dt) {
    beds.forEach((b) => {
      if (b.shake > 0) b.shake -= dt;
      if (b.state === "rest") {
        b.restT -= dt;
        if (b.restT <= 0) { b.stage = 0; b.extra = null; needs(b, "seeds"); }
      } else if (b.state === "need") {
        b.patience -= dt;
        if (b.patience <= 0) wilt(b);
      } else if (b.state === "grow") {
        b.growT -= dt;
        if (b.growT <= 0) b.then();
      } else if (b.state === "wilt") {
        b.wiltT -= dt;
        if (b.wiltT <= 0) { b.state = "rest"; b.restT = rand(2500, 4000); b.stage = 0; b.crop = pick(CROPS); b.extra = null; }
      }
    });
  }

  // A job got done at a bed: what happens next
  function advance(b, task) {
    if (task === "seeds") { b.stage = 1; needs(b, "water"); }
    else if (task === "water") {
      b.stage = 2;
      grow(b, rand(4000, 6000), () => {
        // Sometimes the garden needs a little extra care before it's ready
        if (Math.random() < day.extra) { b.extra = Math.random() < 0.55 ? "weed" : "compost"; needs(b, b.extra); }
        else { b.stage = 4; needs(b, "harvest"); }
      });
    } else if (task === "weed" || task === "compost") {
      b.extra = null; b.stage = 3;
      grow(b, rand(2500, 3500), () => { b.stage = 4; needs(b, "harvest"); });
    } else if (task === "harvest") {
      b.stage = 0; b.state = "rest"; b.restT = rand(2500, 4000); b.task = null; b.crop = pick(CROPS);
    }
  }

  function wilt(b) {
    b.state = "wilt"; b.wiltT = 1500; b.task = null;
    stats.wilted++;
    combo = 0; lastTask = null;
    score = Math.max(0, score - 15);
    SFX.wilt();
    popup("Wilted! -15", b.x + BED_W / 2, b.y + 6, "#ff6b6b");
  }

  /* ---------- The student ---------- */
  const spotOf = (t) => {
    if (t.kind === "tool") { const s = TOOLS[t.i]; return { x: s.x + s.w + 10, y: s.y + s.h + 4 }; }
    if (t.kind === "stand") return { x: STAND.x + STAND.w + 10, y: STAND.y + 38 };
    const b = beds[t.i];
    return { x: b.x + BED_W / 2, y: b.y + BED_H + 13 };
  };
  const sameTarget = (a, b) => a && b && a.kind === b.kind && a.i === b.i;

  function queueUp(t) {
    if (state !== "play") return;
    if (kid.queue.length >= 6) return;
    kid.queue.push(t);
    SFX.queue();
  }

  function updateKid(dt) {
    if (kid.workT > 0) { kid.workT -= dt; kid.walking = false; return; }
    if (!kid.target) {
      if (!kid.queue.length) { kid.walking = false; return; }
      kid.target = kid.queue.shift();
    }
    const spot = spotOf(kid.target);
    const dx = spot.x - kid.x, dy = spot.y - kid.y;
    const dist = Math.hypot(dx, dy);
    const step = (SPEED * dt) / 1000;
    if (dist > step) {
      kid.x += (dx / dist) * step;
      kid.y += (dy / dist) * step;
      if (Math.abs(dx) > 1) kid.face = dx > 0 ? 1 : -1;
      kid.walking = true;
      return;
    }
    kid.x = spot.x; kid.y = spot.y; kid.walking = false;
    arrive(kid.target);
    kid.target = null;
  }

  function arrive(t) {
    if (t.kind === "tool") {
      const s = TOOLS[t.i];
      if (kid.hands.length >= HANDS) { SFX.wrong(); popup("Hands full!", s.x + s.w / 2, s.y, "#ffd23f"); return; }
      kid.hands.push(s.tool);
      SFX.grab();
    } else if (t.kind === "stand") {
      const veg = kid.hands.filter((h) => CROPS.includes(h));
      if (!veg.length) { SFX.wrong(); popup("Nothing to sell", STAND.x + STAND.w / 2, STAND.y, "#ffd23f"); return; }
      kid.hands = kid.hands.filter((h) => !CROPS.includes(h));
      const pts = veg.length * 40 + (veg.length === 2 ? 20 : 0);
      score += pts;
      stats.sold += veg.length;
      SFX.sell();
      cheerT = 900;
      popup(veg.length === 2 ? `Sold! +${pts} DOUBLE!` : `Sold! +${pts}`, STAND.x + STAND.w / 2 + 20, STAND.y - 4, "#ffd23f");
      burst(STAND.x + STAND.w / 2, STAND.y + 10, 12, ["#ffd23f", "#ffffff", "#7cc85a"]);
    } else {
      const b = beds[t.i];
      const cx = b.x + BED_W / 2;
      if (b.state !== "need") { popup(b.state === "grow" ? "Still growing..." : "Not now", cx, b.y, "#fff8e4"); return; }
      if (b.task === "harvest") {
        if (kid.hands.length >= HANDS) { SFX.wrong(); b.shake = 300; popup("Hands full!", cx, b.y, "#ffd23f"); return; }
        kid.hands.push(b.crop);
        doTask(b, "harvest");
        SFX.pluck();
        return;
      }
      const k = kid.hands.indexOf(b.task);
      if (k < 0) { SFX.wrong(); b.shake = 300; popup(`Needs ${b.task === "weed" ? "weeding" : b.task}!`, cx, b.y, "#ffd23f"); return; }
      kid.hands.splice(k, 1);
      doTask(b, b.task);
      (b.task === "water" ? SFX.water : b.task === "weed" || b.task === "seeds" ? SFX.dig : SFX.grab)();
    }
  }

  function doTask(b, task) {
    const hearts = Math.ceil((b.patience / b.maxPatience) * 3);
    combo = lastTask === task ? combo + 1 : 1;
    lastTask = task;
    stats.tasks++;
    stats.bestCombo = Math.max(stats.bestCombo, combo);
    const pts = 10 + hearts * 5 + (combo - 1) * 5;
    score += pts;
    kid.workT = WORK_MS;
    SFX.task(combo);
    const cx = b.x + BED_W / 2;
    popup(combo > 1 ? `+${pts} x${combo}` : `+${pts}`, cx, b.y + 4, combo > 1 ? "#ff8cc6" : "#fff8e4");
    burst(cx, b.y + BED_H / 2, 8, task === "water" ? ["#7cc6ff", "#ffffff"] : ["#7cc85a", "#a8e384", "#ffd23f"]);
    advance(b, task);
  }

  /* ---------- Effects ---------- */
  function popup(text, x, y, color) { popups.push({ text, x, y, t: 0, color }); }
  function burst(x, y, n, colors) {
    for (let i = 0; i < n; i++) {
      const a = rand(0, Math.PI * 2), v = rand(0.02, 0.09);
      bits.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 0.05, life: 0, max: rand(300, 600), color: pick(colors) });
    }
  }

  /* ---------- Update ---------- */
  function update(dt) {
    stateT += dt;
    if (cheerT > 0) cheerT -= dt;
    if (state === "intro" && stateT >= 1800) setState("play");
    if (state === "play") {
      timeLeft -= dt;
      const secs = Math.ceil(timeLeft / 1000);
      if (secs <= 10 && secs !== lastTick && secs > 0) SFX.tick();
      lastTick = secs;
      updateBeds(dt);
      updateKid(dt);
      if (timeLeft <= 0) { timeLeft = 0; endDay(); }
    }
    if (state === "end" && stateT > 600 && endMenu.hidden) {
      endMenu.hidden = false;
      document.getElementById(result.passed && !result.last ? "nextBtn" : "retryBtn").focus({ preventScroll: true });
    }
    for (let i = bits.length - 1; i >= 0; i--) {
      const p = bits[i];
      p.life += dt; p.vy += 0.0004 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.life >= p.max) bits.splice(i, 1);
    }
    for (let i = popups.length - 1; i >= 0; i--) if ((popups[i].t += dt) > 900) popups.splice(i, 1);
  }

  /* ---------- Drawing ---------- */
  function text(str, x, y, o) {
    o = o || {};
    const size = o.size || 8;
    ctx.font = o.font === "logo" ? `${size}px "Chewy", "Comic Sans MS", cursive` : `${size}px "Press Start 2P", monospace`;
    ctx.textAlign = o.align || "center";
    ctx.textBaseline = "middle";
    if (o.outline !== false) {
      ctx.lineJoin = "round";
      ctx.lineWidth = o.ow || 2;
      ctx.strokeStyle = o.outline || "#2b1a52";
      ctx.strokeText(str, x, y);
    }
    ctx.fillStyle = o.color || "#fff";
    ctx.fillText(str, x, y);
  }
  function sprite(img, x, y, scale) { ctx.drawImage(img, Math.round(x), Math.round(y), img.width * scale, img.height * scale); }
  function panel(x, y, w, h) {
    ctx.fillStyle = "rgba(43, 26, 82, .35)";
    ctx.fillRect(x + 4, y + 4, w, h);
    ctx.fillStyle = "#fff8e4";
    ctx.strokeStyle = "#2b1a52";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(x, y, w, h, 12) : ctx.rect(x, y, w, h);
    ctx.fill();
    ctx.stroke();
  }
  function box(x, y, w, h, fill, r) {
    ctx.fillStyle = "#2b1a52";
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x - 1, y - 1, w + 2, h + 2, (r || 4) + 1) : ctx.rect(x - 1, y - 1, w + 2, h + 2); ctx.fill();
    ctx.fillStyle = fill;
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, r || 4) : ctx.rect(x, y, w, h); ctx.fill();
  }

  // The garden never changes, so it's painted once
  function layer(paint) {
    const c = document.createElement("canvas");
    c.width = W * K; c.height = H * K;
    const g = c.getContext("2d");
    g.setTransform(K, 0, 0, K, 0, 0);
    paint(g);
    return c;
  }
  const GARDEN = layer((g) => {
    g.fillStyle = "#8fd16a"; g.fillRect(0, 0, W, H);
    g.fillStyle = "#6cb84a";
    for (let i = 0; i < 90; i++) { const x = (i * 97) % W, y = 20 + ((i * 53) % (H - 20)); g.fillRect(x, y, 1, 3); g.fillRect(x + 2, y - 1, 1, 4); }
    // Wood-chip paths around the beds
    g.fillStyle = "#d9b98a";
    g.fillRect(62, 20, 4, H - 20);
    g.fillRect(84, 86, 230, 34); g.fillRect(84, 172, 230, 30);
    g.fillStyle = "#c8a070";
    for (let i = 0; i < 160; i++) { const x = 84 + ((i * 37) % 230), y = (i % 2 ? 86 : 172) + ((i * 13) % 28); g.fillRect(x, y, 2, 1); }
    // Tool shed
    g.fillStyle = "#a5643a"; g.fillRect(2, 22, 58, 166);
    g.fillStyle = "#8a5230"; for (let y = 26; y < 188; y += 8) g.fillRect(2, y, 58, 1);
    g.fillStyle = "#e85d75"; g.fillRect(0, 18, 62, 6);
    // Farm stand: striped awning
    for (let i = 0; i < 7; i++) { g.fillStyle = i % 2 ? "#fff8e4" : "#e8352e"; g.fillRect(STAND.x - 2 + i * 8, STAND.y - 2, 8, 8); }
    g.fillStyle = "#c98a4a"; g.fillRect(STAND.x, STAND.y + 6, STAND.w, STAND.h - 6);
    g.fillStyle = "#a5643a"; g.fillRect(STAND.x, STAND.y + 26, STAND.w, 3);
  });

  function drawBed(b, i, now) {
    const sx = b.shake > 0 && !reduceMotion ? Math.round(Math.sin(now / 25) * 2) : 0;
    const x = b.x + sx, y = b.y;
    box(x, y, BED_W, BED_H, "#a5643a", 3);
    const soil = b.extra === "compost" ? "#a8957a" : b.state === "wilt" ? "#7a5a3a" : "#6b4224";
    ctx.fillStyle = soil; ctx.fillRect(x + 4, y + 4, BED_W - 8, BED_H - 8);
    ctx.fillStyle = "rgba(0, 0, 0, .15)";
    for (let k = 0; k < 8; k++) ctx.fillRect(x + 7 + ((k * 23) % (BED_W - 14)), y + 8 + ((k * 7) % (BED_H - 16)), 2, 1);
    // What's growing
    const cx = x + BED_W / 2, cy = y + BED_H / 2;
    if (b.state === "wilt") {
      ctx.fillStyle = "#8a6a3a";
      [-16, 0, 16].forEach((d) => { ctx.fillRect(cx + d, cy - 2, 2, 8); ctx.fillRect(cx + d - 4, cy - 4, 5, 2); });
    } else if (b.stage === 1) {
      ctx.fillStyle = "#e6cfa6";
      [-18, -6, 6, 18].forEach((d, k) => ctx.fillRect(cx + d, cy + (k % 2) * 3, 2, 2));
    } else if (b.stage === 2) {
      [-16, 0, 16].forEach((d) => sprite(FX["🌱"], cx + d - 6, cy - 6, 1));
    } else if (b.stage >= 3) {
      [-18, 0, 18].forEach((d) => sprite(b.stage === 4 ? FX[b.crop] : FX["🌿"], cx + d - 6, cy - 7, 1));
    }
    if (b.state === "grow") {
      // Growing bar
      const total = b.growMax;
      ctx.fillStyle = "rgba(43, 26, 82, .6)"; ctx.fillRect(x + 8, y + BED_H - 7, BED_W - 16, 3);
      ctx.fillStyle = "#a8e384"; ctx.fillRect(x + 8, y + BED_H - 7, Math.round((BED_W - 16) * clamp(1 - b.growT / total, 0, 1)), 3);
    }
    if (b.extra === "weed" && b.state === "need") { sprite(FX["🌿"], x + 2, y + 2, 1); sprite(FX["🌿"], x + BED_W - 14, y + BED_H - 14, 1); sprite(FX["🐛"], x + BED_W - 15, y + 3, 1); }
    // Speech bubble with what it needs and how patient it still is
    if (b.state === "need") {
      const p = b.patience / b.maxPatience;
      const bob = reduceMotion ? 0 : Math.round(Math.sin(now / 250 + i) * 1);
      const bx = cx - 14, by = y - 18 + bob;
      const urgent = p < 0.3 && !reduceMotion && Math.floor(now / 200) % 2;
      box(bx, by, 28, 16, urgent ? "#ffd6d6" : "#ffffff", 4);
      ctx.fillStyle = "#2b1a52"; ctx.beginPath(); ctx.moveTo(cx - 3, by + 16); ctx.lineTo(cx + 3, by + 16); ctx.lineTo(cx, by + 20); ctx.fill();
      sprite(FX[TASK_EMOJI[b.task]], bx + 2, by + 2, 1);
      // Hearts of patience
      const hearts = Math.ceil(p * 3);
      for (let h = 0; h < 3; h++) {
        ctx.fillStyle = h < hearts ? (hearts === 1 ? "#ff4d6d" : "#ff8cc6") : "#d8cfe8";
        const hx = bx + 16 + (h % 2) * 5, hy = by + 3 + Math.floor(h / 2) * 6;
        ctx.fillRect(hx, hy, 2, 2); ctx.fillRect(hx + 2, hy, 2, 2); ctx.fillRect(hx, hy + 2, 4, 1); ctx.fillRect(hx + 1, hy + 3, 2, 1);
      }
    }
    // Keyboard hint: Q W E on the top row, A S D on the bottom
    text("QWEASD"[BED_ORDER[i]], x + BED_W - 5, y + BED_H - 5, { size: 4, color: "rgba(255, 248, 228, .7)", outline: false });
  }

  function drawShed(now) {
    TOOLS.forEach((t, i) => {
      box(t.x, t.y, t.w, t.h, "#e6cfa6", 4);
      sprite(FX[t.emoji], t.x + 4, t.y + 4, 2);
      text(t.label, t.x + 38, t.y + t.h - 6, { size: 4, color: "#2b1a52", outline: false });
      text(String(i + 1), t.x + t.w - 5, t.y + 6, { size: 5, color: "#7d5ad4", outline: false });
    });
    sprite(FX["🧺"], STAND.x + 4, STAND.y + 9, 2);
    text("STAND", STAND.x + 38, STAND.y + 38, { size: 4, color: "#fff8e4" });
    text("5", STAND.x + STAND.w - 5, STAND.y + 13, { size: 5, color: "#fff8e4" });
  }

  function drawKid(img, x, y, now, opts) {
    opts = opts || {};
    const bob = opts.walking && !reduceMotion ? Math.floor(now / 120) % 2 : 0;
    ctx.fillStyle = "rgba(43, 26, 82, .25)";
    ctx.beginPath(); ctx.ellipse(Math.round(x), Math.round(y), 9, 3, 0, 0, Math.PI * 2); ctx.fill();
    const s = opts.scale || 2;
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y) - bob);
    if (opts.face < 0) ctx.scale(-1, 1);
    ctx.drawImage(img, -6 * s, -(img.height / 2) * s, 12 * s, (img.height / 2) * s);   // sprites are 2x resolution
    ctx.restore();
  }

  function drawPlayer(now) {
    drawKid(KIDS[hero].img, kid.x, kid.y, now, { walking: kid.walking, face: kid.face });
    // What they're carrying
    kid.hands.forEach((h, k) => {
      const img = FX[TASK_EMOJI[h] || h];
      sprite(img, kid.x + (k ? 5 : -17), kid.y - 16, 1);
    });
    if (kid.workT > 0) {
      const a = reduceMotion ? 0 : now / 90;
      ctx.fillStyle = "#fff6c2";
      ctx.fillRect(Math.round(kid.x + Math.cos(a) * 12), Math.round(kid.y - 34 + Math.sin(a) * 4), 2, 2);
    }
  }

  function drawQueue() {
    const list = (kid.target ? [kid.target] : []).concat(kid.queue);
    list.forEach((t, n) => {
      let x, y;
      if (t.kind === "tool") { const s = TOOLS[t.i]; x = s.x + s.w - 2; y = s.y + s.h - 4; }
      else if (t.kind === "stand") { x = STAND.x + STAND.w - 2; y = STAND.y + STAND.h - 6; }
      else { const b = beds[t.i]; x = b.x + 6; y = b.y + BED_H - 6; }
      ctx.fillStyle = "#2b1a52"; ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = n === 0 ? "#ffd23f" : "#fff8e4"; ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
      text(String(n + 1), x, y + 1, { size: 4, color: "#2b1a52", outline: false });
    });
  }

  function drawHud(now) {
    ctx.fillStyle = "rgba(43, 26, 82, .9)"; ctx.fillRect(0, 0, W, 18);
    ctx.fillStyle = "#7cc85a"; ctx.fillRect(0, 18, W, 2);
    text(`DAY ${dayIdx + 1}`, 6, 10, { size: 6, align: "left", outline: false, color: "#a8e384" });
    const met = score >= day.goal;
    text(`${score} / ${day.goal}`, 120, 10, { size: 7, outline: false, color: met ? "#ffd23f" : "#fff8e4" });
    if (met) sprite(FX["✨"], 160, 3, 1);
    if (combo > 1) text(`COMBO x${combo}`, 205, 10, { size: 5, outline: false, color: "#ff8cc6" });
    // Hands (tap to empty them)
    for (let k = 0; k < HANDS; k++) {
      box(244 + k * 16, 3, 13, 13, "#4a3a72", 3);
      if (kid.hands[k]) sprite(FX[TASK_EMOJI[kid.hands[k]] || kid.hands[k]], 244 + k * 16, 3, 1);
    }
    const secs = Math.ceil(timeLeft / 1000);
    const urgent = secs <= 10 && (reduceMotion || Math.floor(now / 250) % 2);
    text(`${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`, W - 6, 10, { size: 6, align: "right", outline: false, color: urgent ? "#ff6b6b" : "#fff8e4" });
  }

  function drawWorld(now) {
    ctx.drawImage(GARDEN, 0, 0, W, H);
    drawShed(now);
    beds.forEach((b, i) => drawBed(b, i, now));
    drawQueue();
    drawPlayer(now);
    bits.forEach((p) => { ctx.globalAlpha = 1 - p.life / p.max; ctx.fillStyle = p.color; ctx.fillRect(Math.round(p.x), Math.round(p.y), 2, 2); });
    ctx.globalAlpha = 1;
    popups.forEach((p) => {
      ctx.globalAlpha = Math.min(1, 2 - (p.t / 900) * 2);
      ctx.font = '6px "Press Start 2P", monospace';
      const half = ctx.measureText(p.text).width / 2 + 3;
      text(p.text, clamp(p.x, half, W - half), p.y - (p.t / 900) * 14, { size: 6, color: p.color });
    });
    ctx.globalAlpha = 1;
  }

  // The whole Garden Society lined up (title screen and the champion screen)
  function lineup(now, y, cheer) {
    const step = (W - 44) / (KIDS.length - 1);
    [1, 0].forEach((row) => KIDS.forEach((k, i) => {
      if (i % 2 !== row) return;
      const x = 22 + i * step;
      const hop = cheer && !reduceMotion ? Math.abs(Math.round(Math.sin(now / 150 + i) * 4)) : (reduceMotion ? 0 : Math.floor(now / 400 + i) % 2);
      drawKid(k.img, x, y - hop - row * 12, now, {});
    }));
  }

  function drawTitle(now) {
    ctx.drawImage(GARDEN, 0, 0, W, H);
    ctx.fillStyle = "rgba(43, 26, 82, .25)"; ctx.fillRect(0, 0, W, H);
    const bounce = reduceMotion ? 0 : Math.round(Math.sin(now / 400) * 2);
    text("Garden", W / 2 - 50, 44 + bounce, { font: "logo", size: 38, color: "#a8e384", outline: "#2b1a52", ow: 7 });
    text("Society", W / 2 + 30, 78 - bounce, { font: "logo", size: 34, color: "#ffd23f", outline: "#2b1a52", ow: 7 });
    text("DASH!", W / 2, 108, { font: "logo", size: 26, color: "#ff8cc6", outline: "#2b1a52", ow: 6 });
    ["🍅", "💧", "🌱", "🥕"].forEach((e, i) => sprite(FX[e], [26, 274, 40, 262][i], [34, 34, 96, 96][i], 2));
    lineup(now, 182, false);
  }

  function drawSelect(now) {
    ctx.drawImage(GARDEN, 0, 0, W, H);
    text("Who's on garden duty?", W / 2, 16, { font: "logo", size: 20, color: "#ffd23f", outline: "#2b1a52", ow: 5 });
    panel(40, 30, 240, 130);
    const k = KIDS[preview];
    ctx.fillStyle = "#c9e9ff"; ctx.fillRect(60, 42, 76, 106);
    ctx.fillStyle = "#8fd16a"; ctx.fillRect(60, 124, 76, 24);
    drawKid(k.img, 98, 142, now, { scale: 5, walking: true });
    text(k.name.toUpperCase(), 210, 60, { size: 9, color: "#3f8f2e", outline: false });
    text("GARDEN SOCIETY", 210, 80, { size: 6, color: "#7d5ad4", outline: false });
    const blurb = k.blurb || ["Real names and looks", "coming soon!"];
    blurb.forEach((line, n) => text(line, 210, 104 + n * 12, { size: 5, color: "#2b1a52", outline: false }));
    const total = save.stars.reduce((a, b) => a + b, 0);
    text(`★ ${total} / ${DAYS.length * 3}`, 210, 140, { size: 7, color: "#e0a800", outline: false });
  }

  function drawDays(now) {
    ctx.drawImage(GARDEN, 0, 0, W, H);
    panel(24, 18, 272, 160);
    text("Pick a garden day", W / 2, 36, { font: "logo", size: 24, color: "#3f8f2e", outline: "#2b1a52", ow: 5 });
    drawKid(KIDS[hero].img, 46, 72, now, { walking: true });
    const n = unlocked();
    DAYS.forEach((d, i) => {
      const y = 62 + i * 21;
      const locked = i >= n;
      text(`DAY ${i + 1}  ${d.name.toUpperCase()}`, 66, y, { size: 6, align: "left", color: locked ? "#a89cc8" : "#2b1a52", outline: false });
      text(locked ? "🔒" : `${d.beds} BEDS  GOAL ${d.goal}`, 66, y + 9, { size: 5, align: "left", color: locked ? "#a89cc8" : "#7d5ad4", outline: false });
      const st = save.stars[i];
      for (let s = 0; s < 3; s++) text("★", 250 + s * 12, y + 4, { size: 9, color: s < st ? "#ffd23f" : "#ddd3ee", outline: false });
    });
  }

  function drawIntro() {
    ctx.fillStyle = "rgba(43, 26, 82, .5)"; ctx.fillRect(0, 20, W, H - 20);
    text(`Day ${dayIdx + 1}`, W / 2, 96, { font: "logo", size: 40, color: "#ffd23f", outline: "#2b1a52", ow: 6 });
    text(day.name.toUpperCase(), W / 2, 124, { size: 8, color: "#a8e384" });
    text(`GOAL: ${day.goal} POINTS`, W / 2, 144, { size: 7, color: "#fff8e4" });
  }

  function drawEnd(now) {
    panel(34, 30, 252, 150);
    const r = result;
    text(r.passed ? (r.last ? "Garden Day done!" : "Great job!") : "Not quite!", W / 2, 52, { font: "logo", size: 28, color: r.passed ? "#3f8f2e" : "#ff6b6b", outline: "#2b1a52", ow: 5 });
    for (let s = 0; s < 3; s++) {
      const on = s < r.stars;
      const pop = on && !reduceMotion && stateT < 400 + s * 300 ? 0 : 1;
      text("★", W / 2 - 26 + s * 26, 80, { size: on && pop ? 20 : 18, color: on && pop ? "#ffd23f" : "#ddd3ee", outline: "#2b1a52", ow: 3 });
    }
    text(`SCORE ${score}`, W / 2, 104, { size: 9, color: "#2b1a52", outline: false });
    text(`GOAL ${day.goal}  ·  EXPERT ${day.expert}`, W / 2, 118, { size: 5, color: "#7d5ad4", outline: false });
    text(`JOBS ${stats.tasks}   SOLD ${stats.sold}   BEST COMBO x${stats.bestCombo}`, W / 2, 134, { size: 5, color: "#2b1a52", outline: false });
    text(stats.wilted ? `${stats.wilted} PLANT${stats.wilted > 1 ? "S" : ""} WILTED` : "NO PLANTS WILTED! 🌱", W / 2, 148, { size: 5, color: stats.wilted ? "#e8352e" : "#3f8f2e", outline: false });
    drawKid(KIDS[hero].img, 58, 170, now, { walking: r.passed });
  }

  function drawChampion(now) {
    ctx.drawImage(GARDEN, 0, 0, W, H);
    panel(28, 18, 264, 118);
    text("Garden Champions!", W / 2, 42, { font: "logo", size: 28, color: "#3f8f2e", outline: "#2b1a52", ow: 5 });
    text("The whole garden is growing", W / 2, 66, { size: 6, color: "#2b1a52", outline: false });
    text("thanks to the Garden Society!", W / 2, 78, { size: 6, color: "#2b1a52", outline: false });
    const total = save.stars.reduce((a, b) => a + b, 0);
    text(`★ ${total} / ${DAYS.length * 3}`, W / 2, 100, { size: 9, color: "#e0a800", outline: false });
    lineup(now, 200, true);
    if (!reduceMotion && Math.random() < 0.2) burst(rand(20, 300), rand(140, 170), 3, ["#ffd23f", "#ff8cc6", "#7cc85a"]);
    bits.forEach((p) => { ctx.globalAlpha = 1 - p.life / p.max; ctx.fillStyle = p.color; ctx.fillRect(Math.round(p.x), Math.round(p.y), 2, 2); });
    ctx.globalAlpha = 1;
  }

  function draw(now) {
    ctx.setTransform(K, 0, 0, K, 0, 0);
    ctx.imageSmoothingEnabled = false;
    if (state === "title") return drawTitle(now);
    if (state === "select") return drawSelect(now);
    if (state === "days") return drawDays(now);
    if (state === "champion") return drawChampion(now);
    drawWorld(now);
    drawHud(now);
    if (state === "intro") drawIntro();
    else if (state === "end") drawEnd(now);
    else if (state === "paused") {
      ctx.fillStyle = "rgba(43, 26, 82, .55)"; ctx.fillRect(0, 0, W, H);
      text("Paused", W / 2, H / 2 - 12, { font: "logo", size: 40, color: "#fff8e4", outline: "#2b1a52", ow: 6 });
      text("CLICK OR SPACE TO KEEP GARDENING", W / 2, H / 2 + 22, { size: 6 });
    }
  }

  /* ---------- Input ---------- */
  function syncMenus() {
    titleMenu.hidden = state !== "title";
    selectMenu.hidden = state !== "select";
    daysMenu.hidden = state !== "days";
    if (state !== "end") endMenu.hidden = true;
    if (state === "end" && result) {
      document.getElementById("nextBtn").hidden = !(result.passed && !result.last);
      document.getElementById("nextBtn").textContent = "Next day ▶";
    }
  }

  // What's under a tap on the garden?
  function targetAt(x, y) {
    for (let i = 0; i < TOOLS.length; i++) { const t = TOOLS[i]; if (x >= t.x && x <= t.x + t.w && y >= t.y && y <= t.y + t.h) return { kind: "tool", i }; }
    if (x >= STAND.x - 2 && x <= STAND.x + STAND.w + 2 && y >= STAND.y - 2 && y <= STAND.y + STAND.h) return { kind: "stand" };
    for (let i = 0; i < beds.length; i++) { const b = beds[i]; if (x >= b.x - 4 && x <= b.x + BED_W + 4 && y >= b.y - 22 && y <= b.y + BED_H + 4) return { kind: "bed", i }; }
    return null;
  }
  function emptyHands() {
    if (!kid.hands.length) return;
    kid.hands = kid.hands.filter((h) => CROPS.includes(h));   // tools go back; veggies stay to sell
    SFX.queue();
    popup("Tools back!", kid.x, kid.y - 40, "#fff8e4");
  }

  function primary() {
    if (state === "title") { audio(); showSelect(); }
    else if (state === "paused") resume();
    else if (state === "champion" && stateT > 1200) showDays();
  }

  canvas.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    canvas.focus({ preventScroll: true });
    if (state !== "play") { primary(); return; }
    const r = canvas.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W, y = ((e.clientY - r.top) / r.height) * H;
    if (y < 20) { if (x >= 240 && x <= 276) emptyHands(); return; }
    const t = targetAt(x, y);
    if (t) queueUp(t);
  });

  document.getElementById("startBtn").addEventListener("click", () => { audio(); showSelect(); });
  selectMenu.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-pick]");
    if (b) { hero = +b.dataset.pick; showDays(); }
  });
  selectMenu.querySelectorAll("button").forEach((b) => {
    b.addEventListener("focus", () => setPreview(+b.dataset.pick));
    b.addEventListener("pointerenter", () => setPreview(+b.dataset.pick));
  });
  daysMenu.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-day]");
    if (b && !b.disabled) startDay(+b.dataset.day);
  });
  document.getElementById("daysBack").addEventListener("click", showSelect);
  document.getElementById("nextBtn").addEventListener("click", () => startDay(dayIdx + 1));
  document.getElementById("retryBtn").addEventListener("click", () => startDay(dayIdx));
  document.getElementById("menuBtn").addEventListener("click", () => {
    if (result && result.passed && result.last) { setState("champion"); SFX.win(); } else showDays();
  });

  const BED_KEYS = { q: 0, w: 1, e: 2, a: 3, s: 4, d: 5 };
  window.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.key === "Tab" || e.key === "Shift") return;
    if (e.target.tagName === "BUTTON" && (e.key === " " || e.key === "Enter")) return;
    const key = e.key.toLowerCase();
    let handled = true;
    if (state === "play" && key >= "1" && key <= "4") queueUp({ kind: "tool", i: +key - 1 });
    else if (state === "play" && key === "5") queueUp({ kind: "stand" });
    else if (state === "play" && key in BED_KEYS) {
      const i = beds.findIndex((b, n) => BED_ORDER[n] === BED_KEYS[key]);
      if (i >= 0) queueUp({ kind: "bed", i });
    } else if (state === "play" && key === "x") emptyHands();
    else if (key === " " || key === "enter") { if (!e.repeat) primary(); }
    else if (key === "m") setMuted(!muted);
    else if (key === "p") (state === "paused" ? resume() : pause());
    else if (key === "escape") {
      if (state === "play" || state === "intro") pause();
      else if (state === "days") showSelect();
      else if (state === "select") showTitle();
      else if (embedded) { try { window.parent.postMessage({ yvyArcade: "close" }, location.origin); } catch (err) { /* ignore */ } }
    } else handled = false;
    if (handled) e.preventDefault();
  });

  document.addEventListener("visibilitychange", () => { if (document.hidden) pause(); });
  window.addEventListener("blur", pause);

  /* ---------- Go! ---------- */
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(50, now - last);
    last = now;
    if (state !== "paused") update(dt);
    draw(now);
    requestAnimationFrame(frame);
  }
  syncMenus();
  requestAnimationFrame(frame);
  if (!embedded) document.getElementById("startBtn").focus({ preventScroll: true });
})();
