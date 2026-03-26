const https = require('https');
const fs = require('fs');
const path = require('path');

const ACCESS_TOKEN = 'sbp_c36fb34d53e90f639746d3ebffcf8a73d83f8e90';
const PROJECT_ID = 'igbaydpamtpubqklsfnq';

const sql = `
CREATE INDEX IF NOT EXISTS idx_teams_league_id ON public.teams(league_id);
CREATE INDEX IF NOT EXISTS idx_matches_league_id ON public.matches(league_id);
CREATE INDEX IF NOT EXISTS idx_matches_updated_at ON public.matches(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_match_events_match_id ON public.match_events(match_id);
CREATE INDEX IF NOT EXISTS idx_match_events_player_id ON public.match_events(player_id);
CREATE INDEX IF NOT EXISTS idx_players_team_id ON public.players(team_id);
CREATE INDEX IF NOT EXISTS idx_players_league_id ON public.players(league_id);
CREATE INDEX IF NOT EXISTS idx_brackets_league_id ON public.brackets(league_id);
CREATE INDEX IF NOT EXISTS idx_ads_league_id ON public.ads(league_id);
`;

const data = JSON.stringify({ query: sql });

const options = {
  hostname: 'api.supabase.com',
  port: 443,
  path: `/v1/projects/${PROJECT_ID}/database/query`,
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (d) => { body += d; });
  res.on('end', () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log('✅ Success: Performance indexes created via Management API.');
    } else {
      console.error(`❌ HTTP Error ${res.statusCode}:`, body);
    }
  });
});

req.on('error', (e) => {
  console.error('💥 Request error:', e);
});

req.write(data);
req.end();
