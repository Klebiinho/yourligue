const ACCESS_TOKEN = 'sbp_c36fb34d53e90f639746d3ebffcf8a73d83f8e90';
const PROJECT_ID = 'igbaydpamtpubqklsfnq';

async function runSQL(sql) {
    const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_ID}/database/query`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: sql })
    });
    const text = await res.text();
    console.log(`Response: ${text}`);
}

async function fix() {
    console.log('--- Applying Database Schema Fixes ---');
    
    const sql = `
-- 1. Add missing columns to 'ads'
ALTER TABLE ads ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- 2. Add missing columns to 'teams'
ALTER TABLE teams ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT NULL;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT NULL;

-- 3. Add missing columns to 'players'
ALTER TABLE players ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- 4. Realtime configuration
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'ads') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE ads;
    END IF;
END $$;

ALTER TABLE ads REPLICA IDENTITY FULL;
ALTER TABLE players REPLICA IDENTITY FULL;
ALTER TABLE teams REPLICA IDENTITY FULL;
`;

    try {
        await runSQL(sql);
        console.log('✅ Potential schema fixes applied.');
    } catch (e) {
        console.error('❌ Error applying fixes:', e.message);
    }
}
fix();
