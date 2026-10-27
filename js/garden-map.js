/*
 * Garden Map: the Central Garden drawn as a pixel map (🗺️ Map tab in the Garden Society).
 * Spots come from data.js → gardenMap. Hover, tap or Tab to a bed to see what's planted.
 * gardenMap.otherMaps adds more maps (the Middle School Garden), picked with buttons above the map.
 * Positions are whole grid squares (40 × 53 for the Central Garden; each map sets its cols and rows).
 * Each square is a whole number of pixels (--c, set from the space available), so every edge
 * lands on a pixel and stays straight.
 */
(function () {
  "use strict";

  const M = window.YVY && window.YVY.gardenMap;
  const box = document.getElementById("gardenMap");
  if (!M) return;

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
  const place = ([x, y, w, h]) =>
    `left:calc(var(--c) * ${x});top:calc(var(--c) * ${y});width:calc(var(--c) * ${w});height:calc(var(--c) * ${h})`;
  // hang: "down" / "left" (a fence vine hanging off the fence above it / on its right) adds gm-hang-down / gm-hang-left
  const classes = (s) => `gm-spot gm-${s.kind}${s.tone ? " gm-" + s.tone : ""}${s.clip ? " gm-clip" : ""}${s.hang ? " gm-hang-" + esc(s.hang) : ""}`;
  // textAt: [x, y, w, h] inside the spot (grid squares) puts the label there instead of the middle
  const label = (s) => (s.text ? `<span class="gm-text"${s.textAt ? ` style="inset:auto;${place(s.textAt)}"` : ""}>${esc(s.text)}</span>` : "");
  // clip: a CSS polygon for spots that aren't rectangles (the L-shaped YMCA Room). Only the shape itself is clickable.
  const shape = (s) => `<span class="gm-shape"${s.clip ? ` style="clip-path:${esc(s.clip)}"` : ""}></span>${s.kind === "bucket" ? '<span class="gm-handle" aria-hidden="true"></span>' : ""}`;
  // has: things buried in a bed (ollas, worm bins; data.js → gardenMap.features), drawn small in the bed's corners
  // (bottom-left, bottom-right, top-left, top-right) so they stay clear of the bed's number in the middle.
  // A feature with an emoji (the worm bin's 🪱) shows that emoji, which js/pixel-emoji.js turns into its pixel sprite.
  const FEATURES = M.features || {};
  const icon = (k) => (FEATURES[k] && FEATURES[k].emoji ? esc(FEATURES[k].emoji) : "");
  // hasLayout "stacked": top-center, then bottom-center, with the bed's number between them.
  // hasLayout "right": start on the right side (bottom-right first) instead of the left.
  const marks = (s) => s.has.map((k, n) => {
    const stacked = s.hasLayout === "stacked" && n < 2;
    const right = (n % 2 === 1) !== (s.hasLayout === "right");
    const x = stacked ? s.x + s.w / 2 - 0.5 : right ? s.x + s.w - 1.1 : s.x + 0.1;
    const y = stacked ? (n ? s.y + s.h - 1.1 : s.y + 0.1) : n % 4 < 2 ? s.y + s.h - 1.1 : s.y + 0.1;
    return `<span class="gm-feature gm-f-${esc(k)}" style="left:calc(var(--c) * ${x});top:calc(var(--c) * ${y})" aria-hidden="true">${icon(k)}</span>`;
  }).join("");
  // In the speech box each one is a button; tapping it opens what it is (about), so the box stays short
  const hasList = (s) => {
    const keys = [...new Set(s.has)].filter((k) => FEATURES[k]);
    return keys.length ? `<p class="gm-what">In this bed:</p><p class="gm-has">${keys.map((k) => {
      const f = FEATURES[k], n = s.has.filter((x) => x === k).length;
      return `<button type="button" class="gm-def-btn" data-def="${esc(k)}" aria-expanded="false"><span class="gm-has-icon gm-f-${esc(k)}" aria-hidden="true">${icon(k)}</span>${esc(n > 1 ? `${n} ${f.plural || f.name}` : f.name)} <span aria-hidden="true">ⓘ</span></button>`;
    }).join(" ")}</p><div class="gm-def" hidden></div>` : "";
  };
  // Chores: jobs that come back every few days. A spot's own (chores: the chicken run's food and water), then one per
  // kind of thing buried in the bed (feed the worm bin, fill the ollas). A chore counts as done for `every` days
  // after it was last done.
  const chores = (s) => (s.chores || []).concat([...new Set(s.has || [])].filter((k) => FEATURES[k] && FEATURES[k].chore).map((k) => {
    const c = FEATURES[k].chore;
    return { text: s.has.filter((x) => x === k).length > 1 && c.plural ? c.plural : c.text, every: c.every };
  }));
  const choreNext = (last, every) => { const d = parse(last); return new Date(d.getFullYear(), d.getMonth(), d.getDate() + every); };
  const choreDone = (last, every, today = midnight(new Date())) => !!last && choreNext(last, every) > today;
  // runner: a critter's pixel sprite running laps inside the spot (Beyonce in the chicken run)
  const runner = (s) => `<span class="gm-runner" style="${place([s.x, s.y, s.w, s.h])}" aria-hidden="true"><span class="gm-runner-sprite">${window.Pixel ? window.Pixel.svg(s.runner, 2) : ""}</span></span>`;
  // Spots with repairs to do get a little yellow "!" at their top-right corner (like a quest marker),
  // drawn after everything else so neighbors can't cover it
  const alert = (s, i) => `<span class="gm-alert" data-alert="${i}" style="left:calc(var(--c) * ${s.x + s.w});top:calc(var(--c) * ${s.y})" aria-hidden="true">!</span>`;
  const list = (items, cls) => `<ul class="${cls}">${items.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`;

  /* Live garden log from the Garden Society API: feedings, to-dos Yvy crossed off on the admin page,
     and to-dos members say they did (through "Submit an entry"), which show a "?" until Yvy OKs them */
  const S = window.YVY.society || {};
  const API = ["localhost", "127.0.0.1"].includes(location.hostname) ? "http://localhost:8787" : S.api;
  const live = { feeds: {}, done: new Set(), doneOn: new Map(), pending: new Set(), others: {} };
  const lessonNow = (window.YVY.lessons || {}).now; // what garden class is learning (shown on the Garden Classroom)
  // A to-do's id is a short hash of its text (the admin page makes the same one), so a rewritten
  // to-do starts out unchecked
  const todoKey = (text) => { let h = 5381; for (const ch of text) h = ((h * 33) ^ ch.codePointAt(0)) >>> 0; return h.toString(36); };
  const fedOf = (s) => (s.fed || []).concat(live.feeds[s.id] || []);
  // To-dos and repairs (fix) can both be crossed off; each item's id is the hash of its text
  const isDone = (s, t) => s.id && live.done.has(`${s.id}:${todoKey(t)}`);
  const checkList = (s, items, cls) => `<ul class="${cls}">${items.map((t) => {
    const done = isDone(s, t);
    const waiting = !done && s.id && live.pending.has(`${s.id}:${todoKey(t)}`);
    if (waiting) return `<li class="is-pending">${esc(t)} <em class="gm-waiting">(waiting for Yvy's OK)</em></li>`;
    return `<li${done ? ' class="is-done"' : ""}>${esc(t)}${done ? ' <span class="sr-only">(done)</span>' : ""}</li>`;
  }).join("")}</ul>`;
  // "Other" jobs members did that weren't on the list (after Yvy's OK): a spot's latest three, newest first
  const alsoDone = (s) => {
    const jobs = (live.others[s.id] || []).slice(0, 3);
    return jobs.length ? `<p class="gm-what">Also done:</p><ul class="gm-todo">${jobs.map((j) =>
      `<li class="is-done">${esc(j.other)} <span class="gm-when">(${esc(parse(j.done_on).toLocaleDateString("en-US", { month: "short", day: "numeric" }))})</span></li>`).join("")}</ul>` : "";
  };
  // Chores show when they were last done and when they're due next
  const short = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const choreList = (s) => `<ul class="gm-todo">${chores(s).map((c) => {
    const tag = `${s.id}:${todoKey(c.text)}`, last = live.doneOn.get(tag);
    if (choreDone(last, c.every)) return `<li class="is-done">${esc(c.text)} <span class="gm-when">(done ${short(parse(last))}, next ${short(choreNext(last, c.every))})</span></li>`;
    if (live.pending.has(tag)) return `<li class="is-pending">${esc(c.text)} <em class="gm-waiting">(waiting for Yvy's OK)</em></li>`;
    return `<li>${esc(c.text)} <span class="gm-when gm-due">(${last ? `last done ${short(parse(last))}, ` : ""}due now)</span></li>`;
  }).join("")}</ul>`;
  // Repairs not crossed off yet (the yellow "!" stays on the map until there are none)
  const fixLeft = (s) => (s.fix || []).filter((t) => !isDone(s, t));

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
  window.YvyGarden = { todoKey, nextFeeding, parse, midnight, chores, choreDone, choreNext };
  if (!box) return;

  const maps = [M].concat(M.otherMaps || []);
  let cur = M, spots = M.spots;
  const mapHtml = () => `
        ${spots.map((s, i) => {
          const pieces = [[s.x, s.y, s.w, s.h]].concat(s.more || []);
          if (!s.name) {
            return pieces.map((r, n) => `<div class="${classes(s)}" style="${place(r)}" aria-hidden="true">${shape(s)}${n ? "" : label(s)}</div>`).join("");
          }
          // The first piece is the real button; extra pieces (the other arm of an L) just point to it
          return `<button type="button" class="${classes(s)}" style="${place(pieces[0])}" data-i="${i}" aria-label="${esc(s.name)}${fixLeft(s).length ? ", needs fixing" : ""}">${shape(s)}${label(s)}</button>`
            + pieces.slice(1).map((r) => `<div class="${classes(s)} gm-more" style="${place(r)}" data-i="${i}" aria-hidden="true"><span class="gm-shape"></span></div>`).join("");
        }).join("")}
        ${spots.filter((s) => s.has).map(marks).join("")}
        ${spots.filter((s) => s.runner).map(runner).join("")}
        ${spots.map((s, i) => (s.fix ? alert(s, i) : "")).join("")}`;
  // Once every repair on a spot is crossed off, its "!" goes away (called again when the live log loads)
  const syncAlerts = () => map.querySelectorAll("[data-alert]").forEach((el) => {
    const s = spots[+el.dataset.alert];
    el.hidden = !fixLeft(s).length;
    const btn = map.querySelector(`button[data-i="${el.dataset.alert}"]`);
    if (btn) btn.setAttribute("aria-label", `${s.name}${el.hidden ? "" : ", needs fixing"}`);
  });
  box.innerHTML = `
    ${maps.length > 1 ? `<div class="gm-switch" role="group" aria-label="Pick a garden">${maps.map((m, k) =>
      `<button type="button" data-map="${k}" aria-pressed="${k ? "false" : "true"}">${esc(m.button || m.title)}</button>`).join("")}</div>` : ""}
    <div class="gm-head">
      <h3 class="leaf-title"><span class="gm-title"></span></h3>
      <p class="gm-season"></p>
    </div>
    <div class="gm-wrap">
      <div class="gm-frame"><div class="gm-map" role="group"></div></div>
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
    const cols = cur.cols || 40, rows = cur.rows || 53;
    const c = Math.max(5, Math.min(13, Math.floor((frame.clientWidth - BORDER) / cols)));
    map.style.setProperty("--c", c + "px");
    map.style.width = c * cols + BORDER + "px";
    map.style.height = c * rows + BORDER + "px";
  }
  new ResizeObserver(fit).observe(frame);

  // A spot can say something different on certain days (dated: [{ dates: ["2026-11-06", ...], about }])
  const aboutToday = (s) => {
    const today = new Date().toLocaleDateString("en-CA");
    const special = (s.dated || []).find((d) => (d.dates || []).includes(today));
    return special ? special.about : s.about;
  };
  // keep: plants not to pull (basil in the wood chips). Their names in about become buttons that show their photos.
  const aboutHtml = (s, text) => (s.keep || []).reduce((html, k, n) => {
    const word = new RegExp(`\\b(${esc(k.name).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})\\b`, "i");
    return html.replace(word, `<button type="button" class="gm-keep" data-keep="${n}" aria-expanded="false">$1</button>`);
  }, esc(text));
  let shown = null; // the spot in the speech box right now
  function show(i) {
    shown = i;
    const s = spots[i];
    map.querySelectorAll(".is-on").forEach((el) => el.classList.remove("is-on"));
    if (!s) {
      name.textContent = "Yvy";
      body.innerHTML = `<p>${esc(cur.hint || M.hint)}</p>`;
      return;
    }
    map.querySelectorAll(`[data-i="${i}"]`).forEach((el) => el.classList.add("is-on"));
    name.textContent = s.name;
    body.innerHTML =
      (s.planted ? `<p class="gm-what">Growing now:</p><ul class="gm-plants">${s.planted.map(plant).join("")}</ul>` : "") +
      (aboutToday(s) ? `<p>${aboutHtml(s, aboutToday(s))}</p>` : "") +
      (s.has ? hasList(s) : "") +
      (s.keep ? '<div class="gm-keep-photo" hidden></div>' : "") +
      (s.lesson && lessonNow ? `<p class="gm-what">Now learning:</p><p>📚 Unit ${esc(lessonNow.unit)} · Lesson ${esc(lessonNow.lesson)}: <b>${esc(lessonNow.title)}</b>
        (${esc(lessonNow.island)} in Gardenbound)</p>` : "") +
      (s.fix ? `<p class="gm-what gm-what-fix">Needs fixing:</p>${checkList(s, s.fix, "gm-fix")}` : "") +
      (s.todo ? `<p class="gm-what">${esc(M.todoTitle || "To-do")}:</p>${checkList(s, s.todo, "gm-todo")}` : "") +
      (s.id && chores(s).length ? `<p class="gm-what">Chores:</p>${choreList(s)}` : "") +
      (s.id ? alsoDone(s) : "") +
      ((s.todo || s.fix || chores(s).length) && s.id && window.YvySociety && window.YvySociety.canReport() ? '<button type="button" class="gm-go gm-report">✅ I did one! Tell Yvy</button>' : "") +
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
  // "See the compost log" opens that Garden Society tab; a plant name (keep) shows or hides its photo
  body.addEventListener("click", (e) => {
    // "Olla" / "In-ground worm bin": show or hide what it is
    const d = e.target.closest("[data-def]");
    if (d) {
      const f = FEATURES[d.dataset.def];
      const box = body.querySelector(".gm-def");
      const open = d.getAttribute("aria-expanded") !== "true";
      body.querySelectorAll("[data-def]").forEach((el) => el.setAttribute("aria-expanded", "false"));
      d.setAttribute("aria-expanded", String(open));
      box.hidden = !open;
      box.innerHTML = open ? `<b>${esc(f.name)}:</b> ${esc(f.about)}` : "";
      return;
    }
    const k = e.target.closest("[data-keep]");
    if (k) {
      const plant = spots[shown].keep[+k.dataset.keep];
      const box = body.querySelector(".gm-keep-photo");
      const open = k.getAttribute("aria-expanded") !== "true";
      body.querySelectorAll("[data-keep]").forEach((el) => el.setAttribute("aria-expanded", "false"));
      k.setAttribute("aria-expanded", String(open));
      box.hidden = !open;
      box.innerHTML = open ? `${plant.note ? `<p class="gm-keep-note">${esc(plant.note)}</p>` : ""}
        <div class="gm-keep-pics">${(plant.photos || []).map((p) => `<figure>
          <img src="${esc(p.src)}" alt="${esc(p.alt || plant.name)}" data-fallback="🌿">
          ${p.caption ? `<figcaption>${esc(p.caption)}</figcaption>` : ""}
          ${p.credit ? `<small class="gm-credit">Photo: ${p.link ? `<a href="${esc(p.link)}" target="_blank" rel="noopener">${esc(p.credit)}</a>` : esc(p.credit)}</small>` : ""}
        </figure>`).join("")}</div>` : "";
      return;
    }
    // "I did one!" opens Submit an entry at this garden and spot (js/society.js)
    if (e.target.closest(".gm-report") && window.YvySociety) {
      window.YvySociety.reportTodo(maps.indexOf(cur), spots[shown].id);
      return;
    }
    const b = e.target.closest("[data-tab-go]");
    const tab = b && document.querySelector(`.society-tabs [data-tab="${b.dataset.tabGo}"]`);
    if (tab) { tab.click(); tab.focus(); }
  });

  // Draw one of the maps (0 = the Central Garden, then gardenMap.otherMaps in order)
  function draw(k) {
    cur = maps[k] || M;
    spots = cur.spots;
    pinned = null;
    box.querySelector(".gm-title").textContent = cur.title;
    box.querySelector(".gm-season").textContent = `🗺️ ${cur.season || ""}`;
    map.setAttribute("aria-label", `Map of ${cur.title}`);
    map.innerHTML = mapHtml();
    syncAlerts();
    box.querySelectorAll("[data-map]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.map === k)));
    fit();
    show(null);
  }
  box.addEventListener("click", (e) => {
    const b = e.target.closest("[data-map]");
    if (b) draw(+b.dataset.map);
  });
  draw(0);

  // Load the live log, then redraw whatever is showing (Submit an entry calls this again after a to-do report)
  const loadLive = () => fetch(`${API}/api/garden`).then((r) => (r.ok ? r.json() : null)).then((data) => {
    if (!data) return;
    live.feeds = {};
    (data.feeds || []).forEach((f) => { (live.feeds[f.bed] = live.feeds[f.bed] || []).push({ date: f.fed_on, id: f.plan_ids }); });
    live.done = new Set((data.done || []).map((d) => `${d.bed}:${d.item}`));
    live.doneOn = new Map((data.done || []).map((d) => [`${d.bed}:${d.item}`, d.done_on]));
    live.pending = new Set((data.pending || []).map((d) => `${d.bed}:${d.item}`));
    live.others = {};
    (data.others || []).forEach((o) => { (live.others[o.bed] = live.others[o.bed] || []).push(o); });
    syncAlerts();
    show(shown);
  }).catch(() => { /* no log yet: the map still works */ });
  window.YvyGarden.reload = loadLive;
  loadLive();
})();
