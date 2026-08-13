-- ============================================================================
-- LoopLink — Migration 03: RLS Policies
-- ----------------------------------------------------------------------------
-- Semua tabel di-enable Row Level Security, lalu policy dibuat per tabel
-- sesuai LoopLink Tahap 3 Section E (dan agent looplink-database-supabase
-- Section 2).
--
-- Konvensi:
--   * Pakai `TO anon` / `TO authenticated` eksplisit — TIDAK pakai auth.role()
--     (deprecated).
--   * Pengecekan admin memakai subquery ke profiles.is_admin.
--   * Perubahan status listing TIDAK lewat policy ini — lihat migration 04
--     (revoke kolom) dan migration 05 (RPC security definer).
--   * Idempotent-safe: Postgres tidak punya `create policy if not exists`,
--     jadi tiap policy didahului `drop policy if exists` (pola standar
--     Supabase).
-- ============================================================================

-- ============================================================================
-- profiles
-- SELECT: semua authenticated (untuk lihat kontak antar user)
-- INSERT: user membuat baris sendiri saat daftar (auth.uid() = id)
-- UPDATE: hanya diri sendiri
-- DELETE: TIDAK ADA policy — penghapusan akun = soft delete via status_akun.
-- ============================================================================
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated"
on public.profiles for select
to authenticated
using (true);

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- ============================================================================
-- listings
-- SELECT: publik hanya status 'tersedia'; pemilik melihat semua miliknya
-- INSERT: authenticated, hanya untuk listing milik sendiri
-- UPDATE: hanya pemilik (kolom status/klaim di-revoke di migration 04)
-- DELETE: hanya pemilik, hanya jika status masih 'tersedia'
-- ============================================================================
alter table public.listings enable row level security;

drop policy if exists "listing_select_public_or_owner" on public.listings;
create policy "listing_select_public_or_owner"
on public.listings for select
to anon, authenticated
using (status = 'tersedia' or user_id = auth.uid());

drop policy if exists "listing_insert_owner" on public.listings;
create policy "listing_insert_owner"
on public.listings for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "listing_update_owner_nonstatus" on public.listings;
create policy "listing_update_owner_nonstatus"
on public.listings for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
-- Catatan: kolom status, diklaim_oleh, diklaim_pada, dibatalkan_oleh TIDAK
-- bisa di-update langsung oleh client karena sudah di-REVOKE (migration 04).
-- Perubahan status hanya lewat RPC security definer (migration 05).

drop policy if exists "listing_delete_owner_if_available" on public.listings;
create policy "listing_delete_owner_if_available"
on public.listings for delete
to authenticated
using (user_id = auth.uid() and status = 'tersedia');

-- ============================================================================
-- listing_photos
-- SELECT: mengikuti visibilitas listing induk (tersedia ATAU pemilik listing)
-- INSERT/UPDATE/DELETE: hanya pemilik listing induk
-- ============================================================================
alter table public.listing_photos enable row level security;

drop policy if exists "listing_photos_select_follows_parent" on public.listing_photos;
create policy "listing_photos_select_follows_parent"
on public.listing_photos for select
to anon, authenticated
using (
  exists (
    select 1 from public.listings l
    where l.id = public.listing_photos.listing_id
      and (l.status = 'tersedia' or l.user_id = auth.uid())
  )
);

drop policy if exists "listing_photos_insert_owner" on public.listing_photos;
create policy "listing_photos_insert_owner"
on public.listing_photos for insert
to authenticated
with check (
  exists (
    select 1 from public.listings l
    where l.id = public.listing_photos.listing_id
      and l.user_id = auth.uid()
  )
);

drop policy if exists "listing_photos_update_owner" on public.listing_photos;
create policy "listing_photos_update_owner"
on public.listing_photos for update
to authenticated
using (
  exists (
    select 1 from public.listings l
    where l.id = public.listing_photos.listing_id
      and l.user_id = auth.uid()
  )
);

drop policy if exists "listing_photos_delete_owner" on public.listing_photos;
create policy "listing_photos_delete_owner"
on public.listing_photos for delete
to authenticated
using (
  exists (
    select 1 from public.listings l
    where l.id = public.listing_photos.listing_id
      and l.user_id = auth.uid()
  )
);

-- ============================================================================
-- riwayat_klaim
-- SELECT: hanya pemilik atau pengklaim terkait.
-- INSERT/UPDATE/DELETE: TIDAK ADA policy — baris hanya dibuat lewat RPC
-- security definer (complete_listing / cancel_claim). Log bersifat immutable.
-- ============================================================================
alter table public.riwayat_klaim enable row level security;

drop policy if exists "riwayat_klaim_select_related" on public.riwayat_klaim;
create policy "riwayat_klaim_select_related"
on public.riwayat_klaim for select
to authenticated
using (pemilik_id = auth.uid() or pengklaim_id = auth.uid());

-- ============================================================================
-- laporan
-- SELECT: pelapor sendiri, atau admin (is_admin = true)
-- INSERT: authenticated, pelapor_id = auth.uid()
-- UPDATE: hanya admin (ubah status tinjauan)
-- DELETE: TIDAK ADA policy
-- ============================================================================
alter table public.laporan enable row level security;

drop policy if exists "laporan_select_self_or_admin" on public.laporan;
create policy "laporan_select_self_or_admin"
on public.laporan for select
to authenticated
using (
  pelapor_id = auth.uid()
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
);

drop policy if exists "laporan_insert_self" on public.laporan;
create policy "laporan_insert_self"
on public.laporan for insert
to authenticated
with check (pelapor_id = auth.uid());

drop policy if exists "laporan_update_admin" on public.laporan;
create policy "laporan_update_admin"
on public.laporan for update
to authenticated
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
)
with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
);

-- ============================================================================
-- kategori_kecocokan
-- SELECT: PUBLIK (anon + authenticated) — tabel referensi read-only.
-- INSERT/UPDATE/DELETE: hanya admin (is_admin = true).
-- ============================================================================
alter table public.kategori_kecocokan enable row level security;

drop policy if exists "kategori_kecocokan_select_public" on public.kategori_kecocokan;
create policy "kategori_kecocokan_select_public"
on public.kategori_kecocokan for select
to anon, authenticated
using (true);

drop policy if exists "kategori_kecocokan_insert_admin" on public.kategori_kecocokan;
create policy "kategori_kecocokan_insert_admin"
on public.kategori_kecocokan for insert
to authenticated
with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
);

drop policy if exists "kategori_kecocokan_update_admin" on public.kategori_kecocokan;
create policy "kategori_kecocokan_update_admin"
on public.kategori_kecocokan for update
to authenticated
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
);

drop policy if exists "kategori_kecocokan_delete_admin" on public.kategori_kecocokan;
create policy "kategori_kecocokan_delete_admin"
on public.kategori_kecocokan for delete
to authenticated
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
);

-- ============================================================================
-- riwayat_pencarian & riwayat_pencarian_hasil
-- SELECT: hanya pencari terkait (hasil dihubungkan via riwayat_pencarian_id).
-- INSERT/UPDATE/DELETE: TIDAK ADA policy — baris ditulis oleh service role /
-- RPC saat pencarian dijalankan, bukan dari client biasa.
-- ============================================================================
alter table public.riwayat_pencarian enable row level security;

drop policy if exists "riwayat_pencarian_select_self" on public.riwayat_pencarian;
create policy "riwayat_pencarian_select_self"
on public.riwayat_pencarian for select
to authenticated
using (pencari_id = auth.uid());

alter table public.riwayat_pencarian_hasil enable row level security;

drop policy if exists "riwayat_pencarian_hasil_select_via_pencarian" on public.riwayat_pencarian_hasil;
create policy "riwayat_pencarian_hasil_select_via_pencarian"
on public.riwayat_pencarian_hasil for select
to authenticated
using (
  exists (
    select 1 from public.riwayat_pencarian rp
    where rp.id = public.riwayat_pencarian_hasil.riwayat_pencarian_id
      and rp.pencari_id = auth.uid()
  )
);
