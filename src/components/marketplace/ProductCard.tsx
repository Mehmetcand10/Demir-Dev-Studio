"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Lock } from "lucide-react";
import { Badge } from "@/components/design-system";
import { cn } from "@/lib/cn";

type Product = {
  id: string;
  name: string;
  images?: string[] | null;
  category?: string;
  gender?: string;
  min_order_quantity?: number;
  wholesaler_id: string;
  base_wholesale_price?: number;
  margin_price?: number;
};

type Props = {
  product: Product;
  displayPrice: number;
  isApproved: boolean;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
};

export function ProductCard({ product, displayPrice, isApproved, isFavorite, onToggleFavorite }: Props) {
  const refRetail = Math.round(displayPrice * 1.22);

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition",
        "hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
      )}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-slate-50 p-3">
        <Image
          src={product.images?.[0] || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80"}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
          className="object-contain transition duration-300 group-hover:scale-[1.02]"
        />
        <div className="absolute right-2 top-2">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onToggleFavorite(product.id);
            }}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/95 shadow-sm transition hover:bg-slate-50",
              isFavorite && "border-rose-200 bg-rose-50 text-rose-600"
            )}
            aria-label={isFavorite ? "Favorilerden çıkar" : "Favorilere ekle"}
          >
            <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
          </button>
        </div>
        {!isApproved && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/60 p-2 backdrop-blur-[1px]">
            <Lock className="mb-1 h-8 w-8 text-white" />
            <span className="rounded bg-black/50 px-2 py-1 text-center text-[10px] font-semibold text-white">Onay bekleniyor</span>
          </div>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col p-3 sm:p-4">
        <h3 className="line-clamp-2 min-h-0 text-sm font-semibold leading-snug text-slate-900 sm:text-base">{product.name}</h3>
        <Link
          href={`/toptanci-gor/${product.wholesaler_id}`}
          className="mt-1 block truncate text-[11px] font-semibold uppercase tracking-wide text-blue-700 hover:underline sm:text-xs"
        >
          Tedarikçi mağazası
        </Link>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge variant="stock">MOQ {product.min_order_quantity ?? 0} adet</Badge>
          {product.gender && <Badge>{product.gender}</Badge>}
        </div>

        <div className="mt-auto border-t border-slate-100 pt-3">
          {isApproved ? (
            <div className="flex items-end justify-between gap-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Birim fiyat (KDV+komisyon dahil)</p>
                <p className="text-xl font-extrabold tabular-nums text-slate-900 sm:text-2xl">
                  {displayPrice.toLocaleString("tr-TR")} <span className="text-sm font-bold text-slate-600">₺</span>
                </p>
                <p className="text-xs text-slate-400 line-through">Perakende ref: {refRetail.toLocaleString("tr-TR")} ₺</p>
              </div>
              <Link
                href={`/product/${product.id}`}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-blue-600 text-white shadow-sm transition hover:bg-blue-700"
                title="Detay & sepete ekle"
                aria-label="Ürüne git"
              >
                <ShoppingBag className="h-5 w-5" />
              </Link>
            </div>
          ) : (
            <p className="text-center text-xs font-bold uppercase text-slate-400">Fiyatlar için giriş</p>
          )}
        </div>
      </div>
    </article>
  );
}
