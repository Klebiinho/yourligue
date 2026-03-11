import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChampionship } from '../context/ChampionshipContext';
import { Clock, StopCircle, Award, AlertTriangle, ShieldAlert, Video, Copy, ExternalLink, RefreshCw, PlusCircle, LogIn } from 'lucide-react';
import { YouTubeService } from '../services/youtube';
import TeamLogo from '../components/TeamLogo';

const MatchControl = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { matches, teams, endMatch, addEvent, updateTimer, updateMatch, league } = useChampionship();
    const [isCreatingLive, setIsCreatingLive] = useState(false);
    const [ytError, setYtError] = useState<string | null>(null);
    const [isYtAuthenticated, setIsYtAuthenticated] = useState(false);

    useEffect(() => {
        const yt = YouTubeService.getInstance();
        const clientId = import.meta.env.VITE_YOUTUBE_CLIENT_ID || localStorage.getItem('yt_client_id');
        if (clientId) {
            yt.init(clientId).then(() => {
                yt.subscribeAuth((token) => {
                    setIsYtAuthenticated(!!token);
                });
            });
        }
    }, []);

    const match = matches.find(m => m.id === id);
    const homeTeam = teams.find(t => t.id === match?.homeTeamId);
    const awayTeam = teams.find(t => t.id === match?.awayTeamId);

    const [timerRunning, setTimerRunning] = useState(match?.status === 'live');
    const [localSeconds, setLocalSeconds] = useState(match?.timer || 0);

    useEffect(() => {
        let interval: number;
        if (timerRunning && match?.status === 'live') {
            interval = window.setInterval(() => {
                setLocalSeconds(s => s + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timerRunning, match?.status]);

    useEffect(() => {
        if (match?.status === 'live' && localSeconds % 5 === 0) {
            updateTimer(id!, localSeconds);
        }
    }, [localSeconds, id, match?.status, updateTimer]);

    if (!match || !homeTeam || !awayTeam) return <div>Match not found</div>;

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

    const handleCreateYouTubeLive = async () => {
        const clientId = import.meta.env.VITE_YOUTUBE_CLIENT_ID || localStorage.getItem('yt_client_id');
        if (!clientId) {
            setYtError('Por favor, configure o Client ID do Google em Configurações primeiro.');
            return;
        }

        setIsCreatingLive(true);
        setYtError(null);
        try {
            const yt = YouTubeService.getInstance();
            await yt.init(clientId);

            if (!yt.getIsAuthenticated()) {
                setYtError('Você deve estar logado no YouTube para criar uma live.');
                setIsCreatingLive(false);
                return;
            }

            const title = `${homeTeam.name} vs ${awayTeam.name} - ${league.name} Live`;
            const description = `Live broadcast of ${homeTeam.name} vs ${awayTeam.name} for the ${league.name} championship. Organized via ChampFlow.`;

            const result = await yt.createLiveBroadcast(title, description);

            updateMatch(id!, {
                youtubeLiveId: result.broadcastId,
                youtubeStreamKey: result.streamKey,
                isStreaming: true
            });
        } catch (err: any) {
            console.error(err);
            setYtError('Failed to create YouTube Live. Check console for details.');
        } finally {
            setIsCreatingLive(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: isLive ? 'var(--accent)' : 'var(--text-muted)', boxShadow: isLive ? '0 0 10px var(--accent-glow)' : 'none' }}></span>
                        {isLive ? 'Controle da Partida ao Vivo' : 'Detalhes da Partida'}
                    </h1>
                </div>
                {isLive && (
                    <button className="btn-danger" onClick={handleEndMatch}>
                        <StopCircle size={20} /> Encerrar Partida
                    </button>
                )}
            </header>

            <div className="scoreboard" style={{ marginBottom: '40px' }}>
                <div className="team-score-block">
                    <TeamLogo src={homeTeam.logo} size={80} />
                    <div className="team-name">{homeTeam.name}</div>
                </div>

                <div className="timer-block">
                    <div className="score">
                        <span style={{ color: 'var(--primary)' }}>{match.homeScore}</span>
                        <span style={{ margin: '0 20px', color: 'var(--text-muted)', fontSize: '3rem' }}>-</span>
                        <span style={{ color: 'var(--accent)' }}>{match.awayScore}</span>
                    </div>
                    <div className="timer">
                        {formatTime(localSeconds)}
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

            {/* YouTube Live Real-Time Integration */}
            <section className="glass-panel" style={{ padding: '24px', marginBottom: '40px', borderLeft: '4px solid #ff0000' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff0000', margin: 0 }}>
                        <Video size={24} /> Controle do YouTube Live
                    </h2>
                    {!match.youtubeLiveId && (
                        <div style={{ display: 'flex', gap: '12px' }}>
                            {!isYtAuthenticated ? (
                                <button
                                    className="btn-primary"
                                    style={{ background: '#ff0000' }}
                                    onClick={() => YouTubeService.getInstance().logIn()}
                                >
                                    <LogIn size={20} /> Entrar para Gerar
                                </button>
                            ) : (
                                <button
                                    className="btn-primary"
                                    style={{ background: '#ff0000' }}
                                    onClick={handleCreateYouTubeLive}
                                    disabled={isCreatingLive}
                                >
                                    {isCreatingLive ? <RefreshCw className="animate-spin" size={20} /> : <PlusCircle size={20} />}
                                    {isCreatingLive ? 'Criando Live...' : 'Gerar Live Instantânea'}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {ytError && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.875rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        {ytError}
                    </div>
                )}

                {match.youtubeLiveId ? (
                    <div className="grid-2">
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
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px' }}>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>URL do Stream</div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <code style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px', flex: 1, fontSize: '0.8125rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>rtmp://a.rtmp.youtube.com/live2</code>
                                    <button onClick={() => copyToClipboard('rtmp://a.rtmp.youtube.com/live2')} style={{ color: 'var(--text-muted)' }}><Copy size={16} /></button>
                                </div>
                            </div>
                            <div style={{ padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Chave do Stream (OBS / Câmera)</div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <input
                                        type="password"
                                        readOnly
                                        value={match.youtubeStreamKey || ''}
                                        style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '4px 8px', borderRadius: '4px', flex: 1, fontSize: '0.8125rem' }}
                                    />
                                    <button onClick={() => copyToClipboard(match.youtubeStreamKey || '')} style={{ color: 'var(--text-muted)' }}><Copy size={16} /></button>
                                </div>
                            </div>
                            <div style={{ marginTop: 'auto', display: 'flex', gap: '12px' }}>
                                <a
                                    href={`https://studio.youtube.com/video/${match.youtubeLiveId}/livestreaming`}
                                    target="_blank"
                                    className="btn-outline"
                                    style={{ flex: 1, justifyContent: 'center' }}
                                >
                                    <ExternalLink size={16} /> Abrir Studio
                                </a>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        <Video size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
                        <p>Gere uma transmissão ao vivo para esta partida com um clique.</p>
                    </div>
                )}
            </section>

            {isLive && (
                <div className="grid-2">
                    {/* Home Team Controls */}
                    <section className="glass-panel" style={{ padding: '24px' }}>
                        <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
                            Controles: {homeTeam.name}
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '12px' }}>
                            {homeTeam.players.map(player => (
                                <div key={player.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ fontWeight: 800, color: 'var(--text-muted)', width: '24px' }}>{player.number}</div>
                                        <div style={{ fontWeight: 600 }}>{player.name}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => handleGol(homeTeam.id, player.id)} className="btn-accent" style={{ padding: '8px', minWidth: 'auto', borderRadius: '50%' }} title="Gol"><Award size={16} /></button>
                                        <button onClick={() => handleCard('yellow_card', homeTeam.id, player.id)} style={{ padding: '8px', background: 'var(--warning)', color: 'black', borderRadius: '50%', border: 'none', cursor: 'pointer' }} title="Cartão Amarelo"><AlertTriangle size={16} /></button>
                                        <button onClick={() => handleCard('red_card', homeTeam.id, player.id)} style={{ padding: '8px', background: 'var(--danger)', color: 'white', borderRadius: '50%', border: 'none', cursor: 'pointer' }} title="Cartão Vermelho"><ShieldAlert size={16} /></button>
                                    </div>
                                </div>
                            ))}
                            {homeTeam.players.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Nenhum jogador registrado.</p>}
                        </div>
                    </section>

                    {/* Away Team Controls */}
                    <section className="glass-panel" style={{ padding: '24px' }}>
                        <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)' }}>
                            Controles: {awayTeam.name}
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '12px' }}>
                            {awayTeam.players.map(player => (
                                <div key={player.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ fontWeight: 800, color: 'var(--text-muted)', width: '24px' }}>{player.number}</div>
                                        <div style={{ fontWeight: 600 }}>{player.name}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => handleGol(awayTeam.id, player.id)} className="btn-accent" style={{ padding: '8px', minWidth: 'auto', borderRadius: '50%' }} title="Gol"><Award size={16} /></button>
                                        <button onClick={() => handleCard('yellow_card', awayTeam.id, player.id)} style={{ padding: '8px', background: 'var(--warning)', color: 'black', borderRadius: '50%', border: 'none', cursor: 'pointer' }} title="Cartão Amarelo"><AlertTriangle size={16} /></button>
                                        <button onClick={() => handleCard('red_card', awayTeam.id, player.id)} style={{ padding: '8px', background: 'var(--danger)', color: 'white', borderRadius: '50%', border: 'none', cursor: 'pointer' }} title="Cartão Vermelho"><ShieldAlert size={16} /></button>
                                    </div>
                                </div>
                            ))}
                            {awayTeam.players.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Nenhum jogador registrado.</p>}
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
                                    <div style={{ marginLeft: 'auto', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                                        {event.type.replace('_', ' ')}
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
