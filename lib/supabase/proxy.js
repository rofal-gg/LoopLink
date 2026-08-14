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
 * 4. Guard route berdasarkan sesi (lihat bagian bawah file).
 *
 * PENTING:
 * - Jangan letakkan kode lain di antara `createServerClient` dan
 *   `getClaims()` — bisa bikin user logout acak.
 * - Wajib return `supabaseResponse` apa adanya. Kalau membuat response baru
 *   (misalnya redirect), salin cookie-nya dulu supaya token hasil refresh
 *   tidak hilang.
 */

/** Halaman publik yang boleh diakses tanpa login. */
const PUBLIC_PATHS = new Set([
  "/",
  "/login",
  "/register",
  "/lupa-password",
  "/reset-password",
]);

/** Halaman auth yang tidak boleh diakses pengguna yang sudah login. */
const AUTH_PATHS = new Set(["/login", "/register", "/lupa-password"]);

/** Path target "next" yang diizinkan untuk redirect setelah login.
 *  Prefix dinamis (mis. "/cari", "/upload/<id>/edit", "/listing/<id>") ikut
 *  diizinkan lewat pengecekan `startsWith` di bawah. */
const ALLOWED_NEXT = new Set([
  "/home",
  "/setup-lokasi",
  "/upload",
  "/cari",
  "/listing",
  "/listing-saya",
  "/klaim-saya",
  "/profil",
  "/pengaturan",
]);

/**
 * Membuat response redirect sambil menyalin cookie sesi dari supabaseResponse.
 * Wajib: tanpa penyalinan ini, token yang baru di-refresh oleh getClaims()
 * tidak pernah sampai ke browser (efeknya "refresh loop" tiap request).
 *
 * @param targetPath contoh: "/login" atau "/login?next=/setup-lokasi"
 */
function redirectWithSession(request, supabaseResponse, targetPath) {
  const url = request.nextUrl.clone();
  const qIndex = targetPath.indexOf("?");
  url.pathname = qIndex === -1 ? targetPath : targetPath.slice(0, qIndex);
  url.search = qIndex === -1 ? "" : targetPath.slice(qIndex + 1);

  const response = NextResponse.redirect(url);
  for (const cookie of supabaseResponse.cookies.getAll()) {
    response.cookies.set(cookie);
  }
  return response;
}

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
  // Catatan: ketika tidak ada cookie sesi, `data` bisa bernilai null
  // (bukan objek kosong) — jadi akses `data?.claims` secara null-safe.
  const { data, error: claimsError } = await supabase.auth.getClaims();

  const user = claimsError ? null : (data?.claims ?? null);
  const { pathname } = request.nextUrl;

  // -------------------------------------------------------------------------
  // Guard route (Fase 4.1 / 4.2).
  // Aturan (kontrak brief):
  // - Belum login -> izinkan halaman publik (/ , /login, /register,
  //   /lupa-password, /reset-password). Selain itu redirect ke /login,
  //   dengan ?next= untuk path internal yang dikenal.
  // - Sudah login -> /login, /register, /lupa-password dialihkan ke /home.
  //   / dan /reset-password tetap boleh (landing bisa dilihat tanpa logout;
  //   reset dibuka lewat link email).
  // - /api/** TIDAK di-guard di sini. Route handler Fase 3 sudah menangani
  //   sendiri (401 JSON) dan redirect HTML justru merusak kontrak API.
  // - Tidak ada query ke database di middleware: urusan kelengkapan lokasi
  //   ditangani banner di /home dan redirect setelah register.
  // -------------------------------------------------------------------------
  if (!pathname.startsWith("/api")) {
    if (!user && !PUBLIC_PATHS.has(pathname)) {
      const cocokNext =
        ALLOWED_NEXT.has(pathname) ||
        [...ALLOWED_NEXT].some((p) => pathname.startsWith(`${p}/`));
      if (cocokNext) {
        return redirectWithSession(
          request,
          supabaseResponse,
          `/login?next=${encodeURIComponent(pathname)}`
        );
      }
      return redirectWithSession(request, supabaseResponse, "/login");
    }

    if (user && AUTH_PATHS.has(pathname)) {
      return redirectWithSession(request, supabaseResponse, "/home");
    }
  }

  return supabaseResponse;
}