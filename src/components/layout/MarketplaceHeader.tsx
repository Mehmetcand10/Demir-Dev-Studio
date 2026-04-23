"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  ChevronDown,
  Heart,
  HelpCircle,
  LayoutGrid,
  LogIn,
  Menu,
  Package,
  Search,
  Store,
  UserRound,
} from "lucide-react";
import { Input } from "@/components/design-system/Input";
import { CartNavLink } from "@/components/nav/CartNavLink";
import SignOutButton from "@/components/auth/SignOutButton";
import { CATALOG_CATEGORIES } from "@/constants/marketplace";
import { cn } from "@/lib/cn";

type Props = {
  user: { id: string; email?: string } | null;
  userRole: string;
  cartInitialCount: number;
};

export function MarketplaceHeader({ user, userRole, cartInitialCount }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);

  useEffect(() => {
    setQ(searchParams.get("q") ?? "");
  }, [searchParams]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto max-w-screen-2xl px-3 sm:px-4 lg:px-6">
        {/* Trendyol tarzı: tek satır h-14, arama ortada ve geniş */}
        <div className="flex min-h-14 flex-col gap-2 py-2 sm:h-14 sm:flex-row sm:items-center sm:gap-3 sm:py-0">
          <div className="flex min-w-0 items-center justify-between gap-2 sm:shrink-0 sm:justify-start">
            <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-md border border-slate-200 p-2 text-slate-700 hover:bg-slate-50 sm:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menüyü aç"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link href="/" className="flex min-w-0 items-center gap-2 text-slate-900">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-blue-600 text-white">
                <Package className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <span className="min-w-0 sm:max-w-[7rem] lg:max-w-[10rem]">
                <span className="block truncate text-sm font-bold leading-tight sm:text-base">Demir Dev</span>
                <span className="hidden text-[9px] font-medium uppercase tracking-wide text-slate-500 sm:block">
                  B2B market
                </span>
              </span>
            </Link>
            </div>
            <div className="flex items-center gap-0.5 sm:hidden">
              {user && userRole === "butik" ? (
                <>
                  <Link
                    href="/favorites"
                    className="inline-flex rounded-md p-2 text-rose-600 hover:bg-rose-50"
                    title="Favoriler"
                  >
                    <Heart className="h-5 w-5" fill="currentColor" />
                  </Link>
                  <CartNavLink userId={user.id} initialCount={cartInitialCount} />
                </>
              ) : null}
              {!user && (
                <Link
                  href="/login"
                  className="inline-flex min-h-9 items-center gap-1 rounded-md border border-blue-600 bg-blue-600 px-2.5 text-xs font-bold text-white"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  Giriş
                </Link>
              )}
            </div>
          </div>

          <form
            action="/katalog"
            method="get"
            className="w-full min-w-0 flex-1 sm:mx-2"
            onSubmit={() => {
              setMobileOpen(false);
            }}
          >
            <div className="mx-auto flex w-full max-w-5xl gap-0 shadow-sm sm:max-w-4xl lg:max-w-5xl">
              <Input
                name="q"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                leftSlot={<Search className="h-4 w-4 text-slate-500" strokeWidth={2} />}
                placeholder="Ürün, kategori veya marka ara"
                className="min-h-10 rounded-r-none border-2 border-slate-200 border-r-0 bg-slate-50/80"
                inputClassName="text-[15px]"
                aria-label="Katalog araması"
              />
              <button
                type="submit"
                className="shrink-0 rounded-r-md border-2 border-l-0 border-slate-300 bg-slate-100 px-4 text-sm font-bold text-slate-800 transition hover:bg-slate-200 sm:px-5"
              >
                Ara
              </button>
            </div>
          </form>

          <div className="hidden items-center justify-end gap-0.5 sm:ml-0 sm:flex sm:shrink-0 sm:gap-1 lg:gap-2">
            {user ? (
              <>
                <Link
                  href="/hesap/sifre"
                  className="hidden items-center gap-1.5 rounded-md px-2 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 sm:inline-flex"
                >
                  <UserRound className="h-5 w-5 text-slate-600" />
                  <span className="max-w-[6rem] truncate">Hesap</span>
                </Link>
                {userRole === "butik" && (
                  <Link
                    href="/favorites"
                    className="inline-flex items-center gap-1 rounded-md p-2 text-rose-600 hover:bg-rose-50"
                    title="Favoriler"
                  >
                    <Heart className="h-5 w-5" fill="currentColor" />
                  </Link>
                )}
                {userRole === "butik" && <CartNavLink userId={user.id} initialCount={cartInitialCount} />}
                {userRole === "butik" && (
                  <Link
                    href="/siparislerim"
                    className="hidden rounded-md px-2 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 lg:inline"
                  >
                    Siparişler
                  </Link>
                )}
                {userRole === "admin" && (
                  <Link
                    href="/admin"
                    className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-semibold text-slate-900 hover:border-slate-300 sm:px-3"
                  >
                    Yönetim
                  </Link>
                )}
                {userRole === "toptanci" && (
                  <Link
                    href="/toptanci"
                    className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-semibold text-slate-900 hover:border-slate-300 sm:px-3"
                    >
                    Panel
                  </Link>
                )}
                <div className="pl-1">
                  <SignOutButton />
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="inline-flex min-h-10 items-center gap-1.5 rounded-md border border-blue-600 bg-blue-600 px-3 py-2 text-sm font-bold text-white shadow-sm hover:bg-blue-700 sm:px-4"
              >
                <LogIn className="h-4 w-4" />
                Giriş
              </Link>
            )}
          </div>
        </div>

        {/* Category mega row (desktop) */}
        <div className="hidden border-t border-slate-100 sm:block">
          <div className="flex h-10 items-center gap-1">
            <div
              className="relative"
              onMouseEnter={() => setMegaOpen(true)}
              onMouseLeave={() => setMegaOpen(false)}
            >
              <button
                type="button"
                className={cn(
                  "flex h-10 items-center gap-1 rounded-t-md border border-b-0 border-transparent px-3 text-sm font-semibold text-slate-800",
                  megaOpen && "border-slate-200 bg-white"
                )}
              >
                <LayoutGrid className="h-4 w-4" />
                Kategoriler
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {megaOpen && (
                <div className="absolute left-0 top-full z-50 w-screen max-w-3xl border border-slate-200 bg-white p-4 shadow-lg">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Koleksiyon</p>
                  <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
                    {CATALOG_CATEGORIES.filter((c) => c !== "Tümü").map((cat) => (
                      <Link
                        key={cat}
                        href={`/katalog?${new URLSearchParams({ category: cat }).toString()}`}
                        className="rounded-md px-2 py-2 text-sm text-slate-800 hover:bg-slate-100"
                        onClick={() => setMegaOpen(false)}
                      >
                        {cat}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Link
              href="/katalog"
              className={cn(
                "h-10 rounded-md px-3 text-sm font-semibold leading-10",
                pathname === "/katalog" ? "text-blue-600" : "text-slate-800 hover:text-blue-600"
              )}
            >
              Tüm katalog
            </Link>
            <Link
              href="/toptanci-gor"
              className="flex h-10 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <Store className="h-4 w-4" />
              Toptancılar
            </Link>
            <div className="ml-auto flex items-center gap-3 pl-2 text-xs font-medium text-slate-600 sm:gap-4 sm:text-sm">
              <Link href="/yardim" className="inline-flex h-10 items-center gap-1 hover:text-blue-600">
                <HelpCircle className="h-4 w-4 shrink-0" />
                Yardım
              </Link>
              {!user && (
                <Link
                  href="/register"
                  className="inline-flex h-10 items-center font-semibold text-blue-600 hover:underline"
                >
                  Ticari üyelik
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile slide-down */}
      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-3 py-3 sm:hidden">
          <nav className="flex flex-col gap-1 text-sm font-medium text-slate-800">
            <Link href="/katalog" onClick={() => setMobileOpen(false)} className="rounded-md px-2 py-2 hover:bg-slate-100">
              Katalog
            </Link>
            <Link href="/toptanci-gor" onClick={() => setMobileOpen(false)} className="rounded-md px-2 py-2 hover:bg-slate-100">
              Toptancılar
            </Link>
            <Link href="/yardim" onClick={() => setMobileOpen(false)} className="rounded-md px-2 py-2 hover:bg-slate-100">
              Yardım
            </Link>
            {user && userRole === "butik" && (
              <Link href="/siparislerim" onClick={() => setMobileOpen(false)} className="rounded-md px-2 py-2 hover:bg-slate-100">
                Siparişlerim
              </Link>
            )}
            {user && <Link href="/hesap/sifre" onClick={() => setMobileOpen(false)} className="rounded-md px-2 py-2 hover:bg-slate-100">
              Şifre
            </Link>}
          </nav>
        </div>
      )}
    </header>
  );
}
