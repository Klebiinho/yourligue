import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import download from 'downloadjs';
import type { Player, Team } from '../context/LeagueContext';
import { HighlightCard } from './HighlightCard';
import { Loader2, Share2, Video } from 'lucide-react';

interface Stats {
    [key: string]: number;
}

interface VideoGeneratorProps {
    player: Player;
    team: Team;
    sportType: string;
    eventType: 'MVP' | 'Gol' | 'Ponto' | 'Assist' | 'Rebote' | 'Falta';
    stats: Stats;
    onClose?: () => void;
}

export const VideoGenerator: React.FC<VideoGeneratorProps> = ({
    player,
    team,
    sportType,
    eventType,
    stats,
    onClose
}) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const transparentCardRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [generating, setGenerating] = useState(false);
    const [isRecordingFlow, setIsRecordingFlow] = useState(false);
    const [progress, setProgress] = useState(0);

    const shareMedia = async (blob: Blob, fileName: string, title: string) => {
        const file = new File([blob], fileName, { type: blob.type });
        const shareData = { title, text: 'Confira meu destaque na partida!', files: [file] };

        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
            try {
                await navigator.share(shareData);
                alert("Compartilhado com sucesso!");
            } catch (err: any) {
                if (err.name !== 'AbortError') {
                    download(blob, fileName, blob.type);
                }
            }
        } else {
            download(blob, fileName, blob.type);
        }
    };

    const handleShareImage = async () => {
        if (!cardRef.current) return;
        setGenerating(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500)); // wait for images to load
            
            const dataUrl = await toPng(cardRef.current, {
                canvasWidth: 1080,
                canvasHeight: 1920,
                pixelRatio: 1,
                backgroundColor: '#1e1b4b', // deep purple to avoid transparent edges
                cacheBust: true,
                fetchRequestInit: { mode: 'cors' },
            });

            const blob = await (await fetch(dataUrl)).blob();
            const fileName = `Destaque-${player.name.replace(/\s+/g, '-')}.png`;
            await shareMedia(blob, fileName, "Meu Destaque na Partida");

        } catch (err) {
            console.error("Erro ao gerar imagem", err);
            alert("Erro ao gerar imagem. Tente novamente.");
        } finally {
            setGenerating(false);
        }
    };

    const handleRecordVideo = async () => {
        if (!canvasRef.current || !transparentCardRef.current) return;
        setIsRecordingFlow(true);
        setGenerating(true);
        setProgress(0);

        try {
            await new Promise(resolve => setTimeout(resolve, 500));

            const contentDataUrl = await toPng(transparentCardRef.current, {
                canvasWidth: 1080,
                canvasHeight: 1920,
                pixelRatio: 1,
                backgroundColor: 'transparent',
                cacheBust: true,
                fetchRequestInit: { mode: 'cors' },
            });

            const contentImg = new Image();
            contentImg.src = contentDataUrl;
            await new Promise(resolve => { contentImg.onload = resolve; });

            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");
            if (!ctx) throw new Error("Canvas context failed");

            const stream = canvas.captureStream(60);
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: MediaRecorder.isTypeSupported("video/mp4") ? "video/mp4" : "video/webm"
            });

            const chunks: Blob[] = [];
            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            mediaRecorder.onstop = () => {
                // If the user's browser recorded webm, keep webm extension, but mp4 is preferred if supported
                const ext = MediaRecorder.isTypeSupported("video/mp4") ? "mp4" : "webm";
                const mime = ext === 'mp4' ? 'video/mp4' : 'video/webm';
                const blob = new Blob(chunks, { type: mime });
                const fileName = `Destaque-${player.name.replace(/\s+/g, '-')}.${ext}`;

                shareMedia(blob, fileName, "Meu Destaque na Partida");

                setIsRecordingFlow(false);
                setGenerating(false);
                setProgress(0);
            };

            mediaRecorder.start();

            let frame = 0;
            const fps = 60;
            const totalFrames = fps * 8; // 8 seconds duration
            
            // Collect target values for animation
            const targetStatsKeys = Object.keys(stats);
            const targetStatsValues = Object.values(stats);

            // Coords helper
            const getCoords = (id: string, fallx: number, fally: number) => {
                const el = transparentCardRef.current?.querySelector(`#${id}`);
                if (!el) return { x: fallx, y: fally };
                const cRect = transparentCardRef.current!.getBoundingClientRect();
                const eRect = el.getBoundingClientRect();
                const scaleX = 1080 / (cRect.width || 1080);
                const scaleY = 1920 / (cRect.height || 1920);
                return {
                    x: ((eRect.left - cRect.left) + (eRect.width / 2)) * scaleX,
                    y: ((eRect.top - cRect.top) + (eRect.height / 2)) * scaleY
                };
            };

            // Estimate positions based on number of stats
            const statPositions = targetStatsKeys.map((_, i) => getCoords(`metric-${i}`, 540, 1500)); 

            const startTime = Date.now();
            let lastFrameTime = Date.now();
            const fpsInterval = 1000 / fps;

            const animate = () => {
                if (Date.now() - startTime >= 8000) {
                    mediaRecorder.stop();
                    return;
                }

                requestAnimationFrame(animate);

                const now = Date.now();
                const elapsed = now - lastFrameTime;
                if (elapsed < fpsInterval) return;
                lastFrameTime = now - (elapsed % fpsInterval);

                // Background gradient
                const gradient = ctx.createLinearGradient(0, 0, 1080, 1920);
                gradient.addColorStop(0, "#1e1b4b");
                gradient.addColorStop(1, "#312e81");
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, 1080, 1920);

                // Animated bubbles
                const time = frame / 60;
                
                const s1 = 1 + Math.sin(time * 2) * 0.1;
                const g1 = ctx.createRadialGradient(200, 200, 0, 200, 200, 600 * s1);
                g1.addColorStop(0, "rgba(99, 102, 241, 0.3)");
                g1.addColorStop(1, "rgba(99, 102, 241, 0)");
                ctx.fillStyle = g1;
                ctx.fillRect(-400, -400, 1200 * s1, 1200 * s1);

                const s2 = 1 + Math.sin(time * 1.5 + 1) * 0.15;
                const g2 = ctx.createRadialGradient(880, 1600, 0, 880, 1600, 700 * s2);
                g2.addColorStop(0, "rgba(168, 85, 247, 0.3)");
                g2.addColorStop(1, "rgba(168, 85, 247, 0)");
                ctx.fillStyle = g2;
                ctx.fillRect(880 - 700 * s2, 1600 - 700 * s2, 1400 * s2, 1400 * s2);

                // Slide Up
                const entryProgress = Math.min(1, frame / 60); // 1s
                const easeOut = 1 - Math.pow(1 - entryProgress, 3);
                const yOffset = 150 * (1 - easeOut);
                const opacity = Math.min(1, frame / 30);

                ctx.save();
                ctx.globalAlpha = opacity;
                ctx.translate(0, yOffset);
                ctx.drawImage(contentImg, 0, 0, 1080, 1920);

                // Draw numbers counting up
                if (opacity > 0.1) {
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillStyle = "white";
                    ctx.font = `900 120px 'Inter', system-ui, sans-serif`;

                    const numProgress = Math.max(0, Math.min(1, (frame - 20) / 90)); // Start at frame 20, duration 1.5s
                    const numEase = 1 - Math.pow(1 - numProgress, 3);

                    targetStatsValues.forEach((targetVal, i) => {
                        const currentVal = Math.round(targetVal * numEase);
                        const pos = statPositions[i];
                        if (pos) {
                            ctx.shadowColor = "rgba(0,0,0,0.5)";
                            ctx.shadowBlur = 10;
                            ctx.fillText(currentVal.toString(), pos.x, pos.y);
                            ctx.shadowBlur = 0;
                        }
                    });
                }

                ctx.restore();

                setProgress(Math.round((frame / totalFrames) * 100));
                frame++;
            };

            animate();

        } catch (err) {
            console.error(err);
            alert("Falha ao gravar vídeo.");
            setIsRecordingFlow(false);
            setGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            
            {/* Hidden Renders */}
            <div className="fixed top-0 left-[-9999px] opacity-0 pointer-events-none w-[1080px] h-[1920px]">
                <HighlightCard 
                    ref={cardRef}
                    player={player}
                    team={team}
                    sportType={sportType}
                    eventType={eventType}
                    stats={stats}
                />
                <HighlightCard 
                    ref={transparentCardRef}
                    player={player}
                    team={team}
                    sportType={sportType}
                    eventType={eventType}
                    stats={stats}
                    transparent={true}
                    hideValues={true}
                />
                <canvas ref={canvasRef} width={1080} height={1920} />
            </div>

            {/* Modal UI */}
            <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-md shadow-2xl flex flex-col items-center animate-in zoom-in-95">
                <h3 className="text-xl font-bold text-white mb-2">Gerar Highlight</h3>
                <p className="text-slate-400 text-sm text-center mb-6">Compartilhe este momento épico no Instagram ou WhatsApp</p>

                <div className="relative w-full max-w-[240px] aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl ring-4 ring-slate-800 bg-slate-950 mb-8">
                    <div className="origin-top-left transform scale-[0.2222]">
                        <HighlightCard 
                            player={player}
                            team={team}
                            sportType={sportType}
                            eventType={eventType}
                            stats={stats}
                        />
                    </div>
                    {/* Glossy Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none rounded-2xl" />
                </div>

                <div className="grid grid-cols-2 gap-3 w-full">
                    <button
                        onClick={handleShareImage}
                        disabled={generating}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50"
                    >
                        {generating && !isRecordingFlow ? <Loader2 className="w-5 h-5 animate-spin" /> : <Share2 className="w-5 h-5" />}
                        {generating && !isRecordingFlow ? 'Gerando...' : 'Imagem'}
                    </button>
                    
                    <button
                        onClick={handleRecordVideo}
                        disabled={generating}
                        className="bg-pink-600 hover:bg-pink-700 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50"
                    >
                        {isRecordingFlow ? <Loader2 className="w-5 h-5 animate-spin" /> : <Video className="w-5 h-5" />}
                        {isRecordingFlow ? `${progress}%` : 'Vídeo MP4'}
                    </button>
                </div>

                <button 
                    onClick={onClose}
                    disabled={generating}
                    className="mt-4 text-slate-400 hover:text-white transition uppercase text-sm font-bold tracking-widest disabled:opacity-50"
                >
                    Cancelar
                </button>
            </div>
            
        </div>
    );
};
