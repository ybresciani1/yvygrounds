/*
 * Hand-drawn vegetable, fruit and flower icons for crops that don't have an accurate emoji
 * (there's no cauliflower, beet or kale emoji, and 🥬 / 🫘 are too generic).
 * Each icon is a 32×32 SVG, drawn at emoji size by VegIcons.svg(name).
 * Use one from data.js with `icon: "cauliflower"` instead of `emoji:`.
 */
window.VegIcons = (function () {
  // A ring of points, for frilly leaves (endive)
  function spiky(cx, cy, points, outer, inner, fill) {
    let d = "";
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 ? inner : outer;
      const a = (Math.PI * i) / points - Math.PI / 2;
      d += `${i ? "L" : "M"}${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`;
    }
    return `<path d="${d}Z" fill="${fill}"/>`;
  }
  // Scalloped round edge, for lettuce heads
  function scallop(cx, cy, ring, bump, count, fill) {
    let out = "";
    for (let i = 0; i < count; i++) {
      const a = (Math.PI * 2 * i) / count;
      out += `<circle cx="${(cx + ring * Math.cos(a)).toFixed(1)}" cy="${(cy + ring * Math.sin(a)).toFixed(1)}" r="${bump}" fill="${fill}"/>`;
    }
    return out + `<circle cx="${cx}" cy="${cy}" r="${ring}" fill="${fill}"/>`;
  }
  // A ring of oval petals around a center (zinnia, cosmos)
  function petals(cx, cy, count, length, width, fill, turn = 0) {
    let out = "";
    for (let i = 0; i < count; i++) {
      const deg = (360 * i) / count + turn;
      out += `<ellipse cx="${cx}" cy="${(cy - length / 2).toFixed(1)}" rx="${width}" ry="${(length / 2).toFixed(1)}" transform="rotate(${deg.toFixed(1)} ${cx} ${cy})" fill="${fill}"/>`;
    }
    return out;
  }
  // Root-vegetable greens (beet, radish, turnip)
  const rootLeaves = (stem) => `
    <path d="M15 13C10 10 7 5 8 1c4 1 7 6 7 12z" fill="#3f8f2e"/>
    <path d="M17 13c4-4 8-6 12-5-1 4-6 6-12 5z" fill="#4f9e3a"/>
    <path d="M15.5 14L9.5 3M16.5 14L27 8.5" stroke="${stem}" stroke-width="1.4" stroke-linecap="round" fill="none"/>`;
  // A pale kidney-shaped bean
  const bean = (x, y, rot) => `
    <g transform="translate(${x} ${y}) rotate(${rot})">
      <path d="M-6.5 0c0-4.2 4.2-6.2 7.4-5.1 2 .7 2.4 2.6 4.6 2.9 1.6.3 1.7 3.1 0 4.3C3.3 4.1-.9 5.6-3.6 4.6-5.6 3.9-6.5 2-6.5 0z" fill="#d4ebb0" stroke="#8bb85a" stroke-width=".9"/>
      <ellipse cx="-2.5" cy="-1.5" rx="1.8" ry="1" fill="#f2fae4"/>
    </g>`;

  const ICONS = {
    cauliflower: `
      <path d="M2 16c4.5 0 8.5 4.5 10 13C6 29 2 23.5 2 16z" fill="#3f8f2e"/>
      <path d="M30 16c-4.5 0-8.5 4.5-10 13 6 0 10-5.5 10-13z" fill="#3f8f2e"/>
      <g fill="#f7ecc8" stroke="#a88a4a" stroke-width="1.3">
        <circle cx="9.5" cy="15.5" r="4.6"/><circle cx="22.5" cy="15.5" r="4.6"/>
        <circle cx="16" cy="10.5" r="5.6"/><circle cx="12.5" cy="19.5" r="5"/>
        <circle cx="19.5" cy="19.5" r="5"/><circle cx="16" cy="15.5" r="4.4"/>
      </g>
      <path d="M8 23c3 2.5 5.5 3.5 8 3.5s5-1 8-3.5L22.5 30h-13z" fill="#5aa83a"/>`,

    cabbage: `
      <circle cx="16" cy="17" r="13" fill="#4f9e3a"/>
      <circle cx="16" cy="17.5" r="9.5" fill="#a8dc7e"/>
      <path d="M16 8.5v18" stroke="#e8f7d6" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M16 13l-5-3M16 17.5l-6.5-2M16 22l-5.5 1M16 13l5-3M16 17.5l6.5-2M16 22l5.5 1" stroke="#e8f7d6" stroke-width="1.1" stroke-linecap="round" fill="none"/>
      <path d="M4 12c3-5 7-8 12-8s9 3 12 8c-3-2-7-3.5-12-3.5S7 10 4 12z" fill="#6cbf4a"/>`,

    beet: `${rootLeaves("#d81b60")}
      <path d="M16 12c5 0 9 3.5 9 8.5S20.5 29 16 31.5C11.5 29 7 25.5 7 20.5S11 12 16 12z" fill="#7b1043"/>
      <ellipse cx="12.5" cy="18.5" rx="2" ry="3" fill="#b0245f"/>`,

    radish: `${rootLeaves("#5aa83a")}
      <path d="M16 12c4.8 0 8.5 3.5 8.5 8 0 3-1.5 5-3.5 6.5L16 31.5l-5-5C9 25 7.5 23 7.5 20c0-4.5 3.7-8 8.5-8z" fill="#e53950"/>
      <path d="M11 26.5c2 .8 3.4 1.1 5 1.1s3-.3 5-1.1l-5 5z" fill="#fff"/>
      <ellipse cx="12.5" cy="18" rx="1.8" ry="2.6" fill="#ff8a99"/>`,

    turnip: `${rootLeaves("#7b5aa6")}
      <path d="M16 12c5 0 9 3.5 9 8.5S20.5 28 16 31c-4.5-3-9-5.5-9-10.5S11 12 16 12z" fill="#f8f4ec" stroke="#d9cdb8" stroke-width=".9"/>
      <path d="M7.2 19.5C7.8 15.2 11.4 12 16 12s8.2 3.2 8.8 7.5c-5.6 1.7-12 1.7-17.6 0z" fill="#9b4dca"/>
      <ellipse cx="12.5" cy="16.5" rx="1.6" ry="1.2" fill="#c792ea"/>`,

    kohlrabi: `
      <path d="M16 13V5M12.5 14L8 6.5M19.5 14L24 6.5M9.5 19.5L4 16.5M22.5 19.5L28 16.5" stroke="#6cbf4a" stroke-width="1.6" stroke-linecap="round" fill="none"/>
      <ellipse cx="16" cy="4" rx="2.6" ry="3.6" fill="#3f8f2e"/>
      <ellipse cx="7" cy="5.5" rx="2.3" ry="3.3" transform="rotate(-35 7 5.5)" fill="#4f9e3a"/>
      <ellipse cx="25" cy="5.5" rx="2.3" ry="3.3" transform="rotate(35 25 5.5)" fill="#4f9e3a"/>
      <circle cx="16" cy="21.5" r="9" fill="#c5e89a" stroke="#8fc865" stroke-width="1"/>
      <ellipse cx="12.5" cy="18.5" rx="2.4" ry="3.2" fill="#e8f7d6"/>
      <path d="M14.5 30.5l1.5 1.3 1.5-1.3" stroke="#a88a5a" stroke-width="1" fill="none" stroke-linecap="round"/>`,

    spinach: `
      <path d="M16 31V17M16 24l-6-5M16 24l6-5" stroke="#3f8f2e" stroke-width="1.5" stroke-linecap="round" fill="none"/>
      <path d="M9.5 21C4 20 2 14 3.5 9.5c4.5.5 8.5 4.5 6 11.5z" fill="#2e7d32"/>
      <path d="M22.5 21C28 20 30 14 28.5 9.5c-4.5.5-8.5 4.5-6 11.5z" fill="#2e7d32"/>
      <path d="M16 2c5.5 3 7.5 8.5 5.5 13S16 19.5 16 19.5 12.5 19.5 10.5 15 10.5 5 16 2z" fill="#388e3c"/>
      <path d="M16 4.5v14M5 11.5l4.5 8M27 11.5l-4.5 8" stroke="#81c784" stroke-width=".9" fill="none" stroke-linecap="round"/>`,

    chard: `
      <g transform="rotate(24 21 17)">
        <path d="M21 3.5c5.5 2.2 7.8 7.2 7 12-.7 4-3.5 6.6-7 7.5-3.5-.9-6.3-3.5-7-7.5-.8-4.8 1.5-9.8 7-12z" fill="#33691e"/>
        <path d="M21 6.5v19" stroke="#fbc02d" stroke-width="1.8" stroke-linecap="round"/>
      </g>
      <path d="M13 2c7 2.5 10 8.5 9 14.5-.8 5-4.5 8-9 9-4.5-1-8.2-4-9-9-1-6 2-12 9-14.5z" fill="#2e7d32"/>
      <path d="M13 5v26" stroke="#e53950" stroke-width="2.3" stroke-linecap="round"/>
      <path d="M13 10.5l-4.5-2.5M13 15l-6-2M13 19.5l-5.5 0M13 10.5l4.5-2.5M13 15l6-2M13 19.5l5.5 0" stroke="#ef5350" stroke-width="1" stroke-linecap="round" fill="none"/>`,

    kale: `
      <path d="M16 1.5l2.6 2.6 2.7-1.1.5 3.1 3.1.5-1.1 2.9 2.9 1.6-2.1 2.4 2.3 2.5-2.9 1.4 1.1 2.9-3.1.2-.6 3-2.8-1.2L16 26.5l-1.9-2.6-2.8 1.2-.6-3-3.1-.2 1.1-2.9-2.9-1.4 2.3-2.5-2.1-2.4 2.9-1.6-1.1-2.9 3.1-.5.5-3.1 2.7 1.1z" fill="#2e6b4f"/>
      <path d="M16 6.5c3.5 2 5 6 4.5 9.5S18 22 16 23c-2-1-4-3.5-4.5-7S12.5 8.5 16 6.5z" fill="#3c8a66"/>
      <path d="M16 4v27.5" stroke="#b9dfc6" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M16 10l-4-3M16 14l-5.5-2M16 18l-5 0M16 10l4-3M16 14l5.5-2M16 18l5 0" stroke="#b9dfc6" stroke-width=".9" stroke-linecap="round" fill="none"/>`,

    endive: `
      ${spiky(16, 18, 18, 14, 10.5, "#5aa83a")}
      ${spiky(16, 18, 14, 10, 7, "#a5d46a")}
      ${spiky(16, 18, 10, 6.5, 4, "#e6f2a8")}
      <circle cx="16" cy="18" r="2.5" fill="#f7f9d6"/>`,

    "head-lettuce": `
      ${scallop(16, 17.5, 11.5, 3, 14, "#7cc85a")}
      <circle cx="16" cy="18" r="9" fill="#c9ec9f"/>
      <path d="M10 20c2-6 10-6 12 0M12 15.5c2.5-3 5.5-3 8 0" stroke="#9fd472" stroke-width="1.3" fill="none" stroke-linecap="round"/>
      <ellipse cx="13" cy="13.5" rx="2.6" ry="1.6" fill="#e8f7d6"/>`,

    zucchini: `
      <g transform="rotate(-35 16 16)">
        <rect x="4" y="11.5" width="25" height="9" rx="4.5" fill="#2e7d32"/>
        <path d="M8 14h19M8 18h19" stroke="#6fbf73" stroke-width="1" stroke-dasharray="3 2.2" stroke-linecap="round"/>
        <circle cx="27" cy="16" r="2.2" fill="#9ccc65"/>
        <rect x="1.5" y="14" width="4" height="4" rx="1.2" fill="#8d6e3a"/>
        <path d="M5 11.8l2 2.4L5 16l2 1.8-2 2.4" fill="#558b2f"/>
      </g>`,

    okra: `
      <g transform="rotate(35 16 16)">
        <path d="M12.5 7h7l-1.2 18.5c-.4 3.3-1.2 4.8-2.3 6-1.1-1.2-1.9-2.7-2.3-6z" fill="#7cc85a"/>
        <path d="M14.3 8l.8 20M17.7 8l-.8 20M16 8v22" stroke="#3f8f2e" stroke-width=".9" fill="none"/>
        <path d="M11.5 3.5h9l-1.2 4.2h-6.6z" fill="#3f8f2e"/>
        <rect x="15" y="0" width="2" height="4.5" rx="1" fill="#33691e"/>
      </g>`,

    scallions: `
      <path d="M11 3v17M16 1.5v18.5M21 3v17" stroke="#2e7d32" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M11 3v17M16 1.5v18.5M21 3v17" stroke="#4caf50" stroke-width="2" stroke-linecap="round"/>
      <path d="M11 19v6.5M16 19v6.5M21 19v6.5" stroke="#cfc8b4" stroke-width="4" stroke-linecap="round"/>
      <path d="M11 19v6.5M16 19v6.5M21 19v6.5" stroke="#fbfaf5" stroke-width="2.6" stroke-linecap="round"/>
      <rect x="8.5" y="16.5" width="15" height="2.6" rx="1.2" fill="#e53950"/>
      <path d="M9 29.5l2-1.5 2 1.5M14 30l2-1.5 2 1.5M19 29.5l2-1.5 2 1.5" stroke="#bfa77a" stroke-width="1" fill="none" stroke-linecap="round"/>`,

    "green-beans": `
      <path d="M3 6c8.5 1 14.5 6.5 18.5 13.5 1.6 2.8 3.7 5.3 6.5 7.3-4.2.6-7.5-1.6-9.6-4.8C14.6 15.3 9.5 10.5 3 6z" fill="#388e3c"/>
      <path d="M2.5 13c7.5 1 12.5 5.5 15.5 11.5 1.1 2.1 2.6 4.2 4.7 5.7-3.7.6-6.3-1-7.9-3.6C12.4 21.8 8.2 17.4 2.5 13z" fill="#7cc85a"/>
      <circle cx="3" cy="6" r="1.2" fill="#1b5e20"/><circle cx="2.5" cy="13" r="1.2" fill="#33691e"/>`,

    "lima-beans": `${bean(10, 11, -20)}${bean(21, 13, 25)}${bean(15, 22, 5)}`,

    /* ---- Fruit ---- */
    "fruit-tree": `
      <path d="M14.5 31V20.5l-4-4M17.5 31V19l4-4" stroke="#8d5a2b" stroke-width="2.6" stroke-linecap="round" fill="none"/>
      <circle cx="16" cy="12" r="10.5" fill="#4f9e3a"/>
      <circle cx="10" cy="15" r="5.5" fill="#5aa83a"/><circle cx="22" cy="15" r="5.5" fill="#5aa83a"/>
      <circle cx="13" cy="7.5" r="4" fill="#7cc85a"/>
      <g fill="#ff6b4a" stroke="#c0392b" stroke-width=".6">
        <circle cx="11" cy="11" r="1.9"/><circle cx="19.5" cy="8" r="1.9"/><circle cx="21.5" cy="15" r="1.9"/>
        <circle cx="15" cy="16.5" r="1.9"/><circle cx="8.5" cy="17" r="1.9"/>
      </g>`,

    raspberry: `
      <g fill="#e0245e" stroke="#9c1240" stroke-width=".7">
        ${[[16, 27], [12.5, 24], [19.5, 24], [9.5, 20], [16, 21], [22.5, 20], [8.5, 15.5], [13, 17], [19, 17], [23.5, 15.5], [11, 12], [16, 13], [21, 12]]
          .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.2"/>`).join("")}
      </g>
      <g fill="#ff7aa2">${[[15, 19.5], [11, 15], [19, 15], [14, 25]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".9"/>`).join("")}</g>
      <path d="M8 9.5l4 1.5 4-5 4 5 4-1.5-3 3.5H11z" fill="#4f9e3a"/>
      <path d="M16 6V2" stroke="#3f8f2e" stroke-width="1.6" stroke-linecap="round"/>`,

    // Same berry as the raspberry, in blackberry purple-black (there's no blackberry emoji; 🫐 is a blueberry)
    blackberry: `
      <g fill="#3a1f5c" stroke="#1f0d36" stroke-width=".7">
        ${[[16, 27], [12.5, 24], [19.5, 24], [9.5, 20], [16, 21], [22.5, 20], [8.5, 15.5], [13, 17], [19, 17], [23.5, 15.5], [11, 12], [16, 13], [21, 12]]
          .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.2"/>`).join("")}
      </g>
      <g fill="#9a7bd1">${[[15, 19.5], [11, 15], [19, 15], [14, 25]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".9"/>`).join("")}</g>
      <path d="M8 9.5l4 1.5 4-5 4 5 4-1.5-3 3.5H11z" fill="#4f9e3a"/>
      <path d="M16 6V2" stroke="#3f8f2e" stroke-width="1.6" stroke-linecap="round"/>`,

    // Pale green stalks with a leafy top
    celery: `
      <path d="M11 30c-1-7-1-14 1-20M16 30V9M21 30c1-7 1-14-1-20" stroke="#9ccf6a" stroke-width="3.4" stroke-linecap="round" fill="none"/>
      <path d="M11 30c-1-7-1-14 1-20M16 30V9M21 30c1-7 1-14-1-20" stroke="#d4eea8" stroke-width="1.1" stroke-linecap="round" fill="none"/>
      <g fill="#4f9e3a"><circle cx="11" cy="8" r="3.4"/><circle cx="16" cy="6" r="3.8"/><circle cx="21" cy="8" r="3.4"/><circle cx="13.5" cy="4.5" r="2.6"/><circle cx="18.5" cy="4.5" r="2.6"/></g>
      <g fill="#7cc85a"><circle cx="15" cy="5" r="1.4"/><circle cx="20" cy="7.5" r="1.2"/><circle cx="11" cy="7" r="1.1"/></g>`,

    // A globe of layered green bracts with a purple tip
    artichoke: `
      <path d="M16 31v-5" stroke="#4f8a3a" stroke-width="2" stroke-linecap="round"/>
      <path d="M16 27c-7 0-10-5-9-11 3 2 6 2 9 0 3 2 6 2 9 0 1 6-2 11-9 11z" fill="#5f9e5a"/>
      <path d="M16 22c-5 0-8-4-7.5-9 2.5 1.6 5 1.6 7.5 0 2.5 1.6 5 1.6 7.5 0 .5 5-2.5 9-7.5 9z" fill="#7cb86a"/>
      <path d="M16 17c-3.5 0-6-3-5.5-7 2 1.2 3.7 1.2 5.5 0 1.8 1.2 3.5 1.2 5.5 0 .5 4-2 7-5.5 7z" fill="#97c97f"/>
      <path d="M16 11c-2 0-3.2-2-2.8-4.5 1 .6 1.8.6 2.8 0 1 .6 1.8.6 2.8 0 .4 2.5-.8 4.5-2.8 4.5z" fill="#b48ad1"/>
      <path d="M10.5 18.5l2-2M21.5 18.5l-2-2M12 24l2-2M20 24l-2-2" stroke="#3f7a35" stroke-width=".8" stroke-linecap="round"/>`,

    // Pale, fan-shaped oyster mushrooms (🍄 is a red toadstool)
    "oyster-mushroom": `
      <path d="M5 16c0-6 6-10 13-9 6 1 9 5 8 9-4-1-8 0-11 3-3-2-7-3-10-3z" fill="#e9dcc3" stroke="#a89474" stroke-width=".8"/>
      <path d="M9 25c0-5 5-8 10-7 5 1 7 4 6 7-3-.8-6 0-8 2-2-1.5-5-2-8-2z" fill="#f3e9d6" stroke="#a89474" stroke-width=".8"/>
      <path d="M12 12l5 4M16 10l2 5M21 10l-1 5M13 21l4 3M18 20l1 4M22 20l-1 4" stroke="#c9b48f" stroke-width=".7" stroke-linecap="round"/>`,

    /* ---- Flowers ---- */
    "sweet-pea": `
      <path d="M16 31V20" stroke="#4f9e3a" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M16 25c4 0 6-2 6-4.5 0-2-2.5-2.5-3-.5" stroke="#7cc85a" stroke-width="1.1" fill="none" stroke-linecap="round"/>
      <path d="M16 18c-7.5 1-12-4-11-10 2.5-4 8-5 11-1.5C19 3 24.5 4 27 8c1 6-3.5 11-11 10z" fill="#d97cd6"/>
      <path d="M16 18c-4.5 0-8-2.8-8.5-6.5C10 13 13 13.8 16 12c3 1.8 6 1 8.5-.5-.5 3.7-4 6.5-8.5 6.5z" fill="#f2b4ec"/>
      <path d="M16 21.5c-2.6 0-4-1.6-3.6-3.6 1.2.9 2.3 1.2 3.6 1.2s2.4-.3 3.6-1.2c.4 2-1 3.6-3.6 3.6z" fill="#fbe3f8"/>`,

    poppy: `
      <path d="M16 31V20" stroke="#5f9ea0" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M16 27l-5-4M16 26l5-4.5M11 23l-2-3M21 21.5l2.2-2.8" stroke="#7fb3a8" stroke-width="1.1" stroke-linecap="round" fill="none"/>
      <path d="M16 20C9 20 4.5 15 5 7.5 8.5 6 12 8.5 16 12c4-3.5 7.5-6 11-4.5.5 7.5-4 12.5-11 12.5z" fill="#f57c00"/>
      <path d="M16 20c-4 0-6.5-4-6-11 2.5 1 4.5 2.5 6 4.5 1.5-2 3.5-3.5 6-4.5.5 7-2 11-6 11z" fill="#ffa726"/>
      <ellipse cx="16" cy="13.5" rx="2.2" ry="1.6" fill="#ffd54f"/>`,

    ranunculus: `
      <path d="M16 31v-6M16 28l-4-3" stroke="#4f9e3a" stroke-width="1.6" stroke-linecap="round" fill="none"/>
      ${scallop(16, 14, 9, 3.4, 13, "#f4796a")}
      ${scallop(16, 14, 6.2, 2.8, 11, "#ff9a8a")}
      ${scallop(16, 14, 3.4, 2.2, 8, "#ffbcb1")}
      <circle cx="16" cy="14" r="1.8" fill="#ffd9d2"/>`,

    pansy: `
      <ellipse cx="11" cy="9" rx="6.5" ry="6" fill="#6a3fb5"/>
      <ellipse cx="21" cy="9" rx="6.5" ry="6" fill="#6a3fb5"/>
      <ellipse cx="7.5" cy="17" rx="5.5" ry="5" fill="#ffd54f"/>
      <ellipse cx="24.5" cy="17" rx="5.5" ry="5" fill="#ffd54f"/>
      <ellipse cx="16" cy="22.5" rx="7.5" ry="6.5" fill="#ffca28"/>
      <path d="M16 17.5l-3.5 5M16 17.5v6.5M16 17.5l3.5 5M16 17.5l-6.5 1M16 17.5l6.5 1" stroke="#4a2577" stroke-width="1.6" stroke-linecap="round"/>
      <circle cx="16" cy="17" r="1.6" fill="#fff59d"/>`,

    snapdragon: `
      <path d="M16 31V3" stroke="#4f9e3a" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M16 27l-5-3M16 24l5-3" stroke="#7cc85a" stroke-width="1.6" stroke-linecap="round"/>
      <g fill="#f06292" stroke="#c2185b" stroke-width=".7">
        <ellipse cx="12" cy="20" rx="4.2" ry="3.2"/><ellipse cx="20" cy="17" rx="4.2" ry="3.2"/>
        <ellipse cx="12.3" cy="13.5" rx="3.7" ry="2.9"/><ellipse cx="19.7" cy="10.5" rx="3.4" ry="2.7"/>
        <ellipse cx="13" cy="7.5" rx="3" ry="2.4"/><ellipse cx="17.5" cy="4.5" rx="2.4" ry="2"/>
      </g>
      <g fill="#ffd54f"><circle cx="10.5" cy="20.5" r="1"/><circle cx="21.5" cy="17.5" r="1"/><circle cx="11" cy="14" r=".9"/><circle cx="21" cy="11" r=".9"/></g>`,

    calendula: `
      <path d="M16 31V22" stroke="#4f9e3a" stroke-width="1.6" stroke-linecap="round"/>
      ${spiky(16, 14, 16, 13, 6.5, "#ff9800")}
      ${spiky(16, 14, 16, 9.5, 5, "#ffb300")}
      <circle cx="16" cy="14" r="4.6" fill="#a05a1c"/>
      <circle cx="16" cy="14" r="2.6" fill="#7a3f12"/>`,

    zinnia: `
      <path d="M16 31V22" stroke="#4f9e3a" stroke-width="1.6" stroke-linecap="round"/>
      ${petals(16, 14, 12, 12.5, 3.4, "#d81b60")}
      ${petals(16, 14, 10, 8.5, 2.8, "#f06292", 18)}
      <circle cx="16" cy="14" r="3.6" fill="#ffd54f"/>
      <circle cx="16" cy="14" r="1.8" fill="#8d4f1f"/>`,

    cosmos: `
      <path d="M16 31V22M16 27l-5-3.5" stroke="#4f9e3a" stroke-width="1.4" stroke-linecap="round" fill="none"/>
      ${petals(16, 14, 8, 13, 5, "#f48fb1")}
      ${petals(16, 14, 8, 10, 1.2, "#ec6a9c")}
      <circle cx="16" cy="14" r="3.4" fill="#fdd835"/>
      <circle cx="16" cy="14" r="1.6" fill="#f9a825"/>`,

    marigold: `
      <path d="M16 31V23" stroke="#4f9e3a" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M16 28l-4.5-3M16 27l4.5-3" stroke="#3f8f2e" stroke-width="1.4" stroke-linecap="round"/>
      ${scallop(16, 13, 9.5, 3.2, 13, "#ef6c00")}
      ${scallop(16, 13, 6.5, 2.6, 11, "#fb8c00")}
      ${scallop(16, 13, 3.5, 2, 8, "#ffa726")}
      <circle cx="16" cy="13" r="1.6" fill="#ffcc80"/>`,
  };

  function svg(name) {
    const body = ICONS[name];
    return body ? `<svg class="veg-icon" viewBox="0 0 32 32" aria-hidden="true">${body}</svg>` : "";
  }

  return { svg, names: Object.keys(ICONS) };
})();
