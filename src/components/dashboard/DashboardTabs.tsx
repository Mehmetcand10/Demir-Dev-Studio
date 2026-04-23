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
      className={`sticky top-0 z-40 -mx-4 mb-8 border-b border-anthracite-200 bg-[#f8fafc] px-4 py-1 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 ${className}`}
    >
      <div className="flex flex-wrap gap-0">
        {items.map((item) => {
          const active = value === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`inline-flex min-h-[44px] items-center gap-2 border-b-2 px-3 py-2.5 text-left text-sm font-medium transition ${
                active
                  ? "border-sky-600 text-anthracite-900"
                  : "border-transparent text-anthracite-500 hover:text-anthracite-800"
              }`}
            >
              {Icon ? <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} /> : null}
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
