-- Add logo columns to fixtures table
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS home_team_logo TEXT;
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS away_team_logo TEXT;
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS league_logo TEXT; -- Might as well add league logo too
