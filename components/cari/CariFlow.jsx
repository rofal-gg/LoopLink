"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Inputs";
import { IconMapPin, IconSearch } from "@/components/icons";
import SearchForm from "./SearchForm";
import SkeletonHasil from "./SkeletonHasil";
import HasilKartu from "./HasilKartu";
import EmptyState from "./EmptyState";
import DrawerSortFilter from "./DrawerSortFilter";
import { cariBahan } from "./api";

const RADIUS_MAX = 100;

/**
 * Flow Cari Bahan (Task 4.4).
 * - Auto-cari saat pertama render kalau lokasi profil tersedia.
 * - Slider radius memicu pencarian ulang dengan debounce 400 ms; kategori
 *   & jumlah baru dicari saat tombol "Cari" ditekan.
 * - Sort/filter dikerjakan client-side lewat drawer.
 */
export default function CariFlow({ profile = null }) {
  const adaLokasi =
    !!profile &&
    profile.lokasi_lat != null &&
    profile.lokasi_lng != null &&
    Number.isFinite(Number(profile.lokasi_lat)) &&
    Number.isFinite(Number(profile.lokasi_lng));

  // Form state
  const [kategori, setKategori] = useState("Bahan baku daur ulang kertas");
  const [radiusKm, setRadiusKm] = useState(30);
  const [jumlah, setJumlah] = useState("40");

  // Hasil state
  const [status, setStatus] = useState("idle"); // idle | memuat | siap | error
  const [hasil, setHasil] = useState([]);
  const [error, setError] = useState(null);
  const [paramsTerakhir, setParamsTerakhir] = useState(null);

  // Sort/filter
  const [sort, setSort] = useState("skor");
  const [filter, setFilter] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const formRef = useRef(null);
  const kategoriSelectRef = useRef(null);
  const formValuesRef = useRef({ kategori, radiusKm, jumlah });
  useEffect(() => {
    formValuesRef.current = { kategori, radiusKm, jumlah };
  }, [kategori, radiusKm, jumlah]);

  const seqRef = useRef(0);
  const timerRef = useRef(null);

  const jalankanCari = useCallback(async () => {
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
      setParamsTerakhir({
        kategori: kategoriNilai,
        radius: Number(nilai.radiusKm),
        jumlah: jumlahNilai,
      });
      setStatus("siap");
    } catch (err) {
      if (nomor !== seqRef.current) return;
      setError(
        err instanceof TypeError && err.message === "Failed to fetch"
          ? "Tidak dapat terhubung ke server. Periksa koneksimu lalu coba lagi."
          : err.message || "Gagal mencari bahan. Silakan coba lagi."
      );
      setStatus("error");
    }
  }, [adaLokasi, profile]);

  // Auto-cari saat pertama render + debounce saat radius digeser.
  useEffect(() => {
    if (!adaLokasi) return;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      jalankanCari();
    }, 400);
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [radiusKm, jalankanCari, adaLokasi]);

  const hasilTerfilter = useMemo(() => {
    let arr = [...hasil];
    if (filter.length > 0) {
      arr = arr.filter((h) => filter.includes(h.kategori_citra));
    }
    if (sort === "jarak") {
      arr.sort((a, b) => a.jarak_km - b.jarak_km);
    } else if (sort === "volume") {
      arr.sort((a, b) => b.jumlah - a.jumlah);
    } else {
      arr.sort((a, b) => b.skor_akhir - a.skor_akhir);
    }
    return arr;
  }, [hasil, sort, filter]);

  function perluasRadius() {
    const baru = Math.min(RADIUS_MAX, radiusKm + 25);
    if (baru > radiusKm) setRadiusKm(baru);
  }

  function fokusKeForm() {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => kategoriSelectRef.current?.focus(), 350);
  }

  return (
    <div>
      {/* Header halaman */}
      <header className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-loop-ink sm:text-3xl">
          Cari Bahan
        </h1>
        <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-loop-line">
          Temukan limbah yang jadi kebutuhanmu. Hasil diurutkan berdasarkan
          kecocokan kategori, jarak, dan jumlah yang tersedia.
        </p>
      </header>

      {/* Form pencarian */}
      <div ref={formRef} className="scroll-mt-24">
        <SearchForm
          adaLokasi={adaLokasi}
          radiusKm={radiusKm}
          onRadiusChange={setRadiusKm}
          jumlah={jumlah}
          onJumlahChange={setJumlah}
          kategori={kategori}
          onKategoriChange={setKategori}
          searching={status === "memuat"}
          onCari={jalankanCari}
          selectKategoriRef={kategoriSelectRef}
        />
      </div>

      {/* Banner lokasi hilang (di luar form, tetap jelas) */}
      {!adaLokasi ? (
        <section className="mt-6" aria-label="Lokasi belum diatur">
          <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <IconMapPin className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
              <p className="text-sm leading-relaxed text-amber-900">
                Lokasi belum diatur. Pencarian tidak bisa berjalan tanpa
                koordinat. Atur lokasi dulu, lalu kembali ke halaman ini.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {/* Area hasil */}
      {status === "memuat" ? (
        <SkeletonHasil jumlah={6} />
      ) : status === "error" ? (
        <section className="mt-6" aria-label="Terjadi kesalahan">
          <Alert variant="error">{error}</Alert>
          <div className="mt-4 flex justify-center">
            <Button variant="secondary" onClick={jalankanCari}>
              <IconSearch className="h-4 w-4" />
              Coba Lagi
            </Button>
          </div>
        </section>
      ) : status === "siap" ? (
        hasil.length === 0 ? (
          <EmptyState
            onPerluasRadius={perluasRadius}
            bisaPerluas={radiusKm < RADIUS_MAX}
            onUbahKategori={fokusKeForm}
          />
        ) : (
          <section className="mt-6" aria-label="Hasil pencarian">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-loop-line">
                {hasilTerfilter.length === hasil.length
                  ? `${hasil.length} hasil`
                  : `Menampilkan ${hasilTerfilter.length} dari ${hasil.length} hasil`}
                {" untuk "}
                <span className="font-medium text-loop-ink">
                  &ldquo;{paramsTerakhir?.kategori ?? kategori}&rdquo;
                </span>
                {" dalam radius "}
                <span className="font-medium text-loop-ink">
                  {paramsTerakhir?.radius ?? radiusKm} km
                </span>
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDrawerOpen(true)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Urutkan &amp; Filter
              </Button>
            </div>

            {hasilTerfilter.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-loop-mist bg-white px-5 py-8 text-center text-sm text-loop-line">
                Tidak ada hasil yang cocok dengan filter kategori saat ini.
                Coba hilangkan sebagian filter lewat tombol{" "}
                &ldquo;Urutkan &amp; Filter&rdquo;.
              </div>
            ) : (
              <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {hasilTerfilter.map((item) => (
                  <HasilKartu key={item.listing_id} item={item} />
                ))}
              </div>
            )}
          </section>
        )
      ) : null}

      <DrawerSortFilter
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sort={sort}
        onSortChange={setSort}
        filter={filter}
        onFilterChange={setFilter}
        onReset={() => {
          setSort("skor");
          setFilter([]);
        }}
      />
    </div>
  );
}