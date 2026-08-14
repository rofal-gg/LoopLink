import { createClient } from "@/lib/supabase/server";
import Logo from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { IconHome, IconSearch } from "@/components/icons";

export const dynamic = "force-dynamic";

/**
 * 404 Not Found (Task 4.7).
 * File khusus Next.js - menangani semua rute yang tidak dikenal.
 * Standalone (tanpa AppHeader). Fallback untuk user yang belum login:
 * hanya tautan ke beranda publik; user login mendapat tambahan Dashboard.
 */
export default async function NotFound() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-loop-base px-4 py-10">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center">
          <Logo />
        </div>

        <div className="mt-8 rounded-[20px] border border-loop-mist bg-white p-8 shadow-[0_12px_40px_rgba(28,43,34,0.08)] sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-loop-mist text-loop-primary">
            <IconSearch className="h-7 w-7" strokeWidth={1.8} />
          </div>
          <p className="mt-5 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-loop-primary">
            Error 404
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-loop-ink">
            Halaman tidak ditemukan
          </h1>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-loop-line">
            Alamat yang kamu tuju tidak ada atau sudah dipindah. Periksa
            kembali tautanmu, atau kembali ke beranda.
          </p>

          <div className="mt-7 flex flex-col items-center justify-center gap-2 sm:flex-row">
            <ButtonLink href="/" variant="secondary">
              <IconHome className="h-4 w-4" />
              Beranda
            </ButtonLink>
            {user ? (
              <ButtonLink href="/home" variant="primary">
                Dashboard
              </ButtonLink>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}