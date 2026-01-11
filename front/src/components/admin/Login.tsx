import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
            setLoading(false);
        } else {
            // Başarılı giriş
            navigate('/admin');
        }
    };

    return (
        <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4 relative">
            <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors group">
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Ana Sayfaya Dön</span>
            </Link>

            <div className="bg-neutral-950 p-8 rounded-2xl border border-neutral-800 shadow-2xl w-full max-w-md">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center text-red-600 mb-4">
                        <Lock size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Yönetici Girişi</h1>
                    <p className="text-gray-400 text-sm mt-2">Sadece tiyatro yönetimi içindir.</p>
                </div>

                {error && (
                    <div className="bg-red-900/20 border border-red-900/50 text-red-200 text-sm p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">E-Posta</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Şifre</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none transition-colors"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-700 hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors"
                    >
                        {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
