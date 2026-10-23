-- Garden map: fertilizer log, crossed-off to-dos, and compost temps sent in by members.

-- Compost temps can now come from members too (through "Submit an entry"). Theirs wait for Yvy's OK;
-- the ones Yvy logs on the admin page are approved right away.
ALTER TABLE compost_logs ADD COLUMN status TEXT NOT NULL DEFAULT 'approved';
ALTER TABLE compost_logs ADD COLUMN author TEXT NOT NULL DEFAULT '';
CREATE INDEX compost_by_status ON compost_logs (status, logged_on);

-- Fertilizer log: which bed was fed, with what (feedPlan ids from data.js → gardenMap), and when.
CREATE TABLE feed_logs (
  id          TEXT PRIMARY KEY,
  bed         TEXT NOT NULL,                 -- spot id from data.js → gardenMap, e.g. bed5
  plan_ids    TEXT NOT NULL DEFAULT '[]',    -- JSON list of feedPlan ids, e.g. ["greens"]
  fed_on      TEXT NOT NULL,                 -- YYYY-MM-DD
  notes       TEXT NOT NULL DEFAULT '',
  author      TEXT NOT NULL DEFAULT '',      -- first name or initials (member submissions)
  status      TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at  TEXT NOT NULL
);
CREATE INDEX feed_by_status ON feed_logs (status, bed, fed_on);

-- To-dos Yvy has crossed off. item is a short hash of the to-do's text, so when the list is
-- rewritten for a new season the new to-dos start unchecked.
CREATE TABLE todo_done (
  bed      TEXT NOT NULL,
  item     TEXT NOT NULL,
  done_on  TEXT NOT NULL,
  PRIMARY KEY (bed, item)
);
