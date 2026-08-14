-- ============================================================================
-- LoopLink — Migration 10: FK Anak listings → ON DELETE CASCADE (Gap 2)
-- ----------------------------------------------------------------------------
-- Gap (PROGRESS.md): DELETE listing yang punya baris di riwayat_klaim gagal
-- (400) karena FK `riwayat_klaim_listing_id_fkey` tidak memakai ON DELETE
-- CASCADE — tidak konsisten dengan `listing_photos` yang sudah cascade.
--
-- Fix: ubah FK anak yang me-reference public.listings(id) DAN belum cascade
-- menjadi ON DELETE CASCADE, dengan mempertahankan NAMA constraint yang sama
-- (riwayat_klaim_listing_id_fkey, laporan_listing_id_fkey,
-- riwayat_pencarian_hasil_listing_id_fkey) supaya referensi lain (index,
-- dokumentasi, dsb.) tidak berubah.
--
-- Catatan:
--   * Postgres tidak bisa `add constraint ... on delete cascade` pada
--     constraint dengan nama yang sudah ada → pola drop + add.
--   * `riwayat_pencarian_hasil.riwayat_pencarian_id` (FK → riwayat_pencarian,
--     ON DELETE CASCADE) SUDAH benar dan TIDAK disentuh.
--   * Idempotent: DO block memeriksa pg_constraint —
--       - constraint ada + sudah cascade  → skip;
--       - constraint ada + belum cascade  → drop + add (dengan cascade);
--       - constraint belum ada            → add langsung (dengan cascade).
--
-- Scope: HANYA 3 FK di atas. Tidak mengubah RLS, RPC, kolom, atau data.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. riwayat_klaim.listing_id → public.listings(id) ON DELETE CASCADE
-- ----------------------------------------------------------------------------
do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'riwayat_klaim_listing_id_fkey'
      and conrelid = 'public.riwayat_klaim'::regclass
      and contype = 'f'
  ) then
    if not exists (
      select 1 from pg_constraint
      where conname = 'riwayat_klaim_listing_id_fkey'
        and conrelid = 'public.riwayat_klaim'::regclass
        and confdeltype = 'c'
    ) then
      alter table public.riwayat_klaim
        drop constraint riwayat_klaim_listing_id_fkey;
      alter table public.riwayat_klaim
        add constraint riwayat_klaim_listing_id_fkey
        foreign key (listing_id) references public.listings(id) on delete cascade;
    end if;
  else
    alter table public.riwayat_klaim
      add constraint riwayat_klaim_listing_id_fkey
      foreign key (listing_id) references public.listings(id) on delete cascade;
  end if;
end;
$$;

-- ----------------------------------------------------------------------------
-- 2. laporan.listing_id → public.listings(id) ON DELETE CASCADE
-- ----------------------------------------------------------------------------
do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'laporan_listing_id_fkey'
      and conrelid = 'public.laporan'::regclass
      and contype = 'f'
  ) then
    if not exists (
      select 1 from pg_constraint
      where conname = 'laporan_listing_id_fkey'
        and conrelid = 'public.laporan'::regclass
        and confdeltype = 'c'
    ) then
      alter table public.laporan
        drop constraint laporan_listing_id_fkey;
      alter table public.laporan
        add constraint laporan_listing_id_fkey
        foreign key (listing_id) references public.listings(id) on delete cascade;
    end if;
  else
    alter table public.laporan
      add constraint laporan_listing_id_fkey
      foreign key (listing_id) references public.listings(id) on delete cascade;
  end if;
end;
$$;

-- ----------------------------------------------------------------------------
-- 3. riwayat_pencarian_hasil.listing_id → public.listings(id) ON DELETE CASCADE
-- ----------------------------------------------------------------------------
do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'riwayat_pencarian_hasil_listing_id_fkey'
      and conrelid = 'public.riwayat_pencarian_hasil'::regclass
      and contype = 'f'
  ) then
    if not exists (
      select 1 from pg_constraint
      where conname = 'riwayat_pencarian_hasil_listing_id_fkey'
        and conrelid = 'public.riwayat_pencarian_hasil'::regclass
        and confdeltype = 'c'
    ) then
      alter table public.riwayat_pencarian_hasil
        drop constraint riwayat_pencarian_hasil_listing_id_fkey;
      alter table public.riwayat_pencarian_hasil
        add constraint riwayat_pencarian_hasil_listing_id_fkey
        foreign key (listing_id) references public.listings(id) on delete cascade;
    end if;
  else
    alter table public.riwayat_pencarian_hasil
      add constraint riwayat_pencarian_hasil_listing_id_fkey
      foreign key (listing_id) references public.listings(id) on delete cascade;
  end if;
end;
$$;