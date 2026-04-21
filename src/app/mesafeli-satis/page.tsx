import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Mesafeli satış ve B2B şartlar | Demir Dev Studio",
  description: "Sipariş, ödeme ve teslimat süreçlerine ilişkin çerçeve bilgi.",
};

export default function MesafeliSatisPage() {
  return (
    <div className="premium-page-wrap max-w-3xl">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-anthracite-600 transition hover:text-anthracite-900"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} />
        Ana sayfa
      </Link>

      <div className="mb-8 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
          <FileText className="h-5 w-5" strokeWidth={2} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-anthracite-900 sm:text-3xl">
            Mesafeli satış ve ticari şartlar
          </h1>
          <p className="mt-2 text-sm text-anthracite-600">
            B2B tedarik modeline uygun özet çerçeve; sözleşme metnini hukuk danışmanınızla tamamlayın.
          </p>
        </div>
      </div>

      <div className="space-y-6 text-sm leading-relaxed text-anthracite-700">
        <section className="premium-card p-6 sm:p-8">
          <h2 className="mb-3 text-base font-semibold text-anthracite-900">Sipariş ve sözleşme</h2>
          <p className="mb-3">
            Platform üzerinden oluşturulan sipariş kayıtları, taraflar arasındaki ticari ilişkinin parçasıdır. Fiyatlar,
            minimum sipariş adetleri (MOQ) ve stok bilgisi ürün sayfasında veya toptancı onayıyla belirlenir.
          </p>
          <p>
            Ödeme, yönetim tarafından teyit edilene kadar üretim / sevkiyat yükümlülüğü başlamaz; süreç özeti için{" "}
            <Link href="/yardim" className="font-semibold text-emerald-700 hover:underline">
              Yardım
            </Link>{" "}
            sayfasına bakın.
          </p>
        </section>

        <section className="premium-card p-6 sm:p-8">
          <h2 className="mb-3 text-base font-semibold text-anthracite-900">Teslimat ve cayma</h2>
          <p className="mb-3">
            Kargo ve takip numarası toptancı tarafından sisteme işlenir; teslimat süreleri ve kargo ücreti politikası için
            ayrı ticari şartname veya sipariş onayı kullanılmalıdır.
          </p>
          <p>
            B2B ve özel üretim hallerinde mesafeli satış ve cayma hakkı istisnaları söz konusu olabilir; nihai metin
            hukuki danışmanlıkla uyumlu hale getirilmelidir.
          </p>
        </section>

        <section className="premium-card p-6 sm:p-8">
          <h2 className="mb-3 text-base font-semibold text-anthracite-900">Uyuşmazlık</h2>
          <p>
            İade ve uyuşmazlık talepleri panel üzerinden iletilebilir; iletişim için{" "}
            <Link href="/yardim#iletisim" className="font-semibold text-emerald-700 hover:underline">
              İletişim ve yasal
            </Link>{" "}
            bölümündeki kanalları kullanın.
          </p>
        </section>
      </div>

      <p className="mt-10 text-center text-xs text-anthracite-500">
        Harici sözleşme PDF’si veya farklı bir adrese yönlendirme için teknik yapılandırma gerekir; yönetim ekibine danışın.
      </p>
    </div>
  );
}
