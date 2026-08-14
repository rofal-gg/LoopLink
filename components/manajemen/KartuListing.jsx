import Link from "next/link";
import { IconArrowRight, IconRecycle } from "@/components/icons";
import { KATEGORI_LABEL } from "@/components/upload/constants";
import { STATUS_META } from "./constants";

/**
 * Kartu listing bersama untuk halaman manajemen pribadi (Listing Saya /
 * Klaim Saya). Menampilkan: foto utama (fallback ikon recycle), badge
 * status, badge kategori, indikator AI/dikoreksi manual, judul, jumlah +
 * satuan. Area bawah (children) dipakai komponen pemakai untuk aksi atau
 * status tracking. Judul & foto adalah tautan ke `/listing/[id]`.
 *
 * Kartu sengaja bukan satu tautan penuh (bukan <Link> pembungkus) supaya
 * children bebas memuat tautan lain (mis. tombol Edit) tanpa <a> bersarang,
 * yang memecah a11y.
 */
export default function KartuListing({ listing, foto = [], children }) {
  const fotoTerurut = [...(foto ?? [])].sort(
    (a, b) => (a.urutan ?? 0) - (b.urutan ?? 0)
  );
  const fotoUtama = fotoTerurut[0]?.foto_url ?? null;
  const meta =
    STATUS_META[listing.status] ?? {
      label: listing.status,
      cls: "bg-loop-line text-white",
    };
  const labelKategori =
    KATEGORI_LABEL[listing.kategori_citra] ?? listing.kategori_citra;
  const confidence = listing.confidence_score;

  return (
    <article className="overflow-hidden rounded-2xl border border-loop-mist bg-white shadow-sm">
      <div className="flex flex-col sm:flex-row">
        {/* Foto utama -> detail listing */}
        <Link
          href={`/listing/${listing.id}`}
          aria-label={`Lihat detail ${listing.judul}`}
          className="fr relative block aspect-[4/3] shrink-0 overflow-hidden bg-loop-mist sm:aspect-auto sm:w-44"
        >
          {fotoUtama ? (
            // eslint-disable-next-line @next/next/no-img-element -- gambar storage publik/placehold
            <img
              src={fotoUtama}
              alt={listing.judul}
              loading="lazy"
              className="h-full w-full object-cover transition duration-300 hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-loop-line">
              <IconRecycle className="h-10 w-10" />
            </div>
          )}
        </Link>

        {/* Isi */}
        <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${meta.cls}`}
            >
              {meta.label}
            </span>
            <span className="rounded-full bg-loop-mist px-2.5 py-1 text-[11px] font-semibold text-loop-ink">
              {labelKategori}
            </span>
            {listing.kategori_dikoreksi ? (
              <span className="rounded-full bg-loop-signal px-2.5 py-1 text-[11px] font-semibold text-white">
                Dikoreksi manual
              </span>
            ) : confidence != null ? (
              <span className="rounded-full bg-loop-primary px-2.5 py-1 text-[11px] font-semibold text-white">
                AI
              </span>
            ) : null}
          </div>

          <Link
            href={`/listing/${listing.id}`}
            className="fr mt-2.5 font-display text-base font-semibold leading-snug tracking-tight text-loop-ink transition hover:text-loop-primary-hover"
          >
            {listing.judul}
          </Link>

          <p className="mt-2 text-sm text-loop-ink">
            <span className="font-mono text-base font-semibold tabular-nums">
              {listing.jumlah}
            </span>{" "}
            <span className="text-loop-line">{listing.satuan}</span>
          </p>

          <div className="mt-auto pt-3">
            {children}
            <Link
              href={`/listing/${listing.id}`}
              className="fr mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-loop-primary transition hover:text-loop-primary-hover"
            >
              Lihat detail
              <IconArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}