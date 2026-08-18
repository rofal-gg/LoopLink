# LoopLink — Tahap 1: Ide / Inisiasi

**Kompetisi:** Trunodjoyo Creative Competition 2026 — Cabang Vibe Code
**Tema:** Shaping Tomorrow: Digital Innovation, Artificial Intelligence, and Sustainable Communities

---

## Masalah

Limbah dari siapa saja — individu, rumah tangga, UMKM, sampai industri — banyak yang terbuang sia-sia, dibakar secara terbuka, atau menumpuk di TPA. Di sisi lain, ada pihak (terutama UMKM padat energi seperti pabrik tahu) yang membutuhkan bahan alternatif tapi kesulitan menemukan sumbernya karena distribusi limbah saat ini tidak efisien dan dikuasai pengepul dengan biaya mahal.

## Solusi

**LoopLink** — platform bursa pertukaran limbah hiper-lokal yang mempertemukan siapa saja yang punya limbah dengan pihak yang membutuhkannya di sekitar lokasi mereka. Pengguna cukup memfoto limbahnya, AI otomatis mengenali jenisnya, lalu sistem mencocokkan dengan pencari yang cocok di dekatnya.

## Diferensiasi dari Platform Sejenis

Bukan sekadar tempat "buang sampah biar didaur ulang" seperti platform daur ulang rumah tangga yang sudah ada, tapi bursa pertukaran yang mempertemukan kebutuhan riil secara hiper-lokal (misal limbah kayu jadi bahan bakar UMKM), dengan penekanan pada algoritma pencocokan dan variasi kategori limbah yang lebih luas.

## Target Pengguna

- Siapa saja yang memiliki limbah (rumah tangga, UMKM, industri) — **tanpa pembatasan peran**
- Pihak yang mencari bahan alternatif (UMKM padat energi, pengrajin, dll)
- Satu akun dapat berperan sebagai keduanya sekaligus

## Gambaran AI/ML

| Tugas | Teknologi | Jenis |
|---|---|---|
| Klasifikasi jenis limbah dari foto | `google/vit-base-patch16-224` (ImageNet-1k) via HuggingFace Inference Router + pemetaan `PEMETAAN_LABEL_IMAGENET` ke 12 kategori | Computer Vision (ML utama) |
| Ekstraksi detail dari teks tambahan | Gemini 1.5 Flash (Google AI Studio, dipanggil lewat alias `gemini-flash-latest`) | Generative AI |
| Skor akhir kecocokan | Formula rule-based (tabel kecocokan kategori + jarak + volume, tanpa embedding) | Logika bisnis |

**Riwayat keputusan (catatan sejarah):** rencana awal klasifikasi citra memakai `watersplash/waste-classification` (HuggingFace, 12 kelas limbah langsung). Model itu sudah tidak diserve provider mana pun, jadi keputusan final diganti ke `google/vit-base-patch16-224` (ImageNet-1k) via HuggingFace Inference Router + tabel pemetaan label `PEMETAAN_LABEL_IMAGENET` (detail di Tahap 3 dan `lib/ai/klasifikasi.js`). Gemini TIDAK dipakai untuk klasifikasi citra — perannya hanya ekstraksi teks.

---

*Bagian dari dokumentasi Spec-Driven Development (SDD) project LoopLink.*
