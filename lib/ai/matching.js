// lib/ai/matching.js
//
// Skor kecocokan (rule-based) + perhitungan jarak Haversine.
//
// PENTING (keputusan final, Tahap 3 bagian B): matching TIDAK memakai sentence
// embedding. Kategori limbah & kebutuhan pencari sama-sama berasal dari himpunan
// tetap (12 kelas citra untuk limbah, dropdown untuk kebutuhan), sehingga
// kecocokan didefinisikan eksplisit lewat tabel `kategori_kecocokan` — bukan
// model tambahan yang "menerka" makna teks.
//
// Kedua fungsi di modul ini PURE (tidak ada I/O) — tidak perlu timeout, tidak
// perlu fallback jaringan. Dijamin selalu `throw`-free: `hitungJarakKm` melempar
// TypeError hanya untuk input koordinat invalid; `hitungSkorKecocokan` tidak
// pernah melempar dan selalu mengembalikan angka dalam rentang [0, 1].

// BIARKAN KONSTANTA INI DIPAKAI OLEH ENDPOINT (Fase 3) — dipakai di sini supaya
// tidak ada duplikasi angka magis di tempat lain.
export const BOBOT_KATEGORI = 0.5;
export const BOBOT_JARAK = 0.3;
export const BOBOT_VOLUME = 0.2;
export const RADIUS_BUMI_KM = 6371;

/**
 * Hanya menerima angka finite (menerima string numerik dari form, mis. "5.5").
 * Untuk `hitungJarakKm`: input non-number/NaN → lempar TypeError yang jelas.
 */
function paksaAngkaJarak(value, nama) {
  if (typeof value === "string" && value.trim() !== "") {
    value = Number(value);
  }
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new TypeError(
      `hitungJarakKm: ${nama} harus berupa angka finite (diterima: ${String(value)})`
    );
  }
  return value;
}

/**
 * Untuk `hitungSkorKecocokan`: nilai invalid/NaN TIDAK melempar — dipakai
 * fallback konservatif sehingga endpoint selalu bisa menghitung skor.
 */
function angkaAtau(value, fallback) {
  if (typeof value === "string" && value.trim() !== "") {
    value = Number(value);
  }
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

/**
 * Jarak great-circle antara dua titik koordinat (Haversine), radius Bumi 6371 km.
 *
 * KOMENTAR SKALABILITAS: ini pendekatan PROTOTYPE — cukup untuk data demo.
 * Migrasi ke PostGIS (`ST_DWithin`) adalah langkah skalabilitas berikutnya dan
 * di luar scope saat ini kecuali diminta.
 *
 * Guard: nilai non-number / NaN / string tak-parse → TypeError jelas.
 * (Sengaja tidak "diam-diam jadi 0" karena hasil jarak dipakai untuk keputusan
 * bisnis dan disimpan ke `riwayat_pencarian`.)
 *
 * @param {number} lat1
 * @param {number} lng1
 * @param {number} lat2
 * @param {number} lng2
 * @returns {number} jarak dalam kilometer (>= 0)
 */
export function hitungJarakKm(lat1, lng1, lat2, lng2) {
  const a1 = paksaAngkaJarak(lat1, "lat1");
  const o1 = paksaAngkaJarak(lng1, "lng1");
  const a2 = paksaAngkaJarak(lat2, "lat2");
  const o2 = paksaAngkaJarak(lng2, "lng2");

  const dLat = ((a2 - a1) * Math.PI) / 180;
  const dLng = ((o2 - o1) * Math.PI) / 180;
  const hSin =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a1 * Math.PI) / 180) * Math.cos((a2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;

  // hSin bisa sedikit di luar [0, 1] karena presisi floating point — clamp
  // sebelum asin supaya tidak menghasilkan NaN.
  const h = Math.min(1, Math.max(0, hSin));
  return RADIUS_BUMI_KM * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/**
 * Formula skor akhir (Tahap 3 bagian B):
 *
 *   skor_akhir = (skor_kecocokan_kategori × 0.5) + (skor_jarak × 0.3) + (skor_volume × 0.2)
 *
 * - `skor_kecocokan_kategori` diambil dari `tabelKecocokan` (array
 *   `{ kategori_limbah, kategori_kebutuhan, skor_dasar }`). Tidak ada pasangan
 *   → return 0 langsung (tidak cocok sama sekali).
 * - `skor_jarak = max(0, 1 - jarakKm/radiusKm)`.
 * - `skor_volume = min(1, jumlahTersedia/jumlahDibutuhkan)`.
 *
 * Guard yang didokumentasikan:
 * - `radiusKm <= 0` / invalid → `skor_jarak` dianggap 0 (tidak ada bonus jarak).
 * - `jarakKm` invalid/negatif → diperlakukan sebagai radius → `skor_jarak` 0.
 * - `jumlahDibutuhkan <= 0` / invalid → `skor_volume` 0.
 * - `jumlahTersedia` invalid/negatif → 0.
 * - Hasil akhir di-clamp ke rentang [0, 1].
 *
 * Pure function — tidak pernah melempar, tidak melakukan I/O.
 */
export function hitungSkorKecocokan({
  kategoriListing,
  kategoriDicari,
  jarakKm,
  radiusKm,
  jumlahTersedia,
  jumlahDibutuhkan,
  tabelKecocokan,
}) {
  if (!Array.isArray(tabelKecocokan)) return 0;

  // 1) Skor kategori — dari tabel aturan eksplisit, bukan model.
  const aturan = tabelKecocokan.find(
    (r) => r.kategori_limbah === kategoriListing && r.kategori_kebutuhan === kategoriDicari
  );
  if (
    !aturan ||
    typeof aturan.skor_dasar !== "number" ||
    !Number.isFinite(aturan.skor_dasar)
  ) {
    return 0; // tidak ada pasangan → tidak cocok, tidak perlu hitung lebih lanjut
  }
  const skorKategori = aturan.skor_dasar;

  // 2) Skor jarak — normalisasi terbalik; radius invalid/<=0 → 0.
  const radius = angkaAtau(radiusKm, 0);
  let skorJarak = 0;
  if (radius > 0) {
    const jarak = angkaAtau(jarakKm, radius); // jarak tak diketahui → di ujung radius → 0
    skorJarak = Math.max(0, 1 - Math.max(0, jarak) / radius);
  }

  // 3) Skor volume — butuh > 0; tersedia dibatasi minimal 0.
  const dibutuhkan = angkaAtau(jumlahDibutuhkan, 0);
  let skorVolume = 0;
  if (dibutuhkan > 0) {
    const tersedia = Math.max(0, angkaAtau(jumlahTersedia, 0));
    skorVolume = Math.min(1, tersedia / dibutuhkan);
  }

  const skorAkhir =
    skorKategori * BOBOT_KATEGORI + skorJarak * BOBOT_JARAK + skorVolume * BOBOT_VOLUME;

  return Math.min(1, Math.max(0, skorAkhir));
}