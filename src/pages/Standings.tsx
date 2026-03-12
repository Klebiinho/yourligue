import { useLeague } from '../context/LeagueContext';
import { Trophy, Shield } from 'lucide-react';
import TeamLogo from '../components/TeamLogo';

const Standings = () => {
    const { league, teams, matches } = useLeague();

    const sortedTeams = [...teams].sort((a, b) => {
        const pts = (t: typeof teams[0]) =>
            t.stats.wins * (league?.pointsForWin ?? 3) +
            t.stats.draws * (league?.pointsForDraw ?? 1) +
            t.stats.losses * (league?.pointsForLoss ?? 0);
        const sgA = a.stats.goalsFor - a.stats.goalsAgainst;
        const sgB = b.stats.goalsFor - b.stats.goalsAgainst;
        return pts(b) - pts(a) || sgB - sgA || b.stats.goalsFor - a.stats.goalsFor;
    });

    const totalFinished = matches.filter(m => m.status === 'finished').length;

    return (
        <div className="animate-fade-in">
            <header className="mb-40">
                <h1 className="responsive-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Trophy size={30} className="text-gradient" /> Tabela da Liga
                </h1>
                <p className="responsive-subtitle">{totalFinished} partidas disputadas — {league?.name}</p>
            </header>

            <section className="glass-panel p-24">
                {sortedTeams.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                        <Trophy size={60} style={{ opacity: 0.1, marginBottom: '16px' }} />
                        <h3>Nenhum time cadastrado ainda</h3>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '640px' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--primary)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                    <th style={{ padding: '12px 8px', textAlign: 'center', width: '40px' }}>#</th>
                                    <th style={{ padding: '12px 8px', textAlign: 'left' }}>Time</th>
                                    <th style={{ padding: '12px 8px', textAlign: 'center' }}>Pts</th>
                                    <th style={{ padding: '12px 8px', textAlign: 'center' }}>J</th>
                                    <th style={{ padding: '12px 8px', textAlign: 'center' }}>V</th>
                                    <th style={{ padding: '12px 8px', textAlign: 'center' }}>E</th>
                                    <th style={{ padding: '12px 8px', textAlign: 'center' }}>D</th>
                                    <th style={{ padding: '12px 8px', textAlign: 'center' }}>GP</th>
                                    <th style={{ padding: '12px 8px', textAlign: 'center' }}>GC</th>
                                    <th style={{ padding: '12px 8px', textAlign: 'center' }}>SG</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedTeams.map((team, i) => {
                                    const pts = team.stats.wins * (league?.pointsForWin ?? 3) + team.stats.draws * (league?.pointsForDraw ?? 1) + team.stats.losses * (league?.pointsForLoss ?? 0);
                                    const sg = team.stats.goalsFor - team.stats.goalsAgainst;
                                    const isTop = i === 0 && pts > 0;
                                    const isZone = i >= sortedTeams.length - 3;

                                    return (
                                        <tr key={team.id} style={{
                                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                                            background: isTop ? 'rgba(109,40,217,0.1)' : isZone ? 'rgba(239,68,68,0.05)' : 'transparent',
                                            transition: 'background 0.2s'
                                        }}>
                                            <td style={{ padding: '14px 8px', textAlign: 'center' }}>
                                                <div style={{
                                                    width: '28px', height: '28px', borderRadius: '50%', margin: '0 auto',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    background: isTop ? 'var(--primary-glow)' : 'rgba(255,255,255,0.06)',
                                                    fontWeight: 800, fontSize: '0.875rem',
                                                    color: isTop ? 'var(--primary)' : 'var(--text-muted)'
                                                }}>{i + 1}</div>
                                            </td>
                                            <td style={{ padding: '14px 8px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <TeamLogo src={team.logo} size={32} />
                                                    <span style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{team.name}</span>
                                                    {isTop && <Shield size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />}
                                                </div>
                                            </td>
                                            <td style={{ padding: '14px 8px', textAlign: 'center', fontWeight: 900, fontSize: '1.1rem', color: 'var(--accent)' }}>{pts}</td>
                                            <td style={{ padding: '14px 8px', textAlign: 'center' }}>{team.stats.matches}</td>
                                            <td style={{ padding: '14px 8px', textAlign: 'center', color: '#22c55e', fontWeight: 700 }}>{team.stats.wins}</td>
                                            <td style={{ padding: '14px 8px', textAlign: 'center' }}>{team.stats.draws}</td>
                                            <td style={{ padding: '14px 8px', textAlign: 'center', color: 'var(--danger)' }}>{team.stats.losses}</td>
                                            <td style={{ padding: '14px 8px', textAlign: 'center' }}>{team.stats.goalsFor}</td>
                                            <td style={{ padding: '14px 8px', textAlign: 'center' }}>{team.stats.goalsAgainst}</td>
                                            <td style={{ padding: '14px 8px', textAlign: 'center', fontWeight: 700, color: sg > 0 ? '#22c55e' : sg < 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
                                                {sg > 0 ? `+${sg}` : sg}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {/* Legend */}
                        <div style={{ display: 'flex', gap: '20px', marginTop: '16px', fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '12px', height: '12px', background: 'rgba(109,40,217,0.3)', borderRadius: '3px' }}></span> Líder</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '12px', height: '12px', background: 'rgba(239,68,68,0.15)', borderRadius: '3px' }}></span> Zona de rebaixamento</span>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
};

export default Standings;
