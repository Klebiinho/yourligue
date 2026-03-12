import { useLeague } from '../context/LeagueContext';
import { Trophy, Users, Swords, Calendar, MapPin, ChevronRight, TrendingUp, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TeamLogo from '../components/TeamLogo';

const Dashboard = () => {
    const { league, teams, matches, loading } = useLeague();
    const navigate = useNavigate();

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
    );

    const liveMatches = matches.filter(m => m.status === 'live');
    const upcomingMatches = matches.filter(m => m.status === 'scheduled').slice(0, 5);
    const totalGoals = teams.reduce((acc, t) => acc + (t.stats?.goalsFor || 0), 0);

    const stats = [
        { label: 'Times', value: teams.length, icon: <Users size={22} />, color: 'text-primary' },
        { label: 'Partidas', value: matches.length, icon: <Swords size={22} />, color: 'text-accent' },
        { label: 'Gols Marcados', value: totalGoals, icon: <TrendingUp size={22} />, color: 'text-warning' },
        { label: 'Ao Vivo', value: liveMatches.length, icon: <Star size={22} />, color: 'text-danger' },
    ];

    const formatDate = (dt?: string) => dt ? new Date(dt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '';

    const handleEnterMatch = (id: string) => {
        navigate(`/match/${id}`);
    };

    const sortedTeams = [...teams].sort((a, b) => {
        const ptsA = (a.stats?.wins || 0) * (league?.pointsForWin || 3) + (a.stats?.draws || 0) * (league?.pointsForDraw || 1);
        const ptsB = (b.stats?.wins || 0) * (league?.pointsForWin || 3) + (b.stats?.draws || 0) * (league?.pointsForDraw || 1);
        return ptsB - ptsA;
    });

    return (
        <div className="animate-fade-in pb-24 md:pb-8 p-4 md:p-0">
            <header className="mb-8 md:mb-12">
                <h1 className="text-3xl md:text-5xl font-outfit font-extrabold tracking-tight mb-2">
                    Olá, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#a855f7]">Bem-vindo!</span>
                </h1>
                <p className="text-slate-400 font-medium md:text-lg">Dashboard da liga {league?.name}</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
                {stats.map((stat, i) => (
                    <div key={i} className="glass-panel p-5 md:p-6 flex flex-col gap-3 group hover:scale-[1.02] transition-transform duration-300">
                        <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                            <p className="text-2xl md:text-3xl font-extrabold text-white font-outfit mt-1">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Live & Upcoming Matches */}
                <div className="lg:col-span-2 space-y-6">
                    <section className="glass-panel p-6 md:p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-3">
                                <Swords size={22} className="text-primary" />
                                Partidas Recentes
                            </h2>
                            <button onClick={() => navigate('/matches')} className="text-primary text-sm font-bold hover:underline">Ver todas</button>
                        </div>

                        <div className="space-y-4">
                            {[...liveMatches, ...upcomingMatches].length === 0 ? (
                                <p className="text-slate-500 text-center py-8 font-medium">Nenhuma partida agendada.</p>
                            ) : (
                                [...liveMatches, ...upcomingMatches].map(match => {
                                    const ht = teams.find(t => t.id === match.homeTeamId);
                                    const at = teams.find(t => t.id === match.awayTeamId);
                                    const isLive = match.status === 'live';
                                    return (
                                        <div key={match.id}
                                            onClick={() => handleEnterMatch(match.id)}
                                            className={`flex flex-col sm:flex-row justify-between items-center p-4 md:p-5 rounded-2xl cursor-pointer transition-all duration-300 gap-4 border ${isLive
                                                    ? 'bg-primary/10 border-primary/30 shadow-[0_4px_20px_rgba(109,40,217,0.1)]'
                                                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                                                }`}>
                                            <div className="flex items-center gap-4 flex-1 w-full min-w-0">
                                                <TeamLogo src={ht?.logo} size={40} />
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold text-sm md:text-base truncate">
                                                        {ht?.name} <span className="text-slate-500 mx-1">vs</span> {at?.name}
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-slate-500 font-medium text-[0.7rem] md:text-xs">
                                                        {match.scheduledAt && <span className="flex items-center gap-1.5"><Calendar size={12} /> {formatDate(match.scheduledAt)}</span>}
                                                        {match.location && <span className="flex items-center gap-1.5"><MapPin size={12} /> {match.location}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0 border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0">
                                                <div className="flex items-center gap-3">
                                                    {isLive && (
                                                        <span className="bg-danger text-white px-2.5 py-1 rounded-lg text-[0.65rem] font-black uppercase tracking-widest animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                                                            AO VIVO
                                                        </span>
                                                    )}
                                                    <TeamLogo src={at?.logo} size={40} />
                                                </div>
                                                <ChevronRight size={18} className="text-slate-600 ml-2" />
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </section>
                </div>

                {/* Classification Mini Table */}
                <div className="space-y-6">
                    <section className="glass-panel p-6 md:p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-3">
                                <Trophy size={22} className="text-accent" />
                                Liderança
                            </h2>
                            <button onClick={() => navigate('/standings')} className="text-accent text-sm font-bold hover:underline">Ver Tabela</button>
                        </div>

                        <div className="space-y-4">
                            {sortedTeams.slice(0, 5).map((team, i) => (
                                <div key={team.id} className="flex items-center gap-4 p-3.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                                    <span className={`w-7 h-7 flex items-center justify-center rounded-lg font-black text-xs ${i === 0 ? 'bg-warning/20 text-warning' : 'bg-white/10 text-slate-400'
                                        }`}>
                                        {i + 1}
                                    </span>
                                    <TeamLogo src={team.logo} size={32} />
                                    <span className="font-bold flex-1 truncate text-sm">{team.name}</span>
                                    <span className="font-black text-primary group-hover:scale-110 transition-transform">
                                        {(team.stats?.wins || 0) * (league?.pointsForWin || 3) + (team.stats?.draws || 0) * (league?.pointsForDraw || 1)} PTS
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
