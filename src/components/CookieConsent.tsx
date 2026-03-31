import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ShieldCheck, X } from 'lucide-react';

const CookieConsent = () => {
    const [show, setShow] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const consent = localStorage.getItem('yourligue-cookie-consent');
        if (!consent) {
            // Delay showing the banner for better UX
            const timer = setTimeout(() => setShow(true), 2000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('yourligue-cookie-consent', 'accepted');
        setShow(false);
    };

    const handleDecline = () => {
        localStorage.setItem('yourligue-cookie-consent', 'declined');
        setShow(false);
    };

    if (!show) return null;

    // Don't show cookie consent on match overlay pages
    if (location.pathname.includes('/match/') && location.pathname.includes('/widget')) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:max-w-md z-[1000] animate-slide-up">
            <div className="glass-panel p-5 md:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-primary/20 relative overflow-hidden group">
                {/* Decorative background flare */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors" />
                
                <button 
                    onClick={() => setShow(false)}
                    className="absolute top-3 right-3 p-1 text-slate-500 hover:text-white transition-colors"
                >
                    <X size={16} />
                </button>

                <div className="flex gap-4 items-start relative z-10">
                    <div className="p-3 bg-primary/10 text-primary rounded-2xl flex-none border border-primary/20">
                        <ShieldCheck size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-outfit font-black text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                            Privacidade e Cookies
                        </h3>
                        <p className="text-[0.7rem] leading-relaxed text-slate-400 mb-4">
                            Utilizamos cookies para melhorar sua experiência, analisar o tráfego e personalizar conteúdos. Ao continuar navegando, você concorda com nossa <Link to="/politica-de-privacidade" className="text-primary hover:underline font-bold">Política de Privacidade</Link>.
                        </p>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleAccept}
                                className="flex-1 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-black text-[0.6rem] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-primary/20"
                            >
                                Aceitar Tudo
                            </button>
                            <button
                                onClick={handleDecline}
                                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl font-black text-[0.6rem] uppercase tracking-widest transition-all border border-white/5"
                            >
                                Recusar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CookieConsent;
