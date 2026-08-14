import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";
import { ButtonLink } from "@/components/ui/Button";
import {
  IconArrowRight,
  IconMapPin,
  IconSearch,
  IconUpload,
} from "@/components/icons";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Beranda",
};

const STATUS_META = [
  { key: "tersedia", label: "Tersedia" },
  { key: "dipesan", label: "Dipesan" },
  { key: "selesai", label: "Selesai" },
  { key: "dibatalkan", label: "Dibatalkan" },
];

function emptyCounts() {
  return { tersedia: 0, dipesan: 0, selesai: 0, dibatalkan: 0 };
}

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/home");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("nama_lengkap, alamat_teks, lokasi_lat, lokasi_lng")
    .eq("id", user.id)
    .maybeSingle();

  // RLS: query dibatasi user_id sendiri -> hanya listing milik user.
  const { data: listingRows } = await supabase
    .from("listings")
    .select("status")
    .eq("user_id", user.id);

  const counts = emptyCounts();
  for (const row of listingRows ?? []) {
    if (row.status in counts) counts[row.status] += 1;
  }
  const totalListing = listingRows?.length ?? 0;

  const hasLocation =
    !!profile &&
    (profile.alamat_teks || profile.lokasi_lat != null || profile.lokasi_lng != null);

  const nama = profile?.nama_lengkap || user.email;

  return (
    <div className="min-h-[100dvh] bg-loop-base">
      <AppHeader nama={profile?.nama_lengkap ?? null} email={user.email} currentPath="/home" />

      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        {/* Sapaan */}
        <section className="mb-7" aria-label="Sapaan">
          <p className="text-sm text-loop-line">
            Selamat datang kembali
          </p>
          <h1 className="mt-0.5 truncate text-2xl font-semibold tracking-tight text-loop-ink sm:text-3xl">
            Halo, {nama}
          </h1>
        </section>

        {/* Dua aksi utama: setara dan dominan */}
        <section aria-label="Aksi utama">
          <div className="grid gap-4 md:grid-cols-2">
            <Link
              href="/upload"
              className="fr group rounded-2xl border border-loop-mist bg-white p-6 transition hover:-translate-y-0.5 hover:border-loop-primary/60 hover:shadow-md sm:p-8"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-loop-primary text-white">
                <IconUpload className="h-7 w-7" />
              </div>
              <h2 className="mt-5 text-lg font-semibold text-loop-ink sm:text-xl">
                Upload Limbah
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-loop-line">
                Punya limbah yang layak buang? Foto, biarkan AI mengenalinya,
                lalu tampilkan ke orang yang membutuhkannya.
              </p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-loop-primary">
                Mulai Upload
                <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>

            <Link
              href="/cari"
              className="fr group rounded-2xl border border-loop-mist bg-white p-6 transition hover:-translate-y-0.5 hover:border-loop-primary/60 hover:shadow-md sm:p-8"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-loop-ink text-loop-base">
                <IconSearch className="h-7 w-7" />
              </div>
              <h2 className="mt-5 text-lg font-semibold text-loop-ink sm:text-xl">
                Cari Bahan
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-loop-line">
                Cari kardus, plastik, sisa pangan, atau logam murah di
                sekitarmu untuk kebutuhan rumah, toko, atau usaha.
              </p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-loop-primary">
                Mulai Cari
                <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </div>
        </section>

        {/* Status lokasi */}
        <section className="mt-7" aria-label="Status lokasi">
          {!hasLocation ? (
            <div className="flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <IconMapPin className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                <div>
                  <p className="text-sm font-medium text-amber-900">
                    Lokasi belum disimpan
                  </p>
                  <p className="mt-0.5 text-sm text-amber-800/80">
                    Tambahkan lokasi supaya orang di dekatmu bisa menemukan
                    limbah dan bahannya.
                  </p>
                </div>
              </div>
              <ButtonLink href="/setup-lokasi" variant="primary" size="sm" className="shrink-0">
                Atur Lokasi
              </ButtonLink>
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-2xl border border-loop-primary/40 bg-loop-primary/10 p-5">
              <IconMapPin className="mt-0.5 h-5 w-5 shrink-0 text-loop-primary" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-loop-ink">
                  Lokasi tersimpan
                </p>
                <p className="mt-0.5 truncate text-sm text-loop-line">
                  {profile?.alamat_teks ||
                    (profile?.lokasi_lat != null
                      ? "Koordinat GPS"
                      : "Lokasi wilayah didaftarkan")}
                </p>
              </div>
              <ButtonLink href="/setup-lokasi" variant="ghost" size="sm" className="ml-auto shrink-0">
                Ubah
              </ButtonLink>
            </div>
          )}
        </section>

        {/* Ringkasan listing saya */}
        <section className="mt-7" aria-label="Ringkasan listing saya">
          <div className="rounded-2xl border border-loop-mist bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold tracking-tight text-loop-ink">
                Listing saya
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-sm text-loop-line">
                  {totalListing} total
                </span>
                <Link
                  href="/listing-saya"
                  className="fr inline-flex items-center gap-1 rounded text-sm font-medium text-loop-primary transition hover:text-loop-primary-hover"
                >
                  Kelola
                  <IconArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {totalListing > 0 ? (
              <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {STATUS_META.map(({ key, label }) => (
                  <div
                    key={key}
                    className="rounded-xl border border-loop-mist bg-loop-base px-4 py-3"
                  >
                    <dt className="text-xs text-loop-line">
                      {label}
                    </dt>
                    <dd className="mt-1 text-2xl font-semibold tabular-nums text-loop-ink">
                      {counts[key]}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              <div className="mt-5 rounded-xl border border-dashed border-loop-mist bg-loop-base px-5 py-6 text-center">
                <p className="text-sm text-loop-line">
                  Belum ada listing di akunmu. Ayo mulai dari tombol Upload
                  Limbah di atas.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}