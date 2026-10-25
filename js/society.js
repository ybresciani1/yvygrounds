/*
 * Garden Society section: journal, project updates, compost log + chart, and the submit form.
 * Talks to the Cloudflare Worker in society-api/ (settings in data.js → society).
 * Everything members send waits for Yvy's approval on society-admin.html.
 */
(function () {
  "use strict";

  const S = window.YVY && window.YVY.society;
  const root = document.getElementById("society");
  if (!S || !root) return;

  const $ = (sel, el = document) => el.querySelector(sel);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
  const LOCAL = ["localhost", "127.0.0.1"].includes(location.hostname);
  const API = LOCAL ? "http://localhost:8787" : S.api;
  const PILE_COLORS = ["#b45309", "#0369a1", "#be185d"]; // checked for color-blind separation
  const C = S.compost;

  const fmtDate = (iso, opts = { month: "short", day: "numeric", year: "numeric" }) =>
    new Date(iso.length === 10 ? iso + "T12:00:00" : iso).toLocaleDateString("en-US", opts);

  async function api(path, options) {
    const res = await fetch(API + path, options);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Something went wrong.");
    return data;
  }

  const napping = '<p class="society-empty">The Garden Society notebook is taking a nap 😴 Please try again in a bit.</p>';

  /* ---------- Post cards ---------- */
  function postCard(p, projects) {
    const project = p.projectId && projects && projects.find((x) => x.id === p.projectId);
    const photos = p.photos.map((src) =>
      `<a href="${esc(API + src)}" target="_blank" rel="noopener"><img src="${esc(API + src)}" alt="Photo from ${esc(p.author)}" loading="lazy"></a>`
    ).join("");
    return `<article class="society-post">
      <header>
        ${p.title ? `<h4>${esc(p.title)}</h4>` : ""}
        <p class="post-meta">by ${esc(p.author)} · ${esc(fmtDate(p.createdAt))}${project ? ` · ${esc(project.emoji)} ${esc(project.name)}` : ""}</p>
      </header>
      ${p.body ? `<p class="post-body">${esc(p.body)}</p>` : ""}
      ${photos ? `<div class="post-photos">${photos}</div>` : ""}
    </article>`;
  }

  /* ---------- Tabs ---------- */
  let projectsCache = null;
  const getProjects = async () => (projectsCache = projectsCache || (await api("/api/projects")).projects);

  // Yvy's dated Garden Society photos (data.js → photos.club with a date) are journal entries too
  const FOCUS_WORDS = { top: "50% 0%", bottom: "50% 100%", left: "0% 50%", right: "100% 50%", center: "50% 50%" };
  const focusStyle = (focus) => {
    const value = FOCUS_WORDS[focus] || String(focus || "").trim();
    return value && /^[a-z0-9.%\s-]+$/i.test(value) ? ` style="object-position:${value}"` : "";
  };
  const clubPhotos = () => (((window.YVY && window.YVY.photos) || {}).club || []).filter((p) => p && p.src && p.date);
  // A photo from data.js as a journal-style card: the photo, its caption, "📸 <label> · date"
  function clubCard(p, label = "Garden Society", fallback = "🌻") {
    return `<article class="society-post club-post">
      <a class="club-photo" href="${esc(p.src)}" target="_blank" rel="noopener"><img src="${esc(p.src)}" alt="${esc(p.caption || `${label} photo`)}" loading="lazy" data-fallback="${fallback}"${focusStyle(p.focus)}></a>
      <header>
        ${p.caption ? `<h4>${esc(p.caption)}</h4>` : ""}
        <p class="post-meta">📸 ${esc(label)}${p.date ? ` · ${esc(fmtDate(p.date))}` : ""}</p>
      </header>
    </article>`;
  }

  // Fetch members' posts of one kind, trying twice (a blip shouldn't hide them). null = didn't load.
  async function feed(kind) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try { return (await api(`/api/feed?kind=${kind}&limit=30`)).posts || []; } catch (e) {
        if (attempt === 0) await new Promise((r) => setTimeout(r, 1500));
      }
    }
    return null;
  }

  // The "book" the Journal and Compost tabs share: cards newest first, 6 a page,
  // flipped with BACK / NEXT. items: [{ date, html }]. missing: a note shown above when
  // members' posts didn't load (with a Try again button that reopens the tab).
  const PER_PAGE = 6;
  function renderBook(box, items, { what, missing, retryTab }) {
    items = items.slice().sort((a, b) => b.date.localeCompare(a.date));
    const pages = Math.ceil(items.length / PER_PAGE);
    let page = 0;
    box.innerHTML = `${missing ? `<p class="journal-missing">${missing} <button type="button" class="journal-retry">Try again</button></p>` : ""}
    <div class="journal-book">
      <div class="journal-stage">
        <button class="arrow arrow-back" type="button" data-step="-1" aria-label="Previous ${what} page"${pages < 2 ? " hidden" : ""}>BACK</button>
        <div class="society-posts journal-page"></div>
        <button class="arrow arrow-next" type="button" data-step="1" aria-label="Next ${what} page"${pages < 2 ? " hidden" : ""}>NEXT</button>
      </div>
      <p class="scrap-count journal-count" aria-live="polite"${pages < 2 ? " hidden" : ""}></p>
    </div>`;
    const show = () => {
      page = (page + pages) % pages;
      $(".journal-page", box).innerHTML = items.slice(page * PER_PAGE, (page + 1) * PER_PAGE).map((x) => x.html).join("");
      $(".journal-count", box).textContent = `Page ${page + 1} / ${pages}`;
    };
    box.querySelectorAll(".journal-stage [data-step]").forEach((b) => b.addEventListener("click", () => {
      page += Number(b.dataset.step);
      show();
    }));
    const retry = $(".journal-retry", box);
    if (retry) retry.addEventListener("click", () => openTab(retryTab));
    show();
  }

  // Members' posts and the dated Garden Society photos, newest first.
  // The photos still show if the notebook API is napping.
  async function showJournal(panel) {
    const posts = await feed("journal");
    const items = [
      ...(posts || []).map((p) => ({ date: String(p.createdAt), html: postCard(p) })),
      ...clubPhotos().map((p) => ({ date: String(p.date), html: clubCard(p) })),
    ];
    if (!items.length) {
      panel.innerHTML = posts ? '<p class="society-empty">No journal entries yet. Be the first! ✏️</p>' : napping;
      return;
    }
    renderBook(panel, items, { what: "journal", retryTab: "journal",
      missing: posts ? "" : "📓 The written journal entries didn't load." });
  }

  async function showProjects(panel) {
    const [projects, { posts }] = await Promise.all([getProjects(), api("/api/feed?kind=project&limit=50")]);
    if (!projects.length) {
      panel.innerHTML = '<p class="society-empty">No projects yet. Yvy will add them soon 🛠️</p>';
      return;
    }
    panel.innerHTML = projects.map((pr) => {
      const updates = posts.filter((p) => p.projectId === pr.id);
      return `<details class="society-project"${updates.length ? " open" : ""}>
        <summary>
          <span class="sp-name">${esc(pr.emoji)} ${esc(pr.name)}</span>
          <span class="sp-status sp-${esc(pr.status)}">${pr.status === "done" ? "✅ done" : "🌱 growing"}</span>
          <span class="sp-count">${updates.length} update${updates.length === 1 ? "" : "s"}</span>
        </summary>
        ${pr.description ? `<p class="sp-desc">${esc(pr.description)}</p>` : ""}
        ${updates.length ? `<div class="society-posts">${updates.map((p) => postCard(p)).join("")}</div>` : '<p class="society-empty">No updates yet.</p>'}
      </details>`;
    }).join("");
  }

  /* ---------- Compost ---------- */
  function compostStatus(t) {
    if (t >= C.tooHot) return { icon: "🔥", label: "Too hot! Turn it now", cls: "danger" };
    if (t >= C.turnAt) return { icon: "♨️", label: "Very hot. Time to turn it", cls: "warn" };
    if (t >= C.hotLow) return { icon: "✅", label: "In the hot zone, cooking weed seeds", cls: "good" };
    if (t >= 100) return { icon: "🌡️", label: "Warm and working", cls: "ok" };
    return { icon: "🧊", label: "Cool. Turn it or add greens", cls: "cool" };
  }

  // Yvy's own compost photos (data.js → society.compost.photos), shown as a scrapbook-style
  // slideshow (same polaroid + BACK/NEXT arrows as the photo scrapbook). They live on the
  // site, so they show even when the notebook API is napping.
  const compostPhotos = () => (C.photos || []).filter((p) => p && p.src);

  // Compost tab: temperature readings + chart (from the API), then Yvy's compost photos and
  // members' compost posts as journal-style cards, 6 a page. Photos show even if the API naps.
  async function showCompost(panel) {
    const [logsRes, posts] = await Promise.all([api("/api/compost").catch(() => null), feed("compost")]);
    const logs = logsRes ? logsRes.logs || [] : null;
    const latestByPile = logs ? [...new Map(logs.map((l) => [l.pile, l])).values()] : [];
    panel.innerHTML = `
      ${logs ? latestByPile.map((latest) => {
        const st = compostStatus(latest.temp_f);
        return `<div class="compost-hero">
          <div><p class="ch-label">Latest reading · ${esc(latest.pile)}</p>
            <p class="ch-value">${esc(latest.temp_f)}°F</p>
            <p class="ch-date">${esc(fmtDate(latest.logged_on))}${latest.turned ? " · turned ↻" : ""}</p></div>
          <p class="ch-status ch-${st.cls}"><span aria-hidden="true">${st.icon}</span> ${esc(st.label)}</p>
        </div>`;
      }).join("") : napping}
      ${logs ? `<figure class="compost-chart" id="compostChart">
        <figcaption>Compost temperature (°F), logged by Yvy</figcaption>
      </figure>` : ""}
      ${logs && logs.length ? `<details class="compost-table"><summary>See every reading as a table</summary>
        <div class="ct-scroll"><table><thead><tr><th>Date</th><th>Pile</th><th>Temp</th><th>Turned</th><th>Notes</th></tr></thead>
        <tbody>${logs.slice().reverse().map((l) => `<tr><td>${esc(fmtDate(l.logged_on))}</td><td>${esc(l.pile)}</td><td>${esc(l.temp_f)}°F</td><td>${l.turned ? "↻ yes" : ""}</td><td>${esc(l.notes)}${l.moisture ? ` <em>(${esc(l.moisture)})</em>` : ""}</td></tr>`).join("")}</tbody></table></div>
      </details>` : ""}
      <p class="compost-guide">🌡️ Guide: above <b>${C.hotLow}°F</b> kills most weed seeds and germs, turn it at <b>${C.turnAt}°F</b>,
        and above <b>${C.tooHot}°F</b> the helpful microbes start dying.
        Source: <a href="${esc(C.source.url)}" target="_blank" rel="noopener">${esc(C.source.label)}</a>.</p>
      <h4 class="compost-photos-title">Compost photos &amp; posts</h4>
      <div class="compost-book"></div>`;
    if (logs) drawCompostChart($("#compostChart", panel), logs);

    const items = [
      ...(posts || []).map((p) => ({ date: String(p.createdAt), html: postCard(p) })),
      ...compostPhotos().map((p) => ({ date: String(p.date || ""), html: clubCard(p, "Compost", "🪱") })),
    ];
    const book = $(".compost-book", panel);
    if (!items.length) {
      book.innerHTML = posts ? '<p class="society-empty">No compost photos yet. Submit one! 🪱</p>' : "";
      return;
    }
    renderBook(book, items, { what: "compost", retryTab: "compost",
      missing: posts ? "" : "🪱 Members' compost posts didn't load." });
  }

  // Line chart: one line per pile, hot-zone band, crosshair tooltip (mouse + keyboard)
  function drawCompostChart(fig, logs) {
    if (!logs.length) {
      fig.insertAdjacentHTML("beforeend", '<p class="society-empty">No temperatures logged yet.</p>');
      return;
    }
    const W = 640, H = 260, L = 44, R = 16, T = 14, B = 30;
    const piles = [...new Set(logs.map((l) => l.pile))].slice(0, PILE_COLORS.length);
    const color = (pile) => PILE_COLORS[piles.indexOf(pile)];
    const day = (d) => Date.parse(d + "T12:00:00");
    const xs = logs.map((l) => day(l.logged_on));
    let x0 = Math.min(...xs), x1 = Math.max(...xs);
    if (x0 === x1) { x0 -= 3 * 864e5; x1 += 3 * 864e5; }
    const temps = logs.map((l) => l.temp_f);
    const y0 = Math.floor(Math.min(60, ...temps) / 20) * 20;
    const y1 = Math.ceil(Math.max(C.tooHot + 10, ...temps) / 20) * 20;
    const X = (t) => L + ((t - x0) / (x1 - x0)) * (W - L - R);
    const Y = (v) => T + (1 - (v - y0) / (y1 - y0)) * (H - T - B);

    let svg = `<svg viewBox="0 0 ${W} ${H}" class="cc-svg" role="img" tabindex="0"
      aria-label="Compost temperature over time. Use the left and right arrow keys to step through readings.">`;
    // grid + y ticks
    for (let v = y0; v <= y1; v += 20) {
      svg += `<line x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}" class="cc-grid"/>` +
        `<text x="${L - 6}" y="${Y(v) + 4}" class="cc-tick" text-anchor="end">${v}°</text>`;
    }
    // hot zone band + too-hot line
    svg += `<rect x="${L}" y="${Y(C.turnAt)}" width="${W - L - R}" height="${Y(C.hotLow) - Y(C.turnAt)}" class="cc-band"/>` +
      `<text x="${L + 6}" y="${Y(C.turnAt) + 13}" class="cc-band-label">hot zone ${C.hotLow}–${C.turnAt}°F</text>` +
      `<line x1="${L}" x2="${W - R}" y1="${Y(C.tooHot)}" y2="${Y(C.tooHot)}" class="cc-limit"/>` +
      `<text x="${W - R - 4}" y="${Y(C.tooHot) - 5}" class="cc-band-label" text-anchor="end">too hot ${C.tooHot}°F</text>`;
    // x ticks: up to 5 dates
    const dates = [...new Set(logs.map((l) => l.logged_on))];
    const step = Math.max(1, Math.ceil(dates.length / 5));
    dates.filter((_, i) => i % step === 0).forEach((d) => {
      svg += `<text x="${X(day(d))}" y="${H - 8}" class="cc-tick" text-anchor="middle">${esc(fmtDate(d, { month: "short", day: "numeric" }))}</text>`;
    });
    // lines + dots
    piles.forEach((pile) => {
      const pts = logs.filter((l) => l.pile === pile);
      const c = color(pile);
      if (pts.length > 1) {
        svg += `<path d="${pts.map((l, i) => `${i ? "L" : "M"}${X(day(l.logged_on)).toFixed(1)} ${Y(l.temp_f).toFixed(1)}`).join("")}" fill="none" stroke="${c}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
      }
      pts.forEach((l) => {
        svg += `<circle cx="${X(day(l.logged_on)).toFixed(1)}" cy="${Y(l.temp_f).toFixed(1)}" r="4.5" fill="${c}" stroke="#fff" stroke-width="2"/>`;
      });
    });
    svg += `<line class="cc-cross" x1="0" x2="0" y1="${T}" y2="${H - B}" visibility="hidden"/>`;
    svg += `<rect x="${L}" y="${T}" width="${W - L - R}" height="${H - T - B}" fill="transparent" class="cc-hit"/></svg>`;

    const legend = piles.length > 1
      ? `<div class="cc-legend">${piles.map((p) => `<span><i style="background:${color(p)}"></i>${esc(p)}</span>`).join("")}</div>`
      : "";
    fig.insertAdjacentHTML("beforeend", `<div class="cc-wrap">${svg}<div class="cc-tip" hidden></div></div>${legend}`);

    // Hover / keyboard readout
    const wrap = $(".cc-wrap", fig);
    const el = $("svg", wrap);
    const tip = $(".cc-tip", wrap);
    const cross = $(".cc-cross", el);
    let idx = dates.length - 1;
    const show = (i) => {
      idx = Math.max(0, Math.min(dates.length - 1, i));
      const d = dates[idx];
      const x = X(day(d));
      cross.setAttribute("x1", x); cross.setAttribute("x2", x); cross.setAttribute("visibility", "visible");
      const rows = logs.filter((l) => l.logged_on === d);
      tip.innerHTML = `<p class="cc-tip-date">${esc(fmtDate(d))}</p>` + rows.map((l) =>
        `<p><i style="background:${color(l.pile) || "#888"}"></i><b>${esc(l.temp_f)}°F</b> ${esc(l.pile)}${l.turned ? " · turned" : ""}</p>` +
        (l.notes ? `<p class="cc-tip-note">${esc(l.notes)}</p>` : "")).join("");
      tip.hidden = false;
      const box = el.getBoundingClientRect();
      const px = (x / W) * box.width;
      tip.style.left = `${Math.min(Math.max(px + 12, 0), box.width - tip.offsetWidth)}px`;
      if (px + 12 + tip.offsetWidth > box.width) tip.style.left = `${Math.max(0, px - tip.offsetWidth - 12)}px`;
    };
    const hide = () => { tip.hidden = true; cross.setAttribute("visibility", "hidden"); };
    el.addEventListener("pointermove", (e) => {
      const box = el.getBoundingClientRect();
      const x = ((e.clientX - box.left) / box.width) * W;
      let best = 0;
      dates.forEach((d, i) => { if (Math.abs(X(day(d)) - x) < Math.abs(X(day(dates[best])) - x)) best = i; });
      show(best);
    });
    el.addEventListener("pointerleave", hide);
    el.addEventListener("focus", () => show(idx));
    el.addEventListener("blur", hide);
    el.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") { show(idx - 1); e.preventDefault(); }
      if (e.key === "ArrowRight") { show(idx + 1); e.preventDefault(); }
    });
  }

  const TABS = { journal: showJournal, projects: showProjects, compost: showCompost };
  const STATIC = { almanac: "#growing", map: "#gardenMap" };
  async function openTab(name) {
    root.querySelectorAll(".society-tabs [data-tab]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.tab === name)));
    // The Almanac (#growing, built by main.js) and the Map (#gardenMap, js/garden-map.js) are already
    // on the page; the others load from the API
    const panel = $("#societyPanel");
    const isStatic = name in STATIC;
    Object.entries(STATIC).forEach(([tab, sel]) => { const el = $(sel); if (el) el.hidden = tab !== name; });
    panel.hidden = isStatic;
    $(".society-cta", root).hidden = isStatic;
    if (isStatic) return;
    // Each load draws into its own fresh box. If another tab is opened before this one finishes,
    // this box is no longer on the page, so a slow load can't overwrite the tab you picked.
    const view = document.createElement("div");
    view.className = "society-view";
    view.innerHTML = '<p class="society-empty">Opening the notebook… 📓</p>';
    panel.replaceChildren(view);
    panel.classList.add("is-loading");
    try { await TABS[name](view); } catch (e) { view.innerHTML = napping; }
    if (view.isConnected) panel.classList.remove("is-loading");
  }

  /* ---------- Submit form ---------- */
  // Shrink photos in the browser before upload. Redrawing them on a canvas also drops hidden
  // location info (EXIF/GPS), which matters for kids' photos.
  async function shrinkPhoto(file) {
    let bitmap;
    try { bitmap = await createImageBitmap(file, { imageOrientation: "from-image" }); } catch (e) {
      throw new Error(`Couldn't read "${file.name}". Please use a JPG or PNG photo.`);
    }
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
  }

  function buildForm() {
    const box = $("#societyForm");
    const form = $("form", box);
    const status = $("#sfStatus");
    const projectRow = $("#sfProjectRow");
    let lastFocus = null;

    const close = () => { box.hidden = true; if (lastFocus) lastFocus.focus(); };

    // Compost temps and feedings: piles from data.js → society.compost.piles, beds from gardenMap (and its otherMaps)
    const today = () => new Date().toLocaleDateString("en-CA");
    const GM = window.YVY.gardenMap || {};
    const beds = [].concat(GM.spots || [], ...(GM.otherMaps || []).map((m) => m.spots || []))
      .filter((sp) => sp.id && sp.feedPlan && sp.feedPlan.length);
    $("#sfPiles").innerHTML = (C.piles || ["Main pile"]).map((p) => `<option>${esc(p)}</option>`).join("");
    $("#sfBeds").innerHTML = '<option value="">Pick a bed…</option>' +
      beds.map((b) => `<option value="${esc(b.id)}">${esc(b.name)}</option>`).join("");
    const showPlan = () => {
      const bed = beds.find((b) => b.id === form.elements.bed.value);
      $("#sfPlan").innerHTML = bed ? bed.feedPlan.map((p) =>
        `<label class="sf-check"><input type="checkbox" name="plan_ids" value="${esc(p.id)}"> ${esc(p.what)}</label>`).join("")
        : '<p class="sf-privacy">Pick a bed first.</p>';
    };
    form.elements.bed.addEventListener("change", showPlan);
    showPlan();

    // Done to-dos: pick a garden (Central or Middle School), then a spot, then check off its to-dos.
    // Ones already crossed off or waiting for Yvy's OK show but can't be checked again.
    const maps = [GM].concat(GM.otherMaps || []);
    let garden = { done: new Set(), pending: new Set() };
    $("#sfTodoMaps").innerHTML = maps.map((m, k) =>
      `<label class="sf-check"><input type="radio" name="todo_map" value="${k}"${k ? "" : " checked"}> ${esc(m.button || m.title)}</label>`).join("");
    const todoSpots = () => ((maps[+form.elements.todo_map.value] || {}).spots || []).filter((sp) => sp.id && sp.todo && sp.todo.length);
    const showTodoList = () => {
      const sp = todoSpots().find((s) => s.id === form.elements.todo_bed.value);
      const key = window.YvyGarden && window.YvyGarden.todoKey;
      $("#sfTodoList").innerHTML = sp && key ? sp.todo.map((t) => {
        const id = key(t), tag = `${sp.id}:${id}`;
        if (garden.done.has(tag)) return `<label class="sf-check sf-todo-done"><input type="checkbox" checked disabled> <span>${esc(t)} <em>(done ✓)</em></span></label>`;
        if (garden.pending.has(tag)) return `<label class="sf-check sf-todo-pending"><input type="checkbox" disabled> <span>${esc(t)} <em>(? waiting for Yvy)</em></span></label>`;
        return `<label class="sf-check"><input type="checkbox" name="items" value="${esc(id)}"> <span>${esc(t)}</span></label>`;
      }).join("") : '<p class="sf-privacy">Pick a spot first.</p>';
    };
    const showTodoSpots = () => {
      // Spots that share a name (the three Fig Trees) get numbered in map order, like their abouts
      const all = ((maps[+form.elements.todo_map.value] || {}).spots || []).filter((sp) => sp.name);
      const label = (sp) => {
        const same = all.filter((x) => x.name === sp.name);
        return same.length > 1 ? `${sp.name} #${same.indexOf(sp) + 1}` : sp.name;
      };
      $("#sfTodoSpots").innerHTML = '<option value="">Pick a spot…</option>' +
        todoSpots().map((sp) => `<option value="${esc(sp.id)}">${esc(label(sp))}</option>`).join("");
      showTodoList();
    };
    form.addEventListener("change", (e) => {
      if (e.target.name === "todo_map") showTodoSpots();
      if (e.target.name === "todo_bed") showTodoList();
    });
    showTodoSpots();

    // Temps, feedings and to-dos need the garden log in the API; keep those choices hidden until it answers
    // (to-dos also need the newer API that sends "pending")
    const logKinds = [...form.querySelectorAll("[name=kind][value=temp], [name=kind][value=feed]")].map((r) => r.closest("label"));
    const todoKind = form.querySelector("[name=kind][value=todo]").closest("label");
    logKinds.concat(todoKind).forEach((l) => { l.hidden = true; });
    let canReport = false;
    const loadGarden = () => api("/api/garden").then((g) => {
      logKinds.forEach((l) => { l.hidden = false; });
      canReport = Array.isArray(g.pending);
      todoKind.hidden = !canReport;
      garden = {
        done: new Set((g.done || []).map((d) => `${d.bed}:${d.item}`)),
        pending: new Set((g.pending || []).map((d) => `${d.bed}:${d.item}`)),
      };
      showTodoList();
    }).catch(() => { /* not deployed yet */ });
    loadGarden();

    const syncKind = async () => {
      const kind = form.elements.kind.value;
      const isLog = ["temp", "feed", "todo"].includes(kind);
      projectRow.hidden = kind !== "project";
      $("#sfTempRow").hidden = kind !== "temp";
      $("#sfFeedRow").hidden = kind !== "feed";
      $("#sfTodoRow").hidden = kind !== "todo";
      if (kind === "todo" && !form.elements.done_on.value) form.elements.done_on.value = today();
      $("#sfTitleRow").hidden = $("#sfPhotoRow").hidden = isLog;
      if (kind === "temp" && !form.elements.logged_on.value) form.elements.logged_on.value = today();
      if (kind === "feed" && !form.elements.fed_on.value) form.elements.fed_on.value = today();
      if (kind === "project") {
        const sel = form.elements.project_id;
        try {
          const projects = await getProjects();
          sel.innerHTML = '<option value="">Pick a project…</option>' +
            projects.filter((p) => p.status !== "archived").map((p) => `<option value="${esc(p.id)}">${esc(p.emoji)} ${esc(p.name)}</option>`).join("");
        } catch (e) { sel.innerHTML = '<option value="">Projects didn\'t load</option>'; }
      }
    };

    const open = () => {
      lastFocus = document.activeElement;
      status.textContent = "";
      status.className = "sf-status";
      box.hidden = false;
      syncKind();
      $("#sfClose").focus();
    };
    $("#societySubmitBtn").addEventListener("click", open);
    // The garden map's "I did one!" button opens the form at that garden and spot (js/garden-map.js)
    window.YvySociety = {
      canReport: () => canReport,
      reportTodo(mapIndex, spotId) {
        form.querySelector("[name=kind][value=todo]").checked = true;
        const radio = form.querySelector(`[name=todo_map][value="${mapIndex}"]`);
        if (radio) radio.checked = true;
        showTodoSpots();
        form.elements.todo_bed.value = spotId;
        showTodoList();
        open();
      },
    };
    $("#sfClose").addEventListener("click", close);
    box.addEventListener("click", (e) => { if (e.target === box) close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !box.hidden) close(); });
    form.addEventListener("change", (e) => { if (e.target.name === "kind") syncKind(); });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = $("button[type=submit]", form);
      const kind = form.elements.kind.value;
      const isLog = ["temp", "feed", "todo"].includes(kind);
      const files = isLog ? [] : [...form.elements.photos.files];
      if (files.length > 3) { status.textContent = "Up to 3 photos, please."; status.className = "sf-status is-error"; return; }
      btn.disabled = true;
      status.className = "sf-status";
      status.textContent = files.length ? "Shrinking photos…" : "Sending…";
      try {
        const fd = new FormData();
        ["kind", "project_id", "author", "title", "body", "passcode"].forEach((k) => fd.append(k, form.elements[k].value));
        if (kind === "temp") {
          ["logged_on", "pile", "temp_f"].forEach((k) => fd.append(k, form.elements[k].value));
          if (form.elements.turned.checked) fd.append("turned", "1");
        }
        if (kind === "feed") {
          ["fed_on", "bed"].forEach((k) => fd.append(k, form.elements[k].value));
          form.querySelectorAll("[name=plan_ids]:checked").forEach((c) => fd.append("plan_ids", c.value));
        }
        if (kind === "todo") {
          fd.append("done_on", form.elements.done_on.value);
          fd.append("bed", form.elements.todo_bed.value);
          form.querySelectorAll("[name=items]:checked").forEach((c) => fd.append("items", c.value));
        }
        for (const f of files) fd.append("photos", await shrinkPhoto(f), f.name.replace(/\.\w+$/, "") + ".jpg");
        status.textContent = "Sending…";
        const res = await api("/api/submit", { method: "POST", body: fd });
        status.textContent = res.message;
        status.className = "sf-status is-ok";
        ["title", "body", "temp_f"].forEach((k) => { form.elements[k].value = ""; });
        form.elements.photos.value = "";
        form.elements.turned.checked = false;
        form.querySelectorAll("[name=plan_ids]:checked").forEach((c) => { c.checked = false; });
        if (kind === "todo") {
          loadGarden(); // the ones just sent now show "waiting for Yvy"
          if (window.YvyGarden && window.YvyGarden.reload) window.YvyGarden.reload(); // and get a ? on the map
        }
      } catch (err) {
        status.textContent = err.message;
        status.className = "sf-status is-error";
      }
      btn.disabled = false;
    });
  }

  /* ---------- Go ---------- */
  $("#societyIntro").textContent = S.intro;
  root.querySelector(".society-tabs").addEventListener("click", (e) => {
    const b = e.target.closest("[data-tab]");
    if (!b) return;
    // A tab picked by hand wins: cancel the automatic "open the Journal" on page load
    started = true;
    io.disconnect();
    openTab(b.dataset.tab);
  });
  buildForm();
  // Links to #growing / #almanac (e.g. the "Garden Almanac" link up top) open the Almanac tab,
  // and #map / #garden-map open the Map
  const LINKED = { "#growing": "almanac", "#almanac": "almanac", "#map": "map", "#garden-map": "map" };
  const showTabFromLink = () => {
    const tab = LINKED[location.hash];
    if (!tab) return false;
    started = true;
    openTab(tab);
    root.scrollIntoView({ behavior: "smooth" });
    return true;
  };
  window.addEventListener("hashchange", showTabFromLink);

  // Load the journal when the section scrolls into view, or a few seconds after the page loads
  let started = false;
  const start = () => { if (!started) { started = true; io.disconnect(); openTab("journal"); } };
  const io = new IntersectionObserver((entries) => { if (entries.some((x) => x.isIntersecting)) start(); }, { rootMargin: "300px" });
  io.observe(root);
  if (!showTabFromLink()) setTimeout(start, location.hash === "#society" ? 0 : 4000);
})();
