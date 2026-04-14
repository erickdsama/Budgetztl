import type { Metadata } from "next";
import { RegisterForm } from "./components/register-form";

export const metadata: Metadata = {
  title: "Create Account | Our Sanctuary",
  description: "Create your shared digital space account.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
