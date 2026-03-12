import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLeague, type MatchEvent, type Player, type Match, type Team } from '../context/LeagueContext';
import { Clock, StopCircle, Award, Settings2, XCircle, Target, Trash2, Crown, Pause, Play } from 'lucide-react';

import TeamLogo from '../components/TeamLogo';

const MatchControl = () => {
    const { matchId } = useParams<{ matchId: string }>();
    const navigate = useNavigate();
    const { matches, teams, endMatch, addEvent, removeEvent, updateTimer, updateMatch } = useLeague();


    const match = matches.find((m: Match) => m.id === matchId);
    const homeTeam = teams.find((t: Team) => t.id === match?.homeTeamId);
    const awayTeam = teams.find((t: Team) => t.id === match?.awayTeamId);

    const [timerRunning, setTimerRunning] = useState(match?.status === 'live');
    const [localSeconds, setLocalSeconds] = useState(match?.timer || 0);
    const [halfLength, setHalfLength] = useState(match?.halfLength || 45);
    const [extraTime, setExtraTime] = useState(match?.extraTime || 0);
    const [period, setPeriod] = useState(match?.period || '1º Tempo');

    const getPlayerStatus = (playerId: string) => {
        const playerEvents = match?.events.filter((e: MatchEvent) => e.playerId === playerId) || [];
        const yellowCards = playerEvents.filter((e: MatchEvent) => e.type === 'yellow_card').length;
        const hasDirectRed = playerEvents.some((e: MatchEvent) => e.type === 'red_card');
        const isRedCarded = hasDirectRed || yellowCards >= 2;

        return { isRedCarded, yellowCards, hasDirectRed };
    };

    const handleUndoLastCard = (playerId: string) => {
        const playerEvents = match?.events.filter((e: MatchEvent) => e.playerId === playerId) || [];
        const lastCardEvent = [...playerEvents].reverse().find((e: MatchEvent) => e.type === 'yellow_card' || e.type === 'red_card');
        if (lastCardEvent && matchId) {
            removeEvent(matchId, lastCardEvent.id);
        }
    };

    const handleSaveTimeSettings = () => {
        if (matchId) {
            updateMatch(matchId, { halfLength, extraTime, period });
            alert('Configurações de tempo salvas!');
        }
    };

    useEffect(() => {
        let interval: number;
        if (timerRunning && match?.status === 'live') {
            interval = window.setInterval(() => {
                setLocalSeconds((s: number) => {
                    let baseLimit = halfLength;
                    if (period === '2º Tempo') baseLimit = halfLength * 2;
                    if (period === 'Prorrogação') baseLimit = halfLength * 2 + 30;

                    if (period === 'Intervalo' || period === 'Pênaltis') {
                        return s + 1;
                    }

                    const limitInSeconds = (baseLimit + extraTime) * 60;
                    if (s >= limitInSeconds) {
                        setTimerRunning(false);
                        return s;
                    }
                    return s + 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timerRunning, match?.status, halfLength, extraTime, period]);

    useEffect(() => {
        if (match?.status === 'live' && localSeconds % 5 === 0 && matchId) {
            updateTimer(matchId, localSeconds);
        }
    }, [localSeconds, matchId, match?.status, updateTimer]);

    if (!match || !homeTeam || !awayTeam) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--text-muted)' }}>
            Partida não encontrada...
        </div>
    );

    const formatTime = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const currentMinute = Math.floor(localSeconds / 60) + 1;

    const handleEndMatch = () => {
        if (matchId) {
            setTimerRunning(false);
            endMatch(matchId);
            navigate('/');
        }
    };

    const handleGol = (teamId: string, playerId: string) => {
        if (matchId) addEvent(matchId, { type: 'goal', teamId, playerId, minute: currentMinute });
    };

    const handleAssist = (teamId: string, playerId: string) => {
        if (matchId) addEvent(matchId, { type: 'assist', teamId, playerId, minute: currentMinute });
    };

    const handleGolContra = (teamId: string, playerId: string) => {
        if (matchId) addEvent(matchId, { type: 'own_goal', teamId, playerId, minute: currentMinute });
    };

    const handleCartao = (teamId: string, playerId: string, type: 'yellow_card' | 'red_card') => {
        if (matchId) addEvent(matchId, { type, teamId, playerId, minute: currentMinute });
    };


    return (
        <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
            {/* Header: Placar e Tempo */}
            <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px', position: 'sticky', top: '0', zIndex: 100, backdropFilter: 'blur(20px)' }}>
                {/* Score row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    {/* Home team */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, justifyContent: 'flex-end', minWidth: '80px' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 800, fontSize: 'clamp(0.85rem, 3vw, 1.2rem)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>{homeTeam.name}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>MANDANTE</div>
                        </div>
                        <TeamLogo src={homeTeam.logo} size={48} />
                    </div>

                    {/* Placar central */}
                    <div style={{ padding: '0 16px', textAlign: 'center', flexShrink: 0 }}>
                        <div style={{ fontSize: 'clamp(1.8rem, 6vw, 3rem)', fontWeight: 900, fontFamily: 'Outfit', letterSpacing: '4px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ color: 'var(--primary)' }}>{match.homeScore}</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '1.5rem' }}>X</span>
                            <span style={{ color: 'var(--accent)' }}>{match.awayScore}</span>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '100px', display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                            <Clock size={14} color="var(--primary)" />
                            <span style={{ fontWeight: 800, fontSize: 'clamp(0.85rem, 2.5vw, 1.1rem)', fontFamily: 'monospace' }}>{formatTime(localSeconds)}</span>
                        </div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginTop: '4px', textTransform: 'uppercase' }}>
                            {period} {extraTime > 0 && `(+${extraTime}')`}
                        </div>
                    </div>

                    {/* Away team */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '80px' }}>
                        <TeamLogo src={awayTeam.logo} size={48} />
                        <div>
                            <div style={{ fontWeight: 800, fontSize: 'clamp(0.85rem, 3vw, 1.2rem)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>{awayTeam.name}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>VISITANTE</div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <button onClick={() => setTimerRunning(!timerRunning)} className={`btn-${timerRunning ? 'outline' : 'primary'}`} style={{ minWidth: '120px', justifyContent: 'center', padding: '10px 20px' }}>
                        {timerRunning ? <><Pause size={16} /> Pausar</> : <><Play size={16} /> Iniciar</>}
                    </button>
                    <button onClick={handleEndMatch} className="btn-danger" style={{ minWidth: '120px', justifyContent: 'center', padding: '10px 20px' }}>
                        <StopCircle size={16} /> Finalizar
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                {/* Abas de Equipes */}
                {[homeTeam, awayTeam].map((team) => (
                    <section key={team.id} className="glass-panel p-24">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>
                            <TeamLogo src={team.logo} size={36} />
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{team.name}</h2>
                            <div style={{ marginLeft: 'auto', background: 'var(--primary-glow)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 800 }}>
                                {team.id === homeTeam.id ? match.homeScore : match.awayScore}
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {team.players.map((player: Player) => {
                                const { isRedCarded, yellowCards } = getPlayerStatus(player.id);
                                return (
                                    <div key={player.id} style={{
                                        display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px',
                                        background: isRedCarded ? 'rgba(239, 68, 68, 0.05)' : 'rgba(0,0,0,0.2)',
                                        border: `1px solid ${isRedCarded ? 'rgba(239, 68, 68, 0.2)' : 'var(--glass-border)'}`,
                                        opacity: isRedCarded ? 0.6 : 1
                                    }}>
                                        <div style={{ position: 'relative' }}>
                                            <TeamLogo src={player.photo} size={40} />
                                            {player.isCaptain && <Crown size={14} style={{ position: 'absolute', top: -4, right: -4, color: '#fbbf24' }} />}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>#{player.number} {player.name}</div>
                                            <div style={{ display: 'flex', gap: '4px', marginTop: '2px' }}>
                                                {Array.from({ length: yellowCards }).map((_, i) => <div key={i} style={{ width: '8px', height: '12px', background: '#fbbf24', borderRadius: '2px' }} />)}
                                                {isRedCarded && <div style={{ width: '8px', height: '12px', background: '#ef4444', borderRadius: '2px' }} />}
                                            </div>
                                        </div>

                                        <div className="action-group" style={{ opacity: isRedCarded ? 0.3 : 1, pointerEvents: isRedCarded ? 'none' : 'auto' }}>
                                            <button onClick={() => handleGol(team.id, player.id)} className="action-icon-btn accent" title="Gol"><Target size={16} /></button>
                                            <button onClick={() => handleAssist(team.id, player.id)} className="action-icon-btn" style={{ color: '#fbbf24' }} title="Assistência"><Award size={16} /></button>
                                            <button onClick={() => handleGolContra(team.id, player.id)} className="action-icon-btn danger" title="Gol Contra"><XCircle size={16} /></button>
                                            <button onClick={() => handleCartao(team.id, player.id, 'yellow_card')} className="action-icon-btn" style={{ color: '#fbbf24' }} title="Amarelo">🟨</button>
                                            <button onClick={() => handleCartao(team.id, player.id, 'red_card')} className="action-icon-btn danger" title="Vermelho">🟥</button>
                                        </div>
                                        {(isRedCarded || yellowCards > 0) && (
                                            <button onClick={() => handleUndoLastCard(player.id)} className="action-icon-btn" title="Desfazer cartão"><Trash2 size={14} /></button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                ))}

                {/* Histórico e Configurações */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <section className="glass-panel p-24">
                        <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Settings2 size={18} className="text-gradient" /> Controle de Tempo
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <label>Período</label>
                                <select value={period} onChange={e => setPeriod(e.target.value)}>
                                    <option>1º Tempo</option><option>Intervalo</option>
                                    <option>2º Tempo</option><option>Prorrogação</option>
                                    <option>Pênaltis</option><option>Fim</option>
                                </select>
                            </div>
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <label>Duração (min)</label>
                                <input type="number" value={halfLength} onChange={e => setHalfLength(parseInt(e.target.value))} />
                            </div>
                            <div className="input-group" style={{ marginBottom: 0, gridColumn: 'span 2' }}>
                                <label>Acréscimos (min)</label>
                                <input type="number" value={extraTime} onChange={e => setExtraTime(parseInt(e.target.value))} />
                            </div>
                        </div>
                        <button onClick={handleSaveTimeSettings} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                            Salvar Alterações
                        </button>
                    </section>

                    <section className="glass-panel p-24" style={{ flex: 1 }}>
                        <h3 style={{ marginBottom: '16px', fontSize: '1rem' }}>Súmula da Partida</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
                            {[...match.events].reverse().map((event) => {
                                const p = [...homeTeam.players, ...awayTeam.players].find(pl => pl.id === event.playerId);
                                return (
                                    <div key={event.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
                                        <div style={{ width: '32px', fontWeight: 800, color: 'var(--primary)' }}>{event.minute}'</div>
                                        <div style={{ flex: 1, fontSize: '0.85rem' }}>
                                            <span style={{ fontWeight: 700 }}>{p?.name}</span>
                                            <span style={{ color: 'var(--text-muted)' }}> ({event.type === 'goal' ? 'Gol' : event.type === 'yellow_card' ? 'Cartão Amarelo' : 'Evento'})</span>
                                        </div>
                                        <button onClick={() => removeEvent(matchId!, event.id)} className="action-icon-btn danger" style={{ width: '28px', height: '28px' }}><XCircle size={14} /></button>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default MatchControl;
