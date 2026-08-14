// scripts/load-env.mjs
//
// Loader minimal `.env.local` untuk test script yang dijalankan dengan
// `node <file>` langsung (di luar proses Next.js, yang sudah memuat `.env.local`
// sendiri). Bukan library eksternal — cukup parsing key=value sederhana.
//
// Aman: hanya men-set process.env saat key belum terdefinisi, dan TIDAK pernah
// mencetak nilai key ke mana pun.

import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT_PROYEK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/**
 * @returns {boolean} true jika `.env.local` ditemukan & diproses
 */
export function muatEnvLocal() {
  const envPath = path.join(ROOT_PROYEK, ".env.local");
  if (!existsSync(envPath)) return false;

  const teks = readFileSync(envPath, "utf8");
  let diubah = false;

  for (const baris of teks.split(/\r?\n/)) {
    const bersih = baris.trim();
    if (!bersih || bersih.startsWith("#")) continue;

    const idx = bersih.indexOf("=");
    if (idx <= 0) continue;

    const kunci = bersih.slice(0, idx).trim();
    let nilai = bersih.slice(idx + 1).trim();

    if (
      (nilai.startsWith('"') && nilai.endsWith('"')) ||
      (nilai.startsWith("'") && nilai.endsWith("'"))
    ) {
      nilai = nilai.slice(1, -1);
    }

    if (kunci && process.env[kunci] === undefined) {
      process.env[kunci] = nilai;
      diubah = true;
    }
  }

  return diubah;
}