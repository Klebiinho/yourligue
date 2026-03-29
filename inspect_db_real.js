const ACCESS_TOKEN = 'sbp_c36fb34d53e90f639746d3ebffcf8a73d83f8e90';
const PROJECT_ID = 'igbaydpamtpubqklsfnq';

async function runQuery(sql) {
    const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_ID}/database/query`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: sql })
    });
    return await res.json();
}

async function check() {
    console.log('--- Database Inspection ---');
    try {
        const columns = await runQuery("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'ads';");
        console.log('ADS Columns:', columns);
        
        const tables = await runQuery("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';");
        console.log('Public Tables:', tables);

        const rls = await runQuery("SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';");
        console.log('RLS Status:', rls);
    } catch (e) {
        console.error('Error:', e.message);
    }
}
check();
