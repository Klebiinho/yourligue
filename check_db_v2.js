import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf8');
const url = env.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim();
const key = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim();

const supabase = createClient(url, key);

async function check() {
    console.log('--- Database Diagnostics ---');
    console.log('Project URL:', url);
    
    // Check tables existence
    const tables = ['leagues', 'teams', 'players', 'matches', 'ads', 'brackets'];
    for (const table of tables) {
        try {
            const { error } = await supabase.from(table).select('id').limit(1);
            if (error) {
                console.log(`[${table}] ❌ Error: ${error.message} (Code: ${error.code})`);
            } else {
                console.log(`[${table}] ✅ Table found and readable.`);
            }
        } catch (e) {
            console.log(`[${table}] 🆘 Crash: ${e.message}`);
        }
    }
}
check();
