import { useState } from 'react';
import { useLeague } from '../context/LeagueContext';
import { Users, Trash2, Edit2, PlusCircle, Star, TrendingUp, Crown, ShieldCheck } from 'lucide-react';
import TeamLogo from '../components/TeamLogo';
import AdBanner from '../components/AdBanner';

const TeamsDashboard = () => {
    const { league, teams, addTeam, updateTeam, deleteTeam, addPlayer, updatePlayer, removePlayer, toggleCaptain } = useLeague();
    const [selectedTeamId, setSelectedTeamId] = useState<string | null>(teams[0]?.id || null);
    const [isAddingTeam, setIsAddingTeam] = useState(false);
    const [isEditingTeam, setIsEditingTeam] = useState<string | null>(null);
    const [isAddingPlayer, setIsAddingPlayer] = useState(false);
    const [isEditingPlayer, setIsEditingPlayer] = useState<string | null>(null);

    interface FormPlayer {
        name: string;
        number: number;
        position: string;
        isCaptain: boolean;
        isReserve: boolean;
        photo: string;
    }

    const [formTeam, setFormTeam] = useState({ name: '', logo: '' });
    const [formPlayer, setFormPlayer] = useState<FormPlayer>({ name: '', number: 0, position: 'Goleiro', isCaptain: false, isReserve: false, photo: '' });

    const selectedTeam = teams.find(t => t.id === selectedTeamId);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>, setter: (v: string) => void) => {
        const file = e.target.files?.[0];
        if (file) {
            const r = new FileReader();
            r.onloadend = () => setter(r.result as string);
            r.readAsDataURL(file);
        }
    };

    const handleTeamSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditingTeam) {
            await updateTeam(isEditingTeam, formTeam);
            setIsEditingTeam(null);
        } else {
            const { error } = await addTeam(formTeam);
            if (error) { alert(error); return; }
            setIsAddingTeam(false);
        }
        setFormTeam({ name: '', logo: '' });
    };

    const handlePlayerSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTeamId) return;
        if (isEditingPlayer) {
            const { error } = await updatePlayer(selectedTeamId, isEditingPlayer, formPlayer);
            if (error) { alert(error); return; }
            setIsEditingPlayer(null);
        } else {
            const { error } = await addPlayer(selectedTeamId, formPlayer);
            if (error) { alert(error); return; }
            setIsAddingPlayer(false);
        }
        setFormPlayer({ name: '', number: 0, position: 'Goleiro', isCaptain: false, isReserve: false, photo: '' });
    };

    // List filtering
    const starters = selectedTeam?.players.filter(p => !p.isReserve) || [];
    const reserves = selectedTeam?.players.filter(p => p.isReserve) || [];
    const maxStarters = league?.playersPerTeam || 5;
    const maxReserves = league?.reserveLimitPerTeam || 5;

    return (
        <div className="animate-fade-in">
            <header className="mb-6 md:mb-10">
                <h1 className="text-xl sm:text-2xl md:text-4xl font-outfit font-extrabold tracking-tight mb-1 uppercase">Painel de Times</h1>
                <p className="text-slate-400 text-xs sm:text-sm">Controle elencos, estatísticas e identidades visuais</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6 items-start">
                {/* ── COLUNA ESQUERDA: Lista de clubs ─── */}
                <section className="lg:col-span-4 glass-panel p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-black flex items-center gap-2 font-outfit uppercase tracking-widest text-slate-300">
                            <Users size={16} className="text-primary" /> Clubes <span className="text-primary font-outfit">({teams.length})</span>
                        </h2>
                        <button onClick={() => { setIsAddingTeam(!isAddingTeam); setIsEditingTeam(null); }}
                            className="w-9 h-9 rounded-xl bg-primary/20 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all active:scale-95">
                            <PlusCircle size={18} />
                        </button>
                    </div>

                    {/* Add/Edit Team Form */}
                    {(isAddingTeam || isEditingTeam) && (
                        <div className="bg-black/30 p-4 rounded-2xl border border-white/[0.06] mb-4 animate-fade-in">
                            <form onSubmit={handleTeamSubmit} className="space-y-3">
                                <div>
                                    <label className="text-[0.6rem] font-black text-slate-600 uppercase tracking-widest">Nome do Time</label>
                                    <input className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-primary outline-none mt-1 font-bold placeholder:text-slate-700"
                                        placeholder="Ex: Flamengo" value={formTeam.name} onChange={e => setFormTeam({ ...formTeam, name: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="text-[0.6rem] font-black text-slate-600 uppercase tracking-widest">Logo / Escudo</label>
                                    <label className="flex items-center justify-center gap-2 w-full h-[42px] mt-1 bg-white/5 border border-dashed border-white/10 rounded-xl cursor-pointer hover:bg-white/[0.08] hover:border-primary/40 transition-all font-bold text-slate-500 hover:text-white">
                                        <span className="text-[0.65rem] uppercase tracking-widest leading-none">
                                            {formTeam.logo ? '✓ Arquivo Selecionado' : 'Fazer Upload'}
                                        </span>
                                        <input type="file" accept="image/*" onChange={e => handleFile(e, (v) => setFormTeam({ ...formTeam, logo: v }))} className="hidden" />
                                    </label>
                                </div>
                                <div className="flex gap-2 pt-1">
                                    <button type="submit" className="flex-1 bg-primary text-white font-black py-2.5 rounded-xl uppercase tracking-widest text-[0.62rem] shadow-lg hover:brightness-110 active:scale-95 transition-all">
                                        {isEditingTeam ? 'Salvar' : 'Confirmar'}
                                    </button>
                                    <button type="button" onClick={() => { setIsAddingTeam(false); setIsEditingTeam(null); }} className="px-4 border border-white/10 text-slate-500 font-black py-2.5 rounded-xl uppercase text-[0.62rem] hover:bg-white/5 transition-all">
                                        X
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Team list */}
                    <div className="space-y-2 max-h-[360px] sm:max-h-[500px] overflow-y-auto no-scrollbar">
                        {teams.length === 0 ? (
                            <p className="text-center py-10 text-[0.65rem] font-black uppercase tracking-widest text-slate-600 opacity-50">Nenhum time cadastrado.</p>
                        ) : (
                            teams.map(team => (
                                <div key={team.id} onClick={() => setSelectedTeamId(team.id)}
                                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 border ${selectedTeamId === team.id
                                        ? 'bg-primary/10 border-primary/25 shadow-sm'
                                        : 'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.05]'
                                        }`}>
                                    <TeamLogo src={team.logo} size={38} />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-black text-white truncate font-outfit uppercase tracking-wide text-xs sm:text-sm leading-tight">{team.name}</h3>
                                        <p className="text-[0.55rem] font-black text-slate-600 uppercase tracking-widest mt-0.5">{team.players.length} Atletas</p>
                                    </div>
                                    <div className="flex items-center gap-1 flex-none">
                                        <button onClick={(e) => { e.stopPropagation(); setIsEditingTeam(team.id); setFormTeam({ name: team.name, logo: team.logo }); setIsAddingTeam(true); }}
                                            className="p-2 rounded-lg text-slate-600 hover:text-white hover:bg-white/10 transition-all">
                                            <Edit2 size={13} />
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); if (window.confirm('Excluir time?')) deleteTeam(team.id); }}
                                            className="p-2 rounded-lg text-danger/40 hover:text-danger hover:bg-danger/10 transition-all">
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* ── COLUNA DIREITA: Detalhes do time ─── */}
                <section className="lg:col-span-8 space-y-4 md:space-y-5">
                    {!selectedTeam ? (
                        <div className="glass-panel p-16 sm:p-24 flex flex-col items-center justify-center text-center opacity-40 gap-4">
                            <TrendingUp size={48} strokeWidth={1} />
                            <p className="font-outfit uppercase font-black text-[0.65rem] tracking-[0.2em] text-slate-500">Selecione um clube para gerenciar atletas</p>
                        </div>
                    ) : (
                        <>
                            {/* Team Header Card */}
                            <div className="glass-panel p-4 sm:p-6 flex items-center gap-4 sm:gap-6 border-b-2 border-b-primary shadow-2xl">
                                <div className="relative flex-none">
                                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
                                    <TeamLogo src={selectedTeam.logo} size={64} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-xl sm:text-3xl font-black text-white font-outfit uppercase tracking-tight leading-none truncate">{selectedTeam.name}</h2>
                                    {/* Stats row */}
                                    <div className="flex items-center gap-4 sm:gap-6 mt-3 flex-wrap">
                                        <div className="flex flex-col">
                                            <span className="text-[0.5rem] font-black text-slate-600 uppercase tracking-widest">Aproveitamento</span>
                                            <span className="text-lg sm:text-xl font-black text-white font-outfit leading-none">
                                                {selectedTeam.stats?.matches > 0 ? Math.round(((selectedTeam.stats.wins * 3 + selectedTeam.stats.draws) / (selectedTeam.stats.matches * 3)) * 100) : 0}%
                                            </span>
                                        </div>
                                        <div className="w-px h-8 bg-white/10 flex-none" />
                                        <div className="flex flex-col">
                                            <span className="text-[0.5rem] font-black text-slate-600 uppercase tracking-widest">Titulares</span>
                                            <div className="flex items-end gap-1">
                                                <span className={`text-lg sm:text-xl font-black font-outfit leading-none ${starters.length > maxStarters ? 'text-danger' : (starters.length === maxStarters ? 'text-accent' : 'text-white')}`}>{starters.length}</span>
                                                <span className="text-[0.6rem] text-slate-700 font-black mb-0.5">/ {maxStarters}</span>
                                            </div>
                                        </div>
                                        <div className="w-px h-8 bg-white/10 flex-none" />
                                        <div className="flex flex-col">
                                            <span className="text-[0.5rem] font-black text-slate-600 uppercase tracking-widest">Reservas</span>
                                            <div className="flex items-end gap-1">
                                                <span className={`text-lg sm:text-xl font-black font-outfit leading-none ${reserves.length > maxReserves ? 'text-danger' : (reserves.length === maxReserves ? 'text-accent' : 'text-white')}`}>{reserves.length}</span>
                                                <span className="text-[0.6rem] text-slate-700 font-black mb-0.5">/ {maxReserves}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <AdBanner position="panel_stats" />

                            {/* Player Panel */}
                            <div className="glass-panel p-4 sm:p-6 shadow-xl">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-sm font-black flex items-center gap-2 font-outfit uppercase tracking-widest text-slate-300">
                                        <Star size={15} className="text-warning fill-warning/20" />
                                        Gestão de Atletas
                                        <span className="text-xs font-outfit text-slate-600">({selectedTeam.players.length} Total)</span>
                                    </h2>
                                    <button onClick={() => { setIsAddingPlayer(!isAddingPlayer); setIsEditingPlayer(null); }}
                                        className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-accent text-white font-black text-[0.65rem] uppercase tracking-widest hover:brightness-110 shadow-lg shadow-accent/20 transition-all active:scale-95">
                                        <PlusCircle size={14} strokeWidth={3} /> Inscrever Jogador
                                    </button>
                                </div>

                                {/* Player Form */}
                                {(isAddingPlayer || isEditingPlayer) && (
                                    <div className="bg-black/40 p-5 md:p-6 rounded-3xl border border-white/[0.08] mb-8 animate-fade-in shadow-2xl">
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

                                            <div className="flex gap-3 pt-2">
                                                <button type="submit" className="flex-1 bg-accent text-white font-black py-4 rounded-xl uppercase tracking-[0.15em] text-xs shadow-xl shadow-accent/20 hover:brightness-110 active:scale-[0.98] transition-all">
                                                    {isEditingPlayer ? 'Atualizar Atleta' : 'Finalizar Inscrição'}
                                                </button>
                                                <button type="button" onClick={() => { setIsAddingPlayer(false); setIsEditingPlayer(null); }} className="px-8 bg-white/5 border border-white/10 text-slate-500 font-black py-4 rounded-xl uppercase text-xs hover:bg-white/10 transition-all">Cancelar</button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {/* Categorized Player List */}
                                <div className="space-y-8">
                                    {/* Starters Section */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3 px-2">
                                            <h3 className="text-[0.65rem] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                                                <ShieldCheck size={14} /> Titulares ({starters.length} / {maxStarters})
                                            </h3>
                                            {starters.length > maxStarters && (
                                                <span className="text-[0.55rem] font-black bg-danger/10 text-danger border border-danger/20 px-2 py-1 rounded-md animate-pulse">LIMITE EXCEDIDO</span>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {starters.length === 0 ? (
                                                <p className="col-span-full text-center py-6 text-slate-700 font-black text-[0.6rem] uppercase tracking-widest border border-white/5 rounded-2xl bg-white/[0.01] italic">Nenhum titular definido.</p>
                                            ) : (
                                                starters.map(p => renderPlayerCard(p, selectedTeam.id))
                                            )}
                                        </div>
                                    </div>

                                    {/* Reserves Section */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3 px-2">
                                            <h3 className="text-[0.65rem] font-black text-accent uppercase tracking-[0.2em] flex items-center gap-2">
                                                <Users size={14} /> Reservas ({reserves.length} / {maxReserves})
                                            </h3>
                                            {reserves.length > maxReserves && (
                                                <span className="text-[0.55rem] font-black bg-danger/10 text-danger border border-danger/20 px-2 py-1 rounded-md animate-pulse">LIMITE EXCEDIDO</span>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {reserves.length === 0 ? (
                                                <p className="col-span-full text-center py-6 text-slate-700 font-black text-[0.6rem] uppercase tracking-widest border border-white/5 rounded-2xl bg-white/[0.01] italic">Nenhum reserva definido.</p>
                                            ) : (
                                                reserves.map(p => renderPlayerCard(p, selectedTeam.id))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </section>
            </div>
        </div>
    );

    function renderPlayerCard(p: any, teamId: string) {
        const isStar = p.isCaptain;
        return (
            <div key={p.id} className={`group relative flex items-center gap-4 p-3 rounded-2xl transition-all duration-300 border ${
                isStar 
                ? 'bg-warning/[0.03] border-warning/20 shadow-[0_0_20px_rgba(234,179,8,0.05)]' 
                : 'bg-white/[0.03] border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.05]'
            }`}>
                {/* Avatar Section */}
                <div className="relative flex-none">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden border-2 transition-all duration-500 ${
                        isStar ? 'border-warning/40 bg-warning/10 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'border-white/10 bg-black/40'
                    }`}>
                        {p.photo ? (
                            <img src={p.photo} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                            <ShieldCheck size={24} className={isStar ? 'text-warning/60' : 'text-slate-700'} strokeWidth={1.5} />
                        )}
                    </div>
                    {isStar && (
                        <div className="absolute -top-2 -right-2 bg-warning text-black w-6 h-6 rounded-lg flex items-center justify-center shadow-[0_4px_10px_rgba(234,179,8,0.4)] transform -rotate-12 group-hover:rotate-0 transition-transform">
                            <Crown size={14} fill="currentColor" />
                        </div>
                    )}
                </div>

                {/* Info Section */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-outfit font-black text-white uppercase tracking-tight text-xs sm:text-sm truncate">
                            {p.name}
                        </span>
                        <span className={`text-[0.55rem] font-black px-2 py-0.5 rounded flex-none uppercase tracking-widest ${
                            isStar ? 'bg-warning/20 text-warning' : 'bg-white/10 text-slate-500'
                        }`}>
                            {p.position}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[0.6rem] font-black text-slate-600 uppercase tracking-widest bg-black/40 px-1.5 py-0.5 rounded">Nº {p.number}</span>
                        <div className="flex items-center gap-2">
                            {(p.stats?.goals || 0) > 0 && (
                                <span className="flex items-center gap-1 text-[0.6rem] font-black text-accent uppercase">
                                    <TrendingUp size={10} /> {p.stats.goals}
                                </span>
                            )}
                            {(p.stats?.yellowCards || 0) > 0 && (
                                <div className="flex gap-0.5">
                                    {Array.from({ length: p.stats?.yellowCards || 0 }).map((_, i) => (
                                        <div key={i} className="w-2 h-3.5 bg-warning rounded-[2px] border border-black/20 shadow-sm" />
                                    ))}
                                </div>
                            )}
                            {(p.stats?.redCards || 0) > 0 && <div className="w-2 h-3.5 bg-danger rounded-[2px] border border-black/20 shadow-sm" />}
                        </div>
                    </div>
                </div>

                {/* Actions Section */}
                <div className="flex items-center gap-1.5 md:opacity-0 md:group-hover:opacity-100 transition-all pr-1">
                    <button onClick={(e) => { e.stopPropagation(); toggleCaptain(teamId, p.id); }}
                        className={`p-2.5 sm:p-2 rounded-xl transition-all ${isStar ? 'bg-warning/20 text-warning shadow-lg shadow-warning/10' : 'text-slate-500 hover:text-white hover:bg-white/10'}`}
                        title="Destaque/Capitão">
                        <Star size={16} className="sm:w-[14px] sm:h-[14px]" fill={isStar ? "currentColor" : "none"} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setIsEditingPlayer(p.id); setFormPlayer({ name: p.name, number: p.number, position: p.position, isCaptain: p.isCaptain || false, isReserve: p.isReserve || false, photo: p.photo || '' }); setIsAddingPlayer(true); }}
                        className="p-2.5 sm:p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/10 transition-all">
                        <Edit2 size={16} className="sm:w-[14px] sm:h-[14px]" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); if (window.confirm(`Excluir ${p.name}?`)) removePlayer(teamId, p.id); }}
                        className="p-2.5 sm:p-2 rounded-xl text-danger/60 hover:text-danger hover:bg-danger/10 transition-all">
                        <Trash2 size={16} className="sm:w-[14px] sm:h-[14px]" />
                    </button>
                </div>
            </div>
        );
    }
};

export default TeamsDashboard;
