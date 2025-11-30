-- Enable Realtime for the fixtures table
-- This is required for the frontend to receive live updates (minutes, scores)
ALTER PUBLICATION supabase_realtime ADD TABLE fixtures;
