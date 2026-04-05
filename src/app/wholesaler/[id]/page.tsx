"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Package, ShoppingBag, MapPin, Star, ArrowLeft } from "lucide-react";
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

  if (loading) return <div className="py-24 text-center text-sm font-medium text-anthracite-400 animate-pulse">Yükleniyor…</div>;
  if (!profile) return <div className="py-24 text-center text-sm font-medium text-red-600">Mağaza bulunamadı.</div>;

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      
      <div className="mb-10">
        <Link href="/katalog" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-anthracite-600 transition hover:text-anthracite-900">
          <ArrowLeft className="h-4 w-4" strokeWidth={2} /> Katalog
        </Link>

        <div className="relative flex flex-col items-center gap-6 overflow-hidden rounded-2xl border border-anthracite-200/70 bg-white p-6 shadow-sm sm:flex-row sm:gap-8 sm:p-8">
           <div className="absolute -right-16 -top-16 opacity-[0.04]">
              <Package className="h-64 w-64" strokeWidth={1} />
           </div>
           
           <div className="relative z-10 flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-3xl font-semibold text-white shadow-sm sm:h-28 sm:w-28 sm:text-4xl">
              {profile.business_name?.[0] || profile.full_name?.[0]}
           </div>

           <div className="relative z-10 flex-1 text-center md:text-left">
              <div className="mb-3 flex flex-wrap items-center justify-center gap-2 md:justify-start">
                 <span className="rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-medium text-emerald-800">Onaylı üretici</span>
                 <div className="flex items-center gap-1 rounded-full border border-amber-100 bg-amber-50 px-2.5 py-0.5 text-[10px] font-medium text-amber-800">
                    <Star className="h-3 w-3 fill-current" /> Satıcı
                 </div>
              </div>
              <h1 className="mb-2 break-words text-2xl font-semibold leading-tight tracking-tight text-anthracite-900 sm:text-3xl">{profile.business_name || profile.full_name}</h1>
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-anthracite-600 md:justify-start">
                 <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-emerald-600" strokeWidth={2} /> Merter / İstanbul
                 </div>
                 <div className="flex items-center gap-1.5">
                    <Package className="h-4 w-4 text-emerald-600" strokeWidth={2} /> {products.length} ürün
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-2 border-b border-anthracite-200/80 pb-4">
           <h2 className="text-lg font-semibold text-anthracite-900 sm:text-xl">Ürünler ({products.length})</h2>
           <p className="text-xs text-anthracite-500 sm:text-sm">Üretici vitrini</p>
        </div>

        {products.length === 0 ? (
          <div className="py-16 text-center text-sm text-anthracite-500">Bu mağazada henüz ürün yok.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3 md:gap-4">
             {products.map((p) => {
               const displayedPrice = Number(p.base_wholesale_price) + Number(p.margin_price || 0);
               return (
                 <div key={p.id} className="group overflow-hidden rounded-xl border border-anthracite-200/70 bg-white shadow-sm transition hover:border-anthracite-300/80 hover:shadow-md sm:rounded-2xl">
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
                              <span className="text-sm font-semibold tabular-nums text-anthracite-900 sm:text-base">{(displayedPrice * parseInt(p.min_order_quantity)).toLocaleString("tr-TR")} ₺</span>
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
