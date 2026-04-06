"use client";

import { useParams } from "next/navigation";
import WholesalerStorefront from "@/components/wholesaler/WholesalerStorefront";

export default function ToptanciGorDetay() {
  const { id } = useParams();
  const wid = typeof id === "string" ? id : Array.isArray(id) ? id[0] : "";
  if (!wid) {
    return (
      <div className="py-24 text-center text-sm text-anthracite-500">
        Geçersiz bağlantı.
      </div>
    );
  }
  return (
    <WholesalerStorefront
      wholesalerId={wid}
      backHref="/toptanci-gor"
      backLabel="Toptancılar"
    />
  );
}
