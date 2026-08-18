"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Inputs";
import { IconMapPin, IconRecycle, IconSearch } from "@/components/icons";
import SearchForm from "./SearchForm";
import SkeletonHasil from "./SkeletonHasil";
import HasilKartu from "./HasilKartu";
import EmptyState from "./EmptyState";
import DrawerSortFilter from "./DrawerSortFilter";
import { ambilKatalog, cariBahan } from "./api";
import { KATEGORI_KATALOG } from "./constants";

const RADIUS_MAX = 100;
const RADIUS_DEFAULT = 30;

const SELECT_BASE =
  "w-full rounded-xl border border-loop-mist bg-loop-base px-3.5 py-2.5 text-sm text-loop-ink shadow-sm outline-none transition focus:border-loop-primary focus:ring-4 focus:ring-loop-primary/15";

/** Normalisasi pesan error fetch (network vs pesan API) untuk kedua mode. */
function pesanError(err) {
  if (err instanceof TypeError && err.message === "Failed to fetch") {
    return "Tidak dapat terhubung ke server. Periksa koneksimu lalu coba lagi.";
  }
  return err.message || "Terjadi kesalahan. Silakan coba lagi.";
}

/**
 * Flow Katalog & Cari Bahan (Fase 4.4 / 4.7).
 *
 * Dua mode, dua sumber data:
 *   - Katalog (default): GET /api/listings/katalog - SEMUA listing tersedia
 *     milik user lain, radius TIDAK memotong hasil (hanya penanda
 *     `di_luar_jangkauan`). Filter kategori + slider radius memicu fetch
 *     ulang dengan debounce 400 ms di client.
 *   - Skor: POST /api/listings/cari - hasil diurutkan skor kecocokan;
 *     listing di luar radius tetap tampil dengan badge.
 *
 * Bila profil tanpa koordinat: katalog tetap tampil (tanpa jarak) dengan
 * banner "Atur Lokasi"; mode skor dinonaktifkan (form butuh koordinat).
 */
export default function CariFlow({ profile = null }) {
  const adaLokasi =
    !!profile &&
    profile.lokasi_lat != null &&
    profile.lokasi_lng != null &&
    Number.isFinite(Number(profile.lokasi_lat)) &&
    Number.isFinite(Number(profile.lokasi_lng));

  // Mode tampilan: "katalog" (default) | "skor".
  const [mode, setMode] = useState("katalog");

  // State toolbar katalog.
  const [kategoriKatalog, setKategoriKatalog] = useState("");
  const [radiusKatalog, setRadiusKatalog] = useState(RADIUS_DEFAULT);

  // State form skor.
  const [kategori, setKategori] = useState("Bahan baku daur ulang kertas");
  const [radiusKm, setRadiusKm] = useState(RADIUS_DEFAULT);
  const [jumlah, setJumlah] = useState("40");

  // Hasil state (dipakai bersama kedua mode).
  const [status, setStatus] = useState("memuat"); // idle | memuat | siap | error
  const [hasil, setHasil] = useState([]);
  const [error, setError] = useState(null);
  const [paramsInfo, setParamsInfo] = useState(null);

  // Sort/filter
  const [sort, setSort] = useState("terbaru");
  const [filter, setFilter] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const formRef = useRef(null);
  const kategoriSelectRef = useRef(null);

  // Nilai terkini untuk dibaca di callback tanpa re-render.
  const formValuesRef = useRef({ kategori, radiusKm, jumlah });
  useEffect(() => {
    formValuesRef.current = { kategori, radiusKm, jumlah };
  }, [kategori, radiusKm, jumlah]);

  const katalogParamsRef = useRef({
    kategori: kategoriKatalog,
    radius: radiusKatalog,
  });
  useEffect(() => {
    katalogParamsRef.current = {
      kategori: kategoriKatalog,
      radius: radiusKatalog,
    };
  }, [kategoriKatalog, radiusKatalog]);

  const modeRef = useRef(mode);
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  const seqRef = useRef(0);
  const timerRef = useRef(null);

  // ── Katalog ───────────────────────────────────────────────────────────────
  const jalankanKatalog = useCallback(async () => {
    const { kategori: k, radius: r } = katalogParamsRef.current;
    const nomor = ++seqRef.current;
    setStatus("memuat");
    setError(null);
    try {
      const data = await ambilKatalog({
        kategori: k || undefined,
        radius: r,
      });
      if (nomor !== seqRef.current) return;
      setHasil(data.hasil ?? []);
      setParamsInfo({ kategori: k, radius: r });
      setStatus("siap");
    } catch (err) {
      if (nomor !== seqRef.current) return;
      setError(pesanError(err));
      setStatus("error");
    }
  }, []);

  // Muat katalog saat mount + debounce 400 ms saat filter katalog berubah.
  useEffect(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      if (modeRef.current === "katalog") jalankanKatalog();
    }, 400);
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [kategoriKatalog, radiusKatalog, jalankanKatalog]);

  // ── Skor (/cari) ──────────────────────────────────────────────────────────
  const jalankanSkor = useCallback(async () => {
    if (!adaLokasi) return;
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const nilai = formValuesRef.current;
    const kategoriNilai = (nilai.kategori || "").trim();
    const jumlahNilai = Number(nilai.jumlah);
    if (!kategoriNilai || !Number.isFinite(jumlahNilai) || jumlahNilai <= 0) {
      return;
    }

    const nomor = ++seqRef.current;
    setStatus("memuat");
    setError(null);
    try {
      const data = await cariBahan({
        kategoriKebutuhan: kategoriNilai,
        radiusKm: Number(nilai.radiusKm),
        lokasiLat: Number(profile.lokasi_lat),
        lokasiLng: Number(profile.lokasi_lng),
        jumlahDibutuhkan: jumlahNilai,
      });
      if (nomor !== seqRef.current) return;
      setHasil(data.hasil ?? []);
      setParamsInfo({
        kategori: kategoriNilai,
        radius: Number(nilai.radiusKm),
        jumlah: jumlahNilai,
      });
      setStatus("siap");
    } catch (err) {
      if (nomor !== seqRef.current) return;
      setError(pesanError(err));
      setStatus("error");
    }
  }, [adaLokasi, profile]);

  // ── Ganti mode ────────────────────────────────────────────────────────────
  function pilihMode(modeBaru) {
    if (modeBaru === mode) return;
    setMode(modeBaru);
    setFilter([]);

    if (modeBaru === "skor") {
      setSort("skor");
      if (adaLokasi) {
        jalankanSkor();
      } else {
        setHasil([]);
        setError(null);
        setStatus("idle");
      }
      return;
    }

    setSort("terbaru");
    // Selalu muat ulang katalog saat kembali ke tab ini: selain menyegarkan
    // data marketplace, mencegah hasil skor dari mode /cari bocor ke katalog.
    jalankanKatalog();
  }

  // ── Sort/filter client-side ───────────────────────────────────────────────
  const sortOptions = useMemo(() => {
    if (mode === "skor") {
      return [
        {
          nilai: "skor",
          label: "Paling cocok",
          desc: "Skor kecocokan tertinggi",
        },
        { nilai: "jarak", label: "Jarak terdekat", desc: "Dari lokasimu" },
        {
          nilai: "volume",
          label: "Volume terbesar",
          desc: "Jumlah paling banyak",
        },
      ];
    }
    const opsi = [
      { nilai: "terbaru", label: "Terbaru", desc: "Diupload paling baru" },
    ];
    if (adaLokasi) {
      opsi.push({ nilai: "jarak", label: "Jarak terdekat", desc: "Dari lokasimu" });
    }
    opsi.push({
      nilai: "volume",
      label: "Volume terbesar",
      desc: "Jumlah paling banyak",
    });
    return opsi;
  }, [mode, adaLokasi]);

  const hasilTerfilter = useMemo(() => {
    let arr = [...hasil];
    if (filter.length > 0) {
      arr = arr.filter((h) => filter.includes(h.kategori_citra));
    }
    if (sort === "terbaru") {
      arr.sort(
        (a, b) =>
          new Date(b.created_at || 0).getTime() -
          new Date(a.created_at || 0).getTime()
      );
    } else if (sort === "jarak") {
      arr.sort((a, b) => {
        const aj = a.jarak_km == null ? Infinity : Number(a.jarak_km);
        const bj = b.jarak_km == null ? Infinity : Number(b.jarak_km);
        return aj - bj;
      });
    } else if (sort === "volume") {
      arr.sort((a, b) => Number(b.jumlah || 0) - Number(a.jumlah || 0));
    } else if (sort === "skor") {
      arr.sort((a, b) => Number(b.skor_akhir || 0) - Number(a.skor_akhir || 0));
    }
    return arr;
  }, [hasil, sort, filter]);

  const dalamJangkauan = useMemo(
    () =>
      hasilTerfilter.filter(
        (h) => h.jarak_km != null && h.di_luar_jangkauan !== true
      ).length,
    [hasilTerfilter]
  );

  function resetSortFilter() {
    setSort(mode === "katalog" ? "terbaru" : "skor");
    setFilter([]);
  }

  function fokusKeForm() {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => kategoriSelectRef.current?.focus(), 350);
  }

  const tampilkanKatalog = mode === "katalog";
  const pctFill = Math.min(
    100,
    Math.max(0, ((Number(radiusKatalog) || 0) / RADIUS_MAX) * 100)
  );

  // ── Render area hasil (dipakai kedua mode) ───────────────────────────────
  function renderHasil() {
    if (status === "memuat") {
      return <SkeletonHasil jumlah={6} />;
    }
    if (status === "error") {
      return (
        <section className="mt-5" aria-label="Terjadi kesalahan">
          <Alert variant="error">{error}</Alert>
          <div className="mt-4 flex justify-center">
            <Button
              variant="secondary"
              onClick={tampilkanKatalog ? jalankanKatalog : jalankanSkor}
            >
              <IconSearch className="h-4 w-4" />
              Coba Lagi
            </Button>
          </div>
        </section>
      );
    }
    if (status === "idle") return null;
    if (status !== "siap") return null;

    if (hasil.length === 0) {
      return (
        <EmptyState
          mode={tampilkanKatalog ? "katalog" : "skor"}
          onLihatKatalog={() => pilihMode("katalog")}
          onUbahKategori={fokusKeForm}
        />
      );
    }

    return (
      <section className="mt-5" aria-label="Hasil">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-loop-line">
            {tampilkanKatalog ? (
              <>
                {hasilTerfilter.length === hasil.length
                  ? `${hasil.length} listing tersedia`
                  : `Menampilkan ${hasilTerfilter.length} dari ${hasil.length} listing`}
                {adaLokasi && hasil.length > 0
                  ? ` · ${dalamJangkauan} dalam jangkauan ${radiusKatalog} km`
                  : ""}
              </>
            ) : (
              <>
                {hasilTerfilter.length === hasil.length
                  ? `${hasil.length} hasil`
                  : `Menampilkan ${hasilTerfilter.length} dari ${hasil.length} hasil`}
                {" untuk "}
                <span className="font-medium text-loop-ink">
                  &ldquo;{paramsInfo?.kategori ?? kategori}&rdquo;
                </span>
                {hasil.length > 0
                  ? ` · ${dalamJangkauan} dalam jangkauan ${paramsInfo?.radius ?? radiusKm} km`
                  : ""}
              </>
            )}
          </p>

          {!tampilkanKatalog ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setDrawerOpen(true)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Urutkan &amp; Filter
            </Button>
          ) : null}
        </div>

        {hasilTerfilter.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-loop-mist bg-white px-5 py-8 text-center text-sm text-loop-line">
            Tidak ada hasil yang cocok dengan filter kategori saat ini. Coba
            hilangkan sebagian filter lewat tombol &ldquo;Urutkan &amp;
            Filter&rdquo;.
          </div>
        ) : (
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {hasilTerfilter.map((item) => (
              <HasilKartu key={item.listing_id} item={item} />
            ))}
          </div>
        )}
      </section>
    );
  }

  return (
    <div>
      {/* Header halaman */}
      <header className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-loop-ink sm:text-3xl">
          Katalog Bahan
        </h1>
        <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-loop-line">
          Semua listing tersedia milik pengguna lain tampil di sini. Jarak dan
          radius jangkauan hanya penanda, tidak memotong hasil.
        </p>
      </header>

      {/* Pilih mode */}
      <div
        role="tablist"
        aria-label="Jenis pencarian bahan"
        className="inline-flex rounded-full border border-loop-mist bg-white p-1 shadow-sm"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tampilkanKatalog}
          onClick={() => pilihMode("katalog")}
          className={`fr inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition active:scale-[0.98] ${
            tampilkanKatalog
              ? "bg-loop-ink text-loop-base shadow-sm"
              : "text-loop-line hover:text-loop-ink"
          }`}
        >
          <IconRecycle className="h-4 w-4" />
          Katalog
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={!tampilkanKatalog}
          onClick={() => pilihMode("skor")}
          className={`fr inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition active:scale-[0.98] ${
            !tampilkanKatalog
              ? "bg-loop-ink text-loop-base shadow-sm"
              : "text-loop-line hover:text-loop-ink"
          }`}
        >
          <IconSearch className="h-4 w-4" />
          Cari Bahan Cocok
        </button>
      </div>

      {tampilkanKatalog ? (
        <>
          {/* Toolbar filter katalog */}
          <section className="mt-5" aria-label="Filter katalog">
            <div className="rounded-2xl border border-loop-mist bg-white p-4 shadow-sm sm:p-5">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end">
                {/* Kategori */}
                <div>
                  <label
                    htmlFor="kategori-katalog"
                    className="mb-1.5 block text-sm font-semibold text-loop-ink"
                  >
                    Kategori
                  </label>
                  <select
                    id="kategori-katalog"
                    value={kategoriKatalog}
                    onChange={(e) => setKategoriKatalog(e.target.value)}
                    className={`${SELECT_BASE} fr`}
                  >
                    <option value="">Semua kategori</option>
                    {KATEGORI_KATALOG.map((k) => (
                      <option key={k.nilai} value={k.nilai}>
                        {k.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Radius penanda */}
                <div>
                  <div className="flex items-baseline justify-between gap-3">
                    <label
                      htmlFor="radius-katalog"
                      className="block text-sm font-semibold text-loop-ink"
                    >
                      Radius jangkauan
                    </label>
                    <span className="font-mono text-sm font-semibold tabular-nums text-loop-primary">
                      {radiusKatalog} km
                    </span>
                  </div>
                  <input
                    id="radius-katalog"
                    type="range"
                    min="1"
                    max={RADIUS_MAX}
                    step="1"
                    value={radiusKatalog}
                    onChange={(e) => setRadiusKatalog(Number(e.target.value))}
                    aria-label="Radius jangkauan dalam kilometer, tidak memotong hasil"
                    className="range-loop mt-3"
                    style={{ "--fill": `${pctFill}%` }}
                  />
                  <div className="mt-1.5 flex justify-between font-mono text-[11px] text-loop-line">
                    <span>1 km</span>
                    <span>{RADIUS_MAX} km</span>
                  </div>
                </div>

                <div className="lg:pb-1">
                  <Button
                    variant="secondary"
                    onClick={() => setDrawerOpen(true)}
                    className="w-full lg:w-auto"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Urutkan &amp; Filter
                  </Button>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-loop-line">
                Radius hanya penanda jangkauan: listing yang lebih jauh tetap
                tampil dan diberi label &ldquo;Di luar jangkauan&rdquo;.
              </p>
            </div>
          </section>

          {/* Banner lokasi belum diatur - katalog tetap tampil */}
          {!adaLokasi ? (
            <section className="mt-5" aria-label="Lokasi belum diatur">
              <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <IconMapPin className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                  <p className="text-sm leading-relaxed text-amber-900">
                    Kamu belum menyimpan lokasi. Semua listing tetap tampil,
                    tapi jarak dan penanda jangkauan tidak bisa dihitung.
                  </p>
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
            </section>
          ) : null}

          {renderHasil()}
        </>
      ) : (
        <>
          {/* Form mode skor */}
          <div ref={formRef} className="mt-5 scroll-mt-24">
            <SearchForm
              adaLokasi={adaLokasi}
              radiusKm={radiusKm}
              onRadiusChange={setRadiusKm}
              jumlah={jumlah}
              onJumlahChange={setJumlah}
              kategori={kategori}
              onKategoriChange={setKategori}
              searching={status === "memuat"}
              onCari={jalankanSkor}
              selectKategoriRef={kategoriSelectRef}
            />
          </div>

          {renderHasil()}
        </>
      )}

      <DrawerSortFilter
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sort={sort}
        onSortChange={setSort}
        sortOptions={sortOptions}
        filter={filter}
        onFilterChange={setFilter}
        onReset={resetSortFilter}
      />
    </div>
  );
}