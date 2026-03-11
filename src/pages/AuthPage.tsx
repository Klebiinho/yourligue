import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Trophy, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

const AuthPage = () => {
    const { signIn, signUp } = useAuth();
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); setSuccess(''); setLoading(true);
        if (mode === 'login') {
            const { error } = await signIn(email, password);
            if (error) setError(error);
        } else {
            const { error } = await signUp(email, password, name);
            if (error) setError(error);
            else setSuccess('Conta criada! Verifique seu email para confirmar.');
        }
        setLoading(false);
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg-dark)', padding: '16px',
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(109, 40, 217, 0.2), transparent 30%), radial-gradient(circle at 80% 30%, rgba(16, 185, 129, 0.15), transparent 30%)'
        }}>
            <div style={{ width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '32px', animation: 'fadeIn 0.5s ease' }}>
                {/* Logo */}
                <div style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', background: 'var(--primary)', padding: '16px', borderRadius: '20px', marginBottom: '16px', boxShadow: '0 8px 32px var(--primary-glow)' }}>
                        <Trophy size={40} color="white" />
                    </div>
                    <h1 style={{ fontSize: '2rem', fontFamily: 'Outfit', fontWeight: 800, marginBottom: '8px' }}>Championship Manager</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Gerencie seu campeonato com estilo</p>
                </div>

                {/* Card */}
                <div className="glass-panel" style={{ padding: '32px' }}>
                    {/* Tabs */}
                    <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '4px', marginBottom: '28px' }}>
                        {(['login', 'register'] as const).map(m => (
                            <button key={m} onClick={() => { setMode(m); setError(''); setSuccess(''); }}
                                style={{
                                    flex: 1, padding: '10px', borderRadius: '10px', fontWeight: 600, fontSize: '0.875rem',
                                    background: mode === m ? 'var(--primary)' : 'transparent',
                                    color: mode === m ? 'white' : 'var(--text-muted)',
                                    transition: 'all 0.2s', boxShadow: mode === m ? '0 4px 12px var(--primary-glow)' : 'none'
                                }}>
                                {m === 'login' ? 'Entrar' : 'Criar Conta'}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {mode === 'register' && (
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={14} /> Nome</label>
                                <input type="text" placeholder="Seu nome" value={name} onChange={e => setName(e.target.value)} required />
                            </div>
                        )}
                        <div className="input-group" style={{ marginBottom: 0 }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={14} /> Email</label>
                            <input type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>
                        <div className="input-group" style={{ marginBottom: 0 }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Lock size={14} /> Senha</label>
                            <div style={{ position: 'relative' }}>
                                <input type={showPassword ? 'text' : 'password'} placeholder="Mínimo 6 caracteres" value={password}
                                    onChange={e => setPassword(e.target.value)} required style={{ paddingRight: '44px', width: '100%' }} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', borderRadius: '8px', padding: '12px', color: 'var(--danger)', fontSize: '0.875rem' }}>
                                {error}
                            </div>
                        )}

                        {success && (
                            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--accent)', borderRadius: '8px', padding: '12px', color: 'var(--accent)', fontSize: '0.875rem' }}>
                                {success}
                            </div>
                        )}

                        <button type="submit" className="btn-primary" disabled={loading}
                            style={{ justifyContent: 'center', padding: '14px', fontSize: '1rem', marginTop: '8px', opacity: loading ? 0.7 : 1 }}>
                            {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar Conta'}
                        </button>
                    </form>
                </div>

                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    Championship Manager © 2026
                </p>
            </div>
        </div>
    );
};

export default AuthPage;
