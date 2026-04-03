"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Lock, ShoppingBag, Search, Filter, Heart, Eye, ArrowUpDown, X } from "lucide-react";
import { createClient } from '@/utils/supabase/client';
import NotificationBell from "@/components/NotificationBell";

export default function Katalog() {
  const supabase = createClient();
  const [products, setProducts] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isApproved, setIsApproved] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState('butik');

  // Filtre State'leri
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [selectedGender, setSelectedGender] = useState("Tümü");
  const [sortBy, setSortBy] = useState("newest"); // newest, price-asc, price-desc
  const [showQuickView, setShowQuickView] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      // 1. Kullanıcı ve Yetki Kontrolü
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser);

      if (authUser) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', authUser.id).single();
        setIsApproved(profile?.is_approved || false);
        setUserRole(profile?.role || 'butik');

        // Favorileri Çek
        const { data: favs } = await supabase.from('favorites').select('product_id').eq('user_id', authUser.id);
        if (favs) setFavorites(favs.map(f => f.product_id));
      }

      // 2. Ürünleri Çek
      let query = supabase.from('products').select('*');
      
      const { data: prods } = await query;
      if (prods) {
        // Toptancı kendi ürünlerini görmesin
        const displayProds = (authUser && userRole === 'toptanci') 
          ? prods.filter(p => p.wholesaler_id !== authUser.id)
          : prods;
        setProducts(displayProds);
      }
      setLoading(false);
    }
    fetchData();
  }, [supabase, userRole]);

  // FAVORİ İŞLEMİ
  const toggleFavorite = async (productId: string) => {
    if (!user) return alert("Favoriye eklemek için giriş yapmalısınız.");
    
    if (favorites.includes(productId)) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('product_id', productId);
      setFavorites(prev => prev.filter(id => id !== productId));
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, product_id: productId });
      setFavorites(prev => [...prev, productId]);
    }
  };

  // FİLTRELEME VE SIRALAMA MANTIĞI (useMemo ile performanslı)
  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "Tümü" || p.category === selectedCategory;
      const matchesGender = selectedGender === "Tümü" || p.gender === selectedGender;
      return matchesSearch && matchesCategory && matchesGender;
    });

    // Sıralama
    if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === "price-asc") {
      result.sort((a, b) => (Number(a.base_wholesale_price) + Number(a.margin_price || 0)) - (Number(b.base_wholesale_price) + Number(b.margin_price || 0)));
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => (Number(b.base_wholesale_price) + Number(b.margin_price || 0)) - (Number(a.base_wholesale_price) + Number(a.margin_price || 0)));
    }

    return result;
  }, [products, searchTerm, selectedCategory, selectedGender, sortBy]);

  const categories = ["Tümü", "Tişört", "Sweatshirt", "İç Çamaşırı / Pijama", "Ayakkabı / Sneaker", "Triko", "Pantolon / Jean", "Mont / Kaban", "Elbise / Etek", "Aksesuar"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 min-h-screen">
      
      {/* HEADER VE ARAMA */}
      <div className="flex flex-col gap-6 mb-10">
        <div className="flex flex-wrap justify-between items-center gap-3">
            <div>
                <h1 className="text-3xl sm:text-5xl font-black tracking-tighter text-anthracite-900 mb-2">Sezon Koleksiyonu</h1>
                <p className="text-anthracite-500 font-medium">B2B ağındaki en yeni modelleri anlık keşfedin.</p>
            </div>
            <div className="hidden sm:block">
                {user && <NotificationBell userId={user.id} />}
            </div>
        </div>

        {/* ARAMA VE FİLTRE KONTROLLERİ */}
        <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-anthracite-400 group-focus-within:text-anthracite-900 transition-colors" />
                <input 
                    type="text" 
                    placeholder="Ürün adı ile hızlı ara..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white border-2 border-anthracite-100 rounded-2xl focus:border-anthracite-900 outline-none transition-all font-bold shadow-sm"
                />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide sm:overflow-visible">
                <select 
                    value={selectedGender} 
                    onChange={(e) => setSelectedGender(e.target.value)}
                    className="px-4 py-4 bg-white border-2 border-anthracite-100 rounded-2xl font-bold text-sm outline-none focus:border-anthracite-900 cursor-pointer min-w-[120px]"
                >
                    <option>Tümü</option><option>Erkek</option><option>Kadın</option><option>Çocuk</option><option>Unisex</option>
                </select>
                <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-4 bg-white border-2 border-anthracite-100 rounded-2xl font-bold text-sm outline-none focus:border-anthracite-900 cursor-pointer min-w-[150px]"
                >
                    <option value="newest">En Yeniler</option>
                    <option value="price-asc">Fiyat (Düşükten Yükseğe)</option>
                    <option value="price-desc">Fiyat (Yüksekten Düşüğe)</option>
                </select>
            </div>
        </div>

        {/* KATEGORİ SLIDER */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(cat => (
                <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-6 py-2.5 rounded-full text-xs font-black whitespace-nowrap transition-all border-2 ${selectedCategory === cat ? 'bg-anthracite-900 border-anthracite-900 text-white shadow-lg' : 'bg-white border-anthracite-100 text-anthracite-500 hover:border-anthracite-300'}`}
                >
                    {cat}
                </button>
            ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 font-black text-anthracite-400 animate-pulse">Koleksiyon Hazırlanıyor...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-32 bg-anthracite-50 rounded-[3rem] border-2 border-dashed border-anthracite-100">
           <Search className="w-16 h-16 mx-auto text-anthracite-200 mb-4" />
           <p className="text-xl font-black text-anthracite-400">Aradığınız kriterlere uygun ürün bulunamadı.</p>
           <button onClick={() => { setSearchTerm(""); setSelectedCategory("Tümü"); setSelectedGender("Tümü"); }} className="mt-4 text-sm font-bold text-blue-600 underline">Filtreleri Temizle</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {filteredProducts.map((p) => {
            const displayedPrice = Number(p.base_wholesale_price) + Number(p.margin_price || 0);
            const isFav = favorites.includes(p.id);

            return (
              <div key={p.id} className="group flex flex-col bg-white rounded-[2rem] overflow-hidden border border-anthracite-100 transition-all hover:shadow-2xl hover:-translate-y-1 relative">
                
                {/* Ürün Görseli ve Hızlı Aksiyonlar */}
                <div className="relative aspect-[3/4] overflow-hidden bg-anthracite-50">
                  <Image 
                    src={p.images && p.images.length > 0 ? p.images[0] : 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80'} 
                    alt={p.name} 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  {/* FAVORİ VE HIZLI BAKIŞ BUTONLARI */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                    <button 
                        onClick={(e) => { e.preventDefault(); toggleFavorite(p.id); }}
                        className={`p-3 rounded-2xl backdrop-blur-md shadow-xl transition-all ${isFav ? 'bg-red-500 text-white' : 'bg-white/80 text-anthracite-900 hover:bg-white'}`}
                    >
                        <Heart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
                    </button>
                    <button 
                        onClick={() => setShowQuickView(p)}
                        className="p-3 bg-white/80 backdrop-blur-md text-anthracite-900 rounded-2xl shadow-xl hover:bg-white transition-all"
                    >
                        <Eye className="w-5 h-5" />
                    </button>
                  </div>

                  {!isApproved && (
                    <div className="absolute inset-0 bg-anthracite-900/60 backdrop-blur-[2px] flex flex-col items-center justify-center">
                      <Lock className="w-10 h-10 text-white mb-3" />
                      <span className="text-xs font-black text-white bg-black/40 px-4 py-2 rounded-full uppercase tracking-tighter">Fiyat için Onay Bekleniyor</span>
                    </div>
                  )}
                </div>

                {/* Ürün Bilgileri */}
                <div className="p-6 flex flex-col flex-grow text-left">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="font-black text-lg text-anthracite-900 line-clamp-1 leading-tight">{p.name}</h3>
                        <Link href={`/wholesaler/${p.wholesaler_id}`} className="text-[10px] font-bold text-anthracite-400 hover:text-anthracite-900 transition-colors uppercase tracking-widest">Mağazayı Gör</Link>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-1.5 my-3">
                     <span className="text-[9px] font-black tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100 uppercase">{p.gender}</span>
                     <span className="text-[9px] font-black tracking-widest text-anthracite-500 bg-anthracite-50 px-2 py-1 rounded-md uppercase">{p.category}</span>
                  </div>
                  
                  <p className="text-[11px] font-bold text-anthracite-400 mb-6">Paket: {p.min_order_quantity} Adet • {p.gsm || "Standart"}</p>
                  
                  <div className="mt-auto pt-5 border-t border-anthracite-50 flex items-center justify-between">
                    {isApproved ? (
                      <>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-anthracite-400 uppercase tracking-widest leading-none mb-1">Seri Fiyatı</span>
                          <span className="font-black text-2xl text-anthracite-900">
                             {(displayedPrice * parseInt(p.min_order_quantity)).toLocaleString("tr-TR")} <span className="text-sm font-bold">₺</span>
                          </span>
                        </div>
                        <Link href={`/product/${p.id}`} className="bg-anthracite-900 text-white w-12 h-12 rounded-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg shadow-anthracite-900/20">
                          <ShoppingBag className="w-5 h-5" />
                        </Link>
                      </>
                    ) : (
                      <div className="w-full text-center py-2 bg-anthracite-50 rounded-xl text-[10px] font-black text-anthracite-400 uppercase tracking-widest">Görmek İçin Giriş Yapın</div>
                    )}
                  </div>
                </div>

              </div>
            )
          })}
        </div>
      )}

      {/* QUICK VIEW MODAL */}
      {showQuickView && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-anthracite-900/40 backdrop-blur-md">
              <div className="bg-white w-full max-w-4xl rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row relative max-h-[92vh] overflow-y-auto">
                  <button onClick={() => setShowQuickView(null)} className="absolute top-6 right-6 z-10 p-2 bg-anthracite-100 rounded-full hover:bg-anthracite-200 transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                  <div className="w-full md:w-1/2 aspect-[3/4] relative bg-anthracite-50">
                    <Image src={showQuickView.images?.[0]} alt="quick" fill className="object-cover" />
                  </div>
                  <div className="w-full md:w-1/2 p-6 sm:p-10 flex flex-col text-left">
                     <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full w-max mb-4 uppercase tracking-widest">{showQuickView.category}</span>
                     <h2 className="text-3xl sm:text-4xl font-black text-anthracite-900 mb-2 leading-tight break-words">{showQuickView.name}</h2>
                     <p className="text-anthracite-500 font-medium mb-6">{showQuickView.description}</p>
                     
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                        <div className="bg-anthracite-50 p-4 rounded-2xl">
                            <p className="text-[10px] font-black text-anthracite-400 uppercase tracking-widest mb-1">Bedenler</p>
                            <p className="font-bold text-anthracite-900">{showQuickView.sizes}</p>
                        </div>
                        <div className="bg-anthracite-50 p-4 rounded-2xl">
                            <p className="text-[10px] font-black text-anthracite-400 uppercase tracking-widest mb-1">M.O.Q</p>
                            <p className="font-bold text-anthracite-900">{showQuickView.min_order_quantity} Adet</p>
                        </div>
                     </div>

                     <div className="mt-auto flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-anthracite-400 uppercase tracking-widest leading-none mb-1">Alış Fiyatı (Adet)</span>
                            <span className="font-black text-3xl text-anthracite-900">{(Number(showQuickView.base_wholesale_price) + Number(showQuickView.margin_price || 0)).toLocaleString("tr-TR")} ₺</span>
                        </div>
                        <Link href={`/product/${showQuickView.id}`} className="px-6 sm:px-8 py-4 bg-anthracite-900 text-white rounded-2xl font-black hover:scale-105 transition-all shadow-xl w-full sm:w-auto text-center">Hemen Sipariş Ver</Link>
                     </div>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}
