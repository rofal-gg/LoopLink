// lib/ai/ekstraksi.js
//
// Ekstraksi detail tambahan dari deskripsi bebas user via Gemini 1.5 Flash.
//
// PENTING — cakupan fungsi ini:
//   - Hasilnya disimpan ke kolom `deskripsi_teks` di tabel `listings`
//     (schema Tahap 3): objek dengan `kondisi` + `catatan_tambahan`.
//   - BUKAN untuk menentukan kategori (itu sepenuhnya tugas `klasifikasiCitra`).
//   - API key hanya dibaca dari process.env.GEMINI_API_KEY di sisi server;
//     key TIDAK PERNAH dikirim ke client / browser.
//
// Kontrak (dikonsumsi oleh endpoint Fase 3):
//   Sukses  → { kondisi, catatan_tambahan, gagal: false }
//   Gagal   → { kondisi: "tidak diketahui", catatan_tambahan: "", gagal: true, alasan_gagal }
//
// Aturan:
//   - Timeout eksplisit 10 detik via AbortSignal.timeout; seluruh pemanggilan
//     dibungkus try/catch → TIDAK pernah melempar error mentah ke pemanggil.
//   - JSON.parse dibungkus try/catch + fence ```json dibersihkan (Gemini kadang
//     menambah teks pembuka).
//   - Input user disanitasi (buang karakter control + batasi panjang + escape)
//     supaya tidak merusak format JSON output / prompt.

// Model Gemini yang dipakai.
// DEViasi terdokumentasi: baseline Tahap 3 menyebut `gemini-1.5-flash`, tapi pada
// API v1beta (terverifikasi live 14-08-2026) model tersebut sudah TIDAK ada —
// `generateContent` mengembalikan 404 "model is not found". Penggantinya dipakai
// alias resmi yang terus dipelihara Google: `gemini-flash-latest`. Ganti
// konstanta ini ke `gemini-1.5-flash` lagi kalau Google menghidupkannya kembali.
export const MODEL_GEMINI = "gemini-flash-latest";

const GEMINI_URL = (apiKey) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_GEMINI}:generateContent?key=${encodeURIComponent(apiKey)}`;

export const TIMEOUT_EKSTRAKSI_MS = 10000;
export const MAKS_PANJANG_DESKRIPSI = 500;
export const KONDISI_VALID = ["kering", "basah", "campuran", "tidak diketahui"];

function bentukFallback(alasanGagal) {
  return {
    kondisi: "tidak diketahui",
    catatan_tambahan: "",
    gagal: true,
    alasan_gagal: alasanGagal,
  };
}

function ringkasError(err) {
  const nama = err && err.name ? err.name : err instanceof Error ? err.constructor.name : "Error";
  if (nama === "TimeoutError" || nama === "AbortError") {
    return `panggilan API dibatalkan (timeout ${TIMEOUT_EKSTRAKSI_MS / 1000} detik)`;
  }
  return `gagal memanggil API eksternal (${nama})`;
}

/**
 * Ambil JSON pertama dari teks model. Gemini diminta "JSON saja", tapi kadang
 * menambahkan teks pembuka/penutup atau membungkus dengan fence ```json.
 * Strategi: (1) bersihkan fence lalu parse apa adanya; (2) kalau gagal, cari
 * objek JSON pertama yang seimbang `{...}` di dalam teks; (3) tetap gagal kalau
 * memang tidak ada JSON.
 */
function ekstrakJsonDariTeks(teks) {
  const bersih = teks.replace(/```json|```/g, "").trim();
  const cobaParse = (s) => {
    try {
      return { ok: true, nilai: JSON.parse(s) };
    } catch {
      return { ok: false };
    }
  };

  const langsung = cobaParse(bersih);
  if (langsung.ok) return langsung;

  const mulai = bersih.indexOf("{");
  const akhir = bersih.lastIndexOf("}");
  if (mulai !== -1 && akhir > mulai) {
    const potongan = bersih.slice(mulai, akhir + 1);
    const curi = cobaParse(potongan);
    if (curi.ok) return curi;
  }
  return { ok: false };
}

/**
 * Sanitasi deskripsi user supaya aman dimasukkan ke prompt:
 *  - bukan string → jadi ""
 *  - karakter control dibuang (kecuali \n, \t)
 *  - CRLF dinormalisasi
 *  - dipotong ke MAKS_PANJANG_DESKRIPSI karakter
 * Escape kutip/backslash dilakukan saat interpolasi prompt via JSON.stringify.
 */
function sanitasiDeskripsi(value) {
  if (typeof value !== "string") return "";

  // \u0000-\u0008, \u000B, \u000C, \u000E-\u001F, \u007F — kendalikan 0x7F
  let teks = value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
  teks = teks.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();

  if (teks.length > MAKS_PANJANG_DESKRIPSI) {
    teks = `${teks.slice(0, MAKS_PANJANG_DESKRIPSI)}…`;
  }
  return teks;
}

function bangunPrompt({ deskripsiUser, kategoriCitra, usiaBulan }) {
  const deskripsi = sanitasiDeskripsi(deskripsiUser);
  // JSON.stringify menghasilkan string literal JSON yang aman (escape kutip
  // & backslash), sekaligus membungkusnya dengan tanda kutip.
  const deskripsiAman = JSON.stringify(deskripsi);

  const kategori =
    typeof kategoriCitra === "string" && kategoriCitra.length > 0
      ? kategoriCitra
      : "tidak diketahui";

  const usia =
    typeof usiaBulan === "number" && Number.isFinite(usiaBulan) && usiaBulan >= 0
      ? `${usiaBulan} bulan`
      : "tidak diketahui";

  return [
    "Kamu membantu mengekstrak detail dari deskripsi limbah yang ditulis pengguna platform LoopLink.",
    `Kategori yang sudah dikenali dari foto: ${kategori}`,
    `Usia limbah (perkiraan): ${usia}`,
    `Deskripsi pengguna: ${deskripsiAman}`,
    "",
    "Ekstrak dalam format JSON saja, tanpa teks lain:",
    '{ "kondisi": "kering/basah/campuran/tidak diketahui", "catatan_tambahan": "ringkasan singkat detail relevan dari deskripsi, maksimal 1 kalimat" }',
  ].join("\n");
}

/**
 * Ekstrak kondisi + catatan tambahan dari deskripsi teks bebas user.
 *
 * Hasil sukses (`gagal: false`) berisi:
 *   - kondisi:     salah satu dari "kering" | "basah" | "campuran" | "tidak diketahui"
 *   - catatan_tambahan: ringkasan singkat maksimal 1 kalimat
 * Nilai `kondisi` di luar himpunan di atas dinormalisasi jadi "tidak diketahui"
 * (parse tetap dianggap sukses). Fallback lengkap (`gagal: true`) dikembalikan
 * saat key kosong, timeout, error jaringan, respons non-OK, atau output Gemini
 * bukan JSON — fungsi TIDAK pernah melempar.
 *
 * Endpoint Fase 3 menyimpan `{ kondisi, catatan_tambahan }` ini ke kolom
 * `deskripsi_teks` di `listings`.
 *
 * @param {Object} params
 * @param {string} params.deskripsiUser
 * @param {string} params.kategoriCitra
 * @param {number} [params.usiaBulan]
 * @returns {Promise<Object>} lihat kontrak di header file
 */
export async function ekstraksiDeskripsi({ deskripsiUser, kategoriCitra, usiaBulan } = {}) {
  if (!process.env.GEMINI_API_KEY) {
    return bentukFallback("GEMINI_API_KEY kosong");
  }

  const prompt = bangunPrompt({ deskripsiUser, kategoriCitra, usiaBulan });

  let response;
  try {
    response = await fetch(GEMINI_URL(process.env.GEMINI_API_KEY), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }], role: "user" }],
      }),
      signal: AbortSignal.timeout(TIMEOUT_EKSTRAKSI_MS),
    });
  } catch (err) {
    return bentukFallback(ringkasError(err));
  }

  if (!response.ok) {
    return bentukFallback(`respons Gemini tidak OK (status ${response.status})`);
  }

  let data;
  try {
    data = await response.json();
  } catch {
    return bentukFallback("respons Gemini tidak bisa diparse sebagai JSON");
  }

  const teks = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const hasilJson = ekstrakJsonDariTeks(teks);
  if (!hasilJson.ok) {
    return bentukFallback("output Gemini bukan JSON valid");
  }
  const parsed = hasilJson.nilai;

  const kondisi =
    typeof parsed.kondisi === "string" && KONDISI_VALID.includes(parsed.kondisi)
      ? parsed.kondisi
      : "tidak diketahui";

  const catatan =
    typeof parsed.catatan_tambahan === "string" ? parsed.catatan_tambahan.trim().slice(0, 300) : "";

  return { kondisi, catatan_tambahan: catatan, gagal: false };
}