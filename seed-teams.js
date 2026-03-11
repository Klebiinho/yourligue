import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vlvbalmntwccmafobxwk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsdmJhbG1udHdjY21hZm9ieHdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxOTA1NzksImV4cCI6MjA4ODc2NjU3OX0.BYRN0aI-ttfTXukrbODGEGd3mGcHSysso_ncrRDhY8s';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
    console.log('Inserting teams...');
    const teams = [
        { name: 'REAL PORTO F.C', logo: 'https://images.unsplash.com/photo-1599839619722-39751411ea63?w=150&h=150&fit=crop' },
        { name: 'SENZALACITY', logo: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=150&h=150&fit=crop' },
        { name: 'IMUBAI FC', logo: 'https://images.unsplash.com/photo-1518605368461-1e1e38ce8ba9?w=150&h=150&fit=crop' },
        { name: 'SELECAO TRANCOSO', logo: 'https://images.unsplash.com/photo-1574629810360-7efbb42f4c01?w=150&h=150&fit=crop' },
        { name: 'RIVER TRANCOSO', logo: 'https://images.unsplash.com/photo-1600250395371-bd3101d2bc05?w=150&h=150&fit=crop' },

        { name: 'ALPHA FO', logo: 'https://images.unsplash.com/photo-1508344928928-7137b29de218?w=150&h=150&fit=crop' },
        { name: 'EXECUTA', logo: 'https://images.unsplash.com/photo-1551280857-2b9ebf262c1e?w=150&h=150&fit=crop' },
        { name: 'CELTICS', logo: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=150&h=150&fit=crop' },
        { name: 'DUAVESSO FC', logo: 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?w=150&h=150&fit=crop' },
        { name: 'REAL JC', logo: 'https://images.unsplash.com/photo-1624880357913-a8539238165b?w=150&h=150&fit=crop' },
        { name: 'FURIA', logo: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=150&h=150&fit=crop' },

        { name: 'IBIS FC', logo: 'https://images.unsplash.com/photo-1510566337590-2fc1f21d0faa?w=150&h=150&fit=crop' },
        { name: 'SALVADOR', logo: 'https://images.unsplash.com/photo-1590485601323-c918335dc1eb?w=150&h=150&fit=crop' },
        { name: 'IFBA', logo: 'https://images.unsplash.com/photo-1521503915150-13bb33fbc2df?w=150&h=150&fit=crop' },
        { name: 'ANE ANE SPORTS', logo: 'https://images.unsplash.com/photo-1557088463-2b220ff1f1cc?w=150&h=150&fit=crop' },
        { name: 'REAL MATISMO', logo: 'https://images.unsplash.com/photo-1616422285623-1456a2bbecba?w=150&h=150&fit=crop' },

        { name: 'MAGNUS', logo: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=150&h=150&fit=crop' },
        { name: 'NOVA HOLANDA', logo: 'https://images.unsplash.com/photo-1431324155629-1a6bbe231c16?w=150&h=150&fit=crop' },
        { name: 'IF PORTO', logo: 'https://images.unsplash.com/photo-1518063319789-7217e6706b04?w=150&h=150&fit=crop' },
        { name: 'MENINOS DA VILA', logo: 'https://images.unsplash.com/photo-1564773837943-7f61c6bc1e2c?w=150&h=150&fit=crop' },
        { name: 'DEMETRYUS', logo: 'https://images.unsplash.com/photo-1594916894082-f72007823521?w=150&h=150&fit=crop' }
    ];

    const { error } = await supabase.from('teams').insert(teams);

    if (error) {
        console.error('Error inserting teams:', error);
    } else {
        console.log('Success! Teams inserted.');
    }
}
run();
