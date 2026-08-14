import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";
import PengaturanForm from "@/components/manajemen/PengaturanForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Pengaturan Akun",
};

/**
 * Halaman "Pengaturan Akun" (Task 4.6.4).
 * Server Component: guard login + profil (nama untuk header & info akun).
 * Mutasi akun (ganti sandi, keluar) ditangani client component lewat
 * auth Supabase langsung (pola ResetPasswordForm / AppHeader).
 */
export default async function PengaturanPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/pengaturan");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("nama_lengkap, status_akun, created_at")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="min-h-[100dvh] bg-loop-base">
      <AppHeader
        nama={profile?.nama_lengkap ?? null}
        email={user.email}
        currentPath="/pengaturan"
      />
      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        <PengaturanForm user={user} profile={profile ?? null} />
      </main>
    </div>
  );
}