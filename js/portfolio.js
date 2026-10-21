/*
 * Portfolio bits: the résumé as an RPG character sheet (#resume), the "Hire me" shop
 * counter (#shop) and the guestbook (#guestbook). Content lives in data.js → resume,
 * shop and guestbook. Signed guestbook entries go through the API in society-api/
 * and wait for Yvy's approval on society-admin.html.
 */
(function () {
  "use strict";

  const D = window.YVY;
  const px = window.Pixel.svg;
  const $ = (sel, el = document) => el.querySelector(sel);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
  const API = ["localhost", "127.0.0.1"].includes(location.hostname) ? "http://localhost:8787" : D.society && D.society.api;

  /* ---------- Résumé: RPG character sheet ---------- */
  function buildResume() {
    const R = D.resume;
    const box = $("#rpgSheet");
    if (!R || !box) return;
    const rpg = R.rpg || {};
    const year = new Date().getFullYear();
    const level = Math.max(1, year - (R.startYear || year));
    // EXP fills up over the year, and the level goes up every January
    const start = new Date(year, 0, 1);
    const exp = Math.round(((Date.now() - start) / (new Date(year + 1, 0, 1) - start)) * 100);
    const me = (D.photos.me || [])[0];
    const portrait = me
      ? `<img src="${esc(me.src)}" alt="Yvy" data-fallback="🌟">`
      : px("flower", 9);

    const bar = (b) => {
      const pct = Math.round((b.value / b.max) * 100);
      return `<div class="rpg-bar">
        <span class="rpg-bar-label">${esc(b.label)}</span>
        <span class="rpg-meter" role="meter" aria-valuemin="0" aria-valuemax="${esc(b.max)}" aria-valuenow="${esc(b.value)}" aria-label="${esc(b.name)}">
          <i style="width:${pct}%;background:${esc(b.color || "#7cc85a")}"></i></span>
        <span class="rpg-bar-num">${esc(b.value)}/${esc(b.max)}</span>
        <span class="rpg-bar-name">${esc(b.name)}</span>
      </div>`;
    };

    const panels = {
      stats: `<ul class="rpg-stats">${(rpg.stats || []).map((s) => `
          <li><span class="rpg-stat-name"><span aria-hidden="true">${esc(s.emoji)}</span> ${esc(s.name)}</span>
            <span class="rpg-pips" role="meter" aria-valuemin="0" aria-valuemax="20" aria-valuenow="${esc(s.value)}" aria-label="${esc(s.name)}">${
              Array.from({ length: 10 }, (_, i) => `<i class="${s.value >= (i + 1) * 2 ? "on" : s.value >= i * 2 + 1 ? "half" : ""}"></i>`).join("")}</span>
            <b class="rpg-stat-num">${esc(s.value)}</b></li>`).join("")}
        </ul>
        <p class="rpg-hint">Stats out of 20. Handstand training is ongoing.</p>`,

      items: `<ul class="rpg-items">${R.skills.map((s) =>
          `<li><span class="rpg-slot" aria-hidden="true">${esc(s.emoji)}</span><span>${esc(s.name)}</span></li>`).join("")}
        </ul>
        <p class="rpg-hint">${R.languages.map((l) => `${esc(l.name)}: ${esc(l.level)}`).join(" · ")}</p>`,

      quests: `<ol class="rpg-quests">${R.jobs.map((j, i) => `
          <li class="rpg-quest${j.current ? " is-active" : ""}">
            <details${i === 0 ? " open" : ""}>
              <summary>
                <span class="rpg-quest-name">${esc(j.quest || j.role)}</span>
                <span class="rpg-quest-tag">${j.current ? "★ ACTIVE" : "✔ CLEAR"}</span>
                <span class="rpg-quest-role">${esc(j.role)}</span>
                <span class="rpg-quest-meta">${esc([j.org, j.place, j.dates].filter(Boolean).join(" · "))}${j.ages ? ` · ${esc(j.ages)}` : ""}</span>
              </summary>
              <ul class="rpg-loot">${j.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
            </details>
          </li>`).join("")}
        </ol>`,

      badges: `<ul class="rpg-badges">${R.projects.map((p) => `
          <li><span class="rpg-badge-icon" aria-hidden="true">${esc(p.emoji)}</span>
            <span><b>${p.link ? `<a href="${esc(p.link)}">${esc(p.name)}</a>` : esc(p.name)}</b><br>${esc(p.text)}</span></li>`).join("")}
        </ul>`,

      training: `<div class="rpg-training">
          ${R.education.map((e) => `<div class="rpg-school"><b>🎓 ${esc(e.school)}</b><ul>${e.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul></div>`).join("")}
          ${R.certifications.map((c) => `<div class="rpg-school"><b>📜 ${esc(c.area)}</b><p>${esc(c.text)}</p></div>`).join("")}
        </div>`,
    };
    const TABS = [
      ["stats", "STATS"], ["items", "ITEMS"], ["quests", "QUESTS"], ["badges", "BADGES"], ["training", "TRAINING"],
    ];

    box.innerHTML = `
      <div class="rpg-card">
        <div class="rpg-portrait">${portrait}</div>
        <p class="rpg-name">${esc(R.name)}</p>
        <p class="rpg-level">LV <b>${level}</b></p>
        <div class="rpg-bar rpg-exp">
          <span class="rpg-bar-label">EXP</span>
          <span class="rpg-meter" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${exp}" aria-label="Experience to the next level"><i style="width:${exp}%"></i></span>
          <span class="rpg-bar-num">${exp}%</span>
          <span class="rpg-bar-name">to LV ${level + 1} (levels up every January)</span>
        </div>
        ${(rpg.bars || []).map(bar).join("")}
        <dl class="rpg-facts">
          <dt>CLASS</dt><dd>${esc(rpg.cls)}</dd>
          ${rpg.subclass ? `<dt>SUBCLASS</dt><dd>${esc(rpg.subclass)}</dd>` : ""}
          <dt>HOME</dt><dd>${esc(R.location)}</dd>
          ${rpg.alignment ? `<dt>ALIGN</dt><dd>${esc(rpg.alignment)}</dd>` : ""}
        </dl>
      </div>
      <div class="rpg-window">
        <div class="rpg-menu" role="tablist" aria-label="Character sheet">
          ${TABS.map(([k, label], i) => `<button type="button" role="tab" id="rpgTab-${k}" aria-controls="rpgPanel" aria-selected="${i === 0}" data-rpg="${k}">${label}</button>`).join("")}
        </div>
        <div class="rpg-panel" id="rpgPanel" role="tabpanel" aria-labelledby="rpgTab-stats" tabindex="0"></div>
      </div>
      <p class="rpg-summary">${esc(R.summary)}</p>`;

    const panel = $("#rpgPanel");
    const show = (k) => {
      box.querySelectorAll("[data-rpg]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.rpg === k)));
      panel.setAttribute("aria-labelledby", `rpgTab-${k}`);
      panel.innerHTML = panels[k];
    };
    const menu = $(".rpg-menu", box);
    menu.addEventListener("click", (e) => {
      const b = e.target.closest("[data-rpg]");
      if (b) show(b.dataset.rpg);
    });
    // Arrow keys move between tabs, like a real RPG menu
    menu.addEventListener("keydown", (e) => {
      const dir = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (!dir) return;
      e.preventDefault();
      const buttons = [...menu.querySelectorAll("[data-rpg]")];
      const i = buttons.findIndex((b) => b.getAttribute("aria-selected") === "true");
      const next = buttons[(i + dir + buttons.length) % buttons.length];
      next.focus();
      show(next.dataset.rpg);
    });
    show("stats");
  }

  /* ---------- Hire me: shop counter ---------- */
  function buildShop() {
    const S = D.shop;
    if (!S || !$("#shop")) return;
    $("#shopKeeper").innerHTML = px("chicken", 7);
    $("#shopKeeperName").textContent = S.keeper || "Yvy";
    $("#shopGreeting").textContent = S.greeting;
    $("#shopItems").innerHTML = S.items.map((it) => `
      <li class="shop-item">
        <span class="shop-item-icon" aria-hidden="true">${esc(it.emoji)}</span>
        <h3>${esc(it.name)}</h3>
        ${it.tag ? `<p class="shop-item-tag">${esc(it.tag)}</p>` : ""}
        <p class="shop-item-blurb">${esc(it.blurb)}</p>
        <span class="shop-price">${esc(it.price || S.price || "Ask me!")}</span>
      </li>`).join("");
    $("#shopClosing").textContent = S.closing || "";

    // Pay / tip jar: Venmo link and a "copy my Zelle email" button (the address isn't printed on the page)
    const venmo = String(S.venmo || "").replace(/^@/, "").trim();
    const zelle = S.zelle && D.email;
    if (!venmo && !zelle) return;
    $("#shopPay").innerHTML = `
      <p class="shop-pay-title">🫙 Tip Jar &amp; Payments</p>
      ${S.payNote ? `<p class="shop-pay-note">${esc(S.payNote)}</p>` : ""}
      <div class="shop-pay-buttons">
        ${venmo ? `<a class="pay-btn pay-venmo" href="https://venmo.com/u/${encodeURIComponent(venmo)}" target="_blank" rel="noopener">Venmo @${esc(venmo)}</a>` : ""}
        ${zelle ? `<button type="button" class="pay-btn pay-zelle" id="zelleCopy">Zelle: copy my email</button>` : ""}
      </div>
      <p class="shop-pay-status" id="shopPayStatus" role="status"></p>`;
    const copy = $("#zelleCopy");
    if (copy) {
      copy.addEventListener("click", () => {
        const done = (msg) => { $("#shopPayStatus").textContent = msg; };
        const fallback = () => done(`Zelle me at ${D.email}`);
        if (navigator.clipboard) {
          navigator.clipboard.writeText(D.email)
            .then(() => done("Copied! Paste it into Zelle in your bank app. Thank you! ♥"))
            .catch(fallback);
        } else {
          fallback();
        }
      });
    }
  }

  /* ---------- Guestbook ---------- */
  function buildGuestbook() {
    const G = D.guestbook;
    const root = $("#guestbook");
    if (!G || !root) return;
    const avatars = (G.avatars || ["chicken"]).filter((a) => window.Pixel.ART[a]);
    const avatarOf = (name) => (avatars.includes(name) ? name : avatars[0]);
    // "YYYY" shows just the year, "YYYY-MM" the month and year (for letters without an exact date)
    const fmt = (iso) => {
      if (/^\d{4}$/.test(iso)) return iso;
      if (/^\d{4}-\d{2}$/.test(iso)) return new Date(iso + "-15T12:00:00").toLocaleDateString("en-US", { month: "short", year: "numeric" });
      return new Date(iso.length === 10 ? iso + "T12:00:00" : iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    $("#gbIntro").textContent = G.intro || "";

    const entry = (e, star) => `<article class="gb-entry${star ? " is-star" : ""}">
        <div class="gb-avatar">${px(avatarOf(e.avatar), 4)}</div>
        <div class="gb-body">
          <p class="gb-meta"><b>${esc(e.name)}</b>${e.role ? ` <span class="gb-role">${esc(e.role)}</span>` : ""}${
            e.date ? ` <span class="gb-date">${esc(fmt(e.date))}</span>` : ""}${star ? ' <span class="gb-ribbon">★ kind words</span>' : ""}</p>
          <p class="gb-text">${esc(e.text)}</p>
        </div>
      </article>`;

    // Kind words go oldest first (by date), so new letters can be added anywhere in data.js
    const kind = (G.kindWords || []).filter((k) => k && k.name && k.text)
      .sort((a, b) => String(a.date || "").localeCompare(String(b.date || "")));
    // One entry at a time, flipped with BACK / NEXT (like the scrapbook)
    let pages = [];
    let index = 0;
    const showPage = (step) => {
      const page = $("#gbEntries");
      if (!pages.length) {
        page.innerHTML = '<p class="society-empty">No signatures yet. Be the first! ✏️</p>';
        $("#gbCount").textContent = "";
      } else {
        index = (index + pages.length) % pages.length;
        page.innerHTML = pages[index];
        $("#gbCount").textContent = `${index + 1} / ${pages.length}`;
        if (step) page.firstElementChild.classList.add(step > 0 ? "flip-next" : "flip-back");
      }
      $("#gbPrev").hidden = $("#gbNext").hidden = pages.length < 2;
    };
    const turn = (step) => { index += step; showPage(step); };
    $("#gbPrev").addEventListener("click", () => turn(-1));
    $("#gbNext").addEventListener("click", () => turn(1));
    $(".gb-stage", root).addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") turn(-1);
      if (e.key === "ArrowRight") turn(1);
    });

    const render = (signed, note) => {
      pages = [...kind.map((k) => entry(k, true)), ...signed.map((s) => entry({
        name: s.name, role: s.role, avatar: s.avatar, text: s.message, date: s.createdAt,
      }, false))];
      showPage(0);
      $("#gbNote").innerHTML = note || "";
    };

    // Signed entries load when the guestbook scrolls into view
    let loaded = false;
    const load = async () => {
      if (loaded) return;
      loaded = true;
      render([]);
      if (!API) return;
      try {
        const res = await fetch(`${API}/api/guestbook`);
        if (!res.ok) throw new Error();
        render((await res.json()).entries || []);
      } catch (e) {
        render([], '<p class="society-empty gb-napping">The guestbook pen is out of ink 😴 Signatures will be back soon.</p>');
      }
    };
    const io = new IntersectionObserver((list) => { if (list.some((x) => x.isIntersecting)) { io.disconnect(); load(); } }, { rootMargin: "300px" });
    io.observe(root);
    if (location.hash === "#guestbook") load();

    // Sign form
    const box = $("#gbForm");
    const form = $("form", box);
    const status = $("#gbStatus");
    let lastFocus = null;
    let openedAt = 0;
    $("#gbRoles").innerHTML = (G.roles || ["Visitor"]).map((r) => `<option>${esc(r)}</option>`).join("");
    $("#gbAvatars").innerHTML = avatars.map((a, i) => `
      <label class="gb-pick"><input type="radio" name="avatar" value="${esc(a)}"${i === 0 ? " checked" : ""}>
        <span>${px(a, 3)}<span class="gb-pick-name">${esc(a)}</span></span></label>`).join("");

    const close = () => { box.hidden = true; if (lastFocus) lastFocus.focus(); };
    $("#gbSignBtn").addEventListener("click", () => {
      lastFocus = document.activeElement;
      status.textContent = "";
      status.className = "sf-status";
      openedAt = Date.now();
      box.hidden = false;
      form.elements.name.focus();
    });
    $("#gbClose").addEventListener("click", close);
    box.addEventListener("click", (e) => { if (e.target === box) close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !box.hidden) close(); });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const f = form.elements;
      const fail = (msg) => { status.textContent = msg; status.className = "sf-status is-error"; };
      if (!f.name.value.trim()) return fail("Add your first name or initials.");
      if (f.message.value.trim().length < 2) return fail("Write a little message first!");
      if (!API) return fail("The guestbook isn't connected yet. Please try again later.");
      const btn = $("button[type=submit]", form);
      btn.disabled = true;
      status.className = "sf-status";
      status.textContent = "Sending…";
      try {
        const res = await fetch(`${API}/api/guestbook`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: f.name.value, role: f.role.value, avatar: f.avatar.value,
            message: f.message.value, website: f.website.value, ms: Date.now() - openedAt,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
        status.textContent = data.message || "Thanks for signing! ♥";
        status.className = "sf-status is-ok";
        f.message.value = "";
      } catch (err) {
        fail(err.message === "Failed to fetch" ? "Couldn't reach the guestbook. Please try again in a bit." : err.message);
      }
      btn.disabled = false;
    });
  }

  /* ---------- "Behind the Game" devlogs (data.js → devlogs, keyed by game title) ---------- */
  // Animal Crossing museum plaque: the idea, a sketch, what went wrong, what I learned, tools.
  function buildDevlogs() {
    const box = $("#devlog");
    if (!box) return;
    let lastFocus = null;
    const list = (items) => `<ul>${items.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`;
    const section = (icon, title, body) => (body ? `<section class="devlog-section"><h3><span aria-hidden="true">${icon}</span> ${esc(title)}</h3>${body}</section>` : "");

    const open = (g, L) => {
      lastFocus = document.activeElement;
      $("#devlogTitle").textContent = g.title;
      $("#devlogMeta").textContent = [L.made, L.status].filter(Boolean).join(" · ");
      // Play link works like the portal's: arcade games open in the pop-up player, PG-13 games ask first
      const play = g.play
        ? `href="${esc(g.play)}" data-play="${esc(g.title)}"`
        : g.url ? `href="${esc(g.url)}" target="_blank" rel="noopener"` : "";
      const age = g.rated === "PG-13" ? ` data-age13="${esc(g.title)}" data-age-why="${esc(g.ratedFor || "")}"` : "";
      $("#devlogBody").innerHTML = `
        ${L.sketch ? `<figure class="devlog-sketch"><img src="${esc(L.sketch.src)}" alt="${esc(L.sketch.alt || L.sketch.caption || "Sketch")}" loading="lazy" data-fallback="✏️">
          ${L.sketch.caption ? `<figcaption>${esc(L.sketch.caption)}</figcaption>` : ""}</figure>` : ""}
        ${section("💡", "The idea", L.idea ? `<p>${esc(L.idea)}</p>` : "")}
        ${section("💥", "What went wrong", L.wrong && L.wrong.length ? list(L.wrong) : "")}
        ${section("🌱", "What I learned", L.learned && L.learned.length ? list(L.learned) : "")}
        ${section("🧰", "Tools", L.tools && L.tools.length ? `<p class="devlog-tools">${L.tools.map((t) => `<span>${esc(t)}</span>`).join("")}</p>` : "")}
        ${L.stats && L.stats.length ? `<dl class="devlog-stats">${L.stats.map(([icon, label, value]) =>
          `<div><dt><span aria-hidden="true">${esc(icon)}</span> ${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join("")}</dl>` : ""}
        ${play ? `<p class="devlog-play"><a class="rpg-btn rpg-btn-hire" ${play}${age}>▶ Play ${esc(g.title)}</a></p>` : ""}`;
      box.hidden = false;
      $("#devlogClose").focus();
    };
    const close = () => {
      if (box.hidden) return;
      box.hidden = true;
      if (lastFocus) lastFocus.focus();
    };

    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-devlog]");
      if (btn) {
        const g = D.games.find((x) => x.title === btn.dataset.devlog);
        const L = (D.devlogs || {})[btn.dataset.devlog];
        if (g && L) open(g, L);
        return;
      }
      // The play button hands off to the arcade player (or a new tab), so close the plaque
      if (e.target.closest("#devlogBody a[href]")) setTimeout(close, 0);
    });
    $("#devlogClose").addEventListener("click", close);
    box.addEventListener("click", (e) => { if (e.target === box) close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  }

  buildResume();
  buildShop();
  buildGuestbook();
  buildDevlogs();
})();
