"use client";

import { CheckCircle2, Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Inputs";
import Modal from "@/components/ui/Modal";
import { IconMapPin, IconUsers } from "@/components/icons";
import { KATEGORI_LABEL } from "@/components/upload/constants";

/**
 * Modal Klaim (Task 4.5.2).
 * Fase "konfirmasi": ringkasan listing + tombol Amankan.
 * Fase "sukses": tampilkan info kontak pemilik (nama, telepon bisa diklik,
 * alamat) + pesan "Klaim berhasil".
 */
export default function KlaimModal({
  open = false,
  busy = false,
  error = null,
  fase = "konfirmasi", // konfirmasi | sukses
  listing = null,
  pemilik = null,
  onKonfirmasi,
  onTutup,
}) {
  const labelKategori = listing
    ? KATEGORI_LABEL[listing.kategori_citra] ?? listing.kategori_citra
    : "";

  return (
    <Modal
      open={open}
      onClose={onTutup}
      busy={busy}
      title={fase === "sukses" ? "Klaim berhasil" : "Amankan bahan ini?"}
    >
      {fase === "sukses" ? (
        <div>
          <div
            role="status"
            className="flex items-start gap-2.5 rounded-xl border border-loop-primary/40 bg-loop-primary/10 px-3.5 py-3 text-sm text-loop-primary-hover"
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Klaim berhasil! Hubungi pemilik untuk mengambil bahan.
            </p>
          </div>

          <div className="mt-4 rounded-2xl border border-loop-mist bg-loop-base p-4">
            <p className="font-display text-base font-semibold leading-snug text-loop-ink">
              {listing?.judul ?? "Bahan"}
            </p>
            <div className="mt-3 space-y-2.5 text-sm text-loop-ink">
              <p className="flex items-center gap-2">
                <IconUsers className="h-4 w-4 shrink-0 text-loop-primary" />
                <span className="font-semibold">
                  {pemilik?.nama_lengkap ?? "Pemilik"}
                </span>
              </p>
              {pemilik?.no_telepon ? (
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0 text-loop-primary" />
                  <a
                    href={`tel:${pemilik.no_telepon}`}
                    className="font-semibold text-loop-primary underline-offset-2 hover:underline"
                  >
                    {pemilik.no_telepon}
                  </a>
                </p>
              ) : null}
              {pemilik?.alamat_teks ? (
                <p className="flex items-start gap-2">
                  <IconMapPin className="mt-0.5 h-4 w-4 shrink-0 text-loop-primary" />
                  <span>{pemilik.alamat_teks}</span>
                </p>
              ) : null}
            </div>
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
            Kamu akan mengamankan{" "}
            <span className="font-medium text-loop-ink">
              {listing?.judul ?? "listing ini"}
            </span>{" "}
            ({labelKategori || "kategori tidak diketahui"}). Amankan hanya
            jika kamu benar-benar membutuhkan bahan ini.
          </p>

          <div className="mt-4 rounded-xl border border-loop-mist bg-loop-base px-4 py-3 text-sm text-loop-ink">
            <span className="font-mono text-lg font-semibold tabular-nums">
              {listing?.jumlah ?? "-"}
            </span>{" "}
            <span className="text-loop-line">{listing?.satuan ?? ""}</span>
          </div>

          {error ? (
            <div className="mt-3">
              <Alert variant="error">{error}</Alert>
            </div>
          ) : null}

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              onClick={onTutup}
              disabled={busy}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              onClick={onKonfirmasi}
              loading={busy}
            >
              Amankan
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}