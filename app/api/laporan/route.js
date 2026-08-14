// app/api/laporan/route.js
//
// POST /api/laporan — butuh login
// Buat laporan terhadap listing bermasalah (status default 'menunggu').
//
// Body JSON: { listingId: uuid, alasan: string (non-empty) }
//
// `pelapor_id` DIAMBIL DARI SESSION (`user.id`), bukan dari body — policy
// INSERT `laporan_insert_self` memaksa pelapor_id = auth.uid().
//
// Response 201: { success: true, laporan_id }

import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/api/validasi-listing";

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

  const listingId = typeof body.listingId === "string" ? body.listingId.trim() : "";
  const alasan = typeof body.alasan === "string" ? body.alasan.trim() : "";

  if (!isUuid(listingId)) {
    return Response.json({ error: "listingId bukan UUID yang valid" }, { status: 400 });
  }
  if (!alasan) {
    return Response.json({ error: "alasan wajib diisi" }, { status: 400 });
  }

  // pelapor_id dari SESSION, bukan body (tidak pernah percaya input client).
  const { data: laporan, error: errLaporan } = await supabase
    .from("laporan")
    .insert({ listing_id: listingId, pelapor_id: user.id, alasan })
    .select("id")
    .single();

  if (errLaporan || !laporan) {
    return Response.json(
      { error: errLaporan ? `Gagal membuat laporan: ${errLaporan.message}` : "Gagal membuat laporan" },
      { status: 400 }
    );
  }

  return Response.json({ success: true, laporan_id: laporan.id }, { status: 201 });
}