/*
 * Little extras: the "Currently…" away message, pet-able critters, the Konami code
 * Easter egg, seasonal decorations and the "You are visitor #…" hit counter.
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
    title.insertAdjacentHTML("afterend", '<p class="pet-total" id="petTotal" aria-live="polite"></p>');
    show();

    document.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-pet]");
      if (!btn) return;
      if (pets.day !== today()) pets = load();
      const name = btn.dataset.pet;
      pets.counts[name] = (pets.counts[name] || 0) + 1;
      store.set(KEY, JSON.stringify(pets));
      show();
      chirp(btn.dataset.sound);
      heartBurst(btn);
    });
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

  /* ---------- "You are visitor #…" ---------- */
  // Each browser gets counted once and keeps its number. If the API can't be reached, the box stays hidden.
  async function buildVisitor() {
    const box = $("#visitor");
    if (!box || !API) return;
    const KEY = "yvy-visitor-no";
    let n = Number(store.get(KEY)) || 0;
    if (!n) {
      try {
        const res = await fetch(`${API}/api/visit`, { method: "POST" });
        if (!res.ok) return;
        n = Number((await res.json()).visitor) || 0;
        if (n) store.set(KEY, String(n));
      } catch (e) { return; }
    }
    if (!n) return;
    $("#visitorNum").innerHTML = String(n).padStart(6, "0").split("").map((d) => `<span>${d}</span>`).join("");
    $("#visitorNum").setAttribute("aria-label", `number ${n}`);
    box.hidden = false;
  }

  // Turned on one at a time as each feature is finished and checked
  const ON = { away: false, pets: false, konami: false, season: false, visitor: false };
  if (ON.away) buildAway();
  if (ON.pets) buildPets();
  if (ON.konami) buildKonami();
  if (ON.season) buildSeason();
  if (ON.visitor) buildVisitor();
})();
