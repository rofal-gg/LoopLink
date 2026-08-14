// scripts/e2e-mobile.mjs
//
// Test Skenario 7 — tampilan mobile (LoopLink Fase 5).
// Memakai Chrome headless + CDP (WebSocket bawaan Node) untuk:
//   1. Login via Supabase (akun demo seed budi@looplink.demo).
//   2. Menyuntik cookie sesi ke dalam sesi Chrome.
//   3. Mensimulasikan viewport mobile (390x844, DPR 3).
//   4. Membuka halaman kunci, mengecek horizontal overflow, dan screenshot.
//
// Cara jalan (server `next start` di port 3111 sudah jalan):
//   node scripts/e2e-mobile.mjs
//
// Exit 0 = semua PASS, 1 = ada FAIL.

import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { muatEnvLocal } from "./load-env.mjs";

muatEnvLocal();

const BASE_URL = process.env.SMOKE_BASE_URL || "http://localhost:3111";
const CDP_PORT = 9333 + Math.floor(Math.random() * 500);
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const VIEWPORT = { width: 390, height: 844, deviceScaleFactor: 3, mobile: true };

const results = [];
let passed = 0;
let failed = 0;

function catat(status, nama, detail = "") {
  if (typeof status === "boolean") status = status ? "PASS" : "FAIL";
  if (status === "PASS") passed += 1;
  else failed += 1;
  results.push(`${status.padEnd(5)} ${nama}${detail ? `  → ${detail}` : ""}`);
}

// --- Supabase: buat sesi login akun demo --------------------------------
const URL_PROYEK = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const refMatch = URL_PROYEK.match(/^https:\/\/([^.]+)\.supabase\.co/);
if (!refMatch) {
  console.error("NEXT_PUBLIC_SUPABASE_URL tidak valid");
  process.exit(1);
}
const REF = refMatch[1];
const COOKIE_NAME = `sb-${REF}-auth-token`;

// --- CDP helper ------------------------------------------------------------
function send(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++send._id;
    const handler = (ev) => {
      const msg = JSON.parse(ev.data.toString());
      if (msg.id === id) {
        ws.removeEventListener("message", handler);
        if (msg.error) reject(new Error(`${method}: ${msg.error.message}`));
        else resolve(msg.result);
      }
    };
    ws.addEventListener("message", handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}
send._id = 0;

async function bukaTab() {
  const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/new?about:blank`, {
    method: "PUT",
  });
  const tab = await res.json();
  return tab.webSocketDebuggerUrl;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// --- MAIN -------------------------------------------------------------------
async function main() {
  // 1. Login Supabase
  const anon = createClient(URL_PROYEK, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: sesi, error: errLogin } = await anon.auth.signInWithPassword({
    email: "budi@looplink.demo",
    password: "looplink123",
  });
  if (errLogin || !sesi.session) {
    console.error("Login demo gagal:", errLogin?.message);
    process.exit(1);
  }
  catat(true, "S7.0 Login akun demo budi@looplink.demo → sesi siap");

  // 2. Ambil satu listing tersedia milik orang lain (agar tombol Amankan tampil)
  const adminClient = createClient(URL_PROYEK, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
  const { data: listingLain } = await adminClient
    .from("listings")
    .select("id, judul")
    .eq("status", "tersedia")
    .neq("user_id", sesi.session.user.id)
    .limit(1)
    .single();
  catat(!!listingLain, "S7.0b Ambil listing tersedia milik orang lain untuk dibuka", listingLain?.judul ?? "-");

  // 3. Launch Chrome headless
  const userDir = mkdtempSync(join(tmpdir(), "looplink-chrome-"));
  const chrome = spawn(CHROME, [
    `--headless=new`,
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${userDir}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-gpu",
    "--hide-scrollbars",
  ], { stdio: "ignore" });

  // Tunggu CDP siap
  let ready = false;
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`);
      if (r.ok) { ready = true; break; }
    } catch { /* belum siap */ }
    await sleep(250);
  }
  if (!ready) {
    console.error("Chrome headless tidak merespons CDP");
    chrome.kill();
    process.exit(1);
  }

  const wsUrl = await bukaTab();
  const ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => { ws.addEventListener("open", res); ws.addEventListener("error", rej); });

  try {
    await send(ws, "Network.enable");
    await send(ws, "Page.enable");
    await send(ws, "Emulation.setDeviceMetricsOverride", { ...VIEWPORT, screenWidth: VIEWPORT.width, screenHeight: VIEWPORT.height });

    // Inject cookie sesi (domain localhost)
    await send(ws, "Network.setCookie", {
      name: COOKIE_NAME,
      value: encodeURIComponent(JSON.stringify(sesi.session)),
      url: BASE_URL,
      path: "/",
    });

    // Helper buka halaman + cek overflow + screenshot
    async function cekHalaman(label, path, { screenshot = false } = {}) {
      await send(ws, "Page.navigate", { url: `${BASE_URL}${path}` });
      // Tunggu load
      for (let i = 0; i < 30; i++) {
        const st = await send(ws, "Runtime.evaluate", {
          expression: "document.readyState",
          returnByValue: true,
        });
        if (st.result?.value === "complete") break;
        await sleep(300);
      }
      await sleep(400); // render client components

      const evalRes = await send(ws, "Runtime.evaluate", {
        expression: `(() => {
          const sw = document.documentElement.scrollWidth;
          const cw = document.documentElement.clientWidth;
          return {
            scrollWidth: sw,
            clientWidth: cw,
            overflow: sw > cw,
            title: document.title,
            bodyText: document.body ? document.body.innerText.slice(0, 120).replace(/\\n/g, " ") : "",
            hasTabBar: !!document.querySelector("a[href='/cari'], a[href='/home'], a[href*='/upload']"),
            visibleEls: Array.from(document.querySelectorAll("a,button,input,select,textarea"))
              .filter((el) => {
                const r = el.getBoundingClientRect();
                return r.width > 0 && r.height > 0 && r.right > 0 && r.left < window.innerWidth;
              }).length,
          };
        })()`,
        returnByValue: true,
      });
      const info = evalRes.result?.value ?? {};
      const passOverflow = !info.overflow;
      catat(passOverflow, `S7. ${label} — tidak ada overflow horizontal (mobile ${VIEWPORT.width}px)`, `scroll=${info.scrollWidth}/${info.clientWidth}, elemen interaktif=${info.visibleEls}`);
      console.log(`       ${passOverflow ? "PASS" : "FAIL"} ${label}: scroll ${info.scrollWidth}/${info.clientWidth}`);

      if (screenshot) {
        const shot = await send(ws, "Page.captureScreenshot", { format: "png" });
        const fs = await import("node:fs");
        const out = `/tmp/looplink-mobile-${label.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.png`;
        fs.writeFileSync(out, Buffer.from(shot.data, "base64"));
        console.log(`       → screenshot: ${out}`);
      }
      return info;
    }

    console.log("\n== S7. Mobile (390x844) ==");
    await cekHalaman("Landing /", "/", { screenshot: true });
    await cekHalaman("Login", "/login");
    await cekHalaman("Home", "/home", { screenshot: true });
    await cekHalaman("Cari", "/cari", { screenshot: true });
    await cekHalaman("Upload", "/upload", { screenshot: true });
    await cekHalaman("Setup Lokasi", "/setup-lokasi");
    await cekHalaman("Listing Saya", "/listing-saya");
    await cekHalaman("Klaim Saya", "/klaim-saya");
    await cekHalaman("Profil", "/profil");
    await cekHalaman("Pengaturan", "/pengaturan");
    if (listingLain) {
      const detail = await cekHalaman("Detail Listing", `/listing/${listingLain.id}?jarak=5`, { screenshot: true });
      const btn = await send(ws, "Runtime.evaluate", {
        expression: `(() => {
          const btn = Array.from(document.querySelectorAll("button,a")).find((el) => (el.innerText||"").includes("Amankan"));
          const r = btn ? btn.getBoundingClientRect() : null;
          return {
            adaTombol: !!btn,
            terlihat: r ? r.width > 0 && r.height > 0 && r.right > 0 && r.left < window.innerWidth : false,
            teks: btn ? btn.innerText.trim().slice(0, 60) : null,
          };
        })()`,
        returnByValue: true,
      });
      const b = btn.result?.value ?? {};
      catat(b.adaTombol && b.terlihat, "S7. Detail listing di mobile: tombol Amankan tampil (bukan pemilik)", b.adaTombol ? `teks="${b.teks}"` : "tombol tidak ditemukan di DOM");
    }
  } finally {
    ws.close();
    chrome.kill();
    try {
      rmSync(userDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 400 });
    } catch (err) {
      console.warn("cleanup dir warning:", err.message);
    }
  }

  console.log("\n================================================");
  console.log(`HASIL MOBILE (S7): ${passed} PASS, ${failed} FAIL`);
  console.log("================================================");
  for (const r of results) console.log(r);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Mobile test gagal total:", err);
  process.exit(1);
});