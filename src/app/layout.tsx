import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import { SiteBackground } from "@/components/layout/SiteBackground";
import SiteFooter from "@/components/layout/SiteFooter";
import { TrustBar } from "@/components/layout/TrustBar";
import { MarketplaceHeaderWrapper } from "@/components/layout/MarketplaceHeaderWrapper";
import { createClient } from "@/utils/supabase/server";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "B2B Tekstil Ağı | Demir Dev Studio",
  description: "Ankara'nın En Hızlı Butik Tedarik Ağı",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#ffffff",
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
  const sessionUser = user
    ? { id: user.id, email: user.email ?? undefined }
    : null;

  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile) {
      userRole = profile.role;
    }
    if (profile?.role === "butik") {
      const { count } = await supabase
        .from("shopping_list_items")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);
      cartInitialCount = count ?? 0;
    }
  }

  return (
    <html lang="tr">
      <body className={`${inter.className} min-h-screen flex flex-col overflow-x-hidden bg-white antialiased`}>
        <div className="no-print">
        <AnnouncementBanner />
        {/* Dev: eski PWA service worker bazi cihazlarda CSS chunk yuklemesini bozabiliyor — tum kayitlar silinir. Prod: sw.js yuklenir. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              process.env.NODE_ENV === "development"
                ? `
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                window.addEventListener('load', function () {
                  navigator.serviceWorker.getRegistrations().then(function (regs) {
                    regs.forEach(function (r) { r.unregister(); });
                  });
                });
              }
            `
                : `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
        <MarketplaceHeaderWrapper user={sessionUser} userRole={userRole} cartInitialCount={cartInitialCount} />
        </div>

        <main className="flex flex-grow flex-col">
          <SiteBackground>{children}</SiteBackground>
        </main>

        <div className="no-print">
        <TrustBar />
        <SiteFooter />
        </div>
      </body>
    </html>
  );
}
