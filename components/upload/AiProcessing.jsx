"use client";

import { IconCheck, IconSpark } from "@/components/icons";

const LANGKAH = [
  "Foto dikompres & dikirim",
  "AI mengenali jenis limbah",
  "Isian listing disusun AI",
];

/**
 * Satu state loading GABUNGAN untuk proses klasifikasi citra + prefill isian
 * listing dari Gemini. Tidak ada dua spinner terpisah: selama proses
 * berlangsung layar ini menutupi seluruh panel upload sampai hasil review
 * siap.
 *
 * `langkah` = jumlah langkah yang sudah selesai (0..3).
 */
export default function AiProcessing({ langkah = 0, pesan = "" }) {
  const progres = Math.max(6, Math.round((langkah / LANGKAH.length) * 100));

  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-2xl border border-loop-mist bg-white p-6 shadow-sm sm:p-10"
    >
      <div className="mx-auto flex h-14 w-14 animate-pulse items-center justify-center rounded-full bg-loop-primary text-white">
        <IconSpark className="h-7 w-7" />
      </div>

      <h2 className="mt-5 text-center font-display text-xl font-semibold tracking-tight text-loop-ink sm:text-2xl">
        AI sedang memproses fotomu
      </h2>
      <p className="mx-auto mt-1.5 max-w-md text-center text-sm leading-relaxed text-loop-line">
        {pesan || "AI sedang mengenali jenis limbah & menyusun isian listing…"}
      </p>

      <ol className="mx-auto mt-8 w-full max-w-sm space-y-2.5 text-left">
        {LANGKAH.map((label, i) => {
          const selesai = langkah > i;
          const aktif = !selesai && langkah === i;
          return (
            <li
              key={label}
              className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 transition ${
                selesai
                  ? "border-loop-primary/30 bg-loop-primary/5"
                  : aktif
                    ? "border-loop-mist bg-loop-base"
                    : "border-loop-mist bg-loop-base opacity-60"
              }`}
            >
              {selesai ? (
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-loop-primary text-white">
                  <IconCheck className="h-3.5 w-3.5" />
                </span>
              ) : aktif ? (
                <span
                  aria-hidden="true"
                  className="h-6 w-6 shrink-0 animate-spin rounded-full border-2 border-loop-primary border-t-transparent"
                />
              ) : (
                <span className="h-6 w-6 shrink-0 rounded-full border-2 border-loop-mist" />
              )}
              <span className="font-mono text-xs text-loop-line">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-sm font-medium text-loop-ink">{label}</span>
            </li>
          );
        })}
      </ol>

      <div className="mx-auto mt-8 h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-loop-mist">
        <div
          className="h-full rounded-full bg-loop-primary transition-all duration-500 ease-out"
          style={{ width: `${progres}%` }}
        />
      </div>
      <p className="mx-auto mt-2 max-w-sm text-center font-mono text-xs text-loop-line">
        {progres}% · proses berjalan sekali saja
      </p>
    </div>
  );
}