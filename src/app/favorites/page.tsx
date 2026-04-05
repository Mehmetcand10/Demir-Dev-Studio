"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Trash2, Heart, Search } from "lucide-react";
import { createClient } from '@/utils/supabase/client';

export default function Favoriler() {
  const supabase = createClient();
  const [favoriteProducts, setFavoriteProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function fetchFavorites() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: favs } = await supabase
          .from('favorites')
          .select('product_id, products(*)')
          .eq('user_id', user.id);
        
        if (favs) {
          setFavoriteProducts(favs.map(f => f.products));
        }
      }
      setLoading(false);
    }
    fetchFavorites();
  }, [supabase]);

  const removeFavorite = async (productId: string) => {
    if (!user) return;
    const { error } = await supabase.from('favorites').delete().eq('user_id', user.id).eq('product_id', productId);
    if (!error) {
      setFavoriteProducts(prev => prev.filter(p => p.id !== productId));
    }
  };

  if (loading) return <div className="py-24 text-center text-sm font-medium text-anthracite-400 animate-pulse">Yükleniyor…</div>;

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between">
        <div>
           <div className="mb-2 flex items-center gap-2 text-rose-600">
              <Heart className="h-5 w-5 fill-current" strokeWidth={2} />
              <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-rose-700 ring-1 ring-rose-100/80">Liste</span>
           </div>
           <h1 className="text-2xl font-semibold tracking-tight text-anthracite-900 sm:text-3xl">Favoriler</h1>
           <p className="mt-1 text-sm text-anthracite-600">Kaydettiğiniz ürünler.</p>
        </div>
        <Link href="/katalog" className="w-full rounded-xl border border-anthracite-200/90 bg-white py-3 text-center text-sm font-medium text-anthracite-800 shadow-sm transition hover:bg-anthracite-50 md:w-auto md:px-5">
           Kataloga dön
        </Link>
      </div>

      {favoriteProducts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-anthracite-200/90 bg-white/60 py-20 text-center">
            <Heart className="mx-auto mb-3 h-14 w-14 text-anthracite-300" strokeWidth={1.5} />
            <h3 className="mb-2 text-sm font-medium text-anthracite-700">Henüz favori yok</h3>
            <p className="mb-6 text-sm text-anthracite-500">Katalogdan kalp ile ekleyin.</p>
            <Link href="/katalog" className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 hover:underline">
               <Search className="h-4 w-4" strokeWidth={2} /> Kataloga git
            </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3 md:gap-4">
           {favoriteProducts.map((p) => {
             const displayedPrice = Number(p.base_wholesale_price) + Number(p.margin_price || 0);
             return (
               <div key={p.id} className="group relative overflow-hidden rounded-xl border border-anthracite-200/70 bg-white shadow-sm transition hover:border-anthracite-300/80 hover:shadow-md sm:rounded-2xl">
                  <div className="relative aspect-[4/5] sm:aspect-[5/6] overflow-hidden bg-anthracite-50">
                    <Image src={p.images?.[0]} alt={p.name} fill sizes="(max-width: 640px) 50vw, 20vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    <button 
                        type="button"
                        onClick={() => removeFavorite(p.id)}
                        className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-xl text-red-500 shadow-md hover:bg-white"
                    >
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                  <div className="p-2.5 sm:p-3">
                    <h3 className="font-bold text-xs sm:text-sm text-anthracite-900 mb-1 line-clamp-2 leading-snug">{p.name}</h3>
                    <p className="text-[8px] sm:text-[9px] font-semibold text-anthracite-400 uppercase tracking-wide mb-2 truncate">{p.category} · {p.gender}</p>
                    
                    <div className="flex items-end justify-between gap-1 pt-2 border-t border-anthracite-100/80">
                        <div className="flex flex-col min-w-0">
                            <span className="text-[8px] font-bold text-anthracite-400 uppercase">Seri</span>
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
  );
}
