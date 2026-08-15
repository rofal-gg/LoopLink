"use client";

import Link from "next/link";
import { IconArrowRight, IconMapPin, IconRecycle } from "@/components/icons";
import { KATEGORI_LABEL } from "@/components/upload/constants";

/**
 * Kartu hasil pencarian. Seluruh kartu adalah tautan menuju
 * `/listing/[id]?jarak=<km>` supaya halaman detail bisa menampilkan
 * badge jarak dari lokasi pencari.
 */
export default function HasilKartu({ item }) {
  const skor = Math.round((item.skor_akhir ?? 0) * 100);
  const labelKategori = KATEGORI_LABEL[item.kategori_citra] ?? item.kategori_citra;

  return (
    <Link
      href={`/listing/${item.listing_id}?jarak=${item.jarak_km}&from=/cari`}
      className="fr group flex flex-col overflow-hidden rounded-2xl border border-loop-mist bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-loop-primary/50 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-loop-mist">
        {item.foto_url ? (
          // eslint-disable-next-line @next/next/no-img-element -- gambar dari storage publik/placehold
          <img
            src={item.foto_url}
            alt={item.judul}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-loop-line">
            <IconRecycle className="h-10 w-10" />
          </div>
        )}
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-loop-ink/80 px-2.5 py-1 font-mono text-[11px] font-medium text-loop-base backdrop-blur-sm">
          <IconMapPin className="h-3 w-3" />
          {item.jarak_km} km
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-loop-mist px-2.5 py-1 text-[11px] font-semibold text-loop-ink">
            {labelKategori}
          </span>
          <span className="rounded-full bg-loop-primary/10 px-2.5 py-1 font-mono text-[11px] font-semibold text-loop-primary">
            Cocok {skor}%
          </span>
        </div>

        <h3 className="mt-2.5 font-display text-base font-semibold leading-snug tracking-tight text-loop-ink group-hover:text-loop-primary-hover">
          {item.judul}
        </h3>

        <p className="mt-2 text-sm text-loop-ink">
          <span className="font-mono text-base font-semibold tabular-nums">
            {item.jumlah}
          </span>{" "}
          <span className="text-loop-line">{item.satuan}</span>
        </p>

        <span className="mt-auto inline-flex items-center gap-1 pt-3 text-xs font-medium text-loop-primary">
          Lihat detail
          <IconArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}