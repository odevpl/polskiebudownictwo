ALTER TABLE mediators
  ADD COLUMN name VARCHAR(200) NULL AFTER id;

UPDATE mediators
SET name = TRIM(CONCAT_WS(' ', first_name, last_name))
WHERE name IS NULL OR name = '';

ALTER TABLE mediators
  MODIFY COLUMN name VARCHAR(200) NOT NULL,
  MODIFY COLUMN key_experience MEDIUMTEXT NULL,
  DROP COLUMN first_name,
  DROP COLUMN last_name,
  DROP COLUMN role_title,
  DROP COLUMN mediation_locations,
  DROP COLUMN photo_path,
  DROP INDEX idx_mediators_name,
  ADD INDEX idx_mediators_name (name);
