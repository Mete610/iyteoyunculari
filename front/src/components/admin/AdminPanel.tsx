import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Settings, PlusCircle, Trash2, Edit2, X, Save, ArrowLeft, ToggleLeft, ToggleRight, Users, Ticket, Image as ImageIcon, Calendar, Download, UploadCloud } from 'lucide-react';
import type { Play } from '../../types';

interface Setting {
    key: string;
    value: any; // Allow string | boolean
}

const AdminPanel: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState<any>(null);
    const [plays, setPlays] = useState<Play[]>([]);

    // Ayarlar State'i
    const [settings, setSettings] = useState<{ [key: string]: any }>({
        festival_active: true,
        join_active: true,
        festival_date_range: '6-10 Nisan 2025',
        festival_unavailable_options: '6 Nisan, 7 Nisan, 8 Nisan, 9 Nisan, 10 Nisan',
        festival_hero_image: '',
        festival_stage_plan_image: ''
    });

    // Modal Durumları
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isFestivalSettingsOpen, setIsFestivalSettingsOpen] = useState(false);
    const [editingPlay, setEditingPlay] = useState<Play | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean, id: number | null }>({ open: false, id: null });

    // Dosya Yükleme State'i
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    // Form Verileri (Oyun Ekleme)
    const initialFormState = {
        title: '',
        play_date: '',
        image_url: '',
        short_description: '',
        long_description: '',
        status: 'Yakında',
        director: '',
        youtube_id: ''
    };
    const [formData, setFormData] = useState(initialFormState);

    // Festival Ayarları Form State (Geçici düzenleme için)
    const [festivalForm, setFestivalForm] = useState({
        festival_date_range: '',
        festival_unavailable_options: '',
        festival_hero_image: '',
        festival_stage_plan_image: ''
    });

    // Verileri Yükle
    const fetchData = async () => {
        setLoading(true);
        // Oyunları Çek
        const { data: playsData } = await supabase.from('plays').select('*').order('id', { ascending: false });
        if (playsData) setPlays(playsData);

        // Ayarları Çek
        const { data: settingsData } = await supabase.from('settings').select('*');
        if (settingsData) {
            const newSettings: { [key: string]: any } = {};
            (settingsData as Setting[]).forEach((s) => {
                newSettings[s.key] = s.value;
            });
            setSettings(prev => ({ ...prev, ...newSettings }));
        }
        setLoading(false);
    };

    // Generic Ayar Güncelleme (Tekli - Toggle için)
    const updateSetting = async (key: string, value: any) => {
        // Optimistic Update
        setSettings(prev => ({ ...prev, [key]: value }));

        // Check if setting exists first to decide insert vs update
        const { data: existing } = await supabase.from('settings').select('*').eq('key', key).single();

        let error;
        if (existing) {
            const res = await supabase.from('settings').update({ value: value }).eq('key', key);
            error = res.error;
        } else {
            const res = await supabase.from('settings').insert([{ key: key, value: value }]);
            error = res.error;
        }

        if (error) {
            console.error('Ayar güncellenemedi:', error);
            fetchData(); // Revert
            alert('Ayar güncellenemedi: ' + error.message);
        }
    };

    // Toplu Festival Ayarlarını Kaydet
    const handleSaveFestivalSettings = async (e: React.FormEvent) => {
        e.preventDefault();

        // Save all keys
        for (const [key, value] of Object.entries(festivalForm)) {
            await updateSetting(key, value);
        }

        setIsFestivalSettingsOpen(false);
        alert('Festival ayarları güncellendi.');
    };

    const openFestivalSettings = () => {
        setFestivalForm({
            festival_date_range: settings.festival_date_range || '',
            festival_unavailable_options: settings.festival_unavailable_options || '',
            festival_hero_image: settings.festival_hero_image || '',
            festival_stage_plan_image: settings.festival_stage_plan_image || ''
        });
        setIsFestivalSettingsOpen(true);
    };

    // Üye Listesini İndir
    const downloadMembersCSV = async () => {
        const { data, error } = await supabase.from('members').select('*');

        if (error) {
            alert('Üye listesi çekilemedi: ' + error.message);
            return;
        }

        if (!data || data.length === 0) {
            alert('İndirilecek üye kaydı bulunamadı.');
            return;
        }

        // CSV Convert with BOM for Excel Turkish character support
        const headers = Object.keys(data[0]);
        const csvRows = [
            headers.join(';'), // Header Row (semicolon for Excel TR)
            ...data.map(row => headers.map(fieldName => {
                let cell = row[fieldName] === null ? '' : String(row[fieldName]);
                // Handle special characters by wrapping in quotes
                if (cell.search(/("|;|\n)/g) >= 0) cell = `"${cell.replace(/"/g, '""')}"`;
                return cell;
            }).join(';'))
        ];

        // Add BOM for UTF-8 Excel support
        const BOM = '\uFEFF';
        const csvContent = BOM + csvRows.join('\r\n');
        const fileName = `uyeler_listesi_${new Date().toISOString().slice(0, 10)}.csv`;

        // Try modern File System Access API (shows save dialog)
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

        try {
            // @ts-ignore - File System Access API
            if (window.showSaveFilePicker) {
                // @ts-ignore
                const handle = await window.showSaveFilePicker({
                    suggestedName: fileName,
                    types: [{
                        description: 'CSV Dosyası',
                        accept: { 'text/csv': ['.csv'] }
                    }]
                });
                const writable = await handle.createWritable();
                await writable.write(blob);
                await writable.close();
                return;
            }
        } catch (err) {
            // User cancelled or API not supported, fall back
            console.log('Save picker cancelled or not supported');
        }

        // Fallback for older browsers
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    // Oturum kontrolü
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (!session) navigate('/login');
            else fetchData();
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (!session) navigate('/login');
        });

        return () => subscription.unsubscribe();
    }, [navigate]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    // Oyun Silme - Onay modalı aç
    const handleDeleteClick = (id: number) => {
        setDeleteConfirm({ open: true, id });
    };

    // Gerçek silme işlemi
    const confirmDelete = async () => {
        if (!deleteConfirm.id) return;
        const { error } = await supabase.from('plays').delete().eq('id', deleteConfirm.id);
        if (!error) {
            fetchData();
        } else {
            alert('Hata: ' + error.message);
        }
        setDeleteConfirm({ open: false, id: null });
    };

    // Dosya Seçimi
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        }
    };

    // Oyun Ekleme/Düzenleme İşlemleri
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploading(true);

        let finalImageUrl = formData.image_url;

        // Dosya yükleme varsa
        if (selectedFile) {
            const fileExt = selectedFile.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            // 'posters' bucket'ına yükle
            const { error: uploadError } = await supabase.storage
                .from('posters')
                .upload(filePath, selectedFile);

            if (uploadError) {
                alert('Kapak görseli yüklenirken hata oluştu: ' + uploadError.message);
                setUploading(false);
                return;
            }

            // URL'i al
            const { data } = supabase.storage.from('posters').getPublicUrl(filePath);
            finalImageUrl = data.publicUrl;
        }

        const payload = {
            ...formData,
            image_url: finalImageUrl
        };

        let resultError = null;
        if (editingPlay) {
            const { error } = await supabase.from('plays').update(payload).eq('id', editingPlay.id);
            resultError = error;
        } else {
            const { error } = await supabase.from('plays').insert([payload]);
            resultError = error;
        }

        setUploading(false);

        if (!resultError) {
            alert(editingPlay ? 'Oyun güncellendi!' : 'Oyun eklendi!');
            closeModal();
            fetchData();
        } else {
            alert('Veritabanı hatası: ' + resultError.message);
        }
    };

    const openEditModal = (play: Play) => {
        setEditingPlay(play);
        setSelectedFile(null); // Reset file
        setFormData({
            title: play.title,
            play_date: play.play_date,
            image_url: play.image_url,
            short_description: play.short_description,
            long_description: play.long_description,
            status: play.status,
            director: play.director,
            youtube_id: play.youtube_id || ''
        });
        setIsAddModalOpen(true);
    };

    const closeModal = () => {
        setIsAddModalOpen(false);
        setEditingPlay(null);
        setSelectedFile(null);
        setFormData(initialFormState);
    };

    if (loading) return <div className="min-h-screen bg-neutral-900 flex items-center justify-center text-white">Yükleniyor...</div>;

    return (
        <div className="min-h-screen bg-neutral-900 text-gray-100 font-sans">
            <nav className="bg-neutral-950 border-b border-red-900/30 py-4 px-6 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link to="/" className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full" title="Siteye Dön">
                        <ArrowLeft size={24} />
                    </Link>
                    <div className="flex items-center gap-2">
                        <Settings className="text-red-600" />
                        <span className="font-bold text-lg text-white">Yönetici Paneli</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-400">{session?.user?.email}</span>
                    <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-gray-300 hover:text-red-500 transition-colors">
                        <LogOut size={16} /> Çıkış
                    </button>
                </div>
            </nav>

            <div className="container mx-auto p-6">

                {/* Yönetim Kartları Grid */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">

                    {/* Festival Başvuru Switch */}
                    <div className="bg-neutral-950 p-6 rounded-xl border border-neutral-800 flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-lg ${settings.festival_active ? 'bg-green-900/20 text-green-500' : 'bg-red-900/20 text-red-500'}`}>
                                <Ticket />
                            </div>
                            <button onClick={() => updateSetting('festival_active', !settings.festival_active)} className={`transition-colors ${settings.festival_active ? 'text-green-500' : 'text-gray-600'}`}>
                                {settings.festival_active ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
                            </button>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Festival Başvuruları</h3>
                            <p className="text-sm text-gray-500 mt-1 mb-4">{settings.festival_active ? 'Şu an AÇIK. Kullanıcılar başvurabilir.' : 'Şu an KAPALI. Buton gizlendi.'}</p>
                            <button onClick={openFestivalSettings} className="text-sm bg-neutral-900 hover:bg-neutral-800 text-white py-2 px-4 rounded w-full border border-neutral-700 transition-colors flex items-center justify-center gap-2">
                                <Settings size={14} /> Ayarları Ve Görselleri Düzenle
                            </button>
                        </div>
                    </div>

                    {/* Katılım Switch */}
                    <div className="bg-neutral-950 p-6 rounded-xl border border-neutral-800 flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-lg ${settings.join_active ? 'bg-green-900/20 text-green-500' : 'bg-red-900/20 text-red-500'}`}>
                                <Users />
                            </div>
                            <button onClick={() => updateSetting('join_active', !settings.join_active)} className={`transition-colors ${settings.join_active ? 'text-green-500' : 'text-gray-600'}`}>
                                {settings.join_active ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
                            </button>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Topluluk Üyelikleri</h3>
                            <p className="text-sm text-gray-500 mt-1 mb-4">{settings.join_active ? 'Şu an AÇIK. Üye alımı yapılıyor.' : 'Şu an KAPALI. Katıl butonu gizlendi.'}</p>
                            <button onClick={downloadMembersCSV} className="text-sm bg-neutral-900 hover:bg-neutral-800 text-white py-2 px-4 rounded w-full border border-neutral-700 transition-colors flex items-center justify-center gap-2">
                                <Download size={14} /> Üye Listesini İndir (CSV)
                            </button>
                        </div>
                    </div>

                    {/* Yeni Oyun Ekle Kartı */}
                    <button onClick={() => setIsAddModalOpen(true)} className="bg-neutral-950 p-6 rounded-xl border border-neutral-800 hover:border-red-500 transition-colors group text-left cursor-pointer flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-neutral-800 text-gray-400 group-hover:bg-red-600 group-hover:text-white transition-colors rounded-lg"><PlusCircle /></div>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg group-hover:text-red-500">Yeni Oyun Ekle</h3>
                            <p className="text-sm text-gray-500 mt-1">Repertuvara yeni bir oyun ekle.</p>
                        </div>
                    </button>
                </div>

                {/* Oyun Listesi Tablosu */}
                <h2 className="text-xl font-bold mb-6 border-l-4 border-red-600 pl-4">Oyun Listesi ({plays.length})</h2>
                <div className="bg-neutral-950 rounded-xl border border-neutral-800 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-neutral-900 text-gray-400 border-b border-neutral-800">
                            <tr>
                                <th className="p-4">Oyun Adı</th>
                                <th className="p-4">Tarih</th>
                                <th className="p-4">Durum</th>
                                <th className="p-4 text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800">
                            {plays.map((play) => (
                                <tr key={play.id} className="hover:bg-neutral-900/50 transition-colors">
                                    <td className="p-4 font-medium">{play.title}</td>
                                    <td className="p-4 text-gray-400 text-sm">{play.play_date}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${play.status === 'Yakında' ? 'bg-yellow-900/30 text-yellow-500' : 'bg-green-900/30 text-green-500'}`}>
                                            {play.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        <button onClick={() => openEditModal(play)} className="p-2 text-blue-400 hover:bg-blue-900/20 rounded transition-colors"><Edit2 size={16} /></button>
                                        <button onClick={() => handleDeleteClick(play.id)} className="p-2 text-red-400 hover:bg-red-900/20 rounded transition-colors"><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Oyun Ekleme/Düzenleme Modalı */}
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <div className="bg-neutral-900 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-neutral-700 p-6 shadow-2xl">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <button onClick={closeModal} className="text-gray-400 hover:text-white transition-colors p-1"><ArrowLeft size={20} /></button>
                                    <h2 className="text-xl font-bold">{editingPlay ? 'Oyunu Düzenle' : 'Yeni Oyun Ekle'}</h2>
                                </div>
                                <button onClick={closeModal} className="text-gray-400 hover:text-white"><X /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Oyun Adı</label>
                                        <input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 p-2 rounded text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Tarih</label>
                                        <input required type="text" value={formData.play_date} onChange={e => setFormData({ ...formData, play_date: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 p-2 rounded text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Durum</label>
                                        <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 p-2 rounded text-white">
                                            <option value="Yakında">Yakında</option>
                                            <option value="Geçmiş Oyun">Geçmiş Oyun</option>
                                            <option value="Hazırlık Aşamasında">Hazırlık Aşamasında</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Yönetmen</label>
                                        <input required type="text" value={formData.director} onChange={e => setFormData({ ...formData, director: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 p-2 rounded text-white" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Kısa Açıklama (Listede görünür)</label>
                                    <input required type="text" value={formData.short_description} onChange={e => setFormData({ ...formData, short_description: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 p-2 rounded text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Uzun Açıklama</label>
                                    <textarea required rows={3} value={formData.long_description} onChange={e => setFormData({ ...formData, long_description: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 p-2 rounded text-white"></textarea>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Kapak Görseli</label>
                                        <div className="space-y-2">
                                            {/* Dosya Yükleme Inputu */}
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                    className="w-full bg-neutral-950 border border-neutral-800 p-2 rounded text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 text-red-700 hover:file:bg-red-100"
                                                />
                                                <UploadCloud className="absolute right-3 top-3 text-gray-500 pointer-events-none" size={20} />
                                            </div>

                                            {/* Önizleme */}
                                            {(selectedFile || formData.image_url) && (
                                                <div className="mt-2 h-32 w-full overflow-hidden rounded bg-black border border-neutral-800">
                                                    <img
                                                        src={selectedFile ? URL.createObjectURL(selectedFile) : formData.image_url}
                                                        className="h-full w-full object-contain"
                                                        alt="Preview"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">YouTube Video ID (İsteğe bağlı)</label>
                                        <input type="text" value={formData.youtube_id} onChange={e => setFormData({ ...formData, youtube_id: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 p-2 rounded text-white" />
                                    </div>
                                </div>
                                <div className="flex gap-4 mt-4">
                                    <button type="button" onClick={closeModal} className="w-1/3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-3 rounded flex items-center justify-center gap-2">
                                        İptal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={uploading}
                                        className="w-2/3 bg-red-700 hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded flex items-center justify-center gap-2"
                                    >
                                        {uploading ? (
                                            <>Yükleniyor...</>
                                        ) : (
                                            <>
                                                <Save size={18} /> {editingPlay ? 'Güncelle' : 'Kaydet'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Festival Ayarları Modalı */}
                {isFestivalSettingsOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <div className="bg-neutral-900 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-neutral-700 p-6 shadow-2xl">
                            <div className="flex justify-between items-center mb-6 border-b border-neutral-800 pb-4">
                                <h2 className="text-xl font-bold flex items-center gap-2"><Ticket className="text-red-500" /> Festival Ayarlarını Düzenle</h2>
                                <button onClick={() => setIsFestivalSettingsOpen(false)} className="text-gray-400 hover:text-white"><X /></button>
                            </div>

                            <form onSubmit={handleSaveFestivalSettings} className="space-y-6">

                                <div>
                                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><Calendar size={18} /> Tarih ve Zamanlama</h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Festival Tarih Aralığı (Örn: 6-10 Nisan 2025)</label>
                                            <input
                                                type="text"
                                                value={festivalForm.festival_date_range}
                                                onChange={e => setFestivalForm({ ...festivalForm, festival_date_range: e.target.value })}
                                                className="w-full bg-neutral-950 border border-neutral-800 p-3 rounded text-white"
                                                placeholder="6-10 Nisan 2025"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Uygun Olmayan Gün Seçenekleri (Virgülle ayırın)</label>
                                            <input
                                                type="text"
                                                value={festivalForm.festival_unavailable_options}
                                                onChange={e => setFestivalForm({ ...festivalForm, festival_unavailable_options: e.target.value })}
                                                className="w-full bg-neutral-950 border border-neutral-800 p-3 rounded text-white"
                                                placeholder="6 Nisan, 7 Nisan, 8 Nisan..."
                                            />
                                            <p className="text-xs text-gray-600 mt-1">Formda kullanıcıların seçebileceği "temsile uygun olmayan" gün seçenekleri.</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><ImageIcon size={18} /> Görseller</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Hero/Kapak Görseli URL (Boş bırakılırsa varsayılan gradient kullanılır)</label>
                                            <input
                                                type="text"
                                                value={festivalForm.festival_hero_image}
                                                onChange={e => setFestivalForm({ ...festivalForm, festival_hero_image: e.target.value })}
                                                className="w-full bg-neutral-950 border border-neutral-800 p-3 rounded text-white"
                                                placeholder="https://..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Sahne Planı Görseli URL</label>
                                            <input
                                                type="text"
                                                value={festivalForm.festival_stage_plan_image}
                                                onChange={e => setFestivalForm({ ...festivalForm, festival_stage_plan_image: e.target.value })}
                                                className="w-full bg-neutral-950 border border-neutral-800 p-3 rounded text-white"
                                                placeholder="https://..."
                                            />
                                            {festivalForm.festival_stage_plan_image && (
                                                <div className="mt-2 h-32 w-full overflow-hidden rounded bg-black">
                                                    <img src={festivalForm.festival_stage_plan_image} className="h-full w-full object-contain" alt="Preview" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4 border-t border-neutral-800">
                                    <button type="button" onClick={() => setIsFestivalSettingsOpen(false)} className="w-1/3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-3 rounded flex items-center justify-center gap-2">
                                        İptal
                                    </button>
                                    <button type="submit" className="w-2/3 bg-red-700 hover:bg-red-800 text-white font-bold py-3 rounded flex items-center justify-center gap-2">
                                        <Save size={18} /> Ayarları Kaydet
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>

            {/* Silme Onay Modalı */}
            {deleteConfirm.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-neutral-900 w-full max-w-md rounded-xl border border-neutral-700 p-6 shadow-2xl text-center">
                        <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 size={32} className="text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Oyunu Sil</h3>
                        <p className="text-gray-400 mb-6">Bu oyunu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.</p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setDeleteConfirm({ open: false, id: null })}
                                className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-3 rounded-lg transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 bg-red-700 hover:bg-red-800 text-white font-bold py-3 rounded-lg transition-colors"
                            >
                                Evet, Sil
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
