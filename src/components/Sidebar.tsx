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
        <aside className="sidebar">
            {/* Header — visible on desktop only (hidden via CSS on mobile) */}
            <div
                className="sidebar-header"
                onClick={() => navigate('/leagues')}
                style={{ cursor: 'pointer' }}
            >
                <TeamLogo
                    src={league?.logo}
                    size={40}
                    fallbackIcon={<Trophy size={20} color="white" />}
                />
                <div style={{ minWidth: 0 }}>
                    <h2 style={{
                        fontSize: '0.95rem', fontWeight: 800,
                        overflow: 'hidden', textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap', maxWidth: '150px'
                    }}>
                        {league?.name ?? 'Liga'}
                    </h2>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Championship Manager</p>
                </div>
            </div>

            {/* Nav */}
            <nav className="sidebar-nav">
                {navItems.map(({ to, icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === '/'}
                        className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                    >
                        {icon}
                        <span>{label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Footer — Trocar Liga, visible on desktop only */}
            <div className="sidebar-footer">
                <button
                    onClick={() => navigate('/leagues')}
                    className="nav-link"
                    style={{ width: '100%', border: 'none', cursor: 'pointer' }}
                >
                    <ArrowLeftRight size={18} />
                    <span>Trocar Liga</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
