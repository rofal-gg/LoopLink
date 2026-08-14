"use client";

import { useState } from "react";
import { CheckCircle2, Flag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Alert, TextArea } from "@/components/ui/Inputs";
import Modal from "@/components/ui/Modal";

/**
 * Modal Laporkan Listing (Task 4.5.5).
 * Hanya untuk bukan-pemilik. Fase "form": alasan wajib non-empty.
 * Fase "sukses": pesan terima kasih.
 */
export default function LaporModal({
  open = false,
  busy = false,
  error = null,
  fase = "form", // form | sukses
  judul = "",
  onKirim,
  onTutup,
}) {
  const [alasan, setAlasan] = useState("");
  const [errorForm, setErrorForm] = useState(null);

  // Reset isian setiap modal dibuka (pola "adjust state when props change").
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setAlasan("");
      setErrorForm(null);
    }
  }

  function kirim() {
    const teks = alasan.trim();
    if (!teks) {
      setErrorForm("Alasan wajib diisi.");
      return;
    }
    setErrorForm(null);
    onKirim(teks);
  }

  return (
    <Modal
      open={open}
      onClose={onTutup}
      busy={busy}
      title={fase === "sukses" ? "Laporan terkirim" : "Laporkan listing"}
    >
      {fase === "sukses" ? (
        <div>
          <div
            role="status"
            className="flex items-start gap-2.5 rounded-xl border border-loop-primary/40 bg-loop-primary/10 px-3.5 py-3 text-sm text-loop-primary-hover"
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Terima kasih, laporan terkirim. Tim LoopLink akan meninjaunya.
            </p>
          </div>
          <div className="mt-6 flex justify-end">
            <Button variant="primary" onClick={onTutup}>
              Tutup
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-sm leading-relaxed text-loop-line">
            Beri tahu kami masalah pada{" "}
            <span className="font-medium text-loop-ink">
              {judul || "listing ini"}
            </span>
            . Laporan hanya bisa dikirim sekali per masalah.
          </p>

          <div className="mt-4">
            <TextArea
              id="alasan-laporan"
              label="Alasan"
              rows={4}
              placeholder="Contoh: Foto tidak sesuai dengan isi."
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              error={errorForm}
              disabled={busy}
            />
          </div>

          {error ? (
            <div className="mt-3">
              <Alert variant="error">{error}</Alert>
            </div>
          ) : null}

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={onTutup} disabled={busy}>
              Batal
            </Button>
            <Button variant="danger" onClick={kirim} loading={busy}>
              <Flag className="h-4 w-4" />
              Kirim Laporan
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}