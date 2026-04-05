import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type DashboardTabItem = {
  id: string;
  label: ReactNode;
  icon?: LucideIcon;
};

type Props = {
  items: DashboardTabItem[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
};

export function DashboardTabs({ items, value, onChange, className = "" }: Props) {
  return (
    <div
      className={`sticky top-0 z-40 -mx-4 mb-8 border-b border-anthracite-200/40 bg-[#f5f4f2]/85 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 ${className}`}
    >
      <div className="flex flex-wrap gap-1 rounded-lg bg-anthracite-200/30 p-1">
        {items.map((item) => {
          const active = value === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-medium transition-all ${
                active
                  ? "bg-white text-anthracite-900 shadow-sm ring-1 ring-anthracite-200/70"
                  : "text-anthracite-500 hover:bg-white/60 hover:text-anthracite-800"
              }`}
            >
              {Icon ? <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" strokeWidth={2} /> : null}
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
