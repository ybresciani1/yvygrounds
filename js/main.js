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
    { key: "club",     label: "Garden Club",     emoji: "🌻" },
    { key: "students", label: "Garden Students", emoji: "🌱" },
    { key: "pets",     label: "Pets",            emoji: "🐾" },
    { key: "chickens", label: "Chickens",        emoji: "🐔" },
  ];
  const photosIn = (key) => (D.photos[key] || []).filter((p) => p && p.src);
  const allPhotos = () => ALBUMS.flatMap((a) => photosIn(a.key));

  // If a listed image is missing, show a cute placeholder instead of a broken icon.
  function imgTag(src, alt, fallbackEmoji) {
    return `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy" data-fallback="${esc(fallbackEmoji || "🌱")}">`;
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
    const photos = allPhotos();
    const filler = ["🌱", "🐔", "🌷", "🐶", "🍅", "🌻", "🐣", "🥕", "🐱", "🍓", "🎮", "✨"];
    const cols = Math.ceil((window.innerWidth + 80) / 130) + 1;
    const rows = Math.ceil((window.innerHeight + 80) / 166) + 1;
    wall.style.gridTemplateColumns = `repeat(${cols}, 116px)`;
    let html = "";
    for (let i = 0; i < cols * rows; i++) {
      const col = i % cols;
      const style = `--dy:${col % 2 ? 80 : 0}px;--rot:${((i * 37) % 11) - 5}deg;--h:${(i * 47) % 360}`;
      if (photos.length) {
        html += `<div class="oval" style="${style}">${imgTag(photos[i % photos.length].src, "", filler[i % filler.length])}</div>`;
      } else {
        html += `<div class="oval oval-empty" style="${style}"><span>${filler[i % filler.length]}</span></div>`;
      }
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
    $("#headPhoto").innerHTML = me.length ? imgTag(me[0].src, "Yvy", "🌟") : px("flower", 9);
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
  const sortedGames = () => [...D.games].sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const isNew = (g) => g.date && (Date.now() - new Date(g.date + "T00:00:00")) / 864e5 < 45;
  const gameIcon = (g) => (g.thumb ? imgTag(g.thumb, "", g.type === "garden" ? "🌱" : "🤪") : px(g.type === "garden" ? "sprout" : "silly", 5));

  function renderGames(filter) {
    const games = sortedGames().filter((g) => filter === "all" || g.type === filter);
    if (!games.length) {
      $("#gameList").innerHTML = `<li class="game-empty">Nothing here yet... something is still sprouting!</li>`;
      return;
    }
    $("#gameList").innerHTML = games.map((g) => {
      const tags =
        `<span class="tag tag-${g.type === "garden" ? "garden" : "silly"}">${g.type === "garden" ? "🌱 garden" : "🤪 silly"}</span>` +
        (isNew(g) ? `<span class="tag tag-new">NEW!</span>` : "") +
        (g.url ? "" : `<span class="tag tag-soon">coming soon</span>`);
      const inner =
        `<span class="game-thumb ${g.type === "garden" ? "garden" : "silly"}">${gameIcon(g)}</span>
         <span><span class="game-title">${esc(g.title)}</span> - ${esc(g.blurb)}<br>${tags}</span>`;
      return g.url
        ? `<li><a class="game" href="${esc(g.url)}" target="_blank" rel="noopener">${inner}</a></li>`
        : `<li><div class="game">${inner}</div></li>`;
    }).join("");
  }

  function buildGames() {
    renderGames("all");
    document.querySelectorAll(".filter").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".filter").forEach((b) => b.classList.toggle("is-on", b === btn));
        renderGames(btn.dataset.filter);
      });
    });

    $("#latestList").innerHTML = sortedGames().slice(0, 5).map((g) =>
      `<li>${g.url ? `<a href="${esc(g.url)}" target="_blank" rel="noopener">${esc(g.title)}</a>` : esc(g.title)}</li>`
    ).join("");

    const featured = D.games.find((g) => g.featured) || sortedGames()[0];
    if (featured) {
      $("#tvScreen").innerHTML = featured.thumb
        ? imgTag(featured.thumb, featured.title, "🎮")
        : `<div>${px(featured.type === "garden" ? "sprout" : "silly", 9)}<p class="tv-title">${esc(featured.title)}</p></div>`;
      const play = $("#tvPlay");
      if (featured.url) {
        play.href = featured.url;
        play.target = "_blank";
        play.rel = "noopener";
      } else {
        play.textContent = "SOON!";
      }
    }
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
      photoBtn.innerHTML = imgTag(p.src, p.caption || album.label, album.emoji);
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
    const photo = c.photo ? imgTag(c.photo, c.name, emoji) : (emoji === "🐔" ? px("chicken", 6) : `<span>${emoji}</span>`);
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

  /* ---------- About letter ---------- */
  function buildAbout() {
    $("#aboutText").innerHTML = D.about.map((p) => `<p>${esc(p)}</p>`).join("");
    const links = [...D.links];
    if (D.email) links.unshift({ label: "✉ Write to me", url: "mailto:" + D.email });
    $("#letterLinks").innerHTML = links.map((l) =>
      `<a href="${esc(l.url)}"${l.url.startsWith("mailto:") ? "" : ' target="_blank" rel="noopener"'}>${esc(l.label)}</a>`
    ).join("");
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
  buildAbout();
  buildLightbox();
  buildMeadow();
  buildSparkles();

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildPhotoWall, 200);
  });
})();
