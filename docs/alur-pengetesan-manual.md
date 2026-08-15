# LoopLink — Alur Pengetesan Manual (UI, dari Awal)

> Dokumen panduan tes **manual lewat browser** untuk seluruh alur LoopLink.
> Ikuti urutan skenario di bawah. Centang `[ ]` setiap langkah yang LOLOS.
> Kalau ada langkah GAGAL, catat di **Bagian 11 — Form Catatan Bug** lalu lanjut.

**Versi tested:** build Fase 5 (31 PASS E2E API + 14 PASS mobile) — dokumen ini untuk verifikasi manual manusia sebelum demo/juri.

---

## 1. Persiapan Awal (lakukan sekali sebelum tes)

### 1.1 Prasyarat

- [ ] Node.js ≥ 18 terpasang (`node -v`)
- [ ] `.env.local` terisi penuh (lihat `README.md` → Setup Lokal). Berisi 5 variabel:
      `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
      `SUPABASE_SERVICE_ROLE_KEY`, `HF_API_TOKEN`, `GEMINI_API_KEY`
- [ ] Database Supabase sudah di-*migrate* + seed (11 migration `supabase/migrations/` + `supabase/seed.sql`)
- [ ] Bisa login salah satu akun demo (uji cepat, lihat tabel di 1.3)

### 1.2 Jalankan aplikasi

```bash
npm install        # kalau belum pernah
npm run dev        # → buka http://localhost:3000
```

> Kalau mau uji versi production: `npm run build && npm run start`.

### 1.3 Akun demo (password semua: `looplink123`)

| Email | Nama | Lokasi | Catatan data |
|---|---|---|---|
| `admin@looplink.demo` | Admin LoopLink | Surabaya Pusat | `is_admin = true` |
| `budi@looplink.demo` | Budi Santoso | Surabaya Timur | Punya karton, plastik, sekrup besi |
| `sari@looplink.demo` | Sari Wijaya | Sidoarjo | Punya sisa sayur, kulit buah |
| `agus@looplink.demo` | Agus Pratama | Gresik | Besi tua, kardus toko |
| `dewi@looplink.demo` | Dewi Lestari | Bangkalan | Pakaian bekas; pengklaim botol plastik |
| `rina@looplink.demo` | Rina Kartika | Surabaya Barat | Kertas arsip, botol kaca |

**Data seed (10 listing):** 7 tersedia (karton, sayur, kardus toko, pakaian, kertas, besi, sekrup),
2 dipesan (botol plastik → dewi, kulit buah → rina), 1 selesai (besi tua), 1 dibatalkan (botol kaca).

### 1.4 Foto uji untuk upload

Foto contoh ada di `scripts/fixtures/`:
- `plastic-bottles.jpg`, `cardboard-milk-carton.jpg`, `metal-milk-can.jpg`, `glass-beer-bottles.jpg`, `paper-copy-stack.jpg` (fixture demo resmi; bisa dipakai kalau jaringan bisa resolve HF)
- Kalau tidak ada, foto apa pun dari HP/kamera (format jpeg/png/webp, < 5 MB) — ingat hasil klasifikasi AI bisa gagal → itu jalur yang benar (lihat Skenario B).

> ⚠️ **Keterbatasan jaringan dev yang diketahui:** kalau jaringanmu tidak bisa resolve
> `api-inference.huggingface.co`, klasifikasi AI akan selalu masuk state **"AI gagal mengenali"**
> → pilih kategori manual. **Ini BUKAN bug** — ini perilaku fallback yang benar (business rule #4).

---

## 2. Pre-flight — Cek Halaman Publik & Guard Route

| # | Langkah | Ekspektasi | Hasil |
|---|---|---|---|
| 2.1 | Buka `http://localhost:3000/` | Landing page tampil (navbar, hero, kategori, footer) | [ ] |
| 2.2 | Klik "Masuk" di navbar | Masuk `/login` | [ ] |
| 2.3 | Buka `/login`, `/register`, `/lupa-password` | Semua tampil tanpa error | [ ] |
| 2.4 | **Belum login**, coba buka `/home`, `/upload`, `/cari`, `/listing-saya`, `/profil` | Redirect ke `/login?next=...` | [ ] |
| 2.5 | Buka URL acak, misal `/halaman-tak-ada` | Halaman 404 custom (logo, "Error 404", tombol Beranda) | [ ] |

---

## 3. Skenario A — Registrasi Akun Baru (alur onboarding)

Skenario ini butuh email yang belum dipakai (bisa `demo.baru@looplink.demo`).

| # | Langkah | Ekspektasi | Hasil |
|---|---|---|---|
| A.1 | Klik "Daftar" → isi nama, email, sandi (≥ 8 karakter) → submit | Muncul state "cek email kamu" | [ ] |
| A.2 | Buka email (log Supabase / email ke depan) → klik link konfirmasi | Masuk halaman set/konfirmasi sandi → bisa login | [ ] |
| A.3 | Login akun baru → diarahkan `/setup-lokasi` | Halaman onboarding lokasi tampil | [ ] |
| A.4 | Klik "Gunakan Lokasi Saya" → izinkan akses lokasi | Koordinat terisi, alamat hasil reverse geocode muncul | [ ] |
| A.5 | **Tolak izin lokasi** di browser | Form **input alamat manual** tetap muncul (fallback WAJIB ada) → isi alamat → simpan | [ ] |
| A.6 | Setelah simpan | Masuk `/home`, sapaan nama tampil, banner lokasi hijau | [ ] |

---

## 4. Skenario B — Upload Limbah (alur inti: foto → AI → koreksi → tayang)

Login sebagai **`budi@looplink.demo`** (Sudah punya lokasi).

| # | Langkah | Ekspektasi | Hasil |
|---|---|---|---|
| B.1 | Buka `/upload` → pilih/ambil foto | Preview foto tampil | [ ] |
| B.2 | Klik "Kenali dengan AI" | Satu layar loading dengan checklist 3 langkah (klasifikasi → ekstraksi → review) | [ ] |
| B.3 | **Kasus 1 (AI sukses, confidence ≥ 60%)**: kategori terisi + badge "AI" + keyakinan % | Tidak muncul pesan error | [ ] |
| B.4 | **Kasus 2 (confidence < 60%)**: banner amber *"AI kurang yakin dengan hasil ini (confidence XX%)"* + kategori tetap terpilih & disorot | Banner berbeda dari kasus error | [ ] |
| B.5 | **Kasus 3 (AI gagal)**: banner merah *"AI gagal mengenali foto ini. Pilih kategori secara manual"* + tanpa kategori default | Pilih kategori manual → bisa lanjut | [ ] |
| B.6 | Isi judul (wajib), deskripsi (prefill Gemini kalau sukses), jumlah + satuan (kg/karung/ton/unit), pilih kategori | Preview kanan live-update mengikuti form | [ ] |
| B.7 | Submit "Pasang Listing" | Halaman sukses: "Listing berhasil dipasang" + info judul/kategori/jumlah | [ ] |
| B.8 | Buka `/listing-saya` | Listing baru muncul di tab **Tersedia**, badge status + badge AI benar | [ ] |
| B.9 | Buka detail listing tersebut di tab baru | Foto, judul, kategori, jumlah tampil; tombol "Amankan" **tidak ada** + pesan "Ini listingmu" | [ ] |

---

## 5. Skenario C — Cari Bahan & Klaim (alur pembeli)

Login sebagai **`sari@looplink.demo`** (Sidoarjo — dekat dengan listing Budi di Surabaya Timur).

| # | Langkah | Ekspektasi | Hasil |
|---|---|---|---|
| C.1 | Buka `/cari` | Form muncul (kategori, slider radius, jumlah) | [ ] |
| C.2 | Pilih kategori "Bahan baku daur ulang kertas", radius 30 km, jumlah 40 | Hasil otomatis muncul (auto-search) | [ ] |
| C.3 | Periksa hasil | Ada listing "Karton bekas pabrik (press)" Budi dengan skor "Cocok N%" + jarak km; **tidak ada listing milik sendiri (sari)** | [ ] |
| C.4 | Coba ubah slider radius → 100 km | Hasil reload otomatis (debounce) | [ ] |
| C.5 | Coba pilih kategori lain (mis. "Kompos") | Hasil berubah sesuai kategori; cek urutan skor turun | [ ] |
| C.6 | Buka drawer sort/filter → ubah sort & filter | Hasil berubah client-side tanpa reload | [ ] |
| C.7 | Klik kartu "Karton bekas pabrik (press)" | Masuk `/listing/[id]` — galeri, badge status hijau "Tersedia", info pemilik | [ ] |
| C.8 | Klik tombol **Amankan** | Modal konfirmasi klaim tampil | [ ] |
| C.9 | Konfirmasi klaim | Sukses → tampil **kontak pemilik** (nama, tombol tel `0812-...`, alamat) + pesan "Klaim berhasil! Hubungi pemilik" | [ ] |
| C.10 | Buka `/klaim-saya` | Kartu klaim aktif muncul, tracker 2 langkah: "Diklaim" → "Menunggu pengambilan" | [ ] |
| C.11 | Kembali buka detail listing yang diklaim | Status berubah **Dipesan** (badge oranye), bukan "Tersedia" | [ ] |

---

## 6. Skenario D — Selesaikan Transaksi (hanya pemilik)

Login sebagai **`budi@looplink.demo`** (pemilik karton).

| # | Langkah | Ekspektasi | Hasil |
|---|---|---|---|
| D.1 | Buka `/listing-saya` | Listing karton berstatus **Dipesan** | [ ] |
| D.2 | Buka detail listing tersebut | Tombol **Selesaikan** tampil (pemilik) | [ ] |
| D.3 | Klik "Selesaikan" → konfirmasi | Status jadi **Selesai** | [ ] |
| D.4 | Buka `/klaim-saya` sebagai sari (logout → login sari) | Tracker: "Diklaim" → "Selesai" + tanggal | [ ] |

---

## 7. Skenario E — Batalkan Klaim (dua sisi: pengklaim & pemilik)

**E.1 — Batalkan oleh PENGKLAIM (dewi):**

| # | Langkah | Ekspektasi | Hasil |
|---|---|---|---|
| E.1.1 | Login `dewi@looplink.demo` → buka `/cari`, cari "Bahan bakar RDF" → klaim "Botol plastik PET bersih" milik Budi (status seed sudah dipesan oleh dewi, tapi tes: klaim listing tersedia lain yang sesuai) | Klaim sukses | [ ] |
| E.1.2 | Buka `/klaim-saya` → klik **Batalkan Klaim** → konfirmasi | Status kembali tersedia, riwayat "Dibatalkan" muncul | [ ] |

**E.2 — Batalkan oleh PEMILIK (budi):**

| # | Langkah | Ekspektasi | Hasil |
|---|---|---|---|
| E.2.1 | Login `budi@looplink.demo` → buat listing baru cepat atau pakai listing tersedia lain | Status listing `tersedia` | [ ] |
| E.2.2 | Minta login `dewi@looplink.demo` klaim listing itu | Status `dipesan` | [ ] |
| E.2.3 | Login lagi `budi@looplink.demo` → buka detail listing → klik **Batalkan Klaim** (label "dari dewi") | Status kembali `tersedia` | [ ] |
| E.2.4 | Verifikasi di `/klaim-saya` dewi | Riwayat dibatalkan tampil (bisa berupa kartu ringkas kalau listing tak terlihat RLS — itu perilaku benar) | [ ] |

---

## 8. Skenario F — Aturan Bisnis (kasus negatif / keamanan)

| # | Skenario | Cara tes | Ekspektasi | Hasil |
|---|---|---|---|---|
| F.1 | Klaim listing sendiri | Login budi → buka detail listing milik budi sendiri | Tombol "Amankan" **tidak tampil** + pesan "Ini listingmu" | [ ] |
| F.2 | Edit listing bukan miliknya | Login sari → buka `/upload/[id]/edit` listing milik budi | Redirect/halaman tidak terlihat (RLS) → 404 | [ ] |
| F.3 | Edit listing berstatus dipesan/selesai | Login budi → coba edit listing yang sudah dipesan | Muncul panel "Listing ini tidak bisa diedit" | [ ] |
| F.4 | Hapus listing berstatus bukan tersedia | Login budi → coba hapus listing dipesan | Ditolak (modal error 400) | [ ] |
| F.5 | Selesaikan bukan sebagai pemilik | Login dewi → buka detail listing milik budi yang dipesan | Tombol "Selesaikan" **tidak tampil** | [ ] |
| F.6 | Pencarian di luar radius | Login sari → cari radius 1 km | Listing dari luar radius tidak muncul (hasil kosong / saran perbesar radius) | [ ] |
| F.7 | Pencarian tanpa kategori | Buka `/cari`, submit tanpa kategori | Form mencegah/error validasi | [ ] |
| F.8 | Lapor listing | Login sari → buka detail listing orang lain → klik Laporkan → isi alasan → kirim | "Laporan terkirim" muncul | [ ] |
| F.9 | Listing sendiri tidak muncul di pencarian | Login budi → `/cari` kategori sama dengan listing miliknya | Tidak ada listing milik budi di hasil | [ ] |

---

## 9. Skenario G — Manajemen Akun & Edge Case

| # | Langkah | Ekspektasi | Hasil |
|---|---|---|---|
| G.1 | Buka `/profil` | Mode lihat tampil (nama, telp, alamat); tombol Edit | [ ] |
| G.2 | Klik Edit → ubah nama → Simpan | Tampil mode lihat dengan nama baru | [ ] |
| G.3 | Buka `/pengaturan` | 3 kartu: Update Email & Nama / Ganti Sandi / Logout Semua Sesi | [ ] |
| G.4 | Ganti sandi (sandi lama benar, baru ≥ 8 karakter) | Notifikasi sukses | [ ] |
| G.5 | Logout semua sesi → coba akses halaman lain | Sesi berakhir, redirect ke `/login` | [ ] |
| G.6 | Login akun yang status_akun-nya `blokir`/`nonaktif` (via SQL, atau pakai akun baru lalu update status di dashboard) | Masuk `/unauthorized` dengan pilihan "Coba Lagi" / "Keluar & Masuk Ulang" | [ ] |
| G.7 | Coba reset password (dari `/lupa-password`) | Email recovery terkirim; set sandi baru → bisa login | [ ] |
| G.8 | Matikan internet / blokir network di DevTools → buka halaman dinamis | Muncul pesan "Koneksi ke server bermasalah" + tombol reset (bukan layar putih) | [ ] |

---

## 10. Skenario H — Mobile Responsive (khusus demo pakai HP / mode juri)

Buka DevTools → device toolbar (viewport 390×844) atau HP asli.

| # | Halaman | Ekspektasi | Hasil |
|---|---|---|---|
| H.1 | Landing `/` | Tidak ada overflow horizontal, CTA bisa diketuk | [ ] |
| H.2 | `/login` | Form muat di layar sempit | [ ] |
| H.3 | `/home` | 2 kartu aksi besar muat | [ ] |
| H.4 | `/cari` | Slider radius & hasil muat; drawer sort/filter naik dari bawah | [ ] |
| H.5 | `/upload` | Preview foto + tombol AI muat | [ ] |
| H.6 | `/listing/[id]` | Galeri + modal klaim jadi bottom sheet | [ ] |
| H.7 | `/listing-saya`, `/klaim-saya`, `/profil`, `/pengaturan` | Tanpa overflow horizontal | [ ] |

---

## 11. Form Catatan Bug

Salin blok ini untuk setiap bug yang ditemukan:

```
---
**Bug #:** ___
**Halaman/Route:** ___
**Skenario & langkah:** ___
**Langkah reproduksi:**
1. ___
2. ___
**Ekspektasi:** ___
**Aktual:** ___
**Screenshot:** (tempel / simpan di /tmp)
**Browser & ukuran layar:** ___
**Kategori:** [ ] UI/styling  [ ] Logika bisnis  [ ] Data/DB  [ ] Error 500  [ ] Lainnya
---
```

---

## Lampiran A — Spot Check API via curl (opsional)

Verifikasi cepat backend tanpa UI (butuh token, lihat `docs/api-endpoints.md`):

```bash
# Klasifikasi (raw bytes)
curl -X POST http://localhost:3000/api/listings/klasifikasi \
  -H "Cookie: sb-<ref>-auth-token=<sesi>" \
  -H "Content-Type: application/octet-stream" \
  --data-binary @scripts/fixtures/plastic-bottles.jpg
# → 200 { kategori, confidence, perlu_koreksi_manual, gagal }

# Buat listing → validasi: kategori/satuan/jumlah/koordinat
curl -X POST http://localhost:3000/api/listings \
  -H "Cookie: sb-<ref>-auth-token=<sesi>" -H "Content-Type: application/json" \
  -d '{"judul":"Test","kategoriCitra":"Cardboard","jumlah":10,"satuan":"kg","lokasiLat":-7.3,"lokasiLng":112.7}'
# → 201 { listing_id, status }

# PATCH dengan field status → WAJIB ditolak 400
curl -X PATCH http://localhost:3000/api/listings/<id> \
  -H "Cookie: sb-<ref>-auth-token=<sesi>" -H "Content-Type: application/json" \
  -d '{"status":"dipesan"}'
# → 400 "Perubahan status harus lewat endpoint klaim/selesai/batal"

# Klaim listing sendiri → ditolak 400 (pesan dari RPC)
# Selesaikan bukan pemilik → 400
# Batalkan oleh salah satu pihak → 200
```

> API lengkap: `docs/api-endpoints.md`.

---

## Lampiran B — Verifikasi Data di Supabase (opsional, setelah skenario)

Di SQL Editor dashboard Supabase (atau `psql`):

```sql
-- Semua listing + status (harus konsisten dengan tes)
select judul, status, kategori_citra, confidence_score
from public.listings order by created_at desc;

-- Listing yang kamu buat di Skenario B (pastikan kategori_dikoreksi benar)
select judul, kategori_citra, kategori_dikoreksi, status
from public.listings where judul like '%<judul tes>%';

-- Riwayat klaim setelah Skenario D/E
select l.judul, rk.status_akhir, rk.pengklaim_id, rk.diselesaikan_pada
from public.riwayat_klaim rk join public.listings l on l.id = rk.listing_id
order by rk.diklaim_pada desc;

-- Riwayat pencarian (otomatis tersimpan saat /cari dipakai)
select * from public.riwayat_pencarian order by dicari_pada desc limit 5;
```

---

*Dokumen pengetesan manual LoopLink — Trunodjoyo Creative Competition 2026 (Vibe Code).*
