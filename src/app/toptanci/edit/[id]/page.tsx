"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Save, ArrowLeft, Loader2, Image as ImageIcon, Plus, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { hasPositiveStockLine } from '@/utils/productStocks';

const MAX_PRODUCT_IMAGES = 24;

function parseImageUrlLines(raw: string): string[] {
  return raw
    .split(/[\n|,]+/)
    .map((s) => s.trim())
    .filter((s) => /^https?:\/\//i.test(s));
}

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [name, setName] = useState('');
  const [gender, setGender] = useState('Unisex');
  const [category, setCategory] = useState('');
  const [fabricType, setFabricType] = useState('');
  const [gsm, setGsm] = useState('');
  const [wholesalePrice, setWholesalePrice] = useState('');
  const [minOrder, setMinOrder] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState('5');
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrlsText, setNewImageUrlsText] = useState('');
  const [stockEntries, setStockEntries] = useState<{ size: string; quantity: number }[]>([
    { size: 'S', quantity: 0 },
    { size: 'M', quantity: 0 },
    { size: 'L', quantity: 0 },
    { size: 'XL', quantity: 0 },
  ]);

  const removeImageAt = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const appendUrlsFromBox = useCallback(() => {
    const next = parseImageUrlLines(newImageUrlsText);
    if (next.length === 0) return;
    setImages((prev) => {
      const merged = [...prev];
      for (const u of next) {
        if (!merged.includes(u)) merged.push(u);
      }
      return merged.slice(0, MAX_PRODUCT_IMAGES);
    });
    setNewImageUrlsText('');
  }, [newImageUrlsText]);

  useEffect(() => {
    async function loadProduct() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        alert("Satıcı oturumu bulunamadı");
        router.push('/login');
        return;
      }
      setUser(authUser);

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', params.id)
        .eq('wholesaler_id', authUser.id)
        .single();
      
      if (error || !data) {
        alert("Ürün bulunamadı veya düzenleme yetkiniz yok!");
        router.push('/toptanci');
        return;
      }

      setName(data.name);
      setGender(data.gender || 'Unisex');
      setCategory(data.category);
      setFabricType(data.fabric_type || '');
      setGsm(data.gsm || '');
      setWholesalePrice(data.base_wholesale_price?.toString() || '');
      setMinOrder(data.min_order_quantity?.toString() || '');
      setLowStockThreshold(
        data.low_stock_threshold !== null && data.low_stock_threshold !== undefined
          ? String(data.low_stock_threshold)
          : '5'
      );
      setImages(Array.isArray(data.images) ? data.images.filter(Boolean) : []);

      const rawStocks = data.stocks && typeof data.stocks === 'object' && !Array.isArray(data.stocks)
        ? (data.stocks as Record<string, unknown>)
        : {};
      const entries = Object.entries(rawStocks).map(([size, v]) => ({
        size: String(size),
        quantity: Math.max(0, Math.floor(Number(v) || 0)),
      }));
      if (entries.length > 0) {
        setStockEntries(entries);
      }

      setLoading(false);
    }
    loadProduct();
  }, [params.id, router, supabase]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const stocksJson = stockEntries.reduce((acc: Record<string, number>, curr) => {
      const k = curr.size.trim();
      if (k) acc[k] = Math.max(0, Number(curr.quantity) || 0);
      return acc;
    }, {});

    if (!hasPositiveStockLine(stocksJson)) {
      alert('En az bir bedende stok adedi 1 veya üzeri olmalı.');
      return;
    }

    const extraFromBox = parseImageUrlLines(newImageUrlsText);
    let finalImages = [...images, ...extraFromBox];
    const seen = new Set<string>();
    finalImages = finalImages.filter((u) => {
      if (!u || seen.has(u)) return false;
      seen.add(u);
      return true;
    }).slice(0, MAX_PRODUCT_IMAGES);

    if (finalImages.length === 0) {
      alert('En az bir görsel URL’si gerekir (mevcut veya yeni).');
      return;
    }

    const sizesLabel = Object.keys(stocksJson)
      .filter((k) => (stocksJson[k] || 0) > 0)
      .join(' / ');

    setSaving(true);
    
    const { error } = await supabase
      .from('products')
      .update({
        name,
        gender,
        category,
        fabric_type: fabricType,
        sizes: sizesLabel || 'Standart Seri',
        gsm: gsm || null,
        stocks: stocksJson,
        images: finalImages,
        base_wholesale_price: Number(wholesalePrice),
        margin_price: Number(wholesalePrice) * 0.15,
        min_order_quantity: Number(minOrder),
        low_stock_threshold: Math.max(0, Math.floor(Number(lowStockThreshold) || 5)),
      })
      .eq('id', params.id)
      .eq('wholesaler_id', user.id);

    setSaving(false);
    
    if (error) {
      alert("Güncelleme hatası: " + error.message);
    } else {
      setNewImageUrlsText('');
      alert("Ürün güncellendi; vitrin ve fiyatlar yansıdı.");
      router.push('/toptanci');
    }
  };

  if (loading) return (
     <DashboardShell>
       <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="mb-4 h-10 w-10 animate-spin text-emerald-600" strokeWidth={2} />
          <p className="text-sm font-medium text-anthracite-500">Yükleniyor…</p>
       </div>
     </DashboardShell>
  );

  return (
    <DashboardShell>
    <div className="premium-page-wrap max-w-4xl">
      
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
         <Link href="/toptanci" className="btn-premium-light">
            <ArrowLeft className="h-4 w-4" strokeWidth={2} /> Panele don
         </Link>
         <h1 className="text-xl font-semibold text-anthracite-900 sm:text-2xl">
            Urunu duzenle
         </h1>
      </div>

      <form onSubmit={handleUpdate} className="premium-card grid gap-8 rounded-2xl p-6 sm:gap-10 sm:p-8 md:grid-cols-2">
         
         <div className="flex flex-col md:col-span-1">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-anthracite-900"><ImageIcon className="h-4 w-4 text-emerald-600" strokeWidth={2}/> Görseller</h3>
            <p className="mb-3 text-xs text-anthracite-600">
              Fiyat, stok veya yanlış görsel için buradan güncelleyin. İstediğiniz kadar <strong>https://</strong> adresi ekleyebilirsiniz (üst sınır {MAX_PRODUCT_IMAGES}); her satır veya virgül ile ayırın.
            </p>
            {images.length > 0 ? (
              <div className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {images.map((url, idx) => (
                  <div key={`${url}-${idx}`} className="relative aspect-[3/4] overflow-hidden rounded-lg border border-anthracite-100 bg-anthracite-50">
                    <Image src={url} alt="" fill className="object-cover" sizes="120px" />
                    <button
                      type="button"
                      onClick={() => removeImageAt(idx)}
                      className="absolute right-1 top-1 rounded-md bg-red-600 p-1 text-white shadow hover:bg-red-700"
                      title="Kaldır"
                    >
                      <X className="h-3 w-3" strokeWidth={2} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mb-3 text-sm text-amber-800">Henüz görsel yok; aşağıdan URL ekleyin.</p>
            )}
            <label className="mb-1.5 block text-xs font-medium text-anthracite-600">Yeni görsel adresleri (https)</label>
            <textarea
              value={newImageUrlsText}
              onChange={(e) => setNewImageUrlsText(e.target.value)}
              rows={3}
              className="mb-2 w-full resize-y rounded-xl border border-anthracite-200/90 bg-anthracite-50/50 px-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-emerald-500/15"
              placeholder={"https://ornek.com/1.jpg\nhttps://ornek.com/2.jpg"}
            />
            <button
              type="button"
              onClick={appendUrlsFromBox}
              className="mb-4 w-full rounded-lg border border-emerald-200 bg-emerald-50 py-2 text-xs font-semibold text-emerald-900 transition hover:bg-emerald-100"
            >
              Bu adresleri listeye ekle
            </button>
            <p className="text-[11px] text-anthracite-500">
              Kaydet dediğinizde hem yukarıdaki kutudaki adresler hem mevcut liste birleşir (en fazla {MAX_PRODUCT_IMAGES} görsel).
            </p>
         </div>

         <div className="flex flex-col gap-6 md:col-span-1">
               <div>
                  <label className="mb-1.5 block text-xs font-medium text-anthracite-600">Ürün adı</label>
                  <input required type="text" value={name} onChange={e=>setName(e.target.value)} className="w-full rounded-xl border border-anthracite-200/90 bg-anthracite-50/50 px-3.5 py-2.5 text-sm font-medium outline-none transition focus:ring-2 focus:ring-emerald-500/15" />
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-anthracite-600">Cinsiyet</label>
                    <select value={gender} onChange={e=>setGender(e.target.value)} className="w-full cursor-pointer rounded-xl border border-anthracite-200/90 bg-anthracite-50/50 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/15">
                      <option>Kadın</option><option>Erkek</option><option>Kız Çocuk</option><option>Erkek Çocuk</option><option>Unisex</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-anthracite-600">Kategori</label>
                    <select value={category} onChange={e=>setCategory(e.target.value)} className="w-full cursor-pointer rounded-xl border border-anthracite-200/90 bg-anthracite-50/50 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/15">
                      <option>Tişört</option><option>Sweatshirt</option><option>İç Çamaşırı / Pijama</option><option>Ayakkabı / Sneaker</option><option>Triko</option><option>Pantolon / Jean</option><option>Mont / Kaban</option><option>Elbise / Etek</option><option>Aksesuar</option>
                    </select>
                  </div>
               </div>

               <div>
                  <label className="mb-2 block text-xs font-semibold text-emerald-800">Stok (beden başına adet)</label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {stockEntries.map((entry, idx) => (
                      <div key={idx} className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-2">
                        <input
                          type="text"
                          placeholder="Beden"
                          value={entry.size}
                          onChange={(e) => {
                            const n = [...stockEntries];
                            n[idx] = { ...n[idx], size: e.target.value };
                            setStockEntries(n);
                          }}
                          className="mb-1 w-full border-b border-emerald-100/80 bg-transparent text-center text-sm font-semibold uppercase outline-none"
                        />
                        <input
                          type="number"
                          min={0}
                          value={entry.quantity}
                          onChange={(e) => {
                            const n = [...stockEntries];
                            n[idx] = { ...n[idx], quantity: Math.max(0, Number(e.target.value) || 0) };
                            setStockEntries(n);
                          }}
                          className="w-full text-center text-sm tabular-nums text-emerald-800 outline-none"
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setStockEntries([...stockEntries, { size: '', quantity: 0 }])}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline"
                  >
                    <Plus className="h-3.5 w-3.5" /> Beden satırı ekle
                  </button>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-anthracite-600">Materyal</label>
                    <input required type="text" value={fabricType} onChange={e=>setFabricType(e.target.value)} className="w-full rounded-xl border border-anthracite-200/90 bg-anthracite-50/50 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/15" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-anthracite-600">Gramaj (isteğe bağlı)</label>
                    <input type="text" value={gsm} onChange={e=>setGsm(e.target.value)} className="w-full rounded-xl border border-anthracite-200/90 bg-anthracite-50/50 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/15" placeholder="240 gsm" />
                  </div>
               </div>

               <hr className="border-anthracite-100" />

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-anthracite-600">MOQ (seri adedi)</label>
                    <input required type="number" min="1" value={minOrder} onChange={e=>setMinOrder(e.target.value)} className="w-full rounded-xl border border-anthracite-200/90 bg-white px-3.5 py-2.5 text-sm tabular-nums outline-none focus:ring-2 focus:ring-emerald-500/15" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-anthracite-600">Toptan fiyat (₺)</label>
                    <input required type="number" min="1" value={wholesalePrice} onChange={e=>setWholesalePrice(e.target.value)} className="w-full rounded-xl border border-anthracite-200/90 bg-white px-3.5 py-2.5 text-sm tabular-nums outline-none focus:ring-2 focus:ring-emerald-500/15" />
                  </div>
               </div>

               <div>
                  <label className="mb-1.5 block text-xs font-medium text-amber-800">Düşük stok uyarı eşiği (toplam adet)</label>
                  <input type="number" min="0" value={lowStockThreshold} onChange={e=>setLowStockThreshold(e.target.value)} className="w-full max-w-xs rounded-xl border border-amber-200/90 bg-amber-50/50 px-3.5 py-2.5 text-sm tabular-nums outline-none focus:ring-2 focus:ring-amber-500/20" />
                  <p className="mt-1 text-[11px] text-anthracite-500">Komisyon oranı değişmez; siz sadece kendi net fiyatınızı güncellersiniz (%15 platform payı otomatik hesaplanır).</p>
               </div>

               <button disabled={saving} type="submit" className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-anthracite-900 py-3.5 text-sm font-medium text-white transition hover:bg-anthracite-800 disabled:opacity-50">
                  {saving ? <Loader2 className="h-5 w-5 animate-spin"/> : <Save className="h-5 w-5" strokeWidth={2}/>}
                  {saving ? "Kaydediliyor…" : "Kaydet"}
               </button>
         </div>
      </form>

    </div>
    </DashboardShell>
  );
}
