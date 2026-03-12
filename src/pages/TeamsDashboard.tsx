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
            <header className="mb-8 md:mb-12">
                <h1 className="text-3xl md:text-5xl font-outfit font-extrabold tracking-tight mb-2 uppercase">Gestão de Times</h1>
                <p className="text-slate-400 font-medium md:text-lg">Controle elencos, estatísticas e identidades visuais</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
                {/* Team Selector / List */}
                <section className="lg:col-span-12 xl:col-span-4 glass-panel p-6 md:p-8 flex flex-col h-full overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold flex items-center gap-3 font-outfit uppercase tracking-wider">
                            <Users size={22} className="text-primary" /> Clubes
                        </h2>
                        <button onClick={() => { setIsAddingTeam(!isAddingTeam); setIsEditingTeam(null); }}
                            className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-lg active:scale-95">
                            <PlusCircle size={22} />
                        </button>
                    </div>

                    {isAddingTeam || isEditingTeam ? (
                        <div className="bg-black/20 p-5 rounded-2xl border border-white/5 mb-6 animate-slide-up">
                            <form onSubmit={handleTeamSubmit} className="flex flex-col gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest ml-1">Nome do Time</label>
                                    <input className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-all placeholder:text-slate-600"
                                        placeholder="Ex: Flamengo" value={formTeam.name} onChange={e => setFormTeam({ ...formTeam, name: e.target.value })} required />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest ml-1">Logo URL (Opcional)</label>
                                    <input className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-all placeholder:text-slate-600"
                                        placeholder="https://..." value={formTeam.logo} onChange={e => setFormTeam({ ...formTeam, logo: e.target.value })} />
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3 mt-2">
                                    <button type="submit" className="flex-1 bg-primary text-white font-black py-3 rounded-xl uppercase tracking-widest text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all">
                                        {isEditingTeam ? 'Salvar' : 'Confirmar'}
                                    </button>
                                    <button type="button" onClick={() => { setIsAddingTeam(false); setIsEditingTeam(null); }} className="flex-1 border border-white/10 text-slate-400 font-black py-3 rounded-xl uppercase tracking-widest text-xs hover:bg-white/5 transition-all">
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : null}

                    <div className="flex flex-col gap-3 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                        {teams.length === 0 ? (
                            <p className="text-slate-500 text-center py-12 font-medium opacity-50 font-outfit uppercase text-xs tracking-widest">Nenhum time cadastrado.</p>
                        ) : (
                            teams.map(team => (
                                <div key={team.id} onClick={() => setSelectedTeamId(team.id)}
                                    className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300 border ${selectedTeamId === team.id
                                        ? 'bg-primary/10 border-primary/30 shadow-[0_4px_24px_rgba(109,40,217,0.1)]'
                                        : 'bg-white/3 border-white/5 hover:bg-white/5'
                                        }`}>
                                    <TeamLogo src={team.logo} size={44} />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-black text-white truncate font-outfit uppercase tracking-wide leading-tight">{team.name}</h3>
                                        <p className="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest mt-1">{team.players.length} Atletas</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button onClick={(e) => { e.stopPropagation(); setIsEditingTeam(team.id); setFormTeam({ name: team.name, logo: team.logo }); }}
                                            className="p-2.5 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-all outline-none">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); if (window.confirm('Excluir time?')) deleteTeam(team.id); }}
                                            className="p-2.5 rounded-xl text-danger/50 hover:text-danger hover:bg-danger/10 transition-all outline-none">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* Team Details & Players */}
                <section className="lg:col-span-12 xl:col-span-8 space-y-6 md:space-y-8">
                    {!selectedTeam ? (
                        <div className="glass-panel p-20 flex flex-col items-center justify-center text-center opacity-50 gap-5">
                            <TrendingUp size={64} strokeWidth={1} />
                            <p className="font-outfit uppercase font-black text-xs tracking-[0.2em] text-slate-500">Selecione um clube para gerenciar atletas</p>
                        </div>
                    ) : (
                        <>
                            {/* Team Header Summary */}
                            <div className="glass-panel p-6 md:p-10 flex flex-col md:flex-row items-center gap-6 md:gap-10 border-b-4 border-b-primary shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/30 transition-all" />
                                    <TeamLogo src={selectedTeam.logo} size={120} />
                                </div>
                                <div className="text-center md:text-left flex-1 min-w-0">
                                    <h2 className="text-4xl md:text-6xl font-black text-white font-outfit uppercase tracking-tight mb-2 truncate leading-tight">{selectedTeam.name}</h2>
                                    <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-6 mt-4">
                                        <div className="flex flex-col">
                                            <span className="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest font-inter">Pontos</span>
                                            <span className="text-2xl font-black text-white font-outfit">{(selectedTeam.stats?.wins || 0) * 3 + (selectedTeam.stats?.draws || 0)}</span>
                                        </div>
                                        <div className="w-px h-10 bg-white/10 hidden sm:block self-center" />
                                        <div className="flex flex-col">
                                            <span className="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest font-inter">Gols Pró</span>
                                            <span className="text-2xl font-black text-accent font-outfit">{selectedTeam.stats?.goalsFor || 0}</span>
                                        </div>
                                        <div className="w-px h-10 bg-white/10 hidden sm:block self-center" />
                                        <div className="flex flex-col">
                                            <span className="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest font-inter">Jogadores</span>
                                            <span className="text-2xl font-black text-primary font-outfit">{selectedTeam.players.length}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Player Addition Form */}
                            <div className="glass-panel p-6 md:p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-xl font-bold flex items-center gap-3 font-outfit uppercase tracking-wider">
                                        <Star size={22} className="text-warning fill-warning/20" /> Elenco Atual
                                    </h2>
                                    <button onClick={() => { setIsAddingPlayer(!isAddingPlayer); setIsEditingPlayer(null); }}
                                        className="px-6 py-2.5 rounded-xl bg-accent text-white font-black text-[0.65rem] uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-2 shadow-lg active:scale-95">
                                        <PlusCircle size={14} strokeWidth={3} /> Adicionar Atleta
                                    </button>
                                </div>

                                {isAddingPlayer || isEditingPlayer ? (
                                    <div className="bg-black/20 p-6 rounded-2xl border border-white/5 mb-8 animate-slide-up">
                                        <form onSubmit={handlePlayerSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-end">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest ml-1">Nome</label>
                                                <input className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-accent outline-none transition-all placeholder:text-slate-600 font-bold"
                                                    placeholder="Ex: Neymar Jr" value={formPlayer.name} onChange={e => setFormPlayer({ ...formPlayer, name: e.target.value })} required />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest ml-1">Camisa</label>
                                                <input type="number" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-accent outline-none transition-all font-bold"
                                                    value={formPlayer.number} onChange={e => setFormPlayer({ ...formPlayer, number: parseInt(e.target.value) })} required />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest ml-1">Posição</label>
                                                <select className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-accent outline-none transition-all font-bold appearance-none cursor-pointer"
                                                    value={formPlayer.position} onChange={e => setFormPlayer({ ...formPlayer, position: e.target.value })}>
                                                    {['Goleiro', 'Zagueiro', 'Lateral', 'Meia', 'Atacante'].map(p => <option key={p} value={p} className="bg-bg-dark">{p}</option>)}
                                                </select>
                                            </div>
                                            <div className="flex gap-2">
                                                <button type="submit" className="flex-1 bg-accent text-white font-black py-3 rounded-xl uppercase tracking-widest text-[0.65rem] shadow-lg hover:brightness-110 active:scale-95 transition-all">
                                                    Salvar
                                                </button>
                                                <button type="button" onClick={() => { setIsAddingPlayer(false); setIsEditingPlayer(null); }} className="px-5 border border-white/10 text-slate-400 font-black py-3 rounded-xl uppercase tracking-widest text-[0.65rem] hover:bg-white/5 transition-all">
                                                    X
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                ) : null}

                                <div className="overflow-x-auto no-scrollbar -mx-2">
                                    <table className="w-full border-separate border-spacing-y-3">
                                        <thead className="text-[0.65rem] font-black text-slate-500 uppercase tracking-[0.2em] font-outfit">
                                            <tr>
                                                <th className="px-5 py-2 text-left">Nº / NOME</th>
                                                <th className="px-5 py-2 text-center">POSIÇÃO</th>
                                                <th className="px-5 py-2 text-center">GOLS</th>
                                                <th className="px-5 py-2 text-center">CARTÕES</th>
                                                <th className="px-5 py-2 text-right">AÇÕES</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm">
                                            {selectedTeam.players.length === 0 ? (
                                                <tr><td colSpan={5} className="text-center py-12 text-slate-600 font-medium uppercase text-[0.65rem] tracking-widest">Inicie o recrutamento de atletas.</td></tr>
                                            ) : (
                                                selectedTeam.players.sort((a, b) => a.number - b.number).map(p => (
                                                    <tr key={p.id} className="group bg-white/3 hover:bg-white/5 transition-all duration-300 rounded-2xl">
                                                        <td className="px-5 py-4 first:rounded-l-2xl">
                                                            <div className="flex items-center gap-4 min-w-[140px]">
                                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black font-outfit border-2 ${p.isCaptain ? 'border-warning bg-warning/20 text-warning' : 'border-white/10 bg-white/5 text-slate-300'}`}>
                                                                    {p.number}
                                                                </div>
                                                                <div className="flex flex-col min-w-0">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-black text-white truncate max-w-[120px] font-outfit uppercase tracking-wide">{p.name}</span>
                                                                        {p.isCaptain && <span className="text-[0.55rem] font-black bg-warning text-black px-1.5 rounded uppercase leading-tight py-0.5 tracking-tighter">CAP</span>}
                                                                    </div>
                                                                    <button onClick={() => toggleCaptain(selectedTeam.id, p.id)}
                                                                        className="text-[0.6rem] font-black text-slate-500 hover:text-warning uppercase text-left transition-colors tracking-widest">
                                                                        {p.isCaptain ? 'Remover braçadeira' : 'Nomear Capitão ★'}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-4 text-center">
                                                            <span className="text-[0.65rem] font-black bg-white/5 px-2.5 py-1.5 rounded-lg text-slate-400 border border-white/5 uppercase tracking-widest">{p.position}</span>
                                                        </td>
                                                        <td className="px-5 py-4 text-center">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <Target size={14} className="text-accent" />
                                                                <span className="font-black text-white font-outfit text-lg">{p.stats?.goals || 0}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-4 text-center">
                                                            <div className="flex items-center justify-center gap-3">
                                                                {p.stats?.yellowCards > 0 && <span className="bg-warning w-3.5 h-4.5 rounded-[2px] shadow-lg flex items-center justify-center text-[0.6rem] font-black text-black leading-none">{p.stats.yellowCards}</span>}
                                                                {p.stats?.redCards > 0 && <span className="bg-danger w-3.5 h-4.5 rounded-[2px] shadow-lg flex items-center justify-center text-[0.6rem] font-black text-white leading-none">{p.stats.redCards}</span>}
                                                                {(!p.stats?.yellowCards && !p.stats?.redCards) && <span className="text-slate-700 italic text-[0.65rem]">Limpo</span>}
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-4 text-right last:rounded-r-2xl">
                                                            <div className="flex items-center justify-end gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button onClick={() => { setIsEditingPlayer(p.id); setFormPlayer({ name: p.name, number: p.number, position: p.position, isCaptain: p.isCaptain || false }); }}
                                                                    className="p-2.5 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-all">
                                                                    <Edit2 size={16} />
                                                                </button>
                                                                <button onClick={() => { if (window.confirm('Excluir jogador?')) removePlayer(selectedTeam.id, p.id); }}
                                                                    className="p-2.5 rounded-xl text-danger/50 hover:text-danger hover:bg-danger/10 transition-all">
                                                                    <Trash2 size={16} />
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
