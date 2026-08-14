import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";
import CariFlow from "@/components/cari/CariFlow";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Cari Bahan",
};

export default async function CariPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/cari");
  }

  // Lokasi profil dipakai sebagai titik pusat pencarian (lokasiLat/lokasiLng
  // dikirim ke POST /api/listings/cari, tidak pernah dibuat-buat di client).
  const { data: profile } = await supabase
    .from("profiles")
    .select("nama_lengkap, alamat_teks, lokasi_lat, lokasi_lng")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="min-h-[100dvh] bg-loop-base">
      <AppHeader
        nama={profile?.nama_lengkap ?? null}
        email={user.email}
        currentPath="/cari"
      />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <CariFlow profile={profile ?? null} />
      </main>
    </div>
  );
}
