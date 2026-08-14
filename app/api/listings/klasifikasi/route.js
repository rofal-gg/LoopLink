// app/api/listings/klasifikasi/route.js
//
// POST /api/listings/klasifikasi — butuh login
// Klasifikasi citra limbah jadi salah satu dari 12 kelas model
// (watersplash/waste-classification via HuggingFace).
//
// Menerima foto dalam 2 format (dukung keduanya agar mudah di-curl):
//   1) Raw binary : Content-Type: application/octet-stream → request.arrayBuffer()
//   2) JSON       : { "gambar_base64": "<base64>" }        → decode jadi Buffer
//
// Kontrak respons: diteruskan apa adanya dari `klasifikasiCitra` di
// `lib/ai/klasifikasi.js` (Fase 2). Fungsi itu TIDAK pernah melempar dan
// punya timeout 10 dtk sendiri. Kalau AI gagal (`gagal: true`), endpoint
// TETAP mengembalikan 200 dengan bentuk fallback — UI butuh state
// "AI gagal mengenali, pilih kategori manual" (state #27), bukan error 500.

import { klasifikasiCitra } from "@/lib/ai/klasifikasi";
import { createClient } from "@/lib/supabase/server";

export async function POST(request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Belum login" }, { status: 401 });
  }

  // --- Baca gambar dari body (2 format) -----------------------------------
  let imageBuffer;
  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await request.json();
      if (!body || typeof body.gambar_base64 !== "string" || body.gambar_base64.trim() === "") {
        return Response.json(
          { error: "Body JSON wajib berisi gambar_base64 (string base64)" },
          { status: 400 }
        );
      }
      // Tolak data-URL prefix kalau user kirim base64 hasil file input.
      const base64 = body.gambar_base64.replace(/^data:[^;]+;base64,/, "").trim();
      imageBuffer = Buffer.from(base64, "base64");
      if (imageBuffer.length === 0) {
        return Response.json(
          { error: "gambar_base64 tidak valid (hasil decode kosong)" },
          { status: 400 }
        );
      }
    } else {
      // Raw binary (octet-stream / image/*) — diteruskan sebagai ArrayBuffer,
      // tetap sah sebagai input `klasifikasiCitra`.
      imageBuffer = await request.arrayBuffer();
      if (!imageBuffer || imageBuffer.byteLength === 0) {
        return Response.json({ error: "Body gambar kosong" }, { status: 400 });
      }
    }
  } catch {
    return Response.json({ error: "Body request tidak valid" }, { status: 400 });
  }

  // --- Panggil modul klasifikasi (Fase 2) ----------------------------------
  // Tidak perlu try/catch tambahan: modul menjamin tidak melempar.
  // Gagal/tidak gagal sama-sama dikembalikan 200 dengan shape asli modul.
  const hasil = await klasifikasiCitra(imageBuffer);
  return Response.json(hasil);
}
