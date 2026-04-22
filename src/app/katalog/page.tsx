"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Lock, ShoppingBag, Search, Heart } from "lucide-react";
import { createClient } from '@/utils/supabase/client';
import NotificationBell from "@/components/NotificationBell";
import { getRecentProductIds } from "@/utils/recentProducts";

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
  const [notifyNewProducts, setNotifyNewProducts] = useState(true);
  const [notifyPrefSaving, setNotifyPrefSaving] = useState(false);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [fabricFilter, setFabricFilter] = useState("");
  const [recentStrip, setRecentStrip] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser);

      let roleForFilter: string = 'butik';
      if (authUser) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', authUser.id).single();
        roleForFilter = profile?.role || 'butik';
        setIsApproved(profile?.is_approved || false);
        setUserRole(roleForFilter);
        if (profile?.role === 'butik') {
          setNotifyNewProducts(profile.notify_new_products !== false);
        }

        const { data: favs } = await supabase.from('favorites').select('product_id').eq('user_id', authUser.id);
        if (favs) setFavorites(favs.map((f) => f.product_id));
      }

      const { data: prods } = await supabase.from('products').select('*');
      if (prods) {
        const displayProds =
          authUser && roleForFilter === 'toptanci'
            ? prods.filter((p) => p.wholesaler_id !== authUser.id)
            : prods;
        setProducts(displayProds);
        if (roleForFilter === "butik") {
          const ids = getRecentProductIds().filter((id) =>
            displayProds.some((p) => p.id === id)
          );
          setRecentStrip(
            ids
              .map((id) => displayProds.find((p) => p.id === id))
              .filter(Boolean) as any[]
          );
        } else {
          setRecentStrip([]);
        }
      }
      setLoading(false);
    }
    fetchData();
  }, [supabase]);

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
  const unitPrice = (p: any) =>
    Number(p.base_wholesale_price) + Number(p.margin_price || 0);

  const filteredProducts = useMemo(() => {
    const minN = priceMin.trim() === "" ? null : Number(priceMin.replace(",", "."));
    const maxN = priceMax.trim() === "" ? null : Number(priceMax.replace(",", "."));
    const fabricQ = fabricFilter.trim().toLowerCase();

    let result = products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "Tümü" || p.category === selectedCategory;
      const matchesGender = selectedGender === "Tümü" || p.gender === selectedGender;
      const u = unitPrice(p);
      const okMin = minN === null || !Number.isFinite(minN) || u >= minN;
      const okMax = maxN === null || !Number.isFinite(maxN) || u <= maxN;
      const fab = String(p.fabric_type || "").toLowerCase();
      const okFabric = !fabricQ || fab.includes(fabricQ);
      return matchesSearch && matchesCategory && matchesGender && okMin && okMax && okFabric;
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
  }, [products, searchTerm, selectedCategory, selectedGender, sortBy, priceMin, priceMax, fabricFilter]);

  const categories = ["Tümü", "Tişört", "Sweatshirt", "İç Çamaşırı / Pijama", "Ayakkabı / Sneaker", "Triko", "Pantolon / Jean", "Mont / Kaban", "Elbise / Etek", "Aksesuar"];

  return (
    <div className="premium-page-wrap min-h-screen">
      
      <div className="mb-8 flex flex-col gap-5 sm:mb-10">
        <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
                <h1 className="premium-title mb-1">Katalog</h1>
                <p className="premium-subtitle">Premium B2B vitrin: tedarikçiden butiğe siparişe dönüşen ürün akışı</p>
            </div>
            {user && <NotificationBell userId={user.id} />}
        </div>

        <div className="premium-shell grid gap-4 p-4 sm:grid-cols-3">
          <div className="premium-kpi">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-anthracite-500">Toplam ürün</p>
            <p className="mt-2 text-2xl font-semibold text-anthracite-900">{products.length}</p>
          </div>
          <div className="premium-kpi">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-anthracite-500">Filtre sonrası</p>
            <p className="mt-2 text-2xl font-semibold text-anthracite-900">{filteredProducts.length}</p>
          </div>
          <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/80 p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">Akış</p>
            <p className="mt-2 text-sm font-medium leading-relaxed text-emerald-900">
              Tedarikçi vitrini seçin, ürün detayında beden-adet girip siparişi tamamlayın.
            </p>
          </div>
        </div>
        <div className="premium-soft flex items-center justify-between gap-3 px-4 py-3 text-sm">
          <p className="font-medium text-anthracite-700">Bugun platformda 38 butik siparis olusturdu.</p>
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
            Dusuk stok urunler hizli tukeniir
          </span>
        </div>

        {user && userRole === 'butik' && isApproved && (
          <div className="flex flex-col gap-2 rounded-xl border border-anthracite-200/80 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-anthracite-700">
              <span className="font-semibold text-anthracite-900">Yeni ürün bildirimleri</span>
              <span className="mt-0.5 block text-xs text-anthracite-500">
                Toptancı vitrine ürün eklediğinde panelde bildirim alırsınız. Zil menüsünden cihaz bildirimine de izin verebilirsiniz.
              </span>
            </div>
            <button
              type="button"
              disabled={notifyPrefSaving}
              onClick={async () => {
                if (!user) return;
                const next = !notifyNewProducts;
                setNotifyPrefSaving(true);
                const { error } = await supabase
                  .from('profiles')
                  .update({ notify_new_products: next })
                  .eq('id', user.id);
                setNotifyPrefSaving(false);
                if (error) {
                  alert('Ayar kaydedilemedi: ' + error.message);
                  return;
                }
                setNotifyNewProducts(next);
              }}
              className={`shrink-0 rounded-lg px-4 py-2 text-xs font-semibold transition ${
                notifyNewProducts
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'border border-anthracite-200 bg-anthracite-50 text-anthracite-700 hover:bg-anthracite-100'
              }`}
            >
              {notifyPrefSaving ? 'Kaydediliyor…' : notifyNewProducts ? 'Açık' : 'Kapalı'}
            </button>
          </div>
        )}

        <div className="premium-shell flex flex-col gap-3 p-3 md:flex-row md:items-stretch">
            <div className="group relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-anthracite-400 group-focus-within:text-emerald-600" strokeWidth={2} />
                <input 
                    type="text" 
                    placeholder="Ürün ara…" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="premium-input py-3 pl-10 pr-4"
                />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide sm:overflow-visible sm:pb-0">
                <select 
                    value={selectedGender} 
                    onChange={(e) => setSelectedGender(e.target.value)}
                    className="min-w-[118px] cursor-pointer rounded-xl border border-anthracite-200/80 bg-white px-3 py-3 text-sm font-medium text-anthracite-800 outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                    <option>Tümü</option><option>Erkek</option><option>Kadın</option><option>Çocuk</option><option>Unisex</option>
                </select>
                <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="min-w-[148px] cursor-pointer rounded-xl border border-anthracite-200/80 bg-white px-3 py-3 text-sm font-medium text-anthracite-800 outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                    <option value="newest">En yeniler</option>
                    <option value="price-asc">Fiyat ↑</option>
                    <option value="price-desc">Fiyat ↓</option>
                </select>
            </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <input
            type="text"
            inputMode="decimal"
            placeholder="Min. adet fiyatı (₺)"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            className="premium-input px-3 py-2.5"
          />
          <input
            type="text"
            inputMode="decimal"
            placeholder="Max. adet fiyatı (₺)"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            className="premium-input px-3 py-2.5"
          />
          <input
            type="text"
            placeholder="Kumaş ara (örn. pamuk)"
            value={fabricFilter}
            onChange={(e) => setFabricFilter(e.target.value)}
            className="premium-input px-3 py-2.5"
          />
        </div>

        {userRole === "butik" && recentStrip.length > 0 && (
          <div className="premium-shell p-3">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-anthracite-500">
              Son baktıklarım
            </p>
            <div className="-mx-1 flex gap-2 overflow-x-auto pb-1 scrollbar-hide px-1">
              {recentStrip.map((rp) => (
                <Link
                  key={rp.id}
                  href={`/product/${rp.id}`}
                  className="group relative h-24 w-20 shrink-0 overflow-hidden rounded-lg border border-anthracite-100 bg-anthracite-50"
                >
                  <Image
                    src={
                      rp.images?.[0] ||
                      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&q=80"
                    }
                    alt={rp.name}
                    fill
                    sizes="80px"
                    className="object-cover transition group-hover:scale-105"
                  />
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map(cat => (
                <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`whitespace-nowrap rounded-lg border px-3 py-2 text-xs font-medium transition ${selectedCategory === cat ? 'border-anthracite-800 bg-anthracite-900 text-white' : 'border-anthracite-200/80 bg-white text-anthracite-600 hover:border-anthracite-300'}`}
                >
                    {cat}
                </button>
            ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm font-medium text-anthracite-400 animate-pulse">Yükleniyor…</div>
      ) : filteredProducts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-anthracite-200/90 bg-white/60 py-20 text-center">
           <Search className="mx-auto mb-3 h-12 w-12 text-anthracite-300" strokeWidth={1.5} />
           <p className="mb-3 text-sm font-medium text-anthracite-600">Bu filtrelerle ürün yok.</p>
           <button
             type="button"
             onClick={() => {
               setSearchTerm("");
               setSelectedCategory("Tümü");
               setSelectedGender("Tümü");
               setPriceMin("");
               setPriceMax("");
               setFabricFilter("");
             }}
             className="text-sm font-medium text-emerald-700 underline-offset-2 hover:underline"
           >
             Filtreleri sıfırla
           </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-3.5 lg:grid-cols-4 xl:grid-cols-5">
          {filteredProducts.map((p) => {
            const displayedPrice = Number(p.base_wholesale_price) + Number(p.margin_price || 0);
            const isFav = favorites.includes(p.id);

            return (
              <div key={p.id} className="group relative flex flex-col overflow-hidden rounded-3xl border border-anthracite-200/70 bg-white/95 shadow-sm transition hover:border-anthracite-300/80 hover:shadow-md">
                
                {/* Ürün Görseli — daha kısa oran, vitrinde daha çok ürün görünsün */}
                <div className="relative aspect-[4/5] overflow-hidden bg-anthracite-50 p-2.5">
                  <Image 
                    src={p.images && p.images.length > 0 ? p.images[0] : 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80'} 
                    alt={p.name} 
                    fill 
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-contain"
                  />
                  
                  <div className="absolute right-2 top-2 flex">
                    <button 
                        type="button"
                        onClick={(e) => { e.preventDefault(); toggleFavorite(p.id); }}
                        className={`p-2 rounded-xl backdrop-blur-md shadow-md transition-all ${isFav ? 'bg-red-500 text-white' : 'bg-white/90 text-anthracite-900'}`}
                    >
                        <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFav ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {!isApproved && (
                    <div className="absolute inset-0 bg-anthracite-900/55 backdrop-blur-[1px] flex flex-col items-center justify-center p-2">
                      <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-white mb-1" />
                      <span className="rounded-full bg-black/40 px-2 py-1 text-center text-[8px] font-medium text-white sm:text-[10px]">Onay bekleniyor</span>
                    </div>
                  )}
                </div>

                <div className="flex min-h-0 flex-grow flex-col p-3 text-left sm:p-3.5">
                  <div className="mb-1.5 min-w-0">
                        <h3 className="font-bold text-xs sm:text-sm text-anthracite-900 line-clamp-2 leading-snug">{p.name}</h3>
                        <Link href={`/toptanci-gor/${p.wholesaler_id}`} className="mt-1 block truncate text-[9px] font-semibold uppercase tracking-wide text-emerald-700 hover:text-emerald-900 sm:text-[10px]">Tedarikci vitrini</Link>
                  </div>
                  
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="line-clamp-1 text-[10px] font-medium text-anthracite-400">MOQ {p.min_order_quantity}</p>
                    <span className="rounded-full border border-anthracite-200 bg-anthracite-50 px-2 py-0.5 text-[9px] font-semibold text-anthracite-600">
                      {p.gender}
                    </span>
                  </div>
                  
                  <div className="mt-auto pt-2 border-t border-anthracite-100/80 flex items-end justify-between gap-1">
                    {isApproved ? (
                      <>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[9px] font-bold uppercase tracking-wide text-anthracite-400">Toptan fiyat</span>
                          <span className="text-sm font-semibold tabular-nums text-anthracite-900 sm:text-[15px]">
                             {displayedPrice.toLocaleString("tr-TR")}<span className="text-[10px] font-medium"> ₺ / adet</span>
                          </span>
                          <span className="text-[10px] text-anthracite-400 line-through">{Math.round(displayedPrice * 1.22).toLocaleString("tr-TR")} ₺</span>
                        </div>
                        <Link href={`/product/${p.id}`} className="shrink-0 bg-anthracite-900 text-white w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center active:scale-95 transition-transform shadow-sm">
                          <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </Link>
                      </>
                    ) : (
                      <div className="w-full text-center py-1.5 bg-anthracite-50 rounded-lg text-[8px] sm:text-[9px] font-bold text-anthracite-400 uppercase">Giriş</div>
                    )}
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
