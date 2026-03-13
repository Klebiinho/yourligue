import { useLeague, type LeagueNotification } from '../context/LeagueContext';
import { X, Bell, Zap, Trophy } from 'lucide-react';

const NotificationTray = () => {
    const { notifications, clearNotification } = useLeague();

    if (notifications.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-[200] flex flex-col gap-3 w-80 pointer-events-none">
            {notifications.map((n: LeagueNotification) => (
                <div key={n.id}
                    className="pointer-events-auto animate-notification bg-bg-dark/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl flex items-start gap-4 transform transition-all hover:scale-[1.02]">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-none ${n.type === 'goal' ? 'bg-accent/20 text-accent shadow-[0_0_15px_rgba(16,185,129,0.2)]' :
                        n.type === 'match_start' ? 'bg-primary/20 text-primary shadow-[0_0_15px_rgba(109,40,217,0.2)]' :
                            'bg-white/10 text-white'
                        }`}>
                        {n.type === 'goal' ? <Zap size={20} fill="currentColor" /> :
                            n.type === 'match_start' ? <Trophy size={20} /> :
                                <Bell size={20} />}
                    </div>

                    <div className="flex-1 min-w-0">
                        <h4 className="font-outfit font-black text-white text-xs uppercase tracking-widest flex items-center gap-2">
                            {n.title}
                            {n.type === 'goal' && <span className="animate-ping w-1.5 h-1.5 bg-accent rounded-full" />}
                        </h4>
                        <p className="text-[0.7rem] text-slate-400 font-bold mt-1 leading-tight">{n.message}</p>
                    </div>

                    <button
                        onClick={() => clearNotification(n.id)}
                        className="p-1.5 rounded-lg hover:bg-white/5 text-slate-600 hover:text-white transition-colors"
                    >
                        <X size={14} />
                    </button>

                    {/* Progress bar for auto-removal indicator */}
                    <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary to-accent opacity-30 animate-shrink" />
                </div>
            ))}
        </div>
    );
};

export default NotificationTray;
