const PAT = 'sbp_599b98bf2e66c8251beb4f9b6959b5b30e40c8dc';
const PROJECT_REF = 'vlvbalmntwccmafobxwk';

const sql = `
-- Habilitar extensão de UUID
create extension if not exists "uuid-ossp";

-- Tabela de Times
create table if not exists teams (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  logo text,
  group_name text,
  created_at timestamp with time zone default now()
);

-- Tabela de Jogadores
create table if not exists players (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid references teams(id) on delete cascade,
  name text not null,
  number integer not null,
  position text not null,
  photo text,
  created_at timestamp with time zone default now()
);

-- Tabela de Partidas
create table if not exists matches (
  id uuid primary key default uuid_generate_v4(),
  home_team_id uuid references teams(id) on delete cascade,
  away_team_id uuid references teams(id) on delete cascade,
  home_score integer default 0,
  away_score integer default 0,
  status text check (status in ('scheduled', 'live', 'finished')) default 'scheduled',
  timer integer default 0,
  youtube_live_id text,
  youtube_stream_key text,
  created_at timestamp with time zone default now()
);

-- Tabela de Eventos (Gols, Cartões)
create table if not exists match_events (
  id uuid primary key default uuid_generate_v4(),
  match_id uuid references matches(id) on delete cascade,
  team_id uuid references teams(id) on delete cascade,
  player_id uuid references players(id) on delete cascade,
  type text check (type in ('goal', 'yellow_card', 'red_card', 'substitution', 'foul')) not null,
  minute integer not null,
  created_at timestamp with time zone default now()
);

-- Configurações da Liga
create table if not exists league_settings (
  id integer primary key default 1,
  name text not null default 'Minha Liga',
  max_teams integer not null default 32,
  logo text,
  constraint single_row check (id = 1)
);

-- Registro Inicial
insert into league_settings (id, name, max_teams)
values (1, 'YourLigue', 32)
on conflict (id) do update set max_teams = 32;

-- Clear old records
DELETE FROM matches;
DELETE FROM players;
DELETE FROM teams;

-- Insert teams
INSERT INTO teams (name, group_name, logo) VALUES 
('REAL PORTO F.C', 'A', 'https://images.unsplash.com/photo-1599839619722-39751411ea63?w=150&h=150&fit=crop'),
('SENZALACITY', 'A', 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=150&h=150&fit=crop'),
('IMUBAI FC', 'A', 'https://images.unsplash.com/photo-1518605368461-1e1e38ce8ba9?w=150&h=150&fit=crop'),
('SELECAO TRANCOSO', 'A', 'https://images.unsplash.com/photo-1574629810360-7efbb42f4c01?w=150&h=150&fit=crop'),
('RIVER TRANCOSO', 'A', 'https://images.unsplash.com/photo-1600250395371-bd3101d2bc05?w=150&h=150&fit=crop'),

('ALPHA FO', 'B', 'https://images.unsplash.com/photo-1508344928928-7137b29de218?w=150&h=150&fit=crop'),
('EXECUTA', 'B', 'https://images.unsplash.com/photo-1551280857-2b9ebf262c1e?w=150&h=150&fit=crop'),
('CELTICS', 'B', 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=150&h=150&fit=crop'),
('DUAVESSO FC', 'B', 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?w=150&h=150&fit=crop'),
('REAL JC', 'B', 'https://images.unsplash.com/photo-1624880357913-a8539238165b?w=150&h=150&fit=crop'),
('FURIA', 'B', 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=150&h=150&fit=crop'),

('IBIS FC', 'C', 'https://images.unsplash.com/photo-1510566337590-2fc1f21d0faa?w=150&h=150&fit=crop'),
('SALVADOR', 'C', 'https://images.unsplash.com/photo-1590485601323-c918335dc1eb?w=150&h=150&fit=crop'),
('IFBA', 'C', 'https://images.unsplash.com/photo-1521503915150-13bb33fbc2df?w=150&h=150&fit=crop'),
('ANE ANE SPORTS', 'C', 'https://images.unsplash.com/photo-1557088463-2b220ff1f1cc?w=150&h=150&fit=crop'),
('REAL MATISMO', 'C', 'https://images.unsplash.com/photo-1616422285623-1456a2bbecba?w=150&h=150&fit=crop'),

('MAGNUS', 'D', 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=150&h=150&fit=crop'),
('NOVA HOLANDA', 'D', 'https://images.unsplash.com/photo-1431324155629-1a6bbe231c16?w=150&h=150&fit=crop'),
('IF PORTO', 'D', 'https://images.unsplash.com/photo-1518063319789-7217e6706b04?w=150&h=150&fit=crop'),
('MENINOS DA VILA', 'D', 'https://images.unsplash.com/photo-1564773837943-7f61c6bc1e2c?w=150&h=150&fit=crop'),
('DEMETRYUS', 'D', 'https://images.unsplash.com/photo-1594916894082-f72007823521?w=150&h=150&fit=crop');
`;

async function executeSql() {
    const url = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${PAT}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: sql })
        });

        if (!response.ok) {
            const err = await response.text();
            console.error('SQL Execution failed:', err);
        } else {
            console.log('SQL Executed and Schema created successfully!');
        }
    } catch (error) {
        console.error('Network Error:', error);
    }
}

executeSql();
