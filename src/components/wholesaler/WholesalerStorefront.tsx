"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Package, ShoppingBag, MapPin, Star, ArrowLeft, ShieldAlert } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80";

type Props = {
  wholesalerId: string;
  /** Geri linki: katalog veya toptancı listesi */
  backHref?: string;
  backLabel?: string;
};

export default function WholesalerStorefront({
  wholesalerId,
  backHref = "/katalog",
  backLabel = "Katalog",
}: Props) {
  const supabase = createClient();
  const [products, setProducts] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!wholesalerId) return;

      const { data: pubRows, error: pubErr } = await supabase.rpc(
        "get_wholesaler_public_profile",
        { p_wholesaler_id: wholesalerId }
      );
      let prof: any = null;
      if (!pubErr && Array.isArray(pubRows) && pubRows[0]) {
        prof = { ...pubRows[0], role: "toptanci" };
      } else {
        const { data: direct } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", wholesalerId)
          .single();
        prof = direct;
      }
      setProfile(prof);

      const { data: prods } = await supabase
        .from("products")
        .select("*")
        .eq("wholesaler_id", wholesalerId)
        .order("created_at", { ascending: false });

      if (prods) setProducts(prods);
      setLoading(false);
    }
    fetchData();
  }, [wholesalerId, supabase]);

  if (loading) {
    return (
      <div className="py-24 text-center text-sm font-medium text-anthracite-400 animate-pulse">
        Yükleniyor…
      </div>
    );
  }

  if (!profile || profile.role !== "toptanci") {
    return (
      <div className="py-24 text-center text-sm font-medium text-red-600">
        Toptancı bulunamadı.
      </div>
    );
  }

  if (!profile.is_approved) {
    return (
      <div className="py-24 text-center text-sm font-medium text-anthracite-600">
        Bu mağaza henüz vitrine açılmadı.
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mb-10">
        <Link
          href={backHref}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-anthracite-600 transition hover:text-anthracite-900"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} /> {backLabel}
        </Link>

        <div className="relative flex flex-col items-center gap-6 overflow-hidden rounded-2xl border border-anthracite-200/70 bg-white p-6 shadow-sm sm:flex-row sm:gap-8 sm:p-8">
          <div className="absolute -right-16 -top-16 opacity-[0.04]">
            <Package className="h-64 w-64" strokeWidth={1} />
          </div>

          <div className="relative z-10 flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-3xl font-semibold text-white shadow-sm sm:h-28 sm:w-28 sm:text-4xl">
            {profile.business_name?.[0] || profile.full_name?.[0] || "?"}
          </div>

          <div className="relative z-10 flex-1 text-center md:text-left">
            <div className="mb-3 flex flex-wrap items-center justify-center gap-2 md:justify-start">
              <span className="rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-medium text-emerald-800">
                Onaylı üretici
              </span>
              <div className="flex items-center gap-1 rounded-full border border-amber-100 bg-amber-50 px-2.5 py-0.5 text-[10px] font-medium text-amber-800">
                <Star className="h-3 w-3 fill-current" /> Satıcı
              </div>
            </div>
            <h1 className="mb-2 break-words text-2xl font-semibold leading-tight tracking-tight text-anthracite-900 sm:text-3xl">
              {profile.business_name || profile.full_name}
            </h1>
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-anthracite-600 md:justify-start">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-emerald-600" strokeWidth={2} />{" "}
                Merter / İstanbul
              </div>
              <div className="flex items-center gap-1.5">
                <Package className="h-4 w-4 text-emerald-600" strokeWidth={2} />{" "}
                {products.length} ürün
              </div>
            </div>
            {typeof profile.min_order_floor_units === "number" &&
              profile.min_order_floor_units > 0 && (
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200/90 bg-amber-50/90 px-3 py-2.5 text-left text-xs text-amber-950 sm:text-sm">
                  <ShieldAlert
                    className="mt-0.5 h-4 w-4 shrink-0 text-amber-700"
                    strokeWidth={2}
                  />
                  <span>
                    Bu mağaza{" "}
                    <strong className="font-semibold">
                      tek siparişte en az {profile.min_order_floor_units} adet
                    </strong>{" "}
                    kabul ediyor (mağaza politikası).
                  </span>
                </div>
              )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-2 border-b border-anthracite-200/80 pb-4">
          <h2 className="text-lg font-semibold text-anthracite-900 sm:text-xl">
            Ürünler ({products.length})
          </h2>
          <p className="text-xs text-anthracite-500 sm:text-sm">
            Sadece bu toptancının vitrini
          </p>
        </div>

        {products.length === 0 ? (
          <div className="py-16 text-center text-sm text-anthracite-500">
            Bu mağazada henüz ürün yok.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
            {products.map((p) => {
              const displayedPrice =
                Number(p.base_wholesale_price) + Number(p.margin_price || 0);
              const img =
                p.images?.[0] && String(p.images[0]).trim()
                  ? p.images[0]
                  : PLACEHOLDER;
              return (
                <div
                  key={p.id}
                  className="group overflow-hidden rounded-xl border border-anthracite-200/70 bg-white shadow-sm transition hover:border-anthracite-300/80 hover:shadow-md sm:rounded-2xl"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-anthracite-50 sm:aspect-[5/6]">
                    <Image
                      src={img}
                      alt={p.name}
                      fill
                      sizes="(max-width: 640px) 50vw, 20vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-2.5 text-left sm:p-3">
                    <h3 className="mb-1 line-clamp-2 text-xs font-bold leading-snug text-anthracite-900 sm:text-sm">
                      {p.name}
                    </h3>
                    <div className="mb-2 flex flex-wrap gap-1">
                      <span className="rounded border border-emerald-100 bg-emerald-50 px-1.5 py-0.5 text-[7px] font-bold uppercase text-emerald-700 sm:text-[8px]">
                        {p.gender}
                      </span>
                      <span className="max-w-[5rem] truncate rounded bg-anthracite-50 px-1.5 py-0.5 text-[7px] font-bold uppercase text-anthracite-500 sm:text-[8px]">
                        {p.category}
                      </span>
                    </div>

                    <div className="flex items-end justify-between gap-1 border-t border-anthracite-100/80 pt-2">
                      <div className="flex min-w-0 flex-col">
                        <span className="text-[8px] font-bold uppercase text-anthracite-400">
                          B2B
                        </span>
                        <span className="text-sm font-semibold tabular-nums text-anthracite-900 sm:text-base">
                          {(
                            displayedPrice * parseInt(p.min_order_quantity, 10)
                          ).toLocaleString("tr-TR")}{" "}
                          ₺
                        </span>
                      </div>
                      <Link
                        href={`/product/${p.id}`}
                        className="shrink-0 rounded-lg bg-anthracite-900 p-2 text-white shadow-sm sm:rounded-xl"
                      >
                        <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
