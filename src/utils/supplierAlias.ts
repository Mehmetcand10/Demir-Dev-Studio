export function supplierAliasFromId(id?: string | null): string {
  if (!id) return "Onaylı Tedarikçi";
  const cleaned = String(id).replace(/-/g, "").toUpperCase();
  const token = cleaned.slice(0, 6) || "000000";
  return `Onaylı Tedarikçi ${token}`;
}

