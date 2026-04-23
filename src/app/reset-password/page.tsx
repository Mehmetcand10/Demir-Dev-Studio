"use client";

import { useState, useEffect, useRef } from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { createImplicitRecoveryClient } from "@/utils/supabase/recovery-client";
import { LockKeyhole, Loader2 } from "lucide-react";
import Link from "next/link";
import { AuthCard } from "@/components/layout/AuthCard";

async function waitForSession(
  supabase: SupabaseClient,
  maxMs = 8000
) {
  const step = 200;
  for (let t = 0; t < maxMs; t += step) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) return session;
    await new Promise((r) => setTimeout(r, step));
  }
  return null;
}

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [allowReset, setAllowReset] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  const supabaseRef = useRef<SupabaseClient | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        if (typeof window === "undefined") return;

        const url = new URL(window.location.href);
        const hasPkceCode = url.searchParams.has("code");

        let client: SupabaseClient;
        let session: Session | null = null;

        if (hasPkceCode) {
          client = createClient();
          const { error: exErr } = await client.auth.exchangeCodeForSession(
            window.location.href
          );
          if (cancelled) return;
          if (exErr) {
            setInitError(
              "Bağlantı geçersiz veya süresi dolmuş. «Şifremi unuttum» ile yeni e-posta isteyin."
            );
            setSessionChecked(true);
            return;
          }
          window.history.replaceState({}, "", `${url.pathname}${url.hash}`);
          const { data: d1 } = await client.auth.getSession();
          session = d1.session;
        } else {
          client = createImplicitRecoveryClient();
          await client.auth.getSession();
          const { data: d2 } = await client.auth.getSession();
          session = d2.session;
          if (!session) {
            session = await waitForSession(client);
          }
        }

        if (cancelled) return;

        if (session) {
          supabaseRef.current = client;
          setAllowReset(true);
        } else {
          setInitError(
            "Kimlik doğrulama oturumu bulunamadı. E-postadaki bağlantıya tıkladıysanız süre dolmuş olabilir veya bağlantı eksik gelmiş olabilir; yeni bir «şifremi unuttum» isteği gönderin."
          );
        }
      } catch {
        if (!cancelled) {
          setInitError(
            "Oturum başlatılamadı. Sayfayı yenileyin veya yeni sıfırlama e-postası isteyin."
          );
        }
      } finally {
        if (!cancelled) setSessionChecked(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır.");
      return;
    }
    if (password !== confirm) {
      setError("Şifreler eşleşmiyor.");
      return;
    }
    setLoading(true);
    setError(null);

    const supabase = supabaseRef.current;
    if (!supabase) {
      setLoading(false);
      setError(
        "Oturum hazır değil. Bu sayfaya e-postadaki bağlantı ile gelmelisiniz."
      );
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      setError(
        "Oturum yok. Bağlantıyı e-postadan tekrar açın veya yeni sıfırlama isteyin."
      );
      return;
    }

    const { error: upErr } = await supabase.auth.updateUser({ password });
    if (!upErr) {
      await supabase.auth.signOut();
    }
    setLoading(false);
    if (upErr) {
      setError(
        "Şifre güncellenemedi: " +
          (upErr.message || "Bilinmeyen hata. Tekrar deneyin.")
      );
    } else {
      setSuccess(true);
    }
  };

  if (!sessionChecked) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
        <AuthCard className="max-w-md text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-sky-600" />
          <p className="mt-4 text-sm font-medium text-anthracite-600">
            Baglanti dogrulaniyor...
          </p>
        </AuthCard>
      </div>
    );
  }

  if (initError && !allowReset) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
        <AuthCard className="max-w-md text-center">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-amber-100 bg-amber-50 text-amber-800">
            <LockKeyhole className="h-6 w-6" strokeWidth={2} />
          </div>
          <h1 className="mb-2 text-xl font-semibold text-anthracite-900">
            Sifre sifirlama
          </h1>
          <p className="mb-6 text-sm text-anthracite-600">{initError}</p>
          <div className="flex flex-col gap-2">
            <Link
              href="/forgot-password"
              className="inline-block w-full rounded-xl bg-anthracite-900 py-3 text-sm font-medium text-white transition hover:bg-anthracite-800"
            >
              Yeni baglanti iste
            </Link>
            <Link
              href="/login"
              className="inline-block w-full rounded-xl border border-anthracite-200 py-3 text-sm font-medium text-anthracite-700 transition hover:bg-anthracite-50"
            >
              Girise don
            </Link>
          </div>
        </AuthCard>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
        <AuthCard className="max-w-md text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm">
            <LockKeyhole className="h-7 w-7" strokeWidth={2} />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-anthracite-900">
            Sifre guncellendi
          </h2>
          <p className="mb-6 text-sm text-anthracite-600">
            Yeni sifrenizle giris yapabilirsiniz.
          </p>
          <Link
            href="/login"
            className="inline-block w-full rounded-xl bg-anthracite-900 py-3 text-sm font-medium text-white transition hover:bg-anthracite-800"
          >
            Giris yap
          </Link>
        </AuthCard>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <AuthCard className="max-w-md text-center">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-sky-700">
          <LockKeyhole className="h-6 w-6" strokeWidth={2} />
        </div>

        <h1 className="mb-2 text-xl font-semibold text-anthracite-900">
          Yeni sifre
        </h1>
        <p className="mb-6 text-sm text-anthracite-600">
          Hesabiniz icin yeni bir sifre belirleyin.
        </p>

        {error && (
          <div className="mb-4 rounded-xl border border-red-100 bg-red-50/90 p-3 text-left text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleUpdate} className="flex flex-col gap-3 text-left">
          <div>
            <label className="mb-1 block text-xs font-medium text-anthracite-600">
              Yeni sifre
            </label>
            <input
              required
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="premium-input"
              placeholder="En az 6 karakter"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-anthracite-600">
              Yeni sifre (tekrar)
            </label>
            <input
              required
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="premium-input"
              placeholder="Tekrar girin"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-premium-sky w-full"
          >
            {loading ? "Kaydediliyor..." : "Sifreyi kaydet"}
          </button>
        </form>
      </AuthCard>
    </div>
  );
}
