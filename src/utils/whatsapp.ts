/**
 * Ülke kodu dahil, sadece rakamlar (örn: 905551234567).
 * .env.local: NEXT_PUBLIC_WHATSAPP_E164=905551234567
 */
export function getWhatsAppOrderDigits(): string {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_E164 || "905528323906";
  return String(raw).replace(/\D/g, "") || "905528323906";
}
