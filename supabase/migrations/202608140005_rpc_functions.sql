-- ============================================================================
-- LoopLink — Migration 05: RPC Functions (Klaim / Selesai / Batal)
-- ----------------------------------------------------------------------------
-- Semua perubahan status listing WAJIB lewat fungsi ini — bukan UPDATE
-- langsung dari client (kolom status sudah di-REVOKE di migration 04).
--
-- Keamanan:
--   * SECURITY DEFINER → fungsi dijalankan sebagai pemilik fungsi (postgres)
--     sehingga bisa mengubah kolom status yang sudah di-revoke dari client,
--     sekaligus bisa menulis riwayat_klaim (tidak ada INSERT policy).
--   * set search_path = public → mencegah privilege escalation lewat
--     manipulasi search_path oleh caller. Referensi tabel ditulis tanpa
--     prefix (di-resolve ke public), sedangkan auth.uid() ditulis
--     schema-qualified (auth.uid()) supaya tetap ditemukan.
--   * Execute TIDAK untuk anon/publik: revoke dari PUBLIC, grant ke
--     authenticated.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- claim_listing(p_listing_id uuid)
-- Dipanggil oleh PENGKLAIM. Validasi: status 'tersedia' DAN bukan listing
-- milik sendiri. Set status='dipesan', diklaim_oleh, diklaim_pada, updated_at.
-- ----------------------------------------------------------------------------
create or replace function public.claim_listing(p_listing_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update listings
  set status = 'dipesan',
      diklaim_oleh = auth.uid(),
      diklaim_pada = now(),
      updated_at = now()
  where id = p_listing_id
    and status = 'tersedia'
    and user_id != auth.uid();  -- tidak boleh klaim listing sendiri

  if not found then
    raise exception 'Listing tidak tersedia untuk diklaim atau ini listing milik sendiri';
  end if;
end;
$$;

-- ----------------------------------------------------------------------------
-- complete_listing(p_listing_id uuid)
-- Dipanggil oleh PEMILIK untuk menuntaskan transaksi. Validasi: status
-- 'dipesan' DAN user_id = auth.uid(). Set status='selesai', lalu tulis
-- riwayat_klaim dengan status_akhir='selesai' dan diklaim_pada dari listing.
-- ----------------------------------------------------------------------------
create or replace function public.complete_listing(p_listing_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pemilik_id uuid;
  v_pengklaim_id uuid;
  v_diklaim_pada timestamptz;
begin
  update listings
  set status = 'selesai',
      updated_at = now()
  where id = p_listing_id
    and status = 'dipesan'
    and user_id = auth.uid()  -- hanya pemilik listing yang boleh trigger
  returning user_id, diklaim_oleh, diklaim_pada
  into v_pemilik_id, v_pengklaim_id, v_diklaim_pada;

  if not found then
    raise exception 'Tidak berhak menyelesaikan listing ini atau statusnya bukan dipesan';
  end if;

  insert into riwayat_klaim
    (listing_id, pemilik_id, pengklaim_id, status_akhir, diklaim_pada, diselesaikan_pada)
  values
    (p_listing_id, v_pemilik_id, v_pengklaim_id, 'selesai', v_diklaim_pada, now());
end;
$$;

-- ----------------------------------------------------------------------------
-- cancel_claim(p_listing_id uuid)
-- Dipanggil oleh PEMILIK ATAU PENGKLAIM. Validasi: status 'dipesan' dan
-- caller adalah salah satu pihak. Set status='tersedia', reset diklaim_oleh
-- & diklaim_pada, catat dibatalkan_oleh. Lalu tulis riwayat_klaim dengan
-- status_akhir='dibatalkan'.
--
-- diklaim_pada dibaca & dikunci (FOR UPDATE) SEBELUM di-reset supaya nilai
-- yang benar tetap tersimpan di riwayat_klaim.
-- ----------------------------------------------------------------------------
create or replace function public.cancel_claim(p_listing_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pemilik_id uuid;
  v_pengklaim_id uuid;
  v_diklaim_pada timestamptz;
begin
  -- Baca & kunci baris dulu supaya diklaim_pada tertangkap sebelum di-reset.
  select user_id, diklaim_oleh, diklaim_pada
  into v_pemilik_id, v_pengklaim_id, v_diklaim_pada
  from listings
  where id = p_listing_id
    and status = 'dipesan'
    and (user_id = auth.uid() or diklaim_oleh = auth.uid())
  for update;

  if not found then
    raise exception 'Tidak berhak membatalkan klaim ini atau statusnya bukan dipesan';
  end if;

  update listings
  set status = 'tersedia',
      diklaim_oleh = null,
      diklaim_pada = null,
      dibatalkan_oleh = auth.uid(),
      updated_at = now()
  where id = p_listing_id;

  insert into riwayat_klaim
    (listing_id, pemilik_id, pengklaim_id, status_akhir, diklaim_pada, diselesaikan_pada)
  values
    (p_listing_id, v_pemilik_id, v_pengklaim_id, 'dibatalkan', v_diklaim_pada, now());
end;
$$;

-- ----------------------------------------------------------------------------
-- Grant execute: hanya untuk role authenticated (user login).
-- anon / publik TIDAK perlu mengakses fungsi-fungsi ini.
-- ----------------------------------------------------------------------------
revoke execute on function public.claim_listing(uuid) from public;
revoke execute on function public.complete_listing(uuid) from public;
revoke execute on function public.cancel_claim(uuid) from public;

grant execute on function public.claim_listing(uuid) to authenticated;
grant execute on function public.complete_listing(uuid) to authenticated;
grant execute on function public.cancel_claim(uuid) to authenticated;

-- Panggilan dari client:
--   supabase.rpc('claim_listing', { p_listing_id: id })
--   supabase.rpc('complete_listing', { p_listing_id: id })
--   supabase.rpc('cancel_claim', { p_listing_id: id })
-- JANGAN pernah supabase.from('listings').update(...) untuk perubahan status.
