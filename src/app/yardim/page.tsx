import type { Metadata } from "next";
import type { ReactNode } from "react";
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
  MessageCircle,
  Mail,
  Phone,
  Scale,
  Clock,
} from "lucide-react";
import { getSitePublicContact } from "@/utils/siteContact";

export const metadata: Metadata = {
  title: "Yardım ve süreçler | Demir Dev Studio",
  description:
    "Butik ve toptancılar için sipariş, ödeme, kargo, SLA (hizmet süreleri) ve panel kullanımı özeti.",
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

function LegalLink({ href, children }: { href: string; children: ReactNode }) {
  if (href.startsWith("http://") || href.startsWith("https://")) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="font-semibold text-emerald-700 underline-offset-2 hover:underline">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className="font-semibold text-emerald-700 underline-offset-2 hover:underline">
      {children}
    </Link>
  );
}

export default function YardimPage() {
  const contact = getSitePublicContact();

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
          <p className="mt-4 rounded-xl border border-amber-200/80 bg-amber-50/60 p-4 text-sm leading-relaxed text-anthracite-800">
            <strong className="text-anthracite-900">Uyuşmazlık ne zaman?</strong> Sipariş{" "}
            <strong>kargoya verildikten sonra</strong> veya <strong>teslim edildikten sonra</strong> yanlış ürün, eksik adet,
            ciddi kalite sapması gibi durumlarda Siparişlerim’deki <strong>Sorun bildir</strong> ile kayıt açın; yönetim ve
            toptancı tarafına bildirim gider. Ödeme beklerken veya henüz kargolanmadan önce önce WhatsApp / merkez hattı ile
            iletişim önerilir.
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

        <section
          id="sla"
          className="rounded-2xl border border-indigo-200/80 bg-indigo-50/35 p-6 shadow-sm sm:p-8"
        >
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-anthracite-900">
            <Clock className="h-5 w-5 text-indigo-600" strokeWidth={2} />
            Hizmet süreleri (SLA)
          </h2>
          <p className="mb-4 text-sm leading-relaxed text-anthracite-700">
            Aşağıdaki süreler <strong>hedef</strong> niteliğindedir; stok yokluğu, bayram, yoğunluk veya müşteriden eksik bilgi
            gibi durumlarda yönetim veya toptancı sizi bilgilendirir. Süreleri kendi operasyonunuza göre değiştirmek için bu
            metni güncellemeniz yeterlidir.
          </p>
          <ul className="space-y-3 text-sm leading-relaxed text-anthracite-800">
            <li>
              <strong className="text-anthracite-900">Ödeme teyidi (yönetim):</strong> Sipariş kaydı ve dekontun ulaşmasını
              takiben, <strong>en geç 2 iş günü</strong> içinde ödeme teyidi veya ek bilgi talebi yapılır.{" "}
              <span className="text-anthracite-600">İş günü: Pazartesi–Cuma; resmi tatiller dahil değildir.</span>
            </li>
            <li>
              <strong className="text-anthracite-900">Hazırlık ve kargo (toptancı):</strong> Ödeme onayından sonra ürünün
              paketlenip kargoya verilmesi <strong>hedefi 3 iş günüdür</strong>. Özel üretim veya stok beklemesi varsa toptancı
              veya yönetim ile iletişime geçilir.
            </li>
            <li>
              <strong className="text-anthracite-900">Takip numarası:</strong> Kargoya verildikten sonra takip numarası{" "}
              <strong>aynı iş günü içinde</strong> panele işlenir; geç saatlerde ertesi iş gününe sarkabilir.
            </li>
            <li>
              <strong className="text-anthracite-900">Destek (ilk yanıt):</strong> Footer’daki e-posta veya telefon hattına
              yazılan talepler için <strong>1 iş günü içinde</strong> ilk dönüş hedeflenir. Acil sipariş sorunlarında WhatsApp
              hattı önceliklidir.
            </li>
          </ul>
          <p className="mt-4 text-xs text-anthracite-600">
            Bu metin hukuki taahhüt değildir; şeffaflık ve beklenti yönetimi içindir. Resmi süreler sözleşme veya mesafeli satış
            metninizde tanımlanmalıdır.
          </p>
        </section>

        <section
          id="iletisim"
          className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-6 shadow-sm sm:p-8"
        >
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-anthracite-900">
            <Mail className="h-5 w-5 text-emerald-600" strokeWidth={2} />
            İletişim ve yasal
          </h2>
          <ul className="space-y-3 text-sm leading-relaxed text-anthracite-700">
            <li className="flex gap-2">
              <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" strokeWidth={2} />
              <span>
                <strong className="text-anthracite-900">Sipariş / dekont WhatsApp:</strong>{" "}
                <a
                  href={contact.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-emerald-800 underline-offset-2 hover:underline"
                >
                  {contact.whatsappDisplay}
                </a>{" "}
                (ortam değişkeni: <code className="rounded bg-white/80 px-1 py-0.5 text-xs">NEXT_PUBLIC_WHATSAPP_E164</code>)
              </span>
            </li>
            {contact.supportEmailHref ? (
              <li className="flex gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" strokeWidth={2} />
                <span>
                  <strong className="text-anthracite-900">Destek e-posta:</strong>{" "}
                  <a href={contact.supportEmailHref} className="font-semibold text-emerald-800 underline-offset-2 hover:underline">
                    {contact.supportEmail}
                  </a>
                </span>
              </li>
            ) : (
              <li className="flex gap-2 text-anthracite-600">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-anthracite-400" strokeWidth={2} />
                <span>
                  <strong className="text-anthracite-800">Destek e-posta:</strong> Canlı ortamda{" "}
                  <code className="rounded bg-white/80 px-1 py-0.5 text-xs">NEXT_PUBLIC_SUPPORT_EMAIL</code> tanımlayın; footer ve bu alan otomatik dolar.
                </span>
              </li>
            )}
            {contact.supportPhoneDisplay ? (
              <li className="flex gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" strokeWidth={2} />
                <span>
                  <strong className="text-anthracite-900">Telefon:</strong>{" "}
                  {contact.supportPhoneHref ? (
                    <a href={contact.supportPhoneHref} className="font-semibold text-emerald-800 underline-offset-2 hover:underline">
                      {contact.supportPhoneDisplay}
                    </a>
                  ) : (
                    contact.supportPhoneDisplay
                  )}
                </span>
              </li>
            ) : null}
            <li className="flex gap-2">
              <Scale className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" strokeWidth={2} />
              <span>
                <strong className="text-anthracite-900">KVKK</strong> ve{" "}
                <strong className="text-anthracite-900">mesafeli satış</strong> metinleri:{" "}
                <LegalLink href={contact.kvkkHref}>KVKK sayfası</LegalLink>
                {" · "}
                <LegalLink href={contact.mesafeliHref}>Mesafeli satış</LegalLink>
                . Harici PDF veya site için{" "}
                <code className="rounded bg-white/80 px-1 py-0.5 text-xs">NEXT_PUBLIC_KVKK_URL</code> /{" "}
                <code className="rounded bg-white/80 px-1 py-0.5 text-xs">NEXT_PUBLIC_MESAFELI_SATIS_URL</code> kullanılabilir.
              </span>
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
            <li>• WhatsApp sipariş hattı: <code className="rounded bg-white/80 px-1 text-xs">NEXT_PUBLIC_WHATSAPP_E164</code> canlıda doğru olmalı.</li>
            <li>
              • Operasyon SLA metnini yayınlayın:{" "}
              <Link href="/yardim#sla" className="font-semibold text-emerald-800 underline-offset-2 hover:underline">
                Hizmet süreleri (SLA)
              </Link>
              .
            </li>
            <li>• KVKK ve mesafeli satış metinlerini hukuk danışmanınızla netleştirip sayfaları veya PDF bağlantılarını güncelleyin.</li>
            <li>• Destek kanalı: footer’da e-posta / telefon için env değişkenlerini doldurun.</li>
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
