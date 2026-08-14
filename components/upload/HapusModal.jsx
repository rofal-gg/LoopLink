"use client";

import { useEffect } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Inputs";

/**
 * Modal konfirmasi hapus listing (zona bahaya).
 * Hanya dipakai saat status listing `tersedia`.
 */
export default function HapusModal({
  open = false,
  busy = false,
  error = null,
  onHapus,
  onBatal,
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape" && !busy) onBatal();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, busy, onBatal]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="hapus-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="Tutup dialog"
        onClick={onBatal}
        disabled={busy}
        className="absolute inset-0 bg-loop-ink/60 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-md rounded-2xl border border-loop-mist bg-white p-6 shadow-xl sm:p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-700">
          <Trash2 className="h-6 w-6" />
        </div>
        <h2
          id="hapus-modal-title"
          className="mt-4 font-display text-xl font-semibold tracking-tight text-loop-ink"
        >
          Hapus listing ini?
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-loop-line">
          Listing akan dihapus permanen beserta fotonya. Lanjutkan?
        </p>

        {error ? (
          <div className="mt-3">
            <Alert variant="error">{error}</Alert>
          </div>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onBatal} disabled={busy}>
            Batal
          </Button>
          <Button variant="danger" onClick={onHapus} loading={busy}>
            <Trash2 className="h-4 w-4" />
            Ya, Hapus
          </Button>
        </div>
      </div>
    </div>
  );
}