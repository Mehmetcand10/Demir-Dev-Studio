const STORAGE_KEY = "demirdev_recent_products_v1";
const MAX_ITEMS = 12;

export function pushRecentProductId(productId: string) {
  if (typeof window === "undefined" || !productId) return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    let list: string[] = raw ? (JSON.parse(raw) as string[]) : [];
    list = [productId, ...list.filter((id) => id !== productId)].slice(0, MAX_ITEMS);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

export function getRecentProductIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as string[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}
