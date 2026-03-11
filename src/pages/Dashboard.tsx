import { useLeague } from '../context/LeagueContext';
import { Trophy, Users, Activity, Target, Award, Shield, AlertTriangle, Calendar, MapPin, ChevronRight } from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import TeamLogo from '../components/TeamLogo';

const Dashboard = () => {
    const { league, teams, matches, startMatch } = useLeague();
    const navigate = useNavigate();

    const totalPlayers = teams.reduce((acc, t) => acc + t.players.length, 0);
    const liveMatches = matches.filter(m => m.status === 'live').length;
    const finishedMatches = matches.filter(m => m.status === 'finished').length;

    const allPlayers = teams.flatMap(t => t.players.map(p => ({ ...p, team: t })));
    const topScorer = allPlayers.length > 0 ? [...allPlayers].sort((a, b) => b.stats.goals - a.stats.goals)[0] : null;
    const teamsWithGames = teams.filter(t => t.stats.matches > 0);
    const bestDefense = teamsWithGames.length > 0 ? [...teamsWithGames].sort((a, b) => a.stats.goalsAgainst - b.stats.goalsAgainst)[0] : null;
    const mostCards = allPlayers.length > 0 ? [...allPlayers].sort((a, b) => (b.stats.yellowCards + b.stats.redCards * 2) - (a.stats.yellowCards + a.stats.redCards * 2))[0] : null;

    const sortedTeams = [...teams].sort((a, b) => {
        const pts = (t: typeof teams[0]) => t.stats.wins * (league?.pointsForWin ?? 3) + t.stats.draws * (league?.pointsForDraw ?? 1) + t.stats.losses * (league?.pointsForLoss ?? 0);
        return pts(b) - pts(a);
    });

    const handleEnterMatch = (id: string, status: string) => {
        if (status === 'scheduled') startMatch(id);
        navigate(`/match/${id}`);
    };

    const formatDate = (dt?: string) => {
        if (!dt) return '';
        return new Date(dt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="animate-fade-in">
            <header className="mb-40" style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                {league?.logo && <TeamLogo src={league.logo} size={72} />}
                <div>
                    <h1 className="responsive-title">{league?.name ?? 'Carregando...'}</h1>
                    <p className="responsive-subtitle">Visão geral da liga em tempo real</p>
                </div>
            </header>

            {/* Stats Cards */}
            <div className="grid-4 mb-40">
                <StatCard title="Times" value={`${teams.length} / ${league?.maxTeams ?? 16}`} icon={<Trophy color="var(--primary)" />} />
                <StatCard title="Jogadores" value={totalPlayers} icon={<Users color="var(--accent)" />} />
                <StatCard title="Ao Vivo" value={liveMatches} icon={<Activity color="var(--danger)" />} accent="danger" />
                <StatCard title="Concluídas" value={finishedMatches} icon={<Target color="var(--warning)" />} />
            </div>

            <div className="grid-2">
                {/* Partidas */}
                <section className="glass-panel p-24">
                    <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Activity size={20} className="text-gradient" /> Próximas & Ao Vivo
                    </h2>
                    {matches.length === 0
                        ? <p style={{ color: 'var(--text-muted)' }}>Nenhuma partida agendada ainda.</p>
                        : <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {matches.slice(0, 6).map(match => {
                                const ht = teams.find(t => t.id === match.homeTeamId);
                                const at = teams.find(t => t.id === match.awayTeamId);
                                const isLive = match.status === 'live';
                                return (
                                    <div key={match.id}
                                        onClick={() => handleEnterMatch(match.id, match.status)}
                                        style={{
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            padding: '14px 16px', borderRadius: '12px', cursor: 'pointer',
                                            background: isLive ? 'rgba(109,40,217,0.15)' : 'rgba(0,0,0,0.2)',
                                            border: `1px solid ${isLive ? 'var(--primary)' : 'var(--glass-border)'}`,
                                            transition: 'all 0.2s'
                                        }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                                            <TeamLogo src={ht?.logo} size={32} />
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{ht?.name} <span style={{ color: 'var(--text-muted)' }}>x</span> {at?.name}</div>
                                                <div style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
                                                    {match.scheduledAt && <><Calendar size={11} /> {formatDate(match.scheduledAt)}</>}
                                                    {match.location && <><MapPin size={11} /> {match.location}</>}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            {isLive && <span style={{ background: 'var(--danger)', color: 'white', padding: '2px 8px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700, animation: 'pulse 2s infinite' }}>AO VIVO</span>}
                                            {match.status === 'finished' && <span style={{ color: 'var(--text-muted)', fontWeight: 800 }}>{match.homeScore} - {match.awayScore}</span>}
                                            <TeamLogo src={at?.logo} size={32} />
                                            <ChevronRight size={14} color="var(--text-muted)" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    }
                </section>

                {/* Destaques */}
                <section className="glass-panel p-24">
                    <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Award size={20} className="text-gradient" /> Destaques da Liga
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {topScorer && topScorer.stats.goals > 0 ? (
                            <HighlightCard icon={<Award size={22} color="var(--primary)" />} bg="var(--primary-glow)"
                                label="Artilheiro" name={topScorer.name} team={topScorer.team} value={`${topScorer.stats.goals} gols`} valueColor="var(--primary)" />
                        ) : <EmptyHighlight label="Nenhum gol registrado ainda." />}
                        {bestDefense ? (
                            <HighlightCard icon={<Shield size={22} color="#22c55e" />} bg="rgba(34,197,94,0.15)"
                                label="Melhor Defesa" name={bestDefense.name} team={bestDefense} value={`${bestDefense.stats.goalsAgainst} sofridos`} valueColor="#22c55e" />
                        ) : null}
                        {mostCards && (mostCards.stats.yellowCards > 0 || mostCards.stats.redCards > 0) ? (
                            <HighlightCard icon={<AlertTriangle size={22} color="var(--danger)" />} bg="rgba(239,68,68,0.15)"
                                label="Mais Cartões" name={mostCards.name} team={mostCards.team}
                                value={`🟨 ${mostCards.stats.yellowCards}  🟥 ${mostCards.stats.redCards}`} valueColor="var(--danger)" />
                        ) : null}
                    </div>
                </section>

                {/* Classificação */}
                <section className="glass-panel p-24" style={{ gridColumn: '1 / -1' }}>
                    <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Trophy size={20} className="text-gradient-accent" /> Classificação
                    </h2>
                    {sortedTeams.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>Nenhum time registrado.</p> : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                                <thead>
                                    <tr style={{ color: 'var(--text-muted)', fontSize: '0.8rem', letterSpacing: '0.05em', textTransform: 'uppercase', borderBottom: '1px solid var(--glass-border)' }}>
                                        {['#', 'Time', 'Pts', 'J', 'V', 'E', 'D', 'GP', 'GC', 'SG'].map(h => (
                                            <th key={h} style={{ padding: '8px 12px', textAlign: h === 'Time' ? 'left' : 'center', fontWeight: 600 }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedTeams.map((team, i) => {
                                        const pts = team.stats.wins * (league?.pointsForWin ?? 3) + team.stats.draws * (league?.pointsForDraw ?? 1) + team.stats.losses * (league?.pointsForLoss ?? 0);
                                        const sg = team.stats.goalsFor - team.stats.goalsAgainst;
                                        return (
                                            <tr key={team.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: i === 0 ? 'rgba(109,40,217,0.08)' : 'transparent', transition: 'background 0.2s' }}>
                                                <td style={{ padding: '12px', textAlign: 'center', fontWeight: 800, color: i === 0 ? 'var(--primary)' : 'var(--text-muted)' }}>{i + 1}</td>
                                                <td style={{ padding: '12px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <TeamLogo src={team.logo} size={28} />
                                                        <span style={{ fontWeight: 600 }}>{team.name}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '12px', textAlign: 'center', fontWeight: 800, color: 'var(--accent)' }}>{pts}</td>
                                                <td style={{ padding: '12px', textAlign: 'center' }}>{team.stats.matches}</td>
                                                <td style={{ padding: '12px', textAlign: 'center', color: '#22c55e' }}>{team.stats.wins}</td>
                                                <td style={{ padding: '12px', textAlign: 'center' }}>{team.stats.draws}</td>
                                                <td style={{ padding: '12px', textAlign: 'center', color: 'var(--danger)' }}>{team.stats.losses}</td>
                                                <td style={{ padding: '12px', textAlign: 'center' }}>{team.stats.goalsFor}</td>
                                                <td style={{ padding: '12px', textAlign: 'center' }}>{team.stats.goalsAgainst}</td>
                                                <td style={{ padding: '12px', textAlign: 'center', color: sg >= 0 ? '#22c55e' : 'var(--danger)', fontWeight: 700 }}>{sg > 0 ? `+${sg}` : sg}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, accent }: { title: string; value: string | number; icon: React.ReactNode; accent?: string }) => (
    <div className="glass-panel p-24" style={{ display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '120px', justifyContent: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</h3>
            <div style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>{icon}</div>
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Outfit', color: accent === 'danger' && Number(value) > 0 ? 'var(--danger)' : 'inherit' }}>{value}</div>
    </div>
);

const HighlightCard = ({ icon, bg, label, name, team, value, valueColor }: any) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)' }}>
        <div style={{ background: bg, padding: '10px', borderRadius: '50%', flexShrink: 0 }}>{icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{label}</div>
            <div style={{ fontWeight: 800, fontSize: '1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
            <div style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
                {team?.logo && <TeamLogo src={team.logo} size={14} />} {team?.name}
            </div>
        </div>
        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: valueColor, flexShrink: 0 }}>{value}</div>
    </div>
);

const EmptyHighlight = ({ label }: { label: string }) => (
    <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>{label}</div>
);

export default Dashboard;
