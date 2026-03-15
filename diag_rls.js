
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Manually parse .env since we are in a simple script
const env = fs.readFileSync('.env', 'utf8');
const url = env.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim();
const key = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim();

console.log('Testing with URL:', url);

const supabase = createClient(url, key);

async function check() {
    try {
        const { data: leagues, error: lError } = await supabase.from('leagues').select('id').limit(1);
        console.log('Leagues readable:', !!leagues, lError?.message || '');
        
        const { data: matches, error: mError } = await supabase.from('matches').select('id, league_id').limit(1);
        console.log('Matches readable:', !!matches, mError?.message || '');
        if (matches && matches.length > 0) {
            console.log('Match found:', matches[0]);
        }
    } catch (e) {
        console.error('Execution error:', e);
    }
}
check();
