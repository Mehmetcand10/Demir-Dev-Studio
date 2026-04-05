"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MessageCircle, Package, Search, Lock } from "lucide-react";
import { createClient } from '@/utils/supabase/client';
import NotificationBell from '@/components/NotificationBell';
import { ORDER_STATUS } from '@/utils/orderStatus';
import { notify } from '@/utils/notifications';

export default function ProductDetail({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<any>(null);
  const [isApproved, setIsApproved] = useState(false);
  const [loading, setLoading] = useState(true);

  const [isZoomed, setIsZoomed] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0); 
  const [seriCount, setSeriCount] = useState(1);
  const supabase = createClient();

  // FAZ 4: Sipariş Pop-up Stateleri
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [il, setIl] = useState('');
  const [ilce, setIlce] = useState('');
  const [adres, setAdres] = useState('');
  const [isOrdering, setIsOrdering] = useState(false);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');

  const fetchData = useCallback(async () => {
    // 1. Ürünü çek
    const { data: p } = await supabase.from('products').select('*').eq('id', params.id).single();
    if (p) setProduct(p);

    // 2. O anki kullacıyı oturumdan çek
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (profile) {
         setIsApproved(profile.is_approved || false);
         setCurrentUserProfile(profile);
      }
    }
    setLoading(false);
  }, [params.id, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <div className="p-24 text-center font-bold">Vitrin Hazırlanıyor...</div>;
  if (!product) return <div className="p-24 text-center text-red-500">Böyle bir ürün veritabanında bulunamadı.</div>;

  const totalItems = seriCount * product.min_order_quantity;
  const unitPrice = Number(product.base_wholesale_price) + Number(product.margin_price || 0);
  const totalPrice = totalItems * unitPrice;

  // FAZ 4: DROP-SHIPPING SİPARİŞ OLUŞTURMA İŞLEMİ (Veritabanı + WhatsApp)
  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!currentUserProfile) return alert("Kullanıcı profiliniz okunamadı, lütfen tekrar giriş yapın.");
    setIsOrdering(true);

    try {
      const fullAddress = `${il} / ${ilce} - ${adres}`;
      const comm = totalItems * Number(product.margin_price || 0);
      const wholeEarn = totalPrice - comm; // Toptancının Parası (Müşteri Toplam Fiyatı - Demir Dev Komisyonu)

      // 1. Sisteme Finansal İşlemi Kaydet (orders tablosu)
      const { error } = await supabase.from('orders').insert({
           product_id: product.id,
           buyer_id: currentUserProfile.id,
           wholesaler_id: product.wholesaler_id,
           quantity: totalItems,
           total_price: totalPrice,
           commission_earned: comm,
           wholesaler_earning: wholeEarn,
           shipping_address: fullAddress,
           buyer_phone: currentUserProfile.phone_number,
           buyer_name: currentUserProfile.business_name || currentUserProfile.full_name,
           product_name: product.name,
           selected_size: selectedSize,
           status: ORDER_STATUS.WAITING_PAYMENT
      });

      if(error) throw error;

      // 1.5 Admin (Yönetim) tarafına sistem bildirimi düş
      const { data: adminRows } = await supabase.rpc('get_admin_profile_ids');
      if (adminRows && adminRows.length > 0) {
        await Promise.all(
          adminRows.map((row: { id: string }) =>
            notify(
              row.id,
              "🆕 Yeni Sipariş Bildirimi",
              `${currentUserProfile.business_name || currentUserProfile.full_name} tarafından '${product.name}' için ${totalItems} adet sipariş oluşturuldu.`,
              "info"
            )
          )
        );
      }

      // 2. WhatsApp Profesyonel Şablonu Oluştur ve Bota Yönlendir
      const message = `💎 YENİ SİPARİŞ - DEMİR DEV STUDIO 💎\n👤 Müşteri: ${currentUserProfile.business_name || "İsimsiz Butik"}\n📦 Ürün: ${product.name} (Beden: ${selectedSize})\n🔢 Miktar: ${totalItems} Adet (MOQ Şartı Sağlandı)\n💰 Toplam Tutar: ${totalPrice.toLocaleString("tr-TR")} TL\n📍 Teslimat: ${fullAddress}\n\n⚠️ Yönetim Notu: Sipariş sisteme kaydoldu, ödeme teyidi sonrası hazırlık sürecine alınabilir.\n\nLütfen ödeme dekontunu bu mesajın altına ekleyiniz. Onay sonrası sevkiyat başlayacaktır.`;
      
      // Demir Dev Studio (Merkez) Resmi WhatsApp Numarası
      const whatsappNumber = "905528323906"; 
      window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');

      setShowAddressModal(false);
      
      // Müşteriyi Müşteri Paneline (Kargom Nerede) yönlendir (Birazdan yapacağız)
      alert("Sipariş Kaydı Oluşturuldu! WhatsApp üzerinden dekont atmayı unutmayın.");
      // window.location.href = '/siparislerim';

    } catch(err:any) {
       alert("Sipariş verilirken sistem hatası oluştu: " + err.message);
    } finally {
       setIsOrdering(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-wrap justify-between items-center mb-8 gap-3">
        <Link href="/katalog" className="inline-flex items-center gap-2 text-sm font-medium text-anthracite-500 hover:text-anthracite-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Kataloğa Dön
        </Link>
        {currentUserProfile && <NotificationBell userId={currentUserProfile.id} />}
      </div>

      <div className="grid lg:grid-cols-2 gap-12 lg:gap-24">
        {/* Sol: ÇOKLU FOTOĞRAF GALERİSİ & TEXTURE ZOOM */}
        <div className="flex flex-col gap-4">
          
          <div 
            className="relative w-full aspect-[3/4] bg-anthracite-50 dark:bg-anthracite-900 rounded-2xl overflow-hidden cursor-zoom-in group border border-anthracite-100"
            onClick={() => setIsZoomed(!isZoomed)}
          >
            <Image 
              src={product.images && product.images.length > 0 ? product.images[activeImageIndex] : 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&q=90'}
              alt={product.name}
              fill
              priority
              className={`object-cover transition-transform duration-700 ${isZoomed ? "scale-150 origin-center" : "scale-100 group-hover:scale-105"}`}
            />
            <div className="absolute bottom-4 right-4 bg-white/80 dark:bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-medium shadow-sm pointer-events-none">
              <Search className="w-3 h-3" /> Dokuyu Yakından İncele
            </div>
            {product.images?.length > 1 && (
              <div className="absolute top-4 left-4 bg-black/60 text-white text-[10px] font-bold tracking-wider px-3 py-1.5 rounded-full backdrop-blur-sm shadow-xl">
                 {activeImageIndex + 1} / {product.images.length}
              </div>
            )}
          </div>

          {/* DİNAMİK VİTRİN SLIDER'I (THUMBNAILS) */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 snap-x hide-scrollbar mt-2">
              {product.images.map((img: string, idx: number) => (
                <button 
                  key={idx} 
                  onClick={() => { setActiveImageIndex(idx); setIsZoomed(false); }}
                  className={`relative w-24 h-32 rounded-xl overflow-hidden shrink-0 snap-start border-2 transition-all ${activeImageIndex === idx ? 'border-anthracite-900 dark:border-white shadow-lg scale-100' : 'border-transparent opacity-60 hover:opacity-100 scale-95 hover:scale-100'}`}
                >
                  <Image src={img} alt={`Küçük Ölçek ${idx}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}

        </div>

        {/* Sağ: Bilgiler ve Sipariş İşlemleri */}
        <div className="flex flex-col">
          <div className="mb-2 flex flex-wrap gap-2 items-center">
            <span className="text-xs font-black tracking-widest text-emerald-600 uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">{product.gender || "Unisex"}</span>
            <span className="text-xs font-black tracking-widest text-anthracite-500 uppercase bg-anthracite-50 px-3 py-1 rounded-full">{product.category}</span>
            <span className="text-xs font-black tracking-widest text-blue-600 uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-100">{product.sizes || "Standart Paket"}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">{product.name}</h1>

          {/* SADECE ONAYLI BUTİKLER GÖREBİLİR (GATEKEEPING) */}
          {isApproved ? (
            <>
              <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                <div className="flex items-end gap-4 mb-3">
                  <span className="text-4xl font-bold tracking-tight text-anthracite-900 dark:text-white">{unitPrice.toLocaleString("tr-TR")} ₺</span>
                  <span className="text-sm text-anthracite-500 mb-1">/ adet</span>
                </div>
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <Package className="w-4 h-4" />
                  <span className="text-xs font-black uppercase tracking-widest">
                    M.O.Q (Minimum Sipariş): {product.min_order_quantity} Adet 
                  </span>
                </div>
              </div>

              <div className="space-y-6 mb-10">
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-anthracite-900 border-b border-anthracite-100 pb-2"><Package className="w-5 h-5 text-emerald-500"/> Ürün ve Stok Durumu</h3>
                  
                  {/* BEDEN SEÇİMİ VE STOK GÖRÜNÜMÜ */}
                  <div className="flex flex-wrap gap-3 mt-4">
                    {product.stocks && Object.entries(product.stocks).length > 0 ? (
                      Object.entries(product.stocks).map(([size, qty]: [string, any]) => (
                        <button
                          key={size}
                          disabled={Number(qty) <= 0}
                          onClick={() => setSelectedSize(size)}
                          className={`px-5 py-3 rounded-xl font-black text-sm transition-all border-2 flex flex-col items-center gap-1 min-w-[70px] ${
                            Number(qty) <= 0 
                              ? 'bg-anthracite-50 border-anthracite-200 text-anthracite-300 cursor-not-allowed grayscale' 
                              : selectedSize === size 
                                ? 'bg-anthracite-900 border-anthracite-900 text-white shadow-lg scale-105' 
                                : 'bg-white border-anthracite-200 text-anthracite-600 hover:border-anthracite-900'
                          }`}
                        >
                          <span>{size}</span>
                          <span className={`text-[9px] uppercase ${Number(qty) <= 0 ? 'text-red-400' : selectedSize === size ? 'text-white/60' : 'text-anthracite-400'}`}>
                            {Number(qty) <= 0 ? 'Tükendi' : `${qty} Stok`}
                          </span>
                        </button>
                      ))
                    ) : (
                      <span className="text-sm font-bold text-anthracite-400 italic">Bu üründe beden seçeneği yüklü değil.</span>
                    )}
                  </div>

                  <div className="text-anthracite-600 dark:text-anthracite-300 text-sm leading-relaxed bg-white border border-anthracite-200 p-5 rounded-2xl shadow-sm mt-6 overflow-hidden">
                    <p className="mb-4">{product.description}</p>
                    <ul className="space-y-2 mt-4">
                       <li className="flex flex-wrap justify-between items-center gap-2 bg-anthracite-50 px-4 py-2 rounded-xl">
                          <span className="font-bold text-anthracite-500 text-xs uppercase tracking-widest">Kumaş / Materyal</span>
                          <span className="font-black text-anthracite-900">{product.fabric_type}</span>
                       </li>
                       <li className="flex flex-wrap justify-between items-center gap-2 bg-anthracite-50 px-4 py-2 rounded-xl">
                          <span className="font-bold text-anthracite-500 text-xs uppercase tracking-widest">Ağırlık / Gramaj</span>
                          <span className="font-black text-anthracite-900">{product.gsm || "Belirtilmemiş"}</span>
                       </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-auto border-t border-anthracite-100 dark:border-anthracite-800 pt-8 flex flex-col gap-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-col">
                    <span className="font-bold text-anthracite-900 dark:text-white">Sipariş Miktarı</span>
                    <span className="text-[10px] text-anthracite-400 font-medium">Minimum {product.min_order_quantity} adet ve katları</span>
                  </div>
                  <div className="flex items-center gap-4 border-2 border-anthracite-200 dark:border-anthracite-700 rounded-2xl p-1 bg-white dark:bg-anthracite-900">
                    <button onClick={() => setSeriCount(Math.max(1, seriCount - 1))} className="w-10 h-10 rounded-xl bg-anthracite-50 dark:bg-anthracite-800 flex items-center justify-center font-black hover:bg-anthracite-200 transition-colors">-</button>
                    <span className="w-12 text-center font-black text-xl">{seriCount} <span className="text-[10px] block text-anthracite-400">Paket</span></span>
                    <button onClick={() => setSeriCount(seriCount + 1)} className="w-10 h-10 rounded-xl bg-anthracite-50 dark:bg-anthracite-800 flex items-center justify-center font-black hover:bg-anthracite-200 transition-colors">+</button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-xl text-emerald-900 dark:text-emerald-100 mb-2 border border-emerald-100 dark:border-emerald-800/50">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Toplam Tutar ({totalItems} Adet)</span>
                  </div>
                  <span className="text-xl font-bold">{totalPrice.toLocaleString("tr-TR")} ₺</span>
                </div>

                <button 
                  disabled={!selectedSize}
                  onClick={() => setShowAddressModal(true)}
                  className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-lg hover:scale-[1.02] transition-all shadow-xl ${
                    !selectedSize 
                      ? 'bg-anthracite-100 text-anthracite-400 cursor-not-allowed border border-anthracite-200 shadow-none' 
                      : 'bg-[#25D366] text-white hover:bg-[#20BE5C] shadow-emerald-500/20'
                  }`}
                >
                  {selectedSize ? (
                    <><MessageCircle className="w-6 h-6" /> Siparişi Tamamla (Bilgileri Gir)</>
                  ) : (
                    "Lütfen Beden Seçiniz"
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="mt-8 p-8 border border-red-200 bg-red-50 dark:bg-red-900/20 rounded-3xl text-center">
              <Lock className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Bu Ürünün Modeli / Fiyatı Sadece Üyelere Açıktır</h2>
              <p className="text-red-600 dark:text-red-300 mb-6 text-balance">Sistemin toptancı - butik avantajlarından yararlanabilmek, net verileri ve fiyatları görebilmek için giriş yapmalı veya admin ağından onay beklemelisiniz.</p>
              <Link href="/login" className="inline-block bg-red-600 hover:bg-red-700 transition-colors text-white px-8 py-3 rounded-full font-semibold shadow-lg shadow-red-500/30">Hemen Giriş Yap / Kayıt Ol</Link>
            </div>
          )}

        </div>
      </div>
      
      {/* BAŞARIYLA YAZILAN TESLİMAT POP-UP MODÜLÜ */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] p-8 sm:p-10 w-full max-w-lg shadow-2xl relative">
            <h3 className="text-3xl font-black mb-2 text-anthracite-900 tracking-tight">Teslimat Adresi</h3>
            <p className="text-anthracite-500 mb-8 text-sm font-medium">Bu adres toptancıya veya kurye tarafına irsaliye olarak düşecektir. Lütfen eksiksiz giriniz.</p>
            
            <form onSubmit={handleCreateOrder} className="flex flex-col gap-5">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                 <div>
                   <label className="text-[10px] font-black text-anthracite-400 uppercase tracking-widest mb-2 block pl-2">İl</label>
                   <input required value={il} onChange={e=>setIl(e.target.value)} type="text" className="w-full px-5 py-4 border border-anthracite-200 rounded-2xl bg-anthracite-50 focus:bg-white focus:ring-4 focus:ring-anthracite-100 outline-none font-bold text-anthracite-900 transition-all" placeholder="Örn: İstanbul" />
                 </div>
                 <div>
                   <label className="text-[10px] font-black text-anthracite-400 uppercase tracking-widest mb-2 block pl-2">İlçe</label>
                   <input required value={ilce} onChange={e=>setIlce(e.target.value)} type="text" className="w-full px-5 py-4 border border-anthracite-200 rounded-2xl bg-anthracite-50 focus:bg-white focus:ring-4 focus:ring-anthracite-100 outline-none font-bold text-anthracite-900 transition-all" placeholder="Örn: Kadıköy" />
                 </div>
               </div>
               <div>
                  <label className="text-[10px] font-black text-anthracite-400 uppercase tracking-widest mb-2 block pl-2">Açık Adres (Sokak / No)</label>
                  <textarea required value={adres} onChange={e=>setAdres(e.target.value)} rows={3} className="w-full px-5 py-4 border border-anthracite-200 rounded-2xl bg-anthracite-50 focus:bg-white focus:ring-4 focus:ring-anthracite-100 outline-none font-bold text-anthracite-900 resize-none transition-all" placeholder="Caferağa Mah, Moda Cad..."></textarea>
               </div>
               <div className="flex gap-4 mt-6">
                 <button type="button" onClick={()=>setShowAddressModal(false)} className="flex-1 py-4.5 rounded-2xl font-bold text-anthracite-500 hover:bg-anthracite-100 transition-colors">Vazgeç</button>
                 <button disabled={isOrdering} type="submit" className="flex-[2] py-4.5 bg-[#25D366] hover:bg-[#20BE5C] text-white font-black text-lg rounded-2xl shadow-xl shadow-[#25D366]/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                   {isOrdering ? 'Oluşturuluyor...' : <><MessageCircle className="w-5 h-5"/> Siparişi Kapat</>}
                 </button>
               </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
