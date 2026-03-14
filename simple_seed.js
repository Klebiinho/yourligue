
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim();

const supabase = createClient(url, key);

async function seed() {
    console.log('Simulando Copa Nony 4...');
    
    // 1. Criar Liga
    const { data: league } = await supabase.from('leagues').upsert({
        name: 'COPA NONY 4',
        slug: 'copa-nony-4',
        max_teams: 32,
        user_id: (await supabase.from('leagues').select('user_id').limit(1).single()).data.user_id
    }).select().single();

    if (!league) return console.error('Erro liga');

    const groups = {
        'A': ['REAL PORTO F.C', 'SENZALACITY', 'IMUBAI FC', 'SELECAO TRANCOSO', 'RIVER TRANCOSO'],
        'B': ['ALPHA FO', 'EXECUTA', 'CELTICS', 'DUAVESSO FC', 'REAL JC', 'FURIA'],
        'C': ['IBIS FC', 'SALVADOR', 'IFBA', 'ANE ANE SPORTS', 'REAL MATISMO'],
        'D': ['MAGNUS', 'NOVA HOLANDA', 'IF PORTO', 'MENINOS DA VILA', 'DEMETRYUS']
    };

    for (const [g, teams] of Object.entries(groups)) {
        for (const tName of teams) {
            const { data: team } = await supabase.from('teams').insert({
                league_id: league.id,
                name: tName,
                group_name: g,
                logo: `https://api.dicebear.com/7.x/identicon/svg?seed=${tName}`
            }).select().single();
            
            if (team) {
                const players = Array.from({length: 8}, (_, i) => ({
                    team_id: team.id,
                    name: `Jogador ${i+1} (${tName})`,
                    number: i+1,
                    position: i===0 ? 'Goleiro' : 'Linha',
                    is_captain: i===0,
                    is_reserve: i>4
                }));
                await supabase.from('players').insert(players);
            }
        }
    }
    console.log('Fim!');
}
seed();
