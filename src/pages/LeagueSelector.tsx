import { useState } from 'react';
import { useLeague } from '../context/LeagueContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Trophy, Plus, Trash2, LogOut, Edit2, Check, X, RefreshCw, User, Settings2 } from 'lucide-react';
import TeamLogo from '../components/TeamLogo';

const LeagueSelector = () => {
    const { leagues, league, createLeague, deleteLeague, selectLeague, updateLeague, loadLeagues } = useLeague();
    const { user, signOut } = useAuth();
    const [showCreate, setShowCreate] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [newName, setNewName] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza? Todos os dados desta liga serão excluídos permanentemente.')) {
            await deleteLeague(id);
        }
    };

    const startEditing = (l: any) => {
        setEditingId(l.id); setEditName(l.name);
    };

    const saveEdit = async () => {
        if (editingId && editName.trim()) {
            selectLeague(editingId);
            setTimeout(async () => {
                await updateLeague({ name: editName });
            }, 50);
        }
        setEditingId(null);
    };

    return (
        <div className="min-h-screen bg-bg-dark flex items-center justify-center p-4 md:p-8 overflow-hidden relative">
            {/* Animated Background Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/15 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />

            <div className="w-full max-w-2xl animate-fade-in relative z-10">
                {/* Header Card */}
                <div className="glass-panel p-6 md:p-8 mb-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-[#a855f7] flex items-center justify-center shadow-[0_8px_25px_rgba(109,40,217,0.4)] transform hover:rotate-6 transition-transform">
                            <Trophy size={32} className="text-white" />
                        </div>
                        <div className="text-center sm:text-left">
                            <h1 className="text-2xl md:text-3xl font-outfit font-black text-white uppercase tracking-tight leading-none mb-1">Suas Ligas</h1>
                            <div className="flex items-center gap-2 text-slate-500 font-bold text-[0.65rem] uppercase tracking-widest justify-center sm:justify-start">
                                <User size={12} className="text-primary" />
                                <span className="truncate max-w-[150px]">{user?.user_metadata?.name || user?.email}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button onClick={loadLeagues} className="p-3 rounded-xl bg-white/3 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-95" title="Recarregar">
                            <RefreshCw size={18} />
                        </button>
                        <button onClick={signOut} className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger hover:bg-danger hover:text-white transition-all active:scale-95 flex items-center gap-2 font-black text-[0.65rem] uppercase tracking-widest px-5">
                            <LogOut size={16} /> <span className="hidden sm:inline">Sair</span>
                        </button>
                    </div>
                </div>

                {/* League List */}
                <div className="space-y-4 mb-8">
                    {leagues.length === 0 ? (
                        <div className="glass-panel py-20 px-10 text-center space-y-6">
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                                <Trophy size={40} className="text-slate-700" strokeWidth={1} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-outfit font-black text-white uppercase tracking-widest">Nenhuma liga encontrada</h3>
                                <p className="text-slate-500 font-medium text-sm">Comece sua jornada criando uma liga agora mesmo!</p>
                            </div>
                        </div>
                    ) : (
                        leagues.map(l => (
                            <div key={l.id}
                                onClick={() => { if (editingId !== l.id) { selectLeague(l.id); navigate('/'); } }}
                                className={`group p-5 rounded-2xl border transition-all duration-500 flex items-center gap-5 cursor-pointer relative overflow-hidden backdrop-blur-xl ${league?.id === l.id
                                    ? 'bg-primary/10 border-primary/30 shadow-[0_8px_30px_rgba(109,40,217,0.15)] ring-1 ring-primary/20'
                                    : 'bg-white/3 border-white/5 hover:bg-white/6 hover:border-white/10'
                                    }`}>
                                {league?.id === l.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}

                                <div className="relative flex-none">
                                    <TeamLogo src={l.logo} size={56} />
                                    {league?.id === l.id && (
                                        <div className="absolute -bottom-1 -right-1 bg-primary text-white w-5 h-5 rounded-full flex items-center justify-center shadow-lg border-2 border-bg-dark animate-bounce">
                                            <Check size={12} strokeWidth={4} />
                                        </div>
                                    )}
                                </div>

                                {editingId === l.id ? (
                                    <div className="flex-1 flex gap-2" onClick={e => e.stopPropagation()}>
                                        <input
                                            value={editName} onChange={e => setEditName(e.target.value)}
                                            autoFocus className="flex-1 bg-black/40 border border-primary/50 rounded-xl px-4 py-3 text-white font-bold outline-none ring-2 ring-primary/20"
                                        />
                                        <button onClick={saveEdit} className="p-3 bg-accent text-white rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all outline-none">
                                            <Check size={20} strokeWidth={3} />
                                        </button>
                                        <button onClick={() => setEditingId(null)} className="p-3 border border-white/10 text-slate-500 rounded-xl hover:bg-white/5 transition-all outline-none">
                                            <X size={20} strokeWidth={3} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="font-outfit font-black text-white text-lg uppercase tracking-wide truncate max-w-[250px] leading-tight transition-transform group-hover:translate-x-1 duration-300">
                                                {l.name}
                                            </span>
                                            {league?.id === l.id && <span className="bg-primary/20 text-primary text-[0.55rem] font-black px-2 py-0.5 rounded tracking-widest leading-none border border-primary/20">ATIVA</span>}
                                        </div>
                                        <div className="flex items-center gap-2 text-[0.6rem] font-bold text-slate-500 uppercase tracking-widest group-hover:text-primary transition-colors">
                                            Clique para gerenciar <Settings2 size={10} strokeWidth={3} />
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                                    {editingId !== l.id && (
                                        <>
                                            <button onClick={() => startEditing(l)} className="p-3 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all outline-none" title="Editar">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(l.id)} className="p-3 rounded-xl bg-danger/10 text-danger hover:bg-danger hover:text-white transition-all outline-none" title="Excluir">
                                                <Trash2 size={16} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer Action Area */}
                <div className="space-y-4">
                    {showCreate ? (
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            if (!newName.trim()) return;
                            setLoading(true);
                            const res = await createLeague({
                                name: newName, logo: '', maxTeams: 16,
                                pointsForWin: 3, pointsForDraw: 1, pointsForLoss: 0,
                                defaultHalfLength: 45, playersPerTeam: 5, reserveLimitPerTeam: 5
                            });
                            if (!res.error) {
                                setNewName(''); setShowCreate(false); navigate('/');
                            }
                            setLoading(false);
                        }} className="glass-panel p-6 animate-slide-up border-t-2 border-t-accent shadow-[0_20px_50px_rgba(0,0,0,0.4)] relative">
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[0.65rem] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Crie sua nova liga</label>
                                    <div className="flex gap-2">
                                        <input type="text" placeholder="Ex: Premier League 2026" value={newName}
                                            onChange={e => setNewName(e.target.value)} autoFocus required
                                            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white font-bold text-lg outline-none focus:border-accent transition-all placeholder:text-slate-700"
                                        />
                                        <button type="submit" disabled={loading} className="px-8 bg-accent text-white font-black rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all text-[0.7rem] uppercase tracking-widest disabled:opacity-50">
                                            {loading ? '...' : 'Criar Liga'}
                                        </button>
                                        <button type="button" onClick={() => setShowCreate(false)} className="p-4 border border-white/5 text-slate-500 rounded-xl hover:bg-white/5 transition-all outline-none">
                                            <X size={20} strokeWidth={3} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    ) : (
                        <button onClick={() => setShowCreate(true)}
                            className="w-full h-16 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center gap-4 text-white hover:bg-primary hover:border-primary hover:shadow-[0_8px_25px_rgba(109,40,217,0.3)] transition-all group active:scale-[0.99] group overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Plus size={24} strokeWidth={3} className="text-slate-500 group-hover:text-white transition-colors relative z-10" />
                            <span className="font-outfit font-black uppercase text-sm tracking-[0.2em] text-slate-400 group-hover:text-white transition-colors relative z-10">Fundar Nova Liga</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LeagueSelector;
