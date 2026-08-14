import { Suspense } from "react";
import AuthShell from "@/components/auth/AuthShell";
import LoginForm from "./LoginForm";

export const metadata = {
  title: "Masuk",
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Masuk ke LoopLink"
      subtitle="Lanjutkan pertukaran limbah di sekitarmu"
      footer={
        <>
          Belum punya akun?{" "}
          <a
            href="/register"
            className="fr rounded font-medium text-loop-primary hover:underline"
          >
            Daftar gratis
          </a>
        </>
      }
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}