import type { Metadata } from "next";
import { ResetPasswordForm } from "./components/reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password | Our Sanctuary",
  description: "Reset your account password.",
};

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <ResetPasswordForm />
    </div>
  );
}
