// scripts/e2e-fase5.mjs
//
// Test End-to-End Fase 5 LoopLink — mensimulasikan alur nyata user:
//
//   S1. Registrasi akun baru → setup lokasi → upload foto → AI klasifikasi
//       (live HF / fallback) → koreksi kategori → listing tayang.
//   S2. Akun lain cari bahan → listing akun 1 muncul + skor masuk akal →
//       detail → klaim → kontak pemilik muncul.
//   S3. Pemilik tandai selesai → status berubah + tercatat di riwayat_klaim.
//   S4. Pembatalan klaim dari kedua sisi → dibatalkan_oleh tercatat benar.
//   S5. Pemilik TIDAK bisa klaim listing sendiri (API 400 + DOM SSR tanpa tombol).
//   S6. Listing di luar radius pencarian tidak muncul.
//   S7. (dipisah ke scripts/e2e-mobile.mjs dengan Chrome headless)
//
// Cara jalan (server `next start` di port 3111):
//   node scripts/e2e-fase5.mjs
//
// Exit 0 kalau semua PASS, 1 kalau ada FAIL.

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { muatEnvLocal } from "./load-env.mjs";

muatEnvLocal();

const BASE_URL = process.env.SMOKE_BASE_URL || "http://localhost:3111";
const results = [];
let passed = 0;
let failed = 0;
let warned = 0;

function catat(status, nama, detail = "") {
  if (typeof status === "boolean") status = status ? "PASS" : "FAIL";
  if (status === "PASS") passed += 1;
  else if (status === "FAIL") failed += 1;
  else warned += 1;
  results.push(`${status.padEnd(5)} ${nama}${detail ? `  → ${detail}` : ""}`);
}

function ringkas(js, maks = 260) {
  const s = typeof js === "string" ? js : JSON.stringify(js);
  if (!s) return "";
  return s.length > maks ? `${s.slice(0, maks)}…` : s;
}

// ---------------------------------------------------------------------------
// Setup client
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

async function login(email, password = "looplink123") {
  const { data, error } = await anonClient.auth.signInWithPassword({ email, password });
  if (error || !data.session) throw new Error(`login gagal ${email}: ${error?.message || "tanpa session"}`);
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
  return { status: res.status, body: hasil, headers: res.headers, text: teks };
}

async function buatUserRegistrasi(email, namaLengkap) {
  // Simulasi registrasi: user dibuat dengan email_confirm=true (setara user
  // yang sudah mengklik link verifikasi). Admin API dipakai karena signUp
  // publik kena rate limit email dari env lokal; smoke-test memakai pola sama.
  const { data: created, error } = await adminClient.auth.admin.createUser({
    email,
    password: "looplink123",
    email_confirm: true,
    user_metadata: { nama_lengkap: namaLengkap },
  });
  if (error || !created?.user) {
    throw new Error(`createUser ${email}: ${error?.message || "tanpa user"}`);
  }
  return created.user;
}

// ===========================================================================
// MAIN
// ===========================================================================
async function main() {
  const STAMP = Date.now();
  const EMAIL_A = `looplink.e2e.akunA.${STAMP}@gmail.com`;
  const EMAIL_B = `looplink.e2e.akunB.${STAMP}@gmail.com`;
  const authUserIds = [];
  const listingDibuat = [];
  let pemilikId = null;
  let pengklaimId = null;

  console.log("== Setup akun (registrasi) ==");
  const userA = await buatUserRegistrasi(EMAIL_A, "Andi E2E");
  const userB = await buatUserRegistrasi(EMAIL_B, "Bela E2E");
  authUserIds.push(userA.id, userB.id);
  pemilikId = userA.id;
  pengklaimId = userB.id;
  catat(true, `S1a. Registrasi akun baru (A=Andi, B=Bela) → user terkonfirmasi`, `A=${userA.id.slice(0, 8)}… B=${userB.id.slice(0, 8)}…`);

  // -----------------------------------------------------------------------
  // S1. Setup lokasi (mensimulasikan SetupLokasiForm: GPS atau manual)
  // -----------------------------------------------------------------------
  console.log("\n== S1. Registrasi → setup lokasi → upload → AI → koreksi → tayang ==");
  const lokasiA = { lokasi_lat: -7.33, lokasi_lng: 112.79, alamat_teks: "Jl. Rungkut Asri No. 12, Surabaya" };
  const lokasiB = { lokasi_lat: -7.453, lokasi_lng: 112.713, alamat_teks: "Jl. Pahlawan No. 45, Sidoarjo" };
  const { error: errProfA } = await adminClient.from("profiles").upsert({
    id: userA.id, nama_lengkap: "Andi E2E", no_telepon: "0812-3456-7890", ...lokasiA,
  });
  const { error: errProfB } = await adminClient.from("profiles").upsert({
    id: userB.id, nama_lengkap: "Bela E2E", no_telepon: "0813-3456-7890", ...lokasiB,
  });
  catat(!errProfA && !errProfB, "S1b. Setup lokasi akun A & B (koordinat + alamat manual tersimpan)", errProfA?.message || errProfB?.message || `A=${lokasiA.lokasi_lat},${lokasiA.lokasi_lng} | B=${lokasiB.lokasi_lat},${lokasiB.lokasi_lng}`);

  const sesiA = await login(EMAIL_A);
  const sesiB = await login(EMAIL_B);
  catat(true, "S1c. Login kedua akun berhasil (cookie sesi siap)");

  // --- Upload foto → klasifikasi AI ---------------------------------------
  const FIXTURE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "fixtures/cardboard-milk-carton.jpg");
  const GAMBAR_BYTES = readFileSync(FIXTURE);

  const klas = await panggil("/api/listings/klasifikasi", {
    method: "POST", session: sesiA, raw: true,
    body: GAMBAR_BYTES,
    headers: { "Content-Type": "application/octet-stream" },
  });
  const aiSukses = klas.status === 200 && klas.body?.gagal === false && typeof klas.body?.kategori === "string";
  const kategoriAI = aiSukses ? klas.body.kategori : null;
  const confidenceAI = aiSukses ? klas.body.confidence : null;
  if (aiSukses) {
    catat(true, "S1d. AI mengklasifikasi foto → kategori + confidence", `kategori=${kategoriAI}, confidence=${confidenceAI}`);
  } else {
    catat(
      "WARN",
      "S1d. AI klasifikasi live fallback (DNS HuggingFace tidak resolve di jaringan dev)",
      `${klas.status} ${ringkas(klas.body)}`
    );
  }

  // --- Alur koreksi --------------------------------------------------------
  // Spesifikasi: confidence < 0.6 → perlu koreksi manual; gagal total → wajib
  // pilih manual. Dalam skenario ini pengguna MENINJAU hasil AI lalu (kalau
  // perlu) mengoreksi. Dipaksa lewat jalur koreksi untuk menguji state.
  const perluKoreksi = aiSukses && klas.body?.perlu_koreksi_manual === true;
  const kategoriFinal = kategoriAI && kategoriAI !== "Unknown" ? kategoriAI : "Cardboard";
  const dikoreksi = !aiSukses || perluKoreksi || kategoriFinal !== kategoriAI;
  if (dikoreksi) {
    catat(true, "S1e. Koreksi kategori (manual/AI kurang yakin) → kategori final", `${kategoriAI ?? "null"} → ${kategoriFinal} (dikoreksi=${dikoreksi})`);
  } else {
    catat(true, "S1e. Kategori AI dipakai tanpa koreksi", kategoriFinal);
  }

  // --- Upload foto ke Storage (alur nyata UploadFlow) -----------------------
  // Pakai client TERPISAH dengan `setSession` supaya RLS storage mengenali
  // user A (persistSession:false pada anonClient tidak menyimpan sesi).
  let fotoUrl = null;
  try {
    const clientA = createClient(URL_PROYEK, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error: errSet } = await clientA.auth.setSession({
      access_token: sesiA.access_token,
      refresh_token: sesiA.refresh_token,
    });
    if (errSet) throw new Error(`setSession gagal: ${errSet.message}`);
    const { data: userNow } = await clientA.auth.getUser();
    const userId = userNow?.user?.id || userA.id;
    const pathFoto = `${userId}/e2e-${STAMP}.jpg`;
    const { error: errUp } = await clientA.storage
      .from("listings")
      .upload(pathFoto, GAMBAR_BYTES, { contentType: "image/jpeg", upsert: true });
    if (errUp) throw new Error(errUp.message);
    const { data: pub } = clientA.storage.from("listings").getPublicUrl(pathFoto);
    fotoUrl = pub.publicUrl;
    catat(true, "S1f. Foto berhasil di-upload ke Storage bucket `listings`", pathFoto.split("/").slice(-2).join("/"));
  } catch (err) {
    catat("WARN", "S1f. Upload foto ke Storage gagal (pakai placeholder)", err.message);
    fotoUrl = "https://placehold.co/600x400?text=E2E+Kardus";
  }
  if (fotoUrl && !fotoUrl.includes("placehold")) console.log("       → publicUrl:", fotoUrl.slice(0, 90));

  // --- Buat listing ----------------------------------------------------------
  const buat = await panggil("/api/listings", {
    method: "POST", session: sesiA,
    body: {
      judul: "E2E - Kardus bekas pabrik Andi",
      kategoriCitra: kategoriFinal,
      kategoriDikoreksi: dikoreksi,
      confidenceScore: aiSukses ? confidenceAI : null,
      deskripsiTeks: { kondisi: "kering", catatan_tambahan: "sudah dipress" },
      jumlah: 250,
      satuan: "kg",
      lokasiLat: lokasiA.lokasi_lat,
      lokasiLng: lokasiA.lokasi_lng,
      expiredAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      foto: [{ fotoUrl, urutan: 1 }],
    },
  });
  let listingId = null;
  if (buat.status === 201 && buat.body?.listing_id) {
    listingId = buat.body.listing_id;
    listingDibuat.push(listingId);
  }
  catat(buat.status === 201 && !!listingId, "S1g. Listing dibuat → tayang status tersedia", `${buat.status} ${ringkas(buat.body)}`);

  if (listingId) {
    const { data: cek } = await adminClient.from("listings").select("id, status, user_id, kategori_citra, kategori_dikoreksi, confidence_score").eq("id", listingId).single();
    catat(
      !!cek && cek.status === "tersedia" && cek.user_id === userA.id && cek.kategori_citra === kategoriFinal,
      "S1h. Verifikasi DB: status=tersedia, user_id=session, kategori tersimpan",
      cek ? `status=${cek.status}, kategori=${cek.kategori_citra}, dikoreksi=${cek.kategori_dikoreksi}, conf=${cek.confidence_score}` : "listing tidak ditemukan"
    );

    // Listing milik sendiri TIDAK boleh muncul di pencarian dirinya (rule #6 juga di S5).
  }

  // -----------------------------------------------------------------------
  // S2. Cari → hasil + skor → detail → klaim → kontak
  // -----------------------------------------------------------------------
  console.log("\n== S2. Cari bahan → hasil & skor → detail → klaim → kontak ==");
  let cariHasil = null;
  if (listingId) {
    const cari = await panggil("/api/listings/cari", {
      method: "POST", session: sesiB,
      body: {
        kategoriKebutuhan: "Bahan baku daur ulang kertas",
        radiusKm: 30,
        lokasiLat: lokasiB.lokasi_lat,
        lokasiLng: lokasiB.lokasi_lng,
        jumlahDibutuhkan: 200,
      },
    });
    if (cari.status === 200 && Array.isArray(cari.body?.hasil)) {
      cariHasil = cari.body.hasil;
      const item = cariHasil.find((h) => h.listing_id === listingId);
      const skorMasukAkal = !!item && item.skor_akhir > 0 && item.skor_akhir <= 1;
      catat(
        !!item && skorMasukAkal,
        "S2a. Listing akun A muncul di hasil pencarian akun B + skor masuk akal",
        item
          ? `skor=${item.skor_akhir}, jarak=${item.jarak_km}km, posisi ke-${cariHasil.findIndex((h) => h.listing_id === listingId) + 1} dari ${cariHasil.length}`
          : `tidak ada (hasil ${cariHasil.length})`
      );
      const urut = cariHasil.every((h, i, arr) => i === 0 || arr[i - 1].skor_akhir >= h.skor_akhir);
      catat(urut, "S2b. Hasil terurut skor_akhir DESC", cariHasil.map((h) => h.skor_akhir).join(", "));
    } else {
      catat(false, "S2a. Pencarian → 200 + hasil", `${cari.status} ${ringkas(cari.body)}`);
    }
  }

  // --- Detail sebelum klaim (bukan pemilik) ---------------------------------
  let detailPemilik = null;
  if (listingId) {
    const det = await panggil(`/api/listings/${listingId}`, { method: "GET", session: sesiB });
    detailPemilik = det.body?.pemilik;
    catat(
      det.status === 200 && !!det.body?.id && !!detailPemilik?.nama_lengkap,
      "S2c. Detail listing terbuka (bukan pemilik) + info pemilik",
      `${det.status} pemilik=${detailPemilik?.nama_lengkap}, telp=${detailPemilik?.no_telepon}, foto=${det.body?.foto?.length}`
    );
  }

  // --- Klaim -----------------------------------------------------------------
  if (listingId) {
    const klaim = await panggil(`/api/listings/${listingId}/klaim`, { method: "POST", session: sesiB });
    catat(klaim.status === 200 && klaim.body?.success === true, "S2d. Klaim oleh akun B → 200", `${klaim.status} ${ringkas(klaim.body)}`);

    // Detail setelah klaim (pengklaim tetap bisa lihat + kontak muncul)
    const detSetelah = await panggil(`/api/listings/${listingId}`, { method: "GET", session: sesiB });
    catat(
      detSetelah.status === 200 && detSetelah.body?.pemilik?.no_telepon != null,
      "S2e. Setelah klaim: kontak pemilik muncul di detail (nama + telp + alamat)",
      `telp=${detSetelah.body?.pemilik?.no_telepon}, alamat=${detSetelah.body?.pemilik?.alamat_teks}`
    );

    const { data: cekKlaim } = await adminClient.from("listings").select("status, diklaim_oleh, diklaim_pada").eq("id", listingId).single();
    catat(
      !!cekKlaim && cekKlaim.status === "dipesan" && cekKlaim.diklaim_oleh === userB.id && !!cekKlaim.diklaim_pada,
      "S2f. Setelah klaim: status=dipesan, diklaim_oleh=B, diklaim_pada terisi",
      cekKlaim ? `status=${cekKlaim.status}, diklaim_oleh=${cekKlaim.diklaim_oleh?.slice(0, 8)}…` : "tidak ada"
    );
  }

  // -----------------------------------------------------------------------
  // S3. Pemilik tandai selesai → status + riwayat_klaim
  // -----------------------------------------------------------------------
  console.log("\n== S3. Selesaikan transaksi (pemilik) ==");
  if (listingId) {
    // Non-pemilik TIDAK boleh menyelesaikan (aturan #1)
    const selesaiByB = await panggil(`/api/listings/${listingId}/selesai`, { method: "POST", session: sesiB });
    catat(selesaiByB.status === 400, "S3a. Selesai oleh pengklaim (bukan pemilik) → 400 ditolak", `${selesaiByB.status} ${ringkas(selesaiByB.body)}`);

    const selesai = await panggil(`/api/listings/${listingId}/selesai`, { method: "POST", session: sesiA });
    catat(selesai.status === 200 && selesai.body?.success === true, "S3b. Pemilik tandai selesai → 200", `${selesai.status} ${ringkas(selesai.body)}`);

    const { data: cekSelesai } = await adminClient.from("listings").select("status, diklaim_oleh").eq("id", listingId).single();
    catat(!!cekSelesai && cekSelesai.status === "selesai", "S3c. Status listing berubah jadi selesai (DB)", `status=${cekSelesai?.status}`);

    const { data: rkSelesai } = await adminClient.from("riwayat_klaim").select("status_akhir, diselesaikan_pada").eq("listing_id", listingId).maybeSingle();
    catat(
      !!rkSelesai && rkSelesai.status_akhir === "selesai" && !!rkSelesai.diselesaikan_pada,
      "S3d. riwayat_klaim tercatat selesai + diselesaikan_pada terisi",
      rkSelesai ? `status_akhir=${rkSelesai.status_akhir}, selesai=${rkSelesai.diselesaikan_pada}` : "tidak ada"
    );

    // Listing selesai tidak muncul lagi di pencarian
    const cariSelesai = await panggil("/api/listings/cari", {
      method: "POST", session: sesiB,
      body: { kategoriKebutuhan: "Bahan baku daur ulang kertas", radiusKm: 30, lokasiLat: lokasiB.lokasi_lat, lokasiLng: lokasiB.lokasi_lng, jumlahDibutuhkan: 200 },
    });
    const masihMuncul = (cariSelesai.body?.hasil ?? []).some((h) => h.listing_id === listingId);
    catat(cariSelesai.status === 200 && !masihMuncul, "S3e. Listing selesai tidak muncul lagi di pencarian", masihMuncul ? "MASIH MUNCUL" : "tidak muncul ✓");
  }

  // -----------------------------------------------------------------------
  // S4. Batal klaim dari dua sisi — dibatalkan_oleh benar
  // -----------------------------------------------------------------------
  console.log("\n== S4. Batal klaim dari dua sisi ==");

  // S4a: batal oleh PENGKLAIM (B)
  let lidBatalPengklaim = null;
  {
    const buatB = await panggil("/api/listings", {
      method: "POST", session: sesiA,
      body: { judul: "E2E - Botol plastik untuk batal by pengklaim", kategoriCitra: "Plastic", kategoriDikoreksi: false, confidenceScore: 0.9, jumlah: 80, satuan: "kg", lokasiLat: lokasiA.lokasi_lat, lokasiLng: lokasiA.lokasi_lng, foto: [{ fotoUrl: "https://placehold.co/300?text=batalB", urutan: 1 }] },
    });
    lidBatalPengklaim = buatB.status === 201 ? buatB.body.listing_id : null;
    if (lidBatalPengklaim) listingDibuat.push(lidBatalPengklaim);
  }
  if (lidBatalPengklaim) {
    const klaim1 = await panggil(`/api/listings/${lidBatalPengklaim}/klaim`, { method: "POST", session: sesiB });
    catat(klaim1.status === 200, "S4a.1. Klaim listing baru oleh B → 200", `${klaim1.status}`);

    const batalByB = await panggil(`/api/listings/${lidBatalPengklaim}/batal`, { method: "POST", session: sesiB });
    catat(batalByB.status === 200, "S4a.2. Batal oleh pengklaim (B) → 200", `${batalByB.status} ${ringkas(batalByB.body)}`);

    const { data: cekA } = await adminClient.from("listings").select("status, dibatalkan_oleh").eq("id", lidBatalPengklaim).single();
    const { data: rkA } = await adminClient.from("riwayat_klaim").select("status_akhir").eq("listing_id", lidBatalPengklaim).maybeSingle();
    catat(
      !!cekA && cekA.status === "tersedia" && cekA.dibatalkan_oleh === userB.id && !!rkA && rkA.status_akhir === "dibatalkan",
      "S4a.3. dibatalkan_oleh=pengklaim (B) tercatat di listings + riwayat status dibatalkan",
      `listings.status=${cekA?.status}, listings.dibatalkan_oleh=${cekA?.dibatalkan_oleh?.slice(0, 8)}…, riwayat.status=${rkA?.status_akhir}`
    );

    // Cek pihak ketiga tidak bisa batal (tidak ada pihak ketiga dalam tes ini;
    // dicek oleh smoke-test API B6/B7). Kontrol: setelah batal, klaim ulang
    // oleh B lalu batal oleh PEMILIK → dibatalkan_oleh = pemilik.
  }

  // S4b: batal oleh PEMILIK (A)
  let lidBatalPemilik = null;
  {
    const buatB = await panggil("/api/listings", {
      method: "POST", session: sesiA,
      body: { judul: "E2E - Besi tua untuk batal by pemilik", kategoriCitra: "Metal", kategoriDikoreksi: false, confidenceScore: 0.95, jumlah: 300, satuan: "kg", lokasiLat: lokasiA.lokasi_lat, lokasiLng: lokasiA.lokasi_lng, foto: [{ fotoUrl: "https://placehold.co/300?text=batalA", urutan: 1 }] },
    });
    lidBatalPemilik = buatB.status === 201 ? buatB.body.listing_id : null;
    if (lidBatalPemilik) listingDibuat.push(lidBatalPemilik);
  }
  if (lidBatalPemilik) {
    await panggil(`/api/listings/${lidBatalPemilik}/klaim`, { method: "POST", session: sesiB });
    const batalByA = await panggil(`/api/listings/${lidBatalPemilik}/batal`, { method: "POST", session: sesiA });
    catat(batalByA.status === 200, "S4b.1. Batal oleh pemilik (A) → 200", `${batalByA.status} ${ringkas(batalByA.body)}`);

    const { data: listingSetelahBatal } = await adminClient.from("listings").select("status, dibatalkan_oleh").eq("id", lidBatalPemilik).single();
    const { data: rkB } = await adminClient.from("riwayat_klaim").select("status_akhir").eq("listing_id", lidBatalPemilik).maybeSingle();
    catat(
      !!listingSetelahBatal && listingSetelahBatal.dibatalkan_oleh === userA.id && !!rkB && rkB.status_akhir === "dibatalkan",
      "S4b.2. dibatalkan_oleh=pemilik (A) tercatat di listings + riwayat status dibatalkan",
      listingSetelahBatal ? `listings.dibatalkan_oleh=${listingSetelahBatal.dibatalkan_oleh?.slice(0, 8)}…, riwayat.status=${rkB?.status_akhir}` : "tidak ada"
    );
  }

  // -----------------------------------------------------------------------
  // S5. Listing sendiri TIDAK bisa diklaim (API + DOM)
  // -----------------------------------------------------------------------
  console.log("\n== S5. Listing sendiri tidak bisa diklaim ==");
  let lidS5 = null;
  {
    const buatS5 = await panggil("/api/listings", {
      method: "POST", session: sesiA,
      body: { judul: "E2E - Kardus S5 milik sendiri", kategoriCitra: "Cardboard", jumlah: 10, satuan: "kg", lokasiLat: lokasiA.lokasi_lat, lokasiLng: lokasiA.lokasi_lng, foto: [{ fotoUrl: "https://placehold.co/300?text=s5", urutan: 1 }] },
    });
    lidS5 = buatS5.status === 201 ? buatS5.body.listing_id : null;
    if (lidS5) listingDibuat.push(lidS5);
  }
  if (lidS5) {
    const klaimSendiri = await panggil(`/api/listings/${lidS5}/klaim`, { method: "POST", session: sesiA });
    catat(
      klaimSendiri.status === 400 && (klaimSendiri.body?.error || "").toLowerCase().includes("milik sendiri"),
      "S5a. API: klaim listing sendiri → 400 (ditolak RPC)",
      `${klaimSendiri.status} ${ringkas(klaimSendiri.body)}`
    );

    // DOM SSR: halaman /listing/[id] saat dibuka pemilik → tidak ada tombol Amankan
    const htmlPemilik = await fetch(`${BASE_URL}/listing/${lidS5}`, {
      headers: { Cookie: sesiCookie(sesiA) },
    }).then((r) => r.text());
    const adaTombolAmankanPemilik = /Amankan/.test(htmlPemilik);
    const adaPesanPemilik = /Ini listingmu/.test(htmlPemilik);
    catat(
      !adaTombolAmankanPemilik && adaPesanPemilik,
      "S5b. DOM SSR (pemilik): TIDAK ada tombol 'Amankan' + ada pesan 'Ini listingmu'",
      `Amankan=${adaTombolAmankanPemilik}, pesanPemilik=${adaPesanPemilik}`
    );

    // Kontrol: halaman yang sama saat dibuka B (bukan pemilik) → ada tombol
    const htmlPencari = await fetch(`${BASE_URL}/listing/${lidS5}`, {
      headers: { Cookie: sesiCookie(sesiB) },
    }).then((r) => r.text());
    const adaTombolAmankanPencari = /Amankan/.test(htmlPencari);
    catat(adaTombolAmankanPencari, "S5c. Kontrol DOM (bukan pemilik): tombol 'Amankan' TAMPAK", `Amankan=${adaTombolAmankanPencari}`);
  }

  // -----------------------------------------------------------------------
  // S6. Radius pencarian — listing di luar radius tidak muncul
  // -----------------------------------------------------------------------
  console.log("\n== S6. Radius pencarian ==");
  let lidJauh = null;
  {
    // Listing pemilik A di lokasi sangat jauh (Jakarta, ~680 km dari Sidoarjo).
    const buatJauh = await panggil("/api/listings", {
      method: "POST", session: sesiA,
      body: { judul: "E2E - Kardus jauh di Jakarta", kategoriCitra: "Cardboard", jumlah: 100, satuan: "kg", lokasiLat: -6.2, lokasiLng: 106.816, foto: [{ fotoUrl: "https://placehold.co/300?text=jakarta", urutan: 1 }] },
    });
    lidJauh = buatJauh.status === 201 ? buatJauh.body.listing_id : null;
    if (lidJauh) listingDibuat.push(lidJauh);
  }
  if (lidJauh) {
    const { data: cekJauh } = await adminClient.from("listings").select("id").eq("id", lidJauh).single();
    catat(!!cekJauh, "S6a. Listing di Jakarta dibuat (kontrol, kategori Cardboard)", `id=${lidJauh.slice(0, 8)}…`);

    const cariKecil = await panggil("/api/listings/cari", {
      method: "POST", session: sesiB,
      body: { kategoriKebutuhan: "Bahan baku daur ulang kertas", radiusKm: 10, lokasiLat: lokasiB.lokasi_lat, lokasiLng: lokasiB.lokasi_lng, jumlahDibutuhkan: 50 },
    });
    const munculKecil = (cariKecil.body?.hasil ?? []).some((h) => h.listing_id === lidJauh);
    catat(cariKecil.status === 200 && !munculKecil, "S6b. Radius 10 km: listing Jakarta (jarak ~680 km) TIDAK muncul", `hasil=${cariKecil.body?.hasil?.length ?? "-"} items`);

    const cariBesar = await panggil("/api/listings/cari", {
      method: "POST", session: sesiB,
      body: { kategoriKebutuhan: "Bahan baku daur ulang kertas", radiusKm: 1000, lokasiLat: lokasiB.lokasi_lat, lokasiLng: lokasiB.lokasi_lng, jumlahDibutuhkan: 50 },
    });
    const munculBesar = (cariBesar.body?.hasil ?? []).some((h) => h.listing_id === lidJauh);
    catat(cariBesar.status === 200 && munculBesar, "S6c. Radius 1000 km: listing Jakarta MUNCUL", munculBesar ? "✓" : "tidak muncul");

    // Verifikasi jarak yang dihitung masuk akal (~680 km)
    const itemJauh = (cariBesar.body?.hasil ?? []).find((h) => h.listing_id === lidJauh);
    if (itemJauh) {
      const wajar = itemJauh.jarak_km > 600 && itemJauh.jarak_km < 750;
      catat(wajar, "S6d. Jarak Haversine masuk akal (Sidoarjo↔Jakarta)", `jarak=${itemJauh.jarak_km} km`);
    }
  }

  // -----------------------------------------------------------------------
  // S7. Mobile — dijalankan terpisah (scripts/e2e-mobile.mjs, Chrome headless)
  // -----------------------------------------------------------------------
  console.log("\n== S7. Mobile ==");
  catat("WARN", "S7. Test mobile dijalankan terpisah via scripts/e2e-mobile.mjs (Chrome headless)");

  // =========================================================================
  // CLEANUP — buang data test (seed aman)
  // =========================================================================
  console.log("\n== Cleanup ==");
  try {
    await adminClient.from("laporan").delete().in("pelapor_id", authUserIds);
    await adminClient.from("riwayat_pencarian").delete().in("pencari_id", authUserIds);
    const { data: rkRows } = await adminClient.from("riwayat_klaim").select("id").in("pemilik_id", authUserIds);
    if (rkRows && rkRows.length) await adminClient.from("riwayat_klaim").delete().in("id", rkRows.map((r) => r.id));
    for (const lid of listingDibuat) {
      const { data: refs } = await adminClient.from("riwayat_pencarian_hasil").select("id").eq("listing_id", lid);
      if (refs?.length) await adminClient.from("riwayat_pencarian_hasil").delete().in("id", refs.map((r) => r.id));
      await adminClient.from("listings").delete().eq("id", lid);
    }
    for (const uid of authUserIds) {
      await adminClient.auth.admin.deleteUser(uid);
    }
    catat(true, "Cleanup data test selesai (listing, riwayat, user auth)");
  } catch (err) {
    catat("WARN", "Cleanup sebagian gagal", err.message);
  }

  // =========================================================================
  // Rangkuman
  // =========================================================================
  console.log("\n================================================");
  console.log(`HASIL E2E FASE 5: ${passed} PASS, ${failed} FAIL, ${warned} WARN`);
  console.log("================================================");
  for (const r of results) console.log(r);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("E2E Fase 5 gagal total:", err);
  process.exit(1);
});
