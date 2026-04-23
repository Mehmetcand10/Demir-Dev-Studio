import { createClient } from "@/utils/supabase/server";
import HomeLandingExperience from "@/components/home/HomeLandingExperience";

export default async function Home() {
  const supabase = createClient();
  const { data: prods } = await supabase
    .from("products")
    .select("id, name, images, base_wholesale_price, margin_price, min_order_quantity")
    .order("created_at", { ascending: false })
    .limit(7);

  return <HomeLandingExperience spotlightProducts={prods ?? []} spotlightTitle="Fırsat ürünleri" />;
}
