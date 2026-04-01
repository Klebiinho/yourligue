import { useState, useEffect, useRef } from 'react';
import { useLeague } from '../context/LeagueContext';
import type { PickupConfig } from '../context/LeagueContext';
import { useAuth } from '../context/AuthContext';
import TeamLogo from '../components/TeamLogo';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, Save, Image as ImageIcon, LogOut, Trophy, User, Users, ArrowLeftRight, Clock, Target, ShieldCheck, Mail, Share2, Copy, CheckCircle2, Megaphone, Plus, Trash2, Video, Layout, Monitor, X, Check, Edit2, Smartphone, ArrowUp, ArrowDown, MapPin, Zap } from 'lucide-react';

const AD_POSITIONS = [
    { id: 'top', label: 'Topo da Página' },
    { id: 'home_stats', label: 'Home (Banner 1200x200)' },
    { id: 'teams_list', label: 'Times (Lista)' },
    { id: 'matches_filter', label: 'Partidas (Filtro)' },
    { id: 'live_top', label: 'Ao Vivo (Topo)' },
    { id: 'standings_info', label: 'Tabela (Fundo)' },
    { id: 'panel_stats', label: 'Painel (Stats)' },
    { id: 'side', label: 'Lateral (Barra)' },
    { id: 'halftime', label: 'Intervalo Jogo' },
    { id: 'overlay', label: 'Overlay Vídeo' },
    { id: 'home_highlight', label: 'Home (Destaques 720x720)' },
];

const Settings = () => {
    const { league, updateLeague, isAdmin, ytLogin, ytLogout, isYtAuthenticated, leagueBasePath } = useLeague();
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState(league?.name ?? '');
    const [logo, setLogo] = useState(league?.logo ?? '');
    const [maxTeams, setMaxTeams] = useState(String(league?.maxTeams ?? 16));
    const [pointsForWin, setPointsForWin] = useState(String(league?.pointsForWin ?? 3));
    const [pointsForDraw, setPointsForDraw] = useState(String(league?.pointsForDraw ?? 1));
    const [pointsForLoss, setPointsForLoss] = useState(String(league?.pointsForLoss ?? 0));
    const [halfLength, setHalfLength] = useState(String(league?.defaultHalfLength ?? 45));
    const [overtimeHalfLength, setOvertimeHalfLength] = useState(String(league?.overtimeHalfLength ?? 15));
    const [playersPerTeam, setPlayersPerTeam] = useState(String(league?.playersPerTeam ?? 5));
    const [reserveLimit, setReserveLimit] = useState(String(league?.reserveLimitPerTeam ?? 5));
    const [substitutionsLimit, setSubstitutionsLimit] = useState(String(league?.substitutionsLimit ?? 5));
    const [allowSubstitutionReturn, setAllowSubstitutionReturn] = useState(league?.allowSubstitutionReturn ?? true);
    const [hasOvertime, setHasOvertime] = useState(league?.hasOvertime ?? true);
    const [address, setAddress] = useState(league?.address ?? '');
    const [lat, setLat] = useState(league?.lat ? String(league.lat) : '');
    const [lng, setLng] = useState(league?.lng ? String(league.lng) : '');
    const [saved, setSaved] = useState(false);
    const [isCapturingGPS, setIsCapturingGPS] = useState(false);
    const [isSearchingAddress, setIsSearchingAddress] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [copied, setCopied] = useState(false);
    const [isPickupMode, setIsPickupMode] = useState(league?.isPickupMode ?? false);
    const [pickupConfig, setPickupConfig] = useState<PickupConfig>({
        maxPoints: league?.pickupConfig?.maxPoints ?? 21,
        timeLimit: league?.pickupConfig?.timeLimit ?? 10,
        gameFormat: league?.pickupConfig?.gameFormat ?? '3x3',
        entryType: league?.pickupConfig?.entryType ?? 'auto',
        rotationType: league?.pickupConfig?.rotationType ?? 'winner_stays',
        substitutionType: league?.pickupConfig?.substitutionType ?? 'free',
        pointsValue: {
            regular: league?.pickupConfig?.pointsValue?.regular ?? 2,
            longRange: league?.pickupConfig?.pointsValue?.longRange ?? 3
        }
    });

    // Sync state with league data when it loads
    useEffect(() => {
        if (league) {
            setName(league.name ?? '');
            setLogo(league.logo ?? '');
            setMaxTeams(String(league.maxTeams ?? 16));
            setPointsForWin(String(league.pointsForWin ?? 3));
            setPointsForDraw(String(league.pointsForDraw ?? 1));
            setPointsForLoss(String(league.pointsForLoss ?? 0));
            setHalfLength(String(league.defaultHalfLength ?? 45));
            setOvertimeHalfLength(String(league.overtimeHalfLength ?? 15));
            setPlayersPerTeam(String(league.playersPerTeam ?? 5));
            setReserveLimit(String(league.reserveLimitPerTeam ?? 5));
            setSubstitutionsLimit(String(league.substitutionsLimit ?? 5));
            setAllowSubstitutionReturn(league.allowSubstitutionReturn ?? true);
            setHasOvertime(league.hasOvertime ?? true);
            setAddress(league.address ?? '');
            setLat(league.lat ? String(league.lat) : '');
            setLng(league.lng ? String(league.lng) : '');
            setIsPickupMode(league.isPickupMode ?? false);
            setPickupConfig({
                maxPoints: league.pickupConfig?.maxPoints ?? 21,
                timeLimit: league.pickupConfig?.timeLimit ?? 10,
                gameFormat: league.pickupConfig?.gameFormat ?? '3x3',
                entryType: league.pickupConfig?.entryType ?? 'auto',
                rotationType: league.pickupConfig?.rotationType ?? 'winner_stays',
                substitutionType: league.pickupConfig?.substitutionType ?? 'free',
                pointsValue: {
                    regular: league.pickupConfig?.pointsValue?.regular ?? 2,
                    longRange: league.pickupConfig?.pointsValue?.longRange ?? 3
                }
            });
        }
    }, [league]);

    // Ads Management State
    const { ads, addAd, updateAd, deleteAd, reorderAds } = useLeague();
    const [isAddingAd, setIsAddingAd] = useState(false);
    const [formAd, setFormAd] = useState({
        title: '',
        desktop_media_url: '',
        mobile_media_url: '',
        square_media_url: '',
        media_type: 'image' as 'image' | 'video' | 'gif',
        positions: [] as string[],
        object_position: 'center' as 'center' | 'top' | 'bottom',
        link_url: '',
        duration: 5
    });
    const [adInputMethod, setAdInputMethod] = useState<'file' | 'url'>('file');
    const [selectedAds, setSelectedAds] = useState<string[]>([]);
    const [editingAdId, setEditingAdId] = useState<string | null>(null);
    const [isSavingAd, setIsSavingAd] = useState(false);
    const adSectionRef = useRef<HTMLDivElement>(null);

    // Scroll to ad section when starting to add or edit
    useEffect(() => {
        if (isAddingAd) {
            // Small delay to ensure the form is rendered and layout has updated
            setTimeout(() => {
                adSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }, [isAddingAd, editingAdId]);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) { const r = new FileReader(); r.onloadend = () => setLogo(r.result as string); r.readAsDataURL(file); }
    };

    const optimizeImage = (base64: string, maxWidth = 1200, maxHeight = 1200): Promise<string> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = base64;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                // Use JPEG for better compression than PNG (base64 size reduced by ~5-10x)
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
        });
    };

    const handleAdMediaFile = (e: React.ChangeEvent<HTMLInputElement>, target: 'desktop' | 'mobile' | 'square') => {
        const file = e.target.files?.[0];
        if (file) {
            const isVideo = file.type.startsWith('video/');
            const isGif = file.type === 'image/gif';
            const type = isVideo ? 'video' : isGif ? 'gif' : 'image';
            
            const r = new FileReader();
            r.onloadend = async () => {
                let finalData = r.result as string;
                
                // If it's a standard image (not gif/video), we optimize it to prevent 'Load failed' on mobile
                if (type === 'image') {
                    console.log('Optimizing image for mobile...');
                    finalData = await optimizeImage(finalData);
                }

                setFormAd(prev => ({
                    ...prev,
                    [target === 'desktop' ? 'desktop_media_url' : target === 'mobile' ? 'mobile_media_url' : 'square_media_url']: finalData,
                    media_type: type as any
                }));
            };
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
            overtimeHalfLength: parseInt(overtimeHalfLength) || 15,
            playersPerTeam: parseInt(playersPerTeam) || 5,
            reserveLimitPerTeam: parseInt(reserveLimit) || 5,
            substitutionsLimit: parseInt(substitutionsLimit) || 5,
            allowSubstitutionReturn,
            hasOvertime,
            address,
            lat: lat ? parseFloat(lat) : null,
            lng: lng ? parseFloat(lng) : null,
            isPickupMode,
            pickupConfig
        } as any);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const handleGetGPS = () => {
        if (!navigator.geolocation) {
            alert("❌ Seu navegador não suporta geolocalização.");
            return;
        }

        setIsCapturingGPS(true);
        let successCalled = false;
        
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                successCalled = true;
                const latitude = pos.coords.latitude;
                const longitude = pos.coords.longitude;
                setLat(String(latitude));
                setLng(String(longitude));
                
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`);
                    const data = await response.json();
                    if (data && data.address) {
                        const city = data.address.city || data.address.town || data.address.municipality || data.address.village || '';
                        const state = data.address.state || '';
                        if (city || state) {
                            setAddress(`${city}${city && state ? ' - ' : ''}${state}`);
                        }
                    }
                } catch (e) {
                    // Ignora silenciosamente erros de geocoding reverso
                }

                setIsCapturingGPS(false);
                setTimeout(() => alert("✅ Localização capturada! Salve as configurações."), 100);
            },
            (err: any) => {
                if (successCalled) return; // Se já deu certo, ignora erros atrasados
                
                setIsCapturingGPS(false);
                
                if (err.code === 1) { // PERMISSION_DENIED
                    // Se o botão "funciona" mas cai aqui, pode ser um falso erro do navegador
                    return; 
                } else if (err.code === 3) { // TIMEOUT
                    // Ignora timeout se já tivermos preenchido as coordenadas manualmente ou por busca
                    if (lat && lng) return;
                    alert("⏱️ A busca pelo GPS demorou muito. Tente novamente ou use a busca manual.");
                } else {
                    alert("❌ Erro ao capturar: " + (err.message || "Erro desconhecido."));
                }
            },
            { 
                enableHighAccuracy: false,
                timeout: 10000, // 10 segundos é o ideal
                maximumAge: 30000 // Aceita posições de até 30 segundos atrás para ser mais rápido
            }
        );
    };

    const handleSearchAddress = async () => {
        if (!searchQuery.trim()) {
            alert("Digite um endereço para buscar.");
            return;
        }
        setIsSearchingAddress(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
            const data = await response.json();
            if (data && data.length > 0) {
                const found = data[0];
                setLat(String(found.lat));
                setLng(String(found.lon));
                alert("📍 Coordenadas encontradas e vinculadas!");
            } else {
                alert("Não encontramos este endereço. Tente ser mais específico.");
            }
        } catch (error) {
            console.error("Search Error:", error);
            alert("Erro ao buscar endereço.");
        } finally {
            setIsSearchingAddress(false);
        }
    };

    const handleCopyLink = () => {
        if (!league) return;
        const baseUrl = window.location.origin;
        const link = `${baseUrl}/${league.slug || league.id}/home`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSignOut = async () => {
        await signOut();
        navigate(leagueBasePath || '/');
    };

    const handleAdSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSavingAd) return;
        
        if (formAd.positions.length === 0) {
            alert('⚠️ Selecione pelo menos um local para exibir a propaganda.');
            return;
        }

        setIsSavingAd(true);
        try {
            if (editingAdId) {
                // Optimized payload: send only changed fields
                const originalAd = ads.find(a => a.id === editingAdId);
                const updates: any = {};
                
                if (originalAd) {
                    Object.keys(formAd).forEach(key => {
                        const k = key as keyof typeof formAd;
                        if (JSON.stringify(formAd[k]) !== JSON.stringify(originalAd[k])) {
                            updates[k] = formAd[k];
                        }
                    });
                }

                if (Object.keys(updates).length === 0 && originalAd) {
                    setIsAddingAd(false);
                    setEditingAdId(null);
                    setIsSavingAd(false);
                    return;
                }

                const { error } = await updateAd(editingAdId, updates);
                if (!error) {
                    setEditingAdId(null);
                    setFormAd({ title: '', desktop_media_url: '', mobile_media_url: '', square_media_url: '', media_type: 'image', positions: [], object_position: 'center', link_url: '', duration: 5 });
                    setIsAddingAd(false);
                    alert('✅ PROPAGANDA ATUALIZADA!');
                } else {
                    alert('❌ ERRO AO ATUALIZAR:\n' + (typeof error === 'string' ? error : JSON.stringify(error)));
                }
            } else {
                const { error } = await addAd(formAd);
                if (!error) {
                    setFormAd({ title: '', desktop_media_url: '', mobile_media_url: '', square_media_url: '', media_type: 'image', positions: [], object_position: 'center', link_url: '', duration: 5 });
                    setIsAddingAd(false);
                    alert('✅ NOVA PROPAGANDA ADICIONADA!');
                } else {
                    alert('❌ ERRO AO ADICIONAR:\n' + (typeof error === 'string' ? error : JSON.stringify(error)));
                }
            }
        } catch (err: any) {
            console.error('Submit error:', err);
            alert('❌ ERRO DE CONEXÃO:\nVerifique sua internet ou tente novamente.');
        } finally {
            setIsSavingAd(false);
        }
    };

    const startEditAd = (ad: any) => {
        console.log('Starting edit for ad:', ad);
        setEditingAdId(ad.id);
        const adData = {
            title: ad.title || '',
            desktop_media_url: ad.desktop_media_url || '',
            mobile_media_url: ad.mobile_media_url || '',
            square_media_url: ad.square_media_url || '',
            media_type: ad.media_type || 'image',
            positions: ad.positions || [],
            object_position: ad.object_position || 'center',
            link_url: ad.link_url || '',
            duration: ad.duration || 5
        };
        setFormAd(adData);
        setIsAddingAd(true);
        setAdInputMethod(adData.desktop_media_url?.startsWith('http') ? 'url' : 'file');
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
                                        <input type="text" id="league-name" name="league-name" value={name} onChange={e => setName(e.target.value)} required
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white font-black text-xl outline-none focus:border-primary transition-all placeholder:text-slate-700 h-16"
                                        />
                                    </div>
                                    <p className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest italic ml-1">
                                        <span className="text-primary">Dica:</span> Use nomes curtos e impactantes para o dashboard.
                                    </p>
                                </div>
                            </div>

                            {/* MODO RACHÃO (BASKETBALL ONLY) */}
                            {league?.sportType === 'basketball' && (
                                <div className="space-y-6 bg-gradient-to-br from-amber-500/10 to-orange-600/5 p-8 rounded-3xl border border-amber-500/20 relative overflow-hidden group/rachao">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover/rachao:opacity-10 transition-opacity">
                                        <Zap size={100} className="text-amber-500" />
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <h3 className="text-xl font-black text-amber-500 font-outfit uppercase tracking-tight flex items-center gap-3">
                                                🏀 MODO RACHÃO (PICKUP GAME)
                                            </h3>
                                            <p className="text-[0.65rem] text-slate-400 font-bold uppercase tracking-widest">Ative para jogos contínuos com rotação de jogadores e sem times fixos</p>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => setIsPickupMode(!isPickupMode)}
                                            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${isPickupMode ? 'bg-amber-500' : 'bg-white/10'}`}
                                        >
                                            <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${isPickupMode ? 'translate-x-7' : 'translate-x-1'}`} />
                                        </button>
                                    </div>

                                    {isPickupMode && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-slide-down border-t border-amber-500/10 pt-6">
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-[0.6rem] font-black text-amber-500/70 uppercase tracking-widest ml-1">Pontuação Máxima (Fim do Jogo)</label>
                                                    <input type="number" value={pickupConfig.maxPoints} onChange={e => setPickupConfig({...pickupConfig, maxPoints: parseInt(e.target.value)})}
                                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-amber-500 transition-colors"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[0.6rem] font-black text-amber-500/70 uppercase tracking-widest ml-1">Tempo Limite (minutos)</label>
                                                    <input type="number" value={pickupConfig.timeLimit} onChange={e => setPickupConfig({...pickupConfig, timeLimit: parseInt(e.target.value)})}
                                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-amber-500 transition-colors"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[0.6rem] font-black text-amber-500/70 uppercase tracking-widest ml-1">Formato de Jogo</label>
                                                    <select value={pickupConfig.gameFormat} onChange={e => setPickupConfig({...pickupConfig, gameFormat: e.target.value as any})}
                                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-amber-500 transition-colors appearance-none"
                                                    >
                                                        <option value="3x3">3x3 (Rua)</option>
                                                        <option value="4x4">4x4 (Misto)</option>
                                                        <option value="5x5">5x5 (Quadra Inteira)</option>
                                                    </select>
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-[0.6rem] font-black text-amber-500/70 uppercase tracking-widest ml-1">Tipo de Entrada</label>
                                                    <select value={pickupConfig.entryType} onChange={e => setPickupConfig({...pickupConfig, entryType: e.target.value as any})}
                                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-amber-500 transition-colors appearance-none"
                                                    >
                                                        <option value="auto">Fila Automática (FIFO)</option>
                                                        <option value="manual">Escolha Manual (ADM)</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[0.6rem] font-black text-amber-500/70 uppercase tracking-widest ml-1">Rotação Pós-Jogo</label>
                                                    <select value={pickupConfig.rotationType} onChange={e => setPickupConfig({...pickupConfig, rotationType: e.target.value as any})}
                                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-amber-500 transition-colors appearance-none"
                                                    >
                                                        <option value="winner_stays">Quem Ganha Fica (Rei da Quadra)</option>
                                                        <option value="all_swap">Troca Tudo (Todos Saem)</option>
                                                        <option value="none">Manual</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[0.6rem] font-black text-amber-500/70 uppercase tracking-widest ml-1">Valor dos Pontos</label>
                                                    <div className="flex gap-4">
                                                        <div className="flex-1">
                                                            <span className="text-[0.5rem] font-black text-slate-600 block mb-1">REGULAR</span>
                                                            <input type="number" value={pickupConfig.pointsValue.regular} onChange={e => setPickupConfig({...pickupConfig, pointsValue: {...pickupConfig.pointsValue, regular: parseInt(e.target.value)}})}
                                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white font-bold text-center"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <span className="text-[0.5rem] font-black text-slate-600 block mb-1">LONGA DISTÂNCIA</span>
                                                            <input type="number" value={pickupConfig.pointsValue.longRange} onChange={e => setPickupConfig({...pickupConfig, pointsValue: {...pickupConfig.pointsValue, longRange: parseInt(e.target.value)}})}
                                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white font-bold text-center"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* General Configs */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest ml-1">Capacidade de Equipes</label>
                                    <div className="relative">
                                        <ShieldCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                                        <input type="number" id="league-max-teams" name="league-max-teams" value={maxTeams} onChange={e => setMaxTeams(e.target.value)} min={2} max={64} required
                                            className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white font-bold outline-none focus:border-primary transition-colors h-14"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest ml-1">Duração dos Tempos (min)</label>
                                    <div className="relative">
                                        <Clock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-accent" />
                                        <input type="number" id="league-half-length" name="league-half-length" value={halfLength} onChange={e => setHalfLength(e.target.value)} required min={1} max={90}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white font-bold outline-none focus:border-accent transition-colors h-14"
                                        />
                                    </div>
                                </div>
                                {hasOvertime && (
                                    <div className="space-y-2 animate-fade-in">
                                        <label className="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest ml-1">Duração Prorrogação (min)</label>
                                        <div className="relative">
                                            <Clock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-warning" />
                                            <input type="number" id="league-overtime-length" name="league-overtime-length" value={overtimeHalfLength} onChange={e => setOvertimeHalfLength(e.target.value)} required min={1} max={45}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white font-bold outline-none focus:border-warning transition-colors h-14"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Squad Size Configs */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest ml-1">Jogadores Titulares (por time)</label>
                                    <div className="relative">
                                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                                        <input type="number" id="league-players-per-team" name="league-players-per-team" value={playersPerTeam} onChange={e => setPlayersPerTeam(e.target.value)} min={1} max={11} required
                                            className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white font-bold outline-none focus:border-primary transition-colors h-14"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest ml-1">Limite de Reservas (por time)</label>
                                    <div className="relative">
                                        <Users size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-accent" />
                                        <input type="number" id="league-reserve-limit" name="league-reserve-limit" value={reserveLimit} onChange={e => setReserveLimit(e.target.value)} required min={0} max={20}
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
                                        <input type="number" id="league-subs-limit" name="league-subs-limit" value={substitutionsLimit} onChange={e => setSubstitutionsLimit(e.target.value)} required min={0} max={50}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white font-bold outline-none focus:border-primary transition-colors h-14"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Substitution Rule Toggle */}
                            <div className="space-y-4 bg-black/10 p-6 rounded-3xl border border-white/5">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h3 className="text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <ArrowLeftRight size={14} className="text-primary" /> Regras de Substituição
                                        </h3>
                                        <p className="text-[0.6rem] text-slate-600 font-bold uppercase tracking-widest">Defina se jogadores substituídos podem voltar ao campo</p>
                                    </div>
                                    <button type="button" onClick={() => setAllowSubstitutionReturn(!allowSubstitutionReturn)}
                                        className={`flex items-center gap-3 px-4 py-2 rounded-xl border transition-all font-black text-[0.6rem] uppercase tracking-widest ${allowSubstitutionReturn ? 'bg-primary/20 border-primary/40 text-primary' : 'bg-white/5 border-white/10 text-slate-500'}`}>
                                        {allowSubstitutionReturn ? <Check size={14} strokeWidth={4} /> : <X size={14} strokeWidth={4} />}
                                        {allowSubstitutionReturn ? 'Retorno Permitido' : 'Retorno Proibido'}
                                    </button>
                                </div>
                            </div>

                             {/* Overtime Rule Toggle */}
                             <div className="space-y-4 bg-black/10 p-6 rounded-3xl border border-white/5">
                                 <div className="flex items-center justify-between">
                                     <div className="space-y-1">
                                         <h3 className="text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                             <Clock size={14} className="text-primary" /> Tempo Extra em Empates
                                         </h3>
                                         <p className="text-[0.6rem] text-slate-600 font-bold uppercase tracking-widest">Em mata-mata, haverá prorrogação antes dos pênaltis?</p>
                                     </div>
                                     <button type="button" onClick={() => setHasOvertime(!hasOvertime)}
                                         className={`flex items-center gap-3 px-4 py-2 rounded-xl border transition-all font-black text-[0.6rem] uppercase tracking-widest ${hasOvertime ? 'bg-primary/20 border-primary/40 text-primary' : 'bg-white/5 border-white/10 text-slate-500'}`}>
                                         {hasOvertime ? <Check size={14} strokeWidth={4} /> : <X size={14} strokeWidth={4} />}
                                         {hasOvertime ? 'Prorrogação + Pênaltis' : 'Pênaltis Direto'}
                                     </button>
                                 </div>
                             </div>

                             {/* Point System */}
                             <div className="space-y-6 bg-black/10 p-8 rounded-3xl border border-white/5">
                                 <h3 className="text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                     <Target size={14} className="text-primary" /> Sistema de Pontuação
                                 </h3>
                                 <div className="grid grid-cols-3 gap-6">
                                     <div className="space-y-2">
                                         <label className="text-[0.55rem] font-black text-slate-600 uppercase tracking-widest ml-1">Vitória</label>
                                         <input type="number" id="league-points-win" name="league-points-win" value={pointsForWin} onChange={e => setPointsForWin(e.target.value)} required min={0}
                                             className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-black text-center text-lg outline-none focus:bg-primary/20 transition-all font-outfit"
                                         />
                                     </div>
                                     <div className="space-y-2">
                                         <label className="text-[0.55rem] font-black text-slate-600 uppercase tracking-widest ml-1">Empate</label>
                                         <input type="number" id="league-points-draw" name="league-points-draw" value={pointsForDraw} onChange={e => setPointsForDraw(e.target.value)} required min={0}
                                             className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-black text-center text-lg outline-none focus:bg-white/10 transition-all font-outfit"
                                         />
                                     </div>
                                     <div className="space-y-2">
                                         <label className="text-[0.55rem] font-black text-slate-600 uppercase tracking-widest ml-1">Derrota</label>
                                         <input type="number" id="league-points-loss" name="league-points-loss" value={pointsForLoss} onChange={e => setPointsForLoss(e.target.value)} required min={0}
                                             className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-black text-center text-lg outline-none focus:bg-danger/20 transition-all font-outfit"
                                         />
                                     </div>
                                 </div>
                             </div>

                             {/* Location Section */}
                             <div className="space-y-6 bg-black/10 p-8 rounded-3xl border border-white/5">
                                 <h3 className="text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                     <MapPin size={14} className="text-accent" /> Localização Geográfica
                                 </h3>
                                 <div className="space-y-6">
                                     <div className="space-y-2">
                                         <label className="text-[0.55rem] font-black text-slate-600 uppercase tracking-widest ml-1">Nome do Local / Estádio (Visível aos Usuários)</label>
                                         <input type="text" id="league-address" name="league-address" value={address} onChange={e => setAddress(e.target.value)}
                                             placeholder="Ex: Arena Corinthians, Estádio do Morumbi..."
                                             className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white font-bold outline-none focus:border-accent transition-all h-14"
                                         />
                                     </div>

                                     <div className="space-y-3 pt-2 border-t border-white/5">
                                         <label className="text-[0.55rem] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                             <Target size={12} className="text-primary" /> Pesquisar Localização (Coordenadas)
                                         </label>
                                         <div className="flex flex-col sm:flex-row gap-2">
                                            <input type="text" id="league-location-search" name="league-location-search" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                                placeholder="Rua, Cidade, Estado ou Nome do Estádio..."
                                                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-primary transition-all"
                                                onKeyDown={e => e.key === 'Enter' && handleSearchAddress()}
                                            />
                                            <button type="button" onClick={handleSearchAddress} disabled={isSearchingAddress}
                                                className="px-6 bg-primary/20 border border-primary/30 text-primary hover:bg-primary hover:text-white rounded-xl font-black text-[0.6rem] uppercase tracking-widest transition-all h-12 flex items-center justify-center gap-2">
                                                {isSearchingAddress ? <><div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" /> Buscando...</> : 'Buscar'}
                                            </button>
                                         </div>
                                         <button type="button" onClick={handleGetGPS} disabled={isCapturingGPS}
                                             className="w-full py-3 bg-accent/10 border border-accent/20 text-accent rounded-xl font-black text-[0.6rem] uppercase tracking-widest hover:bg-accent hover:text-white transition-all flex items-center gap-2 justify-center">
                                             {isCapturingGPS ? <><div className="w-3 h-3 border-2 border-accent border-t-transparent rounded-full animate-spin" /> Capturando...</> : <><MapPin size={12} /> Usar Meu GPS Atual</>}
                                         </button>
                                     </div>

                                     {lat && lng && (
                                         <div className="mt-4 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-between group">
                                             <div className="flex items-center gap-3">
                                                 <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                                                     <CheckCircle2 size={16} strokeWidth={3} />
                                                 </div>
                                                 <div>
                                                     <p className="text-[0.6rem] font-black text-emerald-500 uppercase tracking-widest">Localização Vinculada</p>
                                                     <p className="text-[0.55rem] text-slate-500 font-bold uppercase tracking-tight">{Number(lat).toFixed(4)}, {Number(lng).toFixed(4)}</p>
                                                 </div>
                                             </div>
                                             <button type="button" onClick={() => { setLat(''); setLng(''); }} className="p-2 opacity-0 group-hover:opacity-100 text-slate-600 hover:text-danger hover:bg-danger/10 rounded-lg transition-all" title="Remover Localização">
                                                 <Trash2 size={14} />
                                             </button>
                                         </div>
                                     )}
                                     <p className="text-[0.55rem] text-slate-600 italic font-medium mt-2">A localização é necessária para que sua liga apareça na aba "Ligas Próximas" dos usuários.</p>
                                 </div>
                             </div>

                             <button type="submit"
                                 className={`w-full py-5 rounded-2xl font-black text-[0.8rem] uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-4 active:scale-[0.98] ${saved ? 'bg-accent text-white animate-scale-in' : 'bg-primary text-white hover:brightness-110 shadow-primary/20'
                                     }`}>
                                 {saved ? <><ShieldCheck size={22} strokeWidth={3} /> Configurações Atualizadas!</> : <><Save size={22} strokeWidth={3} /> Salvar Alterações</>}
                             </button>
                         </form>

                        {/* Ads Management Section */}
                        <div ref={adSectionRef} className="mt-20 border-t border-white/5 pt-12">
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
                                            setFormAd({ title: '', desktop_media_url: '', mobile_media_url: '', square_media_url: '', media_type: 'image', positions: [], object_position: 'center', link_url: '', duration: 5 });
                                        }
                                    }}
                                    className="bg-accent/10 text-accent hover:bg-accent hover:text-white px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-[0.65rem] font-black uppercase tracking-widest"
                                >
                                    {isAddingAd ? <X size={16} /> : <Plus size={16} />}
                                    {isAddingAd ? 'Cancelar' : 'Nova Prop'}
                                </button>
                            </div>

                            {(formAd.desktop_media_url || formAd.mobile_media_url || formAd.square_media_url) && isAddingAd && (
                                <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {formAd.desktop_media_url && (
                                        <div className="rounded-2xl overflow-hidden glass-panel border-accent/20 border p-2">
                                            <div className="aspect-[16/5] w-full bg-black/40 rounded-xl overflow-hidden relative">
                                                {formAd.media_type === 'video' ? (
                                                    <video src={formAd.desktop_media_url} controls className="w-full h-full object-cover" style={{ objectPosition: formAd.object_position }} />
                                                ) : (
                                                    <img src={formAd.desktop_media_url} alt="Desktop Preview" className="w-full h-full object-cover" style={{ objectPosition: formAd.object_position }} />
                                                )}
                                                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[0.5rem] font-black text-white uppercase tracking-widest border border-white/10">
                                                    Desktop
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {formAd.mobile_media_url && (
                                        <div className="rounded-2xl overflow-hidden glass-panel border-accent/20 border p-2">
                                            <div className="aspect-[4/2] w-full bg-black/40 rounded-xl overflow-hidden relative">
                                                {formAd.media_type === 'video' ? (
                                                    <video src={formAd.mobile_media_url} controls className="w-full h-full object-cover" style={{ objectPosition: formAd.object_position }} />
                                                ) : (
                                                    <img src={formAd.mobile_media_url} alt="Mobile Preview" className="w-full h-full object-cover" style={{ objectPosition: formAd.object_position }} />
                                                )}
                                                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[0.5rem] font-black text-white uppercase tracking-widest border border-white/10">
                                                    Mobile
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {formAd.square_media_url && (
                                        <div className="rounded-2xl overflow-hidden glass-panel border-accent/20 border p-2">
                                            <div className="aspect-square w-full bg-black/40 rounded-xl overflow-hidden relative">
                                                {formAd.media_type === 'video' ? (
                                                    <video src={formAd.square_media_url} controls className="w-full h-full object-cover" style={{ objectPosition: formAd.object_position }} />
                                                ) : (
                                                    <img src={formAd.square_media_url} alt="Square Preview" className="w-full h-full object-cover" style={{ objectPosition: formAd.object_position }} />
                                                )}
                                                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[0.5rem] font-black text-white uppercase tracking-widest border border-white/10">
                                                    Home (720x720)
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
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest">Banner Desktop (1200x200)</label>
                                                    <div className="flex bg-white/5 p-0.5 rounded-lg">
                                                        <button type="button" onClick={() => setAdInputMethod('file')} className={`px-2 py-1 rounded-md text-[0.5rem] font-black uppercase transition-all ${adInputMethod === 'file' ? 'bg-primary text-white' : 'text-slate-500'}`}>Arqu</button>
                                                        <button type="button" onClick={() => setAdInputMethod('url')} className={`px-2 py-1 rounded-md text-[0.5rem] font-black uppercase transition-all ${adInputMethod === 'url' ? 'bg-primary text-white' : 'text-slate-500'}`}>URL</button>
                                                    </div>
                                                </div>
                                                {adInputMethod === 'file' ? (
                                                    <label className={`w-full bg-white/5 border-2 border-dashed rounded-xl px-4 py-4 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${formAd.desktop_media_url ? 'border-accent/40 bg-accent/5' : 'border-white/10 hover:border-white/20'}`}>
                                                        <Monitor size={16} className={formAd.desktop_media_url ? 'text-accent' : 'text-slate-500'} />
                                                        <span className="text-[0.5rem] font-black uppercase tracking-widest text-slate-400">Desktop</span>
                                                        <input type="file" onChange={e => handleAdMediaFile(e, 'desktop')} accept="image/*,video/*,image/gif" className="hidden" />
                                                    </label>
                                                ) : (
                                                    <input type="text" value={formAd.desktop_media_url} onChange={e => setFormAd({ ...formAd, desktop_media_url: e.target.value })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-[0.65rem] focus:border-accent outline-none" placeholder="Link Desktop" />
                                                )}
                                            </div>

                                            <div className="space-y-4">
                                                <label className="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest block">Banner Mobile (1200x380)</label>
                                                {adInputMethod === 'file' ? (
                                                    <label className={`w-full bg-white/5 border-2 border-dashed rounded-xl px-4 py-4 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${formAd.mobile_media_url ? 'border-accent/40 bg-accent/5' : 'border-white/10 hover:border-white/20'}`}>
                                                        <Smartphone size={16} className={formAd.mobile_media_url ? 'text-accent' : 'text-slate-500'} />
                                                        <span className="text-[0.5rem] font-black uppercase tracking-widest text-slate-400">Mobile</span>
                                                        <input type="file" onChange={e => handleAdMediaFile(e, 'mobile')} accept="image/*,video/*,image/gif" className="hidden" />
                                                    </label>
                                                ) : (
                                                    <input type="text" value={formAd.mobile_media_url} onChange={e => setFormAd({ ...formAd, mobile_media_url: e.target.value })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-[0.65rem] focus:border-accent outline-none" placeholder="Link Mobile" />
                                                )}
                                            </div>

                                            <div className="space-y-4">
                                                <label className="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest block">Destaque Home (720x720)</label>
                                                {adInputMethod === 'file' ? (
                                                    <label className={`w-full bg-white/5 border-2 border-dashed rounded-xl px-4 py-4 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${formAd.square_media_url ? 'border-accent/40 bg-accent/5' : 'border-white/10 hover:border-white/20'}`}>
                                                        <Layout size={16} className={formAd.square_media_url ? 'text-accent' : 'text-slate-500'} />
                                                        <span className="text-[0.5rem] font-black uppercase tracking-widest text-slate-400">720x720 (Square)</span>
                                                        <input type="file" onChange={e => handleAdMediaFile(e, 'square')} accept="image/*,video/*,image/gif" className="hidden" />
                                                    </label>
                                                ) : (
                                                    <input type="text" value={formAd.square_media_url} onChange={e => setFormAd({ ...formAd, square_media_url: e.target.value })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-[0.65rem] focus:border-accent outline-none" placeholder="Link Home Square" />
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

                                        <button type="submit" disabled={isSavingAd} className={`w-full py-4 rounded-xl font-black uppercase text-xs tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 ${isSavingAd ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-accent text-white hover:brightness-110 shadow-accent/20'}`}>
                                            {isSavingAd ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                    Salvando...
                                                </>
                                            ) : (
                                                editingAdId ? 'Salvar Alterações da Prop' : 'Confirmar Propaganda'
                                            )}
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
                                        className={`glass-panel p-4 sm:p-5 flex items-center gap-3 sm:gap-4 relative group transition-all border-2 ${selectedAds.includes(ad.id) ? 'border-primary bg-primary/[0.03]' : 'border-transparent hover:border-white/5'}`}>

                                        {/* Selection Toggle */}
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (selectedAds.includes(ad.id)) setSelectedAds(selectedAds.filter(id => id !== ad.id));
                                                else setSelectedAds([...selectedAds, ad.id]);
                                            }}
                                            className={`absolute top-2 left-2 w-5 h-5 rounded-lg border flex items-center justify-center transition-all z-10 ${selectedAds.includes(ad.id) ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-black/60 border-white/10 text-transparent hover:border-white/30'}`}
                                        >
                                            <Check size={12} strokeWidth={4} />
                                        </button>

                                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-black/30 border border-white/5 flex-none ml-5">
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
                                        <div className="flex items-center gap-1.5 sm:gap-2 flex-none" onClick={e => e.stopPropagation()}>
                                            {/* Reorder Controls */}
                                            <div className="flex flex-col gap-1 mr-1">
                                                <button
                                                    onClick={() => {
                                                        const index = ads.findIndex(a => a.id === ad.id);
                                                        if (index > 0) {
                                                            const newAds = [...ads];
                                                            [newAds[index - 1], newAds[index]] = [newAds[index], newAds[index - 1]];
                                                            reorderAds(newAds);
                                                        }
                                                    }}
                                                    disabled={ads.findIndex(a => a.id === ad.id) === 0}
                                                    className="p-1.5 rounded bg-white/5 text-slate-500 hover:text-primary hover:bg-white/10 disabled:opacity-0 transition-all border border-transparent hover:border-white/10"
                                                    title="Mover para cima"
                                                >
                                                    <ArrowUp size={12} strokeWidth={3} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const index = ads.findIndex(a => a.id === ad.id);
                                                        if (index < ads.length - 1) {
                                                            const newAds = [...ads];
                                                            [newAds[index + 1], newAds[index]] = [newAds[index], newAds[index + 1]];
                                                            reorderAds(newAds);
                                                        }
                                                    }}
                                                    disabled={ads.findIndex(a => a.id === ad.id) === ads.length - 1}
                                                    className="p-1.5 rounded bg-white/5 text-slate-500 hover:text-primary hover:bg-white/10 disabled:opacity-0 transition-all border border-transparent hover:border-white/10"
                                                    title="Mover para baixo"
                                                >
                                                    <ArrowDown size={12} strokeWidth={3} />
                                                </button>
                                            </div>

                                            <button
                                                onClick={async () => {
                                                    const { error } = await updateAd(ad.id, { active: !ad.active });
                                                    if (error) alert('❌ Erro ao mudar status: ' + error);
                                                }}
                                                className={`p-3 sm:p-2 rounded-lg transition-all ${ad.active ? 'text-accent bg-accent/10 border border-accent/20' : 'text-slate-600 bg-white/5 border border-white/10'}`}
                                                title={ad.active ? 'Desativar' : 'Ativar'}
                                            >
                                                <Monitor size={14} />
                                            </button>
                                            <button
                                                onClick={() => startEditAd(ad)}
                                                className="p-3 sm:p-2 rounded-lg text-primary bg-primary/10 hover:bg-primary hover:text-white border border-primary/20 transition-all font-bold"
                                                title="Editar"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('Excluir esta propaganda?')) {
                                                        deleteAd(ad.id);
                                                    }
                                                }}
                                                className="p-3 sm:p-2 rounded-lg text-danger bg-danger/10 hover:bg-danger hover:text-white border border-danger/20 transition-all font-bold"
                                                title="Excluir"
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
                                    <p className="text-white font-black truncate text-base leading-tight mt-1">{user?.user_metadata?.full_name || user?.user_metadata?.name || 'Administrador'}</p>
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

                        </div>
                    </div>

                    {/* YouTube Integration */}
                    <div className="glass-panel p-8 bg-black/40 border border-primary/20 relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                            <Video size={160} />
                        </div>
                        <h2 className="text-xl font-black text-white font-outfit uppercase tracking-widest mb-4 flex items-center gap-3">
                            <Video size={22} className="text-red-500" /> YouTube Live
                        </h2>
                        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                            Conecte seu canal para criar lives automáticas ao iniciar cada jogo. O título seguirá o padrão: Liga - Time A x Time B.
                        </p>
                        
                        {!isYtAuthenticated ? (
                            <button
                                onClick={ytLogin}
                                className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-lg shadow-red-600/20"
                            >
                                <Video size={18} /> Conectar YouTube
                            </button>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-500">
                                    <CheckCircle2 size={18} />
                                    <span className="text-xs font-bold uppercase tracking-wider">Canal Conectado</span>
                                </div>
                                <button
                                    onClick={ytLogout}
                                    className="w-full bg-white/5 hover:bg-red-500/10 hover:text-red-500 text-slate-400 px-6 py-3 rounded-xl font-bold text-[0.7rem] uppercase tracking-widest transition-all border border-white/10"
                                >
                                    Desconectar YouTube
                                </button>
                            </div>
                        )}
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
                                {window.location.origin}/{league?.slug || league?.id}/home
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
