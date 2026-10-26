/*
 * YvyGrounds admin (society-admin.html): review Garden Society submissions, manage projects,
 * log compost temps, cross off garden to-dos and log feedings, and approve guestbook signatures.
 * The admin password is kept only for this browser tab (sessionStorage) and sent to the API.
 */
(function () {
  "use strict";

  const S = window.YVY.society;
  const API = ["localhost", "127.0.0.1"].includes(location.hostname) ? "http://localhost:8787" : S.api;
  const $ = (sel, el = document) => el.querySelector(sel);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
  const KEY = "yvy-society-admin";
  let password = "";
  try { password = sessionStorage.getItem(KEY) || ""; } catch (e) { /* private mode */ }
  let projects = [];
  let reviewStatus = "pending";
  let gbStatus = "pending";
  const blobUrls = [];

  const fmt = (iso) => new Date(iso.length === 10 ? iso + "T12:00:00" : iso)
    .toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  async function api(path, options = {}) {
    const res = await fetch(API + path, {
      ...options,
      headers: { Authorization: `Bearer ${password}`, ...(options.body ? { "Content-Type": "application/json" } : {}) },
    });
    const data = res.headers.get("content-type")?.includes("json") ? await res.json() : {};
    if (res.status === 401) signOut("Signed out. Please sign in again.");
    if (!res.ok) throw new Error(data.error || "Something went wrong.");
    return data;
  }

  /* ---------- Sign in ---------- */
  function signOut(message) {
    password = "";
    try { sessionStorage.removeItem(KEY); } catch (e) { /* ignore */ }
    $("#admApp").hidden = true;
    $("#admLogin").hidden = false;
    $("#admLoginStatus").textContent = message || "";
  }
  async function signIn(pw) {
    password = pw;
    await api("/api/admin/check");
    try { sessionStorage.setItem(KEY, pw); } catch (e) { /* ignore */ }
    $("#admLogin").hidden = true;
    $("#admApp").hidden = false;
    projects = (await api("/api/admin/projects")).projects;
    showView("review");
    countGuestbook();
    countGarden();
  }
  $("#admLogin").addEventListener("submit", async (e) => {
    e.preventDefault();
    const status = $("#admLoginStatus");
    status.textContent = "Checking…";
    try { await signIn(e.target.elements.password.value); e.target.reset(); status.textContent = ""; } catch (err) {
      password = "";
      status.textContent = err.message;
      status.className = "sf-status is-error";
    }
  });
  $("#admSignOut").addEventListener("click", () => signOut("Signed out."));

  /* ---------- Views ---------- */
  function showView(name) {
    document.querySelectorAll(".adm-tabs [data-view]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.view === name)));
    document.querySelectorAll(".adm-view").forEach((v) => { v.hidden = v.dataset.view !== name; });
    ({ review: loadPosts, projects: loadProjects, compost: loadReadings, garden: loadGarden, guestbook: loadGuestbook, hall: loadHall, scores: loadScores })[name]();
  }
  $(".adm-tabs").addEventListener("click", (e) => {
    const b = e.target.closest("[data-view]");
    if (b) showView(b.dataset.view);
  });

  /* ---------- Review ---------- */
  const KIND_LABEL = { journal: "📓 Journal", project: "🛠️ Project", compost: "🪱 Compost" };

  async function loadPosts() {
    const box = $("#admPosts");
    box.innerHTML = '<p class="society-empty">Loading…</p>';
    try {
      const [{ posts }, pending] = await Promise.all([
        api(`/api/admin/posts?status=${reviewStatus}`),
        reviewStatus === "pending" ? null : api("/api/admin/posts?status=pending"),
      ]);
      const waiting = reviewStatus === "pending" ? posts.length : pending.posts.length;
      $("#admPendingCount").textContent = waiting ? `(${waiting})` : "";
      blobUrls.splice(0).forEach((u) => URL.revokeObjectURL(u));
      box.innerHTML = posts.length ? posts.map(postEditor).join("") :
        `<p class="society-empty">${reviewStatus === "pending" ? "Nothing waiting. All caught up! 🎉" : "Nothing here."}</p>`;
      // Photos of unapproved posts aren't public, so fetch them with the admin password
      box.querySelectorAll("img[data-key]").forEach(async (img) => {
        try {
          const res = await fetch(`${API}/api/admin/photo/${img.dataset.key}`, { headers: { Authorization: `Bearer ${password}` } });
          if (!res.ok) throw new Error();
          const url = URL.createObjectURL(await res.blob());
          blobUrls.push(url);
          img.src = url;
          img.closest("a").href = url;
        } catch (e) { img.alt = "Photo didn't load"; }
      });
    } catch (err) { box.innerHTML = `<p class="sf-status is-error">${esc(err.message)}</p>`; }
  }

  function postEditor(p) {
    const projectOptions = projects.map((pr) =>
      `<option value="${esc(pr.id)}"${pr.id === p.projectId ? " selected" : ""}>${esc(pr.emoji)} ${esc(pr.name)}</option>`).join("");
    return `<article class="adm-card adm-post" data-id="${esc(p.id)}">
      <p class="post-meta">${KIND_LABEL[p.kind] || esc(p.kind)} · sent ${esc(fmt(p.createdAt))}</p>
      <div class="adm-fields">
        <label class="sf-row">From <input name="author" value="${esc(p.author)}" maxlength="40"></label>
        <label class="sf-row">Type
          <select name="kind">${Object.entries(KIND_LABEL).map(([k, v]) => `<option value="${k}"${k === p.kind ? " selected" : ""}>${v}</option>`).join("")}</select>
        </label>
        <label class="sf-row">Project
          <select name="project_id"><option value="">(none)</option>${projectOptions}</select>
        </label>
        <label class="sf-row adm-wide">Title <input name="title" value="${esc(p.title)}" maxlength="120"></label>
        <label class="sf-row adm-wide">Notes <textarea name="body" rows="3" maxlength="4000">${esc(p.body)}</textarea></label>
      </div>
      ${p.photoKeys.length ? `<div class="post-photos adm-photos">${p.photoKeys.map((k) =>
        `<a target="_blank" rel="noopener"><img data-key="${esc(k)}" alt="Submitted photo"></a>`).join("")}</div>
        <p class="adm-hint">🛡️ Check photos for kids' faces before approving.</p>` : ""}
      <div class="adm-actions">
        ${p.status !== "approved" ? '<button type="button" data-act="approved" class="adm-ok">✅ Approve</button>' : '<button type="button" data-act="save">💾 Save edits</button>'}
        ${p.status !== "rejected" ? '<button type="button" data-act="rejected" class="adm-no">🙅 Reject</button>' : '<button type="button" data-act="pending">↩️ Back to waiting</button>'}
        <button type="button" data-act="delete" class="adm-del">🗑️ Delete forever</button>
      </div>
    </article>`;
  }

  $("#admPosts").addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-act]");
    if (!btn) return;
    const card = btn.closest(".adm-post");
    const id = card.dataset.id;
    const act = btn.dataset.act;
    if (act === "delete" && !confirm("Delete this post and its photos forever? This can't be undone.")) return;
    btn.disabled = true;
    try {
      if (act === "delete") {
        await api(`/api/admin/posts/${id}`, { method: "DELETE" });
      } else {
        const f = (n) => card.querySelector(`[name=${n}]`).value;
        const body = { title: f("title"), body: f("body"), author: f("author"), kind: f("kind"), project_id: f("project_id") };
        if (act !== "save") body.status = act;
        await api(`/api/admin/posts/${id}`, { method: "PATCH", body: JSON.stringify(body) });
      }
      loadPosts();
    } catch (err) { alert(err.message); btn.disabled = false; }
  });
  document.querySelector("[data-view=review] .adm-filter").addEventListener("click", (e) => {
    const b = e.target.closest("[data-status]");
    if (!b) return;
    reviewStatus = b.dataset.status;
    e.currentTarget.querySelectorAll("[data-status]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    loadPosts();
  });

  /* ---------- Projects ---------- */
  async function loadProjects() {
    const box = $("#admProjects");
    try {
      projects = (await api("/api/admin/projects")).projects;
      box.innerHTML = projects.length ? projects.map((p) => `<div class="adm-card adm-inline adm-project" data-id="${esc(p.id)}">
          <label class="sf-row adm-emoji">Emoji <input name="emoji" value="${esc(p.emoji)}" maxlength="8"></label>
          <label class="sf-row">Name <input name="name" value="${esc(p.name)}" maxlength="80"></label>
          <label class="sf-row">Status
            <select name="status">${["active", "done", "archived"].map((s) => `<option${s === p.status ? " selected" : ""}>${s}</option>`).join("")}</select>
          </label>
          <label class="sf-row adm-wide">Description <input name="description" value="${esc(p.description)}" maxlength="400"></label>
          <button type="button" data-act="save-project">💾 Save</button>
        </div>`).join("") : '<p class="society-empty">No projects yet. Add your first one above.</p>';
    } catch (err) { box.innerHTML = `<p class="sf-status is-error">${esc(err.message)}</p>`; }
  }
  $("#admNewProject").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target.elements;
    try {
      await api("/api/admin/projects", { method: "POST", body: JSON.stringify({ name: f.name.value, emoji: f.emoji.value, description: f.description.value }) });
      e.target.reset();
      loadProjects();
    } catch (err) { alert(err.message); }
  });
  $("#admProjects").addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-act=save-project]");
    if (!btn) return;
    const card = btn.closest(".adm-project");
    const f = (n) => card.querySelector(`[name=${n}]`).value;
    try {
      await api(`/api/admin/projects/${card.dataset.id}`, { method: "PATCH", body: JSON.stringify({ name: f("name"), emoji: f("emoji"), status: f("status"), description: f("description") }) });
      btn.textContent = "✅ Saved";
      setTimeout(() => { btn.textContent = "💾 Save"; }, 1500);
    } catch (err) { alert(err.message); }
  });

  /* ---------- Compost log ---------- */
  async function loadReadings() {
    const form = $("#admNewReading");
    if (!form.elements.logged_on.value) form.elements.logged_on.value = new Date().toLocaleDateString("en-CA");
    const box = $("#admReadings");
    try {
      const res = await fetch(`${API}/api/compost`);
      const { logs } = await res.json();
      $("#admPiles").innerHTML = [...new Set((S.compost.piles || []).concat(logs.map((l) => l.pile)))].map((p) => `<option value="${esc(p)}">`).join("");
      box.innerHTML = logs.length ? `<div class="ct-scroll adm-card"><table class="adm-table"><thead><tr><th>Date</th><th>Pile</th><th>Temp</th><th>Turned</th><th>Moisture</th><th>Notes</th><th></th></tr></thead><tbody>
        ${logs.slice().reverse().map((l) => `<tr><td>${esc(fmt(l.logged_on))}</td><td>${esc(l.pile)}</td><td>${esc(l.temp_f)}°F</td><td>${l.turned ? "↻" : ""}</td><td>${esc(l.moisture)}</td><td>${esc(l.notes)}</td>
          <td><button type="button" class="adm-del adm-small" data-del="${esc(l.id)}" aria-label="Delete this reading">🗑️</button></td></tr>`).join("")}
        </tbody></table></div>` : '<p class="society-empty">No readings yet.</p>';
    } catch (err) { box.innerHTML = `<p class="sf-status is-error">${esc(err.message)}</p>`; }
  }
  $("#admNewReading").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target.elements;
    const status = $("#admReadingStatus");
    try {
      await api("/api/admin/compost", { method: "POST", body: JSON.stringify({
        logged_on: f.logged_on.value, pile: f.pile.value, temp_f: f.temp_f.value,
        turned: f.turned.checked, moisture: f.moisture.value, notes: f.notes.value,
      }) });
      status.textContent = `Logged ${f.temp_f.value}°F ✅`;
      status.className = "sf-status adm-wide is-ok";
      f.temp_f.value = ""; f.notes.value = ""; f.turned.checked = false; f.moisture.value = "";
      loadReadings();
    } catch (err) { status.textContent = err.message; status.className = "sf-status adm-wide is-error"; }
  });
  $("#admReadings").addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-del]");
    if (!btn || !confirm("Delete this reading?")) return;
    try { await api(`/api/admin/compost/${btn.dataset.del}`, { method: "DELETE" }); loadReadings(); } catch (err) { alert(err.message); }
  });

  /* ---------- Garden: cross off to-dos, log feedings, review temps/feedings/done to-dos from members ---------- */
  // Spots come from data.js → gardenMap (and its otherMaps); to-do ids and next-feeding dates use js/garden-map.js (window.YvyGarden)
  const G = window.YvyGarden;
  const GM = window.YVY.gardenMap || {};
  const gardenSpots = [].concat(GM.spots || [], ...(GM.otherMaps || []).map((m) => m.spots || []))
    .filter((sp) => sp.id && (sp.todo || sp.fix || sp.feedPlan || G.chores(sp).length));
  const feedBeds = gardenSpots.filter((sp) => sp.feedPlan && sp.feedPlan.length);
  const spotById = (id) => gardenSpots.find((sp) => sp.id === id);
  const planName = (spot, id) => ((spot && spot.feedPlan || []).find((p) => p.id === id) || { what: id }).what;
  const planNames = (bed, ids) => ids.map((id) => planName(spotById(bed), id)).join(", ");
  // A to-do id is a hash of its text; a reworded to-do no longer matches, so say so instead of guessing
  const todoText = (bed, item) => {
    const sp = spotById(bed) || {};
    return [].concat(sp.fix || [], sp.todo || [], sp.id ? G.chores(sp).map((c) => c.text) : [])
      .find((t) => G.todoKey(t) === item) || "(a to-do that has since changed)";
  };

  $("#admFeedBed").innerHTML = '<option value="">Pick a bed…</option>' +
    feedBeds.map((b) => `<option value="${esc(b.id)}">${esc(b.name)}</option>`).join("");
  const showFeedPlan = () => {
    const bed = spotById($("#admFeedBed").value);
    $("#admFeedPlan").innerHTML = bed ? bed.feedPlan.map((p) =>
      `<label class="sf-check"><input type="checkbox" name="plan_ids" value="${esc(p.id)}"> ${esc(p.what)}</label>`).join("")
      : '<p class="sf-privacy">Pick a bed first.</p>';
  };
  $("#admFeedBed").addEventListener("change", showFeedPlan);
  showFeedPlan();

  // The Garden tab needs the garden log in the API; it stays hidden until the API has it
  const gardenTab = $('.adm-tabs [data-view="garden"]');
  gardenTab.hidden = true;
  async function countGarden() {
    try {
      const { temps, feeds, todos = [] } = await api("/api/admin/garden-pending");
      const n = temps.length + feeds.length + todos.length;
      $("#admGardenCount").textContent = n ? `(${n})` : "";
      gardenTab.hidden = false;
      return { temps, feeds, todos };
    } catch (e) { return { temps: [], feeds: [], todos: [] }; }
  }

  async function loadGarden() {
    const form = $("#admNewFeed");
    if (!form.elements.fed_on.value) form.elements.fed_on.value = new Date().toLocaleDateString("en-CA");
    const box = $("#admBeds");
    box.innerHTML = '<p class="society-empty">Loading…</p>';
    try {
      const [garden, pending] = await Promise.all([fetch(`${API}/api/garden`).then((r) => r.json()), countGarden()]);
      renderPending(pending);
      const done = new Set(garden.done.map((d) => `${d.bed}:${d.item}`));
      const doneOn = new Map(garden.done.map((d) => [`${d.bed}:${d.item}`, d.done_on]));
      const waiting = new Set((garden.pending || []).map((d) => `${d.bed}:${d.item}`));
      const feeds = {};
      garden.feeds.forEach((f) => { (feeds[f.bed] = feeds[f.bed] || []).push(f); });
      const today = G.midnight(new Date());
      box.innerHTML = gardenSpots.map((sp) => {
        // A repair or to-do: tick it to cross it off (the map's "!" goes away when all repairs are done)
        // A chore (feed the worms...) counts as done for a few days, then comes back unchecked; ticking it logs today
        const checkItem = (t, chore) => {
          const key = G.todoKey(t);
          const last = doneOn.get(`${sp.id}:${key}`);
          const isDone = chore ? G.choreDone(last, chore.every) : done.has(`${sp.id}:${key}`);
          if (chore && last) t += ` (last done ${fmt(last)})`;
          return `<li><label class="sf-check"><input type="checkbox" data-bed="${esc(sp.id)}" data-item="${esc(key)}"${isDone ? " checked" : ""}> <span>${esc(t)}${!isDone && waiting.has(`${sp.id}:${key}`) ? ' <em class="adm-waiting">❓ a member says it\'s done (see Waiting for you)</em>' : ""}</span></label></li>`;
        };
        const log = (feeds[sp.id] || []).slice().reverse();
        const fed = (sp.fed || []).concat(log.map((f) => ({ date: f.fed_on, id: f.plan_ids })));
        const next = sp.feedPlan && G.nextFeeding(sp, today, fed);
        const nextText = !sp.feedPlan ? "" : next
          ? `${+next.date === +today ? "Today" : fmt(next.date.toLocaleDateString("en-CA"))}: ${next.what.join(", plus ")}`
          : "None needed";
        return `<article class="adm-card adm-bed">
          <h2>${esc(sp.name)}</h2>
          ${sp.fix ? `<p class="adm-bed-fix">⚠️ Needs fixing:</p><ul class="adm-todo">${sp.fix.map((t) => checkItem(t)).join("")}</ul>` : ""}
          ${sp.todo ? `${sp.fix ? '<p class="adm-bed-todo">To-do:</p>' : ""}<ul class="adm-todo">${sp.todo.map((t) => checkItem(t)).join("")}</ul>` : ""}
          ${G.chores(sp).length ? `<p class="adm-bed-todo">Chores:</p><ul class="adm-todo">${G.chores(sp).map((c) => checkItem(c.text, c)).join("")}</ul>` : ""}
          ${sp.feedPlan ? `<p class="adm-bed-next"><b>Last fed:</b> ${log.length ? `${esc(fmt(log[0].fed_on))}: ${esc(planNames(sp.id, log[0].plan_ids))}` : "Not yet"}<br>
            <b>Next feeding:</b> ${esc(nextText)}</p>` : ""}
          ${log.length ? `<table class="adm-table adm-feeds"><tbody>${log.map((f) => `<tr><td>${esc(fmt(f.fed_on))}</td><td>${esc(planNames(sp.id, f.plan_ids))}${f.notes ? ` <em>(${esc(f.notes)})</em>` : ""}</td>
            <td><button type="button" class="adm-del adm-small" data-del-feed="${esc(f.id)}" aria-label="Delete this feeding">🗑️</button></td></tr>`).join("")}</tbody></table>` : ""}
        </article>`;
      }).join("");
    } catch (err) { box.innerHTML = `<p class="sf-status is-error">${esc(err.message)}</p>`; }
  }

  // Temps, feedings and done to-dos members sent through "Submit an entry"
  function renderPending({ temps, feeds, todos = [] }) {
    const box = $("#admGardenPending");
    if (!temps.length && !feeds.length && !todos.length) { box.innerHTML = ""; return; }
    const row = (type, id, text) => `<li><span>${text}</span>
      <span class="adm-review-btns"><button type="button" class="adm-small" data-review="${type}" data-id="${esc(id)}" data-status="approved">✅ Approve</button>
      <button type="button" class="adm-small adm-del" data-review="${type}" data-id="${esc(id)}" data-status="rejected">✖ Reject</button></span></li>`;
    box.innerHTML = `<div class="adm-card"><h2>Waiting for you</h2><ul class="adm-pending">
      ${temps.map((t) => row("compost", t.id, `🌡️ <b>${esc(t.temp_f)}°F</b> in the ${esc(t.pile)} on ${esc(fmt(t.logged_on))}${t.turned ? " (turned ↻)" : ""}, from ${esc(t.author)}${t.notes ? `: <em>${esc(t.notes)}</em>` : ""}`)).join("")}
      ${feeds.map((f) => row("feed", f.id, `🌱 <b>${esc((spotById(f.bed) || { name: f.bed }).name)}</b>: ${esc(planNames(f.bed, f.plan_ids))} on ${esc(fmt(f.fed_on))}, from ${esc(f.author)}${f.notes ? `: <em>${esc(f.notes)}</em>` : ""}`)).join("")}
      ${todos.map((t) => row("todo-report", t.id, `✅ <b>${esc((spotById(t.bed) || { name: t.bed }).name)}</b>: did ${t.items.map((i) => `“${esc(todoText(t.bed, i))}”`)
        .concat(t.other ? [`<b>Other:</b> “${esc(t.other)}”`] : []).join(", ")} on ${esc(fmt(t.done_on))}, from ${esc(t.author)}${t.notes ? `: <em>${esc(t.notes)}</em>` : ""}`)).join("")}
    </ul></div>`;
  }

  $("#admNewFeed").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target.elements;
    const status = $("#admFeedStatus");
    const planIds = [...e.target.querySelectorAll("[name=plan_ids]:checked")].map((c) => c.value);
    try {
      await api("/api/admin/feed", { method: "POST", body: JSON.stringify({ bed: f.bed.value, plan_ids: planIds, fed_on: f.fed_on.value, notes: f.notes.value }) });
      status.textContent = "Logged ✅";
      status.className = "sf-status adm-wide is-ok";
      f.notes.value = "";
      e.target.querySelectorAll("[name=plan_ids]:checked").forEach((c) => { c.checked = false; });
      loadGarden();
    } catch (err) { status.textContent = err.message; status.className = "sf-status adm-wide is-error"; }
  });

  $("#admBeds").addEventListener("change", async (e) => {
    const cb = e.target.closest("input[data-item]");
    if (!cb) return;
    cb.disabled = true;
    try {
      await api("/api/admin/todo", { method: "POST", body: JSON.stringify({ bed: cb.dataset.bed, item: cb.dataset.item, done: cb.checked }) });
    } catch (err) { cb.checked = !cb.checked; alert(err.message); }
    cb.disabled = false;
  });
  $("#admBeds").addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-del-feed]");
    if (!btn || !confirm("Delete this feeding from the log?")) return;
    try { await api(`/api/admin/feed/${btn.dataset.delFeed}`, { method: "DELETE" }); loadGarden(); } catch (err) { alert(err.message); }
  });
  $("#admGardenPending").addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-review]");
    if (!btn) return;
    btn.disabled = true;
    try {
      await api(`/api/admin/${btn.dataset.review}/${btn.dataset.id}`, { method: "PATCH", body: JSON.stringify({ status: btn.dataset.status }) });
      loadGarden();
    } catch (err) { btn.disabled = false; alert(err.message); }
  });

  /* ---------- Guestbook ---------- */
  const GB = window.YVY.guestbook || {};
  const AVATARS = GB.avatars || ["chicken"];

  async function countGuestbook() {
    try {
      const { entries } = await api("/api/admin/guestbook?status=pending");
      $("#admGbCount").textContent = entries.length ? `(${entries.length})` : "";
    } catch (e) { /* the badge just stays empty */ }
  }

  async function loadGuestbook() {
    const box = $("#admGuestbook");
    box.innerHTML = '<p class="society-empty">Loading…</p>';
    try {
      const { entries } = await api(`/api/admin/guestbook?status=${gbStatus}`);
      if (gbStatus === "pending") $("#admGbCount").textContent = entries.length ? `(${entries.length})` : "";
      else countGuestbook();
      box.innerHTML = entries.length ? entries.map(gbEditor).join("") :
        `<p class="society-empty">${gbStatus === "pending" ? "No new signatures. All caught up! 🎉" : "Nothing here."}</p>`;
    } catch (err) { box.innerHTML = `<p class="sf-status is-error">${esc(err.message)}</p>`; }
  }

  function gbEditor(g) {
    const roles = [...new Set([...(GB.roles || []), g.role].filter(Boolean))];
    return `<article class="adm-card adm-post" data-id="${esc(g.id)}">
      <p class="post-meta">📖 Guestbook · signed ${esc(fmt(g.createdAt))}</p>
      <div class="adm-fields">
        <label class="sf-row">Name <input name="name" value="${esc(g.name)}" maxlength="40"></label>
        <label class="sf-row">Who
          <select name="role"><option value="">(none)</option>${roles.map((r) => `<option${r === g.role ? " selected" : ""}>${esc(r)}</option>`).join("")}</select>
        </label>
        <label class="sf-row">Buddy
          <select name="avatar">${AVATARS.map((a) => `<option${a === g.avatar ? " selected" : ""}>${esc(a)}</option>`).join("")}</select>
        </label>
        <label class="sf-row adm-wide">Message <textarea name="message" rows="3" maxlength="600">${esc(g.message)}</textarea></label>
      </div>
      <div class="adm-actions">
        ${g.status !== "approved" ? '<button type="button" data-act="approved" class="adm-ok">✅ Approve</button>' : '<button type="button" data-act="save">💾 Save edits</button>'}
        ${g.status !== "rejected" ? '<button type="button" data-act="rejected" class="adm-no">🙅 Reject</button>' : '<button type="button" data-act="pending">↩️ Back to waiting</button>'}
        <button type="button" data-act="delete" class="adm-del">🗑️ Delete forever</button>
      </div>
    </article>`;
  }

  $("#admGuestbook").addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-act]");
    if (!btn) return;
    const card = btn.closest(".adm-post");
    const act = btn.dataset.act;
    if (act === "delete" && !confirm("Delete this guestbook entry forever? This can't be undone.")) return;
    btn.disabled = true;
    try {
      if (act === "delete") {
        await api(`/api/admin/guestbook/${card.dataset.id}`, { method: "DELETE" });
      } else {
        const f = (n) => card.querySelector(`[name=${n}]`).value;
        const body = { name: f("name"), role: f("role"), avatar: f("avatar"), message: f("message") };
        if (act !== "save") body.status = act;
        await api(`/api/admin/guestbook/${card.dataset.id}`, { method: "PATCH", body: JSON.stringify(body) });
      }
      loadGuestbook();
    } catch (err) { alert(err.message); btn.disabled = false; }
  });
  $("#admGbFilter").addEventListener("click", (e) => {
    const b = e.target.closest("[data-status]");
    if (!b) return;
    gbStatus = b.dataset.status;
    e.currentTarget.querySelectorAll("[data-status]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    loadGuestbook();
  });

  /* ---------- Rabbit & Frog hall of fame ---------- */
  const GRADE_LABEL = { TK: "TK", K: "K", 1: "1st", 2: "2nd", 3: "3rd", 4: "4th", 5: "5th", 6: "6th", 7: "7th", 8: "8th" };

  // Shrink photos before upload; redrawing on a canvas also drops hidden location info (EXIF/GPS)
  async function shrinkPhoto(file) {
    let bitmap;
    try { bitmap = await createImageBitmap(file, { imageOrientation: "from-image" }); } catch (e) {
      throw new Error(`Couldn't read "${file.name}". Please use a JPG or PNG photo.`);
    }
    const scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
  }

  async function loadHall() {
    const box = $("#admHall");
    try {
      const res = await fetch(`${API}/api/hall`);
      const { students } = await res.json();
      box.innerHTML = students.length ? `<div class="ct-scroll adm-card"><table class="adm-table"><thead><tr><th>Name</th><th>Grade</th><th>Finished</th><th>Photo</th><th></th></tr></thead><tbody>
        ${students.map((s) => `<tr><td>${esc(s.name)}</td><td>${esc(GRADE_LABEL[s.grade] || s.grade)}</td><td>${s.finishedOn ? esc(fmt(s.finishedOn)) : ""}</td>
          <td>${s.photo ? `<a href="${esc(API + s.photo)}" target="_blank" rel="noopener">📷 view</a>` : ""}</td>
          <td><button type="button" class="adm-del adm-small" data-del-hall="${esc(s.id)}" aria-label="Remove ${esc(s.name)}">🗑️</button></td></tr>`).join("")}
        </tbody></table></div>` : '<p class="society-empty">No graduates yet. Add the first one above! 🐰🐸</p>';
    } catch (err) { box.innerHTML = `<p class="sf-status is-error">${esc(err.message)}</p>`; }
  }
  $("#admNewHall").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target.elements;
    const status = $("#admHallStatus");
    const btn = e.target.querySelector("button[type=submit]");
    btn.disabled = true;
    status.className = "sf-status adm-wide";
    try {
      const fd = new FormData();
      ["name", "grade", "finished_on", "caption"].forEach((k) => fd.append(k, f[k].value));
      if (f.photo.files[0]) {
        status.textContent = "Shrinking photo…";
        fd.append("photo", await shrinkPhoto(f.photo.files[0]), "photo.jpg");
      }
      status.textContent = "Adding…";
      const res = await fetch(`${API}/api/admin/hall`, { method: "POST", headers: { Authorization: `Bearer ${password}` }, body: fd });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) signOut("Signed out. Please sign in again.");
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      status.textContent = `Added ${f.name.value} 🎉`;
      status.className = "sf-status adm-wide is-ok";
      f.name.value = ""; f.caption.value = ""; f.photo.value = "";
      loadHall();
    } catch (err) {
      status.textContent = err.message;
      status.className = "sf-status adm-wide is-error";
    }
    btn.disabled = false;
  });
  $("#admHall").addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-del-hall]");
    if (!btn || !confirm("Remove this student (and their photo) from the hall of fame?")) return;
    try { await api(`/api/admin/hall/${btn.dataset.delHall}`, { method: "DELETE" }); loadHall(); } catch (err) { alert(err.message); }
  });

  /* ---------- Arcade scores ---------- */
  const SCORE_GAMES = window.YVY.arcadeScores || [];
  let scoreGame = SCORE_GAMES[0];
  $("#admScoreGames").innerHTML = SCORE_GAMES.map((g, i) =>
    `<button type="button" data-game="${esc(g.game)}" aria-pressed="${i === 0}">${esc(g.title)}</button>`).join("");
  $("#admScoreGames").addEventListener("click", (e) => {
    const b = e.target.closest("[data-game]");
    if (!b) return;
    scoreGame = SCORE_GAMES.find((g) => g.game === b.dataset.game);
    e.currentTarget.querySelectorAll("[data-game]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    loadScores();
  });
  async function loadScores() {
    const box = $("#admScores");
    if (!scoreGame) { box.innerHTML = '<p class="society-empty">No arcade games with scores yet.</p>'; return; }
    try {
      const { scores } = await api(`/api/admin/scores?game=${encodeURIComponent(scoreGame.game)}`);
      const show = (n) => (scoreGame.low ? `${(n / 1000).toFixed(3)} s` : `${n}`);
      box.innerHTML = scores.length ? `<div class="ct-scroll adm-card"><table class="adm-table"><thead><tr><th>#</th><th>Initials</th><th>Score</th><th>Date</th><th></th></tr></thead><tbody>
        ${scores.map((s, i) => `<tr><td>${i + 1}</td><td>${esc(s.initials)}</td><td>${esc(show(s.score))}</td><td>${esc(fmt(s.createdAt))}</td>
          <td><button type="button" class="adm-del adm-small" data-del-score="${esc(s.id)}" aria-label="Delete this score">🗑️</button></td></tr>`).join("")}
        </tbody></table></div>` : '<p class="society-empty">No scores yet.</p>';
    } catch (err) { box.innerHTML = `<p class="sf-status is-error">${esc(err.message)}</p>`; }
  }
  $("#admScores").addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-del-score]");
    if (!btn || !confirm("Delete this score?")) return;
    try { await api(`/api/admin/scores/${btn.dataset.delScore}`, { method: "DELETE" }); loadScores(); } catch (err) { alert(err.message); }
  });

  if (password) signIn(password).catch(() => signOut());
})();
