"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Home, Search, SlidersHorizontal } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import NotificationBell from "@/components/NotificationBell";
import { getRecentProductIds } from "@/utils/recentProducts";
import { CATALOG_CATEGORIES } from "@/constants/marketplace";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { Card, CardContent, Input, Button } from "@/components/design-system";

const categories: string[] = [...CATALOG_CATEGORIES];

function buildKatalogQuery(params: { q?: string; category?: string }) {
  const p = new URLSearchParams();
  if (params.q?.trim()) p.set("q", params.q.trim());
  if (params.category && params.category !== "Tümü") p.set("category", params.category);
  const s = p.toString();
  return s ? `?${s}` : "";
}

export default function KatalogView() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isApproved, setIsApproved] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState("butik");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [selectedGender, setSelectedGender] = useState("Tümü");
  const [sortBy, setSortBy] = useState("newest");
  const [notifyNewProducts, setNotifyNewProducts] = useState(true);
  const [notifyPrefSaving, setNotifyPrefSaving] = useState(false);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [fabricFilter, setFabricFilter] = useState("");
  const [recentStrip, setRecentStrip] = useState<any[]>([]);

  useEffect(() => {
    const q = searchParams.get("q") || "";
    const cat = searchParams.get("category") || "Tümü";
    if (q) setSearchTerm(q);
    const decoded = categories.includes(cat) ? cat : "Tümü";
    if (searchParams.has("category")) {
      setSelectedCategory(decoded);
    }
  }, [searchParams]);

  const pushCatalogUrl = useCallback(
    (next: { q: string; category: string }) => {
      const query = buildKatalogQuery({ q: next.q, category: next.category });
      router.replace(`/katalog${query}`, { scroll: false });
    },
    [router]
  );

  useEffect(() => {
    async function fetchData() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      setUser(authUser);

      let roleForFilter = "butik";
      if (authUser) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", authUser.id).single();
        roleForFilter = profile?.role || "butik";
        setIsApproved(profile?.is_approved || false);
        setUserRole(roleForFilter);
        if (profile?.role === "butik") {
          setNotifyNewProducts(profile.notify_new_products !== false);
        }

        const { data: favs } = await supabase.from("favorites").select("product_id").eq("user_id", authUser.id);
        if (favs) setFavorites(favs.map((f) => f.product_id));
      }

      const { data: prods } = await supabase.from("products").select("*");
      if (prods) {
        const displayProds =
          authUser && roleForFilter === "toptanci" ? prods.filter((p) => p.wholesaler_id !== authUser.id) : prods;
        setProducts(displayProds);
        if (roleForFilter === "butik") {
          const ids = getRecentProductIds().filter((id) => displayProds.some((p) => p.id === id));
          setRecentStrip(
            ids.map((id) => displayProds.find((p) => p.id === id)).filter(Boolean) as any[]
          );
        } else {
          setRecentStrip([]);
        }
      }
      setLoading(false);
    }
    fetchData();
  }, [supabase]);

  const toggleFavorite = async (productId: string) => {
    if (!user) {
      alert("Favoriye eklemek için giriş yapmalısınız.");
      return;
    }

    if (favorites.includes(productId)) {
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("product_id", productId);
      setFavorites((prev) => prev.filter((id) => id !== productId));
    } else {
      await supabase.from("favorites").insert({ user_id: user.id, product_id: productId });
      setFavorites((prev) => [...prev, productId]);
    }
  };

  const unitPrice = (p: any) => Number(p.base_wholesale_price) + Number(p.margin_price || 0);

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

    if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === "price-asc") {
      result.sort(
        (a, b) =>
          Number(a.base_wholesale_price) +
          Number(a.margin_price || 0) -
          (Number(b.base_wholesale_price) + Number(b.margin_price || 0))
      );
    } else if (sortBy === "price-desc") {
      result.sort(
        (a, b) =>
          Number(b.base_wholesale_price) +
          Number(b.margin_price || 0) -
          (Number(a.base_wholesale_price) + Number(a.margin_price || 0))
      );
    }

    return result;
  }, [products, searchTerm, selectedCategory, selectedGender, sortBy, priceMin, priceMax, fabricFilter]);

  const onCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    pushCatalogUrl({ q: searchTerm, category: cat });
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-screen-2xl px-3 py-4 sm:px-4 lg:px-6 lg:py-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 sm:mb-6 sm:text-sm">
          <nav className="flex items-center gap-1" aria-label="Breadcrumb">
            <Link href="/" className="font-medium text-slate-600 hover:text-blue-600">
              <Home className="inline h-3.5 w-3.5" /> Ana sayfa
            </Link>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-slate-900">Katalog</span>
          </nav>
          {user && <NotificationBell userId={user.id} />}
        </div>

        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Toptan ürün kataloğu</h1>
          <p className="mt-1 text-sm text-slate-600 sm:text-base">
            Net fiyat, net MOQ, doğrulanmış tedarikçi vitrinleri. Filtrele, karşılaştır, sepete taşı.
          </p>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-3 sm:gap-4">
          <Card>
            <CardContent className="!p-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Katalog adedi</p>
              <p className="mt-1 text-2xl font-extrabold tabular-nums text-slate-900">{products.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="!p-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Filtre sonucu</p>
              <p className="mt-1 text-2xl font-extrabold tabular-nums text-slate-900">{filteredProducts.length}</p>
            </CardContent>
          </Card>
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="!p-4">
              <p className="text-[11px] font-bold uppercase text-blue-800">B2B alışveriş hattı</p>
              <p className="mt-1 text-sm font-medium text-slate-800">
                Sepet, sipariş ve ödeme adımları yönetim kontrolü altında. WhatsApp onayı.
              </p>
            </CardContent>
          </Card>
        </div>

        {user && userRole === "butik" && isApproved && (
          <Card className="mb-6 border-slate-200">
            <CardContent className="!flex !flex-col gap-3 !p-4 sm:!flex-row sm:!items-center sm:!justify-between">
              <div className="text-sm text-slate-700">
                <span className="font-bold text-slate-900">Yeni ürün bildirimleri</span>
                <span className="mt-0.5 block text-xs text-slate-500">Toptancı vitrinine eklenenler için bildirim</span>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="md"
                disabled={notifyPrefSaving}
                onClick={async () => {
                  if (!user) return;
                  const next = !notifyNewProducts;
                  setNotifyPrefSaving(true);
                  const { error } = await supabase.from("profiles").update({ notify_new_products: next }).eq("id", user.id);
                  setNotifyPrefSaving(false);
                  if (error) {
                    alert("Ayar kaydedilemedi: " + error.message);
                    return;
                  }
                  setNotifyNewProducts(next);
                }}
              >
                {notifyPrefSaving ? "Kaydediliyor…" : notifyNewProducts ? "Açık" : "Kapalı"}
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="mb-4">
          <CardContent className="!p-3 sm:!p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-stretch">
              <div className="min-w-0 flex-1">
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onBlur={() => pushCatalogUrl({ q: searchTerm, category: selectedCategory })}
                  placeholder="Bu sayfada ürün ara…"
                  className="min-h-11"
                  leftSlot={<Search className="h-4 w-4" strokeWidth={2} />}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <select
                  value={selectedGender}
                  onChange={(e) => setSelectedGender(e.target.value)}
                  className="min-w-[8rem] rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option>Tümü</option>
                  <option>Erkek</option>
                  <option>Kadın</option>
                  <option>Çocuk</option>
                  <option>Unisex</option>
                </select>
                <div className="inline-flex min-h-11 items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 text-slate-600">
                  <SlidersHorizontal className="h-4 w-4" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="min-w-[9.5rem] flex-1 cursor-pointer bg-transparent py-1 text-sm font-semibold text-slate-800 focus:outline-none"
                  >
                    <option value="newest">En yeniler</option>
                    <option value="price-asc">Fiyat artan</option>
                    <option value="price-desc">Fiyat azalan</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
              <input
                type="text"
                inputMode="decimal"
                placeholder="Min. birim fiyat (₺)"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                className="min-h-10 rounded-md border border-slate-300 px-3 text-sm"
              />
              <input
                type="text"
                inputMode="decimal"
                placeholder="Max. birim fiyat (₺)"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className="min-h-10 rounded-md border border-slate-300 px-3 text-sm"
              />
              <input
                type="text"
                placeholder="Kumaş (ör. pamuk)"
                value={fabricFilter}
                onChange={(e) => setFabricFilter(e.target.value)}
                className="min-h-10 rounded-md border border-slate-300 px-3 text-sm"
              />
            </div>
          </CardContent>
        </Card>

        {userRole === "butik" && recentStrip.length > 0 && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2">
            <p className="mb-2 text-[10px] font-bold uppercase text-amber-900">Son baktıklarınız</p>
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {recentStrip.map((rp) => (
                <Link
                  key={rp.id}
                  href={`/product/${rp.id}`}
                  className="relative h-20 w-16 shrink-0 overflow-hidden rounded border border-amber-200/80"
                >
                  <Image
                    src={rp.images?.[0] || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&q=80"}
                    alt={rp.name}
                    width={64}
                    height={80}
                    className="h-full w-full object-cover"
                  />
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
          {categories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onCategorySelect(cat)}
                className={[
                  "whitespace-nowrap rounded-md border px-3 py-2 text-xs font-bold transition",
                  active
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-slate-50 text-slate-800 hover:border-slate-300",
                ].join(" ")}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="py-20 text-center text-sm font-medium text-slate-400">Yükleniyor…</div>
        ) : filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="!py-16 !text-center">
              <Search className="mx-auto mb-2 h-10 w-10 text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">Bu filtrelerle sonuç yok.</p>
              <Button
                type="button"
                variant="link"
                size="md"
                className="!mt-2"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("Tümü");
                  setSelectedGender("Tümü");
                  setPriceMin("");
                  setPriceMax("");
                  setFabricFilter("");
                  router.replace("/katalog", { scroll: false });
                }}
              >
                Filtreleri sıfırla
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {filteredProducts.map((p) => {
              const displayPrice = unitPrice(p);
              return (
                <ProductCard
                  key={p.id}
                  product={p}
                  displayPrice={displayPrice}
                  isApproved={isApproved}
                  isFavorite={favorites.includes(p.id)}
                  onToggleFavorite={toggleFavorite}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
