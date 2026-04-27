import Link from "next/link";
import type { ReactNode } from "react";
import { MessageCircle, Mail, PhoneCall } from "lucide-react";
import { getSitePublicContact } from "@/utils/siteContact";

const legalClass =
  "text-sm text-slate-300/90 transition hover:text-white hover:underline underline-offset-4";

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
    <footer className="relative mt-auto border-t border-slate-900/80 bg-slate-900 text-slate-100">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24"
        aria-hidden
        style={{
          background:
            "radial-gradient(70% 90% at 50% 0%, rgba(59,130,246,0.2) 0%, rgba(59,130,246,0.06) 42%, rgba(15,23,42,0) 100%)",
        }}
      />
      <div className="mx-auto max-w-screen-2xl px-3 pb-6 pt-7 sm:px-4 sm:pt-8 lg:px-6">
        <div className="relative overflow-hidden rounded-2xl border border-slate-700/70 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-5 shadow-2xl shadow-slate-950/20 sm:p-6">
          <div
            className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full blur-3xl"
            aria-hidden
            style={{ background: "rgba(59,130,246,0.16)" }}
          />
          <div
            className="pointer-events-none absolute -left-10 -bottom-10 h-36 w-36 rounded-full blur-3xl"
            aria-hidden
            style={{ background: "rgba(251,146,60,0.14)" }}
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <section>
              <div className="inline-flex items-center gap-3 rounded-xl border border-slate-700/80 bg-slate-800/70 px-3 py-2 shadow-sm">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-black tracking-wide text-white">
                  DD
                </span>
                <span className="text-base font-semibold text-white">Demir Dev Studio</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                Toptanci ve butikler icin guvenli, izlenebilir B2B siparis agi. Odeme ve operasyon adimlari yonetim
                denetiminde ilerler.
              </p>
            </section>

            <section>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-200">Hizli linkler</p>
              <ul className="mt-2 space-y-1.5">
                <li>
                  <Link href="/katalog" className={legalClass}>
                    Katalog
                  </Link>
                </li>
                <li>
                  <Link href="/toptanci-gor" className={legalClass}>
                    Toptancilar
                  </Link>
                </li>
                <li>
                  <Link href="/yardim" className={legalClass}>
                    Yardim
                  </Link>
                </li>
              </ul>
            </section>

            <section>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-200">Iletisim</p>
              <div className="mt-2 space-y-2 text-sm text-slate-300">
                <a
                  href={c.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 transition hover:text-white"
                >
                  <MessageCircle className="h-4 w-4 text-emerald-400" strokeWidth={2} />
                  WhatsApp: {c.whatsappDisplay}
                </a>
                {c.supportEmailHref ? (
                  <a href={c.supportEmailHref} className="flex items-center gap-2 transition hover:text-white">
                    <Mail className="h-4 w-4 text-blue-300" strokeWidth={2} />
                    {c.supportEmail}
                  </a>
                ) : null}
                {c.supportPhoneDisplay ? (
                  c.supportPhoneHref ? (
                    <a href={c.supportPhoneHref} className="flex items-center gap-2 transition hover:text-white">
                      <PhoneCall className="h-4 w-4 text-orange-300" strokeWidth={2} />
                      {c.supportPhoneDisplay}
                    </a>
                  ) : (
                    <span className="flex items-center gap-2">
                      <PhoneCall className="h-4 w-4 text-orange-300" strokeWidth={2} />
                      {c.supportPhoneDisplay}
                    </span>
                  )
                ) : null}
              </div>
            </section>

            <section>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-200">Yasal</p>
              <ul className="mt-2 space-y-1.5">
                <li>
                  <FooterLegalLink href={c.kvkkHref}>KVKK</FooterLegalLink>
                </li>
                <li>
                  <FooterLegalLink href={c.mesafeliHref}>Mesafeli satis</FooterLegalLink>
                </li>
                <li>
                  <Link href="/yardim" className={legalClass}>
                    Yardim ve surecler
                  </Link>
                </li>
              </ul>
            </section>
          </div>

          <p className="mt-6 border-t border-slate-700 pt-4 text-center text-xs text-slate-400 sm:text-left">
            (c) {new Date().getFullYear()} Demir Dev Studio. B2B ticaret agi.
          </p>
        </div>
      </div>
    </footer>
  );
}
