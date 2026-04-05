import type { ReactNode } from "react";

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f5f4f2] text-anthracite-900">
      <div
        className="pointer-events-none fixed inset-0 opacity-100"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 120% 80% at 50% -30%, rgba(16, 185, 129, 0.06), transparent 55%), radial-gradient(ellipse 60% 40% at 100% 0%, rgba(9, 9, 11, 0.03), transparent 50%)",
        }}
      />
      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">{children}</div>
    </div>
  );
}
