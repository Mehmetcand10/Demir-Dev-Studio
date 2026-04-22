import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

/** Ana içerik kartı — yuvarlak köşe, ince çerçeve */
export function DashboardPanel({ children, className = "" }: Props) {
  return (
    <div
      className={`premium-card rounded-3xl p-6 sm:p-8 ${className}`}
    >
      {children}
    </div>
  );
}
