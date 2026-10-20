-- Guestbook on the main site. Anyone can sign (first name only); nothing is public until Yvy approves it.
CREATE TABLE guestbook (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,                 -- first name or initials only
  role        TEXT NOT NULL DEFAULT '',      -- "Parent", "Game player"...
  avatar      TEXT NOT NULL DEFAULT 'chicken',
  message     TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at  TEXT NOT NULL,
  reviewed_at TEXT
);
CREATE INDEX guestbook_by_status ON guestbook (status, created_at);

-- Recent signings, to slow down spam. Stores a hash of the address, not the address itself.
CREATE TABLE guestbook_hits (
  who TEXT NOT NULL,
  at  INTEGER NOT NULL                       -- unix ms
);
CREATE INDEX guestbook_hits_by_who ON guestbook_hits (who, at);
