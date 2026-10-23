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
  if (!M || !box) return;

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

  // A planted item is "🥕 carrots" or { icon: "kale", name: "kale" } (js/veg-icons.js)
  function plant(p) {
    if (typeof p === "string") return `<li>${esc(p)}</li>`;
    const icon = p.icon && window.VegIcons ? window.VegIcons.svg(p.icon) + " " : "";
    return `<li>${icon}${esc(p.name)}</li>`;
  }

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

  function show(i) {
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
      (s.fix ? `<p class="gm-what gm-what-fix">Needs fixing:</p>${list(s.fix, "gm-fix")}` : "") +
      (s.todo ? `<p class="gm-what">${esc(M.todoTitle || "To-do")}:</p>${list(s.todo, "gm-todo")}` : "") +
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
})();
