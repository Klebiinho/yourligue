import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import type { Player, Team } from '../context/LeagueContext';
import { HighlightCard } from './HighlightCard';
import { Loader2, ImageDown, Video, X, Pencil } from 'lucide-react';

interface VideoGeneratorProps {
    player: Player;
    team: Team;
    sportType: string;
    eventType: 'MVP' | 'Gol' | 'Ponto' | 'Assist' | 'Rebote' | 'Falta';
    stats: { [key: string]: number };
    onClose?: () => void;
}

// Shared download helper – works on desktop and mobile
async function downloadBlob(blob: Blob, fileName: string) {
    // Try Web Share first (mobile)
    const file = new File([blob], fileName, { type: blob.type });
    const shareData = { title: 'Meu Destaque na Partida', files: [file] };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        try {
            await navigator.share(shareData);
            return;
        } catch (err: any) {
            if (err.name === 'AbortError') return; // user cancelled
        }
    }
    // Fallback: force-download via object URL
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    
    // Ensure consistent download on PC
    a.style.display = 'none';
    document.body.appendChild(a);
    
    // Some browsers need a tiny delay to register the element in the DOM
    setTimeout(() => {
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 1000); // 1s cleanup should be enough
    }, 50);
}

export const VideoGenerator: React.FC<VideoGeneratorProps> = ({
    player,
    team,
    sportType,
    eventType,
    stats,
    onClose,
}) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const transparentCardRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [generating, setGenerating] = useState(false);
    const [isRecordingFlow, setIsRecordingFlow] = useState(false);
    const [progress, setProgress] = useState(0);
    const [description, setDescription] = useState('');
    const [showDescField, setShowDescField] = useState(eventType !== 'MVP');

    // Static image download
    const handleDownloadImage = async () => {
        if (!cardRef.current) return;
        setGenerating(true);
        try {
            // Wait for assets to be ready
            await new Promise(r => setTimeout(r, 800));

            const dataUrl = await toPng(cardRef.current, {
                canvasWidth: 1080,
                canvasHeight: 1920,
                pixelRatio: 1,
                backgroundColor: '#1e1b4b',
                cacheBust: true,
                fetchRequestInit: { mode: 'cors' },
                skipAutoScale: true,
            });

            const fileName = `Destaque-${player.name.replace(/\s+/g, '-')}-${Date.now()}.png`;

            // On mobile, we still prefer Blob for sharing
            if (/Android|iPhone|iPad/i.test(navigator.userAgent)) {
                const res = await fetch(dataUrl);
                const blob = await res.blob();
                await downloadBlob(blob, fileName);
            } else {
                // On PC/Desktop, dataUrl directly is more reliable for large images
                const a = document.createElement('a');
                a.href = dataUrl;
                a.download = fileName;
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                    document.body.removeChild(a);
                }, 1000);
            }
        } catch (err) {
            console.error('Error generating image', err);
            alert('Erro ao gerar imagem. Verifique se as imagens permitem acesso público (CORS).');
        } finally {
            setGenerating(false);
        }
    };

    // Animated video recording
    const handleRecordVideo = async () => {
        if (!canvasRef.current || !transparentCardRef.current) return;
        setIsRecordingFlow(true);
        setGenerating(true);
        setProgress(0);

        try {
            await new Promise(r => setTimeout(r, 600));

            // Capture the static layout without values (video will draw them animating)
            const contentDataUrl = await toPng(transparentCardRef.current, {
                canvasWidth: 1080,
                canvasHeight: 1920,
                pixelRatio: 1,
                backgroundColor: 'transparent',
                cacheBust: true,
                fetchRequestInit: { mode: 'cors' },
                skipAutoScale: true,
            });

            const contentImg = new Image();
            contentImg.src = contentDataUrl;
            await new Promise(r => { contentImg.onload = r; });

            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d')!;
            if (!ctx) throw new Error('Canvas context failed');

            // Pick the best supported codec
            const mimeType = ['video/mp4', 'video/webm;codecs=vp9', 'video/webm'].find(m => MediaRecorder.isTypeSupported(m)) ?? 'video/webm';
            const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';

            const stream = canvas.captureStream(60);
            const mediaRecorder = new MediaRecorder(stream, { mimeType });
            const chunks: Blob[] = [];

            mediaRecorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
            mediaRecorder.onstop = async () => {
                const blob = new Blob(chunks, { type: mimeType });
                const fileName = `Destaque-${player.name.replace(/\s+/g, '-')}-${Date.now()}.${ext}`;
                await downloadBlob(blob, fileName);
                setIsRecordingFlow(false);
                setGenerating(false);
                setProgress(0);
            };

            mediaRecorder.start(100); // request data every 100ms

            // ── Sport palette for canvas ──────────────────────────────
            const isBasket = sportType === 'basketball';
            const bgTop    = isBasket ? '#7c2d12' : '#1e1b4b';
            const bgBot    = isBasket ? '#431407' : '#0f172a';
            const accentR  = isBasket ? 249 : 109;
            const accentG  = isBasket ? 115 : 40;
            const accentB  = isBasket ? 22  : 217;

            // ── Resolve stat element positions from DOM ────────────────
            const getElemCenter = (id: string): { x: number; y: number } | null => {
                const el = transparentCardRef.current?.querySelector(`#${id}`);
                if (!el) return null;
                const cRect = transparentCardRef.current!.getBoundingClientRect();
                const eRect = el.getBoundingClientRect();
                const scaleX = 1080 / (cRect.width || 1080);
                const scaleY = 1920 / (cRect.height || 1920);
                return {
                    x: (eRect.left - cRect.left + eRect.width / 2) * scaleX,
                    y: (eRect.top - cRect.top + eRect.height / 2) * scaleY,
                };
            };
            const statKeys   = Object.keys(stats);
            const statValues = Object.values(stats);
            const statPos    = statKeys.map((_, i) => getElemCenter(`metric-${i}`));

            const DURATION = 8000; // ms
            const FPS      = 60;
            const INTERVAL = 1000 / FPS;
            let frame = 0;
            let lastTime = Date.now();
            const startTime = Date.now();

            const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
            const easeOutBack  = (t: number) => {
                const c1 = 1.70158, c3 = c1 + 1;
                return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
            };

            const animate = () => {
                const now = Date.now();
                if (now - startTime >= DURATION) {
                    mediaRecorder.stop();
                    return;
                }
                requestAnimationFrame(animate);
                if (now - lastTime < INTERVAL) return;
                lastTime = now - ((now - lastTime) % INTERVAL);

                const t = (now - startTime) / DURATION; // 0→1 over total duration

                // ── Draw background gradient ──────────────────────────
                const bg = ctx.createLinearGradient(0, 0, 0, 1920);
                bg.addColorStop(0, bgTop);
                bg.addColorStop(1, bgBot);
                ctx.fillStyle = bg;
                ctx.fillRect(0, 0, 1080, 1920);

                // ── Animated ambient light blobs ──────────────────────
                const blobTime = frame / 60;
                const s1 = 1 + Math.sin(blobTime * 1.3) * 0.12;
                const g1 = ctx.createRadialGradient(180, 220, 0, 180, 220, 700 * s1);
                g1.addColorStop(0, `rgba(${accentR},${accentG},${accentB},0.28)`);
                g1.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = g1;
                ctx.beginPath(); ctx.arc(180, 220, 700 * s1, 0, Math.PI * 2); ctx.fill();

                const s2 = 1 + Math.sin(blobTime * 0.9 + 1.5) * 0.14;
                const g2 = ctx.createRadialGradient(900, 1700, 0, 900, 1700, 800 * s2);
                g2.addColorStop(0, `rgba(${accentR},${accentG},${accentB},0.22)`);
                g2.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = g2;
                ctx.beginPath(); ctx.arc(900, 1700, 800 * s2, 0, Math.PI * 2); ctx.fill();

                // ── Subtle grid lines ─────────────────────────────────
                ctx.strokeStyle = 'rgba(255,255,255,0.025)';
                ctx.lineWidth = 1;
                for (let x = 0; x <= 1080; x += 80) {
                    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 1920); ctx.stroke();
                }
                for (let y = 0; y <= 1920; y += 80) {
                    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1080, y); ctx.stroke();
                }

                // ── Slide-in layout ───────────────────────────────────
                const entryT  = Math.min(1, frame / 50);
                const entryE  = easeOutCubic(entryT);
                const yOffset = 120 * (1 - entryE);
                const opacity = Math.min(1, frame / 25);

                ctx.save();
                ctx.globalAlpha = opacity;
                ctx.translate(0, yOffset);
                ctx.drawImage(contentImg, 0, 0, 1080, 1920);
                ctx.restore();

                // ── Animated stat numbers ─────────────────────────────
                // Start: frame 15 (0.25s), duration: 80 frames (1.33s)
                if (frame >= 15) {
                    const numRaw  = Math.min(1, (frame - 15) / 80);
                    const numEase = easeOutBack(numRaw);
                    const fontSize = 110;

                    ctx.textAlign    = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.font         = `900 ${fontSize}px "Inter", system-ui, sans-serif`;

                    statValues.forEach((target, i) => {
                        const pos = statPos[i];
                        if (!pos) return;

                        const current = Math.round(target * numEase);

                        // shadow
                        ctx.shadowColor = `rgba(${accentR},${accentG},${accentB},0.7)`;
                        ctx.shadowBlur  = 40;

                        ctx.globalAlpha = opacity;
                        ctx.fillStyle   = 'white';
                        ctx.fillText(current.toString(), pos.x, pos.y);
                        ctx.shadowBlur  = 0;
                        ctx.globalAlpha = 1;
                    });
                }

                // ── Shine sweep ───────────────────────────────────────
                if (t > 0.05 && t < 0.35) {
                    const sweepT = (t - 0.05) / 0.3;
                    const sweepX = -200 + sweepT * 1480;
                    const shine = ctx.createLinearGradient(sweepX - 200, 0, sweepX + 200, 0);
                    shine.addColorStop(0, 'rgba(255,255,255,0)');
                    shine.addColorStop(0.5, 'rgba(255,255,255,0.07)');
                    shine.addColorStop(1, 'rgba(255,255,255,0)');
                    ctx.fillStyle = shine;
                    ctx.globalAlpha = 1;
                    ctx.fillRect(0, 0, 1080, 1920);
                }

                setProgress(Math.round(t * 100));
                frame++;
            };

            animate();

        } catch (err) {
            console.error(err);
            alert('Falha ao gravar vídeo. Tente novamente.');
            setIsRecordingFlow(false);
            setGenerating(false);
        }
    };

    // ── Preview scale: container 270x480, source 1080x1920 → scale 0.25 ──
    const PREVIEW_W = 270;
    const PREVIEW_H = 480;
    const PREVIEW_SCALE = PREVIEW_W / 1080;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">

            {/* ── Off-screen renders ────────────────────────────────── */}
            <div style={{ position: 'fixed', left: '-9999px', top: 0, opacity: 0, pointerEvents: 'none', width: '1080px', height: '1920px' }}>
                <HighlightCard
                    ref={cardRef}
                    player={player} team={team}
                    sportType={sportType} eventType={eventType}
                    stats={stats} description={description}
                />
                <HighlightCard
                    ref={transparentCardRef}
                    player={player} team={team}
                    sportType={sportType} eventType={eventType}
                    stats={stats} description={description}
                    transparent hideValues
                />
                <canvas ref={canvasRef} width={1080} height={1920} />
            </div>

            {/* ── Modal ─────────────────────────────────────────────── */}
            <div
                className="bg-slate-900 border border-slate-700/60 rounded-3xl shadow-2xl flex flex-col items-center overflow-hidden"
                style={{ maxWidth: '520px', width: '100%', maxHeight: '95dvh', overflowY: 'auto' }}
            >
                {/* Header */}
                <div className="w-full flex items-center justify-between p-5 border-b border-slate-700/50">
                    <div>
                        <h3 className="text-lg font-black text-white uppercase tracking-widest">Gerar Highlight</h3>
                        <p className="text-slate-400 text-xs mt-1">Formato Instagram Stories 9:16</p>
                    </div>
                    <button onClick={onClose} disabled={generating}
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition disabled:opacity-40">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-5 w-full flex flex-col items-center gap-5">
                    {/* Preview */}
                    <div
                        className="relative rounded-2xl overflow-hidden shadow-2xl ring-4 ring-slate-800"
                        style={{ width: `${PREVIEW_W}px`, height: `${PREVIEW_H}px`, flexShrink: 0 }}
                    >
                        <div style={{ width: '1080px', height: '1920px', transform: `scale(${PREVIEW_SCALE})`, transformOrigin: 'top left' }}>
                            <HighlightCard
                                player={player} team={team}
                                sportType={sportType} eventType={eventType}
                                stats={stats} description={description}
                            />
                        </div>
                        {/* Shine overlay */}
                        <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-black/20 via-transparent to-white/10 rounded-2xl" />
                    </div>

                    {/* Description input */}
                    {showDescField && eventType !== 'MVP' && (
                        <div className="w-full">
                            <label className="flex items-center gap-2 text-[0.65rem] font-black text-slate-400 uppercase tracking-widest mb-2">
                                <Pencil size={12} /> Descrição do lance <span className="text-slate-600">(opcional)</span>
                            </label>
                            <textarea
                                rows={2}
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder={
                                    eventType === 'Gol' ? 'Ex: Chute de fora da área no ângulo direito...' :
                                    eventType === 'Ponto' ? 'Ex: Bandeja espetacular no contra-ataque...' :
                                    eventType === 'Assist' ? 'Ex: Passe de calcanhar na área...' :
                                    'Descreva o lance...'
                                }
                                maxLength={120}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 resize-none focus:border-indigo-500 outline-none transition"
                            />
                            <p className="text-slate-600 text-[0.6rem] text-right mt-1">{description.length}/120</p>
                        </div>
                    )}
                    {eventType === 'MVP' && (
                        <button
                            onClick={() => setShowDescField(v => !v)}
                            className="text-[0.65rem] font-black text-slate-500 hover:text-slate-300 uppercase tracking-widest transition"
                        >
                            {showDescField ? '− Remover descrição' : '+ Adicionar descrição'}
                        </button>
                    )}

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-3 w-full">
                        <button
                            onClick={handleDownloadImage}
                            disabled={generating}
                            className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-black text-xs py-4 px-4 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all disabled:opacity-40 shadow-lg shadow-indigo-900/30"
                        >
                            {generating && !isRecordingFlow ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <ImageDown className="w-6 h-6" />
                            )}
                            <span className="uppercase tracking-wider">
                                {generating && !isRecordingFlow ? 'Gerando...' : 'Baixar Imagem'}
                            </span>
                            <span className="text-indigo-300 text-[0.55rem] font-normal">PNG · 1080×1920</span>
                        </button>

                        <button
                            onClick={handleRecordVideo}
                            disabled={generating}
                            className="bg-pink-600 hover:bg-pink-500 active:scale-95 text-white font-black text-xs py-4 px-4 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all disabled:opacity-40 shadow-lg shadow-pink-900/30"
                        >
                            {isRecordingFlow ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    <span className="uppercase tracking-wider">{progress}%</span>
                                    <span className="text-pink-300 text-[0.55rem] font-normal">Gravando…</span>
                                </>
                            ) : (
                                <>
                                    <Video className="w-6 h-6" />
                                    <span className="uppercase tracking-wider">Gerar Vídeo</span>
                                    <span className="text-pink-300 text-[0.55rem] font-normal">8s · com animação</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Progress bar for video */}
                    {isRecordingFlow && (
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-pink-500 rounded-full transition-all duration-200"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    )}

                    <p className="text-slate-600 text-[0.6rem] text-center leading-relaxed">
                        A imagem e o vídeo são salvos na <strong className="text-slate-500">galeria</strong> ou na pasta <strong className="text-slate-500">Downloads</strong>.<br />
                        Para melhor qualidade, certifique-se que as fotos permitem acesso público (CORS).
                    </p>
                </div>
            </div>
        </div>
    );
};

// Need to import React explicitly for JSX
import React from 'react';
