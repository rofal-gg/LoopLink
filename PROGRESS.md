# LoopLink — PROGRESS.md

> Dokumen progres live project LoopLink (Trunodjoyo Creative Competition 2026 — Vibe Code).
> Di-update setiap kali ada fase selesai / dimulai. Sumber kebenaran teknis: `LoopLink_TASKS.md`, `LoopLink_PROMPT.md`, `LoopLink_Tahap3_Design_Arsitektur.md`.

---

## Status Saat Ini

**Fase aktif: siap mulai Fase 2 — AI/ML Integration** (delegasikan ke `looplink-ai-ml-integration`)

> ✅ **Fase 1 (Database & Supabase) SELESAI** — 7 migration + seed sudah ter-apply ke Supabase remote, RLS aktif, 3 RPC terverifikasi. Tidak ada lagi blocker database untuk Fase 2.

---

## Yang Sudah Selesai

### Fase 0 — Setup Awal Project ✅ (sebagian besar)

- ✅ **Project Next.js + Tailwind CSS v4 terinisialisasi** — `next@16.3.0` (App Router, JavaScript), `react@19`, `tailwindcss@^4` + `@tailwindcss/postcss`. Build & dev server terverifikasi (halaman `/` 200, proxy jalan).
- ✅ **Struktur folder awal** — `app/`, `lib/supabase/`, `lib/ai/` (+ `.gitkeep`), `public/`.
- ✅ **`.env.local.example`** — berisi 5 variabel kosong siap isi manual: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `HF_API_TOKEN`, `GEMINI_API_KEY`.
- ✅ **Supabase client pola `@supabase/ssr`** — `lib/supabase/client.js` (browser, singleton) & `lib/supabase/server.js` (server component/route handler, `cookies()` async).
- ✅ **Proxy refresh sesi (konvensi Next.js 16)** — `proxy.js` di root + `lib/supabase/proxy.js` (`updateSession` → `supabase.auth.getClaims()`, sinkronisasi cookie request/response, cache headers anti-CDN). Termasuk guard env kosong agar dev server tidak 500 sebelum key diisi.
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

---

## Yang Sedang Dikerjakan / Setengah Jalan

### Fase 0 — masih butuh aksi manual (tidak dicentang di TASKS.md)

| Task | Status | Blocker |
|---|---|---|
| Buat project Supabase + catat URL & anon key | Setengah — project sudah terhubung (database bisa diakses via MCP), tapi URL/anon key belum dicatat | `.env.local` belum dibuat |
| Daftar API key HuggingFace | Belum | User isi manual |
| Daftar API key Gemini | Belum | User isi manual |
| Siapkan `.env.local` dengan semua key | Belum — template sudah siap di `.env.local.example` | User isi manual (`cp .env.local.example .env.local`) |

### Fase 1 — Database & Supabase (selesai ✅)

Database Supabase sudah lengkap: 8 tabel + RLS, 3 RPC, index, seed data ter-apply dan terverifikasi. Detail di bagian "Yang Sudah Selesai" di atas.

---

## Task Berikutnya

### Fase 2 — AI/ML Integration (delegasikan ke `looplink-ai-ml-integration`)

1. Implementasi `klasifikasiCitra()` — HuggingFace `watersplash/waste-classification`
2. Threshold confidence 0.6 → flag `perlu_koreksi_manual`
3. Implementasi `ekstraksiDeskripsi()` — Gemini 1.5 Flash
4. Implementasi `hitungJarakKm()` (Haversine)
5. Implementasi `hitungSkorKecocokan()` (rule-based, bobot 0.5/0.3/0.2)
6. Test klasifikasi 5-10 foto contoh + skenario confidence rendah + fallback API down

### Prasyarat sebelum Fase 2 berjalan penuh

- [x] Fase 1 Database — tabel inti, RLS, RPC, index, seed `kategori_kecocokan` + akun demo sudah selesai & ter-apply
- [ ] User mengisi `.env.local` (`HF_API_TOKEN`, `GEMINI_API_KEY`, key Supabase) — **satu-satunya blocker tersisa**

### Setelah Fase 2

- Fase 3 — Backend API (`looplink-backend-api`): endpoint klasifikasi, ekstraksi, CRUD listing, search+scoring, klaim/selesai/batal
- Fase 4 — Frontend/UI (`design-taste-frontend`): setelah kontrak API Fase 3 final

---

*Bagian dari dokumentasi Spec-Driven Development (SDD) project LoopLink — pelacak progres lintas fase.*
