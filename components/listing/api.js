"use client";

// LoopLink - Helper client untuk detail & klaim listing (Fase 4.5).
// Semua perubahan status melalui endpoint resmi Fase 3 (tidak pernah
// update langsung via Supabase client).

async function bacaError(res, fallback) {
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

/** POST /api/listings/[id]/klaim */
export async function klaimListing(id) {
  const res = await fetch(`/api/listings/${id}/klaim`, { method: "POST" });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(
      (data && data.error) || "Gagal mengklaim listing. Silakan coba lagi."
    );
  }
  return data;
}

/** POST /api/listings/[id]/selesai */
export async function selesaikanListing(id) {
  const res = await fetch(`/api/listings/${id}/selesai`, { method: "POST" });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(
      (data && data.error) || "Gagal menyelesaikan transaksi. Silakan coba lagi."
    );
  }
  return data;
}

/** POST /api/listings/[id]/batal */
export async function batalkanListing(id) {
  const res = await fetch(`/api/listings/${id}/batal`, { method: "POST" });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(
      (data && data.error) || "Gagal membatalkan klaim. Silakan coba lagi."
    );
  }
  return data;
}

/** POST /api/laporan */
export async function kirimLaporan({ listingId, alasan }) {
  const res = await fetch("/api/laporan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ listingId, alasan }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(
      (data && data.error) || "Gagal mengirim laporan. Silakan coba lagi."
    );
  }
  return data;
}