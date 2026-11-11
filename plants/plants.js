/* Plant pages (plants/<plant>/index.html), their coloring pages (coloring.html) and printable cards
   (card.html), built from plants-data.js. The body says which: <body data-plant="pumpkin"
   data-page="plant|coloring|card|proxy">. proxy is one card face for a print shop (proxies/, data-side). */
(function () {
  "use strict";
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const id = document.body.dataset.plant;
  const P = (window.YVY_PLANTS || {})[id];
  const root = $("#plant");
  if (!P || !root) return;
  // Section titles, nav buttons and icons: plant wording unless the entry says otherwise (labels),
  // so a critter (the garden spider) can use the same page: e.g. "How it builds a web" for pollination
  const low = P.name.toLowerCase();
  const L = {
    parts: { icon: "🌱", nav: "Parts", title: `Parts of a ${P.name} Plant` },
    pollination: { icon: "🐝", nav: "Pollination", title: `Pollination: how a flower becomes a ${low}` },
    grow: { icon: "🪴", nav: "How to grow", title: `How to Grow a ${P.name}` },
    ...Object.fromEntries(Object.entries(P.labels || {}).map(([k, v]) => [k, { icon: "", nav: "", title: "", ...v }])),
  };

  // The diagram is one SVG (plants/art/): colored here, outlines on the coloring page
  const drawing = (box) => fetch(P.art).then((r) => r.ok ? r.text() : Promise.reject(r.status))
    .then((svg) => { box.innerHTML = svg; })
    .catch(() => { box.innerHTML = `<p class="pl-missing">The picture didn't load. Try refreshing!</p>`; });

  if (document.body.dataset.page === "coloring") {
    document.title = `${P.name} Coloring Page`;
    root.innerHTML = `
      <header class="cp-head">
        <h1>${esc(L.parts.title)}</h1>
        <p class="cp-name">Name: <span></span></p>
      </header>
      <div class="cp-art" id="cpArt"></div>
      <p class="cp-foot">${esc(P.coloring.foot || "Color every part!")} · yvygrounds.com/plants/${esc(id)}/</p>
      <p class="cp-tools no-print">
        <button type="button" class="pl-btn" id="cpPrint">🖨️ Print it</button>
        <a class="pl-btn" href="${esc(P.coloring.pdf)}" download>📥 Download the PDF</a>
        <a class="pl-btn pl-btn-plain" href="./">← Back to the ${esc(P.name.toLowerCase())} page</a>
      </p>`;
    drawing($("#cpArt"));
    $("#cpPrint").addEventListener("click", () => window.print());
    return;
  }

  const page = document.body.dataset.page;
  if ((page === "card" || page === "proxy") && P.card) {
    // A fold-over trading card: front and back side by side, two to a page (one for a friend)
    const K = P.card;
    document.title = `${K.name} Card`;
    const letters = (cls) => [..."YvyGrounds"].map((ch, i) => `<span class="${cls}" style="--c:${["#ff8cc6", "#ffb0d9", "#ff8cc6", "#c9b8f2", "#b39af0", "#d4c6f7", "#a98fe6", "#c9b8f2", "#b39af0", "#d4c6f7"][i]};--r:${[-8, 5, -4, 6, -5, 3, -6, 4, -3, 7][i]}deg">${ch}</span>`).join("");
    const px = (n) => (window.Pixel ? window.Pixel.svg(n, 4) : "");
    const front = `
      <article class="gc">
        <p class="gc-banner">★ Garden Card ★</p>
        <header class="gc-top"><span class="gc-name">${esc(K.name)}</span><span class="gc-hp"><small>HP</small>${esc(K.hp)}</span></header>
        <div class="gc-art"><img src="${esc(page === "proxy" && K.artHd ? K.artHd : K.art)}" alt="${esc(K.alt || K.name)}"></div>
        <p class="gc-type">${esc(K.type)} type · ${esc(K.kind)} · <i>${esc(P.sci)}</i></p>
        <ul class="gc-moves">${K.moves.map((m) => `
          <li><b>${esc(m.name)}</b><span class="gc-dmg">${m.dmg ? esc(m.dmg) : "★"}</span><span class="gc-text">${esc(m.text)}</span></li>`).join("")}
        </ul>
        <p class="gc-flavor">${esc(K.flavor)}</p>
        <footer class="gc-foot">
          <span><b>Weakness:</b> ${esc(K.weakness)}</span><span><b>Resists:</b> ${esc(K.resist)}</span>
          <span class="gc-size">${esc(K.size)}</span><span class="gc-num">Garden #${esc(P.number)}</span>
        </footer>
      </article>`;
    const back = `
      <div class="gc gc-back">
        <span class="gb-corner gb-tl">${px("heart")}</span><span class="gb-corner gb-tr">${px("flower")}</span>
        <span class="gb-corner gb-bl">${px("sprout")}</span><span class="gb-corner gb-br">${px("tomato")}</span>
        <div class="gb-oval"><span class="gb-chicken">${px("chicken")}</span><span class="gb-logo">${letters("gb-ltr")}</span><span class="gb-sub">★ Trading Card ★</span></div>
        <p class="gb-collect">yvygrounds.com</p>
      </div>`;
    if (page === "proxy") {
      // One face, with bleed (proxies/index.html sizes it): the frame color runs past the cut line
      const side = document.body.dataset.side === "back" ? "back" : "front";
      root.innerHTML = `<div class="gc-proxy gc-proxy-${side}">${side === "back" ? back : front}</div>`;
      return;
    }
    const sheet = `<div class="gc-pair"><div class="gc-slot">${front}</div><div class="gc-fold" aria-hidden="true"></div><div class="gc-slot">${back}</div></div>`;
    root.innerHTML = `
      <header class="cp-head">
        <h1>Your ${esc(K.name)} Card</h1>
        <p class="gc-how">✂️ Cut around the outside · 📐 fold on the dotted line · 🧴 glue it shut</p>
      </header>
      <div class="gc-sheet">${sheet}${sheet}</div>
      <p class="cp-tools no-print">
        <button type="button" class="pl-btn" id="cpPrint">🖨️ Print it</button>
        <a class="pl-btn" href="${esc(K.pdf)}" download>📥 Download the PDF</a>
        <a class="pl-btn pl-btn-plain" href="./">← Back to the ${esc(P.name.toLowerCase())} page</a>
      </p>`;
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
      <a href="#parts">${L.parts.icon} ${esc(L.parts.nav)}</a><a href="#pollination">${L.pollination.icon} ${esc(L.pollination.nav)}</a><a href="#grow">${L.grow.icon} ${esc(L.grow.nav)}</a>
      <a href="#activities">🎨 Activities</a><a href="#print">🖨️ Printables</a>
    </nav>

    ${section("parts", L.parts.icon, L.parts.title, `
      <div class="pl-art pp-colored" id="plArt"></div>
      ${tiles(P.parts)}`)}

    ${section("pollination", L.pollination.icon, L.pollination.title, `
      <ol class="pl-steps">${P.pollination.steps.map((s) => `
        <li><span class="pl-step-icon" aria-hidden="true">${s.icon}</span><p>${esc(s.text)}</p></li>`).join("")}
      </ol>
      <div class="pl-two">
        <aside class="pl-note"><h3>${P.pollination.fact.icon || "🐝"} ${esc(P.pollination.fact.title)}</h3><p>${esc(P.pollination.fact.text)}</p></aside>
        <aside class="pl-note pl-note-try"><h3>${P.pollination.hand.icon || "🖌️"} ${esc(P.pollination.hand.title)}</h3>
          <ol>${P.pollination.hand.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol></aside>
      </div>`)}

    ${section("grow", L.grow.icon, L.grow.title, tiles(P.grow))}

    ${section("facts", "✨", "Fun Facts", `
      <ul class="pl-facts">${P.facts.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>`)}

    ${section("activities", "🎨", "Try It!", tiles(P.activities))}

    ${section("print", "🖨️", "Print It!", `
      <div class="pl-print">
        <a class="pl-print-thumb" href="${esc(P.coloring.page)}" aria-label="Open the coloring page"><span id="plThumb"></span></a>
        <div>
          <p>${esc(P.coloring.text || `Print the ${low} and color in every part!`)}</p>
          <p class="pl-print-btns">
            <a class="pl-btn" href="${esc(P.coloring.pdf)}" download>📥 Download the PDF</a>
            <a class="pl-btn pl-btn-plain" href="${esc(P.coloring.page)}">🖨️ Open &amp; print</a>
          </p>
        </div>
      </div>
      ${P.card ? `
      <div class="pl-print pl-print-card">
        <a class="pl-print-thumb" href="${esc(P.card.page)}" aria-label="Open the ${esc(P.card.name)} card"><img src="${esc(P.card.art)}" alt=""></a>
        <div>
          <h3>🃏 Print your own ${esc(P.card.name)} card!</h3>
          <p>A trading card with real ${esc(P.name.toLowerCase())} facts in its moves. Print it, cut it out, fold it in half and glue it: front and back, just like a real card.</p>
          <p class="pl-print-btns">
            <a class="pl-btn" href="${esc(P.card.pdf)}" download>📥 Download the card</a>
            <a class="pl-btn pl-btn-plain" href="${esc(P.card.page)}">🖨️ Open &amp; print</a>
          </p>
        </div>
      </div>` : ""}`)}

    <footer class="pl-foot">Made for our school garden by <a href="../../">Yvy</a> 🌻</footer>`;

  drawing($("#plArt"));
  drawing($("#plThumb"));
})();
