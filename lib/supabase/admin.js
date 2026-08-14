// lib/supabase/admin.js
//
// ⚠️ PENTING — SERVER-ONLY. JANGAN IMPORT DARI CLIENT COMPONENT / BROWSER ⚠️
//
// Client ini memakai SUPABASE_SERVICE_ROLE_KEY yang BISA MELEWATI RLS
// (row level security). Kalau key ini bocor ke browser, siapa pun bisa
// membaca/mengubah seluruh data tanpa izin. Oleh karena itu:
//   * HANYA di-import dari server (API route / server action / script server).
//   * JANGAN PERNAH di-import dari file yang ikut ter-bundle ke client
//     (file dengan "use client", komponen React, atau modul yang di-refer
//     dari keduanya).
//
// Satu-satunya pemakaian saat ini: menulis `riwayat_pencarian` dan
// `riwayat_pencarian_hasil` di endpoint POST /api/listings/cari — karena
// tabel tersebut TIDAK punya policy INSERT untuk role authenticated
// (lihat migration 202608140003_rls_policies.sql).
//
// Semua query lain di project memakai session user biasa dari
// `lib/supabase/server.js` supaya RLS tetap aktif.
import { createClient } from "@supabase/supabase-js";

/**
 * Buat Supabase client dengan service role key.
 * Harus dipanggil ulang per request — jangan pernah di-cache antar request.
 *
 * @returns {import("@supabase/supabase-js").SupabaseClient}
 */
export function createAdminClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY belum terisi di .env.local"
    );
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}
