// app/api/listings/[id]/klaim/route.js
//
// POST /api/listings/[id]/klaim — butuh login
// Klaim listing tersedia milik orang lain. Memanggil RPC `claim_listing`
// (migration 05) — TIDAK PERNAH UPDATE `listings` secara langsung.
//
// Sukses  → 200 { success: true }
// Gagal   → 400 { error: "<pesan Indonesia dari RPC>" }
//           (mis. "Listing tidak tersedia untuk diklaim atau ini listing milik sendiri")

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

  const { error } = await supabase.rpc("claim_listing", { p_listing_id: id });

  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  return Response.json({ success: true });
}