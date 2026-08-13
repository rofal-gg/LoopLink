-- ============================================================================
-- LoopLink — Migration 06: Index untuk Pencarian Lokasi & Status
-- ----------------------------------------------------------------------------
-- Prototype: index biasa di (lokasi_lat, lokasi_lng) sudah cukup karena jarak
-- dihitung manual dengan formula Haversine di backend.
--
-- Peningkatan skalabilitas (DI LUAR scope prototype lomba, hanya catatan
-- roadmap): migrasi ke PostGIS — create extension postgis, tambah kolom
-- geografi, lalu query pakai ST_DWithin + GiST index.
-- ============================================================================

create index if not exists idx_listings_lokasi on public.listings (lokasi_lat, lokasi_lng);
create index if not exists idx_listings_status on public.listings (status);
