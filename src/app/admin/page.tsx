"use client";

import { useEffect, useState } from 'react';
import { 
  CheckCircle, Users, Store, UserRound, Wallet, 
  TrendingUp, Package, Clock, ShieldCheck, 
  Archive, FolderArchive, Trash2, LayoutDashboard,
  FileText, History, Info
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

type TabType = 'finance' | 'payments' | 'approvals' | 'archive';

export default function AdminDashboard() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('finance');

  const supabase = createClient();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = '/login';
      return;
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role === 'admin') {
      setIsAdmin(true);
      await fetchPendingUsers();
      await fetchOrders();
    }
    setLoading(false);
  };

  const fetchPendingUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_approved', false)
      .order('created_at', { ascending: false });
    if (data) setProfiles(data);
  };

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, product:product_id(*), wholesaler:wholesaler_id(business_name)')
      .order('created_at', { ascending: false });
    if (data) setOrders(data);
  };

  const approveUser = async (id: string, role: string) => {
    const { error } = await supabase.from('profiles').update({ is_approved: true }).eq('id', id);
    if (!error) {
      alert(`${role === 'toptanci' ? 'Toptancı yetkisi' : 'Müşteri fiyat görme izni'} başarıyla onaylandı!`);
      fetchPendingUsers();
    }
  };

  const approveOrderPayment = async (id: string, wholesalerName: string) => {
    if(!confirm("Müşterinin IBAN adresinize ödeme geçtiğini teyit ettiniz mi? Sipariş üretim/stok için Toptancı deposuna yönlendirilecek!")) return;
    
    const { error } = await supabase.from('orders').update({ status: 'approved' }).eq('id', id);
    if (!error) {
      alert(`Sipariş Onaylandı ve Kasa Güvenceye Alındı! ${wholesalerName || 'Toptancı'} tarafına kargolama emri iletildi.`);
      fetchOrders();
    }
  };

  const archiveOrder = async (id: string) => {
    if(!confirm("Bu siparişi kargolandığı için arşivlemek istiyor musunuz? İstatistikleriniz bozulmaz, sadece görünümden kalkar.")) return;
    const { error } = await supabase.from('orders').update({ is_archived: true }).eq('id', id);
    if (!error) {
      fetchOrders();
    }
  };

  // FİNANSAL HESAPLAMALAR
  const totalCiro = orders.reduce((acc, order) => acc + Number(order.total_price), 0);
  const totalKazaniciniz = orders.reduce((acc, order) => acc + Number(order.commission_earned), 0);
  const toptanciHakedisleri = orders.reduce((acc, order) => acc + Number(order.wholesaler_earning), 0);
  
  // TOPTANCI BAZLI HAKEDİŞ HESAPLAMA (Grup bazlı)
  const wholesalerSummary = orders
    .filter(o => !o.is_archived) // Arşivlenmemiş aktif siparişler üzerinden hakediş takibi
    .reduce((acc: any, order) => {
      const name = order.wholesaler?.business_name || 'Bilinmeyen Toptancı';
      if (!acc[name]) acc[name] = { total: 0, count: 0 };
      acc[name].total += Number(order.wholesaler_earning);
      acc[name].count += 1;
      return acc;
    }, {});

  const waitingOrders = orders.filter(o => o.status === 'waiting_payment' && !o.is_archived);
  const activeOrders = orders.filter(o => (o.status === 'approved' || o.status === 'shipped') && !o.is_archived);
  const archivedOrdersList = orders.filter(o => o.is_archived);

  return (
    <>
    {!isAdmin && !loading ? (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-anthracite-50 px-4">
        <ShieldCheck className="w-24 h-24 text-red-500 mb-6 drop-shadow-md" />
        <h1 className="text-3xl font-black text-anthracite-900 tracking-tight text-center">YETKİSİZ ERİŞİM DURDURULDU</h1>
        <p className="text-anthracite-500 mt-3 text-center max-w-md font-medium">Bu sayfaya girmeye güvenlik izniniz bulunmamaktadır.</p>
        <Link href="/" className="mt-8 px-8 py-3.5 bg-anthracite-900 hover:bg-black transition-colors text-white font-bold rounded-full shadow-xl">Ana Sayfaya Dön ve Terk Et</Link>
      </div>
    ) : (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-anthracite-900">Merkez Komuta ve Finans</h1>
          <p className="text-anthracite-500 font-medium mt-1">Ağdaki tüm nakit akışı ve üyelikleri buradan yönetin.</p>
        </div>
      </div>

      {/* MODAL TABS NAVIGATION */}
      <div className="flex flex-wrap items-center gap-2 mb-10 bg-anthracite-100 p-2 rounded-3xl w-max">
        <button 
          onClick={() => setActiveTab('finance')}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all ${activeTab === 'finance' ? 'bg-white shadow-lg text-anthracite-900' : 'text-anthracite-500 hover:text-black'}`}
        >
          <LayoutDashboard className="w-4 h-4" /> Finans & Operasyon
        </button>
        <button 
          onClick={() => setActiveTab('payments')}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all ${activeTab === 'payments' ? 'bg-white shadow-lg text-anthracite-900' : 'text-anthracite-500 hover:text-black'}`}
        >
          <Wallet className="w-4 h-4" /> Toptancı Hakedişleri
        </button>
        <button 
          onClick={() => setActiveTab('approvals')}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all ${activeTab === 'approvals' ? 'bg-white shadow-lg text-anthracite-900' : 'text-anthracite-500 hover:text-black'}`}
        >
          <Users className="w-4 h-4" /> Üye Onayları {profiles.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">{profiles.length}</span>}
        </button>
        <button 
          onClick={() => setActiveTab('archive')}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all ${activeTab === 'archive' ? 'bg-white shadow-lg text-anthracite-900' : 'text-anthracite-500 hover:text-black'}`}
        >
          <History className="w-4 h-4" /> Arşiv
        </button>
      </div>

      {loading ? (
        <div className="text-center p-20 font-bold text-anthracite-400 animate-pulse">Merkez Kasa Verileri Güvenli Ağdan Çekiliyor...</div>
      ) : (
      <div className="flex flex-col gap-10">

        {/* TAB: FİNANS & OPERASYON */}
        {activeTab === 'finance' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-anthracite-900 rounded-[2rem] p-8 text-white shadow-xl group">
                <p className="text-white/60 font-bold text-xs uppercase tracking-widest mb-1.5">Toplam Satış Hacmi</p>
                <h3 className="text-4xl font-black">{totalCiro.toLocaleString('tr-TR')} <span className="text-xl text-white/50">₺</span></h3>
              </div>
              <div className="bg-emerald-500 rounded-[2rem] p-8 text-white shadow-xl shadow-emerald-500/20">
                <p className="text-white/80 font-bold text-xs uppercase tracking-widest mb-1.5">Net Platform Kazancı</p>
                <h3 className="text-4xl font-black">{totalKazaniciniz.toLocaleString('tr-TR')} <span className="text-xl text-white/50">₺</span></h3>
              </div>
              <div className="bg-white border-2 border-anthracite-100 rounded-[2rem] p-8 shadow-sm">
                <p className="text-anthracite-500 font-bold text-xs uppercase tracking-widest mb-1.5">Toptancı Hakedişleri</p>
                <h3 className="text-4xl font-black text-anthracite-900">{toptanciHakedisleri.toLocaleString('tr-TR')} <span className="text-xl text-anthracite-400">₺</span></h3>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-10">
              <div className="bg-white border-2 border-anthracite-100 rounded-[2.5rem] p-8 shadow-xl">
                 <h2 className="text-xl font-bold flex items-center gap-3 mb-6 border-b border-anthracite-100 pb-5 text-anthracite-900">
                   <Clock className="w-6 h-6 text-amber-500" /> Dekont Bekleyenler
                 </h2>
                 <div className="space-y-4">
                   {waitingOrders.length === 0 ? (
                     <p className="text-sm font-semibold text-anthracite-400 text-center py-10 bg-anthracite-50 rounded-2xl">Ödeme bekleyen sipariş bulunmuyor.</p>
                   ) : waitingOrders.map(order => (
                     <div key={order.id} className="p-6 bg-amber-50/50 border border-amber-100 rounded-3xl flex flex-col gap-4">
                        <div className="flex justify-between items-start">
                           <div>
                             <h3 className="font-black text-xl text-anthracite-900">{order.buyer_name}</h3>
                             <p className="text-sm font-bold text-anthracite-500">{order.product_name}</p>
                           </div>
                           <span className="text-2xl font-black text-amber-600">{Number(order.total_price).toLocaleString('tr-TR')} ₺</span>
                        </div>
                        <button onClick={()=>approveOrderPayment(order.id, order.wholesaler?.business_name)} className="w-full py-4 bg-anthracite-900 text-white font-black text-sm rounded-2xl shadow-xl transition-all hover:bg-black">TEYİT EDİLDİ - ONAYLA</button>
                     </div>
                   ))}
                 </div>
              </div>

              <div className="bg-anthracite-50 border border-anthracite-200 rounded-[2.5rem] p-8">
                 <h2 className="text-xl font-bold flex items-center gap-3 mb-6 border-b border-anthracite-200 pb-5 text-anthracite-900">
                   <Package className="w-6 h-6 text-emerald-500" /> Operasyon Ağı
                 </h2>
                 <div className="space-y-4">
                   {activeOrders.length === 0 ? (
                     <p className="text-sm font-semibold text-anthracite-400 text-center py-10 bg-white rounded-2xl">Aktif kargo süreci bulunmuyor.</p>
                   ) : activeOrders.map(order => (
                     <div key={order.id} className="p-6 bg-white border border-anthracite-100 rounded-3xl flex flex-col gap-3 shadow-sm relative group">
                        <div className="flex justify-between items-start">
                           <div>
                             <span className={`text-[10px] font-black tracking-widest px-3 py-1 rounded-full border ${order.status === 'shipped' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-emerald-50 border-emerald-200 text-emerald-600'}`}>
                               {order.status === 'shipped' ? 'KARGOLANDI' : 'ÜRETİM/STOK'}
                             </span>
                             <h3 className="font-black text-lg text-anthracite-900 mt-3">{order.buyer_name}</h3>
                             <p className="text-xs font-bold text-anthracite-500">Tedarikçi: {order.wholesaler?.business_name || 'Bilinmiyor'}</p>
                           </div>
                           <div className="flex flex-col items-end gap-2">
                             <span className="text-2xl font-black">{order.quantity} Adet</span>
                             {order.status === 'shipped' && (
                               <button onClick={() => archiveOrder(order.id)} className="opacity-0 group-hover:opacity-100 bg-anthracite-900 text-white p-2 rounded-xl transition-all hover:bg-emerald-500" title="Arşivle">
                                 <FolderArchive className="w-4 h-4" />
                               </button>
                             )}
                           </div>
                        </div>
                        {order.status === 'shipped' && order.tracking_number && (
                          <div className="mt-2 bg-blue-50 text-blue-800 p-3 rounded-xl border border-blue-100 text-[10px] font-black tracking-widest text-center">
                            TAKİP NO: {order.tracking_number}
                          </div>
                        )}
                     </div>
                   ))}
                 </div>
              </div>
            </div>
          </>
        )}

        {/* TAB: TOPTANCI HAKEDİŞLERİ */}
        {activeTab === 'payments' && (
          <div className="bg-white border-2 border-anthracite-100 rounded-[2.5rem] p-10 shadow-xl">
            <h2 className="text-2xl font-black text-anthracite-900 mb-2 flex items-center gap-3">
               <Wallet className="w-7 h-7 text-emerald-500" /> Toptancı Hakediş Hesapları
            </h2>
            <p className="text-anthracite-500 font-medium mb-8">Hangi toptancıya toplamda ne kadar ödeme yapılması gerektiğini buradan takip edebilirsiniz.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {Object.entries(wholesalerSummary).length === 0 ? (
                 <p className="col-span-full text-center py-20 font-bold text-anthracite-400">Henüz hakedişi oluşmuş bir toptancı bulunmuyor.</p>
               ) : Object.entries(wholesalerSummary).map(([name, data]: [any, any]) => (
                 <div key={name} className="bg-anthracite-50 border border-anthracite-100 rounded-3xl p-8 flex flex-col gap-4 shadow-sm hover:shadow-lg transition-all">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                       <Store className="w-6 h-6 text-anthracite-400" />
                    </div>
                    <div>
                       <h3 className="font-black text-xl text-anthracite-900">{name}</h3>
                       <p className="text-xs font-bold text-anthracite-500 uppercase tracking-widest mt-1">{data.count} Aktif Sipariş</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-anthracite-200">
                       <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Toplam Alacak</p>
                       <span className="text-3xl font-black text-emerald-600">{data.total.toLocaleString('tr-TR')} ₺</span>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {/* TAB: ÜYE ONAYLARI */}
        {activeTab === 'approvals' && (
          <div className="bg-white border-2 border-anthracite-100 rounded-[2.5rem] p-10 shadow-xl">
             <h2 className="text-2xl font-black text-anthracite-900 mb-2 flex items-center gap-3">
               <ShieldCheck className="w-7 h-7 text-blue-500" /> Onay Bekleyen Hesaplar
             </h2>
             <p className="text-anthracite-500 font-medium mb-8">Platforma girmek için giriş yapmış ve admin teyidi bekleyen üyeler.</p>
             <div className="space-y-4">
                {profiles.length === 0 ? (
                  <p className="text-center py-20 font-bold text-anthracite-400">Bekleyen üyelik talebi yok.</p>
                ) : profiles.map(profile => (
                  <div key={profile.id} className="flex flex-col sm:flex-row items-center justify-between p-6 bg-anthracite-50 rounded-[2rem] border border-anthracite-100 gap-6">
                     <div className="flex items-center gap-5 mr-auto">
                        <div className={`p-4 rounded-2xl ${profile.role === 'toptanci' ? 'bg-emerald-500' : 'bg-blue-500'} text-white shadow-xl`}>
                          {profile.role === 'toptanci' ? <Store /> : <UserRound />}
                        </div>
                        <div>
                           <h3 className="font-black text-xl">{profile.business_name || 'İsimsiz Üye'}</h3>
                           <span className="text-xs font-bold uppercase tracking-widest opacity-50">{profile.role === 'toptanci' ? 'Toptancı' : 'Butik'}</span>
                        </div>
                     </div>
                     <button onClick={() => approveUser(profile.id, profile.role)} className="bg-anthracite-900 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl hover:bg-black transition-all">YETKİ VER VE ONAYLA</button>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* TAB: ARŞİV */}
        {activeTab === 'archive' && (
           <div className="bg-white border-2 border-anthracite-100 rounded-[2.5rem] p-10 shadow-xl">
              <h2 className="text-2xl font-black text-anthracite-900 mb-8 flex items-center gap-3">
                <Archive className="w-7 h-7 text-anthracite-400" /> Sipariş Geçmişi (Arşiv)
              </h2>
              <div className="space-y-4">
                {archivedOrdersList.length === 0 ? (
                  <p className="text-center py-20 font-bold text-anthracite-400">Arşivlenmiş sipariş bulunmuyor.</p>
                ) : archivedOrdersList.map(order => (
                  <div key={order.id} className="p-6 border-b border-anthracite-100 flex justify-between items-center opacity-70">
                     <div className="flex items-center gap-4">
                        <Package className="w-10 h-10 text-anthracite-300" />
                        <div>
                           <h3 className="font-bold text-lg">{order.product_name}</h3>
                           <p className="text-xs font-medium text-anthracite-500">{order.buyer_name} | {new Date(order.created_at).toLocaleDateString('tr-TR')}</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <span className="block font-black text-xl">{Number(order.total_price).toLocaleString('tr-TR')} ₺</span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">TAMAMLANDI</span>
                     </div>
                  </div>
                ))}
              </div>
           </div>
        )}

      </div>
      )}
    </div>
    )}
    </>
  );
}
