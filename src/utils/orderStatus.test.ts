import { describe, it, expect } from "vitest";
import { ORDER_STATUS, getOrderStatusLabel, isProductionActive } from "./orderStatus";

describe("orderStatus", () => {
  it("getOrderStatusLabel covers core states", () => {
    expect(getOrderStatusLabel(ORDER_STATUS.WAITING_PAYMENT)).toBe("ÖDEME BEKLİYOR");
    expect(getOrderStatusLabel(ORDER_STATUS.PREPARING)).toBe("HAZIRLANIYOR");
    expect(getOrderStatusLabel(ORDER_STATUS.APPROVED)).toBe("HAZIRLANIYOR");
    expect(getOrderStatusLabel(ORDER_STATUS.SHIPPED)).toBe("KARGODA");
    expect(getOrderStatusLabel(ORDER_STATUS.DELIVERED)).toBe("TESLİM EDİLDİ");
    expect(getOrderStatusLabel(ORDER_STATUS.CANCELLED)).toBe("İPTAL");
  });

  it("isProductionActive", () => {
    expect(isProductionActive(ORDER_STATUS.PREPARING)).toBe(true);
    expect(isProductionActive(ORDER_STATUS.SHIPPED)).toBe(true);
    expect(isProductionActive(ORDER_STATUS.WAITING_PAYMENT)).toBe(false);
    expect(isProductionActive(ORDER_STATUS.DELIVERED)).toBe(false);
  });
});
