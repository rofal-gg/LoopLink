# LoopLink — TASKS.md

**Tahap 4: Tasks / Rencana Kerja** — hasil pemecahan Tahap 1-3 (Ide, Requirements, Arsitektur) jadi daftar tugas konkret, terurut dari setup awal sampai siap demo.

> Cara pakai: setiap task punya tag **[Delegasi: agent]** yang menunjukkan agent opencode mana yang mengerjakan (lihat `looplink-orchestrator.md`), dan **[Prioritas]** sesuai tingkat build dari Tahap 3 (Wajib Prototype / GTM / Roadmap). Kerjakan berurutan per fase — jangan loncat ke Fase 4 (Frontend) sebelum Fase 1-2 (Database, AI/ML) selesai, supaya kontrak data sudah pasti.

---

## Fase 0 — Setup Awal Project

- [x] Inisialisasi project Next.js + Tailwind CSS `[Delegasi: manual/setup]` **[Wajib]** — selesai: Next.js 16.3.0 (App Router) + Tailwind v4, build & dev server terverifikasi
- [ ] Buat project Supabase baru, catat URL & anon key `[Delegasi: manual/setup]` **[Wajib]** — project sudah terhubung, tapi URL/anon key belum dicatat di `.env.local` (belum dibuat)
- [ ] Daftar API key HuggingFace (Inference API token) `[Delegasi: manual/setup]` **[Wajib]** — menunggu `.env.local` diisi manual
- [ ] Daftar API key Gemini via Google AI Studio `[Delegasi: manual/setup]` **[Wajib]** — menunggu `.env.local` diisi manual
- [ ] Siapkan file `.env.local` dengan semua key (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `HF_API_TOKEN`, `GEMINI_API_KEY`) `[Delegasi: manual/setup]` **[Wajib]** — `.env.local` belum ada; template sudah siap di `.env.local.example`
- [x] Setup repo GitHub (wajib untuk pengumpulan karya sesuai ketentuan lomba) `[Delegasi: manual/setup]` **[Wajib]** — repo `rofal-gg/LoopLink` sudah aktif, branch `main` sinkron dengan `origin/main`
- [x] Pasang 4 file agent opencode (`looplink-orchestrator`, `looplink-database-supabase`, `looplink-backend-api`, `looplink-ai-ml-integration`, `design-taste-frontend`) di `.opencode/agent/` `[Delegasi: manual/setup]` **[Wajib]** — kelima file ada

---

## Fase 1 — Database & Supabase

*Delegasikan seluruh fase ini ke `looplink-database-supabase`*

> ⚠️ Status: **belum dikerjakan** — database Supabase masih kosong (0 tabel, 0 migration). Tidak ada task di fase ini yang bisa dicentang. Rincian di `PROGRESS.md`.

- [ ] Buat migration tabel inti: `profiles`, `listings`, `listing_photos`, `kategori_kecocokan` **[Wajib]**
- [ ] Buat migration tabel pendukung: `riwayat_klaim`, `laporan`, `riwayat_pencarian`, `riwayat_pencarian_hasil` **[GTM]**
- [ ] Aktifkan RLS di semua tabel **[Wajib]**
- [ ] Tulis policy SELECT/INSERT/UPDATE/DELETE sesuai tabel kebijakan RLS di Tahap 3 **[Wajib]**
- [ ] Cabut hak UPDATE langsung kolom `status`/`diklaim_oleh`/`dibatalkan_oleh` dari role `authenticated` **[Wajib]**
- [ ] Buat RPC function `claim_listing` **[Wajib]**
- [ ] Buat RPC function `complete_listing` **[Wajib]**
- [ ] Buat RPC function `cancel_claim` **[Wajib]**
- [ ] Buat index lokasi (`lokasi_lat`, `lokasi_lng`) dan status pada `listings` **[Wajib]**
- [ ] Isi seed data `kategori_kecocokan` (baseline dari `looplink-ai-ml-integration.md`) **[Wajib]**
- [ ] Buat seed data akun dummy (5-6 akun, lokasi & kategori bervariasi) untuk demo **[Wajib]**
- [ ] Test manual: jalankan `claim_listing` dari 2 akun berbeda, pastikan listing sendiri tidak bisa diklaim **[Wajib]**

---

## Fase 2 — AI/ML Integration

*Delegasikan seluruh fase ini ke `looplink-ai-ml-integration`*

- [ ] Implementasi fungsi `klasifikasiCitra()` — panggil HuggingFace `watersplash/waste-classification` **[Wajib]**
- [ ] Terapkan threshold confidence 0.6 (`perlu_koreksi_manual`) **[Wajib]**
- [ ] Implementasi fungsi `ekstraksiDeskripsi()` — panggil Gemini 1.5 Flash **[Wajib]**
- [ ] Implementasi fungsi `hitungJarakKm()` (Haversine) **[Wajib]**
- [ ] Implementasi fungsi `hitungSkorKecocokan()` (rule-based, bobot 0.5/0.3/0.2) **[Wajib]**
- [ ] Test klasifikasi dengan 5-10 foto contoh dari kategori berbeda, catat akurasi kasar **[Wajib]**
- [ ] Test skenario confidence rendah (foto ambigu) memicu flag koreksi manual dengan benar **[Wajib]**
- [ ] Test fallback saat HuggingFace/Gemini sengaja dimatikan (simulasi API down) **[Wajib]**

---

## Fase 3 — Backend API

*Delegasikan seluruh fase ini ke `looplink-backend-api`*

- [ ] Endpoint `POST /api/listings/klasifikasi` **[Wajib]**
- [ ] Endpoint `POST /api/listings/ekstraksi-teks` **[Wajib]**
- [ ] Endpoint `POST /api/listings` (buat listing) **[Wajib]**
- [ ] Endpoint `GET/PATCH/DELETE /api/listings/[id]` **[Wajib]**
- [ ] Endpoint `POST /api/listings/cari` (search + scoring + simpan ke `riwayat_pencarian`) **[Wajib]**
- [ ] Endpoint `POST /api/listings/[id]/klaim` **[Wajib]**
- [ ] Endpoint `POST /api/listings/[id]/selesai` **[Wajib]**
- [ ] Endpoint `POST /api/listings/[id]/batal` **[Wajib]**
- [ ] Endpoint `POST /api/laporan` **[GTM]**
- [ ] Test setiap endpoint dengan Postman/Thunder Client sebelum dihubungkan ke UI **[Wajib]**

---

## Fase 4 — Frontend / UI

*Delegasikan seluruh fase ini ke `design-taste-frontend`, kontrak data dari Fase 3 wajib sudah final*

### 4.1 Publik & Onboarding
- [ ] Landing Page **[Wajib]**
- [ ] Login **[Wajib]**
- [ ] Register **[Wajib]**
- [ ] Lupa Password **[Wajib]**
- [ ] Reset Password **[Wajib]**
- [ ] Setup Lokasi Awal (dengan fallback input alamat manual) **[Wajib]**

### 4.2 Navigasi Utama
- [ ] Home / Dashboard **[Wajib]**

### 4.3 Flow Upload Limbah
- [ ] Upload Foto (capture/pilih gambar) **[Wajib]**
- [ ] State "Memproses AI" (loading gabungan klasifikasi + ekstraksi) **[Wajib]**
- [ ] Review & Koreksi Kategori + Form Detail Listing (satu layar, dengan live preview) **[Wajib]**
- [ ] Konfirmasi Sukses Upload **[Wajib]**
- [ ] Edit Listing **[Wajib]**
- [ ] Konfirmasi Hapus/Batalkan Listing **[Wajib]**

### 4.4 Flow Cari Bahan
- [ ] Form Pencarian (kategori + radius slider) **[Wajib]**
- [ ] Hasil Pencarian (dengan skeleton loading, sort/filter drawer) **[Wajib]**
- [ ] Empty State hasil kosong **[Wajib]**

### 4.5 Detail Listing & Klaim
- [ ] Detail Listing (termasuk tombol Laporkan) **[Wajib]**
- [ ] Modal Konfirmasi Klaim → tampilkan kontak **[Wajib]**
- [ ] Konfirmasi Selesaikan Transaksi **[Wajib]**
- [ ] Modal Batalkan Klaim **[Wajib]**

### 4.6 Manajemen Pribadi
- [ ] Listing Saya (tab status) **[Wajib]**
- [ ] Klaim Saya **[Wajib]**
- [ ] Profil Saya (lihat + edit) **[Wajib]**
- [ ] Pengaturan Akun **[Wajib]**

### 4.7 Error & Edge Case
- [ ] 404 Not Found **[Wajib]**
- [ ] Error koneksi/server **[Wajib]**
- [ ] AI classification gagal (fallback manual) **[Wajib]**
- [ ] Confidence rendah (dorong koreksi) **[Wajib]**
- [ ] Unauthorized access **[Wajib]**

### 4.8 GTM (Opsional, Kerjakan Kalau Waktu Cukup)
- [ ] Halaman Verifikasi Email **[GTM]**
- [ ] Notifikasi (list) **[GTM]**
- [ ] Riwayat Transaksi Gabungan **[GTM]**
- [ ] Modal Laporkan Listing **[GTM]**
- [ ] Tutorial/walkthrough singkat **[GTM]**
- [ ] Tentang, FAQ, Syarat & Ketentuan, Kebijakan Privasi, Kontak **[GTM]**

---

## Fase 5 — Integrasi & Testing End-to-End

- [ ] Test alur penuh: registrasi → setup lokasi → upload foto → klasifikasi AI → koreksi → listing tayang **[Wajib]**
- [ ] Test alur penuh: cari bahan → lihat hasil terurut skor → buka detail → klaim → lihat kontak **[Wajib]**
- [ ] Test alur selesai: pemilik menandai selesai, status berubah, tercatat di `riwayat_klaim` **[Wajib]**
- [ ] Test alur batal: baik dari sisi pemilik maupun pengklaim, `dibatalkan_oleh` tercatat benar **[Wajib]**
- [ ] Test bahwa listing sendiri tidak muncul tombol klaim **[Wajib]**
- [ ] Test radius pencarian — listing di luar radius tidak muncul **[Wajib]**
- [ ] Test di perangkat mobile (karena upload foto sering dari HP) **[Wajib]**
- [ ] Perbaiki bug dari hasil testing di atas **[Wajib]**

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
