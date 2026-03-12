import { useState } from 'react';
import { useLeague } from '../context/LeagueContext';
import { Shuffle, Shield } from 'lucide-react';
import TeamLogo from '../components/TeamLogo';

const ROUNDS = ['oitavas', 'quartas', 'semifinal', 'final'] as const;
const ROUND_LABELS: Record<string, string> = { oitavas: 'Oitavas', quartas: 'Quartas', semifinal: 'Semifinal', final: 'Final' };

const Bracket = () => {
    const { teams, brackets, generateBracket, updateBracket, generateGroups } = useLeague();
    const [mode, setMode] = useState<'bracket' | 'groups'>('bracket');
    const [filter, setFilter] = useState<string>('all');
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
    const filteredRounds = ROUNDS.filter(r => filter === 'all' || filter === r);

    // Group teams by their group_name
    const groups: Record<string, typeof teams> = {};
    teams.forEach(t => {
        if (t.group_name) {
            if (!groups[t.group_name]) groups[t.group_name] = [];
            groups[t.group_name].push(t);
        }
    });
    const sortedGroupNames = Object.keys(groups).sort();

    return (
        <div className="animate-fade-in">
            {/* Mode Switcher */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '32px' }}>
                <button onClick={() => setMode('bracket')} className={mode === 'bracket' ? 'btn-primary' : 'btn-outline'} style={{ flex: 1, padding: '12px' }}>🏆 Mata-Mata</button>
                <button onClick={() => setMode('groups')} className={mode === 'groups' ? 'btn-primary' : 'btn-outline'} style={{ flex: 1, padding: '12px' }}>📊 Fase de Grupos</button>
            </div>

            {mode === 'bracket' ? (
                <>
                    <header className="mb-40" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                        <div>
                            <h1 className="responsive-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                🏆 Chaveamento (Mata-Mata)
                            </h1>
                            <p className="responsive-subtitle">Bracket automático gerado pela classificação</p>
                        </div>
                        <button onClick={handleGenerateBracket} className="btn-primary" disabled={generating} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Shuffle size={18} /> {generating ? 'Gerando...' : 'Gerar Chaveamento'}
                        </button>
                    </header>

                    {/* Filter */}
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '32px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '6px', flexWrap: 'wrap' }}>
                        {['all', ...ROUNDS].map(r => (
                            <button key={r} onClick={() => setFilter(r)}
                                style={{ flex: '1 1 auto', minWidth: '60px', padding: '8px 6px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.2s', background: filter === r ? 'var(--primary)' : 'transparent', color: filter === r ? 'white' : 'var(--text-muted)' }}>
                                {r === 'all' ? 'Todos' : ROUND_LABELS[r]}
                            </button>
                        ))}
                    </div>

                    {brackets.length === 0 ? (
                        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <Shield size={60} style={{ opacity: 0.1, marginBottom: '20px' }} />
                            <h3 style={{ marginBottom: '8px' }}>Nenhum chaveamento gerado</h3>
                            <p>Clique em "Gerar Chaveamento" para criar o bracket automaticamente.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                            {filteredRounds.map(round => {
                                const roundMatches = brackets.filter(b => b.round === round);
                                if (roundMatches.length === 0) return null;
                                return (
                                    <div key={round}>
                                        <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
                                            {ROUND_LABELS[round]}
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>({roundMatches.length} jogo{roundMatches.length !== 1 ? 's' : ''})</span>
                                        </h2>
                                        <div className={`bracket-grid-${Math.min(roundMatches.length, 4)}`}>
                                            {roundMatches.map(b => {
                                                const ht = getTeam(b.homeTeamId);
                                                const at = getTeam(b.awayTeamId);
                                                const isEdit = editingId === b.id;
                                                return (
                                                    <div key={b.id} className="glass-panel" style={{ padding: '20px', position: 'relative' }}>
                                                        {/* Home */}
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderRadius: '8px', background: b.status === 'finished' && b.homeScore > b.awayScore ? 'rgba(109,40,217,0.15)' : 'rgba(0,0,0,0.2)', marginBottom: '4px' }}>
                                                            <TeamLogo src={ht?.logo} size={32} />
                                                            <span style={{ flex: 1, fontWeight: 700, fontSize: '0.95rem' }}>{ht?.name ?? 'A definir'}</span>
                                                            {isEdit
                                                                ? <input type="number" value={editHome} onChange={e => setEditHome(e.target.value)} style={{ width: '44px', textAlign: 'center', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--primary)', borderRadius: '6px', padding: '4px', color: 'white', fontSize: '1.1rem', fontWeight: 800 }} />
                                                                : <span style={{ fontWeight: 900, fontSize: '1.25rem', color: 'var(--primary)' }}>{b.status !== 'scheduled' ? b.homeScore : '-'}</span>}
                                                        </div>
                                                        {/* Away */}
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderRadius: '8px', background: b.status === 'finished' && b.awayScore > b.homeScore ? 'rgba(16,185,129,0.15)' : 'rgba(0,0,0,0.2)' }}>
                                                            <TeamLogo src={at?.logo} size={32} />
                                                            <span style={{ flex: 1, fontWeight: 700, fontSize: '0.95rem' }}>{at?.name ?? 'A definir'}</span>
                                                            {isEdit
                                                                ? <input type="number" value={editAway} onChange={e => setEditAway(e.target.value)} style={{ width: '44px', textAlign: 'center', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--accent)', borderRadius: '6px', padding: '4px', color: 'white', fontSize: '1.1rem', fontWeight: 800 }} />
                                                                : <span style={{ fontWeight: 900, fontSize: '1.25rem', color: 'var(--accent)' }}>{b.status !== 'scheduled' ? b.awayScore : '-'}</span>}
                                                        </div>
                                                        {/* Actions */}
                                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                                                            {isEdit ? (
                                                                <>
                                                                    <button onClick={() => saveScore(b)} className="action-icon-btn accent" title="Salvar">✓</button>
                                                                    <button onClick={() => setEditingId(null)} className="action-icon-btn" title="Cancelar">✕</button>
                                                                </>
                                                            ) : (
                                                                <button onClick={() => { setEditingId(b.id); setEditHome(String(b.homeScore)); setEditAway(String(b.awayScore)); }} className="action-icon-btn" title="Editar placar">
                                                                    Editar
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
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
