import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  UserCheck,
  ShoppingBag,
  Truck,
  Wallet,
  Bell,
  Package,
  CircleHelp,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Yardım ve süreçler | Demir Dev Studio",
  description:
    "Butik ve toptancılar için sipariş, ödeme, kargo ve panel kullanımı özeti.",
};

const stepsButik = [
  "Kayıt olun, e-postayı doğrulayın; yönetim hesabınızı onaylar.",
  "Onay sonrası katalogda fiyatları ve MOQ’yu görürsünüz.",
  "Ürün sayfasından beden ve adet seçip sipariş oluşturursunuz; ödeme talimatı için WhatsApp akışı açılır.",
  "Ödeme yönetim tarafından teyit edilince sipariş üreticiye düşer; hazırlık ve kargo aşamalarını Siparişlerim’den izlersiniz.",
  "Kargoda iken verilen takip numarasını aynı ekranda görürsünüz.",
];

const stepsToptanci = [
  "Kayıt ve onay sonrası Toptancı panelinden ürün ekleyin (fotoğraf, stok, fiyat, MOQ).",
  "Yayın ve fiyatlar merkez onayıyla vitrine yansır.",
  "Butik sipariş verdiğinde önce ödeme beklenir; yönetim ödemeyi onaylayınca sipariş size düşer.",
  "Toptancı paneli → Siparişler veya Kargo sayfasından takip numarası girip kargolayın.",
  "Hakediş / IBAN bilgilerinizi panelden güncel tutun.",
];

export default function YardimPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-anthracite-600 transition hover:text-anthracite-900"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} />
        Ana sayfa
      </Link>

      <div className="mb-10 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
          <CircleHelp className="h-5 w-5" strokeWidth={2} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-anthracite-900 sm:text-3xl">
            Yardım ve süreçler
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-anthracite-600 sm:text-base">
            Bu sayfa, canlıya almadan önce butik ve toptancı ortaklarının aynı dili konuşması için özet bir rehberdir.
          </p>
        </div>
      </div>

      <div className="space-y-10 text-left">
        <section className="rounded-2xl border border-anthracite-200/80 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-anthracite-900">
            <UserCheck className="h-5 w-5 text-emerald-600" strokeWidth={2} />
            Genel akış (tek cümle)
          </h2>
          <p className="text-sm leading-relaxed text-anthracite-700">
            <strong>Butik</strong> vitrinde sipariş açar ve ödemeyi yönetimin teyit etmesini bekler.{" "}
            <strong>Toptancı</strong> ödeme onayından sonra ürünü hazırlayıp kargoya verir ve takip numarasını girer.{" "}
            <strong>Yönetim</strong> onaylar, ödemeyi doğrular ve uyuşmazlık/iade taleplerini yönetir.
          </p>
        </section>

        <section className="rounded-2xl border border-anthracite-200/80 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-anthracite-900">
            <ShoppingBag className="h-5 w-5 text-emerald-600" strokeWidth={2} />
            Butik için adımlar
          </h2>
          <ol className="list-decimal space-y-3 pl-5 text-sm leading-relaxed text-anthracite-700">
            {stepsButik.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ol>
          <p className="mt-4 text-xs font-medium text-anthracite-500">
            Panel: üst menüden <strong>Siparişlerim</strong> — sekmelerde aktif siparişler, ödeme ve arşiv ayrılır.
          </p>
        </section>

        <section className="rounded-2xl border border-anthracite-200/80 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-anthracite-900">
            <Package className="h-5 w-5 text-emerald-600" strokeWidth={2} />
            Toptancı için adımlar
          </h2>
          <ol className="list-decimal space-y-3 pl-5 text-sm leading-relaxed text-anthracite-700">
            {stepsToptanci.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ol>
          <p className="mt-4 text-xs font-medium text-anthracite-500">
            Sipariş listesi: <strong>Toptancı paneli</strong> içinde özet; detaylı kargo işlemi için{" "}
            <Link href="/toptanci/siparisler" className="font-semibold text-emerald-700 underline-offset-2 hover:underline">
              Kargo
            </Link>{" "}
            sayfasını kullanın.
          </p>
        </section>

        <section className="rounded-2xl border border-anthracite-200/80 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-anthracite-900">
            <Truck className="h-5 w-5 text-emerald-600" strokeWidth={2} />
            Sipariş durumları (kısa)
          </h2>
          <ul className="space-y-2 text-sm text-anthracite-700">
            <li>
              <strong className="text-anthracite-900">Ödeme bekliyor</strong> — Sipariş kaydı oluştu; yönetim ödemeyi onaylayınca üretim tarafına geçer.
            </li>
            <li>
              <strong className="text-anthracite-900">Hazırlanıyor</strong> — Toptancı paketlemeye başlayabilir.
            </li>
            <li>
              <strong className="text-anthracite-900">Kargoda</strong> — Takip numarası butiğe yansır (Siparişlerim).
            </li>
            <li>
              <strong className="text-anthracite-900">Teslim</strong> — İşlem tamamlandı olarak işaretlenir; gerekiyorsa arşivlenir.
            </li>
          </ul>
        </section>

        <section className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-6 sm:p-8">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-anthracite-900">
            <Wallet className="h-5 w-5 text-amber-600" strokeWidth={2} />
            Yayın öncesi kontrol listesi (sizin için)
          </h2>
          <ul className="space-y-2 text-sm text-anthracite-800">
            <li>• Toptancılara net MOQ, seri fiyat ve stok girişi konusunda kısa eğitim / PDF verin.</li>
            <li>• WhatsApp sipariş hattı numarasının doğru ve açık olduğundan emin olun (kodda yapılandırılmış olmalı).</li>
            <li>• İlk hafta için yönetimde sipariş onayı ve ödeme teyidi süresi tanımlayın (SLA).</li>
            <li>• Hukuki: mesafeli satış / B2B şartnamesi ve KVKK metinlerini siteye eklemeyi planlayın.</li>
            <li>• Destek: iletişim e-postası veya telefonu footer’da paylaşın (isteğe bağlı ekleyebiliriz).</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-anthracite-200/80 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-anthracite-900">
            <Bell className="h-5 w-5 text-emerald-600" strokeWidth={2} />
            Bildirimler
          </h2>
          <p className="text-sm leading-relaxed text-anthracite-700">
            Giriş yaptıktan sonra bazı ekranlarda bildirim zili görünür; yönetim ve sipariş olayları burada listelenir (Supabase realtime açıksa anlık güncellenir).
          </p>
        </section>

        <p className="text-center text-sm text-anthracite-500">
          <Link href="/katalog" className="font-medium text-emerald-700 hover:underline">
            Kataloga git
          </Link>
          {" · "}
          <Link href="/register" className="font-medium text-emerald-700 hover:underline">
            Başvuru
          </Link>
        </p>
      </div>
    </div>
  );
}
