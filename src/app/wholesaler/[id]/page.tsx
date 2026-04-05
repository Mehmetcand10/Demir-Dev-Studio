"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Package, ShoppingBag, MapPin, Phone, Star, ArrowLeft } from "lucide-react";
import { createClient } from '@/utils/supabase/client';
import { useParams } from "next/navigation";

export default function WholesalerProfile() {
  const { id } = useParams();
  const supabase = createClient();
  const [products, setProducts] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      
      // 1. Toptancı Profilini Çek
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', id).single();
      setProfile(prof);

      // 2. Toptancının Ürünlerini Çek
      const { data: prods } = await supabase
        .from('products')
        .select('*')
        .eq('wholesaler_id', id)
        .order('created_at', { ascending: false });
      
      if (prods) setProducts(prods);
      setLoading(false);
    }
    fetchData();
  }, [id, supabase]);

  if (loading) return <div className="p-24 text-center font-black animate-pulse">Mağaza Hazırlanıyor...</div>;
  if (!profile) return <div className="p-24 text-center text-red-500 font-bold">Mağaza bulunamadı.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      
      {/* MAĞAZA ÜST BİLGİSİ */}
      <div className="mb-12">
        <Link href="/katalog" className="inline-flex items-center gap-2 text-anthracite-500 hover:text-black font-bold mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Genel Vitrine Dön
        </Link>

        <div className="bg-white border-2 border-anthracite-100 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 flex flex-col md:flex-row items-center gap-8 sm:gap-10 shadow-xl relative overflow-hidden">
           <div className="absolute top-0 right-0 -mt-20 -mr-20 opacity-5">
              <Package className="w-96 h-96" />
           </div>
           
           <div className="w-32 h-32 sm:w-48 sm:h-48 bg-emerald-500 rounded-[2rem] flex items-center justify-center text-white text-5xl sm:text-7xl font-black shadow-2xl relative z-10">
              {profile.business_name?.[0] || profile.full_name?.[0]}
           </div>

           <div className="flex-1 text-center md:text-left relative z-10">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                 <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-200">ONAYLI ÜRETİCİ</span>
                 <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                    <Star className="w-3 h-3 fill-current" /> <span className="text-[10px] font-black uppercase tracking-widest">Premium Satıcı</span>
                 </div>
              </div>
              <h1 className="text-3xl sm:text-6xl font-black tracking-tighter text-anthracite-900 mb-2 leading-tight break-words">{profile.business_name || profile.full_name}</h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-anthracite-500 font-medium">
                 <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-500" /> Merter / İSTANBUL
                 </div>
                 <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-emerald-500" /> {products.length} Aktif Model
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* MAĞAZA ÜRÜNLERİ */}
      <div className="flex flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between border-b-2 border-anthracite-100 pb-5 gap-2">
           <h2 className="text-2xl font-black text-anthracite-900">Mağaza Koleksiyonu ({products.length})</h2>
           <p className="text-anthracite-400 font-bold text-sm">Üreticiden doğrudan sevkiyat.</p>
        </div>

        {products.length === 0 ? (
          <div className="py-32 text-center text-anthracite-400 font-bold">Bu toptancının henüz aktif ürünü bulunmuyor.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3 md:gap-4">
             {products.map((p) => {
               const displayedPrice = Number(p.base_wholesale_price) + Number(p.margin_price || 0);
               return (
                 <div key={p.id} className="group bg-white rounded-xl sm:rounded-2xl border border-anthracite-100/90 overflow-hidden shadow-sm hover:shadow-md transition-all">
                    <div className="relative aspect-[4/5] sm:aspect-[5/6] overflow-hidden bg-anthracite-50">
                      <Image src={p.images?.[0]} alt={p.name} fill sizes="(max-width: 640px) 50vw, 20vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-2.5 sm:p-3 text-left">
                      <h3 className="font-bold text-xs sm:text-sm text-anthracite-900 mb-1 line-clamp-2 leading-snug">{p.name}</h3>
                      <div className="flex flex-wrap gap-1 mb-2">
                         <span className="text-[7px] sm:text-[8px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-100 uppercase">{p.gender}</span>
                         <span className="text-[7px] sm:text-[8px] font-bold bg-anthracite-50 text-anthracite-500 px-1.5 py-0.5 rounded uppercase truncate max-w-[5rem]">{p.category}</span>
                      </div>
                      
                      <div className="flex items-end justify-between gap-1 pt-2 border-t border-anthracite-100/80">
                          <div className="flex flex-col min-w-0">
                              <span className="text-[8px] font-bold text-anthracite-400 uppercase">B2B</span>
                              <span className="font-black text-sm sm:text-base text-anthracite-900 tabular-nums">{(displayedPrice * parseInt(p.min_order_quantity)).toLocaleString("tr-TR")} ₺</span>
                          </div>
                          <Link href={`/product/${p.id}`} className="shrink-0 p-2 bg-anthracite-900 text-white rounded-lg sm:rounded-xl shadow-sm">
                              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </Link>
                      </div>
                    </div>
                 </div>
               )
             })}
          </div>
        )}
      </div>
    </div>
  );
}
