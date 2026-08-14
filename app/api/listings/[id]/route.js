// app/api/listings/[id]/route.js
//
// GET    /api/listings/[id]  — publik (RLS membatasi visibilitas)
// PATCH  /api/listings/[id]  — butuh login + pemilik (hanya field non-status)
// DELETE /api/listings/[id]  — butuh login + pemilik + status 'tersedia'
//
// GET:          { ...listing, foto: [{foto_url, urutan}], pemilik: {...} | null }
// PATCH:        { success: true, listing: {...} }
// DELETE:       { success: true }
//
// PENTING: perubahan status/klaim TIDAK boleh lewat PATCH — kolom
// status/diklaim_oleh/diklaim_pada/dibatalkan_oleh sudah di-REVOKE dari
// client (migration 04) dan WAJIB lewat RPC klaim/selesai/batal.

import { createClient } from "@/lib/supabase/server";
import {
  FIELD_IDENTITAS_LISTINGS,
  FIELD_PATCH_LISTINGS,
  FIELD_STATUS_LISTINGS,
  normalisasiDeskripsiTeks,
  paksaAngkaFinite,
  validasiJumlahPositif,
  validasiKategori,
  validasiKoordinatTunggal,
  validasiSatuan,
} from "@/lib/api/validasi-listing";

// ---------------------------------------------------------------------------
// GET — detail listing + foto + kontak pemilik (kalau user login)
// ---------------------------------------------------------------------------
export async function GET(request, { params }) {
  const supabase = await createClient();
  const { id } = await params;

  const { data: listing, error: errListing } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (errListing) {
    return Response.json({ error: `Gagal mengambil listing: ${errListing.message}` }, { status: 500 });
  }
  if (!listing) {
    return Response.json({ error: "Listing tidak ditemukan" }, { status: 404 });
  }

  const { data: foto } = await supabase
    .from("listing_photos")
    .select("foto_url, urutan")
    .eq("listing_id", id)
    .order("urutan", { ascending: true });

  // Kontak pemilik hanya untuk user login (profiles SELECT = authenticated).
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let pemilik = null;
  if (user) {
    const { data: profil } = await supabase
      .from("profiles")
      .select("nama_lengkap, no_telepon, alamat_teks")
      .eq("id", listing.user_id)
      .maybeSingle();
    pemilik = profil ?? null;
  }

  return Response.json({
    ...listing,
    foto: foto ?? [],
    pemilik,
  });
}

// ---------------------------------------------------------------------------
// PATCH — edit listing (whitelist field non-status), butuh login + pemilik
// ---------------------------------------------------------------------------
export async function PATCH(request, { params }) {
  const supabase = await createClient();
  const { id } = await params;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Belum login" }, { status: 401 });
  }

  // Ambil listing dulu untuk cek kepemilikan (RLS SELECT memperlihatkan
  // listing milik sendiri apa pun statusnya).
  const { data: existing, error: errExisting } = await supabase
    .from("listings")
    .select("id, user_id")
    .eq("id", id)
    .maybeSingle();

  if (errExisting) {
    return Response.json({ error: `Gagal mengambil listing: ${errExisting.message}` }, { status: 500 });
  }
  if (!existing) {
    return Response.json({ error: "Listing tidak ditemukan" }, { status: 404 });
  }
  if (existing.user_id !== user.id) {
    return Response.json({ error: "Anda bukan pemilik listing ini" }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Body request tidak valid" }, { status: 400 });
  }

  // Cek field status/transaksi yang dilarang diubah via PATCH.
  for (const kunci of [...FIELD_STATUS_LISTINGS, ...FIELD_IDENTITAS_LISTINGS]) {
    if (Object.prototype.hasOwnProperty.call(body, kunci)) {
      return Response.json(
        { error: "Perubahan status harus lewat endpoint klaim/selesai/batal" },
        { status: 400 }
      );
    }
  }

  // Bangun payload hanya dari whitelist field yang dikirim.
  const payload = {};
  try {
    for (const kunci of FIELD_PATCH_LISTINGS) {
      if (!Object.prototype.hasOwnProperty.call(body, kunci)) continue;
      const nilai = body[kunci];

      switch (kunci) {
        case "judul": {
          const judul = typeof nilai === "string" ? nilai.trim() : "";
          if (!judul) throw new Error("judul wajib diisi");
          payload.judul = judul;
          break;
        }
        case "kategori_citra":
          payload.kategori_citra = validasiKategori(nilai);
          break;
        case "kategori_dikoreksi":
          if (typeof nilai !== "boolean") throw new Error("kategori_dikoreksi harus boolean");
          payload.kategori_dikoreksi = nilai;
          break;
        case "confidence_score": {
          if (nilai == null || nilai === "") {
            payload.confidence_score = null;
          } else {
            const c = paksaAngkaFinite(nilai, "confidence_score");
            if (c < 0 || c > 1) throw new Error("confidence_score harus antara 0 dan 1");
            payload.confidence_score = c;
          }
          break;
        }
        case "deskripsi_teks":
          payload.deskripsi_teks = normalisasiDeskripsiTeks(nilai);
          break;
        case "jumlah":
          payload.jumlah = validasiJumlahPositif(nilai, "jumlah");
          break;
        case "satuan":
          payload.satuan = validasiSatuan(nilai);
          break;
        case "lokasi_lat":
          payload.lokasi_lat = validasiKoordinatTunggal(nilai, "lokasi_lat", -90, 90);
          break;
        case "lokasi_lng":
          payload.lokasi_lng = validasiKoordinatTunggal(nilai, "lokasi_lng", -180, 180);
          break;
        default:
          break;
      }
    }
  } catch (err) {
    return Response.json({ error: err.message }, { status: 400 });
  }

  if (Object.keys(payload).length === 0) {
    return Response.json(
      { error: `Tidak ada field yang bisa diubah (whitelist: ${FIELD_PATCH_LISTINGS.join(", ")})` },
      { status: 400 }
    );
  }

  const { data: updated, error: errUpdate } = await supabase
    .from("listings")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (errUpdate) {
    return Response.json({ error: `Gagal mengubah listing: ${errUpdate.message}` }, { status: 400 });
  }

  return Response.json({ success: true, listing: updated });
}

// ---------------------------------------------------------------------------
// DELETE — hapus listing, hanya pemilik + status 'tersedia'
// listing_photos terhapus otomatis via ON DELETE CASCADE.
// ---------------------------------------------------------------------------
export async function DELETE(request, { params }) {
  const supabase = await createClient();
  const { id } = await params;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Belum login" }, { status: 401 });
  }

  const { data: existing, error: errExisting } = await supabase
    .from("listings")
    .select("id, user_id, status")
    .eq("id", id)
    .maybeSingle();

  if (errExisting) {
    return Response.json({ error: `Gagal mengambil listing: ${errExisting.message}` }, { status: 500 });
  }
  if (!existing) {
    return Response.json({ error: "Listing tidak ditemukan" }, { status: 404 });
  }
  if (existing.user_id !== user.id) {
    return Response.json({ error: "Anda bukan pemilik listing ini" }, { status: 403 });
  }
  if (existing.status !== "tersedia") {
    return Response.json(
      { error: "Listing hanya bisa dihapus saat status tersedia" },
      { status: 400 }
    );
  }

  // RLS `listing_delete_owner_if_available` juga membatasi; sudah dicek manual
  // di atas supaya pesan errornya jelas.
  const { error: errDelete } = await supabase.from("listings").delete().eq("id", id);

  if (errDelete) {
    return Response.json({ error: `Gagal menghapus listing: ${errDelete.message}` }, { status: 400 });
  }

  return Response.json({ success: true });
}
