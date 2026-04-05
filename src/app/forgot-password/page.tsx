"use client";

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { KeyRound, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { AuthCard } from '@/components/layout/AuthCard';

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

    if (error) setError("E-posta gönderilemedi. Adresin kayıtlı olduğundan emin olun.");
    else setSuccess(true);
    
    setLoading(false);
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <AuthCard className="relative max-w-md text-center">
        <Link href="/login" className="absolute left-4 top-4 text-anthracite-400 transition hover:text-anthracite-700" aria-label="Geri">
          <ArrowLeft className="h-5 w-5" strokeWidth={2} />
        </Link>

        <div className="mx-auto mb-5 mt-6 flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600">
           <KeyRound className="h-6 w-6" strokeWidth={2} />
        </div>
        
        <h1 className="mb-2 text-xl font-semibold text-anthracite-900">Şifre sıfırlama</h1>
        
        {success ? (
          <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50/90 p-4 text-left text-sm text-emerald-900">
             <p className="font-medium">Bağlantı gönderildi.</p>
             <p className="mt-2 text-emerald-800/90"><strong>{email}</strong> gelen kutusunu kontrol edin.</p>
          </div>
        ) : (
          <>
            <p className="mb-6 text-sm text-anthracite-600">
              Kayıtlı e-postanızı girin; şifre yenileme bağlantısı gönderelim.
            </p>
            
            {error && <div className="mb-4 rounded-xl border border-red-100 bg-red-50/90 p-3 text-sm text-red-700">{error}</div>}

            <form onSubmit={handleReset} className="flex flex-col gap-3 text-left">
              <input 
                required 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="w-full rounded-xl border border-anthracite-200/90 bg-anthracite-50/50 px-3.5 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/15" 
                placeholder="ornek@firma.com" 
              />
              <button 
                type="submit" 
                disabled={loading}
                className="w-full rounded-xl bg-anthracite-900 py-3 text-sm font-medium text-white transition hover:bg-anthracite-800 disabled:opacity-50"
              >
                {loading ? "Gönderiliyor…" : "Bağlantı gönder"}
              </button>
            </form>
          </>
        )}
      </AuthCard>
    </div>
  );
}
