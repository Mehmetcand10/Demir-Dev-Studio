import { describe, it, expect } from "vitest";
import { parseBulkCsv, rowsFromParsed, parseBulkProductRow, BULK_CSV_HEADER } from "./csvBulkImport";

describe("csvBulkImport", () => {
  it("parses header and example row", () => {
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
});
