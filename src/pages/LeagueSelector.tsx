import { useState } from 'react';
import { useLeague } from '../context/LeagueContext';
import { useAuth } from '../context/AuthContext';
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
            await updateLeague({ name: editName });
        }
        setEditingId(null);
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg-dark)', padding: '16px',
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(109, 40, 217, 0.2), transparent 30%), radial-gradient(circle at 80% 30%, rgba(16, 185, 129, 0.15), transparent 30%)'
        }}>
            <div style={{ width: '100%', maxWidth: '600px', animation: 'fadeIn 0.5s ease' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ background: 'var(--primary)', padding: '12px', borderRadius: '16px', boxShadow: '0 4px 20px var(--primary-glow)', display: 'flex' }}>
                            <Trophy size={28} color="white" />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '1.75rem', fontFamily: 'Outfit', fontWeight: 800 }}>Suas Ligas</h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Olá, {user?.user_metadata?.name || user?.email}</p>
                        </div>
                    </div>
                    <button onClick={signOut} className="btn-outline" style={{ padding: '10px', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.875rem' }}>
                        <LogOut size={16} /> Sair
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
                                onClick={() => { if (editingId !== l.id) { selectLeague(l.id); } }}
                                style={{
                                    padding: '20px 24px', borderRadius: '16px', cursor: 'pointer',
                                    background: league?.id === l.id ? 'rgba(109, 40, 217, 0.2)' : 'rgba(28, 28, 36, 0.6)',
                                    border: `1px solid ${league?.id === l.id ? 'var(--primary)' : 'var(--glass-border)'}`,
                                    display: 'flex', alignItems: 'center', gap: '16px',
                                    transition: 'all 0.2s', backdropFilter: 'blur(12px)',
                                    boxShadow: league?.id === l.id ? '0 4px 20px var(--primary-glow)' : 'none'
                                }}>
                                <TeamLogo src={l.logo} size={48} />
                                {editingId === l.id ? (
                                    <input value={editName} onChange={e => setEditName(e.target.value)}
                                        autoFocus onClick={e => e.stopPropagation()}
                                        style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--primary)', borderRadius: '8px', padding: '8px 12px', color: 'white', fontSize: '1rem' }} />
                                ) : (
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{l.name}</div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Clique para entrar</div>
                                    </div>
                                )}
                                {league?.id === l.id && editingId !== l.id && (
                                    <div style={{ background: 'var(--primary)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700 }}>ATIVA</div>
                                )}
                                <div style={{ display: 'flex', gap: '8px' }} onClick={e => e.stopPropagation()}>
                                    {editingId === l.id ? (
                                        <>
                                            <button onClick={saveEdit} style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid var(--accent)', color: 'var(--accent)', padding: '6px', borderRadius: '8px', cursor: 'pointer', display: 'flex' }}><Check size={16} /></button>
                                            <button onClick={() => setEditingId(null)} style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-muted)', padding: '6px', borderRadius: '8px', cursor: 'pointer', display: 'flex' }}><X size={16} /></button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => { selectLeague(l.id); startEditing(l); }} className="action-icon-btn" title="Editar nome"><Edit2 size={16} /></button>
                                            <button onClick={() => handleDelete(l.id)} className="action-icon-btn danger" title="Excluir liga"><Trash2 size={16} /></button>
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
