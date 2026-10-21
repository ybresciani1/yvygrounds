-- Arcade high scores (3-letter initials) and the Rabbit & Frog hall of fame.

CREATE TABLE scores (
  id         TEXT PRIMARY KEY,
  game       TEXT NOT NULL,                  -- arcade folder name, e.g. "tomato-tussle"
  initials   TEXT NOT NULL,                  -- 3 letters, A-Z
  score      INTEGER NOT NULL,               -- points, or milliseconds for "lowest wins" games
  created_at TEXT NOT NULL
);
CREATE INDEX scores_by_game ON scores (game, score);

-- Recent submissions, to slow down spam. Stores a hash of the address, not the address.
CREATE TABLE score_hits (
  who TEXT NOT NULL,
  at  INTEGER NOT NULL                       -- unix ms
);
CREATE INDEX score_hits_by_who ON score_hits (who, at);

-- Students who finished Rabbit & Frog: Gardenbound (added by Yvy on the admin page).
CREATE TABLE hall (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,                 -- first name + last initial, e.g. "Mia R."
  grade       TEXT NOT NULL,                 -- "TK", "K", "1" ... "8"
  finished_on TEXT NOT NULL DEFAULT '',      -- YYYY-MM-DD (optional)
  photo       TEXT NOT NULL DEFAULT '',      -- KV key, e.g. "hall/<id>.jpg" ('' = no photo)
  caption     TEXT NOT NULL DEFAULT '',
  created_at  TEXT NOT NULL
);
CREATE INDEX hall_by_grade ON hall (grade, name);
