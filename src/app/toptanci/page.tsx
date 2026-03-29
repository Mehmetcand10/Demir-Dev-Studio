"use client";

import { useEffect, useState } from 'react';
import { Package, PlusCircle, Image as ImageIcon, Trash2, Eye } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import Image from 'next/image';
import Link from 'next/link';

export default function ToptanciDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  
  // Ürün Form State'leri
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Tişört');
  const [fabricType, setFabricType] = useState('');
  const [wholesalePrice, setWholesalePrice] = useState('');
  const [minOrder, setMinOrder] = useState('5');
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [user, setUser] = useState<any>(null);

  const supabase = createClient();

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        fetchMyProducts(user.id);
        fetchMyOrders(user.id);
      }
    }
    init();
  }, []);

  const fetchMyOrders = async (userId: string) => {
    setLoadingOrders(true);
    // Toptancı SQL'den sadece status != 'waiting_payment' olan Siparişlerini çeker (Aksi halde RLS çektirmez zaten)
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
       alert("Mükemmel! Kargo takip numarası sisteme işlendi ve Müşterinin (Butik) sayfasına SMS tadında yansıtıldı.");
       fetchMyOrders(user.id);
    } else {
       alert("Kargo kodu girilirken hata: " + error.message);
    }
  };

  const fetchMyProducts = async (userId: string) => {
    setLoadingProducts(true);
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('wholesaler_id', userId)
      .order('created_at', { ascending: false });
    
    if (data) setProducts(data);
    setLoadingProducts(false);
  };

  const clearForm = () => {
     setName(''); setFabricType(''); setWholesalePrice(''); setSelectedFiles([]); setPreviewUrls([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArr = Array.from(e.target.files);
      setSelectedFiles(filesArr);
      const urls = filesArr.map(file => URL.createObjectURL(file));
      setPreviewUrls(urls);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("Oturum bulunamadı!");
    if (selectedFiles.length === 0) return alert("Lütfen ürün için en az 1 fotoğraf seçin!");
    
    setIsAddingProduct(true);
    
    try {
      const uploadedUrls: string[] = [];
      
      for (const file of selectedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, file);
        if (uploadError) throw new Error("Fotoğraf yükleme hatası: " + uploadError.message);
        
        const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(filePath);
        uploadedUrls.push(publicUrl);
      }

      const { error: dbError } = await supabase.from('products').insert([
        {
          wholesaler_id: user.id,
          name,
          category,
          description: `Toptancı doğrudan satışı: B2B ${category} koleksiyonu.`,
          fabric_type: fabricType,
          gsm: "160gsm", // Otomatik bıraktık form kalabalıgını azaltmak ıcın
          images: uploadedUrls,
          base_wholesale_price: Number(wholesalePrice),
          margin_price: 100, // Demir Dev Payı (Otomatik Eklenir)
          stock_status: 'In Stock',
          min_order_quantity: Number(minOrder)
        }
      ]);

      if (dbError) throw new Error("Veritabanı kayıt hatası: " + dbError.message);

      alert("Mükemmel Tasarım! Ürün başarıyla Demir Dev Vitrinine eklendi!");
      clearForm();
      fetchMyProducts(user.id);

    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsAddingProduct(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Kendi yüklediğiniz ürünü tamamen raftan kaldırmak istediğinize emin misiniz?")) return;
    await supabase.from('products').delete().eq('id', id);
    fetchMyProducts(user?.id);
  };

  if (!user) return <div className="p-20 text-center font-bold">Satıcı Yetkiniz Kontrol Ediliyor...</div>;

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen bg-anthracite-50/50">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-anthracite-200 pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-anthracite-900">Satıcı Üretim Atölyesi</h1>
          <p className="text-anthracite-500 font-medium mt-1">Stüdyonuzdasınız. Aşağıdaki formdan piyasaya anlık mal sürün ve vitrindeki görünümünüzü ayarlayın.</p>
        </div>
      </div>

      <div className="grid xl:grid-cols-12 gap-10">
        
        {/* SOL: Ürün Yükleme Formu ve "Canlı Önizleme" STÜDYOSU (7 Sütun) */}
        <div className="xl:col-span-7 flex flex-col gap-8">
           
           {/* Canlı Önizleme Kartı (Live Preview Studio) */}
           <div className="bg-gradient-to-br from-anthracite-900 to-black rounded-[2.5rem] p-8 sm:p-10 text-white shadow-2xl relative overflow-hidden">
             
             {/* Şık Arkaplan Deseni */}
             <div className="absolute top-0 right-0 -mt-20 -mr-20 opacity-5">
                <Package className="w-96 h-96" />
             </div>
             
             <div className="relative z-10 flex flex-col sm:flex-row gap-8 items-center sm:items-start">
                {/* Fotoğraf Animasyonu */}
                <div className="w-48 h-64 shrink-0 bg-white/5 rounded-3xl border border-white/10 overflow-hidden flex items-center justify-center backdrop-blur-xl shadow-[0_0_40px_rgba(255,255,255,0.05)] transition-all">
                   {previewUrls.length > 0 ? (
                      <Image src={previewUrls[0]} alt="preview" width={200} height={300} className="w-full h-full object-cover rounded-3xl" />
                   ) : (
                      <div className="text-center p-4">
                         <ImageIcon className="w-12 h-12 mx-auto text-white/20 mb-3"/>
                         <p className="text-[10px] font-bold text-emerald-400 tracking-widest uppercase">Görsel Yüklenmedi</p>
                      </div>
                   )}
                </div>

                {/* Stüdyo Yazı Önizlemeleri */}
                <div className="flex-1 space-y-5 w-full">
                   <div className="flex items-center gap-2 text-emerald-400 font-bold text-[10px] tracking-widest uppercase bg-emerald-400/10 px-3 py-1.5 w-max rounded-full border border-emerald-400/20">
                      <Eye className="w-3 h-3" /> Müşteri Ekranı Önizlemesi
                   </div>
                   
                   <h2 className="text-3xl sm:text-4xl font-black leading-tight line-clamp-2 drop-shadow-md">
                     {name || "Yeni Model Tasarımınız"}
                   </h2>
                   
                   <div className="flex flex-wrap items-center gap-2 text-white/80 font-bold text-xs uppercase tracking-wider">
                      <span className="bg-white/10 px-3 py-1.5 rounded-full border border-white/10">{category}</span>
                      {fabricType && <span className="bg-white/10 px-3 py-1.5 rounded-full border border-white/10">{fabricType}</span>}
                   </div>
                   
                   <div className="pt-6 mt-2 border-t border-white/10 flex flex-wrap items-end justify-between gap-4">
                     <div>
                       <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1.5">Müşterinin Göreceği Net Satış (Adet)</p>
                       <p className="text-4xl font-black text-white drop-shadow-md">
                         {wholesalePrice ? (Number(wholesalePrice) + 100).toLocaleString('tr-TR') : "0"} <span className="text-2xl text-emerald-400">₺</span>
                       </p>
                     </div>
                     <div className="text-right bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                       <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Seri İçeriği</p>
                       <p className="font-black text-xl text-white">{minOrder} <span className="text-sm font-medium">Adet</span></p>
                     </div>
                   </div>
                </div>
             </div>
           </div>

           {/* Yükleme Form Masası */}
           <div className="bg-white border border-anthracite-100 rounded-[2.5rem] p-8 sm:p-10 shadow-xl">
             <h2 className="text-xl font-bold flex items-center gap-3 mb-6 text-anthracite-900 border-b border-anthracite-100 pb-5">
               <PlusCircle className="w-6 h-6 text-emerald-600" /> Üretim Verilerini Formüle Et
             </h2>
             
             <form onSubmit={handleAddProduct} className="flex flex-col gap-6">
               <div>
                 <label className="text-xs font-bold text-anthracite-400 uppercase tracking-widest mb-2 block">Dükkan Koleksiyon Başlığı</label>
                 <input required type="text" value={name} onChange={e=>setName(e.target.value)} className="w-full px-5 py-4 rounded-2xl border border-anthracite-200 bg-anthracite-50/50 text-base focus:bg-white focus:border-anthracite-900 focus:ring-4 focus:ring-anthracite-100 outline-none transition-all font-black" placeholder="Örn: Nakış Detaylı Salaş Kazak" />
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div>
                   <label className="text-xs font-bold text-anthracite-400 uppercase tracking-widest mb-2 block">Satış Kategorisi</label>
                   <select value={category} onChange={e=>setCategory(e.target.value)} className="w-full px-5 py-4 rounded-2xl border border-anthracite-200 bg-anthracite-50/50 text-base font-bold text-anthracite-900 focus:bg-white focus:ring-4 focus:ring-anthracite-100 outline-none transition-all cursor-pointer">
                     <option>Tişört</option><option>Sweatshirt</option><option>Triko</option><option>Pantolon</option><option>Mont / Kaban</option>
                   </select>
                 </div>
                 <div>
                   <label className="text-xs font-bold text-anthracite-400 uppercase tracking-widest mb-2 block">Kumaş ve Materyal</label>
                   <input required type="text" value={fabricType} onChange={e=>setFabricType(e.target.value)} className="w-full px-5 py-4 rounded-2xl border border-anthracite-200 bg-anthracite-50/50 text-base focus:bg-white focus:ring-4 focus:ring-anthracite-100 outline-none transition-all font-bold text-anthracite-900" placeholder="%100 İhraç Pamuk" />
                 </div>
               </div>

               {/* Finans Modülü */}
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 sm:p-8 bg-emerald-50 rounded-3xl border border-emerald-100">
                 <div>
                   <label className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2 block">Sizin Hak Edeceğiniz Fiyat (₺)</label>
                   <input required type="number" value={wholesalePrice} onChange={e=>setWholesalePrice(e.target.value)} className="w-full px-5 py-4 rounded-2xl border-2 border-emerald-200 bg-white text-emerald-900 text-2xl font-black focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all shadow-sm" placeholder="250" />
                 </div>
                 <div>
                   <label className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2 block">Bir Seride Kaç Adet Var?</label>
                   <input required type="number" value={minOrder} onChange={e=>setMinOrder(e.target.value)} className="w-full px-5 py-4 rounded-2xl border-2 border-emerald-200 bg-white text-emerald-900 text-2xl font-black focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all shadow-sm" placeholder="5" />
                 </div>
               </div>

               {/* MULTIPLE DOSYA UPLOAD ALANI */}
               <div className="mt-4 text-center group">
                 <div className="relative border-2 border-dashed border-anthracite-300 rounded-[2rem] p-10 hover:bg-emerald-50 hover:border-emerald-400 transition-all cursor-pointer overflow-hidden">
                    <input 
                      required 
                      type="file" 
                      multiple 
                      accept="image/*"
                      onChange={handleFileChange} 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                    />
                    <div className="relative z-0 pointer-events-none flex flex-col items-center">
                      <div className="w-20 h-20 bg-white shadow-sm rounded-full flex flex-col items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white text-anthracite-400 transition-all">
                        <ImageIcon className="w-8 h-8"/>
                      </div>
                      <h3 className="text-xl font-black text-anthracite-900 mb-2">Bilgisayar veya Galeriden Toplu Fotoğraf Seçin</h3>
                      <p className="text-sm text-anthracite-500 font-medium max-w-sm px-4">Tüm açıları ve manken pozlarını ekleyin. Butikler vitrinde sağa kaydırarak resmi incelesinler.</p>
                      
                      {selectedFiles.length > 0 && (
                        <div className="mt-8 flex flex-wrap gap-3 justify-center">
                           {previewUrls.map((url, idx) => (
                             <div key={idx} className="w-16 h-20 relative rounded-xl overflow-hidden border-2 border-emerald-200 shadow-md transform rotate-2 hover:rotate-0 transition-transform">
                               <Image src={url} alt="mini preview" fill className="object-cover" />
                             </div>
                           ))}
                           <div className="px-6 h-20 rounded-xl bg-emerald-100 border-2 border-emerald-300 text-emerald-800 font-black text-sm flex items-center shadow-md justify-center">
                             {selectedFiles.length} DOSYA ALINDI
                           </div>
                        </div>
                      )}
                    </div>
                 </div>
               </div>

               <button disabled={isAddingProduct} className="w-full mt-4 bg-anthracite-900 text-white font-black text-xl py-6 rounded-[2rem] hover:bg-black hover:scale-[1.02] shadow-2xl shadow-anthracite-900/30 transition-all disabled:opacity-50">
                 {isAddingProduct ? "RESİMLER CLOUD SUNUCUSUNA AKTARILIYOR..." : "ÜRETİMİ MÜŞTERİ VİTRİNİNE GÖNDER"}
               </button>
             </form>
           </div>
        </div>

        {/* SAĞ: Toptancının Yüklediği Ürünler (5 Sütun) */}
        <div className="xl:col-span-5 flex flex-col h-full">
           <div className="bg-white border text-center border-anthracite-200 rounded-[2.5rem] p-8 h-full shadow-lg">
             <div className="flex flex-col items-center justify-center mb-8 pb-6 border-b border-anthracite-100">
               <Package className="w-12 h-12 text-anthracite-300 mb-3" />
               <h2 className="text-3xl font-black text-anthracite-900">Satış Raflarınız</h2>
               <p className="text-sm font-medium text-anthracite-500 mt-2">Bu raflardaki ürünler müşterilere kapalı gişe listelenir.</p>
             </div>
            
            <div className="flex flex-col gap-5">
              {loadingProducts ? (
                <p className="p-4 text-sm font-bold text-anthracite-500 animate-pulse">Raflarınızın tozu alınıyor...</p>
              ) : products.length === 0 ? (
                <div className="py-24 px-8 text-center bg-anthracite-50/50 rounded-3xl border border-dashed border-anthracite-200 flex flex-col items-center">
                  <h3 className="text-xl font-black text-anthracite-500 mb-2">Raflarınız Tamamen Boş</h3>
                  <p className="text-sm font-medium text-anthracite-400">İlk ürününüzü yüklediğinizde burada belirecektir.</p>
                </div>
              ) : (
                products.map(product => (
                  <div key={product.id} className="bg-white hover:bg-anthracite-50 rounded-3xl p-4 flex gap-5 items-center border border-anthracite-100 shadow-sm transition-all hover:shadow-lg group text-left">
                    <div className="relative w-28 h-36 shrink-0 bg-anthracite-100 rounded-2xl overflow-hidden border border-anthracite-200">
                      <Image 
                        src={product.images && product.images.length > 0 ? product.images[0] : ''} 
                        alt={product.name} 
                        fill 
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-md backdrop-blur-sm font-black">
                        {product.images?.length || 0}
                      </div>
                    </div>
                    <div className="flex-1 py-1">
                      <h3 className="font-black text-xl line-clamp-2 leading-tight mb-2 text-anthracite-900">{product.name}</h3>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-[10px] uppercase tracking-widest font-black text-anthracite-600 bg-anthracite-100 px-3 py-1 rounded-md">{product.category}</span>
                      </div>
                      <div className="flex justify-between items-end border-t border-anthracite-100 pt-3">
                        <div>
                          <p className="text-[10px] font-black text-emerald-600/70 uppercase tracking-widest">Alacağınız Para (Net)</p>
                          <span className="font-black text-emerald-600 text-2xl">{product.base_wholesale_price.toLocaleString('tr-TR')} ₺</span>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/toptanci/edit/${product.id}`} className="flex items-center justify-center w-10 h-10 text-blue-500 hover:text-white border border-blue-100 rounded-xl bg-blue-50 hover:bg-blue-500 transition-all shadow-sm">
                            <Eye className="w-5 h-5"/>
                          </Link>
                          <button onClick={()=>handleDelete(product.id)} className="flex items-center justify-center w-10 h-10 text-red-500 hover:text-white border border-red-100 rounded-xl bg-red-50 hover:bg-red-500 transition-all shadow-sm">
                            <Trash2 className="w-5 h-5"/>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
           </div>
        </div>
        
      </div>

      {/* SİPARİŞ KARŞILAMA VE LOJİSTİK (Kargo) MASASI (FAZ 4) */}
      <div className="mt-10 bg-white border border-anthracite-200 rounded-[2.5rem] p-8 sm:p-10 shadow-xl">
        <h2 className="text-2xl font-black flex items-center gap-3 mb-6 border-b border-anthracite-100 pb-5 text-anthracite-900">
           <Package className="w-8 h-8 text-emerald-500" /> Kargo Bekleyen Siparişleriniz
        </h2>
        
        {loadingOrders ? (
          <p className="p-4 text-sm font-bold text-anthracite-500 animate-pulse">Merkezdeki siparişleriniz taranıyor...</p>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center bg-anthracite-50/50 rounded-3xl border border-dashed border-anthracite-200">
             <h3 className="text-xl font-black text-anthracite-500 mb-2">Sıfır Sipariş, Temiz İş!</h3>
             <p className="text-sm font-medium text-anthracite-400">Merkez yönetimi (Demir Dev Studio) ürün satıldığında ödemeyi teyit edip siparişi buraya -kargo onayı için- düşürecektir.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map(order => (
               <div key={order.id} className="bg-anthracite-50 border border-anthracite-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between transition-all hover:bg-white hover:shadow-lg">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${order.status === 'shipped' ? 'bg-blue-100 text-blue-600 border border-blue-200' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'}`}>
                        {order.status === 'shipped' ? 'KARGOLANDI GİTTİ' : 'YENİ SİPARİŞ - HAZIRLA'}
                      </span>
                      <span className="font-black text-anthracite-900 border border-anthracite-200 bg-white px-3 py-1.5 rounded-xl shadow-sm">
                        {Number(order.quantity)} Adet
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-anthracite-900 mb-1">{order.product_name || "Silinmiş Ürün"}</h3>
                    <p className="text-xs font-bold text-emerald-600 mb-4 tracking-widest uppercase">Net Cironuz: {Number(order.wholesaler_earning).toLocaleString('tr-TR')} ₺</p>
                    
                    <div className="bg-white p-5 rounded-2xl border border-anthracite-100 mb-6 shadow-sm">
                      <p className="text-[10px] font-black uppercase text-anthracite-400 tracking-widest mb-2 border-b border-anthracite-50 pb-2">Teslimat Adresi (İrsaliye)</p>
                      <p className="font-black text-anthracite-900 text-base">{order.buyer_name}</p>
                      <p className="text-sm font-medium text-anthracite-600 mt-1">{order.shipping_address}</p>
                      <p className="text-xs font-black text-anthracite-500 mt-3 bg-anthracite-50 p-2 rounded-lg">İletişim: {order.buyer_phone}</p>
                    </div>
                  </div>

                  {order.status === 'approved' ? (
                     <button onClick={() => handleShipOrder(order.id)} className="w-full bg-anthracite-900 hover:bg-black text-white font-black text-sm uppercase tracking-widest py-4 rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-95">
                       Kargola ve Takip No Gir
                     </button>
                  ) : (
                     <div className="bg-blue-50 text-blue-800 p-4 rounded-xl border border-blue-100 text-sm font-black text-center tracking-widest">
                        KOD: {order.tracking_number}
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
