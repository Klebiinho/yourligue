const ACCESS_TOKEN = 'sbp_c36fb34d53e90f639746d3ebffcf8a73d83f8e90';
const PROJECT_ID = 'igbaydpamtpubqklsfnq';

const sql = `
-- 1. Incluir ads no Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE ads;

-- 2. Configurar REPLICA IDENTITY
ALTER TABLE ads REPLICA IDENTITY FULL;
`;

async function updateRealtime() {
    const url = `https://api.supabase.com/v1/projects/${PROJECT_ID}/database/query`;
    console.log(`🚀 Adicionando ads ao Realtime no projeto: ${PROJECT_ID}...`);

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
            console.log('✅ Tabela ads adicionada com sucesso ao Realtime!');
        }
    } catch (error) {
        console.error('💥 Erro de rede:', error.message);
    }
}

updateRealtime();
