-- Garden map: members can say they did to-dos (through "Submit an entry"). Each report waits for Yvy's OK;
-- approving it crosses those to-dos off (todo_done). Until then the map shows them with a "?".
CREATE TABLE todo_reports (
  id          TEXT PRIMARY KEY,
  bed         TEXT NOT NULL,                 -- spot id from data.js → gardenMap, e.g. bed5 or ms6
  items       TEXT NOT NULL DEFAULT '[]',    -- JSON list of to-do ids (short hashes of the to-do text)
  done_on     TEXT NOT NULL,                 -- YYYY-MM-DD
  notes       TEXT NOT NULL DEFAULT '',
  author      TEXT NOT NULL DEFAULT '',      -- first name or initials
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at  TEXT NOT NULL
);
CREATE INDEX todo_reports_by_status ON todo_reports (status, bed);
