import { useState, useEffect } from 'react';
import { useLeague } from '../context/LeagueContext';
import { ExternalLink, Play, X } from 'lucide-react';

interface AdBannerProps {
    position: 'top' | 'side' | 'between' | 'halftime' | 'overlay' | 'home_stats' | 'teams_list' | 'matches_filter' | 'live_top' | 'standings_info' | 'panel_stats';
    className?: string;
    onClose?: () => void;
}

const AdBanner = ({ position, className = '', onClose }: AdBannerProps) => {
    const { ads } = useLeague();
    const positionAds = ads.filter(ad => ad.active && ad.positions?.includes(position));
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (positionAds.length <= 1) return;

        const currentAd = positionAds[currentIndex];
        const timer = setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % positionAds.length);
        }, (currentAd.duration || 5) * 1000);

        return () => clearTimeout(timer);
    }, [currentIndex, positionAds]);

    if (positionAds.length === 0) return null;

    const ad = positionAds[currentIndex];

    const renderMedia = () => {
        if (ad.media_type === 'video') {
            return (
                <div className="relative w-full h-full">
                    <video
                        src={ad.media_url}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover"
                        style={{ objectPosition: ad.object_position || 'center' }}
                    />
                    <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded text-[0.6rem] font-bold text-white uppercase tracking-widest flex items-center gap-1">
                        <Play size={10} fill="currentColor" /> Vídeo
                    </div>
                </div>
            );
        }

        return (
            <img
                src={ad.media_url}
                alt={ad.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2000ms]"
                style={{ objectPosition: ad.object_position || 'center' }}
            />
        );
    };

    const containerClasses = {
        top: "w-full h-24 sm:h-32 mb-8",
        side: "w-full aspect-[4/5] sm:aspect-square mb-6",
        between: "w-full h-32 sm:h-44 my-10",
        halftime: "w-full aspect-video max-w-3xl mx-auto my-10",
        overlay: "fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-6",
        home_stats: "w-full h-32 sm:h-40 mb-8",
        teams_list: "w-full h-32 sm:h-40 mb-8",
        matches_filter: "w-full h-32 sm:h-40 mb-8",
        live_top: "w-full h-32 sm:h-40 mb-8",
        standings_info: "w-full h-32 sm:h-40 mb-8",
        panel_stats: "w-full h-32 sm:h-40 mb-8"
    };

    const Content = (
        <div className={`relative group overflow-hidden rounded-2xl border border-white/10 shadow-2xl transition-all w-full h-full ${className} ${position === 'overlay' ? 'max-w-lg aspect-square sm:aspect-video' : ''}`}>
            {ad.link_url ? (
                <a href={ad.link_url} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                    {renderMedia()}
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between translate-y-full group-hover:translate-y-0 transition-transform">
                        <span className="text-[0.6rem] font-black text-white uppercase tracking-widest truncate mr-2">{ad.title}</span>
                        <ExternalLink size={12} className="text-white flex-none" />
                    </div>
                </a>
            ) : (
                <div className="w-full h-full">
                    {renderMedia()}
                    <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded text-[0.5rem] font-black text-white/50 uppercase tracking-widest">
                        Publicidade
                    </div>
                </div>
            )}

            {onClose && (
                <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-white hover:text-black transition-colors z-10"
                >
                    <X size={14} />
                </button>
            )}
        </div>
    );

    if (position === 'overlay') {
        return (
            <div className={containerClasses.overlay}>
                {Content}
            </div>
        );
    }

    return (
        <div className={containerClasses[position]}>
            {Content}
        </div>
    );
};

export default AdBanner;
