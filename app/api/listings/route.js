// app/api/listings/route.js
//
// POST /api/listings — butuh login
// Buat listing baru (dipanggil setelah user konfirmasi kategori hasil AI).
//
// Body JSON:
//   {
//     judul: string,
//     kategoriCitra: string,            // ∈ 12 kelas model
//     kategoriDikoreksi?: boolean,      // default false
//     confidenceScore?: number,         // 0..1 (hasil model)
//     deskripsiTeks?: string|object,    // hasil ekstraksi Gemini (opsional)
//     jumlah: number,                   // > 0
//     satuan: string,                   // 'kg' | 'karung' | 'ton' | 'unit'
//     lokasiLat: number,                // -90..90
//     lokasiLng: number,                // -180..180
//     expiredAt?: string,               // ISO date (opsional)
//     foto: [{ fotoUrl: string, urutan?: number }]  // opsional
//   }
//
// `user_id` DIAMBIL DARI SESSION (`user.id`), bukan dari body — jangan
// percaya input client. Insert listing lalu listing_photos (RLS aman karena
// policy memaksa user_id = auth.uid()).
//
// Response 201: { listing_id, status: "tersedia" }

import { createClient } from "@/lib/supabase/server";
import {
  normalisasiDeskripsiTeks,
  normalisasiExpiredAt,
  paksaAngkaFinite,
  validasiJumlahPositif,
  validasiKategori,
  validasiKoordinat,
  validasiSatuan,
} from "@/lib/api/validasi-listing";

/** Validasi & bentuk array foto untuk insert listing_photos. */
function validasiFoto(foto) {
  if (foto == null) return [];
  if (!Array.isArray(foto)) {
    throw new Error("foto harus berupa array [{ fotoUrl, urutan? }]");
  }
  return foto.map((f, i) => {
    if (!f || typeof f !== "object") {
      throw new Error(`foto[${i}] harus berupa objek`);
    }
    const fotoUrl =
      (typeof f.fotoUrl === "string" && f.fotoUrl.trim() ? f.fotoUrl.trim() : "") ||
      (typeof f.foto_url === "string" && f.foto_url.trim() ? f.foto_url.trim() : "");
    if (!fotoUrl) {
      throw new Error(`foto[${i}].fotoUrl wajib diisi`);
    }
    const urutan = Number.isInteger(f.urutan) ? f.urutan : i + 1;
    return { foto_url: fotoUrl, urutan };
  });
}

/** Validasi body dan bentuk payload insert ke tabel listings. */
function bangunPayloadListing(body) {
  if (!body || typeof body !== "object") {
    throw new Error("Body request tidak valid");
  }

  const judul = typeof body.judul === "string" ? body.judul.trim() : "";
  if (!judul) {
    throw new Error("judul wajib diisi");
  }

  const kategoriCitra = validasiKategori(body.kategoriCitra);
  const kategoriDikoreksi =
    typeof body.kategoriDikoreksi === "boolean" ? body.kategoriDikoreksi : false;

  let confidenceScore = null;
  if (body.confidenceScore != null && body.confidenceScore !== "") {
    const c = paksaAngkaFinite(body.confidenceScore, "confidenceScore");
    if (c < 0 || c > 1) {
      throw new Error("confidenceScore harus antara 0 dan 1");
    }
    confidenceScore = c;
  }

  const jumlah = validasiJumlahPositif(body.jumlah, "jumlah");
  const satuan = validasiSatuan(body.satuan);
  const { lokasiLat, lokasiLng } = validasiKoordinat(body.lokasiLat, body.lokasiLng);
  const expiredAt = normalisasiExpiredAt(body.expiredAt);

  return {
    judul,
    kategori_citra: kategoriCitra,
    kategori_dikoreksi: kategoriDikoreksi,
    confidence_score: confidenceScore,
    deskripsi_teks: normalisasiDeskripsiTeks(body.deskripsiTeks),
    jumlah,
    satuan,
    lokasi_lat: lokasiLat,
    lokasi_lng: lokasiLng,
    expired_at: expiredAt,
  };
}

export async function POST(request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Belum login" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Body request tidak valid" }, { status: 400 });
  }

  // --- Validasi server -----------------------------------------------------
  let payload;
  let foto;
  try {
    payload = bangunPayloadListing(body);
    foto = validasiFoto(body.foto);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 400 });
  }

  // --- Insert listing (user_id dari SESSION, bukan body) -------------------
  const { data: listing, error: errListing } = await supabase
    .from("listings")
    .insert({ ...payload, user_id: user.id })
    .select("id, status")
    .single();

  if (errListing || !listing) {
    return Response.json(
      { error: errListing ? `Gagal membuat listing: ${errListing.message}` : "Gagal membuat listing" },
      { status: 400 }
    );
  }

  // --- Insert foto (opsional, cascade delete otomatis saat listing dihapus) --
  if (foto.length > 0) {
    const { error: errFoto } = await supabase
      .from("listing_photos")
      .insert(foto.map((f) => ({ ...f, listing_id: listing.id })));

    if (errFoto) {
      // Foto gagal disisipkan — listing sudah terlanjur dibuat. Laporkan
      // sebagai error tapi listing tetap valid (foto bisa ditambah kemudian).
      return Response.json(
        { error: `Listing dibuat tapi foto gagal disimpan: ${errFoto.message}` },
        { status: 400, headers: { "X-LoopLink-Listing-Id": listing.id } }
      );
    }
  }

  return Response.json({ listing_id: listing.id, status: listing.status }, { status: 201 });
}
