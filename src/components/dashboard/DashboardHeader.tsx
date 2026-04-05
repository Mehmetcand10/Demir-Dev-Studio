import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  right?: ReactNode;
};

export function DashboardHeader({ icon: Icon, eyebrow, title, right }: Props) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="mb-2 inline-flex items-center gap-2 rounded-md border border-emerald-200/60 bg-emerald-50/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-800">
          <Icon className="h-3.5 w-3.5 text-emerald-600" strokeWidth={2} />
          {eyebrow}
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-anthracite-900 sm:text-3xl">{title}</h1>
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}
