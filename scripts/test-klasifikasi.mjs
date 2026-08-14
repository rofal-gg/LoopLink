// scripts/test-klasifikasi.mjs
//
// Test manual (tanpa framework) untuk lib/ai/klasifikasi.js — jalankan:
//
//   node scripts/test-klasifikasi.mjs
//
// Jalur yang diuji:
//   (1) Logika deterministik via fetch palsu: sukses, confidence rendah
//       (threshold 0.6), peringkat terurut, non-OK, fetch timeout, JSON rusak,
//       respons objek error, array kosong — semuanya tanpa jaringan.
//   (2) Validasi input: undefined/null/object/string → fallback TANPA fetch.
//   (3) Guard key kosong → fallback TANPA fetch.
//   (4) LIVE: kalau HF_API_TOKEN terisi, unduh 1-2 foto limbah NYATA dari
//       Wikimedia Commons ke scripts/fixtures/ (gitignored), lalu klasifikasi.
//       Kalau jaringan/key tidak bisa dipakai atau cold-start model >10 detik
//       (timeout), dicatat sebagai keterbatasan (WARN), bukan kegagalan script.
// Exit code non-zero kalau ada FAIL. Tidak print API key, tidak uncaught error.

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { muatEnvLocal } from "./load-env.mjs";
import { klasifikasiCitra, CONFIDENCE_THRESHOLD } from "../lib/ai/klasifikasi.js";

muatEnvLocal();

const KEY_ASLI = process.env.HF_API_TOKEN || "";
const FIXTURES_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "fixtures");
const UA = "LoopLink-Test/1.0 (demo; competition)";

// Sumber foto limbah publik (Wikimedia Commons, diunduh via API pencarian — 2026-08-14).
const SUMBER_FOTO = [
  {
    nama: "plastic-bottles.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Plastic_Bottles_-_Waste_%287992944072%29.jpg/960px-Plastic_Bottles_-_Waste_%287992944072%29.jpg",
  },
  {
    nama: "corrugated-cardboard.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Corrugated_Cardboard.JPG/960px-Corrugated_Cardboard.JPG",
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

// Pastikan key dummy ada supaya mock test sampai ke fetch (bukan guard).
process.env.HF_API_TOKEN = "dummy-test-key";

// (1a) Sukses, confidence tinggi → tidak perlu koreksi manual
await denganFetchPalsu(
  () =>
    responsHF({
      jsonValue: [
        { label: "Plastic", score: 0.95 },
        { label: "Trash", score: 0.03 },
        { label: "Cardboard", score: 0.02 },
      ],
    }),
  async () => {
    const r = await klasifikasiCitra(Buffer.from("foto-plastik"));
    cek(
      validasiShape(r) && !r.gagal && r.kategori === "Plastic" && r.confidence === 0.95 &&
        r.perlu_koreksi_manual === false,
      "klasifikasi sukses, confidence tinggi",
      `kategori=${r.kategori}, confidence=${r.confidence}`
    );
    cek(Array.isArray(r.peringkat) && r.peringkat.length === 3 && r.peringkat[0].label === "Plastic", "peringkat berisi semua label", "");
  }
);

// (1b) Confidence di bawah 0.6 → perlu_koreksi_manual true
await denganFetchPalsu(
  () => responsHF({ jsonValue: [{ label: "Cardboard", score: 0.4 }] }),
  async () => {
    const r = await klasifikasiCitra(Buffer.from("foto-ambigu"));
    cek(
      r.gagal === false && r.kategori === "Cardboard" && r.perlu_koreksi_manual === true,
      `confidence 0.4 < ${CONFIDENCE_THRESHOLD} → perlu koreksi manual`,
      `confidence=${r.confidence}, perlu_koreksi_manual=${r.perlu_koreksi_manual}`
    );
  }
);

// (1c) Tepat di threshold 0.6 → TIDAK perlu koreksi (konsisten: < 0.6)
await denganFetchPalsu(
  () => responsHF({ jsonValue: [{ label: "Metal", score: 0.6 }] }),
  async () => {
    const r = await klasifikasiCitra(Buffer.from("foto-metal"));
    cek(r.perlu_koreksi_manual === false, `confidence 0.6 (persis threshold) → tidak koreksi`, "");
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

// (1g) HF membalas objek error (bukan array) → fallback
await denganFetchPalsu(() => responsHF({ jsonValue: { error: "Model is currently loading" } }), async () => {
  const r = await klasifikasiCitra(Buffer.from("x"));
  cek(r.gagal === true, "respons objek error → fallback", `alasan=${r.alasan_gagal}`);
});

// (1h) Array kosong → fallback
await denganFetchPalsu(() => responsHF({ jsonValue: [] }), async () => {
  const r = await klasifikasiCitra(Buffer.from("x"));
  cek(r.gagal === true, "array kosong → fallback", `alasan=${r.alasan_gagal}`);
});

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

// (3) Guard key kosong → fallback tanpa jaringan
{
  const keySimpan = process.env.HF_API_TOKEN;
  process.env.HF_API_TOKEN = "";
  const r = await denganFetchPalsu(
    () => {
      throw new Error("fetch PADA-DIPANGGIL padahal key kosong");
    },
    () => klasifikasiCitra(Buffer.from("x"))
  );
  cek(
    validasiShape(r) && r.gagal === true && panggilanFetch.length === 0,
    "key kosong → fallback tanpa jaringan",
    `alasan=${r.alasan_gagal}`
  );
  process.env.HF_API_TOKEN = keySimpan;
}

// (4) LIVE — unduh foto nyata & klasifikasi (opsional, butuh jaringan + key)
process.env.HF_API_TOKEN = KEY_ASLI;
if (KEY_ASLI) {
  mkdirSync(FIXTURES_DIR, { recursive: true });
  let terunduh = 0;
  for (const foto of SUMBER_FOTO) {
    const jalur = path.join(FIXTURES_DIR, foto.nama);
    try {
      const res = await fetch(foto.url, {
        headers: { "User-Agent": UA },
        redirect: "follow",
        signal: AbortSignal.timeout(20000),
      });
      if (!res.ok) throw new Error(`unduh gagal HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      writeFileSync(jalur, buf);
      terunduh += 1;

      const r = await klasifikasiCitra(buf); // timeout internal 10 detik
      if (validasiShape(r) && !r.gagal) {
        catat(
          "PASS",
          `LIVE klasifikasi ${foto.nama}`,
          `kategori=${r.kategori}, confidence=${r.confidence.toFixed(3)}, perlu_koreksi_manual=${r.perlu_koreksi_manual}`
        );
      } else {
        catat(
          "WARN",
          `LIVE klasifikasi ${foto.nama} fallback (keterbatasan)`,
          `alasan=${r.alasan_gagal} — cold-start HF bisa >10 detik; fallback tervalidasi`
        );
      }
    } catch (e) {
      catat("WARN", `unduh ${foto.nama} gagal`, `${e.name}: ${e.message.slice(0, 80)}`);
    }
  }
  if (terunduh === 0) {
    catat("WARN", "LIVE klasifikasi dilewati", "tidak ada foto yang bisa diunduh (jaringan?); fallback sudah terverifikasi");
  }
} else {
  catat("WARN", "LIVE klasifikasi dilewati", "HF_API_TOKEN kosong di environment ini");
}

// ---------------------------------------------------------------------------
// Ringkasan
// ---------------------------------------------------------------------------
console.log("\n=== HASIL TEST KLASIFIKASI ===");
for (const r of results) console.log(r);
console.log(`\n${passed} PASS, ${failed} FAIL, ${warned} WARN`);
process.exit(failed > 0 ? 1 : 0);