import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
    Calendar, ArrowLeft, Share2, MessageCircle, 
    BookOpen, Briefcase, Tag, User, HelpCircle,
    ArrowRight, Globe, Shield, Info, Search
} from 'lucide-react';
import { useEffect, useState } from 'react';
import rawSitemapData from '../sitemap_data.json';

const sitemapData = rawSitemapData as any;

const DynamicContent = () => {
    const { slug, type, letter } = useParams<{ slug?: string; type?: string; letter?: string }>();
    const navigate = useNavigate();
    const [content, setContent] = useState<any>(null);
    const [listItems, setListItems] = useState<any[]>([]);

    useEffect(() => {
        window.scrollTo(0, 0);
        
        const currentPath = window.location.pathname;
        
        // Normalize path: if we're in a league scope (e.g., /testeb/blog/post), 
        // strip the slug to match sitemapData paths (e.g., /blog/post).
        const normalizedPath = (slug && currentPath.startsWith(`/${slug}`)) 
            ? currentPath.substring(slug.length + 1) 
            : currentPath;

        let found = null;

        // Check for listing pages first
        if (normalizedPath === '/blog') {
            setContent({ title: 'Blog YourLeague', section: 'Posts', date: 'Atualizado hoje' });
            setListItems(sitemapData.Posts);
            return;
        }

        if (normalizedPath === '/duvidas' || normalizedPath === '/duvidas-de-a-a-z') {
            setContent({ title: 'Dúvidas de A a Z', section: 'Alfabeto', date: 'FAQ Oficial' });
            setListItems(sitemapData.Alfabeto);
            return;
        }

        if (normalizedPath === '/servicos') {
            setContent({ title: 'Nossos Serviços', section: 'Servicos', date: 'Portfólio' });
            setListItems(sitemapData.Servicos);
            return;
        }

        if (normalizedPath === '/glossario') {
            setContent({ title: 'Glossário Técnico', section: 'Glossario', date: 'Base de Conhecimento' });
            setListItems(sitemapData.Glossario);
            return;
        }

        if (normalizedPath === '/categoria') {
            setContent({ title: 'Categorias de Conteúdo', section: 'Categorias', date: 'Navegação' });
            setListItems(sitemapData.Categorias);
            return;
        }

        if (normalizedPath === '/autor') {
            setContent({ title: 'Nossos Autores', section: 'Autores', date: 'Equipe' });
            setListItems(sitemapData.Autores);
            return;
        }

        if (normalizedPath === '/busca') {
            setContent({ title: 'Tendências de Busca', section: 'PesquisasFrequentes', date: 'SEO / Orgânico' });
            setListItems(sitemapData.PesquisasFrequentes || []);
            return;
        }

        // Generic search in sitemap
        for (const section in sitemapData) {
            found = sitemapData[section].find((item: any) => item.path === normalizedPath);
            if (found) {
                found.section = section;
                break;
            }
        }

        if (found) {
            setContent(found);
            setListItems([]);
        } else if (letter) {
            const letterItems = sitemapData.Alfabeto.filter((item: any) => item.title.includes(`Letra ${letter.toUpperCase()}`));
            setContent({ title: `Dúvidas - Letra ${letter.toUpperCase()}`, section: 'Alfabeto', date: '2026-03-22' });
            setListItems(letterItems);
        }
    }, [slug, type, letter]);

    const generateSmartAnswer = (title: string, path: string): string[] => {
        const t = title.toLowerCase();
        
        // --- INSTITUTIONAL PAGES OVERRIDES ---
        if (path.includes('/politica-de-privacidade')) return [
            "A privacidade dos dados da sua liga é a base de nossa arquitetura. Na YourLeague, todas as informações de atletas, pagamentos e históricos de campeonatos são processados sob protocolos avançados de criptografia.",
            "Nossas diretrizes de conformidade asseguram que nenhuma informação de contato seja comercializada. Se você atua como organizador ou jogador, tem controle total sobre quais informações ficam públicas nos rankings e nas chaves.",
            "Para auditorias de privacidade relativas ao cruzamento de dados de federações e times independentes, oferecemos visibilidade integral nas configurações do seu perfil de usuário."
        ];
        if (path.includes('/termos-de-uso')) return [
            "Os Termos de Uso definem a relação entre os organizadores de campeonatos e a infraestrutura tecnológica do YourLeague. Ao registrar uma liga na plataforma, o administrador aceita operar o sistema com transparência esportiva.",
            "É expressamente proibida a manipulação fraudulenta de estatísticas, artilharias e suspensões. O sistema mantém registros imutáveis e detalhados (logs) de quem aprova e remove transferências de atletas entre equipes.",
            "O uso indiscriminado das chaves de API para transmissões e overlays exige integridade: não modifique emblemas e não faça uploads de documentações irregulares nas inscrições."
        ];
        if (path.includes('/regulamento-geral')) return [
            "O Regulamento Geral de Competições atua como a espinha dorsal de qualquer liga esportiva estruturada na plataforma YourLeague.",
            "Nesta seção, fornecemos o framework onde qualquer administrador deve estabelecer regras de ascensão, rebaixamento, critério de desempates e janela de transferências antes do campeonato iniciar.",
            "Configurações registradas no painel da liga não podem ser alteradas sem notificação massiva aos representantes de equipe, assegurando assim que WO's e penalidades não abalem a integridade do campeonato."
        ];

        // --- DYNAMIC CONTENT GENERATOR (BLOG/FAQ/SERVICOS) ---
        const paragraphs = [];

        // Topic 1: Technology & Summaries
        if (t.includes('súmula') || t.includes('cartão') || t.includes('cartões') || t.includes('falta') || t.includes('árbitro') || t.includes('tabela')) {
            paragraphs.push(`Eliminar a dependência de papéis na quadra ou campo é o primeiro passo para profissionalizar qualquer organização. Com o **${title}**, os organizadores utilizam o aplicativo para registrar gols, cestas e faltas diretamente no sistema, reduzindo drasticamente falhas de anotação na beira do campo.`);
            paragraphs.push("Esse processo eletrônico impede rasuras, elimina perda de registros durante condições climáticas adversas e joga toda a responsabilidade de conferência para a nuvem da YourLeague em tempo real.");
        } 
        // Topic 2: Broadcasting & Streaming
        else if (t.includes('transmissão') || t.includes('youtube') || t.includes('overlay') || t.includes('live')) {
            paragraphs.push(`A revolução do esporte de final de semana, o **${title}**, democratizou o acesso à audiência. A plataforma interliga diretamente os dados da sua partida ao vivo com ferramentas robustas como OBS Studio e vMix.`);
            paragraphs.push("A experiência de quem assiste salta de uma simples live caseira para um espetáculo que inclui cronômetro sincronizado, escudos renderizados e painel de estatísticas, essencial para fisgar grandes patrocinadores no seu ecossistema.");
        }
        // Topic 3: Management & Athletes
        else if (t.includes('gestão') || t.includes('organizar') || t.includes('atleta') || t.includes('profissional') || t.includes('equipe')) {
            paragraphs.push(`No fundo, a verdadeira questão envolvendo **${title}** é a gestão humana e o controle financeiro. Campeonatos sem controle eficiente de transferências costumam desmoronar nas fases decisivas.`);
            paragraphs.push("Com o painel unificado da YourLeague, a escalação é blindada eletronicamente. Jogadores suspensos não possuem permissão na súmula digital para jogar, poupando a equipe de arbitragem de debates infindáveis que quebram a credibilidade do torneio.");
        }
        // Topic 4: Role of the Captain
        else if (t.includes('capitão') || t.includes('titular') || t.includes('amador')) {
            paragraphs.push(`A figura do representante de equipe evoluiu muito, e compreender o tema **${title}** é essencial. O capitão não gesticula só em quadra: é o principal elo burocrático de toda a transação da equipe.`);
            paragraphs.push("Ele é o responsável por certificar exames, confirmar presenças via link e validar a escalação enviada pelo organizador da liga, distribuindo a carga de responsabilidade uniformemente através do app.");
        }
        // Topic 5: Search & Typos (SEO)
        else if (path.includes('/busca/')) {
            paragraphs.push(`Você buscou por "${title}". Este é um dos termos mais frequentes entre organizadores que buscam profissionalizar suas competições.`);
            paragraphs.push("Muitas vezes, a busca por soluções esportivas começa com termos simples ou até variações do nome da nossa marca, mas o destino final é sempre o mesmo: uma gestão de elite que garanta transparência e engajamento.");
            paragraphs.push("O YourLeague resolve exatamente essa dor de cabeça, automatizando tabelas e integrando placares ao vivo para que sua liga seja encontrada e respeitada em qualquer busca orgânica.");
        }
        // Fallback robusto genérico adaptativo
        else {
            paragraphs.push(`Discutir intensamente sobre **${title}** é tratar exatamente o que difere torneios comuns de grandes eventos da várzea. A infraestrutura digital chegou ao esporte local não apenas como luxo, mas como necessidade.`);
            paragraphs.push("Desde calendários imutáveis até o acompanhamento rodada a rodada do cestinha ou artilheiro, nossa plataforma cuida do operacional para que as equipes possam concentrar esforços puramente na rivalidade esportiva sadia.");
        }

        paragraphs.push("Se a sua liga quiser alcançar a estabilidade e reconhecimento definitivo, automatizar as etapas supracitadas utilizando o painel unificado e mobile-first da YourLeague é vital.");
        
        return paragraphs;
    };

    if (!content) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
                    <HelpCircle size={40} />
                </div>
                <h1 className="text-2xl font-black text-white uppercase mb-2">Página não encontrada</h1>
                <p className="text-slate-500 mb-8 max-w-md">Não conseguimos encontrar este tópico específico. Verifique o link ou explore nosso mapa do site.</p>
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
            case 'PesquisasFrequentes': return <Search size={16} />;
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
            case 'PesquisasFrequentes': return 'Tendência de Busca';
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
                {listItems.length > 0 ? (
                    <div className="space-y-12">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {listItems.map((item, idx) => (
                                <Link key={idx} to={(slug && item.path.startsWith('/')) ? `/${slug}${item.path}` : item.path} className="group p-8 bg-white/5 border border-white/10 rounded-3xl hover:border-primary/40 transition-all hover:bg-white/10">
                                    <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                                        {getIcon(content.section)}
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{item.date || 'Ver detalhes'}</p>
                                </Link>
                            ))}
                         </div>
                    </div>
                ) : (
                    <div className="prose prose-invert prose-p:text-slate-400 prose-p:leading-relaxed prose-p:text-lg prose-headings:text-white prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight max-w-none space-y-12">
                        
                        {/* Generated Answer Section */}
                        <div className="space-y-6">
                            <h2 className="text-2xl border-l-4 border-primary pl-6">Guia Definitivo: {content.title}</h2>
                            <div className="font-medium text-slate-200 text-lg leading-relaxed space-y-4">
                                {generateSmartAnswer(content.title, content.path).map((paragraph, index) => (
                                    <p key={index} className={index === 0 ? "italic text-xl text-slate-300" : ""}>
                                        {paragraph}
                                    </p>
                                ))}
                            </div>
                        </div>

                        {/* Dynamic Image Placeholder */}
                        <div className="relative group rounded-3xl overflow-hidden border border-white/5 shadow-2xl aspect-video bg-white/5">
                            <div className="absolute inset-0 flex items-center justify-center flex-col gap-4">
                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary animate-pulse">
                                    <Globe size={32} />
                                </div>
                                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Tecnologia YourLeague Hub</p>
                            </div>
                        </div>

                        {/* Additional Context */}
                        <div className="space-y-6">
                            <h3 className="text-xl">Como otimizar a gestão da sua liga</h3>
                            <p>
                                Implementar processos digitais é o primeiro passo para escalar seu torneio. Através de ferramentas como súmula eletrônica e tabelas automatizadas, você reduz o erro humano em até 95% e libera tempo para focar no marketing e expansão da sua marca esportiva.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                                <div className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:border-primary/20 transition-all cursor-default">
                                    <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center text-primary mb-4">
                                        <Shield size={16} />
                                    </div>
                                    <h4 className="text-sm font-black text-white uppercase mb-2">Transparência Total</h4>
                                    <p className="text-xs text-slate-500 leading-relaxed font-medium italic">Histórico completo de jogadores, artilharia e punições sempre acessível.</p>
                                </div>
                                <div className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:border-primary/20 transition-all cursor-default">
                                    <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center text-primary mb-4">
                                        <Zap className="w-4 h-4" />
                                    </div>
                                    <h4 className="text-sm font-black text-white uppercase mb-2">Engajamento Digital</h4>
                                    <p className="text-xs text-slate-500 leading-relaxed font-medium italic">Overlays profissionais que transformam qualquer live em um evento de elite.</p>
                                </div>
                            </div>
                        </div>

                        {/* Call to Action Row */}
                        <div className="pt-12 mt-12 border-t border-white/5 flex flex-col items-center text-center">
                            <div className="w-16 h-1 w-12 bg-primary/30 rounded-full mb-8" />
                            <h2 className="text-3xl font-black text-white uppercase mb-4 tracking-tighter">Pronto para elevar o nível?</h2>
                            <p className="text-slate-400 mb-10 max-w-xl text-sm font-bold uppercase tracking-widest">
                                Comece a usar o YourLeague hoje mesmo e veja a diferença na organização da sua competição.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                                <button onClick={() => navigate('/auth')} className="bg-primary text-black px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-[0_0_30px_rgba(235,255,0,0.2)] hover:shadow-[0_0_50px_rgba(235,255,0,0.4)] transition-all transform hover:-translate-y-1">
                                    CRIAR MINHA LIGA AGORA
                                </button>
                            </div>
                        </div>
                    </div>
                )}
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
                            <Link key={i} to={(slug && post.path.startsWith('/')) ? `/${slug}${post.path}` : post.path} className="p-6 bg-black/40 border border-white/5 rounded-3xl hover:border-primary/30 transition-all group">
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
