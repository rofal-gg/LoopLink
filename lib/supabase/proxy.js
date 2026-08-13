import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

/**
 * updateSession — inti proxy refresh sesi LoopLink.
 * Dipanggil dari file `proxy.js` di root project (konvensi Next.js 16).
 *
 * Tanggung jawab:
 * 1. Membaca cookie sesi Supabase dari request.
 * 2. Memanggil `supabase.auth.getClaims()` — memvalidasi JWT dan me-refresh
 *    token yang kadaluarsa. JANGAN ganti dengan `getSession()`: method itu
 *    tidak menjamin revalidasi token di sisi server.
 * 3. Meneruskan token baru ke Server Component (`request.cookies.set`) dan
 *    ke browser (`response.cookies.set`) agar cookie tetap sinkron.
 *
 * PENTING:
 * - Jangan letakkan kode lain di antara `createServerClient` dan
 *   `getClaims()` — bisa bikin user logout acak.
 * - Wajib return `supabaseResponse` apa adanya. Kalau membuat response baru,
 *   salin cookie-nya dulu (lihat komentar di bawah).
 */
export async function updateSession(request) {
  // Guard: jika env var Supabase belum diisi (belum ada .env.local),
  // lewati refresh sesi supaya dev server tetap jalan tanpa error 500.
  // Setelah key diisi, branch ini tidak akan pernah terpilih.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  // Jangan simpan client ini di global variable — buat baru setiap request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
          // Cache headers (Cache-Control / Expires / Pragma) WAJIB diterapkan
          // ke response yang membawa Set-Cookie, supaya CDN/reverse proxy
          // tidak meng-cache dan membocorkan sesi ke user lain.
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value)
          );
        },
      },
    }
  );

  // Wajib dipanggil agar token yang hampir kadaluarsa di-refresh.
  // `getClaims()` memvalidasi signature JWT terhadap JWKS project.
  await supabase.auth.getClaims();

  // TODO (saat fitur auth dikerjakan): tambahkan guard route di sini.
  // Contoh pola resmi Supabase:
  //   if (!user && !pathname.startsWith("/login") && !pathname.startsWith("/auth")) {
  //     return NextResponse.redirect(new URL("/login", request.url));
  //   }
  // Belum ditambahkan karena halaman /login belum dibuat — proxy saat ini
  // hanya bertugas me-refresh sesi, tidak memblokir akses.

  return supabaseResponse;
}
