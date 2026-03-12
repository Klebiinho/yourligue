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
    const upcomingMatches = matches.filter(m => m.status === 'scheduled').slice(0, 5);
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

    return (
        <div className="animate-fade-in space-y-6 md:space-y-8">
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

            {/* ── Main Grid ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">

                {/* ── PRÓXIMAS & AO VIVO ─────────────────────────────────── */}
                <div className="lg:col-span-2 space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xs sm:text-sm font-black font-outfit uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <Zap size={14} className="text-primary" />
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
                                        className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-4 cursor-pointer transition-all duration-200 ${isLive ? 'bg-danger/[0.04]' : 'hover:bg-white/[0.03]'}`}>

                                        {/* Home: logo + nome */}
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <TeamLogo src={ht?.logo} size={30} />
                                            <span className="font-bold text-[0.7rem] sm:text-sm truncate leading-tight">{ht?.name}</span>
                                        </div>

                                        {/* Centro */}
                                        <div className="flex flex-col items-center gap-0.5 flex-none px-1 sm:px-2 min-w-[52px] sm:min-w-[70px]">
                                            {isLive ? (
                                                <>
                                                    <div className="flex items-center gap-1.5 font-black font-outfit text-base sm:text-xl">
                                                        <span className="text-primary">{match.homeScore}</span>
                                                        <span className="text-slate-700 text-xs">:</span>
                                                        <span className="text-accent">{match.awayScore}</span>
                                                    </div>
                                                    <span className="text-[0.45rem] sm:text-[0.5rem] text-danger font-black uppercase tracking-widest animate-pulse whitespace-nowrap">● Ao Vivo</span>
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

                {/* ── CLASSIFICAÇÃO ──────────────────────────────────────── */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xs sm:text-sm font-black font-outfit uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <Trophy size={14} className="text-warning" />
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
                            sortedTeams.slice(0, 6).map((team, i) => {
                                const pts = (team.stats?.wins || 0) * (league?.pointsForWin || 3) + (team.stats?.draws || 0) * (league?.pointsForDraw || 1);
                                return (
                                    <div key={team.id} className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-white/[0.03] transition-colors">
                                        {/* Position badge */}
                                        <span className={`w-6 h-6 flex items-center justify-center rounded-md font-black text-[0.6rem] font-outfit flex-none ${i === 0 ? 'bg-warning/20 text-warning' :
                                                i < 3 ? 'bg-white/10 text-slate-300' : 'text-slate-600'
                                            }`}>
                                            {i + 1}
                                        </span>
                                        <TeamLogo src={team.logo} size={26} />
                                        <span className="font-bold flex-1 truncate text-[0.7rem] sm:text-sm">{team.name}</span>
                                        <div className="flex flex-col items-end flex-none">
                                            <span className="font-black text-primary text-sm sm:text-base font-outfit leading-none">{pts}</span>
                                            <span className="text-[0.5rem] text-slate-700 font-black uppercase">pts</span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
