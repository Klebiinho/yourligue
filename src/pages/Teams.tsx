import { useState } from 'react';
import { useLeague } from '../context/LeagueContext';
import { Shield, UserPlus, Image as ImageIcon, Crown, Trash2, Edit2, Check, X, AlertCircle, Users, Upload, Plus, TrendingUp, Heart, Star, Swords as RivalIcon } from 'lucide-react';
import TeamLogo from '../components/TeamLogo';

const Teams = () => {
    const { league, teams, addTeam, addPlayer, removePlayer, updatePlayer, toggleCaptain, isPublicView, interactWithTeam, userInteractions } = useLeague();
    const [activeTeamId, setActiveTeamId] = useState<string | null>(teams[0]?.id ?? null);
    const [newTeamName, setNewTeamName] = useState('');
    const [newTeamLogo, setNewTeamLogo] = useState('');
    const [newPlayerName, setNewPlayerName] = useState('');
    const [newPlayerNumber, setNewPlayerNumber] = useState('');
    const [newPlayerPos, setNewPlayerPos] = useState('Atacante');
    const [newPlayerPhoto, setNewPlayerPhoto] = useState('');
    const [newPlayerIsReserve, setNewPlayerIsReserve] = useState(false);
    const [error, setError] = useState('');
    const [teamError, setTeamError] = useState('');
    const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editNumber, setEditNumber] = useState('');
    const [editPos, setEditPos] = useState('');
    const [editPhoto, setEditPhoto] = useState('');
    const [editIsReserve, setEditIsReserve] = useState(false);

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
        const added = teams[teams.length - 1];
        if (added) setActiveTeamId(added.id);
    };

    const handleAddPlayer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPlayerName || !newPlayerNumber || !activeTeamId) return;
        setError('');
        const { error } = await addPlayer(activeTeamId, {
            name: newPlayerName, number: parseInt(newPlayerNumber),
            position: newPlayerPos, photo: newPlayerPhoto, isReserve: newPlayerIsReserve
        });
        if (error) { setError(error); return; }
        setNewPlayerName(''); setNewPlayerNumber(''); setNewPlayerPhoto(''); setNewPlayerIsReserve(false);
    };

    const startEdit = (p: any) => {
        setEditingPlayerId(p.id); setEditName(p.name);
        setEditNumber(String(p.number)); setEditPos(p.position); setEditPhoto(p.photo || '');
        setEditIsReserve(p.isReserve || false);
    };

    const saveEdit = async () => {
        if (!editingPlayerId || !activeTeamId) return;
        await updatePlayer(activeTeamId, editingPlayerId, {
            name: editName, number: parseInt(editNumber), position: editPos, photo: editPhoto,
            isReserve: editIsReserve
        });
        setEditingPlayerId(null);
    };

    return (
        <div className="animate-fade-in">
            <header className="mb-6 md:mb-8">
                <h1 className="text-xl sm:text-2xl md:text-4xl font-outfit font-extrabold tracking-tight mb-1 uppercase flex items-center gap-2.5">
                    <Shield size={26} className="text-primary flex-none" strokeWidth={2.5} />
                    Times & Elencos
                </h1>
                <p className="text-slate-400 text-xs sm:text-sm">
                    Liga <span className="text-white font-bold">{league?.name}</span>
                </p>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 md:gap-8 items-start">
                {/* ── LEFT: Cadastro + Seleção ─────────────────────────── */}
                <section className="xl:col-span-4 space-y-4">
                    {/* New Team Form (Hidden in Public View) */}
                    {!isPublicView && (
                        <div className="glass-panel p-4 sm:p-6">
                            <h2 className="text-sm font-black text-white font-outfit uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Plus size={16} className="text-accent" /> Novo Clube
                            </h2>
                            <form onSubmit={handleAddTeam} className="space-y-3">
                                <div className="space-y-1.5">
                                    <label className="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest">Nome da Equipe</label>
                                    <input type="text" placeholder="Ex: Galáticos FC" value={newTeamName} onChange={e => setNewTeamName(e.target.value)} required
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none transition-all font-bold placeholder:text-slate-700"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest">Escudo / Logo</label>
                                    <label className="flex items-center justify-center gap-2 w-full h-12 bg-white/5 border border-dashed border-white/10 rounded-xl cursor-pointer hover:bg-white/[0.08] hover:border-primary/40 transition-all group">
                                        <Upload size={16} className="text-slate-600 group-hover:text-primary transition-colors flex-none" />
                                        <span className="text-[0.65rem] font-black text-slate-600 group-hover:text-white uppercase tracking-widest leading-none">
                                            {newTeamLogo ? '✓ Carregado' : 'Fazer Upload'}
                                        </span>
                                        <input type="file" accept="image/*" onChange={e => handleFile(e, setNewTeamLogo)} className="hidden" />
                                    </label>
                                    {newTeamLogo && (
                                        <div className="flex items-center gap-3 p-3 bg-black/30 rounded-xl border border-white/5">
                                            <TeamLogo src={newTeamLogo} size={44} />
                                            <span className="text-xs font-bold text-slate-400 flex-1">Preview do escudo</span>
                                            <button type="button" onClick={() => setNewTeamLogo('')} className="p-1.5 bg-danger/20 text-danger rounded-lg hover:bg-danger hover:text-white transition-all">
                                                <X size={12} strokeWidth={3} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {teamError && <ErrorMsg msg={teamError} />}

                                <button type="submit" className="w-full bg-primary text-white font-black py-3 rounded-xl shadow-[0_4px_20px_rgba(109,40,217,0.3)] hover:brightness-110 active:scale-[0.98] transition-all uppercase tracking-widest text-[0.65rem] flex items-center justify-center gap-2">
                                    <Shield size={15} fill="currentColor" /> Cadastrar Clube
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Club List */}
                    <div className="glass-panel p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[0.6rem] font-black text-slate-500 uppercase tracking-[0.15em]">
                                Clubes {teams.length}/{league?.maxTeams}
                            </h3>
                        </div>
                        <div className="space-y-2 max-h-[300px] sm:max-h-[400px] overflow-y-auto no-scrollbar">
                            {teams.length === 0 ? (
                                <p className="text-center py-8 text-[0.65rem] font-black text-slate-600 uppercase tracking-widest opacity-50">Nenhum clube cadastrado</p>
                            ) : (
                                teams.map(team => (
                                    <div key={team.id} onClick={() => setActiveTeamId(team.id)}
                                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 border ${activeTeamId === team.id
                                            ? 'bg-primary/10 border-primary/25 shadow-sm'
                                            : 'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.05]'
                                            }`}>
                                        <TeamLogo src={team.logo} size={36} />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-outfit font-black text-white uppercase text-xs sm:text-sm truncate tracking-wide leading-tight">{team.name}</h4>
                                            <p className="text-[0.55rem] font-black text-slate-600 uppercase tracking-widest mt-0.5">{team.players.length} Atletas</p>
                                        </div>
                                        {activeTeamId === team.id && <Check size={14} className="text-primary flex-none" />}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </section>

                {/* ── RIGHT: Elenco ───────────────────────────────────── */}
                <section className="xl:col-span-8">
                    {currentTeam ? (
                        <div className="glass-panel overflow-hidden">
                            {/* Team Hero */}
                            <div className="p-4 sm:p-6 bg-gradient-to-r from-primary/10 to-transparent border-b border-white/[0.05]">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="relative group flex-none">
                                            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <TeamLogo src={currentTeam.logo} size={64} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h2 className="font-outfit font-black text-white uppercase text-lg sm:text-2xl md:text-3xl tracking-tight leading-none truncate">{currentTeam.name}</h2>
                                            <div className="flex items-center gap-4 mt-2">
                                                <div className="flex items-center gap-1.5 text-[0.6rem] font-black text-slate-500 uppercase tracking-widest">
                                                    <Users size={12} className="text-primary" /> {currentTeam.players.length} Jogadores
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[0.6rem] font-black text-slate-500 uppercase tracking-widest">
                                                    <Check size={12} className="text-accent" /> Ativo
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Interaction Buttons (Spectator Mode or Personal Interaction) */}
                                    <div className="flex items-center gap-2 pt-2 sm:pt-0">
                                        {[
                                            { type: 'supporting', icon: Heart, label: 'Torcer', activeColor: 'text-danger bg-danger/10 border-danger/30' },
                                            { type: 'favorite', icon: Star, label: 'Favoritar', activeColor: 'text-warning bg-warning/10 border-warning/30' },
                                            { type: 'rival', icon: RivalIcon, label: 'Rival', activeColor: 'text-primary bg-primary/10 border-primary/30' },
                                        ].map(btn => {
                                            const isActive = userInteractions.some(i => i.teamId === currentTeam.id && i.interactionType === btn.type);
                                            const activeIndicator = btn.type === 'supporting' ? 'fill-danger' : btn.type === 'favorite' ? 'fill-warning' : 'fill-primary';

                                            return (
                                                <button
                                                    key={btn.type}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        interactWithTeam(currentTeam.id, btn.type as any);
                                                    }}
                                                    className={`flex flex-col items-center justify-center gap-1.5 px-3 py-2 rounded-2xl border transition-all duration-300 min-w-[70px] sm:min-w-[80px] ${isActive
                                                        ? btn.activeColor
                                                        : 'bg-white/5 border-white/10 text-slate-500 hover:bg-white/10 hover:text-white hover:border-white/20'}`}
                                                >
                                                    <btn.icon size={18} className={isActive ? `${activeIndicator} text-current` : ''} strokeWidth={isActive ? 2.5 : 2} />
                                                    <span className="text-[0.5rem] font-black uppercase tracking-widest">{btn.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Add Player Form (Hidden in Public View) */}
                            {!isPublicView && (
                                <div className="p-4 sm:p-6 border-b border-white/[0.05]">
                                    <h3 className="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <UserPlus size={13} className="text-accent" /> Inscrever Novo Atleta
                                    </h3>
                                    <form onSubmit={handleAddPlayer} className="space-y-3">
                                        {/* Row 1: Nome + Nº + Posição */}
                                        <div className="grid grid-cols-2 sm:grid-cols-12 gap-2 sm:gap-3">
                                            <div className="col-span-2 sm:col-span-5 space-y-1">
                                                <label className="text-[0.55rem] font-black text-slate-600 uppercase tracking-widest">Nome</label>
                                                <input type="text" placeholder="Cristiano Ronaldo" value={newPlayerName} onChange={e => setNewPlayerName(e.target.value)} required
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-accent outline-none transition-all font-bold placeholder:text-slate-700" />
                                            </div>
                                            <div className="sm:col-span-2 space-y-1">
                                                <label className="text-[0.55rem] font-black text-slate-600 uppercase tracking-widest">Nº</label>
                                                <input type="number" placeholder="10" value={newPlayerNumber} onChange={e => setNewPlayerNumber(e.target.value)} required min={1} max={99}
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm font-black text-center focus:border-accent outline-none transition-all" />
                                            </div>
                                            <div className="sm:col-span-3 space-y-1">
                                                <label className="text-[0.55rem] font-black text-slate-600 uppercase tracking-widest">Posição</label>
                                                <select value={newPlayerPos} onChange={e => setNewPlayerPos(e.target.value)}
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm font-bold outline-none cursor-pointer appearance-none h-[42px]">
                                                    <option className="bg-[#07070a]">Goleiro</option>
                                                    <option className="bg-[#07070a]">Zagueiro</option>
                                                    <option className="bg-[#07070a]">Lateral</option>
                                                    <option className="bg-[#07070a]">Meio-campo</option>
                                                    <option className="bg-[#07070a]">Atacante</option>
                                                </select>
                                            </div>
                                            <div className="sm:col-span-2 space-y-1">
                                                <label className="text-[0.55rem] font-black text-slate-600 uppercase tracking-widest">Foto</label>
                                                <label className="flex items-center justify-center bg-black/40 border border-white/10 h-[42px] rounded-xl cursor-pointer hover:bg-white/10 transition-all text-slate-500 hover:text-white">
                                                    {newPlayerPhoto ? <Check size={18} className="text-accent" /> : <ImageIcon size={18} />}
                                                    <input type="file" accept="image/*" onChange={e => handleFile(e, setNewPlayerPhoto)} className="hidden" />
                                                </label>
                                            </div>
                                        </div>

                                        {error && <ErrorMsg msg={error} />}

                                        <div className="flex flex-wrap items-end gap-3 px-1">
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <div onClick={() => setNewPlayerIsReserve(!newPlayerIsReserve)}
                                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border ${newPlayerIsReserve ? 'bg-warning/20 border-warning text-warning' : 'bg-white/5 border-white/10 text-slate-500'}`}>
                                                    <TrendingUp size={18} className={newPlayerIsReserve ? '' : 'opacity-50'} />
                                                </div>
                                                <div className="flex flex-col" onClick={() => setNewPlayerIsReserve(!newPlayerIsReserve)}>
                                                    <span className="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Status</span>
                                                    <span className={`text-[0.7rem] font-black uppercase tracking-widest ${newPlayerIsReserve ? 'text-warning' : 'text-slate-400'}`}>
                                                        {newPlayerIsReserve ? 'Reserva' : 'Titular'}
                                                    </span>
                                                </div>
                                            </label>

                                            <button type="submit" className="flex-1 min-w-[150px] bg-accent text-white font-black h-[42px] rounded-xl shadow-lg hover:brightness-110 active:scale-[0.99] transition-all uppercase tracking-widest text-[0.65rem] flex items-center justify-center gap-2">
                                                <UserPlus size={15} strokeWidth={3} /> Confirmar Inscrição
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* ── Elenco ──────────────────────────────── */}
                            <div className="p-4 sm:p-6">
                                <h3 className="text-[0.6rem] font-black text-slate-500 uppercase tracking-[0.15em] mb-4 flex items-center justify-between">
                                    <span className="flex items-center gap-1.5"><Users size={12} className="text-primary" /> Elenco: {currentTeam.players.length} atletas</span>
                                </h3>

                                {currentTeam.players.length === 0 ? (
                                    <div className="text-center py-12 opacity-25 flex flex-col items-center gap-3">
                                        <Users size={48} strokeWidth={1} />
                                        <span className="text-[0.6rem] font-black uppercase tracking-widest">O elenco está vazio</span>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {currentTeam.players.map(player => (
                                            <div key={player.id} className="group rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] transition-all overflow-hidden">
                                                {editingPlayerId === player.id ? (
                                                    /* ── EDIT MODE (mobile-first grid) ─── */
                                                    <div className="p-3 sm:p-4 space-y-2" onClick={e => e.stopPropagation()}>
                                                        <p className="text-[0.55rem] font-black text-primary uppercase tracking-widest mb-2">Editando: {player.name}</p>
                                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                            <input value={editName} onChange={e => setEditName(e.target.value)}
                                                                className="col-span-2 bg-black/40 border border-primary/40 rounded-xl px-3 py-2.5 text-white text-sm font-bold outline-none w-full"
                                                                placeholder="Nome" />
                                                            <input type="number" value={editNumber} onChange={e => setEditNumber(e.target.value)}
                                                                className="bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm font-black text-center outline-none" />
                                                            <div onClick={() => setEditIsReserve(!editIsReserve)}
                                                                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${editIsReserve ? 'bg-warning/20 border-warning text-warning' : 'bg-white/5 border-white/10 text-slate-500'}`}>
                                                                <span className="text-[0.65rem] font-black uppercase">{editIsReserve ? 'Reserva' : 'Titular'}</span>
                                                            </div>
                                                            <select value={editPos} onChange={e => setEditPos(e.target.value)}
                                                                className="bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs font-bold outline-none h-[42px] appearance-none">
                                                                <option>Goleiro</option><option>Zagueiro</option><option>Lateral</option>
                                                                <option>Meio-campo</option><option>Atacante</option>
                                                            </select>
                                                        </div>
                                                        <div className="flex gap-2 pt-1">
                                                            <button onClick={saveEdit} className="flex-1 flex items-center justify-center gap-2 bg-accent text-white py-2.5 rounded-xl font-black text-[0.65rem] uppercase tracking-widest hover:brightness-110 transition-all">
                                                                <Check size={14} strokeWidth={3} /> Salvar
                                                            </button>
                                                            <button onClick={() => setEditingPlayerId(null)} className="px-4 bg-white/5 border border-white/10 text-slate-500 rounded-xl font-black text-[0.65rem] uppercase hover:bg-white/10 transition-all">
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    /* ── VIEW MODE ─── */
                                                    <div className="flex items-center gap-3 p-3 sm:p-4">
                                                        <div className="relative flex-none">
                                                            <TeamLogo src={player.photo} size={40} />
                                                            {player.isCaptain && (
                                                                <div className="absolute -top-1 -right-1 bg-warning text-black w-4 h-4 rounded-full flex items-center justify-center border border-[#07070a]">
                                                                    <Crown size={9} fill="currentColor" strokeWidth={2} />
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-0.5">
                                                                <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-black/30 font-black font-outfit text-white border border-white/5 text-[0.65rem] flex-none">
                                                                    {player.number}
                                                                </span>
                                                                <h4 className="font-outfit font-black text-white uppercase text-xs sm:text-sm tracking-wide truncate">{player.name}</h4>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className={`text-[0.55rem] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${player.isReserve ? 'text-warning bg-warning/10 border-warning/20' : 'text-accent bg-accent/10 border-accent/20'}`}>
                                                                    {player.isReserve ? 'Reserva' : 'Titular'}
                                                                </span>
                                                                <span className="text-[0.55rem] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
                                                                    {player.position}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Actions: always visible on mobile, hover on desktop */}
                                                        {!isPublicView && (
                                                            <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                                <button onClick={() => toggleCaptain(currentTeam.id, player.id)}
                                                                    className={`p-2 rounded-lg transition-all ${player.isCaptain ? 'bg-warning/20 text-warning' : 'bg-white/5 text-slate-600 hover:text-warning hover:bg-white/10'}`}>
                                                                    <Crown size={13} strokeWidth={player.isCaptain ? 3 : 2} />
                                                                </button>
                                                                <button onClick={() => startEdit(player)} className="p-2 bg-white/5 text-slate-600 rounded-lg hover:text-white hover:bg-white/10 transition-all">
                                                                    <Edit2 size={13} />
                                                                </button>
                                                                <button onClick={() => removePlayer(currentTeam.id, player.id)} className="p-2 bg-danger/10 text-danger rounded-lg hover:bg-danger hover:text-white transition-all">
                                                                    <Trash2 size={13} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="glass-panel py-24 sm:py-32 px-8 flex flex-col items-center justify-center text-center opacity-30 gap-5 border-dashed">
                            <Shield size={60} strokeWidth={0.75} className="text-slate-600" />
                            <div className="space-y-1">
                                <h3 className="text-lg font-outfit font-black text-white uppercase tracking-widest">Selecione um Clube</h3>
                                <p className="text-slate-500 font-medium text-sm">Escolha uma equipe na coluna esquerda para gerenciar o elenco.</p>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

const ErrorMsg = ({ msg }: { msg: string }) => (
    <div className="flex items-center gap-2.5 bg-danger/10 border border-danger/20 rounded-xl p-3.5 text-danger animate-fade-in">
        <AlertCircle size={16} strokeWidth={2.5} className="flex-none" />
        <span className="text-[0.65rem] font-black uppercase tracking-widest leading-snug">{msg}</span>
    </div>
);

export default Teams;
