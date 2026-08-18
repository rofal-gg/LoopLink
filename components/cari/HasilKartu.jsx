"use client";

import Link from "next/link";
import { IconArrowRight, IconMapPin, IconRecycle } from "@/components/icons";
import { KATEGORI_LABEL } from "@/components/upload/constants";

/**
 * Kartu hasil katalog / pencarian. Seluruh kartu adalah tautan menuju
 * `/listing/[id]?jarak=<km>&from=/cari` supaya halaman detail bisa
 * menampilkan badge jarak dari lokasi pencari (param jarak dihilangkan
 * kalau jarak_km null, mis. profil tanpa koordinat).
 *
 * Field yang mungkin tidak ada tergantung sumber:
 *   - Katalog  : skor_akhir TIDAK ada (badge Cocok x% disembunyikan),
 *                created_at ADA (ditampilkan sebagai waktu relatif).
 *   - Skor     : skor_akhir ADA, created_at tidak dikirim backend.
 */
export default function HasilKartu({ item }) {
  const skor =
    item.skor_akhir != null && Number.isFinite(Number(item.skor_akhir))
      ? Math.round(Number(item.skor_akhir) * 100)
      : null;
  const labelKategori = KATEGORI_LABEL[item.kategori_citra] ?? item.kategori_citra;
  const waktuRelatif = formatWaktuRelatif(item.created_at);

  const href =
    item.jarak_km != null
      ? `/listing/${item.listing_id}?jarak=${item.jarak_km}&from=/cari`
      : `/listing/${item.listing_id}?from=/cari`;

  const diLuar = item.di_luar_jangkauan === true;

  return (
    <Link
      href={href}
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

        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5 sm:flex-row sm:items-center">
          {diLuar ? (
            <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 font-mono text-[11px] font-semibold text-amber-800 ring-1 ring-amber-200">
              Di luar jangkauan
            </span>
          ) : null}
          {item.jarak_km != null ? (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-[11px] font-semibold ${
                diLuar
                  ? "bg-amber-700 text-white"
                  : "bg-loop-primary text-white"
              }`}
            >
              <IconMapPin className="h-3 w-3" />
              {item.jarak_km} km
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-loop-mist px-2.5 py-1 text-[11px] font-semibold text-loop-ink">
            {labelKategori}
          </span>
          {skor != null ? (
            <span className="rounded-full bg-loop-primary/10 px-2.5 py-1 font-mono text-[11px] font-semibold text-loop-primary">
              Cocok {skor}%
            </span>
          ) : waktuRelatif ? (
            <span className="rounded-full bg-loop-base px-2.5 py-1 font-mono text-[11px] font-medium text-loop-line">
              {waktuRelatif}
            </span>
          ) : null}
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

/**
 * Waktu relatif Indonesia untuk item katalog (dari created_at).
 * Kembalikan null kalau input bukan tanggal yang valid (mis. item skor
 * yang tidak punya created_at).
 */
function formatWaktuRelatif(value) {
  if (!value) return null;
  const tgl = new Date(value);
  if (Number.isNaN(tgl.getTime())) return null;

  const detik = Math.max(0, (Date.now() - tgl.getTime()) / 1000);
  if (detik < 60) return "Baru saja";

  const menit = Math.floor(detik / 60);
  if (menit < 60) return `${menit} menit lalu`;

  const jam = Math.floor(menit / 60);
  if (jam < 24) return `${jam} jam lalu`;

  const hari = Math.floor(jam / 24);
  if (hari < 30) return `${hari} hari lalu`;

  return tgl.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
