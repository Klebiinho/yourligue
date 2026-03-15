import { useLeague } from '../context/LeagueContext';
import { Trophy, Info, Medal, TrendingUp, Heart, Wind, Star } from 'lucide-react';
import TeamLogo from '../components/TeamLogo';
import AdBanner from '../components/AdBanner';

const Standings = () => {
    const { teams, matches, isPublicView, userInteractions, interactWithTeam } = useLeague();

    // The stats are already calculated and sorted in LeagueContext useMemo
    const sortedTeams = [...teams].sort((a: any, b: any) => {
        return b.stats.points - a.stats.points || 
               (b.stats.goalsFor - b.stats.goalsAgainst) - (a.stats.goalsFor - a.stats.goalsAgainst) || 
               b.stats.goalsFor - a.stats.goalsFor;
    });

    const totalFinished = matches.filter((m: any) => m.status === 'finished').length;
    const myTeamId = userInteractions.find((i: any) => i.interactionType === 'supporting')?.teamId;

    return (
        <div className="animate-fade-in max-w-[1200px] mx-auto pb-12">
            {isPublicView && <AdBanner position="top" />}
            
            {/* Header Section */}
            <header className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 rounded-2xl bg-warning/10 border border-warning/20 shadow-[0_0_30px_rgba(234,179,8,0.15)]">
                            <Trophy size={32} className="text-warning" strokeWidth={2.5} />
                        </div>
                        <h1 className="text-3xl md:text-5xl font-outfit font-black tracking-tight uppercase text-white">
                            Tabela <span className="text-primary italic">da Liga</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <p className="text-slate-500 text-xs md:text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2">
                            <Medal size={14} className="text-primary" />
                            {totalFinished} Partidas Concluídas
                        </p>
                        <div className="w-1 h-1 rounded-full bg-slate-800" />
                        <p className="text-slate-500 text-xs md:text-sm font-black uppercase tracking-[0.2em]">
                            {teams.length} Clubes Participantes
                        </p>
                    </div>
                </div>
                
                {myTeamId && (
                    <div className="glass-panel px-6 py-3 border-primary/20 flex items-center gap-4 bg-primary/5 animate-pulse-subtle">
                        <Heart size={18} className="text-primary fill-primary/20" />
                        <div>
                            <span className="block text-[0.6rem] font-black text-slate-500 uppercase tracking-widest">Apoiando</span>
                            <span className="block text-sm font-black text-white uppercase truncate max-w-[150px]">
                                {teams.find((t: any) => t.id === myTeamId)?.name}
                            </span>
                        </div>
                    </div>
                )}
            </header>

            {/* Main Table Container */}
            <section className="glass-panel overflow-hidden border-white/[0.05] shadow-[0_32px_64px_rgba(0,0,0,0.5)] bg-slate-950/40 backdrop-blur-xl">
                {sortedTeams.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-slate-600 gap-6 opacity-40">
                        <Trophy size={80} strokeWidth={1} />
                        <h3 className="text-xl font-outfit font-black uppercase tracking-[0.3em] text-center px-4">Nenhum time cadastrado</h3>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto no-scrollbar">
                            <table className="w-full border-collapse min-w-[800px] table-fixed">
                                <thead>
                                    <tr className="bg-white/[0.02] text-[0.65rem] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/[0.05]">
                                        <th className="w-16 px-4 py-5 text-center">#</th>
                                        <th className="w-auto px-4 py-5 text-left">Clube</th>
                                        <th className="w-20 px-4 py-5 text-center text-white border-x border-white/[0.03]">Pts</th>
                                        <th className="w-16 px-4 py-5 text-center">PJ</th>
                                        <th className="w-16 px-4 py-5 text-center text-accent/80">V</th>
                                        <th className="w-16 px-4 py-5 text-center">E</th>
                                        <th className="w-16 px-4 py-5 text-center text-danger/80">D</th>
                                        <th className="w-20 px-4 py-5 text-center hidden md:table-cell">GP</th>
                                        <th className="w-20 px-4 py-5 text-center hidden md:table-cell">GC</th>
                                        <th className="w-20 px-4 py-5 text-center">SG</th>
                                        <th className="w-36 px-4 py-5 text-center">Últimos Jogos</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.04]">
                                    {sortedTeams.map((team, i) => {
                                        const sg = team.stats.goalsFor - team.stats.goalsAgainst;
                                        const isTop = i === 0 && team.stats.points > 0;
                                        const isZone = i >= sortedTeams.length - 3 && sortedTeams.length > 5;
                                        const isMyTeam = team.id === myTeamId;

                                        return (
                                            <tr key={team.id} className={`group hover:bg-white/[0.03] transition-all duration-300 relative ${isTop ? 'bg-primary/[0.03]' : isZone ? 'bg-danger/[0.02]' : ''} ${isMyTeam ? 'bg-accent/[0.05]' : ''}`}>
                                                {/* Position # */}
                                                <td className="px-4 py-4.5 text-center">
                                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black font-outfit text-xs transition-all duration-500 group-hover:scale-110 mx-auto ${
                                                        isTop ? 'bg-primary text-white shadow-[0_0_20px_rgba(109,40,217,0.4)] rotate-3' :
                                                        i < 3 ? 'bg-white/10 text-white' : 'text-slate-600'
                                                    }`}>
                                                        {i + 1}
                                                    </div>
                                                </td>

                                                {/* Club Name & Logo */}
                                                <td className="px-4 py-4.5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative flex-none transform transition-transform group-hover:scale-110">
                                                            <TeamLogo src={team.logo} size={38} className="shadow-lg" />
                                                            {isTop && (
                                                                <div className="absolute -top-1.5 -right-1.5 bg-warning text-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg animate-bounce-slow border-2 border-slate-900">
                                                                    <Trophy size={10} strokeWidth={4} />
                                                                </div>
                                                            )}
                                                            {isMyTeam && (
                                                                <div className="absolute -bottom-1 -left-1 text-accent drop-shadow-sm">
                                                                    <Heart size={14} fill="currentColor" strokeWidth={0} />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col min-w-0">
                                                            <span className={`font-outfit font-black uppercase tracking-wider truncate text-sm sm:text-base leading-none mb-1 ${isMyTeam ? 'text-accent' : 'text-white'}`}>
                                                                {team.name}
                                                            </span>
                                                            {isPublicView ? (
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); interactWithTeam(team.id, 'supporting'); }}
                                                                        className={`p-1 rounded-md transition-all ${userInteractions.some((i: any) => i.teamId === team.id && i.interactionType === 'supporting') ? 'text-primary bg-primary/20' : 'text-slate-600 hover:text-primary hover:bg-white/5'}`}
                                                                        title="Torcer"
                                                                    >
                                                                        <Heart size={12} strokeWidth={3} fill={userInteractions.some((i: any) => i.teamId === team.id && i.interactionType === 'supporting') ? 'currentColor' : 'none'} />
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); interactWithTeam(team.id, 'rival'); }}
                                                                        className={`p-1 rounded-md transition-all ${userInteractions.some((i: any) => i.teamId === team.id && i.interactionType === 'rival') ? 'text-danger bg-danger/20' : 'text-slate-600 hover:text-danger hover:bg-white/5'}`}
                                                                        title="Secar"
                                                                    >
                                                                        <Wind size={12} strokeWidth={3} />
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); interactWithTeam(team.id, 'favorite'); }}
                                                                        className={`p-1 rounded-md transition-all ${userInteractions.some((i: any) => i.teamId === team.id && i.interactionType === 'favorite') ? 'text-warning bg-warning/20' : 'text-slate-600 hover:text-warning hover:bg-white/5'}`}
                                                                        title="Favoritar"
                                                                    >
                                                                        <Star size={12} strokeWidth={3} fill={userInteractions.some((i: any) => i.teamId === team.id && i.interactionType === 'favorite') ? 'currentColor' : 'none'} />
                                                                    </button>
                                                                </div>
                                                            ) : isMyTeam && (
                                                                <span className="text-[0.55rem] font-black text-accent/50 uppercase tracking-[0.2em]">Meu Time</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Core Stats */}
                                                <td className="px-4 py-4.5 text-center border-x border-white/[0.03] bg-white/[0.01]">
                                                    <span className="font-black font-outfit text-xl text-primary drop-shadow-[0_0_10px_rgba(109,40,217,0.2)]">{team.stats.points}</span>
                                                </td>
                                                <td className="px-4 py-4.5 text-center font-bold text-slate-400 text-sm">{team.stats.matches}</td>
                                                <td className="px-4 py-4.5 text-center font-bold text-accent text-sm">{team.stats.wins}</td>
                                                <td className="px-4 py-4.5 text-center font-bold text-slate-500 text-sm">{team.stats.draws}</td>
                                                <td className="px-4 py-4.5 text-center font-bold text-danger text-sm">{team.stats.losses}</td>
                                                
                                                {/* Goals */}
                                                <td className="px-4 py-4.5 text-center text-slate-600 hidden md:table-cell text-xs font-bold uppercase">{team.stats.goalsFor}</td>
                                                <td className="px-4 py-4.5 text-center text-slate-600 hidden md:table-cell text-xs font-bold uppercase">{team.stats.goalsAgainst}</td>
                                                <td className={`px-4 py-4.5 text-center font-black font-outfit text-sm ${sg > 0 ? 'text-accent' : sg < 0 ? 'text-danger' : 'text-slate-700'}`}>
                                                    {sg > 0 ? `+${sg}` : sg}
                                                </td>

                                                {/* Recent Form Tracker */}
                                                <td className="px-4 py-4.5">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        {team.stats.form.map((res: any, idx: number) => (
                                                            <div key={idx} className={`w-2.5 h-2.5 rounded-full flex items-center justify-center text-[0.4rem] font-black shadow-sm transform transition-all hover:scale-150 ${
                                                                res === 'W' ? 'bg-accent text-white shadow-accent/20' : 
                                                                res === 'D' ? 'bg-slate-500 text-white' : 
                                                                'bg-danger text-white shadow-danger/20'
                                                            }`} title={res === 'W' ? 'Vitória' : res === 'D' ? 'Empate' : 'Derrota'} />
                                                        ))}
                                                        {team.stats.form.length === 0 && <span className="text-[0.5rem] font-black text-slate-700 uppercase tracking-widest italic">—</span>}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer Information / Legend */}
                        <div className="bg-black/40 px-6 py-5 border-t border-white/[0.05] flex flex-wrap items-center justify-between gap-6">
                            <div className="flex flex-wrap items-center gap-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-3.5 h-3.5 bg-primary/20 rounded-md border border-primary/40 shadow-[0_0_10px_rgba(109,40,217,0.1)]" />
                                    <span className="text-[0.6rem] font-black text-slate-500 uppercase tracking-[0.2em]">Classificação</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-3.5 h-3.5 bg-danger/20 rounded-md border border-danger/40 shadow-[0_0_10px_rgba(239,68,68,0.1)]" />
                                    <span className="text-[0.6rem] font-black text-slate-500 uppercase tracking-[0.2em]">Zona Crítica</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-3.5 h-3.5 bg-accent/20 rounded-md border border-accent/40" />
                                    <span className="text-[0.6rem] font-black text-slate-500 uppercase tracking-[0.2em]">Meu Time</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2 text-[0.6rem] font-black text-slate-500 uppercase tracking-[0.1em] italic">
                                    <Info size={14} className="text-primary opacity-60" />
                                    <span>Critérios: Pts &gt; SG &gt; GP</span>
                                </div>
                                <div className="flex items-center gap-2 text-[0.6rem] font-black text-slate-500 uppercase tracking-[0.1em] italic">
                                    <TrendingUp size={14} className="text-accent opacity-60" />
                                    <span>Atualização Realtime</span>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </section>

            {isPublicView && (
                <div className="mt-12 group">
                    <AdBanner position="standings_info" className="transition-all group-hover:brightness-110" />
                </div>
            )}
        </div>
    );
};

export default Standings;
