"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Alert, TextArea } from "@/components/ui/Inputs";
import { IconCamera, IconPen, IconSpark } from "@/components/icons";
import { SATUAN_LIST, gabungDeskripsi } from "./constants";
import AiProcessing from "./AiProcessing";
import ReviewForm from "./ReviewForm";
import SuksesUpload from "./SuksesUpload";
import {
  blobKeDataUrl,
  buatListing,
  kompresGambar,
  panggilKlasifikasi,
  panggilPrefill,
  uploadFotoKeStorage,
} from "./api";

/**
 * Flow Upload Limbah (Task 4.3.1 - 4.3.4).
 *
 * Tahap: foto → memproses AI (gabungan) → review & koreksi → sukses.
 * Alur AI: klasifikasi citra lalu (kalau sukses) prefill isian dari Gemini -
 * semuanya ditampilkan dalam SATU state loading (AiProcessing), bukan dua
 * spinner. Kalau prefill gagal, alur tetap lanjut ke review manual.
 */
export default function UploadFlow({ profile }) {
  const fileRef = useRef(null);

  const [tahap, setTahap] = useState("foto"); // foto | memproses | review | sukses
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [catatan, setCatatan] = useState("");
  const [fileError, setFileError] = useState(null);
  const [runKe, setRunKe] = useState(0);

  const [langkah, setLangkah] = useState(0);
  const [pesan, setPesan] = useState("");

  const [hasilKlasifikasi, setHasilKlasifikasi] = useState(null);
  const [hasilPrefill, setHasilPrefill] = useState(null);
  const [hasilEkstraksi, setHasilEkstraksi] = useState(null);
  const [blobFoto, setBlobFoto] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [sukses, setSukses] = useState(null);

  // Bersihkan object URL preview saat diganti / dilepas.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function pilihFile(event) {
    const f = event.target.files?.[0];
    if (!f) return;
    if (!f.type || !f.type.startsWith("image/")) {
      setFileError("File yang dipilih bukan gambar. Pilih foto JPG, PNG, atau WebP.");
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(f));
    setFile(f);
    setFileError(null);
  }

  function bukaPilihFile() {
    fileRef.current?.click();
  }

  function hapusPilihan() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setFile(null);
    setFileError(null);
  }

  /** Pindah dari review kembali ke foto (foto & catatan tetap, hasil AI dibuang). */
  function kembaliKeFoto() {
    setHasilKlasifikasi(null);
    setHasilPrefill(null);
    setHasilEkstraksi(null);
    setBlobFoto(null);
    setLangkah(0);
    setTahap("foto");
  }

  async function jalankanAi() {
    if (!file) return;
    setFileError(null);
    setRunKe((n) => n + 1);
    setHasilPrefill(null);
    setTahap("memproses");

    try {
      // 1) Kompresi foto (canvas, max ~1280px, JPEG 0.8)
      setLangkah(0);
      setPesan("Mengompres foto supaya ringan dan siap dikenali…");
      const blob = await kompresGambar(file);
      setBlobFoto(blob);

      // 2) Klasifikasi citra (raw bytes octet-stream)
      setLangkah(1);
      setPesan("AI sedang mengenali jenis limbah…");
      const hasil = await panggilKlasifikasi(blob);
      setHasilKlasifikasi(hasil);

      if (hasil.gagal) {
        // AI gagal total → lewati prefill (tidak bermakna tanpa kategori)
        setLangkah(3);
        setPesan("Selesai. AI tidak yakin, kamu bisa memilih kategori manual.");
        setTahap("review");
        return;
      }

      // 3) Prefill isian listing dari foto (kalau klasifikasi sukses)
      setLangkah(2);
      setPesan("AI sedang menyusun isian listing dari foto…");
      let prefill = null;
      try {
        const fotoB64 = await blobKeDataUrl(blob);
        const res = await panggilPrefill({
          fotoB64,
          kategoriCitra: hasil.kategori,
          catatan,
        });
        // Response selalu 200; `gagal: true` berarti isian tidak tersedia.
        prefill = res && !res.gagal ? res : null;
      } catch {
        prefill = null; // prefill opsional - jangan blokir alur upload
      }
      setHasilPrefill(prefill);

      setLangkah(3);
      setPesan("Selesai. Periksa hasil dan lengkapi detail listing.");
      setTahap("review");
    } catch (err) {
      setFileError(
        err.message || "Terjadi kesalahan saat memproses foto. Coba lagi."
      );
      setTahap("foto");
    }
  }

  /** Upload foto ke storage lalu POST /api/listings. Return error string/null. */
  async function submitListing(payload) {
    setSubmitting(true);
    try {
      if (!blobFoto) {
        throw new Error("Foto belum siap. Silakan kembali ke langkah awal.");
      }
      const fotoUrl = await uploadFotoKeStorage(blobFoto);
      const body = {
        ...payload,
        foto: [{ fotoUrl, urutan: 1 }],
      };
      const hasil = await buatListing(body);
      setSukses({
        judul: payload.judul,
        kategori: payload.kategoriCitra,
        jumlah: payload.jumlah,
        satuan: payload.satuan,
      });
      setTahap("sukses");
      return null;
    } catch (err) {
      if (err instanceof TypeError && err.message === "Failed to fetch") {
        return "Tidak dapat terhubung ke server. Periksa koneksimu lalu coba lagi.";
      }
      return err.message;
    } finally {
      setSubmitting(false);
    }
  }

  function resetFlow() {
    hapusPilihan();
    setCatatan("");
    setHasilKlasifikasi(null);
    setHasilPrefill(null);
    setHasilEkstraksi(null);
    setBlobFoto(null);
    setSukses(null);
    setLangkah(0);
    setTahap("foto");
  }

  // ── Pratinjau foto (tahap "foto") ──────────────────────────────────────
  const renderTahapFoto = (
    <section
      aria-labelledby="foto-heading"
      className="rounded-2xl border border-loop-mist bg-white p-6 shadow-sm sm:p-8"
    >
      <h1
        id="foto-heading"
        className="font-display text-2xl font-semibold tracking-tight text-loop-ink"
      >
        Foto limbahmu
      </h1>
      <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-loop-line">
        Ambil foto dari kamera (HP) atau pilih file (desktop). AI akan
        mengenali jenis limbah dan mengisi otomatis isian listing dari foto.
      </p>

      <div className="mt-5">
        {previewUrl ? (
          <div className="relative overflow-hidden rounded-2xl border border-loop-mist bg-loop-base">
            {/* eslint-disable-next-line @next/next/no-img-element -- pratinjau client (blob URL) */}
            <img
              src={previewUrl}
              alt="Pratinjau foto limbah"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={bukaPilihFile}
            className="fr group flex aspect-[4/3] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-loop-mist bg-loop-base text-center transition hover:border-loop-primary/60 hover:bg-loop-primary/5"
          >
            <IconCamera className="h-9 w-9 text-loop-line transition group-hover:text-loop-primary" />
            <span className="mt-3 text-sm font-semibold text-loop-ink">
              Ketuk untuk memilih foto
            </span>
            <span className="mt-1 text-xs text-loop-line">
              Di HP, kamera terbuka otomatis. File maksimal 5 MB.
            </span>
          </button>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={pilihFile}
          className="sr-only"
        />
      </div>

      {fileError ? (
        <div className="mt-4">
          <Alert variant="error">{fileError}</Alert>
        </div>
      ) : null}

      <div className="mt-5">
        <TextArea
          label="Catatan singkat (opsional)"
          name="catatan"
          rows={2}
          placeholder="Contoh: kardus dari toko, sudah dipress"
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          hint="Catatan ini membantu AI menyusun deskripsi yang lebih akurat."
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={jalankanAi}
          disabled={!file}
        >
          <IconSpark className="h-5 w-5" />
          Kenali dengan AI
        </Button>
        {previewUrl ? (
          <Button type="button" variant="secondary" size="lg" onClick={bukaPilihFile}>
            <IconPen className="h-4 w-4" />
            Pilih Ulang
          </Button>
        ) : null}
      </div>
    </section>
  );

  // ── Review (hasil AI + detail form + pratinjau live) ───────────────────
  // `renderTahapReview` adalah konstanta JSX yang props-nya dievaluasi di
  // SETIAP render (termasuk saat tahap "foto" / SSR awal). Karena itu semua
  // akses `hasilKlasifikasi.*` / `hasilPrefill.*` di bawah WAJIB null-safe —
  // kalau `aiGagal` tidak menyertakan `!hasilKlasifikasi`, render awal akan
  // crash membaca properti dari null (TypeError: Cannot read properties of
  // null). `hasilPrefill` dipakai dengan optional chaining (`?.`) + guard.
  const aiGagal = !hasilKlasifikasi || !!hasilKlasifikasi.gagal;
  const adaPrefill = !!hasilPrefill && !hasilPrefill.gagal;
  const renderTahapReview = (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-loop-ink">
        Periksa & lengkapi
      </h1>
      <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-loop-line">
        Koreksi kategori kalau perlu, lengkapi detail, lalu pasang listing.
      </p>
      <div className="mt-6">
        <ReviewForm
          key={`review-${runKe}`}
          initial={{
            judul: hasilPrefill?.judul ?? "",
            kategori: aiGagal ? null : hasilKlasifikasi.kategori,
            kategoriDikoreksi: aiGagal,
            deskripsi: adaPrefill && hasilPrefill.deskripsi
              ? hasilPrefill.deskripsi
              : gabungDeskripsi(hasilEkstraksi, catatan),
            jumlah:
              hasilPrefill?.jumlah != null ? String(hasilPrefill.jumlah) : "",
            satuan: SATUAN_LIST.includes(hasilPrefill?.satuan)
              ? hasilPrefill.satuan
              : "kg",
            expiredAt: hasilPrefill?.expiredAt ?? "",
          }}
          kategoriAsli={aiGagal ? null : hasilKlasifikasi.kategori}
          confidence={aiGagal ? null : hasilKlasifikasi.confidence}
          alertInfo={aiGagal ? "gagal" : hasilKlasifikasi.perlu_koreksi_manual ? "koreksi" : null}
          aiPrefill={adaPrefill}
          fotoUrl={previewUrl}
          lokasi={profile}
          submitLabel="Pasang Listing"
          submitting={submitting}
          onGantiFoto={kembaliKeFoto}
          onSubmit={submitListing}
        />
      </div>
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-5xl">
      {tahap === "foto" ? (
        <div className="mx-auto max-w-2xl">{renderTahapFoto}</div>
      ) : null}

      {tahap === "memproses" ? (
        <div className="mx-auto max-w-2xl">
          <AiProcessing langkah={langkah} pesan={pesan} />
        </div>
      ) : null}

      {tahap === "review" ? renderTahapReview : null}

      {tahap === "sukses" ? (
        <SuksesUpload sukses={sukses} onUlang={resetFlow} />
      ) : null}
    </div>
  );
}