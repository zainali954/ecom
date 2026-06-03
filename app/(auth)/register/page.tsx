import type { Metadata } from "next";
import { RegisterForm } from "@/features/auth/components/register-form";

export const metadata: Metadata = {
  title: "Create account — DollarShop",
};

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h2 className="text-lg font-medium">Create an account</h2>
        <p className="text-sm text-muted-foreground">Enter your details to get started</p>
      </div>
      <RegisterForm />
    </div>
  );
}
