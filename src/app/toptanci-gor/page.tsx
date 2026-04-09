"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Package, Store, ChevronRight } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import NotificationBell from "@/components/NotificationBell";

type Row = {
  id: string;
  business_name: string | null;
  full_name: string | null;
  productCount: number;
};

export default function ToptanciGorListe() {
  const supabase = createClient();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function run() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);

      const { data: prods } = await supabase
        .from("products")
        .select("wholesaler_id");

      const counts = new Map<string, number>();
      for (const row of prods || []) {
        const w = row.wholesaler_id as string;
        if (!w) continue;
        counts.set(w, (counts.get(w) || 0) + 1);
      }

      const ids = Array.from(counts.keys());
      if (ids.length === 0) {
        setRows([]);
        setLoading(false);
        return;
      }

      // RLS nedeniyle butik kullanıcılar profiles tablosunu topluca okuyamayabilir.
      // Bu yüzden toptancı vitrin bilgisini public RPC ile tek tek çekiyoruz.
      const entries = await Promise.all(
        ids.map(async (id) => {
          const { data: pubRows, error } = await supabase.rpc(
            "get_wholesaler_public_profile",
            { p_wholesaler_id: id }
          );
          const p = Array.isArray(pubRows) ? pubRows[0] : null;
          if (p && p.is_approved) {
            return {
              id,
              business_name: p.business_name ?? null,
              full_name: p.full_name ?? null,
              productCount: counts.get(id) || 0,
            } as Row;
          }
          // SQL fonksiyonu henüz çalıştırılmadıysa liste tamamen kaybolmasın.
          if (error) {
            return {
              id,
              business_name: null,
              full_name: `Mağaza ${id.slice(0, 6)}`,
              productCount: counts.get(id) || 0,
            } as Row;
          }
          return {
            id,
            business_name: null,
            full_name: null,
            productCount: counts.get(id) || 0,
          } as Row;
        })
      );

      const list: Row[] = entries.filter((r): r is Row => Boolean(r) && r.productCount > 0);

      list.sort(
        (a, b) =>
          b.productCount - a.productCount ||
          (a.business_name || a.full_name || "").localeCompare(
            b.business_name || b.full_name || "",
            "tr"
          )
      );

      setRows(list);
      setLoading(false);
    }
    run();
  }, [supabase]);

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/katalog"
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-anthracite-600 transition hover:text-anthracite-900"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} /> Katalog
          </Link>
          <h1 className="mb-1 text-2xl font-semibold tracking-tight text-anthracite-900 sm:text-3xl">
            Toptancıları gör
          </h1>
          <p className="text-sm text-anthracite-600">
            Bir toptancıyı seçin; sadece o mağazanın ürünlerini görürsünüz.
          </p>
        </div>
        {userId ? (
          <div className="hidden sm:block">
            <NotificationBell userId={userId} />
          </div>
        ) : null}
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm font-medium text-anthracite-400 animate-pulse">
          Yükleniyor…
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-anthracite-200/90 bg-white/60 py-16 text-center">
          <Store className="mx-auto mb-3 h-12 w-12 text-anthracite-300" />
          <p className="text-sm font-medium text-anthracite-600">
            Henüz listelenecek onaylı toptancı yok.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((r) => {
            const name = r.business_name?.trim() || r.full_name?.trim() || "Mağaza";
            const initial = name[0]?.toUpperCase() || "?";
            return (
              <li key={r.id}>
                <Link
                  href={`/toptanci-gor/${r.id}`}
                  className="group flex items-center gap-4 rounded-2xl border border-anthracite-200/80 bg-white p-4 shadow-sm transition hover:border-emerald-200/90 hover:shadow-md sm:p-5"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-xl font-semibold text-white shadow-sm sm:h-16 sm:w-16 sm:text-2xl">
                    {initial}
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <h2 className="truncate text-base font-semibold text-anthracite-900 sm:text-lg">
                      {name}
                    </h2>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-anthracite-500 sm:text-sm">
                      <Package className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                      {r.productCount} ürün
                    </p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-anthracite-900 px-3 py-2 text-xs font-medium text-white transition group-hover:bg-emerald-700 sm:text-sm">
                    Toptancıyı gör
                    <ChevronRight className="h-4 w-4" strokeWidth={2} />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
