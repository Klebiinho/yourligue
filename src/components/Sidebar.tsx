import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Swords, Trophy, Settings, BarChart2, GitBranch, ArrowLeftRight } from 'lucide-react';
import { useLeague } from '../context/LeagueContext';
import TeamLogo from './TeamLogo';

const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/teams', icon: Users, label: 'Times' },
    { to: '/teams-dashboard', icon: BarChart2, label: 'Painel' },
    { to: '/matches', icon: Swords, label: 'Partidas' },
    { to: '/standings', icon: Trophy, label: 'Tabela' },
    { to: '/bracket', icon: GitBranch, label: 'Chaveamento' },
    { to: '/settings', icon: Settings, label: 'Config' },
];

const Sidebar = () => {
    const { league } = useLeague();
    const navigate = useNavigate();

    return (
        <>
            {/* ── MOBILE: Bottom Navigation Bar ─────────────────────────── */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#07070a]/90 backdrop-blur-xl border-t border-white/[0.06] flex items-center justify-around px-2 py-1 safe-area-inset-bottom shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                {navItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === '/'}
                        className={({ isActive }) =>
                            `flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 min-w-[44px] ${isActive
                                ? 'text-primary'
                                : 'text-slate-600 hover:text-slate-300'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <div className={`p-2 rounded-xl transition-all duration-300 ${isActive ? 'bg-primary/20 shadow-[0_0_15px_rgba(109,40,217,0.3)]' : 'bg-transparent'}`}>
                                    <Icon size={18} strokeWidth={isActive ? 2.5 : 1.75} />
                                </div>
                                <span className={`text-[0.55rem] font-black uppercase tracking-[0.08em] leading-none transition-colors ${isActive ? 'text-primary' : 'text-slate-600'}`}>
                                    {label}
                                </span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* ── DESKTOP: Left Side Rail ────────────────────────────────── */}
            <aside className="hidden md:flex flex-col fixed top-0 left-0 h-screen w-64 bg-[#050508]/80 backdrop-blur-2xl border-r border-white/[0.05] z-40 shadow-2xl">
                {/* Logo / League Header */}
                <div
                    onClick={() => navigate('/leagues')}
                    className="flex items-center gap-3.5 p-5 mb-2 cursor-pointer hover:bg-white/[0.03] transition-colors rounded-2xl m-3 border border-white/[0.03] group"
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-60 transition-opacity" />
                        <TeamLogo src={league?.logo} size={40} fallbackIcon={<Trophy size={18} className="text-primary" />} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h2 className="text-sm font-black text-white truncate font-outfit uppercase tracking-wide leading-tight group-hover:text-primary transition-colors">
                            {league?.name ?? 'Selecionar Liga'}
                        </h2>
                        <p className="text-[0.6rem] text-slate-600 font-bold uppercase tracking-[0.15em] mt-0.5">Championship Manager</p>
                    </div>
                </div>

                {/* Divider */}
                <div className="mx-5 h-px bg-white/[0.05] mb-3" />

                {/* Nav Links */}
                <nav className="flex-1 flex flex-col gap-1 px-3 py-2 overflow-y-auto no-scrollbar">
                    <p className="text-[0.55rem] font-black text-slate-700 uppercase tracking-[0.2em] px-3 py-2">Menu Principal</p>
                    {navItems.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === '/'}
                            className={({ isActive }) =>
                                `flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-300 group text-sm font-semibold ${isActive
                                    ? 'bg-primary/15 text-white shadow-[inset_0_0_0_1px_rgba(109,40,217,0.3)]'
                                    : 'text-slate-500 hover:text-white hover:bg-white/[0.04]'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <div className={`transition-all duration-300 ${isActive ? 'text-primary scale-110' : 'group-hover:scale-105'}`}>
                                        <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                                    </div>
                                    <span className={`font-bold tracking-wide text-[0.8rem] ${isActive ? 'text-white' : ''}`}>
                                        {label}
                                    </span>
                                    {isActive && (
                                        <div className="ml-auto w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_6px_rgba(109,40,217,0.8)]" />
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Footer */}
                <div className="p-3 border-t border-white/[0.05]">
                    <button
                        onClick={() => navigate('/leagues')}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:text-white hover:bg-white/5 w-full transition-all group font-bold text-[0.8rem] tracking-wide"
                    >
                        <ArrowLeftRight size={16} className="group-hover:rotate-180 transition-transform duration-500" />
                        <span>Trocar Liga</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
