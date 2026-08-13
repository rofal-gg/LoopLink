import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client untuk sisi browser (Client Component).
 * Memakai pola singleton dari @supabase/ssr — aman dipanggil berkali-kali.
 *
 * Hanya boleh memakai variabel NEXT_PUBLIC_* (aman terekspos ke browser).
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
