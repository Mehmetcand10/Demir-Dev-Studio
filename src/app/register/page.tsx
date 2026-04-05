"use client";

import Link from 'next/link';
import { Package, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

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

    // Faz 5: Auth Tetikleyici (Trigger) ve E-Posta Onaylı Yeni Kayıt Akışı
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: role,
          business_name: businessName,
          full_name: businessName, // Opsiyonel (Business Name'i İsim olarak da alıyoruz)
          phone_number: phone,
          tax_id: taxId,
        }
      }
    });

    if (authError) {
      setError("Kayıt hatası: " + authError.message);
    } else {
      setSuccess(true); // Supabase arka planda E-posta yolladı ve SQL Trigger profili açtı.
    }
    
    setIsLoading(false);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
        <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6 border-4 border-emerald-100 shadow-xl">
           <ShieldCheck className="w-12 h-12 text-emerald-500 animate-pulse" />
        </div>
        <h1 className="text-4xl font-black tracking-tight mb-4 text-anthracite-900">Güvenlik Doğrulaması Gerekiyor</h1>
        <p className="text-anthracite-500 max-w-lg font-medium text-lg mb-8 leading-relaxed">
          {businessName} mağazası için başvuru bilgileriniz kilitli kasaya alındı. Hesabınızı güvenle aktifleştirmek için lütfen şu an <strong>{email}</strong> adresinize gönderdiğimiz doğrulama bağlantısına tıklayın.
        </p>
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl max-w-md text-sm text-amber-800 font-bold mb-10 shadow-sm">
           Eğer maili göremiyorsanız Gereksiz (Spam) kutusunu kontrol ediniz.
        </div>
        <Link href="/login" className="bg-anthracite-900 border border-transparent text-white px-10 py-5 rounded-full hover:bg-black hover:scale-105 transition-all font-black shadow-2xl">
           Bağlantıya Tıkladım, Giriş Ekranına Dön
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[90vh] px-4 py-12">
      <div className="w-full max-w-lg bg-white dark:bg-anthracite-900 border border-anthracite-200 dark:border-anthracite-800 rounded-3xl p-8 shadow-xl">
        <div className="flex flex-col items-center mb-8">
          <Package className="w-10 h-10 mb-4" />
          <h1 className="text-2xl font-bold tracking-tight text-center">Merkezi Ağ Başvurusu</h1>
          <p className="text-anthracite-500 text-sm mt-2 text-center text-balance">
            Satıcı (Toptancı) veya Alıcı (Butik) olarak sistemimizin bir parçası olmak için formu doldurun.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="flex flex-col gap-5">
          
          {/* ROL SEÇİMİ (BUTİK / TOPTANCI ) */}
          <div className="mb-2">
            <label className="text-sm font-semibold mb-2 block">Başvuru Türü (Hesap Tipi)</label>
            <div className="grid grid-cols-2 gap-4">
              <button 
                type="button"
                onClick={() => setRole('butik')}
                className={`py-3 rounded-xl border text-sm font-bold transition-all ${role === 'butik' ? 'bg-anthracite-900 border-anthracite-900 text-white' : 'bg-transparent border-anthracite-200 text-anthracite-500 hover:border-anthracite-400'}`}
              >
                 Müşteri (Butik)
              </button>
              <button 
                type="button"
                onClick={() => setRole('toptanci')}
                className={`py-3 rounded-xl border text-sm font-bold transition-all ${role === 'toptanci' ? 'bg-emerald-600 border-emerald-600 text-white shadow-emerald-500/30 shadow-lg' : 'bg-transparent border-anthracite-200 text-anthracite-500 hover:border-anthracite-400'}`}
              >
                Satıcı (Toptancı)
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">{role === 'toptanci' ? 'Toptancı Firma Adı' : 'Butik Adı'}</label>
            <input 
              required
              type="text" 
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-anthracite-200 dark:border-anthracite-700 bg-anthracite-50 dark:bg-anthracite-800 outline-none focus:ring-2 focus:ring-anthracite-900 text-sm"
              placeholder="Firma Adını Girin..."
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Vergi No (VKN)</label>
              <input required type="text" value={taxId} onChange={(e) => setTaxId(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-anthracite-200 bg-anthracite-50 text-sm outline-none" placeholder="1234567890" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Telefon (İletişim)</label>
              <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-anthracite-200 bg-anthracite-50 text-sm outline-none" placeholder="05..." />
            </div>
          </div>

          <hr className="border-anthracite-100 my-2" />

          <div>
            <label className="text-sm font-medium mb-1.5 block">Giriş E-Postası</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-anthracite-200 bg-anthracite-50 text-sm outline-none" placeholder="sistem@mail.com" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Güvenli Şifre</label>
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-anthracite-200 bg-anthracite-50 text-sm outline-none" placeholder="En az 6 karakter" />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full text-white font-bold py-4 rounded-xl hover:opacity-90 transition-opacity mt-2 disabled:opacity-50 ${role === 'toptanci' ? 'bg-emerald-600 shadow-xl shadow-emerald-500/20' : 'bg-anthracite-900 dark:bg-white dark:text-black'}`}
          >
            {isLoading ? "Kaydediliyor..." : `${role === 'toptanci' ? 'Satıcı Olarak Başvur' : 'Müşteri Olarak Başvur'}`}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-anthracite-100 dark:border-anthracite-800 text-center">
          <p className="text-sm text-anthracite-500">
            Zaten hesabınız var mı? <Link href="/login" className="text-anthracite-900 dark:text-white font-semibold hover:underline">Giriş Yap</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
