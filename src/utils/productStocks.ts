/** Eski ürünlerde stok yoksa siparişe izin vermek için sanal stok tavanı */
export const FALLBACK_STOCK_QTY = 999_999;

export const FALLBACK_SIZE_KEY = "Standart";

export type ProductLike = {
  stocks?: Record<string, unknown> | null;
  sizes?: string | null;
};

/**
 * Siparişe açık beden → adet haritası.
 * Gerçek stok satırı yoksa veya hepsi 0 ise tek satır fallback (Standart veya sizes etiketi).
 */
export function getOrderableStocks(product: ProductLike): Record<string, number> {
  const raw =
    product.stocks && typeof product.stocks === "object" && !Array.isArray(product.stocks)
      ? (product.stocks as Record<string, unknown>)
      : {};

  const positive: Record<string, number> = {};
  for (const [k, v] of Object.entries(raw)) {
    const key = String(k).trim();
    if (!key) continue;
    const n = Number(v);
    if (n > 0) positive[key] = n;
  }
  if (Object.keys(positive).length > 0) return positive;

  const fromSizes = product.sizes && String(product.sizes).trim();
  const label = fromSizes ? String(fromSizes).trim().slice(0, 48) : FALLBACK_SIZE_KEY;
  return { [label.length > 0 ? label : FALLBACK_SIZE_KEY]: FALLBACK_STOCK_QTY };
}

export function hasPositiveStockLine(stocksJson: Record<string, number>): boolean {
  return Object.values(stocksJson).some((q) => Number(q) > 0);
}

/** Gerçek stokta en az bir pozitif satır yok mu (fallback devrede) */
export function usesFallbackStocks(product: ProductLike): boolean {
  const raw =
    product.stocks && typeof product.stocks === "object" && !Array.isArray(product.stocks)
      ? (product.stocks as Record<string, unknown>)
      : {};
  return !Object.entries(raw).some(([, v]) => Number(v) > 0);
}

export type ProductWithThreshold = ProductLike & { low_stock_threshold?: number | null };

/** Gerçek stok satırlarının toplamı (fallback modda büyük sayı döner). */
export function totalStockUnits(product: ProductWithThreshold): number {
  if (usesFallbackStocks(product)) return FALLBACK_STOCK_QTY;
  const raw =
    product.stocks && typeof product.stocks === "object" && !Array.isArray(product.stocks)
      ? (product.stocks as Record<string, unknown>)
      : {};
  return Object.values(raw).reduce((acc: number, v) => acc + Math.max(0, Number(v) || 0), 0);
}

export function getLowStockThreshold(product: ProductWithThreshold): number {
  const t = product.low_stock_threshold;
  if (t === null || t === undefined || Number.isNaN(Number(t))) return 5;
  return Math.max(0, Math.floor(Number(t)));
}

export function isLowStockProduct(product: ProductWithThreshold): boolean {
  if (usesFallbackStocks(product)) return false;
  return totalStockUnits(product) <= getLowStockThreshold(product);
}
