import Link from "next/link";
import type { ReactNode } from "react";
import { MessageCircle } from "lucide-react";
import { getSitePublicContact } from "@/utils/siteContact";

const legalClass =
  "font-medium text-anthracite-500 hover:text-emerald-700 hover:underline";

function FooterLegalLink({ href, children }: { href: string; children: ReactNode }) {
  if (href.startsWith("http://") || href.startsWith("https://")) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={legalClass}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={legalClass}>
      {children}
    </Link>
  );
}

export default function SiteFooter() {
  const c = getSitePublicContact();

  return (
    <footer className="mt-auto border-t border-anthracite-200/70 bg-white/88 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="premium-soft flex flex-col items-center gap-4 px-4 py-5 text-center shadow-sm sm:gap-5 sm:px-5">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-anthracite-600 sm:text-sm">
            <a
              href={c.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-medium text-emerald-800 transition hover:text-emerald-900 hover:underline"
            >
              <MessageCircle className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
              Siparis WhatsApp {c.whatsappDisplay}
            </a>
            {c.supportEmailHref ? (
              <>
                <span className="hidden text-anthracite-300 sm:inline" aria-hidden>
                  |
                </span>
                <a href={c.supportEmailHref} className="font-medium hover:text-anthracite-900 hover:underline">
                  {c.supportEmail}
                </a>
              </>
            ) : null}
            {c.supportPhoneDisplay ? (
              <>
                <span className="hidden text-anthracite-300 sm:inline" aria-hidden>
                  |
                </span>
                {c.supportPhoneHref ? (
                  <a href={c.supportPhoneHref} className="font-medium hover:text-anthracite-900 hover:underline">
                    {c.supportPhoneDisplay}
                  </a>
                ) : (
                  <span className="font-medium">{c.supportPhoneDisplay}</span>
                )}
              </>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs">
            <FooterLegalLink href={c.kvkkHref}>KVKK</FooterLegalLink>
            <span className="text-anthracite-300" aria-hidden>
              ·
            </span>
            <FooterLegalLink href={c.mesafeliHref}>Mesafeli satis</FooterLegalLink>
            <span className="text-anthracite-300" aria-hidden>
              ·
            </span>
            <Link href="/yardim" className={legalClass}>
              Yardim ve surecler
            </Link>
          </div>

          <p className="text-xs font-medium text-anthracite-500 sm:text-sm">
            Demir Dev Studio © {new Date().getFullYear()} · Verified B2B Commerce Network
          </p>
        </div>
      </div>
    </footer>
  );
}
