import { useState } from 'react';
import { useLeague } from '../context/LeagueContext';
import { Users, Trash2, Edit2, PlusCircle, Star, Target, TrendingUp } from 'lucide-react';
import TeamLogo from '../components/TeamLogo';

const TeamsDashboard = () => {
    const { teams, addTeam, updateTeam, deleteTeam, addPlayer, updatePlayer, removePlayer, toggleCaptain } = useLeague();
    const [selectedTeamId, setSelectedTeamId] = useState<string | null>(teams[0]?.id || null);
    const [isAddingTeam, setIsAddingTeam] = useState(false);
    const [isEditingTeam, setIsEditingTeam] = useState<string | null>(null);
    const [isAddingPlayer, setIsAddingPlayer] = useState(false);
    const [isEditingPlayer, setIsEditingPlayer] = useState<string | null>(null);

    const [formTeam, setFormTeam] = useState({ name: '', logo: '' });
    const [formPlayer, setFormPlayer] = useState({ name: '', number: 0, position: 'Goleiro', isCaptain: false });

    const selectedTeam = teams.find(t => t.id === selectedTeamId);

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
            await updatePlayer(selectedTeamId, isEditingPlayer, formPlayer);
            setIsEditingPlayer(null);
        } else {
            const { error } = await addPlayer(selectedTeamId, formPlayer);
            if (error) { alert(error); return; }
            setIsAddingPlayer(false);
        }
        setFormPlayer({ name: '', number: 0, position: 'Goleiro', isCaptain: false });
    };

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
                                    <label className="text-[0.6rem] font-black text-slate-600 uppercase tracking-widest">Logo URL</label>
                                    <input className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-primary outline-none mt-1 placeholder:text-slate-700"
                                        placeholder="https://..." value={formTeam.logo} onChange={e => setFormTeam({ ...formTeam, logo: e.target.value })} />
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
                            <div className="glass-panel p-4 sm:p-6 flex items-center gap-4 sm:gap-6 border-b-2 border-b-primary">
                                <div className="relative flex-none">
                                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
                                    <TeamLogo src={selectedTeam.logo} size={56} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-white font-outfit uppercase tracking-tight leading-none truncate">{selectedTeam.name}</h2>
                                    {/* Stats row */}
                                    <div className="flex items-center gap-4 sm:gap-6 mt-2.5 flex-wrap">
                                        <div className="flex flex-col">
                                            <span className="text-[0.5rem] font-black text-slate-600 uppercase tracking-widest">Pontos</span>
                                            <span className="text-xl sm:text-2xl font-black text-white font-outfit leading-none">
                                                {(selectedTeam.stats?.wins || 0) * 3 + (selectedTeam.stats?.draws || 0)}
                                            </span>
                                        </div>
                                        <div className="w-px h-8 bg-white/10 flex-none" />
                                        <div className="flex flex-col">
                                            <span className="text-[0.5rem] font-black text-slate-600 uppercase tracking-widest">Gols</span>
                                            <span className="text-xl sm:text-2xl font-black text-accent font-outfit leading-none">{selectedTeam.stats?.goalsFor || 0}</span>
                                        </div>
                                        <div className="w-px h-8 bg-white/10 flex-none" />
                                        <div className="flex flex-col">
                                            <span className="text-[0.5rem] font-black text-slate-600 uppercase tracking-widest">Atletas</span>
                                            <span className="text-xl sm:text-2xl font-black text-primary font-outfit leading-none">{selectedTeam.players.length}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Player Panel */}
                            <div className="glass-panel p-4 sm:p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-sm font-black flex items-center gap-2 font-outfit uppercase tracking-widest text-slate-300">
                                        <Star size={15} className="text-warning fill-warning/20" />
                                        Elenco Atual
                                        <span className="text-xs font-outfit text-slate-600">({selectedTeam.players.length})</span>
                                    </h2>
                                    <button onClick={() => { setIsAddingPlayer(!isAddingPlayer); setIsEditingPlayer(null); }}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-white font-black text-[0.6rem] uppercase tracking-widest hover:brightness-110 transition-all active:scale-95">
                                        <PlusCircle size={13} strokeWidth={3} /> Adicionar
                                    </button>
                                </div>

                                {/* Player Form */}
                                {(isAddingPlayer || isEditingPlayer) && (
                                    <div className="bg-black/30 p-4 rounded-2xl border border-white/[0.06] mb-4 animate-fade-in">
                                        <form onSubmit={handlePlayerSubmit} className="space-y-3">
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                                                <div className="col-span-2 sm:col-span-2">
                                                    <label className="text-[0.55rem] font-black text-slate-600 uppercase tracking-widest">Nome</label>
                                                    <input className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-accent outline-none mt-1 font-bold placeholder:text-slate-700"
                                                        placeholder="Neymar Jr" value={formPlayer.name} onChange={e => setFormPlayer({ ...formPlayer, name: e.target.value })} required />
                                                </div>
                                                <div>
                                                    <label className="text-[0.55rem] font-black text-slate-600 uppercase tracking-widest">Camisa</label>
                                                    <input type="number" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-accent outline-none mt-1 font-bold"
                                                        value={formPlayer.number} onChange={e => setFormPlayer({ ...formPlayer, number: parseInt(e.target.value) })} required />
                                                </div>
                                                <div>
                                                    <label className="text-[0.55rem] font-black text-slate-600 uppercase tracking-widest">Posição</label>
                                                    <select className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-accent outline-none mt-1 font-bold appearance-none cursor-pointer h-[42px]"
                                                        value={formPlayer.position} onChange={e => setFormPlayer({ ...formPlayer, position: e.target.value })}>
                                                        {['Goleiro', 'Zagueiro', 'Lateral', 'Meia', 'Atacante'].map(p => <option key={p} value={p} className="bg-[#07070a]">{p}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button type="submit" className="flex-1 bg-accent text-white font-black py-2.5 rounded-xl uppercase tracking-widest text-[0.62rem] hover:brightness-110 active:scale-95 transition-all">
                                                    {isEditingPlayer ? 'Salvar' : 'Adicionar'}
                                                </button>
                                                <button type="button" onClick={() => { setIsAddingPlayer(false); setIsEditingPlayer(null); }} className="px-5 border border-white/10 text-slate-500 font-black py-2.5 rounded-xl uppercase text-[0.62rem] hover:bg-white/5 transition-all">X</button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {/* Player List: compact scrollable table */}
                                <div className="overflow-x-auto no-scrollbar -mx-1">
                                    <table className="w-full border-separate border-spacing-y-1.5 min-w-[360px]">
                                        <thead className="text-[0.55rem] font-black text-slate-600 uppercase tracking-[0.15em]">
                                            <tr>
                                                <th className="px-3 py-1 text-left">Nº / Nome</th>
                                                <th className="px-3 py-1 text-center hidden sm:table-cell">Posição</th>
                                                <th className="px-3 py-1 text-center">
                                                    <Target size={11} className="mx-auto text-accent" />
                                                </th>
                                                <th className="px-3 py-1 text-center">Cartões</th>
                                                <th className="px-3 py-1 text-right">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedTeam.players.length === 0 ? (
                                                <tr><td colSpan={5} className="text-center py-10 text-slate-600 font-black text-[0.6rem] uppercase tracking-widest">Sem atletas inscritos.</td></tr>
                                            ) : (
                                                selectedTeam.players.sort((a, b) => a.number - b.number).map(p => (
                                                    <tr key={p.id} className="group bg-white/[0.02] hover:bg-white/[0.05] transition-all rounded-xl">
                                                        <td className="px-3 py-3 first:rounded-l-xl">
                                                            <div className="flex items-center gap-2.5 min-w-[130px]">
                                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black font-outfit border-2 text-xs flex-none ${p.isCaptain ? 'border-warning bg-warning/20 text-warning' : 'border-white/10 bg-white/5 text-slate-400'}`}>
                                                                    {p.number}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <div className="flex items-center gap-1.5 min-w-0">
                                                                        <span className="font-black text-white truncate max-w-[90px] font-outfit uppercase tracking-wide text-xs sm:text-sm">{p.name}</span>
                                                                        {p.isCaptain && <span className="text-[0.45rem] font-black bg-warning text-black px-1 rounded uppercase leading-tight py-0.5 flex-none">CAP</span>}
                                                                    </div>
                                                                    <span className="text-[0.5rem] font-black text-slate-600 uppercase sm:hidden">{p.position}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-3 text-center hidden sm:table-cell">
                                                            <span className="text-[0.6rem] font-black bg-white/5 px-2 py-1 rounded-lg text-slate-500 border border-white/5 uppercase tracking-widest">{p.position}</span>
                                                        </td>
                                                        <td className="px-3 py-3 text-center">
                                                            <span className="font-black text-white font-outfit text-sm sm:text-base">{p.stats?.goals || 0}</span>
                                                        </td>
                                                        <td className="px-3 py-3 text-center">
                                                            <div className="flex items-center justify-center gap-1.5">
                                                                {(p.stats?.yellowCards > 0) && <span className="w-3 h-4 bg-warning rounded-[2px] inline-block shadow-sm" />}
                                                                {(p.stats?.yellowCards > 1) && <span className="w-3 h-4 bg-warning rounded-[2px] inline-block shadow-sm" />}
                                                                {(p.stats?.redCards > 0) && <span className="w-3 h-4 bg-danger rounded-[2px] inline-block shadow-sm" />}
                                                                {(!p.stats?.yellowCards && !p.stats?.redCards) && <span className="text-slate-700 text-[0.6rem]">—</span>}
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-3 text-right last:rounded-r-xl">
                                                            <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                                <button onClick={() => toggleCaptain(selectedTeam.id, p.id)}
                                                                    className={`p-1.5 rounded-lg transition-all ${p.isCaptain ? 'bg-warning/20 text-warning' : 'text-slate-600 hover:text-warning hover:bg-white/5'}`}
                                                                    title="Capitão">
                                                                    <Star size={13} strokeWidth={2} />
                                                                </button>
                                                                <button onClick={() => { setIsEditingPlayer(p.id); setFormPlayer({ name: p.name, number: p.number, position: p.position, isCaptain: p.isCaptain || false }); setIsAddingPlayer(true); }}
                                                                    className="p-1.5 rounded-lg text-slate-600 hover:text-white hover:bg-white/5 transition-all">
                                                                    <Edit2 size={13} />
                                                                </button>
                                                                <button onClick={() => { if (window.confirm('Excluir jogador?')) removePlayer(selectedTeam.id, p.id); }}
                                                                    className="p-1.5 rounded-lg text-danger/50 hover:text-danger hover:bg-danger/10 transition-all">
                                                                    <Trash2 size={13} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </section>
            </div>
        </div>
    );
};

export default TeamsDashboard;
