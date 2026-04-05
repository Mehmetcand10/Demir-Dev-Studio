"use client";

import { useEffect, useState, useCallback } from 'react';
import { Package, ArrowLeft, Loader2, FileText, Scale, Truck } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { exportInvoicePDF } from '@/utils/exportInvoice';
import { ORDER_STATUS } from '@/utils/orderStatus';
import { getDisputeStatusLabel, isDisputeOpen } from '@/utils/disputeStatus';
import Link from 'next/link';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

export default function ToptanciSiparisler() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [disputesByOrder, setDisputesByOrder] = useState<Record<string, any>>({});
  const supabase = createClient();

  const fetchMyOrders = useCallback(async (userId: string) => {
    setLoadingOrders(true);
    const { data } = await supabase
      .from('orders')
      .select('*, product:product_id(name, images), wholesaler:wholesaler_id(business_name)')
      .eq('wholesaler_id', userId)
      .order('created_at', { ascending: false });
    
    if (data) setOrders(data);

    const { data: disputeRows } = await supabase
      .from('order_disputes')
      .select('*')
      .eq('wholesaler_id', userId)
      .order('created_at', { ascending: false });
    const map: Record<string, any> = {};
    for (const row of disputeRows || []) {
      if (map[row.order_id] === undefined) map[row.order_id] = row;
    }
    setDisputesByOrder(map);

    setLoadingOrders(false);
  }, [supabase]);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        fetchMyOrders(user.id);
      }
    }
    init();
  }, [supabase.auth, fetchMyOrders]);

  const handleShipOrder = async (orderId: string) => {
    const trackingCode = window.prompt("Lütfen kargoya verdiğiniz paketin Geçerli Takip Numarasını (Örn: YK-109232) yazınız:");
    if (!trackingCode) return;
    
    const { error } = await supabase.from('orders').update({
       status: ORDER_STATUS.SHIPPED,
       tracking_number: trackingCode
    }).eq('id', orderId);
    
    if(!error) {
       alert("Mükemmel! Kargo takip numarası sisteme işlendi ve Müşterinin (Butik) sayfasına anında mavi bantla yansıtıldı.");
       fetchMyOrders(user.id);
    } else {
       alert("Kargo kodu girilirken hata: " + error.message);
    }
  };

  if (!user && !loadingOrders) return (
    <DashboardShell>
      <p className="py-20 text-center text-sm text-anthracite-500">Oturum yükleniyor…</p>
    </DashboardShell>
  );

  return (
    <DashboardShell>
      <DashboardHeader
        icon={Truck}
        eyebrow="Toptancı"
        title="Kargo"
        right={
          <Link href="/toptanci" className="inline-flex items-center gap-2 rounded-lg border border-anthracite-200/80 bg-white px-4 py-2.5 text-sm font-medium text-anthracite-800 shadow-sm transition hover:bg-anthracite-50">
            <ArrowLeft className="h-4 w-4" strokeWidth={2} /> Panele dön
          </Link>
        }
      />

      <div className="rounded-2xl border border-anthracite-200/70 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="mb-6 border-b border-anthracite-100/90 pb-4 text-base font-semibold text-anthracite-900">
           Bekleyen gönderiler
        </h2>
        
        {loadingOrders ? (
          <div className="flex flex-col items-center justify-center py-16">
             <Loader2 className="mb-3 h-9 w-9 animate-spin text-emerald-600" strokeWidth={2} />
             <p className="text-sm font-medium text-anthracite-500">Yükleniyor…</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-anthracite-200/90 bg-anthracite-50/40 px-4 py-14 text-center sm:px-8">
             <h3 className="mb-3 text-base font-semibold text-anthracite-900">Henüz kargolanacak sipariş yok</h3>
             <p className="mx-auto max-w-lg text-sm leading-relaxed text-anthracite-600">
               Butik siparişi oluşturduktan sonra yönetim ödemeyi teyit eder; onay sonrası işlemler burada listelenir.
               Ürünlerinizi{" "}
               <Link href="/toptanci" className="font-semibold text-emerald-700 underline-offset-2 hover:underline">
                 panelden
               </Link>{" "}
               ekleyip yayına aldığınızdan emin olun.
             </p>
             <p className="mx-auto mt-4 max-w-lg text-xs text-anthracite-500">
               Sürecin tamamı için{" "}
               <Link href="/yardim" className="font-medium text-emerald-700 hover:underline">
                 Yardım
               </Link>{" "}
               sayfasına bakın.
             </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {orders.map(order => {
              const dispute = disputesByOrder[order.id];
              return (
               <div key={order.id} className="flex flex-col justify-between rounded-xl border border-anthracite-200/70 bg-anthracite-50/40 p-5 shadow-sm transition hover:border-anthracite-300/80 hover:bg-white hover:shadow-md">
                  <div>
                    {dispute && (
                      <div
                        className={`mb-4 p-4 rounded-2xl border text-left ${
                          isDisputeOpen(dispute.status)
                            ? 'bg-amber-50 border-amber-200 text-amber-900'
                            : dispute.status === 'resolved'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                              : 'bg-anthracite-50 border-anthracite-200 text-anthracite-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Scale className="w-4 h-4 shrink-0 opacity-70" />
                          <p className="text-[10px] font-medium uppercase tracking-wide opacity-70">Uyuşmazlık</p>
                        </div>
                        <p className="text-sm font-semibold">{getDisputeStatusLabel(dispute.status)}</p>
                        <p className="text-xs font-medium mt-2 opacity-90 leading-relaxed">{dispute.reason}</p>
                        {dispute.admin_note && (
                          <p className="text-xs font-bold mt-2 pt-2 border-t border-black/10 leading-relaxed">
                            <span className="uppercase text-[10px] tracking-wider block mb-1 text-anthracite-500">Yönetim kararı</span>
                            {dispute.admin_note}
                          </p>
                        )}
                      </div>
                    )}
                    <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
                      <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${order.status === ORDER_STATUS.SHIPPED ? 'border-blue-200 bg-blue-50 text-blue-800' : 'border-emerald-200 bg-emerald-600 text-white'}`}>
                        {order.status === ORDER_STATUS.SHIPPED ? 'Kargoda' : 'Hazırlanacak'}
                      </span>
                      <span className="rounded-lg border border-emerald-100/90 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-900">
                        {Number(order.quantity)} adet
                      </span>
                    </div>
                    <h3 className="mb-2 break-words text-lg font-semibold leading-tight text-anthracite-900">{order.product_name || "Silinmiş Ürün"}</h3>
                    <p className="mb-5 text-sm font-medium text-emerald-700">Net: {Number(order.wholesaler_earning).toLocaleString('tr-TR')} ₺</p>
                    
                    <div className="mb-5 rounded-xl border border-anthracite-100/90 bg-white p-4">
                      <p className="mb-2 border-b border-anthracite-100/80 pb-2 text-[10px] font-medium text-anthracite-500">Teslimat</p>
                      <p className="mb-1 text-base font-semibold text-anthracite-900">{order.buyer_name}</p>
                      <p className="mt-1 text-sm leading-relaxed text-anthracite-600">{order.shipping_address}</p>
                      <p className="mt-3 rounded-lg border border-emerald-100/90 bg-emerald-50/80 p-2.5 text-xs font-medium text-emerald-800">{order.buyer_phone}</p>
                    </div>
                  </div>

                  {order.status === ORDER_STATUS.APPROVED || order.status === ORDER_STATUS.PREPARING ? (
                     <div className="flex flex-col gap-2">
                        <button type="button" onClick={() => handleShipOrder(order.id)} className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-3 text-sm font-medium text-white transition hover:bg-emerald-700">
                           Takip no ile kargola
                        </button>
                        <button type="button" onClick={() => exportInvoicePDF(order)} className="flex w-full items-center justify-center gap-2 rounded-lg border border-anthracite-200 bg-white py-2.5 text-xs font-medium text-anthracite-800 transition hover:bg-anthracite-50">
                           <FileText className="h-4 w-4" strokeWidth={2} /> PDF
                        </button>
                     </div>
                  ) : (
                     <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 p-3 text-center text-sm font-medium text-blue-900">
                           <Package className="h-4 w-4 shrink-0" strokeWidth={2}/> {order.tracking_number || "Takip no yok"}
                        </div>
                        <button type="button" onClick={() => exportInvoicePDF(order)} className="flex w-full items-center justify-center gap-2 rounded-lg border border-anthracite-200 py-2 text-xs font-medium text-anthracite-600 transition hover:bg-white">
                           <FileText className="h-3.5 w-3.5" strokeWidth={2} /> PDF
                        </button>
                     </div>
                  )}
               </div>
            );
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
