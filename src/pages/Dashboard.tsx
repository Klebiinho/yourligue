import React from 'react';
import { useChampionship } from '../context/ChampionshipContext';
import { Users, Trophy, Activity, Target, Award, Shield, AlertTriangle, Trash2, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TeamLogo from '../components/TeamLogo';

const Dashboard = () => {
    const { league, teams, matches, deleteMatch, startMatch } = useChampionship();
    const navigate = useNavigate();

    const totalPlayers = teams.reduce((acc, team) => acc + team.players.length, 0);
    const liveMatches = matches.filter(m => m.status === 'live').length;
    const finishedMatches = matches.filter(m => m.status === 'finished').length;

    const allPlayers = teams.flatMap(t => t.players.map(p => ({ ...p, team: t })));
    const topScorer = allPlayers.length > 0 ? [...allPlayers].sort((a, b) => b.stats.goals - a.stats.goals)[0] : null;

    // Melhor defesa: apenas times que já jogaram pelo menos uma partida
    const teamsWithGames = teams.filter(t => t.stats.matches > 0);
    const bestDefenseTeam = teamsWithGames.length > 0 ? [...teamsWithGames].sort((a, b) => a.stats.goalsAgainst - b.stats.goalsAgainst)[0] : null;

    const mostCardsPlayer = allPlayers.length > 0 ? [...allPlayers].sort((a, b) => (b.stats.yellowCards + b.stats.redCards * 2) - (a.stats.yellowCards + a.stats.redCards * 2))[0] : null;

    const handleStartMatch = (id: string, status: string) => {
        if (status === 'scheduled') {
            startMatch(id);
        }
        navigate(`/match/${id}`);
    };

    const handleDeleteMatch = (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir esta partida?')) {
            deleteMatch(id);
        }
    };

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                {league.logo && <TeamLogo src={league.logo} size={80} />}
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{league.name}</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Estatísticas em tempo real para o seu campeonato.</p>
                </div>
            </header>

            <div className="grid-4" style={{ marginBottom: '40px' }}>
                <StatCard title="Total de Times" value={`${teams.length} / ${league.maxTeams}`} icon={<Trophy color="var(--primary)" />} />
                <StatCard title="Jogadores" value={totalPlayers} icon={<Users color="var(--accent)" />} />
                <StatCard title="Ao Vivo" value={liveMatches} icon={<Activity color="var(--danger)" />} />
                <StatCard title="Concluídas" value={finishedMatches} icon={<Target color="var(--warning)" />} />
            </div>

            <div className="grid-2">
                <section className="glass-panel" style={{ padding: '24px' }}>
                    <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Activity size={20} className="text-gradient" /> Partidas ao Vivo e Próximas
                    </h2>
                    {matches.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)' }}>Nenhuma partida agendada ainda.</p>
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
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ fontWeight: 800, fontSize: '1.25rem' }}>
                                                {match.homeScore} - {match.awayScore}
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                {match.status === 'scheduled' && (
                                                    <button
                                                        onClick={() => navigate('/matches')}
                                                        className="btn-outline"
                                                        style={{ padding: '6px', background: 'transparent', border: '1px solid var(--text-muted)', color: 'var(--text-muted)', borderRadius: '50%', cursor: 'pointer' }}
                                                        title="Editar Partida"
                                                    >
                                                        <Edit2 size={12} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleStartMatch(match.id, match.status)}
                                                    className={match.status === 'live' ? 'btn-danger' : match.status === 'finished' ? 'btn-outline' : 'btn-accent'}
                                                    style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '24px' }}
                                                >
                                                    {match.status === 'live' ? 'Gerenciar' : match.status === 'finished' ? <span>Ver</span> : <span>Iniciar</span>}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteMatch(match.id)}
                                                    className="btn-danger-outline"
                                                    style={{ padding: '6px', background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: '50%', cursor: 'pointer' }}
                                                    title="Excluir Partida"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '120px', justifyContent: 'flex-start' }}>
                                            <TeamLogo src={awayTeam?.logo} size={32} />
                                            <span style={{ fontWeight: 600 }}>{awayTeam?.name}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                <section className="glass-panel" style={{ padding: '24px' }}>
                    <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Award size={20} className="text-gradient" /> Destaques da Copa
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {topScorer && topScorer.stats.goals > 0 ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                <div style={{ background: 'var(--primary-glow)', padding: '12px', borderRadius: '50%' }}>
                                    <Award size={24} color="var(--primary)" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Artilheiro</div>
                                    <div style={{ fontWeight: 800, fontSize: '1.125rem' }}>{topScorer.name}</div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <TeamLogo src={topScorer.team.logo} size={16} /> {topScorer.team.name}
                                    </div>
                                </div>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>{topScorer.stats.goals}</div>
                            </div>
                        ) : (
                            <div style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>Nenhum gol registrado.</div>
                        )}

                        {bestDefenseTeam && matches.filter(m => m.status === 'finished').length > 0 ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                <div style={{ background: 'rgba(34, 197, 94, 0.2)', padding: '12px', borderRadius: '50%' }}>
                                    <Shield size={24} color="#22c55e" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Melhor Zaga (Menos gols sofridos)</div>
                                    <div style={{ fontWeight: 800, fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <TeamLogo src={bestDefenseTeam.logo} size={24} /> {bestDefenseTeam.name}
                                    </div>
                                </div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#22c55e' }}>{bestDefenseTeam.stats.goalsAgainst}</div>
                            </div>
                        ) : null}

                        {mostCardsPlayer && (mostCardsPlayer.stats.yellowCards > 0 || mostCardsPlayer.stats.redCards > 0) ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '12px', borderRadius: '50%' }}>
                                    <AlertTriangle size={24} color="var(--danger)" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Mais Cartões</div>
                                    <div style={{ fontWeight: 800, fontSize: '1.125rem' }}>{mostCardsPlayer.name}</div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <TeamLogo src={mostCardsPlayer.team.logo} size={16} /> {mostCardsPlayer.team.name}
                                    </div>
                                </div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--danger)' }}>
                                    {mostCardsPlayer.stats.yellowCards + mostCardsPlayer.stats.redCards}
                                </div>
                            </div>
                        ) : null}
                    </div>
                </section>

                <section className="glass-panel" style={{ padding: '24px' }}>
                    <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Trophy size={20} className="text-gradient-accent" /> Classificação dos Times
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {teams.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)' }}>Nenhum time registrado.</p>
                        ) : (
                            [...teams]
                                .sort((a, b) => {
                                    const scoreA = a.stats.wins * league.pointsForWin + a.stats.draws * league.pointsForDraw + a.stats.losses * league.pointsForLoss;
                                    const scoreB = b.stats.wins * league.pointsForWin + b.stats.draws * league.pointsForDraw + b.stats.losses * league.pointsForLoss;
                                    return scoreB - scoreA;
                                })
                                .map((team, index) => (
                                    <div key={team.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', borderRadius: '12px', background: index === 0 ? 'var(--primary-glow)' : 'transparent', border: '1px solid var(--glass-border)' }}>
                                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{index + 1}</div>
                                        <TeamLogo src={team.logo} size={32} />
                                        <div style={{ flex: 1, fontWeight: 600 }}>{team.name}</div>
                                        <div style={{ fontWeight: 'bold', color: 'var(--accent)' }}>{team.stats.wins * league.pointsForWin + team.stats.draws * league.pointsForDraw + team.stats.losses * league.pointsForLoss} pts</div>
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
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '140px', justifyContent: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</h3>
            <div style={{ padding: '8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>{icon}</div>
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Outfit', marginTop: '4px' }}>{value}</div>
    </div>
);

export default Dashboard;
