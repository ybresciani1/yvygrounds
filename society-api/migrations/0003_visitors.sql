-- "You are visitor #…" hit counter on the main site.
CREATE TABLE counters (
  name  TEXT PRIMARY KEY,
  value INTEGER NOT NULL DEFAULT 0
);
INSERT INTO counters (name, value) VALUES ('visitors', 0);

-- Recent counts, so reloading or clearing storage doesn't add up. Stores a hash of the address, not the address.
CREATE TABLE visitor_hits (
  who TEXT NOT NULL,
  at  INTEGER NOT NULL                       -- unix ms
);
CREATE INDEX visitor_hits_by_who ON visitor_hits (who, at);
