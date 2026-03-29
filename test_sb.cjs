async function testSupabase() {
    const url = 'https://igbaydpamtpubqklsfnq.supabase.co/rest/v1/leagues?limit=1';
    const anonKey = 'sb_publishable_G_czqd25ULE7hyeUnlsfHg_X8uDuaQL';
    
    try {
        const response = await fetch(url, {
            headers: {
                'apikey': anonKey,
                'Authorization': `Bearer ${anonKey}`
            }
        });
        
        const fs = require('fs');
        const text = await response.text();
        fs.writeFileSync('sb_resp.html', `Status: ${response.status}\n\n${text}`);
        console.log('Saved response to sb_resp.html');
    } catch (e) {
        console.error('Fetch Error:', e.message);
    }
}
testSupabase();
