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
        // Page will redirect, so no need to reset state
    };

    return (
        <div className="auth-container" style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg-dark)', padding: '24px', width: '100%',
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(109, 40, 217, 0.2), transparent 30%), radial-gradient(circle at 80% 30%, rgba(16, 185, 129, 0.15), transparent 30%)'
        }}>
            <div className="auth-card" style={{ width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.5s ease' }}>

                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'inline-flex', background: 'linear-gradient(135deg, #6d28d9, #4c1d95)', padding: '16px', borderRadius: '20px', marginBottom: '16px', boxShadow: '0 8px 32px var(--primary-glow)' }}>
                        <Trophy size={40} color="white" />
                    </div>
                    <h1 style={{ fontSize: 'clamp(1.4rem, 6vw, 1.8rem)', fontFamily: 'Outfit', fontWeight: 800, marginBottom: '4px' }}>
                        Championship Manager
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Gerencie seu campeonato com estilo</p>
                </div>

                {/* Card */}
                <div className="glass-panel" style={{ padding: 'clamp(20px, 5vw, 32px)' }}>

                    {/* Google Button */}
                    <button onClick={handleGoogle} disabled={googleLoading}
                        style={{
                            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                            padding: '13px 20px', borderRadius: '12px', border: '1px solid var(--glass-border)',
                            background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', fontWeight: 600, fontSize: '0.95rem',
                            cursor: 'pointer', transition: 'all 0.2s', marginBottom: '20px',
                            opacity: googleLoading ? 0.7 : 1
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}>
                        <GoogleIcon />
                        {googleLoading ? 'Redirecionando...' : 'Continuar com Google'}
                    </button>

                    {/* Divider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }} />
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 500 }}>ou continue com email</span>
                        <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }} />
                    </div>

                    {/* Tabs — Login / Register */}
                    <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '4px', marginBottom: '24px' }}>
                        {(['login', 'register'] as const).map(m => (
                            <button key={m} onClick={() => { setMode(m); setError(''); setSuccess(''); }}
                                style={{
                                    flex: 1, padding: '10px', borderRadius: '10px', fontWeight: 600, fontSize: '0.875rem',
                                    background: mode === m ? 'var(--primary)' : 'transparent',
                                    color: mode === m ? 'white' : 'var(--text-muted)',
                                    transition: 'all 0.2s', cursor: 'pointer',
                                    boxShadow: mode === m ? '0 4px 12px var(--primary-glow)' : 'none'
                                }}>
                                {m === 'login' ? 'Entrar' : 'Criar Conta'}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {mode === 'register' && (
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={13} /> Nome</label>
                                <input type="text" placeholder="Seu nome completo" value={name} onChange={e => setName(e.target.value)} required />
                            </div>
                        )}
                        <div className="input-group" style={{ marginBottom: 0 }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={13} /> Email</label>
                            <input type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>
                        <div className="input-group" style={{ marginBottom: 0 }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Lock size={13} /> Senha</label>
                            <div style={{ position: 'relative' }}>
                                <input type={showPassword ? 'text' : 'password'} placeholder="Mínimo 6 caracteres"
                                    value={password} onChange={e => setPassword(e.target.value)} required
                                    style={{ paddingRight: '44px', width: '100%' }} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: 0 }}>
                                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid var(--danger)', borderRadius: '10px', padding: '12px 14px', color: 'var(--danger)', fontSize: '0.875rem', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                ⚠️ {error}
                            </div>
                        )}
                        {success && (
                            <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid var(--accent)', borderRadius: '10px', padding: '12px 14px', color: 'var(--accent)', fontSize: '0.875rem' }}>
                                ✅ {success}
                            </div>
                        )}

                        <button type="submit" className="btn-primary" disabled={loading}
                            style={{ justifyContent: 'center', padding: '14px', fontSize: '1rem', marginTop: '4px', opacity: loading ? 0.7 : 1 }}>
                            {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar Conta'}
                        </button>
                    </form>
                </div>

                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    Championship Manager © 2026 · Todos os direitos reservados
                </p>
            </div>
        </div>
    );
};

export default AuthPage;
