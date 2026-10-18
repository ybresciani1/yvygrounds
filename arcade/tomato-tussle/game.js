/*
 * 🍅 Tomato Tussle: a tiny YvyGrounds arcade game.
 * Pests pop out of Yvy's garden beds; splat them with tomatoes before they
 * get the veggies. Don't splat the flock!
 *
 * Plain canvas, no libraries. Everything is drawn on a 320x240 "pixel" grid
 * and scaled up K times so it stays crisp.
 */
(function () {
  "use strict";

  const W = 320, H = 240, K = 3;
  const ROUND_MS = 45000;
  const BEST_KEY = "yvy-tomato-best";
  const MUTE_KEY = "yvy-arcade-muted";

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const muteBtn = document.getElementById("mute");
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

  if (document.fonts) {
    document.fonts.load('8px "Press Start 2P"');
    document.fonts.load('40px "Chewy"');
  }

  /* ---------- Pixel sprites (letter grids, like js/pixels.js) ---------- */
  const ART = {
    squirrel: {
      colors: { B: "#b0683a", T: "#f2c79a", K: "#2b1a52", W: "#ffffff", P: "#ff6fa8" },
      grid: [
        ".B....B.....",
        "BTB..BTB.BB.",
        "BBBBBBBB.BBB",
        "BBBBBBBBBBTB",
        "BKWBBKWBBBTB",
        "BKKBBKKBBBTB",
        "BBBPPBBB.BTB",
        "TBBBBBBT.BB.",
        ".TTWWTT.BB..",
        ".TTTTTT.B...",
        "BTTTTTTB....",
        "BBTTTTBB....",
      ],
    },
    crow: {
      colors: { K: "#2a2438", G: "#5b4f78", W: "#ffffff", Y: "#ffb62e" },
      grid: [
        "....KKKK....",
        "...KKKKKK...",
        "..KKKKKKKK..",
        "..KWKKKKWK..",
        "..KKKYYKKK..",
        ".KKKYYYYKKK.",
        "KKKKKYYKKKKK",
        "KGKKKKKKKKGK",
        "KGGKKKKKKGGK",
        ".KGKKKKKKGK.",
        "..KKKKKKKK..",
        "...KK..KK...",
      ],
    },
    raccoon: {
      colors: { G: "#9a94a8", D: "#5f5870", K: "#2b2433", W: "#f4f0f7" },
      grid: [
        ".GG......GG.",
        "GDGG....GGDG",
        "GGGGGGGGGGGG",
        "GGWWGGGGWWGG",
        "GKKKKGGKKKKG",
        "KKWKKGGKKWKK",
        "GKKKGGGGKKKG",
        "GWWWGKKGWWWG",
        ".WWWWWWWWWW.",
        "..WWWWWWWW..",
        ".GGWWWWWWGG.",
        "GGGGGGGGGGGG",
      ],
    },
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
    tomato: {
      colors: { G: "#3f8f2e", R: "#e8352e", W: "#ffb3a8" },
      grid: [
        "...G.G...",
        "..RGGGR..",
        ".RRRGRRR.",
        "RRWRRRRRR",
        "RWRRRRRRR",
        "RRRRRRRRR",
        ".RRRRRRR.",
        "..RRRRR..",
      ],
    },
    plant: {
      colors: { S: "#9a5427", G: "#3f8f2e", R: "#e8352e" },
      grid: [
        "...S....",
        ".GGSGG..",
        "GGRSGGG.",
        ".RRS.RR.",
        "..GSGRR.",
        ".GGSGG..",
        "GRRS.GG.",
        ".RRSGGG.",
        "..GS.RR.",
        ".GGSGRR.",
        "...S....",
        "...S....",
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
    squirrel: bake("squirrel"),
    crow: bake("crow"),
    raccoon: bake("raccoon"),
    riot: bake("chicken"),
    beyonce: bake("chicken", { C: "#f2c96b", W: "#e7a63c", G: "#9a5b1d" }),
    tomato: bake("tomato"),
    golden: bake("tomato", { R: "#ffcf33", W: "#fff6c2", G: "#3f8f2e" }),
    plant: bake("plant"),
  };

  // What can pop out of a hole
  const KINDS = {
    squirrel: { img: "squirrel", pts: 10, up: 1 },
    crow:     { img: "crow",     pts: 15, up: 0.75 },
    raccoon:  { img: "raccoon",  pts: 25, up: 0.6 },
    golden:   { img: "golden",   pts: 0,  up: 0.7, bonusMs: 5000 },
    riot:     { img: "riot",     pts: -20, up: 1.2, chicken: "Riot" },
    beyonce:  { img: "beyonce",  pts: -20, up: 1.2, chicken: "Beyonce" },
  };

  /* ---------- Garden layout: 3 beds x 3 holes ---------- */
  const COLS = [64, 160, 256];
  const ROWS = [118, 166, 214];
  const holes = [];
  ROWS.forEach((y, row) => COLS.forEach((x) => holes.push({ x, y, row, critter: null })));
  const THROW_FROM = { x: 160, y: 252 };
  const RISE_MS = 130;

  /* ---------- Sound (tiny WebAudio bleeps) ---------- */
  let actx = null;
  let muted = store.get(MUTE_KEY) === "1";
  function audio() {
    if (!actx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) actx = new AC();
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
    const buf = a.createBuffer(1, Math.floor(a.sampleRate * dur), a.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = a.createBufferSource();
    const filter = a.createBiquadFilter();
    const g = a.createGain();
    src.buffer = buf;
    filter.type = "lowpass";
    filter.frequency.value = cutoff;
    g.gain.value = vol;
    src.connect(filter).connect(g).connect(a.destination);
    src.start();
  }
  const SFX = {
    toss: () => tone(500, 900, 0.07, "triangle", 0.05),
    splat: () => { noise(0.16, 0.25, 1100); tone(180, 70, 0.12, "square", 0.05); },
    plop: () => noise(0.1, 0.12, 500),
    bawk: () => { tone(620, 480, 0.09, "square", 0.07); tone(520, 820, 0.14, "square", 0.07, 0.1); },
    gold: () => [660, 880, 1320].forEach((f, i) => tone(f, 0, 0.1, "square", 0.05, i * 0.07)),
    tick: () => tone(880, 0, 0.05, "square", 0.04),
    go: () => tone(440, 880, 0.2, "square", 0.05),
    end: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, 0, 0.15, "triangle", 0.07, i * 0.12)),
  };
  function setMuted(on) {
    muted = on;
    store.set(MUTE_KEY, on ? "1" : "0");
    muteBtn.textContent = on ? "🔇" : "🔊";
    muteBtn.setAttribute("aria-pressed", String(on));
    muteBtn.setAttribute("aria-label", on ? "Turn sound on" : "Mute sound");
  }
  setMuted(muted);
  muteBtn.addEventListener("click", () => { setMuted(!muted); canvas.focus(); });

  /* ---------- Game state ---------- */
  const RANKS = [
    [0, "Seedling"], [150, "Sprout"], [350, "Tomato Tosser"],
    [600, "Garden Guardian"], [900, "Tomato Legend"], [1300, "Supreme Salad Slinger"],
  ];
  let state = "title";          // title, ready, play, paused, over
  let stateT = 0;               // ms spent in the current state
  let score, combo, timeLeft, elapsed, spawnT, stats, lastTick, newBest;
  let best = parseInt(store.get(BEST_KEY), 10) || 0;
  let shakeT = 0;
  const shots = [];             // tomatoes in flight
  const bits = [];              // splat particles + feathers
  const stains = [];            // splats on the dirt
  const popups = [];            // floating "+10" text

  function setState(s) { state = s; stateT = 0; }

  function startGame() {
    audio();
    score = 0; combo = 0; elapsed = 0; spawnT = 400;
    timeLeft = ROUND_MS; lastTick = 99; newBest = false;
    stats = { throws: 0, splats: 0, golden: 0, chickens: 0 };
    holes.forEach((h) => { h.critter = null; });
    shots.length = bits.length = stains.length = popups.length = 0;
    setState("ready");
  }

  function endGame() {
    holes.forEach((h) => { if (h.critter && h.critter.state !== "fall") { h.critter.state = "fall"; h.critter.t = 0; } });
    if (score > best) { best = score; newBest = score > 0; store.set(BEST_KEY, String(best)); }
    SFX.end();
    setState("over");
  }

  const mult = () => Math.min(4, 1 + Math.floor(combo / 5));
  const rankFor = (s) => RANKS.filter((r) => s >= r[0]).pop()[1];

  function spawn() {
    const p = elapsed / ROUND_MS;
    const free = holes.filter((h) => !h.critter);
    const up = holes.length - free.length;
    const maxUp = p < 0.3 ? 2 : p < 0.7 ? 3 : 4;
    if (!free.length || up >= maxUp) return;
    const r = Math.random();
    const goldenOut = holes.some((h) => h.critter && h.critter.kind === "golden");
    let kind;
    if (r < 0.17) kind = pick(["riot", "beyonce"]);
    else if (r < 0.21 && !goldenOut && p > 0.15) kind = "golden";
    else {
      const q = Math.random();
      kind = q < 0.5 ? "squirrel" : q < 0.82 ? "crow" : "raccoon";
    }
    const hole = pick(free);
    hole.critter = { kind, state: "rise", t: 0, h: 0, up: lerp(1350, 700, p) * KINDS[kind].up };
  }

  function updateCritters(dt) {
    holes.forEach((hole) => {
      const c = hole.critter;
      if (!c) return;
      c.t += dt;
      if (c.state === "rise") {
        c.h = Math.min(1, c.t / RISE_MS);
        if (c.t >= RISE_MS) { c.state = "up"; c.t = 0; }
      } else if (c.state === "up") {
        c.h = 1;
        if (c.t >= c.up) { c.state = "fall"; c.t = 0; }
      } else if (c.state === "hit") {
        if (c.t >= 380) { c.state = "fall"; c.t = 0; }
      } else if (c.state === "fall") {
        c.h = Math.max(0, 1 - c.t / RISE_MS);
        if (c.h <= 0) hole.critter = null;
      }
    });
  }

  // Which hole did a tap/click mean? Holes with something to hit win ties.
  function holeAt(x, y) {
    let best = null, bestScore = Infinity;
    holes.forEach((h) => {
      const dx = Math.abs(x - h.x), dy = y - h.y;
      if (dx > 48 || dy < -50 || dy > 16) return;
      const live = h.critter && h.critter.state !== "hit" && h.critter.h > 0.2;
      const s = (live ? 0 : 1000) + Math.hypot(dx, dy + 16);
      if (s < bestScore) { bestScore = s; best = h; }
    });
    return best;
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

  function throwAt(hole, x, y) {
    stats.throws++;
    SFX.toss();
    const tx = hole ? hole.x : x;
    const ty = hole ? hole.y - 18 : y;
    const c = hole && hole.critter;
    let result = "miss";
    if (c && c.state !== "hit" && c.h > 0.2) {
      const kind = KINDS[c.kind];
      c.state = "hit"; c.t = 0;
      if (kind.chicken) {
        result = "chicken";
        score = Math.max(0, score + kind.pts);
        combo = 0;
        stats.chickens++;
        popup(`BAWK! Sorry ${kind.chicken}!`, tx, ty - 22, "#ffd23f");
        popup(`${kind.pts}`, tx, ty - 8, "#ff6b6b");
      } else if (kind.bonusMs) {
        result = "golden";
        stats.golden++;
        timeLeft += kind.bonusMs;
        popup("+5 SEC!", tx, ty - 14, "#ffd23f");
      } else {
        result = "pest";
        combo++;
        stats.splats++;
        const m = mult();
        score += kind.pts * m;
        popup(m > 1 ? `+${kind.pts * m} x${m}` : `+${kind.pts}`, tx, ty - 14, m > 1 ? "#ff8cc6" : "#fff");
        if (combo > 0 && combo % 5 === 0 && m <= 4) popup(`COMBO x${m}!`, 160, 40, "#ff8cc6");
      }
    } else {
      combo = 0;
    }
    shots.push({ x0: THROW_FROM.x + rand(-6, 6), y0: THROW_FROM.y, x1: tx, y1: ty, t: 0, dur: 150, result });
  }

  function land(shot) {
    const { x1: x, y1: y, result } = shot;
    if (result === "miss") {
      SFX.plop();
      stains.push({ x, y: y + 6, t: 0 });
      burst(x, y + 6, 8, ["#e8352e", "#c42a24"], 0.07);
    } else if (result === "chicken") {
      SFX.bawk();
      burst(x, y, 10, ["#e8352e", "#c42a24"]);
      burst(x, y, 10, ["#ffffff", "#fbe7c2"], 0.09);
      if (!reduceMotion) shakeT = 260;
    } else if (result === "golden") {
      SFX.gold();
      burst(x, y, 16, ["#ffd23f", "#fff6c2", "#ffffff"], 0.14);
    } else {
      SFX.splat();
      burst(x, y, 14, ["#e8352e", "#c42a24", "#ffd23f"]);
    }
  }

  /* ---------- Update ---------- */
  function update(dt) {
    stateT += dt;
    if (state === "ready" && stateT >= 1100) { setState("play"); SFX.go(); }
    if (state === "play") {
      elapsed += dt;
      timeLeft -= dt;
      spawnT -= dt;
      if (spawnT <= 0) { spawn(); spawnT = lerp(850, 420, elapsed / ROUND_MS); }
      const secs = Math.ceil(timeLeft / 1000);
      if (secs <= 5 && secs !== lastTick && secs > 0) SFX.tick();
      lastTick = secs;
      if (timeLeft <= 0) { timeLeft = 0; endGame(); }
    }
    if (state === "play" || state === "over") updateCritters(dt);

    for (let i = shots.length - 1; i >= 0; i--) {
      const s = shots[i];
      s.t += dt;
      if (s.t >= s.dur) { land(s); shots.splice(i, 1); }
    }
    for (let i = bits.length - 1; i >= 0; i--) {
      const b = bits[i];
      b.life += dt;
      b.vy += 0.0005 * dt;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      if (b.life >= b.max) bits.splice(i, 1);
    }
    for (let i = stains.length - 1; i >= 0; i--) if ((stains[i].t += dt) > 900) stains.splice(i, 1);
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

  function drawBackground(now) {
    const sky = ctx.createLinearGradient(0, 0, 0, 80);
    sky.addColorStop(0, "#c9b8f2");
    sky.addColorStop(1, "#ffd6ec");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, 80);

    // Kawaii sun
    ctx.fillStyle = "#ffd23f";
    ctx.beginPath(); ctx.arc(286, 42, 14, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#2b1a52";
    ctx.fillRect(280, 39, 2, 3); ctx.fillRect(290, 39, 2, 3);
    ctx.fillStyle = "#ff8cc6";
    ctx.fillRect(277, 45, 3, 2); ctx.fillRect(292, 45, 3, 2);
    ctx.fillStyle = "#2b1a52";
    ctx.fillRect(284, 46, 4, 1);

    // Drifting pixel clouds
    const drift = reduceMotion ? 0 : (now / 120) % (W + 60);
    [[30, 30], [170, 26], [250, 58]].forEach(([cx, cy], i) => {
      const x = ((cx + drift * (0.6 + i * 0.2)) % (W + 60)) - 40;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x, cy, 30, 6); ctx.fillRect(x + 6, cy - 4, 14, 4); ctx.fillRect(x + 4, cy + 6, 22, 2);
    });

    // Picket fence
    ctx.fillStyle = "#fff8e4";
    ctx.strokeStyle = "#a98fe6";
    ctx.lineWidth = 1;
    ctx.fillRect(0, 60, W, 4); ctx.fillRect(0, 72, W, 4);
    for (let x = -4; x < W; x += 14) {
      ctx.beginPath();
      ctx.moveTo(x, 82); ctx.lineTo(x, 56); ctx.lineTo(x + 5, 50); ctx.lineTo(x + 10, 56); ctx.lineTo(x + 10, 82);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    }

    // Lawn with little tufts
    ctx.fillStyle = "#8fd16a";
    ctx.fillRect(0, 80, W, H - 80);
    ctx.fillStyle = "#6cb84a";
    for (let i = 0; i < 70; i++) {
      const x = (i * 97) % W, y = 84 + ((i * 53) % (H - 86));
      ctx.fillRect(x, y, 1, 3); ctx.fillRect(x + 2, y - 1, 1, 4); ctx.fillRect(x + 4, y + 1, 1, 2);
    }
  }

  function drawBedBack(y) {
    ctx.fillStyle = "#7a4526";
    ctx.fillRect(18, y - 5, W - 36, 6);
    COLS.forEach((x) => {
      ctx.fillStyle = "#3a2416";
      ctx.beginPath(); ctx.ellipse(x, y, 21, 5, 0, 0, Math.PI * 2); ctx.fill();
    });
  }

  function drawBedFront(y) {
    ctx.fillStyle = "#a5643a";
    ctx.fillRect(18, y, W - 36, 11);
    ctx.fillStyle = "#c8834f";
    ctx.fillRect(18, y, W - 36, 2);
    ctx.fillStyle = "#8a5230";
    for (let x = 26; x < W - 26; x += 11) ctx.fillRect(x, y + 5 + (x % 3), 2, 1);
    sprite(IMG.plant, 104, y - 22, 2);
    sprite(IMG.plant, 200, y - 22, 2);
  }

  function drawSplatDecal(x, y, r) {
    ctx.fillStyle = "#e8352e";
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(x - r - 2, y - 1, 4, 3);
    ctx.fillRect(x + r - 1, y - 3, 4, 3);
    ctx.fillRect(x - 2, y + r - 1, 3, 5);
    ctx.fillRect(x + 4, y + r - 2, 2, 4);
    ctx.fillStyle = "#ffd23f";
    ctx.fillRect(x - 3, y - 2, 1, 2); ctx.fillRect(x + 2, y + 1, 1, 2); ctx.fillRect(x, y - 4, 1, 2);
  }

  function drawCritter(hole, now, tags) {
    const c = hole.critter;
    if (!c || c.h <= 0) return;
    const img = IMG[KINDS[c.kind].img];
    const scale = 3;
    const w = img.width * scale, h = img.height * scale;
    const bob = c.state === "up" && !reduceMotion ? Math.round(Math.sin((c.t + hole.x) / 110)) : 0;
    const top = hole.y - h * c.h + 3 + bob;
    const left = hole.x - w / 2;
    ctx.save();
    ctx.beginPath();
    ctx.rect(hole.x - 32, hole.y - 64, 64, 65);
    ctx.clip();
    sprite(img, left, top, scale);
    if (c.kind === "golden" && c.state !== "hit") {
      const spin = reduceMotion ? 0 : now / 250;
      ctx.fillStyle = "#fff6c2";
      for (let i = 0; i < 4; i++) {
        const a = spin + (i * Math.PI) / 2;
        const sx = hole.x + Math.cos(a) * 19, sy = top + 12 + Math.sin(a) * 14;
        ctx.fillRect(sx - 1, sy - 3, 2, 6); ctx.fillRect(sx - 3, sy - 1, 6, 2);
      }
    }
    if (c.state === "hit" || (c.state === "fall" && c.wasHit)) {
      c.wasHit = true;
      drawSplatDecal(hole.x, top + 14, 8);
    }
    ctx.restore();
    const name = KINDS[c.kind].chicken;
    if (name && c.h > 0.6) tags.push({ name, x: hole.x, y: top - 6 });
  }

  function drawHud() {
    ctx.fillStyle = "rgba(43, 26, 82, .88)";
    ctx.fillRect(0, 0, W, 18);
    ctx.fillStyle = "#ffa31a";
    ctx.fillRect(0, 18, W, 2);
    text(`SCORE ${String(score).padStart(4, "0")}`, 6, 10, { align: "left", outline: false });
    const secs = Math.ceil(timeLeft / 1000);
    text(`TIME ${String(secs).padStart(2, "0")}`, W - 6, 10, { align: "right", outline: false, color: secs <= 10 ? "#ff6b6b" : "#fff" });
    if (mult() > 1) text(`x${mult()} COMBO`, W / 2, 10, { outline: false, color: "#ff8cc6" });
  }

  function drawTitle(now) {
    panel(22, 14, 276, 212);
    text("Tomato Tussle", W / 2, 40, { font: "logo", size: 36, color: "#ff5a3c", outline: "#2b1a52", ow: 5 });
    text("Defend Yvy's garden!", W / 2, 63, { size: 7, color: "#7d5ad4", outline: false });
    const rows = [
      [IMG.squirrel, "SQUIRREL", "+10", "#2b1a52"],
      [IMG.crow, "CROW", "+15", "#2b1a52"],
      [IMG.raccoon, "RACCOON", "+25", "#2b1a52"],
      [IMG.golden, "GOLDEN TOMATO", "+5 SEC", "#c98a00"],
      [IMG.riot, "CHICKENS", "-20!", "#e8352e"],
    ];
    rows.forEach(([img, label, pts, color], i) => {
      const y = 73 + i * 24;
      sprite(img, 58 - img.width, y, 2);
      text(label, 74, y + 12, { size: 7, align: "left", color: "#2b1a52", outline: false });
      text(pts, 262, y + 12, { size: 7, align: "right", color, outline: false });
    });
    text("Don't splat the flock!", W / 2, 199, { size: 6, color: "#e8352e", outline: false });
    if (reduceMotion || Math.floor(now / 500) % 2 === 0) {
      text("CLICK, TAP OR SPACE TO START", W / 2, 211, { size: 6, color: "#ff8a1e", outline: false });
    }
    if (best) text(`BEST ${best}`, W / 2, 221, { size: 5, color: "#7d5ad4", outline: false });
  }

  function drawOver(now) {
    panel(36, 28, 248, 190);
    text("Time's up!", W / 2, 52, { font: "logo", size: 30, color: "#ffa31a", outline: "#2b1a52", ow: 5 });
    text(`SCORE ${score}`, W / 2, 80, { size: 10, color: "#2b1a52", outline: false });
    if (newBest) {
      if (reduceMotion || Math.floor(now / 300) % 2 === 0) text("NEW BEST!", W / 2, 97, { size: 8, color: "#ff5a3c", outline: false });
    } else {
      text(`BEST ${best}`, W / 2, 97, { size: 8, color: "#7d5ad4", outline: false });
    }
    const acc = stats.throws ? Math.round(((stats.splats + stats.golden) / stats.throws) * 100) : 0;
    text(`SPLATS ${stats.splats}   AIM ${acc}%`, W / 2, 118, { size: 7, color: "#2b1a52", outline: false });
    text(`CHICKENS BONKED ${stats.chickens}`, W / 2, 134, { size: 7, color: stats.chickens ? "#e8352e" : "#2b1a52", outline: false });
    text(stats.chickens ? "Riot will remember this." : "The flock thanks you!", W / 2, 148, { size: 6, color: "#7d5ad4", outline: false });
    text(`RANK: ${rankFor(score).toUpperCase()}`, W / 2, 170, { size: 7, color: "#ff5a3c", outline: false });
    if (stateT > 900 && (reduceMotion || Math.floor(now / 500) % 2 === 0)) {
      text("CLICK OR SPACE TO PLAY AGAIN", W / 2, 198, { size: 6, color: "#ff8a1e", outline: false });
    }
  }
  function draw(now) {
    ctx.setTransform(K, 0, 0, K, 0, 0);
    ctx.imageSmoothingEnabled = false;
    if (shakeT > 0) ctx.translate(Math.round(rand(-3, 3)), Math.round(rand(-2, 2)));

    drawBackground(now);
    const tags = [];
    ROWS.forEach((y, row) => {
      drawBedBack(y);
      holes.filter((h) => h.row === row).forEach((h) => drawCritter(h, now, tags));
      drawBedFront(y);
    });
    stains.forEach((s) => {
      ctx.globalAlpha = 1 - s.t / 900;
      drawSplatDecal(s.x, s.y, 4);
      ctx.globalAlpha = 1;
    });
    tags.forEach((t) => text(t.name, t.x, t.y, { size: 6, color: "#fff8e4" }));

    shots.forEach((s) => {
      const p = s.t / s.dur;
      const x = lerp(s.x0, s.x1, p);
      const y = lerp(s.y0, s.y1, p) - Math.sin(Math.PI * p) * 34;
      const sc = p < 0.5 ? 3 : 2;
      sprite(IMG.tomato, x - (IMG.tomato.width * sc) / 2, y - (IMG.tomato.height * sc) / 2, sc);
    });
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

    if (state === "title") { drawTitle(now); return; }
    drawHud();
    if (state === "ready") {
      text(stateT < 750 ? "READY?" : "GO!", W / 2, H / 2 - 6, { font: "logo", size: 44, color: "#ffd23f", outline: "#2b1a52", ow: 6 });
    } else if (state === "paused") {
      ctx.fillStyle = "rgba(43, 26, 82, .55)";
      ctx.fillRect(0, 20, W, H - 20);
      text("Paused", W / 2, H / 2 - 12, { font: "logo", size: 40, color: "#fff8e4", outline: "#2b1a52", ow: 6 });
      text("CLICK OR SPACE TO KEEP TUSSLING", W / 2, H / 2 + 22, { size: 6 });
    } else if (state === "over") {
      drawOver(now);
    }
  }

  /* ---------- Input ---------- */
  function pause() { if (state === "play" || state === "ready") { setState("paused"); } }
  function resume() { setState("play"); }

  function primary() {
    if (state === "title") startGame();
    else if (state === "over" && stateT > 900) startGame();
    else if (state === "paused") resume();
  }

  canvas.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    canvas.focus({ preventScroll: true });
    if (state !== "play") { primary(); return; }
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    const y = ((e.clientY - rect.top) / rect.height) * H;
    if (y < 20) return; // tapping the score bar does nothing
    throwAt(holeAt(x, y), x, y);
  });

  const KEYMAP = { q: 0, w: 1, e: 2, a: 3, s: 4, d: 5, z: 6, x: 7, c: 8, 7: 0, 8: 1, 9: 2, 4: 3, 5: 4, 6: 5, 1: 6, 2: 7, 3: 8 };
  window.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.target === muteBtn && (e.key === " " || e.key === "Enter")) return; // let the button work
    const key = e.key.toLowerCase();
    let handled = true;
    if (key === " " || key === "enter") primary();
    else if (key === "m") setMuted(!muted);
    else if (key === "p") (state === "paused" ? resume() : pause());
    else if (key === "escape") {
      if (state === "play" || state === "ready") pause();
      else if (embedded) { try { window.parent.postMessage({ yvyArcade: "close" }, location.origin); } catch (err) { /* ignore */ } }
    } else if (state === "play" && key in KEYMAP) throwAt(holes[KEYMAP[key]]);
    else handled = false;
    if (handled) e.preventDefault();
  });

  document.addEventListener("visibilitychange", () => { if (document.hidden) pause(); });
  window.addEventListener("blur", pause);

  /* ---------- Go! ---------- */
  score = 0; combo = 0; timeLeft = ROUND_MS;
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(50, now - last);
    last = now;
    if (state !== "paused") update(dt);
    draw(now);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  if (!embedded) canvas.focus({ preventScroll: true });
})();
