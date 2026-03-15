import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useLeague, type Match } from '../context/LeagueContext';
import TeamLogo from '../components/TeamLogo';

const MatchOverlay = () => {
    const { matchId } = useParams<{ matchId: string }>();
    const { matches, teams } = useLeague();
    const match = matches.find((m: Match) => m.id === matchId);
    
    const [localSeconds, setLocalSeconds] = useState(match?.timer || 0);

    const homeTeam = teams.find(t => t.id === match?.homeTeamId);
    const awayTeam = teams.find(t => t.id === match?.awayTeamId);

    // Sincronização do Cronômetro
    useEffect(() => {
        let interval: any;
        if (match?.status === 'live') {
            const start = Date.now() - (match.timer * 1000);
            interval = window.setInterval(() => {
                setLocalSeconds(Math.floor((Date.now() - start) / 1000));
            }, 1000);
        } else {
            setLocalSeconds(match?.timer || 0);
        }
        return () => window.clearInterval(interval);
    }, [match?.status, match?.timer]);

    const formatTime = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (!match || !homeTeam || !awayTeam) return null;

    const periodLabel = match.period === 'Pênaltis' || match.period === 'Sel. Batedores' ? 'PÊNALTIS' : match.period;

    return (
        <div className="min-h-screen w-screen bg-transparent flex items-start justify-start p-6 font-outfit select-none animate-fade-in overflow-hidden">
            {/* AGGRESSIVE TRANSPARENCY OVERRIDE FOR STREAMING TOOLS */}
            <style>{`
                :root, html, body, #root { 
                    background: transparent !important; 
                    background-color: transparent !important;
                    background-image: none !important; 
                }
                * { -webkit-font-smoothing: antialiased; }
            `}</style>
            
            {/* Main Scoreboard Container */}
            <div className="flex flex-col items-start gap-1">
                <div className="flex items-stretch h-12 bg-black/90 backdrop-blur-md rounded-xl overflow-hidden border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                    
                    {/* Timer & Period Section */}
                    <div className="bg-primary px-4 flex flex-col items-center justify-center border-r border-white/10 min-w-[70px]">
                        <span className="text-[0.55rem] font-black text-white/70 uppercase tracking-tighter leading-none mb-0.5">
                            {periodLabel}
                        </span>
                        <span className="text-sm font-mono font-black text-white leading-none">
                            {match.period === 'Pênaltis' || match.period === 'Sel. Batedores' ? '--:--' : formatTime(localSeconds)}
                        </span>
                    </div>

                    {/* Home Team */}
                    <div className="flex items-center gap-3 px-4 border-r border-white/5 bg-white/[0.02]">
                        <div className="flex flex-col items-end">
                            <span className="text-[0.75rem] font-black text-white uppercase truncate max-w-[100px] leading-none">
                                 {homeTeam.name}
                            </span>
                        </div>
                        <TeamLogo src={homeTeam.logo} size={28} />
                        <div className="flex items-center justify-center w-10 h-full bg-primary/20">
                            <span className="text-xl font-black text-primary text-glow-primary">
                                {match.homeScore}
                            </span>
                        </div>
                    </div>

                    {/* Divider / VS */}
                    <div className="flex items-center justify-center px-1 opacity-20">
                        <div className="w-px h-6 bg-white" />
                    </div>

                    {/* Away Team */}
                    <div className="flex items-center gap-3 px-4 bg-white/[0.02]">
                        <div className="flex items-center justify-center w-10 h-full bg-accent/20">
                            <span className="text-xl font-black text-accent text-glow-accent">
                                {match.awayScore}
                            </span>
                        </div>
                        <TeamLogo src={awayTeam.logo} size={28} />
                        <div className="flex flex-col items-start">
                            <span className="text-[0.75rem] font-black text-white uppercase truncate max-w-[100px] leading-none">
                                {awayTeam.name}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Extra Info Row (Stays below primary scoreboard) */}
                <div className="flex gap-1">
                    {/* Added Time */}
                    {(match.extraTime || 0) > 0 && match.period !== 'Pênaltis' && (
                        <div className="bg-danger px-2 py-0.5 rounded-lg text-[0.6rem] font-black text-white shadow-lg animate-pulse border border-white/10">
                            +{match.extraTime} ACRÉSCIMO
                        </div>
                    )}

                    {/* Penalty Shootout Indicators */}
                    {match.period === 'Pênaltis' && (
                        <div className="bg-black/80 backdrop-blur-sm px-3 py-1 rounded-xl border border-white/10 flex items-center gap-3 shadow-xl">
                            <div className="flex gap-1.5">
                                {match.events.filter(e => e.teamId === match.homeTeamId && (e.type === 'penalty_shootout_goal' || e.type === 'penalty_shootout_miss')).map((e, i) => (
                                    <div key={i} className={`w-2 h-2 rounded-full ${e.type === 'penalty_shootout_goal' ? 'bg-accent shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-danger shadow-[0_0_8px_rgba(239,68,68,0.8)]'}`} />
                                ))}
                            </div>
                            <div className="w-px h-3 bg-white/20" />
                            <div className="flex gap-1.5">
                                {match.events.filter(e => e.teamId === match.awayTeamId && (e.type === 'penalty_shootout_goal' || e.type === 'penalty_shootout_miss')).map((e, i) => (
                                    <div key={i} className={`w-2 h-2 rounded-full ${e.type === 'penalty_shootout_goal' ? 'bg-accent shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-danger shadow-[0_0_8px_rgba(239,68,68,0.8)]'}`} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MatchOverlay;
