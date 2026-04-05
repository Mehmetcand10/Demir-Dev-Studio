/**
 * Sipariş WhatsApp yönlendirmesi — numara `siteContact` ile aynı kaynaktan.
 * .env.local: NEXT_PUBLIC_WHATSAPP_E164=905551234567 (ülke kodu dahil, sadece rakamlar)
 */
export { getWhatsAppOrderDigits } from "@/utils/siteContact";
