export const ORDER_STATUS = {
  WAITING_PAYMENT: "waiting_payment",
  APPROVED: "approved",
  PREPARING: "preparing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export function isProductionActive(status: string) {
  return (
    status === ORDER_STATUS.APPROVED ||
    status === ORDER_STATUS.PREPARING ||
    status === ORDER_STATUS.SHIPPED
  );
}

export function getOrderStatusLabel(status: string) {
  if (status === ORDER_STATUS.WAITING_PAYMENT) return "ÖDEME BEKLİYOR";
  if (status === ORDER_STATUS.APPROVED || status === ORDER_STATUS.PREPARING) return "HAZIRLANIYOR";
  if (status === ORDER_STATUS.SHIPPED) return "KARGODA";
  if (status === ORDER_STATUS.DELIVERED) return "TESLİM EDİLDİ";
  if (status === ORDER_STATUS.CANCELLED) return "İPTAL";
  return "BİLİNMİYOR";
}
