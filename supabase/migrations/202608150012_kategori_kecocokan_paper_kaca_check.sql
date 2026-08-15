-- ============================================================================
-- LoopLink — Migration 12: kategori_kecocokan Paper & Kaca + CHECK kategori_dicari
-- ----------------------------------------------------------------------------
-- Isi:
--   1. INSERT pasangan kategori_kecocokan untuk Paper (kertas bekas):
--        ('Paper', 'Bahan baku daur ulang kertas', 1.0)
--        ('Paper', 'Bahan bakar biomassa',          0.8)
--      Meniru dua jalur yang sudah dipakai Cardboard. Kertas bekas bersih
--      masuk jalur daur ulang kertas dengan skor penuh (= Cardboard 1.0);
--      sebagai biomassa sedikit di bawah Cardboard (0.9) karena tinta dan
--      lapisan kertas menurunkan nilai pembakaran → 0.8.
--   2. INSERT pasangan untuk 3 varian kaca (cullet bersih/seragam warna):
--        ('Brown-glass',  'Bahan baku daur ulang kaca', 1.0)
--        ('Green-glass',  'Bahan baku daur ulang kaca', 1.0)
--        ('White-glass',  'Bahan baku daur ulang kaca', 1.0)
--      Nilai kebutuhan 'Bahan baku daur ulang kaca' adalah nilai BARU yang
--      sudah disetujui. TIDAK ada tabel master kategori_kebutuhan — nilai
--      kebutuhan "hidup" lewat baris-baris kategori_kecocokan ini (dan lewat
--      daftar CHECK riwayat_pencarian di bawah). Penambahan opsi dropdown
--      frontend untuk nilai kaca adalah tugas terpisah (constants.js TIDAK
--      diubah di sini).
--   3. CHECK constraint `riwayat_pencarian_kategori_dicari_check` pada
--      public.riwayat_pencarian.kategori_dicari — membatasi ke 7 nilai
--      kategori_kebutuhan VALID + marker '__lainnya__' (alur "Lainnya").
--
-- Keputusan desain untuk CHECK (ditemukan saat inspeksi data & alur frontend):
--   * Data existing: `select distinct kategori_dicari` menemukan nilai
--     'Belum pernah ada' (1 baris) yang BERASAL dari alur "Lainnya (ketik
--     manual)". Aplikasi saat ini menyimpan teks bebas apa adanya di
--     kategori_dicari, BUKAN marker '__lainnya__' (SearchForm.jsx →
--     gantiManual → onKategoriChange(value.trim()) → app/api/listings/cari/
--     route.js simpan kategori_dicari = kategoriKebutuhan). Constraint ketat
--     tanpa pembersihan akan GAGAL ditambahkan di DB yang sudah ada.
--   * Pilihan: batasi ke 7 nilai kurasi + '__lainnya__', lalu pada aplikasi
--     pertama constraint (saat constraint belum ada) baris non-konform
--     di-UPDATE ke '__lainnya__'. Konsekuensi: teks manual "Lainnya" TIDAK
--     lagi tersimpan mentah; riwayat pencarian menandainya sebagai marker.
--     route.js sudah membungkus kegagalan simpan riwayat dengan warning
--     (kegagalan TIDAK menggagalkan pencarian), jadi tidak ada error user.
--     KONTRAK untuk masa depan: bila ingin teks manual tetap tersimpan,
--     route.js harus mengubah nilai '__lainnya__' — atau opsi lain adalah
--     menghapus '__lainnya__' dari daftar dan hanya mengizinkan 7 nilai kurasi.
--
-- Idempotent-safe:
--   * INSERT kategori_kecocokan: on conflict (kategori_limbah, kategori_kebutuhan)
--     do nothing — tidak menghapus / menimpa data apa pun.
--   * CHECK constraint: DO block memeriksa pg_constraint (Postgres tidak punya
--     `add constraint if not exists`) — pola yang sama seperti migration 001 / 010.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Paper → kebutuhan (meniru jalur Cardboard yang sudah ada)
-- ----------------------------------------------------------------------------
insert into public.kategori_kecocokan (kategori_limbah, kategori_kebutuhan, skor_dasar)
values
  ('Paper', 'Bahan baku daur ulang kertas', 1.0),
  ('Paper', 'Bahan bakar biomassa', 0.8)
on conflict (kategori_limbah, kategori_kebutuhan) do nothing;

-- ----------------------------------------------------------------------------
-- 2. Kaca (3 varian) → 'Bahan baku daur ulang kaca' (nilai kebutuhan BARU)
--    Nilai kebutuhan baru ikut "terdaftar" lewat baris-baris ini; tidak ada
--    tabel master terpisah untuk kategori_kebutuhan.
-- ----------------------------------------------------------------------------
insert into public.kategori_kecocokan (kategori_limbah, kategori_kebutuhan, skor_dasar)
values
  ('Brown-glass', 'Bahan baku daur ulang kaca', 1.0),
  ('Green-glass', 'Bahan baku daur ulang kaca', 1.0),
  ('White-glass', 'Bahan baku daur ulang kaca', 1.0)
on conflict (kategori_limbah, kategori_kebutuhan) do nothing;

-- ----------------------------------------------------------------------------
-- 3. CHECK constraint kategori_dicari di riwayat_pencarian
-- ----------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'riwayat_pencarian_kategori_dicari_check'
      and conrelid = 'public.riwayat_pencarian'::regclass
  ) then
    -- Normalisasi data existing yang berada di luar daftar kurasi (inspeksi
    -- menemukan 'Belum pernah ada' dari alur "Lainnya"). Hanya berjalan saat
    -- constraint belum ada; setelah constraint terpasang, baris non-konform
    -- mustahil masuk sehingga blok ini skip (idempotent & tidak menghapus data).
    update public.riwayat_pencarian
    set kategori_dicari = '__lainnya__'
    where kategori_dicari is not null
      and kategori_dicari <> '__lainnya__'
      and kategori_dicari not in (
        'Bahan baku daur ulang kertas',
        'Bahan bakar biomassa',
        'Kompos',
        'Bahan baku tekstil daur ulang',
        'Bahan baku pengecoran',
        'Bahan bakar RDF',
        'Bahan baku daur ulang kaca'
      );

    alter table public.riwayat_pencarian
      add constraint riwayat_pencarian_kategori_dicari_check
      check (
        kategori_dicari is null
        or kategori_dicari in (
          'Bahan baku daur ulang kertas',
          'Bahan bakar biomassa',
          'Kompos',
          'Bahan baku tekstil daur ulang',
          'Bahan baku pengecoran',
          'Bahan bakar RDF',
          'Bahan baku daur ulang kaca',
          '__lainnya__'
        )
      );
  end if;
end;
$$;