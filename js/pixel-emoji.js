/*
 * Pixel emoji: every emoji on the page is redrawn on a tiny 16×16 canvas and shown scaled up
 * with crisp, blocky pixels (NES style). Turn it off with data.js → pixelEmoji: false.
 * Skips the Garden Almanac (#growing), form fields, SVG, and anything inside .no-pixel.
 * Text symbols like ♥ ★ ✿ stay text (they keep their CSS colors); only real emoji are swapped.
 * Content added later (guestbook pages, pop-ups, falling leaves...) is caught by a MutationObserver.
 */
(function () {
  "use strict";

  if (window.YVY && window.YVY.pixelEmoji === false) return;

  const GRID = 16;   // canvas size in pixels: smaller = chunkier
  const SKIP = "#growing, input, textarea, select, option, script, style, noscript, svg, canvas, iframe, .no-pixel, .px-emoji";
  // An emoji: one with emoji presentation (or a symbol + FE0F), plus skin tones / ZWJ parts
  const EMOJI = /(?:\p{Emoji_Presentation}|\p{Extended_Pictographic}️)(?:\p{Emoji_Modifier}|️|‍(?:\p{Emoji_Presentation}|\p{Extended_Pictographic}️?))*/gu;
  const HAS_EMOJI = /\p{Emoji_Presentation}|️/u;
  const cache = new Map();

  function pixelUrl(emoji) {
    if (cache.has(emoji)) return cache.get(emoji);
    const c = document.createElement("canvas");
    const ctx = c.getContext("2d");
    const font = `${GRID - 2}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji","Segoe UI Symbol",sans-serif`;
    ctx.font = font;
    // ZWJ sequences a device can't join draw wider, so size the canvas to fit
    const w = Math.max(GRID, Math.ceil(ctx.measureText(emoji).width));
    c.width = w;
    c.height = GRID;
    ctx.font = font;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(emoji, w / 2, GRID / 2 + 1);
    const out = { url: c.toDataURL("image/png"), ratio: w / GRID };
    cache.set(emoji, out);
    return out;
  }

  function swap(textNode) {
    const text = textNode.nodeValue;
    if (!text || !HAS_EMOJI.test(text)) return;
    const parent = textNode.parentElement;
    if (!parent || parent.closest(SKIP)) return;
    EMOJI.lastIndex = 0;
    if (!EMOJI.test(text)) return;
    EMOJI.lastIndex = 0;
    const frag = document.createDocumentFragment();
    let last = 0;
    let m;
    while ((m = EMOJI.exec(text))) {
      if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
      const { url, ratio } = pixelUrl(m[0]);
      const img = document.createElement("img");
      img.className = "px-emoji";
      img.src = url;
      img.alt = m[0];          // screen readers and copy/paste still get the emoji
      img.draggable = false;
      if (ratio > 1) img.style.width = `${(1.15 * ratio).toFixed(2)}em`;
      frag.appendChild(img);
      last = m.index + m[0].length;
    }
    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
    textNode.replaceWith(frag);
  }

  function scan(root) {
    if (root.nodeType === 3) { swap(root); return; }
    if (root.nodeType !== 1 || root.closest(SKIP)) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (HAS_EMOJI.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP),
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(swap);
  }

  // Batch changes once per frame (the typewriter dialog and tickers change a lot)
  let queued = new Set();
  let scheduled = false;
  const flush = () => {
    scheduled = false;
    const list = [...queued];
    queued = new Set();
    list.forEach((n) => { if (n.isConnected) scan(n); });
  };
  new MutationObserver((records) => {
    records.forEach((r) => {
      if (r.type === "characterData") queued.add(r.target);
      r.addedNodes.forEach((n) => { if (!(n.nodeType === 1 && n.classList.contains("px-emoji"))) queued.add(n); });
    });
    if (queued.size && !scheduled) { scheduled = true; requestAnimationFrame(flush); }
  }).observe(document.body, { childList: true, subtree: true, characterData: true });

  scan(document.body);
})();
