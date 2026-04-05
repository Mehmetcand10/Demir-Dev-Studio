import type { ReactNode } from "react";

export function AuthCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`w-full max-w-md rounded-2xl border border-anthracite-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-sm sm:max-w-lg sm:p-8 ${className}`}
    >
      {children}
    </div>
  );
}
