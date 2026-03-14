import { useState } from 'react';
import { useLeague } from '../context/LeagueContext';
import { useAuth } from '../context/AuthContext';
import TeamLogo from '../components/TeamLogo';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, Save, Image as ImageIcon, LogOut, Trophy, User, Users, ArrowLeftRight, Clock, Target, ShieldCheck, Mail, Fingerprint, Share2, Copy, CheckCircle2, Megaphone, Plus, Trash2, Video, Layout, Monitor, X, Check, Edit2, Smartphone } from 'lucide-react';

const AD_POSITIONS = [
    { id: 'top', label: 'Topo da Página' },
    { id: 'home_stats', label: 'Home (Cards)' },
    { id: 'teams_list', label: 'Times (Lista)' },
    { id: 'matches_filter', label: 'Partidas (Filtro)' },
    { id: 'live_top', label: 'Ao Vivo (Topo)' },
    { id: 'standings_info', label: 'Tabela (Fundo)' },
    { id: 'panel_stats', label: 'Painel (Stats)' },
    { id: 'side', label: 'Lateral (Barra)' },
    { id: 'halftime', label: 'Intervalo Jogo' },
    { id: 'overlay', label: 'Overlay Vídeo' },
];

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

    // Ads Management State
    const { ads, addAd, updateAd, deleteAd } = useLeague();
    const [isAddingAd, setIsAddingAd] = useState(false);
    const [formAd, setFormAd] = useState({
        title: '',
        desktop_media_url: '',
        mobile_media_url: '',
        media_type: 'image' as 'image' | 'video' | 'gif',
        positions: [] as string[],
        object_position: 'center' as 'center' | 'top' | 'bottom',
        link_url: '',
        duration: 5
    });
    const [adInputMethod, setAdInputMethod] = useState<'file' | 'url'>('file');
    const [selectedAds, setSelectedAds] = useState<string[]>([]);
    const [editingAdId, setEditingAdId] = useState<string | null>(null);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) { const r = new FileReader(); r.onloadend = () => setLogo(r.result as string); r.readAsDataURL(file); }
    };

    const handleAdMediaFile = (e: React.ChangeEvent<HTMLInputElement>, target: 'desktop' | 'mobile') => {
        const file = e.target.files?.[0];
        if (file) {
            const type = file.type.startsWith('video/') ? 'video' : file.type === 'image/gif' ? 'gif' : 'image';
            const r = new FileReader();
            r.onloadend = () => setFormAd(prev => ({
                ...prev,
                [target === 'desktop' ? 'desktop_media_url' : 'mobile_media_url']: r.result as string,
                media_type: type as any
            }));
            r.readAsDataURL(file);
        }
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
        const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
        const link = `${baseUrl}/view/${league.slug || league.id}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    const handleAdSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formAd.positions.length === 0) {
            alert('Selecione ao menos um posicionamento para a propaganda.');
            return;
        }

        try {
            if (editingAdId) {
                const { error } = await updateAd(editingAdId, formAd);
                if (!error) {
                    setEditingAdId(null);
                    setIsAddingAd(false);
                    setFormAd({ title: '', desktop_media_url: '', mobile_media_url: '', media_type: 'image', positions: [], object_position: 'center', link_url: '', duration: 5 });
                    alert('Propaganda atualizada com sucesso!');
                } else {
                    alert('Erro ao atualizar: ' + error);
                }
            } else {
                const { error } = await addAd(formAd);
                if (!error) {
                    setIsAddingAd(false);
                    setFormAd({ title: '', desktop_media_url: '', mobile_media_url: '', media_type: 'image', positions: [], object_position: 'center', link_url: '', duration: 5 });
                    alert('Propaganda adicionada com sucesso!');
                } else {
                    alert('Erro ao adicionar: ' + error);
                }
            }
        } catch (err: any) {
            console.error('Ad submit error:', err);
            alert('Ocorreu um erro inesperado ao salvar a propaganda.');
        }
    };

    const startEditAd = (ad: any) => {
        setEditingAdId(ad.id);
        setFormAd({
            title: ad.title,
            desktop_media_url: ad.desktop_media_url,
            mobile_media_url: ad.mobile_media_url || '',
            media_type: ad.media_type,
            positions: ad.positions || [],
            object_position: ad.object_position || 'center',
            link_url: ad.link_url || '',
            duration: ad.duration || 5
        });
        setIsAddingAd(true);
        setAdInputMethod(ad.desktop_media_url?.startsWith('http') ? 'url' : 'file');
        window.scrollTo({ top: 300, behavior: 'smooth' }); // Scroll to form
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

                        {/* Ads Management Section */}
                        <div className="mt-20 border-t border-white/5 pt-12">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-xl font-black text-white font-outfit uppercase tracking-widest flex items-center gap-3">
                                        <Megaphone size={24} className="text-accent" /> Gestão de Propagandas
                                    </h2>
                                    <p className="text-slate-500 text-xs mt-1 uppercase font-bold tracking-widest">Monetize ou destaque parceiros na sua liga</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsAddingAd(!isAddingAd);
                                        if (isAddingAd) {
                                            setEditingAdId(null);
                                            setFormAd({ title: '', desktop_media_url: '', mobile_media_url: '', media_type: 'image', positions: [], object_position: 'center', link_url: '', duration: 5 });
                                        }
                                    }}
                                    className="bg-accent/10 text-accent hover:bg-accent hover:text-white px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-[0.65rem] font-black uppercase tracking-widest"
                                >
                                    {isAddingAd ? <X size={16} /> : <Plus size={16} />}
                                    {isAddingAd ? 'Cancelar' : 'Nova Prop'}
                                </button>
                            </div>

                            {(formAd.desktop_media_url || formAd.mobile_media_url) && isAddingAd && (
                                <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {formAd.desktop_media_url && (
                                        <div className="rounded-2xl overflow-hidden glass-panel border-accent/20 border p-2">
                                            <div className="aspect-[6/1] w-full bg-black/40 rounded-xl overflow-hidden relative">
                                                {formAd.media_type === 'video' ? (
                                                    <video src={formAd.desktop_media_url} controls className="w-full h-full object-cover" style={{ objectPosition: formAd.object_position }} />
                                                ) : (
                                                    <img src={formAd.desktop_media_url} alt="Desktop Preview" className="w-full h-full object-cover" style={{ objectPosition: formAd.object_position }} />
                                                )}
                                                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[0.5rem] font-black text-white uppercase tracking-widest border border-white/10">
                                                    Preview Desktop
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {formAd.mobile_media_url && (
                                        <div className="rounded-2xl overflow-hidden glass-panel border-accent/20 border p-2">
                                            <div className="aspect-[5/2] w-full bg-black/40 rounded-xl overflow-hidden relative">
                                                {formAd.media_type === 'video' ? (
                                                    <video src={formAd.mobile_media_url} controls className="w-full h-full object-cover" style={{ objectPosition: formAd.object_position }} />
                                                ) : (
                                                    <img src={formAd.mobile_media_url} alt="Mobile Preview" className="w-full h-full object-cover" style={{ objectPosition: formAd.object_position }} />
                                                )}
                                                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[0.5rem] font-black text-white uppercase tracking-widest border border-white/10">
                                                    Preview Mobile
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {isAddingAd && (
                                <div className="bg-black/40 border border-white/10 rounded-3xl p-8 mb-8 animate-scale-in">
                                    <form onSubmit={handleAdSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest">Título da Campanha</label>
                                                <input type="text" value={formAd.title} onChange={e => setFormAd({ ...formAd, title: e.target.value })} required
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-accent"
                                                    placeholder="Ex: Patrocínio Coca-Cola"
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest">Mídia Desktop (1200x200)</label>
                                                        <div className="flex bg-white/5 p-0.5 rounded-lg">
                                                            <button type="button" onClick={() => setAdInputMethod('file')} className={`px-2 py-1 rounded-md text-[0.5rem] font-black uppercase transition-all ${adInputMethod === 'file' ? 'bg-primary text-white' : 'text-slate-500'}`}>Arqu</button>
                                                            <button type="button" onClick={() => setAdInputMethod('url')} className={`px-2 py-1 rounded-md text-[0.5rem] font-black uppercase transition-all ${adInputMethod === 'url' ? 'bg-primary text-white' : 'text-slate-500'}`}>URL</button>
                                                        </div>
                                                    </div>
                                                    {adInputMethod === 'file' ? (
                                                        <label className={`w-full bg-white/5 border-2 border-dashed rounded-xl px-4 py-6 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${formAd.desktop_media_url ? 'border-accent/40 bg-accent/5' : 'border-white/10 hover:border-white/20'}`}>
                                                            <Monitor size={16} className={formAd.desktop_media_url ? 'text-accent' : 'text-slate-500'} />
                                                            <span className="text-[0.55rem] font-black uppercase tracking-widest text-slate-400">{formAd.desktop_media_url ? 'Alterar Desktop' : 'Upload Desktop'}</span>
                                                            <input type="file" onChange={e => handleAdMediaFile(e, 'desktop')} accept="image/*,video/*,image/gif" className="hidden" />
                                                        </label>
                                                    ) : (
                                                        <input type="url" value={formAd.desktop_media_url} onChange={e => setFormAd({ ...formAd, desktop_media_url: e.target.value })}
                                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-accent outline-none" placeholder="URL Desktop" />
                                                    )}
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest">Mídia Mobile (800x320)</label>
                                                    </div>
                                                    {adInputMethod === 'file' ? (
                                                        <label className={`w-full bg-white/5 border-2 border-dashed rounded-xl px-4 py-6 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${formAd.mobile_media_url ? 'border-accent/40 bg-accent/5' : 'border-white/10 hover:border-white/20'}`}>
                                                            <Smartphone size={16} className={formAd.mobile_media_url ? 'text-accent' : 'text-slate-500'} />
                                                            <span className="text-[0.55rem] font-black uppercase tracking-widest text-slate-400">{formAd.mobile_media_url ? 'Alterar Mobile' : 'Upload Mobile'}</span>
                                                            <input type="file" onChange={e => handleAdMediaFile(e, 'mobile')} accept="image/*,video/*,image/gif" className="hidden" />
                                                        </label>
                                                    ) : (
                                                        <input type="url" value={formAd.mobile_media_url} onChange={e => setFormAd({ ...formAd, mobile_media_url: e.target.value })}
                                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-accent outline-none" placeholder="URL Mobile" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest">Tipo de Mídia</label>
                                                <select value={formAd.media_type} onChange={e => setFormAd({ ...formAd, media_type: e.target.value as any })}
                                                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-accent appearance-none">
                                                    <option value="image">Imagem Estática</option>
                                                    <option value="gif">GIF Animado</option>
                                                    <option value="video">Vídeo</option>
                                                </select>
                                            </div>
                                            <div className="space-y-4 md:col-span-2">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest">Exibir em quais locais?</label>
                                                    <button type="button" onClick={() => {
                                                        const allIds = AD_POSITIONS.map(p => p.id);
                                                        setFormAd(prev => ({ ...prev, positions: prev.positions.length === allIds.length ? [] : allIds }));
                                                    }} className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">
                                                        {formAd.positions.length === AD_POSITIONS.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-black/20 p-4 rounded-2xl border border-white/5">
                                                    {AD_POSITIONS.map(pos => (
                                                        <label key={pos.id} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all border ${formAd.positions.includes(pos.id) ? 'bg-primary/10 border-primary/30 text-white' : 'hover:bg-white/5 border-transparent text-slate-500'}`}>
                                                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${formAd.positions.includes(pos.id) ? 'bg-primary border-primary text-white' : 'bg-black/30 border-white/10'}`}>
                                                                {formAd.positions.includes(pos.id) && <Check size={10} strokeWidth={4} />}
                                                            </div>
                                                            <span className="text-[0.6rem] font-black uppercase tracking-tight">{pos.label}</span>
                                                            <input type="checkbox" className="hidden" checked={formAd.positions.includes(pos.id)} onChange={() => {
                                                                setFormAd(prev => ({
                                                                    ...prev,
                                                                    positions: prev.positions.includes(pos.id)
                                                                        ? prev.positions.filter(id => id !== pos.id)
                                                                        : [...prev.positions, pos.id]
                                                                }));
                                                            }} />
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest">Duração (Segundos)</label>
                                                <input type="number" value={formAd.duration} onChange={e => setFormAd({ ...formAd, duration: parseInt(e.target.value) })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-accent" min={1}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest">Foco da Imagem (Vertical)</label>
                                                <div className="flex gap-2 bg-black/40 p-1.5 rounded-xl border border-white/5">
                                                    {[
                                                        { id: 'top', label: 'Topo' },
                                                        { id: 'center', label: 'Centro' },
                                                        { id: 'bottom', label: 'Base' }
                                                    ].map(opt => (
                                                        <button key={opt.id} type="button" onClick={() => setFormAd({ ...formAd, object_position: opt.id as any })}
                                                            className={`flex-1 py-1.5 rounded-lg text-[0.55rem] font-black uppercase tracking-widest transition-all ${formAd.object_position === opt.id ? 'bg-primary text-white' : 'text-slate-500 hover:text-slate-300'}`}>
                                                            {opt.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest">Link de Destino (Opcional)</label>
                                            <input type="text" value={formAd.link_url} onChange={e => setFormAd({ ...formAd, link_url: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-accent"
                                                placeholder="https://seusite.com.br"
                                            />
                                        </div>

                                        <button type="submit" className="w-full bg-accent text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:brightness-110 transition-all shadow-lg shadow-accent/20">
                                            {editingAdId ? 'Salvar Alterações da Prop' : 'Confirmar Propaganda'}
                                        </button>
                                    </form>
                                </div>
                            )}

                            {ads.length > 0 && (
                                <div className="flex items-center justify-between mb-4 px-2">
                                    <button
                                        onClick={() => {
                                            if (selectedAds.length === ads.length) setSelectedAds([]);
                                            else setSelectedAds(ads.map(a => a.id));
                                        }}
                                        className="group/select flex items-center gap-2 text-[0.6rem] font-black text-slate-500 hover:text-white uppercase tracking-[0.2em] transition-all"
                                    >
                                        <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${selectedAds.length === ads.length ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 border-white/10 group-hover/select:border-white/30'}`}>
                                            {selectedAds.length === ads.length && <Check size={12} strokeWidth={4} />}
                                        </div>
                                        {selectedAds.length === ads.length ? 'Desmarcar Tudo' : 'Selecionar Tudo'}
                                    </button>

                                    {selectedAds.length > 0 && (
                                        <button
                                            onClick={async () => {
                                                if (window.confirm(`Excluir ${selectedAds.length} propagandas selecionadas?`)) {
                                                    await Promise.all(selectedAds.map(id => deleteAd(id)));
                                                    setSelectedAds([]);
                                                }
                                            }}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-danger/10 border border-danger/20 text-danger text-[0.6rem] font-black uppercase tracking-widest hover:bg-danger hover:text-white transition-all shadow-lg active:scale-95"
                                        >
                                            <Trash2 size={12} /> Excluir ({selectedAds.length})
                                        </button>
                                    )}
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {ads.map(ad => (
                                    <div key={ad.id}
                                        onClick={() => {
                                            if (selectedAds.includes(ad.id)) setSelectedAds(selectedAds.filter(id => id !== ad.id));
                                            else setSelectedAds([...selectedAds, ad.id]);
                                        }}
                                        className={`glass-panel p-5 flex items-center gap-4 relative group transition-all cursor-pointer border-2 ${selectedAds.includes(ad.id) ? 'border-primary bg-primary/[0.03]' : 'border-transparent hover:border-white/5'}`}>

                                        {/* Selection Indicator */}
                                        <div className={`absolute top-3 left-3 w-4 h-4 rounded border flex items-center justify-center transition-all z-10 ${selectedAds.includes(ad.id) ? 'bg-primary border-primary text-white' : 'bg-black/40 border-white/10 opacity-0 group-hover:opacity-100'}`}>
                                            {selectedAds.includes(ad.id) && <Check size={10} strokeWidth={4} />}
                                        </div>

                                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-black/30 border border-white/5 flex-none ml-2">
                                            {ad.media_type === 'video' ? (
                                                <div className="w-full h-full flex items-center justify-center bg-accent/20 text-accent">
                                                    <Video size={24} />
                                                </div>
                                            ) : (
                                                <img src={ad.desktop_media_url} alt={ad.title} className="w-full h-full object-cover" style={{ objectPosition: ad.object_position || 'center' }} />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-black text-white truncate">{ad.title}</p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[0.5rem] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                                    <Layout size={10} /> {ad.positions?.length || 0} Locais
                                                </span>
                                                <span className="text-[0.5rem] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                                    <Clock size={10} /> {ad.duration}s
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                            <button
                                                onClick={() => updateAd(ad.id, { active: !ad.active })}
                                                className={`p-2 rounded-lg transition-all ${ad.active ? 'text-accent bg-accent/10' : 'text-slate-600 bg-white/5'}`}
                                                title={ad.active ? 'Desativar' : 'Ativar'}
                                            >
                                                <Monitor size={14} />
                                            </button>
                                            <button
                                                onClick={() => startEditAd(ad)}
                                                className="p-2 rounded-lg text-primary bg-primary/10 hover:bg-primary hover:text-white transition-all"
                                                title="Editar"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => deleteAd(ad.id)}
                                                className="p-2 rounded-lg text-danger bg-danger/10 opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {ads.length === 0 && !isAddingAd && (
                                    <div className="sm:col-span-2 text-center py-12 border-2 border-dashed border-white/5 rounded-3xl">
                                        <Megaphone size={40} className="text-slate-700 mx-auto mb-3" />
                                        <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Nenhuma propaganda ativa</p>
                                    </div>
                                )}
                            </div>
                        </div>
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
                                {import.meta.env.VITE_APP_URL || window.location.origin}/view/{league?.slug || league?.id}
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
