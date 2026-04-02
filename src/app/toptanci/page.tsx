"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  Package, PlusCircle, Image as ImageIcon, Trash2, Eye, Truck, 
  Loader2, LayoutDashboard, ShoppingBag, Wallet, PieChart as ChartIcon, 
  ArrowRight, CheckCircle2, QrCode, FileText, MoveRight, Layers, History as HistoryIcon
} from 'lucide-react';
import { exportInvoicePDF } from '@/utils/exportInvoice';
import { createClient } from '@/utils/supabase/client';
import Image from 'next/image';
import Link from 'next/link';
import NotificationBell from '@/components/NotificationBell';

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
      }
    }
    init();
  }, [supabase.auth, fetchData]);

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

      const stocksJson = stockEntries.reduce((acc: any, curr) => {
        if (curr.size.trim()) acc[curr.size.trim()] = Number(curr.quantity);
        return acc;
      }, {});

      const { error: dbError } = await supabase.from('products').insert([{
        wholesaler_id: user.id, name, category, gender, stocks: stocksJson, fabric_type: fabricType, gsm: gsm || null, images: uploadedUrls,
        base_wholesale_price: Number(wholesalePrice), margin_price: Number(wholesalePrice) * 0.15, stock_status: 'In Stock', min_order_quantity: Number(minOrder)
      }]);

      if (dbError) throw dbError;
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

  if (!user) return <div className="p-24 text-center font-black animate-pulse uppercase tracking-[0.2em] text-xs">Ağ Yetkisi Doğrulanıyor...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen bg-anthracite-50/10">
      
      {/* ÜST BAŞLIK */}
      <div className="flex justify-between items-center mb-10 text-left">
        <div>
           <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <Layers className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-100 px-2 py-0.5 rounded">TOPTANCI İSTASYONU</span>
           </div>
           <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-anthracite-900 leading-none">Üretici Paneli</h1>
        </div>
        <div className="bg-white p-2 rounded-2xl border border-anthracite-100 shadow-sm">
            {user && <NotificationBell userId={user.id} />}
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="sticky top-20 z-40 mb-10 overflow-x-auto scrollbar-hide py-2">
          <div className="flex items-center gap-2 bg-white p-2 rounded-3xl border border-anthracite-100 shadow-xl w-max mx-auto sm:mx-0">
             {(['inventory', 'orders', 'studio', 'finance'] as const).map((tab) => {
                 const icons = { studio: PlusCircle, inventory: LayoutDashboard, orders: ShoppingBag, finance: Wallet };
                 const labels = { studio: 'Yeni Ürün Yükle', inventory: 'Aktif Vitrinim', orders: 'Gelen Siparişler', finance: 'Hakediş & Analiz' };
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
          <div className="py-24 text-center font-black animate-pulse uppercase tracking-[0.2em] text-xs">Veriler Hazırlanıyor...</div>
      ) : (
          <div className="transition-all duration-500">
            
            {/* INVENTORY TAB */}
            {activeTab === 'inventory' && (
                <div className="bg-white border border-anthracite-100 rounded-[3rem] p-8 sm:p-12 shadow-xl text-left">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 pb-6 border-b border-anthracite-100">
                        <div>
                            <h2 className="text-2xl font-black text-anthracite-900 mb-1">Mevcut Koleksiyonunuz ({products.length})</h2>
                            <p className="text-sm font-medium text-anthracite-500">Vitrin üzerinde butiklere sergilenen aktif ürünleriniz.</p>
                        </div>
                        <button onClick={() => setActiveTab('studio')} className="px-8 py-3 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all">+ YENİ MODEL EKLE</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                       {products.length === 0 ? (
                           <div className="col-span-full py-20 text-center bg-anthracite-50 rounded-[2.5rem] border-2 border-dashed border-anthracite-100">
                               <Package className="w-16 h-16 mx-auto text-anthracite-200 mb-4" />
                               <p className="font-black text-anthracite-400 uppercase tracking-widest text-xs">Henüz Ürün Yüklemediniz.</p>
                           </div>
                       ) : products.map(p => (
                           <div key={p.id} className="group bg-white rounded-[2.5rem] border border-anthracite-100 shadow-sm hover:shadow-2xl overflow-hidden transition-all relative text-left">
                               <div className="relative aspect-[3/4] bg-anthracite-50 overflow-hidden">
                                  <Image src={p.images?.[0]} alt="p" fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                                  <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                      <button onClick={() => handleDelete(p.id)} className="p-3 bg-red-500 text-white rounded-2xl shadow-xl hover:bg-red-600 transition-all">
                                          <Trash2 className="w-4 h-4" />
                                      </button>
                                  </div>
                               </div>
                               <div className="p-6">
                                   <div className="flex justify-between items-start mb-4">
                                       <h3 className="font-black text-lg text-anthracite-900 leading-tight line-clamp-1">{p.name}</h3>
                                   </div>
                                   <div className="flex flex-wrap gap-1.5 mb-6">
                                      {Object.entries(p.stocks || {}).map(([size, qty]: [string, any]) => (
                                          <span key={size} className={`text-[9px] font-black px-2 py-0.5 rounded border ${Number(qty) > 0 ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-500'}`}>
                                              {size}: {qty}
                                          </span>
                                      ))}
                                   </div>
                                   <div className="pt-5 border-t border-anthracite-50 flex items-center justify-between">
                                       <div className="flex flex-col">
                                           <span className="text-[9px] font-black text-anthracite-400 uppercase leading-none mb-1">Net Kazanç</span>
                                           <span className="font-black text-xl text-emerald-600">{p.base_wholesale_price.toLocaleString('tr-TR')} ₺</span>
                                       </div>
                                       <div className="bg-anthracite-900 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest">MOQ: {p.min_order_quantity}</div>
                                   </div>
                               </div>
                           </div>
                       ))}
                    </div>
                </div>
            )}

            {/* STUDIO TAB (YÜKLEME FORMU) */}
            {activeTab === 'studio' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 text-left">
                    {/* ÖNİZLEME */}
                    <div className="lg:col-span-4 hidden lg:block sticky top-32 h-max">
                        <div className="bg-anthracite-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                           <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12">
                              <Layers className="w-64 h-64" />
                           </div>
                           <h3 className="text-xl font-black mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
                               <QrCode className="w-5 h-5 text-emerald-400" /> Vitrin Canlı Simülasyon
                           </h3>
                           <div className="aspect-[3/4] bg-white/5 rounded-[2rem] border border-white/10 mb-6 overflow-hidden flex items-center justify-center">
                              {previewUrls.length > 0 ? (
                                  <Image src={previewUrls[0]} alt="p" width={400} height={600} className="w-full h-full object-cover" />
                              ) : <ImageIcon className="w-12 h-12 text-white/10" />}
                           </div>
                           <h4 className="text-2xl font-black leading-tight mb-2">{name || "Model Adı"}</h4>
                           <div className="flex flex-wrap gap-2 mb-6">
                              <span className="bg-white/10 text-emerald-300 text-[10px] font-black px-3 py-1 rounded-md uppercase">{gender}</span>
                              <span className="bg-white/10 text-white/60 text-[10px] font-black px-3 py-1 rounded-md uppercase">{category}</span>
                           </div>
                           <div className="flex items-center justify-between pt-6 border-t border-white/10">
                               <div>
                                   <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Müşteri Fiyatı</p>
                                   <span className="text-3xl font-black">{wholesalePrice ? (Number(wholesalePrice) * 1.15).toLocaleString('tr-TR') : "0"} ₺</span>
                               </div>
                               <button className="bg-white/10 p-3 rounded-2xl"><Eye className="w-5 h-5"/></button>
                           </div>
                        </div>
                    </div>

                    {/* FORM */}
                    <div className="lg:col-span-8">
                        <div className="bg-white border border-anthracite-100 rounded-[3rem] p-8 sm:p-12 shadow-xl">
                            <h2 className="text-3xl font-black text-anthracite-900 mb-2">Model Detaylarını Gir</h2>
                            <p className="text-sm font-medium text-anthracite-500 mb-10">Üretim bandındaki ürünü ağa sürmek için formülü eksiksiz doldurun.</p>

                            <form onSubmit={handleAddProduct} className="space-y-8">
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black text-anthracite-400 uppercase tracking-widest block mb-1">Model Başlığı</label>
                                        <input required value={name} onChange={e=>setName(e.target.value)} className="w-full px-6 py-4 bg-anthracite-50 rounded-2xl font-black text-lg shadow-inner outline-none focus:ring-4 focus:ring-emerald-50 focus:bg-white transition-all border-none" placeholder="Örn: 3 İplik Oversize Sweatshirt" />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="p-6 bg-anthracite-50 rounded-[2rem] border border-anthracite-100">
                                            <label className="text-[10px] font-black text-anthracite-400 uppercase tracking-widest block mb-2">Hedef Cinsiyet (Tag)</label>
                                            <select value={gender} onChange={e=>setGender(e.target.value)} className="w-full bg-white px-4 py-3 rounded-xl font-bold outline-none border-none shadow-sm">
                                                <option>Erkek</option><option>Kadın</option><option>Çocuk</option><option>Unisex</option>
                                            </select>
                                        </div>
                                        <div className="p-6 bg-anthracite-50 rounded-[2rem] border border-anthracite-100">
                                            <label className="text-[10px] font-black text-anthracite-400 uppercase tracking-widest block mb-2">Ana Kategori</label>
                                            <select value={category} onChange={e=>setCategory(e.target.value)} className="w-full bg-white px-4 py-3 rounded-xl font-bold outline-none border-none shadow-sm">
                                                <option>Tişört</option><option>Sweatshirt</option><option>İç Çamaşırı / Pijama</option><option>Ayakkabı / Sneaker</option><option>Triko</option><option>Pantolon / Jean</option><option>Mont / Kaban</option><option>Elbise / Etek</option><option>Aksesuar</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="p-8 bg-emerald-500/5 rounded-[3rem] border-2 border-emerald-500/10">
                                        <div className="flex justify-between items-center mb-6">
                                            <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Asorti & Stok Planı (Beden Bazlı)</label>
                                            <button type="button" onClick={() => setStockEntries([...stockEntries, { size: '', quantity: 0 }])} className="px-3 py-1 bg-emerald-500 text-white text-[9px] font-black rounded-lg uppercase tracking-widest shadow-lg">+ EKLE</button>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                            {stockEntries.map((entry, idx) => (
                                                <div key={idx} className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm relative group text-center">
                                                    <input placeholder="Beden" value={entry.size} onChange={e=> {let n=[...stockEntries]; n[idx].size=e.target.value.toUpperCase(); setStockEntries(n);}} className="w-full text-center font-black text-lg outline-none mb-1 uppercase" />
                                                    <input type="number" value={entry.quantity} onChange={e=> {let n=[...stockEntries]; n[idx].quantity=Number(e.target.value); setStockEntries(n);}} className="w-full text-center text-[10px] font-bold text-emerald-600 bg-emerald-50 rounded py-1 outline-none" />
                                                    <button type="button" onClick={()=>setStockEntries(stockEntries.filter((_,i)=>i!==idx))} className="absolute -top-2 -right-2 p-1.5 bg-red-100 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-3 h-3"/></button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-blue-50 p-8 rounded-[3rem] border-2 border-blue-100">
                                        <div>
                                            <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-2">Net Hakediş Fiyatı (₺)</label>
                                            <input required type="number" value={wholesalePrice} onChange={e=>setWholesalePrice(e.target.value)} className="w-full px-6 py-4 bg-white rounded-2xl font-black text-xl shadow-inner outline-none border-none text-blue-900" placeholder="250" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-2">Min. Paket Miktarı (MOQ)</label>
                                            <input required type="number" value={minOrder} onChange={e=>setMinOrder(e.target.value)} className="w-full px-6 py-4 bg-white rounded-2xl font-black text-xl shadow-inner outline-none border-none text-blue-900" placeholder="5" />
                                        </div>
                                    </div>

                                    <div className="relative border-2 border-dashed border-anthracite-200 rounded-[3rem] p-12 text-center group hover:bg-emerald-50 hover:border-emerald-300 transition-all cursor-pointer">
                                        <input required type="file" multiple accept="image/*" onChange={(e)=> {let fs=Array.from(e.target.files||[]); setSelectedFiles(fs); setPreviewUrls(fs.map(f=>URL.createObjectURL(f)));}} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="p-6 bg-white shadow-xl rounded-2xl group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                                <ImageIcon className="w-10 h-10" />
                                            </div>
                                            <h4 className="font-black text-xl">Model Fotoğraflarını Bırakın</h4>
                                            <p className="text-xs font-medium text-anthracite-400">Ürünü her açıdan gösteren en az 1 görsel gereklidir.</p>
                                        </div>
                                        {previewUrls.length > 0 && (
                                            <div className="mt-8 flex flex-wrap gap-2 justify-center">
                                                {previewUrls.map((u, i) => (
                                                    <div key={i} className="w-20 h-28 relative rounded-xl overflow-hidden border-2 border-emerald-200 shadow-md transform rotate-2"><Image src={u} alt="p" fill className="object-cover" /></div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button disabled={isAddingProduct} className="w-full py-6 bg-anthracite-900 text-white font-black text-xl rounded-[2rem] shadow-2xl hover:scale-[1.01] transition-all disabled:opacity-50">
                                    {isAddingProduct ? "MODERN FABRİKA SİSTEMLERİNE AKTARILIYOR..." : "MODELİ VİTRİNE GÖNDER"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* ORDERS TAB (GELEN SİPARİŞLER) */}
            {activeTab === 'orders' && (
                <div className="bg-white border border-anthracite-100 rounded-[3rem] p-8 sm:p-12 shadow-xl text-left">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 pb-6 border-b border-anthracite-100">
                        <div>
                            <h2 className="text-2xl font-black text-anthracite-900 mb-1">Gelen İşlem Talepleri ({orders.length})</h2>
                            <p className="text-sm font-medium text-anthracite-500">Bu sayfadaki siparişlerin ödemesi Admin tarafından teyit edilmiştir.</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {orders.length === 0 ? (
                            <p className="text-center py-20 font-black text-anthracite-300 italic">Sipariş havuzunuz şu an boş.</p>
                        ) : orders.map(ord => (
                            <div key={ord.id} className="group p-6 sm:p-8 bg-anthracite-50/50 hover:bg-white rounded-[2.5rem] border border-anthracite-100 hover:shadow-2xl transition-all flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                                <div className="absolute top-8 right-10 flex gap-2">
                                     <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${ord.status === 'shipped' ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-sm' : 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm'}`}>
                                         {ord.status === 'shipped' ? 'KARGOLANDI' : 'HAZIRLANIYOR'}
                                     </span>
                                </div>
                                <div className="text-left flex-1 w-full flex flex-col sm:flex-row items-center gap-8">
                                    <div className="w-24 h-32 bg-white rounded-2xl overflow-hidden shadow-md shrink-0 border border-anthracite-100">
                                        <Image src={products.find(p=>p.id===ord.product_id)?.images?.[0] || ''} alt="p" width={100} height={130} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 w-full sm:w-auto">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-anthracite-400">Butik Müşteri</span>
                                            <MoveRight className="w-3 h-3 text-anthracite-300" />
                                        </div>
                                        <h3 className="text-2xl font-black text-anthracite-900 mb-2">{ord.buyer_name}</h3>
                                        <div className="flex flex-wrap gap-4 pt-4 border-t border-anthracite-100/50">
                                            <div className="bg-white px-4 py-2 rounded-xl border border-anthracite-100 shadow-sm">
                                                <p className="text-[9px] font-black text-anthracite-400 uppercase leading-none mb-1">Model</p>
                                                <p className="text-xs font-black">{ord.product_name}</p>
                                            </div>
                                            <div className="bg-white px-4 py-2 rounded-xl border border-anthracite-100 shadow-sm">
                                                <p className="text-[9px] font-black text-anthracite-400 uppercase leading-none mb-1">Detay</p>
                                                <p className="text-xs font-black">{ord.selected_size} • {ord.quantity} Adet</p>
                                            </div>
                                            <div className="bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 shadow-sm">
                                                <p className="text-[9px] font-black text-emerald-600 uppercase leading-none mb-1">Hesabınıza Geçecek</p>
                                                <p className="text-xs font-black text-emerald-700">{ord.wholesaler_earning.toLocaleString('tr-TR')} ₺</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="shrink-0 flex flex-col gap-2 w-full sm:w-auto">
                                    <Link href="/toptanci/siparisler" className="flex items-center justify-center gap-3 px-8 py-5 bg-anthracite-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all">
                                        <Truck className="w-4 h-4" /> KARGOYA GÖNDER
                                    </Link>
                                    <button onClick={()=>exportInvoicePDF(ord)} className="px-8 py-3 bg-white border border-anthracite-200 text-anthracite-900 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-anthracite-50 transition-all"><FileText className="w-4 h-4" /> İRSALİYE</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* FINANCE TAB */}
            {activeTab === 'finance' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
                    <div className="lg:col-span-4 bg-emerald-500 p-10 rounded-[3rem] text-white shadow-2xl shadow-emerald-500/20 group relative overflow-hidden h-max">
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
                        <div className="bg-white border border-anthracite-100 rounded-[3rem] p-10 shadow-xl">
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
    </div>
  );
}
