# LoopLink — PROGRESS.md

> Dokumen progres live project LoopLink (Trunodjoyo Creative Competition 2026 — Vibe Code).
> Di-update setiap kali ada fase selesai / dimulai. Sumber kebenaran teknis: `docs/sdd/LoopLink_TASKS.md`, `docs/prompts/LoopLink_PROMPT.md`, `docs/sdd/LoopLink_Tahap3_Design_Arsitektur.md`.

---

## Status Saat Ini

**Fase aktif: Fase 5 — Integrasi & Testing End-to-End ✅ SELESAI** — 7 skenario wajib di TASKS.md lolos (31 PASS E2E API + 14 PASS mobile). Dua script test baru: `scripts/e2e-fase5.mjs` (S1–S6) & `scripts/e2e-mobile.mjs` (S7, Chrome headless 390×844). Tidak ditemukan bug aplikasi. Detail di bawah.

> ✅ **Fase 1 (Database & Supabase) SELESAI** — 10 migration + seed ter-apply, RLS aktif, 3 RPC terverifikasi, 2 gap schema (visibilitas pengklaim + FK cascade) sudah diperbaiki. **+1 migration bonus**: `202608140011_storage_listings.sql` (bucket storage publik `listings` + 4 policy, prasyarat 4.3).
> ✅ **Fase 2 (AI/ML Integration) SELESAI** — 3 modul `lib/ai/` + test script; kontrak fungsi siap.
> ✅ **Fase 3 (Backend API) SELESAI** — 9 API route + helper; build lolos; smoke test E2E 34 PASS. Contoh curl di `docs/api-endpoints.md`. Bonus: bug login akun demo seed diperbaiki (lihat detail di bawah) sehingga akun `%@looplink.demo` bisa login untuk demo.
> ✅ **Fase 4.1 (Publik & Onboarding) SELESAI** — Landing, Login, Register, Lupa/Reset Password, Setup Lokasi + guard route di proxy.
> ✅ **Fase 4.2 (Home/Dashboard) SELESAI** — `/home`, placeholder `/upload` & `/cari` (proteksi login).
> ✅ **Fase 4.3 (Upload Limbah UI) SELESAI** — flow upload 6 task lengkap di `/upload` + `/upload/[id]/edit`; tersambung ke 3 endpoint Fase 3 + Supabase Storage; dua state pesan AI berbeda; build SUCCESS 20 route + smoke guard route. Detail di bawah.
> ✅ **Fase 4.4 (Cari Bahan UI) SELESAI** — `/cari`: form kategori + slider radius + jumlah, skeleton loading, sort/filter drawer, empty state; tersambung ke `POST /api/listings/cari`; banner lokasi → `/setup-lokasi`.
> ✅ **Fase 4.5 (Detail Listing & Klaim UI) SELESAI** — `/listing/[id]`: galeri, badge status, skor AI, info pemilik; modal klaim (→ kontak pemilik), selesaikan, batalkan klaim (dua sisi), lapor; semua status hanya via RPC endpoint Fase 3; build SUCCESS 21 route + lint 0 error. Detail di bawah.
> ✅ **Fase 4.6 (Manajemen Pribadi UI) SELESAI** — `/listing-saya` (4 tab status + edit saat tersedia), `/klaim-saya` (tracker 2 langkah + pill ringkasan + riwayat dibatalkan + fallback saat listing tak terlihat RLS), `/profil` (lihat ↔ edit, `upsert` onConflict id, blokir/nonaktif → `/unauthorized`), `/pengaturan` (update profil + ganti sandi + logout semua sesi). Navigasi via dropdown avatar (MENU_AKUN), link "Kelola" di `/home`. Detail di bawah.
> ✅ **Fase 4.7 (Error & Edge Case UI) SELESAI** — `app/not-found.js` (404 custom, fallback beranda/dashboard sesuai login), `app/error.js` (error boundary + pesan khusus koneksi + reset), `/unauthorized` untuk akses akun diblokir/nonaktif; dua state pesan AI diverifikasi sudah tercakup di 4.3 (`ReviewForm.jsx` alertInfo `gagal`/`koreksi`). Build SUCCESS 26 route + lint 0 error. Detail di bawah.

---

## Yang Sudah Selesai

### Fase 0 — Setup Awal Project ✅ (sebagian besar)

- ✅ **Project Next.js + Tailwind CSS v4 terinisialisasi** — `next@16.3.0` (App Router, JavaScript), `react@19`, `tailwindcss@^4` + `@tailwindcss/postcss`. Build & dev server terverifikasi (halaman `/` 200, proxy jalan).
- ✅ **Struktur folder awal** — `app/`, `lib/supabase/`, `lib/ai/` (+ `.gitkeep`), `public/`.
- ✅ **`.env.local.example`** — berisi 5 variabel kosong siap isi manual: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `HF_API_TOKEN`, `GEMINI_API_KEY`.
- ✅ **Supabase client pola `@supabase/ssr`** — `lib/supabase/client.js` (browser, singleton) & `lib/supabase/server.js` (server component/route handler, `cookies()` async).
- ✅ **Proxy refresh sesi (konvensi Next.js 16)** — `proxy.js` di root + `lib/supabase/proxy.js` (`updateSession` → `supabase.auth.getClaims()`, sinkronisasi cookie request/response, cache headers anti-CDN). Termasuk guard env kosong agar dev server tidak 500 sebelum key diisi.
- ✅ **`.env.local` terisi lengkap** — `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `HF_API_TOKEN`, `GEMINI_API_KEY` sudah ada. Live Gemini terverifikasi; klasifikasi HF memakai model `google/vit-base-patch16-224` via endpoint Router + pemetaan `PEMETAAN_LABEL_IMAGENET` (detail Fase 2).
- ✅ **Repo GitHub aktif** — remote `rofal-gg/LoopLink.git`, branch `main` sinkron dengan `origin/main`.
- ✅ **5 file agent opencode terpasang** — `looplink-orchestrator`, `looplink-database-supabase`, `looplink-backend-api`, `looplink-ai-ml-integration`, `design-taste-frontend` di `.opencode/agents/`.

### Fase 1 — Database & Supabase ✅

- ✅ **7 migration ter-apply ke Supabase remote** (via MCP `apply_migration`):
  - `202608140001_tabel_inti.sql` — `profiles`, `listings`, `listing_photos`, `kategori_kecocokan`
  - `202608140002_tabel_pendukung.sql` — `riwayat_klaim`, `laporan`, `riwayat_pencarian`, `riwayat_pencarian_hasil`
  - `202608140003_rls_policies.sql` — RLS aktif di 8 tabel + 21 policy
  - `202608140004_revoke_status_update.sql` — revoke UPDATE langsung kolom `status`/`diklaim_oleh`/`dibatalkan_oleh`/`diklaim_pada` dari `authenticated`
  - `202608140005_rpc_functions.sql` — `claim_listing`, `complete_listing`, `cancel_claim` (SECURITY DEFINER, `set search_path = public`)
  - `202608140006_indexes.sql` — `idx_listings_lokasi` (lat+lng), `idx_listings_status`
  - `202608140007_perbaikan_keamanan.sql` — fix `search_path` `set_updated_at` + revoke EXECUTE dari `anon` untuk 3 RPC (grant `authenticated` tetap)
- ✅ **Seed data ter-apply** (`supabase/seed.sql`) — 7 `kategori_kecocokan`, 6 akun demo (semua password `looplink123`: `admin@`, `budi@`, `sari@`, `agus@`, `dewi@`, `rina@` @looplink.demo), 10 listings (6 tersedia, 2 dipesan, 1 selesai, 1 dibatalkan — termasuk 1 contoh `perlu_koreksi_manual`), 10 foto, 2 riwayat klaim.
- ✅ **Bug seed yang diperbaiki:** (1) Supabase modern tidak punya unique constraint di `auth.users.email` → guard `if not exists` bukan `ON CONFLICT (email)`; (2) `auth.users.id` tanpa default → `gen_random_uuid()` eksplisit; (3) auto-grant EXECUTE ke `anon` untuk fungsi baru di `public` → revoke eksplisit dari `anon`.
- ✅ **Verifikasi keamanan & fungsional:**
  - `has_function_privilege`: anon=false, authenticated=true untuk 3 RPC ✓
  - 6 test fungsional RPC **PASS** (dijalankan di transaksi rollback): klaim orang lain ✓, klaim sendiri ditolak ✓, complete non-pemilik ditolak ✓, complete pemilik + riwayat tercatat ✓, cancel pihak ketiga ditolak ✓, cancel pengklaim + riwayat tercatat ✓
  - Security advisor: WARN `set_updated_at` & anon-3-RPC hilang; sisa WARN `authenticated` pada 3 RPC adalah desain (aturan bisnis #5) dan `rls_auto_enable` adalah fungsi bawaan Supabase.

### Fase 2 — AI/ML Integration ✅

- ✅ **`lib/ai/klasifikasi.js`** — `klasifikasiCitra(imageBuffer)` panggil model `google/vit-base-patch16-224` (ImageNet-1k) via `https://router.huggingface.co/hf-inference/models/google/vit-base-patch16-224`; label ImageNet-1k hasil model dipetakan ke 12 kategori LoopLink lewat tabel `PEMETAAN_LABEL_IMAGENET` (label asli top-1 tersimpan di `peringkat`), timeout 10 detik, threshold `CONFIDENCE_THRESHOLD = 0.6` → `perlu_koreksi_manual`. Sukses: `{ kategori, confidence, perlu_koreksi_manual, peringkat, gagal: false }`; gagal: `{ kategori: null, confidence: 0, perlu_koreksi_manual: true, gagal: true, alasan_gagal }` — tidak pernah melempar.
- ✅ **`lib/ai/ekstraksi.js`** — `ekstraksiDeskripsi({ deskripsiUser, kategoriCitra, usiaBulan })` panggil Gemini (alias `gemini-flash-latest`, lihat catatan), output JSON `{ kondisi, catatan_tambahan }`, sanitasi input user, timeout 10 detik, fallback `{ kondisi: "tidak diketahui", catatan_tambahan: "", gagal: true }`.
- ✅ **`lib/ai/matching.js`** — `hitungJarakKm()` Haversine (R=6371, clamp presisi floating point) + `hitungSkorKecocokan()` persis bobot 0.5/0.3/0.2, hasil clamp [0,1], pasangan kategori persis dari `seed.sql` BAGIAN A. Konstanta bobot diekspor (`BOBOT_KATEGORI/JARAK/VOLUME`). Kedua fungsi pure (tanpa I/O → tanpa timeout, dokumentasi di header).
- ✅ **Test script manual** (`scripts/`, jalan dengan `node <file>`, tanpa package baru):
  - `scripts/test-matching.mjs` — **20 PASS, 0 FAIL** (jarak Monas→Surabaya 665.255 km, skor 0.85/0.9/0.82/1.0, guard radius/volume/NaN, clamp).
  - `scripts/test-ekstraksi.mjs` — **11 PASS, 0 FAIL** termasuk **LIVE Gemini**: "kardus bekas sedikit basah karena hujan" → `kondisi=basah`, catatan sesuai.
  - `scripts/test-klasifikasi.mjs` — **15 PASS, 0 FAIL, 2 WARN**: 15 jalur deterministik (sukses mock, threshold 0.4→true/0.6→false, timeout, non-OK, JSON rusak, 5 input invalid, key kosong) + 2 WARN keterbatasan (lihat bawah).
- ✅ **`scripts/load-env.mjs`** — loader `.env.local` minimal untuk `node` langsung (tidak mencetak key).
- ✅ **`.gitignore`** — `scripts/fixtures/` (foto sampel uji) ditambahkan.
- ⚠️ **Keterbatasan model (tercatat):** `google/vit-base-patch16-224` bukan model limbah khusus — ImageNet-1k tidak punya kelas **battery** (→ `Battery` tidak pernah terdeteksi otomatis) dan `Trash` tidak punya mapping label. Label ImageNet yang unmapped atau skor < 0.6 → `perlu_koreksi_manual: true` (sebagian foto butuh koreksi manual). Live klasifikasi dari jaringan dev belum terverifikasi (endpoint lama `api-inference...` sudah tidak dipakai; fallback termasuk timeout 10 detik sudah tervalidasi penuh via mock). 2 foto contoh (`plastic-bottles.jpg`, `corrugated-cardboard.jpg`) sudah ada di `scripts/fixtures/` untuk dicoba dari jaringan lain.
- 📌 **Catatan deviasi terdokumentasi:** spec menyebut `gemini-1.5-flash`, tapi di API v1beta model itu sudah 404 (terverifikasi live). Diganti alias resmi `gemini-flash-latest` (konstanta `MODEL_GEMINI` di `ekstraksi.js`) — tidak melanggar aturan non-negosiasi agent.

### Fase 3 — Backend API ✅

- ✅ **9 API route** (`app/api/`): `POST /api/listings/klasifikasi`, `POST /api/listings/ekstraksi-teks`, `POST /api/listings`, `GET/PATCH/DELETE /api/listings/[id]`, `POST /api/listings/cari`, `POST /api/listings/[id]/klaim|selesai|batal`, `POST /api/laporan`.
- ✅ **Helper & client tambahan:**
  - `lib/supabase/admin.js` — client **service-role server-only** (hanya dipakai menulis `riwayat_pencarian`/`_hasil`; peringatan keras agar tidak di-import dari client).
  - `lib/api/validasi-listing.js` — validasi terpusat (12 kelas kategori, satuan, koordinat, jumlah, UUID, whitelist field PATCH).
  - `scripts/smoke-test-api.mjs` — smoke test E2E via HTTP (buat user test via admin API + cookie sesi, cleanup penuh).
  - `docs/api-endpoints.md` — dokumentasi + contoh curl per endpoint.
- ✅ **Pola keamanan:** semua endpoint butuh-login pakai `auth.getUser()` → 401; `user_id`/`pelapor_id` selalu dari session (body palsu diabaikan, terbukti test); perubahan status WAJIB via RPC (PATCH menolak field status dengan 400); tidak ada key hardcode.
- ✅ **Fallback AI:** HF timeout/gagal → 200 `{kategori:null, gagal:true}` (UI → state pilih manual); Gemini gagal → deskripsi opsional, listing tetap bisa dibuat.
- ✅ **Verifikasi:** `npm run build` **SUCCESS** (9 route terdaftar); smoke test **34 PASS, 0 FAIL** dijalankan ulang oleh orchestrator (guard login, validasi, otorisasi, semua RPC status termasuk tolak klaim sendiri, klasifikasi raw+base64, ekstraksi live, cari+riwayat, radius filter, laporan, visibilitas RLS).
- ✅ **Bug fix penting — akun demo seed tidak bisa login** (ditemukan saat smoke test): row `auth.users` hasil INSERT seed punya `instance_id` NULL (GoTrue tidak menemukan user → `invalid_credentials`) dan kolom token text NULL (`confirmation_token` dkk → GoTrue error scan `converting NULL to string is unsupported`). Diperbaiki: `supabase/seed.sql` (insert `instance_id = '00000000-…'` + kolom token `''`) + migration `202608140008_perbaikan_seed_login.sql` (sudah di-apply remote). Verifikasi **6/6 akun demo login sukses** (`admin`/`budi`/`sari`/`agus`/`dewi`/`rina` @looplink.demo, password `looplink123`).
- ✅ **2 gap schema DIPERBAIKI** (migration `202608140009_perbaikan_visibilitas_pengklaim.sql` + `202608140010_perbaikan_fk_cascade.sql`, sudah ter-apply & terverifikasi):
  1. **Pengklaim bisa melihat listing yang dia klaim** — policy SELECT baru `listing_select_claimant` (`diklaim_oleh = auth.uid()`) + policy `listing_photos_select_follows_parent` diperluas (foto ikut terlihat oleh pengklaim). GET detail setelah klaim → 200 (sebelumnya 404). Pihak ketiga tetap tidak melihat (kontrol negatif PASS).
  2. **Listing ber-Riwayat boleh dihapus** — FK anak `riwayat_klaim`, `laporan`, `riwayat_pencarian_hasil` diubah ke `ON DELETE CASCADE` (konsisten dengan `listing_photos`). DELETE listing ber-riwayat_klaim → 200 (sebelumnya 400 FK). Idempotent (guard `pg_constraint`).
  - Verifikasi: query `pg_policies`/`information_schema` (semua FK anak CASCADE) + `scripts/verify-gap-schema.mjs` (19 PASS, cleanup total) + smoke test API penuh **34 PASS** (ekspektasi gap di `smoke-test-api.mjs` diperbarui sesuai perilaku baru).

### Fase 4.1 & 4.2 — Frontend / UI (Landing, Auth, Onboarding, Home) ✅

> **Rework 14 Agu:** seluruh tampilan 4.1/4.2 di-*rebuild* oleh `design-taste-frontend` agar **sama persis** dengan design Figma user di `design_loop_link/` (sebelumnya memakai sistem stone/leaf + dark mode otomatis). Detail di bawah.

- ✅ **Design system** — port 1:1 dari `design_loop_link/src/index.css` & `App.tsx`: warna cream `#F6F3EA`, ink `#1C2B22`, primary emerald `#3C7A5C`, signal orange `#E8752C`, mist `#DCE3D3`, line `#8C9184`, mint `#6bba91`, dark `#111A14`; font **Fraunces** (display) + **Inter** (body) + **IBM Plex Mono** (mono) via `next/font/google`; **fixed light, tanpa dark mode**; ikon `lucide-react`. Token Tailwind `loop-*` di `app/globals.css`.
- ✅ **Landing (`app/page.js` + `components/landing/*`)** — 19 section port dari App.tsx: navbar 3 glass pill, hero blob + kartu float + live badge, live feed ticker, fitur, trust band AI, impact stats count-up, kategori explorer, app preview phone, listing terbaru (masonry/mobile scroll), environmental progress, galeri komunitas, testimonial, tabel perbandingan, proses 5 langkah, FAQ, newsletter, CTA banner, wave dividers, footer. CTA connect ke route nyata: `Upload` → `/upload|/register`, `Masuk` → `/login`, `Daftar` → `/register`, `Cari` → `/cari`.
- ✅ **Auth** — `app/login`, `app/register`, `app/lupa-password`, `app/reset-password` + `AuthShell` (kartu cream, judul Fraunces): `signInWithPassword` + `safeNext`, `signUp` + upsert profil + state cek email, `resetPasswordForEmail` (anti user-enumeration), `setSession` dari hash recovery + `updateUser` → `/login?reset=1`. Box akun demo (`%@looplink.demo`, password `looplink123`) tetap ada.
- ✅ **Onboarding:** `app/setup-lokasi` + `SetupLokasiForm` — GPS + reverse geocode Nominatim (fallback koordinat), **form alamat manual SELALU tampil sebagai fallback saat izin ditolak** (business rule #3), upsert profil via RLS, handle tanpa baris profile.
- ✅ **Dashboard:** `app/home` — sapaan `nama_lengkap`, dua kartu aksi besar `/upload` & `/cari`, banner status lokasi (amber → `/setup-lokasi` / hijau + Ubah), ringkasan "Listing saya" per status (query RLS milik sendiri). `AppHeader` di-restyle ke token baru. Placeholder `/upload` & `/cari` (ComingSoon).
- ✅ **Verifikasi rework:** `npm run build` **SUCCESS** (Next 16.3.0 Turbopack, 17 route + proxy); grep `bg-stone|text-leaf|dark:` di `app/` & `components/` = 0 sisa; smoke HTTP live (`next start`): publik `/`,`/login`,`/register`,`/lupa-password`,`/reset-password` → 200; proteksi `/home`,`/setup-lokasi`,`/upload`,`/cari` → 307 → `/login`. Semua logika bisnis (fallback alamat manual, akun demo, safeNext, guard route) dipertahankan.

### Fase 4.3 — Frontend / UI (Flow Upload Limbah) ✅

> Prasyarat storage disiapkan oleh `looplink-database-supabase` (migration `202608140011_storage_listings.sql`), lalu seluruh flow 4.3 dikerjakan oleh `design-taste-frontend`.

- ✅ **Supabase Storage (prasyarat):** bucket publik `listings` (5 MB, mime gambar jpeg/png/webp/heic/heif) + 4 policy `storage.objects` — INSERT/UPDATE/DELETE hanya `authenticated` dengan path wajib folder `{auth.uid()}` (folder-sendiri), SELECT publik (anon + authenticated). Terverifikasi: anon tidak bisa upload (RLS 42501), authenticated tidak bisa menimpa folder orang lain.
- ✅ **Upload Foto** — `components/upload/UploadFlow.jsx`: input `accept="image/*" capture="environment"` (kamera mobile / file desktop), preview object URL, kompresi canvas (max 1280px, JPEG 0.8, selalu di bawah 5 MB), error file non-gambar, tombol "Kenali dengan AI" + "Pilih Ulang", catatan singkat opsional.
- ✅ **State "Memproses AI" gabungan** — `AiProcessing.jsx`: SATU layar loading (checklist progresif 3 langkah + progress bar + pesan tunggal) menutupi klasifikasi citra lalu ekstraksi teks; klasifikasi raw bytes → `POST /api/listings/klasifikasi` (octet-stream), kalau sukses lanjut `POST /api/listings/ekstraksi-teks` `{deskripsiUser, kategoriCitra, usiaBulan:0}`; kalau `gagal:true` ekstraksi dilewati → langsung review manual. Tidak ada dua spinner terpisah.
- ✅ **Review & Koreksi + Form Detail satu layar (live preview)** — `ReviewForm.jsx` (panel kiri: kategori + form; panel kanan: `ListingPreview.jsx` sticky yang live-update): picker 12 kategori (label model persis dikirim ke API, tampilan Indonesia via `constants.js`), badge "AI"/"Dikoreksi manual"/keyakinan %, judul wajib, deskripsi prefill hasil ekstraksi, jumlah+satuan (kg/karung/ton/unit), lokasi dari `profiles` (banner amber + tombol `/setup-lokasi` bila kosong, validasi koordinat), `expiredAt` opsional, POST body persis kontrak tanpa `user_id`.
- ✅ **DUA state pesan AI berbeda (wajib, tidak disamakan):**
  1. `gagal:true` → `Alert` merah: *"AI gagal mengenali foto ini. Pilih kategori secara manual untuk melanjutkan."* — tanpa kategori default, user wajib pilih.
  2. `gagal:false` + `perlu_koreksi_manual:true` (confidence < 60%) → banner amber: *"AI kurang yakin dengan hasil ini (confidence XX%). Periksa dan pilih kategori yang paling sesuai."* — kategori AI tetap terpilih & disorot oranye di picker.
- ✅ **Konfirmasi Sukses** — `SuksesUpload.jsx`: ikon cek, "Listing berhasil dipasang", info judul/kategori/jumlah+satuan, CTA "Upload Limbah Lagi" (reset flow) + "Buka Dashboard".
- ✅ **Edit Listing** — `app/upload/[id]/edit/page.js` + `EditFlow.jsx`: GET detail via `GET /api/listings/[id]`; status ≠ `tersedia` → panel "Listing ini tidak bisa diedit" (status ditampilkan); status `tersedia` → form review prefill (komponen sama) → `PATCH /api/listings/[id]` whitelist 9 field non-status (tidak pernah kirim `status`/field transaksi) → sukses + CTA `/home`.
- ✅ **Konfirmasi Hapus/Batalkan** — zona bahaya terpisah di halaman edit → `HapusModal.jsx` (modal konfirmasi, Escape/backdrop batal, busy state) → `DELETE /api/listings/[id]` → redirect `/home`; error 400 (status berubah) tampil di modal.
- ✅ **Storage upload pattern:** foto di-upload ke storage **saat tombol submit "Pasang Listing"** (bukan saat proses AI) supaya tidak ada file yatim di bucket; path `{userId}/{uuid}.jpg`, hasil `getPublicUrl` dikirim sebagai `foto[0].fotoUrl`.
- ✅ **Verifikasi:** `npm run build` **SUCCESS** (Next 16.3.0 Turbopack, 20 route + proxy: `/upload` & `/upload/[id]/edit` terdaftar); smoke HTTP live (`next start`): `/upload` → 307 `/login?next=%2Fupload`, `/upload/<id>/edit` → 307 `/login`, `/home` → 307 `/login?next=%2Fhome`, `/` → 200; eslint 0 issues; grep `dark:|bg-stone|text-leaf` di file upload = 0.

### Fase 4.4 & 4.5 — Frontend / UI (Cari Bahan + Detail Listing & Klaim) ✅

> Seluruh flow 4.4 (Cari) dan 4.5 (Detail/Klaim) dikerjakan `design-taste-frontend` di atas kontrak data Fase 3 yang sudah final. Tidak ada perubahan schema/RLS/RPC/API — semua status tetap hanya lewat endpoint RPC.

- ✅ **Flow Cari (`app/cari` + `components/cari/`)** — terhubung ke `POST /api/listings/cari` (`{kategoriKebutuhan, radiusKm, lokasiLat, lokasiLng, jumlahDibutuhkan}` → `hasil` terurut skor):
  - `constants.js` — 6 kategori kebutuhan persis dari `kategori_kecocokan` + `OPSI_LAINNYA` free-text manual (dengan hint hasil bisa kosong, karena pencocokan kategori persis).
  - `SearchForm.jsx` — dropdown kategori + "Lainnya (ketik manual)", slider radius 1-100 km (`.range-loop`, live label), input jumlah + satuan kg/karung/ton/unit, banner amber + tombol `/setup-lokasi` saat `lokasi_lat/lng` profil kosong (pencarian disabled).
  - `CariFlow.jsx` — auto-search saat mount + debounce 400 ms pada slider radius; status idle/memuat/siap/error; race-guard `seqRef` untuk tab ganda; error → `Alert` + "Coba Lagi".
  - `SkeletonHasil.jsx` — 6 shimmer card saat `memuat`.
  - `HasilKartu.jsx` — link ke `/listing/{id}?jarak={km}`; foto, judul, label kategori model vs Indonesia, badge jarak (`0.4 km`, `jarak` di-decimalComma dari API), badge skor "Cocok N%" (formatPersen), jumlah+satuan.
  - `DrawerSortFilter.jsx` — panel bawah (mobile) / samping (desktop): sort skor/jarak/volume + filter 12 kategori (checkbox); Escape/backdrop tutup; Terapkan/Reset; client-side saja (API sudah terurut skor, jarak dikirim sebagai info).
  - `EmptyState.jsx` — saran "Perluas radius" (sampai 100 km), "Ubah kategori kebutuhan" (scroll ke form), + catatan bahwa pencocokan kategori itu persis.
- ✅ **Flow Detail & Klaim (`app/listing/[id]` + `components/listing/` + `components/ui/Modal.jsx`)** — server component ambil listing + foto + pemilik + pengklaim, lalu render `DetailListing`:
  - Galeri thumbnails (foto dari storage), badge status (`tersedia` hijau / `dipesan` oranye / `selesai` abu / `dibatalkan` abu), kategori + badge AI/Dikoreksi manual + keyakinan %, jumlah/satuan, wilayah + jarak.
  - **Aturan tombol bisnis**: Amankan = `tersedia` && bukan pemilik; Selesaikan = `dipesan` && pemilik; Batalkan Klaim = `dipesan` && (pemilik || pengklaim), label "dari {nama}" vs "milikmu"; Laporkan = bukan pemilik (open ke `LaporModal`).
  - `KlaimModal.jsx` — fase konfirmasi → sukses menampilkan **kontak pemilik** (nama, `tel:` langsung ke `no_telepon`, alamat) + pesan "Klaim berhasil! Hubungi pemilik untuk mengambil bahan."
  - `SelesaiModal.jsx` / `BatalModal.jsx` — konfirmasi yang menandai transaksi selesai / batal via endpoint RPC.
  - `LaporModal.jsx` — alasan wajib → `POST /api/laporan` → state "Laporan terkirim".
  - Semua mutasi hanya lewat helper `components/listing/api.js` → `router.refresh()` (status tidak pernah di-set manual client-side).
  - `components/ui/Modal.jsx` — modal dasar bersama (a11y: role=dialog, aria-modal, Escape/backdrop kecuali busy, fokus panel saat buka via pola "adjust state when props change", mobile bottom sheet).
  - Deep-link logged-out: `/listing/<id>` → 307 `/login?next=%2Flisting%2F<id>` (guard prefix baru di `lib/supabase/proxy.js`).
- ✅ **Verifikasi:** `npm run build` **SUCCESS** (Next 16.3.0 Turbopack, **21 route** + proxy, `/listing/[id]` dinamis); `npm run lint` **0 error** (5 warning `no-img-element` lama dari `components/landing/*` — pra-ada, out of scope; `design_loop_link/**` folder referensi Figma di-ignore; pola `ref saat render` & `setState di effect` yang di-flag react-hooks v7 sudah di-refactor); grep `dark:|bg-stone|text-leaf` di file 4.4/4.5 = 0; deep-link guard 307 terverifikasi pattern proxy.

### Fase 4.6 & 4.7 — Frontend / UI (Manajemen Pribadi + Error & Edge Case) ✅

> Tanpa perubahan schema/RLS/RPC/API lagi — semua query langsung di Server Component (pola GET listing), mutasi hanya via client Supabase (+ 3 RPC via endpoint Fase 3). Guard login untuk 4 halaman baru ditambahkan ke `ALLOWED_NEXT` di `lib/supabase/proxy.js` (guard route lama tidak diubah).

- ✅ **`components/manajemen/constants.js`** — `STATUS_META` + `formatTanggal`/`formatTanggalWaktu` bersama (dipakai Listing Saya, Klaim Saya, Profil, Pengaturan — tanpa duplikasi).
- ✅ **Listing Saya (`/listing-saya`)** — `ListingSaya.jsx` tab **Semua / Tersedia / Dipesan / Selesai** (client-side filter, tanpa reload); setiap kartu (reusable `KartuListing.jsx`): foto, judul, badge status, badge AI (`confidence_score`) / "Dikoreksi manual" (`kategori_dikoreksi`), jumlah+satuan, tanggal pasang; tombol **Edit** hanya saat `tersedia` → `/upload/[id]/edit`; `dibatalkan` hanya muncul di tab Semua; **Kosong.jsx** empty state per tab.
- ✅ **Klaim Saya (`/klaim-saya`)** — pill ringkasan (Klaim aktif / Selesai / Dibatalkan); tracker 2 langkah (`TrackingKlaim`): langkah 1 "Diklaim" selalu, langkah 2 dinamis = **Menunggu pengambilan** (aktif) / **Selesai** (+ `diselesaikan_pada`) / **Dibatalkan** (+ tanggal); pesan status sesuai tipe. Riwayat dibatalkan dari `riwayat_klaim.status_akhir='dibatalkan'` + tarik listing per baris. **Edge case RLS:** listing seed berstatus `dibatalkan` (bukan hasil `cancel_claim` yang kembali `tersedia`) tidak terlihat pengklaim → dirender sebagai kartu riwayat ringkas (`listingHilang`) agar riwayat tidak hilang senyap.
- ✅ **Profil Saya (`/profil`)** — `ProfilForm.jsx` mode **Lihat** (default) ↔ **Edit** dalam satu halaman (toggle tombol); baris profil kosong (jalur konfirmasi email) → mulai langsung di mode Edit; simpan `profiles.upsert(payload, { onConflict: "id" })`; `status_akun` `blokir`/`nonaktif` → `redirect("/unauthorized")`; Prefill default sesi (`email`, `nama_lengkap`, `no_telepon`, `alamat`).
- ✅ **Pengaturan Akun (`/pengaturan`)** — `PengaturanForm.jsx` + `PengaturanPreview`: 3 kartu terpisah (Update Email & Nama / Ganti Sandi (min 8 karakter, verifikasi sandi lama, konfirmasi baru) / Logout Semua Sesi (`signOut({ scope: "global" })`)); notifikasi sukses per kartu.
- ✅ **Error & Edge Case** — `app/not-found.js` (404 custom: logo, "Error 404", "Halaman tidak ditemukan", CTA Beranda + Dashboard kalau login); `app/error.js` (error boundary, deteksi `fetch/network/connection` → "Koneksi ke server bermasalah", tombol `reset()` + Ke Beranda, kode digest); `/unauthorized` (`UnauthorizedActions.jsx`: Coba Lagi / Keluar & Masuk Ulang dengan `signOut` + redirect ke `/login`); dua state pesan AI **diverifikasi sudah tercakup di 4.3** (`ReviewForm.jsx` alertInfo `gagal` → pilih manual & `koreksi` saat confidence < 60%).
- ✅ **Navigasi** — `AppHeader.jsx` MENU_AKUN di dropdown avatar (Listing Saya / Klaim Saya / Profil / Pengaturan); nav utama tetap; `/home` menambahkan link halus "Kelola" → `/listing-saya`.
- ✅ **Verifikasi:** `npm run lint` **0 error** (5 warning pra-ada `components/landing/*`); `npm run build` **SUCCESS** (Next 16.3.0 Turbopack, **26 route**: `/listing-saya`, `/klaim-saya`, `/profil`, `/pengaturan`, `/unauthorized`, `/_not-found` terdaftar); smoke HTTP live (`next start`): belum login → 4 halaman 307 `/login?next=...`; sesi `budi@looplink.demo` → `/listing-saya` 200 (4 tab, 3 kartu, badge + Edit benar), `/klaim-saya` 200 (empty state benar), `/profil` 200, `/pengaturan` 200, `/unauthorized` 200, `/halaman-tak-ada` → 404 custom; sesi `rina@` (aktif + selesai) & `dewi@` (aktif + dibatalkan) → pill & tracker benar + fallback kartu riwayat tampil. **Ditemukan & diperbaiki saat smoke:** `IconPhone` tidak ada di `components/icons.jsx` → ganti `Phone` dari lucide-react (perbaiki bug `/profil` 500); typo kolom query riwayat (`diawarkan_pada` → `diklaim_pada`).

---

## Yang Sedang Dikerjakan / Setengah Jalan

### Fase 5 — Integrasi & Testing End-to-End ✅

- ✅ **Skenario 1 (Registrasi→lokasi→upload→AI→koreksi→tayang)** — akun baru (via admin API GoTrue, setara registrasi+konfirmasi) → profile+koordinat tersimpan → foto di-upload ke Storage bucket `listings` (RLS folder-sendiri lolos saat client pakai `setSession`) → klasifikasi endpoint 200; **live HF masih fallback (endpoint lama `api-inference...` sudah tidak dipakai; endpoint Router + model `google/vit-base-patch16-224` belum terverifikasi dari jaringan dev)** → state `gagal`/koreksi manual → listing 201 status `tersedia` + `kategori_dikoreksi=true` terverifikasi di DB.
- ✅ **Skenario 2 (Cari→terurut skor→detail→klaim→kontak)** — listing akun A muncul di hasil akun B (skor 0.84, jarak 16.1 km, terurut DESC), detail 200 + pemilik/nomor/alamat, klaim 200, setelah klaim status `dipesan` + `diklaim_oleh` + kontak pemilik tetap tampil.
- ✅ **Skenario 3 (Selesai oleh pemilik)** — non-pemilik ditolak 400; pemilik 200; status `selesai`; `riwayat_klaim` berisi `status_akhir='selesai'` + `diselesaikan_pada`; listing selesai tidak muncul lagi di pencarian.
- ✅ **Skenario 4 (Batal dua sisi)** — batal oleh pengklaim → `listings.dibatalkan_oleh=id_pengklaim`; batal oleh pemilik → `dibatalkan_oleh=id_pemilik`; keduanya menulis `riwayat_klaim.status_akhir='dibatalkan'` + listing kembali `tersedia`.
- ✅ **Skenario 5 (Tanpa tombol klaim untuk listing sendiri)** — API `POST klaim` listing sendiri → 400 (pesan RPC); DOM SSR halaman `/listing/[id]` sebagai pemilik → tidak ada teks "Amankan" + ada pesan "Ini listingmu"; kontrol bukan-pemilik → tombol tampil.
- ✅ **Skenario 6 (Radius)** — listing Jakarta (jarak 665.8 km) tidak muncul di radius 10 km, muncul di radius 1000 km; jarak Haversine masuk akal.
- ✅ **Skenario 7 (Mobile)** — Chrome headless + CDP (viewport 390×844, DPR 3): 11 halaman (landing, login, home, cari, upload, setup-lokasi, listing-saya, klaim-saya, profil, pengaturan, detail) **tanpa overflow horizontal** (scroll=390/390) + tombol Amankan tampil untuk non-pemilik. Screenshot di `/tmp/looplink-mobile-*.png`.
- 🧹 **Perbaikan test (bukan bug aplikasi):** 4 asersi awal di script test salah ekspektasi schema → (1) `riwayat_klaim` sengaja hanya mencatat status terminal `('selesai','dibatalkan')` (migration 002) sehingga klaim aktif diverifikasi via `listings.status`/`diklaim_oleh`; (2) kolom `dibatalkan_oleh` ada di `listings`, bukan `riwayat_klaim`; (3) upload storage perlu `setSession` di client test; (4) deteksi tombol "Amankan" via query DOM (bukan substring 120 char pertama).

### Fase 2 — sisa verifikasi live (opsional, tidak menahan fase berikutnya)

| Task | Status | Blocker |
|---|---|---|
| Test klasifikasi 5-10 foto contoh + catat akurasi kasar (TASKS.md Fase 2) | Belum — 2 foto siap di `scripts/fixtures/`, jalur sukses belum terverifikasi | Endpoint lama sudah tidak dipakai; verifikasi live `google/vit-base-patch16-224` via Router + pemetaan `PEMETAAN_LABEL_IMAGENET` dari jaringan lain |

---

## Task Berikutnya

### Fase 6 — Deployment — BERIKUTNYA

Fase 5 (Integrasi & Testing End-to-End) **selesai** — 31 PASS E2E API + 14 PASS mobile, tanpa bug aplikasi, checklist TASKS.md Fase 5 sudah ter-centang. Lanjutkan ke **Fase 6**: deploy frontend ke Vercel, pasang env production, jalankan migration & seed di production, test ulang alur di production, logo UKM Triple-C/TCC/Jack 2026, cek performa koneksi lambat. Sisa opsional: verifikasi klasifikasi HuggingFace live dari jaringan lain (blocker DNS dev — hitung juga efeknya di production, karena HF dipanggil dari server & production berada di jaringan berbeda).

### Prasyarat untuk Fase 4.6 onward

- [x] Fase 1 Database — selesai & ter-apply (termasuk migration 011 storage `listings`)
- [x] Fase 2 AI/ML — modul `lib/ai/` siap
- [x] Fase 3 Backend — 9 endpoint siap + terbukti lewat smoke test; akun seed bisa login untuk demo
- [x] Fase 4.1 Publik & Onboarding — Landing, Auth, Setup Lokasi, guard route
- [x] Fase 4.2 Home/Dashboard — `/home`, placeholder `/upload` & `/cari`
- [x] Fase 4.3 Upload Limbah — flow lengkap `/upload` + edit + hapus
- [x] Fase 4.4 Cari Bahan — `/cari` (form, hasil + skeleton, sort/filter, empty state)
- [x] Fase 4.5 Detail Listing & Klaim — `/listing/[id]` + modal klaim/selesai/batal/lapor
- [x] Fase 4.6 Manajemen Pribadi — `/listing-saya`, `/klaim-saya`, `/profil`, `/pengaturan`
- [x] Fase 4.7 Error & Edge Case — 404 custom, `error.js`, `/unauthorized`, state AI terverifikasi (tercakup di 4.3)
- [ ] Verifikasi live klasifikasi HuggingFace dari jaringan lain (opsional)

### Setelah Fase 4

- Fase 5 — Integrasi & Testing End-to-End
- Fase 6 — Deployment (Vercel + env production)
- Fase 7 — Persiapan Demo & Presentasi

---

*Bagian dari dokumentasi Spec-Driven Development (SDD) project LoopLink — pelacak progres lintas fase.*
