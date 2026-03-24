-- Performance indexes to speed up league data fetching
CREATE INDEX IF NOT EXISTS idx_teams_league_id ON teams(league_id);
CREATE INDEX IF NOT EXISTS idx_matches_league_id ON matches(league_id);
CREATE INDEX IF NOT EXISTS idx_matches_updated_at ON matches(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_match_events_match_id ON match_events(match_id);
CREATE INDEX IF NOT EXISTS idx_match_events_player_id ON match_events(player_id);
CREATE INDEX IF NOT EXISTS idx_players_team_id ON players(team_id);
CREATE INDEX IF NOT EXISTS idx_players_league_id ON players(league_id);
CREATE INDEX IF NOT EXISTS idx_brackets_league_id ON brackets(league_id);
CREATE INDEX IF NOT EXISTS idx_ads_league_id ON ads(league_id);

-- Step 2: Ensure statistics columns (if any exist) are indexed. 
-- In YourLigue, we calculate stats on the fly, so indexing league_id is the primary gain.
