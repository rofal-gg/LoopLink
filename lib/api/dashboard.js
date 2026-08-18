// lib/api/dashboard.js
//
// Helper SERVER-ONLY untuk halaman dashboard (/home dan turunannya).
//
// ⚠️ PENTING — JANGAN IMPORT DARI CLIENT COMPONENT ⚠️
// Modul ini mengimpor `lib/supabase/admin.js` (SUPABASE_SERVICE_ROLE_KEY).
// Hanya boleh di-import dari Server Component / API route.
//
// Penggunaan:
//   const supabase = await createClient();             // caller
//   const data = await ambilDataDashboard({ userId: user.id, supabase });
//
// Prinsip RLS:
//   * Entitas MILIK user (profiles sendiri, listings user_id = user,
//     riwayat_klaim pengklaim_id = user) dibaca lewat server client yang
//     diteruskan caller — RLS tetap aktif.
//   * Nama/entity MILIK ORANG LAIN yang tak selalu terbaca RLS
//     (judul listing untuk klaimSaya, nama pengklaim untuk klaimMasuk)
//     dilengkapi lewat admin client.
//
// Prinsip defensif:
//   * Setiap blok dibungkus try/catch — satu query error tidak menggagalkan
//     seluruh halaman. Tiap blok mengembalikan bentuk fallback yang valid.
//   * `profile.email` diambil dari auth user (profiles tidak menyimpan email).

import { createAdminClient } from "@/lib/supabase/admin";

const MAKS_TERBARU = 5;

/**
 * Ambil seluruh data dashboard.
 *
 * @param {object} param
 * @param {string} param.userId  — auth.users id (dari `auth.getUser()` caller).
 * @param {object} param.supabase — server client yang SUDAH dibuat caller
 *   (createClient dari "@/lib/supabase/server").
 *
 * @returns {Promise<{
 *   profile: {
 *     nama_lengkap: string|null, email: string|null, alamat_teks: string|null,
 *     lokasi_lat: number|null, lokasi_lng: number|null
 *   } | null,
 *   listingSaya: {
 *     total: number, tersedia: number, dipesan: number, selesai: number,
 *     dibatalkan: number,
 *     terbaru: Array<{
 *       id: string, judul: string|null, kategori_citra: string,
 *       jumlah: number, satuan: string, status: string, created_at: string
 *     }>
 *   },
 *   klaimSaya: Array<{
 *     listing_id: string, judul: string|null, jumlah: number|null,
 *     satuan: string|null, status_akhir: string, diklaim_pada: string
 *   }>,
 *   klaimMasuk: Array<{
 *     listing_id: string, judul: string|null, jumlah: number|null,
 *     satuan: string|null, pengklaim_nama: string|null, diklaim_pada: string
 *   }>
 * }>}
 */
export async function ambilDataDashboard({ userId, supabase }) {
  if (!userId) {
    throw new Error("ambilDataDashboard butuh userId");
  }

  const hasil = await Promise.allSettled([
    ambilProfile(userId, supabase),
    ambilListingSaya(userId, supabase),
    ambilKlaimSaya(userId, supabase),
    ambilKlaimMasuk(userId, supabase),
  ]);

  const nilai = hasil.map((h) => (h.status === "fulfilled" ? h.value : null));

  return {
    profile: nilai[0] ?? null,
    listingSaya: nilai[1] ?? EMPTY_LISTING_SAYA,
    klaimSaya: nilai[2] ?? [],
    klaimMasuk: nilai[3] ?? [],
  };
}

const EMPTY_LISTING_SAYA = Object.freeze({
  total: 0,
  tersedia: 0,
  dipesan: 0,
  selesai: 0,
  dibatalkan: 0,
  terbaru: [],
});

/**
 * Profil user sendiri + email dari auth user.
 * RLS memberlakukan "profile sendiri" — aman lewat server client caller.
 */
async function ambilProfile(userId, supabase) {
  try {
    const { data: row, error } = await supabase
      .from("profiles")
      .select("nama_lengkap, alamat_teks, lokasi_lat, lokasi_lng")
      .eq("id", userId)
      .maybeSingle();

    if (error || !row) {
      if (error) console.warn("[dashboard] profile gagal:", error.message);
      return null;
    }

    let email = null;
    try {
      const { data: authData } = await supabase.auth.getUser();
      email = authData?.user?.email ?? null;
    } catch {
      // email opsional — jangan sampai menggagalkan profil.
    }

    return {
      nama_lengkap: row.nama_lengkap,
      email,
      alamat_teks: row.alamat_teks,
      lokasi_lat: row.lokasi_lat,
      lokasi_lng: row.lokasi_lng,
    };
  } catch (err) {
    console.warn("[dashboard] profile gagal (exception):", err.message);
    return null;
  }
}

/**
 * Ringkasan listing milik user: total + hitungan per status + 5 terbaru.
 */
async function ambilListingSaya(userId, supabase) {
  try {
    const [
      { data: statusRows, error: errStatus },
      { data: terbaru, error: errTerbaru },
    ] = await Promise.all([
      supabase.from("listings").select("status").eq("user_id", userId),
      supabase
        .from("listings")
        .select("id, judul, kategori_citra, jumlah, satuan, status, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(MAKS_TERBARU),
    ]);

    if (errStatus && errTerbaru) {
      console.warn(
        "[dashboard] listingSaya gagal:",
        errStatus?.message ?? errTerbaru?.message
      );
      return { ...EMPTY_LISTING_SAYA };
    }

    const counts = { tersedia: 0, dipesan: 0, selesai: 0, dibatalkan: 0 };
    for (const row of statusRows ?? []) {
      if (row.status in counts) counts[row.status] += 1;
    }

    return {
      total: statusRows?.length ?? 0,
      ...counts,
      terbaru: (terbaru ?? []).map((l) => ({
        id: l.id,
        judul: l.judul,
        kategori_citra: l.kategori_citra,
        jumlah: l.jumlah,
        satuan: l.satuan,
        status: l.status,
        created_at: l.created_at,
      })),
    };
  } catch (err) {
    console.warn("[dashboard] listingSaya gagal (exception):", err.message);
    return { ...EMPTY_LISTING_SAYA };
  }
}

/**
 * Riwayat klaim yang DILAKUKAN user (pengklaim_id = user), diurutkan
 * diklaim_pada terbaru. Judul/jumlah/satuan listing dilengkapi admin client
 * karena listing milik orang lain tidak selalu terbaca RLS (mis. listing
 * status 'selesai'/'dibatalkan' yang bukan milik user).
 */
async function ambilKlaimSaya(userId, supabase) {
  try {
    // RLS: policy riwayat_klaim_select_related → pengklaim membaca barisnya.
    const { data: riwayat, error } = await supabase
      .from("riwayat_klaim")
      .select("listing_id, status_akhir, diklaim_pada")
      .eq("pengklaim_id", userId)
      .order("diklaim_pada", { ascending: false });

    if (error) {
      console.warn("[dashboard] klaimSaya gagal:", error.message);
      return [];
    }

    const listingIds = [
      ...new Set((riwayat ?? []).map((r) => r.listing_id).filter(Boolean)),
    ];
    const infoByListing = await ambilMapInfoListing(listingIds);

    return (riwayat ?? []).map((r) => {
      const info = infoByListing.get(r.listing_id);
      return {
        listing_id: r.listing_id,
        judul: info?.judul ?? null,
        jumlah: info?.jumlah ?? null,
        satuan: info?.satuan ?? null,
        status_akhir: r.status_akhir,
        diklaim_pada: r.diklaim_pada,
      };
    });
  } catch (err) {
    console.warn("[dashboard] klaimSaya gagal (exception):", err.message);
    return [];
  }
}

/**
 * Klaim MASUK: listing milik user yang sedang 'dipesan' (diklaim_oleh != null),
 * lengkap dengan nama pengklaim dari profiles (admin client).
 */
async function ambilKlaimMasuk(userId, supabase) {
  try {
    // RLS: pemilik membaca listing miliknya sendiri.
    const { data: listings, error } = await supabase
      .from("listings")
      .select("id, judul, jumlah, satuan, diklaim_oleh, diklaim_pada")
      .eq("user_id", userId)
      .eq("status", "dipesan")
      .not("diklaim_oleh", "is", null)
      .order("diklaim_pada", { ascending: false });

    if (error) {
      console.warn("[dashboard] klaimMasuk gagal:", error.message);
      return [];
    }

    const pengklaimIds = [
      ...new Set((listings ?? []).map((l) => l.diklaim_oleh).filter(Boolean)),
    ];
    const namaByPengklaim = await ambilMapNamaProfile(pengklaimIds);

    return (listings ?? []).map((l) => ({
      listing_id: l.id,
      judul: l.judul,
      jumlah: l.jumlah,
      satuan: l.satuan,
      pengklaim_nama: namaByPengklaim.get(l.diklaim_oleh) ?? null,
      diklaim_pada: l.diklaim_pada,
    }));
  } catch (err) {
    console.warn("[dashboard] klaimMasuk gagal (exception):", err.message);
    return [];
  }
}

/* ─── Helper internal (admin client) ───────────────────────────────────── */

/**
 * Peta { listing_id -> { judul, jumlah, satuan } }.
 * Return peta kosong kalau admin client tidak tersedia / query gagal.
 */
async function ambilMapInfoListing(listingIds) {
  if (listingIds.length === 0) return new Map();
  const admin = buatAdminClientAman();
  if (!admin) return new Map();
  try {
    const { data, error } = await admin
      .from("listings")
      .select("id, judul, jumlah, satuan")
      .in("id", listingIds);
    if (error) return new Map();
    return new Map((data ?? []).map((l) => [l.id, l]));
  } catch {
    return new Map();
  }
}

/**
 * Peta { profileId -> nama_lengkap }.
 * Return peta kosong kalau admin client tidak tersedia / query gagal.
 */
async function ambilMapNamaProfile(profileIds) {
  if (profileIds.length === 0) return new Map();
  const admin = buatAdminClientAman();
  if (!admin) return new Map();
  try {
    const { data, error } = await admin
      .from("profiles")
      .select("id, nama_lengkap")
      .in("id", profileIds);
    if (error) return new Map();
    return new Map((data ?? []).map((p) => [p.id, p.nama_lengkap]));
  } catch {
    return new Map();
  }
}

/**
 * Buat admin client aman: null (bukan throw) kalau env service role belum
 * terisi — pemanggil memutuskan fallback-nya.
 */
function buatAdminClientAman() {
  try {
    return createAdminClient();
  } catch (err) {
    console.warn("[dashboard] admin client tidak tersedia:", err.message);
    return null;
  }
}