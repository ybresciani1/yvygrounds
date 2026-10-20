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
    { key: "club",     label: "Garden Society", emoji: "🌻" },
    { key: "students", label: "Garden Students", emoji: "🌱" },
    { key: "pets",     label: "Pets",            emoji: "🐾" },
    { key: "chickens", label: "Chickens",        emoji: "🐔" },
  ];
  const photosIn = (key) => (D.photos[key] || []).filter((p) => p && p.src);

  // "focus" picks which part of a photo stays in view when a frame crops it:
  // a word (top, bottom, left, right, center, top left...) or "x% y%" like "30% 20%".
  const FOCUS_WORDS = { top: "50% 0%", bottom: "50% 100%", left: "0% 50%", right: "100% 50%", center: "50% 50%" };
  function focusStyle(focus) {
    if (!focus) return "";
    const value = FOCUS_WORDS[focus] || String(focus).trim();
    return /^[a-z0-9.%\s-]+$/i.test(value) ? ` style="object-position:${value}"` : "";
  }

  // If a listed image is missing, show a cute placeholder instead of a broken icon.
  function imgTag(src, alt, fallbackEmoji, focus) {
    return `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy" data-fallback="${esc(fallbackEmoji || "🌱")}"${focusStyle(focus)}>`;
  }
  document.addEventListener("error", (e) => {
    const img = e.target;
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
        ? `<div class="oval" style="${style}">${imgTag(item.src, "", emoji, item.focus)}</div>`
        : `<div class="oval oval-empty" style="${style}"><span>${item}</span></div>`;
    }
    wall.innerHTML = html;
  }

  /* ---------- Ticker ---------- */
  function buildTicker() {
    const items = D.ticker.map((t) => `<span>${esc(t)}</span>`).join("");
    $("#ticker").innerHTML = items + items; // doubled for a seamless loop
  }

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

    let visits = 1;
    try {
      visits = (parseInt(localStorage.getItem("yvy-visits"), 10) || 0) + 1;
      localStorage.setItem("yvy-visits", String(visits));
    } catch (e) { /* storage blocked, just show 1 */ }
    $("#odometer").innerHTML = String(Math.min(visits, 999999)).padStart(6, "0").split("").map((d) => `<span>${d}</span>`).join("");

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
  const gameIcon = (g) => (g.thumb ? imgTag(g.thumb, "", TYPES[typeKey(g)].emoji, g.focus) : px(g.icon || TYPES[typeKey(g)].icon, 5));
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
      return playable(g)
        ? `<li><a class="game" ${gameLink(g)}>${inner}</a></li>`
        : `<li><div class="game">${inner}</div></li>`;
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
  function critterCard(c, kindField, emoji) {
    const photo = c.photo ? imgTag(c.photo, c.name, emoji, c.focus) : (emoji === "🐔" ? px("chicken", 6) : `<span>${emoji}</span>`);
    return `<article class="critter">
      <div class="critter-photo">${photo}</div>
      <span class="critter-name">${esc(c.name)}</span>
      <p class="critter-kind">${esc(c[kindField])}</p>
      <p class="critter-fact">${esc(c.fact)}</p>
    </article>`;
  }
  function buildCritters() {
    $("#flockCards").innerHTML = D.flock.map((c) => critterCard(c, "breed", "🐔")).join("");
    $("#petCards").innerHTML = D.pets.map((c) => critterCard(c, "kind", "🐾")).join("");
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
    const subject = encodeURIComponent("Hi Yvy! (from YvyGrounds)");
    const options = [
      { label: "Gmail",       cls: "gmail",   url: `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subject}` },
      { label: "Outlook",     cls: "outlook", url: `https://outlook.live.com/mail/0/deeplink/compose?to=${to}&subject=${subject}` },
      { label: "Yahoo Mail",  cls: "yahoo",   url: `https://compose.mail.yahoo.com/?to=${to}&subject=${subject}` },
      { label: "My mail app", cls: "app",     url: `mailto:${D.email}?subject=${subject}` },
    ];
    $("#mailOptions").innerHTML = options.map((o) =>
      `<a class="mail-option mail-${o.cls}" href="${esc(o.url)}"${o.url.startsWith("mailto:") ? "" : ' target="_blank" rel="noopener"'}>${o.label}</a>`
    ).join("") + `<button class="mail-option mail-copy" id="mailCopy" type="button">Copy my address</button>`;

    let lastFocus = null;
    const open = () => {
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
      open();
    });
    $("#mailClose").addEventListener("click", close);
    $("#mailPicker").addEventListener("click", (e) => { if (e.target === e.currentTarget) close(); });
    $("#mailOptions").addEventListener("click", (e) => {
      if (e.target.closest("a.mail-option")) setTimeout(close, 150);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !$("#mailPicker").hidden) close();
    });
    $("#mailCopy").addEventListener("click", () => {
      const done = (msg) => { $("#mailStatus").textContent = msg; };
      if (navigator.clipboard) {
        navigator.clipboard.writeText(D.email)
          .then(() => done("Copied! Paste it into any email. ♥"))
          .catch(() => done(D.email));
      } else {
        done(D.email);
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
