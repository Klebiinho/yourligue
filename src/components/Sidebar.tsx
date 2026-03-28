import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Swords, Trophy, Settings, GitBranch, ArrowLeftRight, Grid3x3, X, Signal, Home, Shield, FileText } from 'lucide-react';
import { useLeague } from '../context/LeagueContext';
import { useAuth } from '../context/AuthContext';
import TeamLogo from './TeamLogo';

const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Home', shortLabel: 'Home' },
    { to: '/standings', icon: Trophy, label: 'Tabela', shortLabel: 'Tabela' },
    { to: '/matches', icon: Swords, label: 'Partidas', shortLabel: 'Partidas' },
    { to: '/live', icon: Signal, label: 'Ao Vivo', shortLabel: 'Ao Vivo' },
    { to: '/teams', icon: Users, label: 'Times', shortLabel: 'Times' },
    { to: '/bracket', icon: GitBranch, label: 'Chaveamento', shortLabel: 'Chaveam.' },
    { to: '/settings', icon: Settings, label: 'Config.', shortLabel: 'Config.' },
];

// Primary items configuration is now handled inside the component to react to public view state


const Sidebar = () => {
    const { league, isPublicView, setIsPublicView, isAdmin, setShowAuthModal } = useLeague();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [moreOpen, setMoreOpen] = useState(false);

    // Prefix paths if in a league view, but exclude global paths
    const getLink = (to: string) => {
        const globalPaths = ['/leagues', '/auth', '/politica-de-privacidade', '/termos-de-uso', '/sitemap'];
        if (globalPaths.includes(to)) return to;
        
        return (league && (league.slug || league.id))
            ? `/${league.slug || league.id}${to === '/' ? '/home' : to}`
            : to;
    };

    // Filter nav items: if it's public view OR user is not an admin, show only base items
    const filteredNavItems = (isPublicView || !isAdmin)
        ? navItems.filter(item => ['/', '/live', '/matches', '/standings', '/bracket', '/teams'].includes(item.to))
        : navItems;

    const primaryItems = filteredNavItems.slice(0, 4);
    const secondaryItems = filteredNavItems.slice(4);

    return (
        <>
            {/* ────────────────────────────────────────────────────────────
                MOBILE: Bottom Navigation Bar
                4 main items + "Mais" overflow menu
            ─────────────────────────────────────────────────────────── */}
            <div className="md:hidden">
                {/* "Mais" Overlay Panel */}
                {moreOpen && (
                    <div className="fixed inset-0 z-[55]" onClick={() => setMoreOpen(false)}>
                        {/* Backdrop */}
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                        {/* Panel */}
                        <div className="absolute bottom-[68px] left-0 right-0 z-[60] animate-slide-up"
                            onClick={e => e.stopPropagation()}>
                            <div className="mx-3 mb-1 bg-[#0d0d14]/95 backdrop-blur-2xl rounded-2xl border border-white/[0.08] overflow-hidden shadow-[0_-20px_60px_rgba(0,0,0,0.6)]">
                                {/* Liga switcher */}
                                <button onClick={() => { 
                                    if (!user) {
                                        setShowAuthModal(true);
                                    } else {
                                        navigate('/leagues'); 
                                    }
                                    setMoreOpen(false); 
                                }}
                                    className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/10 transition-all border-b border-white/[0.05] group">
                                    <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-lg shadow-primary/10">
                                        <Home size={20} />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="text-xs font-black text-white font-outfit uppercase tracking-wide leading-tight">Central de Ligas</p>
                                        <p className="text-[0.55rem] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Explorar / Seguidas</p>
                                    </div>
                                    <ArrowLeftRight size={16} className="text-slate-600 flex-none group-hover:rotate-180 transition-transform duration-500" />
                                </button>

                                {isPublicView && isAdmin && (
                                    <button onClick={() => {
                                        setIsPublicView(false);
                                        navigate('/');
                                        setMoreOpen(false);
                                    }}
                                        className="w-full flex items-center gap-4 px-5 py-4 bg-accent/10 hover:bg-accent/20 transition-all border-b border-white/[0.05] group">
                                        <div className="w-10 h-10 rounded-2xl bg-accent flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg shadow-accent/20 animate-pulse">
                                            <Settings size={20} />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className="text-xs font-black text-accent font-outfit uppercase tracking-wide leading-tight">Mudar para Modo Gestor</p>
                                            <p className="text-[0.55rem] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Gerenciar Liga / Configurações</p>
                                        </div>
                                    </button>
                                )}

                                {/* Secondary nav items in grid */}
                                <div className="grid grid-cols-3 divide-x divide-y divide-white/[0.05]">
                                    {secondaryItems.map((item) => (
                                        <NavLink
                                            key={item.to}
                                            to={getLink(item.to)}
                                            end={item.to === '/'}
                                            onClick={() => setMoreOpen(false)}
                                            className={({ isActive }) =>
                                                `flex flex-col items-center justify-center gap-2 py-5 transition-all ${isActive ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-white/[0.04] hover:text-slate-200'}`
                                            }
                                        >
                                            {({ isActive }) => (
                                                <>
                                                    <item.icon size={22} strokeWidth={isActive ? 2.5 : 1.75} />
                                                    <span className="text-[0.6rem] font-black uppercase tracking-wider leading-none">{item.label}</span>
                                                </>
                                            )}
                                        </NavLink>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bottom bar itself */}
                <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#07070a]/95 backdrop-blur-2xl border-t border-white/[0.06] shadow-[0_-8px_40px_rgba(0,0,0,0.5)]">
                    <div className="flex items-stretch justify-around h-[64px] px-1">
                        {/* 4 primary items */}
                        {primaryItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={getLink(item.to)}
                                end={item.to === '/'}
                                className={({ isActive }) =>
                                    `flex flex-col items-center justify-center gap-1 flex-1 px-1 transition-all duration-200 relative ${isActive ? 'text-primary' : 'text-slate-600 active:text-slate-300'}`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        {/* Active indicator line */}
                                        {isActive && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" />}
                                        <div className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 ${isActive ? 'bg-primary/15' : ''}`}>
                                            <item.icon size={19} strokeWidth={isActive ? 2.5 : 1.75} />
                                        </div>
                                        <span className={`text-[0.5rem] font-black uppercase tracking-[0.06em] leading-none ${isActive ? 'text-primary' : 'text-slate-600'}`}>
                                            {item.shortLabel}
                                        </span>
                                    </>
                                )}
                            </NavLink>
                        ))}

                        {/* "Mais" / More button */}
                        <button
                            onClick={() => setMoreOpen(!moreOpen)}
                            className={`flex flex-col items-center justify-center gap-1 flex-1 px-1 transition-all duration-200 relative ${moreOpen ? 'text-accent' : 'text-slate-600'}`}
                        >
                            {moreOpen && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-accent rounded-full" />}
                            <div className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 ${moreOpen ? 'bg-accent/15' : ''}`}>
                                {moreOpen ? <X size={19} strokeWidth={2.5} /> : <Grid3x3 size={19} strokeWidth={1.75} />}
                            </div>
                            <span className={`text-[0.5rem] font-black uppercase tracking-[0.06em] leading-none ${moreOpen ? 'text-accent' : 'text-slate-600'}`}>
                                Mais
                            </span>
                        </button>
                    </div>

                    {/* iPhone home indicator space */}
                    <div className="h-[env(safe-area-inset-bottom,0px)]" />
                </nav>
            </div>

            {/* ────────────────────────────────────────────────────────────
                DESKTOP: Left Sidebar
            ─────────────────────────────────────────────────────────── */}
            <aside className="hidden md:flex flex-col fixed top-0 left-0 h-screen w-64 bg-[#050508]/80 backdrop-blur-2xl border-r border-white/[0.05] z-40 shadow-2xl">
                {/* League Header */}
                <div
                    onClick={() => navigate(getLink('/'))}
                    className="flex items-center gap-3.5 p-5 mb-2 cursor-pointer hover:bg-white/[0.03] transition-colors rounded-2xl m-3 border border-white/[0.03] group"
                >
                    <div className="relative flex-none">
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-60 transition-opacity" />
                        <TeamLogo src={league?.logo} size={40} fallbackIcon={<img src="/logo.png" className="w-6 h-6 object-contain opacity-50 transition-opacity duration-300" />} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                            <h2 className="text-sm font-black text-white truncate font-outfit uppercase tracking-wide leading-tight group-hover:text-primary transition-colors">
                                {league?.name ?? 'Selecionar Liga'}
                            </h2>
                        </div>
                        <p className="text-[0.6rem] text-slate-600 font-bold uppercase tracking-[0.15em] mt-0.5">
                            {(isPublicView || !isAdmin) ? <span className="text-accent">MODO ESPECTADOR</span> : 'YourLigue'}
                        </p>
                    </div>
                </div>

                <div className="mx-5 h-px bg-white/[0.05] mb-3" />

                {/* Nav Links */}
                <nav className="flex-1 flex flex-col gap-0.5 px-3 py-2 overflow-y-auto no-scrollbar">
                    <p className="text-[0.55rem] font-black text-slate-700 uppercase tracking-[0.2em] px-3 py-2">
                        {(isPublicView || !isAdmin) ? 'Acompanhamento' : 'Menu Principal'}
                    </p>
                    {isPublicView && isAdmin && (
                        <div className="px-3 py-2">
                            <button
                                onClick={() => {
                                    setIsPublicView(false);
                                    navigate(league ? `/${league.slug || league.id}/home` : '/');
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 bg-accent/20 text-accent border border-accent/30 rounded-xl hover:bg-accent/30 transition-all font-black text-xs uppercase tracking-widest shadow-lg shadow-accent/10 group"
                            >
                                <Settings size={18} className="group-hover:rotate-90 transition-transform duration-500" />
                                <span>Modo Gestor</span>
                            </button>
                        </div>
                    )}
                    
                    {filteredNavItems.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={getLink(to)}
                            end={to === '/'}
                            className={({ isActive }) =>
                                `flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-semibold ${isActive
                                    ? 'bg-primary/15 text-white shadow-[inset_0_0_0_1px_rgba(109,40,217,0.25)]'
                                    : 'text-slate-500 hover:text-white hover:bg-white/[0.04]'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <div className={`flex-none transition-all duration-200 ${isActive ? 'text-primary scale-110' : 'group-hover:scale-105'}`}>
                                        <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                                    </div>
                                    <span className={`font-bold tracking-wide text-[0.8rem] flex-1 ${isActive ? 'text-white' : ''}`}>
                                        {label}
                                    </span>
                                    {isActive && (
                                        <div className="w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_6px_rgba(109,40,217,0.8)] flex-none" />
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}

                    <div className="mt-4 pt-4 border-t border-white/[0.05]">
                        <button
                            onClick={() => {
                                if (!user) {
                                    setShowAuthModal(true);
                                } else {
                                    navigate('/leagues');
                                }
                            }}
                            className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-slate-500 hover:text-white hover:bg-primary/10 w-full transition-all group font-bold text-[0.8rem] tracking-wide"
                        >
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-primary/20 group-hover:text-primary transition-all">
                                <Home size={16} />
                            </div>
                            <span>Central de Ligas</span>
                        </button>
                    </div>
                </nav>

                {/* Footer */}
                <div className="p-3 border-t border-white/[0.05] space-y-1">
                    
                    <button
                        onClick={() => navigate('/politica-de-privacidade')}
                        className="flex items-center gap-3 px-4 py-2 rounded-xl text-slate-600 hover:text-primary hover:bg-primary/5 w-full transition-all group font-bold text-[0.7rem] tracking-wide"
                    >
                        <Shield size={14} className="flex-none" />
                        <span>Privacidade</span>
                    </button>

                    <button
                        onClick={() => navigate('/termos-de-uso')}
                        className="flex items-center gap-3 px-4 py-2 rounded-xl text-slate-600 hover:text-primary hover:bg-primary/5 w-full transition-all group font-bold text-[0.7rem] tracking-wide"
                    >
                        <FileText size={14} className="flex-none" />
                        <span>Termos</span>
                    </button>
                </div>
            </aside >
        </>
    );
};

export default Sidebar;
