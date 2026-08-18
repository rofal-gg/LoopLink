import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ambilDataDashboard } from "@/lib/api/dashboard";
import AppHeader from "@/components/AppHeader";
import { ButtonLink } from "@/components/ui/Button";
import {
  formatAngka,
  formatWaktuRelatif,
  labelKategori,
} from "@/components/landing/format";
import {
  IconArrowRight,
  IconMapPin,
  IconPackage,
  IconRecycle,
  IconSearch,
  IconShield,
  IconUpload,
  IconUsers,
} from "@/components/icons";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Beranda",
};

/** Ringkasan status listing saya (tersedia/dipesan/selesai/dibatalkan). */
const STATUS_META = [
  { key: "tersedia", label: "Tersedia" },
  { key: "dipesan", label: "Dipesan" },
  { key: "selesai", label: "Selesai" },
  { key: "dibatalkan", label: "Dibatalkan" },
];

/** Gaya badge per status (listing & status_akhir klaim). */
const STATUS_BADGE = {
  tersedia: {
    label: "Tersedia",
    cls: "bg-loop-primary/10 text-loop-primary ring-loop-primary/20",
  },
  dipesan: {
    label: "Dipesan",
    cls: "bg-amber-100 text-amber-800 ring-amber-200",
  },
  selesai: {
    label: "Selesai",
    cls: "bg-loop-mist text-loop-ink ring-loop-line/20",
  },
  dibatalkan: {
    label: "Dibatalkan",
    cls: "bg-red-50 text-red-700 ring-red-200",
  },
};

/** Badge kecil status dengan warna konsisten di seluruh dashboard. */
function BadgeStatus({ status }) {
  const meta = STATUS_BADGE[status] ?? {
    label: status,
    cls: "bg-loop-mist text-loop-line ring-loop-line/20",
  };
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${meta.cls}`}
    >
      {meta.label}
    </span>
  );
}

/** Jumlah + satuan satu baris, mis. "5 kg". Kalau jumlah null, jujur kosong. */
function jumlahSatuan(jumlah, satuan) {
  if (jumlah == null) return satuan || "";
  return `${formatAngka(jumlah)}${satuan ? ` ${satuan}` : ""}`;
}

/** Header kartu section berulang: judul + subjudul + CTA opsional. */
function SectionHeader({ title, subtitle = null, href = null, cta = "Kelola" }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-lg font-semibold tracking-tight text-loop-ink">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-0.5 text-sm text-loop-line">{subtitle}</p>
        ) : null}
      </div>
      {href ? (
        <Link
          href={href}
          className="fr inline-flex shrink-0 items-center gap-1 rounded text-sm font-medium text-loop-primary transition hover:text-loop-primary-hover"
        >
          {cta}
          <IconArrowRight className="h-3.5 w-3.5" />
        </Link>
      ) : null}
    </div>
  );
}

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/home");
  }

  // Semua data (profil, listing, klaim) diambil lewat helper server
  // `lib/api/dashboard.js`. Tiap blok di dalamnya defensif — satu query
  // error tidak menggagalkan halaman.
  const dataDashboard = await ambilDataDashboard({ userId: user.id, supabase });
  const profile = dataDashboard.profile;
  const listingSaya = dataDashboard.listingSaya;
  const klaimSaya = dataDashboard.klaimSaya;
  const klaimMasuk = dataDashboard.klaimMasuk;

  const counts = {
    tersedia: listingSaya.tersedia,
    dipesan: listingSaya.dipesan,
    selesai: listingSaya.selesai,
    dibatalkan: listingSaya.dibatalkan,
  };
  const totalListing = listingSaya.total;

  const hasLocation =
    !!profile &&
    (profile.alamat_teks ||
      profile.lokasi_lat != null ||
      profile.lokasi_lng != null);

  const nama = profile?.nama_lengkap || user.email;

  const ringkasan = [
    {
      label: "Listing Tersedia",
      value: listingSaya.tersedia,
      icon: IconRecycle,
      tint: "bg-loop-primary/10 text-loop-primary",
    },
    {
      label: "Listing Dipesan",
      value: listingSaya.dipesan,
      icon: IconPackage,
      tint: "bg-amber-100 text-amber-700",
    },
    {
      label: "Klaim Saya",
      value: klaimSaya.length,
      icon: IconShield,
      tint: "bg-loop-mist text-loop-ink",
    },
    {
      label: "Klaim Masuk",
      value: klaimMasuk.length,
      icon: IconUsers,
      tint: "bg-loop-signal/10 text-loop-signal",
    },
  ];

  return (
    <div className="min-h-[100dvh] bg-loop-base">
      <AppHeader
        nama={profile?.nama_lengkap ?? null}
        email={user.email}
        currentPath="/home"
      />

      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        {/* Sapaan */}
        <section className="mb-7" aria-label="Sapaan">
          <p className="text-sm text-loop-line">Selamat datang kembali</p>
          <h1 className="mt-0.5 truncate text-2xl font-semibold tracking-tight text-loop-ink sm:text-3xl">
            Halo, {nama}
          </h1>
        </section>

        {/* Ringkasan angka */}
        <section aria-label="Ringkasan angka">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {ringkasan.map(({ label, value, icon: Icon, tint }) => (
              <div
                key={label}
                className="rounded-2xl border border-loop-mist bg-white p-5 shadow-sm"
              >
                <div
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${tint}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-4 font-mono text-3xl font-semibold tabular-nums tracking-tight text-loop-ink">
                  {value}
                </p>
                <p className="mt-1 text-sm font-medium text-loop-line">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Dua aksi utama: setara dan dominan */}
        <section className="mt-7" aria-label="Aksi utama">
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
                Punya limbah yang masih layak? Foto, biarkan AI mengenalinya,
                lalu tampilkan ke orang yang membutuhkan di sekitarmu.
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
                Jelajahi semua listing di sekitarmu, jarak jadi penanda. Klik
                detail untuk melihat bahan dan mengklaimnya.
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
              <ButtonLink
                href="/setup-lokasi"
                variant="primary"
                size="sm"
                className="shrink-0"
              >
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
              <ButtonLink
                href="/setup-lokasi"
                variant="ghost"
                size="sm"
                className="ml-auto shrink-0"
              >
                Ubah
              </ButtonLink>
            </div>
          )}
        </section>

        {/* Listing saya */}
        <section className="mt-7" aria-label="Listing saya">
          <div className="rounded-2xl border border-loop-mist bg-white p-6 shadow-sm sm:p-8">
            <SectionHeader
              title="Listing saya"
              subtitle={`${totalListing} listing di akunmu`}
              href="/listing-saya"
            />

            {totalListing > 0 ? (
              <>
                <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {STATUS_META.map(({ key, label }) => (
                    <div
                      key={key}
                      className="rounded-xl border border-loop-mist bg-loop-base px-3.5 py-3"
                    >
                      <dt className="text-xs text-loop-line">{label}</dt>
                      <dd className="mt-1 font-mono text-2xl font-semibold tabular-nums text-loop-ink">
                        {counts[key]}
                      </dd>
                    </div>
                  ))}
                </dl>

                <ul className="mt-5 space-y-2">
                  {listingSaya.terbaru.map((l) => (
                    <li key={l.id}>
                      <Link
                        href={`/listing/${l.id}?from=/home`}
                        className="fr group flex items-center gap-3 rounded-xl border border-loop-mist bg-white p-3.5 transition hover:border-loop-primary/50 hover:bg-loop-base"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-loop-ink group-hover:text-loop-primary-hover">
                            {l.judul || "Listing tanpa judul"}
                          </p>
                          <div className="mt-1.5 flex items-center gap-2">
                            <span className="rounded-full bg-loop-mist px-2 py-0.5 text-[11px] font-medium text-loop-ink">
                              {labelKategori(l.kategori_citra)}
                            </span>
                            <span className="font-mono text-[11px] tabular-nums text-loop-line">
                              {jumlahSatuan(l.jumlah, l.satuan)}
                            </span>
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <BadgeStatus status={l.status} />
                          <span className="font-mono text-[11px] text-loop-line">
                            {formatWaktuRelatif(l.created_at) || "baru saja"}
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <div className="mt-5 flex flex-col items-center rounded-xl border border-dashed border-loop-mist bg-loop-base px-5 py-8 text-center">
                <IconRecycle className="h-8 w-8 text-loop-line" />
                <p className="mt-3 max-w-[40ch] text-sm text-loop-line">
                  Belum ada listing di akunmu. Ayo mulai dari tombol Upload
                  Limbah.
                </p>
                <ButtonLink
                  href="/upload"
                  variant="primary"
                  size="sm"
                  className="mt-4"
                >
                  Mulai Upload
                </ButtonLink>
              </div>
            )}
          </div>
        </section>

        {/* Klaim masuk */}
        <section className="mt-7" aria-label="Klaim masuk">
          <div className="rounded-2xl border border-loop-mist bg-white p-6 shadow-sm sm:p-8">
            <SectionHeader
              title="Klaim masuk"
              subtitle="Listingmu sedang menunggu serah terima"
              href="/klaim-saya"
            />

            {klaimMasuk.length > 0 ? (
              <ul className="mt-5 space-y-2">
                {klaimMasuk.map((k) => (
                  <li
                    key={k.listing_id}
                    className="rounded-xl border border-loop-mist bg-amber-50/60 p-3.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-loop-ink">
                          {k.judul || "Listing tanpa judul"}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-loop-line">
                          <span className="font-semibold text-loop-ink">
                            {k.pengklaim_nama || "Anggota"}
                          </span>{" "}
                          mengklaim · {jumlahSatuan(k.jumlah, k.satuan)}
                        </p>
                      </div>
                      <BadgeStatus status="dipesan" />
                    </div>
                    <p className="mt-2 font-mono text-[11px] text-loop-line">
                      {formatWaktuRelatif(k.diklaim_pada) || "baru saja"}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-5 rounded-xl border border-dashed border-loop-mist bg-loop-base px-5 py-6 text-center">
                <p className="text-sm text-loop-line">Belum ada klaim masuk.</p>
              </div>
            )}
          </div>
        </section>

        {/* Klaim saya */}
        <section className="mt-7" aria-label="Klaim saya">
          <div className="rounded-2xl border border-loop-mist bg-white p-6 shadow-sm sm:p-8">
            <SectionHeader
              title="Klaim saya"
              subtitle="Riwayat klaim yang kamu ajukan"
            />

            {klaimSaya.length > 0 ? (
              <ul className="mt-5 space-y-2">
                {klaimSaya.map((k, i) => (
                  <li
                    key={`${k.listing_id}-${i}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-loop-mist bg-loop-base p-3.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-loop-ink">
                        {k.judul || "Listing tanpa judul"}
                      </p>
                      <p className="mt-0.5 font-mono text-[11px] text-loop-line">
                        {formatWaktuRelatif(k.diklaim_pada) || "baru saja"}
                      </p>
                    </div>
                    <BadgeStatus status={k.status_akhir} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-5 rounded-xl border border-dashed border-loop-mist bg-loop-base px-5 py-6 text-center">
                <p className="text-sm text-loop-line">
                  Belum ada klaim yang kamu ajukan.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}