import React, { useState } from 'react';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const JoinCommunity: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        studentId: '',
        phone: '',
        email: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            full_name: formData.fullName,
            student_id: formData.studentId,
            phone: formData.phone,
            email: formData.email
        };

        const { error } = await supabase.from('members').insert([payload]);

        if (error) {
            alert('Hata oluştu: ' + error.message);
        } else {
            alert('Aramıza hoş geldin! Başvurunu aldık.');
            setFormData({ fullName: '', studentId: '', phone: '', email: '' });
        }
        setLoading(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen bg-neutral-900 text-gray-100 py-12 px-6">
            <div className="max-w-xl mx-auto">
                <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-red-500 mb-8 transition-colors">
                    <ArrowLeft size={20} /> Ana Sayfaya Dön
                </Link>

                <div className="bg-neutral-950 rounded-2xl p-8 md:p-12 border border-neutral-800 shadow-2xl">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center text-red-600 mx-auto mb-4">
                            <UserPlus size={32} />
                        </div>
                        <h1 className="text-3xl font-bold mb-2">Topluluğa Katıl</h1>
                        <p className="text-gray-400">
                            Sahne tozunu yutmaya hazır mısın? İYTE Oyuncuları ailesinin bir parçası ol.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">İsim Soyisim</label>
                            <input required name="fullName" value={formData.fullName} type="text" onChange={handleChange} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none transition-colors" placeholder="Adınız Soyadınız" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Öğrenci Numarası</label>
                            <input required name="studentId" value={formData.studentId} type="text" onChange={handleChange} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none transition-colors" placeholder="XXXXXXXXX" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Telefon Numarası</label>
                            <input required name="phone" value={formData.phone} type="tel" onChange={handleChange} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none transition-colors" placeholder="05XX XXX XX XX" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">E-Posta Adresi (Okul)</label>
                            <input required name="email" value={formData.email} type="email" onChange={handleChange} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none transition-colors" placeholder="adsoyad@std.iyte.edu.tr" />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-red-700 hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg transition-all mt-4 group"
                        >
                            {loading ? 'Gönderiliyor...' : 'Başvuruyu Tamamla'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default JoinCommunity;
