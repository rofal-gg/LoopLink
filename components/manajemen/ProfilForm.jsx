"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Alert, TextArea, TextInput } from "@/components/ui/Inputs";
import {
  IconCheck,
  IconMapPin,
  IconPen,
} from "@/components/icons";
import {
  CalendarDays,
  Mail,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";
import { formatTanggal } from "./constants";

/**
 * Halaman Profil: mode Lihat (default) dan Edit dalam satu halaman.
 * - Mode Lihat: kartu identitas + daftar info profil + tombol Edit Profil.
 * - Mode Edit: form nama_lengkap (wajib), no_telepon (opsional),
 *   alamat_teks (opsional). Simpan via upsert profiles RLS self
 *   (onConflict id), pola SetupLokasiForm. Email TIDAK bisa diedit
 *   (dikelola auth).
 */
export default function ProfilForm({ user, profile }) {
  // Profil null (jalur email confirmation tanpa row profile) -> mulai dari Edit.
  const [mode, setMode] = useState(profile ? "lihat" : "edit");

  const [nama, setNama] = useState(profile?.nama_lengkap ?? "");
  const [noTelepon, setNoTelepon] = useState(profile?.no_telepon ?? "");
  const [alamat, setAlamat] = useState(profile?.alamat_teks ?? "");

  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  const hasLocation =
    !!profile &&
    (profile.alamat_teks ||
      profile.lokasi_lat != null ||
      profile.lokasi_lng != null);

  const initial = (nama || user.email || "?").trim().charAt(0).toUpperCase();

  function keModeEdit() {
    setNotice(null);
    setFormError(null);
    setFieldErrors({});
    setMode("edit");
  }

  async function handleSave(event) {
    event.preventDefault();
    setFormError(null);
    setNotice(null);

    const errors = {};
    if (!nama.trim()) errors.nama = "Nama lengkap wajib diisi.";
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    try {
      const supabase = createClient();
      const payload = {
        id: user.id,
        nama_lengkap: nama.trim(),
        no_telepon: noTelepon.trim() || null,
        alamat_teks: alamat.trim() || null,
      };
      const { error } = await supabase
        .from("profiles")
        .upsert(payload, { onConflict: "id" });

      if (error) {
        setFormError("Gagal menyimpan profil. Coba lagi, atau muat ulang halaman.");
        return;
      }

      setNotice("Profil berhasil diperbarui.");
      setMode("lihat");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <header>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-loop-ink sm:text-3xl">
          Profil saya
        </h1>
        <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-loop-line">
          Informasi yang kamu tampilkan ke warga lain saat bertukar bahan.
          Email tidak bisa diubah dari sini.
        </p>
      </header>

      {notice ? (
        <div className="mt-6">
          <Alert variant="success">{notice}</Alert>
        </div>
      ) : null}

      {mode === "lihat" ? (
        <div className="mt-6 space-y-6">
          {/* Kartu identitas */}
          <section
            aria-label="Identitas"
            className="rounded-2xl border border-loop-mist bg-white p-6 shadow-sm sm:p-8"
          >
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-loop-primary text-2xl font-semibold text-loop-base">
                {initial}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-xl font-semibold tracking-tight text-loop-ink">
                  {profile?.nama_lengkap || "Anggota LoopLink"}
                </p>
                <p className="mt-0.5 flex items-center justify-center gap-1.5 truncate font-mono text-xs text-loop-line sm:justify-start">
                  <Mail className="h-3.5 w-3.5" />
                  {user.email}
                </p>
              </div>
              <Button
                type="button"
                variant="primary"
                onClick={keModeEdit}
                className="shrink-0"
              >
                <IconPen className="h-4 w-4" />
                Edit Profil
              </Button>
            </div>
          </section>

          {/* Daftar info */}
          <section
            aria-label="Informasi profil"
            className="rounded-2xl border border-loop-mist bg-white shadow-sm"
          >
            <dl className="divide-y divide-loop-rowline px-6 sm:px-8">
              <InfoRow
                icon={Phone}
                label="No. telepon"
                value={profile?.no_telepon || "Belum diisi"}
              />
              <InfoRow
                icon={IconMapPin}
                label="Alamat"
                value={profile?.alamat_teks || "Belum diisi"}
              />
              <div className="flex flex-wrap items-center gap-3 py-4">
                <dt className="w-28 shrink-0 text-sm font-medium text-loop-line">
                  <span className="inline-flex items-center gap-2">
                    <IconMapPin className="h-4 w-4" />
                    Lokasi deteksi
                  </span>
                </dt>
                <dd className="flex min-w-0 flex-1 flex-wrap items-center gap-2 text-sm">
                  {hasLocation ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-loop-primary/10 px-2.5 py-1 text-xs font-semibold text-loop-primary">
                      <IconCheck className="h-3.5 w-3.5" />
                      Lokasi tersimpan
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900">
                      <IconMapPin className="h-3.5 w-3.5" />
                      Belum disimpan
                    </span>
                  )}
                  <Link
                    href="/setup-lokasi"
                    className="fr rounded font-medium text-loop-primary hover:text-loop-primary-hover"
                  >
                    Ubah lokasi
                  </Link>
                </dd>
              </div>
              <InfoRow
                icon={CalendarDays}
                label="Anggota sejak"
                value={formatTanggal(profile?.created_at) || "-"}
                mono
              />
            </dl>
          </section>

          <p className="flex items-start gap-2 text-xs leading-relaxed text-loop-line">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
            Info pemilik hanya tampil untuk warga yang sudah login dan relevan
            dengan transaksimu.
          </p>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-loop-mist bg-white p-6 shadow-sm sm:p-8">
          <form onSubmit={handleSave} noValidate className="space-y-5">
            <TextInput
              label="Nama lengkap"
              name="nama"
              autoComplete="name"
              required
              placeholder="Contoh: Budi Santoso"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              error={fieldErrors.nama}
            />

            <TextInput
              label="No. telepon (opsional)"
              name="no_telepon"
              type="tel"
              autoComplete="tel"
              placeholder="Contoh: 0812-3456-7890"
              value={noTelepon}
              onChange={(e) => setNoTelepon(e.target.value)}
              hint="Dipakai pemilik/pengklaim lain untuk koordinasi pengambilan."
            />

            <TextArea
              label="Alamat lengkap (opsional)"
              name="alamat"
              rows={3}
              placeholder="Contoh: Jl. Rungkut Asri No. 12, Surabaya"
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              hint="Kamu juga bisa mengatur titik lokasi GPS dari halaman Setup Lokasi."
            />

            {formError ? <Alert variant="error">{formError}</Alert> : null}

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={saving}
                className="sm:flex-none"
              >
                Simpan Profil
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="lg"
                onClick={() => {
                  setNotice(null);
                  setFormError(null);
                  setFieldErrors({});
                  setMode("lihat");
                }}
                disabled={saving}
              >
                Batal
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, mono = false }) {
  return (
    <div className="flex flex-wrap items-center gap-3 py-4">
      <dt className="w-28 shrink-0 text-sm font-medium text-loop-line">
        <span className="inline-flex items-center gap-2">
          <Icon className="h-4 w-4" />
          {label}
        </span>
      </dt>
      <dd
        className={`min-w-0 flex-1 text-sm text-loop-ink ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </dd>
    </div>
  );
}