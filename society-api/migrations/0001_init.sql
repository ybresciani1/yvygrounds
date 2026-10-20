-- Garden Society: posts (journal, project updates, compost photos), projects, and the compost log.

-- Everything members submit. Nothing is public until Yvy approves it.
CREATE TABLE posts (
  id          TEXT PRIMARY KEY,
  kind        TEXT NOT NULL CHECK (kind IN ('journal', 'project', 'compost')),
  project_id  TEXT,
  author      TEXT NOT NULL,                 -- first name or initials only
  title       TEXT NOT NULL DEFAULT '',
  body        TEXT NOT NULL DEFAULT '',
  photos      TEXT NOT NULL DEFAULT '[]',    -- JSON array of R2 keys
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at  TEXT NOT NULL,
  reviewed_at TEXT
);
CREATE INDEX posts_by_status ON posts (status, kind, created_at);

-- Society projects that updates can be filed under (Yvy manages these).
CREATE TABLE projects (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  emoji       TEXT NOT NULL DEFAULT '🌱',
  description TEXT NOT NULL DEFAULT '',
  status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'done', 'archived')),
  created_at  TEXT NOT NULL
);

-- Compost temperatures, logged by Yvy.
CREATE TABLE compost_logs (
  id         TEXT PRIMARY KEY,
  logged_on  TEXT NOT NULL,                  -- YYYY-MM-DD
  pile       TEXT NOT NULL DEFAULT 'Main pile',
  temp_f     REAL NOT NULL,
  turned     INTEGER NOT NULL DEFAULT 0,
  moisture   TEXT NOT NULL DEFAULT '',
  notes      TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);
CREATE INDEX compost_by_date ON compost_logs (logged_on);

-- Failed admin sign-ins, to slow down password guessing.
CREATE TABLE auth_failures (
  ip         TEXT NOT NULL,
  at         INTEGER NOT NULL                -- unix ms
);
CREATE INDEX auth_failures_by_ip ON auth_failures (ip, at);
