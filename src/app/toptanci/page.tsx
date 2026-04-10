"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  Package, PlusCircle, Image as ImageIcon, Trash2, Eye, Truck, 
  Loader2, LayoutDashboard, ShoppingBag, Wallet, PieChart as ChartIcon, 
  ArrowRight, CheckCircle2, QrCode, FileText, MoveRight, Layers, History as HistoryIcon, Pencil,
  ShieldAlert
} from 'lucide-react';
import { exportInvoicePDF } from '@/utils/exportInvoice';
import { createClient } from '@/utils/supabase/client';
import Image from 'next/image';
import Link from 'next/link';
import NotificationBell from '@/components/NotificationBell';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardTabs } from '@/components/dashboard/DashboardTabs';
import { ORDER_STATUS } from '@/utils/orderStatus';
import { hasPositiveStockLine, isLowStockProduct } from '@/utils/productStocks';
import BulkProductCsvPanel from '@/components/toptanci/BulkProductCsvPanel';

type TabType = 'studio' | 'inventory' | 'orders' | 'finance';

export default function ToptanciDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('inventory');
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  // Ürün Form State'leri
  const [name, setName] = useState('');
  const [gender, setGender] = useState('Unisex');
  const [category, setCategory] = useState('Tişört');
  const [fabricType, setFabricType] = useState('');
  const [sizes, setSizes] = useState('');
  const [gsm, setGsm] = useState('');
  const [wholesalePrice, setWholesalePrice] = useState('');
  const [minOrder, setMinOrder] = useState('');
  const [stockEntries, setStockEntries] = useState<{size: string, quantity: number}[]>([
    { size: 'S', quantity: 0 }, { size: 'M', quantity: 0 }, { size: 'L', quantity: 0 }, { size: 'XL', quantity: 0 }
  ]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [profileIban, setProfileIban] = useState('');
  const [ibanSaving, setIbanSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [minOrderFloor, setMinOrderFloor] = useState('');
  const [minOrderFloorSaving, setMinOrderFloorSaving] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  const fetchData = useCallback(async (userId: string) => {
    setLoading(true);
    // Ürünleri Çek
    const { data: prods } = await supabase.from('products').select('*').eq('wholesaler_id', userId).order('created_at', { ascending: false });
    if (prods) setProducts(prods);

    // Siparişleri Çek
    const { data: ords } = await supabase.from('orders').select('*').eq('wholesaler_id', userId).order('created_at', { ascending: false });
    if (ords) setOrders(ords);

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        fetchData(user.id);
        const { data: prof } = await supabase.from('profiles').select('iban, min_order_floor_units, avatar_url').eq('id', user.id).single();
        if (prof?.iban) setProfileIban(prof.iban);
        if (prof?.avatar_url) setAvatarUrl(prof.avatar_url);
        if (prof?.min_order_floor_units != null && Number(prof.min_order_floor_units) > 0) {
          setMinOrderFloor(String(prof.min_order_floor_units));
        } else {
          setMinOrderFloor('');
        }
      }
    }
    init();
  }, [supabase.auth, fetchData, supabase]);

  const saveProfileIban = async () => {
    if (!user) return;
    setIbanSaving(true);
    const { error } = await supabase.from('profiles').update({ iban: profileIban.trim() || null }).eq('id', user.id);
    setIbanSaving(false);
    if (error) alert('IBAN kaydedilemedi: ' + error.message);
    else alert('IBAN kaydedildi. Admin hakediş ekranında görüntülenebilir.');
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return;
    setAvatarUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase
        .storage
        .from('product-images')
        .upload(path, file, { upsert: true });
      if (uploadErr) throw uploadErr;
      const { data: pub } = supabase.storage.from('product-images').getPublicUrl(path);
      const nextUrl = pub.publicUrl;
      const { error: dbErr } = await supabase
        .from('profiles')
        .update({ avatar_url: nextUrl })
        .eq('id', user.id);
      if (dbErr) throw dbErr;
      setAvatarUrl(nextUrl);
      alert('Profil görseli güncellendi.');
    } catch (err: any) {
      alert('Profil görseli yüklenemedi: ' + (err?.message || 'Bilinmeyen hata'));
    } finally {
      setAvatarUploading(false);
    }
  };

  const saveMinOrderFloor = async () => {
    if (!user) return;
    const raw = minOrderFloor.trim();
    let val: number | null = null;
    if (raw !== '') {
      const n = parseInt(raw, 10);
      if (!Number.isFinite(n) || n < 1) {
        alert('Geçerli bir pozitif tam sayı girin veya alanı boş bırakın.');
        return;
      }
      val = n;
    }
    setMinOrderFloorSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ min_order_floor_units: val })
      .eq('id', user.id);
    setMinOrderFloorSaving(false);
    if (error) alert('Kaydedilemedi: ' + error.message);
    else alert(val == null ? 'Mağaza tabanı kaldırıldı (yalnızca ürün MOQ geçerli).' : `Tek sipariş minimum ${val} adet olarak kaydedildi.`);
  };

  const clearForm = () => {
     setName(''); setFabricType(''); setWholesalePrice(''); setSelectedFiles([]); setPreviewUrls([]); setGsm(''); setSizes(''); setMinOrder('');
     setStockEntries([{ size: 'S', quantity: 0 }, { size: 'M', quantity: 0 }, { size: 'L', quantity: 0 }, { size: 'XL', quantity: 0 }]);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (selectedFiles.length === 0) return alert("En az 1 fotoğraf seçin!");
    
    setIsAddingProduct(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of selectedFiles) {
        const filePath = `${user.id}/${Math.random()}.${file.name.split('.').pop()}`;
        const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(filePath);
        uploadedUrls.push(publicUrl);
      }

      const stocksJson = stockEntries.reduce((acc: Record<string, number>, curr) => {
        if (curr.size.trim()) acc[curr.size.trim()] = Number(curr.quantity);
        return acc;
      }, {});

      if (!hasPositiveStockLine(stocksJson)) {
        alert('En az bir bedende stok adedi 1 veya üzeri olmalı. Standart seri için tek beden adı (ör. Standart) ve miktar girin.');
        setIsAddingProduct(false);
        return;
      }

      const { data: insertedRows, error: dbError } = await supabase
        .from('products')
        .insert([
          {
            wholesaler_id: user.id,
            name,
            category,
            gender,
            stocks: stocksJson,
            fabric_type: fabricType,
            gsm: gsm || null,
            images: uploadedUrls,
            base_wholesale_price: Number(wholesalePrice),
            margin_price: Number(wholesalePrice) * 0.15,
            stock_status: 'In Stock',
            min_order_quantity: Number(minOrder),
            low_stock_threshold: 5,
          },
        ])
        .select('id')
        .single();

      if (dbError) throw dbError;
      if (insertedRows?.id) {
        const { error: rpcErr } = await supabase.rpc('notify_boutiques_new_catalog_product', {
          p_product_id: insertedRows.id,
        });
        if (rpcErr) console.warn('Butik bildirimi (SQL fonksiyonu çalıştırıldı mı?):', rpcErr.message);
      }
      alert("Ürün Vitrine Eklendi!");
      clearForm();
      setActiveTab('inventory');
      fetchData(user.id);
    } catch (err: any) { alert(err.message); } finally { setIsAddingProduct(false); }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Ürünü yayından kaldırmak istediğinize emin misiniz?")) return;
    await supabase.from('products').delete().eq('id', id);
    fetchData(user?.id);
  };

  if (!user) return <div className="flex min-h-screen items-center justify-center bg-[#f5f4f2] text-sm font-medium text-anthracite-500">Oturum doğrulanıyor…</div>;

  return (
    <DashboardShell>
      <DashboardHeader
        icon={Layers}
        eyebrow="Toptancı"
        title="Üretici paneli"
        right={
          <div className="rounded-lg border border-anthracite-200/80 bg-white p-1 shadow-sm">
            <NotificationBell userId={user.id} />
          </div>
        }
      />

      <DashboardTabs
        value={activeTab}
        onChange={(id) => setActiveTab(id as TabType)}
        items={[
          { id: 'inventory', label: 'Vitrin', icon: LayoutDashboard },
          { id: 'orders', label: 'Siparişler', icon: ShoppingBag },
          { id: 'studio', label: 'Yeni ürün', icon: PlusCircle },
          { id: 'finance', label: 'Hakediş', icon: Wallet },
        ]}
      />

      {loading ? (
          <div className="py-20 text-center text-sm font-medium text-anthracite-400">Yükleniyor…</div>
      ) : (
          <div className="transition-all duration-500">
            
            {/* INVENTORY TAB */}
            {activeTab === 'inventory' && (
                <div className="rounded-2xl border border-anthracite-200/70 bg-white p-6 text-left shadow-sm sm:p-8">
                    <div className="mb-8 flex flex-col gap-4 border-b border-anthracite-100/90 pb-6 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-anthracite-900 sm:text-xl">Vitrin ({products.length})</h2>
                            <p className="mt-1 text-sm text-anthracite-500">Katalogda görünen ürünleriniz.</p>
                        </div>
                        <button type="button" onClick={() => setActiveTab('studio')} className="rounded-lg bg-emerald-600 px-5 py-2.5 text-xs font-medium text-white shadow-sm transition hover:bg-emerald-700">Yeni ürün ekle</button>
                    </div>

                    <div className="mb-8 rounded-2xl border border-amber-200/90 bg-gradient-to-br from-amber-50/90 to-white p-5 shadow-sm sm:p-6">
                      <div className="mb-5 rounded-xl border border-emerald-200/80 bg-emerald-50/60 p-4">
                        <h3 className="mb-2 text-sm font-semibold text-anthracite-900">
                          Profil görseli (mağaza vitrini)
                        </h3>
                        <p className="mb-3 text-xs text-anthracite-600">
                          Butikler “Toptancıyı gör” sayfasında bu görseli görür.
                        </p>
                        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                          <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-anthracite-200 bg-white">
                            {avatarUrl ? (
                              <Image src={avatarUrl} alt="Profil" fill sizes="64px" className="object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[10px] font-medium text-anthracite-400">
                                Görsel yok
                              </div>
                            )}
                          </div>
                          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-anthracite-200 bg-white px-4 py-2 text-xs font-medium text-anthracite-700 hover:bg-anthracite-50">
                            {avatarUploading ? 'Yükleniyor…' : 'Görsel seç'}
                            <input
                              type="file"
                              accept="image/*"
                              disabled={avatarUploading}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) void uploadAvatar(file);
                                e.currentTarget.value = '';
                              }}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      <div className="mb-3 flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                          <ShieldAlert className="h-5 w-5" strokeWidth={2} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-semibold text-anthracite-900 sm:text-base">
                            Mağaza satış politikası
                          </h3>
                          <p className="mt-1 text-xs leading-relaxed text-anthracite-600 sm:text-sm">
                            Örneğin «500 adetin altına satmıyorum» diyorsanız buraya{" "}
                            <strong className="font-medium text-anthracite-800">tek siparişte</strong> kabul
                            edeceğiniz minimum <strong className="font-medium text-anthracite-800">toplam adet</strong>{" "}
                            yazın. Butik bu adedin altında sipariş veremez (ürün MOQ&apos;suna ek olarak).
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                        <div className="flex-1">
                          <label htmlFor="min-order-floor" className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-anthracite-500">
                            Minimum toplam adet (tek sipariş)
                          </label>
                          <input
                            id="min-order-floor"
                            type="number"
                            min={1}
                            inputMode="numeric"
                            placeholder="Örn. 500 — boş bırakırsanız sınır yok"
                            value={minOrderFloor}
                            onChange={(e) => setMinOrderFloor(e.target.value)}
                            className="w-full rounded-xl border border-anthracite-200/90 bg-white px-4 py-3 text-sm outline-none ring-emerald-500/0 transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20"
                          />
                        </div>
                        <button
                          type="button"
                          disabled={minOrderFloorSaving}
                          onClick={saveMinOrderFloor}
                          className="shrink-0 rounded-xl bg-anthracite-900 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-anthracite-800 disabled:opacity-50"
                        >
                          {minOrderFloorSaving ? 'Kaydediliyor…' : 'Kaydet'}
                        </button>
                      </div>
                    </div>

                    {user && (
                      <div className="mb-8">
                        <BulkProductCsvPanel userId={user.id} onImported={() => fetchData(user.id)} />
                      </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3 md:gap-4">
                       {products.length === 0 ? (
                           <div className="col-span-full py-20 text-center bg-anthracite-50 rounded-xl border-2 border-dashed border-anthracite-100">
                               <Package className="w-16 h-16 mx-auto text-anthracite-200 mb-4" />
                               <p className="text-sm text-anthracite-500">Henüz ürün yok.</p>
                           </div>
                       ) : products.map(p => (
                           <div key={p.id} className="group bg-white rounded-xl sm:rounded-2xl border border-anthracite-100/90 shadow-sm hover:shadow-md overflow-hidden transition-all relative text-left">
                               <div className="relative aspect-[4/5] sm:aspect-[5/6] bg-anthracite-50 overflow-hidden">
                                  {isLowStockProduct(p) && (
                                    <span className="absolute left-2 top-2 z-10 rounded-md bg-amber-500 px-1.5 py-0.5 text-[8px] font-black uppercase text-white shadow-sm">
                                      Düşük stok
                                    </span>
                                  )}
                                  <Image src={p.images?.[0]} alt="p" fill sizes="(max-width: 640px) 50vw, 20vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                  <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                      <Link
                                        href={`/toptanci/edit/${p.id}`}
                                        className="flex items-center justify-center rounded-lg bg-emerald-600 p-2 text-white shadow-md transition hover:bg-emerald-700"
                                        title="Düzenle"
                                      >
                                          <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
                                      </Link>
                                      <button type="button" onClick={() => handleDelete(p.id)} className="p-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition-all">
                                          <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                  </div>
                               </div>
                               <div className="p-2.5 sm:p-3">
                                   <h3 className="font-bold text-xs sm:text-sm text-anthracite-900 leading-snug line-clamp-2 mb-2">{p.name}</h3>
                                   <div className="flex flex-wrap gap-1 mb-2 max-h-14 overflow-y-auto">
                                      {Object.entries(p.stocks || {}).map(([size, qty]: [string, any]) => (
                                          <span key={size} className={`text-[7px] sm:text-[8px] font-bold px-1.5 py-0.5 rounded border ${Number(qty) > 0 ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-600'}`}>
                                              {size}:{qty}
                                          </span>
                                      ))}
                                   </div>
                                   <div className="pt-2 border-t border-anthracite-100/80 flex items-end justify-between gap-1">
                                       <div className="flex flex-col min-w-0">
                                           <span className="text-[8px] font-bold text-anthracite-400 uppercase">Net</span>
                                           <span className="font-black text-sm sm:text-base text-emerald-600 tabular-nums">{p.base_wholesale_price.toLocaleString('tr-TR')} ₺</span>
                                       </div>
                                       <div className="bg-anthracite-900 text-white px-2 py-1 rounded-md text-[8px] font-black uppercase shrink-0">MOQ {p.min_order_quantity}</div>
                                   </div>
                               </div>
                           </div>
                       ))}
                    </div>
                </div>
            )}

            {/* STUDIO TAB (YÜKLEME FORMU V2 - ELITE EXPERT) */}
            {activeTab === 'studio' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 text-left items-start">
                    
                    {/* SOL - VERİ GİRİŞ FORMU */}
                    <div className="lg:col-span-8 flex flex-col gap-8">
                        <div className="rounded-2xl border border-anthracite-200/70 bg-white p-6 shadow-sm sm:p-8">
                            <div className="mb-2 flex items-center gap-2">
                               <PlusCircle className="h-5 w-5 text-emerald-600" strokeWidth={2} />
                               <h2 className="text-xl font-semibold text-anthracite-900 sm:text-2xl">Yeni ürün</h2>
                            </div>
                            <p className="mb-8 text-sm text-anthracite-500">Model bilgilerini ve stokları girin.</p>

                            <form onSubmit={handleAddProduct} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="text-[10px] font-black text-anthracite-400 uppercase tracking-widest block mb-2 px-1">Model Adı / Koleksiyon Başlığı</label>
                                        <input required value={name} onChange={e=>setName(e.target.value)} className="w-full px-6 py-5 bg-anthracite-50 rounded-2xl font-black text-xl shadow-inner focus:ring-4 focus:ring-emerald-500/10 focus:bg-white transition-all outline-none border-2 border-transparent focus:border-emerald-500" placeholder="Örn: 24 S/S Double-Face Polo" />
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-[10px] font-black text-anthracite-400 uppercase tracking-widest block mb-2 px-1">Hedef Cinsiyet</label>
                                            <div className="flex flex-wrap gap-2">
                                                {['Erkek', 'Kadın', 'Çocuk', 'Unisex'].map((g) => (
                                                    <button key={g} type="button" onClick={() => setGender(g)} className={`px-4 py-2 rounded-xl text-xs font-black transition-all border-2 ${gender === g ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-white text-anthracite-400 border-anthracite-100 hover:border-emerald-200'}`}>{g.toUpperCase()}</button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-anthracite-400 uppercase tracking-widest block mb-2 px-1">Ürün Kategorisi</label>
                                            <select value={category} onChange={e=>setCategory(e.target.value)} className="w-full bg-anthracite-50 px-6 py-4 rounded-2xl font-black text-sm outline-none border-2 border-transparent focus:border-emerald-500 shadow-inner">
                                                <option>Tişört</option><option>Sweatshirt</option><option>İç Çamaşırı / Pijama</option><option>Ayakkabı / Sneaker</option><option>Triko</option><option>Pantolon / Jean</option><option>Mont / Kaban</option><option>Elbise / Etek</option><option>Aksesuar</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-[10px] font-black text-anthracite-400 uppercase tracking-widest block mb-2 px-1">Kumaş / Materyal</label>
                                            <input required value={fabricType} onChange={e=>setFabricType(e.target.value)} className="w-full px-6 py-4 bg-anthracite-50 rounded-2xl font-black text-sm shadow-inner outline-none border-2 border-transparent focus:border-emerald-500" placeholder="%100 Pamuk" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-anthracite-400 uppercase tracking-widest block mb-2 px-1">Gramaj / Ağırlık (Opsiyonel)</label>
                                            <input value={gsm} onChange={e=>setGsm(e.target.value)} className="w-full px-6 py-4 bg-anthracite-50 rounded-2xl font-black text-sm shadow-inner outline-none border-2 border-transparent focus:border-emerald-500" placeholder="280 GSM" />
                                        </div>
                                    </div>

                                    {/* STOK TABLOSU (PREMIUM TABLE V2) */}
                                    <div className="md:col-span-2 bg-emerald-50/50 rounded-xl p-8 border border-emerald-100/50">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                                           <div>
                                              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest border-l-4 border-emerald-500 pl-3">Asorti Stok Yönetimi (Expert View)</p>
                                              <p className="text-xs font-medium text-emerald-600/70 mt-1">Her beden için mevcut stok miktarını girin.</p>
                                           </div>
                                           <button type="button" onClick={() => setStockEntries([...stockEntries, { size: '', quantity: 0 }])} className="px-5 py-2.5 bg-emerald-600 text-white text-[10px] font-black rounded-xl uppercase shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all">+ YENİ BEDEN EKLE</button>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                                            {stockEntries.map((entry, idx) => (
                                                <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-emerald-100 group relative">
                                                    <input placeholder="Beden" value={entry.size} onChange={e=> {let n=[...stockEntries]; n[idx].size=e.target.value.toUpperCase(); setStockEntries(n);}} className="w-full text-center font-black text-base outline-none mb-1 border-b border-anthracite-50 focus:border-emerald-500 uppercase pb-1" />
                                                    <input type="number" min="0" value={entry.quantity} onChange={e=> {let n=[...stockEntries]; n[idx].quantity=Number(e.target.value); setStockEntries(n);}} className="w-full text-center text-xs font-black text-emerald-600 outline-none" />
                                                    <button type="button" onClick={()=>setStockEntries(stockEntries.filter((_,i)=>i!==idx))} className="absolute -top-2 -right-2 p-1.5 bg-red-100 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all border border-red-200"><Trash2 className="w-3 h-3"/></button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* FİYATLANDIRMA */}
                                    <div className="md:col-span-1 bg-anthracite-900 rounded-xl p-8 text-white shadow-xl shadow-anthracite-900/20">
                                        <label className="text-[10px] font-black text-white/50 uppercase tracking-widest block mb-4">Sizin Kazancınız (Birim ₺)</label>
                                        <div className="flex items-center gap-4">
                                            <Wallet className="w-8 h-8 text-emerald-400" />
                                            <input required type="number" value={wholesalePrice} onChange={e=>setWholesalePrice(e.target.value)} className="w-full bg-transparent font-black text-4xl outline-none border-b-2 border-white/10 focus:border-emerald-500 transition-all pb-2" placeholder="0" />
                                            <span className="text-2xl font-black text-emerald-400">₺</span>
                                        </div>
                                    </div>
                                    <div className="md:col-span-1 bg-white border border-anthracite-100 rounded-xl p-8 shadow-sm">
                                        <label className="text-[10px] font-black text-anthracite-400 uppercase tracking-widest block mb-4">Paket/Seri Adedi (MOQ)</label>
                                        <div className="flex items-center gap-4">
                                            <ShoppingBag className="w-8 h-8 text-anthracite-900" />
                                            <input required type="number" value={minOrder} onChange={e=>setMinOrder(e.target.value)} className="w-full bg-transparent font-black text-4xl outline-none border-b-2 border-anthracite-100 focus:border-anthracite-900 transition-all pb-2" placeholder="0" />
                                            <span className="text-xl font-bold text-anthracite-400">PÇ</span>
                                        </div>
                                    </div>
                                    
                                    {/* MEDYA ALANI */}
                                    <div className="md:col-span-2">
                                        <label className="text-[10px] font-black text-anthracite-400 uppercase tracking-widest block mb-2 px-1">Ürün Fotoğrafları</label>
                                        <div className="relative border-4 border-dashed border-anthracite-100 rounded-2xl p-10 text-center hover:bg-anthracite-50 hover:border-emerald-500/30 transition-all group cursor-pointer">
                                            <input required type="file" multiple accept="image/*" onChange={(e)=> {let fs=Array.from(e.target.files||[]); setSelectedFiles(fs); setPreviewUrls(fs.map(f=>URL.createObjectURL(f)));}} className="absolute inset-0 opacity-0 cursor-pointer z-20" />
                                            <div className="flex flex-col items-center gap-3 relative z-10">
                                                <div className="w-20 h-20 bg-white shadow-xl rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                                    <ImageIcon className="w-10 h-10" />
                                                </div>
                                                <h4 className="font-black text-xl text-anthracite-900">Fotoğrafları Sürükleyin</h4>
                                                <p className="text-xs font-medium text-anthracite-400 max-w-xs mx-auto">En az 1 fotoğraf yükleyin. Net görünümler butiklerin satışını artırır.</p>
                                            </div>
                                            {previewUrls.length > 0 && (
                                                <div className="mt-8 flex flex-wrap gap-3 justify-center relative z-20">
                                                    {previewUrls.map((u, i) => (
                                                        <div key={i} className="w-24 h-32 relative rounded-2xl overflow-hidden border-2 border-emerald-200 shadow-xl transform rotate-2 hover:rotate-0 transition-transform"><Image src={u} alt="p" fill className="object-cover" /></div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <button disabled={isAddingProduct} className="w-full py-8 bg-anthracite-900 text-white font-black text-2xl rounded-2xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-4">
                                    {isAddingProduct ? (
                                        <>
                                           <Loader2 className="w-8 h-8 animate-spin" />
                                           SİSTEME KAYDEDİLİYOR...
                                        </>
                                    ) : "MODELİ VİTRİNE GÖNDER & YAYINLA"}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* SAĞ - MOBIL SIMULASYON PREVIEW (STICKY) */}
                    <div className="lg:col-span-4 hidden lg:block sticky top-32 h-max">
                        <div className="bg-[#121212] p-8 rounded-[3.5rem] border-[8px] border-[#222] shadow-[0_0_100px_rgba(0,0,0,0.5)] relative">
                            {/* iPhone Speaker / Notch */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-[#222] rounded-b-3xl z-30"></div>
                            
                            <h3 className="text-xs font-black text-emerald-500 uppercase tracking-widest text-center mt-2 mb-6">Müşteri Uygulaması Önizleme</h3>
                            
                            <div className="space-y-6">
                                <div className="aspect-[4/5] bg-[#1a1a1a] rounded-xl overflow-hidden border border-white/5 relative shadow-inner">
                                    {previewUrls.length > 0 ? (
                                        <Image src={previewUrls[0]} alt="p" fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center opacity-10">
                                            <ImageIcon className="w-20 h-20 text-white" />
                                            <p className="text-[10px] font-black uppercase mt-4">GÖRSEL YOK</p>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4 px-2">
                                    <div className="flex items-center gap-2">
                                       <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-1 rounded uppercase tracking-widest">{gender}</span>
                                       <span className="bg-white/10 text-white/40 text-[9px] font-black px-2 py-1 rounded uppercase tracking-widest">{category}</span>
                                    </div>
                                    <h4 className="text-2xl font-black text-white leading-tight break-words">{name || "Model Adı"}</h4>
                                    
                                    <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Butik Satış Fiyatı</p>
                                            <p className="text-3xl font-black text-white">
                                                {wholesalePrice ? (Number(wholesalePrice) * 1.15).toLocaleString('tr-TR') : "0"} ₺
                                            </p>
                                        </div>
                                        <button className="bg-white text-black p-4 rounded-3xl shadow-xl hover:scale-110 active:scale-90 transition-all">
                                            <Eye className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="mt-8 text-center text-anthracite-400 text-xs font-medium italic">Bu alan butiklerin ürününüzü nasıl göreceğini simüle eder.</p>
                    </div>
                </div>
            )}

            {/* ORDERS TAB (GELEN SİPARİŞLER) */}
            {activeTab === 'orders' && (
                <div className="rounded-2xl border border-anthracite-200/70 bg-white p-6 text-left shadow-sm sm:p-8">
                    <div className="mb-8 border-b border-anthracite-100/90 pb-6">
                        <h2 className="text-lg font-semibold text-anthracite-900 sm:text-xl">Siparişler ({orders.length})</h2>
                        <p className="mt-1 text-sm text-anthracite-500">Ödemesi onaylanmış işlemler.</p>
                    </div>

                    <div className="space-y-5">
                        {orders.length === 0 ? (
                            <p className="py-16 text-center text-sm text-anthracite-400">Henüz sipariş yok.</p>
                        ) : orders.map(ord => (
                            <div key={ord.id} className="group relative flex flex-col items-center gap-6 overflow-hidden rounded-xl border border-anthracite-200/60 bg-anthracite-50/30 p-5 transition hover:border-anthracite-300/80 hover:bg-white hover:shadow-sm md:flex-row md:gap-8">
                                <div className="absolute right-5 top-5 flex gap-2 md:right-6 md:top-6">
                                     <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${ord.status === ORDER_STATUS.SHIPPED ? 'border-blue-200 bg-blue-50 text-blue-700' : ord.status === ORDER_STATUS.DELIVERED ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
                                         {ord.status === ORDER_STATUS.SHIPPED ? 'Kargoda' : ord.status === ORDER_STATUS.DELIVERED ? 'Teslim' : 'Hazırlanıyor'}
                                     </span>
                                </div>
                                <div className="flex w-full flex-1 flex-col items-center gap-6 text-left sm:flex-row sm:gap-8">
                                    <div className="h-32 w-24 shrink-0 overflow-hidden rounded-xl border border-anthracite-100 bg-white">
                                        <Image src={products.find(p=>p.id===ord.product_id)?.images?.[0] || ''} alt="p" width={100} height={130} className="h-full w-full object-cover" />
                                    </div>
                                    <div className="w-full flex-1 sm:w-auto">
                                        <div className="mb-1 flex items-center gap-2">
                                            <span className="text-[10px] font-medium uppercase tracking-wide text-anthracite-400">Butik</span>
                                            <MoveRight className="h-3 w-3 text-anthracite-300" />
                                        </div>
                                        <h3 className="mb-3 text-lg font-semibold text-anthracite-900 sm:text-xl">{ord.buyer_name}</h3>
                                        <div className="flex flex-wrap gap-3 border-t border-anthracite-100/80 pt-4">
                                            <div className="rounded-lg bg-white/90 px-3 py-2 ring-1 ring-anthracite-100/80">
                                                <p className="mb-0.5 text-[10px] font-medium text-anthracite-400">Model</p>
                                                <p className="text-xs font-medium text-anthracite-900">{ord.product_name}</p>
                                            </div>
                                            <div className="rounded-lg bg-white/90 px-3 py-2 ring-1 ring-anthracite-100/80">
                                                <p className="mb-0.5 text-[10px] font-medium text-anthracite-400">Beden dağılımı / toplam</p>
                                                <p className="text-xs font-medium text-anthracite-900">{ord.selected_size} · {ord.quantity}</p>
                                            </div>
                                            <div className="rounded-lg bg-emerald-50/90 px-3 py-2 ring-1 ring-emerald-100/80">
                                                <p className="mb-0.5 text-[10px] font-medium text-emerald-700">Net</p>
                                                <p className="text-xs font-semibold tabular-nums text-emerald-800">{ord.wholesaler_earning.toLocaleString('tr-TR')} ₺</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto">
                                    <Link href="/toptanci/siparisler" className="flex items-center justify-center gap-2 rounded-lg bg-anthracite-900 px-5 py-3 text-xs font-medium text-white shadow-sm transition hover:bg-anthracite-800">
                                        <Truck className="h-4 w-4" strokeWidth={2} /> Kargoya gönder
                                    </Link>
                                    <button type="button" onClick={()=>exportInvoicePDF(ord)} className="flex items-center justify-center gap-2 rounded-lg border border-anthracite-200 bg-white px-5 py-2.5 text-xs font-medium text-anthracite-800 transition hover:bg-anthracite-50"><FileText className="h-4 w-4" strokeWidth={2} /> İrsaliye</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* FINANCE TAB */}
            {activeTab === 'finance' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
                    <div className="lg:col-span-12 rounded-2xl border border-anthracite-200/70 bg-white p-6 shadow-sm sm:p-8">
                        <h3 className="mb-2 flex items-center gap-2 text-base font-semibold text-anthracite-900">
                          <Wallet className="h-5 w-5 text-blue-600" strokeWidth={2} /> Ödeme IBAN
                        </h3>
                        <p className="text-xs font-medium text-anthracite-500 mb-4">Havale ödemeleri için işletme IBANınızı girin; yönetim bu karttan kopyalayabilir.</p>
                        <div className="flex flex-col sm:flex-row gap-3 max-w-3xl">
                          <input
                            type="text"
                            value={profileIban}
                            onChange={(e) => setProfileIban(e.target.value)}
                            className="flex-1 px-5 py-4 rounded-2xl border border-anthracite-200 bg-anthracite-50 font-mono text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                            placeholder="TR00 0000 0000 0000 0000 0000 00"
                          />
                          <button
                            type="button"
                            disabled={ibanSaving}
                            onClick={saveProfileIban}
                            className="px-8 py-4 rounded-2xl bg-anthracite-900 text-white font-black text-xs uppercase tracking-widest disabled:opacity-50"
                          >
                            {ibanSaving ? 'Kaydediliyor...' : 'IBAN Kaydet'}
                          </button>
                        </div>
                    </div>
                    <div className="lg:col-span-4 bg-emerald-500 p-10 rounded-2xl text-white shadow-2xl shadow-emerald-500/20 group relative overflow-hidden h-max">
                        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform">
                            <ChartIcon className="w-48 h-48" />
                        </div>
                        <h3 className="text-xl font-black mb-1">Mevcut Bakiyeniz</h3>
                        <p className="text-xs font-medium text-white/70 mb-10">Admin havuzunda bekleyen net alacağınız:</p>
                        <span className="text-5xl font-black tracking-tighter">
                            {orders.reduce((acc, o) => acc + Number(o.wholesaler_earning), 0).toLocaleString('tr-TR')} ₺
                        </span>
                        <div className="mt-10 pt-10 border-t border-white/20">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Toplam Satışın</p>
                                <span className="font-black text-sm">{orders.length} Sipariş</span>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-white border border-anthracite-100 rounded-2xl p-10 shadow-xl">
                            <h3 className="text-xl font-black text-anthracite-900 mb-8 flex items-center gap-3">
                                <HistoryIcon className="w-6 h-6 text-emerald-500" /> Son Kazanç Kayıtları
                            </h3>
                            <div className="space-y-4">
                                {orders.slice(0, 5).map(o => (
                                    <div key={o.id} className="p-5 bg-anthracite-50 border border-anthracite-100 rounded-2xl flex items-center justify-between group hover:bg-white transition-all shadow-sm">
                                        <div className="flex items-center gap-4 text-left">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-emerald-500 font-black text-xs">
                                                <CheckCircle2 className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="font-black text-anthracite-900 leading-tight">{o.product_name}</p>
                                                <p className="text-[10px] font-bold text-anthracite-400 uppercase">{new Date(o.created_at).toLocaleDateString('tr-TR')}</p>
                                            </div>
                                        </div>
                                        <span className="font-black text-lg text-emerald-600">+{o.wholesaler_earning.toLocaleString('tr-TR')} ₺</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

          </div>
      )}
    </DashboardShell>
  );
}
