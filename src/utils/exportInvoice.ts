"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ORDER_STATUS } from "./orderStatus";
import { supplierAliasFromId } from "./supplierAlias";

export const exportInvoicePDF = (order: any) => {
  const doc = new jsPDF() as any;
  const statusText =
    order.status === ORDER_STATUS.SHIPPED
      ? "Kargoda"
      : order.status === ORDER_STATUS.DELIVERED
        ? "Teslim Edildi"
        : order.status === ORDER_STATUS.CANCELLED
          ? "İptal"
          : order.status === ORDER_STATUS.WAITING_PAYMENT
            ? "Ödeme Bekleniyor"
            : "Hazırlanıyor";

  // FIRMA BILGILERI
  const companyName = "DEMIR DEV STUDIO";
  const companyPhone = "+90 532 000 00 00";
  const companyEmail = "iletisim@demirdev.io";
  const iban = "TR00 0000 0000 0000 0000 0000 00";
  const bank = "Ziraat Bankası / Demir Dev Studio";

  // HEADER - FIRMA ISMI
  doc.setFontSize(22);
  doc.setTextColor(20, 20, 20);
  doc.text(companyName, 14, 22);

  // ALT BILGI
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("B2B Siparis Takip & Bilgi Formu", 14, 30);
  doc.text(`Tarih: ${new Date(order.created_at).toLocaleDateString('tr-TR')}`, 14, 36);

  // SIPARIS NO
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(`Siparis No: #${order.id.slice(0, 8).toUpperCase()}`, 140, 22);
  doc.text(`Durum: ${statusText}`, 140, 28);

  // CIZGI
  doc.setDrawColor(230, 230, 230);
  doc.line(14, 45, 196, 45);

  // MUSTERI & TEDARIKCI BILGILERI
  doc.setFontSize(12);
  doc.text("Alici (Butik):", 14, 55);
  doc.setFontSize(10);
  doc.text(order.buyer_name || "Bilinmeyen Butik", 14, 62);
  doc.text("Turkiye / B2B Agi Uyesi", 14, 68);

  const canRevealSupplierName =
    order.status === ORDER_STATUS.SHIPPED || order.status === ORDER_STATUS.DELIVERED;
  const supplierDisplayName =
    canRevealSupplierName && order.wholesaler?.business_name
      ? order.wholesaler.business_name
      : supplierAliasFromId(order.wholesaler_id);

  doc.setFontSize(12);
  doc.text("Satici (Tedarikci):", 140, 55);
  doc.setFontSize(10);
  doc.text(supplierDisplayName, 140, 62);
  doc.text(
    canRevealSupplierName ? "Onayli tedarikci" : "Kimlik kargo sonrasi acilir",
    140,
    68
  );

  // URUN TABLOSU
  const tableColumn = ["Urun", "Adet", "Birim Fiyat", "Toplam"];
  const unitPrice = Number(order.total_price) / Number(order.quantity);
  const tableRows = [
    [
      order.product_name || "Isimsiz Urun",
      order.quantity,
      `${unitPrice.toLocaleString('tr-TR')} TL`,
      `${Number(order.total_price).toLocaleString('tr-TR')} TL`
    ]
  ];

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 80,
    styles: { fontSize: 10, cellPadding: 5 },
    headStyles: { fillColor: [40, 40, 40], textColor: [255, 255, 255] },
    theme: 'grid'
  });

  // FINAL TUTAR
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(13);
  doc.text(`Genel Toplam: ${Number(order.total_price).toLocaleString('tr-TR')} TL`, 140, finalY);

  // ODEME BILGILERI KUTUSU
  doc.setDrawColor(220, 220, 220);
  doc.setFillColor(245, 245, 245);
  doc.rect(14, finalY + 15, 182, 35, 'F');

  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);
  doc.text("Odeme Bilgileri (Havale/EFT):", 20, finalY + 25);
  doc.setFontSize(9);
  doc.text(`Banka: ${bank}`, 20, finalY + 32);
  doc.text(`IBAN: ${iban}`, 20, finalY + 38);
  doc.text(`Iletisim: ${companyPhone}`, 20, finalY + 44);

  // FOOTER
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("Bu belge B2B Portali uzerinden otomatik olarak uretilmistir. Resmi mali fatura degildir.", 14, 285);

  doc.save(`Fatura-${order.id.slice(0, 8)}.pdf`);
};
