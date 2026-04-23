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
    <div className="mb-10 flex flex-wrap items-start justify-between gap-4 border-b border-anthracite-200 pb-6">
      <div className="min-w-0">
        <p className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-anthracite-500">
          <Icon className="h-3.5 w-3.5 text-sky-600" strokeWidth={2} />
          {eyebrow}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-anthracite-900 sm:text-3xl">{title}</h1>
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}
