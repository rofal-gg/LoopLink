-- ============================================================================
-- LoopLink — Migration 04: Revoke UPDATE Kolom Status Listing
-- ----------------------------------------------------------------------------
-- Client (role authenticated / anon) TIDAK boleh mengubah kolom status,
-- diklaim_oleh, diklaim_pada, dan dibatalkan_oleh secara langsung.
--
-- Perubahan status listing WAJIB lewat RPC security definer (migration 05):
--   claim_listing    → 'tersedia' → 'dipesan'
--   complete_listing → 'dipesan'  → 'selesai'
--   cancel_claim     → 'dipesan'  → 'tersedia'
--
-- Migration ini sengaja terpisah dan HARUS berjalan SETELAH migration 03
-- (RLS policies) supaya urutan keamanan jelas: RLS aktif dulu, baru cabut
-- privilege kolom. Function SECURITY DEFINER (dijalankan sebagai pemilik
-- fungsi / postgres) tetap bisa mengubah kolom-kolom ini meski privilege
-- client dicabut — itulah mekanisme yang dipakai RPC.
-- ============================================================================

revoke update (status, diklaim_oleh, dibatalkan_oleh, diklaim_pada)
on public.listings from authenticated, anon;
