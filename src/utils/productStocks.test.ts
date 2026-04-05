import { describe, it, expect } from "vitest";
import {
  getOrderableStocks,
  hasPositiveStockLine,
  usesFallbackStocks,
  FALLBACK_STOCK_QTY,
} from "./productStocks";

describe("productStocks", () => {
  it("getOrderableStocks uses positive rows when present", () => {
    const m = getOrderableStocks({ stocks: { S: 2, M: 0, L: 1 } });
    expect(m).toEqual({ S: 2, L: 1 });
  });

  it("getOrderableStocks fallback when empty", () => {
    const m = getOrderableStocks({ stocks: {}, sizes: null });
    expect(m.Standart).toBe(FALLBACK_STOCK_QTY);
  });

  it("getOrderableStocks fallback uses sizes label", () => {
    const m = getOrderableStocks({ stocks: { S: 0 }, sizes: "Tek Seri" });
    expect(m["Tek Seri"]).toBe(FALLBACK_STOCK_QTY);
  });

  it("hasPositiveStockLine", () => {
    expect(hasPositiveStockLine({ A: 0, B: 1 })).toBe(true);
    expect(hasPositiveStockLine({ A: 0 })).toBe(false);
  });

  it("usesFallbackStocks", () => {
    expect(usesFallbackStocks({ stocks: {} })).toBe(true);
    expect(usesFallbackStocks({ stocks: { S: 1 } })).toBe(false);
    expect(usesFallbackStocks({ stocks: { S: 0 } })).toBe(true);
  });
});
