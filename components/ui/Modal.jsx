"use client";

import { useEffect, useId, useRef, useState } from "react";
import { IconX } from "@/components/icons";

/**
 * Modal dasar LoopLink (dipakai semua modal 4.5 dan dapat dipakai ulang).
 *
 * a11y:
 * - role=dialog + aria-modal + aria-labelledby
 * - Escape menutup, backdrop menutup (kecuali sedang busy)
 * - Fokus pindah ke panel saat terbuka (hanya saat transisi buka, tidak
 *   mencuri fokus saat komponen re-render di dalam modal)
 * - Mobile: panel dari bawah; desktop: kartu di tengah.
 *
 * Props:
 *   open    - tampilkan modal
 *   onClose - callback tutup (dipanggil Escape / backdrop / tombol X)
 *   title   - judul modal (aria-labelledby)
 *   busy    - memblokir penutupan sementara proses (cegah double-submit)
 *   maxW    - lebar panel (Tailwind max-w-*)
 */
export default function Modal({
  open = false,
  onClose,
  title,
  children,
  busy = false,
  maxW = "max-w-md",
  className = "",
}) {
  const panelRef = useRef(null);
  const titleId = useId();

  // Sinkronkan semua kecuali open lewat state supaya lint rules react-hooks
  // (refs/set-state-in-effect) tetap bersih.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
  }

  // Escape menutup (kecuali busy). Efek bergantung pada busy/onClose supaya
  // selalu memakai nilai terbaru tanpa menyentuh ref saat render.
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape" && !busy) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, busy, onClose]);

  // Fokus panel hanya pada transisi buka (deps [open], bukan tiap re-render).
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => panelRef.current?.focus(), 30);
    return () => window.clearTimeout(t);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Tutup dialog"
        onClick={onClose}
        disabled={busy}
        className="absolute inset-0 cursor-default bg-loop-ink/60 backdrop-blur-sm"
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-loop-mist bg-white shadow-xl outline-none sm:rounded-2xl ${maxW} ${className}`}
      >
        <div className="flex items-start justify-between gap-3 border-b border-loop-rowline px-5 py-4 sm:px-6">
          <h2
            id={titleId}
            className="font-display text-lg font-semibold tracking-tight text-loop-ink"
          >
            {title}
          </h2>
          <button
            type="button"
            aria-label="Tutup"
            onClick={onClose}
            disabled={busy}
            className="fr -mr-1 -mt-1 rounded-full p-1.5 text-loop-line transition hover:bg-loop-base hover:text-loop-ink disabled:opacity-50"
          >
            <IconX className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
      </div>
    </div>
  );
}