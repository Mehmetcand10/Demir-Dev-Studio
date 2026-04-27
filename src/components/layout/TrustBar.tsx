import { ShieldCheck, Store, Truck, Users } from "lucide-react";

const items = [
  { icon: ShieldCheck, label: "Odeme disiplini", sub: "Siparis ve onay adimlari" },
  { icon: Store, label: "Dogrulanmis tedarik", sub: "Sadece onayli tedarikciler" },
  { icon: Truck, label: "Operasyon takibi", sub: "Hazirliktan sevkiyata" },
  { icon: Users, label: "B2B guvence", sub: "Uyusmazlik ve destek" },
] as const;

export function TrustBar() {
  return (
    <section className="relative overflow-hidden border-t border-slate-200 bg-gradient-to-b from-white to-slate-50">
      <div className="mx-auto max-w-screen-2xl px-3 py-4 sm:px-4 lg:px-6">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-2 shadow-sm sm:p-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {items.map(({ icon: Icon, label, sub }) => (
              <article
                key={label}
                className="group flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5 transition hover:border-blue-200 hover:bg-blue-50/70"
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700 ring-1 ring-blue-200/80 transition group-hover:bg-blue-600 group-hover:text-white group-hover:ring-blue-600">
                  <Icon className="h-4 w-4" strokeWidth={2} />
                </span>
                <span className="min-w-0">
                  <p className="text-xs font-bold leading-tight text-slate-900 sm:text-sm">{label}</p>
                  <p className="mt-0.5 text-[11px] leading-tight text-slate-500">{sub}</p>
                </span>
              </article>
            ))}
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-300/50 to-transparent" />
      <div
        className="pointer-events-none absolute inset-x-0 -bottom-5 h-12"
        aria-hidden
        style={{
          background:
            "radial-gradient(60% 70% at 50% 0%, rgba(59,130,246,0.14) 0%, rgba(59,130,246,0.05) 42%, rgba(59,130,246,0) 100%)",
        }}
      />
    </section>
  );
}
