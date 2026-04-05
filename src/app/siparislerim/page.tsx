"use client";

import { useEffect, useState, useMemo } from 'react';
import { 
  PackageSearch, PackageCheck, Clock, Truck, FileText, 
  Search, ArrowRight, CheckCircle2, History as HistoryIcon, CreditCard,
  Package, ShoppingBag, Loader2, Info
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { exportInvoicePDF } from '@/utils/exportInvoice';
import { ORDER_STATUS, isProductionActive } from '@/utils/orderStatus';
import { getDisputeStatusLabel, isDisputeOpen } from '@/utils/disputeStatus';
import { notify } from '@/utils/notifications';
import Image from 'next/image';
import Link from 'next/link';

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen bg-anthracite-50/10">
      
      {/* ÜST BAŞLIK VE ÖZET */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6 text-left">
        <div>
           <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <ShoppingBag className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-100 px-2 py-0.5 rounded">LOJİSTİK TAKİP</span>
           </div>
           <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-anthracite-900 leading-none">Siparişlerim</h1>
        </div>
      <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <div className="bg-white px-6 py-4 rounded-[2rem] border border-anthracite-100 shadow-sm min-w-[150px]">
                <p className="text-[9px] font-black text-anthracite-400 uppercase tracking-widest mb-1">Toplam Alım</p>
                <p className="text-2xl font-black text-anthracite-900">{totalSpent.toLocaleString('tr-TR')} ₺</p>
            </div>
            <div className="bg-emerald-500 px-6 py-4 rounded-[2rem] shadow-xl shadow-emerald-500/20 min-w-[120px] text-white">
                <p className="text-[9px] font-black text-white/60 uppercase tracking-widest mb-1">Aktif Kargo</p>
                <p className="text-2xl font-black">{activeCount} PAKET</p>
            </div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md p-2 rounded-[2.5rem] border border-anthracite-100 shadow-lg w-max mb-10 overflow-x-auto max-w-full">
          <button onClick={() => setActiveTab('active')} className={`flex items-center gap-2 px-5 sm:px-8 py-3.5 rounded-[2rem] font-black text-[10px] sm:text-xs uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === 'active' ? 'bg-anthracite-900 text-white shadow-xl scale-105' : 'text-anthracite-400 hover:text-black'}`}>
              <Truck className="w-4 h-4" /> Aktif Takip ({activeCount})
          </button>
          <button onClick={() => setActiveTab('waiting')} className={`flex items-center gap-2 px-5 sm:px-8 py-3.5 rounded-[2rem] font-black text-[10px] sm:text-xs uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === 'waiting' ? 'bg-white border-2 border-amber-400 text-amber-600 shadow-md scale-105' : 'text-anthracite-400 hover:text-black'}`}>
              <CreditCard className="w-4 h-4" /> Ödeme Bekleyen ({waitingCount})
          </button>
          <button onClick={() => setActiveTab('archive')} className={`flex items-center gap-2 px-5 sm:px-8 py-3.5 rounded-[2rem] font-black text-[10px] sm:text-xs uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === 'archive' ? 'bg-anthracite-900 text-white shadow-xl scale-105' : 'text-anthracite-400 hover:text-black'}`}>
              <HistoryIcon className="w-4 h-4" /> Arşiv
          </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 opacity-30 animate-pulse text-left">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <p className="font-black text-xs uppercase tracking-[0.3em]">Lojistik Ağ Taranıyor</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-[3rem] border-2 border-dashed border-anthracite-100 py-32 text-center">
            <PackageSearch className="w-20 h-20 mx-auto text-anthracite-100 mb-4" />
            <h3 className="text-2xl font-black text-anthracite-900 mb-2">Gösterilecek Kayıt Yok</h3>
            <p className="text-anthracite-400 font-medium mb-8">Henüz bu kategoride bir işlem bulunmuyor.</p>
            <Link href="/katalog" className="inline-flex items-center gap-2 bg-anthracite-900 text-white px-8 py-4 rounded-2xl font-black shadow-xl hover:scale-105 transition-all">HEMEN ALIŞVERİŞE BAŞLA</Link>
        </div>
      ) : (
        <div className="flex flex-col gap-8 text-left">
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
              <div key={order.id} className="group bg-white border border-anthracite-100 rounded-[3rem] p-8 lg:p-10 shadow-sm hover:shadow-2xl transition-all relative overflow-hidden">
                <div className="flex flex-col lg:flex-row items-center gap-10">
                   
                   {/* ÜRÜN GÖRSELO VE ÖZET */}
                   <div className="w-32 h-44 shrink-0 bg-anthracite-50 rounded-[2rem] overflow-hidden relative shadow-lg border border-anthracite-100">
                     <Image src={order.product?.images?.[0] || ''} alt="p" fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                   </div>
                   
                   <div className="flex-1 w-full flex flex-col gap-8">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-anthracite-50 pb-6 gap-4">
                         <div>
                            <h3 className="text-3xl font-black text-anthracite-900 leading-tight">{order.product_name}</h3>
                            <p className="text-[10px] font-black text-anthracite-400 uppercase tracking-[0.2em] mt-1">{order.quantity} Adet • {order.selected_size} BEDEN • {date}</p>
                         </div>
                         <div className="text-right">
                             <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-1">Toplam Tutar</p>
                             <span className="text-4xl font-black text-anthracite-900 tracking-tighter">{Number(order.total_price).toLocaleString('tr-TR')} ₺</span>
                         </div>
                      </div>

                      {/* CANLI STATUS TRACKER (TIMELINE) */}
                      <div className="relative w-full py-4 px-4 sm:px-10">
                          <div className="absolute top-1/2 left-10 right-10 h-1 bg-anthracite-100 -translate-y-1/2 rounded-full hidden sm:block">
                              <div className={`h-full bg-emerald-500 transition-all duration-1000 rounded-full`} style={{ width: order.status === ORDER_STATUS.WAITING_PAYMENT ? '0%' : order.status === ORDER_STATUS.APPROVED || order.status === ORDER_STATUS.PREPARING ? '50%' : '100%' }}></div>
                          </div>
                          <div className="flex justify-between items-center relative z-10 w-full">
                              {steps.map((step, idx) => (
                                  <div key={step.id} className="flex flex-col items-center gap-3">
                                      <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center border-4 transition-all duration-500 ${step.active ? 'bg-emerald-500 text-white border-white shadow-xl scale-110' : 'bg-white text-anthracite-200 border-anthracite-100'}`}>
                                          <step.icon className="w-6 h-6 sm:w-8 sm:h-8" />
                                      </div>
                                      <span className={`text-[10px] sm:text-xs font-black uppercase tracking-tighter ${step.active ? 'text-anthracite-900' : 'text-anthracite-300'}`}>{step.label}</span>
                                  </div>
                              ))}
                          </div>
                      </div>

                      {dispute && (
                        <div
                          className={`rounded-2xl border p-4 text-left ${
                            isDisputeOpen(dispute.status)
                              ? 'bg-amber-50 border-amber-200 text-amber-900'
                              : dispute.status === 'resolved'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                : 'bg-anthracite-50 border-anthracite-200 text-anthracite-800'
                          }`}
                        >
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Uyuşmazlık</p>
                          <p className="text-sm font-black">{getDisputeStatusLabel(dispute.status)}</p>
                          {dispute.admin_note && (
                            <p className="text-xs font-bold mt-2 leading-relaxed opacity-90">
                              <span className="uppercase text-[10px] tracking-wider block mb-1 text-anthracite-500">Yönetim</span>
                              {dispute.admin_note}
                            </p>
                          )}
                        </div>
                      )}

                      {/* AKSİYONLAR VE BİLGİ BANTLARI */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-anthracite-50">
                         {order.status === ORDER_STATUS.WAITING_PAYMENT ? (
                            <div className="bg-amber-50 text-amber-700 p-4 rounded-2xl border border-amber-200 text-xs font-bold flex items-center gap-3 w-full sm:w-auto">
                               <Info className="w-5 h-5 shrink-0" />
                               Lütfen dekontunuzu WhatsApp (Merkez) hattına iletin.
                            </div>
                         ) : order.status === ORDER_STATUS.SHIPPED && order.tracking_number ? (
                            <div className="bg-blue-50 text-blue-700 p-4 rounded-xl border border-blue-100 text-center w-full sm:w-auto">
                               <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Resmi Kargo Takip No</p>
                               <p className="text-xl font-black font-mono">{order.tracking_number}</p>
                            </div>
                         ) : <div className="text-anthracite-300 font-bold text-xs">Süreçler titizlikle takip ediliyor.</div>}

                         <div className="flex items-center gap-3 w-full sm:w-auto">
                            {(order.status === ORDER_STATUS.APPROVED || order.status === ORDER_STATUS.PREPARING || order.status === ORDER_STATUS.SHIPPED) && (
                                <button onClick={() => exportInvoicePDF(order)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-anthracite-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition-all">
                                   <FileText className="w-5 h-5" /> Fatura İndir
                                </button>
                            )}
                            {order.status === ORDER_STATUS.WAITING_PAYMENT && (
                                <button onClick={() => cancelOrder(order.id)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-red-50 text-red-700 border border-red-200 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-100 transition-all">
                                   İptal Et
                                </button>
                            )}
                            {(order.status === ORDER_STATUS.SHIPPED || order.status === ORDER_STATUS.DELIVERED) && canOpenNewDispute && (
                                <button
                                  onClick={() => { setDisputeOrder(order); setShowDisputeModal(true); }}
                                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-amber-50 text-amber-700 border border-amber-200 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-100 transition-all"
                                >
                                  Sorun Bildir
                                </button>
                            )}
                            {(order.status === ORDER_STATUS.SHIPPED || order.status === ORDER_STATUS.DELIVERED) && !canOpenNewDispute && (
                                <span className="flex-1 sm:flex-none text-center px-4 py-3 text-[10px] font-black uppercase text-anthracite-400 border border-dashed border-anthracite-200 rounded-2xl">
                                  Uyuşmazlık süreci devam ediyor
                                </span>
                            )}
                            <Link href="/katalog" className="p-4 bg-white border border-anthracite-200 rounded-2xl text-anthracite-400 hover:text-black transition-all">
                               <ArrowRight className="w-5 h-5" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-xl shadow-2xl relative">
            <h3 className="text-2xl font-black mb-2 text-anthracite-900">Uyuşmazlık / İade Talebi</h3>
            <p className="text-anthracite-500 mb-6 text-sm font-medium">
              Sipariş: <span className="font-black text-anthracite-900">{disputeOrder.product_name}</span>
            </p>
            <form onSubmit={createDispute} className="flex flex-col gap-4">
              <textarea
                required
                minLength={10}
                rows={5}
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                className="w-full px-5 py-4 border border-anthracite-200 rounded-2xl bg-anthracite-50 focus:bg-white focus:ring-4 focus:ring-anthracite-100 outline-none font-medium text-anthracite-900 resize-none transition-all"
                placeholder="Sorunu detaylıca yazın (eksik ürün, hatalı beden, hasarlı teslim vb.)"
              />
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => { setShowDisputeModal(false); setDisputeReason(''); setDisputeOrder(null); }} className="flex-1 py-3 rounded-2xl font-bold text-anthracite-500 hover:bg-anthracite-100 transition-colors">
                  Vazgeç
                </button>
                <button disabled={isSubmittingDispute} type="submit" className="flex-[2] py-3 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-2xl shadow-xl transition-all disabled:opacity-50">
                  {isSubmittingDispute ? 'Gönderiliyor...' : 'Talebi Gönder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
