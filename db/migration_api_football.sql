-- Add external_id column to map matches to API-Football
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS external_id INTEGER UNIQUE;

-- Create index for faster lookups by external_id
CREATE INDEX IF NOT EXISTS idx_fixtures_external_id ON fixtures(external_id);
