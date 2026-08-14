"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Alert, PasswordInput } from "@/components/ui/Inputs";
import { IconAlert, IconLock } from "@/components/icons";

export default function ResetPasswordForm() {
  const router = useRouter();

  // status: "memeriksa" | "siap" | "gagal"
  const [status, setStatus] = useState("memeriksa");
  const [password, setPassword] = useState("");
  const [konfirmasi, setKonfirmasi] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Pada mount: ambil session dari hash recovery (#access_token=...
  // &type=recovery&refresh_token=...) lalu setSession. Kalau hash tidak ada,
  // cek apakah sudah ada session valid (misal pengguna membuka halaman ini
  // dalam keadaan login).
  useEffect(() => {
    let cancelled = false;

    async function init() {
      const supabase = createClient();
      try {
        const hashParams = new URLSearchParams(
          window.location.hash.replace(/^#/, "")
        );
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const type = hashParams.get("type");

        let hasSession = false;

        if (accessToken) {
          const { data, error: setError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || "",
          });
          hasSession = !setError && !!data.session;
        } else {
          const { data } = await supabase.auth.getSession();
          hasSession = !!data.session;
        }

        // Hash recovery tanpa token yang bisa dipakai -> anggap tautan tidak
        // valid, kecuali sudah ada session normal.
        if (!hasSession) {
          if (!cancelled) setStatus("gagal");
          return;
        }

        // Kalau ada hash tapi typenya bukan recovery, tetap lanjut bila
        // session sudah terpasang (token memang untuk recovery).
        if (!cancelled) setStatus("siap");
      } catch {
        if (!cancelled) setStatus("gagal");
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Kata sandi baru minimal 8 karakter.");
      return;
    }
    if (konfirmasi !== password) {
      setError("Konfirmasi kata sandi tidak sama.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        if (/(expired|invalid|kadaluarsa)/i.test(updateError.message || "")) {
          setError(
            "Tautan pemulihan sudah kedaluwarsa. Minta tautan baru dari halaman lupa kata sandi."
          );
        } else {
          setError("Gagal mengubah kata sandi. Coba lagi.");
        }
        return;
      }

      // Bersihkan sesi recovery, lalu arahkan ke halaman masuk dengan pesan.
      await supabase.auth.signOut();
      router.push("/login?reset=1");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (status === "memeriksa") {
    return (
      <div className="flex items-center justify-center py-10 text-loop-line">
        <IconLock className="h-5 w-5 animate-pulse" />
        <span className="ml-2 text-sm">Memeriksa tautan...</span>
      </div>
    );
  }

  if (status === "gagal") {
    return (
      <div>
        <Alert variant="error">
          Tautan pemulihan tidak valid atau sudah kedaluwarsa. Silakan minta
          tautan baru dari halaman lupa kata sandi.
        </Alert>
        <ButtonLinkLupa className="mt-5" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="space-y-4">
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
      </div>

      {error ? (
        <div className="mt-4">
          <Alert variant="error">{error}</Alert>
        </div>
      ) : null}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="mt-6 w-full"
        loading={loading}
      >
        Simpan Kata Sandi Baru
      </Button>
    </form>
  );
}

function ButtonLinkLupa({ className = "" }) {
  return (
    <a
      href="/lupa-password"
      className={`fr inline-flex items-center justify-center gap-2 rounded-full bg-loop-primary px-6 py-3 text-base font-medium text-white hover:bg-loop-primary-hover ${className}`}
    >
      <IconAlert className="h-4 w-4" />
      Minta Tautan Baru
    </a>
  );
}