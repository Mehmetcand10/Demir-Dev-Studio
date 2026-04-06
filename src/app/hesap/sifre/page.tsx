"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, KeyRound, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { AuthCard } from "@/components/layout/AuthCard";

export default function HesapSifreDegistir() {
  const supabase = createClient();
  const [email, setEmail] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    void (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setEmail(user?.email ?? null);
      setChecking(false);
    })();
  }, [supabase.auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Oturum bulunamadı. Giriş yapın.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Yeni şifre en az 6 karakter olmalıdır.");
      return;
    }
    if (newPassword !== confirm) {
      setError("Yeni şifreler eşleşmiyor.");
      return;
    }
    if (!currentPassword.trim()) {
      setError("Mevcut şifrenizi girin.");
      return;
    }

    setLoading(true);
    setError(null);

    const { error: signErr } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    });
    if (signErr) {
      setLoading(false);
      setError(
        "Mevcut şifre hatalı. Şifrenizi unuttuysanız çıkış yapıp «Şifremi unuttum» kullanın."
      );
      return;
    }

    const { error: upErr } = await supabase.auth.updateUser({
      password: newPassword,
    });
    setLoading(false);
    if (upErr) {
      setError(upErr.message || "Şifre güncellenemedi.");
    } else {
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
    }
  };

  if (checking) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!email) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
        <AuthCard className="max-w-md text-center">
          <p className="mb-6 text-sm text-anthracite-600">
            Şifre değiştirmek için giriş yapmalısınız.
          </p>
          <Link
            href="/login"
            className="inline-block w-full rounded-xl bg-anthracite-900 py-3 text-sm font-medium text-white transition hover:bg-anthracite-800"
          >
            Giriş
          </Link>
        </AuthCard>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
        <AuthCard className="max-w-md text-center">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700">
            <KeyRound className="h-6 w-6" strokeWidth={2} />
          </div>
          <h1 className="mb-2 text-xl font-semibold text-anthracite-900">
            Şifre güncellendi
          </h1>
          <p className="mb-6 text-sm text-anthracite-600">
            Bir sonraki girişinizde yeni şifrenizi kullanın.
          </p>
          <Link
            href="/katalog"
            className="inline-block w-full rounded-xl bg-anthracite-900 py-3 text-sm font-medium text-white transition hover:bg-anthracite-800"
          >
            Kataloga git
          </Link>
        </AuthCard>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <AuthCard className="relative max-w-md text-left">
        <Link
          href="/katalog"
          className="absolute left-4 top-4 text-anthracite-400 transition hover:text-anthracite-700"
          aria-label="Geri"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2} />
        </Link>

        <div className="mx-auto mb-5 mt-6 flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600">
          <KeyRound className="h-6 w-6" strokeWidth={2} />
        </div>

        <h1 className="mb-1 text-center text-xl font-semibold text-anthracite-900">
          Şifre değiştir
        </h1>
        <p className="mb-6 text-center text-sm text-anthracite-600">
          Önce mevcut şifrenizi doğrulayın, ardından yeni şifrenizi girin.
        </p>

        {error && (
          <div className="mb-4 rounded-xl border border-red-100 bg-red-50/90 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-anthracite-600">
              Mevcut şifre
            </label>
            <input
              required
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-xl border border-anthracite-200/90 bg-anthracite-50/50 px-3.5 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/15"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-anthracite-600">
              Yeni şifre
            </label>
            <input
              required
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-xl border border-anthracite-200/90 bg-anthracite-50/50 px-3.5 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/15"
              placeholder="En az 6 karakter"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-anthracite-600">
              Yeni şifre (tekrar)
            </label>
            <input
              required
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-xl border border-anthracite-200/90 bg-anthracite-50/50 px-3.5 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/15"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full rounded-xl bg-anthracite-900 py-3 text-sm font-medium text-white transition hover:bg-anthracite-800 disabled:opacity-50"
          >
            {loading ? "Kaydediliyor…" : "Yeni şifreyi kaydet"}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-anthracite-500">
          <Link href="/forgot-password" className="font-medium text-emerald-700 hover:underline">
            Şifremi unuttum
          </Link>{" "}
          (e-posta ile sıfırlama)
        </p>
      </AuthCard>
    </div>
  );
}
