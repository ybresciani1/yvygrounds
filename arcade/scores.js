/*
 * YvyGrounds arcade high scores (shared by the games in arcade/).
 * After a round, a game calls:
 *   YvyScores.show({ game: "tomato-tussle", score: 1234, onPlayAgain, onClose })
 * The box appears over the game screen: if the score makes the top 10 it asks for
 * 3-letter initials, then shows the board. If the API can't be reached, nothing shows.
 * Games list their scoring in society-api/src/index.js → GAMES ("high" = most points
 * wins, "low" = fastest time in ms wins; then pass format to show it nicely).
 * While the box is open, games should ignore their own keys: check YvyScores.isOpen().
 */
window.YvyScores = (function () {
  "use strict";

  const API = ["localhost", "127.0.0.1"].includes(location.hostname) ? "http://localhost:8787" : "https://api.yvygrounds.com";
  const KEY = "yvy-initials";
  let box = null;

  const store = {
    get() { try { return localStorage.getItem(KEY) || ""; } catch (e) { return ""; } },
    set(v) { try { localStorage.setItem(KEY, v); } catch (e) { /* storage blocked */ } },
  };
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };
  const button = (label, cls, onClick) => {
    const b = el("button", cls, label);
    b.type = "button";
    b.addEventListener("click", onClick);
    return b;
  };

  async function api(path, options) {
    const res = await fetch(API + path, options);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Couldn't reach the high scores.");
    return data;
  }

  function close(opts) {
    if (!box) return;
    box.remove();
    box = null;
    if (opts && opts.onClose) opts.onClose();
  }

  function frame(opts, title) {
    if (box) box.remove();
    box = el("div", "scores");
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", title);
    // Keys typed here (initials!) shouldn't reach the game; Esc closes the box
    box.addEventListener("keydown", (e) => {
      e.stopPropagation();
      if (e.key === "Escape") { e.preventDefault(); close(opts); }
    });
    box.addEventListener("pointerdown", (e) => e.stopPropagation());
    const panel = el("div", "scores-panel");
    panel.appendChild(el("p", "scores-title", title));
    box.appendChild(panel);
    (document.querySelector(".stage") || document.body).appendChild(box);
    return panel;
  }

  function board(opts, scores, highlight) {
    const fmt = opts.format || String;
    const panel = frame(opts, "HIGH SCORES");
    if (!scores.length) {
      panel.appendChild(el("p", "scores-note", "No scores yet. Be the first!"));
    } else {
      const list = el("ol", "scores-list");
      scores.forEach((s, i) => {
        const li = el("li", i + 1 === highlight ? "is-you" : "");
        li.appendChild(el("span", "scores-rank", `${i + 1}.`));
        li.appendChild(el("span", "scores-initials", s.initials));
        li.appendChild(el("span", "scores-score", fmt(s.score)));
        list.appendChild(li);
      });
      panel.appendChild(list);
    }
    panel.appendChild(el("p", "scores-note", highlight ? `You're #${highlight}!` : `Your score: ${fmt(opts.score)}`));
    const row = el("div", "scores-buttons");
    if (opts.onPlayAgain) row.appendChild(button("Play again", "", () => { close(); opts.onPlayAgain(); }));
    row.appendChild(button("Close", "alt", () => close(opts)));
    panel.appendChild(row);
    row.querySelector("button").focus({ preventScroll: true });
  }

  function enter(opts) {
    const fmt = opts.format || String;
    const panel = frame(opts, "NEW HIGH SCORE!");
    panel.appendChild(el("p", "scores-big", fmt(opts.score)));
    const form = el("form", "scores-form");
    const label = el("label", "scores-label", "ENTER YOUR INITIALS");
    const input = el("input", "scores-input");
    input.maxLength = 3;
    input.autocomplete = "off";
    input.spellcheck = false;
    input.setAttribute("autocapitalize", "characters");
    input.setAttribute("aria-label", "Your 3-letter initials");
    input.value = store.get();
    input.addEventListener("input", () => { input.value = input.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3); });
    label.appendChild(input);
    form.appendChild(label);
    const status = el("p", "scores-status");
    status.setAttribute("role", "status");
    const row = el("div", "scores-buttons");
    const save = el("button", "", "Save");
    save.type = "submit";
    row.appendChild(save);
    row.appendChild(button("Skip", "alt", () => close(opts)));
    form.appendChild(row);
    form.appendChild(status);
    panel.appendChild(form);
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const initials = input.value;
      if (!/^[A-Z]{3}$/.test(initials)) { status.textContent = "Pick 3 letters, A to Z."; input.focus(); return; }
      save.disabled = true;
      status.textContent = "Saving…";
      try {
        const res = await api("/api/scores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ game: opts.game, initials, score: opts.score }),
        });
        store.set(initials);
        board(opts, res.scores || [], res.rank);
      } catch (err) {
        status.textContent = err.message;
        save.disabled = false;
      }
    });
    input.focus({ preventScroll: true });
    input.select();
  }

  async function show(opts) {
    if (!opts || !opts.game || !(opts.score > 0)) return;
    let scores;
    try { scores = (await api(`/api/scores?game=${encodeURIComponent(opts.game)}`)).scores || []; } catch (e) { return; }
    const low = opts.better === "low";
    const last = scores[scores.length - 1];
    const makesIt = scores.length < 10 || (low ? opts.score < last.score : opts.score > last.score);
    if (makesIt) enter(opts); else board(opts, scores, 0);
  }

  return { show, isOpen: () => Boolean(box) };
})();
