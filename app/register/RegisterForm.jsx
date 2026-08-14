"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/Button";
import {
  Alert,
  PasswordInput,
  TextInput,
} from "@/components/ui/Inputs";
import { IconMail } from "@/components/icons";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterForm() {
  const router = useRouter();

  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [konfirmasi, setKonfirmasi] = useState("");

  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [perluVerifikasi, setPerluVerifikasi] = useState(false);

  function validasi() {
    const errors = {};
    if (!nama.trim()) errors.nama = "Nama lengkap wajib diisi.";
    if (!email.trim()) errors.email = "Email wajib diisi.";
    else if (!EMAIL_RE.test(email.trim()))
      errors.email = "Format email belum benar.";
    if (!password) errors.password = "Kata sandi wajib diisi.";
    else if (password.length < 8)
      errors.password = "Kata sandi minimal 8 karakter.";
    if (konfirmasi !== password)
      errors.konfirmasi = "Konfirmasi kata sandi tidak sama.";
    return errors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    const errors = validasi();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (authError) {
        let message = "Gagal mendaftar. Coba lagi.";
        if (/already registered/i.test(authError.message || "")) {
          message =
            "Email ini sudah terdaftar. Coba masuk atau gunakan tautan lupa kata sandi.";
        }
        setError(message);
        return;
      }

      // Skenario A: email confirmation OFF -> langsung dapat session.
      if (data.session && data.user) {
        await supabase
          .from("profiles")
          .upsert(
            { id: data.user.id, nama_lengkap: nama.trim() },
            { onConflict: "id" }
          );
        router.push("/setup-lokasi");
        router.refresh();
        return;
      }

      // Skenario B: email confirmation ON -> tidak ada session.
      setPerluVerifikasi(true);
    } finally {
      setLoading(false);
    }
  }

  if (perluVerifikasi) {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-loop-mist text-loop-primary">
          <IconMail className="h-7 w-7" />
        </div>
        <h2 className="mt-5 text-lg font-semibold text-loop-ink">
          Cek email kamu
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-loop-line">
          Kami mengirim tautan verifikasi ke{" "}
          <span className="font-medium text-loop-ink">
            {email}
          </span>
          . Buka email itu, klik tautannya, lalu kembali untuk masuk. Jangan
          lupa cek folder spam.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <ButtonLink href="/login" variant="primary" className="w-full">
            Lanjut ke Halaman Masuk
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="space-y-4">
        <TextInput
          label="Nama lengkap"
          name="nama"
          autoComplete="name"
          placeholder="Contoh: Budi Santoso"
          required
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          error={fieldErrors.nama}
          hint="Akan ditampilkan ke pengguna lain saat listing atau klaim."
        />
        <TextInput
          label="Email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="nama@contoh.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
        />
        <PasswordInput
          label="Kata sandi"
          name="password"
          required
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
          hint="Minimal 8 karakter."
        />
        <PasswordInput
          label="Ulangi kata sandi"
          name="konfirmasi"
          required
          autoComplete="new-password"
          value={konfirmasi}
          onChange={(e) => setKonfirmasi(e.target.value)}
          error={fieldErrors.konfirmasi}
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
        Daftar Gratis
      </Button>

      <p className="mt-4 text-xs leading-relaxed text-loop-line/80">
        Dengan mendaftar, kamu menyetujui penggunaan data untuk keperluan
        pertukaran limbah di platform ini.
      </p>
    </form>
  );
}