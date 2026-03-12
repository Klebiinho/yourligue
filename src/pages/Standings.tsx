import { useLeague } from '../context/LeagueContext';
import { Trophy, Shield, Info, Medal, TrendingUp } from 'lucide-react';
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
        <div className="animate-fade-in">
            {/* Header */}
            <header className="mb-8">
                <h1 className="text-2xl sm:text-3xl md:text-5xl font-outfit font-extrabold tracking-tight mb-2 uppercase flex items-center gap-3">
                    <Trophy size={36} className="text-warning drop-shadow-[0_0_15px_rgba(234,179,8,0.4)]" strokeWidth={2.5} />
                    Tabela da Liga
                </h1>
                <p className="text-slate-400 text-sm md:text-base flex items-center gap-2">
                    <Medal size={16} className="text-primary" />
                    {totalFinished} partidas concluídas
                </p>
            </header>

            {/* Table Card */}
            <section className="glass-panel overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
                {sortedTeams.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-slate-500 gap-6 opacity-40">
                        <Trophy size={70} strokeWidth={1} />
                        <h3 className="text-lg font-outfit font-black uppercase tracking-widest text-center px-4">Nenhum time cadastrado ainda</h3>
                    </div>
                ) : (
                    <>
                        {/* Scrollable Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse min-w-[420px]">
                                <thead>
                                    <tr className="bg-white/[0.03] text-[0.6rem] font-black text-slate-500 uppercase tracking-widest border-b border-white/[0.05]">
                                        <th className="px-3 sm:px-5 py-4 text-center w-12">#</th>
                                        <th className="px-3 sm:px-5 py-4 text-left">Clube</th>
                                        <th className="px-2 sm:px-4 py-4 text-center text-white font-outfit">Pts</th>
                                        <th className="px-2 sm:px-3 py-4 text-center">PJ</th>
                                        <th className="px-2 sm:px-3 py-4 text-center text-accent">V</th>
                                        <th className="px-2 sm:px-3 py-4 text-center">E</th>
                                        <th className="px-2 sm:px-3 py-4 text-center text-danger">D</th>
                                        <th className="px-2 sm:px-3 py-4 text-center hidden sm:table-cell">GP</th>
                                        <th className="px-2 sm:px-3 py-4 text-center hidden sm:table-cell">GC</th>
                                        <th className="px-2 sm:px-3 py-4 text-center">SG</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.04]">
                                    {sortedTeams.map((team, i) => {
                                        const pts = team.stats.wins * (league?.pointsForWin ?? 3) + team.stats.draws * (league?.pointsForDraw ?? 1) + team.stats.losses * (league?.pointsForLoss ?? 0);
                                        const sg = team.stats.goalsFor - team.stats.goalsAgainst;
                                        const isTop = i === 0 && pts > 0;
                                        const isZone = i >= sortedTeams.length - 3 && sortedTeams.length > 4;

                                        return (
                                            <tr key={team.id} className={`group hover:bg-white/[0.04] transition-all duration-300 ${isTop ? 'bg-primary/[0.04]' : isZone ? 'bg-danger/[0.03]' : ''}`}>
                                                {/* Position */}
                                                <td className="px-3 sm:px-5 py-4 text-center">
                                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black font-outfit text-xs transition-transform group-hover:scale-110 mx-auto ${isTop ? 'bg-primary text-white shadow-lg shadow-primary/30' :
                                                            i < 3 ? 'bg-white/10 text-white' : 'text-slate-600'
                                                        }`}>
                                                        {i + 1}
                                                    </div>
                                                </td>
                                                {/* Club Name */}
                                                <td className="px-3 sm:px-5 py-4">
                                                    <div className="flex items-center gap-2 sm:gap-3">
                                                        <div className="relative flex-none">
                                                            <TeamLogo src={team.logo} size={34} />
                                                            {isTop && (
                                                                <div className="absolute -top-1 -right-1 bg-warning text-black w-4 h-4 rounded-full flex items-center justify-center">
                                                                    <Trophy size={9} strokeWidth={4} />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <span className="font-outfit font-black text-white uppercase tracking-wide truncate max-w-[100px] sm:max-w-none text-xs sm:text-sm">
                                                            {team.name}
                                                        </span>
                                                        {isTop && <Shield size={14} className="text-primary fill-primary/10 hidden md:block flex-none" />}
                                                    </div>
                                                </td>
                                                {/* Stats */}
                                                <td className="px-2 sm:px-4 py-4 text-center font-black font-outfit text-base sm:text-lg text-primary">{pts}</td>
                                                <td className="px-2 sm:px-3 py-4 text-center font-bold text-slate-400 text-xs sm:text-sm">{team.stats.matches}</td>
                                                <td className="px-2 sm:px-3 py-4 text-center font-bold text-accent text-xs sm:text-sm">{team.stats.wins}</td>
                                                <td className="px-2 sm:px-3 py-4 text-center font-bold text-slate-500 text-xs sm:text-sm">{team.stats.draws}</td>
                                                <td className="px-2 sm:px-3 py-4 text-center font-bold text-danger text-xs sm:text-sm">{team.stats.losses}</td>
                                                <td className="px-2 sm:px-3 py-4 text-center text-slate-500 hidden sm:table-cell text-xs">{team.stats.goalsFor}</td>
                                                <td className="px-2 sm:px-3 py-4 text-center text-slate-500 hidden sm:table-cell text-xs">{team.stats.goalsAgainst}</td>
                                                <td className={`px-2 sm:px-3 py-4 text-center font-black font-outfit text-xs sm:text-sm ${sg > 0 ? 'text-accent' : sg < 0 ? 'text-danger' : 'text-slate-600'}`}>
                                                    {sg > 0 ? `+${sg}` : sg}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Legend */}
                        <div className="bg-black/30 px-4 sm:px-6 py-4 border-t border-white/[0.05] flex flex-wrap items-center gap-x-6 gap-y-2">
                            <div className="flex items-center gap-2 text-[0.6rem] font-black text-slate-600 uppercase tracking-widest">
                                <div className="w-3 h-3 bg-primary/20 rounded border border-primary/30" />
                                <span>Classificação</span>
                            </div>
                            <div className="flex items-center gap-2 text-[0.6rem] font-black text-slate-600 uppercase tracking-widest">
                                <div className="w-3 h-3 bg-danger/20 rounded border border-danger/30" />
                                <span>Zona de Queda</span>
                            </div>
                            <div className="flex items-center gap-2 text-[0.6rem] font-black text-slate-600 uppercase tracking-widest ml-auto italic">
                                <Info size={11} className="text-primary flex-none" />
                                <span className="hidden sm:inline">Critérios: PTS &gt; SG &gt; GP</span>
                                <TrendingUp size={11} className="text-accent flex-none" />
                            </div>
                        </div>
                    </>
                )}
            </section>
        </div>
    );
};

export default Standings;
