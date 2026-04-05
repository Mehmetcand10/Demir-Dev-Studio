import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from 'next/link';
import { Package, Heart } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import AnnouncementBanner from "@/components/AnnouncementBanner";
import { SiteBackground } from "@/components/layout/SiteBackground";
import SiteFooter from "@/components/layout/SiteFooter";
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
        <div className="no-print">
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
        <nav className="sticky top-0 z-50 border-b border-anthracite-200/80 bg-white/90 backdrop-blur-md">
          <div className="mx-auto flex min-h-14 max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-8">
            <Link href="/" className="flex min-w-0 items-center gap-2 text-base font-semibold tracking-tight text-anthracite-900 sm:text-lg">
              <Package className="h-5 w-5 shrink-0 text-emerald-600" strokeWidth={2} />
              <span className="truncate">Demir Dev Studio</span>
            </Link>
            <div className="w-full overflow-x-auto md:w-auto">
            <div className="flex min-w-max items-center gap-1 pb-1 sm:gap-2 md:min-w-0 md:pb-0">
              <Link href="/katalog" className="flex h-9 items-center rounded-lg px-3 text-sm font-medium text-anthracite-600 transition hover:bg-anthracite-100/80 hover:text-anthracite-900">
                Katalog
              </Link>
              <Link href="/yardim" className="flex h-9 items-center rounded-lg px-3 text-sm font-medium text-anthracite-600 transition hover:bg-anthracite-100/80 hover:text-anthracite-900">
                Yardım
              </Link>
              {userRole === 'butik' && user ? (
                <>
                  <Link href="/favorites" className="flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-rose-600 transition hover:bg-rose-50">
                    <Heart className="h-4 w-4 fill-current" strokeWidth={2} /> Favoriler
                  </Link>
                  <Link href="/siparislerim" className="flex h-9 items-center rounded-lg px-3 text-sm font-medium text-anthracite-600 transition hover:bg-anthracite-100/80 hover:text-anthracite-900">
                    Siparişlerim
                  </Link>
                </>
              ) : null}
              
              {user ? (
                <div className="ml-1 flex flex-wrap items-center gap-2">
                  {userRole === 'admin' && (
                    <Link 
                      href="/admin" 
                      className="rounded-lg border border-emerald-200/80 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 transition hover:bg-emerald-100/80"
                    >
                      Yönetim
                    </Link>
                  )}
                  {userRole === 'toptanci' && (
                    <Link 
                      href="/toptanci" 
                      className="rounded-lg border border-emerald-200/80 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 transition hover:bg-emerald-100/80"
                    >
                      Toptancı paneli
                    </Link>
                  )}
                  
                  <form action="/auth/signout" method="post">
                    <button type="submit" className="rounded-lg border border-anthracite-200 bg-white px-3 py-2 text-sm font-medium text-anthracite-600 transition hover:border-anthracite-300 hover:bg-anthracite-50">
                      Çıkış
                    </button>
                  </form>
                </div>
              ) : (
                <Link href="/login" className="ml-1 flex h-9 items-center rounded-lg bg-anthracite-900 px-4 text-sm font-medium text-white transition hover:bg-anthracite-800">Giriş</Link>
              )}
            </div>
            </div>
          </div>
        </nav>
        </div>

        <main className="flex flex-grow flex-col">
          <SiteBackground>{children}</SiteBackground>
        </main>

        <div className="no-print">
        <SiteFooter />
        </div>
      </body>
    </html>
  );
}
