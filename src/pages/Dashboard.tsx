import React from 'react';
import { useChampionship } from '../context/ChampionshipContext';
import { Users, Trophy, Activity, Target } from 'lucide-react';
import TeamLogo from '../components/TeamLogo';

const Dashboard = () => {
    const { league, teams, matches } = useChampionship();

    const totalPlayers = teams.reduce((acc, team) => acc + team.players.length, 0);
    const liveMatches = matches.filter(m => m.status === 'live').length;
    const finishedMatches = matches.filter(m => m.status === 'finished').length;

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                {league.logo && <TeamLogo src={league.logo} size={80} />}
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{league.name}</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Real-time statistics for your football championship.</p>
                </div>
            </header>

            <div className="grid-4" style={{ marginBottom: '40px' }}>
                <StatCard title="Total Teams" value={`${teams.length} / ${league.maxTeams}`} icon={<Trophy color="var(--primary)" />} />
                <StatCard title="Registered Players" value={totalPlayers} icon={<Users color="var(--accent)" />} />
                <StatCard title="Live Matches" value={liveMatches} icon={<Activity color="var(--danger)" />} />
                <StatCard title="Completed Matches" value={finishedMatches} icon={<Target color="var(--warning)" />} />
            </div>

            <div className="grid-2">
                <section className="glass-panel" style={{ padding: '24px' }}>
                    <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Activity size={20} className="text-gradient" /> Live & Upcoming Matches
                    </h2>
                    {matches.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)' }}>No matches scheduled yet.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {matches.slice(0, 5).map(match => {
                                const homeTeam = teams.find(t => t.id === match.homeTeamId);
                                const awayTeam = teams.find(t => t.id === match.awayTeamId);
                                return (
                                    <div key={match.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <TeamLogo src={homeTeam?.logo} size={32} />
                                            <span style={{ fontWeight: 600 }}>{homeTeam?.name}</span>
                                        </div>
                                        <div style={{ fontWeight: 800, fontSize: '1.25rem' }}>
                                            {match.homeScore} - {match.awayScore}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontWeight: 600 }}>{awayTeam?.name}</span>
                                            <TeamLogo src={awayTeam?.logo} size={32} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                <section className="glass-panel" style={{ padding: '24px' }}>
                    <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Trophy size={20} className="text-gradient-accent" /> Team Standings
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {teams.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)' }}>No teams registered.</p>
                        ) : (
                            [...teams]
                                .sort((a, b) => (b.stats.wins * 3 + b.stats.draws) - (a.stats.wins * 3 + a.stats.draws))
                                .map((team, index) => (
                                    <div key={team.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', borderRadius: '12px', background: index === 0 ? 'var(--primary-glow)' : 'transparent', border: '1px solid var(--glass-border)' }}>
                                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{index + 1}</div>
                                        <TeamLogo src={team.logo} size={32} />
                                        <div style={{ flex: 1, fontWeight: 600 }}>{team.name}</div>
                                        <div style={{ fontWeight: 'bold', color: 'var(--accent)' }}>{team.stats.wins * 3 + team.stats.draws} pts</div>
                                    </div>
                                ))
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) => (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>{title}</h3>
            <div style={{ padding: '8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>{icon}</div>
        </div>
        <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'Outfit' }}>{value}</div>
    </div>
);

export default Dashboard;
