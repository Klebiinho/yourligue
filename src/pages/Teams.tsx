import React, { useState } from 'react';
import { useChampionship } from '../context/ChampionshipContext';
import { Users, PlusCircle, Shield, UserPlus, Image as ImageIcon, Crown } from 'lucide-react';

const Teams = () => {
    const { league, teams, addTeam, addPlayer, toggleCaptain } = useChampionship();
    const [newTeamName, setNewTeamName] = useState('');
    const [newTeamLogo, setNewTeamLogo] = useState('');
    const [selectedTeam, setSelectedTeam] = useState<string | null>(teams.length > 0 ? teams[0].id : null);

    const [newPlayerName, setNewPlayerName] = useState('');
    const [newPlayerNumber, setNewPlayerNumber] = useState('');
    const [newPlayerPos, setNewPlayerPos] = useState('Forward');
    const [newPlayerPhoto, setNewPlayerPhoto] = useState('');

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

    const handleAddTeam = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTeamName) {
            addTeam({
                name: newTeamName,
                logo: newTeamLogo || 'https://images.unsplash.com/photo-1518605363461-464a8da58356?w=150&h=150&fit=crop' // placeholder if empty
            });
            setNewTeamName('');
            setNewTeamLogo('');
            // Reset file input
            const teamLogoInput = document.getElementById('teamLogoInput') as HTMLInputElement;
            if (teamLogoInput) teamLogoInput.value = '';
        }
    };

    const handleAddPlayer = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPlayerName && newPlayerNumber && selectedTeam) {
            addPlayer(selectedTeam, {
                name: newPlayerName,
                number: parseInt(newPlayerNumber),
                position: newPlayerPos,
                photo: newPlayerPhoto
            });
            setNewPlayerName('');
            setNewPlayerNumber('');
            setNewPlayerPhoto('');
            // Reset file input
            const playerPhotoInput = document.getElementById('playerPhotoInput') as HTMLInputElement;
            if (playerPhotoInput) playerPhotoInput.value = '';
        }
    };

    const currentTeam = teams.find(t => t.id === selectedTeam);

    const renderImage = (src: string | undefined, size: number = 48, defaultIcon: React.ReactNode) => {
        if (!src) return (
            <div style={{ width: size, height: size, borderRadius: '50%', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--primary)' }}>
                {defaultIcon}
            </div>
        );
        return <img src={src} alt="logo" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)', background: 'white' }} />;
    };

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Teams & Players</h1>
                <p style={{ color: 'var(--text-muted)' }}>Manage your {league.name} teams, squads, and players.</p>
            </header>

            <div className="grid-2">
                <section className="glass-panel" style={{ padding: '24px' }}>
                    <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Shield size={20} className="text-gradient" /> Registrar Time
                    </h2>
                    <form onSubmit={handleAddTeam} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                        <div className="input-group" style={{ marginBottom: 0 }}>
                            <label>Team Name</label>
                            <input type="text" placeholder="Team Name" value={newTeamName} onChange={e => setNewTeamName(e.target.value)} required />
                        </div>
                        <div className="input-group" style={{ marginBottom: 0 }}>
                            <label>Escudo do Time</label>
                            <div className="file-upload-wrapper">
                                <div className="file-upload-custom">
                                    <ImageIcon size={20} />
                                    <span>{newTeamLogo ? 'Change Shield Photo' : 'Upload Team Shield'}</span>
                                </div>
                                <input
                                    id="teamLogoInput"
                                    className="file-input-hidden"
                                    type="file"
                                    accept="image/*"
                                    onChange={e => handleFileChange(e, setNewTeamLogo)}
                                />
                            </div>
                        </div>
                        {newTeamLogo && (
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <img src={newTeamLogo} alt="Preview" style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }} />
                            </div>
                        )}
                        <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }}><PlusCircle size={20} /> Add Team</button>
                    </form>

                    <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Registered Teams ({teams.length} / {league.maxTeams})</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {teams.map(team => (
                            <div
                                key={team.id}
                                onClick={() => setSelectedTeam(team.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    background: selectedTeam === team.id ? 'var(--primary-glow)' : 'rgba(0,0,0,0.2)',
                                    border: `1px solid ${selectedTeam === team.id ? 'var(--primary)' : 'var(--glass-border)'}`,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {renderImage(team.logo, 40, <Shield size={20} />)}
                                <div style={{ fontWeight: 600, flex: 1 }}>{team.name}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}><Users size={14} style={{ inlineSize: 'auto', verticalAlign: 'middle', marginRight: '4px' }} /> {team.players.length}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {currentTeam && (
                    <section className="glass-panel" style={{ padding: '24px' }}>
                        <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <UserPlus size={20} className="text-gradient-accent" /> Squad: {currentTeam.name}
                        </h2>

                        <form onSubmit={handleAddPlayer} className="grid-2" style={{ gap: '12px', marginBottom: '24px' }}>
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <label>Player Name</label>
                                <input type="text" placeholder="Player Name" value={newPlayerName} onChange={e => setNewPlayerName(e.target.value)} required />
                            </div>
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <label>Shirt Number</label>
                                <input type="number" placeholder="Shirt Number" value={newPlayerNumber} onChange={e => setNewPlayerNumber(e.target.value)} required />
                            </div>
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <label>Position</label>
                                <select value={newPlayerPos} onChange={e => setNewPlayerPos(e.target.value)}>
                                    <option>Goalkeeper</option>
                                    <option>Defender</option>
                                    <option>Midfielder</option>
                                    <option>Forward</option>
                                </select>
                            </div>
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <label>Player Photo</label>
                                <div className="file-upload-wrapper">
                                    <div className="file-upload-custom" style={{ borderColor: 'rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.05)' }}>
                                        <ImageIcon size={20} style={{ color: 'var(--accent)' }} />
                                        <span>{newPlayerPhoto ? 'Change Photo' : 'Upload Photo'}</span>
                                    </div>
                                    <input
                                        id="playerPhotoInput"
                                        className="file-input-hidden"
                                        type="file"
                                        accept="image/*"
                                        onChange={e => handleFileChange(e, setNewPlayerPhoto)}
                                    />
                                </div>
                            </div>
                            {newPlayerPhoto && (
                                <div style={{ display: 'flex', justifyContent: 'center', gridColumn: '1 / -1' }}>
                                    <img src={newPlayerPhoto} alt="Preview" style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }} />
                                </div>
                            )}
                            <button type="submit" className="btn-accent" style={{ gridColumn: '1 / -1', justifyContent: 'center' }}><PlusCircle size={20} /> Add Player</button>
                        </form>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                            {currentTeam.players.map(player => (
                                <div key={player.id} className="player-card" style={{ padding: '16px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', position: 'relative', overflow: 'hidden' }}>
                                    <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '3rem', fontWeight: 900, color: 'rgba(255,255,255,0.05)', lineHeight: 1, zIndex: 0 }}>{player.number}</div>
                                    <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 10 }}>
                                        <button
                                            onClick={() => toggleCaptain(currentTeam.id, player.id)}
                                            className={`captain-toggle ${player.isCaptain ? 'active' : ''}`}
                                            title={player.isCaptain ? "Remover Capitão" : "Marcar como Capitão"}
                                            style={{ background: 'transparent', border: 'none', padding: '4px' }}
                                        >
                                            <Crown size={20} />
                                        </button>
                                    </div>
                                    <div style={{ zIndex: 1, marginBottom: '8px' }}>
                                        {renderImage(player.photo, 64, player.name.charAt(0))}
                                    </div>
                                    <div style={{ textAlign: 'center', zIndex: 1 }}>
                                        <div style={{ fontWeight: 600 }}>{player.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>{player.position}</div>
                                    </div>
                                </div>
                            ))}
                            {currentTeam.players.length === 0 && (
                                <p style={{ color: 'var(--text-muted)', gridColumn: '1 / -1' }}>No players registered for this team yet.</p>
                            )}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default Teams;
