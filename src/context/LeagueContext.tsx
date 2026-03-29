import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

// ─── Types ──────────────────────────────────────────────────────────────────
export type Player = {
    id: string;
    name: string;
    number: number;
    position: string;
    photo?: string;
    isCaptain?: boolean;
    isReserve?: boolean;
    displayOrder?: number;
    slug?: string;
    stats: { 
        goals: number; assists: number; ownGoals: number; yellowCards: number; redCards: number; 
        points?: number; points1?: number; points2?: number; points3?: number; 
        rebounds?: number; blocks?: number; steals?: number; fouls?: number;
        mvp: number; matchesPlayed: number; cleanSheets: number; goalsConceded: number;
    };
};

export type Team = {
    id: string;
    name: string;
    logo: string;
    primaryColor?: string;
    secondaryColor?: string;
    group_name?: string;
    slug?: string;
    players: Player[];
    stats: { matches: number; wins: number; draws: number; losses: number; goalsFor: number; goalsAgainst: number; points: number; form: ('W' | 'D' | 'L')[] };
};

export type MatchEvent = {
    id: string;
    type: 'goal' | 'assist' | 'yellow_card' | 'red_card' | 'substitution' | 'foul' | 'penalty_goal' | 'penalty_miss' | 'own_goal' | 'penalty_shootout_goal' | 'penalty_shootout_miss' | 'points_1' | 'points_2' | 'points_3' | 'rebound' | 'block' | 'steal';
    teamId: string;
    playerId: string;
    playerOutId?: string; 
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
    updatedAt?: string;
    slug?: string;
    mvpPlayerId?: string;
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

export type TeamInteraction = {
    id: string;
    teamId: string;
    leagueId: string;
    interactionType: 'supporting' | 'favorite' | 'rival';
};

export type LeagueNotification = {
    id: string;
    title: string;
    message: string;
    type: 'goal' | 'match_start' | 'info';
    teamId?: string;
    createdAt: number;
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
    overtimeHalfLength: number;
    playersPerTeam: number;
    reserveLimitPerTeam: number;
    substitutionsLimit: number;
    allowSubstitutionReturn: boolean;
    hasOvertime: boolean;
    slug: string;
    userId: string;
    sportType: 'soccer' | 'basketball';
    lat?: number;
    lng?: number;
    address?: string;
    distancia_km?: number;
    follower_count?: { count: number }[];
};

export type Ad = {
    id: string;
    league_id: string;
    title: string;
    desktop_media_url: string;
    mobile_media_url?: string;
    square_media_url?: string;
    media_type: 'image' | 'video' | 'gif';
    positions: string[];
    object_position?: 'center' | 'top' | 'bottom';
    link_url?: string;
    duration: number;
    active: boolean;
    display_order?: number;
    created_at?: string;
};

// ─── Context Type ───────────────────────────────────────────────────────────
interface LeagueContextType {
    league: League | null;
    leagues: League[];
    followedLeagues: League[];
    teams: Team[];
    matches: Match[];
    brackets: BracketMatch[];
    loading: boolean;
    dataLoading: boolean;
    createLeague: (data: any) => Promise<{ error: string | null; data?: League }>;
    updateLeague: (data: Partial<League>) => Promise<void>;
    deleteLeague: (id: string) => Promise<void>;
    selectLeague: (id: string) => void;
    generateGroups: (teamsPerGroup: number) => Promise<void>;
    addTeam: (team: any) => Promise<{ error: string | null }>;
    updateTeam: (teamId: string, data: any) => Promise<{ error: string | null }>;
    deleteTeam: (teamId: string) => Promise<void>;
    addPlayer: (teamId: string, player: any) => Promise<{ error: string | null }>;
    updatePlayer: (teamId: string, playerId: string, data: any) => Promise<{ error: string | null }>;
    removePlayer: (teamId: string, playerId: string) => Promise<void>;
    toggleCaptain: (teamId: string, playerId: string) => Promise<void>;
    reorderPlayers: (teamId: string, playerIds: string[]) => Promise<void>;
    isPlayerOnPitch: (match: Match, playerId: string) => boolean;
    getMatchSlug: (m: Match) => string;
    getTeamSlug: (t: Team) => string;
    getPlayerSlug: (p: Player) => string;
    createMatch: (data: any) => Promise<{ error: string | null; matchId?: string }>;
    updateMatch: (matchId: string, data: Partial<Match>) => Promise<void>;
    deleteMatch: (matchId: string) => Promise<void>;
    startMatch: (matchId: string, currentTimer: number, shouldStartLive?: boolean) => Promise<void>;
    pauseMatch: (matchId: string, currentTimer: number) => Promise<void>;
    endMatch: (matchId: string, currentTimer: number) => Promise<void>;
    updateTimer: (matchId: string, time: number) => Promise<void>;
    addEvent: (matchId: string, event: any) => Promise<void>;
    removeEvent: (matchId: string, eventId: string) => Promise<void>;
    generateBracket: () => Promise<void>;
    updateBracket: (bracketId: string, data: Partial<BracketMatch>) => Promise<void>;
    loadLeagues: () => Promise<void>;
    isPublicView: boolean;
    setIsPublicView: (val: boolean) => void;
    isAdmin: boolean;
    loadPublicLeague: (id: string) => Promise<boolean>;
    loadTeamPhotos: (teamId: string) => Promise<void>;
    loadPlayerPhotos: (playerIds: string[]) => Promise<void>;
    followLeague: (leagueId: string) => Promise<void>;
    unfollowLeague: (leagueId: string) => Promise<void>;
    searchLeagues: (query: string) => Promise<League[]>;
    fetchNearbyLeagues: (lat: number, lng: number, radiusKm: number) => Promise<League[]>;
    userInteractions: TeamInteraction[];
    interactWithTeam: (teamId: string, type: TeamInteraction['interactionType']) => Promise<void>;
    removeInteraction: (interactionId: string) => Promise<void>;
    pendingInteraction: { teamId: string, type: TeamInteraction['interactionType'] } | null;
    setPendingInteraction: (val: { teamId: string, type: TeamInteraction['interactionType'] } | null) => void;
    showAuthModal: boolean;
    setShowAuthModal: (val: boolean) => void;
    supportCounts: Record<string, number>;
    notifications: LeagueNotification[];
    clearNotification: (id: string) => void;
    leagueBasePath: string;
    globalAdTick: number;
    ads: Ad[];
    addAd: (ad: any) => Promise<{ error: string | null }>;
    updateAd: (id: string, ad: Partial<Ad>) => Promise<{ error: string | null }>;
    deleteAd: (id: string) => Promise<{ error: string | null }>;
    reorderAds: (reorderedAds: Ad[]) => Promise<void>;
    ytToken: string | null;
    ytLogin: () => Promise<void>;
    ytLogout: () => void;
    isYtAuthenticated: boolean;
    currentYtLiveStream: { streamKey: string, rtmpUrl: string } | null;
    recoverStreamDetails: (broadcastId: string) => Promise<void>;
    deleteYtLive: (matchId: string, broadcastId: string) => Promise<void>;
    setYtLivePrivacy: (broadcastId: string, privacy: 'public' | 'private' | 'unlisted') => Promise<void>;
}

const LeagueContext = createContext<LeagueContextType | undefined>(undefined);

// ─── Mappings (DB to Frontend) ──────────────────────────────────────────────
const mapDBEvent = (e: any): MatchEvent => ({
    id: e.id,
    type: e.type,
    teamId: e.team_id || e.teamId,
    playerId: e.player_id || e.playerId,
    playerOutId: e.player_out_id || e.playerOutId,
    minute: e.minute
});

const mapDBMatch = (m: any): Match => ({
    id: m.id,
    homeTeamId: m.home_team_id || m.homeTeamId,
    awayTeamId: m.away_team_id || m.awayTeamId,
    homeScore: m.home_score ?? m.homeScore ?? 0,
    awayScore: m.away_score ?? m.awayScore ?? 0,
    status: m.status,
    timer: m.timer ?? 0,
    youtubeLiveId: m.youtube_live_id || m.youtubeLiveId,
    halfLength: m.half_length || m.halfLength,
    extraTime: m.extra_time || m.extraTime,
    period: m.period,
    scheduledAt: m.scheduled_at || m.scheduledAt,
    location: m.location,
    updatedAt: m.updated_at || new Date().toISOString(),
    slug: m.slug,
    events: (m.match_events || []).map((e: any) => mapDBEvent(e))
});

const mapDBPlayer = (p: any): Player => ({
    id: p.id,
    name: p.name,
    number: p.number || 0,
    position: p.position || '',
    photo: p.photo || '',
    slug: p.slug,
    isCaptain: p.is_captain || false,
    isReserve: p.is_reserve || false,
    displayOrder: p.display_order || 0,
    stats: { 
        goals: 0, assists: 0, ownGoals: 0, yellowCards: 0, redCards: 0, 
        points1: 0, points2: 0, points3: 0, rebounds: 0, blocks: 0, steals: 0, fouls: 0,
        mvp: 0, matchesPlayed: 0, cleanSheets: 0, goalsConceded: 0
    }
});

const mapDBTeam = (t: any): Team => {
    const players = (t.players || []).map(mapDBPlayer).sort((a: Player, b: Player) => (a.displayOrder || 0) - (b.displayOrder || 0));
    return {
        id: t.id,
        name: t.name,
        logo: t.logo || '',
        primaryColor: t.primary_color || null,
        secondaryColor: t.secondary_color || null,
        group_name: t.group_name || '',
        slug: t.slug,
        players,
        stats: { matches: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0, form: [] as ('W' | 'D' | 'L')[] }
    };
};

const mapDBBracket = (b: any): BracketMatch => ({
    id: b.id, round: b.round, matchOrder: b.match_order,
    homeTeamId: b.home_team_id, awayTeamId: b.away_team_id,
    homeScore: b.home_score || 0, awayScore: b.away_score || 0, 
    status: b.status
});

const mapDBLeague = (l: any): League => ({
    id: l.id, name: l.name || 'Sem nome', logo: l.logo || '', maxTeams: l.max_teams || 20,
    pointsForWin: l.points_for_win || 3, pointsForDraw: l.points_for_draw || 1,
    pointsForLoss: l.points_for_loss || 0, defaultHalfLength: l.default_half_length || 20,
    overtimeHalfLength: l.overtime_half_length || 5,
    playersPerTeam: l.players_per_team || 5, reserveLimitPerTeam: l.reserve_limit_per_team || 5,
    substitutionsLimit: l.substitutions_limit || 0, 
    allowSubstitutionReturn: l.allow_substitution_return ?? true,
    hasOvertime: l.has_overtime ?? true,
    slug: l.slug || l.id, userId: l.user_id,
    sportType: l.sport_type || 'soccer',
    address: l.address, lat: l.lat, lng: l.lng,
    distancia_km: l.distancia_km,
    follower_count: l.follower_count
});

// ─── Provider Container ─────────────────────────────────────────────────────
export const LeagueProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [leagues, setLeagues] = useState<League[]>([]);
    const [followedLeagues, setFollowedLeagues] = useState<League[]>([]);
    const [league, setLeague] = useState<League | null>(null);
    const [rawTeams, setRawTeams] = useState<Team[]>([]);
    const [rawMatches, setRawMatches] = useState<Match[]>([]);
    const [brackets, setBrackets] = useState<BracketMatch[]>([]);
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(false);
    const [isPublicView] = useState(false);

    // States with minimal usage to satisfy interface
    const [userInteractions] = useState<TeamInteraction[]>([]);
    const [supportCounts] = useState<Record<string, number>>({});
    const [pendingInteraction] = useState<{ teamId: string, type: TeamInteraction['interactionType'] } | null>(null);
    const [showAuthModal] = useState(false);
    const [notifications] = useState<LeagueNotification[]>([]);
    const [ads] = useState<Ad[]>([]);
    const [globalAdTick] = useState(0);

    // ─── Computeds ──────────────────────────────────────────
    const teams = useMemo(() => {
        return rawTeams.map(team => {
            const teamMatches = rawMatches.filter(m => 
                m.status === 'finished' && (m.homeTeamId === team.id || m.awayTeamId === team.id)
            );
            const stats = teamMatches.reduce((acc: any, m: any) => {
                const isHome = m.homeTeamId === team.id;
                const goalsFor = isHome ? m.homeScore : m.awayScore;
                const goalsAgainst = isHome ? m.awayScore : m.homeScore;
                acc.matches++;
                acc.goalsFor += goalsFor;
                acc.goalsAgainst += goalsAgainst;
                if (goalsFor > goalsAgainst) { acc.wins++; acc.points += (league?.pointsForWin || 3); acc.form.push('W'); }
                else if (goalsFor === goalsAgainst) { acc.draws++; acc.points += (league?.pointsForDraw || 1); acc.form.push('D'); }
                else { acc.losses++; acc.points += (league?.pointsForLoss || 0); acc.form.push('L'); }
                return acc;
            }, { matches: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0, form: [] as string[] });
            return { ...team, stats: { ...stats, form: stats.form.slice(-5) } };
        }).sort((a: any, b: any) => {
            if (b.stats.points !== a.stats.points) return b.stats.points - a.stats.points;
            if ((b.stats.goalsFor - b.stats.goalsAgainst) !== (a.stats.goalsFor - a.stats.goalsAgainst)) 
                return (b.stats.goalsFor - b.stats.goalsAgainst) - (a.stats.goalsFor - a.stats.goalsAgainst);
            return b.stats.goalsFor - a.stats.goalsFor;
        });
    }, [rawTeams, rawMatches, league]);

    const matches = useMemo(() => {
        return rawMatches.sort((a: any, b: any) => {
            if (a.status === 'live' && b.status !== 'live') return -1;
            if (a.status !== 'live' && b.status === 'live') return 1;
            return new Date(b.scheduledAt || 0).getTime() - new Date(a.scheduledAt || 0).getTime();
        });
    }, [rawMatches]);

    const isAdmin = useMemo(() => !!user && !!league && league.userId === user.id, [user, league]);
    const leagueBasePath = useMemo(() => league ? `/${league.slug || league.id}` : '', [league]);

    // ─── Helpers ──────────────────────────────────────────
    const generateSlug = (name: string) => name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

    const loadLeagues = useCallback(async () => {
        if (!user) { setLeagues([]); return; }
        setLoading(true);
        try {
            const { data: owned } = await supabase.from('leagues').select('*').eq('user_id', user.id);
            setLeagues((owned || []).map(mapDBLeague));
            const { data: followed } = await supabase.from('followed_leagues').select('leagues(*)').eq('user_id', user.id);
            setFollowedLeagues((followed || []).map((f: any) => mapDBLeague(f.leagues)));
        } catch (e) {
            console.error('Error loading leagues:', e);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => { loadLeagues(); }, [loadLeagues]);

    const loadPublicLeague = useCallback(async (slugOrId: string) => {
        if (!slugOrId) return false;
        setLoading(true);
        try {
            const { data: row, error } = await supabase.from('leagues').select('*').or(`slug.eq."${slugOrId}",id.eq."${slugOrId}"`).maybeSingle();
            if (error || !row) return false;
            const mapped = mapDBLeague(row);
            setLeague(mapped);
            return true;
        } catch (e) {
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const loadLeagueData = useCallback(async (leagueId: string) => {
        setDataLoading(true);
        try {
            const [tRes, mRes, pRes, bRes] = await Promise.all([
                supabase.from('teams').select('*').eq('league_id', leagueId),
                supabase.from('matches').select('*, match_events(*)').eq('league_id', leagueId),
                supabase.from('players').select('*').eq('league_id', leagueId),
                supabase.from('brackets').select('*').eq('league_id', leagueId)
            ]);
            const players = pRes.data || [];
            setRawTeams((tRes.data || []).map(t => ({ ...mapDBTeam(t), players: players.filter((p: any) => p.team_id === t.id).map(mapDBPlayer) })));
            setRawMatches((mRes.data || []).map(mapDBMatch));
            setBrackets((bRes.data || []).map(mapDBBracket));
        } catch (e) {
            console.error(e);
        } finally {
            setDataLoading(false);
        }
    }, []);

    useEffect(() => { if (league?.id) loadLeagueData(league.id); }, [league?.id, loadLeagueData]);

    // Realtime logic stub
    useEffect(() => {
        if (!league?.id) return;
        const channel = supabase.channel(`league-${league.id}`)
            .on('postgres_changes', { event: '*', schema: 'public', filter: `league_id=eq.${league.id}` }, () => {
                loadLeagueData(league.id);
            }).subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [league?.id, loadLeagueData]);

    // ─── Actions ──────────────────────────────────────────
    const createLeague = async (data: any) => {
        if (!user) return { error: 'Auth required' };
        const { data: row, error } = await supabase.from('leagues').insert({ ...data, user_id: user.id, slug: generateSlug(data.name) }).select().single();
        if (error) return { error: error.message };
        const mapped = mapDBLeague(row);
        setLeagues(prev => [...prev, mapped]);
        setLeague(mapped);
        return { error: null, data: mapped };
    };

    const updateLeague = async (data: any) => {
        if (!league) return;
        const { error } = await supabase.from('leagues').update(data).eq('id', league.id);
        if (!error) setLeague({ ...league, ...data });
    };

    const deleteLeague = async (id: string) => {
        const { error } = await supabase.from('leagues').delete().eq('id', id);
        if (!error) {
            setLeagues(prev => prev.filter(l => l.id !== id));
            if (league?.id === id) setLeague(null);
        }
    };

    const addTeam = async (t: any) => {
        if (!league) return { error: 'League required' };
        const { data, error } = await supabase.from('teams').insert({ ...t, league_id: league.id, slug: generateSlug(t.name) }).select().single();
        if (data) setRawTeams(prev => [...prev, mapDBTeam(data)]);
        return { error: error?.message || null };
    };

    const updateTeam = async (id: string, updates: any) => {
        const { data, error } = await supabase.from('teams').update(updates).eq('id', id).select().single();
        if (data) setRawTeams(prev => prev.map(t => t.id === id ? { ...mapDBTeam(data), players: t.players } : t));
        return { error: error?.message || null };
    };

    const deleteTeam = async (id: string) => {
        await supabase.from('teams').delete().eq('id', id);
        setRawTeams(prev => prev.filter(t => t.id !== id));
    };

    const addPlayer = async (teamId: string, player: any) => {
        if (!league) return { error: 'League required' };
        const { data, error } = await supabase.from('players').insert({ ...player, team_id: teamId, league_id: league.id, slug: generateSlug(player.name) }).select().single();
        if (data) setRawTeams(prev => prev.map(t => t.id === teamId ? { ...t, players: [...t.players, mapDBPlayer(data)] } : t));
        return { error: error?.message || null };
    };

    const updatePlayer = async (teamId: string, id: string, updates: any) => {
        const { data, error } = await supabase.from('players').update(updates).eq('id', id).select().single();
        if (data) setRawTeams(prev => prev.map(t => t.id === teamId ? { ...t, players: t.players.map(p => p.id === id ? mapDBPlayer(data) : p) } : t));
        return { error: error?.message || null };
    };

    const removePlayer = async (teamId: string, id: string) => {
        await supabase.from('players').delete().eq('id', id);
        setRawTeams(prev => prev.map(t => t.id === teamId ? { ...t, players: t.players.filter(p => p.id !== id) } : t));
    };

    const selectLeague = (id: string) => {
        const found = leagues.find(l => l.id === id) || followedLeagues.find(l => l.id === id);
        if (found) setLeague(found);
    };

    // Stubs
    const generateGroups = async () => {};
    const toggleCaptain = async () => {};
    const reorderPlayers = async () => {};
    const isPlayerOnPitch = () => true;
    const getMatchSlug = (m: Match) => m.slug || m.id;
    const getTeamSlug = (t: Team) => t.slug || t.id;
    const getPlayerSlug = (p: Player) => p.slug || p.id;
    const createMatch = async () => ({ error: null });
    const updateMatch = async () => {};
    const deleteMatch = async () => {};
    const startMatch = async () => {};
    const pauseMatch = async () => {};
    const endMatch = async () => {};
    const updateTimer = async () => {};
    const addEvent = async () => {};
    const removeEvent = async () => {};
    const generateBracket = async () => {};
    const updateBracket = async () => {};
    const loadTeamPhotos = async () => {};
    const loadPlayerPhotos = async () => {};
    const followLeague = async () => {};
    const unfollowLeague = async () => {};
    const searchLeagues = async () => [];
    const fetchNearbyLeagues = async () => [];
    const interactWithTeam = async () => {};
    const removeInteraction = async () => {};
    const clearNotification = () => {};
    const addAd = async () => ({ error: null });
    const updateAd = async () => ({ error: null });
    const deleteAd = async () => ({ error: null });
    const reorderAds = async () => {};
    const ytLogin = async () => {};
    const ytLogout = () => {};
    const recoverStreamDetails = async () => {};
    const deleteYtLive = async () => {};
    const setYtLivePrivacy = async () => {};

    const value: LeagueContextType = {
        league, leagues, followedLeagues, teams, matches, brackets, loading, dataLoading,
        createLeague, updateLeague, deleteLeague, selectLeague, generateGroups,
        addTeam, updateTeam, deleteTeam,
        addPlayer, updatePlayer, removePlayer, toggleCaptain, reorderPlayers,
        isPlayerOnPitch, getMatchSlug, getTeamSlug, getPlayerSlug,
        createMatch, updateMatch, deleteMatch, startMatch, pauseMatch, endMatch,
        updateTimer, addEvent, removeEvent, generateBracket, updateBracket,
        loadLeagues, isPublicView, setIsPublicView: () => {}, isAdmin,
        loadPublicLeague, loadTeamPhotos, loadPlayerPhotos, followLeague, unfollowLeague,
        searchLeagues, fetchNearbyLeagues,
        userInteractions, interactWithTeam, removeInteraction, pendingInteraction, setPendingInteraction: () => {},
        showAuthModal, setShowAuthModal: () => {}, supportCounts, notifications, clearNotification,
        leagueBasePath, globalAdTick, ads, addAd, updateAd, deleteAd, reorderAds,
        ytToken: null, ytLogin, ytLogout, isYtAuthenticated: false, currentYtLiveStream: null,
        recoverStreamDetails, deleteYtLive, setYtLivePrivacy
    };

    return <LeagueContext.Provider value={value}>{children}</LeagueContext.Provider>;
};

export const useLeague = () => {
    const ctx = useContext(LeagueContext);
    if (!ctx) throw new Error('use League must be used inside LeagueProvider');
    return ctx;
};
