import { useLeague } from '../context/LeagueContext';
import { Signal, History, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TeamLogo from '../components/TeamLogo';

const LiveMatches = () => {
    const { matches, teams, leagueBasePath } = useLeague();
    const navigate = useNavigate();

    const liveMatches = matches.filter(m => m.status === 'live');
    const finishedMatches = matches
        .filter(m => m.status === 'finished')
        .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
        .slice(0, 5);

    const handleEnter = (id: string) => {
        navigate(`${leagueBasePath}/match/${id}`);
    };

    return (
        <div className="animate-fade-in space-y-8">
            <header>
                <h1 className="text-2xl sm:text-3xl md:text-5xl font-outfit font-extrabold tracking-tight mb-1 uppercase">Ao Vivo</h1>
                <p className="text-slate-400 text-sm md:text-base">Acompanhe os resultados em tempo real</p>
            </header>

            {/* Live Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-danger rounded-full animate-pulse" />
                    <h2 className="text-xs font-black uppercase tracking-widest text-danger">Partidas em Curso</h2>
                </div>

                {liveMatches.length === 0 ? (
                    <div className="glass-panel p-16 text-center opacity-30 flex flex-col items-center gap-4">
                        <Signal size={48} strokeWidth={1} />
                        <p className="text-xs font-black uppercase tracking-widest">Nenhuma partida ao vivo no momento</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {liveMatches.map(match => {
                            const ht = teams.find(t => t.id === match.homeTeamId);
                            const at = teams.find(t => t.id === match.awayTeamId);
                            return (
                                <div key={match.id}
                                    onClick={() => handleEnter(match.id)}
                                    className="glass-panel p-6 border-danger/30 bg-danger/[0.03] hover:bg-danger/[0.06] transition-all cursor-pointer group border relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4">
                                        <div className="bg-danger text-white text-[0.5rem] font-black px-2 py-0.5 rounded uppercase tracking-[0.2em] animate-pulse">Live</div>
                                    </div>

                                    <div className="flex items-center justify-between gap-4 mb-4">
                                        <div className="flex flex-col items-center gap-2 flex-1">
                                            <TeamLogo src={ht?.logo} size={50} />
                                            <span className="text-[0.65rem] font-black text-white text-center uppercase tracking-wider">{ht?.name}</span>
                                        </div>

                                        <div className="flex flex-col items-center gap-2">
                                            <div className="text-3xl font-black font-outfit text-white flex items-center gap-4">
                                                <span className="text-primary">{match.homeScore}</span>
                                                <span className="text-white/20 text-sm">VS</span>
                                                <span className="text-accent">{match.awayScore}</span>
                                            </div>
                                            <div className="bg-black/40 px-3 py-1 rounded-full text-[0.5rem] font-black text-slate-500 uppercase tracking-widest">
                                                {match.period || 'Em jogo'}
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-center gap-2 flex-1">
                                            <TeamLogo src={at?.logo} size={50} />
                                            <span className="text-[0.65rem] font-black text-white text-center uppercase tracking-wider">{at?.name}</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-center pt-4 border-t border-white/[0.05]">
                                        <div className="flex items-center gap-2 text-primary font-black text-[0.55rem] uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                                            Ver Detalhes Súmula <Play size={10} fill="currentColor" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Recently Finished */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                    <History size={16} className="text-slate-500" />
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">Resultados Recentes</h2>
                </div>

                <div className="space-y-3">
                    {finishedMatches.length === 0 ? (
                        <p className="text-slate-600 text-[0.6rem] font-black uppercase tracking-widest py-4">Nenhuma partida finalizada recentemente</p>
                    ) : (
                        finishedMatches.map(match => {
                            const ht = teams.find(t => t.id === match.homeTeamId);
                            const at = teams.find(t => t.id === match.awayTeamId);
                            return (
                                <div key={match.id}
                                    onClick={() => handleEnter(match.id)}
                                    className="glass-panel p-4 border-white/[0.05] hover:bg-white/[0.02] transition-all cursor-pointer flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 flex-1">
                                        <TeamLogo src={ht?.logo} size={24} />
                                        <span className="text-[0.65rem] font-black text-white/70 uppercase truncate">{ht?.name}</span>
                                    </div>

                                    <div className="flex items-center gap-3 px-4 py-1.5 bg-black/40 rounded-xl border border-white/[0.03]">
                                        <span className="font-black text-sm text-white">{match.homeScore}</span>
                                        <span className="text-slate-800 text-[0.6rem] font-black">-</span>
                                        <span className="font-black text-sm text-white">{match.awayScore}</span>
                                    </div>

                                    <div className="flex items-center gap-3 flex-1 justify-end">
                                        <span className="text-[0.65rem] font-black text-white/70 uppercase truncate text-right">{at?.name}</span>
                                        <TeamLogo src={at?.logo} size={24} />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </section>
        </div>
    );
};

export default LiveMatches;
