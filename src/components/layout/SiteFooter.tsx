import Link from "next/link";
import type { ReactNode } from "react";
import { MessageCircle } from "lucide-react";
import { getSitePublicContact } from "@/utils/siteContact";

const legalClass = "text-sm text-slate-500 transition hover:text-blue-600 hover:underline";

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
    <footer className="mt-auto border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-screen-2xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">Demir Dev Studio</p>
            <p className="mt-1 max-w-sm text-sm leading-relaxed text-slate-600">
              Toptancı ve butikler için açık, izlenebilir B2B sipariş ağı. Ödeme ve operasyon adımları yönetim
              denetiminde ilerler.
            </p>
          </div>
            <div className="text-sm">
              <p className="font-medium text-slate-900">Hızlı linkler</p>
              <ul className="mt-2 space-y-1.5">
                <li>
                  <Link href="/katalog" className="text-slate-600 hover:text-blue-600">
                    Katalog
                  </Link>
                </li>
                <li>
                  <Link href="/toptanci-gor" className="text-slate-600 hover:text-blue-600">
                    Toptancılar
                  </Link>
                </li>
                <li>
                  <Link href="/yardim" className="text-slate-600 hover:text-blue-600">
                    Yardım
                  </Link>
                </li>
              </ul>
            </div>
            <div className="text-sm">
              <p className="font-medium text-slate-900">İletişim</p>
              <div className="mt-2 space-y-1.5 text-slate-600">
                <a
                  href={c.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-slate-700 transition hover:text-blue-600"
                >
                  <MessageCircle className="h-4 w-4 shrink-0" strokeWidth={2} />
                  WhatsApp: {c.whatsappDisplay}
                </a>
                {c.supportEmailHref ? (
                  <a href={c.supportEmailHref} className="block transition hover:text-blue-600 hover:underline">
                    {c.supportEmail}
                  </a>
                ) : null}
                {c.supportPhoneDisplay ? (
                  c.supportPhoneHref ? (
                    <a href={c.supportPhoneHref} className="block transition hover:text-blue-600 hover:underline">
                      {c.supportPhoneDisplay}
                    </a>
                  ) : (
                    <span>{c.supportPhoneDisplay}</span>
                  )
                ) : null}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Yasal</p>
              <ul className="mt-2 space-y-1.5">
                <li>
                  <FooterLegalLink href={c.kvkkHref}>KVKK</FooterLegalLink>
                </li>
                <li>
                  <FooterLegalLink href={c.mesafeliHref}>Mesafeli satış</FooterLegalLink>
                </li>
                <li>
                  <Link href="/yardim" className={legalClass}>
                    Yardım ve süreçler
                  </Link>
                </li>
              </ul>
            </div>
        </div>
        <p className="mt-8 border-t border-slate-200 pt-6 text-center text-xs text-slate-500 sm:text-left">
          © {new Date().getFullYear()} Demir Dev Studio. B2B ticaret ağı.
        </p>
      </div>
    </footer>
  );
}
