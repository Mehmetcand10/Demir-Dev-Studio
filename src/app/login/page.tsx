"use client";

import Link from 'next/link';
import { Package } from 'lucide-react';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { AuthCard } from '@/components/layout/AuthCard';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Giriş başarısız. E-posta ve şifrenizi kontrol edin.");
      setIsLoading(false);
      return;
    }

    router.push('/katalog');
    router.refresh(); 
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <AuthCard>
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100/80">
            <Package className="h-5 w-5" strokeWidth={2} />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-anthracite-900">Giriş</h1>
          <p className="mt-2 text-sm text-anthracite-600 text-balance">
            Kayıtlı e-posta ve şifrenizle vitrine erişin.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-100 bg-red-50/90 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-anthracite-600">E-posta</label>
            <input 
              required
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-anthracite-200/90 bg-anthracite-50/50 px-3.5 py-2.5 text-sm outline-none transition focus:border-emerald-300/80 focus:ring-2 focus:ring-emerald-500/15"
              placeholder="sizin@butik.com"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-anthracite-600">Şifre</label>
            <input 
              required
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-anthracite-200/90 bg-anthracite-50/50 px-3.5 py-2.5 text-sm outline-none transition focus:border-emerald-300/80 focus:ring-2 focus:ring-emerald-500/15"
              placeholder="••••••••"
            />
            <div className="mt-2 flex justify-end">
              <Link href="/forgot-password" className="text-xs font-medium text-anthracite-500 transition hover:text-anthracite-800">Şifremi unuttum</Link>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="mt-2 w-full rounded-xl bg-anthracite-900 py-3 text-sm font-medium text-white transition hover:bg-anthracite-800 disabled:opacity-50"
          >
            {isLoading ? "Giriş yapılıyor…" : "Giriş yap"}
          </button>
        </form>

        <div className="mt-8 border-t border-anthracite-100 pt-6 text-center">
          <p className="text-sm text-anthracite-600">
            Hesabınız yok mu?{' '}
            <Link href="/register" className="font-medium text-emerald-700 hover:underline">Başvuru</Link>
          </p>
        </div>
      </AuthCard>
    </div>
  );
}
