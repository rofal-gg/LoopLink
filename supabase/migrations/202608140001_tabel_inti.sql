-- ============================================================================
-- LoopLink — Migration 01: Tabel Inti
-- ----------------------------------------------------------------------------
-- Membuat tabel: profiles, listings, listing_photos, kategori_kecocokan
-- plus helper trigger `set_updated_at` untuk otomatis mengisi updated_at.
--
-- Idempotent-safe:
--   - create table if not exists
--   - create or replace function
--   - drop trigger if exists + create trigger
--   - alter table add column if not exists / add constraint if not exists
--
-- Catatan penting:
--   * profiles.id mereferensikan auth.users(id) — TIDAK ada tabel users custom.
--   * listings.kategori_citra memakai label ASLI model klasifikasi
--     (watersplash/waste-classification, 12 kelas) — jangan normalisasi.
--   * listings.status / satuan / profiles.status_akun pakai CHECK constraint
--     bernama eksplisit supaya bisa di-revoke/di-drop nanti.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Helper: set_updated_at
-- Dipakai oleh trigger di profiles dan listings.
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- profiles
-- id = auth.users(id) — pola standar Supabase (bukan tabel auth custom).
-- status_akun dipakai sebagai soft delete ('nonaktif' / 'diblokir').
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nama_lengkap text not null,
  no_telepon text,
  alamat_teks text,
  lokasi_lat double precision,
  lokasi_lng double precision,
  status_akun text not null default 'aktif'
    constraint profiles_status_akun_check check (status_akun in ('aktif','nonaktif','diblokir')),
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_profiles_set_updated_at on public.profiles;
create trigger trg_profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- listings
-- kategori_citra: 12 kelas PERSIS dari model watersplash/waste-classification
-- (Battery, Biological, Brown-glass, Cardboard, Clothes, Green-glass, Metal,
--  Paper, Plastic, Shoes, Trash, White-glass).
-- Perubahan status/klaim WAJIB lewat RPC security definer (migration 05),
-- bukan UPDATE langsung dari client.
-- diklaim_pada: dicatat supaya riwayat_klaim punya waktu klaim yang akurat.
-- ----------------------------------------------------------------------------
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  judul text,
  kategori_citra text not null
    constraint listings_kategori_citra_check check (kategori_citra in (
      'Battery','Biological','Brown-glass','Cardboard','Clothes','Green-glass',
      'Metal','Paper','Plastic','Shoes','Trash','White-glass'
    )),
  kategori_dikoreksi boolean not null default false,
  confidence_score double precision,
  deskripsi_teks text,
  jumlah double precision not null,
  satuan text not null
    constraint listings_satuan_check check (satuan in ('kg','karung','ton','unit')),
  lokasi_lat double precision not null,
  lokasi_lng double precision not null,
  status text not null default 'tersedia'
    constraint listings_status_check check (status in ('tersedia','dipesan','selesai','dibatalkan')),
  diklaim_oleh uuid references public.profiles(id),
  diklaim_pada timestamptz,
  dibatalkan_oleh uuid references public.profiles(id),
  expired_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Idempotent-safe: tambahkan kolom diklaim_pada kalau tabel sudah pernah
-- dibuat tanpa kolom ini di environment demo.
alter table public.listings add column if not exists diklaim_pada timestamptz;

drop trigger if exists trg_listings_set_updated_at on public.listings;
create trigger trg_listings_set_updated_at
  before update on public.listings
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- listing_photos
-- ----------------------------------------------------------------------------
create table if not exists public.listing_photos (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  foto_url text not null,
  urutan int not null default 0
);

-- ----------------------------------------------------------------------------
-- kategori_kecocokan
-- Tabel referensi matching rule-based (bukan hasil training AI).
-- Unique (kategori_limbah, kategori_kebutuhan) dibutuhkan seed `on conflict`.
-- ----------------------------------------------------------------------------
create table if not exists public.kategori_kecocokan (
  id uuid primary key default gen_random_uuid(),
  kategori_limbah text not null,
  kategori_kebutuhan text not null,
  skor_dasar double precision not null
    constraint kategori_kecocokan_skor_dasar_check check (skor_dasar between 0 and 1),
  constraint kategori_kecocokan_unique_pair unique (kategori_limbah, kategori_kebutuhan)
);

-- Idempotent-safe: pastikan unique constraint ada sebelum seed dijalankan.
-- (Postgres tidak mendukung `add constraint if not exists`, jadi pakai
-- DO block yang mengecek pg_constraint.)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'kategori_kecocokan_unique_pair'
      and conrelid = 'public.kategori_kecocokan'::regclass
  ) then
    alter table public.kategori_kecocokan
      add constraint kategori_kecocokan_unique_pair
      unique (kategori_limbah, kategori_kebutuhan);
  end if;
end;
$$;
