import { hasPositiveStockLine } from "@/utils/productStocks";

/** İngilizce başlık (virgül) — eski şablon / otomasyon */
export const BULK_CSV_HEADER =
  "name,category,gender,fabric_type,gsm,price,moa,s,m,l,xl,image_urls,low_stock_threshold";

/** Türkçe başlık; Excel Türkiye için şablonda noktalı virgül kullanılır */
export const BULK_CSV_HEADER_TR =
  "urun_adi;kategori;cinsiyet;kumas;gsm;fiyat;moq;s;m;l;xl;gorsel_url;dusuk_stok";

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

/** Türkçe / alternatif başlık → iç alan adı (İngilizce) */
const HEADER_ALIASES: Record<string, string> = {
  name: "name",
  category: "category",
  gender: "gender",
  fabric_type: "fabric_type",
  gsm: "gsm",
  price: "price",
  moa: "moa",
  image_urls: "image_urls",
  low_stock_threshold: "low_stock_threshold",
  urun_adi: "name",
  isim: "name",
  urun: "name",
  model: "name",
  kategori: "category",
  cinsiyet: "gender",
  kumas: "fabric_type",
  malzeme: "fabric_type",
  fiyat: "price",
  birim_fiyat: "price",
  toptan_fiyat: "price",
  moq: "moa",
  seri_adedi: "moa",
  minimum_siparis: "moa",
  paket: "moa",
  gorsel_url: "image_urls",
  gorsel: "image_urls",
  gorseller: "image_urls",
  resim_url: "image_urls",
  dusuk_stok: "low_stock_threshold",
  dusuk_stok_esigi: "low_stock_threshold",
  stok_uyari: "low_stock_threshold",
  s: "s",
  m: "m",
  l: "l",
  xl: "xl",
};

function slugHeader(h: string): string {
  return h
    .trim()
    .replace(/İ/g, "i")
    .replace(/I/g, "i")
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

export function normalizeHeaderKey(cell: string): string {
  const slug = slugHeader(cell);
  return HEADER_ALIASES[slug] ?? slug;
}

function detectDelimiter(line: string): "," | ";" {
  let inQ = false;
  let commas = 0;
  let semis = 0;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') inQ = !inQ;
    if (inQ) continue;
    if (c === ",") commas += 1;
    if (c === ";") semis += 1;
  }
  return semis > commas ? ";" : ",";
}

function parseCsvLine(line: string, delimiter: "," | ";"): string[] {
  const out: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQ = !inQ;
      continue;
    }
    if (!inQ && c === delimiter) {
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
  if (lines.length === 0) return [];
  const delimiter = detectDelimiter(lines[0]);
  return lines.map((line) => parseCsvLine(line, delimiter));
}

export function rowsFromParsed(rows: string[][]): { header: string[]; dataRows: string[][] } {
  if (rows.length === 0) return { header: [], dataRows: [] };
  const header = rows[0].map((h) => normalizeHeaderKey(h));
  return { header, dataRows: rows.slice(1) };
}

function numCell(v: string): number {
  const n = Number(String(v).replace(/\s/g, "").replace(",", ".").trim());
  return Number.isFinite(n) ? n : 0;
}

export function parseBulkProductRow(
  header: string[],
  cells: string[],
  rowIndex: number
): { ok: true; row: BulkProductRow } | { ok: false; error: string } {
  const idx = (name: string) => header.indexOf(name);
  const need = ["name", "category", "gender", "fabric_type", "price", "moa", "image_urls"] as const;
  for (const k of need) {
    if (idx(k) < 0) {
      return {
        ok: false,
        error: `Başlık satırında eksik sütun: "${k}" (Türkçe şablonda urun_adi, kategori, … kullanın).`,
      };
    }
  }

  const g = (key: string) => {
    const i = idx(key);
    return i >= 0 && i < cells.length ? cells[i].trim() : "";
  };

  const name = g("name");
  if (!name) return { ok: false, error: `Satır ${rowIndex + 2}: ürün adı boş olamaz.` };

  const price = numCell(g("price"));
  if (price <= 0) return { ok: false, error: `Satır ${rowIndex + 2}: fiyat pozitif sayı olmalı.` };

  const moa = Math.max(1, Math.floor(numCell(g("moa")) || 1));

  const stocks: Record<string, number> = {};
  for (const col of ["s", "m", "l", "xl"] as const) {
    const i = idx(col);
    if (i < 0) continue;
    const q = Math.max(0, Math.floor(numCell(cells[i] || "0")));
    if (q > 0) stocks[col.toUpperCase()] = q;
  }

  if (!hasPositiveStockLine(stocks)) {
    return { ok: false, error: `Satır ${rowIndex + 2}: En az bir bedende (s, m, l, xl) stok > 0 olmalı.` };
  }

  const imageRaw = g("image_urls");
  const images = imageRaw
    .split(/[|;\n]/)
    .map((s) => s.trim())
    .filter((s) => /^https?:\/\//i.test(s));
  if (images.length === 0) {
    return {
      ok: false,
      error: `Satır ${rowIndex + 2}: görsel_url alanında en az bir http(s) adresi olmalı; birden fazlaysa | ile ayırın.`,
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

/** Excel Türkiye: UTF-8 BOM + noktalı virgül + Türkçe başlık */
export function buildBulkTemplateCsvTr(): string {
  const example =
    "Ornek Model 1;Tisort;Unisex;%100 Pamuk;220;450;6;10;15;8;0;https://placehold.co/600x800/e2e8f0/64748b?text=Urun;5";
  return `\uFEFF${BULK_CSV_HEADER_TR}\n${example}\n`;
}

/** Virgül + İngilizce başlık (alternatif) */
export function buildBulkTemplateCsvEn(): string {
  const example =
    "Sample 1,T-shirt,Unisex,Cotton,220,450,6,10,15,8,0,https://placehold.co/600x800/e2e8f0/64748b?text=Urun,5";
  return `\uFEFF${BULK_CSV_HEADER}\n${example}\n`;
}

/** @deprecated buildBulkTemplateCsvTr kullanın */
export function buildBulkTemplateCsv(): string {
  return buildBulkTemplateCsvTr();
}

/** Sütun açıklamaları (UI / Yardım) */
export const BULK_COLUMN_HELP: { key: string; tr: string; ornek: string }[] = [
  { key: "urun_adi", tr: "Ürün / model adı", ornek: "Yazlik Polo 01" },
  { key: "kategori", tr: "Kategori", ornek: "Tisort, Triko, Pantolon…" },
  { key: "cinsiyet", tr: "Cinsiyet", ornek: "Erkek, Kadin, Unisex…" },
  { key: "kumas", tr: "Kumas / malzeme", ornek: "%100 Pamuk" },
  { key: "gsm", tr: "Gramaj (bos birakilabilir)", ornek: "220 veya bos" },
  { key: "fiyat", tr: "Sizin toptan birim fiyatiniz (TL)", ornek: "450" },
  { key: "moq", tr: "Minimum siparis (seri adedi)", ornek: "6" },
  { key: "s, m, l, xl", tr: "Beden basina stok adedi", ornek: "10; 15; 0; 0" },
  {
    key: "gorsel_url",
    tr: "İstediğiniz kadar https adresi (sınır: yükleme sonrası düzenlemede ~24); aynı hücrede | veya alt alta satır",
    ornek: "url1|url2|url3",
  },
  { key: "dusuk_stok", tr: "Toplam stok uyari esigi (bos = 5)", ornek: "5" },
];
