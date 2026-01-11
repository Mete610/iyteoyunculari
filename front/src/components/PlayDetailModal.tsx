import React, { useEffect } from 'react';
import { X, Calendar, Video, Youtube } from 'lucide-react';
import type { Play } from '../types';

interface PlayDetailModalProps {
    play: Play | null;
    onClose: () => void;
}

const PlayDetailModal: React.FC<PlayDetailModalProps> = ({ play, onClose }) => {
    // Modal açıldığında arkadaki scroll'u kilitle
    useEffect(() => {
        if (play) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        }
    }, [play]);

    if (!play) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/90 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Content Container */}
            <div className="relative bg-neutral-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-red-900/30 animate-in fade-in zoom-in duration-300">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                >
                    <X size={24} />
                </button>

                {/* Header Image */}
                <div className="relative h-64 md:h-80 w-full">
                    <img
                        src={play.image_url}
                        alt={play.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-8">
                        <span className="bg-red-700 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3 inline-block">
                            {play.status}
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">{play.title}</h2>
                        <div className="flex items-center text-gray-300 gap-2">
                            <Calendar size={18} />
                            <span>{play.play_date}</span>
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-10">
                    {/* Description */}
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4 border-l-4 border-red-600 pl-4">Oyun Hakkında</h3>
                        <p className="text-gray-300 leading-relaxed text-lg">
                            {play.long_description}
                        </p>
                    </div>

                    {/* Director - Moved here, simplified */}
                    <div className="flex items-center gap-2 text-gray-300 bg-neutral-950 p-4 rounded-lg border border-neutral-800">
                        <span className="text-red-500 font-bold">Yönetmen:</span>
                        <span className="text-white font-medium">{play.director}</span>
                    </div>

                    {/* YouTube Embed */}
                    <div>
                        <div className="flex items-center gap-2 mb-6 text-red-500">
                            <Video size={24} />
                            <h3 className="text-xl font-bold text-white">Sahne Kaydı</h3>
                        </div>
                        {play.youtube_id && (
                            <>
                                <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-lg border border-neutral-800">
                                    <iframe
                                        className="absolute top-0 left-0 w-full h-full"
                                        src={`https://www.youtube.com/embed/${play.youtube_id}`}
                                        title={`${play.title} Video`}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                                <div className="mt-4 text-center">
                                    <a
                                        href={`https://www.youtube.com/watch?v=${play.youtube_id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors text-sm"
                                    >
                                        <Youtube size={16} /> YouTube'da İzle
                                    </a>
                                </div>
                            </>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default PlayDetailModal;
