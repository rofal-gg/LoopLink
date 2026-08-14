"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { IconHome, IconLogOut } from "@/components/icons";

/**
 * Tombol aksi halaman "Akses tidak diizinkan".
 * Butuh client karena "Keluar & masuk ulang" memanggil signOut() dulu supaya
 * sesi yang tidak diizinkan tidak membuat user stuck.
 */
export default function UnauthorizedActions() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function keluarDanMasuk() {
    setBusy(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // Tetap arahkan ke login; proxy akan menolak sesi yang ada.
    }
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="mt-7 flex flex-col items-center justify-center gap-2 sm:flex-row">
      <button
        type="button"
        onClick={keluarDanMasuk}
        disabled={busy}
        className="fr inline-flex items-center gap-2 rounded-full bg-loop-primary px-5 py-2.5 text-sm font-semibold text-loop-base shadow-[0_3px_12px_rgba(60,122,92,0.4)] transition hover:bg-loop-primary-hover disabled:opacity-60"
      >
        <IconLogOut className="h-4 w-4" />
        Keluar & masuk ulang
      </button>
      <Link
        href="/home"
        className="fr inline-flex items-center gap-2 rounded-full border border-loop-mist bg-white px-5 py-2.5 text-sm font-semibold text-loop-ink transition hover:border-loop-primary/50 hover:bg-loop-base"
      >
        <IconHome className="h-4 w-4" />
        Ke Beranda
      </Link>
    </div>
  );
}