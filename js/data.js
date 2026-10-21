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

  // Arcade leaderboards shown in the portal's "High Scores" box (scores live in the API).
  // game = the arcade folder name; low: true means the fastest time wins (scores are in ms).
  arcadeScores: [
    { game: "tomato-tussle", title: "Tomato Tussle", unit: "pts" },
    { game: "bowl-brawl", title: "Bowl Brawl", low: true, unit: "s" },
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
    summary: "Bilingual educator and program leader with 10+ years of experience in early childhood development, inquiry-based learning, and experiential education. Specializing in Reggio Emilia-inspired, Montessori, and Forest School pedagogies, with expertise in outdoor classroom development, environmental stewardship, curriculum design, and community engagement. Experienced in mentoring educators, coordinating volunteers, developing educational partnerships, and securing $10,000+ annually in grant funding. Passionate about creating inclusive, child-centered learning environments that foster curiosity, ecological literacy, creativity, and meaningful connections with the natural world.",

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
   */
  shop: {
    keeper: "Yvy",
    greeting: "Welcome to Yvy's Garden & Game Shop! Everything here is made to order. Have a look around, then come chat with me at the counter!",
    items: [
      { emoji: "🌱", name: "Garden Workshops", tag: "schools · camps · clubs",
        blurb: "Hands-on garden lessons on seeds, soil, compost and pollinators, for any age from UTK up. In English or Español." },
      { emoji: "🏡", name: "Outdoor Classroom Design", tag: "schools · preschools",
        blurb: "Turn a yard, courtyard or school garden into a living classroom: mud kitchens, loose parts, pollinator gardens and habitat spaces." },
      { emoji: "📚", name: "Curriculum Design", tag: "UTK–8th grade",
        blurb: "Inquiry-based garden and environmental curriculum inspired by Reggio Emilia, Montessori and Forest School." },
      { emoji: "🤝", name: "Teacher Mentoring", tag: "teaching teams",
        blurb: "Coaching on outdoor learning, documentation and child-led projects, so your team feels at home teaching outside." },
      { emoji: "🎮", name: "Custom Mini-Games", tag: "classrooms · events",
        blurb: "A little browser game for your class, garden program or event, bilingual if you like. Just like the ones in my portal!" },
      { emoji: "🧸", name: "Kid-Centered Design Help", tag: "apps · games · VR",
        blurb: "Child development know-how for your product: age-appropriate UX, playtesting with kids, safety and healthy screen time." },
    ],
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
   * kindWords are testimonials Yvy adds by hand (excerpts from reference letters). They show
   * first, with a ★ ribbon, sorted by date (oldest first), so new ones can go anywhere in the list.
   * Initials + a role only: no last names, phone numbers, emails, kids' names, schools or health details.
   * date: "YYYY-MM-DD", or "YYYY-MM" / "YYYY" when the letter has no exact date.
   */
  guestbook: {
    intro: "Sign my guestbook! Leave a hello, a game review, or a kind word. I read every entry before it goes up ♥",
    roles: ["Visitor", "Game player", "Parent", "Student", "Garden Society member", "Teacher / coworker", "Collaborator"],
    avatars: ["chicken", "flower", "heart", "sprout", "tomato", "silly", "bowl", "mystery"],   // pixel sprites from js/pixels.js
    kindWords: [
      // Pattern: { name: "A.B.", role: "Teacher", avatar: "flower", date: "2026-10-01", text: "..." },
      // Undated letter; "this year" in it is 2012 (the Zombie Walk's 5th year, after 2011)
      { name: "M.K.", role: "Volunteer coordinator", avatar: "mystery", date: "2012",
        text: "For the last 5 years, we have held an event called the Long Beach Zombie Walk. … In all, we had over 14,000 people come to our event. … With virtually little experience in volunteer management, Ms. Bresciani managed, with no oversight, over 35 volunteers. … Yvanna's professionalism, intuitive management skills, and astounding leadership abilities were crucial to our success. … She's a natural leader, a team-player, and an innovative thinker." },
      { name: "P.M.", role: "Parent", avatar: "heart", date: "2015-12-03",
        text: "She was wonderful with both of my boys. … When interacting with both of my boys, they always were very excited about different activities she had planned. She was very patient, sweet, and creative, and always found a way to multitask efficiently throughout her time with us. … I cannot recommend Yvanna enough." },
      { name: "J.R.", role: "Dad (Care.com review)", avatar: "sprout", date: "2016-05-17",
        text: "Yvanna was a spectacular addition to our family! … Yvanna took initiative in her work: setting up a binder with information about family events around the city, feedback from each day of care, and other helpful information. We absolutely loved her and would recommend her services to anyone lucky enough to have her!" },
      { name: "J.E.", role: "Neighbor & friend", avatar: "chicken", date: "2016-07-17",
        text: "Yvanna Bresciani is one of the most disciplined and punctual people I've ever known. Her ability to work efficiently under stressful conditions and nerve-wrecking deadlines speaks volumes about her hard work, determination and her composed demeanor. … Yvanna is a compassionate and hardworking individual with perseverance and ambition." },
      { name: "M.S.", role: "Parent Education instructor", avatar: "flower", date: "2016-07-28",
        text: "Yvanna did a great job helping and playing with the children, selecting age appropriate toys and understanding the basic needs of children this age. … She has incredible patience with children and looks at ease around them. … I think she would make a valued teacher and caregiver of any children in her care." },
      { name: "K.R.", role: "Mom", avatar: "tomato", date: "2016-11-07",
        text: "In the time Yvanna has been with us, she became a beloved part of our lives. … Even our neighbors frequently commented to me on how consistently loving, patient, and kind Yvanna was with both children. … She is a great multi-tasker and very creative." },
      { name: "V.J.", role: "Parent", avatar: "heart", date: "2016-11-08",
        text: "Yvanna is a very reliable person, we are very blessed to have her supporting our family. She is consistent, flexible, loving, nurturing, and very responsible. … When I arrive home my youngest daughter is always sad to see Yvanna leave, one strong indicator that she is connected and bonded to my kids." },
      { name: "L.M.", role: "Parent (Montessori classroom)", avatar: "sprout", date: "2021-10-02",
        text: "Yvanna was the Montessori guide for both my son and daughter in their toddler class. She was able to build trust with them in a very short period of time and spark their interest while keeping to the curriculum. … Miss Yvanna's focus on social-emotional learning really paid off. … It clearly worked because both of my children flourished while in her classroom." },
      { name: "H.M.", role: "Parent", avatar: "flower", date: "2022-09-22",
        text: "It was an absolute privilege to have Yvanna as our nanny. She is reliable, loving, communicative, and dedicated to children's growth and development. … Yvanna was thoughtful in organizing activities and spaces that helped my daughter hit her developmental milestones in a way that was safe and creative. … Her warm energy is contagious." },
      { name: "S.L. & S.S.", role: "Parents", avatar: "silly", date: "2023-03-21",
        text: "Her creativity knows no bounds as she regularly provides our son with engaging and fun activities such as art projects, games, singing, dancing, and yoga. Our son has always been excited to spend time with her and has never been bored in her care. … She is an excellent caregiver who genuinely cares for children." },
      // Online review, about 2+ years into a nanny job that started 11/2021 (date is an estimate)
      { name: "K.T.", role: "Mom", avatar: "flower", date: "2024",
        text: "We have been so incredibly lucky to have Yvanna as our son's nanny for the last 2+ years. … Yvanna provides him with an amazing, adventure-filled learning environment. … Yvanna is a wonderfully communicative, reliable, and kind caregiver. Any family will be lucky to have her." },
      // Undated: Facebook comment (date is a guess; kids were in her Reggio Emilia preschool class)
      { name: "R.", role: "Parent (Reggio Emilia preschool)", avatar: "heart", date: "2019",
        text: "She's amazing!! My kids were with her for several years at a Reggio Emilia preschool. She is lovely and super nurturing." },
      // Undated handwritten note (date is a guess)
      { name: "V.P.", role: "Parent", avatar: "chicken", date: "2025",
        text: "Yvanna is a lovely person inside and out! She provides a safe and happy environment for our kiddos to learn about nature. [My daughter] loves visiting the garden and Yvanna's chickens :) Thanks for being you!! :)" },
      // Holiday cards from the Dot to Dot team, December 2025 ("all the best for 2026")
      { name: "F.", role: "Coworker", avatar: "flower", date: "2025-12",
        text: "I love how much passion and love you bring for the children. Thank you for everything you do." },
      { name: "A.", role: "Coworker", avatar: "sprout", date: "2025-12",
        text: "Thank you for everything that you do! I appreciate the unique perspective you bring + the calm + curious lens you share with the children." },
      { name: "J.", role: "Coworker", avatar: "heart", date: "2025-12",
        text: "I miss seeing you everyday! I admire your love & patience that you bring to the children every day. I want to be in a classroom & learn from you. Thank you for everything you do for the children & all of the care that you put into everything you do." },
      { name: "E.", role: "Coworker", avatar: "tomato", date: "2025-12",
        text: "I see the love & passion you pour into every interaction, provocation, and plant that has come into [Dot to Dot]; it's truly magical. Grateful to have you a part of our community!" },
      { name: "N.", role: "Coworker & friend", avatar: "silly", date: "2025-12",
        text: "Something I always admire about you is the strength you carry at your core. You are so strong, caring, and thoughtful. … Your heart is a gift to everyone you come in contact with. … You deeply inspire me to be a better giving human." },
      { name: "M.", role: "Coworker", avatar: "mystery", date: "2025-12",
        text: "Your contributions to [Dot to Dot] have been and will continue to inspire us, grow us and move us in the direction of our collective vision! Thank you for your partnership as an educator/mentor/friend. … Thank you for the life you bring into our outdoors. … You are a beautiful soul and I'm blessed to have you on our team. Cheers to love, to light, to magic and this beautiful gift we call life ♥" },
      // School newsletter shout-out (date is a guess: Longfellow garden classes, 2025–26 school year)
      { name: "Anonymous", role: "School newsletter shout-out", avatar: "sprout", date: "2026",
        text: "Huge thanks to Ms. Yvy! Your gardening classes are a highlight for so many students. Thank you for sharing your passion for nature and for your patience in helping every little 'seedling' thrive. Our school is a much brighter (and greener!) place because of you!" },
      // Thank-you texts after a babysitting weekend (two parents in a group chat)
      { name: "L.A. & family", role: "Parents (babysitting)", avatar: "heart", date: "2026-10-04",
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
