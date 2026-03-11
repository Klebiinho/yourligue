import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export type Player = { id: string; name: string; number: number; position: string; photo?: string; stats: { goals: number; assists: number; yellowCards: number; redCards: number } };
export type Team = { id: string; name: string; logo: string; players: Player[]; stats: { matches: number; wins: number; draws: number; losses: number; goalsFor: number; goalsAgainst: number } };
export type MatchEvent = { id: string; type: 'goal' | 'yellow_card' | 'red_card' | 'substitution' | 'foul'; teamId: string; playerId: string; minute: number };
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
};
export type League = { name: string; maxTeams: number; logo: string };

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
}

const ChampionshipContext = createContext<ChampionshipContextType | undefined>(undefined);

export const ChampionshipProvider = ({ children }: { children: ReactNode }) => {
  const [league, setLeague] = useState<League>({ name: 'My League', maxTeams: 12, logo: '' });
  const [teams, setTeams] = useState<Team[]>([
    { id: 't1', name: 'Thunder FC', logo: 'https://images.unsplash.com/photo-1599839619722-39751411ea63?w=150&h=150&fit=crop', players: [{ id: 'p1', name: 'John Doe', number: 10, position: 'Forward', stats: { goals: 0, assists: 0, yellowCards: 0, redCards: 0 } }], stats: { matches: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 } },
    { id: 't2', name: 'Lions City', logo: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=150&h=150&fit=crop', players: [{ id: 'p2', name: 'Mike Smith', number: 7, position: 'Midfielder', stats: { goals: 0, assists: 0, yellowCards: 0, redCards: 0 } }], stats: { matches: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 } }
  ]);
  const [matches, setMatches] = useState<Match[]>([]);

  const updateLeague = (leagueData: Partial<League>) => {
    setLeague({ ...league, ...leagueData });
  };

  const addTeam = (team: Omit<Team, 'id' | 'players' | 'stats'>) => {
    setTeams([...teams, { ...team, id: Date.now().toString(), players: [], stats: { matches: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 } }]);
  };

  const updateTeam = (teamId: string, teamData: Partial<Team>) => {
    setTeams(teams.map(t => t.id === teamId ? { ...t, ...teamData } : t));
  };

  const deleteTeam = (teamId: string) => {
    setTeams(teams.filter(t => t.id !== teamId));
    setMatches(matches.filter(m => m.homeTeamId !== teamId && m.awayTeamId !== teamId));
  };

  const addPlayer = (teamId: string, player: Omit<Player, 'id' | 'stats'>) => {
    setTeams(teams.map(t => t.id === teamId ? { ...t, players: [...t.players, { ...player, id: Date.now().toString(), stats: { goals: 0, assists: 0, yellowCards: 0, redCards: 0 } }] } : t));
  };

  const removePlayer = (teamId: string, playerId: string) => {
    setTeams(teams.map(t => t.id === teamId ? { ...t, players: t.players.filter(p => p.id !== playerId) } : t));
  };

  const createMatch = (homeTeamId: string, awayTeamId: string, youtubeLiveId?: string) => {
    setMatches([...matches, { id: Date.now().toString(), homeTeamId, awayTeamId, homeScore: 0, awayScore: 0, status: 'scheduled', events: [], timer: 0, youtubeLiveId }]);
  };

  const startMatch = (matchId: string) => {
    setMatches(matches.map(m => m.id === matchId ? { ...m, status: 'live' } : m));
  };

  const endMatch = (matchId: string) => {
    setMatches(matches.map(m => m.id === matchId ? { ...m, status: 'finished' } : m));
  };

  const updateTimer = (matchId: string, time: number) => {
    setMatches(matches.map(m => m.id === matchId ? { ...m, timer: time } : m));
  };

  const addEvent = (matchId: string, event: Omit<MatchEvent, 'id'>) => {
    setMatches(matches.map(m => {
      if (m.id !== matchId) return m;
      let newHome = m.homeScore;
      let newAway = m.awayScore;
      if (event.type === 'goal') {
        if (m.homeTeamId === event.teamId) newHome++;
        if (m.awayTeamId === event.teamId) newAway++;
      }
      return {
        ...m,
        homeScore: newHome,
        awayScore: newAway,
        events: [...m.events, { ...event, id: Date.now().toString() }]
      };
    }));
  };

  const updateMatch = (matchId: string, data: Partial<Match>) => {
    setMatches(matches.map(m => m.id === matchId ? { ...m, ...data } : m));
  };

  return (
    <ChampionshipContext.Provider value={{
      league, teams, matches,
      updateLeague, addTeam, updateTeam, deleteTeam,
      addPlayer, removePlayer,
      createMatch, startMatch, endMatch, updateTimer, addEvent,
      updateMatch
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
