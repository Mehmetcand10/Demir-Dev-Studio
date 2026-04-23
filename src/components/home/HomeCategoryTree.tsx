import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CATALOG_CATEGORIES } from "@/constants/marketplace";

const treeSections: { label: string; slugs: string[] }[] = [
  { label: "Giyim", slugs: ["Tişört", "Sweatshirt", "Triko", "Pantolon / Jean", "Mont / Kaban", "Elbise / Etek"] },
  { label: "Diğer", slugs: ["İç Çamaşırı / Pijama", "Ayakkabı / Sneaker", "Aksesuar"] },
];

/** div tabanli yapi: CSS yuklenmese de madde imi cikmaz; SW cache sorunlarina karsi guvenli */
export function HomeCategoryTree() {
  return (
    <nav
      className="w-full max-w-[280px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
      aria-label="Kategori menüsü"
    >
      <p className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-600">
        Tüm kategoriler
      </p>
      <div className="max-h-[min(70vh,480px)] overflow-y-auto py-1 [scrollbar-width:thin]">
        <div>
          <Link
            href="/katalog"
            className="flex items-center justify-between gap-1 px-3 py-2.5 text-sm font-semibold text-slate-800 hover:bg-orange-50 hover:text-orange-700"
          >
            Tüm ürünler
            <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
          </Link>
        </div>
        {treeSections.map((section) => (
          <div key={section.label} className="border-t border-slate-100">
            <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">{section.label}</p>
            <div className="flex flex-col">
              {section.slugs
                .filter((s) => (CATALOG_CATEGORIES as readonly string[]).includes(s))
                .map((cat) => (
                  <Link
                    key={cat}
                    href={`/katalog?${new URLSearchParams({ category: cat }).toString()}`}
                    className="flex items-center justify-between gap-1 px-3 py-1.5 pl-4 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  >
                    {cat}
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                  </Link>
                ))}
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
}
