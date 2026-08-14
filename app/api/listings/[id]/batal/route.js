// app/api/listings/[id]/batal/route.js
//
// POST /api/listings/[id]/batal — butuh login (PEMILIK atau PENGKLAIM)
// Batalkan klaim. Memanggil RPC `cancel_claim` (migration 05) — TIDAK
// PERNAH UPDATE `listings` secara langsung.
//
// Sukses  → 200 { success: true }
// Gagal   → 400 { error: "<pesan Indonesia dari RPC>" }
//           (mis. "Tidak berhak membatalkan klaim ini atau statusnya bukan dipesan")

import { createClient } from "@/lib/supabase/server";

export async function POST(request, { params }) {
  const supabase = await createClient();
  const { id } = await params;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Belum login" }, { status: 401 });
  }

  const { error } = await supabase.rpc("cancel_claim", { p_listing_id: id });

  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  return Response.json({ success: true });
}