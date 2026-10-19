-- Representative pinned native startup DDL, not the full Penpot migration set.
-- ff7a66f: backend/src/app/util/migrations.clj:58-63 and migration 0001.
CREATE TABLE IF NOT EXISTS migrations (
 module text,
 step text,
 created_at timestamp DEFAULT current_timestamp,
 unique(module, step)
);
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Existing recorded migration lookup and normal owner DDL/save operations.
SELECT count(*) FROM migrations WHERE module='main' AND step='fixture';
CREATE TABLE owner_probe (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), title text);
INSERT INTO owner_probe(title) VALUES ('saved after owner-neutral restore');
ALTER TABLE owner_probe ADD COLUMN modified_at timestamptz DEFAULT clock_timestamp();
CREATE FUNCTION owner_probe_touch() RETURNS trigger AS $$
BEGIN NEW.modified_at := clock_timestamp(); RETURN NEW; END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER owner_probe_touch BEFORE UPDATE ON owner_probe
 FOR EACH ROW EXECUTE FUNCTION owner_probe_touch();
UPDATE owner_probe SET title='saved by application owner';
