import { Shield } from 'lucide-react';

interface TeamLogoProps {
    src?: string;
    size?: number;
    fallbackText?: string;
    fallbackIcon?: React.ReactNode;
}

const TeamLogo = ({ src, size = 48, fallbackText, fallbackIcon }: TeamLogoProps) => {
    if (!src || src.length < 4) return (
        <div style={{ width: size, height: size, borderRadius: '50%', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--primary)', flexShrink: 0 }}>
            {fallbackIcon ?? (fallbackText ? <span style={{ fontSize: size * 0.4 }}>{fallbackText}</span> : <Shield size={size / 2} />)}
        </div>
    );

    if (src.length < 10 && !src.startsWith('http')) {
        return <div style={{ fontSize: `${size / 2}px`, width: size, height: size, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', flexShrink: 0 }}>{src}</div>;
    }

    return <img src={src} alt="logo" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--glass-border)', flexShrink: 0, backgroundColor: 'rgba(255,255,255,0.05)' }} />;
};

export default TeamLogo;
