"use client";

import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Inputs";
import Modal from "@/components/ui/Modal";

/**
 * Modal Batalkan Klaim (Task 4.5.4).
 * Bisa dipakai pemilik ATAU pengklaim saat status `dipesan`.
 * `labelPihak`: "dari Budi Santoso" (pemilik) atau "milikmu" (pengklaim).
 */
export default function BatalModal({
  open = false,
  busy = false,
  error = null,
  judul = "",
  labelPihak = "yang ada",
  onKonfirmasi,
  onTutup,
}) {
  return (
    <Modal
      open={open}
      onClose={onTutup}
      busy={busy}
      title="Batalkan klaim?"
    >
      <p className="text-sm leading-relaxed text-loop-line">
        Batalkan klaim {labelPihak} pada listing{" "}
        <span className="font-medium text-loop-ink">{judul || "ini"}</span>?
        Status listing akan kembali menjadi{" "}
        <span className="font-medium text-loop-ink">Tersedia</span> untuk
        dicari orang lain.
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
        <Button variant="danger" onClick={onKonfirmasi} loading={busy}>
          <XCircle className="h-4 w-4" />
          Ya, Batalkan
        </Button>
      </div>
    </Modal>
  );
}