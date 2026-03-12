import { useState } from 'react';
import { useLeague } from '../context/LeagueContext';
import { Shuffle, Shield, Trophy } from 'lucide-react';
import TeamLogo from '../components/TeamLogo';

const Bracket = () => {
    const { teams, brackets, generateBracket, updateBracket, generateGroups } = useLeague();
    const [mode, setMode] = useState<'bracket' | 'groups'>('bracket');
    const [generating, setGenerating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editHome, setEditHome] = useState('');
    const [editAway, setEditAway] = useState('');
    const [teamsPerGroup, setTeamsPerGroup] = useState(4);

    const handleGenerateBracket = async () => {
        if (!window.confirm('Isso vai substituir o chaveamento atual. Continuar?')) return;
        setGenerating(true);
        await generateBracket();
        setGenerating(false);
    };

    const handleGenerateGroups = async () => {
        if (!window.confirm('Isso vai sortear todos os times nos grupos. Continuar?')) return;
        setGenerating(true);
        await generateGroups(teamsPerGroup);
        setGenerating(false);
    };

    const saveScore = async (b: any) => {
        await updateBracket(b.id, { homeScore: parseInt(editHome) || 0, awayScore: parseInt(editAway) || 0, status: 'finished' });
        setEditingId(null);
    };

    const getTeam = (id?: string) => teams.find(t => t.id === id);

    // Group teams by their group_name
    const groups: Record<string, typeof teams> = {};
    teams.forEach(t => {
        if (t.group_name) {
            if (!groups[t.group_name]) groups[t.group_name] = [];
            groups[t.group_name].push(t);
        }
    });
    const sortedGroupNames = Object.keys(groups).sort();

    const MatchNode = ({ b }: { b: any }) => {
        const ht = getTeam(b.homeTeamId);
        const at = getTeam(b.awayTeamId);
        const isEdit = editingId === b.id;

        return (
            <div className={`bracket-match-node ${b.status === 'finished' ? 'finished' : ''}`} style={{ cursor: 'pointer' }}
                onClick={() => { setEditingId(b.id); setEditHome(String(b.homeScore)); setEditAway(String(b.awayScore)); }}>
                <div className={`node-team ${b.status === 'finished' && b.homeScore > b.awayScore ? 'winner' : ''}`}>
                    <TeamLogo src={ht?.logo} size={20} />
                    <span>{ht?.name || 'A definir'}</span>
                    <div className="node-score">{b.status !== 'scheduled' ? b.homeScore : '-'}</div>
                </div>
                <div className={`node-team ${b.status === 'finished' && b.awayScore > b.homeScore ? 'winner' : ''}`} style={{ marginTop: '4px' }}>
                    <TeamLogo src={at?.logo} size={20} />
                    <span>{at?.name || 'A definir'}</span>
                    <div className="node-score">{b.status !== 'scheduled' ? b.awayScore : '-'}</div>
                </div>
                {isEdit && (
                    <div className="glass-panel" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, padding: '10px', marginTop: '5px', display: 'flex', gap: '5px' }} onClick={e => e.stopPropagation()}>
                        <input type="number" value={editHome} onChange={e => setEditHome(e.target.value)} style={{ width: '40px', background: 'black', border: '1px solid var(--primary)', color: 'white' }} />
                        <input type="number" value={editAway} onChange={e => setEditAway(e.target.value)} style={{ width: '40px', background: 'black', border: '1px solid var(--accent)', color: 'white' }} />
                        <button onClick={() => saveScore(b)} className="btn-primary" style={{ padding: '4px 8px', fontSize: '0.7rem' }}>Ok</button>
                    </div>
                )}
            </div>
        );
    };

    const renderSide = (side: 'left' | 'right') => {
        const roundsToRender = ['oitavas', 'quartas', 'semifinal'];
        if (side === 'right') roundsToRender.reverse();

        return roundsToRender.map(r => {
            const allMatches = brackets.filter(b => b.round === r);
            if (allMatches.length === 0) return null;

            const half = Math.ceil(allMatches.length / 2);
            const sideMatches = side === 'left' ? allMatches.slice(0, half) : allMatches.slice(half);

            return (
                <div key={`${side}-${r}`} className="bracket-column">
                    <h3 style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'center' }}>{r}</h3>
                    {sideMatches.map(m => <MatchNode key={m.id} b={m} />)}
                </div>
            )
        });
    };

    return (
        <div className="animate-fade-in">
            {/* Mode Switcher */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '32px' }}>
                <button onClick={() => setMode('bracket')} className={mode === 'bracket' ? 'btn-primary' : 'btn-outline'} style={{ flex: 1, padding: '12px' }}>🏆 Chaveamento Visual</button>
                <button onClick={() => setMode('groups')} className={mode === 'groups' ? 'btn-primary' : 'btn-outline'} style={{ flex: 1, padding: '12px' }}>📊 Fase de Grupos</button>
            </div>

            {mode === 'bracket' ? (
                <>
                    <header className="mb-40" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                        <div>
                            <h1 className="responsive-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                🏆 Chaveamento do Torneio
                            </h1>
                            <p className="responsive-subtitle">Organização visual estilo Champions League</p>
                        </div>
                        <button onClick={handleGenerateBracket} className="btn-primary" disabled={generating} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Shuffle size={18} /> {generating ? 'Gerando...' : 'Gerar Chaveamento'}
                        </button>
                    </header>

                    {brackets.length === 0 ? (
                        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <Shield size={60} style={{ opacity: 0.1, marginBottom: '20px' }} />
                            <h3 style={{ marginBottom: '8px' }}>Nenhum chaveamento gerado</h3>
                            <p>Clique em "Gerar Chaveamento" para criar o bracket automaticamente.</p>
                        </div>
                    ) : (
                        <div className="visual-bracket-wrapper glass-panel">
                            <div className="bracket-container">
                                {/* Left Side */}
                                {renderSide('left')}

                                {/* Center (Final) */}
                                <div className="bracket-center-node">
                                    <Trophy className="trophy-center" size={80} color="#fbbf24" />
                                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fbbf24', letterSpacing: '2px' }}>FINAL</div>
                                    {brackets.filter(b => b.round === 'final').map(m => (
                                        <div key={m.id} className="bracket-match-node final-match"
                                            onClick={() => { setEditingId(m.id); setEditHome(String(m.homeScore)); setEditAway(String(m.awayScore)); }}>
                                            <MatchNode b={m} />
                                        </div>
                                    ))}
                                </div>

                                {/* Right Side */}
                                {renderSide('right')}
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <>
                    <header className="mb-40" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                        <div>
                            <h1 className="responsive-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                📊 Fase de Grupos
                            </h1>
                            <p className="responsive-subtitle">Sorteie os times em grupos automaticamente</p>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '4px 12px', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Times/Grupo:</span>
                                <input type="number" min="2" max="10" value={teamsPerGroup} onChange={e => setTeamsPerGroup(parseInt(e.target.value))} style={{ width: '40px', background: 'transparent', border: 'none', color: 'white', fontWeight: 800, fontSize: '1rem', outline: 'none' }} />
                            </div>
                            <button onClick={handleGenerateGroups} className="btn-primary" disabled={generating} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Shuffle size={18} /> {generating ? 'Sorteando...' : 'Sortear Grupos'}
                            </button>
                        </div>
                    </header>

                    {sortedGroupNames.length === 0 ? (
                        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <Shield size={60} style={{ opacity: 0.1, marginBottom: '20px' }} />
                            <h3 style={{ marginBottom: '8px' }}>Nenhum grupo gerado</h3>
                            <p>Configure a quantidade de times por grupo e clique em "Sortear Grupos".</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                            {sortedGroupNames.map(gn => (
                                <div key={gn} className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                                    <div style={{ background: 'var(--primary)', padding: '12px 20px', fontWeight: 800, fontSize: '1.1rem', display: 'flex', justifyContent: 'space-between' }}>
                                        <span>GRUPO {gn}</span>
                                        <span style={{ opacity: 0.7, fontSize: '0.8rem' }}>{groups[gn].length} TIMES</span>
                                    </div>
                                    <div style={{ padding: '10px' }}>
                                        {groups[gn].map((t, idx) => (
                                            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: idx % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent', borderRadius: '8px' }}>
                                                <TeamLogo src={t.logo} size={32} />
                                                <span style={{ fontWeight: 600 }}>{t.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Bracket;
