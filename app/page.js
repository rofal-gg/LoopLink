import { createClient } from "@/lib/supabase/server";
import Landing from "@/components/landing/Landing";
import { ambilDataLanding } from "@/lib/api/landing";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Ubah Limbah Jadi Bahan Bernilai",
  description:
    "Marketplace hiper-lokal pertukaran limbah. Buang limbahmu dengan mudah, atau cari bahan daur ulang murah di sekitarmu.",
};

export default async function HomePage() {
  let loggedIn = false;
  try {
    const supabase = await createClient();
    const {
      data: { claims },
      error,
    } = await supabase.auth.getClaims();
    loggedIn = !error && !!claims;
  } catch {
    loggedIn = false;
  }

  // Data Landing page dari DB yang jujur (statistik via RPC, listing/foto/
  // aktivitas/testimoni via admin client server-only). Helper `lib/api/landing`
  // defensif: kalau satu blok gagal, blok itu diberi fallback (null/[]) dan
  // halaman tetap render. Frontend memakai `data` untuk menampilkan angka
  // asli + label sumber, bukan placeholder.
  const data = await ambilDataLanding();

  return <Landing loggedIn={loggedIn} data={data} />;
}
