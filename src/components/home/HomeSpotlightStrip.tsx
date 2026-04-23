"use client";

import Image from "next/image";
import Link from "next/link";
import { Sparkles } from "lucide-react";

type ProductRow = {
  id: string;
  name: string;
  images?: string[] | null;
  base_wholesale_price?: number;
  margin_price?: number;
  min_order_quantity?: number;
};

type Props = {
  products: ProductRow[];
  title: string;
};

function unit(p: ProductRow) {
  return Number(p.base_wholesale_price || 0) + Number(p.margin_price || 0);
}

export function HomeSpotlightStrip({ products, title }: Props) {
  if (products.length === 0) return null;

  return (
    <section className="w-full border-t border-slate-200 bg-white">
      <h2 className="p-8 pb-0 text-2xl font-bold text-slate-900 sm:pb-0">{title}</h2>
      <div className="px-8 pb-2 text-sm text-slate-500">Toptan fiyat (komisyon dahil) · hızlı vitrin</div>
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-8 pt-2 [scrollbar-width:thin] sm:gap-5 sm:px-6 lg:px-8">
        {products.map((p) => {
          const price = unit(p);
          return (
            <Link
              key={p.id}
              href={`/product/${p.id}`}
              className="group w-[200px] shrink-0 snap-start overflow-hidden rounded-lg border border-slate-200 bg-white shadow-md transition hover:scale-[1.03] hover:shadow-xl sm:w-[220px] lg:w-[240px]"
            >
              <div className="relative aspect-[4/5] bg-slate-50 p-2">
                <Image
                  src={p.images?.[0] || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80"}
                  alt={p.name}
                  fill
                  className="object-contain transition duration-300 group-hover:scale-105"
                  sizes="240px"
                />
                <span className="absolute right-1.5 top-1.5 inline-flex items-center gap-0.5 rounded bg-orange-500/95 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                  <Sparkles className="h-2.5 w-2.5" />
                  Fırsat
                </span>
              </div>
              <div className="border-t border-slate-100 p-3">
                <p className="line-clamp-2 min-h-10 text-sm font-bold leading-snug text-slate-900">{p.name}</p>
                <p className="mt-1 text-[11px] font-semibold text-slate-500">MOQ {p.min_order_quantity ?? 0} adet</p>
                <p className="mt-1.5 text-lg font-extrabold tabular-nums text-slate-900">
                  {price.toLocaleString("tr-TR")} <span className="text-sm">₺</span>
                </p>
                <p className="text-xs text-slate-400">/ adet</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
