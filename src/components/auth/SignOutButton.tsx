"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function SignOutButton() {
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
      className="rounded-lg border border-anthracite-200 bg-white px-3 py-2 text-sm font-medium text-anthracite-600 transition hover:border-anthracite-300 hover:bg-anthracite-50 disabled:opacity-60"
    >
      {busy ? "Çıkış…" : "Çıkış"}
    </button>
  );
}
