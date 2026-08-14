"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Alert, TextArea, TextInput } from "@/components/ui/Inputs";
import {
  IconCheck,
  IconMapPin,
  IconNav,
  IconPen,
} from "@/components/icons";

/**
 * Setup Lokasi Awal.
 * - Tombol "Pakai Lokasi Sekarang": geolokasi + reverse geocode (Nominatim,
 *   tanpa API key) dengan fallback koordinat.
 * - Form alamat manual SELALU tersedia sebagai fallback (juga muncul saat
 *   izin ditolak).
 * - Simpan ke profiles via upsert RLS (id = auth.uid()).
 * - Kalau baris profiles belum ada (jalur konfirmasi email), form meminta
 *   nama lengkap sekali lagi supaya NOT NULL terpenuhi.
 */
export default function SetupLokasiForm({ userId, profile }) {
  const router = useRouter();

  const hasProfileRow = !!profile;
  const [nama, setNama] = useState(profile?.nama_lengkap ?? "");
  const [alamat, setAlamat] = useState(profile?.alamat_teks ?? "");
  const [lat, setLat] = useState(profile?.lokasi_lat ?? null);
  const [lng, setLng] = useState(profile?.lokasi_lng ?? null);

  const [gpsState, setGpsState] = useState("idle"); // idle | locating | done | error
  const [gpsMessage, setGpsMessage] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const lokasiTersimpan =
    !!profile?.alamat_teks ||
    profile?.lokasi_lat != null ||
    profile?.lokasi_lng != null;

  async function pakaiGps() {
    setGpsState("locating");
    setGpsMessage(null);

    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setGpsState("error");
      setGpsMessage(
        "Browser ini tidak mendukung izin lokasi. Ketik alamat manual di bawah untuk melanjutkan."
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLat(latitude);
        setLng(longitude);

        let alamatAuto = `Koordinat: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

        // Coba reverse geocode (OpenStreetMap Nominatim, tanpa API key).
        // Kalau gagal, alamat tetap tersimpan dalam bentuk koordinat.
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 7000);
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=id`,
            { signal: controller.signal, headers: { Accept: "application/json" } }
          );
          clearTimeout(timer);
          if (res.ok) {
            const data = await res.json();
            if (data?.display_name) alamatAuto = data.display_name;
          }
        } catch {
          // Abaikan: pakai koordinat.
        }

        setAlamat(alamatAuto);
        setGpsState("done");
      },
      (err) => {
        setGpsState("error");
        if (err.code === err.PERMISSION_DENIED) {
          setGpsMessage(
            "Izin lokasi ditolak. Kamu tetap bisa melanjutkan dengan mengetik alamat manual di bawah."
          );
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setGpsMessage(
            "Lokasi tidak tersedia di perangkat ini. Ketik alamat manual di bawah."
          );
        } else {
          setGpsMessage(
            "Gagal mendapatkan lokasi. Ketik alamat manual di bawah untuk melanjutkan."
          );
        }
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  async function handleSave(event) {
    event.preventDefault();
    setFormError(null);

    const errors = {};
    if (!nama.trim()) errors.nama = "Nama lengkap wajib diisi.";
    if (!alamat.trim() && lat == null && lng == null)
      errors.alamat =
        "Alamat atau koordinat wajib diisi. Aktifkan GPS atau ketik alamat manual.";
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    try {
      const supabase = createClient();
      const payload = {
        id: userId,
        nama_lengkap: nama.trim(),
        alamat_teks: alamat.trim() || null,
        lokasi_lat: lat,
        lokasi_lng: lng,
      };
      const { error } = await supabase
        .from("profiles")
        .upsert(payload, { onConflict: "id" });

      if (error) {
        setFormError(
          "Gagal menyimpan lokasi. Coba lagi, atau muat ulang halaman."
        );
        return;
      }

      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  if (saved) {
    return (
      <div className="rounded-2xl border border-loop-mist bg-white p-6 text-center shadow-sm sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-loop-mist text-loop-primary">
          <IconCheck className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-xl font-semibold tracking-tight text-loop-ink">
          Lokasi tersimpan
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-loop-line">
          Alamatmu tersimpan. Listing dan pencarian berikutnya bisa memakai
          jarak dari lokasi ini. Lokasi bisa diubah kapan saja dari halaman
          profil nanti.
        </p>
        <div className="mt-7 flex flex-col items-center justify-center gap-2 sm:flex-row">
          <ButtonLink href="/home" variant="primary">
            Buka Dashboard
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight text-loop-ink sm:text-2xl">
        Atur lokasi awal
      </h1>
      <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-loop-line">
        Lokasi membuat orang di sekitarmu bisa menemukan limbah atau bahan
        yang kamu tawarkan. Kamu bisa memakai GPS, atau mengetik alamat manual.
      </p>

      {lokasiTersimpan ? (
        <div className="mt-5 rounded-xl border border-loop-primary/40 bg-loop-primary/10 px-4 py-3 text-sm text-loop-primary-hover">
          <div className="flex items-start gap-2">
            <IconMapPin className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Lokasi tersimpan saat ini:{" "}
              <span className="font-medium">
                {profile?.alamat_teks ||
                  (profile?.lokasi_lat != null
                    ? "Koordinat GPS tersimpan"
                    : "-")}
              </span>
              . Ubah di bawah kalau perlu.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Kamu belum menyimpan lokasi. Tambahkan sekarang supaya orang di
          dekatmu bisa menemukan limbah atau bahanmu.
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-loop-mist bg-white p-6 shadow-sm sm:p-8">
        <form onSubmit={handleSave} noValidate className="space-y-5">
          {!hasProfileRow ? (
            <TextInput
              label="Nama lengkap"
              name="nama"
              autoComplete="name"
              required
              placeholder="Contoh: Budi Santoso"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              error={fieldErrors.nama}
              hint="Kami butuh nama ini untuk melengkapi profilmu."
            />
          ) : null}

          <div>
            <p className="mb-1.5 text-sm font-medium text-loop-ink">
              Ambil lokasi dari GPS
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={pakaiGps}
                loading={gpsState === "locating"}
                disabled={gpsState === "locating"}
              >
                <IconNav className="h-4 w-4" />
                {gpsState === "done" ? "Pakai Ulang Lokasi" : "Pakai Lokasi Sekarang"}
              </Button>
              {gpsState === "done" ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-loop-primary">
                  <IconCheck className="h-4 w-4" />
                  Lokasi GPS didapat
                </span>
              ) : null}
            </div>
            {gpsState === "error" && gpsMessage ? (
              <div className="mt-2">
                <Alert variant="info">{gpsMessage}</Alert>
              </div>
            ) : null}
          </div>

          <TextArea
            label="Alamat lengkap (manual)"
            name="alamat"
            rows={3}
            required
            placeholder="Contoh: Jl. Rungkut Asri No. 12, Surabaya"
            value={alamat}
            onChange={(e) => setAlamat(e.target.value)}
            error={fieldErrors.alamat}
            hint="Sebutkan jalan, nomor, dan kelurahan/desa supaya mudah ditemukan."
          />

          {formError ? (
            <Alert variant="error">{formError}</Alert>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={saving}
              className="sm:flex-none"
            >
              Simpan Lokasi
            </Button>
            <ButtonLink href="/home" variant="ghost" className="sm:ml-1">
              <IconPen className="h-4 w-4" />
              Lewati dulu
            </ButtonLink>
          </div>
        </form>
      </div>
    </div>
  );
}