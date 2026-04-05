/**
 * Genel iletişim ve yasal linkler (NEXT_PUBLIC_* — istemci bileşenlerinde de kullanılabilir).
 * Canlıda .env / hosting ortamında değerleri güncelleyin.
 */

function digitsOnly(s: string): string {
  return String(s).replace(/\D/g, "");
}

/** wa.me için ülke kodu dahil rakamlar */
export function getWhatsAppOrderDigits(): string {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_E164 || "905528323906";
  const d = digitsOnly(raw);
  return d || "905528323906";
}

/** Görüntüleme: +90 555 123 45 67 (12 hane 90…) */
export function formatWhatsAppDisplay(digits: string): string {
  const d = digitsOnly(digits);
  if (d.startsWith("90") && d.length === 12) {
    return `+90 ${d.slice(2, 5)} ${d.slice(5, 8)} ${d.slice(8, 10)} ${d.slice(10, 12)}`;
  }
  if (d.length > 0) return `+${d}`;
  return "";
}

export type SitePublicContact = {
  whatsappDigits: string;
  whatsappDisplay: string;
  whatsappHref: string;
  supportEmail: string;
  supportEmailHref: string | null;
  supportPhoneDisplay: string;
  supportPhoneHref: string | null;
  kvkkHref: string;
  mesafeliHref: string;
};

export function getSitePublicContact(): SitePublicContact {
  const whatsappDigits = getWhatsAppOrderDigits();
  const whatsappDisplay = formatWhatsAppDisplay(whatsappDigits);
  const whatsappHref = `https://wa.me/${whatsappDigits}`;

  const supportEmail = (process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "").trim();
  const supportEmailHref = supportEmail ? `mailto:${supportEmail}` : null;

  const supportPhoneDisplay = (process.env.NEXT_PUBLIC_SUPPORT_PHONE || "").trim();
  const phoneDigits = digitsOnly(supportPhoneDisplay);
  const supportPhoneHref =
    phoneDigits.length >= 10 ? `tel:+${phoneDigits}` : null;

  const kvkkExternal = (process.env.NEXT_PUBLIC_KVKK_URL || "").trim();
  const mesafeliExternal = (process.env.NEXT_PUBLIC_MESAFELI_SATIS_URL || "").trim();

  return {
    whatsappDigits,
    whatsappDisplay,
    whatsappHref,
    supportEmail,
    supportEmailHref,
    supportPhoneDisplay,
    supportPhoneHref,
    kvkkHref: kvkkExternal || "/kvkk",
    mesafeliHref: mesafeliExternal || "/mesafeli-satis",
  };
}
