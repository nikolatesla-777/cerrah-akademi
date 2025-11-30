-- Add JSONB columns for match details
ALTER TABLE fixtures
ADD COLUMN IF NOT EXISTS statistics JSONB,
ADD COLUMN IF NOT EXISTS lineups JSONB,
ADD COLUMN IF NOT EXISTS h2h JSONB,
ADD COLUMN IF NOT EXISTS standings JSONB,
ADD COLUMN IF NOT EXISTS predictions JSONB;

-- Comment on columns
COMMENT ON COLUMN fixtures.statistics IS 'Match statistics (shots, possession, etc.)';
COMMENT ON COLUMN fixtures.lineups IS 'Team lineups and substitutes';
COMMENT ON COLUMN fixtures.h2h IS 'Head-to-head history';
COMMENT ON COLUMN fixtures.standings IS 'League standings at the time of the match';
COMMENT ON COLUMN fixtures.predictions IS 'Match predictions from API';
