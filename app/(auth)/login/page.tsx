import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your ShopRehan account to manage orders and track deliveries.",
};

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center">
        <h2 className="text-xl font-medium sm:text-lg">Welcome back</h2>
        <p className="text-base text-muted-foreground sm:text-sm">Sign in to your account</p>
      </div>
      <LoginForm />
    </div>
  );
}
