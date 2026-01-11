import React from 'react';

const About: React.FC = () => {
    return (
        <section id="hakkimizda" className="py-24 bg-neutral-900">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row items-center gap-16">
                    <div className="md:w-1/2 relative group flex items-center justify-center">
                        <div className="absolute -inset-4 bg-red-600/20 rounded-xl blur-lg group-hover:bg-red-600/30 transition-all duration-500"></div>
                        <img
                            src="/topluluklogo.svg"
                            alt="İYTE Oyuncuları Logo"
                            className="relative rounded-xl w-full max-w-md object-contain p-8"
                        />
                    </div>
                    <div className="md:w-1/2">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">Biz Kimiz?</h2>
                        <div className="w-20 h-1 bg-red-600 mb-8"></div>
                        <p className="text-gray-300 text-lg leading-relaxed mb-6">
                            İYTE Oyuncuları, teknolojinin ve bilimin merkezinde, sanatın ışığını yakan bir topluluktur.
                            Mühendislik ve mimarlık öğrencilerinden oluşan ekibimizle, disiplinler arası bir bakış açısını
                            sahne tozuna karıştırıyoruz.
                        </p>
                        <p className="text-gray-300 text-lg leading-relaxed mb-8">
                            Her yıl düzenlediğimiz atölyeler, doğaçlama çalışmaları ve büyük prodüksiyon oyunlarla
                            Gülbahçe Kampüsü'nün kültürel hayatına yön veriyoruz. Amacımız sadece oyun çıkarmak değil,
                            bir aile olmak.
                        </p>

                        <div className="grid grid-cols-3 gap-6 text-center border-t border-gray-800 pt-8">
                            <div>
                                <div className="text-3xl font-bold text-red-500">10+</div>
                                <div className="text-sm text-gray-400 mt-1">Yıllık Tecrübe</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-red-500">25+</div>
                                <div className="text-sm text-gray-400 mt-1">Sahnelenen Oyun</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-red-500">100+</div>
                                <div className="text-sm text-gray-400 mt-1">Aktif Üye</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
