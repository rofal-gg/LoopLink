// lib/ai/klasifikasi.js
//
// Klasifikasi citra limbah via HuggingFace Inference Router:
//   https://router.huggingface.co/hf-inference/models/google/vit-base-patch16-224
//
// Model `google/vit-base-patch16-224` adalah classifier ImageNet-1k (pipeline
// image-classification) — BUKAN model limbah khusus. Label ImageNet-1k yang
// dikembalikan model DIPETAKAN ke 12 kategori LoopLink lewat tabel
// `PEMETAAN_LABEL_IMAGENET`.
//
// Alur pemetaan:
//   1. Kirim bytes foto → model image-classification.
//   2. Ambil label peringkat pertama (top 1) + nilai skornya.
//   3. Lookup label top di `PEMETAAN_LABEL_IMAGENET` (case & spasi tepi
//      diabaikan saat lookup — kunci tabel ditulis sudah dinormalisasi).
//   4. `kategori` = nilai pemetaan (salah satu dari `KELAS_MODEL`) ATAU `null`
//      bila label tidak ada di tabel. Label yang tidak terpetakan diperlakukan
//      sebagai confidence rendah → user wajib koreksi manual (rule eksplisit).
//
// Catatan historis: model lama `watersplash/waste-classification` (12 kelas
// limbah langsung) sudah tidak diserve provider mana pun, sehingga endpoint
// lama `api-inference.huggingface.co/models/...` TIDAK dipakai lagi.
// Tiga kategori kaca (Brown/Green/White-glass) DI PERTAHANKAN TERPISAH secara
// sengaja demi presisi data — pemilahan warna cullet penting di industri daur
// ulang kaca. Tidak ada normalisasi tampilan "Glass" di layer mana pun; modul
// ini menyimpan label asli apa adanya (dan label ImageNet mentah di
// `peringkat`).
//
// Kontrak (dikonsumsi oleh endpoint Fase 3):
//   Sukses  → { kategori, confidence, perlu_koreksi_manual, peringkat?, gagal: false }
//   Gagal   → { kategori: null, confidence: 0, perlu_koreksi_manual: true, gagal: true, alasan_gagal }
//
// `kategori` SATU-SATUNYA boleh bernilai dari `KELAS_MODEL` atau `null`.
// `confidence` adalah skor asli dari model (angka apa adanya, tidak diubah).
//
// Aturan:
//   - API key selalu dari process.env.HF_API_TOKEN — tidak pernah hardcode /
//     dikirim ke client.
//   - Timeout eksplisit 10 detik via AbortSignal.timeout; seluruh pemanggilan
//     dibungkus try/catch → TIDAK pernah melempar error mentah ke pemanggil.
//   - Threshold confidence 0.6 (Tahap 3, F.4): di bawah itu user harus koreksi
//     kategori manual (`perlu_koreksi_manual: true`).

const URL_KLASIFIKASI =
  "https://router.huggingface.co/hf-inference/models/google/vit-base-patch16-224";

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

// Pemetaan label ImageNet-1k → kategori LoopLink.
//
// Kunci HARUS persis string label yang dikembalikan HuggingFace (case & spasi
// tepi diabaikan saat lookup: kunci di sini sudah ditulis normalisasi
// lowercase+trim, sama dengan cara lookup membacanya). Daftar ini diverifikasi
// terhadap `config.json` (`id2label`) google/vit-base-patch16-224 — hanya label
// yang benar-benar ada di ImageNet-1k yang dijadikan kunci utama.
//
// Kategori warna kaca (Brown/Green/White-glass) adalah asumsi warna dominan
// dari label botol ImageNet — dipertahankan dalam 3 kategori terpisah secara
// sengaja (pemilahan warna cullet penting di industri daur ulang kaca); tidak
// ada normalisasi tampilan "Glass" di layer mana pun.
//
// Satu-satunya pengecualian yang disengaja:
//   - "Battery" TIDAK punya padanan di ImageNet-1k (kelas "battery" tidak ada)
//     sehingga kategori Battery dilewati → label apa pun masuk jalur koreksi
//     manual (`kategori: null`), sesuai aturan label unmapped.
// Mayoritas kunci lain HARUS label ImageNet-1k asli (diverifikasi via id2label,
// lihat komentar atas). Map Cardboard hanya lewat "carton" — label ImageNet-1k
// nyata — tanpa kunci defensif "cardboard" lagi.
export const PEMETAAN_LABEL_IMAGENET = {
  // --- Plastik ---
  "pop bottle, soda bottle": "Plastic",
  "water bottle": "Plastic", // dominan botol air kemasan plastik di aliran limbah
  "plastic bag": "Plastic",
  "pill bottle": "Plastic", // botol obat modern umumnya plastik
  bottlecap: "Plastic", // tutup botol soda modern umumnya plastik

  // --- Karton / Cardboard ---
  carton: "Cardboard", // karton susu/jus — aliran daur ulang karton

  // --- Kertas ---
  envelope: "Paper",
  "paper towel": "Paper",
  "toilet tissue, toilet paper, bathroom tissue": "Paper",
  "comic book": "Paper",
  "book jacket, dust cover, dust jacket, dust wrapper": "Paper",
  menu: "Paper",

  // --- Logam ---
  "milk can": "Metal", // kaleng susu logam

  // --- Pakaian / tekstil ---
  "jersey, T-shirt, tee shirt": "Clothes",
  "jean, blue jean, denim": "Clothes",
  sweatshirt: "Clothes",
  sock: "Clothes",
  cardigan: "Clothes",
  "fur coat": "Clothes",
  "lab coat, laboratory coat": "Clothes",
  "trench coat": "Clothes",
  "bath towel": "Clothes", // tekstil rumah tangga

  // --- Alas kaki ---
  "running shoe": "Shoes",
  sandal: "Shoes",
  "cowboy boot": "Shoes",

  // --- Kaca (warna = asumsi dominan; 3 kategori kaca dipertahankan terpisah) ---
  "beer bottle": "Brown-glass", // botol bir dominan amber/cokelat
  "wine bottle": "Green-glass", // botol anggur dominan hijau tua
  "beer glass": "White-glass", // gelas minum umumnya bening

  // --- Sampah organik / biologis ---
  banana: "Biological",
  orange: "Biological",
  lemon: "Biological",
  mushroom: "Biological",
  "cucumber, cuke": "Biological",
  corn: "Biological",
  "pineapple, ananas": "Biological",
  "head cabbage": "Biological",
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
 * lewat pemetaan label ImageNet-1k → kategori LoopLink.
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

  // HF mengembalikan [{ label, score }, ...] terurut confidence tertinggi;
  // urutkan ulang defensif supaya top selalu benar.
  if (Array.isArray(hasil) && hasil.length > 0 && typeof hasil[0]?.label === "string") {
    const peringkat = hasil
      .filter((h) => h && typeof h.label === "string")
      .map((h) => ({ label: h.label, score: Number(h.score) || 0 }))
      .sort((a, b) => b.score - a.score);

    if (peringkat.length === 0) {
      return bentukFallback("bentuk respons model tidak dikenali");
    }

    // Pemetaan ImageNet-1k → kategori LoopLink.
    const top = peringkat[0];
    const kunciLabel = top.label.toLowerCase().trim();
    const kategori = PEMETAAN_LABEL_IMAGENET[kunciLabel] ?? null;
    const confidence = top.score;
    // Label unmapped diperlakukan sebagai confidence rendah (rule eksplisit:
    // "label tidak ada di tabel → treat sebagai confidence rendah").
    const perlu_koreksi_manual = kategori === null || confidence < CONFIDENCE_THRESHOLD;

    return {
      kategori,
      confidence,
      perlu_koreksi_manual,
      peringkat, // menyimpan label ImageNet mentah untuk debugging
      gagal: false,
    };
  }

  // HF kadang membalas objek error (mis. model masih loading / out-of-memory).
  return bentukFallback("bentuk respons model tidak dikenali");
}