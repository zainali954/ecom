"use client";

import { useActionState } from "react";
import Link from "next/link";
import { forgotPassword } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuthActionState } from "@/types/auth";

const initialState: AuthActionState = { success: false, message: "" };

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(forgotPassword, initialState);

  if (state.success) {
    return (
      <div className="space-y-4 text-center">
        <div className="rounded-lg border border-border bg-muted/50 p-4">
          <p className="text-sm text-foreground">{state.message}</p>
        </div>
        <Link href="/login" className="text-sm font-medium text-foreground hover:underline">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5 sm:space-y-4">
      {state.message && !state.success && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
          {state.message}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Sending..." : "Send reset link"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-foreground hover:underline">
          Back to login
        </Link>
      </p>
    </form>
  );
}
