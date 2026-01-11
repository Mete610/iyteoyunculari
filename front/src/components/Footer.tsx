import React from 'react';
import { Instagram, Youtube } from 'lucide-react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-neutral-950 py-12 border-t border-neutral-900 text-center md:text-left">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h3 className="text-2xl font-bold tracking-tight mb-2">İYTE<span className="text-red-600">OYUNCULARI</span></h3>
                        <p className="text-gray-500 text-sm">© 2024 İYTE Tiyatro Topluluğu. Tüm hakları saklıdır.</p>
                    </div>

                    <div className="flex gap-6">
                        <a href="https://www.instagram.com/iyteoyunculari/" className="text-gray-400 hover:text-red-500 transition-colors"><Instagram size={24} /></a>

                        <a href="https://www.youtube.com/@iyteoyuncular%C4%B1" className="text-gray-400 hover:text-red-500 transition-colors"><Youtube size={24} /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
