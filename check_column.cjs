
const https = require('https');

const ACCESS_TOKEN = 'sbp_c36fb34d53e90f639746d3ebffcf8a73d83f8e90';
const PROJECT_ID = 'igbaydpamtpubqklsfnq';

const sql = `SELECT column_name FROM information_schema.columns WHERE table_name='leagues' AND column_name='allow_substitution_return';`;

const postData = JSON.stringify({ query: sql });

const options = {
  hostname: 'api.supabase.com',
  port: 443,
  path: '/v1/projects/' + PROJECT_ID + '/database/query',
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + ACCESS_TOKEN,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (d) => { body += d; });
  res.on('end', () => {
    console.log('Status: ' + res.statusCode);
    console.log('Body: ' + body);
  });
});

req.on('error', (e) => console.error(e));
req.write(postData);
req.end();
