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

  async function showJournal(panel) {
    const { posts } = await api("/api/feed?kind=journal&limit=30");
    panel.innerHTML = posts.length
      ? `<div class="society-posts">${posts.map((p) => postCard(p)).join("")}</div>`
      : '<p class="society-empty">No journal entries yet. Be the first! ✏️</p>';
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

  async function showCompost(panel) {
    const [{ logs }, { posts }] = await Promise.all([api("/api/compost"), api("/api/feed?kind=compost&limit=12")]);
    // Latest reading for each pile
    const latestByPile = [...new Map(logs.map((l) => [l.pile, l])).values()];
    panel.innerHTML = `
      ${latestByPile.map((latest) => {
        const st = compostStatus(latest.temp_f);
        return `<div class="compost-hero">
          <div><p class="ch-label">Latest reading · ${esc(latest.pile)}</p>
            <p class="ch-value">${esc(latest.temp_f)}°F</p>
            <p class="ch-date">${esc(fmtDate(latest.logged_on))}${latest.turned ? " · turned ↻" : ""}</p></div>
          <p class="ch-status ch-${st.cls}"><span aria-hidden="true">${st.icon}</span> ${esc(st.label)}</p>
        </div>`;
      }).join("")}
      <figure class="compost-chart" id="compostChart">
        <figcaption>Compost temperature (°F), logged by Yvy</figcaption>
      </figure>
      ${logs.length ? `<details class="compost-table"><summary>See every reading as a table</summary>
        <div class="ct-scroll"><table><thead><tr><th>Date</th><th>Pile</th><th>Temp</th><th>Turned</th><th>Notes</th></tr></thead>
        <tbody>${logs.slice().reverse().map((l) => `<tr><td>${esc(fmtDate(l.logged_on))}</td><td>${esc(l.pile)}</td><td>${esc(l.temp_f)}°F</td><td>${l.turned ? "↻ yes" : ""}</td><td>${esc(l.notes)}${l.moisture ? ` <em>(${esc(l.moisture)})</em>` : ""}</td></tr>`).join("")}</tbody></table></div>
      </details>` : ""}
      <p class="compost-guide">🌡️ Guide: above <b>${C.hotLow}°F</b> kills most weed seeds and germs, turn it at <b>${C.turnAt}°F</b>,
        and above <b>${C.tooHot}°F</b> the helpful microbes start dying.
        Source: <a href="${esc(C.source.url)}" target="_blank" rel="noopener">${esc(C.source.label)}</a>.</p>
      <h4 class="compost-photos-title">Compost photos</h4>
      ${posts.length ? `<div class="society-posts">${posts.map((p) => postCard(p)).join("")}</div>` : '<p class="society-empty">No compost photos yet. Submit one! 🪱</p>'}`;
    drawCompostChart($("#compostChart", panel), logs);
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
  async function openTab(name) {
    root.querySelectorAll(".society-tabs [data-tab]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.tab === name)));
    const panel = $("#societyPanel");
    panel.classList.add("is-loading");
    try { await TABS[name](panel); } catch (e) { panel.innerHTML = napping; }
    panel.classList.remove("is-loading");
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
    const syncKind = async () => {
      const kind = form.elements.kind.value;
      projectRow.hidden = kind !== "project";
      if (kind === "project") {
        const sel = form.elements.project_id;
        try {
          const projects = await getProjects();
          sel.innerHTML = '<option value="">Pick a project…</option>' +
            projects.filter((p) => p.status !== "archived").map((p) => `<option value="${esc(p.id)}">${esc(p.emoji)} ${esc(p.name)}</option>`).join("");
        } catch (e) { sel.innerHTML = '<option value="">Projects didn\'t load</option>'; }
      }
    };

    $("#societySubmitBtn").addEventListener("click", () => {
      lastFocus = document.activeElement;
      status.textContent = "";
      status.className = "sf-status";
      box.hidden = false;
      syncKind();
      $("#sfClose").focus();
    });
    $("#sfClose").addEventListener("click", close);
    box.addEventListener("click", (e) => { if (e.target === box) close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !box.hidden) close(); });
    form.addEventListener("change", (e) => { if (e.target.name === "kind") syncKind(); });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = $("button[type=submit]", form);
      const files = [...form.elements.photos.files];
      if (files.length > 3) { status.textContent = "Up to 3 photos, please."; status.className = "sf-status is-error"; return; }
      btn.disabled = true;
      status.className = "sf-status";
      status.textContent = files.length ? "Shrinking photos…" : "Sending…";
      try {
        const fd = new FormData();
        ["kind", "project_id", "author", "title", "body", "passcode"].forEach((k) => fd.append(k, form.elements[k].value));
        for (const f of files) fd.append("photos", await shrinkPhoto(f), f.name.replace(/\.\w+$/, "") + ".jpg");
        status.textContent = "Sending…";
        const res = await api("/api/submit", { method: "POST", body: fd });
        status.textContent = res.message;
        status.className = "sf-status is-ok";
        ["title", "body"].forEach((k) => { form.elements[k].value = ""; });
        form.elements.photos.value = "";
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
    if (b) openTab(b.dataset.tab);
  });
  buildForm();
  // Load the journal when the section scrolls into view, or a few seconds after the page loads
  let started = false;
  const start = () => { if (!started) { started = true; io.disconnect(); openTab("journal"); } };
  const io = new IntersectionObserver((entries) => { if (entries.some((x) => x.isIntersecting)) start(); }, { rootMargin: "300px" });
  io.observe(root);
  setTimeout(start, location.hash === "#society" ? 0 : 4000);
})();
