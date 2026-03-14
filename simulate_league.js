
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manual dotenv loading for ESM without dependency
const envPath = path.resolve('.env.local');
const envConfig = fs.readFileSync(envPath, 'utf8')
  .split('\n')
  .forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) process.env[key.trim()] = value.trim();
  });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Credentials missing. Check .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const LEAGUE_NAME = 'COPA NONY 4';

const GROUPS = {
  'A': ['REAL PORTO F.C', 'SENZALACITY', 'IMUBAI FC', 'SELECAO TRANCOSO', 'RIVER TRANCOSO'],
  'B': ['ALPHA FO', 'EXECUTA', 'CELTICS', 'DUAVESSO FC', 'REAL JC', 'FURIA'],
  'C': ['IBIS FC', 'SALVADOR', 'IFBA', 'ANE ANE SPORTS', 'REAL MATISMO'],
  'D': ['MAGNUS', 'NOVA HOLANDA', 'IF PORTO', 'MENINOS DA VILA', 'DEMETRYUS']
};

const POSITIONS = ['Goleiro', 'Defensor', 'Meio-Campo', 'Atacante'];

async function run() {
  console.log(`🚀 Iniciando simulação para ${LEAGUE_NAME}...`);

  // 1. Encontrar ou criar liga
  let { data: league, error: leagueError } = await supabase
    .from('leagues')
    .select('*')
    .ilike('name', LEAGUE_NAME)
    .maybeSingle();

  if (leagueError) {
      console.error('Erro ao buscar liga:', leagueError);
      return;
  }

  if (!league) {
    console.log('Liga não encontrada, criando...');
    const { data: anyLeague } = await supabase.from('leagues').select('user_id').limit(1).single();
    const userId = anyLeague?.user_id || '9859f136-1e0c-4861-8316-f7f6f1c7d21a';

    const { data: newLeague, error: createError } = await supabase
      .from('leagues')
      .insert({
        name: LEAGUE_NAME,
        user_id: userId,
        max_teams: 32,
        points_for_win: 3,
        points_for_draw: 1,
        points_for_loss: 0,
        default_half_length: 20
      })
      .select()
      .single();
    
    if (createError) {
      console.error('Erro ao criar liga:', createError);
      return;
    }
    league = newLeague;
  }

  console.log(`✅ Liga ID: ${league.id}`);

  // 2. Times e Jogadores
  for (const [groupName, teamNames] of Object.entries(GROUPS)) {
    console.log(`📦 Processando Grupo ${groupName}...`);
    for (const teamName of teamNames) {
      // Check if team exists to avoid duplicates
      let { data: team } = await supabase.from('teams').select('id').eq('league_id', league.id).eq('name', teamName).maybeSingle();

      if (!team) {
        const { data: newTeam, error: teamError } = await supabase
          .from('teams')
          .insert({
            league_id: league.id,
            name: teamName,
            group_name: groupName,
            logo: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(teamName)}`
          })
          .select()
          .single();

        if (teamError) {
          console.error(`Erro ao criar time ${teamName}:`, teamError);
          continue;
        }
        team = newTeam;

        // Criar Jogadores (5 titulares, 3 reservas)
        const players = [];
        for (let i = 1; i <= 8; i++) {
          players.push({
            team_id: team.id,
            name: `Jogador ${i} - ${teamName}`,
            number: i,
            position: POSITIONS[Math.floor(Math.random() * POSITIONS.length)],
            is_captain: i === 1,
            is_reserve: i > 5
          });
        }
        await supabase.from('players').insert(players);
      }
    }
  }

  // 3. Rodada de Jogos por grupo
  for (const [groupName] of Object.entries(GROUPS)) {
    const { data: teamsInGroup } = await supabase
      .from('teams')
      .select('id, name')
      .eq('league_id', league.id)
      .eq('group_name', groupName);

    if (!teamsInGroup) continue;

    console.log(`⚽ Gerando jogos para o Grupo ${groupName}...`);
    for (let i = 0; i < teamsInGroup.length; i++) {
      for (let j = i + 1; j < teamsInGroup.length; j++) {
        const home = teamsInGroup[i];
        const away = teamsInGroup[j];
        
        // Evitar duplicatas de jogos
        const { data: existingMatch } = await supabase
            .from('matches')
            .select('id')
            .eq('home_team_id', home.id)
            .eq('away_team_id', away.id)
            .maybeSingle();
        
        if (existingMatch) continue;

        const isFinished = Math.random() > 0.4;
        const status = isFinished ? 'finished' : 'live';
        const homeScore = isFinished ? Math.floor(Math.random() * 5) : 0;
        const awayScore = isFinished ? Math.floor(Math.random() * 5) : 0;

        const { data: match, error: matchError } = await supabase
          .from('matches')
          .insert({
            league_id: league.id,
            home_team_id: home.id,
            away_team_id: away.id,
            home_score: homeScore,
            away_score: awayScore,
            status: status,
            scheduled_at: new Date(Date.now() - Math.random() * 10000000).toISOString(),
            half_length: 20,
            period: isFinished ? 'Encerrado' : '1º Tempo',
            timer: isFinished ? 40 : 15
          })
          .select()
          .single();

        if (matchError) continue;

        if (isFinished) {
          const events = [];
          const { data: homePlayers } = await supabase.from('players').select('id').eq('team_id', home.id);
          const { data: awayPlayers } = await supabase.from('players').select('id').eq('team_id', away.id);

          for (let g = 0; g < homeScore; g++) {
            events.push({
              match_id: match.id, team_id: home.id, 
              player_id: homePlayers[Math.floor(Math.random() * homePlayers.length)].id,
              type: 'goal', minute: Math.floor(Math.random() * 40)
            });
          }
          for (let g = 0; g < awayScore; g++) {
            events.push({
              match_id: match.id, team_id: away.id, 
              player_id: awayPlayers[Math.floor(Math.random() * awayPlayers.length)].id,
              type: 'goal', minute: Math.floor(Math.random() * 40)
            });
          }
          
          // Cartões
          if (homePlayers && awayPlayers) {
              const all = [...homePlayers.map(p => ({...p, t: home.id})), ...awayPlayers.map(p => ({...p, t: away.id}))];
              for(let c=0; c<3; c++) {
                  const p = all[Math.floor(Math.random()*all.length)];
                  events.push({
                      match_id: match.id, team_id: p.t, player_id: p.id,
                      type: Math.random() > 0.8 ? 'red_card' : 'yellow_card',
                      minute: Math.floor(Math.random() * 40)
                  });
              }
          }

          if (events.length > 0) await supabase.from('match_events').insert(events);
        }
      }
    }
  }

  console.log('✨ Simulação concluída com sucesso!');
}

run();
