import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";
import KlaimSaya from "@/components/manajemen/KlaimSaya";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Klaim Saya",
};

/**
 * Halaman "Klaim Saya" (Task 4.6.2).
 * Server Component: guard login + dua sumber klaim pengguna:
 *   1. Aktif & selesai: `listings` dengan `diklaim_oleh = user.id`
 *      (RLS migration 09 memperbolehkan pengklaim melihat listing ini).
 *   2. Dibatalkan: `riwayat_klaim` pengklaim + status_akhir='dibatalkan',
 *      dilengkapi judul/kategori/foto listing (query per-listing, aman karena
 *      FK riwayat_klaim ON DELETE CASCADE -> riwayat hilang kalau listing
 *      dihapus). `diselesaikan_pada` untuk yang selesai diambil dari
 *      riwayat_klaim status 'selesai'.
 */
export default async function KlaimSayaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/klaim-saya");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("nama_lengkap")
    .eq("id", user.id)
    .maybeSingle();

  const listingSelect =
    "id, judul, kategori_citra, jumlah, satuan, status, diklaim_pada, listing_photos(foto_url, urutan)";

  // 1) Listing yang sedang/riya diklaim user (status dipesan / selesai).
  const { data: klaimListings } = await supabase
    .from("listings")
    .select(listingSelect)
    .eq("diklaim_oleh", user.id)
    .order("diklaim_pada", { ascending: false });

  // 2) Riwayat selesai - untuk melengkapi tanggal selesai di listing status 'selesai'.
  const { data: riwayatSelesai } = await supabase
    .from("riwayat_klaim")
    .select("listing_id, diklaim_pada, diselesaikan_pada")
    .eq("pengklaim_id", user.id)
    .eq("status_akhir", "selesai");

  // 3) Riwayat dibatalkan - klaim yang sudah batal dari sisi mana pun.
  const { data: riwayatBatal } = await supabase
    .from("riwayat_klaim")
    .select("id, listing_id, status_akhir, diklaim_pada, diselesaikan_pada")
    .eq("pengklaim_id", user.id)
    .eq("status_akhir", "dibatalkan")
    .order("diselesaikan_pada", { ascending: false });

  const selesaiByListing = new Map(
    (riwayatSelesai ?? []).map((r) => [r.listing_id, r])
  );

  const items = [];

  for (const l of klaimListings ?? []) {
    if (l.status === "dipesan") {
      items.push({
        type: "aktif",
        id: l.id,
        judul: l.judul,
        kategori_citra: l.kategori_citra,
        jumlah: l.jumlah,
        satuan: l.satuan,
        status: l.status,
        foto: l.listing_photos ?? [],
        diklaim_pada: l.diklaim_pada,
        diselesaikan_pada: null,
      });
    } else if (l.status === "selesai") {
      const rm = selesaiByListing.get(l.id);
      items.push({
        type: "selesai",
        id: l.id,
        judul: l.judul,
        kategori_citra: l.kategori_citra,
        jumlah: l.jumlah,
        satuan: l.satuan,
        status: l.status,
        foto: l.listing_photos ?? [],
        diklaim_pada: l.diklaim_pada,
        diselesaikan_pada: rm?.diselesaikan_pada ?? null,
      });
    }
  }

  // Riwayat dibatalkan: ambil info listing per baris (pola GET listing detail).
  // Catatan RLS: setelah cancel_claim, listing kembali status 'tersedia' dan
  // tetap terlihat pengklaim. Namun seed demo menyimpan satu listing dengan
  // status langsung 'dibatalkan' -> di luar policy SELECT pengklaim, jadi
  // `listing` bisa null. Dalam kasus itu tampilkan kartu riwayat ringkas
  // (fallback listingHilang) supaya riwayat klaim tidak hilang senyap.
  for (const r of riwayatBatal ?? []) {
    const { data: listing } = await supabase
      .from("listings")
      .select(listingSelect)
      .eq("id", r.listing_id)
      .maybeSingle();
    if (!listing) {
      items.push({
        type: "dibatalkan",
        id: r.listing_id,
        judul: null,
        kategori_citra: null,
        jumlah: null,
        satuan: null,
        status: "dibatalkan",
        foto: [],
        listingHilang: true,
        diklaim_pada: r.diklaim_pada,
        diselesaikan_pada: r.diselesaikan_pada,
      });
      continue;
    }
    items.push({
      type: "dibatalkan",
      id: listing.id,
      judul: listing.judul,
      kategori_citra: listing.kategori_citra,
      jumlah: listing.jumlah,
      satuan: listing.satuan,
      status: listing.status,
      foto: listing.listing_photos ?? [],
      diklaim_pada: r.diklaim_pada,
      diselesaikan_pada: r.diselesaikan_pada,
    });
  }

  // Urutkan klaim terbaru dulu (berdasarkan waktu klaim).
  items.sort(
    (a, b) =>
      new Date(b.diklaim_pada ?? 0).getTime() -
      new Date(a.diklaim_pada ?? 0).getTime()
  );

  return (
    <div className="min-h-[100dvh] bg-loop-base">
      <AppHeader
        nama={profile?.nama_lengkap ?? null}
        email={user.email}
        currentPath="/klaim-saya"
      />
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        <KlaimSaya items={items} />
      </main>
    </div>
  );
}