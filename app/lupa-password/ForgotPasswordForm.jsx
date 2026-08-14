"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Alert, TextInput } from "@/components/ui/Inputs";
import { IconMail } from "@/components/icons";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    const value = email.trim();
    if (!value) {
      setError("Email wajib diisi.");
      return;
    }
    if (!EMAIL_RE.test(value)) {
      setError("Format email belum benar.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error: sendError } =
        await supabase.auth.resetPasswordForEmail(value, { redirectTo });

      if (sendError) {
        setError("Gagal mengirim tautan. Coba lagi sebentar.");
        return;
      }

      // Sama-sama diproses sebagai "terkirim" walau email tidak terdaftar
      // (anti user enumeration).
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-loop-mist text-loop-primary">
          <IconMail className="h-7 w-7" />
        </div>
        <h2 className="mt-5 text-lg font-semibold text-loop-ink">
          Kalau email terdaftar, tautan sudah dikirim
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-loop-line">
          Periksa kotak masuk <span className="font-medium">{email}</span> dan
          folder spam. Tautan berlaku beberapa saat, jadi segera buka.
        </p>
        <div className="mt-6">
          <ButtonLinkInline />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
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
        error={error}
      />

      {error && !sent ? (
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
        Kirim Tautan Reset
      </Button>
    </form>
  );
}

// Inline helper supaya panel "terkirim" punya tombol kembali ke login.
function ButtonLinkInline() {
  return (
    <a
      href="/login"
      className="fr inline-flex items-center justify-center rounded-full bg-loop-primary px-6 py-3 text-base font-medium text-white hover:bg-loop-primary-hover"
    >
      Kembali ke Masuk
    </a>
  );
}