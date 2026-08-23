// scripts/test-klasifikasi.mjs
//
// Test manual (tanpa framework) untuk lib/ai/klasifikasi.js — jalankan:
//
//   node scripts/test-klasifikasi.mjs
//
// Jalur yang diuji:
//   (1) Logika deterministik via fetch palsu — mock respons HF Space
//       `{ hasil: [...] }` dengan label lowercase 12 kelas model
//       `watersplash/waste-classification` yang NYATA ada di LABEL_KE_KELAS:
//       sukses, confidence rendah (threshold 0.6), persis threshold, label
//       TIDAK terpetakan, non-OK, fetch timeout, JSON rusak, respons objek
//       error, hasil kosong — semuanya tanpa jaringan.
//   (2) Validasi input: undefined/null/object/string → fallback TANPA fetch.
//   (3) Guard env kosong (KLASIFIKASI_API_URL / KLASIFIKASI_API_TOKEN) →
//       fallback TANPA fetch.
//   (4) LIVE: pakai fixture yang SUDAH ADA di scripts/fixtures/ (jangan diunduh
//       ulang). Kalau file hilang, baru diunduh dari Wikimedia Commons sebagai
//       fallback. Fixture demo (botol plastik, karton susu, kaleng, kaca,
//       kertas) tetap valid untuk model 12 kelas baru. Label model yang tidak
//       terpetakan dicatat sebagai WARN (label asli dicetak biar mapping bisa
//       dievaluasi), bukan FAIL.
// Exit code non-zero kalau ada FAIL. Tidak print API key, tidak uncaught error.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { muatEnvLocal } from "./load-env.mjs";
import {
  klasifikasiCitra,
  CONFIDENCE_THRESHOLD,
  LABEL_KE_KELAS,
} from "../lib/ai/klasifikasi.js";

muatEnvLocal();

const URL_ASLI = process.env.KLASIFIKASI_API_URL || "";
const TOKEN_ASLI = process.env.KLASIFIKASI_API_TOKEN || "";
const FIXTURES_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "fixtures");
const UA = "LoopLink-Test/1.0 (demo; competition)";

// Sumber foto limbah publik (Wikimedia Commons) — HANYA dipakai sebagai
// fallback kalau fixture lokal ternyata belum ada (biasanya sudah tersedia).
// Fixture demo resmi sudah diverifikasi live terhadap model 12 kelas
// `watersplash/waste-classification` yang di-serve via HF Space: label top-1
// lowercase terpetakan ke KELAS_MODEL yang sesuai dan confidence ≥ 0.75.
const SUMBER_FOTO = [
  {
    nama: "plastic-bottles.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Plastic_Bottles_-_Waste_%287992944072%29.jpg/960px-Plastic_Bottles_-_Waste_%287992944072%29.jpg",
  },
  {
    nama: "cardboard-milk-carton.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/-2022-02-09_A_2_Litre_carton_of_skimmed_milk%2C_Trimingham%2C_Norfolk_%281%29.JPG/960px--2022-02-09_A_2_Litre_carton_of_skimmed_milk%2C_Trimingham%2C_Norfolk_%281%29.JPG",
  },
  {
    nama: "cardboard-milk-carton-2.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/-2022-02-09_A_2_Litre_carton_of_skimmed_milk%2C_Trimingham%2C_Norfolk_%282%29.JPG/960px--2022-02-09_A_2_Litre_carton_of_skimmed_milk%2C_Trimingham%2C_Norfolk_%282%29.JPG",
  },
  {
    nama: "cardboard-milk-carton-3.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/-2022-02-09_A_2_Litre_carton_of_skimmed_milk%2C_Trimingham%2C_Norfolk_%283%29.JPG/960px--2022-02-09_A_2_Litre_carton_of_skimmed_milk%2C_Trimingham%2C_Norfolk_%283%29.JPG",
  },
  {
    nama: "metal-milk-can.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Aluminium_milk_churn_stamped_with_level_markers_from_4_to_10_gallons.jpg/960px-Aluminium_milk_churn_stamped_with_level_markers_from_4_to_10_gallons.jpg",
  },
  {
    nama: "metal-milk-can-2.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Boite_%C3%A0_lait_en_aluminium.jpg/960px-Boite_%C3%A0_lait_en_aluminium.jpg",
  },
  {
    nama: "metal-milk-cans.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Bidons_%C3%A0_lait.JPG/960px-Bidons_%C3%A0_lait.JPG",
  },
  {
    nama: "glass-beer-bottles.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Empty_beer_bottles_%288366792035%29.jpg/960px-Empty_beer_bottles_%288366792035%29.jpg",
  },
  {
    nama: "glass-wine-bottle.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/2010-365-236_Wine_Time_%284926789346%29.jpg/960px-2010-365-236_Wine_Time_%284926789346%29.jpg",
  },
  {
    nama: "glass-beer-glasses.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/2_5_dl_beer_glasses_from_1958_FIFA_football_world_cup_Sweden.jpg/960px-2_5_dl_beer_glasses_from_1958_FIFA_football_world_cup_Sweden.jpg",
  },
  {
    nama: "paper-copy-stack.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Stack_of_Copy_Paper.jpg/960px-Stack_of_Copy_Paper.jpg",
  },
  {
    nama: "paper-toilet-rolls.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stacked_rolls_of_toilet_paper%2C_Tunnicliff%27s_Tavern_%2877209%29.jpg/960px-Stacked_rolls_of_toilet_paper%2C_Tunnicliff%27s_Tavern_%2877209%29.jpg",
  },
  {
    nama: "paper-comic-books.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Fan_Expo_2014_-_Stacks_%289669608946%29.jpg/960px-Fan_Expo_2014_-_Stacks_%289669608946%29.jpg",
  },
];

let passed = 0;
let failed = 0;
let warned = 0;
const results = [];

function catat(status, nama, detail = "") {
  if (status === "PASS") passed += 1;
  else if (status === "FAIL") failed += 1;
  else warned += 1;
  results.push(`${status}  ${nama}${detail ? `  → ${detail}` : ""}`);
}

function cek(cond, nama, detail) {
  catat(cond ? "PASS" : "FAIL", nama, detail ?? (cond ? "" : "kondisi tidak terpenuhi"));
}

function validasiShape(r) {
  return (
    r &&
    typeof r === "object" &&
    typeof r.gagal === "boolean" &&
    "kategori" in r &&
    "confidence" in r &&
    "perlu_koreksi_manual" in r
  );
}

// ---------------------------------------------------------------------------
// Mock fetch helper
// ---------------------------------------------------------------------------
let panggilanFetch = [];
async function denganFetchPalsu(handler, fn) {
  const asli = globalThis.fetch;
  panggilanFetch = [];
  globalThis.fetch = async (...args) => {
    panggilanFetch.push(args);
    return handler(...args);
  };
  try {
    return await fn();
  } finally {
    globalThis.fetch = asli;
  }
}

const responsHF = ({ ok = true, status = 200, jsonValue }) => ({
  ok,
  status,
  json: async () => {
    if (jsonValue instanceof Error) throw jsonValue;
    return jsonValue;
  },
});

// Pastikan env dummy ada supaya mock test sampai ke fetch (bukan guard).
process.env.KLASIFIKASI_API_URL = "https://dummy-test-space.hf.space";
process.env.KLASIFIKASI_API_TOKEN = "dummy-test-key";

// (1a) Sukses, confidence tinggi + label model terpetakan → tidak perlu koreksi
await denganFetchPalsu(
  () =>
    responsHF({
      jsonValue: {
        hasil: [
          { label: "cardboard", score: 0.95 },
          { label: "paper", score: 0.03 },
          { label: "metal", score: 0.02 },
        ],
      },
    }),
  async () => {
    const r = await klasifikasiCitra(Buffer.from("foto-karton"));
    cek(
      validasiShape(r) && !r.gagal && r.kategori === "Cardboard" && r.confidence === 0.95 &&
        r.perlu_koreksi_manual === false,
      "klasifikasi sukses, confidence tinggi",
      `kategori=${r.kategori}, confidence=${r.confidence}`
    );
    cek(
      Array.isArray(r.peringkat) && r.peringkat.length === 3 &&
        r.peringkat[0].label === "cardboard",
      "peringkat berisi semua label",
      ""
    );
    cek(
      panggilanFetch.length === 1 &&
        panggilanFetch[0][1]?.headers?.["X-API-KEY"] === "dummy-test-key" &&
        panggilanFetch[0][1]?.headers?.["Content-Type"] === "application/octet-stream",
      "fetch memakai header X-API-KEY + octet-stream",
      ""
    );
  }
);

// (1b) Confidence di bawah 0.6 → perlu_koreksi_manual true (label tetap terpetakan)
await denganFetchPalsu(
  () => responsHF({ jsonValue: { hasil: [{ label: "plastic", score: 0.4 }] } }),
  async () => {
    const r = await klasifikasiCitra(Buffer.from("foto-ambigu"));
    cek(
      r.gagal === false && r.kategori === "Plastic" && r.perlu_koreksi_manual === true,
      `confidence 0.4 < ${CONFIDENCE_THRESHOLD} → perlu koreksi manual`,
      `confidence=${r.confidence}, kategori=${r.kategori}, perlu_koreksi_manual=${r.perlu_koreksi_manual}`
    );
  }
);

// (1c) Tepat di threshold 0.6 DENGAN label terpetakan → TIDAK perlu koreksi
//      (konsisten dengan rule "< 0.6": 0.6 bukan < 0.6). Sekaligus membuktikan
//      bahwa Battery sekarang terdeteksi otomatis (sebelumnya via ImageNet-1k
//      kategori Battery tidak pernah muncul). Label yang tidak terpetakan tetap
//      memicu koreksi manual berapa pun skornya (lihat 1i).
await denganFetchPalsu(
  () => responsHF({ jsonValue: { hasil: [{ label: "battery", score: 0.6 }] } }),
  async () => {
    const r = await klasifikasiCitra(Buffer.from("foto-baterai"));
    cek(
      r.gagal === false && r.kategori === "Battery" && r.perlu_koreksi_manual === false,
      `confidence 0.6 (persis threshold, label terpetakan) → tidak koreksi`,
      `kategori=${r.kategori}, perlu_koreksi_manual=${r.perlu_koreksi_manual}`
    );
  }
);

// (1d) Respons non-OK (503 model loading) → fallback
await denganFetchPalsu(() => responsHF({ ok: false, status: 503, jsonValue: {} }), async () => {
  const r = await klasifikasiCitra(Buffer.from("x"));
  cek(
    r.gagal === true && r.kategori === null && r.confidence === 0 && r.perlu_koreksi_manual === true,
    "respons non-OK → fallback penuh",
    `alasan=${r.alasan_gagal}`
  );
});

// (1e) Fetch melempar TimeoutError (simulasi cold-start >10 detik) → fallback
await denganFetchPalsu(
  () => {
    const e = new Error("simulasi timeout");
    e.name = "TimeoutError";
    throw e;
  },
  async () => {
    const r = await klasifikasiCitra(Buffer.from("x"));
    cek(r.gagal === true && typeof r.alasan_gagal === "string", "fetch timeout → fallback", `alasan=${r.alasan_gagal}`);
  }
);

// (1f) JSON tidak bisa diparse → fallback
await denganFetchPalsu(() => responsHF({ jsonValue: new Error("bad json") }), async () => {
  const r = await klasifikasiCitra(Buffer.from("x"));
  cek(r.gagal === true, "respons JSON rusak → fallback", `alasan=${r.alasan_gagal}`);
});

// (1g) HF Space membalas objek error (bukan { hasil: [...] }) → fallback
await denganFetchPalsu(
  () => responsHF({ jsonValue: { error: "Unauthorized: X-API-KEY tidak cocok." } }),
  async () => {
    const r = await klasifikasiCitra(Buffer.from("x"));
    cek(r.gagal === true, "respons objek error → fallback", `alasan=${r.alasan_gagal}`);
  }
);

// (1h) `hasil` kosong (tidak ada prediksi) → fallback
await denganFetchPalsu(() => responsHF({ jsonValue: { hasil: [] } }), async () => {
  const r = await klasifikasiCitra(Buffer.from("x"));
  cek(r.gagal === true, "hasil kosong → fallback", `alasan=${r.alasan_gagal}`);
});

// (1i) Label di LUAR 12 kelas model → kategori null + koreksi manual,
//      TAPI bukan kegagalan API (gagal false). Skor tetap disimpan apa adanya.
await denganFetchPalsu(
  () => responsHF({ jsonValue: { hasil: [{ label: "quill, quill pen", score: 0.9 }] } }),
  async () => {
    const r = await klasifikasiCitra(Buffer.from("foto-lain"));
    cek(
      validasiShape(r) &&
        r.gagal === false &&
        r.kategori === null &&
        r.perlu_koreksi_manual === true &&
        r.confidence === 0.9,
      "label tidak terpetakan (quill, quill pen) → kategori null + koreksi manual, gagal false",
      `kategori=${r.kategori}, confidence=${r.confidence}, perlu_koreksi_manual=${r.perlu_koreksi_manual}`
    );
  }
);

// (2) Validasi input — fallback tanpa menyentuh fetch
for (const [nama, input] of [
  ["undefined", undefined],
  ["null", null],
  ["object polos", {}],
  ["string", "bukan-buffer"],
  ["number", 42],
]) {
  const r = await denganFetchPalsu(
    () => {
      throw new Error("fetch PADA-DIPANGGIL padahal input invalid");
    },
    () => klasifikasiCitra(input)
  );
  cek(
    validasiShape(r) && r.gagal === true && panggilanFetch.length === 0,
    `input ${nama} → fallback tanpa jaringan`,
    `alasan=${r.alasan_gagal}`
  );
}

// (3a) Guard token kosong → fallback tanpa jaringan
{
  const urlSimpan = process.env.KLASIFIKASI_API_URL;
  const tokenSimpan = process.env.KLASIFIKASI_API_TOKEN;
  process.env.KLASIFIKASI_API_URL = "https://dummy-test-space.hf.space";
  process.env.KLASIFIKASI_API_TOKEN = "";
  const r = await denganFetchPalsu(
    () => {
      throw new Error("fetch PADA-DIPANGGIL padahal token kosong");
    },
    () => klasifikasiCitra(Buffer.from("x"))
  );
  cek(
    validasiShape(r) && r.gagal === true && panggilanFetch.length === 0,
    "KLASIFIKASI_API_TOKEN kosong → fallback tanpa jaringan",
    `alasan=${r.alasan_gagal}`
  );
  process.env.KLASIFIKASI_API_URL = urlSimpan;
  process.env.KLASIFIKASI_API_TOKEN = tokenSimpan;
}

// (3b) Guard URL kosong → fallback tanpa jaringan
{
  const urlSimpan = process.env.KLASIFIKASI_API_URL;
  const tokenSimpan = process.env.KLASIFIKASI_API_TOKEN;
  process.env.KLASIFIKASI_API_URL = "";
  process.env.KLASIFIKASI_API_TOKEN = "dummy-test-key";
  const r = await denganFetchPalsu(
    () => {
      throw new Error("fetch PADA-DIPANGGIL padahal URL kosong");
    },
    () => klasifikasiCitra(Buffer.from("x"))
  );
  cek(
    validasiShape(r) && r.gagal === true && panggilanFetch.length === 0,
    "KLASIFIKASI_API_URL kosong → fallback tanpa jaringan",
    `alasan=${r.alasan_gagal}`
  );
  process.env.KLASIFIKASI_API_URL = urlSimpan;
  process.env.KLASIFIKASI_API_TOKEN = tokenSimpan;
}

// (4) LIVE — pakai fixture yang sudah ada; unduh hanya kalau hilang (opsional)
process.env.KLASIFIKASI_API_URL = URL_ASLI;
process.env.KLASIFIKASI_API_TOKEN = TOKEN_ASLI;
if (URL_ASLI && TOKEN_ASLI) {
  mkdirSync(FIXTURES_DIR, { recursive: true });
  let diproses = 0;
  for (const foto of SUMBER_FOTO) {
    const jalur = path.join(FIXTURES_DIR, foto.nama);
    let buf = null;
    try {
      if (existsSync(jalur)) {
        buf = readFileSync(jalur); // pakai fixture lokal — TIDAK unduh ulang
      } else {
        const res = await fetch(foto.url, {
          headers: { "User-Agent": UA },
          redirect: "follow",
          signal: AbortSignal.timeout(20000),
        });
        if (!res.ok) throw new Error(`unduh gagal HTTP ${res.status}`);
        buf = Buffer.from(await res.arrayBuffer());
        writeFileSync(jalur, buf);
      }
      diproses += 1;

      const r = await klasifikasiCitra(buf); // timeout internal 10 detik
      if (validasiShape(r) && !r.gagal) {
        const labelAsli = r.peringkat?.[0]?.label ?? "?";
        if (r.kategori === null) {
          // Label model tidak terpetakan → WARN (bukan FAIL), per brief.
          catat(
            "WARN",
            `LIVE klasifikasi ${foto.nama} — label unmapped`,
            `label="${labelAsli}" skor=${r.confidence.toFixed(3)} → kategori null (perlu koreksi manual)`
          );
        } else {
          catat(
            "PASS",
            `LIVE klasifikasi ${foto.nama}`,
            `label="${labelAsli}" skor=${r.confidence.toFixed(3)} → kategori=${r.kategori}, perlu_koreksi_manual=${r.perlu_koreksi_manual}`
          );
        }
      } else {
        catat(
          "WARN",
          `LIVE klasifikasi ${foto.nama} fallback (keterbatasan)`,
          `alasan=${r.alasan_gagal} — cold-start ZeroGPU bisa >10 detik; fallback tervalidasi`
        );
      }
    } catch (e) {
      catat("WARN", `proses ${foto.nama} gagal`, `${e.name}: ${e.message.slice(0, 80)}`);
    }
  }
  if (diproses === 0) {
    catat("WARN", "LIVE klasifikasi dilewati", "tidak ada foto yang bisa diproses (jaringan?); fallback sudah terverifikasi");
  }
} else {
  catat("WARN", "LIVE klasifikasi dilewati", "KLASIFIKASI_API_URL / KLASIFIKASI_API_TOKEN kosong di environment ini");
}

// ---------------------------------------------------------------------------
// Ringkasan
// ---------------------------------------------------------------------------
console.log("\n=== HASIL TEST KLASIFIKASI ===");
for (const r of results) console.log(r);
console.log(`\nJumlah label di LABEL_KE_KELAS: ${Object.keys(LABEL_KE_KELAS).length}`);
console.log(`\n${passed} PASS, ${failed} FAIL, ${warned} WARN`);
process.exit(failed > 0 ? 1 : 0);
