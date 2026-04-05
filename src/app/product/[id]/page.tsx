"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MessageCircle, Package, Search, Lock } from "lucide-react";
import { createClient } from '@/utils/supabase/client';
import NotificationBell from '@/components/NotificationBell';
import { ORDER_STATUS } from '@/utils/orderStatus';
import { notify } from '@/utils/notifications';
import { getOrderableStocks, usesFallbackStocks } from '@/utils/productStocks';
import { getWhatsAppOrderDigits } from '@/utils/whatsapp';

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

  const orderableStocks = useMemo(() => (product ? getOrderableStocks(product) : {}), [product]);
  const stockIsFallback = useMemo(() => (product ? usesFallbackStocks(product) : false), [product]);

  useEffect(() => {
    setSelectedSize('');
  }, [params.id]);

  useEffect(() => {
    const keys = Object.keys(orderableStocks);
    if (keys.length === 1) setSelectedSize(keys[0]);
  }, [orderableStocks]);

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

  if (loading) return <div className="py-24 text-center text-sm font-medium text-anthracite-400">Yükleniyor…</div>;
  if (!product) return <div className="py-24 text-center text-sm font-medium text-red-600">Ürün bulunamadı.</div>;

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
              "Yeni sipariş",
              `${currentUserProfile.business_name || currentUserProfile.full_name}: «${product.name}» · ${totalItems} adet · ${totalPrice.toLocaleString("tr-TR")} ₺. Ödeme teyidi bekleniyor.`,
              "info"
            )
          )
        );
      }

      // 2. WhatsApp Profesyonel Şablonu Oluştur ve Bota Yönlendir
      const message = `💎 YENİ SİPARİŞ - DEMİR DEV STUDIO 💎\n👤 Müşteri: ${currentUserProfile.business_name || "İsimsiz Butik"}\n📦 Ürün: ${product.name} (Beden: ${selectedSize})\n🔢 Miktar: ${totalItems} Adet (MOQ Şartı Sağlandı)\n💰 Toplam Tutar: ${totalPrice.toLocaleString("tr-TR")} TL\n📍 Teslimat: ${fullAddress}\n\n⚠️ Yönetim Notu: Sipariş sisteme kaydoldu, ödeme teyidi sonrası hazırlık sürecine alınabilir.\n\nLütfen ödeme dekontunu bu mesajın altına ekleyiniz. Onay sonrası sevkiyat başlayacaktır.`;
      
      // Demir Dev Studio (Merkez) Resmi WhatsApp Numarası
      const whatsappNumber = getWhatsAppOrderDigits();
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href="/katalog" className="inline-flex items-center gap-2 text-sm font-medium text-anthracite-600 transition hover:text-anthracite-900">
          <ArrowLeft className="h-4 w-4" strokeWidth={2} /> Katalog
        </Link>
        {currentUserProfile && <NotificationBell userId={currentUserProfile.id} />}
      </div>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Sol: ÇOKLU FOTOĞRAF GALERİSİ & TEXTURE ZOOM */}
        <div className="flex flex-col gap-4">
          
          <div 
            className="group relative aspect-[3/4] w-full cursor-zoom-in overflow-hidden rounded-2xl border border-anthracite-200/70 bg-anthracite-50 dark:bg-anthracite-900"
            onClick={() => setIsZoomed(!isZoomed)}
          >
            <Image 
              src={product.images && product.images.length > 0 ? product.images[activeImageIndex] : 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&q=90'}
              alt={product.name}
              fill
              priority
              className={`object-cover transition-transform duration-700 ${isZoomed ? "scale-150 origin-center" : "scale-100 group-hover:scale-105"}`}
            />
            <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-medium text-anthracite-700 shadow-sm backdrop-blur-sm dark:bg-black/80 dark:text-white">
              <Search className="h-3 w-3" strokeWidth={2} /> Yakınlaştır
            </div>
            {product.images?.length > 1 && (
              <div className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
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
                  className={`relative h-32 w-24 shrink-0 snap-start overflow-hidden rounded-lg border-2 transition-all ${activeImageIndex === idx ? 'border-anthracite-800 shadow-sm dark:border-white' : 'border-transparent opacity-55 hover:opacity-100'}`}
                >
                  <Image src={img} alt={`Küçük Ölçek ${idx}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}

        </div>

        {/* Sağ: Bilgiler ve Sipariş İşlemleri */}
        <div className="flex flex-col">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-emerald-100/80 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800">{product.gender || "Unisex"}</span>
            <span className="rounded-full bg-anthracite-100/60 px-2.5 py-0.5 text-xs font-medium text-anthracite-700">{product.category}</span>
            <span className="rounded-full border border-sky-100/80 bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-800">{product.sizes || "Standart"}</span>
          </div>
          <h1 className="mb-4 text-2xl font-semibold tracking-tight text-anthracite-900 md:text-3xl lg:text-4xl">{product.name}</h1>

          {/* SADECE ONAYLI BUTİKLER GÖREBİLİR (GATEKEEPING) */}
          {isApproved ? (
            <>
              <div className="mb-6 rounded-2xl border border-sky-100/90 bg-sky-50/50 p-5 dark:bg-blue-950/20">
                <div className="mb-2 flex items-end gap-3">
                  <span className="text-3xl font-semibold tabular-nums tracking-tight text-anthracite-900 dark:text-white">{unitPrice.toLocaleString("tr-TR")} ₺</span>
                  <span className="mb-0.5 text-sm text-anthracite-500">/ adet</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-sky-900/80 dark:text-blue-300">
                  <Package className="h-4 w-4 shrink-0" strokeWidth={2} />
                  <span className="font-medium">MOQ: {product.min_order_quantity} adet</span>
                </div>
              </div>

              <div className="space-y-6 mb-10">
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-anthracite-900 border-b border-anthracite-100 pb-2"><Package className="w-5 h-5 text-emerald-500"/> Ürün ve Stok Durumu</h3>
                  
                  {/* BEDEN SEÇİMİ VE STOK GÖRÜNÜMÜ */}
                  {stockIsFallback && (
                    <p className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-3">
                      Bu üründe ayrı stok satırı yok; tek seçenek gösteriliyor (eski kayıt veya standart seri). Yeni ürünlerde toptancı panelinden en az bir bedende stok girin.
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3 mt-4">
                    {Object.entries(orderableStocks).map(([size, qty]) => (
                      <button
                        key={size}
                        type="button"
                        disabled={Number(qty) <= 0}
                        onClick={() => setSelectedSize(size)}
                        className={`flex min-w-[68px] flex-col items-center gap-0.5 rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-all ${
                          Number(qty) <= 0
                            ? 'bg-anthracite-50 border-anthracite-200 text-anthracite-300 cursor-not-allowed grayscale'
                            : selectedSize === size
                              ? 'bg-anthracite-900 border-anthracite-900 text-white shadow-lg scale-105'
                              : 'bg-white border-anthracite-200 text-anthracite-600 hover:border-anthracite-900'
                        }`}
                      >
                        <span className="text-center break-words max-w-[100px]">{size}</span>
                        <span
                          className={`text-[9px] uppercase ${Number(qty) <= 0 ? 'text-red-400' : selectedSize === size ? 'text-white/60' : 'text-anthracite-400'}`}
                        >
                          {Number(qty) <= 0 ? 'Tükendi' : stockIsFallback ? 'Seri' : `${qty} Stok`}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="text-anthracite-600 dark:text-anthracite-300 text-sm leading-relaxed bg-white border border-anthracite-200 p-5 rounded-2xl shadow-sm mt-6 overflow-hidden">
                    <p className="mb-4">{product.description}</p>
                    <ul className="space-y-2 mt-4">
                       <li className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-anthracite-50/80 px-4 py-2">
                          <span className="text-xs font-medium text-anthracite-500">Kumaş</span>
                          <span className="text-sm font-medium text-anthracite-900">{product.fabric_type}</span>
                       </li>
                       <li className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-anthracite-50/80 px-4 py-2">
                          <span className="text-xs font-medium text-anthracite-500">Gramaj</span>
                          <span className="text-sm font-medium text-anthracite-900">{product.gsm || "—"}</span>
                       </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-auto flex flex-col gap-6 border-t border-anthracite-100 pt-8 dark:border-anthracite-800">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-col">
                    <span className="font-bold text-anthracite-900 dark:text-white">Sipariş miktarı</span>
                    <span className="text-[10px] font-medium text-anthracite-500 dark:text-anthracite-400">
                      Paket sayısı (her paket {product.min_order_quantity} adet)
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5 rounded-xl border border-anthracite-200 bg-white p-1 shadow-sm ring-1 ring-anthracite-100/80">
                    <button
                      type="button"
                      aria-label="Paket azalt"
                      onClick={() => setSeriCount(Math.max(1, seriCount - 1))}
                      className="flex h-10 w-10 items-center justify-center rounded-lg bg-anthracite-100 text-xl font-semibold leading-none text-anthracite-900 transition hover:bg-anthracite-200"
                    >
                      −
                    </button>
                    <div className="min-w-[3rem] px-1 text-center">
                      <span className="block text-xl font-bold tabular-nums text-anthracite-900">{seriCount}</span>
                      <span className="block text-[10px] font-semibold uppercase tracking-wide text-anthracite-500">paket</span>
                    </div>
                    <button
                      type="button"
                      aria-label="Paket artır"
                      onClick={() => setSeriCount(seriCount + 1)}
                      className="flex h-10 w-10 items-center justify-center rounded-lg bg-anthracite-100 text-xl font-semibold leading-none text-anthracite-900 transition hover:bg-anthracite-200"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-100/90 bg-emerald-50/60 p-4 text-emerald-950 dark:border-emerald-800/50 dark:bg-emerald-950/30 dark:text-emerald-100">
                  <span className="text-sm font-medium">Toplam ({totalItems} adet)</span>
                  <span className="text-lg font-semibold tabular-nums">{totalPrice.toLocaleString("tr-TR")} ₺</span>
                </div>

                <button 
                  type="button"
                  disabled={!selectedSize}
                  onClick={() => setShowAddressModal(true)}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-medium transition ${
                    !selectedSize 
                      ? 'cursor-not-allowed border border-anthracite-200 bg-anthracite-100 text-anthracite-400' 
                      : 'bg-[#25D366] text-white shadow-sm hover:bg-[#20BE5C]'
                  }`}
                >
                  {selectedSize ? (
                    <><MessageCircle className="h-5 w-5" strokeWidth={2} /> Sipariş — adres gir</>
                  ) : (
                    "Beden seçin"
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="mt-6 rounded-2xl border border-red-100/90 bg-red-50/60 p-6 text-center dark:bg-red-900/20">
              <Lock className="mx-auto mb-3 h-10 w-10 text-red-500" strokeWidth={1.5} />
              <h2 className="mb-2 text-lg font-semibold text-red-900 dark:text-red-300">Fiyatlar onaylı üyelere açık</h2>
              <p className="mb-5 text-sm text-red-800/90 text-balance dark:text-red-200/90">Giriş yapın veya onay bekleyin.</p>
              <Link href="/login" className="inline-block rounded-xl bg-red-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-red-700">Giriş / kayıt</Link>
            </div>
          )}

        </div>
      </div>
      
      {/* BAŞARIYLA YAZILAN TESLİMAT POP-UP MODÜLÜ */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl border border-anthracite-200/80 bg-white p-6 shadow-xl sm:p-8">
            <h3 className="mb-1 text-lg font-semibold text-anthracite-900">Teslimat adresi</h3>
            <p className="mb-6 text-sm text-anthracite-600">İrsaliye için kullanılacak adresi girin.</p>
            
            <form onSubmit={handleCreateOrder} className="flex flex-col gap-4">
               <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                 <div>
                   <label className="mb-1.5 block text-xs font-medium text-anthracite-600">İl</label>
                   <input required value={il} onChange={e=>setIl(e.target.value)} type="text" className="w-full rounded-xl border border-anthracite-200/90 bg-anthracite-50/50 px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-emerald-500/15" placeholder="İstanbul" />
                 </div>
                 <div>
                   <label className="mb-1.5 block text-xs font-medium text-anthracite-600">İlçe</label>
                   <input required value={ilce} onChange={e=>setIlce(e.target.value)} type="text" className="w-full rounded-xl border border-anthracite-200/90 bg-anthracite-50/50 px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-emerald-500/15" placeholder="Kadıköy" />
                 </div>
               </div>
               <div>
                  <label className="mb-1.5 block text-xs font-medium text-anthracite-600">Açık adres</label>
                  <textarea required value={adres} onChange={e=>setAdres(e.target.value)} rows={3} className="w-full resize-none rounded-xl border border-anthracite-200/90 bg-anthracite-50/50 px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-emerald-500/15" placeholder="Mahalle, sokak, no…"></textarea>
               </div>
               <div className="mt-2 flex gap-3">
                 <button type="button" onClick={()=>setShowAddressModal(false)} className="flex-1 rounded-xl border border-anthracite-200 py-2.5 text-sm font-medium text-anthracite-700 transition hover:bg-anthracite-50">Vazgeç</button>
                 <button disabled={isOrdering} type="submit" className="flex-[2] flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-2.5 text-sm font-medium text-white transition hover:bg-[#20BE5C] disabled:opacity-50">
                   {isOrdering ? 'Gönderiliyor…' : <><MessageCircle className="h-4 w-4" strokeWidth={2}/> Onayla</>}
                 </button>
               </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
