"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export function CartNavLink({
  userId,
  initialCount,
}: {
  userId: string;
  initialCount: number;
}) {
  const [count, setCount] = useState(initialCount);
  const pathname = usePathname();

  const refresh = useCallback(async () => {
    const supabase = createClient();
    const { count: c } = await supabase
      .from("shopping_list_items")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    setCount(c ?? 0);
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [pathname, refresh]);

  return (
    <Link
      href="/sepet"
      className="relative flex h-9 items-center gap-1.5 rounded-xl px-3 text-sm font-medium text-anthracite-600 transition hover:bg-anthracite-100/80 hover:text-anthracite-900"
    >
      <ShoppingCart className="h-4 w-4 shrink-0" strokeWidth={2} />
      Sepet
      {count > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold leading-none text-white">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}
