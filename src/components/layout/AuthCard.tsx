import type { ReactNode } from "react";

export function AuthCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`w-full max-w-md rounded-3xl border border-anthracite-200/70 bg-white/95 p-6 shadow-md backdrop-blur sm:max-w-lg sm:p-8 ${className}`}
    >
      {children}
    </div>
  );
}
