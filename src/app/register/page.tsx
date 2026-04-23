"use client";

import Link from 'next/link';
import { Package, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { AuthCard } from '@/components/layout/AuthCard';

export default function Register() {
  const [role, setRole] = useState<'butik' | 'toptanci'>('butik');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [phone, setPhone] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const meta: Record<string, string> = {
      role,
      business_name: businessName,
      full_name: businessName,
      phone_number: phone,
    };
    const trimmedTax = taxId.trim();
    if (trimmedTax) meta.tax_id = trimmedTax;

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: meta,
      },
    });

    if (authError) {
      setError("Kayıt hatası: " + authError.message);
    } else {
      setSuccess(true);
    }
    
    setIsLoading(false);
  };

  if (success) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 py-12 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-600">
           <ShieldCheck className="h-8 w-8" strokeWidth={2} />
        </div>
        <h1 className="mb-3 text-2xl font-semibold tracking-tight text-anthracite-900">E-postanizi dogrulayin</h1>
        <p className="mb-6 max-w-md text-sm leading-relaxed text-anthracite-600">
          <strong className="text-anthracite-800">{email}</strong> adresine bir baglanti gonderdik. Hesabi etkinlestirmek icin gelen kutunuzu kontrol edin.
        </p>
        <div className="mb-8 max-w-sm rounded-xl border border-amber-100 bg-amber-50/90 p-4 text-left text-xs text-amber-900">
           Spam / gereksiz klasorune de bakin.
        </div>
        <Link href="/login" className="rounded-xl bg-anthracite-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-anthracite-800">
           Girise don
        </Link>
        <p className="mt-6 text-xs text-anthracite-500">
          <Link href="/yardim" className="font-medium text-sky-700 underline-offset-2 hover:underline">
            Süreçler için Yardım
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <AuthCard className="max-w-lg">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-700 ring-1 ring-sky-100/80">
            <Package className="h-5 w-5" strokeWidth={2} />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-anthracite-900">Ticari uyelik basvurusu</h1>
          <p className="mt-2 text-sm text-anthracite-600 text-balance">
            Butik veya toptanci olarak basvurun; onay sonrasi toptan alim paneline erisin.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-100 bg-red-50/90 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          
          <div>
            <label className="premium-label">Hesap tipi</label>
            <div className="grid grid-cols-2 gap-2">
              <button 
                type="button"
                onClick={() => setRole('butik')}
                className={`rounded-xl border py-2.5 text-sm font-medium transition ${role === 'butik' ? 'border-anthracite-800 bg-anthracite-900 text-white' : 'border-anthracite-200 bg-white text-anthracite-600 hover:border-anthracite-300'}`}
              >
                 Butik
              </button>
              <button 
                type="button"
                onClick={() => setRole('toptanci')}
                className={`rounded-xl border py-2.5 text-sm font-medium transition ${role === 'toptanci' ? 'border-sky-600 bg-sky-600 text-white' : 'border-anthracite-200 bg-white text-anthracite-600 hover:border-anthracite-300'}`}
              >
                Toptanci
              </button>
            </div>
          </div>

          <div>
            <label className="premium-label">{role === 'toptanci' ? 'Firma adi' : 'Butik adi'}</label>
            <input 
              required
              type="text" 
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="premium-input"
              placeholder="Ticari unvan"
            />
          </div>
          
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <label className="premium-label">
                Vergi no{" "}
                <span className="font-normal normal-case tracking-normal text-anthracite-400">(istege bagli)</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                className="premium-input"
                placeholder="VKN — bos birakilabilir"
              />
              <p className="mt-1.5 text-[11px] leading-snug text-anthracite-500">
                Fatura ve resmi kayit icin kullanilir; simdilik bos birakip onay veya ilk siparis oncesi
                yonetimle paylasabilirsiniz.
              </p>
            </div>
            <div>
              <label className="premium-label">Telefon</label>
              <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="premium-input" placeholder="05xx..." />
            </div>
          </div>

          <hr className="border-anthracite-100" />

          <div>
            <label className="premium-label">E-posta</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="premium-input" placeholder="ornek@firma.com" />
          </div>
          <div>
            <label className="premium-label">Sifre</label>
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="premium-input" placeholder="En az 6 karakter" />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className={`mt-1 w-full rounded-xl py-3 text-sm font-medium text-white transition disabled:opacity-50 ${role === 'toptanci' ? 'bg-sky-600 hover:bg-sky-700' : 'bg-anthracite-900 hover:bg-anthracite-800'}`}
          >
            {isLoading ? "Gonderiliyor..." : "Basvuruyu gonder"}
          </button>
        </form>

        <div className="mt-8 border-t border-anthracite-100 pt-6 text-center">
          <p className="text-sm text-anthracite-600">
            Zaten uye misiniz?{' '}
            <Link href="/login" className="font-medium text-sky-700 hover:underline">Giris</Link>
          </p>
          <p className="mt-3 text-xs text-anthracite-500">
            <Link href="/yardim" className="font-medium text-sky-700 underline-offset-2 hover:underline">
              Süreçler için Yardım
            </Link>
          </p>
        </div>
      </AuthCard>
    </div>
  );
}
