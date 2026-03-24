import { forwardRef } from 'react';
import type { Player, Team } from '../context/LeagueContext';

interface HighlightCardProps {
    player?: Player;
    team?: Team;
    sportType: string;
    eventType: 'MVP' | 'Gol' | 'Ponto' | 'Assist' | 'Rebote' | 'Falta';
    stats: { [key: string]: number };
    description?: string;
    transparent?: boolean;
    hideValues?: boolean;
}

// ── Sport-aware palette ───────────────────────────────────────────
const PALETTES: Record<string, { grad: string[]; accent: string; glow: string }> = {
    basketball: {
        grad: ['#7c2d12', '#431407'],
        accent: '#f97316',
        glow: 'rgba(249,115,22,0.5)',
    },
    football: {
        grad: ['#1e1b4b', '#0f172a'],
        accent: '#6d28d9',
        glow: 'rgba(109,40,217,0.5)',
    },
};

// ── Helper: placeholder color when no photo ───────────────────────
const AVATAR_PLACEHOLDER = 'rgba(255,255,255,0.08)';

export const HighlightCard = forwardRef<HTMLDivElement, HighlightCardProps>(
    ({ player, team, sportType, eventType, stats, description, transparent = false, hideValues = false }, ref) => {

        if (!player || !team) return null;

        const darkenColor = (hex: string, percent: number) => {
            const num = parseInt(hex.replace('#', ''), 16),
                amt = Math.round(2.55 * percent),
                R = (num >> 16) - amt,
                G = (num >> 8 & 0x00FF) - amt,
                B = (num & 0x0000FF) - amt;
            return '#' + (0x1000000 + (R < 255 ? (R < 0 ? 0 : R) : 255) * 0x10000 + (G < 255 ? (G < 0 ? 0 : G) : 255) * 0x100 + (B < 255 ? (B < 0 ? 0 : B) : 255)).toString(16).slice(1);
        };

        const teamPalette = team.primaryColor ? {
            grad: [
                darkenColor(team.primaryColor, 15), // Top color slightly darkened for richness
                team.secondaryColor ? darkenColor(team.secondaryColor, 30) : darkenColor(team.primaryColor, 75) // Bottom color
            ], 
            accent: team.primaryColor,
            glow: team.primaryColor + '88',
        } : null;

        const palette = teamPalette ?? (PALETTES[sportType] ?? PALETTES.football);

        const labelMap: Record<string, string> = {
            MVP:    'MELHOR DA PARTIDA',
            Gol:    'GOOOOOL',
            Ponto:  'CESTA!!!',
            Assist: 'GARÇOM!',
            Rebote: 'PAREDÃO!',
            Falta:  'FALTA!',
        };

        const displayDescription = description || '';

        const bgStyle = transparent ? {} : {
            background: `linear-gradient(160deg, ${palette.grad[0]} 0%, ${palette.grad[1]} 100%)`,
        };
        return (
            <>
                <style dangerouslySetInnerHTML={{ __html: `
                    @keyframes wave-text {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-12px); }
                    }
                    .wave-char {
                        display: inline-block;
                        animation: wave-text 1.2s infinite ease-in-out;
                    }
                `}} />
                <div
                    ref={ref}
                    style={{
                        width: '1080px',
                        height: '1920px',
                        position: 'relative',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        color: 'white',
                        fontFamily: "'Inter', 'Outfit', system-ui, sans-serif",
                        ...bgStyle,
                    }}
                >
                {/* ── Layer 2: Background Watermark Logo ───────────────── */}
                {team.logo && !transparent && (
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '-1000px', // Large negative offset to shift the logo way to the left
                        transform: 'translateY(-50%)',
                        width: '2400px',
                        height: '2400px',
                        opacity: 0.04,
                        zIndex: 1,
                        pointerEvents: 'none',
                    }}>
                        <img 
                            src={team.logo} 
                            alt={team.name} 
                            crossOrigin="anonymous"
                            style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'contain',
                                filter: 'grayscale(100%) brightness(150%) contrast(150%)'
                            }} 
                        />
                    </div>
                )}

                {/* ── Layer 3: Background decorations (Blobs & Grid) ── */}
                {!transparent && (
                    <div style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
                        {/* top-left blob */}
                        <div style={{
                            position: 'absolute', top: '-200px', left: '-200px',
                            width: '900px', height: '900px', borderRadius: '50%',
                            background: `radial-gradient(circle, ${palette.glow.replace('0.5', '0.35')} 0%, transparent 70%)`,
                        }} />
                        {/* bottom-right blob */}
                        <div style={{
                            position: 'absolute', bottom: '-300px', right: '-200px',
                            width: '1000px', height: '1000px', borderRadius: '50%',
                            background: `radial-gradient(circle, ${palette.glow.replace('0.5', '0.25')} 0%, transparent 70%)`,
                        }} />
                        {/* subtle grid */}
                        <div style={{
                            position: 'absolute', inset: 0,
                            backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
                            backgroundSize: '80px 80px',
                        }} />
                    </div>
                )}

                {/* ── TOP: App branding strip ───────────────────────── */}
                <div style={{
                    width: '100%', padding: '48px 64px 0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', // Center branding since logo is gone
                    position: 'relative', zIndex: 10,
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>
                            yourligue.app
                        </span>
                    </div>
                </div>

                {/* ── EVENT label ───────────────────────────────────── */}
                <div style={{
                    position: 'relative', zIndex: 10,
                    marginTop: '64px',
                    background: `linear-gradient(90deg, ${palette.accent}, ${palette.accent}dd)`,
                    padding: '28px 100px',
                    borderRadius: '24px',
                    boxShadow: `0 20px 80px ${palette.glow}`,
                    border: '3px solid rgba(255,255,255,0.3)',
                    transform: 'skewX(-10deg)', // Dynamic slant
                }}>
                    <span style={{
                        fontSize: '56px', fontWeight: '950', letterSpacing: '0.25em',
                        textTransform: 'uppercase', color: 'white',
                        textShadow: '0 4px 30px rgba(0,0,0,0.6)',
                        display: 'flex',
                        gap: '2px',
                        transform: 'skewX(10deg)', // Un-skew text
                    }}>
                        {(labelMap[eventType] ?? eventType).split('').map((char, index) => (
                            <span 
                                key={index} 
                                className="wave-char" 
                                style={{ 
                                    animationDelay: `${index * 0.08}s`,
                                    marginRight: char === ' ' ? '30px' : '0' 
                                }}
                            >
                                {char}
                            </span>
                        ))}
                    </span>
                </div>

                {/* ── PLAYER PHOTO + team logo badge ────────────────── */}
                <div style={{
                    position: 'relative', zIndex: 10,
                    marginTop: '56px',
                    width: '620px', height: '620px',
                }}>
                    {/* glow ring */}
                    <div style={{
                        position: 'absolute', inset: '-12px', borderRadius: '50%',
                        background: `conic-gradient(${palette.accent}, transparent, ${palette.accent})`,
                        opacity: 0.5,
                    }} />
                    {/* photo or number fallback */}
                    {player.photo ? (
                        <img
                            src={player.photo}
                            alt={player.name}
                            crossOrigin="anonymous"
                            style={{
                                width: '620px', height: '620px',
                                objectFit: 'cover', borderRadius: '50%',
                                border: '14px solid rgba(255,255,255,0.18)',
                                boxShadow: `0 0 80px ${palette.glow}`,
                            }}
                        />
                    ) : (
                        <div style={{
                            width: '620px', height: '620px', borderRadius: '50%',
                            background: AVATAR_PLACEHOLDER,
                            border: '14px solid rgba(255,255,255,0.18)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <span style={{ fontSize: '260px', fontWeight: '900', color: 'rgba(255,255,255,0.4)' }}>
                                {player.number || '?'}
                            </span>
                        </div>
                    )}

                    {/* Team logo badge (bottom-right of photo) */}
                    {team.logo && (
                        <div style={{
                            position: 'absolute', bottom: '-15px', right: '-15px',
                            width: '210px', height: '210px',
                            background: 'white',
                            borderRadius: '50%',
                            padding: '12px',
                            border: `9px solid ${palette.grad[0]}`,
                            boxShadow: '0 12px 45px rgba(0,0,0,0.6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            overflow: 'hidden', // Ensures any square photo is cropped circular
                            zIndex: 2,
                        }}>
                            <img 
                                src={team.logo} 
                                alt={team.name} 
                                crossOrigin="anonymous"
                                style={{ 
                                    width: '100%', 
                                    height: '100%', 
                                    objectFit: 'cover', // Changed to cover for team photos, with contain fallback logic if it was a real logo
                                    borderRadius: '50%'
                                }} 
                            />
                        </div>
                    )}
                </div>

                {/* ── PLAYER INFO BOX ────────────────────────────── */}
                <div style={{
                    position: 'relative', zIndex: 10,
                    marginTop: '64px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    width: '100%', padding: '0 64px',
                }}>
                    {player.number && (
                        <div style={{
                            background: `linear-gradient(135deg, ${palette.accent}, ${palette.accent}88)`,
                            padding: '10px 32px',
                            borderRadius: '12px',
                            marginBottom: '16px',
                            boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
                        }}>
                             <span style={{ fontSize: '42px', fontWeight: '900', color: 'white' }}>#{player.number}</span>
                        </div>
                    )}
                    
                    <h2 style={{
                        fontSize: '82px', fontWeight: '950', lineHeight: 1.1,
                        textAlign: 'center', textTransform: 'uppercase', margin: 0,
                        color: 'white', letterSpacing: '-2px',
                        textShadow: '0 10px 40px rgba(0,0,0,0.8)',
                    }}>
                        {player.name}
                    </h2>

                    <div style={{
                        marginTop: '24px',
                        padding: '12px 40px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '99px',
                        backdropFilter: 'blur(8px)',
                    }}>
                        <span style={{
                            fontSize: '32px', fontWeight: '800', letterSpacing: '0.2em',
                            textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)',
                        }}>
                            {team.name}
                        </span>
                    </div>
                </div>

                {/* ── Description quote (event description) ─────────── */}
                {displayDescription && eventType !== 'MVP' && (
                    <div style={{
                        position: 'relative', zIndex: 10,
                        marginTop: '40px',
                        width: '100%', padding: '0 64px',
                    }}>
                        <div style={{
                            background: 'rgba(255,255,255,0.06)',
                            backdropFilter: 'blur(16px)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            borderLeft: `6px solid ${palette.accent}`,
                            borderRadius: '20px',
                            padding: '32px 48px',
                        }}>
                            <span style={{
                                fontSize: '36px', fontWeight: '500', fontStyle: 'italic',
                                color: 'rgba(255,255,255,0.8)', lineHeight: 1.5,
                                display: 'block', textAlign: 'center',
                            }}>
                                "{displayDescription}"
                            </span>
                        </div>
                    </div>
                )}

                {/* ── STATS grid ────────────────────────────────────── */}
                <div style={{
                    position: 'relative', zIndex: 10,
                    marginTop: displayDescription && eventType !== 'MVP' ? '32px' : '56px',
                    width: '100%', padding: '0 64px',
                    display: 'grid',
                    gridTemplateColumns: `repeat(${Math.min(Object.keys(stats).length, 3)}, 1fr)`,
                    gap: '28px',
                }}>
                    {Object.entries(stats).map(([label, value], i) => (
                        <div key={label} style={{
                            background: 'rgba(255,255,255,0.07)',
                            backdropFilter: 'blur(20px)',
                            border: '2px solid rgba(255,255,255,0.12)',
                            borderRadius: '32px',
                            padding: '40px 28px',
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', gap: '16px',
                        }}>
                            <span style={{
                                fontSize: '32px', fontWeight: '700',
                                textTransform: 'uppercase', letterSpacing: '0.1em',
                                color: 'rgba(255,255,255,0.5)',
                            }}>
                                {label}
                            </span>
                            <span
                                id={`metric-${i}`}
                                style={{
                                    fontSize: '110px', fontWeight: '900', lineHeight: 1,
                                    color: 'white',
                                    textShadow: `0 0 40px ${palette.glow}`,
                                    opacity: hideValues ? 0 : 1,
                                    display: 'block',
                                }}
                            >
                                {value}
                            </span>
                        </div>
                    ))}
                </div>

                {/* ── Bottom watermark ─────────────────────────────── */}
                <div style={{
                    position: 'absolute', bottom: '44px', left: 0, right: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '16px', zIndex: 10,
                }}>
                    <div style={{
                        height: '2px', flex: 1, maxWidth: '200px',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2))',
                    }} />
                    <span style={{
                        fontSize: '28px', fontWeight: '900', letterSpacing: '0.25em',
                        textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
                    }}>
                        yourligue.app
                    </span>
                    <div style={{
                        height: '2px', flex: 1, maxWidth: '200px',
                        background: 'linear-gradient(90deg, rgba(255,255,255,0.2), transparent)',
                    }} />
                </div>
                </div>
            </>
        );
    }
);

HighlightCard.displayName = 'HighlightCard';
