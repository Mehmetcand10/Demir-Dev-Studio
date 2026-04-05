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

  if (loading) return <div className="p-24 text-center font-black animate-pulse">Favorileriniz Yükleniyor...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
        <div>
           <div className="flex items-center gap-3 text-red-500 mb-2">
              <Heart className="w-6 h-6 fill-current" />
              <span className="text-xs font-black uppercase tracking-widest text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100">KİŞİSEL LİSTESİ</span>
           </div>
           <h1 className="text-3xl sm:text-6xl font-black tracking-tighter text-anthracite-900">Beğendiğim Ürünler</h1>
           <p className="text-anthracite-500 font-medium mt-2">Daha sonra satın almak üzere kaydettiğiniz modeller.</p>
        </div>
        <Link href="/katalog" className="px-6 sm:px-8 py-4 bg-anthracite-900 text-white rounded-2xl font-black shadow-xl hover:scale-105 transition-all text-sm w-full md:w-auto text-center">
           VİTRİNE GERİ DÖN
        </Link>
      </div>

      {favoriteProducts.length === 0 ? (
        <div className="bg-anthracite-50 rounded-[3rem] border-2 border-dashed border-anthracite-100 py-32 text-center">
            <Heart className="w-20 h-20 mx-auto text-anthracite-200 mb-4" />
            <h3 className="text-2xl font-black text-anthracite-400 mb-2">Henüz Kalp Koyduğunuz Ürün Yok</h3>
            <p className="text-anthracite-400 font-medium mb-8">Katalogdaki ürünlere ❤️ koyarak burada toplayabilirsiniz.</p>
            <Link href="/katalog" className="inline-flex items-center gap-2 text-blue-600 font-bold hover:underline">
               <Search className="w-4 h-4" /> Alışverişe Hemen Başla
            </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3 md:gap-4">
           {favoriteProducts.map((p) => {
             const displayedPrice = Number(p.base_wholesale_price) + Number(p.margin_price || 0);
             return (
               <div key={p.id} className="group bg-white rounded-xl sm:rounded-2xl border border-anthracite-100/90 overflow-hidden shadow-sm hover:shadow-md transition-all relative">
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
  );
}
