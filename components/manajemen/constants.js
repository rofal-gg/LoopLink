// LoopLink - konstanta bersama halaman manajemen pribadi (Fase 4.6).
// Badge status & format tanggal memakai pola dari DetailListing
// (components/listing/DetailListing.jsx) supaya konsisten di semua halaman.

export const STATUS_META = {
  tersedia: { label: "Tersedia", cls: "bg-loop-primary text-white" },
  dipesan: { label: "Dipesan", cls: "bg-loop-signal text-white" },
  selesai: { label: "Selesai", cls: "bg-loop-ink text-loop-base" },
  dibatalkan: { label: "Dibatalkan", cls: "bg-loop-line text-white" },
};

/** Format tanggal panjang id-ID (mis. "15 Agustus 2026"). */
export function formatTanggal(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Format tanggal + jam singkat id-ID (mis. "15 Agu 2026, 09:41"). */
export function formatTanggalWaktu(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }) + ", " + d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}