import { useLeague } from '../context/LeagueContext';
import { MapPin, Navigation, Globe, Phone, Clock } from 'lucide-react';
import { useEffect } from 'react';

const LeagueLocation = () => {
    const { league } = useLeague();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (!league) return null;

    const hasCoords = league.lat && league.lng;
    const googleMapsUrl = hasCoords 
        ? `https://www.google.com/maps/search/?api=1&query=${league.lat},${league.lng}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(league.address || league.name)}`;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header / Hero */}
            <div className="relative h-64 md:h-80 rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
                 <div className="absolute inset-0 bg-gradient-to-t from-[#07070a] via-transparent to-transparent z-10" />
                 {hasCoords ? (
                    <iframe 
                        width="100%" 
                        height="100%" 
                        frameBorder="0" 
                        style={{ border: 0, opacity: 0.6 }}
                        src={`https://www.google.com/maps/embed/v1/place?key=REPLACE_WITH_MAPS_KEY&q=${league.lat},${league.lng}`}
                        allowFullScreen
                    ></iframe>
                 ) : (
                    <div className="w-full h-full bg-primary/5 flex items-center justify-center">
                        <MapPin size={64} className="text-primary/20 animate-pulse" />
                    </div>
                 )}
                 
                 <div className="absolute bottom-8 left-8 right-8 z-20">
                    <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-2">
                        {league.address || 'Localização da Liga'}
                    </h1>
                    <p className="text-slate-400 font-medium flex items-center gap-2">
                        <MapPin size={16} className="text-primary" /> {league.name} • {league.address || 'Endereço não especificado'}
                    </p>
                 </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-1 md:col-span-2 space-y-6">
                    <div className="p-8 bg-white/5 border border-white/10 rounded-3xl">
                        <h2 className="text-xl font-black text-white uppercase mb-6 flex items-center gap-3">
                            <Navigation size={20} className="text-primary" /> Como Chegar
                        </h2>
                        <p className="text-slate-400 leading-relaxed mb-8">
                            A sede ou campo principal da <strong>{league.name}</strong> está situada em um local estratégico para garantir o melhor acesso aos atletas e torcedores. Atualmente cadastrada como: <span className="text-white font-bold">{league.address || 'Endereço Principal'}</span>.
                        </p>
                        
                        <div className="flex flex-wrap gap-4">
                            <a 
                                href={googleMapsUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex-1 min-w-[200px] bg-primary text-black p-4 rounded-2xl font-black uppercase text-xs tracking-widest text-center shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                            >
                                Abrir no Google Maps
                            </a>
                            <a 
                                href={`https://waze.com/ul?ll=${league.lat},${league.lng}&navigate=yes`}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex-1 min-w-[200px] bg-white/5 border border-white/10 text-white p-4 rounded-2xl font-black uppercase text-xs tracking-widest text-center hover:bg-white/10 transition-all"
                            >
                                Ir com Waze
                            </a>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                            <Clock size={20} className="text-primary mb-4" />
                            <h3 className="text-sm font-black text-white uppercase mb-1">Horário de Funcionamento</h3>
                            <p className="text-xs text-slate-500 italic">Verificar com a organização da liga</p>
                        </div>
                        <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                            <Phone size={20} className="text-primary mb-4" />
                            <h3 className="text-sm font-black text-white uppercase mb-1">Contato Direto</h3>
                            <p className="text-xs text-slate-500 italic">Disponível no dashboard da liga</p>
                        </div>
                    </div>
                </div>

                <aside className="space-y-6">
                    <div className="p-8 bg-primary/10 border border-primary/20 rounded-3xl">
                        <Globe size={24} className="text-primary mb-6" />
                        <h3 className="text-lg font-black text-white uppercase mb-4 leading-tight">Presença Digital Local</h3>
                        <p className="text-xs text-slate-400 leading-relaxed mb-6 font-medium italic">
                            Esta página ajuda a indexar sua liga em buscas locais do Google como "Ligas em São Paulo" ou "Campeonatos de Bairro".
                        </p>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-primary w-[85%] rounded-full shadow-[0_0_10px_rgba(235,255,0,0.5)]" />
                        </div>
                        <p className="text-[0.6rem] font-black text-slate-500 uppercase mt-2 tracking-widest">Otimização SEO Local: 85%</p>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default LeagueLocation;
