(function () {
  "use strict";

  const D = window.YVY;
  const px = window.Pixel.svg;
  const $ = (sel) => document.querySelector(sel);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));

  const ALBUMS = [
    { key: "me",       label: "Yvy",             emoji: "🌟" },
    { key: "club",     label: "Garden Society", emoji: "🌻", dates: true },
    { key: "students", label: "Garden Students", emoji: "🌱", dates: true },   // dates: show each photo's date under its caption
    { key: "pets",     label: "Pets",            emoji: "🐾" },
    { key: "chickens", label: "Chickens",        emoji: "🐔" },
  ];
  const allPhotosIn = (key) => (D.photos[key] || []).filter((p) => p && p.src);

  // Weekly rotation (data.js → weeklyPhotos): shuffle the album the same way for every
  // visitor, then show the next `limit` photos each week (weeks start Monday), wrapping
  // around so every photo comes up in turn.
  const now = new Date();
  const weekNo = Math.floor((Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 864e5 + 3) / 7);
  function seededShuffle(list, seed) {
    const out = [...list];
    let s = seed >>> 0;
    for (let i = out.length - 1; i > 0; i--) {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0; // tiny LCG, plenty for shuffling photos
      const j = s % (i + 1);
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }
  const weeklyCache = {};
  function photosIn(key) {
    const all = allPhotosIn(key);
    const limit = Number((D.weeklyPhotos || {})[key]) || 0;
    if (!limit || all.length <= limit) return all;
    if (weeklyCache[key]) return weeklyCache[key];
    // pin: true photos show every week. The first pinned photo always leads; the other
    // pinned ones mix in with this week's rotating photos, which fill the spots left.
    const pinned = all.filter((p) => p.pin);
    const rest = all.filter((p) => !p.pin);
    const [lead, ...alsoPinned] = pinned;
    const picks = weeklyPick(key, rest, Math.max(0, limit - pinned.length));
    const mixed = seededShuffle([...alsoPinned, ...picks], weekNo * 31 + key.length);
    return (weeklyCache[key] = lead ? [lead, ...mixed] : mixed);
  }
  function weeklyPick(key, all, limit) {
    if (!limit) return [];
    const seed = [...key].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619), 2166136261);
    const groups = ((D.weeklyGroups || {})[key] || []).map((g) => String(g).toLowerCase());
    if (!groups.length) {
      const deck = seededShuffle(all, seed);
      const start = (weekNo * limit) % deck.length;
      const picks = Array.from({ length: limit }, (_, i) => deck[(start + i) % deck.length]);
      return seededShuffle(picks, seed ^ weekNo);
    }
    // Everyone gets an equal share; the leftover spots rotate between them each week.
    const base = Math.floor(limit / groups.length);
    const extra = limit % groups.length;
    const per = Math.ceil(limit / groups.length);
    const who = (p) => groups.filter((g) => `${p.src} ${p.caption || ""}`.toLowerCase().includes(g));
    const want = groups.map((g, gi) => base + ((gi - weekNo % groups.length + groups.length) % groups.length < extra ? 1 : 0));
    const have = groups.map(() => 0);
    const picks = [];
    const take = (p) => { picks.push(p); who(p).forEach((g) => have[groups.indexOf(g)]++); };
    const decks = groups.map((g, gi) => seededShuffle(all.filter((p) => who(p).includes(g)), seed ^ (gi + 1) * 0x9e3779b1));
    const startOf = (gi) => (weekNo * per) % decks[gi].length;
    groups.forEach((g, gi) => {
      const deck = decks[gi];
      if (!deck.length) return;
      const start = startOf(gi);
      // Group photos count for everyone in them, so skip ones that would push
      // another pet past their share (unless there's nothing else left).
      for (const strict of [true, false]) {
        for (let k = 0; k < deck.length && have[gi] < want[gi]; k++) {
          const p = deck[(start + k) % deck.length];
          const overflows = who(p).some((o) => o !== g && have[groups.indexOf(o)] >= want[groups.indexOf(o)]);
          if (!picks.includes(p) && !(strict && overflows)) take(p);
        }
      }
    });
    // Group photos can fill several shares at once; top up to the limit with solo
    // photos of whoever has the fewest so far.
    while (picks.length < limit) {
      const order = groups.map((_, gi) => gi).filter((gi) => decks[gi].length).sort((a, b) => have[a] - have[b]);
      const next = order.map((gi) => {
        const deck = decks[gi];
        for (let k = 0; k < deck.length; k++) {
          const p = deck[(startOf(gi) + k) % deck.length];
          if (!picks.includes(p) && who(p).length === 1) return p;
        }
        return null;
      }).find(Boolean) || all.find((p) => !picks.includes(p));
      if (!next) break;
      take(next);
    }
    return seededShuffle(picks, seed ^ weekNo);
  }

  // "focus" picks which part of a photo stays in view when a frame crops it:
  // a word (top, bottom, left, right, center, top left...) or "x% y%" like "30% 20%".
  const FOCUS_WORDS = { top: "50% 0%", bottom: "50% 100%", left: "0% 50%", right: "100% 50%", center: "50% 50%" };
  function focusStyle(focus) {
    if (!focus) return "";
    const value = FOCUS_WORDS[focus] || String(focus).trim();
    return /^[a-z0-9.%\s-]+$/i.test(value) ? ` style="object-position:${value}"` : "";
  }

  // If a listed image is missing, show a cute placeholder instead of a broken icon.
  function imgTag(src, alt, fallbackEmoji, focus, full) {
    return `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy" data-fallback="${esc(fallbackEmoji || "🌱")}"${full ? ` data-full="${esc(full)}"` : ""}${focusStyle(focus)}>`;
  }
  // Wall frames are tiny, so they load a small copy from the album's thumbs/ folder
  // (made by tools/photos.py). A photo with no thumbnail yet falls back to the full one.
  const thumbOf = (src) => src.replace(/([^/]+)$/, "thumbs/$1");
  document.addEventListener("error", (e) => {
    const img = e.target;
    if (img.tagName === "IMG" && img.dataset.full) {
      img.src = img.dataset.full;
      delete img.dataset.full;
      return;
    }
    if (img.tagName === "IMG" && img.dataset.fallback) {
      const span = document.createElement("span");
      span.className = "img-fallback";
      span.style.fontSize = "44px";
      span.textContent = img.dataset.fallback;
      img.replaceWith(span);
    }
  }, true);

  /* ---------- Logo letters ---------- */
  function buildLogo() {
    const colors = ["#ff8cc6", "#ffb0d9", "#ff8cc6", "#c9b8f2", "#b39af0", "#d4c6f7", "#a98fe6", "#c9b8f2", "#b39af0", "#d4c6f7"];
    const rot = [-8, 5, -4, 6, -5, 3, -6, 4, -3, 7];
    const lift = [0, -6, 4, -2, 5, -5, 2, -4, 6, 0];
    $("#logo").innerHTML = [..."YvyGrounds"].map((ch, i) =>
      `<span class="ltr" aria-hidden="true" style="--c:${colors[i]};--r:${rot[i]}deg;--y:${lift[i]}px">${ch}</span>`
    ).join("");
  }

  /* ---------- Background photo wall ---------- */
  function buildPhotoWall() {
    const wall = $("#photoWall");
    // Frames rotate through albums so chickens and pets always keep some spots:
    // an album with no photos yet shows its placeholder emoji instead.
    const placeholders = {
      me: ["🌱", "🌷", "🍅", "🌻", "🥕", "🍓", "🎮", "✨"],
      chickens: ["🐔", "🐣", "🥚"],
      pets: ["🐶", "🐱", "🐾"],
      club: ["🌻", "🌷"],
      students: ["🌱", "🥕"],
    };
    const pattern = ["me", "chickens", "me", "pets"];
    ["club", "students"].forEach((key) => { if (photosIn(key).length) pattern.push("me", key); });
    const used = {};
    // Walk each album in "golden ratio" order so even a few frames sample the whole album
    // (Bojjii and Lychee get spots too, not just whoever is listed first).
    const spread = (list) => list
      .map((p, i) => [((i + 1) * 0.6180339887) % 1, p])
      .sort((a, b) => a[0] - b[0])
      .map(([, p]) => p);
    const wallPhotos = {};
    // Share of photo frames that stay as cute emoji frames, so the wall doesn't feel crowded.
    const emojiShare = Math.min(1, Math.max(0, Number(D.wallEmojiShare ?? 0.3)));
    const isBreather = (i) => ((Math.imul(i + 1, 2654435761) >>> 16) % 100) < emojiShare * 100;

    const cols = Math.ceil((window.innerWidth + 80) / 130) + 1;
    const rows = Math.ceil((window.innerHeight + 80) / 166) + 1;
    wall.style.gridTemplateColumns = `repeat(${cols}, 116px)`;
    let html = "";
    for (let i = 0; i < cols * rows; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const style = `--dy:${col % 2 ? 80 : 0}px;--rot:${((i * 37) % 11) - 5}deg;--h:${(i * 47) % 360}`;
      const album = pattern[(col + row * 3) % pattern.length];
      if (isBreather(i)) {
        const pool = placeholders[album];
        html += `<div class="oval oval-empty" style="${style}"><span>${pool[(i * 7) % pool.length]}</span></div>`;
        continue;
      }
      const n = (used[album] = (used[album] || 0) + 1) - 1;
      // wall: false keeps a photo off the wall
      const photos = (wallPhotos[album] ??= spread(photosIn(album).filter((p) => p.wall !== false)));
      const emoji = placeholders[album][n % placeholders[album].length];
      // Albums with only a few photos mix in placeholders so one picture doesn't repeat everywhere.
      const slots = album === "me" || photos.length >= 4 ? photos : [...photos, ...placeholders[album]];
      const item = slots.length ? slots[n % slots.length] : emoji;
      html += typeof item === "object"
        ? `<div class="oval" style="${style}">${imgTag(thumbOf(item.src), "", emoji, item.focus, item.src)}</div>`
        : `<div class="oval oval-empty" style="${style}"><span>${item}</span></div>`;
    }
    wall.innerHTML = html;
  }

  /* ---------- Ticker ---------- */
  function buildTicker() {
    // Plus the next arcade release (games dated in the future, see OPEN_ITEMS.md) and the season's line
    const next = D.games.filter((g) => g.play && isLocked(g)).sort((a, b) => String(a.date).localeCompare(String(b.date)))[0];
    const extra = [
      next ? `🕹️ Next arcade game: ${next.title}, unlocking ${unlockDay(next)}!` : "",
      (seasonNow() || {}).ticker || "",
    ].filter(Boolean);
    const items = [...D.ticker, ...extra].map((t) => `<span>${esc(t)}</span>`).join("");
    $("#ticker").innerHTML = items + items; // doubled for a seamless loop
  }

  // Current season from data.js → seasons (first match wins). ?season=winter previews one.
  function seasonNow() {
    const list = D.seasons || [];
    const forced = new URLSearchParams(location.search).get("season");
    if (forced) return list.find((s) => s.key === forced) || null;
    const d = new Date();
    const m = d.getMonth() + 1;
    return list.find((s) => s.months.includes(m) && (!s.fromDay || d.getDate() >= s.fromDay)) || null;
  }
  window.yvySeason = seasonNow;

  /* ---------- Animal Crossing dialog (typewriter) ---------- */
  function buildDialog() {
    const el = $("#dialogText");
    const text = D.welcome;
    if (reduceMotion) { el.textContent = text; return; }
    let i = 0;
    let timer = setInterval(() => {
      el.textContent = text.slice(0, ++i);
      if (i >= text.length) clearInterval(timer);
    }, 32);
    $("#dialog").addEventListener("click", () => { clearInterval(timer); el.textContent = text; });
  }

  /* ---------- Welcome card ---------- */
  function buildWelcome() {
    const me = photosIn("me");
    $("#headPhoto").innerHTML = me.length ? imgTag(me[0].src, "Yvy", "🌟", me[0].focus) : px("flower", 9);
    $("#headButton").addEventListener("click", () => openLightbox(me, 0, "Almost Actual Photos"));
    $("#announcement").textContent = D.announcement;

    const now = new Date();
    $("#historyDate").textContent = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).replace(",", "");
    const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 864e5);
    $("#historyFact").textContent = D.history.length ? D.history[dayOfYear % D.history.length] : "";

    document.querySelectorAll("[data-px]").forEach((el) => {
      const big = el.closest(".battle-on") ? 8 : el.closest(".portal-icon") ? 3 : el.closest(".stamp") ? 4 : 3;
      el.innerHTML = px(el.dataset.px, big);
    });
    $("#mascot").innerHTML = px("chicken", 6);
  }

  /* ---------- Games ---------- */
  const TYPES = {
    garden: { label: "🌱 garden", icon: "sprout", emoji: "🌱" },
    silly:  { label: "🤪 silly",  icon: "silly",  emoji: "🤪" },
    story:  { label: "💖 story",  icon: "heart",  emoji: "💖" },
    mystery: { label: "❓ mystery", icon: "mystery", emoji: "❓" },
    arcade: { label: "🕹️ arcade", icon: "silly", emoji: "🕹️" },
  };
  // type can be one key or a list (e.g. ["silly", "story"]); the first one picks the icon.
  // Games you can play right here (g.play) are always in "arcade" too.
  const typesOf = (g) => {
    const list = [].concat(g.type || []).filter((t) => TYPES[t]);
    if (!list.length) list.push("silly");
    if (g.play && !list.includes("arcade")) list.push("arcade");
    return list;
  };
  const typeKey = (g) => typesOf(g)[0];
  // A game dated in the future stays locked until that day ("🔒 coming Nov 18"), then
  // unlocks by itself. That way games can be built ahead and released one a month.
  const todayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const isLocked = (g) => Boolean(g.date) && String(g.date) > todayStr();
  const unlockDay = (g) => new Date(g.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const sortedGames = () => D.games.filter((g) => !isLocked(g)).sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const isNew = (g) => g.date && !isLocked(g) && (Date.now() - new Date(g.date + "T00:00:00")) / 864e5 < 45;
  // Pixel icons draw 5x, or smaller if that wouldn't fit the 70px square
  const iconScale = (name) => {
    const art = window.Pixel.ART[name];
    return art ? Math.min(5, Math.floor(64 / Math.max(art.grid.length, art.grid[0].length))) : 5;
  };
  const gameIcon = (g) => {
    if (g.thumb) return imgTag(g.thumb, "", TYPES[typeKey(g)].emoji, g.focus);
    const name = g.icon || TYPES[typeKey(g)].icon;
    return px(name, iconScale(name));
  };
  const playable = (g) => !isLocked(g) && Boolean(g.play || g.url);
  // PG-13 games ask "are you 13 or older?" first (see buildAgeCheck).
  const isPG13 = (g) => g.rated === "PG-13";
  const ageAttrs = (g) => (isPG13(g) ? ` data-age13="${esc(g.title)}" data-age-why="${esc(g.ratedFor || "")}"` : "");
  // Arcade games (in arcade/) open in the pop-up player; everything else opens in a new tab.
  const gameLink = (g) => (g.play
    ? `href="${esc(g.play)}" data-play="${esc(g.title)}"`
    : `href="${esc(g.url)}" target="_blank" rel="noopener"`) + ageAttrs(g);

  function renderGames(filter) {
    // The portal lists games in the order they're written in data.js ("Latest 5" goes by date).
    const games = D.games.filter((g) => filter === "all" || typesOf(g).includes(filter));
    if (!games.length) {
      $("#gameList").innerHTML = `<li class="game-empty">Nothing here yet... something is still sprouting!</li>`;
      return;
    }
    $("#gameList").innerHTML = games.map((g) => {
      const type = typeKey(g);
      const tags =
        typesOf(g).map((t) => `<span class="tag tag-${t}">${TYPES[t].label}</span>`).join("") +
        (isNew(g) ? `<span class="tag tag-new">NEW!</span>` : "") +
        (g.badge ? `<span class="tag tag-badge">${esc(g.badge)}</span>` : "") +
        (isPG13(g) ? `<span class="tag tag-rated">PG-13</span>` : "") +
        (isLocked(g) ? `<span class="tag tag-soon">🔒 coming ${esc(unlockDay(g))}</span>`
          : playable(g) ? "" : `<span class="tag tag-soon">coming soon</span>`);
      const inner =
        `<span class="game-thumb ${type}">${gameIcon(g)}</span>
         <span><span class="game-title">${esc(g.title)}</span> - ${esc(g.blurb)}<br>${tags}</span>`;
      // "Behind the Game" devlog button sits next to the row link (js/portfolio.js opens it)
      const devlog = (D.devlogs || {})[g.title] && !isLocked(g)
        ? `<button type="button" class="devlog-btn" data-devlog="${esc(g.title)}">📜 Behind the Game</button>`
        : "";
      return playable(g)
        ? `<li class="${devlog ? "has-devlog" : ""}"><a class="game" ${gameLink(g)}>${inner}</a>${devlog}</li>`
        : `<li class="${devlog ? "has-devlog" : ""}"><div class="game">${inner}</div>${devlog}</li>`;
    }).join("");
  }

  function buildGames() {
    const present = Object.keys(TYPES).filter((t) => D.games.some((g) => typesOf(g).includes(t)));
    $("#filters").innerHTML = `<button type="button" class="filter is-on" data-filter="all">All</button>` +
      (present.length > 1 ? present.map((t) => `<button type="button" class="filter" data-filter="${t}">${TYPES[t].label}</button>`).join("") : "");
    renderGames("all");
    document.querySelectorAll(".filter").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".filter").forEach((b) => b.classList.toggle("is-on", b === btn));
        renderGames(btn.dataset.filter);
      });
    });

    $("#latestList").innerHTML = sortedGames().slice(0, 5).map((g) =>
      `<li>${playable(g) ? `<a ${gameLink(g)}>${esc(g.title)}</a>` : esc(g.title)}</li>`
    ).join("");

    const featured = D.games.find((g) => g.featured && !isLocked(g)) || sortedGames()[0];
    if (featured) {
      $("#tvScreen").innerHTML = featured.thumb
        ? imgTag(featured.thumb, featured.title, "🎮", featured.focus)
        : `<div>${px(featured.icon || TYPES[typeKey(featured)].icon, 9)}<p class="tv-title">${esc(featured.title)}</p></div>`;
      const play = $("#tvPlay");
      if (featured.play) {
        play.href = featured.play;
        play.dataset.play = featured.title;
      } else if (featured.url) {
        play.href = featured.url;
        play.target = "_blank";
        play.rel = "noopener";
      } else {
        play.textContent = "SOON!";
      }
      if (isPG13(featured)) {
        play.dataset.age13 = featured.title;
        play.dataset.ageWhy = featured.ratedFor || "";
      }
    }
  }

  /* ---------- 13+ check for PG-13 games ---------- */
  // The Garden Worm Dilemma: "W worms for every P sq ft; the bed is w ft × l ft; how many worms?"
  // The numbers change every time, and the answer is always a whole number.
  function wormProblem() {
    const pick = (list) => list[Math.floor(Math.random() * list.length)];
    for (;;) {
      const per = pick([2, 3, 4]);           // square feet per patch
      const worms = pick([2, 3, 4, 5, 6]);   // earthworms per patch
      const w = pick([2, 3, 4, 5]);
      const l = pick([4, 5, 6, 7, 8, 9, 10, 11, 12]);
      const area = w * l;
      // keep it a real two-step problem, with no more than 2 worms per square so the picture stays readable
      if (worms === per || worms > per * 2 || area % per || area < 12) continue;
      return { per, worms, w, l, area, answer: (area / per) * worms };
    }
  }

  // The raised bed drawn to scale: one square per square foot, with one example
  // patch (pink) showing how many worms go in it.
  function bedSvg(p) {
    const c = 20, f = 6, top = 16, left = 22;
    const bedW = p.l * c + f * 2, bedH = p.w * c + f * 2;
    const W = left + bedW + 4, H = top + bedH + 4;
    let s = `<svg viewBox="0 0 ${W} ${H}" width="${Math.round(W * 1.35)}" role="img" aria-label="A raised garden bed ${p.w} feet by ${p.l} feet, drawn as ${p.area} one-foot squares. One pink patch of ${p.per} squares holds ${p.worms} earthworms.">`;
    s += `<text x="${left + bedW / 2}" y="11" text-anchor="middle" class="age-dim">${p.l} ft</text>`;
    s += `<text x="12" y="${top + bedH / 2}" text-anchor="middle" class="age-dim" transform="rotate(-90 12 ${top + bedH / 2})">${p.w} ft</text>`;
    s += `<rect x="${left}" y="${top}" width="${bedW}" height="${bedH}" rx="4" fill="#b0683a" stroke="#2b1a52" stroke-width="2"/>`;
    for (let r = 0; r < p.w; r++) {
      for (let col = 0; col < p.l; col++) {
        const patch = r === 0 && col < p.per;
        s += `<rect x="${left + f + col * c}" y="${top + f + r * c}" width="${c}" height="${c}" fill="${patch ? "#ffd6ec" : (r + col) % 2 ? "#6e4a2e" : "#7a5233"}" stroke="${patch ? "#8a3fd1" : "#5a3b24"}" stroke-width="1"/>`;
      }
    }
    s += `<rect x="${left + f}" y="${top + f}" width="${p.per * c}" height="${c}" fill="none" stroke="#8a3fd1" stroke-width="2" stroke-dasharray="4 2"/>`;
    for (let i = 0; i < p.worms; i++) {
      const x = left + f + ((i + 0.5) * p.per * c) / p.worms;
      s += `<text x="${x}" y="${top + f + c / 2 + (i % 2 ? 5 : 3)}" text-anchor="middle" font-size="${p.worms > p.per * 1.5 ? 9 : 12}">🪱</text>`;
    }
    return s + "</svg>";
  }

  // Clicking a PG-13 game asks for an "I'm 13 or older" checkbox, then the worm problem.
  // Once someone gets it right, they aren't asked again until their next visit
  // (sessionStorage). It's an honor-system check, not a lock.
  function buildAgeCheck() {
    const box = $("#ageCheck");
    const card = box.querySelector(".age-card");
    const ok = $("#ageOk");
    const go = $("#ageGo");
    const step1 = $("#ageStep1");
    const step2 = $("#ageStep2");
    const answer = $("#ageAnswer");
    const KEY = "yvy-age13-ok";
    let pending = null;
    let lastFocus = null;
    let problem = null;
    const confirmed = () => { try { return sessionStorage.getItem(KEY) === "1"; } catch (e) { return false; } };

    const showStep = (n) => {
      step1.hidden = n !== 1;
      step2.hidden = n !== 2;
      card.setAttribute("aria-labelledby", n === 1 ? "ageTitle" : "ageQuizTitle");
    };
    const newProblem = () => {
      problem = wormProblem();
      const p = problem;
      $("#ageQuiz").innerHTML = `Elena is building a healthy composting bin for her vegetable garden. She reads that a thriving garden bed needs <b>${p.worms} earthworms for every ${p.per} square feet</b> of soil.`;
      $("#ageBed").innerHTML = bedSvg(p) +
        `<p class="age-legend">Each square = 1 sq ft · <span class="age-swatch"></span> = ${p.per} sq ft with ${p.worms} 🪱</p>`;
      $("#ageAsk").textContent = `Her new raised bed is ${p.w} ft × ${p.l} ft (${p.area} square feet). How many earthworms does she need to add to the soil?`;
      answer.value = "";
    };

    const open = (link) => {
      pending = link;
      lastFocus = document.activeElement;
      $("#ageGame").textContent = link.dataset.age13;
      const why = link.dataset.ageWhy;
      $("#ageWhy").textContent = why ? `It has some ${why}.` : "";
      ok.checked = false;
      go.disabled = true;
      showStep(1);
      box.hidden = false;
      ok.focus();
    };
    const close = () => {
      box.hidden = true;
      pending = null;
      if (lastFocus) lastFocus.focus();
    };

    // Capture phase, so this runs before the arcade pop-up or the new-tab link
    document.addEventListener("click", (e) => {
      const link = e.target.closest("a[data-age13]");
      if (!link || confirmed()) return;
      e.preventDefault();
      e.stopPropagation();
      open(link);
    }, true);

    ok.addEventListener("change", () => { go.disabled = !ok.checked; });
    go.addEventListener("click", () => {
      if (!ok.checked || !pending) return;
      newProblem();
      $("#ageFeedback").textContent = "";
      showStep(2);
      answer.focus();
    });
    step2.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!pending || !problem) return;
      const guess = answer.value.trim();
      if (/^\d+$/.test(guess) && Number(guess) === problem.answer) {
        try { sessionStorage.setItem(KEY, "1"); } catch (err) { /* storage blocked: we'll just ask again next time */ }
        const link = pending;
        close();
        link.click(); // now goes through to the game
        return;
      }
      // Wrong: a hint and fresh numbers, so guessing doesn't work
      $("#ageFeedback").textContent = "Not quite! Tip: work out how many patches fit in the bed, then count the worms. Here's a fresh one 🌱";
      newProblem();
      answer.focus();
    });
    $("#ageBack").addEventListener("click", close);
    $("#ageBack2").addEventListener("click", close);
    $("#ageClose").addEventListener("click", close);
    box.addEventListener("click", (e) => { if (e.target === e.currentTarget) close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !box.hidden) close(); });
  }

  /* ---------- Spring countdown ---------- */
  function buildCountdown() {
    const el = $("#springCountdown");
    const target = () => {
      const now = new Date();
      let t = new Date(now.getFullYear(), 2, 20);
      if (t <= now) t = new Date(now.getFullYear() + 1, 2, 20);
      return t;
    };
    const tick = () => {
      let s = Math.max(0, Math.floor((target() - new Date()) / 1000));
      const d = Math.floor(s / 86400); s %= 86400;
      const h = Math.floor(s / 3600); s %= 3600;
      const m = Math.floor(s / 60); s %= 60;
      el.innerHTML = [String(d).padStart(3, "0"), h, m, s].map((n) => `<span>${String(n).padStart(2, "0")}</span>`).join("<span>:</span>");
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- Scrapbook ---------- */
  const scrap = { album: "me", index: 0 };

  function renderScrapbook() {
    const album = ALBUMS.find((a) => a.key === scrap.album);
    const list = photosIn(album.key);
    document.querySelectorAll(".scrap-tab").forEach((t) => t.setAttribute("aria-selected", String(t.dataset.album === album.key)));
    const photoBtn = $("#polaroidPhoto");
    if (list.length) {
      scrap.index = (scrap.index + list.length) % list.length;
      const p = list[scrap.index];
      photoBtn.innerHTML = imgTag(p.src, p.caption || album.label, album.emoji, p.focus);
      $("#polaroidCaption").textContent = p.caption || "";
      if (album.dates && p.date) {
        const when = document.createElement("span");
        when.className = "polaroid-date";
        when.textContent = new Date(p.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        $("#polaroidCaption").appendChild(when);
      }
      $("#scrapCount").textContent = `${scrap.index + 1} / ${list.length}`;
    } else {
      photoBtn.innerHTML = `<div class="placeholder"><span style="font-size:64px">${album.emoji}</span>${album.label} photos coming soon!</div>`;
      $("#polaroidCaption").textContent = "Apparently these photos are still developing, please.";
      $("#scrapCount").textContent = "0 / 0";
    }
  }

  function buildScrapbook() {
    $("#scrapTabs").innerHTML = ALBUMS.map((a) =>
      `<button class="scrap-tab" type="button" role="tab" data-album="${a.key}">${a.emoji} ${a.label}</button>`
    ).join("");
    // Start on the first album that actually has photos
    const firstFull = ALBUMS.find((a) => photosIn(a.key).length);
    if (firstFull) scrap.album = firstFull.key;

    $("#scrapTabs").addEventListener("click", (e) => {
      const tab = e.target.closest(".scrap-tab");
      if (!tab) return;
      scrap.album = tab.dataset.album;
      scrap.index = 0;
      renderScrapbook();
    });
    $("#scrapPrev").addEventListener("click", () => { scrap.index--; renderScrapbook(); });
    $("#scrapNext").addEventListener("click", () => { scrap.index++; renderScrapbook(); });
    $("#polaroidPhoto").addEventListener("click", () => {
      const album = ALBUMS.find((a) => a.key === scrap.album);
      openLightbox(photosIn(album.key), scrap.index, album.label);
    });
    renderScrapbook();
  }

  /* ---------- Critters ---------- */
  const soundOf = (c, kindField) => (kindField === "breed" ? "chicken" : /cat/i.test(c.kind) ? "cat" : "dog");
  const critterPhoto = (c, emoji, size) => (c.photo ? imgTag(c.photo, c.name, emoji, c.focus)
    : (emoji === "🐔" ? px("chicken", size) : `<span>${emoji}</span>`));
  function critterCard(c, kindField, emoji) {
    // The photo is a button: click to pet (hearts + a little sound, js/extras.js)
    return `<article class="critter">
      <button type="button" class="critter-photo" data-pet="${esc(c.name)}" data-sound="${soundOf(c, kindField)}" aria-label="Pet ${esc(c.name)}">${critterPhoto(c, emoji, 6)}</button>
      <span class="critter-name">${esc(c.name)}</span>
      <p class="critter-pets" data-pets-for="${esc(c.name)}" aria-live="polite"></p>
      <p class="critter-kind">${esc(c[kindField])}</p>
      <p class="critter-fact">${esc(c.fact)}</p>
    </article>`;
  }

  /* ---------- Critter of the Month (data.js → critterOfTheMonth, cards in flock[].card / pets[].card) ---------- */
  // This month's critter swaps its usual card for a little trading card. Click it and the big card
  // pops out; click a move to watch them do it. Next month they get their usual card back.
  const allCritters = () => [
    ...D.flock.map((c) => ({ c, kindField: "breed", emoji: "🐔" })),
    ...D.pets.map((c) => ({ c, kindField: "kind", emoji: "🐾" })),
  ].filter((x) => x.c.card);
  function critterOfTheMonth() {
    const all = allCritters();
    const C = D.critterOfTheMonth || {};
    const byName = (n) => n && all.find((x) => x.c.name.toLowerCase().startsWith(String(n).toLowerCase()));
    const order = (C.order || []).map(byName).filter(Boolean);
    const list = order.length ? order : all;
    if (!list.length) return null;
    const [sy, sm] = String(C.start || "2026-10").split("-").map(Number);
    const pickFor = (y, m) => byName((C.pins || {})[`${y}-${String(m + 1).padStart(2, "0")}`])
      || list[(((y * 12 + m) - (sy * 12 + sm - 1)) % list.length + list.length) % list.length];
    const now = new Date();
    const q = new URLSearchParams(location.search);
    const preview = q.get("cotm");
    const real = pickFor(now.getFullYear(), now.getMonth());
    const pick = (preview && byName(preview)) || real;
    const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    // turn: how many times they've been Critter of the Month (this month included), so each turn gets
    // a new photo (card.photos). A preview shows their next turn; ?turn=2 previews another one.
    const first = sy * 12 + sm - 1;
    const at = (i) => pickFor(Math.floor(i / 12), i % 12).c === pick.c;
    let month = now.getFullYear() * 12 + now.getMonth();
    for (let k = 0; k < 240 && !at(month); k++) month++;
    let turn = 0;
    for (let i = first; i <= month; i++) if (at(i)) turn++;
    turn = Math.max(1, +q.get("turn") || turn);
    // live: this really is their month (not just a ?cotm= preview), so their card can be saved as a PDF
    return { ...pick, list, next: pickFor(next.getFullYear(), next.getMonth()), month: now, turn, live: pick.c === real.c };
  }
  // This turn's card photo: card.photos in turn order (starts over when it runs out), else their usual photo
  function cotmPhoto(m, size) {
    const { c, emoji, turn } = m;
    const photos = c.card.photos || [];
    const p = photos.length ? photos[(turn - 1) % photos.length] : null;
    return p ? imgTag(p.src, c.name, emoji, p.focus) : critterPhoto(c, emoji, size);
  }

  // Holo foil layers on top of a card (style.css → .tcard-shine / .tcard-glare, moved by holo())
  const HOLO = '<span class="tcard-shine" aria-hidden="true"></span><span class="tcard-glare" aria-hidden="true"></span>';
  const pips = (n) => Array.from({ length: 5 }, (_, i) => `<i class="${i < n ? "on" : ""}"></i>`).join("");
  // The little card that sits in the critter's usual spot
  function cotmMini(m) {
    const { c, kindField, emoji } = m;
    const k = c.card;
    return `<article class="critter critter-cotm">
      <button type="button" class="tcard tcard-mini${k.memorial ? " is-memorial" : ""}" data-cotm-open aria-haspopup="dialog" aria-label="${esc(c.name)} is Critter of the Month! Open the trading card">
        <span class="tcard-banner">★ Critter of the Month ★</span>
        <span class="tcard-top"><span class="tcard-name">${esc(c.name)}</span><span class="tcard-hp"><small>HP</small>${esc(k.hp)}</span></span>
        <span class="tcard-photo">${cotmPhoto(m, 6)}</span>
        <span class="tcard-type">${esc(k.type)} type · ${esc(c[kindField])}</span>
        <span class="tcard-mini-moves">${k.moves.map((mv) => `<span>${esc(mv.name)}</span>`).join("")}</span>
        <span class="tcard-tap">✨ Click to open ✨</span>
        ${HOLO}
      </button>
      <p class="critter-pets" data-pets-for="${esc(c.name)}" aria-live="polite"></p>
    </article>`;
  }
  const monthName = (m) => m.month.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  // The big card in the pop-up
  function cotmBig(m) {
    const { c, kindField, emoji, list, next } = m;
    const k = c.card;
    const stars = "★".repeat(k.rarity || 1) + "☆".repeat(5 - (k.rarity || 1));
    const num = String(list.findIndex((x) => x.c === c) + 1).padStart(3, "0") + "/" + String(list.length).padStart(3, "0");
    return `<article class="tcard tcard-big${k.memorial ? " is-memorial" : ""}">
      <p class="tcard-banner">★ Critter of the Month ★ ${esc(monthName(m))}</p>
      <header class="tcard-top">
        <span class="tcard-name">${esc(c.name)}</span>
        <span class="tcard-hp"><small>HP</small>${esc(k.hp)}</span>
      </header>
      <button type="button" class="tcard-photo" data-pet="${esc(c.name)}" data-sound="${soundOf(c, kindField)}" aria-label="Pet ${esc(c.name)}">
        <span class="tcard-actor">${cotmPhoto(m, 10)}</span>
        <span class="tcard-sprite" aria-hidden="true">${px(k.sprite || c.name.toLowerCase().replace(/[^a-z].*$/, ""), 5)}</span>
        <span class="tcard-fx" aria-hidden="true"></span>
        <span class="tcard-say" aria-live="polite"></span>
        ${k.memorial ? '<span class="tcard-ribbon">Forever loved</span>' : ""}
      </button>
      <p class="tcard-type">${esc(k.type)} type · ${esc(c[kindField])}</p>
      <ul class="tcard-moves">${k.moves.map((mv, i) => `
        <li><button type="button" class="tcard-move" data-move="${i}">
          <b>${esc(mv.name)}</b><span class="tcard-dmg">${mv.dmg ? esc(mv.dmg) : "♥"}</span>
          <span class="tcard-move-text">${esc(mv.text)}</span>
        </button></li>`).join("")}
      </ul>
      <dl class="tcard-stats">${Object.entries(k.stats).map(([stat, n]) => `
        <div><dt>${esc(stat)}</dt><dd aria-label="${n} out of 5">${pips(n)}</dd></div>`).join("")}
      </dl>
      <footer class="tcard-foot">
        <span><b>Weakness:</b> ${esc(k.weakness)}</span>
        <span class="tcard-rarity" aria-label="Rarity ${k.rarity || 1} out of 5">${stars}</span>
        <span><b>Resists:</b> ${esc(k.resist)}</span>
        <span class="tcard-num">No. ${num}</span>
      </footer>
      <p class="tcard-hint">Click a move to see it! Click the photo to give ${esc(c.name)} a pet.${next.c !== c ? ` Next month: ${esc(next.c.name)}` : ""}</p>
      ${HOLO}
    </article>${m.live ? `
    <p class="tcard-save">
      <button type="button" class="tcard-save-btn" data-cotm-pdf>📥 Save this card (PDF)</button>
      <small>Only while ${esc(c.name)} is Critter of the Month!</small>
    </p>` : ""}`;
  }

  // Play a move: their little pixel sprite acts it out over the photo, emoji fly out,
  // and a Pokémon-style line pops up
  const calm = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function playMove(card, c, mv) {
    const actor = $(".tcard-sprite", card);
    const fx = $(".tcard-fx", card);
    const say = $(".tcard-say", card);
    say.textContent = `${c.name} used ${mv.name.toUpperCase()}!`;
    say.classList.remove("is-on");
    void say.offsetWidth;
    say.classList.add("is-on");
    if (calm()) return;
    actor.className = "tcard-sprite";
    void actor.offsetWidth; // restart the animation if the same move is clicked twice
    actor.classList.add(`do-${mv.anim || "flip"}`);
    fx.className = `tcard-fx fx-${mv.anim || "flip"}`;
    fx.innerHTML = Array.from({ length: 6 }, (_, i) =>
      `<span style="left:${10 + ((i * 37) % 80)}%;top:${20 + ((i * 23) % 60)}%;animation-delay:${i * 0.08}s">${esc(mv.fx || "✨")}</span>`).join("");
    clearTimeout(playMove.t);
    playMove.t = setTimeout(() => { fx.innerHTML = ""; }, 1800);
  }

  // Holo trading card feel (like simeydotme's pokemon-cards-css): the card tilts toward the pointer,
  // the rainbow foil slides and a glare follows it. Springs keep it smooth and it settles back flat.
  // Sets --mx/--my (pointer %), --rx/--ry (tilt), --bx/--by (foil position), --hyp, --holo on the card.
  // Returns showcase(), a little swirl that shows the foil off without a pointer (when the big card opens).
  function holo(card, tilt) {
    if (!card || calm()) return () => {};
    const cur = { x: 50, y: 50, o: 0 };
    const vel = { x: 0, y: 0, o: 0 };
    let to = { x: 50, y: 50, o: 0 };
    let raf = 0, swirl = 0, soft = false;
    const draw = () => {
      const k = soft ? 0.03 : 0.07, damp = soft ? 0.82 : 0.72;
      let busy = false;
      for (const p of ["x", "y", "o"]) {
        vel[p] = (vel[p] + (to[p] - cur[p]) * k) * damp;
        cur[p] += vel[p];
        if (Math.abs(vel[p]) > 0.01 || Math.abs(to[p] - cur[p]) > 0.05) busy = true;
      }
      const dx = cur.x - 50, dy = cur.y - 50;
      const s = card.style;
      s.setProperty("--mx", `${cur.x}%`);
      s.setProperty("--my", `${cur.y}%`);
      s.setProperty("--rx", `${(dx / 50) * tilt}deg`);
      s.setProperty("--ry", `${(-dy / 50) * tilt}deg`);
      s.setProperty("--bx", `${50 + dx * 0.3}%`);
      s.setProperty("--by", `${50 + dy * 0.3}%`);
      s.setProperty("--hyp", Math.min(1, Math.hypot(dx, dy) / 50).toFixed(3));
      s.setProperty("--holo", Math.max(0, cur.o).toFixed(3));
      raf = busy ? requestAnimationFrame(draw) : 0;
    };
    const aim = (t, isSoft) => { to = t; soft = isSoft; if (!raf) raf = requestAnimationFrame(draw); };
    card.addEventListener("pointermove", (e) => {
      cancelAnimationFrame(swirl);
      const r = card.getBoundingClientRect();
      const x = Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100));
      const y = Math.min(100, Math.max(0, ((e.clientY - r.top) / r.height) * 100));
      card.classList.add("is-holo");
      aim({ x, y, o: 1 }, false);
    });
    const rest = () => { card.classList.remove("is-holo"); aim({ x: 50, y: 50, o: 0 }, true); };
    card.addEventListener("pointerleave", rest);
    card.addEventListener("pointercancel", rest);
    return () => {
      const t0 = performance.now();
      card.classList.add("is-holo");
      const step = (t) => {
        const a = (t - t0) / 1800;
        if (a >= 1) return rest();
        const r = 38 * Math.sin(a * Math.PI); // swings out, round once, and back to the middle
        aim({ x: 50 + r * Math.cos(a * Math.PI * 2), y: 50 + r * Math.sin(a * Math.PI * 2), o: 1 }, false);
        swirl = requestAnimationFrame(step);
      };
      swirl = requestAnimationFrame(step);
    };
  }

  // "Save this card (PDF)": print just the card (style.css → body.print-card) so the
  // print dialog's "Save as PDF" makes a one-page card. Only for the real critter of the month.
  // Print mode stays on until the card closes (afterprint fires too early on some phones).
  const pageTitle = document.title;
  function saveCard(m) {
    if (!m.live) return;
    document.title = `${m.c.name} - Critter of the Month - ${monthName(m)}`; // the PDF's file name
    document.body.classList.add("print-card");
    window.print();
  }

  function buildCritters() {
    const m = critterOfTheMonth();
    const render = (list, kindField, emoji) => list.map((c) =>
      (m && m.c === c ? cotmMini(m) : critterCard(c, kindField, emoji))).join("");
    $("#flockCards").innerHTML = render(D.flock, "breed", "🐔");
    $("#petCards").innerHTML = render(D.pets, "kind", "🐾");
    const box = $("#critterCardBox");
    if (!m || !box) return;
    holo($(".tcard-mini", $("#critters")), 16);

    const slot = $("#critterCard");
    let back = null;
    const open = () => {
      slot.innerHTML = cotmBig(m);
      back = document.activeElement;
      box.hidden = false;
      $("#critterCardClose").focus();
      const showcase = holo($(".tcard-big", slot), 8);
      // Show off the foil and the first move as the card opens
      setTimeout(() => { if (!box.hidden) { showcase(); playMove(slot, m.c, m.c.card.moves[0]); } }, 450);
    };
    const close = () => {
      if (box.hidden) return;
      box.hidden = true;
      slot.innerHTML = "";
      document.body.classList.remove("print-card");
      document.title = pageTitle;
      if (back) back.focus();
    };
    $("#critters").addEventListener("click", (e) => { if (e.target.closest("[data-cotm-open]")) open(); });
    slot.addEventListener("click", (e) => {
      const b = e.target.closest("[data-move]");
      if (b) playMove(slot, m.c, m.c.card.moves[+b.dataset.move]);
      if (e.target.closest("[data-cotm-pdf]")) saveCard(m);
    });
    $("#critterCardClose").addEventListener("click", close);
    box.addEventListener("click", (e) => { if (e.target === box) close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  }

  /* ---------- Lesson Board: the chalkboard of what garden class is learning (data.js → lessons) ---------- */
  function buildLessonBoard() {
    const L = D.lessons;
    const board = $("#lessons");
    if (!L || !board || !(L.now || (L.done || []).length)) return;
    const where = (l) => `${l.island} (island ${l.islandNo || "?"} of the ${l.world})`;
    // Each activity is a chalk box: ✓ finished, ▶ the one we're on
    const steps = (l) => `<ol class="lb-steps">${l.activities.map((a, i) => {
      const n = i + 1;
      const done = (l.did || []).includes(n);
      const now = l.now === n;
      return `<li class="${done ? "is-done" : now ? "is-now" : ""}"><span class="lb-mark" aria-hidden="true">${done ? "✓" : now ? "▶" : n}</span>
        ${esc(a)}${done ? ' <span class="sr-only">(done)</span>' : now ? " <span class=\"lb-tag\">we're here!</span>" : ""}</li>`;
    }).join("")}</ol>`;
    const head = (l) => `<p class="lb-unit">Unit ${esc(l.unit)} · Lesson ${esc(l.lesson)}</p><h3 class="lb-title">${esc(l.title)}</h3>`;
    const game = L.game ? `<a class="lb-play" href="${esc(L.game.url)}" target="_blank" rel="noopener">🎮 Play it in ${esc(L.game.name)} ▶</a>` : "";
    board.innerHTML = `
      <h2 class="lb-heading" id="lessonBoardTitle">📚 Garden Class${L.quarter ? ` · ${esc(L.quarter)}` : ""}</h2>
      ${L.now ? `<section class="lb-now">
        <p class="lb-label">✏️ Now learning</p>
        ${head(L.now)}
        <p class="lb-where">In Gardenbound: <b>${esc(where(L.now))}</b></p>
        ${steps(L.now)}
        ${game}
      </section>` : ""}
      ${(L.done || []).length ? `<section class="lb-done">
        <p class="lb-label">⭐ Done this quarter</p>
        ${L.done.map((l) => `<div class="lb-lesson">${head(l)}
          <p class="lb-where">In Gardenbound: <b>${esc(where(l))}</b></p>${steps(l)}</div>`).join("")}
      </section>` : ""}`;
    board.hidden = false;
  }

  /* ---------- Garden Almanac: San Diego planting calendar (data.js → growing) ---------- */
  const MONTHS = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  const shiftMonth = (m, n) => ((m - 1 + n + 120) % 12) + 1;

  // Is month m inside any [start, end] window? (x.5 = mid-month; start > end wraps past December)
  function windowHit(windows, m) {
    for (const [a, b] of windows || []) {
      const s = Math.floor(a);
      const e = Math.floor(b);
      const inside = s <= e ? m >= s && m <= e : m >= s || m <= e;
      if (inside) {
        return { note: m === s && a % 1 ? "from mid-month" : m === e && b % 1 ? "until mid-month" : "" };
      }
    }
    return null;
  }

  function buildGrowing() {
    const G = D.growing;
    if (!G || !$("#growing")) return;
    const thisMonth = new Date().getMonth() + 1;
    let month = thisMonth;
    let area = G.defaultArea === "inland" ? "inland" : "coastal";
    try {
      const saved = localStorage.getItem("yvy-area");
      if (saved === "coastal" || saved === "inland") area = saved;
    } catch (e) { /* storage blocked: use the default */ }

    // Hand-drawn icon (js/veg-icons.js) when a crop has no accurate emoji
    const glyph = (c) => (c.icon && window.VegIcons && VegIcons.svg(c.icon)) || esc(c.emoji || "🌱");
    const chip = (c, notes, extra) => {
      const note = [].concat(notes, c.note).filter(Boolean).join(", ");
      return `<li><span class="chip-emoji" aria-hidden="true">${glyph(c)}</span>${esc(c.name)}` +
        `${note ? ` <em>(${esc(note)})</em>` : ""}${extra || ""}</li>`;
    };
    const groups = G.groups || [{ key: "veg", label: "Vegetables", emoji: "🥕" }];
    const groupOf = (c) => c.group || "veg";
    const openGroups = new Set(); // drop-downs stay open while you flip months

    // What to sow / start in trays / plant out in month m, for a list of crops
    function columns(m, crops) {
      const sow = [];
      const tray = [];
      const plant = [];
      const names = new Set();
      const add = (list, c, ...rest) => { list.push(chip(c, ...rest)); names.add(c.name); };
      crops.forEach((c) => {
        const hit = windowHit(c[area], m);
        if (hit && (c.how === "sow" || c.how === "either")) {
          add(sow, c, hit.note, c.how === "either" ? ' <b class="chip-alt" title="Can also be started in trays">🪴</b>' : "");
        }
        if (hit && c.how === "tray") add(tray, c, hit.note);
        if (hit && c.how === "plant") add(plant, c, hit.note);
        const out = c.plant && windowHit(c.plant[area], m);
        if (out) add(plant, c, out.note);
        // Warm-season transplants: start seeds in trays the two months before planting out
        const first = c.trayFirst && c[area] && c[area][0] ? Math.floor(c[area][0][0]) : 0;
        if (first && (m === shiftMonth(first, -2) || m === shiftMonth(first, -1))) {
          add(tray, c, `plant out in ${MONTHS[first - 1]}`);
        }
      });
      return { sow, tray, plant, count: names.size, crops: crops.filter((c) => names.has(c.name)) };
    }

    const packet = (cls, title, note, items) => (items.length
      ? `<div class="packet packet-${cls}"><h4>${title}</h4><p class="packet-note">${note}</p><ul class="chips">${items.join("")}</ul></div>`
      : "");

    function groupDrop(g, m) {
      const col = columns(m, G.crops.filter((c) => groupOf(c) === g.key));
      const title = `<span class="cg-title">${esc(g.emoji)} ${esc(g.label)}</span>`;
      if (!col.count) {
        return `<div class="crop-group is-empty">${title}<span class="cg-count">nothing to plant this month</span></div>`;
      }
      const preview = col.crops.slice(0, 7).map((c) => `<span class="chip-emoji">${glyph(c)}</span>`).join("");
      const either = col.sow.some((x) => x.includes("chip-alt"));
      return `<details class="crop-group crop-group-${esc(g.key)}" data-group="${esc(g.key)}"${openGroups.has(g.key) ? " open" : ""}>
          <summary>${title}<span class="cg-preview" aria-hidden="true">${preview}</span><span class="cg-count">${col.count} to plant</span></summary>
          <div class="packets">
            ${packet("sow", "🌰 Direct sow", "Seeds straight into the ground", col.sow)}
            ${packet("tray", "🪴 Start in trays", "Seeds in trays or pots, transplant later", col.tray)}
            ${packet("plant", "🌿 Plant out", "Transplants, bare-root, slips, sets or corms", col.plant)}
          </div>
          ${either ? '<p class="packet-legend">🪴 = can also be started in trays first</p>' : ""}
        </details>`;
    }

    function render() {
      $("#areaToggle").querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.area === area)));
      $("#monthTabs").innerHTML = MONTHS.map((name, i) =>
        `<button type="button" class="month-tab${i + 1 === thisMonth ? " is-now" : ""}" data-month="${i + 1}" aria-pressed="${i + 1 === month}" aria-label="${name}">${name.slice(0, 3)}</button>`
      ).join("");
      const cool = month >= 9 || month <= 2;
      $("#monthCard").innerHTML = `
        <div class="month-head">
          <h3>${MONTHS[month - 1]}${month === thisMonth ? ' <span class="now-badge">this month!</span>' : ""}</h3>
          <span class="season-badge ${cool ? "cool" : "warm"}">${cool ? "🍂 Cool season" : "☀️ Warm season"}</span>
        </div>
        <p class="month-where">${area === "coastal" ? "🌊 Coastal" : "⛰️ Inland"} San Diego · tap a group to see what to plant</p>
        ${groups.map((g) => groupDrop(g, month)).join("")}`;
    }

    // Cheat sheet: one drop-down per group, four ways to plant inside
    const WAYS = [
      ["🌰 Direct sow", "Sow seeds right where they'll grow.", (c) => c.how === "sow"],
      ["🪴 Start in trays", "Give these a head start, then transplant.", (c) => c.how === "tray" || c.trayFirst],
      ["🔀 Either way", "Sow in place, or start in trays and transplant.", (c) => c.how === "either"],
      ["🌿 Plant out", "Planted as transplants, bare-root, slips, sets or corms.", (c) => c.how === "plant" && !c.trayFirst],
    ];
    $("#cheatSheet").innerHTML = groups.map((g) => {
      const crops = G.crops.filter((c) => groupOf(c) === g.key);
      const cols = WAYS.map(([title, note, pick]) => {
        const items = crops.filter(pick);
        return items.length
          ? `<div class="cheat-col"><h4>${title}</h4><p>${note}</p><ul>${items.map((c) => `<li>${glyph(c)} ${esc(c.name)}</li>`).join("")}</ul></div>`
          : "";
      }).join("");
      return cols ? `<details class="cheat-group"><summary>${esc(g.emoji)} ${esc(g.label)}</summary><div class="cheat-grid">${cols}</div></details>` : "";
    }).join("");

    const sources = G.sources || (G.source ? [G.source] : []);
    if (sources.length) {
      $("#growingSource").innerHTML = `Planting dates: ${sources.map((src) =>
        `<a href="${esc(src.url)}" target="_blank" rel="noopener">${esc(src.label)}</a>${src.covers ? ` (${esc(src.covers)})` : ""}`
      ).join(" · ")}. They're based on long-term averages and shift a few weeks with the weather, so keep an eye on your own garden too.`;
    }

    // Remember which drop-downs are open ("toggle" doesn't bubble, so listen in the capture phase)
    $("#monthCard").addEventListener("toggle", (e) => {
      const d = e.target;
      if (!d.dataset || !d.dataset.group) return;
      if (d.open) openGroups.add(d.dataset.group); else openGroups.delete(d.dataset.group);
    }, true);
    $("#areaToggle").addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-area]");
      if (!btn) return;
      area = btn.dataset.area;
      try { localStorage.setItem("yvy-area", area); } catch (err) { /* ignore */ }
      render();
    });
    $("#monthTabs").addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-month]");
      if (!btn) return;
      month = Number(btn.dataset.month);
      render();
    });
    render();
  }

  /* ---------- About letter ---------- */
  function buildAbout() {
    $("#aboutText").innerHTML = D.about.map((p) => `<p>${esc(p)}</p>`).join("");
    const links = [...D.links];
    $("#letterLinks").innerHTML =
      (D.email ? `<a href="#about" data-write>✉ Write to me</a>` : "") +
      links.map((l) => `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join("");
  }

  /* ---------- "Write to me" mail picker ---------- */
  // Visitors pick Gmail / Outlook / Yahoo / their mail app and get a draft with
  // the address filled in, so the address itself never shows on the page.
  function buildMailPicker() {
    if (!D.email) return; // no email set: "Write to me" links just jump to the letter
    const to = encodeURIComponent(D.email);
    const plainSub = $("#mailSub").textContent;
    let letter = "";

    // A shop "Ask me!" tag (data-ask = item number, or "counter") starts a fill-in letter
    // about that item. See data.js → shop.letter.
    function shopLetter(which) {
      const S = D.shop || {};
      const L = S.letter;
      const item = which === "counter" ? S.counter : (S.items || [])[+which];
      if (!L || !item || !item.ask) return null;
      const fill = (s) => String(s || "").replace(/\{item\}/g, item.name);
      const blanks = (title, lines) => [title.toUpperCase(), ...lines.map((l) => `- ${l} `)].join("\n");
      return {
        item,
        subject: (item.subject || fill(L.subject)) + " (from YvyGrounds)",
        body: [
          L.hello,
          `${fill(L.intro)} ${item.emoji || ""}`.trim(),
          blanks("About us", L.aboutUs || []),
          blanks(item.ask.title, [...item.ask.lines, ...(L.always || [])]),
          `${L.end} \n`,
          L.thanks,
        ].join("\n\n"),
      };
    }

    function fillOptions(subject, body) {
      const su = encodeURIComponent(subject);
      const b = body ? encodeURIComponent(body) : "";
      const mb = body ? encodeURIComponent(body.replace(/\n/g, "\r\n")) : ""; // mailto wants CRLF
      const options = [
        { label: "Gmail",       cls: "gmail",   url: `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${su}${b && `&body=${b}`}` },
        { label: "Outlook",     cls: "outlook", url: `https://outlook.live.com/mail/0/deeplink/compose?to=${to}&subject=${su}${b && `&body=${b}`}` },
        { label: "Yahoo Mail",  cls: "yahoo",   url: `https://compose.mail.yahoo.com/?to=${to}&subject=${su}${b && `&body=${b}`}` },
        { label: "My mail app", cls: "app",     url: `mailto:${D.email}?subject=${su}${mb && `&body=${mb}`}` },
      ];
      $("#mailOptions").innerHTML = options.map((o) =>
        `<a class="mail-option mail-${o.cls}" href="${esc(o.url)}"${o.url.startsWith("mailto:") ? "" : ' target="_blank" rel="noopener"'}>${o.label}</a>`
      ).join("") +
        (body ? `<button class="mail-option mail-copy mail-copy-letter" id="mailCopyLetter" type="button">Copy the letter</button>` : "") +
        `<button class="mail-option mail-copy" id="mailCopy" type="button">Copy my address</button>`;
    }

    let lastFocus = null;
    const open = (which) => {
      const ask = which != null ? shopLetter(which) : null;
      letter = ask ? ask.body : "";
      fillOptions(ask ? ask.subject : "Hi Yvy! (from YvyGrounds)", letter);
      $("#mailSub").textContent = ask
        ? `Asking about ${ask.item.emoji || ""} ${which === "counter" ? "something special" : ask.item.name}. I started your letter for you, just fill in the blanks!`
        : plainSub;
      lastFocus = document.activeElement;
      $("#mailStatus").textContent = "";
      $("#mailPicker").hidden = false;
      $("#mailClose").focus();
    };
    const close = () => {
      $("#mailPicker").hidden = true;
      if (lastFocus) lastFocus.focus();
    };

    document.addEventListener("click", (e) => {
      const link = e.target.closest("[data-write]");
      if (!link) return;
      e.preventDefault();
      open(link.dataset.ask);
    });
    $("#mailClose").addEventListener("click", close);
    $("#mailPicker").addEventListener("click", (e) => { if (e.target === e.currentTarget) close(); });
    $("#mailOptions").addEventListener("click", (e) => {
      if (e.target.closest("a.mail-option")) setTimeout(close, 150);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !$("#mailPicker").hidden) close();
    });
    // The copy buttons get redrawn on every open, so listen on their box
    $("#mailOptions").addEventListener("click", (e) => {
      const b = e.target.closest("button.mail-copy");
      if (!b) return;
      const done = (msg) => { $("#mailStatus").textContent = msg; };
      const isLetter = b.id === "mailCopyLetter";
      const text = isLetter ? letter : D.email;
      const fallback = () => done(isLetter ? "Couldn't copy it, sorry! Try a mail button instead." : D.email);
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text)
          .then(() => done(isLetter ? "Copied! Paste it into an email (Copy my address gets the To: line) ♥" : "Copied! Paste it into any email. ♥"))
          .catch(fallback);
      } else {
        fallback();
      }
    });
  }

  /* ---------- Arcade pop-up: mini games that live in arcade/ ---------- */
  function buildArcade() {
    const box = $("#arcade");
    const frame = $("#arcadeFrame");
    let lastFocus = null;
    const open = (src, title) => {
      lastFocus = document.activeElement;
      $("#arcadeTitle").textContent = title;
      $("#arcadePop").href = src;
      frame.title = title;
      frame.addEventListener("load", () => frame.focus(), { once: true });
      frame.src = src;
      box.hidden = false;
      document.body.classList.add("arcade-open");
    };
    const close = () => {
      if (box.hidden) return;
      box.hidden = true;
      frame.src = "about:blank"; // stops the game and its sounds
      document.body.classList.remove("arcade-open");
      if (lastFocus) lastFocus.focus();
    };

    document.addEventListener("click", (e) => {
      const link = e.target.closest("a[data-play]");
      if (!link || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      open(link.getAttribute("href"), link.dataset.play);
    });
    $("#arcadeClose").addEventListener("click", close);
    $("#arcadePop").addEventListener("click", () => setTimeout(close, 150));
    box.addEventListener("click", (e) => { if (e.target === e.currentTarget) close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
    // Pressing Esc inside a game (when it isn't mid-round) asks to close the pop-up
    window.addEventListener("message", (e) => {
      if (e.origin === location.origin && e.data && e.data.yvyArcade === "close") close();
    });
  }

  /* ---------- Lightbox ---------- */
  const lb = { list: [], index: 0, lastFocus: null };

  function renderLightbox() {
    const has = lb.list.length > 0;
    if (has) {
      lb.index = (lb.index + lb.list.length) % lb.list.length;
      const p = lb.list[lb.index];
      $("#lightboxPhoto").innerHTML = imgTag(p.src, p.caption || "", "📸");
      $("#lightboxCaption").textContent = p.caption || "";
      $("#lightboxCount").textContent = `${lb.index + 1} / ${lb.list.length}`;
    } else {
      $("#lightboxPhoto").innerHTML = `<div class="placeholder"><span style="font-size:72px">📸</span>Photos coming soon!</div>`;
      $("#lightboxCaption").textContent = "Still developing... please check back!";
      $("#lightboxCount").textContent = "";
    }
    $("#lightboxPrev").hidden = $("#lightboxNext").hidden = lb.list.length < 2;
  }
  function openLightbox(list, index, title) {
    lb.list = list;
    lb.index = index || 0;
    lb.lastFocus = document.activeElement;
    $("#lightboxTitle").textContent = title || "Almost Actual Photos";
    renderLightbox();
    $("#lightbox").hidden = false;
    $("#lightboxClose").focus();
  }
  window.YvyLightbox = openLightbox; // the How-to guides (js/howto.js) show their photos here too
  function closeLightbox() {
    $("#lightbox").hidden = true;
    if (lb.lastFocus) lb.lastFocus.focus();
  }
  function buildLightbox() {
    $("#lightboxClose").addEventListener("click", closeLightbox);
    $("#lightboxPrev").addEventListener("click", () => { lb.index--; renderLightbox(); });
    $("#lightboxNext").addEventListener("click", () => { lb.index++; renderLightbox(); });
    $("#lightbox").addEventListener("click", (e) => { if (e.target === e.currentTarget) closeLightbox(); });
    document.addEventListener("keydown", (e) => {
      if ($("#lightbox").hidden) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") { lb.index--; renderLightbox(); }
      if (e.key === "ArrowRight") { lb.index++; renderLightbox(); }
    });
  }

  /* ---------- Meadow: plant flowers + walking chicken ---------- */
  function buildMeadow() {
    const meadow = $("#meadow");
    const bed = $("#flowers");
    const petals = ["#ff8cc6", "#ffffff", "#ffd23f", "#b197fc", "#ff6b6b", "#7cc6ff"];
    meadow.addEventListener("click", (e) => {
      if (e.target.closest("a")) return;
      const rect = meadow.getBoundingClientRect();
      const holder = document.createElement("div");
      holder.innerHTML = px("flower", 4, { P: petals[Math.floor(Math.random() * petals.length)] });
      const flower = holder.firstElementChild;
      flower.style.left = `${e.clientX - rect.left}px`;
      flower.style.top = `${e.clientY - rect.top + 6}px`;
      bed.appendChild(flower);
      while (bed.children.length > 40) bed.firstElementChild.remove();
    });
    $("#walkerSprite").innerHTML = px("chicken", 4);
    $("#mascot").addEventListener("click", () => {
      const m = $("#mascot");
      m.animate([{ transform: "translateY(0)" }, { transform: "translateY(-24px) rotate(-10deg)" }, { transform: "translateY(0)" }], { duration: 400 });
    });
    $("#year").textContent = new Date().getFullYear();
  }

  /* ---------- Cursor sparkles ---------- */
  function buildSparkles() {
    if (reduceMotion) return;
    const chars = ["✦", "★", "♥", "✿", "✧"];
    const colors = ["#ff8cc6", "#ffd23f", "#b197fc", "#7cd35a", "#7cc6ff"];
    let last = 0;
    window.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      const now = performance.now();
      if (now - last < 45) return;
      last = now;
      const s = document.createElement("span");
      s.className = "sparkle";
      s.textContent = chars[Math.floor(Math.random() * chars.length)];
      s.style.color = colors[Math.floor(Math.random() * colors.length)];
      s.style.left = `${e.clientX + 6}px`;
      s.style.top = `${e.clientY + 6}px`;
      s.style.setProperty("--dx", `${Math.random() * 30 - 15}px`);
      s.addEventListener("animationend", () => s.remove());
      document.body.appendChild(s);
    }, { passive: true });
  }

  /* ---------- Go! ---------- */
  buildLogo();
  buildPhotoWall();
  buildTicker();
  buildDialog();
  buildWelcome();
  buildGames();
  buildCountdown();
  buildScrapbook();
  buildCritters();
  buildLessonBoard();
  buildGrowing();
  buildAbout();
  buildMailPicker();
  buildArcade();
  buildAgeCheck();
  buildLightbox();
  buildMeadow();
  buildSparkles();

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildPhotoWall, 200);
  });
})();
