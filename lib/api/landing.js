// lib/api/landing.js
//
// Helper SERVER-ONLY untuk Landing page publik (app/page.js).
//
// ⚠️ PENTING — JANGAN IMPORT DARI CLIENT COMPONENT ⚠️
// Modul ini mengimpor `lib/supabase/admin.js` yang memakai
// SUPABASE_SERVICE_ROLE_KEY (bisa melewati RLS). File ini hanya boleh
// di-import dari Server Component / API route — tidak pernah dari file
// dengan "use client" atau modul yang ikut ter-bundle ke browser.
//
// Data yang dikembalikan hanya berisi kolom publik yang aman ditampilkan
// (tanpa user_id, no_telepon, dsb). Kontrak bentuk data ada di komentar
// fungsi `ambilDataLanding`.
//
// Prinsip defensif:
//   * Setiap blok dibungkus try/catch — satu query gagal (mis. Supabase
//     down) TIDAK boleh menggagalkan seluruh halaman.
//   * `statistik` dipakai lewat RPC `statistik_landing()` (RPC public dari
//     agent database, sudah di-grant ke anon) via server client biasa.
//   * `featured`, `aktivitas`, `gallery`, `testimoni`, `kategori` memakai
//     admin client karena RLS anon tidak mencukupi untuk membaca listing
//     milik orang lain (mis. status 'tersedia' memang terbaca anon, tapi
//     riwayat_klaim baru terbaca authenticated; admin dipakai supaya
//     konsisten & aman).

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const MAKS_FEATURED = 6;
const MAKS_GALLERY = 6;
const MAKS_AKTIVITAS = 8;

/**
 * Ambil seluruh data yang dibutuhkan Landing page dalam satu panggilan.
 *
 * @returns {Promise<{
 *   statistik: {
 *     jumlah_anggota: number, jumlah_listing: number, listing_tersedia: number,
 *     klaim_selesai: number, kg_limbah_tercatat: number, pencarian_tercatat: number,
 *     rata_rata_confidence: number|null, tanggal_pembaruan: string|null
 *   } | null,
 *   featured: Array<{
 *     listing_id: string, judul: string|null, kategori_citra: string,
 *     jumlah: number, satuan: string, foto_url: string|null, created_at: string
 *   }>,
 *   kategori: Array<{
 *     kategori_citra: string, jumlah: number, foto_url: string|null
 *   }>,
 *   aktivitas: Array<{
 *     tipe: "listing"|"klaim", judul: string|null, jumlah: number|null,
 *     satuan: string|null, nama: string|null, waktu: string
 *   }>,
 *   gallery: Array<{ foto_url: string, judul: string|null, kategori_citra: string }>,
 *   testimoni: Array<{
 *     nama: string, peran: string, kutipan: string,
 *     metrik: string, label_metrik: string, sumber: string
 *   }>
 * }>}
 */
export async function ambilDataLanding() {
  // allSettled sebagai jaring pengaman terakhir — tiap helper sudah punya
  // fallback sendiri (null / []), jadi halaman tidak akan pernah crash.
  const hasil = await Promise.allSettled([
    ambilStatistik(),
    ambilFeatured(),
    ambilKategori(),
    ambilAktivitas(),
    ambilGallery(),
    ambilTestimoni(),
  ]);

  const nilai = hasil.map((h) => (h.status === "fulfilled" ? h.value : null));

  return {
    statistik: nilai[0] ?? null,
    featured: nilai[1] ?? [],
    kategori: nilai[2] ?? [],
    aktivitas: nilai[3] ?? [],
    gallery: nilai[4] ?? [],
    testimoni: nilai[5] ?? [],
  };
}

/**
 * Ambil statistik landing lewat RPC `statistik_landing()`.
 * RPC adalah fungsi STABLE SECURITY DEFINER yang di-grant ke anon, jadi
 * aman dipanggil memakai server client biasa (RLS tetap aktif untuk data
 * lain). Kalau gagal → return null (UI punya state kosong).
 */
async function ambilStatistik() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("statistik_landing");
    if (error) {
      console.warn("[landing] statistik gagal:", error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn("[landing] statistik gagal (exception):", err.message);
    return null;
  }
}

/**
 * Listing unggulan: status 'tersedia', diurutkan created_at terbaru, max 6.
 * Dipakai admin client (RLS anon sebenarnya membaca status tersedia, tetapi
 * pola ini konsisten dengan helper lain dan aman karena server-only).
 * foto_url = foto urutan terkecil, null kalau listing tidak punya foto.
 */
async function ambilFeatured() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("listings")
      .select(
        "id, judul, kategori_citra, jumlah, satuan, created_at, listing_photos(id, foto_url, urutan)"
      )
      .eq("status", "tersedia")
      .order("created_at", { ascending: false })
      .limit(MAKS_FEATURED);

    if (error) {
      console.warn("[landing] featured gagal:", error.message);
      return [];
    }

    return (data ?? []).map((l) => ({
      listing_id: l.id,
      judul: l.judul,
      kategori_citra: l.kategori_citra,
      jumlah: l.jumlah,
      satuan: l.satuan,
      foto_url: fotoTerbesar(l.listing_photos ?? []),
      created_at: l.created_at,
    }));
  } catch (err) {
    console.warn("[landing] featured gagal (exception):", err.message);
    return [];
  }
}

/**
 * Agregat jumlah listing tersedia PER KATEGORI untuk Landing page.
 * Semua listing status 'tersedia' diambil (via admin client), lalu dihitung
 * di JS — bukan SQL GROUP BY — supaya mudah dipakai ulang & defensif.
 * Untuk setiap kategori_citra:
 *   * `jumlah`   = banyak listing tersedia.
 *   * `foto_url` = foto urutan terkecil dari listing PERTAMA kategori itu
 *                  (listing terbaru per created_at desc sebagai tiebreaker;
 *                  null kalau tidak ada foto di kategori tsb).
 * Output urut jumlah desc, lalu kategori_citra asc. Kategori tanpa listing
 * (jumlah 0) TIDAK ikut serta.
 */
async function ambilKategori() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("listings")
      .select(
        "id, kategori_citra, created_at, listing_photos(id, foto_url, urutan)"
      )
      .eq("status", "tersedia");

    if (error) {
      console.warn("[landing] kategori gagal:", error.message);
      return [];
    }

    // Kelompokkan per kategori_citra (abaikan baris tanpa kategori).
    const perKategori = new Map();
    for (const l of data ?? []) {
      if (!l.kategori_citra) continue;
      const grup = perKategori.get(l.kategori_citra);
      if (grup) grup.push(l);
      else perKategori.set(l.kategori_citra, [l]);
    }

    const hasil = [];
    for (const [kategori_citra, rows] of perKategori) {
      rows.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      hasil.push({
        kategori_citra,
        jumlah: rows.length,
        foto_url: fotoTerbesar(rows[0].listing_photos ?? []),
      });
    }

    hasil.sort(
      (a, b) => b.jumlah - a.jumlah || a.kategori_citra.localeCompare(b.kategori_citra)
    );
    return hasil;
  } catch (err) {
    console.warn("[landing] kategori gagal (exception):", err.message);
    return [];
  }
}

/**
 * Feed aktivitas gabungan (max 8, terbaru dulu):
 *   (a) 5 listing terbaru berstatus 'tersedia' → tipe 'listing'.
 *       nama = profiles.nama_lengkap pemilik (null → UI tampilkan "Anggota").
 *   (b) 3 riwayat_klaim terbaru berstatus_akhir 'selesai' → tipe 'klaim'.
 *       nama tidak diisi (kontrak: hanya judul listing yang diambil).
 *
 * Kolom `waktu` memakai ISO timestamp: created_at / diselesaikan_pada.
 */
async function ambilAktivitas() {
  let itemListing = [];
  try {
    const admin = createAdminClient();

    const { data: listingBaru, error: errListing } = await admin
      .from("listings")
      .select("id, user_id, judul, jumlah, satuan, created_at")
      .eq("status", "tersedia")
      .order("created_at", { ascending: false })
      .limit(5);

    if (errListing) {
      console.warn("[landing] aktivitas (listing) gagal:", errListing.message);
      return [];
    }

    // Nama pemilik digabungkan manual (bukan join FK) demi kontrol field.
    const pemilikIds = [
      ...new Set((listingBaru ?? []).map((l) => l.user_id).filter(Boolean)),
    ];
    const namaByPemilik = await ambilMapNamaProfile(pemilikIds);

    itemListing = (listingBaru ?? []).map((l) => ({
      tipe: "listing",
      judul: l.judul,
      jumlah: l.jumlah,
      satuan: l.satuan,
      nama: namaByPemilik.get(l.user_id) ?? null,
      waktu: l.created_at,
    }));

    // (b) Klaim selesai terbaru — admin client (anon tidak bisa baca riwayat_klaim).
    const { data: klaimSelesai, error: errKlaim } = await admin
      .from("riwayat_klaim")
      .select("listing_id, diselesaikan_pada")
      .eq("status_akhir", "selesai")
      .order("diselesaikan_pada", { ascending: false })
      .limit(3);

    if (errKlaim) {
      console.warn("[landing] aktivitas (klaim) gagal:", errKlaim.message);
      return itemListing.slice(0, MAKS_AKTIVITAS);
    }

    const listingIds = [
      ...new Set((klaimSelesai ?? []).map((r) => r.listing_id).filter(Boolean)),
    ];
    const infoByListing = await ambilMapInfoListing(listingIds);

    const itemKlaim = (klaimSelesai ?? []).map((r) => {
      const info = infoByListing.get(r.listing_id);
      return {
        tipe: "klaim",
        judul: info?.judul ?? null,
        jumlah: info?.jumlah ?? null,
        satuan: info?.satuan ?? null,
        nama: null,
        waktu: r.diselesaikan_pada,
      };
    });

    const gabungan = [...itemListing, ...itemKlaim].filter((i) => i.waktu != null);
    gabungan.sort(
      (a, b) => new Date(b.waktu).getTime() - new Date(a.waktu).getTime()
    );
    return gabungan.slice(0, MAKS_AKTIVITAS);
  } catch (err) {
    console.warn("[landing] aktivitas gagal (exception):", err.message);
    return itemListing.slice(0, MAKS_AKTIVITAS);
  }
}

/**
 * Galeri foto: listing status 'tersedia' yang PUNYA foto, diurutkan
 * created_at terbaru, max 6. `!inner` memberi efek inner join sehingga
 * hanya listing dengan minimal satu foto yang ikut ter-select.
 */
async function ambilGallery() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("listings")
      .select(
        "id, judul, kategori_citra, created_at, listing_photos!inner(foto_url, urutan)"
      )
      .eq("status", "tersedia")
      .order("created_at", { ascending: false })
      // Ambil lebih banyak dulu, lalu filter+slicing di JS supaya konsisten
      // walau beberapa listing ternyata punya foto kosong.
      .limit(MAKS_GALLERY * 4);

    if (error) {
      console.warn("[landing] gallery gagal:", error.message);
      return [];
    }

    const hasil = [];
    for (const l of data ?? []) {
      const fotoUrl = fotoTerbesar(l.listing_photos ?? []);
      if (!fotoUrl) continue;
      hasil.push({
        foto_url: fotoUrl,
        judul: l.judul,
        kategori_citra: l.kategori_citra,
      });
      if (hasil.length >= MAKS_GALLERY) break;
    }
    return hasil;
  } catch (err) {
    console.warn("[landing] gallery gagal (exception):", err.message);
    return [];
  }
}

/**
 * Testimoni publik: is_tampil = true, urut urutan asc.
 * Admin client dipakai konsisten dengan helper lain (server-only, aman).
 */
async function ambilTestimoni() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("testimoni")
      .select("nama, peran, kutipan, metrik, label_metrik, sumber")
      .eq("is_tampil", true)
      .order("urutan", { ascending: true });

    if (error) {
      console.warn("[landing] testimoni gagal:", error.message);
      return [];
    }
    return data ?? [];
  } catch (err) {
    console.warn("[landing] testimoni gagal (exception):", err.message);
    return [];
  }
}

/* ─── Helper internal (dibagi antar blok di atas) ──────────────────────── */

/** Ambil foto dengan urutan terkecil dari daftar foto, atau null. */
function fotoTerbesar(fotoRows) {
  if (!Array.isArray(fotoRows) || fotoRows.length === 0) return null;
  const terurut = [...fotoRows].sort((a, b) => a.urutan - b.urutan);
  return terurut[0].foto_url ?? null;
}

/**
 * Peta { profileId -> nama_lengkap } lewat admin client.
 * Return peta kosong (bukan throw) kalau admin client tidak tersedia.
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
 * Peta { listing_id -> { judul, jumlah, satuan } } lewat admin client,
 * dipakai untuk melengkapi judul listing di aktivitas klaim.
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
 * Buat admin client yang aman: kalau env service role belum terisi,
 * kembalikan null (pemanggil memutuskan fallback-nya) alih-alih throw.
 */
function buatAdminClientAman() {
  try {
    return createAdminClient();
  } catch (err) {
    console.warn("[landing] admin client tidak tersedia:", err.message);
    return null;
  }
}