"use client";

import Link from "next/link";
import { RefreshCw } from "lucide-react";
import Logo from "@/components/brand/Logo";
import { IconAlert, IconHome } from "@/components/icons";

/**
 * Error koneksi/server (Task 4.7).
 * Client Component bawaan Next.js (app/error.js) - menangani error dari
 * segment di bawahnya. `reset()` dioper oleh Next untuk mencoba render ulang
 * segment yang gagal. Standalone, tanpa AppHeader.
 */
export default function ErrorPage({ error, reset }) {
  const koneksiBermasalah = /(fetch|network|connection|econnrefused|timeout)/i.test(
    error?.message ?? ""
  );

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-loop-base px-4 py-10">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center">
          <Logo />
        </div>

        <div className="mt-8 rounded-[20px] border border-loop-mist bg-white p-8 shadow-[0_12px_40px_rgba(28,43,34,0.08)] sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-700">
            <IconAlert className="h-7 w-7" strokeWidth={1.8} />
          </div>
          <h1 className="mt-5 font-display text-2xl font-bold tracking-tight text-loop-ink">
            {koneksiBermasalah ? "Koneksi ke server bermasalah" : "Terjadi kesalahan"}
          </h1>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-loop-line">
            {koneksiBermasalah
              ? "LoopLink tidak dapat terhubung ke server. Periksa koneksi internetmu dan coba lagi."
              : "Halaman ini gagal dimuat karena kesalahan yang tidak terduga. Coba lagi, atau kembali ke beranda."}
          </p>
          {error?.digest ? (
            <p className="mt-3 font-mono text-[11px] text-loop-line">
              Kode kesalahan: {error.digest}
            </p>
          ) : null}

          <div className="mt-7 flex flex-col items-center justify-center gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => reset()}
              className="fr inline-flex items-center gap-2 rounded-full bg-loop-primary px-5 py-2.5 text-sm font-semibold text-loop-base shadow-[0_3px_12px_rgba(60,122,92,0.4)] transition hover:bg-loop-primary-hover"
            >
              <RefreshCw className="h-4 w-4" />
              Coba Lagi
            </button>
            <Link
              href="/home"
              className="fr inline-flex items-center gap-2 rounded-full border border-loop-mist bg-white px-5 py-2.5 text-sm font-semibold text-loop-ink transition hover:border-loop-primary/50 hover:bg-loop-base"
            >
              <IconHome className="h-4 w-4" />
              Ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}