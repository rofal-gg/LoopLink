"use client";

// LoopLink - Helper client untuk flow upload (Fase 4.3).
// Semua panggilan memakai fetch ke route API Fase 3 (cookie sesi dikirim
// otomatis) + Supabase Storage bucket `listings` (pola dari migration 011).

import { createClient } from "@/lib/supabase/client";

/** Baca pesan error dari response API ({ error: string }) dengan fallback. */
export async function bacaError(res, fallback) {
  try {
    const data = await res.json();
    if (data && typeof data.error === "string" && data.error.trim()) {
      return data.error;
    }
  } catch {
    // body tidak JSON - pakai fallback
  }
  return fallback;
}

/** POST /api/listings/klasifikasi - kirim raw bytes foto (octet-stream). */
export async function panggilKlasifikasi(blob) {
  const res = await fetch("/api/listings/klasifikasi", {
    method: "POST",
    headers: { "Content-Type": "application/octet-stream" },
    body: blob,
  });
  if (!res.ok) {
    throw new Error(await bacaError(res, "Gagal memanggil layanan klasifikasi AI."));
  }
  return res.json();
}

/** POST /api/listings/ekstraksi-teks - susun deskripsi dari catatan + kategori. */
export async function panggilEkstraksi({ deskripsiUser = "", kategoriCitra = "" }) {
  const res = await fetch("/api/listings/ekstraksi-teks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      deskripsiUser,
      kategoriCitra,
      usiaBulan: 0,
    }),
  });
  if (!res.ok) {
    throw new Error(await bacaError(res, "Gagal memanggil layanan AI untuk deskripsi."));
  }
  return res.json();
}

/** Blob -> base64 data URL (untuk prefill Gemini dari foto terkompresi). */
export async function blobKeDataUrl(blob) {
  if (!(blob instanceof Blob)) {
    throw new Error("Foto belum siap untuk diproses AI.");
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Gagal membaca foto untuk AI."));
    reader.readAsDataURL(blob);
  });
}

/**
 * POST /api/listings/prefill - Gemini menyusun isian listing dari foto
 * (judul, deskripsi, jumlah, satuan, expiredAt). Response SELALU 200;
 * kalau gagal, field `gagal` = true (jangan blokir alur upload).
 */
export async function panggilPrefill({ fotoB64, kategoriCitra = "", catatan = "" }) {
  const res = await fetch("/api/listings/prefill", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fotoB64, kategoriCitra, catatan }),
  });
  if (!res.ok) {
    throw new Error(await bacaError(res, "Gagal memanggil layanan AI untuk isian listing."));
  }
  return res.json();
}

/** POST /api/listings - buat listing (user_id diambil server dari sesi). */
export async function buatListing(body) {
  const res = await fetch("/api/listings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(
      (data && data.error) || "Gagal memasang listing. Silakan coba lagi."
    );
  }
  return data;
}

/** GET /api/listings/[id] - detail listing (untuk halaman edit). */
export async function ambilListing(id) {
  const res = await fetch(`/api/listings/${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(
      (data && data.error) || "Gagal mengambil data listing."
    );
  }
  return data;
}

/** PATCH /api/listings/[id] - edit listing (field whitelist non-status). */
export async function perbaruiListing(id, body) {
  const res = await fetch(`/api/listings/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(
      (data && data.error) || "Gagal mengubah listing. Silakan coba lagi."
    );
  }
  return data;
}

/** DELETE /api/listings/[id] - hapus listing (hanya pemilik + status tersedia). */
export async function hapusListing(id) {
  const res = await fetch(`/api/listings/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(
      (data && data.error) || "Gagal menghapus listing. Silakan coba lagi."
    );
  }
  return data;
}

/** Baca file jadi data URL (untuk kompresi canvas). */
function bacaDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Gagal membaca file foto."));
    reader.readAsDataURL(file);
  });
}

/** Muat gambar dari data URL menjadi objek Image untuk digambar ke canvas. */
function muatGambar(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new Error("Gagal membaca gambar. Pastikan file foto valid."));
    img.src = src;
  });
}

/** ID unik untuk path storage (fallback kalau crypto.randomUUID tidak ada). */
function buatIdAcak() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Kompres foto via canvas: target dimensi max ~1280px, kualitas JPEG ~0.8.
 * Hasil selalu JPEG supaya muat di batas bucket 5MB dan klasifikasi cepat.
 */
export async function kompresGambar(file) {
  if (!file || !file.type || !file.type.startsWith("image/")) {
    throw new Error("File yang dipilih bukan gambar. Pilih foto JPG, PNG, atau WebP.");
  }

  const dataUrl = await bacaDataUrl(file);
  const img = await muatGambar(dataUrl);

  const MAX_DIMENSI = 1280;
  const skala = Math.min(1, MAX_DIMENSI / Math.max(img.width, img.height));
  const lebar = Math.max(1, Math.round(img.width * skala));
  const tinggi = Math.max(1, Math.round(img.height * skala));

  const canvas = document.createElement("canvas");
  canvas.width = lebar;
  canvas.height = tinggi;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Browser ini tidak mendukung kompresi foto. Coba browser lain.");
  }
  ctx.drawImage(img, 0, 0, lebar, tinggi);

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Gagal mengompres foto."))),
      "image/jpeg",
      0.8
    );
  });
  return blob;
}

/**
 * Upload foto terkompresi ke Storage bucket `listings` (publik).
 * Path wajib diawali `{userId}/...` sesuai policy storage migration 011.
 * Mengembalikan publicUrl.
 */
export async function uploadFotoKeStorage(blob) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Sesi login tidak ditemukan. Silakan masuk kembali.");
  }

  const path = `${user.id}/${buatIdAcak()}.jpg`;
  const { error } = await supabase.storage
    .from("listings")
    .upload(path, blob, { contentType: "image/jpeg", upsert: false });

  if (error) {
    throw new Error(`Gagal mengunggah foto: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("listings").getPublicUrl(path);
  return publicUrl;
}