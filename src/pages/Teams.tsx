import { useState } from 'react';
import { useLeague } from '../context/LeagueContext';
import { Shield, Crown, Trash2, Edit2, Check, X, AlertCircle, Users, Upload, Plus, Star, PlusCircle } from 'lucide-react';
import TeamLogo from '../components/TeamLogo';
import AdBanner from '../components/AdBanner';

const Teams = () => {
    const { league, teams, addTeam, addPlayer, removePlayer, updatePlayer, toggleCaptain, isPublicView, isAdmin } = useLeague();
    const [activeTeamId, setActiveTeamId] = useState<string | null>(teams[0]?.id ?? null);
    const [newTeamName, setNewTeamName] = useState('');
    const [newTeamLogo, setNewTeamLogo] = useState('');
    const [error, setError] = useState('');
    const [teamError, setTeamError] = useState('');
    const [isAddingPlayer, setIsAddingPlayer] = useState(false);
    const [isEditingPlayer, setIsEditingPlayer] = useState<string | null>(null);
    const [formPlayer, setFormPlayer] = useState({
        name: '',
        number: 0,
        position: 'Atacante',
        isCaptain: false,
        isReserve: false,
        photo: ''
    });

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

    const handlePlayerSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeTeamId) return;
        setError('');
        
        if (isEditingPlayer) {
            const { error } = await updatePlayer(activeTeamId, isEditingPlayer, formPlayer);
            if (error) { setError(error); return; }
            setIsEditingPlayer(null);
        } else {
            const { error } = await addPlayer(activeTeamId, formPlayer);
            if (error) { setError(error); return; }
            setIsAddingPlayer(false);
        }
        setFormPlayer({ name: '', number: 0, position: 'Atacante', isCaptain: false, isReserve: false, photo: '' });
    };

    const startEdit = (p: any) => {
        setIsEditingPlayer(p.id);
        setFormPlayer({
            name: p.name,
            number: p.number,
            position: p.position,
            isCaptain: p.isCaptain || false,
            isReserve: p.isReserve || false,
            photo: p.photo || ''
        });
        setIsAddingPlayer(true);
    };

    return (
        <div className="animate-fade-in">
            {isPublicView && <AdBanner position="top" />}
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
                    {/* New Team Form (Hidden in Public View or if not admin) */}
                    {!isPublicView && isAdmin && (
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

                    {isPublicView && <AdBanner position="teams_list" className="mb-4" />}

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
                                </div>
                            </div>

                            {/* PREMIUM PLAYER FORM (Same as Dashboard) */}
                            {!isPublicView && isAdmin && (
                                <div className="p-4 sm:p-6 border-b border-white/[0.05]">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                            <Star size={13} className="text-warning fill-warning/20" /> Gestão de Atletas
                                        </h3>
                                        {!isAddingPlayer && !isEditingPlayer && (
                                            <button onClick={() => setIsAddingPlayer(true)}
                                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-white font-black text-[0.65rem] uppercase tracking-widest hover:brightness-110 transition-all active:scale-95 shadow-lg shadow-accent/20">
                                                <PlusCircle size={14} strokeWidth={3} /> Inscrever Atleta
                                            </button>
                                        )}
                                    </div>

                                    {(isAddingPlayer || isEditingPlayer) && (
                                        <div className="bg-black/40 p-5 md:p-6 rounded-3xl border border-white/[0.08] mb-4 animate-fade-in shadow-2xl">
                                            <form onSubmit={handlePlayerSubmit} className="space-y-5">
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                    <div className="md:col-span-2">
                                                        <label className="text-[0.6rem] font-black text-slate-600 uppercase tracking-widest ml-1">Nome Completo</label>
                                                        <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:border-accent outline-none mt-1.5 font-bold h-14"
                                                            placeholder="Ex: Cristiano Ronaldo" value={formPlayer.name} onChange={e => setFormPlayer({ ...formPlayer, name: e.target.value })} required />
                                                    </div>
                                                    <div>
                                                        <label className="text-[0.6rem] font-black text-slate-600 uppercase tracking-widest ml-1">Nº Camisa</label>
                                                        <input type="number" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:border-accent outline-none mt-1.5 font-bold h-14"
                                                            value={formPlayer.number} onChange={e => setFormPlayer({ ...formPlayer, number: parseInt(e.target.value) })} required />
                                                    </div>
                                                    <div>
                                                        <label className="text-[0.6rem] font-black text-slate-600 uppercase tracking-widest ml-1">Posição Principal</label>
                                                        <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:border-accent outline-none mt-1.5 font-bold appearance-none cursor-pointer h-14"
                                                            value={formPlayer.position} onChange={e => setFormPlayer({ ...formPlayer, position: e.target.value })}>
                                                            {['Goleiro', 'Zagueiro', 'Lateral', 'Meia', 'Atacante'].map(p => <option key={p} value={p} className="bg-[#07070a]">{p}</option>)}
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-1.5">
                                                        <label className="text-[0.6rem] font-black text-slate-600 uppercase tracking-widest ml-1">Tipo de Inscrição</label>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <button type="button" onClick={() => setFormPlayer({ ...formPlayer, isReserve: false })}
                                                                className={`py-3 rounded-xl font-black text-[0.6rem] uppercase tracking-widest border transition-all ${!formPlayer.isReserve ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white/5 text-slate-500 border-white/10 hover:bg-white/10'}`}>
                                                                Titular
                                                            </button>
                                                            <button type="button" onClick={() => setFormPlayer({ ...formPlayer, isReserve: true })}
                                                                className={`py-3 rounded-xl font-black text-[0.6rem] uppercase tracking-widest border transition-all ${formPlayer.isReserve ? 'bg-accent text-white border-accent shadow-lg shadow-accent/20' : 'bg-white/5 text-slate-500 border-white/10 hover:bg-white/10'}`}>
                                                                Reserva
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[0.6rem] font-black text-slate-600 uppercase tracking-widest ml-1">Liderança</label>
                                                        <button type="button" onClick={() => setFormPlayer({ ...formPlayer, isCaptain: !formPlayer.isCaptain })}
                                                            className={`w-full py-3 rounded-xl font-black text-[0.6rem] uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${formPlayer.isCaptain ? 'bg-warning text-black border-warning shadow-lg shadow-warning/20' : 'bg-white/5 text-slate-500 border-white/10 hover:bg-white/10'}`}>
                                                            <Crown size={14} /> {formPlayer.isCaptain ? 'Capitão da Equipe' : 'Torne este Atleta Capitão'}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="text-[0.6rem] font-black text-slate-600 uppercase tracking-widest ml-1">Avatar / Foto</label>
                                                    <label className="flex items-center justify-center gap-3 w-full h-14 mt-1.5 bg-white/5 border border-dashed border-white/10 rounded-xl cursor-pointer hover:bg-white/[0.08] hover:border-accent transition-all font-bold text-slate-500 hover:text-white">
                                                        <span className="text-[0.65rem] uppercase tracking-widest leading-none">
                                                            {formPlayer.photo ? '✓ Foto Carregada' : 'Selecionar Foto do Atleta'}
                                                        </span>
                                                        <input type="file" accept="image/*" onChange={e => handleFile(e, (v) => setFormPlayer({ ...formPlayer, photo: v }))} className="hidden" />
                                                    </label>
                                                </div>

                                                {error && <ErrorMsg msg={error} />}

                                                <div className="flex gap-3 pt-2">
                                                    <button type="submit" className="flex-1 bg-accent text-white font-black py-4 rounded-xl uppercase tracking-[0.15em] text-xs shadow-xl shadow-accent/20 hover:brightness-110 active:scale-[0.98] transition-all">
                                                        {isEditingPlayer ? 'Atualizar Atleta' : 'Finalizar Inscrição'}
                                                    </button>
                                                    <button type="button" onClick={() => { setIsAddingPlayer(false); setIsEditingPlayer(null); setError(''); }} className="px-8 bg-white/5 border border-white/10 text-slate-500 font-black py-4 rounded-xl uppercase text-xs hover:bg-white/10 transition-all">Cancelar</button>
                                                </div>
                                            </form>
                                        </div>
                                    )}
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
                                                {/* ── VIEW MODE ─── */}
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
                                                    {!isPublicView && isAdmin && (
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
