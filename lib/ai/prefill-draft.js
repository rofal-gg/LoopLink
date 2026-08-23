// lib/ai/prefill-draft.js
//
// Prefill draf listing dari FOTO via Gemini (vision) — `susunDraftListing`.
//
// Posisi dalam alur Fase 3:
//   - Klasifikasi citra sudah dilakukan endpoint terpisah (lib/ai/klasifikasi.js);
//     fungsi ini DIPANGGIL SETELAH klasifikasi sukses, sehingga selalu tersedia
//     `kategoriCitra` (boleh kosong -> Gemini mengira dari foto).
//   - Memakai model gemini-flash-latest (SAMA dengan ekstraksi.js — lihat
//     catatan deviasi model di sana). Panggilan ini VISION: base64 foto dikirim
//     sebagai part `inline_data`, prompt teks sebagai part `text`.
//   - Hanya SATU panggilan model (tidak ada chaining ke ekstraksiDeskripsi).
//
// Kontrak (dikonsumsi oleh endpoint prefill draft):
//   Sukses  -> {
//                judul, deskripsi, jumlah, satuan, expiredAt,
//                kondisi, catatan_tambahan, gagal: false
//              }
//   Gagal   -> {
//                judul: "", deskripsi: "", jumlah: null, satuan: null,
//                expiredAt: null, kondisi: "tidak diketahui",
//                catatan_tambahan: "", gagal: true, alasan_gagal
//              }
//
// Aturan nilai (normalisasi hasil Gemini — tidak pernah memercayai output model):
//   - satuan    -> hanya salah satu dari SATUAN_VALID_PREFILL; di luar itu null.
//   - jumlah    -> number > 0 (estimasi dari foto boleh tidak presisi); selain itu null.
//   - expiredAt -> HANYA kalau relevan (mis. limbah organik/sisa makanan yang bisa
//                  basi) dan >= hari ini, format YYYY-MM-DD; selain itu null.
//                  Hari ini dihitung dinamis UTC (saat verifikasi: 2026-08-18).
//   - kondisi   -> hanya "kering" | "basah" | "campuran" | "tidak diketahui".
//   - judul     -> max 80 karakter, tanpa kutip ganda / karakter control.
//   - deskripsi & catatan_tambahan -> max 300 karakter.
//
// Teknis (mengikuti pola lib/ai/ekstraksi.js yang sudah terbukti):
//   - API key hanya dari process.env.GEMINI_API_KEY — TIDAK PERNAH dikirim ke client.
//   - Timeout eksplisit 15 detik via AbortSignal.timeout (input gambar lebih berat);
//     seluruh pemanggilan dibungkus try/catch -> TIDAK pernah melempar.
//   - JSON.parse dibungkus try/catch; fence ```json dibersihkan; kalau masih gagal,
//     cari objek `{...}` pertama yang seimbang; kalau tetap tidak ada -> fallback.
//   - Input `catatanUser` disanitasi (buang karakter control + batasi panjang).

import { MODEL_GEMINI } from "./ekstraksi.js";

const GEMINI_URL = (apiKey) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_GEMINI}:generateContent?key=${encodeURIComponent(apiKey)}`;

export const TIMEOUT_PREFILL_MS = 30000;
export const SATUAN_VALID_PREFILL = ["kg", "karung", "ton", "unit"];

const KONDISI_VALID_PREFILL = ["kering", "basah", "campuran", "tidak diketahui"];
const MAKS_JUDUL = 80;
const MAKS_DESKRIPSI = 300;
const MAKS_CATATAN = 300;
const MAKS_CATATAN_USER = 500;
// Batas inline Gemini ~20MB; base64 ~33% lebih besar dari binary. Fotos di sini
// sudah dikompres (max ~1280px, ~0.8 quality) sehingga jauh di bawah batas.
const MAKS_PANJANG_B64 = 30_000_000;

/**
 * Format tanggal hari ini (UTC, YYYY-MM-DD).
 * Dipakai untuk prompt (biar Gemini bisa menakar expiredAt masuk akal) DAN
 * untuk validasi `expiredAt >= hari ini`. UTC menghindari pergeseran zona waktu.
 */
function tanggalHariIni() {
  return new Date().toISOString().slice(0, 10);
}

function bentukFallback(alasanGagal) {
  return {
    judul: "",
    deskripsi: "",
    jumlah: null,
    satuan: null,
    expiredAt: null,
    kondisi: "tidak diketahui",
    catatan_tambahan: "",
    gagal: true,
    alasan_gagal: alasanGagal,
  };
}

// Label error kering (nama exception saja) — jangan bocorkan stack/body mentah.
function ringkasError(err) {
  const nama = err && err.name ? err.name : err instanceof Error ? err.constructor.name : "Error";
  if (nama === "TimeoutError" || nama === "AbortError") {
    return `panggilan API dibatalkan (timeout ${TIMEOUT_PREFILL_MS / 1000} detik)`;
  }
  return `gagal memanggil API eksternal (${nama})`;
}

/**
 * Normalisasi foto base64 menjadi base64 polos (tanpa prefix `data:...`) yang
 * siap dimasukkan ke `inline_data.data`. Kalau input bukan string / bukan base64
 * yang masuk akal -> null (pemanggil jadi fallback, tidak melempar).
 */
function normalisasiFotoB64(value) {
  if (typeof value !== "string") return null;
  let b64 = value.trim();
  if (b64.startsWith("data:")) {
    const koma = b64.indexOf(",");
    if (koma === -1) return null;
    b64 = b64.slice(koma + 1);
  }
  // Buang whitespace (line break umum muncul saat transport/textarea).
  b64 = b64.replace(/\s+/g, "");
  if (b64.length === 0 || b64.length > MAKS_PANJANG_B64) return null;
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(b64)) return null;
  return b64;
}

/**
 * Sanitasi catatan user supaya aman dimasukkan ke prompt — pola sama dengan
 * sanitasiDeskripsi di ekstraksi.js: buang karakter control (kecuali \n, \t),
 * normalisasi CRLF, potong ke MAKS_CATATAN_USER. Escape kutip dilakukan saat
 * interpolasi prompt via JSON.stringify.
 */
function sanitasiCatatanUser(value) {
  if (typeof value !== "string") return "";
  let teks = value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
  teks = teks.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  if (teks.length > MAKS_CATATAN_USER) {
    teks = `${teks.slice(0, MAKS_CATATAN_USER)}…`;
  }
  return teks;
}

/**
 * Ambil JSON pertama dari teks model — salin pola ekstrakJsonDariTeks yang sudah
 * terbukti di ekstraksi.js. Gemini diminta "JSON saja", tapi kadang menambahkan
 * teks pembuka/penutup atau membungkus dengan fence ```json.
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

function normalisasiJumlah(value) {
  if (typeof value !== "number" && typeof value !== "string") return null;
  if (typeof value === "string" && value.trim() === "") return null;
  const angka = Number(value);
  return Number.isFinite(angka) && angka > 0 ? angka : null;
}

function normalisasiSatuan(value) {
  if (typeof value !== "string") return null;
  const v = value.trim().toLowerCase();
  return SATUAN_VALID_PREFILL.includes(v) ? v : null;
}

function normalisasiKondisi(value) {
  if (typeof value !== "string") return "tidak diketahui";
  const v = value.trim().toLowerCase();
  return KONDISI_VALID_PREFILL.includes(v) ? v : "tidak diketahui";
}

/**
 * expiredAt hanya diterima kalau: format YYYY-MM-DD, tanggal valid, dan
 * >= hari ini (UTC). Selain itu -> null (jangan mengarang masa berlaku).
 */
function normalisasiExpiredAt(value, hariIni) {
  if (typeof value !== "string") return null;
  const v = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  const epoch = Date.parse(`${v}T00:00:00Z`);
  if (Number.isNaN(epoch)) return null;
  const batas = Date.parse(`${hariIni}T00:00:00Z`);
  if (epoch < batas) return null;
  return v;
}

function normalisasiTeks(value, maks, buangKutipGanda) {
  if (typeof value !== "string") return "";
  let teks = value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
  if (buangKutipGanda) teks = teks.replace(/"/g, "");
  teks = teks.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  return teks.slice(0, maks);
}

function bangunPrompt({ kategoriCitra, catatanUser }) {
  const kategori =
    typeof kategoriCitra === "string" && kategoriCitra.trim().length > 0
      ? kategoriCitra.trim()
      : "tidak diketahui (kirakan dari foto)";

  const catatan = sanitasiCatatanUser(catatanUser);
  // JSON.stringify menghasilkan string literal JSON yang aman (escape kutip
  // & backslash), sekaligus membungkusnya dengan tanda kutip.
  const catatanAman = JSON.stringify(catatan);

  return [
    "Kamu membantu mengisi draf listing limbah di platform LoopLink, bursa limbah daur ulang",
    "yang menghubungkan pemilik limbah (kardus, plastik, logam, dll.) dengan industri yang",
    "membutuhkannya sebagai bahan baku. Kamu melihat SATU foto limbah yang akan dijual dan",
    "mengisi draf deskripsi listing-nya—pengguna tinggal mengoreksi. Jawab dalam bahasa Indonesia.",
    "",
    `Kategori hasil klasifikasi citra: ${kategori}`,
    catatan.length > 0 ? `Catatan singkat pengguna: ${catatanAman}` : "Catatan singkat pengguna: (tidak ada)",
    `Hari ini: ${tanggalHariIni()}`,
    "",
    "Perhatikan:",
    "- Judul & deskripsi HARUS konsisten dengan kategori hasil klasifikasi di atas; jangan menyebut jenis limbah lain.",
    "- Judul: 3-8 kata, bahasa Indonesia, deskriptif, tanpa tanda kutip.",
    "- Deskripsi: 1-2 kalimat wajar untuk listing.",
    "- Jumlah: perkiraan masuk akal dari yang terlihat di foto (angka bulat, > 0). Kalau sama sekali tidak bisa diperkirakan -> null.",
    `- Satuan: hanya salah satu dari ${SATUAN_VALID_PREFILL.join(", ")}. Kalau tidak yakin -> null.`,
    "- expiredAt: format YYYY-MM-DD, HANYA kalau limbah memang punya masa berlaku (mis. sisa makanan/organik yang bisa basi) dan harus >= hari ini. Kardus, plastik, logam, kaca, pakaian, sepatu -> null.",
    "- Kondisi: hanya salah satu dari kering, basah, campuran, tidak diketahui.",
    "- catatan_tambahan: ringkasan 1 kalimat dari detail visual foto (mis. kondisi fisik, ukuran, kepadatan).",
    "",
    "Balas HANYA JSON, tanpa teks lain, persis bentuk ini:",
    '{ "judul": "...", "deskripsi": "...", "jumlah": 25, "satuan": "kg", "expiredAt": null, "kondisi": "kering", "catatan_tambahan": "..." }',
    '(catatan: "expiredAt" boleh null kalau limbah tidak punya masa berlaku.)',
  ].join("\n");
}

/**
 * Susun draf listing dari foto + kategori hasil klasifikasi citra + catatan user,
 * via SATU panggilan Gemini (vision). Hasilnya prefill form—user tinggal koreksi.
 *
 * Sukses (`gagal: false`) mengembalikan field sesuai kontrak di header file;
 * semua nilai sudah dinormalisasi (satuan/jumlah/expiredAt/kondisi divalidasi,
 * teks dipotong & dibersihkan). Gagal selalu fallback lengkap (`gagal: true`
 * dengan `alasan_gagal`) — fungsi TIDAK pernah melempar.
 *
 * Endpoint prefill draft memakai hasil ini sebagai nilai awal form listing.
 *
 * @param {Object} params
 * @param {string} params.fotoB64       base64 polos ATAU data URL foto JPEG terkompres
 * @param {string} [params.kategoriCitra] kategori hasil klasifikasi citra (boleh kosong)
 * @param {string} [params.catatanUser]  catatan singkat opsional dari user
 * @returns {Promise<Object>} lihat kontrak di header file
 */
export async function susunDraftListing({ fotoB64, kategoriCitra, catatanUser } = {}) {
  if (!process.env.GEMINI_API_KEY) {
    return bentukFallback("GEMINI_API_KEY kosong");
  }

  const b64 = normalisasiFotoB64(fotoB64);
  if (!b64) {
    return bentukFallback("fotoB64 kosong atau bukan base64 valid");
  }

  const prompt = bangunPrompt({ kategoriCitra, catatanUser });

  // Retry sekali pada 503 (Gemini vision kadang overload / thinking delay).
  const MAX_CUSA = 2;
  let response;
  for (let percobaan = 0; percobaan < MAX_CUSA; percobaan++) {
    try {
      response = await fetch(GEMINI_URL(process.env.GEMINI_API_KEY), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                // Catatan format: REST generateContent memakai `inline_data`
                // (snake_case). Google menerima `mime_type`; kontrak modul ini
                // memakai `mimeType` sesuai instruksi — keduanya dikenali parser
                // proto JSON Gemini. Base64 sudah polos (tanpa prefix `data:`).
                { inline_data: { mimeType: "image/jpeg", data: b64 } },
                { text: prompt },
              ],
            },
          ],
        }),
        signal: AbortSignal.timeout(TIMEOUT_PREFILL_MS),
      });
    } catch (err) {
      return bentukFallback(ringkasError(err));
    }

    // Retry hanya pada 503 (server overload / thinking delay).
    if (response.status === 503 && percobaan < MAX_CUSA - 1) {
      await new Promise((t) => setTimeout(t, 2000));
      continue;
    }
    break;
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

  const hariIni = tanggalHariIni();

  return {
    judul: normalisasiTeks(parsed.judul, MAKS_JUDUL, true),
    deskripsi: normalisasiTeks(parsed.deskripsi, MAKS_DESKRIPSI, false),
    jumlah: normalisasiJumlah(parsed.jumlah),
    satuan: normalisasiSatuan(parsed.satuan),
    expiredAt: normalisasiExpiredAt(parsed.expiredAt, hariIni),
    kondisi: normalisasiKondisi(parsed.kondisi),
    catatan_tambahan: normalisasiTeks(parsed.catatan_tambahan, MAKS_CATATAN, false),
    gagal: false,
  };
}