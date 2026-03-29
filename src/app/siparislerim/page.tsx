"use client";

import { useEffect, useState } from 'react';
import { PackageSearch, PackageCheck, Clock, Truck } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import Image from 'next/image';
import Link from 'next/link';

export default function Siparislerim() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login';
        return;
      }
      setUser(user);
      
      const { data } = await supabase
        .from('orders')
        .select('*, product:product_id(images)')
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });
        
      if(data) setOrders(data);
      setLoading(false);
    }
    loadData();
  }, []);

  if(!user && !loading) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-4xl font-black tracking-tight text-anthracite-900 border-b border-anthracite-200 pb-5">
          Siparişlerim ve Kargo Takibi
        </h1>
        <p className="text-anthracite-500 font-medium mt-4">Mağazanıza aldığınız ürünlerin toptancıdaki üretim ve kargo süreçlerini (İrsaliyelerini) buradan şeffafça izleyebilirsiniz.</p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-anthracite-400 font-bold animate-pulse tracking-widest uppercase text-xs">Ağdaki Sipariş geçmişiniz taranıyor...</div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-[3rem] border border-dashed border-anthracite-200 p-16 text-center shadow-lg">
          <PackageSearch className="w-20 h-20 text-anthracite-200 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-anthracite-900 mb-2">Henüz Hiç Sipariş Vermemişsiniz</h2>
          <p className="text-anthracite-500 mb-8 max-w-sm mx-auto font-medium">B2B ağındaki toptancıların harika tasarımlarını incelemeye ve mağazanızı doldurmaya hemen başlayın.</p>
          <Link href="/katalog" className="bg-anthracite-900 text-white px-10 py-5 rounded-full font-black text-lg shadow-xl shadow-anthracite-900/20 hover:scale-105 transition-all">Vitrine Git</Link>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {orders.map((order) => {
            const date = new Date(order.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
            
            return (
              <div key={order.id} className="bg-white border text-left border-anthracite-100 rounded-[2.5rem] p-6 lg:p-8 flex flex-col md:flex-row gap-8 items-center md:items-start shadow-sm hover:shadow-2xl transition-all">
                 <div className="w-32 h-44 shrink-0 bg-anthracite-50 rounded-3xl overflow-hidden relative shadow-inner border border-anthracite-100 cursor-pointer hover:scale-105 transition-transform">
                   <Image 
                     src={order.product?.images?.[0] || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80'} 
                     alt="product" 
                     fill 
                     className="object-cover" 
                   />
                 </div>
                 
                 <div className="flex-1 w-full flex flex-col justify-between">
                    <div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-anthracite-50 pb-5 mb-5">
                         <h3 className="text-2xl font-black text-anthracite-900 leading-tight drop-shadow-sm">{order.product_name || "Bilinmeyen Ürün"}</h3>
                         <span className="font-black text-2xl text-emerald-800 border-2 border-emerald-100 bg-emerald-50 px-5 py-2.5 rounded-2xl shadow-sm shrink-0">
                            {Number(order.total_price).toLocaleString('tr-TR')} ₺
                         </span>
                      </div>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8 text-left">
                        <div>
                          <p className="text-[10px] uppercase font-black tracking-widest text-anthracite-400 mb-1.5 ml-1">Onaylanan Miktar</p>
                          <p className="font-bold text-sm bg-anthracite-50 px-4 py-2 rounded-xl w-max border border-anthracite-100 text-anthracite-900">{Number(order.quantity)} Parça</p>
                        </div>
                        <div className="col-span-3">
                          <p className="text-[10px] uppercase font-black tracking-widest text-anthracite-400 mb-1.5 ml-1">Sistem İşlem Tarihi</p>
                          <p className="font-bold text-sm bg-anthracite-50 px-4 py-2 rounded-xl w-max border border-anthracite-100 text-anthracite-900">{date}</p>
                        </div>
                      </div>
                    </div>

                    {/* STATU BARI */}
                    <div className="bg-anthracite-50/50 rounded-2xl p-5 border border-anthracite-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-inner">
                       <div className="flex items-center gap-4">
                          {order.status === 'waiting_payment' && (
                             <><div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200 shadow-md"><Clock className="w-6 h-6"/></div>
                             <div><h4 className="font-black text-lg text-amber-700">Ödeme & Dekont Bekleniyor</h4><p className="text-xs font-medium text-amber-900/60 mt-0.5 max-w-sm">Merkeze (WhatsApp&apos;a) havale yaptıktan sonra siparişiniz hızla onaylanacaktır.</p></div></>
                          )}
                          
                          {order.status === 'approved' && (
                             <><div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200 shadow-md shadow-emerald-500/10"><PackageCheck className="w-6 h-6"/></div>
                             <div><h4 className="font-black text-lg text-emerald-700">Ödendi, Sipariş Hazırlanıyor</h4><p className="text-xs font-bold text-emerald-900/60 mt-0.5 max-w-sm">Depoda; toptancı üretimi tamamlayıp kargoya vermek üzere.</p></div></>
                          )}

                          {order.status === 'shipped' && (
                             <><div className="w-14 h-14 rounded-2xl bg-blue-500 text-white flex items-center justify-center shrink-0 border border-blue-600 shadow-xl shadow-blue-500/30"><Truck className="w-6 h-6"/></div>
                             <div><h4 className="font-black text-lg text-blue-700">Kargonuz Yola Çıktı!</h4><p className="text-xs font-bold text-blue-900/60 mt-0.5 max-w-sm">Satıcı paketlemeyi bitirdi, mallarınız kargoya teslim edildi.</p></div></>
                          )}
                       </div>

                       {order.status === 'shipped' && order.tracking_number && (
                          <div className="text-right shrink-0 bg-white p-4 rounded-xl shadow-sm border border-anthracite-100">
                             <p className="text-[10px] uppercase font-black text-blue-400 mb-1.5 tracking-widest">RESMİ TAKİP NO</p>
                             <p className="text-xl font-black text-blue-700 font-mono tracking-wider">{order.tracking_number}</p>
                          </div>
                       )}
                    </div>
                 </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  );
}
