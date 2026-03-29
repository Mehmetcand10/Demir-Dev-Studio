"use client";

import { useEffect, useState } from 'react';
import { CheckCircle, Users, Store, UserRound, Wallet, TrendingUp, Package, Clock, ShieldCheck } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

export default function AdminDashboard() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

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

  const totalCiro = orders.reduce((acc, order) => acc + Number(order.total_price), 0);
  const totalKazaniciniz = orders.reduce((acc, order) => acc + Number(order.commission_earned), 0);
  const toptanciHakedisleri = orders.reduce((acc, order) => acc + Number(order.wholesaler_earning), 0);
  
  const waitingOrders = orders.filter(o => o.status === 'waiting_payment');
  const activeOrders = orders.filter(o => o.status === 'approved' || o.status === 'shipped');

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-anthracite-900">Merkez Komuta ve Finans Masası</h1>
          <p className="text-anthracite-500 font-medium mt-1">Stüdyonun tüm nakit akışı, ödeme onayları ve tedarik zincirine hükmedin.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center p-20 font-bold text-anthracite-400 animate-pulse">Merkez Kasa Verileri Güvenli Ağdan Çekiliyor...</div>
      ) : (
      <div className="flex flex-col gap-10">

        {/* 1. KASA & FİNANSAL PROJEKSİYON (Faz 4) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-anthracite-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group">
             <div className="relative z-10">
               <Wallet className="w-8 h-8 text-white/50 mb-4" />
               <p className="text-white/60 font-bold text-xs uppercase tracking-widest mb-1.5">Ağdan Geçen Toplam Satış Hacmi</p>
               <h3 className="text-4xl font-black">{totalCiro.toLocaleString('tr-TR')} <span className="text-xl text-white/50">₺</span></h3>
             </div>
             <div className="absolute -right-10 -bottom-10 bg-white/5 w-48 h-48 rounded-full blur-2xl group-hover:scale-150 transition-all"></div>
           </div>

           <div className="bg-emerald-500 rounded-3xl p-8 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden group">
             <div className="relative z-10">
               <TrendingUp className="w-8 h-8 text-white/50 mb-4" />
               <p className="text-white/80 font-bold text-xs uppercase tracking-widest mb-1.5">Net Komisyon Kârınız (Studio Kasası)</p>
               <h3 className="text-4xl font-black">{totalKazaniciniz.toLocaleString('tr-TR')} <span className="text-xl text-white/50">₺</span></h3>
             </div>
           </div>

           <div className="bg-white border-2 border-anthracite-100 rounded-3xl p-8 shadow-sm">
             <Package className="w-8 h-8 text-anthracite-300 mb-4" />
             <p className="text-anthracite-500 font-bold text-xs uppercase tracking-widest mb-1.5">Toptancı Tedarik Hakedişleri (Ödenecek)</p>
             <h3 className="text-4xl font-black text-anthracite-900">{toptanciHakedisleri.toLocaleString('tr-TR')} <span className="text-xl text-anthracite-400">₺</span></h3>
           </div>
        </div>

        {/* 2. SİPARİŞ ONAY VE LOJİSTİK MASASI (Faz 4) */}
        <div className="grid lg:grid-cols-2 gap-10">
          
          {/* DEKONT BEKLEYENLER */}
          <div className="bg-white border-2 border-anthracite-100 rounded-[2rem] p-8 shadow-xl">
             <h2 className="text-xl font-bold flex items-center gap-3 mb-6 border-b border-anthracite-100 pb-5 text-anthracite-900">
               <Clock className="w-6 h-6 text-amber-500" /> Banka Dekontu Onayı Bekleyenler
             </h2>
             <div className="space-y-4">
               {waitingOrders.length === 0 ? (
                 <p className="text-sm font-semibold text-anthracite-400 text-center py-10 bg-anthracite-50 rounded-2xl border border-dashed border-anthracite-200">Sırada ödeme / dekont bekleyen yeni sipariş yok.</p>
               ) : waitingOrders.map(order => (
                 <div key={order.id} className="p-6 bg-amber-50/50 border border-amber-100 rounded-3xl flex flex-col gap-4 transition-all hover:bg-amber-50">
                    <div className="flex justify-between items-start">
                       <div>
                         <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-100/50 px-3 py-1 rounded-full border border-amber-200">Dekont Bekliyor</span>
                         <h3 className="font-black text-xl text-anthracite-900 mt-3">{order.buyer_name}</h3>
                         <p className="text-sm font-bold text-anthracite-500">{order.product_name}</p>
                       </div>
                       <div className="text-right">
                         <span className="block text-2xl font-black text-amber-600">{Number(order.total_price).toLocaleString('tr-TR')} ₺</span>
                         <span className="inline-block mt-2 text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md text-right">+ {Number(order.commission_earned).toLocaleString('tr-TR')} ₺ Kâr</span>
                       </div>
                    </div>
                    <button onClick={()=>approveOrderPayment(order.id, order.wholesaler.business_name)} className="w-full mt-3 py-4 bg-anthracite-900 hover:bg-black text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl transition-all hover:scale-[1.01]">
                       Havale/EFT Teyit Edildi - Toptancıya İlet
                    </button>
                 </div>
               ))}
             </div>
          </div>

          {/* AKTİF SİPARİŞLER (Toptancıda olanlar) */}
          <div className="bg-anthracite-50 border border-anthracite-200 rounded-[2rem] p-8">
             <h2 className="text-xl font-bold flex items-center gap-3 mb-6 border-b border-anthracite-200 pb-5 text-anthracite-900">
               <Package className="w-6 h-6 text-emerald-500" /> Operasyon (Üretim & Kargo) Ağı
             </h2>
             <div className="space-y-4">
               {activeOrders.length === 0 ? (
                 <p className="text-sm font-semibold text-anthracite-400 text-center py-10 bg-white border border-dashed border-anthracite-200 rounded-2xl">Aktif olarak üretimde veya kargoda sipariş yok.</p>
               ) : activeOrders.map(order => (
                 <div key={order.id} className="p-6 bg-white border border-anthracite-100 rounded-3xl flex flex-col gap-3 shadow-sm transition-all hover:shadow-md">
                    <div className="flex justify-between items-start">
                       <div>
                         <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${order.status === 'shipped' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-emerald-50 border-emerald-200 text-emerald-600'}`}>
                           {order.status === 'shipped' ? 'KARGOLANDI' : 'TOPTANCI HAZIRLIYOR'}
                         </span>
                         <h3 className="font-black text-lg text-anthracite-900 mt-3">{order.buyer_name}</h3>
                         <p className="text-xs font-bold text-anthracite-500 mb-1">Tedarikçi: {order.wholesaler?.business_name || 'Silinmiş'}</p>
                       </div>
                       <div className="text-right">
                         <span className="block text-2xl font-black text-anthracite-900">{Number(order.quantity)} <span className="text-base text-anthracite-400">Adet</span></span>
                       </div>
                    </div>
                    {order.status === 'shipped' && order.tracking_number && (
                      <div className="mt-2 bg-blue-50 text-blue-800 p-4 rounded-2xl border border-blue-100 text-sm font-black text-center tracking-widest break-all">
                        TAKİP NO: {order.tracking_number}
                      </div>
                    )}
                 </div>
               ))}
             </div>
          </div>

        </div>

        <div className="w-full h-px bg-anthracite-200 my-6"></div>

        {/* 3. AĞA GİRMEK İÇİN BEKLEYENLER (Eski Onay Mekanizması) */}
        <div className="bg-white border border-anthracite-200 rounded-[2rem] p-8 shadow-sm w-full">
          <h2 className="text-xl font-bold flex items-center gap-3 mb-6 border-b border-anthracite-100 pb-5 justify-center lg:justify-start">
            <Users className="w-6 h-6 text-anthracite-500" /> B2B Güvenlik Onayı Bekleyen Hesaplar
          </h2>
          <div className="space-y-4">
            {profiles.length === 0 ? (
              <div className="text-center py-10 px-4 bg-anthracite-50 rounded-3xl border border-dashed border-anthracite-200">
                 <p className="font-bold text-anthracite-500">Tertemiz! Olası bir beklemede giriş talebi bulunmuyor.</p>
              </div>
            ) : (
              profiles.map(profile => (
                <div key={profile.id} className={`flex flex-col lg:flex-row lg:items-center justify-between p-6 rounded-3xl border-2 gap-6 transition-all hover:bg-white hover:shadow-xl ${profile.role === 'toptanci' ? 'bg-emerald-50/50 border-emerald-100' : 'bg-blue-50/50 border-blue-100'}`}>
                  <div className="flex items-start sm:items-center gap-5">
                    <div className={`shrink-0 p-3 sm:p-5 rounded-2xl shadow-md ${profile.role === 'toptanci' ? 'bg-emerald-500 shadow-emerald-500/20 text-white' : 'bg-blue-500 shadow-blue-500/20 text-white'}`}>
                      {profile.role === 'toptanci' ? <Store className="w-8 h-8" /> : <UserRound className="w-8 h-8" />}
                    </div>
                    <div className="text-left">
                       <h3 className="text-xl font-black text-anthracite-900 mb-2">{profile.business_name}</h3>
                       <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${profile.role === 'toptanci' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-blue-100 text-blue-800 border border-blue-200'}`}>
                          {profile.role === 'toptanci' ? 'Toptancı Firması' : 'Butik Müşterisi'}
                       </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => approveUser(profile.id, profile.role)}
                    className="shrink-0 flex items-center justify-center gap-2 text-sm font-black text-white px-8 py-5 bg-anthracite-900 hover:bg-black rounded-2xl transition-all shadow-xl hover:scale-[1.02]"
                  >
                    <CheckCircle className="w-5 h-5" /> İçeri Al ve Yetki Ver
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
      )}
    </div>
    )}
    </>
  );
}
