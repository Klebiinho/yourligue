import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useLeague, type Player } from '../context/LeagueContext';
import { Shield, Crown, Trash2, Edit2, Check, X, AlertCircle, Users, Upload, Plus, Star, PlusCircle, GripVertical, ArrowDownUp, Heart, Wind, Compass } from 'lucide-react';
import TeamLogo from '../components/TeamLogo';
import AdBanner from '../components/AdBanner';

const Teams = () => {
    const { league, teams, addTeam, updateTeam, deleteTeam, addPlayer, removePlayer, updatePlayer, toggleCaptain, reorderPlayers, isPublicView, isAdmin, interactWithTeam, userInteractions, supportCounts } = useLeague();
    const { teamId } = useParams<{ teamId: string }>();
    const [activeTeamId, setActiveTeamId] = useState<string | null>(teamId || teams[0]?.id || null);
    const [isEditingTeam, setIsEditingTeam] = useState<string | null>(null);

    useEffect(() => {
        if (teamId) {
            setActiveTeamId(teamId);
        } else if (!activeTeamId && teams.length > 0) {
            setActiveTeamId(teams[0].id);
        }
    }, [teamId, teams]);
    const [newTeamName, setNewTeamName] = useState('');
    const [newTeamLogo, setNewTeamLogo] = useState('');
    const [newTeamColor, setNewTeamColor] = useState('#6366f1'); // Default indigo
    const [error, setError] = useState('');
    const [swappingPlayerId, setSwappingPlayerId] = useState<string | null>(null);
    const [draggedPlayerId, setDraggedPlayerId] = useState<string | null>(null);
    const [teamError, setTeamError] = useState('');
    const [isAddingPlayer, setIsAddingPlayer] = useState(false);
    const [isEditingPlayer, setIsEditingPlayer] = useState<string | null>(null);
    const isBasket = league?.sportType === 'basketball';
    const [formPlayer, setFormPlayer] = useState({
        name: '',
        number: 0,
        position: isBasket ? 'Armador' : 'Atacante',
        isCaptain: false,
        isReserve: false,
        photo: ''
    });

    const [teamSearch, setTeamSearch] = useState('');
    const filteredTeams = teams.filter(t => t.name.toLowerCase().includes(teamSearch.toLowerCase()));

    const currentTeam = teams.find(t => t.id === activeTeamId);

    const extractColorFromImage = (dataUrl: string, onDone?: (hex: string) => void) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            canvas.width = 64; canvas.height = 64;
            ctx.drawImage(img, 0, 0, 64, 64);
            const data = ctx.getImageData(0, 0, 64, 64).data;
            let r = 0, g = 0, b = 0, count = 0;
            for (let i = 0; i < data.length; i += 4) {
                const alpha = data[i + 3];
                const sum = data[i] + data[i+1] + data[i+2];
                if (alpha > 125 && sum > 60 && sum < 700) { 
                    r += data[i]; g += data[i+1]; b += data[i+2];
                    count++;
                }
            }
            if (count > 0) {
                const toHexValue = (n: number) => Math.round(n / count).toString(16).padStart(2, '0');
                const hex = `#${toHexValue(r)}${toHexValue(g)}${toHexValue(b)}`;
                if (onDone) onDone(hex);
                else setNewTeamColor(hex);
            }
        };
        img.src = dataUrl;
    };

    // ── Retroactive Color Identification ─────────────────────
    useEffect(() => {
        if (!isAdmin || isPublicView || !teams.length) return;

        const teamsWithoutColor = teams.filter(t => !t.primaryColor && t.logo);
        if (teamsWithoutColor.length > 0) {
            console.log(`[Color Sync] Processando ${teamsWithoutColor.length} times sem cor...`);
            teamsWithoutColor.forEach(team => {
                extractColorFromImage(team.logo, (hex) => {
                    updateTeam(team.id, { primary_color: hex });
                });
            });
        }
    }, [teams.length, isAdmin, isPublicView]);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>, setter: (v: string) => void) => {
        const file = e.target.files?.[0];
        if (file) { 
            const r = new FileReader(); 
            r.onloadend = () => {
                const res = r.result as string;
                setter(res);
                extractColorFromImage(res);
            }; 
            r.readAsDataURL(file); 
        }
    };

    const handleAddTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTeamName.trim()) return;
        setTeamError('');
        
        if (isEditingTeam) {
            await updateTeam(isEditingTeam, { name: newTeamName, logo: newTeamLogo, primary_color: newTeamColor });
            setIsEditingTeam(null);
        } else {
            const { error } = await addTeam({ name: newTeamName, logo: newTeamLogo, primary_color: newTeamColor });
            if (error) { setTeamError(error); return; }
        }
        
        setNewTeamName(''); setNewTeamLogo(''); setNewTeamColor('#6366f1');
    };

    const startEditingTeam = (team: any) => {
        setIsEditingTeam(team.id);
        setNewTeamName(team.name);
        setNewTeamLogo(team.logo || '');
        setNewTeamColor(team.primaryColor || '#6366f1');
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
        setFormPlayer({ name: '', number: 0, position: isBasket ? 'Armador' : 'Atacante', isCaptain: false, isReserve: false, photo: '' });
    };

    const startEdit = (player: Player) => {
        setIsEditingPlayer(player.id);
        setFormPlayer({
            name: player.name,
            number: player.number,
            position: player.position,
            photo: player.photo || '',
            isCaptain: player.isCaptain || false,
            isReserve: player.isReserve || false
        });
        setIsAddingPlayer(false);
        setError('');
    };

    // ── DRAG & DROP LOGIC ────────────────────────────────────
    const handleDragStart = (e: React.DragEvent, id: string) => {
        if (!isAdmin) return;
        setDraggedPlayerId(id);
        e.dataTransfer.setData('playerId', id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        const sourceId = e.dataTransfer.getData('playerId');
        if (!sourceId || sourceId === targetId || !currentTeam) return;

        const playerIds = currentTeam.players.map(p => p.id);
        const sourceIdx = playerIds.indexOf(sourceId);
        const targetIdx = playerIds.indexOf(targetId);

        const newOrder = [...playerIds];
        newOrder.splice(sourceIdx, 1);
        newOrder.splice(targetIdx, 0, sourceId);

        await reorderPlayers(currentTeam.id, newOrder);
        setDraggedPlayerId(null);
    };

    const handleSwapClick = async (playerId: string) => {
        if (!isAdmin || !currentTeam) return;

        if (!swappingPlayerId) {
            setSwappingPlayerId(playerId);
        } else {
            if (swappingPlayerId !== playerId) {
                const playerIds = currentTeam.players.map(p => p.id);
                const idxA = playerIds.indexOf(swappingPlayerId);
                const idxB = playerIds.indexOf(playerId);

                const newOrder = [...playerIds];
                const temp = newOrder[idxA];
                newOrder[idxA] = newOrder[idxB];
                newOrder[idxB] = temp;

                await reorderPlayers(currentTeam.id, newOrder);
            }
            setSwappingPlayerId(null);
        }
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
                        <div className="glass-panel p-4 sm:p-6 transition-all">
                            <h2 className="text-sm font-black text-white font-outfit uppercase tracking-widest mb-4 flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    {isEditingTeam ? <Edit2 size={16} className="text-primary" /> : <Plus size={16} className="text-accent" />}
                                    {isEditingTeam ? 'Editar Clube' : 'Novo Clube'}
                                </span>
                                {isEditingTeam && (
                                    <button onClick={() => { setIsEditingTeam(null); setNewTeamName(''); setNewTeamLogo(''); }} className="text-slate-500 hover:text-white transition-colors">
                                        <X size={16} />
                                    </button>
                                )}
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
                                    <Shield size={15} fill="currentColor" /> {isEditingTeam ? 'Salvar Alterações' : 'Cadastrar Clube'}
                                </button>
                            </form>
                        </div>
                    )}

                    {isPublicView && <AdBanner position="teams_list" className="mb-4" />}

                    {/* Club List */}
                    <div className="glass-panel p-4 sm:p-6 overflow-hidden">
                        <div className="flex flex-col gap-3 mb-4">
                            <h3 className="text-[0.6rem] font-black text-slate-500 uppercase tracking-[0.15em] flex items-center justify-between">
                                <span>Clubes {teams.length}/{league?.maxTeams}</span>
                                {filteredTeams.length !== teams.length && (
                                    <span className="text-primary/60 lowercase italic font-normal tracking-normal">{filteredTeams.length} encontrados</span>
                                )}
                            </h3>
                            
                            {/* Search Bar */}
                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-primary transition-colors pointer-events-none">
                                    <Compass size={14} className="animate-spin-slow group-focus-within:animate-none" />
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Localizar time..." 
                                    value={teamSearch} 
                                    onChange={e => setTeamSearch(e.target.value)}
                                    className="w-full bg-black/20 border border-white/5 rounded-lg pl-9 pr-4 py-2 text-[0.65rem] font-bold text-white placeholder:text-slate-700 focus:border-primary/40 outline-none transition-all"
                                />
                                {teamSearch && (
                                    <button 
                                        onClick={() => setTeamSearch('')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-600 hover:text-white transition-colors"
                                    >
                                        <X size={12} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2 max-h-[300px] sm:max-h-[400px] overflow-y-auto no-scrollbar">
                            {filteredTeams.length === 0 ? (
                                <p className="text-center py-8 text-[0.65rem] font-black text-slate-600 uppercase tracking-widest opacity-50">
                                    {teamSearch ? 'Nenhum time encontrado' : 'Nenhum clube cadastrado'}
                                </p>
                            ) : (
                                filteredTeams.map(team => (
                                    <div key={team.id} onClick={() => setActiveTeamId(team.id)}
                                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 border relative group/team ${activeTeamId === team.id
                                            ? 'bg-primary/10 border-primary/25 shadow-sm'
                                            : 'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.05]'
                                            }`}>
                                        <TeamLogo src={team.logo} size={36} />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-outfit font-black text-white uppercase text-xs sm:text-sm truncate tracking-wide leading-tight">{team.name}</h4>
                                            <p className="text-[0.55rem] font-black text-slate-600 uppercase tracking-widest mt-0.5">{team.players.length} Atletas</p>
                                        </div>
                                        
                                        {!isPublicView && isAdmin && (
                                            <div className="flex items-center gap-1 opacity-0 group-hover/team:opacity-100 transition-opacity">
                                                <button onClick={(e) => { e.stopPropagation(); startEditingTeam(team); }} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all">
                                                    <Edit2 size={12} />
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); if (window.confirm('Excluir time?')) deleteTeam(team.id); }} className="p-1.5 rounded-lg text-danger/40 hover:text-danger hover:bg-danger/10 transition-all">
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        )}
                                        {activeTeamId === team.id && !isAdmin && <Check size={14} className="text-primary flex-none" />}
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
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between w-full">
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
                                                        <Heart size={12} className="text-danger" /> {supportCounts[currentTeam.id] || 0} Torcedores
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {isPublicView && (
                                            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                                                <button 
                                                    onClick={() => interactWithTeam(currentTeam.id, 'supporting')}
                                                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[0.65rem] font-black uppercase tracking-widest transition-all border ${userInteractions.some(i => i.teamId === currentTeam.id && i.interactionType === 'supporting') ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
                                                    title="Torcer por este time"
                                                >
                                                    <Heart size={14} className={userInteractions.some(i => i.teamId === currentTeam.id && i.interactionType === 'supporting') ? 'animate-bounce' : ''} fill={userInteractions.some(i => i.teamId === currentTeam.id && i.interactionType === 'supporting') ? 'currentColor' : 'none'} /> Torcer
                                                </button>
                                                
                                                <button 
                                                    onClick={() => interactWithTeam(currentTeam.id, 'rival')}
                                                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[0.65rem] font-black uppercase tracking-widest transition-all border ${userInteractions.some(i => i.teamId === currentTeam.id && i.interactionType === 'rival') ? 'bg-danger text-white border-danger shadow-lg shadow-danger/20' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
                                                    title="Secar este time"
                                                >
                                                    <Wind size={14} /> Secar
                                                </button>

                                                <button 
                                                    onClick={() => interactWithTeam(currentTeam.id, 'favorite')}
                                                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[0.65rem] font-black uppercase tracking-widest transition-all border ${userInteractions.some(i => i.teamId === currentTeam.id && i.interactionType === 'favorite') ? 'bg-warning text-black border-warning shadow-lg shadow-warning/20' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
                                                    title="Favoritar este time"
                                                >
                                                    <Star size={14} fill={userInteractions.some(i => i.teamId === currentTeam.id && i.interactionType === 'favorite') ? 'currentColor' : 'none'} /> Favoritar
                                                </button>
                                            </div>
                                        )}
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
                                                            {isBasket 
                                                                ? ['Armador', 'Ala-Armador', 'Ala', 'Ala-Pivô', 'Pivô'].map(p => <option key={p} value={p} className="bg-[#07070a]">{p}</option>)
                                                                : ['Goleiro', 'Zagueiro', 'Lateral', 'Meia', 'Atacante'].map(p => <option key={p} value={p} className="bg-[#07070a]">{p}</option>)
                                                            }
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
                                        {currentTeam.players.map((player) => (
                                            <div key={player.id} 
                                                draggable={isAdmin && !isPublicView}
                                                onDragStart={(e) => handleDragStart(e, player.id)}
                                                onDragOver={handleDragOver}
                                                onDrop={(e) => handleDrop(e, player.id)}
                                                onClick={() => handleSwapClick(player.id)}
                                                className={`group rounded-2xl bg-white/[0.02] border transition-all overflow-hidden cursor-move ${swappingPlayerId === player.id ? 'border-primary ring-1 ring-primary/50 bg-primary/5' : 'border-white/[0.04] hover:bg-white/[0.05]'} ${draggedPlayerId === player.id ? 'opacity-30 grayscale' : ''}`}>
                                                {/* ── VIEW MODE ─── */}
                                                <div className="flex items-center gap-3 p-3 sm:p-4">
                                                    {isAdmin && !isPublicView && (
                                                        <div className="text-slate-700 group-hover:text-slate-500 transition-colors">
                                                            <GripVertical size={16} />
                                                        </div>
                                                    )}
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
                                                        <div className="flex items-center gap-1.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                            {swappingPlayerId && swappingPlayerId !== player.id && (
                                                                <div className="animate-pulse flex items-center gap-1 mr-1 px-2 py-1 rounded-md bg-primary/10 text-primary text-[0.55rem] font-bold uppercase tracking-tighter">
                                                                    <ArrowDownUp size={10} /> Trocar
                                                                </div>
                                                            )}
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); toggleCaptain(currentTeam.id, player.id); }}
                                                                className={`p-2.5 sm:p-2 rounded-xl transition-all ${player.isCaptain ? 'bg-warning/20 text-warning' : 'bg-white/5 text-slate-500 hover:text-warning hover:bg-white/10'}`}
                                                                title="Tornar Capitão"
                                                            >
                                                                <Crown size={16} className="sm:w-[13px] sm:h-[13px]" strokeWidth={player.isCaptain ? 3 : 2} />
                                                            </button>
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); startEdit(player); }} 
                                                                className="p-2.5 sm:p-2 bg-white/5 text-slate-500 rounded-xl hover:text-white hover:bg-white/10 transition-all"
                                                                title="Editar Atleta"
                                                            >
                                                                <Edit2 size={16} className="sm:w-[13px] sm:h-[13px]" />
                                                            </button>
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); removePlayer(currentTeam.id, player.id); }} 
                                                                className="p-2.5 sm:p-2 bg-danger/10 text-danger rounded-xl hover:bg-danger hover:text-white transition-all"
                                                                title="Excluir Atleta"
                                                            >
                                                                <Trash2 size={16} className="sm:w-[13px] sm:h-[13px]" />
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
