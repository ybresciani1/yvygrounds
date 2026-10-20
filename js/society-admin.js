/*
 * Garden Society admin (society-admin.html): review submissions, manage projects, log compost temps.
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
    ({ review: loadPosts, projects: loadProjects, compost: loadReadings })[name]();
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
  document.querySelector(".adm-filter").addEventListener("click", (e) => {
    const b = e.target.closest("[data-status]");
    if (!b) return;
    reviewStatus = b.dataset.status;
    document.querySelectorAll(".adm-filter [data-status]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
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
      $("#admPiles").innerHTML = [...new Set(logs.map((l) => l.pile))].map((p) => `<option value="${esc(p)}">`).join("");
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

  if (password) signIn(password).catch(() => signOut());
})();
