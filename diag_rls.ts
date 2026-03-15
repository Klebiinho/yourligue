
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function check() {
    console.log('Using URL:', process.env.VITE_SUPABASE_URL);
    try {
        const { data: leagues, error: lError } = await supabase.from('leagues').select('id').limit(1);
        console.log('Leagues readable:', !!leagues, lError?.message || '');
        
        const { data: matches, error: mError } = await supabase.from('matches').select('id, lake_id:league_id').limit(1);
        console.log('Matches readable:', !!matches, mError?.message || '');
        if (matches && matches.length > 0) {
            console.log('Match found:', matches[0]);
        }
    } catch (e) {
        console.error('Execution error:', e);
    }
}
check();
