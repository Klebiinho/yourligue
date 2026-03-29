import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
    Calendar, ArrowLeft, Share2, MessageCircle, 
    BookOpen, Briefcase, Tag, User, HelpCircle,
    ArrowRight, Globe, Shield, Info
} from 'lucide-react';
import { useEffect, useState } from 'react';
import rawSitemapData from '../sitemap_data.json';

const sitemapData = rawSitemapData as any;

const DynamicContent = () => {
    const { slug, type, letter } = useParams<{ slug?: string; type?: string; letter?: string }>();
    const navigate = useNavigate();
    const [content, setContent] = useState<any>(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        
        // Determinar o tipo com base no prefixo ou no parâmetro type
        let found = null;
        const currentPath = window.location.pathname;

        // Procurar em todas as seções do sitemap
        for (const section in sitemapData) {
            found = sitemapData[section].find((item: any) => item.path === currentPath);
            if (found) {
                found.section = section;
                break;
            }
        }

        if (found) {
            setContent(found);
        } else {
            // Fallback para rotas dinâmicas como /duvidas/a
            if (letter) {
                setContent({
                    title: `Dúvidas - Letra ${letter.toUpperCase()}`,
                    section: 'Alfabeto',
                    date: '2026-03-22'
                });
            }
        }
    }, [slug, type, letter]);

    if (!content) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
                    <HelpCircle size={40} />
                </div>
                <h1 className="text-2xl font-black text-white uppercase mb-2">Página em Construção</h1>
                <p className="text-slate-500 mb-8 max-w-md">Estamos preparando o melhor conteúdo para você. Volte em breve!</p>
                <button onClick={() => navigate('/sitemap')} className="bg-primary text-black px-8 py-4 rounded-xl font-black uppercase text-xs tracking-widest">
                    Ver Mapa do Site
                </button>
            </div>
        );
    }

    const getIcon = (section: string) => {
        switch (section) {
            case 'Posts': return <BookOpen size={16} />;
            case 'Servicos': return <Briefcase size={16} />;
            case 'Categorias': return <Tag size={16} />;
            case 'Autores': return <User size={16} />;
            case 'Alfabeto': return <HelpCircle size={16} />;
            default: return <Info size={16} />;
        }
    };

    const getLabel = (section: string) => {
        switch (section) {
            case 'Posts': return 'Blog / Notícias';
            case 'Servicos': return 'Nossos Serviços';
            case 'Paginas': return 'Institucional';
            case 'Glossario': return 'Glossário Técnico';
            case 'Categorias': return 'Tópico';
            case 'Autores': return 'Autor Colaborador';
            case 'Alfabeto': return 'Perguntas e Respostas';
            default: return 'Conteúdo';
        }
    };

    return (
        <div className="min-h-screen bg-[#07070a] text-slate-300 font-outfit pb-20">
            {/* Header Hero */}
            <header className="relative py-20 overflow-hidden border-b border-white/5">
                <div className="absolute inset-0 bg-primary/5 blur-[120px] -z-10 animate-pulse" />
                
                <div className="max-w-4xl mx-auto px-6">
                    <button 
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-primary hover:text-white transition-colors mb-10 group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs font-black uppercase tracking-widest">Retornar</span>
                    </button>

                    <div className="flex items-center gap-3 mb-6">
                        <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[0.65rem] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                            {getIcon(content.section)} {getLabel(content.section)}
                        </span>
                        {content.date && (
                            <span className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                <Calendar size={12} className="text-slate-700" /> {content.date}
                            </span>
                        )}
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight mb-8">
                        {content.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/10 pr-6">
                            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary font-black uppercase shadow-lg">
                                YL
                            </div>
                            <div>
                                <p className="text-[0.65rem] font-black text-white uppercase tracking-widest">Publicado por</p>
                                <p className="text-xs text-slate-400 font-medium italic">Equipe YourLeague</p>
                            </div>
                        </div>
                        
                        <div className="flex gap-2">
                            <button className="w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center transition-all">
                                <Share2 size={16} className="text-slate-400" />
                            </button>
                            <button className="w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center transition-all">
                                <MessageCircle size={16} className="text-slate-400" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Body */}
            <article className="max-w-4xl mx-auto px-6 py-16">
                <div className="prose prose-invert prose-p:text-slate-400 prose-p:leading-relaxed prose-p:text-lg prose-headings:text-white prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight max-w-none space-y-12">
                    
                    {/* Placeholder Content Section 1 */}
                    <div className="space-y-6">
                        <h2 className="text-2xl border-l-4 border-primary pl-6">O que você precisa saber sobre {content.title}</h2>
                        <p>
                            No cenário competitivo atual, entender profundamente {content.title.toLowerCase()} é fundamental para o sucesso de qualquer organização de campeonatos. A YourLeague está comprometida em fornecer as ferramentas mais avançadas para transformar sua visão em realidade.
                        </p>
                        <p>
                            Nossa plataforma foi desenhada focando na experiência do usuário, garantindo que cada detalhe de {content.title.toLowerCase()} seja tratado com o profissionalismo que o futebol amador e semiprofissional merece.
                        </p>
                    </div>

                    {/* Dynamic Image Placeholder */}
                    <div className="relative group rounded-3xl overflow-hidden border border-white/5 shadow-2xl aspect-video bg-white/5">
                         <div className="absolute inset-0 flex items-center justify-center flex-col gap-4">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary animate-pulse">
                                <Globe size={32} />
                            </div>
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">YourLeague Content Hub</p>
                         </div>
                         <div className="absolute bottom-6 left-6 right-6 p-6 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                             <p className="text-xs font-bold text-white uppercase mb-1">Impacto Tecnológico</p>
                             <p className="text-[0.65rem] text-slate-400 uppercase tracking-widest leading-none">A evolução do esporte passa pela digitalização extrema.</p>
                         </div>
                    </div>

                    {/* Placeholder Content Section 2 */}
                    <div className="space-y-6">
                        <h3 className="text-xl">Como a YourLeague ajuda neste processo?</h3>
                        <p>
                            Através da nossa tecnologia de ponta, permitimos que você foque no que realmente importa: a emoção do esporte. O gerenciamento de {content.title.toLowerCase()} torna-se automatizado e transparente para jogadores, patrocinadores e torcedores.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                            <div className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:border-primary/20 transition-all cursor-default">
                                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center text-primary mb-4">
                                    <Shield size={16} />
                                </div>
                                <h4 className="text-sm font-black text-white uppercase mb-2">Segurança de Dados</h4>
                                <p className="text-xs text-slate-500 leading-relaxed font-medium capitalize italic">Controle total sobre as informações da sua liga e atletas.</p>
                            </div>
                            <div className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:border-primary/20 transition-all cursor-default">
                                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center text-primary mb-4">
                                    <Zap className="w-4 h-4" />
                                </div>
                                <h4 className="text-sm font-black text-white uppercase mb-2">Velocidade Extrema</h4>
                                <p className="text-xs text-slate-500 leading-relaxed font-medium capitalize italic">Atualizações em tempo real para tabelas, gols e cartões.</p>
                            </div>
                        </div>
                    </div>

                    {/* Call to Action Row */}
                    <div className="pt-12 mt-12 border-t border-white/5 flex flex-col items-center text-center">
                        <div className="w-16 h-1 w-12 bg-primary/30 rounded-full mb-8" />
                        <h2 className="text-3xl font-black text-white uppercase mb-4 tracking-tighter">Pronto para elevar o nível da sua liga?</h2>
                        <p className="text-slate-400 mb-10 max-w-xl text-sm font-bold uppercase tracking-widest">
                            Junte-se a centenas de organizadores que já transformaram seus campeonatos com a YourLeague.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                            <button onClick={() => navigate('/auth')} className="bg-primary text-black px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-[0_0_30px_rgba(235,255,0,0.2)] hover:shadow-[0_0_50px_rgba(235,255,0,0.4)] transition-all transform hover:-translate-y-1">
                                COMEÇAR GRATUITAMENTE
                            </button>
                            <button onClick={() => navigate('/leagues')} className="bg-white/5 text-white border border-white/10 px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-white/10 transition-all">
                                EXPLORAR LIGAS
                            </button>
                        </div>
                    </div>
                </div>
            </article>

            {/* Content Suggestions Section */}
            <aside className="bg-white/5 py-20 mt-10">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="flex items-center justify-between mb-10 border-b border-white/10 pb-6">
                        <h2 className="text-xl font-black text-white uppercase tracking-tighter">Conteúdos Relacionados</h2>
                        <Link to="/sitemap" className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2 group">
                            Ver todos <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {sitemapData.Posts.slice(0, 2).map((post: any, i: number) => (
                            <Link key={i} to={post.path} className="p-6 bg-black/40 border border-white/5 rounded-3xl hover:border-primary/30 transition-all group">
                                <p className="text-[0.6rem] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <BookOpen size={12} className="text-primary" /> Blog / Notícias
                                </p>
                                <h3 className="text-lg font-bold text-white leading-tight group-hover:text-primary transition-colors">{post.title}</h3>
                            </Link>
                        ))}
                    </div>
                </div>
            </aside>
        </div>
    );
};

const Zap = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

export default DynamicContent;
