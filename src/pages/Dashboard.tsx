import { useState } from 'react';
import { useLeague } from '../context/LeagueContext';
import { Trophy, Users, Swords, Calendar, ChevronRight, TrendingUp, Star, ArrowRight, Zap, XCircle, Bell, BellOff, Heart, Wind, ArrowUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TeamLogo from '../components/TeamLogo';
import AdBanner from '../components/AdBanner';

import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { league, teams, matches, loading, dataLoading, isPublicView, isAdmin, leagueBasePath, followedLeagues, followLeague, unfollowLeague, setShowAuthModal, userInteractions, interactWithTeam } = useLeague();
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const isBasket = league?.sportType === 'basketball';

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
    );

    if (dataLoading) return (
        <div className="animate-fade-in space-y-6 md:space-y-8 pb-10">
            <header>
                <h1 className="text-xl sm:text-2xl md:text-4xl font-outfit font-extrabold tracking-tight leading-tight opacity-50">
                    {league?.name ?? '…'}
                </h1>
                <p className="text-slate-600 mt-1 text-xs font-black uppercase tracking-widest">Carregando dados...</p>
            </header>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                {[0,1,2,3].map(i => (
                    <div key={i} className="glass-panel p-5 animate-pulse space-y-2">
                        <div className="h-8 bg-white/[0.08] rounded-xl w-1/2" />
                        <div className="h-3 bg-white/[0.05] rounded-lg w-3/4" />
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-8">
                <div className="lg:col-span-2 glass-panel p-6 animate-pulse space-y-3">
                    {[0,1,2,3,4].map(i => (
                        <div key={i} className="h-14 bg-white/[0.06] rounded-2xl" />
                    ))}
                </div>
                <div className="glass-panel p-6 animate-pulse space-y-3">
                    {[0,1,2,3,4].map(i => (
                        <div key={i} className="h-10 bg-white/[0.06] rounded-2xl" />
                    ))}
                </div>
            </div>
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
        { label: isBasket ? 'Pontos' : 'Gols', value: totalGoals, icon: <TrendingUp size={18} />, gradientFrom: 'from-warning/20', border: 'border-warning/20', text: 'text-warning' },
        { label: 'Ao Vivo', value: liveMatches.length, icon: <Star size={18} />, gradientFrom: 'from-danger/20', border: 'border-danger/20', text: 'text-danger' },
    ];

    const formatDate = (dt?: string) =>
        dt ? new Date(dt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '';

    const calcPoints = (t: typeof teams[0]) => 
        (t.stats?.wins || 0) * (league?.pointsForWin || 3) + 
        (t.stats?.draws || 0) * (league?.pointsForDraw || 1) + 
        (t.stats?.losses || 0) * (league?.pointsForLoss || 0);

    const sortedTeams = [...teams].sort((a, b) => {
        return calcPoints(b) - calcPoints(a);
    });

    const allPlayers = teams.flatMap(t => t.players.map(p => ({ ...p, team: t })));
    const topScorers = [...allPlayers].sort((a, b) => {
        const valA = isBasket ? (a.stats?.points || 0) : (a.stats?.goals || 0);
        const valB = isBasket ? (b.stats?.points || 0) : (b.stats?.goals || 0);
        return valB - valA;
    }).filter(p => (isBasket ? (p.stats?.points || 0) : (p.stats?.goals || 0)) > 0).slice(0, 5);
    const topAssisters = [...allPlayers].sort((a, b) => (b.stats?.assists || 0) - (a.stats?.assists || 0)).filter(p => (p.stats?.assists || 0) > 0).slice(0, 5);
    const topRebounders = [...allPlayers].sort((a, b) => (b.stats?.rebounds || 0) - (a.stats?.rebounds || 0)).filter(p => (p.stats?.rebounds || 0) > 0).slice(0, 5);

    const [activeTab, setActiveTab] = useState<'matches' | 'standings' | 'scorers'>('matches');
    const [showTopRankModal, setShowTopRankModal] = useState<{ open: boolean, type: 'goals' | 'assists' | 'rebounds' }>({ open: false, type: 'goals' });

    return (
        <div className="animate-fade-in space-y-6 md:space-y-8 pb-10">
            {isPublicView && <AdBanner position="top" />}
            {/* ── Header ────────────────────────────────────────────────── */}
            <header>
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h1 className="text-xl sm:text-2xl md:text-4xl font-outfit font-extrabold tracking-tight leading-tight">
                            {(isPublicView || !isAdmin) ? 'Acompanhe a Liga 👋' : 'Bem-vindo 👋'}
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
                    {isPublicView && league && (
                        <button
                            onClick={() => {
                                if (!user) {
                                    setShowAuthModal(true);
                                    return;
                                }
                                if (followedLeagues.some(f => f.id === league.id)) {
                                    unfollowLeague(league.id);
                                } else {
                                    followLeague(league.id);
                                }
                            }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[0.6rem] font-black uppercase tracking-widest flex-none self-start mt-1 transition-all border ${followedLeagues.some(f => f.id === league.id)
                                ? 'bg-danger/10 border-danger/20 text-danger hover:bg-danger hover:text-white'
                                : 'bg-accent/10 border-accent/20 text-accent hover:bg-accent hover:text-white'
                                }`}
                        >
                            {followedLeagues.some(f => f.id === league.id) ? <BellOff size={14} /> : <Bell size={14} />}
                            {followedLeagues.some(f => f.id === league.id) ? 'Parar de Acompanhar' : 'Acompanhar Liga'}
                        </button>
                    )}
                    {!isPublicView && isAdmin && league && (
                        <button
                            onClick={() => {
                                const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
                                const url = `${baseUrl}/view/${league.slug || league.id}`;
                                navigator.clipboard.writeText(url);
                                alert('Link da visão de telespectador copiado!');
                            }}
                            className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all text-[0.6rem] font-black uppercase tracking-widest flex-none self-start mt-1"
                        >
                            <ArrowRight size={12} className="rotate-[-45deg]" /> Compartilhar
                        </button>
                    )}
                </div>
            </header>

            {isPublicView && <AdBanner position="home_stats" />}

            {/* ── Stats Row ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
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
                        <button onClick={() => navigate(`${leagueBasePath}/matches`)} className="flex items-center gap-1 text-primary text-[0.6rem] sm:text-xs font-black uppercase tracking-widest hover:text-white transition-colors">
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
                                        onClick={() => navigate(`${leagueBasePath}/match/${match.id}`)}
                                        className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-5 cursor-pointer transition-all duration-200 ${isLive ? 'bg-danger/[0.04]' : 'hover:bg-white/[0.03]'}`}>

                                        {/* Home: logo + nome */}
                                        <div onClick={(e) => { e.stopPropagation(); navigate(`${leagueBasePath}/teams/${ht?.id}`); }} className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer h-full hover:bg-white/5 p-1 rounded-xl transition-all">
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
                                        <div onClick={(e) => { e.stopPropagation(); navigate(`${leagueBasePath}/teams/${at?.id}`); }} className="flex items-center gap-2 flex-1 min-w-0 justify-end cursor-pointer h-full hover:bg-white/5 p-1 rounded-xl transition-all">
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
                    {isPublicView && <AdBanner position="home_highlight" />}

                    {/* ── CLASSIFICAÇÃO ──────────────────────────────────────── */}
                    <div className={`${activeTab === 'standings' || activeTab === 'matches' ? 'block' : 'hidden md:block'} space-y-4`}>
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-black font-outfit uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                <Trophy size={16} className="text-warning" />
                                Classificação
                            </h2>
                            <button onClick={() => navigate(`${leagueBasePath}/standings`)} className="flex items-center gap-1 text-accent text-[0.6rem] sm:text-xs font-black uppercase tracking-widest hover:text-white transition-colors">
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
                                    const pts = calcPoints(team);
                                    return (
                                        <div key={team.id} 
                                            onClick={() => navigate(`${leagueBasePath}/teams/${team.id}`)}
                                            className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3.5 hover:bg-white/[0.08] transition-all cursor-pointer group"
                                        >
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

                                            {isPublicView && (
                                                <div className="flex gap-1 items-center pl-2 border-l border-white/5">
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); interactWithTeam(team.id, 'supporting'); }}
                                                        className={`p-1 rounded-md transition-all ${userInteractions.some(i => i.teamId === team.id && i.interactionType === 'supporting') ? 'text-primary bg-primary/20' : 'text-slate-600 hover:text-primary hover:bg-white/5'}`}
                                                    >
                                                        <Heart size={10} strokeWidth={3} fill={userInteractions.some(i => i.teamId === team.id && i.interactionType === 'supporting') ? 'currentColor' : 'none'} />
                                                    </button>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); interactWithTeam(team.id, 'rival'); }}
                                                        className={`p-1 rounded-md transition-all ${userInteractions.some(i => i.teamId === team.id && i.interactionType === 'rival') ? 'text-danger bg-danger/20' : 'text-slate-600 hover:text-danger hover:bg-white/5'}`}
                                                    >
                                                        <Wind size={10} strokeWidth={3} />
                                                    </button>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); interactWithTeam(team.id, 'favorite'); }}
                                                        className={`p-1 rounded-md transition-all ${userInteractions.some(i => i.teamId === team.id && i.interactionType === 'favorite') ? 'text-warning bg-warning/20' : 'text-slate-600 hover:text-warning hover:bg-white/5'}`}
                                                    >
                                                        <Star size={10} strokeWidth={3} fill={userInteractions.some(i => i.teamId === team.id && i.interactionType === 'favorite') ? 'currentColor' : 'none'} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* ── DESTAQUES DA LIGA ───────────────────────────────────── */}
                    <div className={`${activeTab === 'scorers' || activeTab === 'matches' ? 'block' : 'hidden md:block'} space-y-6`}>
                        {/* Top Scorers */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-black font-outfit uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                    <Star size={16} className="text-warning fill-warning/20" />
                                    Artilheiros
                                </h2>
                                <button onClick={() => setShowTopRankModal({ open: true, type: 'goals' })} className="flex items-center gap-1 text-warning text-[0.6rem] sm:text-xs font-black uppercase tracking-widest hover:text-white transition-colors">
                                    Rank Completo <ArrowRight size={12} />
                                </button>
                            </div>

                            <div className="glass-panel divide-y divide-white/[0.04] overflow-hidden cursor-pointer group/card" onClick={() => setShowTopRankModal({ open: true, type: 'goals' })}>
                                {topScorers.length === 0 ? (
                                    <div className="py-8 sm:py-10 text-center opacity-25">
                                        <Star size={24} strokeWidth={1} className="mx-auto mb-2" />
                                        <p className="text-[0.6rem] font-black uppercase tracking-widest">{isBasket ? 'Sem cestinhas' : 'Sem artilheiros'}</p>
                                    </div>
                                ) : (
                                    topScorers.map((player, i) => (
                                        <div key={player.id} className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 hover:bg-white/[0.05] transition-colors group">
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
                                                <span className="font-bold truncate text-[0.65rem] sm:text-xs text-white group-hover:text-warning transition-colors">{player.name}</span>
                                                <span className="text-[0.55rem] font-black text-slate-500 uppercase tracking-widest truncate leading-tight">{player.team.name}</span>
                                            </div>
                                            <div className="flex flex-col items-end flex-none min-w-[32px]">
                                                <span className="font-black text-accent text-sm sm:text-base font-outfit leading-none">{isBasket ? (player.stats?.points || 0) : (player.stats?.goals || 0)}</span>
                                                <span className="text-[0.45rem] text-slate-500 font-black uppercase">{isBasket ? 'Pts' : 'Gols'}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Top Assisters */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-black font-outfit uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                    <Zap size={16} className="text-primary fill-primary/20" />
                                    {isBasket ? 'Líder de Assistências' : 'Garçons (Assis.)'}
                                </h2>
                                <button onClick={() => setShowTopRankModal({ open: true, type: 'assists' })} className="flex items-center gap-1 text-primary text-[0.6rem] sm:text-xs font-black uppercase tracking-widest hover:text-white transition-colors">
                                    Rank Completo <ArrowRight size={12} />
                                </button>
                            </div>

                            <div className="glass-panel divide-y divide-white/[0.04] overflow-hidden cursor-pointer group/card" onClick={() => setShowTopRankModal({ open: true, type: 'assists' })}>
                                {topAssisters.length === 0 ? (
                                    <div className="py-8 sm:py-10 text-center opacity-25">
                                        <Zap size={24} strokeWidth={1} className="mx-auto mb-2" />
                                        <p className="text-[0.6rem] font-black uppercase tracking-widest">Sem assistências</p>
                                    </div>
                                ) : (
                                    topAssisters.map((player, i) => (
                                        <div key={player.id} className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 hover:bg-white/[0.05] transition-all group">
                                            <span className={`w-5 h-5 flex items-center justify-center rounded-md font-black text-[0.55rem] font-outfit flex-none ${i === 0 ? 'bg-primary/20 text-primary' : 'text-slate-500'}`}>
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
                                                <span className="font-bold truncate text-[0.65rem] sm:text-xs text-white group-hover:text-primary transition-colors">{player.name}</span>
                                                <span className="text-[0.55rem] font-black text-slate-500 uppercase tracking-widest truncate leading-tight">{player.team.name}</span>
                                            </div>
                                            <div className="flex flex-col items-end flex-none min-w-[32px]">
                                                <span className="font-black text-primary text-sm sm:text-base font-outfit leading-none">{player.stats?.assists || 0}</span>
                                                <span className="text-[0.45rem] text-slate-500 font-black uppercase">Assis.</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Top Rebounders (Basket Only) */}
                        {isBasket && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-sm font-black font-outfit uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                        <ArrowUp size={16} className="text-accent fill-accent/20" />
                                        Rebotes
                                    </h2>
                                    <button onClick={() => setShowTopRankModal({ open: true, type: 'rebounds' })} className="flex items-center gap-1 text-accent text-[0.6rem] sm:text-xs font-black uppercase tracking-widest hover:text-white transition-colors">
                                        Rank Completo <ArrowRight size={12} />
                                    </button>
                                </div>

                                <div className="glass-panel divide-y divide-white/[0.04] overflow-hidden cursor-pointer group/card" onClick={() => setShowTopRankModal({ open: true, type: 'rebounds' })}>
                                    {topRebounders.length === 0 ? (
                                        <div className="py-8 sm:py-10 text-center opacity-25">
                                            <ArrowUp size={24} strokeWidth={1} className="mx-auto mb-2" />
                                            <p className="text-[0.6rem] font-black uppercase tracking-widest">Sem rebotes</p>
                                        </div>
                                    ) : (
                                        topRebounders.map((player, i) => (
                                            <div key={player.id} className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 hover:bg-white/[0.05] transition-all group">
                                                <span className={`w-5 h-5 flex items-center justify-center rounded-md font-black text-[0.55rem] font-outfit flex-none ${i === 0 ? 'bg-accent/20 text-accent' : 'text-slate-500'}`}>
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
                                                    <span className="font-bold truncate text-[0.65rem] sm:text-xs text-white group-hover:text-accent transition-colors">{player.name}</span>
                                                    <span className="text-[0.55rem] font-black text-slate-500 uppercase tracking-widest truncate leading-tight">{player.team.name}</span>
                                                </div>
                                                <div className="flex flex-col items-end flex-none min-w-[32px]">
                                                    <span className="font-black text-accent text-sm sm:text-base font-outfit leading-none">{player.stats?.rebounds || 0}</span>
                                                    <span className="text-[0.45rem] text-slate-500 font-black uppercase">Reb.</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── RANKING MODAL (Goals or Assists) ───────────────────── */}
            {
                showTopRankModal.open && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in" onClick={() => setShowTopRankModal({ ...showTopRankModal, open: false })} />
                        <div className="relative glass-panel w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col animate-scale-in shadow-[0_30px_100px_rgba(0,0,0,0.8)] border-white/10">
                            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${showTopRankModal.type === 'goals' ? 'bg-warning/20 text-warning' : showTopRankModal.type === 'rebounds' ? 'bg-accent/20 text-accent' : 'bg-primary/20 text-primary'}`}>
                                        {showTopRankModal.type === 'goals' ? <Star size={24} className="fill-warning/20" /> : showTopRankModal.type === 'rebounds' ? <ArrowUp size={24} className="fill-accent/20" /> : <Zap size={24} className="fill-primary/20" />}
                                    </div>
                                    <div>
                                        <h3 className="font-outfit font-black text-white uppercase tracking-tight text-xl">
                                            {showTopRankModal.type === 'goals' ? (isBasket ? 'Cestinhas' : 'Artilharia da Liga') : showTopRankModal.type === 'rebounds' ? 'Líder em Rebotes' : (isBasket ? 'Líder de Assistências' : 'Maiores Garçons')}
                                        </h3>
                                        <p className="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest">Dados atualizados em tempo real</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowTopRankModal({ ...showTopRankModal, open: false })} className="p-2.5 rounded-xl bg-white/5 text-slate-500 hover:text-white hover:bg-white/10 transition-all">
                                    <XCircle size={24} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 no-scrollbar pb-10">
                                {[...allPlayers].sort((a, b) => {
                                    if (showTopRankModal.type === 'goals') return (isBasket ? (b.stats?.points || 0) - (a.stats?.points || 0) : (b.stats?.goals || 0) - (a.stats?.goals || 0));
                                    if (showTopRankModal.type === 'rebounds') return (b.stats?.rebounds || 0) - (a.stats?.rebounds || 0);
                                    return (b.stats?.assists || 0) - (a.stats?.assists || 0);
                                })
                                    .filter(p => {
                                        if (showTopRankModal.type === 'goals') return (isBasket ? (p.stats?.points || 0) : (p.stats?.goals || 0)) > 0;
                                        if (showTopRankModal.type === 'rebounds') return (p.stats?.rebounds || 0) > 0;
                                        return (p.stats?.assists || 0) > 0;
                                    })
                                    .map((player, i) => (
                                        <div key={player.id} className="flex items-center gap-4 p-4 rounded-3xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.08] transition-all group">
                                            <div className={`w-10 h-10 flex items-center justify-center rounded-2xl font-black font-outfit text-base ${i === 0 ? (showTopRankModal.type === 'goals' ? 'bg-warning text-black shadow-lg shadow-warning/20' : 'bg-primary text-white shadow-lg shadow-primary/20') :
                                                i === 1 ? 'bg-slate-300 text-black' :
                                                    i === 2 ? 'bg-orange-400 text-black' : 'text-slate-600 border border-white/5'}`}>
                                                {i + 1}
                                            </div>
                                            <div className="relative">
                                                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                                                    {player.photo ? (
                                                        <img src={player.photo} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" alt={player.name} />
                                                    ) : (
                                                        <span className="font-black text-xl text-slate-700">{player.number}</span>
                                                    )}
                                                </div>
                                                <TeamLogo src={player.team.logo} size={20} className="absolute -bottom-1 -right-1 shadow-lg border border-black/40" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-outfit font-black text-white text-base truncate leading-tight uppercase group-hover:text-primary transition-colors">{player.name}</h4>
                                                <span className="text-[0.65rem] font-black text-slate-500 uppercase tracking-[0.15em]">{player.team.name}</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center gap-1.5 justify-end">
                                                    <span className={`text-2xl font-black font-outfit ${showTopRankModal.type === 'goals' ? 'text-accent' : showTopRankModal.type === 'rebounds' ? 'text-accent' : 'text-primary'}`}>
                                                        {showTopRankModal.type === 'goals' ? (isBasket ? player.stats?.points : player.stats?.goals) : showTopRankModal.type === 'rebounds' ? player.stats?.rebounds : player.stats?.assists}
                                                    </span>
                                                    {showTopRankModal.type === 'goals' ? <Star size={14} className="text-warning fill-warning" /> : showTopRankModal.type === 'rebounds' ? <ArrowUp size={14} className="text-accent fill-accent" /> : <Zap size={14} className="text-primary fill-primary" />}
                                                </div>
                                                <span className="text-[0.55rem] font-black text-slate-600 uppercase tracking-widest leading-none">
                                                    {showTopRankModal.type === 'goals' ? (isBasket ? 'Pts' : 'Gols') : showTopRankModal.type === 'rebounds' ? 'Reb.' : 'Assis.'}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                }
                                {[...allPlayers].filter(p => {
                                    if (showTopRankModal.type === 'goals') return (isBasket ? (p.stats?.points || 0) : (p.stats?.goals || 0)) > 0;
                                    if (showTopRankModal.type === 'rebounds') return (p.stats?.rebounds || 0) > 0;
                                    return (p.stats?.assists || 0) > 0;
                                }).length === 0 && (
                                    <div className="text-center py-20 opacity-30">
                                        <p className="font-black uppercase tracking-widest text-sm">Nenhum dado registrado</p>
                                    </div>
                                )}
                            </div>
                            <div className="p-4 bg-black/40 border-t border-white/5 text-center">
                                <p className="text-[0.55rem] font-black text-slate-600 uppercase tracking-[0.2em] italic">Estatísticas atualizadas em tempo real</p>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default Dashboard;
