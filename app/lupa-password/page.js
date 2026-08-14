import AuthShell from "@/components/auth/AuthShell";
import ForgotPasswordForm from "./ForgotPasswordForm";

export const metadata = {
  title: "Lupa Kata Sandi",
};

export default function LupaPasswordPage() {
  return (
    <AuthShell
      title="Lupa kata sandi"
      subtitle="Kami kirim tautan aman ke email kamu"
      footer={
        <>
          Ingat kata sandinya?{" "}
          <a
            href="/login"
            className="fr rounded font-medium text-loop-primary hover:underline"
          >
            Masuk
          </a>
        </>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}