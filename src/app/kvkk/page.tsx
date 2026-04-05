import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "KVKK aydınlatma metni | Demir Dev Studio",
  description: "Kişisel verilerin korunması hakkında bilgilendirme.",
};

export default function KvkkPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-anthracite-600 transition hover:text-anthracite-900"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} />
        Ana sayfa
      </Link>

      <div className="mb-8 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
          <Shield className="h-5 w-5" strokeWidth={2} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-anthracite-900 sm:text-3xl">
            Kişisel verilerin korunması (KVKK)
          </h1>
          <p className="mt-2 text-sm text-anthracite-600">
            Bu metin çerçevedir; yayına çıkmadan önce hukuk danışmanınızla güncelleyin.
          </p>
        </div>
      </div>

      <div className="space-y-6 text-sm leading-relaxed text-anthracite-700">
        <section className="rounded-2xl border border-anthracite-200/80 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-3 text-base font-semibold text-anthracite-900">Veri sorumlusu</h2>
          <p>
            Demir Dev Studio olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında üyelik, sipariş ve iletişim
            süreçlerinde işlenen kişisel verilerinize ilişkin aydınlatma yükümlülüğümüzü yerine getiririz. Güncel unvan,
            adres ve başvuru kanalları operasyon ekibinizce bu sayfaya eklenebilir.
          </p>
        </section>

        <section className="rounded-2xl border border-anthracite-200/80 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-3 text-base font-semibold text-anthracite-900">İşlenen veriler ve amaçlar</h2>
          <p className="mb-3">
            Örnek olarak: kimlik / iletişim bilgileri, vergi numarası, işletme unvanı, sipariş ve ödeme teyidi için gerekli
            kayıtlar. Amaçlar: sözleşmenin kurulması ve ifası, yasal yükümlülükler, meşru menfaat ve açık rıza kapsamında
            iletişim.
          </p>
          <p>
            Ayrıntılı liste ve saklama süreleri için tam aydınlatma metnini PDF veya ayrı doküman olarak yayınlamanız önerilir.
          </p>
        </section>

        <section className="rounded-2xl border border-anthracite-200/80 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-3 text-base font-semibold text-anthracite-900">Haklarınız</h2>
          <p>
            KVKK md. 11 kapsamında verilerinizin işlenip işlenmediğini öğrenme, düzeltme, silme, itiraz ve şikâyet hakkına
            sahipsiniz. Başvurularınız için footer ve{" "}
            <Link href="/yardim#iletisim" className="font-semibold text-emerald-700 hover:underline">
              Yardım — İletişim
            </Link>{" "}
            bölümündeki kanalları kullanabilirsiniz.
          </p>
        </section>
      </div>

      <p className="mt-10 text-center text-xs text-anthracite-500">
        Harici veya PDF metin kullanmak için ortam değişkeni{" "}
        <code className="rounded bg-anthracite-100 px-1 py-0.5">NEXT_PUBLIC_KVKK_URL</code> tanımlanabilir.
      </p>
    </div>
  );
}
