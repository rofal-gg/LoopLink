"use client";

import { Button, ButtonLink } from "@/components/ui/Button";
import { IconSearch, IconUpload } from "@/components/icons";

/**
 * Empty state hasil.
 *   mode "katalog": tidak ada listing tersedia dari pengguna lain
 *                   → CTA unggah limbah sendiri.
 *   mode "skor"   : tidak ada hasil cocok dari POST /api/listings/cari
 *                   → saran ubah kategori / lihat katalog.
 */
export default function EmptyState({
  mode = "katalog",
  onUbahKategori,
  onLihatKatalog,
}) {
  if (mode === "skor") {
    return (
      <section
        aria-label="Tidak ada hasil"
        className="mx-auto mt-6 max-w-xl rounded-2xl border border-loop-mist bg-white p-6 text-center shadow-sm sm:p-10"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-loop-mist text-loop-primary">
          <IconSearch className="h-7 w-7" />
        </div>
        <h2 className="mt-5 font-display text-xl font-semibold tracking-tight text-loop-ink">
          Belum ada hasil yang cocok
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-loop-line">
          Tidak ada listing yang cocok dengan kategori kebutuhanmu saat ini.
          Coba ubah kategori atau jumlah, atau jelajahi semua bahan tersedia
          lewat Katalog.
        </p>

        <div className="mt-6 flex flex-col items-center justify-center gap-2 sm:flex-row">
          <Button variant="secondary" onClick={onLihatKatalog}>
            Lihat Katalog
          </Button>
          <Button variant="ghost" onClick={onUbahKategori}>
            Ubah kategori kebutuhan
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label="Katalog kosong"
      className="mx-auto mt-6 max-w-xl rounded-2xl border border-loop-mist bg-white p-6 text-center shadow-sm sm:p-10"
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-loop-mist text-loop-primary">
        <IconUpload className="h-7 w-7" />
      </div>
      <h2 className="mt-5 font-display text-xl font-semibold tracking-tight text-loop-ink">
        Belum ada listing yang tersedia
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-loop-line">
        Belum ada pengguna lain yang menampilkan limbah tersedia saat ini.
        Katalog diperbarui otomatis. Sementara itu, mulai dari mengunggah
        limbahmu sendiri biar orang lain bisa membutuhkannya.
      </p>

      <div className="mt-6 flex flex-col items-center justify-center gap-2 sm:flex-row">
        <ButtonLink href="/upload" variant="primary">
          <IconUpload className="h-4 w-4" />
          Upload Limbah
        </ButtonLink>
      </div>
    </section>
  );
}