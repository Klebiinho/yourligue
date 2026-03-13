import { useState } from 'react';
import { useLeague } from '../context/LeagueContext';
import { useAuth } from '../context/AuthContext';
import { Settings as SettingsIcon, Save, Image as ImageIcon, LogOut, Trophy, User, Users, ArrowLeftRight, Clock, Target, ShieldCheck, Mail, Fingerprint, Share2, Copy, CheckCircle2 } from 'lucide-react';
import TeamLogo from '../components/TeamLogo';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
    const { league, updateLeague, isAdmin } = useLeague();
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState(league?.name ?? '');
    const [logo, setLogo] = useState(league?.logo ?? '');
    const [maxTeams, setMaxTeams] = useState(String(league?.maxTeams ?? 16));
    const [pointsForWin, setPointsForWin] = useState(String(league?.pointsForWin ?? 3));
    const [pointsForDraw, setPointsForDraw] = useState(String(league?.pointsForDraw ?? 1));
    const [pointsForLoss, setPointsForLoss] = useState(String(league?.pointsForLoss ?? 0));
    const [halfLength, setHalfLength] = useState(String(league?.defaultHalfLength ?? 45));
    const [playersPerTeam, setPlayersPerTeam] = useState(String(league?.playersPerTeam ?? 5));
    const [reserveLimit, setReserveLimit] = useState(String(league?.reserveLimitPerTeam ?? 5));
    const [substitutionsLimit, setSubstitutionsLimit] = useState(String(league?.substitutionsLimit ?? 5));
    const [saved, setSaved] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) { const r = new FileReader(); r.onloadend = () => setLogo(r.result as string); r.readAsDataURL(file); }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateLeague({
            name, logo, maxTeams: parseInt(maxTeams) || 16,
            pointsForWin: parseInt(pointsForWin) || 3,
            pointsForDraw: parseInt(pointsForDraw) || 1,
            pointsForLoss: parseInt(pointsForLoss) || 0,
            defaultHalfLength: parseInt(halfLength) || 45,
            playersPerTeam: parseInt(playersPerTeam) || 5,
            reserveLimitPerTeam: parseInt(reserveLimit) || 5,
            substitutionsLimit: parseInt(substitutionsLimit) || 5
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const handleCopyLink = () => {
        if (!league) return;
        const link = `${window.location.origin}/view/${league.slug || league.id}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    const handleSwitchLeague = () => navigate('/leagues');

    return (
        <div className="animate-fade-in pb-24 md:pb-8 p-4 md:p-0">
            <header className="mb-8 md:mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                    <h1 className="text-3xl md:text-5xl font-outfit font-extrabold tracking-tight mb-2 uppercase flex items-center justify-center md:justify-start gap-4">
                        <SettingsIcon size={42} className="text-primary drop-shadow-[0_0_15px_rgba(109,40,217,0.3)]" strokeWidth={2.5} />
                        Configurações
                    </h1>
                    <p className="text-slate-400 font-medium md:text-lg">Personalize sua experiência na liga <span className="text-white font-bold">{league?.name}</span></p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handleSwitchLeague}
                        className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 font-black text-[0.65rem] uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all flex items-center gap-3 active:scale-95 shadow-lg">
                        <ArrowLeftRight size={16} strokeWidth={3} /> Alternar Liga
                    </button>
                    <button onClick={handleSignOut}
                        className="px-6 py-3 rounded-xl bg-danger/10 border border-danger/20 text-danger font-black text-[0.65rem] uppercase tracking-widest hover:bg-danger hover:text-white transition-all flex items-center gap-3 active:scale-95 shadow-lg">
                        <LogOut size={16} strokeWidth={3} /> Logout
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Form Section */}
                {isAdmin ? (
                    <section className="lg:col-span-12 xl:col-span-8 glass-panel p-6 md:p-10">
                        <h2 className="text-xl font-black text-white font-outfit uppercase tracking-widest mb-10 flex items-center gap-3 border-b border-white/5 pb-6">
                            <Trophy size={24} className="text-primary" /> Parâmetros da Competição
                        </h2>

                        <form onSubmit={handleSave} className="space-y-10">
                            {/* League Identity */}
                            <div className="flex flex-col md:flex-row items-center gap-8 bg-black/20 p-8 rounded-3xl border border-white/5 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                                    <ImageIcon size={140} strokeWidth={1} />
                                </div>
                                <div className="relative">
                                    <TeamLogo src={logo} size={120} />
                                    <label className="absolute -bottom-2 -right-2 bg-primary text-white p-3 rounded-2xl shadow-xl border-4 border-bg-dark cursor-pointer hover:scale-110 active:scale-90 transition-all">
                                        <ImageIcon size={20} strokeWidth={2.5} />
                                        <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
                                    </label>
                                </div>
                                <div className="flex-1 space-y-4 w-full">
                                    <div className="space-y-2">
                                        <label className="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest ml-1">Nome Oficial da Liga</label>
                                        <input type="text" value={name} onChange={e => setName(e.target.value)} required
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white font-black text-xl outline-none focus:border-primary transition-all placeholder:text-slate-700 h-16"
                                        />
                                    </div>
                                    <p className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest italic ml-1">
                                        <span className="text-primary">Dica:</span> Use nomes curtos e impactantes para o dashboard.
                                    </p>
                                </div>
                            </div>

                            {/* General Configs */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest ml-1">Capacidade de Equipes</label>
                                    <div className="relative">
                                        <ShieldCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                                        <input type="number" value={maxTeams} onChange={e => setMaxTeams(e.target.value)} min={2} max={64} required
                                            className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white font-bold outline-none focus:border-primary transition-colors h-14"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest ml-1">Duração dos Tempos (min)</label>
                                    <div className="relative">
                                        <Clock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-accent" />
                                        <input type="number" value={halfLength} onChange={e => setHalfLength(e.target.value)} required min={1} max={90}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white font-bold outline-none focus:border-accent transition-colors h-14"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Squad Size Configs */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest ml-1">Jogadores Titulares (por time)</label>
                                    <div className="relative">
                                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                                        <input type="number" value={playersPerTeam} onChange={e => setPlayersPerTeam(e.target.value)} min={1} max={11} required
                                            className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white font-bold outline-none focus:border-primary transition-colors h-14"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest ml-1">Limite de Reservas (por time)</label>
                                    <div className="relative">
                                        <Users size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-accent" />
                                        <input type="number" value={reserveLimit} onChange={e => setReserveLimit(e.target.value)} required min={0} max={20}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white font-bold outline-none focus:border-accent transition-colors h-14"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Substitutions Config */}
                            <div className="grid grid-cols-1 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest ml-1">Substituições Permitidas (por jogo/time)</label>
                                    <div className="relative">
                                        <ArrowLeftRight size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                                        <input type="number" value={substitutionsLimit} onChange={e => setSubstitutionsLimit(e.target.value)} required min={0} max={50}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white font-bold outline-none focus:border-primary transition-colors h-14"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Point System */}
                            <div className="space-y-6 bg-black/10 p-8 rounded-3xl border border-white/5">
                                <h3 className="text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Target size={14} className="text-primary" /> Sistema de Pontuação (Draft)
                                </h3>
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[0.55rem] font-black text-slate-600 uppercase tracking-widest ml-1">Vitória</label>
                                        <input type="number" value={pointsForWin} onChange={e => setPointsForWin(e.target.value)} required min={0}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-black text-center text-lg outline-none focus:bg-primary/20 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[0.55rem] font-black text-slate-600 uppercase tracking-widest ml-1">Empate</label>
                                        <input type="number" value={pointsForDraw} onChange={e => setPointsForDraw(e.target.value)} required min={0}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-black text-center text-lg outline-none focus:bg-white/10 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[0.55rem] font-black text-slate-600 uppercase tracking-widest ml-1">Derrota</label>
                                        <input type="number" value={pointsForLoss} onChange={e => setPointsForLoss(e.target.value)} required min={0}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-black text-center text-lg outline-none focus:bg-danger/20 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button type="submit"
                                className={`w-full py-5 rounded-2xl font-black text-[0.8rem] uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-4 active:scale-[0.98] ${saved ? 'bg-accent text-white animate-scale-in' : 'bg-primary text-white hover:brightness-110 shadow-primary/20'
                                    }`}>
                                {saved ? <><ShieldCheck size={22} strokeWidth={3} /> Configurações Atualizadas!</> : <><Save size={22} strokeWidth={3} /> Salvar Alterações</>}
                            </button>
                        </form>
                    </section>
                ) : (
                    <section className="lg:col-span-12 xl:col-span-8 glass-panel p-10 flex flex-col items-center justify-center text-center opacity-50">
                        <ShieldCheck size={64} className="mb-4 text-slate-600" />
                        <h2 className="text-xl font-black uppercase tracking-widest">Acesso Restrito</h2>
                        <p className="text-sm mt-2">Apenas o criador da liga pode gerenciar estas configurações.</p>
                    </section>
                )}

                {/* Right Column: User Data */}
                <section className="lg:col-span-12 xl:col-span-4 space-y-8">
                    <div className="glass-panel p-8">
                        <h2 className="text-xl font-black text-white font-outfit uppercase tracking-widest mb-8 flex items-center gap-3">
                            <User size={22} className="text-accent" /> Perfil Administrador
                        </h2>

                        <div className="space-y-6">
                            <div className="p-6 rounded-2xl bg-black/40 border border-white/5 flex items-start gap-4 transition-all hover:bg-black/60">
                                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary flex-none">
                                    <User size={24} strokeWidth={2.5} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest">Nome do Gestor</span>
                                    <p className="text-white font-black truncate text-base leading-tight mt-1">{user?.user_metadata?.name || 'Administrador Master'}</p>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl bg-black/40 border border-white/5 flex items-start gap-4 transition-all hover:bg-black/60">
                                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center text-accent flex-none">
                                    <Mail size={24} strokeWidth={2.5} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest">Email de Acesso</span>
                                    <p className="text-white font-black truncate text-sm leading-tight mt-1">{user?.email}</p>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl bg-black/40 border border-white/5 flex flex-col gap-2 transition-all group">
                                <div className="flex items-center gap-3">
                                    <Fingerprint size={16} className="text-slate-600 group-hover:text-primary transition-colors" />
                                    <span className="text-[0.6rem] font-black text-slate-600 uppercase tracking-widest">ID do Sistema</span>
                                </div>
                                <p className="font-mono text-[0.65rem] text-slate-500 break-all select-all hover:text-white transition-colors">{user?.id}</p>
                            </div>
                        </div>

                        <div className="mt-10 p-6 rounded-2xl bg-primary/5 border border-primary/20 text-center">
                            <p className="text-[0.65rem] font-black text-primary uppercase tracking-[0.2em] transition-all group-hover:tracking-widest">
                                Versão 2.4.0-PRO • Tailwind UI
                            </p>
                        </div>
                    </div>

                    {/* Share League */}
                    <div className="glass-panel p-8 bg-black/40 border border-primary/20 relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                            <Share2 size={160} />
                        </div>
                        <h2 className="text-xl font-black text-white font-outfit uppercase tracking-widest mb-4 flex items-center gap-3">
                            <Share2 size={22} className="text-primary" /> Compartilhar Liga
                        </h2>
                        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                            Gere um link de acesso público para que torcedores e jogadores possam acompanhar a tabela, artilharia e resultados em tempo real, sem precisar de senha.
                        </p>
                        <div className="flex gap-2">
                            <div className="flex-1 bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-slate-400 font-mono text-xs truncate flex items-center">
                                {window.location.origin}/view/{league?.slug || league?.id}
                            </div>
                            <button
                                onClick={handleCopyLink}
                                className={`px-6 py-3 rounded-xl font-black text-[0.65rem] uppercase tracking-widest transition-all flex items-center gap-2 active:scale-95 whitespace-nowrap ${copied ? 'bg-accent text-white' : 'bg-primary text-white hover:brightness-110'
                                    }`}
                            >
                                {copied ? <><CheckCircle2 size={14} /> Copiado!</> : <><Copy size={14} /> Copiar Link</>}
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Settings;
