import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Swords, Trophy, Settings, BarChart2 } from 'lucide-react';

const Sidebar = () => {
    return (
        <aside className="sidebar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
                <div style={{ background: 'var(--primary)', padding: '10px', borderRadius: '12px', display: 'flex' }}>
                    <Trophy size={24} color="white" />
                </div>
                <h2 style={{ fontSize: '1.25rem', color: 'white', fontFamily: 'Outfit' }}>ChampFlow</h2>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} style={navLinkStyle}>
                    <LayoutDashboard size={20} /> Visão Geral
                </NavLink>
                <NavLink to="/teams" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} style={navLinkStyle}>
                    <Users size={20} /> Register Times
                </NavLink>
                <NavLink to="/teams-dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} style={navLinkStyle}>
                    <BarChart2 size={20} /> Team Visão Geral
                </NavLink>
                <NavLink to="/matches" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} style={navLinkStyle}>
                    <Swords size={20} /> Partidas Control
                </NavLink>
            </nav>

            <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--glass-border)' }}>
                <NavLink to="/settings" style={navLinkStyle}>
                    <Settings size={20} /> Settings
                </NavLink>
            </div>

            <style>
                {`
          .nav-link {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            border-radius: 12px;
            color: var(--text-muted);
            font-weight: 500;
            transition: all 0.2s;
          }
          .nav-link:hover {
            background: rgba(255, 255, 255, 0.05);
            color: var(--text-main);
          }
          .nav-link.active {
            background: var(--primary-glow);
            color: white;
            box-shadow: 0 4px 15px rgba(109, 40, 217, 0.2);
          }
        `}
            </style>
        </aside>
    );
};

const navLinkStyle: React.CSSProperties = {
    textDecoration: 'none'
};

export default Sidebar;
