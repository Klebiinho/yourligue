import { useState } from 'react';
import { useLeague } from '../context/LeagueContext';
import { Trophy, Users, Swords, Calendar, ChevronRight, TrendingUp, Star, ArrowRight, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TeamLogo from '../components/TeamLogo';

const Dashboard = () => {
    const { league, teams, matches, loading } = useLeague();
    const navigate = useNavigate();

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
    );

    const liveMatches = matches.filter(m => m.status === 'live');
    const upcomingMatches = matches.filter(m => m.status === 'scheduled')
        .sort((a, b) => new Date(a.scheduledAt || 0).getTime() - new Date(b.scheduledAt || 0).getTime())
        .slice(0, 5);
    const totalGoals = teams.reduce((acc, t) => acc + (t.stats?.goalsFor || 0), 0);

    const stats = [
        { label: 'Times', value: teams.length, icon: <Users size={18} />, gradientFrom: 'from-primary/20', border: 'border-primary/20', text: 'text-primary' },
        { label: 'Partidas', value: matches.length, icon: <Swords size={18} />, gradientFrom: 'from-accent/20', border: 'border-accent/20', text: 'text-accent' },
        { label: 'Gols', value: totalGoals, icon: <TrendingUp size={18} />, gradientFrom: 'from-warning/20', border: 'border-warning/20', text: 'text-warning' },
        { label: 'Ao Vivo', value: liveMatches.length, icon: <Star size={18} />, gradientFrom: 'from-danger/20', border: 'border-danger/20', text: 'text-danger' },
    ];

    const formatDate = (dt?: string) =>
        dt ? new Date(dt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '';

    const sortedTeams = [...teams].sort((a, b) => {
        const pts = (t: typeof teams[0]) => (t.stats?.wins || 0) * (league?.pointsForWin || 3) + (t.stats?.draws || 0) * (league?.pointsForDraw || 1);
        return pts(b) - pts(a);
    });

    const allPlayers = teams.flatMap(t => t.players.map(p => ({ ...p, team: t })));
    const topScorers = [...allPlayers].sort((a, b) => (b.stats?.goals || 0) - (a.stats?.goals || 0)).filter(p => (p.stats?.goals || 0) > 0).slice(0, 5);

    const [activeTab, setActiveTab] = useState<'matches' | 'standings' | 'scorers'>('matches');
    const [showTopScorersModal, setShowTopScorersModal] = useState(false);

    return (
        <div className="animate-fade-in space-y-6 md:space-y-8 pb-10">
            {/* ── Header ────────────────────────────────────────────────── */}
            <header>
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h1 className="text-xl sm:text-2xl md:text-4xl font-outfit font-extrabold tracking-tight leading-tight">
                            Bem-vindo 👋
                        </h1>
                        <p className="text-slate-500 mt-0.5 text-xs sm:text-sm">
                            <span className="text-white font-bold">{league?.name}</span>
                            {' · '}
                            {new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}
                        </p>
                    </div>
                    {liveMatches.length > 0 && (
                        <div className="flex items-center gap-1.5 bg-danger/10 border border-danger/30 px-3 py-1.5 rounded-xl flex-none self-start mt-1">
                            <span className="w-1.5 h-1.5 bg-danger rounded-full animate-pulse flex-none" />
                            <span className="text-danger font-black text-[0.6rem] uppercase tracking-widest whitespace-nowrap">
                                {liveMatches.length} Ao Vivo
                            </span>
                        </div>
                    )}
                </div>
            </header>

            {/* ── Stats Row ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className={`glass-panel p-3 sm:p-4 md:p-5 bg-gradient-to-br ${stat.gradientFrom} to-transparent border ${stat.border} flex flex-col items-center sm:items-start gap-1.5 sm:gap-2 text-center sm:text-left`}>
                        <div className={`${stat.text} hidden sm:block`}>{stat.icon}</div>
                        <div>
                            <p className={`text-2xl sm:text-3xl md:text-4xl font-extrabold font-outfit leading-none ${stat.text}`}>{stat.value}</p>
                            <p className="text-[0.55rem] sm:text-[0.6rem] font-black text-slate-600 uppercase tracking-wider mt-0.5">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Mobile Tabs Switcher ── */}
            <div className="flex lg:hidden bg-black/40 p-1 rounded-2xl border border-white/5">
                {[
                    { id: 'matches', label: 'Jogos', icon: Zap },
                    { id: 'standings', label: 'Tabela', icon: Trophy },
                    { id: 'scorers', label: 'Destaques', icon: Star },
                ].map(t => (
                    <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id as any)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[0.6rem] uppercase tracking-widest transition-all ${activeTab === t.id ? 'bg-primary text-white shadow-lg' : 'text-slate-500'}`}
                    >
                        <t.icon size={13} /> {t.label}
                    </button>
                ))}
            </div>

            {/* ── Main Grid ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-8">

                {/* ── PRÓXIMAS & AO VIVO ─────────────────────────────────── */}
                <div className={`${activeTab === 'matches' ? 'block' : 'hidden md:block'} lg:col-span-2 space-y-4`}>
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-black font-outfit uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                            <Zap size={16} className="text-primary" />
                            Próximas & Ao Vivo
                        </h2>
                        <button onClick={() => navigate('/matches')} className="flex items-center gap-1 text-primary text-[0.6rem] sm:text-xs font-black uppercase tracking-widest hover:text-white transition-colors">
                            Ver todas <ArrowRight size={12} />
                        </button>
                    </div>

                    <div className="glass-panel divide-y divide-white/[0.04] overflow-hidden">
                        {[...liveMatches, ...upcomingMatches].length === 0 ? (
                            <div className="py-10 sm:py-14 text-center opacity-25">
                                <Swords size={32} strokeWidth={1} className="mx-auto mb-2" />
                                <p className="text-[0.6rem] font-black uppercase tracking-widest">Nenhuma partida</p>
                            </div>
                        ) : (
                            [...liveMatches, ...upcomingMatches].map(match => {
                                const ht = teams.find(t => t.id === match.homeTeamId);
                                const at = teams.find(t => t.id === match.awayTeamId);
                                const isLive = match.status === 'live';
                                return (
                                    <div key={match.id}
                                        onClick={() => navigate(`/match/${match.id}`)}
                                        className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-5 cursor-pointer transition-all duration-200 ${isLive ? 'bg-danger/[0.04]' : 'hover:bg-white/[0.03]'}`}>

                                        {/* Home: logo + nome */}
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <TeamLogo src={ht?.logo} size={30} />
                                            <span className="font-bold text-[0.7rem] sm:text-sm truncate leading-tight">{ht?.name}</span>
                                        </div>

                                        {/* Centro */}
                                        <div className="flex flex-col items-center gap-0.5 flex-none px-1 sm:px-2 min-w-[52px] sm:min-w-[70px]">
                                            {isLive ? (
                                                <>
                                                    <div className="flex items-center gap-1.5 font-black font-outfit text-base sm:text-xl text-primary">
                                                        <span>{match.homeScore}</span>
                                                        <span className="text-slate-700 text-xs">:</span>
                                                        <span className="text-accent">{match.awayScore}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="w-1 h-1 bg-danger rounded-full animate-pulse" />
                                                        <span className="text-[0.45rem] sm:text-[0.5rem] text-danger font-black uppercase tracking-widest whitespace-nowrap">Ao Vivo</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="text-[0.55rem] font-black text-slate-600 uppercase">vs</span>
                                                    {match.scheduledAt && (
                                                        <div className="flex items-center gap-0.5 text-[0.45rem] sm:text-[0.5rem] text-slate-700 font-bold whitespace-nowrap">
                                                            <Calendar size={8} />{formatDate(match.scheduledAt)}
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>

                                        {/* Away: nome + logo */}
                                        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                                            <span className="font-bold text-[0.7rem] sm:text-sm truncate text-right leading-tight">{at?.name}</span>
                                            <TeamLogo src={at?.logo} size={30} />
                                        </div>

                                        <ChevronRight size={12} className="text-slate-700 flex-none hidden sm:block" />
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* ── COLUNA DIREITA ─────────────────────────────────────────── */}
                <div className={`${activeTab === 'matches' ? 'hidden md:block' : 'block'} space-y-5 md:space-y-6 lg:border-l lg:border-white/5 lg:pl-6`}>

                    {/* ── CLASSIFICAÇÃO ──────────────────────────────────────── */}
                    <div className={`${activeTab === 'standings' || activeTab === 'matches' ? 'block' : 'hidden md:block'} space-y-4`}>
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-black font-outfit uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                <Trophy size={16} className="text-warning" />
                                Classificação
                            </h2>
                            <button onClick={() => navigate('/standings')} className="flex items-center gap-1 text-accent text-[0.6rem] sm:text-xs font-black uppercase tracking-widest hover:text-white transition-colors">
                                Tabela <ArrowRight size={12} />
                            </button>
                        </div>

                        <div className="glass-panel divide-y divide-white/[0.04] overflow-hidden">
                            {sortedTeams.length === 0 ? (
                                <div className="py-10 sm:py-14 text-center opacity-25">
                                    <Trophy size={32} strokeWidth={1} className="mx-auto mb-2" />
                                    <p className="text-[0.6rem] font-black uppercase tracking-widest">Sem times</p>
                                </div>
                            ) : (
                                sortedTeams.slice(0, 5).map((team, i) => {
                                    const pts = (team.stats?.wins || 0) * (league?.pointsForWin || 3) + (team.stats?.draws || 0) * (league?.pointsForDraw || 1);
                                    return (
                                        <div key={team.id} className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3.5 hover:bg-white/[0.03] transition-colors">
                                            {/* Position badge */}
                                            <span className={`w-6 h-6 flex items-center justify-center rounded-md font-black text-[0.6rem] font-outfit flex-none ${i === 0 ? 'bg-warning/20 text-warning' :
                                                i < 3 ? 'bg-white/10 text-slate-300' : 'text-slate-600'
                                                }`}>
                                                {i + 1}
                                            </span>
                                            <TeamLogo src={team.logo} size={26} />
                                            <span className="font-bold flex-1 truncate text-[0.7rem] sm:text-sm">{team.name}</span>
                                            <div className="flex flex-col items-end flex-none min-w-[32px]">
                                                <span className="font-black text-primary text-sm sm:text-base font-outfit leading-none">{pts}</span>
                                                <span className="text-[0.5rem] text-slate-700 font-black uppercase">pts</span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* ── DESTAQUES DA LIGA ───────────────────────────────────── */}
                    <div className={`${activeTab === 'scorers' || activeTab === 'matches' ? 'block' : 'hidden md:block'} space-y-4`}>
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-black font-outfit uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                <Star size={16} className="text-warning" />
                                Destaques da Liga
                            </h2>
                            <button onClick={() => setShowTopScorersModal(true)} className="flex items-center gap-1 text-warning text-[0.6rem] sm:text-xs font-black uppercase tracking-widest hover:text-white transition-colors">
                                Ver Rank <ArrowRight size={12} />
                            </button>
                        </div>

                        <div className="glass-panel divide-y divide-white/[0.04] overflow-hidden">
                            {topScorers.length === 0 ? (
                                <div className="py-8 sm:py-10 text-center opacity-25">
                                    <Star size={24} strokeWidth={1} className="mx-auto mb-2" />
                                    <p className="text-[0.6rem] font-black uppercase tracking-widest">Sem artilheiros</p>
                                </div>
                            ) : (
                                topScorers.map((player, i) => (
                                    <div key={player.id} className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 hover:bg-white/[0.03] transition-colors">
                                        <span className={`w-5 h-5 flex items-center justify-center rounded-md font-black text-[0.55rem] font-outfit flex-none ${i === 0 ? 'bg-warning/20 text-warning' : 'text-slate-500'}`}>
                                            {i + 1}
                                        </span>
                                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden flex-none">
                                            {player.photo ? (
                                                <img src={player.photo} className="w-full h-full object-cover" alt={player.name} />
                                            ) : (
                                                <span className="font-black text-[0.6rem] text-slate-400">{player.number}</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col">
                                            <span className="font-bold truncate text-[0.65rem] sm:text-xs text-white">{player.name}</span>
                                            <span className="text-[0.55rem] font-black text-slate-500 uppercase tracking-widest truncate leading-tight">{player.team.name}</span>
                                        </div>
                                        <div className="flex flex-col items-end flex-none min-w-[32px]">
                                            <span className="font-black text-accent text-sm sm:text-base font-outfit leading-none">{player.stats?.goals || 0}</span>
                                            <span className="text-[0.45rem] text-slate-500 font-black uppercase">Gols</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── TOP SCORERS MODAL ────────────────────────────────────── */}
            {showTopScorersModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowTopScorersModal(false)} />
                    <div className="relative glass-panel w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col animate-scale-in">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center text-warning shadow-lg shadow-warning/10">
                                    <Star size={20} className="fill-warning/20" />
                                </div>
                                <div>
                                    <h3 className="font-outfit font-black text-white uppercase tracking-tight text-xl">Ranking de Artilharia</h3>
                                    <p className="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest">Gols marcados nesta liga</p>
                                </div>
                            </div>
                            <button onClick={() => setShowTopScorersModal(false)} className="p-2 text-slate-500 hover:text-white transition-colors">
                                <Star size={24} className="rotate-45" /> {/* Close icon substitute or use Star as placeholder */}
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 no-scrollbar">
                            {[...allPlayers].sort((a, b) => (b.stats?.goals || 0) - (a.stats?.goals || 0))
                                .filter(p => (p.stats?.goals || 0) > 0)
                                .map((player, i) => (
                                    <div key={player.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.08] transition-all group">
                                        <span className={`w-8 h-8 flex items-center justify-center rounded-xl font-black font-outfit text-sm ${i === 0 ? 'bg-warning text-black shadow-lg shadow-warning/20' :
                                            i === 1 ? 'bg-slate-300 text-black' :
                                                i === 2 ? 'bg-orange-400 text-black' : 'text-slate-600'}`}>
                                            {i + 1}
                                        </span>
                                        <div className="relative flex-none">
                                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-primary/50 transition-colors bg-white/5">
                                                {player.photo ? <img src={player.photo} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold">#</div>}
                                            </div>
                                            <div className="absolute -bottom-1 -right-1">
                                                <TeamLogo src={player.team.logo} size={22} />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-black text-white font-outfit uppercase tracking-wide text-sm truncate">{player.name}</h4>
                                            <p className="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest">{player.team.name}</p>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-2xl font-black text-accent font-outfit tabular-nums">{player.stats?.goals || 0}</span>
                                            <span className="text-[0.45rem] font-black text-slate-600 uppercase">Gols</span>
                                        </div>
                                    </div>
                                ))}
                        </div>
                        <div className="p-4 bg-black/40 border-t border-white/5 text-center">
                            <p className="text-[0.55rem] font-black text-slate-600 uppercase tracking-[0.2em] italic">Estatísticas atualizadas em tempo real</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;

