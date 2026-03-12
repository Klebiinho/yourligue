import { useState } from 'react';
import { useLeague } from '../context/LeagueContext';
import { Shield, UserPlus, Image as ImageIcon, Crown, Trash2, Edit2, Check, X, AlertCircle, Users, Upload, Search, Plus } from 'lucide-react';
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
            <header className="mb-8">
                <h1 className="text-2xl sm:text-3xl md:text-5xl font-outfit font-extrabold tracking-tight mb-1 uppercase flex items-center gap-3">
                    <Shield size={32} className="text-primary drop-shadow-[0_0_15px_rgba(109,40,217,0.3)] flex-none" strokeWidth={2.5} />
                    Times & Elencos
                </h1>
                <p className="text-slate-400 font-medium md:text-lg">
                    Gestão central de clubes para o campeonato <span className="text-white font-bold">{league?.name}</span>
                </p>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 md:gap-8 items-start">
                {/* Left Section: Team Registration & Selection */}
                <section className="xl:col-span-12 2xl:col-span-4 space-y-6">
                    <div className="glass-panel p-6 md:p-8">
                        <h2 className="text-xl font-black text-white font-outfit uppercase tracking-widest mb-8 flex items-center gap-3">
                            <Plus size={22} className="text-accent" /> Novo Clube
                        </h2>
                        <form onSubmit={handleAddTeam} className="space-y-5 mb-8">
                            <div className="space-y-2">
                                <label className="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest ml-1">Nome da Equipe</label>
                                <input type="text" placeholder="Ex: Galáticos FC" value={newTeamName} onChange={e => setNewTeamName(e.target.value)} required
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-primary outline-none transition-all font-bold placeholder:text-slate-700"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest ml-1">Escudo / Logo</label>
                                <label className="flex items-center justify-center gap-3 w-full h-14 bg-white/5 border border-dashed border-white/10 rounded-xl cursor-pointer hover:bg-white/10 hover:border-primary/50 transition-all group">
                                    <Upload size={18} className="text-slate-500 group-hover:text-primary transition-colors" />
                                    <span className="text-xs font-black text-slate-500 group-hover:text-white uppercase tracking-widest leading-none">
                                        {newTeamLogo ? 'Pronto ✓' : 'Fazer Upload'}
                                    </span>
                                    <input type="file" accept="image/*" onChange={e => handleFile(e, setNewTeamLogo)} className="hidden" />
                                </label>
                                {newTeamLogo && (
                                    <div className="flex justify-center mt-4">
                                        <div className="relative p-2 bg-white/5 rounded-2xl border border-white/10 shadow-xl animate-scale-in">
                                            <TeamLogo src={newTeamLogo} size={80} />
                                            <button type="button" onClick={() => setNewTeamLogo('')} className="absolute -top-2 -right-2 bg-danger text-white p-1 rounded-full shadow-lg">
                                                <X size={12} strokeWidth={4} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {teamError && <ErrorMsg msg={teamError} />}

                            <button type="submit" className="w-full bg-primary text-white font-black py-4 rounded-xl shadow-[0_4px_20px_rgba(109,40,217,0.3)] hover:brightness-110 active:scale-[0.98] transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-3">
                                <Shield size={18} fill="currentColor" /> Finalizar Cadastro
                            </button>
                        </form>

                        <div className="border-t border-white/5 pt-8">
                            <h3 className="text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center justify-between">
                                Clubes Vinculados <span>{teams.length} / {league?.maxTeams}</span>
                            </h3>
                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 no-scrollbar">
                                {teams.map(team => (
                                    <div key={team.id} onClick={() => setActiveTeamId(team.id)}
                                        className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300 border ${activeTeamId === team.id
                                            ? 'bg-primary/10 border-primary/30 shadow-lg'
                                            : 'bg-white/3 border-white/5 hover:bg-white/5'
                                            }`}>
                                        <TeamLogo src={team.logo} size={44} />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-outfit font-black text-white uppercase text-sm truncate tracking-wide leading-tight">{team.name}</h4>
                                            <p className="text-[0.55rem] font-black text-slate-500 uppercase tracking-widest mt-1">{team.players.length} Atletas Inscritos</p>
                                        </div>
                                        {activeTeamId === team.id && <Check size={18} className="text-primary animate-scale-in" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Right Section: Player List & Registration */}
                <section className="xl:col-span-12 2xl:col-span-8">
                    {currentTeam ? (
                        <div className="glass-panel p-6 md:p-10 space-y-10">
                            {/* Team Header Summary (Visual) */}
                            <div className="flex flex-col md:flex-row items-center gap-8 pb-10 border-b border-white/5">
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-primary/20 blur-2xl group-hover:bg-primary/40 transition-all rounded-full" />
                                    <TeamLogo src={currentTeam.logo} size={110} />
                                </div>
                                <div className="text-center md:text-left flex-1 space-y-2">
                                    <h2 className="text-4xl md:text-6xl font-outfit font-black text-white uppercase tracking-tighter leading-none">{currentTeam.name}</h2>
                                    <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5 text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">
                                            <Users size={14} className="text-primary" /> {currentTeam.players.length} Jogadores
                                        </div>
                                        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5 text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">
                                            <Check size={14} className="text-accent" /> Inscrição Ativa
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Player Addition Form Card */}
                            <div className="bg-black/20 p-6 md:p-8 rounded-3xl border border-white/5 shadow-inner">
                                <h3 className="text-lg font-black text-white font-outfit uppercase tracking-widest mb-6 flex items-center gap-3">
                                    <UserPlus size={20} className="text-accent" /> Inscrever Novo Atleta
                                </h3>
                                <form onSubmit={handleAddPlayer} className="grid grid-cols-1 md:grid-cols-12 gap-5">
                                    <div className="md:col-span-5 space-y-2">
                                        <label className="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest ml-1">Nome do Jogador</label>
                                        <input type="text" placeholder="Ex: Cristiano Ronaldo" value={newPlayerName} onChange={e => setNewPlayerName(e.target.value)} required
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:border-accent outline-none transition-all font-bold"
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest ml-1">Nº Camisa</label>
                                        <input type="number" placeholder="00" value={newPlayerNumber} onChange={e => setNewPlayerNumber(e.target.value)} required min={1} max={99}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:border-accent outline-none transition-all font-black text-center text-xl"
                                        />
                                    </div>
                                    <div className="md:col-span-3 space-y-2">
                                        <label className="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest ml-1">Posição</label>
                                        <select value={newPlayerPos} onChange={e => setNewPlayerPos(e.target.value)}
                                            className="w-full h-[60px] bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white font-bold outline-none cursor-pointer appearance-none">
                                            <option className="bg-bg-dark">Goleiro</option><option className="bg-bg-dark">Zagueiro</option>
                                            <option className="bg-bg-dark">Lateral</option><option className="bg-bg-dark">Meio-campo</option>
                                            <option className="bg-bg-dark">Atacante</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2 space-y-2 flex flex-col justify-end">
                                        <label className="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest ml-1">Foto</label>
                                        <label className="flex items-center justify-center bg-white/5 border border-white/10 h-[60px] rounded-xl cursor-pointer hover:bg-white/10 transition-all text-slate-500 hover:text-white">
                                            {newPlayerPhoto ? <Check size={24} className="text-accent" /> : <ImageIcon size={24} />}
                                            <input type="file" accept="image/*" onChange={e => handleFile(e, setNewPlayerPhoto)} className="hidden" />
                                        </label>
                                    </div>

                                    {error && <div className="md:col-span-12 animate-slide-up"><ErrorMsg msg={error} /></div>}

                                    <button type="submit" className="md:col-span-12 mt-4 bg-accent text-white font-black py-4 rounded-xl shadow-lg hover:brightness-110 active:scale-[0.99] transition-all uppercase tracking-widest text-[0.7rem] flex items-center justify-center gap-3">
                                        <UserPlus size={18} strokeWidth={3} /> Confirmar Inscrição
                                    </button>
                                </form>
                            </div>

                            {/* Player Registry List */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between mb-2 px-2">
                                    <h3 className="text-[0.65rem] font-black text-slate-500 uppercase tracking-[0.2em]">Registro de Atletas</h3>
                                    <div className="relative hidden sm:block">
                                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700" />
                                        <input type="text" placeholder="Filtrar por nome..." className="bg-white/5 border border-white/10 rounded-full px-10 py-2 text-[0.6rem] uppercase font-black outline-none w-48 focus:w-64 focus:border-primary transition-all placeholder:text-slate-700" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    {currentTeam.players.length === 0 ? (
                                        <div className="text-center py-20 opacity-30 flex flex-col items-center gap-4">
                                            <Users size={60} strokeWidth={1} />
                                            <span className="text-[0.65rem] font-black uppercase tracking-[0.2em]">O elenco ainda está vazio</span>
                                        </div>
                                    ) : (
                                        currentTeam.players.map(player => (
                                            <div key={player.id} className="group flex items-center gap-5 p-4 rounded-2xl bg-white/3 border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all">
                                                {editingPlayerId === player.id ? (
                                                    <div className="flex-1 flex flex-wrap gap-3 items-center" onClick={e => e.stopPropagation()}>
                                                        <input value={editName} onChange={e => setEditName(e.target.value)} className="flex-1 min-w-[150px] bg-black/40 border border-primary/40 rounded-xl px-4 py-2.5 text-white text-sm font-bold outline-none" placeholder="Nome" />
                                                        <input type="number" value={editNumber} onChange={e => setEditNumber(e.target.value)} className="w-16 bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm font-black text-center" />
                                                        <select value={editPos} onChange={e => setEditPos(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs font-bold font-black uppercase tracking-wider outline-none h-[42px]">
                                                            <option>Goleiro</option><option>Zagueiro</option><option>Lateral</option><option>Meio-campo</option><option>Atacante</option>
                                                        </select>
                                                        <button onClick={saveEdit} className="p-2.5 bg-accent text-white rounded-xl shadow-lg hover:brightness-110 transition-all"><Check size={20} strokeWidth={3} /></button>
                                                        <button onClick={() => setEditingPlayerId(null)} className="p-2.5 bg-white/5 text-slate-500 border border-white/10 rounded-xl hover:bg-white/10 transition-all"><X size={20} /></button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="relative">
                                                            <TeamLogo src={player.photo} size={50} />
                                                            {player.isCaptain && (
                                                                <div className="absolute -top-1 -right-1 bg-warning text-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-bg-dark shadow-lg">
                                                                    <Crown size={12} fill="currentColor" strokeWidth={3} />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-3 mb-1">
                                                                <span className="w-9 h-9 flex items-center justify-center rounded-lg bg-black/30 font-black font-outfit text-white border border-white/5 group-hover:bg-primary group-hover:border-primary/50 transition-colors">
                                                                    #{player.number}
                                                                </span>
                                                                <h4 className="font-outfit font-black text-white uppercase text-base tracking-wide truncate group-hover:translate-x-1 transition-transform duration-300">
                                                                    {player.name}
                                                                </h4>
                                                            </div>
                                                            <span className="text-[0.6rem] font-black text-accent uppercase tracking-widest bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                                                                {player.position}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => toggleCaptain(currentTeam.id, player.id)}
                                                                className={`p-3 rounded-xl transition-all ${player.isCaptain ? 'bg-warning text-black shadow-[0_0_15px_rgba(234,179,8,0.4)]' : 'bg-white/5 text-slate-500 hover:text-warning hover:bg-white/10'}`}
                                                                title={player.isCaptain ? 'Remover braçadeira' : 'Nomear Capitão'}>
                                                                <Crown size={18} strokeWidth={player.isCaptain ? 3 : 2} />
                                                            </button>
                                                            <button onClick={() => startEdit(player)} className="p-3 bg-white/5 text-slate-500 rounded-xl hover:text-white hover:bg-white/10 transition-all" title="Editar Atleta">
                                                                <Edit2 size={18} />
                                                            </button>
                                                            <button onClick={() => removePlayer(currentTeam.id, player.id)} className="p-3 bg-danger/10 text-danger rounded-xl hover:bg-danger hover:text-white transition-all shadow-lg shadow-danger/5" title="Remover Inscrição">
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="glass-panel py-40 px-10 flex flex-col items-center justify-center text-center opacity-40 gap-6 border-dashed">
                            <Shield size={100} strokeWidth={0.5} className="text-slate-600 animate-pulse" />
                            <div className="space-y-2">
                                <h3 className="text-xl font-outfit font-black text-white uppercase tracking-[0.2em]">Selecione um Clube</h3>
                                <p className="text-slate-500 font-medium max-w-md mx-auto">Escolha uma equipe na lista lateral para gerenciar os atletas inscritos no campeonato.</p>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

const ErrorMsg = ({ msg }: { msg: string }) => (
    <div className="flex items-center gap-3 bg-danger/10 border border-danger/20 rounded-xl p-4 text-danger animate-shake shadow-lg">
        <AlertCircle size={20} strokeWidth={2.5} />
        <span className="text-xs font-black uppercase tracking-widest leading-none">{msg}</span>
    </div>
);

export default Teams;
