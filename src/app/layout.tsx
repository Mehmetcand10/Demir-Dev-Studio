import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from 'next/link';
import { Package, Heart } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { CartNavLink } from '@/components/nav/CartNavLink';
import AnnouncementBanner from "@/components/AnnouncementBanner";
import { SiteBackground } from "@/components/layout/SiteBackground";
import SiteFooter from "@/components/layout/SiteFooter";
import SignOutButton from "@/components/auth/SignOutButton";
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
  
  let cartInitialCount = 0;

  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile) {
      userRole = profile.role;
    }
    if (profile?.role === 'butik') {
      const { count } = await supabase
        .from('shopping_list_items')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);
      cartInitialCount = count ?? 0;
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
        <nav className="sticky top-0 z-50 border-b border-anthracite-900/10 bg-white/72 backdrop-blur-2xl">
          <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
            <Link href="/" className="flex min-w-0 items-center gap-2.5 text-base font-semibold tracking-tight text-anthracite-900 sm:text-lg">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-500 text-white shadow-md">
                <Package className="h-4.5 w-4.5 shrink-0" strokeWidth={2} />
              </span>
              <span className="truncate">Demir Dev Studio</span>
              <span className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800 md:inline">
                B2B
              </span>
            </Link>
            <div className="w-full overflow-x-auto md:w-auto">
            <div className="flex min-w-max items-center gap-1.5 rounded-2xl border border-anthracite-200/80 bg-white/90 p-1 pb-1 shadow-md sm:gap-2 md:min-w-0 md:pb-1">
              <Link href="/katalog" className="flex h-9 items-center rounded-xl px-3 text-sm font-semibold text-anthracite-600 transition hover:bg-anthracite-100/80 hover:text-anthracite-900">
                Katalog
              </Link>
              <Link href="/toptanci-gor" className="flex h-9 items-center rounded-xl px-3 text-sm font-semibold text-anthracite-600 transition hover:bg-anthracite-100/80 hover:text-anthracite-900">
                Toptancılar
              </Link>
              <Link href="/yardim" className="flex h-9 items-center rounded-xl px-3 text-sm font-semibold text-anthracite-600 transition hover:bg-anthracite-100/80 hover:text-anthracite-900">
                Yardım
              </Link>
              {userRole === 'butik' && user ? (
                <>
                  <Link href="/favorites" className="flex h-9 items-center gap-1.5 rounded-xl px-3 text-sm font-medium text-rose-600 transition hover:bg-rose-50">
                    <Heart className="h-4 w-4 fill-current" strokeWidth={2} /> Favoriler
                  </Link>
                  <CartNavLink userId={user.id} initialCount={cartInitialCount} />
                  <Link href="/siparislerim" className="flex h-9 items-center rounded-xl px-3 text-sm font-medium text-anthracite-600 transition hover:bg-anthracite-100/80 hover:text-anthracite-900">
                    Siparişlerim
                  </Link>
                </>
              ) : null}
              
              {user ? (
                <div className="ml-1 flex flex-wrap items-center gap-2">
                  {userRole === 'admin' && (
                    <Link 
                      href="/admin" 
                      className="rounded-xl border border-emerald-200/80 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 transition hover:bg-emerald-100/80"
                    >
                      Yönetim
                    </Link>
                  )}
                  {userRole === 'toptanci' && (
                    <Link 
                      href="/toptanci" 
                      className="rounded-xl border border-emerald-200/80 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 transition hover:bg-emerald-100/80"
                    >
                      Toptancı paneli
                    </Link>
                  )}
                  
                  <Link
                    href="/hesap/sifre"
                    className="rounded-xl border border-anthracite-200 bg-white px-3 py-2 text-sm font-medium text-anthracite-600 transition hover:border-anthracite-300 hover:bg-anthracite-50"
                  >
                    Şifre
                  </Link>
                  <SignOutButton />
                </div>
              ) : (
                <Link href="/login" className="ml-1 flex h-9 items-center rounded-xl bg-gradient-to-r from-anthracite-900 to-anthracite-800 px-4 text-sm font-semibold text-white transition hover:from-anthracite-800 hover:to-anthracite-700">Giriş</Link>
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
