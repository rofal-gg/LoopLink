import AuthShell from "@/components/auth/AuthShell";
import RegisterForm from "./RegisterForm";

export const metadata = {
  title: "Daftar",
};

export default function RegisterPage() {
  return (
    <AuthShell
      title="Buat akun LoopLink"
      subtitle="Daftar gratis, mulai dari hal kecil di sekitarmu"
      footer={
        <>
          Sudah punya akun?{" "}
          <a
            href="/login"
            className="fr rounded font-medium text-loop-primary hover:underline"
          >
            Masuk
          </a>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}