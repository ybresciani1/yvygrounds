/*
 * 🥊 Street Fluffers: a tiny YvyGrounds arcade fighting game.
 * Peaches takes on Bojjii or Lychee in a best-of-3 backyard brawl.
 * Bap, kick, hold back to block, and throw your special: Peaches' Fluff Ball,
 * Lychee's Hairball or Bojjii's Bark Wave. Riot and Beyonce cheer from the fence.
 *
 * Plain canvas, no libraries. Drawn on a 320x240 "pixel" grid, scaled K times.
 */
(function () {
  "use strict";

  const W = 320, H = 240, K = 3;
  const FLOOR_Y = 190;          // where the fighters' feet touch the grass
  const ROUND_SECS = 60;
  const WINS_NEEDED = 2;
  const MAX_HP = 100;
  const GRAVITY = 900;
  const WINS_KEY = "yvy-fluffers-wins";
  const MUTE_KEY = "yvy-arcade-muted";

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const muteBtn = document.getElementById("mute");
  const menu = document.getElementById("menu");
  const overMenu = document.getElementById("overMenu");
  const pad = document.getElementById("pad");
  const embedded = window.self !== window.top;
  if (embedded) document.body.classList.add("embedded");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let touchUI = window.matchMedia("(pointer: coarse)").matches;

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
  // Heads are the same ones as Bowl Brawl; the fighters stand up like little boxers.
  const ART = {
    // Peaches: fox-faced Pomeranian, mid "hehe"
    peaches: {
      colors: { O: "#eeaa55", C: "#fbe3b8", D: "#b8682a", K: "#2b1a52", W: "#ffffff", P: "#ff6fa8" },
      grid: [
        ".DD........DD.",
        ".DOD......DOD.",
        ".DOOD....DOOD.",
        ".OOOOOOOOOOOO.",
        "OOOOOOOOOOOOOO",
        "OOKWOOOOOOKWOO",
        "OOKKOOOOOOKKOO",
        "OCCOOCCCCOOCCO",
        "CCCCCCKKCCCCCC",
        ".CCCCCPPCCCCC.",
        "CCCCCCCCCCCCCC",
        "OCCCCCCCCCCCCO",
        ".OCCCOOOOCCCO.",
        "..CC......CC..",
      ],
    },
    peachesBody: {
      colors: { O: "#eeaa55", C: "#fbe3b8", D: "#b8682a" },
      grid: [
        "...OOOOOO...",
        "..OOCCCCOO..",
        ".OOCCCCCCOO.",
        ".OOCCCCCCOO.",
        ".OOCCCCCCOO.",
        "..OOCCCCOO..",
        "...OOOOOO...",
        "...OO..OO...",
        "...DO..OD...",
        "...CC..CC...",
      ],
    },
    // Lychee: gray tabby with her orange collar charm. Very dignified.
    lychee: {
      colors: { G: "#7d7a82", S: "#4a4650", L: "#c4bfc7", E: "#c9d86a", K: "#2b1a52", N: "#e58a9a", O: "#ff8a1e" },
      grid: [
        ".S..........S.",
        ".GS........SG.",
        ".GGS......SGG.",
        ".GGGSGSSGSGGG.",
        "GGGGGSGGSGGGGG",
        "GGEKGGGGGGEKGG",
        "SGEEGGGGGGEESS",
        "GGGGGLLLLGGGGG",
        "SGGGLLNNLLGGGS",
        ".GGGLLLLLLGGG.",
        "..GGGOOOOGGG..",
        ".SGGGGOGGGGGS.",
        ".GGSGGGGGGSGG.",
        "..LL......LL..",
      ],
    },
    lycheeBody: {
      colors: { G: "#7d7a82", S: "#4a4650", L: "#c4bfc7" },
      grid: [
        "....GGGG....",
        "...GSLLSG...",
        "..GGLLLLGG..",
        "..SGLLLLGS..",
        "..GGLLLLGG..",
        "..SGLLLLGS..",
        "...GGGGGG...",
        "...GG..GG...",
        "...SG..GS...",
        "...LL..LL...",
      ],
    },
    // Bojjii (German Shepherd x Aussie, we think). The big guy.
    bojjii: {
      colors: { B: "#2b2433", T: "#c98a4a", K: "#120e18", W: "#ffffff", P: "#ff6fa8" },
      grid: [
        ".B........B.",
        ".BB......BB.",
        ".BTB....BTB.",
        ".BBBBBBBBBB.",
        "BBTBBBBBBTBB",
        "BKWTBBBBTKWB",
        "BTTTTBBTTTTB",
        ".TTTTKKTTTT.",
        ".TTTTTTTTTT.",
        "..TTTPPTTT..",
      ],
    },
    bojjiiBody: {
      colors: { B: "#2b2433", T: "#c98a4a" },
      grid: [
        "...BBBBBBBB...",
        "..BBTTTTTTBB..",
        ".BBTTTTTTTTBB.",
        ".BBTTTTTTTTBB.",
        ".BBTTTTTTTTBB.",
        ".BBTTTTTTTTBB.",
        "..BBTTTTTTBB..",
        "...BBBBBBBB...",
        "...BBB..BBB...",
        "...BBB..BBB...",
        "...TTT..TTT...",
        "...TTT..TTT...",
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
  };

  function bake(name, overrides, allWhite) {
    const art = ART[name];
    const colors = Object.assign({}, art.colors, overrides);
    if (allWhite) Object.keys(colors).forEach((k) => { colors[k] = "#ffffff"; });
    const c = document.createElement("canvas");
    c.width = art.grid[0].length;
    c.height = art.grid.length;
    const g = c.getContext("2d");
    art.grid.forEach((row, y) => [...row].forEach((ch, x) => {
      if (colors[ch]) { g.fillStyle = colors[ch]; g.fillRect(x, y, 1, 1); }
    }));
    return c;
  }

  const IMG = { riot: bake("chicken"), beyonce: bake("chicken", { C: "#f2c96b", W: "#e7a63c", G: "#9a5b1d" }) };
  ["peaches", "lychee", "bojjii"].forEach((id) => {
    IMG[id] = bake(id);
    IMG[id + "Body"] = bake(id + "Body");
    IMG[id + "Flash"] = bake(id, null, true);
    IMG[id + "BodyFlash"] = bake(id + "Body", null, true);
  });

  /* ---------- The fighters ---------- */
  const CHARS = {
    peaches: {
      name: "Peaches", headScale: 2, headDrop: 4,
      main: "#eeaa55", light: "#fbe3b8", dark: "#b8682a", glove: "#ff6fa8",
      speed: 92, jump: 310, power: 1, shot: "fluff", shotName: "FLUFF BALL", shotSpeed: 150,
      win: "Fluff is my fighting style!",
    },
    lychee: {
      name: "Lychee", headScale: 2, headDrop: 4,
      main: "#7d7a82", light: "#c4bfc7", dark: "#4a4650", glove: "#ff8a1e",
      speed: 112, jump: 340, power: 0.85, shot: "hairball", shotName: "HAIRBALL", shotSpeed: 175,
      win: "I wasn't even trying. Mrrp.",
      lose: "Lychee pretends she slipped.",
    },
    bojjii: {
      name: "Bojjii", headScale: 3, headDrop: 6,
      main: "#2b2433", light: "#c98a4a", dark: "#120e18", glove: "#e8352e",
      speed: 72, jump: 280, power: 1, shot: "woof", shotName: "BARK WAVE", shotSpeed: 125,
      win: "Good game! Now... pancakes?",
      lose: "Bojjii flops over for belly rubs.",
    },
  };
  CHARS.peaches.lose = "Peaches does her sad hamster face.";

  // Frame data in ms. reach = how far the paw/foot sticks out past the body.
  const MOVES = {
    bap:  { startup: 60, active: 90, recover: 130, dmg: 5, reach: 16, stun: 240, block: 150, push: 70, words: ["BAP!", "BOP!", "PAP!"] },
    kick: { startup: 150, active: 100, recover: 250, dmg: 10, reach: 20, stun: 380, block: 220, push: 150, heavy: true, words: ["POW!", "WHAM!", "THWACK!"] },
    special: { startup: 230, active: 0, recover: 320, dmg: 9, stun: 340, block: 200, push: 120, cooldown: 1400 },
  };
  const SHOT_WORDS = { fluff: "FLOOF!", hairball: "HACK!", woof: "WOOF!" };

  /* ---------- Sound (tiny WebAudio bleeps) ---------- */
  let actx = null;
  let noiseBuf = null;      // one second of noise, reused by every hit
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
  function noise(dur, vol, cutoff, delay) {
    if (muted) return;
    const a = audio();
    if (!a) return;
    if (!noiseBuf) {
      noiseBuf = a.createBuffer(1, a.sampleRate, a.sampleRate);
      const data = noiseBuf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    }
    const t = a.currentTime + (delay || 0);
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
  const VOICES = {
    peaches: () => { tone(560, 360, 0.08, "square", 0.06); tone(600, 380, 0.09, "square", 0.06, 0.12); },
    lychee: () => tone(620, 940, 0.28, "triangle", 0.07),
    bojjii: () => { tone(260, 150, 0.14, "square", 0.08); tone(240, 140, 0.16, "square", 0.08, 0.17); },
  };
  const SFX = {
    swish: () => noise(0.06, 0.08, 3000),
    bap: () => { noise(0.08, 0.2, 1800); tone(320, 160, 0.07, "square", 0.05); },
    pow: () => { noise(0.16, 0.3, 900); tone(180, 60, 0.16, "square", 0.07); },
    block: () => { tone(1300, 900, 0.06, "square", 0.04); noise(0.05, 0.1, 4000); },
    shoot: () => tone(300, 900, 0.18, "triangle", 0.06),
    poof: () => noise(0.14, 0.15, 1200),
    jump: () => tone(300, 520, 0.1, "square", 0.03),
    round: () => [523, 659].forEach((f, i) => tone(f, 0, 0.14, "square", 0.05, i * 0.12)),
    fight: () => { tone(880, 0, 0.09, "square", 0.08); tone(1320, 0, 0.2, "square", 0.07, 0.08); },
    ko: () => { tone(700, 90, 0.7, "sawtooth", 0.06); noise(0.4, 0.2, 700); },
    fanfare: () => [523, 659, 784, 1046, 784, 1046].forEach((f, i) => tone(f, 0, 0.14, "square", 0.05, i * 0.11)),
    sad: () => [392, 370, 349, 294].forEach((f, i) => tone(f, i === 3 ? 200 : 0, i === 3 ? 0.5 : 0.18, "triangle", 0.07, i * 0.2)),
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
  let state = "menu";       // menu, intro, fight, ko, over, paused
  let pausedFrom = null;
  let stateT = 0;           // ms spent in the current state
  let opp = "bojjii";       // who Peaches is fighting
  let round = 0, timeLeft = ROUND_SECS * 1000, clock = 0;
  let wins = { p1: 0, p2: 0 };
  let roundResult = null;   // { winner: fighter | null, how: "ko" | "time", perfect }
  let freezeT = 0, shakeT = 0, flashT = 0;
  let record = { bojjii: 0, lychee: 0 };
  try { Object.assign(record, JSON.parse(store.get(WINS_KEY)) || {}); } catch (e) { /* fresh record */ }
  let p1 = null, p2 = null;
  const shots = [];
  const bits = [];
  const popups = [];
  let cheerT = 0;           // Riot and Beyonce flap when someone lands a big hit

  function makeInput() {
    return { left: false, right: false, up: false, bap: -1e9, kick: -1e9, special: -1e9 };
  }
  const pin = makeInput();      // the player's buttons
  const cin = makeInput();      // the CPU's buttons
  const motion = [];            // recent ↓ and → presses, for the ↓→+BAP special
  const ai = { next: 0 };

  function makeFighter(id, x, face, input, side) {
    const C = CHARS[id];
    const head = IMG[id], body = IMG[id + "Body"];
    const bw = body.width * 2, bh = body.height * 2;
    const hw = head.width * C.headScale, hh = head.height * C.headScale;
    return {
      id, C, x, y: FLOOR_Y, vx: 0, vy: 0, kb: 0, face, input, side,
      hp: MAX_HP, trail: MAX_HP, trailT: 0,
      state: "idle", t: 0, move: null, didHit: false, shotOut: null, cool: 0, stun: 0,
      holdBack: false, bw, bh, hw, hh, height: bh + hh - C.headDrop,
    };
  }

  function setState(s) { state = s; stateT = 0; }

  function startMatch(o) {
    audio();
    opp = o;
    wins = { p1: 0, p2: 0 };
    round = 0;
    menu.hidden = true;
    overMenu.hidden = true;
    canvas.focus({ preventScroll: true });
    nextRound();
  }

  function showMenu() {
    setState("menu");
    overMenu.hidden = true;
    menu.hidden = false;
    menu.querySelector("button").focus({ preventScroll: true });
    syncPad();
  }

  function nextRound() {
    round++;
    p1 = makeFighter("peaches", 96, 1, pin, 0);
    p2 = makeFighter(opp, 224, -1, cin, 1);
    Object.assign(pin, makeInput(), { left: pin.left, right: pin.right, up: pin.up });
    Object.assign(cin, makeInput());
    shots.length = bits.length = popups.length = 0;
    timeLeft = ROUND_SECS * 1000;
    roundResult = null;
    freezeT = 0;
    ai.next = 600;
    setState("intro");
    SFX.round();
    syncPad();
  }

  function endRound(winner, how) {
    if (roundResult) return;
    roundResult = { winner, how, perfect: !!winner && winner.hp >= MAX_HP };
    if (winner) {
      wins[winner === p1 ? "p1" : "p2"]++;
      winner.state = "win"; winner.t = 0;
      burst(winner.x, winner.y - winner.height - 6, 18, ["#ff8cc6", "#ffd23f", "#7cc6ff", "#c9d86a"], 0.12); // confetti
    }
    setState("ko");
  }

  function finishRound() {
    const champ = wins.p1 >= WINS_NEEDED ? "p1" : wins.p2 >= WINS_NEEDED ? "p2" : null;
    if (champ || round >= 5) {
      const playerWon = champ ? champ === "p1" : wins.p1 >= wins.p2;
      if (playerWon) { record[opp] = (record[opp] || 0) + 1; store.set(WINS_KEY, JSON.stringify(record)); }
      roundResult.matchWinner = playerWon ? p1 : p2;
      (playerWon ? SFX.fanfare : SFX.sad)();
      setTimeout(() => VOICES[roundResult.matchWinner.id](), 700);
      setState("over");
      syncPad();
    } else {
      nextRound();
    }
  }

  function pause() {
    if (state === "intro" || state === "fight" || state === "ko") {
      pausedFrom = state;
      setState("paused");
      pin.left = pin.right = pin.up = false;
      document.querySelectorAll(".pad .is-down").forEach((b) => b.classList.remove("is-down"));
      syncPad();
    }
  }
  function resume() {
    if (state !== "paused") return;
    setState(pausedFrom);
    if (pausedFrom === "ko") stateT = 1200; // skip straight to the "wins" part
    syncPad();
  }

  /* ---------- Fighting ---------- */
  const grounded = (f) => f.y >= FLOOR_Y && f.vy >= 0;
  const free = (f) => f.state === "idle" || f.state === "walk";
  const fresh = (pressT) => clock - pressT < 160;      // a press is remembered briefly (input buffer)
  const ownShot = (f) => shots.some((s) => s.owner === f);

  function startMove(f, name) {
    f.state = "attack";
    f.move = name;
    f.t = 0;
    f.didHit = false;
    f.shotDone = false;
    if (grounded(f)) f.vx = 0;
    if (name === "special") { f.cool = MOVES.special.cooldown; }
    else SFX.swish();
  }

  function hurtbox(f) {
    return { x0: f.x - f.bw / 2, x1: f.x + f.bw / 2, y0: f.y - f.height, y1: f.y };
  }

  function hitbox(f) {
    const m = MOVES[f.move];
    const front = f.x + f.face * (f.bw / 2);
    const tip = front + f.face * (m.reach + 6);
    const y = f.move === "kick" ? f.y - 10 : f.y - f.bh + 6;
    return { x0: Math.min(front, tip), x1: Math.max(front, tip), y0: y - 7, y1: y + 7 };
  }

  const overlap = (a, b) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;

  function applyHit(att, def, m, word, x, y) {
    if (def.state === "ko" || state !== "fight") return;
    const dmg = Math.round(m.dmg * att.C.power);
    const blocking = def.holdBack && grounded(def) && (free(def) || def.state === "blockstun");
    if (blocking) {
      def.hp -= Math.max(1, Math.round(dmg * 0.15));
      def.state = "blockstun"; def.t = 0; def.stun = m.block;
      def.kb = att.face * m.push * 0.7;
      SFX.block();
      burst(x, y, 6, ["#ffffff", "#c9f0ff"], 0.08);
      popup("BLOCK", x, y - 8, "#c9f0ff", 7);
    } else {
      def.hp -= dmg;
      def.state = "hit"; def.t = 0; def.stun = m.stun;
      def.kb = att.face * m.push;
      if (!grounded(def)) def.vy = -140;
      freezeT = m.heavy ? 110 : 70;
      if (m.heavy && !reduceMotion) shakeT = 200;
      (m.heavy ? SFX.pow : SFX.bap)();
      burst(x, y, m.heavy ? 14 : 8, [def.C.main, def.C.light, "#ffd23f", "#ffffff"]);
      popup(word, x, y - 10, m.heavy ? "#ffd23f" : "#ff8cc6", m.heavy ? 18 : 14, true);
      if (m.heavy) cheerT = 900;
    }
    def.trailT = 500;
    def.move = null;
    if (def.hp <= 0) {
      def.hp = 0;
      def.state = "ko"; def.t = 0;
      def.vy = -230; def.kb = att.face * 170;
      freezeT = 350;
      flashT = reduceMotion ? 0 : 120;
      if (!reduceMotion) shakeT = 350;
      cheerT = 2000;
      SFX.ko();
      endRound(att, "ko");
    }
  }

  function updateFighter(f, o, dt) {
    const s = dt / 1000;
    const inp = f.input;
    f.t += dt;
    if (f.cool > 0) f.cool -= dt;
    if (f.trailT > 0) f.trailT -= dt; else if (f.trail > f.hp) f.trail = Math.max(f.hp, f.trail - dt * 0.06);

    const dir = (inp.right ? 1 : 0) - (inp.left ? 1 : 0);
    if (grounded(f) && (free(f) || f.state === "blockstun")) f.face = o.x >= f.x ? 1 : -1;
    f.holdBack = dir !== 0 && dir === -f.face;

    const fighting = state === "fight";
    if (f.state === "idle" || f.state === "walk") {
      if (!fighting) {
        f.vx = 0;
        f.state = "idle";
      } else if (inp.up && grounded(f)) {
        f.state = "jump"; f.t = 0;
        f.vy = -f.C.jump;
        f.vx = dir * f.C.speed * 1.1;
        SFX.jump();
      } else if (fresh(inp.special) && f.cool <= 0 && !ownShot(f)) {
        inp.special = -1e9; startMove(f, "special");
      } else if (fresh(inp.kick)) {
        inp.kick = -1e9; startMove(f, "kick");
      } else if (fresh(inp.bap)) {
        inp.bap = -1e9; startMove(f, "bap");
      } else {
        f.vx = dir * f.C.speed * (f.holdBack ? 0.7 : 1);
        f.state = dir ? "walk" : "idle";
      }
    } else if (f.state === "jump") {
      if (fighting && fresh(inp.kick)) { inp.kick = -1e9; startMove(f, "kick"); }
      else if (fighting && fresh(inp.bap)) { inp.bap = -1e9; startMove(f, "bap"); }
    } else if (f.state === "attack") {
      const m = MOVES[f.move];
      if (f.move === "special") {
        if (!f.shotDone && f.t >= m.startup) {
          f.shotDone = true;
          shots.push({ owner: f, kind: f.C.shot, x: f.x + f.face * (f.bw / 2 + 6), y: f.y - 24, vx: f.face * f.C.shotSpeed, t: 0, r: f.C.shot === "woof" ? 8 : 6 });
          SFX.shoot();
          VOICES[f.id]();
        }
      } else if (!f.didHit && f.t >= m.startup && f.t < m.startup + m.active) {
        const hb = hitbox(f);
        if (overlap(hb, hurtbox(o))) {
          f.didHit = true;
          applyHit(f, o, m, pick(m.words), (hb.x0 + hb.x1) / 2, (hb.y0 + hb.y1) / 2);
        }
      }
      if (f.state === "attack" && f.t >= m.startup + m.active + m.recover) {
        f.state = grounded(f) ? "idle" : "jump"; f.move = null;
      }
    } else if (f.state === "hit" || f.state === "blockstun") {
      if (f.t >= f.stun) { f.state = grounded(f) ? "idle" : "jump"; }
    }

    // Physics
    const wasAir = !grounded(f);
    if (wasAir || f.vy < 0) f.vy += GRAVITY * s;
    if (f.state === "attack" && grounded(f)) f.vx = 0;
    if (f.state === "hit" || f.state === "blockstun" || f.state === "ko" || f.state === "win") { if (grounded(f)) f.vx = 0; }
    f.x += (f.vx + f.kb) * s;
    f.y += f.vy * s;
    f.kb *= Math.max(0, 1 - 7 * s);
    if (Math.abs(f.kb) < 2) f.kb = 0;
    if (f.y >= FLOOR_Y) {
      f.y = FLOOR_Y;
      if (f.vy > 0) {
        f.vy = 0;
        if (wasAir) {
          burst(f.x, FLOOR_Y, 4, ["#c8a070", "#e6cfa6"], 0.05);
          if (f.state === "jump" || f.state === "attack") { f.state = "idle"; f.move = null; f.vx = 0; }
        }
      }
    }
    f.x = clamp(f.x, 14, W - 14);
  }

  // Keep the two fighters from standing inside each other (jumping over is fine)
  function separate() {
    const minD = (p1.bw + p2.bw) / 2 - 6;
    const d = p2.x - p1.x;
    if (Math.abs(d) < minD && Math.abs(p1.y - p2.y) < 24) {
      const push = (minD - Math.abs(d)) / 2;
      const sgn = d === 0 ? (p1.face > 0 ? 1 : -1) : Math.sign(d);
      p1.x = clamp(p1.x - sgn * push, 14, W - 14);
      p2.x = clamp(p2.x + sgn * push, 14, W - 14);
    }
  }

  function updateShots(dt) {
    const s = dt / 1000;
    for (let i = shots.length - 1; i >= 0; i--) {
      const sh = shots[i];
      sh.t += dt;
      sh.x += sh.vx * s;
      if (sh.x < -20 || sh.x > W + 20) { shots.splice(i, 1); continue; }
      const target = sh.owner === p1 ? p2 : p1;
      const hb = hurtbox(target);
      if (target.state !== "ko" && sh.x + sh.r > hb.x0 && sh.x - sh.r < hb.x1 && sh.y + sh.r > hb.y0 && sh.y - sh.r < hb.y1) {
        shots.splice(i, 1);
        applyHit(sh.owner, target, MOVES.special, SHOT_WORDS[sh.kind], sh.x, sh.y);
        continue;
      }
    }
    // Two specials meeting in the middle cancel out
    if (shots.length === 2 && shots[0].owner !== shots[1].owner && Math.abs(shots[0].x - shots[1].x) < shots[0].r + shots[1].r) {
      const x = (shots[0].x + shots[1].x) / 2, y = shots[0].y;
      shots.length = 0;
      SFX.poof();
      burst(x, y, 14, ["#ffffff", "#ffd23f", "#ff8cc6"], 0.12);
      popup("POOF!", x, y - 10, "#ffffff", 12, true);
    }
  }

  /* ---------- CPU opponent ---------- */
  function cpuThink() {
    const c = p2, p = p1;
    const lvl = clamp(0.4 + (round - 1) * 0.05 + (opp === "lychee" ? 0.05 : 0), 0, 0.6);
    const dist = Math.abs(p.x - c.x);
    const toward = p.x > c.x ? "right" : "left";
    const away = toward === "right" ? "left" : "right";
    cin.left = cin.right = cin.up = false;
    ai.next = lerp(330, 150, lvl) * rand(0.8, 1.2);

    if (c.state === "jump" && dist < 46) { if (Math.random() < 0.6) cin.kick = clock; return; }
    const incoming = shots.find((s) => s.owner === p && Math.sign(s.vx) === Math.sign(c.x - s.x) && Math.abs(s.x - c.x) < 90);
    if (incoming && Math.random() < lvl + 0.15) {
      if (Math.random() < 0.5) { cin.up = true; cin[toward] = true; } else cin[away] = true;
      ai.next = 380;
      return;
    }
    if (p.state === "attack" && dist < 60 && Math.random() < lvl * 0.8) { cin[away] = true; ai.next = 300; return; }
    const r = Math.random();
    if (dist > 120) {
      if (c.cool <= 0 && !ownShot(c) && r < 0.35) cin.special = clock;
      else cin[toward] = true;
    } else if (dist > 44) {
      if (r < 0.1) { cin.up = true; cin[toward] = true; }
      else if (r < 0.2 && c.cool <= 0 && !ownShot(c)) cin.special = clock;
      else if (r < 0.28) cin[away] = true;
      else cin[toward] = true;
    } else {
      if (r < 0.42) cin.bap = clock;
      else if (r < 0.68) cin.kick = clock;
      else if (r < 0.84) { cin[away] = true; ai.next = 260; }
      else if (r < 0.92) { cin.up = true; cin[away] = true; }
    }
  }

  /* ---------- Effects ---------- */
  function popup(text, x, y, color, size, logo) {
    popups.push({ text, x, y, t: 0, color: color || "#fff", size: size || 7, logo: !!logo });
  }

  function burst(x, y, n, colors, speed) {
    for (let i = 0; i < n; i++) {
      const a = rand(0, Math.PI * 2), v = rand(0.03, speed || 0.12);
      bits.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 0.06, life: 0, max: rand(300, 600), color: pick(colors), size: pick([1, 2, 2, 3]) });
    }
  }

  /* ---------- Update ---------- */
  function update(dt) {
    stateT += dt;
    if (cheerT > 0) cheerT -= dt;
    if (shakeT > 0) shakeT -= dt;
    if (flashT > 0) flashT -= dt;

    if (state === "intro" && stateT >= 1700) { setState("fight"); SFX.fight(); }
    if (state === "fight") {
      timeLeft -= dt;
      if (timeLeft <= 0) {
        timeLeft = 0;
        endRound(p1.hp > p2.hp ? p1 : p2.hp > p1.hp ? p2 : null, "time");
      }
    }
    if (state === "ko" && stateT >= 2600) finishRound();
    if (state === "over" && stateT > 600 && overMenu.hidden) {
      overMenu.hidden = false;
      document.getElementById("rematch").focus({ preventScroll: true });
    }

    if (p1 && state !== "menu") {
      if (freezeT > 0) {
        freezeT -= dt;
      } else {
        clock += dt;
        if (state === "fight") {
          ai.next -= dt;
          if (ai.next <= 0 && (free(p2) || p2.state === "jump")) cpuThink();
        }
        if (state !== "fight") { cin.left = cin.right = cin.up = false; }
        updateFighter(p1, p2, dt);
        updateFighter(p2, p1, dt);
        separate();
        updateShots(dt);
      }
    }

    for (let i = bits.length - 1; i >= 0; i--) {
      const b = bits[i];
      b.life += dt;
      b.vy += 0.0005 * dt;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      if (b.life >= b.max) bits.splice(i, 1);
    }
    for (let i = popups.length - 1; i >= 0; i--) if ((popups[i].t += dt) > 800) popups.splice(i, 1);
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

  // Sky and yard never change, so they're painted once into their own layers.
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
    const sky = g.createLinearGradient(0, 30, 0, 130);
    sky.addColorStop(0, "#7d5ad4");
    sky.addColorStop(0.55, "#ff8cc6");
    sky.addColorStop(1, "#ffd08a");
    g.fillStyle = sky;
    g.fillRect(0, 0, W, H);
    // Big striped retro sunset
    g.fillStyle = "#ffd23f";
    g.beginPath(); g.arc(160, 122, 44, Math.PI, Math.PI * 2); g.fill();
    g.fillStyle = "#ff8a5c";
    [96, 104, 111, 117].forEach((y, i) => g.fillRect(110, y, 100, 2 + i));
    // Stars
    g.fillStyle = "#fff6c2";
    [[24, 40], [60, 54], [252, 44], [292, 60], [210, 36], [120, 46]].forEach(([x, y]) => { g.fillRect(x, y, 1, 3); g.fillRect(x - 1, y + 1, 3, 1); });
  });
  const YARD = layer((g) => {
    // Picket fence
    g.fillStyle = "#fff8e4";
    g.strokeStyle = "#a98fe6";
    g.lineWidth = 1;
    g.fillRect(0, 122, W, 4); g.fillRect(0, 134, W, 4);
    for (let x = -4; x < W; x += 14) {
      g.beginPath();
      g.moveTo(x, 146); g.lineTo(x, 118); g.lineTo(x + 5, 112); g.lineTo(x + 10, 118); g.lineTo(x + 10, 146);
      g.closePath(); g.fill(); g.stroke();
    }
    // Lawn, with a worn-in fighting patch
    g.fillStyle = "#8fd16a";
    g.fillRect(0, 144, W, H - 144);
    g.fillStyle = "#d9b98a";
    g.beginPath(); g.ellipse(160, FLOOR_Y + 2, 150, 14, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#c8a070";
    g.beginPath(); g.ellipse(160, FLOOR_Y + 3, 130, 9, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#6cb84a";
    for (let i = 0; i < 46; i++) {
      const x = (i * 97) % W, y = 150 + ((i * 53) % (H - 154));
      if (Math.abs(y - FLOOR_Y) < 14 && x > 20 && x < 300) continue;
      g.fillRect(x, y, 1, 3); g.fillRect(x + 2, y - 1, 1, 4); g.fillRect(x + 4, y + 1, 1, 2);
    }
    // Foreground grass edge
    g.fillStyle = "#5aa83c";
    g.fillRect(0, H - 6, W, 6);
    for (let x = 0; x < W; x += 5) g.fillRect(x, H - 9 + (x % 3), 2, 4);
  });

  function drawBackground(now) {
    ctx.drawImage(SKY, 0, 0, W, H);
    // Whoever isn't fighting watches over the fence
    const watcher = opp === "bojjii" ? "lychee" : "bojjii";
    const wImg = IMG[watcher];
    const peek = state === "menu" ? 0 : (reduceMotion ? 0 : Math.round(Math.sin(now / 400)));
    sprite(wImg, 196, 114 - wImg.height * 2 + 8 + peek, 2);
    ctx.drawImage(YARD, 0, 0, W, H);
    // Riot and Beyonce cheer from the fence posts
    const flap = cheerT > 0 && !reduceMotion ? Math.floor(now / 90) % 2 : 0;
    sprite(IMG.riot, 22, 92 - flap * 3, 2);
    sprite(IMG.beyonce, 274, 92 - (1 - flap) * 3 * (cheerT > 0 && !reduceMotion ? 1 : 0), 2);
  }

  // Paws wear little boxing gloves
  function paw(x, y, C) {
    ctx.fillStyle = "#2b1a52";
    ctx.fillRect(x - 1, y, 8, 5);
    ctx.fillRect(x, y - 1, 6, 7);
    ctx.fillStyle = C.glove;
    ctx.fillRect(x, y, 6, 5);
    ctx.fillStyle = "rgba(255, 255, 255, .7)";
    ctx.fillRect(x + 1, y + 1, 2, 1);
    ctx.fillStyle = "#fff8e4";
    ctx.fillRect(x, y + 4, 6, 1);
  }

  function arm(x0, x1, y, C) {
    if (x1 <= x0) return;
    ctx.fillStyle = "#2b1a52";
    ctx.fillRect(x0, y, x1 - x0, 5);
    ctx.fillStyle = C.main;
    ctx.fillRect(x0, y + 1, x1 - x0, 3);
  }

  function drawTail(f, now, bt) {
    const C = f.C, x = -f.bw / 2;
    const wag = reduceMotion ? 0 : Math.round(Math.sin(now / 150 + f.side) * 1.5);
    if (f.id === "peaches") {
      ctx.fillStyle = C.main;
      ctx.fillRect(x - 6, bt - 4 + wag, 10, 12);
      ctx.fillRect(x - 9, bt + wag, 4, 8);
      ctx.fillStyle = C.light;
      ctx.fillRect(x - 4, bt - 4 + wag, 5, 3);
      ctx.fillRect(x - 9, bt + 1 + wag, 2, 4);
    } else if (f.id === "lychee") {
      for (let i = 0; i < 7; i++) {
        ctx.fillStyle = i % 2 ? C.dark : C.main;
        ctx.fillRect(x - 2 - i + (i > 4 ? (i - 4) * 2 : 0), f.bh * -0.3 - i * 4 + (i > 3 ? wag : 0), 3, 5);
      }
    } else {
      ctx.fillStyle = C.main;
      ctx.fillRect(x - 9, bt + 8 + wag, 12, 7);
      ctx.fillStyle = C.light;
      ctx.fillRect(x - 11, bt + 10 + wag, 4, 4);
    }
  }

  function drawFighter(f, now) {
    const C = f.C;
    const flash = freezeT > 0 && f.state === "hit" || (f.state === "ko" && f.t < 200);
    const head = IMG[f.id + (flash ? "Flash" : "")], body = IMG[f.id + "Body" + (flash ? "Flash" : "")];
    let bob = 0, lean = 0, tilt = 0;
    if (f.state === "idle" && !reduceMotion) bob = Math.floor(now / 300 + f.side) % 2;
    if (f.state === "walk" && !reduceMotion) bob = Math.floor(now / 120) % 2;
    if (f.state === "win" && !reduceMotion) bob = Math.abs(Math.round(Math.sin(now / 140) * 4));
    if (f.state === "attack") lean = 2;
    if (f.state === "hit") { lean = -2; tilt = -0.12; }

    // Shadow
    ctx.fillStyle = "rgba(43, 26, 82, .25)";
    ctx.beginPath(); ctx.ellipse(Math.round(f.x), FLOOR_Y + 1, f.bw / 2 + 2, 3, 0, 0, Math.PI * 2); ctx.fill();

    ctx.save();
    ctx.translate(Math.round(f.x), Math.round(f.y) - bob);
    if (f.state === "ko") ctx.rotate(-f.face * Math.min(1, f.t / 300) * Math.PI / 2);
    ctx.scale(f.face, 1);
    if (tilt) ctx.rotate(tilt);
    ctx.translate(lean, 0);

    const bt = -f.bh;                                  // body top
    const ht = bt - f.hh + C.headDrop;                 // head top
    const front = f.bw / 2;
    const shoulder = bt + 6;
    drawTail(f, now, bt);

    // Back paw (behind the body)
    const m = f.move && MOVES[f.move];
    if (f.state !== "ko") paw(front - 12, shoulder + 3, C);

    ctx.drawImage(body, -f.bw / 2, bt, f.bw, f.bh);
    ctx.drawImage(head, -f.hw / 2, ht, f.hw, f.hh);

    // Front paw / foot by pose
    if (f.state === "attack" && f.move !== "special") {
      const t = f.t;
      const out = t < m.startup ? t / m.startup * 0.3 : t < m.startup + m.active ? 1 : Math.max(0, 1 - (t - m.startup - m.active) / m.recover);
      if (f.move === "bap") {
        const px = front - 4 + Math.round(out * m.reach);
        arm(front - 6, px, shoulder + 1, C);
        paw(px, shoulder, C);
      } else {
        const fx = front - 6 + Math.round(out * m.reach);
        arm(front - 8, fx, -12, C);
        ctx.fillStyle = "#2b1a52"; ctx.fillRect(fx - 1, -15, 10, 8);
        ctx.fillStyle = C.light; ctx.fillRect(fx, -14, 8, 6);
        paw(front - 4, shoulder, C);
      }
    } else if (f.state === "attack") {
      const glow = f.t < m.startup;
      paw(front - 2, shoulder - 2, C);
      paw(front - 2, shoulder + 6, C);
      if (glow) sparkles(front + 8, shoulder + 4, 6 + (f.t / m.startup) * 4, now, shotColor(f.C.shot));
    } else if (f.state === "hit" || f.state === "ko") {
      paw(front - 6, bt - 6, C);
      paw(-front, bt - 4, C);
    } else if (f.state === "win") {
      paw(front - 4, shoulder - 1, C);
      partyHat(0, ht + 3, f.id === "bojjii" ? 12 : 10, f.id === "bojjii" ? 16 : 14);
    } else if (f.holdBack || f.state === "blockstun") {
      paw(front - 6, ht + f.hh / 2 - 2, C);
      paw(front - 4, ht + f.hh / 2 + 6, C);
      if (f.state === "blockstun") {
        ctx.strokeStyle = "rgba(201, 240, 255, .9)";
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(front - 2, -f.height / 2, f.height / 2, -0.9, 0.9); ctx.stroke();
      }
    } else {
      paw(front - 4, shoulder - 1, C);     // guard up, boxer style
    }
    ctx.restore();

    // Dizzy stars on a K.O.
    if (f.state === "ko" && f.t > 400) {
      const cx = f.x - f.face * f.height * 0.7;
      sparkles(cx, FLOOR_Y - 12, 8, now, "#ffd23f");
    }
  }

  // Striped party hat with a pom-pom, centered on x with its brim at baseY
  function partyHat(x, baseY, w, h) {
    const top = baseY - h;
    for (let i = 0; i <= h; i++) {
      const half = Math.max(1, Math.round((w / 2) * (i / h)));
      ctx.fillStyle = "#2b1a52";
      ctx.fillRect(x - half - 1, top + i, half * 2 + 2, 1);
    }
    for (let i = 1; i < h; i++) {
      const half = Math.round((w / 2) * (i / h));
      if (half < 1) continue;
      ctx.fillStyle = Math.floor(i / 3) % 2 ? "#ffd23f" : "#ff8cc6";
      ctx.fillRect(x - half, top + i, half * 2, 1);
    }
    ctx.fillStyle = "#2b1a52";
    ctx.fillRect(x - 3, top - 4, 6, 5);
    ctx.fillStyle = "#fff8e4";
    ctx.fillRect(x - 2, top - 3, 4, 3);
  }

  function shotColor(kind) {
    return kind === "fluff" ? "#fbe3b8" : kind === "hairball" ? "#c9d86a" : "#c9f0ff";
  }

  function sparkles(x, y, r, now, color) {
    const spin = reduceMotion ? 0 : now / 200;
    ctx.fillStyle = color || "#fff6c2";
    for (let i = 0; i < 4; i++) {
      const a = spin + (i * Math.PI) / 2;
      const sx = Math.round(x + Math.cos(a) * r), sy = Math.round(y + Math.sin(a) * r * 0.8);
      ctx.fillRect(sx - 1, sy - 2, 2, 4); ctx.fillRect(sx - 2, sy - 1, 4, 2);
    }
  }

  function drawShot(sh, now) {
    const x = Math.round(sh.x), y = Math.round(sh.y), dir = Math.sign(sh.vx);
    if (sh.kind === "woof") {
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        const r = 4 + i * 4 + (reduceMotion ? 0 : (sh.t / 60) % 4);
        ctx.strokeStyle = i === 1 ? "#ffd23f" : "#ffffff";
        ctx.beginPath(); ctx.arc(x - dir * 8, y, r, dir > 0 ? -0.8 : Math.PI - 0.8, dir > 0 ? 0.8 : Math.PI + 0.8); ctx.stroke();
      }
      text("WOOF", x - dir * 4, y - 13, { size: 5, color: "#fff8e4" });
      return;
    }
    const fluff = sh.kind === "fluff";
    // Trail puffs
    ctx.fillStyle = fluff ? "rgba(251, 227, 184, .6)" : "rgba(160, 170, 110, .6)";
    for (let i = 1; i <= 3; i++) ctx.fillRect(x - dir * (i * 6 + 2) - 2, y - 2 + (i % 2), 4 - (i > 2 ? 1 : 0), 4 - (i > 2 ? 1 : 0));
    ctx.fillStyle = "#2b1a52";
    ctx.beginPath(); ctx.arc(x, y, sh.r + 1, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = fluff ? "#eeaa55" : "#8a8f6a";
    ctx.beginPath(); ctx.arc(x, y, sh.r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = fluff ? "#fbe3b8" : "#c9d86a";
    const spin = reduceMotion ? 0 : sh.t / 80;
    for (let i = 0; i < 3; i++) {
      const a = spin + i * 2.1;
      ctx.fillRect(Math.round(x + Math.cos(a) * 3) - 1, Math.round(y + Math.sin(a) * 3) - 1, 2, 2);
    }
    if (!fluff) { ctx.fillStyle = "#4a4650"; ctx.fillRect(x - 3, y - 1, 6, 1); ctx.fillRect(x - 1, y + 2, 4, 1); }
  }

  function drawHud(now) {
    // Health bars: they drain toward the outside edges, with a red "ouch" trail
    const bar = (f, x, w, alignRight) => {
      ctx.fillStyle = "#2b1a52";
      ctx.fillRect(x - 2, 8, w + 4, 11);
      ctx.fillStyle = "#5a2a4a";
      ctx.fillRect(x, 10, w, 7);
      const tw = Math.round(w * f.trail / MAX_HP), hw = Math.round(w * f.hp / MAX_HP);
      ctx.fillStyle = "#ff4d6d";
      ctx.fillRect(alignRight ? x + w - tw : x, 10, tw, 7);
      ctx.fillStyle = f.hp > 30 ? "#ffd23f" : (reduceMotion || Math.floor(now / 200) % 2 ? "#ff8a1e" : "#ffd23f");
      ctx.fillRect(alignRight ? x + w - hw : x, 10, hw, 7);
      ctx.fillStyle = "rgba(255, 255, 255, .5)";
      ctx.fillRect(alignRight ? x + w - hw : x, 10, hw, 2);
    };
    bar(p1, 24, 110, false);
    bar(p2, W - 134, 110, true);
    sprite(IMG.peaches, 4, 6, 1);
    sprite(IMG[opp], W - 4 - IMG[opp].width, 6, 1);
    text(p1.C.name.toUpperCase(), 24, 26, { size: 6, align: "left", color: "#fff8e4" });
    text(p2.C.name.toUpperCase(), W - 24, 26, { size: 6, align: "right", color: "#fff8e4" });
    // Round wins
    for (let i = 0; i < WINS_NEEDED; i++) {
      ctx.fillStyle = i < wins.p1 ? "#ffd23f" : "rgba(43, 26, 82, .5)";
      ctx.fillRect(126 - i * 9, 22, 6, 6);
      ctx.fillStyle = i < wins.p2 ? "#ffd23f" : "rgba(43, 26, 82, .5)";
      ctx.fillRect(W - 132 + i * 9, 22, 6, 6);
    }
    // Special move ready meters
    [[p1, 24, false], [p2, W - 64, true]].forEach(([f, x]) => {
      const ready = f.cool <= 0 && !ownShot(f);
      const fill = ready ? 1 : 1 - Math.max(0, f.cool) / MOVES.special.cooldown;
      ctx.fillStyle = "rgba(43, 26, 82, .6)";
      ctx.fillRect(x, 32, 40, 4);
      ctx.fillStyle = ready ? shotColor(f.C.shot) : "#a98fe6";
      ctx.fillRect(x, 32, Math.round(40 * fill), 4);
    });
    // Timer
    ctx.fillStyle = "#2b1a52";
    ctx.fillRect(W / 2 - 13, 5, 26, 18);
    const secs = Math.ceil(timeLeft / 1000);
    text(String(secs).padStart(2, "0"), W / 2, 15, { size: 10, outline: false, color: secs <= 10 ? "#ff6b6b" : "#ffd23f" });
  }

  function drawMenu(now) {
    panel(20, 30, 280, 152);
    text("Street Fluffers", W / 2, 54, { font: "logo", size: 34, color: "#ffd23f", outline: "#2b1a52", ow: 6 });
    text("THE BACKYARD BRAWL", W / 2, 76, { size: 7, color: "#ff5a3c", outline: false });
    // Peaches vs. the other two
    const bob = reduceMotion ? 0 : Math.round(Math.sin(now / 250) * 1.5);
    sprite(IMG.peaches, 58, 92 + bob, 3);
    text("VS", 160, 112, { font: "logo", size: 26, color: "#ff8cc6", outline: "#2b1a52", ow: 5 });
    sprite(IMG.bojjii, 200, 96 - bob, 3);
    sprite(IMG.lychee, 238, 112 + bob, 2);
    text("PEACHES", 79, 140, { size: 6, color: "#b8682a", outline: false });
    text("BOJJII OR LYCHEE?", 236, 144, { size: 5, color: "#4a4650", outline: false });
    const w = (record.bojjii || 0) + (record.lychee || 0);
    text(w ? `WINS: BOJJII ${record.bojjii || 0}  LYCHEE ${record.lychee || 0}` : "Pick your opponent:", W / 2, 164, { size: 5, color: "#7d5ad4", outline: false });
  }

  function drawCenter(now) {
    if (state === "intro") {
      if (stateT < 1100) text(`Round ${round}`, W / 2, 84, { font: "logo", size: 34, color: "#ffd23f", outline: "#2b1a52", ow: 6 });
      else text("FIGHT!", W / 2, 84, { font: "logo", size: 46, color: "#ff5a3c", outline: "#2b1a52", ow: 7 });
    } else if (state === "ko" && roundResult) {
      const r = roundResult;
      if (stateT < 1200) {
        const big = r.how === "ko" ? "K.O.!" : "TIME!";
        text(big, W / 2, 84, { font: "logo", size: 50, color: "#ff4d6d", outline: "#2b1a52", ow: 7 });
      } else if (r.winner) {
        text(`${r.winner.C.name} wins!`, W / 2, 80, { font: "logo", size: 30, color: "#ffd23f", outline: "#2b1a52", ow: 6 });
        if (r.perfect) text("PERFECT!", W / 2, 104, { size: 10, color: "#ff8cc6" });
      } else {
        text("Draw!", W / 2, 84, { font: "logo", size: 34, color: "#fff8e4", outline: "#2b1a52", ow: 6 });
      }
    } else if (state === "paused") {
      ctx.fillStyle = "rgba(43, 26, 82, .55)";
      ctx.fillRect(0, 0, W, H);
      text("Paused", W / 2, H / 2 - 12, { font: "logo", size: 40, color: "#fff8e4", outline: "#2b1a52", ow: 6 });
      text("CLICK OR SPACE TO KEEP BRAWLING", W / 2, H / 2 + 22, { size: 6 });
    }
  }

  function drawOver(now) {
    const champ = roundResult.matchWinner;
    const loser = champ === p1 ? p2 : p1;
    panel(30, 40, 260, 140);
    const won = champ === p1;
    text(won ? "You win!" : `${champ.C.name} wins!`, W / 2, 62, { font: "logo", size: 30, color: won ? "#ffd23f" : "#ff8cc6", outline: "#2b1a52", ow: 5 });
    const big = champ.id === "bojjii" ? 3 : 2;
    const img = IMG[champ.id];
    const py = 94 - (reduceMotion ? 0 : Math.abs(Math.round(Math.sin(now / 160) * 3)));
    sprite(img, 60, py, big);
    partyHat(60 + (img.width * big) / 2, py + 3, big === 3 ? 12 : 10, big === 3 ? 16 : 14);
    text(`"${champ.C.win}"`, 182, 92, { size: 5, color: "#2b1a52", outline: false });
    text(loser.C.lose, 182, 108, { size: 5, color: "#7d5ad4", outline: false });
    text(`ROUNDS ${wins.p1} - ${wins.p2}`, 182, 126, { size: 7, color: "#2b1a52", outline: false });
    text(`WINS VS ${opp.toUpperCase()}: ${record[opp] || 0}`, W / 2, 146, { size: 6, color: "#ff5a3c", outline: false });
  }

  function draw(now) {
    ctx.setTransform(K, 0, 0, K, 0, 0);
    ctx.imageSmoothingEnabled = false;
    if (shakeT > 0) ctx.translate(Math.round(rand(-3, 3)), Math.round(rand(-2, 2)));

    drawBackground(now);
    if (state === "menu") { drawMenu(now); return; }

    // Whoever is attacking draws on top
    const order = p2.state === "attack" ? [p1, p2] : [p2, p1];
    order.forEach((f) => drawFighter(f, now));
    shots.forEach((s) => drawShot(s, now));
    bits.forEach((b) => {
      ctx.globalAlpha = 1 - b.life / b.max;
      ctx.fillStyle = b.color;
      ctx.fillRect(Math.round(b.x), Math.round(b.y), b.size, b.size);
    });
    ctx.globalAlpha = 1;
    popups.forEach((p) => {
      ctx.globalAlpha = Math.min(1, 2 - (p.t / 800) * 2);
      const y = p.y - (p.t / 800) * 14;
      if (p.logo) text(p.text, clamp(p.x, 30, W - 30), y, { font: "logo", size: p.size, color: p.color, ow: 4 });
      else text(p.text, clamp(p.x, 20, W - 20), y, { size: p.size, color: p.color });
    });
    ctx.globalAlpha = 1;

    drawHud(now);
    if (state === "over") drawOver(now);
    else drawCenter(now);
    if (flashT > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${(flashT / 120) * 0.6})`;
      ctx.fillRect(0, 0, W, H);
    }
  }

  /* ---------- Input ---------- */
  function syncPad() {
    pad.hidden = !(touchUI && (state === "intro" || state === "fight" || state === "ko"));
  }

  function primary() {
    if (state === "paused") resume();
    else if (state === "over" && stateT > 900) startMatch(opp);
  }

  // Special move the old way: ↓ then → (toward the opponent), then BAP
  function motionSpecial() {
    const f = p1;
    if (!f) return false;
    const n = motion.length;
    return n >= 2 && motion[n - 2].d === "down" && motion[n - 1].d === (f.face > 0 ? "right" : "left") && clock - motion[n - 2].t < 450;
  }

  function press(action) {
    if (state === "paused") { resume(); return; }
    if (action === "bap" && motionSpecial()) { motion.length = 0; pin.special = clock; return; }
    pin[action] = clock;
  }

  menu.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-opp]");
    if (btn) startMatch(btn.dataset.opp);
  });
  document.getElementById("rematch").addEventListener("click", () => startMatch(opp));
  document.getElementById("toMenu").addEventListener("click", showMenu);

  canvas.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    canvas.focus({ preventScroll: true });
    if (e.pointerType === "touch" && !touchUI) { touchUI = true; syncPad(); }
    primary();
  });

  // Touch pad: hold buttons for walking/jumping, tap buttons for attacks
  pad.querySelectorAll("button").forEach((btn) => {
    const hold = btn.dataset.hold, act = btn.dataset.press;
    const down = (e) => {
      e.preventDefault();
      try { btn.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      btn.classList.add("is-down");
      audio();
      if (hold) { if (state === "paused") resume(); pin[hold] = true; }
      else press(act);
    };
    const up = () => {
      btn.classList.remove("is-down");
      if (hold) pin[hold] = false;
    };
    btn.addEventListener("pointerdown", down);
    btn.addEventListener("pointerup", up);
    btn.addEventListener("pointercancel", up);
    btn.addEventListener("lostpointercapture", up);
    btn.addEventListener("contextmenu", (e) => e.preventDefault());
  });

  const DIRS = { arrowleft: "left", a: "left", arrowright: "right", d: "right", arrowup: "up", w: "up", arrowdown: "down", s: "down" };
  const ATTACKS = { j: "bap", z: "bap", k: "kick", x: "kick", l: "special", c: "special" };
  window.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.key === "Tab" || e.key === "Shift") return;
    if (e.target.tagName === "BUTTON" && (e.key === " " || e.key === "Enter")) return; // let buttons work
    const key = e.key.toLowerCase();
    let handled = true;
    if (key in DIRS) {
      const d = DIRS[key];
      if (d !== "down") pin[d] = true;
      if (!e.repeat) { motion.push({ d, t: clock }); if (motion.length > 4) motion.shift(); }
    } else if (key in ATTACKS) {
      if (!e.repeat && state !== "menu" && state !== "over") press(ATTACKS[key]);
    } else if (key === " " || key === "enter") { if (!e.repeat) primary(); }
    else if (key === "m") setMuted(!muted);
    else if (key === "p") (state === "paused" ? resume() : pause());
    else if (key === "escape") {
      if (state === "intro" || state === "fight" || state === "ko") pause();
      else if (embedded) { try { window.parent.postMessage({ yvyArcade: "close" }, location.origin); } catch (err) { /* ignore */ } }
    } else if (state === "menu" && (key === "1" || key === "2")) startMatch(key === "1" ? "bojjii" : "lychee");
    else handled = false;
    if (handled) e.preventDefault();
  });
  window.addEventListener("keyup", (e) => {
    const d = DIRS[e.key.toLowerCase()];
    if (d && d !== "down") pin[d] = false;
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
  if (!embedded) menu.querySelector("button").focus({ preventScroll: true });
})();
