import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ShieldCheck,
  Gem,
  TrendingUp,
  Store,
  Package,
  Users,
  Sparkles,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex w-full flex-col">
      {/* —— Hero: güçlü ilk izlenim + sağda vitrin görseli —— */}
      <section className="relative overflow-hidden border-b border-anthracite-200/50">
        <div
          className="pointer-events-none absolute inset-0 bg-[#f7f6f4]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-1/4 top-0 h-[min(80vw,520px)] w-[min(80vw,520px)] rounded-full bg-emerald-400/20 blur-[100px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-1/4 bottom-0 h-[min(70vw,440px)] w-[min(70vw,440px)] rounded-full bg-anthracite-900/15 blur-[90px]"
          aria-hidden
        />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:gap-12 sm:px-6 sm:py-20 lg:grid-cols-2 lg:items-center lg:gap-14 lg:py-24 lg:pl-8 lg:pr-6 xl:pl-10">
          <div className="text-center lg:text-left">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-anthracite-200/90 bg-white/90 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-anthracite-700 shadow-sm backdrop-blur-sm sm:text-xs">
              <Gem className="h-3.5 w-3.5 text-emerald-600" strokeWidth={2} />
              Yeni nesil B2B tekstil
            </span>

            <h1 className="mb-5 text-[2rem] font-bold leading-[1.12] tracking-tight text-anthracite-950 sm:text-5xl sm:leading-[1.08] lg:text-[3.25rem] xl:text-6xl">
              Modanın tedarik
              <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-anthracite-950 via-emerald-800 to-emerald-600 bg-clip-text text-transparent">
                {" "}
                tek vitrinde.
              </span>
            </h1>

            <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-anthracite-700 sm:text-lg lg:mx-0">
              Onaylı butikler ve üreticileri aracısız buluşturur; net fiyat, MOQ ve sipariş takibi tek
              platformda. İlk günden profesyonel bir B2B deneyimi.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link
                href="/register"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border-2 border-zinc-900 bg-zinc-900 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/30 transition hover:border-black hover:bg-black hover:text-white active:scale-[0.99]"
              >
                Ağa başvur
                <ArrowRight className="h-4 w-4 text-white" strokeWidth={2} />
              </Link>
              <Link
                href="/katalog"
                className="inline-flex min-h-[48px] items-center justify-center rounded-2xl border-2 border-anthracite-200 bg-white px-7 py-3.5 text-sm font-semibold text-anthracite-900 shadow-sm transition hover:border-anthracite-300 hover:bg-anthracite-50/80"
              >
                Koleksiyonu keşfet
              </Link>
            </div>

            <div className="mx-auto mt-10 grid max-w-md grid-cols-2 gap-3 sm:max-w-none sm:grid-cols-4 lg:mx-0 lg:mt-12">
              {[
                { icon: ShieldCheck, label: "Ödeme güvencesi" },
                { icon: Store, label: "Seçkin butik ağı" },
                { icon: Package, label: "Net stok & MOQ" },
                { icon: TrendingUp, label: "Şeffaf komisyon" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-xl border border-anthracite-100/90 bg-white/70 px-3 py-2.5 text-left shadow-sm backdrop-blur-sm"
                >
                  <Icon className="h-4 w-4 shrink-0 text-emerald-600" strokeWidth={2} />
                  <span className="text-[11px] font-medium leading-tight text-anthracite-600 sm:text-xs">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Görsel kolon: atmosfer + cam kartlar */}
          <div className="relative min-h-[280px] sm:min-h-[360px] lg:min-h-[440px]">
            <div className="absolute inset-0 overflow-hidden rounded-[1.75rem] border border-anthracite-200/60 bg-anthracite-900 shadow-2xl shadow-anthracite-900/25 sm:rounded-[2rem]">
              <Image
                src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1200&auto=format&fit=crop"
                alt=""
                fill
                className="object-cover opacity-90"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-anthracite-950 via-anthracite-950/55 to-anthracite-950/20" />
              <div className="absolute inset-0 bg-gradient-to-r from-anthracite-950/80 to-transparent lg:from-anthracite-950/85" />
            </div>

            <div className="relative flex h-full min-h-[inherit] flex-col justify-end p-4 sm:p-6 lg:justify-center lg:p-8">
              <div className="mb-3 max-w-[16rem] rounded-2xl border border-white/25 bg-black/70 p-4 shadow-xl shadow-black/40 backdrop-blur-xl sm:max-w-xs lg:mb-4">
                <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                  <Sparkles className="h-3 w-3" strokeWidth={2} />
                  Canlı vitrin
                </span>
                <p className="text-sm font-bold leading-snug text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]">
                  Yeni sezon serileri eklendi
                </p>
                <p className="mt-1.5 text-xs font-medium leading-relaxed text-white/95 [text-shadow:0_1px_2px_rgba(0,0,0,0.85)]">
                  Onaylı üreticilerden doğrudan B2B fiyat
                </p>
              </div>
              <div className="ml-auto max-w-[13rem] rounded-2xl border border-white/20 bg-black/75 p-3.5 shadow-xl shadow-black/40 backdrop-blur-xl sm:max-w-[14rem]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                  Sipariş akışı
                </p>
                <p className="mt-1 text-lg font-bold tabular-nums text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]">
                  Hazırlanıyor
                </p>
                <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-white/20">
                  <div className="h-full w-[55%] rounded-full bg-emerald-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* —— Nasıl çalışır: büyük adım kartları —— */}
      <section className="px-4 py-16 sm:py-20 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center sm:mb-16">
            <h2 className="mb-3 text-3xl font-bold tracking-tight text-anthracite-950 sm:text-4xl">
              Sistem nasıl işler?
            </h2>
            <p className="mx-auto max-w-2xl text-base text-anthracite-600">
              Karmaşık toptan süreçlerini tek düzene indiriyoruz: üretici ekler, merkez güvenceye alır, butik
              satın alır.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 md:gap-5 lg:gap-8">
            {[
              {
                n: "01",
                icon: Package,
                title: "Toptancı üretir & yükler",
                body: "Panelden model, stok ve seri bilgisi girilir; yayın için merkez onayına sunulur.",
                className:
                  "border-anthracite-200/80 bg-white hover:border-anthracite-300 hover:shadow-lg",
                iconBg: "bg-anthracite-950 text-white",
              },
              {
                n: "02",
                icon: ShieldCheck,
                title: "Demir Dev denetler",
                body: "Marj, kalite ve uygunluk kontrolü; ödeme teyidi ile sipariş güvenceye alınır.",
                className:
                  "border-emerald-200/90 bg-gradient-to-b from-emerald-50/90 to-white shadow-md shadow-emerald-900/5 ring-1 ring-emerald-100/80 md:-translate-y-1 md:scale-[1.02]",
                iconBg: "bg-emerald-600 text-white",
              },
              {
                n: "03",
                icon: Store,
                title: "Butik sipariş verir",
                body: "Onaylı hesaplar vitrindeki net fiyatlarla seri sipariş oluşturur; kargoyu panelden izler.",
                className:
                  "border-anthracite-200/80 bg-white hover:border-anthracite-300 hover:shadow-lg",
                iconBg: "bg-anthracite-950 text-white",
              },
            ].map((step) => (
              <div
                key={step.n}
                className={`relative overflow-hidden rounded-[1.75rem] border-2 p-7 transition-all duration-300 sm:p-8 ${step.className}`}
              >
                <span className="absolute right-6 top-6 text-5xl font-bold tabular-nums text-anthracite-100 sm:text-6xl lg:text-7xl">
                  {step.n}
                </span>
                <div
                  className={`relative z-10 mb-5 flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg ${step.iconBg}`}
                >
                  <step.icon className="h-6 w-6" strokeWidth={2} />
                </div>
                <h3 className="relative z-10 mb-3 text-xl font-bold text-anthracite-950">{step.title}</h3>
                <p className="relative z-10 text-sm leading-relaxed text-anthracite-600">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* —— Koyu bant: güven + görsel —— */}
      <section className="relative overflow-hidden bg-anthracite-950 text-white">
        <div className="absolute inset-0 opacity-25">
          <Image
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1400&auto=format&fit=crop"
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
        {/* Metin tarafını okunaklı tutan koyu katman */}
        <div className="absolute inset-0 bg-gradient-to-br from-anthracite-950 via-anthracite-950 to-anthracite-900/98" />
        <div className="absolute inset-0 bg-anthracite-950/80 sm:bg-gradient-to-r sm:from-anthracite-950 sm:via-anthracite-950/92 sm:to-anthracite-950/75" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:gap-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:items-center lg:py-24">
          <div className="rounded-2xl border border-white/10 bg-anthracite-950/60 p-6 shadow-lg backdrop-blur-sm sm:p-8 lg:border-white/5 lg:bg-anthracite-950/40">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
              Neden bu platform?
            </p>
            <h2 className="mb-6 text-3xl font-bold leading-tight tracking-tight text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.45)] sm:text-4xl lg:text-[2.35rem]">
              Sıfır stres.
              <br />
              <span className="text-white">Maksimum şeffaflık.</span>
            </h2>
            <p className="mb-10 max-w-lg text-base leading-relaxed text-zinc-200">
              Butik için günlerce toptancı aramak; üretici için müşteri kovalamak bitti. Tek kapı, net kurallar,
              ölçülebilir sipariş.
            </p>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-950/50">
                  <Users className="h-5 w-5 text-emerald-300" strokeWidth={2} />
                </div>
                <div>
                  <h4 className="mb-1 font-semibold text-white">Kapalı devre üyelik</h4>
                  <p className="text-sm leading-relaxed text-zinc-300">
                    Fiyatlar yalnızca onaylı işletmelere açılır; perakende sızması engellenir.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-950/50">
                  <Package className="h-5 w-5 text-emerald-300" strokeWidth={2} />
                </div>
                <div>
                  <h4 className="mb-1 font-semibold text-white">Seçilmiş vitrin</h4>
                  <p className="text-sm leading-relaxed text-zinc-300">
                    Yayına alınan her ürün marj ve operasyon uygunluğundan geçer.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="rounded-[1.75rem] border border-white/15 bg-black/35 p-4 shadow-2xl backdrop-blur-md sm:p-5">
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/50">
                <div className="relative aspect-[4/5] max-h-[340px] sm:max-h-[400px]">
                  <Image
                    src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop"
                    alt=""
                    fill
                    className="object-cover opacity-85"
                    sizes="(max-width: 1024px) 100vw, 400px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-5 sm:right-5">
                    <div className="rounded-xl border border-white/15 bg-black/80 px-4 py-3.5 backdrop-blur-md">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                        Örnek sipariş
                      </span>
                      <p className="mt-1 font-bold text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.8)]">
                        Sezon serisi · Seri fiyat
                      </p>
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/20">
                        <div className="h-full w-2/3 rounded-full bg-emerald-400" />
                      </div>
                      <p className="mt-2 text-right text-[11px] font-medium text-zinc-200">Kargoya hazırlanıyor</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between rounded-xl border border-white/15 bg-black/50 px-4 py-3.5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Ağ kasası</p>
                  <p className="text-sm font-bold text-white">Net marj görünürlüğü</p>
                </div>
                <ShieldCheck className="h-8 w-8 shrink-0 text-emerald-300" strokeWidth={1.5} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* —— Kapanış CTA —— */}
      <section className="border-t border-anthracite-200/60 bg-gradient-to-b from-white to-anthracite-50/50 px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-anthracite-200/80 bg-white shadow-md">
            <Gem className="h-8 w-8 text-anthracite-800" strokeWidth={1.5} />
          </div>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-anthracite-950 sm:text-4xl">
            Ekosistemde yerinizi alın
          </h2>
          <p className="mb-10 text-base text-anthracite-600 sm:text-lg">
            Başvurunuzu iletin, e-postanızı doğrulayın; onay sonrası tam vitrine erişin.
          </p>
          <Link
            href="/register"
            className="inline-flex min-h-[52px] items-center justify-center rounded-2xl bg-emerald-600 px-10 py-3.5 text-base font-semibold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-500 active:scale-[0.99]"
          >
            Ücretsiz ticari hesap oluştur
          </Link>
        </div>
      </section>
    </div>
  );
}
