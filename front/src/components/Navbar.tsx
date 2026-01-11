import React, { useState, useEffect } from 'react';
import { Menu, X, Lock, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import ScrollLink from './ScrollLink';
import toplulukLogo from '../assets/topluluklogo.svg';
import { supabase } from '../supabaseClient';

const Navbar: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isJoinActive, setIsJoinActive] = useState(true);

    useEffect(() => {
        // Scroll Listener
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);

        // Settings Fetcher
        const fetchSettings = async () => {
            const { data } = await supabase
                .from('settings')
                .select('value')
                .eq('key', 'join_active')
                .single();
            if (data) setIsJoinActive(data.value);
        };
        fetchSettings();

        // Realtime Subscription
        const subscription = supabase
            .channel('public:settings:navbar')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'settings', filter: 'key=eq.join_active' }, (payload) => {
                setIsJoinActive(payload.new.value);
            })
            .subscribe();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            supabase.removeChannel(subscription);
        };
    }, []);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <>
            <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-neutral-950/90 backdrop-blur-md py-4 border-b border-red-900/30' : 'bg-transparent py-6'}`}>
                <div className="container mx-auto px-6 flex justify-between items-center">

                    {/* Logo */}
                    <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div className="relative w-12 h-12 flex items-center justify-center">
                            <img
                                src={toplulukLogo}
                                alt="İYTE Oyuncuları Logo"
                                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
                            />
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className="text-xl font-black tracking-[0.15em] text-white group-hover:text-red-500 transition-colors">İYTE</span>
                            <span className="text-sm font-medium tracking-[0.3em] text-red-600 group-hover:text-white transition-colors">OYUNCULARI</span>
                        </div>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex gap-8 items-center">
                        <ScrollLink href="#anasayfa">ANA SAYFA</ScrollLink>
                        <ScrollLink href="#hakkimizda">HAKKIMIZDA</ScrollLink>
                        <ScrollLink href="#oyunlar">OYUNLAR</ScrollLink>
                        <ScrollLink href="#iletisim">İLETİŞİM</ScrollLink>

                        {/* Join Button - Conditional */}
                        {isJoinActive && (
                            <Link to="/katil" className="flex items-center gap-2 text-sm font-medium text-red-500 hover:text-white transition-colors uppercase tracking-wider animate-in fade-in zoom-in duration-300">
                                <UserPlus size={16} /> Katıl
                            </Link>
                        )}

                        {/* Admin Login Button */}
                        <Link
                            to="/login"
                            className="text-gray-400 hover:text-white hover:bg-red-900/50 border border-transparent hover:border-red-900/50 p-2.5 rounded-full transition-all duration-300 group relative"
                            title="Yönetici Girişi"
                        >
                            <Lock size={18} className="group-hover:scale-110 transition-transform" />
                            <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 text-xs text-white bg-black/80 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                Yönetici
                            </span>
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-4">
                        {isJoinActive && (
                            <Link to="/katil" className="text-red-500 hover:text-white p-2 animate-in fade-in" title="Topluluğa Katıl">
                                <UserPlus size={22} />
                            </Link>
                        )}
                        <Link to="/login" className="text-gray-400 hover:text-red-500 p-2">
                            <Lock size={22} />
                        </Link>
                        <button onClick={toggleMenu} className="text-gray-100 hover:text-red-500">
                            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="fixed inset-0 bg-neutral-950 z-40 flex flex-col items-center justify-center space-y-8 md:hidden">
                    <ScrollLink href="#anasayfa" mobile onClick={() => setIsMenuOpen(false)}>Ana Sayfa</ScrollLink>
                    <ScrollLink href="#hakkimizda" mobile onClick={() => setIsMenuOpen(false)}>Hakkımızda</ScrollLink>
                    <ScrollLink href="#oyunlar" mobile onClick={() => setIsMenuOpen(false)}>Oyunlar</ScrollLink>
                    <ScrollLink href="#iletisim" mobile onClick={() => setIsMenuOpen(false)}>İletişim</ScrollLink>
                </div>
            )}
        </>
    );
};

export default Navbar;
