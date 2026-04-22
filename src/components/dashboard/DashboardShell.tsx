import type { ReactNode } from "react";

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen text-anthracite-900">
      <div
        className="pointer-events-none fixed inset-0 opacity-100"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 130% 90% at 50% -30%, rgba(16, 185, 129, 0.12), transparent 56%), radial-gradient(ellipse 70% 45% at 100% 0%, rgba(59, 130, 246, 0.1), transparent 55%)",
        }}
      />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-20 border-b border-white/40 bg-gradient-to-b from-white/55 to-transparent" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">{children}</div>
    </div>
  );
}
