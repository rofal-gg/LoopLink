# LoopLink — Tahap 2: Requirements / Spec

**Kompetisi:** Trunodjoyo Creative Competition 2026 — Cabang Vibe Code

---

## A. Fitur Utama

**1. Autentikasi**
- Registrasi & login dengan **satu jenis akun** — tanpa pemilihan peran di awal
- Setelah login, semua user punya akses yang sama ke dua aksi utama: **Upload Limbah** dan **Cari Bahan**

**2. Upload Limbah**
- Ambil/upload foto limbah
- AI otomatis mengenali jenis limbah dari foto
- Tambahan opsional: deskripsi teks singkat, jumlah/volume, lokasi (otomatis dari device atau input manual)
- Konfirmasi sebelum listing tayang (user bisa koreksi kalau AI salah kenali)
- Listing yang sudah diupload muncul di halaman "Limbah Saya" milik user tersebut

**3. Cari Bahan**
- Input kebutuhan (jenis bahan yang dicari, radius lokasi)
- Sistem menampilkan listing yang cocok dari **user lain** (bukan listing milik sendiri), diurutkan berdasarkan skor kecocokan
- Bisa lihat detail listing: foto, jenis, jumlah, jarak, kontak pemilik

**4. Interaksi Sederhana**
- Tombol "Amankan" untuk klaim listing (masuk status "dipesan")
- Status listing: Tersedia → Dipesan → Selesai
- Info kontak dasar ditampilkan agar kedua pihak lanjut komunikasi di luar sistem (WA, telepon)

## B. Aturan Bisnis

- **User tidak bisa mengklaim listingnya sendiri** — sistem otomatis menyembunyikan tombol "Amankan" kalau listing tersebut milik user yang sedang login
- Satu listing hanya bisa diklaim oleh satu pihak pada satu waktu (begitu status "Dipesan", listing hilang dari hasil pencarian pihak lain)
- Pemilik listing berhak membatalkan/menandai listing selesai kapan saja
- Radius pencarian default bisa disesuaikan pengguna (misal 5-20 km) untuk menjaga konsep hiper-lokal
- Kategori dari AI adalah rekomendasi, bukan keputusan final — user tetap bisa mengoreksi sebelum listing tayang

## C. Kebutuhan Data

- **Pengguna**: identitas dasar, lokasi umum, kontak — tanpa atribut peran/role (semua user setara)
- **Listing**: foto, kategori (hasil AI), deskripsi, jumlah/satuan, lokasi spesifik, status, waktu dibuat, user_id pemilik (dipakai juga untuk logika "sembunyikan tombol klaim untuk pemilik sendiri")
- **Kecocokan**: dihitung real-time saat pencarian, tidak perlu disimpan permanen

## D. Kriteria Keberhasilan

1. Foto limbah yang diupload berhasil dikenali kategorinya oleh AI dengan tingkat keyakinan yang wajar
2. User bisa menemukan listing relevan milik user lain dalam radius yang ditentukan
3. Alur upload → tampil di pencarian → diklaim → status berubah, berjalan tanpa error
4. User tidak bisa melihat tombol klaim pada listing miliknya sendiri
5. Skenario demo (dengan data dummy, beberapa akun berbeda) menunjukkan minimal 1 kasus pencocokan yang masuk akal secara logika bisnis

---

*Bagian dari dokumentasi Spec-Driven Development (SDD) project LoopLink.*
