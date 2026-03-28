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
    stats: { goals: number; assists: number; ownGoals: number; yellowCards: number; redCards: number; points?: number; points1?: number; points2?: number; points3?: number; rebounds?: number; blocks?: number; steals?: number; fouls?: number; };
};

export type Team = {
    id: string;
    name: string;
    logo: string;
    primaryColor?: string;
    secondaryColor?: string;
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
    addTeam: (team: { name: string; logo: string; primary_color?: string; secondary_color?: string }) => Promise<{ error: string | null }>;
    updateTeam: (teamId: string, data: Partial<{ name: string; logo: string; primary_color: string; secondary_color: string }>) => Promise<{ error: string | null }>;
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
    loadTeamPhotos: (teamId: string) => Promise<void>;
    loadPlayerPhotos: (playerIds: string[]) => Promise<void>;
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
    globalAdTick: number;

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
        primaryColor: t.primary_color || null,
        secondaryColor: t.secondary_color || null,
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
    id: l.id, name: l.name || 'Sem nome', logo: l.logo || '', maxTeams: l.max_teams || 20,
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
        if (!rawTeams || !Array.isArray(rawTeams) || rawTeams.length === 0) return [];

        try {
            // ── PERFORMANCE: Single O(N) pass over all events to build lookup maps ──
        // Instead of multiple .filter() calls per player per stat type,
        // we scan events once and group by playerId.
        type PlayerAcc = {
            goals: number; assists: number; ownGoals: number; yellowCards: number;
            redCards: number; points1: number; points2: number; points3: number;
            rebounds: number; blocks: number; steals: number; fouls: number;
        };
        const playerStatsMap = new Map<string, PlayerAcc>();

        rawMatches.forEach(m => (m.events || []).forEach(e => {
            if (!e || !e.playerId) return;
            if (!playerStatsMap.has(e.playerId)) {
                playerStatsMap.set(e.playerId, { goals: 0, assists: 0, ownGoals: 0, yellowCards: 0, redCards: 0, points1: 0, points2: 0, points3: 0, rebounds: 0, blocks: 0, steals: 0, fouls: 0 });
            }
            const s = playerStatsMap.get(e.playerId)!;
            switch (e.type) {
                case 'goal': case 'penalty_goal': s.goals++; break;
                case 'assist': s.assists++; break;
                case 'own_goal': s.ownGoals++; break;
                case 'yellow_card': s.yellowCards++; s.fouls++; break;
                case 'red_card': s.redCards++; s.fouls++; break;
                case 'points_1': s.points1++; break;
                case 'points_2': s.points2++; break;
                case 'points_3': s.points3++; break;
                case 'rebound': s.rebounds++; break;
                case 'block': s.blocks++; break;
                case 'steal': s.steals++; break;
                case 'foul': s.fouls++; break;
            }
        }));

        const pwWin = league?.pointsForWin ?? 3;
        const pwDraw = league?.pointsForDraw ?? 1;
        const pwLoss = league?.pointsForLoss ?? 0;
        
        return rawTeams.map(t => {
            if (!t) return null as any;
            const teamMatches = rawMatches.filter(
                m => (m.status === 'finished' || m.status === 'live') && (m.homeTeamId === t.id || m.awayTeamId === t.id)
            );
            
            let wins = 0, draws = 0, losses = 0, goalsFor = 0, goalsAgainst = 0;
            const form: ('W' | 'D' | 'L')[] = [];

            // Sort matches for accurate form calculation
            const sortedTeamMatches = [...teamMatches].sort((a, b) => 
                new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
            );

            teamMatches.forEach(m => {
                if (!m) return;
                const isHome = m.homeTeamId === t.id;
                const gf = (isHome ? m.homeScore : m.awayScore) || 0;
                const ga = (isHome ? m.awayScore : m.homeScore) || 0;
                goalsFor += gf; goalsAgainst += ga;
                
                if (m.status === 'finished') {
                    if (gf > ga) wins++;
                    else if (gf < ga) losses++;
                    else draws++;
                }
            });

            // Calculate form from last 5 games
            sortedTeamMatches.slice(0, 5).forEach(m => {
                if (m.status !== 'finished') return;
                const isHome = m.homeTeamId === t.id;
                const gf = (isHome ? m.homeScore : m.awayScore) || 0;
                const ga = (isHome ? m.awayScore : m.homeScore) || 0;
                if (gf > ga) form.push('W');
                else if (gf === ga) form.push('D');
                else form.push('L');
            });

            const points = wins * pwWin + draws * pwDraw + losses * pwLoss;

            return {
                ...t,
                players: (t.players || []).map(p => {
                    const s = playerStatsMap.get(p.id) || { goals: 0, assists: 0, ownGoals: 0, yellowCards: 0, redCards: 0, points1: 0, points2: 0, points3: 0, rebounds: 0, blocks: 0, steals: 0, fouls: 0 };
                    return {
                        ...p,
                        stats: {
                            goals: s.goals,
                            assists: s.assists,
                            ownGoals: s.ownGoals,
                            yellowCards: s.yellowCards,
                            redCards: s.redCards,
                            points: (s.points1 || 0) * 1 + (s.points2 || 0) * 2 + (s.points3 || 0) * 3,
                            points1: s.points1 || 0, points2: s.points2 || 0, points3: s.points3 || 0,
                            rebounds: s.rebounds || 0, blocks: s.blocks || 0, steals: s.steals || 0, fouls: s.fouls || 0
                        }
                    };
                }),
                stats: { matches: teamMatches.filter(m => m.status === 'finished').length, wins, draws, losses, goalsFor, goalsAgainst, points, form: form.reverse() }
            };
        });
        } catch (err) {
            console.error('LeagueContext: Error memoizing teams:', err);
            return [];
        }
    }, [rawTeams, rawMatches, league?.pointsForWin, league?.pointsForDraw, league?.pointsForLoss]);

    
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
    const [globalAdTick, setGlobalAdTick] = useState(0);

    // Global Ad cycle tick (Syncs ads across all tabs)
    useEffect(() => {
        const adTimer = setInterval(() => {
            setGlobalAdTick(prev => prev + 1);
        }, 5000); // 5 seconds average duration for global sync
        return () => clearInterval(adTimer);
    }, []);

    // Refs for realtime handlers to avoid infinite loops
    const teamsRef = useRef<Team[]>([]);
    const matchesRef = useRef<Match[]>([]);
    const interactionsRef = useRef<TeamInteraction[]>([]);

    const loadingRef = useRef<string | null>(null);

    // ─── SESSION CACHE (Solving "Site sem memória") ──────────────
    useEffect(() => {
        if (league) {
            sessionStorage.setItem(`league_cache_${league.id}`, JSON.stringify({
                league,
                teams: rawTeams,
                matches: rawMatches,
                ads,
                brackets,
                timestamp: Date.now()
            }));
            localStorage.setItem('selectedLeagueId', league.id);
        }
    }, [league, rawTeams, rawMatches, ads, brackets]);

    const tryRecoverFromCache = useCallback((leagueId: string) => {
        const cached = sessionStorage.getItem(`league_cache_${leagueId}`);
        if (cached) {
            try {
                const data = JSON.parse(cached);
                // Only use cache if it's less than 30 minutes old for fresh start
                if (Date.now() - data.timestamp < 30 * 60 * 1000) {
                    setLeague(data.league);
                    setRawTeams(data.teams);
                    setRawMatches(data.matches);
                    setAds(data.ads || []);
                    setBrackets(data.brackets || []);
                    teamsRef.current = data.teams;
                    return true;
                }
            } catch (e) { console.error('Cache recovery failed', e); }
        }
        return false;
    }, []);

    // Warm boot from session cache if available
    useEffect(() => {
        const savedId = localStorage.getItem('selectedLeagueId');
        if (savedId && !league) {
            console.log('LeagueContext: Warm booting league from cache...', savedId);
            tryRecoverFromCache(savedId);
        }
    }, [tryRecoverFromCache, league]);

    useEffect(() => { teamsRef.current = teams; }, [teams]);
    useEffect(() => { matchesRef.current = matches; }, [matches]);
    useEffect(() => { interactionsRef.current = userInteractions; }, [userInteractions]);

    // Track if we are doing a silent background refresh

    const isAdmin = !!user && !!league && league.userId === user.id;

    const leagueBasePath = isPublicView && league ? `/view/${league.slug || league.id}` : '';

    // ── Load all leagues for user ──────────────────────────────
    useEffect(() => {
        console.log('LeagueContext: Global useEffect triggered', { userId: user?.id, isPublicView, loading });
        
        // Safety timeout for global loading
        const globalTimeout = setTimeout(() => {
            setLoading(prev => {
                if (prev) {
                    console.warn('LeagueContext: Global loading safety timeout reached. Forcing false.');
                    return false;
                }
                return prev;
            });
        }, 6000);

        if (!user) {
            console.log('LeagueContext: No user session found (waiting or logged out)');
            setLeagues([]);
            
            // Try to recover last visited league even without login
            const savedLeagueId = localStorage.getItem('selectedLeagueId');
            if (savedLeagueId && !league) {
                console.log('LeagueContext: Found saved league ID, fetching public data...', savedLeagueId);
                loadPublicLeague(savedLeagueId);
            }

            // Don't clear the league state immediately to avoid UI jumps during 
            // initial auth mounting, except if we are SURE we aren't in a public view
            if (!isPublicView && !savedLeagueId) {
                setLeague(null);
            }
            // If we don't have a user, we can't be loading non-public leagues
            if (!isPublicView) {
                setLoading(false);
            }
            clearTimeout(globalTimeout);
            return;
        }
        
        loadLeagues().finally(() => {
            console.log('LeagueContext: loadLeagues finished');
            clearTimeout(globalTimeout);
        });
        
        return () => clearTimeout(globalTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, isPublicView]);

    const loadLeagues = async () => {
        try {
            if (!user) {
                setLoading(false);
                return;
            }
            // SILENT REFRESH: Only show active loading if we don't have leagues yet
            if (leagues.length === 0) setLoading(true);

            // Load owned & followed leagues in parallel
            const [ownedRes, followsRes] = await Promise.all([
                supabase.from('leagues').select('*, follower_count:followed_leagues(count)').eq('user_id', user.id).order('created_at', { ascending: true }),
                supabase.from('followed_leagues').select('leagues(*, follower_count:followed_leagues(count))').eq('user_id', user.id)
            ]);

            if (ownedRes.data) {
                const mapped: League[] = ownedRes.data.map(mapDBLeague);
                setLeagues(mapped);
                // Auto-selection of first league removed to prioritize the League Selector on boot
            }

            if (followsRes.data) {
                const mapped: League[] = followsRes.data
                    .filter(f => f.leagues)
                    .map(f => mapDBLeague(f.leagues));
                setFollowedLeagues(mapped);
            }
        } catch (err) {
            console.error('LeagueContext: Erro em loadLeagues:', err);
        } finally {
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

        if (query) {
            filtered = filtered.filter(l => (l.name || "").toLowerCase().includes(query.toLowerCase()));
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
        
        try {
            const isSameLeague = league && (league.slug === slugOrId || league.id === slugOrId);

            if (!isSameLeague) {
                console.log('LeagueContext: Resetting data for new public league');
                setLoading(true);
                setDataLoading(true); // Ensure full reload state for new league
                setRawTeams([]);
                setRawMatches([]);
                setBrackets([]);
                setUserInteractions([]);
                setSupportCounts({});
            } else {
                console.log('LeagueContext: Same league requested, keeping current data for seamless transition');
                // Silent update in background if it's the same league
            }
            
            setIsPublicView(true);

            // Fetch by slug
            let { data, error } = await supabase.from('leagues').select(`
                *,
                follower_count:followed_leagues(count)
            `).eq('slug', slugOrId).maybeSingle();

            // If not found by slug, maybe it was an ID (UUID)
            if ((!data || error) && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId)) {
                const { data: idData } = await supabase.from('leagues').select(`
                    *,
                    follower_count:followed_leagues(count)
                `).eq('id', slugOrId).maybeSingle();
                data = idData;
            }

            if (data) {
                const mapped = mapDBLeague(data);
                
                // Only update state if something changed or it's a new league
                if (!isSameLeague || JSON.stringify(mapped) !== JSON.stringify(league)) {
                    setLeague(mapped);
                    localStorage.setItem('selectedLeagueId', mapped.id);
                }
                
                // If it's the SAME league, loadLeagueData will be called by useEffect [league?.id]
                // But we already have the data, so it will be a background refresh.
                return true;
            } else {
                console.warn('LeagueContext: Public league not found');
                setLeague(null);
                return false;
            }
        } catch (err) {
            console.error('LeagueContext: Error in loadPublicLeague:', err);
            return false;
        } finally {
            setLoading(false);
            console.log('LeagueContext: loadPublicLeague completed');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadUserInteractions = useCallback(async (leagueId: string) => {
        if (!user) { setUserInteractions([]); return; }
        try {
            const { data } = await supabase.from('user_team_interactions').select('*').eq('user_id', user.id).eq('league_id', leagueId);
            if (data) {
                setUserInteractions(data.map(i => ({
                    id: i.id, teamId: i.team_id, leagueId: i.league_id, interactionType: i.interaction_type
                })));
            }
        } catch (e) {
            console.warn('LeagueContext: Error loading user interactions', e);
        }
    }, [user]);

    const loadSupportCounts = useCallback(async (leagueId: string) => {
        try {
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
        } catch (e) {
            console.warn('LeagueContext: Error loading support counts', e);
        }
    }, []);

    // ── Load league data (teams, matches, brackets) ────────────
    // Use refs to avoid stale closure issues and prevent needless dependency array changes
    const loadUserInteractionsRef = useRef(loadUserInteractions);
    const loadSupportCountsRef = useRef(loadSupportCounts);
    useEffect(() => { loadUserInteractionsRef.current = loadUserInteractions; }, [loadUserInteractions]);
    useEffect(() => { loadSupportCountsRef.current = loadSupportCounts; }, [loadSupportCounts]);

    const loadLeagueData = useCallback(async (leagueId: string, background = false) => {
        if (!leagueId) return;
        
        // Prevent simultaneous duplicate loads
        if (loadingRef.current === leagueId) return;
        loadingRef.current = leagueId;

        console.log('LeagueContext: High-speed sync triggered...', leagueId);
        
        loadUserInteractionsRef.current(leagueId);
        loadSupportCountsRef.current(leagueId);

        // Try cache for instant mount
        const recovered = tryRecoverFromCache(leagueId);
        const hasData = (rawTeams.length > 0 && rawMatches.length > 0) || recovered;
        
        if (!background && !hasData) setDataLoading(true);

        try {
            // PHASE 1: CORE DATA (Essential per-frame metadata)
            const [teamsRes, matchesRes, bracketsRes, adsRes] = await Promise.all([
                // Metadata ONLY for teams (No players here, very fast)
                supabase.from('teams')
                    .select('*')
                    .eq('league_id', leagueId)
                    .order('name', { ascending: true }),
                // Core matches (Last 100 to avoid giant JSON)
                supabase.from('matches')
                    .select('*, match_events(*)')
                    .eq('league_id', leagueId)
                    .order('updated_at', { ascending: false })
                    .limit(100),
                supabase.from('brackets').select('*').eq('league_id', leagueId),
                supabase.from('ads').select('*').eq('league_id', leagueId).order('display_order', { ascending: true })
            ]);

            if (teamsRes.data) {
                const mappedTeams = teamsRes.data.map(mapDBTeam);
                setRawTeams(mappedTeams);
                teamsRef.current = mappedTeams;
            }
            if (matchesRes.data) {
                setRawMatches(matchesRes.data.map(mapDBMatch));
            }
            if (bracketsRes.data) setBrackets(bracketsRes.data.map(mapDBBracket));
            if (adsRes.data) {
                setAds(adsRes.data.map((a: any) => ({
                    ...a, display_order: a.display_order || 0
                })));
            }

            // PHASE 2: LAZY LOADING HEAVY DATA (Background)
            const loadHeavyData = async () => {
                try {
                    const tIds = teamsRes.data?.map(t => t.id) || [];
                    if (tIds.length === 0) return;

                    const { data: playersData, error: pErr } = await supabase.from('players')
                        .select('id, name, number, position, team_id, is_captain, is_reserve, display_order')
                        .in('team_id', tIds);
                    
                    if (pErr) throw pErr;

                    if (playersData) {
                        setRawTeams(prev => prev.map(t => ({
                            ...t,
                            players: playersData.filter(p => p.team_id === t.id).map(mapDBPlayer)
                        })));
                    }

                    // If league has MORE than 100 matches, fetch the rest in background
                    if (matchesRes.data && matchesRes.data.length >= 100) {
                       const { data: moreMatches } = await supabase.from('matches')
                           .select('*, match_events(*)')
                           .eq('league_id', leagueId)
                           .order('updated_at', { ascending: false })
                           .range(100, 300);
                       if (moreMatches) {
                           setRawMatches(prev => {
                               const existingIds = new Set(prev.map(m => m.id));
                               const filtered = moreMatches.filter(m => !existingIds.has(m.id)).map(mapDBMatch);
                               return [...prev, ...filtered];
                           });
                       }
                    }
                } catch (e) {
                    console.warn('LeagueContext: Lazy load suppressed/failed:', e);
                }
            };

            loadHeavyData();

        } catch (err) {
            console.error('LeagueContext: Performance load failed:', err);
        } finally {
            setLoading(false);
            setDataLoading(false);
            loadingRef.current = null;
        }
    }, [rawTeams.length, rawMatches.length, tryRecoverFromCache]);

    const loadTeamPhotos = useCallback(async (teamId: string) => {
        if (!teamId) return;
        try {
            const { data } = await supabase.from('players').select('id, photo').eq('team_id', teamId).not('photo', 'eq', '');
            if (!data || data.length === 0) return;
            const photoMap = new Map(data.map(p => [p.id, p.photo]));
            setRawTeams(prev => prev.map(t => {
                if (t.id === teamId) {
                    return { ...t, players: t.players.map(p => ({ ...p, photo: photoMap.get(p.id) || p.photo })) };
                }
                return t;
            }));
        } catch (err) { console.error('Error loading team photos:', err); }
    }, []);

    useEffect(() => {
        if (!league) {
            setRawTeams([]); setRawMatches([]); setBrackets([]); setUserInteractions([]); setSupportCounts({});
            return;
        }

        loadLeagueData(league.id);
        localStorage.setItem('selectedLeagueId', league.id);

        // ─── CENTRALIZED REALTIME (GOLDEN RULE: ZERO REFETCH) ───────
        const channel = supabase.channel(`league-central-${league.id}`);

        // 1. Tables with league_id filter (efficient)
        channel.on('postgres_changes', { 
            event: '*', 
            schema: 'public', 
            filter: `league_id=eq.${league.id}` 
        }, payload => {
            const { table, eventType, new: newRow, old: oldRow } = payload;
            const row = (newRow || oldRow) as any;

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

        channel.subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [league?.id]);

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
        try {
            let activeUser = user;
            
            // Reforço: se o estado do hook estiver vazio, tenta pegar diretamente do Supabase
            if (!activeUser) {
                const { data: { user: supabaseUser } } = await supabase.auth.getUser();
                activeUser = supabaseUser;
            }

            if (!activeUser) {
                alert('Você precisa estar logado para criar uma liga.');
                return { error: 'Usuário não autenticado' };
            }

            const slug = generateSlug(data.name);
            const { data: existing } = await supabase.from('leagues').select('id').eq('slug', slug).single();
            if (existing) return { error: 'Uma liga com este nome já existe.' };

            const { data: row, error } = await supabase.from('leagues').insert({
                user_id: activeUser.id, name: data.name, logo: data.logo, max_teams: data.maxTeams,
                points_for_win: data.pointsForWin, points_for_draw: data.pointsForDraw,
                points_for_loss: data.pointsForLoss, default_half_length: data.defaultHalfLength,
                players_per_team: data.playersPerTeam, reserve_limit_per_team: data.reserveLimitPerTeam,
                substitutions_limit: data.substitutionsLimit,
                allow_substitution_return: data.allowSubstitutionReturn ?? true,
                has_overtime: data.hasOvertime ?? true,
                sport_type: data.sportType,
                slug
            }).select().single();

            if (error) {
                console.error('Error creating league:', error);
                
                // Trata erro específico de coluna inexistente (caso usuário não tenha rodado o SQL)
                if (error.code === '42703') {
                    alert('Erro de Banco de Dados: A coluna "sport_type" não foi encontrada. \n\nPOR FAVOR, EXECUTE O SCRIPT SQL (add_sport_to_leagues.sql) NO SEU DASHBOARD DO SUPABASE.');
                } else {
                    alert('Erro ao criar liga: ' + error.message);
                }
                
                return { error: error.message };
            }

            if (row) {
                const lg: League = mapDBLeague(row);
                setLeagues(prev => [...prev, lg]);
                setLeague(lg);
                return { error: null };
            }
            return { error: 'Erro desconhecido ao cadastrar liga.' };
        } catch (err: any) {
            console.error('Crash in createLeague:', err);
            alert('Erro crítico ao criar liga: ' + (err.message || 'Erro desconhecido'));
            return { error: err.message };
        }
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
            sport_type: data.sportType,
            address: data.address,
            lat: data.lat,
            lng: data.lng
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
            // Safety: Set loading immediately so components that rely on the new league
            // don't try to render with empty teams/matches data before the loader starts.
            setLoading(true);
            setDataLoading(true);

            // Clear stale data immediately so the UI doesn't flash old league data.
            setRawTeams([]);
            setRawMatches([]);
            setBrackets([]);
            setIsPublicView(false);
            setLeague(found);
            localStorage.setItem('selectedLeagueId', id);
        }
    };

    // ── Team CRUD ──────────────────────────────────────────────
    // ── Team CRUD ──────────────────────────────────────────────
    const addTeam = async (team: { name: string; logo: string; primary_color?: string; secondary_color?: string }) => {
        if (!league) return { error: 'Nenhuma liga selecionada' };
        const { data, error } = await supabase.from('teams').insert({ 
            league_id: league.id, 
            name: team.name, 
            logo: team.logo,
            primary_color: team.primary_color,
            secondary_color: team.secondary_color 
        }).select().single();
        if (error) return { error: error.message };
        if (data) {
            setRawTeams(prev => [...prev, mapDBTeam(data)]);
        }
        return { error: null };
    };

    const updateTeam = async (teamId: string, data: Partial<{ name: string; logo: string; primary_color: string; secondary_color: string }>) => {
        console.log('[LeagueContext] Iniciando updateTeam:', { teamId, updateKeys: Object.keys(data) });
        
        try {
            // Limpa campos vazios ou nulos que não devem ser enviados
            const updatePayload: any = {};
            if (data.name) updatePayload.name = data.name;
            if (data.logo) updatePayload.logo = data.logo;
            if (data.primary_color) updatePayload.primary_color = data.primary_color;
            if (data.secondary_color) updatePayload.secondary_color = data.secondary_color;

            const { data: updatedData, error } = await supabase
                .from('teams')
                .update(updatePayload)
                .eq('id', teamId)
                .select()
                .single();
            
            if (error) {
                console.error('[LeagueContext] Erro fatal no Supabase updateTeam:', error);
                return { error: `Erro no servidor: ${error.message} (Código: ${error.code})` };
            }

            if (!updatedData) {
                console.error('[LeagueContext] Update concluído mas nenhum dado retornado para ID:', teamId);
                return { error: 'O time não foi encontrado para atualização.' };
            }

            console.log('[LeagueContext] Update bem-sucedido:', updatedData.id);

            // Sincroniza estado local com o retorno real do banco, preservando os jogadores
            setRawTeams(prev => prev.map(t => {
                if (t.id === teamId) {
                    const mapped = mapDBTeam(updatedData);
                    return { ...mapped, players: t.players }; // Preserva os jogadores do estado atual
                }
                return t;
            }));
            
            return { error: null };
        } catch (err: any) {
            console.error('[LeagueContext] Exceção inesperada em updateTeam:', err);
            return { error: 'Ocorreu um erro inesperado ao salvar. Verifique o tamanho da imagem.' };
        }
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
        const isHome = String(event.teamId) === String(m.homeTeamId);

        if (event.type === 'goal' || event.type === 'penalty_goal') {
            if (isHome) newHomeScore++; else newAwayScore++;
        } else if (event.type === 'own_goal') {
            if (isHome) newAwayScore++; else newHomeScore++;
        } else if (event.type === 'points_1') {
            if (isHome) newHomeScore += 1; else newAwayScore += 1;
        } else if (event.type === 'points_2') {
            if (isHome) newHomeScore += 2; else newAwayScore += 2;
        } else if (event.type === 'points_3') {
            if (isHome) newHomeScore += 3; else newAwayScore += 3;
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
        const isScoreChange = ['goal', 'penalty_goal', 'own_goal', 'points_1', 'points_2', 'points_3'].includes(event.type);
        
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

            const isScoreChange = event && ['goal', 'penalty_goal', 'own_goal', 'points_1', 'points_2', 'points_3'].includes(event.type);
            if (event && isScoreChange) {
                const isHome = String(event.teamId) === String(m.homeTeamId);
                const isOwnGoal = event.type === 'own_goal';
                
                let pointsToRemove = 0;
                if (['goal', 'penalty_goal', 'own_goal'].includes(event.type)) pointsToRemove = 1;
                else if (event.type === 'points_1') pointsToRemove = 1;
                else if (event.type === 'points_2') pointsToRemove = 2;
                else if (event.type === 'points_3') pointsToRemove = 3;

                if (isOwnGoal) {
                    if (isHome) newAwayScore = Math.max(0, newAwayScore - pointsToRemove);
                    else newHomeScore = Math.max(0, newHomeScore - pointsToRemove);
                } else {
                    if (isHome) newHomeScore = Math.max(0, newHomeScore - pointsToRemove);
                    else newAwayScore = Math.max(0, newAwayScore - pointsToRemove);
                }
            }

            return {
                ...m,
                events: m.events.filter(e => e.id !== eventId),
                homeScore: newHomeScore,
                awayScore: newAwayScore,
                updatedAt: new Date().toISOString()
            };
        }));

        const isScoreChange = event && ['goal', 'penalty_goal', 'own_goal', 'points_1', 'points_2', 'points_3'].includes(event.type);
        if (isScoreChange) {
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

    const loadPlayerPhotos = useCallback(async (playerIds: string[]) => {
        if (!playerIds || playerIds.length === 0) return;
        try {
            const { data } = await supabase.from('players').select('id, photo').in('id', playerIds).not('photo', 'eq', '');
            if (!data || data.length === 0) return;
            const photoMap = new Map(data.map(p => [p.id, p.photo]));
            setRawTeams(prev => prev.map(t => ({
                ...t,
                players: t.players.map(p => ({ ...p, photo: photoMap.get(p.id) || p.photo }))
            })));
        } catch (err) { console.error('Error loading specific player photos:', err); }
    }, []);

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
            showAuthModal, setShowAuthModal, loadTeamPhotos, loadPlayerPhotos,
            supportCounts, notifications, clearNotification, leagueBasePath,
            ads, addAd, updateAd, deleteAd, reorderAds, globalAdTick,
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
