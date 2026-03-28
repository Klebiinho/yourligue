import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLeague, type Team, type Match } from '../context/LeagueContext';
import { User, Target, Zap, Clock, ArrowLeft, Star, TrendingUp, Medal, History, Crown, ShieldAlert, CheckCircle, Activity } from 'lucide-react';
import TeamLogo from '../components/TeamLogo';

const PlayerDetail = () => {
    const { playerSlug, slug: leagueSlug } = useParams<{ playerSlug: string; slug: string }>();
    const navigate = useNavigate();
    const { 
        league, teams, matches, getPlayerSlug, getTeamSlug, 
        loading: leagueLoading 
    } = useLeague();

    // Find the player across all teams
    const playerWithTeam = useMemo(() => {
        for (const team of (teams as Team[])) {
            const player = team.players.find(p => getPlayerSlug(p) === playerSlug);
            if (player) return { player, team };
        }
        return null;
    }, [teams, playerSlug, getPlayerSlug]);

    if (!playerWithTeam && !leagueLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                    <User size={40} className="text-slate-600" />
                </div>
                <h2 className="text-2xl font-black font-outfit uppercase tracking-tight mb-2">Atleta não encontrado</h2>
                <p className="text-slate-500 mb-8 max-w-xs">Não conseguimos localizar este jogador na liga atual.</p>
                <button onClick={() => navigate(-1)} className="bg-primary text-white px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest">
                    Voltar
                </button>
            </div>
        );
    }

    if (!playerWithTeam) return null;

    const { player, team } = playerWithTeam;
    const isBasket = league?.sportType === 'basketball';
    const isGK = (player.position || '').toLowerCase().includes('goleiro') || (player.position || '').toLowerCase().includes('gk') || (player.position || '').toLowerCase().includes('gol');
    
    // Player matches
    const playerMatches = (matches as Match[]).filter(m => 
        (m.homeTeamId === team.id || m.awayTeamId === team.id) && 
        m.status === 'finished'
    ).sort((a,b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());

    // Calculate specific stats from matches (performance trend)
    const recentStats = playerMatches.slice(0, 5).map(m => {
        const playerEvents = (m.events || []).filter(e => e.playerId === player.id);
        if (isBasket) {
            const p1 = playerEvents.filter(e => e.type === 'points_1').length;
            const p2 = playerEvents.filter(e => e.type === 'points_2').length;
            const p3 = playerEvents.filter(e => e.type === 'points_3').length;
            return { label: m.updatedAt ? new Date(m.updatedAt).toLocaleDateString() : '?', val: (p1*1 + p2*2 + p3*3) };
        } else {
            return { label: m.updatedAt ? new Date(m.updatedAt).toLocaleDateString() : '?', val: playerEvents.filter(e => e.type === 'goal' || e.type === 'penalty_goal').length };
        }
    }).reverse();

    const stats = [
        { label: 'Partidas', value: player.stats.matchesPlayed, icon: <Activity className="text-slate-400" /> },
        { label: isBasket ? 'Pontos' : 'Gols', value: isBasket ? player.stats.points : player.stats.goals, icon: <Target className="text-accent" /> },
        { label: 'Assistências', value: player.stats.assists, icon: <Zap className="text-primary" /> },
        { label: 'MVP', value: player.stats.mvp, icon: <Crown className="text-warning" /> },
    ];

    const secondaryStats = [
        { label: isBasket ? 'Rebotes' : 'Amarelos', value: isBasket ? player.stats.rebounds : player.stats.yellowCards, icon: isBasket ? <TrendingUp className="text-warning" /> : <div className="w-3 h-4 bg-yellow-400 rounded-sm" /> },
        { label: isBasket ? 'Tocos' : 'Vermelhos', value: isBasket ? player.stats.blocks : player.stats.redCards, icon: isBasket ? <Medal className="text-danger" /> : <div className="w-3 h-4 bg-red-500 rounded-sm" /> },
    ];

    if (isGK && !isBasket) {
        secondaryStats.push(
            { label: 'Gols Sofridos', value: player.stats.goalsConceded, icon: <ShieldAlert className="text-danger" /> },
            { label: 'Clean Sheets', value: player.stats.cleanSheets, icon: <CheckCircle className="text-success" /> }
        );
    } else if (isBasket) {
        secondaryStats.push(
            { label: 'Roubos', value: player.stats.steals, icon: <Zap size={16} className="text-primary" /> },
            { label: 'Faltas', value: player.stats.fouls, icon: <ShieldAlert size={16} className="text-danger" /> }
        );
    }

    return (
        <div className="animate-fade-in max-w-5xl mx-auto pb-20">
            {/* Back Button */}
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-8 group text-[0.6rem] font-black uppercase tracking-widest">
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Voltar
            </button>

            {/* Profile Header Card */}
            <div className="relative mb-10">
                {/* Background Decor */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 rounded-[2.5rem] -rotate-1 scale-[1.02] opacity-50" />
                
                <div className="relative glass-panel p-8 sm:p-12 overflow-hidden">
                    {/* Big Team Logo Background */}
                    <div className="absolute -right-10 -bottom-10 opacity-[0.03] rotate-12">
                        <TeamLogo src={team.logo} size={300} />
                    </div>

                    <div className="flex flex-col md:flex-row items-center md:items-end gap-8 md:gap-12">
                        {/* Player Photo */}
                        <div className="relative group flex-none">
                            <div className="w-32 h-32 sm:w-44 sm:h-44 rounded-full bg-[#0a0a0f] border-4 border-white/5 shadow-2xl flex items-center justify-center overflow-hidden ring-4 ring-white/[0.02]">
                                {player.photo ? (
                                    <img src={player.photo} className="w-full h-full object-cover" alt={player.name} />
                                ) : (
                                    <User size={60} className="text-slate-800" />
                                )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl bg-primary flex items-center justify-center font-black font-outfit text-xl shadow-xl shadow-primary/30 border-2 border-[#0a0a0f] text-white">
                                {player.number}
                            </div>
                        </div>

                        {/* Player Name & Team */}
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-3">
                                <h1 className="text-3xl sm:text-4xl md:text-6xl font-outfit font-extrabold tracking-tighter uppercase leading-none">
                                    {player.name}
                                </h1>
                                {player.isCaptain && (
                                    <div className="flex items-center justify-center gap-2 px-3 py-1 bg-warning/20 text-warning rounded-full border border-warning/10 text-[0.6rem] font-black uppercase tracking-widest w-fit mx-auto md:mx-0">
                                        <Star size={12} fill="currentColor" /> Capitão
                                    </div>
                                )}
                            </div>
                            <div 
                                onClick={() => navigate(`/${leagueSlug}/${getTeamSlug(team)}/team`)}
                                className="flex items-center justify-center md:justify-start gap-4 cursor-pointer group/team"
                            >
                                <TeamLogo src={team.logo} size={32} />
                                <div className="text-left">
                                    <span className="text-slate-400 text-[0.6rem] font-black uppercase tracking-[0.2em] block mb-0.5">Clube Atual</span>
                                    <span className="font-outfit font-black text-lg md:text-xl uppercase tracking-wider group-hover/team:text-primary transition-colors">{team.name}</span>
                                </div>
                            </div>
                        </div>

                        {/* Position Badge */}
                        <div className="flex flex-col items-center md:items-end gap-2 text-center md:text-right">
                             <span className="text-slate-600 text-[0.6rem] font-black uppercase tracking-widest">Posição</span>
                             <div className="px-6 py-2.5 bg-white/5 rounded-2xl border border-white/5 font-black uppercase text-xs tracking-widest text-white shadow-sm">
                                 {player.position}
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                {stats.map((stat, i) => (
                    <div key={i} className="glass-panel p-6 flex flex-col items-center justify-center text-center group hover:scale-[1.02] transition-transform">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-3 group-hover:bg-white/[0.08] transition-colors">
                            {stat.icon}
                        </div>
                        <span className="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</span>
                        <span className="text-3xl font-black font-outfit text-white">{stat.value}</span>
                    </div>
                ))}
            </div>

            {/* Secondary Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {secondaryStats.map((stat, i) => (
                    <div key={i} className="glass-panel p-4 flex items-center gap-4 transition-all hover:bg-white/[0.04]">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center scale-90">
                            {stat.icon}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[0.55rem] font-black text-slate-500 uppercase tracking-widest">{stat.label}</span>
                            <span className="text-xl font-black font-outfit text-white leading-none">{stat.value}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Desempenho Recente */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-sm font-black font-outfit uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                        <TrendingUp size={18} className="text-accent" /> Histórico Recente
                    </h2>
                    
                    <div className="glass-panel p-8 min-h-[300px] flex flex-col">
                        {recentStats.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center opacity-20 gap-4">
                                <History size={48} strokeWidth={1} />
                                <span className="text-[0.6rem] font-black uppercase tracking-widest">Nenhum dado de jogo disponível</span>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-end justify-between gap-2 sm:gap-4 pt-10">
                                {recentStats.map((s, i) => {
                                    const maxVal = Math.max(...recentStats.map(x => x.val), 1);
                                    const height = (s.val / maxVal) * 100;
                                    return (
                                        <div key={i} className="flex-1 flex flex-col items-center group">
                                            <div className="relative w-full flex flex-col items-center group">
                                                <span className="absolute -top-7 text-[0.65rem] font-black text-accent opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 px-2 py-1 rounded-md border border-white/5">{s.val}</span>
                                                <div 
                                                    style={{ height: `${Math.max(5, height)}%` }}
                                                    className={`w-full max-w-[40px] rounded-t-lg transition-all duration-700 delay-[${i*100}ms] ${i === recentStats.length-1 ? 'bg-gradient-to-t from-primary/50 to-primary shadow-[0_0_20px_rgba(109,40,217,0.3)]' : 'bg-white/10 group-hover:bg-white/20'}`}
                                                />
                                            </div>
                                            <span className="mt-4 text-[0.55rem] font-black text-slate-600 uppercase tracking-tighter sm:tracking-widest rotate-[-15deg] whitespace-nowrap">{s.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Ultimas Partidas */}
                <div className="space-y-6">
                    <h2 className="text-sm font-black font-outfit uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                        <Clock size={18} className="text-primary" /> Últimos Jogos
                    </h2>
                    
                    <div className="space-y-3">
                        {playerMatches.slice(0, 4).map(m => {
                            const ht = teams.find(t => t.id === m.homeTeamId);
                            const at = teams.find(t => t.id === m.awayTeamId);
                            const events = m.events.filter(e => e.playerId === player.id);
                            const score = isBasket ? events.filter(e => e.type.startsWith('points_')).reduce((acc,e) => acc + (parseInt(e.type.split('_')[1])), 0) : events.filter(e => e.type === 'goal' || e.type === 'penalty_goal').length;
                            
                            return (
                                <div key={m.id} className="glass-panel p-4 flex flex-col gap-3 group hover:bg-white/[0.04] transition-colors cursor-pointer" onClick={() => navigate(`/${leagueSlug}/${getPlayerSlug(player)}/match`)}>
                                    <div className="flex items-center justify-between text-[0.5rem] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">
                                        <span>{m.updatedAt ? new Date(m.updatedAt).toLocaleDateString() : 'Partida Encerrada'}</span>
                                        <span className="text-primary">Ver Súmula →</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <TeamLogo src={ht?.logo} size={20} />
                                            <span className="font-bold truncate text-[0.65rem]">{ht?.name}</span>
                                        </div>
                                        <div className="font-black text-xs px-2 py-1 bg-black/40 rounded border border-white/5">{m.homeScore} - {m.awayScore}</div>
                                        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end text-right">
                                            <span className="font-bold truncate text-[0.65rem]">{at?.name}</span>
                                            <TeamLogo src={at?.logo} size={20} />
                                        </div>
                                    </div>
                                    {score > 0 && (
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                                            <span className="text-[0.6rem] font-bold text-accent uppercase tracking-widest">+ {score} {isBasket ? 'Pontos' : 'Gols'} marcados</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlayerDetail;
