"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, MessageCircle, Package, Lock, ShieldAlert, ListOrdered, StickyNote } from "lucide-react";
import { createClient } from '@/utils/supabase/client';
import NotificationBell from '@/components/NotificationBell';
import { ORDER_STATUS } from '@/utils/orderStatus';
import { notify } from '@/utils/notifications';
import { getOrderableStocks, usesFallbackStocks } from '@/utils/productStocks';
import { getWhatsAppOrderDigits } from '@/utils/whatsapp';
import ProductImageGallery from "@/components/product/ProductImageGallery";
import { pushRecentProductId } from "@/utils/recentProducts";
import { Button, Card, CardContent, Badge } from "@/components/design-system";

export default function ProductDetail({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<any>(null);
  const [isApproved, setIsApproved] = useState(false);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  // FAZ 4: Sipariş Pop-up Stateleri
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [il, setIl] = useState('');
  const [ilce, setIlce] = useState('');
  const [adres, setAdres] = useState('');
  const [isOrdering, setIsOrdering] = useState(false);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const [sizeQuantities, setSizeQuantities] = useState<Record<string, number>>({});
  const [wholesalerMinFloor, setWholesalerMinFloor] = useState<number | null>(null);
  const [buyerNote, setBuyerNote] = useState("");
  const [listBusy, setListBusy] = useState(false);

  const orderableStocks = useMemo(() => (product ? getOrderableStocks(product) : {}), [product]);
  const stockIsFallback = useMemo(() => (product ? usesFallbackStocks(product) : false), [product]);

  useEffect(() => {
    const keys = Object.keys(orderableStocks);
    if (keys.length === 0 || !product?.id) return;
    const base: Record<string, number> = {};
    for (const k of keys) base[k] = 0;
    if (typeof window !== "undefined") {
      const raw = new URLSearchParams(window.location.search).get("bedenler");
      if (raw) {
        try {
          const decoded = decodeURIComponent(raw);
          for (const part of decoded.split(",")) {
            const [size, q] = part.split(":").map((x) => x.trim());
            if (size && base[size] !== undefined) {
              const max = Number(orderableStocks[size]) || 0;
              base[size] = Math.min(Math.max(0, parseInt(q, 10) || 0), max);
            }
          }
        } catch {
          /* ignore bad query */
        }
      }
    }
    setSizeQuantities(base);
  }, [product?.id, orderableStocks]);

  const fetchData = useCallback(async () => {
    const { data: p } = await supabase.from('products').select('*').eq('id', params.id).single();
    if (p) {
      setProduct(p);
      setWholesalerMinFloor(null);
      if (p.wholesaler_id) {
        const { data: pubRows, error: rpcErr } = await supabase.rpc(
          'get_wholesaler_public_profile',
          { p_wholesaler_id: p.wholesaler_id }
        );
        if (!rpcErr && Array.isArray(pubRows) && pubRows[0]) {
          const n = pubRows[0].min_order_floor_units;
          if (typeof n === 'number' && n > 0) setWholesalerMinFloor(n);
        }
      }
    } else {
      setWholesalerMinFloor(null);
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (profile) {
         setIsApproved(profile.is_approved || false);
         setCurrentUserProfile(profile);
         if (profile.role === 'butik' && p?.id) pushRecentProductId(p.id);
      }
    }
    setLoading(false);
  }, [params.id, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <div className="bg-white py-24 text-center text-sm font-medium text-slate-400">Yükleniyor…</div>;
  if (!product) return <div className="bg-white py-24 text-center text-sm font-medium text-red-600">Ürün bulunamadı.</div>;

  const totalItems = Object.values(sizeQuantities).reduce((acc, n) => acc + Number(n || 0), 0);
  const unitPrice = Number(product.base_wholesale_price) + Number(product.margin_price || 0);
  const totalPrice = totalItems * unitPrice;
  const moqBlocked = totalItems > 0 && totalItems < Number(product.min_order_quantity || 0);
  const floorBlocked =
    wholesalerMinFloor != null &&
    wholesalerMinFloor > 0 &&
    totalItems > 0 &&
    totalItems < wholesalerMinFloor;
  const selectedLineItems = Object.entries(sizeQuantities)
    .filter(([, qty]) => Number(qty) > 0)
    .map(([size, qty]) => `${size}:${qty}`);
  const selectedSizesSummary = selectedLineItems.join(", ");

  const handleAddToShoppingList = async () => {
    if (!currentUserProfile || currentUserProfile.role !== "butik") {
      alert("Alışveriş listesi yalnızca butik hesapları içindir.");
      return;
    }
    if (selectedLineItems.length === 0) {
      alert("Önce en az bir bedende adet girin.");
      return;
    }
    setListBusy(true);
    try {
      const { error } = await supabase.from("shopping_list_items").upsert(
        {
          user_id: currentUserProfile.id,
          product_id: product.id,
          size_quantities: sizeQuantities,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,product_id" }
      );
      if (error) throw error;
      alert("Sepete eklendi. Üst menüden «Sepet» ile devam edebilirsiniz.");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      alert(
        "Liste kaydı başarısız: " +
          msg +
          "\n\nVeritabanında butik_features.sql (shopping_list_items) uygulandı mı kontrol edin."
      );
    } finally {
      setListBusy(false);
    }
  };

  // FAZ 4: DROP-SHIPPING SİPARİŞ OLUŞTURMA İŞLEMİ (Veritabanı + WhatsApp)
  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!currentUserProfile) return alert("Kullanıcı profiliniz okunamadı, lütfen tekrar giriş yapın.");
    if (totalItems <= 0 || selectedLineItems.length === 0) {
      alert("En az bir bedende adet girin.");
      return;
    }
    if (moqBlocked) {
      alert(`Bu ürün için minimum sipariş ${product.min_order_quantity} adet. Toplamı artırın.`);
      return;
    }
    if (
      wholesalerMinFloor != null &&
      wholesalerMinFloor > 0 &&
      totalItems < wholesalerMinFloor
    ) {
      alert(
        `Bu mağaza tek siparişte en az ${wholesalerMinFloor} adet kabul ediyor. Şu anki sipariş adedi: ${totalItems} adet. Paket sayısını artırın.`
      );
      return;
    }
    setIsOrdering(true);

    try {
      const fullAddress = `${il} / ${ilce} - ${adres}`;
      const comm = totalItems * Number(product.margin_price || 0);
      const wholeEarn = totalPrice - comm; // Toptancının Parası (Müşteri Toplam Fiyatı - Demir Dev Komisyonu)

      // 1. Sisteme Finansal İşlemi Kaydet (orders tablosu)
      const noteTrim = buyerNote.trim();
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
           selected_size: selectedSizesSummary,
           status: ORDER_STATUS.WAITING_PAYMENT,
           buyer_note: noteTrim || null,
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
      const message = `💎 YENİ SİPARİŞ - DEMİR DEV STUDIO 💎\n👤 Müşteri: ${currentUserProfile.business_name || "İsimsiz Butik"}\n📦 Ürün: ${product.name}\n📏 Beden dağılımı: ${selectedSizesSummary}\n🔢 Toplam Miktar: ${totalItems} Adet\n💰 Toplam Tutar: ${totalPrice.toLocaleString("tr-TR")} TL\n📍 Teslimat: ${fullAddress}${noteTrim ? `\n📝 Butik notu: ${noteTrim}` : ""}\n\n⚠️ Yönetim Notu: Sipariş sisteme kaydoldu, ödeme teyidi sonrası hazırlık sürecine alınabilir.\n\nLütfen ödeme dekontunu bu mesajın altına ekleyiniz veya panelden yükleyiniz. Onay sonrası sevkiyat başlayacaktır.`;
      
      // Demir Dev Studio (Merkez) Resmi WhatsApp Numarası
      const whatsappNumber = getWhatsAppOrderDigits();
      window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');

      setShowAddressModal(false);
      setBuyerNote("");
      
      // Müşteriyi Müşteri Paneline (Kargom Nerede) yönlendir (Birazdan yapacağız)
      alert("Sipariş kaydı oluşturuldu. İsterseniz Siparişlerim’den dekont yükleyebilir veya WhatsApp ile iletebilirsiniz.");
      // window.location.href = '/siparislerim';

    } catch(err:any) {
       alert("Sipariş verilirken sistem hatası oluştu: " + err.message);
    } finally {
       setIsOrdering(false);
    }
  };

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-screen-2xl px-3 py-4 sm:px-4 lg:px-6 lg:py-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 sm:mb-6">
        <Link href="/katalog" className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-600">
          <ArrowLeft className="h-4 w-4" strokeWidth={2} /> Kataloga dön
        </Link>
        {currentUserProfile && <NotificationBell userId={currentUserProfile.id} />}
      </div>

      <div className="grid gap-8 lg:grid-cols-12 lg:gap-8 lg:items-start">
        <div className="order-2 lg:order-1 lg:col-span-7">
        <ProductImageGallery
          images={Array.isArray(product.images) ? product.images : []}
          productName={product.name}
        />
        </div>

        <div className="order-1 lg:order-2 lg:col-span-5">
        <Card className="sm:sticky sm:top-24">
        <CardContent className="!p-4 sm:!p-6">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge variant="primary">{product.gender || "Unisex"}</Badge>
            <Badge>{product.category}</Badge>
            <Badge variant="default">{product.sizes || "Standart"}</Badge>
          </div>
          <h1 className="mb-4 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl lg:text-3xl">{product.name}</h1>

          {/* SADECE ONAYLI BUTİKLER GÖREBİLİR (GATEKEEPING) */}
          {isApproved ? (
            <>
              <div className="mb-6 rounded-lg border-2 border-blue-100 bg-gradient-to-b from-white to-slate-50 p-4 sm:p-5">
                <div className="mb-1 flex items-end gap-2">
                  <span className="text-3xl font-black tabular-nums tracking-tight text-slate-900 sm:text-4xl">
                    {unitPrice.toLocaleString("tr-TR")} <span className="text-2xl font-bold">₺</span>
                  </span>
                  <span className="mb-1 text-sm font-semibold text-slate-500">/ adet</span>
                </div>
                <p className="text-xs text-slate-400 line-through">
                  Perakende ref.: {Math.round(unitPrice * 1.22).toLocaleString("tr-TR")} ₺
                </p>
                <div className="mt-3 flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900">
                  <Package className="h-4 w-4 shrink-0 text-blue-600" strokeWidth={2} />
                  <span>MOQ: {product.min_order_quantity} adet (minimum sipariş)</span>
                </div>
              </div>

              {wholesalerMinFloor != null && wholesalerMinFloor > 0 && (
                <div className="mb-6 flex items-start gap-2.5 rounded-2xl border border-amber-200/90 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-100">
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-400" strokeWidth={2} />
                  <span>
                    Bu mağaza{" "}
                    <strong className="font-semibold">tek siparişte en az {wholesalerMinFloor} adet</strong>{" "}
                    kabul ediyor (mağaza politikası). Toplam adet bunun altında olamaz.
                  </span>
                </div>
              )}

              <div className="space-y-6 mb-10">
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-anthracite-900 border-b border-anthracite-100 pb-2"><Package className="w-5 h-5 text-sky-500"/> Ürün ve Stok Durumu</h3>
                  
                  {/* BEDEN SEÇİMİ VE STOK GÖRÜNÜMÜ */}
                  {stockIsFallback && (
                    <p className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-3">
                      Bu üründe ayrı stok satırı yok; tek seçenek gösteriliyor (eski kayıt veya standart seri). Yeni ürünlerde tedarikçi panelinden en az bir bedende stok girin.
                    </p>
                  )}
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {Object.entries(orderableStocks).map(([size, qty]) => {
                      const stock = Number(qty) || 0;
                      const current = Number(sizeQuantities[size] || 0);
                      const soldOut = stock <= 0;
                      return (
                        <div
                          key={size}
                          className={`rounded-xl border p-3 transition ${
                            soldOut
                              ? 'border-anthracite-200 bg-anthracite-50/70 text-anthracite-400'
                              : 'border-anthracite-200 bg-white'
                          }`}
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm font-semibold text-anthracite-900">{size}</span>
                            <span className={`text-[10px] font-semibold uppercase ${soldOut ? 'text-red-400' : 'text-anthracite-500'}`}>
                              {soldOut ? 'Tükendi' : stockIsFallback ? 'Seri' : `${stock} Stok`}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={soldOut || current <= 0}
                              onClick={() =>
                                setSizeQuantities((prev) => ({
                                  ...prev,
                                  [size]: Math.max(0, Number(prev[size] || 0) - 1),
                                }))
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-md border border-anthracite-200 text-lg text-anthracite-700 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              −
                            </button>
                            <input
                              type="number"
                              min={0}
                              max={Math.max(0, stock)}
                              value={current}
                              disabled={soldOut}
                              onChange={(e) => {
                                const next = Math.max(
                                  0,
                                  Math.min(stock, Number.parseInt(e.target.value || "0", 10) || 0)
                                );
                                setSizeQuantities((prev) => ({ ...prev, [size]: next }));
                              }}
                              className="w-full rounded-md border border-anthracite-200 px-2 py-1.5 text-center text-sm font-medium text-anthracite-900 outline-none focus:ring-2 focus:ring-sky-500/20 disabled:bg-anthracite-50"
                            />
                            <button
                              type="button"
                              disabled={soldOut || current >= stock}
                              onClick={() =>
                                setSizeQuantities((prev) => ({
                                  ...prev,
                                  [size]: Math.min(stock, Number(prev[size] || 0) + 1),
                                }))
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-md border border-anthracite-200 text-lg text-anthracite-700 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              +
                            </button>
                          </div>
                          {!soldOut && (
                            <p className="mt-2 text-[10px] font-medium text-anthracite-500">
                              Maksimum {stock} adet seçebilirsiniz.
                            </p>
                          )}
                          {!soldOut && current >= stock && (
                            <p className="mt-1 text-[10px] font-semibold text-red-600">
                              Bu bedende stok sınırına ulaştınız.
                            </p>
                          )}
                        </div>
                      );
                    })}
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
                <div className="rounded-xl border border-anthracite-200 bg-anthracite-50/50 p-4 text-sm text-anthracite-700">
                  Sipariş için birden fazla bedenden adet girebilirsiniz. Ürün minimumu{" "}
                  <strong>{product.min_order_quantity} adet</strong> olarak uygulanır.
                </div>

                <div className="rounded-xl border border-sky-100/90 bg-sky-50/60 p-4 text-sky-950 dark:border-sky-800/50 dark:bg-sky-950/30 dark:text-sky-100">
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-sky-700">Fiyat dagilimi</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span>Urun ara toplam ({totalItems} adet)</span>
                      <span className="font-semibold tabular-nums">{(Number(product.base_wholesale_price) * totalItems).toLocaleString("tr-TR")} ₺</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span>Platform komisyonu</span>
                      <span className="font-semibold tabular-nums">{(Number(product.margin_price || 0) * totalItems).toLocaleString("tr-TR")} ₺</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2 border-t border-sky-200/80 pt-2">
                      <span className="text-sm font-semibold">Toplam ({totalItems} adet)</span>
                      <span className="text-lg font-semibold tabular-nums">{totalPrice.toLocaleString("tr-TR")} ₺</span>
                    </div>
                  </div>
                </div>

                {moqBlocked && (
                  <p className="mb-2 text-center text-xs font-medium text-red-700 dark:text-red-400">
                    Ürün minimumu: {product.min_order_quantity} adet — toplam adedi artırın.
                  </p>
                )}

                {floorBlocked && (
                    <p className="mb-2 text-center text-xs font-medium text-red-700 dark:text-red-400">
                      Mağaza minimumu: {wholesalerMinFloor} adet — toplam adedi artırın.
                    </p>
                  )}

                {selectedLineItems.length > 0 && (
                  <p className="text-center text-[11px] text-anthracite-500">
                    Beden dağılımı: {selectedSizesSummary}
                  </p>
                )}

                {currentUserProfile?.role === "butik" && (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      type="button"
                      variant="secondary"
                      size="lg"
                      className="flex-1"
                      disabled={listBusy || selectedLineItems.length === 0}
                      onClick={() => void handleAddToShoppingList()}
                    >
                      <ListOrdered className="h-4 w-4 shrink-0" strokeWidth={2} />
                      {listBusy ? "Kaydediliyor…" : "Listeme ekle"}
                    </Button>
                    <Link
                      href="/sepet"
                      className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-md border border-blue-600 bg-blue-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
                    >
                      Sepeti aç
                    </Link>
                  </div>
                )}

                <Button
                  type="button"
                  variant="success"
                  size="xl"
                  className="w-full"
                  disabled={selectedLineItems.length === 0 || floorBlocked || moqBlocked}
                  onClick={() => setShowAddressModal(true)}
                >
                  {selectedLineItems.length === 0 ? (
                    "Beden / adet seçin"
                  ) : moqBlocked ? (
                    "MOQ adedine ulaşın"
                  ) : floorBlocked ? (
                    "Minimum adete ulaşın"
                  ) : (
                    <>
                      <MessageCircle className="h-5 w-5" strokeWidth={2} /> Toptan siparişi tamamla
                    </>
                  )}
                </Button>
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

        </CardContent>
        </Card>
        </div>
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
                   <input required value={il} onChange={e=>setIl(e.target.value)} type="text" className="w-full rounded-xl border border-anthracite-200/90 bg-anthracite-50/50 px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-sky-500/15" placeholder="İstanbul" />
                 </div>
                 <div>
                   <label className="mb-1.5 block text-xs font-medium text-anthracite-600">İlçe</label>
                   <input required value={ilce} onChange={e=>setIlce(e.target.value)} type="text" className="w-full rounded-xl border border-anthracite-200/90 bg-anthracite-50/50 px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-sky-500/15" placeholder="Kadıköy" />
                 </div>
               </div>
               <div>
                  <label className="mb-1.5 block text-xs font-medium text-anthracite-600">Açık adres</label>
                  <textarea required value={adres} onChange={e=>setAdres(e.target.value)} rows={3} className="w-full resize-none rounded-xl border border-anthracite-200/90 bg-anthracite-50/50 px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-sky-500/15" placeholder="Mahalle, sokak, no…"></textarea>
               </div>
               <div>
                  <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-anthracite-600">
                    <StickyNote className="h-3.5 w-3.5" strokeWidth={2} />
                    Sipariş notu (isteğe bağlı)
                  </label>
                  <textarea
                    value={buyerNote}
                    onChange={(e) => setBuyerNote(e.target.value)}
                    rows={2}
                    maxLength={500}
                    className="w-full resize-none rounded-xl border border-anthracite-200/90 bg-anthracite-50/50 px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-sky-500/15"
                    placeholder="Paketleme, teslimat veya ürünle ilgili kısa not (tedarikçi / operasyon görür)"
                  />
               </div>
               <div className="mt-2 flex gap-3">
                 <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowAddressModal(false)}>Vazgeç</Button>
                 <Button disabled={isOrdering} type="submit" variant="success" className="flex-[2]">
                   {isOrdering ? "Gönderiliyor…" : <><MessageCircle className="h-4 w-4" strokeWidth={2} /> Onayla ve WhatsApp</>}
                 </Button>
               </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
