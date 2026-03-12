import { useState } from 'react';
import { useLeague } from '../context/LeagueContext';
import { Swords, PlusCircle, Play, Trash2, Edit2, Calendar, MapPin, AlertCircle, Clock, CheckCircle2, Signal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TeamLogo from '../components/TeamLogo';

const Matches = () => {
    const { teams, matches, createMatch, startMatch, deleteMatch, updateMatch } = useLeague();
    const navigate = useNavigate();
    const [homeTeamId, setHomeTeamId] = useState(teams[0]?.id || '');
    const [awayTeamId, setAwayTeamId] = useState(teams[1]?.id || '');
    const [youtubeLiveId, setYoutubeLiveId] = useState('');
    const [scheduledAt, setScheduledAt] = useState('');
    const [location, setLocation] = useState('');
    const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [tab, setTab] = useState<'all' | 'scheduled' | 'live' | 'finished'>('all');
    const [formOpen, setFormOpen] = useState(false);

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
            const { error: err } = await createMatch({ homeTeamId, awayTeamId, scheduledAt, location, youtubeLiveId: videoId });
            if (err) { setError(err); return; }
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
        if (status === 'scheduled') await startMatch(id);
        navigate(`/match/${id}`);
    };

    const filteredMatches = matches.filter(m => tab === 'all' || m.status === tab);
    const formatDate = (dt?: string) => dt ? new Date(dt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '';

    const tabConfig = [
        { key: 'all', label: 'Todas', count: matches.length },
        { key: 'live', label: 'AO VIVO', count: matches.filter(m => m.status === 'live').length },
        { key: 'scheduled', label: 'Agendadas', count: matches.filter(m => m.status === 'scheduled').length },
        { key: 'finished', label: 'Concluídas', count: matches.filter(m => m.status === 'finished').length },
    ] as const;

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <header className="mb-6 md:mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl md:text-5xl font-outfit font-extrabold tracking-tight mb-1 uppercase">Partidas</h1>
                    <p className="text-slate-400 text-sm md:text-base">Agende, inicie e controle as partidas da liga</p>
                </div>
                <button
                    onClick={() => { setFormOpen(!formOpen); setEditingMatchId(null); resetForm(); }}
                    className="flex items-center gap-2 bg-primary text-white font-black py-3 px-6 rounded-2xl shadow-[0_8px_25px_rgba(109,40,217,0.35)] hover:brightness-110 active:scale-95 transition-all text-xs uppercase tracking-widest flex-none"
                >
                    <PlusCircle size={16} strokeWidth={3} /> Nova Partida
                </button>
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
                                    <label className="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Calendar size={11} />Data & Hora</label>
                                    <input className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-all text-sm"
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
                    <button key={key} onClick={() => setTab(key)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[0.6rem] font-black uppercase tracking-widest transition-all duration-300 flex-none ${tab === key
                                ? key === 'live' ? 'bg-danger text-white shadow-[0_4px_15px_rgba(239,68,68,0.3)]' : 'bg-accent text-white shadow-[0_4px_15px_rgba(16,185,129,0.3)]'
                                : 'bg-white/5 border border-white/5 text-slate-500 hover:text-slate-300'
                            }`}>
                        {key === 'live' && <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
                        {label}
                        <span className={`px-1.5 py-0.5 rounded-md text-[0.55rem] font-black ${tab === key ? 'bg-black/20' : 'bg-white/10'}`}>{count}</span>
                    </button>
                ))}
            </div>

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
                        return (
                            <div key={match.id} className={`glass-panel p-4 sm:p-5 border transition-all duration-300 ${isLive ? 'border-danger/25 bg-danger/[0.03] shadow-[0_0_30px_rgba(239,68,68,0.05)]' :
                                    isFinished ? 'border-white/[0.04]' : 'border-white/[0.04] hover:border-white/[0.08]'
                                }`}>
                                {/* Match Header Row */}
                                <div className="flex items-center gap-3 sm:gap-4">
                                    {/* Home */}
                                    <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
                                        <TeamLogo src={ht?.logo} size={40} />
                                        <span className="text-[0.6rem] font-black text-white uppercase tracking-wide truncate w-full text-center font-outfit">{ht?.name}</span>
                                    </div>

                                    {/* Center */}
                                    <div className="flex flex-col items-center gap-1.5 flex-none px-2">
                                        {(isLive || isFinished) ? (
                                            <div className="flex items-center gap-2 sm:gap-3 font-outfit font-black text-xl sm:text-3xl">
                                                <span className={isLive ? 'text-primary' : 'text-white'}>{match.homeScore}</span>
                                                <span className="text-slate-700 text-sm">✕</span>
                                                <span className={isLive ? 'text-accent' : 'text-white'}>{match.awayScore}</span>
                                            </div>
                                        ) : (
                                            <div className="text-[0.7rem] font-black text-slate-600 uppercase tracking-widest font-outfit">VS</div>
                                        )}
                                        {isLive && (
                                            <div className="flex items-center gap-1.5 bg-danger/10 border border-danger/20 px-2.5 py-1 rounded-lg">
                                                <span className="w-1.5 h-1.5 bg-danger rounded-full animate-pulse shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
                                                <span className="text-[0.5rem] font-black text-danger uppercase tracking-widest">Ao Vivo</span>
                                            </div>
                                        )}
                                        {!isLive && !isFinished && match.scheduledAt && (
                                            <div className="flex items-center gap-1 text-[0.5rem] text-slate-600 font-bold">
                                                <Calendar size={9} />{formatDate(match.scheduledAt)}
                                            </div>
                                        )}
                                    </div>

                                    {/* Away */}
                                    <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
                                        <TeamLogo src={at?.logo} size={40} />
                                        <span className="text-[0.6rem] font-black text-white uppercase tracking-wide truncate w-full text-center font-outfit">{at?.name}</span>
                                    </div>
                                </div>

                                {/* Action Row */}
                                <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.05] gap-2">
                                    {/* Status Badge */}
                                    <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[0.55rem] font-black uppercase tracking-widest flex-none ${isLive ? 'bg-danger/15 text-danger' :
                                            isFinished ? 'bg-accent/15 text-accent' : 'bg-warning/15 text-warning'
                                        }`}>
                                        {isLive ? <Signal size={10} /> : isFinished ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                                        {isLive ? 'Em curso' : isFinished ? 'Finalizada' : 'Agendada'}
                                    </div>

                                    {/* Buttons */}
                                    <div className="flex items-center gap-1.5">
                                        {match.status === 'scheduled' && (
                                            <button onClick={() => handleEdit(match)} className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-slate-500 hover:text-white hover:bg-white/10 transition-all">
                                                <Edit2 size={14} />
                                            </button>
                                        )}
                                        <button onClick={() => handleEnter(match.id, match.status)}
                                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-[0.6rem] uppercase tracking-widest transition-all active:scale-95 ${isLive ? 'bg-accent text-white shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:brightness-110' :
                                                    isFinished ? 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10' :
                                                        'bg-primary text-white shadow-[0_4px_15px_rgba(109,40,217,0.3)] hover:brightness-110'
                                                }`}>
                                            <Play size={12} fill="currentColor" />
                                            {isLive ? 'Gerenciar' : isFinished ? 'Ver' : 'Iniciar'}
                                        </button>
                                        <button onClick={() => handleDelete(match.id)} className="p-2.5 rounded-xl bg-danger/10 text-danger hover:bg-danger hover:text-white transition-all border border-danger/10">
                                            <Trash2 size={14} />
                                        </button>
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
