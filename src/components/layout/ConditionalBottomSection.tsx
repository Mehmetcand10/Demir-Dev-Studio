"use client";

import { usePathname } from "next/navigation";
import SiteFooter from "@/components/layout/SiteFooter";
import { TrustBar } from "@/components/layout/TrustBar";

/**
 * Footer + trust strip only on homepage and catalog pages.
 */
export function ConditionalBottomSection() {
  const pathname = usePathname();
  const showBottom = pathname === "/" || pathname === "/katalog";

  if (!showBottom) return null;

  return (
    <div className="no-print">
      <TrustBar />
      <SiteFooter />
    </div>
  );
}
