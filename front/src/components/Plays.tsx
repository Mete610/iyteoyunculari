import React, { useState, useEffect } from 'react';
import { Calendar, Youtube, AlertCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';
import PlayDetailModal from './PlayDetailModal';
import type { Play } from '../types';

const Plays: React.FC = () => {
    const [plays, setPlays] = useState<Play[]>([]);
    const [selectedPlay, setSelectedPlay] = useState<Play | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchPlays();
    }, []);

    const fetchPlays = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('plays')
                .select('*')
                .order('id', { ascending: true });

            if (error) throw error;

            if (data) {
                setPlays(data);
            }
        } catch (err: any) {
            setError('Oyun verileri yüklenirken bir hata oluştu.');
            console.error('Error fetching plays:', err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id="oyunlar" className="py-24 bg-neutral-950">
            <PlayDetailModal play={selectedPlay} onClose={() => setSelectedPlay(null)} />

            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold mb-4">Sahnelediklerimiz & Gelecek Oyunlar</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">Emekle hazırladığımız, alkışlarla taçlanan performanslarımız. Detaylar ve kayıtlar için tıklayınız.</p>
                </div>

                {loading ? (
                    <div className="text-center text-gray-500 py-12">Sahne hazırlanıyor...</div>
                ) : error ? (
                    <div className="text-center text-red-500 py-12 flex items-center justify-center gap-2">
                        <AlertCircle /> {error}
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {plays.map((play) => (
                            <div
                                key={play.id}
                                onClick={() => setSelectedPlay(play)}
                                className="group relative overflow-hidden rounded-xl bg-neutral-900 border border-neutral-800 hover:border-red-900/50 transition-all hover:shadow-2xl hover:shadow-red-900/10 cursor-pointer"
                            >
                                <div className="aspect-[3/4] overflow-hidden">
                                    <img
                                        src={play.image_url}
                                        alt={play.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-2 group-hover:translate-y-0 transition-transform">
                                    <span className="inline-block px-3 py-1 bg-red-700 text-xs font-bold rounded-full mb-3 text-white">
                                        {play.status}
                                    </span>
                                    <h3 className="text-2xl font-bold text-white mb-2">{play.title}</h3>
                                    <div className="flex items-center text-gray-300 text-sm mb-4 space-x-4">
                                        <span className="flex items-center gap-1"><Calendar size={14} /> {play.play_date}</span>
                                    </div>
                                    <p className="text-gray-400 text-sm mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 line-clamp-2">
                                        {play.short_description}
                                    </p>
                                    <button className="w-full py-2 bg-white text-black font-bold text-sm rounded hover:bg-gray-200 transition-colors opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2">
                                        <Youtube size={16} className="text-red-600" /> İncele ve İzle
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default Plays;
