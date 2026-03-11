import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Swords, Trophy, Settings, BarChart2, GitBranch, Trophy as LeagueIcon } from 'lucide-react';
import { useLeague } from '../context/LeagueContext';
import TeamLogo from './TeamLogo';

const navItems = [
    { to: '/', icon: <LayoutDashboard size={22} />, label: 'Dashboard' },
    { to: '/teams', icon: <Users size={22} />, label: 'Times' },
    { to: '/teams-dashboard', icon: <BarChart2 size={22} />, label: 'Painel' },
    { to: '/matches', icon: <Swords size={22} />, label: 'Partidas' },
    { to: '/standings', icon: <Trophy size={22} />, label: 'Tabela' },
    { to: '/bracket', icon: <GitBranch size={22} />, label: 'Chaveamento' },
    { to: '/settings', icon: <Settings size={22} />, label: 'Config.' },
];

const Sidebar = () => {
    const { league } = useLeague();
    const navigate = useNavigate();

    return (
        <aside className="sidebar">
            {/* Header */}
            <div className="sidebar-header" onClick={() => navigate('/leagues')} style={{ cursor: 'pointer' }}>
                <TeamLogo src={league?.logo} size={44} fallbackIcon={<LeagueIcon size={22} color="white" />} />
                <div style={{ minWidth: 0 }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>
                        {league?.name ?? 'Liga'}
                    </h2>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Championship Manager</p>
                </div>
            </div>

            {/* Nav */}
            <nav className="sidebar-nav">
                {navItems.map(({ to, icon, label }) => (
                    <NavLink key={to} to={to} end={to === '/'}
                        className={({ isActive }: { isActive: boolean }) => `nav-link${isActive ? ' active' : ''}`}>
                        {icon}
                        <span>{label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Footer */}
            <div className="sidebar-footer">
                <button onClick={() => navigate('/leagues')} className="nav-link" style={{ width: '100%', border: 'none', cursor: 'pointer' }}>
                    <LeagueIcon size={20} />
                    <span>Trocar Liga</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
