-- To-do reports can include "Other": a job that isn't on the spot's list, written in by the member.
-- Approving it doesn't cross anything off; it shows on the map under "Also done".
ALTER TABLE todo_reports ADD COLUMN other TEXT NOT NULL DEFAULT '';
