import type { ReactNode } from "react";

/** Subtle page backdrop aligned with dashboard (#f5f4f2 + light radial accents). */
export function SiteBackground({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-0 flex-1 text-anthracite-900">
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 130% 90% at 50% -28%, rgba(16, 185, 129, 0.12), transparent 58%), radial-gradient(ellipse 70% 45% at 100% 0%, rgba(59, 130, 246, 0.1), transparent 56%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-20 border-b border-white/45 bg-gradient-to-b from-white/40 to-transparent"
        aria-hidden
      />
      <div className="relative">{children}</div>
    </div>
  );
}
