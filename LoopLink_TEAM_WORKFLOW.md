# LoopLink — TEAM_WORKFLOW.md

Panduan koordinasi untuk tim (maks. 3 anggota sesuai ketentuan lomba) yang bekerja di device berbeda menggunakan opencode dengan agent yang sama.

---

## 1. Prinsip Dasar

- **Satu sumber kebenaran**: repo GitHub. Semua file (dokumentasi SDD, file agent opencode, kode) harus di-commit — jangan ada yang hanya tersimpan lokal di satu device.
- **Agent file WAJIB ikut ter-commit** (`looplink-orchestrator.md`, `looplink-database-supabase.md`, `looplink-backend-api.md`, `looplink-ai-ml-integration.md`, `design-taste-frontend.md`, ditaruh di `.opencode/agents/`). Kalau tidak di-commit, device lain akan dapat perilaku opencode yang beda/tidak konsisten.
- **Setiap device menjalankan Prompt 0 (muat konteks) sendiri-sendiri** di awal sesi kerja mereka — jangan asumsikan opencode "ingat" hasil kerja device lain. Konteks hanya datang dari file yang sudah di-pull, bukan dari sesi lain.
- **Jangan commit `.env.local`.** Sudah ada di `.gitignore` dari Prompt 1. Bagikan API key lewat password manager bersama (1Password, Bitwarden) atau chat pribadi — bukan lewat repo.

---

## 2. Pembagian Peran (Disarankan untuk Tim 3 Orang)

Pembagian ini sengaja mengikuti batas antar agent yang sudah didefinisikan, supaya tiap orang punya domain jelas dan tidak saling tunggu tanpa alasan:

| Anggota | Domain | Agent yang dipakai | Prompt dari `docs/prompts/LoopLink_PROMPT.md` |
|---|---|---|---|
| Anggota A | Data & AI/ML | `looplink-database-supabase`, `looplink-ai-ml-integration` | Prompt 2, Prompt 3 |
| Anggota B | Backend API | `looplink-backend-api` | Prompt 4 |
| Anggota C | Frontend/UI | `design-taste-frontend` | Prompt 5a-5d |

Kalau tim cuma 2 orang, gabungkan Anggota A+B jadi satu orang (data + backend), Anggota C tetap sendiri untuk frontend. Kalau kerja solo, tetap ikuti urutan fase di `docs/sdd/LoopLink_TASKS.md` apa adanya.

---

## 3. Apa yang Bisa Paralel, Apa yang Harus Menunggu

Fase di `TASKS.md` ditulis berurutan supaya aman, tapi tidak semua harus benar-benar menunggu total. Ini pemetaan realistisnya:

| Fase | Bisa mulai kapan? |
|---|---|
| Fase 1 (Database) | Mulai duluan, tidak bergantung fase lain |
| Fase 2 (AI/ML) | Bisa paralel dengan Fase 1 — AI/ML tidak butuh tabel selesai dulu, cukup tahu kontrak data dari `docs/sdd/LoopLink_Tahap3_Design_Arsitektur.md` |
| Fase 3 (Backend API) | **Sebaiknya tunggu** Fase 1 & 2 minimal 80% selesai — endpoint butuh RPC dan fungsi AI yang nyata, bukan asumsi |
| Fase 4 (Frontend) | **Bisa mulai lebih awal dari yang disarankan**, asal Anggota C kerja dari **kontrak data** di `looplink-backend-api.md` (Section 2: bentuk request/response), pakai data dummy/mock dulu. Setelah Fase 3 selesai, tinggal sambung ke endpoint asli, bukan bangun ulang dari nol |
| Fase 5 (Testing E2E) | Wajib menunggu Fase 1-4 selesai dan sudah tersambung semua |
| Fase 6 (Deploy) | Setelah Fase 5 lolos |
| Fase 7 (Demo prep) | Bisa disiapkan paralel sejak Fase 4 berjalan (skrip demo, deskripsi karya) — tidak perlu menunggu semua kode selesai |

**Rekomendasi konkret:** di hari pertama, Anggota A dan B mulai Fase 1-2 bersamaan (beda tabel/fungsi, kecil risiko bentrok), Anggota C langsung mulai Fase 4 pakai data mock berdasarkan kontrak yang sudah didokumentasikan, tidak perlu menunggu.

---

## 4. Aturan Git untuk Menghindari Bentrok

### 4.1 Branch
- `main` — selalu dalam kondisi bisa di-build, tidak pernah push langsung ke sini
- `feat/database`, `feat/ai-ml`, `feat/backend-api`, `feat/frontend-<nama-flow>` (misal `feat/frontend-upload`) — satu branch per domain/flow
- Merge ke `main` lewat Pull Request, minimal 1 anggota lain review sebelum merge (kalau waktu mepet, boleh self-merge tapi tetap buat PR supaya ada jejak perubahan)

### 4.2 Migration SQL (Rawan Bentrok Kalau Tidak Hati-Hati)
- **Selalu pakai `supabase migration new <nama>`** untuk generate file migration baru — ini otomatis kasih prefix timestamp, jadi dua orang yang bikin migration di waktu berbeda tidak akan tabrakan nama file
- **Jangan edit file migration yang sudah di-merge ke `main`.** Kalau ada perubahan schema, buat migration baru, jangan modifikasi yang lama
- Sebelum mulai kerja migration baru, **selalu `git pull` dulu** supaya tidak kerja dari schema yang sudah basi

### 4.3 Sinkronisasi Harian
- Di awal sesi kerja (device manapun): `git pull` dulu sebelum mulai prompt apa pun
- Di akhir sesi kerja: push perubahan, meski belum 100% selesai (pakai draft PR) — supaya anggota lain bisa lihat progres dan tidak kerja dari asumsi yang salah

---

## 5. Titik Sinkronisasi Wajib (Sync Points)

Di titik-titik ini, **seluruh tim harus berhenti sebentar** dan menyamakan pemahaman sebelum lanjut — supaya tidak ada yang membangun di atas asumsi yang sudah berubah:

1. **Setelah Fase 1 & 2 selesai** — pastikan schema final dan kontrak fungsi AI/ML sudah stabil sebelum Anggota B mulai serius di Fase 3
2. **Setelah Fase 3 selesai** — Anggota C berhenti pakai data mock, sambungkan ke endpoint asli, cek ada mismatch kontrak atau tidak
3. **Sebelum Fase 5 (Testing E2E)** — semua branch sudah merge ke `main`, tidak ada kerjaan yang masih nyangkut di branch terpisah
4. **Sebelum Fase 6 (Deploy)** — semua anggota tahu urutan env variable yang perlu diisi (jangan sampai satu orang deploy tapi API key milik anggota lain belum dibagikan)

---

## 6. Kalau Ada Konflik Keputusan Teknis

Karena tiap agent dibatasi domainnya masing-masing (lihat guardrail di `looplink-orchestrator.md`), potensi konflik paling sering muncul di **kontrak data** antara Backend dan Frontend, atau antara Database dan AI/ML. Kalau ini terjadi:

1. Cek dulu apakah jawabannya sudah ada di `docs/sdd/LoopLink_Tahap3_Design_Arsitektur.md` — itu sumber kebenaran, bukan preferensi masing-masing anggota
2. Kalau memang belum ada keputusannya di dokumen, diskusikan singkat di luar opencode (chat tim), putuskan, lalu **update dokumen SDD yang relevan dulu** sebelum lanjut coding — supaya device lain yang nanti `git pull` dan jalankan Prompt 0 dapat konteks yang sudah benar, bukan ketinggalan

---

*Bagian dari dokumentasi Spec-Driven Development (SDD) project LoopLink.*
