"use client";

import { useEffect, useRef, useState } from "react";
import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { IconX } from "@/components/icons";
import { KATEGORI_LABEL, KATEGORI_MODEL } from "@/components/upload/constants";

const SORT_OPTIONS = [
  { nilai: "skor", label: "Paling cocok", desc: "Skor kecocokan tertinggi" },
  { nilai: "jarak", label: "Terdekat", desc: "Jarak dari lokasimu" },
  { nilai: "volume", label: "Volume terbesar", desc: "Jumlah paling banyak" },
];

/**
 * Drawer urutkan & filter hasil pencarian.
 * Sort & filter diterapkan client-side di CariFlow; drawer ini hanya
 * mengumpulkan pilihan draft lalu "Terapkan" meneruskannya ke induk.
 * Mobile: panel dari bawah. Desktop: panel dari samping kanan.
 */
export default function DrawerSortFilter({
  open = false,
  onClose,
  sort = "skor",
  onSortChange,
  filter = [],
  onFilterChange,
  onReset,
}) {
  const [sortDraft, setSortDraft] = useState(sort);
  const [filterDraft, setFilterDraft] = useState(filter);
  const panelRef = useRef(null);

  // Saat drawer dibuka, tarik nilai sort/filter terbaru dari induk ke draft.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setSortDraft(sort);
      setFilterDraft(filter);
    }
  }

  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => panelRef.current?.focus(), 30);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [open, onClose]);

  if (!open) return null;

  function toggleKategori(k) {
    setFilterDraft((prev) =>
      prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]
    );
  }

  function terapkan() {
    onSortChange(sortDraft);
    onFilterChange(filterDraft);
    onClose();
  }

  function reset() {
    onSortChange("skor");
    onFilterChange([]);
    onClose();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sort-filter-title"
      className="fixed inset-0 z-50 flex items-end sm:items-stretch sm:justify-end"
    >
      <button
        type="button"
        aria-label="Tutup urutkan dan filter"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-loop-ink/60 backdrop-blur-sm"
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative flex max-h-[85dvh] w-full flex-col rounded-t-2xl border border-loop-mist bg-loop-base shadow-2xl outline-none sm:max-h-full sm:max-w-sm sm:rounded-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-loop-rowline px-5 py-4">
          <h2
            id="sort-filter-title"
            className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight text-loop-ink"
          >
            <SlidersHorizontal className="h-5 w-5 text-loop-primary" />
            Urutkan &amp; Filter
          </h2>
          <button
            type="button"
            aria-label="Tutup"
            onClick={onClose}
            className="fr -mr-1 rounded-full p-1.5 text-loop-line transition hover:bg-loop-mist hover:text-loop-ink"
          >
            <IconX className="h-5 w-5" />
          </button>
        </div>

        {/* Body scroll */}
        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          {/* Urutkan */}
          <section aria-labelledby="sort-heading">
            <h3
              id="sort-heading"
              className="text-xs font-semibold uppercase tracking-wide text-loop-line"
            >
              Urutkan
            </h3>
            <div
              role="radiogroup"
              aria-label="Urutkan hasil"
              className="mt-3 grid gap-2"
            >
              {SORT_OPTIONS.map((opt) => {
                const aktif = sortDraft === opt.nilai;
                return (
                  <button
                    key={opt.nilai}
                    type="button"
                    role="radio"
                    aria-checked={aktif}
                    onClick={() => setSortDraft(opt.nilai)}
                    className={`fr rounded-xl border px-4 py-3 text-left transition active:scale-[0.98] ${
                      aktif
                        ? "border-loop-primary bg-loop-primary/10 ring-2 ring-loop-primary/30"
                        : "border-loop-mist bg-white hover:border-loop-primary/50 hover:bg-loop-base"
                    }`}
                  >
                    <span className="block text-sm font-semibold text-loop-ink">
                      {opt.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-loop-line">
                      {opt.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Filter kategori */}
          <section aria-labelledby="filter-heading">
            <h3
              id="filter-heading"
              className="text-xs font-semibold uppercase tracking-wide text-loop-line"
            >
              Filter kategori
            </h3>
            <div className="mt-3 grid grid-cols-1 gap-2">
              {KATEGORI_MODEL.map((k) => {
                const aktif = filterDraft.includes(k);
                return (
                  <label
                    key={k}
                    className={`fr flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-2.5 transition ${
                      aktif
                        ? "border-loop-primary bg-loop-primary/10"
                        : "border-loop-mist bg-white hover:bg-loop-base"
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-loop-ink">
                        {KATEGORI_LABEL[k]}
                      </span>
                      <span className="block font-mono text-[10px] uppercase tracking-wide text-loop-line">
                        {k}
                      </span>
                    </span>
                    <input
                      type="checkbox"
                      checked={aktif}
                      onChange={() => toggleKategori(k)}
                      className="h-4 w-4 shrink-0 accent-loop-primary"
                    />
                  </label>
                );
              })}
            </div>
          </section>
        </div>

        {/* Footer aksi */}
        <div className="flex flex-col-reverse gap-2 border-t border-loop-rowline px-5 py-4 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={reset}>
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          <Button variant="primary" onClick={terapkan}>
            Terapkan
          </Button>
        </div>
      </div>
    </div>
  );
}