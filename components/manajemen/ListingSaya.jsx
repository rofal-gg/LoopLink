"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { IconPen, IconRecycle, IconUpload } from "@/components/icons";
import KartuListing from "./KartuListing";
import Kosong from "./Kosong";

const TABS = [
  { key: "semua", label: "Semua" },
  { key: "tersedia", label: "Tersedia" },
  { key: "dipesan", label: "Dipesan" },
  { key: "selesai", label: "Selesai" },
];

/**
 * Daftar "Listing Saya" (Task 4.6.1).
 * Filter TAB: Semua / Tersedia / Dipesan / Selesai. Listing berstatus
 * "dibatalkan" hanya muncul di tab Semua (tidak ada tab khusus batalkan).
 * Kartu: foto, badge status, kategori, jumlah+satuan; tombol Edit hanya
 * untuk status "tersedia" (ke /upload/[id]/edit); semua kartu punya tautan
 * ke /listing/[id].
 */
export default function ListingSaya({ listings = [] }) {
  const [tab, setTab] = useState("semua");

  const { filtered, counts } = useMemo(() => {
    const c = { semua: listings.length, tersedia: 0, dipesan: 0, selesai: 0 };
    for (const l of listings) {
      if (l.status === "tersedia" || l.status === "dipesan" || l.status === "selesai") {
        c[l.status] += 1;
      }
    }
    const f =
      tab === "semua"
        ? listings
        : listings.filter((l) => l.status === tab);
    return { filtered: f, counts: c };
  }, [listings, tab]);

  return (
    <div>
      <header>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-loop-ink sm:text-3xl">
          Listing saya
        </h1>
        <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-loop-line">
          Semua limbah yang kamu pasang. Edit hanya tersedia saat status
          listing masih Tersedia.
        </p>
      </header>

      {/* Tab status */}
      <div
        role="tablist"
        aria-label="Filter status listing"
        className="mt-6 flex flex-wrap items-center gap-1.5 rounded-full border border-loop-mist bg-white p-1.5 shadow-sm"
      >
        {TABS.map((t) => {
          const aktif = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={aktif}
              onClick={() => setTab(t.key)}
              className={`fr inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-semibold transition sm:px-4 ${
                aktif
                  ? "bg-loop-primary text-white"
                  : "text-loop-line hover:text-loop-ink"
              }`}
            >
              {t.label}
              <span
                className={`font-mono text-[11px] tabular-nums ${
                  aktif ? "text-white/80" : "text-loop-line/70"
                }`}
              >
                {counts[t.key]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Daftar */}
      {filtered.length > 0 ? (
        <ul className="mt-6 space-y-4">
          {filtered.map((l) => (
            <li key={l.id}>
              <KartuListing
                listing={l}
                foto={l.listing_photos ?? []}
                backHref="/listing-saya"
              >
                <div className="flex flex-wrap items-center gap-2">
                  {l.status === "dipesan" ? (
                    <p className="text-xs text-loop-line">
                      Ada klaim aktif - menunggu pengambilan pengklaim.
                    </p>
                  ) : l.status === "selesai" ? (
                    <p className="text-xs text-loop-line">
                      Transaksi selesai. Terima kasih sudah memakai LoopLink.
                    </p>
                  ) : l.status === "dibatalkan" ? (
                    <p className="text-xs text-loop-line">
                      Klaim dibatalkan. Listing tidak aktif untuk diklaim.
                    </p>
                  ) : null}

                  {l.status === "tersedia" ? (
                    <Link
                      href={`/upload/${l.id}/edit`}
                      className="fr ml-auto inline-flex items-center gap-1.5 rounded-full border border-loop-mist bg-white px-3.5 py-1.5 text-sm font-semibold text-loop-ink transition hover:border-loop-primary/50 hover:bg-loop-base"
                    >
                      <IconPen className="h-3.5 w-3.5" />
                      Edit
                    </Link>
                  ) : null}
                </div>
              </KartuListing>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6">
          <Kosong
            icon={tab === "semua" ? IconRecycle : IconUpload}
            title={
              tab === "semua"
                ? "Belum ada listing"
                : `Tidak ada listing berstatus ${tab}`
            }
            body={
              tab === "semua"
                ? "Punya limbah yang layak dipakai orang lain? Foto lalu pasang sebagai listing, dan biarkan AI membantumu mengenalinya."
                : "Kalau kamu punya listing dengan status ini, listing akan muncul di sini. Mulai dari Upload Limbah untuk menambah listing baru."
            }
            href="/upload"
            hrefLabel={
              <>
                <IconUpload className="h-4 w-4" />
                Upload Limbah
              </>
            }
          />
        </div>
      )}

      </div>
  );
}