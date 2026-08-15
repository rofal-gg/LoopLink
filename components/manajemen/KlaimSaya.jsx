"use client";

import { useMemo } from "react";
import { IconSearch } from "@/components/icons";
import KartuListing from "./KartuListing";
import Kosong from "./Kosong";
import { formatTanggalWaktu } from "./constants";

/**
 * Daftar "Klaim Saya" (Task 4.6.2).
 *
 * Setiap kartu menampilkan tracking status klaim dalam satu baris langkah:
 *   Diklaim (tanggal klaim) ─► step kedua (Menunggu pengambilan | Selesai |
 *   Dibatalkan beserta tanggalnya). Pesan status di bawahnya menjelaskan
 *   arti langkah tersebut (kontrak perilaku RPC complete/cancel, tanpa
 *   mutasi apa pun dari halaman ini).
 */
export default function KlaimSaya({ items = [] }) {
  const counts = useMemo(() => {
    const c = { aktif: 0, selesai: 0, dibatalkan: 0 };
    for (const item of items) {
      if (item.type in c) c[item.type] += 1;
    }
    return c;
  }, [items]);

  return (
    <div>
      <header>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-loop-ink sm:text-3xl">
          Klaim saya
        </h1>
        <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-loop-line">
          Bahan yang kamu amankan dari warga sekitar, beserta status
          pengambilannya.
        </p>
      </header>

      {/* Ringkasan jumlah per status */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-loop-mist bg-white px-3.5 py-1.5 text-xs font-semibold text-loop-ink shadow-sm">
          Klaim aktif{" "}
          <span className="ml-0.5 font-mono tabular-nums text-loop-signal">
            {counts.aktif}
          </span>
        </span>
        <span className="rounded-full border border-loop-mist bg-white px-3.5 py-1.5 text-xs font-semibold text-loop-ink shadow-sm">
          Selesai{" "}
          <span className="ml-0.5 font-mono tabular-nums text-loop-primary">
            {counts.selesai}
          </span>
        </span>
        <span className="rounded-full border border-loop-mist bg-white px-3.5 py-1.5 text-xs font-semibold text-loop-ink shadow-sm">
          Dibatalkan{" "}
          <span className="ml-0.5 font-mono tabular-nums text-loop-line">
            {counts.dibatalkan}
          </span>
        </span>
      </div>

      {items.length > 0 ? (
        <ul className="mt-6 space-y-4">
          {items.map((item) => (
            <li key={`${item.type}-${item.id}`}>
              {item.listingHilang ? (
                <KartuBatalHilang item={item} />
              ) : (
                <KartuListing
                  listing={item}
                  foto={item.foto}
                  backHref="/klaim-saya"
                >
                  <TrackingKlaim item={item} />
                </KartuListing>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6">
          <Kosong
            icon={IconSearch}
            title="Belum ada klaim"
            body="Belum ada bahan yang kamu amankan. Cari limbah atau bahan yang kamu butuhkan dari halaman Cari Bahan."
            href="/cari"
            hrefLabel="Cari Bahan"
          />
        </div>
      )}
    </div>
  );
}

function KartuBatalHilang({ item }) {
  return (
    <article className="rounded-2xl border border-loop-mist bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center rounded-full bg-loop-line px-2.5 py-1 text-[11px] font-semibold text-white">
          Dibatalkan
        </span>
        <span className="rounded-full bg-loop-mist px-2.5 py-1 text-[11px] font-semibold text-loop-ink">
          Riwayat klaim
        </span>
      </div>
      <h3 className="mt-2.5 font-display text-base font-semibold tracking-tight text-loop-ink">
        Klaim dibatalkan
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-loop-line">
        Listing ini tidak lagi terlihat dari akunmu. Klaim dibatalkan pada{" "}
        <span className="font-mono">
          {formatTanggalWaktu(item.diselesaikan_pada) || "-"}
        </span>
        .
      </p>
      <div className="mt-3">
        <TrackingKlaim item={item} />
      </div>
    </article>
  );
}

function TrackingKlaim({ item }) {
  const stepKedua = (() => {
    if (item.type === "aktif") {
      return {
        label: "Menunggu pengambilan",
        cls: "border-loop-signal/30 bg-loop-signal/10",
        dot: "bg-loop-signal",
        live: true,
        waktu: null,
      };
    }
    if (item.type === "selesai") {
      return {
        label: "Selesai",
        cls: "border-loop-primary/30 bg-loop-primary/5",
        dot: "bg-loop-primary",
        live: false,
        waktu: item.diselesaikan_pada,
      };
    }
    return {
      label: "Dibatalkan",
      cls: "border-loop-mist bg-loop-base",
      dot: "bg-loop-line",
      live: false,
      waktu: item.diselesaikan_pada,
    };
  })();

  const pesan = (() => {
    if (item.type === "aktif")
      return "Klaim aktif. Bahan menunggu diambil - koordinasikan pengambilan lewat kontak pemilik di halaman detail.";
    if (item.type === "selesai")
      return "Transaksi selesai. Terima kasih sudah memakai LoopLink.";
    return "Klaim dibatalkan. Listing ini kembali tersedia untuk diklaim warga lain.";
  })();

  return (
    <div className="mt-1 space-y-2.5">
      {/* Langkah-langkah tracking */}
      <div className="flex items-center gap-3" aria-label="Status klaim">
        {/* Langkah 1: diklaim */}
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-loop-primary/15">
            <span className="h-2 w-2 rounded-full bg-loop-primary" />
          </span>
          <div className="leading-tight">
            <p className="text-xs font-semibold text-loop-ink">Diklaim</p>
            <p className="font-mono text-[11px] text-loop-line">
              {formatTanggalWaktu(item.diklaim_pada) || "-"}
            </p>
          </div>
        </div>

        {/* Garis penghubung */}
        <span className="h-px min-w-6 flex-1 bg-loop-mist" />

        {/* Langkah 2: status saat ini */}
        <div className={`flex items-center gap-2 rounded-full border px-2.5 py-1 ${stepKedua.cls}`}>
          <span className="relative flex h-2.5 w-2.5 items-center justify-center">
            {stepKedua.live ? (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-loop-signal opacity-60" />
            ) : null}
            <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${stepKedua.dot}`} />
          </span>
          <div className="leading-tight">
            <p className="text-xs font-semibold text-loop-ink">{stepKedua.label}</p>
            {stepKedua.waktu ? (
              <p className="font-mono text-[11px] text-loop-line">
                {formatTanggalWaktu(stepKedua.waktu)}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {/* Pesan status */}
      <p className="text-xs leading-relaxed text-loop-line">{pesan}</p>
    </div>
  );
}