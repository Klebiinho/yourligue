import fs from 'fs';

const ACCESS_TOKEN = 'sbp_c36fb34d53e90f639746d3ebffcf8a73d83f8e90';
const PROJECT_ID = 'igbaydpamtpubqklsfnq';

const query = `
    -- 1. Verificar Publicação
    SELECT pubname, puballtables 
    FROM pg_publication 
    WHERE pubname = 'supabase_realtime';

    -- 2. Verificar Tabelas na Publicação
    SELECT schemaname, tablename 
    FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime';

    -- 3. Verificar Identidade de Réplica
    SELECT relname as table_name, 
           CASE relreplident 
               WHEN 'd' THEN 'default' 
               WHEN 'n' THEN 'nothing' 
               WHEN 'f' THEN 'full' 
               WHEN 'i' THEN 'index' 
           END as replica_identity
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' 
    AND relname IN ('matches', 'match_events');
`;

async function verify() {
    const url = `https://api.supabase.com/v1/projects/${PROJECT_ID}/database/query`;
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query })
        });

        const result = await response.json();
        
        if (!response.ok) {
            console.error('❌ Erro na verificação:', result);
        } else {
            console.log('📊 RELATÓRIO DE CONFIGURAÇÃO REALTIME:');
            console.log(JSON.stringify(result, null, 2));
        }
    } catch (error) {
        console.error('💥 Erro de rede:', error.message);
    }
}

verify();
