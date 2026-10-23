/*
 * Little extras: the "Currently…" away message, pet-able critters, the Konami code
 * Easter egg, seasonal decorations, the "You are visitor #…" hit counter and the little music player.
 * Content lives in data.js → currently and seasons; the counter talks to society-api/.
 */
(function () {
  "use strict";

  const D = window.YVY;
  const px = window.Pixel.svg;
  const $ = (sel, el = document) => el.querySelector(sel);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const API = ["localhost", "127.0.0.1"].includes(location.hostname) ? "http://localhost:8787" : D.society && D.society.api;
  const store = {
    get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch (e) { /* storage blocked: just forget */ } },
  };
  const today = () => new Date().toLocaleDateString("en-CA");

  /* ---------- "Currently…" away message ---------- */
  function buildAway() {
    const C = D.currently;
    if (!C || !$("#aim")) return;
    $("#aimAway").textContent = C.away || "";
    $("#aimLines").innerHTML = "";
    (C.lines || []).forEach(([label, emoji, text]) => {
      const li = document.createElement("li");
      li.innerHTML = '<span class="aim-emoji" aria-hidden="true"></span><b></b> <span></span>';
      li.children[0].textContent = emoji;
      li.children[1].textContent = `${label}:`;
      li.children[2].textContent = text;
      $("#aimLines").appendChild(li);
    });
    if (C.updated) {
      const d = new Date(C.updated + "T12:00:00");
      $("#aimUpdated").textContent = `updated ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
    }
    $("#aim").hidden = false;
  }

  /* ---------- Tiny synth sounds (no audio files) ---------- */
  let audio = null;
  function chirp(kind) {
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      const notes = {
        chicken: [["square", 740, 520, 0, 0.07], ["square", 900, 600, 0.09, 0.09]],   // "bawk bawk"
        dog: [["sawtooth", 520, 260, 0, 0.12]],                                       // "arf"
        cat: [["sine", 500, 820, 0, 0.18], ["sine", 820, 640, 0.18, 0.12]],           // "mrrp"
        egg: [["triangle", 660, 990, 0, 0.1], ["triangle", 990, 1320, 0.1, 0.12]],    // cheat code jingle
      }[kind] || [["triangle", 700, 900, 0, 0.1]];
      const t0 = audio.currentTime;
      notes.forEach(([type, from, to, at, len]) => {
        const osc = audio.createOscillator();
        const gain = audio.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(from, t0 + at);
        osc.frequency.exponentialRampToValueAtTime(to, t0 + at + len);
        gain.gain.setValueAtTime(0.0001, t0 + at);
        gain.gain.exponentialRampToValueAtTime(0.12, t0 + at + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + at + len);
        osc.connect(gain).connect(audio.destination);
        osc.start(t0 + at);
        osc.stop(t0 + at + len + 0.02);
      });
    } catch (e) { /* no sound, no problem */ }
  }

  /* ---------- Pet-able critters ---------- */
  // Pets given today are counted per critter in this browser (they reset every day).
  function buildPets() {
    const KEY = "yvy-pets";
    const load = () => {
      try {
        const data = JSON.parse(store.get(KEY) || "{}");
        return data.day === today() ? data : { day: today(), counts: {} };
      } catch (e) { return { day: today(), counts: {} }; }
    };
    let pets = load();
    const total = () => Object.values(pets.counts).reduce((a, b) => a + b, 0);
    const show = () => {
      document.querySelectorAll("[data-pets-for]").forEach((el) => {
        const n = pets.counts[el.dataset.petsFor] || 0;
        el.textContent = n ? `♥ ${n} pet${n === 1 ? "" : "s"} today` : "";
      });
      const t = total();
      $("#petTotal").textContent = t ? `You've given ${t} pet${t === 1 ? "" : "s"} today ♥` : "Click a critter to give it a pet!";
    };
    const title = $("#critters .leaf-title");
    if (!title) return;
    title.insertAdjacentHTML("afterend", `
      <details class="pet-board" id="petBoard" hidden>
        <summary>
          <span class="pet-board-title">🏆 Most Petted</span>
          <span class="pet-board-total" id="petCommunity" aria-live="polite"></span>
        </summary>
        <ol class="pet-board-list" id="petBoardList"></ol>
      </details>
      <p class="pet-total" id="petTotal" aria-live="polite"></p>`);
    show();
    const community = buildPetBoard();

    document.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-pet]");
      if (!btn) return;
      if (pets.day !== today()) pets = load();
      const name = btn.dataset.pet;
      pets.counts[name] = (pets.counts[name] || 0) + 1;
      store.set(KEY, JSON.stringify(pets));
      show();
      community.add(name);
      chirp(btn.dataset.sound);
      heartBurst(btn);
    });
  }

  // Community "Most Petted" board: everyone's pets, counted by the Worker (society-api → /api/pets).
  // Clicks are sent in small batches a couple of seconds after the petting stops.
  // If the API can't be reached, the board stays hidden and petting still works.
  function buildPetBoard() {
    const petKey = (name) => String(name).toLowerCase().replace(/[^a-z]/g, "");
    const critters = [...(D.flock || []), ...(D.pets || [])].map((c) => ({ ...c, key: petKey(c.name) }));
    let counts = null;              // from the API
    let pending = {};               // pets not sent yet
    let sending = false;
    let timer = null;
    const medals = ["🥇", "🥈", "🥉"];

    const render = () => {
      if (!counts) return;
      const merged = critters.map((c) => ({ ...c, n: (counts[c.key] || 0) + (pending[c.key] || 0) }))
        .sort((a, b) => b.n - a.n);
      const total = merged.reduce((a, c) => a + c.n, 0);
      $("#petCommunity").textContent = `♥ ${total.toLocaleString("en-US")} pet${total === 1 ? "" : "s"} from the whole community`;
      const list = $("#petBoardList");
      list.innerHTML = "";
      merged.forEach((c, i) => {
        const li = document.createElement("li");
        li.innerHTML = '<span class="pb-rank"></span><span class="pb-photo"></span><span class="pb-name"></span><span class="pb-count"></span>';
        li.children[0].textContent = c.n ? medals[i] || `${i + 1}.` : "·";
        if (c.photo) {
          const img = document.createElement("img");
          img.src = c.photo;
          img.alt = "";
          img.loading = "lazy";
          img.dataset.fallback = "🐾";
          if (c.focus) img.style.objectPosition = c.focus.includes("%") ? c.focus : "";
          li.children[1].appendChild(img);
        }
        li.children[2].textContent = c.name;
        li.children[3].textContent = `♥ ${c.n.toLocaleString("en-US")}`;
        list.appendChild(li);
      });
      $("#petBoard").hidden = false;
    };

    const load = async () => {
      if (!API) return;
      try {
        const res = await fetch(`${API}/api/pets`);
        if (!res.ok) return;
        counts = (await res.json()).counts || {};
        render();
      } catch (e) { /* board stays hidden */ }
    };

    // text/plain keeps it a "simple" request (no CORS preflight), and keepalive lets it finish as the page closes
    const flush = async () => {
      clearTimeout(timer);
      if (sending || !API || !Object.keys(pending).length) return;
      const batch = pending;
      pending = {};
      sending = true;
      try {
        const res = await fetch(`${API}/api/pets`, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=UTF-8" },
          body: JSON.stringify({ pets: batch }),
          keepalive: true,
        });
        if (res.ok) { counts = (await res.json()).counts || counts; }
      } catch (e) { /* lost this batch; no big deal */ }
      sending = false;
      render();
      if (Object.keys(pending).length) timer = setTimeout(flush, 2500);
    };

    const add = (name) => {
      const key = petKey(name);
      pending[key] = (pending[key] || 0) + 1;
      // The server takes up to 60 pets a batch, so send early during a petting frenzy
      if (Object.values(pending).reduce((a, b) => a + b, 0) >= 50) { flush(); return; }
      render();
      clearTimeout(timer);
      timer = setTimeout(flush, 2500);
    };

    document.addEventListener("visibilitychange", () => { if (document.hidden) flush(); });
    window.addEventListener("pagehide", flush);
    // Load when Critter Corner comes near the screen, then refresh every minute while the page is open
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((x) => x.isIntersecting)) return;
      io.disconnect();
      load();
      setInterval(() => { if (!document.hidden && !Object.keys(pending).length) load(); }, 60000);
    }, { rootMargin: "300px" });
    io.observe($("#critters"));
    return { add };
  }

  function heartBurst(el) {
    if (reduceMotion) return;
    const r = el.getBoundingClientRect();
    const hearts = ["♥", "💕", "♥", "💖", "♥"];
    for (let i = 0; i < 8; i++) {
      const h = document.createElement("span");
      h.className = "pet-heart";
      h.textContent = hearts[i % hearts.length];
      h.style.left = `${r.left + r.width / 2}px`;
      h.style.top = `${r.top + r.height / 3}px`;
      const angle = (i / 8) * Math.PI * 2;
      h.style.setProperty("--dx", `${Math.cos(angle) * 70}px`);
      h.style.setProperty("--dy", `${Math.sin(angle) * 50 - 50}px`);
      h.addEventListener("animationend", () => h.remove());
      document.body.appendChild(h);
    }
  }

  /* ---------- Konami code Easter egg ---------- */
  // ↑↑↓↓←→←→BA rains chickens and turns the cursor into a tomato (until the next visit).
  // On phones: tap the chicken next to the logo 7 times in a row.
  function buildKonami() {
    const CODE = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    let pos = 0;
    document.addEventListener("keydown", (e) => {
      if (e.target.closest && e.target.closest("input, textarea, select")) return;
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      pos = key === CODE[pos] ? pos + 1 : key === CODE[0] ? 1 : 0;
      if (pos === CODE.length) { pos = 0; activate(); }
    });
    let taps = 0;
    let tapTimer = null;
    const mascot = $("#mascot");
    if (mascot) {
      mascot.addEventListener("click", () => {
        taps++;
        clearTimeout(tapTimer);
        tapTimer = setTimeout(() => { taps = 0; }, 1500);
        if (taps >= 7) { taps = 0; activate(); }
      });
    }
  }

  let toastTimer = null;
  function toast(text) {
    const t = $("#eggToast");
    t.textContent = text;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 4000);
  }

  function activate() {
    document.body.classList.add("tomato-cursor");
    chirp("egg");
    toast("🍅 CHEAT CODE ACTIVATED! Tomato cursor on. It's raining chickens!");
    if (reduceMotion) return;
    const layer = $("#eggLayer");
    for (let i = 0; i < 36; i++) {
      const c = document.createElement("span");
      c.className = "egg-chicken";
      c.innerHTML = px("chicken", 3 + (i % 3));
      c.style.left = `${Math.random() * 100}vw`;
      c.style.animationDuration = `${2.2 + Math.random() * 2}s`;
      c.style.animationDelay = `${Math.random() * 1.8}s`;
      c.style.setProperty("--spin", `${Math.random() * 720 - 360}deg`);
      c.addEventListener("animationend", () => c.remove());
      layer.appendChild(c);
    }
  }

  /* ---------- Seasonal decorations ---------- */
  function buildSeason() {
    const season = window.yvySeason && window.yvySeason();
    if (!season) return;
    document.body.dataset.season = season.key;
    if (reduceMotion) return;
    const layer = $("#seasonLayer");
    const fall = season.fall || [];
    for (let i = 0; i < 16 && fall.length; i++) {
      const s = document.createElement("span");
      s.className = "season-bit";
      s.textContent = fall[i % fall.length];
      s.style.left = `${(i / 16) * 100 + Math.random() * 5}vw`;
      s.style.fontSize = `${14 + Math.random() * 14}px`;
      s.style.animationDuration = `${12 + Math.random() * 12}s`;
      s.style.animationDelay = `${-Math.random() * 20}s`;
      s.style.setProperty("--sway", `${Math.random() * 60 - 30}px`);
      layer.appendChild(s);
    }
  }

  /* ---------- Arcade high scores (portal side panel) ---------- */
  function buildHiscores() {
    const list = D.arcadeScores || [];
    const box = $("#hiscores");
    if (!box || !API || !list.length) return;
    let current = list[0];
    const fmt = (g, n) => (g.low ? `${(n / 1000).toFixed(3)}${g.unit || ""}` : `${n}${g.unit ? ` ${g.unit}` : ""}`);
    const render = async () => {
      $("#hiscoresTabs").querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.game === current.game)));
      try {
        const res = await fetch(`${API}/api/scores?game=${encodeURIComponent(current.game)}`);
        if (!res.ok) throw new Error();
        const scores = ((await res.json()).scores || []).slice(0, 5);
        $("#hiscoresList").innerHTML = scores.length
          ? scores.map((s) => `<li><b>${String(s.initials).replace(/[^A-Z]/g, "")}</b><span>${fmt(current, Number(s.score))}</span></li>`).join("")
          : '<li class="hiscores-empty">No scores yet. Be the first!</li>';
        box.hidden = false;
      } catch (e) {
        if (box.hidden) return;   // API down on first load: keep the box hidden
        $("#hiscoresList").innerHTML = '<li class="hiscores-empty">Scores are napping 😴</li>';
      }
    };
    $("#hiscoresTabs").innerHTML = list.map((g) => {
      const b = document.createElement("button");
      b.type = "button";
      b.dataset.game = g.game;
      b.textContent = g.title;
      return b.outerHTML;
    }).join("");
    $("#hiscoresTabs").addEventListener("click", (e) => {
      const b = e.target.closest("button[data-game]");
      if (!b) return;
      current = list.find((g) => g.game === b.dataset.game) || current;
      render();
    });
    render();
    // Refresh after the arcade pop-up closes, so a new high score shows right away
    new MutationObserver(() => { if ($("#arcade") && $("#arcade").hidden) render(); })
      .observe($("#arcade"), { attributes: true, attributeFilter: ["hidden"] });
  }

  /* ---------- Rabbit & Frog hall of fame ---------- */
  function buildHall() {
    const H = D.hallOfFame;
    const root = $("#hall");
    if (!H || !root || !API) return;
    const GRADE_NAMES = { TK: "TK", K: "Kindergarten", 1: "1st grade", 2: "2nd grade", 3: "3rd grade", 4: "4th grade", 5: "5th grade", 6: "6th grade", 7: "7th grade", 8: "8th grade" };
    const ORDER = ["TK", "K", "1", "2", "3", "4", "5", "6", "7", "8"];
    const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    $("#hallIntro").textContent = H.intro || "";
    if (H.certificate && H.certificate.src) {
      $("#hallCertImg").src = H.certificate.src;
      $("#hallCertImg").alt = H.certificate.alt || "Gardenbound certificate";
      $("#hallCertLink").href = H.certificate.src;
      $("#hallCertCaption").textContent = H.certificate.caption || "";
      $("#hallCert").hidden = false;
    }
    fetch(`${API}/api/hall`).then((r) => (r.ok ? r.json() : Promise.reject())).then(({ students }) => {
      students = students || [];
      if (!students.length) {
        $("#hallGrades").innerHTML = `<p class="hall-empty">${esc(H.empty || "")}</p>`;
      } else {
        $("#hallGrades").innerHTML = ORDER.filter((g) => students.some((s) => s.grade === g)).map((g) => {
          const kids = students.filter((s) => s.grade === g);
          return `<div class="hall-grade">
            <h3>${esc(GRADE_NAMES[g] || g)} <span class="hall-count">${kids.length} 🏅</span></h3>
            <ul>${kids.map((s) => `<li>${esc(s.name)}</li>`).join("")}</ul>
          </div>`;
        }).join("");
        const photos = students.filter((s) => s.photo);
        $("#hallPhotos").innerHTML = photos.map((s) => `<figure class="hall-photo">
            <img src="${esc(API + s.photo)}" alt="${esc(s.caption || `${s.name} with their Rabbit & Frog prize`)}" loading="lazy" data-fallback="🏆">
            <figcaption>${esc(s.caption || `${s.name}, ${GRADE_NAMES[s.grade] || s.grade}`)}</figcaption>
          </figure>`).join("");
      }
      root.hidden = false;
    }).catch(() => { /* API down: the section stays hidden */ });
  }

  /* ---------- "You are visitor #…" ---------- */
  // Shows the total number of visits to the site, counting people who come back too (the API treats
  // reloads within half an hour as the same visit). If the API can't be reached, the box stays hidden.
  async function buildVisitor() {
    const box = $("#visitor");
    if (!box || !API) return;
    let n = 0;
    try {
      const res = await fetch(`${API}/api/visit`, { method: "POST" });
      if (!res.ok) return;
      n = Number((await res.json()).visitor) || 0;
    } catch (e) { return; }
    if (!n) return;
    $("#visitorNum").innerHTML = String(n).padStart(6, "0").split("").map((d) => `<span>${d}</span>`).join("");
    $("#visitorNum").setAttribute("aria-label", `number ${n}`);
    box.hidden = false;
  }

  // Turned on one at a time as each feature is finished and checked
  /* ---------- Music player: the music from Yvy's games (data.js → music) ---------- */
  // A tiny retro MP3 player in Yvy's Extras. Tracks stream from each game's own site and only start
  // loading when you press play. One track after another, then back to the top.
  function buildMusic() {
    const tracks = D.music || [];
    const box = $("#musicPlayer");
    if (!box || !tracks.length) return;
    // Pixel icons as tiny SVGs (5×5 grids), so they stay crisp and the emoji swapper leaves them alone
    const icon = (rows) => `<svg viewBox="0 0 5 5" width="10" height="10" shape-rendering="crispEdges" aria-hidden="true">${
      rows.map((r, y) => [...r].map((c, x) => (c === "#" ? `<rect x="${x}" y="${y}" width="1" height="1"/>` : "")).join("")).join("")}</svg>`;
    const ICONS = {
      prev: icon(["#..#.", "#.##.", "####.", "#.##.", "#..#."]),
      play: icon(["#....", "###..", "#####", "###..", "#...."]),
      pause: icon(["##.##", "##.##", "##.##", "##.##", "##.##"]),
      next: icon([".#..#", ".##.#", ".####", ".##.#", ".#..#"]),
      sound: icon(["...#.", "..##.", "####.", "..##.", "...#."]).replace("</svg>", '<rect x="4" y="1" width="1" height="3"/></svg>'),
      mute: icon(["...#.", "..##.", "####.", "..##.", "...#."]),
    };
    box.innerHTML = `
      <p class="mp-head">🎵 Music from my games</p>
      <div class="mp-screen" aria-live="polite"><span class="mp-scroll"><span class="mp-text"></span></span></div>
      <div class="mp-bar"><input type="range" class="mp-seek" min="0" max="1000" value="0" step="1" aria-label="Song position"><span class="mp-time">0:00</span></div>
      <div class="mp-buttons">
        <button type="button" class="mp-btn" data-mp="prev" aria-label="Previous song">${ICONS.prev}</button>
        <button type="button" class="mp-btn mp-play" data-mp="play" aria-label="Play">${ICONS.play}</button>
        <button type="button" class="mp-btn" data-mp="next" aria-label="Next song">${ICONS.next}</button>
        <button type="button" class="mp-btn mp-mute" data-mp="mute" aria-label="Mute">${ICONS.sound}</button>
        <input type="range" class="mp-vol" min="0" max="100" step="5" aria-label="Volume">
        <span class="mp-count"></span>
      </div>`;
    box.hidden = false;

    const audio = new Audio();
    audio.preload = "none";
    const text = $(".mp-text", box);
    const seek = $(".mp-seek", box);
    const time = $(".mp-time", box);
    const playBtn = $(".mp-play", box);
    const vol = $(".mp-vol", box);
    const muteBtn = $(".mp-mute", box);
    // Volume (and mute) are remembered in this browser. Some phones only use their own volume buttons.
    const saved = Number(store.get("yvy-music-volume"));
    audio.volume = Number.isFinite(saved) && store.get("yvy-music-volume") !== null ? saved / 100 : 0.6;
    vol.value = Math.round(audio.volume * 100);
    const showVolume = () => {
      const quiet = audio.muted || audio.volume === 0;
      muteBtn.innerHTML = quiet ? ICONS.mute : ICONS.sound;
      muteBtn.setAttribute("aria-label", audio.muted ? "Unmute" : "Mute");
      muteBtn.classList.toggle("is-muted", quiet);
    };
    vol.addEventListener("input", () => {
      audio.volume = vol.value / 100;
      audio.muted = false;
      store.set("yvy-music-volume", vol.value);
      showVolume();
    });
    showVolume();
    let i = 0;
    const fmt = (s) => (isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "0:00");

    const show = () => {
      const t = tracks[i];
      text.textContent = `${t.title} · ${t.game}`;
      $(".mp-count", box).textContent = `${i + 1}/${tracks.length}`;
      box.classList.toggle("is-playing", !audio.paused);
      playBtn.innerHTML = audio.paused ? ICONS.play : ICONS.pause;
      playBtn.setAttribute("aria-label", audio.paused ? "Play" : "Pause");
    };
    const load = (n, autoplay) => {
      i = (n + tracks.length) % tracks.length;
      audio.src = tracks[i].src;
      seek.value = 0;
      time.textContent = "0:00";
      if (autoplay) audio.play().catch(() => show());
      show();
    };
    const toggle = () => {
      if (!audio.src) { load(i, true); return; }
      if (audio.paused) audio.play().catch(() => show()); else audio.pause();
    };

    box.addEventListener("click", (e) => {
      const b = e.target.closest("[data-mp]");
      if (!b) return;
      if (b.dataset.mp === "play") toggle();
      else if (b.dataset.mp === "mute") { audio.muted = !audio.muted; showVolume(); }
      else load(i + (b.dataset.mp === "next" ? 1 : -1), !!audio.src && !audio.paused);
    });
    audio.addEventListener("play", show);
    audio.addEventListener("pause", show);
    audio.addEventListener("ended", () => load(i + 1, true));
    audio.addEventListener("error", () => { if (audio.src) { text.textContent = `Couldn't load ${tracks[i].title}`; box.classList.remove("is-playing"); } });
    audio.addEventListener("timeupdate", () => {
      if (audio.duration) seek.value = Math.round((audio.currentTime / audio.duration) * 1000);
      time.textContent = fmt(audio.currentTime);
    });
    seek.addEventListener("input", () => { if (audio.duration) audio.currentTime = (seek.value / 1000) * audio.duration; });
    // Hush when a game opens in the arcade pop-up, so two songs don't play at once
    document.addEventListener("click", (e) => { if (e.target.closest("a[data-play]") && !audio.paused) audio.pause(); });
    show();
  }

  const ON = { away: true, pets: true, konami: true, season: true, visitor: true, hiscores: true, hall: true, music: true };
  if (ON.away) buildAway();
  if (ON.pets) buildPets();
  if (ON.konami) buildKonami();
  if (ON.season) buildSeason();
  if (ON.visitor) buildVisitor();
  if (ON.hiscores) buildHiscores();
  if (ON.hall) buildHall();
  if (ON.music) buildMusic();
})();
