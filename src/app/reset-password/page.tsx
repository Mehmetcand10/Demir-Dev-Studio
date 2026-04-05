"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { LockKeyhole } from 'lucide-react';
import Link from 'next/link';
import { AuthCard } from '@/components/layout/AuthCard';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event) => {
      if (event == "PASSWORD_RECOVERY") {
        // recovery session active
      }
    });
  }, [supabase.auth]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if(password.length < 6) return setError("Şifre en az 6 karakter olmalıdır.");
    setLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.updateUser({ password: password });

    if (error) setError("Şifre güncellenemedi: " + error.message);
    else setSuccess(true);
    
    setLoading(false);
  };

  if (success) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
        <AuthCard className="max-w-md text-center">
           <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
             <LockKeyhole className="h-7 w-7" strokeWidth={2} />
           </div>
           <h2 className="mb-2 text-xl font-semibold text-anthracite-900">Şifre güncellendi</h2>
           <p className="mb-6 text-sm text-anthracite-600">Yeni şifrenizle giriş yapabilirsiniz.</p>
           <Link href="/login" className="inline-block w-full rounded-xl bg-anthracite-900 py-3 text-sm font-medium text-white transition hover:bg-anthracite-800">Giriş yap</Link>
        </AuthCard>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <AuthCard className="max-w-md text-center">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-sky-700">
           <LockKeyhole className="h-6 w-6" strokeWidth={2} />
        </div>
        
        <h1 className="mb-2 text-xl font-semibold text-anthracite-900">Yeni şifre</h1>
        <p className="mb-6 text-sm text-anthracite-600">Hesabınız için yeni bir şifre belirleyin.</p>
        
        {error && <div className="mb-4 rounded-xl border border-red-100 bg-red-50/90 p-3 text-sm text-red-700">{error}</div>}

        <form onSubmit={handleUpdate} className="flex flex-col gap-3 text-left">
          <input 
            required 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            className="w-full rounded-xl border border-anthracite-200/90 bg-anthracite-50/50 px-3.5 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-500/20" 
            placeholder="••••••" 
          />
          <button 
            type="submit" 
            disabled={loading}
            className="w-full rounded-xl bg-sky-600 py-3 text-sm font-medium text-white transition hover:bg-sky-700 disabled:opacity-50"
          >
            {loading ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </form>
      </AuthCard>
    </div>
  );
}
