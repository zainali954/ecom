"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { login, resendVerificationEmail } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuthActionState } from "@/types/auth";

const initialState: AuthActionState = { success: false, message: "" };

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, initialState);
  const [resendState, resendAction, isResending] = useActionState(
    resendVerificationEmail,
    initialState,
  );
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);

  const isEmailNotVerified = state.errors?.emailNotVerified;

  useEffect(() => {
    if (state.success) {
      const params = new URLSearchParams(window.location.search);
      const callbackUrl = params.get("callbackUrl") ?? "/";
      router.push(callbackUrl);
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <form action={formAction} className="space-y-4">
      {isEmailNotVerified ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-3">
          <p className="text-sm text-amber-800">{state.message}</p>
          {resendState.success ? (
            <p className="text-sm font-medium text-green-700">{resendState.message}</p>
          ) : (
            <button
              type="button"
              disabled={isResending}
              className="text-sm font-medium text-amber-900 underline underline-offset-2 hover:text-amber-700 disabled:opacity-50"
              onClick={() => {
                const email = emailRef.current?.value;
                if (!email) return;
                const fd = new FormData();
                fd.set("email", email);
                resendAction(fd);
              }}
            >
              {isResending ? "Sending..." : "Resend verification email"}
            </button>
          )}
          {resendState.message && !resendState.success && (
            <p className="text-sm text-destructive">{resendState.message}</p>
          )}
        </div>
      ) : (
        state.message &&
        !state.success && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
            {state.message}
          </div>
        )
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          ref={emailRef}
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
        {state.errors?.email && <p className="text-sm text-destructive">{state.errors.email[0]}</p>}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link
            href="/forgot-password"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Forgot password?
          </Link>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />
        {state.errors?.password && (
          <p className="text-sm text-destructive">{state.errors.password[0]}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Signing in..." : "Sign in"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-foreground hover:underline">
          Sign up
        </Link>
      </p>
    </form>
  );
}
