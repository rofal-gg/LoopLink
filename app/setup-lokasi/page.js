import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";
import SetupLokasiForm from "./SetupLokasiForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Atur Lokasi",
};

export default async function SetupLokasiPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/setup-lokasi");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, nama_lengkap, no_telepon, alamat_teks, lokasi_lat, lokasi_lng")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="min-h-[100dvh] bg-loop-base">
      <AppHeader
        nama={profile?.nama_lengkap ?? null}
        email={user.email}
        currentPath="/setup-lokasi"
      />
      <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
        <SetupLokasiForm userId={user.id} profile={profile ?? null} />
      </main>
    </div>
  );
}