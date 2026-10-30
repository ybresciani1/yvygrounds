/*
 * Volunteer How-to (📖 How-to tab in the Garden Society): step-by-step photo guides for watering and
 * chicken care. Guides come from data.js → howTo; tap a photo to see it big in the lightbox.
 * Map spots and Volunteer Days jobs with a howto key open their guide with window.YvyHowTo.open(key).
 */
(function () {
  "use strict";

  const H = window.YVY && window.YVY.howTo;
  const box = document.getElementById("gardenHowTo");
  if (!H || !box) return;

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
  // {code} in a step's text becomes a "🔒 Ask Yvy for the code" tag: the lock code never goes on the site
  const words = (t) => esc(t).replace(/\{code\}/g, `<b class="howto-code">🔒 ${esc(H.askCode)}</b>`);
  const plain = (t) => t.replace(/\{code\}/g, `(${H.askCode}.)`);
  // A guide's steps, with "shed" / "faucet" swapped for those shared steps
  const stepsOf = (g) => g.steps.flatMap((s) => (typeof s === "string" ? H.shared[s] || [] : [s]));
  const src = (name) => `images/howto/${name}.jpg`;

  box.innerHTML = `
    <h3 class="leaf-title"><span>${esc(H.title)}</span></h3>
    <p class="howto-intro">${esc(H.intro)}</p>
    ${H.rule ? `<p class="howto-rule">${esc(H.rule)}</p>` : ""}
    <div class="howto-pick" role="group" aria-label="Pick a guide">${H.guides.map((g, k) =>
      `<button type="button" data-guide="${k}" aria-pressed="false">${esc(g.button)}</button>`).join("")}</div>
    <div class="howto-guide" aria-live="polite"></div>`;
  const guide = box.querySelector(".howto-guide");

  let cur = null; // the guide showing now
  let photos = []; // its photos in order, for the lightbox
  function show(k) {
    cur = H.guides[k] || H.guides[0];
    box.querySelectorAll("[data-guide]").forEach((b) => b.setAttribute("aria-pressed", String(H.guides[+b.dataset.guide] === cur)));
    photos = [];
    const steps = stepsOf(cur).map((s, n) => {
      const pics = Object.entries(s.pics || {}).map(([name, alt]) => {
        photos.push({ src: src(name), caption: `Step ${n + 1}: ${plain(s.text)}` });
        return `<button type="button" class="howto-pic" data-pic="${photos.length - 1}" aria-label="See it big: ${esc(alt)}">
          <img src="${esc(src(name))}" alt="${esc(alt)}" loading="lazy" data-fallback="📸"></button>`;
      }).join("");
      return `<li class="howto-step${pics ? "" : " howto-step-words"}">${pics ? `<div class="howto-pics">${pics}</div>` : ""}
        <p><span class="howto-n">${n + 1}</span>${words(s.text)}</p></li>`;
    });
    guide.innerHTML = `<h4 class="howto-title">${esc(cur.title)}</h4>
      ${cur.when ? `<p class="howto-when"><b>When:</b> ${esc(cur.when)}</p>` : ""}
      ${cur.note ? `<p class="howto-note">${esc(cur.note)}</p>` : ""}
      <ol class="howto-steps">${steps.join("")}</ol>`;
  }

  box.addEventListener("click", (e) => {
    const b = e.target.closest("[data-guide]");
    if (b) { show(+b.dataset.guide); return; }
    const p = e.target.closest("[data-pic]");
    if (p && window.YvyLightbox) window.YvyLightbox(photos, +p.dataset.pic, cur.title);
  });
  show(0);

  // Opens the How-to tab at a guide (from a map spot or a Volunteer Days job)
  window.YvyHowTo = {
    has: (key) => H.guides.some((g) => g.key === key),
    title: (key) => (H.guides.find((g) => g.key === key) || {}).title || "",
    open(key) {
      const tab = document.querySelector('.society-tabs [data-tab="howto"]');
      if (tab) tab.click();
      show(H.guides.findIndex((g) => g.key === key));
      box.scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    },
  };
})();
