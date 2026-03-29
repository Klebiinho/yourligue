async function check() {
    console.log('Testing internet connectivity...');
    try {
        const res = await fetch('https://www.google.com');
        console.log(`Google status: ${res.status}`);
    } catch (e) {
        console.error('Fetch error:', e.message);
    }
}
check();
