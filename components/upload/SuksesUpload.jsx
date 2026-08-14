"use client";

import { Button, ButtonLink } from "@/components/ui/Button";
import { IconCheck } from "@/components/icons";
import { KATEGORI_LABEL } from "./constants";

/**
 * State sukses setelah POST /api/listings berhasil (201).
 * Detail listing belum ada (Fase 4.5), jadi CTA hanya ke form ulang / dashboard.
 */
export default function SuksesUpload({ sukses = null, onUlang }) {
  const judul = sukses?.judul ?? "";
  const kategoriLabel = sukses?.kategori ? KATEGORI_LABEL[sukses.kategori] : null;
  const jumlahUnit =
    sukses?.jumlah != null ? `${sukses.jumlah} ${sukses.satuan}` : "";

  return (
    <section
      aria-labelledby="sukses-heading"
      className="mx-auto max-w-2xl rounded-2xl border border-loop-mist bg-white p-6 text-center shadow-sm sm:p-10"
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-loop-primary text-white">
        <IconCheck className="h-7 w-7" strokeWidth={2.5} />
      </div>

      <h1
        id="sukses-heading"
        className="mt-5 font-display text-2xl font-semibold tracking-tight text-loop-ink"
      >
        Listing berhasil dipasang
      </h1>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-loop-line">
        Limbahmu sekarang terlihat oleh orang di sekitarmu yang membutuhkan
        bahan daur ulang.
      </p>

      {judul ? (
        <div className="mx-auto mt-5 max-w-md rounded-xl bg-loop-base px-5 py-4">
          <p className="text-sm font-semibold text-loop-ink">{judul}</p>
          <p className="mt-1 font-mono text-xs text-loop-line">
            {[kategoriLabel, jumlahUnit].filter(Boolean).join(" · ")}
          </p>
        </div>
      ) : null}

      <div className="mt-7 flex flex-col items-center justify-center gap-2 sm:flex-row">
        <Button variant="primary" size="lg" onClick={onUlang}>
          Upload Limbah Lagi
        </Button>
        <ButtonLink href="/home" variant="secondary" size="lg">
          Buka Dashboard
        </ButtonLink>
      </div>
    </section>
  );
}