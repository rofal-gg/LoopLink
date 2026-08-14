// app/api/listings/ekstraksi-teks/route.js
//
// POST /api/listings/ekstraksi-teks — butuh login
// Ekstrak detail tambahan (kondisi + catatan) dari deskripsi bebas user
// lewat Gemini (`ekstraksiDeskripsi` di lib/ai/ekstraksi.js).
//
// Body JSON: { deskripsiUser: string, kategoriCitra: string, usiaBulan?: number }
//
// Hasil diteruskan apa adanya dari modul Fase 2, termasuk fallback
// `gagal: true` yang TETAP dikembalikan 200 — deskripsi teks itu opsional
// dan tidak boleh memblokir alur upload listing.

import { ekstraksiDeskripsi } from "@/lib/ai/ekstraksi";
import { createClient } from "@/lib/supabase/server";

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

  const deskripsiUser = typeof body.deskripsiUser === "string" ? body.deskripsiUser : "";
  const kategoriCitra = typeof body.kategoriCitra === "string" ? body.kategoriCitra : "";

  let usiaBulan;
  if (typeof body.usiaBulan === "number" && Number.isFinite(body.usiaBulan)) {
    usiaBulan = body.usiaBulan;
  } else if (typeof body.usiaBulan === "string" && body.usiaBulan.trim() !== "") {
    const n = Number(body.usiaBulan);
    if (Number.isFinite(n)) usiaBulan = n;
  }

  // Modul menjamin tidak melempar → hasil apa adanya (sukses / gagal) 200.
  const hasil = await ekstraksiDeskripsi({ deskripsiUser, kategoriCitra, usiaBulan });
  return Response.json(hasil);
}
