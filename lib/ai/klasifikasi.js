// lib/ai/klasifikasi.js
//
// Klasifikasi citra limbah via HuggingFace Space (Gradio SDK + ZeroGPU):
//   model `watersplash/waste-classification` (ViT, 12 kelas limbah) di-deploy
//   sebagai HF Space, URL di-set manual via env `KLASIFIKASI_API_URL`
//   (format `https://<space>-<username>.hf.space`).
//
// Alur baru (pengganti HF Inference Router `google/vit-base-patch16-224` +
// tabel `PEMETAAN_LABEL_IMAGENET` yang lama):
//   1. Kirim bytes foto → `POST /klasifikasi` di HF Space, header
//      `X-API-KEY: <KLASIFIKASI_API_TOKEN>` (nilai yang sama dengan Secret
//      `API_KEY` di pengaturan Space), body raw bytes dengan
//      `Content-Type: application/octet-stream`.
//   2. Space mengembalikan `{ hasil: [{ label, score }, ...] }` (top-5).
//      Label dikembalikan lowercase apa adanya dari `id2label` model
//      (mis. "cardboard", "brown-glass").
//   3. Label top-1 di-lookup ke tabel kecil `LABEL_KE_KELAS` (12 entri
//      lowercase → format KELAS_MODEL). `kategori` = hasil pemetaan ATAU
//      `null` bila label tidak dikenal (perilaku defensif → koreksi manual).
//   4. Seluruh hasil top-5 disimpan di `peringkat` (label mentah lowercase).
//
// Karena model ini memang model limbah 12 kelas (bukan classifier ImageNet-1k),
// `Battery` dan `Trash` SEKARANG bisa terdeteksi otomatis — sebelumnya lewat
// ImageNet-1k dua kategori itu tidak pernah muncul (`PEMETAAN_LABEL_IMAGENET`
// tidak punya padanan "battery"/"trash" di ImageNet-1k).
//
// Tiga kategori kaca (Brown/Green/White-glass) tetap dipertahankan terpisah
// sesuai label asli model (`brown-glass`, `green-glass`, `white-glass`) demi
// presisi pemilahan warna cullet — tidak ada normalisasi tampilan "Glass" di
// layer mana pun; modul ini menyimpan label model mentah apa adanya.
//
// Kontrak (dikonsumsi oleh endpoint Fase 3):
//   Sukses  → { kategori, confidence, perlu_koreksi_manual, peringkat?, gagal: false }
//   Gagal   → { kategori: null, confidence: 0, perlu_koreksi_manual: true, gagal: true, alasan_gagal }
//
// `kategori` SATU-SATUNYA boleh bernilai dari `KELAS_MODEL` atau `null`.
// `confidence` adalah skor asli dari model (angka apa adanya, tidak diubah).
//
// Aturan:
//   - URL (KLASIFIKASI_API_URL) & key (KLASIFIKASI_API_TOKEN) selalu dari
//     process.env — tidak pernah hardcode / dikirim ke client. Tanpa URL/TOKEN,
//     fungsi langsung fallback `gagal: true` TANPA fetch.
//   - Timeout eksplisit 10 detik via AbortSignal.timeout; seluruh pemanggilan
//     dibungkus try/catch → TIDAK pernah melempar error mentah ke pemanggil.
//   - Threshold confidence 0.6 (Tahap 3, F.4): di bawah itu user harus koreksi
//     kategori manual (`perlu_koreksi_manual: true`).

export const TIMEOUT_KLASIFIKASI_MS = 10000;
export const CONFIDENCE_THRESHOLD = 0.6;

// 12 kelas LoopLink (dokumentasi + validasi peringkat).
export const KELAS_MODEL = [
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

// Pemetaan label model (lowercase, dari id2label `watersplash/waste-classification`)
// → format KELAS_MODEL LoopLink.
//
// Kunci HARUS persis string label lowercase yang dikembalikan HF Space
// (lookup memakai toLowerCase().trim(), jadi case & spasi tepi diabaikan).
// Dengan model 12 kelas ini semua label seharusnya terpetakan; label tak
// dikenal tetap dimungkinkan (defensif) → `kategori: null` → koreksi manual.
export const LABEL_KE_KELAS = {
  battery: "Battery",
  biological: "Biological",
  "brown-glass": "Brown-glass",
  cardboard: "Cardboard",
  clothes: "Clothes",
  "green-glass": "Green-glass",
  metal: "Metal",
  paper: "Paper",
  plastic: "Plastic",
  shoes: "Shoes",
  trash: "Trash",
  "white-glass": "White-glass",
};

function bentukFallback(alasanGagal) {
  return {
    kategori: null,
    confidence: 0,
    perlu_koreksi_manual: true,
    gagal: true,
    alasan_gagal: alasanGagal,
  };
}

// Label error kering (nama exception saja) — jangan bocorkan stack/body mentah.
function ringkasError(err) {
  const nama = err && err.name ? err.name : err instanceof Error ? err.constructor.name : "Error";
  if (nama === "TimeoutError" || nama === "AbortError") {
    return `panggilan API dibatalkan (timeout ${TIMEOUT_KLASIFIKASI_MS / 1000} detik)`;
  }
  return `gagal memanggil API eksternal (${nama})`;
}

function isValidImageBuffer(imageBuffer) {
  if (imageBuffer == null) return false;
  // Buffer (Node) / ArrayBuffer / Uint8Array & view lain adalah body binary
  // yang sah untuk fetch. Defensif terhadap bundler yang tidak punya Buffer.
  if (typeof Buffer !== "undefined" && Buffer.isBuffer(imageBuffer)) return true;
  if (imageBuffer instanceof ArrayBuffer) return true;
  if (ArrayBuffer.isView(imageBuffer)) return true;
  return false;
}

/**
 * Klasifikasi satu foto limbah (bytes) jadi salah satu dari 12 kelas model,
 * lewat pemetaan label model `watersplash/waste-classification` → kategori
 * LoopLink (tabel `LABEL_KE_KELAS`).
 *
 * @param {Buffer|ArrayBuffer|Uint8Array} imageBuffer bytes gambar
 * @returns {Promise<Object>} lihat kontrak di header file
 */
export async function klasifikasiCitra(imageBuffer) {
  if (!isValidImageBuffer(imageBuffer)) {
    return bentukFallback("input bukan buffer gambar");
  }
  const apiUrl = process.env.KLASIFIKASI_API_URL;
  if (!apiUrl) {
    return bentukFallback("KLASIFIKASI_API_URL kosong");
  }
  if (!process.env.KLASIFIKASI_API_TOKEN) {
    return bentukFallback("KLASIFIKASI_API_TOKEN kosong");
  }

  // Pastikan URL diakhiri /klasifikasi — env hanya berisi root URL Space
  // (mis. https://<space>.hf.space), endpoint klasifikasi = root + /klasifikasi.
  const endpoint = apiUrl.endsWith("/klasifikasi")
    ? apiUrl
    : `${apiUrl.replace(/\/+$/, "")}/klasifikasi`;

  let response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "X-API-KEY": process.env.KLASIFIKASI_API_TOKEN,
        "Content-Type": "application/octet-stream",
      },
      body: imageBuffer,
      signal: AbortSignal.timeout(TIMEOUT_KLASIFIKASI_MS),
    });
  } catch (err) {
    return bentukFallback(ringkasError(err));
  }

  if (!response.ok) {
    return bentukFallback(`respons API tidak OK (status ${response.status})`);
  }

  let body;
  try {
    body = await response.json();
  } catch {
    return bentukFallback("respons API tidak bisa diparse sebagai JSON");
  }

  // HF Space mengembalikan `{ hasil: [{ label, score }, ...] }` (top-5).
  // Bentuk lain / objek error `{ error: ... }` / `hasil` kosong → fallback.
  const hasil = body?.hasil;
  if (!Array.isArray(hasil) || hasil.length === 0) {
    return bentukFallback("bentuk respons model tidak dikenali");
  }

  // Pertahankan urutan model (sudah top-5, terurut confidence); urutkan ulang
  // defensif supaya top selalu benar.
  const peringkat = hasil
    .filter((h) => h && typeof h.label === "string")
    .map((h) => ({ label: h.label, score: Number(h.score) || 0 }))
    .sort((a, b) => b.score - a.score);

  if (peringkat.length === 0) {
    return bentukFallback("bentuk respons model tidak dikenali");
  }

  // Pemetaan label model → kategori LoopLink.
  const top = peringkat[0];
  const kunciLabel = top.label.toLowerCase().trim();
  const kategori = LABEL_KE_KELAS[kunciLabel] ?? null;
  const confidence = top.score;
  // Label unmapped diperlakukan sebagai confidence rendah (rule eksplisit:
  // "label tidak dikenal → koreksi manual").
  const perlu_koreksi_manual = kategori === null || confidence < CONFIDENCE_THRESHOLD;

  return {
    kategori,
    confidence,
    perlu_koreksi_manual,
    peringkat, // label mentah lowercase dari model (top-5), untuk debugging
    gagal: false,
  };
}
