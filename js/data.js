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
    "When I'm not making games, I'm out in the garden with my garden students and the Garden Society, or hanging out with my family, the pets and our chickens.",
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
      { src: "images/me/the-best.jpg",       caption: "Certified the best. Source: me ✨" },
      { src: "images/me/fairy-flower.jpg",   caption: "Tiny fairy, giant flower. Scale is a social construct 🌸", focus: "50% 72%" },
      { src: "images/me/fairy-leaves.jpg",   caption: "Fairy in the garden. You didn't see me 🧚" },
      { src: "images/me/pikachu.jpg",        caption: "Got swallowed by a Pikachu" },
      { src: "images/me/star-guardian.jpg",  caption: "Star Guardian on duty. Evil, beware ✨", focus: "top" },
      { src: "images/me/yukata-1.jpg",       caption: "Yukata on, snack radar on 🏮", focus: "55% 30%" },
      { src: "images/me/yukata-2.jpg",       caption: "Candied strawberries!! (all mine) 🍓" },
      { src: "images/me/caricature.jpg",     caption: "Mike & Yvy, now with 200% bigger heads" },
      { src: "images/me/throwback.jpg",      caption: "Throwback to my peace-sign era ✌️" },
      { src: "images/me/vinyl.jpg",          caption: "DJ Yvy, taking requests (no requests) 🎶", focus: "50% 40%" },
      { src: "images/me/portrait-color.jpg", caption: "Oh hi, didn't see you there 👋" },
      { src: "images/me/portrait-bw.jpg",    caption: "Black & white = very serious artist mode 🎞️" },
      { src: "images/me/black-tank.jpg",     caption: "Plotting my next game (it has chickens) 🎮", focus: "50% 15%" },
      { src: "images/me/car-selfie.jpg",     caption: "Road trip selfie, snacks within reach 🚗", focus: "55% 50%" },
      { src: "images/me/dress-burgundy.jpg", caption: "Dress hunting: the mirror said yes 👗", focus: "50% 15%" },
      { src: "images/me/dress-blue.jpg",     caption: "Feeling blue (the good kind)", focus: "50% 15%" },
      { src: "images/me/gingham.jpg",        caption: "Gingham + sunshine = picnic energy 🧺", focus: "50% 15%" },
    ],
    club:     [],   // images/club/      Garden Society
    students: [],   // images/students/  garden students
    pets: [         // images/pets/
      // Peaches (fox-faced Pomeranian)
      { src: "images/pets/peaches-hehe-bite.jpg",       caption: "Hehe, bite playing. Tiny teeth, big love 😬" },
      { src: "images/pets/peaches-spring.jpg",          caption: "Spring Peaches, fully in bloom 🌼", focus: "0% 30%" },
      { src: "images/pets/peaches-and-flowers.jpg",     caption: "Stopping to smell the poppies, as one does 🌺", focus: "60% 40%" },
      { src: "images/pets/peaches-first-day-home-1.jpg", caption: "First day home. The unicorn seems suspicious 🦄", focus: "72% 40%" },
      { src: "images/pets/peaches-first-day-home.jpg",  caption: "First day home, already plotting to own the place", focus: "35% 50%" },
      { src: "images/pets/peaches-bunny-outfit.jpg",    caption: "Part bunny, part Pom, all sunshine 🐰", focus: "10% 50%" },
      { src: "images/pets/peaches-lgbtq-friendly.jpg",  caption: "LGBTQ friendly and fabulous about it 🌈", focus: "50% 40%" },
      { src: "images/pets/peaches-jean-outfit.jpg",     caption: "Double denim? Peaches makes it work 👖", focus: "65% 30%" },
      { src: "images/pets/peaches-heart.jpg",           caption: "Peaches, now in heart-balloon HD ♥", focus: "50% 20%" },
      { src: "images/pets/peaches-and-yvy-fox.jpg",     caption: "Me and Peaches: a fox-faced Pom in an actual fox costume 🦊", focus: "45% 40%" },
      { src: "images/pets/peaches-wide-mouth.jpg",      caption: "Wide mouth mode: activated 😮", focus: "80% 50%" },
      { src: "images/pets/peaches-in-arms.jpg",         caption: "Peaches in my arms, smiling like she won something", focus: "80% 50%" },
      { src: "images/pets/peaches-booties.jpg",         caption: "Peaches vs. booties. The booties are winning 👟", focus: "50% 50%" },
      { src: "images/pets/peaches-butterflies.jpg",     caption: "Sweet girl with butterflies in her fur 🦋", focus: "40% 50%" },
      { src: "images/pets/peaches-autumn.jpg",          caption: "Pumpkin spice Peaches 🍂" },
      { src: "images/pets/peaches-bikini.jpg",          caption: "Beach ready in her bikini. Mermaid era 🧜‍♀️", focus: "90% 50%" },
      { src: "images/pets/peaches-night-walk.jpg",      caption: "Night walk: pink sweater, zero fear 🌙", focus: "50% 45%" },
      { src: "images/pets/peaches-uh.jpg",              caption: "Peaches: uh. Put me down, sir.", focus: "32% 50%" },
      { src: "images/pets/peaches-ice-cream.jpg",       caption: "Doggy ice cream. Do not interrupt 🍦", focus: "100% 50%" },
      { src: "images/pets/peaches-blushing.jpg",        caption: "Don't look at me, I'm blushing 🙈", focus: "35% 50%" },
      { src: "images/pets/peaches-hamster-face.jpg",    caption: "Sad hamster face, deployed for treats 🐹", focus: "60% 30%" },
      { src: "images/pets/peaches-sad-face.jpg",        caption: "Sad face (she's fine)", focus: "50% 40%" },
      { src: "images/pets/peaches-cozy-blankets.jpg",   caption: "Cozy again. Blanket burrito level: expert 🌯", focus: "50% 62%" },
      { src: "images/pets/peaches-cozy-bed.jpg",        caption: "Fluffy tail, fluffier attitude", focus: "80% 40%" },
      { src: "images/pets/peaches-snowy-paw.jpg",       caption: "Snowy paw, high five pending ❄️" },
      { src: "images/pets/peaches-bike-ride-1.jpg",     caption: "Bike basket co-pilot 🚲", focus: "40% 30%" },
      { src: "images/pets/peaches-bike-ride-2.jpg",     caption: "Bike ride, part 2: still the boss of the basket", focus: "38% 30%" },
      { src: "images/pets/peaches-queen-bee.jpg",       caption: "Queen bee, braids and all 🐝" },
      { src: "images/pets/peaches-queen-bee-feast.jpg", caption: "Queen bee, about to feast. The steak is in danger 🍽️", focus: "50% 40%" },
      { src: "images/pets/peaches-wig.jpg",             caption: "New wig, who dis? 💁‍♀️", focus: "50% 55%" },
      { src: "images/pets/peaches-raincoat.jpg",        caption: "Raincoat on. Puddles, beware ☔" },
      { src: "images/pets/peaches-hospital.jpg",        caption: "At the hospital after eating avocado. Lesson learned 🥑", wall: false },
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
      { src: "images/pets/bojjii-happy.jpg",            caption: "The happiest boy in the whole house (verified) 🎄", focus: "50% 25%" },
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
      { src: "images/pets/lychee-loafing.jpg",          caption: "Draped over the armchair like a famous painting 🛋️" },
      { src: "images/pets/lychee-mafia.jpg",            caption: "Mafia Lychee. Bring treats. Ask no questions 🕶️" },
      { src: "images/pets/lychee-hidden.jpg",           caption: "Hidden Lychee: tote-ally invisible 👜", focus: "50% 20%" },
      { src: "images/pets/lychee-sniff.jpg",            caption: "Sniff. Sniff. SNIFF. Pencil inspection complete ✏️", focus: "50% 50%" },
      { src: "images/pets/lychee-sleepy.jpg",           caption: "Sleepy Lychee, one fluffy cinnamon roll 🌀" },
      { src: "images/pets/lychee-christmas.jpg",        caption: "Dino pajamas, dreaming of the treat cabinet 🦖", focus: "50% 15%" },
      { src: "images/pets/lychee-birthday.jpg",         caption: "Birthday Lychee (Bojjii photobombing in the back) 🎉", focus: "0% 50%" },
      { src: "images/pets/lychee-yvy-boop.jpg",         caption: "Me vs. Lychee: boop incoming 👆", focus: "50% 20%" },
      { src: "images/pets/lychee-yvy-rest.jpg",         caption: "Floor nap with Lychee. Very productive day 💤", focus: "50% 60%" },
      // Penny 🌈 (Chug: Chihuahua × Pug). Forever loved.
      { src: "images/pets/penny-posing.jpg",            caption: "Penny and her red heart tag ❤️", focus: "50% 35%" },
      { src: "images/pets/penny-couch.jpg",             caption: "Ears up, on couch-guarding duty", focus: "50% 25%" },
      { src: "images/pets/penny-profile.jpg",           caption: "Penny's best side (every side was her best side) 💛", focus: "70% 50%" },
      { src: "images/pets/penny-silly.jpg",             caption: "Silly Penny, all tongue and all heart 👅", focus: "50% 35%" },
      { src: "images/pets/penny-silly-face.jpg",        caption: "Those big eyes could get her anything" },
      { src: "images/pets/penny-owl-pillow.jpg",        caption: "Peeking over her owl pillow 🦉", focus: "50% 30%" },
      { src: "images/pets/penny-wedding.jpg",           caption: "Penny in her wedding veil, the prettiest bride 👰", focus: "50% 70%" },
      { src: "images/pets/penny-life-jacket.jpg",       caption: "Life jacket on, tongue out, ready for adventure 🌊", focus: "55% 40%" },
      { src: "images/pets/penny-and-baby.jpg",          caption: "Penny saying hi to her fluffy friend Baby 🤍", focus: "65% 45%" },
      { src: "images/pets/penny-relaxing.jpg",          caption: "Soaking up the sunshine in the garden ☀️", focus: "50% 52%" },
      { src: "images/pets/penny-nap.jpg",               caption: "Curled up for a cozy carpet nap 💤", focus: "60% 50%" },
      { src: "images/pets/penny-sleepy.jpg",            caption: "Sleepy Penny, snuggled in and safe", focus: "35% 50%" },
      { src: "images/pets/penny-pink-collar.jpg",       caption: "Pink collar, sunny day, sweet girl 💗", focus: "40% 25%" },
      { src: "images/pets/penny-begging.jpg",           caption: "How could anyone say no to that face? (I couldn't) 🥺", focus: "50% 25%" },
      { src: "images/pets/penny-yvy-waiting.jpg",       caption: "Me and Penny, waiting for our little one 🤰", focus: "60% 50%" },
      { src: "images/pets/penny-chalk.jpg",             caption: "Her name, written in chalk hearts 💗", focus: "60% 50%" },
      { src: "images/pets/penny-oldie-1.jpg",           caption: "Sweet senior Penny, still looking up at me", focus: "50% 25%" },
      { src: "images/pets/penny-oldie-2.jpg",           caption: "Grey whiskers, same loving eyes", focus: "50% 25%" },
      { src: "images/pets/penny-oldie-3.jpg",           caption: "Our oldie girl, ears up for treats", focus: "50% 25%" },
      { src: "images/pets/penny-last-walks.jpg",        caption: "One of Penny's last walks, in the sunshine 🌳", focus: "50% 60%" },
      { src: "images/pets/penny-last-days.jpg",         caption: "Wrapped up warm in her pink sweater 💗", focus: "50% 45%", wall: false },
      { src: "images/pets/penny-last-day.jpg",          caption: "Holding her close on her last day. Forever loved 🌈", focus: "50% 50%", wall: false },
      // Peaches and the crew
      { src: "images/pets/peaches-bojjii-pancake.jpg",  caption: "Peaches and Bojjii begging for a tiny pancake 🥞", focus: "50% 45%" },
      { src: "images/pets/peaches-bojjii-blur.jpg",     caption: "Evil buahahah face (and blurry Bojjii)", focus: "50% 100%", wall: false },
      { src: "images/pets/peaches-devil-lychee.jpg",    caption: "Evil Peaches 😈 (Lychee is watching)", focus: "100% 30%" },
      { src: "images/pets/peaches-lychee-battle-1.jpg", caption: "Peaches vs. Lychee: round one 🥊", focus: "50% 80%" },
      { src: "images/pets/peaches-lychee-battle-2.jpg", caption: "Round two: Peaches flops, Lychee judges", focus: "50% 50%" },
      { src: "images/pets/peaches-bojjii-pc.jpg",       caption: "Peaches and Bojjii waiting for me to get off the PC (any minute now) ⌛", focus: "45% 50%" },
      { src: "images/pets/bojjii-peaches-easter.jpg",   caption: "Matching Easter fits. Bojjii is thrilled. Peaches is thrilleder 🐰", focus: "100% 50%" },
      { src: "images/pets/lychee-peaches-nonsense.jpg", caption: "Peaches attacks. Lychee files a complaint.", focus: "50% 50%" },
      { src: "images/pets/christmas-crew.jpg",          caption: "Christmas crew: Bojjii, Peaches and a very unbothered Lychee 🎄" },
    ],
    chickens: [     // images/chickens/
      // Riot (buff Polish)
      { src: "images/chickens/riot-and-yvy.jpg",       caption: "Me and Riot (she did her own hair)" },
      { src: "images/chickens/riot-front.jpg",         caption: "Riot can see you. Probably.", focus: "50% 20%" },
      { src: "images/chickens/riot-coop.jpg",          caption: "Riot in front, Beyonce lurking like a spy 🕵️", focus: "50% 20%" },
      { src: "images/chickens/riot-baby-1.jpg",        caption: "Baby Riot, already rocking the hairdo", focus: "25% 45%" },
      { src: "images/chickens/riot-baby-2.jpg",        caption: "Riot, mid glow-up", focus: "30% 40%" },
      // Beyonce (golden laced Polish)
      { src: "images/chickens/beyonce-kale.jpg",       caption: "Beyonce guarding the kale. Nobody touches the kale 🥬", focus: "50% 15%" },
      { src: "images/chickens/beyonce-patrol.jpg",     caption: "Beyonce on patrol. Report suspicious worms 🐛" },
      { src: "images/chickens/beyonce-yard.jpg",       caption: "Beyonce strutting the yard like it's a runway 💅", focus: "50% 38%" },
      { src: "images/chickens/beyonce-cage.jpg",       caption: "Beyonce, unimpressed (as usual)", focus: "30% 30%", wall: false },
      { src: "images/chickens/beyonce-glare.jpg",      caption: "Beyonce's signature glare", focus: "50% 100%", wall: false },
      // Both
      { src: "images/chickens/baby-beyonce-riot.jpg",  caption: "Baby Beyonce and baby Riot, before the attitude kicked in 🐣" },
      { src: "images/chickens/riot-beyonce-table.jpg", caption: "Riot and Beyonce, tabletop edition", focus: "55% 45%" },
      // Snow (white Silkie) 🌈
      { src: "images/chickens/snow-dandelions.jpg",    caption: "Snow, a puffball among puffballs 🌼", focus: "45% 50%" },
      { src: "images/chickens/snow-grass.jpg",         caption: "Snow at golden hour, glowing like a marshmallow", focus: "50% 76%" },
      { src: "images/chickens/snow-closeup.jpg",       caption: "Snow's best side (all of them) 🤍", focus: "55% 40%" },
      { src: "images/chickens/snow-held.jpg",          caption: "Snow, our little cloud 🤍", focus: "38% 40%" },
      { src: "images/chickens/snow-inside.jpg",        caption: "Snow on indoor duty, supervising the couch", focus: "52% 50%" },
      // Chick days and friends
      { src: "images/chickens/brooder-crew.jpg",       caption: "The silkie brooder crew: fluff, fluff and more fluff" },
      { src: "images/chickens/silkie-chick.jpg",       caption: "Tiny silkie fluffball: 90% fuzz, 10% peep", focus: "45% 50%" },
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
    { name: "Bojjii", kind: "Mutt (German Shepherd × Aussie Shepherd, we think)", photo: "images/pets/bojjii-card.jpg",
      fact: "The big sweet boy. Will wear antlers, wigs and party hats for the team (and beg for pancakes)." },
    { name: "Lychee", kind: "Tabby cat", photo: "images/pets/lychee-cucumber.jpg", focus: "70% 50%",
      fact: "Lounges on vegetables, tolerates costumes, and is deeply tired of Peaches' nonsense." },
    { name: "Penny 🌈", kind: "Chug (Chihuahua × Pug)", photo: "images/pets/penny-posing.jpg", focus: "50% 35%",
      fact: "Stuck by my side through my hardest times. Spun in happy circles and hid chocolate under the blankets for her momma, and somehow always knew never to eat it herself. The sweetest, most loving doggo there ever was. Forever loved." },
  ],

  // "This Day in Yvy History". One is picked per calendar day. (SAMPLE: add real ones!)
  history: [
    "Yvy decides every snack tastes better eaten in the garden.",
    "A chicken attempts to join the Garden Society. Membership pending.",
    "Yvy names a zucchini. Regrets nothing.",
    "All the tomatoes ripen at once. Again.",
    "Yvy makes a game instead of weeding. The weeds file a complaint.",
    "The Garden Society finds a worm described as 'basically a noodle'.",
    "A pet sits directly on the keyboard during an important build.",
  ],

  /*
   * GARDEN SOCIETY: journal, project updates and the compost log.
   * Members submit with a passcode; nothing shows until Yvy approves it on society-admin.html.
   * The data lives in a Cloudflare Worker (society-api/). On localhost the site uses the local API.
   */
  society: {
    api: "https://api.yvygrounds.com",
    intro: "Our little gang of gardeners. Members can share journal entries, project progress and compost photos. Yvy reviews every post before it goes up.",
    // Compost temperature guide (UC Master Gardeners, linked under the chart)
    compost: {
      hotLow: 131,   // above this kills most pathogens and weed seeds
      turnAt: 150,   // turn the pile when it gets this hot
      tooHot: 160,   // above this the helpful microbes start dying
      source: {
        label: "UC Master Gardeners: Composting basics",
        url: "https://ucanr.edu/site/uc-master-gardeners-san-luis-obispo-county/composting-basics",
      },
    },
  },

  /*
   * GROWING TIPS: San Diego planting calendar (the "Garden Almanac" section).
   * Each month shows a drop-down per group (vegetables, fruit, flowers). Sources are listed below.
   * Months are numbers: 1 = Jan ... 12 = Dec. Add .5 for "mid-month" (3.5 = from mid-March).
   * A window like [9, 5] wraps around the new year (September through May).
   *   how: "sow"    = seed straight into the ground
   *        "either" = direct sow, or start in trays and transplant
   *        "tray"   = start seeds in trays (dates = seed-starting window); "plant" = when to set the seedlings out
   *        "plant"  = set out transplants, slips or sets (dates = planting-out window)
   *   trayFirst: true = also start seeds in trays ~6–8 weeks before the planting-out window
   *   emoji, or icon: "cauliflower" for a hand-drawn one from js/veg-icons.js when no emoji is accurate
   *   group: "veg" (default), "fruit" or "flower"
   *   note: optional short tip shown next to the name, e.g. "Oct 10 – Nov 1"
   */
  growing: {
    defaultArea: "coastal",   // "coastal" or "inland"
    groups: [
      { key: "veg",    label: "Vegetables", emoji: "🥕" },
      { key: "fruit",  label: "Fruit",      emoji: "🍓" },
      { key: "flower", label: "Flowers",    emoji: "🌷" },
    ],
    sources: [
      { label: "UC Master Gardeners of San Diego County: Vegetable Garden Planting Guide", covers: "vegetables",
        url: "https://ucanr.edu/site/uc-master-gardeners-san-diego-county/article/vegetable-garden-planting-guide-san-diego-county" },
      { label: "UC IPM: When to plant strawberries (South Coast)", covers: "strawberries",
        url: "https://ipm.ucanr.edu/PMG/GARDEN/FRUIT/CULTURAL/strawberrytime.html" },
      { label: "Master Gardeners of San Diego County: Fruit (buy bare-root in January)", covers: "bare-root fruit",
        url: "https://mastergardenerssandiego.org/schools/gardenbook/planting/fruit.html" },
      { label: "Sunset: Southern California garden checklist", covers: "flowers",
        url: "https://sunset.com/garden/garden-basics/so-california-1" },
    ],
    crops: [
      // Warm season (spring & summer)
      { name: "Snap beans",     icon: "green-beans", how: "sow",    coastal: [[3.5, 8]],  inland: [[4, 8.5]] },
      { name: "Lima beans",     icon: "lima-beans", how: "sow",    coastal: [[4.5, 7]],  inland: [[4.5, 7]] },
      { name: "Sweet corn",     emoji: "🌽", how: "sow",    coastal: [[3.5, 7]],  inland: [[4, 7]] },
      { name: "Cucumbers",      emoji: "🥒", how: "either", coastal: [[3.5, 7]],  inland: [[4, 7]] },
      { name: "Summer squash",  icon: "zucchini", how: "either", coastal: [[3.5, 8]],  inland: [[4, 7]] },
      { name: "Winter squash",  emoji: "🎃", how: "either", coastal: [[4, 6]],    inland: [[4, 6]] },
      { name: "Cantaloupe",     emoji: "🍈", how: "either", coastal: [[4, 6]],    inland: [[4, 6]] },
      { name: "Melons",         emoji: "🍈", how: "either", coastal: [[4, 6]],    inland: [[4, 6]] },
      { name: "Watermelon",     emoji: "🍉", how: "either", coastal: [[4, 6]],    inland: [[4, 6]] },
      { name: "Okra",           icon: "okra", how: "sow",    coastal: [[4, 6]],    inland: [[4, 6]] },
      { name: "Tomatoes",       emoji: "🍅", how: "plant",  coastal: [[3, 7]],    inland: [[4, 6]], trayFirst: true },
      { name: "Peppers",        emoji: "🫑", how: "plant",  coastal: [[4, 7]],    inland: [[4, 6]], trayFirst: true },
      { name: "Eggplant",       emoji: "🍆", how: "plant",  coastal: [[4, 6]],    inland: [[4, 6]], trayFirst: true },
      { name: "Sweet potato slips", emoji: "🍠", how: "plant", coastal: [[4, 6]], inland: [[5, 6]] },
      // Cool season (fall & winter)
      { name: "Beets",          icon: "beet", how: "sow",    coastal: [[9, 5]],    inland: [[9, 4.5]] },
      { name: "Carrots",        emoji: "🥕", how: "sow",    coastal: [[9, 4]],    inland: [[9, 3]] },
      { name: "Radishes",       icon: "radish", how: "sow",    coastal: [[9, 5]],    inland: [[9, 3]] },
      { name: "Turnips",        icon: "turnip", how: "sow",    coastal: [[9, 5]],    inland: [[9.5, 4]] },
      { name: "Peas",           emoji: "🫛", how: "sow",    coastal: [[9, 3]],    inland: [[1, 3]] },
      { name: "Spinach",        icon: "spinach", how: "sow",    coastal: [[9, 4]],    inland: [[9, 3]] },
      { name: "Green onions",   icon: "scallions", how: "sow",    coastal: [[9, 5]],    inland: [[9, 4]] },
      { name: "Seed potatoes",  emoji: "🥔", how: "sow",    coastal: [[2, 3], [8.5, 9]], inland: [[2.5, 4], [8.5, 9]] },
      { name: "Leaf lettuce",   emoji: "🥬", how: "either", coastal: [[9, 4]],    inland: [[9, 3]] },
      { name: "Head lettuce",   icon: "head-lettuce", how: "either", coastal: [[9, 3]],    inland: [[9, 2]] },
      { name: "Chard",          icon: "chard", how: "either", coastal: [[9, 6]],    inland: [[9, 4]] },
      { name: "Kale",           icon: "kale", how: "either", coastal: [[9, 4]],    inland: [[9, 4]] },
      { name: "Endive",         icon: "endive", how: "either", coastal: [[9, 5]],    inland: [[9, 4]] },
      { name: "Kohlrabi",       icon: "kohlrabi", how: "either", coastal: [[9, 3]],    inland: [[9, 3]] },
      { name: "Broccoli",       emoji: "🥦", how: "tray",   coastal: [[8, 12]],   inland: [[8, 10]],
        plant: { coastal: [[9, 2]], inland: [[9, 2]] } },
      { name: "Cabbage",        icon: "cabbage", how: "tray",   coastal: [[8, 12]],   inland: [[8, 10]],
        plant: { coastal: [[9, 2]], inland: [[9, 2]] } },
      { name: "Cauliflower",    icon: "cauliflower", how: "tray",   coastal: [[8, 12]],   inland: [[8, 10]],
        plant: { coastal: [[9, 2]], inland: [[9, 2]] } },
      { name: "Bulb onions (short-day)",  emoji: "🧅", how: "plant", coastal: [[10, 12]], inland: [[10.5, 12]] },
      { name: "Bulb onions (medium-day)", emoji: "🧅", how: "plant", coastal: [[1, 2]],   inland: [[1, 2]] },

      // Fruit
      { group: "fruit", name: "Strawberries", emoji: "🍓", how: "plant", note: "Oct 10 – Nov 1",
        coastal: [[10, 10]], inland: [[10, 10]] },
      { group: "fruit", name: "Bare-root fruit trees", icon: "fruit-tree", how: "plant", note: "pick low-chill types",
        coastal: [[1, 2]], inland: [[1, 2]] },
      { group: "fruit", name: "Raspberries & blackberries", icon: "raspberry", how: "plant", note: "bare-root canes",
        coastal: [[1, 2]], inland: [[1, 2]] },
      { group: "fruit", name: "Blueberries", emoji: "🫐", how: "plant", note: "low-chill types",
        coastal: [[1, 2]], inland: [[1, 2]] },
      { group: "fruit", name: "Grapevines", emoji: "🍇", how: "plant", note: "bare-root",
        coastal: [[1, 2]], inland: [[1, 2]] },
      { group: "fruit", name: "Citrus", emoji: "🍋", how: "plant", note: "after frost risk passes",
        coastal: [[3, 5]], inland: [[3.5, 5]] },
      { group: "fruit", name: "Avocado", emoji: "🥑", how: "plant", note: "after frost risk passes",
        coastal: [[3, 4]], inland: [[3.5, 4]] },

      // Flowers
      { group: "flower", name: "Sweet peas", icon: "sweet-pea", how: "sow", note: "flowers only, not edible",
        coastal: [[9, 11]], inland: [[9, 11]] },
      { group: "flower", name: "California poppies", icon: "poppy", how: "sow", note: "sow before the rains",
        coastal: [[10, 12]], inland: [[10, 12]] },
      { group: "flower", name: "Wildflower mix", emoji: "🌼", how: "sow", note: "sow before the rains",
        coastal: [[10, 12]], inland: [[10, 12]] },
      { group: "flower", name: "Ranunculus & anemones", icon: "ranunculus", how: "plant", note: "corms, claws down",
        coastal: [[10, 12]], inland: [[10, 12]] },
      { group: "flower", name: "Pansies & violas", icon: "pansy", how: "plant", coastal: [[10, 12]], inland: [[10, 12]] },
      { group: "flower", name: "Snapdragons & stock", icon: "snapdragon", how: "plant", coastal: [[10, 12]], inland: [[10, 12]] },
      { group: "flower", name: "Calendula", icon: "calendula", how: "either", coastal: [[9, 11]], inland: [[9, 11]] },
      { group: "flower", name: "Sunflowers", emoji: "🌻", how: "sow", coastal: [[4, 6]], inland: [[4, 6]] },
      { group: "flower", name: "Zinnias", icon: "zinnia", how: "sow", coastal: [[4, 6]], inland: [[4, 6]] },
      { group: "flower", name: "Cosmos", icon: "cosmos", how: "sow", coastal: [[4, 6]], inland: [[4, 6]] },
      { group: "flower", name: "Marigolds", icon: "marigold", how: "either", coastal: [[4, 6]], inland: [[4, 6]] },
    ],
  },
};
