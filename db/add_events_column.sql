-- Add events column to fixtures table
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS events JSONB;
