import { FileText, ArrowLeft, ExternalLink, Globe } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import rawSitemapData from '../sitemap_data.json';
const sitemapData = rawSitemapData as any;

const Sitemap = () => {
    const navigate = useNavigate();

    const sections = [
        { title: 'Páginas do Site', icon: Globe, items: sitemapData.Paginas },
        { title: 'Nossos Serviços', icon: FileText, items: sitemapData.Servicos },
        { title: 'Blog', icon: FileText, items: sitemapData.Posts },
        { title: 'Glossário', icon: FileText, items: sitemapData.Glossario },
        { title: 'Categorias', icon: FileText, items: sitemapData.Categorias },
        { title: 'Autores', icon: FileText, items: sitemapData.Autores },
        { title: 'Navegação A-Z', icon: FileText, items: sitemapData.Alfabeto },
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-slate-300 font-outfit py-12 px-6 sm:px-12 lg:px-24">
            <div className="max-w-6xl mx-auto">
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
                        <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">Mapa do Site</h1>
                        <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-bold">Início • Serviços • Blog • Glossário</p>
                    </div>
                </div>

                {/* Hero / SEO Copy Fragment */}
                <div className="bg-white/5 border border-white/10 p-6 sm:p-8 rounded-3xl mb-12 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -mr-32 -mt-32 transition-opacity group-hover:opacity-100 opacity-50" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tight mb-2">
                                YourLeague: A Plataforma Definitiva
                            </h2>
                            <p className="text-slate-400 font-medium max-w-2xl text-sm leading-relaxed">
                                O aplicativo completo para gerenciar ligas de várzea, organizar campeonatos e transmitir jogos ao vivo com qualidade profissional. Do chaveamento da competição à integração com o YouTube, nós entregamos a melhor experiência para organizadores, times e torcedores.
                            </p>
                        </div>
                        <button onClick={() => navigate('/leagues')} className="bg-primary hover:bg-primary/90 text-black px-8 py-4 rounded-xl font-black uppercase text-sm tracking-widest transition-all shadow-[0_0_20px_rgba(235,255,0,0.3)] hover:shadow-[0_0_30px_rgba(235,255,0,0.5)] active:scale-95 flex-shrink-0">
                            CRIE O SEU CAMPEONATO AGORA
                        </button>
                    </div>
                </div>

                {/* Content Sections Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {sections.map((section, idx) => (
                        <div key={idx} className="flex flex-col gap-4">
                            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                                <section.icon size={20} className="text-primary" />
                                <h2 className="text-xl font-black text-white uppercase tracking-tight">{section.title}</h2>
                                <span className="ml-auto text-xs font-bold text-slate-500 bg-white/5 px-2 py-1 rounded">
                                    {section.items.length}
                                </span>
                            </div>

                            <ul className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {section.items.map((item: any, idy: number) => (
                                    <li key={idy}>
                                        <Link 
                                            to={item.path} 
                                            className="group flex gap-3 text-sm font-medium text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-3 rounded-lg border border-transparent hover:border-white/10"
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
