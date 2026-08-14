# LoopLink — Dokumentasi API Endpoint (Fase 3)

**Base URL (dev):** `http://localhost:3000` (atau port yang dipakai `npm run dev`)

Semua response memakai `Response.json(...)`. Error berbentuk:

```json
{ "error": "pesan jelas bahasa Indonesia" }
```

Kode status:
- `401` → belum login (semua endpoint ber-label 🔒)
- `400` → validasi input gagal / RPC menolak
- `403` → bukan pemilik resource
- `404` → resource tidak ditemukan / tidak terlihat (RLS)
- `500` → error tak terduga di server

---

## Cara dapat token untuk header Authorization (test manual)

Autentikasi di-handle **Supabase Auth** (email/password) — LoopLink tidak punya
endpoint login sendiri. Route handler membaca sesi dari **cookie sesi Supabase**
(`sb-<project-ref>-auth-token`), jadi cara termudah menguji lewat curl adalah
memakai browser (login di halaman /login lalu endpoint berjalan otomatis).

Untuk test dengan curl/tool, pakai token dari Supabase Auth langsung:

```bash
# 1) Login ke GoTrue → ambil access_token
curl -X POST "$NEXT_PUBLIC_SUPABASE_URL/auth/v1/token?grant_type=password" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"budi@looplink.demo","password":"looplink123"}'
# → respons berisi access_token, refresh_token

# 2) Kirim token sebagai cookie sesi (yang dibaca route handler)
curl -H "Cookie: sb-<project-ref>-auth-token=<URL-encoded JSON sesi>" \
  -X POST http://localhost:3000/api/... 
```

Contoh skrip untuk membangun cookie dari sesi (lihat `scripts/smoke-test-api.mjs`):

```javascript
const { data: { session } } = await supabase.auth.signInWithPassword({
  email: "budi@looplink.demo", password: "looplink123",
});
const ref = process.env.NEXT_PUBLIC_SUPABASE_URL.match(/^https:\/\/([^.]+)\./)[1];
const cookie = `sb-${ref}-auth-token=${encodeURIComponent(JSON.stringify(session))}`;
```

---

## 1. Klasifikasi Citra

`POST /api/listings/klasifikasi` — 🔒 butuh login

Menerima foto dalam **2 format**:

**a) Raw binary** (`Content-Type: application/octet-stream`):

```bash
curl -X POST http://localhost:3000/api/listings/klasifikasi \
  -H "Cookie: sb-<ref>-auth-token=<sesi>" \
  -H "Content-Type: application/octet-stream" \
  --data-binary @foto-limbah.jpg
```

**b) JSON base64**:

```bash
curl -X POST http://localhost:3000/api/listings/klasifikasi \
  -H "Cookie: sb-<ref>-auth-token=<sesi>" \
  -H "Content-Type: application/json" \
  -d '{"gambar_base64":"<base64 foto>"}'
```

**Response 200** (sukses):

```json
{
  "kategori": "Cardboard",
  "confidence": 0.87,
  "perlu_koreksi_manual": false,
  "peringkat": [{ "label": "Cardboard", "score": 0.87 }],
  "gagal": false
}
```

**Response 200** (AI gagal/timeout — UI harus menampilkan "pilih manual",
**bukan** error 500):

```json
{
  "kategori": null,
  "confidence": 0,
  "perlu_koreksi_manual": true,
  "gagal": true,
  "alasan_gagal": "gagal memanggil API eksternal (TypeError)"
}
```

Error: `400` body tidak valid; `401` belum login.

---

## 2. Ekstraksi Teks (Gemini)

`POST /api/listings/ekstraksi-teks` — 🔒 butuh login

```bash
curl -X POST http://localhost:3000/api/listings/ekstraksi-teks \
  -H "Cookie: sb-<ref>-auth-token=<sesi>" \
  -H "Content-Type: application/json" \
  -d '{"deskripsiUser":"Kardus kering dari toko, sudah dipress","kategoriCitra":"Cardboard","usiaBulan":3}'
```

**Response 200** (sukses / gagal — keduanya 200, deskripsi bersifat opsional):

```json
{ "kondisi": "kering", "catatan_tambahan": "Kardus berasal dari toko dan sudah dipress.", "gagal": false }
```

Kalau Gemini gagal → `{ "kondisi": "tidak diketahui", "catatan_tambahan": "", "gagal": true, "alasan_gagal": "..." }`.

Error: `401` belum login; `400` body tidak valid.

---

## 3. Buat Listing

`POST /api/listings` — 🔒 butuh login

```bash
curl -X POST http://localhost:3000/api/listings \
  -H "Cookie: sb-<ref>-auth-token=<sesi>" \
  -H "Content-Type: application/json" \
  -d '{
    "judul": "Kardus bekas toko",
    "kategoriCitra": "Cardboard",
    "kategoriDikoreksi": false,
    "confidenceScore": 0.93,
    "deskripsiTeks": "Kardus bersih dari toko, sudah dipress rapi.",
    "jumlah": 500,
    "satuan": "kg",
    "lokasiLat": -7.33,
    "lokasiLng": 112.79,
    "expiredAt": "2026-08-21T00:00:00Z",
    "foto": [{ "fotoUrl": "https://placehold.co/600x400?text=Kardus", "urutan": 1 }]
  }'
```

`user_id` **diambil dari session**, bukan body (body `user_id` apa pun diabaikan).

**Response 201:**

```json
{ "listing_id": "d89f6f08-3480-496c-9a3c-02ccc3645f9f", "status": "tersedia" }
```

Validasi: `judul` wajib; `kategoriCitra` ∈ 12 kelas; `satuan` ∈ `kg|karung|ton|unit`;
`jumlah > 0`; `lokasiLat` ∈ [-90,90]; `lokasiLng` ∈ [-180,180]. Error lain → `400`.

---

## 4. Detail / Edit / Hapus Listing

### GET ` /api/listings/[id]` — 🔒 opsional (lihat kontak pemilik)

```bash
curl http://localhost:3000/api/listings/d89f6f08-3480-496c-9a3c-02ccc3645f9f
# dengan Cookie sesi kalau mau dapat info kontak pemilik
```

**Response 200:**

```json
{
  "id": "d89f6f08-3480-496c-9a3c-02ccc3645f9f",
  "user_id": "...",
  "judul": "Kardus bekas toko",
  "kategori_citra": "Cardboard",
  "status": "tersedia",
  "jumlah": 500,
  "satuan": "kg",
  "foto": [{ "foto_url": "https://...", "urutan": 1 }],
  "pemilik": { "nama_lengkap": "Budi Santoso", "no_telepon": "0812-...", "alamat_teks": "Jl. ..." }
}
```

- `pemilik` berisi `null` kalau request belum login.
- `404` kalau listing tidak ada / tidak terlihat (RLS: hanya `tersedia` atau milik sendiri).

### PATCH ` /api/listings/[id]` — 🔒 butuh login + pemilik

```bash
curl -X PATCH http://localhost:3000/api/listings/d89f6f08-3480-496c-9a3c-02ccc3645f9f \
  -H "Cookie: sb-<ref>-auth-token=<sesi>" \
  -H "Content-Type: application/json" \
  -d '{"judul":"Kardus bekas toko (sudah dipilah)","jumlah":450}'
```

Whitelist field PATCH: `judul, kategori_citra, kategori_dikoreksi, confidence_score,
deskripsi_teks, jumlah, satuan, lokasi_lat, lokasi_lng`.

**Response 200:** `{ "success": true, "listing": { ... } }`

- `400` kalau body mengandung `status`/`diklaim_oleh`/`diklaim_pada`/`dibatalkan_oleh`
  (pesan: *"Perubahan status harus lewat endpoint klaim/selesai/batal"*).
- `403` kalau bukan pemilik; `404` listing tidak ditemukan.

### DELETE ` /api/listings/[id]` — 🔒 butuh login + pemilik + status `tersedia`

```bash
curl -X DELETE http://localhost:3000/api/listings/d89f6f08-3480-496c-9a3c-02ccc3645f9f \
  -H "Cookie: sb-<ref>-auth-token=<sesi>"
```

**Response 200:** `{ "success": true }`

- `400` kalau status bukan `tersedia`.
- ⚠️ **Keterbatasan schema:** listing yang pernah diklaim lalu dibatalkan punya baris
  `riwayat_klaim` (FK tanpa cascade) sehingga DELETE ditolak DB
  (`riwayat_klaim_listing_id_fkey`). Kode mem-forward pesan error DB sebagai `400`.

---

## 5. Pencarian Listings (matching + riwayat)

`POST /api/listings/cari` — 🔒 butuh login

```bash
curl -X POST http://localhost:3000/api/listings/cari \
  -H "Cookie: sb-<ref>-auth-token=<sesi>" \
  -H "Content-Type: application/json" \
  -d '{
    "kategoriKebutuhan": "Bahan baku daur ulang kertas",
    "radiusKm": 30,
    "lokasiLat": -7.453,
    "lokasiLng": 112.713,
    "jumlahDibutuhkan": 40
  }'
```

**Response 200:**

```json
{
  "hasil": [
    {
      "listing_id": "uuid",
      "judul": "Karton bekas pabrik (press)",
      "kategori_citra": "Cardboard",
      "jarak_km": 3.2,
      "skor_akhir": 0.86,
      "foto_url": "https://...",
      "jumlah": 500,
      "satuan": "kg"
    }
  ]
}
```

Perilaku:
- Listing sendiri TIDAK muncul (filter `user_id != user.id`).
- Listing di luar `radiusKm` TIDAK muncul (aturan radius wajib).
- Skor = `(skor_kategori × 0.5) + (skor_jarak × 0.3) + (skor_volume × 0.2)`; skor `0` dibuang.
- Hasil diurutkan `skor_akhir` DESC, maksimal 50 item.
- Hasil otomatis disimpan ke `riwayat_pencarian` + `riwayat_pencarian_hasil`
  (via service-role client). Kegagalan simpan riwayat **tidak** menggagalkan respons.

Validasi: `kategoriKebutuhan` wajib; `radiusKm > 0`; `jumlahDibutuhkan > 0`;
`lokasiLat/lokasiLng` finite. Selain itu `400`.

---

## 6. Klaim Listing

`POST /api/listings/[id]/klaim` — 🔒 butuh login (pengklaim ≠ pemilik)

```bash
curl -X POST http://localhost:3000/api/listings/d89f6f08-3480-496c-9a3c-02ccc3645f9f/klaim \
  -H "Cookie: sb-<ref>-auth-token=<sesi>"
```

**Response 200:** `{ "success": true }`

`400` kalau RPC menolak, pesan dari database (contoh):
`"Listing tidak tersedia untuk diklaim atau ini listing milik sendiri"`.

---

## 7. Selesaikan Transaksi (pemilik)

`POST /api/listings/[id]/selesai` — 🔒 butuh login (hanya pemilik listing)

```bash
curl -X POST http://localhost:3000/api/listings/d89f6f08-3480-496c-9a3c-02ccc3645f9f/selesai \
  -H "Cookie: sb-<ref>-auth-token=<sesi>"
```

**Response 200:** `{ "success": true }` — menulis `riwayat_klaim` dengan `status_akhir='selesai'`.

`400` kalau RPC menolak, misal:
`"Tidak berhak menyelesaikan listing ini atau statusnya bukan dipesan"`.

---

## 8. Batalkan Klaim (pemilik atau pengklaim)

`POST /api/listings/[id]/batal` — 🔒 butuh login (salah satu pihak)

```bash
curl -X POST http://localhost:3000/api/listings/d89f6f08-3480-496c-9a3c-02ccc3645f9f/batal \
  -H "Cookie: sb-<ref>-auth-token=<sesi>"
```

**Response 200:** `{ "success": true }` — status kembali `tersedia`,
`dibatalkan_oleh` tercatat, `riwayat_klaim` ditulis.

`400` kalau RPC menolak, misal:
`"Tidak berhak membatalkan klaim ini atau statusnya bukan dipesan"`.

---

## 9. Lapor Listing

`POST /api/laporan` — 🔒 butuh login

```bash
curl -X POST http://localhost:3000/api/laporan \
  -H "Cookie: sb-<ref>-auth-token=<sesi>" \
  -H "Content-Type: application/json" \
  -d '{"listingId":"d89f6f08-3480-496c-9a3c-02ccc3645f9f","alasan":"Foto tidak sesuai dengan isi"}'
```

`pelapor_id` **diambil dari session**, bukan body.

**Response 201:**

```json
{ "success": true, "laporan_id": "ffd05caa-5cdc-42fd-be2b-df29f40381c4" }
```

Validasi: `listingId` harus UUID valid; `alasan` non-empty (trim). Selain itu `400`.