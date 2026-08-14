import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";
import ProfilForm from "@/components/manajemen/ProfilForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Profil Saya",
};

/**
 * Halaman "Profil Saya" (Task 4.6.3).
 * Server Component: guard login + ambil profil lengkap. Akun yang
 * status_akun-nya 'diblokir' / 'nonaktif' tidak boleh berada di halaman ini
 * (tidak layak menampilkan info pribadi) -> dialihkan ke /unauthorized
 * (pilihan: redirect, konsisten dengan guard route lain).
 */
export default async function ProfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/profil");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (
    profile &&
    (profile.status_akun === "diblokir" || profile.status_akun === "nonaktif")
  ) {
    redirect("/unauthorized");
  }

  return (
    <div className="min-h-[100dvh] bg-loop-base">
      <AppHeader
        nama={profile?.nama_lengkap ?? null}
        email={user.email}
        currentPath="/profil"
      />
      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        <ProfilForm user={user} profile={profile ?? null} />
      </main>
    </div>
  );
}