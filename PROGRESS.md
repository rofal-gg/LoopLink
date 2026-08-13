# LoopLink — PROGRESS.md

> Dokumen progres live project LoopLink (Trunodjoyo Creative Competition 2026 — Vibe Code).
> Di-update setiap kali ada fase selesai / dimulai. Sumber kebenaran teknis: `LoopLink_TASKS.md`, `LoopLink_PROMPT.md`, `LoopLink_Tahap3_Design_Arsitektur.md`.

---

## Status Saat Ini

**Fase aktif: siap mulai Fase 2 — AI/ML Integration** (delegasikan ke `looplink-ai-ml-integration`)

> ⚠️ **Catatan koordinasi:** Fase 1 (Database & Supabase) **belum dikerjakan** — database Supabase masih kosong. Fase 2 (fungsi `hitungSkorKecocokan`, klasifikasi, dsb.) bisa dimulai secara paralel, tapi seed data `kategori_kecocokan` (Fase 1) akan dibutuhkan saat uji skor kecocokan. Urutan kerja yang disarankan: kerjakan Fase 2 fungsi AI/ML murni (klasifikasi, ekstraksi, Haversine) sambil dikejar Fase 1 database — atau tuntaskan Fase 1 dulu sesuai urutan TASKS.md.

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

### Fase 1 — Database & Supabase

- ⏳ **Belum ada yang selesai** — lihat bagian "Yang Sedang Dikerjakan / Setengah Jalan".

---

## Yang Sedang Dikerjakan / Setengah Jalan

### Fase 0 — masih butuh aksi manual (tidak dicentang di TASKS.md)

| Task | Status | Blocker |
|---|---|---|
| Buat project Supabase + catat URL & anon key | Setengah — project sudah terhubung (database bisa diakses via MCP), tapi URL/anon key belum dicatat | `.env.local` belum dibuat |
| Daftar API key HuggingFace | Belum | User isi manual |
| Daftar API key Gemini | Belum | User isi manual |
| Siapkan `.env.local` dengan semua key | Belum — template sudah siap di `.env.local.example` | User isi manual (`cp .env.local.example .env.local`) |

### Fase 1 — Database & Supabase (belum dimulai)

Database Supabase saat ini **kosong**: 0 tabel, 0 migration. Seluruh task Fase 1 di `LoopLink_TASKS.md` masih unchecked — termasuk tabel inti (`profiles`, `listings`, `listing_photos`, `kategori_kecocokan`), tabel GTM, RLS, RPC `claim_listing` / `complete_listing` / `cancel_claim`, index, dan seed data. Begitu Fase 2 selesai dimulai, delegasikan Fase 1 ke `looplink-database-supabase`.

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

- [ ] User mengisi `.env.local` (`HF_API_TOKEN`, `GEMINI_API_KEY`, key Supabase)
- [ ] (Paralel / segera) Fase 1 Database — minimal tabel inti + seed `kategori_kecocokan`

### Setelah Fase 2

- Fase 3 — Backend API (`looplink-backend-api`): endpoint klasifikasi, ekstraksi, CRUD listing, search+scoring, klaim/selesai/batal
- Fase 4 — Frontend/UI (`design-taste-frontend`): setelah kontrak API Fase 3 final

---

*Bagian dari dokumentasi Spec-Driven Development (SDD) project LoopLink — pelacak progres lintas fase.*
