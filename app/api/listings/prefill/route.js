// app/api/listings/prefill/route.js
//
// POST /api/listings/prefill — butuh login
// Isi otomatis (prefill) form listing dari FOTO + kategori citra yang sudah
// dikenali, lewat `susunDraftListing` di lib/ai/prefill-draft.js.
// Modul AI itu TIDAK pernah melempar (selalu return objek, termasuk jalur
// gagal) — endpoint cukup meneruskan hasilnya apa adanya.
//
// Body JSON: { fotoB64: string, kategoriCitra: string, catatan?: string }
//   - fotoB64      : base64 foto JPEG. Boleh data URL (`data:image/jpeg;base64,...`)
//                    atau base64 polos. Wajib ada; ukuran decoded max ~4.5 MB.
//   - kategoriCitra: string non-empty (hasil endpoint klasifikasi citra).
//   - catatan      : opsional string (detail/keinginan tambahan dari user).
//
// Prefill itu OPSIONAL dan TIDAK boleh memblokir alur upload: hasil dari
// `susunDraftListing` selalu dikembalikan 200, termasuk saat `gagal: true`
// — UI tetap bisa lanjut ke form kosong / kategori manual.

import { susunDraftListing } from "@/lib/ai/prefill-draft";
import { createClient } from "@/lib/supabase/server";

// Batas aman ukuran foto decoded (4.5 MB). Base64 ~ +33% dari ukuran biner,
// jadi body request-nya sudah mendekati batas aman platform.
const BATAS_UKURAN_FOTO_BYTES = 4.5 * 1024 * 1024;

/**
 * Normalisasi base64: kalau input adalah data URL (`data:image/...;base64,`),
 * buang semua sebelum koma pertama; kalau sudah base64 polos, pakai apa adanya.
 * Modul AI menerima base64 polos TANPA prefix `data:`.
 */
function normalisasiBase64(fotoB64) {
  const teks = fotoB64.trim();
  if (/^data:/i.test(teks)) {
    const koma = teks.indexOf(",");
    return koma === -1 ? teks : teks.slice(koma + 1).trim();
  }
  return teks;
}

export async function POST(request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Belum login" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Body request tidak valid" }, { status: 400 });
  }

  // --- Validasi fotoB64 ------------------------------------------------------
  const fotoB64 = typeof body?.fotoB64 === "string" ? body.fotoB64 : "";
  if (fotoB64.trim() === "") {
    return Response.json(
      { error: "fotoB64 wajib diisi (base64 foto)" },
      { status: 400 }
    );
  }

  const normalizedBase64 = normalisasiBase64(fotoB64);

  let imageBuffer;
  try {
    imageBuffer = Buffer.from(normalizedBase64, "base64");
  } catch {
    return Response.json(
      { error: "fotoB64 tidak valid (tidak bisa didecode sebagai base64)" },
      { status: 400 }
    );
  }

  if (imageBuffer.length === 0) {
    return Response.json(
      { error: "fotoB64 tidak valid (hasil decode kosong)" },
      { status: 400 }
    );
  }

  if (imageBuffer.length > BATAS_UKURAN_FOTO_BYTES) {
    return Response.json(
      {
        error: `Ukuran foto melebihi batas maksimal ${
          BATAS_UKURAN_FOTO_BYTES / (1024 * 1024)
        } MB, silakan kompres foto dulu sebelum upload`,
      },
      { status: 400 }
    );
  }

  // --- Validasi kategoriCitra ------------------------------------------------
  const kategoriCitra =
    typeof body?.kategoriCitra === "string" ? body.kategoriCitra.trim() : "";
  if (kategoriCitra === "") {
    return Response.json(
      { error: "kategoriCitra wajib diisi (hasil klasifikasi foto)" },
      { status: 400 }
    );
  }

  // catatan opsional — nilai non-string diabaikan (tidak memblokir prefill).
  const catatanUser =
    typeof body?.catatan === "string" && body.catatan.trim() !== ""
      ? body.catatan.trim()
      : undefined;

  // Modul menjamin tidak melempar → hasil apa adanya (sukses / gagal) 200.
  // Prefill opsional: UI tetap lanjut walau draft gagal dihasilkan.
  const hasil = await susunDraftListing({
    fotoB64: normalizedBase64,
    kategoriCitra,
    catatanUser,
  });
  return Response.json(hasil);
}