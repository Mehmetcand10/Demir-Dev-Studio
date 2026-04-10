"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Gem, ShieldCheck, Store, Truck, Users } from "lucide-react";

type Props = {
  city: string;
  approvedBoutiques: string | null;
  approvedWholesalers: string | null;
};

const SPLASH_MESSAGE = "Hoş geldiniz. Demir Dev Studio ile güvenli ve düzenli B2B ticarete başlıyorsunuz.";
const SPLASH_SEEN_KEY = "demirdev_home_splash_seen_v1";

export default function HomeLandingExperience({
  city,
  approvedBoutiques,
  approvedWholesalers,
}: Props) {
  const [showSplash, setShowSplash] = useState(false);
  const [chars, setChars] = useState(0);
  const activeLine = useMemo(() => SPLASH_MESSAGE, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = window.sessionStorage.getItem(SPLASH_SEEN_KEY) === "1";
    if (seen) {
      setShowSplash(false);
      return;
    }
    setShowSplash(true);
    window.sessionStorage.setItem(SPLASH_SEEN_KEY, "1");
  }, []);

  useEffect(() => {
    if (!showSplash) return;
    setChars(0);
    const typeTimer = setInterval(() => {
      setChars((prev) => (prev < activeLine.length ? prev + 1 : prev));
    }, 65);

    return () => {
      clearInterval(typeTimer);
    };
  }, [activeLine, showSplash]);

  useEffect(() => {
    if (!showSplash) return;
    if (chars < activeLine.length) return;
    const splashTimer = setTimeout(() => setShowSplash(false), 1400);
    return () => clearTimeout(splashTimer);
  }, [showSplash, chars, activeLine.length]);

  return (
    <div className="w-full">
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-700 ${
          showSplash ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="relative flex h-full items-center justify-center overflow-hidden bg-[#121513]">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-emerald-300/15 blur-3xl" />
          <div className="px-6 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">
              Demir Dev Studio
            </p>
            <h1 className="mx-auto max-w-4xl text-2xl font-semibold leading-relaxed text-white sm:text-4xl">
              {activeLine.slice(0, chars)}
              <span className="ml-1 inline-block h-8 w-[3px] animate-pulse bg-emerald-400 align-middle sm:h-11" />
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-zinc-300 sm:text-base">
              Butik ve toptancıyı güvenli sipariş akışında buluşturan yeni nesil B2B deneyimine geçiş yapılıyor...
            </p>
          </div>
        </div>
      </div>

      <main className="flex w-full flex-col">
        <section className="relative isolate overflow-hidden border-b border-neutral-200 bg-[#f7f7f6]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.2),_transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(15,23,42,0.12),_transparent_40%)]" />
          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2 lg:items-center lg:py-24">
            <div className="text-center lg:text-left">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-700 sm:text-xs">
                <Gem className="h-3.5 w-3.5 text-emerald-600" />
                Türkiye B2B Tekstil Ağı
              </span>
              <h2 className="text-4xl font-semibold leading-tight tracking-tight text-neutral-950 sm:text-5xl lg:text-6xl">
                İlk izlenimde güven.
                <br />
                <span className="text-neutral-700">Her adımda netlik.</span>
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-neutral-800 sm:text-lg lg:mx-0">
                Demir Dev Studio, butiklerin onaylı toptancılardan doğru ürünleri hızlıca bulmasını; toptancıların da
                doğru müşteriye kontrollü satış yapmasını sağlar. Fiyat, MOQ, beden dağılımı ve kargo süreci tek ekranda,
                anlaşılır ve profesyonel.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Link
                  href="/register"
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-neutral-900 px-8 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-neutral-800"
                >
                  Hemen başvur
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/katalog"
                  className="inline-flex min-h-[48px] items-center justify-center rounded-2xl border-2 border-neutral-300 bg-white px-8 py-3.5 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
                >
                  Vitrini incele
                </Link>
              </div>
            </div>
            <div className="relative min-h-[300px] sm:min-h-[360px]">
                <div className="absolute inset-0 overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-900 shadow-xl">
                <Image
                  src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1400&auto=format&fit=crop"
                  alt=""
                  fill
                  className="object-cover opacity-80"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/10" />
              </div>
              <div className="relative z-10 flex h-full items-end p-5 sm:p-7">
                <div className="w-full rounded-2xl border border-zinc-500 bg-neutral-900/95 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-400">Canlı sipariş akışı</p>
                  <p className="mt-2 text-base font-bold text-white sm:text-lg">
                    Onaylı işletmeler için kapalı devre fiyatlandırma ve güvenli süreç
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-14 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <h3 className="text-center text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
              Neden işletmeler bizi seçiyor?
            </h3>
            <p className="mx-auto mt-3 max-w-2xl text-center text-base text-neutral-700">
              İlk günden anlaşılır bir yapı: teknik karmaşa yok, kaybolan metin yok, doğrudan ticarete odaklanan sade ama güçlü deneyim.
            </p>
            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: ShieldCheck, title: "Güvenli erişim", body: "Fiyatlar yalnızca onaylı hesaplara görünür." },
                { icon: Store, title: "Doğru eşleşme", body: "Butik ve toptancı aynı vitrinde net kriterle buluşur." },
                { icon: Truck, title: "Takip kolaylığı", body: "Siparişten kargoya kadar adımlar tek panelde." },
                { icon: Users, title: "Kontrollü büyüme", body: "Onay ve operasyon süreçleri düzenli ilerler." },
              ].map((card) => (
                <article key={card.title} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                  <card.icon className="h-6 w-6 text-emerald-700" />
                  <h4 className="mt-4 text-lg font-bold text-neutral-950">{card.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-700">{card.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-neutral-200 bg-neutral-100 px-4 py-14 sm:px-6 sm:py-18">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">Kendimizi nasıl anlatıyoruz?</p>
              <h3 className="mt-3 text-3xl font-semibold leading-tight text-neutral-950 sm:text-4xl">
                Demir Dev Studio, dijital bir pazar değil;
                <br />
                işletmeler arası ticaret altyapısıdır.
              </h3>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-neutral-700">
                Hedefimiz, toptan tekstilde dağınık iletişim ve kontrolsüz sipariş yerine güvenli, takip edilebilir ve hızlı bir sistem sunmak.
                Her ekranı bu yüzden açık, sade ve okunur tasarlıyoruz.
              </p>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <ul className="space-y-4">
                {[
                  "Onaylı üyelik modeli ile güvenli ağ",
                  "MOQ ve stok kurallarıyla net sipariş disiplini",
                  "Ürün, ödeme ve kargo adımlarında tek merkez yönetim",
                  "Mobil ve masaüstünde yüksek okunurluk odaklı arayüz",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-neutral-700">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-white px-4 py-14 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-5xl rounded-3xl border border-neutral-200 bg-gradient-to-b from-emerald-50 to-white p-7 text-center shadow-sm sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">{city} merkezli büyüme</p>
            <h3 className="mt-3 text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">Ağa dahil olun, doğru müşteriyle buluşun</h3>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-neutral-700">
              {approvedBoutiques || approvedWholesalers
                ? `Onaylı hesap sayısı artmaya devam ediyor. Butik: ${approvedBoutiques || "Davetli kayıt"} · Toptancı: ${approvedWholesalers || "Seçilmiş ortaklar"}`
                : "Onaylı butik ve toptancı ağı adım adım büyüyor. Her yeni üyeyi kalite ve operasyon uygunluğuna göre dahil ediyoruz."}
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href="/register"
                className="inline-flex min-h-[50px] items-center justify-center rounded-2xl bg-emerald-600 px-10 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-emerald-500"
              >
                Ücretsiz ticari hesap oluştur
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
