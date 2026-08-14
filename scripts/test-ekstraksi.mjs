// scripts/test-ekstraksi.mjs
//
// Test manual (tanpa framework) untuk lib/ai/ekstraksi.js — jalankan:
//
//   node scripts/test-ekstraksi.mjs
//
// Jalur yang diuji:
//   (1) Logika deterministik via fetch palsu: output JSON valid, fence ```json,
//       teks pembuka dari Gemini, non-OK, respons bukan JSON, timeout, kondisi
//       invalid dinormalisasi, sanitasi deskripsi user.
//   (2) Guard key kosong → fallback TANPA panggil jaringan.
//   (3) Live call ke Gemini 1.5 Flash HANYA kalau GEMINI_API_KEY terisi; kalau
//       jaringan/key tidak bisa dipakai, dicatat sebagai keterbatasan (WARN),
//       bukan kegagalan script.
// Exit code non-zero kalau ada FAIL. Tidak print API key, tidak uncaught error.

import { muatEnvLocal } from "./load-env.mjs";
import { ekstraksiDeskripsi } from "../lib/ai/ekstraksi.js";

muatEnvLocal();

const KEY_ASLI = process.env.GEMINI_API_KEY || "";

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
  catat(cond ? "PASS" : "FAIL", nama, cond ? detail : detail);
}

const KONDISI_VALID = ["kering", "basah", "campuran", "tidak diketahui"];

// Helper menjaga bentuk kontrak fungsi
function validasiShape(r) {
  return (
    r &&
    typeof r === "object" &&
    typeof r.gagal === "boolean" &&
    "kondisi" in r &&
    "catatan_tambahan" in r
  );
}

// ---------------------------------------------------------------------------
// Mock fetch: setiap test memasang handler sendiri; fetch asli dikembalikan.
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

const responsePalsu = ({ ok = true, status = 200, jsonValue }) => ({
  ok,
  status,
  json: async () => {
    if (jsonValue instanceof Error) throw jsonValue;
    return jsonValue;
  },
});

const geminiPalsu = (teks) => ({
  candidates: [{ content: { parts: [{ text: teks }] } }],
});

// ---------------------------------------------------------------------------
// Pastikan key dummy ada supaya mock test sampai ke fetch (bukan ke guard).
// ---------------------------------------------------------------------------
process.env.GEMINI_API_KEY = "dummy-test-key";

// (1a) Output JSON polos
await denganFetchPalsu(
  () =>
    responsePalsu({
      jsonValue: geminiPalsu('{"kondisi":"basah","catatan_tambahan":"sedikit basah karena hujan."}'),
    }),
  async () => {
    const r = await ekstraksiDeskripsi({ deskripsiUser: "kardus basah", kategoriCitra: "Cardboard" });
    cek(validasiShape(r) && !r.gagal && r.kondisi === "basah", "ekstraksi output JSON polos", `kondisi=${r.kondisi}`);
  }
);

// (1b) Output dengan fence ```json
await denganFetchPalsu(
  () =>
    responsePalsu({
      jsonValue: geminiPalsu('```json\n{"kondisi":"kering","catatan_tambahan":"sudah dipress rapi."}\n```'),
    }),
  async () => {
    const r = await ekstraksiDeskripsi({ deskripsiUser: "kardus kering", kategoriCitra: "Cardboard" });
    cek(!r.gagal && r.kondisi === "kering", "ekstraksi fence ```json dibersihkan", `kondisi=${r.kondisi}`);
  }
);

// (1c) Output dengan teks pembuka (Gemini suka nambah teks)
await denganFetchPalsu(
  () =>
    responsePalsu({
      jsonValue: geminiPalsu('Tentu, berikut hasilnya:\n{"kondisi":"campuran","catatan_tambahan":"campur plastik dan kertas."}'),
    }),
  async () => {
    const r = await ekstraksiDeskripsi({ deskripsiUser: "campuran", kategoriCitra: "Plastic" });
    cek(!r.gagal && r.kondisi === "campuran", "ekstraksi teks pembuka ditoleransi", `kondisi=${r.kondisi}`);
  }
);

// (1d) Respons non-OK → fallback
await denganFetchPalsu(() => responsePalsu({ ok: false, status: 500, jsonValue: {} }), async () => {
  const r = await ekstraksiDeskripsi({ deskripsiUser: "x", kategoriCitra: "Cardboard" });
  cek(
    r.gagal === true && r.kondisi === "tidak diketahui" && r.catatan_tambahan === "",
    "respons non-OK → fallback penuh",
    `alasan=${r.alasan_gagal}`
  );
});

// (1e) Gemini mengembalikan teks bukan JSON → fallback (try/catch JSON.parse)
await denganFetchPalsu(
  () => responsePalsu({ jsonValue: geminiPalsu("maaf, saya tidak bisa membantu") }),
  async () => {
    const r = await ekstraksiDeskripsi({ deskripsiUser: "x", kategoriCitra: "Cardboard" });
    cek(r.gagal === true && r.kondisi === "tidak diketahui", "output non-JSON → fallback", `alasan=${r.alasan_gagal}`);
  }
);

// (1f) Fetch melempar TimeoutError → fallback timeout
await denganFetchPalsu(
  () => {
    const e = new Error("simulasi timeout");
    e.name = "TimeoutError";
    throw e;
  },
  async () => {
    const r = await ekstraksiDeskripsi({ deskripsiUser: "x", kategoriCitra: "Cardboard" });
    cek(r.gagal === true && typeof r.alasan_gagal === "string", "fetch timeout → fallback", `alasan=${r.alasan_gagal}`);
  }
);

// (1g) Kondisi di luar nilai valid dinormalisasi jadi "tidak diketahui"
await denganFetchPalsu(
  () =>
    responsePalsu({
      jsonValue: geminiPalsu('{"kondisi":"lembab","catatan_tambahan":"agak lembab."}'),
    }),
  async () => {
    const r = await ekstraksiDeskripsi({ deskripsiUser: "agak lembab", kategoriCitra: "Cardboard" });
    cek(!r.gagal && r.kondisi === "tidak diketahui", "kondisi invalid dinormalisasi", `kondisi=${r.kondisi}`);
  }
);

// (1h) Sanitasi deskripsi user: karakter control & tanda kutip tidak merusak prompt
await denganFetchPalsu(
  async (url, init) => {
    return responsePalsu({
      jsonValue: geminiPalsu('{"kondisi":"kering","catatan_tambahan":"ok"}'),
    });
  },
  async () => {
    const deskripsiKotor = "kardus \u0000bekas\r\ndari toko \"ABC\"\toke?";
    const r = await ekstraksiDeskripsi({ deskripsiUser: deskripsiKotor, kategoriCitra: "Cardboard" });
    const [url, init] = panggilanFetch[0] ?? [];
    const prompt = JSON.parse(typeof init?.body === "string" ? init.body : "{}")?.contents?.[0]?.parts?.[0]?.text ?? "";

    const bebasControl = !prompt.includes("\u0000") && !prompt.includes("\r");
    const mengandungEscape = prompt.includes('\\"') || prompt.includes('\\r') || prompt.includes("ABC");
    cek(
      validasiShape(r) && !r.gagal && bebasControl && mengandungEscape && prompt.includes("Cardboard"),
      "sanitasi deskripsi user (control char + kutip)",
      `prompt terkontrol=${bebasControl}`
    );
  }
);

// (1i) deskripsi sangat panjang dipotong
await denganFetchPalsu(
  () => responsePalsu({ jsonValue: geminiPalsu('{"kondisi":"kering","catatan_tambahan":"x"}') }),
  async () => {
    const r = await ekstraksiDeskripsi({ deskripsiUser: "a".repeat(2000), kategoriCitra: "Cardboard" });
    const prompt = JSON.parse(panggilanFetch[0][1].body)?.contents?.[0]?.parts?.[0]?.text ?? "";
    cek(!r.gagal && prompt.length < 1500, "deskripsi panjang dipotong", `len prompt=${prompt.length}`);
  }
);

// ---------------------------------------------------------------------------
// (2) Guard key kosong → fallback TANPA menyentuh jaringan
// ---------------------------------------------------------------------------
{
  const keySimpan = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "";
  const r = await denganFetchPalsu(
    () => {
      throw new Error("fetch PADA-DIPANGGIL padahal key kosong — guard gagal");
    },
    () => ekstraksiDeskripsi({ deskripsiUser: "x", kategoriCitra: "Cardboard" })
  );
  cek(
    validasiShape(r) && r.gagal === true && r.kondisi === "tidak diketahui" && panggilanFetch.length === 0,
    "key kosong → fallback tanpa jaringan",
    `alasan=${r.alasan_gagal}`
  );
  process.env.GEMINI_API_KEY = keySimpan;
}

// ---------------------------------------------------------------------------
// (3) Live call Gemini — hanya kalau key asli terisi
// ---------------------------------------------------------------------------
process.env.GEMINI_API_KEY = KEY_ASLI;
if (KEY_ASLI) {
  try {
    const r = await ekstraksiDeskripsi({
      deskripsiUser: "kardus bekas sedikit basah karena hujan, sebagian sudah dirobek",
      kategoriCitra: "Cardboard",
      usiaBulan: 6,
    });
    if (validasiShape(r) && !r.gagal) {
      catat("PASS", "LIVE Gemini (asli)", `kondisi=${r.kondisi}, catatan="${r.catatan_tambahan}"`);
    } else {
      catat(
        "WARN",
        "LIVE Gemini fallback (keterbatasan jaringan/key)",
        `alasan=${r.alasan_gagal} — API asli tidak terverifikasi di environment ini`
      );
    }
  } catch (e) {
    catat("FAIL", "LIVE Gemini melempar (tidak boleh)", e.name);
  }
} else {
  catat("WARN", "LIVE Gemini dilewati", "GEMINI_API_KEY kosong di environment ini");
}

// ---------------------------------------------------------------------------
// Ringkasan
// ---------------------------------------------------------------------------
console.log("\n=== HASIL TEST EKSTRAKSI ===");
for (const r of results) console.log(r);
console.log(`\n${passed} PASS, ${failed} FAIL, ${warned} WARN`);
process.exit(failed > 0 ? 1 : 0);