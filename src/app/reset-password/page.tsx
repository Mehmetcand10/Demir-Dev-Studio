"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { LockKeyhole } from 'lucide-react';
import Link from 'next/link';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event == "PASSWORD_RECOVERY") {
        console.log("Şifre kurtarma moduna geçildi...");
      }
    });
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if(password.length < 6) return setError("Şifreniz güvenlik sebebiyle en az 6 karakter olmalıdır.");
    setLoading(true);
    setError(null);
    
    // Auth oturumu kurtarma linki ile geçici olarak açıldığı için şifreyi Update edebiliriz.
    const { error } = await supabase.auth.updateUser({ password: password });

    if (error) setError("Şifre güncellenemedi: " + error.message);
    else setSuccess(true);
    
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center bg-anthracite-50 px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-[2rem] p-10 shadow-2xl text-center border border-anthracite-100 relative">
           <div className="w-24 h-24 bg-emerald-500 text-white rounded-[2rem] mx-auto flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/30 transform rotate-3">
             <LockKeyhole className="w-10 h-10" />
           </div>
           <h2 className="text-3xl font-black text-anthracite-900 mb-4 tracking-tight">Kasa Kilidi Yenilendi!</h2>
           <p className="text-anthracite-500 font-medium mb-8 leading-relaxed">Şifreniz devasa bir şifreleme algoritmasıyla başarıyla dönüştürüldü. Artık yeni şifrenizle doğrudan yönetime girebilirsiniz.</p>
           <Link href="/login" className="inline-block bg-anthracite-900 text-white font-black px-10 py-5 rounded-2xl shadow-xl hover:bg-black w-full hover:scale-105 transition-all">Panoya Giriş Yap</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-anthracite-50 px-4 py-12 relative overflow-hidden">
      {/* Dekoratif Arka Plan Işığı */}
      <div className="absolute top-1/2 left-1/4 w-[40%] h-[40%] bg-blue-500/10 blur-[150px] -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"></div>

      <div className="w-full max-w-[26rem] bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-2xl border border-anthracite-100 text-center relative z-10">

        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2rem] mx-auto flex items-center justify-center mb-6 shadow-inner border border-blue-100">
           <LockKeyhole className="w-10 h-10" />
        </div>
        
        <h1 className="text-3xl font-black text-anthracite-900 tracking-tight mb-3">Yeni Şifre Belirleyin</h1>
        <p className="text-anthracite-500 font-medium text-sm mb-8 px-2 max-w-xs mx-auto">Kimliğiniz sistemden doğrulandı! Lütfen işletmenize ait hesabınız için unutmayacağınız yeni bir şifre girin.</p>
        
        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold mb-6 border border-red-100">{error}</div>}

        <form onSubmit={handleUpdate} className="flex flex-col gap-4">
          <input 
            required 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            className="w-full px-5 py-4 rounded-2xl border border-anthracite-200 bg-anthracite-50 text-anthracite-900 font-black outline-none focus:ring-4 focus:ring-blue-100 transition-all text-center tracking-widest text-xl placeholder:text-anthracite-300" 
            placeholder="••••••" 
          />
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.02] disabled:opacity-50 mt-2"
          >
            {loading ? "Ağ Kodlanıyor..." : "Yeni Şifreyi Kaydet"}
          </button>
        </form>
      </div>
    </div>
  );
}
