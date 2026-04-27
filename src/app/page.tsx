import { createClient } from "@/utils/supabase/server";
import HomeLandingExperience from "@/components/home/HomeLandingExperience";

export default async function Home() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: prods } = await supabase
    .from("products")
    .select("id, name, images, base_wholesale_price, margin_price, min_order_quantity")
    .order("created_at", { ascending: false })
    .limit(7);

  let canSeePrices = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_approved")
      .eq("id", user.id)
      .single();
    canSeePrices = Boolean(profile?.is_approved);
  }

  return (
    <HomeLandingExperience
      spotlightProducts={prods ?? []}
      spotlightTitle="Fırsat ürünleri"
      canSeePrices={canSeePrices}
    />
  );
}
