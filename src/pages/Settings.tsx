import React, { useState } from 'react';
import { useChampionship } from '../context/ChampionshipContext';
import { Settings as SettingsIcon, Save, Image as ImageIcon, Video, LogIn, LogOut, CheckCircle, ExternalLink } from 'lucide-react';
import TeamLogo from '../components/TeamLogo';
import { YouTubeService } from '../services/youtube';
import { useEffect } from 'react';

const Settings = () => {
    const { league, updateLeague } = useChampionship();
    const [name, setName] = useState(league.name);
    const [logo, setLogo] = useState(league.logo);
    const [maxTeams, setMaxTeams] = useState(league.maxTeams.toString());
    const [pointsForWin, setPointsForWin] = useState(league.pointsForWin.toString());
    const [pointsForDraw, setPointsForDraw] = useState(league.pointsForDraw.toString());
    const [pointsForLoss, setPointsForLoss] = useState(league.pointsForLoss.toString());
    const [isSaved, setIsSaved] = useState(false);
    const [youtubeClientId, setYoutubeClientId] = useState(import.meta.env.VITE_YOUTUBE_CLIENT_ID || localStorage.getItem('yt_client_id') || '');
    const [isYtAuthenticated, setIsYtAuthenticated] = useState(false);

    useEffect(() => {
        const yt = YouTubeService.getInstance();
        if (youtubeClientId) {
            yt.init(youtubeClientId).then(() => {
                yt.subscribeAuth((token) => {
                    setIsYtAuthenticated(!!token);
                });
            });
        }
    }, [youtubeClientId]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogo(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        updateLeague({
            name,
            logo,
            maxTeams: parseInt(maxTeams) || 12,
            pointsForWin: parseInt(pointsForWin) || 3,
            pointsForDraw: parseInt(pointsForDraw) || 1,
            pointsForLoss: parseInt(pointsForLoss) || 0,
        });
        setIsSaved(true);
        localStorage.setItem('yt_client_id', youtubeClientId);
        setTimeout(() => setIsSaved(false), 3000);
    };

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <SettingsIcon size={32} /> Settings
                </h1>
                <p style={{ color: 'var(--text-muted)' }}>Configure your League/Championship settings.</p>
            </header>

            <section className="glass-panel" style={{ padding: '24px', maxWidth: '600px' }}>
                <h2 style={{ marginBottom: '24px', color: 'var(--primary)' }}>League Configuration</h2>

                <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '32px' }}>
                    <div>
                        <div style={{ marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Current Logo Review</div>
                        <TeamLogo src={logo} size={100} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <p style={{ color: 'var(--text-main)', fontWeight: 600 }}>Update the league's visual identity.</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>Upload a photo directly from your device.</p>
                    </div>
                </div>

                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="input-group">
                        <label>Nome da Liga</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Logo da Liga</label>
                        <div className="file-upload-wrapper">
                            <div className="file-upload-custom">
                                <ImageIcon size={20} />
                                <span>{logo ? 'Change Logo da Liga' : 'Upload Logo da Liga'}</span>
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="file-input-hidden"
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Quantidade Máxima de Times</label>
                        <input
                            type="number"
                            value={maxTeams}
                            onChange={e => setMaxTeams(e.target.value)}
                            min="2"
                            max="64"
                            required
                        />
                    </div>

                    <h3 style={{ marginTop: '16px', color: 'var(--text-main)' }}>Sistema de Pontuação</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                        <div className="input-group">
                            <label>Pontos por Vitória</label>
                            <input
                                type="number"
                                value={pointsForWin}
                                onChange={e => setPointsForWin(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label>Pontos por Empate</label>
                            <input
                                type="number"
                                value={pointsForDraw}
                                onChange={e => setPointsForDraw(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label>Pontos por Derrota</label>
                            <input
                                type="number"
                                value={pointsForLoss}
                                onChange={e => setPointsForLoss(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" style={{ marginTop: '16px', justifyContent: 'center', padding: '16px' }}>
                        <Save size={20} /> {isSaved ? 'Salvo!' : 'Salvar Configurações'}
                    </button>
                </form>
            </section>

            <section className="glass-panel" style={{ padding: '24px', maxWidth: '600px', marginTop: '24px', borderLeft: '4px solid #ff0000' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2 style={{ color: '#ff0000', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                        <Video size={24} /> Conexão com Youtube
                    </h2>
                    {isYtAuthenticated && (
                        <span style={{ color: '#22c55e', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem', fontWeight: 600 }}>
                            <CheckCircle size={16} /> Conectado
                        </span>
                    )}
                </div>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '24px' }}>
                    Conecte sua conta do YouTube para criar lives diretamente do painel de partidas.
                </p>

                {!youtubeClientId ? (
                    <div style={{ padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', textAlign: 'center' }}>
                        <p style={{ marginBottom: '16px', fontSize: '0.925rem' }}>Primeiro, configure suas credenciais de API abaixo.</p>
                        <a href="#yt-config" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Ir para Configuração</a>
                    </div>
                ) : (
                    <div style={{ display: 'flex', gap: '12px' }}>
                        {!isYtAuthenticated ? (
                            <button
                                onClick={() => YouTubeService.getInstance().logIn()}
                                className="btn-primary"
                                style={{ background: '#ff0000', flex: 1, justifyContent: 'center', padding: '14px' }}
                            >
                                <LogIn size={20} /> Entrar com Google
                            </button>
                        ) : (
                            <button
                                onClick={() => YouTubeService.getInstance().logOut()}
                                className="btn-outline"
                                style={{ flex: 1, justifyContent: 'center', padding: '14px' }}
                            >
                                <LogOut size={20} /> Desconectar Conta
                            </button>
                        )}
                    </div>
                )}

                <div id="yt-config" style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h3 style={{ fontSize: '1rem', margin: 0 }}>Configuração de Desenvolvedor</h3>
                        <a href="https://console.cloud.google.com/" target="_blank" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            Google Cloud Console <ExternalLink size={12} />
                        </a>
                    </div>
                    <div className="input-group">
                        <label>ID do Cliente Google OAuth</label>
                        <input
                            type="password"
                            value={youtubeClientId}
                            onChange={e => setYoutubeClientId(e.target.value)}
                            placeholder="your-id.apps.googleusercontent.com"
                        />
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                            * Required for the "Entrar com Google" button to work. Use your App's Client ID.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Settings;
