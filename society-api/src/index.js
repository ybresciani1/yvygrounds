/*
 * YvyGrounds Garden Society API (Cloudflare Worker + D1 database + KV photo storage)
 *
 * Public:
 *   GET  /api/feed?kind=journal|project|compost[&project=ID][&limit=N]   approved posts only
 *   GET  /api/projects                                                     active + done projects
 *   GET  /api/compost                                                      compost temperature log (approved)
 *   GET  /api/photo/<key>                                                  photo of an approved post
 *   POST /api/submit   (multipart, needs SOCIETY_PASSCODE)                 new post, compost temp or feeding, waits for approval
 *   GET  /api/garden                                                       garden map: feedings and crossed-off to-dos
 *   GET  /api/guestbook                                                    approved guestbook entries
 *   POST /api/guestbook  { name, role?, avatar?, message, website, ms }    sign it (no passcode), waits for approval
 *   POST /api/visit                                                         count a visit, returns { visitor: N } (total visits)
 *   GET  /api/scores?game=G                                                 arcade top 10
 *   POST /api/scores     { game, initials, score }                          add a high score (3-letter initials)
 *   GET  /api/hall                                                          Rabbit & Frog hall of fame
 *   GET  /api/hall-photo/<key>                                              a hall of fame photo
 *   GET  /api/pets                                                          community pet counts per critter
 *   POST /api/pets       { pets: { peaches: 3, riot: 1 } }                  add pets (sent in small batches)
 *
 * Admin (header "Authorization: Bearer <ADMIN_PASSWORD>"):
 *   GET    /api/admin/posts?status=pending|approved|rejected
 *   PATCH  /api/admin/posts/<id>        { status?, title?, body?, author?, kind?, project_id? }
 *   DELETE /api/admin/posts/<id>        removes the post and its photos
 *   GET    /api/admin/photo/<key>       any photo (for reviewing pending posts)
 *   GET    /api/admin/projects          all projects, including archived
 *   POST   /api/admin/projects          { name, emoji?, description? }
 *   PATCH  /api/admin/projects/<id>     { name?, emoji?, description?, status? }
 *   POST   /api/admin/compost           { logged_on, temp_f, pile?, turned?, moisture?, notes? }
 *   PATCH  /api/admin/compost/<id>      { status }                     approve/reject a member's reading
 *   DELETE /api/admin/compost/<id>
 *   GET    /api/admin/garden-pending   member temps and feedings waiting for review
 *   POST   /api/admin/feed             { bed, plan_ids[], fed_on, notes? }  log a feeding
 *   PATCH  /api/admin/feed/<id>        { status }                     approve/reject a member's feeding
 *   DELETE /api/admin/feed/<id>
 *   POST   /api/admin/todo             { bed, item, done }            cross a to-do off (or back on)
 *   GET    /api/admin/guestbook?status=pending|approved|rejected
 *   PATCH  /api/admin/guestbook/<id>    { status?, name?, role?, avatar?, message? }
 *   DELETE /api/admin/guestbook/<id>
 *   GET    /api/admin/scores?game=G     top 50 for one game, with ids
 *   DELETE /api/admin/scores/<id>
 *   POST   /api/admin/hall              multipart { name, grade, finished_on?, caption?, photo? }
 *   DELETE /api/admin/hall/<id>         removes the student and their photo
 */

const MAX_PHOTOS = 3;
const MAX_PHOTO_BYTES = 6 * 1024 * 1024;
const KINDS = ["journal", "project", "compost"];
// "Submit an entry" can also send a compost temperature or a feeding (garden map); they wait for review too
const LOG_KINDS = ["temp", "feed"];
// Spot, feedPlan and to-do ids from data.js → gardenMap (bed5, greens, a to-do's text hash...)
const SLUG = /^[a-z0-9-]{1,30}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const LIMITS = { author: 40, title: 120, body: 4000, name: 80, emoji: 8, description: 400, pile: 40, moisture: 40, notes: 600 };
const AUTH_WINDOW_MS = 15 * 60 * 1000;
const AUTH_MAX_FAILURES = 8;
// Guestbook: anyone can sign, so keep spam down
const GB_LIMITS = { name: 40, role: 40, message: 600 };
const GB_AVATARS = ["chicken", "flower", "heart", "sprout", "tomato", "silly", "bowl", "mystery"];
const GB_PER_HOUR = 3;          // signings per visitor per hour
const GB_MAX_PENDING = 200;     // stop taking new ones while this many wait for review
const STATUSES = ["pending", "approved", "rejected"];
// Arcade games with a leaderboard. order "high" = more points wins; "low" = fastest time (ms) wins.
// min/max throw out impossible scores.
const GAMES = {
  "tomato-tussle": { order: "high", min: 1, max: 20000 },
  "bowl-brawl": { order: "low", min: 90, max: 3000 },
};
const SCORES_PER_HOUR = 20;
// 3-letter initials that aren't allowed on the board
const BAD_INITIALS = new Set(["ASS", "FUK", "FUC", "FCK", "FUQ", "SEX", "CUM", "DIK", "DIC", "KKK", "NIG", "NGR", "FAG", "TIT", "WTF", "STD", "GAY",
  "JEW", "NAZ", "HOE", "SUK", "SUC", "PUS", "VAG", "XXX", "KYS", "DMN", "SHT", "SHI", "POS", "PEN", "GOD", "HIV", "LSD", "THC", "ANL", "ANS",
  "BCH", "BJS", "COK", "CUK", "DIE", "FAP", "GOK", "JIZ", "KIL", "NUT", "PRN", "RAP", "SUX", "TWT", "WAP", "WTH"]);
const GRADES = ["TK", "K", "1", "2", "3", "4", "5", "6", "7", "8"];
// Critter Corner pet counter. Keys are the critter's name in lowercase letters (see js/extras.js → petKey).
// Add a new critter here when it joins Critter Corner in data.js.
const CRITTERS = ["riot", "beyonce", "snow", "peaches", "bojjii", "lychee", "penny"];
const PETS_PER_BATCH = 60;      // one batch covers a few seconds of clicking
const PETS_PER_HOUR = 600;      // per visitor

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const cors = corsHeaders(origin, env);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    try {
      const res = await route(request, env);
      for (const [k, v] of Object.entries(cors)) res.headers.set(k, v);
      return res;
    } catch (err) {
      if (err instanceof HttpError) return json({ error: err.message }, err.status, cors);
      console.error(err);
      return json({ error: "Something went wrong. Please try again." }, 500, cors);
    }
  },
};

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

function corsHeaders(origin, env) {
  const allowed = String(env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
  const h = { "Vary": "Origin" };
  if (allowed.includes(origin)) {
    h["Access-Control-Allow-Origin"] = origin;
    h["Access-Control-Allow-Methods"] = "GET, POST, PATCH, DELETE, OPTIONS";
    h["Access-Control-Allow-Headers"] = "Content-Type, Authorization";
    h["Access-Control-Max-Age"] = "86400";
  }
  return h;
}

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...headers },
  });
}

async function route(request, env) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, "");
  const m = request.method;

  if (m === "GET" && path === "/api/feed") return getFeed(url, env);
  if (m === "GET" && path === "/api/projects") return getProjects(env, false);
  if (m === "GET" && path === "/api/compost") return getCompost(env);
  if (m === "GET" && path === "/api/garden") return getGarden(env);
  if (m === "GET" && path.startsWith("/api/photo/")) return getPhoto(env, path.slice("/api/photo/".length), false);
  if (m === "POST" && path === "/api/submit") return submit(request, env);
  if (m === "GET" && path === "/api/guestbook") return getGuestbook(env);
  if (m === "POST" && path === "/api/guestbook") return signGuestbook(request, env);
  if (m === "POST" && path === "/api/visit") return countVisit(request, env);
  if (m === "GET" && path === "/api/scores") return getScores(url, env);
  if (m === "POST" && path === "/api/scores") return addScore(request, env);
  if (m === "GET" && path === "/api/hall") return getHall(env);
  if (m === "GET" && path.startsWith("/api/hall-photo/")) return getHallPhoto(env, path.slice("/api/hall-photo/".length));
  if (m === "GET" && path === "/api/pets") return getPets(env);
  if (m === "POST" && path === "/api/pets") return addPets(request, env);

  if (path.startsWith("/api/admin/")) {
    await requireAdmin(request, env);
    const rest = path.slice("/api/admin/".length);
    const [what, id] = rest.split("/");
    if (what === "check" && m === "GET") return json({ ok: true });
    if (what === "posts" && m === "GET" && !id) return adminListPosts(url, env);
    if (what === "posts" && m === "PATCH" && id) return adminUpdatePost(request, env, id);
    if (what === "posts" && m === "DELETE" && id) return adminDeletePost(env, id);
    if (what === "photo" && m === "GET") return getPhoto(env, rest.slice("photo/".length), true);
    if (what === "projects" && m === "GET" && !id) return getProjects(env, true);
    if (what === "projects" && m === "POST" && !id) return adminCreateProject(request, env);
    if (what === "projects" && m === "PATCH" && id) return adminUpdateProject(request, env, id);
    if (what === "compost" && m === "POST" && !id) return adminAddCompost(request, env);
    if (what === "compost" && m === "PATCH" && id) return adminReviewLog(request, env, "compost_logs", id);
    if (what === "compost" && m === "DELETE" && id) return adminDeleteCompost(env, id);
    if (what === "garden-pending" && m === "GET") return adminGardenPending(env);
    if (what === "feed" && m === "POST" && !id) return adminAddFeed(request, env);
    if (what === "feed" && m === "PATCH" && id) return adminReviewLog(request, env, "feed_logs", id);
    if (what === "feed" && m === "DELETE" && id) return adminDeleteFeed(env, id);
    if (what === "todo" && m === "POST" && !id) return adminSetTodo(request, env);
    if (what === "guestbook" && m === "GET" && !id) return adminListGuestbook(url, env);
    if (what === "guestbook" && m === "PATCH" && id) return adminUpdateGuestbook(request, env, id);
    if (what === "guestbook" && m === "DELETE" && id) return adminDeleteGuestbook(env, id);
    if (what === "scores" && m === "GET" && !id) return adminListScores(url, env);
    if (what === "scores" && m === "DELETE" && id) return adminDeleteScore(env, id);
    if (what === "hall" && m === "POST" && !id) return adminAddHall(request, env);
    if (what === "hall" && m === "DELETE" && id) return adminDeleteHall(env, id);
  }
  throw new HttpError(404, "Not found.");
}

/* ---------- helpers ---------- */

const now = () => new Date().toISOString();
const newId = () => crypto.randomUUID();

function clean(value, max) {
  return String(value ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, max);
}

async function readJson(request) {
  try { return await request.json(); } catch { throw new HttpError(400, "Expected JSON."); }
}

// Compare secrets without leaking timing (hash both to equal length first)
async function sameSecret(given, expected) {
  if (!expected) return false;
  const enc = new TextEncoder();
  const [a, b] = await Promise.all([
    crypto.subtle.digest("SHA-256", enc.encode(String(given))),
    crypto.subtle.digest("SHA-256", enc.encode(String(expected))),
  ]);
  return crypto.subtle.timingSafeEqual(a, b);
}

async function requireAdmin(request, env) {
  const ip = request.headers.get("CF-Connecting-IP") || "local";
  const since = Date.now() - AUTH_WINDOW_MS;
  const { n } = await env.DB.prepare("SELECT COUNT(*) AS n FROM auth_failures WHERE ip = ? AND at > ?").bind(ip, since).first();
  if (n >= AUTH_MAX_FAILURES) throw new HttpError(429, "Too many wrong passwords. Try again in 15 minutes.");
  const token = (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  if (!(await sameSecret(token, env.ADMIN_PASSWORD))) {
    await env.DB.batch([
      env.DB.prepare("INSERT INTO auth_failures (ip, at) VALUES (?, ?)").bind(ip, Date.now()),
      env.DB.prepare("DELETE FROM auth_failures WHERE at < ?").bind(since),
    ]);
    throw new HttpError(401, "Wrong admin password.");
  }
}

// Only accept real JPEG / PNG / WebP files (checked by their first bytes, not the name)
function imageType(bytes) {
  const b = new Uint8Array(bytes.slice(0, 12));
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return "image/webp";
  return null;
}

const EXT = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

// Photo links are paths ("/api/photo/..."); the site adds its API address in front
function publicPost(row) {
  const photos = JSON.parse(row.photos || "[]");
  return {
    id: row.id,
    kind: row.kind,
    projectId: row.project_id,
    author: row.author,
    title: row.title,
    body: row.body,
    photos: photos.map((key) => `/api/photo/${key}`),
    createdAt: row.created_at,
  };
}

/* ---------- public ---------- */

async function getFeed(url, env) {
  const kind = url.searchParams.get("kind");
  if (!KINDS.includes(kind)) throw new HttpError(400, "Unknown kind.");
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit")) || 20));
  const project = url.searchParams.get("project");
  const stmt = project
    ? env.DB.prepare("SELECT * FROM posts WHERE status = 'approved' AND kind = ? AND project_id = ? ORDER BY created_at DESC LIMIT ?").bind(kind, project, limit)
    : env.DB.prepare("SELECT * FROM posts WHERE status = 'approved' AND kind = ? ORDER BY created_at DESC LIMIT ?").bind(kind, limit);
  const { results } = await stmt.all();
  return json({ posts: results.map((r) => publicPost(r)) });
}

async function getProjects(env, includeArchived) {
  const { results } = await env.DB.prepare(
    includeArchived
      ? "SELECT * FROM projects ORDER BY status = 'archived', created_at"
      : "SELECT * FROM projects WHERE status != 'archived' ORDER BY status = 'done', created_at"
  ).all();
  return json({ projects: results });
}

async function getCompost(env) {
  const { results } = await env.DB.prepare(
    "SELECT id, logged_on, pile, temp_f, turned, moisture, notes FROM compost_logs WHERE status = 'approved' ORDER BY logged_on, created_at"
  ).all();
  return json({ logs: results });
}

async function getPhoto(env, key, isAdmin) {
  const m = /^posts\/([0-9a-f-]{36})\/(\d)\.(jpg|png|webp)$/.exec(key);
  if (!m) throw new HttpError(404, "Not found.");
  if (!isAdmin) {
    const row = await env.DB.prepare("SELECT status FROM posts WHERE id = ?").bind(m[1]).first();
    if (!row || row.status !== "approved") throw new HttpError(404, "Not found.");
  }
  const { value, metadata } = await env.PHOTOS.getWithMetadata(key, { type: "stream" });
  if (!value) throw new HttpError(404, "Not found.");
  return new Response(value, {
    headers: {
      "Content-Type": (metadata && metadata.contentType) || "image/jpeg",
      "Cache-Control": isAdmin ? "private, no-store" : "public, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

async function submit(request, env) {
  let form;
  try { form = await request.formData(); } catch { throw new HttpError(400, "Please send the form again."); }
  if (!(await sameSecret(clean(form.get("passcode"), 100), env.SOCIETY_PASSCODE))) {
    throw new HttpError(403, "That passcode isn't right. Ask Yvy for the Garden Society passcode.");
  }
  const kind = clean(form.get("kind"), 20);
  if (LOG_KINDS.includes(kind)) return submitLog(form, kind, env);
  if (!KINDS.includes(kind)) throw new HttpError(400, "Pick journal, project or compost.");
  const author = clean(form.get("author"), LIMITS.author);
  const title = clean(form.get("title"), LIMITS.title);
  const body = clean(form.get("body"), LIMITS.body);
  if (!author) throw new HttpError(400, "Add your first name or initials.");
  if (!title && !body) throw new HttpError(400, "Add a title or a few words.");

  let projectId = null;
  if (kind === "project") {
    projectId = clean(form.get("project_id"), 64);
    const p = projectId && (await env.DB.prepare("SELECT id FROM projects WHERE id = ? AND status != 'archived'").bind(projectId).first());
    if (!p) throw new HttpError(400, "Pick which project this is for.");
  }

  const files = form.getAll("photos").filter((f) => f && typeof f === "object" && f.size > 0);
  if (files.length > MAX_PHOTOS) throw new HttpError(400, `Up to ${MAX_PHOTOS} photos, please.`);
  const id = newId();
  const keys = [];
  for (const [i, file] of files.entries()) {
    if (file.size > MAX_PHOTO_BYTES) throw new HttpError(400, "One of the photos is too big.");
    const bytes = await file.arrayBuffer();
    const type = imageType(bytes);
    if (!type) throw new HttpError(400, "Photos need to be JPG, PNG or WebP.");
    const key = `posts/${id}/${i}.${EXT[type]}`;
    await env.PHOTOS.put(key, bytes, { metadata: { contentType: type } });
    keys.push(key);
  }

  await env.DB.prepare(
    "INSERT INTO posts (id, kind, project_id, author, title, body, photos, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)"
  ).bind(id, kind, projectId, author, title, body, JSON.stringify(keys), now()).run();
  return json({ ok: true, message: "Thanks! Yvy will take a look before it shows up on the site." }, 201);
}

// A short hash of the visitor's address (never the address itself), for rate limits
async function visitorHash(request, salt) {
  const ip = request.headers.get("CF-Connecting-IP") || "local";
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`yvygrounds-${salt}:${ip}`));
  return [...new Uint8Array(digest)].slice(0, 12).map((b) => b.toString(16).padStart(2, "0")).join("");
}

/* ---------- hit counter ---------- */

// The site calls this once per browser and remembers the number. The same address only
// counts once every 12 hours, so reloads or a cleared browser don't run the number up.
// Every visit counts, including people coming back. Reloads and clicking around within
// VISIT_GAP_MS are the same visit, so refreshing can't pump the number up.
const VISIT_GAP_MS = 30 * 60 * 1000;
async function countVisit(request, env) {
  const who = await visitorHash(request, "visit");
  const since = Date.now() - VISIT_GAP_MS;
  const recent = await env.DB.prepare("SELECT 1 FROM visitor_hits WHERE who = ? AND at > ? LIMIT 1").bind(who, since).first();
  if (recent) {
    const row = await env.DB.prepare("SELECT value FROM counters WHERE name = 'visitors'").first();
    return json({ visitor: row ? row.value : 0 });
  }
  const [row] = await env.DB.batch([
    env.DB.prepare("UPDATE counters SET value = value + 1 WHERE name = 'visitors' RETURNING value"),
    env.DB.prepare("INSERT INTO visitor_hits (who, at) VALUES (?, ?)").bind(who, Date.now()),
    env.DB.prepare("DELETE FROM visitor_hits WHERE at < ?").bind(since),
  ]);
  return json({ visitor: row.results[0] ? row.results[0].value : 0 });
}

/* ---------- arcade high scores ---------- */

function gameOf(name) {
  const game = GAMES[name];
  if (!game) throw new HttpError(400, "Unknown game.");
  return game;
}

async function topScores(env, name, limit) {
  const game = gameOf(name);
  const { results } = await env.DB.prepare(
    `SELECT id, initials, score, created_at FROM scores WHERE game = ? ORDER BY score ${game.order === "low" ? "ASC" : "DESC"}, created_at ASC LIMIT ?`
  ).bind(name, limit).all();
  return results;
}
const publicScore = (r) => ({ initials: r.initials, score: r.score, createdAt: r.created_at });

async function getScores(url, env) {
  const name = url.searchParams.get("game");
  return json({ scores: (await topScores(env, name, 10)).map(publicScore) });
}

async function addScore(request, env) {
  const data = await readJson(request);
  const name = clean(data.game, 40);
  const game = gameOf(name);
  const initials = clean(data.initials, 3).toUpperCase();
  const score = Math.round(Number(data.score));
  if (!/^[A-Z]{3}$/.test(initials)) throw new HttpError(400, "Pick 3 letters, A to Z.");
  if (BAD_INITIALS.has(initials)) throw new HttpError(400, "Those letters aren't allowed. Try different ones!");
  if (!Number.isFinite(score) || score < game.min || score > game.max) throw new HttpError(400, "That score doesn't look right.");

  const who = await visitorHash(request, "scores");
  const hourAgo = Date.now() - 60 * 60 * 1000;
  const { n } = await env.DB.prepare("SELECT COUNT(*) AS n FROM score_hits WHERE who = ? AND at > ?").bind(who, hourAgo).first();
  if (n >= SCORES_PER_HOUR) throw new HttpError(429, "Whoa, lots of high scores! Try again in a bit.");

  const id = newId();
  await env.DB.batch([
    env.DB.prepare("INSERT INTO scores (id, game, initials, score, created_at) VALUES (?, ?, ?, ?, ?)").bind(id, name, initials, score, now()),
    env.DB.prepare("INSERT INTO score_hits (who, at) VALUES (?, ?)").bind(who, Date.now()),
    env.DB.prepare("DELETE FROM score_hits WHERE at < ?").bind(hourAgo),
  ]);
  const top = await topScores(env, name, 10);
  const rank = top.findIndex((r) => r.id === id) + 1;   // 0 = didn't make the top 10
  return json({ ok: true, rank, scores: top.map(publicScore) }, 201);
}

async function adminListScores(url, env) {
  const name = url.searchParams.get("game");
  const rows = await topScores(env, name, 50);
  return json({ scores: rows.map((r) => ({ id: r.id, ...publicScore(r) })) });
}

async function adminDeleteScore(env, id) {
  await env.DB.prepare("DELETE FROM scores WHERE id = ?").bind(id).run();
  return json({ ok: true });
}

/* ---------- Critter Corner pet counter ---------- */

async function petCounts(env) {
  const { results } = await env.DB.prepare("SELECT key, count FROM pets").all();
  const counts = Object.fromEntries(CRITTERS.map((k) => [k, 0]));
  results.forEach((r) => { if (r.key in counts) counts[r.key] = r.count; });
  return { counts, total: Object.values(counts).reduce((a, b) => a + b, 0) };
}

async function getPets(env) {
  return json(await petCounts(env));
}

// The site sends a batch like { pets: { peaches: 3, riot: 1 } } every few seconds of petting.
// Each visitor can add up to PETS_PER_HOUR an hour; anything over that is quietly dropped.
async function addPets(request, env) {
  const data = await readJson(request);
  const batch = data && typeof data.pets === "object" && data.pets ? data.pets : {};
  const adds = [];
  let n = 0;
  for (const key of CRITTERS) {
    const k = Math.floor(Number(batch[key]) || 0);
    if (k > 0) { adds.push([key, k]); n += k; }
  }
  if (!n) throw new HttpError(400, "No pets to add.");
  if (n > PETS_PER_BATCH) throw new HttpError(400, "That's a lot of pets at once!");

  const who = await visitorHash(request, "pets");
  const hourAgo = Date.now() - 60 * 60 * 1000;
  const { used } = await env.DB.prepare("SELECT COALESCE(SUM(n), 0) AS used FROM pet_hits WHERE who = ? AND at > ?").bind(who, hourAgo).first();
  if (used + n <= PETS_PER_HOUR) {
    await env.DB.batch([
      ...adds.map(([key, k]) => env.DB.prepare(
        "INSERT INTO pets (key, count) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET count = count + excluded.count"
      ).bind(key, k)),
      env.DB.prepare("INSERT INTO pet_hits (who, n, at) VALUES (?, ?, ?)").bind(who, n, Date.now()),
      env.DB.prepare("DELETE FROM pet_hits WHERE at < ?").bind(hourAgo),
    ]);
  }
  return json(await petCounts(env));
}

/* ---------- Rabbit & Frog hall of fame ---------- */

const publicHall = (r) => ({
  id: r.id, name: r.name, grade: r.grade, finishedOn: r.finished_on, caption: r.caption,
  photo: r.photo ? `/api/hall-photo/${r.photo}` : null,
});

async function getHall(env) {
  const { results } = await env.DB.prepare("SELECT * FROM hall ORDER BY finished_on, created_at").all();
  return json({ students: results.map(publicHall) });
}

async function getHallPhoto(env, key) {
  if (!/^hall\/[0-9a-f-]{36}\.(jpg|png|webp)$/.test(key)) throw new HttpError(404, "Not found.");
  const { value, metadata } = await env.PHOTOS.getWithMetadata(key, { type: "stream" });
  if (!value) throw new HttpError(404, "Not found.");
  return new Response(value, {
    headers: {
      "Content-Type": (metadata && metadata.contentType) || "image/jpeg",
      "Cache-Control": "public, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

async function adminAddHall(request, env) {
  let form;
  try { form = await request.formData(); } catch { throw new HttpError(400, "Please send the form again."); }
  const name = clean(form.get("name"), 40);
  const grade = clean(form.get("grade"), 4).toUpperCase();
  const finishedOn = clean(form.get("finished_on"), 10);
  const caption = clean(form.get("caption"), 200);
  if (!name) throw new HttpError(400, "Add the student's first name and last initial.");
  if (!GRADES.includes(grade)) throw new HttpError(400, "Pick a grade.");
  if (finishedOn && !/^\d{4}-\d{2}-\d{2}$/.test(finishedOn)) throw new HttpError(400, "Pick a date.");

  const id = newId();
  let key = "";
  const file = form.get("photo");
  if (file && typeof file === "object" && file.size > 0) {
    if (file.size > MAX_PHOTO_BYTES) throw new HttpError(400, "That photo is too big.");
    const bytes = await file.arrayBuffer();
    const type = imageType(bytes);
    if (!type) throw new HttpError(400, "Photos need to be JPG, PNG or WebP.");
    key = `hall/${id}.${EXT[type]}`;
    await env.PHOTOS.put(key, bytes, { metadata: { contentType: type } });
  }
  await env.DB.prepare("INSERT INTO hall (id, name, grade, finished_on, photo, caption, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .bind(id, name, grade, finishedOn, key, caption, now()).run();
  return json({ ok: true, id }, 201);
}

async function adminDeleteHall(env, id) {
  const row = await env.DB.prepare("SELECT photo FROM hall WHERE id = ?").bind(id).first();
  if (!row) throw new HttpError(404, "Student not found.");
  if (row.photo) await env.PHOTOS.delete(row.photo);
  await env.DB.prepare("DELETE FROM hall WHERE id = ?").bind(id).run();
  return json({ ok: true });
}

/* ---------- guestbook ---------- */

const publicEntry = (row) => ({
  id: row.id, name: row.name, role: row.role, avatar: row.avatar, message: row.message, createdAt: row.created_at,
});

async function getGuestbook(env) {
  const { results } = await env.DB.prepare(
    "SELECT * FROM guestbook WHERE status = 'approved' ORDER BY created_at DESC LIMIT 100"
  ).all();
  return json({ entries: results.map(publicEntry) });
}

// Links, emails and phone numbers aren't allowed (spam, and kids' privacy)
function hasContactInfo(text) {
  return /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|ru|xyz|info|biz|co|me|ly)\b)/i.test(text) ||
    /[^\s@]+@[^\s@]+\.[a-z]{2,}/i.test(text) ||
    /(\d[\s().-]*){7,}/.test(text);
}

async function signGuestbook(request, env) {
  const data = await readJson(request);
  // Spam robots fill in the hidden "website" box or send the form instantly: say thanks, save nothing
  const thanks = json({ ok: true, message: "Thanks for signing! Yvy will read it before it shows up. ♥" }, 201);
  if (clean(data.website, 200) || Number(data.ms) < 2500) return thanks;

  const name = clean(data.name, GB_LIMITS.name);
  const role = clean(data.role, GB_LIMITS.role);
  const message = clean(data.message, GB_LIMITS.message);
  const avatar = GB_AVATARS.includes(data.avatar) ? data.avatar : GB_AVATARS[0];
  if (!name) throw new HttpError(400, "Add your first name or initials.");
  if (message.length < 2) throw new HttpError(400, "Write a little message first!");
  if (hasContactInfo(`${name} ${role} ${message}`)) {
    throw new HttpError(400, "Please leave out links, emails and phone numbers.");
  }

  // A hash of the visitor's address (not the address itself) for the per-hour limit
  const who = await visitorHash(request, "guestbook");
  const hourAgo = Date.now() - 60 * 60 * 1000;
  const [{ n: recent }, { n: pending }] = await Promise.all([
    env.DB.prepare("SELECT COUNT(*) AS n FROM guestbook_hits WHERE who = ? AND at > ?").bind(who, hourAgo).first(),
    env.DB.prepare("SELECT COUNT(*) AS n FROM guestbook WHERE status = 'pending'").first(),
  ]);
  if (recent >= GB_PER_HOUR) throw new HttpError(429, "You've signed a lot already! Try again in an hour.");
  if (pending >= GB_MAX_PENDING) throw new HttpError(503, "The guestbook is full for now. Please try again in a few days!");

  await env.DB.batch([
    env.DB.prepare("INSERT INTO guestbook (id, name, role, avatar, message, status, created_at) VALUES (?, ?, ?, ?, ?, 'pending', ?)")
      .bind(newId(), name, role, avatar, message, now()),
    env.DB.prepare("INSERT INTO guestbook_hits (who, at) VALUES (?, ?)").bind(who, Date.now()),
    env.DB.prepare("DELETE FROM guestbook_hits WHERE at < ?").bind(hourAgo),
  ]);
  return thanks;
}

/* ---------- admin ---------- */

async function adminListPosts(url, env) {
  const status = url.searchParams.get("status") || "pending";
  if (!["pending", "approved", "rejected"].includes(status)) throw new HttpError(400, "Unknown status.");
  const { results } = await env.DB.prepare(
    `SELECT * FROM posts WHERE status = ? ORDER BY created_at ${status === "pending" ? "ASC" : "DESC"} LIMIT 100`
  ).bind(status).all();
  return json({
    posts: results.map((r) => ({ ...publicPost(r), status: r.status, photoKeys: JSON.parse(r.photos || "[]") })),
  });
}

async function adminUpdatePost(request, env, id) {
  const data = await readJson(request);
  const row = await env.DB.prepare("SELECT * FROM posts WHERE id = ?").bind(id).first();
  if (!row) throw new HttpError(404, "Post not found.");
  const next = {
    status: data.status ?? row.status,
    title: data.title !== undefined ? clean(data.title, LIMITS.title) : row.title,
    body: data.body !== undefined ? clean(data.body, LIMITS.body) : row.body,
    author: data.author !== undefined ? clean(data.author, LIMITS.author) : row.author,
    kind: data.kind ?? row.kind,
    project_id: data.project_id !== undefined ? (data.project_id || null) : row.project_id,
  };
  if (!["pending", "approved", "rejected"].includes(next.status)) throw new HttpError(400, "Unknown status.");
  if (!KINDS.includes(next.kind)) throw new HttpError(400, "Unknown kind.");
  if (!next.author) throw new HttpError(400, "Author can't be empty.");
  await env.DB.prepare(
    "UPDATE posts SET status = ?, title = ?, body = ?, author = ?, kind = ?, project_id = ?, reviewed_at = ? WHERE id = ?"
  ).bind(next.status, next.title, next.body, next.author, next.kind, next.kind === "project" ? next.project_id : null, now(), id).run();
  return json({ ok: true });
}

async function adminDeletePost(env, id) {
  const row = await env.DB.prepare("SELECT photos FROM posts WHERE id = ?").bind(id).first();
  if (!row) throw new HttpError(404, "Post not found.");
  const keys = JSON.parse(row.photos || "[]");
  await Promise.all(keys.map((k) => env.PHOTOS.delete(k)));
  await env.DB.prepare("DELETE FROM posts WHERE id = ?").bind(id).run();
  return json({ ok: true });
}

async function adminCreateProject(request, env) {
  const data = await readJson(request);
  const name = clean(data.name, LIMITS.name);
  if (!name) throw new HttpError(400, "Give the project a name.");
  const id = newId();
  await env.DB.prepare("INSERT INTO projects (id, name, emoji, description, status, created_at) VALUES (?, ?, ?, ?, 'active', ?)")
    .bind(id, name, clean(data.emoji, LIMITS.emoji) || "🌱", clean(data.description, LIMITS.description), now()).run();
  return json({ ok: true, id }, 201);
}

async function adminUpdateProject(request, env, id) {
  const data = await readJson(request);
  const row = await env.DB.prepare("SELECT * FROM projects WHERE id = ?").bind(id).first();
  if (!row) throw new HttpError(404, "Project not found.");
  const status = data.status ?? row.status;
  if (!["active", "done", "archived"].includes(status)) throw new HttpError(400, "Unknown status.");
  const name = data.name !== undefined ? clean(data.name, LIMITS.name) : row.name;
  if (!name) throw new HttpError(400, "Project name can't be empty.");
  await env.DB.prepare("UPDATE projects SET name = ?, emoji = ?, description = ?, status = ? WHERE id = ?").bind(
    name,
    data.emoji !== undefined ? clean(data.emoji, LIMITS.emoji) || "🌱" : row.emoji,
    data.description !== undefined ? clean(data.description, LIMITS.description) : row.description,
    status,
    id
  ).run();
  return json({ ok: true });
}

async function adminAddCompost(request, env) {
  const data = await readJson(request);
  const loggedOn = clean(data.logged_on, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(loggedOn)) throw new HttpError(400, "Pick a date.");
  const temp = Number(data.temp_f);
  if (!Number.isFinite(temp) || temp < 0 || temp > 200) throw new HttpError(400, "Temperature should be between 0 and 200 °F.");
  const id = newId();
  await env.DB.prepare(
    "INSERT INTO compost_logs (id, logged_on, pile, temp_f, turned, moisture, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  ).bind(
    id, loggedOn, clean(data.pile, LIMITS.pile) || "Main pile", Math.round(temp * 10) / 10,
    data.turned ? 1 : 0, clean(data.moisture, LIMITS.moisture), clean(data.notes, LIMITS.notes), now()
  ).run();
  return json({ ok: true, id }, 201);
}

async function adminDeleteCompost(env, id) {
  await env.DB.prepare("DELETE FROM compost_logs WHERE id = ?").bind(id).run();
  return json({ ok: true });
}

/* ---------- Garden map: feedings, crossed-off to-dos, compost temps from members ---------- */

function checkDate(value) {
  const d = clean(value, 10);
  if (!DATE.test(d)) throw new HttpError(400, "Pick a date.");
  return d;
}
function checkTemp(value) {
  const temp = Number(value);
  if (!Number.isFinite(temp) || temp < 0 || temp > 200) throw new HttpError(400, "Temperature should be between 0 and 200 °F.");
  return Math.round(temp * 10) / 10;
}
function checkPlanIds(list) {
  const ids = [].concat(list || []).map((x) => clean(x, 30)).filter(Boolean);
  if (!ids.length || ids.length > 6 || !ids.every((x) => SLUG.test(x))) throw new HttpError(400, "Pick what you fed.");
  return ids;
}
function checkBed(value) {
  const bed = clean(value, 30);
  if (!SLUG.test(bed)) throw new HttpError(400, "Pick a bed.");
  return bed;
}

async function getGarden(env) {
  const [feeds, done] = await Promise.all([
    env.DB.prepare("SELECT id, bed, plan_ids, fed_on, notes FROM feed_logs WHERE status = 'approved' ORDER BY fed_on, created_at").all(),
    env.DB.prepare("SELECT bed, item, done_on FROM todo_done").all(),
  ]);
  return json({
    feeds: feeds.results.map((f) => ({ ...f, plan_ids: JSON.parse(f.plan_ids || "[]") })),
    done: done.results,
  });
}

// A compost temperature or a feeding sent through "Submit an entry" (passcode already checked)
async function submitLog(form, kind, env) {
  const author = clean(form.get("author"), LIMITS.author);
  if (!author) throw new HttpError(400, "Add your first name or initials.");
  const id = newId();
  if (kind === "temp") {
    await env.DB.prepare(
      "INSERT INTO compost_logs (id, logged_on, pile, temp_f, turned, moisture, notes, created_at, status, author) VALUES (?, ?, ?, ?, ?, '', ?, ?, 'pending', ?)"
    ).bind(
      id, checkDate(form.get("logged_on")), clean(form.get("pile"), LIMITS.pile) || "Main pile", checkTemp(form.get("temp_f")),
      form.get("turned") ? 1 : 0, clean(form.get("body"), LIMITS.notes), now(), author
    ).run();
  } else {
    await env.DB.prepare(
      "INSERT INTO feed_logs (id, bed, plan_ids, fed_on, notes, author, status, created_at) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)"
    ).bind(
      id, checkBed(form.get("bed")), JSON.stringify(checkPlanIds(form.getAll("plan_ids"))), checkDate(form.get("fed_on")),
      clean(form.get("body"), LIMITS.notes), author, now()
    ).run();
  }
  return json({ ok: true, message: "Thanks! Yvy will check it before it goes in the log." }, 201);
}

async function adminGardenPending(env) {
  const [temps, feeds] = await Promise.all([
    env.DB.prepare("SELECT id, logged_on, pile, temp_f, turned, notes, author, created_at FROM compost_logs WHERE status = 'pending' ORDER BY created_at").all(),
    env.DB.prepare("SELECT id, bed, plan_ids, fed_on, notes, author, created_at FROM feed_logs WHERE status = 'pending' ORDER BY created_at").all(),
  ]);
  return json({
    temps: temps.results,
    feeds: feeds.results.map((f) => ({ ...f, plan_ids: JSON.parse(f.plan_ids || "[]") })),
  });
}

// Approve or reject a member's temperature or feeding (table is fixed by the route, never from the request)
async function adminReviewLog(request, env, table, id) {
  const { status } = await readJson(request);
  if (!["approved", "rejected"].includes(status)) throw new HttpError(400, "Approve or reject it.");
  await env.DB.prepare(`UPDATE ${table} SET status = ? WHERE id = ?`).bind(status, id).run();
  return json({ ok: true });
}

async function adminAddFeed(request, env) {
  const data = await readJson(request);
  const id = newId();
  await env.DB.prepare(
    "INSERT INTO feed_logs (id, bed, plan_ids, fed_on, notes, author, status, created_at) VALUES (?, ?, ?, ?, ?, '', 'approved', ?)"
  ).bind(id, checkBed(data.bed), JSON.stringify(checkPlanIds(data.plan_ids)), checkDate(data.fed_on), clean(data.notes, LIMITS.notes), now()).run();
  return json({ ok: true, id }, 201);
}

async function adminDeleteFeed(env, id) {
  await env.DB.prepare("DELETE FROM feed_logs WHERE id = ?").bind(id).run();
  return json({ ok: true });
}

async function adminSetTodo(request, env) {
  const data = await readJson(request);
  const bed = checkBed(data.bed);
  const item = clean(data.item, 30);
  if (!SLUG.test(item)) throw new HttpError(400, "Which to-do?");
  if (data.done) {
    await env.DB.prepare("INSERT OR REPLACE INTO todo_done (bed, item, done_on) VALUES (?, ?, ?)").bind(bed, item, now().slice(0, 10)).run();
  } else {
    await env.DB.prepare("DELETE FROM todo_done WHERE bed = ? AND item = ?").bind(bed, item).run();
  }
  return json({ ok: true });
}

async function adminListGuestbook(url, env) {
  const status = url.searchParams.get("status") || "pending";
  if (!STATUSES.includes(status)) throw new HttpError(400, "Unknown status.");
  const { results } = await env.DB.prepare(
    `SELECT * FROM guestbook WHERE status = ? ORDER BY created_at ${status === "pending" ? "ASC" : "DESC"} LIMIT 200`
  ).bind(status).all();
  return json({ entries: results.map((r) => ({ ...publicEntry(r), status: r.status })) });
}

async function adminUpdateGuestbook(request, env, id) {
  const data = await readJson(request);
  const row = await env.DB.prepare("SELECT * FROM guestbook WHERE id = ?").bind(id).first();
  if (!row) throw new HttpError(404, "Entry not found.");
  const next = {
    status: data.status ?? row.status,
    name: data.name !== undefined ? clean(data.name, GB_LIMITS.name) : row.name,
    role: data.role !== undefined ? clean(data.role, GB_LIMITS.role) : row.role,
    avatar: data.avatar !== undefined ? (GB_AVATARS.includes(data.avatar) ? data.avatar : row.avatar) : row.avatar,
    message: data.message !== undefined ? clean(data.message, GB_LIMITS.message) : row.message,
  };
  if (!STATUSES.includes(next.status)) throw new HttpError(400, "Unknown status.");
  if (!next.name) throw new HttpError(400, "Name can't be empty.");
  if (!next.message) throw new HttpError(400, "Message can't be empty.");
  await env.DB.prepare("UPDATE guestbook SET status = ?, name = ?, role = ?, avatar = ?, message = ?, reviewed_at = ? WHERE id = ?")
    .bind(next.status, next.name, next.role, next.avatar, next.message, now(), id).run();
  return json({ ok: true });
}

async function adminDeleteGuestbook(env, id) {
  await env.DB.prepare("DELETE FROM guestbook WHERE id = ?").bind(id).run();
  return json({ ok: true });
}
