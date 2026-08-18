"use client";

import { useState } from "react";
import { IconMapPin, IconSearch } from "@/components/icons";
import { Button, ButtonLink } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/Inputs";
import { KEBUTUHAN_OPTIONS, OPSI_LAINNYA } from "./constants";

const SELECT_BASE =
  "w-full rounded-xl border border-loop-mist bg-loop-base px-3.5 py-2.5 text-sm text-loop-ink shadow-sm outline-none transition focus:border-loop-primary focus:ring-4 focus:ring-loop-primary/15 disabled:opacity-60";

/**
 * Form pencarian bahan cocok (mode skor): dropdown kategori kebutuhan
 * (7 opsi exact-match dari tabel kategori_kecocokan + pilihan "Lainnya"),
 * slider radius jangkauan, dan input jumlah dibutuhkan. Mengirim
 * POST /api/listings/cari yang TIDAK memotong hasil di luar radius
 * (ditandai `di_luar_jangkauan` di kartu hasil).
 *
 * Props:
 *   adaLokasi        - profil punya koordinat? (false => pencarian ditolak)
 *   radiusKm         - nilai slider saat ini (controlled dari induk)
 *   onRadiusChange   - dipanggil saat slider digeser (tanpa auto-cari)
 *   jumlah           - nilai input jumlah (string)
 *   onJumlahChange   - dipanggil saat input jumlah berubah
 *   kategori         - nilai kategori efektif yang dikirim ke API
 *   onKategoriChange - dipanggil saat kategori berubah
 *   searching        - sedang memanggil API (loading)
 *   onCari           - submit ulang pencarian
 *   selectKategoriRef - ref ke elemen select (untuk fokus dari Empty State)
 */
export default function SearchForm({
  adaLokasi = false,
  radiusKm = 30,
  onRadiusChange,
  jumlah = "",
  onJumlahChange,
  kategori = "",
  onKategoriChange,
  searching = false,
  onCari,
  selectKategoriRef = null,
}) {
  const [pilihan, setPilihan] = useState(
    KEBUTUHAN_OPTIONS.some((o) => o.nilai === kategori)
      ? kategori
      : KEBUTUHAN_OPTIONS[0].nilai
  );
  const [manualKategori, setManualKategori] = useState(
    KEBUTUHAN_OPTIONS.some((o) => o.nilai === kategori) ? "" : kategori
  );
  const [errors, setErrors] = useState({});

  const isManual = pilihan === OPSI_LAINNYA;
  const pctFill = Math.min(
    100,
    Math.max(0, ((Number(radiusKm) || 0) / 100) * 100)
  );

  function gantiPilihan(nilai) {
    setPilihan(nilai);
    setErrors((e) => ({ ...e, kategori: undefined }));
    if (nilai !== OPSI_LAINNYA) {
      onKategoriChange(nilai);
    } else {
      onKategoriChange(manualKategori.trim());
    }
  }

  function gantiManual(value) {
    setManualKategori(value);
    setErrors((e) => ({ ...e, kategori: undefined }));
    onKategoriChange(value.trim());
  }

  function handleSubmit(event) {
    event.preventDefault();
    const next = {};
    if (isManual && !manualKategori.trim()) {
      next.kategori = "Tulis kategori kebutuhanmu atau pilih dari daftar.";
    }
    const jumlahAngka = Number(jumlah);
    if (!jumlah.trim() || !Number.isFinite(jumlahAngka) || jumlahAngka <= 0) {
      next.jumlah = "Jumlah dibutuhkan harus lebih dari 0.";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onCari();
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-2xl border border-loop-mist bg-white p-5 shadow-sm sm:p-7"
    >
      {/* Penjelasan mode skor */}
      <div className="mb-5 rounded-xl border border-loop-primary/20 bg-loop-primary/5 px-4 py-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-loop-ink">
          <IconSearch className="h-4 w-4 text-loop-primary" />
          Cari bahan cocok (berdasarkan skor)
        </p>
        <p className="mt-1 text-xs leading-relaxed text-loop-line">
          Hasil diurutkan dari skor kecocokan tertinggi (kategori, jarak,
          volume). Semua listing tetap ditampilkan; yang di luar radius
          jangkauan diberi tanda &ldquo;Di luar jangkauan&rdquo;.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {/* Kategori kebutuhan */}
        <div className="md:col-span-2">
          <label
            htmlFor="kategori-kebutuhan"
            className="mb-1.5 block text-sm font-semibold text-loop-ink"
          >
            Kategori kebutuhan
            <span className="ml-0.5 text-loop-primary">*</span>
          </label>
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <select
              id="kategori-kebutuhan"
              ref={selectKategoriRef}
              value={pilihan}
              onChange={(e) => gantiPilihan(e.target.value)}
              disabled={!adaLokasi}
              className={`${SELECT_BASE} disabled:cursor-not-allowed`}
            >
              {KEBUTUHAN_OPTIONS.map((opt) => (
                <option key={opt.nilai} value={opt.nilai}>
                  {opt.label} - {opt.desc}
                </option>
              ))}
              <option value={OPSI_LAINNYA}>Lainnya (ketik manual)</option>
            </select>

            {isManual ? (
              <div>
                <TextInput
                  id="kategori-manual"
                  label="Tulis kategori kebutuhan"
                  placeholder="Contoh: Bahan baku plastik daur ulang"
                  value={manualKategori}
                  onChange={(e) => gantiManual(e.target.value)}
                  error={errors.kategori}
                  hint="Dicocokkan dengan aturan kecocokan. Semua listing tetap ditampilkan, urutan mengikuti skor."
                  disabled={!adaLokasi}
                />
              </div>
            ) : (
              <p className="hidden items-end pb-2.5 text-xs leading-relaxed text-loop-line lg:flex">
                Hasil mencakup semua listing tersedia; urutan memakai skor
                kecocokan dengan kebutuhanmu.
              </p>
            )}
          </div>
          {!isManual && errors.kategori ? (
            <p className="mt-1.5 text-xs font-medium text-red-700">
              {errors.kategori}
            </p>
          ) : null}
        </div>

        {/* Radius slider */}
        <div>
          <div className="flex items-baseline justify-between gap-3">
            <label
              htmlFor="radius-cari"
              className="block text-sm font-semibold text-loop-ink"
            >
              Radius jangkauan
            </label>
            <span className="font-mono text-sm font-semibold tabular-nums text-loop-primary">
              {radiusKm} km
            </span>
          </div>
          <input
            id="radius-cari"
            type="range"
            min="1"
            max="100"
            step="1"
            value={radiusKm}
            onChange={(e) => onRadiusChange(Number(e.target.value))}
            disabled={!adaLokasi}
            aria-label="Radius jangkauan dalam kilometer (tidak memotong hasil)"
            className="range-loop mt-3"
            style={{ "--fill": `${pctFill}%` }}
          />
          <div className="mt-1.5 flex justify-between font-mono text-[11px] text-loop-line">
            <span>1 km</span>
            <span>100 km</span>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-loop-line">
            Radius tidak memotong hasil. Listing di luar radius tetap tampil
            dan diberi badge &ldquo;Di luar jangkauan&rdquo;.
          </p>
        </div>

        {/* Jumlah dibutuhkan */}
        <div>
          <TextInput
            label="Jumlah dibutuhkan"
            name="jumlahDibutuhkan"
            type="number"
            min="1"
            step="any"
            required
            placeholder="40"
            value={jumlah}
            onChange={(e) => onJumlahChange(e.target.value)}
            error={errors.jumlah}
            hint="Dipakai untuk menilai skor volume, misalnya dalam kg."
            disabled={!adaLokasi}
          />
        </div>
      </div>

      {/* Banner lokasi hilang */}
      {!adaLokasi ? (
        <div className="mt-5 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2.5 text-sm text-amber-900">
            <IconMapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
            <p>
              Kamu belum menyimpan lokasi. Mode ini butuh koordinat untuk
              menghitung skor jarak. Listing tetap bisa dilihat lewat tab
              Katalog.
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
      ) : null}

      {/* Aksi */}
      <div className="mt-5 flex items-center justify-end">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={searching}
          disabled={!adaLokasi}
        >
          <IconSearch className="h-4 w-4" />
          Cari Bahan
        </Button>
      </div>
    </form>
  );
}
