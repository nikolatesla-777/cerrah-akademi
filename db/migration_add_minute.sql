-- Add minute column to fixtures table for live match timing
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS minute INTEGER;
