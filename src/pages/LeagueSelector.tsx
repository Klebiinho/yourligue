import { useState, useEffect } from 'react';
import { useLeague } from '../context/LeagueContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Trophy, Plus, Trash2, LogOut, Edit2, Check, X, RefreshCw, User, Settings2, Search, Eye, Bell, Shield } from 'lucide-react';
import TeamLogo from '../components/TeamLogo';

const LeagueSelector = () => {
    const { leagues, followedLeagues, league, createLeague, deleteLeague, selectLeague, updateLeague, loadLeagues, searchLeagues, followLeague, unfollowLeague, loadPublicLeague } = useLeague();
    const { user, signOut } = useAuth();
    const [activeTab, setActiveTab] = useState<'owned' | 'following' | 'explore'>('owned');
    const [showCreate, setShowCreate] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [newName, setNewName] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (activeTab === 'explore') {
            const delayDebounceFn = setTimeout(async () => {
                setSearching(true);
                const results = await searchLeagues(searchQuery);
                setSearchResults(results);
                setSearching(false);
            }, searchQuery.length > 0 ? 500 : 0);
            return () => clearTimeout(delayDebounceFn);
        }
    }, [searchQuery, activeTab]);

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

    const handleViewLeague = async (l: any) => {
        const success = await loadPublicLeague(l.slug || l.id);
        if (success) navigate(`/view/${l.slug || l.id}`);
    };

    return (
        <div className="min-h-screen bg-bg-dark flex items-center justify-center p-4 md:p-8 overflow-hidden relative">
            {/* Animated Background Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/15 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />

            <div className="w-full max-w-2xl animate-fade-in relative z-10">
                {/* Header Card */}
                <div className="glass-panel p-6 md:p-8 mb-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Trophy size={120} strokeWidth={1} />
                    </div>
                    <div className="flex items-center gap-5 relative z-10">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-[#a855f7] flex items-center justify-center shadow-[0_8px_25px_rgba(109,40,217,0.4)] transform hover:rotate-6 transition-transform">
                            <Shield size={32} className="text-white" />
                        </div>
                        <div className="text-center sm:text-left">
                            <h1 className="text-2xl md:text-3xl font-outfit font-black text-white uppercase tracking-tight leading-none mb-1">Central de Ligas</h1>
                            <div className="flex items-center gap-2 text-slate-500 font-bold text-[0.65rem] uppercase tracking-widest justify-center sm:justify-start">
                                <User size={12} className="text-primary" />
                                <span className="truncate max-w-[150px]">{user?.user_metadata?.name || user?.email}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 relative z-10">
                        <button onClick={loadLeagues} className="p-3 rounded-xl bg-white/3 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-95" title="Recarregar">
                            <RefreshCw size={18} />
                        </button>
                        <button onClick={() => { signOut(); navigate('/'); }} className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger hover:bg-danger hover:text-white transition-all active:scale-95 flex items-center gap-2 font-black text-[0.65rem] uppercase tracking-widest px-5">
                            <LogOut size={16} /> <span className="hidden sm:inline">Sair</span>
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex bg-white/3 p-1.5 rounded-2xl mb-6 border border-white/5">
                    <button
                        onClick={() => setActiveTab('owned')}
                        className={`flex-1 py-3 px-4 rounded-xl font-black text-[0.65rem] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'owned' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                    >
                        <Shield size={14} /> Minhas Ligas
                    </button>
                    <button
                        onClick={() => setActiveTab('following')}
                        className={`flex-1 py-3 px-4 rounded-xl font-black text-[0.65rem] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'following' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                    >
                        <Bell size={14} /> Seguindo
                    </button>
                    <button
                        onClick={() => setActiveTab('explore')}
                        className={`flex-1 py-3 px-4 rounded-xl font-black text-[0.65rem] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'explore' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                    >
                        <Search size={14} /> Explorar
                    </button>
                </div>

                {/* Explorer Search */}
                {activeTab === 'explore' && (
                    <div className="mb-6 animate-slide-up">
                        <div className="relative group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar por nome da liga..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full bg-white/3 border border-white/5 rounded-2xl pl-14 pr-5 py-5 text-white font-bold outline-none focus:border-primary/50 focus:bg-white/5 transition-all placeholder:text-slate-700"
                            />
                        </div>
                    </div>
                )}

                {/* League List Render Context */}
                <div className="space-y-4 mb-8 min-h-[300px]">
                    {activeTab === 'owned' && (
                        leagues.length === 0 ? (
                            <div className="glass-panel py-20 px-10 text-center space-y-6">
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                                    <Trophy size={40} className="text-slate-700" strokeWidth={1} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-outfit font-black text-white uppercase tracking-widest">Nenhuma liga encontrada</h3>
                                    <p className="text-slate-500 font-medium text-sm">Você ainda não criou nenhuma liga.</p>
                                </div>
                            </div>
                        ) : (
                            leagues.map(l => (
                                <LeagueItem
                                    key={l.id} league={l} currentLeagueId={league?.id}
                                    onSelect={() => { if (editingId !== l.id) { selectLeague(l.id); navigate('/'); } }}
                                    isEditing={editingId === l.id}
                                    editName={editName}
                                    onEditNameChange={(val: string) => setEditName(val)}
                                    onSaveEdit={saveEdit}
                                    onCancelEdit={() => setEditingId(null)}
                                    onStartEdit={() => startEditing(l)}
                                    onDelete={() => handleDelete(l.id)}
                                    type="owned"
                                />
                            ))
                        )
                    )}

                    {activeTab === 'following' && (
                        followedLeagues.length === 0 ? (
                            <div className="glass-panel py-20 px-10 text-center space-y-6">
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                                    <Bell size={40} className="text-slate-700" strokeWidth={1} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-outfit font-black text-white uppercase tracking-widest">Nenhuma liga seguida</h3>
                                    <p className="text-slate-500 font-medium text-sm">Procure ligas na aba Explorar para acompanhar.</p>
                                </div>
                            </div>
                        ) : (
                            followedLeagues.map(l => (
                                <LeagueItem
                                    key={l.id} league={l}
                                    onSelect={() => handleViewLeague(l)}
                                    onUnfollow={() => unfollowLeague(l.id)}
                                    type="following"
                                />
                            ))
                        )
                    )}

                    {activeTab === 'explore' && (
                        searching ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                                <p className="text-slate-500 font-black text-[0.65rem] uppercase tracking-widest">Buscando...</p>
                            </div>
                        ) : searchResults.length === 0 ? (
                            <div className="glass-panel py-20 px-10 text-center space-y-6">
                                <p className="text-slate-500 font-medium text-sm">Nenhuma liga encontrada {searchQuery ? `para "${searchQuery}"` : ''}</p>
                            </div>
                        ) : (
                            searchResults.map(l => (
                                <LeagueItem
                                    key={l.id} league={l}
                                    onSelect={() => handleViewLeague(l)}
                                    onFollow={() => followLeague(l.id)}
                                    onUnfollow={() => unfollowLeague(l.id)}
                                    isFollowed={followedLeagues.some(f => f.id === l.id)}
                                    isOwned={leagues.some(o => o.id === l.id)}
                                    type="explore"
                                />
                            ))
                        )
                    )}
                </div>

                {/* Footer Action Area - Only for "Owned" tab */}
                {activeTab === 'owned' && (
                    <div className="space-y-4">
                        {showCreate ? (
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                if (!newName.trim()) return;
                                setLoading(true);
                                const res = await createLeague({
                                    name: newName, logo: '', maxTeams: 16,
                                    pointsForWin: 3, pointsForDraw: 1, pointsForLoss: 0,
                                    defaultHalfLength: 45, playersPerTeam: 5, reserveLimitPerTeam: 5,
                                    substitutionsLimit: 5,
                                    allowSubstitutionReturn: true,
                                    hasOvertime: true,
                                    overtimeHalfLength: 15
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
                )}
            </div>
        </div>
    );
};

// Helper Component for League Item
const LeagueItem = ({
    league, currentLeagueId, onSelect,
    isEditing, editName, onEditNameChange, onSaveEdit, onCancelEdit,
    onStartEdit, onDelete, onFollow, onUnfollow,
    isFollowed, isOwned, type
}: any) => {
    return (
        <div onClick={onSelect}
            className={`group p-5 rounded-2xl border transition-all duration-500 flex items-center gap-5 cursor-pointer relative overflow-hidden backdrop-blur-xl ${currentLeagueId === league.id
                ? 'bg-primary/10 border-primary/30 shadow-[0_8px_30px_rgba(109,40,217,0.15)]'
                : 'bg-white/3 border-white/5 hover:bg-white/6 hover:border-white/10'
                }`}>
            {currentLeagueId === league.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}

            <div className="relative flex-none">
                <TeamLogo src={league.logo} size={56} />
                {currentLeagueId === league.id && (
                    <div className="absolute -bottom-1 -right-1 bg-primary text-white w-5 h-5 rounded-full flex items-center justify-center shadow-lg border-2 border-bg-dark animate-bounce">
                        <Check size={12} strokeWidth={4} />
                    </div>
                )}
            </div>

            {isEditing ? (
                <div className="flex-1 flex gap-2" onClick={e => e.stopPropagation()}>
                    <input
                        value={editName} onChange={e => onEditNameChange(e.target.value)}
                        autoFocus className="flex-1 bg-black/40 border border-primary/50 rounded-xl px-4 py-3 text-white font-bold outline-none ring-2 ring-primary/20"
                    />
                    <button onClick={onSaveEdit} className="p-3 bg-accent text-white rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all outline-none">
                        <Check size={20} strokeWidth={3} />
                    </button>
                    <button onClick={onCancelEdit} className="p-3 border border-white/10 text-slate-500 rounded-xl hover:bg-white/5 transition-all outline-none">
                        <X size={20} strokeWidth={3} />
                    </button>
                </div>
            ) : (
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-outfit font-black text-white text-lg uppercase tracking-wide truncate max-w-[250px] leading-tight transition-transform group-hover:translate-x-1 duration-300">
                            {league.name}
                        </span>
                        {type === 'owned' && currentLeagueId === league.id && <span className="bg-primary/20 text-primary text-[0.55rem] font-black px-2 py-0.5 rounded tracking-widest leading-none border border-primary/20">ATIVA</span>}
                        {isOwned && type !== 'owned' && <span className="bg-primary/20 text-primary text-[0.55rem] font-black px-2 py-0.5 rounded tracking-widest leading-none border border-primary/20">MINHA</span>}
                    </div>
                    <div className="flex items-center gap-3 text-[0.6rem] font-bold uppercase tracking-widest transition-colors">
                        <span className="text-slate-500 group-hover:text-primary">
                            {type === 'owned' ? 'Clique para gerenciar' : 'Clique para visualizar'}
                        </span>
                        {league.follower_count?.[0]?.count !== undefined && (
                            <span className="flex items-center gap-1 text-slate-600 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                                <Bell size={10} className="text-primary" /> {league.follower_count[0].count}
                            </span>
                        )}
                        <Settings2 size={10} strokeWidth={3} className="text-slate-500 group-hover:text-primary" />
                    </div>
                </div>
            )}

            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                {!isEditing && (
                    <>
                        {type === 'owned' && (
                            <>
                                <button onClick={onStartEdit} className="p-3 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all outline-none">
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={onDelete} className="p-3 rounded-xl bg-danger/10 text-danger hover:bg-danger hover:text-white transition-all outline-none">
                                    <Trash2 size={16} />
                                </button>
                            </>
                        )}
                        {type === 'following' && (
                            <>
                                <button onClick={onSelect} className="p-3 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all outline-none" title="Visualizar">
                                    <Eye size={16} />
                                </button>
                                <button onClick={onUnfollow} className="p-3 rounded-xl bg-danger/10 text-danger hover:bg-danger hover:text-white transition-all outline-none" title="Parar de Acompanhar">
                                    <Bell size={16} />
                                </button>
                            </>
                        )}
                        {type === 'explore' && (
                            <>
                                <button onClick={onSelect} className="p-3 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all outline-none" title="Visualizar">
                                    <Eye size={16} />
                                </button>
                                {isFollowed ? (
                                    <button onClick={onUnfollow} className="p-3 rounded-xl bg-danger/10 text-danger hover:bg-danger hover:text-white transition-all outline-none" title="Parar de Acompanhar">
                                        <Bell size={16} />
                                    </button>
                                ) : (
                                    !isOwned && (
                                        <button onClick={onFollow} className="p-3 rounded-xl bg-accent/10 text-accent hover:bg-accent hover:text-white transition-all outline-none" title="Acompanhar">
                                            <Bell size={16} />
                                        </button>
                                    )
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default LeagueSelector;
