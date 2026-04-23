import { ShieldCheck, Store, Truck, Users } from "lucide-react";

const items = [
  { icon: ShieldCheck, label: "Ödeme disiplini", sub: "Sipariş & onay adımları" },
  { icon: Store, label: "Doğrulanmış tedarik", sub: "Onaylı tedarikçiler" },
  { icon: Truck, label: "Operasyon takibi", sub: "Hazırlık → sevkiyat" },
  { icon: Users, label: "B2B güvence", sub: "Uyuşmazlık & destek" },
] as const;

export function TrustBar() {
  return (
    <div className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-screen-2xl px-3 py-4 sm:px-4 sm:py-5 lg:px-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {items.map(({ icon: Icon, label, sub }) => (
            <div
              key={label}
              className="flex items-start gap-2.5 rounded-lg border border-slate-200/80 bg-white px-3 py-2.5 shadow-sm"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-orange-100 text-orange-700">
                <Icon className="h-4 w-4" strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold leading-tight text-slate-900 sm:text-sm">{label}</p>
                <p className="mt-0.5 text-[10px] leading-tight text-slate-500 sm:text-xs">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
