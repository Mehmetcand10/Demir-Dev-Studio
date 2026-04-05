import Link from "next/link";
import { ArrowRight, ShieldCheck, Gem, TrendingUp, Store, Package, Users, Maximize2 } from "lucide-react";

export default function Home() {
  return (
    <div className="flex w-full flex-col">
      <section className="relative overflow-hidden border-b border-anthracite-200/60 bg-white/40 px-4 py-16 sm:py-24 lg:py-28">
        <div className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-emerald-400/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-anthracite-400/10 blur-3xl" />

        <div className="relative mx-auto max-w-3xl text-center">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-anthracite-200/80 bg-white/80 px-3 py-1 text-xs font-medium text-anthracite-600 shadow-sm backdrop-blur-sm">
            <Gem className="h-3.5 w-3.5 text-emerald-600" strokeWidth={2} />
            B2B tekstil ağı
          </span>
          <h1 className="mb-5 text-3xl font-semibold leading-tight tracking-tight text-anthracite-900 sm:text-4xl lg:text-5xl">
            Butik ve toptancıyı güvenli, tek vitrinde buluşturur.
          </h1>
          <p className="mb-10 text-base leading-relaxed text-anthracite-600 sm:text-lg">
            Onaylı üyelik, net fiyatlar ve sipariş takibi. Stok ve ödeme süreçleri tek panelden yürür.
          </p>
          <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-anthracite-900 px-6 py-3.5 text-sm font-medium text-white shadow-sm transition hover:bg-anthracite-800"
            >
              Başvuru yap
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>
            <Link
              href="/katalog"
              className="inline-flex items-center justify-center rounded-xl border border-anthracite-200/90 bg-white px-6 py-3.5 text-sm font-medium text-anthracite-800 shadow-sm transition hover:bg-anthracite-50"
            >
              Kataloğu incele
            </Link>
          </div>
        </div>

        <div className="relative mx-auto mt-14 grid max-w-5xl grid-cols-2 gap-3 border-t border-anthracite-100/90 pt-10 sm:grid-cols-4 sm:gap-4">
          <div className="flex items-center gap-2 text-xs font-medium text-anthracite-500 sm:text-sm">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" strokeWidth={2} />
            Güvenli ödeme akışı
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-anthracite-500 sm:text-sm">
            <Store className="h-4 w-4 shrink-0 text-emerald-600" strokeWidth={2} />
            Onaylı butik ağı
          </div>
          <div className="hidden items-center gap-2 text-sm font-medium text-anthracite-500 sm:flex">
            <Package className="h-4 w-4 shrink-0 text-emerald-600" strokeWidth={2} />
            Net MOQ bilgisi
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-anthracite-500 sm:text-sm">
            <TrendingUp className="h-4 w-4 shrink-0 text-emerald-600" strokeWidth={2} />
            Şeffaf komisyon
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center sm:mb-14">
            <h2 className="mb-3 text-2xl font-semibold tracking-tight text-anthracite-900 sm:text-3xl">
              Nasıl çalışır?
            </h2>
            <p className="mx-auto max-w-xl text-sm text-anthracite-600 sm:text-base">
              Roller net; ürün yayını, sipariş ve kargo adımları tek düzen içinde.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3 md:gap-6">
            <div className="rounded-2xl border border-anthracite-200/70 bg-white/80 p-6 shadow-sm transition hover:border-anthracite-300/80 hover:shadow-md sm:p-8">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-anthracite-900 text-white shadow-sm">
                <Package className="h-5 w-5" strokeWidth={2} />
              </div>
              <p className="mb-2 text-xs font-medium text-anthracite-400">1</p>
              <h3 className="mb-2 text-lg font-semibold text-anthracite-900">Toptancı vitrine ekler</h3>
              <p className="text-sm leading-relaxed text-anthracite-600">
                Ürün ve stok bilgileri panelden girilir; yayın ve fiyatlandırma merkez onayıyla netleşir.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-6 shadow-sm transition hover:shadow-md sm:p-8">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                <ShieldCheck className="h-5 w-5" strokeWidth={2} />
              </div>
              <p className="mb-2 text-xs font-medium text-emerald-700/80">2</p>
              <h3 className="mb-2 text-lg font-semibold text-emerald-950">Merkez denetler</h3>
              <p className="text-sm leading-relaxed text-emerald-900/80">
                Kalite ve marj çizgisi kontrol edilir; ödeme teyidi sonrası sipariş üretim ve kargoya bağlanır.
              </p>
            </div>

            <div className="rounded-2xl border border-anthracite-200/70 bg-white/80 p-6 shadow-sm transition hover:border-anthracite-300/80 hover:shadow-md sm:p-8">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-anthracite-900 text-white shadow-sm">
                <Store className="h-5 w-5" strokeWidth={2} />
              </div>
              <p className="mb-2 text-xs font-medium text-anthracite-400">3</p>
              <h3 className="mb-2 text-lg font-semibold text-anthracite-900">Butik sipariş verir</h3>
              <p className="text-sm leading-relaxed text-anthracite-600">
                Onaylı butikler vitrindeki fiyatlarla seri sipariş oluşturur; teslimat ve durum panelden izlenir.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-anthracite-200/60 bg-anthracite-900 px-4 py-16 text-white sm:py-20">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 lg:flex-row lg:items-start lg:gap-16">
          <div className="flex-1">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-emerald-400/90">Neden bu ağ?</p>
            <h2 className="mb-5 text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
              Riski azaltan, sade bir iş modeli
            </h2>
            <p className="mb-8 text-sm leading-relaxed text-anthracite-400 sm:text-base">
              Kapalı devre üyelik ile fiyatlar yalnızca onaylı işletmelere açılır; sipariş ve ödeme adımları tek çatı altında toplanır.
            </p>
            <ul className="space-y-5">
              <li className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/5">
                  <Maximize2 className="h-4 w-4 text-emerald-400" strokeWidth={2} />
                </div>
                <div>
                  <h4 className="mb-1 text-sm font-semibold sm:text-base">Seçilmiş vitrin</h4>
                  <p className="text-sm text-anthracite-400">
                    Yayına alınan ürünler marj ve uygunluk kontrolünden geçer.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/5">
                  <Users className="h-4 w-4 text-emerald-400" strokeWidth={2} />
                </div>
                <div>
                  <h4 className="mb-1 text-sm font-semibold sm:text-base">Üyelik kontrolü</h4>
                  <p className="text-sm text-anthracite-400">
                    Toptancı fiyatları yalnızca onaylı butik hesaplarına gösterilir.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <div className="w-full max-w-md flex-1 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-sm sm:p-6">
            <div className="rounded-xl border border-white/10 bg-anthracite-950/50 p-5">
              <span className="mb-3 inline-block rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-medium text-emerald-300">
                Örnek durum
              </span>
              <h3 className="mb-1 text-lg font-semibold">Sipariş onaylandı</h3>
              <p className="mb-4 text-xs text-anthracite-500">Koleksiyon sevkiyatı</p>
              <div className="h-1.5 overflow-hidden rounded-full bg-anthracite-800">
                <div className="h-full w-2/3 rounded-full bg-emerald-500" />
              </div>
              <p className="mt-2 text-right text-[10px] text-anthracite-500">Hazırlanıyor</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 text-center sm:py-20">
        <div className="mx-auto max-w-lg">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-anthracite-200/80 bg-white shadow-sm">
            <Gem className="h-7 w-7 text-anthracite-700" strokeWidth={1.5} />
          </div>
          <h2 className="mb-3 text-2xl font-semibold tracking-tight text-anthracite-900 sm:text-3xl">
            Davet ve onaylı üyelik
          </h2>
          <p className="mb-8 text-sm text-anthracite-600 sm:text-base">
            Başvurunuz incelenir; e-posta doğrulamasından sonra hesabınız açılır.
          </p>
          <Link
            href="/register"
            className="inline-flex rounded-xl bg-emerald-600 px-8 py-3.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700"
          >
            Hesap oluştur
          </Link>
        </div>
      </section>
    </div>
  );
}
