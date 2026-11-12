/*
 * ✿ Plant pages ✿  (plants/<plant>/; the QR codes on Yvy's "Who's That…?" garden posters open these)
 * One entry per plant. plants/plants.js builds plants/<plant>/index.html from it, the coloring page
 * from coloring, and posters/ (kept off the site) reads poster for the sign.
 * Keep it kid-friendly and scientifically right. Times are for San Diego (our garden).
 * No Pokémon names or art on these pages: they're public, and the cards belong to Nintendo.
 * To add a plant: copy plants/pumpkin/ to plants/<id>/, change data-plant in both pages, add it here.
 */
window.YVY_PLANTS = {
  pumpkin: {
    name: "Pumpkin",
    sci: "Cucurbita pepo",
    family: "Gourd family (Cucurbitaceae): cousins of squash, zucchini, cucumbers and melons",
    number: "024",
    type: "Fruit (vining plant)",
    season: "Summer – Fall",
    quick: [
      ["🌞", "Full sun", "6–8+ hours a day"],
      ["📅", "90–120 days", "from seed to pumpkin"],
      ["💧", "Deep water", "about 1 inch a week"],
      ["📏", "Long vines", "10–20 feet!"],
    ],
    art: "../art/pumpkin-plant.svg",

    parts: [
      { icon: "🟫", name: "Roots", text: "A main root plus lots of thin roots spreading out wide just under the soil to drink water. The vine can even grow extra roots where it touches the ground." },
      { icon: "🌿", name: "Vine (stem)", text: "Long and creeping, covered in prickly little hairs. It carries water up from the roots, and food from the leaves out to the pumpkins." },
      { icon: "🍃", name: "Leaves", text: "Big, rough and prickly. They catch sunlight to make the plant's food (photosynthesis) and shade the soil so it stays damp." },
      { icon: "➰", name: "Tendrils", text: "Curly green springs that wrap around anything they touch, holding the vine steady in the wind." },
      { icon: "🌼", name: "Male flowers", text: "They open first, up high on long, thin stalks. The middle (the stamens) is covered in sticky yellow pollen." },
      { icon: "🌸", name: "Female flowers", text: "They sit low on short stalks with a tiny baby pumpkin underneath. The sticky middle (the stigma) is where pollen needs to land." },
      { icon: "🎃", name: "Pumpkin (the fruit)", text: "The baby pumpkin, all grown up! It grew from a flower and holds seeds, so scientists call it a fruit: a kind of berry called a pepo." },
      { icon: "🌰", name: "Seeds", text: "Hundreds of seeds sit inside in stringy pulp. Each one could grow a whole new pumpkin plant. Roasted, they make a crunchy snack." },
    ],

    pollination: {
      steps: [
        { icon: "🌅", text: "Pumpkin flowers open at sunrise and close by about lunchtime, and each one only opens for one day. Pollinators have to be early!" },
        { icon: "🌼", text: "A bee visits a male flower for its sweet nectar and gets dusted with big, sticky pollen grains." },
        { icon: "🐝", text: "Then it visits a female flower, and the pollen rubs off onto the stigma in the middle." },
        { icon: "🎃", text: "The baby pumpkin starts to grow! It takes lots of visits, because every seed needs its own grain of pollen." },
        { icon: "🥀", text: "No pollen? The baby pumpkin turns yellow, shrivels and falls off." },
      ],
      fact: { title: "Meet the squash bee", text: "Squash bees only visit squash and pumpkin flowers. They wake up before honeybees do, and the boys even sleep inside the closed flowers at night! Bumblebees and honeybees help too." },
      hand: { title: "Be the bee! (with a grown-up)", steps: [
        "Go out early in the morning, while the flowers are open.",
        "Find a female flower: look for the tiny pumpkin under the petals.",
        "Pick a male flower and gently pull its petals back, or use a small paintbrush or cotton swab.",
        "Dab the pollen all over the middle of the female flower.",
        "Check back in a few days. Is the baby pumpkin getting bigger?",
      ] },
    },

    grow: [
      { icon: "📅", title: "When to plant", text: "In San Diego, plant seeds from May to early July, once the soil is warm (about 65 °F). For Halloween pumpkins, plant in late May or June." },
      { icon: "🌞", title: "Where", text: "Full sun and lots of room: each plant's vines can spread 10 to 20 feet. Small kinds can climb a strong fence or trellis." },
      { icon: "🪱", title: "Soil", text: "Loose soil mixed with lots of compost. Pumpkins are hungry plants!" },
      { icon: "🌱", title: "Planting", text: "Make a low mound of soil. Push 3 or 4 seeds about 1 inch deep. When they have a few real leaves, keep the strongest 1 or 2 plants." },
      { icon: "💧", title: "Water", text: "Water deeply at the base, about 1 inch a week (more when it's hot). Keep the leaves dry to help stop powdery mildew, a white dust on the leaves." },
      { icon: "🌾", title: "Mulch", text: "Spread straw around the plants to keep the soil damp and keep the pumpkins off wet dirt." },
      { icon: "🔍", title: "Watch for", text: "Squash bugs: gray bugs that lay little bronze eggs under the leaves. Check under leaves and squish the eggs." },
      { icon: "✂️", title: "Harvest", text: "When the color is deep all over, the skin is hard (your fingernail won't dent it) and the stem is dry and corky. Cut it off with clippers, leaving 3 to 4 inches of stem. Never carry a pumpkin by its stem!" },
      { icon: "☀️", title: "Cure it", text: "Let it sit somewhere warm, dry and sunny for about 10 days. The skin gets tougher and the pumpkin keeps for months." },
    ],

    facts: [
      "A pumpkin is about 90% water.",
      "People in Mexico started growing squash like this about 10,000 years ago, one of the very first crops ever.",
      "Many Native American nations grow the Three Sisters together: corn, beans and squash, each helping the others.",
      "Even big pumpkins float! They're hollow inside, with lots of air.",
      "You can eat the flowers, the seeds, the young leaves and, of course, the pumpkin.",
    ],

    activities: [
      { icon: "🔢", title: "Seed count", text: "Guess how many seeds are inside a pumpkin. Scoop them out and count them in groups of 10. Was your guess close? (Most have a few hundred.)" },
      { icon: "🕵️", title: "Flower detectives", text: "Find a male and a female flower in the garden. How can you tell them apart? Hint: look underneath!" },
      { icon: "🐝", title: "Be the bee", text: "Hand-pollinate a female flower with a grown-up (see Pollination). Check on it every few days." },
      { icon: "📏", title: "Measure it", text: "Wrap a string around a growing pumpkin's middle once a week and measure the string. Make a chart. How much does it grow?" },
      { icon: "🛁", title: "Sink or float?", text: "Guess, then try it in a big tub of water. Then guess for a slice, and a seed." },
      { icon: "🖍️", title: "Color the parts", text: "Print the coloring page and color every part of the pumpkin plant." },
    ],

    coloring: { page: "coloring.html", pdf: "pumpkin-coloring-page.pdf",
      text: "Print the pumpkin plant and color in every part: roots, vine, leaves, tendrils, both kinds of flowers and the pumpkin!",
      foot: "Color every part! Can you find the tiny baby pumpkin?" },

    // A trading card kids print, cut out and fold (card.html). The creature is an original character
    // (art made with AI for YvyGrounds), not anyone's Pokémon. Balanced like the Gardenbound crop
    // cards (cards/cards-data.js): hp + damage + 10 per move with an effect = 110.
    card: {
      page: "card.html", pdf: "pumpkling-card.pdf",
      name: "Pumpkling", art: "../art/pumpkling.jpg", artHd: "../art/pumpkling-hd.jpg", alt: "Pumpkling, a little pumpkin creature with a squash bee", hp: 70, type: "Vine", kind: "Pumpkin sprout",
      moves: [
        { name: "Squash Bee Buddy", dmg: 0, effect: true, text: "At sunrise, a squash bee visits its flower. Heal 20 HP." },
        { name: "Seed Scatter", dmg: 30, text: "Pops open and scatters hundreds of seeds everywhere!" },
      ],
      flavor: "Its flowers open at sunrise and close by lunchtime. Scientists say it's a fruit: a kind of berry!",
      size: "Vine: up to 20 ft · Seeds: about 500",
      weakness: "Powdery mildew", resist: "Hot summer days",
    },

    // For the poster (posters/, kept off the site): the info box's four ruled lines, in order.
    // Lines 1–3 fit about 34 characters; line 4 is short (about 18), because the QR code sits beside it.
    poster: {
      lines: [
        "A big, round fruit that grows",
        "on a long, sprawling vine.",
        "Squash bees love its flowers!",
        "Botanically a fruit!",
      ],
    },
  },

  // Not a plant, but a garden friend: the poster pairs it with a spider card. labels swaps the plant
  // section titles (pollination → how it builds a web, grow → garden helper).
  "garden-spider": {
    name: "Garden Spider",
    sci: "Argiope argentata",
    family: "The silver argiope: a silvery orb weaver that lives in sunny San Diego gardens and canyons (orb-weaver family, Araneidae)",
    number: "025",
    type: "Not a plant: an arachnid!",
    season: "Summer – Fall",
    quick: [
      ["🕷️", "8 legs", "an arachnid, not an insect"],
      ["☀️", "Day shift", "sits in its web all day"],
      ["✖️", "Zigzag X", "decorates its web with silk"],
      ["🤲", "Gentle", "look, don't touch"],
    ],
    art: "../art/garden-spider.svg",
    labels: {
      parts: { icon: "🕷️", nav: "Parts", title: "Parts of a Garden Spider" },
      pollination: { icon: "🕸️", nav: "Web building", title: "How a Spider Builds Its Web" },
      grow: { icon: "🌻", nav: "Garden helper", title: "A Helper in the Garden" },
    },

    parts: [
      { icon: "⚪", name: "Cephalothorax", text: "The front part of the body: head and chest joined together, covered in shiny silver hairs. The legs, eyes and mouth are all attached here." },
      { icon: "🔶", name: "Abdomen", text: "Silvery white in front with tiny dimples. At the back it has bumpy lobes, dark brown speckled with gold, with white stripes between them. It holds the silk glands, the heart and, in a mother spider, her eggs." },
      { icon: "🦵", name: "8 legs", text: "Silvery gray with black bands, and orange-brown near the body, with seven parts each and tiny hairs that feel the smallest wiggle in the web. It holds them together in pairs, making an X. Insects only have 6 legs!" },
      { icon: "👀", name: "Eyes", text: "Most spiders have 8 eyes, but orb weavers can't see very well. They 'see' with their feet, by feeling the web shake." },
      { icon: "🦷", name: "Fangs", text: "Two small fangs (chelicerae) for catching food. Garden spiders are gentle and almost never bite people." },
      { icon: "✋", name: "Pedipalps", text: "Two short 'feelers' next to the mouth, for touching, tasting and holding food." },
      { icon: "🧵", name: "Spinnerets", text: "Little nozzles at the tip of the abdomen that squeeze out silk. A spider can make several different kinds of silk." },
      { icon: "🕸️", name: "The web", text: "Spokes run out from the middle like a bicycle wheel, and a sticky spiral goes round and round to catch flying insects." },
      { icon: "〰️", name: "Zigzag silk", text: "Thick zigzag ribbons of white silk in an X (scientists call it a stabilimentum). Nobody knows for sure why: maybe to warn birds not to fly through, or to lure in insects." },
    ],

    // (shown in the "pollination" spot, titled by labels)
    pollination: {
      steps: [
        { icon: "🌬️", text: "Often early in the morning, the spider lets a silk thread float away on the breeze until it sticks to something. That's the bridge line." },
        { icon: "🔺", text: "It walks across and adds a Y shape and an outside frame, like the edges of a picture." },
        { icon: "☸️", text: "It adds spokes from the middle out to the frame, like a bicycle wheel." },
        { icon: "🌀", text: "It lays a temporary spiral to walk on, then replaces it with a sticky spiral, from the outside in." },
        { icon: "〰️", text: "It weaves zigzag ribbons of silk across the middle in an X." },
        { icon: "🪰", text: "Then it sits head-down in the center, legs lined up along the X, and feels for a bug shaking the web. Dinner!" },
      ],
      fact: { icon: "💪", title: "Super silk", text: "Ounce for ounce, spider silk is stronger than steel, and it stretches without snapping. When a web gets torn up, the spider eats the old silk to recycle it and spins a fresh web, in about an hour." },
      hand: { icon: "🔍", title: "Web watch (look, don't touch!)", steps: [
        "Go out early in the morning, when dew makes the webs sparkle.",
        "No dew? Ask a grown-up to mist a web very gently with a spray bottle.",
        "Count the spokes. Then count the rings of the spiral.",
        "Can you find the zigzag X? Are the spider's legs lined up on it?",
        "Draw the web. Don't break it: the spider worked hard!",
      ] },
    },

    // (shown in the "grow" spot, titled by labels)
    grow: [
      { icon: "🍽️", title: "What it eats", text: "Flies, moths, grasshoppers, gnats and other flying and jumping insects, including pests that nibble our plants." },
      { icon: "📍", title: "Where to look", text: "In sunny spots between shrubs, tall flowers and fences, about knee to waist high. Look for the white zigzag X first!" },
      { icon: "☀️", title: "Day hunter", text: "It sits right in the middle of its web in broad daylight. Bother it and it may shake the web so hard it turns into a blur!" },
      { icon: "🌱", title: "How to help spiders", text: "Don't spray bug poison, leave some tall plants and mulch, and walk around webs instead of through them." },
      { icon: "🥚", title: "Life cycle", text: "The mother wraps her eggs in a silky sac and hangs it near her web. Tiny spiderlings hatch and float away on silk threads ('ballooning'). The boys stay tiny: only about a quarter of a mom's size." },
      { icon: "🐞", title: "Spider or insect?", text: "Insects have 6 legs, 3 body parts, antennae and often wings. Spiders have 8 legs, 2 body parts, and no antennae or wings." },
      { icon: "🤲", title: "Stay safe", text: "Garden spiders are shy and gentle. Look closely but don't touch, and tell a grown-up if anyone gets bitten." },
    ],

    facts: [
      "Spiders aren't insects. They're arachnids, like scorpions and ticks.",
      "Baby spiders can travel for miles by floating on silk threads in the wind. It's called ballooning.",
      "The silver argiope lives from the southern United States all the way down to South America.",
      "Spiders live on every continent except Antarctica.",
      "A spider's legs are moved partly by pumping fluid into them, a bit like a water balloon.",
    ],

    activities: [
      { icon: "💧", title: "Dewy web hunt", text: "On a misty morning, see how many webs you can find in the garden. Which plant has the most?" },
      { icon: "✖️", title: "Find the X", text: "Look for webs with zigzag silk. Is it a full X, or just one or two arms? Draw what you see." },
      { icon: "🐜", title: "Spider or insect?", text: "Find small critters in the garden (look, don't grab!) and sort them: 8 legs or 6 legs?" },
      { icon: "🧶", title: "Be the spider", text: "With yarn, make a giant web between chairs: bridge line, frame, spokes, then the spiral." },
      { icon: "✏️", title: "Draw a web", text: "Draw the spokes first, then the spiral from the outside in, just like a real spider." },
      { icon: "🖍️", title: "Color the parts", text: "Print the coloring page and color every part of the spider and its web." },
    ],

    coloring: { page: "coloring.html", pdf: "garden-spider-coloring-page.pdf",
      text: "Print the garden spider in its web and color every part: its silvery body, striped legs, eyes, fangs, the zigzag silk, and its lunch!",
      foot: "Color every part! How many legs did you color?" },

    // The printable fold-over card (card.html) and print-shop proxies (proxies/): Argie is an original
    // character (art made with AI for YvyGrounds), not anyone's Pokémon. Balanced like Pumpkling: 110.
    card: {
      page: "card.html", pdf: "argie-card.pdf",
      name: "Argie", art: "../art/argie.jpg", artHd: "../art/argie-hd.jpg", hp: 60, type: "Silk", kind: "Garden spider",
      alt: "Argie, a little silver spider with striped legs in its zigzag web",
      moves: [
        { name: "Zigzag X", dmg: 0, effect: true, text: "Weaves zigzag silk across its web. Birds see it and swerve: the next attack misses." },
        { name: "Web Shake", dmg: 40, text: "Shakes its web so fast it turns into a silvery blur!" },
      ],
      flavor: "It sits head-down in its web all day, holding its eight legs in pairs to make an X.",
      size: "Legs out: about 2 in · Eyes: 8",
      weakness: "Hungry birds", resist: "Wind (its web bends, not breaks)",
    },

    // For the poster (posters/): the template with a spider-web bottom, and the info box's four ruled lines
    poster: {
      template: "art/template-spider.jpg",
      lines: [
        "Sits head-down in its web all day,",
        "legs held in pairs to make an X.",
        "Weaves zigzag silk ribbons!",
        "Not an insect!",
      ],
    },
  },
  honeybee: {
    name: "Honeybee",
    sci: "Apis mellifera",
    family: "The western honeybee: a hard-working pollinator that lives in big families called colonies (bee family, Apidae)",
    number: "026",
    type: "Not a plant: an insect!",
    season: "All year (busiest in spring)",
    quick: [
      ["🐝", "6 legs", "3 body parts: an insect"],
      ["🌼", "Pollinator", "carries pollen flower to flower"],
      ["💃", "Waggle dance", "tells friends where food is"],
      ["🤲", "Gentle", "stay calm, don't swat"],
    ],
    art: "../art/honeybee.svg",
    labels: {
      parts: { icon: "🐝", nav: "Parts", title: "Parts of a Honeybee" },
      pollination: { icon: "🌼", nav: "Pollination", title: "How Bees Pollinate Flowers" },
      grow: { icon: "🍯", nav: "Bee garden", title: "Bees in the Garden" },
    },

    parts: [
      { icon: "🟤", name: "Head", text: "Holds the eyes, antennae and mouth. A bee's brain is smaller than a sesame seed, but she can learn and remember which flowers have food." },
      { icon: "📡", name: "Antennae", text: "Two bendy feelers with an elbow in the middle. Bees smell and touch with them, and can smell flowers from far away." },
      { icon: "👀", name: "Compound eyes", text: "Two big eyes made of thousands of tiny lenses. Bees see ultraviolet light, which makes hidden patterns on flowers glow, but they can't see the color red." },
      { icon: "⚫", name: "Simple eyes", text: "Three tiny eyes (ocelli) on top of the head. They sense light and help the bee fly straight." },
      { icon: "🦷", name: "Mandibles", text: "Jaws for biting, carrying, and shaping wax to build honeycomb." },
      { icon: "🥤", name: "Proboscis", text: "A long, hairy tongue that works like a straw to sip nectar and water. It folds up underneath when she's not using it." },
      { icon: "🟡", name: "Thorax", text: "The fuzzy middle part, packed with flying muscles. All 6 legs and 4 wings are attached here. Pollen sticks to its fuzzy hairs." },
      { icon: "🪽", name: "4 wings", text: "On each side, the front and back wings hook together with tiny hooks so they flap as one. They beat about 200 times a second: that's the buzz!" },
      { icon: "🦵", name: "6 legs", text: "Six legs with little combs and brushes for cleaning pollen off her body. Bees can even taste with their feet!" },
      { icon: "🟠", name: "Pollen baskets", text: "A smooth spot on each back leg, ringed with stiff hairs (the corbicula). She packs pollen there in two bright balls to carry home." },
      { icon: "🐝", name: "Abdomen", text: "The striped back part. Inside is a honey stomach for carrying nectar, and glands that make wax." },
      { icon: "📍", name: "Stinger", text: "Only female bees have one, to guard the hive. A worker's stinger is barbed, so if she stings a person she dies. Bees don't want to sting!" },
    ],

    // (shown in the "pollination" spot, titled by labels)
    pollination: {
      steps: [
        { icon: "🌸", text: "A worker bee lands on a flower and sips sweet nectar with her proboscis." },
        { icon: "✨", text: "Dusty pollen sticks to her fuzzy body hairs." },
        { icon: "🧹", text: "She brushes the pollen down with her legs and packs it into the baskets on her back legs." },
        { icon: "🌼", text: "At the next flower of the same kind, some pollen rubs off onto its stigma. That's pollination: now the flower can make seeds and fruit!" },
        { icon: "🏠", text: "Back at the hive, she passes the nectar to other bees. They fan it with their wings until it thickens into honey." },
        { icon: "💃", text: "Found lots of flowers? She does a waggle dance. Which way she wiggles, and for how long, tells the others where to fly." },
      ],
      fact: { icon: "🍎", title: "Thank a bee", text: "About one out of every three bites of food we eat comes from plants that need pollinators like bees: apples, almonds, berries, squash, pumpkins and more." },
      hand: { icon: "🖌️", title: "Be a bee (no stinger needed!)", steps: [
        "Find two flowers of the same kind, like squash or sunflowers.",
        "Gently roll a cotton swab or a small paintbrush in the middle of the first flower to pick up yellow pollen.",
        "Dab the pollen onto the middle of the second flower.",
        "Look closely: is pollen sticking to your swab, like it sticks to a bee's fuzz?",
        "Watch the flower over the next few weeks. Did it make seeds or fruit?",
      ] },
    },

    // (shown in the "grow" spot, titled by labels)
    grow: [
      { icon: "🍯", title: "What bees eat", text: "Nectar (for energy, and to make honey) and pollen (for protein, to feed the babies). On hot days they need water too." },
      { icon: "🌿", title: "Plants bees love", text: "Lavender, rosemary, sage, sunflowers, California buckwheat, borage and fruit tree blossoms. Bees love blue, purple and yellow flowers." },
      { icon: "💧", title: "Bee water bar", text: "Put pebbles in a shallow dish of water so bees can land and drink without falling in." },
      { icon: "👑", title: "The colony", text: "One queen lays up to 1,500 eggs a day. Thousands of female worker bees do all the jobs. A few hundred boy bees (drones) don't work, and they can't sting." },
      { icon: "🧹", title: "Bee jobs", text: "A worker's job changes as she grows up: cleaner, nurse, wax builder, guard, and last of all forager, flying out for nectar and pollen." },
      { icon: "🥚", title: "Life cycle", text: "Egg → larva → pupa → adult, in about 21 days for a worker. In summer, a worker bee lives only about 6 weeks." },
      { icon: "🤲", title: "Stay safe", text: "Bees busy on flowers almost never sting. Stay calm and still, don't swat, and never go near a hive or a swarm: tell a grown-up instead." },
    ],

    facts: [
      "A worker bee makes only about 1/12 of a teaspoon of honey in her whole life.",
      "To make one pound of honey, bees visit about 2 million flowers.",
      "A colony can have 20,000 to 60,000 bees in the summer.",
      "Honeybees aren't from the Americas: settlers brought them from Europe in the 1600s. California has about 1,600 kinds of native bees too!",
      "Kept sealed, honey hardly ever spoils.",
    ],

    activities: [
      { icon: "🔍", title: "Bee watch", text: "Pick one plant and count how many bees visit in 5 minutes. Try a different color flower. Which do bees like best?" },
      { icon: "💃", title: "Waggle dance", text: "Hide a paper 'flower', then do a waggle dance to show a friend which way to go. Can they find it?" },
      { icon: "🖌️", title: "Be a pollinator", text: "Use a cotton swab to move pollen between squash flowers, just like a bee." },
      { icon: "🌻", title: "Plant for bees", text: "Plant lavender, sunflowers or buckwheat in a sunny spot and see who comes to visit." },
      { icon: "🔶", title: "Honeycomb shapes", text: "Draw a honeycomb of hexagons. Why do you think bees build six-sided cells?" },
      { icon: "🖍️", title: "Color the parts", text: "Print the coloring page and color every part of the honeybee." },
    ],

    coloring: { page: "coloring.html", pdf: "honeybee-coloring-page.pdf",
      text: "Print the honeybee and color every part: her stripes, four wings, six legs, pollen baskets, the honeycomb and the flowers!",
      foot: "Color every part! How many legs and wings did you color?" },

    // The printable fold-over card (card.html) and print-shop proxies (proxies/): Pollie is an original
    // character (art made with AI for YvyGrounds), not anyone's Pokémon. Balanced like Pumpkling: 110.
    card: {
      page: "card.html", pdf: "pollie-card.pdf",
      name: "Pollie", art: "../art/pollie.jpg", artHd: "../art/pollie-hd.jpg", hp: 60, type: "Pollen", kind: "Honeybee",
      alt: "Pollie, a fuzzy little honeybee with orange pollen on her legs, over a lavender patch",
      moves: [
        { name: "Waggle Dance", dmg: 0, effect: true, text: "Dances a figure eight to show her sisters the way: your next attack does 20 more damage." },
        { name: "Pollen Puff", dmg: 40, text: "Shakes a cloud of golden pollen all over the flowers!" },
      ],
      flavor: "She visits up to a hundred flowers on one trip, then dances to tell her sisters where to find them.",
      size: "About ½ in long · 4 wings",
      weakness: "Rainy days", resist: "Cold (the hive huddles to stay warm)",
    },

    // For the poster (posters/): the template with a bee-garden bottom, and the info box's four ruled lines
    poster: {
      template: "art/template-bee.jpg",
      lines: [
        "Sips nectar from flowers and",
        "carries pollen home on her legs.",
        "Dances to share flower spots!",
        "Makes honey!",
      ],
    },
  },
};
