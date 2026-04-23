"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function SignOutButton({ className = "" }: { className?: string }) {
  const [busy, setBusy] = useState(false);

  async function handleSignOut() {
    setBusy(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut({ scope: "global" });
    } finally {
      window.location.assign("/");
    }
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={handleSignOut}
      className={`rounded-md border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60 sm:text-sm ${className}`}
    >
      {busy ? "Cikis..." : "Cikis"}
    </button>
  );
}
