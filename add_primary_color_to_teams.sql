-- Migration to add primary_color column to teams table
ALTER TABLE teams ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT NULL;

-- Step 2: Notify PostgREST to refresh its schema cache (usually happens on next request but good practice)
-- SELECT pg_notify('pgrst', 'reload schema');
