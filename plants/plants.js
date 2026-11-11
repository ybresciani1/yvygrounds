/* Plant pages (plants/<plant>/index.html) and their coloring pages (coloring.html), built from
   plants-data.js. The body says which: <body data-plant="pumpkin" data-page="plant|coloring">. */
(function () {
  "use strict";
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const id = document.body.dataset.plant;
  const P = (window.YVY_PLANTS || {})[id];
  const root = $("#plant");
  if (!P || !root) return;

  // The diagram is one SVG (plants/art/): colored here, outlines on the coloring page
  const drawing = (box) => fetch(P.art).then((r) => r.ok ? r.text() : Promise.reject(r.status))
    .then((svg) => { box.innerHTML = svg; })
    .catch(() => { box.innerHTML = `<p class="pl-missing">The picture didn't load. Try refreshing!</p>`; });

  if (document.body.dataset.page === "coloring") {
    document.title = `${P.name} Coloring Page`;
    root.innerHTML = `
      <header class="cp-head">
        <h1>Parts of a ${esc(P.name)} Plant</h1>
        <p class="cp-name">Name: <span></span></p>
      </header>
      <div class="cp-art" id="cpArt"></div>
      <p class="cp-foot">Color every part! Can you find the tiny baby ${esc(P.name.toLowerCase())}? · yvygrounds.com/plants/${esc(id)}/</p>
      <p class="cp-tools no-print">
        <button type="button" class="pl-btn" id="cpPrint">🖨️ Print it</button>
        <a class="pl-btn" href="${esc(P.coloring.pdf)}" download>📥 Download the PDF</a>
        <a class="pl-btn pl-btn-plain" href="./">← Back to the ${esc(P.name.toLowerCase())} page</a>
      </p>`;
    drawing($("#cpArt"));
    $("#cpPrint").addEventListener("click", () => window.print());
    return;
  }

  document.title = `${P.name} · YvyGrounds Garden`;
  const section = (sid, icon, title, body) => `
    <section class="pl-card" id="${sid}" aria-labelledby="${sid}-h">
      <h2 id="${sid}-h"><span aria-hidden="true">${icon}</span> ${esc(title)}</h2>
      ${body}
    </section>`;
  const tiles = (list) => `<div class="pl-tiles">${list.map((t) => `
      <article class="pl-tile"><h3><span aria-hidden="true">${t.icon}</span> ${esc(t.title || t.name)}</h3><p>${esc(t.text)}</p></article>`).join("")}</div>`;

  root.innerHTML = `
    <header class="pl-head">
      <a class="pl-home" href="../../">← YvyGrounds</a>
      <p class="pl-kicker">Real-world discovery!</p>
      <h1 class="pl-name">${esc(P.name)}</h1>
      <p class="pl-sci"><i>${esc(P.sci)}</i> · ${esc(P.family)}</p>
      <dl class="pl-quick">${P.quick.map(([icon, big, small]) => `
        <div><dt><span aria-hidden="true">${icon}</span> ${esc(big)}</dt><dd>${esc(small)}</dd></div>`).join("")}
      </dl>
    </header>

    <nav class="pl-jump" aria-label="On this page">
      <a href="#parts">🌱 Parts</a><a href="#pollination">🐝 Pollination</a><a href="#grow">🪴 How to grow</a>
      <a href="#activities">🎨 Activities</a><a href="#print">🖍️ Coloring page</a>
    </nav>

    ${section("parts", "🌱", `Parts of a ${P.name} Plant`, `
      <div class="pl-art pp-colored" id="plArt"></div>
      ${tiles(P.parts)}`)}

    ${section("pollination", "🐝", `Pollination: how a flower becomes a ${P.name.toLowerCase()}`, `
      <ol class="pl-steps">${P.pollination.steps.map((s) => `
        <li><span class="pl-step-icon" aria-hidden="true">${s.icon}</span><p>${esc(s.text)}</p></li>`).join("")}
      </ol>
      <div class="pl-two">
        <aside class="pl-note"><h3>🐝 ${esc(P.pollination.fact.title)}</h3><p>${esc(P.pollination.fact.text)}</p></aside>
        <aside class="pl-note pl-note-try"><h3>🖌️ ${esc(P.pollination.hand.title)}</h3>
          <ol>${P.pollination.hand.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol></aside>
      </div>`)}

    ${section("grow", "🪴", `How to Grow a ${P.name}`, tiles(P.grow))}

    ${section("facts", "✨", "Fun Facts", `
      <ul class="pl-facts">${P.facts.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>`)}

    ${section("activities", "🎨", "Try It!", tiles(P.activities))}

    ${section("print", "🖍️", "Coloring Page", `
      <div class="pl-print">
        <a class="pl-print-thumb" href="${esc(P.coloring.page)}" aria-label="Open the coloring page"><span id="plThumb"></span></a>
        <div>
          <p>Print the ${esc(P.name.toLowerCase())} plant and color in every part: roots, vine, leaves, tendrils, both kinds of flowers and the ${esc(P.name.toLowerCase())}!</p>
          <p class="pl-print-btns">
            <a class="pl-btn" href="${esc(P.coloring.pdf)}" download>📥 Download the PDF</a>
            <a class="pl-btn pl-btn-plain" href="${esc(P.coloring.page)}">🖨️ Open &amp; print</a>
          </p>
        </div>
      </div>`)}

    <footer class="pl-foot">Made for our school garden by <a href="../../">Yvy</a> 🌻</footer>`;

  drawing($("#plArt"));
  drawing($("#plThumb"));
})();
