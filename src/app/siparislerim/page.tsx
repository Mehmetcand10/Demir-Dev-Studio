"use client";

import { useEffect, useState, useMemo } from 'react';
import { 
  PackageSearch, PackageCheck, Clock, Truck, FileText, 
  Search, ArrowRight, CheckCircle2, History as HistoryIcon, CreditCard,
  Package, ShoppingBag, Loader2, Info, Printer
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { exportInvoicePDF } from '@/utils/exportInvoice';
import { ORDER_STATUS, isProductionActive } from '@/utils/orderStatus';
import { getDisputeStatusLabel, isDisputeOpen } from '@/utils/disputeStatus';
import { notify } from '@/utils/notifications';
import Image from 'next/image';
import Link from 'next/link';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardTabs } from '@/components/dashboard/DashboardTabs';

type OrderTab = 'active' | 'waiting' | 'archive';

export default function Siparislerim() {
  const [activeTab, setActiveTab] = useState<OrderTab>('active');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeOrder, setDisputeOrder] = useState<any>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);
  const [disputesByOrder, setDisputesByOrder] = useState<Record<string, any>>({});

  const supabase = useMemo(() => createClient(), []);

  const cancelOrder = async (orderId: string) => {
    if (!confirm("Bu siparişi ödeme öncesinde iptal etmek istiyor musunuz?")) return;
    const { error } = await supabase.from('orders').update({ status: ORDER_STATUS.CANCELLED }).eq('id', orderId);
    if (error) {
      alert("İptal başarısız: " + error.message + "\n\nSupabase'de critical_rls_patches.sql (butik iptal politikası) çalıştırıldı mı kontrol edin.");
      return;
    }
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: ORDER_STATUS.CANCELLED } : o)));
  };

  const createDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeOrder || !user) return;
    setIsSubmittingDispute(true);
    try {
      const { error } = await supabase.from('order_disputes').insert({
        order_id: disputeOrder.id,
        buyer_id: user.id,
        wholesaler_id: disputeOrder.wholesaler_id || null,
        reason: disputeReason.trim(),
        status: 'open'
      });
      if (error) throw error;

      const { data: adminRows } = await supabase.rpc('get_admin_profile_ids');
      if (adminRows && adminRows.length > 0) {
        await Promise.all(
          adminRows.map((row: { id: string }) =>
            notify(
              row.id,
              "⚠️ Yeni Uyuşmazlık Kaydı",
              `${disputeOrder.product_name} siparişi için butik tarafından uyuşmazlık bildirildi.`,
              "warning"
            )
          )
        );
      }

      alert("Uyuşmazlık kaydınız yönetime iletildi.");
      setShowDisputeModal(false);
      setDisputeReason('');
      setDisputeOrder(null);
      const { data: rows } = await supabase
        .from('order_disputes')
        .select('*')
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });
      const map: Record<string, any> = {};
      for (const row of rows || []) {
        if (map[row.order_id] === undefined) map[row.order_id] = row;
      }
      setDisputesByOrder(map);
    } catch (err: any) {
      alert("Uyuşmazlık kaydı oluşturulamadı: " + err.message);
    } finally {
      setIsSubmittingDispute(false);
    }
  };

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = '/login'; return; }
      setUser(user);
      
      const { data } = await supabase
        .from('orders')
        .select('*, product:product_id(images, category)')
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });

      if (data) setOrders(data);

      const { data: disputeRows } = await supabase
        .from('order_disputes')
        .select('*')
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });
      const map: Record<string, any> = {};
      for (const row of disputeRows || []) {
        if (map[row.order_id] === undefined) map[row.order_id] = row;
      }
      setDisputesByOrder(map);

      setLoading(false);
    }
    loadData();
  }, [supabase]);

  // HESAPLAMALAR
  const totalSpent = useMemo(() => orders.reduce((acc, o) => acc + Number(o.total_price), 0), [orders]);
  const activeCount = useMemo(() => orders.filter(o => isProductionActive(o.status) && !o.is_archived).length, [orders]);
  const waitingCount = useMemo(() => orders.filter(o => o.status === ORDER_STATUS.WAITING_PAYMENT).length, [orders]);

  const filteredOrders = useMemo(() => {
    if (activeTab === 'active') return orders.filter(o => isProductionActive(o.status) && !o.is_archived);
    if (activeTab === 'waiting') return orders.filter(o => o.status === ORDER_STATUS.WAITING_PAYMENT && !o.is_archived);
    return orders.filter(o => o.is_archived);
  }, [orders, activeTab]);

  if(!user && !loading) return null;

  return (
    <DashboardShell>
      <DashboardHeader icon={ShoppingBag} eyebrow="Butik" title="Siparişlerim" />

      <div className="mb-8 flex flex-wrap gap-3">
        <div className="min-w-[140px] flex-1 rounded-xl border border-anthracite-200/80 bg-white px-4 py-3 shadow-sm">
          <p className="text-[10px] font-medium uppercase tracking-wider text-anthracite-500">Toplam alım</p>
          <p className="text-lg font-semibold tabular-nums text-anthracite-900">{totalSpent.toLocaleString("tr-TR")} ₺</p>
        </div>
        <div className="min-w-[120px] flex-1 rounded-xl border border-emerald-200/50 bg-gradient-to-br from-emerald-600 to-emerald-700 px-4 py-3 text-white shadow-sm">
          <p className="text-[10px] font-medium uppercase tracking-wider text-white/75">Aktif kargo</p>
          <p className="text-lg font-semibold tabular-nums">{activeCount} paket</p>
        </div>
      </div>

      <DashboardTabs
        value={activeTab}
        onChange={(id) => setActiveTab(id as OrderTab)}
        items={[
          { id: "active", label: `Aktif (${activeCount})`, icon: Truck },
          { id: "waiting", label: `Ödeme (${waitingCount})`, icon: CreditCard },
          { id: "archive", label: "Arşiv", icon: HistoryIcon },
        ]}
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-anthracite-400">
            <Loader2 className="mb-3 h-9 w-9 animate-spin text-emerald-600/70" />
            <p className="text-xs font-medium">Yükleniyor…</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-anthracite-200/80 bg-white py-20 text-center shadow-sm">
            <PackageSearch className="mx-auto mb-3 h-12 w-12 text-anthracite-200" />
            <h3 className="mb-1 text-lg font-semibold text-anthracite-900">Kayıt yok</h3>
            <p className="mb-2 text-sm text-anthracite-500">Bu sekmede sipariş bulunmuyor.</p>
            <p className="mb-6 text-xs text-anthracite-400">
              Sipariş ve ödeme süreci için{" "}
              <Link href="/yardim" className="font-medium text-emerald-700 hover:underline">
                Yardım
              </Link>
              .
            </p>
            <Link href="/katalog" className="inline-flex items-center gap-2 rounded-lg bg-anthracite-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-anthracite-800">Kataloga git</Link>
        </div>
      ) : (
        <div className="flex flex-col gap-5 text-left">
          {filteredOrders.map((order) => {
            const date = new Date(order.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
            const dispute = disputesByOrder[order.id];
            const canOpenNewDispute = !dispute || !isDisputeOpen(dispute.status);
            
            // STATUS TRACKER LOGIC
            const steps = [
              { id: 'payment', label: 'Ödeme Teyidi', icon: CreditCard, active: order.status !== ORDER_STATUS.CANCELLED },
              { id: 'preparing', label: 'Üretim/Hazırlık', icon: Package, active: order.status === ORDER_STATUS.APPROVED || order.status === ORDER_STATUS.PREPARING || order.status === ORDER_STATUS.SHIPPED || order.status === ORDER_STATUS.DELIVERED },
              { id: 'shipped', label: 'Kargoya Verildi', icon: Truck, active: order.status === ORDER_STATUS.SHIPPED || order.status === ORDER_STATUS.DELIVERED }
            ];

            return (
              <div key={order.id} className="group relative overflow-hidden rounded-2xl border border-anthracite-200/70 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6">
                <div className="flex flex-col items-center gap-6 lg:flex-row lg:gap-8">
                   
                   {/* ÜRÜN GÖRSELO VE ÖZET */}
                   <div className="relative h-40 w-28 shrink-0 overflow-hidden rounded-xl border border-anthracite-100 bg-anthracite-50 shadow-sm">
                     <Image src={order.product?.images?.[0] || ''} alt="p" fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                   </div>
                   
                   <div className="flex w-full flex-1 flex-col gap-5">
                      <div className="flex flex-col gap-3 border-b border-anthracite-100/80 pb-4 sm:flex-row sm:items-start sm:justify-between">
                         <div className="min-w-0">
                            <h3 className="text-lg font-semibold leading-snug text-anthracite-900 sm:text-xl">{order.product_name}</h3>
                            <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-anthracite-500">{order.quantity} adet · {order.selected_size} · {date}</p>
                         </div>
                         <div className="text-left sm:text-right">
                             <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-700/90">Tutar</p>
                             <span className="text-xl font-semibold tabular-nums text-anthracite-900 sm:text-2xl">{Number(order.total_price).toLocaleString('tr-TR')} ₺</span>
                         </div>
                      </div>

                      {/* Durum */}
                      <div className="relative w-full px-1 py-2 sm:px-6">
                          <div className="absolute top-1/2 left-8 right-8 hidden h-0.5 -translate-y-1/2 rounded-full bg-anthracite-100 sm:block">
                              <div className={`h-full rounded-full bg-emerald-500 transition-all duration-700`} style={{ width: order.status === ORDER_STATUS.WAITING_PAYMENT ? '0%' : order.status === ORDER_STATUS.APPROVED || order.status === ORDER_STATUS.PREPARING ? '50%' : '100%' }}></div>
                          </div>
                          <div className="relative z-10 flex w-full justify-between">
                              {steps.map((step) => (
                                  <div key={step.id} className="flex flex-col items-center gap-2">
                                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl border-2 transition-all sm:h-11 sm:w-11 ${step.active ? 'border-emerald-500 bg-emerald-500 text-white shadow-sm' : 'border-anthracite-100 bg-white text-anthracite-300'}`}>
                                          <step.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                                      </div>
                                      <span className={`max-w-[4.5rem] text-center text-[9px] font-medium uppercase leading-tight sm:max-w-none sm:text-[10px] ${step.active ? 'text-anthracite-800' : 'text-anthracite-400'}`}>{step.label}</span>
                                  </div>
                              ))}
                          </div>
                      </div>

                      {dispute && (
                        <div
                          className={`rounded-xl border p-3 text-left text-sm ${
                            isDisputeOpen(dispute.status)
                              ? 'border-amber-200/80 bg-amber-50/90 text-amber-950'
                              : dispute.status === 'resolved'
                                ? 'border-emerald-200/80 bg-emerald-50/80 text-emerald-950'
                                : 'border-anthracite-200/80 bg-anthracite-50/90 text-anthracite-900'
                          }`}
                        >
                          <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wider opacity-80">Uyuşmazlık</p>
                          <p className="font-semibold">{getDisputeStatusLabel(dispute.status)}</p>
                          {dispute.admin_note && (
                            <p className="text-xs font-bold mt-2 leading-relaxed opacity-90">
                              <span className="uppercase text-[10px] tracking-wider block mb-1 text-anthracite-500">Yönetim</span>
                              {dispute.admin_note}
                            </p>
                          )}
                        </div>
                      )}

                      {/* AKSİYONLAR VE BİLGİ BANTLARI */}
                      <div className="flex flex-col gap-4 border-t border-anthracite-100/80 pt-4 sm:flex-row sm:items-center sm:justify-between">
                         {order.status === ORDER_STATUS.WAITING_PAYMENT ? (
                            <div className="flex w-full items-center gap-2 rounded-xl border border-amber-200/80 bg-amber-50/90 px-3 py-2.5 text-xs font-medium text-amber-900 sm:w-auto">
                               <Info className="h-4 w-4 shrink-0 text-amber-600" />
                               Dekontu WhatsApp (merkez) hattına iletin.
                            </div>
                         ) : order.status === ORDER_STATUS.SHIPPED && order.tracking_number ? (
                            <div className="w-full rounded-xl border border-blue-100 bg-blue-50/90 px-3 py-2.5 text-center text-blue-900 sm:w-auto sm:text-left">
                               <p className="text-[9px] font-medium uppercase tracking-wider text-blue-600/80">Takip no</p>
                               <p className="font-mono text-sm font-semibold">{order.tracking_number}</p>
                            </div>
                         ) : <div className="text-xs font-medium text-anthracite-400">Sipariş takipte.</div>}

                         <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
                            {order.status !== ORDER_STATUS.CANCELLED && (
                                <Link href={`/siparislerim/${order.id}/ozet`} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-anthracite-200 bg-white px-4 py-2.5 text-xs font-medium text-anthracite-800 transition hover:bg-anthracite-50 sm:flex-none">
                                   <Printer className="h-4 w-4" /> Özet / yazdır
                                </Link>
                            )}
                            {(order.status === ORDER_STATUS.APPROVED || order.status === ORDER_STATUS.PREPARING || order.status === ORDER_STATUS.SHIPPED || order.status === ORDER_STATUS.DELIVERED) && (
                                <button onClick={() => exportInvoicePDF(order)} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-anthracite-900 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-anthracite-800 sm:flex-none">
                                   <FileText className="h-4 w-4" /> Fatura
                                </button>
                            )}
                            {order.status === ORDER_STATUS.WAITING_PAYMENT && (
                                <button onClick={() => cancelOrder(order.id)} className="inline-flex flex-1 items-center justify-center rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-medium text-red-800 transition hover:bg-red-100 sm:flex-none">
                                   İptal
                                </button>
                            )}
                            {(order.status === ORDER_STATUS.SHIPPED || order.status === ORDER_STATUS.DELIVERED) && canOpenNewDispute && (
                                <button
                                  onClick={() => { setDisputeOrder(order); setShowDisputeModal(true); }}
                                  className="inline-flex flex-1 items-center justify-center rounded-lg border border-amber-200/90 bg-amber-50 px-4 py-2.5 text-xs font-medium text-amber-900 transition hover:bg-amber-100/80 sm:flex-none"
                                >
                                  Sorun bildir
                                </button>
                            )}
                            {(order.status === ORDER_STATUS.SHIPPED || order.status === ORDER_STATUS.DELIVERED) && !canOpenNewDispute && (
                                <span className="flex-1 rounded-lg border border-dashed border-anthracite-200 px-3 py-2 text-center text-[10px] font-medium uppercase text-anthracite-500 sm:flex-none">
                                  Uyuşmazlık süreci
                                </span>
                            )}
                            <Link href="/katalog" className="inline-flex rounded-lg border border-anthracite-200 bg-white p-2.5 text-anthracite-500 transition hover:border-anthracite-300 hover:text-anthracite-900">
                               <ArrowRight className="h-4 w-4" />
                            </Link>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showDisputeModal && disputeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl border border-anthracite-200/80 bg-white p-6 shadow-xl">
            <h3 className="mb-1 text-lg font-semibold text-anthracite-900">Uyuşmazlık talebi</h3>
            <p className="mb-4 text-sm text-anthracite-600">
              Sipariş: <span className="font-medium text-anthracite-900">{disputeOrder.product_name}</span>
            </p>
            <form onSubmit={createDispute} className="flex flex-col gap-4">
              <textarea
                required
                minLength={10}
                rows={5}
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                className="w-full resize-none rounded-xl border border-anthracite-200 bg-anthracite-50/50 px-4 py-3 text-sm text-anthracite-900 outline-none transition focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                placeholder="Sorunu kısaca açıklayın (eksik ürün, beden, hasar vb.)"
              />
              <div className="flex gap-2">
                <button type="button" onClick={() => { setShowDisputeModal(false); setDisputeReason(''); setDisputeOrder(null); }} className="flex-1 rounded-lg border border-anthracite-200 py-2.5 text-sm font-medium text-anthracite-600 transition hover:bg-anthracite-50">
                  Vazgeç
                </button>
                <button disabled={isSubmittingDispute} type="submit" className="flex-[1.3] rounded-lg bg-emerald-600 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50">
                  {isSubmittingDispute ? 'Gönderiliyor…' : 'Gönder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
