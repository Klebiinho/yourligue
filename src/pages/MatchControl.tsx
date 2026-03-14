import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLeague, type MatchEvent, type Player, type Match, type Team } from '../context/LeagueContext';
import { Clock, StopCircle, Award, Settings2, XCircle, Target, Trash2, Crown, Pause, Play, AlertCircle, History, ArrowLeft, ArrowLeftRight, Check } from 'lucide-react';
import TeamLogo from '../components/TeamLogo';
import AdBanner from '../components/AdBanner';

const MatchControl = () => {
    const { matchId } = useParams<{ matchId: string }>();
    const navigate = useNavigate();
    const { league, matches, teams, endMatch, addEvent, removeEvent, updateMatch, isPublicView, isAdmin, isPlayerOnPitch } = useLeague();

    const match = matches.find((m: Match) => m.id === matchId);
    const homeTeam = teams.find((t: Team) => t.id === match?.homeTeamId);
    const awayTeam = teams.find((t: Team) => t.id === match?.awayTeamId);

    const [localSeconds, setLocalSeconds] = useState(match?.timer || 0);
    const [timerRunning, setTimerRunning] = useState(match?.status === 'live');
    const [halfLength, setHalfLength] = useState(match?.halfLength || 45);
    const [extraTime, setExtraTime] = useState(match?.extraTime || 0);
    const [period, setPeriod] = useState(match?.period || '1º Tempo');
    const [submittingPlayer, setSubmittingPlayer] = useState<{ teamId: string, playerOutId: string } | null>(null);
    const [showOverlay, setShowOverlay] = useState(true);
    const [penaltyPickers, setPenaltyPickers] = useState<{ [teamId: string]: string[] }>({});
    const [confirmedPenaltyShooters, setConfirmedPenaltyShooters] = useState<string[]>([]);
    const { startMatch, pauseMatch } = useLeague();

    useEffect(() => {
        setShowOverlay(true);
    }, [period]);

    // Sincronizar estados locais com dados do banco (Realtime)
    useEffect(() => {
        if (match) {
            setHalfLength(match.halfLength || 45);
            setExtraTime(match.extraTime || 0);
            setPeriod(match.period || '1º Tempo');
        }
    }, [match?.halfLength, match?.extraTime, match?.period]);


    const getPlayerStatus = (playerId: string) => {
        const playerEvents = match?.events.filter((e: MatchEvent) => e.playerId === playerId) || [];
        const yellowCards = playerEvents.filter((e: MatchEvent) => e.type === 'yellow_card').length;
        const hasDirectRed = playerEvents.some((e: MatchEvent) => e.type === 'red_card');
        const isRedCarded = hasDirectRed || yellowCards >= 2;
        return { isRedCarded, yellowCards, hasDirectRed };
    };

    const handleUndoLastCard = (playerId: string) => {
        const playerEvents = match?.events.filter((e: MatchEvent) => e.playerId === playerId) || [];
        const lastCardEvent = [...playerEvents].reverse().find((e: MatchEvent) => e.type === 'yellow_card' || e.type === 'red_card');
        if (lastCardEvent && matchId) removeEvent(matchId, lastCardEvent.id);
    };

    const handleSaveTimeSettings = () => {
        if (matchId) updateMatch(matchId, { halfLength, extraTime, period });
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

    const handleToggleTimer = async () => {
        if (!matchId) return;
        if (timerRunning) {
            await pauseMatch(matchId, localSeconds);
        } else {
            await startMatch(matchId, localSeconds);
        }
    };

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

        if (period === '1º Tempo') {
            if (window.confirm('Encerrar 1º tempo e iniciar o Intervalo?')) {
                setTimerRunning(false);
                handlePeriodChange('Intervalo');
            }
            return;
        }

        if (period === 'Intervalo') {
            if (window.confirm('Iniciar o 2º tempo agora?')) {
                const startTime = (match?.halfLength || 45) * 60;
                handlePeriodChange('2º Tempo');
                setTimerRunning(true);
                startMatch(matchId, startTime);
            }
            return;
        }

        if (period === '2º Tempo' && match.homeScore === match.awayScore) {
            if (league?.hasOvertime) {
                if (window.confirm('A partida terminou empatada. Deseja iniciar a Prorrogação?')) {
                    setTimerRunning(false);
                    handlePeriodChange('Prorrogação');
                    return;
                }
            } else {
                if (window.confirm('A partida terminou empatada. Deseja iniciar a disputa de Pênaltis?')) {
                    setTimerRunning(false);
                    handlePeriodChange('Pênaltis');
                    return;
                }
            }
        }

        if (period === 'Prorrogação' && match.homeScore === match.awayScore) {
            if (window.confirm('O empate persiste. Deseja iniciar a disputa de Pênaltis?')) {
                setTimerRunning(false);
                handlePeriodChange('Pênaltis');
                return;
            }
        }

        if (window.confirm('Deseja realmente finalizar a partida definitivamente?')) {
            setTimerRunning(false);
            endMatch(matchId, localSeconds);
            navigate('/');
        }
    };

    const handleGol = (teamId: string, playerId: string) => { if (matchId && match?.status === 'live' && period !== 'Intervalo') addEvent(matchId, { type: 'goal', teamId, playerId, minute: currentMinute }); };
    const handleAssist = (teamId: string, playerId: string) => { if (matchId && match?.status === 'live' && period !== 'Intervalo') addEvent(matchId, { type: 'assist', teamId, playerId, minute: currentMinute }); };
    const handleGolContra = (teamId: string, playerId: string) => { if (matchId && match?.status === 'live' && period !== 'Intervalo') addEvent(matchId, { type: 'own_goal', teamId, playerId, minute: currentMinute }); };
    const handleCartao = (teamId: string, playerId: string, type: 'yellow_card' | 'red_card') => { if (matchId && match?.status === 'live' && period !== 'Intervalo') addEvent(matchId, { type, teamId, playerId, minute: currentMinute }); };
    const handlePeriodChange = async (newPeriod: string) => {
        if (!matchId || !match) return;
        
        let newTimer = localSeconds;
        let newStatus = match.status;

        // Real-time functional logic
        if (newPeriod === '1º Tempo' && localSeconds > 60) {
            if (window.confirm('Deseja zerar o cronômetro para o início do 1º tempo?')) {
                newTimer = 0;
            }
        } else if (newPeriod === 'Intervalo') {
            newStatus = 'scheduled'; // Auto-pause at halftime
        } else if (newPeriod === '2º Tempo' && localSeconds < (match.halfLength || 45) * 60) {
            newTimer = (match.halfLength || 45) * 60;
        } else if (newPeriod === 'Prorrogação' && localSeconds < (match.halfLength || 45) * 120) {
            newTimer = (match.halfLength || 45) * 120;
        } else if (newPeriod === 'Pênaltis') {
            newStatus = 'scheduled'; // Stop main clock for penalties
        }

        setPeriod(newPeriod);
        setLocalSeconds(newTimer);
        await updateMatch(matchId, { period: newPeriod, status: newStatus, timer: newTimer });
    };

    const handleSubstitution = (teamId: string, playerInId: string, playerOutId: string) => {
        if (matchId && (match?.status === 'live' || period === 'Intervalo')) {
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
        const allSelected = (penaltyPickers[homeTeam.id] || []).concat(penaltyPickers[awayTeam.id] || []);
        if (allSelected.length === 0) {
            alert('Selecione os batedores antes de confirmar!');
            return;
        }
        setConfirmedPenaltyShooters(allSelected);
    };


    return (
        <div className="animate-fade-in relative pb-10">
            {isPublicView && <AdBanner position="top" />}

            {isPublicView && period === 'Intervalo' && (
                <AdBanner position="halftime" className="z-[60]" />
            )}

            {isPublicView && (period === 'Intervalo' || match.status === 'scheduled') && showOverlay && (
                <AdBanner position="overlay" onClose={() => setShowOverlay(false)} />
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
                            <span className="text-primary drop-shadow-[0_0_20px_rgba(109,40,217,0.5)]">{match.homeScore}</span>
                            <span className="text-slate-700 text-xl sm:text-3xl">–</span>
                            <span className="text-accent drop-shadow-[0_0_20px_rgba(16,185,129,0.4)]">{match.awayScore}</span>
                        </div>
                        <div className="bg-black/50 px-4 py-1.5 rounded-xl flex items-center gap-2 border border-white/[0.05] shadow-inner">
                            <div className={`w-1.5 h-1.5 rounded-full ${timerRunning ? 'bg-danger animate-pulse shadow-[0_0_8px_rgba(239,68,68,1)]' : 'bg-slate-700'}`} />
                            <span className="font-mono text-base sm:text-xl font-black text-white tracking-[0.1em]">
                                {period === 'Pênaltis' ? 'PEN' : formatTime(localSeconds)}
                            </span>
                            {(match.extraTime || 0) > 0 && (
                                <span className="text-danger font-black text-xs sm:text-sm animate-pulse ml-1">+{match.extraTime}</span>
                            )}
                        </div>
                        <span className="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest">{period}</span>
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
                                 period === 'Intervalo' ? 'Iniciar 2º Tempo' : 
                                 (period === '2º Tempo' && match.homeScore === match.awayScore) ? (league?.hasOvertime ? 'Ir p/ Prorrogação' : 'Ir p/ Pênaltis') :
                                 (period === 'Prorrogação' && match.homeScore === match.awayScore) ? 'Ir p/ Pênaltis' :
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
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {/* Team Player Controls */}
                {[homeTeam, awayTeam].map((team, idx) => (
                    <section key={team.id} className="glass-panel p-4 md:p-6">
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
                                const isPenaltySelection = period === 'Pênaltis' && !confirmedPenaltyShooters.includes(team.players[0]?.id) && isAdmin && !isPublicView;

                                if (isPenaltySelection) {
                                    return (
                                        <div className="space-y-4">
                                            <div className="bg-primary/10 border border-primary/20 p-4 rounded-2xl mb-4">
                                                <h3 className="text-[0.65rem] font-black text-primary uppercase tracking-[0.2em] mb-1">Seleção de Batedores</h3>
                                                <p className="text-[0.6rem] text-slate-500 font-bold uppercase tracking-widest">Selecione os jogadores elegíveis para as cobranças</p>
                                            </div>
                                            <div className="grid grid-cols-1 gap-2">
                                                {team.players.map((player: Player) => {
                                                    const { isRedCarded } = getPlayerStatus(player.id);
                                                    // const subOuts = match.events.filter(e => e.type === 'substitution' && e.playerOutId === player.id).length;
                                                    // const subIns = match.events.filter(e => e.type === 'substitution' && e.playerId === player.id).length;
                                                    // const wasSubbedOut = subOuts > subIns;
                                                    const onPitch = isPlayerOnPitch(match, player.id);
                                                    
                                                    // REGRA: Expulsos NUNCA batem. 
                                                    // Se Retorno Proibido: Apenas quem terminou em campo bate.
                                                    // Se Retorno Permitido: Todos (exceto expulsos) podem bater.
                                                    const isEligible = !isRedCarded && (league?.allowSubstitutionReturn || onPitch);
                                                    const isSelected = (penaltyPickers[team.id] || []).includes(player.id);

                                                    return (
                                                        <button 
                                                            key={player.id} 
                                                            disabled={!isEligible}
                                                            onClick={() => togglePenaltyShooter(player.id, team.id)}
                                                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left group ${
                                                                isSelected 
                                                                ? 'bg-primary border-primary text-white shadow-lg' 
                                                                : isEligible 
                                                                    ? 'bg-white/5 border-white/10 hover:border-white/20' 
                                                                    : 'bg-danger/5 border-danger/10 opacity-30 cursor-not-allowed'
                                                            }`}
                                                        >
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${isSelected ? 'bg-white/20' : 'bg-black/20 group-hover:bg-black/40'}`}>
                                                                #{player.number}
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="text-[0.7rem] font-black uppercase tracking-tight">{player.name}</div>
                                                                {!isEligible && (
                                                                    <div className="text-[0.5rem] font-black uppercase tracking-tighter opacity-60">
                                                                        {isRedCarded ? 'Expulso' : 'Substituído'}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {isSelected && <Check size={16} strokeWidth={4} />}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            {idx === 1 && (
                                                <button 
                                                    onClick={confirmShooters}
                                                    className="w-full mt-6 py-4 rounded-2xl bg-accent text-white font-black text-[0.7rem] uppercase tracking-[0.2em] shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <Check size={18} strokeWidth={3} /> Confirmar Batedores e Iniciar
                                                </button>
                                            )}
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
                                                    const { yellowCards } = getPlayerStatus(player.id);
                                                    return (
                                                        <div key={player.id} className="flex items-center gap-2 p-3 rounded-xl border bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.05] transition-all duration-300">
                                                            <div className="relative flex-none">
                                                                <TeamLogo src={player.photo} size={36} />
                                                                {player.isCaptain && <Crown size={12} className="absolute -top-1 -right-1 text-warning fill-warning/20" />}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-black text-white text-[0.7rem] truncate font-outfit uppercase leading-tight">
                                                                    #{player.number} {player.name}
                                                                </h4>
                                                                <div className="flex items-center gap-1 mt-1 h-3.5">
                                                                    {Array.from({ length: yellowCards }).map((_, i) => (
                                                                        <div key={i} className="w-2 h-3.5 bg-warning rounded-[2px] border border-black/20 shadow-sm" />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                {!isPublicView && isAdmin && (
                                                                    <div className="flex items-center gap-1">
                                                                        <button disabled={match.status !== 'live' || period === 'Intervalo'} onClick={() => handleGol(team.id, player.id)} 
                                                                            className={`w-8 h-8 flex-none flex items-center justify-center rounded-lg bg-accent/15 text-accent hover:bg-accent hover:text-white transition-all active:scale-90 disabled:cursor-not-allowed disabled:opacity-30`} title="Gol"><Target size={14} /></button>
                                                                        <button disabled={match.status !== 'live' || period === 'Intervalo'} onClick={() => handleAssist(team.id, player.id)} 
                                                                            className={`w-8 h-8 flex-none flex items-center justify-center rounded-lg bg-warning/15 text-warning hover:bg-warning hover:text-white transition-all active:scale-90 disabled:cursor-not-allowed disabled:opacity-30`} title="Assistência"><Award size={14} /></button>
                                                                        <button disabled={match.status !== 'live' || period === 'Intervalo'} onClick={() => handleGolContra(team.id, player.id)} 
                                                                            className={`w-8 h-8 flex-none flex items-center justify-center rounded-lg bg-danger/10 text-danger hover:bg-danger hover:text-white transition-all active:scale-90 disabled:cursor-not-allowed disabled:opacity-30`} title="Gol Contra"><XCircle size={14} /></button>
                                                                        
                                                                        <button disabled={match.status !== 'live' && period !== 'Intervalo'} onClick={() => setSubmittingPlayer({ teamId: team.id, playerOutId: player.id })} 
                                                                            className={`w-8 h-8 flex-none flex items-center justify-center rounded-lg bg-primary/15 text-primary hover:bg-primary hover:text-white transition-all active:scale-90 disabled:cursor-not-allowed disabled:opacity-30`} title="Substituir"><ArrowLeftRight size={14} /></button>
                                                                        
                                                                        <button disabled={match.status !== 'live' || period === 'Intervalo'} onClick={() => handleCartao(team.id, player.id, 'yellow_card')} 
                                                                            className={`w-8 h-8 flex-none flex items-center justify-center rounded-lg bg-white/5 border border-warning/20 hover:bg-warning hover:text-white transition-all active:scale-90 text-xs disabled:cursor-not-allowed disabled:opacity-30`} title="Amarelo">🟨</button>
                                                                        <button disabled={match.status !== 'live' || period === 'Intervalo'} onClick={() => handleCartao(team.id, player.id, 'red_card')} 
                                                                            className={`w-8 h-8 flex-none flex items-center justify-center rounded-lg bg-white/5 border border-danger/20 hover:bg-danger hover:text-white transition-all active:scale-90 text-xs disabled:cursor-not-allowed disabled:opacity-30`} title="Vermelho">🟥</button>
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
                                                    <div key={player.id} className={`flex items-center gap-2 p-3 rounded-xl border transition-all duration-300 ${isRedCarded ? 'bg-danger/10 border-danger/20 opacity-40' : wasSubbedOut ? 'bg-primary/5 border-primary/10 opacity-70' : 'bg-white/[0.01] border-white/[0.02] opacity-50'}`}>
                                                        <div className="relative flex-none">
                                                            <TeamLogo src={player.photo} size={36} />
                                                            {isRedCarded && <XCircle size={12} className="absolute -top-1 -right-1 text-danger fill-danger/20" />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-black text-white text-[0.7rem] truncate font-outfit uppercase leading-tight">
                                                                #{player.number} {player.name}
                                                            </h4>
                                                            <div className="flex items-center gap-1 mt-1 h-3.5">
                                                                {isRedCarded ? (
                                                                    <span className="text-[0.45rem] font-black text-danger uppercase tracking-tighter">Expulso</span>
                                                                ) : wasSubbedOut ? (
                                                                    <span className="text-[0.45rem] font-black text-primary uppercase tracking-tighter">Substituído</span>
                                                                ) : (
                                                                    <span className="text-[0.45rem] font-black text-slate-600 uppercase tracking-tighter">No Banco</span>
                                                                )}
                                                                {Array.from({ length: yellowCards }).map((_, i) => (
                                                                    <div key={i} className="w-2 h-3.5 bg-warning rounded-[2px] border border-black/20" />
                                                                ))}
                                                            </div>
                                                        </div>
                                                        {!isPublicView && isAdmin && (isRedCarded || yellowCards > 0) && (
                                                            <button disabled={match.status !== 'live'} onClick={() => handleUndoLastCard(player.id)} className={`w-8 h-8 flex-none flex items-center justify-center rounded-lg bg-white/5 text-warning/50 hover:text-warning transition-all ${match.status !== 'live' ? 'opacity-30 cursor-not-allowed' : ''}`} title="Anular Cartão">
                                                                <Trash2 size={12} />
                                                            </button>
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

                {/* Right: Settings + Event Log */}
                <div className="space-y-4 md:space-y-6 lg:col-span-2 xl:col-span-1">
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
                                        {['1º Tempo', 'Intervalo', '2º Tempo', 'Prorrogação', 'Pênaltis'].map(p => (
                                            <button key={p} onClick={() => handlePeriodChange(p)}
                                                className={`py-2 px-1 rounded-lg text-[0.6rem] font-black uppercase tracking-tight transition-all border ${period === p ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 border-white/10 text-slate-500 hover:bg-white/10'}`}>
                                                {p === 'Prorrogação' ? 'Prorrog.' : p}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[0.6rem] font-black text-slate-600 uppercase tracking-widest ml-1">Duração (min)</label>
                                    <input type="number" value={halfLength} onChange={e => setHalfLength(parseInt(e.target.value))}
                                        className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm font-bold focus:border-primary outline-none h-10" />
                                </div>
                            </div>
                            <div className="space-y-1.5 mb-5">
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
                            <button onClick={handleSaveTimeSettings} className="w-full bg-white/5 border border-white/10 text-white font-black py-3 rounded-xl uppercase tracking-widest text-[0.65rem] hover:bg-white/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                                <Clock size={14} strokeWidth={3} /> Salvar Cronograma
                            </button>
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
                                        own_goal: 'text-danger',
                                        assist: 'text-warning',
                                        yellow_card: 'text-warning',
                                        red_card: 'text-danger',
                                        substitution: 'text-primary',
                                    };
                                    const labelMap: Record<string, string> = {
                                        goal: '⚽ Gol', penalty_goal: '⚽ Pênalti', own_goal: '🔴 Gol Contra',
                                        yellow_card: '🟨 Amarelo', red_card: '🟥 Vermelho', assist: '🅰️ Assistência',
                                        substitution: '🔄 Subst.',
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
                                            {!isPublicView && isAdmin && (
                                                <button onClick={() => removeEvent(matchId!, event.id)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-danger/10 text-danger hover:bg-danger hover:text-white transition-all sm:opacity-0 sm:group-hover:opacity-100 flex-none border border-danger/20">
                                                    <XCircle size={14} />
                                                </button>
                                            )}
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

                                            // Determine if player is currently on the pitch
                                            if (isPlayerOnPitch(match, p.id)) return false;

                                            // If return is EXPLICITLY forbidden, once subbed out, they stay out
                                            // We use explicit check against false to allow return if setting is missing or true
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
        </div>
    );
};

export default MatchControl;
