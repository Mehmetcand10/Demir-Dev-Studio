import { redirect } from "next/navigation";

/** Eski yer imleri / kısa URL: asıl sayfa `/listem`. */
export default function SepetAliasPage() {
  redirect("/listem");
}
