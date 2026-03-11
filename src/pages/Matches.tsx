import { useState } from 'react';
import { useLeague } from '../context/LeagueContext';
import { Swords, PlusCircle, Play, CheckCircle, Trash2, Edit2, Calendar, MapPin, AlertCircle } from 'lucide-react';
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
        <div className="animate-fade-in">
            <header className="mb-40">
                <h1 className="responsive-title">Gerenciar Partidas</h1>
                <p className="responsive-subtitle">Agende, inicie e controle as partidas da liga</p>
            </header>

            <div className="grid-2">
                {/* Form */}
                <section className="glass-panel p-24">
                    <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <PlusCircle size={20} className="text-gradient" /> {editingMatchId ? 'Editar Partida' : 'Agendar Partida'}
                    </h2>
                    {teams.length < 2
                        ? <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px' }}>Cadastre pelo menos 2 times para criar uma partida.</div>
                        : (
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div className="grid-2" style={{ gap: '12px' }}>
                                    <div className="input-group" style={{ marginBottom: 0 }}>
                                        <label>Time Mandante</label>
                                        <select value={homeTeamId} onChange={e => setHomeTeamId(e.target.value)}>
                                            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="input-group" style={{ marginBottom: 0 }}>
                                        <label>Time Visitante</label>
                                        <select value={awayTeamId} onChange={e => setAwayTeamId(e.target.value)}>
                                            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid-2" style={{ gap: '12px' }}>
                                    <div className="input-group" style={{ marginBottom: 0 }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={13} /> Data & Hora</label>
                                        <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} />
                                    </div>
                                    <div className="input-group" style={{ marginBottom: 0 }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={13} /> Local</label>
                                        <input type="text" placeholder="Ex: Estádio do Maracanã" value={location} onChange={e => setLocation(e.target.value)} />
                                    </div>
                                </div>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label>Link YouTube Live (Opcional)</label>
                                    <input type="text" placeholder="URL ou ID do YouTube" value={youtubeLiveId} onChange={e => setYoutubeLiveId(e.target.value)} />
                                </div>
                                {error && <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid var(--danger)', borderRadius: '8px', padding: '10px', color: 'var(--danger)', fontSize: '0.875rem' }}><AlertCircle size={16} />{error}</div>}
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '14px' }}>
                                        <Swords size={18} /> {editingMatchId ? 'Salvar' : 'Criar Partida'}
                                    </button>
                                    {editingMatchId && <button type="button" onClick={() => { setEditingMatchId(null); resetForm(); }} className="btn-outline" style={{ padding: '14px 20px' }}>Cancelar</button>}
                                </div>
                            </form>
                        )}
                </section>

                {/* Match List */}
                <section className="glass-panel p-24">
                    <h2 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Swords size={20} className="text-gradient-accent" /> Calendário
                    </h2>

                    {/* Filter Tabs */}
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: '4px' }}>
                        {(['all', 'scheduled', 'live', 'finished'] as const).map(t => (
                            <button key={t} onClick={() => setTab(t)}
                                style={{ flex: 1, padding: '7px 4px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, background: tab === t ? 'var(--primary)' : 'transparent', color: tab === t ? 'white' : 'var(--text-muted)', transition: 'all 0.2s' }}>
                                {{ all: 'Todos', scheduled: 'Ag.', live: 'Ao Vivo', finished: 'Fim' }[t]}
                            </button>
                        ))}
                    </div>

                    {filteredMatches.length === 0
                        ? <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>Nenhuma partida nesta categoria.</p>
                        : <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '500px', overflowY: 'auto' }}>
                            {filteredMatches.map(match => {
                                const ht = teams.find(t => t.id === match.homeTeamId);
                                const at = teams.find(t => t.id === match.awayTeamId);
                                const isLive = match.status === 'live';
                                return (
                                    <div key={match.id} style={{
                                        padding: '14px 16px', borderRadius: '12px',
                                        background: isLive ? 'rgba(109,40,217,0.15)' : 'rgba(0,0,0,0.2)',
                                        border: `1px solid ${isLive ? 'var(--primary)' : 'var(--glass-border)'}`,
                                    }}>
                                        {/* Teams */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                            <TeamLogo src={ht?.logo} size={32} />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{ht?.name} x {at?.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                    {match.scheduledAt && <span>📅 {formatDate(match.scheduledAt)}</span>}
                                                    {match.location && <span>📍 {match.location}</span>}
                                                </div>
                                            </div>
                                            <TeamLogo src={at?.logo} size={32} />
                                        </div>
                                        {/* Score for finished */}
                                        {match.status === 'finished' && (
                                            <div style={{ textAlign: 'center', fontWeight: 800, fontSize: '1.25rem', marginBottom: '10px' }}>
                                                <span style={{ color: 'var(--primary)' }}>{match.homeScore}</span>
                                                <span style={{ color: 'var(--text-muted)', margin: '0 10px' }}>-</span>
                                                <span style={{ color: 'var(--accent)' }}>{match.awayScore}</span>
                                            </div>
                                        )}
                                        {/* Actions */}
                                        <div className="action-group" style={{ justifyContent: 'flex-end' }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isLive ? 'var(--accent)' : match.status === 'finished' ? 'var(--text-muted)' : 'var(--warning)', marginRight: 'auto' }}>
                                                {isLive ? '🔴 AO VIVO' : match.status === 'finished' ? '✓ CONCLUÍDA' : '⏰ AGENDADA'}
                                            </span>
                                            {match.status === 'scheduled' && <button onClick={() => handleEdit(match)} className="action-icon-btn" title="Editar"><Edit2 size={15} /></button>}
                                            <button onClick={() => handleEnter(match.id, match.status)} className={isLive ? 'action-icon-btn accent' : 'action-icon-btn'} title={isLive ? 'Gerenciar' : match.status === 'finished' ? 'Ver' : 'Iniciar'}>
                                                {isLive ? <Play size={15} /> : match.status === 'finished' ? <CheckCircle size={15} /> : <Play size={15} />}
                                            </button>
                                            <button onClick={() => handleDelete(match.id)} className="action-icon-btn danger" title="Excluir"><Trash2 size={15} /></button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    }
                </section>
            </div>
        </div>
    );
};

export default Matches;
