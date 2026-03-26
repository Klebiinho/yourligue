import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLeague, type MatchEvent, type Player, type Match, type Team } from '../context/LeagueContext';
import { Clock, StopCircle, Award, Settings2, XCircle, Target, Trash2, Crown, Pause, Play, AlertCircle, History, ArrowLeft, ArrowLeftRight, Check, Video, CheckCircle2, Lock, Edit3, Unlink, Eye, Loader2 } from 'lucide-react';
import TeamLogo from '../components/TeamLogo';
import AdBanner from '../components/AdBanner';
import { lazy, Suspense } from 'react';
const VideoGenerator = lazy(() => import('../components/VideoGenerator').then(m => ({ default: m.VideoGenerator })));

const MatchControl = () => {
    const { matchId } = useParams<{ matchId: string }>();
    const navigate = useNavigate();
    const { 
        league, matches, teams, endMatch, addEvent, removeEvent, 
        updateMatch, isPublicView, isAdmin, isPlayerOnPitch,
        currentYtLiveStream, isYtAuthenticated, recoverStreamDetails,
        ytLogin, setYtLivePrivacy, startMatch, pauseMatch, 
        loading: leagueLoading, dataLoading
    } = useLeague();

    const match = matches.find((m: Match) => m.id === matchId);
    const homeTeam = teams.find((t: Team) => t.id === match?.homeTeamId);
    const awayTeam = teams.find((t: Team) => t.id === match?.awayTeamId);

    const [localSeconds, setLocalSeconds] = useState(match?.timer || 0);
    const [timerRunning, setTimerRunning] = useState(match?.status === 'live');
    const [halfLength, setHalfLength] = useState(match?.halfLength || (league?.sportType === 'basketball' ? 10 : 45));
    const [extraTime, setExtraTime] = useState(match?.extraTime || 0);
    const [period, setPeriod] = useState(match?.period || (league?.sportType === 'basketball' ? '1º Quarto' : '1º Tempo'));
    const [submittingPlayer, setSubmittingPlayer] = useState<{ teamId: string, playerOutId: string } | null>(null);
    const [showOverlay, setShowOverlay] = useState(true);
    const [penaltyPickers, setPenaltyPickers] = useState<{ [teamId: string]: string[] }>(() => {
        if (!matchId) return {};
        const saved = localStorage.getItem(`yl_pickers_${matchId}`);
        return saved ? JSON.parse(saved) : {};
    });
    const [confirmedPenaltyShooters, setConfirmedPenaltyShooters] = useState<{ home: string[], away: string[] }>(() => {
        if (!matchId) return { home: [], away: [] };
        const saved = localStorage.getItem(`yl_shooters_${matchId}`);
        return saved ? JSON.parse(saved) : { home: [], away: [] };
    });
    const [showYtSetup, setShowYtSetup] = useState(false);
    const [showFinishModal, setShowFinishModal] = useState(false);
    const [finishedMatchVideoUrl, setFinishedMatchVideoUrl] = useState(match?.youtubeLiveId || '');
    const [isEditingYtUrl, setIsEditingYtUrl] = useState(false);
    const [editingYtUrl, setEditingYtUrl] = useState(match?.youtubeLiveId || '');

    const [highlightData, setHighlightData] = useState<{
        player: Player;
        team: Team;
        sportType: string;
        eventType: 'MVP' | 'Gol' | 'Ponto' | 'Assist' | 'Rebote' | 'Falta';
        stats: { [key: string]: number };
        description?: string;
    } | null>(null);

    const handleGenerateHighlight = (playerId: string, eventType: 'MVP' | 'Gol' | 'Ponto' | 'Assist' | 'Rebote' | 'Falta', e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        const player = [...homeTeam!.players, ...awayTeam!.players].find(p => p.id === playerId);
        if (!player) return;
        
        const team = homeTeam!.players.some(p => p.id === playerId) ? homeTeam : awayTeam;
        if (!team) return;

        const playerEvents = match!.events.filter(ev => ev.playerId === playerId);
        const pt1 = playerEvents.filter(ev => ev.type === 'points_1').length;
        const pt2 = playerEvents.filter(ev => ev.type === 'points_2').length;
        const pt3 = playerEvents.filter(ev => ev.type === 'points_3').length;
        const totalPoints = (pt1 * 1) + (pt2 * 2) + (pt3 * 3);

        const stats: { [key: string]: number } = {};
        
        if (league?.sportType === 'basketball') {
            stats['PTS'] = totalPoints;
            stats['REB'] = playerEvents.filter(ev => ev.type === 'rebound').length;
            stats['AST'] = playerEvents.filter(ev => ev.type === 'assist').length;
        } else {
            stats['Gols'] = playerEvents.filter(ev => ['goal', 'penalty_goal', 'penalty_shootout_goal'].includes(ev.type)).length;
            stats['AST'] = playerEvents.filter(ev => ev.type === 'assist').length;
        }

        setHighlightData({
            player,
            team,
            sportType: league?.sportType || 'football',
            eventType,
            stats,
            description: '',
        });
    };

    const suggestedMVPId = useMemo(() => {
        if (!match || !homeTeam || !awayTeam) return null;
        const playerScores: { [playerId: string]: number } = {};
        const allPlayers = [...homeTeam.players, ...awayTeam.players];

        allPlayers.forEach(player => {
            const playerEvents = match.events.filter(ev => ev.playerId === player.id);
            let score = 0;
            if (league?.sportType === 'basketball') {
                const pt1 = playerEvents.filter(ev => ev.type === 'points_1').length;
                const pt2 = playerEvents.filter(ev => ev.type === 'points_2').length;
                const pt3 = playerEvents.filter(ev => ev.type === 'points_3').length;
                score = (pt1 * 1) + (pt2 * 2) + (pt3 * 3) + playerEvents.filter(ev => ev.type === 'assist').length;
            } else {
                const goals = playerEvents.filter(ev => ['goal', 'penalty_goal', 'penalty_shootout_goal'].includes(ev.type)).length;
                const assists = playerEvents.filter(ev => ev.type === 'assist').length;
                score = (goals * 1.5) + assists; // Weight goals slightly more for MVP tiebreaks
            }
            if (score > 0) playerScores[player.id] = score;
        });

        const sorted = Object.entries(playerScores).sort((a, b) => b[1] - a[1]);
        return sorted.length > 0 ? sorted[0][0] : null;
    }, [match?.id, match?.events, league?.sportType, homeTeam?.id, awayTeam?.id]);

    useEffect(() => {
        if (currentYtLiveStream) {
            setShowYtSetup(true);
        }
    }, [currentYtLiveStream]);

    useEffect(() => {
        setShowOverlay(true);
    }, [period]);

    // Persist shooters and pickers across refreshes
    useEffect(() => {
        if (!matchId) return;
        localStorage.setItem(`yl_pickers_${matchId}`, JSON.stringify(penaltyPickers));
    }, [penaltyPickers, matchId]);

    useEffect(() => {
        if (!matchId) return;
        if (confirmedPenaltyShooters.home.length || confirmedPenaltyShooters.away.length) {
            localStorage.setItem(`yl_shooters_${matchId}`, JSON.stringify(confirmedPenaltyShooters));
        }
    }, [confirmedPenaltyShooters, matchId]);

    // Sincronizar estados locais com dados do banco (Realtime)
    useEffect(() => {
        if (match) {
            setHalfLength(match.halfLength || (league?.sportType === 'basketball' ? 10 : 45));
            setExtraTime(match.extraTime || 0);
            setPeriod(match.period || (league?.sportType === 'basketball' ? '1º Quarto' : '1º Tempo'));
        }
    }, [match?.halfLength, match?.extraTime, match?.period]);


    // Optimized player status lookup table to avoid O(N*M) filtering in render
    const playerStatusMap = useMemo(() => {
        const stats: Record<string, { isRedCarded: boolean, yellowCards: number, hasDirectRed: boolean }> = {};
        if (!match) return stats;

        match.events.forEach((e: MatchEvent) => {
            if (!e.playerId) return;
            if (!stats[e.playerId]) stats[e.playerId] = { isRedCarded: false, yellowCards: 0, hasDirectRed: false };
            
            if (e.type === 'yellow_card') {
                stats[e.playerId].yellowCards++;
                if (stats[e.playerId].yellowCards >= 2) stats[e.playerId].isRedCarded = true;
            } else if (e.type === 'red_card') {
                stats[e.playerId].hasDirectRed = true;
                stats[e.playerId].isRedCarded = true;
            }
        });
        return stats;
    }, [match?.events]);

    const calculateShootoutWinner = () => {
        if (!match || period !== 'Pênaltis') return null;
        const shootoutEvents = match.events.filter((e: MatchEvent) => e.type.startsWith('penalty_shootout_'));
        const homeEvents = shootoutEvents.filter(e => e.teamId === match.homeTeamId);
        const awayEvents = shootoutEvents.filter(e => e.teamId === match.awayTeamId);
        const homeGoals = homeEvents.filter(e => e.type === 'penalty_shootout_goal').length;
        const awayGoals = awayEvents.filter(e => e.type === 'penalty_shootout_goal').length;
        const homeTaken = homeEvents.length;
        const awayTaken = awayEvents.length;

        if (homeTaken <= 5 && awayTaken <= 5) {
            const homeRem = 5 - homeTaken;
            const awayRem = 5 - awayTaken;
            if (homeGoals > awayGoals + awayRem) return match.homeTeamId;
            if (awayGoals > homeGoals + homeRem) return match.awayTeamId;
            if (homeTaken === 5 && awayTaken === 5 && homeGoals !== awayGoals) {
                return homeGoals > awayGoals ? match.homeTeamId : match.awayTeamId;
            }
        } else if (homeTaken === awayTaken && homeGoals !== awayGoals) {
            return homeGoals > awayGoals ? match.homeTeamId : match.awayTeamId;
        }
        return null;
    };
    const shootoutWinnerId = useMemo(() => calculateShootoutWinner(), [match?.events, period]);

    const getPlayerStatus = (playerId: string) => {
        return playerStatusMap[playerId] || { isRedCarded: false, yellowCards: 0, hasDirectRed: false };
    };

    const handleUndoLastCard = (playerId: string) => {
        const playerEvents = match?.events.filter((e: MatchEvent) => e.playerId === playerId) || [];
        const lastCardEvent = [...playerEvents].reverse().find((e: MatchEvent) => e.type === 'yellow_card' || e.type === 'red_card');
        if (lastCardEvent && matchId) removeEvent(matchId, lastCardEvent.id);
    };

    const handleSaveTimeSettings = () => {
        if (matchId) updateMatch(matchId, { halfLength, extraTime, period });
    };

    const handleSaveYtUrl = () => {
        if (matchId) {
            // Helper to extract ID from potential URL
            const extractId = (url: string) => {
                const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                const match = url.match(regExp);
                return (match && match[2].length === 11) ? match[2] : url;
            };
            const ytId = extractId(editingYtUrl);
            updateMatch(matchId, { youtubeLiveId: ytId });
            setIsEditingYtUrl(false);
        }
    };

    const handleUnlinkYt = () => {
        if (matchId && window.confirm('Deseja remover o vídeo desta partida? (O vídeo permanecerá no YouTube)')) {
            updateMatch(matchId, { youtubeLiveId: undefined });
        }
    };

    const handleSetPrivacy = async (privacy: 'public' | 'private' | 'unlisted') => {
        if (!match?.youtubeLiveId) return;
        try {
            await setYtLivePrivacy(match.youtubeLiveId, privacy);
            alert(`Privacidade alterada para: ${privacy}`);
        } catch (err) {
            alert('Erro ao alterar privacidade. Verifique se sua conta do YouTube está conectada.');
        }
    };

    // ── SMART TIMER CALCULATION ──
    useEffect(() => {
        let interval: number;
        
        const updateTimerDisplay = () => {
            if (!match) return;

            if (match.status === 'live') {
                const lastUpdateStr = match.updatedAt || new Date().toISOString();
                const lastUpdate = new Date(lastUpdateStr).getTime();
                const now = Date.now();
                const diffInSeconds = Math.max(0, Math.floor((now - lastUpdate) / 1000));
                const calculatedSeconds = (match.timer || 0) + diffInSeconds;

                setLocalSeconds(calculatedSeconds);
                setTimerRunning(true);
            } else {
                setLocalSeconds(match.timer || 0);
                setTimerRunning(false);
            }
        };

        updateTimerDisplay();
        interval = window.setInterval(updateTimerDisplay, 1000);
        return () => clearInterval(interval);
    }, [match?.id, match?.status, match?.timer, match?.updatedAt]);

    const handleOpenYtSetup = async () => {
        if (!currentYtLiveStream && match?.youtubeLiveId && isYtAuthenticated) {
            // Try to recover stream key/rtmp if missing
            await recoverStreamDetails(match.youtubeLiveId);
        }
        setShowYtSetup(true);
    };

    const handleToggleTimer = async () => {
        if (!matchId || !match) return;
        
        if (timerRunning) {
            await pauseMatch(matchId, localSeconds);
        } else {
            let shouldStartLive = false;
            
            // Re-verify if we should ask for live
            if (localSeconds === 0 && !match.youtubeLiveId) {
                if (isYtAuthenticated) {
                    shouldStartLive = window.confirm("Deseja iniciar uma Transmissão Ao Vivo no YouTube para esta partida?\n\nIsso criará automaticamente uma live no seu canal e pegará as chaves para o seu app de stream.");
                } else {
                    if (window.confirm("Você não está conectado ao YouTube. Deseja conectar agora para transmitir esta partida ao vivo?")) {
                        await ytLogin();
                        // After login, we don't start immediately to let them confirm again or simply start without live
                        return;
                    }
                }
            }
            
            try {
                await startMatch(matchId, localSeconds, shouldStartLive);
            } catch (err: any) {
                alert("Erro ao iniciar partida: " + (err.message || "Tente novamente"));
            }
        }
    };

    if ((leagueLoading || dataLoading) && (!match || !homeTeam || !awayTeam)) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500 gap-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="font-outfit font-black uppercase tracking-widest text-xs">Sincronizando Partida...</p>
            </div>
        );
    }

    if (!match || !homeTeam || !awayTeam) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500 gap-4 opacity-75">
            <AlertCircle size={48} strokeWidth={1} />
            <p className="font-outfit font-black uppercase tracking-widest text-xs">Partida não encontrada</p>
            <button onClick={() => navigate('/')} className="text-primary font-bold hover:underline">Voltar ao Início</button>
        </div>
    );

    const formatTime = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    const currentMinute = Math.floor(localSeconds / 60) + 1;

    const handleEndMatch = () => {
        if (!matchId || !match) return;

        const isBasket = league?.sportType === 'basketball';

        if (period === '1º Tempo' || (isBasket && period === '1º Quarto')) {
            const nextP = isBasket ? '2º Quarto' : 'Intervalo';
            if (window.confirm(`Encerrar ${period} e seguir para ${nextP}?`)) {
                setTimerRunning(false);
                handlePeriodChange(isBasket ? 'Intervalo' : 'Intervalo'); // Both use 'Intervalo' or specialized intervals
                // Actually basketball has intervals between all quarters
                handlePeriodChange('Intervalo');
            }
            return;
        }

        if (period === '2º Quarto' || period === '3º Quarto') {
             if (window.confirm(`Encerrar ${period} e seguir para Intervalo?`)) {
                setTimerRunning(false);
                handlePeriodChange('Intervalo');
            }
            return;
        }

        if (period.includes('Intervalo')) {
            let next = '2º Tempo';
            if (isBasket) {
                const prev = match.period || '';
                if (prev === '1º Quarto') next = '2º Quarto';
                else if (prev === '2º Quarto') next = '3º Quarto';
                else if (prev === '3º Quarto') next = '4º Quarto';
                else if (prev === '4º Quarto') next = 'Prorrogação';
            } else {
                if (period === 'Intervalo (OT)') next = '1º Prorrog.';
                if (period === 'Intervalo (OT2)') next = '2º Prorrog.';
            }
            
            if (window.confirm(`Encerrar intervalo e iniciar o ${next}?`)) {
                let startTime = 0;
                if (!isBasket) {
                    if (next === '2º Tempo') startTime = (league?.defaultHalfLength || 45) * 60;
                    if (next === '1º Prorrog.') startTime = ((league?.defaultHalfLength || 45) * 2) * 60;
                    if (next === '2º Prorrog.') startTime = ((league?.defaultHalfLength || 45) * 2 + (league?.overtimeHalfLength || 15)) * 60;
                } else {
                    // Basketball logic: timer continues or additive?
                    // FIBA: 10 min each. Timer in this app seems to be cumulative.
                    const qLen = league?.defaultHalfLength || 10;
                    if (next === '2º Quarto') startTime = qLen * 60;
                    if (next === '3º Quarto') startTime = (qLen * 2) * 60;
                    if (next === '4º Quarto') startTime = (qLen * 3) * 60;
                    if (next === 'Prorrogação') startTime = (qLen * 4) * 60;
                }

                handlePeriodChange(next);
                setTimerRunning(true);
                startMatch(matchId, startTime);
            }
            return;
        }

        if (period === '2º Tempo' || period === '2º Prorrog.' || (isBasket && period === '4º Quarto') || (isBasket && period === 'Prorrogação')) {
            if (match.homeScore === match.awayScore) {
                if ((period === '2º Tempo' || (isBasket && period === '4º Quarto')) && league?.hasOvertime) {
                    if (window.confirm('A partida terminou empatada. Deseja iniciar a Prorrogação?')) {
                        setTimerRunning(false);
                        handlePeriodChange(isBasket ? 'Intervalo' : 'Intervalo (OT)');
                        return;
                    }
                } else if (!isBasket && window.confirm('O empate persiste. Deseja iniciar a disputa de Pênaltis?')) {
                    setTimerRunning(false);
                    handlePeriodChange('Sel. Batedores');
                    return;
                }
            }
        }

        if (period === '1º Prorrog.') {
            if (window.confirm('Encerrar 1º tempo da Prorrogação e iniciar o Intervalo?')) {
                setTimerRunning(false);
                handlePeriodChange('Intervalo (OT2)');
            }
            return;
        }

        if (period === 'Sel. Batedores') {
            if (confirmShooters()) {
                handlePeriodChange('Pênaltis');
            }
            return;
        }

        setShowFinishModal(true);
    };

    const confirmFinalFinish = async () => {
        if (!matchId) return;
        
        setTimerRunning(false);
        
        let videoId = finishedMatchVideoUrl;
        try {
            if (videoId.includes('youtube.com') || videoId.includes('youtu.be')) {
                const url = new URL(videoId);
                videoId = url.searchParams.get('v') || url.pathname.split('/').pop() || videoId;
            }
        } catch { }

        await endMatch(matchId, localSeconds);
        if (videoId) {
            await updateMatch(matchId, { youtubeLiveId: videoId });
        }
        
        setShowFinishModal(false);
        navigate('/matches');
    };

    const handleGol = (teamId: string, playerId: string) => { 
        if (!matchId || !match || (period.includes('Intervalo') && period !== 'Pênaltis')) return;
        
        // Em pênaltis, permitimos salvar mesmo com status 'scheduled' (pause) pois o relógio principal para mas a disputa continua
        const canSave = match.status === 'live' || period === 'Pênaltis';
        if (!canSave) return;

        if (period === 'Pênaltis') {
            addEvent(matchId, { type: 'penalty_shootout_goal', teamId, playerId, minute: 121 });
        } else {
            addEvent(matchId, { type: 'goal', teamId, playerId, minute: currentMinute });
        }
    };
    const handleMiss = (teamId: string, playerId: string) => {
        if (matchId && (match?.status === 'live' || period === 'Pênaltis') && period === 'Pênaltis') {
            addEvent(matchId, { type: 'penalty_shootout_miss', teamId, playerId, minute: 121 });
        }
    };
    const handleAssist = (teamId: string, playerId: string) => { if (matchId && match?.status === 'live' && !period.includes('Intervalo') && period !== 'Pênaltis') addEvent(matchId, { type: 'assist', teamId, playerId, minute: currentMinute }); };
    const handleGolContra = (teamId: string, playerId: string) => { if (matchId && match?.status === 'live' && !period.includes('Intervalo') && period !== 'Pênaltis') addEvent(matchId, { type: 'own_goal', teamId, playerId, minute: currentMinute }); };
    const handleCartao = (teamId: string, playerId: string, type: 'yellow_card' | 'red_card') => { if (matchId && match?.status === 'live' && !period.includes('Intervalo')) addEvent(matchId, { type, teamId, playerId, minute: currentMinute }); };
    
    // Basketball specific events
    const handlePoints = (teamId: string, playerId: string, points: 1 | 2 | 3) => {
        if (!matchId || match?.status !== 'live' || period.includes('Intervalo')) return;
        const type = points === 1 ? 'points_1' : points === 2 ? 'points_2' : 'points_3';
        addEvent(matchId, { type, teamId, playerId, minute: currentMinute });
    };

    const handleStat = (teamId: string, playerId: string, type: 'rebound' | 'block' | 'steal' | 'foul') => {
        if (!matchId || match?.status !== 'live' || period.includes('Intervalo')) return;
        addEvent(matchId, { type, teamId, playerId, minute: currentMinute });
    };
    const handlePeriodChange = async (newPeriod: string) => {
        if (!matchId || !match || !league) return;
        
        const isBasket = league.sportType === 'basketball';
        let newTimer = localSeconds;
        let newStatus = match.status;
        let newHalfLength = match.halfLength || league.defaultHalfLength;

        // Auto-set half length based on period type
        if (isBasket) {
            newHalfLength = newPeriod === 'Prorrogação' ? 5 : league.defaultHalfLength;
        } else {
            if (newPeriod === '1º Tempo' || newPeriod === '2º Tempo') {
                newHalfLength = league.defaultHalfLength;
            } else if (newPeriod.includes('Prorrog.')) {
                newHalfLength = league.overtimeHalfLength || 15;
            }
        }

        const regMin = league.defaultHalfLength;
        const otMin = league.overtimeHalfLength || (isBasket ? 5 : 15);

        // Real-time functional logic
        if (newPeriod.includes('Intervalo')) {
            newStatus = 'scheduled'; // Auto-pause
        } else if (isBasket) {
            if (newPeriod === '1º Quarto' && localSeconds > 30) { if(confirm('Zerar?')) newTimer = 0; }
            else if (newPeriod === '2º Quarto' && localSeconds < regMin * 60) newTimer = regMin * 60;
            else if (newPeriod === '3º Quarto' && localSeconds < regMin * 120) newTimer = regMin * 120;
            else if (newPeriod === '4º Quarto' && localSeconds < regMin * 180) newTimer = regMin * 180;
            else if (newPeriod === 'Prorrogação' && localSeconds < regMin * 240) newTimer = regMin * 240;
        } else {
            if (newPeriod === '1º Tempo' && localSeconds > 60) {
                if (window.confirm('Deseja zerar o cronômetro para o início do 1º tempo?')) {
                    newTimer = 0;
                }
            } else if (newPeriod === '2º Tempo' && localSeconds < regMin * 60) {
                newTimer = regMin * 60;
            } else if (newPeriod === '1º Prorrog.' && localSeconds < regMin * 120) {
                newTimer = regMin * 120;
            } else if (newPeriod === '2º Prorrog.' && localSeconds < (regMin * 120 + otMin * 60)) {
                newTimer = regMin * 120 + otMin * 60;
            } else if (newPeriod === 'Sel. Batedores' || newPeriod === 'Pênaltis') {
                newStatus = 'scheduled'; // Stop main clock
            }
        }

        setPeriod(newPeriod);
        setLocalSeconds(newTimer);
        setHalfLength(newHalfLength);
        await updateMatch(matchId, { period: newPeriod, status: newStatus, timer: newTimer, halfLength: newHalfLength });
    };

    const handleSubstitution = (teamId: string, playerInId: string, playerOutId: string) => {
        if (matchId && (match?.status === 'live' || period.includes('Intervalo'))) {
            const limit = league?.substitutionsLimit || 5;
            const teamSubstitutions = (match?.events || []).filter(e => e.type === 'substitution' && e.teamId === teamId).length;
            
            if (teamSubstitutions >= limit) {
                alert(`Limite de ${limit} substituições atingido para este time!`);
                return;
            }
            addEvent(matchId, { type: 'substitution', teamId, playerId: playerInId, playerOutId, minute: currentMinute });
            setSubmittingPlayer(null);
        }
    };

    const togglePenaltyShooter = (playerId: string, teamId: string) => {
        setPenaltyPickers(prev => {
            const current = prev[teamId] || [];
            if (current.includes(playerId)) {
                return { ...prev, [teamId]: current.filter(id => id !== playerId) };
            }
            return { ...prev, [teamId]: [...current, playerId] };
        });
    };

    const confirmShooters = () => {
        const homeList = penaltyPickers[homeTeam.id] || [];
        const awayList = penaltyPickers[awayTeam.id] || [];
        
        if (homeList.length === 0 || awayList.length === 0) {
            alert('Selecione batedores para AMBOS os times antes de confirmar!');
            return false;
        }
        setConfirmedPenaltyShooters({ home: homeList, away: awayList });
        return true;
    };



    return (
        <div className="animate-fade-in relative pb-10">
            {isPublicView && <AdBanner position="top" />}

            {isPublicView && period.includes('Intervalo') && (
                <AdBanner position="halftime" className="z-[60]" />
            )}

            {isPublicView && (period.includes('Intervalo') || match.status === 'scheduled') && showOverlay && (
                <AdBanner position="overlay" onClose={() => setShowOverlay(false)} />
            )}

            {/* YouTube Stream Setup Modal */}
            {!isPublicView && isAdmin && showYtSetup && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="glass-panel p-6 max-w-lg w-full border-primary/30 shadow-[0_0_50px_rgba(109,40,217,0.2)]">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-600/20 rounded-xl flex items-center justify-center text-red-500">
                                    <Video size={20} />
                                </div>
                                <div>
                                    <h3 className="text-white font-black uppercase text-sm tracking-widest leading-none">Configurar Transmissão</h3>
                                    <p className="text-slate-500 text-[0.65rem] font-bold uppercase tracking-wide mt-1">Ao vivo no YouTube</p>
                                </div>
                            </div>
                            <button onClick={() => setShowYtSetup(false)} className="text-slate-500 hover:text-white transition-colors">
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {currentYtLiveStream ? (
                                <>
                                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                        <label className="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest block mb-2">URL do Servidor (RTMP)</label>
                                        <div className="flex gap-2">
                                            <input 
                                                readOnly 
                                                value={currentYtLiveStream.rtmpUrl} 
                                                className="bg-black/40 border border-white/5 flex-1 px-3 py-2 rounded-lg text-xs font-mono text-slate-300" 
                                            />
                                            <button 
                                                onClick={() => { navigator.clipboard.writeText(currentYtLiveStream.rtmpUrl); alert('URL Copiada!'); }}
                                                className="bg-primary/20 text-primary p-2 rounded-lg hover:bg-primary/30 transition-all"
                                            >
                                                <Check size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                        <label className="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest block mb-2">Chave de Transmissão</label>
                                        <div className="flex gap-2">
                                            <input 
                                                readOnly 
                                                type="password"
                                                value={currentYtLiveStream.streamKey} 
                                                className="bg-black/40 border border-white/5 flex-1 px-3 py-2 rounded-lg text-xs font-mono text-slate-300" 
                                            />
                                            <button 
                                                onClick={() => { navigator.clipboard.writeText(currentYtLiveStream.streamKey); alert('Chave Copiada!'); }}
                                                className="bg-primary/20 text-primary p-2 rounded-lg hover:bg-primary/30 transition-all"
                                            >
                                                <Check size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : match?.youtubeLiveId ? (
                                <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                                    <p className="text-[0.65rem] text-slate-400 font-bold uppercase tracking-wide mb-3">YouTube detectado, mas detalhes pendentes...</p>
                                    <button 
                                        onClick={() => recoverStreamDetails(match.youtubeLiveId!)}
                                        className="bg-primary/20 text-primary px-4 py-2 rounded-lg text-[0.6rem] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                                    >
                                        Carregar Chaves do YouTube
                                    </button>
                                </div>
                            ) : (
                                <div className="p-4 bg-red-600/10 rounded-xl border border-red-600/20 text-center">
                                    <p className="text-[0.65rem] text-red-400 font-bold uppercase tracking-wide mb-3">Nenhuma Live ativa no YouTube</p>
                                    <button 
                                        onClick={async (e) => {
                                            const btn = e.currentTarget;
                                            if (!isYtAuthenticated) {
                                                alert("Por favor, conecte sua conta do YouTube primeiro.");
                                                return;
                                            }
                                            if (window.confirm("Deseja criar uma nova live para esta partida agora? Isso pode levar alguns segundos.")) {
                                                btn.disabled = true;
                                                btn.innerText = "Criando Live...";
                                                try {
                                                    await startMatch(match.id, localSeconds, true);
                                                } finally {
                                                    btn.disabled = false;
                                                    btn.innerHTML = "Iniciar Transmissão agora";
                                                }
                                            }
                                        }}
                                        className="bg-red-600/20 text-red-500 px-4 py-2 rounded-lg text-[0.6rem] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Video size={14} />
                                        Iniciar Transmissão agora
                                    </button>
                                </div>
                            )}

                            <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
                                <label className="text-[0.6rem] font-black text-primary uppercase tracking-widest block mb-2">Link do Placar (Overlay Widget)</label>
                                <div className="flex gap-2">
                                    <input 
                                        readOnly 
                                        value={`${window.location.origin}/match/${matchId}/overlay`} 
                                        className="bg-black/40 border border-primary/10 flex-1 px-3 py-2 rounded-lg text-[0.65rem] font-mono text-white" 
                                    />
                                    <button 
                                        onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/match/${matchId}/overlay`); alert('Link do Placar Copiado!'); }}
                                        className="bg-primary text-white p-2 rounded-lg hover:bg-primary-hover transition-all shadow-lg shadow-primary/20"
                                    >
                                        <Check size={16} />
                                    </button>
                                </div>
                                <p className="text-[0.55rem] text-primary/70 font-bold uppercase tracking-tight mt-2">
                                    Cole este link no "Web Widget" ou "Browser Source" do seu app de live.
                                </p>
                            </div>

                            <p className="text-[0.65rem] text-slate-500 italic text-center px-4">
                                Insira esses dados no seu aplicativo de transmissão (OBS, PRISM, Larix Broadcaster) para começar a enviar o vídeo.
                            </p>
                            
                            <button 
                                onClick={() => setShowYtSetup(false)}
                                className="w-full py-3 bg-white/5 border border-white/10 rounded-xl font-black text-[0.65rem] uppercase tracking-[0.2em] text-white hover:bg-white/10 transition-all mt-2"
                            >
                                Entendi, fechar painel
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Back Button */}
            <button onClick={() => navigate('/matches')} className="flex items-center gap-2 text-slate-500 hover:text-white text-xs font-black uppercase tracking-widest mb-6 transition-colors group">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Voltar às Partidas
            </button>

            {/* ── SCOREBOARD ─────────────────────────────────────────── */}
            <div className="glass-panel sticky top-2 z-40 p-4 sm:p-6 md:p-8 mb-6 md:mb-8 shadow-2xl overflow-hidden">
                {/* Scoreboard inner content */}
                <div className="flex items-center gap-3 sm:gap-6 relative z-10">
                    {/* Home Team */}
                    <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                        <TeamLogo src={homeTeam.logo} size={44} />
                        <h2 className="text-center font-black text-white font-outfit uppercase text-[0.65rem] sm:text-xs tracking-wide truncate w-full leading-tight">{homeTeam.name}</h2>
                        <span className="text-[0.5rem] font-black text-primary tracking-widest uppercase">Casa</span>
                    </div>

                    {/* Score */}
                    <div className="flex flex-col items-center gap-2 flex-none px-2 sm:px-4">
                        <div className="flex items-center gap-2 sm:gap-4 font-outfit font-black text-3xl sm:text-5xl md:text-6xl">
                            {period === 'Pênaltis' ? (
                                <>
                                    <div className="flex flex-col items-center">
                                        <span className="text-primary/50 text-[0.45em] leading-none mb-1">{match.homeScore}</span>
                                        <span className="text-primary drop-shadow-[0_0_20px_rgba(109,40,217,0.5)]">({match.events.filter(e => e.type === 'penalty_shootout_goal' && e.teamId === match.homeTeamId).length})</span>
                                    </div>
                                    <span className="text-slate-700 text-xl sm:text-3xl">–</span>
                                    <div className="flex flex-col items-center">
                                        <span className="text-accent/50 text-[0.45em] leading-none mb-1">{match.awayScore}</span>
                                        <span className="text-accent drop-shadow-[0_0_20px_rgba(16,185,129,0.4)]">({match.events.filter(e => e.type === 'penalty_shootout_goal' && e.teamId === match.awayTeamId).length})</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <span className="text-primary drop-shadow-[0_0_20px_rgba(109,40,217,0.5)]">{match.homeScore}</span>
                                    <span className="text-slate-700 text-xl sm:text-3xl">–</span>
                                    <span className="text-accent drop-shadow-[0_0_20px_rgba(16,185,129,0.4)]">{match.awayScore}</span>
                                </>
                            )}
                        </div>
                        {isAdmin && (
                            <button 
                                onClick={handleOpenYtSetup}
                                className="flex items-center gap-2 px-3 py-1.5 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg border border-primary/20 transition-all active:scale-95 mt-1"
                            >
                                <Settings2 size={12} strokeWidth={3} />
                                <span className="text-[0.55rem] font-black uppercase tracking-[0.1em]">Configurar Live / Widget</span>
                            </button>
                        )}
                        <div className="bg-black/50 px-4 py-1.5 rounded-xl flex items-center gap-2 border border-white/[0.05] shadow-inner">
                            <div className={`w-1.5 h-1.5 rounded-full ${timerRunning ? 'bg-danger animate-pulse shadow-[0_0_8px_rgba(239,68,68,1)]' : 'bg-slate-700'}`} />
                            <span className="font-mono text-base sm:text-xl font-black text-white tracking-[0.1em]">
                                {period === 'Pênaltis' || period === 'Sel. Batedores' ? 'PÊNALTIS' : formatTime(localSeconds)}
                            </span>
                            {period !== 'Pênaltis' && period !== 'Sel. Batedores' && (match.extraTime || 0) > 0 && (
                                <span className="text-danger font-black text-xs sm:text-sm animate-pulse ml-1">+{match.extraTime}</span>
                            )}
                        </div>
                        {period === 'Pênaltis' && (
                            <div className="flex gap-4 mt-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                                <div className="flex gap-1.5">
                                    {match.events.filter(e => e.teamId === match.homeTeamId && (e.type === 'penalty_shootout_goal' || e.type === 'penalty_shootout_miss')).map((e, i) => (
                                        <div key={i} className={`w-2.5 h-2.5 rounded-full ${e.type === 'penalty_shootout_goal' ? 'bg-accent shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-danger shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`} />
                                    ))}
                                </div>
                                <div className="w-px h-3 bg-white/10" />
                                <div className="flex gap-1.5">
                                    {match.events.filter(e => e.teamId === match.awayTeamId && (e.type === 'penalty_shootout_goal' || e.type === 'penalty_shootout_miss')).map((e, i) => (
                                        <div key={i} className={`w-2.5 h-2.5 rounded-full ${e.type === 'penalty_shootout_goal' ? 'bg-accent shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-danger shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`} />
                                    ))}
                                </div>
                            </div>
                        )}
                        <span className="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest">
                            {period === 'Pênaltis' ? (() => {
                                const count = match.events.filter(e => e.type.startsWith('penalty_shootout_')).length;
                                const round = Math.floor(count / 2) + 1;
                                return round > 5 ? `MORTE SÚBITA (${round}º)` : `Cobrança ${round} de 5`;
                            })() : period === 'Sel. Batedores' ? 'Seleção de Batedores' : period}
                        </span>
                        
                        {match.youtubeLiveId && (
                            <div className="flex justify-center mt-3">
                                <a 
                                    href={`https://youtube.com/live/${match.youtubeLiveId}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-3 py-1.5 bg-red-600/10 border border-red-600/20 rounded-full text-red-500 hover:bg-red-600/20 transition-all group"
                                >
                                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                                    <span className="text-[0.55rem] font-black uppercase tracking-widest">LIVE YouTube</span>
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Away Team */}
                    <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                        <TeamLogo src={awayTeam.logo} size={44} />
                        <h2 className="text-center font-black text-white font-outfit uppercase text-[0.65rem] sm:text-xs tracking-wide truncate w-full leading-tight">{awayTeam.name}</h2>
                        <span className="text-[0.5rem] font-black text-slate-500 tracking-widest uppercase">Fora</span>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-2 sm:gap-3 mt-5 border-t border-white/[0.05] pt-5">
                    {!isPublicView && isAdmin ? (
                        <>
                            <button onClick={handleToggleTimer}
                                className={`flex-1 sm:flex-none px-4 sm:px-8 py-3 rounded-xl font-black text-[0.65rem] uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 ${timerRunning ? 'bg-white/5 border border-white/10 text-slate-400 hover:text-white' : 'bg-primary text-white shadow-primary/30 hover:brightness-110'
                                    }`}>
                                {timerRunning ? <><Pause size={16} strokeWidth={3} />Pausar</> : <><Play size={16} fill="currentColor" />Iniciar</>}
                            </button>
                             <button onClick={handleEndMatch}
                                 className="flex-1 sm:flex-none px-4 sm:px-8 py-3 rounded-xl bg-danger/10 border border-danger/20 text-danger font-black text-[0.65rem] uppercase tracking-[0.15em] hover:bg-danger hover:text-white transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2">
                                 <StopCircle size={16} strokeWidth={3} />
                                 {period === '1º Tempo' ? 'Fim 1º Tempo' : 
                                  period === '1º Quarto' ? 'Fim 1º Quarto' :
                                  period === '2º Quarto' ? 'Fim 2º Quarto' :
                                  period === '3º Quarto' ? 'Fim 3º Quarto' :
                                  period === '4º Quarto' ? (match.homeScore === match.awayScore ? 'Ir p/ Prorrogação' : 'Finalizar Jogo') :
                                  period === 'Intervalo' ? 'Continuar Jogo' : 
                                  period === '2º Tempo' ? (match.homeScore === match.awayScore ? (league?.hasOvertime ? 'Ir p/ Interv. Prorrog.' : 'Ir p/ Sel. Pênaltis') : 'Finalizar Jogo') :
                                  period === 'Intervalo (OT)' ? 'Iniciar 1º Prorrog.' :
                                  period === '1º Prorrog.' ? 'Fim 1º Prorrog.' :
                                  period === 'Intervalo (OT2)' ? 'Iniciar 2º Prorrog.' :
                                  period === '2º Prorrog.' ? (match.homeScore === match.awayScore ? 'Ir p/ Sel. Pênaltis' : 'Finalizar Jogo') :
                                  period === 'Sel. Batedores' ? 'Iniciar Pênaltis' :
                                  period === 'Pênaltis' && shootoutWinnerId ? `Finalizar (${shootoutWinnerId === homeTeam.id ? homeTeam.name : awayTeam.name} Venceu!)` :
                                  'Finalizar Jogo'}
                             </button>
                        </>
                    ) : (
                        <div className="text-[0.6rem] font-black text-slate-500 uppercase tracking-[0.2em] py-2">
                            Acompanhando Partida em Tempo Real
                        </div>
                    )}
                </div>
            </div>
            {isPublicView && <AdBanner position="between" className="mt-4" />}

            {/* ── MAIN GRID ──────────────────────────────────────────── */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
                
                {/* Left Area: Teams and Potential Confirmation Card */}
                <div className="xl:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 content-start">
                    {[homeTeam, awayTeam].map((team, idx) => (
                        <section key={team.id} className="glass-panel p-4 md:p-6 h-fit">
                            <div className="flex items-center gap-3 mb-5 border-b border-white/[0.05] pb-4">
                                <TeamLogo src={team.logo} size={40} />
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-sm font-black text-white font-outfit uppercase tracking-wide truncate">{team.name}</h2>
                                    <span className="text-[0.55rem] font-black text-slate-600 uppercase tracking-widest">{idx === 0 ? 'Mandante' : 'Visitante'}</span>
                                </div>
                                <div className={`px-3 py-1.5 rounded-xl font-black font-outfit text-lg flex-none ${idx === 0 ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-accent'}`}>
                                    {idx === 0 ? match.homeScore : match.awayScore}
                                </div>
                            </div>

                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1 no-scrollbar">
                            {/* Dynamic Grouping */}
                            {(() => {
                                const onPitch = team.players.filter(p => isPlayerOnPitch(match, p.id));
                                const offPitch = team.players.filter(p => !onPitch.some(op => op.id === p.id));
                                const isPenaltySelection = period === 'Sel. Batedores' && isAdmin && !isPublicView;
                                const isShootout = period === 'Pênaltis' && isAdmin && !isPublicView;

                                if (isPenaltySelection) {
                                    const currentList = penaltyPickers[team.id] || [];
                                    return (
                                        <div className="space-y-4">
                                            <div className="bg-primary/10 border border-primary/20 p-4 rounded-2xl mb-4 text-center">
                                                <h3 className="text-[0.65rem] font-black text-primary uppercase tracking-[0.2em] mb-1">Ordem dos Batedores</h3>
                                                <p className="text-[0.6rem] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">Clique para adicionar ou remover da lista</p>
                                            </div>
                                            <div className="grid grid-cols-1 gap-2">
                                                {team.players.map((player: Player) => {
                                                    const { isRedCarded } = getPlayerStatus(player.id);
                                                    const onPitch = isPlayerOnPitch(match, player.id);
                                                    const isEligible = !isRedCarded && (league?.allowSubstitutionReturn || onPitch);
                                                    const orderIndex = currentList.indexOf(player.id);
                                                    const isSelected = orderIndex !== -1;

                                                    return (
                                                        <button key={player.id} disabled={!isEligible} onClick={() => togglePenaltyShooter(player.id, team.id)}
                                                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left group ${isSelected ? 'bg-primary border-primary text-white shadow-lg' : isEligible ? 'bg-white/5 border-white/10 hover:border-white/20' : 'bg-danger/5 border-danger/10 opacity-30 cursor-not-allowed'}`}>
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${isSelected ? 'bg-white/20' : 'bg-black/20 group-hover:bg-black/40'}`}>
                                                                {isSelected ? `${orderIndex + 1}º` : `#${player.number}`}
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="text-[0.7rem] font-black uppercase tracking-tight">{player.name}</div>
                                                                {!isEligible && <div className="text-[0.5rem] font-black uppercase tracking-tighter opacity-60">{isRedCarded ? 'Expulso' : 'Substituído'}</div>}
                                                            </div>
                                                            {isSelected && <Check size={16} strokeWidth={4} />}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                }

                                if (isShootout || (match.status === 'finished' && match.events.some(e => e.type.startsWith('penalty_shootout_')))) {
                                    let shootersIds = idx === 0 ? confirmedPenaltyShooters.home : confirmedPenaltyShooters.away;
                                    const shootoutEvents = match.events.filter(e => e.type.startsWith('penalty_shootout_'));
                                    
                                    // Derive shooters list from events if local state is empty (for finished matches)
                                    if (shootersIds.length === 0 && shootoutEvents.length > 0) {
                                        shootersIds = Array.from(new Set(shootoutEvents.filter(e => e.teamId === team.id).map(e => e.playerId))).filter(id => id);
                                    }

                                    // Logic for rounds and turns
                                    const totalKicks = shootoutEvents.length;
                                    const isHomeTurn = totalKicks % 2 === 0;
                                    const isMyTurn = (idx === 0 && isHomeTurn) || (idx === 1 && !isHomeTurn);
                                    
                                    const myEvents = shootoutEvents.filter(e => e.teamId === team.id);
                                    const myKicksCount = myEvents.length;
                                    
                                    // Repetir batedores: use modulo to loop through the list
                                    const currentTakerIndex = shootersIds.length > 0 ? myKicksCount % shootersIds.length : 0;
                                    
                                    const isWinner = shootoutWinnerId === team.id;
                                    const isFinished = match.status === 'finished';

                                    return (
                                        <div className="space-y-3">
                                            {isFinished && shootersIds.length > 0 && (
                                                <div className={`p-3 rounded-xl mb-4 text-center border-2 ${isWinner ? 'bg-accent/20 border-accent shadow-lg animate-pulse' : 'bg-black/20 border-white/5 opacity-60'}`}>
                                                    <h3 className={`text-[0.7rem] font-black uppercase tracking-[0.2em] ${isWinner ? 'text-accent' : 'text-slate-500'}`}>
                                                        {isWinner ? 'Vencedor da Disputa! 🏆' : 'Fim da Disputa'}
                                                    </h3>
                                                </div>
                                            )}

                                            {shootoutWinnerId && !isFinished ? (
                                                <div className={`p-4 rounded-2xl mb-4 text-center border-2 animate-bounce ${shootoutWinnerId === team.id ? 'bg-accent/20 border-accent shadow-[0_0_30px_rgba(16,185,129,0.3)]' : 'bg-black/20 border-white/10 opacity-60'}`}>
                                                    <h3 className={`text-[0.65rem] font-black uppercase tracking-[0.2em] ${shootoutWinnerId === team.id ? 'text-accent' : 'text-slate-500'}`}>
                                                        {shootoutWinnerId === team.id ? 'Vencedor da Disputa! 🏆' : 'Fim da Disputa'}
                                                    </h3>
                                                </div>
                                            ) : (
                                                <div className={`p-4 rounded-2xl mb-2 text-center border transition-all ${isMyTurn ? 'bg-accent/10 border-accent/40 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'bg-white/5 border-white/10 opacity-50'}`}>
                                                    <div className="flex justify-between items-center mb-1">
                                                        <h3 className={`text-[0.65rem] font-black uppercase tracking-[0.2em] ${isMyTurn ? 'text-accent' : 'text-slate-500'}`}>
                                                            {isMyTurn ? 'Sua Vez de Bater' : 'Aguardando Adversário'}
                                                        </h3>
                                                        <button 
                                                            onClick={async () => {
                                                                if (window.confirm("Isso apagará TODAS as cobranças feitas até agora e voltará para a fase de seleção. Deseja reiniciar?")) {
                                                                    const toDelete = match.events.filter(e => e.type.startsWith('penalty_shootout_'));
                                                                    for (const e of toDelete) await removeEvent(matchId!, e.id);
                                                                    setConfirmedPenaltyShooters({ home: [], away: [] });
                                                                    localStorage.removeItem(`yl_shooters_${matchId}`);
                                                                    handlePeriodChange('Sel. Batedores');
                                                                }
                                                            }}
                                                            className="text-[0.5rem] font-black text-danger hover:underline uppercase"
                                                        >
                                                            Reiniciar Disputa
                                                        </button>
                                                    </div>
                                                    {isMyTurn && myKicksCount >= shootersIds.length && shootersIds.length > 0 && (
                                                        <p className="text-[0.5rem] text-slate-500 font-bold uppercase tracking-widest animate-pulse">
                                                            Reiniciando fila de batedores...
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            {shootersIds.map((pid: string, sIdx: number) => {
                                                const player = team.players.find(p => p.id === pid);
                                                if (!player) return null;
                                                
                                                // Calculate how many times THIS specific shooter has kicked so far
                                                const kicksByThisPlayer = myEvents.filter(e => e.playerId === pid).length;
                                                const isCurrentTaker = isMyTurn && sIdx === currentTakerIndex && !shootoutWinnerId;

                                                return (
                                                    <div key={`${pid}-${sIdx}`} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isCurrentTaker ? 'bg-white/5 border-primary shadow-lg scale-[1.02]' : 'bg-white/[0.02] border-white/10 opacity-70'}`}>
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${isCurrentTaker ? 'bg-primary text-white' : 'bg-black/20 text-white'}`}>
                                                            {sIdx + 1}º
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-[0.75rem] font-black text-white uppercase truncate">
                                                                {player.name} ({team.name})
                                                            </div>
                                                            {kicksByThisPlayer > 0 && (
                                                                <div className="flex gap-1 mt-1">
                                                                    {myEvents.filter(e => e.playerId === pid).map((e, i) => (
                                                                        <div key={i} className={`text-[0.5rem] font-black uppercase px-1.5 py-0.5 rounded ${e.type === 'penalty_shootout_goal' ? 'bg-accent/20 text-accent' : 'bg-danger/20 text-danger'}`}>
                                                                            {e.type === 'penalty_shootout_goal' ? 'GOL' : 'X'}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {isCurrentTaker && (
                                                                <>
                                                                    <button onClick={() => handleGol(team.id, player.id)} 
                                                                        className="w-10 h-10 rounded-lg bg-accent text-white flex items-center justify-center active:scale-90 disabled:opacity-20 shadow-lg shadow-accent/20 hover:brightness-110 transition-all">
                                                                        <Target size={18} strokeWidth={3} />
                                                                    </button>
                                                                    <button onClick={() => handleMiss(team.id, player.id)} 
                                                                        className="w-10 h-10 rounded-lg bg-danger text-white flex items-center justify-center font-black text-lg active:scale-90 disabled:opacity-20 shadow-lg shadow-danger/20 hover:brightness-110 transition-all">
                                                                        X
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                }

                                return (
                                    <>
                                        <div className="space-y-2">
                                            <h3 className="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest mb-2 px-1 flex items-center justify-between">
                                                <span>Em Campo</span>
                                                <span className="text-primary bg-primary/10 px-2 py-0.5 rounded-md">{onPitch.length}</span>
                                            </h3>
                                            {onPitch.length === 0 ? (
                                                <p className="text-center text-slate-600 text-[0.65rem] uppercase tracking-widest py-4 font-black bg-white/[0.01] rounded-xl border border-dashed border-white/5">Ninguém em campo</p>
                                            ) : (
                                                onPitch.map((player: Player) => {
                                                    const { yellowCards, isRedCarded } = getPlayerStatus(player.id);
                                                    return (
                                                        <div key={player.id} className={`flex items-center gap-2 p-3 rounded-xl border transition-all duration-300 ${player.id === suggestedMVPId ? 'bg-warning/10 border-warning shadow-[0_0_20px_rgba(245,158,11,0.2)] scale-[1.02] z-10' : 'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.05]'}`}>
                                                            <div className="relative flex-none">
                                                                <TeamLogo src={player.photo} size={player.id === suggestedMVPId ? 44 : 36} />
                                                                {player.isCaptain && <Crown size={12} className="absolute -top-1 -right-1 text-warning fill-warning/20" />}
                                                                {player.id === suggestedMVPId && (
                                                                    <div className="absolute -bottom-2 -left-2 bg-warning text-black text-[0.45rem] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter shadow-lg">Sugestão</div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <h4 className={`font-black uppercase leading-tight font-outfit truncate ${player.id === suggestedMVPId ? 'text-warning text-[0.7rem]' : 'text-white text-[0.7rem]'}`}>
                                                                        #{player.number} {player.name}
                                                                    </h4>
                                                                </div>
                                                                <div className="flex items-center gap-1 mt-1 h-3.5">
                                                                    {Array.from({ length: yellowCards }).map((_, i) => (
                                                                        <div key={i} className={`w-2 h-3.5 bg-warning rounded-[2px] border border-black/20 shadow-sm ${isRedCarded ? 'opacity-40' : ''}`} />
                                                                    ))}
                                                                    {isRedCarded && (
                                                                        <div className="w-2 h-3.5 bg-danger rounded-[2px] border border-black/20 shadow-sm ml-0.5" />
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                {!isPublicView && isAdmin && (
                                                                    <div className="flex items-center gap-1">
                                                                        {league?.sportType === 'basketball' ? (
                                                                            <>
                                                                                <button disabled={match.status !== 'live' || period.includes('Intervalo')} onClick={() => handlePoints(team.id, player.id, 1)} 
                                                                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-accent/10 text-accent font-black text-[0.6rem] hover:bg-accent hover:text-white transition-all">+1</button>
                                                                                <button disabled={match.status !== 'live' || period.includes('Intervalo')} onClick={() => handlePoints(team.id, player.id, 2)} 
                                                                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-accent/20 text-accent font-black text-[0.65rem] hover:bg-accent hover:text-white transition-all">+2</button>
                                                                                <button disabled={match.status !== 'live' || period.includes('Intervalo')} onClick={() => handlePoints(team.id, player.id, 3)} 
                                                                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-accent/30 text-accent font-black text-[0.7rem] hover:bg-accent hover:text-white transition-all">+3</button>
                                                                                
                                                                                <div className="w-px h-4 bg-white/10 mx-1" />

                                                                                <button disabled={match.status !== 'live' || period.includes('Intervalo')} onClick={() => handleAssist(team.id, player.id)} 
                                                                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-warning/10 text-warning font-black text-[0.55rem] hover:bg-warning hover:text-white transition-all" title="Assistência">ASS</button>
                                                                                <button disabled={match.status !== 'live' || period.includes('Intervalo')} onClick={() => handleStat(team.id, player.id, 'rebound')} 
                                                                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-orange-500/10 text-orange-400 font-black text-[0.55rem] hover:bg-orange-500 hover:text-white transition-all" title="Rebote">REB</button>
                                                                                <button disabled={match.status !== 'live' || period.includes('Intervalo')} onClick={() => handleStat(team.id, player.id, 'foul')} 
                                                                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-danger/10 text-danger font-black text-[0.55rem] hover:bg-danger hover:text-white transition-all" title="Falta">FAL</button>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <button disabled={match.status !== 'live' || period.includes('Intervalo') || isRedCarded} onClick={() => handleGol(team.id, player.id)} 
                                                                                    className={`w-8 h-8 flex-none flex items-center justify-center rounded-lg bg-accent/15 text-accent hover:bg-accent hover:text-white transition-all active:scale-90 disabled:cursor-not-allowed disabled:opacity-30`} title="Gol"><Target size={14} /></button>
                                                                                <button disabled={match.status !== 'live' || period.includes('Intervalo') || isRedCarded} onClick={() => handleAssist(team.id, player.id)} 
                                                                                    className={`w-8 h-8 flex-none flex items-center justify-center rounded-lg bg-warning/15 text-warning hover:bg-warning hover:text-white transition-all active:scale-90 disabled:cursor-not-allowed disabled:opacity-30`} title="Assistência"><Award size={14} /></button>
                                                                                <button disabled={match.status !== 'live' || period.includes('Intervalo') || isRedCarded} onClick={() => handleGolContra(team.id, player.id)} 
                                                                                    className={`w-8 h-8 flex-none flex items-center justify-center rounded-lg bg-danger/10 text-danger hover:bg-danger hover:text-white transition-all active:scale-90 disabled:cursor-not-allowed disabled:opacity-30`} title="Gol Contra"><XCircle size={14} /></button>
                                                                                
                                                                                <button disabled={match.status !== 'live' || period.includes('Intervalo') || isRedCarded} onClick={() => handleCartao(team.id, player.id, 'yellow_card')} 
                                                                                    className={`w-8 h-8 flex-none flex items-center justify-center rounded-lg bg-white/5 border border-warning/20 hover:bg-warning hover:text-white transition-all active:scale-90 text-xs disabled:cursor-not-allowed disabled:opacity-30`} title="Amarelo">🟨</button>
                                                                                <button disabled={match.status !== 'live' || period.includes('Intervalo') || isRedCarded} onClick={() => handleCartao(team.id, player.id, 'red_card')} 
                                                                                    className={`w-8 h-8 flex-none flex items-center justify-center rounded-lg bg-white/5 border border-danger/20 hover:bg-danger hover:text-white transition-all active:scale-90 text-xs disabled:cursor-not-allowed disabled:opacity-30`} title="Vermelho">🟥</button>
                                                                            </>
                                                                        )}
                                                                        
                                                                        <button disabled={match.status !== 'live' && !period.includes('Intervalo') || isRedCarded} onClick={() => setSubmittingPlayer({ teamId: team.id, playerOutId: player.id })} 
                                                                            className={`w-8 h-8 flex-none flex items-center justify-center rounded-lg bg-primary/15 text-primary hover:bg-primary hover:text-white transition-all active:scale-90 disabled:cursor-not-allowed disabled:opacity-30`} title="Substituir"><ArrowLeftRight size={14} /></button>
                                                                    </div>
                                                                )}
                                                                
                                                                {/* Highlight/MVP Video Button (Visible when finished) */}
                                                                {match.status === 'finished' && (
                                                                    <div className="flex items-center gap-1.5 ml-2 relative">
                                                                        {/* Suggestion text moved below buttons to avoid wrapping and keep single line */}
                                                                        {!isPublicView && isAdmin && player.id === suggestedMVPId && (
                                                                            <span className="absolute -bottom-3 right-0 text-[0.45rem] font-black text-warning uppercase whitespace-nowrap bg-[#1a140a] px-2 py-0.5 rounded-full border border-warning/10 shadow-sm pointer-events-none">
                                                                                ✨ Sugestão de melhor da partida
                                                                            </span>
                                                                        )}
                                                                        <button 
                                                                            onClick={(e) => handleGenerateHighlight(player.id, 'MVP', e)}
                                                                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary/20 text-primary hover:bg-primary hover:text-white transition-all border border-primary/20 active:scale-95 shadow-lg shadow-primary/10"
                                                                            title="Gerar Vídeo de Destaque"
                                                                        >
                                                                            <Crown size={14} />
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>

                                        <div className="space-y-2 mt-6">
                                            <h3 className="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Banco / Fora</h3>
                                            {offPitch.map((player: Player) => {
                                                const { isRedCarded, yellowCards } = getPlayerStatus(player.id);
                                                const subOuts = match.events.filter(e => e.type === 'substitution' && e.playerOutId === player.id).length;
                                                const subIns = match.events.filter(e => e.type === 'substitution' && e.playerId === player.id).length;
                                                const wasSubbedOut = subOuts > subIns;

                                                return (
                                                    <div key={player.id} className={`flex items-center gap-2 p-3 rounded-xl border transition-all duration-300 ${player.id === suggestedMVPId ? 'bg-warning/10 border-warning shadow-[0_0_20px_rgba(245,158,11,0.2)] scale-[1.02] z-10' : isRedCarded ? 'bg-danger/10 border-danger/20 opacity-40' : wasSubbedOut ? 'bg-primary/5 border-primary/10 opacity-70' : 'bg-white/[0.01] border-white/[0.02] opacity-50'}`}>
                                                        <div className="relative flex-none">
                                                            <TeamLogo src={player.photo} size={player.id === suggestedMVPId ? 44 : 36} />
                                                            {isRedCarded && <XCircle size={12} className="absolute -top-1 -right-1 text-danger fill-danger/20" />}
                                                            {player.id === suggestedMVPId && (
                                                                <div className="absolute -bottom-2 -left-2 bg-warning text-black text-[0.45rem] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter shadow-lg">Sugestão</div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className={`font-black uppercase leading-tight font-outfit truncate ${player.id === suggestedMVPId ? 'text-warning text-[0.7rem]' : 'text-white text-[0.7rem]'}`}>
                                                                #{player.number} {player.name}
                                                            </h4>
                                                            <div className="flex items-center gap-1 mt-1 h-3.5">
                                                                {isRedCarded ? (
                                                                    <div className="w-2 h-3.5 bg-danger rounded-[2px] border border-black/20 shadow-sm" />
                                                                ) : wasSubbedOut ? (
                                                                    <span className="text-[0.45rem] font-black text-primary uppercase tracking-tighter">Substituído</span>
                                                                ) : (
                                                                    <span className="text-[0.45rem] font-black text-slate-600 uppercase tracking-tighter">No Banco</span>
                                                                )}
                                                                {!isRedCarded && Array.from({ length: yellowCards }).map((_, i) => (
                                                                    <div key={i} className="w-2 h-3.5 bg-warning rounded-[2px] border border-black/20" />
                                                                ))}
                                                            </div>
                                                        </div>
                                                        {!isPublicView && isAdmin && (isRedCarded || yellowCards > 0) && (
                                                            <button disabled={match.status !== 'live'} onClick={() => handleUndoLastCard(player.id)} className={`w-8 h-8 flex-none flex items-center justify-center rounded-lg bg-white/5 text-warning/50 hover:text-warning transition-all ${match.status !== 'live' ? 'opacity-30 cursor-not-allowed' : ''}`} title="Anular Cartão">
                                                                <Trash2 size={12} />
                                                            </button>
                                                        )}

                                                        {match.status === 'finished' && (
                                                            <div className="flex items-center gap-1.5 flex-none relative">
                                                                {!isPublicView && isAdmin && player.id === suggestedMVPId && (
                                                                    <span className="absolute -bottom-3 right-0 text-[0.45rem] font-black text-warning uppercase whitespace-nowrap bg-[#1a140a] px-2 py-0.5 rounded-full border border-warning/10 shadow-sm">
                                                                        ✨ Sugestão de melhor da partida
                                                                    </span>
                                                                )}
                                                                {/* Old suggestion badge removed */}
                                                                <button 
                                                                    onClick={(e) => handleGenerateHighlight(player.id, 'MVP', e)}
                                                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary/20 text-primary hover:bg-primary hover:text-white transition-all border border-primary/20 active:scale-95 shadow-lg shadow-primary/10"
                                                                    title="Gerar Vídeo de Destaque"
                                                                >
                                                                    <Crown size={14} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    </section>
                ))}

                {/* Confirmation Card for Penalties Phase - now properly placed in the grid */}
                {period === 'Sel. Batedores' && isAdmin && !isPublicView && (
                    <div className="lg:col-span-2">
                        <div className="glass-panel p-6 flex flex-col md:flex-row items-center justify-between gap-6 border-t-2 border-accent/20">
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1 flex items-center justify-center md:justify-start gap-2">
                                    <Check className="text-accent" size={20} /> Ordem dos Batedores
                                </h3>
                                <p className="text-[0.65rem] text-slate-500 font-bold uppercase tracking-wider">
                                    Verifique as listas acima antes de iniciar a disputa oficial.
                                </p>
                            </div>
                            <button onClick={() => { if(confirmShooters()) handlePeriodChange('Pênaltis'); }}
                                className="w-full md:w-auto px-12 py-5 rounded-2xl bg-accent text-white font-black text-xs uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3">
                                <Play fill="currentColor" size={18} /> Iniciar Disputa de Pênaltis
                            </button>
                        </div>
                    </div>
                )}
                </div>

                {/* Right Area: Settings + Event Log (now column 3 on XL) */}
                <div className="space-y-4 md:space-y-6">
                    {/* YouTube Video Player */}
                    {(match?.youtubeLiveId || (isAdmin && !isPublicView && isEditingYtUrl)) && (
                        <div className="glass-panel p-4 overflow-hidden border border-white/10 shadow-2xl">
                            <h3 className="text-[0.65rem] font-black text-primary uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <Video size={14} /> Transmissão / Gravação
                            </h3>
                            {match?.youtubeLiveId && (
                                <div className="relative pt-[56.25%] rounded-2xl overflow-hidden bg-black/40 border border-white/5 ring-1 ring-white/10">
                                    <iframe
                                        title="Match Video"
                                        className="absolute inset-0 w-full h-full"
                                        src={`https://www.youtube.com/embed/${match.youtubeLiveId}`}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                            )}

                            {isAdmin && !isPublicView && (
                                <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                                    {isEditingYtUrl ? (
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                value={editingYtUrl} 
                                                onChange={e => setEditingYtUrl(e.target.value)}
                                                placeholder="ID do vídeo (ex: dQw4w9WgXcQ)"
                                                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary outline-none font-bold"
                                            />
                                            <button onClick={handleSaveYtUrl} className="p-2 bg-primary text-white rounded-lg hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20" title="Salvar">
                                                <Check size={14} />
                                            </button>
                                            <button onClick={() => setIsEditingYtUrl(false)} className="p-2 bg-white/5 text-slate-400 rounded-lg hover:bg-white/10 active:scale-95 transition-all" title="Cancelar">
                                                <XCircle size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            <button onClick={() => { setEditingYtUrl(match.youtubeLiveId || ''); setIsEditingYtUrl(true); }} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[0.6rem] font-black uppercase text-slate-400 hover:text-white hover:bg-primary/20 hover:border-primary/30 transition-all">
                                                <Edit3 size={12} /> Editar
                                            </button>
                                            <button onClick={() => handleSetPrivacy('private')} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[0.6rem] font-black uppercase text-slate-400 hover:text-white hover:bg-warning/20 hover:border-warning/30 transition-all" title="Torna o vídeo privado no YouTube">
                                                <Lock size={12} /> Privar
                                            </button>
                                            <button onClick={() => handleSetPrivacy('public')} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[0.6rem] font-black uppercase text-slate-400 hover:text-white hover:bg-accent/20 hover:border-accent/30 transition-all" title="Torna o vídeo público no YouTube">
                                                <Eye size={12} /> Público
                                            </button>
                                            <button onClick={handleUnlinkYt} className="flex items-center gap-2 px-3 py-1.5 bg-danger/10 border border-danger/20 rounded-lg text-[0.6rem] font-black uppercase text-danger hover:bg-danger/20 transition-all ml-auto" title="Remove o vídeo do site (Mantém no YouTube)">
                                                <Unlink size={12} /> Desvincular
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Technical Panel - conditionally rendered or read-only */}
                    {!isPublicView && isAdmin ? (
                        <section className="glass-panel p-4 md:p-6">
                            <h3 className="text-sm font-black text-white font-outfit uppercase tracking-widest mb-5 flex items-center gap-2">
                                <Settings2 size={16} className="text-primary" /> Painel Técnico
                            </h3>
                            <div className="grid grid-cols-2 gap-4 mb-5">
                                <div className="col-span-2 space-y-1.5">
                                    <label className="text-[0.6rem] font-black text-slate-600 uppercase tracking-widest ml-1">Etapa Atual</label>
                                     <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                         {(league?.sportType === 'basketball' 
                                           ? ['1º Quarto', '2º Quarto', '3º Quarto', '4º Quarto', 'Intervalo', 'Prorrogação']
                                           : ['1º Tempo', 'Intervalo', '2º Tempo', 'Intervalo (OT)', '1º Prorrog.', 'Intervalo (OT2)', '2º Prorrog.', 'Sel. Batedores', 'Pênaltis']
                                         ).map(p => (
                                             <button key={p} 
                                                 onClick={() => {
                                                     if (p === 'Pênaltis' && confirmedPenaltyShooters.home.length === 0) {
                                                         alert('Selecione e confirme os batedores primeiro!');
                                                         handlePeriodChange('Sel. Batedores');
                                                         return;
                                                     }
                                                     handlePeriodChange(p);
                                                 }}
                                                 className={`py-2 px-1 rounded-lg text-[0.6rem] font-black uppercase tracking-tight transition-all border ${period === p ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 border-white/10 text-slate-500 hover:bg-white/10'}`}>
                                                 {p.includes('Intervalo') ? 'Interv.' : p === 'Sel. Batedores' ? 'Sel. Bat.' : p}
                                             </button>
                                         ))}
                                     </div>
                                </div>
                                {period !== 'Sel. Batedores' && period !== 'Pênaltis' && (
                                    <>
                                        <div className="col-span-2 space-y-1.5 mb-5">
                                            <label className="text-[0.6rem] font-black text-slate-600 uppercase tracking-widest ml-1">Acréscimos (min)</label>
                                            <div className="flex gap-1.5 mb-2">
                                                {[1, 2, 3, 4, 5].map(v => (
                                                    <button key={v} onClick={() => setExtraTime(v)} 
                                                        className={`flex-1 py-1.5 rounded-lg text-[0.65rem] font-black transition-all ${extraTime === v ? 'bg-primary text-white' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}>
                                                        +{v}
                                                    </button>
                                                ))}
                                                <button onClick={() => setExtraTime(0)} className="flex-1 py-1.5 rounded-lg text-[0.65rem] font-black bg-white/5 text-slate-500 hover:bg-white/10">0</button>
                                            </div>
                                            <input type="number" value={extraTime} onChange={e => setExtraTime(parseInt(e.target.value) || 0)}
                                                className="w-full bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 text-white text-center text-xl font-black focus:border-primary outline-none" />
                                        </div>
                                        <div className="col-span-2">
                                            <button onClick={handleSaveTimeSettings} className="w-full bg-white/5 border border-white/10 text-white font-black py-3 rounded-xl uppercase tracking-widest text-[0.65rem] hover:bg-white/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                                                <Clock size={14} strokeWidth={3} /> Salvar Cronograma
                                            </button>
                                        </div>
                                    </>
                                )}
                                {!match.youtubeLiveId && !isEditingYtUrl && (
                                    <div className="col-span-2 mt-2 text-center">
                                        <button 
                                            onClick={() => { setEditingYtUrl(''); setIsEditingYtUrl(true); }}
                                            className="w-full bg-red-600/10 border border-red-600/20 text-red-500 font-black py-4 rounded-xl uppercase tracking-widest text-[0.65rem] hover:bg-red-600/20 active:scale-[0.95] transition-all flex items-center justify-center gap-2 group"
                                        >
                                            <Video size={14} className="group-hover:scale-110 transition-transform" /> Vincular Gravação do YouTube
                                        </button>
                                        <p className="text-[0.55rem] text-slate-500 font-bold uppercase tracking-widest mt-2 italic">Dica: Você também pode usar o botão "Live" no topo para transmitir ao vivo.</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    ) : (
                        <div className="glass-panel p-6 bg-primary/5 border-primary/20 border">
                            <h3 className="text-[0.65rem] font-black text-primary uppercase tracking-[0.2em] mb-4">Informações da Partida</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-500 font-bold uppercase tracking-widest">Local</span>
                                    <span className="text-white font-black uppercase text-right">{match.location || 'Não definido'}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-500 font-bold uppercase tracking-widest">Início</span>
                                    <span className="text-white font-black uppercase text-right">
                                        {match.scheduledAt ? new Date(match.scheduledAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Em breve'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-500 font-bold uppercase tracking-widest">Tempo</span>
                                    <span className="text-white font-black uppercase text-right">{halfLength} min / tempo</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Event Log */}
                    <section className="glass-panel p-4 md:p-6">
                        <h3 className="text-sm font-black text-white font-outfit uppercase tracking-widest mb-5 flex items-center gap-2">
                            <History size={16} className="text-accent" /> Súmula Realtime
                        </h3>
                        <div className="space-y-2 overflow-y-auto max-h-[400px] pr-1 no-scrollbar">
                            {match.events.length === 0 ? (
                                <div className="text-center py-16 opacity-30 flex flex-col items-center gap-3">
                                    <History size={36} strokeWidth={1} />
                                    <span className="text-[0.6rem] font-black uppercase tracking-[0.2em]">Aguardando eventos...</span>
                                </div>
                            ) : (
                                [...match.events].reverse().map((event) => {
                                    const p = [...homeTeam.players, ...awayTeam.players].find(pl => pl.id === event.playerId);
                                     const colorMap: Record<string, string> = {
                                         goal: 'text-accent',
                                         penalty_goal: 'text-accent',
                                         penalty_shootout_goal: 'text-accent',
                                         penalty_shootout_miss: 'text-danger',
                                         own_goal: 'text-danger',
                                         assist: 'text-warning',
                                         yellow_card: 'text-warning',
                                         red_card: 'text-danger',
                                         substitution: 'text-primary',
                                     };
                                     const labelMap: Record<string, string> = {
                                         goal: '⚽ Gol', penalty_goal: '⚽ Pênalti', own_goal: '🔴 Gol Contra',
                                         penalty_shootout_goal: '✅ Pênalti (Decisão)', penalty_shootout_miss: '❌ Pênalti (Perdido)',
                                         yellow_card: '🟨 Amarelo', red_card: '🟥 Vermelho', assist: '🅰️ Assistência',
                                         substitution: '🔄 Subst.',
                                         points_1: '🏀 +1 Ponto', points_2: '🏀 +2 Pontos', points_3: '🏀 +3 Pontos',
                                         rebound: '🏀 Rebote', block: '🏀 Toco', steal: '🏀 Roubo', foul: '🚫 Falta'
                                     };
                                    const pOut = event.playerOutId ? [...homeTeam.players, ...awayTeam.players].find(pl => pl.id === event.playerOutId) : null;
                                    return (
                                        <div key={event.id} className="group flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] transition-all">
                                            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-black/40 font-black font-outfit text-primary text-xs flex-none shadow-inner">
                                                {event.minute}'
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className="font-outfit font-black text-white uppercase truncate text-xs block">
                                                    {event.type === 'substitution' ? `${p?.name ?? '—'} ↔️ ${pOut?.name ?? '—'}` : (p?.name ?? '—')}
                                                </span>
                                                <span className={`text-[0.6rem] font-black uppercase tracking-tight ${colorMap[event.type] || 'text-slate-500'}`}>
                                                    {labelMap[event.type] || event.type}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {['goal', 'penalty_goal', 'penalty_shootout_goal', 'assist', 'points_1', 'points_2', 'points_3', 'rebound', 'block', 'steal'].includes(event.type) && (
                                                    <button 
                                                        onClick={(e) => handleGenerateHighlight(
                                                            event.playerId, 
                                                            ['goal', 'penalty_goal', 'penalty_shootout_goal'].includes(event.type) ? 'Gol' :
                                                            ['points_1', 'points_2', 'points_3'].includes(event.type) ? 'Ponto' :
                                                            event.type === 'assist' ? 'Assist' : 'Rebote',
                                                            e
                                                        )}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary/20 text-primary hover:bg-primary hover:text-white transition-all border border-primary/20 active:scale-95 shadow-lg shadow-primary/10 flex-none"
                                                        title="Gerar Vídeo / Imagem"
                                                    >
                                                        <Video size={14} />
                                                    </button>
                                                )}
                                                {!isPublicView && isAdmin && (
                                                    <button onClick={() => removeEvent(matchId!, event.id)}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-danger/10 text-danger hover:bg-danger hover:text-white transition-all sm:opacity-0 sm:group-hover:opacity-100 flex-none border border-danger/20">
                                                        <XCircle size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </section>
                </div>
            </div>

            {/* Substitution Modal */}
            {submittingPlayer && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="glass-panel w-full max-w-md p-6 md:p-8 border-primary/20 border shadow-[0_0_50px_rgba(109,40,217,0.2)]">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-black font-outfit uppercase tracking-widest flex items-center gap-3 text-white">
                                <ArrowLeftRight size={20} className="text-primary" /> Substituição
                            </h2>
                            <button onClick={() => setSubmittingPlayer(null)} className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white">
                                <XCircle size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-danger/10 border border-danger/20">
                                <span className="text-[0.6rem] font-black text-danger uppercase tracking-widest block mb-1">Efetuar Saída de:</span>
                                <div className="flex items-center gap-3">
                                    <TeamLogo src={[...homeTeam.players, ...awayTeam.players].find(p => p.id === submittingPlayer.playerOutId)?.photo} size={32} />
                                    <span className="font-bold text-white uppercase">{[...homeTeam.players, ...awayTeam.players].find(p => p.id === submittingPlayer.playerOutId)?.name}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <span className="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest block mb-2">Selecione quem entra:</span>
                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
                                    {(submittingPlayer.teamId === homeTeam.id ? homeTeam : awayTeam).players
                                        .filter(p => {
                                            if (p.id === submittingPlayer.playerOutId) return false;
                                            
                                            const { isRedCarded } = getPlayerStatus(p.id);
                                            if (isRedCarded) return false;
                                            
                                            if (isPlayerOnPitch(match, p.id)) return false;

                                            if (league?.allowSubstitutionReturn === false) {
                                                const subOuts = match.events.filter(e => e.type === 'substitution' && e.playerOutId === p.id).length;
                                                if (subOuts > 0) return false;
                                            }

                                            return true;
                                        })
                                        .map(availablePlayer => (
                                            <button key={availablePlayer.id} onClick={() => handleSubstitution(submittingPlayer.teamId, availablePlayer.id, submittingPlayer.playerOutId)}
                                                className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-accent/20 hover:border-accent/40 transition-all text-left">
                                                <TeamLogo src={availablePlayer.photo} size={32} />
                                                <div className="flex-1">
                                                    <span className="font-black text-white text-xs uppercase block">#{availablePlayer.number} {availablePlayer.name}</span>
                                                    <span className="text-[0.6rem] font-black text-accent uppercase tracking-widest">
                                                        {availablePlayer.isReserve ? 'Reserva' : 'Titular (Retorno)'}
                                                    </span>
                                                </div>
                                            </button>
                                        ))
                                    }
                                    {(submittingPlayer.teamId === homeTeam.id ? homeTeam : awayTeam).players.filter(p => {
                                        const { isRedCarded } = getPlayerStatus(p.id);
                                        if (isRedCarded) return false;
                                        if (isPlayerOnPitch(match, p.id)) return false;
                                        if (league?.allowSubstitutionReturn === false) {
                                            const subOuts = match.events.filter(e => e.type === 'substitution' && e.playerOutId === p.id).length;
                                            if (subOuts > 0) return false;
                                        }
                                        return p.id !== submittingPlayer.playerOutId;
                                    }).length === 0 && (
                                        <p className="text-center py-6 text-slate-600 text-[0.65rem] uppercase font-black tracking-widest italic">Nenhum jogador disponível para entrar</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* End Match Confirmation Modal */}
            {showFinishModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
                    <div className="glass-panel w-full max-w-lg p-6 md:p-10 border-danger/30 shadow-[0_0_80px_rgba(239,68,68,0.2)]">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 bg-danger/20 rounded-2xl flex items-center justify-center text-danger">
                                <StopCircle size={32} />
                            </div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-black font-outfit uppercase tracking-wider text-white">Finalizar Partida</h2>
                                <p className="text-slate-500 text-[0.65rem] font-bold uppercase tracking-widest mt-1">Isso encerrará o cronômetro e salvará o placar final</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                                <div className="flex items-center justify-center gap-6 font-outfit font-black text-4xl mb-4">
                                    <span className="text-primary">{match.homeScore}</span>
                                    <span className="text-slate-800 text-xl">✕</span>
                                    <span className="text-accent">{match.awayScore}</span>
                                </div>
                                <p className="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest italic">Confirma que este é o placar final?</p>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Video size={14} className="text-red-500" /> Gravação do Jogo (YouTube URL)
                                </label>
                                <input 
                                    type="text"
                                    placeholder="Ex: https://youtube.com/watch?v=..."
                                    value={finishedMatchVideoUrl}
                                    onChange={(e) => setFinishedMatchVideoUrl(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white placeholder:text-slate-700 focus:border-primary outline-none transition-all text-sm font-bold"
                                />
                                <p className="text-[0.55rem] text-slate-600 font-bold uppercase tracking-tight italic">
                                    Deixe em branco se não houver vídeo. Se você transmitiu ao vivo pelo app, o link já deve estar acima.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                <button 
                                    onClick={confirmFinalFinish}
                                    className="flex-1 bg-danger text-white font-black py-4 rounded-xl shadow-[0_10px_30px_rgba(239,68,68,0.3)] hover:brightness-110 active:scale-95 transition-all uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2"
                                >
                                    <CheckCircle2 size={16} /> Finalizar Definitivamente
                                </button>
                                <button 
                                    onClick={() => setShowFinishModal(false)}
                                    className="px-8 py-4 rounded-xl border border-white/10 text-slate-500 font-bold hover:bg-white/5 transition-all text-xs uppercase tracking-widest"
                                >
                                    Voltar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Highlight Generator Overlay */}
            {highlightData && (
                <Suspense fallback={<div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>}>
                    <VideoGenerator 
                        player={highlightData.player}
                        team={highlightData.team}
                        sportType={highlightData.sportType}
                        eventType={highlightData.eventType}
                        stats={highlightData.stats}
                        onClose={() => setHighlightData(null)}
                    />
                </Suspense>
            )}
        </div>
    );
};

export default MatchControl;
