"use client";

import Link from 'next/link';
import { Package } from 'lucide-react';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

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

    // Gerçek Supabase Auth Login Çağrısı
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Giriş başarısız. Lütfen e-posta ve şifrenizi kontrol edin.");
      setIsLoading(false);
      return;
    }

    // Başarılıysa kataloga yönlendir ve Header'ı güncelle
    router.push('/katalog');
    router.refresh(); 
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-md bg-white dark:bg-anthracite-900 border border-anthracite-200 dark:border-anthracite-800 rounded-3xl p-8 shadow-xl">
        <div className="flex flex-col items-center mb-8">
          <Package className="w-10 h-10 mb-4" />
          <h1 className="text-2xl font-bold tracking-tight text-center">Butik Girişi</h1>
          <p className="text-anthracite-500 text-sm mt-2 text-center text-balance">
            Tedarik ağına erişmek ve fiyatları görmek için sisteme kayıt olduğunuz e-posta ve şifrenizi girin.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Kayıtlı E-Posta Ardesi</label>
            <input 
              required
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-anthracite-200 dark:border-anthracite-700 bg-anthracite-50 dark:bg-anthracite-800 focus:outline-none focus:ring-2 focus:ring-anthracite-900 dark:focus:ring-white transition-all text-sm"
              placeholder="sizin@butik.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Şifre</label>
            <input 
              required
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-anthracite-200 dark:border-anthracite-700 bg-anthracite-50 dark:bg-anthracite-800 focus:outline-none focus:ring-2 focus:ring-anthracite-900 dark:focus:ring-white transition-all text-sm"
              placeholder="••••••••"
            />
            <div className="flex justify-end mt-2 mb-2">
              <Link href="/forgot-password" className="text-xs font-bold text-anthracite-400 hover:text-anthracite-900 transition-colors">Şifrenizi mi unuttunuz?</Link>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-anthracite-900 dark:bg-white text-white dark:text-black font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity mt-4 disabled:opacity-50"
          >
            {isLoading ? "Giriş Yapılıyor..." : "Sisteme Giriş Yap"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-anthracite-100 dark:border-anthracite-800 text-center">
          <p className="text-sm text-anthracite-500">
            Ağımıza katılmak mı istiyorsunuz? <Link href="/register" className="text-anthracite-900 dark:text-white font-semibold hover:underline">Bayilik Başvurusu</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
