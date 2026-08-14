"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Alert, PasswordInput } from "@/components/ui/Inputs";
import { IconLogOut, IconShield } from "@/components/icons";
import { CalendarDays, KeyRound, Mail } from "lucide-react";
import { formatTanggal } from "./constants";

const STATUS_AKUN_LABEL = {
  aktif: { label: "Aktif", cls: "bg-loop-primary text-white" },
  nonaktif: { label: "Nonaktif", cls: "bg-loop-signal text-white" },
  diblokir: { label: "Diblokir", cls: "bg-red-700 text-white" },
};

/**
 * Halaman Pengaturan Akun (Task 4.6.4).
 * Section:
 *   1. Informasi akun - email (read-only dari auth), anggota sejak, status.
 *   2. Ganti kata sandi - via supabase.auth.updateUser (pola ResetPasswordForm);
 *      minimal 8 karakter, seragam dengan jalur reset /reset-password.
 *   3. Sesi & perangkat - keluar dari perangkat ini (pola AppHeader).
 * Tidak ada fitur hapus akun (tidak ada kontrak backend/RLS DELETE profile).
 */
export default function PengaturanForm({ user, profile }) {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [konfirmasi, setKonfirmasi] = useState("");
  const [passError, setPassError] = useState(null);
  const [passNotice, setPassNotice] = useState(null);
  const [passLoading, setPassLoading] = useState(false);

  const [logoutBusy, setLogoutBusy] = useState(false);

  const statusMeta =
    STATUS_AKUN_LABEL[profile?.status_akun] ?? STATUS_AKUN_LABEL.aktif;

  async function handleGantiSandi(event) {
    event.preventDefault();
    setPassError(null);
    setPassNotice(null);

    if (password.length < 8) {
      setPassError("Kata sandi baru minimal 8 karakter.");
      return;
    }
    if (konfirmasi !== password) {
      setPassError("Konfirmasi kata sandi tidak sama.");
      return;
    }

    setPassLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setPassError("Gagal mengubah kata sandi. Coba lagi.");
        return;
      }

      setPassNotice("Kata sandi berhasil diperbarui.");
      setPassword("");
      setKonfirmasi("");
    } finally {
      setPassLoading(false);
    }
  }

  async function handleLogout() {
    setLogoutBusy(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // Tetap arahkan ke beranda walau signOut gagal; proxy akan menolak sesi.
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div>
      <header>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-loop-ink sm:text-3xl">
          Pengaturan akun
        </h1>
        <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-loop-line">
          Kelola keamanan dan sesi masuk akun LoopLink-mu.
        </p>
      </header>

      <div className="mt-6 space-y-6">
        {/* Informasi akun */}
        <section
          aria-labelledby="info-akun-heading"
          className="rounded-2xl border border-loop-mist bg-white shadow-sm"
        >
          <h2
            id="info-akun-heading"
            className="border-b border-loop-rowline px-6 py-4 font-display text-lg font-semibold tracking-tight text-loop-ink sm:px-8"
          >
            Informasi akun
          </h2>
          <dl className="divide-y divide-loop-rowline px-6 sm:px-8">
            <div className="flex flex-wrap items-center gap-3 py-4">
              <dt className="flex w-36 shrink-0 items-center gap-2 text-sm font-medium text-loop-line">
                <Mail className="h-4 w-4" />
                Email
              </dt>
              <dd className="min-w-0 flex-1 font-mono text-sm text-loop-ink">
                {user.email}
              </dd>
            </div>
            <div className="flex flex-wrap items-center gap-3 py-4">
              <dt className="flex w-36 shrink-0 items-center gap-2 text-sm font-medium text-loop-line">
                <CalendarDays className="h-4 w-4" />
                Anggota sejak
              </dt>
              <dd className="min-w-0 flex-1 font-mono text-sm text-loop-ink">
                {formatTanggal(profile?.created_at) || "-"}
              </dd>
            </div>
            <div className="flex flex-wrap items-center gap-3 py-4">
              <dt className="flex w-36 shrink-0 items-center gap-2 text-sm font-medium text-loop-line">
                <IconShield className="h-4 w-4" />
                Status akun
              </dt>
              <dd className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusMeta.cls}`}
                >
                  {statusMeta.label}
                </span>
                {profile?.status_akun !== "aktif" ? (
                  <span className="text-xs text-loop-line">
                    Akun dibatasi - hubungi pengelola bila merasa salah.
                  </span>
                ) : null}
              </dd>
            </div>
          </dl>
        </section>

        {/* Ganti kata sandi */}
        <section
          aria-labelledby="sandi-heading"
          className="rounded-2xl border border-loop-mist bg-white p-6 shadow-sm sm:p-8"
        >
          <h2
            id="sandi-heading"
            className="font-display text-lg font-semibold tracking-tight text-loop-ink"
          >
            Ganti kata sandi
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-loop-line">
            Gunakan kata sandi baru minimal 8 karakter. Sesi perangkat lain
            ikut dipakai ulang dengan kata sandi baru.
          </p>

          <form onSubmit={handleGantiSandi} noValidate className="mt-5 space-y-4">
            <PasswordInput
              label="Kata sandi baru"
              name="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={null}
              hint="Minimal 8 karakter."
            />
            <PasswordInput
              label="Ulangi kata sandi baru"
              name="konfirmasi"
              required
              autoComplete="new-password"
              value={konfirmasi}
              onChange={(e) => setKonfirmasi(e.target.value)}
              error={null}
            />

            {passNotice ? <Alert variant="success">{passNotice}</Alert> : null}
            {passError ? <Alert variant="error">{passError}</Alert> : null}

            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="submit"
                variant="primary"
                loading={passLoading}
                disabled={passLoading}
              >
                <KeyRound className="h-4 w-4" />
                Perbarui Kata Sandi
              </Button>
              <a
                href="/lupa-password"
                className="fr rounded text-sm font-medium text-loop-primary hover:text-loop-primary-hover"
              >
                Lupa sandi lama?
              </a>
            </div>
          </form>
        </section>

        {/* Sesi & perangkat */}
        <section
          aria-labelledby="sesi-heading"
          className="rounded-2xl border border-loop-mist bg-white p-6 shadow-sm sm:p-8"
        >
          <h2
            id="sesi-heading"
            className="font-display text-lg font-semibold tracking-tight text-loop-ink"
          >
            Sesi & perangkat
          </h2>
          <p className="mt-1 max-w-lg text-sm leading-relaxed text-loop-line">
            Kamu sedang masuk sebagai{" "}
            <span className="font-mono font-medium text-loop-ink">
              {user.email}
            </span>{" "}
            di perangkat ini. Keluar untuk mengakhiri sesi. Penghapusan akun
            tidak tersedia saat ini.
          </p>
          <div className="mt-5">
            <Button
              type="button"
              variant="danger"
              onClick={handleLogout}
              loading={logoutBusy}
              disabled={logoutBusy}
            >
              <IconLogOut className="h-4 w-4" />
              Keluar
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}