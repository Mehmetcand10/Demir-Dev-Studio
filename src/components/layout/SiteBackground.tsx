import type { ReactNode } from "react";

/** Subtle page backdrop aligned with dashboard (#f5f4f2 + light radial accents). */
export function SiteBackground({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-0 flex-1 bg-[#f5f4f2] text-anthracite-900">
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 120% 80% at 50% -25%, rgba(16, 185, 129, 0.055), transparent 55%), radial-gradient(ellipse 55% 35% at 100% 0%, rgba(9, 9, 11, 0.025), transparent 50%)",
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
