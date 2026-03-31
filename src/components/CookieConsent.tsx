import { useState, useEffect } from 'react';
import { Shield, X, Check } from 'lucide-react';

const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie-consent', 'accepted');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:w-[400px] z-[9999] animate-slide-up">
            <div className="glass-panel p-6 border-t-2 border-t-primary shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden relative group">
                {/* Background glow */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-[60px] rounded-full group-hover:bg-primary/20 transition-all duration-700" />
                
                <div className="flex gap-5 relative z-10">
                    <div className="flex-none">
                        <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
                            <Shield size={24} />
                        </div>
                    </div>
                    
                    <div className="flex-1 space-y-4">
                        <div>
                            <h3 className="text-white font-outfit font-black uppercase tracking-widest text-sm mb-1">Nossa Política de Dados</h3>
                            <p className="text-slate-400 text-xs leading-relaxed font-medium">
                                Utilizamos cookies para garantir a melhor experiência, salvar suas preferências de liga e manter sua sessão segura. Ao continuar, você concorda com nossos termos.
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={handleAccept}
                                className="flex-1 bg-white text-black font-black uppercase text-[0.65rem] tracking-[0.2em] py-3.5 rounded-xl hover:bg-primary hover:text-white transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
                            >
                                <Check size={14} strokeWidth={3} /> Aceitar Tudo
                            </button>
                            <button 
                                onClick={() => setIsVisible(false)}
                                className="px-4 py-3.5 bg-white/5 border border-white/10 text-slate-500 rounded-xl hover:bg-white/10 transition-all"
                                title="Fechar"
                            >
                                <X size={16} strokeWidth={3} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CookieConsent;
