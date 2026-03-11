import React, { useState } from 'react';
import { useChampionship } from '../context/ChampionshipContext';
import { Swords, PlusCircle, Play, CheckCircle, Trash2, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TeamLogo from '../components/TeamLogo';

const Matches = () => {
    const { teams, matches, createMatch, startMatch, deleteMatch, updateMatch } = useChampionship();
    const [homeTeamId, setHomeTeamId] = useState(teams[0]?.id || '');
    const [awayTeamId, setAwayTeamId] = useState(teams[1]?.id || '');
    const [youtubeLiveId, setYoutubeLiveId] = useState('');
    const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleCreateMatch = (e: React.FormEvent) => {
        e.preventDefault();
        if (homeTeamId && awayTeamId && homeTeamId !== awayTeamId) {
            let videoId = youtubeLiveId;
            try {
                if (videoId.includes('youtube.com') || videoId.includes('youtu.be')) {
                    const url = new URL(videoId);
                    videoId = url.searchParams.get('v') || url.pathname.slice(1) || videoId;
                }
            } catch (err) { }

            if (editingMatchId) {
                updateMatch(editingMatchId, { homeTeamId, awayTeamId, youtubeLiveId: videoId });
                setEditingMatchId(null);
            } else {
                createMatch(homeTeamId, awayTeamId, videoId);
            }
            setYoutubeLiveId('');
        }
    };

    const handleEditClick = (match: any) => {
        setEditingMatchId(match.id);
        setHomeTeamId(match.homeTeamId);
        setAwayTeamId(match.awayTeamId);
        setYoutubeLiveId(match.youtubeLiveId || '');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingMatchId(null);
        setYoutubeLiveId('');
        setHomeTeamId(teams[0]?.id || '');
        setAwayTeamId(teams[1]?.id || '');
    };

    const handleStartMatch = (id: string, status: string) => {
        if (status === 'scheduled') {
            startMatch(id);
        }
        navigate(`/match/${id}`);
    };

    const handleDeleteMatch = (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir esta partida?')) {
            deleteMatch(id);
        }
    };

    return (
        <div className="animate-fade-in">
            <header className="mb-40">
                <h1 className="responsive-title">Gestão de Partidas</h1>
                <p className="responsive-subtitle">Crie e gerencie partidas em tempo real.</p>
            </header>

            <div className="grid-2">
                <section className="glass-panel p-24">
                    <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <PlusCircle size={20} className="text-gradient" /> {editingMatchId ? 'Editar Partida' : 'Agendar Partida'}
                    </h2>
                    <form onSubmit={handleCreateMatch} className="grid-2" style={{ gap: '16px', marginBottom: '24px' }}>
                        <div className="input-group">
                            <label>Time Mandante</label>
                            <select value={homeTeamId} onChange={e => setHomeTeamId(e.target.value)}>
                                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Time Visitante</label>
                            <select value={awayTeamId} onChange={e => setAwayTeamId(e.target.value)}>
                                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                            <label>URL ou ID do Youtube Live (Opcional)</label>
                            <input type="text" placeholder="e.g. https://www.youtube.com/watch?v=..." value={youtubeLiveId} onChange={e => setYoutubeLiveId(e.target.value)} />
                        </div>
                        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '12px' }}>
                            <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '16px', fontSize: '1.125rem' }}>
                                <Swords size={24} /> {editingMatchId ? 'Salvar Alterações' : 'Criar Partida'}
                            </button>
                            {editingMatchId && (
                                <button type="button" onClick={cancelEdit} className="btn-outline" style={{ padding: '16px' }}>
                                    Cancelar
                                </button>
                            )}
                        </div>
                    </form>
                </section>

                <section className="glass-panel p-24">
                    <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Swords size={20} className="text-gradient-accent" /> Calendário de Jogos
                    </h2>
                    {matches.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>Nenhuma partida agendada. Crie uma para começar.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {matches.map(match => {
                                const homeTeam = teams.find(t => t.id === match.homeTeamId);
                                const awayTeam = teams.find(t => t.id === match.awayTeamId);
                                const isLive = match.status === 'live';
                                const isFinished = match.status === 'finished';

                                return (
                                    <div key={match.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: isLive ? 'var(--primary-glow)' : 'rgba(0,0,0,0.2)', borderRadius: '12px', border: `1px solid ${isLive ? 'var(--primary)' : 'var(--glass-border)'}` }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <TeamLogo src={homeTeam?.logo} size={40} />
                                                <span style={{ fontSize: '1.25rem', color: 'var(--text-muted)', fontWeight: 800 }}>x</span>
                                                <TeamLogo src={awayTeam?.logo} size={40} />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{homeTeam?.name} <span style={{ color: 'var(--text-muted)' }}>x</span> {awayTeam?.name}</div>
                                                <div style={{ fontSize: '0.875rem', color: isLive ? 'var(--accent)' : 'var(--text-muted)', fontWeight: 600 }}>
                                                    {isLive ? 'AO VIVO' : isFinished ? 'CONCLUÍDA' : 'AGENDADA'}
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {match.status === 'scheduled' && (
                                                <button
                                                    onClick={() => handleEditClick(match)}
                                                    className="btn-outline"
                                                    style={{ padding: '8px', background: 'transparent', border: '1px solid var(--text-muted)', color: 'var(--text-muted)', borderRadius: '50%', cursor: 'pointer' }}
                                                    title="Editar Partida"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleStartMatch(match.id, match.status)}
                                                className={isLive ? 'btn-danger' : isFinished ? 'btn-outline' : 'btn-accent'}
                                                style={{ padding: '8px 16px', borderRadius: '24px' }}
                                            >
                                                {isLive ? 'Gerenciar' : isFinished ? <span><CheckCircle size={16} /> Ver</span> : <span><Play size={16} /> Iniciar</span>}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteMatch(match.id)}
                                                className="btn-danger-outline"
                                                style={{ padding: '8px', background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: '50%', cursor: 'pointer' }}
                                                title="Excluir Partida"
                                            >
                                                <Trash2 size={16} />
                                            </button>
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
