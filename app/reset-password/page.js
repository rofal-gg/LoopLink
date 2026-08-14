import AuthShell from "@/components/auth/AuthShell";
import ResetPasswordForm from "./ResetPasswordForm";

export const metadata = {
  title: "Atur Kata Sandi Baru",
};

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Atur kata sandi baru"
      subtitle="Tautan ini dibuka lewat email lupa kata sandi"
      footer={
        <>
          Tautan tidak berlaku?{" "}
          <a
            href="/lupa-password"
            className="fr rounded font-medium text-loop-primary hover:underline"
          >
            Minta tautan baru
          </a>
        </>
      }
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}