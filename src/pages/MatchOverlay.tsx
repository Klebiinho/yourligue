import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useLeague, type Match } from '../context/LeagueContext';
import TeamLogo from '../components/TeamLogo';
import { supabase } from '../lib/supabase';

const MatchOverlay = () => {
    const { matchId } = useParams<{ matchId: string }>();
    const { matches, teams, league, loadPublicLeague } = useLeague();
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

    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [status, setStatus] = useState<string>('Iniciando...');

    // Bootstrap: Se entrar direto no overlay via link, precisamos carregar a liga
    useEffect(() => {
        const bootstrap = async () => {
            if (!matchId) return;
            if (match && homeTeam && awayTeam) {
                setStatus('Pronto');
                return;
            }
            
            setStatus('Buscando partida no banco...');
            console.log('[Overlay] Buscando match no banco:', matchId);

            try {
                // Buscamos a liga via matches table diretamente
                const { data: matchData, error: matchError } = await supabase
                    .from('matches')
                    .select('league_id')
                    .eq('id', matchId)
                    .maybeSingle();
                
                if (matchError) {
                    console.error('[Overlay] Erro no Supabase:', matchError);
                    setErrorMsg(`Erro de conexão: ${matchError.message}`);
                    return;
                }

                if (!matchData) {
                    console.warn('[Overlay] Partida não encontrada.');
                    setErrorMsg('Partida não localizada. Verifique o link.');
                    return;
                }

                if (matchData.league_id) {
                    setStatus('Carregando campeonato...');
                    console.log('[Overlay] Liga identificada:', matchData.league_id);
                    const success = await loadPublicLeague(matchData.league_id);
                    if (!success) {
                        setErrorMsg('Não foi possível carregar os dados da liga.');
                    } else {
                        setStatus('Sincronizando placar...');
                    }
                }
            } catch (e: any) {
                setErrorMsg(`Falha inesperada: ${e.message}`);
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
                                <span className={`text-[0.45rem] font-bold uppercase tracking-widest leading-tight ${errorMsg ? 'text-red-400' : 'text-primary'}`}>
                                    {errorMsg ? 'ERRO DE SINCRONISMO' : status}
                                </span>
                            </div>
                        </div>

                        {errorMsg ? (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <p className="text-[0.55rem] text-red-400 font-bold uppercase leading-relaxed">
                                    {errorMsg}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {/* Passo 1: Match */}
                                <div className="flex items-center justify-between text-[0.55rem] font-bold uppercase">
                                    <span className={match ? 'text-primary' : 'text-white/40'}>1. Identificar Partida</span>
                                    <span className={match ? 'text-primary' : 'text-white/20'}>{match ? 'OK ✓' : 'Pendente'}</span>
                                </div>
                                
                                {/* Passo 2: Times */}
                                <div className="flex items-center justify-between text-[0.55rem] font-bold uppercase">
                                    <span className={(homeTeam && awayTeam) ? 'text-primary' : 'text-white/40'}>2. Sincronizar Times</span>
                                    <span className={(homeTeam && awayTeam) ? 'text-primary' : 'text-white/20'}>{(homeTeam && awayTeam) ? 'OK ✓' : 'Pendente'}</span>
                                </div>
                            </div>
                        )}

                        <div className="pt-2 border-t border-white/5 flex flex-col gap-1">
                            <span className="text-[0.35rem] text-white/20 font-mono">MATCH_ID: {matchId}</span>
                            <p className="text-[0.45rem] text-white/30 font-medium leading-relaxed italic">
                                Verifique se a partida está ativa no painel de controle.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const isBasket = league?.sportType === 'basketball';
    const periodLabel = (match.period === 'Pênaltis' || match.period === 'Sel. Batedores') ? 'PÊNALTIS' : match.period;

    const shootoutEvents = match.events.filter(e => e.type.startsWith('penalty_shootout_'));
    const homeShootout = shootoutEvents.filter(e => e.teamId === match.homeTeamId);
    const awayShootout = shootoutEvents.filter(e => e.teamId === match.awayTeamId);

    return (
        <div className="min-h-screen w-screen bg-transparent flex flex-col items-start justify-start p-8 font-outfit select-none animate-fade-in overflow-hidden" data-state="ready">
            {transparencyStyles}
            
            {/* ── League Branding Header ── */}
            <div className="flex items-center gap-3 bg-black/80 backdrop-blur-md px-4 py-2 rounded-t-2xl border-x border-t border-white/10 shadow-2xl animate-slide-down">
                <div className="flex items-center gap-2 pr-4 border-r border-white/10">
                    <div className="w-5 h-5 bg-primary rounded-md flex items-center justify-center">
                        <span className="text-[0.6rem] font-black text-white italic">YL</span>
                    </div>
                    <span className="text-[0.65rem] font-black text-white tracking-[0.2em] uppercase">YourLeague</span>
                </div>
                <div className="flex items-center gap-2 pl-1">
                    {league?.logo && <img src={league.logo} alt="" className="w-4 h-4 object-contain" />}
                    <span className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest leading-none">
                        {league?.name || 'Campeonato'}
                    </span>
                </div>
            </div>

            {/* Main Scoreboard Container */}
            <div className="flex flex-col items-start gap-1">
                <div className="flex items-stretch h-14 bg-black/90 backdrop-blur-md rounded-tr-2xl rounded-b-2xl overflow-hidden border border-white/10 shadow-[0_12px_45px_rgba(0,0,0,0.6)] animate-slide-up">
                    
                    {/* Timer & Period Section */}
                    <div className="bg-primary px-6 flex flex-col items-center justify-center border-r border-white/10 min-w-[90px] relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                        <span className="text-[0.6rem] font-black text-white/70 uppercase tracking-widest leading-none mb-1">
                            {periodLabel}
                        </span>
                        <span className="text-lg font-mono font-black text-white leading-none tracking-wider text-glow-white">
                            {match.period === 'Pênaltis' || match.period === 'Sel. Batedores' ? '--:--' : formatTime(localSeconds)}
                        </span>
                    </div>

                    {/* Home Team */}
                    <div className="flex items-center gap-4 px-5 border-r border-white/5 bg-white/[0.02]">
                        <div className="flex flex-col items-end">
                            <span className="text-[0.85rem] font-black text-white uppercase truncate max-w-[140px] leading-none tracking-wide">
                                 {homeTeam.name}
                            </span>
                        </div>
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-primary/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                            <TeamLogo src={homeTeam.logo} size={32} className="relative z-10" />
                        </div>
                        <div className="flex items-center justify-center w-12 h-full bg-primary/20 border-x border-white/5">
                            <span className="text-2xl font-black text-primary text-glow-primary">
                                {match.homeScore}
                            </span>
                        </div>
                    </div>

                    {/* Away Team */}
                    <div className="flex items-center gap-4 px-5 bg-white/[0.02]">
                        <div className="flex items-center justify-center w-12 h-full bg-accent/20 border-x border-white/5">
                            <span className="text-2xl font-black text-accent text-glow-accent">
                                {match.awayScore}
                            </span>
                        </div>
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-accent/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                            <TeamLogo src={awayTeam.logo} size={32} className="relative z-10" />
                        </div>
                        <div className="flex flex-col items-start">
                            <span className="text-[0.85rem] font-black text-white uppercase truncate max-w-[140px] leading-none tracking-wide">
                                {awayTeam.name}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Extra Info Row (Stays below primary scoreboard) */}
                <div className="flex flex-col gap-1 w-full animate-fade-in delay-200">
                    {/* Extra Time / Overtime Info */}
                    {(match.extraTime || 0) > 0 && match.period !== 'Pênaltis' && !isBasket && (
                        <div className="bg-danger px-3 py-1 rounded-lg text-[0.65rem] font-black text-white shadow-lg animate-pulse border border-white/10 flex items-center gap-2 self-start mt-1">
                            <span className="w-1.5 h-1.5 bg-white rounded-full" />
                            +{match.extraTime} ACRÉSCIMO
                        </div>
                    )}

                    {/* Detailed Penalty Shootout Panel (Soccer Only) */}
                    {(match.period === 'Pênaltis' || (match.period === 'Finalizado' && shootoutEvents.length > 0)) && !isBasket && (
                        <div className="mt-2 flex flex-col gap-1">
                            <div className="bg-black/85 backdrop-blur-xl p-3 px-4 rounded-2xl border border-white/10 shadow-2xl min-w-[320px]">
                                <div className="flex flex-col gap-3">
                                    {/* Home Shots */}
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-2 flex-1">
                                            <TeamLogo src={homeTeam.logo} size={18} />
                                            <span className="text-[0.6rem] font-black text-white/50 uppercase tracking-widest truncate">{homeTeam.name}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 flex-none">
                                            {[...Array(Math.max(5, homeShootout.length))].map((_, i) => (
                                                <div key={`h-${i}`} 
                                                    className={`w-3.5 h-3.5 rounded-full border border-white/10 flex items-center justify-center transition-all duration-500 ${
                                                        !homeShootout[i] ? 'bg-white/5' : 
                                                        homeShootout[i].type === 'penalty_shootout_goal' ? 'bg-accent shadow-[0_0_12px_rgba(16,185,129,0.5)] border-accent' : 
                                                        'bg-danger shadow-[0_0_12px_rgba(239,68,68,0.5)] border-danger'
                                                    }`}
                                                >
                                                    {homeShootout[i] && (
                                                        <span className="text-[0.4rem] font-black text-white uppercase">
                                                            {homeShootout[i].type === 'penalty_shootout_goal' ? 'G' : 'X'}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="h-px bg-white/5" />

                                    {/* Away Shots */}
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-2 flex-1 border-white/5">
                                            <TeamLogo src={awayTeam.logo} size={18} />
                                            <span className="text-[0.6rem] font-black text-white/50 uppercase tracking-widest truncate">{awayTeam.name}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 flex-none">
                                            {[...Array(Math.max(5, awayShootout.length))].map((_, i) => (
                                                <div key={`a-${i}`} 
                                                    className={`w-3.5 h-3.5 rounded-full border border-white/10 flex items-center justify-center transition-all duration-500 ${
                                                        !awayShootout[i] ? 'bg-white/5' : 
                                                        awayShootout[i].type === 'penalty_shootout_goal' ? 'bg-accent shadow-[0_0_12px_rgba(16,185,129,0.5)] border-accent' : 
                                                        'bg-danger shadow-[0_0_12px_rgba(239,68,68,0.5)] border-danger'
                                                    }`}
                                                >
                                                    {awayShootout[i] && (
                                                        <span className="text-[0.4rem] font-black text-white uppercase">
                                                            {awayShootout[i].type === 'penalty_shootout_goal' ? 'G' : 'X'}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Shootout Status Footer */}
                            <div className="self-center bg-primary/20 backdrop-blur-sm border border-primary/20 py-1 px-4 rounded-full">
                                <span className="text-[0.55rem] font-black text-primary uppercase tracking-[0.3em]">
                                    Disputa de Pênaltis
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MatchOverlay;
