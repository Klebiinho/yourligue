import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

// ─── Types ───────────────────────────────────────────────────
export type Player = {
    id: string;
    name: string;
    number: number;
    position: string;
    photo?: string;
    isCaptain?: boolean;
    stats: { goals: number; assists: number; yellowCards: number; redCards: number };
};

export type Team = {
    id: string;
    name: string;
    logo: string;
    players: Player[];
    stats: { matches: number; wins: number; draws: number; losses: number; goalsFor: number; goalsAgainst: number };
};

export type MatchEvent = {
    id: string;
    type: 'goal' | 'assist' | 'yellow_card' | 'red_card' | 'substitution' | 'foul' | 'penalty_goal' | 'penalty_miss';
    teamId: string;
    playerId: string;
    minute: number;
};

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
    halfLength?: number;
    extraTime?: number;
    period?: string;
    scheduledAt?: string;
    location?: string;
};

export type BracketMatch = {
    id: string;
    round: 'oitavas' | 'quartas' | 'semifinal' | 'final';
    matchOrder: number;
    homeTeamId?: string;
    awayTeamId?: string;
    homeScore: number;
    awayScore: number;
    status: 'scheduled' | 'live' | 'finished';
};

export type League = {
    id: string;
    name: string;
    logo: string;
    maxTeams: number;
    pointsForWin: number;
    pointsForDraw: number;
    pointsForLoss: number;
    defaultHalfLength: number;
};

// ─── Context Type ────────────────────────────────────────────
interface LeagueContextType {
    league: League | null;
    leagues: League[];
    teams: Team[];
    matches: Match[];
    brackets: BracketMatch[];
    loading: boolean;
    dataLoading: boolean;

    // League actions
    createLeague: (data: Omit<League, 'id'>) => Promise<void>;
    updateLeague: (data: Partial<League>) => Promise<void>;
    deleteLeague: (id: string) => Promise<void>;
    selectLeague: (id: string) => void;

    // Team actions
    addTeam: (team: { name: string; logo: string }) => Promise<{ error: string | null }>;
    updateTeam: (teamId: string, data: Partial<{ name: string; logo: string }>) => Promise<void>;
    deleteTeam: (teamId: string) => Promise<void>;

    // Player actions
    addPlayer: (teamId: string, player: Omit<Player, 'id' | 'stats'>) => Promise<{ error: string | null }>;
    updatePlayer: (teamId: string, playerId: string, data: Partial<Player>) => Promise<void>;
    removePlayer: (teamId: string, playerId: string) => Promise<void>;
    toggleCaptain: (teamId: string, playerId: string) => Promise<void>;

    // Match actions
    createMatch: (data: { homeTeamId: string; awayTeamId: string; scheduledAt?: string; location?: string; youtubeLiveId?: string }) => Promise<{ error: string | null }>;
    updateMatch: (matchId: string, data: Partial<Match>) => Promise<void>;
    deleteMatch: (matchId: string) => Promise<void>;
    startMatch: (matchId: string) => Promise<void>;
    endMatch: (matchId: string) => Promise<void>;
    updateTimer: (matchId: string, time: number) => Promise<void>;
    addEvent: (matchId: string, event: Omit<MatchEvent, 'id'>) => Promise<void>;
    removeEvent: (matchId: string, eventId: string) => Promise<void>;

    // Bracket actions
    generateBracket: () => Promise<void>;
    updateBracket: (bracketId: string, data: Partial<BracketMatch>) => Promise<void>;
}

const LeagueContext = createContext<LeagueContextType | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────
export const LeagueProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();

    const [leagues, setLeagues] = useState<League[]>([]);
    const [league, setLeague] = useState<League | null>(null);
    const [teams, setTeams] = useState<Team[]>([]);
    const [matches, setMatches] = useState<Match[]>([]);
    const [brackets, setBrackets] = useState<BracketMatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [dataLoading, setDataLoading] = useState(false);

    // ── Load all leagues for user ──────────────────────────────
    useEffect(() => {
        if (!user) { setLeagues([]); setLeague(null); setLoading(false); return; }
        loadLeagues();
    }, [user]);

    const loadLeagues = async () => {
        setLoading(true);
        const { data } = await supabase.from('leagues').select('*').order('created_at', { ascending: true });
        if (data) {
            const mapped: League[] = data.map(l => ({
                id: l.id, name: l.name, logo: l.logo || '', maxTeams: l.max_teams,
                pointsForWin: l.points_for_win, pointsForDraw: l.points_for_draw,
                pointsForLoss: l.points_for_loss, defaultHalfLength: l.default_half_length
            }));
            setLeagues(mapped);
            if (mapped.length > 0 && !league) {
                const saved = localStorage.getItem('selectedLeagueId');
                const found = saved ? mapped.find(l => l.id === saved) : null;
                setLeague(found ?? mapped[0]);
            }
        }
        setLoading(false);
    };

    // ── Load league data (teams, matches, brackets) ────────────
    const loadLeagueData = useCallback(async (leagueId: string) => {
        setDataLoading(true);

        // Teams + Players
        const { data: teamsData } = await supabase
            .from('teams').select('*, players(*)').eq('league_id', leagueId).order('created_at');

        // Matches + Events
        const { data: matchesData } = await supabase
            .from('matches').select('*, match_events(*)').eq('league_id', leagueId).order('created_at');

        // Brackets
        const { data: bracketsData } = await supabase
            .from('brackets').select('*').eq('league_id', leagueId).order('match_order');

        if (teamsData) {
            // First pass: build events per player from matches
            const allEvents = (matchesData || []).flatMap((m: any) => m.match_events || []);

            const mapped: Team[] = teamsData.map((t: any) => {
                // Calculate stats from finished matches
                const teamMatches = (matchesData || []).filter(
                    (m: any) => m.status === 'finished' && (m.home_team_id === t.id || m.away_team_id === t.id)
                );
                let wins = 0, draws = 0, losses = 0, goalsFor = 0, goalsAgainst = 0;
                teamMatches.forEach((m: any) => {
                    const isHome = m.home_team_id === t.id;
                    const gf = isHome ? m.home_score : m.away_score;
                    const ga = isHome ? m.away_score : m.home_score;
                    goalsFor += gf; goalsAgainst += ga;
                    if (gf > ga) wins++; else if (gf === ga) draws++; else losses++;
                });

                return {
                    id: t.id, name: t.name, logo: t.logo || '',
                    players: (t.players || []).map((p: any) => ({
                        id: p.id, name: p.name, number: p.number, position: p.position,
                        photo: p.photo || '', isCaptain: p.is_captain || false,
                        stats: {
                            goals: allEvents.filter((e: any) => e.player_id === p.id && e.type === 'goal').length,
                            assists: allEvents.filter((e: any) => e.player_id === p.id && e.type === 'assist').length,
                            yellowCards: allEvents.filter((e: any) => e.player_id === p.id && e.type === 'yellow_card').length,
                            redCards: allEvents.filter((e: any) => e.player_id === p.id && e.type === 'red_card').length,
                        }
                    })),
                    stats: { matches: teamMatches.length, wins, draws, losses, goalsFor, goalsAgainst }
                };
            });
            setTeams(mapped);
        }

        if (matchesData) {
            const mapped: Match[] = matchesData.map((m: any) => ({
                id: m.id, homeTeamId: m.home_team_id, awayTeamId: m.away_team_id,
                homeScore: m.home_score, awayScore: m.away_score,
                status: m.status, timer: m.timer,
                youtubeLiveId: m.youtube_live_id, halfLength: m.half_length,
                extraTime: m.extra_time, period: m.period,
                scheduledAt: m.scheduled_at, location: m.location,
                events: (m.match_events || []).map((e: any) => ({
                    id: e.id, type: e.type, teamId: e.team_id, playerId: e.player_id, minute: e.minute
                }))
            }));
            setMatches(mapped);
        }

        if (bracketsData) {
            const mapped: BracketMatch[] = bracketsData.map((b: any) => ({
                id: b.id, round: b.round, matchOrder: b.match_order,
                homeTeamId: b.home_team_id, awayTeamId: b.away_team_id,
                homeScore: b.home_score, awayScore: b.away_score, status: b.status
            }));
            setBrackets(mapped);
        }

        setDataLoading(false);
    }, []);

    useEffect(() => {
        if (league) { loadLeagueData(league.id); localStorage.setItem('selectedLeagueId', league.id); }
        else { setTeams([]); setMatches([]); setBrackets([]); }
    }, [league, loadLeagueData]);

    // ── League CRUD ────────────────────────────────────────────
    const createLeague = async (data: Omit<League, 'id'>) => {
        const { data: row } = await supabase.from('leagues').insert({
            user_id: user!.id, name: data.name, logo: data.logo, max_teams: data.maxTeams,
            points_for_win: data.pointsForWin, points_for_draw: data.pointsForDraw,
            points_for_loss: data.pointsForLoss, default_half_length: data.defaultHalfLength
        }).select().single();
        if (row) {
            const lg: League = { id: row.id, name: row.name, logo: row.logo || '', maxTeams: row.max_teams, pointsForWin: row.points_for_win, pointsForDraw: row.points_for_draw, pointsForLoss: row.points_for_loss, defaultHalfLength: row.default_half_length };
            setLeagues(prev => [...prev, lg]);
            setLeague(lg);
        }
    };

    const updateLeague = async (data: Partial<League>) => {
        if (!league) return;
        await supabase.from('leagues').update({
            name: data.name, logo: data.logo, max_teams: data.maxTeams,
            points_for_win: data.pointsForWin, points_for_draw: data.pointsForDraw,
            points_for_loss: data.pointsForLoss, default_half_length: data.defaultHalfLength
        }).eq('id', league.id);
        const updated = { ...league, ...data };
        setLeague(updated);
        setLeagues(prev => prev.map(l => l.id === league.id ? updated : l));
    };

    const deleteLeague = async (id: string) => {
        await supabase.from('leagues').delete().eq('id', id);
        const remaining = leagues.filter(l => l.id !== id);
        setLeagues(remaining);
        if (league?.id === id) setLeague(remaining[0] ?? null);
    };

    const selectLeague = (id: string) => {
        const found = leagues.find(l => l.id === id);
        if (found) setLeague(found);
    };

    // ── Team CRUD ──────────────────────────────────────────────
    const addTeam = async (team: { name: string; logo: string }) => {
        if (!league) return { error: 'Nenhuma liga selecionada' };
        const { data, error } = await supabase.from('teams').insert({ league_id: league.id, name: team.name, logo: team.logo }).select().single();
        if (error) return { error: error.message };
        if (data) {
            const newTeam: Team = { id: data.id, name: data.name, logo: data.logo || '', players: [], stats: { matches: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 } };
            setTeams(prev => [...prev, newTeam]);
        }
        return { error: null };
    };

    const updateTeam = async (teamId: string, data: Partial<{ name: string; logo: string }>) => {
        await supabase.from('teams').update(data).eq('id', teamId);
        setTeams(prev => prev.map(t => t.id === teamId ? { ...t, ...data } : t));
    };

    const deleteTeam = async (teamId: string) => {
        await supabase.from('teams').delete().eq('id', teamId);
        setTeams(prev => prev.filter(t => t.id !== teamId));
    };

    // ── Player CRUD ────────────────────────────────────────────
    const addPlayer = async (teamId: string, player: Omit<Player, 'id' | 'stats'>) => {
        const team = teams.find(t => t.id === teamId);
        if (team?.players.some(p => p.number === player.number)) {
            return { error: `O número ${player.number} já está sendo usado neste time.` };
        }
        const { data, error } = await supabase.from('players').insert({
            team_id: teamId, name: player.name, number: player.number,
            position: player.position, photo: player.photo || '', is_captain: player.isCaptain || false
        }).select().single();
        if (error) return { error: error.message };
        if (data) {
            const np: Player = { id: data.id, name: data.name, number: data.number, position: data.position, photo: data.photo || '', isCaptain: data.is_captain, stats: { goals: 0, assists: 0, yellowCards: 0, redCards: 0 } };
            setTeams(prev => prev.map(t => t.id === teamId ? { ...t, players: [...t.players, np] } : t));
        }
        return { error: null };
    };

    const updatePlayer = async (teamId: string, playerId: string, data: Partial<Player>) => {
        await supabase.from('players').update({
            name: data.name, number: data.number, position: data.position,
            photo: data.photo, is_captain: data.isCaptain
        }).eq('id', playerId);
        setTeams(prev => prev.map(t => t.id === teamId
            ? { ...t, players: t.players.map(p => p.id === playerId ? { ...p, ...data } : p) }
            : t
        ));
    };

    const removePlayer = async (teamId: string, playerId: string) => {
        await supabase.from('players').delete().eq('id', playerId);
        setTeams(prev => prev.map(t => t.id === teamId ? { ...t, players: t.players.filter(p => p.id !== playerId) } : t));
    };

    const toggleCaptain = async (teamId: string, playerId: string) => {
        const team = teams.find(t => t.id === teamId);
        if (!team) return;
        const pl = team.players.find(p => p.id === playerId);
        const newVal = !pl?.isCaptain;
        // Remove captain from others
        for (const p of team.players) {
            if (p.isCaptain && p.id !== playerId) await supabase.from('players').update({ is_captain: false }).eq('id', p.id);
        }
        await supabase.from('players').update({ is_captain: newVal }).eq('id', playerId);
        setTeams(prev => prev.map(t => t.id === teamId
            ? { ...t, players: t.players.map(p => ({ ...p, isCaptain: p.id === playerId ? newVal : false })) }
            : t
        ));
    };

    // ── Match CRUD ─────────────────────────────────────────────
    const createMatch = async (data: { homeTeamId: string; awayTeamId: string; scheduledAt?: string; location?: string; youtubeLiveId?: string }) => {
        if (!league) return { error: 'Nenhuma liga selecionada' };
        if (data.homeTeamId === data.awayTeamId) return { error: 'Um time não pode jogar contra ele mesmo.' };
        const { data: row, error } = await supabase.from('matches').insert({
            league_id: league.id, home_team_id: data.homeTeamId, away_team_id: data.awayTeamId,
            scheduled_at: data.scheduledAt || null, location: data.location || '',
            youtube_live_id: data.youtubeLiveId || '', half_length: league.defaultHalfLength
        }).select().single();
        if (error) return { error: error.message };
        if (row) {
            const nm: Match = { id: row.id, homeTeamId: row.home_team_id, awayTeamId: row.away_team_id, homeScore: 0, awayScore: 0, status: 'scheduled', events: [], timer: 0, youtubeLiveId: row.youtube_live_id, halfLength: row.half_length, extraTime: 0, period: '1º Tempo', scheduledAt: row.scheduled_at, location: row.location };
            setMatches(prev => [...prev, nm]);
        }
        return { error: null };
    };

    const updateMatch = async (matchId: string, data: Partial<Match>) => {
        await supabase.from('matches').update({
            home_score: data.homeScore, away_score: data.awayScore, status: data.status,
            timer: data.timer, youtube_live_id: data.youtubeLiveId, half_length: data.halfLength,
            extra_time: data.extraTime, period: data.period,
            scheduled_at: data.scheduledAt, location: data.location
        }).eq('id', matchId);
        setMatches(prev => prev.map(m => m.id === matchId ? { ...m, ...data } : m));
    };

    const deleteMatch = async (matchId: string) => {
        await supabase.from('matches').delete().eq('id', matchId);
        setMatches(prev => prev.filter(m => m.id !== matchId));
    };

    const startMatch = async (matchId: string) => updateMatch(matchId, { status: 'live' });
    const endMatch = async (matchId: string) => updateMatch(matchId, { status: 'finished' });
    const updateTimer = async (matchId: string, time: number) => updateMatch(matchId, { timer: time });

    const addEvent = async (matchId: string, event: Omit<MatchEvent, 'id'>) => {
        const { data } = await supabase.from('match_events').insert({
            match_id: matchId, type: event.type, team_id: event.teamId, player_id: event.playerId, minute: event.minute
        }).select().single();
        if (!data) return;
        const ne: MatchEvent = { id: data.id, type: data.type, teamId: data.team_id, playerId: data.player_id, minute: data.minute };

        setMatches(prev => prev.map(m => {
            if (m.id !== matchId) return m;
            let homeScore = m.homeScore, awayScore = m.awayScore;
            if (event.type === 'goal' || event.type === 'penalty_goal') {
                if (event.teamId === m.homeTeamId) homeScore++; else awayScore++;
            }
            return { ...m, events: [...m.events, ne], homeScore, awayScore };
        }));

        // Update score in DB
        const match = matches.find(m => m.id === matchId);
        if (match && (event.type === 'goal' || event.type === 'penalty_goal')) {
            const isHome = event.teamId === match.homeTeamId;
            await supabase.from('matches').update({
                home_score: isHome ? match.homeScore + 1 : match.homeScore,
                away_score: !isHome ? match.awayScore + 1 : match.awayScore,
            }).eq('id', matchId);
        }

        // Update player stats
        await supabase.from('players').update({
            goals: supabase.rpc ? undefined : undefined, // will be recalculated on reload
        });
    };

    const removeEvent = async (matchId: string, eventId: string) => {
        const match = matches.find(m => m.id === matchId);
        const event = match?.events.find(e => e.id === eventId);
        await supabase.from('match_events').delete().eq('id', eventId);

        setMatches(prev => prev.map(m => {
            if (m.id !== matchId) return m;
            let homeScore = m.homeScore, awayScore = m.awayScore;
            if (event && (event.type === 'goal' || event.type === 'penalty_goal')) {
                if (event.teamId === m.homeTeamId) homeScore = Math.max(0, homeScore - 1);
                else awayScore = Math.max(0, awayScore - 1);
            }
            return { ...m, events: m.events.filter(e => e.id !== eventId), homeScore, awayScore };
        }));

        if (event && (event.type === 'goal' || event.type === 'penalty_goal')) {
            const m = matches.find(m => m.id === matchId)!;
            const isHome = event.teamId === m.homeTeamId;
            await supabase.from('matches').update({
                home_score: isHome ? Math.max(0, m.homeScore - 1) : m.homeScore,
                away_score: !isHome ? Math.max(0, m.awayScore - 1) : m.awayScore,
            }).eq('id', matchId);
        }
    };

    // ── Bracket ────────────────────────────────────────────────
    const generateBracket = async () => {
        if (!league) return;
        // Delete existing
        await supabase.from('brackets').delete().eq('league_id', league.id);

        // Sort teams by points for seeding
        const sorted = [...teams].sort((a, b) => {
            const pA = a.stats.wins * league.pointsForWin + a.stats.draws * league.pointsForDraw;
            const pB = b.stats.wins * league.pointsForWin + b.stats.draws * league.pointsForDraw;
            return pB - pA;
        });

        const rounds: Array<{ round: string; count: number }> = [
            { round: 'oitavas', count: 8 }, { round: 'quartas', count: 4 },
            { round: 'semifinal', count: 2 }, { round: 'final', count: 1 }
        ];

        const rows: any[] = [];
        rounds.forEach(({ round, count }) => {
            for (let i = 0; i < count; i++) {
                const homeIdx = round === 'oitavas' ? i * 2 : undefined;
                const awayIdx = round === 'oitavas' ? i * 2 + 1 : undefined;
                rows.push({
                    league_id: league.id, round, match_order: i,
                    home_team_id: homeIdx !== undefined && sorted[homeIdx] ? sorted[homeIdx].id : null,
                    away_team_id: awayIdx !== undefined && sorted[awayIdx] ? sorted[awayIdx].id : null,
                });
            }
        });

        const { data } = await supabase.from('brackets').insert(rows).select();
        if (data) {
            setBrackets(data.map((b: any) => ({
                id: b.id, round: b.round, matchOrder: b.match_order,
                homeTeamId: b.home_team_id, awayTeamId: b.away_team_id,
                homeScore: b.home_score, awayScore: b.away_score, status: b.status
            })));
        }
    };

    const updateBracket = async (bracketId: string, data: Partial<BracketMatch>) => {
        await supabase.from('brackets').update({
            home_score: data.homeScore, away_score: data.awayScore, status: data.status,
            home_team_id: data.homeTeamId, away_team_id: data.awayTeamId
        }).eq('id', bracketId);
        setBrackets(prev => prev.map(b => b.id === bracketId ? { ...b, ...data } : b));
    };

    return (
        <LeagueContext.Provider value={{
            league, leagues, teams, matches, brackets, loading, dataLoading,
            createLeague, updateLeague, deleteLeague, selectLeague,
            addTeam, updateTeam, deleteTeam,
            addPlayer, updatePlayer, removePlayer, toggleCaptain,
            createMatch, updateMatch, deleteMatch, startMatch, endMatch, updateTimer,
            addEvent, removeEvent,
            generateBracket, updateBracket
        }}>
            {children}
        </LeagueContext.Provider>
    );
};

export const useLeague = () => {
    const ctx = useContext(LeagueContext);
    if (!ctx) throw new Error('useLeague must be used inside LeagueProvider');
    return ctx;
};
