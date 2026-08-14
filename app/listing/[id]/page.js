import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";
import DetailListing from "@/components/listing/DetailListing";
import { IconArrowLeft, IconSearch } from "@/components/icons";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Detail Listing",
};

/**
 * Halaman detail listing (Task 4.5).
 *
 * Data diambil LANGSUNG lewat query Supabase server (bukan fetch API),
 * pola sama dengan GET /api/listings/[id] di app/api/listings/[id]/route.js:
 *   listings -> listing_photos (order urutan) -> profiles pemilik.
 *
 * Kalau listing tidak terlihat (RLS: bukan milik sendiri / bukan pengklaim /
 * bukan status tersedia) query mengembalikan null -> tampilkan halaman
 * "Listing tidak ditemukan" yang rapi, bukan throw.
 */
export default async function DetailListingPage({ params, searchParams }) {
  const { id } = await params;
  const sp = await searchParams;
  const jarak =
    typeof sp?.jarak === "string" && Number.isFinite(Number(sp.jarak))
      ? Number(sp.jarak)
      : null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/listing/${encodeURIComponent(id)}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("nama_lengkap")
    .eq("id", user.id)
    .maybeSingle();

  const { data: listing, error: errListing } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  let foto = [];
  let pemilik = null;
  let namaPengklaim = null;

  if (listing) {
    const { data: fotoRows } = await supabase
      .from("listing_photos")
      .select("foto_url, urutan")
      .eq("listing_id", id)
      .order("urutan", { ascending: true });
    foto = fotoRows ?? [];

    const { data: profilPemilik } = await supabase
      .from("profiles")
      .select("nama_lengkap, no_telepon, alamat_teks")
      .eq("id", listing.user_id)
      .maybeSingle();
    pemilik = profilPemilik ?? null;

    // Nama pengklaim dipakai untuk label modal batalkan dari sisi pemilik.
    if (listing.diklaim_oleh) {
      const { data: profilPengklaim } = await supabase
        .from("profiles")
        .select("nama_lengkap")
        .eq("id", listing.diklaim_oleh)
        .maybeSingle();
      namaPengklaim = profilPengklaim?.nama_lengkap ?? null;
    }
  }

  return (
    <div className="min-h-[100dvh] bg-loop-base">
      <AppHeader
        nama={profile?.nama_lengkap ?? null}
        email={user.email}
        currentPath="/cari"
      />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        {!listing ? (
          errListing ? (
            <div className="mx-auto max-w-xl rounded-2xl border border-loop-mist bg-white p-6 text-center shadow-sm sm:p-10">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-700">
                <IconSearch className="h-7 w-7" />
              </div>
              <h1 className="mt-5 font-display text-xl font-semibold tracking-tight text-loop-ink">
                Terjadi kesalahan
              </h1>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-loop-line">
                Gagal memuat listing ini. Silakan coba lagi nanti.
              </p>
              <div className="mt-6 flex flex-col items-center justify-center gap-2 sm:flex-row">
                <Link
                  href="/cari"
                  className="fr inline-flex items-center gap-2 rounded-full bg-loop-primary px-5 py-2.5 text-sm font-semibold text-loop-base shadow-[0_3px_12px_rgba(60,122,92,0.4)] transition hover:bg-loop-primary-hover"
                >
                  <IconArrowLeft className="h-4 w-4" />
                  Kembali ke Cari Bahan
                </Link>
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-xl rounded-2xl border border-loop-mist bg-white p-6 text-center shadow-sm sm:p-10">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-loop-mist text-loop-line">
                <IconSearch className="h-7 w-7" />
              </div>
              <h1 className="mt-5 font-display text-xl font-semibold tracking-tight text-loop-ink">
                Listing tidak ditemukan
              </h1>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-loop-line">
                Listing ini tidak ada, sudah dihapus, atau tidak terlihat oleh
                akunmu. Coba cari bahan lain dari halaman Cari Bahan.
              </p>
              <div className="mt-6 flex flex-col items-center justify-center gap-2 sm:flex-row">
                <Link
                  href="/cari"
                  className="fr inline-flex items-center gap-2 rounded-full bg-loop-primary px-5 py-2.5 text-sm font-semibold text-loop-base shadow-[0_3px_12px_rgba(60,122,92,0.4)] transition hover:bg-loop-primary-hover"
                >
                  <IconArrowLeft className="h-4 w-4" />
                  Kembali ke Cari Bahan
                </Link>
              </div>
            </div>
          )
        ) : (
          <DetailListing
            listing={listing}
            foto={foto}
            pemilik={pemilik}
            namaPengklaim={namaPengklaim}
            userId={user.id}
            jarak={jarak}
          />
        )}
      </main>
    </div>
  );
}