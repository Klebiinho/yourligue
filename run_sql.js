import https from 'https';

const query = process.argv[2];
const token = 'sbp_a74ef85b03b245b46282900be4da2747912c9901';
const ref = 'igbaydpamtpubqklsfnq';

if (!query) {
    console.error('No query provided');
    process.exit(1);
}

const data = JSON.stringify({ query });

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
    console.log(body);
    if (res.statusCode !== 200 && res.statusCode !== 201) {
        process.exit(1);
    }
  });
});

req.on('error', (e) => {
    console.error(e);
    process.exit(1);
});
req.write(data);
req.end();
