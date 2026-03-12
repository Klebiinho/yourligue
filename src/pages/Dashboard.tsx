import { useLeague } from '../context/LeagueContext';
import { Trophy, Users, Swords, Calendar, MapPin, ChevronRight, TrendingUp, Star, ArrowRight } from 'lucide-react';
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
        { label: 'Times', value: teams.length, icon: <Users size={20} />, color: 'from-primary/20 to-primary/5 border-primary/20 text-primary', val: 'text-primary' },
        { label: 'Partidas', value: matches.length, icon: <Swords size={20} />, color: 'from-accent/20 to-accent/5 border-accent/20 text-accent', val: 'text-accent' },
        { label: 'Gols', value: totalGoals, icon: <TrendingUp size={20} />, color: 'from-warning/20 to-warning/5 border-warning/20 text-warning', val: 'text-warning' },
        { label: 'Ao Vivo', value: liveMatches.length, icon: <Star size={20} />, color: 'from-danger/20 to-danger/5 border-danger/20 text-danger', val: 'text-danger' },
    ];

    const formatDate = (dt?: string) =>
        dt ? new Date(dt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '';

    const sortedTeams = [...teams].sort((a, b) => {
        const pts = (t: typeof teams[0]) => (t.stats?.wins || 0) * (league?.pointsForWin || 3) + (t.stats?.draws || 0) * (league?.pointsForDraw || 1);
        return pts(b) - pts(a);
    });

    return (
        <div className="animate-fade-in">
            {/* ── Header ─────────────────────────────────────────────── */}
            <header className="mb-8 md:mb-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl md:text-5xl font-outfit font-extrabold tracking-tight leading-tight">
                            Bem-vindo de volta 👋
                        </h1>
                        <p className="text-slate-400 mt-1 text-sm md:text-base">
                            Liga <span className="text-white font-bold">{league?.name}</span> · {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                        </p>
                    </div>
                    {liveMatches.length > 0 && (
                        <div className="flex items-center gap-2 bg-danger/10 border border-danger/30 px-4 py-2 rounded-xl shadow-lg self-start">
                            <span className="w-2 h-2 bg-danger rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                            <span className="text-danger font-black text-xs uppercase tracking-widest">{liveMatches.length} Partida(s) AO VIVO</span>
                        </div>
                    )}
                </div>
            </header>

            {/* ── Stats Grid ─────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-8 md:mb-10">
                {stats.map((stat, i) => (
                    <div key={i} className={`glass-panel p-4 sm:p-5 md:p-6 bg-gradient-to-br ${stat.color} flex flex-col gap-3 border hover:scale-[1.02] transition-all duration-300 cursor-default`}>
                        <div className={`w-9 h-9 rounded-xl bg-black/30 flex items-center justify-center ${stat.val}`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-[0.65rem] sm:text-xs font-black text-slate-500 uppercase tracking-wider">{stat.label}</p>
                            <p className={`text-2xl sm:text-3xl md:text-4xl font-extrabold font-outfit mt-0.5 leading-none ${stat.val}`}>{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Main Content ───────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Matches Column */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base md:text-lg font-black font-outfit uppercase tracking-widest text-slate-300 flex items-center gap-2">
                            <Swords size={18} className="text-primary" /> Partidas
                        </h2>
                        <button onClick={() => navigate('/matches')} className="flex items-center gap-1 text-primary text-xs font-black uppercase tracking-widest hover:text-white transition-colors">
                            Ver todas <ArrowRight size={14} />
                        </button>
                    </div>
                    <div className="glass-panel p-4 md:p-6 space-y-3">
                        {[...liveMatches, ...upcomingMatches].length === 0 ? (
                            <div className="py-16 text-center opacity-30">
                                <Swords size={40} strokeWidth={1} className="mx-auto mb-3" />
                                <p className="text-xs font-black uppercase tracking-widest">Nenhuma partida agendada</p>
                            </div>
                        ) : (
                            [...liveMatches, ...upcomingMatches].map(match => {
                                const ht = teams.find(t => t.id === match.homeTeamId);
                                const at = teams.find(t => t.id === match.awayTeamId);
                                const isLive = match.status === 'live';
                                return (
                                    <div key={match.id}
                                        onClick={() => navigate(`/match/${match.id}`)}
                                        className={`flex items-center gap-3 p-3 sm:p-4 rounded-2xl cursor-pointer transition-all duration-300 border ${isLive ? 'bg-primary/10 border-primary/20 shadow-[0_4px_20px_rgba(109,40,217,0.1)]' : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.05]'
                                            }`}>
                                        {/* Home */}
                                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                            <TeamLogo src={ht?.logo} size={34} />
                                            <span className="font-bold text-xs sm:text-sm truncate">{ht?.name}</span>
                                        </div>
                                        {/* Score / Status */}
                                        <div className="flex flex-col items-center gap-1 px-2 flex-none">
                                            {isLive ? (
                                                <>
                                                    <div className="flex items-center gap-2 font-black font-outfit text-lg">
                                                        <span className="text-primary">{match.homeScore}</span>
                                                        <span className="text-slate-600 text-base">:</span>
                                                        <span className="text-accent">{match.awayScore}</span>
                                                    </div>
                                                    <span className="text-[0.55rem] text-danger font-black uppercase tracking-widest animate-pulse">Ao Vivo</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="text-[0.6rem] font-black text-slate-600 uppercase">vs</span>
                                                    {match.scheduledAt && (
                                                        <span className="text-[0.55rem] font-bold text-slate-600 flex items-center gap-1">
                                                            <Calendar size={10} /> {formatDate(match.scheduledAt)}
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                        {/* Away */}
                                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 justify-end">
                                            <span className="font-bold text-xs sm:text-sm truncate text-right">{at?.name}</span>
                                            <TeamLogo src={at?.logo} size={34} />
                                        </div>
                                        <ChevronRight size={14} className="text-slate-700 flex-none" />
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Standings Mini */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base md:text-lg font-black font-outfit uppercase tracking-widest text-slate-300 flex items-center gap-2">
                            <Trophy size={18} className="text-warning" /> Liderança
                        </h2>
                        <button onClick={() => navigate('/standings')} className="flex items-center gap-1 text-accent text-xs font-black uppercase tracking-widest hover:text-white transition-colors">
                            Tabela <ArrowRight size={14} />
                        </button>
                    </div>
                    <div className="glass-panel p-4 md:p-6 space-y-2">
                        {sortedTeams.length === 0 ? (
                            <div className="py-12 text-center opacity-30">
                                <Trophy size={36} strokeWidth={1} className="mx-auto mb-3" />
                                <p className="text-xs font-black uppercase tracking-widest">Sem times cadastrados</p>
                            </div>
                        ) : (
                            sortedTeams.slice(0, 6).map((team, i) => {
                                const pts = (team.stats?.wins || 0) * (league?.pointsForWin || 3) + (team.stats?.draws || 0) * (league?.pointsForDraw || 1);
                                return (
                                    <div key={team.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] transition-colors group">
                                        <span className={`w-7 h-7 flex items-center justify-center rounded-lg font-black text-xs font-outfit flex-none ${i === 0 ? 'bg-warning/20 text-warning shadow-[0_0_10px_rgba(245,158,11,0.2)]' :
                                                i < 3 ? 'bg-white/10 text-slate-300' : 'text-slate-600'
                                            }`}>
                                            {i + 1}
                                        </span>
                                        <TeamLogo src={team.logo} size={30} />
                                        <span className="font-bold flex-1 truncate text-sm">{team.name}</span>
                                        <span className="font-black text-primary text-sm font-outfit flex-none">{pts}</span>
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
