"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Save, ArrowLeft, Loader2, Edit3, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

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
     <div className="flex flex-col items-center justify-center min-h-[80vh] bg-anthracite-50">
        <Loader2 className="w-16 h-16 text-emerald-500 animate-spin mb-6" />
        <p className="text-xl font-black text-anthracite-900 tracking-tight">Vitrindeki Ürününüz Masaya Getiriliyor...</p>
     </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 min-h-screen">
      
      <div className="mb-8 flex items-center justify-between">
         <Link href="/toptanci" className="flex items-center gap-2 text-anthracite-500 font-bold hover:text-black hover:-translate-x-1 transition-all bg-white px-5 py-3 rounded-2xl shadow-sm border border-anthracite-200">
            <ArrowLeft className="w-5 h-5" /> Geri Dön
         </Link>
         <h1 className="text-3xl font-black tracking-tight text-anthracite-900 border-b-2 border-emerald-500 pb-2">
            Raflardaki Ürünü Düzenle
         </h1>
      </div>

      <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-anthracite-200 grid md:grid-cols-2 gap-12">
         
         {/* Sol: Mevcut Fotolar */}
         <div className="flex flex-col">
            <h3 className="text-lg font-black text-anthracite-900 mb-4 flex items-center gap-2"><ImageIcon className="w-5 h-5 text-emerald-500"/> Ürün Görselleri</h3>
            <div className="w-full aspect-[3/4] bg-emerald-50/50 rounded-3xl overflow-hidden border-2 border-emerald-100 relative shadow-inner">
               {images && images.length > 0 ? (
                 <Image src={images[0]} alt="Ana Gorsel" fill className="object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center font-bold text-anthracite-400">Görsel Bulunamadı</div>
               )}
               <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl text-white font-bold text-xs shadow-lg">Şu an Vitrinde ({images.length} Fotoğraf)</div>
            </div>
            <p className="text-xs text-anthracite-500 mt-4 text-center font-medium">*Fotoğrafları değiştirmek için Mevcut ürünü silip baştan Koleksiyon oluşturmalısınız.*</p>
         </div>

         {/* Sağ: Düzenleme Formu */}
         <div className="flex flex-col justify-center">
            <form onSubmit={handleUpdate} className="flex flex-col gap-6">
               
               <div>
                  <label className="text-[10px] font-black uppercase text-anthracite-400 tracking-widest mb-2 block border-l-2 border-emerald-500 pl-2">Ürün (Model) Başlığı</label>
                  <input required type="text" value={name} onChange={e=>setName(e.target.value)} className="w-full px-5 py-4 border border-anthracite-200 bg-anthracite-50 rounded-2xl font-black text-lg focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all shadow-sm" />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-anthracite-400 tracking-widest mb-2 block border-l-2 border-emerald-500 pl-2">Cinsiyet</label>
                    <select value={gender} onChange={e=>setGender(e.target.value)} className="w-full px-5 py-4 border border-anthracite-200 bg-anthracite-50 rounded-2xl font-black text-emerald-900 focus:ring-4 outline-none cursor-pointer">
                      <option>Kadın</option><option>Erkek</option><option>Kız Çocuk</option><option>Erkek Çocuk</option><option>Unisex</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-anthracite-400 tracking-widest mb-2 block border-l-2 border-emerald-500 pl-2">Kategori</label>
                    <select value={category} onChange={e=>setCategory(e.target.value)} className="w-full px-5 py-4 border border-anthracite-200 bg-anthracite-50 rounded-2xl font-black text-anthracite-900 focus:ring-4 outline-none cursor-pointer">
                      <option>Tişört</option><option>Sweatshirt</option><option>İç Çamaşırı / Pijama</option><option>Ayakkabı / Sneaker</option><option>Triko</option><option>Pantolon / Jean</option><option>Mont / Kaban</option><option>Elbise / Etek</option><option>Aksesuar</option>
                    </select>
                  </div>
               </div>

               <div>
                  <label className="text-[10px] font-black uppercase text-emerald-600 tracking-widest mb-2 block border-l-2 border-emerald-500 pl-2">Paket İçi Beden Asortisi</label>
                  <input required type="text" value={sizes} onChange={e=>setSizes(e.target.value)} className="w-full px-5 py-4 border border-emerald-200 bg-emerald-50 rounded-2xl font-black text-emerald-900 focus:ring-4 outline-none shadow-sm" placeholder="Örn: S-M-L veya 36-40" />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-anthracite-400 tracking-widest mb-2 block border-l-2 border-emerald-500 pl-2">Materyal</label>
                    <input required type="text" value={fabricType} onChange={e=>setFabricType(e.target.value)} className="w-full px-5 py-3 border border-anthracite-200 bg-anthracite-50 rounded-xl font-bold text-anthracite-900 focus:ring-2 outline-none shadow-sm" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-anthracite-400 tracking-widest mb-2 block border-l-2 border-emerald-500 pl-2">Ağırlık (Opsiyonel)</label>
                    <input type="text" value={gsm} onChange={e=>setGsm(e.target.value)} className="w-full px-5 py-3 border border-anthracite-200 bg-anthracite-50 rounded-xl font-bold text-anthracite-900 focus:ring-2 outline-none shadow-sm" placeholder="Örn: 240gsm" />
                  </div>
               </div>

               <hr className="border-anthracite-100 my-2" />

               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-blue-600 tracking-widest mb-2 block border-l-2 border-blue-500 pl-2">Paket (Seri) Adedi</label>
                    <input required type="number" min="1" value={minOrder} onChange={e=>setMinOrder(e.target.value)} className="w-full px-5 py-4 border border-blue-200 bg-blue-50/50 rounded-2xl font-black text-2xl text-blue-900 focus:ring-4 outline-none shadow-sm" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-blue-600 tracking-widest mb-2 block border-l-2 border-blue-500 pl-2">Sizin Fiyatınız (₺)</label>
                    <input required type="number" min="1" value={wholesalePrice} onChange={e=>setWholesalePrice(e.target.value)} className="w-full px-5 py-4 border-2 border-blue-200 bg-blue-50/50 rounded-2xl font-black text-2xl text-blue-900 focus:ring-4 outline-none shadow-sm" />
                  </div>
               </div>

               <button disabled={saving} type="submit" className="w-full bg-anthracite-900 text-white font-black text-xl py-6 rounded-2xl shadow-xl hover:bg-black hover:-translate-y-1 transition-all flex items-center justify-center gap-3 mt-4 disabled:opacity-50 border-t-4 border-anthracite-700">
                  {saving ? <Loader2 className="w-6 h-6 animate-spin"/> : <Save className="w-6 h-6"/>}
                  {saving ? "Canlıya Aktarılıyor..." : "DEĞİŞİKLİKLERİ KAYDET"}
               </button>

            </form>
         </div>
      </div>

    </div>
  )
}
