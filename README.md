# LoopLink — Bursa Pertukaran Limbah Hiper-Lokal

![Next.js](https://img.shields.io/badge/Next.js-16.3.0-black) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8) ![Supabase](https://img.shields.io/badge/Supabase-Postgres%2FAuth%2FRLS-3ecf8e) ![HuggingFace](https://img.shields.io/badge/HuggingFace-waste--classification-ffd21e) ![Gemini](https://img.shields.io/badge/Gemini-1.5_Flash-4285f4)

> Proyek pengembangan aplikasi untuk **Trunodjoyo Creative Competition 2026 — Vibe Code**.
> Platform digital yang menghubungkan **penghasil limbah** dan **pencari bahan baku** dalam satu ekosistem — siapa pun bisa mengubah sampahnya menjadi sumber daya bagi orang lain.

---

## Daftar Isi

1. [Tentang Project](#tentang-project)
2. [Fitur Utama](#fitur-utama)
3. [Alur Inti Aplikasi](#alur-inti-aplikasi)
4. [Tech Stack](#tech-stack)
5. [Arsitektur Sistem](#arsitektur-sistem)
6. [Struktur Folder](#struktur-folder)
7. [Database & Schema](#database--schema)
8. [Aturan Bisnis](#aturan-bisnis)
9. [AI & Machine Learning](#ai--machine-learning)
10. [API Endpoint](#api-endpoint)
11. [Halaman Frontend](#halaman-frontend)
12. [Design System](#design-system)
13. [Setup Lokal](#setup-lokal)
14. [Akun Demo](#akun-demo)
15. [Testing](#testing)
16. [Deployment](#deployment)
17. [Roadmap](#roadmap)
18. [Dokumentasi Terkait](#dokumentasi-terkait)
19. [Lisensi](#lisensi)

---

## Tentang Project

**LoopLink** adalah bursa pertukaran limbah **hiper-lokal**: platform yang mempertemukan orang yang **memiliki limbah** (rumah tangga, toko, UMKM, industri) dengan orang yang **membutuhkan bahan baku** (pabrik daur ulang, peternak, penggiat kompos, kolektor). Tujuannya sederhana — sampah satu pihak adalah bahan baku pihak lain, dan keduanya bertemu berdasarkan **jarak** dan **kategori**.

### Konsep Kunci

- **Satu jenis akun untuk semua user.** Tidak ada role terpisah "penjual" dan "pembeli". Siapa pun yang login bisa meng-upload limbah **dan** mencari bahan — peran ditentukan oleh tindakan, bukan tipe akun.
- **AI membantu, manusia yang memutuskan.** Foto limbah diklasifikasikan otomatis oleh model computer vision, tetapi user selalu bisa mengoreksi hasilnya — terutama saat confidence AI rendah.
- **Matching berbasis aturan, bukan tebak-tebakan.** Skor kecocokan dihitung dari tabel eksplisit `kategori_kecocokan`, jarak Haversine, dan volume — bukan sentence embedding. Alasannya transparan dan bisa dijelaskan.

> ⚠️ **Status project:** Fase 0–5 selesai (setup → database → AI/ML → backend → frontend → E2E testing). Fase 6 (deployment) dan Fase 7 (persiapan demo) belum dikerjakan. Detail progres: [`PROGRESS.md`](PROGRESS.md).

---

## Fitur Utama

### Untuk Publik
- **Landing page** — cerita produk, fitur, kategori limbah, listing terbaru, testimoni, FAQ, CTA.
- **Autentikasi lengkap** — login, register, lupa password, reset password (via Supabase Auth).

### Flow Upload Limbah
- **Upload foto** — capture kamera di mobile / pilih file di desktop, otomatis dikompresi (max 1280px, JPEG 0.8, < 5 MB).
- **Proses AI gabungan** — satu layar loading untuk klasifikasi citra + ekstraksi teks deskripsi.
- **Review & koreksi** — kategori hasil AI bisa dikoreksi manual; dua state pesan berbeda (gagal total vs confidence < 60%).
- **Live preview** — form detail listing dengan pratinjau kartu yang update real-time.
- **Edit & hapus** — hanya untuk listing berstatus `tersedia`.

### Flow Cari Bahan
- **Form pencarian** — kategori kebutuhan (6 opsi + free-text), slider radius 1–100 km, jumlah dibutuhkan.
- **Hasil terurut skor** — skeleton loading, sort/filter dalam drawer, empty state dengan saran.
- **Detail listing** — galeri foto, badge status, skor AI, info pemilik, tombol klaim/lapor.
- **Klaim** — konfirmasi → kontak pemilik langsung tampil setelah berhasil.
- **Selesaikan / Batalkan** — selesaikan hanya oleh pemilik; batalkan oleh kedua pihak.

### Manajemen Pribadi
- **Listing Saya** — tab Semua / Tersedia / Dipesan / Selesai.
- **Klaim Saya** — tracker status 2 langkah + riwayat.
- **Profil Saya** — mode lihat ↔ edit.
- **Pengaturan Akun** — ubah email/nama, ganti sandi, logout semua sesi.

### Keamanan & Error Handling
- Row Level Security (RLS) di seluruh tabel.
- Perubahan status listing **wajib** lewat Postgres RPC `SECURITY DEFINER`.
- Halaman 404 custom, error boundary, dan halaman unauthorized.

---

## Alur Inti Aplikasi

```
┌──────────┐    ┌───────────────────┐    ┌────────────────┐    ┌──────────────┐
│  Upload  │───▶│ AI Klasifikasi    │───▶│ Review &       │───▶│ Listing      │
│  Foto    │    │ (waste-classifica-│    │ Koreksi Manual │    │ Tayang       │
│  Limbah  │    │  tion)            │    │ + Detail       │    │ (tersedia)   │
└──────────┘    └───────────────────┘    └────────────────┘    └──────┬───────┘
                                                                     │
┌──────────────┐    ┌───────────────────┐    ┌────────────────┐      │
│ Transaksi    │◀───│ Klaim             │◀───│ Skor Kecocokan │◀─────┘
│ Selesai/Batal│    │ (kontak pemilik)  │    │ (rule-based)   │   User lain
└──────────────┘    └───────────────────┘    └────────────────┘   cari bahan
```

**Langkah detail:**

1. **Upload foto limbah** — user memotret/memilih foto limbah.
2. **AI klasifikasi citra** — model `watersplash/waste-classification` (HuggingFace) menebak 1 dari 12 kategori limbah.
3. **Koreksi manual** — kalau confidence < 60% (`perlu_koreksi_manual: true`) atau klasifikasi gagal, user memilih kategori sendiri; Gemini 1.5 Flash membantu mengekstrak kondisi & catatan dari deskripsi bebas.
4. **Listing tayang** — status `tersedia`, terlihat oleh user lain.
5. **Pencarian** — user lain mencari bahan dengan kategori kebutuhan + radius; sistem menghitung **skor kecocokan** untuk tiap listing dalam radius.
6. **Klaim** — user mengklaim listing (tidak bisa mengklaim milik sendiri); status jadi `dipesan`; kontak pemilik tampil.
7. **Selesaikan / Batalkan** — pemilik menandai `selesai`, atau salah satu pihak membatalkan (`dibatalkan_oleh` tercatat).

---

## Tech Stack

| Lapisan | Teknologi | Catatan |
|---|---|---|
| **Frontend** | Next.js 16.3.0 (App Router, JavaScript), React 19 | Turbopack, server & client components |
| **Styling** | Tailwind CSS v4 + `@tailwindcss/postcss` | Design token `loop-*` di `app/globals.css` |
| **Ikon** | lucide-react | |
| **Database** | Supabase (PostgreSQL) | RLS aktif, migration di `supabase/migrations/` |
| **Auth** | Supabase Auth (email/password) | Pola `@supabase/ssr` |
| **Storage** | Supabase Storage | Bucket publik `listings` (foto listing) |
| **Computer Vision** | HuggingFace Inference API — `watersplash/waste-classification` | 12 kelas, threshold confidence 0.6 |
| **Generative AI** | Gemini 1.5 Flash (alias `gemini-flash-latest`) | Ekstraksi kondisi & catatan deskripsi |
| **Matching** | Rule-based (Haversine + tabel skor) | **Tanpa** sentence embedding |

---

## Arsitektur Sistem

```
Browser (React)
    │
    ├── Supabase Auth (cookie sesi) ──────────────▶ Supabase (Postgres + RLS)
    ├── Supabase Storage ──────────────────────────▶ Bucket `listings` (foto)
    │
    └── API Routes Next.js (app/api)
            │
            ├── lib/ai/klasifikasi.js ────────────▶ HuggingFace (waste-classification)
            ├── lib/ai/ekstraksi.js ──────────────▶ Gemini 1.5 Flash
            ├── lib/ai/matching.js ───────────────▶ Haversine + skor rule-based
            ├── lib/supabase/server.js ───────────▶ Client sesi user (RLS aktif)
            ├── lib/supabase/admin.js ────────────▶ Client service-role (server-only)
            └── supabase.rpc(...) ────────────────▶ claim/complete/cancel (SECURITY DEFINER)
```

**Pola penting:**

- **Semua perubahan status listing** (`dipesan`/`selesai`/`dibatalkan`) **tidak pernah** lewat `UPDATE` langsung dari client — kolom status sudah di-`REVOKE` dari role `authenticated`. Wajib lewat RPC `claim_listing` / `complete_listing` / `cancel_claim` (migration 04–05).
- **`user_id` / `pelapor_id` selalu diambil dari session** di server, bukan dari body request — body palsu diabaikan.
- **Service-role client (`lib/supabase/admin.js`) server-only** — hanya dipakai menulis `riwayat_pencarian`/`riwayat_pencarian_hasil` (tabel tanpa policy INSERT). Dilarang di-import dari client.
- **Fallback AI wajib** — kalau HuggingFace/Gemini timeout/gagal, endpoint tetap mengembalikan 200 dengan `gagal: true`, bukan error 500. UI mengarahkan ke pemilihan manual.

---

## Struktur Folder

```
project/
├── app/                        # Route Next.js (App Router)
│   ├── page.js                 # Landing page
│   ├── login/ register/ lupa-password/ reset-password/
│   ├── setup-lokasi/           # Onboarding lokasi (GPS + fallback manual)
│   ├── home/                   # Dashboard
│   ├── upload/                 # Flow upload limbah
│   │   └── [id]/edit/          # Edit listing
│   ├── cari/                   # Flow cari bahan
│   ├── listing/[id]/           # Detail listing + klaim
│   ├── listing-saya/ klaim-saya/ profil/ pengaturan/
│   ├── unauthorized/           # Akses ditolak
│   ├── not-found.js            # 404 custom
│   ├── error.js                # Error boundary
│   └── api/                    # API Routes
│       ├── listings/
│       │   ├── route.js                    # POST buat listing
│       │   ├── klasifikasi/                # POST klasifikasi citra
│       │   ├── ekstraksi-teks/             # POST ekstraksi Gemini
│       │   ├── cari/                       # POST pencarian + scoring
│       │   └── [id]/
│       │       ├── route.js                # GET/PATCH/DELETE
│       │       ├── klaim/ selesai/ batal/
│       └── laporan/route.js
├── components/                 # Komponen React
│   ├── upload/                 # Flow upload (UploadFlow, AiProcessing, ReviewForm…)
│   ├── cari/                   # Flow cari (SearchForm, HasilKartu, DrawerSortFilter…)
│   ├── listing/                # Detail + modal (KlaimModal, SelesaiModal, BatalModal…)
│   ├── manajemen/              # Listing Saya, Klaim Saya, Profil, Pengaturan
│   ├── landing/                # Section landing page
│   ├── auth/                   # AuthShell
│   └── ui/                     # Button, Modal, Inputs
├── lib/
│   ├── ai/
│   │   ├── klasifikasi.js      # HuggingFace waste-classification
│   │   ├── ekstraksi.js        # Gemini 1.5 Flash
│   │   └── matching.js         # Haversine + skor rule-based
│   ├── api/validasi-listing.js # Validasi terpusat
│   └── supabase/
│       ├── client.js           # Browser client
│       ├── server.js           # Server client (cookies)
│       ├── admin.js            # Service-role (server-only!)
│       └── proxy.js            # Middleware refresh sesi + guard route
├── supabase/
│   ├── migrations/             # 11 file migration SQL
│   └── seed.sql                # Seed data demo
├── scripts/                    # Test & utility scripts
│   ├── test-matching.mjs       # 20 test matching
│   ├── test-ekstraksi.mjs      # 11 test ekstraksi
│   ├── test-klasifikasi.mjs    # 15 test klasifikasi
│   ├── smoke-test-api.mjs      # Smoke test E2E API
│   ├── e2e-fase5.mjs           # E2E skenario S1–S6
│   ├── e2e-mobile.mjs          # E2E mobile (viewport 390×844)
│   ├── verify-gap-schema.mjs   # Verifikasi fix schema
│   └── load-env.mjs            # Loader .env.local untuk node
├── docs/
│   ├── api-endpoints.md        # Dokumentasi API + contoh curl
│   └── migrasi-ui-kanon.md     # Catatan migrasi UI
├── design_loop_link/           # Referensi design Figma (Vite playground)
├── proxy.js                    # Middleware Next.js (refresh sesi)
└── .env.local.example          # Template environment variables
```

---

## Database & Schema

Semua migration idempotent-safe (`create if not exists`, `drop policy if exists`) — aman dijalankan ulang. Ada **11 migration**:

| Migration | Isi |
|---|---|
| `001_tabel_inti` | `profiles`, `listings`, `listing_photos`, `kategori_kecocokan` + trigger `set_updated_at` |
| `002_tabel_pendukung` | `riwayat_klaim`, `laporan`, `riwayat_pencarian`, `riwayat_pencarian_hasil` |
| `003_rls_policies` | RLS aktif di 8 tabel + 21 policy |
| `004_revoke_status_update` | `REVOKE UPDATE` kolom `status`/`diklaim_oleh`/`diklaim_pada`/`dibatalkan_oleh` dari client |
| `005_rpc_functions` | `claim_listing`, `complete_listing`, `cancel_claim` (SECURITY DEFINER) |
| `006_indexes` | `idx_listings_lokasi` (lat+lng), `idx_listings_status` |
| `007_perbaikan_keamanan` | Fix `search_path` `set_updated_at` + revoke EXECUTE `anon` pada 3 RPC |
| `008_perbaikan_seed_login` | Fix login akun demo seed (`instance_id` + kolom token) |
| `009_perbaikan_visibilitas_pengklaim` | Policy SELECT agar pengklaim bisa melihat listing yang diklaim |
| `010_perbaikan_fk_cascade` | FK anak `listings` → `ON DELETE CASCADE` |
| `011_storage_listings` | Bucket storage publik `listings` + 4 policy |

### Tabel Inti

**`profiles`** — profil user, `id` = `auth.users.id` (bukan tabel user custom).
`nama_lengkap`, `no_telepon`, `alamat_teks`, `lokasi_lat`, `lokasi_lng`, `status_akun` (`aktif`/`nonaktif`/`diblokir`), `is_admin`.

**`listings`** — postingan limbah.
`user_id`, `judul`, `kategori_citra` (12 kelas model, label asli — tidak dinormalisasi), `kategori_dikoreksi`, `confidence_score`, `deskripsi_teks`, `jumlah`, `satuan` (`kg`/`karung`/`ton`/`unit`), `lokasi_lat`, `lokasi_lng`, `status` (`tersedia`/`dipesan`/`selesai`/`dibatalkan`), `diklaim_oleh`, `diklaim_pada`, `dibatalkan_oleh`, `expired_at`.

**`listing_photos`** — foto listing (URL ke Supabase Storage).
`listing_id` (FK CASCADE), `foto_url`, `urutan`.

**`kategori_kecocokan`** — tabel referensi matching rule-based (bukan hasil training).
`kategori_limbah`, `kategori_kebutuhan`, `skor_dasar` (0–1). Unique per pasangan.

### Tabel Pendukung (GTM)

- **`riwayat_klaim`** — log transaksi immutable; baris **hanya** dibuat lewat RPC (`status_akhir` ∈ `selesai`/`dibatalkan`).
- **`laporan`** — pelaporan listing bermasalah; `status` ∈ `menunggu`/`ditinjau`/`selesai` (admin).
- **`riwayat_pencarian`** + **`riwayat_pencarian_hasil`** — log pencarian dan hasilnya (ditulis via service-role).

### RLS Policies (ringkasan 21 policy)

| Tabel | Kebijakan utama |
|---|---|
| `profiles` | SELECT semua authenticated; INSERT/UPDATE hanya diri sendiri; tanpa DELETE (soft delete via `status_akun`) |
| `listings` | SELECT publik hanya `tersedia` **atau** milik sendiri **atau** pengklaim (`diklaim_oleh`); INSERT/UPDATE pemilik; DELETE pemilik + `tersedia` |
| `listing_photos` | SELECT mengikuti visibilitas listing induk; INSERT/UPDATE/DELETE pemilik |
| `riwayat_klaim` | SELECT hanya pemilik/pengklaim terkait; tanpa INSERT/UPDATE/DELETE |
| `laporan` | SELECT pelapor sendiri/admin; INSERT pelapor sendiri; UPDATE admin |
| `kategori_kecocokan` | SELECT publik; INSERT/UPDATE/DELETE admin |
| `riwayat_pencarian(_hasil)` | SELECT pencari terkait; INSERT via service-role |
| Storage `listings` | SELECT publik; INSERT/UPDATE/DELETE authenticated + folder wajib `{auth.uid()}` |

### RPC Functions (SECURITY DEFINER)

Semua RPC `set search_path = public`, EXECUTE hanya untuk `authenticated` (bukan `anon`):

| Function | Caller | Aksi |
|---|---|---|
| `claim_listing(p_listing_id)` | Pengklaim | `tersedia` → `dipesan`; tolak kalau listing sendiri |
| `complete_listing(p_listing_id)` | Pemilik | `dipesan` → `selesai`; tulis `riwayat_klaim` |
| `cancel_claim(p_listing_id)` | Pemilik atau pengklaim | `dipesan` → `tersedia`; catat `dibatalkan_oleh`; tulis `riwayat_klaim` |

---

## Aturan Bisnis

Keputusan bisnis yang sudah final — jangan diubah tanpa konfirmasi:

1. **Penyelesaian transaksi dipicu pemilik listing**, bukan konfirmasi dua arah.
2. **Pembatalan klaim bisa dilakukan kedua pihak**, tercatat siapa yang membatalkan (`dibatalkan_oleh`).
3. **Penolakan izin lokasi wajib punya fallback input alamat manual** (form manual selalu tampil).
4. **Confidence score AI < ~60% memicu state "koreksi manual"** — beda dari kegagalan total (keduanya punya pesan UI berbeda).
5. **Perubahan status listing (klaim/selesai/batal) wajib lewat Postgres RPC** (`SECURITY DEFINER`) — tidak boleh lewat UPDATE langsung dari client.
6. **User tidak bisa mengklaim listing miliknya sendiri.**
7. **Matching memakai tabel eksplisit `kategori_kecocokan`** (rule-based), **bukan** sentence embedding.
8. Listing sendiri **tidak muncul** di hasil pencarian; listing di luar radius **tidak muncul**.

---

## AI & Machine Learning

Semua modul AI ada di `lib/ai/`, dengan kontrak respons yang stabil untuk endpoint.

### 1. Klasifikasi Citra — `lib/ai/klasifikasi.js`

- Memanggil HuggingFace Inference API: `watersplash/waste-classification`.
- **12 kelas model:** `Battery`, `Biological`, `Brown-glass`, `Cardboard`, `Clothes`, `Green-glass`, `Metal`, `Paper`, `Plastic`, `Shoes`, `Trash`, `White-glass`.
- **Threshold confidence 0.6** (`CONFIDENCE_THRESHOLD`) → `perlu_koreksi_manual: true` di bawah itu.
- **Timeout 10 detik** (`AbortSignal.timeout`) — tidak pernah melempar error mentah.
- Kontrak: sukses → `{ kategori, confidence, perlu_koreksi_manual, peringkat, gagal: false }`; gagal → `{ kategori: null, confidence: 0, perlu_koreksi_manual: true, gagal: true, alasan_gagal }`.

> ⚠️ **Keterbatasan tercatat:** DNS `api-inference.huggingface.co` tidak resolve dari jaringan dev — jalur sukses live belum terverifikasi (jalur fallback sudah tervalidasi penuh via mock). 2 foto contoh di `scripts/fixtures/`.

### 2. Ekstraksi Teks — `lib/ai/ekstraksi.js`

- Memanggil **Gemini 1.5 Flash** (alias resmi `gemini-flash-latest` — `gemini-1.5-flash` sudah 404 di API v1beta, deviasi terdokumentasi).
- Input: `{ deskripsiUser, kategoriCitra, usiaBulan }`; output JSON `{ kondisi, catatan_tambahan }`.
- Timeout 10 detik, sanitasi input, fallback `{ kondisi: "tidak diketahui", catatan_tambahan: "", gagal: true }`.
- Deskripsi bersifat **opsional** — kalau gagal, listing tetap bisa dibuat.

### 3. Skor Kecocokan — `lib/ai/matching.js`

Dua fungsi **pure** (tanpa I/O → tanpa timeout), `throw`-free:

**`hitungJarakKm(lat1, lng1, lat2, lng2)`** — jarak great-circle **Haversine** (R = 6371 km), clamp presisi floating point.

**`hitungSkorKecocokan({...})`** — formula:

```
skor_akhir = (skor_kecocokan_kategori × 0.5) + (skor_jarak × 0.3) + (skor_volume × 0.2)
```

- `skor_kecocokan_kategori` — dari tabel `kategori_kecocokan`; tidak ada pasangan → 0 (tidak cocok).
- `skor_jarak = max(0, 1 − jarakKm/radiusKm)`.
- `skor_volume = min(1, jumlahTersedia/jumlahDibutuhkan)`.
- Hasil di-clamp ke [0, 1]; skor 0 dibuang dari hasil pencarian.

**Kenapa tidak pakai embedding?** Kategori limbah (12 kelas citra) dan kebutuhan pencari (dropdown) sama-sama berasal dari himpunan tetap, jadi kecocokan didefinisikan eksplisit lewat tabel aturan — transparan, bisa dijelaskan ke juri, tanpa model tambahan yang "menerka" makna teks.

---

## API Endpoint

Base URL (dev): `http://localhost:3000`. Semua response JSON; error bentuk `{ "error": "pesan bahasa Indonesia" }`. Autentikasi lewat **cookie sesi Supabase** (bukan token di body). Dokumentasi lengkap + contoh curl: [`docs/api-endpoints.md`](docs/api-endpoints.md).

| Method & Path | Auth | Deskripsi |
|---|---|---|
| `POST /api/listings/klasifikasi` | 🔒 | Klasifikasi foto limbah (raw bytes / JSON base64) |
| `POST /api/listings/ekstraksi-teks` | 🔒 | Ekstraksi kondisi & catatan via Gemini |
| `POST /api/listings` | 🔒 | Buat listing (`user_id` dari session) |
| `GET /api/listings/[id]` | ⭕ | Detail listing (kontak pemilik hanya kalau login) |
| `PATCH /api/listings/[id]` | 🔒 pemilik | Edit listing — whitelist field non-status (kirim `status` → 400) |
| `DELETE /api/listings/[id]` | 🔒 pemilik | Hapus listing — hanya status `tersedia` |
| `POST /api/listings/cari` | 🔒 | Pencarian + skor kecocokan + simpan riwayat |
| `POST /api/listings/[id]/klaim` | 🔒 | Klaim listing (RPC `claim_listing`) |
| `POST /api/listings/[id]/selesai` | 🔒 pemilik | Selesaikan transaksi (RPC `complete_listing`) |
| `POST /api/listings/[id]/batal` | 🔒 kedua pihak | Batalkan klaim (RPC `cancel_claim`) |
| `POST /api/laporan` | 🔒 | Lapor listing bermasalah (`pelapor_id` dari session) |

**Kode status:** `401` belum login · `400` validasi/RPC menolak · `403` bukan pemilik · `404` tidak ditemukan/tidak terlihat (RLS) · `500` error server.

---

## Halaman Frontend

26 route (build SUCCESS), semua halaman ber-label 🔒 diproteksi guard route (redirect 307 → `/login?next=...`).

| Route | Keterangan |
|---|---|
| `/` | Landing page |
| `/login` · `/register` | Masuk / daftar (register kumpulkan `nama_lengkap` + upsert `profiles`) |
| `/lupa-password` · `/reset-password` | Lupa & reset password |
| `/setup-lokasi` 🔒 | Setup lokasi awal (GPS + reverse geocode + **fallback alamat manual wajib**) |
| `/home` 🔒 | Dashboard — dua aksi utama: Upload Limbah & Cari Bahan |
| `/upload` 🔒 | Flow upload: foto → proses AI → review & koreksi → sukses |
| `/upload/[id]/edit` 🔒 | Edit listing (hanya `tersedia`) + hapus |
| `/cari` 🔒 | Form pencarian + hasil + sort/filter drawer |
| `/listing/[id]` 🔒 | Detail listing + klaim/selesaikan/batalkan/lapor |
| `/listing-saya` 🔒 | Tab Semua/Tersedia/Dipesan/Selesai |
| `/klaim-saya` 🔒 | Tracker status klaim + riwayat |
| `/profil` 🔒 | Profil lihat ↔ edit |
| `/pengaturan` 🔒 | Update email/nama, ganti sandi, logout semua sesi |
| `/unauthorized` 🔒 | Akses ditolak (akun `blokir`/`nonaktif`) |
| 404 · error | Halaman error custom |

---

## Design System

Port 1:1 dari design Figma (`design_loop_link/`) — **fixed light, tanpa dark mode**.

### Warna (token Tailwind `loop-*`)

| Token | Nilai | Pemakaian |
|---|---|---|
| `--color-loop-base` | `#F6F3EA` | Latar utama (cream) |
| `--color-loop-ink` | `#1C2B22` | Teks utama / section gelap |
| `--color-loop-primary` | `#3C7A5C` | Emerald utama (hijau) |
| `--color-loop-signal` | `#E8752C` | Orange aksen / CTA |
| `--color-loop-mist` | `#DCE3D3` | Kartu / background sekunder |
| `--color-loop-line` | `#8C9184` | Teks sekunder / border |
| `--color-loop-mint` | `#6BBA91` | Teks aksen di atas gelap |
| `--color-loop-dark` | `#111A14` | Footer ekstrem gelap |
| `--color-loop-purple` | `#9B6B9B` | Aksen kategori tekstil |

### Tipografi

- **Fraunces** — display / judul (via `next/font/google`)
- **Inter** — body text
- **IBM Plex Mono** — mono / data

### Gaya khas

Navbar glass pill, blob + kartu float di hero, wave divider, badge live, ikon `lucide-react`.

---

## Setup Lokal

### Prasyarat

- Node.js ≥ 18
- Akun Supabase (project aktif) — atau Supabase CLI untuk local dev
- API key HuggingFace (Read permission) — https://huggingface.co/settings/tokens
- API key Google AI Studio (Gemini) — https://aistudio.google.com/apikey

### 1. Install dependency

```bash
npm install
```

### 2. Environment variables

```bash
cp .env.local.example .env.local
```

Isi nilainya:

| Variabel | Diisi dari | Keterangan |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Dashboard Supabase → Settings → API | URL project |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Dashboard Supabase → Settings → API | Key publik (aman di browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | Dashboard Supabase → Settings → API | ⚠️ **Server-only**, jangan pernah bocor ke browser |
| `HF_API_TOKEN` | huggingface.co/settings/tokens | Token Inference API |
| `GEMINI_API_KEY` | aistudio.google.com/apikey | API key Gemini |

> ⚠️ `.env.local` sudah di-`.gitignore` — jangan pernah commit. Tidak ada API key yang ter-hardcode di kode.

### 3. Setup database

**Cara A — Supabase CLI (local/remote):**

```bash
supabase db reset        # menjalankan migration 001–011 + seed.sql berurutan
```

**Cara B — Manual (SQL Editor di dashboard Supabase):**

1. Jalankan 11 file migration dari `supabase/migrations/` secara berurutan (001 → 011) di SQL Editor.
2. Jalankan seluruh isi `supabase/seed.sql` sekali (login sebagai role postgres / service role).

### 4. Jalankan dev server

```bash
npm run dev
```

Buka http://localhost:3000

### Scripts lain

```bash
npm run build       # production build
npm run start       # jalankan hasil build
npm run lint        # eslint
```

---

## Akun Demo

Seed data menyediakan **6 akun** (password semua: `looplink123`), tersebar di Surabaya, Sidoarjo, Gresik, dan Bangkalan — supaya skor jarak pada matching terlihat beda saat demo:

| Email | Nama | Lokasi | Catatan |
|---|---|---|---|
| `admin@looplink.demo` | Admin LoopLink | Surabaya Pusat | `is_admin = true` |
| `budi@looplink.demo` | Budi Santoso | Surabaya Timur | Punya karton & plastik |
| `sari@looplink.demo` | Sari Wijaya | Sidoarjo | Sisa sayur (kompos) |
| `agus@looplink.demo` | Agus Pratama | Gresik | Besi tua & kardus |
| `dewi@looplink.demo` | Dewi Lestari | Bangkalan | Pakaian bekas |
| `rina@looplink.demo` | Rina Kartika | Surabaya Barat | Kertas & kaca |

**Data demo:** 10 listing (7 `tersedia`, 2 `dipesan`, 1 `selesai`, 1 `dibatalkan` — termasuk 1 contoh `perlu_koreksi_manual` dengan confidence 0.55), 10 foto, 2 riwayat klaim, 7 baris `kategori_kecocokan`.

**Skenario demo cepat:** login `budi@looplink.demo` → upload limbah kardus → login `sari@looplink.demo` → cari "Bahan baku daur ulang kertas" radius 30 km → klaim listing kardus Budi → kontak tampil → login Budi → selesaikan transaksi.

---

## Testing

Semua script berjalan dengan `node <file>` (tanpa framework tambahan). Untuk script yang butuh env, pakai `scripts/load-env.mjs`.

| Script | Isi | Hasil tercatat |
|---|---|---|
| `scripts/test-matching.mjs` | 20 test fungsi matching (Haversine, skor, clamp, guard) | 20 PASS |
| `scripts/test-ekstraksi.mjs` | 11 test ekstraksi Gemini (termasuk call live) | 11 PASS |
| `scripts/test-klasifikasi.mjs` | 15 test klasifikasi (sukses mock, threshold, timeout, input invalid) | 15 PASS, 2 WARN |
| `scripts/smoke-test-api.mjs` | Smoke test E2E via HTTP untuk 9 endpoint | 34 PASS |
| `scripts/e2e-fase5.mjs` | E2E skenario S1–S6 (registrasi→upload→klaim→selesai→batal→radius) | 31 PASS |
| `scripts/e2e-mobile.mjs` | E2E mobile Chrome headless (viewport 390×844) | 14 PASS |
| `scripts/verify-gap-schema.mjs` | Verifikasi fix schema (visibilitas pengklaim + FK cascade) | 19 PASS |

Jalankan build & lint sebelum commit:

```bash
npm run build && npm run lint
```

---

## Deployment

> ⚠️ **Fase 6 belum dikerjakan** — catatan di bawah adalah rencana dari `LoopLink_TASKS.md`.

1. **Frontend:** deploy ke Vercel (`vercel`), pastikan build lolos.
2. **Environment variables production:** isi kelima variabel dari `.env.local.example` di dashboard Vercel.
3. **Database production:** jalankan migration 001–011 + `seed.sql` di project Supabase production (bukan hanya local).
4. **Test ulang seluruh alur** di environment production.
5. **Logo UKM Triple-C / TCC / Jack 2026** dicantumkan di footer atau halaman about.
6. **Performa:** cek loading di koneksi lambat (venue lomba mungkin tidak stabil).

---

## Roadmap

### GTM (opsional, kalau waktu cukup)
- Halaman verifikasi email, notifikasi, riwayat transaksi gabungan, modal laporan, tutorial/walkthrough, halaman statis (Tentang, FAQ, Syarat & Ketentuan, Kebijakan Privasi, Kontak).

### Roadmap (post-lomba / untuk presentasi)
- **PostGIS** untuk query jarak skalabel — ganti `hitungJarakKm` manual dengan `ST_DWithin` + GiST index (komentar skalabilitas sudah tertulis di `lib/ai/matching.js` dan migration 006).
- Dashboard admin (tinjau laporan, kelola kategori kecocokan).
- Rating / trust score antar user.

---

## Dokumentasi Terkait

| File | Isi |
|---|---|
| [`LoopLink_Tahap1_Ide_Inisiasi.md`](LoopLink_Tahap1_Ide_Inisiasi.md) | Ide & inisiasi project |
| [`LoopLink_Tahap2_Requirements_Spec.md`](LoopLink_Tahap2_Requirements_Spec.md) | Kebutuhan fungsional & non-fungsional |
| [`LoopLink_Tahap3_Design_Arsitektur.md`](LoopLink_Tahap3_Design_Arsitektur.md) | Desain arsitektur, schema, kebijakan RLS, formula skor |
| [`LoopLink_TASKS.md`](LoopLink_TASKS.md) | Rencana kerja per fase (status checklist) |
| [`LoopLink_PROMPT.md`](LoopLink_PROMPT.md) | Prompt siap-tempel untuk opencode |
| [`LoopLink_TEAM_WORKFLOW.md`](LoopLink_TEAM_WORKFLOW.md) | Alur kerja tim & delegasi agent |
| [`PROGRESS.md`](PROGRESS.md) | Progres live lintas fase |
| [`docs/api-endpoints.md`](docs/api-endpoints.md) | Dokumentasi API + contoh curl |
| [`docs/migrasi-ui-kanon.md`](docs/migrasi-ui-kanon.md) | Catatan migrasi UI ke design kanon |

---

## Lisensi

© 2026 LoopLink — Proyek TCC (Task Completion Course), Trunodjoyo Creative Competition 2026 — Vibe Code. Hak cipta milik tim pengembang.
