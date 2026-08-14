// LoopLink - Konstanta bersama flow upload (Fase 4.3).
// Label tampilan memakai bahasa Indonesia; nilai yang dikirim ke API tetap
// label model persis (KATEGORI_MODEL) sesuai kontrak docs/api-endpoints.md.

export const KATEGORI_MODEL = [
  "Battery",
  "Biological",
  "Brown-glass",
  "Cardboard",
  "Clothes",
  "Green-glass",
  "Metal",
  "Paper",
  "Plastic",
  "Shoes",
  "Trash",
  "White-glass",
];

export const KATEGORI_LABEL = {
  Battery: "Baterai",
  Biological: "Organik",
  "Brown-glass": "Kaca Cokelat",
  Cardboard: "Karton/Kardus",
  Clothes: "Pakaian",
  "Green-glass": "Kaca Hijau",
  Metal: "Logam",
  Paper: "Kertas",
  Plastic: "Plastik",
  Shoes: "Sepatu",
  Trash: "Sampah Campuran",
  "White-glass": "Kaca Putih",
};

export const SATUAN_LIST = ["kg", "karung", "ton", "unit"];

/** Persen confidence (0..1) -> "87%" atau null kalau tidak ada. */
export function formatPersen(value) {
  if (value == null || !Number.isFinite(Number(value))) return null;
  return `${Math.round(Number(value) * 100)}%`;
}

/**
 * Gabungkan hasil ekstraksi teks (kondisi + catatan_tambahan) jadi prefill
 * deskripsi yang wajar. Kalau AI gagal / kosong, pakai catatan user.
 * @param {{ kondisi?: string, catatan_tambahan?: string, gagal?: boolean }|null} hasil
 * @param {string} catatanUser
 */
export function gabungDeskripsi(hasil, catatanUser = "") {
  if (!hasil || hasil.gagal) return catatanUser || "";
  const bagian = [];
  if (
    typeof hasil.kondisi === "string" &&
    hasil.kondisi.trim() &&
    hasil.kondisi.trim() !== "tidak diketahui"
  ) {
    bagian.push(`Kondisi: ${hasil.kondisi.trim()}.`);
  }
  if (
    typeof hasil.catatan_tambahan === "string" &&
    hasil.catatan_tambahan.trim()
  ) {
    bagian.push(hasil.catatan_tambahan.trim());
  }
  return bagian.join(" ") || catatanUser || "";
}