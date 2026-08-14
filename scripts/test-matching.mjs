// scripts/test-matching.mjs
//
// Test manual (tanpa framework) untuk lib/ai/matching.js — jalankan:
//
//   node scripts/test-matching.mjs
//
// Tidak butuh jaringan / API key. Exit code non-zero kalau ada FAIL.
// Test memakai pasangan kategori & skor_dasar PERSIS dari supabase/seed.sql
// BAGIAN A (baseline kategori_kecocokan yang sudah ter-apply di Supabase).

import { hitungJarakKm, hitungSkorKecocokan } from "../lib/ai/matching.js";

// ---------------------------------------------------------------------------
// Harness mini
// ---------------------------------------------------------------------------
let passed = 0;
let failed = 0;
const results = [];

function check(nama, cond, detail = "") {
  if (cond) {
    passed += 1;
    results.push(`PASS  ${nama}${detail ? `  → ${detail}` : ""}`);
  } else {
    failed += 1;
    results.push(`FAIL  ${nama}${detail ? `  → ${detail}` : ""}`);
  }
}

function hampirSama(a, b, tol = 1e-9) {
  return Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= tol;
}

function pastikanMelempar(nama, fn) {
  try {
    fn();
    check(nama, false, "harusnya melempar TypeError tapi tidak");
  } catch (e) {
    check(nama, e instanceof TypeError, `melempar: ${e.name}`);
  }
}

// ---------------------------------------------------------------------------
// Fixture kategori_kecocokan — SALINAN PERSIS seed.sql BAGIAN A
// ---------------------------------------------------------------------------
const TABEL_KECOCOKAN = [
  { kategori_limbah: "Cardboard", kategori_kebutuhan: "Bahan bakar biomassa", skor_dasar: 0.9 },
  { kategori_limbah: "Cardboard", kategori_kebutuhan: "Bahan baku daur ulang kertas", skor_dasar: 1.0 },
  { kategori_limbah: "Biological", kategori_kebutuhan: "Bahan bakar biomassa", skor_dasar: 1.0 },
  { kategori_limbah: "Biological", kategori_kebutuhan: "Kompos", skor_dasar: 1.0 },
  { kategori_limbah: "Clothes", kategori_kebutuhan: "Bahan baku tekstil daur ulang", skor_dasar: 1.0 },
  { kategori_limbah: "Metal", kategori_kebutuhan: "Bahan baku pengecoran", skor_dasar: 1.0 },
  { kategori_limbah: "Plastic", kategori_kebutuhan: "Bahan bakar RDF", skor_dasar: 0.7 },
];

const TJ = { kategoriListing: "Cardboard", kategoriDicari: "Bahan baku daur ulang kertas", tabelKecocokan: TABEL_KECOCOKAN };

// ---------------------------------------------------------------------------
// A. hitungJarakKm — Haversine
// ---------------------------------------------------------------------------
// Monas Jakarta (-6.1754, 106.8272) → Surabaya pusat (-7.2575, 112.7521)
// sesuai lokasi akun admin di seed.sql. Referensi umum ~665-670 km.
const D_MONAS_SBY = hitungJarakKm(-6.1754, 106.8272, -7.2575, 112.7521);
check(
  "jarak Monas→Surabaya",
  D_MONAS_SBY >= 660 && D_MONAS_SBY <= 670,
  `${D_MONAS_SBY.toFixed(3)} km (harap 660–670)`
);

check("jarak titik sama = 0", hitungJarakKm(-6.1754, 106.8272, -6.1754, 106.8272) === 0, "0 km");

const D_BALIK = hitungJarakKm(-7.2575, 112.7521, -6.1754, 106.8272);
check("jarak simetris (A→B ≈ B→A)", hampirSama(D_MONAS_SBY, D_BALIK), `${D_BALIK.toFixed(3)} km`);

// Guard: input invalid → TypeError jelas (bukan diam-diam jadi 0).
pastikanMelempar("jarak NaN → TypeError", () => hitungJarakKm(NaN, 106.8272, -7.2575, 112.7521));
pastikanMelempar("jarak string acak → TypeError", () => hitungJarakKm("abc", 106.8272, -7.2575, 112.7521));
pastikanMelempar("jarak null → TypeError", () => hitungJarakKm(null, 106.8272, -7.2575, 112.7521));
check("jarak string numerik diterima", Number.isFinite(hitungJarakKm("-6.2", "106.8", "-7.3", "112.8")), "");

// ---------------------------------------------------------------------------
// B. hitungSkorKecocokan — formula 0.5/0.3/0.2
// ---------------------------------------------------------------------------
// B.1 Kategori tidak cocok (Paper → Kompos) → 0 langsung.
const noMatch = hitungSkorKecocokan({ ...TJ, kategoriListing: "Paper", kategoriDicari: "Kompos", jarakKm: 1, radiusKm: 10, jumlahTersedia: 100, jumlahDibutuhkan: 100 });
check("kategori tidak cocok → 0", noMatch === 0, `skor=${noMatch}`);

// B.2 Cocok, jarak 5/10, volume penuh → 1.0*0.5 + 0.5*0.3 + 1.0*0.2 = 0.85
const cocokBiasa = hitungSkorKecocokan({ ...TJ, jarakKm: 5, radiusKm: 10, jumlahTersedia: 100, jumlahDibutuhkan: 100 });
check("cocok, jarak 5/10, volume penuh = 0.85", hampirSama(cocokBiasa, 0.85), `skor=${cocokBiasa}`);

// B.3 Cocok di batas radius: 10/10 → skor_jarak 0 → 1.0*0.5 + 0 + 1.0*0.2 = 0.7
const batasRadius = hitungSkorKecocokan({ ...TJ, jarakKm: 10, radiusKm: 10, jumlahTersedia: 100, jumlahDibutuhkan: 100 });
check("cocok tepat di radius → skor_jarak 0 = 0.7", hampirSama(batasRadius, 0.7), `skor=${batasRadius}`);

// B.4 Cocok di luar radius: 20/10 → max(0, -1) = 0 (tetap dapat skor kategori+volume)
const luarRadius = hitungSkorKecocokan({ ...TJ, jarakKm: 20, radiusKm: 10, jumlahTersedia: 100, jumlahDibutuhkan: 100 });
check("cocok di luar radius → skor_jarak di-clamp 0 = 0.7", hampirSama(luarRadius, 0.7), `skor=${luarRadius}`);

// B.5 Plastic→RDF skor_dasar 0.7, jarak 0, volume penuh → 0.7*0.5+1*0.3+1*0.2=0.85
const plastic = hitungSkorKecocokan({ ...TJ, kategoriListing: "Plastic", kategoriDicari: "Bahan bakar RDF", jarakKm: 0, radiusKm: 10, jumlahTersedia: 100, jumlahDibutuhkan: 100 });
check("Plastic→RDF 0.7, jarak 0, volume penuh = 0.85", hampirSama(plastic, 0.85), `skor=${plastic}`);

// B.6 Volume sebagian: 50/100 → skor_volume 0.5 → 0.5+0.3+0.1=0.9
const volumeSebagian = hitungSkorKecocokan({ ...TJ, jarakKm: 0, radiusKm: 10, jumlahTersedia: 50, jumlahDibutuhkan: 100 });
check("volume sebagian 50/100 = 0.9", hampirSama(volumeSebagian, 0.9), `skor=${volumeSebagian}`);

// B.7 Volume tidak cukup: 10/100 → 0.1 → 0.5+0.3+0.02=0.82 (skor tetap > 0, kecil)
const volumeKurang = hitungSkorKecocokan({ ...TJ, jarakKm: 0, radiusKm: 10, jumlahTersedia: 10, jumlahDibutuhkan: 100 });
check("volume kurang 10/100 = 0.82", hampirSama(volumeKurang, 0.82), `skor=${volumeKurang}`);

// B.8 Volume berlebih di-clamp 1 → skor maksimal = 1.0
const volumeLebih = hitungSkorKecocokan({ ...TJ, jarakKm: 0, radiusKm: 10, jumlahTersedia: 500, jumlahDibutuhkan: 100 });
check("volume lebih di-clamp 1 = 1.0", hampirSama(volumeLebih, 1.0), `skor=${volumeLebih}`);

// B.9 Guard radiusKm <= 0 → skor_jarak 0 (fallback terdokumentasi)
const radiusNol = hitungSkorKecocokan({ ...TJ, jarakKm: 5, radiusKm: 0, jumlahTersedia: 100, jumlahDibutuhkan: 100 });
check("radiusKm 0 → skor_jarak 0 = 0.7", hampirSama(radiusNol, 0.7), `skor=${radiusNol}`);

// B.10 Guard jumlahDibutuhkan <= 0 → skor_volume 0
const butuhNol = hitungSkorKecocokan({ ...TJ, jarakKm: 0, radiusKm: 10, jumlahTersedia: 100, jumlahDibutuhkan: 0 });
check("jumlahDibutuhkan 0 → skor_volume 0 = 0.8", hampirSama(butuhNol, 0.8), `skor=${butuhNol}`);

// B.11 Semua angka dibuat string/NaN → hasil tetap finite di [0,1], tidak throw
const aneh = hitungSkorKecocokan({ ...TJ, jarakKm: "NaN", radiusKm: "x", jumlahTersedia: undefined, jumlahDibutuhkan: null });
check("input invalid → hasil finite & [0,1]", Number.isFinite(aneh) && aneh >= 0 && aneh <= 1, `skor=${aneh}`);

// B.12 tabelKecocokan bukan array → 0 (defensif)
const tabelBukanArray = hitungSkorKecocokan({ ...TJ, tabelKecocokan: null });
check("tabelKecocokan null → 0", tabelBukanArray === 0, `skor=${tabelBukanArray}`);

// B.13 Clamp bawah/atas — tidak pernah > 1 atau < 0 (skenario terburuk dipaksa maks 1)
const maxBatas = hitungSkorKecocokan({ ...TJ, jarakKm: 0, radiusKm: 10, jumlahTersedia: 1000, jumlahDibutuhkan: 1 });
check("skor maksimum di-clamp ≤ 1", maxBatas <= 1 && hampirSama(maxBatas, 1), `skor=${maxBatas}`);

// ---------------------------------------------------------------------------
// Ringkasan
// ---------------------------------------------------------------------------
console.log("\n=== HASIL TEST MATCHING ===");
for (const r of results) console.log(r);
console.log(`\n${passed} PASS, ${failed} FAIL`);
process.exit(failed > 0 ? 1 : 0);