import { useState } from 'react';
import { useLeague } from '../context/LeagueContext';
import { Shuffle, Shield, Trophy, LayoutGrid, Network, Info, ChevronRight, Check, X } from 'lucide-react';
import TeamLogo from '../components/TeamLogo';

const Bracket = () => {
    const { teams, brackets, generateBracket, updateBracket, generateGroups } = useLeague();
    const [mode, setMode] = useState<'bracket' | 'groups'>('bracket');
    const [generating, setGenerating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editHome, setEditHome] = useState('');
    const [editAway, setEditAway] = useState('');
    const [teamsPerGroup, setTeamsPerGroup] = useState(4);

    const handleGenerateBracket = async () => {
        if (!window.confirm('Isso vai substituir o chaveamento atual. Continuar?')) return;
        setGenerating(true);
        await generateBracket();
        setGenerating(false);
    };

    const handleGenerateGroups = async () => {
        if (!window.confirm('Isso vai sortear todos os times nos grupos. Continuar?')) return;
        setGenerating(true);
        await generateGroups(teamsPerGroup);
        setGenerating(false);
    };

    const saveScore = async (b: any) => {
        await updateBracket(b.id, { homeScore: parseInt(editHome) || 0, awayScore: parseInt(editAway) || 0, status: 'finished' });
        setEditingId(null);
    };

    const getTeam = (id?: string) => teams.find(t => t.id === id);

    const groups: Record<string, typeof teams> = {};
    teams.forEach(t => {
        if (t.group_name) {
            if (!groups[t.group_name]) groups[t.group_name] = [];
            groups[t.group_name].push(t);
        }
    });
    const sortedGroupNames = Object.keys(groups).sort();

    const MatchNode = ({ b }: { b: any }) => {
        const ht = getTeam(b.homeTeamId);
        const at = getTeam(b.awayTeamId);
        const isEdit = editingId === b.id;

        return (
            <div className={`relative group mb-8 last:mb-0 transition-all duration-300 ${b.status === 'finished' ? 'opacity-90' : 'opacity-100 hover:scale-[1.02]'}`}>
                <div onClick={() => { setEditingId(b.id); setEditHome(String(b.homeScore)); setEditAway(String(b.awayScore)); }}
                    className={`w-64 bg-white/3 border ${b.status === 'finished' ? 'border-primary/30 shadow-lg shadow-primary/10' : 'border-white/5 shadow-xl'} rounded-2xl overflow-hidden cursor-pointer backdrop-blur-md`}>

                    <div className={`flex items-center gap-3 p-3 transition-colors ${b.status === 'finished' && b.homeScore > b.awayScore ? 'bg-primary/20 text-white' : 'hover:bg-white/5'}`}>
                        <TeamLogo src={ht?.logo} size={28} />
                        <span className={`flex-1 font-outfit font-black text-[0.7rem] uppercase tracking-wider truncate ${ht ? 'text-white' : 'text-slate-600 italic'}`}>
                            {ht?.name || 'A definir'}
                        </span>
                        <div className={`w-8 h-8 flex items-center justify-center font-black rounded-lg ${b.status === 'finished' && b.homeScore > b.awayScore ? 'bg-primary text-white shadow-lg' : 'bg-black/40 text-slate-400'}`}>
                            {b.status !== 'scheduled' ? b.homeScore : '-'}
                        </div>
                    </div>

                    <div className="h-px bg-white/5" />

                    <div className={`flex items-center gap-3 p-3 transition-colors ${b.status === 'finished' && b.awayScore > b.homeScore ? 'bg-primary/20 text-white' : 'hover:bg-white/5'}`}>
                        <TeamLogo src={at?.logo} size={28} />
                        <span className={`flex-1 font-outfit font-black text-[0.7rem] uppercase tracking-wider truncate ${at ? 'text-white' : 'text-slate-600 italic'}`}>
                            {at?.name || 'A definir'}
                        </span>
                        <div className={`w-8 h-8 flex items-center justify-center font-black rounded-lg ${b.status === 'finished' && b.awayScore > b.homeScore ? 'bg-primary text-white shadow-lg' : 'bg-black/40 text-slate-400'}`}>
                            {b.status !== 'scheduled' ? b.awayScore : '-'}
                        </div>
                    </div>
                </div>

                {isEdit && (
                    <div className="absolute top-0 left-full ml-3 z-50 bg-[#15151e] border border-primary/50 p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-slide-left min-w-[220px]" onClick={e => e.stopPropagation()}>
                        <div className="flex flex-col gap-2">
                            <span className="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest ml-1">Resultado</span>
                            <div className="flex items-center gap-2">
                                <input type="number" value={editHome} onChange={e => setEditHome(e.target.value)} className="w-14 bg-black/40 border border-white/10 rounded-xl px-2 py-3 text-white text-center font-black h-12" />
                                <span className="text-slate-600 font-bold">X</span>
                                <input type="number" value={editAway} onChange={e => setEditAway(e.target.value)} className="w-14 bg-black/40 border border-white/10 rounded-xl px-2 py-3 text-white text-center font-black h-12" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 pt-5">
                            <button onClick={() => saveScore(b)} className="p-3 bg-primary text-white rounded-xl shadow-lg hover:brightness-110 active:scale-90 transition-all">
                                <Check size={20} strokeWidth={3} />
                            </button>
                        </div>
                        <button onClick={() => setEditingId(null)} className="absolute -top-2 -right-2 bg-black border border-white/10 text-slate-500 p-1.5 rounded-full hover:text-white transition-all shadow-lg">
                            <X size={12} strokeWidth={3} />
                        </button>
                    </div>
                )}
            </div>
        );
    };

    const renderSideVertical = () => {
        const rounds = ['oitavas', 'quartas', 'semifinal', 'final'];
        return (
            <div className="flex gap-16 md:gap-24 overflow-x-auto pb-12 pt-4 px-4 no-scrollbar min-h-[600px] items-center">
                {rounds.map(r => {
                    const matches = brackets.filter(b => b.round === r);
                    if (matches.length === 0) return null;
                    return (
                        <div key={r} className="flex flex-col gap-12 flex-none">
                            <div className="flex flex-col items-center">
                                <h3 className="text-[0.65rem] font-black text-slate-500 uppercase tracking-[0.3em] mb-8 bg-white/5 px-4 py-1.5 rounded-full border border-white/5 shadow-inner">
                                    {r}
                                </h3>
                                <div className="flex flex-col justify-around gap-12">
                                    {matches.map(m => (
                                        <div key={m.id} className="relative flex items-center">
                                            <MatchNode b={m} />
                                            {r !== 'final' && (
                                                <div className="absolute left-[calc(100%+8px)] w-16 h-px bg-white/10 -z-10" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
                {/* Winner Spotlight */}
                <div className="flex-none flex flex-col items-center gap-6 px-12 group">
                    <div className="relative">
                        <div className="absolute inset-0 bg-warning/20 blur-3xl rounded-full group-hover:bg-warning/40 transition-all duration-1000" />
                        <div className="relative w-32 h-32 rounded-3xl bg-gradient-to-br from-warning to-orange-500 flex items-center justify-center shadow-[0_15px_50px_rgba(234,179,8,0.4)] border border-white/20 transform rotate-12 group-hover:rotate-0 transition-transform duration-700">
                            <Trophy size={64} className="text-white drop-shadow-lg" strokeWidth={2.5} />
                        </div>
                    </div>
                    <div className="text-center">
                        <h4 className="text-xl font-outfit font-black text-warning uppercase tracking-widest bg-black/40 px-6 py-2 rounded-2xl border border-warning/20 inline-block shadow-2xl">
                            Campeão
                        </h4>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="animate-fade-in pb-24 md:pb-8 p-4 md:p-0">
            {/* Mode Switcher Tool Bar */}
            <div className="glass-panel p-2 flex gap-2 mb-10 w-fit mx-auto sm:mx-0 shadow-2xl">
                <button onClick={() => setMode('bracket')}
                    className={`px-8 py-3 rounded-xl font-black text-[0.65rem] uppercase tracking-widest transition-all flex items-center gap-3 ${mode === 'bracket' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-white hover:bg-white/5'
                        }`}>
                    <Network size={16} /> Eliminatórias
                </button>
                <button onClick={() => setMode('groups')}
                    className={`px-8 py-3 rounded-xl font-black text-[0.65rem] uppercase tracking-widest transition-all flex items-center gap-3 ${mode === 'groups' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-slate-500 hover:text-white hover:bg-white/5'
                        }`}>
                    <LayoutGrid size={16} /> Fase de Grupos
                </button>
            </div>

            {mode === 'bracket' ? (
                <>
                    <header className="mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-center md:text-left">
                            <h1 className="text-3xl md:text-5xl font-outfit font-extrabold tracking-tight mb-2 uppercase flex items-center justify-center md:justify-start gap-4">
                                <Trophy size={42} className="text-warning" />
                                Copa Mata-Mata
                            </h1>
                            <p className="text-slate-400 font-medium md:text-lg flex items-center justify-center md:justify-start gap-2">
                                <Info size={18} className="text-primary" />
                                Chaveamento gerado automaticamente via algoritmo de torneioss
                            </p>
                        </div>
                        <button onClick={handleGenerateBracket} disabled={generating}
                            className="px-10 py-4 bg-primary text-white font-black rounded-2xl shadow-[0_10px_30px_rgba(109,40,217,0.3)] hover:brightness-110 active:scale-95 transition-all uppercase tracking-[0.15em] text-xs flex items-center gap-4">
                            <Shuffle size={20} className={generating ? 'animate-spin' : ''} /> {generating ? 'Gerando...' : 'Sortear Chaveamento'}
                        </button>
                    </header>

                    <div className="glass-panel p-0 md:p-10 overflow-hidden relative shadow-[0_20px_60px_rgba(0,0,0,0.5)] bg-slate-900/40">
                        {brackets.length === 0 ? (
                            <div className="py-24 text-center opacity-40 flex flex-col items-center justify-center gap-6">
                                <Network size={80} strokeWidth={1} />
                                <h3 className="font-outfit font-black uppercase tracking-widest">Aguardando sorteio das chaves</h3>
                            </div>
                        ) : (
                            <div className="relative">
                                {renderSideVertical()}
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <>
                    <header className="mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-center md:text-left">
                            <h1 className="text-3xl md:text-5xl font-outfit font-extrabold tracking-tight mb-2 uppercase flex items-center justify-center md:justify-start gap-4">
                                <LayoutGrid size={42} className="text-accent" />
                                Fase de Grupos
                            </h1>
                            <p className="text-slate-400 font-medium md:text-lg">Sorteio equilibrado de equipes divididas em potes.</p>
                        </div>
                        <div className="flex items-center gap-4 bg-black/40 p-4 rounded-3xl border border-white/5 shadow-2xl">
                            <div className="flex flex-col gap-1.5 px-4 h-[60px] justify-center">
                                <span className="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest pl-1">Equipes / Grupo</span>
                                <input type="number" min="2" max="10" value={teamsPerGroup} onChange={e => setTeamsPerGroup(parseInt(e.target.value))}
                                    className="w-full bg-transparent border-none text-white font-black font-outfit text-2xl outline-none focus:text-accent transition-colors" />
                            </div>
                            <button onClick={handleGenerateGroups} disabled={generating}
                                className="h-[60px] px-8 bg-accent text-white font-black rounded-2xl shadow-lg hover:brightness-110 active:scale-95 transition-all uppercase tracking-widest text-xs flex items-center gap-3">
                                <Shuffle size={18} className={generating ? 'animate-spin' : ''} /> {generating ? 'Sorteando...' : 'Sorteio Realtime'}
                            </button>
                        </div>
                    </header>

                    {sortedGroupNames.length === 0 ? (
                        <div className="glass-panel py-24 text-center opacity-40 flex flex-col items-center justify-center gap-6">
                            <Users size={80} strokeWidth={1} />
                            <h3 className="font-outfit font-black uppercase tracking-widest">Nenhum grupo formado ainda</h3>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {sortedGroupNames.map((gn, gridIdx) => (
                                <div key={gn} className="glass-panel p-0 overflow-hidden shadow-2xl transition-all hover:scale-[1.02] border-t-4 border-t-accent animate-scale-in" style={{ animationDelay: `${gridIdx * 0.1}s` }}>
                                    <div className="bg-accent/10 md:bg-accent/5 p-6 border-b border-white/5 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[0.6rem] font-black text-accent uppercase tracking-[0.2em] mb-1">Pote Classificador</span>
                                            <h3 className="text-2xl font-outfit font-black text-white uppercase tracking-tight leading-none">Grupo {gn}</h3>
                                        </div>
                                        <div className="w-10 h-10 bg-accent text-white flex items-center justify-center rounded-xl font-black font-outfit text-lg shadow-lg">
                                            {gn}
                                        </div>
                                    </div>
                                    <div className="p-4 space-y-2">
                                        {groups[gn].map((t, idx) => (
                                            <div key={t.id} className="flex items-center gap-4 p-3.5 rounded-xl bg-white/3 border border-white/5 hover:bg-white/5 transition-all group">
                                                <div className="relative">
                                                    <TeamLogo src={t.logo} size={36} />
                                                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-black/60 flex items-center justify-center text-[0.55rem] font-bold text-slate-400 group-hover:text-white transition-colors">
                                                        {idx + 1}
                                                    </div>
                                                </div>
                                                <span className="font-outfit font-black text-white uppercase text-sm tracking-wide truncate flex-1 group-hover:translate-x-1 transition-transform">
                                                    {t.name}
                                                </span>
                                                <ChevronRight size={14} className="text-slate-800 group-hover:text-accent transition-colors" />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bg-black/20 p-4 border-t border-white/5 text-center">
                                        <span className="text-[0.55rem] font-black text-slate-600 uppercase tracking-widest italic flex items-center justify-center gap-2">
                                            <Shield size={10} /> Qualificados: Top 2
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Bracket;
