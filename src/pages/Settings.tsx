import React, { useState } from 'react';
import { useChampionship } from '../context/ChampionshipContext';
import { Settings as SettingsIcon, Save, Image as ImageIcon } from 'lucide-react';
import TeamLogo from '../components/TeamLogo';

const Settings = () => {
    const { league, updateLeague } = useChampionship();
    const [name, setName] = useState(league.name);
    const [logo, setLogo] = useState(league.logo);
    const [maxTeams, setMaxTeams] = useState(league.maxTeams.toString());
    const [pointsForWin, setPointsForWin] = useState(league.pointsForWin.toString());
    const [pointsForDraw, setPointsForDraw] = useState(league.pointsForDraw.toString());
    const [pointsForLoss, setPointsForLoss] = useState(league.pointsForLoss.toString());
    const [defaultHalfLength, setDefaultHalfLength] = useState(league.defaultHalfLength.toString());
    const [isSaved, setIsSaved] = useState(false);

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
            defaultHalfLength: parseInt(defaultHalfLength) || 45,
        });
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <SettingsIcon size={32} /> Configurações
                </h1>
                <p style={{ color: 'var(--text-muted)' }}>Configure as definições da sua Liga/Campeonato.</p>
            </header>

            <section className="glass-panel" style={{ padding: '24px', maxWidth: '600px' }}>
                <h2 style={{ marginBottom: '24px', color: 'var(--primary)' }}>Configuração da Liga</h2>

                <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '32px' }}>
                    <div>
                        <div style={{ marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Logo Atual</div>
                        <TeamLogo src={logo} size={100} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <p style={{ color: 'var(--text-main)', fontWeight: 600 }}>Atualize a identidade visual da liga.</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>Envie uma foto diretamente do seu dispositivo.</p>
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
                                <span>{logo ? 'Alterar Logo da Liga' : 'Enviar Logo da Liga'}</span>
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
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                        <div className="input-group" style={{ marginBottom: 0 }}>
                            <label>Pontos por Vitória</label>
                            <input
                                type="number"
                                value={pointsForWin}
                                onChange={e => setPointsForWin(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input-group" style={{ marginBottom: 0 }}>
                            <label>Pontos por Empate</label>
                            <input
                                type="number"
                                value={pointsForDraw}
                                onChange={e => setPointsForDraw(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input-group" style={{ marginBottom: 0 }}>
                            <label>Pontos por Derrota</label>
                            <input
                                type="number"
                                value={pointsForLoss}
                                onChange={e => setPointsForLoss(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <h3 style={{ marginTop: '16px', color: 'var(--text-main)' }}>Tempo de Partida</h3>
                    <div className="input-group">
                        <label>Duração Padrão de cada Tempo (min)</label>
                        <input
                            type="number"
                            value={defaultHalfLength}
                            onChange={e => setDefaultHalfLength(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary" style={{ marginTop: '16px', justifyContent: 'center', padding: '16px' }}>
                        <Save size={20} /> {isSaved ? 'Salvo!' : 'Salvar Configurações'}
                    </button>
                </form>
            </section>
        </div>
    );
};

export default Settings;
