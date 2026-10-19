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
   * GAMES (the portal shows them in this order: move an entry up or down to reorder)
   *  type:     "garden", "silly", "story" or "mystery", or a list like ["silly", "story"]
   *  url:      link to play it (Vercel, itch.io, etc.). "" shows "coming soon".
   *  play:     for mini games that live right here on YvyGrounds, the folder in arcade/,
   *            e.g. "arcade/tomato-tussle/". Opens in the pop-up arcade instead of a new tab.
   *  thumb:    optional image, e.g. "images/games/tomato.png". "" uses a pixel icon.
   *  icon:     optional pixel icon from js/pixels.js (e.g. "tomato") when there's no thumb.
   *  date:     "YYYY-MM-DD". "Latest 5 Sprouts" lists newest first; games from the last 45 days get a NEW! tag.
   *            A date in the future locks the game until that day: it shows "🔒 coming <date>" and unlocks by itself.
   *  featured: true puts it on the Game of the Week TV (first one wins).
   *  badge:    optional extra tag, e.g. "rough draft" or "still updating ✨"
   */
  games: [
    { title: "Rabbit & Frog: Gardenbound", type: "garden", date: "2026-10-18", featured: true, badge: "still updating ✨",
      url: "https://seed-game-pi.vercel.app/", thumb: "images/games/rabbit-and-frog.png",
      blurb: "A watercolor garden adventure all about seeds: how they pop, travel and get saved for next year. Play in English or Español!" },
    { title: "Tomato Tussle", type: ["garden", "silly"], date: "2026-10-18", play: "arcade/tomato-tussle/", icon: "tomato",
      blurb: "Squirrels, crows and raccoons are raiding the garden. Splat them with tomatoes, but don't splat Riot or Beyonce!" },
    { title: "Master Composter Quest", type: "garden", date: "2026-10-07",
      url: "https://master-composter.vercel.app/", thumb: "images/games/master-composter.jpg",
      blurb: "Doze off in compost class, wake up in a dream world, and follow Wallace the worm through soil-science challenges." },
    { title: "Bowl Brawl", type: "silly", date: "2026-10-18", play: "arcade/bowl-brawl/", icon: "bowl",
      blurb: "Peaches vs. Lychee: a quick-draw duel over the food bowl. Wait for Bojjii's flag, then pounce! 1 or 2 players." },
    { title: "Who is my wife cheating with!?", type: ["silly", "story"], date: "2026-10-18",
      url: "https://who-is-my-wife-cheating-with.vercel.app/", thumb: "images/games/who-is-my-wife-cheating-with.jpg",
      blurb: "A crime of passion, investigated entirely in MS Paint. Made with ALCaline. Play in English or Español!" },
    { title: "Tijuana Estuary Explorer", type: "garden", date: "2026-10-06", badge: "rough draft",
      url: "https://tijuana-estuary-game.vercel.app/", thumb: "images/games/tijuana-estuary.jpg",
      blurb: "Walk a park ranger through ten estuary zones, collect field data, and battle oil spills and invasive species." },
    { title: "Mike & Yvy's Love Adventure", type: "story", date: "2026-10-06", badge: "still updating ✨",
      url: "https://mike-yvy-love-adventure.vercel.app/", thumb: "images/games/mike-yvy-love-story.jpg",
      blurb: "A retro pixel RPG about how Mike and Yvy fell in love, from a chaotic airport trip all the way to moving in." },
    // Monthly arcade releases: a future date keeps a game locked ("coming Nov 18") until that day.
    // See OPEN_ITEMS.md for the release calendar.
    { title: "Egg Catch", type: "silly", date: "2026-11-18", play: "arcade/egg-catch/", icon: "chicken",
      blurb: "Riot and Beyonce are laying eggs from the coop roof. Catch them in your basket before they crack!" },
    { title: "??? Mystery Game ???", type: "mystery", date: "2026-10-18", url: "", thumb: "",
      blurb: "Something is sprouting... and it's a secret. Check back soon!" },
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
    pets: [         // images/pets/
      // Peaches (fox-faced Pomeranian)
      { src: "images/pets/peaches-hehe-bite.jpg",       caption: "Hehe, bite playing" },
      { src: "images/pets/peaches-spring.jpg",          caption: "Peaches in spring 🌼", focus: "0% 30%" },
      { src: "images/pets/peaches-and-flowers.jpg",     caption: "Peaches and the flowers", focus: "60% 40%" },
      { src: "images/pets/peaches-first-day-home-1.jpg", caption: "First day home (meeting a unicorn)", focus: "72% 40%" },
      { src: "images/pets/peaches-first-day-home.jpg",  caption: "Peaches' first day home", focus: "35% 50%" },
      { src: "images/pets/peaches-bunny-outfit.jpg",    caption: "Bunny outfit 🐰", focus: "10% 50%" },
      { src: "images/pets/peaches-lgbtq-friendly.jpg",  caption: "LGBTQ friendly 🌈", focus: "50% 40%" },
      { src: "images/pets/peaches-jean-outfit.jpg",     caption: "Peaches in her jean outfit", focus: "65% 30%" },
      { src: "images/pets/peaches-heart.jpg",           caption: "Peaches ♥", focus: "50% 20%" },
      { src: "images/pets/peaches-and-yvy-fox.jpg",     caption: "Me and Peaches in her fox costume 🦊", focus: "45% 40%" },
      { src: "images/pets/peaches-wide-mouth.jpg",      caption: "Wide mouth!", focus: "80% 50%" },
      { src: "images/pets/peaches-in-arms.jpg",         caption: "Peaches in my arms", focus: "80% 50%" },
      { src: "images/pets/peaches-booties.jpg",         caption: "Peaches' booties", focus: "50% 50%" },
      { src: "images/pets/peaches-butterflies.jpg",     caption: "Sweet girl with butterflies in her fur 🦋", focus: "40% 50%" },
      { src: "images/pets/peaches-autumn.jpg",          caption: "Peaches loves autumn 🍂" },
      { src: "images/pets/peaches-bikini.jpg",          caption: "Beach ready in her bikini 👙", focus: "90% 50%" },
      { src: "images/pets/peaches-night-walk.jpg",      caption: "Night walk", focus: "50% 45%" },
      { src: "images/pets/peaches-uh.jpg",              caption: "Peaches: uh.", focus: "32% 50%" },
      { src: "images/pets/peaches-ice-cream.jpg",       caption: "Doggy ice cream 🍦", focus: "100% 50%" },
      { src: "images/pets/peaches-blushing.jpg",        caption: "Peaches blushing", focus: "35% 50%" },
      { src: "images/pets/peaches-hamster-face.jpg",    caption: "Sad hamster face", focus: "60% 30%" },
      { src: "images/pets/peaches-sad-face.jpg",        caption: "Sad face (she's fine)", focus: "50% 40%" },
      { src: "images/pets/peaches-cozy-blankets.jpg",   caption: "Cozy again", focus: "50% 62%" },
      { src: "images/pets/peaches-cozy-bed.jpg",        caption: "Peaches cozy", focus: "80% 40%" },
      { src: "images/pets/peaches-snowy-paw.jpg",       caption: "Snowy paw ❄️" },
      { src: "images/pets/peaches-bike-ride-1.jpg",     caption: "Bike ride!", focus: "40% 30%" },
      { src: "images/pets/peaches-bike-ride-2.jpg",     caption: "Bike ride, part 2", focus: "38% 30%" },
      { src: "images/pets/peaches-queen-bee.jpg",       caption: "Peaches the queen bee 🐝" },
      { src: "images/pets/peaches-queen-bee-feast.jpg", caption: "Queen bee, about to feast", focus: "50% 40%" },
      { src: "images/pets/peaches-wig.jpg",             caption: "Peaches in a wig", focus: "50% 55%" },
      { src: "images/pets/peaches-raincoat.jpg",        caption: "Raincoat ☔" },
      { src: "images/pets/peaches-hospital.jpg",        caption: "At the hospital after eating avocado 🥑", wall: false },
      // Bojjii (mutt, German Shepherd × Aussie Shepherd, we think)
      { src: "images/pets/bojjii-handsome.jpg",         caption: "Handsome Bojjii, and he knows it 😎", focus: "50% 40%" },
      { src: "images/pets/bojjii-puppy-car.jpg",        caption: "Puppy Bojjii, certified co-pilot 🚗", focus: "50% 20%" },
      { src: "images/pets/bojjii-puppy-grass.jpg",      caption: "Baby Bojjii, 90% ears", focus: "50% 20%" },
      { src: "images/pets/bojjii-puppy-couch.jpg",      caption: "Me and puppy Bojjii (he was smiling first)", focus: "50% 20%" },
      { src: "images/pets/bojjii-backpack.jpg",         caption: "Bojjii packed his own backpack. Contents: vibes 🎒" },
      { src: "images/pets/bojjii-poppies.jpg",          caption: "Sun's out, tongue's out ☀️", focus: "66% 40%" },
      { src: "images/pets/bojjii-artichokes.jpg",       caption: "Head of artichoke security 🌿", focus: "41% 50%" },
      { src: "images/pets/bojjii-coop-guard.jpg",       caption: "Farmer Yvy on chick duty, Bojjii on patrol 🐣", focus: "0% 50%" },
      { src: "images/pets/bojjii-ball-living-room.jpg", caption: "Ball? Ball. BALL. 🎾", focus: "50% 35%" },
      { src: "images/pets/bojjii-ball-kitchen.jpg",     caption: "Fetch mode: ON", focus: "50% 40%" },
      { src: "images/pets/bojjii-cute.jpg",             caption: "Bed hog, but make it cute" },
      { src: "images/pets/bojjii-cozy.jpg",             caption: "Throne secured. Taco tag on. 🌮" },
      { src: "images/pets/bojjii-sleepy.jpg",           caption: "Sleepy Bojjii. Do not disturb. 💤", focus: "50% 55%" },
      { src: "images/pets/bojjii-distance.jpg",         caption: "Looking off into the distance (thinking about snacks)", focus: "100% 50%" },
      { src: "images/pets/bojjii-hair-clips.jpg",       caption: "Girly Bojjii: clips in, dignity optional 🎀", focus: "50% 32%" },
      { src: "images/pets/bojjii-wig.jpg",              caption: "Bojjii got bangs. No regrets.", focus: "50% 20%" },
      { src: "images/pets/bojjii-party-hat.jpg",        caption: "Sad bday boi. The hat was not his idea 🎉" },
      { src: "images/pets/bojjii-birthday.jpg",         caption: "Birthday Bojjii, party of one 🥳", focus: "50% 15%" },
      { src: "images/pets/bojjii-reindeer.jpg",         caption: "Reindeer Bojjii in his holiday socks 🦌", focus: "50% 20%" },
      { src: "images/pets/bojjii-christmas.jpg",        caption: "Wearing the tree so the tree doesn't feel left out 🎄" },
      { src: "images/pets/bojjii-happy.jpg",            caption: "The happiest boy in the whole house", focus: "50% 25%" },
      // Lychee (tabby cat)
      { src: "images/pets/lychee-cucumber.jpg",         caption: "Lychee, chilling on a cold cucumber 🥒", focus: "70% 50%" },
      { src: "images/pets/lychee-kitten.jpg",           caption: "Baby Lychee and the jingle-bell collar 🔔", focus: "50% 25%" },
      { src: "images/pets/lychee-kitten-play.jpg",      caption: "Tiny Lychee, 100% toe beans 🐾", focus: "15% 50%" },
      { src: "images/pets/lychee-mariachi.jpg",         caption: "Mariachi Lychee, ready for the serenade 🎺", focus: "50% 20%" },
      { src: "images/pets/lychee-cosplay.jpg",          caption: "Lychee in full Akatsuki cosplay ☁️" },
      { src: "images/pets/lychee-vacation.jpg",         caption: "Vacation Lychee in a tiger shirt 🌴" },
      { src: "images/pets/lychee-bee.jpg",              caption: "Bee Lychee, deeply tired of our nonsense 🐝" },
      { src: "images/pets/lychee-basket.jpg",           caption: "Chonky Lychee, loafing in the basket 🧺" },
      { src: "images/pets/lychee-backpack-treat.jpg",   caption: "Backpack Lychee, side-eyeing the pup cup 🍦", focus: "50% 58%" },
      // Peaches and the crew
      { src: "images/pets/peaches-bojjii-pancake.jpg",  caption: "Peaches and Bojjii begging for a tiny pancake 🥞", focus: "50% 45%" },
      { src: "images/pets/peaches-bojjii-blur.jpg",     caption: "Evil buahahah face (and blurry Bojjii)", focus: "50% 100%", wall: false },
      { src: "images/pets/peaches-devil-lychee.jpg",    caption: "Evil Peaches 😈 (Lychee is watching)", focus: "100% 30%" },
      { src: "images/pets/peaches-lychee-battle-1.jpg", caption: "Peaches vs. Lychee: the battle", focus: "50% 80%" },
      { src: "images/pets/peaches-lychee-battle-2.jpg", caption: "The battle continues", focus: "50% 50%" },
      { src: "images/pets/peaches-bojjii-pc.jpg",       caption: "Peaches and Bojjii waiting for me to get off the PC", focus: "45% 50%" },
      { src: "images/pets/bojjii-peaches-easter.jpg",   caption: "Matching Easter fits. Bojjii is thrilled. Peaches is thrilleder 🐰", focus: "100% 50%" },
      { src: "images/pets/lychee-peaches-nonsense.jpg", caption: "Peaches attacks. Lychee files a complaint.", focus: "50% 50%" },
      { src: "images/pets/christmas-crew.jpg",          caption: "Bojjii, Peaches and Lychee at Christmas 🎄" },
    ],
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

  // PETS (Critter Corner cards). photo is optional.
  pets: [
    { name: "Peaches", kind: "Fox-faced Pomeranian", photo: "images/pets/peaches-hehe-bite.jpg",
      fact: "Owns more outfits than anyone in the house. Wears every one of them with pride." },
    { name: "Bojjii", kind: "Mutt (German Shepherd × Aussie Shepherd, we think)", photo: "images/pets/bojjii-handsome.jpg", focus: "50% 40%",
      fact: "The big sweet boy. Will wear antlers, wigs and party hats for the team (and beg for pancakes)." },
    { name: "Lychee", kind: "Tabby cat", photo: "images/pets/lychee-cucumber.jpg", focus: "70% 50%",
      fact: "Lounges on vegetables, tolerates costumes, and is deeply tired of Peaches' nonsense." },
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
