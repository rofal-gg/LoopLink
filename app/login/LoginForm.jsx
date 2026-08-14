"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import {
  Alert,
  PasswordInput,
  TextInput,
} from "@/components/ui/Inputs";

/** Path internal yang diizinkan untuk redirect setelah login. */
const ALLOWED_NEXT = new Set(["/home", "/setup-lokasi", "/upload", "/cari"]);

function safeNext(raw) {
  if (typeof raw !== "string") return "/home";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/home";
  const path = raw.split("?")[0];
  return ALLOWED_NEXT.has(path) ? raw : "/home";
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const resetOk = searchParams.get("reset") === "1";

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Email dan kata sandi wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        let message = "Gagal masuk. Coba lagi.";
        if (/invalid login credentials/i.test(authError.message || "")) {
          message =
            "Email atau kata sandi salah. Periksa kembali atau ganti kata sandi lewat tautan lupa kata sandi.";
        } else if (/email not confirmed/i.test(authError.message || "")) {
          message =
            "Email belum diverifikasi. Cek kotak masuk untuk tautan verifikasi.";
        }
        setError(message);
        return;
      }

      router.push(safeNext(searchParams.get("next")));
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {resetOk ? (
        <div className="mb-4">
          <Alert variant="success">
            Kata sandi berhasil diubah. Silakan masuk dengan kata sandi baru.
          </Alert>
        </div>
      ) : null}

      <div className="space-y-4">
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
          error={null}
        />
        <PasswordInput
          label="Kata sandi"
          name="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={null}
          hint={
            <span className="flex justify-end">
              <a
                href="/lupa-password"
                className="fr rounded font-medium text-loop-primary hover:underline"
              >
                Lupa kata sandi?
              </a>
            </span>
          }
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
        Masuk
      </Button>

      <p className="mt-5 rounded-xl border border-dashed border-loop-mist bg-loop-mist/50 px-3.5 py-2.5 text-xs leading-relaxed text-loop-line">
        Akun demo peserta: budi@looplink.demo, sari@looplink.demo, agus@looplink.demo
        (kata sandi: looplink123). Admin: admin@looplink.demo.
      </p>
    </form>
  );
}