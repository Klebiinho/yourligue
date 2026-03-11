import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://vlvbalmntwccmafobxwk.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsdmJhbG1udHdjY21hZm9ieHdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxOTA1NzksImV4cCI6MjA4ODc2NjU3OX0.BYRN0aI-ttfTXukrbODGEGd3mGcHSysso_ncrRDhY8s';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const firstNames = ['João', 'Pedro', 'Lucas', 'Mateus', 'Gabriel', 'Marcos', 'Rafael', 'Carlos', 'Eduardo', 'Felipe'];
const lastNames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes'];
const positions = ['Goleiro', 'Zagueiro', 'Meio-campo', 'Atacante'];

async function run() {
    console.log('Fetching teams...');
    const { data: teams, error } = await supabase.from('teams').select('id');

    if (error || !teams) {
        return console.error('Error fetching teams:', error);
    }

    console.log(`Found ${teams.length} teams. Generating players...`);

    // Clear existing players to avoid duplicates if run multiple times
    await supabase.from('players').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    const playersToInsert = [];

    for (const team of teams) {
        for (let i = 1; i <= 5; i++) {
            const name = firstNames[Math.floor(Math.random() * firstNames.length)] + ' ' +
                lastNames[Math.floor(Math.random() * lastNames.length)];
            const position = i === 1 ? 'Goleiro' : positions[Math.floor(Math.random() * (positions.length - 1)) + 1];
            playersToInsert.push({
                team_id: team.id,
                name: name,
                number: i === 1 ? 1 : Math.floor(Math.random() * 20) + 2,
                position: position,
                photo: 'https://images.unsplash.com/photo-1544168190-79c15427015f?w=150&h=150&fit=crop'
            });
        }
    }

    const { error: insertError } = await supabase.from('players').insert(playersToInsert);

    if (insertError) {
        console.error('Error inserting players:', insertError);
    } else {
        console.log(`Successfully inserted ${playersToInsert.length} players!`);
    }
}
run();
