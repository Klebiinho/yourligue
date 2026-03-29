async function check() {
    console.log('Testing Supabase with short timeout...');
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        
        const res = await fetch('https://igbaydpamtpubqklsfnq.supabase.co/rest/v1/', {
            signal: controller.signal
        });
        console.log(`Status: ${res.status}`);
    } catch (e) {
        console.error('Fetch error:', e.name === 'AbortError' ? 'TIMEOUT (Project likely PAUSED)' : e.message);
    }
}
check();
