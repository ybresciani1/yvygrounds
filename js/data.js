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

  // Pixel emoji: every emoji on the page gets a blocky pixel-art look (js/pixel-emoji.js),
  // except in the Garden Almanac. false = normal emoji everywhere.
  pixelEmoji: true,

  // "Currently…" AIM-style away message on the welcome card. Update whenever!
  // Each line: [label, emoji, text]. Remove a line to hide it. updated: "YYYY-MM-DD".
  currently: {
    away: "brb, out in the garden 🌱",
    updated: "2026-10-20",
    lines: [
      ["growing", "🥬", "kale, radishes & sweet peas"],
      ["playing", "🎮", "my own games (for “testing”)"],     // SAMPLE: what are you playing?
      ["Riot's mood", "🐔", "chaotic"],
      ["learning", "🤸", "handstands (still one hiccup long)"],
    ],
  },

  // MUSIC PLAYER in Yvy's Extras (js/extras.js → buildMusic). The tracks stream from each game's own
  // site, so nothing here adds to this site's size. Plays in this order and loops back to the top.
  music: [
    { game: "Rabbit & Frog: Gardenbound", title: "Seed Quest Theme", src: "https://seed-game-pi.vercel.app/music/theme.mp3" },
    { game: "Rabbit & Frog: Gardenbound", title: "Seed Quest Activities", src: "https://seed-game-pi.vercel.app/music/activities.mp3" },
    { game: "Rabbit & Frog: Gardenbound", title: "Sailing", src: "https://seed-game-pi.vercel.app/music/sailing.mp3" },
    { game: "Rabbit & Frog: Gardenbound", title: "Rot & Roll Theme", src: "https://seed-game-pi.vercel.app/music/rot-theme.mp3" },
    { game: "Rabbit & Frog: Gardenbound", title: "Rot & Roll Activities", src: "https://seed-game-pi.vercel.app/music/rot-activities.mp3" },
    { game: "Rabbit & Frog: Gardenbound", title: "Blossom Theme", src: "https://seed-game-pi.vercel.app/music/blossom-theme.mp3" },
    { game: "Rabbit & Frog: Gardenbound", title: "Blossom Activities", src: "https://seed-game-pi.vercel.app/music/blossom-activities.mp3" },
    { game: "Rabbit & Frog: Gardenbound", title: "Rotation Nation Theme", src: "https://seed-game-pi.vercel.app/music/rotation-theme.mp3" },
    { game: "Rabbit & Frog: Gardenbound", title: "Rotation Nation Activities", src: "https://seed-game-pi.vercel.app/music/rotation-activities.mp3" },
    { game: "Rabbit & Frog: Gardenbound", title: "Spooky Theme", src: "https://seed-game-pi.vercel.app/music/spooky-theme.mp3" },
    { game: "Rabbit & Frog: Gardenbound", title: "Spooky Activities", src: "https://seed-game-pi.vercel.app/music/spooky-activities.mp3" },
    { game: "Master Composter Quest", title: "Intro Anxiety", src: "https://master-composter.vercel.app/assets/Intro%20anxiety.mp3" },
    { game: "Master Composter Quest", title: "Background Music", src: "https://master-composter.vercel.app/assets/nastelbom-background-music-486996.mp3" },
    { game: "Master Composter Quest", title: "Spooky Theme 1", src: "https://master-composter.vercel.app/assets/Spooky%20Theme%201.mp3" },
    { game: "Tijuana Estuary Explorer", title: "Theme Music", src: "https://tijuana-estuary-game.vercel.app/Sound/Theme%20Music.mp3" },
    { game: "Tijuana Estuary Explorer", title: "Battle Music 1", src: "https://tijuana-estuary-game.vercel.app/Sound/Battle/Battle%20Music/Battle%20Music%201.mp3" },
    { game: "Tijuana Estuary Explorer", title: "Battle Music 2", src: "https://tijuana-estuary-game.vercel.app/Sound/Battle/Battle%20Music/Battle%20Music%202.mp3" },
  ],

  // Arcade leaderboards shown in the portal's "High Scores" box (scores live in the API).
  // game = the arcade folder name; low: true means the fastest time wins (scores are in ms).
  arcadeScores: [
    { game: "tomato-tussle", title: "Tomato Tussle", unit: "pts" },
    { game: "bowl-brawl", title: "Bowl Brawl", low: true, unit: "s" },
    { game: "street-fluffers", title: "Street Fluffers", unit: "pts" },
  ],

  // Rabbit & Frog hall of fame: students who finished the game. Yvy adds students (and photos,
  // only with a parent's OK) on society-admin.html → Hall of Fame. First name + last initial only.
  hallOfFame: {
    game: "Rabbit & Frog: Gardenbound",
    intro: "These garden heroes finished Rabbit & Frog: Gardenbound and earned their very own 3D Rabbit & Frog sculpture and a garden starter kit!",
    empty: "The first Gardenbound graduates are on their way. Could you be next?",
    // The certificate players earn, shown under the intro (click opens it full size)
    certificate: {
      src: "images/hall/certificate-sample.jpg",
      alt: "Sample Rabbit & Frog: Gardenbound Certificate of Completion for “Silly Goose”, with six island badges and the line “Present this certificate to Miss Yvy to earn a reward!”",
      caption: "Finish the game, print your certificate, and bring it to Miss Yvy!",
    },
  },

  // Seasonal decorations: things gently falling in the background, plus a ticker line.
  // Months are 1–12. Add ?season=winter (or spring, summer, fall, spooky) to the address to preview one.
  seasons: [
    { key: "winter", months: [12, 1, 2], fall: ["❄", "❅", "❆"], ticker: "❄️ Snow season at YvyGrounds. Bundle up, bawk!" },
    { key: "spring", months: [3, 4, 5], fall: ["🌸", "🌼", "✿", "🌷"], ticker: "🌸 Spring planting season! Get those seeds in" },
    { key: "summer", months: [6, 7, 8], fall: ["✨", "🫧", "🌻"], ticker: "☀️ Summer in the garden: water early, water deep" },
    { key: "spooky", months: [10], fromDay: 15, fall: ["🍂", "🎃", "🍁", "🦇"], ticker: "🎃 Spooky season! The chickens are dressing up as chickens" },
    { key: "fall", months: [9, 10, 11], fall: ["🍂", "🍁", "🍂"], ticker: "🍂 Fall at YvyGrounds: cool-season crops are going in" },
  ],

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
   * RÉSUMÉ: shown two ways from this one list.
   *   - the RPG character sheet on the main page (section #resume, js/portfolio.js)
   *   - the plain printable page, resume.html ("📄 boring printable version"; js/resume-page.js)
   * This is a public page: no phone number, and no names of private families.
   * RPG-only bits (class, bars, stats, quest names, item emoji) don't show on the printable page.
   */
  resume: {
    name: "Yvanna “Yvy” Bresciani",
    headline: "Environmental & Outdoor Educator | Curriculum Developer | Educational Program Leader",
    location: "San Diego, CA",
    site: "yvygrounds.com",
    startYear: 2009,   // first year working with kids; the RPG level is years since then
    summary: "Bilingual educator and program leader with 15+ years of experience in early childhood development, inquiry-based learning, and experiential education. Specializing in Reggio Emilia-inspired, Montessori, and Forest School pedagogies, with expertise in outdoor classroom development, environmental stewardship, curriculum design, and community engagement. Experienced in mentoring educators, coordinating volunteers, developing educational partnerships, and securing $10,000+ annually in grant funding. Passionate about creating inclusive, child-centered learning environments that foster curiosity, ecological literacy, creativity, and meaningful connections with the natural world.",

    // RPG sheet only
    rpg: {
      // Character portrait (cropped at the collar). Leave out to use the first photo of Yvy.
      // wide: true for a 4:3 picture (fills the card); otherwise it's a small square.
      portrait: { src: "images/me/witch.jpg", wide: true, alt: "Yvy as a garden witch in a flowered purple hat, casting glowing green vine magic" },
      cls: "Garden Educator",
      subclass: "Game Maker",
      alignment: "Chaotic Good (with chickens)",
      bars: [   // value out of max
        { label: "HP", name: "Patience with 3-year-olds", value: 99, max: 99, color: "#ff6fa8" },
        { label: "MP", name: "Mud Power", value: 87, max: 99, color: "#5aa8f0" },
      ],
      stats: [  // out of 20. Tweak these, they're for fun!
        { emoji: "🌱", name: "Gardening", value: 19 },
        { emoji: "🧒", name: "Kid Wrangling", value: 20 },
        { emoji: "📚", name: "Curriculum Design", value: 18 },
        { emoji: "🗣️", name: "Bilingual (EN/ES)", value: 18 },
        { emoji: "🤝", name: "Mentoring Teachers", value: 17 },
        { emoji: "💰", name: "Grant Hunting", value: 16 },
        { emoji: "🎮", name: "Game Making", value: 14 },
        { emoji: "🐔", name: "Chicken Diplomacy", value: 20 },
        { emoji: "🤸", name: "Handstand", value: 3 },
      ],
    },

    // "Core competencies" (printable) = the INVENTORY (RPG sheet)
    skills: [
      { emoji: "🌳", name: "Outdoor & Environmental Education" },
      { emoji: "🎨", name: "Reggio Emilia, Montessori & Forest School Pedagogies" },
      { emoji: "🔍", name: "Inquiry-Based & Emergent Curriculum Development" },
      { emoji: "🧑‍🏫", name: "Educational Leadership & Teacher Mentorship" },
      { emoji: "💰", name: "Grant Funding & Community Partnerships" },
      { emoji: "🗣️", name: "Bilingual Education (English/Spanish)" },
      { emoji: "🌻", name: "Garden Program Development & Sustainability" },
      { emoji: "🙋", name: "Volunteer Coordination & Community Engagement" },
      { emoji: "💛", name: "Early Childhood Development & Social-Emotional Learning" },
      { emoji: "📸", name: "Educational Documentation & Family Communication" },
      { emoji: "🕹️", name: "Educational Game Design (web games)" },
    ],

    // PROFESSIONAL EXPERIENCE = the QUEST LOG. current: true marks an active quest.
    // section: "childcare" files it under "Professional Nanny & Childcare Experience" on the printable page.
    jobs: [
      { quest: "Grow a School Garden (in Two Languages)", current: true,
        role: "Garden Educator & Outdoor Education Specialist", org: "Longfellow Spanish Immersion School",
        place: "San Diego, CA", dates: "08/2025 – Present", ages: "UTK–8th Grade",
        points: [
          "Designed and facilitated inquiry-based garden curriculum integrating environmental science, sustainability, food systems, and ecological exploration for students from UTK through 8th grade.",
          "Integrated bilingual English/Spanish learning opportunities and culturally responsive teaching practices into hands-on environmental education.",
          "Secured $10,000 annually in grant funding through external partnerships, including SAGE, to support garden education and long-term program sustainability.",
          "Led school garden operations, including seasonal planning, planting, composting, irrigation, harvesting, and habitat development.",
          "Organized campus-wide cleanup and beautification initiatives, coordinating students, families, and community volunteers to strengthen environmental stewardship.",
          "Collaborated with teachers, administrators, and community organizations to develop interdisciplinary outdoor learning experiences and expand program resources.",
        ] },
      { quest: "The Mud Kitchen Saga", current: true,
        role: "Educator, Garden Educator & Outdoor Specialist / Outdoor Pedagogical Team Lead", org: "Dot to Dot Academy",
        place: "Carmel Valley, CA", dates: "08/2024 – Present",
        points: [
          "Designed and implemented Reggio Emilia-inspired curriculum rooted in inquiry, sensory exploration, loose parts play, and children's emerging interests.",
          "Led the development of outdoor learning environments, supporting educators in using natural spaces as intentional extensions of the classroom.",
          "Mentored teaching teams in reflective practice, pedagogical documentation, collaborative curriculum development, and child-centered educational approaches.",
          "Established a certified Monarch Fellowship Garden & Pollinator Hub, cultivating and distributing native milkweed and nectar plants while engaging children in habitat conservation and ecological stewardship.",
          "Designed a collaborative mud kitchen and facilitated long-term light, shadow, and natural-material investigations to promote creativity, scientific thinking, and social development.",
          "Led food and art atelier experiences integrating nutrition, cultural food traditions, process-based art, and sustainable materials.",
        ] },
      { quest: "Enter the VR Dimension",
        role: "Youth Interaction Designer", org: "Notion Theory",
        place: "", dates: "01/2025 – 06/2025",
        points: [
          "Contributed child-development expertise to the design of age-appropriate, engaging, and developmentally responsive virtual reality experiences.",
          "Supported child-centered user experience research, including usability, cognitive development, emotional engagement, and accessibility considerations.",
          "Advised on ethical design practices, digital safety, screen-time management, and positive social interactions in immersive environments.",
        ] },
      { quest: "Guide of the Tiny Explorers",
        role: "Montessori Lead Guide / Substitute Educator", org: "Encinitas Country Day School",
        place: "Encinitas, CA", dates: "12/2020 – 10/2021",
        points: [
          "Developed and implemented Montessori- and Reggio-inspired learning experiences for children ages 2–6, supporting independence, exploration, and holistic development.",
          "Mentored and coordinated teaching staff while supporting classroom operations and after-school programming.",
          "Strengthened family engagement through developmental documentation, digital portfolios, newsletters, and ongoing communication.",
        ] },
      { quest: "The Forest School Path",
        role: "Lead Teacher & Co-Teacher", org: "The Native School / Our Piccola Accademia",
        place: "Carlsbad, CA", dates: "06/2019 – 12/2020",
        points: [
          "Led indoor and outdoor educational programming rooted in Reggio Emilia, Forest School, and child-centered learning philosophies.",
          "Designed experiential curriculum incorporating nature exploration, children's yoga, creative expression, and social-emotional development.",
          "Mentored educators, coordinated school events, and maintained communication between families, teaching teams, and school leadership.",
        ] },
      { quest: "First Classroom",
        role: "Teacher / Floater / Substitute Educator", org: "Saint David's Preschool",
        place: "San Diego, CA", dates: "06/2017 – 06/2019",
        points: [
          "Facilitated Reggio Emilia-inspired learning experiences supporting children's cognitive, social, emotional, and creative development.",
          "Developed classroom curriculum, documented learning progress, and collaborated with educators and families to support individual developmental needs.",
        ] },
      { quest: "15 Years of Tiny Bosses", section: "childcare",
        role: "Professional Nanny, Household Manager & Child Development Specialist", org: "Private Families & Accredited Respite Care",
        place: "California & Colorado", dates: "2009 – 2024",
        points: [
          "Provided individualized care and developmentally responsive learning experiences for infants through school-age children, including children with disabilities and additional support needs.",
          "Integrated Montessori, RIE, Reggio Emilia, and nature-based approaches into daily routines, practical life experiences, and child-led learning.",
          "Led multi-family nanny shares for up to three infants and toddlers, introducing Spanish language exposure and Baby ASL.",
          "Collaborated with families and speech, occupational, and physical therapy providers to support developmental goals, communication, social-emotional growth, and individualized care.",
          "Managed household schedules, coordinated care arrangements, and maintained detailed developmental documentation and family communication.",
        ] },
    ],

    // SELECTED PROJECTS & COMMUNITY LEADERSHIP = ACHIEVEMENTS (RPG sheet)
    projects: [
      { emoji: "🦋", name: "Monarch Fellowship Garden & Pollinator Hub", text: "Established a certified community habitat supporting native plants, pollinator conservation, and experiential ecological education." },
      { emoji: "💰", name: "School Garden Funding & Development", text: "Secured $10,000+ annually through external partnerships, including SAGE, to sustain garden-based education and environmental programming." },
      { emoji: "🧹", name: "Campus Cleanup & Beautification Leadership", text: "Organized collaborative stewardship initiatives engaging students, families, and volunteers in improving shared school environments." },
      { emoji: "🎮", name: "Educational Game Development", text: "Created Master Composter Quest, Tijuana Estuary Explorer, and Rabbit & Frog: Gardenbound, combining environmental themes with interactive educational experiences.", link: "#games" },
      { emoji: "🎪", name: "Community Event Leadership", text: "Planned and coordinated large-scale community events with up to 14,000 attendees, including volunteer management, logistics, vendor coordination, and outreach." },
      { emoji: "🏆", name: "PETA Star Street Teamer of the Year", text: "Award recipient for volunteer outreach.", recognition: true },
      { emoji: "🥾", name: "Founder of Baby Back Hikes (2016)", text: "Supporting family engagement with outdoor experiences.", recognition: true },
    ],

    // EDUCATION + CERTIFICATIONS = TRAINING (RPG sheet)
    education: [
      { school: "San Diego Miramar College", points: ["Associate Teacher Certificate (High Honors)", "43 Early Childhood Development units", "Family Home Daycare Training Certificate", "GPA: 3.9"] },
      { school: "Cornell University", points: ["Nanny Certification, 2023"] },
    ],
    certifications: [
      { area: "Child Development & Educational Pedagogy", text: "RIE Educaring and Nanny Nurture training; Reggio Emilia, Montessori, Forest School, and ECERS-3 professional training." },
      { area: "Outdoor Education & Wellness", text: "Take Me Outside training; Children's Yoga Certification (Yoga Ed); Stanford University Child Nutrition and Cooking." },
      { area: "Health, Safety & Specialized Care", text: "Pediatric CPR/AED and First Aid training; TrustLine certification; Safe Sleep Ambassador training; newborn care and postpartum doula training." },
    ],
    languages: [
      { name: "English", level: "Fluent" },
      { name: "Spanish", level: "Fluent" },
      { name: "Baby ASL", level: "Experienced" },
    ],
  },

  /*
   * HIRE ME / COMMISSION ME: the shop counter (section #shop).
   * "Ask at the counter" opens the same "Write to me" email picker.
   * Each item's "Ask me!" tag opens it too, with a fill-in letter already started:
   * letter.hello + letter.intro, the aboutUs blanks, the item's ask blanks + letter.always,
   * then letter.end and letter.thanks. "Ask at the counter" uses counter the same way.
   */
  shop: {
    keeper: "Yvy",
    greeting: "Welcome to Yvy's Garden & Game Shop! Everything here is made to order. Have a look around, then come chat with me at the counter!",
    items: [
      { emoji: "🌱", name: "Garden Workshops", tag: "schools · camps · clubs",
        blurb: "Hands-on garden lessons on seeds, soil, compost and pollinators, for any age from UTK up. In English or Español.",
        ask: { title: "The workshop", lines: [
          "Ages or grades:",
          "About how many kids:",
          "Topics we're curious about (seeds, soil, compost, pollinators, something else?):",
          "English, Español, or both:",
          "One visit or a series?",
          "Dates or times that work:",
          "Do you have a garden space yet? (yes / no / sort of):",
        ] } },
      { emoji: "🏡", name: "Outdoor Classroom Design", tag: "schools · preschools",
        blurb: "Turn a yard, courtyard or school garden into a living classroom: mud kitchens, loose parts, pollinator gardens and habitat spaces.",
        ask: { title: "The space", lines: [
          "What space do you have (yard, courtyard, rooftop, school garden...)?",
          "About how big is it:",
          "What you'd love to see there (mud kitchen, loose parts, pollinator garden, habitat...):",
          "Ages who'll use it:",
          "When you'd like it ready:",
        ] } },
      { emoji: "📚", name: "Curriculum Design", tag: "UTK–8th grade",
        blurb: "Inquiry-based garden and environmental curriculum inspired by Reggio Emilia, Montessori and Forest School.",
        ask: { title: "The curriculum", lines: [
          "Grades:",
          "Topics or standards you need to cover:",
          "How often you'll teach it (weekly, a unit, all year?):",
          "Indoors, outdoors, or both:",
          "English, Español, or both:",
          "When you'd need it by:",
        ] } },
      { emoji: "🤝", name: "Teacher Mentoring", tag: "teaching teams",
        blurb: "Coaching on outdoor learning, documentation and child-led projects, so your team feels at home teaching outside.",
        ask: { title: "The mentoring", lines: [
          "How many teachers on your team:",
          "Ages they teach:",
          "What you'd like help with (outdoor learning, documentation, child-led projects...):",
          "In person, online, or both:",
          "How often (one session, monthly, all year?):",
        ] } },
      { emoji: "🎮", name: "Custom Mini-Games", tag: "classrooms · events",
        blurb: "A little browser game for your class, garden program or event, bilingual if you like. Just like the ones in my portal!",
        ask: { title: "The game", lines: [
          "What the game is for (a class, a garden program, an event?):",
          "Who's playing, and what ages:",
          "What it should be about or teach:",
          "English, Español, or both:",
          "When you need it by:",
          "Any favorite games it should feel like:",
        ] } },
      { emoji: "🧸", name: "Kid-Centered Design Help", tag: "apps · games · VR",
        blurb: "Child development know-how for your product: age-appropriate UX, playtesting with kids, safety and healthy screen time.",
        ask: { title: "The project", lines: [
          "What you're building (app, game, VR, something else?):",
          "Ages it's for:",
          "What you'd like help with (age-appropriate UX, playtesting with kids, safety, screen time...):",
          "Where you are in the project (idea, prototype, launched?):",
          "Timeline:",
        ] } },
    ],
    // "Ask at the counter": for anything that isn't on the shelf
    counter: { emoji: "✉", name: "something that isn't on the shelf", subject: "A request for Yvy",
      ask: { title: "The idea", lines: [
        "What you have in mind (weird requests welcome!):",
        "Who it's for, and what ages:",
        "When you'd need it:",
      ] } },
    // The started letter. {item} is the item's name. No phone line: people can add one if they like.
    letter: {
      subject: "{item} question",
      hello: "Hi Yvy!",
      intro: "I found your Garden & Game Shop on YvyGrounds and I'd love to ask about {item}.",
      aboutUs: ["My name:", "School / camp / club / company:", "City or area:"],
      always: ["Rough budget:"],   // asked in every letter, after the item's own blanks
      end: "Anything else you should know:",
      thanks: "Thank you!",
    },
    price: "Ask me!",   // price tag on every item
    closing: "Don't see what you need? Ask anyway! I love a weird request.",
    // Pay / tip jar. venmo: your Venmo username without the @ ("" hides the button).
    // zelle: true shows a "Copy my Zelle email" button (uses the email address above).
    venmo: "YBresciani",
    zelle: true,
    payNote: "Already booked? Pay here. Or just tip the chickens 🐔",
  },

  /*
   * GUESTBOOK (section #guestbook): visitors sign it (first name only), and nothing shows
   * until Yvy approves it on society-admin.html → Guestbook. Signed entries live in the API.
   * kindWords are testimonials Yvy adds by hand (excerpts from reference letters), with a ★ ribbon.
   * The guestbook shows everything newest first (kind words and signatures mixed, by date),
   * so new ones can go anywhere in the list.
   * Initials + a role only: no last names, phone numbers, emails, kids' names, schools or health details.
   * date: "YYYY-MM-DD", or "YYYY-MM" / "YYYY" when the letter has no exact date.
   * Click an entry to see it as a pixel-art card (js/portfolio.js → CARD_STYLES):
   *   card: letter, review, comment, index, holiday, newsletter, texts, flowers, thanks,
   *         christmas, notecard, tag or doodle   (signed visitor entries use "guest")
   *   hello: the greeting at the top, closing: the sign-off ("Love,"). The card signs with name + role.
   */
  guestbook: {
    intro: "Sign my guestbook! Leave a hello, a game review, or a kind word. I read every entry before it goes up ♥",
    roles: ["Visitor", "Game player", "Parent", "Student", "Garden Society member", "Teacher / coworker", "Collaborator"],
    avatars: ["chicken", "flower", "heart", "sprout", "tomato", "silly", "bowl", "mystery"],   // pixel sprites from js/pixels.js
    kindWords: [
      // Pattern: { name: "A.B.", role: "Teacher", avatar: "flower", date: "2026-10-01", text: "..." },
      // Undated letter; "this year" in it is 2012 (the Zombie Walk's 5th year, after 2011)
      { name: "M.K.", card: "letter", hello: "To all employers and academic institutions,", closing: "Best of luck in your future partnership,", role: "Volunteer coordinator", avatar: "mystery", date: "2012",
        text: "For the last 5 years, we have held an event called the Long Beach Zombie Walk. … In all, we had over 14,000 people come to our event. … With virtually little experience in volunteer management, Ms. Bresciani managed, with no oversight, over 35 volunteers. … Yvanna's professionalism, intuitive management skills, and astounding leadership abilities were crucial to our success. … She's a natural leader, a team-player, and an innovative thinker." },
      { name: "P.M.", card: "letter", hello: "To whom it may concern:", closing: "Sincerely,", role: "Parent", avatar: "heart", date: "2015-12-03",
        text: "She was wonderful with both of my boys. … When interacting with both of my boys, they always were very excited about different activities she had planned. She was very patient, sweet, and creative, and always found a way to multitask efficiently throughout her time with us. … I cannot recommend Yvanna enough." },
      { name: "J.R.", card: "review", role: "Dad (Care.com review)", avatar: "sprout", date: "2016-05-17",
        text: "Yvanna was a spectacular addition to our family! … Yvanna took initiative in her work: setting up a binder with information about family events around the city, feedback from each day of care, and other helpful information. We absolutely loved her and would recommend her services to anyone lucky enough to have her!" },
      { name: "J.E.", card: "letter", hello: "To whomsoever it may concern,", closing: "Sincerely,", role: "Neighbor & friend", avatar: "chicken", date: "2016-07-17",
        text: "Yvanna Bresciani is one of the most disciplined and punctual people I've ever known. Her ability to work efficiently under stressful conditions and nerve-wrecking deadlines speaks volumes about her hard work, determination and her composed demeanor. … Yvanna is a compassionate and hardworking individual with perseverance and ambition." },
      { name: "M.S.", card: "letter", hello: "To whom it may concern,", closing: "Please let me know if you have further questions,", role: "Parent Education instructor", avatar: "flower", date: "2016-07-28",
        text: "Yvanna did a great job helping and playing with the children, selecting age appropriate toys and understanding the basic needs of children this age. … She has incredible patience with children and looks at ease around them. … I think she would make a valued teacher and caregiver of any children in her care." },
      { name: "K.R.", card: "letter", hello: "To Whom It May Concern,", closing: "Sincerely,", role: "Mom", avatar: "tomato", date: "2016-11-07",
        text: "In the time Yvanna has been with us, she became a beloved part of our lives. … Even our neighbors frequently commented to me on how consistently loving, patient, and kind Yvanna was with both children. … She is a great multi-tasker and very creative." },
      { name: "V.J.", card: "letter", hello: "To Whom This May Concern:", closing: "Best,", role: "Parent", avatar: "heart", date: "2016-11-08",
        text: "Yvanna is a very reliable person, we are very blessed to have her supporting our family. She is consistent, flexible, loving, nurturing, and very responsible. … When I arrive home my youngest daughter is always sad to see Yvanna leave, one strong indicator that she is connected and bonded to my kids." },
      { name: "L.M.", card: "letter", hello: "To whom it may concern,", closing: "Sincerely,", role: "Parent (Montessori classroom)", avatar: "sprout", date: "2021-10-02",
        text: "Yvanna was the Montessori guide for both my son and daughter in their toddler class. She was able to build trust with them in a very short period of time and spark their interest while keeping to the curriculum. … Miss Yvanna's focus on social-emotional learning really paid off. … It clearly worked because both of my children flourished while in her classroom." },
      { name: "H.M.", card: "letter", closing: "Sincerely,", role: "Parent", avatar: "flower", date: "2022-09-22",
        text: "It was an absolute privilege to have Yvanna as our nanny. She is reliable, loving, communicative, and dedicated to children's growth and development. … Yvanna was thoughtful in organizing activities and spaces that helped my daughter hit her developmental milestones in a way that was safe and creative. … Her warm energy is contagious." },
      { name: "S.L. & S.S.", card: "letter", hello: "Dear Family,", closing: "Sincerely,", role: "Parents", avatar: "silly", date: "2023-03-21",
        text: "Her creativity knows no bounds as she regularly provides our son with engaging and fun activities such as art projects, games, singing, dancing, and yoga. Our son has always been excited to spend time with her and has never been bored in her care. … She is an excellent caregiver who genuinely cares for children." },
      // Online review, about 2+ years into a nanny job that started 11/2021 (date is an estimate)
      { name: "K.T.", card: "review", role: "Mom", avatar: "flower", date: "2024",
        text: "We have been so incredibly lucky to have Yvanna as our son's nanny for the last 2+ years. … Yvanna provides him with an amazing, adventure-filled learning environment. … Yvanna is a wonderfully communicative, reliable, and kind caregiver. Any family will be lucky to have her." },
      // Undated: Facebook comment (date is a guess; kids were in her Reggio Emilia preschool class)
      { name: "R.", card: "comment", role: "Parent (Reggio Emilia preschool)", avatar: "heart", date: "2019",
        text: "She's amazing!! My kids were with her for several years at a Reggio Emilia preschool. She is lovely and super nurturing." },
      // Undated handwritten note (date is a guess)
      { name: "V.P.", card: "index", closing: "♥", role: "Parent", avatar: "chicken", date: "2025",
        text: "Yvanna is a lovely person inside and out! She provides a safe and happy environment for our kiddos to learn about nature. My daughter loves visiting the garden and Yvanna's chickens :) Thanks for being you!! :)" },
      // Holiday cards from the Dot to Dot team, December 2025 ("all the best for 2026")
      { name: "F.", card: "holiday", hello: "Dear Yvanna,", role: "Coworker", avatar: "flower", date: "2025-12",
        text: "I love how much passion and love you bring for the children. Thank you for everything you do." },
      { name: "A.", card: "holiday", hello: "Yvanna,", closing: "♥", role: "Coworker", avatar: "sprout", date: "2025-12",
        text: "Thank you for everything that you do! I appreciate the unique perspective you bring + the calm + curious lens you share with the children." },
      { name: "J.", card: "holiday", closing: "♥", role: "Coworker", avatar: "heart", date: "2025-12",
        text: "I miss seeing you everyday! I admire your love & patience that you bring to the children every day. I want to be in a classroom & learn from you. Thank you for everything you do for the children & all of the care that you put into everything you do." },
      { name: "E.", card: "holiday", hello: "Yvanna,", closing: "♥", role: "Coworker", avatar: "tomato", date: "2025-12",
        text: "I see the love & passion you pour into every interaction, provocation, and plant that has come into Dot to Dot; it's truly magical. Grateful to have you a part of our community!" },
      { name: "N.", card: "holiday", hello: "Yvanna,", role: "Coworker & friend", avatar: "silly", date: "2025-12",
        text: "Something I always admire about you is the strength you carry at your core. You are so strong, caring, and thoughtful. … Your heart is a gift to everyone you come in contact with. … You deeply inspire me to be a better giving human." },
      { name: "M.", card: "holiday", hello: "Dearest Yvanna ♥,", closing: "Love you,", role: "Coworker", avatar: "mystery", date: "2025-12",
        text: "Your contributions to Dot to Dot have been and will continue to inspire us, grow us and move us in the direction of our collective vision! Thank you for your partnership as an educator/mentor/friend. … Thank you for the life you bring into our outdoors. … You are a beautiful soul and I'm blessed to have you on our team. Cheers to love, to light, to magic and this beautiful gift we call life ♥" },
      // School newsletter shout-out (date is a guess: Longfellow garden classes, 2025–26 school year)
      { name: "Anonymous", card: "newsletter", role: "School newsletter shout-out", avatar: "sprout", date: "2026",
        text: "Huge thanks to Ms. Yvy! Your gardening classes are a highlight for so many students. Thank you for sharing your passion for nature and for your patience in helping every little 'seedling' thrive. Our school is a much brighter (and greener!) place because of you!" },
      // Thank-you texts after a babysitting weekend (two parents in a group chat)
      // Cards with no date; the dates below are estimates from what each card says
      // End-of-school-year card from a co-educator (estimate: June 2025)
      { name: "S.", card: "flowers", hello: "Yvanna,", closing: "Love,", role: "Co-educator", avatar: "flower", date: "2025-06",
        text: "Thank you for being my rock + one of the best co-educators I could have asked for. I would not have gotten through this school year without you! I am going to miss you …" },
      // End-of-year card from a classroom family (estimate: June 2025)
      { name: "M. & A.", card: "thanks", hello: "Ms. Yvanna,", closing: "Much love,", role: "Parents", avatar: "heart", date: "2025-06",
        text: "Thanks for a wonderful year! Our daughter excitedly tells us about your stories and interesting facts after school each day and it's so fun to see her excitement with learning about the world with you ♥ Your calming presence, excitement, and curiosity has been such a gift for her this past year and we can't thank you enough for all you do! We hope to see you around :)" },
      // Christmas card from a nanny family (estimate: December 2023, "another year with you")
      { name: "The T. family", card: "christmas", hello: "Dear Yvanna,", closing: "Love,", role: "Parents (nanny family)", avatar: "sprout", date: "2023-12",
        text: "We are so incredibly grateful to have spent another year with you. You are such a wonderful caregiver for our son & we love seeing him thrive with your love & attention. Have a great holiday break." },
      // Goodbye card from a nanny family (estimate: September 2023)
      { name: "N. & S.", card: "notecard", hello: "Yvanna,", closing: "♥", role: "Parents (nanny family)", avatar: "chicken", date: "2023-09",
        text: "Thank you so much for being such a huge part of our son's life (and ours!) and always taking such amazing care of him. I still remember how hard it was the first couple of weeks to leave him, and now it feels hard to not have him with you. It was wonderful to watch him grow into a happy, confident & well-behaved toddler under your care. Our family will forever be grateful to you, and we hope to stay in touch!" },
      // Teacher-appreciation basket tag from the school's parent group (estimate: May 2026)
      { name: "Los Compadres", card: "tag", closing: "Con gratitud,", role: "School parents (PTO)", avatar: "tomato", date: "2026-05",
        text: "¡Gracias por ser increíble! You make our school brighter in your own special way, with your care and alegría each and every day!" },
      // Card from a coworker (estimate: 2025)
      { name: "V.", card: "doodle", closing: "♥", role: "Coworker", avatar: "silly", date: "2025",
        text: "You are such a breath of fresh air and always inspire me to show off my passions and creativity! Have a beautiful day!" },
      { name: "L.A. & family", card: "texts", role: "Parents (babysitting)", avatar: "heart", date: "2026-10-04",
        text: "Thank you so much for watching them, we appreciate you and everything you did so much!! 💙💙💙 … We appreciate you so much! It was so great seeing you! ❤️❤️" },
    ],
  },

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
   *  rated:    "PG-13" adds a PG-13 tag and asks players to confirm they're 13 or older before playing.
   *  ratedFor: what makes it PG-13, shown in that pop-up, e.g. "drinking and grown-up jokes".
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
    { title: "Street Fluffers", type: "silly", date: "2026-10-24", play: "arcade/street-fluffers/", icon: "glove",
      blurb: "Pick a critter and brawl up the backyard ladder for the Critter of the Month Crown! Trading-card specials, slow-mo K.O.s and party hats." },
    { title: "Who is my wife cheating with!?", type: ["silly", "story"], date: "2026-10-18",
      rated: "PG-13", ratedFor: "drinking and grown-up jokes",
      url: "https://who-is-my-wife-cheating-with.vercel.app/", thumb: "images/games/who-is-my-wife-cheating-with.jpg",
      blurb: "A crime of passion, investigated entirely in MS Paint. Made with ALCaline. Play in English or Español!" },
    { title: "Tijuana Estuary Explorer", type: "garden", date: "2026-10-06", badge: "rough draft",
      url: "https://tijuana-estuary-game.vercel.app/", thumb: "images/games/tijuana-estuary.jpg",
      blurb: "Walk a park ranger through ten estuary zones, collect field data, and battle oil spills and invasive species." },
    { title: "Mike & Yvy's Love Adventure", type: "story", date: "2026-10-06", badge: "still updating ✨",
      rated: "PG-13", ratedFor: "drinking and grown-up jokes",
      url: "https://mike-yvy-love-adventure.vercel.app/", thumb: "images/games/mike-yvy-love-story.jpg",
      blurb: "A retro pixel RPG about how Mike and Yvy fell in love, from a chaotic airport trip all the way to moving in." },
    // Monthly arcade releases: a future date keeps a game locked ("coming Nov 18") until that day.
    // See OPEN_ITEMS.md for the release calendar.
    { title: "Egg Catch", type: "silly", date: "2026-11-18", play: "arcade/egg-catch/", icon: "chicken",
      blurb: "Riot and Beyonce are laying eggs from the coop roof. Catch them in your basket before they crack!" },
    { title: "??? Mystery Game ???", type: "mystery", date: "2026-10-18", url: "", thumb: "",
      blurb: "Something is sprouting... and it's a secret. Check back soon!" },
  ],

  /*
   * "BEHIND THE GAME" DEVLOGS: the 📜 button on a game in the portal opens its museum plaque.
   * Keyed by the game's exact title. Every part is optional; empty sections don't show.
   *   made, status: shown under the title
   *   sketch: { src, caption } (images/devlogs/, ~640px)
   *   idea, wrong [], learned [], tools [], stats [[emoji, label, value]]
   * DRAFT: the facts (dates, commits, sizes, fixes) come from each game's code and commit history.
   * The "what I learned" lines are a first draft: rewrite them in your own words!
   */
  devlogs: {
    "Rabbit & Frog: Gardenbound": {
      made: "Sep – Oct 2026", status: "still growing ✨",
      sketch: { src: "images/devlogs/rabbit-frog-logo-1.jpg", caption: "Logo try #1 of 14", alt: "Crayon drawing of Rabbit in a straw hat and overalls sitting next to Frog" },
      idea: "A game for my K–5 garden students all about seeds: how they pop, travel and get saved for next year. Rabbit and Frog sail between floating islands, and every station teaches a seed idea in English or Español. It started out as “Seed Quest · Misión Semilla” and got its new name in October.",
      wrong: [
        "Phones, phones, phones: the tap that opened a card also skipped it, long station names covered other buttons, and the storm's fog hid the Kraken on small screens.",
        "It got slow. Some islands took up to 2 seconds to appear. After a whole performance plan, they open in under 130 ms and the download is about half the size.",
        "The storm leaked memory every time you visited, and the Bee Garden sometimes ended on a blank white screen.",
      ],
      learned: [
        "Test on a real phone early and often. Desktop lies!",
        "Measure before fixing: the numbers showed exactly which islands were slow.",
        "Playtesters find things you never will (thank you, Mike!).",
        "Building bilingual from day one is way easier than translating later.",
      ],
      tools: ["three.js (3D)", "JavaScript", "Vite", "Custom watercolor shader", "Web Audio sound effects", "Read-aloud (browser speech)", "Playwright", "Vercel"],
      stats: [["🛠️", "commits", "390"], ["🏝️", "islands", "18"], ["📄", "lines of code", "~98k"], ["🗣️", "languages", "EN · ES"]],
    },
    "Master Composter Quest": {
      made: "Apr – Oct 2026",
      idea: "What if you fell asleep in Master Composter class and woke up inside the compost? Wallace the worm guides you through seven dream levels about soil, composting and worm bins, from “Don't Compost This!” to planting seeds.",
      wrong: [
        "iPhone sound fought back: it took three different fixes in one day to get the sound effects playing on iOS.",
        "Merging the new nightmare and lives system quietly deleted other features, so they had to be brought back.",
        "A sticky-keys bug made the character drift after menus. And one crow animation was so ugly it got undone.",
        "The whole game weighed 91 MB. Shrinking art, video and glow effects got it down to 15 MB.",
      ],
      learned: [
        "Big files are slow files: compress videos and images before shipping (the credits video went from 50 MB to 8.8 MB).",
        "One giant file is hard to work in. Splitting code into smaller pieces makes changes safer.",
        "Holiday surprises and Easter eggs (hi, Riot and Beyonce!) give players a reason to come back.",
      ],
      tools: ["React", "Vite", "Tailwind CSS", "Pixel-art SVG sprites", "Vercel"],
      stats: [["🛠️", "commits", "178"], ["🌙", "dream levels", "7"], ["🎃", "holiday themes", "5"], ["📦", "size", "91 → 15 MB"]],
    },
    "Tijuana Estuary Explorer": {
      made: "May – Oct 2026", status: "rough draft",
      sketch: { src: "images/devlogs/tijuana-field-journal.jpg", caption: "The field-journal look that won (two other styles didn't make it)", alt: "Concept screen: a ranger walking through a salt marsh, with a Nature Journal page and a battle panel against an oil spill" },
      idea: "Walk a park ranger through ten zones of the Tijuana River Estuary, collect field data at 20 stations, and log wildlife, insects and plants in a Nature Journal. Then defend the estuary from oil spills, invasive giant reed and sewage plumes.",
      wrong: [
        "On day two I rebuilt the whole engine: top-down view out, a 6-layer side-scroller in.",
        "Clouds vanished on iPhones and in the live version, and the title screen online didn't match the one on my computer.",
        "Tilting the phone for the binoculars game made the view jitter left and right.",
        "Timers broke when you switched tabs, until they ran on game time instead of the clock.",
      ],
      learned: [
        "Choose the camera and the engine before making lots of art.",
        "“Works on my computer” isn't done: always check the real live build.",
        "Code reviews catch real bugs (ten of them in one pass!).",
        "Only load things when they're needed: startup code dropped from ~400 KB to ~316 KB.",
      ],
      tools: ["JavaScript", "HTML5 Canvas", "Vite", "Open-Meteo live weather", "Phone gyroscope", "Watercolor sprites", "Vercel"],
      stats: [["🛠️", "commits", "298"], ["🗺️", "zones", "10"], ["🔬", "field stations", "20"], ["🐦", "species", "250+"]],
    },
    "Mike & Yvy's Love Adventure": {
      made: "Feb – Oct 2026", status: "started on Valentine's Day 💘",
      idea: "Our love story as a retro pixel RPG, from a chaotic airport trip all the way to moving in, told across 38 scenes. Bonus: hold a button to dance.",
      wrong: [
        "It started as one giant 2,388-line web page. Splitting it into proper pieces took a whole rebuild.",
        "Story bugs everywhere: players got stuck in place, dialogue leaked between scenes, a fight never started, and fades never faded.",
        "The airport gate seats were off by a little (sorry, seat 12B).",
      ],
      learned: [
        "Tests for the story flow (about 100 of them now) catch places where players get stuck.",
        "Lots of small files beat one huge file.",
        "Every sprite and sound can be made with code: the game ships with no art or audio files of its own.",
      ],
      tools: ["Phaser 3", "JavaScript", "Vite", "Vitest", "Code-drawn pixel art", "Web Audio", "Vercel"],
      stats: [["🛠️", "commits", "112"], ["🎬", "scenes", "38"], ["✅", "tests", "~100"]],
    },
    "Tomato Tussle": {
      made: "Oct 2026", status: "arcade game #1",
      idea: "A 45-second garden defense: squirrels, crows and raccoons raid the beds, and you splat them with tomatoes to build combos up to ×4. Splat Riot or Beyonce and it's game over.",
      wrong: ["Tosses felt laggy: every tap waited for a 150 ms tomato flight before the splat. Now the splat happens right on the tap."],
      learned: ["Game feel is all about instant feedback: sound and splash the moment you tap."],
      tools: ["JavaScript (no libraries)", "HTML canvas", "Web Audio synth sounds", "Pixel art in code"],
      stats: [["⏱️", "round", "45 s"], ["🔥", "max combo", "×4"], ["📄", "lines of code", "761"]],
    },
    "Bowl Brawl": {
      made: "Oct 2026", status: "arcade game #2",
      idea: "Peaches vs. Lychee in a quick-draw duel over the food bowl. Wait for Bojjii's flag, then pounce, but watch out for fake-outs: a butterfly, a pancake, a sneeze or a fly! First to 3 wins.",
      learned: ["A computer player that gets faster every round, and sometimes falls for fake-outs too, feels fairer and funnier than a perfect one."],
      tools: ["JavaScript (no libraries)", "HTML canvas", "Web Audio synth sounds", "Pixel art in code"],
      stats: [["🐾", "players", "1 or 2"], ["🏆", "first to", "3"], ["📄", "lines of code", "735"]],
    },
    "Street Fluffers": {
      made: "Oct 2026", status: "arcade game #3 (a bonus!)",
      idea: "Bowl Brawl grew up into a real fighting game. Pick any of the seven critters and fight up the backyard ladder for the Critter of the Month Crown, Street Fighter style. Each critter's two special moves come straight from their trading card, and there are slow-mo K.O.s, a backstory, seven different endings and 84 lines of trash talk.",
      wrong: [
        "Bojjii was too big to jump over, and the chickens' pecks missed even when they looked like hits. Now everyone has the same size, speed and reach, no matter how they look.",
        "On phones, the touch buttons covered the fighters until they moved down onto the grass.",
        "The first robot announcer paused for three whole seconds between “K” and “O”.",
        "Browsers kept showing the old game after updates, until every file got a version number.",
      ],
      learned: [
        "Fair beats realistic: the critters can look different, but they should all play the same.",
        "Little touches make it feel like a real arcade game: hitstop, slow motion, an announcer and a party hat.",
        "Keep the real photos open while drawing. Bojjii and Penny's first colors were way off!",
      ],
      tools: ["JavaScript (no libraries)", "HTML canvas", "Web Audio synth sounds", "Announcer voice clips", "Pixel art in code", "Battle music from Tijuana Estuary Explorer", "Cloudflare Worker high scores"],
      stats: [["🐾", "critters", "7"], ["✨", "special moves", "14"], ["💬", "matchup lines", "84"], ["📄", "lines of code", "~3,200"]],
    },
    "Who is my wife cheating with!?": {
      status: "made with ALCaline",
      idea: "A crime of passion, investigated entirely in MS Paint, in English or Español.",
      tools: ["React", "Vite", "Canvas drawings", "Bilingual text"],
      stats: [["🗣️", "lines of text", "~1,090 × 2"], ["🎵", "music tracks", "8"]],
    },
  },

  // Background photo wall: share of photo frames that stay as cute emoji frames
  // so it doesn't feel crowded. 0 = all photos, 0.3 = about 1 in 3, 1 = all emoji.
  wallEmojiShare: 0.3,

  // Weekly photo rotation: these albums show only this many photos at a time
  // (scrapbook, popup and photo wall), shuffled. A new set rotates in every Monday,
  // and over the weeks every photo gets its turn. Remove an album to show all of it.
  // pin: true on a photo keeps it in every week (it counts toward the 10). The first
  // pinned photo always shows first; other pinned ones mix in with the rotating photos.
  weeklyPhotos: { me: 10, pets: 10, chickens: 10 },
  // Albums where everyone gets an equal share every week. A photo belongs to whoever's
  // name is in its file name or caption (group photos count for everyone in them).
  // Leftover spots rotate between them week to week. A few photos may repeat to keep it even.
  weeklyGroups: { pets: ["peaches", "bojjii", "lychee", "penny"] },

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
    me: [           // images/me/        (the first one becomes the "click my head" photo; it's pinned so it always shows)
      { src: "images/me/the-best.jpg",       caption: "Certified the best. Source: me ✨", pin: true },
      { src: "images/me/garden-class-chickens.jpg", caption: "Garden class, starring Riot and Beyonce as special guest speakers 🎤🐔", pin: true },
      { src: "images/chickens/yvy-fake-chickens-1.jpg", caption: "Me and some very well-behaved chickens (they're fake)", focus: "30% 40%", pin: true },
      { src: "images/me/trex-pinball.jpg",     caption: "T. rex vs. Jurassic Park pinball. Tiny arms, big score 🦖", focus: "40% 40%", pin: true },
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
      { src: "images/me/gingham.jpg",        caption: "Gingham + sunshine = picnic energy 🧺", focus: "50% 15%" },
      { src: "images/me/pikachu-and-ash.jpg",  caption: "Pikachu and Ash, best-friend edition ⚡", focus: "60% 35%" },
      { src: "images/me/chef-cosplay.jpg",     caption: "Chef squad, raccoon sous-chefs included 🦝🍳", focus: "50% 35%" },
      { src: "images/me/pikachu-christmas.jpg", caption: "Double Pikachu, double peppermint mocha ☕⚡", focus: "50% 30%" },
      { src: "images/me/naruto-family.jpg",    caption: "Believe it! Naruto family photo (Lychee joined the village) 🍥", focus: "50% 30%" },
      { src: "images/me/dragon-queen.jpg",     caption: "Mother of dragons, on Eevee babysitting duty 🐉", focus: "45% 55%" },
      { src: "images/me/dino-crew.jpg",        caption: "Dino crew at the movies. I'm the raptor 🦖", focus: "50% 50%" },
      { src: "images/me/poncho.jpg",           caption: "Poncho twirl, sunshine mode 🌈", focus: "50% 25%" },
      { src: "images/me/cat-in-the-hat.jpg",   caption: "Storytime with the Cat in the Hat 🎩📖", focus: "40% 40%" },
      { src: "images/me/flower-crown.jpg",     caption: "Flower crown, fiesta colors 🌺", focus: "50% 30%" },
      { src: "images/me/princess-peach.jpg",   caption: "Princess Peach, but make it pizza-delivery chic 🍑", focus: "35% 35%" },
      { src: "images/me/one-piece.jpg",        caption: "Straw Hat crew, reporting for treasure duty 🍊🏴‍☠️", focus: "35% 35%" },
      { src: "images/me/witch.jpg",            caption: "Garden witch mode: weeds, be gone 🌿✨", focus: "50% 25%" },
    ],
    // Garden Society: date ("YYYY-MM-DD", when the photo was taken) puts the photo in the
    // Garden Society Journal tab too, mixed in with members' posts, newest first.
    club: [         // images/club/      Garden Society (families gave the OK to post these)
      { date: "2026-05-06", src: "images/club/coop-check-in.jpg",  caption: "Chicken check-in at the coop 🐔", focus: "50% 55%" },
      { date: "2026-05-06", src: "images/club/chicken-arch.jpg",   caption: "Proud chicken holder under the garden arch", focus: "50% 35%" },
      { date: "2026-03-18", src: "images/club/chicken-cuddle.jpg", caption: "Chicken cuddles (the chicken approves) 🐔", focus: "50% 40%" },
      { date: "2026-03-18", src: "images/club/chicken-huddle.jpg", caption: "Chicken huddle! 🐔🐔", focus: "50% 45%" },
      { date: "2026-05-27", src: "images/club/painting-rocks.jpg", caption: "Painting garden rocks, one careful stroke at a time 🎨", focus: "45% 35%" },
      { date: "2026-05-27", src: "images/club/rock-show.jpg",      caption: "Rock show! Fresh-painted and ready to flex 💪", focus: "50% 40%" },
      { date: "2026-02-26", src: "images/club/craft-time.jpg",     caption: "Craft time at the picnic tables", focus: "40% 50%" },
      { date: "2026-03-11", src: "images/club/markers-out.jpg",    caption: "Markers out, garden art in progress 🖍️", focus: "55% 45%" },
      { date: "2026-02-05", src: "images/club/picnic-tables.jpg",  caption: "Busy hands, busy tables", focus: "50% 55%" },
      { date: "2026-03-11", src: "images/club/green-onions.jpg",   caption: "Washing fresh-picked green onions 🧅", focus: "55% 55%" },
    ],
    // Garden students: date ("YYYY-MM-DD", when the photo was taken) shows under the caption in the scrapbook.
    students: [     // images/students/  garden students (families gave the OK to post these)
      { date: "2026-06-04", src: "images/students/sunflowers.jpg",        caption: "Sunflowers reaching for the sky 🌻", focus: "50% 25%" },
      { date: "2026-05-07", src: "images/students/worm-hello.jpg",        caption: "Hello, worm! Compost crew member of the day 🪱", focus: "45% 55%" },
      { date: "2025-10-02", src: "images/students/bug-buddies.jpg",       caption: "Pill bug meet and greet 🐞", focus: "40% 60%" },
      { date: "2025-09-17", src: "images/students/garden-trex.jpg",       caption: "A wild T. rex is guarding the garden beds 🦖", focus: "60% 50%" },
      { date: "2025-09-18", src: "images/students/magnifying-glass.jpg",  caption: "Magnifying glass mission: tiny things up close 🔍", focus: "50% 50%" },
      { date: "2026-05-14", src: "images/students/soil-hands.jpg",        caption: "Hands full of happy soil", focus: "50% 60%" },
      { date: "2026-10-15", src: "images/students/sifting-seeds.jpg",     caption: "Sifting seeds, one tiny speck at a time", focus: "50% 40%" },
      { date: "2026-04-05", src: "images/students/bee-hotel-flowers.jpg", caption: "Nasturtiums decorating the bee hotel 🐝", focus: "40% 50%" },
      { date: "2026-05-14", src: "images/students/bee-hotel-jar.jpg",     caption: "Homemade bee hotel, now accepting tenants 🐝", focus: "50% 40%" },
      { date: "2026-05-22", src: "images/students/yvy-zucchini.jpg",      caption: "Me vs. a zucchini that got WAY too big 🥒", focus: "50% 30%" },
      { date: "2026-06-07", src: "images/students/painted-rocks.jpg",     caption: "A whole table of painted garden rocks 🎨", focus: "50% 50%" },
      { date: "2025-09-18", src: "images/students/garden-trail.jpg",      caption: "Garden explorers hitting the trail", focus: "50% 60%" },
      { date: "2026-02-26", src: "images/students/soil-huddle.jpg",       caption: "Everybody wants a look at the soil 👀", focus: "50% 40%" },
      { date: "2026-08-27", src: "images/students/watering-duty.jpg",     caption: "Watering duty with the big green can 💧", focus: "50% 45%" },
      { date: "2026-03-09", src: "images/students/raised-bed.jpg",        caption: "Raised bed bursting with greens 🥬", focus: "50% 60%" },
      { date: "2026-09-17", src: "images/students/passion-vine.jpg",      caption: "Passion vine climbing the garden fence", focus: "50% 40%" },
      { date: "2026-01-29", src: "images/students/nature-museum.jpg",     caption: "Nature museum day: skulls, bugs and treasures 💀🦋", focus: "50% 50%" },
      { date: "2025-11-06", src: "images/students/whiteboard-doodles.jpg", caption: "Whiteboard doodles: seeds and one very leggy bug 🕷️", focus: "50% 50%" },
      { date: "2026-03-12", src: "images/students/outdoor-classroom.jpg", caption: "Outdoor classroom, all set for seed day", focus: "50% 55%" },
      { date: "2026-03-12", src: "images/students/seed-lab.jpg",          caption: "Seed lab stations, ready to go 🌱", focus: "50% 50%" },
    ],
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
  // card: their "Critter of the Month" trading card (flock and pets both have one; see critterOfTheMonth).
  // Their pixel sprite (js/pixels.js) is named after them (riot, peaches...); card.sprite picks another.
  // photos: the card's photo for each of their turns as Critter of the Month, in order (turn 1 first), so every
  // turn's card is a new one to collect. Add more to the end; when they run out it starts over.
  // Preview a turn with ?cotm=Riot&turn=2
  // stats are out of 5. Each move has an animation (anim) the sprite acts out when you click it on the big card:
  // charge, flip, stomp, glare, hug, hide, spin, chomp, loaf. fx is the little emoji that flies around.
  flock: [
    { name: "Riot", breed: "Buff Laced Polish", photo: "images/chickens/riot.jpg",
      fact: "Rocks a giant pom-pom hairdo and can't see where she's going. Goes anyway.",
      card: { hp: 70, type: "Pom-Pom", rarity: 3,
        photos: [
          { src: "images/chickens/riot.jpg", focus: "50% 0%" },
          { src: "images/chickens/riot-baby-1.jpg", focus: "25% 45%" },
          { src: "images/chickens/riot-coop.jpg", focus: "50% 12%" },
          { src: "images/chickens/riot-beyonce-table.jpg", focus: "55% 45%" },
        ],
        moves: [
          { name: "Blind Charge", dmg: 30, anim: "charge", fx: "💨", text: "Runs straight at you. Can't see you. Hits anyway." },
          { name: "Hair Flip", dmg: 20, anim: "flip", fx: "✨", text: "The opponent is too dazzled to move this turn." },
        ],
        stats: { Fluff: 4, Sass: 3, Speed: 4, Vision: 1, Chaos: 5 },
        weakness: "Wind (hair in eyes)", resist: "Bad hair days" } },
    { name: "Beyonce", breed: "Golden Laced Polish", photo: "images/chickens/beyonce.jpg",
      fact: "The feisty one. Runs the coop, and the coop knows it.",
      card: { hp: 90, type: "Diva", rarity: 4,
        photos: [
          { src: "images/chickens/beyonce.jpg" },
          { src: "images/chickens/beyonce-patrol.jpg", focus: "50% 50%" },
          { src: "images/chickens/beyonce-cage.jpg", focus: "30% 30%" },
          { src: "images/chickens/baby-beyonce-riot.jpg", focus: "25% 50%" },
        ],
        moves: [
          { name: "Coop Rules", dmg: 40, anim: "stomp", fx: "💥", text: "Every chicken on the bench does what she says." },
          { name: "Signature Glare", dmg: 30, anim: "glare", fx: "⚡", text: "The opponent skips a turn to think about what they did." },
        ],
        stats: { Sass: 5, Bossiness: 5, "Kale Defense": 5, Fluff: 3, Speed: 3 },
        weakness: "None (she says)", resist: "Rules made by others" } },
    { name: "Snow 🌈", breed: "Silkie", photo: "images/chickens/snow.jpg",
      fact: "Our fluffy little cloud. She's the mystery chicken now, keeping watch from somewhere extra soft. Forever loved.",
      card: { hp: "∞", type: "Cloud", rarity: 5, memorial: true,
        photos: [
          { src: "images/chickens/snow.jpg" },
          { src: "images/chickens/snow-held.jpg", focus: "38% 40%" },
          { src: "images/chickens/snow-inside.jpg", focus: "52% 50%" },
          { src: "images/chickens/snow-closeup.jpg", focus: "55% 40%" },
        ],
        moves: [
          { name: "Marshmallow Hug", dmg: 0, anim: "hug", fx: "💕", text: "Everyone on your side feels better. All of them." },
          { name: "Puffball Camo", dmg: 0, anim: "hide", fx: "🌼", text: "Hides in the dandelions. Can't be found. Can't be hit." },
        ],
        stats: { Fluff: 5, Sweetness: 5, "Couch Duty": 5, Mystery: 5, Speed: 1 },
        weakness: "None", resist: "Everything. Forever loved." } },
  ],
  // CRITTER OF THE MONTH: one critter a month swaps its Critter Corner card for its trading card
  // (click it to open the big card and watch their moves). They take turns in this order, starting
  // with the month in start. pins picks a critter for a month instead, e.g. { "2026-12": "Bojjii" }.
  // Preview any card with ?cotm=Lychee
  critterOfTheMonth: {
    start: "2026-10",
    order: ["Riot", "Peaches", "Beyonce", "Bojjii", "Snow", "Lychee", "Penny"],
    pins: {},
  },

  // PETS (Critter Corner cards). photo is optional.
  pets: [
    { name: "Peaches", kind: "Fox-faced Pomeranian", photo: "images/pets/peaches-hehe-bite.jpg",
      fact: "Owns more outfits than anyone in the house. Wears every one of them with pride.",
      card: { hp: 40, type: "Fashion", rarity: 4,
        photos: [
          { src: "images/pets/peaches-hehe-bite.jpg" },
          { src: "images/pets/peaches-bunny-outfit.jpg", focus: "10% 50%" },
          { src: "images/pets/peaches-queen-bee.jpg", focus: "50% 38%" },
          { src: "images/pets/peaches-jean-outfit.jpg", focus: "65% 30%" },
        ],
        moves: [
          { name: "Outfit Change", dmg: 20, anim: "spin", fx: "🎀", text: "Spins once and comes back in a brand new outfit. The crowd goes wild." },
          { name: "Hehe Bite", dmg: 10, anim: "chomp", fx: "💥", text: "A tiny, very dramatic nibble. Mostly for show." },
        ],
        stats: { Fluff: 5, Fashion: 5, Sass: 4, Bark: 4, Size: 1 },
        weakness: "Not being the center of attention", resist: "Plain collars" } },
    { name: "Bojjii", kind: "Mutt (German Shepherd × Aussie Shepherd, we think)", photo: "images/pets/bojjii-card.jpg",
      fact: "The big sweet boy. Will wear antlers, wigs and party hats for the team (and beg for pancakes).",
      card: { hp: 120, type: "Gentle Giant", rarity: 4,
        photos: [
          { src: "images/pets/bojjii-card.jpg" },
          { src: "images/pets/bojjii-birthday.jpg", focus: "50% 15%" },
          { src: "images/pets/bojjii-reindeer.jpg", focus: "50% 20%" },
          { src: "images/pets/bojjii-backpack.jpg" },
        ],
        moves: [
          { name: "Ball Frenzy", dmg: 20, anim: "spin", fx: "🎾", text: "Spins in circles and tennis balls go flying everywhere. Fetch? FETCH!" },
          { name: "Pancake Stare", dmg: 50, anim: "glare", fx: "🥞", text: "Stares until a pancake appears. It always works." },
        ],
        stats: { Sweetness: 5, Size: 5, Begging: 5, "Hat Tolerance": 5, Speed: 3 },
        weakness: "Pancakes", resist: "Wigs, antlers and party hats" } },
    { name: "Lychee", kind: "Tabby cat", photo: "images/pets/lychee-cucumber.jpg", focus: "70% 50%",
      fact: "Lounges on vegetables, tolerates costumes, and is deeply tired of Peaches' nonsense.",
      card: { hp: 60, type: "Loaf", rarity: 3,
        photos: [
          { src: "images/pets/lychee-cucumber.jpg", focus: "70% 50%" },
          { src: "images/pets/lychee-basket.jpg" },
          { src: "images/pets/lychee-mafia.jpg" },
          { src: "images/pets/lychee-bee.jpg" },
        ],
        moves: [
          { name: "Veggie Lounge", dmg: 10, anim: "loaf", fx: "🥒", text: "Lies down on the cucumber. The cucumber is hers now." },
          { name: "Unimpressed Stare", dmg: 30, anim: "glare", fx: "💤", text: "Peaches leaves the room." },
        ],
        stats: { Chill: 5, Judging: 5, Napping: 5, "Costume Tolerance": 2, Speed: 2 },
        weakness: "Peaches' nonsense", resist: "Costumes (mostly)" } },
    { name: "Penny 🌈", kind: "Chug (Chihuahua × Pug)", photo: "images/pets/penny-posing.jpg", focus: "50% 35%",
      fact: "Stuck by my side through my hardest times. Spun in happy circles and hid chocolate under the blankets for her momma, and somehow always knew never to eat it herself. The sweetest, most loving doggo there ever was. Forever loved.",
      card: { hp: "∞", type: "Sweetheart", rarity: 5, memorial: true,
        photos: [
          { src: "images/pets/penny-posing.jpg", focus: "50% 35%" },
          { src: "images/pets/penny-silly.jpg", focus: "50% 12%" },
          { src: "images/pets/penny-life-jacket.jpg", focus: "55% 40%" },
          { src: "images/pets/penny-pink-collar.jpg", focus: "40% 5%" },
        ],
        moves: [
          { name: "Happy Circles", dmg: 0, anim: "spin", fx: "💖", text: "Spins in happy circles until everyone is smiling." },
          { name: "Chocolate Stash", dmg: 0, anim: "hide", fx: "💝", text: "Hides chocolate under the blankets for her momma. Never eats it herself." },
        ],
        stats: { Loyalty: 5, Sweetness: 5, Snuggles: 5, Spins: 5, Size: 1 },
        weakness: "None", resist: "Everything. Forever loved." } },
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

  // LESSON BOARD: the chalkboard section under the Gardenbound Hall of Fame. What garden class is learning now,
  // and where each lesson lives in Rabbit & Frog: Gardenbound (world = island group, island = island).
  // activities: the island's activities in game order. now: the one in progress. did: the ones finished.
  // When a lesson is done, move it from now into done (newest first) and set its did.
  lessons: {
    quarter: "Fall 2026",
    game: { name: "Rabbit & Frog: Gardenbound", url: "https://seed-game-pi.vercel.app/" },
    now: {
      unit: 2, lesson: 3, title: "How Do We Grow Crops?",
      world: "Blossom Islands: the Plant Part-tay", island: "Sprout Springs", islandNo: 3,
      activities: ["Mix Lab", "Seed Start", "Move-In Day", "Plant Talk", "Grow Guide"],
      now: 2,
    },
    done: [
      { unit: 6, lesson: 3, title: "How Do We Harvest & Save Seeds?",
        world: "Harvest Haven Islands", island: "Seed Island", islandNo: 3,
        activities: ["Seed Library", "Seed Suitcases", "Pod Popping", "Gone to Seed"],
        did: [1, 2, 4] },
    ],
  },

  /*
   * GARDEN MAP: the Central Garden as a pixel map (🗺️ Map tab in the Garden Society, js/garden-map.js).
   * Traced from Yvy's map on a grid 40 squares wide × 53 tall (cols, rows): x, y = top-left corner, w, h = size,
   * all in whole squares (so every edge lines up straight).
   * kind picks the look: bed, coop, run, tree, vine, hedge, compost, sink, drain, mushrooms,
   * succulents, aloe, grass, building, shed, box, sign, bucket, shelf, table, cart, balls.
   * A spot with a name can be hovered/tapped; it shows name, planted (list), about, fix and todo.
   * planted items are "emoji name" or { icon: "kale", name: "kale" } for a js/veg-icons.js icon.
   * chores: [{ text, every }] jobs that come back every so many days (Chicken Run: food and water every day).
   *         Crossing one off counts for that many days, then it's due again. Changing its text starts it fresh.
   * fix: repairs it needs (puts a yellow "!" on the map). Repairs get crossed off like to-dos; the "!" goes away
   *      once they're all done. todo: garden jobs for this season,
   * written for San Diego weather and crop rotation. Update todo (and todoTitle) each season.
   * more: [[x, y, w, h], ...] adds extra pieces of the same spot (an L-shaped vine).
   * clip: a CSS polygon for a spot that isn't a rectangle (the L-shaped YMCA Room); textAt: [x, y, w, h]
   *       inside the spot puts its label there. runner: a pixel sprite (js/pixels.js) running laps in the spot.
   * lesson: true shows what garden class is learning right now (lessons → now).
   * dated: [{ dates: ["YYYY-MM-DD", ...], about }] swaps in a different about on those days (the YMCA Room).
   * id: a short name the Garden Society API uses for the feeding log and crossed-off to-dos.
   *     Keep it the same once it's in use, or the spot loses its log.
   */
  gardenMap: {
    title: "The Central Garden",
    cols: 40, rows: 53,
    season: "Fall 2026",
    hint: "Hover or tap a bed, tree or vine to see what's growing! A yellow ! means it needs fixing.",
    todoTitle: "To-do this fall",
    // feed: each bed's fertilizer calendar (organic, kid-safe), shown under its to-do list
    feedTitle: "Feeding calendar",
    // feedPlan: when each bed gets fed. months: [from, to] (can wrap past December); every: days between
    // feedings, or leave it out for once during those months. Feedings are logged on the admin page
    // (🌱 Garden tab) or sent by members through "Submit an entry"; fed here can hold extra ones,
    // as { date: "YYYY-MM-DD", id: "greens" } (id can also be a list). Last fed and next feeding come from these.
    feedNote: "Organic and kid-safe: compost, fish emulsion, blood meal, bone meal. Water before and after feeding, and never feed dry soil.",
    // Things buried in a bed, on any map: give the bed has: ["olla"], ["wormbin"] or ["olla", "olla", "wormbin"]
    // (list one per olla). Each gets a little marker in a corner of the bed (emoji: drawn as that pixel emoji,
    // otherwise a colored dot), and its name in the speech box opens about. hasLayout: "stacked" on a bed puts
    // its markers top-center and bottom-center instead, with the bed's number between them (Bed #4's ollas);
    // hasLayout: "right" starts them on the right side (Bed #9's worm bin).
    // chore: a job that comes back every so many days (every), listed under the bed's Chores. Crossing it off
    // counts for that many days, then it's due again. Changing a chore's text starts it fresh.
    features: {
      olla: { name: "Olla", plural: "Ollas",
        about: "An unglazed clay pot buried in the soil and filled with water. The water seeps out slowly, right to the roots, so the bed needs less watering. Keep the lid on and top it up when it's low 💧",
        chore: { text: "Fill up the olla with water (twice a week)", plural: "Fill up the ollas with water (twice a week)", every: 3 } },
      wormbin: { name: "In-ground worm bin", plural: "In-ground worm bins", emoji: "🪱",
        about: "A bin buried in the bed with holes in its sides. Worms eat the scraps we drop in, then wander out and leave castings around the roots 🪱 Fruit and veggie scraps only (no citrus, onions, meat or dairy), and keep the lid on.",
        chore: { text: "Feed the worms a handful of fruit and veggie scraps (once a week)", every: 7 } },
    },
    spots: [
      // Ground first (drawn underneath everything else)
      { kind: "grass", x: 1, y: 1, w: 18, h: 8 },
      { kind: "grass", x: 2, y: 18, w: 17, h: 34 },
      { kind: "grass", x: 32, y: 11, w: 4, h: 7 },
      { kind: "hedge", x: 1, y: 0, w: 18, h: 1 },
      { kind: "hedge", x: 23, y: 0, w: 15, h: 1 },
      { kind: "hedge", x: 37, y: 1, w: 1, h: 7 },
      { kind: "sign", text: "GATE", x: 19, y: 0, w: 4, h: 2 },
      // The YMCA Room: Miss Regan's, except on the days Snra Sam teaches cooking there (dates as YYYY-MM-DD).
      { kind: "building", tone: "pink", text: "YMCA", x: 23, y: 8, w: 17, h: 16, textAt: [0, 0, 14, 3],
        clip: "polygon(0 0, 100% 0, 100% 100%, 82.35% 100%, 82.35% 18.75%, 0 18.75%)",
        name: "YMCA Room", about: "Miss Regan is in charge of the YMCA here. She's so kind, and she's always helping us out in a crunch 💛",
        dated: [{
          about: "Snra Sam, my co-teacher, is here today teaching cooking! 🍳",
          dates: ["2026-11-06", "2026-11-12", "2026-11-13", "2026-12-03", "2026-12-04", "2026-12-10", "2026-12-11", "2026-12-17",
            "2027-01-29", "2027-02-04", "2027-02-05", "2027-02-11", "2027-02-18", "2027-02-19", "2027-02-25", "2027-02-26",
            "2027-04-08", "2027-04-09", "2027-04-15", "2027-04-16", "2027-04-22", "2027-04-23", "2027-04-29", "2027-04-30"],
        }] },
      { kind: "building", tone: "lav", text: "LIBRARY", x: 24, y: 31, w: 16, h: 21 },
      { kind: "sign", text: "◀ IN", x: 19, y: 48, w: 4, h: 2 },

      // The places you can look at
      { kind: "building", tone: "green", text: "GARDEN CLASSROOM", x: 23, y: 1, w: 14, h: 7,
        name: "Garden Classroom", lesson: true, about: "Where garden class meets. Seeds get sorted, worms get named and questions get asked (so many questions)." },
      { kind: "compost", x: 34, y: 1, w: 3, h: 3,
        name: "Main Compost", about: "Our main compost pile. Lunch scraps go in, garden gold comes out. Temps are on the 🌡️ Compost tab.", tab: "compost" },
      { kind: "bucket", x: 33, y: 14, w: 2, h: 2,
        name: "Compost Bucket", about: "Our green compost bucket! The Garden Society fills it at the cafeteria salad bar for SDUSD's Café to Compost Program. Lettuce, cucumbers and carrots go to the chickens in the Grub Tub; tomatoes, pickles and extras go in the Main Compost ♻️" },
      { kind: "building", tone: "storage", text: "📦", x: 37, y: 24, w: 3, h: 3,
        name: "YMCA's Storage Shed", about: "The YMCA's storage shed." },
      { kind: "balls", x: 32, y: 25, w: 4, h: 2,
        name: "YMCA Play Balls", about: "The YMCA's play balls." },
      { kind: "shed", text: "SHED", x: 32, y: 19, w: 4, h: 5,
        name: "Shed & Storage", about: "Shovels, gloves and watering cans live here." },
      { kind: "mushrooms", tone: "short", x: 2, y: 2, w: 3, h: 3,
        name: "Short Mushroom Table", about: "The shorter of our two mushroom tables, also turquoise with yellow spots 🍄" },
      { kind: "mushrooms", x: 2, y: 5, w: 3, h: 3,
        name: "Tall Mushroom Table", about: "The taller of our two mushroom tables: turquoise with yellow spots 🍄" },
      { kind: "bed", text: "#8", x: 6, y: 2, w: 5, h: 2, id: "bed8", name: "Bed #8", has: ["olla"],
        planted: ["🌾 lemongrass", "🌿 rosemary", "🌿 cilantro", "🌸 bee balm", "🌿 basil"],
        todo: [
          "Cilantro loves the cool season. Pick it often and sow more every few weeks, since it goes to seed fast.",
          "Harvest the basil before nights drop into the 40s. It doesn't like the cold.",
          "Bee balm is a perennial that bees and hummingbirds love. Once it dies back in late fall, cut it down to a few inches. It comes back in spring.",
          "Rosemary and lemongrass are perennials: they stay put. Cut the lemongrass back to about a foot tall in late winter.",
          "Crop rotation: this is mostly a perennial herb bed, so it stays put. Add compost on top in late winter.",
        ],
        feed: [
          "Cilantro (Oct to Mar): a light fish emulsion feed once a month.",
          "Lemongrass: fish emulsion or blood meal once a month from Apr to Sep.",
          "Basil: a light fish emulsion feed every 4 weeks (Apr to Oct).",
          "Bee balm: a little compost in early spring, spread on top of the bed.",
          "Rosemary: none needed.",
        ],
        feedPlan: [
          { id: "cilantro", what: "fish emulsion for the cilantro", months: [10, 3], every: 30 },
          { id: "compost", what: "compost on top of the bed (the bee balm likes it)", months: [2, 3] },
          { id: "lemongrass", what: "fish emulsion or blood meal for the lemongrass", months: [4, 9], every: 30 },
          { id: "basil", what: "fish emulsion for the basil", months: [4, 9], every: 28 },
        ],
        fed: [], // feeding log, e.g. { date: "2026-11-02", id: "greens" } (id from feedPlan)
      },
      { kind: "bed", text: "#9", x: 12, y: 2, w: 6, h: 2, id: "bed9", name: "Bed #9", has: ["wormbin"], hasLayout: "right",
        planted: ["🌿 cilantro", "🧅 onions", "🌿 golden oregano", "🥬 lettuce", { icon: "spinach", name: "spinach" }, "🥕 carrots", { icon: "beet", name: "beets" }, "💮 alyssum", "🌾 lemongrass"],
        fix: ["Needs chicken fencing to keep the flock out."],
        todo: [
          "Thin the carrots and beets so each one has 2 to 3 inches of room. Bonus: beet thinnings make tasty baby greens.",
          "Pick the outer leaves of the lettuce and spinach and let the middles keep growing.",
          "Cilantro loves the cool season. Sow more every few weeks, since it goes to seed fast.",
          "Golden oregano is a perennial. Trim it back by about a third to keep it bushy.",
          "Cut the lemongrass back to about a foot tall in late winter.",
          "Crop rotation: carrots, beets and onions are root crops. Next season, beans or leafy greens would be a good switch here.",
        ],
        feed: [
          "Lettuce, spinach and cilantro (Oct to Mar): fish emulsion every 3 to 4 weeks.",
          "Carrots, beets and onions: compost only. Too much nitrogen gives you hairy carrots and tiny roots.",
          "Lemongrass: fish emulsion or blood meal once a month from Apr to Sep.",
          "Golden oregano and alyssum: none needed.",
        ],
        feedPlan: [
          { id: "greens", what: "fish emulsion for the lettuce, spinach and cilantro", months: [10, 3], every: 21 },
          { id: "lemongrass", what: "fish emulsion or blood meal for the lemongrass", months: [4, 9], every: 30 },
        ],
        fed: [], // feeding log, e.g. { date: "2026-11-02", id: "greens" } (id from feedPlan)
      },
      { kind: "coop", text: "🐔", x: 6, y: 4, w: 3, h: 2,
        id: "coop", name: "Chicken Coop", about: "Bedtime and egg-laying HQ. The chickens eat our weeds and bugs and pay us back in eggs and compost.", link: "#critters",
        chores: [{ text: "Clean the coop (once a week)", every: 7 }] },
      { kind: "run", x: 9, y: 4, w: 9, h: 2,
        id: "run", name: "Chicken Run", runner: "beyonce", about: "Scratch, peck, dust bath, repeat. That's Beyonce doing her laps! Garden class sometimes gets a special guest speaker from in here 🎤",
        chores: [{ text: "Refill the chickens' food (every day)", every: 1 }, { text: "Refill the chickens' water (every day)", every: 1 }] },
      { kind: "bed", text: "#7", x: 6, y: 6, w: 5, h: 2, id: "bed7", name: "Bed #7",
        planted: ["🌿 rosemary", "🌿 thyme", "🌿 sage"],
        todo: [
          "Rosemary, thyme and sage are Mediterranean perennials, made for San Diego. Water them very little once the winter rains start; soggy soil is their only real enemy.",
          "Trim lightly after they flower to keep them bushy, but never cut into the old bare wood.",
          "Room to spare? Fall is the time for cilantro, parsley and dill. They bolt in the summer heat.",
          "Crop rotation: this is a perennial herb bed, so it doesn't need to rotate.",
        ],
        feed: [
          "Rosemary, thyme and sage: no fertilizer. Lean soil keeps them tough and full of flavor.",
          "If cilantro, parsley or dill go in this fall: a little compost at planting, then fish emulsion once a month.",
        ],
        feedPlan: [], // nothing needs feeding
        fed: [], // feeding log, e.g. { date: "2026-11-02", id: "greens" } (id from feedPlan)
      },
      { kind: "bed", text: "#6", x: 12, y: 6, w: 6, h: 2, id: "bed6", name: "Grub Tub (Bed #6)",
        about: "Our Grub Tub! This is where the food scraps for the chickens go 🐔",
        todo: [
          "Chicken-safe scraps only: no avocado skins or pits, no raw or dried beans, nothing moldy or salty.",
          "Hand the scraps out to the chickens every day so the tub doesn't attract flies and rats, and rinse it out once a week.",
        ] },
      { kind: "vine", tone: "passion", x: 18, y: 1, w: 1, h: 8, more: [[1, 8, 17, 1]],
        name: "Passionfruit Vines", about: "Wild flowers that look like tiny space stations, then purple fruit full of tangy seeds." },
      { kind: "shelf", x: 15, y: 10, w: 3, h: 3,
        name: "Shelf", about: "The shelf next to the sink, handy for setting things down while you wash up." },
      { kind: "sink", text: "SINK", x: 10, y: 10, w: 5, h: 3,
        id: "sink", name: "Sink", about: "Wash your hands, then wash your veggies. In that order, please 💧",
        fix: ["Leaky faucet.", "Broken plumbing underneath."] },
      { kind: "cart", x: 20, y: 20, w: 3, h: 6,
        id: "cart", name: "Farm Cart", about: "Our white and brown farm cart. It's getting a makeover!",
        fix: ["The wheels need fixing, and it needs fresh paint on the wood and the white metal."],
        todo: ["Paint and seal the wood.", "Repaint the white metal.", "Fix the wheels.", "Advertise it."] },
      { kind: "table", x: 11, y: 14, w: 6, h: 3,
        name: "Garden Table", about: "Our picnic table, right next to the grapevines. It's pretty much our garden bench: a spot to sit, rest and chat in the garden." },
      { kind: "compost", tone: "worm", x: 18, y: 9, w: 2, h: 2,
        id: "worm", name: "Worm Compost", about: "Our worm compost bin 🪱",
        fix: ["It's broken and needs repairing before it can be used again."] },
      { kind: "compost", x: 18, y: 11, w: 2, h: 2,
        name: "Rotating Compost", about: "Our rotating compost. Give it a spin to mix everything up! Temps are on the 🌡️ Compost tab.", tab: "compost" },
      { kind: "tree", tone: "fig", x: 7, y: 8, w: 3, h: 3,
        id: "fig1", name: "Fig Tree", about: "Fig tree number one, by the sink. Big leaves, sweet sticky figs in late summer.",
        fix: ["Vines (passionfruit or grape) are climbing on it. Untangle them and cut them back so the tree gets its light back."],
        todo: ["Fig trees drop their leaves in winter. Do any big pruning while they're bare (December to February)."] },
      { kind: "succulents", x: 1, y: 10, w: 5, h: 4,
        name: "Succulent Garden", about: "Plants that don't mind if we forget to water them. Look for the little rosettes." },
      { kind: "tree", tone: "avocado", x: 0.5, y: 14.5, w: 2, h: 2,
        name: "Avocado Tree", about: "Takes forever to grow avocados. Worth it 🥑" },
      // The pomegranate and fig #2 both fit inside the succulent garden (cols 1-5, rows 10-13): the bigger
      // pomegranate up top on the right, the fig in the bottom-left corner
      { kind: "tree", tone: "pomegranate", x: 3, y: 10, w: 3, h: 3,
        name: "Pomegranate Tree", about: "A pomegranate tree in the succulent garden, bigger than fig tree number two below it. Its red fruits ripen in fall: crack one open for the juicy red seeds inside!" },
      { kind: "tree", tone: "fig", x: 1, y: 12, w: 2, h: 2,
        id: "fig2", name: "Fig Tree", about: "Fig tree number two, in the bottom-left corner of the succulent garden, just below the pomegranate. The birds know about this one.",
        todo: ["Fig trees drop their leaves in winter. Do any big pruning while they're bare (December to February)."] },
      { kind: "tree", tone: "apple", x: 0.5, y: 17.5, w: 2, h: 2,
        name: "Apple Tree", about: "A low-chill apple, made for San Diego winters." },
      { kind: "vine", tone: "grape", x: 10, y: 17, w: 9, h: 1, more: [[18, 18, 1, 28]],
        name: "Grape Vines", about: "Shade in summer, grapes in fall, bare twisty branches in winter." },
      { kind: "drain", x: 3, y: 19, w: 4, h: 31,
        name: "Rock Drainage", about: "A river of rocks that keeps the garden from turning into a pond when it rains." },
      { kind: "bed", text: "#5", x: 10, y: 19, w: 6, h: 5, id: "bed5", name: "Bed #5",
        planted: [{ icon: "blackberry", name: "blackberries" }, "🌼 yarrow", "💮 alyssum", "🌿 tarragon", "🥬 collard greens", "🥦 broccoli", "🌼 giant coreopsis", "🍓 strawberries", "🌺 nasturtiums", { icon: "scallions", name: "leeks" }],
        todo: [
          "Collards and broccoli love San Diego's cool season. Pick collard leaves from the bottom up, and check under the leaves for aphids and cabbage worms.",
          "Cut the broccoli's main head while the buds are still tight and green. Little side shoots keep coming for weeks after.",
          "Pile mulch or soil up around the leeks to grow longer white stems. They'll be ready from winter into spring.",
          "Giant coreopsis is a California native. It looks like a bare stick in summer, leafs out with the rains and blooms yellow in late winter. Don't pull it!",
          "Cut the yarrow's dried flower stems back to the leaves.",
          "Strawberries: snip off the runners and old brown leaves. Blackberries: in winter, cut the canes that fruited this year down to the ground.",
          "Crop rotation: collards and broccoli are brassicas (cabbage family). Next spring, follow them with beans or root crops here, not more brassicas.",
        ],
        feed: [
          "Collards, broccoli and leeks (Oct to Mar): fish emulsion every 3 to 4 weeks. Leafy crops love nitrogen.",
          "Strawberries: feed in Feb as new leaves come in, and again after the first big harvest (Apr to May).",
          "Tarragon: a little compost in spring.",
          "Yarrow, giant coreopsis, alyssum and nasturtiums: no fertilizer.",
        ],
        feedPlan: [
          { id: "greens", what: "fish emulsion for the collards, broccoli and leeks", months: [10, 3], every: 21 },
          { id: "berries", what: "feed the strawberries as new leaves come in", months: [2, 2] },
          { id: "berries2", what: "feed the strawberries after the first big harvest", months: [4, 5] },
          { id: "tarragon", what: "a little compost for the tarragon", months: [3, 3] },
        ],
        fed: [], // feeding log, e.g. { date: "2026-11-02", id: "greens" } (id from feedPlan)
      },
      { kind: "vine", tone: "trellis", x: 10, y: 24, w: 6, h: 1,
        id: "trellis", name: "Grapevine Trellis", about: "A trellis for the grapevines to climb, right between beds #4 and #5 🍇",
        fix: ["Needs more support."],
        todo: ["Grapes go dormant in winter, and January is the time to prune them, so add the extra support before then."] },
      { kind: "bed", text: "#4", x: 10, y: 25, w: 6, h: 4, id: "bed4", name: "Bed #4", has: ["olla", "olla"], hasLayout: "stacked",
        planted: [{ icon: "celery", name: "celery" }, "🌺 nasturtiums", { icon: "sweet-pea", name: "sweet peas" }, "🥬 lettuce", "🧅 onion"],
        todo: [
          "Nasturtiums love our cool season and reseed themselves. Thin them out so they don't smother everything.",
          "Nasturtiums are a trap crop: aphids go for them first. Check under the leaves, and leave a few aphids for the ladybugs.",
          "Sweet peas are flowers, not snacks: their seeds and pods are poisonous. Give them a string or trellis to climb, and pick the flowers often so more keep coming.",
          "Pick the outer lettuce leaves and let the middle keep growing. Sow a little more every few weeks through February.",
          "Celery likes steady water, and the ollas help a lot. Keep them full!",
          "Crop rotation: sweet peas are legumes and leave nitrogen behind, so next spring's heavy feeders (like tomatoes) will do well here.",
        ],
        feed: [
          "Nasturtiums: no fertilizer. Rich soil gives you all leaves and no flowers.",
          "Lettuce and celery (Oct to Mar): fish emulsion every 3 to 4 weeks.",
          "Onion: compost only.",
          "Sweet peas: none needed. They make their own nitrogen.",
          "Mar: compost before spring planting.",
        ],
        feedPlan: [
          { id: "greens", what: "fish emulsion for the lettuce and celery", months: [10, 3], every: 21 },
          { id: "spring", what: "compost before spring planting", months: [3, 3] },
        ],
        fed: [], // feeding log, e.g. { date: "2026-11-02", id: "greens" } (id from feedPlan)
      },
      { kind: "aloe", x: 12, y: 29, w: 2, h: 1,
        name: "Aloe", about: "An aloe on the grass, right at the bottom of Bed #4. Its spiky, juicy leaves are full of gel. It's a succulent, so it barely needs water 🌵" },
      { kind: "tree", tone: "citrus", x: 12, y: 30, w: 2, h: 2,
        name: "Calamondin Tree", about: "A calamondin, tucked just below Bed #4: a little citrus tree with tiny, super-sour orange fruits, like a mini orange crossed with a lime 🍊" },
      { kind: "tree", tone: "fig", x: 4, y: 23, w: 3, h: 3,
        id: "fig3", name: "Fig Tree", about: "Fig tree number three, on the rock drainage right across from the grapevine trellis. We may have a fig problem (it's a good problem).",
        fix: ["Vines (passionfruit or grape) are climbing on it. Untangle them and cut them back so the tree gets its light back."],
        todo: ["Fig trees drop their leaves in winter. Do any big pruning while they're bare (December to February)."] },
      { kind: "bed", text: "#3", x: 10, y: 32, w: 6, h: 5, id: "bed3", name: "Bed #3",
        planted: ["🌿 oregano", { icon: "scallions", name: "chives" }, "🌿 sage", "🦋 narrowleaf milkweed", "🌾 lemongrass", "🌿 rosemary", "🌿 thyme", "🌿 basil"],
        todo: [
          "Narrowleaf milkweed is a California native and food for monarch caterpillars 🦋 Leave it standing, then cut it back to about 6 inches in January or February so fresh leaves grow in.",
          "Sage, rosemary and thyme are Mediterranean herbs, made for San Diego. Once the winter rains start they need almost no extra water.",
          "Harvest the basil before nights drop into the 40s.",
          "Trim the oregano back by about a third. Cut the lemongrass to about a foot tall in late winter.",
          "Chives are perennial. Cut them down to 2 inches to refresh them.",
          "Crop rotation: this is a perennial pollinator bed, so it stays put. Add compost on top instead of digging it in.",
        ],
        feed: [
          "Milkweed is a native: no fertilizer. It makes it floppy and short-lived.",
          "Lemongrass: fish emulsion or blood meal once a month from Apr to Sep while it's growing. None in winter.",
          "Basil: a light fish emulsion feed every 4 weeks (Apr to Oct).",
          "Oregano, sage, rosemary and thyme: none needed. Lean soil keeps them full of flavor.",
          "Jan or Feb: a thin layer of compost on top of the whole bed (the chives like it too).",
        ],
        feedPlan: [
          { id: "compost", what: "a thin layer of compost on the whole bed", months: [1, 2] },
          { id: "lemongrass", what: "fish emulsion or blood meal for the lemongrass", months: [4, 9], every: 30 },
          { id: "basil", what: "fish emulsion for the basil", months: [4, 9], every: 28 },
        ],
        fed: [], // feeding log, e.g. { date: "2026-11-02", id: "greens" } (id from feedPlan)
      },
      { kind: "box", text: "⚡", x: 11, y: 41, w: 4, h: 4,
        id: "ebox", name: "Electric Box", about: "There's a mason bee treehouse hanging from it 🐝 Mason bees are gentle, hardly ever sting, and are amazing pollinators.",
        todo: [
          "Mason bees come out in spring (about Feb to May), so keep the bee house facing the morning sun and out of the rain.",
          "Fall is the time to check the nesting tubes: clean or swap out any that are moldy or full of mites.",
        ] },
      { kind: "bed", text: "#2", x: 11, y: 38, w: 4, h: 2, id: "bed2", name: "Bed #2",
        planted: ["🌿 cilantro", { icon: "celery", name: "celery" }, "🍓 strawberries", "🧅 onions", { icon: "blackberry", name: "blackberries" }, "🥬 lettuce", "🍆 eggplants", { icon: "chard", name: "Swiss chard" }],
        todo: [
          "Fall is lettuce season in San Diego! Sow a little more every 2 to 3 weeks through February.",
          "Strawberries: snip off the runners and old brown leaves, and add straw mulch before the rains so the berries stay off the dirt.",
          "Once the rain starts, look for snails and slugs under the strawberry leaves.",
          "Pull the eggplant once it stops making fruit (usually by mid-November). It's a nightshade, so no tomatoes, peppers or eggplants here next spring.",
          "Cilantro loves the cool season. Pick it often and sow more every few weeks, since it goes to seed fast.",
          "Blackberries: in winter, cut the canes that fruited this year down to the ground and tie up the new green ones.",
        ],
        feed: [
          "Lettuce, Swiss chard, celery and cilantro (Oct to Mar): fish emulsion every 3 to 4 weeks.",
          "Strawberries: feed in Feb as new leaves come in, and again after the first big harvest (Apr to May). Skip them in late fall.",
          "Onions: compost only. Extra nitrogen makes small bulbs.",
          "Blackberries: compost around the base in Feb.",
          "Eggplant: no more feeding. It's finishing up.",
        ],
        feedPlan: [
          { id: "lettuce", what: "fish emulsion for the lettuce, chard, celery and cilantro", months: [10, 3], every: 21 },
          { id: "berries", what: "feed the strawberries as new leaves come in", months: [2, 2] },
          { id: "berries2", what: "feed the strawberries after the first big harvest", months: [4, 5] },
          { id: "blackberries", what: "compost around the blackberries", months: [2, 2] },
        ],
        fed: [], // feeding log, e.g. { date: "2026-11-02", id: "greens" } (id from feedPlan)
      },
      { kind: "bed", text: "#1", x: 10, y: 46, w: 6, h: 5, id: "bed1", name: "Bed #1",
        planted: ["🌿 basil", { icon: "marigold", name: "marigolds" }, "🌺 nasturtiums", "🌿 cilantro", { icon: "kale", name: "ornamental kale" }, "🌿 oregano", "💮 alyssum", "🍆 eggplants", { icon: "chard", name: "Swiss chard" }, { icon: "scallions", name: "chives" }, "🍅 cherry tomatoes", { icon: "celery", name: "celery" }, { icon: "beet", name: "beets" }, "🌶️ chili peppers", { icon: "sweet-pea", name: "sweet peas" }, { icon: "artichoke", name: "artichoke" }, "🧅 onions", "🥬 lettuce", { icon: "blackberry", name: "blackberries" }, "🥬 mixed romaine lettuce", { icon: "oyster-mushroom", name: "leaflike oyster mushroom (Hohenbuehelia petaloides)" }],
        todo: [
          "Pull the cherry tomatoes, eggplants and chili peppers once they stop making fruit (usually by mid-November). Compost the healthy plants and bag any with spotted leaves.",
          "Harvest the basil before nights drop into the 40s: pesto time! Or let one plant flower to save seeds.",
          "Pick the outer leaves of the lettuce, romaine and Swiss chard and let the middles keep growing. Thin the beets so each one has about 3 inches of room.",
          "Sweet peas are flowers, not snacks: their seeds and pods are poisonous. Look and sniff, but don't eat! Give them something to climb.",
          "The oyster mushrooms grow on old wood in the bed. Look, but don't pick or eat them: wild mushrooms are for grown-up experts to identify.",
          "Blackberries and the artichoke are perennials. In winter, cut the blackberry canes that fruited this year down to the ground. The artichoke rests and sprouts again in spring.",
          "Crop rotation: tomatoes, eggplants and peppers are nightshades. Keep them out of this bed next spring; fava beans or peas this winter would put nitrogen back.",
        ],
        feed: [
          "Now to Nov: no more feeding the tomatoes, eggplants and peppers. They're finishing up.",
          "Lettuce, romaine, Swiss chard, celery and kale (Oct to Mar): fish emulsion every 3 to 4 weeks. Leafy crops love nitrogen.",
          "Beets and onions: compost only. Too much nitrogen gives you all leaves and tiny roots.",
          "Artichoke: compost around it in Feb as new growth starts.",
          "Basil: a light fish emulsion feed every 4 weeks while it's growing (Apr to Oct).",
          "Mar to Apr (spring planting): compost plus a balanced organic fertilizer before anything new goes in.",
          "Oregano, nasturtiums, marigolds, alyssum and sweet peas: no fertilizer.",
        ],
        feedPlan: [
          { id: "greens", what: "fish emulsion for the lettuce, chard, celery and kale", months: [10, 3], every: 21 },
          { id: "artichoke", what: "compost around the artichoke", months: [2, 2] },
          { id: "spring", what: "compost and balanced organic fertilizer before spring planting", months: [3, 4] },
          { id: "basil", what: "fish emulsion for the basil", months: [4, 9], every: 28 },
        ],
        fed: [], // feeding log, e.g. { date: "2026-11-02", id: "greens" } (id from feedPlan)
      },
      { kind: "tree", tone: "lemon", x: 6, y: 48, w: 3, h: 3,
        name: "Lemon Tree", about: "Lemons pretty much all year. Lemonade days are the best days 🍋" },
      { kind: "vine", tone: "berry", x: 2, y: 52, w: 17, h: 1,
        name: "Blackberry Vines", about: "Sweet berries, sharp thorns. Pick carefully!" },
    ],

    /*
     * More maps, picked with the buttons above the map. Each has its own title, season, hint,
     * grid size (cols × rows) and spots, written the same way as the Central Garden's.
     * Extra kinds here: mulch (wood chips), shade (a possible future garden, dashed edge), hall (a hallway or
     * walkway, dashed edge), faucet, fence. tone "oval" rounds a bed; tone "native" is a native garden.
     * keep: [{ name, note, photos: [{ src, alt, caption, credit, link }] }] plants growing where they might
     *       get weeded by mistake. Their names in about become buttons that show the photos (images/plants/).
     *       credit and link: who took the photo and its Wikimedia Commons page (CC BY photos need the credit).
     */
    otherMaps: [
      {
        key: "ms",
        button: "🏫 Middle School",
        title: "The Middle School Garden",
        season: "First floor · Fall 2026",
        hint: "Hover or tap a bed to see it! Beds #1 to #3 are in the bottom left corner, and #4 to #7 are up top by the tree.",
        // Traced from Yvy's map on a grid 46 squares wide × 42 tall (the fence line is the last column)
        cols: 46, rows: 42,
        spots: [
          // Buildings, hallways and wood chips first (drawn underneath everything else)
          { kind: "hedge", x: 0, y: 0, w: 1, h: 21 },
          { kind: "building", tone: "green", x: 1, y: 0, w: 10, h: 9 },
          // The wood chip areas can be tapped too, but they stay underneath the beds (they're drawn first)
          { kind: "mulch", x: 11, y: 0, w: 13, h: 9,
            id: "ms-chips-top", name: "Wood Chips (Top Beds)",
            about: "Mulch and wood chips around MS Beds #4 to #7 and the tree, up top on the first floor. Careful: basil and milkweed (narrowleaf and tropical) are growing in the wood chips here, so don't pull them out! Tap their names to see what they look like.",
            keep: [
              { name: "basil",
                note: "Basil: bright green, shiny, oval leaves. Rub a leaf and it smells sweet, like pizza and pesto 🌿",
                photos: [
                  { src: "images/plants/basil-1.jpg", alt: "A bushy basil plant with lots of bright green, shiny, oval leaves",
                    credit: "USDA, public domain", link: "https://commons.wikimedia.org/wiki/File:2018_USDA_Farmers_Market_-_Watermelon_(20180803-AMS-LSC-0898).jpg" },
                  { src: "images/plants/basil-2.jpg", alt: "Close-up of the top of a basil plant: smooth oval leaves in pairs",
                    credit: "Amada44, public domain", link: "https://commons.wikimedia.org/wiki/File:Ocimum_basilicum-001.jpg" },
                ] },
              { name: "milkweed",
                note: "We have two kinds of milkweed! Monarch caterpillars eat both, so please leave them for the butterflies 🦋",
                photos: [
                  { src: "images/plants/milkweed-narrowleaf-1.jpg", caption: "Narrowleaf milkweed (a California native): pale pink and white flower balls",
                    alt: "Narrowleaf milkweed in bloom: round clusters of small pale pink and white flowers above long thin leaves",
                    credit: "Braines123, CC0", link: "https://commons.wikimedia.org/wiki/File:Asclepias_Fascicularis_in_bloom.jpg" },
                  { src: "images/plants/milkweed-narrowleaf-2.jpg", caption: "Narrowleaf milkweed without flowers: long, thin leaves in bunches",
                    alt: "A narrowleaf milkweed plant with no flowers: tall stems covered in long, very thin leaves",
                    credit: "glmory, CC0", link: "https://commons.wikimedia.org/wiki/File:Asclepias_fascicularis,_Narrowleaf_Milkweed.jpg" },
                  { src: "images/plants/milkweed-tropical.jpg", caption: "Tropical milkweed: orange-red and yellow flowers, wider leaves",
                    alt: "Tropical milkweed: a cluster of small orange-red and yellow flowers on a green stem",
                    credit: "Forest & Kim Starr, CC BY 3.0", link: "https://commons.wikimedia.org/wiki/File:Starr_071024-0085_Asclepias_curassavica.jpg" },
                ] },
            ],
            todo: ["Weed the wood chips, but leave the basil and milkweed!"] },
          { kind: "building", tone: "green", text: "MIDDLE SCHOOL BUILDING", x: 1, y: 9, w: 36, h: 12 },
          { kind: "hall", text: "1ST FLOOR HALLWAY (WALKWAY ABOVE)", x: 10, y: 21, w: 27, h: 4 },
          { kind: "mulch", x: 0, y: 21, w: 22, h: 20,
            clip: "polygon(27.27% 0, 45.45% 0, 45.45% 80%, 100% 80%, 100% 100%, 0 100%, 0 80%, 27.27% 80%)",
            id: "ms-chips-corner", name: "Wood Chips (Corner Beds)", about: "Mulch and wood chips around MS Beds #1 to #3 in the bottom left corner.",
            todo: ["Weed the wood chips."] },
          { kind: "building", tone: "green", x: 10, y: 25, w: 12, h: 12 },
          { kind: "hall", tone: "narrow", text: "WALK WAY", x: 22, y: 25, w: 3, h: 17 },
          { kind: "building", tone: "green", x: 25, y: 25, w: 16, h: 12 },
          { kind: "hedge", x: 41, y: 25, w: 2, h: 12 },
          { kind: "fence", x: 45, y: 0, w: 1, h: 42 },

          // The places you can look at
          { kind: "bed", tone: "oval", text: "#1", x: 7, y: 31, w: 2, h: 5, id: "ms1", name: "MS Bed #1",
            about: "Middle school garden bed #1, in the bottom left corner on the first floor." },
          { kind: "bed", tone: "oval", text: "#2", x: 8, y: 38, w: 6, h: 2, id: "ms2", name: "MS Bed #2",
            about: "Middle school garden bed #2, in the bottom left corner on the first floor." },
          { kind: "bed", tone: "oval", text: "#3", x: 15, y: 38, w: 6, h: 2, id: "ms3", name: "MS Bed #3",
            about: "Middle school garden bed #3, in the bottom left corner on the first floor." },
          { kind: "bed", text: "#4", x: 12, y: 1, w: 3, h: 5, id: "ms4", name: "MS Bed #4", has: ["wormbin"],
            about: "Middle school garden bed #4, up top by the tree (still the first floor)." },
          { kind: "bed", text: "#5", x: 12, y: 7, w: 5, h: 2, id: "ms5", name: "MS Bed #5",
            about: "Middle school garden bed #5, up top by the tree (still the first floor).",
            fix: ["Broken hose."] },
          { kind: "bed", text: "#6", x: 18, y: 7, w: 5, h: 2, id: "ms6", name: "MS Bed #6", has: ["olla", "wormbin"],
            about: "Middle school garden bed #6, up top by the tree (still the first floor).",
            fix: ["Needs new irrigation hoses."] },
          { kind: "bed", text: "#7", x: 20, y: 1, w: 3, h: 5, id: "ms7", name: "MS Bed #7",
            about: "Middle school garden bed #7, up top by the tree (still the first floor)." },
          { kind: "tree", x: 16, y: 2, w: 3, h: 3,
            name: "Tree", about: "The tree in the middle of the top garden beds." },
          { kind: "faucet", x: 8, y: 6, w: 3, h: 3,
            name: "Water Faucet", about: "The first floor water faucet, right by the top beds. Fill the watering cans here 💧" },
          { kind: "shade", text: "SHADE GARDEN? 6TH", x: 0, y: 21, w: 6, h: 16,
            name: "Possible Shade Garden (6th Grade)", about: "Underneath the stairs: a possible shade garden for 6th grade." },
          { kind: "shade", text: "SHADE GARDEN? 7TH/8TH", x: 37, y: 9, w: 6, h: 16,
            name: "Possible Shade Garden (7th/8th Grade)", about: "Underneath the stairs: a possible shade garden for 7th and 8th grade." },
          { kind: "table", x: 31, y: 37, w: 5, h: 3,
            name: "Table and Chairs", about: "A table and chairs by the native garden." },
          { kind: "bed", tone: "native", text: "NATIVE GARDEN", x: 25, y: 40, w: 17, h: 1, more: [[42, 37, 1, 4]],
            id: "msnative", name: "Middle School Native Garden", about: "The middle school's native plant garden, along the bottom by the fence." },
        ],
      },
    ],
  },

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
      // Piles to pick from when logging a temperature ("Submit an entry" and the admin page)
      piles: ["Main pile", "Rotating pile"],
      hotLow: 131,   // above this kills most pathogens and weed seeds
      turnAt: 150,   // turn the pile when it gets this hot
      tooHot: 160,   // above this the helpful microbes start dying
      source: {
        label: "UC Master Gardeners: Composting basics",
        url: "https://ucanr.edu/site/uc-master-gardeners-san-luis-obispo-county/composting-basics",
      },
      // Yvy's compost photos (images/compost/): journal-style cards in the Compost tab, mixed with
      // members' compost posts, newest first, 6 a page. date: "YYYY-MM-DD" shows on the card.
      // Families gave the OK to post these.
      photos: [
        { date: "2026-04-23", src: "images/compost/sorting-scraps.jpg",    caption: "Sorting scraps: greens vs. browns 🥬🍂", focus: "45% 50%" },
        { date: "2026-04-30", src: "images/compost/scrap-bucket.jpg",      caption: "Feeding the scrap bucket (it's always hungry)", focus: "50% 50%" },
        { date: "2026-05-07", src: "images/compost/turning-the-pile.jpg",  caption: "Turning the big pile. Arm day, compost edition 💪", focus: "35% 50%" },
        { date: "2026-05-07", src: "images/compost/compost-crew.jpg",      caption: "The compost crew, shovels ready", focus: "60% 50%" },
        { date: "2026-05-21", src: "images/compost/fresh-greens.jpg",      caption: "Fresh greens on top of the pile 🌿", focus: "60% 40%" },
        { date: "2026-05-21", src: "images/compost/pitchfork-power.jpg",   caption: "Pitchfork power: chop it, mix it, fluff it", focus: "55% 50%" },
        { date: "2026-08-27", src: "images/compost/compost-to-garden.jpg", caption: "Compost goes in, plants grow up 🌱", focus: "50% 50%" },
        { date: "2026-09-03", src: "images/compost/chicken-helpers.jpg",   caption: "Chickens on compost duty, with an audience 🐔", focus: "50% 55%" },
      ],
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
