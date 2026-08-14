"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Inputs";
import { IconArrowLeft, IconCheck, IconInfo } from "@/components/icons";
import ReviewForm from "./ReviewForm";
import HapusModal from "./HapusModal";
import { ambilListing, hapusListing, perbaruiListing } from "./api";

const STATUS_LABEL = {
  tersedia: "tersedia",
  dipesan: "dipesan",
  selesai: "selesai",
  dibatalkan: "dibatalkan",
};

/**
 * Edit Listing (Task 4.3.5) + Hapus/Batalkan Listing (Task 4.3.6).
 *
 * - Fetch GET /api/listings/[id]. Kalau status bukan "tersedia" → panel
 *   informatif (tidak bisa diedit).
 * - Kalau tersedia → form yang sama seperti review (kategori picker +
 *   detail + live preview) dengan data prefill dari GET. Submit → PATCH
 *   whitelist field non-status. JANGAN mengirim status/field transaksi.
 * - Zona bahaya terpisah untuk DELETE (modal konfirmasi).
 */
export default function EditFlow({ id, profile }) {
  const router = useRouter();

  const [status, setStatus] = useState("memuat"); // memuat | siap | terkunci | error
  const [listing, setListing] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [tersimpan, setTersimpan] = useState(false);

  const [hapusOpen, setHapusOpen] = useState(false);
  const [menghapus, setMenghapus] = useState(false);
  const [hapusError, setHapusError] = useState(null);

  useEffect(() => {
    let aktif = true;
    (async () => {
      try {
        const data = await ambilListing(id);
        if (!aktif) return;
        setListing(data);
        setStatus(data.status === "tersedia" ? "siap" : "terkunci");
      } catch (err) {
        if (!aktif) return;
        setLoadError(err.message);
        setStatus("error");
      }
    })();
    return () => {
      aktif = false;
    };
  }, [id]);

  async function simpanPerubahan(payload) {
    setSubmitting(true);
    try {
      await perbaruiListing(id, {
        judul: payload.judul,
        kategori_citra: payload.kategoriCitra,
        kategori_dikoreksi: payload.kategoriDikoreksi,
        confidence_score: payload.confidenceScore,
        deskripsi_teks: payload.deskripsiTeks,
        jumlah: payload.jumlah,
        satuan: payload.satuan,
        lokasi_lat: payload.lokasiLat,
        lokasi_lng: payload.lokasiLng,
      });
      setTersimpan(true);
      return null;
    } catch (err) {
      if (err instanceof TypeError && err.message === "Failed to fetch") {
        return "Tidak dapat terhubung ke server. Periksa koneksimu lalu coba lagi.";
      }
      return err.message;
    } finally {
      setSubmitting(false);
    }
  }

  async function konfirmasiHapus() {
    setMenghapus(true);
    setHapusError(null);
    try {
      await hapusListing(id);
      router.push("/home");
    } catch (err) {
      setHapusError(
        err.message ||
          "Gagal menghapus listing. Kemungkinan status listing sudah berubah."
      );
    } finally {
      setMenghapus(false);
    }
  }

  // ── State memuat ───────────────────────────────────────────────────────
  if (status === "memuat") {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center gap-3 rounded-2xl border border-loop-mist bg-white p-6 text-sm text-loop-line shadow-sm sm:p-8">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-loop-primary border-t-transparent" />
          Memuat data listing…
        </div>
      </div>
    );
  }

  // ── State error fetch ──────────────────────────────────────────────────
  if (status === "error") {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-loop-mist bg-white p-6 text-center shadow-sm sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-700">
          <IconInfo className="h-7 w-7" />
        </div>
        <h1 className="mt-5 font-display text-xl font-semibold tracking-tight text-loop-ink">
          Listing tidak dapat dimuat
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-loop-line">
          {loadError || "Terjadi kesalahan saat mengambil data listing."}
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-2 sm:flex-row">
          <Button variant="primary" onClick={() => window.location.reload()}>
            Coba Lagi
          </Button>
          <ButtonLink href="/home" variant="secondary">
            <IconArrowLeft className="h-4 w-4" />
            Kembali ke Dashboard
          </ButtonLink>
        </div>
      </div>
    );
  }

  // ── State sukses edit ──────────────────────────────────────────────────
  if (tersimpan) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-loop-mist bg-white p-6 text-center shadow-sm sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-loop-primary text-white">
          <IconCheck className="h-7 w-7" strokeWidth={2.5} />
        </div>
        <h1 className="mt-5 font-display text-2xl font-semibold tracking-tight text-loop-ink">
          Listing berhasil diperbarui
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-loop-line">
          Perubahan detail sudah tersimpan. Kamu bisa melihat listing ini di
          dashboard.
        </p>
        <div className="mt-7 flex flex-col items-center justify-center gap-2 sm:flex-row">
          <ButtonLink href="/home" variant="primary" size="lg">
            Buka Dashboard
          </ButtonLink>
        </div>
      </div>
    );
  }

  // ── State terkunci (status bukan tersedia) ─────────────────────────────
  if (status === "terkunci") {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-loop-mist bg-white p-6 text-center shadow-sm sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-loop-mist text-loop-ink">
          <IconInfo className="h-7 w-7" />
        </div>
        <h1 className="mt-5 font-display text-xl font-semibold tracking-tight text-loop-ink">
          Listing ini tidak bisa diedit
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-loop-line">
          Listing saat ini berstatus{" "}
          <span className="font-medium text-loop-ink">
            {STATUS_LABEL[listing?.status] ?? listing?.status}
          </span>
          . Edit dan hapus hanya tersedia untuk listing dengan status{" "}
          <span className="font-medium text-loop-ink">tersedia</span>.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-2 sm:flex-row">
          <ButtonLink href="/home" variant="primary">
            Kembali ke Dashboard
          </ButtonLink>
        </div>
      </div>
    );
  }

  // ── State siap: form edit + zona bahaya ────────────────────────────────
  const initial = {
    judul: listing?.judul ?? "",
    kategori: listing?.kategori_citra ?? null,
    kategoriDikoreksi: !!listing?.kategori_dikoreksi,
    deskripsi:
      typeof listing?.deskripsi_teks === "string" ? listing.deskripsi_teks : "",
    jumlah: listing?.jumlah != null ? String(listing.jumlah) : "",
    satuan: listing?.satuan ?? "kg",
    expiredAt: listing?.expired_at
      ? String(listing.expired_at).slice(0, 10)
      : "",
  };
  const confidence = listing?.confidence_score ?? null;

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-loop-ink">
        Edit listing
      </h1>
      <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-loop-line">
        Ubah kategori, detail, atau lokasi, lalu simpan perubahannya.
      </p>

      <div className="mt-6">
        <ReviewForm
          initial={initial}
          kategoriAsli={listing?.kategori_citra ?? null}
          confidence={confidence}
          alertInfo={null}
          fotoUrl={listing?.foto?.[0]?.foto_url ?? null}
          lokasi={profile}
          submitLabel="Simpan Perubahan"
          submitting={submitting}
          onGantiFoto={null}
          onSubmit={simpanPerubahan}
        />
      </div>

      {/* Zona bahaya */}
      <div className="mt-8 rounded-2xl border border-red-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="font-display text-lg font-semibold tracking-tight text-loop-ink">
          Zona bahaya
        </h2>
        <p className="mt-1 max-w-lg text-sm leading-relaxed text-loop-line">
          Menghapus listing akan menghapus fotonya juga. Tindakan ini tidak
          bisa dibatalkan.
        </p>
        <Button
          variant="danger"
          className="mt-4"
          onClick={() => {
            setHapusError(null);
            setHapusOpen(true);
          }}
        >
          <Trash2 className="h-4 w-4" />
          Hapus Listing
        </Button>
      </div>

      <HapusModal
        open={hapusOpen}
        busy={menghapus}
        error={hapusError}
        onHapus={konfirmasiHapus}
        onBatal={() => {
          setHapusOpen(false);
          setHapusError(null);
        }}
      />
    </div>
  );
}