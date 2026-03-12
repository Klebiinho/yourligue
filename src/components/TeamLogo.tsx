import { Shield } from 'lucide-react';

interface TeamLogoProps {
    src?: string;
    size?: number;
    fallbackText?: string;
    fallbackIcon?: React.ReactNode;
}

const TeamLogo = ({ src, size = 48, fallbackText, fallbackIcon }: TeamLogoProps) => {
    const sizeStyle = { width: size, height: size };

    if (!src || src.length < 4) return (
        <div
            style={sizeStyle}
            className="rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center flex-none shadow-lg shadow-primary/5 transition-transform hover:scale-105 duration-300"
        >
            {fallbackIcon ?? (fallbackText ? <span className="font-outfit font-black uppercase text-primary" style={{ fontSize: size * 0.4 }}>{fallbackText.slice(0, 2)}</span> : <Shield size={size / 2} className="text-primary/60" strokeWidth={2.5} />)}
        </div>
    );

    if (src.length < 10 && !src.startsWith('http')) {
        return (
            <div
                style={sizeStyle}
                className="rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-none uppercase font-black font-outfit text-white shadow-xl backdrop-blur-sm"
                style={{ ...sizeStyle, fontSize: `${size / 2.2}px` }}
            >
                {src}
            </div>
        );
    }

    return (
        <img
            src={src}
            alt="logo"
            style={sizeStyle}
            className="rounded-full border border-white/10 object-cover flex-none bg-white/5 shadow-2xl transition-all hover:border-primary/50 hover:scale-105 duration-500 ring-2 ring-transparent hover:ring-primary/20"
        />
    );
};

export default TeamLogo;
