import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChampionship } from '../context/ChampionshipContext';
import { Clock, StopCircle, Award, AlertTriangle, ShieldAlert, Settings2, XCircle, Target, Trash2 } from 'lucide-react';
import TeamLogo from '../components/TeamLogo';

const MatchControl = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { matches, teams, endMatch, addEvent, removeEvent, updateTimer, updateMatch } = useChampionship();
    const [activeTab, setActiveTab] = useState<'main' | 'penalties'>('main');

    const match = matches.find(m => m.id === id);
    const homeTeam = teams.find(t => t.id === match?.homeTeamId);
    const awayTeam = teams.find(t => t.id === match?.awayTeamId);

    const [timerRunning, setTimerRunning] = useState(match?.status === 'live');
    const [localSeconds, setLocalSeconds] = useState(match?.timer || 0);
    const [halfLength, setHalfLength] = useState(match?.halfLength || 45);
    const [extraTime, setExtraTime] = useState(match?.extraTime || 0);
    const [period, setPeriod] = useState(match?.period || '1º Tempo');

    const getPlayerStatus = (playerId: string) => {
        const playerEvents = match?.events.filter(e => e.playerId === playerId) || [];
        const yellowCards = playerEvents.filter(e => e.type === 'yellow_card').length;
        const hasDirectRed = playerEvents.some(e => e.type === 'red_card');
        const isRedCarded = hasDirectRed || yellowCards >= 2;

        return { isRedCarded, yellowCards, hasDirectRed };
    };

    const handleUndoLastCard = (playerId: string) => {
        const playerEvents = match?.events.filter(e => e.playerId === playerId) || [];
        const lastCardEvent = [...playerEvents].reverse().find(e => e.type === 'yellow_card' || e.type === 'red_card');
        if (lastCardEvent) {
            removeEvent(id!, lastCardEvent.id);
        }
    };

    const handleSaveTimeSettings = () => {
        updateMatch(id!, { halfLength, extraTime, period });
        alert('Configurações de tempo salvas!');
    };

    useEffect(() => {
        let interval: number;
        if (timerRunning && match?.status === 'live') {
            interval = window.setInterval(() => {
                setLocalSeconds(s => {
                    let currentPeriodLimit = halfLength;
                    if (period === '2º Tempo') currentPeriodLimit = halfLength * 2;
                    if (period === 'Prorrogação') currentPeriodLimit = halfLength * 2 + 30;
                    if (period === 'Intervalo' || period === 'Pênaltis') currentPeriodLimit = 9999;

                    const limitInSeconds = (currentPeriodLimit + extraTime) * 60;
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
        if (match?.status === 'live' && localSeconds % 5 === 0) {
            updateTimer(id!, localSeconds);
        }
    }, [localSeconds, id, match?.status, updateTimer]);

    if (!match || !homeTeam || !awayTeam) return <div>Match not found</div>;

    const homePenaltyGoals = match.events.filter(e => e.type === 'penalty_goal' && e.teamId === homeTeam.id).length;
    const awayPenaltyGoals = match.events.filter(e => e.type === 'penalty_goal' && e.teamId === awayTeam.id).length;
    const isPenaltyMode = activeTab === 'penalties' || match.events.some(e => e.type === 'penalty_goal' || e.type === 'penalty_miss');
    const formatTime = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const currentMinute = Math.floor(localSeconds / 60) + 1;

    const handleEndMatch = () => {
        setTimerRunning(false);
        endMatch(id!);
        navigate('/');
    };

    const handleGol = (teamId: string, playerId: string) => {
        addEvent(id!, { type: 'goal', teamId, playerId, minute: currentMinute });
    };

    const handleCard = (type: 'yellow_card' | 'red_card', teamId: string, playerId: string) => {
        addEvent(id!, { type, teamId, playerId, minute: currentMinute });
    };

    const isLive = match.status === 'live';

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: isLive ? 'var(--accent)' : 'var(--text-muted)', boxShadow: isLive ? '0 0 10px var(--accent-glow)' : 'none' }}></span>
                        {isLive ? 'Controle da Partida ao Vivo' : 'Detalhes da Partida'}
                    </h1>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    {isLive && (
                        <>
                            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '24px', padding: '4px' }}>
                                <button className={activeTab === 'main' ? 'btn-primary' : ''} onClick={() => setActiveTab('main')} style={{ padding: '8px 16px', borderRadius: '20px', background: activeTab === 'main' ? 'var(--primary)' : 'transparent', color: activeTab === 'main' ? 'black' : 'white', border: 'none', fontWeight: 600 }}>Tempo Normal</button>
                                <button className={activeTab === 'penalties' ? 'btn-primary' : ''} onClick={() => setActiveTab('penalties')} style={{ padding: '8px 16px', borderRadius: '20px', background: activeTab === 'penalties' ? 'var(--primary)' : 'transparent', color: activeTab === 'penalties' ? 'black' : 'white', border: 'none', fontWeight: 600 }}>Pênaltis</button>
                            </div>
                            <button className="btn-danger" onClick={handleEndMatch}>
                                <StopCircle size={20} /> Encerrar
                            </button>
                        </>
                    )}
                </div>
            </header>

            <div className="scoreboard" style={{ marginBottom: '40px' }}>
                <div className="team-score-block">
                    <TeamLogo src={homeTeam.logo} size={80} />
                    <div className="team-name">{homeTeam.name}</div>
                </div>

                <div className="timer-block" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '8px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase' }}>
                        {period}
                    </div>
                    <div className="score">
                        <span style={{ color: 'var(--primary)' }}>{match.homeScore}</span>
                        <span style={{ margin: '0 20px', color: 'var(--text-muted)', fontSize: '3rem' }}>-</span>
                        <span style={{ color: 'var(--accent)' }}>{match.awayScore}</span>
                    </div>
                    <div className="timer" style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        {formatTime(localSeconds)}
                        {extraTime > 0 && (
                            <span style={{ fontSize: '1.5rem', color: 'var(--warning)', fontWeight: 600 }}>+{extraTime}</span>
                        )}
                    </div>
                    {isPenaltyMode && (
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--warning)', marginTop: '8px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Target size={20} /> Pênaltis: {homePenaltyGoals} - {awayPenaltyGoals}
                        </div>
                    )}
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '16px' }}>
                        Tempo regulamentar: {halfLength} min
                    </div>
                    {isLive && (
                        <div className="match-controls">
                            <button
                                onClick={() => setTimerRunning(!timerRunning)}
                                className={timerRunning ? 'btn-outline' : 'btn-accent'}
                                style={{ borderRadius: '24px' }}
                            >
                                <Clock size={16} /> {timerRunning ? 'Pausar' : 'Iniciar/Retomar'}
                            </button>
                        </div>
                    )}
                </div>

                <div className="team-score-block">
                    <TeamLogo src={awayTeam.logo} size={80} />
                    <div className="team-name">{awayTeam.name}</div>
                </div>
            </div>

            {/* Time Settings Panel */}
            {isLive && (
                <section className="glass-panel" style={{ padding: '24px', marginBottom: '40px' }}>
                    <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Settings2 size={20} className="text-gradient" /> Configurações de Tempo
                    </h2>
                    <div className="grid-4" style={{ gap: '16px', alignItems: 'end' }}>
                        <div className="input-group">
                            <label>Período</label>
                            <select value={period} onChange={(e) => setPeriod(e.target.value)}>
                                <option value="1º Tempo">1º Tempo</option>
                                <option value="2º Tempo">2º Tempo</option>
                                <option value="Prorrogação">Prorrogação</option>
                                <option value="Intervalo">Intervalo</option>
                                <option value="Pênaltis">Pênaltis</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Duração do Tempo (min)</label>
                            <input type="number" value={halfLength} onChange={(e) => setHalfLength(parseInt(e.target.value) || 0)} min="0" />
                        </div>
                        <div className="input-group">
                            <label>Acréscimos (min)</label>
                            <input type="number" value={extraTime} onChange={(e) => setExtraTime(parseInt(e.target.value) || 0)} min="0" />
                        </div>
                        <div className="input-group">
                            <button className="btn-primary" onClick={handleSaveTimeSettings} style={{ padding: '12px' }}>
                                Aplicar Alterações
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {match.youtubeLiveId && (
                <section className="glass-panel" style={{ padding: '24px', marginBottom: '40px' }}>
                    <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                        <iframe
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                            src={`https://www.youtube.com/embed/${match.youtubeLiveId}?autoplay=1`}
                            title="YouTube Live Preview"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen>
                        </iframe>
                    </div>
                </section>
            )}

            {isLive && (
                <div className="grid-2">
                    {/* Home Team Controls */}
                    <section className="glass-panel" style={{ padding: '24px' }}>
                        <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
                            Controles: {homeTeam.name}
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {homeTeam.players.map(player => (
                                <div key={player.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ fontWeight: 800, color: 'var(--text-muted)', width: '24px' }}>{player.number}</div>
                                        <div style={{ fontWeight: 600 }}>{player.name}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {activeTab === 'main' ? (
                                            <>
                                                {(() => {
                                                    const { isRedCarded, yellowCards } = getPlayerStatus(player.id);
                                                    if (isRedCarded) {
                                                        return (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <span style={{ color: 'var(--danger)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Expulso</span>
                                                                <button
                                                                    onClick={() => handleUndoLastCard(player.id)}
                                                                    className="btn-outline"
                                                                    style={{ padding: '6px 12px', fontSize: '0.7rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)' }}
                                                                >
                                                                    Anular Vermelho
                                                                </button>
                                                            </div>
                                                        );
                                                    }
                                                    return (
                                                        <>
                                                            <button onClick={() => handleGol(homeTeam.id, player.id)} className="btn-accent" style={{ padding: '8px', minWidth: 'auto', borderRadius: '50%' }} title="Gol"><Award size={16} /></button>
                                                            <button
                                                                onClick={() => handleCard('yellow_card', homeTeam.id, player.id)}
                                                                style={{ padding: '8px', background: 'var(--warning)', color: 'black', borderRadius: '50%', border: 'none', cursor: 'pointer', position: 'relative' }}
                                                                title="Cartão Amarelo"
                                                            >
                                                                <AlertTriangle size={16} />
                                                                {yellowCards === 1 && (
                                                                    <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: 'var(--danger)', color: 'white', fontSize: '10px', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</span>
                                                                )}
                                                            </button>
                                                            <button onClick={() => handleCard('red_card', homeTeam.id, player.id)} style={{ padding: '8px', background: 'var(--danger)', color: 'white', borderRadius: '50%', border: 'none', cursor: 'pointer' }} title="Cartão Vermelho"><ShieldAlert size={16} /></button>
                                                        </>
                                                    );
                                                })()}
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => addEvent(id!, { type: 'penalty_goal', teamId: homeTeam.id, playerId: player.id, minute: 120 })} style={{ padding: '8px 12px', background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e', borderRadius: '24px', border: '1px solid #22c55e', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 600 }} title="Fez o Pênalti"><Target size={14} /> Gol</button>
                                                <button onClick={() => addEvent(id!, { type: 'penalty_miss', teamId: homeTeam.id, playerId: player.id, minute: 120 })} style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', borderRadius: '24px', border: '1px solid #ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 600 }} title="Errou o Pênalti"><XCircle size={14} /> Errou</button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Away Team Controls */}
                    <section className="glass-panel" style={{ padding: '24px' }}>
                        <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)' }}>
                            Controles: {awayTeam.name}
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {awayTeam.players.map(player => (
                                <div key={player.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ fontWeight: 800, color: 'var(--text-muted)', width: '24px' }}>{player.number}</div>
                                        <div style={{ fontWeight: 600 }}>{player.name}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {activeTab === 'main' ? (
                                            <>
                                                {(() => {
                                                    const { isRedCarded, yellowCards } = getPlayerStatus(player.id);
                                                    if (isRedCarded) {
                                                        return (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <span style={{ color: 'var(--danger)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Expulso</span>
                                                                <button
                                                                    onClick={() => handleUndoLastCard(player.id)}
                                                                    className="btn-outline"
                                                                    style={{ padding: '6px 12px', fontSize: '0.7rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)' }}
                                                                >
                                                                    Anular Vermelho
                                                                </button>
                                                            </div>
                                                        );
                                                    }
                                                    return (
                                                        <>
                                                            <button onClick={() => handleGol(awayTeam.id, player.id)} className="btn-accent" style={{ padding: '8px', minWidth: 'auto', borderRadius: '50%' }} title="Gol"><Award size={16} /></button>
                                                            <button
                                                                onClick={() => handleCard('yellow_card', awayTeam.id, player.id)}
                                                                style={{ padding: '8px', background: 'var(--warning)', color: 'black', borderRadius: '50%', border: 'none', cursor: 'pointer', position: 'relative' }}
                                                                title="Cartão Amarelo"
                                                            >
                                                                <AlertTriangle size={16} />
                                                                {yellowCards === 1 && (
                                                                    <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: 'var(--danger)', color: 'white', fontSize: '10px', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</span>
                                                                )}
                                                            </button>
                                                            <button onClick={() => handleCard('red_card', awayTeam.id, player.id)} style={{ padding: '8px', background: 'var(--danger)', color: 'white', borderRadius: '50%', border: 'none', cursor: 'pointer' }} title="Cartão Vermelho"><ShieldAlert size={16} /></button>
                                                        </>
                                                    );
                                                })()}
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => addEvent(id!, { type: 'penalty_goal', teamId: awayTeam.id, playerId: player.id, minute: 120 })} style={{ padding: '8px 12px', background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e', borderRadius: '24px', border: '1px solid #22c55e', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 600 }} title="Fez o Pênalti"><Target size={14} /> Gol</button>
                                                <button onClick={() => addEvent(id!, { type: 'penalty_miss', teamId: awayTeam.id, playerId: player.id, minute: 120 })} style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', borderRadius: '24px', border: '1px solid #ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 600 }} title="Errou o Pênalti"><XCircle size={14} /> Errou</button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            )}

            {/* Linha do Tempo da Partida */}
            <section className="glass-panel" style={{ padding: '24px', marginTop: '24px' }}>
                <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={20} className="text-gradient" /> Linha do Tempo da Partida
                </h2>
                {match.events.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>Nenhum evento ainda.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {match.events.slice().reverse().map(event => {
                            const team = event.teamId === homeTeam.id ? homeTeam : awayTeam;
                            const player = team.players.find(p => p.id === event.playerId);

                            const getEventIcon = () => {
                                if (event.type === 'goal') return <span style={{ color: 'var(--accent)' }}><Award size={20} /></span>;
                                if (event.type === 'yellow_card') return <span style={{ color: 'var(--warning)' }}><AlertTriangle size={20} /></span>;
                                if (event.type === 'red_card') return <span style={{ color: 'var(--danger)' }}><ShieldAlert size={20} /></span>;
                                return <Award size={20} />;
                            };

                            return (
                                <div key={event.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                    <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-muted)', width: '60px' }}>{event.minute}'</div>
                                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '50%' }}>{getEventIcon()}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <TeamLogo src={team.logo} size={32} />
                                        <span style={{ fontWeight: 600 }}>{player?.name} ({player?.number})</span>
                                    </div>
                                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ color: 'var(--text-muted)', textTransform: 'capitalize', fontSize: '0.875rem' }}>
                                            {event.type.replace('_', ' ')}
                                        </div>
                                        {isLive && (
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('Deseja realmente apagar esta ação?')) {
                                                        removeEvent(match.id, event.id);
                                                    }
                                                }}
                                                style={{ padding: '6px', background: 'transparent', border: 'none', color: 'rgba(239, 68, 68, 0.4)', cursor: 'pointer', transition: 'color 0.2s', borderRadius: '50%' }}
                                                onMouseOver={(e) => (e.currentTarget.style.color = '#ef4444')}
                                                onMouseOut={(e) => (e.currentTarget.style.color = 'rgba(239, 68, 68, 0.4)')}
                                                title="Apagar Ação"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
};

export default MatchControl;
