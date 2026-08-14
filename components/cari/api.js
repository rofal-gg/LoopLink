"use client";

// LoopLink - Helper client untuk flow cari bahan (Fase 4.4).
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