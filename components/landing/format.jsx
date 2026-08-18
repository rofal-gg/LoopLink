// components/landing/format.jsx
//
// Helper kecil (client-safe) untuk memformat data Landing page dari
// lib/api/landing. Hanya berisi fungsi murni + label sumber — TIDAK ada
// query DB apa pun. Dipakai komponen client di components/landing/*.

import { KATEGORI_LABEL } from "../upload/constants";

/**
 * Waktu relatif ramah (id): "baru saja", "N mnt lalu", "N jam lalu",
 * "N hari lalu". Kalau `iso` tidak valid → return "".
 */
export function formatWaktuRelatif(iso) {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "";
  const detik = Math.max(0, Math.floor((Date.now() - t) / 1000));
  if (detik < 60) return "baru saja";
  const mnt = Math.floor(detik / 60);
  if (mnt < 60) return `${mnt} mnt lalu`;
  const jam = Math.floor(mnt / 60);
  if (jam < 24) return `${jam} jam lalu`;
  const hari = Math.floor(jam / 24);
  return `${hari} hari lalu`;
}

/**
 * Tanggal pendek id-ID: "17 Agu 2026". Invalid → "".
 */
export function formatTanggal(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Angka utuh dengan koma ribuan id-ID. Null/non-angka → "—".
 */
export function formatAngka(value) {
  if (value == null || !Number.isFinite(Number(value))) return "—";
  return Number(value).toLocaleString("id-ID");
}

/**
 * Confidence (0..1) → persen 1 desimal id-ID: 0.86 → "86,0%".
 * Null/non-angka → "—".
 */
export function formatPersen(value) {
  if (value == null || !Number.isFinite(Number(value))) return "—";
  return `${(Number(value) * 100).toLocaleString("id-ID", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

/**
 * Confidence (0..1) → persen dibulatkan (untuk lebar progress bar dsb).
 * Null → null (pemanggil memutuskan fallback, jangan mengada-ada).
 */
export function formatPersenBulat(value) {
  if (value == null || !Number.isFinite(Number(value))) return null;
  return Math.round(Number(value) * 100);
}

/**
 * Progres persen (0-100, dibatasi 100) terhadap target internal.
 * Nilai/target null → 0 (data kosong = progres nol, bukan angka fiktif).
 */
export function persenProgres(nilai, target) {
  const n = Number(nilai);
  const t = Number(target);
  if (!Number.isFinite(n) || !Number.isFinite(t) || t <= 0) return 0;
  return Math.min(100, Math.round((n / t) * 100));
}

/**
 * Label Indonesia untuk kategori model (KATEGORI_LABEL). Kategori yang
 * tidak dikenal → tampilkan string aslinya.
 */
export function labelKategori(kategori) {
  if (!kategori) return "Lainnya";
  return KATEGORI_LABEL[kategori] ?? kategori;
}

/**
 * Sufiks jumlah untuk feed aktivitas / klaim, mis. " (13 kg)".
 * Kalau jumlah & satuan kosong → "" (tidak menampilkan angka mengada-ada).
 */
export function formatJumlah(item) {
  if (!item) return "";
  const jml = item.jumlah;
  const sat = item.satuan;
  if (jml == null) return sat ? ` (${sat})` : "";
  return ` (${formatAngka(jml)}${sat ? ` ${sat}` : ""})`;
}

/**
 * Label sumber seragam untuk section yang menampilkan data dari DB.
 * Format: "Sumber: database LoopLink" + (jika ada tanggal) " · diperbarui ...".
 */
export function SourceLabel({
  tanggal = null,
  prefix = "Sumber: database LoopLink",
  color = "#8C9184",
  style = {},
}) {
  const tgl = formatTanggal(tanggal);
  const teks = tgl ? `${prefix} · diperbarui ${tgl}` : prefix;
  return (
    <p
      style={{
        margin: 0,
        fontFamily: "var(--font-mono)",
        fontSize: "0.68rem",
        letterSpacing: "0.02em",
        color,
        ...style,
      }}
    >
      {teks}
    </p>
  );
}

/**
 * Inisial 2 huruf dari nama (untuk avatar testimoni).
 * "Budi Santoso" → "BS"; "Budi" → "BU". Nama kosong → "??".
 */
export function inisial(nama) {
  if (!nama) return "??";
  const kata = String(nama).trim().split(/\s+/).filter(Boolean);
  if (kata.length === 0) return "??";
  if (kata.length === 1) return kata[0].slice(0, 2).toUpperCase();
  return (kata[0][0] + kata[kata.length - 1][0]).toUpperCase();
}