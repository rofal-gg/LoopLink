// scripts/verify-gap-schema.mjs
//
// Verifikasi fungsional 2 gap schema di PROGRESS.md (migration 09 & 10):
//
//   Gap 1: Pengklaim harus bisa SELECT listing (status 'dipesan') yang dia
//          klaim + foto listing-nya (RLS policy listing_select_claimant &
//          listing_photos_select_follows_parent yang diperluas).
//   Gap 2: DELETE listing yang punya baris riwayat_klaim harus sukses karena
//          FK anak listings ON DELETE CASCADE (migration 10).
//
// Cara kerja: sama seperti scripts/smoke-test-api.mjs — membuat user test via
// GoTrue admin API (service role), login, uji lewat client anon dengan sesi
// asli (RLS dijalankan persis seperti aplikasi), lalu CLEANUP TOTAL
// (hapus listing test + user auth test). Tidak menyentuh data seed.
//
// Jalankan: node scripts/verify-gap-schema.mjs
// Exit code 0 kalau semua PASS, 1 kalau ada FAIL.

import { createClient } from "@supabase/supabase-js";
import { muatEnvLocal } from "./load-env.mjs";

muatEnvLocal();

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

const URL_PROYEK = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
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
  if (error || !data.session) throw new Error(`login gagal ${email}: ${error?.message || "tanpa session"}`);
  return data.session;
}

async function main() {
  const STAMP = Date.now();
  const EMAIL_A = `looplink.gap.a.${STAMP}@gmail.com`; // pemilik
  const EMAIL_B = `looplink.gap.b.${STAMP}@gmail.com`; // pengklaim
  const EMAIL_C = `looplink.gap.c.${STAMP}@gmail.com`; // pihak ketiga (kontrol negatif)
  const authUserIds = [];

  console.log("== Setup user test (admin API GoTrue) ==");
  const userA = await buatUserAdmin(EMAIL_A, "Gap A Pemilik");
  const userB = await buatUserAdmin(EMAIL_B, "Gap B Pengklaim");
  const userC = await buatUserAdmin(EMAIL_C, "Gap C Pihak Ketiga");
  authUserIds.push(userA.id, userB.id, userC.id);

  await adminClient.from("profiles").insert([
    { id: userA.id, nama_lengkap: "Gap A Pemilik", no_telepon: "0851-000-0001", lokasi_lat: -7.33, lokasi_lng: 112.79 },
    { id: userB.id, nama_lengkap: "Gap B Pengklaim", no_telepon: "0851-000-0002", lokasi_lat: -7.45, lokasi_lng: 112.71 },
    { id: userC.id, nama_lengkap: "Gap C Pihak Ketiga", no_telepon: "0851-000-0003", lokasi_lat: -7.15, lokasi_lng: 112.65 },
  ]);
  catat(true, `user test + profiles dibuat (${authUserIds.length} user)`);

  const sesiA = await login(EMAIL_A);
  const sesiB = await login(EMAIL_B);
  const sesiC = await login(EMAIL_C);
  catat(true, "login 3 user test → session siap");

  // set auth session di client per-user
  const clientA = anonClient;
  const clientB = anonClient;
  const clientC = anonClient;

  console.log("\n== Gap 1: visibilitas pengklaim ==");

  // A buat listing + foto (RLS insert policy pemilik)
  const { data: created, error: errCreate } = await clientA.auth.setSession(sesiA);
  if (errCreate) throw errCreate;
  const { data: listing, error: errL } = await clientA
    .from("listings")
    .insert({
      user_id: userA.id,
      judul: "TEST GAP - Karton verify",
      kategori_citra: "Cardboard",
      jumlah: 10,
      satuan: "kg",
      lokasi_lat: -7.33,
      lokasi_lng: 112.79,
    })
    .select("id")
    .single();
  catat(!errL && !!listing?.id, "A membuat listing (tersedia)", errL ? errL.message : listing.id.slice(0, 8));
  if (errL || !listing?.id) throw new Error("tidak bisa lanjut tanpa listing");

  const LID = listing.id;
  const { error: errP } = await clientA.from("listing_photos").insert({ listing_id: LID, foto_url: "https://placehold.co/300?text=gap", urutan: 1 });
  catat(!errP, "A menambah 1 foto listing", errP ? errP.message : "ok");

  // --- (a) B lihat listing+ foto setelah klaim ---------------------------------
  await clientB.auth.setSession(sesiB);
  const { error: errKlaim } = await clientB.rpc("claim_listing", { p_listing_id: LID });
  catat(!errKlaim, "B klaim listing A → RPC sukses", errKlaim ? errKlaim.message : "status → dipesan");

  const { data: listB, error: errSelB } = await clientB
    .from("listings")
    .select("id, status, diklaim_oleh")
    .eq("id", LID);
  catat(
    !errSelB && (listB || []).length === 1 && listB[0].status === "dipesan" && listB[0].diklaim_oleh === userB.id,
    "Gap1.A: B SELECT listing 'dipesan' milik pengklaim → terlihat",
    errSelB ? errSelB.message : `rows=${listB?.length ?? 0}, status=${listB?.[0]?.status}`
  );

  const { data: fotoB, error: errFotoB } = await clientB
    .from("listing_photos")
    .select("id, listing_id")
    .eq("listing_id", LID);
  catat(
    !errFotoB && (fotoB || []).length === 1,
    "Gap1.B: B SELECT listing_photos listing 'dipesan' → foto terlihat",
    errFotoB ? errFotoB.message : `rows=${fotoB?.length ?? 0}`
  );

  // Kontrol negatif: C (bukan pemilik, bukan pengklaim) TIDAK boleh lihat
  await clientC.auth.setSession(sesiC);
  const { data: listC, error: errSelC } = await clientC.from("listings").select("id").eq("id", LID);
  catat(
    !errSelC && (listC || []).length === 0,
    "Gap1.C: C (pihak ketiga) TIDAK melihat listing dipesan",
    errSelC ? errSelC.message : `rows=${listC?.length ?? 0}`
  );
  const { data: fotoC, error: errFotoC } = await clientC.from("listing_photos").select("id").eq("listing_id", LID);
  catat(
    !errFotoC && (fotoC || []).length === 0,
    "Gap1.D: C (pihak ketiga) TIDAK melihat foto listing dipesan",
    errFotoC ? errFotoC.message : `rows=${fotoC?.length ?? 0}`
  );

  console.log("\n== Gap 2: DELETE listing ber-riwayat_klaim ==");

  // B batal? Tidak — sesuai skenario task: A (pemilik) batalkan klaim
  await clientA.auth.setSession(sesiA);
  const { error: errBatal } = await clientA.rpc("cancel_claim", { p_listing_id: LID });
  catat(!errBatal, "A batalkan klaim → RPC sukses (status kembali tersedia)", errBatal ? errBatal.message : "ok");

  // Pastikan riwayat_klaim terisi (baris 'dibatalkan')
  const { data: riwayat, error: errRk } = await adminClient
    .from("riwayat_klaim")
    .select("id, status_akhir")
    .eq("listing_id", LID);
  catat(
    !errRk && (riwayat || []).length >= 1,
    "riwayat_klaim terisi setelah cancel_claim (prasyarat Gap 2)",
    errRk ? errRk.message : `rows=${riwayat?.length ?? 0} status=${riwayat?.[0]?.status_akhir}`
  );

  // DELETE listing sebagai pemilik → harus sukses (cascade menghapus riwayat_klaim)
  const { error: errDel } = await clientA.from("listings").delete().eq("id", LID);
  catat(
    !errDel,
    "Gap2.A: A DELETE listing ber-riwayat_klaim → sukses (tidak ada error FK 400)",
    errDel ? `${errDel.code} ${errDel.message}` : "ok"
  );

  const { data: sisaListing } = await adminClient.from("listings").select("id").eq("id", LID);
  catat((sisaListing || []).length === 0, "Gap2.B: baris listing sudah hilang", `rows=${sisaListing?.length ?? 0}`);

  const { data: sisaRk } = await adminClient.from("riwayat_klaim").select("id").eq("listing_id", LID);
  catat((sisaRk || []).length === 0, "Gap2.C: riwayat_klaim ikut hilang (ON DELETE CASCADE)", `rows=${sisaRk?.length ?? 0}`);

  const { data: sisaFoto } = await adminClient.from("listing_photos").select("id").eq("listing_id", LID);
  catat((sisaFoto || []).length === 0, "Gap2.D: listing_photos ikut hilang", `rows=${sisaFoto?.length ?? 0}`);

  // =========================================================================
  // CLEANUP TOTAL — jangan tinggalkan baris test
  // =========================================================================
  console.log("\n== Cleanup user test ==");
  try {
    // Hapus sisa data referensi yang mungkin tertinggal (aman walau sudah cascade)
    await adminClient.from("laporan").delete().eq("listing_id", LID);
    await adminClient.from("riwayat_pencarian_hasil").delete().eq("listing_id", LID);
    await adminClient.from("listings").delete().eq("id", LID);
    await adminClient.from("riwayat_klaim").delete().eq("listing_id", LID);

    for (const uid of authUserIds) {
      const { error: errDelUser } = await adminClient.auth.admin.deleteUser(uid);
      if (errDelUser) console.warn(`  cleanup user ${uid.slice(0, 8)} gagal:`, errDelUser.message);
      else catat(true, `User test dihapus (${uid.slice(0, 8)}…)`);
    }
    const { data: cek } = await adminClient.from("profiles").select("id").in("id", authUserIds);
    catat(!cek || cek.length === 0, "Tidak ada sisa profile test", `sisa=${cek?.length ?? 0}`);
  } catch (err) {
    catat(WARN, "Cleanup sebagian gagal", err.message);
  }

  console.log("\n================================================");
  console.log(`HASIL: ${passed} PASS, ${failed} FAIL, ${warned} WARN`);
  console.log("================================================");
  for (const r of results) console.log(r);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Verifikasi gagal total:", err);
  process.exit(1);
});