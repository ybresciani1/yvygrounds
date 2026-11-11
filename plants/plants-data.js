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

    coloring: { page: "coloring.html", pdf: "pumpkin-coloring-page.pdf" },

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
};
