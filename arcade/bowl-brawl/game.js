/*
 * 🥣 Bowl Brawl: Peaches vs. Lychee, a YvyGrounds arcade game.
 * A quick-draw duel over the food bowl. Bojjii referees: when his flag goes
 * up and the big "!" pops, the first pet to pounce wins the round. Pounce
 * early and you trip over your own paws. First to 3 wins the bowl.
 *
 * Plain canvas, no libraries. Drawn on a 320x240 "pixel" grid, scaled K times.
 */
(function () {
  "use strict";

  const W = 320, H = 240, K = 3;
  const WIN_SCORE = 3;
  const BEST_KEY = "yvy-bowl-best";
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
  const secs = (ms) => (ms / 1000).toFixed(3);

  if (document.fonts) {
    document.fonts.load('8px "Press Start 2P"');
    document.fonts.load('40px "Chewy"');
  }

  /* ---------- Pixel sprites (letter grids, like js/pixels.js) ---------- */
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
    // Bojjii the referee (German Shepherd x Aussie, we think)
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
    crown: {
      colors: { Y: "#ffd23f", R: "#ff4d6d" },
      grid: ["Y..Y..Y", "YY.Y.YY", "YYYYYYY", "YRYYYRY", "YYYYYYY"],
    },
    butterfly: {
      colors: { P: "#ff8cc6", K: "#2b1a52", Y: "#ffd23f" },
      grid: ["PP.K.PP", "PYPKPYP", ".PPKPP.", "PP.K.PP", "P..K..P"],
    },
  };

  function bake(name) {
    const art = ART[name];
    const c = document.createElement("canvas");
    c.width = art.grid[0].length;
    c.height = art.grid.length;
    const g = c.getContext("2d");
    art.grid.forEach((row, y) => [...row].forEach((ch, x) => {
      if (art.colors[ch]) { g.fillStyle = art.colors[ch]; g.fillRect(x, y, 1, 1); }
    }));
    return c;
  }
  const IMG = {};
  Object.keys(ART).forEach((name) => { IMG[name] = bake(name); });

  const BOWL = { x: 160, y: 176 };
  const FLOOR_Y = 206;      // where the pets' paws touch the floor
  const PETS = {
    peaches: { name: "Peaches", home: 78, dir: 1, key: "a",
      lose: "Peaches does her sad hamster face." },
    lychee:  { name: "Lychee",  home: 242, dir: -1, key: "l",
      lose: "Lychee pretends she wasn't hungry anyway." },
  };
  const other = (p) => (p === "peaches" ? "lychee" : "peaches");

  /* ---------- Sound (tiny WebAudio bleeps) ---------- */
  let actx = null;
  let noiseBuf = null;
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
  const SFX = {
    beat: () => tone(90, 70, 0.1, "sine", 0.12),
    go: () => { tone(880, 0, 0.09, "square", 0.08); tone(1320, 0, 0.16, "square", 0.07, 0.07); },
    pounce: () => { noise(0.1, 0.18, 1500); tone(220, 660, 0.12, "triangle", 0.06); },
    bonk: () => tone(620, 110, 0.2, "square", 0.07),
    trip: () => tone(420, 120, 0.35, "sawtooth", 0.05),
    arf: () => { tone(560, 360, 0.08, "square", 0.07, 0.15); tone(600, 380, 0.09, "square", 0.07, 0.28); },
    mrrow: () => tone(620, 940, 0.3, "triangle", 0.08, 0.15),
    flutter: () => { tone(1400, 1700, 0.04, "triangle", 0.03); tone(1400, 1700, 0.04, "triangle", 0.03, 0.09); },
    boing: () => tone(280, 620, 0.16, "square", 0.04),
    achoo: () => { tone(520, 300, 0.12, "square", 0.04); noise(0.28, 0.22, 2500, 0.12); },
    bzz: () => tone(180, 210, 0.5, "sawtooth", 0.025),
    slow: () => [392, 330, 262].forEach((f, i) => tone(f, 0, 0.14, "triangle", 0.06, i * 0.13)),
    fanfare: () => [523, 659, 784, 1046, 784, 1046].forEach((f, i) => tone(f, 0, 0.14, "square", 0.05, i * 0.11)),
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
  let state = "menu";       // menu, intro, wait, go, result, over, paused
  let stateT = 0;           // ms spent in the current state
  let mode = null;          // "peaches" / "lychee" (1 player as that pet) or "two"
  let human = null, cpu = null;
  let score = { peaches: 0, lychee: 0 };
  let round = 0, waitMs = 0, goAt = 0, cpuReact = 0, cpuEarlyAt = null, beatT = 0, flashT = 0;
  let fakeouts = [], fx = [], stars = [];
  let result = null, fastest = {}, newBest = false;
  let best = parseFloat(store.get(BEST_KEY)) || 0;

  function setState(s) { state = s; stateT = 0; }

  function startMatch(m) {
    audio();
    mode = m;
    human = m === "two" ? null : m;
    cpu = human ? other(human) : null;
    score = { peaches: 0, lychee: 0 };
    fastest = { peaches: 0, lychee: 0 };
    round = 0;
    newBest = false;
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
  }

  function nextRound() {
    round++;
    fx = [];
    stars = [];
    result = null;
    setState("intro");
  }

  function startWait() {
    waitMs = round === 1 ? rand(1500, 3000) : rand(1900, 5000);
    // Fake-outs (a butterfly, a tiny pancake, Bojjii sneezing...) start from round 2
    const count = round === 1 ? 0 : pick([0, 1, 1, 2]);
    fakeouts = [];
    for (let i = 0; i < count; i++) {
      const at = rand(500, waitMs - 600);
      if (at > 0 && fakeouts.every((f) => Math.abs(f.at - at) > 900)) {
        fakeouts.push({ at, type: pick(["butterfly", "pancake", "achoo", "fly"]), done: false });
      }
    }
    // The CPU falls for a fake-out now and then, too
    cpuEarlyAt = null;
    if (cpu) {
      const fooled = fakeouts.find(() => Math.random() < 0.08);
      if (fooled) cpuEarlyAt = fooled.at + rand(150, 300);
    }
    beatT = 0;
    setState("wait");
  }

  function startGo() {
    setState("go");
    goAt = performance.now();
    flashT = reduceMotion ? 0 : 90;
    // The CPU gets a little quicker each round
    if (cpu) cpuReact = rand(Math.max(240, 300 - round * 12), Math.max(360, 480 - round * 15));
    SFX.go();
  }

  // A pet pounces (pressed their button). Early = trip; after the "!" = first one wins.
  function press(pet, time) {
    if (state === "wait") {
      endRound({ type: "trip", loser: pet, winner: other(pet) });
    } else if (state === "go") {
      endRound({ type: "pounce", winner: pet, loser: other(pet), react: Math.max(0, time - goAt) });
    }
  }

  function endRound(r) {
    result = r;
    fx = [];
    if (r.winner) score[r.winner]++;
    if (r.type === "pounce") {
      SFX.pounce();
      setTimeout(SFX.bonk, 230);
      if (!fastest[r.winner] || r.react < fastest[r.winner]) fastest[r.winner] = r.react;
      if (r.winner === human && (!best || r.react < best)) {
        best = r.react;
        newBest = true;
        store.set(BEST_KEY, String(Math.round(best)));
      }
    } else if (r.type === "trip") {
      SFX.trip();
    } else {
      SFX.slow();
    }
    if (r.winner) (r.winner === "peaches" ? SFX.arf : SFX.mrrow)();
    setState("result");
  }

  function matchOver() {
    setState("over");
    SFX.fanfare();
    overMenu.hidden = false;
    document.getElementById("rematch").focus({ preventScroll: true });
  }

  function pause() {
    if (state === "intro" || state === "wait" || state === "go") { setState("paused"); fx = []; }
  }
  function resume() {
    if (state !== "paused") return;
    round--;          // replay the round that got interrupted
    nextRound();
  }

  /* ---------- Update ---------- */
  function update(dt) {
    stateT += dt;
    if (flashT > 0) flashT -= dt;

    if (state === "intro" && stateT >= 1300) startWait();

    if (state === "wait") {
      beatT += dt;
      if (beatT >= 700) { beatT = 0; SFX.beat(); }
      fakeouts.forEach((f) => {
        if (!f.done && stateT >= f.at) {
          f.done = true;
          fx.push({ type: f.type, t: 0 });
          ({ butterfly: SFX.flutter, pancake: SFX.boing, achoo: SFX.achoo, fly: SFX.bzz })[f.type]();
        }
      });
      if (cpuEarlyAt !== null && stateT >= cpuEarlyAt) press(cpu, performance.now());
      else if (stateT >= waitMs) startGo();
    }

    if (state === "go") {
      if (cpu && performance.now() - goAt >= cpuReact) press(cpu, goAt + cpuReact);
      else if (!cpu && stateT >= 3000) endRound({ type: "slow" });
    }

    if (state === "result" && stateT >= 2000) {
      if (score.peaches >= WIN_SCORE || score.lychee >= WIN_SCORE) matchOver();
      else nextRound();
    }

    for (let i = fx.length - 1; i >= 0; i--) if ((fx[i].t += dt) > 1500) fx.splice(i, 1);
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

  // The kitchen never changes, so it's painted once and stamped down each frame
  const ROOM = (() => {
    const c = document.createElement("canvas");
    c.width = W * K;
    c.height = H * K;
    const g = c.getContext("2d");
    g.setTransform(K, 0, 0, K, 0, 0);
    // Wall
    g.fillStyle = "#e4e6ee";
    g.fillRect(0, 0, W, 124);
    // The lavender fridge
    g.fillStyle = "#e9cdf0";
    g.fillRect(0, 0, 58, 124);
    g.fillStyle = "#d4b3de";
    g.fillRect(56, 0, 2, 124);
    g.fillRect(0, 50, 58, 2);
    g.fillStyle = "#bfa0ca";
    g.fillRect(47, 18, 3, 24);
    g.fillRect(47, 60, 3, 32);
    // Fridge magnets: a heart and a flower
    g.fillStyle = "#ff8cc6";
    g.fillRect(14, 22, 4, 3); g.fillRect(20, 22, 4, 3); g.fillRect(14, 25, 10, 3); g.fillRect(16, 28, 6, 2); g.fillRect(18, 30, 2, 2);
    g.fillStyle = "#ffd23f";
    g.fillRect(25, 72, 6, 6);
    g.fillStyle = "#7cc85a";
    g.fillRect(27, 78, 2, 8);
    // Outlet
    g.fillStyle = "#f7f7fa";
    g.fillRect(262, 72, 14, 20);
    g.fillStyle = "#b7b9c4";
    g.fillRect(266, 77, 2, 4); g.fillRect(270, 77, 2, 4); g.fillRect(266, 84, 2, 4); g.fillRect(270, 84, 2, 4);
    // Baseboard
    g.fillStyle = "#ffffff";
    g.fillRect(58, 116, W - 58, 8);
    g.fillStyle = "#c9cbd6";
    g.fillRect(58, 123, W - 58, 1);
    // Brown floor tiles
    g.fillStyle = "#6e5a50";
    g.fillRect(0, 124, W, H - 124);
    g.fillStyle = "#5a4840";
    for (let y = 124, row = 0; y < H; y += 30, row++) {
      g.fillRect(0, y, W, 2);
      for (let x = (row % 2) * 30; x < W; x += 60) g.fillRect(x, y, 2, 30);
    }
    g.fillStyle = "rgba(255, 255, 255, .07)";
    for (let i = 0; i < 24; i++) g.fillRect((i * 83) % W, 130 + ((i * 37) % 100), 10, 2);
    return c;
  })();

  function drawBowl() {
    const { x, y } = BOWL;
    ctx.fillStyle = "#bfb2a3";
    ctx.beginPath(); ctx.ellipse(x, y + 2, 42, 12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#d8cdc0";
    ctx.beginPath(); ctx.ellipse(x, y, 42, 11, 0, 0, Math.PI * 2); ctx.fill();
    [[-18, "#bfe3f2"], [18, "#a0643a"]].forEach(([dx, inside]) => {
      ctx.fillStyle = "#ffffff";
      ctx.beginPath(); ctx.ellipse(x + dx, y - 2, 15, 7, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = inside;
      ctx.beginPath(); ctx.ellipse(x + dx, y - 3, 11, 4, 0, 0, Math.PI * 2); ctx.fill();
    });
    ctx.fillStyle = "#7a4526"; // kibble bits
    [[12, -4], [16, -2], [20, -5], [23, -3], [18, -6], [14, -1]].forEach(([dx, dy]) => ctx.fillRect(x + dx, y + dy, 2, 2));
  }

  function drawBojjii(now) {
    const flagUp = state === "go" || (state === "result" && result && result.type === "pounce" && stateT < 900);
    const sneezing = fx.some((f) => f.type === "achoo" && f.t < 600);
    const bob = reduceMotion ? 0 : Math.round(Math.sin(now / 400));
    // Body
    ctx.fillStyle = "#2b2433";
    ctx.beginPath(); ctx.ellipse(160, 134, 15, 13, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#c98a4a";
    ctx.beginPath(); ctx.ellipse(160, 133, 7, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(149, 142, 6, 5); ctx.fillRect(165, 142, 6, 5);
    sprite(IMG.bojjii, 142, 94 + bob + (sneezing ? 3 : 0), 3);
    // The flag: down, wobbling (sneeze fake-out) or up (GO!)
    ctx.strokeStyle = "#8a5a2b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (flagUp) {
      ctx.moveTo(178, 138); ctx.lineTo(178, 96);
      ctx.stroke();
      ctx.fillStyle = "#ff4d6d";
      ctx.beginPath(); ctx.moveTo(179, 96); ctx.lineTo(196, 101); ctx.lineTo(179, 107); ctx.fill();
    } else {
      const lift = sneezing ? 8 : 0;
      ctx.moveTo(174, 138); ctx.lineTo(190, 150 - lift * 2);
      ctx.stroke();
      ctx.fillStyle = "#ff4d6d";
      ctx.fillRect(188, 146 - lift * 2, 9, 6);
    }
    if (sneezing) text("ACHOO!", 160, 84, { size: 7, color: "#fff8e4" });
  }

  // Where each pet is and how it looks right now
  function petPose(key, now) {
    const pet = PETS[key];
    const pose = { x: pet.home, y: FLOOR_Y, rot: 0, squish: 1, crown: false, dizzy: false, mark: "" };
    const breathe = reduceMotion ? 0 : Math.round(Math.sin(now / 320 + pet.home));
    pose.y += breathe;
    if (state === "wait" || state === "go") pose.squish = 0.92; // crouched, ready to pounce
    const r = result;
    if ((state === "result" || state === "over") && r) {
      const t = state === "over" ? 9999 : stateT;
      if (r.type === "pounce") {
        if (key === r.winner) {
          const p = Math.min(1, t / 260);
          pose.x = lerp(pet.home, BOWL.x - pet.dir * 40, p);
          pose.y = FLOOR_Y - Math.sin(Math.PI * p) * 46 - 6;
        } else if (t > 230) {
          pose.dizzy = true;
          pose.squish = 0.8;
          pose.x = pet.home + pet.dir * -6;
        }
      } else if (r.type === "trip") {
        if (key === r.loser) {
          pose.rot = pet.dir * Math.min(1, t / 200) * (Math.PI / 2);
          pose.mark = "?!";
        } else if (!reduceMotion) {
          pose.y -= Math.abs(Math.sin(t / 110)) * 8;
        }
      }
    }
    if (state === "over") {
      const champ = score.peaches >= WIN_SCORE ? "peaches" : "lychee";
      pose.rot = 0;
      pose.mark = "";
      if (key === champ) {
        pose.x = BOWL.x - pet.dir * 40;
        pose.y = FLOOR_Y - 6 + (reduceMotion ? 0 : Math.round(Math.abs(Math.sin(now / 180)) * 2)); // nom nom
        pose.crown = true;
        pose.dizzy = false;
        pose.squish = 1;
      } else {
        pose.x = pet.home;
        pose.dizzy = false;
        pose.squish = 0.9;
        pose.mark = "hmph";
      }
    }
    return pose;
  }

  function drawPet(key, now) {
    const img = IMG[key];
    const pose = petPose(key, now);
    const scale = 4;
    const w = img.width * scale, h = img.height * scale * pose.squish;
    ctx.save();
    ctx.translate(Math.round(pose.x), Math.round(pose.y));
    ctx.rotate(pose.rot);
    ctx.drawImage(img, -w / 2, -h, w, h);
    ctx.restore();
    const top = pose.y - h;
    if (pose.crown) sprite(IMG.crown, pose.x - 7, top - 12, 2);
    if (pose.dizzy) {
      const spin = reduceMotion ? 0 : now / 160;
      ctx.fillStyle = "#ffd23f";
      for (let i = 0; i < 3; i++) {
        const a = spin + (i * Math.PI * 2) / 3;
        const sx = pose.x + Math.cos(a) * 18, sy = top - 4 + Math.sin(a) * 4;
        ctx.fillRect(sx - 1, sy - 3, 2, 6); ctx.fillRect(sx - 3, sy - 1, 6, 2);
      }
    }
    if (pose.mark) text(pose.mark, pose.x + (pose.rot ? PETS[key].dir * 18 : 0), (pose.rot ? pose.y - 40 : top - 8), { size: 8, color: "#fff8e4" });
    // Who's who: "YOU" in 1 player, the key to press in 2 players
    if (state === "intro" || state === "wait" || state === "go") {
      const label = mode === "two" ? `[${PETS[key].key.toUpperCase()}]` : key === human ? "YOU" : "CPU";
      text(label, pose.x, FLOOR_Y + 14, { size: 7, color: key === human || mode === "two" ? "#ffd23f" : "#c9cbd6" });
    }
  }

  function drawFx(now) {
    fx.forEach((f) => {
      const p = f.t / 1500;
      if (f.type === "butterfly") {
        const x = lerp(-10, W + 10, p), y = 92 + Math.sin(f.t / 90) * 10;
        const flap = Math.abs(Math.sin(f.t / 50));
        const b = IMG.butterfly;
        ctx.drawImage(b, Math.round(x - b.width * flap), Math.round(y), b.width * 2 * Math.max(0.3, flap), b.height * 2);
      } else if (f.type === "pancake") {
        const x = lerp(W + 16, -16, p), y = 80 + Math.sin(f.t / 160) * 6;
        ctx.fillStyle = "#d9933f";
        ctx.beginPath(); ctx.ellipse(x, y + 3, 11, 4, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#f2c06b";
        ctx.beginPath(); ctx.ellipse(x, y, 11, 4, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fff6c2";
        ctx.fillRect(x - 2, y - 3, 5, 3);
        if (f.t < 900) text("tiny pancake!", x, y - 12, { size: 5, color: "#fff8e4" });
      } else if (f.type === "fly") {
        const x = 160 + Math.sin(f.t / 70) * 60 + Math.sin(f.t / 23) * 6;
        const y = 150 + Math.cos(f.t / 110) * 20;
        ctx.fillStyle = "#120e18";
        ctx.fillRect(Math.round(x), Math.round(y), 3, 2);
        ctx.fillStyle = "rgba(255,255,255,.8)";
        ctx.fillRect(Math.round(x) - 1, Math.round(y) - 2, 2, 2); ctx.fillRect(Math.round(x) + 2, Math.round(y) - 2, 2, 2);
        if (f.t < 800) text("bzz", x + 10, y - 8, { size: 5, color: "#fff8e4" });
      }
    });
  }

  function drawHud() {
    ctx.fillStyle = "rgba(43, 26, 82, .88)";
    ctx.fillRect(0, 0, W, 18);
    ctx.fillStyle = "#ffa31a";
    ctx.fillRect(0, 18, W, 2);
    text("PEACHES", 6, 10, { align: "left", outline: false, color: "#eeaa55" });
    text("LYCHEE", W - 6, 10, { align: "right", outline: false, color: "#c4bfc7" });
    // Paw pips: rounds won
    for (let i = 0; i < WIN_SCORE; i++) {
      ctx.fillStyle = i < score.peaches ? "#ffd23f" : "#4a3a72";
      ctx.fillRect(66 + i * 9, 6, 6, 6);
      ctx.fillStyle = i < score.lychee ? "#ffd23f" : "#4a3a72";
      ctx.fillRect(W - 72 - i * 9, 6, 6, 6);
    }
    if (state !== "menu" && state !== "over") text(`ROUND ${round}`, W / 2, 10, { size: 6, outline: false, color: "#fff8e4" });
  }

  function drawMenu() {
    panel(30, 16, 260, 102);
    text("Bowl Brawl", W / 2, 39, { font: "logo", size: 38, color: "#ffa31a", outline: "#2b1a52", ow: 5 });
    text("PEACHES vs. LYCHEE", W / 2, 62, { size: 8, color: "#ff5a3c", outline: false });
    text("Wait for Bojjii's flag, then POUNCE!", W / 2, 79, { size: 6, color: "#2b1a52", outline: false });
    text("Too early and you trip. First to 3!", W / 2, 91, { size: 6, color: "#2b1a52", outline: false });
    text(best ? `YOUR FASTEST POUNCE ${secs(best)}s` : "Pick your pet, or play with a friend:", W / 2, 106, { size: 5, color: "#7d5ad4", outline: false });
  }

  function drawCenterText() {
    if (state === "intro") {
      text(`Round ${round}`, W / 2, 50, { font: "logo", size: 34, color: "#ffd23f", outline: "#2b1a52", ow: 5 });
      text(round === 1 ? "Wait for the flag..." : "Watch out for fake-outs!", W / 2, 74, { size: 6, color: "#2b1a52", outline: false });
    } else if (state === "go") {
      text("!", 160, 64, { font: "logo", size: 54, color: "#ffd23f", outline: "#2b1a52", ow: 6 });
    } else if (state === "result" && result) {
      const r = result;
      if (r.type === "pounce") {
        text(`${PETS[r.winner].name} pounces!`, W / 2, 46, { font: "logo", size: 26, color: "#ffd23f", outline: "#2b1a52", ow: 5 });
        text(`${secs(r.react)} SEC`, W / 2, 68, { size: 8, color: "#2b1a52", outline: false });
      } else if (r.type === "trip") {
        text("Too early!", W / 2, 46, { font: "logo", size: 28, color: "#ff6b6b", outline: "#2b1a52", ow: 5 });
        text(`${PETS[r.loser].name} tripped over her paws!`, W / 2, 68, { size: 6, color: "#2b1a52", outline: false });
      } else {
        text("Too slow!", W / 2, 46, { font: "logo", size: 28, color: "#ff6b6b", outline: "#2b1a52", ow: 5 });
        text("Bojjii ate the kibble. Again!", W / 2, 68, { size: 6, color: "#2b1a52", outline: false });
      }
    } else if (state === "paused") {
      ctx.fillStyle = "rgba(43, 26, 82, .55)";
      ctx.fillRect(0, 20, W, H - 20);
      text("Paused", W / 2, H / 2 - 12, { font: "logo", size: 40, color: "#fff8e4", outline: "#2b1a52", ow: 6 });
      text("CLICK OR SPACE TO REPLAY THE ROUND", W / 2, H / 2 + 22, { size: 6 });
    }
  }

  function drawOver() {
    const champ = score.peaches >= WIN_SCORE ? "peaches" : "lychee";
    const loser = other(champ);
    panel(26, 14, 268, 114);
    const headline = mode === "two" || champ === human ? `${PETS[champ].name} wins the bowl!` : `${PETS[champ].name} wins... this time.`;
    text(headline, W / 2, 34, { font: "logo", size: 24, color: "#ffa31a", outline: "#2b1a52", ow: 5 });
    text(`${score[champ]} - ${score[loser]}`, W / 2, 55, { size: 10, color: "#2b1a52", outline: false });
    text(PETS[loser].lose, W / 2, 70, { size: 5, color: "#7d5ad4", outline: false });
    if (newBest) text(`NEW PERSONAL BEST ${secs(best)}s!`, W / 2, 84, { size: 6, color: "#ff5a3c", outline: false });
    else if (fastest[champ]) text(`FASTEST POUNCE ${secs(fastest[champ])}s`, W / 2, 84, { size: 6, color: "#2b1a52", outline: false });
  }

  function draw(now) {
    ctx.setTransform(K, 0, 0, K, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(ROOM, 0, 0, W, H);
    drawBojjii(now);
    drawBowl();
    drawFx(now);
    drawPet("peaches", now);
    drawPet("lychee", now);
    drawHud();
    if (state === "menu") drawMenu();
    else if (state === "over") drawOver();
    else drawCenterText();
    if (flashT > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${flashT / 90 * 0.6})`;
      ctx.fillRect(0, 0, W, H);
    }
  }

  /* ---------- Input ---------- */
  menu.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-mode]");
    if (btn) startMatch(btn.dataset.mode);
  });
  document.getElementById("rematch").addEventListener("click", () => startMatch(mode));
  document.getElementById("toMenu").addEventListener("click", showMenu);

  canvas.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    canvas.focus({ preventScroll: true });
    if (state === "paused") { resume(); return; }
    if (mode === "two") {
      const rect = canvas.getBoundingClientRect();
      press(e.clientX - rect.left < rect.width / 2 ? "peaches" : "lychee", e.timeStamp);
    } else if (human) {
      press(human, e.timeStamp);
    }
  });

  window.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.key === "Tab" || e.key === "Shift") return;
    if (e.target.tagName === "BUTTON" && (e.key === " " || e.key === "Enter")) return; // let buttons work
    const key = e.key.toLowerCase();
    if (key === "m") { setMuted(!muted); return; }
    if (key === "escape") {
      if (state === "intro" || state === "wait" || state === "go") pause();
      else if (embedded) { try { window.parent.postMessage({ yvyArcade: "close" }, location.origin); } catch (err) { /* ignore */ } }
      return;
    }
    if (key === "p") { state === "paused" ? resume() : pause(); return; }
    if (state === "menu" && "123".includes(key)) { startMatch(["peaches", "lychee", "two"][+key - 1]); return; }
    if (state === "paused" && (key === " " || key === "enter")) { e.preventDefault(); resume(); return; }
    if (e.repeat) return;
    if (mode === "two") {
      if (key === "a") press("peaches", e.timeStamp);
      else if (key === "l") press("lychee", e.timeStamp);
    } else if (human && state !== "menu" && state !== "over") {
      e.preventDefault();
      press(human, e.timeStamp);
    }
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
