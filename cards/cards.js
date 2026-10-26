/* Gardenbound trading card binder (cards/index.html). Cards come from cards-data.js (YVY_CARDS),
   the critters from js/data.js (YVY.flock / YVY.pets → card), so their cards stay in step with the site. */
(function () {
  "use strict";
  const C = window.YVY_CARDS;
  const D = window.YVY || {};
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const calm = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- the logo, like the main page's ---------- */
  const colors = ["#ff8cc6", "#ffb0d9", "#ff8cc6", "#c9b8f2", "#b39af0", "#d4c6f7", "#a98fe6", "#c9b8f2", "#b39af0", "#d4c6f7"];
  const rot = [-8, 5, -4, 6, -5, 3, -6, 4, -3, 7];
  const lift = [0, -6, 4, -2, 5, -5, 2, -4, 6, 0];
  const logoLetters = (cls) => [..."YvyGrounds"].map((ch, i) =>
    `<span class="${cls}" aria-hidden="true" style="--c:${colors[i]};--r:${rot[i]}deg;--y:${lift[i]}">${ch}</span>`).join("");
  $("#logo").innerHTML = logoLetters("ltr");

  /* ---------- every card, in binder order ---------- */
  // The critters' cards (Critter of the Month), with their first turn's photo
  const critters = [...(D.flock || []), ...(D.pets || [])].filter((c) => c.card).map((c) => {
    const k = c.card;
    const p = (k.photos || [])[0] || { src: c.photo, focus: c.focus };
    return {
      name: c.name, tier: "critter", photo: p.src ? "../" + p.src : "", focus: p.focus, hp: k.hp, type: k.type,
      kind: c.breed || c.kind, moves: k.moves, stats: k.stats, weakness: k.weakness, resist: k.resist,
      rarity: k.rarity, memorial: k.memorial,
    };
  });
  const SECTIONS = [
    { id: "legend", title: "Heroes & Legends", note: "Rabbit and Frog on their own, and the two legendary cards: Rabbit & Frog together, and Wallace the Worm.",
      cards: C.cards.filter((c) => c.tier === "hero" || (c.tier === "legend")) },
    { id: "host", title: "Island Hosts", note: "The hosts of every island group, in world map order (Wallace is up with the Legends).", cards: C.cards.filter((c) => c.tier === "host") },
    { id: "crop", title: "Garden Crops", note: "The sixteen crops that grow on every island. All the same power, so any crop can take on any other.", cards: C.cards.filter((c) => c.tier === "crop") },
    { id: "critter", title: "Critter Corner", note: "The Critter of the Month cards from the main page, for comparing.", cards: critters },
  ];
  const all = SECTIONS.flatMap((s) => s.cards);
  const gardenbound = C.cards.length;
  const banner = (c) => c.tier === "critter" ? "★ Critter of the Month ★" : C.tiers[c.tier].banner;
  const rarityOf = (c) => c.rarity || C.tiers[c.tier]?.rarity || 1;
  const pips = (n) => Array.from({ length: 5 }, (_, i) => `<i class="${i < n ? "on" : ""}"></i>`).join("");
  const powerOf = (c) => typeof c.hp === "number"
    ? c.hp + c.moves.reduce((t, m) => t + (m.dmg || 0) + (m.effect ? 10 : 0), 0) : null;
  const statsOf = (c) => Object.values(c.stats).reduce((a, b) => a + b, 0);

  function front(c, i) {
    const r = rarityOf(c);
    const no = c.tier === "critter"
      ? `CC ${String(critters.indexOf(c) + 1).padStart(2, "0")}/${String(critters.length).padStart(2, "0")}`
      : `GB ${String(i + 1).padStart(3, "0")}/${String(gardenbound).padStart(3, "0")}`;
    const pic = c.art
      ? `<img src="art/${esc(c.art)}.webp" alt="${esc(c.name)}" width="720" height="480">`
      : `<img src="${esc(c.photo)}" alt="${esc(c.name)}" style="object-position:${esc(c.focus || "50% 30%")}">`;
    return `<article class="tc tc-${c.tier}${c.memorial ? " is-memorial" : ""}">
      <p class="tc-banner">${esc(banner(c))}</p>
      <header class="tc-top">
        <span class="tc-name">${esc(c.name)}</span>
        <span class="tc-hp"><small>HP</small>${esc(c.hp)}</span>
      </header>
      <div class="tc-art${c.art ? "" : " is-photo"}">
        <span class="tc-actor">${pic}</span>
        <span class="tc-fx" aria-hidden="true"></span>
        <span class="tc-say" aria-live="polite"></span>
        ${c.memorial ? '<span class="tc-ribbon">Forever loved</span>' : ""}
      </div>
      <p class="tc-type">${esc(c.type)} type · ${esc(c.kind)}</p>
      <ul class="tc-moves">${c.moves.map((mv, m) => `
        <li><button type="button" class="tc-move" data-move="${m}">
          <b>${esc(mv.name)}</b><span class="tc-dmg">${mv.dmg ? esc(mv.dmg) : mv.effect ? "★" : "♥"}</span>
          <span class="tc-move-text">${esc(mv.text)}</span>
        </button></li>`).join("")}
      </ul>
      <dl class="tc-stats">${Object.entries(c.stats).map(([stat, n]) => `
        <div><dt>${esc(stat)}</dt><dd aria-label="${n} out of 5">${pips(n)}</dd></div>`).join("")}
      </dl>
      <footer class="tc-foot">
        <span><b>Weakness:</b> ${esc(c.weakness)}</span>
        <span class="tc-rarity" aria-label="Rarity ${r} out of 5">${"★".repeat(r)}${"☆".repeat(5 - r)}</span>
        <span><b>Resists:</b> ${esc(c.resist)}</span>
        <span class="tc-num">${no}</span>
      </footer>
      <span class="tc-shine" aria-hidden="true"></span>
    </article>`;
  }

  // The back: the same for every card
  const px = (name) => (window.Pixel ? window.Pixel.svg(name, 4) : "");
  function back() {
    return `<div class="tc tc-back" aria-label="Card back">
      <span class="tb-corner tb-tl">${px("heart")}</span><span class="tb-corner tb-tr">${px("flower")}</span>
      <span class="tb-corner tb-bl">${px("sprout")}</span><span class="tb-corner tb-br">${px("tomato")}</span>
      <div class="tb-oval">
        <span class="tb-chicken">${px("chicken")}</span>
        <span class="tb-logo">${logoLetters("tb-ltr")}</span>
        <span class="tb-sub">★ Trading Card ★</span>
      </div>
      <p class="tb-collect">Collect them all!</p>
    </div>`;
  }

  /* ---------- the binder ---------- */
  let n = -1;
  $("#binder").innerHTML = SECTIONS.map((s) => `
    <section class="binder-page" data-section="${s.id}">
      <h2>${esc(s.title)} <small>${s.cards.length} cards</small></h2>
      <p class="binder-page-note">${esc(s.note)}</p>
      <div class="binder-grid">${s.cards.map((c) => {
        const i = c.tier === "critter" ? -1 : ++n;
        return `<div class="slot" data-card="${all.indexOf(c)}">
          <div class="flipper">
            <div class="face face-front">${front(c, i)}</div>
            <div class="face face-back">${back()}</div>
          </div>
          <button type="button" class="flip-btn" aria-pressed="false">↻ Flip</button>
        </div>`;
      }).join("")}</div>
    </section>`).join("");
  $("#backSheet").innerHTML = Array.from({ length: 9 }, () => `<div class="slot">${back()}</div>`).join("");

  /* ---------- flipping ---------- */
  const flip = (slot, on) => {
    on = on ?? !slot.classList.contains("is-flipped");
    slot.classList.toggle("is-flipped", on);
    $(".flip-btn", slot).setAttribute("aria-pressed", String(on));
    $(".face-front", slot).inert = on;
  };
  let allFlipped = false;
  $("#flipAll").addEventListener("click", () => {
    allFlipped = !allFlipped;
    $$(".binder-grid .slot").forEach((s) => flip(s, allFlipped));
  });

  /* ---------- moves: the picture acts it out, emoji fly, and a Pokémon-style line pops up ---------- */
  function playMove(slot, c, mv) {
    const card = $(".face-front", slot);
    const say = $(".tc-say", card), fx = $(".tc-fx", card), actor = $(".tc-actor", card);
    say.textContent = `${c.name} used ${mv.name.toUpperCase()}!`;
    say.classList.remove("is-on");
    void say.offsetWidth;
    say.classList.add("is-on");
    if (calm()) return;
    actor.className = "tc-actor";
    void actor.offsetWidth; // restart if the same move is clicked twice
    actor.classList.add(`do-${mv.anim || "flip"}`);
    fx.innerHTML = Array.from({ length: 6 }, (_, k) =>
      `<span style="left:${10 + ((k * 37) % 80)}%;top:${20 + ((k * 23) % 60)}%;animation-delay:${k * 0.08}s">${esc(mv.fx || "✨")}</span>`).join("");
    clearTimeout(fx._t);
    fx._t = setTimeout(() => { fx.innerHTML = ""; }, 1800);
  }
  $("#binder").addEventListener("click", (e) => {
    const slot = e.target.closest(".slot");
    if (!slot) return;
    if (e.target.closest(".flip-btn")) return flip(slot);
    const b = e.target.closest("[data-move]");
    if (b) { const c = all[+slot.dataset.card]; playMove(slot, c, c.moves[+b.dataset.move]); }
  });

  /* ---------- tilt + foil glare toward the pointer ---------- */
  if (!calm()) {
    $("#binder").addEventListener("pointermove", (e) => {
      const f = e.target.closest(".flipper");
      if (!f || e.pointerType === "touch") return;
      const r = f.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      f.style.setProperty("--rx", `${(x - 0.5) * 14}deg`);
      f.style.setProperty("--ry", `${(0.5 - y) * 14}deg`);
      f.style.setProperty("--mx", `${x * 100}%`);
      f.style.setProperty("--my", `${y * 100}%`);
      f.classList.add("is-tilt");
    });
    $("#binder").addEventListener("pointerout", (e) => {
      const f = e.target.closest(".flipper");
      if (f && !f.contains(e.relatedTarget)) { f.classList.remove("is-tilt"); f.style.setProperty("--rx", "0deg"); f.style.setProperty("--ry", "0deg"); }
    });
  }

  /* ---------- filters ---------- */
  $$("[data-filter]").forEach((b) => b.addEventListener("click", () => {
    $$("[data-filter]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    $$(".binder-page").forEach((p) => { p.hidden = b.dataset.filter !== "all" && p.dataset.section !== b.dataset.filter; });
  }));

  /* ---------- printing: real card size (63 × 88 mm), 9 to a page ---------- */
  const printAs = (mode) => {
    document.body.classList.add(`print-${mode}`);
    window.print();
  };
  window.addEventListener("afterprint", () => document.body.classList.remove("print-fronts", "print-backs"));
  $("#printFronts").addEventListener("click", () => printAs("fronts"));
  $("#printBacks").addEventListener("click", () => printAs("backs"));

  /* ---------- balance sheet ---------- */
  const problems = [];
  const rows = all.map((c) => {
    const t = C.tiers[c.tier];
    const p = powerOf(c), s = statsOf(c);
    const ok = !t || (p === t.power && s === t.stats && c.moves.length === 2);
    if (!ok) problems.push(`${c.name}: power ${p} (want ${t.power}), stats ${s} (want ${t.stats})`);
    const label = { hero: "Hero", legend: "Legend", host: "Host", crop: "Crop", critter: "Critter" }[c.tier];
    return `<tr class="${t ? (ok ? "is-ok" : "is-off") : "is-ref"}">
      <th scope="row">${esc(c.name)}</th><td>${label}</td><td>${esc(c.hp)}</td>
      <td>${c.moves.map((m) => `${m.dmg || 0}${m.effect ? "+★" : ""}`).join(" / ")}</td>
      <td><b>${p ?? "∞"}</b>${t ? ` <small>/ ${t.power}</small>` : ""}</td>
      <td>${s}${t ? ` <small>/ ${t.stats}</small>` : ""}</td>
      <td>${t ? (ok ? "✅" : "⚠️") : "·"}</td></tr>`;
  });
  $("#balance").innerHTML = `
    <p class="balance-sum">${problems.length ? `⚠️ ${problems.length} card(s) off balance` : `✅ All ${gardenbound} Gardenbound cards are balanced for their tier.`}</p>
    <div class="balance-scroll"><table>
      <thead><tr><th scope="col">Card</th><th scope="col">Tier</th><th scope="col">HP</th><th scope="col">Moves</th><th scope="col">Power</th><th scope="col">Stats</th><th scope="col"><span class="sr">OK?</span></th></tr></thead>
      <tbody>${rows.join("")}</tbody>
    </table></div>`;
  if (problems.length) console.warn("Card balance:\n" + problems.join("\n"));
})();
