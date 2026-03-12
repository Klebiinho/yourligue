import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLeague, type MatchEvent, type Player, type Match, type Team } from '../context/LeagueContext';
import { Clock, StopCircle, Award, Settings2, XCircle, Target, Trash2, Crown, Pause, Play, AlertCircle, History, Youtube } from 'lucide-react';
import TeamLogo from '../components/TeamLogo';

const MatchControl = () => {
    const { matchId } = useParams<{ matchId: string }>();
    const navigate = useNavigate();
    const { matches, teams, endMatch, addEvent, removeEvent, updateTimer, updateMatch } = useLeague();

    const match = matches.find((m: Match) => m.id === matchId);
    const homeTeam = teams.find((t: Team) => t.id === match?.homeTeamId);
    const awayTeam = teams.find((t: Team) => t.id === match?.awayTeamId);

    const [timerRunning, setTimerRunning] = useState(match?.status === 'live');
    const [localSeconds, setLocalSeconds] = useState(match?.timer || 0);
    const [halfLength, setHalfLength] = useState(match?.halfLength || 45);
    const [extraTime, setExtraTime] = useState(match?.extraTime || 0);
    const [period, setPeriod] = useState(match?.period || '1º Tempo');

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
        if (matchId) {
            updateMatch(matchId, { halfLength, extraTime, period });
        }
    };

    useEffect(() => {
        let interval: number;
        if (timerRunning && match?.status === 'live') {
            interval = window.setInterval(() => {
                setLocalSeconds((s: number) => {
                    let baseLimit = halfLength;
                    if (period === '2º Tempo') baseLimit = halfLength * 2;
                    if (period === 'Prorrogação') baseLimit = halfLength * 2 + 30;
                    if (period === 'Intervalo' || period === 'Pênaltis') return s + 1;
                    const limitInSeconds = (baseLimit + extraTime) * 60;
                    if (s >= limitInSeconds) { setTimerRunning(false); return s; }
                    return s + 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timerRunning, match?.status, halfLength, extraTime, period]);

    useEffect(() => {
        if (match?.status === 'live' && localSeconds % 5 === 0 && matchId) {
            updateTimer(matchId, localSeconds);
        }
    }, [localSeconds, matchId, match?.status, updateTimer]);

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
        if (matchId && window.confirm('Deseja realmente finalizar a partida?')) {
            setTimerRunning(false);
            endMatch(matchId);
            navigate('/');
        }
    };

    const handleGol = (teamId: string, playerId: string) => { if (matchId) addEvent(matchId, { type: 'goal', teamId, playerId, minute: currentMinute }); };
    const handleAssist = (teamId: string, playerId: string) => { if (matchId) addEvent(matchId, { type: 'assist', teamId, playerId, minute: currentMinute }); };
    const handleGolContra = (teamId: string, playerId: string) => { if (matchId) addEvent(matchId, { type: 'own_goal', teamId, playerId, minute: currentMinute }); };
    const handleCartao = (teamId: string, playerId: string, type: 'yellow_card' | 'red_card') => { if (matchId) addEvent(matchId, { type, teamId, playerId, minute: currentMinute }); };

    return (
        <div className="animate-fade-in pb-24 md:pb-8 p-4 md:p-0">
            {/* Scoreboard Header - Sticky with Glass Background */}
            <div className="glass-panel sticky top-1 z-40 p-5 md:p-8 mb-8 shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
                    <Youtube size={120} strokeWidth={1} className="text-danger" />
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                    {/* Home Team */}
                    <div className="flex items-center gap-4 flex-1 justify-end w-full md:w-auto">
                        <div className="text-right hidden sm:block">
                            <h2 className="text-lg md:text-2xl font-black text-white font-outfit uppercase truncate max-w-[140px] leading-tight">{homeTeam.name}</h2>
                            <span className="text-[0.6rem] font-black text-primary tracking-widest uppercase">Mandante</span>
                        </div>
                        <TeamLogo src={homeTeam.logo} size={64} />
                    </div>

                    {/* Central Score & Timer */}
                    <div className="flex flex-col items-center gap-1 md:gap-2 px-6">
                        <div className="flex items-center gap-6 font-outfit font-black text-4xl md:text-7xl">
                            <span className="text-primary drop-shadow-[0_0_20px_rgba(109,40,217,0.4)] transition-all transform hover:scale-110">{match.homeScore}</span>
                            <span className="text-slate-700 font-bold select-none text-2xl md:text-4xl">X</span>
                            <span className="text-accent drop-shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all transform hover:scale-110">{match.awayScore}</span>
                        </div>
                        <div className="bg-black/40 px-5 py-2 rounded-2xl flex items-center gap-3 border border-white/5 shadow-inner">
                            <div className={`w-2 h-2 rounded-full ${timerRunning ? 'bg-danger animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-slate-600'}`} />
                            <span className="font-mono text-xl md:text-2xl font-black text-white tracking-[0.1em]">{formatTime(localSeconds)}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.2em]">{period} {extraTime > 0 && <span className="text-danger">+{extraTime}'</span>}</span>
                        </div>
                    </div>

                    {/* Away Team */}
                    <div className="flex items-center gap-4 flex-1 justify-start w-full md:w-auto">
                        <TeamLogo src={awayTeam.logo} size={64} />
                        <div className="text-left hidden sm:block">
                            <h2 className="text-lg md:text-2xl font-black text-white font-outfit uppercase truncate max-w-[140px] leading-tight">{awayTeam.name}</h2>
                            <span className="text-[0.6rem] font-black text-slate-500 tracking-widest uppercase">Visitante</span>
                        </div>
                    </div>
                </div>

                {/* Control Actions Row */}
                <div className="flex items-center justify-center gap-3 mt-8 border-t border-white/5 pt-6">
                    <button onClick={() => setTimerRunning(!timerRunning)}
                        className={`px-8 py-3.5 rounded-xl font-black text-[0.75rem] uppercase tracking-[0.15em] transition-all flex items-center gap-3 shadow-lg active:scale-95 ${timerRunning ? 'bg-white/5 border border-white/10 text-slate-400 hover:text-white' : 'bg-primary text-white shadow-primary/30 hover:brightness-110'
                            }`}>
                        {timerRunning ? <><Pause size={18} strokeWidth={3} /> Pausar Cronômetro</> : <><Play size={18} fill="currentColor" /> Iniciar Partida</>}
                    </button>
                    <button onClick={handleEndMatch}
                        className="px-8 py-3.5 rounded-xl bg-danger/10 border border-danger/20 text-danger font-black text-[0.75rem] uppercase tracking-[0.15em] hover:bg-danger hover:text-white transition-all shadow-lg active:scale-95 flex items-center gap-3">
                        <StopCircle size={18} strokeWidth={3} /> Finalizar Partida
                    </button>
                </div>
            </div>

            {/* Event Input Area */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8 items-start">
                {/* Team Controls */}
                {[homeTeam, awayTeam].map((team, idx) => (
                    <section key={team.id} className="xl:col-span-12 2xl:col-span-4 glass-panel p-6 md:p-8">
                        <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-5">
                            <TeamLogo src={team.logo} size={48} />
                            <div>
                                <h2 className="text-[1.15rem] font-black text-white font-outfit uppercase tracking-wider">{team.name}</h2>
                                <span className="text-[0.6rem] font-black text-slate-500 uppercase tracking-[0.2em]">{idx === 0 ? 'Gestão Mandante' : 'Gestão Visitante'}</span>
                            </div>
                            <div className={`ml-auto px-4 py-1.5 rounded-xl font-black font-outfit text-xl ${idx === 0 ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-accent'}`}>
                                {idx === 0 ? match.homeScore : match.awayScore}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 max-h-[700px] overflow-y-auto pr-1 no-scrollbar">
                            {team.players.map((player: Player) => {
                                const { isRedCarded, yellowCards } = getPlayerStatus(player.id);
                                return (
                                    <div key={player.id} className={`flex items-center gap-3 p-4 rounded-2xl border transition-all duration-300 ${isRedCarded ? 'bg-danger/10 border-danger/20 opacity-60' : 'bg-white/3 border-white/5'}`}>
                                        <div className="relative flex-none">
                                            <TeamLogo src={player.photo} size={44} />
                                            {player.isCaptain && <Crown size={14} className="absolute -top-1 -right-1 text-warning fill-warning/20 shadow-lg" />}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-black text-white text-sm truncate font-outfit uppercase tracking-wide leading-tight">#{player.number} {player.name}</h4>
                                            <div className="flex items-center gap-2 mt-1.5 h-4">
                                                {Array.from({ length: yellowCards }).map((_, i) => <div key={i} className="w-2.5 h-4 bg-warning rounded-[2px] shadow-sm transform rotate-6 border border-black/10" />)}
                                                {isRedCarded && <div className="w-2.5 h-4 bg-danger rounded-[2px] shadow-sm transform -rotate-12 border border-black/10" />}
                                                {(!pStatus.isRedCarded && pStatus.yellowCards === 0) && <span className="text-[0.6rem] font-black text-slate-600 uppercase tracking-widest">Sem punição</span>}
                                            </div>
                                        </div>

                                        <div className={`flex items-center gap-1.5 transition-all ${isRedCarded ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                                            <button onClick={() => handleGol(team.id, player.id)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-accent/20 text-accent hover:bg-accent hover:text-white transition-all shadow-lg active:scale-90" title="Gol"><Target size={16} /></button>
                                            <button onClick={() => handleAssist(team.id, player.id)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-warning/20 text-warning hover:bg-warning hover:text-white transition-all shadow-lg active:scale-90" title="Assistência"><Award size={16} /></button>
                                            <button onClick={() => handleGolContra(team.id, player.id)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-danger/10 text-danger hover:bg-danger hover:text-white transition-all shadow-lg active:scale-90" title="Gol Contra"><XCircle size={16} /></button>
                                            <button onClick={() => handleCartao(team.id, player.id, 'yellow_card')} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 text-warning border border-warning/20 hover:bg-warning hover:text-white transition-all shadow-lg active:scale-90" title="Cartão Amarelo">🟨</button>
                                            <button onClick={() => handleCartao(team.id, player.id, 'red_card')} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 text-danger border border-danger/20 hover:bg-danger hover:text-white transition-all shadow-lg active:scale-90" title="Cartão Vermelho">🟥</button>
                                        </div>

                                        {(isRedCarded || yellowCards > 0) && (
                                            <button onClick={() => handleUndoLastCard(player.id)} className="ml-1 p-2 rounded-xl bg-white/5 text-slate-500 hover:text-white transition-all" title="Desfazer cartão">
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                ))}

                {/* Match Log & Settings */}
                <div className="xl:col-span-12 2xl:col-span-4 space-y-6 md:space-y-8 h-full flex flex-col">
                    <section className="glass-panel p-6 md:p-8">
                        <h3 className="text-xl font-black text-white font-outfit uppercase tracking-widest mb-8 flex items-center gap-3">
                            <Settings2 size={20} className="text-primary" /> Painel Técnico
                        </h3>
                        <div className="grid grid-cols-2 gap-5 mb-8">
                            <div className="flex flex-col gap-2">
                                <label className="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest ml-1">Etapa Atual</label>
                                <select value={period} onChange={e => setPeriod(e.target.value)}
                                    className="bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-all font-bold appearance-none cursor-pointer">
                                    <option className="bg-bg-dark">1º Tempo</option><option className="bg-bg-dark">Intervalo</option>
                                    <option className="bg-bg-dark">2º Tempo</option><option className="bg-bg-dark">Prorrogação</option>
                                    <option className="bg-bg-dark">Pênaltis</option><option className="bg-bg-dark">Fim de Jogo</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest ml-1">Duração (min)</label>
                                <input type="number" value={halfLength} onChange={e => setHalfLength(parseInt(e.target.value))}
                                    className="bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-all font-bold" />
                            </div>
                            <div className="flex flex-col gap-2 col-span-2">
                                <label className="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest ml-1">Acréscimos (minutos)</label>
                                <input type="number" value={extraTime} onChange={e => setExtraTime(parseInt(e.target.value))}
                                    className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-4 text-white focus:border-primary outline-none transition-all font-black text-center text-xl" />
                            </div>
                        </div>
                        <button onClick={handleSaveTimeSettings} className="w-full bg-white/5 border border-white/10 text-white font-black py-4 rounded-xl uppercase tracking-widest text-[0.7rem] hover:bg-white/10 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-3">
                            <Clock size={16} strokeWidth={3} /> Atualizar Cronograma
                        </button>
                    </section>

                    <section className="glass-panel p-6 md:p-8 flex-1 flex flex-col">
                        <h3 className="text-xl font-black text-white font-outfit uppercase tracking-widest mb-8 flex items-center gap-3">
                            <History size={20} className="text-accent" /> Súmula Realtime
                        </h3>
                        <div className="flex-1 overflow-y-auto pr-2 no-scrollbar space-y-4 max-h-[850px]">
                            {match.events.length === 0 ? (
                                <div className="text-center py-20 opacity-30 flex flex-col items-center gap-4">
                                    <History size={48} strokeWidth={1} />
                                    <span className="text-[0.65rem] font-black uppercase tracking-[0.2em]">Aguardando eventos...</span>
                                </div>
                            ) : (
                                [...match.events].reverse().map((event) => {
                                    const p = [...homeTeam.players, ...awayTeam.players].find(pl => pl.id === event.playerId);
                                    const eventColor = event.type === 'goal' || event.type === 'penalty_goal' ? 'text-accent' : event.type === 'own_goal' ? 'text-danger' : 'text-warning';
                                    return (
                                        <div key={event.id} className="group p-4 rounded-2xl bg-white/3 border border-white/5 flex items-center gap-4 hover:bg-white/5 transition-all animate-slide-left">
                                            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-black/40 font-black font-outfit text-primary shadow-inner">
                                                {event.minute}'
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-outfit font-black text-white uppercase truncate text-sm">{p?.name}</span>
                                                    <span className={`text-[0.6rem] font-black uppercase tracking-tighter shadow-sm ${eventColor}`}>
                                                        {{ goal: 'GOL!', penalty_goal: 'PÊNALTI!', own_goal: 'GOL CONTRA!', yellow_card: 'CARTÃO AMARELO', red_card: 'CARTÃO VERMELHO', assist: 'ASSISTÊNCIA' }[event.type as string] || 'EVENTO'}
                                                    </span>
                                                </div>
                                                <p className="text-[0.55rem] font-bold text-slate-600 uppercase tracking-widest mt-1">
                                                    ID: {event.id.slice(0, 8)} • TIME: {teams.find(t => t.id === event.teamId)?.name}
                                                </p>
                                            </div>
                                            <button onClick={() => removeEvent(matchId!, event.id)}
                                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-danger/10 text-danger hover:bg-danger hover:text-white transition-all opacity-0 group-hover:opacity-100">
                                                <XCircle size={14} />
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default MatchControl;
