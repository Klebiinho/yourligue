import { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { YouTubeService } from '../services/youtube';

// ─── Types ───────────────────────────────────────────────────
export type Player = {
    id: string;
    name: string;
    number: number;
    position: string;
    photo?: string;
    isCaptain?: boolean;
    isReserve?: boolean;
    displayOrder?: number;
    stats: { goals: number; assists: number; ownGoals: number; yellowCards: number; redCards: number; points1?: number; points2?: number; points3?: number; rebounds?: number; blocks?: number; steals?: number; fouls?: number; };
};

export type Team = {
    id: string;
    name: string;
    logo: string;
    group_name?: string;
    players: Player[];
    stats: { matches: number; wins: number; draws: number; losses: number; goalsFor: number; goalsAgainst: number; points: number; form: ('W' | 'D' | 'L')[] };
};

export type MatchEvent = {
    id: string;
    type: 'goal' | 'assist' | 'yellow_card' | 'red_card' | 'substitution' | 'foul' | 'penalty_goal' | 'penalty_miss' | 'own_goal' | 'penalty_shootout_goal' | 'penalty_shootout_miss' | 'points_1' | 'points_2' | 'points_3' | 'rebound' | 'block' | 'steal';
    teamId: string;
    playerId: string;
    playerOutId?: string; // For substitutions
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

// ─── Context Type ────────────────────────────────────────────
interface LeagueContextType {
    league: League | null;
    leagues: League[];
    followedLeagues: League[];
    teams: Team[];
    matches: Match[];
    brackets: BracketMatch[];
    loading: boolean;
    dataLoading: boolean;

    // League actions
    createLeague: (data: Omit<League, 'id' | 'slug' | 'userId'>) => Promise<{ error: string | null }>;
    updateLeague: (data: Partial<League>) => Promise<void>;
    deleteLeague: (id: string) => Promise<void>;
    selectLeague: (id: string) => void;
    generateGroups: (teamsPerGroup: number) => Promise<void>;

    // Team actions
    addTeam: (team: { name: string; logo: string }) => Promise<{ error: string | null }>;
    updateTeam: (teamId: string, data: Partial<{ name: string; logo: string }>) => Promise<void>;
    deleteTeam: (teamId: string) => Promise<void>;

    // Player actions
    addPlayer: (teamId: string, player: Omit<Player, 'id' | 'stats'>) => Promise<{ error: string | null }>;
    updatePlayer: (teamId: string, playerId: string, data: Partial<Player>) => Promise<{ error: string | null }>;
    removePlayer: (teamId: string, playerId: string) => Promise<void>;
    toggleCaptain: (teamId: string, playerId: string) => Promise<void>;
    reorderPlayers: (teamId: string, playerIds: string[]) => Promise<void>;
    isPlayerOnPitch: (match: Match, playerId: string) => boolean;

    // Match actions
    createMatch: (data: { homeTeamId: string; awayTeamId: string; scheduledAt?: string; location?: string; youtubeLiveId?: string }) => Promise<{ error: string | null; matchId?: string }>;
    updateMatch: (matchId: string, data: Partial<Match>) => Promise<void>;
    deleteMatch: (matchId: string) => Promise<void>;
    startMatch: (matchId: string, currentTimer: number, shouldStartLive?: boolean) => Promise<void>;
    pauseMatch: (matchId: string, currentTimer: number) => Promise<void>;
    endMatch: (matchId: string, currentTimer: number) => Promise<void>;
    updateTimer: (matchId: string, time: number) => Promise<void>;
    addEvent: (matchId: string, event: Omit<MatchEvent, 'id'>) => Promise<void>;
    removeEvent: (matchId: string, eventId: string) => Promise<void>;

    // Bracket actions
    generateBracket: () => Promise<void>;
    updateBracket: (bracketId: string, data: Partial<BracketMatch>) => Promise<void>;

    loadLeagues: () => Promise<void>;
    isPublicView: boolean;
    setIsPublicView: (val: boolean) => void;
    isAdmin: boolean;
    loadPublicLeague: (id: string) => Promise<boolean>;
    followLeague: (leagueId: string) => Promise<void>;
    unfollowLeague: (leagueId: string) => Promise<void>;
    searchLeagues: (query: string) => Promise<League[]>;
    fetchNearbyLeagues: (lat: number, lng: number, radiusKm: number) => Promise<League[]>;

    // User Interactions
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

    // Ads
    ads: Ad[];
    addAd: (ad: Omit<Ad, 'id' | 'league_id' | 'active'>) => Promise<{ error: string | null }>;
    updateAd: (id: string, ad: Partial<Ad>) => Promise<{ error: string | null }>;
    deleteAd: (id: string) => Promise<{ error: string | null }>;
    reorderAds: (reorderedAds: Ad[]) => Promise<void>;

    // YouTube
    ytToken: string | null;
    ytLogin: () => Promise<void>;
    ytLogout: () => void;
    isYtAuthenticated: boolean;
    currentYtLiveStream: { streamKey: string, rtmpUrl: string } | null;
    recoverStreamDetails: (broadcastId: string) => Promise<void>;
    deleteYtLive: (matchId: string, broadcastId: string) => Promise<void>;
    setYtLivePrivacy: (broadcastId: string, privacy: 'public' | 'private' | 'unlisted') => Promise<void>;
}

// ─── Mappings (DB to Frontend) ──────────────────────────────
const mapDBEvent = (e: any): MatchEvent => ({
    id: e.id,
    type: e.type,
    teamId: e.team_id,
    playerId: e.player_id,
    playerOutId: e.player_out_id,
    minute: e.minute
});

const mapDBMatch = (m: any): Match => ({
    id: m.id,
    homeTeamId: m.home_team_id,
    awayTeamId: m.away_team_id,
    homeScore: m.home_score || 0,
    awayScore: m.away_score || 0,
    status: m.status,
    timer: m.timer || 0,
    youtubeLiveId: m.youtube_live_id,
    halfLength: m.half_length,
    extraTime: m.extra_time,
    period: m.period,
    scheduledAt: m.scheduled_at,
    location: m.location,
    updatedAt: m.updated_at || m.created_at || new Date().toISOString(),
    events: (m.match_events || []).map(mapDBEvent)
});

const mapDBPlayer = (p: any): Player => ({
    id: p.id,
    name: p.name,
    number: p.number || 0,
    position: p.position || '',
    photo: p.photo || '',
    isCaptain: p.is_captain || false,
    isReserve: p.is_reserve || false,
    displayOrder: p.display_order || 0,
    stats: { goals: 0, assists: 0, ownGoals: 0, yellowCards: 0, redCards: 0, points1: 0, points2: 0, points3: 0, rebounds: 0, blocks: 0, steals: 0, fouls: 0 }
});

const mapDBTeam = (t: any): Team => {
    const players = (t.players || []).map(mapDBPlayer).sort((a: Player, b: Player) => (a.displayOrder || 0) - (b.displayOrder || 0));
    return {
        id: t.id,
        name: t.name,
        logo: t.logo || '',
        group_name: t.group_name || '',
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
    id: l.id, name: l.name, logo: l.logo || '', maxTeams: l.max_teams,
    pointsForWin: l.points_for_win, pointsForDraw: l.points_for_draw,
    pointsForLoss: l.points_for_loss, defaultHalfLength: l.default_half_length,
    overtimeHalfLength: l.overtime_half_length || 15,
    playersPerTeam: l.players_per_team || 5, reserveLimitPerTeam: l.reserve_limit_per_team || 5,
    substitutionsLimit: l.substitutions_limit || 5,
    allowSubstitutionReturn: l.allow_substitution_return ?? true,
    hasOvertime: l.has_overtime ?? true,
    slug: l.slug || '',
    userId: l.user_id,
    sportType: l.sport_type || 'soccer',
    lat: l.lat, lng: l.lng, address: l.address,
    distancia_km: l.distancia_km, follower_count: l.follower_count
});

const LeagueContext = createContext<LeagueContextType | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────
export const LeagueProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();

    const [leagues, setLeagues] = useState<League[]>([]);
    const [followedLeagues, setFollowedLeagues] = useState<League[]>([]);
    const [league, setLeague] = useState<League | null>(null);
    const [rawTeams, setRawTeams] = useState<Team[]>([]);
    const [rawMatches, setRawMatches] = useState<Match[]>([]);
    const [brackets, setBrackets] = useState<BracketMatch[]>([]);
    
    // ─── Memoized Enriched Data (No Refetch) ─────────────────────
    const teams = useMemo(() => {
        if (!rawTeams.length) return [];
        const allEvents = rawMatches.flatMap(m => m.events);
        
        return rawTeams.map(t => {
            const teamMatches = rawMatches.filter(
                m => (m.status === 'finished' || m.status === 'live') && (m.homeTeamId === t.id || m.awayTeamId === t.id)
            );
            
            let wins = 0, draws = 0, losses = 0, goalsFor = 0, goalsAgainst = 0;
            const form: ('W' | 'D' | 'L')[] = [];

            // Sort team matches by date to get form
            const sortedTeamMatches = [...teamMatches].sort((a, b) => 
                new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
            );

            teamMatches.forEach(m => {
                const isHome = m.homeTeamId === t.id;
                const gf = isHome ? m.homeScore : m.awayScore;
                const ga = isHome ? m.awayScore : m.homeScore;
                goalsFor += gf; goalsAgainst += ga;
                if (gf > ga) wins++; else if (gf === ga) draws++; else losses++;
            });

            sortedTeamMatches.slice(0, 5).forEach(m => {
                const isHome = m.homeTeamId === t.id;
                const gf = isHome ? m.homeScore : m.awayScore;
                const ga = isHome ? m.awayScore : m.homeScore;
                if (gf > ga) form.push('W');
                else if (gf === ga) form.push('D');
                else form.push('L');
            });

            const points = wins * (league?.pointsForWin ?? 3) + draws * (league?.pointsForDraw ?? 1) + losses * (league?.pointsForLoss ?? 0);

            return {
                ...t,
                players: t.players.map(p => ({
                    ...p,
                    stats: {
                        goals: allEvents.filter(e => e.playerId === p.id && (e.type === 'goal' || e.type === 'penalty_goal')).length,
                        assists: allEvents.filter(e => e.playerId === p.id && e.type === 'assist').length,
                        ownGoals: allEvents.filter(e => e.playerId === p.id && e.type === 'own_goal').length,
                        yellowCards: allEvents.filter(e => e.playerId === p.id && e.type === 'yellow_card').length,
                        redCards: allEvents.filter(e => e.playerId === p.id && e.type === 'red_card').length,
                        points1: allEvents.filter(e => e.playerId === p.id && e.type === 'points_1').length,
                        points2: allEvents.filter(e => e.playerId === p.id && e.type === 'points_2').length,
                        points3: allEvents.filter(e => e.playerId === p.id && e.type === 'points_3').length,
                        rebounds: allEvents.filter(e => e.playerId === p.id && e.type === 'rebound').length,
                        blocks: allEvents.filter(e => e.playerId === p.id && e.type === 'block').length,
                        steals: allEvents.filter(e => e.playerId === p.id && e.type === 'steal').length,
                        fouls: allEvents.filter(e => e.playerId === p.id && (e.type === 'foul' || e.type === 'yellow_card' || e.type === 'red_card')).length
                    }
                })),
                stats: { matches: teamMatches.length, wins, draws, losses, goalsFor, goalsAgainst, points, form: form.reverse() }
            };
        });
    }, [rawTeams, rawMatches, league]);
    
    // ── YouTube Integration ─────────────────────────────────────
    const ytService = YouTubeService.getInstance();
    const [ytToken, setYtToken] = useState<string | null>(localStorage.getItem('yt_access_token'));
    const [currentYtLiveStream, setCurrentYtLiveStream] = useState<{ streamKey: string, rtmpUrl: string } | null>(null);

    useEffect(() => {
        const clientId = import.meta.env.VITE_YOUTUBE_CLIENT_ID;
        if (clientId) {
            ytService.init(clientId).then(() => {
                ytService.subscribeAuth(token => setYtToken(token));
            }).catch(err => console.error('YouTube Init Error:', err));
        }
    }, []);

    const ytLogin = async () => {
        try {
            await ytService.logIn();
        } catch (err) {
            console.error('YouTube Login Error:', err);
        }
    };

    const ytLogout = () => ytService.logOut();
    const isYtAuthenticated = !!ytToken;
    const recoverStreamDetails = async (broadcastId: string) => {
        if (!isYtAuthenticated) return;
        try {
            const details = await ytService.getBroadcastDetails(broadcastId);
            if (details) {
                setCurrentYtLiveStream(details);
            }
        } catch (err) {
            console.error('Failed to recover stream details:', err);
        }
    };

    const matches = useMemo(() => rawMatches, [rawMatches]);
    const [loading, setLoading] = useState(true);
    const [dataLoading, setDataLoading] = useState(false);
    const [isPublicView, setIsPublicView] = useState(false);
    const [userInteractions, setUserInteractions] = useState<TeamInteraction[]>([]);
    const [pendingInteraction, setPendingInteraction] = useState<{ teamId: string, type: TeamInteraction['interactionType'] } | null>(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [supportCounts, setSupportCounts] = useState<Record<string, number>>({});
    const [notifications, setNotifications] = useState<LeagueNotification[]>([]);
    const [ads, setAds] = useState<Ad[]>([]);

    // Refs for realtime handlers to avoid infinite loops
    const teamsRef = useRef<Team[]>([]);
    const matchesRef = useRef<Match[]>([]);
    const interactionsRef = useRef<TeamInteraction[]>([]);

    useEffect(() => { teamsRef.current = teams; }, [teams]);
    useEffect(() => { matchesRef.current = matches; }, [matches]);
    useEffect(() => { interactionsRef.current = userInteractions; }, [userInteractions]);

    // Track if we are doing a silent background refresh

    const isAdmin = !!user && !!league && league.userId === user.id;

    const leagueBasePath = isPublicView && league ? `/view/${league.slug || league.id}` : '';

    // ── Load all leagues for user ──────────────────────────────
    useEffect(() => {
        // Safety timeout for global loading
        const globalTimeout = setTimeout(() => {
            if (loading) {
                console.warn('LeagueContext: Global loading timeout reached.');
                setLoading(false);
            }
        }, 10000);

        if (!user) {
            setLeagues([]);
            if (!isPublicView) {
                setLeague(null);
                setLoading(false);
                clearTimeout(globalTimeout);
            }
            return;
        }
        
        loadLeagues().finally(() => clearTimeout(globalTimeout));
    }, [user, isPublicView]);

    const loadLeagues = async () => {
        if (!user) return;
        console.log('LeagueContext: loadLeagues iniciado', { hasUser: !!user });
        // SILENT REFRESH: Only show active loading if we don't have leagues yet
        if (leagues.length === 0) setLoading(true);

        try {
            // Load owned leagues
            const { data: ownedData } = await supabase
                .from('leagues')
                .select(`
                    *,
                    follower_count:followed_leagues(count)
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: true });

            // Load followed leagues
            const { data: followsData } = await supabase
                .from('followed_leagues')
                .select(`
                    leagues(
                        *,
                        follower_count:followed_leagues(count)
                    )
                `)
                .eq('user_id', user.id);

            if (ownedData) {
                const mapped: League[] = ownedData.map(mapDBLeague);
                setLeagues(mapped);
                if (mapped.length > 0 && !league && !isPublicView) {
                    const saved = localStorage.getItem('selectedLeagueId');
                    const found = saved ? mapped.find(l => l.id === saved) : null;
                    setLeague(found ?? mapped[0]);
                }
            }

            if (followsData) {
                const mapped: League[] = followsData
                    .filter(f => f.leagues)
                    .map(f => mapDBLeague(f.leagues));
                setFollowedLeagues(mapped);
            }
        } catch (err) {
            console.error('LeagueContext: Erro em loadLeagues:', err);
        } finally {
            console.log('LeagueContext: loadLeagues finalizado');
            setLoading(false);
        }
    };

    const followLeague = async (leagueId: string) => {
        if (!user) return;
        await supabase.from('followed_leagues').upsert({ user_id: user.id, league_id: leagueId });
        await loadLeagues();
    };

    const unfollowLeague = async (leagueId: string) => {
        if (!user) return;
        await supabase.from('followed_leagues').delete().eq('user_id', user.id).eq('league_id', leagueId);
        await loadLeagues();
    };

    const addAd = async (adData: any) => {
        if (!league) return { error: 'No league selected' };
        const maxOrder = ads.reduce((max, a) => Math.max(max, a.display_order || 0), 0);
        const { data, error } = await supabase.from('ads').insert({
            ...adData,
            league_id: league.id,
            display_order: maxOrder + 1,
            active: true
        }).select().single();
        if (!error && data) {
            setAds(prev => [...prev, { ...data, display_order: data.display_order || 0 }].sort((a, b) => (a.display_order || 0) - (b.display_order || 0)));
            return { error: null };
        }
        return { error: error?.message || 'Error adding ad' };
    };

    const updateAd = async (id: string, updates: any) => {
        const { error } = await supabase.from('ads').update(updates).eq('id', id);
        if (!error) {
            setAds(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a).sort((a, b) => (a.display_order || 0) - (b.display_order || 0)));
            return { error: null };
        }
        return { error: error.message };
    };

    const deleteAd = async (id: string) => {
        if (!league) return { error: 'No league selected' };
        const { error } = await supabase.from('ads').delete().eq('id', id);
        if (!error) {
            setAds(prev => prev.filter(a => a.id !== id));
            return { error: null };
        }
        return { error: error.message };
    };

    const reorderAds = async (reorderedAds: Ad[]) => {
        setAds(reorderedAds); // Optimistic update
        const updates = reorderedAds.map((ad, index) => 
            supabase.from('ads').update({ display_order: index }).eq('id', ad.id)
        );
        await Promise.all(updates);
    };

    const searchLeagues = async (query: string): Promise<League[]> => {
        // Obter todas as ligas e contar acompanhantes
        // Para ordenar por 'mais acompanhantes', precisamos de uma consulta que conte a tabela followed_leagues
        const { data, error } = await supabase
            .from('leagues')
            .select(`
                *,
                follower_count:followed_leagues(count)
            `);

        if (error) {
            console.error('Error searching leagues:', error);
            return [];
        }

        let filtered = data || [];

        if (query.trim()) {
            filtered = filtered.filter(l => l.name.toLowerCase().includes(query.toLowerCase()));
        }

        // Ordenar por acompanhantes (desc) e depois por nome
        const results = filtered.sort((a, b) => {
            const countA = (a.follower_count && a.follower_count[0]?.count) || 0;
            const countB = (b.follower_count && b.follower_count[0]?.count) || 0;
            if (countB !== countA) return countB - countA;
            return a.name.localeCompare(b.name);
        }).slice(0, 15);

        return results.map(mapDBLeague);
    };

    const fetchNearbyLeagues = async (lat: number, lng: number, radiusKm: number): Promise<League[]> => {
        const { data, error } = await supabase.rpc('get_nearby_leagues', {
            user_lat: lat,
            user_lng: lng,
            dist_km: radiusKm
        });

        if (error) {
            console.error('Error fetching nearby leagues:', error);
            return [];
        }

        return (data || []).map(mapDBLeague);
    };

    const loadPublicLeague = useCallback(async (slugOrId: string) => {
        if (!slugOrId) return false;
        // SILENT REFRESH: Only show loading screen if this is the first time or league is different
        if (!league || (league.id !== slugOrId && league.slug !== slugOrId)) {
            setLoading(true);
        }
        setIsPublicView(true);

        console.log('LeagueContext: loadPublicLeague iniciado para:', slugOrId);
        try {
            // Try slug first
            let { data, error } = await supabase.from('leagues').select(`
                *,
                follower_count:followed_leagues(count)
            `).eq('slug', slugOrId).single();

            // If not found (or error) and looks like UUID, try ID
            if ((!data || error) && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId)) {
                const { data: idData } = await supabase.from('leagues').select(`
                    *,
                    follower_count:followed_leagues(count)
                `).eq('id', slugOrId).single();
                data = idData;
            }

            if (data) {
                const lg: League = mapDBLeague(data);
                setLeague(lg);
                loadLeagueData(lg.id); // Garante que times e matches sejam carregados
                return true;
            } else {
                setLeague(null);
                return false;
            }
        } catch (err) {
            setLeague(null);
            return false;
        } finally {
            console.log('LeagueContext: loadPublicLeague finalizado');
            setLoading(false);
        }
    }, []);

    const loadUserInteractions = useCallback(async (leagueId: string) => {
        if (!user) { setUserInteractions([]); return; }
        const { data } = await supabase.from('user_team_interactions').select('*').eq('user_id', user.id).eq('league_id', leagueId);
        if (data) {
            setUserInteractions(data.map(i => ({
                id: i.id, teamId: i.team_id, leagueId: i.league_id, interactionType: i.interaction_type
            })));
        }
    }, [user]);

    const loadSupportCounts = useCallback(async (leagueId: string) => {
        const { data } = await supabase.rpc('get_league_support_counts', { l_id: leagueId });
        // Fallback if RPC doesn't exist yet, we'll try a manual count
        if (data) {
            const counts: Record<string, number> = {};
            data.forEach((item: any) => { counts[item.team_id] = item.count; });
            setSupportCounts(counts);
        } else {
            const { data: interactionData } = await supabase.from('user_team_interactions')
                .select('team_id').eq('league_id', leagueId).eq('interaction_type', 'supporting');
            if (interactionData) {
                const counts: Record<string, number> = {};
                interactionData.forEach((item: any) => {
                    counts[item.team_id] = (counts[item.team_id] || 0) + 1;
                });
                setSupportCounts(counts);
            }
        }
    }, []);

    // ── Load league data (teams, matches, brackets) ────────────
    const loadLeagueData = useCallback(async (leagueId: string, background = false) => {
        if (!background) setDataLoading(true);
        loadUserInteractions(leagueId);
        loadSupportCounts(leagueId);

        // Fetch everything in parallel
        const [teamsRes, matchesRes, bracketsRes, adsRes] = await Promise.all([
            supabase.from('teams').select('*, players(*)').eq('league_id', leagueId).order('created_at'),
            supabase.from('matches').select('*, match_events(*)').eq('league_id', leagueId).order('updated_at', { ascending: false }).order('created_at', { ascending: false }),
            supabase.from('brackets').select('*').eq('league_id', leagueId).order('match_order'),
            supabase.from('ads').select('*').eq('league_id', leagueId).order('display_order', { ascending: true })
        ]);

        if (teamsRes.data) setRawTeams(teamsRes.data.map(mapDBTeam));
        if (matchesRes.data) setRawMatches(matchesRes.data.map(mapDBMatch));
        if (bracketsRes.data) setBrackets(bracketsRes.data.map(mapDBBracket));
        if (adsRes.data) setAds(adsRes.data.map((a: any) => ({
            id: a.id,
            league_id: a.league_id,
            title: a.title,
            desktop_media_url: a.desktop_media_url,
            mobile_media_url: a.mobile_media_url,
            square_media_url: a.square_media_url,
            media_type: a.media_type,
            positions: a.positions,
            object_position: a.object_position,
            link_url: a.link_url,
            duration: a.duration,
            active: a.active,
            display_order: a.display_order || 0,
            created_at: a.created_at
        })));

        setDataLoading(false);
    }, [loadUserInteractions, loadSupportCounts]);

    useEffect(() => {
        if (!league) {
            setRawTeams([]); setRawMatches([]); setBrackets([]); setUserInteractions([]); setSupportCounts({});
            return;
        }

        loadLeagueData(league.id);
        localStorage.setItem('selectedLeagueId', league.id);

        // ─── CENTRALIZED REALTIME (GOLDEN RULE: ZERO REFETCH) ───────
        console.log(`[Realtime] Connecting to league channel: ${league.id}`);
        
        const channel = supabase.channel(`league-central-${league.id}`);

        // 1. Tables with league_id filter (efficient)
        channel.on('postgres_changes', { 
            event: '*', 
            schema: 'public', 
            filter: `league_id=eq.${league.id}` 
        }, payload => {
            const { table, eventType, new: newRow, old: oldRow } = payload;
            const row = (newRow || oldRow) as any;
            console.log(`[Realtime Filtered] ${table} ${eventType}`, row.id);

            switch (table) {
                case 'matches':
                    if (eventType === 'DELETE') {
                        setRawMatches(prev => prev.filter(m => m.id !== row.id));
                    } else {
                        setRawMatches(prev => {
                            const existing = prev.find(m => m.id === row.id);
                            const mapped = mapDBMatch(row);
                            if (existing) {
                                // Important: Preserve local events if they are already loaded
                                return prev.map(m => m.id === row.id ? { ...m, ...mapped, events: m.events } : m);
                            }
                            return [...prev, mapped];
                        });
                    }
                    break;

                case 'teams':
                    if (eventType === 'DELETE') {
                        setRawTeams(prev => prev.filter(t => t.id !== row.id));
                    } else {
                        setRawTeams(prev => {
                            const existing = prev.find(t => t.id === row.id);
                            const mapped = mapDBTeam(row);
                            if (existing) {
                                // Preserve players
                                return prev.map(t => t.id === row.id ? { ...t, ...mapped, players: t.players } : t);
                            }
                            return [...prev, mapped];
                        });
                    }
                    break;

                case 'players':
                    // Although players has league_id now, we update it via teams state
                    setRawTeams(prev => prev.map(t => t.id === row.team_id ? {
                        ...t,
                        players: eventType === 'DELETE'
                            ? t.players.filter(p => p.id !== row.id)
                            : t.players.some(p => p.id === row.id)
                                ? t.players.map(p => p.id === row.id ? mapDBPlayer(row) : p)
                                : [...t.players, mapDBPlayer(row)]
                    } : t));
                    break;

                case 'brackets':
                    if (eventType === 'DELETE') {
                        setBrackets(prev => prev.filter(b => b.id !== row.id));
                    } else {
                        setBrackets(prev => prev.some(b => b.id === row.id)
                            ? prev.map(b => b.id === row.id ? mapDBBracket(row) : b)
                            : [...prev, mapDBBracket(row)]);
                    }
                    break;

                case 'ads':
                    if (eventType === 'DELETE') {
                        setAds(prev => prev.filter(a => a.id !== row.id));
                    } else {
                        setAds(prev => {
                            const exists = prev.some(a => a.id === row.id);
                            if (exists) {
                                return prev.map(a => a.id === row.id ? { ...a, ...row } : a);
                            }
                            return [...prev, row as Ad];
                        });
                    }
                    break;

                case 'user_team_interactions':
                    // Refresh support counts and personal interactions
                    loadSupportCounts(league.id);
                    loadUserInteractions(league.id);
                    break;
            }
        });

        // 2. Table: match_events (filtered by match_id locally since it lacks league_id)
        channel.on('postgres_changes', { 
            event: '*', 
            schema: 'public', 
            table: 'match_events' 
        }, payload => {
            const { eventType, new: newRow, old: oldRow } = payload;
            const row = (newRow || oldRow) as any;
            const matchId = row?.match_id;
            if (!matchId) return;

            setRawMatches(prev => prev.map(m => {
                if (m.id !== matchId) return m;
                
                const events = eventType === 'DELETE'
                    ? m.events.filter(e => e.id !== row.id)
                    : m.events.some(e => e.id === row.id)
                        ? m.events.map(e => e.id === row.id ? mapDBEvent(row) : e)
                        : [...m.events, mapDBEvent(row)];
                
                return { ...m, events };
            }));

            // Goal Notification
            if (eventType === 'INSERT' && (row.type === 'goal' || row.type === 'penalty_goal')) {
                const team = teamsRef.current.find(t => t.id === row.team_id);
                addNotification({
                    id: Math.random().toString(36).substr(2, 9),
                    title: '⚽ GOOOL!',
                    message: `Gol do ${team?.name || 'time'}!`,
                    type: 'goal',
                    teamId: row.team_id,
                    createdAt: Date.now()
                });
            }
        });

        // 3. Broadcast for low-latency timer sync and instant event feedback
        channel.on('broadcast', { event: 'match-update' }, ({ payload }) => {
            console.log('[Realtime Broadcast] Match Update', payload);
            setRawMatches(prev => prev.map(m => {
                if (m.id !== payload.matchId) return m;

                let events = m.events;
                if (payload.newEvent) {
                    const alreadyExists = events.some(e => e.id === payload.newEvent.id);
                    if (!alreadyExists) events = [...events, payload.newEvent];
                }
                if (payload.removedEventId) {
                    events = events.filter(e => e.id !== payload.removedEventId);
                }

                return { 
                    ...m, 
                    timer: payload.timer !== undefined ? payload.timer : m.timer,
                    homeScore: payload.homeScore !== undefined ? payload.homeScore : m.homeScore,
                    awayScore: payload.awayScore !== undefined ? payload.awayScore : m.awayScore,
                    period: payload.period !== undefined ? payload.period : m.period,
                    status: payload.status !== undefined ? payload.status : m.status,
                    events,
                    updatedAt: new Date().toISOString() // Force timer restart calculation
                };
            }));
        });

        channel.on('broadcast', { event: 'players-reordered' }, ({ payload }) => {
            console.log('[Realtime Broadcast] Players Reordered', payload);
            setRawTeams(prev => prev.map(t => {
                if (t.id === payload.teamId) {
                    const sortedPlayers = [...t.players].sort((a, b) => {
                        const idxA = payload.playerIds.indexOf(a.id);
                        const idxB = payload.playerIds.indexOf(b.id);
                        return idxA - idxB;
                    }).map((p, idx) => ({
                        ...p,
                        displayOrder: idx,
                        isReserve: idx >= payload.limit
                    }));
                    return { ...t, players: sortedPlayers };
                }
                return t;
            }));
        });

        channel.subscribe(status => {
            console.log(`[Realtime] Subscription status: ${status}`);
        });

        return () => {
            console.log('[Realtime] Cleaning up channel');
            supabase.removeChannel(channel);
        };
    }, [league?.id, loadLeagueData]);

    const addNotification = (notif: LeagueNotification) => {
        setNotifications(prev => [notif, ...prev].slice(0, 5));

        // Auto remove after 6 seconds (to match animation)
        setTimeout(() => {
            clearNotification(notif.id);
        }, 6000);
    };

    const clearNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    // Handle pending interaction after login
    useEffect(() => {
        if (user && pendingInteraction && league) {
            interactWithTeam(pendingInteraction.teamId, pendingInteraction.type).then(() => {
                setPendingInteraction(null);
            });
        }
    }, [user, league]); // Re-run when user or league becomes available

    const generateSlug = (name: string) => {
        return name.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    };

    // ── League CRUD ────────────────────────────────────────────
    const createLeague = async (data: Omit<League, 'id' | 'slug' | 'userId'>) => {
        const slug = generateSlug(data.name);
        const { data: existing } = await supabase.from('leagues').select('id').eq('slug', slug).single();
        if (existing) return { error: 'Uma liga com este nome já existe.' };

        const { data: row, error } = await supabase.from('leagues').insert({
            user_id: user!.id, name: data.name, logo: data.logo, max_teams: data.maxTeams,
            points_for_win: data.pointsForWin, points_for_draw: data.pointsForDraw,
            points_for_loss: data.pointsForLoss, default_half_length: data.defaultHalfLength,
            players_per_team: data.playersPerTeam, reserve_limit_per_team: data.reserveLimitPerTeam,
            substitutions_limit: data.substitutionsLimit,
            allow_substitution_return: data.allowSubstitutionReturn ?? true,
            has_overtime: data.hasOvertime ?? true,
            slug
        }).select().single();
        if (error) {
            console.error('Error creating league:', error);
            alert('Failed to create league: ' + error.message);
            return { error: error.message };
        }
        if (row) {
            const lg: League = mapDBLeague(row);
            setLeagues(prev => [...prev, lg]);
            setLeague(lg);
            return { error: null };
        }
        return { error: 'Unknown error' };
    };

    const updateLeague = async (data: Partial<League>) => {
        if (!league) return;
        const updateData: any = {
            name: data.name, logo: data.logo, max_teams: data.maxTeams,
            points_for_win: data.pointsForWin, points_for_draw: data.pointsForDraw,
            points_for_loss: data.pointsForLoss, default_half_length: data.defaultHalfLength,
            overtime_half_length: data.overtimeHalfLength,
            players_per_team: data.playersPerTeam, reserve_limit_per_team: data.reserveLimitPerTeam,
            substitutions_limit: data.substitutionsLimit,
            allow_substitution_return: data.allowSubstitutionReturn,
            has_overtime: data.hasOvertime,
            sport_type: data.sportType
        };

        if (data.name && data.name !== league.name) {
            const newSlug = generateSlug(data.name);
            const { data: existing } = await supabase.from('leagues').select('id').eq('slug', newSlug).neq('id', league.id).single();
            if (existing) {
                alert('Este nome de liga já está em uso.');
                return;
            }
            updateData.slug = newSlug;
        }

        await supabase.from('leagues').update(updateData).eq('id', league.id);
        const updated = { ...league, ...data };
        if (updateData.slug) updated.slug = updateData.slug;
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
        if (found) {
            setLeague(found);
            setIsPublicView(false);
        }
    };

    // ── Team CRUD ──────────────────────────────────────────────
    // ── Team CRUD ──────────────────────────────────────────────
    const addTeam = async (team: { name: string; logo: string }) => {
        if (!league) return { error: 'Nenhuma liga selecionada' };
        const { data, error } = await supabase.from('teams').insert({ league_id: league.id, name: team.name, logo: team.logo }).select().single();
        if (error) return { error: error.message };
        if (data) {
            setRawTeams(prev => [...prev, mapDBTeam(data)]);
        }
        return { error: null };
    };

    const updateTeam = async (teamId: string, data: Partial<{ name: string; logo: string }>) => {
        await supabase.from('teams').update(data).eq('id', teamId);
        setRawTeams(prev => prev.map(t => t.id === teamId ? { ...t, ...data } : t));
    };

    const deleteTeam = async (teamId: string) => {
        await supabase.from('teams').delete().eq('id', teamId);
        setRawTeams(prev => prev.filter(t => t.id !== teamId));
    };

    // ── Player CRUD ────────────────────────────────────────────
    // ── Player CRUD ────────────────────────────────────────────
    const addPlayer = async (teamId: string, player: Omit<Player, 'id' | 'stats'>) => {
        const team = rawTeams.find(t => t.id === teamId);
        if (!team || !league) return { error: 'Time ou liga não encontrados' };

        // Validação de número único no time
        if (team.players.some(p => p.number === player.number)) {
            return { error: `O número ${player.number} já está sendo usado neste time.` };
        }

        // Validação de limites (Titulares / Reservas)
        const currentStarters = team.players.filter(p => !p.isReserve).length;
        const currentReserves = team.players.filter(p => p.isReserve).length;

        if (!player.isReserve && currentStarters >= (league.playersPerTeam || 5)) {
            return { error: `O limite de titulares (${league.playersPerTeam}) já foi atingido. Inscreva-o como Reserva.` };
        }
        if (player.isReserve && currentReserves >= (league.reserveLimitPerTeam || 5)) {
            return { error: `O limite de reservas (${league.reserveLimitPerTeam}) já foi atingido.` };
        }

        const { data, error } = await supabase.from('players').insert({
            team_id: teamId, 
            league_id: league.id, 
            name: player.name, 
            number: player.number,
            position: player.position, 
            photo: player.photo || '',
            is_captain: player.isCaptain || false, 
            is_reserve: player.isReserve || false
        }).select().single();

        if (error) return { error: error.message };
        if (data) {
            const newPlayer = mapDBPlayer(data);
            setRawTeams(prev => prev.map(t => {
                if (t.id === teamId) {
                    const updatedPlayers = [...t.players, newPlayer];
                    // Se for o primeiro titular e não houver capitão, torna-o capitão
                    const hasCaptain = updatedPlayers.some(p => p.isCaptain);
                    if (!hasCaptain && !newPlayer.isReserve) {
                        newPlayer.isCaptain = true;
                        supabase.from('players').update({ is_captain: true }).eq('id', newPlayer.id).then();
                    }
                    return { ...t, players: updatedPlayers };
                }
                return t;
            }));
        }
        return { error: null };
    };

    const updatePlayer = async (teamId: string, playerId: string, data: Partial<Player>) => {
        const team = rawTeams.find(t => t.id === teamId);
        const player = team?.players.find(p => p.id === playerId);
        if (!team || !player || !league) return { error: 'Dados insuficientes' };

        // Validação de limites se estiver alterando o status de reserva
        if (data.isReserve !== undefined && data.isReserve !== player.isReserve) {
            if (!data.isReserve) { // Tentando se tornar Titular
                const startersCount = team.players.filter(p => !p.isReserve).length;
                if (startersCount >= (league.playersPerTeam || 5)) {
                    return { error: `Não é possível tornar este jogador Titular. Limite de ${league.playersPerTeam} atingido.` };
                }
            } else { // Tentando se tornar Reserva
                const reservesCount = team.players.filter(p => p.isReserve).length;
                if (reservesCount >= (league.reserveLimitPerTeam || 5)) {
                    return { error: `Não é possível tornar este jogador Reserva. Limite de ${league.reserveLimitPerTeam} atingido.` };
                }
            }
        }

        // Regra do Capitão Titular: Capitão SEMPRE deve ser Titular
        if (data.isCaptain) {
            data.isReserve = false; 
            for (const p of team.players) {
                if (p.isCaptain && p.id !== playerId) await supabase.from('players').update({ is_captain: false }).eq('id', p.id);
            }
        } else if (data.isReserve === true && player.isCaptain) {
            // Se o atual capitão está sendo movido para reserva, ele perde o posto
            // e precisamos passar para outro titular
            const otherStarter = team.players.find(p => p.id !== playerId && !p.isReserve);
            if (otherStarter) {
                await supabase.from('players').update({ is_captain: true }).eq('id', otherStarter.id);
                // O estado local será atualizado no setRawTeams abaixo
            }
        }

        const { error } = await supabase.from('players').update({
            name: data.name, 
            number: data.number, 
            position: data.position,
            photo: data.photo, 
            is_captain: data.isCaptain, 
            is_reserve: data.isReserve
        }).eq('id', playerId);

        if (error) return { error: error.message };

        setRawTeams(prev => prev.map(t => t.id === teamId
            ? { 
                ...t, 
                players: t.players.map(p => {
                    if (p.id === playerId) return { ...p, ...data };
                    // Se marcamos um novo capitão, desmarcamos os outros
                    if (data.isCaptain && p.id !== playerId) return { ...p, isCaptain: false };
                    // Se o capitão virou reserva, passamos a braçadeira
                    if (data.isReserve === true && player.isCaptain && !p.isReserve && p.id !== playerId) {
                         // Só passa para o primeiro starter que encontrar se ninguém mais for capitão agora
                         const willHaveCaptain = t.players.some(pl => pl.id === playerId ? data.isCaptain : pl.isCaptain);
                         if (!willHaveCaptain) return { ...p, isCaptain: true };
                    }
                    return p;
                }) 
              }
            : t
        ));
        return { error: null };
    };

    const removePlayer = async (teamId: string, playerId: string) => {
        const team = rawTeams.find(t => t.id === teamId);
        const player = team?.players.find(p => p.id === playerId);
        const wasCaptain = player?.isCaptain;

        await supabase.from('players').delete().eq('id', playerId);
        
        setRawTeams(prev => prev.map(t => {
            if (t.id === teamId) {
                const updatedPlayers = t.players.filter(p => p.id !== playerId);
                // Se o removido era o capitão, precisamos de um novo entre os titulares
                if (wasCaptain && updatedPlayers.length > 0) {
                    const starter = updatedPlayers.find(p => !p.isReserve) || updatedPlayers[0];
                    if (starter) {
                        starter.isCaptain = true;
                        supabase.from('players').update({ is_captain: true }).eq('id', starter.id).then();
                    }
                }
                return { ...t, players: updatedPlayers };
            }
            return t;
        }));
    };

    const toggleCaptain = async (teamId: string, playerId: string) => {
        const team = rawTeams.find(t => t.id === teamId);
        if (!team) return;
        const pl = team.players.find(p => p.id === playerId);
        if (!pl) return;

        const newVal = !pl.isCaptain;
        
        // Se for para desativar o único capitão, não permitimos (sempre deve ter um)
        if (!newVal && team.players.filter(p => p.isCaptain).length <= 1) return;

        // Se for ativar, garantimos que seja titular
        let updatedReserve = pl.isReserve;
        if (newVal) {
            updatedReserve = false;
            await supabase.from('players').update({ is_reserve: false }).eq('id', playerId);
        }

        for (const p of team.players) {
            if (p.isCaptain && p.id !== playerId) await supabase.from('players').update({ is_captain: false }).eq('id', p.id);
        }
        await supabase.from('players').update({ is_captain: newVal }).eq('id', playerId);
        
        setRawTeams(prev => prev.map(t => t.id === teamId
            ? { ...t, players: t.players.map(p => ({ 
                ...p, 
                isCaptain: p.id === playerId ? newVal : false,
                isReserve: p.id === playerId ? updatedReserve : p.isReserve 
            })) }
            : t
        ));
    };
    
    const reorderPlayers = async (teamId: string, playerIds: string[]) => {
        if (!league) return;
        const limit = league.playersPerTeam || 5;
        
        let newCaptainId = '';
        const currentTeam = rawTeams.find(t => t.id === teamId);
        const currentCaptain = currentTeam?.players.find(p => p.isCaptain);
        
        // If captain moved to reserve or doesn't exist, first player becomes captain
        const captainIdx = currentCaptain ? playerIds.indexOf(currentCaptain.id) : -1;
        if (captainIdx >= limit || captainIdx === -1) {
            newCaptainId = playerIds[0];
        }

        // Prepare updates
        const promises = playerIds.map((pid, idx) => {
            const isReserve = idx >= limit;
            const isCaptain = newCaptainId ? (pid === newCaptainId) : (pid === currentCaptain?.id);
            return supabase.from('players').update({ 
                display_order: idx,
                is_reserve: isReserve,
                is_captain: isCaptain
            }).eq('id', pid);
        });

        await Promise.all(promises);

        // Update local state
        setRawTeams(prev => prev.map(t => {
            if (t.id === teamId) {
                const sortedPlayers = [...t.players].sort((a, b) => {
                    const idxA = playerIds.indexOf(a.id);
                    const idxB = playerIds.indexOf(b.id);
                    return idxA - idxB;
                }).map((p, idx) => ({
                    ...p,
                    displayOrder: idx,
                    isReserve: idx >= limit,
                    isCaptain: newCaptainId ? (p.id === newCaptainId) : (p.id === currentCaptain?.id)
                }));
                return { ...t, players: sortedPlayers };
            }
            return t;
        }));

        // Broadcast change
        supabase.channel(`league-central-${league.id}`).send({
            type: 'broadcast',
            event: 'players-reordered',
            payload: { teamId, playerIds, limit }
        });
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
            setRawMatches((prev: Match[]) => [...prev, mapDBMatch(row)]);
            return { error: null, matchId: row.id };
        }
        return { error: 'Unknown error' };
    };

    const updateMatch = async (matchId: string, data: Partial<Match>) => {
        await supabase.from('matches').update({
            home_score: data.homeScore, away_score: data.awayScore, status: data.status,
            timer: data.timer, youtube_live_id: data.youtubeLiveId, half_length: data.halfLength,
            extra_time: data.extraTime, period: data.period,
            scheduled_at: data.scheduledAt, location: data.location
        }).eq('id', matchId);
        
        const currentMatch = rawMatches.find(m => m.id === matchId);
        let finalTimer = data.timer;
        
        // If match is live and we are not explicitly changing the timer, "freeze" the current live time as a new base
        if (currentMatch && currentMatch.status === 'live' && finalTimer === undefined) {
            const lastUpdate = new Date(currentMatch.updatedAt || new Date().toISOString()).getTime();
            const diffInSeconds = Math.max(0, Math.floor((Date.now() - lastUpdate) / 1000));
            finalTimer = (currentMatch.timer || 0) + diffInSeconds;
        }

        const effectiveData = { ...data, timer: finalTimer ?? currentMatch?.timer ?? 0 };

        // Optimistic update with current time to keep timer sync smooth
        setRawMatches((prev: Match[]) => prev.map(m => m.id === matchId ? { 
            ...m, 
            ...effectiveData,
            updatedAt: new Date().toISOString() 
        } : m));

        // BROADCAST for other users (low latency)
        if (currentMatch) {
            supabase.channel(`league-central-${league?.id}`).send({
                type: 'broadcast',
                event: 'match-update',
                payload: {
                    matchId,
                    timer: effectiveData.timer ?? currentMatch.timer,
                    homeScore: effectiveData.homeScore ?? currentMatch.homeScore,
                    awayScore: effectiveData.awayScore ?? currentMatch.awayScore,
                    period: effectiveData.period ?? currentMatch.period,
                    status: effectiveData.status ?? currentMatch.status,
                    updatedAt: new Date().toISOString()
                }
            });
        }
    };

    const deleteMatch = async (matchId: string) => {
        await supabase.from('matches').delete().eq('id', matchId);
        setRawMatches((prev: Match[]) => prev.filter(m => m.id !== matchId));
    };

    const startMatch = async (matchId: string, currentTimer: number = 0, shouldStartLive = false) => {
        const match = rawMatches.find(m => m.id === matchId);
        let youtubeLiveId = match?.youtubeLiveId;

        // Create YouTube Live ONLY if requested, authenticated, and match is not finished
        if (shouldStartLive && isYtAuthenticated && match && match.status !== 'finished' && !youtubeLiveId) {
            const ht = rawTeams.find(t => t.id === match.homeTeamId);
            const at = rawTeams.find(t => t.id === match.awayTeamId);
            const title = `${league?.name} - ${ht?.name} x ${at?.name}`;
            
            try {
                const result = await ytService.createLiveBroadcast(title, `Assista ao vivo: ${title}`);
                if (result.broadcastId) {
                    youtubeLiveId = result.broadcastId;
                    setCurrentYtLiveStream({
                        streamKey: result.streamKey,
                        rtmpUrl: result.rtmpUrl
                    });
                }
            } catch (err: any) {
                console.error('Failed to create YouTube Live broadcast:', err);
                alert("Aviso: Não foi possível iniciar a Live no YouTube.\n\nMotivo: " + (err.message || "Erro desconhecido") + "\n\nO jogo será iniciado sem transmissão ao vivo.");
            }
        }

        // Ao iniciar/retomar, salvamos o tempo atual e o Supabase cuidará do updated_at (agora)
        return updateMatch(matchId, { status: 'live', timer: currentTimer, youtubeLiveId });
    };

    const deleteYtLive = async (matchId: string, broadcastId: string) => {
        try {
            await ytService.deleteBroadcast(broadcastId);
            await updateMatch(matchId, { youtubeLiveId: undefined });
        } catch (err: any) {
            console.error('Failed to delete YT broadcast:', err);
            throw err;
        }
    };

    const setYtLivePrivacy = async (broadcastId: string, privacy: 'public' | 'private' | 'unlisted') => {
        try {
            await ytService.setBroadcastPrivacy(broadcastId, privacy);
        } catch (err: any) {
            console.error('Failed to set YT privacy:', err);
            throw err;
        }
    };
    
    const pauseMatch = async (matchId: string, currentTimer: number) => {
        // Ao pausar, salvamos o tempo exato acumulado
        return updateMatch(matchId, { status: 'scheduled', timer: currentTimer });
    };

    const endMatch = async (matchId: string, currentTimer: number) => {
        return updateMatch(matchId, { status: 'finished', timer: currentTimer });
    };
    
    const updateTimer = async (matchId: string, time: number) => updateMatch(matchId, { timer: time });

    const isPlayerOnPitch = (match: Match, playerId: string) => {
        const teamId = [...rawTeams].find(t => t.players.some(p => p.id === playerId))?.id;
        if (!teamId) return false;
        
        const team = rawTeams.find(t => t.id === teamId);
        const player = team?.players.find(p => p.id === playerId);
        if (!player) return false;

        // Check cards
        const redCards = match.events.filter(e => e.type === 'red_card' && e.playerId === playerId).length;
        if (redCards > 0) return false;

        const subIns = match.events.filter(e => e.type === 'substitution' && e.playerId === playerId).length;
        const subOuts = match.events.filter(e => e.type === 'substitution' && e.playerOutId === playerId).length;

        if (player.isReserve) {
            return subIns > subOuts;
        } else {
            return subOuts <= subIns;
        }
    };

    const addEvent = async (matchId: string, event: Omit<MatchEvent, 'id'>) => {
        // 1. Get current match state safely
        const m = rawMatches.find(x => String(x.id) === String(matchId));
        if (!m) {
            console.error('[LeagueContext] Partida não encontrada para addEvent:', matchId);
            return;
        }

        // 2. SNAPSHOT TIMER: Calculate current running time to use as new 0-base
        const now = Date.now();
        let snapshotTimer = m.timer || 0;
        if (m.status === 'live') {
            const lastUpdate = new Date(m.updatedAt || now).getTime();
            const diffInSeconds = Math.max(0, Math.floor((now - lastUpdate) / 1000));
            snapshotTimer += diffInSeconds;
        }

        // 3. Persist Event
        const { data, error } = await supabase.from('match_events').insert({
            match_id: matchId, type: event.type, team_id: event.teamId,
            player_id: event.playerId, player_out_id: event.playerOutId, minute: event.minute
        }).select().single();
        
        if (error || !data) {
            console.error('[LeagueContext] Erro ao salvar evento:', error);
            return;
        }
        
        const mappedEvent = mapDBEvent(data);
        
        // 4. Calculate New Scores
        let newHomeScore = m.homeScore || 0;
        let newAwayScore = m.awayScore || 0;
        if (event.type === 'goal' || event.type === 'penalty_goal') {
            if (String(event.teamId) === String(m.homeTeamId)) newHomeScore++;
            else newAwayScore++;
        } else if (event.type === 'own_goal') {
            if (String(event.teamId) === String(m.homeTeamId)) newAwayScore++;
            else newHomeScore++;
        }

        const newMatchState = {
            ...m,
            homeScore: newHomeScore,
            awayScore: newAwayScore,
            timer: snapshotTimer,
            updatedAt: new Date(now).toISOString(),
            events: [...m.events, mappedEvent]
        };

        // 5. Update Local State (Optimistic)
        setRawMatches(prev => prev.map(x => String(x.id) === String(matchId) ? newMatchState : x));

        // 6. Sync with Database
        const isScoreChange = event.type === 'goal' || event.type === 'penalty_goal' || event.type === 'own_goal';
        
        const updateData: any = { timer: snapshotTimer };
        if (isScoreChange) {
            updateData.home_score = newHomeScore;
            updateData.away_score = newAwayScore;
        }

        await supabase.from('matches').update(updateData).eq('id', matchId);

        // 7. BROADCAST for Overlays (Critical for low latency sync)
        supabase.channel(`league-central-${league?.id}`).send({
            type: 'broadcast',
            event: 'match-update',
            payload: {
                matchId,
                timer: snapshotTimer,
                homeScore: newHomeScore,
                awayScore: newAwayScore,
                period: m.period,
                status: m.status,
                newEvent: mappedEvent,
                updatedAt: new Date(now).toISOString()
            }
        });

        // Lógica de Transferência de Braçadeira (Substituição ou Vermelho do Capitão)
        if (event.type === 'substitution' || event.type === 'red_card') {
            const team = rawTeams.find(t => t.id === event.teamId);
            const match = rawMatches.find(m => m.id === matchId);
            if (!team || !match) return;
            
            const pId = event.type === 'substitution' ? event.playerOutId : event.playerId;
            const player = team.players.find(p => p.id === pId);

            if (player?.isCaptain) {
                let newCaptainId = '';
                if (event.type === 'substitution') {
                    newCaptainId = event.playerId as string; // O que entra herda a braçadeira
                } else {
                    // No vermelho, passa para outro que esteja em campo
                    // Precisamos considerar o evento que acabamos de adicionar (o vermelho)
                    const onPitch = team.players.filter(p => p.id !== player.id && isPlayerOnPitch({ ...m, events: [...m.events, mappedEvent] }, p.id));
                    if (onPitch.length > 0) newCaptainId = onPitch[0].id;
                }

                if (newCaptainId) {
                    await toggleCaptain(team.id, newCaptainId);
                }
            }
        }
    };

    const removeEvent = async (matchId: string, eventId: string) => {
        const match = rawMatches.find(m => m.id === matchId);
        const event = match?.events.find(e => e.id === eventId);
        await supabase.from('match_events').delete().eq('id', eventId);

        let newHomeScore = 0;
        let newAwayScore = 0;

        setRawMatches(prev => prev.map(m => {
            if (m.id !== matchId) return m;

            newHomeScore = m.homeScore;
            newAwayScore = m.awayScore;

            if (event && (event.type === 'goal' || event.type === 'penalty_goal' || event.type === 'own_goal')) {
                const scoringTeamIsHome = event.type === 'own_goal' ? (event.teamId !== m.homeTeamId) : (event.teamId === m.homeTeamId);
                if (scoringTeamIsHome) newHomeScore = Math.max(0, newHomeScore - 1);
                else newAwayScore = Math.max(0, newAwayScore - 1);
            }

            return {
                ...m,
                events: m.events.filter(e => e.id !== eventId),
                homeScore: newHomeScore,
                awayScore: newAwayScore,
                updatedAt: new Date().toISOString()
            };
        }));

        if (event && (event.type === 'goal' || event.type === 'penalty_goal' || event.type === 'own_goal')) {
            await supabase.from('matches').update({
                home_score: newHomeScore,
                away_score: newAwayScore,
            }).eq('id', matchId);
        }

        // BROADCAST for instant feedback (important for non-score events too)
        supabase.channel(`league-central-${league?.id}`).send({
            type: 'broadcast',
            event: 'match-update',
            payload: {
                matchId,
                removedEventId: eventId,
                homeScore: newHomeScore,
                awayScore: newAwayScore,
                updatedAt: new Date().toISOString()
            }
        });
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



    const generateGroups = async (teamsPerGroup: number) => {
        if (!league || teams.length === 0) return;

        const shuffled = [...teams].sort(() => Math.random() - 0.5);
        const groupLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

        const updates = shuffled.map((team, index) => {
            const groupIndex = Math.floor(index / teamsPerGroup);
            const groupName = groupLetters[groupIndex] || `Grupo ${groupIndex + 1}`;
            return supabase.from('teams').update({ group_name: groupName }).eq('id', team.id);
        });

        await Promise.all(updates);
        loadLeagueData(league.id);
    };

    const interactWithTeam = async (teamId: string, type: TeamInteraction['interactionType']) => {
        if (!user) {
            setPendingInteraction({ teamId, type });
            setShowAuthModal(true);
            return;
        }

        if (!league) return;

        // --- Optimistic Update ---
        const oldInteractions = [...userInteractions];
        let newInteractions = [...userInteractions];

        // Helper to find existing of same type in this league
        const existingOfType = oldInteractions.filter(i => i.leagueId === league.id && i.interactionType === type);
        const existingExact = oldInteractions.find(i => i.teamId === teamId && i.interactionType === type);

        if (existingExact) {
            // Toggle OFF: Remove this specific interaction
            newInteractions = newInteractions.filter(i => i.id !== existingExact.id);
        } else {
            // Toggle ON or Switch: 
            if (type === 'supporting') {
                // Rule: Only 1 supporting per league. Remove others first.
                newInteractions = newInteractions.filter(i => !(i.leagueId === league.id && i.interactionType === 'supporting'));
                // Rule: Cannot support and rival the same team
                newInteractions = newInteractions.filter(i => !(i.teamId === teamId && i.interactionType === 'rival'));
            } else if (type === 'rival') {
                // Rule: Cannot support and rival the same team
                newInteractions = newInteractions.filter(i => !(i.teamId === teamId && i.interactionType === 'supporting'));
            }
            
            // Add the new one optimistically
            newInteractions.push({
                id: 'temp-' + Date.now(),
                teamId,
                leagueId: league.id,
                interactionType: type
            });
        }

        setUserInteractions(newInteractions);

        try {
            // 1. If it's a toggle off (exact match found above)
            if (existingExact) {
                await supabase.from('user_team_interactions').delete().eq('id', existingExact.id);
            } else {
                // 2. Rules Implementation (Cleanup in DB)
                if (type === 'supporting') {
                    // Delete any existing supporting in this league
                    if (existingOfType.length > 0) {
                        await supabase.from('user_team_interactions')
                            .delete()
                            .eq('user_id', user.id)
                            .eq('league_id', league.id)
                            .eq('interaction_type', 'supporting');
                    }

                    // Delete rival for same team if exists
                    await supabase.from('user_team_interactions')
                        .delete()
                        .eq('user_id', user.id)
                        .eq('team_id', teamId)
                        .eq('interaction_type', 'rival');
                } else if (type === 'rival') {
                    // Delete support for same team if exists
                    await supabase.from('user_team_interactions')
                        .delete()
                        .eq('user_id', user.id)
                        .eq('team_id', teamId)
                        .eq('interaction_type', 'supporting');
                }

                // 3. Insert new interaction
                await supabase.from('user_team_interactions').insert({
                    user_id: user.id,
                    league_id: league.id,
                    team_id: teamId,
                    interaction_type: type
                });
            }
        } catch (error) {
            console.error('Error interacting with team:', error);
            setUserInteractions(oldInteractions); // Rollback on error
        } finally {
            // Final refresh to ensure sync with DB (IDs etc)
            loadUserInteractions(league.id);
            loadSupportCounts(league.id);
        }
    };

    const removeInteraction = async (interactionId: string) => {
        await supabase.from('user_team_interactions').delete().eq('id', interactionId);
        if (league) loadUserInteractions(league.id);
    };



    return (
        <LeagueContext.Provider value={{
            league, leagues, followedLeagues, teams, matches, brackets, loading, dataLoading,
            createLeague, updateLeague, deleteLeague, selectLeague, generateGroups,
            followLeague, unfollowLeague, searchLeagues, fetchNearbyLeagues,
            addTeam, updateTeam, deleteTeam,
            addPlayer, updatePlayer, removePlayer, toggleCaptain, reorderPlayers, isPlayerOnPitch,
            createMatch, updateMatch, deleteMatch, startMatch, pauseMatch, endMatch, updateTimer,
            addEvent, removeEvent,
            generateBracket, updateBracket, loadLeagues, isPublicView, setIsPublicView, isAdmin, loadPublicLeague,
            userInteractions, interactWithTeam, removeInteraction, pendingInteraction, setPendingInteraction,
            showAuthModal, setShowAuthModal,
            supportCounts, notifications, clearNotification, leagueBasePath,
            ads, addAd, updateAd, deleteAd, reorderAds,
            ytToken, ytLogin, ytLogout, isYtAuthenticated, currentYtLiveStream, recoverStreamDetails,
            deleteYtLive, setYtLivePrivacy
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
