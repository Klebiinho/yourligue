import { useState, useMemo } from 'react';
import { useLeague } from '../context/LeagueContext';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Zap, Users, Clock, Play, Plus, Trash2, 
    UserPlus, ArrowRight, UserCheck, Timer, 
    Flame, Target, Settings, ChevronRight, LogIn, XCircle
} from 'lucide-react';
import TeamLogo from '../components/TeamLogo';

const PickupDashboard = () => {
    const { leagueSlug } = useParams<{ leagueSlug: string }>();
    const { 
        league, teams, matches, isAdmin,
        joinPickupQueue, leavePickupQueue, startPickupMatch, getMatchSlug
    } = useLeague();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [isStarting, setIsStarting] = useState(false);
    const [draftingA, setDraftingA] = useState<string[]>([]);
    const [draftingB, setDraftingB] = useState<string[]>([]);
    const [isSelectingFor, setIsSelectingFor] = useState<{ team: 'A' | 'B', slot: number } | null>(null);

    // Filter players by status
    const allPlayers = useMemo(() => {
        return teams.flatMap(t => t.players);
    }, [teams]);

    const queue = useMemo(() => {
        return allPlayers
            .filter(p => p.pickupStatus === 'in_queue')
            .sort((a, b) => (a.queuePosition || 0) - (b.queuePosition || 0));
    }, [allPlayers]);

    const activePlayers = useMemo(() => {
        return {
            courtA: allPlayers.filter(p => p.pickupStatus === 'in_court_a'),
            courtB: allPlayers.filter(p => p.pickupStatus === 'in_court_b')
        };
    }, [allPlayers]);

    const availablePlayers = useMemo(() => {
        return allPlayers.filter(p => p.pickupStatus === 'available' || !p.pickupStatus);
    }, [allPlayers]);

    const liveMatch = useMemo(() => {
        return matches.find(m => m.status === 'live');
    }, [matches]);

    const currentPlayer = useMemo(() => {
        if (!user) return null;
        return allPlayers.find(p => p.id === user.id || p.name === user.user_metadata?.name);
    }, [user, allPlayers]);

    const handleStartMatch = async () => {
        if (isStarting) return;
        
        if (draftingA.length === 0 || draftingB.length === 0) {
            alert("⚠️ Selecione pelo menos um jogador para cada time!");
            return;
        }

        setIsStarting(true);
        try {
            const match = await startPickupMatch(draftingA.filter(Boolean), draftingB.filter(Boolean));
            if (match) {
                if (isAdmin) {
                    const matchSlug = getMatchSlug(match);
                    navigate(`/${leagueSlug}/${matchSlug}/match`);
                }
                setDraftingA([]);
                setDraftingB([]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsStarting(false);
        }
    };

    const format = league?.pickupConfig?.gameFormat || '3x3';
    const numPerTeam = parseInt(format.split('x')[0]) || 3;

    const selectPlayer = (playerId: string) => {
        if (!isSelectingFor) return;
        
        const { team, slot } = isSelectingFor;
        const setDraft = team === 'A' ? setDraftingA : setDraftingB;
        const currentDraft = team === 'A' ? draftingA : draftingB;
        
        // Remove from other draft if exists
        if (team === 'A') {
            setDraftingB(prev => prev.filter(id => id !== playerId));
        } else {
            setDraftingA(prev => prev.filter(id => id !== playerId));
        }

        const newDraft = [...currentDraft];
        newDraft[slot] = playerId;
        setDraft(newDraft);
        setIsSelectingFor(null);
    };

    const removePlayerFromDraft = (team: 'A' | 'B', playerId: string) => {
        if (team === 'A') setDraftingA(prev => prev.filter(id => id !== playerId));
        else setDraftingB(prev => prev.filter(id => id !== playerId));
    };

    if (!league?.isPickupMode) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <Zap size={60} className="text-slate-700 animate-pulse" />
                <h2 className="text-2xl font-black text-white font-outfit uppercase">Modo Rachão Desativado</h2>
                <p className="text-slate-500 max-w-sm">O administrador ainda não ativou o modo pickup para esta liga.</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in pb-20">
            {/* Header / Stats Overlay */}
            <header className="relative mb-10 rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-amber-600 to-orange-700 p-8 md:p-12 shadow-2xl shadow-orange-900/20">
                <div className="absolute top-0 right-0 p-8 opacity-20 transform -rotate-12 translate-x-10 -translate-y-10">
                    <Flame size={300} strokeWidth={1} />
                </div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-center md:text-left space-y-3">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/30 backdrop-blur-md border border-white/10">
                            <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                            <span className="text-[0.6rem] font-black text-amber-400 uppercase tracking-widest">Quadra Ativa • {league.pickupConfig?.gameFormat || '3x3'}</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-outfit font-black text-white uppercase tracking-tight leading-none drop-shadow-xl">
                            Rachão Automático
                        </h1>
                        <p className="text-white/70 font-bold uppercase text-xs tracking-widest flex items-center justify-center md:justify-start gap-3">
                            <Clock size={16} /> {league.pickupConfig?.timeLimit || 10} Min por partida • {league.pickupConfig?.maxPoints || 21} Pontos Limite
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 w-full md:w-auto">
                        {!user ? (
                            <button onClick={() => navigate('/auth')} className="px-8 py-5 rounded-2xl bg-white text-orange-600 font-black text-sm uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
                                <LogIn size={20} strokeWidth={3} /> Entrar com minha Conta
                            </button>
                        ) : currentPlayer ? (
                            currentPlayer.pickupStatus === 'in_queue' ? (
                                <button onClick={() => leavePickupQueue(currentPlayer.id)} className="px-8 py-5 rounded-2xl bg-danger text-white font-black text-sm uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
                                    <Trash2 size={20} strokeWidth={3} /> Sair da Fila (Pos. {currentPlayer.queuePosition})
                                </button>
                            ) : currentPlayer.pickupStatus === 'available' ? (
                                <button onClick={() => joinPickupQueue(currentPlayer.id)} className="px-8 py-5 rounded-2xl bg-white text-orange-600 font-black text-sm uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
                                    <UserPlus size={20} strokeWidth={3} /> Entrar na Fila
                                </button>
                            ) : null
                        ) : (
                            <div className="px-6 py-4 rounded-2xl bg-black/20 border border-white/10 text-white/60 text-[0.65rem] font-black uppercase text-center max-w-xs">
                                Fale com o ADM para ser cadastrado como jogador e participar.
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 pt-8 border-t border-white/10">
                    <div className="space-y-1">
                        <p className="text-white/40 text-[0.55rem] font-black uppercase tracking-widest">Na Fila</p>
                        <p className="text-2xl font-black text-white">{queue.length} <span className="text-xs text-white/60">Atletas</span></p>
                    </div>
                    <div className="space-y-1 border-l border-white/5 pl-4 md:pl-8">
                        <p className="text-white/40 text-[0.55rem] font-black uppercase tracking-widest">Jogando</p>
                        <p className="text-2xl font-black text-white">{activePlayers.courtA.length + activePlayers.courtB.length} <span className="text-xs text-white/60">Em Quadra</span></p>
                    </div>
                    <div className="space-y-1 border-l border-white/5 pl-4 md:pl-8">
                        <p className="text-white/40 text-[0.55rem] font-black uppercase tracking-widest">Disponíveis</p>
                        <p className="text-2xl font-black text-white">{availablePlayers.length} <span className="text-xs text-white/60">Buscando Jogo</span></p>
                    </div>
                    <div className="space-y-1 border-l border-white/5 pl-4 md:pl-8">
                        <p className="text-white/40 text-[0.55rem] font-black uppercase tracking-widest">Tipo de Rotação</p>
                        <p className="text-base font-black text-white uppercase truncate">{league.pickupConfig?.rotationType === 'winner_stays' ? 'King of Court' : 'Geral'}</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 space-y-8">
                    <div className={`glass-panel p-8 relative overflow-hidden transition-all duration-700 ${liveMatch ? 'border-amber-500/30' : 'border-white/5'}`}>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-black text-white font-outfit uppercase tracking-tight flex items-center gap-3">
                                {liveMatch ? <Zap size={24} className="text-amber-500 fill-amber-500/20" /> : <Timer size={24} className="text-slate-600" />}
                                STATUS DA QUADRA
                            </h2>
                            {liveMatch && (
                                <button onClick={() => navigate(`/${leagueSlug}/${getMatchSlug(liveMatch)}/match`)} className="px-4 py-2 rounded-xl bg-amber-500 text-white font-black text-[0.65rem] uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all flex items-center gap-2">
                                    Placar Ao Vivo <ArrowRight size={14} />
                                </button>
                            )}
                        </div>

                        {liveMatch ? (
                            <div className="flex flex-col md:flex-row items-center justify-center gap-12 py-6">
                                {/* Team A */}
                                <div className="flex flex-col items-center gap-6 w-full md:w-64">
                                    <div className="flex items-center flex-col gap-2">
                                        <p className="text-sm font-black text-amber-500 uppercase tracking-[0.2em] animate-pulse">TIME A</p>
                                        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-white font-outfit font-black text-4xl shadow-2xl shadow-orange-500/40 ring-4 ring-white/10">
                                            {liveMatch.homeScore}
                                        </div>
                                    </div>
                                    <div className="w-full space-y-2">
                                        {activePlayers.courtA.map(p => (
                                            <div key={p.id} className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5">
                                                <TeamLogo src={p.photo} size={32} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[0.65rem] font-black text-white truncate uppercase">{p.name}</p>
                                                    <p className="text-[0.5rem] text-slate-500 font-bold uppercase">{p.position || 'ALA'}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col items-center gap-4">
                                    <div className="px-4 py-1.5 rounded-full bg-slate-800/80 backdrop-blur-md border border-white/10 text-[0.6rem] font-black text-slate-400 tracking-widest">VERSUS</div>
                                    <div className="w-px h-32 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
                                </div>

                                {/* Team B */}
                                <div className="flex flex-col items-center gap-6 w-full md:w-64">
                                    <div className="flex items-center flex-col gap-2">
                                        <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">TIME B</p>
                                        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-outfit font-black text-4xl shadow-2xl shadow-black/40 border-2 border-white/10 ring-4 ring-white/5">
                                            {liveMatch.awayScore}
                                        </div>
                                    </div>
                                    <div className="w-full space-y-2">
                                        {activePlayers.courtB.map(p => (
                                            <div key={p.id} className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5">
                                                <TeamLogo src={p.photo} size={32} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[0.65rem] font-black text-white truncate uppercase">{p.name}</p>
                                                    <p className="text-[0.5rem] text-slate-500 font-bold uppercase">{p.position || 'ALA'}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="py-6 space-y-8">
                                <div className="flex flex-col md:flex-row items-start justify-center gap-8">
                                    {/* Draft Team A */}
                                    <div className="w-full md:w-64 space-y-4">
                                        <p className="text-xs font-black text-amber-500 uppercase tracking-widest text-center">Escalação Time A</p>
                                        <div className="grid grid-cols-1 gap-2">
                                            {Array.from({ length: numPerTeam }).map((_, i) => {
                                                const pId = draftingA[i];
                                                const p = allPlayers.find(x => x.id === pId);
                                                return (
                                                    <button 
                                                        key={i}
                                                        onClick={() => setIsSelectingFor({ team: 'A', slot: i })}
                                                        className={`w-full p-3 rounded-2xl border-2 border-dashed transition-all flex items-center gap-3 ${p ? 'bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/5' : 'bg-black/20 border-white/5 hover:border-amber-500/30 text-slate-600'}`}
                                                    >
                                                        {p ? (
                                                            <>
                                                                <TeamLogo src={p.photo} size={32} />
                                                                <div className="flex-1 text-left">
                                                                    <p className="text-[0.65rem] font-black text-white uppercase truncate">{p.name}</p>
                                                                    <p className="text-[0.5rem] text-slate-500 font-bold uppercase">{p.position}</p>
                                                                </div>
                                                                <XCircle size={14} className="text-white/20 hover:text-danger" onClick={(e) => { e.stopPropagation(); removePlayerFromDraft('A', p.id); }} />
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                                                                    <Plus size={16} />
                                                                </div>
                                                                <span className="text-[0.6rem] font-black uppercase tracking-widest">Selecionar Atleta</span>
                                                            </>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="hidden md:flex flex-col items-center pt-10">
                                        <div className="text-[0.6rem] font-black text-slate-700 font-outfit">V S</div>
                                    </div>

                                    {/* Draft Team B */}
                                    <div className="w-full md:w-64 space-y-4">
                                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest text-center">Escalação Time B</p>
                                        <div className="grid grid-cols-1 gap-2">
                                            {Array.from({ length: numPerTeam }).map((_, i) => {
                                                const pId = draftingB[i];
                                                const p = allPlayers.find(x => x.id === pId);
                                                return (
                                                    <button 
                                                        key={i}
                                                        onClick={() => setIsSelectingFor({ team: 'B', slot: i })}
                                                        className={`w-full p-3 rounded-2xl border-2 border-dashed transition-all flex items-center gap-3 ${p ? 'bg-slate-500/10 border-slate-500/50 shadow-lg shadow-slate-500/5' : 'bg-black/20 border-white/5 hover:border-slate-500/30 text-slate-600'}`}
                                                    >
                                                        {p ? (
                                                            <>
                                                                <TeamLogo src={p.photo} size={32} />
                                                                <div className="flex-1 text-left">
                                                                    <p className="text-[0.65rem] font-black text-white uppercase truncate">{p.name}</p>
                                                                    <p className="text-[0.5rem] text-slate-500 font-bold uppercase">{p.position}</p>
                                                                </div>
                                                                <XCircle size={14} className="text-white/20 hover:text-danger" onClick={(e) => { e.stopPropagation(); removePlayerFromDraft('B', p.id); }} />
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                                                                    <Plus size={16} />
                                                                </div>
                                                                <span className="text-[0.6rem] font-black uppercase tracking-widest">Selecionar Atleta</span>
                                                            </>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                                
                                {isAdmin && (
                                    <div className="pt-4 flex justify-center">
                                        <button 
                                            onClick={handleStartMatch}
                                            disabled={isStarting || draftingA.length === 0 || draftingB.length === 0}
                                            className="px-12 py-5 bg-amber-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-amber-500/30 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 transition-all flex items-center gap-3"
                                        >
                                            <Play size={20} fill="currentColor" /> Começar Rachão Agora
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-lg font-black text-white font-outfit uppercase tracking-widest flex items-center gap-3">
                                <Users size={20} className="text-primary" /> Fila de Espera
                            </h2>
                            <span className="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest">{queue.length} Atletas</span>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {queue.length === 0 ? (
                                <div className="glass-panel p-12 text-center border-dashed border-2 border-white/5">
                                    <p className="text-slate-600 font-black text-[0.65rem] uppercase tracking-widest">Nenhum atleta na fila. Seja o primeiro!</p>
                                </div>
                            ) : (
                                queue.map((p, idx) => (
                                    <div key={p.id} className="glass-panel p-4 flex items-center justify-between group hover:bg-white/5 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-black/40 flex items-center justify-center font-outfit font-black text-white/20 border border-white/5">
                                                {idx + 1}
                                            </div>
                                            <TeamLogo src={p.photo} size={48} />
                                            <div>
                                                <p className="font-outfit font-black text-white uppercase tracking-tight truncate max-w-[150px] md:max-w-none">{p.name}</p>
                                                <p className="text-[0.55rem] text-slate-500 font-bold uppercase tracking-widest">{p.position || 'RESERVA'}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            {idx < (parseInt((league.pickupConfig?.gameFormat || '3x3').split('x')[0]) * 2) ? (
                                                <div className="hidden md:flex flex-col items-end">
                                                    <span className="text-[0.5rem] font-black text-amber-500 uppercase tracking-widest">PRÓXIMO</span>
                                                    <div className="w-12 h-1 bg-amber-500/30 rounded-full mt-1 overflow-hidden">
                                                        <div className="w-full h-full bg-amber-500" />
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-[0.55rem] font-black text-slate-700 uppercase tracking-widest hidden md:block">Aguardando</span>
                                            )}

                                            {isAdmin && (
                                                <button onClick={() => leavePickupQueue(p.id)} className="p-2.5 rounded-xl bg-danger/10 text-danger opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    {isAdmin && (
                        <div className="glass-panel p-6 bg-primary/5 border-primary/20 space-y-6">
                            <h3 className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                                <Settings size={14} /> Controles do ADM
                            </h3>
                            <div className="space-y-3">
                                <button 
                                    onClick={() => navigate(`/${leagueSlug}/settings`)}
                                    className="w-full py-3 rounded-xl bg-black/40 border border-white/5 text-[0.65rem] font-black text-white/60 uppercase tracking-widest hover:border-primary/40 hover:text-white transition-all flex items-center justify-center gap-2"
                                >
                                    Alterar Regras do Rachão <ChevronRight size={14} />
                                </button>
                                <button 
                                    onClick={() => {
                                        availablePlayers.forEach(p => joinPickupQueue(p.id));
                                    }}
                                    className="w-full py-3 rounded-xl bg-primary text-white text-[0.65rem] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    <UserPlus size={14} /> Puxar Todos para Fila
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="glass-panel p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <UserCheck size={14} className="text-accent" /> DISPONÍVEIS
                            </h3>
                            <span className="bg-white/5 px-2 py-0.5 rounded-md text-[0.55rem] font-black text-slate-600 uppercase">{availablePlayers.length}</span>
                        </div>

                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {availablePlayers.length === 0 ? (
                                <p className="text-[0.6rem] font-bold text-slate-700 uppercase tracking-widest text-center py-4">Nenhum atleta fora da fila.</p>
                            ) : (
                                availablePlayers.map(p => (
                                    <div key={p.id} className="flex items-center justify-between gap-3 group">
                                        <div className="flex items-center gap-3">
                                            <TeamLogo src={p.photo} size={36} />
                                            <div>
                                                <p className="text-[0.65rem] font-black text-white/80 uppercase tracking-normal leading-tight group-hover:text-primary transition-colors">{p.name}</p>
                                                <p className="text-[0.5rem] text-slate-600 font-bold uppercase tracking-widest">{p.position || 'ALA'}</p>
                                            </div>
                                        </div>
                                        {isAdmin && (
                                            <button onClick={() => joinPickupQueue(p.id)} className="p-2 rounded-lg bg-white/5 text-slate-500 hover:text-primary hover:bg-primary/10 transition-all">
                                                <Plus size={14} strokeWidth={3} />
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="glass-panel p-0 overflow-hidden relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-transparent pointer-events-none" />
                        <div className="p-6 relative z-10 space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                                <Target size={24} />
                            </div>
                            <h3 className="text-sm font-black text-white uppercase tracking-widest leading-relaxed">O Rachão não para. Respeite a fila, jogue duro e vença para ficar!</h3>
                        </div>
                    </div>
                </div>
            </div>

            {isSelectingFor && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in" onClick={() => setIsSelectingFor(null)} />
                    <div className="relative glass-panel w-full max-w-lg max-h-[70vh] flex flex-col animate-scale-in border-white/10 overflow-hidden">
                        <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-black text-white uppercase tracking-tight font-outfit">Selecionar Atleta</h3>
                                <p className="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest">Escalando para o Time {isSelectingFor.team}</p>
                            </div>
                            <button onClick={() => setIsSelectingFor(null)} className="p-2.5 rounded-xl bg-white/5 text-slate-500 hover:text-white transition-all">
                                <XCircle size={24} />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
                            <div className="mb-4">
                                <p className="text-[0.55rem] font-black text-amber-500 uppercase tracking-widest mb-3 px-2 flex items-center gap-2">
                                    <Users size={10} /> Atletas na Fila
                                </p>
                                <div className="grid grid-cols-1 gap-2">
                                    {queue.length === 0 ? (
                                        <p className="text-[0.6rem] text-slate-600 italic px-2">Fila vazia</p>
                                    ) : (
                                        queue.map(p => (
                                            <button 
                                                key={p.id} 
                                                onClick={() => selectPlayer(p.id)}
                                                className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-amber-500/10 border border-white/5 hover:border-amber-500/30 transition-all group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <TeamLogo src={p.photo} size={32} />
                                                    <div className="text-left">
                                                        <p className="text-xs font-black text-white uppercase group-hover:text-amber-500 transition-colors">{p.name}</p>
                                                        <p className="text-[0.5rem] text-slate-500 font-bold uppercase">{p.position}</p>
                                                    </div>
                                                </div>
                                                <div className="px-2 py-1 rounded bg-black/40 text-[0.45rem] font-black text-amber-500 border border-amber-500/20">POS {p.queuePosition}</div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div>
                                <p className="text-[0.55rem] font-black text-slate-500 uppercase tracking-widest mb-3 px-2">Outros Disponíveis</p>
                                <div className="grid grid-cols-1 gap-2">
                                    {availablePlayers.map(p => (
                                        <button 
                                            key={p.id} 
                                            onClick={() => selectPlayer(p.id)}
                                            className="w-full flex items-center gap-3 p-3 rounded-2xl bg-black/20 hover:bg-white/5 border border-white/5 transition-all group"
                                        >
                                            <TeamLogo src={p.photo} size={32} />
                                            <div className="text-left">
                                                <p className="text-xs font-black text-white uppercase group-hover:text-primary transition-colors">{p.name}</p>
                                                <p className="text-[0.5rem] text-slate-500 font-bold uppercase">{p.position}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PickupDashboard;
