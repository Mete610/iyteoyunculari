require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Resend } = require('resend');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const resend = new Resend(process.env.RESEND_API_KEY);
const TARGET_EMAIL = process.env.TARGET_EMAIL;
const PORT = process.env.PORT || 3001;

// Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

// ==========================================
// 🔒 GÜVENLİK MİDDLEWARE'LERİ
// ==========================================

// Helmet - HTTP güvenlik başlıkları
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS - Sadece izin verilen originler
// CORS - Sadece izin verilen originler
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'https://iyteoyunculari.com',
    'https://www.iyteoyunculari.com',
    process.env.FRONTEND_URL // Render environment variable
].filter(Boolean); // Remove undefined/null values

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        // Vercel preiview/production domainlerine izin ver
        if (origin.endsWith('.vercel.app')) {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        console.log('Blocked by CORS:', origin); // Debug log
        return callback(new Error('CORS policy violation'), false);
    },
    credentials: true
}));

// Rate Limiters
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 100, // IP başına 100 istek
    message: { error: 'Çok fazla istek gönderdiniz. Lütfen 15 dakika bekleyin.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// E-posta formları için daha sıkı limit (spam koruması)
const emailLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 saat
    max: 5, // IP başına saatte 5 e-posta
    message: { error: 'Çok fazla form gönderdiniz. Lütfen 1 saat sonra tekrar deneyin.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Festival başvurusu için limit
const festivalLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 saat
    max: 3, // IP başına günde 3 başvuru
    message: { error: 'Günlük başvuru limitine ulaştınız. Lütfen yarın tekrar deneyin.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Genel rate limiter
app.use('/api/', generalLimiter);

// Body parser
app.use(express.json({ limit: '10mb' }));

// ==========================================
// 🛡️ YARDIMCI FONKSİYONLAR
// ==========================================

// XSS temizleme fonksiyonu
const sanitizeHtml = (str) => {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
};

// E-posta validasyonu
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Multer config - memory storage for handling uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit (düşürüldü)
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Desteklenmeyen dosya türü. Sadece JPEG, PNG, GIF, WebP ve PDF kabul edilir.'), false);
        }
    }
});

// ==========================================
// 📡 API ENDPOINTS
// ==========================================

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// İletişim Formu (rate limited)
app.post('/api/contact', emailLimiter, async (req, res) => {
    try {
        const { name, email, message } = req.body;

        // Validation
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Tüm alanlar zorunludur.' });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ error: 'Geçerli bir e-posta adresi girin.' });
        }

        if (name.length > 100 || email.length > 100 || message.length > 5000) {
            return res.status(400).json({ error: 'Alan uzunlukları sınırı aşıyor.' });
        }

        // XSS temizleme
        const safeName = sanitizeHtml(name);
        const safeEmail = sanitizeHtml(email);
        const safeMessage = sanitizeHtml(message);

        const { data, error } = await resend.emails.send({
            from: 'İYTE Oyuncuları <onboarding@resend.dev>',
            to: TARGET_EMAIL,
            subject: `🎭 Yeni İletişim Mesajı: ${safeName}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #dc2626; border-bottom: 2px solid #dc2626; padding-bottom: 10px;">
                        🎭 Yeni İletişim Mesajı
                    </h2>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">İsim:</td>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">${safeName}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">E-posta:</td>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">${safeEmail}</td>
                        </tr>
                    </table>
                    <div style="margin-top: 20px; padding: 15px; background: #f3f4f6; border-radius: 8px;">
                        <strong>Mesaj:</strong>
                        <p style="margin-top: 10px; white-space: pre-wrap;">${safeMessage}</p>
                    </div>
                    <p style="margin-top: 20px; color: #666; font-size: 12px;">
                        Bu mesaj iyteoyunculari.com iletişim formundan gönderilmiştir.
                    </p>
                </div>
            `
        });

        if (error) {
            console.error('Resend error:', error);
            return res.status(500).json({ error: 'E-posta gönderilemedi.' });
        }

        res.json({ success: true, message: 'Mesajınız başarıyla gönderildi!' });
    } catch (err) {
        console.error('Contact error:', err);
        res.status(500).json({ error: 'Sunucu hatası.' });
    }
});

// Festival Başvuru Formu (rate limited + file upload)
app.post('/api/festival-application', festivalLimiter, upload.single('poster'), async (req, res) => {
    try {
        const data = JSON.parse(req.body.formData || '{}');
        let posterUrl = null;

        // Temel validation
        if (!data.university || !data.groupName || !data.email || !data.playName) {
            return res.status(400).json({ error: 'Zorunlu alanlar eksik.' });
        }

        if (!isValidEmail(data.email)) {
            return res.status(400).json({ error: 'Geçerli bir e-posta adresi girin.' });
        }

        // Upload poster to Supabase Storage if provided
        if (req.file) {
            const fileName = `festival-posters/${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('festival-applications')
                .upload(fileName, req.file.buffer, {
                    contentType: req.file.mimetype,
                    upsert: false
                });

            if (uploadError) {
                console.error('Supabase upload error:', uploadError);
            } else {
                const { data: urlData } = supabase.storage
                    .from('festival-applications')
                    .getPublicUrl(fileName);
                posterUrl = urlData?.publicUrl;
            }
        }

        // XSS temizleme (tüm alanlar için)
        const safeData = {};
        for (const [key, value] of Object.entries(data)) {
            if (typeof value === 'string') {
                safeData[key] = sanitizeHtml(value);
            } else if (Array.isArray(value)) {
                safeData[key] = value.map(v => sanitizeHtml(v));
            } else {
                safeData[key] = value;
            }
        }

        // HTML formatında detaylı başvuru maili
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">
                <h1 style="color: #dc2626; border-bottom: 3px solid #dc2626; padding-bottom: 15px;">
                    🎭 Yeni Festival Başvurusu
                </h1>
                
                <h2 style="color: #333; margin-top: 25px;">📌 Genel Bilgiler</h2>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <tr style="background: #f9fafb;">
                        <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; width: 40%;">Üniversite</td>
                        <td style="padding: 12px; border: 1px solid #e5e7eb;">${safeData.university || '-'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Topluluk Adı</td>
                        <td style="padding: 12px; border: 1px solid #e5e7eb;">${safeData.groupName || '-'}</td>
                    </tr>
                </table>

                <h2 style="color: #333; margin-top: 25px;">📞 İletişim Bilgileri</h2>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <tr style="background: #f9fafb;">
                        <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; width: 40%;">Sorumlu Kişi</td>
                        <td style="padding: 12px; border: 1px solid #e5e7eb;">${safeData.contactPerson || '-'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">E-posta</td>
                        <td style="padding: 12px; border: 1px solid #e5e7eb;">${safeData.email || '-'}</td>
                    </tr>
                    <tr style="background: #f9fafb;">
                        <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Telefon</td>
                        <td style="padding: 12px; border: 1px solid #e5e7eb;">${safeData.phone || '-'}</td>
                    </tr>
                </table>

                <h2 style="color: #333; margin-top: 25px;">🎬 Oyun Detayları</h2>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <tr style="background: #f9fafb;">
                        <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; width: 40%;">Oyun Adı</td>
                        <td style="padding: 12px; border: 1px solid #e5e7eb;">${safeData.playName || '-'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Yazar</td>
                        <td style="padding: 12px; border: 1px solid #e5e7eb;">${safeData.writer || '-'}</td>
                    </tr>
                    <tr style="background: #f9fafb;">
                        <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Oyun Türü</td>
                        <td style="padding: 12px; border: 1px solid #e5e7eb;">${safeData.playType || '-'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Süre</td>
                        <td style="padding: 12px; border: 1px solid #e5e7eb;">${safeData.duration || '-'}</td>
                    </tr>
                    <tr style="background: #f9fafb;">
                        <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Perde Sayısı</td>
                        <td style="padding: 12px; border: 1px solid #e5e7eb;">${safeData.acts || '-'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Yaş Sınırı</td>
                        <td style="padding: 12px; border: 1px solid #e5e7eb;">${safeData.ageLimit || '-'}</td>
                    </tr>
                </table>

                <h3 style="color: #333;">Oyun Konusu / Yorum:</h3>
                <div style="padding: 15px; background: #f3f4f6; border-radius: 8px; margin-bottom: 20px;">
                    <p style="white-space: pre-wrap; margin: 0;">${safeData.synopsis || '-'}</p>
                </div>

                ${posterUrl ? `
                <h3 style="color: #333;">🖼️ Oyun Afişi:</h3>
                <div style="margin-bottom: 20px;">
                    <a href="${posterUrl}" style="color: #dc2626; text-decoration: underline;">Afişi Görüntüle / İndir</a>
                </div>
                ` : ''}

                <h2 style="color: #333; margin-top: 25px;">🛠️ Teknik ve Ekip</h2>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <tr style="background: #f9fafb;">
                        <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; width: 40%;">Hazırlık Süresi</td>
                        <td style="padding: 12px; border: 1px solid #e5e7eb;">${safeData.preparationTime || '-'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Toplam Katılımcı</td>
                        <td style="padding: 12px; border: 1px solid #e5e7eb;">${safeData.totalParticipants || '-'}</td>
                    </tr>
                    <tr style="background: #f9fafb;">
                        <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Sahne Tercihi</td>
                        <td style="padding: 12px; border: 1px solid #e5e7eb;">${safeData.stagePreference || '-'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Uygun Olmayan Günler</td>
                        <td style="padding: 12px; border: 1px solid #e5e7eb;">${safeData.unavailableDays?.join(', ') || 'Belirtilmedi'}</td>
                    </tr>
                </table>

                <h3 style="color: #333;">Teknik Ekip:</h3>
                <div style="padding: 15px; background: #f3f4f6; border-radius: 8px; margin-bottom: 15px;">
                    <p style="white-space: pre-wrap; margin: 0;">${safeData.technicalCrew || '-'}</p>
                </div>

                <h3 style="color: #333;">Oyuncular:</h3>
                <div style="padding: 15px; background: #f3f4f6; border-radius: 8px; margin-bottom: 15px;">
                    <p style="white-space: pre-wrap; margin: 0;">${safeData.cast || '-'}</p>
                </div>

                <h3 style="color: #333;">Sağlanamayan Teknik Gereklilikler:</h3>
                <div style="padding: 15px; background: #f3f4f6; border-radius: 8px; margin-bottom: 15px;">
                    <p style="white-space: pre-wrap; margin: 0;">${safeData.technicalRequirements || '-'}</p>
                </div>

                ${safeData.additionalNotes ? `
                <h3 style="color: #333;">Ek Notlar:</h3>
                <div style="padding: 15px; background: #fef3c7; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #f59e0b;">
                    <p style="white-space: pre-wrap; margin: 0;">${safeData.additionalNotes}</p>
                </div>
                ` : ''}

                <p style="margin-top: 30px; color: #666; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 15px;">
                    Bu başvuru İYTE Tiyatro Haftası başvuru formundan gönderilmiştir.<br>
                    Tarih: ${new Date().toLocaleString('tr-TR')}
                </p>
            </div>
        `;

        const { error } = await resend.emails.send({
            from: 'İYTE Oyuncuları <onboarding@resend.dev>',
            to: TARGET_EMAIL,
            subject: `🎭 Festival Başvurusu: ${safeData.groupName} - ${safeData.playName}`,
            html: htmlContent
        });

        if (error) {
            console.error('Resend error:', error);
            return res.status(500).json({ error: 'E-posta gönderilemedi.' });
        }

        res.json({ success: true, message: 'Başvurunuz başarıyla alındı!' });
    } catch (err) {
        console.error('Festival application error:', err);
        res.status(500).json({ error: 'Sunucu hatası.' });
    }
});

// Topluluğa Katıl - E-posta bildirimi (rate limited)
app.post('/api/join-notification', emailLimiter, async (req, res) => {
    try {
        const { fullName, studentId, phone, email } = req.body;

        // Validation
        if (!fullName || !studentId || !email) {
            return res.status(400).json({ error: 'Zorunlu alanlar eksik.' });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ error: 'Geçerli bir e-posta adresi girin.' });
        }

        // XSS temizleme
        const safeFullName = sanitizeHtml(fullName);
        const safeStudentId = sanitizeHtml(studentId);
        const safePhone = sanitizeHtml(phone);
        const safeEmail = sanitizeHtml(email);

        const { error } = await resend.emails.send({
            from: 'İYTE Oyuncuları <onboarding@resend.dev>',
            to: TARGET_EMAIL,
            subject: `🌟 Yeni Üye Başvurusu: ${safeFullName}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #dc2626; border-bottom: 2px solid #dc2626; padding-bottom: 10px;">
                        🌟 Yeni Üye Başvurusu
                    </h2>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="background: #f9fafb;">
                            <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">İsim Soyisim</td>
                            <td style="padding: 12px; border: 1px solid #e5e7eb;">${safeFullName}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Öğrenci No</td>
                            <td style="padding: 12px; border: 1px solid #e5e7eb;">${safeStudentId}</td>
                        </tr>
                        <tr style="background: #f9fafb;">
                            <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Telefon</td>
                            <td style="padding: 12px; border: 1px solid #e5e7eb;">${safePhone}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">E-posta</td>
                            <td style="padding: 12px; border: 1px solid #e5e7eb;">${safeEmail}</td>
                        </tr>
                    </table>
                    <p style="margin-top: 20px; color: #666; font-size: 12px;">
                        Bu başvuru Supabase'e de kaydedilmiştir.<br>
                        Tarih: ${new Date().toLocaleString('tr-TR')}
                    </p>
                </div>
            `
        });

        if (error) {
            console.error('Resend error:', error);
            return res.status(500).json({ error: 'E-posta bildirimi gönderilemedi.' });
        }

        res.json({ success: true });
    } catch (err) {
        console.error('Join notification error:', err);
        res.status(500).json({ error: 'Sunucu hatası.' });
    }
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Beklenmeyen bir hata oluştu.' });
});

app.listen(PORT, () => {
    console.log(`🎭 İYTE Oyuncuları API çalışıyor: http://localhost:${PORT}`);
    console.log('🔒 Güvenlik önlemleri aktif: Helmet, Rate Limiter, XSS Koruması');
});
