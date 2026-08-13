-- ============================================================================
-- LoopLink — Seed Data Demo
-- ============================================================================
-- Cara menjalankan:
--   1) Supabase CLI : pastikan file ini bernama `supabase/seed.sql`, lalu
--                     `supabase db reset`  (menjalankan migration 01-06 +
--                     seed secara berurutan).
--   2) Manual       : jalankan migration 01 s/d 06 di SQL Editor, lalu
--                     jalankan SELURUH isi file ini sekali di SQL Editor
--                     (login sebagai role postgres / pakai service role).
--
-- Catatan penting:
--   * Password SEMUA akun dummy sama: looplink123  (biar gampang didemo)
--   * Akun admin / moderator demo: admin@looplink.demo  (is_admin = true)
--   * Akun dibuat langsung via auth.users + auth.identities sehingga login
--     email/password berfungsi tanpa registrasi manual.
--   * Seed IDEMPOTENT — aman dijalankan ulang (on conflict do nothing /
--     guard `not exists`), tidak akan membuat duplikat akun/listing.
--   * Butuh extension pgcrypto untuk crypt()/gen_salt() (bawaan Supabase,
--     perintah di bawah cuma pengaman).
-- ============================================================================

create extension if not exists pgcrypto;

-- ============================================================================
-- BAGIAN A — Baseline kategori_kecocokan
-- Sumber: LoopLink Tahap 3 Section B / agent AI-ML Section 4.
-- JANGAN ubah skor/nama tanpa konfirmasi — ini bagian argumen "kredibel
-- karena eksplisit" ke juri. Unik per (kategori_limbah, kategori_kebutuhan).
-- ============================================================================
insert into public.kategori_kecocokan (kategori_limbah, kategori_kebutuhan, skor_dasar)
values
  ('Cardboard', 'Bahan bakar biomassa', 0.9),
  ('Cardboard', 'Bahan baku daur ulang kertas', 1.0),
  ('Biological', 'Bahan bakar biomassa', 1.0),
  ('Biological', 'Kompos', 1.0),
  ('Clothes', 'Bahan baku tekstil daur ulang', 1.0),
  ('Metal', 'Bahan baku pengecoran', 1.0),
  ('Plastic', 'Bahan bakar RDF', 0.7)
on conflict (kategori_limbah, kategori_kebutuhan) do nothing;

-- ============================================================================
-- BAGIAN B — Akun dummy + listing demo
-- ----------------------------------------------------------------------------
-- 6 akun dengan lokasi tersebar (Surabaya, Sidoarjo, Gresik, Bangkalan)
-- supaya skor jarak pada matching terlihat beda saat demo.
--   admin@looplink.demo  → Admin LoopLink      (is_admin = true)  — Surabaya Pusat
--   budi@looplink.demo   → Budi Santoso                            — Surabaya Timur
--   sari@looplink.demo   → Sari Wijaya                             — Sidoarjo
--   agus@looplink.demo   → Agus Pratama                            — Gresik
--   dewi@looplink.demo   → Dewi Lestari                            — Bangkalan
--   rina@looplink.demo   → Rina Kartika                            — Surabaya Barat
-- ============================================================================

-- ----------------------------------------------------------------------------
-- B.1 Akun auth (auth.users) + identitas (auth.identities) + profiles
-- ----------------------------------------------------------------------------
do $$
declare
  v_rec record;
  v_user_id uuid;
  v_email text;
begin
  for v_rec in
    select *
    from (values
      ('admin@looplink.demo', 'Admin LoopLink', '0811-1111-1111', 'Jl. Tunjungan No. 1, Surabaya',   -7.2575, 112.7521, true),
      ('budi@looplink.demo',  'Budi Santoso',   '0812-2222-2222', 'Jl. Rungkut Asri No. 12, Surabaya', -7.3300, 112.7900, false),
      ('sari@looplink.demo',  'Sari Wijaya',    '0813-3333-3333', 'Jl. Pahlawan No. 45, Sidoarjo',     -7.4530, 112.7130, false),
      ('agus@looplink.demo',  'Agus Pratama',   '0814-4444-4444', 'Jl. Panglima Sudirman No. 8, Gresik', -7.1530, 112.6560, false),
      ('dewi@looplink.demo',  'Dewi Lestari',   '0815-5555-5555', 'Jl. Raya Telang No. 3, Bangkalan',  -7.1273, 112.7228, false),
      ('rina@looplink.demo',  'Rina Kartika',   '0816-6666-6666', 'Jl. Darmo Permai No. 21, Surabaya', -7.2800, 112.6800, false)
    ) as t(email, nama, telp, alamat, lat, lng, admin)
  loop
    v_email := v_rec.email;

    -- 1) auth.users — akun login email/password
    -- CATATAN:
    --   * Supabase modern TIDAK punya unique constraint di auth.users.email
    --     (identitas email disimpan di auth.identities), jadi pakai guard
    --     `if not exists` — bukan ON CONFLICT (email).
    --   * auth.users.id TIDAK punya default di Supabase modern — id harus
    --     di-generate eksplisit dengan gen_random_uuid() lalu dipakai juga
    --     untuk auth.identities dan profiles.
    if not exists (select 1 from auth.users where email = v_email) then
      v_user_id := gen_random_uuid();

      insert into auth.users (
        id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
      )
      values (
        v_user_id, 'authenticated', 'authenticated', v_email,
        crypt('looplink123', gen_salt('bf')),
        now(),
        jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
        jsonb_build_object('nama_lengkap', v_rec.nama),
        now(), now()
      );
    else
      select id into v_user_id from auth.users where email = v_email;
    end if;

    -- 2) auth.identities — WAJIB supaya login email/password berfungsi
    insert into auth.identities (
      provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    )
    values (
      v_email, v_user_id,
      jsonb_build_object(
        'sub', v_user_id::text,
        'email', v_email,
        'email_verified', true,
        'phone_verified', false
      ),
      'email', now(), now(), now()
    )
    on conflict (provider, provider_id) do nothing;

    -- 3) profiles — profil marketplace publik
    insert into public.profiles (id, nama_lengkap, no_telepon, alamat_teks, lokasi_lat, lokasi_lng, status_akun, is_admin)
    values (v_user_id, v_rec.nama, v_rec.telp, v_rec.alamat, v_rec.lat, v_rec.lng, 'aktif', v_rec.admin)
    on conflict (id) do nothing;
  end loop;
end
$$;

-- ----------------------------------------------------------------------------
-- B.2 Listing dummy (10) — state beragam: 7 tersedia, 2 dipesan, 1 selesai,
--     1 dibatalkan. Lokasi listing mengikuti lokasi pemilik (profiles).
--     Confidence < 0.6 sengaja disertakan (kardus bekas toko, 0.55) sebagai
--     contoh kategori yang perlu koreksi manual.
-- ----------------------------------------------------------------------------
insert into public.listings (
  user_id, judul, kategori_citra, kategori_dikoreksi, confidence_score, deskripsi_teks,
  jumlah, satuan, lokasi_lat, lokasi_lng, status, diklaim_oleh, diklaim_pada,
  dibatalkan_oleh, expired_at, created_at, updated_at
)
select
  p.id,
  d.judul,
  d.kategori_citra,
  d.kategori_dikoreksi,
  d.confidence_score,
  d.deskripsi_teks,
  d.jumlah,
  d.satuan,
  p.lokasi_lat,
  p.lokasi_lng,
  d.status,
  pc.id,
  d.diklaim_pada,
  pb.id,
  d.expired_at,
  d.created_at,
  d.created_at  -- updated_at awal = created_at
from (values
  ('budi@looplink.demo',  'Karton bekas pabrik (press)',     'Cardboard',  false, 0.93, 'Karton bersih dari pabrik, sudah dipress rapi.', 500, 'kg',  'tersedia',  null,                 null,                  null,                  now() + interval '7 days',  now() - interval '3 days'),
  ('sari@looplink.demo',  'Sisa sayur pasar Sidoarjo',       'Biological', false, 0.88, 'Sisa sayur segar dari pasar, cocok untuk kompos.', 120, 'kg', 'tersedia',  null,                 null,                  null,                  now() + interval '5 days',  now() - interval '2 days'),
  ('budi@looplink.demo',  'Botol plastik PET bersih',        'Plastic',    false, 0.95, 'Botol PET bekas minuman, sudah dipilah dan ditekan.', 60, 'kg', 'dipesan',   'dewi@looplink.demo', now() - interval '1 day', null,                  null,                       now() - interval '2 days'),
  ('agus@looplink.demo',  'Besi tua dan logam bengkel',      'Metal',      false, 0.91, 'Besi tua, baja, dan logam campuran dari bengkel.', 2, 'ton',  'selesai',   'rina@looplink.demo', now() - interval '4 days', null, null,                       now() - interval '5 days'),
  ('agus@looplink.demo',  'Kardus bekas toko kelontong',     'Cardboard',  false, 0.55, 'Campuran kardus bekas toko, perlu dipilah lagi.', 300, 'kg', 'tersedia',  null,                 null,                  null,                  now() + interval '6 days',  now() - interval '1 day'),
  ('dewi@looplink.demo',  'Pakaian bekas layak pakai',       'Clothes',    false, 0.89, 'Baju bekas layak pakai, sudah dicuci dan disetrika.', 80, 'kg', 'tersedia', null,                 null,                  null,                  now() + interval '7 days',  now() - interval '1 day'),
  ('rina@looplink.demo',  'Kertas arsip kantor (shredder)',  'Paper',      false, 0.84, 'Kertas arsip kantor, sudah dihancurkan mesin shredder.', 150, 'kg', 'tersedia', null, null, null, now() + interval '4 days', now() - interval '2 days'),
  ('sari@looplink.demo',  'Kulit buah & sisa makanan',       'Biological', false, 0.90, 'Sisa dapur berupa kulit buah dan makanan, cocok kompos.', 40, 'kg', 'dipesan', 'rina@looplink.demo', now() - interval '12 hours', null, null, now() - interval '1 day'),
  ('budi@looplink.demo',  'Sekrup & besi bubut bengkel',     'Metal',      false, 0.97, 'Sekrup dan besi bubut sisa produksi bengkel.', 500, 'kg', 'tersedia', null, null, null, now() + interval '10 days', now() - interval '1 day'),
  ('rina@looplink.demo',  'Botol kaca hijau bekas minuman',  'Green-glass', false, 0.78, 'Botol kaca hijau bekas minuman, sudah dicuci.', 200, 'kg', 'dibatalkan', null,                 null,                 'dewi@looplink.demo', null,                 now() - interval '4 days')
) as d(
  email_pemilik, judul, kategori_citra, kategori_dikoreksi,
  confidence_score, deskripsi_teks, jumlah,
  satuan, status, email_pengklaim, diklaim_pada,
  email_pembatal, expired_at, created_at
)
join auth.users u on u.email = d.email_pemilik
join public.profiles p on p.id = u.id
left join auth.users uc on uc.email = d.email_pengklaim
left join public.profiles pc on pc.id = uc.id
left join auth.users ub on ub.email = d.email_pembatal
left join public.profiles pb on pb.id = ub.id
where not exists (
  select 1 from public.listings l
  where l.user_id = p.id and l.judul = d.judul
);

-- ----------------------------------------------------------------------------
-- B.3 Foto listing (placeholder) — 1 foto per listing supaya UI langsung rapi.
-- ----------------------------------------------------------------------------
insert into public.listing_photos (listing_id, foto_url, urutan)
select l.id, d.foto_url, 1
from (values
  ('budi@looplink.demo',  'Karton bekas pabrik (press)',     'https://placehold.co/600x400?text=Karton'),
  ('sari@looplink.demo',  'Sisa sayur pasar Sidoarjo',       'https://placehold.co/600x400?text=Kompos'),
  ('budi@looplink.demo',  'Botol plastik PET bersih',        'https://placehold.co/600x400?text=Plastik'),
  ('agus@looplink.demo',  'Besi tua dan logam bengkel',      'https://placehold.co/600x400?text=Besi'),
  ('agus@looplink.demo',  'Kardus bekas toko kelontong',     'https://placehold.co/600x400?text=Kardus'),
  ('dewi@looplink.demo',  'Pakaian bekas layak pakai',       'https://placehold.co/600x400?text=Pakaian'),
  ('rina@looplink.demo',  'Kertas arsip kantor (shredder)',  'https://placehold.co/600x400?text=Kertas'),
  ('sari@looplink.demo',  'Kulit buah & sisa makanan',       'https://placehold.co/600x400?text=Kompos'),
  ('budi@looplink.demo',  'Sekrup & besi bubut bengkel',     'https://placehold.co/600x400?text=Besi'),
  ('rina@looplink.demo',  'Botol kaca hijau bekas minuman',  'https://placehold.co/600x400?text=Kaca')
) as d(email_pemilik, judul, foto_url)
join auth.users u on u.email = d.email_pemilik
join public.listings l on l.user_id = u.id and l.judul = d.judul
where not exists (
  select 1 from public.listing_photos lp where lp.listing_id = l.id
);

-- ----------------------------------------------------------------------------
-- B.4 Riwayat klaim — untuk listing 'selesai' dan 'dibatalkan' supaya log
--     transaksi ikut terlihat saat demo.
-- ----------------------------------------------------------------------------
insert into public.riwayat_klaim (listing_id, pemilik_id, pengklaim_id, status_akhir, diklaim_pada, diselesaikan_pada)
select l.id, l.user_id, pc.id, d.status_akhir, d.diklaim_pada, d.diselesaikan_pada
from (values
  ('agus@looplink.demo',  'Besi tua dan logam bengkel',     'rina@looplink.demo', 'selesai',    now() - interval '4 days', now() - interval '3 days'),
  ('rina@looplink.demo',  'Botol kaca hijau bekas minuman', 'dewi@looplink.demo', 'dibatalkan', now() - interval '3 days', now() - interval '2 days')
) as d(email_pemilik, judul, email_pengklaim, status_akhir, diklaim_pada, diselesaikan_pada)
join auth.users u on u.email = d.email_pemilik
join public.listings l on l.user_id = u.id and l.judul = d.judul
join auth.users uc on uc.email = d.email_pengklaim
join public.profiles pc on pc.id = uc.id
where not exists (
  select 1 from public.riwayat_klaim rk where rk.listing_id = l.id
);
