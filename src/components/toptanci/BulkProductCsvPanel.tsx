"use client";

import { useCallback, useState } from "react";
import { Upload, Download, AlertTriangle, CheckCircle2, Loader2, ChevronDown, ChevronUp, FileSpreadsheet } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import {
  BULK_CSV_HEADER_TR,
  BULK_COLUMN_HELP,
  buildBulkTemplateCsvTr,
  buildBulkTemplateCsvEn,
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
  const [showCols, setShowCols] = useState(false);

  const downloadTr = useCallback(() => {
    const blob = new Blob([buildBulkTemplateCsvTr()], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "demir-dev-urun-excel-turkiye.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }, []);

  const downloadEn = useCallback(() => {
    const blob = new Blob([buildBulkTemplateCsvEn()], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "demir-dev-urun-virgul-ingilizce.csv";
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

      const hasName = header.includes("name");
      const hasImg = header.includes("image_urls");
      if (!hasName || !hasImg) {
        setLog([
          "Dosya tanınmadı: ilk satırda urun_adi (veya name) ve gorsel_url (veya image_urls) sütunları olmalı.",
          "Excel’de tüm metin tek sütunda görünüyorsa «Excel (Türkiye)» şablonunu indirip onu düzenleyin (noktalı virgül).",
        ]);
        setBusy(false);
        return;
      }

      const errors: string[] = [];
      let ok = 0;
      let lastInsertedId: string | null = null;

      for (let i = 0; i < dataRows.length; i++) {
        const cells = dataRows[i];
        if (cells.every((c) => !String(c).trim())) continue;

        const parsed = parseBulkProductRow(header, cells, i);
        if (!parsed.ok) {
          errors.push(parsed.error);
          continue;
        }
        const r = parsed.row;
        const { data: ins, error } = await supabase
          .from("products")
          .insert([
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
          ])
          .select("id")
          .single();
        if (error) {
          errors.push(`Satır ${i + 2} (${r.name}): ${error.message}`);
        } else {
          ok += 1;
          if (ins?.id) lastInsertedId = ins.id;
        }
      }

      if (ok > 0 && lastInsertedId) {
        const { error: rpcErr } = await supabase.rpc("notify_boutiques_new_catalog_product", {
          p_product_id: lastInsertedId,
        });
        if (rpcErr) console.warn("Toplu yükleme butik bildirimi:", rpcErr.message);
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
    <div className="rounded-2xl border border-dashed border-sky-200/90 bg-sky-50/40 p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-anthracite-900">Toplu ürün (Excel / CSV)</h3>
          <p className="mt-2 text-xs leading-relaxed text-anthracite-600">
            <strong className="text-anthracite-800">Nasıl çalışır?</strong> Şablonda her <strong>satır = bir ürün</strong>.
            Hata olursa vitrinde ürün kartındaki <strong>düzenle</strong> (kalem) ile fiyat/stok/görsel güncelleyin. Dosyayı
            kaydedip buradan yükleyin; sistem satırları okuyup vitrine ekler. Yükleme çalışmazsa sunucu tarafı ayarları
            eksik olabilir — destek veya site yöneticinize bildirin.
          </p>
          <p className="mt-2 text-xs leading-relaxed text-amber-900/90">
            <strong>Excel Türkiye ipucu:</strong> Virgüllü CSV bazen tüm hücreyi <strong>tek sütunda</strong> açar. Bu yüzden
            varsayılan şablon <strong>noktalı virgül (;)</strong> ve <strong>Türkçe sütun adları</strong> kullanır — sütunlar
            doğru hizalanır.
          </p>
          <p className="mt-2 break-all font-mono text-[10px] text-anthracite-500 sm:break-normal">
            {BULK_CSV_HEADER_TR}
          </p>

          <button
            type="button"
            onClick={() => setShowCols((v) => !v)}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-sky-800 hover:underline"
          >
            {showCols ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            Sütunların anlamı
          </button>

          {showCols && (
            <div className="mt-3 overflow-x-auto rounded-xl border border-sky-100/90 bg-white/90">
              <table className="w-full min-w-[280px] text-left text-[11px]">
                <thead>
                  <tr className="border-b border-anthracite-100 bg-anthracite-50/80">
                    <th className="px-3 py-2 font-semibold text-anthracite-800">Sütun</th>
                    <th className="px-3 py-2 font-semibold text-anthracite-800">Ne yazılır?</th>
                    <th className="px-3 py-2 font-semibold text-anthracite-800">Örnek</th>
                  </tr>
                </thead>
                <tbody>
                  {BULK_COLUMN_HELP.map((row) => (
                    <tr key={row.key} className="border-b border-anthracite-50 last:border-0">
                      <td className="px-3 py-2 font-mono font-medium text-sky-900">{row.key}</td>
                      <td className="px-3 py-2 text-anthracite-700">{row.tr}</td>
                      <td className="px-3 py-2 text-anthracite-500">{row.ornek}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:min-w-[200px] sm:items-stretch">
          <button
            type="button"
            onClick={downloadTr}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-sky-300 bg-white px-4 py-2.5 text-xs font-semibold text-sky-900 shadow-sm transition hover:bg-sky-50"
          >
            <FileSpreadsheet className="h-4 w-4" strokeWidth={2} />
            Excel (Türkiye) şablonu
          </button>
          <button
            type="button"
            onClick={downloadEn}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-anthracite-200 bg-white px-4 py-2.5 text-xs font-semibold text-anthracite-700 shadow-sm transition hover:bg-anthracite-50"
          >
            <Download className="h-4 w-4" strokeWidth={2} />
            Virgül + İngilizce başlık
          </button>
          <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-sky-700">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" strokeWidth={2} />}
            Dosyayı yükle
            <input
              type="file"
              accept=".csv,text/csv,.txt"
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
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-600" />
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
