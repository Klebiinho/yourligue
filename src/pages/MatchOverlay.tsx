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
        <div className="fixed top-6 left-6 flex flex-col gap-0 select-none font-outfit">
            {/* Main Scoreboard Container */}
            <div className="flex items-stretch bg-black/90 rounded-lg overflow-hidden border border-white/10 shadow-2xl h-11">
                
                {/* League/Time Info */}
                <div className="bg-primary px-3 flex items-center justify-center border-r border-white/10">
                    <span className="text-[0.65rem] font-black text-white uppercase tracking-tighter italic">
                        {periodLabel}
                    </span>
                    <span className="ml-2 text-xs font-mono font-bold text-white/90 w-11 text-center">
                        {match.period === 'Pênaltis' ? '' : formatTime(localSeconds)}
                    </span>
                </div>

                {/* Home Team */}
                <div className="flex items-center gap-2 px-3 border-r border-white/5 min-w-[120px]">
                    <TeamLogo src={homeTeam.logo} size={24} />
                    <span className="text-[0.75rem] font-black text-white uppercase truncate max-w-[80px]">
                        {homeTeam.name.substring(0, 3)}
                    </span>
                    <span className="ml-auto text-xl font-black text-white flex items-center justify-center w-8 bg-white/5 h-full">
                        {match.homeScore}
                    </span>
                </div>

                {/* Away Team */}
                <div className="flex items-center gap-2 px-3 min-w-[120px]">
                    <span className="text-xl font-black text-white flex items-center justify-center w-8 bg-white/5 h-full mr-auto">
                        {match.awayScore}
                    </span>
                    <span className="text-[0.75rem] font-black text-white uppercase truncate max-w-[80px]">
                        {awayTeam.name.substring(0, 3)}
                    </span>
                    <TeamLogo src={awayTeam.logo} size={24} />
                </div>
            </div>

            {/* Extra Time / Penalty Shootout Detail */}
            {(match.extraTime || 0) > 0 && match.period !== 'Pênaltis' && (
                <div className="mt-1 self-start bg-danger/90 px-2 py-0.5 rounded text-[0.6rem] font-black text-white tracking-widest animate-pulse">
                    +{match.extraTime} ACRÉSCIMO
                </div>
            )}
            
            {match.period === 'Pênaltis' && (
                <div className="mt-1 bg-black/80 px-2 py-1 rounded border border-white/10 flex gap-2">
                    <div className="text-[0.6rem] font-black text-primary uppercase italic">PÊNALTIS:</div>
                    <div className="flex gap-1">
                        {match.events.filter(e => e.teamId === match.homeTeamId && (e.type === 'penalty_shootout_goal' || e.type === 'penalty_shootout_miss')).map((e, i) => (
                            <div key={i} className={`w-1.5 h-1.5 rounded-full ${e.type === 'penalty_shootout_goal' ? 'bg-accent' : 'bg-danger'}`} />
                        ))}
                    </div>
                    <div className="w-px h-2 bg-white/20" />
                    <div className="flex gap-1">
                        {match.events.filter(e => e.teamId === match.awayTeamId && (e.type === 'penalty_shootout_goal' || e.type === 'penalty_shootout_miss')).map((e, i) => (
                            <div key={i} className={`w-1.5 h-1.5 rounded-full ${e.type === 'penalty_shootout_goal' ? 'bg-accent' : 'bg-danger'}`} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MatchOverlay;
