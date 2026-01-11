import React, { useState } from 'react';
import { MapPin, Mail, Ticket, Send, CheckCircle, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const Contact: React.FC = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [statusMessage, setStatusMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus('idle');

        try {
            const response = await fetch(`${API_URL}/api/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                setStatusMessage(data.message || 'Mesajınız gönderildi!');
                setFormData({ name: '', email: '', message: '' });
            } else {
                setStatus('error');
                setStatusMessage(data.error || 'Bir hata oluştu.');
            }
        } catch (err) {
            setStatus('error');
            setStatusMessage('Sunucuya bağlanılamadı.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id="iletisim" className="py-24 bg-neutral-900">
            <div className="container mx-auto px-6">
                <div className="max-w-4xl mx-auto bg-neutral-950 rounded-2xl p-8 md:p-12 border border-neutral-800 shadow-2xl">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold mb-4">İletişime Geç</h2>
                        <p className="text-gray-400">Oyunlarımız veya işleyişimiz hakkında bilgi almak için.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="space-y-8">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-neutral-900 rounded-lg flex items-center justify-center text-red-500 shrink-0">
                                    <MapPin />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-1">Adres</h3>
                                    <p className="text-gray-400 text-sm">
                                        İzmir Yüksek Teknoloji Enstitüsü<br />
                                        Gülbahçe Kampüsü, Erdal Saygın Amfisi<br />
                                        Urla, İzmir
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-neutral-900 rounded-lg flex items-center justify-center text-red-500 shrink-0">
                                    <Mail />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-1">E-Posta</h3>
                                    <p className="text-gray-400 text-sm">iytetiyatrotoplulugu@gmail.com</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-neutral-900 rounded-lg flex items-center justify-center text-red-500 shrink-0">
                                    <Ticket />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-1">Sorularınız İçin</h3>
                                    <p className="text-gray-400 text-sm">Merak ettiğiniz sorular için sosyal medyalarımzıdan ya da buradan bizimle iletişime geçebilirsiniz.</p>
                                </div>
                            </div>
                        </div>

                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Adınız Soyadınız"
                                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-4 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 transition-all text-white"
                                />
                            </div>
                            <div>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="E-posta Adresiniz"
                                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-4 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 transition-all text-white"
                                />
                            </div>
                            <div>
                                <textarea
                                    rows={4}
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    placeholder="Mesajınız..."
                                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-4 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 transition-all text-white"
                                />
                            </div>

                            {status === 'success' && (
                                <div className="flex items-center gap-2 text-green-500 p-3 bg-green-500/10 rounded-lg">
                                    <CheckCircle size={20} />
                                    <span>{statusMessage}</span>
                                </div>
                            )}

                            {status === 'error' && (
                                <div className="flex items-center gap-2 text-red-500 p-3 bg-red-500/10 rounded-lg">
                                    <AlertCircle size={20} />
                                    <span>{statusMessage}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-red-700 hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    'Gönderiliyor...'
                                ) : (
                                    <>
                                        <Send size={18} />
                                        Gönder
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;

