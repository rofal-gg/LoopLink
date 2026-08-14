# LoopLink — TASKS.md

**Tahap 4: Tasks / Rencana Kerja** — hasil pemecahan Tahap 1-3 (Ide, Requirements, Arsitektur) jadi daftar tugas konkret, terurut dari setup awal sampai siap demo.

> Cara pakai: setiap task punya tag **[Delegasi: agent]** yang menunjukkan agent opencode mana yang mengerjakan (lihat `looplink-orchestrator.md`), dan **[Prioritas]** sesuai tingkat build dari Tahap 3 (Wajib Prototype / GTM / Roadmap). Kerjakan berurutan per fase — jangan loncat ke Fase 4 (Frontend) sebelum Fase 1-2 (Database, AI/ML) selesai, supaya kontrak data sudah pasti.

---

## Fase 0 — Setup Awal Project

- [x] Inisialisasi project Next.js + Tailwind CSS `[Delegasi: manual/setup]` **[Wajib]** — selesai: Next.js 16.3.0 (App Router) + Tailwind v4, build & dev server terverifikasi
- [x] Buat project Supabase baru, catat URL & anon key `[Delegasi: manual/setup]` **[Wajib]** — URL & key sudah tercatat di `.env.local`
- [x] Daftar API key HuggingFace (Inference API token) `[Delegasi: manual/setup]` **[Wajib]** — `HF_API_TOKEN` sudah terisi di `.env.local`; live call terverifikasi hingga DNS `api-inference.huggingface.co` (keterbatasan jaringan, lihat Fase 2)
- [x] Daftar API key Gemini via Google AI Studio `[Delegasi: manual/setup]` **[Wajib]** — `GEMINI_API_KEY` sudah terisi di `.env.local`; live call terverifikasi sukses
- [x] Siapkan file `.env.local` dengan semua key (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `HF_API_TOKEN`, `GEMINI_API_KEY`) `[Delegasi: manual/setup]` **[Wajib]** — file terisi lengkap
- [x] Setup repo GitHub (wajib untuk pengumpulan karya sesuai ketentuan lomba) `[Delegasi: manual/setup]` **[Wajib]** — repo `rofal-gg/LoopLink` sudah aktif, branch `main` sinkron dengan `origin/main`
- [x] Pasang 4 file agent opencode (`looplink-orchestrator`, `looplink-database-supabase`, `looplink-backend-api`, `looplink-ai-ml-integration`, `design-taste-frontend`) di `.opencode/agent/` `[Delegasi: manual/setup]` **[Wajib]** — kelima file ada

---

## Fase 1 — Database & Supabase

*Delegasikan seluruh fase ini ke `looplink-database-supabase`*

> ✅ Status: **selesai** — 7 migration (001 tabel inti, 002 tabel pendukung, 003 RLS, 004 revoke, 005 RPC, 006 index, 007 perbaikan keamanan) + `seed.sql` sudah di-apply ke Supabase remote dan terverifikasi. Detail di `PROGRESS.md`.

- [x] Buat migration tabel inti: `profiles`, `listings`, `listing_photos`, `kategori_kecocokan` **[Wajib]** — migration `202608140001_tabel_inti.sql`
- [x] Buat migration tabel pendukung: `riwayat_klaim`, `laporan`, `riwayat_pencarian`, `riwayat_pencarian_hasil` **[GTM]** — migration `202608140002_tabel_pendukung.sql`
- [x] Aktifkan RLS di semua tabel **[Wajib]** — 21 policy di migration `202608140003_rls_policies.sql`
- [x] Tulis policy SELECT/INSERT/UPDATE/DELETE sesuai tabel kebijakan RLS di Tahap 3 **[Wajib]**
- [x] Cabut hak UPDATE langsung kolom `status`/`diklaim_oleh`/`dibatalkan_oleh` dari role `authenticated` **[Wajib]** — migration `202608140004_revoke_status_update.sql`
- [x] Buat RPC function `claim_listing` **[Wajib]** — migration `202608140005_rpc_functions.sql`
- [x] Buat RPC function `complete_listing` **[Wajib]**
- [x] Buat RPC function `cancel_claim` **[Wajib]**
- [x] Buat index lokasi (`lokasi_lat`, `lokasi_lng`) dan status pada `listings` **[Wajib]** — migration `202608140006_indexes.sql`
- [x] Isi seed data `kategori_kecocokan` (baseline dari `looplink-ai-ml-integration.md`) **[Wajib]** — 7 baris di `seed.sql`
- [x] Buat seed data akun dummy (5-6 akun, lokasi & kategori bervariasi) untuk demo **[Wajib]** — 6 akun (admin + 5), password `looplink123`
- [x] Test manual: jalankan `claim_listing` dari 2 akun berbeda, pastikan listing sendiri tidak bisa diklaim **[Wajib]** — 6 test fungsional RPC lolos (klaim, tolak klaim sendiri, complete, cancel, tolak pihak ketiga), dijalankan di transaksi rollback supaya seed aman

---

## Fase 2 — AI/ML Integration

*Delegasikan seluruh fase ini ke `looplink-ai-ml-integration`*

> ✅ Status: **selesai** (dengan 1 keterbatasan tercatat) — 3 modul `lib/ai/` + 3 test script + loader env sudah dibuat dan terverifikasi (matching 20 PASS, ekstraksi 11 PASS termasuk panggilan Gemini live, klasifikasi 15 PASS + 2 WARN fallback). Detail di `PROGRESS.md`.

- [x] Implementasi fungsi `klasifikasiCitra()` — panggil HuggingFace `watersplash/waste-classification` **[Wajib]** — `lib/ai/klasifikasi.js`
- [x] Terapkan threshold confidence 0.6 (`perlu_koreksi_manual`) **[Wajib]** — konstanta `CONFIDENCE_THRESHOLD = 0.6`, diuji 0.4→true & 0.6→false
- [x] Implementasi fungsi `ekstraksiDeskripsi()` — panggil Gemini 1.5 Flash **[Wajib]** — `lib/ai/ekstraksi.js` (pakai alias `gemini-flash-latest`; `gemini-1.5-flash` sudah 404 di API v1beta, terverifikasi live)
- [x] Implementasi fungsi `hitungJarakKm()` (Haversine) **[Wajib]** — `lib/ai/matching.js`, terverifikasi Monas→Surabaya 665.255 km
- [x] Implementasi fungsi `hitungSkorKecocokan()` (rule-based, bobot 0.5/0.3/0.2) **[Wajib]** — `lib/ai/matching.js`, 20 kasus PASS
- [ ] Test klasifikasi dengan 5-10 foto contoh, catat akurasi kasar **[Wajib]** — ⚠️ **blocker**: DNS `api-inference.huggingface.co` tidak resolve dari jaringan dev; 2 foto contoh sudah disiapkan di `scripts/fixtures/`, jalur sukses belum terverifikasi live (fallback sudah tervalidasi). Coba ulang dari jaringan lain.
- [x] Test skenario confidence rendah (foto ambigu) memicu flag koreksi manual dengan benar **[Wajib]** — diuji via mock (0.4 → koreksi, 0.6 persis → tidak)
- [x] Test fallback saat HuggingFace/Gemini sengaja dimatikan (simulasi API down) **[Wajib]** — timeout, non-OK, non-JSON, key kosong: semua mengembalikan bentuk fallback tanpa melempar

---

## Fase 3 — Backend API

*Delegasikan seluruh fase ini ke `looplink-backend-api`*

> ✅ Status: **selesai** — 9 route API + helper validasi + client service-role dibuat; `npm run build` lolos; smoke test E2E 34 PASS (guard login 401, validasi 400, otorisasi 403, seluruh RPC status, fallback AI, pencarian+riwayat, laporan, visibilitas RLS). Detail di `PROGRESS.md` & `docs/api-endpoints.md`.

- [x] Endpoint `POST /api/listings/klasifikasi` **[Wajib]** — dukung raw bytes + JSON base64; fallback AI tetap 200 (`gagal:true`) untuk state "pilih manual"
- [x] Endpoint `POST /api/listings/ekstraksi-teks` **[Wajib]** — fallback Gemini tetap 200, deskripsi opsional
- [x] Endpoint `POST /api/listings` (buat listing) **[Wajib]** — `user_id` dari session, validasi kategori/satuan/koordinat, foto di-insert
- [x] Endpoint `GET/PATCH/DELETE /api/listings/[id]` **[Wajib]** — PATCH whitelist field non-status (tolak status → 400), DELETE hanya pemilik+`tersedia`
- [x] Endpoint `POST /api/listings/cari` (search + scoring + simpan ke `riwayat_pencarian`) **[Wajib]** — radius filter, skor 0.5/0.3/0.2, simpan via service-role client
- [x] Endpoint `POST /api/listings/[id]/klaim` **[Wajib]** — panggil RPC `claim_listing`
- [x] Endpoint `POST /api/listings/[id]/selesai` **[Wajib]** — panggil RPC `complete_listing`
- [x] Endpoint `POST /api/listings/[id]/batal` **[Wajib]** — panggil RPC `cancel_claim`
- [x] Endpoint `POST /api/laporan` **[GTM]** — `pelapor_id` dari session, validasi alasan non-empty
- [x] Test setiap endpoint dengan Postman/Thunder Client sebelum dihubungkan ke UI **[Wajib]** — smoke test `scripts/smoke-test-api.mjs` (34 PASS) + contoh curl di `docs/api-endpoints.md`

> **Catatan bug fix (di luar task list, penting):** akun demo seed (`%@looplink.demo`) tidak bisa login karena row `auth.users` hasil INSERT seed kurang `instance_id` (NULL) dan kolom token text berisi NULL (GoTrue gagal scan: `converting NULL to string is unsupported`). Diperbaiki di `seed.sql` + migration `202608140008_perbaikan_seed_login.sql` (sudah di-apply, 6/6 login sukses).

---

## Fase 4 — Frontend / UI

*Delegasikan seluruh fase ini ke `design-taste-frontend`, kontrak data dari Fase 3 wajib sudah final*

> ✅ Status 4.1+4.2: **selesai** — Landing, auth lengkap (login/register/lupa/reset), Setup Lokasi (GPS + fallback alamat manual wajib), Home/Dashboard (dua aksi utama Upload/Cari) selesai; guard route sesi ditambahkan di `lib/supabase/proxy.js`; build SUCCESS + smoke test HTTP (17 route, public 200, proteksi redirect 307, login demo 200). Detail di `PROGRESS.md`.
> 🔄 **Rework 14 Agu:** seluruh tampilan 4.1/4.2 di-*rebuild* `design-taste-frontend` agar **sama persis** design Figma user di `design_loop_link/` (cream/emerald/orange, font Fraunces+Inter+IBM Plex Mono, navbar glass pill, wave divider; fixed light, tanpa dark mode; ikon lucide-react). Semua logika bisnis & wiring auth/API Fase 3 dipertahankan; build SUCCESS + verifikasi HTTP 17 route. Detail di `PROGRESS.md`.
> ✅ Status 4.3: **selesai** — flow upload 6 task (foto → proses AI gabungan → review+koreksi+preview → sukses → edit → hapus) di `/upload` + `/upload/[id]/edit`; tersambung ke `POST /api/listings/klasifikasi`, `/api/listings/ekstraksi-teks`, `/api/listings`, dan `GET/PATCH/DELETE /api/listings/[id]`; foto via Supabase Storage bucket publik `listings` (migration `202608140011_storage_listings.sql`); dua state pesan AI berbeda; build SUCCESS 20 route + guard 307. Detail di `PROGRESS.md`.
> ✅ Status 4.4+4.5: **selesai** — flow cari (form kategori + radius slider + jumlah + skeleton + sort/filter drawer + empty state) di `/cari`, dan detail listing + klaim (modal konfirmasi → kontak pemilik, selesaikan, batalkan klaim dari dua sisi, lapor) di `/listing/[id]`; semua perubahan status hanya via endpoint RPC Fase 3; lint 0 error; build SUCCESS 21 route + guard 307. Detail di `PROGRESS.md`.

### 4.1 Publik & Onboarding
- [x] Landing Page **[Wajib]** — `app/page.js` total (hero dua arah, cara kerja, CTA)
- [x] Login **[Wajib]** — `app/login/LoginForm.jsx`, dukung `?next=`, redirect `/home` saat sudah login
- [x] Register **[Wajib]** — `app/register/RegisterForm.jsx`, kumpulkan `nama_lengkap` + upsert `profiles`, tangani email confirmation on/off
- [x] Lupa Password **[Wajib]** — `app/lupa-password/ForgotPasswordForm.jsx`, `resetPasswordForEmail` dengan `redirectTo`
- [x] Reset Password **[Wajib]** — `app/reset-password/ResetPasswordForm.jsx`, `setSession` dari hash recovery + `updateUser`
- [x] Setup Lokasi Awal (dengan fallback input alamat manual) **[Wajib]** — `app/setup-lokasi/SetupLokasiForm.jsx`; GPS (geolocation + reverse geocode Nominatim) dengan form alamat manual selalu tampil; upsert `profiles` via RLS; handle jalur tanpa baris profile

### 4.2 Navigasi Utama
- [x] Home / Dashboard **[Wajib]** — `app/home/page.js`; dua aksi dominan Upload Limbah (`/upload`) & Cari Bahan (`/cari`), sapaan nama, banner status lokasi, ringkasan "Listing saya" per status; placeholder `/upload` & `/cari` (`ComingSoon`)

### 4.3 Flow Upload Limbah
- [x] Upload Foto (capture/pilih gambar) **[Wajib]** — `app/upload` + `components/upload/UploadFlow.jsx`; capture kamera mobile / pilih file desktop, kompresi canvas, preview
- [x] State "Memproses AI" (loading gabungan klasifikasi + ekstraksi) **[Wajib]** — `AiProcessing.jsx`: satu state loading, klasifikasi → ekstraksi, tanpa dua spinner terpisah
- [x] Review & Koreksi Kategori + Form Detail Listing (satu layar, dengan live preview) **[Wajib]** — `ReviewForm.jsx` + `ListingPreview.jsx`; dua state pesan berbeda (gagal total vs confidence < 60%)
- [x] Konfirmasi Sukses Upload **[Wajib]** — `SuksesUpload.jsx`
- [x] Edit Listing **[Wajib]** — `app/upload/[id]/edit` + `EditFlow.jsx`; hanya status `tersedia`, PATCH whitelist non-status
- [x] Konfirmasi Hapus/Batalkan Listing **[Wajib]** — zona bahaya + `HapusModal.jsx` → DELETE; prasyarat storage bucket `listings` (migration `202608140011_storage_listings.sql`)

### 4.4 Flow Cari Bahan
- [x] Form Pencarian (kategori + radius slider) **[Wajib]** — `app/cari/page.js` + `components/cari/SearchForm.jsx`; 6 opsi dropdown + "Lainnya (ketik manual)", slider radius 1-100 km, jumlah dibutuhkan, banner lokasi hilang → `/setup-lokasi`
- [x] Hasil Pencarian (dengan skeleton loading, sort/filter drawer) **[Wajib]** — `components/cari/HasilKartu.jsx` + `SkeletonHasil.jsx` + `DrawerSortFilter.jsx`; sort skor/jarak/volume, filter 12 kategori, debounce radius, race-guard multi-tab
- [x] Empty State hasil kosong **[Wajib]** — `components/cari/EmptyState.jsx`; saran perluas radius + ubah kategori + catatan pencocokan persis

### 4.5 Detail Listing & Klaim
- [x] Detail Listing (termasuk tombol Laporkan) **[Wajib]** — `app/listing/[id]/page.js` + `components/listing/DetailListing.jsx`; galeri foto, badge status, skor AI, info pemilik; Amankan hanya `tersedia` & bukan pemilik; Laporkan bukan pemilik
- [x] Modal Konfirmasi Klaim → tampilkan kontak **[Wajib]** — `KlaimModal.jsx`; fase konfirmasi → sukses menampilkan nama/telpon/alamat pemilik
- [x] Konfirmasi Selesaikan Transaksi **[Wajib]** — `SelesaiModal.jsx`; hanya pemilik saat `dipesan`
- [x] Modal Batalkan Klaim **[Wajib]** — `BatalModal.jsx`; pemilik ATAU pengklaim, label berbeda ("dari {nama}" / "milikmu")

### 4.6 Manajemen Pribadi
- [x] Listing Saya (tab status) **[Wajib]** — `app/listing-saya/page.js` + `components/manajemen/ListingSaya.jsx` + `KartuListing.jsx`; 4 tab (Semua/Tersedia/Dipesan/Selesai), badge AI (`confidence_score`), Edit hanya saat `tersedia`, `dibatalkan` hanya di tab Semua
- [x] Klaim Saya **[Wajib]** — `app/klaim-saya/page.js` + `components/manajemen/KlaimSaya.jsx`; tracker 2 langkah + pill ringkasan, riwayat `riwayat_klaim` untuk yang dibatalkan, fallback kartu riwayat saat listing tak terlihat RLS
- [x] Profil Saya (lihat + edit) **[Wajib]** — `app/profil/page.js` + `components/manajemen/ProfilForm.jsx`; mode Lihat default ↔ Edit, `upsert(onConflict:"id")`, status `blokir`/`nonaktif` → `/unauthorized`
- [x] Pengaturan Akun **[Wajib]** — `app/pengaturan/page.js` + `components/manajemen/PengaturanForm.jsx`; update email/nama, ganti sandi min 8 karakter, logout semua sesi

### 4.7 Error & Edge Case
- [x] 404 Not Found **[Wajib]** — `app/not-found.js`; standalone, fallback beranda/dashboard sesuai status login
- [x] Error koneksi/server **[Wajib]** — `app/error.js`; error boundary client, pesan khusus koneksi + `reset()`, kode digest
- [x] AI classification gagal (fallback manual) **[Wajib]** — tercakup di 4.3: `components/upload/ReviewForm.jsx` alertInfo `gagal` → pilih manual
- [x] Confidence rendah (dorong koreksi) **[Wajib]** — tercakup di 4.3: `components/upload/ReviewForm.jsx` alertInfo `koreksi` saat confidence < 60% (`perlu_koreksi_manual`)
- [x] Unauthorized access **[Wajib]** — `app/unauthorized/page.js` + `components/manajemen/UnauthorizedActions.jsx`; halaman profil redirect ke sini untuk akun diblokir/nonaktif

### 4.8 GTM (Opsional, Kerjakan Kalau Waktu Cukup)
- [ ] Halaman Verifikasi Email **[GTM]**
- [ ] Notifikasi (list) **[GTM]**
- [ ] Riwayat Transaksi Gabungan **[GTM]**
- [ ] Modal Laporkan Listing **[GTM]**
- [ ] Tutorial/walkthrough singkat **[GTM]**
- [ ] Tentang, FAQ, Syarat & Ketentuan, Kebijakan Privasi, Kontak **[GTM]**

---

## Fase 5 — Integrasi & Testing End-to-End

> ✅ Status: **selesai** — 31 PASS E2E API + 14 PASS mobile (Chrome headless). Seluruh skenario wajib lolos: registrasi→lokasi→upload→AI→koreksi→tayang, cari→detail→klaim→kontak, selesai tercatat `riwayat_klaim`, batal dua sisi `dibatalkan_oleh` benar, tanpa tombol klaim untuk listing sendiri, radius filter. Catatan: AI klasifikasi live masih menunggu jaringan yang resolve `api-inference.huggingface.co` (fallback & mock sudah teruji). Detail di `PROGRESS.md` & `scripts/e2e-fase5.mjs` / `scripts/e2e-mobile.mjs`.

- [x] Test alur penuh: registrasi → setup lokasi → upload foto → klasifikasi AI → koreksi → listing tayang **[Wajib]** — E2E S1 (8 cek PASS; AI fallback/koreksi manual teruji, live HF tergantung jaringan)
- [x] Test alur penuh: cari bahan → lihat hasil terurut skor → buka detail → klaim → lihat kontak **[Wajib]** — E2E S2 (7 cek PASS, skor 0.84, kontak pemilik tampil)
- [x] Test alur selesai: pemilik menandai selesai, status berubah, tercatat di `riwayat_klaim` **[Wajib]** — E2E S3 (5 cek PASS)
- [x] Test alur batal: baik dari sisi pemilik maupun pengklaim, `dibatalkan_oleh` tercatat benar **[Wajib]** — E2E S4 (6 cek PASS)
- [x] Test bahwa listing sendiri tidak muncul tombol klaim **[Wajib]** — E2E S5 (API 400 + DOM SSR tanpa tombol)
- [x] Test radius pencarian — listing di luar radius tidak muncul **[Wajib]** — E2E S6 (radius 10 km filter, 1000 km tampil, jarak 665.8 km)
- [x] Test di perangkat mobile (karena upload foto sering dari HP) **[Wajib]** — E2E S7 (14 PASS, viewport 390×844, tanpa overflow horizontal)
- [x] Perbaiki bug dari hasil testing di atas **[Wajib]** — tidak ditemukan bug aplikasi; 4 asersi test awal yang salah ekspektasi schema diperbaiki di `scripts/e2e-fase5.mjs` & `scripts/e2e-mobile.mjs`

---

## Fase 6 — Deployment

- [ ] Deploy frontend ke Vercel (atau platform sejenis) **[Wajib]**
- [ ] Pastikan environment variable production terpasang lengkap **[Wajib]**
- [ ] Jalankan migration & seed data di Supabase production **[Wajib]**
- [ ] Test ulang seluruh alur di environment production (bukan cuma localhost) **[Wajib]**
- [ ] Pastikan logo UKM Triple-C / TCC / Jack 2026 tercantum di website sesuai ketentuan lomba **[Wajib]**
- [ ] Cek performa loading di koneksi lambat (venue lomba mungkin tidak stabil) **[Wajib]**

---

## Fase 7 — Persiapan Demo & Presentasi

- [ ] Siapkan 5-6 akun dummy dengan skenario pencocokan yang masuk akal (misal limbah kayu rumah tangga ↔ UMKM tahu) **[Wajib]**
- [ ] Siapkan 2-3 foto contoh untuk demo klasifikasi AI secara live (bukan cuma data dummy di database) **[Wajib]**
- [ ] Siapkan penjelasan singkat sesuai ketentuan poin 13 guide book: AI yang dipakai, tujuan, prompt garis besar, bagian yang dibantu AI vs dikembangkan mandiri, perhitungan scalability **[Wajib]**
- [ ] Siapkan jawaban untuk pertanyaan "kenapa tidak pakai embedding untuk matching?" (lihat tabel perbandingan yang sudah dibuat) **[Wajib]**
- [ ] Tulis deskripsi karya 150 kata untuk pengumpulan **[Wajib]**
- [ ] Format nama file sesuai ketentuan: `Namalengkap_Asalinstansi_Judulkarya` **[Wajib]**
- [ ] Submit link GitHub + PDF deskripsi via website resmi TCC **[Wajib]**

---

## Ringkasan Prioritas

| Prioritas | Artinya |
|---|---|
| **[Wajib]** | Harus selesai sebelum deadline pengumpulan — ini yang didemokan ke juri |
| **[GTM]** | Bagus untuk kelengkapan produk, dikerjakan kalau waktu masih cukup setelah semua [Wajib] selesai |
| **[Roadmap]** | Tidak dikerjakan sekarang, cukup disebutkan sebagai rencana pengembangan saat presentasi (dashboard admin, rating/trust score) |

---

*Bagian dari dokumentasi Spec-Driven Development (SDD) project LoopLink — Tahap 4: Tasks/Rencana Kerja.*
