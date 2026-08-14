"use client";

import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Inputs";
import Modal from "@/components/ui/Modal";

/**
 * Modal Konfirmasi Selesaikan Transaksi (Task 4.5.3).
 * Hanya untuk pemilik listing dengan status `dipesan`.
 */
export default function SelesaiModal({
  open = false,
  busy = false,
  error = null,
  judul = "",
  onKonfirmasi,
  onTutup,
}) {
  return (
    <Modal
      open={open}
      onClose={onTutup}
      busy={busy}
      title="Selesaikan transaksi?"
    >
      <p className="text-sm leading-relaxed text-loop-line">
        Pastikan bahan{" "}
        <span className="font-medium text-loop-ink">{judul || "listing ini"}</span>{" "}
        sudah diambil pengklaim dan kondisinya sesuai. Setelah diselesaikan,
        status listing menjadi{" "}
        <span className="font-medium text-loop-ink">Selesai</span> dan tidak
        bisa diklaim lagi.
      </p>

      {error ? (
        <div className="mt-3">
          <Alert variant="error">{error}</Alert>
        </div>
      ) : null}

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onTutup} disabled={busy}>
          Batal
        </Button>
        <Button variant="primary" onClick={onKonfirmasi} loading={busy}>
          <CheckCircle2 className="h-4 w-4" />
          Ya, Selesaikan
        </Button>
      </div>
    </Modal>
  );
}