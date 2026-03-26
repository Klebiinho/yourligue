const https = require('https');
const ACCESS_TOKEN = 'sbp_c36fb34d53e90f639746d3ebffcf8a73d83f8e90';
const PROJECT_ID = 'igbaydpamtpubqklsfnq';
const LEAGUE_ID = '4b5e84be-8677-407e-bdd1-4d59474eb836';

const sql = `
SELECT 
  (SELECT count(*) FROM teams WHERE league_id = '${LEAGUE_ID}') as teams_count,
  (SELECT count(*) FROM matches WHERE league_id = '${LEAGUE_ID}') as matches_count,
  (SELECT count(*) FROM match_events WHERE match_id IN (SELECT id FROM matches WHERE league_id = '${LEAGUE_ID}')) as events_count,
  (SELECT count(*) FROM players WHERE team_id IN (SELECT id FROM teams WHERE league_id = '${LEAGUE_ID}')) as players_count
`;

const postData = JSON.stringify({ query: sql });
const options = {
  hostname: 'api.supabase.com',
  port: 443,
  path: `/v1/projects/${PROJECT_ID}/database/query`,
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (d) => { body += d; });
  res.on('end', () => {
    console.log('Body:', body);
  });
});

req.on('error', (e) => console.error(e));
req.write(postData);
req.end();
