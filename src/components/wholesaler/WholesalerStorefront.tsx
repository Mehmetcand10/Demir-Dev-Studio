"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Package, ShoppingBag, MapPin, Star, ArrowLeft, ShieldAlert, Lock, Bell, BellRing, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { supplierAliasFromId } from "@/utils/supplierAlias";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80";

type Props = {
  wholesalerId: string;
  /** Geri linki: katalog veya toptancı listesi */
  backHref?: string;
  backLabel?: string;
};

export default function WholesalerStorefront({
  wholesalerId,
  backHref = "/katalog",
  backLabel = "Katalog",
}: Props) {
  const supabase = createClient();
  const [products, setProducts] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [canSeePrices, setCanSeePrices] = useState(false);
  const [viewer, setViewer] = useState<{
    id: string;
    role: string;
    is_approved: boolean;
  } | null>(null);
  const [following, setFollowing] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!wholesalerId) return;

      const { data: pubRows, error: pubErr } = await supabase.rpc(
        "get_wholesaler_public_profile",
        { p_wholesaler_id: wholesalerId }
      );
      let prof: any = null;
      if (!pubErr && Array.isArray(pubRows) && pubRows[0]) {
        prof = { ...pubRows[0], role: "toptanci" };
      } else {
        const { data: direct } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", wholesalerId)
          .single();
        prof = direct;
      }
      setProfile(prof);

      const { data: auth } = await supabase.auth.getUser();
      if (auth?.user) {
        const { data: myProfile } = await supabase
          .from("profiles")
          .select("is_approved, role")
          .eq("id", auth.user.id)
          .single();
        setCanSeePrices(Boolean(myProfile?.is_approved));
        setViewer({
          id: auth.user.id,
          role: myProfile?.role || "butik",
          is_approved: Boolean(myProfile?.is_approved),
        });
        if (
          myProfile?.role === "butik" &&
          auth.user.id !== wholesalerId
        ) {
          const { data: row } = await supabase
            .from("boutique_wholesaler_follows")
            .select("wholesaler_id")
            .eq("boutique_id", auth.user.id)
            .eq("wholesaler_id", wholesalerId)
            .maybeSingle();
          setFollowing(Boolean(row));
        } else {
          setFollowing(false);
        }
      } else {
        setCanSeePrices(false);
        setViewer(null);
        setFollowing(false);
      }

      const { data: prods } = await supabase
        .from("products")
        .select("*")
        .eq("wholesaler_id", wholesalerId)
        .order("created_at", { ascending: false });

      if (prods) setProducts(prods);
      if (!prof && prods && prods.length > 0) {
        setProfile({
          role: "toptanci",
          is_approved: true,
          business_name: "Mağaza",
          full_name: "",
          min_order_floor_units: null,
          avatar_url: null,
        });
      }
      setLoading(false);
    }
    fetchData();
  }, [wholesalerId, supabase]);

  const toggleFollow = async () => {
    if (
      !viewer ||
      viewer.role !== "butik" ||
      !viewer.is_approved ||
      viewer.id === wholesalerId
    )
      return;
    setFollowBusy(true);
    try {
      if (following) {
        const { error } = await supabase
          .from("boutique_wholesaler_follows")
          .delete()
          .eq("boutique_id", viewer.id)
          .eq("wholesaler_id", wholesalerId);
        if (error) throw error;
        setFollowing(false);
      } else {
        const { error } = await supabase
          .from("boutique_wholesaler_follows")
          .insert({
            boutique_id: viewer.id,
            wholesaler_id: wholesalerId,
          });
        if (error) throw error;
        setFollowing(true);
      }
    } catch (e: unknown) {
      alert(
        "Takip güncellenemedi: " +
          (e instanceof Error ? e.message : String(e))
      );
    } finally {
      setFollowBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-sm font-medium text-anthracite-400 animate-pulse">
        Yükleniyor…
      </div>
    );
  }

  if (!profile || profile.role !== "toptanci") {
    return (
      <div className="py-24 text-center text-sm font-medium text-red-600">
        Toptancı bulunamadı.
      </div>
    );
  }

  if (!profile.is_approved) {
    return (
      <div className="py-24 text-center text-sm font-medium text-anthracite-600">
        Bu mağaza henüz vitrine açılmadı.
      </div>
    );
  }

  const isOwnerPreview =
    viewer?.role === "toptanci" && viewer.id === wholesalerId;
  const publicAlias = supplierAliasFromId(wholesalerId);
  const ownerLegalName =
    profile.business_name?.trim() ||
    profile.full_name?.trim() ||
    publicAlias;
  const displayName = isOwnerPreview ? ownerLegalName : publicAlias;
  const displayInitial = (displayName[0] || "?").toUpperCase();
  const headerAvatarUrl =
    isOwnerPreview && profile.avatar_url?.trim()
      ? profile.avatar_url.trim()
      : null;

  return (
    <div className="premium-page-wrap min-h-screen">
      <div className="mb-10">
        <Link
          href={backHref}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-anthracite-600 transition hover:text-anthracite-900"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} /> {backLabel}
        </Link>

        <div className="premium-card relative flex flex-col items-center gap-6 overflow-hidden rounded-2xl p-6 sm:flex-row sm:gap-8 sm:p-8">
          <div className="absolute -right-16 -top-16 opacity-[0.04]">
            <Package className="h-64 w-64" strokeWidth={1} />
          </div>

          <div className="relative z-10 h-24 w-24 shrink-0 overflow-hidden rounded-2xl shadow-sm ring-1 ring-anthracite-100/80 sm:h-28 sm:w-28">
            {headerAvatarUrl ? (
              <Image
                src={headerAvatarUrl}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 640px) 96px, 112px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sky-600 to-sky-700 text-3xl font-semibold text-white sm:text-4xl">
                {displayInitial}
              </div>
            )}
          </div>

          <div className="relative z-10 flex-1 text-center md:text-left">
            <div className="mb-3 flex flex-wrap items-center justify-center gap-2 md:justify-start">
              <span
                className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${
                  isOwnerPreview
                    ? "border-blue-200 bg-blue-50 text-blue-900"
                    : "border-sky-200/80 bg-sky-50 text-sky-800"
                }`}
              >
                {isOwnerPreview ? "Kendi vitrininiz" : "Onaylı üretici"}
              </span>
              <div className="flex items-center gap-1 rounded-full border border-amber-100 bg-amber-50 px-2.5 py-0.5 text-[10px] font-medium text-amber-800">
                <Star className="h-3 w-3 fill-current" /> Satıcı
              </div>
              {viewer &&
                viewer.role === "butik" &&
                viewer.is_approved &&
                viewer.id !== wholesalerId && (
                  <button
                    type="button"
                    disabled={followBusy}
                    onClick={() => void toggleFollow()}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-semibold transition ${
                      following
                        ? "border-sky-300 bg-sky-600 text-white hover:bg-sky-700"
                        : "border-anthracite-200 bg-white text-anthracite-800 hover:bg-anthracite-50"
                    } disabled:opacity-60`}
                  >
                    {followBusy ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : following ? (
                      <BellRing className="h-3 w-3" strokeWidth={2} />
                    ) : (
                      <Bell className="h-3 w-3" strokeWidth={2} />
                    )}
                    {following ? "Takipte" : "Takip et"}
                  </button>
                )}
            </div>
            <h1 className="mb-2 break-words text-2xl font-semibold leading-tight tracking-tight text-anthracite-900 sm:text-3xl">
              {displayName}
            </h1>
            {isOwnerPreview ? (
              <p className="mb-2 text-xs font-medium text-anthracite-500">
                Butikler vitrinde sizi yalnızca kodlu tedarikçi adıyla görür; burada iş unvanınız size özeldir.
              </p>
            ) : null}
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-anthracite-600 md:justify-start">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-sky-600" strokeWidth={2} />{" "}
                Türkiye genelinde teslimat
              </div>
              <div className="flex items-center gap-1.5">
                <Package className="h-4 w-4 text-sky-600" strokeWidth={2} />{" "}
                {products.length} ürün
              </div>
            </div>
            {typeof profile.min_order_floor_units === "number" &&
              profile.min_order_floor_units > 0 && (
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200/90 bg-amber-50/90 px-3 py-2.5 text-left text-xs text-amber-950 sm:text-sm">
                  <ShieldAlert
                    className="mt-0.5 h-4 w-4 shrink-0 text-amber-700"
                    strokeWidth={2}
                  />
                  <span>
                    Bu mağaza{" "}
                    <strong className="font-semibold">
                      tek siparişte en az {profile.min_order_floor_units} adet
                    </strong>{" "}
                    kabul ediyor (mağaza politikası).
                  </span>
                </div>
              )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-2 border-b border-anthracite-200/80 pb-4">
          <h2 className="text-lg font-semibold text-anthracite-900 sm:text-xl">
            Ürünler ({products.length})
          </h2>
          <p className="text-xs text-anthracite-500 sm:text-sm">
            {isOwnerPreview
              ? "Aşağıdaki ürünler katalogdaki vitrininizle aynıdır."
              : "Sadece bu tedarikçinin vitrini"}
          </p>
        </div>

        {products.length === 0 ? (
          <div className="premium-card py-16 text-center text-sm text-anthracite-500">
            Bu mağazada henüz ürün yok.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
            {products.map((p) => {
              const displayedPrice =
                Number(p.base_wholesale_price) + Number(p.margin_price || 0);
              const img =
                p.images?.[0] && String(p.images[0]).trim()
                  ? p.images[0]
                  : PLACEHOLDER;
              return (
                <div
                  key={p.id}
                  className="premium-card group overflow-hidden rounded-xl transition hover:border-anthracite-300/80 hover:shadow-md sm:rounded-2xl"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-anthracite-50 p-2.5">
                    <Image
                      src={img}
                      alt={p.name}
                      fill
                      sizes="(max-width: 640px) 50vw, 20vw"
                      className="object-contain"
                    />
                  </div>
                  <div className="p-2.5 text-left sm:p-3">
                    <h3 className="mb-1 line-clamp-2 text-xs font-bold leading-snug text-anthracite-900 sm:text-sm">
                      {p.name}
                    </h3>
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="rounded border border-sky-100 bg-sky-50 px-1.5 py-0.5 text-[8px] font-bold uppercase text-sky-700">
                        {p.gender}
                      </span>
                      <span className="text-[10px] font-medium text-anthracite-400">
                        MOQ {p.min_order_quantity}
                      </span>
                    </div>

                    <div className="flex items-end justify-between gap-1 border-t border-anthracite-100/80 pt-2">
                      <div className="flex min-w-0 flex-col">
                        {canSeePrices ? (
                          <>
                            <span className="text-[9px] font-bold uppercase text-anthracite-400">
                              Toptan
                            </span>
                            <span className="text-sm font-semibold tabular-nums text-anthracite-900 sm:text-[15px]">
                              {displayedPrice.toLocaleString("tr-TR")} ₺/adet
                            </span>
                            <span className="text-[10px] text-anthracite-400 line-through">
                              {Math.round(displayedPrice * 1.22).toLocaleString("tr-TR")} ₺
                            </span>
                          </>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-anthracite-400">
                            <Lock className="h-3.5 w-3.5" />
                            Onaylı üyeye açık
                          </span>
                        )}
                      </div>
                      {canSeePrices ? (
                        <Link
                          href={`/product/${p.id}`}
                          className="shrink-0 rounded-lg bg-anthracite-900 p-2 text-white shadow-sm sm:rounded-xl"
                        >
                          <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Link>
                      ) : (
                        <Link
                          href="/login"
                          className="shrink-0 rounded-lg border border-anthracite-200 bg-white px-2.5 py-2 text-[10px] font-medium text-anthracite-700 shadow-sm sm:rounded-xl"
                        >
                          Giriş
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
