
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    // Uyarı: Henüz bilgiler girilmediyse konsola hata basabilir, bu normal.
    console.warn('Supabase URL veya Key eksik! Lütfen .env dosyasını kontrol edin.')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')
