
-- Limpar qualquer dado anterior da Copa Nony 4
DO $$ 
DECLARE 
    l_id uuid;
BEGIN
    INSERT INTO leagues (name, max_teams, points_for_win, points_for_draw, points_for_loss, default_half_length, user_id, slug)
    SELECT 'COPA NONY 4', 32, 3, 1, 0, 20, user_id, 'copa-nony-4'
    FROM leagues LIMIT 1
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO l_id;

    IF l_id IS NULL THEN
        SELECT id INTO l_id FROM leagues WHERE slug = 'copa-nony-4';
    END IF;

    DELETE FROM matches WHERE league_id = l_id;
    DELETE FROM teams WHERE league_id = l_id;

    -- Inserção manual simples para evitar problemas de função
    INSERT INTO teams (id, league_id, name, group_name, logo) VALUES
    (gen_random_uuid(), l_id, 'REAL PORTO F.C', 'A', 'https://api.dicebear.com/7.x/identicon/svg?seed=REAL_PORTO'),
    (gen_random_uuid(), l_id, 'SENZALACITY', 'A', 'https://api.dicebear.com/7.x/identicon/svg?seed=SENZALA'),
    (gen_random_uuid(), l_id, 'IMUBAI FC', 'A', 'https://api.dicebear.com/7.x/identicon/svg?seed=IMUBAI'),
    (gen_random_uuid(), l_id, 'SELECAO TRANCOSO', 'A', 'https://api.dicebear.com/7.x/identicon/svg?seed=TRANCOSO'),
    (gen_random_uuid(), l_id, 'RIVER TRANCOSO', 'A', 'https://api.dicebear.com/7.x/identicon/svg?seed=RIVER'),
    -- B
    (gen_random_uuid(), l_id, 'ALPHA FO', 'B', 'https://api.dicebear.com/7.x/identicon/svg?seed=ALPHA'),
    (gen_random_uuid(), l_id, 'EXECUTA', 'B', 'https://api.dicebear.com/7.x/identicon/svg?seed=EXECUTA'),
    (gen_random_uuid(), l_id, 'CELTICS', 'B', 'https://api.dicebear.com/7.x/identicon/svg?seed=CELTICS'),
    (gen_random_uuid(), l_id, 'DUAVESSO FC', 'B', 'https://api.dicebear.com/7.x/identicon/svg?seed=DUAVESSO'),
    (gen_random_uuid(), l_id, 'REAL JC', 'B', 'https://api.dicebear.com/7.x/identicon/svg?seed=REAL_JC'),
    (gen_random_uuid(), l_id, 'FURIA', 'B', 'https://api.dicebear.com/7.x/identicon/svg?seed=FURIA'),
    -- C
    (gen_random_uuid(), l_id, 'IBIS FC', 'C', 'https://api.dicebear.com/7.x/identicon/svg?seed=IBIS'),
    (gen_random_uuid(), l_id, 'SALVADOR', 'C', 'https://api.dicebear.com/7.x/identicon/svg?seed=SALVADOR'),
    (gen_random_uuid(), l_id, 'IFBA', 'C', 'https://api.dicebear.com/7.x/identicon/svg?seed=IFBA'),
    (gen_random_uuid(), l_id, 'ANE ANE SPORTS', 'C', 'https://api.dicebear.com/7.x/identicon/svg?seed=ANE'),
    (gen_random_uuid(), l_id, 'REAL MATISMO', 'C', 'https://api.dicebear.com/7.x/identicon/svg?seed=MATISMO'),
    -- D
    (gen_random_uuid(), l_id, 'MAGNUS', 'D', 'https://api.dicebear.com/7.x/identicon/svg?seed=MAGNUS'),
    (gen_random_uuid(), l_id, 'NOVA HOLANDA', 'D', 'https://api.dicebear.com/7.x/identicon/svg?seed=HOLANDA'),
    (gen_random_uuid(), l_id, 'IF PORTO', 'D', 'https://api.dicebear.com/7.x/identicon/svg?seed=IFPORTO'),
    (gen_random_uuid(), l_id, 'MENINOS DA VILA', 'D', 'https://api.dicebear.com/7.x/identicon/svg?seed=MENINOS'),
    (gen_random_uuid(), l_id, 'DEMETRYUS', 'D', 'https://api.dicebear.com/7.x/identicon/svg?seed=DEMETRYUS');

    -- Popular jogadores para todos os times da liga
    INSERT INTO players (team_id, name, number, position, is_captain, is_reserve)
    SELECT 
        t.id, 
        'Jogador ' || i || ' (' || t.name || ')', 
        i, 
        CASE WHEN i=1 THEN 'Goleiro' WHEN i=2 THEN 'Zagueiro' WHEN i=3 THEN 'Meio' ELSE 'Atacante' END,
        (i=1),
        (i>5)
    FROM teams t, generate_series(1, 8) i
    WHERE t.league_id = l_id;

    -- Gerar Jogos para todos os pares no mesmo grupo
    INSERT INTO matches (league_id, home_team_id, away_team_id, home_score, away_score, status, scheduled_at, period, timer)
    SELECT 
        l_id, t1.id, t2.id, 
        floor(random() * 4), floor(random() * 4), 
        'finished', 
        now() - (random() * interval '7 days'),
        'Encerrado', 40
    FROM teams t1, teams t2
    WHERE t1.league_id = l_id AND t2.league_id = l_id 
      AND t1.group_name = t2.group_name 
      AND t1.id < t2.id;

    -- Gerar Gols
    INSERT INTO match_events (match_id, team_id, player_id, type, minute)
    SELECT 
        m.id, 
        m.home_team_id,
        (SELECT id FROM players WHERE team_id = m.home_team_id ORDER BY random() LIMIT 1),
        'goal',
        floor(random() * 40)
    FROM matches m, generate_series(1, 2) i -- 2 gols por time em média
    WHERE m.league_id = l_id AND m.home_score >= i;

    INSERT INTO match_events (match_id, team_id, player_id, type, minute)
    SELECT 
        m.id, 
        m.away_team_id,
        (SELECT id FROM players WHERE team_id = m.away_team_id ORDER BY random() LIMIT 1),
        'goal',
        floor(random() * 40)
    FROM matches m, generate_series(1, 2) i
    WHERE m.league_id = l_id AND m.away_score >= i;

END $$;
