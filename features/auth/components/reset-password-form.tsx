"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resetPassword } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuthActionState } from "@/types/auth";

const initialState: AuthActionState = { success: false, message: "" };

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, isPending] = useActionState(resetPassword, initialState);

  if (state.success) {
    return (
      <div className="space-y-4 text-center">
        <div className="rounded-lg border border-border bg-muted/50 p-4">
          <p className="text-sm text-foreground">{state.message}</p>
        </div>
        <Link href="/login" className="text-sm font-medium text-foreground hover:underline">
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5 sm:space-y-4">
      <input type="hidden" name="token" value={token} />

      {state.message && !state.success && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
          {state.message}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          required
        />
        {state.errors?.password && (
          <p className="text-sm text-destructive">{state.errors.password[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          required
        />
        {state.errors?.confirmPassword && (
          <p className="text-sm text-destructive">{state.errors.confirmPassword[0]}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Resetting..." : "Reset password"}
      </Button>
    </form>
  );
}
