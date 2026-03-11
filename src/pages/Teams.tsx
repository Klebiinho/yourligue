import { useState } from 'react';
import { useLeague } from '../context/LeagueContext';
import { Shield, UserPlus, Image as ImageIcon, Crown, Trash2, Edit2, Check, X, AlertCircle } from 'lucide-react';
import TeamLogo from '../components/TeamLogo';

const Teams = () => {
    const { league, teams, addTeam, addPlayer, removePlayer, updatePlayer, toggleCaptain } = useLeague();
    const [activeTeamId, setActiveTeamId] = useState<string | null>(teams[0]?.id ?? null);
    const [newTeamName, setNewTeamName] = useState('');
    const [newTeamLogo, setNewTeamLogo] = useState('');
    const [newPlayerName, setNewPlayerName] = useState('');
    const [newPlayerNumber, setNewPlayerNumber] = useState('');
    const [newPlayerPos, setNewPlayerPos] = useState('Atacante');
    const [newPlayerPhoto, setNewPlayerPhoto] = useState('');
    const [error, setError] = useState('');
    const [teamError, setTeamError] = useState('');
    const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editNumber, setEditNumber] = useState('');
    const [editPos, setEditPos] = useState('');
    const [editPhoto, setEditPhoto] = useState('');

    const currentTeam = teams.find(t => t.id === activeTeamId);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>, setter: (v: string) => void) => {
        const file = e.target.files?.[0];
        if (file) { const r = new FileReader(); r.onloadend = () => setter(r.result as string); r.readAsDataURL(file); }
    };

    const handleAddTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTeamName.trim()) return;
        setTeamError('');
        const { error } = await addTeam({ name: newTeamName, logo: newTeamLogo });
        if (error) { setTeamError(error); return; }
        setNewTeamName(''); setNewTeamLogo('');
        const input = document.getElementById('teamLogoInput') as HTMLInputElement;
        if (input) input.value = '';
        const added = teams[teams.length - 1];
        if (added) setActiveTeamId(added.id);
    };

    const handleAddPlayer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPlayerName || !newPlayerNumber || !activeTeamId) return;
        setError('');
        const { error } = await addPlayer(activeTeamId, {
            name: newPlayerName, number: parseInt(newPlayerNumber),
            position: newPlayerPos, photo: newPlayerPhoto
        });
        if (error) { setError(error); return; }
        setNewPlayerName(''); setNewPlayerNumber(''); setNewPlayerPhoto('');
        const inp = document.getElementById('playerPhotoInput') as HTMLInputElement;
        if (inp) inp.value = '';
    };

    const startEdit = (p: any) => {
        setEditingPlayerId(p.id); setEditName(p.name);
        setEditNumber(String(p.number)); setEditPos(p.position); setEditPhoto(p.photo || '');
    };

    const saveEdit = async () => {
        if (!editingPlayerId || !activeTeamId) return;
        await updatePlayer(activeTeamId, editingPlayerId, {
            name: editName, number: parseInt(editNumber), position: editPos, photo: editPhoto
        });
        setEditingPlayerId(null);
    };

    return (
        <div className="animate-fade-in">
            <header className="mb-40">
                <h1 className="responsive-title">Times & Jogadores</h1>
                <p className="responsive-subtitle">Cadastre os times e elencos do campeonato <strong>{league?.name}</strong></p>
            </header>

            <div className="grid-2">
                {/* Cadastrar Time */}
                <section className="glass-panel p-24">
                    <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Shield size={20} className="text-gradient" /> Cadastrar Time
                    </h2>
                    <form onSubmit={handleAddTeam} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                        <div className="input-group" style={{ marginBottom: 0 }}>
                            <label>Nome do Time</label>
                            <input type="text" placeholder="Ex: Flamengo FC" value={newTeamName} onChange={e => setNewTeamName(e.target.value)} required />
                        </div>
                        <div className="input-group" style={{ marginBottom: 0 }}>
                            <label>Escudo</label>
                            <div className="file-upload-wrapper">
                                <div className="file-upload-custom">
                                    <ImageIcon size={18} />
                                    <span>{newTeamLogo ? 'Escudo selecionado ✓' : 'Upload do Escudo'}</span>
                                </div>
                                <input id="teamLogoInput" className="file-input-hidden" type="file" accept="image/*" onChange={e => handleFile(e, setNewTeamLogo)} />
                            </div>
                        </div>
                        {newTeamLogo && <TeamLogo src={newTeamLogo} size={60} />}
                        {teamError && <ErrorMsg msg={teamError} />}
                        <button type="submit" className="btn-primary" style={{ justifyContent: 'center', padding: '12px' }}>
                            <Shield size={18} /> Cadastrar Time
                        </button>
                    </form>

                    {/* Lista de Times */}
                    <h3 style={{ marginBottom: '12px', color: 'var(--text-muted)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Times Cadastrados ({teams.length}/{league?.maxTeams ?? 16})</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '340px', overflowY: 'auto' }}>
                        {teams.map(team => (
                            <div key={team.id} onClick={() => setActiveTeamId(team.id)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', cursor: 'pointer',
                                    background: activeTeamId === team.id ? 'var(--primary-glow)' : 'rgba(0,0,0,0.2)',
                                    border: `1px solid ${activeTeamId === team.id ? 'var(--primary)' : 'transparent'}`,
                                    transition: 'all 0.2s'
                                }}>
                                <TeamLogo src={team.logo} size={38} />
                                <div style={{ flex: 1, fontWeight: 600 }}>{team.name}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{team.players.length} jogadores</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Gerenciar Elenco */}
                {currentTeam ? (
                    <section className="glass-panel p-24">
                        <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <UserPlus size={20} className="text-gradient-accent" /> Elenco: {currentTeam.name}
                        </h2>

                        {/* Add Player Form */}
                        <form onSubmit={handleAddPlayer} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <label>Nome do Jogador</label>
                                <input type="text" placeholder="Nome completo" value={newPlayerName} onChange={e => setNewPlayerName(e.target.value)} required />
                            </div>
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <label>Nº Camisa</label>
                                <input type="number" placeholder="Ex: 10" value={newPlayerNumber} onChange={e => setNewPlayerNumber(e.target.value)} required min={1} max={99} />
                            </div>
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <label>Posição</label>
                                <select value={newPlayerPos} onChange={e => setNewPlayerPos(e.target.value)}>
                                    <option>Goleiro</option><option>Zagueiro</option>
                                    <option>Lateral</option><option>Meio-campo</option>
                                    <option>Atacante</option>
                                </select>
                            </div>
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <label>Foto</label>
                                <div className="file-upload-wrapper">
                                    <div className="file-upload-custom">
                                        <ImageIcon size={16} />
                                        <span>{newPlayerPhoto ? 'Foto ✓' : 'Uploar foto'}</span>
                                    </div>
                                    <input id="playerPhotoInput" className="file-input-hidden" type="file" accept="image/*" onChange={e => handleFile(e, setNewPlayerPhoto)} />
                                </div>
                            </div>
                            {error && <div style={{ gridColumn: '1 / -1' }}><ErrorMsg msg={error} /></div>}
                            <button type="submit" className="btn-primary" style={{ gridColumn: '1 / -1', justifyContent: 'center', padding: '12px' }}>
                                <UserPlus size={18} /> Adicionar Jogador
                            </button>
                        </form>

                        {/* Player List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {currentTeam.players.length === 0
                                ? <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>Nenhum jogador cadastrado ainda.</p>
                                : currentTeam.players.map(player => (
                                    <div key={player.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)' }}>
                                        {editingPlayerId === player.id ? (
                                            <>
                                                <input value={editName} onChange={e => setEditName(e.target.value)} style={{ flex: 2, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--primary)', borderRadius: '6px', padding: '6px 10px', color: 'white', fontSize: '0.875rem' }} />
                                                <input type="number" value={editNumber} onChange={e => setEditNumber(e.target.value)} style={{ width: '60px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', borderRadius: '6px', padding: '6px 8px', color: 'white', fontSize: '0.875rem' }} />
                                                <select value={editPos} onChange={e => setEditPos(e.target.value)} style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', borderRadius: '6px', padding: '6px 8px', color: 'white', fontSize: '0.875rem' }}>
                                                    <option>Goleiro</option><option>Zagueiro</option><option>Lateral</option><option>Meio-campo</option><option>Atacante</option>
                                                </select>
                                                <button onClick={saveEdit} className="action-icon-btn accent" title="Salvar"><Check size={16} /></button>
                                                <button onClick={() => setEditingPlayerId(null)} className="action-icon-btn" title="Cancelar"><X size={16} /></button>
                                            </>
                                        ) : (
                                            <>
                                                <TeamLogo src={player.photo} size={36} />
                                                <div style={{ width: '28px', textAlign: 'center', fontWeight: 800, color: 'var(--text-muted)', fontSize: '0.85rem' }}>#{player.number}</div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        {player.name}
                                                        {player.isCaptain && <Crown size={13} style={{ color: '#fbbf24' }} />}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>{player.position}</div>
                                                </div>
                                                <div className="action-group">
                                                    <button onClick={() => toggleCaptain(currentTeam.id, player.id)} className={`action-icon-btn ${player.isCaptain ? 'gold' : ''}`} title={player.isCaptain ? 'Remover capitão' : 'Marcar como capitão'}><Crown size={16} /></button>
                                                    <button onClick={() => startEdit(player)} className="action-icon-btn" title="Editar"><Edit2 size={16} /></button>
                                                    <button onClick={() => removePlayer(currentTeam.id, player.id)} className="action-icon-btn danger" title="Remover"><Trash2 size={16} /></button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))
                            }
                        </div>
                    </section>
                ) : (
                    <div className="glass-panel p-24" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', minHeight: '300px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <Shield size={48} style={{ marginBottom: '12px', opacity: 0.15 }} />
                            <p>Selecione ou crie um time para gerenciar o elenco</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const ErrorMsg = ({ msg }: { msg: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid var(--danger)', borderRadius: '8px', padding: '10px 14px', color: 'var(--danger)', fontSize: '0.875rem' }}>
        <AlertCircle size={16} /> {msg}
    </div>
);

export default Teams;
