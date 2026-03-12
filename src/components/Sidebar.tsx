import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Swords, Trophy, Settings, BarChart2, GitBranch, ArrowLeftRight } from 'lucide-react';
import { useLeague } from '../context/LeagueContext';
import TeamLogo from './TeamLogo';

const navItems = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: 'Home' },
    { to: '/teams', icon: <Users size={20} />, label: 'Times' },
    { to: '/teams-dashboard', icon: <BarChart2 size={20} />, label: 'Painel' },
    { to: '/matches', icon: <Swords size={20} />, label: 'Partidas' },
    { to: '/standings', icon: <Trophy size={20} />, label: 'Tabela' },
    { to: '/bracket', icon: <GitBranch size={20} />, label: 'Chaveam.' },
    { to: '/settings', icon: <Settings size={20} />, label: 'Config.' },
];

const Sidebar = () => {
    const { league } = useLeague();
    const navigate = useNavigate();

    return (
        <aside className="fixed bottom-0 left-0 w-full h-[70px] bg-bg-dark/80 backdrop-blur-xl border-t border-white/5 z-50 md:top-0 md:left-0 md:w-64 md:h-screen md:bg-bg-dark/40 md:border-t-0 md:border-r flex flex-col transition-all duration-300">
            {/* Header — Desktop Only */}
            <div
                className="hidden md:flex items-center gap-3 p-6 mb-2 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => navigate('/leagues')}
            >
                <TeamLogo
                    src={league?.logo}
                    size={42}
                    fallbackIcon={<Trophy size={20} className="text-white" />}
                />
                <div className="min-w-0">
                    <h2 className="text-[0.95rem] font-extrabold text-white truncate max-w-[140px] leading-tight font-outfit">
                        {league?.name ?? 'Liga'}
                    </h2>
                    <p className="text-[0.65rem] text-slate-500 font-bold uppercase tracking-wider">Championship Manager</p>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 flex md:flex-col items-center justify-around md:justify-start gap-1 p-2 md:px-4 md:py-2 overflow-x-auto md:overflow-x-hidden no-scrollbar">
                {navItems.map(({ to, icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === '/'}
                        className={({ isActive }) => `
                            flex flex-col md:flex-row items-center gap-1 md:gap-3 px-3 py-2 md:px-4 md:py-3.5 rounded-xl transition-all duration-300 w-full group
                            ${isActive
                                ? 'bg-primary/20 text-white md:bg-primary shadow-[0_4px_12px_rgba(109,40,217,0.2)] md:shadow-none'
                                : 'text-slate-400 hover:text-white md:hover:bg-white/5'
                            }
                        `}
                    >
                        <div className={`transition-transform duration-300 group-hover:scale-110`}>
                            {icon}
                        </div>
                        <span className="text-[0.65rem] md:text-sm font-bold md:font-semibold">{label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Footer — Desktop Only */}
            <div className="hidden md:block p-4 mt-auto border-t border-white/5">
                <button
                    onClick={() => navigate('/leagues')}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 w-full transition-all group font-semibold text-sm"
                >
                    <ArrowLeftRight size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                    <span>Trocar Liga</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
