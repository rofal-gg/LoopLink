-- ============================================================================
-- LoopLink — Migration 02: Tabel Pendukung (GTM)
-- ----------------------------------------------------------------------------
-- Tabel: riwayat_klaim, laporan, riwayat_pencarian, riwayat_pencarian_hasil.
-- Tabel ini dibangun untuk kesiapan GTM (post-lomba), tapi migration-nya
-- dibuat sekarang supaya RPC (migration 05) bisa langsung menulis riwayat_klaim.
--
-- Idempotent-safe: create table if not exists.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- riwayat_klaim
-- Log transaksi klaim — immutable, baris hanya dibuat lewat RPC
-- (complete_listing / cancel_claim, migration 05).
-- diklaim_pada diambil dari listings.diklaim_pada agar akurat.
-- ----------------------------------------------------------------------------
create table if not exists public.riwayat_klaim (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id),
  pemilik_id uuid not null references public.profiles(id),
  pengklaim_id uuid not null references public.profiles(id),
  status_akhir text not null
    constraint riwayat_klaim_status_akhir_check check (status_akhir in ('selesai','dibatalkan')),
  diklaim_pada timestamptz not null,
  diselesaikan_pada timestamptz
);

-- ----------------------------------------------------------------------------
-- laporan
-- Pelaporan listing bermasalah; status ditinjau oleh admin (is_admin).
-- ----------------------------------------------------------------------------
create table if not exists public.laporan (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id),
  pelapor_id uuid not null references public.profiles(id),
  alasan text not null,
  status text not null default 'menunggu'
    constraint laporan_status_check check (status in ('menunggu','ditinjau','selesai')),
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- riwayat_pencarian
-- Mencatat setiap pencarian (kebutuhan + radius + lokasi pencari).
-- ----------------------------------------------------------------------------
create table if not exists public.riwayat_pencarian (
  id uuid primary key default gen_random_uuid(),
  pencari_id uuid not null references public.profiles(id),
  kategori_dicari text,
  radius_km double precision not null,
  lokasi_lat double precision,
  lokasi_lng double precision,
  dibuat_pada timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- riwayat_pencarian_hasil
-- Listing yang muncul di hasil pencarian beserta skor akhir dan urutannya.
-- ----------------------------------------------------------------------------
create table if not exists public.riwayat_pencarian_hasil (
  id uuid primary key default gen_random_uuid(),
  riwayat_pencarian_id uuid not null references public.riwayat_pencarian(id) on delete cascade,
  listing_id uuid not null references public.listings(id),
  skor_akhir double precision not null,
  posisi_urutan int not null
);
