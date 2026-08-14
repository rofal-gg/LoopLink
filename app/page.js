import { createClient } from "@/lib/supabase/server";
import Landing from "@/components/landing/Landing";

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

  return <Landing loggedIn={loggedIn} />;
}
