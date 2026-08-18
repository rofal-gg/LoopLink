"use client";

// LoopLink - Helper client untuk flow katalog & cari bahan (Fase 4.4 / 4.7).
// Memanggil endpoint Fase 3 (cookie sesi dikirim otomatis).

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

/**
 * POST /api/listings/cari - cari listing cocok dengan kebutuhan.
 * Body persis kontrak docs/api-endpoints.md (jangan tambah field lain).
 */
export async function cariBahan(body) {
  const res = await fetch("/api/listings/cari", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(
      (data && data.error) || "Gagal mencari bahan. Silakan coba lagi."
    );
  }
  return data;
}

/**
 * GET /api/listings/katalog - katalog marketplace: semua listing tersedia
 * milik user lain. Kategori & radius opsional; radius TIDAK memotong hasil
 * (hanya penanda `di_luar_jangkauan`). Param yang tidak diisi tidak
 * disertakan supaya backend memakai nilai default.
 * @param {{ kategori?: string, radius?: number|string }} opsi
 */
export async function ambilKatalog({ kategori, radius } = {}) {
  const params = new URLSearchParams();
  if (kategori != null && String(kategori).trim() !== "") {
    params.set("kategori", String(kategori).trim());
  }
  if (radius != null && String(radius).trim() !== "") {
    const nilai = Number(radius);
    if (Number.isFinite(nilai) && nilai > 0) {
      params.set("radius", String(nilai));
    }
  }
  const query = params.toString();
  const res = await fetch(`/api/listings/katalog${query ? `?${query}` : ""}`);
  if (!res.ok) {
    throw new Error(await bacaError(res, "Gagal memuat katalog. Silakan coba lagi."));
  }
  const data = await res.json().catch(() => null);
  return data ?? { hasil: [] };
}