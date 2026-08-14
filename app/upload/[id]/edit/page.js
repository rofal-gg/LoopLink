import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";
import EditFlow from "@/components/upload/EditFlow";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Edit Listing",
};

export default async function EditListingPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/upload/${id}/edit`);
  }

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
        currentPath="/upload"
      />
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        <EditFlow id={id} profile={profile ?? null} />
      </main>
    </div>
  );
}