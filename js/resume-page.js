/*
 * resume.html: the plain, printable résumé ("📄 boring printable version").
 * Built from the same data as the RPG character sheet (data.js → resume).
 */
(function () {
  "use strict";

  const D = window.YVY;
  const R = D.resume;
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
  const section = (title, body) => (body ? `<section><h2>${esc(title)}</h2>${body}</section>` : "");
  const job = (j) => `<article class="rp-job">
      <header>
        <h3>${esc(j.org)}</h3>
        <p class="rp-when">${esc([j.place, j.dates].filter(Boolean).join(" | "))}</p>
        <p class="rp-role">${esc(j.role)}${j.ages ? ` | ${esc(j.ages)}` : ""}</p>
      </header>
      <ul>${j.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
    </article>`;

  const contact = [
    esc(R.location),
    D.email ? `<a href="mailto:${esc(D.email)}">${esc(D.email)}</a>` : "",
    R.site ? `<a href="https://${esc(R.site)}/">${esc(R.site)}</a>` : "",
  ].filter(Boolean).join(" | ");

  const work = R.jobs.filter((j) => j.section !== "childcare");
  const care = R.jobs.filter((j) => j.section === "childcare");
  const projects = R.projects.filter((p) => !p.recognition);
  const recognition = R.projects.filter((p) => p.recognition);

  document.getElementById("resume").innerHTML = `
    <header class="rp-head">
      <h1>${esc(R.name)}</h1>
      <p class="rp-contact">${contact}</p>
      <p class="rp-headline">${esc(R.headline)}</p>
    </header>
    ${section("Professional Summary", `<p>${esc(R.summary)}</p>`)}
    ${section("Core Competencies", `<ul class="rp-cols">${R.skills.map((s) => `<li>${esc(s.name)}</li>`).join("")}</ul>`)}
    ${section("Professional Experience", work.map(job).join(""))}
    ${section("Professional Nanny & Childcare Experience", care.map(job).join(""))}
    ${section("Selected Projects & Community Leadership", projects.length ? `<ul>${projects.map((p) =>
      `<li><b>${esc(p.name)}</b>: ${esc(p.text)}</li>`).join("")}</ul>` : "")}
    ${section("Education", R.education.map((e) =>
      `<div class="rp-school"><h3>${esc(e.school)}</h3><ul>${e.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul></div>`).join(""))}
    ${section("Selected Certifications & Professional Development", R.certifications.map((c) =>
      `<p><b>${esc(c.area)}:</b> ${esc(c.text)}</p>`).join(""))}
    ${section("Languages", `<p>${R.languages.map((l) => `${esc(l.name)}: ${esc(l.level)}`).join(" · ")}</p>`)}
    ${section("Community Involvement & Recognition", recognition.length ? `<ul>${recognition.map((p) =>
      `<li>${esc(p.name)}${p.text ? `: ${esc(p.text)}` : ""}</li>`).join("")}</ul>` : "")}`;

  document.getElementById("printBtn").addEventListener("click", () => window.print());
})();
