/*
 * 🥚 Egg Catch: a tiny YvyGrounds arcade game.
 * Riot and Beyonce strut along the coop roof and drop eggs. Slide the basket
 * to catch them! Golden eggs are worth extra and mend a crack; rotten eggs
 * are a stinky trap. Three cracked eggs and it's scrambled.
 *
 * Plain canvas, no libraries. Everything is drawn on a 320x240 "pixel" grid
 * and scaled up K times so it stays crisp.
 */
(function () {
  "use strict";

  const W = 320, H = 240, K = 3;
  const MAX_CRACKS = 3;
  const BEST_KEY = "yvy-egg-best";
  const MUTE_KEY = "yvy-arcade-muted";

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const muteBtn = document.getElementById("mute");
  const menu = document.getElementById("menu");
  const overMenu = document.getElementById("overMenu");
  const embedded = window.self !== window.top;
  if (embedded) document.body.classList.add("embedded");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage blocked */ } },
  };
  const lerp = (a, b, t) => a + (b - a) * Math.min(1, Math.max(0, t));
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (list) => list[Math.floor(Math.random() * list.length)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  if (document.fonts) {
    document.fonts.load('8px "Press Start 2P"');
    document.fonts.load('40px "Chewy"');
  }

  /* ---------- Pixel sprites (letter grids, like js/pixels.js) ---------- */
  const ART = {
    // Polish chicken: the pom-pom crest covers her eyes (very accurate)
    chicken: {
      colors: { C: "#fbe7c2", W: "#f3d59f", G: "#d9b278", K: "#2b1a52", Y: "#ffb62e", R: "#ff4d6d" },
      grid: [
        "...CCCCCC...",
        "..CCCCCCCC..",
        "..CCCCCCCC..",
        "..WCCCCCCW..",
        "..WKWWWWKW..",
        "..WWWYYWWW..",
        ".WWWWYYWWWW.",
        ".WWWWRRWWWW.",
        "WWWWWWWWWWWW",
        "WGWWWWWWWWGW",
        "WGGWWWWWWGGW",
        ".WWWWWWWWWW.",
      ],
    },
    egg: {
      colors: { K: "#2b1a52", E: "#fff8e4", H: "#ffffff", S: "#e6cfa6" },
      grid: [
        "..KKK..",
        ".KHEEK.",
        "KHEEEEK",
        "KHEEEEK",
        "KEEEEEK",
        "KEEEESK",
        "KEEESSK",
        ".KESSK.",
        "..KKK..",
      ],
    },
    rotten: {
      colors: { K: "#2b1a52", E: "#b5c46a", H: "#dfe8a8", S: "#7f8f3e", D: "#5d6a2c" },
      grid: [
        "..KKK..",
        ".KHEEK.",
        "KHEDEEK",
        "KEEEEDK",
        "KEDEEEK",
        "KEEEDSK",
        "KEEESSK",
        ".KDSSK.",
        "..KKK..",
      ],
    },
    basket: {
      colors: { K: "#2b1a52", L: "#e8a96b", B: "#c8834f", D: "#8a5230" },
      grid: [
        "KKKKKKKKKKKKKKKKKKKK",
        "KLLLLLLLLLLLLLLLLLLK",
        "KKKKKKKKKKKKKKKKKKKK",
        ".KBBDBBDBBDBBDBBDBK.",
        ".KBDBBDBBDBBDBBDBBK.",
        ".KDBBDBBDBBDBBDBBDK.",
        "..KBBDBBDBBDBBDBBK..",
        "..KBDBBDBBDBBDBBDK..",
        "...KKKKKKKKKKKKKK...",
      ],
    },
  };

  function bake(name, overrides) {
    const art = ART[name];
    const colors = Object.assign({}, art.colors, overrides);
    const c = document.createElement("canvas");
    c.width = art.grid[0].length;
    c.height = art.grid.length;
    const g = c.getContext("2d");
    art.grid.forEach((row, y) => [...row].forEach((ch, x) => {
      if (colors[ch]) { g.fillStyle = colors[ch]; g.fillRect(x, y, 1, 1); }
    }));
    return c;
  }

  const IMG = {
    riot: bake("chicken"),
    beyonce: bake("chicken", { C: "#f2c96b", W: "#e7a63c", G: "#9a5b1d" }),
    egg: bake("egg"),
    golden: bake("egg", { E: "#ffd23f", H: "#fff6c2", S: "#e09a12" }),
    rotten: bake("rotten"),
    basket: bake("basket"),
  };

  /* ---------- Coop layout ---------- */
  const RIDGE_Y = 52;           // the hens' feet are on the roof ridge
  const BASKET_Y = 206;         // top of the basket rim
  const BASKET_HALF = 20;       // basket is 40px wide
  const GROUND_Y = 230;         // eggs crack when they reach this
  const EGG_HALF_H = 9;         // eggs are 14x18, drawn from their center
  const KEY_SPEED = 250;        // px/s with the arrow keys
  const DRAG_SPEED = 560;       // px/s max when following a finger or mouse

  // Each hen keeps mostly to her own end of the roof (the chimney stops them on the right)
  const hens = [
    { name: "Riot", img: IMG.riot, min: 26, max: 190, phase: 0 },
    { name: "Beyonce", img: IMG.beyonce, min: 100, max: 266, phase: 1 },
  ];

  /* ---------- Sound (tiny WebAudio bleeps) ---------- */
  let actx = null;
  let noiseBuf = null;      // one second of noise, reused by every crack
  let muted = store.get(MUTE_KEY) === "1";
  function audio() {
    if (!actx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) actx = new AC({ latencyHint: "interactive" });
    }
    if (actx && actx.state === "suspended") actx.resume();
    return actx;
  }
  function tone(freq, freq2, dur, type, vol, delay) {
    if (muted) return;
    const a = audio();
    if (!a) return;
    const t = a.currentTime + (delay || 0);
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type || "square";
    o.frequency.setValueAtTime(freq, t);
    if (freq2) o.frequency.exponentialRampToValueAtTime(freq2, t + dur);
    g.gain.setValueAtTime(vol || 0.06, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(a.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  }
  function noise(dur, vol, cutoff) {
    if (muted) return;
    const a = audio();
    if (!a) return;
    if (!noiseBuf) {
      noiseBuf = a.createBuffer(1, a.sampleRate, a.sampleRate);
      const data = noiseBuf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    }
    const t = a.currentTime;
    const src = a.createBufferSource();
    const filter = a.createBiquadFilter();
    const g = a.createGain();
    src.buffer = noiseBuf;
    filter.type = "lowpass";
    filter.frequency.value = cutoff;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(filter).connect(g).connect(a.destination);
    src.start(t, Math.random() * (1 - dur), dur);
  }
  const SFX = {
    cluck: () => { tone(760, 560, 0.05, "square", 0.035); tone(640, 900, 0.07, "square", 0.035, 0.06); },
    plip: () => tone(300, 160, 0.06, "triangle", 0.06),
    catch: (n) => { const f = 520 + Math.min(n, 20) * 22; tone(f, f * 1.5, 0.08, "square", 0.05); },
    gold: () => [660, 880, 1320, 1760].forEach((f, i) => tone(f, 0, 0.1, "square", 0.05, i * 0.06)),
    crack: () => { noise(0.12, 0.3, 2400); tone(240, 90, 0.14, "square", 0.05); },
    splort: () => noise(0.18, 0.16, 600),
    yuck: () => { tone(160, 70, 0.35, "sawtooth", 0.06); noise(0.2, 0.12, 500); },
    go: () => tone(440, 880, 0.2, "square", 0.05),
    end: () => [392, 370, 349, 294].forEach((f, i) => tone(f, i === 3 ? 200 : 0, i === 3 ? 0.5 : 0.18, "triangle", 0.08, i * 0.2)),
  };
  function setMuted(on) {
    muted = on;
    store.set(MUTE_KEY, on ? "1" : "0");
    muteBtn.textContent = on ? "🔇" : "🔊";
    muteBtn.setAttribute("aria-pressed", String(on));
    muteBtn.setAttribute("aria-label", on ? "Turn sound on" : "Mute sound");
  }
  setMuted(muted);
  muteBtn.addEventListener("click", () => { setMuted(!muted); canvas.focus({ preventScroll: true }); });

  /* ---------- Game state ---------- */
  const RANKS = [
    [0, "Scrambled Rookie"], [100, "Egg Fumbler"], [250, "Basket Case"], [500, "Omelet Ace"],
    [850, "Sunny-Side Star"], [1300, "Yolk Legend"], [2000, "Supreme Egg Whisperer"],
  ];
  const HEADLINES = ["Scrambled!", "Oh, crack!", "Egg-splosion!"];
  let state = "title";          // title, ready, play, paused, over
  let stateT = 0;               // ms spent in the current state
  let score = 0, cracks = 0, streak = 0, elapsed = 0, layT = 0, lastHen = 1;
  let stats, newBest = false, headline = "", quip = "";
  let best = parseInt(store.get(BEST_KEY), 10) || 0;
  let shakeT = 0;
  const basket = { x: W / 2, target: null, bounce: 0, stink: 0 };
  const keys = { left: false, right: false };
  let dragging = false;
  const eggs = [];              // falling eggs
  const pile = [];              // the last few caught eggs, peeking out of the basket
  const bits = [];              // shell, yolk and sparkle particles
  const decals = [];            // splats on the grass
  const popups = [];            // floating "+10" text

  hens.forEach((h, i) => {
    h.x = i ? 220 : 90; h.tx = h.x; h.speed = 40; h.wait = rand(0, 600); h.lay = 0; h.kind = null;
  });

  function setState(s) { state = s; stateT = 0; }

  function startGame() {
    audio();
    score = 0; cracks = 0; streak = 0; elapsed = 0; layT = 700; newBest = false;
    stats = { caught: 0, golden: 0, stinky: 0, dodged: 0, bestStreak: 0 };
    basket.x = W / 2; basket.target = null; basket.bounce = 0; basket.stink = 0;
    eggs.length = pile.length = bits.length = decals.length = popups.length = 0;
    hens.forEach((h) => { h.lay = 0; h.kind = null; });
    menu.hidden = true;
    overMenu.hidden = true;
    canvas.focus({ preventScroll: true });
    setState("ready");
  }

  function endGame() {
    hens.forEach((h) => { h.lay = 0; h.kind = null; });
    eggs.forEach((e) => burst(e.x, e.y, 6, ["#fff8e4", "#ffffff"], 0.08));
    eggs.length = 0;
    if (score > best) { best = score; newBest = score > 0; store.set(BEST_KEY, String(best)); }
    headline = pick(HEADLINES);
    if (stats.caught === 0) quip = "Riot is filing a complaint.";
    else if (stats.stinky >= 2) quip = "Your basket smells like regret.";
    else if (stats.golden >= 3) quip = "Beyonce says you're solid gold.";
    else if (stats.bestStreak >= 30) quip = "Riot did a happy little strut!";
    else quip = pick(["Beyonce demands a rematch.", "That's breakfast sorted!", "Riot: \"bawk.\" (She's impressed.)"]);
    SFX.end();
    dragging = false;
    setState("over");
  }

  const progress = () => Math.min(1, elapsed / 120000);
  const mult = () => Math.min(4, 1 + Math.floor(streak / 10));
  const rankFor = (s) => RANKS.filter((r) => s >= r[0]).pop()[1];

  function eggKind() {
    const goldenOut = eggs.some((e) => e.kind === "golden") || hens.some((h) => h.kind === "golden");
    if (elapsed > 8000 && !goldenOut && Math.random() < 0.07) return "golden";
    if (elapsed > 12000 && Math.random() < lerp(0.06, 0.2, progress())) return "rotten";
    return "egg";
  }

  // A hen squats and wiggles for a moment (so you can see it coming), then the egg drops
  function startLay(h) {
    h.lay = lerp(430, 260, progress());
    h.kind = eggKind();
    SFX.cluck();
  }

  function dropEgg(h) {
    eggs.push({ x: h.x, y: RIDGE_Y + 2, vy: lerp(45, 110, progress()), kind: h.kind, hen: h });
    h.kind = null;
    h.wait = rand(100, 400);
    SFX.plip();
  }

  function popup(text, x, y, color) {
    popups.push({ text, x, y, t: 0, color: color || "#fff" });
  }

  function burst(x, y, n, colors, speed) {
    for (let i = 0; i < n; i++) {
      const a = rand(0, Math.PI * 2), v = rand(0.03, speed || 0.12);
      bits.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 0.06, life: 0, max: rand(350, 650), color: pick(colors), size: pick([1, 2, 2, 3]) });
    }
  }

  function addCrack() {
    cracks++;
    if (!reduceMotion) shakeT = 260;
    if (cracks >= MAX_CRACKS) endGame();
  }

  function catchEgg(e) {
    basket.bounce = 140;
    const y = BASKET_Y - 12;
    if (e.kind === "rotten") {
      stats.stinky++;
      streak = 0;
      basket.stink = 1800;
      SFX.yuck();
      burst(e.x, BASKET_Y, 14, ["#b5c46a", "#7f8f3e", "#5d6a2c"], 0.1);
      popup("EWW! ROTTEN!", e.x, y, "#d8e58a");
      addCrack();
      return;
    }
    streak++;
    stats.caught++;
    stats.bestStreak = Math.max(stats.bestStreak, streak);
    const m = mult();
    pile.push(e.kind);
    if (pile.length > 5) pile.shift();
    if (e.kind === "golden") {
      stats.golden++;
      score += 50 * m;
      SFX.gold();
      burst(e.x, BASKET_Y, 16, ["#ffd23f", "#fff6c2", "#ffffff"], 0.14);
      popup(m > 1 ? `+${50 * m} x${m}` : "+50", e.x, y, "#ffd23f");
      if (cracks > 0) { cracks--; popup("CRACK FIXED!", e.x, y - 12, "#ff8cc6"); }
    } else {
      score += 10 * m;
      SFX.catch(streak);
      burst(e.x, BASKET_Y, 6, ["#ffffff", "#fff8e4", "#ffd23f"], 0.07);
      popup(m > 1 ? `+${10 * m} x${m}` : "+10", e.x, y, m > 1 ? "#ff8cc6" : "#fff");
    }
    if (streak % 10 === 0 && m <= 4) popup(`STREAK x${m}!`, W / 2, 100, "#ff8cc6");
  }

  function landEgg(e) {
    decals.push({ x: e.x, y: GROUND_Y - 2, kind: e.kind, t: 0 });
    if (e.kind === "rotten") {
      stats.dodged++;
      SFX.splort();
      burst(e.x, GROUND_Y - 2, 10, ["#b5c46a", "#7f8f3e"], 0.07);
      popup("PHEW!", e.x, GROUND_Y - 18, "#d8e58a");
      return;
    }
    streak = 0;
    SFX.crack();
    burst(e.x, GROUND_Y - 3, 12, e.kind === "golden" ? ["#ffd23f", "#e09a12", "#ffb62e"] : ["#fff8e4", "#e6cfa6", "#ffb62e"], 0.1);
    popup("BAWK?!", e.hen.x, 84, "#ff8cc6");
    addCrack();
  }

  /* ---------- Update ---------- */
  function updateHens(dt) {
    const p = progress();
    hens.forEach((h) => {
      if (h.lay > 0) {
        h.lay -= dt;
        if (h.lay <= 0) { h.lay = 0; if (state === "play") dropEgg(h); else h.kind = null; }
        return;
      }
      if (h.wait > 0) { h.wait -= dt; return; }
      const d = h.tx - h.x;
      const step = (h.speed * dt) / 1000;
      if (Math.abs(d) <= step) {
        h.x = h.tx;
        h.wait = rand(150, 900);
        h.tx = rand(h.min, h.max);
        h.speed = rand(28, 55) * lerp(1, 1.8, p);
      } else {
        h.x += Math.sign(d) * step;
      }
    });
  }

  function layEggs(dt) {
    layT -= dt;
    if (layT > 0) return;
    const free = hens.filter((h) => h.lay <= 0);
    if (!free.length || eggs.length >= 5) { layT = 200; return; }
    // Take turns, mostly
    let h = free.find((x) => x !== hens[lastHen]) || free[0];
    if (free.length > 1 && Math.random() < 0.25) h = pick(free);
    lastHen = hens.indexOf(h);
    startLay(h);
    // Later on, both hens sometimes lay at once
    const other = hens.find((x) => x !== h && x.lay <= 0);
    if (other && elapsed > 45000 && Math.random() < lerp(0, 0.3, (elapsed - 45000) / 90000)) startLay(other);
    layT = lerp(1500, 560, progress()) * rand(0.85, 1.15);
  }

  function updateBasket(dt) {
    const dir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
    if (dir) {
      basket.x += (dir * KEY_SPEED * dt) / 1000;
    } else if (basket.target !== null) {
      const d = basket.target - basket.x;
      const step = (DRAG_SPEED * dt) / 1000;
      basket.x = Math.abs(d) <= step ? basket.target : basket.x + Math.sign(d) * step;
    }
    basket.x = clamp(basket.x, BASKET_HALF + 2, W - BASKET_HALF - 2);
    if (basket.bounce > 0) basket.bounce -= dt;
    if (basket.stink > 0) basket.stink -= dt;
  }

  function updateEggs(dt) {
    const g = lerp(60, 150, progress());
    const rim = BASKET_Y + 3;
    for (let i = eggs.length - 1; i >= 0; i--) {
      const e = eggs[i];
      const before = e.y + EGG_HALF_H;
      e.vy += (g * dt) / 1000;
      e.y += (e.vy * dt) / 1000;
      const bottom = e.y + EGG_HALF_H;
      if (before <= rim && bottom > rim && Math.abs(e.x - basket.x) <= BASKET_HALF + 4) {
        eggs.splice(i, 1);
        catchEgg(e);
      } else if (bottom >= GROUND_Y) {
        eggs.splice(i, 1);
        landEgg(e);
      }
      if (state !== "play") break; // the last crack ended the game
    }
  }

  function update(dt) {
    stateT += dt;
    if (state === "ready" && stateT >= 1100) { setState("play"); SFX.go(); }
    if (state === "ready" || state === "play") updateBasket(dt);
    if (state === "play") {
      elapsed += dt;
      layEggs(dt);
      updateEggs(dt);
    }
    updateHens(dt);
    if (state === "over" && stateT > 700 && overMenu.hidden) {
      overMenu.hidden = false;
      document.getElementById("again").focus({ preventScroll: true });
    }

    for (let i = bits.length - 1; i >= 0; i--) {
      const b = bits[i];
      b.life += dt;
      b.vy += 0.0005 * dt;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      if (b.life >= b.max) bits.splice(i, 1);
    }
    for (let i = decals.length - 1; i >= 0; i--) if ((decals[i].t += dt) > 1400) decals.splice(i, 1);
    for (let i = popups.length - 1; i >= 0; i--) if ((popups[i].t += dt) > 850) popups.splice(i, 1);
    if (shakeT > 0) shakeT -= dt;
  }

  /* ---------- Drawing ---------- */
  function text(str, x, y, o) {
    o = o || {};
    const size = o.size || 8;
    ctx.font = o.font === "logo" ? `${size}px "Chewy", "Comic Sans MS", cursive` : `${size}px "Press Start 2P", monospace`;
    ctx.textAlign = o.align || "center";
    ctx.textBaseline = "middle";
    if (o.outline !== false) {
      ctx.lineJoin = "round";
      ctx.lineWidth = o.ow || 2;
      ctx.strokeStyle = o.outline || "#2b1a52";
      ctx.strokeText(str, x, y);
    }
    ctx.fillStyle = o.color || "#fff";
    ctx.fillText(str, x, y);
  }

  function sprite(img, x, y, scale) {
    ctx.drawImage(img, Math.round(x), Math.round(y), img.width * scale, img.height * scale);
  }

  function panel(x, y, w, h) {
    ctx.fillStyle = "rgba(43, 26, 82, .35)";
    ctx.fillRect(x + 4, y + 4, w, h);
    ctx.fillStyle = "#fff8e4";
    ctx.strokeStyle = "#2b1a52";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(x, y, w, h, 12) : ctx.rect(x, y, w, h);
    ctx.fill();
    ctx.stroke();
  }

  // The sky + yard and the coop roof never change, so they're painted once into
  // their own layers; each frame just stamps them down with the clouds in between.
  function layer(paint) {
    const c = document.createElement("canvas");
    c.width = W * K;
    c.height = H * K;
    const g = c.getContext("2d");
    g.setTransform(K, 0, 0, K, 0, 0);
    paint(g);
    return c;
  }
  const SKY = layer((g) => {
    const sky = g.createLinearGradient(0, 20, 0, 200);
    sky.addColorStop(0, "#c9b8f2");
    sky.addColorStop(1, "#ffd6ec");
    g.fillStyle = sky;
    g.fillRect(0, 0, W, H);

    // Kawaii sun
    g.fillStyle = "#ffd23f";
    g.beginPath(); g.arc(42, 112, 14, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#2b1a52";
    g.fillRect(36, 109, 2, 3); g.fillRect(46, 109, 2, 3);
    g.fillStyle = "#ff8cc6";
    g.fillRect(33, 115, 3, 2); g.fillRect(48, 115, 3, 2);
    g.fillStyle = "#2b1a52";
    g.fillRect(40, 116, 4, 1);

    // Rolling hills
    g.fillStyle = "#b9e29a";
    g.beginPath(); g.ellipse(70, 192, 110, 30, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(260, 196, 120, 34, 0, 0, Math.PI * 2); g.fill();

    // Picket fence
    g.fillStyle = "#fff8e4";
    g.strokeStyle = "#a98fe6";
    g.lineWidth = 1;
    g.fillRect(0, 178, W, 4); g.fillRect(0, 188, W, 4);
    for (let x = -4; x < W; x += 14) {
      g.beginPath();
      g.moveTo(x, 198); g.lineTo(x, 174); g.lineTo(x + 5, 168); g.lineTo(x + 10, 174); g.lineTo(x + 10, 198);
      g.closePath(); g.fill(); g.stroke();
    }

    // Lawn with little tufts
    g.fillStyle = "#8fd16a";
    g.fillRect(0, 196, W, H - 196);
    g.fillStyle = "#6cb84a";
    for (let i = 0; i < 40; i++) {
      const x = (i * 97) % W, y = 200 + ((i * 53) % (H - 204));
      g.fillRect(x, y, 1, 3); g.fillRect(x + 2, y - 1, 1, 4); g.fillRect(x + 4, y + 1, 1, 2);
    }
  });
  const ROOF = layer((g) => {
    // Brick chimney at the right end (the hens turn around before it)
    g.fillStyle = "#c8604a";
    g.fillRect(282, 26, 22, 30);
    g.fillStyle = "#9a4434";
    for (let y = 30, row = 0; y < 56; y += 5, row++) {
      g.fillRect(282, y, 22, 1);
      for (let x = 282 + (row % 2) * 4; x < 304; x += 8) g.fillRect(x, y - 4, 1, 4);
    }
    g.fillStyle = "#2b1a52";
    g.fillRect(279, 22, 28, 4);
    // A little heart on the chimney
    g.fillStyle = "#ff8cc6";
    g.fillRect(290, 36, 2, 2); g.fillRect(294, 36, 2, 2); g.fillRect(289, 38, 8, 2); g.fillRect(290, 40, 6, 1); g.fillRect(291, 41, 4, 1); g.fillRect(292, 42, 2, 1);

    // Ridge cap and three rows of shingles
    g.fillStyle = "#a8324d";
    g.fillRect(0, RIDGE_Y - 1, W, 4);
    for (let row = 0; row < 3; row++) {
      const y = RIDGE_Y + 3 + row * 6;
      for (let i = 0, x = -10 + (row % 2) * 6; x < W; i++, x += 12) {
        g.fillStyle = (i + row) % 2 ? "#e85d75" : "#f07a8e";
        g.fillRect(x, y, 11, 6);
        g.fillStyle = "#a8324d";
        g.fillRect(x, y + 5, 12, 1);
        g.fillRect(x + 11, y, 1, 6);
      }
    }
    // Scalloped eave trim
    const ey = RIDGE_Y + 21;
    g.fillStyle = "#fff8e4";
    g.fillRect(0, ey, W, 3);
    for (let x = 0; x < W; x += 8) { g.beginPath(); g.arc(x + 4, ey + 3, 4, 0, Math.PI); g.fill(); }
    g.fillStyle = "#a98fe6";
    g.fillRect(0, ey + 2, W, 1);
  });

  function drawBackground(now) {
    ctx.drawImage(SKY, 0, 0, W, H);
    // Drifting pixel clouds
    const drift = reduceMotion ? 0 : (now / 120) % (W + 60);
    [[60, 104], [190, 96], [250, 138]].forEach(([cx, cy], i) => {
      const x = ((cx + drift * (0.6 + i * 0.2)) % (W + 60)) - 40;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x, cy, 30, 6); ctx.fillRect(x + 6, cy - 4, 14, 4); ctx.fillRect(x + 4, cy + 6, 22, 2);
    });
    // Chimney smoke puffs
    for (let i = 0; i < 3; i++) {
      const t = reduceMotion ? i / 3 : ((now / 1600) + i / 3) % 1;
      ctx.globalAlpha = 0.8 * (1 - t);
      ctx.fillStyle = "#ffffff";
      const s = 3 + Math.round(t * 4);
      ctx.fillRect(Math.round(293 + t * 10 - s / 2), Math.round(20 - t * 16), s, s);
    }
    ctx.globalAlpha = 1;
    ctx.drawImage(ROOF, 0, 0, W, H);
  }

  // Twinkly plus-shaped sparkles around a point
  function sparkles(x, y, r, now, color) {
    const spin = reduceMotion ? 0 : now / 250;
    ctx.fillStyle = color || "#fff6c2";
    for (let i = 0; i < 4; i++) {
      const a = spin + (i * Math.PI) / 2;
      const sx = Math.round(x + Math.cos(a) * r), sy = Math.round(y + Math.sin(a) * r * 0.8);
      ctx.fillRect(sx - 1, sy - 2, 2, 4); ctx.fillRect(sx - 2, sy - 1, 4, 2);
    }
  }

  function stinkLines(x, y, now) {
    ctx.fillStyle = "#7f8f3e";
    for (let i = 0; i < 3; i++) {
      const t = reduceMotion ? 0 : now / 160 + i * 2;
      for (let j = 0; j < 3; j++) ctx.fillRect(Math.round(x - 5 + i * 5 + Math.sin(t + j) * 1.5), y - j * 3, 1, 2);
    }
  }

  function drawHen(h, now) {
    const laying = h.lay > 0;
    const walking = !laying && h.wait <= 0 && h.x !== h.tx;
    const step = walking && !reduceMotion ? Math.floor(now / 140 + h.phase) % 2 : 0;
    const wiggle = laying && !reduceMotion ? (Math.floor(now / 50) % 2 ? 1 : -1) : 0;
    const top = RIDGE_Y - 28 + (laying ? 3 : 0) - step;
    const cx = Math.round(h.x);
    if (!laying) {
      ctx.fillStyle = "#ffb62e";
      const legH = RIDGE_Y - (top + 24);
      ctx.fillRect(cx - 5 + step, top + 24, 2, legH);
      ctx.fillRect(cx + 3 - step, top + 24, 2, legH);
    }
    sprite(h.img, cx - 12 + wiggle, top, 2);
    if (laying) {
      text("!", cx + 16, top + 6, { size: 8, color: "#ff5a3c" });
      if (h.kind === "golden") sparkles(cx, top + 12, 16, now);
      else if (h.kind === "rotten") stinkLines(cx, top + 2, now);
    }
  }

  function drawEgg(e, now) {
    const img = IMG[e.kind];
    sprite(img, e.x - 7, e.y - EGG_HALF_H, 2);
    if (e.kind === "golden") sparkles(e.x, e.y, 13, now);
    else if (e.kind === "rotten") stinkLines(e.x, e.y - 12, now);
  }

  function drawBasket(now) {
    const bx = Math.round(basket.x);
    const top = BASKET_Y + (basket.bounce > 0 ? 2 : 0);
    // Handle
    ctx.strokeStyle = "#8a5230";
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(bx, top + 2, 15, Math.PI, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = "#e8a96b";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(bx, top + 2, 15, Math.PI * 1.1, Math.PI * 1.5); ctx.stroke();
    // Caught eggs peeking over the rim
    [-10, 9, -1, 4, -6].forEach((dx, i) => { if (pile[i]) sprite(IMG[pile[i]], bx + dx - 3, top - 5, 1); });
    sprite(IMG.basket, bx - BASKET_HALF, top, 2);
    // Pink bow
    ctx.fillStyle = "#ff8cc6";
    ctx.fillRect(bx - 17, top + 7, 3, 3); ctx.fillRect(bx - 12, top + 7, 3, 3); ctx.fillRect(bx - 14, top + 8, 2, 2);
    if (basket.stink > 0) stinkLines(bx, top - 4, now);
  }

  function drawDecal(d, now) {
    ctx.globalAlpha = Math.max(0, 1 - d.t / 1400);
    const x = Math.round(d.x), y = d.y;
    if (d.kind === "rotten") {
      ctx.fillStyle = "#9aab52";
      ctx.beginPath(); ctx.ellipse(x, y, 9, 3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#5d6a2c";
      ctx.fillRect(x - 4, y - 1, 2, 1); ctx.fillRect(x + 3, y, 2, 1);
      stinkLines(x, y - 5, now);
    } else {
      ctx.fillStyle = "#fff8e4";
      ctx.beginPath(); ctx.ellipse(x, y, 10, 3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(x - 13, y, 4, 2); ctx.fillRect(x + 9, y - 2, 3, 2);
      ctx.fillStyle = "#ffb62e";
      ctx.beginPath(); ctx.arc(x + 1, y - 1, 3, 0, Math.PI * 2); ctx.fill();
      // Shell halves
      ctx.fillStyle = d.kind === "golden" ? "#ffd23f" : "#e6cfa6";
      ctx.fillRect(x - 9, y - 4, 4, 3); ctx.fillRect(x + 6, y - 5, 3, 4);
    }
    ctx.globalAlpha = 1;
  }

  function drawHud() {
    ctx.fillStyle = "rgba(43, 26, 82, .88)";
    ctx.fillRect(0, 0, W, 18);
    ctx.fillStyle = "#ffa31a";
    ctx.fillRect(0, 18, W, 2);
    text(`SCORE ${String(score).padStart(4, "0")}`, 6, 10, { align: "left", outline: false });
    if (mult() > 1) text(`x${mult()} STREAK`, W / 2 + 14, 10, { size: 6, outline: false, color: "#ff8cc6" });
    // One egg per life; cracked ones go dim with a zigzag
    for (let i = 0; i < MAX_CRACKS; i++) {
      const x = W - 42 + i * 12, y = 5;
      const cracked = i >= MAX_CRACKS - cracks;
      ctx.globalAlpha = cracked ? 0.5 : 1;
      sprite(IMG.egg, x, y, 1);
      ctx.globalAlpha = 1;
      if (cracked) {
        ctx.fillStyle = "#ff4d6d";
        [[3, 1], [2, 2], [3, 3], [4, 4], [3, 5], [2, 6], [3, 7]].forEach(([dx, dy]) => ctx.fillRect(x + dx, y + dy, 1, 1));
      }
    }
  }

  function drawTitle() {
    panel(26, 70, 268, 164);
    text("Egg Catch", W / 2, 95, { font: "logo", size: 30, color: "#ffd23f", outline: "#2b1a52", ow: 5 });
    text("Riot & Beyonce are laying!", W / 2, 112, { size: 6, color: "#7d5ad4", outline: false });
    if (best) text(`BEST ${best}`, 284, 80, { size: 5, align: "right", color: "#7d5ad4", outline: false });
    const rows = [
      [IMG.egg, "EGG", "+10", "#2b1a52"],
      [IMG.golden, "GOLD EGG, FIXES A CRACK", "+50", "#c98a00"],
      [IMG.rotten, "ROTTEN EGG", "DODGE!", "#e8352e"],
    ];
    rows.forEach(([img, label, pts, color], i) => {
      const y = 119 + i * 21;
      sprite(img, 44, y, 2);
      text(label, 66, y + 10, { size: 6, align: "left", color: "#2b1a52", outline: false });
      text(pts, 278, y + 10, { size: 6, align: "right", color, outline: false });
    });
    text("Miss 3 eggs and it's scrambled!", W / 2, 191, { size: 6, color: "#e8352e", outline: false });
  }

  function drawOver(now) {
    panel(30, 70, 260, 164);
    text(headline, W / 2, 96, { font: "logo", size: 26, color: "#ffa31a", outline: "#2b1a52", ow: 5 });
    text(`SCORE ${score}`, W / 2, 116, { size: 10, color: "#2b1a52", outline: false });
    if (newBest) {
      if (reduceMotion || Math.floor(now / 300) % 2 === 0) text("NEW BEST!", W / 2, 128, { size: 7, color: "#ff5a3c", outline: false });
    } else {
      text(`BEST ${best}`, W / 2, 128, { size: 7, color: "#7d5ad4", outline: false });
    }
    text(`CAUGHT ${stats.caught}  GOLD ${stats.golden}  STREAK ${stats.bestStreak}`, W / 2, 139, { size: 6, color: "#2b1a52", outline: false });
    text(`ROTTEN EGGS DODGED ${stats.dodged}  CAUGHT ${stats.stinky}`, W / 2, 151, { size: 5, color: stats.stinky ? "#e8352e" : "#2b1a52", outline: false });
    text(quip, W / 2, 164, { size: 5, color: "#7d5ad4", outline: false });
    text(`RANK: ${rankFor(score).toUpperCase()}`, W / 2, 180, { size: 7, color: "#ff5a3c", outline: false });
  }

  function draw(now) {
    ctx.setTransform(K, 0, 0, K, 0, 0);
    ctx.imageSmoothingEnabled = false;
    if (shakeT > 0) ctx.translate(Math.round(rand(-3, 3)), Math.round(rand(-2, 2)));

    drawBackground(now);
    hens.forEach((h) => drawHen(h, now));
    decals.forEach((d) => drawDecal(d, now));
    if (state !== "title") drawBasket(now);
    eggs.forEach((e) => drawEgg(e, now));
    bits.forEach((b) => {
      ctx.globalAlpha = 1 - b.life / b.max;
      ctx.fillStyle = b.color;
      ctx.fillRect(Math.round(b.x), Math.round(b.y), b.size, b.size);
    });
    ctx.globalAlpha = 1;
    popups.forEach((p) => {
      ctx.globalAlpha = Math.min(1, 2 - (p.t / 850) * 2);
      ctx.font = '7px "Press Start 2P", monospace';
      const half = ctx.measureText(p.text).width / 2 + 3; // keep text on screen near the edges
      text(p.text, Math.min(W - half, Math.max(half, p.x)), p.y - (p.t / 850) * 16, { size: 7, color: p.color });
    });
    ctx.globalAlpha = 1;

    if (state === "title") { drawTitle(); return; }
    drawHud();
    if (state === "ready") {
      hens.forEach((h) => text(h.name.toUpperCase(), h.x, 86, { size: 5, color: "#fff8e4" }));
      text(stateT < 750 ? "READY?" : "GO!", W / 2, H / 2 + 6, { font: "logo", size: 44, color: "#ffd23f", outline: "#2b1a52", ow: 6 });
    } else if (state === "paused") {
      ctx.fillStyle = "rgba(43, 26, 82, .55)";
      ctx.fillRect(0, 20, W, H - 20);
      text("Paused", W / 2, H / 2 - 12, { font: "logo", size: 40, color: "#fff8e4", outline: "#2b1a52", ow: 6 });
      text("CLICK OR SPACE TO KEEP CATCHING", W / 2, H / 2 + 22, { size: 6 });
    } else if (state === "over") {
      drawOver(now);
    }
  }

  /* ---------- Input ---------- */
  function pause() {
    if (state === "play" || state === "ready") setState("paused");
    keys.left = keys.right = false;
    dragging = false;
  }
  function resume() { setState("play"); }

  function primary() {
    if (state === "title") startGame();
    else if (state === "over" && stateT > 900) startGame();
    else if (state === "paused") resume();
  }

  const steering = () => state === "play" || state === "ready";
  function aimAt(e) {
    const rect = canvas.getBoundingClientRect();
    basket.target = ((e.clientX - rect.left) / rect.width) * W;
  }

  document.getElementById("start").addEventListener("click", startGame);
  document.getElementById("again").addEventListener("click", startGame);

  canvas.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    canvas.focus({ preventScroll: true });
    if (!steering()) { primary(); return; }
    dragging = true;
    try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    aimAt(e);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (steering() && (dragging || e.pointerType === "mouse")) aimAt(e);
  });
  canvas.addEventListener("pointerup", () => { dragging = false; });
  canvas.addEventListener("pointercancel", () => { dragging = false; });

  window.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.key === "Tab" || e.key === "Shift") return;
    if (e.target.tagName === "BUTTON" && (e.key === " " || e.key === "Enter")) return; // let buttons work
    const key = e.key.toLowerCase();
    let handled = true;
    if (key === "arrowleft" || key === "a") { keys.left = true; basket.target = null; }
    else if (key === "arrowright" || key === "d") { keys.right = true; basket.target = null; }
    else if (key === " " || key === "enter") { if (!e.repeat) primary(); }
    else if (key === "m") setMuted(!muted);
    else if (key === "p") (state === "paused" ? resume() : pause());
    else if (key === "escape") {
      if (state === "play" || state === "ready") pause();
      else if (embedded) { try { window.parent.postMessage({ yvyArcade: "close" }, location.origin); } catch (err) { /* ignore */ } }
    } else handled = false;
    if (handled) e.preventDefault();
  });
  window.addEventListener("keyup", (e) => {
    const key = e.key.toLowerCase();
    if (key === "arrowleft" || key === "a") keys.left = false;
    else if (key === "arrowright" || key === "d") keys.right = false;
  });

  document.addEventListener("visibilitychange", () => { if (document.hidden) pause(); });
  window.addEventListener("blur", pause);

  /* ---------- Go! ---------- */
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(50, now - last);
    last = now;
    if (state !== "paused") update(dt);
    draw(now);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  if (!embedded) document.getElementById("start").focus({ preventScroll: true });
})();
