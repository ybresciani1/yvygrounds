/*
 * ✿ YvyGrounds content file ✿
 * Almost everything you'll want to change lives here: games, photos,
 * chickens, pets, and the silly text bits. Save and refresh the page.
 *
 * Anything marked SAMPLE is placeholder content. Swap it for the real thing.
 */
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
  email: "",               // e.g. "hello@yvygrounds.com"
  links: [
    // SAMPLE: uncomment and edit the ones you use
    // { label: "itch.io", url: "https://ybresciani.itch.io" },
    // { label: "GitHub",  url: "https://github.com/ybresciani" },
  ],

  // The "About Yvy" letter. Each string is one paragraph. (SAMPLE: make it yours.)
  about: [
    "I'm Yvy (you'll find me as ybresciani around the internet). I make games: cozy gardening games, and also some very silly ones.",
    "When I'm not making games, I'm out in the garden with my garden students and the garden club, or hanging out with the pets and our chickens.",
    "This is where all my games live. Hope you find one you like!",
  ],

  /*
   * GAMES
   *  type:     "garden" or "silly"
   *  url:      link to play it (itch.io, GitHub Pages, etc.). "" shows "coming soon".
   *  thumb:    optional image, e.g. "images/games/tomato.png". "" uses a pixel icon.
   *  date:     "YYYY-MM-DD", newest show first. Games from the last 45 days get a NEW! tag.
   *  featured: true puts it on the Game of the Week TV (first one wins).
   */
  games: [
    // SAMPLE games, replace with your real ones
    { title: "Tomato Tussle", type: "garden", url: "", thumb: "", date: "2026-10-01", featured: true,
      blurb: "Defend your tomato patch from extremely polite hornworms." },
    { title: "Chicken Chaos Kitchen", type: "silly", url: "", thumb: "", date: "2026-09-12",
      blurb: "Eight chickens. One kitchen. Zero plan." },
    { title: "Sprout Sprint", type: "garden", url: "", thumb: "", date: "2026-08-20",
      blurb: "Water every seed before sundown. Easier said than grown." },
    { title: "Bean There, Done That", type: "silly", url: "", thumb: "", date: "2026-07-04",
      blurb: "A pun-powered platformer about a bean on a gap year." },
    { title: "Compost Critters", type: "garden", url: "", thumb: "", date: "2026-05-18",
      blurb: "Feed the worms, build the soil, earn mysterious worm medals." },
    { title: "Pet Rock Simulator 2000", type: "silly", url: "", thumb: "", date: "2026-03-01",
      blurb: "It doesn't do anything. It's perfect." },
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
    me:       [],   // images/me/        (the first one becomes the "click my head" photo)
    club:     [],   // images/club/      garden club
    students: [],   // images/students/  garden students
    pets:     [],   // images/pets/
    chickens: [],   // images/chickens/
  },

  // CHICKENS (SAMPLE placeholders). photo is optional.
  flock: [
    { name: "Mystery Hen",     breed: "Breed TBA",  fact: "Has not yet agreed to a photoshoot.", photo: "" },
    { name: "Secret Chicken",  breed: "Breed TBA",  fact: "Rumored to be the boss of the coop.", photo: "" },
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
