const ACCESS_TOKEN = 'sbp_c36fb34d53e90f639746d3ebffcf8a73d83f8e90';
const PROJECT_ID = 'igbaydpamtpubqklsfnq';

const sql = `
-- 1. Adicionar coluna updated_at na tabela matches
ALTER TABLE matches ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Criar função para atualizar o timestamp automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 3. Criar trigger para a tabela matches
DROP TRIGGER IF EXISTS update_matches_updated_at ON matches;
CREATE TRIGGER update_matches_updated_at
    BEFORE UPDATE ON matches
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. Garantir que as linhas existentes tenham o updated_at preenchido
UPDATE matches SET updated_at = NOW() WHERE updated_at IS NULL;
`;

async function fixDatabase() {
    const url = `https://api.supabase.com/v1/projects/${PROJECT_ID}/database/query`;
    console.log(`🚀 Adicionando coluna updated_at e trigger no projeto: ${PROJECT_ID}...`);

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
            console.log('✅ Coluna updated_at e trigger adicionados com sucesso!');
        }
    } catch (error) {
        console.error('💥 Erro de rede:', error.message);
    }
}

fixDatabase();
