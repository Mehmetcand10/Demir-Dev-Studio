"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BadgeCheck, CheckCircle2, ShieldCheck, Sparkles, Store, Truck, Users } from "lucide-react";

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
        <section className="px-4 pb-8 pt-8 sm:px-6 sm:pt-10 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-12">
            <div className="premium-shell relative overflow-hidden p-7 lg:col-span-8 lg:p-10">
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-200/45 blur-3xl" />
              <span className="badge-trust mb-4">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" /> Doğrudan toptancıdan satın alma
              </span>
              <h1 className="text-4xl font-semibold leading-tight tracking-tight text-anthracite-950 sm:text-5xl">
                Buy directly from wholesalers
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-anthracite-700 sm:text-lg">
                Better prices, no middleman, secure process. Doğrulanmış tedarikçilerle butik siparişlerini tek
                panelden yönetin.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/katalog" className="btn-premium-dark min-h-[48px] px-8">
                  View Wholesale Prices
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/register" className="btn-premium-light min-h-[48px] px-8">
                  Ticari hesap aç
                </Link>
              </div>
              <div className="mt-8 grid gap-2.5 sm:grid-cols-3">
                <div className="premium-soft px-3 py-2 text-xs font-semibold text-anthracite-700">Guvenli odeme sureci</div>
                <div className="premium-soft px-3 py-2 text-xs font-semibold text-anthracite-700">Dogrulanmis tedarikci</div>
                <div className="premium-soft px-3 py-2 text-xs font-semibold text-anthracite-700">Platform garantisi</div>
              </div>
            </div>

            <div className="premium-shell lg:col-span-4">
              <div className="relative h-full min-h-[300px] overflow-hidden rounded-3xl p-5 sm:p-6">
                <Image
                  src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1400&auto=format&fit=crop"
                  alt=""
                  fill
                  className="object-cover opacity-25"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  priority
                />
                <div className="relative z-10 flex h-full flex-col justify-between">
                  <div className="premium-chip w-max bg-white/85">Canli Ag</div>
                  <div className="rounded-2xl border border-anthracite-200/80 bg-white/90 p-4 backdrop-blur">
                    <p className="text-xs font-semibold uppercase tracking-wider text-anthracite-500">Bugun</p>
                    <p className="mt-2 text-lg font-semibold text-anthracite-900">38 butik bugun siparis acti</p>
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
              { icon: ShieldCheck, title: "Guvenli odeme", body: "Siparis, dekont ve onay adimlari yonetim kontrolunde tamamlanir." },
              { icon: Store, title: "Dogrulanmis tedarikciler", body: "Sadece onayli tedarikcilerle calisin; rastgele satıcı riski yok." },
              { icon: Truck, title: "Operasyon takibi", body: "Hazirlik, kargo ve teslim sureci tek siparis akisinda izlenir." },
              { icon: Users, title: "Platform garantisi", body: "Uyusmazlik kaydi ve yonetim mudahalesiyle ticaret guvencesi saglanir." },
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
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Platform yaklasimi</p>
                <h3 className="mt-3 text-3xl font-semibold leading-tight text-anthracite-900 sm:text-4xl">
                  Pazar yeri degil,
                  <br />
                  isletmeler arasi siparis altyapisi.
                </h3>
                <p className="mt-5 max-w-xl text-base leading-relaxed text-anthracite-700">
                  Karmaasik gorunum yerine net ticaret kararlarini hizlandiran bir deneyim sunar. Toptanci urun ekler,
                  butik siparis verir, admin odeme ve operasyonu guvenceye alir.
                </p>
              </div>
              <ul className="space-y-3">
                {[
                  "Urun + stok + MOQ yonetimi tek panelde",
                  "Butik siparislerinde canli fiyat ve toplam tutar",
                  "Siparis notu ve dekont ile net iletisim",
                  "Takip edilen tedarikciden hedefli bildirim",
                  "Yonetim panelinde uctan uca kontrol",
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
              <BadgeCheck className="h-3.5 w-3.5" /> {city} merkezli premium ag
            </p>
            <h3 className="mt-3 text-3xl font-semibold tracking-tight text-anthracite-900 sm:text-4xl">
              Platform guarantee + verified network + net commerce flow
            </h3>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-anthracite-700">
              Bu platform; fiyati, guveni ve operasyon hizini ayni ekranda toplar. Butikler daha dogru maliyetle siparis
              verir, toptancilar daha duzenli satis akisi yakalar.
            </p>
            <div className="mt-8 flex justify-center">
              <Link href="/register" className="btn-premium-emerald min-h-[50px] px-10 text-sm font-bold">
                Hemen katil
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
