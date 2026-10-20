/*
 * YvyGrounds Garden Society API (Cloudflare Worker + D1 database + KV photo storage)
 *
 * Public:
 *   GET  /api/feed?kind=journal|project|compost[&project=ID][&limit=N]   approved posts only
 *   GET  /api/projects                                                     active + done projects
 *   GET  /api/compost                                                      compost temperature log
 *   GET  /api/photo/<key>                                                  photo of an approved post
 *   POST /api/submit   (multipart, needs SOCIETY_PASSCODE)                 new post, waits for approval
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
 *   DELETE /api/admin/compost/<id>
 */

const MAX_PHOTOS = 3;
const MAX_PHOTO_BYTES = 6 * 1024 * 1024;
const KINDS = ["journal", "project", "compost"];
const LIMITS = { author: 40, title: 120, body: 4000, name: 80, emoji: 8, description: 400, pile: 40, moisture: 40, notes: 600 };
const AUTH_WINDOW_MS = 15 * 60 * 1000;
const AUTH_MAX_FAILURES = 8;

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
  if (m === "GET" && path.startsWith("/api/photo/")) return getPhoto(env, path.slice("/api/photo/".length), false);
  if (m === "POST" && path === "/api/submit") return submit(request, env);

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
    if (what === "compost" && m === "DELETE" && id) return adminDeleteCompost(env, id);
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
    "SELECT id, logged_on, pile, temp_f, turned, moisture, notes FROM compost_logs ORDER BY logged_on, created_at"
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
