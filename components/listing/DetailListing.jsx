"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  Flag,
  Phone,
  ShieldCheck,
  User,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Inputs";
import { IconArrowLeft, IconMapPin, IconRecycle } from "@/components/icons";
import { KATEGORI_LABEL, formatPersen } from "@/components/upload/constants";
import KlaimModal from "./KlaimModal";
import SelesaiModal from "./SelesaiModal";
import BatalModal from "./BatalModal";
import LaporModal from "./LaporModal";
import {
  batalkanListing,
  kirimLaporan,
  klaimListing,
  selesaikanListing,
} from "./api";

const STATUS_META = {
  tersedia: { label: "Tersedia", cls: "bg-loop-primary text-white" },
  dipesan: { label: "Dipesan", cls: "bg-loop-signal text-white" },
  selesai: { label: "Selesai", cls: "bg-loop-ink text-loop-base" },
  dibatalkan: { label: "Dibatalkan", cls: "bg-loop-line text-white" },
};

function formatTanggal(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Detail Listing & Klaim (Task 4.5).
 *
 * Aturan tombol (non-negosiasi):
 * - Amankan      : status `tersedia` DAN bukan pemilik.
 * - Selesaikan   : status `dipesan` DAN pemilik.
 * - Batalkan     : status `dipesan` DAN (pemilik ATAU pengklaim).
 * - Laporkan     : bukan pemilik.
 * Semua mutasi lewat endpoint resmi; setelah sukses panggil router.refresh()
 * supaya Server Component mengambil ulang status dari database.
 */
export default function DetailListing({
  listing,
  foto = [],
  pemilik = null,
  namaPengklaim = null,
  userId,
  jarak = null,
}) {
  const router = useRouter();

  const [fotoAktif, setFotoAktif] = useState(0);
  const [notice, setNotice] = useState(null);

  // Klaim
  const [klaimOpen, setKlaimOpen] = useState(false);
  const [klaimBusy, setKlaimBusy] = useState(false);
  const [klaimError, setKlaimError] = useState(null);
  const [klaimFase, setKlaimFase] = useState("konfirmasi");

  // Selesai
  const [selesaiOpen, setSelesaiOpen] = useState(false);
  const [selesaiBusy, setSelesaiBusy] = useState(false);
  const [selesaiError, setSelesaiError] = useState(null);

  // Batal
  const [batalOpen, setBatalOpen] = useState(false);
  const [batalBusy, setBatalBusy] = useState(false);
  const [batalError, setBatalError] = useState(null);

  // Lapor
  const [laporOpen, setLaporOpen] = useState(false);
  const [laporBusy, setLaporBusy] = useState(false);
  const [laporError, setLaporError] = useState(null);
  const [laporFase, setLaporFase] = useState("form");

  const status = listing?.status ?? "tersedia";
  const isPemilik = listing?.user_id === userId;
  const isPengklaim = listing?.diklaim_oleh === userId;

  const statusMeta = STATUS_META[status] ?? {
    label: status,
    cls: "bg-loop-line text-white",
  };
  const labelKategori =
    KATEGORI_LABEL[listing?.kategori_citra] ?? listing?.kategori_citra;
  const confidence = formatPersen(listing?.confidence_score);
  const deskripsi = listing?.deskripsi_teks || "Tidak ada deskripsi.";

  const fotoTerurut = useMemo(() => {
    const arr = [...foto];
    arr.sort((a, b) => (a.urutan ?? 0) - (b.urutan ?? 0));
    return arr;
  }, [foto]);

  const fotoUtama = fotoTerurut[fotoAktif]?.foto_url ?? null;

  // Aturan tombol
  const tampilAmankan = status === "tersedia" && !isPemilik;
  const tampilSelesai = status === "dipesan" && isPemilik;
  const tampilBatal = status === "dipesan" && (isPemilik || isPengklaim);
  const tampilLapor = !isPemilik;
  const tampilKontakPemilik = status !== "selesai" && status !== "dibatalkan";

  const labelBatal = isPemilik
    ? namaPengklaim
      ? `dari ${namaPengklaim}`
      : "yang ada"
    : "milikmu";

  // ── Mutasi (semua lewat endpoint resmi) ──────────────────────────────
  async function konfirmasiKlaim() {
    setKlaimBusy(true);
    setKlaimError(null);
    try {
      await klaimListing(listing.id);
      setKlaimFase("sukses");
      router.refresh();
    } catch (err) {
      setKlaimError(
        err.message || "Gagal mengklaim listing. Silakan coba lagi."
      );
    } finally {
      setKlaimBusy(false);
    }
  }

  function tutupKlaim() {
    setKlaimOpen(false);
    setKlaimError(null);
    setKlaimFase("konfirmasi");
    router.refresh();
  }

  async function konfirmasiSelesai() {
    setSelesaiBusy(true);
    setSelesaiError(null);
    try {
      await selesaikanListing(listing.id);
      setSelesaiOpen(false);
      setNotice("Transaksi berhasil diselesaikan.");
      router.refresh();
    } catch (err) {
      setSelesaiError(
        err.message || "Gagal menyelesaikan transaksi. Silakan coba lagi."
      );
    } finally {
      setSelesaiBusy(false);
    }
  }

  async function konfirmasiBatal() {
    setBatalBusy(true);
    setBatalError(null);
    try {
      await batalkanListing(listing.id);
      setBatalOpen(false);
      setNotice("Klaim berhasil dibatalkan. Listing kembali tersedia.");
      router.refresh();
    } catch (err) {
      setBatalError(
        err.message || "Gagal membatalkan klaim. Silakan coba lagi."
      );
    } finally {
      setBatalBusy(false);
    }
  }

  async function kirimLaporanHandler(alasan) {
    setLaporBusy(true);
    setLaporError(null);
    try {
      await kirimLaporan({ listingId: listing.id, alasan });
      setLaporFase("sukses");
    } catch (err) {
      setLaporError(
        err.message || "Gagal mengirim laporan. Silakan coba lagi."
      );
    } finally {
      setLaporBusy(false);
    }
  }

  function bukaLapor() {
    setLaporFase("form");
    setLaporError(null);
    setLaporOpen(true);
  }

  return (
    <div>
      {/* Navigasi atas + tombol laporkan */}
      <nav
        aria-label="Navigasi detail"
        className="flex items-center justify-between gap-3"
      >
        <Link
          href="/cari"
          className="fr inline-flex items-center gap-1.5 text-sm font-medium text-loop-primary transition hover:text-loop-primary-hover"
        >
          <IconArrowLeft className="h-4 w-4" />
          Kembali ke Cari Bahan
        </Link>
        {tampilLapor ? (
          <button
            type="button"
            onClick={bukaLapor}
            className="fr inline-flex items-center gap-1.5 rounded-full border border-loop-mist bg-white px-3 py-1.5 text-xs font-medium text-loop-line transition hover:border-red-200 hover:text-red-700"
          >
            <Flag className="h-3.5 w-3.5" />
            Laporkan
          </button>
        ) : null}
      </nav>

      {notice ? (
        <div className="mt-5">
          <Alert variant="success">{notice}</Alert>
        </div>
      ) : null}

      {/* Judul + status */}
      <header className="mt-5">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusMeta.cls}`}
          >
            {statusMeta.label}
          </span>
          {jarak != null ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-loop-mist px-3 py-1 text-xs font-semibold text-loop-ink">
              <IconMapPin className="h-3.5 w-3.5" />
              ±{jarak} km dari lokasimu
            </span>
          ) : null}
        </div>
        <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight text-loop-ink sm:text-3xl">
          {listing.judul}
        </h1>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        {/* ── Kolom kiri: foto + deskripsi ─────────────────────────────── */}
        <div className="space-y-6">
          <section
            aria-label="Foto listing"
            className="overflow-hidden rounded-2xl border border-loop-mist bg-white shadow-sm"
          >
            <div className="relative aspect-[4/3] w-full bg-loop-mist">
              {fotoUtama ? (
                // eslint-disable-next-line @next/next/no-img-element -- gambar storage/placehold
                <img
                  src={fotoUtama}
                  alt={listing.judul}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-loop-line">
                  <IconRecycle className="h-14 w-14" />
                </div>
              )}
            </div>
            {fotoTerurut.length > 1 ? (
              <div className="flex gap-2 overflow-x-auto border-t border-loop-rowline p-3">
                {fotoTerurut.map((f, i) => (
                  <button
                    key={`${f.foto_url}-${i}`}
                    type="button"
                    onClick={() => setFotoAktif(i)}
                    aria-label={`Lihat foto ${i + 1}`}
                    aria-current={i === fotoAktif ? "true" : undefined}
                    className={`fr h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                      i === fotoAktif
                        ? "border-loop-primary"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={f.foto_url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </section>

          <section
            aria-labelledby="deskripsi-heading"
            className="rounded-2xl border border-loop-mist bg-white p-6 shadow-sm sm:p-7"
          >
            <h2
              id="deskripsi-heading"
              className="font-display text-lg font-semibold tracking-tight text-loop-ink"
            >
              Deskripsi
            </h2>
            <p className="mt-2.5 whitespace-pre-line text-sm leading-relaxed text-loop-ink">
              {deskripsi}
            </p>
          </section>
        </div>

        {/* ── Kolom kanan: info + pemilik + aksi ───────────────────────── */}
        <div className="space-y-6">
          {/* Informasi listing */}
          <section
            aria-labelledby="info-heading"
            className="rounded-2xl border border-loop-mist bg-white p-6 shadow-sm sm:p-7"
          >
            <h2
              id="info-heading"
              className="font-display text-lg font-semibold tracking-tight text-loop-ink"
            >
              Informasi listing
            </h2>

            <div className="mt-4 space-y-4 text-sm">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-loop-line">
                  Kategori
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-loop-mist px-3 py-1 text-sm font-semibold text-loop-ink">
                    {labelKategori}
                  </span>
                  {listing.kategori_dikoreksi ? (
                    <span className="rounded-full bg-loop-signal px-2.5 py-1 text-[11px] font-semibold text-white">
                      Dikoreksi manual
                    </span>
                  ) : listing.confidence_score != null ? (
                    <span className="rounded-full bg-loop-primary px-2.5 py-1 text-[11px] font-semibold text-white">
                      AI
                    </span>
                  ) : null}
                  {confidence ? (
                    <span className="font-mono text-xs text-loop-line">
                      keyakinan {confidence}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-wide text-loop-line">
                  {listing.kategori_citra}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-loop-line">
                  Jumlah
                </p>
                <p className="mt-1 text-loop-ink">
                  <span className="font-mono text-lg font-semibold tabular-nums">
                    {listing.jumlah}
                  </span>{" "}
                  <span className="text-sm text-loop-line">
                    {listing.satuan}
                  </span>
                </p>
              </div>

              {listing.expired_at ? (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-loop-line">
                    Berlaku sampai
                  </p>
                  <p className="mt-1 inline-flex items-center gap-1.5 font-mono text-sm text-loop-ink">
                    <CalendarDays className="h-4 w-4 text-loop-line" />
                    {formatTanggal(listing.expired_at)}
                  </p>
                </div>
              ) : null}

              {/* State lain */}
              {status === "dipesan" && !isPemilik && !isPengklaim ? (
                <Alert variant="info">
                  Bahan ini sudah dipesan orang lain. Silakan cari listing
                  lain yang tersedia di sekitarmu.
                </Alert>
              ) : null}
              {status === "selesai" ? (
                <Alert variant="success">
                  Transaksi selesai. Terima kasih sudah memakai LoopLink.
                </Alert>
              ) : null}
              {status === "dibatalkan" ? (
                <Alert variant="info">
                  Listing ini dibatalkan dan tidak aktif untuk diklaim.
                </Alert>
              ) : null}
            </div>
          </section>

          {/* Informasi pemilik (disembunyikan saat selesai/dibatalkan) */}
          {tampilKontakPemilik && pemilik ? (
            <section
              aria-labelledby="pemilik-heading"
              className="rounded-2xl border border-loop-mist bg-white p-6 shadow-sm sm:p-7"
            >
              <h2
                id="pemilik-heading"
                className="font-display text-lg font-semibold tracking-tight text-loop-ink"
              >
                Informasi pemilik
              </h2>
              <div className="mt-4 space-y-3 text-sm text-loop-ink">
                <p className="flex items-center gap-2">
                  <User className="h-4 w-4 shrink-0 text-loop-primary" />
                  <span className="font-semibold">
                    {pemilik.nama_lengkap ?? "Pemilik"}
                  </span>
                </p>
                {pemilik.no_telepon ? (
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4 shrink-0 text-loop-primary" />
                    <a
                      href={`tel:${pemilik.no_telepon}`}
                      className="font-medium text-loop-primary underline-offset-2 hover:underline"
                    >
                      {pemilik.no_telepon}
                    </a>
                  </p>
                ) : null}
                {pemilik.alamat_teks ? (
                  <p className="flex items-start gap-2">
                    <IconMapPin className="mt-0.5 h-4 w-4 shrink-0 text-loop-primary" />
                    <span>{pemilik.alamat_teks}</span>
                  </p>
                ) : null}
              </div>
              <p className="mt-3 text-xs leading-relaxed text-loop-line">
                Kontak ditampilkan untuk memudahkan pengambilan bahan.
              </p>
            </section>
          ) : null}

          {/* Aksi */}
          <section aria-label="Aksi" className="space-y-2">
            {tampilAmankan ? (
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => {
                  setKlaimError(null);
                  setKlaimFase("konfirmasi");
                  setKlaimOpen(true);
                }}
              >
                <ShieldCheck className="h-5 w-5" />
                Amankan
              </Button>
            ) : null}

            {tampilSelesai ? (
              <Button
                variant="secondary"
                size="lg"
                className="w-full"
                onClick={() => {
                  setSelesaiError(null);
                  setSelesaiOpen(true);
                }}
              >
                <CheckCircle2 className="h-5 w-5" />
                Selesaikan Transaksi
              </Button>
            ) : null}

            {tampilBatal ? (
              <Button
                variant="ghost"
                size="lg"
                className="w-full text-red-700 hover:bg-red-50 hover:text-red-800"
                onClick={() => {
                  setBatalError(null);
                  setBatalOpen(true);
                }}
              >
                <XCircle className="h-5 w-5" />
                Batalkan Klaim
              </Button>
            ) : null}

            {isPemilik && status === "tersedia" ? (
              <p className="px-1 pt-2 text-xs leading-relaxed text-loop-line">
                Ini listingmu. Tidak ada tombol klaim untuk listing sendiri.
              </p>
            ) : null}

            {status === "dipesan" && isPemilik ? (
              <p className="px-1 pt-2 text-xs leading-relaxed text-loop-line">
                Bahan ini sedang menunggu diambil pengklaim.
              </p>
            ) : null}
          </section>
        </div>
      </div>

      {/* Modals */}
      <KlaimModal
        open={klaimOpen}
        busy={klaimBusy}
        error={klaimError}
        fase={klaimFase}
        listing={listing}
        pemilik={pemilik}
        onKonfirmasi={konfirmasiKlaim}
        onTutup={tutupKlaim}
      />

      <SelesaiModal
        open={selesaiOpen}
        busy={selesaiBusy}
        error={selesaiError}
        judul={listing.judul}
        onKonfirmasi={konfirmasiSelesai}
        onTutup={() => {
          setSelesaiOpen(false);
          setSelesaiError(null);
        }}
      />

      <BatalModal
        open={batalOpen}
        busy={batalBusy}
        error={batalError}
        judul={listing.judul}
        labelPihak={labelBatal}
        onKonfirmasi={konfirmasiBatal}
        onTutup={() => {
          setBatalOpen(false);
          setBatalError(null);
        }}
      />

      <LaporModal
        open={laporOpen}
        busy={laporBusy}
        error={laporError}
        fase={laporFase}
        judul={listing.judul}
        onKirim={kirimLaporanHandler}
        onTutup={() => {
          setLaporOpen(false);
          setLaporError(null);
          setLaporFase("form");
        }}
      />
    </div>
  );
}