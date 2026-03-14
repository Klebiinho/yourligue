import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ACCESS_TOKEN = 'sbp_c36fb34d53e90f639746d3ebffcf8a73d83f8e90';
const PROJECT_ID = 'igbaydpamtpubqklsfnq';

const sqlPath = path.join(__dirname, 'full_migration_master.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

async function migrate() {
    const url = `https://api.supabase.com/v1/projects/${PROJECT_ID}/database/query`;
    console.log(`🚀 Iniciando migração para o projeto: ${PROJECT_ID}...`);

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
            const errorText = await response.text();
            console.error('❌ Erro na migração:', errorText);
        } else {
            console.log('✅ Migração concluída com sucesso! Todas as tabelas, RLS e Realtime foram configurados.');
        }
    } catch (error) {
        console.error('💥 Erro de rede:', error.message);
    }
}

migrate();
