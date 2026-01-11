import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Send, Upload, User, Phone, Mail, FileText, Calendar, Clock, Monitor, Users, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

interface FormData {
    university: string;
    groupName: string;
    contactPerson: string;
    email: string;
    phone: string;
    unavailableDays: string[];
    playName: string;
    playType: string;
    writer: string;
    duration: string;
    acts: string;
    ageLimit: string;
    synopsis: string;
    preparationTime: string;
    technicalRequirements: string;
    technicalCrew: string;
    cast: string;
    totalParticipants: string;
    stagePreference: string;
    additionalNotes: string;
    poster: File | null;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Standalone components to prevent re-renders on typing
const InputLabel = ({ children, icon: Icon }: { children: React.ReactNode, icon?: any }) => (
    <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">
        {Icon && <Icon size={16} className="text-red-500" />}
        {children}
    </label>
);

interface TextInputProps {
    name: string;
    placeholder?: string;
    type?: string;
    required?: boolean;
    value: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const TextInput = ({ name, placeholder, type = "text", required = false, value, onChange }: TextInputProps) => (
    <input
        type={type}
        name={name}
        value={value}
        required={required}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-neutral-900/50 border border-neutral-800 rounded-lg p-3 text-white placeholder-gray-600 focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none transition-all duration-300 hover:border-neutral-700"
    />
);

interface TextAreaProps {
    name: string;
    placeholder?: string;
    rows?: number;
    required?: boolean;
    value: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const TextArea = ({ name, placeholder, rows = 3, required = false, value, onChange }: TextAreaProps) => (
    <textarea
        name={name}
        value={value}
        required={required}
        rows={rows}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-neutral-900/50 border border-neutral-800 rounded-lg p-3 text-white placeholder-gray-600 focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none transition-all duration-300 hover:border-neutral-700 resize-none"
    />
);

const FestivalApplication: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [submitMessage, setSubmitMessage] = useState('');
    const [config, setConfig] = useState({
        active: true,
        dateRange: '6-10 Nisan 2025',
        unavailableOptions: ['6 Nisan', '7 Nisan', '8 Nisan', '9 Nisan', '10 Nisan'],
        heroImage: '', // Will use CSS fallback or default if empty
        stagePlanImage: 'https://lh7-rt.googleusercontent.com/formsz/AN7BsVCyQImIuzV14qk69yL-YO_q9MvnXndZxCOas1r_LAPxUND5ldqFOf4JERo8l33E0NsZkqB8xU9mN1KkFKhfKcG95sDG1Brm-9H3ZmXkdxpxnzBrV0d_sxO6sBRFeouaCf__ybrpWGrOUzV22Iv3T9Wus7D-6tJrC7gvghlMRg-x43jmFCw-va4VFt8z9W3BhRKC_3uRxR16N1nE=w740?key=QdR8Hegmu-INhepQJayKfw'
    });

    const [formData, setFormData] = useState<FormData>({
        university: '',
        groupName: '',
        contactPerson: '',
        email: '',
        phone: '',
        unavailableDays: [],
        playName: '',
        playType: '',
        writer: '',
        duration: '',
        acts: '',
        ageLimit: '',
        synopsis: '',
        preparationTime: '',
        technicalRequirements: '',
        technicalCrew: '',
        cast: '',
        totalParticipants: '',
        stagePreference: '',
        additionalNotes: '',
        poster: null,
    });

    useEffect(() => {
        const fetchSettings = async () => {
            const { data } = await supabase.from('settings').select('*');
            if (data) {
                const settingsMap: any = {};
                data.forEach(item => settingsMap[item.key] = item.value);

                setConfig({
                    active: settingsMap['festival_active'] !== false && settingsMap['festival_active'] !== 'false', // Default true
                    dateRange: settingsMap['festival_date_range'] || '6-10 Nisan 2025',
                    unavailableOptions: settingsMap['festival_unavailable_options']
                        ? settingsMap['festival_unavailable_options'].split(',').map((s: string) => s.trim())
                        : ['6 Nisan', '7 Nisan', '8 Nisan', '9 Nisan', '10 Nisan'],
                    heroImage: settingsMap['festival_hero_image'] || '',
                    stagePlanImage: settingsMap['festival_stage_plan_image'] || 'https://lh7-rt.googleusercontent.com/formsz/AN7BsVCyQImIuzV14qk69yL-YO_q9MvnXndZxCOas1r_LAPxUND5ldqFOf4JERo8l33E0NsZkqB8xU9mN1KkFKhfKcG95sDG1Brm-9H3ZmXkdxpxnzBrV0d_sxO6sBRFeouaCf__ybrpWGrOUzV22Iv3T9Wus7D-6tJrC7gvghlMRg-x43jmFCw-va4VFt8z9W3BhRKC_3uRxR16N1nE=w740?key=QdR8Hegmu-INhepQJayKfw'
                });
            }
            setLoading(false);
        };
        fetchSettings();
    }, []);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleCheckboxChange = (date: string) => {
        setFormData(prev => {
            const currentDays = prev.unavailableDays;
            if (currentDays.includes(date)) {
                return { ...prev, unavailableDays: currentDays.filter(d => d !== date) };
            } else {
                return { ...prev, unavailableDays: [...currentDays, date] };
            }
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData(prev => ({ ...prev, poster: e.target.files![0] }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmitStatus('idle');

        try {
            // FormData ile dosya ve verileri gönder
            const { poster, ...dataWithoutPoster } = formData;

            const formDataToSend = new FormData();
            formDataToSend.append('formData', JSON.stringify(dataWithoutPoster));

            // Poster dosyasını ekle
            if (poster) {
                formDataToSend.append('poster', poster);
            }

            const response = await fetch(`${API_URL}/api/festival-application`, {
                method: 'POST',
                body: formDataToSend  // FormData kullanıldığında Content-Type otomatik ayarlanır
            });

            const result = await response.json();

            if (response.ok) {
                setSubmitStatus('success');
                setSubmitMessage(result.message || 'Başvurunuz başarıyla alındı!');
            } else {
                setSubmitStatus('error');
                setSubmitMessage(result.error || 'Bir hata oluştu.');
            }
        } catch (err) {
            setSubmitStatus('error');
            setSubmitMessage('Sunucuya bağlanılamadı. Lütfen tekrar deneyin.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">Yükleniyor...</div>;

    if (!config.active) {
        return (
            <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-white p-6 text-center">
                <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-red-500 mb-8 transition-colors absolute top-8 left-8">
                    <ArrowLeft size={20} /> Ana Sayfa
                </Link>
                <div className="bg-neutral-900 p-8 rounded-2xl border border-neutral-800 max-w-lg w-full">
                    <AlertCircle size={64} className="text-red-600 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold mb-4">Başvurular Kapalı</h2>
                    <p className="text-gray-400">
                        Bu sene için festival başvuruları henüz başlamadı veya sona erdi. <br />
                        İlginiz için teşekkür ederiz.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-gray-100 font-sans selection:bg-red-500/30">
            {/* Hero Header */}
            <div className="relative py-20 px-6 overflow-hidden">
                {config.heroImage && (
                    <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 bg-neutral-950/80 z-10" />
                        <img src={config.heroImage} className="w-full h-full object-cover opacity-50 block" alt="Festival Hero" />
                    </div>
                )}
                {!config.heroImage && <div className="absolute inset-0 bg-red-900/10 blur-[100px] pointer-events-none" />}

                <div className="max-w-5xl mx-auto relative z-20">
                    <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-red-500 mb-8 transition-colors group">
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Ana Sayfaya Dön
                    </Link>
                    <div className="text-center space-y-4">
                        <span className="inline-block px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-bold tracking-[0.2em] uppercase border border-red-500/20">
                            {config.dateRange}
                        </span>
                        <h1 className="text-4xl md:text-7xl font-black tracking-tight text-white mb-4 leading-tight">
                            İYTE <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800">Tiyatro Haftası</span>
                            <br />Başvuru Formu
                        </h1>
                        <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
                            İzmir Yüksek Teknoloji Enstitüsü Tiyatro Topluluğu sahnesine davetlisiniz.
                            Sanatınızı sergilemek, heyecanınıza ortak olmak istiyoruz.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 pb-24 relative z-20">
                <form onSubmit={handleSubmit} className="space-y-12">

                    {/* Section 1: Genel Bilgiler */}
                    <div className="bg-neutral-900/40 p-8 rounded-2xl border border-neutral-800 backdrop-blur-sm hover:border-neutral-700 transition-all duration-300">
                        <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-sm">1</span>
                            Genel Bilgiler
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <InputLabel icon={User}>Üniversite Adı</InputLabel>
                                <TextInput onChange={handleChange} name="university" value={formData.university} required />
                            </div>
                            <div className="space-y-2">
                                <InputLabel icon={Users}>Topluluk Adı</InputLabel>
                                <TextInput onChange={handleChange} name="groupName" value={formData.groupName} required />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: İletişim */}
                    <div className="bg-neutral-900/40 p-8 rounded-2xl border border-neutral-800 backdrop-blur-sm hover:border-neutral-700 transition-all duration-300">
                        <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-sm">2</span>
                            İletişim Bilgileri
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <InputLabel icon={User}>Sorumlu Kişi Adı Soyadı</InputLabel>
                                <TextInput onChange={handleChange} name="contactPerson" value={formData.contactPerson} required />
                            </div>
                            <div>
                                <InputLabel icon={Mail}>İrtibat Maili</InputLabel>
                                <TextInput onChange={handleChange} name="email" type="email" value={formData.email} required />
                            </div>
                            <div>
                                <InputLabel icon={Phone}>İrtibat Numarası</InputLabel>
                                <TextInput onChange={handleChange} name="phone" type="tel" value={formData.phone} />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Oyun Bilgileri */}
                    <div className="bg-neutral-900/40 p-8 rounded-2xl border border-neutral-800 backdrop-blur-sm hover:border-neutral-700 transition-all duration-300">
                        <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-sm">3</span>
                            Oyun Detayları
                        </h3>

                        <div className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <InputLabel icon={FileText}>Oyun Adı</InputLabel>
                                    <TextInput onChange={handleChange} name="playName" value={formData.playName} required />
                                </div>
                                <div>
                                    <InputLabel icon={User}>Yazar Adı</InputLabel>
                                    <TextInput onChange={handleChange} name="writer" value={formData.writer} required />
                                </div>
                                <div>
                                    <InputLabel>Oyun Türü</InputLabel>
                                    <TextInput onChange={handleChange} name="playType" value={formData.playType} />
                                </div>
                                <div>
                                    <InputLabel icon={Clock}>Oyun Süresi (Dk)</InputLabel>
                                    <TextInput onChange={handleChange} name="duration" type="text" value={formData.duration} required placeholder="Örn: 90 Dakika" />
                                </div>
                                <div>
                                    <InputLabel>Perde Sayısı</InputLabel>
                                    <TextInput onChange={handleChange} name="acts" value={formData.acts} required />
                                </div>
                                <div>
                                    <InputLabel>Yaş Sınırı</InputLabel>
                                    <TextInput onChange={handleChange} name="ageLimit" value={formData.ageLimit} placeholder="Örn: +13, Genel İzleyici" />
                                </div>
                            </div>

                            <div>
                                <InputLabel icon={FileText}>Oyun Konusu Hakkında Topluluk Yorumu</InputLabel>
                                <TextArea onChange={handleChange} name="synopsis" value={formData.synopsis} required rows={5} placeholder="Oyunun konusu ve topluluğunuzun yorumu..." />
                            </div>

                            <div>
                                <InputLabel icon={Upload}>Oyun Afişi (Maks 100MB)</InputLabel>
                                <div className="border-2 border-dashed border-neutral-800 rounded-lg p-6 hover:border-red-500/50 transition-colors text-center cursor-pointer bg-neutral-900/30">
                                    <input type="file" onChange={handleFileChange} className="hidden" id="poster-upload" accept="image/*,application/pdf" />
                                    <label htmlFor="poster-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                        <Upload className="text-gray-400" size={32} />
                                        <span className="text-sm text-gray-400">Dosya seçmek için tıklayın</span>
                                        {formData.poster && <span className="text-red-500 font-semibold">{formData.poster.name}</span>}
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Teknik ve Ekip */}
                    <div className="bg-neutral-900/40 p-8 rounded-2xl border border-neutral-800 backdrop-blur-sm hover:border-neutral-700 transition-all duration-300">
                        <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-sm">4</span>
                            Teknik ve Ekip Bilgileri
                        </h3>

                        <div className="space-y-6">
                            <div>
                                <InputLabel icon={Clock}>Temsil Öncesi Hazırlık Süresi</InputLabel>
                                <TextInput onChange={handleChange} name="preparationTime" value={formData.preparationTime} placeholder="Örn: 2 saat dekor kurulumu" required />
                            </div>

                            <div>
                                <InputLabel icon={Monitor}>Teknik Ekip (Ses/Işık/Sahne Arkası/Yönetmen)</InputLabel>
                                <TextArea onChange={handleChange} name="technicalCrew" value={formData.technicalCrew} required placeholder="Görevli kişilerin Adı Soyadı ve Görevleri" />
                            </div>

                            <div>
                                <InputLabel icon={Users}>Oyuncular</InputLabel>
                                <TextArea onChange={handleChange} name="cast" value={formData.cast} required placeholder="Oyuncuların Adı Soyadı" />
                            </div>

                            <div>
                                <InputLabel>Sağlayamayacağınız Teknik Gereklilikler</InputLabel>
                                <TextArea onChange={handleChange} name="technicalRequirements" value={formData.technicalRequirements} required placeholder="Topluluğun sağlayamayacağı teknik ihtiyaçlar..." />
                            </div>

                            <div>
                                <InputLabel icon={Users}>Toplam Katılımcı Sayısı</InputLabel>
                                <TextInput onChange={handleChange} name="totalParticipants" type="number" value={formData.totalParticipants} required />
                            </div>
                        </div>
                    </div>

                    {/* Section 5: Planlama ve Tercihler */}
                    <div className="bg-neutral-900/40 p-8 rounded-2xl border border-neutral-800 backdrop-blur-sm hover:border-neutral-700 transition-all duration-300">
                        <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-sm">5</span>
                            Planlama ve Tercihler
                        </h3>

                        <div className="space-y-8">
                            <div>
                                <InputLabel icon={Calendar}>Temsil İçin <span className="text-red-500 font-bold">UYGUN OLMAYAN</span> Günler</InputLabel>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3">
                                    {config.unavailableOptions.map((date) => (
                                        <label key={date} className={`
                                            flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all
                                            ${formData.unavailableDays.includes(date)
                                                ? 'bg-red-500/20 border-red-500 text-red-500 font-bold'
                                                : 'bg-neutral-900 border-neutral-800 text-gray-400 hover:border-neutral-600'}
                                        `}>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={formData.unavailableDays.includes(date)}
                                                onChange={() => handleCheckboxChange(date)}
                                            />
                                            {date}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <InputLabel>Sahne Tercihi</InputLabel>
                                <div className="mb-4 rounded-lg overflow-hidden border border-neutral-800">
                                    <img
                                        src={config.stagePlanImage}
                                        alt="Sahne Planları"
                                        className="w-full object-cover opacity-80 hover:opacity-100 transition-opacity"
                                    />
                                    <p className="p-2 text-xs text-center text-gray-500 bg-neutral-900">Sahne planlarını inceleyerek tercihinizi yapınız.</p>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <label className={`
                                            flex items-center p-4 rounded-lg border cursor-pointer transition-all gap-3
                                            ${formData.stagePreference === 'Sahne 1'
                                            ? 'bg-red-500/10 border-red-500 text-white'
                                            : 'bg-neutral-900 border-neutral-800 text-gray-400 hover:border-neutral-600'}
                                        `}>
                                        <input type="radio" name="stagePreference" value="Sahne 1" onChange={handleChange} className="hidden" />
                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.stagePreference === 'Sahne 1' ? 'border-red-500' : 'border-gray-600'}`}>
                                            {formData.stagePreference === 'Sahne 1' && <div className="w-2 h-2 rounded-full bg-red-500" />}
                                        </div>
                                        Sahne 1
                                    </label>
                                    <label className={`
                                            flex items-center p-4 rounded-lg border cursor-pointer transition-all gap-3
                                            ${formData.stagePreference === 'Sahne 2'
                                            ? 'bg-red-500/10 border-red-500 text-white'
                                            : 'bg-neutral-900 border-neutral-800 text-gray-400 hover:border-neutral-600'}
                                        `}>
                                        <input type="radio" name="stagePreference" value="Sahne 2" onChange={handleChange} className="hidden" />
                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.stagePreference === 'Sahne 2' ? 'border-red-500' : 'border-gray-600'}`}>
                                            {formData.stagePreference === 'Sahne 2' && <div className="w-2 h-2 rounded-full bg-red-500" />}
                                        </div>
                                        Sahne 2
                                    </label>
                                    <label className={`
                                            flex items-center p-4 rounded-lg border cursor-pointer transition-all gap-3 md:col-span-2
                                            ${formData.stagePreference === 'Her ikisi de uygun'
                                            ? 'bg-red-500/10 border-red-500 text-white'
                                            : 'bg-neutral-900 border-neutral-800 text-gray-400 hover:border-neutral-600'}
                                        `}>
                                        <input type="radio" name="stagePreference" value="Her ikisi de uygun" onChange={handleChange} className="hidden" />
                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.stagePreference === 'Her ikisi de uygun' ? 'border-red-500' : 'border-gray-600'}`}>
                                            {formData.stagePreference === 'Her ikisi de uygun' && <div className="w-2 h-2 rounded-full bg-red-500" />}
                                        </div>
                                        Her ikisi de uygun
                                    </label>
                                </div>
                            </div>

                            <div>
                                <InputLabel>Eklemek İstedikleriniz</InputLabel>
                                <TextArea onChange={handleChange} name="additionalNotes" value={formData.additionalNotes} placeholder="Varsa eklemek istediğiniz notlar..." />
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 space-y-4">
                        {submitStatus === 'success' && (
                            <div className="flex items-center gap-3 text-green-400 p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="font-medium">{submitMessage}</span>
                            </div>
                        )}

                        {submitStatus === 'error' && (
                            <div className="flex items-center gap-3 text-red-400 p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                                <AlertCircle size={24} />
                                <span className="font-medium">{submitMessage}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={submitting || submitStatus === 'success'}
                            className="w-full bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-5 rounded-xl transition-all shadow-lg hover:shadow-red-900/40 hover:-translate-y-1 flex items-center justify-center gap-3 group text-lg"
                        >
                            {submitting ? (
                                <>
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Gönderiliyor...
                                </>
                            ) : submitStatus === 'success' ? (
                                <>
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Başvurunuz Alındı!
                                </>
                            ) : (
                                <>
                                    <Send size={24} className="group-hover:translate-x-1 transition-transform" />
                                    Başvuruyu Tamamla
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FestivalApplication;
