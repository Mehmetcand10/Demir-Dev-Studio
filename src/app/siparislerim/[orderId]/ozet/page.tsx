"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Printer } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { ORDER_STATUS, getOrderStatusLabel } from "@/utils/orderStatus";

export default function SiparisOzetPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    async function run() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      const { data, error } = await supabase
        .from("orders")
        .select("*, product:product_id(name, images), wholesaler:wholesaler_id(business_name)")
        .eq("id", orderId)
        .eq("buyer_id", user.id)
        .single();

      if (error || !data) {
        router.replace("/siparislerim");
        return;
      }
      setOrder(data);
      setLoading(false);
    }
    void run();
  }, [orderId, router, supabase]);

  if (loading || !order) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-anthracite-500">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" strokeWidth={2} />
        <p className="text-sm font-medium">Yükleniyor…</p>
      </div>
    );
  }

  const created = new Date(order.created_at).toLocaleString("tr-TR");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 print:max-w-none print:py-4 sm:py-10">
      <div className="no-print mb-6 flex flex-wrap items-center gap-3">
        <Link
          href="/siparislerim"
          className="inline-flex items-center gap-2 rounded-lg border border-anthracite-200 bg-white px-4 py-2 text-sm font-medium text-anthracite-800 shadow-sm hover:bg-anthracite-50"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          Siparişlerim
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-lg bg-anthracite-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-anthracite-800"
        >
          <Printer className="h-4 w-4" strokeWidth={2} />
          Yazdır / PDF kaydet
        </button>
      </div>

      <article className="rounded-2xl border border-anthracite-200 bg-white p-6 shadow-sm print:border-0 print:shadow-none sm:p-8">
        <header className="border-b border-anthracite-100 pb-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">Demir Dev Studio</p>
          <h1 className="mt-1 text-xl font-bold text-anthracite-900">Sipariş özeti</h1>
          <p className="mt-2 font-mono text-xs text-anthracite-500">No: {order.id}</p>
          <p className="text-xs text-anthracite-600">Oluşturulma: {created}</p>
        </header>

        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between gap-4 border-b border-anthracite-50 pb-2">
            <dt className="text-anthracite-500">Ürün</dt>
            <dd className="text-right font-semibold text-anthracite-900">{order.product_name}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-anthracite-50 pb-2">
            <dt className="text-anthracite-500">Toptancı</dt>
            <dd className="text-right font-medium text-anthracite-800">{order.wholesaler?.business_name || "—"}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-anthracite-50 pb-2">
            <dt className="text-anthracite-500">Beden / adet</dt>
            <dd className="text-right font-medium tabular-nums text-anthracite-900">
              {order.selected_size} · {order.quantity} adet
            </dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-anthracite-50 pb-2">
            <dt className="text-anthracite-500">Durum</dt>
            <dd className="text-right font-semibold text-anthracite-900">{getOrderStatusLabel(order.status)}</dd>
          </div>
          {order.tracking_number ? (
            <div className="flex justify-between gap-4 border-b border-anthracite-50 pb-2">
              <dt className="text-anthracite-500">Takip no</dt>
              <dd className="text-right font-mono font-semibold text-blue-800">{order.tracking_number}</dd>
            </div>
          ) : null}
          <div className="flex justify-between gap-4 border-b border-anthracite-50 pb-2">
            <dt className="text-anthracite-500">Teslimat</dt>
            <dd className="max-w-[65%] text-right text-xs leading-relaxed text-anthracite-800">{order.shipping_address}</dd>
          </div>
          <div className="flex justify-between gap-4 pt-2">
            <dt className="text-anthracite-500">Toplam</dt>
            <dd className="text-right text-lg font-bold tabular-nums text-emerald-700">
              {Number(order.total_price).toLocaleString("tr-TR")} ₺
            </dd>
          </div>
        </dl>

        {order.status === ORDER_STATUS.WAITING_PAYMENT && (
          <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-950">
            Ödeme henüz teyit edilmedi. Dekontu merkez WhatsApp hattına iletin; teyit sonrası hazırlık başlar.
          </p>
        )}

        <p className="mt-8 text-center text-[10px] text-anthracite-400 print:mt-6">
          Bu belge arşiv için yazdırılabilir. Resmi muhasebe çıktısı için &quot;Fatura&quot; düğmesini kullanın.
        </p>
      </article>
    </div>
  );
}
