"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  CheckCircle, Users, Store, UserRound, Wallet, 
  TrendingUp, Package, Clock, ShieldCheck, 
  Archive, FolderArchive, Trash2, LayoutDashboard,
  FileText, History as HistoryIcon, Info, Printer, Megaphone, Send,
  ArrowRight, BarChart3, Receipt, UserCheck, ShoppingBag, Loader2, ClipboardList, AlertTriangle,
  Phone, Copy, UserSearch, StickyNote
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
import { ORDER_STATUS, getOrderStatusLabel } from '@/utils/orderStatus';
import { isLowStockProduct } from '@/utils/productStocks';
import { DISPUTE_STATUS, getDisputeStatusLabel, isDisputeOpen } from '@/utils/disputeStatus';
import Link from 'next/link';
import Image from 'next/image';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardTabs } from '@/components/dashboard/DashboardTabs';

type TabType = 'overview' | 'orders' | 'payments' | 'approvals' | 'members' | 'announcements' | 'reports' | 'archive';

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
  const [disputes, setDisputes] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [disputeNotes, setDisputeNotes] = useState<Record<string, string>>({});
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annTarget, setAnnTarget] = useState('all');
  const [annType, setAnnType] = useState('info');
  const [isPublishing, setIsPublishing] = useState(false);
  const [memberProfiles, setMemberProfiles] = useState<any[]>([]);
  const [memberRoleFilter, setMemberRoleFilter] = useState<'all' | 'butik' | 'toptanci'>('all');
  const [memberQuery, setMemberQuery] = useState('');

  const supabase = useMemo(() => createClient(), []);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      alert('Kopyalama başarısız; metni elle seçin.');
    }
  }, []);

  const fetchPendingUsers = useCallback(async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_approved', false)
      .order('created_at', { ascending: false });
    if (data) setProfiles(data);
  }, [supabase]);

  const fetchMemberProfiles = useCallback(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['butik', 'toptanci'])
      .order('created_at', { ascending: false });
    if (!error && data) setMemberProfiles(data);
  }, [supabase]);

  const fetchOrders = useCallback(async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, product:product_id(*), wholesaler:wholesaler_id(business_name, iban)')
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

  const fetchProducts = useCallback(async () => {
    const { data: prods } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (!prods) {
      setProducts([]);
      return;
    }
    const ids = Array.from(new Set(prods.map((p: { wholesaler_id: string }) => p.wholesaler_id).filter(Boolean)));
    const map: Record<string, string> = {};
    if (ids.length > 0) {
      const { data: profs } = await supabase.from('profiles').select('id, business_name').in('id', ids);
      for (const p of profs || []) map[p.id] = p.business_name || '—';
    }
    setProducts(
      prods.map((p: { wholesaler_id: string }) => ({
        ...p,
        _wholesalerLabel: map[p.wholesaler_id] || 'Toptancı',
      }))
    );
  }, [supabase]);

  const fetchDisputes = useCallback(async () => {
    const { data } = await supabase
      .from('order_disputes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(80);
    if (data) {
      setDisputes(data);
      setDisputeNotes((prev) => {
        const next = { ...prev };
        for (const d of data) {
          if (d.status === DISPUTE_STATUS.RESOLVED || d.status === DISPUTE_STATUS.REJECTED) {
            next[d.id] = d.admin_note || '';
          } else if (!(d.id in next)) {
            next[d.id] = d.admin_note || '';
          }
        }
        return next;
      });
    }
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
      await Promise.all([
        fetchPendingUsers(),
        fetchMemberProfiles(),
        fetchOrders(),
        fetchAnnouncements(),
        fetchDisputes(),
        fetchProducts(),
      ]);
    }
    setLoading(false);
  }, [supabase, fetchPendingUsers, fetchMemberProfiles, fetchOrders, fetchAnnouncements, fetchDisputes, fetchProducts]);

  useEffect(() => {
    setMounted(true);
    checkAdminAccess();
  }, [checkAdminAccess]);

  const approveUser = async (id: string, role: string) => {
    const { error } = await supabase.from('profiles').update({ is_approved: true }).eq('id', id);
    if (!error) {
      alert(`${role === 'toptanci' ? 'Toptancı yetkisi' : 'Müşteri fiyat görme izni'} başarıyla onaylandı!`);
      fetchPendingUsers();
      fetchMemberProfiles();
    }
  };

  const approveOrderPayment = async (orderId: string, wholesalerName: string) => {
    if(!confirm("Müşterinin IBAN adresinize ödeme geçtiğini teyit ettiniz mi? Sipariş üretim/stok için Toptancı deposuna yönlendirilecek!")) return;
    
    // Stok düşme ve bildirim mantığı (Aynı kalıyor)
    const { data: order } = await supabase.from('orders').select('product_id, selected_size, quantity, buyer_id, product_name, wholesaler_id').eq('id', orderId).single();
    if (order && order.selected_size) {
      const { data: product } = await supabase.from('products').select('stocks').eq('id', order.product_id).single();
      if (product && product.stocks) {
        const newStocks = { ...product.stocks };
        const parsedLines = String(order.selected_size)
          .split(',')
          .map((part: string) => part.trim())
          .filter(Boolean)
          .map((part: string) => {
            const [size, qty] = part.split(':').map((x) => x.trim());
            return { size, qty: Number(qty) };
          })
          .filter((row: { size: string; qty: number }) => row.size && Number.isFinite(row.qty) && row.qty > 0);
        if (parsedLines.length > 0) {
          for (const row of parsedLines) {
            newStocks[row.size] = Math.max(0, (Number(newStocks[row.size]) || 0) - row.qty);
          }
        } else {
          // Geriye dönük: eski tek beden sipariş formatı
          newStocks[order.selected_size] = Math.max(0, (Number(newStocks[order.selected_size]) || 0) - order.quantity);
        }
        await supabase.from('products').update({ stocks: newStocks }).eq('id', order.product_id);
      }
    }

    const { error } = await supabase.from('orders').update({ status: ORDER_STATUS.PREPARING }).eq('id', orderId);
    if (!error) {
      const pn = order?.product_name || 'Sipariş';
      await notify(
        order?.buyer_id,
        'Ödeme onaylandı',
        `«${pn}» için ödemeniz teyit edildi. Sipariş toptancıya hazırlık için iletildi. Siparişlerim’den durumu takip edebilirsiniz.`,
        'success'
      );
      if (order?.wholesaler_id) {
        await notify(
          order.wholesaler_id,
          'Ödeme onaylandı — hazırlık',
          `«${pn}» siparişi için ödeme teyit edildi. Paketleyip Kargo sayfasından takip numarası girmeniz bekleniyor.`,
          'success'
        );
      }
      alert(`Sipariş Onaylandı! ${wholesalerName || 'Toptancı'} tarafına kargolama emri iletildi.`);
      fetchOrders();
      fetchProducts();
    }
  };

  const archiveOrder = async (id: string) => {
    if(!confirm("Bu siparişi kargolandığı için arşivlemek istiyor musunuz?")) return;
    const { error } = await supabase.from('orders').update({ is_archived: true }).eq('id', id);
    if (!error) fetchOrders();
  };

  const markDelivered = async (id: string) => {
    const { error } = await supabase.from('orders').update({ status: ORDER_STATUS.DELIVERED }).eq('id', id);
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
  const pendingOrdersCount = useMemo(() => orders.filter(o => o.status === ORDER_STATUS.WAITING_PAYMENT && !o.is_archived).length, [orders]);
  const pendingApprovalsCount = profiles.length;
  const delayedPreparingCount = useMemo(
    () =>
      orders.filter((o) => {
        if (o.status !== ORDER_STATUS.PREPARING) return false;
        const diffHours = (Date.now() - new Date(o.created_at).getTime()) / (1000 * 60 * 60);
        return diffHours >= 72;
      }).length,
    [orders]
  );
  const openDisputeCount = useMemo(
    () => disputes.filter((d) => isDisputeOpen(d.status)).length,
    [disputes]
  );

  const filteredMemberProfiles = useMemo(() => {
    let list = memberProfiles;
    if (memberRoleFilter !== 'all') {
      list = list.filter((p) => p.role === memberRoleFilter);
    }
    const q = memberQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((p) => {
        const haystack = [
          p.business_name,
          p.full_name,
          p.phone_number,
          p.tax_id,
          p.iban,
          p.id,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(q);
      });
    }
    return list;
  }, [memberProfiles, memberRoleFilter, memberQuery]);

  const disputeProductName = useCallback(
    (orderId: string) => orders.find((o) => o.id === orderId)?.product_name || 'Sipariş',
    [orders]
  );

  const setDisputeReviewing = async (id: string) => {
    const d = disputes.find((x) => x.id === id);
    if (!d || d.status !== DISPUTE_STATUS.OPEN) return;
    const { error } = await supabase.from('order_disputes').update({ status: DISPUTE_STATUS.REVIEWING }).eq('id', id);
    if (error) {
      alert(error.message);
      return;
    }
    const pn = disputeProductName(d.order_id);
    await notify(
      d.buyer_id,
      'Uyuşmazlık inceleniyor',
      `"${pn}" siparişi için talebiniz yönetim tarafından incelenmektedir.`,
      'info'
    );
    if (d.wholesaler_id) {
      await notify(
        d.wholesaler_id,
        'Uyuşmazlık inceleniyor',
        `"${pn}" siparişi için bir uyuşmazlık kaydı incelenmektedir.`,
        'info'
      );
    }
    fetchDisputes();
  };

  const finalizeDispute = async (id: string, outcome: typeof DISPUTE_STATUS.RESOLVED | typeof DISPUTE_STATUS.REJECTED) => {
    const note = (disputeNotes[id] || '').trim();
    if (note.length < 8) {
      alert('Taraflara iletilecek yönetim notunu yazın (en az 8 karakter).');
      return;
    }
    const d = disputes.find((x) => x.id === id);
    if (!d || !isDisputeOpen(d.status)) return;
    const { error } = await supabase
      .from('order_disputes')
      .update({
        status: outcome,
        admin_note: note,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', id);
    if (error) {
      alert(error.message);
      return;
    }
    const pn = disputeProductName(d.order_id);
    const title = outcome === DISPUTE_STATUS.RESOLVED ? 'Uyuşmazlık çözüldü' : 'Uyuşmazlık kararı';
    const type = outcome === DISPUTE_STATUS.RESOLVED ? 'success' : 'warning';
    const msg = `${pn}: ${note}`;
    await notify(d.buyer_id, title, msg, type);
    if (d.wholesaler_id) await notify(d.wholesaler_id, title, msg, type);
    fetchDisputes();
  };

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
      if (!acc[name]) acc[name] = { total: 0, count: 0, iban: order.wholesaler?.iban || null };
      acc[name].total += Number(order.wholesaler_earning);
      acc[name].count += 1;
      if (!acc[name].iban && order.wholesaler?.iban) acc[name].iban = order.wholesaler.iban;
      return acc;
    }, {}), [orders]);

  const activeOrders = useMemo(() => orders.filter(o => !o.is_archived), [orders]);

  return (
    <>
    {!isAdmin && !loading ? (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5f4f2] px-4">
        <ShieldCheck className="mb-4 h-14 w-14 text-red-400" />
        <h1 className="text-center text-xl font-semibold text-anthracite-900">Yetkisiz erişim</h1>
        <Link href="/" className="mt-6 rounded-lg bg-anthracite-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-anthracite-800">Ana sayfa</Link>
      </div>
    ) : (
    <DashboardShell>
      <DashboardHeader
        icon={BarChart3}
        eyebrow="Merkez yönetim"
        title="Kontrol paneli"
        right={
          user ? (
            <div className="rounded-lg border border-anthracite-200/80 bg-white p-1 shadow-sm">
              <NotificationBell userId={user.id} />
            </div>
          ) : null
        }
      />

      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <div className="relative overflow-hidden rounded-xl border border-anthracite-800 bg-anthracite-900 p-4 text-white shadow-sm">
          <TrendingUp className="absolute -right-1 -top-1 h-16 w-16 opacity-[0.07]" />
          <p className="text-[10px] font-medium uppercase tracking-wider text-white/55">Toplam ciro</p>
          <p className="mt-1 text-lg font-semibold tabular-nums sm:text-xl">{totalCiro.toLocaleString("tr-TR")} ₺</p>
        </div>
        <div className="rounded-xl border border-emerald-200/60 bg-gradient-to-br from-emerald-600 to-emerald-700 p-4 text-white shadow-sm">
          <p className="text-[10px] font-medium uppercase tracking-wider text-white/75">Platform kârı</p>
          <p className="mt-1 text-lg font-semibold tabular-nums sm:text-xl">{totalProfit.toLocaleString("tr-TR")} ₺</p>
        </div>
        <button
          type="button"
          onClick={() => setActiveTab("orders")}
          className="rounded-xl border border-anthracite-200/80 bg-white p-4 text-left shadow-sm transition hover:border-amber-300/80 hover:shadow-md"
        >
          <p className="text-[10px] font-medium uppercase tracking-wider text-anthracite-500">Bekleyen ödeme</p>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="text-lg font-semibold tabular-nums text-anthracite-900 sm:text-xl">{pendingOrdersCount}</span>
            <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">işlem</span>
          </p>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("approvals")}
          className="rounded-xl border border-anthracite-200/80 bg-white p-4 text-left shadow-sm transition hover:border-anthracite-300 hover:shadow-md"
        >
          <p className="text-[10px] font-medium uppercase tracking-wider text-anthracite-500">Onay / risk</p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-anthracite-900 sm:text-xl">{pendingApprovalsCount}</p>
          <p className="mt-2 text-[10px] text-red-600/90">Geciken hazırlık: {delayedPreparingCount}</p>
          <p className="text-[10px] text-amber-700/90">Açık uyuşmazlık: {openDisputeCount}</p>
        </button>
      </div>

      <DashboardTabs
        value={activeTab}
        onChange={(id) => setActiveTab(id as TabType)}
        items={[
          { id: "overview", label: "Özet", icon: LayoutDashboard },
          { id: "orders", label: "Siparişler", icon: ShoppingBag },
          { id: "payments", label: "Hakediş", icon: Wallet },
          { id: "approvals", label: "Onaylar", icon: UserCheck },
          { id: "members", label: "Üyeler", icon: UserSearch },
          { id: "announcements", label: "Duyuru", icon: Megaphone },
          { id: "reports", label: "Raporlar", icon: ClipboardList },
          { id: "archive", label: "Arşiv", icon: HistoryIcon },
        ]}
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-anthracite-400">
            <Loader2 className="mb-3 h-9 w-9 animate-spin text-emerald-600/70" />
            <p className="text-xs font-medium">Yükleniyor…</p>
        </div>
      ) : (
      <div className="transition-all duration-500 text-left">

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="relative overflow-hidden rounded-2xl border border-anthracite-200/70 bg-white p-6 shadow-sm sm:p-8 lg:col-span-8">
                    <h3 className="mb-6 flex items-center gap-2 text-base font-semibold text-anthracite-900">
                        <TrendingUp className="h-5 w-5 text-emerald-600" strokeWidth={2} /> Ciro özeti
                    </h3>
                    <div className="h-[300px] sm:h-[340px]">
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
                <div className="space-y-4 lg:col-span-4">
                    <div className="rounded-2xl border border-anthracite-200/70 bg-white p-5 shadow-sm sm:p-6">
                        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-anthracite-900">
                            <Megaphone className="h-4 w-4 text-amber-600" strokeWidth={2} /> Son duyuru
                        </h3>
                        {announcements.length > 0 ? (
                            <div className="rounded-xl border border-anthracite-100 bg-anthracite-50/80 p-4">
                                <h4 className="mb-1.5 text-sm font-semibold text-anthracite-900">{announcements[0].title}</h4>
                                <p className="line-clamp-3 text-xs text-anthracite-500">{announcements[0].content}</p>
                            </div>
                        ) : <p className="text-xs text-anthracite-400">Henüz duyuru yok.</p>}
                        <button onClick={() => setActiveTab('announcements')} type="button" className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-anthracite-900 py-2.5 text-xs font-medium text-white transition hover:bg-anthracite-800">Duyuruları aç</button>
                    </div>
                    <div className="relative overflow-hidden rounded-2xl border border-emerald-600/30 bg-gradient-to-br from-emerald-600 to-emerald-700 p-5 text-white shadow-sm sm:p-6">
                        <Store className="absolute -bottom-2 -right-2 h-24 w-24 opacity-[0.12]" />
                        <h3 className="text-sm font-semibold">Toptancı alacakları</h3>
                        <p className="mt-1 text-xs text-white/75">Havuz toplamı</p>
                        <p className="mt-4 text-2xl font-semibold tabular-nums sm:text-3xl">
                             {Object.values(wholesalerSummary).reduce((a: number, b: any) => a + (b.total || 0), 0).toLocaleString('tr-TR')} ₺
                        </p>
                    </div>
                </div>
            </div>
        )}

        {/* ORDERS TAB (İŞLEMLER) */}
        {activeTab === 'orders' && (
            <div className="overflow-hidden rounded-2xl border border-anthracite-200/70 bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-8 flex flex-col gap-1 border-b border-anthracite-100/90 pb-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-anthracite-900 sm:text-xl">Siparişler</h2>
                        <p className="text-sm text-anthracite-500">Ödeme, kargo ve uyuşmazlık işlemleri.</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {activeOrders.length === 0 ? (
                        <p className="py-16 text-center text-sm text-anthracite-400">Aktif sipariş yok.</p>
                    ) : activeOrders.map(order => (
                        <div key={order.id} className="group relative flex flex-col items-center gap-6 overflow-hidden rounded-xl border border-anthracite-200/60 bg-anthracite-50/30 p-5 text-left transition hover:border-anthracite-300/80 hover:bg-white hover:shadow-sm lg:flex-row lg:gap-8">
                            
                            {/* ÜRETİCİ / DURUM ETİKETİ */}
                            <div className="absolute top-6 right-8 flex gap-2">
                                <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${order.status === ORDER_STATUS.WAITING_PAYMENT ? 'border-amber-200 bg-amber-50 text-amber-700' : order.status === ORDER_STATUS.SHIPPED ? 'border-blue-200 bg-blue-50 text-blue-700' : order.status === ORDER_STATUS.DELIVERED ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : order.status === ORDER_STATUS.CANCELLED ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
                                    {getOrderStatusLabel(order.status)}
                                </span>
                                {order.status === ORDER_STATUS.PREPARING && ((Date.now() - new Date(order.created_at).getTime()) / (1000 * 60 * 60)) >= 72 && (
                                  <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-[10px] font-medium text-red-700">
                                    3+ gün gecikme
                                  </span>
                                )}
                            </div>

                            {/* ÜRÜN GÖRSELİ */}
                            <div className="w-24 h-32 shrink-0 bg-anthracite-50 rounded-2xl overflow-hidden border border-anthracite-100 relative">
                                <Image src={order.product?.images?.[0] || ''} alt="p" fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                            </div>

                            {/* ANA BİLGİLER */}
                            <div className="flex-1 w-full space-y-4">
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                                    <div>
                                        <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wide text-anthracite-400">Butik / toptancı</p>
                                        <h3 className="text-lg font-semibold text-anthracite-900 sm:text-xl">{order.buyer_name}</h3>
                                        <p className="flex items-center gap-1 text-xs text-anthracite-500">
                                            <Store className="h-3 w-3 text-emerald-600" strokeWidth={2} /> {order.wholesaler?.business_name}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="mb-0.5 text-[10px] font-medium text-anthracite-400">Tutar</p>
                                        <span className="text-2xl font-semibold tabular-nums text-anthracite-900 sm:text-3xl">{Number(order.total_price).toLocaleString('tr-TR')} ₺</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 border-t border-anthracite-100/80 pt-4 md:grid-cols-4">
                                    <div className="rounded-xl bg-white/80 p-3 ring-1 ring-anthracite-100/80">
                                        <p className="mb-0.5 text-[10px] font-medium text-anthracite-400">Model</p>
                                        <p className="line-clamp-1 text-xs font-medium text-anthracite-900">{order.product_name}</p>
                                    </div>
                                    <div className="rounded-xl bg-white/80 p-3 text-center ring-1 ring-anthracite-100/80">
                                        <p className="mb-0.5 text-[10px] font-medium text-anthracite-400">Beden dağılımı / toplam</p>
                                        <p className="text-xs font-medium text-anthracite-900">{order.selected_size} · {order.quantity}</p>
                                    </div>
                                    <div className="rounded-xl bg-emerald-50/80 p-3 text-center ring-1 ring-emerald-100/80">
                                        <p className="mb-0.5 text-[10px] font-medium text-emerald-700">Kâr</p>
                                        <p className="text-xs font-semibold tabular-nums text-emerald-800">{order.commission_earned} ₺</p>
                                    </div>
                                    <div className="rounded-xl bg-blue-50/80 p-3 text-center ring-1 ring-blue-100/80">
                                       <p className="mb-0.5 text-[10px] font-medium text-blue-700">Toptancı</p>
                                       <p className="text-xs font-semibold tabular-nums text-blue-800">{order.wholesaler_earning} ₺</p>
                                    </div>
                                </div>

                                {(order.buyer_note || order.payment_receipt_url) && (
                                  <div className="flex flex-col gap-2 rounded-xl border border-anthracite-200/80 bg-white/90 p-3 text-left sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                                    {order.buyer_note ? (
                                      <div className="min-w-0 flex-1">
                                        <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-anthracite-500">
                                          Butik notu
                                        </p>
                                        <p className="text-sm font-medium leading-relaxed text-anthracite-800">
                                          {order.buyer_note}
                                        </p>
                                      </div>
                                    ) : null}
                                    {order.payment_receipt_url ? (
                                      <a
                                        href={order.payment_receipt_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-900 transition hover:bg-emerald-100"
                                      >
                                        <Receipt className="h-4 w-4" strokeWidth={2} />
                                        Ödeme dekontu
                                      </a>
                                    ) : null}
                                  </div>
                                )}
                            </div>

                            {/* AKSİYONLAR */}
                            <div className="shrink-0 flex flex-row lg:flex-col gap-2 w-full lg:w-auto">
                                {order.status === ORDER_STATUS.WAITING_PAYMENT ? (
                                    <button onClick={()=>approveOrderPayment(order.id, order.wholesaler?.business_name)} className="flex-1 rounded-lg bg-emerald-600 py-3 text-xs font-medium text-white shadow-sm transition hover:bg-emerald-700 lg:w-40">Ödeme onayı</button>
                                ) : (
                                    <>
                                       <button onClick={() => exportInvoicePDF(order)} className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-anthracite-200 bg-white px-4 py-2.5 text-xs font-medium text-anthracite-800 transition hover:bg-anthracite-50"><FileText className="h-4 w-4" strokeWidth={2}/> Fatura</button>
                                       {order.status === ORDER_STATUS.SHIPPED && (
                                           <button onClick={() => markDelivered(order.id)} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-emerald-700">Teslim edildi</button>
                                       )}
                                       {(order.status === ORDER_STATUS.SHIPPED || order.status === ORDER_STATUS.DELIVERED) && (
                                           <button onClick={() => archiveOrder(order.id)} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-anthracite-900 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-black"><Archive className="h-4 w-4" strokeWidth={2}/> Arşivle</button>
                                       )}
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-10 pt-8 border-t border-anthracite-100">
                  <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-anthracite-900">
                    <Info className="h-5 w-5 text-amber-600" strokeWidth={2} /> Uyuşmazlıklar ({openDisputeCount} açık)
                  </h3>
                  <p className="text-xs font-medium text-anthracite-500 mb-4 text-left">
                    İncelemeye alındığında butik ve toptancıya bilgi gider. Çözüldü / Reddet için not zorunludur; not her iki tarafa bildirim olarak iletilir.
                  </p>
                  {disputes.length === 0 ? (
                    <p className="text-sm font-bold text-anthracite-300">Henüz uyuşmazlık kaydı yok.</p>
                  ) : (
                    <div className="space-y-4 max-h-[min(70vh,720px)] overflow-y-auto pr-1">
                      {disputes.map((d) => {
                        const closed = !isDisputeOpen(d.status);
                        const badgeClass =
                          d.status === DISPUTE_STATUS.RESOLVED
                            ? 'bg-emerald-100 text-emerald-700'
                            : d.status === DISPUTE_STATUS.REJECTED
                              ? 'bg-red-100 text-red-800'
                              : d.status === DISPUTE_STATUS.REVIEWING
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800';
                        return (
                          <div key={d.id} className="p-5 rounded-2xl border border-anthracite-100 bg-anthracite-50 flex flex-col gap-4 text-left">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-black text-anthracite-900">{disputeProductName(d.order_id)}</p>
                                <p className="text-[10px] font-bold text-anthracite-400 mt-0.5">Sipariş: {d.order_id?.slice(0, 8)}…</p>
                                <p className="text-sm font-bold text-anthracite-800 break-words mt-3">
                                  <span className="text-anthracite-400 font-black text-[10px] uppercase tracking-widest block mb-1">Butik talebi</span>
                                  {d.reason}
                                </p>
                              </div>
                              <span className={`shrink-0 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase ${badgeClass}`}>
                                {getDisputeStatusLabel(d.status)}
                              </span>
                            </div>
                            <div>
                              <label className="text-[10px] font-black text-anthracite-400 uppercase tracking-widest block mb-2">
                                {closed ? 'Yönetim notu (kayıtlı — taraflara iletildi)' : 'Yönetim notu / karar metni (Çözüldü veya Reddet ile taraflara gider)'}
                              </label>
                              <textarea
                                disabled={closed}
                                rows={closed ? 3 : 4}
                                value={disputeNotes[d.id] ?? ''}
                                onChange={(e) => setDisputeNotes((prev) => ({ ...prev, [d.id]: e.target.value }))}
                                className="w-full px-4 py-3 rounded-xl border border-anthracite-200 bg-white text-sm font-medium text-anthracite-800 outline-none focus:ring-2 focus:ring-anthracite-200 disabled:bg-anthracite-100/80 disabled:text-anthracite-600 resize-y min-h-[88px]"
                                placeholder={
                                  closed
                                    ? ''
                                    : 'Örn: İade onaylandı; toptancı 48 saat içinde değişim gönderecek.'
                                }
                              />
                            </div>
                            {!closed && (
                              <div className="flex flex-wrap gap-2">
                                {d.status === DISPUTE_STATUS.OPEN && (
                                  <button
                                    type="button"
                                    onClick={() => setDisputeReviewing(d.id)}
                                    className="px-4 py-2.5 rounded-xl text-[10px] font-black uppercase bg-blue-600 text-white hover:bg-blue-700 transition-all"
                                  >
                                    İncelemeye al
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => finalizeDispute(d.id, DISPUTE_STATUS.RESOLVED)}
                                  className="px-4 py-2.5 rounded-xl text-[10px] font-black uppercase bg-emerald-600 text-white hover:bg-emerald-700 transition-all"
                                >
                                  Çözüldü — bildir
                                </button>
                                <button
                                  type="button"
                                  onClick={() => finalizeDispute(d.id, DISPUTE_STATUS.REJECTED)}
                                  className="px-4 py-2.5 rounded-xl text-[10px] font-black uppercase bg-white border-2 border-red-200 text-red-800 hover:bg-red-50 transition-all"
                                >
                                  Reddet — bildir
                                </button>
                              </div>
                            )}
                            {closed && d.resolved_at && (
                              <p className="text-[10px] font-bold text-anthracite-400">
                                Kapanış: {new Date(d.resolved_at).toLocaleString('tr-TR')}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
            </div>
        )}

        {/* PAYMENTS TAB (HAKEDİŞLER) */}
        {activeTab === 'payments' && (
            <div className="bg-white border border-anthracite-100 rounded-2xl p-10 shadow-xl overflow-hidden">
                <h2 className="text-2xl font-black text-anthracite-900 mb-2 flex items-center gap-3">
                   <Wallet className="w-8 h-8 text-emerald-500" /> Toptancı Hakediş Masası
                </h2>
                <p className="text-sm font-medium text-anthracite-500 mb-10 text-left">Üreticilerin havuzdaki net alacaklarını buradan takip edin.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   {Object.entries(wholesalerSummary).length === 0 ? (
                     <p className="col-span-full text-center py-20 font-black text-anthracite-300 italic">Hesaplarda meblağ bulunmuyor.</p>
                   ) : Object.entries(wholesalerSummary).map(([name, data]: [any, any]) => (
                     <div key={name} className="bg-anthracite-50 border border-anthracite-100 rounded-xl p-10 flex flex-col gap-6 shadow-sm hover:shadow-xl transition-all relative group h-full">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md">
                           <Store className="w-7 h-7 text-emerald-500" />
                        </div>
                        <div className="text-left">
                           <h3 className="font-black text-2xl text-anthracite-900 leading-tight">{name}</h3>
                           <p className="text-[10px] font-black text-anthracite-400 uppercase tracking-widest mt-2">{data.count} Aktif Sevkiyat İşlemi</p>
                           <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">
                             Performans Skoru: {(() => {
                               const list = orders.filter((o) => (o.wholesaler?.business_name || 'Bilinmeyen Toptancı') === name && !o.is_archived);
                               if (list.length === 0) return 0;
                               const shippedOrDelivered = list.filter((o) => o.status === ORDER_STATUS.SHIPPED || o.status === ORDER_STATUS.DELIVERED).length;
                               const delivered = list.filter((o) => o.status === ORDER_STATUS.DELIVERED).length;
                               const onTime = list.filter((o) => {
                                 if (!(o.status === ORDER_STATUS.SHIPPED || o.status === ORDER_STATUS.DELIVERED)) return false;
                                 const diffHours = (Date.now() - new Date(o.created_at).getTime()) / (1000 * 60 * 60);
                                 return diffHours <= 72;
                               }).length;
                               const onTimeRate = onTime / list.length;
                               const deliveredRate = delivered / list.length;
                               const dispatchRate = shippedOrDelivered / list.length;
                               return Math.round((onTimeRate * 0.5 + deliveredRate * 0.3 + dispatchRate * 0.2) * 100);
                             })()} / 100
                           </p>
                        </div>
                        <div className="mt-auto pt-6 border-t border-anthracite-200">
                           <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1 leading-none">Net Alacak</p>
                           <span className="text-4xl font-black text-emerald-600 tracking-tighter">{data.total.toLocaleString('tr-TR')} ₺</span>
                        </div>
                        <button
                          type="button"
                          onClick={async () => {
                            const iban = (data as { iban?: string | null }).iban;
                            if (iban) {
                              const clean = iban.replace(/\s/g, '');
                              try {
                                await navigator.clipboard.writeText(clean);
                                alert(`IBAN panoya kopyalandı:\n${iban}`);
                              } catch {
                                alert(`IBAN:\n${iban}`);
                              }
                            } else {
                              alert('Bu toptancı için IBAN kayıtlı değil. Toptancı, panelde Hakediş sekmesinden IBAN girebilir (profiles.iban).');
                            }
                          }}
                          className="absolute top-10 right-10 opacity-0 group-hover:opacity-100 transition-all font-black text-[10px] text-blue-600 underline uppercase"
                        >
                          IBAN GÖR
                        </button>
                     </div>
                   ))}
                </div>
            </div>
        )}

        {/* APPROVALS TAB */}
        {activeTab === 'approvals' && (
            <div className="bg-white border border-anthracite-100 rounded-2xl p-10 shadow-xl overflow-hidden">
                <h2 className="text-2xl font-black text-anthracite-900 mb-2 flex items-center gap-3">
                   <UserCheck className="w-8 h-8 text-blue-500" /> Üyelik ve Yetki Onayları
                </h2>
                <p className="text-sm font-medium text-anthracite-500 mb-10 text-left">Platforma yeni katılan firmaları ve butikleri buradan denetleyin.</p>
                <div className="space-y-4">
                    {profiles.length === 0 ? (
                        <p className="text-center py-20 font-black text-anthracite-300 italic">Bekleyen onay bulunmuyor.</p>
                    ) : profiles.map(profile => (
                        <div key={profile.id} className="flex flex-col sm:flex-row items-center justify-between p-8 bg-anthracite-50 rounded-xl border border-anthracite-100 gap-8">
                            <div className="flex flex-col sm:flex-row items-center gap-6 mr-auto text-left w-full">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${profile.role === 'toptanci' ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white'}`}>
                                    {profile.role === 'toptanci' ? <Store className="w-8 h-8"/> : <UserRound className="w-8 h-8"/>}
                                </div>
                                <div className="text-center sm:text-left w-full min-w-0">
                                    <h3 className="font-black text-2xl mb-1">{profile.business_name || profile.full_name || 'İsimsiz başvuru'}</h3>
                                    <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-3">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-anthracite-400 bg-white px-2 py-0.5 rounded border border-anthracite-200">
                                            {profile.role === 'toptanci' ? 'Tedarikçi / Üretici' : 'Butik / Alıcı'}
                                        </span>
                                        {profile.full_name && profile.full_name !== profile.business_name ? (
                                          <span className="text-[10px] font-black text-anthracite-500">{profile.full_name}</span>
                                        ) : null}
                                    </div>
                                    <div className="grid gap-2 text-left text-xs font-medium text-anthracite-600 sm:grid-cols-2">
                                      {profile.phone_number ? (
                                        <a href={`tel:${String(profile.phone_number).replace(/\s/g, '')}`} className="inline-flex items-center gap-2 rounded-lg border border-anthracite-200 bg-white px-3 py-2 text-anthracite-800 hover:bg-anthracite-50">
                                          <Phone className="h-3.5 w-3.5 shrink-0 text-emerald-600" strokeWidth={2} />
                                          {profile.phone_number}
                                        </a>
                                      ) : (
                                        <span className="rounded-lg border border-dashed border-anthracite-200 px-3 py-2 text-anthracite-400">Telefon yok</span>
                                      )}
                                      {profile.tax_id ? (
                                        <span className="rounded-lg border border-anthracite-200 bg-white px-3 py-2">Vergi no: {profile.tax_id}</span>
                                      ) : null}
                                      {profile.role === 'toptanci' && profile.iban ? (
                                        <span className="sm:col-span-2 rounded-lg border border-emerald-100 bg-emerald-50/80 px-3 py-2 font-mono text-[11px] text-emerald-950">IBAN: {profile.iban}</span>
                                      ) : null}
                                      <div className="sm:col-span-2 flex flex-wrap items-center gap-2">
                                        <span className="font-mono text-[10px] text-anthracite-400">ID: {profile.id}</span>
                                        <button type="button" onClick={() => copyToClipboard(profile.id)} className="inline-flex items-center gap-1 rounded-md border border-anthracite-200 bg-white px-2 py-1 text-[10px] font-bold uppercase text-anthracite-600 hover:bg-anthracite-50">
                                          <Copy className="h-3 w-3" strokeWidth={2} /> Kopyala
                                        </button>
                                      </div>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => approveUser(profile.id, profile.role)} className="w-full sm:w-auto bg-anthracite-900 text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-black transition-all hover:scale-105 active:scale-95">SİSTEME KABUL ET</button>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {activeTab === 'members' && (
          <div className="overflow-hidden rounded-2xl border border-anthracite-200/70 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex flex-col gap-4 border-b border-anthracite-100 pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-semibold text-anthracite-900 sm:text-xl">
                  <UserSearch className="h-5 w-5 text-emerald-600" strokeWidth={2} />
                  Üye rehberi
                </h2>
                <p className="mt-1 text-sm text-anthracite-500">
                  Onaylı ve bekleyen tüm butik ile toptancı kayıtları; telefon, IBAN ve kullanıcı kimliği burada.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(['all', 'butik', 'toptanci'] as const).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setMemberRoleFilter(key)}
                    className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                      memberRoleFilter === key
                        ? 'bg-anthracite-900 text-white'
                        : 'border border-anthracite-200 bg-white text-anthracite-600 hover:bg-anthracite-50'
                    }`}
                  >
                    {key === 'all' ? 'Tümü' : key === 'butik' ? 'Butik' : 'Toptancı'}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="sr-only" htmlFor="admin-member-search">
                Ara
              </label>
              <input
                id="admin-member-search"
                type="search"
                value={memberQuery}
                onChange={(e) => setMemberQuery(e.target.value)}
                placeholder="İşletme adı, telefon, vergi no, IBAN veya kullanıcı ID ile ara…"
                className="w-full rounded-xl border border-anthracite-200 bg-anthracite-50/50 px-4 py-3 text-sm text-anthracite-900 outline-none transition focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <p className="mb-4 text-xs font-medium text-anthracite-500">
              {filteredMemberProfiles.length} kayıt gösteriliyor (toplam {memberProfiles.length}).
            </p>

            <div className="overflow-x-auto rounded-xl border border-anthracite-100">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-anthracite-100 bg-anthracite-50/80 text-[10px] font-bold uppercase tracking-wider text-anthracite-500">
                    <th className="px-3 py-3 sm:px-4">Rol</th>
                    <th className="px-3 py-3 sm:px-4">İşletme / ad</th>
                    <th className="px-3 py-3 sm:px-4">Telefon</th>
                    <th className="px-3 py-3 sm:px-4">Vergi no</th>
                    <th className="px-3 py-3 sm:px-4">IBAN</th>
                    <th className="px-3 py-3 sm:px-4">Onay</th>
                    <th className="px-3 py-3 sm:px-4">Kayıt</th>
                    <th className="px-3 py-3 sm:px-4">ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-anthracite-100">
                  {filteredMemberProfiles.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-16 text-center text-sm font-medium text-anthracite-400">
                        Kayıt bulunamadı.
                      </td>
                    </tr>
                  ) : (
                    filteredMemberProfiles.map((m) => (
                      <tr key={m.id} className="bg-white hover:bg-anthracite-50/50">
                        <td className="px-3 py-3 sm:px-4">
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                              m.role === 'toptanci' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {m.role === 'toptanci' ? 'Toptancı' : 'Butik'}
                          </span>
                        </td>
                        <td className="max-w-[200px] px-3 py-3 font-semibold text-anthracite-900 sm:px-4">
                          <span className="line-clamp-2">{m.business_name || m.full_name || '—'}</span>
                        </td>
                        <td className="px-3 py-3 sm:px-4">
                          {m.phone_number ? (
                            <a
                              href={`tel:${String(m.phone_number).replace(/\s/g, '')}`}
                              className="inline-flex items-center gap-1 font-medium text-emerald-700 hover:underline"
                            >
                              <Phone className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                              {m.phone_number}
                            </a>
                          ) : (
                            <span className="text-anthracite-400">—</span>
                          )}
                        </td>
                        <td className="px-3 py-3 font-mono text-xs text-anthracite-700 sm:px-4">{m.tax_id || '—'}</td>
                        <td className="max-w-[140px] px-3 py-3 font-mono text-[10px] text-anthracite-700 sm:px-4">
                          {m.role === 'toptanci' && m.iban ? (
                            <span className="line-clamp-2 break-all">{m.iban}</span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="px-3 py-3 sm:px-4">
                          {m.is_approved ? (
                            <span className="text-xs font-semibold text-emerald-700">Onaylı</span>
                          ) : (
                            <span className="text-xs font-semibold text-amber-700">Bekliyor</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-xs text-anthracite-500 sm:px-4">
                          {m.created_at ? new Date(m.created_at).toLocaleDateString('tr-TR') : '—'}
                        </td>
                        <td className="px-3 py-3 sm:px-4">
                          <div className="flex flex-col gap-1">
                            <span className="font-mono text-[10px] text-anthracite-400">{m.id.slice(0, 8)}…</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(m.id)}
                              className="inline-flex w-max items-center gap-1 rounded border border-anthracite-200 bg-white px-2 py-1 text-[10px] font-bold text-anthracite-600 hover:bg-anthracite-50"
                            >
                              <Copy className="h-3 w-3" strokeWidth={2} />
                              Kopyala
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-[11px] leading-relaxed text-anthracite-500">
              E-posta adresleri Supabase kimlik (Authentication) tarafında tutulur; gerekirse yönetim konsolundan kullanıcıya göre kontrol edin.
            </p>
          </div>
        )}

        {/* ANNOUNCEMENTS TAB */}
        {activeTab === 'announcements' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-5 bg-white border border-anthracite-100 rounded-2xl p-10 shadow-xl h-max text-left">
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

                <div className="lg:col-span-7 bg-white border border-anthracite-200 rounded-2xl p-10 shadow-sm overflow-hidden">
                    <h2 className="text-xl font-black text-anthracite-900 mb-8 flex items-center gap-3 pb-6 border-b border-anthracite-50 text-left">
                        <HistoryIcon className="w-6 h-6 text-anthracite-400" /> Aktif Yayınlar
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

        {/* REPORTS TAB */}
        {activeTab === 'reports' && (() => {
          const dayStart = new Date();
          dayStart.setHours(0, 0, 0, 0);
          const dayMs = dayStart.getTime();
          const todayOrders = activeOrders.filter((o) => new Date(o.created_at).getTime() >= dayMs);
          const todaySum = todayOrders.reduce((a, o) => a + Number(o.total_price || 0), 0);
          const waitingList = activeOrders.filter((o) => o.status === ORDER_STATUS.WAITING_PAYMENT);
          const delayedPrep = activeOrders.filter((o) => {
            if (o.status !== ORDER_STATUS.PREPARING) return false;
            const h = (Date.now() - new Date(o.created_at).getTime()) / (1000 * 60 * 60);
            return h >= 72;
          });
          const shippedNoTrack = activeOrders.filter(
            (o) => o.status === ORDER_STATUS.SHIPPED && !String(o.tracking_number || '').trim()
          );
          const lowStock = products.filter((p) => isLowStockProduct(p));
          return (
            <div className="space-y-8 text-left">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-anthracite-200/80 bg-white p-5 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-anthracite-500">Bugün (sipariş)</p>
                  <p className="mt-2 text-2xl font-semibold tabular-nums text-anthracite-900">{todayOrders.length}</p>
                  <p className="mt-1 text-xs text-anthracite-500">{todaySum.toLocaleString('tr-TR')} ₺ ciro</p>
                </div>
                <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-5 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Ödeme bekliyor</p>
                  <p className="mt-2 text-2xl font-semibold tabular-nums text-anthracite-900">{waitingList.length}</p>
                  <button type="button" onClick={() => setActiveTab('orders')} className="mt-2 text-xs font-semibold text-emerald-700 hover:underline">
                    Siparişler sekmesine git
                  </button>
                </div>
                <div className="rounded-2xl border border-red-200/80 bg-red-50/40 p-5 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-red-800">Hazırlık 3+ gün</p>
                  <p className="mt-2 text-2xl font-semibold tabular-nums text-anthracite-900">{delayedPrep.length}</p>
                </div>
                <div className="rounded-2xl border border-blue-200/80 bg-blue-50/40 p-5 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-blue-800">Kargoda takipsiz</p>
                  <p className="mt-2 text-2xl font-semibold tabular-nums text-anthracite-900">{shippedNoTrack.length}</p>
                </div>
              </div>

              <div className="grid gap-8 lg:grid-cols-2">
                <div className="rounded-2xl border border-anthracite-200/70 bg-white p-6 shadow-sm">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-anthracite-900">
                    <Clock className="h-4 w-4 text-amber-600" strokeWidth={2} />
                    Bekleyen ödeme (özet)
                  </h3>
                  <ul className="max-h-72 space-y-2 overflow-y-auto text-xs">
                    {waitingList.length === 0 ? (
                      <li className="text-anthracite-400">Kayıt yok.</li>
                    ) : (
                      waitingList.slice(0, 25).map((o) => (
                        <li key={o.id} className="flex justify-between gap-2 rounded-lg border border-anthracite-100 bg-anthracite-50/50 px-3 py-2">
                          <span className="min-w-0 truncate font-medium text-anthracite-800">{o.product_name}</span>
                          <span className="shrink-0 tabular-nums text-anthracite-600">{Number(o.total_price).toLocaleString('tr-TR')} ₺</span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
                <div className="rounded-2xl border border-anthracite-200/70 bg-white p-6 shadow-sm">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-anthracite-900">
                    <AlertTriangle className="h-4 w-4 text-red-600" strokeWidth={2} />
                    Geciken / risk (hazırlık)
                  </h3>
                  <ul className="max-h-72 space-y-2 overflow-y-auto text-xs">
                    {delayedPrep.length === 0 ? (
                      <li className="text-anthracite-400">72 saati aşan hazırlık yok.</li>
                    ) : (
                      delayedPrep.map((o) => (
                        <li key={o.id} className="rounded-lg border border-red-100 bg-red-50/50 px-3 py-2">
                          <span className="font-medium text-anthracite-900">{o.product_name}</span>
                          <span className="mt-0.5 block text-[10px] text-anthracite-500">
                            {o.buyer_name} · {new Date(o.created_at).toLocaleString('tr-TR')}
                          </span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/30 p-6 shadow-sm">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-anthracite-900">
                  <Package className="h-4 w-4 text-emerald-600" strokeWidth={2} />
                  Düşük stok (ürün)
                </h3>
                <p className="mb-4 text-xs text-anthracite-600">
                  Toplam adet, ürün satırındaki eşiğin altına indiyse listelenir. E-posta entegrasyonu yok; toptancı panelinde de etiket görünür. Kolon için{" "}
                  <code className="rounded bg-white px-1 text-[10px]">product_bulk_and_alerts.sql</code> gerekir.
                </p>
                <ul className="max-h-64 space-y-2 overflow-y-auto text-xs">
                  {lowStock.length === 0 ? (
                    <li className="text-anthracite-500">Düşük stoklu ürün yok veya veri çekilemedi.</li>
                  ) : (
                    lowStock.map((p) => (
                      <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-emerald-100 bg-white px-3 py-2">
                        <span className="font-medium text-anthracite-900">{p.name}</span>
                        <span className="text-anthracite-500">{p._wholesalerLabel}</span>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          );
        })()}

        {/* ARCHIVE TAB */}
        {activeTab === 'archive' && (
            <div className="bg-white border border-anthracite-100 rounded-2xl p-10 shadow-xl overflow-hidden">
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
                                    {(order.buyer_note || order.payment_receipt_url) && (
                                      <div className="mt-3 max-w-xl space-y-2 rounded-xl border border-anthracite-100 bg-anthracite-50/80 p-3 text-left">
                                        {order.buyer_note ? (
                                          <p className="flex gap-2 text-xs font-medium leading-relaxed text-anthracite-800">
                                            <StickyNote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-anthracite-400" strokeWidth={2} />
                                            <span><span className="font-bold text-anthracite-600">Not: </span>{order.buyer_note}</span>
                                          </p>
                                        ) : null}
                                        {order.payment_receipt_url ? (
                                          <a
                                            href={order.payment_receipt_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 underline underline-offset-2 hover:text-emerald-900"
                                          >
                                            <Receipt className="h-3.5 w-3.5" strokeWidth={2} />
                                            Dekont
                                          </a>
                                        ) : null}
                                      </div>
                                    )}
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
    </DashboardShell>
    )}
    </>
  );
}
