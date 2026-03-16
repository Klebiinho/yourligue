import { useState } from 'react';
import { useLeague } from '../context/LeagueContext';
import { Swords, PlusCircle, Play, Trash2, Edit2, Calendar, MapPin, AlertCircle, Clock, CheckCircle2, Signal, Heart, Search, Video, ChevronUp, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TeamLogo from '../components/TeamLogo';
import AdBanner from '../components/AdBanner';

const Matches = () => {
    const { user } = useAuth();
    const { teams, matches, userInteractions, createMatch, startMatch, deleteMatch, updateMatch, isPublicView, isAdmin, leagueBasePath, setShowAuthModal } = useLeague();
    const navigate = useNavigate();
    const [homeTeamId, setHomeTeamId] = useState(teams[0]?.id || '');
    const [awayTeamId, setAwayTeamId] = useState(teams[1]?.id || '');
    const [youtubeLiveId, setYoutubeLiveId] = useState('');
    const [scheduledAt, setScheduledAt] = useState('');
    const [location, setLocation] = useState('');
    const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [tab, setTab] = useState<'all' | 'scheduled' | 'live' | 'finished' | 'my_team'>('all');
    const [formOpen, setFormOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [teamFilter, setTeamFilter] = useState('');
    const [expandedVideoIds, setExpandedVideoIds] = useState<string[]>([]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (homeTeamId === awayTeamId) { setError('Um time não pode jogar contra ele mesmo.'); return; }
        let videoId = youtubeLiveId;
        try {
            if (videoId.includes('youtube.com') || videoId.includes('youtu.be')) {
                const url = new URL(videoId);
                videoId = url.searchParams.get('v') || url.pathname.slice(1) || videoId;
            }
        } catch { }

        if (editingMatchId) {
            await updateMatch(editingMatchId, { homeTeamId, awayTeamId, scheduledAt, location, youtubeLiveId: videoId });
            setEditingMatchId(null);
        } else {
            const { error: err, matchId } = await createMatch({ homeTeamId, awayTeamId, scheduledAt, location, youtubeLiveId: videoId });
            if (err) { setError(err); return; }
            if (matchId) navigate(`/match/${matchId}`);
        }
        resetForm();
        setFormOpen(false);
    };

    const resetForm = () => {
        setYoutubeLiveId(''); setScheduledAt(''); setLocation('');
        setHomeTeamId(teams[0]?.id || ''); setAwayTeamId(teams[1]?.id || '');
        setError('');
    };

    const handleEdit = (m: any) => {
        setEditingMatchId(m.id); setHomeTeamId(m.homeTeamId); setAwayTeamId(m.awayTeamId);
        setYoutubeLiveId(m.youtubeLiveId || ''); setScheduledAt(m.scheduledAt || ''); setLocation(m.location || '');
        setFormOpen(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Excluir esta partida?')) await deleteMatch(id);
    };

    const handleEnter = async (id: string, status: string) => {
        if (!isPublicView && isAdmin && status === 'scheduled') await startMatch(id, 0);
        navigate(`${leagueBasePath}/match/${id}`);
    };

    const myTeamIds = userInteractions.filter(i => i.interactionType === 'supporting').map((i: any) => i.teamId);
    const filteredMatches = matches
        .filter((m: any) => {
            if (tab === 'all') return true;
            if (tab === 'my_team') return myTeamIds.includes(m.homeTeamId) || myTeamIds.includes(m.awayTeamId);
            return m.status === tab;
        })
        .filter((m: any) => {
            const ht = teams.find((t: any) => t.id === m.homeTeamId);
            const at = teams.find((t: any) => t.id === m.awayTeamId);
            const matchesQuery = !searchQuery || 
                ht?.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                at?.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesTeam = !teamFilter || m.homeTeamId === teamFilter || m.awayTeamId === teamFilter;
            return matchesQuery && matchesTeam;
        })
        .sort((a: any, b: any) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
    const formatDate = (dt?: string) => dt ? new Date(dt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '';

    const tabConfig = [
        ...(isPublicView ? [{ key: 'my_team' as const, label: 'MEU TIME', count: matches.filter((m: any) => myTeamIds.includes(m.homeTeamId) || myTeamIds.includes(m.awayTeamId)).length }] : []),
        { key: 'all' as const, label: 'Todas', count: matches.length },
        { key: 'live' as const, label: 'AO VIVO', count: matches.filter((m: any) => m.status === 'live').length },
        { key: 'scheduled' as const, label: 'Agendadas', count: matches.filter((m: any) => m.status === 'scheduled').length },
        { key: 'finished' as const, label: 'Concluídas', count: matches.filter((m: any) => m.status === 'finished').length },
    ];

    return (
        <div className="animate-fade-in">
            {isPublicView && <AdBanner position="top" />}
            {/* Header */}
            <header className="mb-6 md:mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl md:text-5xl font-outfit font-extrabold tracking-tight mb-1 uppercase">Partidas</h1>
                    <p className="text-slate-400 text-sm md:text-base">{isPublicView ? 'Veja o cronograma e resultados da liga' : 'Agende, inicie e controle as partidas da liga'}</p>
                </div>
                {!isPublicView && isAdmin && (
                    <button
                        onClick={() => { setFormOpen(!formOpen); setEditingMatchId(null); resetForm(); }}
                        className="flex items-center gap-2 bg-primary text-white font-black py-3 px-6 rounded-2xl shadow-[0_8px_25px_rgba(109,40,217,0.35)] hover:brightness-110 active:scale-95 transition-all text-xs uppercase tracking-widest flex-none"
                    >
                        <PlusCircle size={16} strokeWidth={3} /> Nova Partida
                    </button>
                )}
            </header>

            {/* Create/Edit Form – Collapsible */}
            {(formOpen || editingMatchId) && (
                <section className="glass-panel p-5 md:p-8 mb-6 md:mb-8 animate-fade-in border-primary/20 border shadow-[0_10px_40px_rgba(109,40,217,0.1)]">
                    <h2 className="text-base font-black font-outfit uppercase tracking-widest mb-5 flex items-center gap-3">
                        <PlusCircle size={18} className="text-primary" />
                        {editingMatchId ? 'Editar Partida' : 'Agendar Nova Partida'}
                    </h2>
                    {teams.length < 2 ? (
                        <div className="text-slate-500 text-center py-10 text-xs font-black uppercase tracking-widest bg-black/20 rounded-2xl border border-white/5">
                            Cadastre pelo menos 2 times primeiro.
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Team selects */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest">Mandante</label>
                                    <select className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-all appearance-none text-sm font-bold"
                                        value={homeTeamId} onChange={e => setHomeTeamId(e.target.value)}>
                                        {teams.map(t => <option key={t.id} value={t.id} className="bg-[#07070a]">{t.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest">Visitante</label>
                                    <select className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-all appearance-none text-sm font-bold"
                                        value={awayTeamId} onChange={e => setAwayTeamId(e.target.value)}>
                                        {teams.map(t => <option key={t.id} value={t.id} className="bg-[#07070a]">{t.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            {/* Date & Location */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                        <Calendar size={11} className="flex-none" />
                                        Data & Hora
                                    </label>
                                    <input className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-3 text-white focus:border-primary outline-none transition-all text-sm [color-scheme:dark]"
                                        type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><MapPin size={11} />Local</label>
                                    <input className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-700 focus:border-primary outline-none transition-all text-sm"
                                        type="text" placeholder="Ex: Arena do Grêmio" value={location} onChange={e => setLocation(e.target.value)} />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest">YouTube Live ID (opcional)</label>
                                <input className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-700 focus:border-primary outline-none transition-all text-sm"
                                    type="text" placeholder="URL ou ID do vídeo" value={youtubeLiveId} onChange={e => setYoutubeLiveId(e.target.value)} />
                            </div>
                            {error && <div className="bg-danger/10 border border-danger/20 rounded-xl p-3.5 text-danger text-xs font-black uppercase tracking-widest flex items-center gap-2.5 animate-fade-in"><AlertCircle size={16} />{error}</div>}
                            <div className="flex gap-3 pt-1">
                                <button type="submit" className="flex-1 bg-primary text-white font-black py-4 rounded-xl shadow-[0_8px_25px_rgba(109,40,217,0.3)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs">
                                    <Swords size={16} /> {editingMatchId ? 'Salvar Alterações' : 'Confirmar Partida'}
                                </button>
                                <button type="button" onClick={() => { setFormOpen(false); setEditingMatchId(null); resetForm(); }} className="px-6 rounded-xl border border-white/10 text-slate-500 font-bold hover:bg-white/5 transition-all text-xs uppercase tracking-widest">
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    )}
                </section>
            )}

            {/* Filter Tabs */}
            <div className="flex gap-1.5 mb-5 overflow-x-auto no-scrollbar pb-1">
                {tabConfig.map(({ key, label, count }) => (
                    <button key={key} onClick={() => {
                        if (key === 'my_team' && !user) {
                            setShowAuthModal(true);
                            return;
                        }
                        setTab(key);
                    }}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[0.6rem] font-black uppercase tracking-widest transition-all duration-300 flex-none ${tab === key
                            ? key === 'live' ? 'bg-danger text-white shadow-[0_4px_15px_rgba(239,68,68,0.3)]' : 'bg-accent text-white shadow-[0_4px_15px_rgba(16,185,129,0.3)]'
                            : 'bg-white/5 border border-white/5 text-slate-500 hover:text-slate-300'
                            }`}>
                        {key === 'live' && <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
                        {key === 'my_team' && <Heart size={12} className={tab === key ? 'text-white' : 'text-danger'} fill="currentColor" />}
                        {label}
                        <span className={`px-1.5 py-0.5 rounded-md text-[0.55rem] font-black ${tab === key ? 'bg-black/20' : 'bg-white/10'}`}>{count}</span>
                    </button>
                ))}
            </div>

            {/* Search and Team Filter */}
            {tab !== 'my_team' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                    <div className="sm:col-span-2 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                            type="text" 
                            placeholder="Pesquisar por time..." 
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder:text-slate-600 focus:border-primary outline-none transition-all text-sm font-bold"
                        />
                    </div>
                    <div className="relative">
                        <select 
                            value={teamFilter}
                            onChange={e => setTeamFilter(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white focus:border-primary outline-none transition-all appearance-none text-sm font-bold cursor-pointer"
                        >
                            <option value="" className="bg-[#07070a]">Todos os Times</option>
                            {teams.sort((a,b) => a.name.localeCompare(b.name)).map(t => (
                                <option key={t.id} value={t.id} className="bg-[#07070a]">{t.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {isPublicView && <AdBanner position="matches_filter" />}

            {/* Match List */}
            {filteredMatches.length === 0 ? (
                <div className="glass-panel p-16 text-center opacity-30 flex flex-col items-center gap-4">
                    <Swords size={48} strokeWidth={1} />
                    <p className="text-xs font-black uppercase tracking-widest">Nenhuma partida encontrada</p>
                </div>
            ) : (
                <div className="space-y-3 md:space-y-4">
                    {filteredMatches.map(match => {
                        const ht = teams.find(t => t.id === match.homeTeamId);
                        const at = teams.find(t => t.id === match.awayTeamId);
                        const isLive = match.status === 'live';
                        const isFinished = match.status === 'finished';
                        
                        const homePenaltyScore = (match.events || []).filter(e => e.type === 'penalty_shootout_goal' && e.teamId === match.homeTeamId).length;
                        const awayPenaltyScore = (match.events || []).filter(e => e.type === 'penalty_shootout_goal' && e.teamId === match.awayTeamId).length;
                        const hasShootout = (match.events || []).some(e => e.type.startsWith('penalty_shootout_'));

                        return (
                            <div key={match.id} className={`glass-panel p-4 sm:p-5 border transition-all duration-300 ${isLive ? 'border-danger/25 bg-danger/[0.03] shadow-[0_0_30px_rgba(239,68,68,0.05)]' :
                                isFinished ? 'border-white/[0.04]' : 'border-white/[0.04] hover:border-white/[0.08]'
                                }`}>
                                {/* Match Header Row */}
                                <div className="flex items-center gap-3 sm:gap-4">
                                    {/* Home */}
                                    <div 
                                        onClick={(e) => { e.stopPropagation(); navigate(`${leagueBasePath}/teams/${ht?.id}`); }}
                                        className="flex flex-col items-center gap-1 flex-1 min-w-0 cursor-pointer hover:bg-white/5 p-2 rounded-2xl transition-all"
                                    >
                                        <TeamLogo src={ht?.logo} size={38} />
                                        <span className="text-[0.55rem] sm:text-[0.65rem] font-black text-white uppercase tracking-wide w-full text-center font-outfit line-clamp-2 leading-tight">{ht?.name}</span>
                                    </div>

                                    {/* Center */}
                                    <div className="flex flex-col items-center gap-2 flex-none min-w-[70px] sm:min-w-[100px]">
                                        {(isLive || isFinished) ? (
                                            <div className="flex items-center gap-2 sm:gap-4 font-outfit font-black text-2xl sm:text-4xl relative">
                                                <div className="flex flex-col items-center">
                                                    {hasShootout && <span className="text-[0.6rem] text-primary/80 font-black mb-1 leading-none">{homePenaltyScore}</span>}
                                                    <span className={isLive ? 'text-primary' : 'text-white'}>{match.homeScore}</span>
                                                </div>
                                                <span className="text-slate-800 text-xs sm:text-sm mt-auto pb-1 sm:pb-2">✕</span>
                                                <div className="flex flex-col items-center">
                                                    {hasShootout && <span className="text-[0.6rem] text-accent/80 font-black mb-1 leading-none">{awayPenaltyScore}</span>}
                                                    <span className={isLive ? 'text-accent' : 'text-white'}>{match.awayScore}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-[0.7rem] font-black text-slate-700 uppercase tracking-[0.2em] font-outfit bg-white/5 px-3 py-1 rounded-lg border border-white/5">VS</div>
                                        )}
                                        {isLive && (
                                            <div className="flex items-center gap-1.5 bg-danger/10 border border-danger/20 px-2.5 py-1 rounded-full animate-pulse-subtle">
                                                <span className="w-1.5 h-1.5 bg-danger rounded-full" />
                                                <span className="text-[0.5rem] font-black text-danger uppercase tracking-widest whitespace-nowrap">Ao Vivo</span>
                                            </div>
                                        )}
                                        {!isLive && !isFinished && match.scheduledAt && (
                                            <div className="flex flex-col items-center gap-0.5 text-[0.45rem] sm:text-[0.55rem] text-slate-600 font-black whitespace-nowrap uppercase tracking-widest">
                                                <div className="flex items-center gap-1"><Calendar size={10} className="flex-none text-primary/40" /> {formatDate(match.scheduledAt).split(',')[0]}</div>
                                                <div className="flex items-center gap-1"><Clock size={10} className="flex-none text-primary/40" /> {formatDate(match.scheduledAt).split(',')[1]}</div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Away */}
                                    <div 
                                        onClick={(e) => { e.stopPropagation(); navigate(`${leagueBasePath}/teams/${at?.id}`); }}
                                        className="flex flex-col items-center gap-2 flex-1 min-w-0 cursor-pointer hover:bg-white/5 p-2 rounded-2xl transition-all"
                                    >
                                        <div className="transform transition-transform group-hover:scale-110 duration-500">
                                            <TeamLogo src={at?.logo} size={42} className="shadow-lg" />
                                        </div>
                                        <span className="text-[0.6rem] sm:text-[0.7rem] font-black text-white uppercase tracking-wider w-full text-center font-outfit line-clamp-1 leading-tight">{at?.name}</span>
                                    </div>
                                </div>

                                {match.youtubeLiveId && expandedVideoIds.includes(match.id) && (
                                    <div className="mt-4 animate-slide-up">
                                        <div className="relative pt-[56.25%] rounded-2xl overflow-hidden bg-black/40 border border-white/10 ring-1 ring-white/5 shadow-2xl">
                                            <iframe
                                                title="Match Playback"
                                                className="absolute inset-0 w-full h-full"
                                                src={`https://www.youtube.com/embed/${match.youtubeLiveId}?autoplay=1`}
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Action Row */}
                                <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/[0.05] gap-3">
                                    {/* Status Badge */}
                                    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[0.6rem] font-black uppercase tracking-widest flex-none border ${isLive ? 'bg-danger/10 text-danger border-danger/20 shadow-[0_4px_15px_rgba(239,68,68,0.1)]' :
                                        isFinished ? 'bg-primary/10 text-primary border-primary/20' : 'bg-slate-900 text-slate-500 border-white/5'
                                        }`}>
                                        {isLive ? <Signal size={12} className="animate-pulse" /> : isFinished ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                                        {isLive ? 'Partida em curso' : isFinished ? (hasShootout ? 'Pênaltis Finalizados' : 'Partida Encerrada') : 'Agendada'}
                                    </div>

                                    {/* Buttons */}
                                    <div className="flex items-center gap-2">
                                        {match.youtubeLiveId && (
                                            <button 
                                                onClick={(e) => { 
                                                    e.stopPropagation(); 
                                                    setExpandedVideoIds(prev => 
                                                        prev.includes(match.id) ? prev.filter(id => id !== match.id) : [...prev, match.id]
                                                    );
                                                }}
                                                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-black text-[0.65rem] uppercase tracking-[0.15em] transition-all active:scale-95 border ${
                                                    expandedVideoIds.includes(match.id) 
                                                    ? 'bg-red-500/20 border-red-500/30 text-red-500' 
                                                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                                                }`}
                                            >
                                                <Video size={14} />
                                                <span className="hidden sm:inline">{expandedVideoIds.includes(match.id) ? 'Fechar Vídeo' : 'Assistir'}</span>
                                                {expandedVideoIds.includes(match.id) ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                            </button>
                                        )}
                                        {!isPublicView && isAdmin && match.status === 'scheduled' && (
                                            <button onClick={(e) => { e.stopPropagation(); handleEdit(match); }} className="p-3 rounded-xl bg-white/5 border border-white/5 text-slate-500 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all group/btn">
                                                <Edit2 size={16} className="transition-transform group-hover/btn:rotate-12" />
                                            </button>
                                        )}
                                        <button onClick={() => handleEnter(match.id, match.status)}
                                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[0.65rem] uppercase tracking-[0.15em] transition-all active:scale-95 shadow-xl ${isLive ? 'bg-accent text-white shadow-accent/20 hover:shadow-accent/40' :
                                                isFinished ? 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20' :
                                                    'bg-primary text-white shadow-primary/20 hover:shadow-primary/40'
                                                }`}>
                                            <Play size={12} fill="currentColor" className={isLive ? 'animate-pulse' : ''} />
                                            {(isPublicView || !isAdmin) ? 'Ver Detalhes' : (isLive ? 'Gerenciar' : isFinished ? 'Súmula' : 'Iniciar')}
                                        </button>
                                        {!isPublicView && isAdmin && (
                                            <button onClick={() => handleDelete(match.id)} className="p-2.5 rounded-xl bg-danger/10 text-danger hover:bg-danger hover:text-white transition-all border border-danger/10">
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {/* Location tag */}
                                {match.location && (
                                    <div className="flex items-center gap-1.5 mt-2 text-[0.55rem] text-slate-700 font-bold">
                                        <MapPin size={10} /> {match.location}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Matches;
