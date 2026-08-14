"use client";

import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Alert, TextArea, TextInput } from "@/components/ui/Inputs";
import { IconAlert, IconMapPin, IconPen } from "@/components/icons";
import { KATEGORI_LABEL, SATUAN_LIST, formatPersen } from "./constants";
import KategoriPicker from "./KategoriPicker";
import ListingPreview from "./ListingPreview";

/**
 * Layar Review & Koreksi Kategori + Form Detail Listing (satu layar).
 *
 * - Panel kiri: kategori (dengan DUA state pesan AI berbeda) + form detail.
 * - Panel kanan: pratinjau listing live.
 *
 * Dipakai oleh UploadFlow (create, `alertInfo` dari AI) dan EditFlow
 * (edit, tanpa alert AI).
 *
 * Props:
 *   initial       - nilai awal draft ({ judul, kategori, kategoriDikoreksi,
 *                    deskripsi, jumlah, satuan, expiredAt })
 *   kategoriAsli  - kategori asal (rekomendasi AI / kategori listing lama);
 *                    perubahan dari nilai ini menandakan "dikoreksi manual"
 *   confidence    - confidence hasil AI (0..1) atau null
 *   alertInfo     - "gagal" | "koreksi" | null
 *   fotoUrl       - URL pratinjau foto
 *   lokasi        - profil lokasi ({ alamat_teks, lokasi_lat, lokasi_lng }) | null
 *   submitLabel   - label tombol submit
 *   submitting    - state loading submit
 *   onGantiFoto   - kembali ke pemilihan foto (upload) | null (edit)
 *   onSubmit(payload) => Promise<string | null> - error string kalau gagal
 */
export default function ReviewForm({
  initial = null,
  kategoriAsli = null,
  confidence = null,
  alertInfo = null,
  fotoUrl = null,
  lokasi = null,
  submitLabel = "Pasang Listing",
  submitting = false,
  onGantiFoto = null,
  onSubmit,
}) {
  const [judul, setJudul] = useState(initial?.judul ?? "");
  const [kategori, setKategori] = useState(initial?.kategori ?? kategoriAsli ?? null);
  const [kategoriDikoreksi, setKategoriDikoreksi] = useState(
    initial?.kategoriDikoreksi ?? false
  );
  const [deskripsi, setDeskripsi] = useState(initial?.deskripsi ?? "");
  const [jumlah, setJumlah] = useState(
    initial?.jumlah != null ? String(initial.jumlah) : ""
  );
  const [satuan, setSatuan] = useState(initial?.satuan ?? "kg");
  const [expiredAt, setExpiredAt] = useState(initial?.expiredAt ?? "");
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);

  const lokasiAda =
    !!lokasi && lokasi.lokasi_lat != null && lokasi.lokasi_lng != null;
  const alamatTersimpan = lokasi?.alamat_teks ?? null;

  function pilihKategori(k) {
    setKategori(k);
    setKategoriDikoreksi(kategoriAsli ? k !== kategoriAsli : true);
    setErrors((e) => ({ ...e, kategori: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError(null);

    const next = {};
    if (!judul.trim()) next.judul = "Judul wajib diisi.";
    if (!kategori) next.kategori = "Pilih salah satu kategori untuk melanjutkan.";
    const jumlahAngka = Number(jumlah);
    if (!jumlah.trim() || !Number.isFinite(jumlahAngka) || jumlahAngka <= 0) {
      next.jumlah = "Jumlah harus lebih besar dari 0.";
    }
    if (!satuan) next.satuan = "Pilih satuan.";
    if (!lokasiAda) {
      next.lokasi =
        "Belum ada lokasi tersimpan. Listing tidak bisa dipasang tanpa koordinat.";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const payload = {
      judul: judul.trim(),
      kategoriCitra: kategori,
      kategoriDikoreksi,
      confidenceScore: confidence,
      deskripsiTeks: deskripsi.trim() || null,
      jumlah: jumlahAngka,
      satuan,
      lokasiLat: lokasi?.lokasi_lat ?? null,
      lokasiLng: lokasi?.lokasi_lng ?? null,
      expiredAt: expiredAt
        ? new Date(`${expiredAt}T00:00:00`).toISOString()
        : null,
    };

    const err = await onSubmit(payload);
    if (err) setSubmitError(err);
  }

  const teksKategori = (() => {
    if (alertInfo === "gagal") {
      return "AI gagal mengenali foto. Pilih kategori yang paling sesuai dengan limbahmu.";
    }
    if (alertInfo === "koreksi") {
      return "AI kurang yakin dengan hasilnya. Periksa kategori yang disorot dan ganti kalau perlu.";
    }
    if (kategori) {
      return `AI menyarankan ${KATEGORI_LABEL[kategori]}. Ubah kalau tidak sesuai.`;
    }
    return "Pilih kategori limbah yang paling sesuai.";
  })();

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        {/* ── Panel kiri: kategori + detail ─────────────────────────────── */}
        <div className="space-y-6">
          {submitError ? <Alert variant="error">{submitError}</Alert> : null}

          {/* Kategori */}
          <section
            aria-labelledby="kategori-heading"
            className="rounded-2xl border border-loop-mist bg-white p-6 shadow-sm sm:p-8"
          >
            <h2
              id="kategori-heading"
              className="font-display text-lg font-semibold tracking-tight text-loop-ink"
            >
              Kategori limbah
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-loop-line">
              {teksKategori}
            </p>

            {alertInfo === "gagal" ? (
              <div className="mt-4">
                <Alert variant="error">
                  AI gagal mengenali foto ini. Pilih kategori secara manual
                  untuk melanjutkan.
                </Alert>
              </div>
            ) : null}

            {alertInfo === "koreksi" ? (
              <div
                role="status"
                className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm text-amber-900"
              >
                <IconAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                <p>
                  AI kurang yakin dengan hasil ini (confidence{" "}
                  {formatPersen(confidence) ?? "-"}). Periksa dan pilih
                  kategori yang paling sesuai.
                </p>
              </div>
            ) : null}

            <div className="mt-4">
              <KategoriPicker
                kategori={kategori}
                onPilih={pilihKategori}
                perluKoreksi={alertInfo === "koreksi"}
              />
            </div>
            {errors.kategori ? (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-700">
                <IconAlert className="h-3.5 w-3.5" />
                {errors.kategori}
              </p>
            ) : null}
          </section>

          {/* Detail listing */}
          <section
            aria-labelledby="detail-heading"
            className="rounded-2xl border border-loop-mist bg-white p-6 shadow-sm sm:p-8"
          >
            <h2
              id="detail-heading"
              className="font-display text-lg font-semibold tracking-tight text-loop-ink"
            >
              Detail listing
            </h2>
            <div className="mt-4 space-y-4">
              <TextInput
                label="Judul"
                name="judul"
                required
                placeholder="Contoh: Kardus bekas toko"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                error={errors.judul}
              />

              <TextArea
                label="Deskripsi"
                name="deskripsi"
                rows={4}
                placeholder="Contoh: Kondisi kering, sudah dipress rapi."
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                hint="Dibantu AI dari hasil foto dan catatanmu. Silakan diedit."
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <TextInput
                  label="Jumlah"
                  name="jumlah"
                  type="number"
                  min="1"
                  step="any"
                  required
                  placeholder="500"
                  value={jumlah}
                  onChange={(e) => setJumlah(e.target.value)}
                  error={errors.jumlah}
                />
                <div>
                  <label
                    htmlFor="satuan"
                    className="mb-1.5 block text-sm font-semibold text-loop-ink"
                  >
                    Satuan
                  </label>
                  <select
                    id="satuan"
                    name="satuan"
                    value={satuan}
                    onChange={(e) => setSatuan(e.target.value)}
                    className="w-full rounded-xl border border-loop-mist bg-loop-base px-3.5 py-2.5 text-sm text-loop-ink shadow-sm outline-none transition focus:border-loop-primary focus:ring-4 focus:ring-loop-primary/15"
                  >
                    {SATUAN_LIST.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {errors.satuan ? (
                    <p className="mt-1.5 text-xs font-medium text-red-700">
                      {errors.satuan}
                    </p>
                  ) : null}
                </div>
              </div>

              <TextInput
                label="Berlaku sampai (opsional)"
                name="expiredAt"
                type="date"
                value={expiredAt}
                onChange={(e) => setExpiredAt(e.target.value)}
                hint="Kosongkan kalau tidak ada batas waktu."
              />
            </div>
          </section>

          {/* Lokasi */}
          <section
            aria-labelledby="lokasi-heading"
            className="rounded-2xl border border-loop-mist bg-white p-6 shadow-sm sm:p-8"
          >
            <h2
              id="lokasi-heading"
              className="font-display text-lg font-semibold tracking-tight text-loop-ink"
            >
              Lokasi pemasangan
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-loop-line">
              Listing memakai lokasi tersimpan di profilmu.
            </p>

            <div className="mt-4">
              {lokasiAda ? (
                <div className="flex items-start gap-2.5 rounded-xl border border-loop-primary/40 bg-loop-primary/10 px-3.5 py-3 text-sm text-loop-primary-hover">
                  <IconMapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  <p className="min-w-0">
                    {alamatTersimpan ? (
                      <>
                        <span className="font-medium">{alamatTersimpan}</span>
                        <span className="mt-0.5 block font-mono text-xs opacity-80">
                          {Number(lokasi.lokasi_lat).toFixed(5)},{" "}
                          {Number(lokasi.lokasi_lng).toFixed(5)}
                        </span>
                      </>
                    ) : (
                      <span className="font-medium">
                        Koordinat tersimpan (
                        {Number(lokasi.lokasi_lat).toFixed(5)},{" "}
                        {Number(lokasi.lokasi_lng).toFixed(5)})
                      </span>
                    )}
                  </p>
                  <ButtonLink
                    href="/setup-lokasi"
                    variant="ghost"
                    size="sm"
                    className="ml-auto shrink-0"
                  >
                    Ubah
                  </ButtonLink>
                </div>
              ) : (
                <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-2.5 text-sm text-amber-900">
                    <IconMapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                    <p>
                      Kamu belum menyimpan lokasi. Atur lokasi dulu supaya
                      listing bisa dipasang dan ditemukan orang di sekitarmu.
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
              )}
              {errors.lokasi ? (
                <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-700">
                  <IconAlert className="h-3.5 w-3.5" />
                  {errors.lokasi}
                </p>
              ) : null}
            </div>
          </section>

          {/* Aksi */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={submitting}
            >
              {submitLabel}
            </Button>
            {onGantiFoto ? (
              <Button
                type="button"
                variant="ghost"
                size="lg"
                onClick={onGantiFoto}
                disabled={submitting}
              >
                <IconPen className="h-4 w-4" />
                Ganti Foto
              </Button>
            ) : null}
          </div>
        </div>

        {/* ── Panel kanan: pratinjau live ───────────────────────────────── */}
        <aside aria-label="Pratinjau listing" className="lg:sticky lg:top-24">
          <p className="mb-2 px-1 text-sm font-semibold text-loop-ink">
            Pratinjau listing
          </p>
          <ListingPreview
            fotoUrl={fotoUrl}
            judul={judul}
            kategori={kategori}
            confidence={confidence}
            kategoriDikoreksi={kategoriDikoreksi}
            jumlah={jumlah}
            satuan={satuan}
            lokasi={lokasi}
            deskripsi={deskripsi}
            expiredAt={expiredAt}
          />
          <p className="mt-2 px-1 text-xs leading-relaxed text-loop-line">
            Pratinjau ini memperbarui otomatis mengikuti isian di panel kiri.
          </p>
        </aside>
      </div>
    </form>
  );
}