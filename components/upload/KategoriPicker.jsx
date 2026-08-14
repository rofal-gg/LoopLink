"use client";

import { KATEGORI_LABEL, KATEGORI_MODEL } from "./constants";

/**
 * Picker 12 kategori limbah (kartu pilihan).
 * Nilai yang dikirim ke API tetap label model persis; tampilan memakai
 * label Indonesia. Saat `perluKoreksi` true, kartu yang sedang terpilih
 * (default dari AI) disorot oranye supaya user mengecek.
 */
export default function KategoriPicker({
  kategori = null,
  onPilih,
  perluKoreksi = false,
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Pilih kategori limbah"
      className="grid grid-cols-2 gap-2 sm:grid-cols-3"
    >
      {KATEGORI_MODEL.map((k) => {
        const terpilih = kategori === k;
        const sorot = terpilih && perluKoreksi;
        return (
          <button
            key={k}
            type="button"
            role="radio"
            aria-checked={terpilih}
            onClick={() => onPilih(k)}
            className={`fr rounded-xl border px-3 py-2.5 text-left transition active:scale-[0.98] ${
              sorot
                ? "border-loop-signal bg-orange-50 ring-2 ring-loop-signal/30"
                : terpilih
                  ? "border-loop-primary bg-loop-primary/10 ring-2 ring-loop-primary/30"
                  : "border-loop-mist bg-white hover:border-loop-primary/60 hover:bg-loop-base"
            }`}
          >
            <span className="block text-sm font-semibold text-loop-ink">
              {KATEGORI_LABEL[k]}
            </span>
            <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-wide text-loop-line">
              {k}
            </span>
          </button>
        );
      })}
    </div>
  );
}