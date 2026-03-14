-- Execute este script no SQL Editor do Supabase para habilitar RLS e Segurança em todas as tabelas.

-- 1. Habilitar RLS em todas as tabelas conhecidas
ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE brackets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_team_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE followed_leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE league_settings ENABLE ROW LEVEL SECURITY;

-- 2. Políticas de Leitura Pública (Qualquer pessoa pode ver os dados da liga)
DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN SELECT unnest(ARRAY['leagues', 'teams', 'players', 'matches', 'match_events', 'brackets', 'user_team_interactions', 'followed_leagues', 'ads', 'league_settings']) LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Public Read Access" ON %I', t);
        EXECUTE format('CREATE POLICY "Public Read Access" ON %I FOR SELECT USING (true)', t);
    END LOOP;
END $$;

-- 3. Políticas de Escrita para Donos das Ligas (Somente o criador pode alterar)
-- Para a tabela 'leagues', o dono é o user_id
DROP POLICY IF EXISTS "Owners can update their leagues" ON leagues;
CREATE POLICY "Owners can update their leagues" ON leagues FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Para tabelas vinculadas a league_id (leagues, teams, matches, brackets, ads)
-- Nota: Algumas tabelas podem precisar de JOINs complexos se não tiverem league_id direto.
-- Vamos garantir o league_id em todas as principais.

DROP POLICY IF EXISTS "Owners can manage teams" ON teams;
CREATE POLICY "Owners can manage teams" ON teams FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM leagues WHERE leagues.id = teams.league_id AND leagues.user_id = auth.uid()));

DROP POLICY IF EXISTS "Owners can manage matches" ON matches;
CREATE POLICY "Owners can manage matches" ON matches FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM leagues WHERE leagues.id = matches.league_id AND leagues.user_id = auth.uid()));

DROP POLICY IF EXISTS "Owners can manage ads" ON ads;
CREATE POLICY "Owners can manage ads" ON ads FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM leagues WHERE leagues.id = ads.league_id AND leagues.user_id = auth.uid()));

-- Para players (vinculado via team_id)
DROP POLICY IF EXISTS "Owners can manage players" ON players;
CREATE POLICY "Owners can manage players" ON players FOR ALL TO authenticated 
USING (EXISTS (
    SELECT 1 FROM teams 
    JOIN leagues ON leagues.id = teams.league_id 
    WHERE teams.id = players.team_id AND leagues.user_id = auth.uid()
));

-- Para match_events (vinculado via match_id)
DROP POLICY IF EXISTS "Owners can manage events" ON match_events;
CREATE POLICY "Owners can manage events" ON match_events FOR ALL TO authenticated 
USING (EXISTS (
    SELECT 1 FROM matches 
    JOIN leagues ON leagues.id = matches.league_id 
    WHERE matches.id = match_events.match_id AND leagues.user_id = auth.uid()
));

-- Para interações de usuário (o próprio usuário gerencia suas interações)
DROP POLICY IF EXISTS "Users can manage their own interactions" ON user_team_interactions;
CREATE POLICY "Users can manage their own interactions" ON user_team_interactions FOR ALL TO authenticated 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own follows" ON followed_leagues;
CREATE POLICY "Users can manage their own follows" ON followed_leagues FOR ALL TO authenticated 
USING (auth.uid() = user_id);

-- 4. Seguir Ligas da LeagueContext (Onde user_id é o criador)
-- league_settings (tabela legada)
DROP POLICY IF EXISTS "Authenticated Manage" ON league_settings;
CREATE POLICY "Authenticated Manage" ON league_settings FOR ALL TO authenticated USING (true);
