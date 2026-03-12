import { useState } from 'react';
import { useLeague } from '../context/LeagueContext';
import { Swords, PlusCircle, Play, CheckCircle, Trash2, Edit2, Calendar, MapPin, AlertCircle, Clock } from 'lucide-react';
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
    };

    const resetForm = () => {
        setYoutubeLiveId(''); setScheduledAt(''); setLocation('');
        setHomeTeamId(teams[0]?.id || ''); setAwayTeamId(teams[1]?.id || '');
    };

    const handleEdit = (m: any) => {
        setEditingMatchId(m.id); setHomeTeamId(m.homeTeamId); setAwayTeamId(m.awayTeamId);
        setYoutubeLiveId(m.youtubeLiveId || ''); setScheduledAt(m.scheduledAt || ''); setLocation(m.location || '');
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
    const formatDate = (dt?: string) => dt ? new Date(dt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

    return (
        <div className="animate-fade-in pb-24 md:pb-8 p-4 md:p-0">
            <header className="mb-8 md:mb-12">
                <h1 className="text-3xl md:text-5xl font-outfit font-extrabold tracking-tight mb-2 uppercase">Gerenciar Partidas</h1>
                <p className="text-slate-400 font-medium md:text-lg">Agende, inicie e controle as partidas da liga</p>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8 items-start">
                {/* Form */}
                <section className="xl:col-span-12 2xl:col-span-5 glass-panel p-6 md:p-8 order-2 2xl:order-1">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                        <PlusCircle size={22} className="text-primary" />
                        {editingMatchId ? 'Editar Partida' : 'Agendar Partida'}
                    </h2>
                    {teams.length < 2
                        ? <div className="text-slate-500 text-center py-12 font-medium bg-black/20 rounded-2xl border border-white/5">Cadastre pelo menos 2 times para criar uma partida.</div>
                        : (
                            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Time Mandante</label>
                                        <select
                                            className="bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none"
                                            value={homeTeamId} onChange={e => setHomeTeamId(e.target.value)}
                                        >
                                            {teams.map(t => <option key={t.id} value={t.id} className="bg-bg-dark">{t.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Time Visitante</label>
                                        <select
                                            className="bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none"
                                            value={awayTeamId} onChange={e => setAwayTeamId(e.target.value)}
                                        >
                                            {teams.map(t => <option key={t.id} value={t.id} className="bg-bg-dark">{t.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2 font-outfit uppercase"><Calendar size={13} strokeWidth={3} /> Data & Hora</label>
                                        <input
                                            className="bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2 font-outfit uppercase"><MapPin size={13} strokeWidth={3} /> Local</label>
                                        <input
                                            className="bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            type="text" placeholder="Ex: Estádio do Maracanã" value={location} onChange={e => setLocation(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 font-outfit uppercase">Link YouTube Live (Opcional)</label>
                                    <input
                                        className="bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        type="text" placeholder="URL ou ID do YouTube" value={youtubeLiveId} onChange={e => setYoutubeLiveId(e.target.value)}
                                    />
                                </div>
                                {error && <div className="bg-danger/10 border border-danger/20 rounded-xl p-4 text-danger text-sm font-medium flex items-center gap-2.5 animate-fade-in font-outfit uppercase"><AlertCircle size={18} />{error}</div>}
                                <div className="flex gap-3 pt-2">
                                    <button type="submit" className="flex-1 bg-primary hover:brightness-110 text-white font-black py-4 rounded-xl shadow-[0_8px_20px_rgba(109,40,217,0.3)] transition-all active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-widest text-sm">
                                        <Swords size={20} /> {editingMatchId ? 'Salvar Alterações' : 'Criar Partida'}
                                    </button>
                                    {editingMatchId && (
                                        <button type="button" onClick={() => { setEditingMatchId(null); resetForm(); }} className="px-6 rounded-xl border border-white/10 text-slate-400 font-bold hover:bg-white/5 transition-all uppercase tracking-widest text-sm">
                                            Cancelar
                                        </button>
                                    )}
                                </div>
                            </form>
                        )}
                </section>

                {/* Match List */}
                <section className="xl:col-span-12 2xl:col-span-7 glass-panel p-6 md:p-8 flex flex-col h-full overflow-hidden order-1 2xl:order-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <h2 className="text-xl font-bold flex items-center gap-3 font-outfit uppercase tracking-wider">
                            <Clock size={22} className="text-accent" /> Calendário
                        </h2>

                        {/* Filter Tabs */}
                        <div className="flex bg-black/40 rounded-xl p-1 self-start sm:self-auto overflow-x-auto no-scrollbar max-w-full">
                            {(['all', 'scheduled', 'live', 'finished'] as const).map(t => (
                                <button key={t} onClick={() => setTab(t)}
                                    className={`px-4 py-2 rounded-lg text-[0.6rem] font-black uppercase tracking-widest transition-all duration-300 min-w-fit ${tab === t ? 'bg-accent text-white shadow-[0_4px_12px_rgba(16,185,129,0.3)]' : 'text-slate-500 hover:text-slate-300'
                                        }`}>
                                    {{ all: 'Tudo', scheduled: 'Agend.', live: 'Vivo', finished: 'Concl.' }[t]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {filteredMatches.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-500 gap-4 opacity-50">
                            <Swords size={48} strokeWidth={1} />
                            <p className="font-medium font-outfit uppercase tracking-widest text-xs">Nenhuma partida encontrada.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4 overflow-y-auto max-h-[800px] pr-2 custom-scrollbar">
                            {filteredMatches.map(match => {
                                const ht = teams.find(t => t.id === match.homeTeamId);
                                const at = teams.find(t => t.id === match.awayTeamId);
                                const isLive = match.status === 'live';
                                return (
                                    <div key={match.id} className={`group p-5 rounded-2xl border transition-all duration-300 ${isLive ? 'bg-primary/10 border-primary/30 shadow-[0_4px_24px_rgba(109,40,217,0.1)]' : 'bg-white/3 border-white/5 hover:bg-white/5'
                                        }`}>
                                        <div className="flex items-center gap-4 mb-5">
                                            <div className="flex flex-col items-center gap-2">
                                                <TeamLogo src={ht?.logo} size={48} />
                                                <span className="text-[0.55rem] font-black text-primary uppercase bg-primary/10 px-2 py-0.5 rounded leading-none flex items-center h-4 tracking-[0.1em]">HOME</span>
                                            </div>

                                            <div className="flex-1 text-center px-2 min-w-0">
                                                {match.status === 'finished' ? (
                                                    <div className="flex items-center justify-center gap-4 mb-2">
                                                        <span className="text-3xl font-black text-white font-outfit">{match.homeScore}</span>
                                                        <span className="text-lg font-black text-slate-700 font-outfit">X</span>
                                                        <span className="text-3xl font-black text-white font-outfit">{match.awayScore}</span>
                                                    </div>
                                                ) : isLive ? (
                                                    <div className="flex flex-col items-center mb-2">
                                                        <div className="flex items-center gap-3 text-3xl font-black text-white font-outfit">
                                                            <span>{match.homeScore}</span>
                                                            <span className="text-lg text-danger animate-pulse">:</span>
                                                            <span>{match.awayScore}</span>
                                                        </div>
                                                        <span className="text-[0.6rem] font-black text-danger tracking-[0.2em] uppercase mt-1">EM CURSO</span>
                                                    </div>
                                                ) : (
                                                    <div className="text-[0.6rem] font-black text-slate-500 mb-2 uppercase tracking-[0.2em] font-outfit">Duelo Marcado</div>
                                                )}

                                                <div className="text-[0.75rem] md:text-sm font-black text-white mb-1 truncate font-outfit tracking-wide px-2">
                                                    {ht?.name} <span className="text-slate-600 font-medium lowercase italic mx-1">vs</span> {at?.name}
                                                </div>

                                                <div className="text-[0.6rem] font-bold text-slate-500 uppercase flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-1">
                                                    {match.scheduledAt && <span className="flex items-center gap-1.5"><Calendar size={10} strokeWidth={3} /> {formatDate(match.scheduledAt)}</span>}
                                                    {match.location && <span className="flex items-center gap-1.5"><MapPin size={10} strokeWidth={3} /> {match.location}</span>}
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-center gap-2">
                                                <TeamLogo src={at?.logo} size={48} />
                                                <span className="text-[0.55rem] font-black text-slate-500 uppercase bg-white/5 px-2 py-0.5 rounded leading-none flex items-center h-4 tracking-[0.1em]">AWAY</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-white/5 pt-4 gap-4">
                                            <div className={`px-3 py-1.5 rounded-lg text-[0.6rem] font-black uppercase tracking-[0.15em] flex items-center gap-2 ${isLive ? 'bg-danger/20 text-danger shadow-[0_0_15px_rgba(239,68,68,0.2)]' :
                                                    match.status === 'finished' ? 'bg-accent/20 text-accent font-outfit group-hover:scale-105 transition-transform' : 'bg-warning/20 text-warning font-outfit'
                                                }`}>
                                                {isLive && <span className="w-2 h-2 bg-danger rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />}
                                                {isLive ? 'AO VIVO AGORA' : match.status === 'finished' ? 'Partida Finalizada' : 'Partida Agendada'}
                                            </div>

                                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                                {match.status === 'scheduled' && (
                                                    <button onClick={() => handleEdit(match)} className="flex-1 sm:flex-none p-3 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                                                        <Edit2 size={16} />
                                                    </button>
                                                )}
                                                <button onClick={() => handleEnter(match.id, match.status)} className={`flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-black text-[0.65rem] uppercase tracking-widest transition-all ${isLive ? 'bg-accent text-white shadow-[0_8px_20px_rgba(16,185,129,0.3)] hover:brightness-110' :
                                                        match.status === 'finished' ? 'bg-primary/20 text-white hover:bg-primary/30 border border-primary/20' : 'bg-primary text-white shadow-[0_8px_20px_rgba(109,40,217,0.3)] hover:brightness-110'
                                                    }`}>
                                                    <Play size={14} fill="currentColor" />
                                                    {isLive ? 'Gerenciar Live' : match.status === 'finished' ? 'Relatório' : 'Iniciar'}
                                                </button>
                                                <button onClick={() => handleDelete(match.id)} className="p-3 rounded-xl bg-danger/10 text-danger hover:bg-danger hover:text-white transition-all flex-none">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default Matches;
