
const https = require('https');

const ACCESS_TOKEN = 'sbp_c36fb34d53e90f639746d3ebffcf8a73d83f8e90';
const PROJECT_ID = 'igbaydpamtpubqklsfnq';

const sql = `ALTER TABLE leagues ADD COLUMN IF NOT EXISTS allow_substitution_return BOOLEAN DEFAULT TRUE;`;

const postData = JSON.stringify({ query: sql });

const options = {
  hostname: 'api.supabase.com',
  port: 443,
  path: '/v1/projects/' + PROJECT_ID + '/database/query',
  method: 'POST',
  family: 4, // Force IPv4 to avoid ETIMEDOUT on IPv6
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

req.on('error', (e) => {
  console.error('Error info:');
  console.error(e);
});

req.write(postData);
req.end();
