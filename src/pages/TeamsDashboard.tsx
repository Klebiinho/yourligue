import React, { useState } from 'react';
import { useChampionship } from '../context/ChampionshipContext';
import type { Team } from '../context/ChampionshipContext';
import { Shield, Edit, Trash2, BarChart2, X, Save, Plus, Image as ImageIcon } from 'lucide-react';
import TeamLogo from '../components/TeamLogo';

const TeamsDashboard = () => {
    const { league, teams, updateTeam, deleteTeam, addPlayer, removePlayer } = useChampionship();
    const [selectedTeamId, setSelectedTeamId] = useState<string | null>(teams.length > 0 ? teams[0].id : null);
    const [isEditingTeam, setIsEditingTeam] = useState(false);
    const [editTeamName, setEditTeamName] = useState('');
    const [editTeamLogo, setEditTeamLogo] = useState('');

    // Player add form state
    const [newPlayerName, setNewPlayerName] = useState('');
    const [newPlayerNumber, setNewPlayerNumber] = useState('');
    const [newPlayerPhoto, setNewPlayerPhoto] = useState('');
    const [newPlayerPosição, setNewPlayerPosição] = useState('Atacante');

    const selectedTeam = teams.find(t => t.id === selectedTeamId);

    const startEditingTeam = (team: Team) => {
        setEditTeamName(team.name);
        setEditTeamLogo(team.logo);
        setIsEditingTeam(true);
    };

    const handleUpdateTeam = () => {
        if (selectedTeamId && editTeamName) {
            updateTeam(selectedTeamId, { name: editTeamName, logo: editTeamLogo });
            setIsEditingTeam(false);
        }
    };

    const handleDeleteTeam = (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este time? This will also remove any matches involving this team.')) {
            deleteTeam(id);
            if (selectedTeamId === id) {
                setSelectedTeamId(teams.find(t => t.id !== id)?.id || null);
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (value: string) => void) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setter(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddPlayer = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedTeamId && newPlayerName && newPlayerNumber) {
            addPlayer(selectedTeamId, {
                name: newPlayerName,
                number: parseInt(newPlayerNumber),
                position: newPlayerPosição,
                photo: newPlayerPhoto
            });
            setNewPlayerName('');
            setNewPlayerNumber('');
            setNewPlayerPhoto('');
            // Reset file input if exists
            const input = document.getElementById('newPlayerDashboardPhoto') as HTMLInputElement;
            if (input) input.value = '';
        }
    };

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <BarChart2 size={32} /> Teams Dashboard & Stats
                </h1>
                <p style={{ color: 'var(--text-muted)' }}>Advanced management and analytics for your squads.</p>
            </header>

            <div className="grid-2" style={{ gridTemplateColumns: 'minmax(300px, 1fr) 2fr' }}>
                {/* Left: Team Selection List */}
                <aside className="glass-panel" style={{ padding: '24px' }}>
                    <h2 style={{ marginBottom: '20px', fontSize: '1.25rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>
                        Registered Teams
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {teams.map(team => (
                            <div
                                key={team.id}
                                onClick={() => { setSelectedTeamId(team.id); setIsEditingTeam(false); }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '12px',
                                    borderRadius: '12px',
                                    background: selectedTeamId === team.id ? 'var(--primary-glow)' : 'rgba(0,0,0,0.2)',
                                    border: `1px solid ${selectedTeamId === team.id ? 'var(--primary)' : 'transparent'}`,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <TeamLogo src={team.logo} size={40} />
                                <div style={{ flex: 1, fontWeight: 600 }}>{team.name}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{team.players.length} Players</div>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Right: Team Details, Edit, and Stats */}
                <main>
                    {selectedTeam ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {/* Team Header Card */}
                            <section className="glass-panel" style={{ padding: '32px', position: 'relative' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                    <div style={{ position: 'relative' }}>
                                        <TeamLogo src={isEditingTeam ? editTeamLogo : selectedTeam.logo} size={100} />
                                        {isEditingTeam && (
                                            <div className="file-upload-wrapper" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '100%', borderRadius: '50%' }}>
                                                <div className="file-upload-custom" style={{ width: '100%', height: '100%', borderRadius: '50%', padding: 0, opacity: 0.8, background: 'rgba(0,0,0,0.5)', border: 'none' }}>
                                                    <Edit size={24} color="white" />
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleFileChange(e, setEditTeamLogo)}
                                                    className="file-input-hidden"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        {isEditingTeam ? (
                                            <input
                                                type="text"
                                                value={editTeamName}
                                                onChange={(e) => setEditTeamName(e.target.value)}
                                                style={{ fontSize: '2rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--primary)', borderRadius: '8px', padding: '4px 12px', width: '100%', color: 'white' }}
                                            />
                                        ) : (
                                            <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>{selectedTeam.name}</h2>
                                        )}
                                        <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                                            <div style={{ background: 'var(--glass-border)', padding: '4px 12px', borderRadius: '16px', fontSize: '0.875rem' }}>ID: {selectedTeam.id}</div>
                                            <div style={{ color: 'var(--text-muted)' }}>{selectedTeam.players.length} players registered</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        {isEditingTeam ? (
                                            <>
                                                <button onClick={handleUpdateTeam} className="btn-accent" style={{ padding: '10px' }}><Save size={20} /></button>
                                                <button onClick={() => setIsEditingTeam(false)} className="btn-outline" style={{ padding: '10px' }}><X size={20} /></button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => startEditingTeam(selectedTeam)} className="btn-outline" style={{ padding: '10px' }} title="Editar Time"><Edit size={20} /></button>
                                                <button onClick={() => handleDeleteTeam(selectedTeam.id)} className="btn-danger-outline" style={{ padding: '10px', background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: '8px', cursor: 'pointer' }} title="Excluir Time"><Trash2 size={20} /></button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </section>

                            {/* Stats Grid */}
                            <section className="grid-4" style={{ gap: '16px' }}>
                                <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '4px' }}>Partidas</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{selectedTeam.stats.matches}</div>
                                </div>
                                <div className="glass-panel" style={{ padding: '20px', textAlign: 'center', borderBottom: '3px solid #22c55e' }}>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '4px' }}>Vitórias</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#22c55e' }}>{selectedTeam.stats.wins}</div>
                                </div>
                                <div className="glass-panel" style={{ padding: '20px', textAlign: 'center', borderBottom: '3px solid var(--accent)' }}>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '4px' }}>Empates</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>{selectedTeam.stats.draws}</div>
                                </div>
                                <div className="glass-panel" style={{ padding: '20px', textAlign: 'center', borderBottom: '3px solid var(--danger)' }}>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '4px' }}>Derrotas</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--danger)' }}>{selectedTeam.stats.losses}</div>
                                </div>
                                <div className="glass-panel" style={{ gridColumn: '1 / -1', padding: '20px', textAlign: 'center', background: 'var(--primary-glow)', border: 'none' }}>
                                    <div style={{ color: 'white', fontSize: '0.875rem', marginBottom: '4px' }}>Pontuação Total</div>
                                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'white' }}>{selectedTeam.stats.wins * league.pointsForWin + selectedTeam.stats.draws * league.pointsForDraw + selectedTeam.stats.losses * league.pointsForLoss} pts</div>
                                </div>
                            </section>

                            {/* Goals / Cards / Assists */}
                            <section className="grid-2" style={{ gap: '16px' }}>
                                <div className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Gols Pró</div>
                                        <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{selectedTeam.stats.goalsFor}</div>
                                    </div>
                                    <div style={{ opacity: 0.2 }}><Shield size={40} /></div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Against</div>
                                        <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{selectedTeam.stats.goalsAgainst}</div>
                                    </div>
                                </div>
                                <div className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '32px' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ width: '12px', height: '18px', background: 'var(--warning)', borderRadius: '2px', margin: '0 auto 4px' }}></div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{selectedTeam.players.reduce((acc, p) => acc + p.stats.yellowCards, 0)}</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ width: '12px', height: '18px', background: 'var(--danger)', borderRadius: '2px', margin: '0 auto 4px' }}></div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{selectedTeam.players.reduce((acc, p) => acc + p.stats.redCards, 0)}</div>
                                    </div>
                                </div>
                            </section>

                            {/* Squad Table */}
                            <section className="glass-panel" style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <h3 style={{ fontSize: '1.25rem' }}>Squad Performance</h3>
                                </div>

                                {/* Adicionar Jogador Form */}
                                <form onSubmit={handleAddPlayer} className="grid-2" style={{ gap: '12px', marginBottom: '32px', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                    <div className="input-group" style={{ marginBottom: 0 }}>
                                        <label>Nome do Jogador</label>
                                        <input type="text" placeholder="Name" value={newPlayerName} onChange={e => setNewPlayerName(e.target.value)} required />
                                    </div>
                                    <div className="input-group" style={{ marginBottom: 0 }}>
                                        <label>Number</label>
                                        <input type="number" placeholder="Shirt #" value={newPlayerNumber} onChange={e => setNewPlayerNumber(e.target.value)} required />
                                    </div>
                                    <div className="input-group" style={{ marginBottom: 0 }}>
                                        <label>Posição</label>
                                        <select value={newPlayerPosição} onChange={e => setNewPlayerPosição(e.target.value)}>
                                            <option>Goleiro</option>
                                            <option>Zagueiro</option>
                                            <option>Meio-campo</option>
                                            <option>Atacante</option>
                                        </select>
                                    </div>
                                    <div className="input-group" style={{ marginBottom: 0 }}>
                                        <label>Photo</label>
                                        <div className="file-upload-wrapper">
                                            <div className="file-upload-custom">
                                                <ImageIcon size={18} />
                                                <span>{newPlayerPhoto ? 'Photo Selected' : 'Choose Photo'}</span>
                                            </div>
                                            <input
                                                id="newPlayerDashboardPhoto"
                                                className="file-input-hidden"
                                                type="file"
                                                accept="image/*"
                                                onChange={e => handleFileChange(e, setNewPlayerPhoto)}
                                            />
                                        </div>
                                    </div>
                                    <button type="submit" className="btn-primary" style={{ gridColumn: '1 / -1', justifyContent: 'center' }}>
                                        <Plus size={18} /> Adicionar Jogador to Squad
                                    </button>
                                </form>

                                <div className="table-responsive">
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                                <th style={{ padding: '12px' }}>#</th>
                                                <th style={{ padding: '12px' }}>Player</th>
                                                <th style={{ padding: '12px' }}>Goals</th>
                                                <th style={{ padding: '12px' }}>Assist</th>
                                                <th style={{ padding: '12px' }}>Yel/Red</th>
                                                <th style={{ padding: '12px' }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedTeam.players.map(player => (
                                                <tr key={player.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <td style={{ padding: '12px', fontWeight: 800, color: 'var(--text-muted)' }}>{player.number}</td>
                                                    <td style={{ padding: '12px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            <TeamLogo src={player.photo} size={32} />
                                                            <div>
                                                                <div style={{ fontWeight: 600 }}>{player.name}</div>
                                                                <div style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>{player.position}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '12px', fontWeight: 700 }}>{player.stats.goals}</td>
                                                    <td style={{ padding: '12px' }}>{player.stats.assists}</td>
                                                    <td style={{ padding: '12px' }}>
                                                        <span style={{ color: 'var(--warning)' }}>{player.stats.yellowCards}</span> / <span style={{ color: 'var(--danger)' }}>{player.stats.redCards}</span>
                                                    </td>
                                                    <td style={{ padding: '12px' }}>
                                                        <button onClick={() => removePlayer(selectedTeam.id, player.id)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer' }}><X size={16} /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </div>
                    ) : (
                        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <Shield size={64} style={{ marginBottom: '20px', opacity: 0.1 }} />
                            <h3>No teams selected or found.</h3>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default TeamsDashboard;
