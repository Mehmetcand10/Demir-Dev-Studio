"use client";

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { KeyRound, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) setError("Mail gönderilirken hata oluştu: Kasa ile olan ağınız kesilmiş veya kayıtlı değilsiniz.");
    else setSuccess(true);
    
    setLoading(false);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-anthracite-50 px-4 py-12 relative overflow-hidden">
      
      {/* Lüks Arka Plan Dağıtımı */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-[26rem] bg-white rounded-[2rem] p-8 sm:p-10 shadow-2xl border border-anthracite-100 relative z-10 text-center">
        <Link href="/login" className="absolute top-8 left-8 text-anthracite-400 hover:text-black transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>

        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl mx-auto flex items-center justify-center mb-6 mt-6 shadow-inner border border-emerald-100">
           <KeyRound className="w-10 h-10" />
        </div>
        
        <h1 className="text-3xl font-black text-anthracite-900 tracking-tight mb-3">Şifrenizi Mi Unuttunuz?</h1>
        
        {success ? (
          <div className="mt-6 p-6 bg-emerald-50 rounded-2xl border border-emerald-200">
             <h3 className="text-emerald-800 font-bold mb-2">Kurtarma Bağlantısı Gönderildi!</h3>
             <p className="text-emerald-700 text-sm font-medium">Lütfen <strong>{email}</strong> adresinizin gelen kutusunu kontrol edin. Gelen yeşil butona basarak yeni bir kilit kapısı oluşturabilirsiniz.</p>
          </div>
        ) : (
          <>
            <p className="text-anthracite-500 font-medium text-sm mb-8 px-2">Sorun değil. İşletmenize ait kayıtlı yönetici e-postasını girin, size kasa anahtarınızı yenileyecek lüks bir bağlantı atalım.</p>
            
            {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold mb-6 border border-red-100">{error}</div>}

            <form onSubmit={handleReset} className="flex flex-col gap-4">
              <input 
                required 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="w-full px-5 py-4 rounded-2xl border border-anthracite-200 bg-anthracite-50 text-anthracite-900 font-bold outline-none focus:ring-4 focus:ring-anthracite-100 transition-all text-center placeholder:font-medium placeholder:text-anthracite-300" 
                placeholder="Örn: iletisim@butik.com" 
              />
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-anthracite-900 hover:bg-black text-white font-black py-4.5 rounded-2xl shadow-xl transition-all hover:scale-[1.02] disabled:opacity-50 mt-2"
              >
                {loading ? "Sistem Ağ Taraması Yapılıyor..." : "Kurtarma Bağlantısı Gönder"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
