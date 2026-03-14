const ACCESS_TOKEN = 'sbp_c36fb34d53e90f639746d3ebffcf8a73d83f8e90';
const PROJECT_ID = 'igbaydpamtpubqklsfnq';

const sql = `
-- 1. Garantir que a coluna updated_at existe
ALTER TABLE matches ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Configurar REPLICA IDENTITY para garantir que todos os campos vão no Realtime
ALTER TABLE matches REPLICA IDENTITY FULL;

-- 3. Função do Trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. Aplicar o Trigger
DROP TRIGGER IF EXISTS update_matches_updated_at ON matches;
CREATE TRIGGER update_matches_updated_at
    BEFORE UPDATE ON matches
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Recriar a Publication para garantir que as colunas novas sejam rastreadas
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE matches, match_events, teams, players, brackets, ads, user_team_interactions, followed_leagues;

-- 6. Forçar um update para inicializar todos os cronômetros
UPDATE matches SET updated_at = NOW() WHERE updated_at IS NULL;
`;

async function powerFix() {
    const url = `https://api.supabase.com/v1/projects/${PROJECT_ID}/database/query`;
    console.log(`🚀 Sincronizando Realtime e Colunas no projeto: ${PROJECT_ID}...`);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: sql })
        });

        if (!response.ok) {
            const result = await response.text();
            console.error('❌ Erro:', result);
        } else {
            console.log('✅ Banco de dados e Realtime sincronizados com sucesso!');
        }
    } catch (error) {
        console.error('💥 Erro de rede:', error.message);
    }
}

powerFix();
