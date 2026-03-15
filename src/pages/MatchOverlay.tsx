import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useLeague, type Match } from '../context/LeagueContext';
import TeamLogo from '../components/TeamLogo';
import { supabase } from '../lib/supabase';

const MatchOverlay = () => {
    const { matchId } = useParams<{ matchId: string }>();
    const { matches, teams, loadPublicLeague } = useLeague();
    const match = matches.find((m: Match) => String(m.id) === String(matchId));
    
    const [localSeconds, setLocalSeconds] = useState(match?.timer || 0);

    const homeTeamId = match?.homeTeamId;
    const awayTeamId = match?.awayTeamId;
    const homeTeam = teams.find(t => String(t.id) === String(homeTeamId));
    const awayTeam = teams.find(t => String(t.id) === String(awayTeamId));

    useEffect(() => {
        if (matchId && matches.length > 0 && !match) {
            console.log('[Overlay] Match IDs na memória:', matches.map(m => m.id));
            console.log('[Overlay] Procurando por:', matchId);
        }
        if (match && teams.length > 0 && (!homeTeam || !awayTeam)) {
            console.log('[Overlay] IDs dos times na match:', homeTeamId, awayTeamId);
            console.log('[Overlay] IDs dos times na memória:', teams.map(t => t.id));
        }
    }, [matchId, match, matches, teams, homeTeam, awayTeam, homeTeamId, awayTeamId]);

    // Bootstrap: Se entrar direto no overlay via link, precisamos carregar a liga
    useEffect(() => {
        const bootstrap = async () => {
            if (!matchId || (match && homeTeam && awayTeam)) return;
            
            console.log('[Overlay] Buscando match no banco:', matchId);

            // Buscamos a liga via matches table diretamente
            const { data: matchData, error: matchError } = await supabase
                .from('matches')
                .select('league_id')
                .eq('id', matchId)
                .maybeSingle();
            
            if (matchError) {
                console.error('[Overlay] Erro crítico no Supabase:', matchError);
                return;
            }

            if (!matchData) {
                console.warn('[Overlay] Partida não encontrada no banco. O ID pode estar errado.');
                return;
            }

            if (matchData.league_id) {
                console.log('[Overlay] Liga identificada:', matchData.league_id, '- Forçando loadPublicLeague');
                loadPublicLeague(matchData.league_id);
            }
        };
        bootstrap();
    }, [matchId, !!match, !!homeTeam, !!awayTeam, loadPublicLeague]);

    useEffect(() => {
        if (match) {
            console.log('[Overlay] Partida sincronizada:', match.id, `- Placar: ${match.homeScore} x ${match.awayScore}`);
        }
    }, [!!match]);

    // ── SMART TIMER CALCULATION ──
    useEffect(() => {
        let interval: any;
        
        const updateTimerDisplay = () => {
            if (!match) return;

            if (match.status === 'live') {
                const lastUpdateStr = match.updatedAt || new Date().toISOString();
                const lastUpdate = new Date(lastUpdateStr).getTime();
                const now = Date.now();
                const diffInSeconds = Math.max(0, Math.floor((now - lastUpdate) / 1000));
                const calculatedSeconds = (match.timer || 0) + diffInSeconds;

                setLocalSeconds(calculatedSeconds);
            } else {
                setLocalSeconds(match.timer || 0);
            }
        };

        updateTimerDisplay();
        interval = window.setInterval(updateTimerDisplay, 1000);
        return () => window.clearInterval(interval);
    }, [match?.id, match?.status, match?.timer, match?.updatedAt]);

    useEffect(() => {
        if (match) {
            console.log('[Overlay] Partida encontrada e sincronizada:', match.id);
        }
    }, [!!match]);

    const formatTime = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Force transparency styles to be present from the very legacy start to avoid flicker
    const transparencyStyles = (
        <style>{`
            :root, html, body, #root { 
                background: transparent !important; 
                background-color: transparent !important;
                background-image: none !important; 
                margin: 0;
                padding: 0;
                overflow: hidden;
            }
            * { -webkit-font-smoothing: antialiased; }
        `}</style>
    );

    if (!match || !homeTeam || !awayTeam) {
        return (
            <div className="min-h-screen w-screen bg-transparent flex items-start justify-start p-6" data-state="loading">
                {transparencyStyles}
                <div className="bg-black/90 backdrop-blur-xl px-6 py-5 rounded-2xl border border-white/10 shadow-2xl max-w-sm">
                    <div className="flex flex-col gap-5">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-8 h-8 border-2 border-primary/20 rounded-full" />
                                <div className="absolute inset-0 w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[0.65rem] text-white font-black uppercase tracking-[0.2em]">Sincronizando Placar</span>
                                <span className="text-[0.45rem] text-white/40 font-bold uppercase tracking-widest leading-tight">Match ID: {matchId?.slice(0,8)}...</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {/* Passo 1: Match */}
                            <div className="flex items-center justify-between text-[0.55rem] font-bold uppercase">
                                <span className={match ? 'text-primary' : 'text-white/40'}>1. Identificar Partida</span>
                                <span className={match ? 'text-primary' : 'text-white/20'}>{match ? 'Localizado ✓' : 'Buscando...'}</span>
                            </div>
                            
                            {/* Passo 2: Times */}
                            <div className="flex items-center justify-between text-[0.55rem] font-bold uppercase">
                                <span className={(homeTeam && awayTeam) ? 'text-primary' : 'text-white/40'}>2. Carregar Times</span>
                                <span className={(homeTeam && awayTeam) ? 'text-primary' : 'text-white/20'}>{(homeTeam && awayTeam) ? 'Localizado ✓' : 'Aguardando...'}</span>
                            </div>
                        </div>

                        <div className="pt-2 border-t border-white/5">
                            <p className="text-[0.45rem] text-white/30 font-medium leading-relaxed italic">
                                Se este aviso não sumir em 10 segundos, verifique se a partida ainda existe no seu painel.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const periodLabel = match.period === 'Pênaltis' || match.period === 'Sel. Batedores' ? 'PÊNALTIS' : match.period;

    return (
        <div className="min-h-screen w-screen bg-transparent flex items-start justify-start p-6 font-outfit select-none animate-fade-in overflow-hidden" data-state="ready">
            {transparencyStyles}
            
            {/* Main Scoreboard Container */}
            <div className="flex flex-col items-start gap-1">
                <div className="flex items-stretch h-12 bg-black/90 backdrop-blur-md rounded-xl overflow-hidden border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                    
                    {/* Timer & Period Section */}
                    <div className="bg-primary px-4 flex flex-col items-center justify-center border-r border-white/10 min-w-[70px]">
                        <span className="text-[0.55rem] font-black text-white/70 uppercase tracking-tighter leading-none mb-0.5">
                            {periodLabel}
                        </span>
                        <span className="text-sm font-mono font-black text-white leading-none">
                            {match.period === 'Pênaltis' || match.period === 'Sel. Batedores' ? '--:--' : formatTime(localSeconds)}
                        </span>
                    </div>

                    {/* Home Team */}
                    <div className="flex items-center gap-3 px-4 border-r border-white/5 bg-white/[0.02]">
                        <div className="flex flex-col items-end">
                            <span className="text-[0.75rem] font-black text-white uppercase truncate max-w-[100px] leading-none">
                                 {homeTeam.name}
                            </span>
                        </div>
                        <TeamLogo src={homeTeam.logo} size={28} />
                        <div className="flex items-center justify-center w-10 h-full bg-primary/20">
                            <span className="text-xl font-black text-primary text-glow-primary">
                                {match.homeScore}
                            </span>
                        </div>
                    </div>

                    {/* Divider / VS */}
                    <div className="flex items-center justify-center px-1 opacity-20">
                        <div className="w-px h-6 bg-white" />
                    </div>

                    {/* Away Team */}
                    <div className="flex items-center gap-3 px-4 bg-white/[0.02]">
                        <div className="flex items-center justify-center w-10 h-full bg-accent/20">
                            <span className="text-xl font-black text-accent text-glow-accent">
                                {match.awayScore}
                            </span>
                        </div>
                        <TeamLogo src={awayTeam.logo} size={28} />
                        <div className="flex flex-col items-start">
                            <span className="text-[0.75rem] font-black text-white uppercase truncate max-w-[100px] leading-none">
                                {awayTeam.name}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Extra Info Row (Stays below primary scoreboard) */}
                <div className="flex gap-1">
                    {/* Added Time */}
                    {(match.extraTime || 0) > 0 && match.period !== 'Pênaltis' && (
                        <div className="bg-danger px-2 py-0.5 rounded-lg text-[0.6rem] font-black text-white shadow-lg animate-pulse border border-white/10">
                            +{match.extraTime} ACRÉSCIMO
                        </div>
                    )}

                    {/* Penalty Shootout Indicators */}
                    {match.period === 'Pênaltis' && (
                        <div className="bg-black/80 backdrop-blur-sm px-3 py-1 rounded-xl border border-white/10 flex items-center gap-3 shadow-xl">
                            <div className="flex gap-1.5">
                                {match.events.filter(e => e.teamId === match.homeTeamId && (e.type === 'penalty_shootout_goal' || e.type === 'penalty_shootout_miss')).map((e, i) => (
                                    <div key={i} className={`w-2 h-2 rounded-full ${e.type === 'penalty_shootout_goal' ? 'bg-accent shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-danger shadow-[0_0_8px_rgba(239,68,68,0.8)]'}`} />
                                ))}
                            </div>
                            <div className="w-px h-3 bg-white/20" />
                            <div className="flex gap-1.5">
                                {match.events.filter(e => e.teamId === match.awayTeamId && (e.type === 'penalty_shootout_goal' || e.type === 'penalty_shootout_miss')).map((e, i) => (
                                    <div key={i} className={`w-2 h-2 rounded-full ${e.type === 'penalty_shootout_goal' ? 'bg-accent shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-danger shadow-[0_0_8px_rgba(239,68,68,0.8)]'}`} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MatchOverlay;
