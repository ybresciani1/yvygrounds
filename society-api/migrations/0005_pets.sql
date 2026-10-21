-- Community pet counter for Critter Corner: total pets per critter, from every visitor.
CREATE TABLE pets (
  key   TEXT PRIMARY KEY,                    -- critter name in lowercase letters, e.g. "peaches"
  count INTEGER NOT NULL DEFAULT 0
);

-- Recent pets per visitor, to cap spam. Stores a hash of the address, not the address.
CREATE TABLE pet_hits (
  who TEXT NOT NULL,
  n   INTEGER NOT NULL,
  at  INTEGER NOT NULL                       -- unix ms
);
CREATE INDEX pet_hits_by_who ON pet_hits (who, at);
