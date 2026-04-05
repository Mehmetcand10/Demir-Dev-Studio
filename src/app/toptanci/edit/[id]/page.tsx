"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Save, ArrowLeft, Loader2, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { DashboardShell } from '@/components/dashboard/DashboardShell';

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Ürün Verileri
  const [name, setName] = useState('');
  const [gender, setGender] = useState('Unisex');
  const [category, setCategory] = useState('');
  const [fabricType, setFabricType] = useState('');
  const [sizes, setSizes] = useState('');
  const [gsm, setGsm] = useState('');
  const [wholesalePrice, setWholesalePrice] = useState('');
  const [minOrder, setMinOrder] = useState('');
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    async function loadProduct() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Satıcı oturumu bulunamadı");
        router.push('/login');
        return;
      }
      setUser(user);

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', params.id)
        .eq('wholesaler_id', user.id)
        .single();
      
      if (error || !data) {
        alert("Ürün bulunamadı veya düzenleme yetkiniz yok!");
        router.push('/toptanci');
        return;
      }

      setName(data.name);
      setGender(data.gender || 'Unisex');
      setCategory(data.category);
      setSizes(data.sizes || 'Standart Seri');
      setFabricType(data.fabric_type || '');
      setGsm(data.gsm || '');
      setWholesalePrice(data.base_wholesale_price?.toString() || '');
      setMinOrder(data.min_order_quantity?.toString() || '');
      setImages(data.images || []);
      setLoading(false);
    }
    loadProduct();
  }, [params.id, router, supabase]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const { error } = await supabase
      .from('products')
      .update({
        name,
        gender,
        category,
        fabric_type: fabricType,
        sizes,
        gsm: gsm || null,
        base_wholesale_price: Number(wholesalePrice),
        margin_price: Number(wholesalePrice) * 0.15, // Demir Dev Payı (%15 Otomatik)
        min_order_quantity: Number(minOrder)
      })
      .eq('id', params.id)
      .eq('wholesaler_id', user.id);

    setSaving(false);
    
    if (error) {
      alert("Demir Dev Ağaç Hatası: " + error.message);
    } else {
      alert("Ürün güncellemeleri başarıyla Müşteri Vitrinine yansıdı! Geri dönüyoruz...");
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
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
      
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
         <Link href="/toptanci" className="inline-flex items-center gap-2 rounded-lg border border-anthracite-200/80 bg-white px-4 py-2.5 text-sm font-medium text-anthracite-700 shadow-sm transition hover:bg-anthracite-50">
            <ArrowLeft className="h-4 w-4" strokeWidth={2} /> Panele dön
         </Link>
         <h1 className="text-xl font-semibold text-anthracite-900 sm:text-2xl">
            Ürünü düzenle
         </h1>
      </div>

      <div className="grid gap-8 rounded-2xl border border-anthracite-200/70 bg-white p-6 shadow-sm sm:gap-10 sm:p-8 md:grid-cols-2">
         
         {/* Sol: Mevcut Fotolar */}
         <div className="flex flex-col">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-anthracite-900"><ImageIcon className="h-4 w-4 text-emerald-600" strokeWidth={2}/> Görseller</h3>
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-emerald-100/90 bg-emerald-50/40 shadow-inner">
               {images && images.length > 0 ? (
                 <Image src={images[0]} alt="Ana Gorsel" fill className="object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center font-bold text-anthracite-400">Görsel Bulunamadı</div>
               )}
               <div className="absolute bottom-3 left-3 rounded-lg bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">{images.length} görsel</div>
            </div>
            <p className="text-xs text-anthracite-500 mt-4 text-center font-medium">*Fotoğrafları değiştirmek için Mevcut ürünü silip baştan Koleksiyon oluşturmalısınız.*</p>
         </div>

         {/* Sağ: Düzenleme Formu */}
         <div className="flex flex-col justify-center">
            <form onSubmit={handleUpdate} className="flex flex-col gap-6">
               
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
                  <label className="mb-1.5 block text-xs font-medium text-emerald-800">Beden asortisi</label>
                  <input required type="text" value={sizes} onChange={e=>setSizes(e.target.value)} className="w-full rounded-xl border border-emerald-200/90 bg-emerald-50/50 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="Örn: S-M-L" />
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

               <hr className="border-anthracite-100 my-2" />

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

               <button disabled={saving} type="submit" className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-anthracite-900 py-3.5 text-sm font-medium text-white transition hover:bg-anthracite-800 disabled:opacity-50">
                  {saving ? <Loader2 className="h-5 w-5 animate-spin"/> : <Save className="h-5 w-5" strokeWidth={2}/>}
                  {saving ? "Kaydediliyor…" : "Kaydet"}
               </button>

            </form>
         </div>
      </div>

    </div>
    </DashboardShell>
  )
}
