import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from 'next/link';
import { Package, Heart } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import AnnouncementBanner from "@/components/AnnouncementBanner";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "B2B Tekstil Ağı | Demir Dev Studio",
  description: "Ankara'nın En Hızlı Butik Tedarik Ağı",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#09090b",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Profil rolünü çekelim (Admin (Demir Dev), Toptancı veya Butik için Akıllı Menü Yönlendirmesi)
  let userRole = 'butik';
  
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile) {
      userRole = profile.role;
    }
  }

  return (
    <html lang="tr">
      <body className={`${inter.className} min-h-screen flex flex-col antialiased overflow-x-hidden`}>
        <AnnouncementBanner />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
        <nav className="border-b border-anthracite-200 dark:border-anthracite-800 bg-white/80 dark:bg-anthracite-900/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-16 py-2 flex flex-wrap items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-2 text-lg sm:text-xl font-semibold tracking-tight min-w-0">
              <Package className="w-6 h-6" />
              <span className="truncate">Demir Dev Studio</span>
            </Link>
            <div className="w-full md:w-auto overflow-x-auto">
            <div className="flex items-center gap-3 sm:gap-6 min-w-max md:min-w-0 pb-1 md:pb-0">
              <Link href="/katalog" className="text-sm font-bold hover:text-anthracite-500 transition-colors flex items-center h-full tracking-wide">
                Tüm Ürünler
              </Link>
              {userRole === 'butik' && user ? (
                <>
                  <Link href="/favorites" className="text-sm font-bold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1 h-full tracking-wide">
                    <Heart className="w-4 h-4 fill-current" /> Favorilerim
                  </Link>
                  <Link href="/siparislerim" className="text-sm font-bold text-anthracite-400 hover:text-black transition-colors flex items-center h-full tracking-wide">
                    Siparişlerim (Kargo)
                  </Link>
                </>
              ) : null}
              
              {user ? (
                <div className="flex items-center gap-2">
                  {userRole === 'admin' && (
                    <Link 
                      href="/admin" 
                      className="text-sm font-bold text-emerald-600 bg-emerald-50 px-5 py-2 rounded-full border border-emerald-200 transition-colors shadow-sm hover:scale-105"
                    >
                      Merkez Yönetim
                    </Link>
                  )}
                  {userRole === 'toptanci' && (
                    <Link 
                      href="/toptanci" 
                      className="text-sm font-bold text-emerald-600 bg-emerald-50 px-5 py-2 rounded-full border border-emerald-200 transition-colors shadow-sm hover:scale-105"
                    >
                      Kendi Satıcı Panelim
                    </Link>
                  )}
                  {/* BUTİKLERE ÜSTTEKİ YÖNETİM BUTONLARI ÇIKMAYACAK! SADECE ÇIKIŞ YAP. */}
                  
                  <form action="/auth/signout" method="post">
                    <button type="submit" className="text-sm font-bold text-red-500 hover:text-white px-4 py-2 border border-red-100 hover:border-red-500 bg-white hover:bg-red-500 rounded-full transition-all shadow-sm">
                      Çıkış Yap
                    </button>
                  </form>
                </div>
              ) : (
                <Link href="/login" className="text-sm font-bold hover:text-anthracite-500 transition-colors">Giriş Yap</Link>
              )}
            </div>
            </div>
          </div>
        </nav>
        
        <main className="flex-grow">
          {children}
        </main>

        <footer className="border-t border-anthracite-200 dark:border-anthracite-800 py-8 text-center bg-anthracite-50 dark:bg-anthracite-900 mt-auto">
          <p className="text-sm text-anthracite-500 font-medium">
            Demir Dev Studio Yazılım Güvencesiyle © {new Date().getFullYear()}
          </p>
        </footer>
      </body>
    </html>
  );
}
