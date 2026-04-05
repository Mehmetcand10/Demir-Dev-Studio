"use client";

import { useCallback, useState } from "react";
import { Upload, Download, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import {
  BULK_CSV_HEADER,
  buildBulkTemplateCsv,
  parseBulkCsv,
  parseBulkProductRow,
  rowsFromParsed,
} from "@/utils/csvBulkImport";

type Props = {
  userId: string;
  onImported: () => void;
};

export default function BulkProductCsvPanel({ userId, onImported }: Props) {
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const downloadTemplate = useCallback(() => {
    const blob = new Blob([buildBulkTemplateCsv()], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "demir-dev-urun-sablonu.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }, []);

  const runImport = useCallback(
    async (file: File) => {
      setBusy(true);
      setLog([]);
      const supabase = createClient();
      const text = await file.text();
      const matrix = parseBulkCsv(text);
      const { header, dataRows } = rowsFromParsed(matrix);

      const h = header.join(",");
      if (!h.toLowerCase().includes("name") || !h.toLowerCase().includes("image_urls")) {
        setLog(["Geçersiz dosya: ilk satır şablon başlığı olmalı. Şablonu indirip düzenleyin."]);
        setBusy(false);
        return;
      }

      const errors: string[] = [];
      let ok = 0;

      for (let i = 0; i < dataRows.length; i++) {
        const cells = dataRows[i];
        if (cells.every((c) => !String(c).trim())) continue;

        const parsed = parseBulkProductRow(header, cells, i);
        if (!parsed.ok) {
          errors.push(parsed.error);
          continue;
        }
        const r = parsed.row;
        const { error } = await supabase.from("products").insert([
          {
            wholesaler_id: userId,
            name: r.name,
            category: r.category,
            gender: r.gender,
            fabric_type: r.fabric_type,
            gsm: r.gsm,
            stocks: r.stocks,
            images: r.images,
            base_wholesale_price: r.base_wholesale_price,
            margin_price: r.base_wholesale_price * 0.15,
            stock_status: "In Stock",
            min_order_quantity: r.min_order_quantity,
            low_stock_threshold: r.low_stock_threshold,
          },
        ]);
        if (error) {
          errors.push(`Satır ${i + 2} (${r.name}): ${error.message}`);
        } else {
          ok += 1;
        }
      }

      const lines = [
        ok > 0 ? `✓ ${ok} ürün eklendi.` : "",
        ...errors.slice(0, 12),
        errors.length > 12 ? `… ve ${errors.length - 12} hata daha` : "",
      ].filter(Boolean);
      setLog(lines);
      if (ok > 0) onImported();
      setBusy(false);
    },
    [userId, onImported]
  );

  return (
    <div className="rounded-2xl border border-dashed border-emerald-200/90 bg-emerald-50/40 p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-anthracite-900">Toplu ürün (CSV)</h3>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-anthracite-600">
            Şablonu indirin; her satır bir ürün. <strong>image_urls</strong> alanına en az bir{" "}
            <code className="rounded bg-white/90 px-1">https://</code> görsel adresi yazın (birden fazlaysa{" "}
            <code className="rounded bg-white/90 px-1">|</code> ile ayırın). Stok sütunları:{" "}
            <strong>s, m, l, xl</strong>. Veritabanında{" "}
            <code className="rounded bg-white/90 px-1 text-[10px]">product_bulk_and_alerts.sql</code> çalışmış olmalı.
          </p>
          <p className="mt-2 font-mono text-[10px] text-anthracite-500">{BULK_CSV_HEADER}</p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
          <button
            type="button"
            onClick={downloadTemplate}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-xs font-semibold text-emerald-800 shadow-sm transition hover:bg-emerald-50"
          >
            <Download className="h-4 w-4" strokeWidth={2} />
            Şablon indir
          </button>
          <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" strokeWidth={2} />}
            CSV yükle
            <input
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              disabled={busy}
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (f) void runImport(f);
              }}
            />
          </label>
        </div>
      </div>
      {log.length > 0 && (
        <ul className="mt-4 space-y-1.5 rounded-xl border border-anthracite-100 bg-white/90 p-3 text-xs">
          {log.map((line, i) => (
            <li key={i} className="flex gap-2 text-anthracite-700">
              {line.startsWith("✓") ? (
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
              ) : (
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
              )}
              <span>{line}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
