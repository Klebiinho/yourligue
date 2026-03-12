import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Trophy, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

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

const AuthPage = () => {
    const { signIn, signUp, signInWithGoogle } = useAuth();
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); setSuccess(''); setLoading(true);
        if (mode === 'login') {
            const { error } = await signIn(email, password);
            if (error) setError(error);
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
        <div className="min-h-screen w-full flex items-center justify-center bg-bg-dark p-6 md:p-12 relative overflow-hidden">
            {/* Background Decorative Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/15 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-[420px] flex flex-col gap-8 animate-fade-in relative z-10">
                {/* Logo Section */}
                <div className="text-center">
                    <div className="inline-flex bg-gradient-to-br from-primary to-[#4c1d95] p-5 rounded-3xl mb-5 shadow-[0_12px_40px_rgba(109,40,217,0.4)]">
                        <Trophy size={40} className="text-white" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-outfit font-extrabold mb-2 tracking-tight">
                        Championship Manager
                    </h1>
                    <p className="text-slate-400 text-sm md:text-base font-medium">Gerencie seu campeonato com estilo</p>
                </div>

                {/* Main Card */}
                <div className="glass-panel p-8 md:p-10">
                    {/* Google Button */}
                    <button
                        onClick={handleGoogle}
                        disabled={googleLoading}
                        className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold transition-all duration-300 mb-6 disabled:opacity-50"
                    >
                        <GoogleIcon />
                        {googleLoading ? 'Redirecionando...' : 'Continuar com Google'}
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex-1 h-[1px] bg-white/10" />
                        <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">ou continue com email</span>
                        <div className="flex-1 h-[1px] bg-white/10" />
                    </div>

                    {/* Tabs */}
                    <div className="flex bg-black/40 rounded-xl p-1 mb-6">
                        {(['login', 'register'] as const).map(m => (
                            <button
                                key={m}
                                onClick={() => { setMode(m); setError(''); setSuccess(''); }}
                                className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 ${mode === m
                                        ? 'bg-primary text-white shadow-[0_4px_12px_rgba(109,40,217,0.4)]'
                                        : 'text-slate-400 hover:text-slate-200'
                                    }`}
                            >
                                {m === 'login' ? 'Entrar' : 'Criar Conta'}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {mode === 'register' && (
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-semibold text-slate-400 flex items-center gap-2 ml-1">
                                    <User size={13} /> Nome
                                </label>
                                <input
                                    className="bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    type="text"
                                    placeholder="Seu nome completo"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    required
                                />
                            </div>
                        )}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold text-slate-400 flex items-center gap-2 ml-1">
                                <Mail size={13} /> Email
                            </label>
                            <input
                                className="bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                type="email"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold text-slate-400 flex items-center gap-2 ml-1">
                                <Lock size={13} /> Senha
                            </label>
                            <div className="relative">
                                <input
                                    className="bg-black/30 border border-white/10 rounded-xl pl-4 pr-12 py-3 w-full text-white placeholder:text-slate-600 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Mínimo 6 caracteres"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-danger/10 border border-danger/20 rounded-xl p-3.5 text-danger text-sm font-medium flex items-start gap-2.5 animate-fade-in">
                                <span className="text-base leading-none">⚠️</span>
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="bg-accent/10 border border-accent/20 rounded-xl p-3.5 text-accent text-sm font-medium flex items-start gap-2.5 animate-fade-in">
                                <span className="text-base leading-none">✅</span>
                                {success}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-primary hover:brightness-110 text-white font-bold py-4 rounded-xl shadow-[0_8px_20px_rgba(109,40,217,0.3)] transition-all active:scale-[0.98] disabled:opacity-70 mt-2 text-lg"
                        >
                            {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar Conta'}
                        </button>
                    </form>
                </div>

                <p className="text-center text-slate-500 text-xs font-medium">
                    Championship Manager © 2026 · Todos os direitos reservados
                </p>
            </div>
        </div>
    );
};

export default AuthPage;
