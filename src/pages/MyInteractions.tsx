import { useState } from 'react';
import { useLeague } from '../context/LeagueContext';
import { Heart, Star, Swords, Shield, Users, TrendingUp, Calendar, Zap } from 'lucide-react';
import TeamLogo from '../components/TeamLogo';
import AdBanner from '../components/AdBanner';
import { useNavigate } from 'react-router-dom';

const MyInteractions = () => {
    const { teams, matches, userInteractions, league, leagueBasePath } = useLeague();
    const navigate = useNavigate();

    const supporting = userInteractions.filter(i => i.interactionType === 'supporting');
    const favorites = userInteractions.filter(i => i.interactionType === 'favorite');
    const rivals = userInteractions.filter(i => i.interactionType === 'rival');

    const getTeam = (id: string) => teams.find(t => t.id === id);

    const [selectedTeamId, setSelectedTeamId] = useState<string | null>(
        supporting[0]?.teamId || favorites[0]?.teamId || rivals[0]?.teamId || null
    );

    const selectedTeam = teams.find(t => t.id === selectedTeamId);

    const teamMatches = matches.filter(m => m.homeTeamId === selectedTeamId || m.awayTeamId === selectedTeamId);
    const upcomingMatches = teamMatches
        .filter(m => m.status !== 'finished')
        .sort((a, b) => new Date(a.scheduledAt || 0).getTime() - new Date(b.scheduledAt || 0).getTime())
        .slice(0, 3);

    const formatDate = (dt?: string) =>
        dt ? new Date(dt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'A definir';


    if (userInteractions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-white/[0.02] border border-white/[0.05] rounded-3xl">
                <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <Heart size={32} />
                </div>
                <h2 className="text-2xl font-outfit font-black text-white uppercase tracking-tight mb-2">Nenhum time selecionado</h2>
                <p className="text-slate-500 max-w-sm mb-8">
                    Você ainda não escolheu um time para torcer, favoritar ou secar nesta liga.
                </p>
                <button
                    onClick={() => navigate(leagueBasePath + '/teams')}
                    className="bg-primary hover:bg-primary-dark text-white font-black uppercase text-xs tracking-widest px-8 py-4 rounded-2xl transition-all active:scale-95 shadow-lg shadow-primary/20"
                >
                    Explorar Times
                </button>
            </div>
        );
    }

    return (
        <div className="animate-fade-in space-y-8 pb-10">
            <AdBanner position="top" />
            <header>
                <h1 className="text-xl sm:text-2xl md:text-4xl font-outfit font-extrabold tracking-tight mb-1 uppercase">Central do Torcedor</h1>
                <p className="text-slate-400 text-xs sm:text-sm italic">
                    Gerencie e acompanhe seus times favoritos da liga <span className="text-white font-bold">{league?.name}</span>
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* ── COLUNA ESQUERDA: Meus Grupos ─── */}
                <aside className="lg:col-span-4 space-y-6">
                    {/* Supporting section */}
                    {supporting.length > 0 && (
                        <div className="space-y-3">
                            <h2 className="text-[0.6rem] font-black text-danger uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                                <Heart size={12} fill="currentColor" /> Meu Time do Coração
                            </h2>
                            <div className="space-y-2">
                                {supporting.map(i => {
                                    const t = getTeam(i.teamId);
                                    if (!t) return null;
                                    return (
                                        <button
                                            key={t.id}
                                            onClick={() => setSelectedTeamId(t.id)}
                                            className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all border ${selectedTeamId === t.id
                                                ? 'bg-danger/10 border-danger/30 text-white shadow-lg shadow-danger/5 scale-[1.02]'
                                                : 'bg-white/[0.03] border-white/[0.06] text-slate-400 hover:bg-white/[0.06]'
                                                }`}
                                        >
                                            <TeamLogo src={t.logo} size={32} />
                                            <span className="font-bold text-sm truncate flex-1 text-left">{t.name}</span>
                                            {selectedTeamId === t.id && <div className="w-1.5 h-1.5 bg-danger rounded-full animate-pulse" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Favorites section */}
                    {favorites.length > 0 && (
                        <div className="space-y-3">
                            <h2 className="text-[0.6rem] font-black text-warning uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                                <Star size={12} fill="currentColor" /> Favoritos
                            </h2>
                            <div className="space-y-2">
                                {favorites.map(i => {
                                    const t = getTeam(i.teamId);
                                    if (!t) return null;
                                    return (
                                        <button
                                            key={t.id}
                                            onClick={() => setSelectedTeamId(t.id)}
                                            className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all border ${selectedTeamId === t.id
                                                ? 'bg-warning/10 border-warning/30 text-white shadow-lg shadow-warning/5 scale-[1.02]'
                                                : 'bg-white/[0.03] border-white/[0.06] text-slate-400 hover:bg-white/[0.06]'
                                                }`}
                                        >
                                            <TeamLogo src={t.logo} size={32} />
                                            <span className="font-bold text-sm truncate flex-1 text-left">{t.name}</span>
                                            {selectedTeamId === t.id && <div className="w-1.5 h-1.5 bg-warning rounded-full animate-pulse" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Rivals section */}
                    {rivals.length > 0 && (
                        <div className="space-y-3">
                            <h2 className="text-[0.6rem] font-black text-primary uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                                <Swords size={12} /> Rivais (Secando)
                            </h2>
                            <div className="space-y-2">
                                {rivals.map(i => {
                                    const t = getTeam(i.teamId);
                                    if (!t) return null;
                                    return (
                                        <button
                                            key={t.id}
                                            onClick={() => setSelectedTeamId(t.id)}
                                            className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all border ${selectedTeamId === t.id
                                                ? 'bg-primary/10 border-primary/30 text-white shadow-lg shadow-primary/5 scale-[1.02]'
                                                : 'bg-white/[0.03] border-white/[0.06] text-slate-400 hover:bg-white/[0.06]'
                                                }`}
                                        >
                                            <TeamLogo src={t.logo} size={32} />
                                            <span className="font-bold text-sm truncate flex-1 text-left">{t.name}</span>
                                            {selectedTeamId === t.id && <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </aside>

                {/* ── COLUNA DIREITA: Detalhes do Time ─── */}
                <main className="lg:col-span-8 space-y-6">
                    {selectedTeam ? (
                        <div className="space-y-6">
                            {/* Team Header Card */}
                            <div className="glass-panel p-6 sm:p-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors" />

                                <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-white/20 blur-xl rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <TeamLogo src={selectedTeam.logo} size={100} />
                                    </div>
                                    <div className="text-center sm:text-left">
                                        <h2 className="text-3xl sm:text-4xl font-outfit font-black text-white uppercase tracking-tighter leading-none mb-2">
                                            {selectedTeam.name}
                                        </h2>
                                        <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-4">
                                            <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
                                                <p className="text-[0.55rem] font-black text-slate-500 uppercase tracking-widest mb-1">Pontos</p>
                                                <p className="text-lg font-bold text-primary">
                                                    {(selectedTeam.stats?.wins || 0) * (league?.pointsForWin || 3) + (selectedTeam.stats?.draws || 0) * (league?.pointsForDraw || 1)}
                                                </p>
                                            </div>
                                            <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
                                                <p className="text-[0.55rem] font-black text-slate-500 uppercase tracking-widest mb-1">Gols Marcados</p>
                                                <p className="text-lg font-bold text-accent">{selectedTeam.stats?.goalsFor || 0}</p>
                                            </div>
                                            <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
                                                <p className="text-[0.55rem] font-black text-slate-500 uppercase tracking-widest mb-1">Saldo</p>
                                                <p className="text-lg font-bold text-white">{(selectedTeam.stats?.goalsFor || 0) - (selectedTeam.stats?.goalsAgainst || 0)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {[
                                    { label: 'Vitórias', val: selectedTeam.stats?.wins || 0, color: 'text-primary' },
                                    { label: 'Empates', val: selectedTeam.stats?.draws || 0, color: 'text-slate-400' },
                                    { label: 'Derrotas', val: selectedTeam.stats?.losses || 0, color: 'text-danger' },
                                    { label: 'Jogos', val: selectedTeam.stats?.matches || 0, color: 'text-white' },
                                ].map((s, i) => (
                                    <div key={i} className="glass-panel p-4 text-center">
                                        <p className={`text-2xl font-black font-outfit ${s.color}`}>{s.val}</p>
                                        <p className="text-[0.6rem] font-bold text-slate-600 uppercase tracking-wider mt-1">{s.label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Upcoming Matches */}
                            <div className="glass-panel p-6">
                                <h3 className="text-sm font-black text-white font-outfit uppercase tracking-widest flex items-center gap-2 mb-6">
                                    <Calendar size={16} className="text-accent" /> Próximas Partidas
                                </h3>

                                {upcomingMatches.length > 0 ? (
                                    <div className="space-y-3">
                                        {upcomingMatches.map(m => {
                                            const isHome = m.homeTeamId === selectedTeamId;
                                            const opponentId = isHome ? m.awayTeamId : m.homeTeamId;
                                            const opponent = getTeam(opponentId);
                                            return (
                                                <div key={m.id} className="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-4 flex items-center justify-between group hover:bg-white/[0.06] transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex flex-col items-center">
                                                            <div className="bg-accent/10 p-2 rounded-xl mb-1">
                                                                <Zap size={14} className="text-accent" />
                                                            </div>
                                                            <span className="text-[0.6rem] font-black text-slate-500 uppercase tracking-tighter">VS</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <TeamLogo src={opponent?.logo} size={32} />
                                                            <div>
                                                                <p className="text-sm font-bold text-white uppercase">{opponent?.name}</p>
                                                                <p className="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest">{formatDate(m.scheduledAt)}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[0.55rem] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${m.status === 'live' ? 'bg-danger/10 border-danger/30 text-danger animate-pulse' : 'bg-white/5 border-white/10 text-slate-500'
                                                            }`}>
                                                            {m.status === 'live' ? 'AO VIVO' : 'Agendado'}
                                                        </span>
                                                        <button onClick={() => navigate(`${leagueBasePath}/match/${m.id}`)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                                                            <TrendingUp size={14} className="text-slate-600" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 bg-white/[0.01] rounded-2xl border border-dashed border-white/10">
                                        <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Nenhuma partida agendada</p>
                                    </div>
                                )}
                            </div>

                            {/* Elenco Section */}
                            <div className="glass-panel p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-sm font-black text-white font-outfit uppercase tracking-widest flex items-center gap-2">
                                        <Users size={16} className="text-primary" /> Elenco do Clube
                                    </h3>
                                    <span className="text-[0.6rem] font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/10">
                                        {selectedTeam.players.length} Atletas
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {selectedTeam.players.sort((a, b) => (a.isReserve ? 1 : 0) - (b.isReserve ? 1 : 0)).map(p => (
                                        <div key={p.id} className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] transition-all group">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center text-xs font-black text-white relative overflow-hidden group-hover:scale-105 transition-transform">
                                                {p.photo ? (
                                                    <img src={p.photo} alt={p.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="opacity-50">{p.number}</span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <p className="text-sm font-bold text-white truncate">{p.name}</p>
                                                    {p.isCaptain && <CrownIcon size={12} className="text-warning flex-none" />}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest">{p.position}</span>
                                                    {p.isReserve && (
                                                        <span className="text-[0.55rem] font-bold text-orange-500 uppercase px-1.5 py-0.5 bg-orange-500/10 rounded-md">Reserva</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right flex-none">
                                                <p className="text-xs font-black text-accent">{p.stats?.goals || 0} Gols</p>
                                                <p className="text-[0.6rem] font-bold text-slate-600 uppercase tracking-widest">{p.stats?.assists || 0} Assist.</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-12 bg-white/[0.02] border border-dashed border-white/10 rounded-3xl">
                            <Shield size={48} className="text-slate-800 mb-4" />
                            <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">Selecione um time ao lado para ver detalhes</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

const CrownIcon = ({ size, className }: { size: number, className?: string }) => (
    <div className={className}>
        <TrendingUp size={size} />
    </div>
);

export default MyInteractions;
