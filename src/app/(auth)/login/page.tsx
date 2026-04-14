import type { Metadata } from "next";
import { LoginForm } from "./components/login-form";

export const metadata: Metadata = {
  title: "Sign In | Our Sanctuary",
  description: "Sign in to your shared digital space.",
};

export default function LoginPage() {
  return <LoginForm />;
}
