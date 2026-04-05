import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

/** Ana içerik kartı — yuvarlak köşe, ince çerçeve */
export function DashboardPanel({ children, className = "" }: Props) {
  return (
    <div
      className={`rounded-2xl border border-anthracite-200/70 bg-white p-6 shadow-sm sm:p-8 ${className}`}
    >
      {children}
    </div>
  );
}
