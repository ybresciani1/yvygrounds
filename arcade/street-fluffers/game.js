/*
 * 🥊 Street Fluffers: a tiny YvyGrounds arcade fighting game.
 * Pick a critter (Peaches, Bojjii, Lychee, Penny, Riot, Beyonce or Snow) and
 * fight your way up the ladder against the rest of the crew, one stage each,
 * Mortal Kombat style. Pets bap and kick in little boxing gloves; chickens peck
 * and kick with their feet. Everyone's two special moves come from their
 * Critter of the Month trading card (js/data.js), acted out like the card
 * animations. Beat everyone and you're the champ (party hat included).
 *
 * Plain canvas, no libraries. Drawn on a 320x240 "pixel" grid, scaled K times.
 */
(function () {
  "use strict";

  const W = 320, H = 240, K = 3;
  const FLOOR_Y = 190;          // where the fighters' feet touch the ground
  const ROUND_SECS = 60;
  const WINS_NEEDED = 2;
  const MAX_HP = 100;
  const HURT_W = 28, HURT_H = 44;  // everyone is the same size to hit, whatever they look like
  const SPEED = 95, JUMP = 315;     // ...and walks and jumps the same, so nobody has the edge
  const GRAVITY = 900;
  const RECORD_KEY = "yvy-fluffers-ladder";
  const MUTE_KEY = "yvy-arcade-muted";
  const KO_FREEZE = 260;        // the last hit freezes for a moment (hitstop)...
  const KO_SLOW = 2600;         // ...then plays out in slow motion, easing back to full speed
  const TYPE_MS = 34;           // speech box typing speed
  const STORY_MS = 30;          // story caption typing speed

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const muteBtn = document.getElementById("mute");
  const selectMenu = document.getElementById("select");
  const ladderMenu = document.getElementById("ladderMenu");
  const overMenu = document.getElementById("overMenu");
  const overA = document.getElementById("overA");
  const overB = document.getElementById("overB");
  const talkMenu = document.getElementById("talkMenu");
  const titleMenu = document.getElementById("titleMenu");
  const storyMenu = document.getElementById("storyMenu");
  const pad = document.getElementById("pad");
  const embedded = window.self !== window.top;
  if (embedded) document.body.classList.add("embedded");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let touchUI = window.matchMedia("(pointer: coarse)").matches;

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage blocked */ } },
  };
  const lerp = (a, b, t) => a + (b - a) * Math.min(1, Math.max(0, t));
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (list) => list[Math.floor(Math.random() * list.length)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const shuffle = (list) => list.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map((p) => p[1]);

  if (document.fonts) {
    document.fonts.load('8px "Press Start 2P"');
    document.fonts.load('40px "Chewy"');
  }

  /* ---------- Pixel sprites (letter grids, like js/pixels.js) ---------- */
  const ART = {
    // Pets stand up like little boxers: a front-facing head (same as Bowl Brawl) on a body.
    // Peaches: fox-faced Pomeranian, mid "hehe"
    peaches: {
      colors: { O: "#eeaa55", C: "#fbe3b8", D: "#b8682a", K: "#2b1a52", W: "#ffffff", P: "#ff6fa8" },
      grid: [
        ".DD........DD.",
        ".DOD......DOD.",
        ".DOOD....DOOD.",
        ".OOOOOOOOOOOO.",
        "OOOOOOOOOOOOOO",
        "OOKWOOOOOOKWOO",
        "OOKKOOOOOOKKOO",
        "OCCOOCCCCOOCCO",
        "CCCCCCKKCCCCCC",
        ".CCCCCPPCCCCC.",
        "CCCCCCCCCCCCCC",
        "OCCCCCCCCCCCCO",
        ".OCCCOOOOCCCO.",
        "..CC......CC..",
      ],
    },
    peachesBody: {
      colors: { O: "#eeaa55", C: "#fbe3b8", D: "#b8682a" },
      grid: [
        "...OOOOOO...",
        "..OOCCCCOO..",
        ".OOCCCCCCOO.",
        ".OOCCCCCCOO.",
        ".OOCCCCCCOO.",
        "..OOCCCCOO..",
        "...OOOOOO...",
        "...OO..OO...",
        "...DO..OD...",
        "...CC..CC...",
      ],
    },
    // Lychee: gray tabby with his orange collar charm. Very dignified.
    lychee: {
      colors: { G: "#7d7a82", S: "#4a4650", L: "#c4bfc7", E: "#c9d86a", K: "#2b1a52", N: "#e58a9a", O: "#ff8a1e" },
      grid: [
        ".S..........S.",
        ".GS........SG.",
        ".GGS......SGG.",
        ".GGGSGSSGSGGG.",
        "GGGGGSGGSGGGGG",
        "GGEKGGGGGGEKGG",
        "SGEEGGGGGGEESS",
        "GGGGGLLLLGGGGG",
        "SGGGLLNNLLGGGS",
        ".GGGLLLLLLGGG.",
        "..GGGOOOOGGG..",
        ".SGGGGOGGGGGS.",
        ".GGSGGGGGGSGG.",
        "..LL......LL..",
      ],
    },
    lycheeBody: {
      colors: { G: "#7d7a82", S: "#4a4650", L: "#c4bfc7" },
      grid: [
        "....GGGG....",
        "...GSLLSG...",
        "..GGLLLLGG..",
        "..SGLLLLGS..",
        "..GGLLLLGG..",
        "..SGLLLLGS..",
        "...GGGGGG...",
        "...GG..GG...",
        "...SG..GS...",
        "...LL..LL...",
      ],
    },
    // Bojjii (German Shepherd x Aussie, we think). The big guy: golden-ginger and fluffy, dark ear tips
    // and muzzle, a cream-white chest and a brown tail.
    bojjii: {
      colors: { T: "#d9934a", D: "#5a3a26", L: "#f6e6cc", K: "#120e18", W: "#ffffff", N: "#2b1a1a", P: "#ff6fa8" },
      grid: [
        ".D........D.",
        ".DD......DD.",
        ".DTD....DTD.",
        ".TTTTTTTTTT.",
        "TTDTTTTTTDTT",
        "TKWTTTTTTKWT",
        "LTTTTDDTTTTL",
        ".LTTDNNDTTL.",
        ".LLTDDDDTLL.",
        "..LLLPPLLL..",
      ],
    },
    bojjiiBody: {
      colors: { T: "#d9934a", S: "#b8763a", L: "#f6e6cc" },
      grid: [
        "...TTTTTTTT...",
        "..TTLLLLLLTT..",
        ".STLLLLLLLLTS.",
        ".STLLLLLLLLTS.",
        ".STTLLLLLLTTS.",
        ".STTTLLLLTTTS.",
        "..TTTTTTTTTT..",
        "...TTTTTTTT...",
        "...TTT..TTT...",
        "...TTT..TTT...",
        "...TTT..TTT...",
        "...LLL..LLL...",
      ],
    },
    // Penny: black and tan like Bojjii, with big ears, a white chest, her pink collar and red heart tag.
    penny: {
      colors: { B: "#2b2433", T: "#d8b088", L: "#f0dcc0", K: "#120e18", W: "#ffffff", P: "#ff8cc6", R: "#e8352e" },
      grid: [
        "BB..........BB",
        "BLB........BLB",
        "BLLB......BLLB",
        ".BLLBBBBBBLLB.",
        "..BBBBBBBBBB..",
        ".BBTBBBBBBTBB.",
        ".BKWBBBBBBKWB.",
        ".TKKTBBBBTKKT.",
        ".TTTTBBBBTTTT.",
        "..TTTTBBTTTT..",
        "..TTTTKKTTTT..",
        "...TTTTTTTT...",
        "...PPPPPPPP...",
        "......RR......",
      ],
    },
    pennyBody: {
      colors: { B: "#2b2433", T: "#d8b088", W: "#ffffff", L: "#f0dcc0" },
      grid: [
        "...BBBBBB...",
        "..BBWWWWBB..",
        ".BBWWWWWWBB.",
        ".BBWWWWWWBB.",
        ".BBTWWWWTBB.",
        "..BBTWWTBB..",
        "...BBBBBB...",
        "...TT..TT...",
        "...TT..TT...",
        "...LL..LL...",
      ],
    },
    // Chickens stand side-on (facing right) and fight with their beaks and feet.
    // Riot: Buff Laced Polish, a giant pom-pom that covers her eyes
    riotSide: {
      colors: { C: "#f7e2c2", B: "#f2d3a8", L: "#c99a62", Y: "#ffb62e", R: "#ff4d6d" },
      grid: [
        "..........CCCC..",
        ".........CCCCCC.",
        "LL......CCCCCCCC",
        "BLB.....CCCCCCCC",
        "BBLB....CCCCCCC.",
        ".BBLB...BCCCCCYY",
        ".BBBBBBBBBBBBBY.",
        "..BLBLBLBBBBBR..",
        "..BBLBLBLBBBBR..",
        "..BLBLBLBLBBB...",
        "...BBLBLBLBB....",
        "....BBBBBBB.....",
      ],
    },
    // Beyonce: Golden Laced Polish, dark-laced gold, and you can see her glare
    beyonceSide: {
      colors: { G: "#e8a33a", D: "#6b3e12", K: "#2b1a52", Y: "#ffb62e", R: "#ff4d6d" },
      grid: [
        "..........DGDG..",
        ".........GDGDGD.",
        "DD......DGDGDGDG",
        "GDG.....GDGDGDGD",
        "GGDG....DGDGKKG.",
        ".GGDG...GGGGGGYY",
        ".GGGGGGGGGGGGGY.",
        "..GDGDGDGGGGGR..",
        "..GGDGDGDGGGGR..",
        "..GDGDGDGDGGG...",
        "...GGDGDGDGG....",
        "....GGGGGGG.....",
      ],
    },
    // Snow: Silkie, one big white puff with turquoise ears and a little gray beak
    snowSide: {
      colors: { W: "#ffffff", F: "#e2dbef", K: "#2b1a52", T: "#37c6e6", Y: "#9a94a8" },
      grid: [
        ".........WWWW...",
        "........WWWWWW..",
        "WW.....WWWWWWWW.",
        "WWW....WWWWWKWW.",
        "WWWW...WWWWTWWYY",
        ".WWWW..WWWWWWWY.",
        ".WWWWWWWWWWWWW..",
        "WWFWWFWWFWWWWW..",
        ".WWWWWWWWWWWWW..",
        "..WFWWFWWFWWW...",
        "...WWWWWWWWW....",
        "....WWWWWWW.....",
      ],
    },

    // The Critter of the Month Crown: the prize everyone is fighting over
    crown: {
      colors: { K: "#2b1a52", Y: "#ffd23f", D: "#e0a800", R: "#ff4d6d", B: "#7cc6ff" },
      grid: [
        ".K...K...K.",
        "KYK.KYK.KYK",
        "KYYKYYYKYYK",
        "KYYYYYYYYYK",
        "KYRYYBYYRYK",
        "KYYYYYYYYYK",
        "KDDDDDDDDDK",
        "KKKKKKKKKKK",
      ],
    },

    // Tiny side-view critters for the crowd (the same sprites as the trading cards; they face left)
    miniRiot: {
      colors: { C: "#f7e2c2", B: "#f2d3a8", L: "#c99a62", Y: "#ffb62e" },
      grid: ["..CCCC......", ".CCCCCC.....", "CCCCCCCC....", ".CCCCCC.....", "YYBBBB......", ".BBBBBB..BB.", "..BLBLBBBBB.", "..BBLBLBLBB.", "..BLBLBLBB..", "...BBBBBB...", ".....Y.Y....", "....YY.YY..."],
    },
    miniBeyonce: {
      colors: { G: "#e8a33a", D: "#6b3e12", K: "#2b1a52", Y: "#ffb62e" },
      grid: ["..DGDG......", ".GDGDGD.....", "DGDGDGDG....", ".GDGDGD.....", "YYGKGG......", ".GGGGGG..DD.", "..GDGDGGGDD.", "..GGDGDGDGG.", "..GDGDGDGG..", "...GGGGGG...", ".....Y.Y....", "....YY.YY..."],
    },
    miniSnow: {
      colors: { W: "#ffffff", F: "#e2dbef", K: "#2b1a52", T: "#37c6e6", Y: "#9a94a8", S: "#8a84a3" },
      grid: ["..WWWW......", ".WWWWWW.....", "WWWWWWWW....", ".WWKWWWW....", "YYWWTWWW....", ".WWWWWWW.WW.", "WWWWWWWWWWWW", "WWFWWFWWWFWW", ".WWWWWWWWWW.", "..WWWWWWWW..", "...SSS.SSS..", "...S.....S.."],
    },
    miniPeaches: {
      colors: { O: "#f5a04a", L: "#ffd6a0", K: "#2b1a52" },
      grid: ["............", "..O.O.......", "..OOOO......", ".OKOOOO...O.", "KOLLOOOO.OO.", ".LLOOOOOOOO.", "..OOOOOOOOO.", "..OOOOOOOOO.", "..LOOOOOOOO.", "..OOOOOOOO..", "..OO....OO..", "..OO....OO.."],
    },
    miniBojjii: {
      colors: { T: "#d9934a", B: "#8a5230", L: "#f6e6cc", K: "#2b1a52" },
      grid: ["..B.B.......", "..BTT.......", ".TKTT.......", "BTTTT.......", ".LTTTBBBBB.T", "..TTBBBBBBTT", "..TTTBBBBTT.", "..TTTTTTTT..", "..LT....TL..", "..T.....T...", "..T.....T...", ".TT....TT..."],
    },
    miniLychee: {
      colors: { G: "#9a8a78", D: "#5a4a3e", L: "#d8ccb8", K: "#2b1a52", P: "#ff8cc6" },
      grid: ["............", "............", "..G.G.......", "..GGG......G", ".GKGG......G", "PGLGG......G", ".LLGG.....G.", "..GGDGDGDGG.", "..GGGDGDGGG.", "..GDGGGGDGG.", "..GG....GG..", "..GG....GG.."],
    },
    miniPenny: {
      colors: { B: "#2b2433", T: "#d8b088", W: "#ffffff", P: "#ff6fa8" },
      grid: ["............", "............", "..B..B......", "..BTTB......", ".BWBB.......", "TTTBB....B..", "PTTBBBBBBBB.", "..WWBBBBBBB.", "..WWBBBBBB..", "..TT....TT..", "..TT....TT..", "..TT....TT.."],
    },
  };

  // The move effects are the same pixel emoji the trading cards use (js/emoji-sprites.js)
  const FX_ART = {
    "✨": {
      c: { Y: "#ffd23f", G: "#e0a800", W: "#ffffff" },
      g: ["............", ".........Y..", "....G...YWY.", "....Y....Y..", "...YYY......", "..YYWYY.....", "GYYWWWYYG...", "..YYWYY.....", "...YYY...Y..", "....Y...YWY.", "....G....Y..", "............"],
    },
    "💥": {
      c: { K: "#2b1a52", R: "#e8352e", O: "#ff8a1e", Y: "#ffd23f" },
      g: [".K...KK...K.", "KRK.KRRK.KRK", ".KRKKRRKKRK.", "..KROOOORK..", ".KKOOYYOOKK.", "KRROYYYYORRK", "KRROYYYYORRK", ".KKOOYYOOKK.", "..KROOOORK..", ".KRKKRRKKRK.", "KRK.KRRK.KRK", ".K...KK...K."],
    },
    "⚡": {
      c: { K: "#2b1a52", Y: "#ffd23f", W: "#ffffff", D: "#e0a800" },
      g: ["......KKKKK.", ".....KYYYK..", "....KYWYK...", "...KYWYK....", "..KYYYKKKK..", ".KYYYYYYYK..", ".KKKKYYYK...", "....KYYK....", "...KYYK.....", "...KYDK.....", "..KYK.......", "..KK........"],
    },
    "💕": {
      c: { K: "#2b1a52", P: "#ff8cc6", H: "#ff4d8d", W: "#ffffff" },
      g: ["........K.K.", ".......KHKHK", ".......KHHHK", "........KHK.", "..KK..KK.K..", ".KPPKKPPK...", ".KPWPPPPK...", ".KPPPPPPK...", "..KPPPPK....", "...KPPK.....", "....KK......", "............"],
    },
    "🌼": {
      c: { K: "#2b1a52", Y: "#ffd23f", O: "#ff8a1e" },
      g: ["....KKKK....", "..KKKYYKKK..", ".KYYKYYKYYK.", ".KYYYKKYYYK.", "KKKKKOOKKKKK", "KYYKOOOOKYYK", "KYYKOOOOKYYK", "KKKKKOOKKKKK", ".KYYYKKYYYK.", ".KYYKYYKYYK.", "..KKKYYKKK..", "....KKKK...."],
    },
    "🎀": {
      c: { K: "#2b1a52", P: "#ff8cc6", H: "#ffd6ec", D: "#ff4d8d", R: "#ff4d8d" },
      g: ["............", ".KK......KK.", "KPPKK..KKPPK", "KPHPPKKPPPDK", "KPPPKRRKPPDK", "KPPPKRRKPPDK", "KPPKKRRKKPDK", ".KKKPKKPKKK.", "..KPK..KPK..", ".KPK....KPK.", ".KK......KK.", "............"],
    },
    "🎉": {
      c: { K: "#2b1a52", Y: "#ffd23f", O: "#ff8a1e", P: "#ff4d8d", S: "#37c6e6", G: "#7cc85a" },
      g: ["....P.....Y.", ".......S....", "..Y.....SP..", "......G.....", "...K......S.", "..KOK...Y...", "..KYOK.....P", ".KYOYOK.....", ".KOYOYOK....", ".KYOKKK.....", "KOKK........", "KK.........."],
    },
    "🎾": {
      c: { K: "#2b1a52", Y: "#d4e84a", L: "#eef78a", W: "#ffffff" },
      g: ["....KKKK....", "..KKYYYYKK..", ".KYLLYYYWYK.", ".KLLYYYWYYK.", "KYLYYYWYYYYK", "KYYYYWYYYYYK", "KYYYWYYYYYYK", "KYYWYYYYYYYK", ".KYWYYYYYYK.", ".KYYWYYYYYK.", "..KKYYYYKK..", "....KKKK...."],
    },
    "🥞": {
      c: { K: "#2b1a52", T: "#e0c98e", G: "#e0a800", B: "#a0643a", Y: "#ffd23f" },
      g: ["............", "............", ".....KK.....", "....KYYK....", "..KKBBBBKK..", ".KTBBBBBBTK.", "KGGBGGGBGGGK", "KTTBTTTTTTTK", "KGGGGGGGGGGK", "KTTTTTTTTTTK", "KGGGGGGGGGGK", ".KKKKKKKKKK."],
    },
    "🥒": {
      c: { K: "#2b1a52", G: "#3f8f2e", L: "#7cc85a", D: "#2a6a20", B: "#a0643a" },
      g: ["........KKKB", ".......KLGGK", "......KLGGDK", ".....KLGLDK.", "....KLGGDK..", "...KLLGDK...", "..KLGGDK....", ".KLGLDK.....", "KLGGDK......", "KGGDK.......", ".KKK........", "............"],
    },
    "💤": {
      c: { K: "#2b1a52", L: "#c9b8f2", S: "#7cc6ff" },
      g: [".......KKKKK", ".......KSSSK", ".......KKKSK", "........KSKK", "KKKKKKKKSSSK", "KLLLLLKKKKKK", "KKKKLLK.....", "..KLLK......", ".KLLK.......", "KLLKKKK.....", "KLLLLLK.....", "KKKKKKK....."],
    },
    "💖": {
      c: { K: "#2b1a52", H: "#ff4d8d", P: "#ff8cc6", W: "#ffffff", M: "#c72a6e" },
      g: ["............", "..KKK..KKK..", ".KHPPKKHHHK.", "KHPWHHHHHHHK", "KHWWWHHHHHMK", "KHHWHHHHWHMK", ".KHHHHHHHMK.", "..KHHHHHMK..", "...KHHHMK...", "....KHMK....", ".....KK.....", "............"],
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
  function bake(name, allWhite) {
    const art = ART[name];
    const colors = Object.assign({}, art.colors);
    if (allWhite) Object.keys(colors).forEach((k) => { colors[k] = "#ffffff"; });
    return bakeGrid(art.grid, colors);
  }
  const IMG = {};
  Object.keys(ART).forEach((name) => { IMG[name] = bake(name); IMG[name + "Flash"] = bake(name, true); });
  // Pets' pupils glance toward their opponent. The eye stays put (white, or green for
  // Lychee) and only the pupil slides from side to side inside it. Peaches keeps her
  // black button eyes, and just the little white shine moves (shineOnly).
  //   rows/letters: the eye pixels in the head art, and what fills the gap they leave
  //   sockets: top-left of each 2-pixel-wide eye, h: how tall the eyes are
  const EYES = {
    peaches: { rows: { 5: "O", 6: "O" }, letters: "KW", sockets: [[2, 5], [10, 5]], h: 2, white: "#ffffff", pupil: "#2b1a52", shineOnly: true },
    lychee: { rows: { 5: "G", 6: "G" }, letters: "EK", sockets: [[2, 5], [10, 5]], h: 2, white: "#c9d86a", pupil: "#2b1a52" },
    bojjii: { rows: { 5: "T" }, letters: "KW", sockets: [[1, 5], [9, 5]], h: 1, white: "#ffffff", pupil: "#120e18" },
    penny: { rows: { 6: "B", 7: "T" }, letters: "KW", sockets: [[2, 6], [10, 6]], h: 2, white: "#ffffff", pupil: "#120e18" },
  };
  Object.keys(EYES).forEach((id) => {
    const art = ART[id], e = EYES[id];
    const isEye = (ch, y) => e.rows[y] && e.letters.includes(ch);
    IMG[id + "NoEyes"] = bakeGrid(art.grid.map((row, y) => [...row].map((ch) => (isEye(ch, y) ? e.rows[y] : ch)).join("")), art.colors);
  });
  const FX = {};
  Object.keys(FX_ART).forEach((k) => { FX[k] = bakeGrid(FX_ART[k].g, FX_ART[k].c); });

  /* ---------- The critters ---------- */
  // Everyone has the same strength. Specials come from their trading cards:
  //   dash  : runs at you (Blind Charge, Hehe Bite)        burst : a close-up flourish that stuns (Hair Flip)
  //   stomp : jumps and sends a shockwave (Coop Rules)      bolt  : a stunning projectile (glares and stares)
  //   roll  : loafs and rolls a cucumber (Veggie Lounge)    drop  : a pancake falls on you (Pancake Stare)
  //   spin  : spins in place, hitting up close              hug   : heals, and hugs whoever is close
  //   hide  : can't be found, can't be hit
  const CHARS = {
    peaches: {
      name: "Peaches", kind: "pet", type: "Fashion", headScale: 2, headDrop: 4,
      quote: "Fashion first. Fighting second.",
      main: "#eeaa55", light: "#fbe3b8", dark: "#b8682a", glove: "#ff6fa8", mini: "miniPeaches",
      specials: [
        { name: "Outfit Change", fx: "🎀", kind: "spin", dmg: 10, range: 36, move: 40, startup: 120, dur: 650, cool: 2600, outfit: true,
          blurb: "Spins into a brand new outfit" },
        { name: "Hehe Bite", fx: "💥", kind: "dash", dmg: 10, speed: 240, dist: 80, startup: 110, cool: 2600, chomp: true,
          blurb: "A tiny, very dramatic nibble" },
      ],
      win: "The crowd goes wild for the outfit!",
      lose: "Peaches does her sad hamster face.",
      sayWin: ["Did you see my outfit? EVERYONE saw my outfit.", "Hehe! Tiny teeth, big win!"],
      sayLose: ["This outfit was supposed to be lucky...", "Hmph. I'm still the cutest one here."],
    },
    bojjii: {
      name: "Bojjii", kind: "pet", type: "Gentle Giant", headScale: 3, headDrop: 6,
      quote: "Fight now, pancakes later!",
      main: "#d9934a", light: "#f6e6cc", dark: "#5a3a26", glove: "#e8352e", mini: "miniBojjii",
      specials: [
        { name: "Ball Frenzy", fx: "🎾", kind: "spin", dmg: 10, range: 36, move: 0, startup: 120, dur: 700, cool: 2600, balls: true,
          blurb: "Spins and sprays tennis balls" },
        { name: "Pancake Stare", fx: "🥞", kind: "drop", dmg: 10, startup: 480, cool: 2600, pose: "glare",
          blurb: "Stares until a pancake drops on you" },
      ],
      win: "Good game! Now... pancakes?",
      lose: "Bojjii flops over for belly rubs.",
      sayWin: ["Good game! Now... pancakes?", "FETCH! I mean... I win!"],
      sayLose: ["That's okay. Belly rubs instead?", "I just wanted to play ball..."],
    },
    lychee: {
      name: "Lychee", kind: "pet", type: "Loaf", headScale: 2, headDrop: 4,
      quote: "Wake me when it's over.",
      main: "#7d7a82", light: "#c4bfc7", dark: "#4a4650", glove: "#ff8a1e", mini: "miniLychee",
      specials: [
        { name: "Veggie Lounge", fx: "🥒", kind: "roll", dmg: 10, speed: 165, startup: 260, dur: 750, cool: 2600,
          blurb: "Loafs low and rolls a cucumber" },
        { name: "Unimpressed Stare", fx: "💤", kind: "bolt", shot: "zzz", dmg: 6, speed: 170, stun: 900, status: "SNOOZING...", statusFx: "💤", startup: 340, cool: 3000, pose: "glare",
          blurb: "So boring you fall asleep" },
      ],
      win: "I wasn't even trying. Mrrp.",
      lose: "Lychee pretends he slipped.",
      sayWin: ["I wasn't even trying. Mrrp.", "This cucumber is mine now."],
      sayLose: ["I meant to do that.", "I'm going back to my nap."],
    },
    penny: {
      name: "Penny", kind: "pet", type: "Sweetheart", headScale: 2, headDrop: 4,
      quote: "Spin first, snuggle after!",
      main: "#2b2433", light: "#d8b088", dark: "#120e18", glove: "#ff6fa8", mini: "miniPenny",
      specials: [
        { name: "Happy Circles", fx: "💖", kind: "spin", dmg: 0, range: 36, move: 0, startup: 100, dur: 800, cool: 3000, heal: 6,
          stun: 900, status: "SMILING!", statusFx: "💕", unblockable: true,
          blurb: "Spins until everyone is smiling" },
        { name: "Chocolate Stash", fx: "💖", kind: "hide", dur: 1500, heal: 8, cool: 3000, cover: "blanket",
          blurb: "Hides under the blankets (+health)" },
      ],
      win: "Happy circles for everybody!",
      lose: "Penny curls up under the blankets.",
      sayWin: ["Happy circles for everybody!", "I saved you some chocolate! ...For momma."],
      sayLose: ["That's okay! I still love you.", "Time for blankets and snuggles."],
    },
    riot: {
      name: "Riot", kind: "bird", type: "Pom-Pom", side: "riotSide", legs: "#ffb62e", mini: "miniRiot",
      quote: "Where's my opponent? Over there?",
      specials: [
        { name: "Blind Charge", fx: "💨", kind: "dash", dmg: 10, speed: 260, dist: 150, startup: 200, cool: 2600, blind: true,
          blurb: "Can't see you. Hits anyway" },
        { name: "Hair Flip", fx: "✨", kind: "burst", dmg: 6, range: 44, stun: 900, status: "DAZZLED!", statusFx: "✨", startup: 260, cool: 3000,
          blurb: "So fabulous you can't move" },
      ],
      win: "Couldn't see a thing. Still won!",
      lose: "Riot walks into the fence. Again.",
      sayWin: ["I couldn't see a thing! Did I win?!", "Pom-pom power!"],
      sayLose: ["Who turned off the lights?", "Ow. That fence came out of nowhere."],
    },
    beyonce: {
      name: "Beyonce", kind: "bird", type: "Diva", side: "beyonceSide", legs: "#ffb62e", mini: "miniBeyonce",
      quote: "My coop. My rules. My crown.",
      specials: [
        { name: "Coop Rules", fx: "💥", kind: "stomp", dmg: 10, range: 100, speed: 230, startup: 120, cool: 2600,
          blurb: "A stomp everyone has to obey" },
        { name: "Signature Glare", fx: "⚡", kind: "bolt", shot: "bolt", dmg: 6, speed: 170, stun: 900, status: "THINKING ABOUT IT", statusFx: "⚡", startup: 300, cool: 3000, pose: "glare",
          blurb: "Think about what you did" },
      ],
      win: "The coop runs on MY rules.",
      lose: "Beyonce demands a recount.",
      sayWin: ["The coop runs on MY rules.", "Bow down, hun."],
      sayLose: ["I demand a recount.", "This never happened. Got it?"],
    },
    snow: {
      name: "Snow", kind: "bird", type: "Cloud", side: "snowSide", legs: "#8a84a3", fluffyFeet: true, mini: "miniSnow",
      quote: "Everyone gets a hug. Even you.",
      specials: [
        { name: "Marshmallow Hug", fx: "💕", kind: "hug", heal: 8, range: 36, stun: 900, status: "HUGGED!", statusFx: "💕", startup: 300, cool: 3000,
          blurb: "Heals up, then hugs you tight" },
        { name: "Puffball Camo", fx: "🌼", kind: "hide", dur: 1500, heal: 8, cool: 3000, cover: "flowers",
          blurb: "Hides in dandelions (+health)" },
      ],
      win: "A big marshmallow hug for the loser.",
      lose: "Snow floats off for a cloud nap.",
      sayWin: ["Come here, everyone gets a hug!", "Fluffy AND victorious."],
      sayLose: ["That's okay... I'll float off for a cloud nap.", "Hugs anyway?"],
    },
  };
  const ROSTER = ["peaches", "bojjii", "lychee", "penny", "riot", "beyonce", "snow"];

  // What they say after a match, depending on who they beat (or lost to):
  // TALK[winner][loser] = [what the winner says, what the loser says back]
  const TALK = {
    peaches: {
      bojjii: ["Sorry, big guy. Fashion beats fetch.", "You looked so pretty doing it, Peaches."],
      lychee: ["Who's leaving the room NOW, Lychee?", "I'm only lying down because I want to."],
      penny: ["Penny! Twirl with me! Victory twirl!", "You're so fancy, Peaches! Happy circles!"],
      riot: ["Riot, sweetie, your hair is in your eyes.", "Peaches? Is that you? Where did you go?"],
      beyonce: ["New coop rule: Peaches wins. Write it down.", "Ugh. Fine. You can make ONE rule."],
      snow: ["You're the fluffiest, Snow... but I'm the fanciest!", "Your outfit is so pretty! Hug?"],
    },
    bojjii: {
      peaches: ["Good game, Peaches! Share a pancake?", "Ew! You got slobber on my outfit!"],
      lychee: ["Lychee! Play ball with me now? Please?", "Do not. Fetch. With me."],
      penny: ["Penny, you're the best! Nap together?", "Yay, Bojjii! I'll share my blanket!"],
      riot: ["Over here, Riot! No, HERE!", "Was that a dog or a really big squirrel?"],
      beyonce: ["New coop rule... pancakes for everyone?", "Big dog, big mistake. I'll remember this."],
      snow: ["Snow! You're like a tennis ball made of clouds!", "Such a sweet boy. Belly rubs for you."],
    },
    lychee: {
      peaches: ["Peaches. Leave the room.", "I'm telling Yvy you were mean!"],
      bojjii: ["Do not bring me that ball.", "You won, Lychee! Can I lick you?"],
      penny: ["Fine, Penny. You may sit near me. Briefly.", "Yay, Lychee! Can I nap next to you?"],
      riot: ["You walked into me. I simply stayed still.", "Was that a cat? Or a fuzzy cucumber?"],
      beyonce: ["Your rules bore me.", "Unimpressed? I'll show you unimpressed!"],
      snow: ["...Okay, Snow. You can be my pillow.", "Nap time? I'll be your cloud."],
    },
    penny: {
      peaches: ["Happy circles, Peaches! You did so good!", "Even when I lose, I look adorable."],
      bojjii: ["I love you, Bojjii! Snuggle time?", "Penny won! Best day ever!"],
      lychee: ["Lychee! Can we be friends now? Please?", "...Fine. One snuggle. Tell no one."],
      riot: ["Riot! I'm over here! You did great!", "Somebody is spinning. Is it me?"],
      beyonce: ["Don't be grumpy, Beyonce. Have a hug!", "Nobody beats me AND hugs me. Hmph."],
      snow: ["Snow! Let's spin happy circles together!", "My sweet Penny. Come cuddle with me."],
    },
    riot: {
      peaches: ["I bonked someone fancy-smelling! Peaches?", "My outfit! She didn't even LOOK!"],
      bojjii: ["Something big and fluffy fell over. Was it me?", "You're really good at running into things!"],
      lychee: ["I think I bonked a cat. Sorry, cat!", "Beaten by a pom-pom. How embarrassing."],
      penny: ["Penny? Where are you? Did I win?", "You won, Riot! Yay! Watch out for the fence!"],
      beyonce: ["Sis! I beat you! ...I think?", "You can't even SEE, Riot! How?!"],
      snow: ["Snow? Your hug feels like a cloud!", "You did it, Riot! I'll guide you home."],
    },
    beyonce: {
      peaches: ["Cute outfit. Too bad it lost.", "This is NOT my color."],
      bojjii: ["Sit. Stay. Good boy.", "Can I still have a pancake?"],
      lychee: ["Who's unimpressed now, kitty?", "Whatever. I was napping anyway."],
      penny: ["Okay, okay. One hug. Don't tell the coop.", "That's okay! You're still my friend!"],
      riot: ["Sis, the fence is that way.", "I can't see, but I bet you're smirking."],
      snow: ["Even I can't stay mad at that much fluff.", "You run the coop, Beyonce. We know."],
    },
    snow: {
      peaches: ["You're so pretty, Peaches! Come get a hug!", "Beaten by a marshmallow? Honestly."],
      bojjii: ["Good boy, Bojjii! Fluffy hugs for you.", "Snow won! Can I have a fluffy hug?"],
      lychee: ["Shh, Lychee. Rest on my fluff.", "...Your fluff is acceptable. Zzz."],
      penny: ["My sweet Penny. Hug time?", "Snow won! Everybody, happy circles!"],
      riot: ["Riot, sweetie, follow my voice!", "I lost to a cloud? A soft cloud?"],
      beyonce: ["Even bosses need hugs, Beyonce.", "Okay... that hug was really nice."],
    },
  };

  // Regular attacks: frame data in ms. reach = how far the paw/beak/foot sticks out past the body.
  const MOVES = {
    bap:  { startup: 60, active: 90, recover: 130, dmg: 5, stun: 240, block: 150, push: 70 },
    kick: { startup: 150, active: 100, recover: 250, dmg: 10, stun: 380, block: 220, push: 150, heavy: true },
  };
  const WORDS = {
    pet: { bap: ["BAP!", "BOP!", "PAP!"], kick: ["POW!", "WHAM!", "THWACK!"] },
    bird: { bap: ["PECK!", "BOK!", "TOK!"], kick: ["SCRATCH!", "WHAP!", "KICK!"] },
  };

  /* ---------- Stages: each opponent fights you at home ---------- */
  function layer(paint) {
    const c = document.createElement("canvas");
    c.width = W * K;
    c.height = H * K;
    const g = c.getContext("2d");
    g.setTransform(K, 0, 0, K, 0, 0);
    paint(g);
    return c;
  }
  function gradient(g, y0, y1, stops) {
    const gr = g.createLinearGradient(0, y0, 0, y1);
    stops.forEach((s, i) => gr.addColorStop(i / (stops.length - 1), s));
    g.fillStyle = gr;
    g.fillRect(0, 0, W, H);
  }
  function fence(g, top) {
    g.fillStyle = "#fff8e4";
    g.strokeStyle = "#a98fe6";
    g.lineWidth = 1;
    g.fillRect(0, top + 10, W, 4); g.fillRect(0, top + 22, W, 4);
    for (let x = -4; x < W; x += 14) {
      g.beginPath();
      g.moveTo(x, top + 34); g.lineTo(x, top + 6); g.lineTo(x + 5, top); g.lineTo(x + 10, top + 6); g.lineTo(x + 10, top + 34);
      g.closePath(); g.fill(); g.stroke();
    }
  }
  function tufts(g, color, y0, y1, n) {
    g.fillStyle = color;
    for (let i = 0; i < n; i++) {
      const x = (i * 97) % W, y = y0 + ((i * 53) % (y1 - y0));
      if (Math.abs(y - FLOOR_Y) < 12 && x > 20 && x < 300) continue;
      g.fillRect(x, y, 1, 3); g.fillRect(x + 2, y - 1, 1, 4); g.fillRect(x + 4, y + 1, 1, 2);
    }
  }
  function patch(g, a, b) {
    g.fillStyle = a;
    g.beginPath(); g.ellipse(160, FLOOR_Y + 2, 150, 14, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = b;
    g.beginPath(); g.ellipse(160, FLOOR_Y + 3, 130, 9, 0, 0, Math.PI * 2); g.fill();
  }
  function cloud(g, x, y, s) {
    g.fillRect(x, y, 30 * s, 6 * s); g.fillRect(x + 6 * s, y - 4 * s, 14 * s, 4 * s); g.fillRect(x + 4 * s, y + 6 * s, 22 * s, 2 * s);
  }
  function stamp(g, emoji, x, y, s) { g.imageSmoothingEnabled = false; g.drawImage(FX[emoji], x, y, 12 * s, 12 * s); }

  const STAGES = {
    peaches: {
      name: "Sunset Backyard", dust: ["#c8a070", "#e6cfa6"], crowd: [[30, 92], [276, 92], [206, 96]],
      paint(g) {
        gradient(g, 30, 130, ["#7d5ad4", "#ff8cc6", "#ffd08a"]);
        g.fillStyle = "#ffd23f";
        g.beginPath(); g.arc(160, 122, 44, Math.PI, Math.PI * 2); g.fill();
        g.fillStyle = "#ff8a5c";
        [96, 104, 111, 117].forEach((y, i) => g.fillRect(110, y, 100, 2 + i));
        g.fillStyle = "#fff6c2";
        [[24, 40], [60, 54], [252, 44], [292, 60], [210, 36], [120, 46]].forEach(([x, y]) => { g.fillRect(x, y, 1, 3); g.fillRect(x - 1, y + 1, 3, 1); });
        fence(g, 112);
        g.fillStyle = "#8fd16a";
        g.fillRect(0, 144, W, H - 144);
        patch(g, "#d9b98a", "#c8a070");
        tufts(g, "#6cb84a", 150, H - 4, 46);
        g.fillStyle = "#5aa83c";
        g.fillRect(0, H - 6, W, 6);
      },
    },
    bojjii: {
      name: "Pancake Kitchen", dust: ["#ffffff", "#ffd6ec"], crowd: [[176, 106], [212, 106]],
      paint(g) {
        g.fillStyle = "#ffe9a8";
        g.fillRect(0, 0, W, 150);
        // Window with the moon out
        g.fillStyle = "#2b1a52"; g.fillRect(26, 28, 84, 64);
        g.fillStyle = "#3d2f7a"; g.fillRect(30, 32, 76, 56);
        g.fillStyle = "#fff6c2"; g.beginPath(); g.arc(88, 48, 9, 0, Math.PI * 2); g.fill();
        g.fillStyle = "#3d2f7a"; g.beginPath(); g.arc(92, 45, 8, 0, Math.PI * 2); g.fill();
        g.fillStyle = "#fff8e4"; g.fillRect(66, 32, 3, 56); g.fillRect(30, 58, 76, 3);
        g.fillStyle = "#ff8cc6"; g.fillRect(20, 24, 96, 6); // curtain rod ruffle
        for (let x = 20; x < 116; x += 8) { g.beginPath(); g.arc(x + 4, 30, 4, 0, Math.PI); g.fill(); }
        // Cabinets
        g.fillStyle = "#9fd8f2"; g.fillRect(140, 14, 180, 40);
        g.fillStyle = "#7cc6ff"; for (let x = 146; x < 320; x += 44) g.fillRect(x, 20, 38, 28);
        g.fillStyle = "#2b1a52"; for (let x = 146; x < 320; x += 44) g.fillRect(x + 30, 32, 3, 6);
        // Tiled backsplash
        g.fillStyle = "#fff8e4"; g.fillRect(0, 100, W, 30);
        g.fillStyle = "#ffc2df";
        for (let x = 0; x < W; x += 10) g.fillRect(x, 100, 1, 30);
        for (let y = 100; y < 130; y += 10) g.fillRect(0, y, W, 1);
        // Counter with a giant stack of pancakes
        g.fillStyle = "#c98a4a"; g.fillRect(140, 128, 180, 6);
        g.fillStyle = "#fff8e4"; g.fillRect(140, 134, 180, 16);
        g.fillStyle = "#e6cfa6"; for (let x = 150; x < 320; x += 40) g.fillRect(x, 138, 30, 8);
        g.fillStyle = "#fff8e4"; g.fillRect(254, 124, 40, 4);
        for (let i = 0; i < 5; i++) { g.fillStyle = i % 2 ? "#e0a800" : "#e0c98e"; g.fillRect(258, 104 + i * 4, 32, 4); }
        g.fillStyle = "#a0643a"; g.fillRect(258, 102, 32, 3); g.fillRect(262, 105, 3, 8); g.fillRect(282, 105, 3, 12);
        g.fillStyle = "#ffd23f"; g.fillRect(270, 98, 8, 4);
        // Checkered floor
        for (let y = 150; y < H; y += 12) for (let x = 0; x < W; x += 12) {
          g.fillStyle = ((x + y) / 12) % 2 ? "#ffc2df" : "#fff8e4";
          g.fillRect(x, y, 12, 12);
        }
        g.fillStyle = "rgba(43, 26, 82, .12)"; g.fillRect(0, 150, W, 3);
      },
    },
    lychee: {
      name: "Veggie Patch", dust: ["#a0643a", "#c8834f"], crowd: [[36, 98], [262, 98]],
      paint(g) {
        gradient(g, 0, 140, ["#9fd8f2", "#e6dcff"]);
        g.fillStyle = "#ffffff"; cloud(g, 40, 30, 1); cloud(g, 200, 44, 1.2);
        g.fillStyle = "#7cc85a";
        [[30, 112, 40], [100, 116, 34], [220, 110, 44], [290, 118, 36]].forEach(([x, y, r]) => { g.beginPath(); g.arc(x, y, r, Math.PI, Math.PI * 2); g.fill(); });
        // Raised beds full of cucumbers and tomatoes
        [[8, 150], [180, 132]].forEach(([x, w]) => {
          g.fillStyle = "#3f8f2e";
          for (let i = 0; i < w; i += 9) { g.beginPath(); g.arc(x + i + 4, 112 + (i % 3) * 2, 7, 0, Math.PI * 2); g.fill(); }
          g.fillStyle = "#2a6a20";
          for (let i = 4; i < w; i += 17) g.fillRect(x + i, 112, 3, 10);
          g.fillStyle = "#e8352e";
          for (let i = 10; i < w; i += 23) { g.beginPath(); g.arc(x + i, 108, 3, 0, Math.PI * 2); g.fill(); }
          g.fillStyle = "#7cc85a";
          for (let i = 16; i < w; i += 29) g.fillRect(x + i, 114, 3, 9);
          g.fillStyle = "#a5643a"; g.fillRect(x, 120, w, 24);
          g.fillStyle = "#c8834f"; g.fillRect(x, 120, w, 3);
          g.fillStyle = "#7a4526"; for (let i = 0; i < w; i += 30) g.fillRect(x + i, 123, 2, 21);
        });
        g.fillStyle = "#8a5230"; g.fillRect(0, 144, W, H - 144);
        g.fillStyle = "#a0643a";
        for (let i = 0; i < 60; i++) g.fillRect((i * 83) % W, 148 + ((i * 41) % 88), 4, 2);
        patch(g, "#b07040", "#9a5b33");
        g.fillStyle = "#6cb84a"; g.fillRect(0, H - 6, W, 6);
        for (let x = 0; x < W; x += 5) g.fillRect(x, H - 9 + (x % 3), 2, 4);
      },
    },
    riot: {
      name: "Windy Field", dust: ["#e6cf8a", "#c8a070"], crowd: [[242, 110], [274, 110]], wind: true,
      paint(g) {
        gradient(g, 0, 150, ["#a9e4ff", "#e9f8ff"]);
        g.fillStyle = "#ffffff"; cloud(g, 20, 24, 1.2); cloud(g, 150, 40, 1); cloud(g, 250, 20, 1.3);
        g.fillStyle = "#9fdc7c"; g.beginPath(); g.ellipse(80, 150, 140, 40, 0, Math.PI, Math.PI * 2); g.fill();
        g.fillStyle = "#8fd16a"; g.beginPath(); g.ellipse(260, 152, 130, 34, 0, Math.PI, Math.PI * 2); g.fill();
        // Windmill tower (the blades spin, drawn each frame)
        g.fillStyle = "#fff8e4"; g.beginPath(); g.moveTo(52, 140); g.lineTo(60, 62); g.lineTo(68, 62); g.lineTo(76, 140); g.fill();
        g.fillStyle = "#ff8cc6"; g.fillRect(56, 56, 16, 8);
        g.fillStyle = "#a98fe6"; for (let y = 76; y < 140; y += 12) g.fillRect(58 - (y - 76) / 12, y, 12 + (y - 76) / 6, 2);
        // Hay bales
        [[236, 132], [268, 132]].forEach(([x, y]) => {
          g.fillStyle = "#e6c35c"; g.fillRect(x, y, 30, 18);
          g.fillStyle = "#c9a23c"; g.fillRect(x, y + 5, 30, 2); g.fillRect(x, y + 12, 30, 2);
          g.fillStyle = "#f2d98a"; g.fillRect(x, y, 30, 2);
        });
        g.fillStyle = "#b9e29a"; g.fillRect(0, 150, W, H - 150);
        patch(g, "#e6cf8a", "#d9b870");
        tufts(g, "#7cc85a", 154, H - 2, 60);
      },
    },
    beyonce: {
      name: "The Coop", dust: ["#e6cf8a", "#f2e2b0"], crowd: [[22, 86], [276, 86]],
      paint(g) {
        gradient(g, 0, 150, ["#bfe6ff", "#fff0f6"]);
        g.fillStyle = "#ffffff"; cloud(g, 230, 22, 1);
        // Wire fence on the sides
        g.strokeStyle = "rgba(122, 106, 150, .6)"; g.lineWidth = 1;
        for (let x = 0; x < W; x += 8) { g.beginPath(); g.moveTo(x, 106); g.lineTo(x + 8, 150); g.moveTo(x + 8, 106); g.lineTo(x, 150); g.stroke(); }
        g.fillStyle = "#a0643a"; [0, 70, 250, 314].forEach((x) => g.fillRect(x, 100, 6, 50)); g.fillRect(0, 104, W, 3);
        // The coop: pink roof, planks, nest box windows with eggs, door and ramp
        g.fillStyle = "#e8b88a"; g.fillRect(96, 56, 128, 94);
        g.fillStyle = "#d39a6a"; for (let y = 62; y < 150; y += 8) g.fillRect(96, y, 128, 1);
        g.fillStyle = "#e85d75"; g.beginPath(); g.moveTo(86, 60); g.lineTo(160, 16); g.lineTo(234, 60); g.fill();
        g.fillStyle = "#a8324d"; for (let i = 0; i < 4; i++) { g.fillRect(96 + i * 10, 52 - i * 6, 128 - i * 20, 2); }
        g.fillStyle = "#fff8e4"; g.fillRect(86, 58, 148, 4);
        g.fillStyle = "#2b1a52"; g.fillRect(108, 72, 30, 22); g.fillRect(182, 72, 30, 22);
        g.fillStyle = "#e6cf8a"; g.fillRect(110, 84, 26, 8); g.fillRect(184, 84, 26, 8);
        g.fillStyle = "#fff8e4"; g.fillRect(116, 80, 6, 7); g.fillRect(126, 81, 6, 6); g.fillRect(192, 80, 6, 7);
        g.fillStyle = "#ffd23f"; g.fillRect(200, 81, 6, 6);
        g.fillStyle = "#7a4526"; g.fillRect(148, 106, 24, 44);
        g.fillStyle = "#ff8cc6"; g.fillRect(156, 116, 8, 7);
        g.fillStyle = "#c98a4a"; g.beginPath(); g.moveTo(148, 150); g.lineTo(172, 150); g.lineTo(186, 162); g.lineTo(134, 162); g.fill();
        // Straw
        g.fillStyle = "#e6cf8a"; g.fillRect(0, 150, W, H - 150);
        g.fillStyle = "#c9a23c";
        for (let i = 0; i < 90; i++) { const x = (i * 67) % W, y = 154 + ((i * 29) % 84); g.fillRect(x, y, 5, 1); g.fillRect(x + 2, y + 1, 4, 1); }
        g.fillStyle = "#f2e2b0"; g.beginPath(); g.ellipse(160, FLOOR_Y + 3, 136, 9, 0, 0, Math.PI * 2); g.fill();
      },
    },
    snow: {
      name: "Cloud Kingdom", dust: ["#ffffff", "#e2dbef"], crowd: [[30, 100], [270, 94]],
      paint(g) {
        gradient(g, 0, 200, ["#c9b8f2", "#ffd6ec", "#c9f0ff"]);
        // Rainbow
        ["#ff8cc6", "#ffb27c", "#ffe27c", "#a8e384", "#9fd8f2", "#c9b8f2"].forEach((c, i) => {
          g.strokeStyle = c; g.lineWidth = 6;
          g.beginPath(); g.arc(160, 178, 130 - i * 6, Math.PI, Math.PI * 2); g.stroke();
        });
        g.fillStyle = "#ffffff";
        [[20, 120], [262, 114], [120, 40], [220, 54]].forEach(([x, y], i) => cloud(g, x, y, i < 2 ? 1.4 : 0.9));
        g.fillStyle = "#fff6c2";
        [[40, 30], [96, 70], [180, 24], [280, 40], [250, 90], [60, 90]].forEach(([x, y]) => { g.fillRect(x, y, 1, 3); g.fillRect(x - 1, y + 1, 3, 1); });
        // A fluffy cloud to stand on
        g.fillStyle = "#e2dbef";
        for (let x = -10; x < W + 20; x += 26) { g.beginPath(); g.arc(x, 184, 18, 0, Math.PI * 2); g.fill(); }
        g.fillRect(0, 184, W, H - 184);
        g.fillStyle = "#ffffff";
        for (let x = 4; x < W + 20; x += 26) { g.beginPath(); g.arc(x, 180, 16, 0, Math.PI * 2); g.fill(); }
        g.fillRect(0, 182, W, 40);
        g.fillStyle = "#f0ebfa"; g.fillRect(0, 222, W, H - 222);
      },
    },
    penny: {
      name: "Blanket Fort", dust: ["#ffc2df", "#ffffff"], crowd: [[22, 124], [278, 124]], lights: true,
      paint(g) {
        g.fillStyle = "#5a3f8f"; g.fillRect(0, 0, W, 150);
        g.fillStyle = "#6b4fa3"; for (let x = 0; x < W; x += 24) g.fillRect(x, 0, 12, 150);
        // Window with the moon and stars
        g.fillStyle = "#fff8e4"; g.fillRect(212, 28, 84, 66);
        g.fillStyle = "#1e1640"; g.fillRect(216, 32, 76, 58);
        g.fillStyle = "#fff6c2"; g.beginPath(); g.arc(270, 50, 9, 0, Math.PI * 2); g.fill();
        [[228, 42], [246, 70], [282, 78], [236, 82]].forEach(([x, y]) => { g.fillRect(x, y, 1, 3); g.fillRect(x - 1, y + 1, 3, 1); });
        g.fillStyle = "#fff8e4"; g.fillRect(252, 32, 3, 58); g.fillRect(216, 60, 76, 3);
        // The blanket fort
        g.fillStyle = "#ff8cc6"; g.beginPath(); g.moveTo(40, 150); g.lineTo(110, 66); g.lineTo(180, 150); g.fill();
        g.fillStyle = "#ffb3d9"; g.beginPath(); g.moveTo(84, 150); g.lineTo(110, 100); g.lineTo(136, 150); g.fill();
        g.fillStyle = "#2b1a52"; g.beginPath(); g.moveTo(96, 150); g.lineTo(110, 118); g.lineTo(124, 150); g.fill();
        g.fillStyle = "#ff4d8d";
        [[66, 128], [90, 96], [140, 120], [152, 136]].forEach(([x, y]) => { g.fillRect(x, y, 2, 2); g.fillRect(x + 3, y, 2, 2); g.fillRect(x, y + 2, 5, 2); g.fillRect(x + 1, y + 4, 3, 1); });
        // Wood floor and a heart rug
        g.fillStyle = "#b9875a"; g.fillRect(0, 150, W, H - 150);
        g.fillStyle = "#a07048"; for (let y = 156; y < H; y += 10) g.fillRect(0, y, W, 1);
        g.fillStyle = "#ffc2df"; g.beginPath(); g.ellipse(160, FLOOR_Y + 3, 140, 13, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = "#ff8cc6"; g.beginPath(); g.ellipse(160, FLOOR_Y + 3, 120, 8, 0, 0, Math.PI * 2); g.fill();
        // Floor cushions for the crowd
        g.fillStyle = "#9fd8f2"; g.fillRect(14, 144, 40, 12);
        g.fillStyle = "#ffd23f"; g.fillRect(270, 144, 40, 12);
      },
    },
  };
  const STAGE_IMG = {};
  function stageImg(id) {
    if (!STAGE_IMG[id]) STAGE_IMG[id] = layer(STAGES[id].paint);
    return STAGE_IMG[id];
  }

  /* ---------- Sound (tiny WebAudio bleeps, battle music and the K.O.! clip) ---------- */
  // Battle music streams from Yvy's Tijuana Estuary Explorer game (nothing loads until a fight starts)
  const MUSIC = [
    "https://tijuana-estuary-game.vercel.app/Sound/Battle/Battle%20Music/Battle%20Music%201.mp3",
    "https://tijuana-estuary-game.vercel.app/Sound/Battle/Battle%20Music/Battle%20Music%202.mp3",
  ];
  const VOLUME_KEY = "yvy-fluffers-volume";
  let actx = null;
  let noiseBuf = null;      // one second of noise, reused by every hit
  let muted = store.get(MUTE_KEY) === "1";
  const vol = { music: 0.5, sfx: 0.8 };
  try { Object.assign(vol, JSON.parse(store.get(VOLUME_KEY)) || {}); } catch (e) { /* defaults */ }
  let sfxGain = null, musicGain = null, musicEl = null, musicTrack = -1, musicOn = false;
  // The announcer (deep, echoey voice clips in this folder)
  const CLIPS = { ko: "ko.wav", double: "double-ko.wav", win: "you-win.wav", perfect: "perfect.wav" };
  const clipBuf = {};
  function audio() {
    if (!actx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) {
        actx = new AC({ latencyHint: "interactive" });
        sfxGain = actx.createGain();
        sfxGain.gain.value = vol.sfx;
        sfxGain.connect(actx.destination);
        loadClips();
      }
    }
    if (actx && actx.state === "suspended") actx.resume();
    return actx;
  }
  const out = (a) => sfxGain || a.destination;

  function loadClips() {
    Object.keys(CLIPS).forEach((name) => {
      fetch(CLIPS[name]).then((r) => r.arrayBuffer())
        .then((b) => new Promise((res, rej) => actx.decodeAudioData(b, res, rej)))
        .then((buf) => { clipBuf[name] = buf; })
        .catch(() => { /* no clip, the bleeps still play */ });
    });
  }
  function announce(name, delay) {
    if (muted || !clipBuf[name] || !actx) return;
    const src = actx.createBufferSource();
    src.buffer = clipBuf[name];
    src.connect(out(actx));
    src.start(actx.currentTime + (delay || 0));
  }

  // Music goes through its own gain so the volume slider works everywhere (iPhones ignore audio.volume)
  function musicPlayer() {
    if (musicEl) return musicEl;
    musicEl = new Audio();
    musicEl.crossOrigin = "anonymous";
    musicEl.loop = true;
    musicEl.preload = "none";
    const a = audio();
    if (a && a.createMediaElementSource) {
      try {
        musicGain = a.createGain();
        a.createMediaElementSource(musicEl).connect(musicGain).connect(a.destination);
      } catch (e) { musicGain = null; }
    }
    return musicEl;
  }
  function applyVolume() {
    const m = muted ? 0 : vol.music;
    if (musicGain && actx) { musicGain.gain.cancelScheduledValues(actx.currentTime); musicGain.gain.setValueAtTime(musicOn ? m : 0, actx.currentTime); }
    else if (musicEl) musicEl.volume = m;
    if (sfxGain) sfxGain.gain.value = vol.sfx;
  }
  function playMusic(track, fromTop) {
    const el = musicPlayer();
    if (musicTrack !== track) { musicTrack = track; el.src = MUSIC[track]; }
    else if (fromTop) el.currentTime = 0;
    musicOn = true;
    applyVolume();
    const pr = el.play();
    if (pr && pr.catch) pr.catch(() => { /* offline or blocked: play on without music */ });
  }
  function resumeMusic() { if (musicTrack >= 0) playMusic(musicTrack, false); }
  function stopMusic(fadeMs) {
    musicOn = false;
    if (!musicEl || musicEl.paused) return;
    if (fadeMs && musicGain && actx) {
      musicGain.gain.cancelScheduledValues(actx.currentTime);
      musicGain.gain.setValueAtTime(musicGain.gain.value, actx.currentTime);
      musicGain.gain.linearRampToValueAtTime(0, actx.currentTime + fadeMs / 1000);
      setTimeout(() => { if (!musicOn) musicEl.pause(); }, fadeMs + 50);
    } else musicEl.pause();
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
    o.connect(g).connect(out(a));
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
    src.connect(filter).connect(g).connect(out(a));
    src.start(t, Math.random() * (1 - dur), dur);
  }
  // A critter cry: a sliding pitch with vibrato and a little grit, through a vowel-ish filter
  // o: { mid (pitch halfway), type, vib (Hz), vibDepth, fA/fB (filter sweep, like "ee" to "ow"), q, vol, delay }
  let grit = null;
  function cry(f0, f1, dur, o) {
    if (muted) return;
    const a = audio();
    if (!a) return;
    o = o || {};
    if (!grit) { grit = new Float32Array(256); for (let i = 0; i < 256; i++) { const x = i / 128 - 1; grit[i] = Math.tanh(x * 2.5) / Math.tanh(2.5); } }
    const t = a.currentTime + (o.delay || 0);
    const osc = a.createOscillator();
    osc.type = o.type || "sawtooth";
    osc.frequency.setValueAtTime(f0, t);
    if (o.mid) osc.frequency.linearRampToValueAtTime(o.mid, t + dur * 0.35);
    osc.frequency.exponentialRampToValueAtTime(f1, t + dur);
    if (o.vib) {
      const lfo = a.createOscillator(), depth = a.createGain();
      lfo.frequency.value = o.vib;
      depth.gain.value = o.vibDepth || f1 * 0.04;
      lfo.connect(depth).connect(osc.frequency);
      lfo.start(t); lfo.stop(t + dur + 0.05);
    }
    const shape = a.createWaveShaper();
    shape.curve = grit;
    const filt = a.createBiquadFilter();
    filt.type = "bandpass";
    filt.Q.value = o.q || 1.1;
    filt.frequency.setValueAtTime(o.fA || f0 * 2, t);
    filt.frequency.exponentialRampToValueAtTime(o.fB || f1 * 2, t + dur);
    const g = a.createGain();
    const v = o.vol || 0.22;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + 0.015);
    g.gain.setValueAtTime(v, t + dur * 0.7);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(shape).connect(filt).connect(g).connect(out(a));
    osc.start(t); osc.stop(t + dur + 0.05);
  }
  const bark = (f, delay, vol) => { cry(f, f * 0.6, 0.11, { delay, vol: vol || 0.25, fA: 1400, fB: 700, q: 0.9 }); noise(0.07, 0.12, 1500, delay); };
  const cluck = (f, delay, vol) => { cry(f, f * 0.8, 0.07, { delay, type: "square", vol: vol || 0.16, fA: 1500, q: 1.4 }); cry(f * 0.85, f * 1.35, 0.12, { delay: delay + 0.08, type: "square", vol: vol || 0.16, fA: 1700, q: 1.4 }); };
  // What each critter cries out as they go down (cats, dogs and chickens, not people!)
  const KO_CRIES = {
    peaches: () => { bark(1000, 0); bark(1050, 0.13); cry(1300, 480, 0.6, { delay: 0.28, vib: 9, vibDepth: 35, fA: 2000, fB: 900 }); },             // yip yip yeeelp
    bojjii: () => { bark(330, 0, 0.3); cry(340, 250, 1.1, { delay: 0.18, mid: 470, type: "triangle", vib: 5, vibDepth: 12, fA: 800, fB: 520, q: 0.8, vol: 0.32 }); }, // WOOF, awoooo
    penny: () => { [0, 0.1, 0.2].forEach((d) => bark(1250, d, 0.18)); cry(900, 560, 0.65, { delay: 0.34, mid: 1150, type: "triangle", vib: 11, vibDepth: 28, vol: 0.2 }); }, // yip yip yip, whimper
    lychee: () => { cry(250, 300, 0.16, { vib: 25, vibDepth: 20, fA: 600, fB: 700, vol: 0.18 }); cry(420, 380, 0.8, { delay: 0.14, mid: 760, vib: 6, vibDepth: 14, fA: 2600, fB: 650, q: 1.6, vol: 0.26 }); }, // mrr... mee-OWWW
    riot: () => { cluck(720, 0); cluck(640, 0.24); cluck(560, 0.48); cry(620, 300, 0.55, { delay: 0.74, type: "square", fA: 1300, fB: 800, q: 1.3, vol: 0.18 }); }, // bawk bawk bawk BAWWWK
    beyonce: () => { cry(540, 450, 0.1, { type: "square", fA: 1400, q: 1.4, vol: 0.18 }); cry(620, 430, 0.55, { delay: 0.12, mid: 1050, fA: 1600, fB: 1100, q: 2, vol: 0.24 }); }, // buh-GAWWK!
    snow: () => { [1600, 1400, 1200].forEach((f, i) => cry(f, f * 1.18, 0.08, { delay: i * 0.18, type: "triangle", fA: 3000, q: 0.7, vol: 0.14 - i * 0.03 })); cry(1000, 680, 0.45, { delay: 0.6, type: "triangle", fA: 1800, fB: 1300, q: 0.7, vol: 0.1 }); }, // peep, peep... peep
  };
  const bawk = () => { tone(620, 480, 0.09, "square", 0.06); tone(520, 820, 0.14, "square", 0.06, 0.1); };
  const VOICES = {
    peaches: () => { tone(560, 360, 0.08, "square", 0.06); tone(600, 380, 0.09, "square", 0.06, 0.12); },
    lychee: () => tone(620, 940, 0.28, "triangle", 0.07),
    bojjii: () => { tone(260, 150, 0.14, "square", 0.08); tone(240, 140, 0.16, "square", 0.08, 0.17); },
    penny: () => { tone(900, 700, 0.06, "square", 0.05); tone(950, 720, 0.06, "square", 0.05, 0.09); tone(1000, 760, 0.07, "square", 0.05, 0.18); },
    riot: bawk,
    beyonce: () => { tone(500, 380, 0.1, "square", 0.07); tone(440, 700, 0.18, "square", 0.07, 0.11); },
    snow: () => { tone(1200, 1500, 0.08, "triangle", 0.05); tone(1300, 1600, 0.08, "triangle", 0.05, 0.12); },
  };
  const SFX = {
    swish: () => noise(0.06, 0.08, 3000),
    bap: () => { noise(0.08, 0.2, 1800); tone(320, 160, 0.07, "square", 0.05); },
    pow: () => { noise(0.16, 0.3, 900); tone(180, 60, 0.16, "square", 0.07); },
    block: () => { tone(1300, 900, 0.06, "square", 0.04); noise(0.05, 0.1, 4000); },
    dash: () => { noise(0.3, 0.12, 2200); tone(200, 500, 0.25, "sawtooth", 0.03); },
    sparkle: () => [1320, 1760, 2093].forEach((f, i) => tone(f, 0, 0.08, "square", 0.035, i * 0.05)),
    stomp: () => { tone(120, 40, 0.3, "square", 0.09); noise(0.25, 0.25, 500); },
    zap: () => { tone(1400, 300, 0.18, "sawtooth", 0.05); noise(0.08, 0.1, 5000); },
    snore: () => { tone(160, 120, 0.4, "triangle", 0.07); tone(140, 200, 0.3, "triangle", 0.05, 0.4); },
    roll: () => { for (let i = 0; i < 4; i++) tone(220 + i * 30, 0, 0.05, "square", 0.04, i * 0.07); },
    whistle: () => tone(1800, 500, 0.5, "triangle", 0.05),
    splat: () => { noise(0.18, 0.25, 900); tone(160, 70, 0.14, "square", 0.06); },
    heal: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, 0, 0.12, "triangle", 0.06, i * 0.07)),
    hide: () => { noise(0.14, 0.14, 1600); tone(700, 300, 0.2, "triangle", 0.04); },
    spin: () => tone(300, 900, 0.4, "triangle", 0.05),
    chomp: () => { tone(500, 200, 0.06, "square", 0.06); tone(500, 200, 0.06, "square", 0.06, 0.09); },
    bonk: () => tone(620, 110, 0.22, "square", 0.07),
    jump: () => tone(300, 520, 0.1, "square", 0.03),
    round: () => [523, 659].forEach((f, i) => tone(f, 0, 0.14, "square", 0.05, i * 0.12)),
    fight: () => { tone(880, 0, 0.09, "square", 0.08); tone(1320, 0, 0.2, "square", 0.07, 0.08); },
    ko: () => { tone(150, 32, 0.6, "sine", 0.4); tone(95, 30, 0.45, "square", 0.08); noise(0.45, 0.45, 900); noise(0.14, 0.3, 5200); }, // the big K.O. crunch
    fanfare: () => [523, 659, 784, 1046, 784, 1046].forEach((f, i) => tone(f, 0, 0.14, "square", 0.05, i * 0.11)),
    champ: () => [523, 659, 784, 1046, 1318, 1046, 1318, 1568].forEach((f, i) => tone(f, 0, 0.16, "square", 0.05, i * 0.12)),
    sad: () => [392, 370, 349, 294].forEach((f, i) => tone(f, i === 3 ? 200 : 0, i === 3 ? 0.5 : 0.18, "triangle", 0.07, i * 0.2)),
    tick: () => tone(880, 0, 0.05, "square", 0.04),
  };
  const volPanel = document.getElementById("volPanel");
  const volMusic = document.getElementById("volMusic");
  const volSfx = document.getElementById("volSfx");
  const volMute = document.getElementById("volMute");
  function setMuted(on) {
    muted = on;
    store.set(MUTE_KEY, on ? "1" : "0");
    muteBtn.textContent = on ? "🔇" : "🔊";
    volMute.textContent = on ? "🔊 Sound on" : "🔇 Mute all";
    volMute.setAttribute("aria-pressed", String(on));
    applyVolume();
  }
  setMuted(muted);
  volMusic.value = Math.round(vol.music * 100);
  volSfx.value = Math.round(vol.sfx * 100);
  const saveVolume = () => store.set(VOLUME_KEY, JSON.stringify(vol));
  volMusic.addEventListener("input", () => { vol.music = volMusic.value / 100; applyVolume(); saveVolume(); });
  volSfx.addEventListener("input", () => { vol.sfx = volSfx.value / 100; audio(); applyVolume(); saveVolume(); });
  volSfx.addEventListener("change", () => tone(880, 0, 0.08, "square", 0.06));   // a little test bleep
  volMute.addEventListener("click", () => setMuted(!muted));
  function showVolume(open) {
    volPanel.hidden = !open;
    muteBtn.setAttribute("aria-expanded", String(open));
    if (open) { pause(); volMusic.focus({ preventScroll: true }); }
    else canvas.focus({ preventScroll: true });
  }
  muteBtn.addEventListener("click", () => { audio(); showVolume(volPanel.hidden); });
  // Click anywhere else to close it
  document.addEventListener("pointerdown", (e) => {
    if (!volPanel.hidden && !volPanel.contains(e.target) && e.target !== muteBtn) showVolume(false);
  }, true);

  /* ---------- Game state ---------- */
  let state = "title";      // title, select, ladder, intro, fight, ko, talk, lose, champ, paused
  let pausedFrom = null;
  let stateT = 0;           // ms spent in the current state
  let hero = "peaches";     // who you play as
  let preview = "peaches";  // who the select screen is showing
  let ladder = [];          // the opponents, in order
  let level = 0;            // index into ladder
  let lastBeaten = null;
  let score = 0;            // points for this run up the ladder (for the high score board)
  let story = null;         // the backstory or ending being shown: { kind, panels, i, t, said }
  let round = 0, timeLeft = ROUND_SECS * 1000, clock = 0, lastTick = 0;
  let wins = { p1: 0, p2: 0 };
  let roundResult = null;   // { winner: fighter | null, how: "ko" | "time", perfect }
  let freezeT = 0, shakeT = 0, flashT = 0, cheerT = 0;
  let slow = null;          // K.O. slow motion, zoomed in on the last hit: { t, dur, x, y }
  let fade = null;          // fades between scenes: { t, dur, out, then }
  let talk = null;          // the after-match speech boxes
  let matchWon = false;     // did the player win the match that just ended?
  let pausedT = 0;
  let banner = null;        // "PEACHES used OUTFIT CHANGE!"
  let dress = {};           // outfits Peaches picks up during the current match
  let record = {};          // per critter: { best: levels beaten, champ: times }
  try { record = JSON.parse(store.get(RECORD_KEY)) || {}; } catch (e) { record = {}; }
  let p1 = null, p2 = null;
  const shots = [];
  const bits = [];
  const fxBits = [];
  const popups = [];

  function makeInput() {
    return { left: false, right: false, up: false, bap: -1e9, kick: -1e9, sp1: -1e9, sp2: -1e9 };
  }
  const pin = makeInput();      // the player's buttons
  const cin = makeInput();      // the CPU's buttons
  const motion = [];            // recent ↓ and → presses, for ↓→+BAP / ↓→+KICK specials
  const ai = { next: 0 };

  function makeFighter(id, x, face, input, side) {
    const C = CHARS[id];
    const f = {
      id, C, x, y: FLOOR_Y, vx: 0, vy: 0, kb: 0, face, input, side,
      hp: MAX_HP, trail: MAX_HP, trailT: 0,
      state: "idle", t: 0, move: null, didHit: false, cool: [0, 0], stun: 0,
      sp: null, holdBack: false, hideT: 0, hideHeal: 0, status: null, loaf: false,
    };
    if (C.kind === "pet") {
      const head = IMG[id], body = IMG[id + "Body"];
      f.bw = body.width * 2; f.bh = body.height * 2;
      f.hw = head.width * C.headScale; f.hh = head.height * C.headScale;
      f.height = f.bh + f.hh - C.headDrop;
    } else {
      f.bw = 28; f.height = 43; f.bh = 36;
    }
    // Same reach for everyone
    f.front = HURT_W / 2; f.space = HURT_W;
    f.bapY = -22; f.kickY = -8; f.reachBap = 16; f.reachKick = 20;
    return f;
  }

  function setState(s) { state = s; stateT = 0; syncMenus(); }

  const difficulty = () => clamp(0.32 + level * 0.06, 0, 0.65);
  const opponent = () => ladder[Math.min(level, ladder.length - 1)];

  function saveRecord() { store.set(RECORD_KEY, JSON.stringify(record)); }

  let lineup = null;
  function showTitle() {
    setState("title");
    document.getElementById("startBtn").focus({ preventScroll: true });
  }

  // ----- Story scenes: the backstory after the title screen, and each champion's ending -----
  function startStory(kind) {
    story = { kind, panels: kind === "intro" ? INTRO : ENDINGS[hero].concat(THE_END), i: 0, t: 0, said: 0 };
    setState("story");
    document.getElementById("storyNext").focus({ preventScroll: true });
  }
  const captionDone = () => story.t >= 300 + story.panels[story.i].text.length * STORY_MS;
  function advanceStory() {
    if (state !== "story" || fade) return;
    if (!captionDone()) { story.t = 1e9; return; }          // show the whole caption first
    if (story.i < story.panels.length - 1) transition(() => { story.i++; story.t = 0; story.said = 0; });
    else finishStory();
  }
  function skipStory() {
    if (state !== "story" || fade) return;
    if (story.kind === "intro" || story.i === story.panels.length - 1) finishStory();
    else transition(() => { story.i = story.panels.length - 1; story.t = 0; story.said = 0; });
  }
  function finishStory() {
    if (story.kind === "intro") transition(showSelect);
    else transition(() => { setState("champ"); offerScores(); });
  }

  // The shared high score box (arcade/scores.js) asks for 3-letter initials
  function offerScores() {
    if (!window.YvyScores || !(score > 0)) return;
    setTimeout(() => {
      if (state !== "champ") return;
      YvyScores.show({
        game: "street-fluffers", score, format: (n) => `${n.toLocaleString("en-US")} pts`,
        onPlayAgain: () => startRun(hero),
        onClose: () => overA.focus({ preventScroll: true }),
      });
    }, 900);
  }

  function showSelect() {
    stopMusic(0);
    setState("select");
    const btn = selectMenu.querySelector(`[data-pick="${hero}"]`) || selectMenu.querySelector("button");
    setPreview(btn.dataset.pick);
    btn.focus({ preventScroll: true });
  }

  function setPreview(id) {
    preview = id;
    selectMenu.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.pick === id)));
  }

  function startRun(id) {
    audio();
    hero = id;
    // Everyone else, in a random order; Beyonce runs the coop, so she's always the final boss
    let others = shuffle(ROSTER.filter((c) => c !== id));
    if (others.includes("beyonce")) others = others.filter((c) => c !== "beyonce").concat("beyonce");
    ladder = others;
    level = 0;
    lastBeaten = null;
    score = 0;
    VOICES[id]();
    showLadder();
  }

  function showLadder() {
    setState("ladder");
    document.getElementById("fight").focus({ preventScroll: true });
  }

  function startMatch() {
    playMusic(level === ladder.length - 1 ? 1 : level % 2, true);   // battle music starts with the match
    audio();
    wins = { p1: 0, p2: 0 };
    round = 0;
    dress = {};
    canvas.focus({ preventScroll: true });
    nextRound();
  }

  function nextRound() {
    round++;
    if (round > 1) resumeMusic();
    p1 = makeFighter(hero, 96, 1, pin, 0);
    p2 = makeFighter(opponent(), 224, -1, cin, 1);
    Object.assign(pin, makeInput(), { left: pin.left, right: pin.right, up: pin.up });
    Object.assign(cin, makeInput());
    shots.length = bits.length = fxBits.length = popups.length = 0;
    timeLeft = ROUND_SECS * 1000;
    lastTick = 99;
    roundResult = null;
    banner = null;
    freezeT = 0;
    ai.next = 600;
    setState("intro");
    SFX.round();
  }

  function endRound(winner, how) {
    if (roundResult) return;
    stopMusic(700);           // the music stops when someone wins
    roundResult = { winner, how, perfect: !!winner && winner.hp >= MAX_HP, at: slow ? KO_FREEZE + KO_SLOW : 900, celebrated: false, done: false };
    if (winner) wins[winner === p1 ? "p1" : "p2"]++;
    if (how === "double") { wins.p1++; wins.p2++; }      // both fighters get the round
    // Points for winning a round: health left, time left, and a big bonus for a perfect
    if (winner === p1) {
      roundResult.points = 100 + Math.round(p1.hp) * 10 + Math.ceil(timeLeft / 1000) * 10 + (roundResult.perfect ? 1000 : 0);
      score += roundResult.points;
    }
    setState("ko");
  }

  // The winner puts on the party hat (only now, when they're celebrating)
  function celebrate() {
    const w = roundResult.winner;
    roundResult.celebrated = true;
    if (!w) return;
    w.state = "win"; w.t = 0; w.sp = null; w.hideT = 0; w.move = null;
    burst(w.x, w.y - w.height - 6, 18, ["#ff8cc6", "#ffd23f", "#7cc6ff", "#c9d86a"], 0.12); // confetti
    emitFx("🎉", w.x, w.y - w.height, 4, "pop");
    cheerT = 1500;
    VOICES[w.id]();
    // "YOU WIN!" when this round takes the match (after any "PERFECT!" has finished)
    if (w === p1 && wins.p1 >= WINS_NEEDED && wins.p1 > wins.p2) announce("win", roundResult.perfect ? 1.0 : 0.3);
  }

  function finishRound() {
    roundResult.done = true;
    // First to 2 takes it; if a Double K.O. ties it up at 2-2, there's one more round
    const champ = wins.p1 >= WINS_NEEDED && wins.p1 > wins.p2 ? "p1" : wins.p2 >= WINS_NEEDED && wins.p2 > wins.p1 ? "p2" : null;
    if (!champ && round < 5) { transition(nextRound); return; }
    matchWon = champ ? champ === "p1" : wins.p1 >= wins.p2;
    transition(startTalk);
  }

  // After the match, both critters say something: the winner happy, the loser sad
  function startTalk() {
    const w = matchWon ? p1 : p2, l = matchWon ? p2 : p1;
    const pair = TALK[w.id] && TALK[w.id][l.id];   // matchup lines first, general ones as a backup
    talk = { winner: w.id, loser: l.id, winLine: pair ? pair[0] : pick(w.C.sayWin), loseLine: pair ? pair[1] : pick(l.C.sayLose), t: 0, said: 0 };
    talk.winAt = 350 + talk.loseLine.length * TYPE_MS + 450;
    talk.endAt = talk.winAt + talk.winLine.length * TYPE_MS;
    if (reduceMotion) talk.t = talk.endAt;
    setState("talk");
    document.getElementById("talkNext").focus({ preventScroll: true });
  }

  function advanceTalk() {
    if (state !== "talk" || fade) return;
    if (talk.t < talk.endAt) talk.t = talk.endAt;   // show the whole thing first
    else transition(endMatch);
  }

  // Fade out, do the thing, fade back in
  function transition(then) {
    if (fade && fade.out) return;
    fade = { t: 0, dur: 450, out: true, then };
  }

  function endMatch() {
    const r = record[hero] || (record[hero] = { best: 0, champ: 0 });
    if (matchWon) {
      lastBeaten = opponent();
      score += 1000 * (level + 1);                    // level clear bonus
      level++;
      r.best = Math.max(r.best, level);
      if (level >= ladder.length) {
        r.champ++;
        saveRecord();
        startStory("ending");
        SFX.champ();
        setTimeout(() => VOICES[hero](), 900);
        return;
      }
      saveRecord();
      SFX.fanfare();
      setTimeout(() => VOICES[hero](), 600);
      showLadder();
    } else {
      saveRecord();
      setState("lose");
      SFX.sad();
    }
  }

  function pause() {
    if (state === "intro" || state === "fight" || state === "ko") {
      pausedFrom = state;
      pausedT = stateT;
      setState("paused");
      if (pausedFrom !== "ko") stopMusic(0);
      pin.left = pin.right = pin.up = false;
      document.querySelectorAll(".pad .is-down").forEach((b) => b.classList.remove("is-down"));
    }
  }
  function resume() {
    if (state !== "paused") return;
    setState(pausedFrom);
    stateT = pausedT;
    if (pausedFrom !== "ko") resumeMusic();
  }

  /* ---------- Fighting ---------- */
  const grounded = (f) => f.y >= FLOOR_Y && f.vy >= 0;
  const free = (f) => f.state === "idle" || f.state === "walk";
  const fresh = (pressT) => clock - pressT < 160;      // a press is remembered briefly (input buffer)

  function startMove(f, name) {
    f.state = "attack";
    f.move = name;
    f.t = 0;
    f.didHit = false;
    f.hideT = 0;
    if (grounded(f)) f.vx = 0;
    SFX.swish();
  }

  function startSpecial(f, i) {
    const m = f.C.specials[i];
    f.cool[i] = m.cool;
    f.state = "special"; f.sp = m; f.t = 0;
    f.spHit = false; f.spDone = false; f.dashLeft = m.dist || 0; f.dashEnd = 0;
    f.vx = 0;
    banner = { text: `${f.C.name.toUpperCase()} used ${m.name.toUpperCase()}!`, t: 0, side: f.side };
    if (m.kind === "burst") { f.vy = -230; SFX.sparkle(); }
    else if (m.kind === "stomp") { f.vy = -300; SFX.jump(); }
    else if (m.kind === "dash") (m.chomp ? SFX.chomp : SFX.dash)();
    else if (m.kind === "spin") SFX.spin();
    else if (m.kind === "hide") { f.hideT = m.dur; f.hideHeal = m.heal || 0; SFX.hide(); emitFx(m.fx, f.x, f.y - 16, 6, "pop"); }
    else if (m.kind === "hug") SFX.heal();
    if (m.pose === "glare") emitFx(m.fx, f.x, f.y - f.height, 3, "pop");
  }

  function endSpecial(f) {
    f.state = grounded(f) ? "idle" : "jump";
    f.sp = null;
    f.vx = 0;
    f.loaf = false;
  }

  function hurtbox(f) {
    const h = f.loaf ? HURT_H * 0.45 : HURT_H;
    return { x0: f.x - HURT_W / 2, x1: f.x + HURT_W / 2, y0: f.y - h, y1: f.y };
  }

  function hitbox(f) {
    const reach = f.move === "kick" ? f.reachKick : f.reachBap;
    const front = f.x + f.face * f.front;
    const tip = front + f.face * (reach + 6);
    const y = f.y + (f.move === "kick" ? f.kickY : f.bapY);
    return { x0: Math.min(front, tip), x1: Math.max(front, tip), y0: y - 7, y1: y + 7 };
  }

  const overlap = (a, b) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;

  function heal(f, n) {
    if (!n) return;
    const gained = Math.min(MAX_HP, f.hp + n) - f.hp;
    f.hp += gained;
    f.trail = Math.max(f.trail, f.hp);
    if (gained) popup(`+${gained}`, f.x, f.y - f.height - 8, "#a8e384", 8);
    emitFx("💕", f.x, f.y - f.height / 2, 4, "pop");
  }

  // m: { dmg, stun, block, push, heavy, status, statusFx, unblockable }
  // While the fighters move, their hits wait in hitQueue and then all land together at the end of
  // the frame, so two fighters who hit each other at the same instant both get hit (a trade).
  // K.O.s from those hits are collected in koQueue to spot a Double K.O.
  let hitQueue = null, koQueue = null;
  function flushHits() {
    const q = hitQueue;
    hitQueue = null;
    if (!q || !q.length) return;
    koQueue = [];
    q.forEach((args) => applyHit(...args));
    const kos = koQueue;
    koQueue = null;
    if (kos.length === 2) doubleKO(kos[0].x, kos[0].y);
    else if (kos.length === 1) { announceKO(kos[0].att); endRound(kos[0].att, "ko"); }
  }

  // "K.O.!" and, if the winner never got touched, "PERFECT!"
  function announceKO(winner) {
    announce("ko", 0.5);
    if (winner && winner.hp >= MAX_HP) announce("perfect", 1.7);
  }

  function doubleKO() {
    announce("double", 0.5);
    endRound(null, "double");
  }

  // face: which way the hit pushes (projectiles push the way they fly)
  function applyHit(att, def, m, word, x, y, face) {
    if (hitQueue) { hitQueue.push([att, def, m, word, x, y, face]); return true; }
    face = face || att.face;
    if (def.state === "ko" || state !== "fight") return false;
    if (def.hideT > 0) { popup("MISS", x, y - 8, "#fff8e4", 7); return false; }
    const dmg = m.dmg || 0;
    const blocking = !m.unblockable && def.holdBack && grounded(def) && (free(def) || def.state === "blockstun");
    if (blocking) {
      def.hp -= dmg ? Math.max(1, Math.round(dmg * 0.15)) : 0;
      def.state = "blockstun"; def.t = 0; def.stun = m.block || 180;
      def.kb = face * (m.push || 80) * 0.7;
      SFX.block();
      burst(x, y, 6, ["#ffffff", "#c9f0ff"], 0.08);
      popup("BLOCK", x, y - 8, "#c9f0ff", 7);
    } else {
      def.hp -= dmg;
      def.state = "hit"; def.t = 0; def.stun = m.stun || 300;
      def.sp = null; def.loaf = false; def.move = null;
      def.kb = face * (m.push || 0);
      if (m.status) def.status = { text: m.status, fx: m.statusFx, t: m.stun };
      if (!grounded(def)) def.vy = -140;
      if (dmg) {
        freezeT = m.heavy ? 110 : 70;
        if (m.heavy && !reduceMotion) shakeT = 200;
        (m.heavy ? SFX.pow : SFX.bap)();
        burst(x, y, m.heavy ? 14 : 8, [def.C.main, def.C.light || "#fff", "#ffd23f", "#ffffff"]);
      }
      if (word) popup(word, x, y - 10, m.heavy ? "#ffd23f" : "#ff8cc6", m.heavy ? 18 : 14, true);
      if (m.heavy || m.status) cheerT = 900;
    }
    def.trailT = 500;
    def.move = null;
    if (def.hp <= 0) {
      def.hp = 0;
      def.state = "ko"; def.t = 0; def.status = null;
      def.vy = -230; def.kb = face * 170;
      freezeT = KO_FREEZE;
      if (!reduceMotion) slow = { t: 0, dur: KO_SLOW, x, y };
      flashT = reduceMotion ? 0 : 120;
      if (!reduceMotion) shakeT = 350;
      cheerT = 2000;
      SFX.ko();
      KO_CRIES[def.id]();
      if (koQueue) koQueue.push({ att, def, x, y });     // decided once every hit this frame has landed
      else { announceKO(att); endRound(att, "ko"); }
    }
    return true;
  }

  function updateSpecial(f, o, dt) {
    const m = f.sp, t = f.t;
    const dx = (o.x - f.x) * f.face;              // how far in front the opponent is
    const near = (r, around) => (around ? Math.abs(dx) : dx) > -HURT_W / 2 && Math.abs(dx) < HURT_W + r && Math.abs(o.y - f.y) < 40;
    if (m.kind === "dash") {
      if (t < m.startup) { f.vx = 0; return; }
      if (f.dashLeft > 0 && !f.spHit) {
        f.vx = f.face * m.speed;
        f.dashLeft -= (m.speed * dt) / 1000;
        if (!reduceMotion && Math.random() < 0.6) bits.push({ x: f.x - f.face * 14, y: f.y - rand(6, f.height - 6), vx: -f.face * 0.06, vy: 0, life: 0, max: 220, color: "#ffffff", size: 2, streak: true });
        const hb = { x0: Math.min(f.x, f.x + f.face * (HURT_W / 2 + 8)), x1: Math.max(f.x, f.x + f.face * (HURT_W / 2 + 8)), y0: f.y - HURT_H * 0.8, y1: f.y };
        if (overlap(hb, hurtbox(o))) {
          f.spHit = true; f.dashLeft = 0;
          applyHit(f, o, { dmg: m.dmg, stun: 420, block: 220, push: 170, heavy: true }, m.chomp ? "CHOMP!" : "WHUMP!", f.x + f.face * (f.bw / 2 + 4), f.y - f.height / 2);
          emitFx("💥", f.x + f.face * f.bw / 2, f.y - f.height / 2, 3, "pop");
        } else if (f.x <= 15 || f.x >= W - 15) {
          f.dashLeft = 0;
          if (m.blind) {
            SFX.bonk(); popup("BONK!", f.x, f.y - f.height - 6, "#ffd23f", 14, true);
            f.state = "hit"; f.t = 0; f.stun = 450; f.sp = null; f.vx = 0;
            f.status = { text: "OOPS", fx: "✨", t: 450 };
            return;
          }
        }
      } else {
        f.vx = 0;
        if (!f.dashEnd) f.dashEnd = t;
        if (t - f.dashEnd > 220) endSpecial(f);
      }
    } else if (m.kind === "burst") {
      if (!f.spDone && t >= m.startup) {
        f.spDone = true;
        emitFx(m.fx, f.x + f.face * 24, f.y - f.height / 2, 7, "orbit");
        if (near(m.range)) applyHit(f, o, { dmg: m.dmg, stun: m.stun, block: 200, push: 60, status: m.status, statusFx: m.statusFx }, "FABULOUS!", f.x + f.face * 30, f.y - f.height / 2);
      }
      if (t >= m.startup + 300 && grounded(f)) endSpecial(f);
    } else if (m.kind === "stomp") {
      if (!f.spDone && t > 150 && grounded(f)) {
        f.spDone = true;
        SFX.stomp();
        if (!reduceMotion) shakeT = 260;
        emitFx(m.fx, f.x, f.y - 6, 5, "pop");
        [-1, 1].forEach((d) => shots.push({ owner: f, kind: "quake", x: f.x + d * 12, y: FLOOR_Y - 4, vx: d * m.speed, r: 8, t: 0, life: m.range / m.speed * 1000, ground: true, dmg: m.dmg, stun: 400, push: 120, heavy: true, word: "COOP RULES!" }));
        f.spDoneT = t;
      }
      if (f.spDone && t - f.spDoneT > 260) endSpecial(f);
    } else if (m.kind === "bolt") {
      if (!f.spDone && t >= m.startup) {
        f.spDone = true;
        const zzz = m.shot === "zzz";
        shots.push({ owner: f, kind: m.shot, x: f.x + f.face * (HURT_W / 2 + 8), y: f.y - HURT_H + (zzz ? 8 : 14), y0: f.y - HURT_H + 8, vx: f.face * m.speed, r: 7, t: 0, life: 4000,
          dmg: m.dmg, stun: m.stun, status: m.status, statusFx: m.statusFx, push: 40, word: zzz ? "YAWN!" : "ZAP!" });
        (zzz ? SFX.snore : SFX.zap)();
      }
      if (t >= m.startup + 280) endSpecial(f);
    } else if (m.kind === "roll") {
      f.loaf = true;
      if (!f.spDone && t >= m.startup) {
        f.spDone = true;
        shots.push({ owner: f, kind: "cucumber", x: f.x + f.face * (HURT_W / 2 + 6), y: FLOOR_Y - 7, vx: f.face * m.speed, r: 7, t: 0, life: 4000, ground: true,
          dmg: m.dmg, stun: 320, push: 90, word: "BONK!" });
        SFX.roll();
      }
      if (t >= m.dur) endSpecial(f);
    } else if (m.kind === "drop") {
      if (!f.spDone && t >= m.startup) {
        f.spDone = true;
        shots.push({ owner: f, kind: "pancake", x: clamp(o.x, 16, W - 16), y: -20, vx: 0, vy: 0, delay: 280, r: 11, t: 0, life: 4000, unblockable: true,
          dmg: m.dmg, stun: 450, push: 30, heavy: true, word: "PANCAKE!" });
        SFX.whistle();
      }
      if (t >= m.startup + 260) endSpecial(f);
    } else if (m.kind === "spin") {
      if (t >= m.startup && t < m.dur) {
        if (m.move) f.vx = f.face * (m.move / ((m.dur - m.startup) / 1000));
        if (!reduceMotion && Math.random() < 0.25) emitFx(m.fx, f.x, f.y - f.height / 2, 1, "orbit");
        if (!f.spHit && near(m.range, true)) {
          f.spHit = true;
          applyHit(f, o, { dmg: m.dmg, stun: m.stun || 340, block: 200, push: m.dmg ? 130 : 20, heavy: m.dmg >= 10, status: m.status, statusFx: m.statusFx, unblockable: m.unblockable },
            m.dmg ? (m.balls ? "FETCH!" : "TWIRL!") : "AWW!", f.x + f.face * 20, f.y - f.height / 2);
        }
      } else if (t >= m.dur) {
        if (m.outfit) { dress[f.side] = (dress[f.side] || 0) % 3 + 1; emitFx("🎀", f.x, f.y - f.height, 5, "pop"); }
        if (m.balls) emitFx("🎾", f.x, f.y - f.height / 2, 7, "bounce");
        heal(f, m.heal);
        endSpecial(f);
      }
    } else if (m.kind === "hug") {
      if (!f.spDone && t >= m.startup) {
        f.spDone = true;
        heal(f, m.heal);
        if (near(m.range, true)) applyHit(f, o, { dmg: 0, stun: m.stun, unblockable: true, status: m.status, statusFx: m.statusFx }, "SQUISH!", (f.x + o.x) / 2, f.y - f.height / 2);
      }
      if (t >= m.startup + 450) endSpecial(f);
    } else if (m.kind === "hide") {
      if (t >= 200) endSpecial(f);
    }
  }

  function updateFighter(f, o, dt) {
    const s = dt / 1000;
    const inp = f.input;
    f.t += dt;
    f.cool[0] = Math.max(0, f.cool[0] - dt);
    f.cool[1] = Math.max(0, f.cool[1] - dt);
    if (f.trailT > 0) f.trailT -= dt; else if (f.trail > f.hp) f.trail = Math.max(f.hp, f.trail - dt * 0.06);
    if (f.status && (f.status.t -= dt) <= 0) f.status = null;
    if (f.hideT > 0) {
      f.hideT -= dt;
      if (f.hideT <= 0) { f.hideT = 0; if (f.hideHeal) { heal(f, f.hideHeal); f.hideHeal = 0; } SFX.hide(); }
    }

    const dir = (inp.right ? 1 : 0) - (inp.left ? 1 : 0);
    if (grounded(f) && (free(f) || f.state === "blockstun")) f.face = o.x >= f.x ? 1 : -1;
    f.holdBack = dir !== 0 && dir === -f.face;

    const fighting = state === "fight";
    if (f.state === "idle" || f.state === "walk") {
      if (!fighting) {
        f.vx = 0;
        f.state = "idle";
      } else if (inp.up && grounded(f)) {
        f.state = "jump"; f.t = 0;
        f.vy = -JUMP;
        f.vx = dir * SPEED * 1.1;
        SFX.jump();
      } else if (fresh(inp.sp1) && f.cool[0] <= 0) {
        inp.sp1 = -1e9; startSpecial(f, 0);
      } else if (fresh(inp.sp2) && f.cool[1] <= 0) {
        inp.sp2 = -1e9; startSpecial(f, 1);
      } else if (fresh(inp.kick)) {
        inp.kick = -1e9; startMove(f, "kick");
      } else if (fresh(inp.bap)) {
        inp.bap = -1e9; startMove(f, "bap");
      } else {
        f.vx = dir * SPEED * (f.holdBack ? 0.7 : 1);
        f.state = dir ? "walk" : "idle";
      }
    } else if (f.state === "jump") {
      if (fighting && fresh(inp.kick)) { inp.kick = -1e9; startMove(f, "kick"); }
      else if (fighting && fresh(inp.bap)) { inp.bap = -1e9; startMove(f, "bap"); }
    } else if (f.state === "attack") {
      const m = MOVES[f.move];
      if (!f.didHit && f.t >= m.startup && f.t < m.startup + m.active) {
        const hb = hitbox(f);
        if (overlap(hb, hurtbox(o))) {
          f.didHit = true;
          applyHit(f, o, m, pick(WORDS[f.C.kind][f.move]), (hb.x0 + hb.x1) / 2, (hb.y0 + hb.y1) / 2);
        }
      }
      if (f.state === "attack" && f.t >= m.startup + m.active + m.recover) {
        f.state = grounded(f) ? "idle" : "jump"; f.move = null;
      }
    } else if (f.state === "special") {
      if (fighting) updateSpecial(f, o, dt); else endSpecial(f);
    } else if (f.state === "hit" || f.state === "blockstun") {
      if (f.t >= f.stun) { f.state = grounded(f) ? "idle" : "jump"; f.status = null; }
    }

    // Physics
    const wasAir = !grounded(f);
    if (wasAir || f.vy < 0) f.vy += GRAVITY * s;
    if (f.state === "attack" && grounded(f)) f.vx = 0;
    if (f.state === "hit" || f.state === "blockstun" || f.state === "ko" || f.state === "win") { if (grounded(f)) f.vx = 0; }
    f.x += (f.vx + f.kb) * s;
    f.y += f.vy * s;
    f.kb *= Math.max(0, 1 - 7 * s);
    if (Math.abs(f.kb) < 2) f.kb = 0;
    if (f.y >= FLOOR_Y) {
      f.y = FLOOR_Y;
      if (f.vy > 0) {
        f.vy = 0;
        if (wasAir) {
          burst(f.x, FLOOR_Y, 4, STAGES[opponent()].dust, 0.05);
          if (f.state === "jump" || f.state === "attack") { f.state = "idle"; f.move = null; f.vx = 0; }
        }
      }
    }
    f.x = clamp(f.x, 14, W - 14);
  }

  // Keep the two fighters from standing inside each other (jumping over is fine)
  function separate() {
    if (p1.hideT > 0 || p2.hideT > 0) return;
    const minD = (p1.space + p2.space) / 2 - 6;
    const d = p2.x - p1.x;
    if (Math.abs(d) < minD && Math.abs(p1.y - p2.y) < 24) {
      const push = (minD - Math.abs(d)) / 2;
      const sgn = d === 0 ? (p1.face > 0 ? 1 : -1) : Math.sign(d);
      p1.x = clamp(p1.x - sgn * push, 14, W - 14);
      p2.x = clamp(p2.x + sgn * push, 14, W - 14);
    }
  }

  function updateShots(dt) {
    const s = dt / 1000;
    for (let i = shots.length - 1; i >= 0; i--) {
      const sh = shots[i];
      sh.t += dt;
      if (sh.kind === "pancake") {
        if (sh.t > sh.delay) { sh.vy += GRAVITY * 0.9 * s; sh.y += sh.vy * s; }
      } else {
        sh.x += sh.vx * s;
        if (sh.kind === "zzz") sh.y = sh.y0 + Math.sin(sh.t / 180) * 5;
      }
      if (sh.x < -24 || sh.x > W + 24 || sh.t > sh.life) { shots.splice(i, 1); continue; }
      const target = sh.owner === p1 ? p2 : p1;
      const hb = hurtbox(target);
      const lowEnough = !sh.ground || target.y > FLOOR_Y - 14;
      if (target.state !== "ko" && lowEnough && sh.x + sh.r > hb.x0 && sh.x - sh.r < hb.x1 && sh.y + sh.r > hb.y0 && sh.y - sh.r < hb.y1) {
        shots.splice(i, 1);
        if (sh.kind === "pancake") { SFX.splat(); emitFx("🥞", sh.x, sh.y, 4, "pop"); }
        applyHit(sh.owner, target, sh, sh.word, sh.x, sh.y, Math.sign(sh.vx) || (target.x > sh.x ? 1 : -1));
        continue;
      }
      if (sh.kind === "pancake" && sh.y >= FLOOR_Y - 6) {
        shots.splice(i, 1);
        SFX.splat();
        burst(sh.x, FLOOR_Y - 4, 10, ["#e0c98e", "#e0a800", "#a0643a"], 0.08);
        popup("SPLAT", sh.x, FLOOR_Y - 18, "#e0c98e", 7);
      }
    }
    // Two flying specials meeting in the middle cancel out
    const flyers = shots.filter((sh) => sh.kind === "bolt" || sh.kind === "zzz" || sh.kind === "cucumber");
    for (let a = 0; a < flyers.length; a++) for (let b = a + 1; b < flyers.length; b++) {
      const A = flyers[a], B = flyers[b];
      if (A.owner !== B.owner && Math.abs(A.x - B.x) < A.r + B.r && Math.abs(A.y - B.y) < A.r + B.r + 6) {
        shots.splice(shots.indexOf(A), 1);
        shots.splice(shots.indexOf(B), 1);
        burst((A.x + B.x) / 2, A.y, 14, ["#ffffff", "#ffd23f", "#ff8cc6"], 0.12);
        popup("POOF!", (A.x + B.x) / 2, A.y - 10, "#ffffff", 12, true);
        return;
      }
    }
  }

  /* ---------- CPU opponent ---------- */
  // How well a special fits the moment (0 = not now)
  function specialFit(c, p, m, dist) {
    const low = c.hp < 60;
    switch (m.kind) {
      case "dash": return m.dist > 100 ? (dist > 60 && dist < m.dist + 20 ? 1 : 0) : (dist < 70 ? 1 : 0);
      case "burst": case "spin": return dist < (m.range || 40) + 24 ? (m.heal && !low ? 0.4 : 1) : 0;
      case "stomp": return dist < m.range && p.y > FLOOR_Y - 10 ? 1 : 0;
      case "bolt": case "roll": case "drop": return dist > 80 ? 1 : 0.15;
      case "hug": return low ? 1 : dist < m.range + 10 ? 0.5 : 0;
      case "hide": return low ? 0.6 : 0.15;
      default: return 0;
    }
  }

  function cpuThink() {
    const c = p2, p = p1;
    const lvl = difficulty();
    const dist = Math.abs(p.x - c.x);
    const toward = p.x > c.x ? "right" : "left";
    const away = toward === "right" ? "left" : "right";
    cin.left = cin.right = cin.up = false;
    ai.next = lerp(340, 170, lvl) * rand(0.8, 1.2);

    if (c.state === "jump" && dist < 46) { if (Math.random() < 0.6) cin.kick = clock; return; }
    const incoming = shots.find((s) => s.owner === p && (s.kind === "pancake" ? Math.abs(s.x - c.x) < 22 : Math.sign(s.vx) === Math.sign(c.x - s.x) && Math.abs(s.x - c.x) < 90));
    if (incoming && Math.random() < lvl + 0.15) {
      if (incoming.kind === "pancake") cin[Math.random() < 0.5 ? "left" : "right"] = true;
      else if (incoming.ground || Math.random() < 0.5) { cin.up = true; cin[toward] = true; }
      else cin[away] = true;
      ai.next = 380;
      return;
    }
    if ((p.state === "attack" || p.state === "special") && dist < 60 && Math.random() < lvl * 0.8) { cin[away] = true; ai.next = 300; return; }
    // Card moves: the higher the level, the more often
    if (Math.random() < 0.12 + lvl * 0.35) {
      const options = c.C.specials.map((m, i) => ({ i, fit: c.cool[i] <= 0 ? specialFit(c, p, m, dist) * Math.random() : 0 }))
        .filter((o) => o.fit > 0.1).sort((a, b) => b.fit - a.fit);
      if (options.length) { cin["sp" + (options[0].i + 1)] = clock; return; }
    }
    if (p.hideT > 0) { cin[Math.random() < 0.5 ? away : toward] = true; return; } // can't find them!
    const r = Math.random();
    if (dist > 120) {
      cin[toward] = true;
    } else if (dist > 44) {
      if (r < 0.1) { cin.up = true; cin[toward] = true; }
      else if (r < 0.2) cin[away] = true;
      else cin[toward] = true;
    } else {
      if (r < 0.42) cin.bap = clock;
      else if (r < 0.68) cin.kick = clock;
      else if (r < 0.84) { cin[away] = true; ai.next = 260; }
      else if (r < 0.92) { cin.up = true; cin[away] = true; }
    }
  }

  /* ---------- Effects ---------- */
  function popup(text, x, y, color, size, logo) {
    popups.push({ text, x, y, t: 0, color: color || "#fff", size: size || 7, logo: !!logo });
  }

  function burst(x, y, n, colors, speed) {
    for (let i = 0; i < n; i++) {
      const a = rand(0, Math.PI * 2), v = rand(0.03, speed || 0.12);
      bits.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 0.06, life: 0, max: rand(300, 600), color: pick(colors), size: pick([1, 2, 2, 3]) });
    }
  }

  // The card's little emoji fly out: "pop" floats up, "orbit" swirls around, "bounce" scatters along the ground
  function emitFx(emoji, x, y, n, how) {
    if (reduceMotion || !FX[emoji]) return;
    for (let i = 0; i < n; i++) {
      const a = rand(0, Math.PI * 2);
      fxBits.push({ img: FX[emoji], x: x + rand(-10, 10), y: y + rand(-8, 8), a, r: rand(6, 14), how, life: 0, max: how === "bounce" ? rand(1100, 1500) : rand(700, 1000), cx: x, cy: y,
        vx: rand(-0.14, 0.14), vy: rand(-0.28, -0.14) });
    }
  }

  /* ---------- Update ---------- */
  // Slow motion: 15% speed at first, easing back to full speed
  function slowEase() {
    if (!slow) return 1;
    const k = clamp((slow.t / slow.dur - 0.3) / 0.7, 0, 1);
    return k * k * (3 - 2 * k);
  }
  const timeScale = () => (slow && freezeT <= 0 ? 0.15 + 0.85 * slowEase() : 1);

  function update(realDt) {
    if (fade) {
      fade.t += realDt;
      if (fade.t >= fade.dur) {
        if (fade.out) { const then = fade.then; fade = { t: 0, dur: 450, out: false }; then(); }
        else fade = null;
      }
    }
    if (state === "story") {
      story.t += realDt;
      const said = Math.floor(Math.max(0, story.t - 300) / STORY_MS);
      const len = story.panels[story.i].text.length;
      if (said > story.said && said % 3 === 0 && said < len) tone(rand(420, 620), 0, 0.025, "square", 0.02);
      story.said = said;
    }
    if (state === "talk") {
      const before = talk.t;
      talk.t += realDt;
      // A little Animal Crossing babble while the words type out
      const said = Math.floor(Math.max(0, talk.t - 350) / TYPE_MS) + Math.floor(Math.max(0, talk.t - talk.winAt) / TYPE_MS);
      if (said > talk.said && said % 2 === 0 && before < talk.endAt) {
        const who = talk.t >= talk.winAt ? talk.winner : talk.loser;
        tone(who === talk.winner ? rand(600, 900) : rand(260, 420), 0, 0.03, "square", 0.025);
      }
      talk.said = said;
    }
    const dt = realDt * timeScale();          // the world runs slow during a K.O.
    stateT += realDt;
    if (cheerT > 0) cheerT -= dt;
    if (shakeT > 0) shakeT -= dt;
    if (flashT > 0) flashT -= dt;
    if (banner && (banner.t += dt) > 1300) banner = null;

    if (state === "intro" && stateT >= 1700) { setState("fight"); SFX.fight(); }
    if (state === "fight") {
      timeLeft -= dt;
      const secs = Math.ceil(timeLeft / 1000);
      if (secs <= 5 && secs !== lastTick && secs > 0) SFX.tick();
      lastTick = secs;
      if (timeLeft <= 0) {
        timeLeft = 0;
        endRound(p1.hp > p2.hp ? p1 : p2.hp > p1.hp ? p2 : null, "time");
      }
    }
    if (state === "ko" && roundResult) {
      if (!roundResult.celebrated && stateT >= roundResult.at) celebrate();
      if (!roundResult.done && stateT >= roundResult.at + 1500) finishRound();
    }
    if (state === "lose" && stateT >= 10000) { showSelect(); return; }
    if ((state === "lose" || state === "champ") && stateT > 600 && overMenu.hidden) {
      overMenu.hidden = false;
      overA.focus({ preventScroll: true });
    }
    if (state === "lose") {
      const n = Math.max(0, 9 - Math.floor(stateT / 1000));
      if (overA.dataset.n !== String(n)) { overA.dataset.n = String(n); overA.textContent = `Continue (${n})`; }
    }
    if (state === "champ" && !reduceMotion && Math.random() < 0.15) emitFx(pick(["🎉", "✨", "💖"]), rand(40, 280), rand(40, 120), 1, "pop");

    if (p1 && (state === "intro" || state === "fight" || state === "ko")) {
      if (freezeT > 0) {
        freezeT -= realDt;
      } else {
        if (slow && (slow.t += realDt) >= slow.dur) slow = null;
        clock += dt;
        if (state === "fight") {
          ai.next -= dt;
          if (ai.next <= 0 && (free(p2) || p2.state === "jump")) cpuThink();
        }
        if (state !== "fight") { cin.left = cin.right = cin.up = false; }
        hitQueue = [];
        updateFighter(p1, p2, dt);
        updateFighter(p2, p1, dt);
        flushHits();
        separate();
        updateShots(dt);
      }
    }

    for (let i = bits.length - 1; i >= 0; i--) {
      const b = bits[i];
      b.life += dt;
      if (!b.streak) b.vy += 0.0005 * dt;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      if (b.life >= b.max) bits.splice(i, 1);
    }
    for (let i = fxBits.length - 1; i >= 0; i--) {
      const b = fxBits[i];
      b.life += dt;
      if (b.how === "orbit") { b.a += dt / 160; b.r += dt * 0.03; b.x = b.cx + Math.cos(b.a) * b.r; b.y = b.cy + Math.sin(b.a) * b.r * 0.7; }
      else if (b.how === "bounce") {
        b.vy += 0.0008 * dt; b.x += b.vx * dt; b.y += b.vy * dt;
        if (b.y > FLOOR_Y - 6) { b.y = FLOOR_Y - 6; b.vy *= -0.6; b.vx *= 0.8; }
      }
      else b.y -= dt * 0.04;
      if (b.life >= b.max) fxBits.splice(i, 1);
    }
    for (let i = popups.length - 1; i >= 0; i--) if ((popups[i].t += dt) > 800) popups.splice(i, 1);
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

  function sprite(img, x, y, scale) {
    ctx.drawImage(img, Math.round(x), Math.round(y), img.width * scale, img.height * scale);
  }

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

  // Portrait used on the menus: pets show their face, chickens their whole side
  function portrait(id, cx, bottom, scale, hat) {
    const C = CHARS[id];
    const img = C.kind === "pet" ? IMG[id] : IMG[C.side];
    const s = C.kind === "pet" && C.headScale === 3 ? scale * 1.5 : scale;
    const w = img.width * s, h = img.height * s;
    ctx.drawImage(img, Math.round(cx - w / 2), Math.round(bottom - h), w, h);
    if (hat) {
      const hx = C.kind === "pet" ? cx : cx + w * 0.22;
      partyHat(Math.round(hx), Math.round(bottom - h + s * 1.5), Math.round(5 * s), Math.round(7 * s));
    }
  }

  function drawStage(id, now) {
    const st = STAGES[id];
    ctx.drawImage(stageImg(id), 0, 0, W, H);
    if (st.wind) {
      // Windmill blades and gusts of wind (Riot's weakness)
      const a = reduceMotion ? 0.4 : now / 300;
      ctx.save(); ctx.translate(64, 60); ctx.rotate(a);
      for (let i = 0; i < 4; i++) {
        ctx.rotate(Math.PI / 2);
        ctx.fillStyle = "#fff8e4"; ctx.fillRect(-2, 0, 4, 26);
        ctx.fillStyle = i % 2 ? "#ff8cc6" : "#9fd8f2"; ctx.fillRect(-2 + 4, 6, 8, 20);
      }
      ctx.restore();
      if (!reduceMotion) {
        ctx.fillStyle = "rgba(255, 255, 255, .7)";
        for (let i = 0; i < 5; i++) {
          const x = (now / 4 + i * 83) % (W + 60) - 40, y = 70 + ((i * 37) % 90);
          ctx.fillRect(Math.round(x), y, 22, 1); ctx.fillRect(Math.round(x) + 8, y + 3, 14, 1);
        }
      }
    }
    if (st.lights) {
      for (let i = 0; i < 16; i++) {
        const x = 8 + i * 20, y = 98 + Math.round(Math.sin(i * 0.9) * 4);
        const on = reduceMotion || Math.floor(now / 400 + i) % 3 !== 0;
        ctx.fillStyle = "#2b1a52"; ctx.fillRect(x, y - 3, 1, 3);
        ctx.fillStyle = on ? ["#ffd23f", "#ff8cc6", "#7cc6ff", "#a8e384"][i % 4] : "#6b5a90";
        ctx.fillRect(x - 1, y, 3, 4);
      }
    }
    // The crowd: everyone who isn't fighting cheers from the side
    const fighting = state === "title" ? ROSTER : state === "select" ? [preview] : [hero, opponent()];
    const crowd = ROSTER.filter((c) => !fighting.includes(c));
    st.crowd.forEach(([x, y], i) => {
      const id = crowd[i];
      if (!id) return;
      const img = IMG[CHARS[id].mini];
      const hop = cheerT > 0 && !reduceMotion ? Math.abs(Math.round(Math.sin(now / 90 + i) * 3)) : 0;
      ctx.save();
      ctx.translate(Math.round(x) + (x < 160 ? 24 : 0), Math.round(y) - hop);
      if (x < 160) ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0, 24, 24);
      ctx.restore();
    });
  }

  function paw(x, y, C) {
    ctx.fillStyle = "#2b1a52";
    ctx.fillRect(x - 1, y, 8, 5);
    ctx.fillRect(x, y - 1, 6, 7);
    ctx.fillStyle = C.glove;
    ctx.fillRect(x, y, 6, 5);
    ctx.fillStyle = "rgba(255, 255, 255, .7)";
    ctx.fillRect(x + 1, y + 1, 2, 1);
    ctx.fillStyle = "#fff8e4";
    ctx.fillRect(x, y + 4, 6, 1);
  }

  function arm(x0, x1, y, C) {
    if (x1 <= x0) return;
    ctx.fillStyle = "#2b1a52";
    ctx.fillRect(x0, y, x1 - x0, 5);
    ctx.fillStyle = C.main;
    ctx.fillRect(x0, y + 1, x1 - x0, 3);
  }

  function drawTail(f, now, bt) {
    const C = f.C, x = -f.bw / 2;
    const wag = reduceMotion ? 0 : Math.round(Math.sin(now / 150 + f.side) * 1.5);
    if (f.id === "peaches") {
      ctx.fillStyle = C.main;
      ctx.fillRect(x - 6, bt - 4 + wag, 10, 12);
      ctx.fillRect(x - 9, bt + wag, 4, 8);
      ctx.fillStyle = C.light;
      ctx.fillRect(x - 4, bt - 4 + wag, 5, 3);
      ctx.fillRect(x - 9, bt + 1 + wag, 2, 4);
    } else if (f.id === "lychee") {
      // Fluffy striped tabby tail: starts tucked behind his hip and curls up
      [[-8, -9], [-12, -10], [-15, -13], [-17, -17], [-17, -22], [-15, -26], [-12, -29]].forEach(([tx, ty], i) => {
        const sz = i < 4 ? 8 : i < 6 ? 7 : 6, w = i > 2 ? wag : 0;
        const px = tx + w - sz / 2, py = ty - sz / 2;
        ctx.fillStyle = i % 2 || i === 6 ? C.dark : C.main;   // tabby stripes, dark tip
        ctx.fillRect(px + 1, py, sz - 2, sz);
        ctx.fillRect(px, py + 1, sz, sz - 2);
      });
    } else if (f.id === "penny") {
      // Curly pug tail
      ctx.fillStyle = C.main;
      ctx.fillRect(x - 5, bt + 2 + wag, 7, 3); ctx.fillRect(x - 6, bt - 2 + wag, 3, 5); ctx.fillRect(x - 4, bt - 3 + wag, 4, 2); ctx.fillRect(x - 1, bt - 2 + wag, 2, 3);
    } else {
      // Bojjii: a big fluffy brown tail
      [[-12, -12], [-16, -13], [-19, -15], [-21, -18]].forEach(([tx, ty], i) => {
        const sz = i < 2 ? 9 : i < 3 ? 8 : 7, w = i > 0 ? wag : 0;
        const px = tx + w - sz / 2, py = ty - sz / 2;
        ctx.fillStyle = i === 3 ? "#c98a4a" : i % 2 ? "#8a5230" : "#a8642e";
        ctx.fillRect(px + 1, py, sz - 2, sz);
        ctx.fillRect(px, py + 1, sz, sz - 2);
      });
    }
  }

  // Peaches' outfits, picked up from her Outfit Change spin
  function drawDress(f, ht) {
    const d = dress[f.side];
    if (!d) return;
    if (f.id === "peaches") {
      if (d === 1) { // bunny ears
        ctx.fillStyle = "#2b1a52"; ctx.fillRect(-9, ht - 13, 6, 14); ctx.fillRect(3, ht - 13, 6, 14);
        ctx.fillStyle = "#ffffff"; ctx.fillRect(-8, ht - 12, 4, 12); ctx.fillRect(4, ht - 12, 4, 12);
        ctx.fillStyle = "#ffc2df"; ctx.fillRect(-7, ht - 10, 2, 8); ctx.fillRect(5, ht - 10, 2, 8);
      } else if (d === 2) { // queen bee antennae + crown
        ctx.fillStyle = "#2b1a52"; ctx.fillRect(-6, ht - 10, 1, 8); ctx.fillRect(5, ht - 10, 1, 8);
        ctx.fillStyle = "#ffd23f"; ctx.fillRect(-8, ht - 13, 4, 4); ctx.fillRect(4, ht - 13, 4, 4);
        ctx.fillStyle = "#ffd23f"; ctx.fillRect(-4, ht - 3, 8, 3); ctx.fillRect(-4, ht - 6, 2, 3); ctx.fillRect(-1, ht - 7, 2, 4); ctx.fillRect(2, ht - 6, 2, 3);
      } else { // big pink bow
        ctx.drawImage(FX["🎀"], -8, ht - 8, 16, 16);
      }
    }
  }

  // Striped party hat with a pom-pom, centered on x with its brim at baseY
  function partyHat(x, baseY, w, h) {
    const top = baseY - h;
    for (let i = 0; i <= h; i++) {
      const half = Math.max(1, Math.round((w / 2) * (i / h)));
      ctx.fillStyle = "#2b1a52";
      ctx.fillRect(x - half - 1, top + i, half * 2 + 2, 1);
    }
    for (let i = 1; i < h; i++) {
      const half = Math.round((w / 2) * (i / h));
      if (half < 1) continue;
      ctx.fillStyle = Math.floor(i / 3) % 2 ? "#ffd23f" : "#ff8cc6";
      ctx.fillRect(x - half, top + i, half * 2, 1);
    }
    ctx.fillStyle = "#2b1a52";
    ctx.fillRect(x - 3, top - 4, 6, 5);
    ctx.fillStyle = "#fff8e4";
    ctx.fillRect(x - 2, top - 3, 4, 3);
  }

  function shotColor(f, i) {
    const k = f.C.specials[i].fx;
    return { "🎀": "#ff8cc6", "💥": "#ff8a1e", "🎾": "#d4e84a", "🥞": "#e0c98e", "🥒": "#7cc85a", "💤": "#c9b8f2", "💖": "#ff4d8d", "💨": "#ffffff", "✨": "#ffd23f", "⚡": "#ffd23f", "💕": "#ff8cc6", "🌼": "#ffd23f" }[k] || "#ffd23f";
  }

  // Pose transforms for the card-style special moves
  function specialPose(f, now) {
    const m = f.sp, t = f.t, p = { sx: 1, sy: 1, rot: 0, lean: 0 };
    if (!m || f.state !== "special" || reduceMotion) return p;
    if (m.kind === "spin" && t >= m.startup) p.rot = ((t - m.startup) / (m.dur - m.startup)) * Math.PI * 4;
    else if (m.kind === "burst") p.rot = Math.min(1, t / (m.startup + 300)) * -Math.PI * 2;
    else if (m.kind === "dash") { p.rot = t < m.startup ? -0.1 : 0.18; p.sx = t < m.startup ? 0.9 : 1.05; }
    else if (m.kind === "stomp") { if (!f.spDone) { p.sx = 1.1; p.sy = 1.1; } else { p.sx = 1.25; p.sy = 0.8; } }
    else if (m.kind === "hug") { const k = Math.floor(t / 150) % 2; p.sx = k ? 1.3 : 0.88; p.sy = k ? 0.82 : 1.2; }
    else if (m.kind === "roll") { p.sx = 1.3; p.sy = 0.6; }
    else if (m.pose === "glare" && t < m.startup + 150) { p.sx = p.sy = 1.25; p.lean = 4 + (Math.floor(now / 60) % 2); }
    return p;
  }

  function drawFighter(f, now) {
    const C = f.C;
    const flash = (freezeT > 0 && f.state === "hit") || (f.state === "ko" && f.t < 200);
    let bob = 0, lean = 0, tilt = 0;
    if (f.state === "idle" && !reduceMotion) bob = Math.floor(now / 300 + f.side) % 2;
    if (f.state === "walk" && !reduceMotion) bob = Math.floor(now / 120) % 2;
    if (f.state === "win" && !reduceMotion) bob = Math.abs(Math.round(Math.sin(now / 140) * 4));
    if (f.state === "attack" && C.kind === "pet") lean = 2;
    if (f.state === "hit") { lean = -2; tilt = -0.12; }
    const pose = specialPose(f, now);
    const hidden = f.hideT > 0;

    // Shadow
    ctx.fillStyle = "rgba(43, 26, 82, .25)";
    ctx.beginPath(); ctx.ellipse(Math.round(f.x), FLOOR_Y + 1, f.bw / 2 + 2, 3, 0, 0, Math.PI * 2); ctx.fill();

    ctx.save();
    if (hidden) ctx.globalAlpha = 0.18;
    ctx.translate(Math.round(f.x), Math.round(f.y) - bob);
    if (f.state === "ko") ctx.rotate(-f.face * Math.min(1, f.t / 300) * Math.PI / 2);
    ctx.scale(f.face, 1);
    if (tilt) ctx.rotate(tilt);
    ctx.translate(lean + pose.lean, 0);
    if (pose.rot || pose.sx !== 1 || pose.sy !== 1) {
      const cy = -f.height / 2;
      ctx.translate(0, pose.rot ? cy : 0);
      ctx.rotate(pose.rot);
      ctx.scale(pose.sx, pose.sy);
      ctx.translate(0, pose.rot ? -cy : 0);
    }

    if (C.kind === "pet") drawPet(f, now, flash);
    else drawBird(f, now, flash);
    ctx.restore();

    // Hiding: dandelions or a blanket
    if (hidden) {
      const m = f.C.specials.find((s) => s.kind === "hide");
      if (m && m.cover === "flowers") {
        [[-12, -14], [4, -20], [-2, -6], [10, -8]].forEach(([dx, dy], i) => sprite(FX["🌼"], f.x + dx - 6, f.y + dy - 6 + (reduceMotion ? 0 : Math.round(Math.sin(now / 200 + i))), 1));
      } else {
        ctx.fillStyle = "#2b1a52"; ctx.beginPath(); ctx.ellipse(f.x, f.y - 9, 19, 12, 0, Math.PI, Math.PI * 2); ctx.fill(); ctx.fillRect(f.x - 19, f.y - 9, 38, 9);
        ctx.fillStyle = "#ff8cc6"; ctx.beginPath(); ctx.ellipse(f.x, f.y - 9, 17, 10, 0, Math.PI, Math.PI * 2); ctx.fill(); ctx.fillRect(f.x - 17, f.y - 9, 34, 8);
        sprite(FX["💖"], f.x - 6, f.y - 18, 1);
      }
    }

    // Stun effects from card moves
    if (f.status && f.state === "hit") {
      const top = f.y - f.height - 10;
      text(f.status.text, clamp(f.x, 44, W - 44), top - 6, { size: 5, color: "#fff8e4" });
      if (f.status.fx && FX[f.status.fx]) {
        const spin = reduceMotion ? 0 : now / 220;
        for (let i = 0; i < 3; i++) {
          const a = spin + (i * Math.PI * 2) / 3;
          sprite(FX[f.status.fx], f.x + Math.cos(a) * 12 - 6, top + 4 + Math.sin(a) * 4 - 6, 1);
        }
      }
    }
    // Dizzy stars on a K.O.
    if (f.state === "ko" && f.t > 400) {
      const cx = f.x - f.face * f.height * 0.7;
      sparkles(cx, FLOOR_Y - 12, 8, now, "#ffd23f");
    }
  }

  function drawPet(f, now, flash) {
    const C = f.C;
    const head = IMG[f.id + (flash ? "Flash" : "")], body = IMG[f.id + "Body" + (flash ? "Flash" : "")];
    const bt = -f.bh;                                  // body top
    const ht = bt - f.hh + C.headDrop;                 // head top
    const front = f.bw / 2;
    const shoulder = bt + 6;
    drawTail(f, now, bt);
    if (f.state !== "ko") paw(front - 12, shoulder + 3, C);   // back paw (behind the body)
    ctx.drawImage(body, -f.bw / 2, bt, f.bw, f.bh);
    const eyes = EYES[f.id];
    if (flash || !eyes) {
      ctx.drawImage(head, -f.hw / 2, ht, f.hw, f.hh);
    } else {
      // Which side the pupils sit on: toward the opponent (in this mirrored space, +1 is the way they face)
      let look;
      if (f.lookX === undefined) look = reduceMotion ? 1 : Math.sin(now / 900 + f.x) > 0 ? 1 : -1;
      else look = Math.sign((f.lookX - f.x) * f.face) || 1;
      ctx.drawImage(IMG[f.id + "NoEyes"], -f.hw / 2, ht, f.hw, f.hh);
      const s = C.headScale;
      eyes.sockets.forEach(([col, row]) => {
        const ex = -f.hw / 2 + col * s, ey = ht + row * s;
        if (eyes.shineOnly) {
          ctx.fillStyle = eyes.pupil;
          ctx.fillRect(ex, ey, 2 * s, eyes.h * s);
          ctx.fillStyle = eyes.white;
          ctx.fillRect(ex + (look > 0 ? s : 0), ey, s, s);
          return;
        }
        ctx.fillStyle = eyes.white;
        ctx.fillRect(ex, ey, 2 * s, eyes.h * s);
        const px = ex + (look > 0 ? s : 0);
        ctx.fillStyle = eyes.pupil;
        ctx.fillRect(px, ey, s, eyes.h * s);
        ctx.fillStyle = "#ffffff";                       // a tiny shine
        ctx.fillRect(px + s - Math.ceil(s / 2), ey, Math.ceil(s / 2), Math.ceil(s / 2));
      });
    }
    if (f.state !== "win") drawDress(f, ht);

    const m = f.move && MOVES[f.move];
    if (f.state === "attack") {
      const t = f.t;
      const out = t < m.startup ? t / m.startup * 0.3 : t < m.startup + m.active ? 1 : Math.max(0, 1 - (t - m.startup - m.active) / m.recover);
      if (f.move === "bap") {
        const px = front - 4 + Math.round(out * f.reachBap);
        arm(front - 6, px, shoulder + 1, C);
        paw(px, shoulder, C);
      } else {
        const fx = front - 6 + Math.round(out * f.reachKick);
        arm(front - 8, fx, -12, C);
        ctx.fillStyle = "#2b1a52"; ctx.fillRect(fx - 1, -15, 10, 8);
        ctx.fillStyle = C.light; ctx.fillRect(fx, -14, 8, 6);
        paw(front - 4, shoulder, C);
      }
    } else if (f.state === "special") {
      paw(front - 2, shoulder - 2, C);
      paw(front - 2, shoulder + 6, C);
      if (f.sp.chomp && f.t >= f.sp.startup) { // tiny teeth
        ctx.fillStyle = "#ffffff"; ctx.fillRect(4, ht + f.hh - 9, 2, 3); ctx.fillRect(-6, ht + f.hh - 9, 2, 3);
      }
    } else if (f.state === "hit" || f.state === "ko") {
      paw(front - 6, bt - 6, C);
      paw(-front, bt - 4, C);
    } else if (f.state === "win") {
      paw(front - 4, shoulder - 1, C);
      partyHat(0, ht + 3, f.id === "bojjii" ? 12 : 10, f.id === "bojjii" ? 16 : 14);
    } else if (f.holdBack || f.state === "blockstun") {
      paw(front - 6, ht + f.hh / 2 - 2, C);
      paw(front - 4, ht + f.hh / 2 + 6, C);
      if (f.state === "blockstun") blockShield(f, front);
    } else {
      paw(front - 4, shoulder - 1, C);     // guard up, boxer style
    }
  }

  function blockShield(f, front) {
    ctx.strokeStyle = "rgba(201, 240, 255, .9)";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(front - 2, -f.height / 2, f.height / 2, -0.9, 0.9); ctx.stroke();
  }

  function drawBird(f, now, flash) {
    const C = f.C;
    const img = IMG[C.side + (flash ? "Flash" : "")];
    const legH = 9, top = -36 - legH;
    const step = (f.state === "walk" && !reduceMotion) ? Math.floor(now / 110) % 2 : 0;
    let kickOut = 0, peck = 0;
    if (f.state === "attack") {
      const m = MOVES[f.move], t = f.t;
      const out = t < m.startup ? t / m.startup * 0.3 : t < m.startup + m.active ? 1 : Math.max(0, 1 - (t - m.startup - m.active) / m.recover);
      if (f.move === "kick") kickOut = out; else peck = out;
    }
    // Legs (fluffy gray feet for Snow)
    const legW = C.fluffyFeet ? 4 : 3;
    ctx.fillStyle = C.legs;
    const leg = (x, lift) => {
      ctx.fillRect(x, -legH - 1, legW, legH + 1 - lift);
      ctx.fillRect(x - 2, -2 - lift, legW + 4, 2);
    };
    if (f.state !== "ko") {
      leg(-7, step ? 2 : 0);
      if (kickOut > 0) {
        const fx = 2 + Math.round(kickOut * f.reachKick);
        ctx.fillRect(2, -legH - 1, legW, 4);
        ctx.fillRect(2, -legH + 1, fx, legW);
        ctx.fillRect(fx, -legH - 2, 2, 7); ctx.fillRect(fx + 2, -legH - 1, 3, 2); ctx.fillRect(fx + 2, -legH + 3, 3, 2);
      } else leg(2, step ? 0 : 2);
    }
    // Body: leans in for a peck
    ctx.save();
    if (peck > 0) { ctx.translate(0, -legH); ctx.rotate(0.38 * peck); ctx.translate(4 * peck, legH); }
    if (f.state === "hit") { ctx.translate(0, -legH); ctx.rotate(-0.2); ctx.translate(0, legH); }
    ctx.drawImage(img, -24, top, 48, 36);
    if (peck > 0.9 && !flash) { ctx.fillStyle = "#ffd23f"; ctx.fillRect(24, top + 14, 4, 3); }
    if (f.state === "win") partyHat(12, top + 3, 10, 14);
    ctx.restore();
    if (f.state === "blockstun") blockShield(f, f.bw / 2);
    else if (f.holdBack && free(f)) { // wings up to block
      ctx.fillStyle = "rgba(255, 255, 255, .55)";
      ctx.fillRect(10, top + 18, 4, 14);
    }
  }

  function sparkles(x, y, r, now, color) {
    const spin = reduceMotion ? 0 : now / 200;
    ctx.fillStyle = color || "#fff6c2";
    for (let i = 0; i < 4; i++) {
      const a = spin + (i * Math.PI) / 2;
      const sx = Math.round(x + Math.cos(a) * r), sy = Math.round(y + Math.sin(a) * r * 0.8);
      ctx.fillRect(sx - 1, sy - 2, 2, 4); ctx.fillRect(sx - 2, sy - 1, 4, 2);
    }
  }

  function drawShot(sh, now) {
    const x = Math.round(sh.x), y = Math.round(sh.y), dir = Math.sign(sh.vx) || 1;
    if (sh.kind === "quake") {
      const k = Math.floor(sh.t / 60) % 2;
      ctx.fillStyle = STAGES[opponent()].dust[0];
      ctx.fillRect(x - 6, FLOOR_Y - 5 - k * 2, 4, 5 + k * 2); ctx.fillRect(x, FLOOR_Y - 8 + k * 2, 5, 8 - k * 2); ctx.fillRect(x + 6, FLOOR_Y - 4, 3, 4);
      ctx.fillStyle = "#2b1a52"; ctx.fillRect(x - 8, FLOOR_Y - 1, 18, 1);
      return;
    }
    if (sh.kind === "pancake") {
      if (sh.y < FLOOR_Y) {
        const s = clamp((sh.y + 20) / (FLOOR_Y + 20), 0.2, 1);
        ctx.fillStyle = `rgba(43, 26, 82, ${0.15 + s * 0.25})`;
        ctx.beginPath(); ctx.ellipse(x, FLOOR_Y + 1, 12 * s, 3, 0, 0, Math.PI * 2); ctx.fill();
      }
      sprite(FX["🥞"], x - 12, y - 12, 2);
      return;
    }
    if (sh.kind === "cucumber") {
      ctx.save(); ctx.translate(x, y); ctx.rotate(reduceMotion ? 0 : dir * sh.t / 90);
      ctx.drawImage(FX["🥒"], -10, -10, 20, 20); ctx.restore();
      return;
    }
    if (sh.kind === "bolt") {
      ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1);
      ctx.fillStyle = "rgba(255, 210, 63, .5)"; ctx.fillRect(-22, -1, 14, 2); ctx.fillRect(-18, 3, 10, 1);
      ctx.drawImage(FX["⚡"], -10, -10, 20, 20); ctx.restore();
      return;
    }
    if (sh.kind === "zzz") sprite(FX["💤"], x - 10, y - 10, 2);
  }

  function drawHud(now) {
    // Health bars: they drain toward the outside edges, with a red "ouch" trail
    const bar = (f, x, w, alignRight) => {
      ctx.fillStyle = "#2b1a52";
      ctx.fillRect(x - 2, 8, w + 4, 11);
      ctx.fillStyle = "#5a2a4a";
      ctx.fillRect(x, 10, w, 7);
      const tw = Math.round(w * f.trail / MAX_HP), hw = Math.round(w * f.hp / MAX_HP);
      ctx.fillStyle = "#ff4d6d";
      ctx.fillRect(alignRight ? x + w - tw : x, 10, tw, 7);
      ctx.fillStyle = f.hp > 30 ? "#ffd23f" : (reduceMotion || Math.floor(now / 200) % 2 ? "#ff8a1e" : "#ffd23f");
      ctx.fillRect(alignRight ? x + w - hw : x, 10, hw, 7);
      ctx.fillStyle = "rgba(255, 255, 255, .5)";
      ctx.fillRect(alignRight ? x + w - hw : x, 10, hw, 2);
    };
    bar(p1, 24, 110, false);
    bar(p2, W - 134, 110, true);
    const face = (f, x) => {
      const C = f.C, img = C.kind === "pet" ? IMG[f.id] : IMG[C.mini];
      ctx.save(); ctx.translate(x + (C.kind === "bird" && f === p1 ? 14 : 0), 6);
      if (C.kind === "bird" && f === p1) ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0);
      ctx.restore();
    };
    face(p1, 4);
    face(p2, W - 18);
    text(p1.C.name.toUpperCase(), 24, 26, { size: 6, align: "left", color: "#fff8e4" });
    text(p2.C.name.toUpperCase(), W - 24, 26, { size: 6, align: "right", color: "#fff8e4" });
    // Round wins
    for (let i = 0; i < WINS_NEEDED; i++) {
      ctx.fillStyle = i < wins.p1 ? "#ffd23f" : "rgba(43, 26, 82, .5)";
      ctx.fillRect(126 - i * 9, 22, 6, 6);
      ctx.fillStyle = i < wins.p2 ? "#ffd23f" : "rgba(43, 26, 82, .5)";
      ctx.fillRect(W - 132 + i * 9, 22, 6, 6);
    }
    // Special move meters, with the card emoji
    const meters = (f, x, rightSide) => {
      f.C.specials.forEach((m, i) => {
        const bx = rightSide ? x - i * 36 - 34 : x + i * 36;
        const ready = f.cool[i] <= 0;
        const fill = ready ? 1 : 1 - f.cool[i] / m.cool;
        if (FX[m.fx]) sprite(FX[m.fx], bx, 31, 1);
        else { ctx.fillStyle = "#ffffff"; ctx.fillRect(bx + 2, 35, 8, 1); ctx.fillRect(bx, 38, 10, 1); ctx.fillRect(bx + 3, 41, 7, 1); }
        ctx.fillStyle = "rgba(43, 26, 82, .6)";
        ctx.fillRect(bx + 13, 35, 20, 4);
        ctx.fillStyle = ready ? shotColor(f, i) : "#a98fe6";
        ctx.fillRect(bx + 13, 35, Math.round(20 * fill), 4);
      });
    };
    meters(p1, 24, false);
    meters(p2, W - 24, true);
    // Timer and level
    ctx.fillStyle = "#2b1a52";
    ctx.fillRect(W / 2 - 13, 5, 26, 18);
    const secs = Math.ceil(timeLeft / 1000);
    text(String(secs).padStart(2, "0"), W / 2, 15, { size: 10, outline: false, color: secs <= 10 ? "#ff6b6b" : "#ffd23f" });
    text(`LV ${level + 1}`, W / 2, 29, { size: 5, color: "#fff8e4" });
    text(`${score}`, W / 2, 37, { size: 5, color: "#ffd23f" });
    // "PEACHES used OUTFIT CHANGE!"
    if (banner) {
      ctx.font = '6px "Press Start 2P", monospace';
      const w = ctx.measureText(banner.text).width + 12;
      ctx.fillStyle = "#2b1a52"; ctx.fillRect(Math.round(W / 2 - w / 2) - 1, 47, Math.round(w) + 2, 14);
      ctx.fillStyle = "#fff8e4"; ctx.fillRect(Math.round(W / 2 - w / 2), 48, Math.round(w), 12);
      text(banner.text, W / 2, 54, { size: 6, color: "#2b1a52", outline: false });
    }
  }

  function drawTitle(now) {
    // All seven critters lined up and ready to rumble
    if (!lineup) lineup = ROSTER.map((id, i) => {
      const x = 34 + i * 42;
      return makeFighter(id, x, x < W / 2 ? 1 : -1, makeInput(), i % 2);
    });
    lineup.forEach((f, i) => { f.t = now + i * 120; drawFighter(f, now + i * 170); });
    // Logo with a chunky drop shadow, like an arcade marquee
    const bounce = reduceMotion ? 0 : Math.round(Math.sin(now / 400) * 2);
    text("Street", W / 2 - 48, 46 + bounce, { font: "logo", size: 40, color: "#ff8cc6", outline: "#2b1a52", ow: 7 });
    text("Fluffers", W / 2 + 40, 82 - bounce, { font: "logo", size: 48, color: "#ffd23f", outline: "#2b1a52", ow: 8 });
    text("THE BACKYARD BRAWL", W / 2, 108, { size: 8, color: "#fff8e4" });
    sprite(FX["✨"], 40, 30, 1); sprite(FX["💥"], 264, 56, 1);
    if (!reduceMotion && Math.floor(now / 500) % 2) sprite(FX["✨"], 270, 24, 1);
    const champs = ROSTER.filter((id) => record[id] && record[id].champ);
    if (champs.length) text(`CHAMPS: ${champs.map((id) => CHARS[id].name.toUpperCase()).join(", ")}`, W / 2, 124, { size: 5, color: "#ffd23f" });
  }

  function drawSelect(now) {
    text("Street Fluffers", W / 2, 14, { font: "logo", size: 22, color: "#ffd23f", outline: "#2b1a52", ow: 5 });
    panel(14, 28, 292, 134);
    const C = CHARS[preview];
    // Trading card frame
    ctx.fillStyle = "#ffd23f"; ctx.fillRect(24, 38, 82, 114);
    ctx.fillStyle = "#2b1a52"; ctx.fillRect(27, 41, 76, 108);
    const bg = ctx.createLinearGradient(0, 44, 0, 146);
    bg.addColorStop(0, "#c9b8f2"); bg.addColorStop(1, "#ffd6ec");
    ctx.fillStyle = bg; ctx.fillRect(29, 43, 72, 104);
    const bob = reduceMotion ? 0 : Math.round(Math.sin(now / 250) * 1.5);
    portrait(preview, 65, 128 + bob, 4, false);
    text(C.type.toUpperCase(), 65, 140, { size: 5, color: "#fff8e4" });
    // Name, type and the two card moves
    text(C.name, 116, 50, { font: "logo", size: 24, align: "left", color: "#ff5a3c", outline: "#2b1a52", ow: 4 });
    text(C.kind === "pet" ? "BAPS & KICKS" : "PECKS & KICKS", 296, 52, { size: 5, align: "right", color: "#7d5ad4", outline: false });
    C.specials.forEach((m, i) => {
      const y = 70 + i * 32;
      if (FX[m.fx]) sprite(FX[m.fx], 116, y, 1);
      else { ctx.fillStyle = "#7cc6ff"; ctx.fillRect(118, y + 3, 9, 2); ctx.fillRect(116, y + 6, 11, 2); ctx.fillRect(119, y + 9, 8, 2); }
      text(m.name.toUpperCase(), 132, y + 6, { size: 6, align: "left", color: "#2b1a52", outline: false });
      text(m.blurb, 116, y + 19, { size: 5, align: "left", color: "#7d5ad4", outline: false });
    });
    // Something they might say
    text(`"${C.quote}"`, 116, 137, { font: "logo", size: 10, align: "left", color: "#e8357f", outline: false });
    const r = record[preview];
    const rec = !r ? "Never played yet!" : r.champ ? `CHAMPION x${r.champ}!` : `BEST: BEAT ${r.best} OF 6`;
    text(rec, 116, 152, { size: 5, align: "left", color: r && r.champ ? "#ff5a3c" : "#2b1a52", outline: false });
  }

  function drawLadder(now) {
    panel(20, 18, 280, 162);
    const opp = opponent();
    const final = level === ladder.length - 1;
    if (score) text(`SCORE ${score}`, 290, 28, { size: 5, align: "right", color: "#7d5ad4", outline: false });
    text(final ? "Final boss!" : `Level ${level + 1}`, W / 2, 38, { font: "logo", size: 28, color: final ? "#ff4d6d" : "#ffd23f", outline: "#2b1a52", ow: 5 });
    if (lastBeaten) text(`You beat ${CHARS[lastBeaten].name}!`, W / 2, 56, { size: 6, color: "#3f8f2e", outline: false });
    else text(`${ladder.length} critters to beat`, W / 2, 56, { size: 6, color: "#7d5ad4", outline: false });
    const bob = reduceMotion ? 0 : Math.round(Math.sin(now / 250) * 1.5);
    portrait(hero, 86, 112 + bob, 2, false);
    text("VS", W / 2, 96, { font: "logo", size: 24, color: "#ff8cc6", outline: "#2b1a52", ow: 5 });
    portrait(opp, 234, 112 - bob, 2, false);
    text(CHARS[hero].name.toUpperCase(), 86, 120, { size: 5, color: "#2b1a52", outline: false });
    text(CHARS[opp].name.toUpperCase(), 234, 120, { size: 5, color: "#2b1a52", outline: false });
    text(`STAGE: ${STAGES[opp].name.toUpperCase()}`, W / 2, 132, { size: 5, color: "#ff5a3c", outline: false });
    // The ladder: who's beaten, who's next
    const x0 = W / 2 - (ladder.length * 30) / 2 + 3;
    ladder.forEach((id, i) => {
      const x = x0 + i * 30, y = 142;
      ctx.globalAlpha = i < level ? 0.35 : 1;
      ctx.save(); ctx.translate(x + 24, y); ctx.scale(-1, 1);
      ctx.drawImage(IMG[CHARS[id].mini], 0, 0, 24, 24);
      ctx.restore();
      ctx.globalAlpha = 1;
      if (i < level) text("✓", x + 12, y + 12, { size: 10, color: "#3f8f2e" });
      if (i === level) {
        const a = reduceMotion ? 0 : Math.abs(Math.round(Math.sin(now / 200) * 2));
        ctx.fillStyle = "#ff5a3c";
        ctx.beginPath(); ctx.moveTo(x + 8, y - 6 - a); ctx.lineTo(x + 16, y - 6 - a); ctx.lineTo(x + 12, y - 1 - a); ctx.fill();
      }
    });
  }

  function drawCenter() {
    if (state === "intro") {
      if (stateT < 1100) text(`Round ${round}`, W / 2, 84, { font: "logo", size: 34, color: "#ffd23f", outline: "#2b1a52", ow: 6 });
      else text("FIGHT!", W / 2, 84, { font: "logo", size: 46, color: "#ff5a3c", outline: "#2b1a52", ow: 7 });
    } else if (state === "ko" && roundResult) {
      const r = roundResult;
      if (r.how === "double") {
        text("Double K.O.!", W / 2, 84, { font: "logo", size: 40, color: "#ff4d6d", outline: "#2b1a52", ow: 7 });
        if (r.celebrated) text("BOTH GET THE ROUND", W / 2, 110, { size: 8, color: "#fff8e4" });
      } else if (!r.celebrated) {
        text(r.how === "ko" ? "K.O.!" : "TIME!", W / 2, 84, { font: "logo", size: 50, color: "#ff4d6d", outline: "#2b1a52", ow: 7 });
        if (r.perfect && r.how === "ko" && stateT > 1700) text("PERFECT!", W / 2, 116, { font: "logo", size: 22, color: "#ff8cc6", outline: "#2b1a52", ow: 5 });
      } else if (r.winner) {
        text(`${r.winner.C.name} wins!`, W / 2, 80, { font: "logo", size: 30, color: "#ffd23f", outline: "#2b1a52", ow: 6 });
        if (r.perfect) text("PERFECT!", W / 2, 104, { size: 10, color: "#ff8cc6" });
        if (r.points) text(`+${r.points} PTS`, W / 2, r.perfect ? 120 : 104, { size: 8, color: "#ffd23f" });
      } else {
        text("Draw!", W / 2, 84, { font: "logo", size: 34, color: "#fff8e4", outline: "#2b1a52", ow: 6 });
      }
    } else if (state === "paused") {
      ctx.fillStyle = "rgba(43, 26, 82, .55)";
      ctx.fillRect(0, 0, W, H);
      text("Paused", W / 2, H / 2 - 12, { font: "logo", size: 40, color: "#fff8e4", outline: "#2b1a52", ow: 6 });
      text("CLICK OR SPACE TO KEEP BRAWLING", W / 2, H / 2 + 22, { size: 6 });
    }
  }

  // Split a line into rows that fit the speech box
  function wrap(str, maxW) {
    ctx.font = '6px "Press Start 2P", monospace';
    const rows = [];
    let row = "";
    str.split(" ").forEach((word) => {
      const tryRow = row ? row + " " + word : word;
      if (ctx.measureText(tryRow).width > maxW && row) { rows.push(row); row = word; } else row = tryRow;
    });
    if (row) rows.push(row);
    return rows;
  }

  // Animal Crossing style speech box with a nameplate and a portrait that shows how they feel
  function speechBox(id, happy, line, shown, y, right, now) {
    const C = CHARS[id];
    const x = 14, w = 292, h = 66;
    panel(x, y, w, h);
    // Portrait
    const px = right ? x + w - 60 : x + 8, py = y + 7, ps = 52;
    ctx.fillStyle = "#2b1a52"; ctx.fillRect(px - 2, py - 2, ps + 4, ps + 4);
    ctx.fillStyle = happy ? "#ffd6ec" : "#c9d6f2"; ctx.fillRect(px, py, ps, ps);
    const img = C.kind === "pet" ? IMG[id] : IMG[C.side];
    const sc = Math.floor(Math.min(42 / img.width, 38 / img.height) * 2) / 2;
    const iw = img.width * sc, ih = img.height * sc;
    const bob = reduceMotion ? 0 : happy ? Math.abs(Math.round(Math.sin(now / 150) * 2)) : 0;
    const ix = Math.round(px + ps / 2 - iw / 2), iy = Math.round(py + ps - ih - 3 - bob + (happy ? 0 : 2));
    const flip = C.kind === "bird" && right;   // chickens face into the box
    ctx.save();
    ctx.beginPath(); ctx.rect(px, py, ps, ps); ctx.clip();
    if (flip) { ctx.save(); ctx.translate(ix + iw, iy); ctx.scale(-1, 1); ctx.drawImage(img, 0, 0, iw, ih); ctx.restore(); }
    else ctx.drawImage(img, ix, iy, iw, ih);
    const faceX = C.kind === "pet" ? px + ps / 2 : (flip ? ix + iw * 0.25 : ix + iw * 0.75);
    if (happy) {
      ctx.fillStyle = "rgba(255, 111, 168, .55)";
      if (C.kind === "pet") { ctx.fillRect(Math.round(px + ps / 2 - iw * 0.36), Math.round(iy + ih * 0.62), 5, 2); ctx.fillRect(Math.round(px + ps / 2 + iw * 0.36 - 5), Math.round(iy + ih * 0.62), 5, 2); }
      partyHat(Math.round(faceX), iy + 5, 10, 12);
    } else {
      // Gloomy lines and tears
      ctx.fillStyle = "rgba(90, 110, 190, .35)"; ctx.fillRect(px, py, ps, 18);
      ctx.fillStyle = "#5a6ebe";
      for (let i = 0; i < 4; i++) ctx.fillRect(px + 8 + i * 11, py + 3 + (i % 2) * 3, 1, 9);
      const drop = reduceMotion ? 4 : (now / 9) % 14;
      ctx.fillStyle = "#7cc6ff";
      const tears = C.kind === "pet" ? [px + ps / 2 - iw * 0.24, px + ps / 2 + iw * 0.24] : [faceX];
      tears.forEach((tx) => { const ty = Math.round(iy + ih * 0.45 + drop); ctx.fillRect(Math.round(tx), ty, 2, 3); ctx.fillRect(Math.round(tx), ty + 3, 1, 1); });
    }
    ctx.restore();
    if (happy) [[px - 4, py - 6], [px + ps - 6, py + ps - 8]].forEach(([sx, sy], i) => {
      if (reduceMotion || Math.floor(now / 250 + i) % 2) sprite(FX["✨"], sx, sy, 1);
    });
    // Nameplate
    ctx.font = '7px "Press Start 2P", monospace';
    const nw = ctx.measureText(C.name).width + 16;
    const nx = right ? px - nw + 20 : px + 30;
    ctx.fillStyle = "#2b1a52"; ctx.fillRect(nx - 1, y - 9, nw + 2, 15);
    ctx.fillStyle = happy ? "#ff8cc6" : "#9fb4e8"; ctx.fillRect(nx, y - 8, nw, 13);
    text(C.name, nx + nw / 2, y - 1, { size: 7, color: "#fff8e4" });
    // What they say, typed out
    const tx = right ? x + 12 : px + ps + 10;
    const rows = wrap(line, w - ps - 34);
    let left = shown;
    rows.forEach((r, i) => {
      if (left <= 0) return;
      text(r.slice(0, left), tx, y + 22 + i * 12, { size: 6, align: "left", color: "#2b1a52", outline: false });
      left -= r.length + 1;
    });
  }

  function drawTalk(now) {
    ctx.fillStyle = "rgba(43, 26, 82, .45)";
    ctx.fillRect(0, 0, W, H);
    const typed = (line, t) => (t <= 0 ? 0 : Math.min(line.length, Math.floor(t / TYPE_MS) + 1));
    speechBox(talk.loser, false, talk.loseLine, typed(talk.loseLine, talk.t - 350), 22, false, now);
    if (talk.t >= talk.winAt - 250) speechBox(talk.winner, true, talk.winLine, typed(talk.winLine, talk.t - talk.winAt), 110, true, now);
    if (talk.t >= talk.endAt && (reduceMotion || Math.floor(now / 400) % 2)) {
      ctx.fillStyle = "#ff5a3c";
      ctx.beginPath(); ctx.moveTo(196, 166); ctx.lineTo(204, 166); ctx.lineTo(200, 171); ctx.fill();
    }
  }

  function drawLose(now) {
    panel(30, 30, 260, 150);
    text("Continue?", W / 2, 52, { font: "logo", size: 30, color: "#ff8cc6", outline: "#2b1a52", ow: 5 });
    const n = Math.max(0, 9 - Math.floor(stateT / 1000));
    text(String(n), W / 2, 92, { font: "logo", size: 46, color: "#ffd23f", outline: "#2b1a52", ow: 6 });
    const opp = opponent();
    portrait(opp, 70, 120 + (reduceMotion ? 0 : Math.abs(Math.round(Math.sin(now / 160) * 3))), 2, true);
    text(`"${CHARS[opp].win}"`, 182, 128, { size: 5, color: "#2b1a52", outline: false });
    text(CHARS[hero].lose, 182, 144, { size: 5, color: "#7d5ad4", outline: false });
    text(`LEVEL ${level + 1} OF ${ladder.length}`, W / 2, 166, { size: 6, color: "#ff5a3c", outline: false });
  }

  function drawChamp(now) {
    panel(26, 24, 268, 156);
    text("Champion!", W / 2, 46, { font: "logo", size: 34, color: "#ffd23f", outline: "#2b1a52", ow: 6 });
    portrait(hero, 76, 126 - (reduceMotion ? 0 : Math.abs(Math.round(Math.sin(now / 160) * 4))), 3, true);
    text(`You beat all ${ladder.length} critters!`, 194, 82, { size: 6, color: "#2b1a52", outline: false });
    text(`"${CHARS[hero].win}"`, 194, 104, { size: 5, color: "#7d5ad4", outline: false });
    const r = record[hero] || { champ: 1 };
    text(`${CHARS[hero].name.toUpperCase()} CHAMPION x${r.champ}`, 194, 126, { size: 6, color: "#ff5a3c", outline: false });
    text(`SCORE ${score}`, 194, 146, { size: 8, color: "#2b1a52", outline: false });
  }

  function drawWorld(now) {
    // Whoever is attacking draws on top
    const busy = (f) => f.state === "attack" || f.state === "special";
    const order = busy(p2) ? [p1, p2] : [p2, p1];
    p1.lookX = p2.x; p2.lookX = p1.x;
    order.forEach((f) => drawFighter(f, now));
    shots.forEach((s) => drawShot(s, now));
  }

  // The camera zooms in on the last hit, then drifts back out as time speeds up again
  function camera() {
    if (!slow) return null;
    const e = freezeT > 0 ? 0 : slowEase();
    const z = 1 + 0.8 * (1 - e);
    const vw = W / z, vh = H / z;
    return { z, x: clamp(lerp(slow.x, W / 2, e), vw / 2, W - vw / 2), y: clamp(lerp(slow.y, H / 2, e), vh / 2, H - vh / 2) };
  }

  function draw(now) {
    ctx.setTransform(K, 0, 0, K, 0, 0);
    ctx.imageSmoothingEnabled = false;
    drawScene(now);
    if (fade) {
      ctx.setTransform(K, 0, 0, K, 0, 0);
      ctx.fillStyle = "#2b1a52";
      ctx.globalAlpha = clamp(fade.out ? fade.t / fade.dur : 1 - fade.t / fade.dur, 0, 1);
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }
  }

  function drawScene(now) {
    if (shakeT > 0) ctx.translate(Math.round(rand(-3, 3)), Math.round(rand(-2, 2)));

    const stageId = state === "title" ? "peaches" : state === "select" ? preview : opponent();
    const cam = camera();
    if (state === "story") { drawStory(now); return; }
    ctx.save();
    if (cam) { ctx.translate(W / 2, H / 2); ctx.scale(cam.z, cam.z); ctx.translate(-cam.x, -cam.y); }
    drawStage(stageId, now);
    if (state === "title") { ctx.restore(); drawTitle(now); return; }
    if (state === "select") { ctx.restore(); drawSelect(now); return; }
    if (state === "ladder") { ctx.restore(); drawLadder(now); return; }
    if (state === "talk") { ctx.restore(); drawTalk(now); return; }

    if (p1) drawWorld(now);
    bits.forEach((b) => {
      ctx.globalAlpha = 1 - b.life / b.max;
      ctx.fillStyle = b.color;
      if (b.streak) ctx.fillRect(Math.round(b.x) - 4, Math.round(b.y), 8, 1);
      else ctx.fillRect(Math.round(b.x), Math.round(b.y), b.size, b.size);
    });
    fxBits.forEach((b) => {
      ctx.globalAlpha = Math.min(1, 2.2 - (b.life / b.max) * 2.2);
      sprite(b.img, b.x - 6, b.y - 6, 1);
    });
    ctx.globalAlpha = 1;
    popups.forEach((p) => {
      ctx.globalAlpha = Math.min(1, 2 - (p.t / 800) * 2);
      const y = p.y - (p.t / 800) * 14;
      if (p.logo) text(p.text, clamp(p.x, 34, W - 34), y, { font: "logo", size: p.size, color: p.color, ow: 4 });
      else text(p.text, clamp(p.x, 20, W - 20), y, { size: p.size, color: p.color });
    });
    ctx.globalAlpha = 1;
    ctx.restore();

    if (state === "lose") { drawLose(now); return; }
    if (state === "champ") { drawChamp(now); return; }
    drawHud(now);
    drawCenter();
    if (flashT > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${(flashT / 120) * 0.6})`;
      ctx.fillRect(0, 0, W, H);
    }
  }


  /* ---------- Story scenes ---------- */
  // Each panel is a little picture plus a caption. Pictures are drawn in "stage" space,
  // shifted up so the ground sits just above the caption box.
  const STORY_SHIFT = 44;
  function storyBg(id, dim) {
    ctx.drawImage(stageImg(id), 0, 0, W, H);
    if (dim) { ctx.fillStyle = `rgba(43, 26, 82, ${dim})`; ctx.fillRect(0, 0, W, H + STORY_SHIFT); }
  }
  function mini(id, x, y, s, faceRight, hop) {
    const img = IMG[CHARS[id].mini];
    ctx.save();
    ctx.translate(Math.round(x) + (faceRight ? 12 * s : 0), Math.round(y - (hop || 0)));
    if (faceRight) ctx.scale(-1, 1);
    ctx.drawImage(img, 0, 0, 12 * s, 12 * s);
    ctx.restore();
  }
  const cheer = (now, i) => (reduceMotion ? 0 : Math.abs(Math.round(Math.sin(now / 160 + i) * 4)));
  function crown(cx, bottom, s) { sprite(IMG.crown, cx - (11 * s) / 2, bottom - 8 * s, s); }
  function thought(x, y, emoji) {
    ctx.fillStyle = "#2b1a52";
    ctx.beginPath(); ctx.ellipse(x, y, 11, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(x - 3, y + 10, 4, 3); ctx.fillRect(x - 6, y + 14, 3, 2);
    ctx.fillStyle = "#fff8e4";
    ctx.beginPath(); ctx.ellipse(x, y, 10, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(x - 2, y + 11, 2, 1);
    sprite(FX[emoji], x - 6, y - 6, 1);
  }
  // A critter standing in a scene; crown: wearing the crown; pose: a card move ("spin", "hug", "roll")
  function critter(id, x, now, o) {
    o = o || {};
    const f = makeFighter(id, x, o.face || 1, makeInput(), 5);
    if (o.y !== undefined) f.y = o.y;
    if (o.pose) { f.state = "special"; f.sp = { kind: o.pose, startup: 0, dur: 900 }; f.t = o.pose === "spin" ? now % 900 : now; }
    drawFighter(f, now);
    if (o.crown) {
      const C = CHARS[id];
      const top = C.kind === "pet" ? f.y - f.bh - f.hh + C.headDrop + 7 : f.y - 42;
      crown(C.kind === "pet" ? f.x : f.x + f.face * 11, o.pose === "roll" ? f.y - 14 : top, 2);
    }
    return f;
  }
  function sparkleField(now, n, y0, y1) {
    for (let i = 0; i < n; i++) {
      if (!reduceMotion && Math.floor(now / 300 + i) % 3 === 0) continue;
      sprite(FX["✨"], 20 + ((i * 97) % 280), y0 + ((i * 53) % (y1 - y0)), 1);
    }
  }

  const INTRO = [
    {
      text: "It was a lazy, sunny afternoon in Yvy's backyard. The whole crew was napping in the warm grass...",
      draw(now) {
        storyBg("peaches");
        ROSTER.forEach((id, i) => {
          const x = 22 + i * 40;
          mini(id, x, FLOOR_Y - 24 + (i % 2) * 4, 2, i % 2 === 0);
          const drift = reduceMotion ? 0 : (now / 40 + i * 17) % 30;
          ctx.globalAlpha = 1 - drift / 30;
          sprite(FX["💤"], x + 14, FLOOR_Y - 40 - drift, 1);
          ctx.globalAlpha = 1;
        });
      },
    },
    {
      text: "Then Yvy set something shiny on the picnic table: the Critter of the Month Crown! Whoever wins it gets to wear it... FOREVER.",
      draw(now) {
        storyBg("peaches", 0.15);
        // Picnic table with the crown on a pink cushion
        ctx.fillStyle = "#a5643a"; ctx.fillRect(110, 160, 100, 8);
        ctx.fillStyle = "#7a4526"; ctx.fillRect(118, 168, 6, 22); ctx.fillRect(196, 168, 6, 22);
        ctx.fillStyle = "#ff8cc6"; ctx.fillRect(140, 152, 40, 8);
        ctx.fillStyle = "#ff4d8d"; ctx.fillRect(140, 158, 40, 2);
        const bob = reduceMotion ? 0 : Math.round(Math.sin(now / 300) * 2);
        crown(160, 152 - bob, 3);
        sparkleField(now, 8, 110, 150);
        ROSTER.forEach((id, i) => {
          const x = i < 4 ? 14 + i * 24 : 216 + (i - 4) * 30;
          mini(id, x, FLOOR_Y - 24, 2, i < 4);
          text("!", x + 12, FLOOR_Y - 32, { font: "logo", size: 14, color: "#ff5a3c" });
        });
      },
    },
    {
      text: "Peaches wanted to wear it. Bojjii wanted to trade it for pancakes. Lychee wanted to nap in it. Beyonce said it was already hers.",
      draw(now) {
        storyBg("peaches", 0.3);
        const wants = { peaches: "🎀", bojjii: "🥞", lychee: "💤", penny: "💖", riot: "✨", beyonce: "⚡", snow: "💕" };
        ROSTER.forEach((id, i) => {
          const x = 30 + i * 43;
          critter(id, x, now + i * 150, { face: x < W / 2 ? 1 : -1 });
          const bob = reduceMotion ? 0 : Math.round(Math.sin(now / 250 + i) * 2);
          thought(x + 6, FLOOR_Y - 70 + bob, wants[id]);
        });
      },
    },
    {
      text: "There was only one way to settle it. Everybody into the yard... it's time for the BACKYARD BRAWL!",
      draw(now) {
        ctx.fillStyle = "#ff8cc6"; ctx.fillRect(0, 0, W, H + STORY_SHIFT);
        ctx.fillStyle = "#ffd23f";
        ctx.beginPath(); ctx.moveTo(190, 0); ctx.lineTo(W, 0); ctx.lineTo(W, H + STORY_SHIFT); ctx.lineTo(130, H + STORY_SHIFT); ctx.fill();
        sparkleField(now, 10, 50, 140);
        critter("peaches", 70, now, { face: 1, y: FLOOR_Y - 4 });
        critter("beyonce", 250, now, { face: -1, y: FLOOR_Y - 4 });
        const pulse = reduceMotion ? 0 : Math.round(Math.sin(now / 200) * 2);
        crown(160, 118, 3 + (pulse > 0 ? 0 : 0));
        text("VS", W / 2, 148 + pulse, { font: "logo", size: 34, color: "#fff8e4", outline: "#2b1a52", ow: 6 });
        text("THE BACKYARD BRAWL", W / 2, 70, { size: 9, color: "#fff8e4" });
      },
    },
  ];

  // Each champion's ending (two panels), then everyone gets "The End"
  const ENDINGS = {
    peaches: [
      {
        text: "Peaches won the Critter of the Month Crown! She tried it on with seven different outfits. All of them were perfect.",
        draw(now) {
          storyBg("peaches");
          ["bojjii", "lychee", "penny"].forEach((id, i) => mini(id, 14 + i * 26, FLOOR_Y - 24, 2, true, cheer(now, i)));
          ["riot", "beyonce", "snow"].forEach((id, i) => mini(id, 230 + i * 26, FLOOR_Y - 24, 2, false, cheer(now, i + 3)));
          critter("peaches", 160, now, { crown: true });
          for (let i = 0; i < 4; i++) {
            const a = (reduceMotion ? 0 : now / 500) + (i * Math.PI) / 2;
            sprite(FX["🎀"], 160 + Math.cos(a) * 34 - 6, FLOOR_Y - 26 + Math.sin(a) * 18 - 6, 1);
          }
        },
      },
      {
        text: "Now she's the most fashionable champion the backyard has ever seen. The crowd still hasn't stopped cheering.",
        draw(now) {
          ctx.fillStyle = "#2b1a52"; ctx.fillRect(0, 0, W, H + STORY_SHIFT);
          // Spotlights and a pink runway
          ctx.fillStyle = "rgba(255, 246, 194, .25)";
          [[90, 1], [230, -1]].forEach(([x, d]) => { ctx.beginPath(); ctx.moveTo(x, 40); ctx.lineTo(160 - d * 30, FLOOR_Y + 6); ctx.lineTo(160 + d * 10, FLOOR_Y + 6); ctx.fill(); });
          ctx.fillStyle = "#ff8cc6"; ctx.fillRect(100, FLOOR_Y - 2, 120, 10);
          ctx.fillStyle = "#ff4d8d"; ctx.fillRect(100, FLOOR_Y + 6, 120, 3);
          critter("peaches", 160, now, { crown: true });
          // Camera flashes
          for (let i = 0; i < 6; i++) if (!reduceMotion && Math.floor(now / 180 + i * 7) % 5 === 0) sprite(FX["✨"], 20 + i * 50, 70 + (i % 3) * 30, 2);
          text("PEACHES!", 52, 60, { font: "logo", size: 14, color: "#ff8cc6" });
          text("SO CUTE!", 268, 80, { font: "logo", size: 14, color: "#ffd23f" });
        },
      },
    ],
    bojjii: [
      {
        text: "Bojjii won the crown! He wore it proudly for about a minute... then traded it to Yvy for a stack of pancakes taller than he is.",
        draw(now) {
          storyBg("bojjii");
          critter("bojjii", 120, now, { crown: true });
          for (let i = 0; i < 6; i++) sprite(FX["🥞"], 196, FLOOR_Y - 26 - i * 12, 2);
          sparkleField(now, 4, 100, 130);
        },
      },
      {
        text: "Then he shared every single pancake with his friends, because he's the goodest boy in the whole backyard.",
        draw(now) {
          storyBg("bojjii");
          critter("bojjii", 160, now, { crown: true });
          ["peaches", "lychee", "penny"].forEach((id, i) => { mini(id, 30 + i * 30, FLOOR_Y - 24, 2, true, cheer(now, i)); sprite(FX["🥞"], 36 + i * 30, FLOOR_Y - 6, 1); });
          ["riot", "beyonce", "snow"].forEach((id, i) => { mini(id, 210 + i * 30, FLOOR_Y - 24, 2, false, cheer(now, i + 3)); sprite(FX["🥞"], 216 + i * 30, FLOOR_Y - 6, 1); });
          sprite(FX["💕"], 168, FLOOR_Y - 76 - (reduceMotion ? 0 : (now / 50) % 10), 1);
        },
      },
    ],
    lychee: [
      {
        text: "Lychee won the crown. He looked at it. He looked at everyone. Then he curled up inside it and fell fast asleep.",
        draw(now) {
          storyBg("lychee");
          crown(160, FLOOR_Y + 2, 5);
          critter("lychee", 160, now, { pose: "roll", y: FLOOR_Y - 8 });
          const drift = reduceMotion ? 0 : (now / 40) % 30;
          ctx.globalAlpha = 1 - drift / 30;
          sprite(FX["💤"], 178, FLOOR_Y - 46 - drift, 2);
          ctx.globalAlpha = 1;
        },
      },
      {
        text: "Nobody dared to wake the champion. The crown is his now. So is the cucumber.",
        draw(now) {
          storyBg("lychee", 0.2);
          crown(160, FLOOR_Y + 2, 5);
          critter("lychee", 160, now, { pose: "roll", y: FLOOR_Y - 8 });
          sprite(FX["🥒"], 196, FLOOR_Y - 18, 2);
          const tip = reduceMotion ? 0 : Math.round(Math.sin(now / 400) * 6);
          mini("peaches", 50 + tip, FLOOR_Y - 24, 2, true);
          mini("bojjii", 250 - tip, FLOOR_Y - 24, 2, false);
          thought(76 + tip, FLOOR_Y - 50, "💤");
          text("Shh!", 270 - tip, FLOOR_Y - 46, { font: "logo", size: 14, color: "#fff8e4" });
        },
      },
    ],
    penny: [
      {
        text: "Penny won the crown! She spun in the happiest circles anyone has ever seen, until everyone was smiling.",
        draw(now) {
          storyBg("penny");
          critter("penny", 160, now, { pose: "spin" });
          for (let i = 0; i < 6; i++) {
            const a = (reduceMotion ? 0 : now / 400) + (i * Math.PI) / 3;
            sprite(FX["💖"], 160 + Math.cos(a) * 42 - 6, FLOOR_Y - 24 + Math.sin(a) * 22 - 6, 1);
          }
          crown(160, FLOOR_Y - 58, 2);
          ["bojjii", "lychee"].forEach((id, i) => mini(id, 30 + i * 30, FLOOR_Y - 24, 2, true, cheer(now, i)));
          ["riot", "snow"].forEach((id, i) => mini(id, 240 + i * 30, FLOOR_Y - 24, 2, false, cheer(now, i + 2)));
        },
      },
      {
        text: "Then she tucked the crown under the blankets, a surprise for her momma. The sweetest champion there ever was. Forever loved.",
        draw(now) {
          storyBg("penny", 0.2);
          // A blanket lump with the crown peeking out
          ctx.fillStyle = "#2b1a52"; ctx.beginPath(); ctx.ellipse(160, FLOOR_Y - 10, 34, 20, 0, Math.PI, Math.PI * 2); ctx.fill(); ctx.fillRect(126, FLOOR_Y - 10, 68, 12);
          ctx.fillStyle = "#ff8cc6"; ctx.beginPath(); ctx.ellipse(160, FLOOR_Y - 10, 32, 18, 0, Math.PI, Math.PI * 2); ctx.fill(); ctx.fillRect(128, FLOOR_Y - 10, 64, 10);
          crown(176, FLOOR_Y - 24, 2);
          sprite(FX["💖"], 146, FLOOR_Y - 22, 1);
          const drift = reduceMotion ? 0 : (now / 50) % 20;
          ctx.globalAlpha = 1 - drift / 20;
          sprite(FX["💕"], 152, FLOOR_Y - 44 - drift, 1);
          ctx.globalAlpha = 1;
        },
      },
    ],
    riot: [
      {
        text: "Riot won the crown! At least, she thinks she did. She can't actually see it. She's pretty sure it looks amazing.",
        draw(now) {
          storyBg("riot");
          critter("riot", 160, now, { crown: true });
          sparkleField(now, 6, 90, 140);
          ["peaches", "bojjii", "penny"].forEach((id, i) => mini(id, 20 + i * 28, FLOOR_Y - 24, 2, true, cheer(now, i)));
        },
      },
      {
        text: "She wears it everywhere now, and walks into slightly fewer fences. Pom-pom power!",
        draw(now) {
          storyBg("riot");
          const x = reduceMotion ? 150 : 60 + ((now / 20) % 200);
          critter("riot", x, now, { crown: true });
          text("POM-POM POWER!", W / 2, 96, { font: "logo", size: 22, color: "#ffd23f", outline: "#2b1a52", ow: 5 });
        },
      },
    ],
    beyonce: [
      {
        text: "Beyonce won the crown, and told everyone she'd had it the whole time.",
        draw(now) {
          storyBg("beyonce");
          critter("beyonce", 160, now, { crown: true });
          ["peaches", "bojjii", "lychee"].forEach((id, i) => mini(id, 24 + i * 28, FLOOR_Y - 20, 2, true));
          ["riot", "penny", "snow"].forEach((id, i) => mini(id, 222 + i * 28, FLOOR_Y - 20, 2, false));
          for (let i = 0; i < 3; i++) if (reduceMotion || Math.floor(now / 200 + i) % 2) sprite(FX["⚡"], 130 + i * 24, FLOOR_Y - 76, 1);
        },
      },
      {
        text: "New coop rule: Beyonce is Critter of the Month. Forever. No recounts. The coop knows better than to argue.",
        draw(now) {
          storyBg("beyonce");
          // The new rule, posted on a sign
          ctx.fillStyle = "#7a4526"; ctx.fillRect(64, 120, 4, 70); ctx.fillRect(142, 120, 4, 70);
          ctx.fillStyle = "#2b1a52"; ctx.fillRect(40, 92, 130, 62);
          ctx.fillStyle = "#c98a4a"; ctx.fillRect(42, 94, 126, 58);
          ["COOP RULE #1:", "BEYONCE IS", "CRITTER OF THE", "MONTH. FOREVER."].forEach((l, i) => text(l, 105, 104 + i * 13, { size: 6, color: "#2b1a52", outline: false }));
          critter("beyonce", 230, now, { crown: true, face: -1 });
        },
      },
    ],
    snow: [
      {
        text: "Snow won the crown... and gave everyone a big, soft marshmallow hug. Even the ones she beat.",
        draw(now) {
          storyBg("snow");
          critter("snow", 160, now, { crown: true, pose: "hug" });
          ["peaches", "bojjii", "lychee"].forEach((id, i) => mini(id, 60 + i * 24, FLOOR_Y - 24, 2, true));
          ["riot", "beyonce", "penny"].forEach((id, i) => mini(id, 190 + i * 24, FLOOR_Y - 24, 2, false));
          for (let i = 0; i < 5; i++) {
            const drift = reduceMotion ? 0 : (now / 40 + i * 13) % 30;
            ctx.globalAlpha = 1 - drift / 30;
            sprite(FX["💕"], 110 + i * 24, FLOOR_Y - 60 - drift, 1);
          }
          ctx.globalAlpha = 1;
        },
      },
      {
        text: "Now she watches over the backyard from her fluffy cloud, keeping the crown warm for everyone. Forever loved.",
        draw(now) {
          storyBg("snow");
          const bob = reduceMotion ? 0 : Math.round(Math.sin(now / 500) * 3);
          ctx.fillStyle = "#ffffff";
          ctx.beginPath(); ctx.ellipse(160, 136 + bob, 36, 10, 0, 0, Math.PI * 2); ctx.fill();
          [[-22, -4], [0, -8], [22, -4]].forEach(([dx, dy]) => { ctx.beginPath(); ctx.arc(160 + dx, 136 + dy + bob, 10, 0, Math.PI * 2); ctx.fill(); });
          critter("snow", 160, now, { crown: true, y: 132 + bob });
          sparkleField(now, 10, 50, 120);
        },
      },
    ],
  };
  const THE_END = {
    get text() { return `${CHARS[hero].name} is the backyard champion! Thanks for playing Street Fluffers!`; },
    draw(now) {
      storyBg(hero, 0.25);
      critter(hero, 160, now, { crown: true });
      if (!reduceMotion && Math.random() < 0.2) emitFx(pick(["🎉", "✨", "💖"]), rand(30, 290), rand(90, 170), 1, "pop");
      fxBits.forEach((b) => { ctx.globalAlpha = Math.min(1, 2.2 - (b.life / b.max) * 2.2); sprite(b.img, b.x - 6, b.y - 6, 1); });
      ctx.globalAlpha = 1;
      text("The End", W / 2, 84, { font: "logo", size: 38, color: "#ffd23f", outline: "#2b1a52", ow: 7 });
      text(`SCORE ${score}`, W / 2, 110, { size: 9, color: "#fff8e4" });
    },
  };

  function drawStory(now) {
    const pnl = story.panels[story.i];
    ctx.fillStyle = "#2b1a52";                       // letterbox under the picture
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.translate(0, -STORY_SHIFT);
    pnl.draw(now);
    ctx.restore();
    // Caption box, typed out
    panel(10, 150, 300, 58);
    const shown = Math.max(0, Math.min(pnl.text.length, Math.floor((story.t - 300) / STORY_MS) + 1));
    let left = shown;
    wrap(pnl.text, 278).forEach((r, i) => {
      if (left <= 0) return;
      text(r.slice(0, left), 20, 164 + i * 12, { size: 6, align: "left", color: "#2b1a52", outline: false });
      left -= r.length + 1;
    });
    // Page dots
    story.panels.forEach((_, i) => {
      ctx.fillStyle = i === story.i ? "#ff5a3c" : "#c9b8f2";
      ctx.fillRect(300 - (story.panels.length - i) * 8, 154, 5, 5);
    });
  }

  /* ---------- Input ---------- */
  function syncMenus() {
    titleMenu.hidden = state !== "title";
    storyMenu.hidden = state !== "story";
    selectMenu.hidden = state !== "select";
    ladderMenu.hidden = state !== "ladder";
    talkMenu.hidden = state !== "talk";
    if (state !== "lose" && state !== "champ") overMenu.hidden = true;
    if (state === "lose") { overA.textContent = "Continue (9)"; overA.dataset.n = "9"; overB.textContent = "New critter"; }
    if (state === "champ") { overA.textContent = "Play again"; overA.dataset.n = ""; overB.textContent = "New critter"; }
    pad.hidden = !(touchUI && (state === "intro" || state === "fight" || state === "ko"));
    if (!pad.hidden && p1) {
      pad.querySelectorAll("[data-press^='sp']").forEach((b, i) => {
        const m = p1.C.specials[i];
        b.textContent = m.fx === "💨" ? "💨" : m.fx;
        b.setAttribute("aria-label", m.name);
      });
    }
  }

  function primary() {
    if (state === "paused") resume();
    else if (state === "ladder") startMatch();
    else if (state === "title") { audio(); startStory("intro"); }
    else if (state === "story") advanceStory();
    else if (state === "talk") advanceTalk();
  }

  // Special moves the old way: ↓ then → (toward the opponent), then BAP or KICK
  function motionSpecial() {
    const f = p1;
    if (!f) return false;
    const n = motion.length;
    return n >= 2 && motion[n - 2].d === "down" && motion[n - 1].d === (f.face > 0 ? "right" : "left") && clock - motion[n - 2].t < 450;
  }

  function press(action) {
    if (state === "paused") { resume(); return; }
    if ((action === "bap" || action === "kick") && motionSpecial()) { motion.length = 0; pin[action === "bap" ? "sp1" : "sp2"] = clock; return; }
    pin[action] = clock;
  }

  selectMenu.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-pick]");
    if (btn) startRun(btn.dataset.pick);
  });
  selectMenu.querySelectorAll("button").forEach((b) => {
    b.addEventListener("focus", () => setPreview(b.dataset.pick));
    b.addEventListener("pointerenter", () => setPreview(b.dataset.pick));
  });
  document.getElementById("fight").addEventListener("click", startMatch);
  document.getElementById("talkNext").addEventListener("click", advanceTalk);
  overA.addEventListener("click", () => { if (state === "lose") startMatch(); else startRun(hero); });
  overB.addEventListener("click", showSelect);

  canvas.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    canvas.focus({ preventScroll: true });
    if (e.pointerType === "touch" && !touchUI) { touchUI = true; syncMenus(); }
    primary();
  });

  // Touch pad: hold buttons for walking/jumping, tap buttons for attacks
  pad.querySelectorAll("button").forEach((btn) => {
    const hold = btn.dataset.hold, act = btn.dataset.press;
    const down = (e) => {
      e.preventDefault();
      try { btn.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      btn.classList.add("is-down");
      audio();
      if (hold) { if (state === "paused") resume(); pin[hold] = true; }
      else press(act);
    };
    const up = () => {
      btn.classList.remove("is-down");
      if (hold) pin[hold] = false;
    };
    btn.addEventListener("pointerdown", down);
    btn.addEventListener("pointerup", up);
    btn.addEventListener("pointercancel", up);
    btn.addEventListener("lostpointercapture", up);
    btn.addEventListener("contextmenu", (e) => e.preventDefault());
  });

  // Arrow keys move around the character select
  function selectNav(key) {
    const btns = [...selectMenu.querySelectorAll("button")];
    let i = btns.findIndex((b) => b.dataset.pick === preview);
    if (key === "arrowleft" || key === "a") i = (i + btns.length - 1) % btns.length;
    else if (key === "arrowright" || key === "d") i = (i + 1) % btns.length;
    else if (key === "arrowup" || key === "w") i = (i + btns.length - 4) % btns.length;
    else i = (i + 4) % btns.length;
    btns[i].focus({ preventScroll: true });
  }

  const DIRS = { arrowleft: "left", a: "left", arrowright: "right", d: "right", arrowup: "up", w: "up", arrowdown: "down", s: "down" };
  const ATTACKS = { j: "bap", z: "bap", k: "kick", x: "kick", l: "sp1", c: "sp1", i: "sp2", v: "sp2" };
  const fightStates = ["intro", "fight", "ko", "paused"];
  window.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.key === "Tab" || e.key === "Shift") return;
    if (window.YvyScores && YvyScores.isOpen()) return;   // typing initials
    if (!volPanel.hidden) {
      if (e.key === "Escape") { e.preventDefault(); showVolume(false); }
      return;                                             // arrow keys move the sliders
    }
    if (e.target.tagName === "BUTTON" && (e.key === " " || e.key === "Enter")) return; // let buttons work
    const key = e.key.toLowerCase();
    let handled = true;
    if (state === "select" && key in DIRS) selectNav(key);
    else if (key in DIRS) {
      const d = DIRS[key];
      if (d !== "down") pin[d] = true;
      if (!e.repeat) { motion.push({ d, t: clock }); if (motion.length > 4) motion.shift(); }
    } else if (key in ATTACKS) {
      if (!e.repeat && fightStates.includes(state)) press(ATTACKS[key]);
    } else if (key === " " || key === "enter") { if (!e.repeat) { if (state === "select") startRun(preview); else primary(); } }
    else if (key === "m") setMuted(!muted);
    else if (key === "p") (state === "paused" ? resume() : pause());
    else if (key === "escape") {
      if (state === "intro" || state === "fight" || state === "ko") pause();
      else if (state === "select") showTitle();   // back to the title screen
      else if (state === "story") skipStory();
      else if (embedded) { try { window.parent.postMessage({ yvyArcade: "close" }, location.origin); } catch (err) { /* ignore */ } }
    } else handled = false;
    if (handled) e.preventDefault();
  });
  window.addEventListener("keyup", (e) => {
    const d = DIRS[e.key.toLowerCase()];
    if (d && d !== "down") pin[d] = false;
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
  setPreview(preview);
  requestAnimationFrame(frame);
  document.getElementById("startBtn").addEventListener("click", () => { audio(); startStory("intro"); });
  document.getElementById("storyNext").addEventListener("click", advanceStory);
  document.getElementById("storySkip").addEventListener("click", skipStory);
  if (!embedded) document.getElementById("startBtn").focus({ preventScroll: true });
})();
