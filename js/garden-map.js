/*
 * Garden Map: the Central Garden drawn as a pixel map (🗺️ Map tab in the Garden Society).
 * Spots come from data.js → gardenMap. Hover, tap or Tab to a bed to see what's planted.
 * Positions are whole grid squares on a 40 × 52 map. Each square is a whole number of pixels
 * (--c, set from the space available), so every edge lands on a pixel and stays straight.
 */
(function () {
  "use strict";

  const M = window.YVY && window.YVY.gardenMap;
  const box = document.getElementById("gardenMap");
  if (!M) return;

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
  const COLS = 40, ROWS = 52;
  const place = ([x, y, w, h]) =>
    `left:calc(var(--c) * ${x});top:calc(var(--c) * ${y});width:calc(var(--c) * ${w});height:calc(var(--c) * ${h})`;
  const classes = (s) => `gm-spot gm-${s.kind}${s.tone ? " gm-" + s.tone : ""}`;
  const label = (s) => (s.text ? `<span class="gm-text">${esc(s.text)}</span>` : "");
  // Spots with repairs to do get a little yellow "!" at their top-right corner (like a quest marker),
  // drawn after everything else so neighbors can't cover it
  const alert = (s) => `<span class="gm-alert" style="left:calc(var(--c) * ${s.x + s.w});top:calc(var(--c) * ${s.y})" aria-hidden="true">!</span>`;
  const list = (items, cls) => `<ul class="${cls}">${items.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`;

  /* Live garden log from the Garden Society API: feedings and to-dos Yvy crossed off on the admin page */
  const S = window.YVY.society || {};
  const API = ["localhost", "127.0.0.1"].includes(location.hostname) ? "http://localhost:8787" : S.api;
  const live = { feeds: {}, done: new Set() };
  const lessonNow = (window.YVY.lessons || {}).now; // what garden class is learning (shown on the Garden Classroom)
  // A to-do's id is a short hash of its text (the admin page makes the same one), so a rewritten
  // to-do starts out unchecked
  const todoKey = (text) => { let h = 5381; for (const ch of text) h = ((h * 33) ^ ch.codePointAt(0)) >>> 0; return h.toString(36); };
  const fedOf = (s) => (s.fed || []).concat(live.feeds[s.id] || []);
  const todoList = (s) => `<ul class="gm-todo">${s.todo.map((t) => {
    const done = s.id && live.done.has(`${s.id}:${todoKey(t)}`);
    return `<li${done ? ' class="is-done"' : ""}>${esc(t)}${done ? ' <span class="sr-only">(done)</span>' : ""}</li>`;
  }).join("")}</ul>`;

  // A planted item is "🥕 carrots" or { icon: "kale", name: "kale" } (js/veg-icons.js)
  function plant(p) {
    if (typeof p === "string") return `<li>${esc(p)}</li>`;
    const icon = p.icon && window.VegIcons ? window.VegIcons.svg(p.icon) + " " : "";
    return `<li>${icon}${esc(p.name)}</li>`;
  }

  /* Feeding log: last time a bed was fed (from its fed log) and when it's due next (from its feedPlan) */
  const midnight = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const parse = (iso) => new Date(iso + "T12:00:00");
  const inMonths = (d, [a, b]) => { const m = d.getMonth() + 1; return a <= b ? m >= a && m <= b : m >= a || m <= b; };
  // First day of the months window that contains d (windows can wrap past December, like Oct to Mar)
  const windowStart = (d, [a, b]) => {
    const y = d.getFullYear();
    return new Date(a <= b || d.getMonth() + 1 >= a ? y : y - 1, a - 1, 1);
  };
  // The next time the window opens after d
  const nextOpening = (d, [a]) => {
    const t = new Date(d.getFullYear(), a - 1, 1);
    return t > d ? t : new Date(d.getFullYear() + 1, a - 1, 1);
  };
  const ids = (entry) => [].concat(entry.id || []);
  function nextFeeding(s, today, fed = fedOf(s)) {
    let best = null;
    (s.feedPlan || []).forEach((item) => {
      const done = fed.filter((e) => ids(e).includes(item.id)).map((e) => parse(e.date));
      const last = done.length ? new Date(Math.max(...done)) : null;
      let due;
      if (item.every) {
        // Every so many days while it's in season; no feeding yet means it's due now (or when the season opens)
        // (calendar days, so the clocks changing in spring and fall can't shift the date)
        due = last ? new Date(last.getFullYear(), last.getMonth(), last.getDate() + item.every) : today;
        if (!inMonths(due, item.months)) due = nextOpening(due, item.months);
      } else if (inMonths(today, item.months)) {
        // Once per season: due now unless it was already done this season
        due = last && last >= windowStart(today, item.months) ? nextOpening(today, item.months) : today;
      } else {
        // Not in season yet. Done a little early (within ~6 weeks of it opening) still counts for this season.
        const open = nextOpening(today, item.months);
        due = last && open - last < 45 * 864e5 ? nextOpening(open, item.months) : open;
      }
      if (due < today) due = today;
      if (!best || due < best.date) best = { date: due, what: [item.what] };
      else if (+due === +best.date) best.what.push(item.what);
    });
    return best;
  }
  const fmt = (d) => d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  function feedLog(s) {
    const today = midnight(new Date());
    const log = fedOf(s).slice().sort((x, y) => (x.date < y.date ? -1 : 1));
    const last = log[log.length - 1];
    const lastText = last
      ? `${fmt(parse(last.date))}: ${ids(last).map((id) => ((s.feedPlan || []).find((p) => p.id === id) || { what: id }).what).join(", ")}`
      : "Not yet";
    const next = nextFeeding(s, today);
    const when = next && (+next.date === +today ? "Today" : fmt(next.date));
    return `<div class="gm-log">
      <p><b>Last fed:</b> ${esc(lastText)}</p>
      <p><b>Next feeding:</b> ${next ? `${esc(when)}: ${esc(next.what.join(", plus "))}` : "None needed"}</p>
    </div>`;
  }

  // The admin page (society-admin.js) uses these too, so to-do ids and feeding dates always match the map
  window.YvyGarden = { todoKey, nextFeeding, parse, midnight };
  if (!box) return;

  const spots = M.spots;
  box.innerHTML = `
    <div class="gm-head">
      <h3 class="leaf-title"><span>${esc(M.title)}</span></h3>
      <p class="gm-season">🗺️ ${esc(M.season)}</p>
    </div>
    <div class="gm-wrap">
      <div class="gm-frame"><div class="gm-map" role="group" aria-label="Map of ${esc(M.title)}">
        ${spots.map((s, i) => {
          const pieces = [[s.x, s.y, s.w, s.h]].concat(s.more || []);
          if (!s.name) {
            return pieces.map((r, n) => `<div class="${classes(s)}" style="${place(r)}" aria-hidden="true"><span class="gm-shape"></span>${n ? "" : label(s)}</div>`).join("");
          }
          // The first piece is the real button; extra pieces (the other arm of an L) just point to it
          return `<button type="button" class="${classes(s)}" style="${place(pieces[0])}" data-i="${i}" aria-label="${esc(s.name)}${s.fix ? ", needs fixing" : ""}"><span class="gm-shape"></span>${label(s)}</button>`
            + pieces.slice(1).map((r) => `<div class="${classes(s)} gm-more" style="${place(r)}" data-i="${i}" aria-hidden="true"><span class="gm-shape"></span></div>`).join("");
        }).join("")}
        ${spots.filter((s) => s.fix).map(alert).join("")}
      </div></div>
      <div class="gm-info" aria-live="polite">
        <span class="gm-name"></span>
        <div class="gm-body"></div>
      </div>
    </div>`;

  const map = box.querySelector(".gm-map");
  const name = box.querySelector(".gm-name");
  const body = box.querySelector(".gm-body");
  let pinned = null;

  // Size the squares to fit: the biggest whole number of pixels per square (at least 5)
  const frame = box.querySelector(".gm-frame");
  const BORDER = 12; // the map's wooden frame, both sides
  function fit() {
    if (!frame.clientWidth) return; // tab hidden
    const c = Math.max(5, Math.min(13, Math.floor((frame.clientWidth - BORDER) / COLS)));
    map.style.setProperty("--c", c + "px");
    map.style.width = c * COLS + BORDER + "px";
    map.style.height = c * ROWS + BORDER + "px";
  }
  new ResizeObserver(fit).observe(frame);

  let shown = null; // the spot in the speech box right now
  function show(i) {
    shown = i;
    const s = spots[i];
    map.querySelectorAll(".is-on").forEach((el) => el.classList.remove("is-on"));
    if (!s) {
      name.textContent = "Yvy";
      body.innerHTML = `<p>${esc(M.hint)}</p>`;
      return;
    }
    map.querySelectorAll(`[data-i="${i}"]`).forEach((el) => el.classList.add("is-on"));
    name.textContent = s.name;
    body.innerHTML =
      (s.planted ? `<p class="gm-what">Growing now:</p><ul class="gm-plants">${s.planted.map(plant).join("")}</ul>` : "") +
      (s.about ? `<p>${esc(s.about)}</p>` : "") +
      (s.lesson && lessonNow ? `<p class="gm-what">Now learning:</p><p>📚 Unit ${esc(lessonNow.unit)} · Lesson ${esc(lessonNow.lesson)}: <b>${esc(lessonNow.title)}</b>
        (${esc(lessonNow.island)} in Gardenbound)</p>` : "") +
      (s.fix ? `<p class="gm-what gm-what-fix">Needs fixing:</p>${list(s.fix, "gm-fix")}` : "") +
      (s.todo ? `<p class="gm-what">${esc(M.todoTitle || "To-do")}:</p>${todoList(s)}` : "") +
      (s.feed ? `<p class="gm-what gm-what-feed">${esc(M.feedTitle || "Feeding")}:</p>${s.feedPlan ? feedLog(s) : ""}${list(s.feed, "gm-feed")}`
        + (M.feedNote ? `<p class="gm-feed-note">${esc(M.feedNote)}</p>` : "") : "") +
      (s.tab ? `<button type="button" class="gm-go" data-tab-go="${esc(s.tab)}">See the compost log ▶</button>` : "") +
      (s.link ? `<a class="gm-go" href="${esc(s.link)}">Meet the flock ▶</a>` : "");
  }

  const spotOf = (e) => e.target.closest("[data-i]");
  map.addEventListener("pointerover", (e) => { const el = spotOf(e); if (el && e.pointerType === "mouse") show(+el.dataset.i); });
  map.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") show(pinned); });
  map.addEventListener("click", (e) => {
    const el = spotOf(e);
    if (!el) return;
    pinned = +el.dataset.i;
    show(pinned);
    if (el.classList.contains("gm-more")) map.querySelector(`button[data-i="${pinned}"]`).focus();
    // On phones the speech box is above the map: bring it back into view if it scrolled away
    const info = body.parentElement.getBoundingClientRect();
    if (info.top < 0) body.parentElement.scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  });
  map.addEventListener("focusin", (e) => { const el = spotOf(e); if (el) { pinned = +el.dataset.i; show(pinned); } });
  // "See the compost log" opens that Garden Society tab
  body.addEventListener("click", (e) => {
    const b = e.target.closest("[data-tab-go]");
    const tab = b && document.querySelector(`.society-tabs [data-tab="${b.dataset.tabGo}"]`);
    if (tab) { tab.click(); tab.focus(); }
  });
  show(null);

  // Load the live log, then redraw whatever is showing
  fetch(`${API}/api/garden`).then((r) => (r.ok ? r.json() : null)).then((data) => {
    if (!data) return;
    (data.feeds || []).forEach((f) => { (live.feeds[f.bed] = live.feeds[f.bed] || []).push({ date: f.fed_on, id: f.plan_ids }); });
    (data.done || []).forEach((d) => live.done.add(`${d.bed}:${d.item}`));
    show(shown);
  }).catch(() => { /* no log yet: the map still works */ });
})();
