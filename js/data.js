/*
 * ✿ YvyGrounds content file ✿
 * Almost everything you'll want to change lives here: games, photos,
 * chickens, pets, and the silly text bits. Save and refresh the page.
 *
 * Anything marked SAMPLE is placeholder content. Swap it for the real thing.
 */

// Yvy feelings folder: sticker-sheet poses, saved but NOT shown on the site.
// Files live in images/yvy-feelings/<sheet>/<pose>.jpg
// (sheets: "sheet-1-sailor-mars", "sheet-2", "sheet-3"; same 16 poses each).
// To show a whole sheet in the Yvy album again, add ...stickerSet("sheet-2") to photos.me below.
const STICKER_POSES = [
  ["hello", "Hello!"], ["hahaha", "Hahaha"], ["wow", "Wow~"], ["muah", "Muah~"],
  ["i-love-you", "I love you"], ["so-cute", "So cute"], ["thinking", "Thinking.."],
  ["blushing", "Blushing"], ["proud", "Proud"], ["oh-my-god", "Oh my God!"],
  ["dazed", "Dazed~"], ["sleepy", "Sleepy..."], ["hmph", "Hmph!"], ["ew", "Ew!!"],
  ["sob", "Sob"], ["the-best", "The best!"],
];
const stickerSet = (sheet) =>
  STICKER_POSES.map(([file, caption]) => ({ src: `images/yvy-feelings/${sheet}/${file}.jpg`, caption }));

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

  // Background photo wall: share of photo frames that stay as cute emoji frames
  // so it doesn't feel crowded. 0 = all photos, 0.3 = about 1 in 3, 1 = all emoji.
  wallEmojiShare: 0.3,

  /*
   * PHOTOS
   * Drop image files into the matching images/ folder, then list them here.
   * These also fill the oval photo wall in the background.
   *   { src: "images/chickens/coop-day.jpg", caption: "The girls inspecting the new coop" }
   *
   * Frames (ovals, circles, the scrapbook) crop photos to fit. If a head or crest
   * gets cut off, add focus to say which part to keep in view:
   *   focus: "top"         also "bottom", "left", "right", "center", "top left"...
   *   focus: "30% 20%"     left-right %, then top-bottom % (0% = left/top edge)
   * Without focus, frames keep the upper-middle (50% 30%) in view.
   * focus also works on flock/pets cards and game thumbs.
   * (The scrapbook frame is square; the photo popup always shows the whole photo.)
   *
   * wall: false keeps a photo out of the background photo wall
   * (it still shows in the scrapbook and popup).
   *
   * Heads up: get a parent/guardian OK before posting photos of students who are kids.
   */
  photos: {
    me: [           // images/me/        (the first one becomes the "click my head" photo)
      { src: "images/me/the-best.jpg",       caption: "The best!" },
      { src: "images/me/fairy-flower.jpg",   caption: "Tiny fairy, giant flower", focus: "50% 72%" },
      { src: "images/me/fairy-leaves.jpg",   caption: "Fairy hiding in the garden" },
      { src: "images/me/pikachu.jpg",        caption: "Got swallowed by a Pikachu" },
      { src: "images/me/star-guardian.jpg",  caption: "Star Guardian cosplay ✨", focus: "top" },
      { src: "images/me/yukata-1.jpg",       caption: "Yukata night market", focus: "55% 30%" },
      { src: "images/me/yukata-2.jpg",       caption: "Candied strawberries!!" },
      { src: "images/me/caricature.jpg",     caption: "Mike & Yvy, caricature edition" },
      { src: "images/me/throwback.jpg",      caption: "Throwback! ✌️" },
      { src: "images/me/vinyl.jpg",          caption: "Spinning records", focus: "50% 40%" },
      { src: "images/me/portrait-color.jpg", caption: "Hi there" },
      { src: "images/me/portrait-bw.jpg",    caption: "Black & white mood" },
      { src: "images/me/black-tank.jpg",     caption: "Plotting my next game", focus: "50% 15%" },
      { src: "images/me/car-selfie.jpg",     caption: "Road trip selfie", focus: "55% 50%" },
      { src: "images/me/dress-burgundy.jpg", caption: "Dress hunting", focus: "50% 15%" },
      { src: "images/me/dress-blue.jpg",     caption: "Feeling blue (the good kind)", focus: "50% 15%" },
      { src: "images/me/gingham.jpg",        caption: "Sunny gingham day", focus: "50% 15%" },
    ],
    club:     [],   // images/club/      garden club
    students: [],   // images/students/  garden students
    pets:     [],   // images/pets/
    chickens: [     // images/chickens/
      // Riot (buff Polish)
      { src: "images/chickens/riot-and-yvy.jpg",       caption: "Me and Riot" },
      { src: "images/chickens/riot-front.jpg",         caption: "Riot can see you. Probably.", focus: "50% 20%" },
      { src: "images/chickens/riot-coop.jpg",          caption: "Riot (Beyonce lurking behind)", focus: "50% 20%" },
      { src: "images/chickens/riot-baby-1.jpg",        caption: "Baby Riot, already rocking the hairdo", focus: "25% 45%" },
      { src: "images/chickens/riot-baby-2.jpg",        caption: "Riot, mid glow-up", focus: "30% 40%" },
      // Beyonce (golden laced Polish)
      { src: "images/chickens/beyonce-kale.jpg",       caption: "Beyonce guarding the kale", focus: "50% 15%" },
      { src: "images/chickens/beyonce-patrol.jpg",     caption: "Beyonce on patrol" },
      { src: "images/chickens/beyonce-yard.jpg",       caption: "Beyonce strutting the yard", focus: "50% 38%" },
      { src: "images/chickens/beyonce-cage.jpg",       caption: "Beyonce, unimpressed", focus: "30% 30%", wall: false },
      { src: "images/chickens/beyonce-glare.jpg",      caption: "Beyonce's signature glare", focus: "50% 100%", wall: false },
      // Both
      { src: "images/chickens/baby-beyonce-riot.jpg",  caption: "Baby Beyonce and baby Riot" },
      { src: "images/chickens/riot-beyonce-table.jpg", caption: "Riot and Beyonce, tabletop edition", focus: "55% 45%" },
      // Snow (white Silkie) 🌈
      { src: "images/chickens/snow-dandelions.jpg",    caption: "Snow among the dandelions", focus: "45% 50%" },
      { src: "images/chickens/snow-grass.jpg",         caption: "Snow at golden hour", focus: "50% 76%" },
      { src: "images/chickens/snow-closeup.jpg",       caption: "Snow's best side", focus: "55% 40%" },
      { src: "images/chickens/snow-held.jpg",          caption: "Snow, our little cloud", focus: "38% 40%" },
      { src: "images/chickens/snow-inside.jpg",        caption: "Snow on indoor duty", focus: "52% 50%" },
      // Chick days and friends
      { src: "images/chickens/brooder-crew.jpg",       caption: "The silkie brooder crew" },
      { src: "images/chickens/silkie-chick.jpg",       caption: "Tiny silkie fluffball", focus: "45% 50%" },
      { src: "images/chickens/yvy-fake-chickens-1.jpg", caption: "Me and some very well-behaved chickens (they're fake)", focus: "30% 40%" },
      { src: "images/chickens/yvy-fake-chickens-2.jpg", caption: "Still trying to befriend the fake chickens", focus: "40% 50%" },
    ],
  },

  // CHICKENS (Critter Corner cards). photo is optional.
  flock: [
    { name: "Riot", breed: "Buff Laced Polish", photo: "images/chickens/riot.jpg",
      fact: "Rocks a giant pom-pom hairdo and can't see where she's going. Goes anyway." },
    { name: "Beyonce", breed: "Golden Laced Polish", photo: "images/chickens/beyonce.jpg",
      fact: "The feisty one. Runs the coop, and the coop knows it." },
    { name: "Snow 🌈", breed: "Silkie", photo: "images/chickens/snow.jpg",
      fact: "Our fluffy little cloud. She's the mystery chicken now, keeping watch from somewhere extra soft. Forever loved." },
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
