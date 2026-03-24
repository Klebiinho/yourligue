import { forwardRef } from 'react';
import { Trophy, Star, Target } from 'lucide-react';
import type { Player, Team } from '../context/LeagueContext';

interface HighlightCardProps {
    player?: Player;
    team?: Team;
    sportType: string;
    eventType: 'MVP' | 'Gol' | 'Ponto' | 'Assist' | 'Rebote' | 'Falta';
    stats: { [key: string]: number };
    month?: string;
    transparent?: boolean;
    hideValues?: boolean;
}

export const HighlightCard = forwardRef<HTMLDivElement, HighlightCardProps>(
    ({ player, team, sportType, eventType, stats, transparent = false, hideValues = false }, ref) => {
        
        if (!player || !team) return null;

        const isBasket = sportType === 'basketball';
        const primaryColor = isBasket ? 'from-orange-950 to-orange-900' : 'from-indigo-900 to-purple-900';
        const bgColor = transparent ? 'bg-transparent' : `bg-gradient-to-br ${primaryColor}`;
        
        let title = "DESTAQUE DA PARTIDA";
        let icon = <Trophy className="w-40 h-40 text-yellow-400 mx-auto mb-16" />;
        
        if (eventType === 'Gol') {
            title = "GOLAAAAÇO!";
            icon = <Target className="w-40 h-40 text-emerald-400 mx-auto mb-16" />;
        } else if (eventType === 'Ponto') {
            title = "CESTA!!!";
            icon = <Target className="w-40 h-40 text-orange-400 mx-auto mb-16" />;
        } else if (eventType === 'Assist') {
            title = "GARÇOM!";
            icon = <Star className="w-40 h-40 text-blue-300 mx-auto mb-16" />;
        } else if (eventType === 'Rebote') {
            title = "PAREDÃO!";
            icon = <Trophy className="w-40 h-40 text-orange-400 mx-auto mb-16" />;
        } else if (eventType === 'MVP') {
            title = "MELHOR DO JOGO!";
            icon = <Star className="w-40 h-40 text-yellow-400 mx-auto mb-16 shadow-[0_0_40px_rgba(250,204,21,0.4)]" />;
        }

        return (
            <div 
                ref={ref} 
                className={`w-[1080px] h-[1920px] ${bgColor} text-white flex flex-col items-center justify-between p-24 relative overflow-hidden`}
                style={{ opacity: 1, transform: 'scale(1)' }}
            >
                {/* Decorative Elements for Static Mode */}
                {!transparent && (
                    <div className="absolute inset-0 pointer-events-none">
                       <div className="absolute top-[-10%] left-[-10%] w-[1000px] h-[1000px] bg-purple-500/20 rounded-full blur-[120px]" />
                       <div className="absolute bottom-[-10%] right-[-10%] w-[1000px] h-[1000px] bg-indigo-500/20 rounded-full blur-[120px]" />
                    </div>
                )}

                <div className="z-10 text-center mt-20 w-full">
                    {icon}
                    <h1 className="text-[100px] font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600 drop-shadow-lg uppercase leading-none">
                        {title}
                    </h1>
                    <h2 className="text-[50px] font-bold text-gray-300 tracking-widest mt-8 uppercase w-full line-clamp-1">
                        {team.name}
                    </h2>
                </div>
                {/* Info */}
                <div className="z-10 flex flex-col items-center mt-10">
                    <div className="bg-white/10 backdrop-blur-md px-10 py-4 rounded-full border border-white/30 mb-8 animate-pulse">
                        <span className="text-4xl font-black text-white tracking-[0.3em] uppercase">
                            {eventType === 'MVP' ? 'MELHOR DA PARTIDA' : (eventType === 'Gol' ? 'GOL!!!' : (eventType === 'Ponto' ? 'CESTA!!!' : eventType))}
                        </span>
                    </div>
                    <div className="relative w-[600px] h-[600px] mb-16">
                        {player?.photo ? (
                            <img 
                                src={player.photo} 
                                alt={player.name} 
                                className="w-full h-full object-cover rounded-full border-[16px] border-white/20 shadow-[0_0_100px_rgba(255,255,255,0.2)]"
                                crossOrigin="anonymous"
                            />
                        ) : (
                            <div className="w-full h-full bg-white/10 rounded-full border-[16px] border-white/20 flex items-center justify-center backdrop-blur-md shadow-[0_0_100px_rgba(255,255,255,0.1)]">
                                <span className="text-[300px] font-bold text-white/50">{player.number || '?'}</span>
                            </div>
                        )}
                        {team?.logo && (
                            <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-white rounded-full p-4 shadow-2xl flex items-center justify-center border-8 border-indigo-900">
                                <img src={team.logo} alt={team.name} className="w-full h-full object-contain" crossOrigin="anonymous" />
                            </div>
                        )}
                    </div>
                    
                    <div className="flex flex-col items-center gap-6">
                        {player.number && <span className="text-[100px] font-black text-yellow-400 bg-black/20 px-12 py-4 rounded-full backdrop-blur-md leading-none">#{player.number}</span>}
                        <h2 className="text-[90px] font-black leading-none text-center bg-clip-text drop-shadow-xl">{player.name}</h2>
                    </div>
                </div>

                <div className="z-10 grid grid-cols-2 gap-12 w-full max-w-[1000px] mx-auto mb-32 mt-12">
                    {Object.entries(stats).map(([label, value], i) => (
                        <div key={label} className="bg-black/20 backdrop-blur-xl rounded-[40px] p-12 flex flex-col items-center border-[4px] border-white/10 shadow-2xl">
                            <p className="text-[40px] text-gray-300 font-semibold uppercase tracking-wider mb-4">{label}</p>
                            {/* If hideValues is true, we leave the box empty so the Canvas can draw the counting numbers! */}
                            <p 
                                id={`metric-${i}`} 
                                className="text-[120px] font-black leading-none text-white drop-shadow-lg"
                                style={{ opacity: hideValues ? 0 : 1 }}
                            >
                                {value}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="z-10 text-center pb-12 w-full absolute bottom-12 left-0">
                    <p className="text-[45px] font-black tracking-widest text-white/30 uppercase">GERADO POR YOURLIGUE.APP</p>
                </div>
            </div>
        );
    }
);

HighlightCard.displayName = 'HighlightCard';
