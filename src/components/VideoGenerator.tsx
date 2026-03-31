import { useRef, useState, useEffect, useMemo } from 'react';
import { toPng, toBlob } from 'html-to-image';
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
    const [preloading, setPreloading] = useState(true);
    const [isRecordingFlow, setIsRecordingFlow] = useState(false);
    const [progress, setProgress] = useState(0);
    const [description, setDescription] = useState('');
    const [showDescField, setShowDescField] = useState(eventType !== 'MVP');
    
    // Base64 preloaded assets to bypass CORS on canvas
    const [preloadedAssets, setPreloadedAssets] = useState<{ playerPhoto?: string, teamLogo?: string }>({});

    // Asset Preloader – crucial for mobile/canvas CORS
    useEffect(() => {
        let isMounted = true;
        const preload = async () => {
            setPreloading(true);

            try {
                const fetchAsBase64 = async (url: string) => {
                    if (!url) return undefined;
                    
                    // Helper to try fetch with specific strategy
                    const tryFetch = async (targetUrl: string) => {
                        const controller = new AbortController();
                        const id = setTimeout(() => controller.abort(), 8000); 
                        const response = await fetch(targetUrl, { mode: 'cors', signal: controller.signal });
                        clearTimeout(id);
                        if (!response.ok) throw new Error(`HTTP ${response.status}`);
                        const blob = await response.blob();
                        return new Promise<string>((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result as string);
                            reader.onerror = reject;
                            reader.readAsDataURL(blob);
                        });
                    };

                    try {
                        return await tryFetch(url);
                    } catch (e) {
                        console.warn('Initial preload failed, trying proxy...', url, e);
                        try {
                            // Use images.weserv.nl as a CORS proxy/optimizer fallback
                            const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(url)}&output=webp`;
                            return await tryFetch(proxyUrl);
                        } catch (e2) {
                            console.error('Proxy fallback also failed for', url, e2);
                            return undefined; 
                        }
                    }
                };

                const [pImg, tImg] = await Promise.all([
                    player.photo ? fetchAsBase64(player.photo) : Promise.resolve(undefined),
                    team.logo ? fetchAsBase64(team.logo) : Promise.resolve(undefined)
                ]);

                if (isMounted) {
                    setPreloadedAssets({ playerPhoto: pImg, teamLogo: tImg });
                }
            } catch (err) {
                console.error('All preloads failed', err);
            } finally {
                if (isMounted) setPreloading(false);
            }
        };

        preload();
        return () => { isMounted = false; };
    }, [player.id, player.photo, team.id, team.logo]);

    // Static image download
    const handleDownloadImage = async () => {
        if (!cardRef.current) return;
        setGenerating(true);
        try {
            // Give extra time for React to render the hidden elements and for images to paint
            await new Promise(r => setTimeout(r, 1200));

            const fileName = `Destaque-${player.name.replace(/\s+/g, '-')}-${Date.now()}.png`;
            
            // toBlob is generally more memory-efficient and reliable for large snapshots
            const blob = await toBlob(cardRef.current, {
                canvasWidth: 1080,
                canvasHeight: 1920,
                pixelRatio: 1,
                fetchRequestInit: { mode: 'cors' },
                skipAutoScale: true,
            });

            if (!blob) throw new Error('Falha ao gerar arquivo de imagem');

            await downloadBlob(blob, fileName);
            
        } catch (err: any) {
            console.error('Error generating image', err);
            // Informatively handle CORS or memory errors
            if (err.message?.includes('CORS')) {
                alert('Erro de permissão: Algumas imagens não permitem o download direto. Tente usar fotos públicas.');
            } else {
                alert('Erro ao gerar imagem. Tente novamente em alguns segundos ou use um navegador mais atualizado.');
            }
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
                fetchRequestInit: { mode: 'cors' },
                skipAutoScale: true,
            });

            const contentImg = new Image();
            contentImg.src = contentDataUrl;
            await new Promise((resolve, reject) => { 
                contentImg.onload = resolve; 
                contentImg.onerror = () => reject(new Error('Falha ao carregar frame base do vídeo'));
            });

            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
            if (!ctx) throw new Error('Falha ao inicializar o processador de vídeo (Canvas context failed)');

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

            // ── Team colors for canvas ──────────────────────────────
            const hexToRgb = (hex: string) => {
                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? {
                    r: parseInt(result[1], 16),
                    g: parseInt(result[2], 16),
                    b: parseInt(result[3], 16)
                } : null;
            };

            const isBasket = sportType === 'basketball';
            const teamRgb = team?.primaryColor ? hexToRgb(team.primaryColor) : null;

            const bgTop   = team.primaryColor || (isBasket ? '#7c2d12' : '#1e1b4b');
            const bgBot   = isBasket ? '#431407' : '#0f172a';
            const accentR = teamRgb?.r ?? (isBasket ? 249 : 109);
            const accentG = teamRgb?.g ?? (isBasket ? 115 : 40);
            const accentB = teamRgb?.b ?? (isBasket ? 22  : 217);

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
            const eventPos   = getElemCenter('event-label-container');

            const labelMap: Record<string, string> = {
                MVP:    'MELHOR DA PARTIDA',
                Gol:    'GOOOOOL',
                Ponto:  'CESTA!!!',
                Assist: 'GARÇOM!',
                Rebote: 'PAREDÃO!',
                Falta:  'FALTA!',
            };
            const displayLabel = labelMap[eventType] || eventType;

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

                // ── Animated highlight label (PILL TEXT) ──────────────
                if (eventPos) {
                    const waveTime = frame / 60;
                    const chars = displayLabel.split('');
                    
                    ctx.textAlign    = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.font         = '950 56px "Inter", "Outfit", system-ui, sans-serif';
                    ctx.fillStyle     = 'white';
                    ctx.shadowColor   = 'rgba(0,0,0,0.6)';
                    ctx.shadowBlur    = 30;
                    ctx.shadowOffsetY = 4;

                    // Approximation for letter-spacing (0.15em of 56px is ~8.4px)
                    const charSpacing = 10; 
                    const charWidths = chars.map(c => ctx.measureText(c).width);
                    const totalWidth = charWidths.reduce((a, b) => a + b, 0) + (chars.length - 1) * charSpacing;
                    
                    let drawX = eventPos.x - totalWidth / 2;
                    chars.forEach((char, i) => {
                        const charW = charWidths[i];
                        const individualX = drawX + charW / 2;
                        
                        // Wave offset (sync'd with CSS version)
                        const offsetT = waveTime * 4.5 + (i * 0.4); 
                        const yWave = Math.sin(offsetT) * 12;

                        ctx.fillText(char, individualX, eventPos.y + yWave);
                        drawX += charW + charSpacing;
                    });
                    
                    ctx.shadowBlur = 0;
                    ctx.shadowOffsetY = 0;
                }

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

    // ── Dynamic Preview scale ──
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Calculate how much space we have for the preview
    // Modal max-width is 520px, but on mobile it's windowWidth - padding
    const horizontalPadding = windowWidth < 640 ? 32 : 80;
    const verticalPadding = windowWidth < 640 ? 120 : 180;
    const availableWidth = Math.min(520, windowWidth) - horizontalPadding;
    const availableHeight = typeof window !== 'undefined' ? window.innerHeight - verticalPadding : 800;
    
    // We want the preview to fit nicely. 
    // Original card is 1080x1920.
    // We want the preview to fit nicely, considering both width and height constraints.
    // Original card is 1080x1920 (9:16 aspect ratio).
    const PREVIEW_W = Math.min(300, availableWidth, availableHeight * (9/16));
    const PREVIEW_SCALE = PREVIEW_W / 1080;
    const PREVIEW_H = 1920 * PREVIEW_SCALE;

    // Prepare optimized data for rendering (substitute base64)
    const pData = useMemo(() => ({ ...player, photo: preloadedAssets.playerPhoto || player.photo }), [player, preloadedAssets.playerPhoto]);
    const tData = useMemo(() => ({ ...team, logo: preloadedAssets.teamLogo || team.logo }), [team, preloadedAssets.teamLogo]);

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 bg-black/95 backdrop-blur-xl animate-fade-in overflow-hidden">
            
            {preloading && (
                <div className="fixed inset-0 bg-black/60 z-[130] flex flex-col items-center justify-center gap-4 animate-fade-in backdrop-blur-md cursor-wait">
                    <Loader2 className="animate-spin text-primary" size={48} />
                    <span className="text-white font-black uppercase tracking-widest text-[0.6rem]">Otimizando Imagens...</span>
                </div>
            )}

            {/* ── Off-screen renders (Only for generation) ────────────────── */}
            {generating && (
                <div style={{ position: 'fixed', left: '-9999px', top: 0, opacity: 0, pointerEvents: 'none', width: '1080px', height: '1920px' }}>
                    <HighlightCard
                        ref={cardRef}
                        player={pData} team={tData}
                        sportType={sportType} eventType={eventType}
                        stats={stats} description={description}
                    />
                    <HighlightCard
                        ref={transparentCardRef}
                        player={pData} team={tData}
                        sportType={sportType} eventType={eventType}
                        stats={stats} description={description}
                        transparent hideValues
                    />
                    <canvas ref={canvasRef} width={1080} height={1920} />
                </div>
            )}

            {/* ── Modal ─────────────────────────────────────────────── */}
            <div
                className="bg-slate-950/90 border border-white/10 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.8)] flex flex-col items-center overflow-hidden w-full max-w-[500px] max-h-[94dvh] animate-scale-in"
            >
                {/* Header */}
                <div className="w-full flex items-center justify-between p-3 sm:p-5 border-b border-slate-700/50 flex-none bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary flex-none">
                            <Video size={16} className="sm:w-[18px]" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-xs sm:text-lg font-black text-white uppercase tracking-widest truncate">Flash Destaque</h3>
                            <p className="text-slate-400 text-[0.55rem] sm:text-xs mt-0.5 truncate">Gere vídeos épicos do lance</p>
                        </div>
                    </div>
                    <button onClick={onClose}
                        className="w-8 h-8 sm:w-9 sm:h-9 flex-none flex items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition">
                        <X size={16} className="sm:w-[18px]" />
                    </button>
                </div>

                <div className="p-4 sm:p-7 w-full flex flex-col items-center gap-5 sm:gap-7 overflow-y-auto no-scrollbar scroll-smooth">
                    {/* Preview Area */}
                    <div className="relative group">
                        {/* Static Glow behind preview */}
                        <div 
                            className="absolute inset-[-40px] opacity-20 blur-[80px] rounded-full pointer-events-none"
                            style={{ background: team.primaryColor || '#6366f1' }}
                        />
                        
                        <div
                            className="relative rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/20 flex-none bg-black/40"
                            style={{ width: `${PREVIEW_W}px`, height: `${PREVIEW_H}px` }}
                        >
                            <div style={{ width: '1080px', height: '1920px', transform: `scale(${PREVIEW_SCALE})`, transformOrigin: 'top left' }}>
                                <HighlightCard
                                    player={pData} team={tData}
                                    sportType={sportType} eventType={eventType}
                                    stats={stats} description={description}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Description Section */}
                    {showDescField && eventType !== 'MVP' && (
                        <div className="w-full animate-fade-in">
                            <label className="flex items-center gap-2 text-[0.6rem] font-black text-slate-500 uppercase tracking-[0.2em] mb-2.5 ml-1">
                                <Pencil size={11} className="text-primary" /> Descrição do lance <span className="opacity-40">(opcional)</span>
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
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3.5 text-white text-sm placeholder:text-slate-600 resize-none focus:border-primary/50 focus:bg-white/[0.05] outline-none transition-all shadow-inner"
                            />
                            <div className="flex justify-between items-center mt-2 px-1">
                                <span className="text-[0.55rem] text-slate-600 font-bold uppercase tracking-widest italic">Personalize sua arte</span>
                                <span className={`text-[0.6rem] font-black tabular-nums ${description.length >= 110 ? 'text-danger' : 'text-slate-600'}`}>
                                    {description.length}/120
                                </span>
                            </div>
                        </div>
                    )}
                    {eventType === 'MVP' && (
                        <button
                            onClick={() => setShowDescField(v => !v)}
                            className="text-[0.6rem] font-black text-slate-500 hover:text-primary uppercase tracking-[0.2em] transition-all py-2 px-4 rounded-full border border-white/5 bg-white/[0.02] hover:bg-primary/10 active:scale-95"
                        >
                            {showDescField ? '− Remover descrição' : '+ Adicionar descrição personalizada'}
                        </button>
                    )}

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-4 w-full flex-none">
                        <button
                            onClick={handleDownloadImage}
                            disabled={generating}
                            className="group relative bg-white/[0.03] hover:bg-indigo-600 border border-white/10 hover:border-indigo-400 text-white font-black text-xs py-5 px-4 rounded-[2rem] flex flex-col items-center justify-center gap-2 transition-all duration-300 disabled:opacity-40 active:scale-95 overflow-hidden shadow-xl"
                        >
                            <div className="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            {generating && !isRecordingFlow ? (
                                <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                            ) : (
                                <ImageDown className="w-6 h-6 group-hover:scale-110 transition-transform" />
                            )}
                            <div className="relative z-10 flex flex-col items-center">
                                <span className="uppercase tracking-[0.15em]">Imagem</span>
                                <span className="text-[0.55rem] text-slate-500 group-hover:text-indigo-200 font-bold mt-0.5">1080×1920 PNG</span>
                            </div>
                        </button>

                        <button
                            onClick={handleRecordVideo}
                            disabled={generating}
                            className="group relative bg-white/[0.03] hover:bg-pink-600 border border-white/10 hover:border-pink-400 text-white font-black text-xs py-5 px-4 rounded-[2rem] flex flex-col items-center justify-center gap-2 transition-all duration-300 disabled:opacity-40 active:scale-95 overflow-hidden shadow-xl"
                        >
                            <div className="absolute inset-0 bg-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            {isRecordingFlow ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin text-pink-400" />
                                    <div className="relative z-10 flex flex-col items-center">
                                        <span className="uppercase tracking-[0.15em]">{progress}%</span>
                                        <span className="text-[0.55rem] text-pink-200 font-bold mt-0.5 uppercase">Gravando...</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Video className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                    <div className="relative z-10 flex flex-col items-center">
                                        <span className="uppercase tracking-[0.15em]">Vídeo</span>
                                        <span className="text-[0.55rem] text-slate-500 group-hover:text-pink-200 font-bold mt-0.5">8s Animado</span>
                                    </div>
                                </>
                            )}
                        </button>
                    </div>

                    {!generating && (
                        <button 
                            onClick={onClose}
                            className="text-[0.55rem] font-bold text-slate-600 hover:text-white uppercase tracking-[0.3em] py-3 transition-colors mt-2"
                        >
                            Cancelar e Voltar
                        </button>
                    )}

                    {/* Progress bar for video */}
                    {isRecordingFlow && (
                        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden flex-none">
                            <div
                                className="h-full bg-pink-500 rounded-full transition-all duration-200"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    )}

                    <p className="text-slate-600 text-[0.55rem] sm:text-[0.6rem] text-center leading-relaxed flex-none pb-2">
                        A imagem e o vídeo são salvos na <strong className="text-slate-500">galeria</strong> ou no dispositivo.<br />
                        Para melhor qualidade, use fotos públicas equilibradas.
                    </p>
                </div>
            </div>
        </div>
    );
};
