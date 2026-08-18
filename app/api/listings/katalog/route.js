// app/api/listings/katalog/route.js
//
// GET /api/listings/katalog — WAJIB login
// KATALOG MARKETPLACE: menampilkan SEMUA listing status='tersedia' milik
// user lain — termasuk yang di luar radius jangkauan. Radius TIDAK memotong
// hasil; ia hanya penanda `di_luar_jangkauan` supaya UI bisa memberi badge
// "di luar jangkauan" tanpa menyembunyikan listing.
//
// Query params (opsional):
//   kategori  : filter `kategori_citra`, salah satu dari 12 kelas model
//               (Battery, Biological, Brown-glass, Cardboard, Clothes,
//               Green-glass, Metal, Paper, Plastic, Shoes, Trash, White-glass).
//               Nilai tidak valid → 400 dengan pesan jelas (tidak diabaikan).
//   radius    : angka km (> 0). Kalau diisi DAN jarak_km diketahui,
//               `di_luar_jangkauan = jarak_km > radius`. Kalau jarak_km null
//               (koordinat tidak lengkap), `di_luar_jangkauan` tetap false.
//               Tanpa param ini `di_luar_jangkauan` selalu false.
//
// Response 200: { hasil: [{ listing_id, judul, kategori_citra, jumlah,
//                          satuan, foto_url, created_at, jarak_km,
//                          di_luar_jangkauan }] }
//
// PRIVASI (keputusan bisnis): endpoint ini TIDAK PERNAH mengembalikan
// user_id, no_telepon, alamat_teks, deskripsi_teks, maupun koordinat exact
// pemilik lain. Hanya field publik yang cukup untuk kartu katalog.
//
// Alur:
//   1. Auth via session (`createClient` dari lib/supabase/server) — katalog
//      TETAP wajib login meskipun semua hasilnya milik user lain.
//   2. Ambil lokasi user dari `profiles` (lokasi_lat/lokasi_lng, boleh null).
//   3. Query listings status='tersedia' milik user lain. `.neq("user_id", ...)`
//      dipakai karena RLS SELECT memperlihatkan listing sendiri juga (filter
//      manual, sama seperti endpoint /cari). Koordinat listing TURUT di-fetch
//      untuk perhitungan jarak tetapi TIDAK dimasukkan ke response.
//   4. Jarak memakai `hitungJarakKm` dari lib/ai/matching; null kalau salah
//      satu sisi koordinat tidak valid.

import { hitungJarakKm } from "@/lib/ai/matching";
import { createClient } from "@/lib/supabase/server";
import {
  validasiJumlahPositif,
  validasiKategori,
} from "@/lib/api/validasi-listing";

const BATAS_KATALOG = 100;

/** Koordinat dianggap valid hanya kalau berupa angka finite. */
function koordinatValid(nilai) {
  if (typeof nilai === "string" && nilai.trim() !== "") {
    nilai = Number(nilai);
  }
  return typeof nilai === "number" && Number.isFinite(nilai);
}

export async function GET(request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Belum login" }, { status: 401 });
  }

  // --- Query params opsional ------------------------------------------------
  const searchParams = request.nextUrl.searchParams;

  // `kategori`: kalau diisi harus valid (12 kelas) — selain itu 400.
  const kategoriParam = searchParams.get("kategori");
  let filterKategori = null;
  if (kategoriParam != null && kategoriParam.trim() !== "") {
    try {
      filterKategori = validasiKategori(kategoriParam.trim());
    } catch (err) {
      return Response.json({ error: err.message }, { status: 400 });
    }
  }

  // `radius`: angka km; kalau diisi harus > 0. Empty string dianggap tidak diisi.
  const radiusParam = searchParams.get("radius");
  let radiusKm = null;
  if (radiusParam != null && radiusParam.trim() !== "") {
    try {
      radiusKm = validasiJumlahPositif(radiusParam.trim(), "radius");
    } catch (err) {
      return Response.json({ error: err.message }, { status: 400 });
    }
  }

  // --- Lokasi user (boleh null kalau profil belum punya koordinat) ----------
  const { data: profil } = await supabase
    .from("profiles")
    .select("lokasi_lat, lokasi_lng")
    .eq("id", user.id)
    .maybeSingle();

  const lokasiUserLat = profil?.lokasi_lat ?? null;
  const lokasiUserLng = profil?.lokasi_lng ?? null;

  // --- Query listing tersedia milik user lain --------------------------------
  let query = supabase
    .from("listings")
    .select(
      "id, judul, kategori_citra, jumlah, satuan, created_at, lokasi_lat, lokasi_lng, listing_photos(id, foto_url, urutan)"
    )
    .eq("status", "tersedia")
    .neq("user_id", user.id);

  if (filterKategori) {
    query = query.eq("kategori_citra", filterKategori);
  }

  query = query.order("created_at", { ascending: false }).limit(BATAS_KATALOG);

  const { data: kandidat, error: errKandidat } = await query;

  if (errKandidat) {
    return Response.json(
      { error: `Gagal memuat katalog: ${errKandidat.message}` },
      { status: 500 }
    );
  }

  // --- Bangun hasil (hanya field publik) -------------------------------------
  const hasil = (kandidat ?? []).map((l) => {
    // Foto pertama (urutan terkecil) — null kalau tidak ada.
    const fotoTerurut = (l.listing_photos ?? []).sort((a, b) => a.urutan - b.urutan);
    const fotoUrl = fotoTerurut.length > 0 ? fotoTerurut[0].foto_url : null;

    // Jarak hanya dihitung kalau koordinat KEDUA sisi valid (finite).
    let jarakKm = null;
    if (
      koordinatValid(lokasiUserLat) &&
      koordinatValid(lokasiUserLng) &&
      koordinatValid(l.lokasi_lat) &&
      koordinatValid(l.lokasi_lng)
    ) {
      try {
        jarakKm =
          Math.round(
            hitungJarakKm(lokasiUserLat, lokasiUserLng, l.lokasi_lat, l.lokasi_lng) * 10
          ) / 10;
      } catch {
        jarakKm = null;
      }
    }

    // Radius hanya penanda: tanpa radius, atau jarak tak diketahui → false.
    let diLuarJangkauan = false;
    if (radiusKm != null && jarakKm != null) {
      diLuarJangkauan = jarakKm > radiusKm;
    }

    return {
      listing_id: l.id,
      judul: l.judul,
      kategori_citra: l.kategori_citra,
      jumlah: l.jumlah,
      satuan: l.satuan,
      foto_url: fotoUrl,
      created_at: l.created_at,
      jarak_km: jarakKm,
      di_luar_jangkauan: diLuarJangkauan,
    };
  });

  return Response.json({ hasil });
}
