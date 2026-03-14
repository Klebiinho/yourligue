-- MASTER MIGRATION SCRIPT FOR YOURLIGUE (Robust Version)
-- 1. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABELAS
CREATE TABLE IF NOT EXISTS leagues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    logo TEXT,
    max_teams INTEGER DEFAULT 32,
    points_for_win INTEGER DEFAULT 3,
    points_for_draw INTEGER DEFAULT 1,
    points_for_loss INTEGER DEFAULT 0,
    default_half_length INTEGER DEFAULT 45,
    players_per_team INTEGER DEFAULT 5,
    reserve_limit_per_team INTEGER DEFAULT 5,
    substitutions_limit INTEGER DEFAULT 5,
    slug TEXT UNIQUE,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    league_id UUID REFERENCES leagues(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    logo TEXT,
    group_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    league_id UUID REFERENCES leagues(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    number INTEGER,
    position TEXT,
    photo TEXT,
    is_captain BOOLEAN DEFAULT FALSE,
    is_reserve BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    league_id UUID REFERENCES leagues(id) ON DELETE CASCADE,
    home_team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    away_team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    home_score INTEGER DEFAULT 0,
    away_score INTEGER DEFAULT 0,
    status TEXT CHECK (status IN ('scheduled', 'live', 'finished')) DEFAULT 'scheduled',
    timer INTEGER DEFAULT 0,
    youtube_live_id TEXT,
    half_length INTEGER DEFAULT 45,
    extra_time INTEGER DEFAULT 0,
    period TEXT DEFAULT '1º Tempo',
    scheduled_at TIMESTAMP WITH TIME ZONE,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS match_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    player_out_id UUID REFERENCES players(id) ON DELETE SET NULL,
    type TEXT NOT NULL,
    minute INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS brackets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    league_id UUID REFERENCES leagues(id) ON DELETE CASCADE,
    round TEXT NOT NULL,
    match_order INTEGER,
    home_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    away_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    home_score INTEGER DEFAULT 0,
    away_score INTEGER DEFAULT 0,
    status TEXT DEFAULT 'scheduled'
);

CREATE TABLE IF NOT EXISTS ads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    league_id UUID REFERENCES leagues(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    desktop_media_url TEXT NOT NULL,
    mobile_media_url TEXT,
    media_type TEXT DEFAULT 'image',
    positions TEXT[] DEFAULT '{}',
    object_position TEXT DEFAULT 'center',
    link_url TEXT,
    duration INTEGER DEFAULT 5,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_team_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    league_id UUID REFERENCES leagues(id) ON DELETE CASCADE,
    interaction_type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS followed_leagues (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    league_id UUID REFERENCES leagues(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, league_id)
);

-- 3. POLÍTICAS RLS
ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE brackets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_team_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE followed_leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

-- Cleanup existing policies
DROP POLICY IF EXISTS "Public Read leagues" ON leagues;
DROP POLICY IF EXISTS "Public Read teams" ON teams;
DROP POLICY IF EXISTS "Public Read players" ON players;
DROP POLICY IF EXISTS "Public Read matches" ON matches;
DROP POLICY IF EXISTS "Public Read match_events" ON match_events;
DROP POLICY IF EXISTS "Public Read brackets" ON brackets;
DROP POLICY IF EXISTS "Public Read ads" ON ads;
DROP POLICY IF EXISTS "Public Read interactions" ON user_team_interactions;

DROP POLICY IF EXISTS "Owners manage leagues" ON leagues;
DROP POLICY IF EXISTS "Owners manage teams" ON teams;
DROP POLICY IF EXISTS "Owners manage players" ON players;
DROP POLICY IF EXISTS "Owners manage matches" ON matches;
DROP POLICY IF EXISTS "Owners manage events" ON match_events;
DROP POLICY IF EXISTS "Owners manage ads" ON ads;

DROP POLICY IF EXISTS "Users manage their interactions" ON user_team_interactions;
DROP POLICY IF EXISTS "Users manage their follows" ON followed_leagues;

-- Create policies
CREATE POLICY "Public Read leagues" ON leagues FOR SELECT USING (true);
CREATE POLICY "Public Read teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Public Read players" ON players FOR SELECT USING (true);
CREATE POLICY "Public Read matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Public Read match_events" ON match_events FOR SELECT USING (true);
CREATE POLICY "Public Read brackets" ON brackets FOR SELECT USING (true);
CREATE POLICY "Public Read ads" ON ads FOR SELECT USING (true);
CREATE POLICY "Public Read interactions" ON user_team_interactions FOR SELECT USING (true);

CREATE POLICY "Owners manage leagues" ON leagues FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Owners manage teams" ON teams FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM leagues WHERE leagues.id = teams.league_id AND leagues.user_id = auth.uid()));
CREATE POLICY "Owners manage players" ON players FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM teams JOIN leagues ON leagues.id = teams.league_id WHERE teams.id = players.team_id AND leagues.user_id = auth.uid()));
CREATE POLICY "Owners manage matches" ON matches FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM leagues WHERE leagues.id = matches.league_id AND leagues.user_id = auth.uid()));
CREATE POLICY "Owners manage events" ON match_events FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM matches JOIN leagues ON leagues.id = matches.league_id WHERE matches.id = match_events.match_id AND leagues.user_id = auth.uid()));
CREATE POLICY "Owners manage ads" ON ads FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM leagues WHERE leagues.id = ads.league_id AND leagues.user_id = auth.uid()));

CREATE POLICY "Users manage their interactions" ON user_team_interactions FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users manage their follows" ON followed_leagues FOR ALL TO authenticated USING (auth.uid() = user_id);

-- 4. REALTIME CONFIG
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE matches, match_events, teams, players, brackets, user_team_interactions;
ALTER TABLE matches REPLICA IDENTITY FULL;
ALTER TABLE match_events REPLICA IDENTITY FULL;
