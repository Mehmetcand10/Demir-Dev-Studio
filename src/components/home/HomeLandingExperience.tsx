import { HomeCategoryTree } from "./HomeCategoryTree";
import { HomeHeroSlider } from "./HomeHeroSlider";
import { HomeSpotlightStrip } from "./HomeSpotlightStrip";

export type SpotlightProduct = {
  id: string;
  name: string;
  images?: string[] | null;
  base_wholesale_price?: number;
  margin_price?: number;
  min_order_quantity?: number;
};

type Props = {
  spotlightProducts: SpotlightProduct[];
  /** "Fırsat Ürünleri" | "Yeni Gelen Toptancılar" vb. */
  spotlightTitle: string;
  canSeePrices: boolean;
};

export default function HomeLandingExperience({ spotlightProducts, spotlightTitle, canSeePrices }: Props) {
  return (
    <div className="w-full bg-white">
      <main className="flex w-full flex-col">
        <section className="border-b border-slate-200 px-3 pb-6 pt-4 sm:px-4 sm:pb-8 sm:pt-5 lg:px-6">
          <div className="mx-auto max-w-screen-2xl">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-5">
              <div className="order-1 min-w-0 flex-1 lg:order-2">
                <HomeHeroSlider />
              </div>
              <div className="order-2 shrink-0 lg:order-1 lg:sticky lg:top-20 lg:w-full lg:max-w-[280px]">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Kategoriler</p>
                <HomeCategoryTree />
              </div>
            </div>
          </div>
        </section>

        <HomeSpotlightStrip products={spotlightProducts} title={spotlightTitle} canSeePrices={canSeePrices} />
      </main>
    </div>
  );
}
