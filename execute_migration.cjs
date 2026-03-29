const fs = require('fs');
const https = require('https');
const path = require('path');

const ref = 'lneykvvxkrhdiyqyephn';
const token = 'sbp_c36fb34d53e90f639746d3ebffcf8a73d83f8e90';

const sqlPath = path.join(__dirname, 'full_migration_master.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

const data = JSON.stringify({ query: sql });

const options = {
  hostname: 'api.supabase.com',
  port: 443,
  path: `/v1/projects/${ref}/query`,
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (d) => body += d);
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    console.log('Body:', body);
  });
});

req.on('error', (e) => console.error(e));
req.write(data);
req.end();
