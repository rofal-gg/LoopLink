// scripts/smoke-test-api.mjs
//
// Smoke test ringan untuk API Fase 3 LoopLink.
// Jalankan setelah `npm run build` lolos dan dev server jalan:
//
//   PORT=3111 npm run dev &
//   node scripts/smoke-test-api.mjs
//
// Catatan environment (ditemukan 2026-08-14):
//   Akun seed dari supabase/seed.sql (INSERT langsung ke auth.users) TIDAK
//   bisa dipakai login di project remote saat itu (GoTrue mengembalikan
//   invalid_credentials walau hash password cocok). User yang dibuat lewat
//   admin API GoTrue bisa login normal. Karena itu script ini MEMBUAT user
//   test sendiri via admin API GoTrue (service role) + profile pendukung,
//   lalu MEMBERSIHKAN SEMUANYA di akhir. Script tidak mengubah data seed.
//
// Alur:
//   * Buat user "budi"/"sari" test + profile-nya.
//   * Login via @supabase/supabase-js; kirim sesi lewat cookie
//     `sb-<ref>-auth-token` (route handler memakai cookie session dari
//     lib/supabase/server.js → getUser()).
//   * Menguji: guard login, buat listing, PATCH (termasuk tolak field
//     status & non-pemilik), klaim listing sendiri (harus 400), klasifikasi
//     (raw & JSON base64), ekstraksi-teks, cari (radius), klaim→batal→hapus,
//     alur selesai, laporan, visibilitas RLS.
//   * Cleanup menyeluruh: listing, laporan, riwayat, lalu user auth test.
//
// Exit code 0 kalau semua PASS, 1 kalau ada FAIL/WARN.

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createClient } from "@supabase/supabase-js";
import { muatEnvLocal } from "./load-env.mjs";

muatEnvLocal();

const BASE_URL = process.env.SMOKE_BASE_URL || "http://localhost:3111";
const PASS = "PASS";
const FAIL = "FAIL";
const WARN = "WARN";

const results = [];
let passed = 0;
let failed = 0;
let warned = 0;

function catat(status, nama, detail = "") {
  if (typeof status === "boolean") status = status ? PASS : FAIL;
  if (status === PASS) passed += 1;
  else if (status === FAIL) failed += 1;
  else warned += 1;
  results.push(`${status.padEnd(5)} ${nama}${detail ? `  → ${detail}` : ""}`);
}

function ringkas(js, maks = 240) {
  const s = typeof js === "string" ? js : JSON.stringify(js);
  if (!s) return "";
  return s.length > maks ? `${s.slice(0, maks)}…` : s;
}

// ---------------------------------------------------------------------------
// Setup: project ref, client, helper
// ---------------------------------------------------------------------------
const URL_PROYEK = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const refMatch = URL_PROYEK.match(/^https:\/\/([^.]+)\.supabase\.co/);
if (!refMatch) {
  console.error("NEXT_PUBLIC_SUPABASE_URL tidak valid di .env.local");
  process.exit(1);
}
const REF = refMatch[1];
const COOKIE_TOKEN = `sb-${REF}-auth-token`;

const anonClient = createClient(URL_PROYEK, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const adminClient = createClient(URL_PROYEK, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function buatUserAdmin(email, namaLengkap) {
  const { data: user, error } = await adminClient.auth.admin.createUser({
    email,
    password: "looplink123",
    email_confirm: true,
    user_metadata: { nama_lengkap: namaLengkap },
  });
  if (error || !user?.user) throw new Error(`createUser gagal ${email}: ${error?.message || "?"}`);
  return user.user;
}

async function login(email, password = "looplink123") {
  const { data, error } = await anonClient.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    throw new Error(`login gagal ${email}: ${error?.message || "tanpa session"}`);
  }
  return data.session;
}

function sesiCookie(session) {
  return `${COOKIE_TOKEN}=${encodeURIComponent(JSON.stringify(session))}`;
}

async function panggil(apiPath, { method = "GET", session = null, body = undefined, raw = false, headers = {} } = {}) {
  const h = { ...headers };
  if (session) h.Cookie = sesiCookie(session);
  if (!raw && body !== undefined) h["Content-Type"] = "application/json";

  const res = await fetch(`${BASE_URL}${apiPath}`, {
    method,
    headers: h,
    body: raw ? body : body !== undefined ? JSON.stringify(body) : undefined,
  });

  let hasil = null;
  const teks = await res.text();
  try {
    hasil = teks ? JSON.parse(teks) : null;
  } catch {
    hasil = teks;
  }
  return { status: res.status, body: hasil };
}

// ===========================================================================
// Jalur utama (sequential)
// ===========================================================================
async function main() {
  const STAMP = Date.now();
  const EMAIL_BUDI = `looplink.smoke.budi.${STAMP}@gmail.com`;
  const EMAIL_SARI = `looplink.smoke.sari.${STAMP}@gmail.com`;

  const listingSmoke = [];
  const authUserIds = [];
  let listingAPayload;

  console.log("== Setup user test (admin API GoTrue) ==");
  const userBudi = await buatUserAdmin(EMAIL_BUDI, "Budi Smoke");
  const userSari = await buatUserAdmin(EMAIL_SARI, "Sari Smoke");
  authUserIds.push(userBudi.id, userSari.id);

  // Profile pendukung (nama_lengkap NOT NULL; lokasi meniru seed).
  await adminClient.from("profiles").insert([
    {
      id: userBudi.id,
      nama_lengkap: "Budi Smoke",
      no_telepon: "0812-000-0001",
      alamat_teks: "Jl. Rungkut Asri No. 12, Surabaya",
      lokasi_lat: -7.33,
      lokasi_lng: 112.79,
    },
    {
      id: userSari.id,
      nama_lengkap: "Sari Smoke",
      no_telepon: "0813-000-0002",
      alamat_teks: "Jl. Pahlawan No. 45, Sidoarjo",
      lokasi_lat: -7.453,
      lokasi_lng: 112.713,
    },
  ]);
  catat(true, `user test dibuat + profile (budi=${userBudi.id.slice(0, 8)}…, sari=${userSari.id.slice(0, 8)}…)`);

  const sesiBudi = await login(EMAIL_BUDI);
  const sesiSari = await login(EMAIL_SARI);
  catat(true, "login password user test → 200 (cookie sesi siap)");

  // --- A. Guard login (tanpa sesi) → 401 ------------------------------------
  console.log("\n== A. Guard login ==");
  const r1 = await panggil("/api/listings", { method: "POST", body: {} });
  catat(r1.status === 401 && r1.body?.error === "Belum login", "POST /api/listings tanpa login → 401", `${r1.status} ${ringkas(r1.body)}`);
  const r2 = await panggil("/api/listings/cari", { method: "POST", body: {} });
  catat(r2.status === 401 && r2.body?.error === "Belum login", "POST /api/listings/cari tanpa login → 401", `${r2.status} ${ringkas(r2.body)}`);

  // --- B1. Buat listing A (pemilik: budi) -----------------------------------
  console.log("\n== B.1 Buat listing ==");
  const buatListing = await panggil("/api/listings", {
    method: "POST",
    session: sesiBudi,
    body: {
      judul: "TEST API - Kardus smoke",
      kategoriCitra: "Cardboard",
      kategoriDikoreksi: false,
      confidenceScore: 0.95,
      deskripsiTeks: { kondisi: "kering", catatan_tambahan: "test" },
      jumlah: 50,
      satuan: "kg",
      lokasiLat: -7.33,
      lokasiLng: 112.79,
      expiredAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      foto: [{ fotoUrl: "https://placehold.co/400?text=smoke", urutan: 1 }],
      // user_id sengaja dikirim beda untuk membuktikan server memakai session:
      user_id: "00000000-0000-0000-0000-000000000000",
    },
  });
  catat(buatListing.status === 201 && !!buatListing.body?.listing_id, "POST /api/listings → 201 + listing_id", `${buatListing.status} ${ringkas(buatListing.body)}`);
  if (buatListing.status === 201) {
    listingSmoke.push(buatListing.body.listing_id);
    listingAPayload = buatListing.body.listing_id;

    const { data: cek, error: errCek } = await adminClient.from("listings").select("user_id").eq("id", listingAPayload).single();
    catat(!errCek && cek?.user_id === userBudi.id, "user_id diambil dari session (bukan body)", cek?.user_id ? cek.user_id.slice(0, 8) + "…" : errCek?.message);
  }

  if (listingAPayload) {
    // --- B2. PATCH listing A (pemilik) --------------------------------------
    console.log("\n== B.2 PATCH ==");
    const patchOk = await panggil(`/api/listings/${listingAPayload}`, {
      method: "PATCH",
      session: sesiBudi,
      body: { judul: "TEST API - Kardus smoke (edited)", jumlah: "60" },
    });
    catat(patchOk.status === 200 && patchOk.body?.success === true, "PATCH /api/listings/[id] → 200 (judul+jumlah)", `${patchOk.status} ${ringkas(patchOk.body)}`);

    const patchStatus = await panggil(`/api/listings/${listingAPayload}`, {
      method: "PATCH",
      session: sesiBudi,
      body: { status: "dipesan" },
    });
    catat(
      patchStatus.status === 400 && (patchStatus.body?.error || "").includes("klaim/selesai/batal"),
      "PATCH dengan field status → 400 ditolak",
      `${patchStatus.status} ${ringkas(patchStatus.body)}`
    );

    const patchOrang = await panggil(`/api/listings/${listingAPayload}`, {
      method: "PATCH",
      session: sesiSari,
      body: { judul: "curi" },
    });
    catat(patchOrang.status === 403, "PATCH oleh non-pemilik → 403", `${patchOrang.status} ${ringkas(patchOrang.body)}`);

    // --- B3. Klaim listing sendiri (harus ditolak) ----------------------------
    console.log("\n== B.3 Klaim ==");
    const klaimSendiri = await panggil(`/api/listings/${listingAPayload}/klaim`, { method: "POST", session: sesiBudi });
    catat(
      klaimSendiri.status === 400 && (klaimSendiri.body?.error || "").includes("milik sendiri"),
      "Klaim listing sendiri → 400 ditolak (pesan RPC)",
      `${klaimSendiri.status} ${ringkas(klaimSendiri.body)}`
    );
  }

  // --- B4. Klasifikasi citra + ekstraksi teks -------------------------------
  console.log("\n== B.4 Klasifikasi & ekstraksi ==");
  const FIXTURE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "fixtures/cardboard-milk-carton.jpg");
  const GAMBAR_BYTES = readFileSync(FIXTURE);

  const klas = await panggil("/api/listings/klasifikasi", {
    method: "POST",
    session: sesiSari,
    raw: true,
    body: GAMBAR_BYTES,
    headers: { "Content-Type": "application/octet-stream" },
  });
  catat(klas.status === 200, "POST /api/listings/klasifikasi (raw bytes) → 200 (shape modul)", `${klas.status} ${ringkas(klas.body)}`);

  const klasJson = await panggil("/api/listings/klasifikasi", {
    method: "POST",
    session: sesiSari,
    body: { gambar_base64: Buffer.from(GAMBAR_BYTES).toString("base64") },
  });
  catat(klasJson.status === 200, "POST /api/listings/klasifikasi (JSON base64) → 200", `${klasJson.status} ${ringkas(klasJson.body)}`);

  const ekstrak = await panggil("/api/listings/ekstraksi-teks", {
    method: "POST",
    session: sesiSari,
    body: { deskripsiUser: "Kardus kering dari toko, sudah dipress", kategoriCitra: "Cardboard", usiaBulan: 3 },
  });
  catat(ekstrak.status === 200, "POST /api/listings/ekstraksi-teks → 200 (shape modul)", `${ekstrak.status} ${ringkas(ekstrak.body)}`);

  // --- B5. Pencarian (pencari: sari) ----------------------------------------
  console.log("\n== B.5 Pencarian ==");
  const cari = await panggil("/api/listings/cari", {
    method: "POST",
    session: sesiSari,
    body: {
      kategoriKebutuhan: "Bahan baku daur ulang kertas",
      radiusKm: 30,
      lokasiLat: -7.453,
      lokasiLng: 112.713,
      jumlahDibutuhkan: 40,
    },
  });
  if (cari.status === 200 && Array.isArray(cari.body?.hasil)) {
    const masuk = cari.body.hasil.some((h) => h.listing_id === listingAPayload);
    catat(true, "POST /api/listings/cari → 200, hasil terurut", `${cari.body.hasil.length} hasil, skor tertinggi ${cari.body.hasil[0]?.skor_akhir}, listing smoke ${masuk ? "MASUK" : "tidak masuk"}`);
    catat(masuk, "Listing smoke masuk hasil pencarian (dalam radius, kategori cocok)");

    const cariKecil = await panggil("/api/listings/cari", {
      method: "POST",
      session: sesiSari,
      body: {
        kategoriKebutuhan: "Bahan baku daur ulang kertas",
        radiusKm: 1,
        lokasiLat: -7.453,
        lokasiLng: 112.713,
        jumlahDibutuhkan: 40,
      },
    });
    const masihMasuk = cariKecil.body?.hasil?.some((h) => h.listing_id === listingAPayload);
    catat(
      cariKecil.status === 200 && !masihMasuk,
      "Radius 1 km menyaring listing di luar radius",
      `${cariKecil.status} hasil=${cariKecil.body?.hasil?.length ?? "-"}`
    );

    // Verifikasi riwayat tersimpan (penulisannya service-role). Search radius
    // 30 menghasilkan > 0 baris; search radius 1 menghasilkan 0. Cek bahwa ADA
    // minimal satu riwayat yang punya hasil.
    const { data: riwayatList, error: errRp } = await adminClient
      .from("riwayat_pencarian")
      .select("id, riwayat_pencarian_hasil(*)")
      .eq("pencari_id", userSari.id);
    const adaHasil = (riwayatList || []).some((r) => (r.riwayat_pencarian_hasil || []).length > 0);
    catat(
      !errRp && adaHasil,
      "Hasil pencarian tersimpan ke riwayat_pencarian(_hasil)",
      errRp ? errRp.message : `${riwayatList?.length ?? 0} riwayat, ada yang berisi hasil=${adaHasil}`
    );
  } else {
    catat(false, "POST /api/listings/cari → 200 + hasil", `${cari.status} ${ringkas(cari.body)}`);
  }

  const cariSalah = await panggil("/api/listings/cari", { method: "POST", session: sesiSari, body: { kategoriKebutuhan: "x", radiusKm: -5, lokasiLat: 0, lokasiLng: 0, jumlahDibutuhkan: 10 } });
  catat(cariSalah.status === 400, "POST /api/listings/cari radius <= 0 → 400", `${cariSalah.status} ${ringkas(cariSalah.body)}`);

  // --- B6. Klaim listing A oleh sari → batal oleh budi → hapus ---------------
  if (listingAPayload) {
    console.log("\n== B.6 Klaim → batal → hapus ==");

    // (1) GET detail SEBELUM klaim — listing tersedia, bukan pemilik → terlihat
    const detailSebelum = await panggil(`/api/listings/${listingAPayload}`, { method: "GET", session: sesiSari });
    catat(
      detailSebelum.status === 200 && detailSebelum.body?.pemilik?.nama_lengkap === "Budi Smoke" && Array.isArray(detailSebelum.body?.foto),
      "GET /api/listings/[id] (tersedia, bukan pemilik) → 200 + pemilik + foto",
      `${detailSebelum.status} pemilik=${detailSebelum.body?.pemilik?.nama_lengkap}, foto=${detailSebelum.body?.foto?.length}`
    );

    // (2) Klaim
    const klaim = await panggil(`/api/listings/${listingAPayload}/klaim`, { method: "POST", session: sesiSari });
    catat(klaim.status === 200 && klaim.body?.success === true, "Klaim listing orang lain (sari → budi) → 200", `${klaim.status} ${ringkas(klaim.body)}`);

    // (3) GET setelah klaim → pengklaim boleh melihat listing yang dia klaim
    //     (policy `listing_select_claimant`, migration 009). Perilaku ini
    //     diperbaiki dari gap schema lama yang membuat GET 404 untuk pengklaim.
    const detailSetelah = await panggil(`/api/listings/${listingAPayload}`, { method: "GET", session: sesiSari });
    catat(
      detailSetelah.status === 200 && detailSetelah.body?.id === listingAPayload,
      "GET setelah diklaim (pengklaim) → 200 (policy listing_select_claimant)",
      `${detailSetelah.status}`
    );

    // (4) Batal oleh pemilik
    const batal = await panggil(`/api/listings/${listingAPayload}/batal`, { method: "POST", session: sesiBudi });
    catat(batal.status === 200, "Batal klaim (pemilik budi) → 200", `${batal.status} ${ringkas(batal.body)}`);

    // (5) DELETE listing A yang sudah punya riwayat_klaim → sekarang boleh,
    //     FK anak (riwayat_klaim/laporan/riwayat_pencarian_hasil) sudah
    //     ON DELETE CASCADE (migration 010) — sejalan dengan listing_photos.
    const hapusA = await panggil(`/api/listings/${listingAPayload}`, { method: "DELETE", session: sesiBudi });
    catat(
      hapusA.status === 200 && hapusA.body?.success === true,
      "DELETE listing ber-riwayat_klaim → 200 (FK cascade, migration 010)",
      `${hapusA.status} ${ringkas(hapusA.body)}`
    );

    // (6) Listing C murni (tidak pernah diklaim) → DELETE harus sukses
    const buatC = await panggil("/api/listings", {
      method: "POST",
      session: sesiBudi,
      body: {
        judul: "TEST API - Kardus smoke C",
        kategoriCitra: "Cardboard",
        jumlah: 10,
        satuan: "kg",
        lokasiLat: -7.33,
        lokasiLng: 112.79,
        foto: [{ fotoUrl: "https://placehold.co/300?text=smokeC", urutan: 1 }],
      },
    });
    if (buatC.status === 201) {
      listingSmoke.push(buatC.body.listing_id);
      const hapusC = await panggil(`/api/listings/${buatC.body.listing_id}`, { method: "DELETE", session: sesiBudi });
      catat(hapusC.status === 200 && hapusC.body?.success === true, "DELETE listing tersedia (tanpa riwayat_klaim) → 200", `${hapusC.status} ${ringkas(hapusC.body)}`);
      if (hapusC.status === 200) listingSmoke.splice(listingSmoke.indexOf(buatC.body.listing_id), 1);
    }
  }

  // --- B7. Alur selesai (listing B) ------------------------------------------
  console.log("\n== B.7 Alur selesai ==");
  const buatB = await panggil("/api/listings", {
    method: "POST",
    session: sesiBudi,
    body: {
      judul: "TEST API - Plastic smoke B",
      kategoriCitra: "Plastic",
      jumlah: 30,
      satuan: "kg",
      lokasiLat: -7.33,
      lokasiLng: 112.79,
    },
  });
  if (buatB.status === 201) {
    listingSmoke.push(buatB.body.listing_id);
    const klaimB = await panggil(`/api/listings/${buatB.body.listing_id}/klaim`, { method: "POST", session: sesiSari });
    catat(klaimB.status === 200, "Klaim listing B → 200", `${klaimB.status}`);

    const selesaiBySari = await panggil(`/api/listings/${buatB.body.listing_id}/selesai`, { method: "POST", session: sesiSari });
    catat(selesaiBySari.status === 400, "Selesai oleh non-pemilik → 400 ditolak", `${selesaiBySari.status} ${ringkas(selesaiBySari.body)}`);

    const selesaiB = await panggil(`/api/listings/${buatB.body.listing_id}/selesai`, { method: "POST", session: sesiBudi });
    catat(selesaiB.status === 200 && selesaiB.body?.success === true, "Selesai listing B (pemilik) → 200", `${selesaiB.status} ${ringkas(selesaiB.body)}`);

    const hapusB = await panggil(`/api/listings/${buatB.body.listing_id}`, { method: "DELETE", session: sesiBudi });
    catat(hapusB.status === 400, "DELETE listing status selesai → 400 (hanya tersedia)", `${hapusB.status} ${ringkas(hapusB.body)}`);
  }

  // --- B8. Laporan ------------------------------------------------------------
  console.log("\n== B.8 Laporan ==");
  // Target laporan dibuat sendiri: listing A sudah TERHAPUS di B.6 (sekarang
  // DELETE ber-riwayat_klaim sukses karena FK cascade, migration 010), jadi
  // tidak bisa lagi dipakai sebagai target laporan.
  const buatLapor = await panggil("/api/listings", {
    method: "POST",
    session: sesiBudi,
    body: {
      judul: "TEST API - Target laporan",
      kategoriCitra: "Cardboard",
      jumlah: 5,
      satuan: "kg",
      lokasiLat: -7.33,
      lokasiLng: 112.79,
      foto: [{ fotoUrl: "https://placehold.co/300?text=laporkan", urutan: 1 }],
    },
  });
  const targetLaporan = buatLapor.status === 201 ? buatLapor.body.listing_id : null;
  if (targetLaporan) {
    listingSmoke.push(targetLaporan);
    const laporan = await panggil("/api/laporan", {
      method: "POST",
      session: sesiSari,
      body: { listingId: targetLaporan, alasan: "[smoke] alasan test" },
    });
    catat(laporan.status === 201 && !!laporan.body?.laporan_id, "POST /api/laporan → 201", `${laporan.status} ${ringkas(laporan.body)}`);

    const laporanKosong = await panggil("/api/laporan", { method: "POST", session: sesiSari, body: { listingId: targetLaporan, alasan: "   " } });
    catat(laporanKosong.status === 400, "POST /api/laporan alasan kosong → 400", `${laporanKosong.status} ${ringkas(laporanKosong.body)}`);
  } else {
    catat(false, "POST /api/laporan → 201", `gagal buat target laporan: ${buatLapor.status}`);
  }

  // --- B9. GET listing seed berstatus dipesan (bukan milik sari) → 404 ---------
  console.log("\n== B.9 Visibilitas RLS ==");
  const { data: seedDipesan } = await adminClient
    .from("listings")
    .select("id, judul, status")
    .eq("status", "dipesan")
    .limit(1)
    .single();
  if (seedDipesan) {
    const g = await panggil(`/api/listings/${seedDipesan.id}`, { method: "GET", session: sesiSari });
    catat(g.status === 404, "GET listing dipesan milik orang lain → 404 (RLS)", `${g.status} (${seedDipesan.judul})`);
  }

  const g404 = await panggil("/api/listings/00000000-0000-0000-0000-000000000000", { method: "GET" });
  catat(g404.status === 404, "GET listing tidak ada → 404", `${g404.status} ${ringkas(g404.body)}`);

  // =========================================================================
  // C. CLEANUP: buang data test, lalu user auth test (seed tetap aman)
  // =========================================================================
  console.log("\n== C. Cleanup data test ==");
  try {
    // Urutan penting (FK):
    //   1) laporan
    //   2) riwayat_pencarian (cascade ke riwayat_pencarian_hasil)
    //   3) riwayat_klaim (referensi ke profiles & listings tanpa cascade)
    //   4) listing smoke (cascade ke listing_photos)
    //   5) user auth (cascade ke profiles)
    await adminClient.from("laporan").delete().eq("pelapor_id", userSari.id);
    await adminClient.from("riwayat_pencarian").delete().eq("pencari_id", userSari.id);
    await adminClient.from("riwayat_pencarian").delete().eq("pencari_id", userBudi.id);

    const { data: rkRows } = await adminClient
      .from("riwayat_klaim")
      .select("id")
      .in("pemilik_id", authUserIds);
    if (rkRows && rkRows.length > 0) {
      await adminClient.from("riwayat_klaim").delete().in("id", rkRows.map((r) => r.id));
    }

    for (const lid of listingSmoke) {
      const { data: refs } = await adminClient.from("riwayat_pencarian_hasil").select("id").eq("listing_id", lid);
      if (refs && refs.length > 0) {
        await adminClient.from("riwayat_pencarian_hasil").delete().in("id", refs.map((r) => r.id));
      }
      const { error: errDelListing } = await adminClient.from("listings").delete().eq("id", lid);
      if (errDelListing) console.warn(`  cleanup listing ${lid} gagal:`, errDelListing.message);
    }

    for (const uid of authUserIds) {
      const { error: errDel } = await adminClient.auth.admin.deleteUser(uid);
      if (errDel) console.warn("  cleanup user gagal:", errDel.message);
      else catat(true, `User test dihapus (${uid.slice(0, 8)}…)`);
    }
  } catch (err) {
    catat(WARN, "Cleanup sebagian gagal", err.message);
  }

  // =========================================================================
  // Rangkuman
  // =========================================================================
  console.log("\n================================================");
  console.log(`HASIL: ${passed} PASS, ${failed} FAIL, ${warned} WARN`);
  console.log("================================================");
  for (const r of results) console.log(r);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Smoke test gagal total:", err);
  process.exit(1);
});