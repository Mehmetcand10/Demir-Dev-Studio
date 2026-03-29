"use client";

import { useEffect, useState } from 'react';
import { Package, ArrowLeft, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

export default function ToptanciSiparisler() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        fetchMyOrders(user.id);
      }
    }
    init();
  }, []);

  const fetchMyOrders = async (userId: string) => {
    setLoadingOrders(true);
    const { data } = await supabase
      .from('orders')
      .select('*, product:product_id(name, images)')
      .eq('wholesaler_id', userId)
      .order('created_at', { ascending: false });
    
    if (data) setOrders(data);
    setLoadingOrders(false);
  };

  const handleShipOrder = async (orderId: string) => {
    const trackingCode = window.prompt("Lütfen kargoya verdiğiniz paketin Geçerli Takip Numarasını (Örn: YK-109232) yazınız:");
    if (!trackingCode) return;
    
    const { error } = await supabase.from('orders').update({
       status: 'shipped',
       tracking_number: trackingCode
    }).eq('id', orderId);
    
    if(!error) {
       alert("Mükemmel! Kargo takip numarası sisteme işlendi ve Müşterinin (Butik) sayfasına anında mavi bantla yansıtıldı.");
       fetchMyOrders(user.id);
    } else {
       alert("Kargo kodu girilirken hata: " + error.message);
    }
  };

  if (!user && !loadingOrders) return <div className="p-20 text-center font-bold">Oturum Aranıyor...</div>;

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen bg-anthracite-50/50">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-anthracite-200 pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-anthracite-900 flex items-center gap-3">
            <Package className="w-10 h-10 text-emerald-500" /> Kargo & Lojistik Masası
          </h1>
          <p className="text-anthracite-500 font-medium mt-1 text-lg">Platformdan aldığınız resmi satışı onaylanmış siparişlerinizi bu odadan kargolayıp gönderin.</p>
        </div>
        <Link href="/toptanci" className="flex items-center gap-2 text-anthracite-700 bg-white border border-anthracite-200 shadow-sm hover:shadow-md px-6 py-3 rounded-2xl font-black transition-all hover:-translate-x-1">
          <ArrowLeft className="w-5 h-5" /> Üretim Atölyesine (Raflara) Dön
        </Link>
      </div>

      <div className="bg-white border border-anthracite-200 rounded-[2.5rem] p-8 sm:p-10 shadow-xl">
        <h2 className="text-2xl font-black flex items-center gap-3 mb-8 border-b border-anthracite-100 pb-5 text-anthracite-900">
           Müşteriye Gönderilmeyi Bekleyen Paketleriniz
        </h2>
        
        {loadingOrders ? (
          <div className="flex flex-col items-center justify-center py-20">
             <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
             <p className="text-lg font-bold text-anthracite-500">Merkezdeki lojistik ağınız taranıyor...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-24 text-center bg-anthracite-50/50 rounded-3xl border border-dashed border-anthracite-200">
             <h3 className="text-2xl font-black text-anthracite-500 mb-3">Henüz Sipariş Ulaşmadı</h3>
             <p className="text-base font-medium text-anthracite-400 max-w-lg mx-auto">Admin (Demir Dev Studio) siparişi onaylayıp parayı kasaya güvenceye aldığında ürün buraya &quot;Kargoya Hazır&quot; olarak düşecektir.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {orders.map(order => (
               <div key={order.id} className="bg-anthracite-50 border border-anthracite-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between transition-all hover:bg-white hover:shadow-xl hover:-translate-y-1">
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${order.status === 'shipped' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'}`}>
                        {order.status === 'shipped' ? 'KARGOLANDI GİTTİ' : 'YENİ SİPARİŞ - HAZIRLA'}
                      </span>
                      <span className="font-black text-emerald-900 border-2 border-emerald-100 bg-emerald-50 px-3 py-1.5 rounded-xl shadow-sm">
                        {Number(order.quantity)} Adet
                      </span>
                    </div>
                    <h3 className="text-2xl font-black text-anthracite-900 mb-2 leading-tight">{order.product_name || "Silinmiş Ürün"}</h3>
                    <p className="text-sm font-black text-emerald-600 mb-6 tracking-widest uppercase">Hesaba Geçecek Ciro: {Number(order.wholesaler_earning).toLocaleString('tr-TR')} ₺</p>
                    
                    <div className="bg-white p-5 rounded-2xl border border-anthracite-100 mb-6 shadow-inner">
                      <p className="text-[10px] font-black uppercase text-anthracite-400 tracking-widest mb-3 border-b border-anthracite-50 pb-2">Teslimat Adresi (İrsaliye)</p>
                      <p className="font-black text-anthracite-900 text-lg mb-1">{order.buyer_name}</p>
                      <p className="text-sm font-medium text-anthracite-600 mt-1 leading-relaxed">{order.shipping_address}</p>
                      <p className="text-xs font-black text-emerald-700 mt-4 bg-emerald-50 p-3 rounded-xl border border-emerald-100">İletişim: {order.buyer_phone}</p>
                    </div>
                  </div>

                  {order.status === 'approved' ? (
                     <button onClick={() => handleShipOrder(order.id)} className="w-full bg-anthracite-900 hover:bg-black text-white font-black text-sm uppercase tracking-widest py-4 rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2">
                       Kargola ve Takip No Gir
                     </button>
                  ) : (
                     <div className="bg-blue-50 text-blue-800 p-4 rounded-xl border border-blue-200 text-sm font-black text-center tracking-widest flex items-center justify-center gap-2">
                        <Package className="w-4 h-4"/> KOD: {order.tracking_number || "HATA! NUMARA GİRİLMEDİ"}
                     </div>
                  )}
               </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
