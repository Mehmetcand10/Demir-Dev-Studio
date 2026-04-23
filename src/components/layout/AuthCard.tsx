import type { ReactNode } from "react";

export function AuthCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`w-full max-w-md rounded-lg border border-anthracite-200 bg-white p-6 shadow-sm sm:max-w-lg sm:p-9 ${className}`}
    >
      {children}
    </div>
  );
}
