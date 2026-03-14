
import fs from 'fs';
import path from 'path';

const ACCESS_TOKEN = 'sbp_c36fb34d53e90f639746d3ebffcf8a73d83f8e90';
const PROJECT_ID = 'igbaydpamtpubqklsfnq';

const sqlPath = './seed_simulation.sql';
const sql = fs.readFileSync(sqlPath, 'utf8');

async function runSeed() {
    const url = `https://api.supabase.com/v1/projects/${PROJECT_ID}/database/query`;
    console.log(`🚀 Executando simulação completa para COPA NONY 4 no projeto: ${PROJECT_ID}...`);

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
            console.error('❌ Erro na simulação:', errorText);
        } else {
            console.log('✅ Simulação de dados concluída! Times, Jogadores, Jogos e Gols criados.');
        }
    } catch (error) {
        console.error('💥 Erro de rede:', error.message);
    }
}

runSeed();
