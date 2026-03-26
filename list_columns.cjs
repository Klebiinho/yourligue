const https = require('https');

const PROJECT_ID = 'igbaydpamtpubqklsfnq';
const API_KEY = process.env.SUPABASE_SECRET_API_KEY || 'sbp_71d7829a28edbc85e5f03f3ea2eaead9581a0735';

function listColumns() {
    const query = JSON.stringify({
        query: `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'teams';`
    });

    const options = {
        hostname: 'api.supabase.com',
        path: `/v1/projects/${PROJECT_ID}/database/query`,
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
            'Content-Length': query.length
        }
    };

    const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => {
            responseData += chunk;
        });
        res.on('end', () => {
            try {
                const data = JSON.parse(responseData);
                console.log(JSON.stringify(data, null, 2));
            } catch (e) {
                console.log('Error parsing JSON:', responseData);
            }
        });
    });

    req.on('error', (error) => {
        console.error(error);
    });

    req.write(query);
    req.end();
}

listColumns();
