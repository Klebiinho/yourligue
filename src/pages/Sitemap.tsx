import { FileText, ArrowLeft, ExternalLink, Globe, MapPin, User, Trophy, Zap, Search } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useLeague } from '../context/LeagueContext';
import { supabase } from '../lib/supabase';
import rawSitemapData from '../sitemap_data.json';

const sitemapData = rawSitemapData as any;

const Sitemap = () => {
    const navigate = useNavigate();
    const { leagues, league } = useLeague();
    const [recentPlayers, setRecentPlayers] = useState<any[]>([]);
    const [recentMatches, setRecentMatches] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRecentData = async () => {
            setIsLoading(true);
            try {
                const { data: p } = await supabase.from('players').select('name, slug').limit(20).order('created_at', { ascending: false });
                const { data: m } = await supabase.from('matches').select('id').limit(20).order('created_at', { ascending: false });
                
                if (p) setRecentPlayers(p.map(x => ({ title: `Jogador: ${x.name}`, path: `/${x.slug}/player` })));
                if (m) setRecentMatches(m.map(x => ({ title: `Partida #${x.id.slice(0, 8)}`, path: `/match/${x.id}` })));
            } catch (error) {
                console.error("Erro ao buscar dados do sitemap:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecentData();
    }, []);

    const scopedPath = (path: string) => {
        if (!league) return path;
        const slugPrefix = `/${league.slug || league.id}`;
        if (path.startsWith(slugPrefix)) return path;
        return `${slugPrefix}${path}`;
    };

    const sections = [
        { title: 'Ligas Ativas', icon: Trophy, items: leagues.map(l => ({ title: l.name, path: `/${l.slug}` })) },
        { title: 'Localizações (Mapas)', icon: MapPin, items: leagues.map(l => ({ title: `Mapa: ${l.name}`, path: `/${l.slug}/localizacao` })) },
        { title: 'Jogadores Recentes', icon: User, items: recentPlayers },
        { title: 'Últimas Partidas', icon: Zap, items: recentMatches },
        { title: 'Páginas do Site', icon: Globe, items: sitemapData.Paginas.map((i: any) => ({ ...i, path: scopedPath(i.path) })) },
        { title: 'Nossos Serviços', icon: FileText, items: sitemapData.Servicos.map((i: any) => ({ ...i, path: scopedPath(i.path) })) },
        { title: 'Blog', icon: FileText, items: sitemapData.Posts.map((i: any) => ({ ...i, path: scopedPath(i.path) })) },
        { title: 'Glossário', icon: FileText, items: sitemapData.Glossario.map((i: any) => ({ ...i, path: scopedPath(i.path) })) },
        { title: 'Dúvidas e FAQ', icon: FileText, items: sitemapData.Alfabeto.map((i: any) => ({ ...i, path: scopedPath(i.path) })) },
        { title: 'Pesquisas Populares', icon: Search, items: (sitemapData.PesquisasFrequentes || []).map((i: any) => ({ ...i, path: scopedPath(i.path) })) },
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-slate-300 font-outfit py-12 px-6 sm:px-12 lg:px-24">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-primary hover:text-white transition-colors mb-8 group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-black uppercase tracking-widest">Voltar</span>
                </button>

                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary shadow-[0_0_15px_rgba(235,255,0,0.2)]">
                        <Globe size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">Mapa Global do Site</h1>
                        <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-bold">Ligas • Jogadores • Partidas • Conteúdo</p>
                    </div>
                </div>

                {/* Hero / SEO Copy Fragment */}
                <div className="bg-white/5 border border-white/10 p-6 sm:p-8 rounded-3xl mb-12 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -mr-32 -mt-32 opacity-50 transition-opacity group-hover:opacity-100" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tight mb-2">
                                YourLeague: Gestão Esportiva de Elite
                            </h2>
                            <p className="text-slate-400 font-medium max-w-2xl text-sm leading-relaxed">
                                Explore todos os recursos da nossa plataforma. Desde o acompanhamento de atletas individuais até o gerenciamento complexo de grandes ligas com súmula digital e transmissão ao vivo.
                            </p>
                        </div>
                        <button onClick={() => navigate('/auth')} className="bg-primary hover:bg-primary/90 text-black px-8 py-4 rounded-xl font-black uppercase text-sm tracking-widest transition-all shadow-[0_0_20px_rgba(235,255,0,0.3)] hover:shadow-[0_0_30px_rgba(235,255,0,0.5)] active:scale-95 flex-shrink-0">
                            COMEÇAR AGORA
                        </button>
                    </div>
                </div>

                {/* Content Sections Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {sections.map((section, idx) => (
                        <div key={idx} className={`flex flex-col gap-4 p-6 bg-white/5 border border-white/10 rounded-3xl hover:border-white/20 transition-all ${section.items.length === 0 && !isLoading ? 'hidden' : ''}`}>
                            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                                <section.icon size={18} className="text-primary" />
                                <h2 className="text-lg font-black text-white uppercase tracking-tight">{section.title}</h2>
                                {section.items.length > 0 && (
                                    <span className="ml-auto text-[0.6rem] font-black text-slate-500 bg-black/40 px-2 py-1 rounded-lg">
                                        {section.items.length}
                                    </span>
                                )}
                            </div>

                            <ul className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {isLoading && section.items.length === 0 ? (
                                    <div className="h-40 flex items-center justify-center">
                                        <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                                    </div>
                                ) : section.items.map((item: any, idy: number) => (
                                    <li key={idy}>
                                        <Link 
                                            to={item.path} 
                                            className="group flex gap-3 text-[0.75rem] font-bold text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-transparent hover:border-white/10"
                                        >
                                            <span className="text-primary/0 group-hover:text-primary transition-colors flex-shrink-0 mt-0.5">
                                                <ExternalLink size={14} />
                                            </span>
                                            <span className="leading-tight">{item.title}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Sitemap;
