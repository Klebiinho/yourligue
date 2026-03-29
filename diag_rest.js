const url = 'https://igbaydpamtpubqklsfnq.supabase.co/rest/v1/ads?select=id';
const key = 'sb_publishable_G_czqd25ULE7hyeUnlsfHg_X8uDuaQL';

async function check() {
    console.log('Testing ADS table accessibility...');
    try {
        const res = await fetch(url, {
            headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`
            }
        });
        const status = res.status;
        const text = await res.text();
        console.log(`Status: ${status}`);
        console.log(`Response: ${text.substring(0, 100)}`);
    } catch (e) {
        console.error('Fetch error:', e.message);
    }
}
check();
