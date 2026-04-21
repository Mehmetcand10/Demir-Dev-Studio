"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  Gem,
  ShieldCheck,
  Store,
  Truck,
  Users,
  Sparkles,
  BadgeCheck,
} from "lucide-react";

type Props = {
  city: string;
  approvedBoutiques: string | null;
  approvedWholesalers: string | null;
};

export default function HomeLandingExperience({
  city,
  approvedBoutiques,
  approvedWholesalers,
}: Props) {
  return (
    <div className="w-full">
      <main className="flex w-full flex-col">
        <section className="px-4 pb-10 pt-8 sm:px-6 sm:pt-10 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-12">
            <div className="premium-shell relative overflow-hidden p-7 lg:col-span-8 lg:p-10">
              <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-200/40 blur-3xl" />
              <span className="premium-chip mb-4 inline-flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" /> Premium B2B Moda Platformu
              </span>
              <h1 className="text-4xl font-semibold leading-tight tracking-tight text-anthracite-950 sm:text-5xl">
                Toptancıdan butiğe
                <br />
                <span className="text-anthracite-600">daha şık, daha net sipariş akışı.</span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-anthracite-700 sm:text-lg">
                Demir Dev Studio, toptancının vitriniyle butiğin satın alma sürecini tek panelde buluşturur.
                Ürün, MOQ, beden, ödeme ve kargo adımları premium bir deneyimle yönetilir.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/register"
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-anthracite-900 px-8 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-anthracite-800"
                >
                  Ticari hesap aç
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/katalog"
                  className="inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-anthracite-300 bg-white px-8 py-3.5 text-sm font-semibold text-anthracite-900 transition hover:bg-anthracite-50"
                >
                  Kataloga gir
                </Link>
              </div>
            </div>

            <div className="premium-shell lg:col-span-4">
              <div className="relative h-full min-h-[280px] overflow-hidden rounded-3xl p-5 sm:p-6">
                <Image
                  src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1400&auto=format&fit=crop"
                  alt=""
                  fill
                  className="object-cover opacity-25"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  priority
                />
                <div className="relative z-10 flex h-full flex-col justify-between">
                  <div className="premium-chip w-max bg-white/80">Canlı Ağ</div>
                  <div className="rounded-2xl border border-anthracite-200/80 bg-white/90 p-4 backdrop-blur">
                    <p className="text-xs font-semibold uppercase tracking-wider text-anthracite-500">Güncel durum</p>
                    <p className="mt-2 text-lg font-semibold text-anthracite-900">Onaylı butik ve tedarikçi trafiği aktif</p>
                    <p className="mt-2 text-sm text-anthracite-600">
                      {approvedBoutiques || approvedWholesalers
                        ? `Butik: ${approvedBoutiques || "Aktif"} · Toptancı: ${approvedWholesalers || "Aktif"}`
                        : `${city} merkezli, Türkiye geneli büyüyen ağ`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 pb-10 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { icon: ShieldCheck, title: "Onaylı ticari erişim", body: "Fiyatlar ve sipariş adımları yalnızca doğrulanmış işletmelerde görünür." },
              { icon: Store, title: "Butik odaklı vitrin", body: "Kumaş, fiyat ve kategori filtreleriyle doğru ürüne hızlı erişim." },
              { icon: Truck, title: "Net operasyon", body: "Ödeme, dekont, hazırlık ve kargo aynı sipariş hattında izlenir." },
              { icon: Users, title: "Sürdürülebilir B2B büyüme", body: "Tedarikçi-butik ilişkisi takip mekanizmasıyla kalıcı hale gelir." },
            ].map((card) => (
              <article key={card.title} className="premium-shell p-6">
                <card.icon className="h-6 w-6 text-emerald-700" />
                <h2 className="mt-4 text-lg font-semibold text-anthracite-900">{card.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-anthracite-600">{card.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="px-4 pb-12 sm:px-6 lg:px-8">
          <div className="premium-shell mx-auto max-w-7xl p-7 sm:p-10">
            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Platform yaklaşımı</p>
                <h3 className="mt-3 text-3xl font-semibold leading-tight text-anthracite-900 sm:text-4xl">
                  Pazar yeri değil,
                  <br />
                  işletmeler arası düzenli satış altyapısı.
                </h3>
                <p className="mt-5 max-w-xl text-base leading-relaxed text-anthracite-700">
                  Karmaşık görünüm yerine güçlü okunurluk, gereksiz animasyon yerine dönüşüm odaklı yapı.
                  Toptancı ürün ekler, butik sipariş verir; sistem operasyonu kontrol eder.
                </p>
              </div>
              <ul className="space-y-3">
                {[
                  "Ürün ve stok yönetimi tek panelde",
                  "MOQ + mağaza min. adet kuralları",
                  "Sipariş notu ve dekont ile net iletişim",
                  "Takip edilen tedarikçiden hedefli bildirim",
                  "Yönetim panelinde uçtan uca kontrol",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 rounded-xl border border-anthracite-200/80 bg-anthracite-50/60 px-4 py-3 text-sm text-anthracite-700">
                    <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-emerald-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="px-4 pb-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/80 to-white p-8 text-center shadow-sm sm:p-11">
            <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
              <BadgeCheck className="h-3.5 w-3.5" /> {city} merkezli premium ağ
            </p>
            <h3 className="mt-3 text-3xl font-semibold tracking-tight text-anthracite-900 sm:text-4xl">
              Butik ve toptancı için daha prestijli dijital vitrin
            </h3>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-anthracite-700">
              Tasarım dili tamamen yenilendi. Şimdi aynı kaliteyi tüm panel sayfalarına yayıp markayı tek bir premium kimliğe taşıyoruz.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href="/register"
                className="inline-flex min-h-[50px] items-center justify-center rounded-2xl bg-emerald-600 px-10 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-emerald-500"
              >
                Hemen katıl
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
