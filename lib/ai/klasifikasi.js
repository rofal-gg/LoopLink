// lib/ai/klasifikasi.js
//
// Klasifikasi citra limbah via HuggingFace Inference API:
//   https://huggingface.co/watersplash/waste-classification
//
// Kontrak (dikonsumsi oleh endpoint Fase 3):
//   Sukses  → { kategori, confidence, perlu_koreksi_manual, peringkat?, gagal: false }
//   Gagal   → { kategori: null, confidence: 0, perlu_koreksi_manual: true, gagal: true, alasan_gagal }
//
// Aturan:
//   - API key selalu dari process.env.HF_API_TOKEN — tidak pernah hardcode /
//     dikirim ke client.
//   - Timeout eksplisit 10 detik via AbortSignal.timeout; seluruh pemanggilan
//     dibungkus try/catch → TIDAK pernah melempar error mentah ke pemanggil.
//   - Threshold confidence 0.6 (Tahap 3, F.4): di bawah itu user harus koreksi
//     kategori manual (`perlu_koreksi_manual: true`).
//   - Label asli dari model disimpan apa adanya (Brown-glass/Green-glass/
//     White-glass TIDAK dinormalisasi) — normalisasi tampilan jadi "Glass"
//     adalah tanggung jawab frontend, bukan modul ini.

const URL_KLASIFIKASI =
  "https://api-inference.huggingface.co/models/watersplash/waste-classification";

export const TIMEOUT_KLASIFIKASI_MS = 10000;
export const CONFIDENCE_THRESHOLD = 0.6;

// 12 kelas model (dokumentasi + validasi peringkat).
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
 * Klasifikasi satu foto limbah (bytes) jadi salah satu dari 12 kelas model.
 *
 * @param {Buffer|ArrayBuffer|Uint8Array} imageBuffer bytes gambar
 * @returns {Promise<Object>} lihat kontrak di header file
 */
export async function klasifikasiCitra(imageBuffer) {
  if (!isValidImageBuffer(imageBuffer)) {
    return bentukFallback("input bukan buffer gambar");
  }
  if (!process.env.HF_API_TOKEN) {
    return bentukFallback("HF_API_TOKEN kosong");
  }

  let response;
  try {
    response = await fetch(URL_KLASIFIKASI, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_API_TOKEN}`,
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

  let hasil;
  try {
    hasil = await response.json();
  } catch {
    return bentukFallback("respons API tidak bisa diparse sebagai JSON");
  }

  // HF biasanya mengembalikan [{ label, score }, ...] terurut confidence
  // tertinggi; urutkan ulang defensif supaya top selalu benar.
  if (Array.isArray(hasil) && hasil.length > 0 && typeof hasil[0]?.label === "string") {
    const peringkat = hasil
      .filter((h) => h && typeof h.label === "string")
      .map((h) => ({ label: h.label, score: Number(h.score) || 0 }))
      .sort((a, b) => b.score - a.score);

    if (peringkat.length === 0) {
      return bentukFallback("bentuk respons model tidak dikenali");
    }

    const top = peringkat[0];
    return {
      kategori: top.label,
      confidence: top.score,
      perlu_koreksi_manual: top.score < CONFIDENCE_THRESHOLD,
      peringkat,
      gagal: false,
    };
  }

  // HF kadang membalas objek error (mis. model masih loading / out-of-memory).
  return bentukFallback("bentuk respons model tidak dikenali");
}