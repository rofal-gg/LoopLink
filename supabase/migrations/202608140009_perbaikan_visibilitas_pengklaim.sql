-- ============================================================================
-- LoopLink — Migration 09: Visibilitas Listing ke Pengklaim (Gap 1)
-- ----------------------------------------------------------------------------
-- Gap (PROGRESS.md): RLS SELECT `listings` hanya memperlihatkan status
-- 'tersedia' ATAU listing milik sendiri (policy listing_select_public_or_owner).
-- Setelah diklaim (status='dipesan'), pengklaim tidak bisa GET detail listing
-- (404) — termasuk foto di `listing_photos`, karena policy SELECT foto
-- (listing_photos_select_follows_parent) mengikuti visibilitas listing induk.
--
-- Fix dalam migration ini:
--   1. Policy SELECT baru di `listings` untuk pengklaim:
--      `diklaim_oleh = auth.uid()`  (permissive + akses publik existing
--      di-OR-kan otomatis oleh Postgres, jadi pengklaim tetap melihat
--      listing yang dia klaim meski statusnya 'dipesan').
--   2. Policy `listing_photos_select_follows_parent` diperluas agar mencakup
--      `or l.diklaim_oleh = auth.uid()` — foto listing `dipesan` ikut
--      terlihat oleh pengklaimnya.
--
-- Scope: HANYA 2 policy di atas + RLS tetap aktif. Tidak mengubah RLS lain,
-- RPC, struktur kolom, atau data.
--
-- Idempotent-safe: drop policy if exists + create policy (pola migration 03).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. listings — policy SELECT khusus pengklaim
-- ----------------------------------------------------------------------------
drop policy if exists "listing_select_claimant" on public.listings;
create policy "listing_select_claimant"
on public.listings for select
to authenticated
using (diklaim_oleh = auth.uid());

-- ----------------------------------------------------------------------------
-- 2. listing_photos — perluas policy SELECT agar mengikuti visibilitas induk
--    ('tersedia' ATAU pemilik ATAU pengklaim)
-- ----------------------------------------------------------------------------
drop policy if exists "listing_photos_select_follows_parent" on public.listing_photos;
create policy "listing_photos_select_follows_parent"
on public.listing_photos for select
to anon, authenticated
using (
  exists (
    select 1 from public.listings l
    where l.id = public.listing_photos.listing_id
      and (l.status = 'tersedia' or l.user_id = auth.uid() or l.diklaim_oleh = auth.uid())
  )
);