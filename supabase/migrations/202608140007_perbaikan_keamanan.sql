-- ============================================================================
-- LoopLink — Migration 07: Perbaikan Keamanan (hasil Supabase Advisor)
-- ----------------------------------------------------------------------------
-- 1. set_updated_at tidak punya `set search_path` → WARN
--    (function_search_path_mutable). Ditambahkan supaya fungsi trigger aman
--    dari privilege escalation via manipulasi search_path.
-- 2. RPC claim/complete/cancel masih bisa dieksekusi role `anon` → WARN
--    (anon_security_definer_function_executable). Supabase memberi grant
--    EXECUTE otomatis ke `anon` untuk fungsi baru di schema public, sehingga
--    `revoke ... from public` di migration 05 tidak cukup. Perlu revoke
--    eksplisit per-role: anon TIDAK boleh, authenticated BOLEH.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Fix search_path untuk fungsi trigger set_updated_at
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Fungsi trigger tidak perlu dieksekusi lewat REST — cabut dari PUBLIC.
revoke execute on function public.set_updated_at() from public, anon, authenticated;

-- ----------------------------------------------------------------------------
-- 2. Revoke eksplisit role anon untuk RPC SECURITY DEFINER
-- (grant ke authenticated sudah ada di migration 05 — dipertahankan)
-- ----------------------------------------------------------------------------
revoke execute on function public.claim_listing(uuid) from anon;
revoke execute on function public.complete_listing(uuid) from anon;
revoke execute on function public.cancel_claim(uuid) from anon;

-- Verifikasi cepat (boleh dihapus):
-- select
--   has_function_privilege('anon', 'public.claim_listing(uuid)', 'EXECUTE') as anon_claim,
--   has_function_privilege('authenticated', 'public.claim_listing(uuid)', 'EXECUTE') as auth_claim;
