import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";
import ListingSaya from "@/components/manajemen/ListingSaya";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Listing Saya",
};

/**
 * Halaman "Listing Saya" (Task 4.6.1).
 * Server Component: guard login, lalu ambil semua listing milik user
 * (RLS memastikan hanya milik sendiri) berikut foto utama, diurutkan
 * updated_at terbaru. Tab/filter ditangani client component.
 */
export default async function ListingSayaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/listing-saya");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("nama_lengkap")
    .eq("id", user.id)
    .maybeSingle();

  const { data: listings } = await supabase
    .from("listings")
    .select(
      "id, judul, kategori_citra, kategori_dikoreksi, confidence_score, jumlah, satuan, status, diklaim_oleh, diklaim_pada, dibatalkan_oleh, expired_at, created_at, updated_at, listing_photos(foto_url, urutan)"
    )
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  return (
    <div className="min-h-[100dvh] bg-loop-base">
      <AppHeader
        nama={profile?.nama_lengkap ?? null}
        email={user.email}
        currentPath="/listing-saya"
      />
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        <ListingSaya listings={listings ?? []} />
      </main>
    </div>
  );
}