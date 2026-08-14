-- ============================================================================
-- LoopLink — Migration 08: Perbaikan Login Akun Demo (seed)
-- ----------------------------------------------------------------------------
-- Masalah: akun demo `%@looplink.demo` yang dibuat BAGIAN B.1 seed.sql
-- (insert langsung ke auth.users) tidak bisa login lewat signInWithPassword.
-- GoTrue mengembalikan "Invalid login credentials" / 500 scan error.
-- Dua penyebab (sudah diverifikasi lewat log Auth + uji login):
--   1. auth.users.instance_id = NULL  → GoTrue memfilter user berdasarkan
--      instance_id; user dari admin API selalu punya
--      '00000000-0000-0000-0000-000000000000'.
--   2. Kolom token text = NULL  → GoTrue meng-scan kolom berikut sebagai
--      string; NULL membuat query gagal:
--      confirmation_token, recovery_token, email_change_token_new,
--      email_change_token_current, phone_change_token, reauthentication_token,
--      email_change, phone_change.
--
-- Scope: HANYA akun demo `%@looplink.demo`. User lain TIDAK disentuh.
-- Idempotent: aman dijalankan ulang (guard `is null` / `coalesce`).
-- Note keamanan: menyentuh kolom auth.users seminimal mungkin — tidak ada
-- penonaktifan/penguncian akun, tidak ada perubahan password/hash.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Backfill instance_id untuk akun demo yang NULL
-- ----------------------------------------------------------------------------
update auth.users
set instance_id = '00000000-0000-0000-0000-000000000000'
where email like '%@looplink.demo'
  and instance_id is null;

-- ----------------------------------------------------------------------------
-- 2. Backfill kolom token text NULL → '' (string kosong)
-- ----------------------------------------------------------------------------
update auth.users
set confirmation_token = coalesce(confirmation_token, ''),
    recovery_token = coalesce(recovery_token, ''),
    email_change_token_new = coalesce(email_change_token_new, ''),
    email_change_token_current = coalesce(email_change_token_current, ''),
    phone_change_token = coalesce(phone_change_token, ''),
    reauthentication_token = coalesce(reauthentication_token, ''),
    email_change = coalesce(email_change, ''),
    phone_change = coalesce(phone_change, '')
where email like '%@looplink.demo';

-- ----------------------------------------------------------------------------
-- Verifikasi cepat (boleh dihapus) — pastikan tidak ada NULL tersisa & zero-UUID.
-- select
--   email,
--   instance_id,
--   confirmation_token is null as confirm_null,
--   recovery_token is null as recovery_null,
--   email_change_token_new is null as ec_new_null,
--   email_change_token_current is null as ec_cur_null,
--   phone_change_token is null as phone_tok_null,
--   reauthentication_token is null as reauth_null,
--   email_change is null as email_change_null,
--   phone_change is null as phone_change_null
-- from auth.users
-- where email like '%@looplink.demo'
-- order by email;
-- ============================================================================