// lib/api/validasi-listing.js
//
// Helper validasi yang dipakai bersama oleh endpoint `/api/listings`
// (POST) dan `/api/listings/[id]` (PATCH) serta `/api/laporan`.
//
// Prinsip:
//   * Jangan percaya input client — validasi dilakukan di server walaupun
//     RLS / RPC juga memvalidasi (prinsip non-negosiabel #3 di agent doc).
//   * Kategori citra memakai KELAS_MODEL dari `lib/ai/klasifikasi.js`
//     (sumber kebenaran tunggal 12 kelas — tidak duplikasi angka/string).
//   * Semua helper melempar `Error` dengan pesan Indonesia yang jelas;
//     route handler yang menangkapnya menerjemahkan ke Response 400.

import { KELAS_MODEL } from "@/lib/ai/klasifikasi";

export const KATEGORI_VALID = KELAS_MODEL;
export const SATUAN_VALID = ["kg", "karung", "ton", "unit"];

/** Field yang BOLEH diubah lewat PATCH /api/listings/[id]. */
export const FIELD_PATCH_LISTINGS = [
  "judul",
  "kategori_citra",
  "kategori_dikoreksi",
  "confidence_score",
  "deskripsi_teks",
  "jumlah",
  "satuan",
  "lokasi_lat",
  "lokasi_lng",
];

/** Field status/transaksi yang TIDAK boleh diubah lewat PATCH. */
export const FIELD_STATUS_LISTINGS = [
  "status",
  "diklaim_oleh",
  "diklaim_pada",
  "dibatalkan_oleh",
];

/** Kolom identitas yang juga tidak boleh diubah. */
export const FIELD_IDENTITAS_LISTINGS = ["id", "user_id"];

/**
 * Terima angka dari number atau string numerik. Melempar Error kalau tidak
 * bisa diubah menjadi angka finite.
 */
export function paksaAngkaFinite(value, nama) {
  if (typeof value === "string" && value.trim() !== "") {
    value = Number(value);
  }
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${nama} harus berupa angka yang valid`);
  }
  return value;
}

/** Validasi satu koordinat dengan rentang min..max. */
export function validasiKoordinatTunggal(value, nama, min, max) {
  const n = paksaAngkaFinite(value, nama);
  if (n < min || n > max) {
    throw new Error(`${nama} harus antara ${min} dan ${max}`);
  }
  return n;
}

/** Validasi pasangan lat/lng sekaligus. */
export function validasiKoordinat(lat, lng) {
  const latN = validasiKoordinatTunggal(lat, "lokasiLat", -90, 90);
  const lngN = validasiKoordinatTunggal(lng, "lokasiLng", -180, 180);
  return { lokasiLat: latN, lokasiLng: lngN };
}

/** Validasi jumlah > 0 (dipakai POST listing dan cari). */
export function validasiJumlahPositif(value, nama = "jumlah") {
  const n = paksaAngkaFinite(value, nama);
  if (n <= 0) {
    throw new Error(`${nama} harus lebih besar dari 0`);
  }
  return n;
}

/** Validasi kategori citra ∈ 12 kelas model. */
export function validasiKategori(value) {
  if (typeof value !== "string" || !KATEGORI_VALID.includes(value)) {
    throw new Error(`kategoriCitra harus salah satu dari: ${KATEGORI_VALID.join(", ")}`);
  }
  return value;
}

/** Validasi satuan ∈ 4 nilai. */
export function validasiSatuan(value) {
  if (typeof value !== "string" || !SATUAN_VALID.includes(value)) {
    throw new Error("satuan harus salah satu dari: kg, karung, ton, unit");
  }
  return value;
}

/** Validasi UUID (longgar — hanya format, FK/RLS yang menegakkan keberadaan). */
export function isUuid(value) {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
  );
}

/**
 * Ubah nilai `deskripsi_teks` dari body menjadi bentuk yang bisa disimpan
 * ke kolom `text`. Objek (hasil ekstraksi Gemini) di-stringify supaya tetap
 * tersimpan sebagai JSON string.
 */
export function normalisasiDeskripsiTeks(value) {
  if (value == null) return null;
  if (typeof value === "string") return value.trim() === "" ? null : value;
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

/** Validasi expiredAt (ISO date string) → ISO string, atau null. */
export function normalisasiExpiredAt(value) {
  if (value == null || value === "") return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    throw new Error("expiredAt bukan tanggal yang valid");
  }
  return d.toISOString();
}
