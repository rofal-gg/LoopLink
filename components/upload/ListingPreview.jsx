"use client";

import { CalendarDays } from "lucide-react";
import { IconMapPin } from "@/components/icons";
import { KATEGORI_LABEL, formatPersen } from "./constants";

/**
 * Kartu pratinjau listing yang live-update dari formulir di panel kiri.
 * Menampilkan: foto asli, judul, kategori + badge AI/koreksi manual,
 * jumlah+satuan, lokasi, deskripsi, dan badge confidence.
 */
export default function ListingPreview({
  fotoUrl = null,
  judul = "",
  kategori = null,
  confidence = null,
  kategoriDikoreksi = false,
  jumlah = "",
  satuan = "",
  lokasi = null,
  deskripsi = "",
  expiredAt = "",
}) {
  const labelKategori = kategori ? KATEGORI_LABEL[kategori] : null;
  const confidencePct = formatPersen(confidence);
  const lokasiTeks = lokasi?.alamat_teks || (lokasi ? "Koordinat tersimpan" : "");

  return (
    <div className="overflow-hidden rounded-2xl border border-loop-mist bg-white shadow-sm">
      {fotoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- pratinjau client (blob URL)
        <img
          src={fotoUrl}
          alt="Pratinjau foto limbah"
          className="aspect-[4/3] w-full bg-loop-mist object-cover"
        />
      ) : (
        <div className="aspect-[4/3] w-full bg-loop-mist" />
      )}

      <div className="p-5 sm:p-6">
        <p className="font-display text-lg font-semibold leading-snug tracking-tight text-loop-ink">
          {judul.trim() || "Judul listing"}
        </p>

        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          {labelKategori ? (
            <span className="inline-flex items-center rounded-full bg-loop-mist px-3 py-1 text-xs font-semibold text-loop-ink">
              {labelKategori}
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full border border-dashed border-loop-line px-3 py-1 text-xs text-loop-line">
              Pilih kategori
            </span>
          )}

          {labelKategori ? (
            kategoriDikoreksi ? (
              <span className="inline-flex items-center rounded-full bg-loop-signal px-2.5 py-1 text-[11px] font-semibold text-white">
                Dikoreksi manual
              </span>
            ) : confidence != null ? (
              <span className="inline-flex items-center rounded-full bg-loop-primary px-2.5 py-1 text-[11px] font-semibold text-white">
                AI
              </span>
            ) : null
          ) : null}

          {confidencePct ? (
            <span className="font-mono text-xs font-medium text-loop-line">
              keyakinan {confidencePct}
            </span>
          ) : null}
        </div>

        <p className="mt-3 text-sm text-loop-ink">
          <span className="font-mono text-lg font-semibold tabular-nums">
            {jumlah || "0"}
          </span>{" "}
          <span className="text-loop-line">{satuan || "satuan"}</span>
        </p>

        {lokasiTeks ? (
          <p className="mt-2 flex items-start gap-1.5 text-sm text-loop-line">
            <IconMapPin className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="line-clamp-2">{lokasiTeks}</span>
          </p>
        ) : null}

        {deskripsi.trim() ? (
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-loop-line">
            {deskripsi}
          </p>
        ) : null}

        {expiredAt ? (
          <p className="mt-3 inline-flex items-center gap-1.5 font-mono text-xs text-loop-line">
            <CalendarDays className="h-3.5 w-3.5" />
            Berlaku s.d. {expiredAt}
          </p>
        ) : null}
      </div>
    </div>
  );
}