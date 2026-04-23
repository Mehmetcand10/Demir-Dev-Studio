import type { ReactNode } from "react";

export function SiteBackground({ children }: { children: ReactNode }) {
  return <div className="relative min-h-0 flex-1 bg-white text-slate-900">{children}</div>;
}
