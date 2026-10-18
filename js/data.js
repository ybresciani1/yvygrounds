/*
 * ✿ YvyGrounds content file ✿
 * Almost everything you'll want to change lives here: games, photos,
 * chickens, pets, and the silly text bits. Save and refresh the page.
 *
 * Anything marked SAMPLE is placeholder content. Swap it for the real thing.
 */

// Sticker-sheet poses. Each sheet is cropped into images/me/<prefix><file>.jpg
// (sheet 1 has no prefix, sheet 2 is "s2-", sheet 3 is "s3-").
const STICKER_POSES = [
  ["hello", "Hello!"], ["hahaha", "Hahaha"], ["wow", "Wow~"], ["muah", "Muah~"],
  ["i-love-you", "I love you"], ["so-cute", "So cute"], ["thinking", "Thinking.."],
  ["blushing", "Blushing"], ["proud", "Proud"], ["oh-my-god", "Oh my God!"],
  ["dazed", "Dazed~"], ["sleepy", "Sleepy..."], ["hmph", "Hmph!"], ["ew", "Ew!!"],
  ["sob", "Sob"], ["the-best", "The best!"],
];
const stickerSet = (prefix) =>
  STICKER_POSES.map(([file, caption]) => ({ src: `images/me/${prefix}${file}.jpg`, caption }));

window.YVY = {

  // Shown in the Animal Crossing-style speech box under the logo.
  welcome: "Howdy, neighbor! Welcome to YvyGrounds, my little patch of the internet. Grab a watering can and play something!",

  // "Attention Players!" message on the welcome card.
  announcement: "New gardening games and silly games sprout here every season. Check the Yvy Portal below!",

  // Scrolling news ticker at the very top.
  ticker: [
    "★ Welcome to YvyGrounds! ★",
    "🌱 Gardening games, silly games & chickens",
    "📸 Click Yvy's head for Almost Actual Photos",
    "🐔 The flock says hi (bawk)",
    "💧 Don't forget to water your plants!",
  ],

  // Your contact + links. Leave a value as "" to hide it.
  email: "ybresciani@gmail.com",   // every "Write to me" link opens an email to this
  links: [
    // SAMPLE: uncomment and edit the ones you use
    // { label: "itch.io", url: "https://ybresciani.itch.io" },
    // { label: "GitHub",  url: "https://github.com/ybresciani" },
  ],

  // The "About Yvy" letter. Each string is one paragraph.
  about: [
    "I'm Yvy (you'll find me as ybresciani around the internet). I make games: cozy gardening games, and also some very silly ones.",
    "When I'm not making games, I'm out in the garden with my garden students and the garden club, or hanging out with my family, the pets and our chickens.",
    "You can also find me paddleboarding (mostly standing, occasionally swimming) and working out: yoga, Pilates and, most importantly, calisthenics. The big quest is a handstand. Current record: about one hiccup long. The chickens remain unimpressed.",
    "This is where all my games live. Hope you find one you like! Got a question, an idea, or a handstand tip? Write to me!",
  ],

  /*
   * GAMES
   *  type:     "garden", "silly" or "story"
   *  url:      link to play it (Vercel, itch.io, etc.). "" shows "coming soon".
   *  thumb:    optional image, e.g. "images/games/tomato.png". "" uses a pixel icon.
   *  date:     "YYYY-MM-DD", newest show first. Games from the last 45 days get a NEW! tag.
   *  featured: true puts it on the Game of the Week TV (first one wins).
   *  badge:    optional extra tag, e.g. "rough draft"
   */
  games: [
    { title: "Rabbit & Frog: Gardenbound", type: "garden", date: "2026-10-18", featured: true,
      url: "https://seed-game-pi.vercel.app/", thumb: "images/games/rabbit-and-frog.png",
      blurb: "A watercolor garden adventure all about seeds: how they pop, travel and get saved for next year. Play in English or Español!" },
    { title: "Master Composter Quest", type: "garden", date: "2026-10-07",
      url: "https://master-composter.vercel.app/", thumb: "images/games/master-composter.jpg",
      blurb: "Doze off in compost class, wake up in a dream world, and follow Wallace the worm through soil-science challenges." },
    { title: "Tijuana Estuary Explorer", type: "garden", date: "2026-10-06", badge: "rough draft",
      url: "https://tijuana-estuary-game.vercel.app/", thumb: "images/games/tijuana-estuary.jpg",
      blurb: "Walk a park ranger through ten estuary zones, collect field data, and battle oil spills and invasive species." },
    { title: "Mike & Yvy's Love Adventure", type: "story", date: "2026-10-06",
      url: "https://mike-yvy-love-adventure.vercel.app/", thumb: "images/games/mike-yvy-love-story.jpg",
      blurb: "A retro pixel RPG about how Mike and Yvy fell in love, from a chaotic airport trip all the way to moving in." },
  ],

  /*
   * PHOTOS
   * Drop image files into the matching images/ folder, then list them here.
   * These also fill the oval photo wall in the background.
   *   { src: "images/chickens/coop-day.jpg", caption: "The girls inspecting the new coop" }
   *
   * Heads up: get a parent/guardian OK before posting photos of students who are kids.
   */
  photos: {
    me: [           // images/me/        (the first one becomes the "click my head" photo)
      { src: "images/me/the-best.jpg",       caption: "The best!" },
      { src: "images/me/fairy-flower.jpg",   caption: "Tiny fairy, giant flower" },
      { src: "images/me/fairy-leaves.jpg",   caption: "Fairy hiding in the garden" },
      { src: "images/me/pikachu.jpg",        caption: "Got swallowed by a Pikachu" },
      { src: "images/me/star-guardian.jpg",  caption: "Star Guardian cosplay ✨" },
      { src: "images/me/yukata-1.jpg",       caption: "Yukata night market" },
      { src: "images/me/yukata-2.jpg",       caption: "Candied strawberries!!" },
      { src: "images/me/caricature.jpg",     caption: "Mike & Yvy, caricature edition" },
      { src: "images/me/throwback.jpg",      caption: "Throwback! ✌️" },
      { src: "images/me/vinyl.jpg",          caption: "Spinning records" },
      { src: "images/me/portrait-color.jpg", caption: "Hi there" },
      { src: "images/me/portrait-bw.jpg",    caption: "Black & white mood" },
      { src: "images/me/black-tank.jpg",     caption: "Plotting my next game" },
      { src: "images/me/car-selfie.jpg",     caption: "Road trip selfie" },
      { src: "images/me/dress-burgundy.jpg", caption: "Dress hunting" },
      { src: "images/me/dress-blue.jpg",     caption: "Feeling blue (the good kind)" },
      { src: "images/me/gingham.jpg",        caption: "Sunny gingham day" },
      ...stickerSet("").slice(0, -1),       // sheet 1 ("The best!" is already first)
      ...stickerSet("s2-"),
      ...stickerSet("s3-"),
    ],
    club:     [],   // images/club/      garden club
    students: [],   // images/students/  garden students
    pets:     [],   // images/pets/
    chickens: [     // images/chickens/
      { src: "images/chickens/riot-and-yvy.jpg", caption: "Me and Riot, my Polish chicken" },
    ],
  },

  // CHICKENS. photo is optional. (Mystery hens are SAMPLE placeholders.)
  flock: [
    { name: "Riot", breed: "Polish", photo: "images/chickens/riot.jpg",
      fact: "Rocks a giant pom-pom hairdo and can't see where she's going. Goes anyway." },
    { name: "Mystery Hen",     breed: "Breed TBA",  fact: "Has not yet agreed to a photoshoot.", photo: "" },
    { name: "Hen of Intrigue", breed: "Breed TBA",  fact: "Lays eggs. Keeps secrets.",           photo: "" },
  ],

  // PETS (SAMPLE placeholders)
  pets: [
    { name: "Mystery Pet", kind: "Species TBA", fact: "Has opinions about keyboards.", photo: "" },
    { name: "Pet No. 2",   kind: "Species TBA", fact: "Professional napper.",          photo: "" },
  ],

  // "This Day in Yvy History". One is picked per calendar day. (SAMPLE: add real ones!)
  history: [
    "Yvy decides every snack tastes better eaten in the garden.",
    "A chicken attempts to join garden club. Membership pending.",
    "Yvy names a zucchini. Regrets nothing.",
    "All the tomatoes ripen at once. Again.",
    "Yvy makes a game instead of weeding. The weeds file a complaint.",
    "Garden club finds a worm described as 'basically a noodle'.",
    "A pet sits directly on the keyboard during an important build.",
  ],
};
