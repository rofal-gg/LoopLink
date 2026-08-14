# Migrasi UI LoopLink ke Kanon Desain

> Sumber kebenaran: `design_loop_link/` (implementasi referensi) dan `.opencode/agents/design-taste-frontend.md` bagian LOOPLINK PROJECT CANON.
> Prinsip: struktur/layout mengikuti referensi presisi; yang berubah hanya warna/tipografi/konten, dan konten memakai data nyata project.
> Status: rencana eksekusi menyusul (belum dieksekusi).

---

## Ringkasan Perubahan

| Area | Sebelum (design lama) | Sesudah (kanon) |
|---|---|---|
| Palet | `leaf-*` + stone, dark mode | `loop-*` (#1C2B22, #F6F3EA, #3C7A5C, #E8752C, #DCE3D3, #8C9184) |
| Font | Geist + Geist Mono | Fraunces (display), Inter/Public Sans (body), IBM Plex Mono (utility/data) |
| Tema | dual-mode stone | Landing: krem base + blok gelap `loop-ink`; app pages: token `loop-*` (dark mode boleh) |
| Landing | 6 section sederhana | 18 section mengikuti referensi |
| Ikon | icons.jsx (manual) | tetap icons.jsx, diperluas mengikuti konvensi yang ada |

---

## Fase 1 - Token & Font (fondasi)

1. `app/globals.css`
   - Hapus `@theme` `--color-leaf-*`, ganti dengan token `loop-*`:
     ```css
     --color-loop-ink: #1C2B22;
     --color-loop-base: #F6F3EA;
     --color-loop-primary: #3C7A5C;
     --color-loop-signal: #E8752C;
     --color-loop-mist: #DCE3D3;
     --color-loop-line: #8C9184;
     ```
   - Set `--background: #F6F3EA`, `--foreground: #1C2B22` (landing). Hapus dark-mode `prefers-color-scheme` untuk landing (blok kontras gelap ditangani per-section).
   - `--font-display`, `--font-body`, `--font-mono` di `@theme`.
   - Pertahankan utilitas `ll-*` yang masih relevan, selaraskan warna ke token baru.
2. `app/layout.js`
   - Ganti `next/font` Geist dengan Fraunces, Inter, IBM Plex Mono (variabel `--font-display`, `--font-body`, `--font-mono`).
3. `design_loop_link/src/index.css` = referensi animasi/komponen (reveal, float, ticker, step-node, nav-link, scrollbar) yang bisa disalin ke globals.css.

## Fase 2 - Landing Page (app/page.js)

- Rebuild ke 18 section sesuai urutan referensi (lihat CANON). Urutan:
  1. Navbar glass pills (logo + nav + Masuk/Daftar)
  2. Hero split asimetris + blob + 2 floating listing cards + live badge
  3. ActivityTicker (LIVE FEED marquee)
  4. Features 6 kartu
  5. TrustBand gelap + 5 badge kategori
  6. ImpactStats 6 angka count-up
  7. CategoryExplorer (tab kategori + tips AI)
  8. AppPreview (phone mockup)
  9. FeaturedListings (filter + grid + scroll-snap mobile)
  10. EnvironmentalProgress
  11. CommunityGallery masonry
  12. Testimonials
  13. WhyLoopLink (tabel + CTA band)
  14. ProcessSteps 5 node
  15. FAQ
  16. Newsletter
  17. CTABanner
  18. Footer
- Data: gunakan `KELAS_MODEL` (12 kelas), `kategori_kecocokan`, seed listing, status listing. Buat fetch opsional ke Supabase untuk listing real bila halaman dynamic (atau tampilkan seed/data statis untuk kecepatan).
- Badge kategori memakai `--loop-signal`, badge status `tersedia` pakai `--loop-primary`.
- Semua angka statistik IBM Plex Mono.

## Fase 3 - Komponen Bersama

| File | Perubahan |
|---|---|
| `components/brand/Logo.jsx` | mark tile hijau: `fill-loop-primary` (atau loop-ink), teks "Link" `text-loop-primary` |
| `components/ui/Button.jsx` | primary `bg-loop-primary hover:bg-loop-ink`; sekunder border loop-line; ghost loop-primary; danger tetap merah |
| `components/ui/Inputs.jsx` | fokus `focus:border-loop-primary focus:ring-loop-primary/15`; bg `--loop-base`; error tetap merah |
| `components/AppHeader.jsx` | token loop; nav active `bg-loop-primary/10 text-loop-primary`; avatar `bg-loop-primary` |
| `components/auth/AuthShell.jsx` | bg `--loop-base`, kartu putih, fokus loop |
| `components/ComingSoon.jsx` | token loop |
| `components/icons.jsx` | pertahankan konvensi (viewBox 24, stroke 1.8, round, currentColor); tambah ikon yang dibutuhkan section baru (mis. RefreshCw untuk logo nav, Filter, Clock, Layers, Award, dll.) |

## Fase 4 - Halaman App & Auth

- `app/home/page.js`: token loop; heading Fraunces; kartu dua aksi; status lokasi; ringkasan listing.
- `app/login`, `app/register`, `app/lupa-password`, `app/reset-password`, `app/setup-lokasi`: pakai AuthShell baru + token loop.
- `app/upload`, `app/cari`: nanti saat fase 4.3/4.4 dibangun, pakai kanon + data nyata.

## Checklist Per-Release

- [ ] Tidak ada sisa `bg-leaf-*` / `text-leaf-*` di file yang dimigrasi.
- [ ] Font Fraunces/Inter/IBM Plex Mono aktif.
- [ ] Landing mengikuti urutan 18 section referensi.
- [ ] `--loop-signal` hanya di badge status / highlight kata.
- [ ] Semua angka pakai font-mono.
- [ ] Mobile collapse mengikuti pola referensi (hero 1 kolom, grid menurun, scroll-snap).
- [ ] `prefers-reduced-motion` tetap dihormati.
- [ ] `npm run lint` lolos.
