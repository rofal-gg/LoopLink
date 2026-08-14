-- ============================================================================
-- LoopLink — Migration 11: Storage Bucket & Policy untuk Foto Listing
-- ----------------------------------------------------------------------------
-- Prasyarat Fase 4.3 (flow upload foto limbah).
-- Frontend memakai pattern:
--   supabase.storage.from('listings').upload('{userId}/{uuid}.jpg', blob)
--   lalu getPublicUrl() dan mengirim URL-nya ke POST /api/listings
--   (kolom listing_photos.foto_url adalah string URL).
--
-- Keputusan penting:
--   * Bucket `listings` dibuat PUBLIC (true) — foto perlu terlihat di landing
--     / detail listing TANPA login (role anon cukup BISA SELECT/read).
--   * file_size_limit 5 MB (5242880) dan allowed_mime_types dibatasi gambar.
--   * Policy INSERT/UPDATE/DELETE HANYA untuk role authenticated, dan path
--     WAJIB dimulai folder `{auth.uid()}` supaya user tidak bisa menimpa /
--     menghapus file milik user lain.
--   * Role anon TIDAK diberi akses INSERT/UPDATE/DELETE — hanya SELECT.
--
-- Idempotent-safe:
--   * Bucket dibuat via DO block yang mengecek storage.buckets; kalau bucket
--     sudah ada, hanya atribut (public/file_size_limit/allowed_mime_types)
--     yang di-update.
--   * Setiap policy didahului `drop policy if exists` (pola standar Supabase).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Bucket storage `listings`
-- storage.objects.bucket_id mereferensikan storage.buckets.id, jadi id dibuat
-- sama dengan name ('listings').
-- ----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from storage.buckets where name = 'listings') then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values (
      'listings',
      'listings',
      true,
      5242880,
      array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
    );
  else
    update storage.buckets
    set public             = true,
        file_size_limit    = 5242880,
        allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
    where name = 'listings';
  end if;
end;
$$;

-- ----------------------------------------------------------------------------
-- 2. RLS pada storage.objects
-- RLS sudah AKTIF secara default di tabel storage.objects (Supabase), dan
-- tabel ini dimiliki oleh role supabase_storage_admin — bukan role postgres
-- yang menjalankan migration. Karena itu TIDAK memakai `alter table
-- storage.objects enable row level security` (akan error "must be owner").
-- Cukup drop/create policy langsung.
-- ----------------------------------------------------------------------------

-- ----------------------------------------------------------------------------
-- INSERT (upload): hanya authenticated, path wajib diawali folder {auth.uid()}
-- `(storage.foldername(name))[1]` = folder depth-0 dari object path.
-- Karena policy dibatasi `to authenticated`, role anon otomatis tidak bisa
-- upload / menimpa file milik user lain.
-- ----------------------------------------------------------------------------
drop policy if exists "storage_listings_insert_own_folder" on storage.objects;
create policy "storage_listings_insert_own_folder"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'listings'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

-- ----------------------------------------------------------------------------
-- SELECT (baca): PUBLIK (anon + authenticated) — foto listing harus terlihat
-- di landing/detail tanpa login.
-- ----------------------------------------------------------------------------
drop policy if exists "storage_listings_select_public" on storage.objects;
create policy "storage_listings_select_public"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'listings');

-- ----------------------------------------------------------------------------
-- UPDATE: hanya authenticated, folder sendiri — untuk update metadata /
-- overwrite file sendiri. `with check` sama dengan `using` supaya object
-- tidak bisa dipindahkan ke folder user lain.
-- ----------------------------------------------------------------------------
drop policy if exists "storage_listings_update_own_folder" on storage.objects;
create policy "storage_listings_update_own_folder"
on storage.objects for update
to authenticated
using (
  bucket_id = 'listings'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
)
with check (
  bucket_id = 'listings'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

-- ----------------------------------------------------------------------------
-- DELETE: hanya authenticated, folder sendiri — user hanya bisa menghapus
-- file miliknya sendiri.
-- ----------------------------------------------------------------------------
drop policy if exists "storage_listings_delete_own_folder" on storage.objects;
create policy "storage_listings_delete_own_folder"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'listings'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);