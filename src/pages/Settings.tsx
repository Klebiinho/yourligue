import { useState } from 'react';
import { useLeague } from '../context/LeagueContext';
import { useAuth } from '../context/AuthContext';
import { Settings as SettingsIcon, Save, Image as ImageIcon, LogOut, Trophy } from 'lucide-react';
import TeamLogo from '../components/TeamLogo';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
    const { league, updateLeague } = useLeague();
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState(league?.name ?? '');
    const [logo, setLogo] = useState(league?.logo ?? '');
    const [maxTeams, setMaxTeams] = useState(String(league?.maxTeams ?? 16));
    const [pointsForWin, setPointsForWin] = useState(String(league?.pointsForWin ?? 3));
    const [pointsForDraw, setPointsForDraw] = useState(String(league?.pointsForDraw ?? 1));
    const [pointsForLoss, setPointsForLoss] = useState(String(league?.pointsForLoss ?? 0));
    const [halfLength, setHalfLength] = useState(String(league?.defaultHalfLength ?? 45));
    const [saved, setSaved] = useState(false);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) { const r = new FileReader(); r.onloadend = () => setLogo(r.result as string); r.readAsDataURL(file); }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateLeague({
            name, logo, maxTeams: parseInt(maxTeams) || 16,
            pointsForWin: parseInt(pointsForWin) || 3,
            pointsForDraw: parseInt(pointsForDraw) || 1,
            pointsForLoss: parseInt(pointsForLoss) || 0,
            defaultHalfLength: parseInt(halfLength) || 45
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    const handleSwitchLeague = () => navigate('/leagues');

    return (
        <div className="animate-fade-in">
            <header className="mb-40" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 className="responsive-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <SettingsIcon size={28} /> Configurações
                    </h1>
                    <p className="responsive-subtitle">Configure a liga — {league?.name}</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={handleSwitchLeague} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Trophy size={16} /> Trocar Liga
                    </button>
                    <button onClick={handleSignOut} className="btn-danger" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
                        <LogOut size={16} /> Sair
                    </button>
                </div>
            </header>

            <div className="grid-2" style={{ alignItems: 'start' }}>
                <section className="glass-panel p-24">
                    <h2 style={{ marginBottom: '24px', color: 'var(--primary)' }}>Configuração da Liga</h2>

                    {/* Logo Preview */}
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap' }}>
                        <TeamLogo src={logo} size={90} />
                        <div style={{ flex: 1, minWidth: '160px' }}>
                            <p style={{ fontWeight: 600 }}>Logo da Liga</p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>Faça upload de uma imagem para o escudo.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div className="input-group">
                            <label>Nome da Liga</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} required />
                        </div>
                        <div className="input-group">
                            <label>Logo da Liga</label>
                            <div className="file-upload-wrapper">
                                <div className="file-upload-custom">
                                    <ImageIcon size={18} />
                                    <span>{logo ? 'Alterar Logo' : 'Upload da Logo'}</span>
                                </div>
                                <input type="file" accept="image/*" className="file-input-hidden" onChange={handleFile} />
                            </div>
                        </div>
                        <div className="input-group">
                            <label>Máximo de Times</label>
                            <input type="number" value={maxTeams} onChange={e => setMaxTeams(e.target.value)} min={2} max={64} required />
                        </div>

                        <h3 style={{ color: 'var(--text-main)', marginTop: '8px', fontWeight: 700 }}>Sistema de Pontuação</h3>
                        <div className="grid-3" style={{ gap: '12px' }}>
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <label>Vitória</label>
                                <input type="number" value={pointsForWin} onChange={e => setPointsForWin(e.target.value)} required min={0} />
                            </div>
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <label>Empate</label>
                                <input type="number" value={pointsForDraw} onChange={e => setPointsForDraw(e.target.value)} required min={0} />
                            </div>
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <label>Derrota</label>
                                <input type="number" value={pointsForLoss} onChange={e => setPointsForLoss(e.target.value)} required min={0} />
                            </div>
                        </div>

                        <h3 style={{ color: 'var(--text-main)', marginTop: '8px', fontWeight: 700 }}>Tempo de Partida</h3>
                        <div className="input-group">
                            <label>Duração de cada Tempo (min)</label>
                            <input type="number" value={halfLength} onChange={e => setHalfLength(e.target.value)} required min={1} max={90} />
                        </div>

                        <button type="submit" className={saved ? 'btn-accent' : 'btn-primary'} style={{ justifyContent: 'center', padding: '14px', marginTop: '8px' }}>
                            <Save size={18} /> {saved ? 'Salvo com Sucesso!' : 'Salvar Configurações'}
                        </button>
                    </form>
                </section>

                {/* Account Info */}
                <section className="glass-panel p-24">
                    <h2 style={{ marginBottom: '24px', color: 'var(--primary)' }}>Informações da Conta</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Nome</div>
                            <div style={{ fontWeight: 600 }}>{user?.user_metadata?.name || 'Não informado'}</div>
                        </div>
                        <div style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Email</div>
                            <div style={{ fontWeight: 600 }}>{user?.email}</div>
                        </div>
                        <div style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>ID do Usuário</div>
                            <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>{user?.id}</div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Settings;
