"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { CATALOG_CATEGORIES } from "@/constants/marketplace";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { Input } from "@/components/design-system";

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

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const q = searchParams.get("q") || "";
    const cat = searchParams.get("category") || "Tümü";
    setSearchTerm(q);
    setSelectedCategory(categories.includes(cat) ? cat : "Tümü");
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

      if (authUser) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_approved, role")
          .eq("id", authUser.id)
          .single();
        setIsApproved(Boolean(profile?.is_approved));

        const { data: favs } = await supabase.from("favorites").select("product_id").eq("user_id", authUser.id);
        if (favs) setFavorites(favs.map((f) => f.product_id));
      } else {
        setIsApproved(false);
      }

      const { data: prods } = await supabase.from("products").select("*");
      setProducts(prods ?? []);
      setLoading(false);
    }
    fetchData();
  }, [supabase]);

  const toggleFavorite = async (productId: string) => {
    if (!user) {
      alert("Favori icin giris yapmalisiniz.");
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
    let result = products.filter((p) => {
      const matchesSearch = String(p.name || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "Tümü" || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === "price-asc") {
      result.sort((a, b) => unitPrice(a) - unitPrice(b));
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => unitPrice(b) - unitPrice(a));
    }

    return result;
  }, [products, searchTerm, selectedCategory, sortBy]);

  const onCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    pushCatalogUrl({ q: searchTerm, category: cat });
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-screen-2xl px-3 py-4 sm:px-4 lg:px-6 lg:py-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Katalog</h1>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="w-full min-w-0 sm:w-[340px]">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onBlur={() => pushCatalogUrl({ q: searchTerm, category: selectedCategory })}
                placeholder="Urun ara..."
                className="min-h-10"
                leftSlot={<Search className="h-4 w-4" strokeWidth={2} />}
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="min-h-10 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="newest">En yeniler</option>
              <option value="price-asc">Fiyat artan</option>
              <option value="price-desc">Fiyat azalan</option>
            </select>
          </div>
        </div>

        <div className="mb-5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
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
          <div className="py-20 text-center text-sm font-medium text-slate-400">Yukleniyor...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-lg border border-slate-200 py-16 text-center">
            <p className="text-sm font-semibold text-slate-600">Urun bulunamadi.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {filteredProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                displayPrice={unitPrice(p)}
                isApproved={isApproved}
                isFavorite={favorites.includes(p.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
