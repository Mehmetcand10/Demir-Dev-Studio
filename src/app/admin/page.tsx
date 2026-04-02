"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  CheckCircle, Users, Store, UserRound, Wallet, 
  TrendingUp, Package, Clock, ShieldCheck, 
  Archive, FolderArchive, Trash2, LayoutDashboard,
  FileText, History, Info, Printer, Megaphone, Send,
  ArrowRight, BarChart3, Receipt, UserCheck
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { createClient } from '@/utils/supabase/client';
import { exportInvoicePDF } from '@/utils/exportInvoice';
import { QRCodeSVG } from 'qrcode.react';
import NotificationBell from '@/components/NotificationBell';
import { notify } from '@/utils/notifications';
import Link from 'next/link';
import Image from 'next/image';

type TabType = 'overview' | 'orders' | 'payments' | 'approvals' | 'announcements' | 'archive';

export default function AdminDashboard() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [mounted, setMounted] = useState(false);
  
  // Duyuru State'leri
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annTarget, setAnnTarget] = useState('all');
  const [annType, setAnnType] = useState('info');
  const [isPublishing, setIsPublishing] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  const fetchPendingUsers = useCallback(async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_approved', false)
      .order('created_at', { ascending: false });
    if (data) setProfiles(data);
  }, [supabase]);

  const fetchOrders = useCallback(async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, product:product_id(*), wholesaler:wholesaler_id(business_name)')
      .order('created_at', { ascending: false });
    if (data) setOrders(data);
  }, [supabase]);

  const fetchAnnouncements = useCallback(async () => {
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setAnnouncements(data);
  }, [supabase]);

  const checkAdminAccess = useCallback(async () => {
    setLoading(true);
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      window.location.href = '/login';
      return;
    }
    setUser(authUser);

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', authUser.id).single();
    if (profile?.role === 'admin') {
      setIsAdmin(true);
      await Promise.all([fetchPendingUsers(), fetchOrders(), fetchAnnouncements()]);
    }
    setLoading(false);
  }, [supabase, fetchPendingUsers, fetchOrders, fetchAnnouncements]);

  useEffect(() => {
    setMounted(true);
    checkAdminAccess();
  }, [checkAdminAccess]);

  const approveUser = async (id: string, role: string) => {
    const { error } = await supabase.from('profiles').update({ is_approved: true }).eq('id', id);
    if (!error) {
      alert(`${role === 'toptanci' ? 'Toptancı yetkisi' : 'Müşteri fiyat görme izni'} başarıyla onaylandı!`);
      fetchPendingUsers();
    }
  };

  const approveOrderPayment = async (orderId: string, wholesalerName: string) => {
    if(!confirm("Müşterinin IBAN adresinize ödeme geçtiğini teyit ettiniz mi? Sipariş üretim/stok için Toptancı deposuna yönlendirilecek!")) return;
    
    // Stok düşme ve bildirim mantığı (Aynı kalıyor)
    const { data: order } = await supabase.from('orders').select('product_id, selected_size, quantity, buyer_id, product_name').eq('id', orderId).single();
    if (order && order.selected_size) {
      const { data: product } = await supabase.from('products').select('stocks').eq('id', order.product_id).single();
      if (product && product.stocks) {
        const newStocks = { ...product.stocks };
        newStocks[order.selected_size] = Math.max(0, (Number(newStocks[order.selected_size]) || 0) - order.quantity);
        await supabase.from('products').update({ stocks: newStocks }).eq('id', order.product_id);
      }
    }

    const { error } = await supabase.from('orders').update({ status: 'approved' }).eq('id', orderId);
    if (!error) {
      await notify(order?.buyer_id, "✅ Ödemeniz Onaylandı!", `'${order?.product_name}' siparişiniz onaylandı ve toptancıya kargo emri iletildi.`, 'success');
      alert(`Sipariş Onaylandı! ${wholesalerName || 'Toptancı'} tarafına kargolama emri iletildi.`);
      fetchOrders();
    }
  };

  const archiveOrder = async (id: string) => {
    if(!confirm("Bu siparişi kargolandığı için arşivlemek istiyor musunuz?")) return;
    const { error } = await supabase.from('orders').update({ is_archived: true }).eq('id', id);
    if (!error) fetchOrders();
  };

  const handlePublishAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublishing(true);
    const { error } = await supabase.from('announcements').insert({ title: annTitle, content: annContent, target_role: annTarget, type: annType });
    if (!error) { alert("Duyuru başarıyla yayınlandı!"); setAnnTitle(''); setAnnContent(''); fetchAnnouncements(); }
    setIsPublishing(false);
  };

  const deleteAnnouncement = async (id: string) => {
    if(!confirm("Bu duyuruyu kaldırmak istiyor musunuz?")) return;
    await supabase.from('announcements').delete().eq('id', id);
    fetchAnnouncements();
  };

  // HESAPLAMALAR
  const totalCiro = useMemo(() => orders.reduce((acc, o) => acc + Number(o.total_price), 0), [orders]);
  const totalProfit = useMemo(() => orders.reduce((acc, o) => acc + Number(o.commission_earned), 0), [orders]);
  const pendingOrdersCount = useMemo(() => orders.filter(o => o.status === 'waiting_payment' && !o.is_archived).length, [orders]);
  const pendingApprovalsCount = profiles.length;

  const chartData = useMemo(() => orders
    .filter(o => !o.is_archived)
    .reduce((acc: any[], order) => {
      const date = new Date(order.created_at).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
      const existing = acc.find(item => item.name === date);
      if (existing) { existing.sales += Number(order.total_price); existing.profit += Number(order.commission_earned); }
      else { acc.push({ name: date, sales: Number(order.total_price), profit: Number(order.commission_earned) }); }
      return acc;
    }, []).slice(-10), [orders]);

  const wholesalerSummary = useMemo(() => orders
    .filter(o => !o.is_archived)
    .reduce((acc: any, order) => {
      const name = order.wholesaler?.business_name || 'Bilinmeyen Toptancı';
      if (!acc[name]) acc[name] = { total: 0, count: 0 };
      acc[name].total += Number(order.wholesaler_earning);
      acc[name].count += 1;
      return acc;
    }, {}), [orders]);

  const activeOrders = useMemo(() => orders.filter(o => !o.is_archived), [orders]);

  return (
    <>
    {!isAdmin && !loading ? (
      <div className="min-h-screen flex items-center justify-center bg-anthracite-50 px-4">
        <ShieldCheck className="w-24 h-24 text-red-500 mb-6 drop-shadow-md" />
        <h1 className="text-3xl font-black text-anthracite-900 tracking-tight text-center uppercase">YETKİSİZ ERİŞİM</h1>
        <Link href="/" className="mt-8 px-8 py-3.5 bg-anthracite-900 text-white font-bold rounded-2xl shadow-xl">Geri Dön</Link>
      </div>
    ) : (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen bg-anthracite-50/20">
      
      {/* ÜST BAŞLIK VE BİLDİRİM */}
      <div className="flex justify-between items-center mb-10 gap-4">
        <div>
           <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <BarChart3 className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-100 px-2 py-0.5 rounded">MERKEZ KOMUTA</span>
           </div>
           <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-anthracite-900 text-left">Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-2xl border border-anthracite-100 shadow-sm">
                {user && <NotificationBell userId={user.id} />}
            </div>
        </div>
      </div>

      {/* BENTO STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-anthracite-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-16 h-16" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-2">Toplam Ciro</p>
              <h3 className="text-3xl font-black">{totalCiro.toLocaleString('tr-TR')} ₺</h3>
          </div>
          <div className="bg-emerald-500 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-emerald-500/20 group">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2">Platform Kârı</p>
              <h3 className="text-3xl font-black">{totalProfit.toLocaleString('tr-TR')} ₺</h3>
          </div>
          <div onClick={() => setActiveTab('orders')} className="bg-white p-8 rounded-[2.5rem] border-2 border-anthracite-100 shadow-sm cursor-pointer group hover:border-amber-400 transition-colors">
              <p className="text-[10px] font-black uppercase tracking-widest text-anthracite-400 mb-2">Bekleyen Ödemeler</p>
              <h3 className="text-3xl font-black text-anthracite-900 flex items-center gap-2">
                  {pendingOrdersCount} <span className="text-sm font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">İŞLEM</span>
              </h3>
          </div>
          <div onClick={() => setActiveTab('approvals')} className="bg-white p-8 rounded-[2.5rem] border-2 border-anthracite-100 shadow-sm cursor-pointer group hover:border-blue-400 transition-colors">
              <p className="text-[10px] font-black uppercase tracking-widest text-anthracite-400 mb-2">Onay Bekleyenler</p>
              <h3 className="text-3xl font-black text-anthracite-900 flex items-center gap-2">
                  {pendingApprovalsCount} <span className="text-sm font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">KİŞİ</span>
              </h3>
          </div>
      </div>

      {/* STICKY TAB NAVIGATION */}
      <div className="sticky top-20 z-40 mb-10 overflow-x-auto scrollbar-hide py-2">
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md p-2 rounded-3xl border border-anthracite-100 shadow-lg w-max mx-auto sm:mx-0">
             {(['overview', 'orders', 'payments', 'approvals', 'announcements', 'archive'] as const).map((tab) => {
                 const icons = { overview: LayoutDashboard, orders: ShoppingBag, payments: Wallet, approvals: UserCheck, announcements: Megaphone, archive: History };
                 const labels = { overview: 'Özet', orders: 'İşlemler', payments: 'Alacaklar', approvals: 'Onaylar', announcements: 'Duyuru', archive: 'Arşiv' };
                 const Icon = icons[tab as keyof typeof icons] || Package;
                 return (
                    <button 
                        key={tab} 
                        onClick={() => setActiveTab(tab)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-tighter transition-all ${activeTab === tab ? 'bg-anthracite-900 text-white shadow-xl scale-105' : 'text-anthracite-400 hover:text-black hover:bg-anthracite-50'}`}
                    >
                        <Icon className="w-4 h-4" /> {labels[tab as keyof typeof labels]}
                    </button>
                 )
             })}
          </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 opacity-30 animate-pulse">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <p className="font-black text-xs uppercase tracking-[0.3em]">Merkez Hatları Yükleniyor</p>
        </div>
      ) : (
      <div className="transition-all duration-500 text-left">

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 bg-white border border-anthracite-100 rounded-[3rem] p-10 shadow-sm relative overflow-hidden">
                    <h3 className="text-xl font-black text-anthracite-900 mb-8 flex items-center gap-3">
                        <TrendingUp className="w-6 h-6 text-emerald-500" /> B2B Aktivite Grafiği (Lükse Odaklı)
                    </h3>
                    <div className="h-[400px]">
                        {mounted && (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 'bold'}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 'bold'}} />
                                    <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)', fontWeight: 'bold'}} />
                                    <Area type="monotone" dataKey="sales" name="Ciro (₺)" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                                    <Line type="monotone" dataKey="profit" name="Kâr (₺)" stroke="#3b82f6" strokeWidth={4} dot={{ r: 6, fill: "#fff", strokeWidth: 3 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white border border-anthracite-100 rounded-[3rem] p-8 shadow-sm">
                        <h3 className="text-lg font-black text-anthracite-900 mb-6 flex items-center gap-3">
                            <Megaphone className="w-5 h-5 text-amber-500" /> Son Duyuru
                        </h3>
                        {announcements.length > 0 ? (
                            <div className="bg-anthracite-50 p-6 rounded-2xl border border-anthracite-100">
                                <h4 className="font-black text-md mb-2">{announcements[0].title}</h4>
                                <p className="text-xs text-anthracite-500 font-medium line-clamp-3">{announcements[0].content}</p>
                            </div>
                        ) : <p className="text-xs font-bold text-anthracite-300">Henüz duyuru yok.</p>}
                        <button onClick={() => setActiveTab('announcements')} className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-anthracite-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all">PANELİ YÖNET</button>
                    </div>
                    <div className="bg-emerald-500 p-8 rounded-[3rem] text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden">
                        <div className="absolute -bottom-4 -right-4 opacity-10">
                            <Store className="w-32 h-32" />
                        </div>
                        <h3 className="text-lg font-black mb-1">Toptancı Hakları</h3>
                        <p className="text-xs font-medium text-white/70 mb-6">Tüm üreticilerin alacak bakiyesi:</p>
                        <span className="text-4xl font-black">
                             {Object.values(wholesalerSummary).reduce((a:any, b:any) => a + b.total, 0).toLocaleString('tr-TR')} ₺
                        </span>
                    </div>
                </div>
            </div>
        )}

        {/* ORDERS TAB (İŞLEMLER) */}
        {activeTab === 'orders' && (
            <div className="bg-white border border-anthracite-100 rounded-[3rem] p-8 sm:p-10 shadow-xl overflow-hidden">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 pb-6 border-b border-anthracite-100">
                    <div>
                        <h2 className="text-2xl font-black text-anthracite-900 mb-1">Sipariş & Operasyon Yönetimi</h2>
                        <p className="text-sm font-medium text-anthracite-500">Üretim aşamasındaki tüm malları ve ödemeleri tek panelden yönetin.</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {activeOrders.length === 0 ? (
                        <p className="text-center py-20 font-black text-anthracite-300 italic">Şu an aktif işlem bulunmuyor.</p>
                    ) : activeOrders.map(order => (
                        <div key={order.id} className="group bg-white p-6 rounded-[2.5rem] border border-anthracite-100 hover:shadow-2xl hover:border-anthracite-200 transition-all flex flex-col lg:flex-row items-center gap-8 text-left relative overflow-hidden">
                            
                            {/* ÜRETİCİ / DURUM ETİKETİ */}
                            <div className="absolute top-6 right-8 flex gap-2">
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${order.status === 'waiting_payment' ? 'bg-amber-50 text-amber-600 border-amber-200' : order.status === 'shipped' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                                    {order.status === 'shipped' ? 'KARGODA' : order.status === 'approved' ? 'HAZIRLANIYOR' : 'ÖDEME BEKLİYOR'}
                                </span>
                            </div>

                            {/* ÜRÜN GÖRSELİ */}
                            <div className="w-24 h-32 shrink-0 bg-anthracite-50 rounded-2xl overflow-hidden border border-anthracite-100 relative">
                                <Image src={order.product?.images?.[0] || ''} alt="p" fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                            </div>

                            {/* ANA BİLGİLER */}
                            <div className="flex-1 w-full space-y-4">
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                                    <div>
                                        <h4 className="text-[10px] font-black text-anthracite-400 uppercase tracking-widest leading-none mb-1">Butik Müşteri / Toptancı</h4>
                                        <h3 className="text-xl font-black text-anthracite-900">{order.buyer_name}</h3>
                                        <p className="text-xs font-bold text-anthracite-500 flex items-center gap-1">
                                            <Store className="w-3 h-3 text-emerald-500" /> Tedarikçi: {order.wholesaler?.business_name}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-anthracite-400 uppercase tracking-widest mb-1">Sipariş Tutarı</p>
                                        <span className="text-3xl font-black text-anthracite-900">{Number(order.total_price).toLocaleString('tr-TR')} ₺</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-anthracite-50">
                                    <div className="bg-anthracite-50 p-3 rounded-2xl">
                                        <p className="text-[9px] font-black text-anthracite-400 uppercase leading-none mb-1">Model</p>
                                        <p className="text-xs font-black line-clamp-1">{order.product_name}</p>
                                    </div>
                                    <div className="bg-anthracite-50 p-3 rounded-2xl text-center">
                                        <p className="text-[9px] font-black text-anthracite-400 uppercase leading-none mb-1">Beden / Adet</p>
                                        <p className="text-xs font-black">{order.selected_size} - {order.quantity} Adet</p>
                                    </div>
                                    <div className="bg-emerald-50 p-3 rounded-2xl text-center">
                                        <p className="text-[9px] font-black text-emerald-600 uppercase leading-none mb-1">Kârınız</p>
                                        <p className="text-xs font-black text-emerald-700">{order.commission_earned} ₺</p>
                                    </div>
                                    <div className="bg-blue-50 p-3 rounded-2xl text-center">
                                       <p className="text-[9px] font-black text-blue-600 uppercase leading-none mb-1">Toptancı Hak</p>
                                       <p className="text-xs font-black text-blue-700">{order.wholesaler_earning} ₺</p>
                                    </div>
                                </div>
                            </div>

                            {/* AKSİYONLAR */}
                            <div className="shrink-0 flex flex-row lg:flex-col gap-2 w-full lg:w-auto">
                                {order.status === 'waiting_payment' ? (
                                    <button onClick={()=>approveOrderPayment(order.id, order.wholesaler?.business_name)} className="flex-1 lg:w-40 py-4 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all">ÖDEME GELDİ - ONAYLA</button>
                                ) : (
                                    <>
                                       <button onClick={() => exportInvoicePDF(order)} className="flex-1 py-3 px-6 bg-white border border-anthracite-200 text-anthracite-700 rounded-xl font-bold text-[10px] flex items-center justify-center gap-2 hover:bg-anthracite-50 transition-all uppercase tracking-widest"><FileText className="w-4 h-4"/> FATURA</button>
                                       {order.status === 'shipped' && (
                                           <button onClick={() => archiveOrder(order.id)} className="flex-1 py-3 px-6 bg-anthracite-900 text-white rounded-xl font-bold text-[10px] flex items-center justify-center gap-2 hover:bg-black transition-all uppercase tracking-widest"><Archive className="w-4 h-4"/> ARŞİVLE</button>
                                       )}
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* PAYMENTS TAB (HAKEDİŞLER) */}
        {activeTab === 'payments' && (
            <div className="bg-white border border-anthracite-100 rounded-[3rem] p-10 shadow-xl overflow-hidden">
                <h2 className="text-2xl font-black text-anthracite-900 mb-2 flex items-center gap-3">
                   <Wallet className="w-8 h-8 text-emerald-500" /> Toptancı Hakediş Masası
                </h2>
                <p className="text-sm font-medium text-anthracite-500 mb-10 text-left">Üreticilerin havuzdaki net alacaklarını buradan takip edin.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   {Object.entries(wholesalerSummary).length === 0 ? (
                     <p className="col-span-full text-center py-20 font-black text-anthracite-300 italic">Hesaplarda meblağ bulunmuyor.</p>
                   ) : Object.entries(wholesalerSummary).map(([name, data]: [any, any]) => (
                     <div key={name} className="bg-anthracite-50 border border-anthracite-100 rounded-[2.5rem] p-10 flex flex-col gap-6 shadow-sm hover:shadow-xl transition-all relative group h-full">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md">
                           <Store className="w-7 h-7 text-emerald-500" />
                        </div>
                        <div className="text-left">
                           <h3 className="font-black text-2xl text-anthracite-900 leading-tight">{name}</h3>
                           <p className="text-[10px] font-black text-anthracite-400 uppercase tracking-widest mt-2">{data.count} Aktif Sevkiyat İşlemi</p>
                        </div>
                        <div className="mt-auto pt-6 border-t border-anthracite-200">
                           <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1 leading-none">Net Alacak</p>
                           <span className="text-4xl font-black text-emerald-600 tracking-tighter">{data.total.toLocaleString('tr-TR')} ₺</span>
                        </div>
                        <button className="absolute top-10 right-10 opacity-0 group-hover:opacity-100 transition-all font-black text-[10px] text-blue-500 underline uppercase">IBAN GÖR</button>
                     </div>
                   ))}
                </div>
            </div>
        )}

        {/* APPROVALS TAB */}
        {activeTab === 'approvals' && (
            <div className="bg-white border border-anthracite-100 rounded-[3rem] p-10 shadow-xl overflow-hidden">
                <h2 className="text-2xl font-black text-anthracite-900 mb-2 flex items-center gap-3">
                   <UserCheck className="w-8 h-8 text-blue-500" /> Üyelik ve Yetki Onayları
                </h2>
                <p className="text-sm font-medium text-anthracite-500 mb-10 text-left">Platforma yeni katılan firmaları ve butikleri buradan denetleyin.</p>
                <div className="space-y-4">
                    {profiles.length === 0 ? (
                        <p className="text-center py-20 font-black text-anthracite-300 italic">Bekleyen onay bulunmuyor.</p>
                    ) : profiles.map(profile => (
                        <div key={profile.id} className="flex flex-col sm:flex-row items-center justify-between p-8 bg-anthracite-50 rounded-[2.5rem] border border-anthracite-100 gap-8">
                            <div className="flex flex-col sm:flex-row items-center gap-6 mr-auto text-left w-full">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${profile.role === 'toptanci' ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white'}`}>
                                    {profile.role === 'toptanci' ? <Store className="w-8 h-8"/> : <UserRound className="w-8 h-8"/>}
                                </div>
                                <div className="text-center sm:text-left">
                                    <h3 className="font-black text-2xl mb-1">{profile.business_name || 'Gizli Üye'}</h3>
                                    <div className="flex justify-center sm:justify-start gap-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-anthracite-400 bg-white px-2 py-0.5 rounded border border-anthracite-200">
                                            {profile.role === 'toptanci' ? 'Tedarikçi / Üretici' : 'Butik / Alıcı'}
                                        </span>
                                        <span className="text-[10px] font-black text-anthracite-500">{profile.full_name}</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => approveUser(profile.id, profile.role)} className="w-full sm:w-auto bg-anthracite-900 text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-black transition-all hover:scale-105 active:scale-95">SİSTEME KABUL ET</button>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* ANNOUNCEMENTS TAB */}
        {activeTab === 'announcements' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-5 bg-white border border-anthracite-100 rounded-[3rem] p-10 shadow-xl h-max text-left">
                    <h2 className="text-xl font-black text-anthracite-900 mb-8 flex items-center gap-3 pb-6 border-b border-anthracite-50">
                        <Send className="w-6 h-6 text-emerald-500" /> Yeni Duyuru Yayınla
                    </h2>
                    <form onSubmit={handlePublishAnnouncement} className="space-y-6">
                        <div className="space-y-4 p-6 bg-anthracite-50 rounded-[2rem] border border-anthracite-100">
                            <div>
                                <label className="text-[10px] font-black text-anthracite-400 uppercase tracking-widest block mb-2">Başlık</label>
                                <input required value={annTitle} onChange={e=>setAnnTitle(e.target.value)} className="w-full px-5 py-3 rounded-xl font-bold bg-white outline-none focus:ring-4 focus:ring-anthracite-200 border-none shadow-inner" placeholder="Piyasa Duyurusu..." />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-anthracite-400 uppercase tracking-widest block mb-2">Mesaj</label>
                                <textarea required value={annContent} onChange={e=>setAnnContent(e.target.value)} rows={4} className="w-full px-5 py-4 rounded-xl font-bold bg-white outline-none border-none shadow-inner" placeholder="Ekiplerimize önemli bildirimi buraya yazın..." />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black text-anthracite-400 uppercase tracking-widest block mb-2">Hedef Kitle</label>
                                <select value={annTarget} onChange={e=>setAnnTarget(e.target.value)} className="w-full px-4 py-3 bg-white border border-anthracite-200 rounded-xl font-bold">
                                    <option value="all">HERKES</option>
                                    <option value="butik">BUTİKLER</option>
                                    <option value="toptanci">TOPTANCILAR</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-anthracite-400 uppercase tracking-widest block mb-2">Renkli Vurgu</label>
                                <select value={annType} onChange={e=>setAnnType(e.target.value)} className="w-full px-4 py-3 bg-white border border-anthracite-200 rounded-xl font-bold">
                                    <option value="info">INFO (MAVİ)</option>
                                    <option value="warning">UYARI (SARI)</option>
                                    <option value="success">BAŞARI (YEŞİL)</option>
                                    <option value="error">KRİTİK (KIRMIZI)</option>
                                </select>
                            </div>
                        </div>
                        <button disabled={isPublishing} className="w-full py-5 bg-anthracite-900 text-white font-black rounded-2xl shadow-2xl hover:scale-[1.02] transition-all disabled:opacity-50 mt-4 uppercase text-xs tracking-widest">
                            {isPublishing ? "ACTİVATİNG..." : "DUYURUYU ŞİMDİ YAYINLA"}
                        </button>
                    </form>
                </div>

                <div className="lg:col-span-7 bg-white border border-anthracite-200 rounded-[3rem] p-10 shadow-sm overflow-hidden">
                    <h2 className="text-xl font-black text-anthracite-900 mb-8 flex items-center gap-3 pb-6 border-b border-anthracite-50 text-left">
                        <History className="w-6 h-6 text-anthracite-400" /> Aktif Yayınlar
                    </h2>
                    <div className="space-y-4">
                        {announcements.length === 0 ? (
                            <p className="text-center py-20 font-black text-anthracite-300 italic">Yayında duyuru yok.</p>
                        ) : announcements.map(ann => (
                            <div key={ann.id} className="p-6 bg-anthracite-50 rounded-[2rem] border border-anthracite-100 relative group text-left">
                                <button onClick={() => deleteAnnouncement(ann.id)} className="absolute top-6 right-6 p-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all bg-white rounded-full shadow-sm">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className={`w-3 h-3 rounded-full border-2 border-white shadow-sm ${ann.type === 'info' ? 'bg-blue-500' : ann.type === 'warning' ? 'bg-amber-500' : ann.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                    <h3 className="font-black text-lg text-anthracite-900 leading-none">{ann.title}</h3>
                                    <span className="text-[8px] font-black uppercase bg-white border border-anthracite-200 px-3 py-1 rounded-full ml-auto shadow-sm tracking-widest">{ann.target_role}</span>
                                </div>
                                <p className="text-sm font-medium text-anthracite-600 pl-5 border-l-2 border-anthracite-200">{ann.content}</p>
                                <div className="flex items-center justify-between mt-5 pt-4 border-t border-anthracite-200/50">
                                   <span className="text-[9px] font-bold text-anthracite-300 uppercase">{new Date(ann.created_at).toLocaleString('tr-TR')}</span>
                                   <span className="text-[9px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded uppercase">AKTİF</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* ARCHIVE TAB */}
        {activeTab === 'archive' && (
            <div className="bg-white border border-anthracite-100 rounded-[3rem] p-10 shadow-xl overflow-hidden">
                <h2 className="text-2xl font-black text-anthracite-900 mb-10 flex items-center gap-3 pb-6 border-b border-anthracite-50">
                    <Archive className="w-8 h-8 text-anthracite-300" /> Platform Geçmişi
                </h2>
                <div className="space-y-4">
                    {orders.filter(o => o.is_archived).length === 0 ? (
                        <p className="text-center py-20 font-black text-anthracite-300 italic">Arşivlenmiş kayıt bulunmuyor.</p>
                    ) : orders.filter(o => o.is_archived).map(order => (
                        <div key={order.id} className="p-6 border-b border-anthracite-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 hover:bg-anthracite-50 transition-all rounded-[2rem]">
                            <div className="flex items-center gap-6 text-left w-full sm:w-auto">
                                <div className="w-14 h-20 bg-anthracite-100 rounded-xl overflow-hidden relative shadow-inner">
                                    <Image src={order.product?.images?.[0] || ''} alt="p" fill className="object-cover opacity-50 grayscale" />
                                </div>
                                <div className="min-w-0 text-left">
                                    <h3 className="font-black text-lg text-anthracite-900 break-words leading-tight">{order.product_name}</h3>
                                    <p className="text-[10px] font-bold text-anthracite-400 uppercase tracking-widest mt-1">{order.buyer_name} | {new Date(order.created_at).toLocaleDateString('tr-TR')}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-8 pt-4 sm:pt-0 border-t sm:border-0 border-anthracite-100">
                                <div className="text-left sm:text-right">
                                    <span className="block font-black text-2xl text-anthracite-900 italic opacity-40">{Number(order.total_price).toLocaleString('tr-TR')} ₺</span>
                                    <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 uppercase tracking-widest">Başarılı</span>
                                </div>
                                <button onClick={() => exportInvoicePDF(order)} className="p-4 bg-white border border-anthracite-200 rounded-2xl hover:bg-anthracite-900 hover:text-white transition-all shadow-sm" title="E-Fatura">
                                    <Printer className="w-6 h-6" />
                                </button>
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

function ShoppingBag(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  )
}

function Loader2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}
