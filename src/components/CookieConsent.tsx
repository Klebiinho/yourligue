import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

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
        <div className="fixed inset-0 flex items-center justify-center p-6 z-[2000] animate-fade-in backdrop-blur-sm bg-black/60">
            <div className="glass-panel max-w-sm w-full p-8 md:p-10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] border-primary/20 relative overflow-hidden group animate-scale-up">
                {/* Decorative background glow */}
                <div className="absolute -top-20 -right-20 w-48 h-48 bg-primary/20 rounded-full blur-[60px] group-hover:bg-primary/30 transition-colors" />
                <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-accent/10 rounded-full blur-[60px] group-hover:bg-accent/20 transition-colors" />

                <div className="flex flex-col items-center gap-6 relative z-10 text-center">
                    <div className="p-5 bg-primary/10 text-primary rounded-3xl flex-none border border-primary/20 shadow-xl shadow-primary/10">
                        <ShieldCheck size={40} strokeWidth={2.5} />
                    </div>
                    
                    <div>
                        <h3 className="text-xl font-outfit font-black text-white uppercase tracking-widest mb-3">
                            Privacidade & Cookies
                        </h3>
                        <p className="text-[0.75rem] leading-relaxed text-slate-400 mb-8 max-w-[280px] mx-auto">
                            Sua privacidade é nossa prioridade. Utilizamos cookies para otimizar sua experiência e analisar o uso da plataforma YourLigue. 
                            <br /><br />
                            Ao continuar, você aceita nossa <Link to="/politica-de-privacidade" className="text-primary font-extrabold hover:text-white transition-colors">Política de Dados</Link>.
                        </p>
                        
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleAccept}
                                className="w-full py-4 bg-primary text-white rounded-2xl font-black text-[0.7rem] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-lg shadow-primary/30 hover:brightness-110"
                            >
                                Aceitar e Continuar
                            </button>
                            <button
                                onClick={handleDecline}
                                className="w-full py-4 bg-white/5 text-slate-500 hover:text-white rounded-2xl font-black text-[0.7rem] uppercase tracking-[0.2em] transition-all border border-white/5 hover:bg-white/10"
                            >
                                Recusar Cookies
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CookieConsent;
