import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Swords, Trophy, Settings, BarChart2 } from 'lucide-react';

const Sidebar = () => {
    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div style={{ background: 'var(--primary)', padding: '10px', borderRadius: '12px', display: 'flex' }}>
                    <Trophy size={24} color="white" />
                </div>
                <h2 style={{ fontSize: '1.25rem', color: 'white', fontFamily: 'Outfit' }}>YourLigue</h2>
            </div>

            <nav className="sidebar-nav">
                <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <LayoutDashboard size={20} /> <span>Visão Geral</span>
                </NavLink>
                <NavLink to="/teams" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <Users size={20} /> <span>Times</span>
                </NavLink>
                <NavLink to="/teams-dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <BarChart2 size={20} /> <span>Painel</span>
                </NavLink>
                <NavLink to="/matches" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <Swords size={20} /> <span>Partidas</span>
                </NavLink>
            </nav>

            <div className="sidebar-footer">
                <NavLink to="/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <Settings size={20} /> <span>Ajustes</span>
                </NavLink>
            </div>
        </aside>
    );
};

export default Sidebar;
