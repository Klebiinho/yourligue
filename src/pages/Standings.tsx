import { useLeague } from '../context/LeagueContext';
import { Trophy, Shield, Info, Medal } from 'lucide-react';
import TeamLogo from '../components/TeamLogo';

const Standings = () => {
    const { league, teams, matches } = useLeague();

    const sortedTeams = [...teams].sort((a, b) => {
        const pts = (t: typeof teams[0]) =>
            t.stats.wins * (league?.pointsForWin ?? 3) +
            t.stats.draws * (league?.pointsForDraw ?? 1) +
            t.stats.losses * (league?.pointsForLoss ?? 0);
        const sgA = a.stats.goalsFor - a.stats.goalsAgainst;
        const sgB = b.stats.goalsFor - b.stats.goalsAgainst;
        return pts(b) - pts(a) || sgB - sgA || b.stats.goalsFor - a.stats.goalsFor;
    });

    const totalFinished = matches.filter(m => m.status === 'finished').length;

    return (
        <div className="animate-fade-in pb-24 md:pb-8 p-4 md:p-0">
            <header className="mb-8 md:mb-12">
                <h1 className="text-3xl md:text-5xl font-outfit font-extrabold tracking-tight mb-2 uppercase flex items-center gap-4">
                    <Trophy size={42} className="text-warning drop-shadow-[0_0_15px_rgba(234,179,8,0.4)]" strokeWidth={2.5} />
                    Tabela da Liga
                </h1>
                <p className="text-slate-400 font-medium md:text-lg flex items-center gap-2">
                    <Medal size={18} className="text-primary" />
                    {totalFinished} partidas concluídas no total
                </p>
            </header>

            <section className="glass-panel overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                {sortedTeams.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-slate-500 gap-6 opacity-50">
                        <Trophy size={80} strokeWidth={1} />
                        <h3 className="text-xl font-outfit font-black uppercase tracking-widest">Nenhum time cadastrado</h3>
                    </div>
                ) : (
                    <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-white/5 text-[0.65rem] font-black text-slate-400 uppercase tracking-widest border-b border-white/5">
                                    <th className="px-6 py-5 text-center w-16">Pos</th>
                                    <th className="px-6 py-5 text-left">Clube / Time</th>
                                    <th className="px-4 py-5 text-center font-outfit text-white">Pts</th>
                                    <th className="px-4 py-5 text-center">PJ</th>
                                    <th className="px-4 py-5 text-center text-accent">V</th>
                                    <th className="px-4 py-5 text-center">E</th>
                                    <th className="px-4 py-5 text-center text-danger">D</th>
                                    <th className="px-4 py-5 text-center hidden sm:table-cell">GP</th>
                                    <th className="px-4 py-5 text-center hidden sm:table-cell">GC</th>
                                    <th className="px-4 py-5 text-center">SG</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {sortedTeams.map((team, i) => {
                                    const pts = team.stats.wins * (league?.pointsForWin ?? 3) + team.stats.draws * (league?.pointsForDraw ?? 1) + team.stats.losses * (league?.pointsForLoss ?? 0);
                                    const sg = team.stats.goalsFor - team.stats.goalsAgainst;
                                    const isTop = i === 0 && pts > 0;
                                    const isZone = i >= sortedTeams.length - 3 && sortedTeams.length > 4;

                                    return (
                                        <tr key={team.id} className={`group hover:bg-white/5 transition-all duration-300 ${isTop ? 'bg-primary/5' : isZone ? 'bg-danger/5' : ''}`}>
                                            <td className="px-6 py-5 text-center">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black font-outfit text-sm transition-transform group-hover:scale-110 ${isTop ? 'bg-primary text-white shadow-lg shadow-primary/20' :
                                                        i < 3 ? 'bg-white/10 text-white' : 'text-slate-500 font-bold'
                                                    }`}>
                                                    {i + 1}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4 min-w-[200px]">
                                                    <div className="relative">
                                                        <TeamLogo src={team.logo} size={40} />
                                                        {isTop && (
                                                            <div className="absolute -top-1 -right-1 bg-warning text-black w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                                                                <Trophy size={10} strokeWidth={4} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="font-outfit font-black text-white uppercase tracking-wide truncate max-w-[180px] text-base">
                                                        {team.name}
                                                    </span>
                                                    {isTop && i === 0 && <Shield size={16} className="text-primary fill-primary/10 hidden sm:block" />}
                                                </div>
                                            </td>
                                            <td className="px-4 py-5 text-center font-black font-outfit text-xl text-primary">{pts}</td>
                                            <td className="px-4 py-5 text-center font-bold text-slate-300">{team.stats.matches}</td>
                                            <td className="px-4 py-5 text-center font-bold text-accent">{team.stats.wins}</td>
                                            <td className="px-4 py-5 text-center font-bold text-slate-400">{team.stats.draws}</td>
                                            <td className="px-4 py-5 text-center font-bold text-danger">{team.stats.losses}</td>
                                            <td className="px-4 py-5 text-center text-slate-500 hidden sm:table-cell">{team.stats.goalsFor}</td>
                                            <td className="px-4 py-5 text-center text-slate-500 hidden sm:table-cell">{team.stats.goalsAgainst}</td>
                                            <td className={`px-4 py-5 text-center font-black font-outfit ${sg > 0 ? 'text-accent' : sg < 0 ? 'text-danger' : 'text-slate-500'}`}>
                                                {sg > 0 ? `+${sg}` : sg}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {sortedTeams.length > 0 && (
                    <div className="bg-black/40 px-6 py-5 border-t border-white/5 flex flex-wrap gap-x-8 gap-y-3">
                        <div className="flex items-center gap-2.5 text-[0.65rem] font-black text-slate-500 uppercase tracking-widest">
                            <div className="w-3 h-3 bg-primary/20 rounded border border-primary/30" />
                            <span>Qualificação / Campeão</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-[0.65rem] font-black text-slate-500 uppercase tracking-widest">
                            <div className="w-3 h-3 bg-danger/20 rounded border border-danger/30" />
                            <span>Risco de Queda</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-[0.65rem] font-black text-slate-400 uppercase tracking-widest ml-auto italic">
                            <Info size={12} className="text-primary" />
                            Critérios: PTS &gt; SG &gt; GP
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
};

export default Standings;
