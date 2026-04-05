import { hasPositiveStockLine } from "@/utils/productStocks";

export const BULK_CSV_HEADER =
  "name,category,gender,fabric_type,gsm,price,moa,s,m,l,xl,image_urls,low_stock_threshold";

export type BulkProductRow = {
  name: string;
  category: string;
  gender: string;
  fabric_type: string;
  gsm: string | null;
  base_wholesale_price: number;
  min_order_quantity: number;
  stocks: Record<string, number>;
  images: string[];
  low_stock_threshold: number;
};

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQ = !inQ;
      continue;
    }
    if (!inQ && c === ",") {
      out.push(cur.trim());
      cur = "";
      continue;
    }
    cur += c;
  }
  out.push(cur.trim());
  return out;
}

export function parseBulkCsv(text: string): string[][] {
  const raw = text.replace(/^\uFEFF/, "").trim();
  if (!raw) return [];
  const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);
  return lines.map(parseCsvLine);
}

function numCell(v: string): number {
  const n = Number(String(v).replace(",", ".").trim());
  return Number.isFinite(n) ? n : 0;
}

/** İlk satır başlık; UTF-8 BOM tolere edilir. */
export function rowsFromParsed(rows: string[][]): { header: string[]; dataRows: string[][] } {
  if (rows.length === 0) return { header: [], dataRows: [] };
  const header = rows[0].map((h) => h.trim().toLowerCase());
  return { header, dataRows: rows.slice(1) };
}

export function parseBulkProductRow(
  header: string[],
  cells: string[],
  rowIndex: number
): { ok: true; row: BulkProductRow } | { ok: false; error: string } {
  const idx = (name: string) => header.indexOf(name.toLowerCase());
  const need = ["name", "category", "gender", "fabric_type", "price", "moa", "image_urls"] as const;
  for (const k of need) {
    if (idx(k) < 0) return { ok: false, error: `Başlık satırında "${k}" sütunu yok.` };
  }

  const g = (key: string) => {
    const i = idx(key);
    return i >= 0 && i < cells.length ? cells[i].trim() : "";
  };

  const name = g("name");
  if (!name) return { ok: false, error: `Satır ${rowIndex + 2}: name boş olamaz.` };

  const price = numCell(g("price"));
  if (price <= 0) return { ok: false, error: `Satır ${rowIndex + 2}: price geçerli pozitif sayı olmalı.` };

  const moa = Math.max(1, Math.floor(numCell(g("moa")) || 1));

  const stocks: Record<string, number> = {};
  for (const col of ["s", "m", "l", "xl"] as const) {
    const i = idx(col);
    if (i < 0) continue;
    const q = Math.max(0, Math.floor(numCell(cells[i] || "0")));
    if (q > 0) stocks[col.toUpperCase()] = q;
  }

  if (!hasPositiveStockLine(stocks)) {
    return { ok: false, error: `Satır ${rowIndex + 2}: En az bir bedende (s,m,l,xl) stok > 0 olmalı.` };
  }

  const imageRaw = g("image_urls");
  const images = imageRaw
    .split(/[|;\n]/)
    .map((s) => s.trim())
    .filter((s) => /^https?:\/\//i.test(s));
  if (images.length === 0) {
    return {
      ok: false,
      error: `Satır ${rowIndex + 2}: image_urls içinde en az bir http(s) adresi olmalı (birden fazlaysa | ile ayırın).`,
    };
  }

  let low = 5;
  const lt = idx("low_stock_threshold");
  if (lt >= 0 && cells[lt] !== undefined && String(cells[lt]).trim() !== "") {
    low = Math.max(0, Math.floor(numCell(cells[lt])));
  }

  const gsmVal = g("gsm");

  return {
    ok: true,
    row: {
      name,
      category: g("category") || "Tişört",
      gender: g("gender") || "Unisex",
      fabric_type: g("fabric_type") || "Belirtilmedi",
      gsm: gsmVal ? gsmVal : null,
      base_wholesale_price: price,
      min_order_quantity: moa,
      stocks,
      images,
      low_stock_threshold: low,
    },
  };
}

export function buildBulkTemplateCsv(): string {
  const example =
    "Örnek Model 1,Tişört,Unisex,%100 Pamuk,220,450,6,10,15,8,0,https://placehold.co/600x800/e2e8f0/64748b?text=Urun,5";
  return `\uFEFF${BULK_CSV_HEADER}\n${example}\n`;
}
