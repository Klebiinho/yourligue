import { useState } from 'react';
import { useLeague } from '../context/LeagueContext';
import { Crown, Edit2, Trash2, Check, X, Image as ImageIcon } from 'lucide-react';
import TeamLogo from '../components/TeamLogo';

const TeamsDashboard = () => {
    const { league, teams, updateTeam, deleteTeam, updatePlayer, removePlayer, toggleCaptain } = useLeague();
    const [selectedTeamId, setSelectedTeamId] = useState<string | null>(teams[0]?.id ?? null);
    const [editingTeam, setEditingTeam] = useState(false);
    const [editTeamName, setEditTeamName] = useState('');
    const [editTeamLogo, setEditTeamLogo] = useState('');
    const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editNumber, setEditNumber] = useState('');
    const [editPos, setEditPos] = useState('');
    const [editPhoto, setEditPhoto] = useState('');

    const selectedTeam = teams.find(t => t.id === selectedTeamId);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>, setter: (v: string) => void) => {
        const file = e.target.files?.[0];
        if (file) { const r = new FileReader(); r.onloadend = () => setter(r.result as string); r.readAsDataURL(file); }
    };

    const startEditTeam = (t: typeof teams[0]) => {
        setEditTeamName(t.name); setEditTeamLogo(t.logo); setEditingTeam(true);
    };

    const saveTeam = async () => {
        if (selectedTeamId) await updateTeam(selectedTeamId, { name: editTeamName, logo: editTeamLogo });
        setEditingTeam(false);
    };

    const handleDeleteTeam = async (id: string) => {
        if (window.confirm('Excluir este time e todos os seus dados?')) {
            await deleteTeam(id);
            setSelectedTeamId(teams.find(t => t.id !== id)?.id ?? null);
        }
    };

    const startEditPlayer = (p: any) => {
        setEditingPlayerId(p.id); setEditName(p.name);
        setEditNumber(String(p.number)); setEditPos(p.position); setEditPhoto(p.photo || '');
    };

    const savePlayer = async () => {
        if (editingPlayerId && selectedTeamId) {
            await updatePlayer(selectedTeamId, editingPlayerId, { name: editName, number: parseInt(editNumber), position: editPos, photo: editPhoto });
        }
        setEditingPlayerId(null);
    };

    const allPlayers = teams.flatMap(t => t.players.map(p => ({ ...p, team: t })));
    const topScorers = [...allPlayers].sort((a, b) => b.stats.goals - a.stats.goals).slice(0, 10);

    return (
        <div className="animate-fade-in">
            <header className="mb-40">
                <h1 className="responsive-title">Painel das Equipes</h1>
                <p className="responsive-subtitle">Gerencie os elencos e veja as estatísticas — {league?.name}</p>
            </header>

            <div className="teams-dashboard-layout">
                {/* Team List */}
                <aside className="glass-panel p-24" style={{ alignSelf: 'start' }}>
                    <h2 style={{ marginBottom: '16px', fontSize: '1.1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>Times Cadastrados</h2>
                    {teams.length === 0
                        ? <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Nenhum time ainda.</p>
                        : <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {teams.map(t => (
                                <div key={t.id} onClick={() => { setSelectedTeamId(t.id); setEditingTeam(false); }}
                                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s', background: selectedTeamId === t.id ? 'var(--primary-glow)' : 'rgba(0,0,0,0.2)', border: `1px solid ${selectedTeamId === t.id ? 'var(--primary)' : 'transparent'}` }}>
                                    <TeamLogo src={t.logo} size={36} />
                                    <div style={{ flex: 1, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.9rem' }}>{t.name}</div>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{t.players.length}</span>
                                </div>
                            ))}
                        </div>
                    }
                </aside>

                {/* Main Content */}
                <main style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {selectedTeam ? (
                        <>
                            {/* Team Header */}
                            <section className="glass-panel p-24">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                                    <div style={{ position: 'relative' }}>
                                        <TeamLogo src={editingTeam ? editTeamLogo : selectedTeam.logo} size={90} />
                                        {editingTeam && (
                                            <div className="file-upload-wrapper" style={{ position: 'absolute', inset: 0, borderRadius: '50%' }}>
                                                <div className="file-upload-custom" style={{ width: '100%', height: '100%', borderRadius: '50%', padding: 0, opacity: 0.8, background: 'rgba(0,0,0,0.5)', border: 'none', fontSize: '0' }}>
                                                    <ImageIcon size={22} color="white" />
                                                </div>
                                                <input type="file" accept="image/*" className="file-input-hidden" onChange={e => handleFile(e, setEditTeamLogo)} />
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ flex: 1, minWidth: '200px' }}>
                                        {editingTeam
                                            ? <input value={editTeamName} onChange={e => setEditTeamName(e.target.value)} style={{ fontSize: 'clamp(1.25rem,4vw,1.75rem)', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--primary)', borderRadius: '8px', padding: '6px 12px', color: 'white', width: '100%' }} />
                                            : <h2 style={{ fontSize: 'clamp(1.25rem,4vw,1.75rem)', fontWeight: 800 }}>{selectedTeam.name}</h2>}
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>{selectedTeam.players.length} jogadores · {selectedTeam.stats.matches} partidas</p>
                                    </div>
                                    <div className="action-group">
                                        {editingTeam ? (
                                            <>
                                                <button onClick={saveTeam} className="action-icon-btn accent" title="Salvar"><Check size={18} /></button>
                                                <button onClick={() => setEditingTeam(false)} className="action-icon-btn" title="Cancelar"><X size={18} /></button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => startEditTeam(selectedTeam)} className="action-icon-btn" title="Editar"><Edit2 size={18} /></button>
                                                <button onClick={() => handleDeleteTeam(selectedTeam.id)} className="action-icon-btn danger" title="Excluir"><Trash2 size={18} /></button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid-4" style={{ marginTop: '20px' }}>
                                    {[
                                        { label: 'Partidas', val: selectedTeam.stats.matches, color: 'var(--text-main)' },
                                        { label: 'Vitórias', val: selectedTeam.stats.wins, color: '#22c55e' },
                                        { label: 'Empates', val: selectedTeam.stats.draws, color: 'var(--warning)' },
                                        { label: 'Derrotas', val: selectedTeam.stats.losses, color: 'var(--danger)' },
                                    ].map(s => (
                                        <div key={s.label} style={{ textAlign: 'center', padding: '14px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                                            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: s.color }}>{s.val}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Points */}
                                <div style={{ marginTop: '12px', textAlign: 'center', padding: '14px', background: 'var(--primary-glow)', borderRadius: '12px', border: '1px solid rgba(109,40,217,0.5)' }}>
                                    <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>Pontuação Total: </span>
                                    <span style={{ fontWeight: 900, fontSize: '1.5rem', color: 'white' }}>
                                        {selectedTeam.stats.wins * (league?.pointsForWin ?? 3) + selectedTeam.stats.draws * (league?.pointsForDraw ?? 1) + selectedTeam.stats.losses * (league?.pointsForLoss ?? 0)} pts
                                    </span>
                                </div>
                            </section>

                            {/* Player Table */}
                            <section className="glass-panel p-24">
                                <h3 style={{ marginBottom: '20px', fontSize: '1.1rem' }}>Desempenho do Elenco</h3>
                                <div className="table-responsive">
                                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '580px' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                <th style={{ padding: '10px 12px', textAlign: 'center' }}>#</th>
                                                <th style={{ padding: '10px 12px', textAlign: 'left' }}>Jogador</th>
                                                <th style={{ padding: '10px 12px', textAlign: 'center' }}>Gols</th>
                                                <th style={{ padding: '10px 12px', textAlign: 'center' }}>Assist</th>
                                                <th style={{ padding: '10px 12px', textAlign: 'center' }}>Cap.</th>
                                                <th style={{ padding: '10px 12px', textAlign: 'center' }}>🟨/🟥</th>
                                                <th style={{ padding: '10px 12px', textAlign: 'center' }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedTeam.players.map(p => (
                                                <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                                    {editingPlayerId === p.id ? (
                                                        <>
                                                            <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                                                <input type="number" value={editNumber} onChange={e => setEditNumber(e.target.value)} style={{ width: '52px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', borderRadius: '6px', padding: '4px 8px', color: 'white', textAlign: 'center' }} />
                                                            </td>
                                                            <td style={{ padding: '10px 12px' }}>
                                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                                    <input value={editName} onChange={e => setEditName(e.target.value)} style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--primary)', borderRadius: '6px', padding: '6px 10px', color: 'white', fontSize: '0.875rem' }} />
                                                                    <select value={editPos} onChange={e => setEditPos(e.target.value)} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', borderRadius: '6px', padding: '6px 8px', color: 'white', fontSize: '0.8rem' }}>
                                                                        <option>Goleiro</option><option>Zagueiro</option><option>Lateral</option><option>Meio-campo</option><option>Atacante</option>
                                                                    </select>
                                                                </div>
                                                            </td>
                                                            <td colSpan={3}></td>
                                                            <td></td>
                                                            <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                                                <div className="action-group" style={{ justifyContent: 'center' }}>
                                                                    <button onClick={savePlayer} className="action-icon-btn accent"><Check size={15} /></button>
                                                                    <button onClick={() => setEditingPlayerId(null)} className="action-icon-btn"><X size={15} /></button>
                                                                </div>
                                                            </td>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 800, color: 'var(--text-muted)', fontSize: '0.85rem' }}>#{p.number}</td>
                                                            <td style={{ padding: '10px 12px' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                    <TeamLogo src={p.photo} size={30} />
                                                                    <div>
                                                                        <div style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                            {p.name} {p.isCaptain && <Crown size={12} style={{ color: '#fbbf24' }} />}
                                                                        </div>
                                                                        <div style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>{p.position}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700 }}>{p.stats.goals}</td>
                                                            <td style={{ padding: '10px 12px', textAlign: 'center' }}>{p.stats.assists}</td>
                                                            <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                                                <button onClick={() => toggleCaptain(selectedTeam.id, p.id)} className={`captain-toggle ${p.isCaptain ? 'active' : ''}`} title={p.isCaptain ? 'Remover capitão' : 'Definir capitão'}>
                                                                    <Crown size={17} />
                                                                </button>
                                                            </td>
                                                            <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                                                <span style={{ color: 'var(--warning)', fontWeight: 700 }}>{p.stats.yellowCards}</span>
                                                                <span style={{ color: 'var(--text-muted)', margin: '0 4px' }}>/</span>
                                                                <span style={{ color: 'var(--danger)', fontWeight: 700 }}>{p.stats.redCards}</span>
                                                            </td>
                                                            <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                                                <div className="action-group" style={{ justifyContent: 'center' }}>
                                                                    <button onClick={() => startEditPlayer(p)} className="action-icon-btn" title="Editar"><Edit2 size={15} /></button>
                                                                    <button onClick={() => removePlayer(selectedTeam.id, p.id)} className="action-icon-btn danger" title="Remover"><Trash2 size={15} /></button>
                                                                </div>
                                                            </td>
                                                        </>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </>
                    ) : (
                        <div className="glass-panel p-24" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '80px 24px' }}>
                            <h3>Selecione um time para ver os detalhes</h3>
                        </div>
                    )}

                    {/* Top Scorers */}
                    {topScorers.some(p => p.stats.goals > 0) && (
                        <section className="glass-panel p-24">
                            <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>🏅 Artilheiros da Liga</h3>
                            <div className="table-responsive">
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '480px' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                                            <th style={{ padding: '8px 12px', textAlign: 'center' }}>#</th>
                                            <th style={{ padding: '8px 12px', textAlign: 'left' }}>Player</th>
                                            <th style={{ padding: '8px 12px', textAlign: 'left' }}>Time</th>
                                            <th style={{ padding: '8px 12px', textAlign: 'center' }}>Goals</th>
                                            <th style={{ padding: '8px 12px', textAlign: 'center' }}>Assist</th>
                                            <th style={{ padding: '8px 12px', textAlign: 'center' }}>Yel/Red</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {topScorers.filter(p => p.stats.goals > 0).map((p, i) => (
                                            <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                                <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 800, color: i === 0 ? 'var(--warning)' : 'var(--text-muted)' }}>{i + 1}</td>
                                                <td style={{ padding: '10px 12px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <TeamLogo src={p.photo} size={28} />
                                                        <span style={{ fontWeight: 600 }}>{p.name}</span>
                                                        {p.isCaptain && <Crown size={12} style={{ color: '#fbbf24' }} />}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '10px 12px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <TeamLogo src={p.team.logo} size={20} />
                                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{p.team.name}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem' }}>{p.stats.goals}</td>
                                                <td style={{ padding: '10px 12px', textAlign: 'center' }}>{p.stats.assists}</td>
                                                <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: '0.9rem' }}>
                                                    <span style={{ color: 'var(--warning)' }}>{p.stats.yellowCards}</span> / <span style={{ color: 'var(--danger)' }}>{p.stats.redCards}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}
                </main>
            </div>
        </div>
    );
};

export default TeamsDashboard;
