import React, { useEffect, useState } from 'react';
import { Ticket } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import background from '../assets/iyteoyuncularıwebarkaplan.jpg';

const Hero: React.FC = () => {
    const [isFestivalActive, setIsFestivalActive] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            const { data } = await supabase
                .from('settings')
                .select('value')
                .eq('key', 'festival_active')
                .single();

            if (data) {
                setIsFestivalActive(data.value);
            }
        };
        fetchSettings();

        // Gerçek zamanlı dinleme (Opsiyonel ama hoş olur)
        const subscription = supabase
            .channel('public:settings')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'settings', filter: 'key=eq.festival_active' }, (payload) => {
                setIsFestivalActive(payload.new.value);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    return (
        <section id="anasayfa" className="relative h-screen flex items-center justify-center overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src={background}
                    alt="Theater Stage"
                    className="w-full h-full object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/60 via-neutral-900/80 to-neutral-900"></div>
            </div>

            <div className="relative z-10 container mx-auto px-6 text-center">
                <span className="text-red-500 font-medium tracking-[0.2em] uppercase mb-4 block animate-pulse">HOŞ GELDİNİZ</span>
                <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
                    TİYATRODUR, <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800">İYİDİR</span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto font-light">
                    İzmir Yüksek Teknoloji Enstitüsü - Tiyatro Topluluğu
                </p>
                <div className="flex flex-col md:flex-row gap-4 justify-center">
                    <a href="#oyunlar" className="border border-gray-500 hover:border-white text-gray-300 hover:text-white px-8 py-4 rounded-full font-medium transition-colors">
                        Oyunları İncele
                    </a>

                    {/* Festival Butonu - Sadece aktifse göster */}
                    {isFestivalActive && (
                        <Link to="/basvuru" className="bg-red-700 hover:bg-red-800 text-white px-8 py-4 rounded-full font-medium transition-colors flex items-center justify-center gap-2 group animate-in fade-in zoom-in duration-300">
                            <Ticket size={20} className="group-hover:rotate-12 transition-transform" /> Festival Başvuru
                        </Link>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Hero;
