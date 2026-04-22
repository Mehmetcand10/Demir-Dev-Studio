"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Loader2, Trash2, ShoppingBag } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import NotificationBell from "@/components/NotificationBell";

type Row = {
  id: string;
  product_id: string;
  size_quantities: Record<string, number>;
  product: {
    id: string;
    name: string;
    images: string[] | null;
    base_wholesale_price: number;
    margin_price: number | null;
    min_order_quantity: string | number;
    wholesaler_id: string;
  } | null;
};

function bedenlerQuery(qty: Record<string, unknown>) {
  return Object.entries(qty)
    .filter(([, n]) => Number(n) > 0)
    .map(([s, n]) => `${s}:${Number(n)}`)
    .join(",");
}

export default function ListemPage() {
  const supabase = useMemo(() => createClient(), []);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = "/login";
      return;
    }
    setUserId(user.id);
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "butik") {
      window.location.href = "/katalog";
      return;
    }

    const { data, error } = await supabase
      .from("shopping_list_items")
      .select("id, product_id, size_quantities, product:product_id(id, name, images, base_wholesale_price, margin_price, min_order_quantity, wholesaler_id)")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error(error);
      setRows([]);
    } else {
      setRows((data || []) as unknown as Row[]);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void load();
  }, [load]);

  const removeRow = async (id: string) => {
    await supabase.from("shopping_list_items").delete().eq("id", id);
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 text-anthracite-500">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        <p className="text-sm font-medium">Yükleniyor…</p>
      </div>
    );
  }

  return (
    <div className="premium-page-wrap max-w-3xl">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/katalog"
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-anthracite-600 hover:text-anthracite-900"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            Katalog
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-anthracite-900">Siparis listeniz</h1>
          <p className="mt-1 text-sm text-anthracite-600">
            Urunleri burada biriktirin; beden adetleri kayitli kalir. Siparisi tamamlamak icin «Siparise gec» ile urun sayfasina gidin.
          </p>
        </div>
        {userId ? <NotificationBell userId={userId} /> : null}
      </div>

      {rows.length === 0 ? (
        <div className="premium-card border-dashed border-anthracite-200 py-16 text-center">
          <p className="text-sm font-medium text-anthracite-600">Listeniz bos.</p>
          <Link href="/katalog" className="mt-4 inline-block text-sm font-semibold text-emerald-700 hover:underline">
            Kataloga git
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {rows.map((r) => {
            const p = r.product;
            if (!p) {
              return (
                <li
                  key={r.id}
                className="premium-card flex items-center justify-between rounded-2xl p-4"
                >
                  <span className="text-sm text-anthracite-500">Ürün kaldırılmış</span>
                  <button
                    type="button"
                    onClick={() => void removeRow(r.id)}
                    className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                    aria-label="Sil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              );
            }
            const unit = Number(p.base_wholesale_price) + Number(p.margin_price || 0);
            const qtyMap = (r.size_quantities || {}) as Record<string, number>;
            const total = Object.values(qtyMap).reduce((a, n) => a + Number(n || 0), 0);
            const q = bedenlerQuery(qtyMap);
            const img = p.images?.[0] || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80";
            return (
              <li
                key={r.id}
                className="premium-card flex gap-4 rounded-2xl p-4"
              >
                <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-anthracite-50">
                  <Image src={img} alt="" fill className="object-cover" sizes="80px" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-anthracite-900 line-clamp-2">{p.name}</h2>
                    <p className="mt-1 text-xs text-anthracite-500">
                    {total} adet · {(unit * total).toLocaleString("tr-TR")} ₺ tahmini
                  </p>
                  <p className="mt-1 line-clamp-2 text-[11px] text-anthracite-400">
                    {q.replace(/,/g, ", ")}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href={q ? `/product/${p.id}?bedenler=${encodeURIComponent(q)}` : `/product/${p.id}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-anthracite-900 px-3 py-2 text-xs font-medium text-white hover:bg-black"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" strokeWidth={2} />
                      Siparise gec
                    </Link>
                    <button
                      type="button"
                      onClick={() => void removeRow(r.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-anthracite-200 px-3 py-2 text-xs font-medium text-anthracite-600 hover:bg-anthracite-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                      Cikar
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
