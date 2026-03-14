
const https = require('https');

const ACCESS_TOKEN = 'sbp_c36fb34d53e90f639746d3ebffcf8a73d83f8e90';
const PROJECT_ID = 'igbaydpamtpubqklsfnq';

const sql = `
-- 1. Adicionar updated_at na tabela matches se não existir
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='matches' AND column_name='updated_at') THEN
        ALTER TABLE matches ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 2. Função para atualizar o score da partida automaticamente
CREATE OR REPLACE FUNCTION update_match_score() RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        IF (NEW.type IN ('goal', 'penalty_goal')) THEN
            UPDATE matches SET home_score = home_score + 1, updated_at = NOW() WHERE id = NEW.match_id AND home_team_id = NEW.team_id;
            UPDATE matches SET away_score = away_score + 1, updated_at = NOW() WHERE id = NEW.match_id AND away_team_id = NEW.team_id;
        ELSIF (NEW.type = 'own_goal') THEN
            UPDATE matches SET home_score = home_score + 1, updated_at = NOW() WHERE id = NEW.match_id AND away_team_id = NEW.team_id;
            UPDATE matches SET away_score = away_score + 1, updated_at = NOW() WHERE id = NEW.match_id AND home_team_id = NEW.team_id;
        END IF;
    ELSIF (TG_OP = 'DELETE') THEN
        IF (OLD.type IN ('goal', 'penalty_goal')) THEN
            UPDATE matches SET home_score = GREATEST(0, home_score - 1), updated_at = NOW() WHERE id = OLD.match_id AND home_team_id = OLD.team_id;
            UPDATE matches SET away_score = GREATEST(0, away_score - 1), updated_at = NOW() WHERE id = OLD.match_id AND away_team_id = OLD.team_id;
        ELSIF (OLD.type = 'own_goal') THEN
            UPDATE matches SET home_score = GREATEST(0, home_score - 1), updated_at = NOW() WHERE id = OLD.match_id AND away_team_id = OLD.team_id;
            UPDATE matches SET away_score = GREATEST(0, away_score - 1), updated_at = NOW() WHERE id = OLD.match_id AND home_team_id = OLD.team_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_update_match_score ON match_events;
CREATE TRIGGER tr_update_match_score
AFTER INSERT OR DELETE ON match_events
FOR EACH ROW EXECUTE FUNCTION update_match_score();

-- 3. Habilitar Realtime
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE matches, match_events, teams, players, brackets, user_team_interactions;
ALTER TABLE matches REPLICA IDENTITY FULL;
`;

const postData = JSON.stringify({ query: sql });

const options = {
  hostname: 'api.supabase.com',
  port: 443,
  path: `/v1/projects/${PROJECT_ID}/database/query`,
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (d) => { body += d; });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Body:', body);
  });
});

req.on('error', (e) => console.error(e));
req.write(postData);
req.end();
