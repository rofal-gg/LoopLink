// app/api/listings/cari/route.js
//
// POST /api/listings/cari — butuh login (pencari)
// Cari listing tersedia yang cocok dengan kebutuhan pencari, urutkan
// berdasarkan skor kecocokan (rule-based, Tahap 3 bagian B), lalu simpan
// hasilnya ke `riwayat_pencarian` + `riwayat_pencarian_hasil`.
//
// Body JSON:
//   {
//     kategoriKebutuhan: string,   // mis. "Bahan baku daur ulang kertas"
//     radiusKm: number,            // > 0, wajib
//     lokasiLat: number,           // -90..90
//     lokasiLng: number,           // -180..180
//     jumlahDibutuhkan: number     // > 0
//   }
//
// Response 200: { hasil: [{ listing_id, judul, kategori_citra, jarak_km,
//                           skor_akhir, foto_url, jumlah, satuan,
//                           di_luar_jangkauan }] }
//
// Alur:
//   1. Ambil tabel `kategori_kecocokan` (public read).
//   2. Ambil kandidat: listings status='tersedia' DAN user_id != user.id
//      (filter listing sendiri secara manual).
//   3. Hitung jarak Haversine; hitung skor akhir; SKIP kalau 0.
//      Radius TIDAK memotong kandidat — hanya penanda `di_luar_jangkauan`
//      di tiap hasil. Kandidat di luar radius tetap ikut dihitung skornya
//      (kontribusi skor_jarak jadi 0, tapi kategori & volume tetap memberi
//      bobot), konsisten dengan keputusan katalog marketplace.
//   4. Urutkan skor_akhir DESC, batasi 50 hasil.
//   5. Simpan riwayat memakai service-role client (tabel ini tidak punya
//      policy INSERT untuk authenticated). Kegagalan menyimpan riwayat
//      TIDAK menggagalkan pencarian — cukup peringatan.

import { hitungJarakKm, hitungSkorKecocokan } from "@/lib/ai/matching";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { validasiJumlahPositif, validasiKoordinat } from "@/lib/api/validasi-listing";

const MAKS_HASIL = 50;

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

  // --- Validasi input -------------------------------------------------------
  const kategoriKebutuhan =
    typeof body.kategoriKebutuhan === "string" ? body.kategoriKebutuhan.trim() : "";
  if (!kategoriKebutuhan) {
    return Response.json({ error: "kategoriKebutuhan wajib diisi" }, { status: 400 });
  }

  let radiusKm;
  let jumlahDibutuhkan;
  let lokasiLat;
  let lokasiLng;
  try {
    radiusKm = validasiJumlahPositif(body.radiusKm, "radiusKm");
    jumlahDibutuhkan = validasiJumlahPositif(body.jumlahDibutuhkan, "jumlahDibutuhkan");
    ({ lokasiLat, lokasiLng } = validasiKoordinat(body.lokasiLat, body.lokasiLng));
  } catch (err) {
    return Response.json({ error: err.message }, { status: 400 });
  }

  // --- 1. Tabel kecocokan (public read) -------------------------------------
  const { data: tabelKecocokan, error: errTabel } = await supabase
    .from("kategori_kecocokan")
    .select("kategori_limbah, kategori_kebutuhan, skor_dasar");

  if (errTabel) {
    return Response.json({ error: `Gagal memuat aturan kecocokan: ${errTabel.message}` }, { status: 500 });
  }

  // --- 2. Kandidat listing tersedia (bukan milik pencari) -------------------
  // RLS SELECT memperlihatkan listing sendiri juga, jadi filter manual.
  const { data: kandidat, error: errKandidat } = await supabase
    .from("listings")
    .select(
      "id, judul, kategori_citra, jumlah, satuan, lokasi_lat, lokasi_lng, listing_photos(id, foto_url, urutan)"
    )
    .eq("status", "tersedia")
    .neq("user_id", user.id);

  if (errKandidat) {
    return Response.json({ error: `Gagal memuat listing: ${errKandidat.message}` }, { status: 500 });
  }

  // --- 3. Hitung jarak + skor per kandidat ----------------------------------
  const hasil = [];
  for (const l of kandidat ?? []) {
    let jarakKm;
    try {
      jarakKm = hitungJarakKm(lokasiLat, lokasiLng, l.lokasi_lat, l.lokasi_lng);
    } catch {
      // Koordinat listing invalid → lewati (defensif).
      continue;
    }

    // Radius TIDAK memotong kandidat — hanya penanda di_luar_jangkauan di
    // hasil. Kandidat di luar radius tetap dihitung skornya (skor_jarak
    // jadi 0, kategori & volume tetap memberi bobot).
    const diLuarJangkauan = jarakKm > radiusKm;

    const skorAkhir = hitungSkorKecocokan({
      kategoriListing: l.kategori_citra,
      kategoriDicari: kategoriKebutuhan,
      jarakKm,
      radiusKm,
      jumlahTersedia: l.jumlah,
      jumlahDibutuhkan,
      tabelKecocokan: tabelKecocokan ?? [],
    });

    if (skorAkhir === 0) continue;

    // Foto pertama (urutan terkecil) — kalau ada.
    const fotoTerurut = (l.listing_photos ?? []).sort((a, b) => a.urutan - b.urutan);
    const fotoUrl = fotoTerurut.length > 0 ? fotoTerurut[0].foto_url : null;

    hasil.push({
      listing_id: l.id,
      judul: l.judul,
      kategori_citra: l.kategori_citra,
      jarak_km: Math.round(jarakKm * 10) / 10,
      skor_akhir: Math.round(skorAkhir * 100) / 100,
      foto_url: fotoUrl,
      jumlah: l.jumlah,
      satuan: l.satuan,
      di_luar_jangkauan: diLuarJangkauan,
    });
  }

  // --- 4. Urutkan DESC + batasi ---------------------------------------------
  hasil.sort((a, b) => b.skor_akhir - a.skor_akhir);
  const hasilTerbatas = hasil.slice(0, MAKS_HASIL);

  // --- 5. Simpan riwayat (service role) — jangan sampai menggagalkan ---------
  await simpanRiwayatPencarian({
    pencariId: user.id,
    kategoriKebutuhan,
    radiusKm,
    lokasiLat,
    lokasiLng,
    hasil: hasilTerbatas,
  });

  return Response.json({ hasil: hasilTerbatas });
}

/**
 * Simpan hasil pencarian ke riwayat_pencarian + riwayat_pencarian_hasil
 * memakai service-role client (tabel tidak punya policy INSERT untuk
 * authenticated). Seluruh kegagalan di sini TIDAK menggagalkan respons
 * pencarian — hanya dicatat sebagai peringatan di console.
 */
async function simpanRiwayatPencarian({ pencariId, kategoriKebutuhan, radiusKm, lokasiLat, lokasiLng, hasil }) {
  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    console.warn("[cari] admin client tidak tersedia, riwayat dilewati:", err.message);
    return;
  }

  try {
    const { data: riwayat, error: errRp } = await admin
      .from("riwayat_pencarian")
      .insert({
        pencari_id: pencariId,
        kategori_dicari: kategoriKebutuhan,
        radius_km: radiusKm,
        lokasi_lat: lokasiLat,
        lokasi_lng: lokasiLng,
      })
      .select("id")
      .single();

    if (errRp) {
      console.warn("[cari] gagal simpan riwayat_pencarian:", errRp.message);
      return;
    }

    if (hasil.length > 0) {
      const { error: errHasil } = await admin.from("riwayat_pencarian_hasil").insert(
        hasil.map((h, i) => ({
          riwayat_pencarian_id: riwayat.id,
          listing_id: h.listing_id,
          skor_akhir: h.skor_akhir,
          posisi_urutan: i + 1,
        }))
      );
      if (errHasil) {
        console.warn("[cari] gagal simpan riwayat_pencarian_hasil:", errHasil.message);
      }
    }
  } catch (err) {
    console.warn("[cari] riwayat pencarian dilewati:", err.message);
  }
}
