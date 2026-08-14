import Logo from "@/components/brand/Logo";
import { LockKeyhole } from "lucide-react";
import UnauthorizedActions from "@/components/manajemen/UnauthorizedActions";

export const metadata = {
  title: "Akses Tidak Diizinkan",
};

/**
 * Unauthorized access (Task 4.7).
 * Halaman "Akses tidak diizinkan" - tampil saat sesi/akun tidak diizinkan
 * (contoh: status_akun diblokir/nonaktif, akses tanpa hak). Standalone
 * (tanpa AppHeader) dan tidak menampilkan data pribadi apa pun.
 * Tidak perlu masuk ALLOWED_NEXT: bukan target ?next= setelah login.
 */
export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-loop-base px-4 py-10">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center">
          <Logo />
        </div>

        <div className="mt-8 rounded-[20px] border border-loop-mist bg-white p-8 shadow-[0_12px_40px_rgba(28,43,34,0.08)] sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-loop-mist text-loop-ink">
            <LockKeyhole className="h-7 w-7" strokeWidth={1.8} />
          </div>
          <h1 className="mt-5 font-display text-2xl font-bold tracking-tight text-loop-ink">
            Akses tidak diizinkan
          </h1>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-loop-line">
            Sesi atau akunmu tidak diizinkan membuka halaman ini. Contohnya
            akun yang diblokir atau dinonaktifkan. Keluar lalu masuk ulang
            dengan akun lain untuk melanjutkan.
          </p>

          <UnauthorizedActions />
        </div>
      </div>
    </main>
  );
}