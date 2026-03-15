import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLeague } from '../context/LeagueContext';
import { Mail, Lock, User, Eye, EyeOff, X } from 'lucide-react';

/* Google "G" SVG icon */
const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
        <path fill="none" d="M0 0h48v48H0z" />
    </svg>
);

const AuthModal = () => {
    const { signIn, signUp, signInWithGoogle } = useAuth();
    const { showAuthModal, setShowAuthModal } = useLeague();
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [success, setSuccess] = useState('');

    if (!showAuthModal) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); setSuccess(''); setLoading(true);
        if (mode === 'login') {
            const { error } = await signIn(email, password);
            if (error) setError(error);
            else setShowAuthModal(false);
        } else {
            if (password.length < 6) { setError('Senha deve ter no mínimo 6 caracteres.'); setLoading(false); return; }
            const { error } = await signUp(email, password, name);
            if (error) setError(error);
            else setSuccess('Conta criada! Verifique seu email para confirmar o cadastro.');
        }
        setLoading(false);
    };

    const handleGoogle = async () => {
        setGoogleLoading(true);
        await signInWithGoogle();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in"
                onClick={() => setShowAuthModal(false)}
            />

            {/* Modal */}
            <div className="relative glass-panel w-full max-w-[420px] max-h-[95vh] overflow-y-auto no-scrollbar flex flex-col p-6 sm:p-8 animate-scale-in shadow-[0_30px_100px_rgba(0,0,0,0.8)] border-white/10">
                <button
                    onClick={() => setShowAuthModal(false)}
                    className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                >
                    <X size={20} />
                </button>

                {/* Logo Section */}
                <div className="text-center mb-6">
                    <div className="inline-flex mb-3">
                        <img src="/logo.png" alt="YourLigue" className="w-16 h-16 object-contain drop-shadow-[0_0_15px_rgba(109,40,217,0.25)]" />
                    </div>
                    <h2 className="text-xl font-outfit font-extrabold text-white tracking-tight">
                        {mode === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}
                    </h2>
                    <p className="text-slate-400 text-xs mt-1">Para salvar sua torcida e favoritos</p>
                </div>

                {/* Google Button */}
                <button
                    onClick={handleGoogle}
                    disabled={googleLoading}
                    className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold transition-all duration-300 mb-5 disabled:opacity-50 text-sm"
                >
                    <GoogleIcon />
                    {googleLoading ? 'Redirecionando...' : 'Continuar com Google'}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-4 mb-5">
                    <div className="flex-1 h-[1px] bg-white/10" />
                    <span className="text-slate-500 text-[0.6rem] font-bold uppercase tracking-widest whitespace-nowrap">ou use email</span>
                    <div className="flex-1 h-[1px] bg-white/10" />
                </div>

                {/* Tabs */}
                <div className="flex bg-black/40 rounded-xl p-1 mb-5">
                    {(['login', 'register'] as const).map(m => (
                        <button
                            key={m}
                            onClick={() => { setMode(m); setError(''); setSuccess(''); }}
                            className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all duration-300 ${mode === m
                                ? 'bg-primary text-white shadow-[0_4px_12px_rgba(109,40,217,0.3)]'
                                : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            {m === 'login' ? 'Entrar' : 'Cadastrar'}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {mode === 'register' && (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[0.65rem] font-bold text-slate-500 flex items-center gap-2 ml-1 uppercase tracking-wider">
                                <User size={12} /> Nome
                            </label>
                            <input
                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-slate-600 focus:border-primary outline-none transition-all"
                                type="text"
                                placeholder="Seu nome"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                            />
                        </div>
                    )}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[0.65rem] font-bold text-slate-500 flex items-center gap-2 ml-1 uppercase tracking-wider">
                            <Mail size={12} /> Email
                        </label>
                        <input
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-slate-600 focus:border-primary outline-none transition-all"
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[0.65rem] font-bold text-slate-500 flex items-center gap-2 ml-1 uppercase tracking-wider">
                            <Lock size={12} /> Senha
                        </label>
                        <div className="relative">
                            <input
                                className="bg-white/5 border border-white/10 rounded-xl pl-4 pr-10 py-2.5 w-full text-white text-sm placeholder:text-slate-600 focus:border-primary outline-none transition-all"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Mínimo 6 dígitos"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-danger/10 border border-danger/20 rounded-xl p-3 text-danger text-[0.7rem] font-bold flex items-start gap-2 animate-fade-in uppercase">
                            <span>⚠️</span> {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-accent/10 border border-accent/20 rounded-xl p-3 text-accent text-[0.7rem] font-bold flex items-start gap-2 animate-fade-in uppercase">
                            <span>✅</span> {success}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-primary hover:brightness-110 text-white font-black py-3 rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-70 mt-2 text-xs uppercase tracking-widest"
                    >
                        {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar Conta'}
                    </button>
                </form>

                <p className="text-center text-slate-600 text-[0.55rem] font-bold uppercase tracking-widest mt-6">
                    YourLigue © 2026
                </p>
            </div>
        </div>
    );
};

export default AuthModal;
