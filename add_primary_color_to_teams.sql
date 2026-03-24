-- Migration to add color columns to teams table
ALTER TABLE teams ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT NULL;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT NULL;
