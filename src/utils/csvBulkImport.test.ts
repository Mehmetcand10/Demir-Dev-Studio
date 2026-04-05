import { describe, it, expect } from "vitest";
import {
  parseBulkCsv,
  rowsFromParsed,
  parseBulkProductRow,
  BULK_CSV_HEADER,
  buildBulkTemplateCsvTr,
  normalizeHeaderKey,
} from "./csvBulkImport";

describe("csvBulkImport", () => {
  it("parses English comma CSV", () => {
    const matrix = parseBulkCsv(`${BULK_CSV_HEADER}\nA,Tişört,Unisex,Pamuk,,100,2,1,0,0,0,https://x.test/a.png,3`);
    const { header, dataRows } = rowsFromParsed(matrix);
    expect(header[0]).toBe("name");
    expect(dataRows).toHaveLength(1);
    const r = parseBulkProductRow(header, dataRows[0], 0);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.row.name).toBe("A");
      expect(r.row.stocks.S).toBe(1);
      expect(r.row.low_stock_threshold).toBe(3);
    }
  });

  it("parses Turkish semicolon CSV (Excel TR)", () => {
    const csv =
      "urun_adi;kategori;cinsiyet;kumas;gsm;fiyat;moq;s;m;l;xl;gorsel_url;dusuk_stok\n" +
      "Test Urun;Tisort;Unisex;Pamuk;;199;4;5;0;0;0;https://x.test/b.png;3";
    const matrix = parseBulkCsv(csv);
    const { header, dataRows } = rowsFromParsed(matrix);
    expect(header.includes("name")).toBe(true);
    expect(header.includes("image_urls")).toBe(true);
    const r = parseBulkProductRow(header, dataRows[0], 0);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.row.name).toBe("Test Urun");
      expect(r.row.base_wholesale_price).toBe(199);
      expect(r.row.stocks.S).toBe(5);
    }
  });

  it("TR template builds with semicolons", () => {
    const t = buildBulkTemplateCsvTr();
    expect(t.includes(";")).toBe(true);
    expect(t.includes("urun_adi")).toBe(true);
  });

  it("normalizes Turkish headers", () => {
    expect(normalizeHeaderKey("Ürün Adı")).toBe("name");
    expect(normalizeHeaderKey("görsel_url")).toBe("image_urls");
  });
});
