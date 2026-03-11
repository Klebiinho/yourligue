import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';

export type Player = { id: string; name: string; number: number; position: string; photo?: string; stats: { goals: number; assists: number; yellowCards: number; redCards: number } };
export type Team = { id: string; name: string; logo: string; players: Player[]; stats: { matches: number; wins: number; draws: number; losses: number; goalsFor: number; goalsAgainst: number } };
export type MatchEvent = { id: string; type: 'goal' | 'yellow_card' | 'red_card' | 'substitution' | 'foul' | 'penalty_goal' | 'penalty_miss'; teamId: string; playerId: string; minute: number };
export type Match = {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  status: 'scheduled' | 'live' | 'finished';
  events: MatchEvent[];
  timer: number;
  youtubeLiveId?: string;
  youtubeStreamKey?: string;
  isStreaming?: boolean;
  halfLength?: number;
  extraTime?: number;
  period?: string;
};
export type League = {
  name: string;
  maxTeams: number;
  logo: string;
  pointsForWin: number;
  pointsForDraw: number;
  pointsForLoss: number;
  defaultHalfLength: number;
};

interface ChampionshipContextType {
  league: League;
  teams: Team[];
  matches: Match[];
  updateLeague: (leagueData: Partial<League>) => void;
  addTeam: (team: Omit<Team, 'id' | 'players' | 'stats'>) => void;
  updateTeam: (teamId: string, teamData: Partial<Team>) => void;
  deleteTeam: (teamId: string) => void;
  addPlayer: (teamId: string, player: Omit<Player, 'id' | 'stats'>) => void;
  removePlayer: (teamId: string, playerId: string) => void;
  createMatch: (homeTeamId: string, awayTeamId: string, youtubeLiveId?: string) => void;
  startMatch: (matchId: string) => void;
  endMatch: (matchId: string) => void;
  updateTimer: (matchId: string, time: number) => void;
  addEvent: (matchId: string, event: Omit<MatchEvent, 'id'>) => void;
  updateMatch: (matchId: string, data: Partial<Match>) => void;
  deleteMatch: (matchId: string) => void;
}

const ChampionshipContext = createContext<ChampionshipContextType | undefined>(undefined);

export const ChampionshipProvider = ({ children }: { children: ReactNode }) => {
  const [league, setLeague] = useState<League>({
    name: 'My League',
    maxTeams: 12,
    logo: '',
    pointsForWin: 3,
    pointsForDraw: 1,
    pointsForLoss: 0,
    defaultHalfLength: 45
  });
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  // Load Initial Data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // 1. Fetch League
      const { data: leagueData } = await supabase.from('league_settings').select('*').single();
      if (leagueData) setLeague({
        name: leagueData.name,
        maxTeams: leagueData.max_teams,
        logo: leagueData.logo || '',
        pointsForWin: leagueData.points_for_win ?? 3,
        pointsForDraw: leagueData.points_for_draw ?? 1,
        pointsForLoss: leagueData.points_for_loss ?? 0,
        defaultHalfLength: leagueData.default_half_length ?? 45
      });

      // 2. Fetch Teams and Players
      const { data: teamsData } = await supabase.from('teams').select('*, players(*)');
      if (teamsData) {
        const formattedTeams: Team[] = teamsData.map(t => ({
          id: t.id,
          name: t.name,
          logo: t.logo || '',
          players: t.players.map((p: any) => ({
            id: p.id,
            name: p.name,
            number: p.number,
            position: p.position,
            photo: p.photo || '',
            stats: { goals: 0, assists: 0, yellowCards: 0, redCards: 0 } // Stats calculated from events
          })),
          stats: { matches: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 }
        }));
        setTeams(formattedTeams);
      }

      // 3. Fetch Matches and Events
      const { data: matchesData } = await supabase.from('matches').select('*, match_events(*)');
      if (matchesData) {
        const formattedMatches: Match[] = matchesData.map(m => ({
          id: m.id,
          homeTeamId: m.home_team_id,
          awayTeamId: m.away_team_id,
          homeScore: m.home_score,
          awayScore: m.away_score,
          status: m.status as any,
          timer: m.timer,
          youtubeLiveId: m.youtube_live_id,
          youtubeStreamKey: m.youtube_stream_key,
          halfLength: m.half_length,
          extraTime: m.extra_time,
          period: m.period,
          events: m.match_events.map((e: any) => ({
            id: e.id,
            type: e.type,
            teamId: e.team_id,
            playerId: e.player_id,
            minute: e.minute
          }))
        }));
        setMatches(formattedMatches);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const updateLeague = async (leagueData: Partial<League>) => {
    setLeague(prev => ({ ...prev, ...leagueData }));
    await supabase.from('league_settings').update({
      name: leagueData.name,
      max_teams: leagueData.maxTeams,
      logo: leagueData.logo,
      points_for_win: leagueData.pointsForWin,
      points_for_draw: leagueData.pointsForDraw,
      points_for_loss: leagueData.pointsForLoss,
      default_half_length: leagueData.defaultHalfLength
    }).eq('id', 1);
  };

  const addTeam = async (team: Omit<Team, 'id' | 'players' | 'stats'>) => {
    const { data } = await supabase.from('teams').insert([{ name: team.name, logo: team.logo }]).select().single();
    if (data) {
      setTeams([...teams, { ...team, id: data.id, players: [], stats: { matches: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 } }]);
    }
  };

  const updateTeam = async (teamId: string, teamData: Partial<Team>) => {
    setTeams(teams.map(t => t.id === teamId ? { ...t, ...teamData } : t));
    await supabase.from('teams').update({ name: teamData.name, logo: teamData.logo }).eq('id', teamId);
  };

  const deleteTeam = async (teamId: string) => {
    setTeams(teams.filter(t => t.id !== teamId));
    setMatches(matches.filter(m => m.homeTeamId !== teamId && m.awayTeamId !== teamId));
    await supabase.from('teams').delete().eq('id', teamId);
  };

  const addPlayer = async (teamId: string, player: Omit<Player, 'id' | 'stats'>) => {
    const { data } = await supabase.from('players').insert([{
      team_id: teamId,
      name: player.name,
      number: player.number,
      position: player.position,
      photo: player.photo
    }]).select().single();

    if (data) {
      setTeams(teams.map(t => t.id === teamId ? { ...t, players: [...t.players, { ...player, id: data.id, stats: { goals: 0, assists: 0, yellowCards: 0, redCards: 0 } }] } : t));
    }
  };

  const removePlayer = async (teamId: string, playerId: string) => {
    setTeams(teams.map(t => t.id === teamId ? { ...t, players: t.players.filter(p => p.id !== playerId) } : t));
    await supabase.from('players').delete().eq('id', playerId);
  };

  const createMatch = async (homeTeamId: string, awayTeamId: string, youtubeLiveId?: string) => {
    const { data } = await supabase.from('matches').insert([{
      home_team_id: homeTeamId,
      away_team_id: awayTeamId,
      youtube_live_id: youtubeLiveId,
      status: 'scheduled',
      half_length: league.defaultHalfLength
    }]).select().single();

    if (data) {
      setMatches([...matches, {
        id: data.id,
        homeTeamId,
        awayTeamId,
        homeScore: 0,
        awayScore: 0,
        status: 'scheduled',
        events: [],
        timer: 0,
        youtubeLiveId,
        halfLength: league.defaultHalfLength,
        extraTime: 0,
        period: '1º Tempo'
      }]);
    }
  };

  const startMatch = async (matchId: string) => {
    setMatches(matches.map(m => m.id === matchId ? { ...m, status: 'live' } : m));
    await supabase.from('matches').update({ status: 'live' }).eq('id', matchId);
  };

  const endMatch = async (matchId: string) => {
    setMatches(matches.map(m => m.id === matchId ? { ...m, status: 'finished' } : m));
    await supabase.from('matches').update({ status: 'finished' }).eq('id', matchId);
  };

  const deleteMatch = async (matchId: string) => {
    setMatches(matches.filter(m => m.id !== matchId));
    await supabase.from('matches').delete().eq('id', matchId);
  };

  const updateTimer = (matchId: string, time: number) => {
    setMatches(matches.map(m => m.id === matchId ? { ...m, timer: time } : m));
    // We don't necessarily need to persist every second to DB for performance, 
    // maybe only on specific intervals or status changes.
    if (time % 30 === 0) {
      supabase.from('matches').update({ timer: time }).eq('id', matchId).then();
    }
  };

  const addEvent = async (matchId: string, event: Omit<MatchEvent, 'id'>) => {
    const { data } = await supabase.from('match_events').insert([{
      match_id: matchId,
      team_id: event.teamId,
      player_id: event.playerId,
      type: event.type,
      minute: event.minute
    }]).select().single();

    if (data) {
      setMatches(matches.map(m => {
        if (m.id !== matchId) return m;
        let newHome = m.homeScore;
        let newAway = m.awayScore;
        if (event.type === 'goal') {
          if (m.homeTeamId === event.teamId) newHome++;
          if (m.awayTeamId === event.teamId) newAway++;
          // Sync score to match table
          supabase.from('matches').update({ home_score: newHome, away_score: newAway }).eq('id', matchId).then();
        }
        return {
          ...m,
          homeScore: newHome,
          awayScore: newAway,
          events: [...m.events, { ...event, id: data.id }]
        };
      }));
    }
  };

  const updateMatch = async (matchId: string, data: Partial<Match>) => {
    setMatches(matches.map(m => m.id === matchId ? { ...m, ...data } : m));
    await supabase.from('matches').update({
      youtube_live_id: data.youtubeLiveId,
      youtube_stream_key: data.youtubeStreamKey,
      status: data.status,
      half_length: data.halfLength,
      extra_time: data.extraTime,
      period: data.period
    }).eq('id', matchId);
  };

  if (loading) return <div className="loading-screen">Preparing your championship...</div>;

  return (
    <ChampionshipContext.Provider value={{
      league, teams, matches,
      updateLeague, addTeam, updateTeam, deleteTeam,
      addPlayer, removePlayer,
      createMatch, startMatch, endMatch, updateTimer, addEvent,
      updateMatch, deleteMatch
    }}>
      {children}
    </ChampionshipContext.Provider>
  );
};

export const useChampionship = () => {
  const context = useContext(ChampionshipContext);
  if (!context) throw new Error('useChampionship must be used within a ChampionshipProvider');
  return context;
};
