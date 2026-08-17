# LoopLink — PROMPT.md

Kumpulan prompt siap-tempel untuk dikirim ke opencode (akan ditangani `looplink-orchestrator` sebagai primary agent). Kirim **satu per satu, berurutan** — jangan digabung sekaligus, supaya tiap fase bisa dicek dulu hasilnya sebelum lanjut ke fase berikutnya.

Sebelum mulai, pastikan 5 file agent (`looplink-orchestrator`, `looplink-database-supabase`, `looplink-backend-api`, `looplink-ai-ml-integration`, `design-taste-frontend`) sudah terpasang, dan 4 file dokumentasi SDD (`docs/sdd/LoopLink_Tahap1_Ide_Inisiasi.md`, `docs/sdd/LoopLink_Tahap2_Requirements_Spec.md`, `docs/sdd/LoopLink_Tahap3_Design_Arsitektur.md`, `docs/sdd/LoopLink_TASKS.md`) ada di `docs/sdd/`.

---

## Prompt 0 — Muat Konteks Project

```
Sebelum mulai kerja apa pun, baca file docs/sdd/LoopLink_Tahap1_Ide_Inisiasi.md, docs/sdd/LoopLink_Tahap2_Requirements_Spec.md, docs/sdd/LoopLink_Tahap3_Design_Arsitektur.md, dan docs/sdd/LoopLink_TASKS.md (semua di folder docs/sdd/). Pahami spec, aturan bisnis, schema database, dan daftar task yang sudah ditentukan. Jangan ambil keputusan baru yang bertentangan dengan dokumen-dokumen ini. Setelah selesai membaca, ringkas ke aku dalam 5-6 kalimat apa yang kamu pahami tentang project ini, supaya aku bisa konfirmasi sebelum kita mulai build.
```

---

## Prompt 1 — Setup Awal Project

```
Bantu aku setup project LoopLink dari nol:
1. Inisialisasi project Next.js (App Router) dengan Tailwind CSS v4
2. Buatkan struktur folder awal: app/, lib/supabase/, lib/ai/
3. Buatkan file .env.local.example dengan variable: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, HF_API_TOKEN, GEMINI_API_KEY (kosongkan value-nya, aku isi manual)
4. Buatkan lib/supabase/client.js (untuk browser) dan lib/supabase/server.js (untuk server component/API route) sesuai pola @supabase/ssr
5. Inisialisasi git repo dan buatkan .gitignore yang benar (termasuk .env.local)

Jangan proses instalasi package yang butuh aku isi API key dulu — cukup siapkan strukturnya.
```

---

## Prompt 2 — Database & Supabase (Fase 1)

```
Jalankan Fase 1 di docs/sdd/LoopLink_TASKS.md — delegasikan ke looplink-database-supabase.

Buatkan:
1. File migration SQL untuk semua tabel inti (profiles, listings, listing_photos, kategori_kecocokan) dan tabel pendukung (riwayat_klaim, laporan, riwayat_pencarian, riwayat_pencarian_hasil)
2. RLS policy lengkap untuk setiap tabel sesuai kebijakan yang sudah ditentukan di docs/sdd/LoopLink_Tahap3_Design_Arsitektur.md
3. Revoke UPDATE langsung untuk kolom status/diklaim_oleh/dibatalkan_oleh dari role authenticated
4. RPC function: claim_listing, complete_listing, cancel_claim
5. Index untuk lokasi (lokasi_lat, lokasi_lng) dan status pada listings
6. Seed data untuk kategori_kecocokan (pakai baseline dari looplink-ai-ml-integration.md)
7. Seed data 5-6 akun dummy dengan lokasi berbeda dan listing kategori bervariasi untuk keperluan demo

Simpan semua sebagai file migration terpisah di folder supabase/migrations/, dan seed data di supabase/seed.sql. Setelah selesai, kasih aku instruksi cara menjalankannya (supabase CLI atau paste manual ke SQL editor).
```

---

## Prompt 3 — AI/ML Integration (Fase 2)

```
Jalankan Fase 2 di docs/sdd/LoopLink_TASKS.md — delegasikan ke looplink-ai-ml-integration.

Buatkan di lib/ai/:
1. klasifikasi.js — fungsi klasifikasiCitra() yang memanggil model `google/vit-base-patch16-224` (ImageNet-1k) via HuggingFace Inference Router; label ImageNet-1k dipetakan ke 12 kategori LoopLink lewat `PEMETAAN_LABEL_IMAGENET`, dengan threshold confidence 0.6 untuk flag perlu_koreksi_manual
2. ekstraksi.js — fungsi ekstraksiDeskripsi() yang memanggil Gemini 1.5 Flash untuk mengekstrak kondisi & catatan dari deskripsi bebas user
3. matching.js — fungsi hitungJarakKm() (Haversine) dan hitungSkorKecocokan() (rule-based, bobot 0.5/0.3/0.2), sesuai formula di docs/sdd/LoopLink_Tahap3_Design_Arsitektur.md

Pastikan semua fungsi punya timeout 10 detik dan fallback yang jelas kalau API eksternal gagal — jangan sampai error mentah bocor ke pemanggil. Tulis juga file test sederhana (bisa manual script, tidak perlu framework testing penuh) untuk memverifikasi masing-masing fungsi jalan dengan benar menggunakan data contoh.
```

---

## Prompt 4 — Backend API (Fase 3)

```
Jalankan Fase 3 di docs/sdd/LoopLink_TASKS.md — delegasikan ke looplink-backend-api.

Buatkan seluruh API route di app/api/ sesuai daftar endpoint di looplink-backend-api.md:
- POST /api/listings/klasifikasi
- POST /api/listings/ekstraksi-teks
- POST /api/listings (buat listing)
- GET/PATCH/DELETE /api/listings/[id]
- POST /api/listings/cari
- POST /api/listings/[id]/klaim
- POST /api/listings/[id]/selesai
- POST /api/listings/[id]/batal
- POST /api/laporan

Gunakan fungsi dari lib/ai/ (Prompt 3) dan RPC dari Supabase (Prompt 2) — jangan tulis ulang logika klasifikasi/matching/RPC di sini, cukup panggil dan orkestrasikan. Pastikan setiap endpoint yang butuh login mengecek sesi user dulu. Setelah selesai, tunjukkan aku cara test tiap endpoint pakai curl atau contoh request.
```

---

## Prompt 5 — Frontend / UI (Fase 4)

Kirim per kelompok flow, jangan sekaligus semua — supaya tiap alur bisa dicek dulu sebelum lanjut.

### 5a — Autentikasi & Onboarding

```
Jalankan bagian 4.1 dan 4.2 di docs/sdd/LoopLink_TASKS.md — delegasikan ke design-taste-frontend.

Bacaan brief untuk design read: platform marketplace hiper-lokal untuk pertukaran limbah, target pengguna sangat luas (rumah tangga sampai UMKM/industri), harus terasa terpercaya tapi tetap approachable — bukan enterprise-B2B yang kaku, tapi juga bukan konsumer flashy. Bangun:
1. Landing Page
2. Login, Register, Lupa Password, Reset Password
3. Setup Lokasi Awal (dengan fallback input alamat manual kalau izin lokasi ditolak — ini wajib, bukan opsional)
4. Home/Dashboard dengan dua aksi utama yang jelas: Upload Limbah dan Cari Bahan

Sambungkan ke endpoint auth Supabase dan /api yang sudah dibuat di Prompt 4.
```

### 5b — Flow Upload Limbah

```
Jalankan bagian 4.3 di docs/sdd/LoopLink_TASKS.md — delegasikan ke design-taste-frontend.

Bangun flow upload limbah lengkap:
1. Upload Foto (capture kamera di mobile / pilih file di desktop)
2. State "Memproses AI" — loading gabungan untuk klasifikasi citra + ekstraksi teks, jangan dua loading terpisah
3. Review & Koreksi Kategori + Form Detail Listing dalam satu layar (kategori bisa dikoreksi manual, deskripsi/jumlah/satuan/lokasi diisi, dengan live preview)
4. Konfirmasi Sukses Upload
5. Edit Listing (hanya untuk status tersedia)
6. Konfirmasi Hapus/Batalkan Listing

Sambungkan ke /api/listings/klasifikasi, /api/listings/ekstraksi-teks, dan /api/listings dari Prompt 4. Tangani state khusus: kalau confidence AI < 60% atau klasifikasi gagal total, tampilkan UI yang mendorong user pilih kategori manual (dua state ini beda pesan, jangan disamakan).
```

### 5c — Flow Cari Bahan & Detail Listing

```
Jalankan bagian 4.4 dan 4.5 di docs/sdd/LoopLink_TASKS.md — delegasikan ke design-taste-frontend.

Bangun:
1. Form Pencarian (kategori kebutuhan + radius slider)
2. Hasil Pencarian dengan skeleton loading, sort/filter sebagai drawer/modal
3. Empty State kalau hasil kosong (saran: perluas radius atau ubah kata kunci)
4. Detail Listing lengkap (termasuk tombol Laporkan)
5. Modal Konfirmasi Klaim yang langsung menampilkan info kontak setelah berhasil
6. Konfirmasi Selesaikan Transaksi (tombol ini hanya muncul untuk pemilik listing)
7. Modal Batalkan Klaim (muncul untuk pemilik maupun pengklaim)

Pastikan tombol "Amankan" TIDAK muncul kalau listing yang dilihat adalah milik user yang sedang login. Sambungkan ke /api/listings/cari dan endpoint klaim/selesai/batal dari Prompt 4.
```

### 5d — Manajemen Pribadi & Error State

```
Jalankan bagian 4.6 dan 4.7 di docs/sdd/LoopLink_TASKS.md — delegasikan ke design-taste-frontend.

Bangun:
1. Listing Saya (tab/filter: Semua, Tersedia, Dipesan, Selesai)
2. Klaim Saya (listing yang diklaim, dengan status tracking)
3. Profil Saya (mode lihat dan edit dalam satu halaman)
4. Pengaturan Akun
5. Halaman error: 404, error koneksi/server, unauthorized access

Semua halaman ini mengonsumsi data dari user yang sedang login (session Supabase).
```

---

## Prompt 6 — Integrasi & Testing End-to-End (Fase 5)

```
Bantu aku testing end-to-end sesuai Fase 5 di docs/sdd/LoopLink_TASKS.md. Jalankan/simulasikan skenario berikut dan laporkan hasilnya satu per satu:
1. Registrasi akun baru → setup lokasi → upload foto limbah → cek AI mengklasifikasi dengan benar → koreksi kategori → listing tayang
2. Login akun lain → cari bahan → pastikan listing dari akun pertama muncul di hasil dengan skor kecocokan yang masuk akal → buka detail → klaim → kontak muncul
3. Kembali ke akun pertama (pemilik) → tandai transaksi selesai → cek status berubah dan tercatat di riwayat_klaim
4. Uji pembatalan klaim dari kedua sisi (pemilik dan pengklaim), pastikan dibatalkan_oleh tercatat benar
5. Pastikan akun pertama TIDAK bisa melihat tombol klaim di listing miliknya sendiri
6. Uji listing di luar radius pencarian tidak muncul di hasil
7. Uji tampilan di ukuran layar mobile

Kalau ada yang gagal, perbaiki dan laporkan apa yang diperbaiki.
```

---

## Prompt 7 — Deployment (Fase 6)

```
Bantu aku deploy LoopLink sesuai Fase 6 di docs/sdd/LoopLink_TASKS.md:
1. Siapkan project untuk deploy ke Vercel (vercel.json kalau perlu, cek build lolos tanpa error)
2. Buatkan checklist environment variable yang perlu aku isi di dashboard Vercel
3. Buatkan instruksi menjalankan migration dan seed data di Supabase production (bukan cuma local)
4. Pastikan logo UKM Triple-C / TCC / Jack 2026 sudah ada di footer atau halaman about (aku akan sediakan file logonya, kasih tahu aku taruh di mana)
5. Review sekali lagi apakah ada API key atau secret yang ter-hardcode sebelum push ke repo publik
```

---

## Prompt 8 — Persiapan Demo (Fase 7)

```
Bantu aku siapkan bahan presentasi sesuai Fase 7 di docs/sdd/LoopLink_TASKS.md:
1. Buatkan skrip skenario demo langkah-demi-langkah (akun mana melakukan apa, secara berurutan) yang menunjukkan alur upload → klasifikasi AI → matching → klaim → selesai, dari data seed yang sudah ada
2. Siapkan ringkasan poin-poin yang wajib dijelaskan sesuai ketentuan lomba: AI yang dipakai, tujuan penggunaannya, prompt garis besar, bagian yang dihasilkan AI vs dikembangkan mandiri, dan penjelasan skalabilitas (index lokasi sekarang vs rencana PostGIS)
3. Siapkan draf deskripsi karya maksimal 150 kata untuk pengumpulan
```

---

## Catatan Pemakaian

- Kalau salah satu prompt menghasilkan sesuatu yang menyimpang dari spec (docs/sdd/LoopLink_Tahap1-3.md), langsung koreksi di chat sebelum lanjut ke prompt berikutnya — jangan biarkan penyimpangan menumpuk ke fase selanjutnya.
- Prompt 5 (Frontend) sengaja dipecah 4 bagian karena UI paling banyak butuh iterasi visual — cek tiap bagian sebelum lanjut.
- Kalau butuh mengulang satu bagian kecil saja (misal cuma memperbaiki satu halaman), tidak perlu kirim ulang prompt satu fase penuh — cukup jelaskan bagian spesifiknya di chat biasa.
