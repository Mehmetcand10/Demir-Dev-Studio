import { Suspense } from "react";
import KatalogView from "./KatalogView";

function KatalogFallback() {
  return (
    <div className="min-h-screen bg-white px-4 py-24 text-center text-sm text-slate-500">Katalog yükleniyor…</div>
  );
}

export default function KatalogPage() {
  return (
    <Suspense fallback={<KatalogFallback />}>
      <KatalogView />
    </Suspense>
  );
}
