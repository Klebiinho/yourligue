import { useState } from 'react';
import { useLeague } from '../context/LeagueContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Trophy, Plus, Trash2, LogOut, Edit2, Check, X } from 'lucide-react';
import TeamLogo from '../components/TeamLogo';

const LeagueSelector = () => {
    const { leagues, league, createLeague, deleteLeague, selectLeague, updateLeague } = useLeague();
    const { user, signOut } = useAuth();
    const [showCreate, setShowCreate] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [newName, setNewName] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;
        setLoading(true);
        await createLeague({
            name: newName, logo: '', maxTeams: 16,
            pointsForWin: 3, pointsForDraw: 1, pointsForLoss: 0, defaultHalfLength: 45
        });
        setNewName(''); setShowCreate(false); setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza? Todos os dados desta liga serão excluídos.')) {
            await deleteLeague(id);
        }
    };

    const startEditing = (l: typeof leagues[0]) => {
        setEditingId(l.id); setEditName(l.name);
    };

    const saveEdit = async () => {
        if (editingId && editName.trim()) {
            // Select the league being edited so updateLeague targets it correctly
            selectLeague(editingId);
            // Give state time to update, then call update
            setTimeout(async () => {
                await updateLeague({ name: editName });
            }, 50);
        }
        setEditingId(null);
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg-dark)', padding: '16px',
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(109, 40, 217, 0.2), transparent 30%), radial-gradient(circle at 80% 30%, rgba(16, 185, 129, 0.15), transparent 30%)'
        }}>
            <div style={{ width: '100%', maxWidth: '600px', animation: 'fadeIn 0.5s ease', padding: '0 4px' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ background: 'var(--primary)', padding: '12px', borderRadius: '16px', boxShadow: '0 4px 20px var(--primary-glow)', display: 'flex', flexShrink: 0 }}>
                            <Trophy size={24} color="white" />
                        </div>
                        <div>
                            <h1 style={{ fontSize: 'clamp(1.4rem, 5vw, 1.75rem)', fontFamily: 'Outfit', fontWeight: 800 }}>Suas Ligas</h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>Olá, {user?.user_metadata?.name || user?.email}</p>
                        </div>
                    </div>
                    <button onClick={signOut} className="btn-outline" style={{ padding: '9px 14px', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.85rem' }}>
                        <LogOut size={15} /> Sair
                    </button>
                </div>

                {/* League List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                    {leagues.length === 0 ? (
                        <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <Trophy size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
                            <h3 style={{ marginBottom: '8px' }}>Nenhuma liga criada ainda</h3>
                            <p style={{ fontSize: '0.875rem' }}>Crie sua primeira liga abaixo!</p>
                        </div>
                    ) : (
                        leagues.map(l => (
                            <div key={l.id}
                                onClick={() => { if (editingId !== l.id) { selectLeague(l.id); navigate('/'); } }}
                                style={{
                                    padding: '18px 20px', borderRadius: '14px', cursor: 'pointer',
                                    background: league?.id === l.id ? 'rgba(109, 40, 217, 0.2)' : 'rgba(28, 28, 36, 0.6)',
                                    border: `1px solid ${league?.id === l.id ? 'var(--primary)' : 'var(--glass-border)'}`,
                                    display: 'flex', alignItems: 'center', gap: '14px',
                                    transition: 'all 0.2s', backdropFilter: 'blur(12px)',
                                    boxShadow: league?.id === l.id ? '0 4px 20px var(--primary-glow)' : 'none'
                                }}>
                                <TeamLogo src={l.logo} size={44} />
                                {editingId === l.id ? (
                                    <input value={editName} onChange={e => setEditName(e.target.value)}
                                        autoFocus onClick={e => e.stopPropagation()}
                                        style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--primary)', borderRadius: '8px', padding: '8px 12px', color: 'white', fontSize: '1rem', outline: 'none' }} />
                                ) : (
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 700, fontSize: '1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.name}</div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Clique para entrar</div>
                                    </div>
                                )}
                                {league?.id === l.id && editingId !== l.id && (
                                    <div style={{ background: 'var(--primary)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>ATIVA</div>
                                )}
                                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                                    {editingId === l.id ? (
                                        <>
                                            <button onClick={saveEdit} style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid var(--accent)', color: 'var(--accent)', padding: '6px', borderRadius: '8px', cursor: 'pointer', display: 'flex' }}><Check size={16} /></button>
                                            <button onClick={() => setEditingId(null)} style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-muted)', padding: '6px', borderRadius: '8px', cursor: 'pointer', display: 'flex' }}><X size={16} /></button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={(e) => { e.stopPropagation(); startEditing(l); }} className="action-icon-btn" title="Editar nome"><Edit2 size={15} /></button>
                                            <button onClick={(e) => { e.stopPropagation(); handleDelete(l.id); }} className="action-icon-btn danger" title="Excluir liga"><Trash2 size={15} /></button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Create League */}
                {showCreate ? (
                    <form onSubmit={handleCreate} className="glass-panel" style={{ padding: '24px', display: 'flex', gap: '12px' }}>
                        <input type="text" placeholder="Nome da liga (ex: Copa dos Campeões)" value={newName}
                            onChange={e => setNewName(e.target.value)} autoFocus required
                            style={{ flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '12px 16px', color: 'white', fontSize: '1rem', outline: 'none' }} />
                        <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '12px 20px', whiteSpace: 'nowrap' }}>
                            {loading ? '...' : 'Criar'}
                        </button>
                        <button type="button" onClick={() => setShowCreate(false)} className="btn-outline" style={{ padding: '12px 16px' }}>
                            <X size={18} />
                        </button>
                    </form>
                ) : (
                    <button onClick={() => setShowCreate(true)} className="btn-primary"
                        style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '1rem', gap: '10px' }}>
                        <Plus size={20} /> Nova Liga
                    </button>
                )}
            </div>
        </div>
    );
};

export default LeagueSelector;
