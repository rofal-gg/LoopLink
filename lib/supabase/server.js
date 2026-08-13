import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase client untuk sisi server (Server Component, Server Action,
 * dan Route Handler / API route).
 *
 * Membaca & menulis sesi lewat cookie request. Wajib dipanggil ulang
 * di setiap request — jangan pernah di-cache antar request.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll dipanggil dari Server Component — tidak bisa menulis cookie.
            // Ini aman diabaikan karena proxy.js di root project yang me-refresh
            // sesi dan menulis cookie (lihat lib/supabase/proxy.js).
          }
        },
      },
    }
  );
}
