import { updateSession } from "@/lib/supabase/proxy";

/**
 * Proxy — konvensi Next.js 16 (pengganti middleware.ts).
 * Berjalan di sisi server sebelum route di-render.
 *
 * Tugasnya hanya meneruskan ke updateSession() di lib/supabase/proxy.js
 * (refresh sesi Supabase + sinkronisasi cookie).
 *
 * Catatan: jangan letakkan business logic di sini — file ini idealnya tetap
 * tipis supaya mudah dideploy ke CDN/edge.
 */
export async function proxy(request) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Jalankan proxy di semua path, kecuali:
     * - _next/static   (file statis)
     * - _next/image    (optimasi gambar)
     * - favicon.ico
     * - asset gambar statis (.svg/.png/.jpg/.jpeg/.gif/.webp)
     * Route /api tetap dilewati proxy (session dibutuhkan di API juga).
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
