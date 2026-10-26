/*
 * ✿ Gardenbound trading cards ✿  (cards/index.html; NOT shown on the live site, see _config.yml)
 * The crops, island hosts, Rabbit and Frog from Rabbit & Frog: Gardenbound, as trading cards
 * like the Critter of the Month cards. Their pictures (cards/art/) are the game's own 3D models,
 * painted with its watercolor look.
 *
 * BALANCE: power = hp + every move's dmg + 10 for each move with an extra effect (effect: true).
 * Each tier has the same power and the same stat total, so cards in a tier are a fair fight:
 *   crop:    power 110, stats 15  (★★)
 *   hero:    power 140, stats 19  (★★★★)   Rabbit and Frog on their own
 *   host:    power 140, stats 19  (★★★★)   about as strong as the critters (their average is ~136)
 *   legend:  power 200, stats 23  (★★★★★) Wallace, and Rabbit & Frog together
 * cards.js checks every card against this and lists it in the balance sheet at the bottom of the page.
 * stats are out of 5. anim is how the picture moves when a move is clicked (charge, flip, stomp,
 * glare, hug, hide, spin, chomp, loaf); fx is the emoji that flies around.
 */
window.YVY_CARDS = {
  tiers: {
    hero:   { power: 140, stats: 19, rarity: 4, banner: "★ Gardenbound Hero ★" },
    legend: { power: 200, stats: 23, rarity: 5, banner: "★ Legendary ★" },
    host:   { power: 140, stats: 19, rarity: 4, banner: "★ Island Host ★" },
    crop:   { power: 110, stats: 15, rarity: 2, banner: "★ Garden Crop ★" },
  },
  cards: [
    // ---------- Rabbit and Frog ----------
    { name: "Rabbit", tier: "hero", art: "hero-rabbit", hp: 80, type: "Gardener", kind: "Hero · Harvest Haven",
      moves: [
        { name: "Flower Bridge", dmg: 20, effect: true, anim: "spin", fx: "🌸", text: "Waves her staff and flowers fly into a bridge. Swap with a card on your bench." },
        { name: "Tree Shake", dmg: 30, anim: "stomp", fx: "🍎", text: "Shakes a fruit tree with both paws. The fruit lands on the opponent." },
      ],
      stats: { Kindness: 5, Gardening: 5, "Ear Height": 4, Speed: 3, Strength: 2 },
      weakness: "Sour lemons", resist: "Getting lost (she has the map)" },
    { name: "Frog", tier: "hero", art: "hero-frog", hp: 70, type: "Sidekick", kind: "Hero · Harvest Haven",
      moves: [
        { name: "Happy Hop", dmg: 20, effect: true, anim: "flip", fx: "💚", text: "Hops right over the attack. Dodge the next hit." },
        { name: "Scrap Toss", dmg: 40, anim: "charge", fx: "🥕", text: "Tosses the scraps into the compost pail. Bullseye, every time." },
      ],
      stats: { Hops: 5, Loyalty: 5, Cheer: 4, Speed: 4, Size: 1 },
      weakness: "Getting left behind", resist: "Getting wet" },
    { name: "Rabbit & Frog", tier: "legend", art: "legend-rabbit-frog", hp: 130, type: "Best Friends", kind: "Legendary duo · Harvest Haven",
      moves: [
        { name: "Friendship Feast", dmg: 20, effect: true, anim: "hug", fx: "💕", text: "They share the Rainbow Feast. Heal everyone on your side 20 HP." },
        { name: "Staff & Hop Combo", dmg: 40, anim: "spin", fx: "✨", text: "She waves her staff, he hops on her hat, and down comes a shower of flowers." },
      ],
      stats: { Teamwork: 5, Kindness: 5, Gardening: 5, Hops: 4, Speed: 4 },
      weakness: "Goodbyes", resist: "Storms (the Kraken helps them through)" },

    // ---------- Island hosts (in world map order) ----------
    { name: "Wallace the Worm", tier: "legend", art: "legend-wallace", hp: 120, type: "Compost Cowboy", kind: "Rot & Roll host · Compost Cove",
      moves: [
        { name: "Black Gold", dmg: 30, effect: true, anim: "hug", fx: "🤎", text: "Turns every scrap into rich, dark compost. Heal everyone on your side 20 HP." },
        { name: "Burrow Bash", dmg: 40, anim: "charge", fx: "💥", text: "Tunnels under the bed and pops up right where it hurts. Howdy, partner!" },
      ],
      stats: { Composting: 5, Charm: 5, Length: 5, "Soil Power": 5, Speed: 3 },
      weakness: "Citrus peels", resist: "Rotten food (that's lunch)" },
    { name: "Roly the Roly-Poly", tier: "host", art: "host-roly", hp: 90, type: "Shredder", kind: "Rot & Roll host · Hot Heap Hill",
      moves: [
        { name: "Roll Out", dmg: 40, anim: "charge", fx: "💨", text: "Curls into a ball and bowls the opponent right over." },
        { name: "Armor Ball", dmg: 0, effect: true, anim: "hide", fx: "🛡️", text: "Rolls up tight. Blocks the next attack." },
      ],
      stats: { Armor: 5, Rolling: 5, Munching: 4, Speed: 3, Height: 2 },
      weakness: "Dry air", resist: "Rotten logs (yum)" },
    { name: "Springy the Springtail", tier: "host", art: "host-springy", hp: 60, type: "Boing", kind: "Rot & Roll host · Black Gold Beach",
      moves: [
        { name: "BOING!", dmg: 40, effect: true, anim: "flip", fx: "💫", text: "Springs so high she lands behind the opponent. Dodge the next hit." },
        { name: "Tiny Nibbles", dmg: 30, anim: "chomp", fx: "🍄", text: "Munches the mold in the compost. A thousand tiny bites." },
      ],
      stats: { Bounce: 5, Energy: 5, Speed: 5, Volume: 3, Size: 1 },
      weakness: "Sitting still", resist: "Gravity" },
    { name: "Hazel the Squirrel", tier: "host", art: "host-hazel", hp: 80, type: "Stash", kind: "Blossom host · Sow Shore",
      moves: [
        { name: "Forgotten Seed", dmg: 0, effect: true, anim: "hide", fx: "🌱", text: "Buries a seed and forgets where. It sprouts! Heal 20 HP." },
        { name: "Cheek Barrage", dmg: 50, anim: "charge", fx: "🌰", text: "Throws everything she was keeping in her cheeks." },
      ],
      stats: { Planting: 5, Speed: 5, Fluff: 5, Cheeks: 3, Memory: 1 },
      weakness: "Remembering", resist: "Running out of seeds" },
    { name: "Digby the Mole", tier: "host", art: "host-digby", hp: 90, type: "Digger", kind: "Blossom host · Root-to-Fruit Rock",
      moves: [
        { name: "Tunnel Pop", dmg: 30, effect: true, anim: "hide", fx: "🕳️", text: "Digs under and pops up behind the opponent. Can't be blocked." },
        { name: "Dirt Toss", dmg: 10, anim: "stomp", fx: "🟤", text: "Kicks dirt everywhere. Mostly on himself." },
      ],
      stats: { Digging: 5, "Root Smarts": 5, Strength: 4, Snuggles: 4, Eyesight: 1 },
      weakness: "Bright sunlight", resist: "Getting lost underground" },
    { name: "Pip the Field Mouse", tier: "host", art: "host-pip", hp: 60, type: "Checklist", kind: "Blossom host · Sprout Springs",
      moves: [
        { name: "Check It Off", dmg: 30, effect: true, anim: "glare", fx: "✔️", text: "Checks the opponent off her list. They skip a turn." },
        { name: "Scurry", dmg: 40, anim: "charge", fx: "💨", text: "Too fast to see. Too small to catch." },
      ],
      stats: { Organized: 5, Speed: 5, Whiskers: 4, Pep: 4, Size: 1 },
      weakness: "Losing her list", resist: "Messy garden beds" },
    { name: "Zip the Hoverfly", tier: "host", art: "host-zip", hp: 60, type: "Not a Bee", kind: "Plant Pals host · Buddy Bay",
      moves: [
        { name: "Hover Dodge", dmg: 20, effect: true, anim: "flip", fx: "💨", text: "Hovers perfectly still, then zips aside. Dodge the next hit." },
        { name: "Aphid Patrol", dmg: 50, anim: "chomp", fx: "🐛", text: "Her babies gobble aphids by the hundred." },
      ],
      stats: { Hovering: 5, Speed: 5, Disguise: 5, Pollinating: 3, Stinger: 1 },
      weakness: "Being called a bee", resist: "Wind" },
    { name: "Bumble the Bumblebee", tier: "host", art: "host-bumble", hp: 80, type: "Buzz", kind: "Plant Pals host · Pollen Point",
      moves: [
        { name: "Buzz Pollination", dmg: 30, effect: true, anim: "spin", fx: "🌼", text: "Buzzes the pollen loose and every flower blooms. Heal 20 HP." },
        { name: "Fuzzy Bump", dmg: 20, anim: "charge", fx: "💛", text: "A soft, fuzzy bonk." },
      ],
      stats: { Fuzz: 5, Pollinating: 5, Buzz: 4, Speed: 3, Sweetness: 2 },
      weakness: "Pesticides", resist: "Cold mornings (she shivers to warm up)" },
    { name: "Dot the Ladybug", tier: "host", art: "host-dot", hp: 70, type: "Helper", kind: "Plant Pals host · Helper Harbor",
      moves: [
        { name: "Aphid Snack", dmg: 30, effect: true, anim: "chomp", fx: "🐞", text: "Gobbles an aphid off the leaf. Heal 20 HP." },
        { name: "Spot Flash", dmg: 30, anim: "glare", fx: "⚡", text: "Flashes her spots. Hungry birds say no thanks." },
      ],
      stats: { Appetite: 5, Spots: 5, Cuteness: 5, Speed: 2, Toughness: 2 },
      weakness: "Distractions (was that an aphid?!)", resist: "Hungry birds" },
    { name: "Barnaby the Pueo", tier: "host", art: "host-barnaby", hp: 80, type: "Record Keeper", kind: "Rotation Nation host · Family Farm",
      moves: [
        { name: "Night Swoop", dmg: 40, anim: "charge", fx: "🦉", text: "Silent wings. Nobody hears him coming." },
        { name: "Check the Records", dmg: 10, effect: true, anim: "glare", fx: "📖", text: "Looks it up in his notes. Block the opponent's next move." },
      ],
      stats: { Wisdom: 5, "Record Keeping": 5, "Night Vision": 4, Speed: 3, Fluff: 2 },
      weakness: "Messy notes", resist: "Surprises (he wrote them down)" },
    { name: "Rota the Tortoise", tier: "host", art: "host-rota", hp: 100, type: "Slow & Steady", kind: "Rotation Nation host · Rotation Reef",
      moves: [
        { name: "Crop Rotation", dmg: 10, effect: true, anim: "spin", fx: "🔄", text: "Everybody moves one bed over! Swap with a card on your bench." },
        { name: "Slooow Stomp", dmg: 20, anim: "stomp", fx: "💥", text: "Takes a whole turn to land. Worth the wait." },
      ],
      stats: { Patience: 5, Shell: 5, Wisdom: 5, Planning: 3, Speed: 1 },
      weakness: "Hurrying", resist: "The same crop in the same bed" },
    { name: "Hennah the Hen", tier: "host", art: "host-hennah", hp: 90, type: "Scratch", kind: "Rotation Nation host · Cover Crop Cape",
      moves: [
        { name: "Scratch Scratch", dmg: 30, anim: "stomp", fx: "🐾", text: "Scratches up the bed, bugs and all." },
        { name: "Clover Blanket", dmg: 10, effect: true, anim: "hug", fx: "🍀", text: "Tucks a cover crop over the soil. Block 20 of the next attack." },
      ],
      stats: { Scratching: 5, Clucking: 4, Feathers: 4, "Egg Power": 4, Speed: 2 },
      weakness: "Foxes", resist: "Bare soil" },
    { name: "The Tomato", tier: "host", art: "host-tomato", hp: 70, type: "Talking Plant", kind: "Whispering Grove host · Tomato Tangle",
      moves: [
        { name: "Vine Tangle", dmg: 20, effect: true, anim: "glare", fx: "🌿", text: "Wraps the opponent up in vines. They can't move next turn." },
        { name: "Tomato Toss", dmg: 40, anim: "charge", fx: "🍅", text: "Splat." },
      ],
      stats: { Juiciness: 5, Vines: 5, Chattiness: 4, Bravery: 4, Speed: 1 },
      weakness: "Hornworms", resist: "Hot summer days" },
    { name: "The Venus Flytrap", tier: "host", art: "host-flytrap", hp: 70, type: "Snap", kind: "Whispering Grove host · Flytrap Jungle",
      moves: [
        { name: "Snap Trap", dmg: 50, anim: "chomp", fx: "🪰", text: "SNAP! Got it." },
        { name: "Sweet Nectar", dmg: 10, effect: true, anim: "hug", fx: "🍯", text: "Smells so sweet the opponent wanders closer. They can't retreat." },
      ],
      stats: { Snap: 5, Thirst: 5, Patience: 4, Drama: 4, Speed: 1 },
      weakness: "Tap water (rainwater only, please)", resist: "Flies (yum)" },
    { name: "The Jack-o'-Lantern", tier: "host", art: "host-jack", hp: 90, type: "Spooky", kind: "Whispering Grove host · Pumpkin Hollow",
      moves: [
        { name: "Spooky Glow", dmg: 20, effect: true, anim: "glare", fx: "🕯️", text: "Lights up from the inside. The opponent is too spooked to attack." },
        { name: "Pumpkin Roll", dmg: 20, anim: "charge", fx: "🎃", text: "Scuttles over on his four curly vines." },
      ],
      stats: { Spookiness: 5, Glow: 5, Leafiness: 4, Sweetness: 3, Speed: 2 },
      weakness: "Yellow leaves (feed the soil!)", resist: "The dark" },

    // ---------- The 16 crops ----------
    { name: "Apple", tier: "crop", art: "crop-apple", hp: 60, type: "Crunch", kind: "Tree fruit",
      moves: [
        { name: "Fall From the Tree", dmg: 30, anim: "stomp", fx: "🍎", text: "Drops right on the opponent's head. Gravity does the rest." },
        { name: "An Apple a Day", dmg: 10, effect: true, anim: "hug", fx: "💚", text: "Keeps the doctor away. Heal 20 HP." },
      ],
      stats: { Crunch: 5, Shine: 4, Sweetness: 3, Juiciness: 2, Speed: 1 },
      weakness: "Codling moths", resist: "Being compared to oranges" },
    { name: "Asparagus", tier: "crop", art: "crop-asparagus", hp: 50, type: "Spear", kind: "Perennial stalk",
      moves: [
        { name: "Spear Rush", dmg: 40, anim: "charge", fx: "💨", text: "Shoots up through the soil overnight and pokes first." },
        { name: "Back Every Spring", dmg: 10, effect: true, anim: "hide", fx: "🌱", text: "Comes back from its roots: the first time it's knocked out, return with 20 HP." },
      ],
      stats: { Pointiness: 5, Patience: 4, Speed: 3, Toughness: 2, Fluff: 1 },
      weakness: "Asparagus beetles", resist: "Waiting (3 years until the first harvest)" },
    { name: "Banana", tier: "crop", art: "crop-banana", hp: 60, type: "Slippery", kind: "Tropical fruit",
      moves: [
        { name: "Peel Slip", dmg: 20, effect: true, anim: "flip", fx: "🍌", text: "The opponent slips on the peel and drops their next move." },
        { name: "Bunch Punch", dmg: 20, anim: "stomp", fx: "💥", text: "One bonk for every banana in the bunch. That's a lot of bananas." },
      ],
      stats: { Slipperiness: 5, Sweetness: 4, Curve: 4, Speed: 1, Toughness: 1 },
      weakness: "Cold snaps", resist: "Bruises (mostly)" },
    { name: "Blackberries", tier: "crop", art: "crop-blackberry", hp: 60, type: "Bramble", kind: "Cane berry",
      moves: [
        { name: "Thorny Tangle", dmg: 20, effect: true, anim: "glare", fx: "🌿", text: "The opponent gets caught in the canes and can't retreat." },
        { name: "Juice Stain", dmg: 20, anim: "chomp", fx: "💜", text: "Purple everywhere. It's never coming out." },
      ],
      stats: { Thorns: 5, Juiciness: 4, Sweetness: 3, Speed: 2, Patience: 1 },
      weakness: "Birds", resist: "Getting picked while red (not ripe yet!)" },
    { name: "Broccoli", tier: "crop", art: "crop-broccoli", hp: 70, type: "Tiny Tree", kind: "Brassica",
      moves: [
        { name: "Floret Shower", dmg: 30, anim: "spin", fx: "🥦", text: "Breaks into florets and they all attack at once." },
        { name: "Side Shoots", dmg: 0, effect: true, anim: "hug", fx: "🌱", text: "Cut the crown and little side heads grow back. Heal 20 HP." },
      ],
      stats: { Greenness: 5, Toughness: 4, Bushiness: 3, Sweetness: 2, Speed: 1 },
      weakness: "Cabbage worms", resist: "Kids who say they don't like it" },
    { name: "Cauliflower", tier: "crop", art: "crop-cauliflower", hp: 70, type: "Cloud", kind: "Brassica",
      moves: [
        { name: "Curd Slam", dmg: 30, anim: "stomp", fx: "💥", text: "A big, bumpy, snow-white body slam." },
        { name: "Leaf Blanket", dmg: 0, effect: true, anim: "hide", fx: "🍃", text: "Folds its leaves over its head. Blocks the next attack and stays snowy white." },
      ],
      stats: { Whiteness: 5, Bumpiness: 4, Toughness: 3, Shyness: 2, Speed: 1 },
      weakness: "Hot weather", resist: "Sunburn (thanks to its leaf blanket)" },
    { name: "Celery", tier: "crop", art: "crop-celery", hp: 50, type: "Stringy", kind: "Stalk",
      moves: [
        { name: "Stalk Smack", dmg: 30, anim: "charge", fx: "💥", text: "One big, crunchy whack." },
        { name: "Super Crunch", dmg: 20, effect: true, anim: "chomp", fx: "🔊", text: "So loud the opponent can't hear themselves think. They skip a turn." },
      ],
      stats: { Crunch: 5, Stringiness: 5, Thirst: 3, Speed: 1, Flavor: 1 },
      weakness: "Dry soil", resist: "Being called the boring snack" },
    { name: "ʻUala", tier: "crop", art: "crop-uala", hp: 70, type: "Hill", kind: "Root crop · sweet potato",
      moves: [
        { name: "Pull-Out Surprise", dmg: 30, anim: "flip", fx: "🍠", text: "Tug the vine and a whole family of sweet potatoes pops out of the hill." },
        { name: "Vine Creep", dmg: 0, effect: true, anim: "loaf", fx: "🌿", text: "Its vines cover the whole bed. The opponent can't play a new card next turn." },
      ],
      stats: { Sweetness: 4, Sneakiness: 4, Vines: 4, Toughness: 2, Speed: 1 },
      weakness: "Sweet potato weevils", resist: "Hot summers" },
    { name: "Kabocha", tier: "crop", art: "crop-kabocha", hp: 60, type: "Squash", kind: "Winter squash",
      moves: [
        { name: "Heavy Roll", dmg: 40, anim: "charge", fx: "💥", text: "Rolls off the vine and just keeps rolling." },
        { name: "Keeps All Winter", dmg: 0, effect: true, anim: "hide", fx: "❄️", text: "Sits in the pantry for months. Can't be knocked out this turn." },
      ],
      stats: { Toughness: 5, Sweetness: 4, Size: 4, Bumpiness: 1, Speed: 1 },
      weakness: "Squash bugs", resist: "Winter" },
    { name: "Garlic", tier: "crop", art: "crop-garlic", hp: 50, type: "Stinky", kind: "Allium",
      moves: [
        { name: "Garlic Breath", dmg: 30, anim: "glare", fx: "💨", text: "Nobody wants to get close. Not even vampires." },
        { name: "Clove Split", dmg: 20, effect: true, anim: "spin", fx: "🧄", text: "Splits into cloves, and every clove grows a whole new bulb. Heal 20 HP." },
      ],
      stats: { Stink: 5, Toughness: 4, Patience: 4, Speed: 1, Sweetness: 1 },
      weakness: "Soggy soil", resist: "Vampires" },
    { name: "Kalo", tier: "crop", art: "crop-kalo", hp: 70, type: "Pond", kind: "Root crop · taro",
      moves: [
        { name: "Pond Splash", dmg: 30, anim: "stomp", fx: "💦", text: "Stomps in its pond. Everybody gets soaked." },
        { name: "ʻOha Sprout", dmg: 0, effect: true, anim: "hug", fx: "🌱", text: "A little side sprout grows up beside it. Heal 20 HP." },
      ],
      stats: { Leafiness: 5, Wetness: 5, Toughness: 3, Speed: 1, Sweetness: 1 },
      weakness: "Dry ground", resist: "Wet feet (it loves them)" },
    { name: "Peach", tier: "crop", art: "crop-peach", hp: 60, type: "Fuzzy", kind: "Tree fruit",
      moves: [
        { name: "Fuzz Tickle", dmg: 20, effect: true, anim: "flip", fx: "✨", text: "So fuzzy the opponent giggles. Their next attack does 10 less." },
        { name: "Pit Toss", dmg: 20, anim: "charge", fx: "🍑", text: "Throws its pit. Watch out, it's hard!" },
      ],
      stats: { Fuzz: 5, Sweetness: 5, Juiciness: 3, Speed: 1, Toughness: 1 },
      weakness: "Late frost", resist: "Bad moods" },
    { name: "Raspberries", tier: "crop", art: "crop-raspberry", hp: 50, type: "Thimble", kind: "Cane berry",
      moves: [
        { name: "Thimble Helmet", dmg: 10, effect: true, anim: "hide", fx: "⛑️", text: "Hops off its core and wears it like a helmet. Block 20 of the next attack." },
        { name: "Drupelet Burst", dmg: 40, anim: "spin", fx: "💥", text: "Every tiny bead bursts at once." },
      ],
      stats: { Juiciness: 5, Sweetness: 4, Thorns: 3, Speed: 2, Toughness: 1 },
      weakness: "Rain at picking time", resist: "Being mistaken for blackberries" },
    { name: "Rye", tier: "crop", art: "crop-rye", hp: 60, type: "Grain", kind: "Cereal · cover crop",
      moves: [
        { name: "Awn Poke", dmg: 20, anim: "charge", fx: "🌾", text: "Long, whiskery awns. Pokey!" },
        { name: "Deep Roots", dmg: 20, effect: true, anim: "loaf", fx: "🟫", text: "Holds the soil together. Can't be pushed out of the bed this turn." },
      ],
      stats: { Toughness: 5, Height: 4, Roots: 4, Speed: 1, Fluff: 1 },
      weakness: "A wet harvest", resist: "Cold (it grows all winter)" },
    { name: "Wheat", tier: "crop", art: "crop-wheat", hp: 60, type: "Grain", kind: "Cereal",
      moves: [
        { name: "Threshing Spin", dmg: 30, anim: "spin", fx: "🌾", text: "Spins until the grains fly out of their husks." },
        { name: "Breadbasket", dmg: 10, effect: true, anim: "hug", fx: "🍞", text: "Feeds the whole team. Heal everyone on your side 10 HP." },
      ],
      stats: { Heartiness: 4, Height: 4, "Golden Glow": 4, Toughness: 2, Speed: 1 },
      weakness: "Rust (the fungus)", resist: "Being left out of sandwiches" },
    { name: "White Onion", tier: "crop", art: "crop-white-onion", hp: 60, type: "Teary", kind: "Allium",
      moves: [
        { name: "Make 'Em Cry", dmg: 20, effect: true, anim: "glare", fx: "😭", text: "The opponent's eyes water so much they miss their next move." },
        { name: "Layer Peel", dmg: 20, anim: "spin", fx: "🧅", text: "Peels off a layer and throws it. It has more layers. Lots more." },
      ],
      stats: { Layers: 5, Stink: 4, Toughness: 3, Sweetness: 2, Speed: 1 },
      weakness: "Onion thrips", resist: "Getting chopped without a fight" },
  ],
};
