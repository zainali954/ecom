"use client";

import { useActionState } from "react";
import { updateProfile, requestPasswordChange } from "@/features/account/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuthActionState } from "@/types/auth";

const initialState: AuthActionState = { success: false, message: "" };

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const [profileState, profileAction, isProfilePending] = useActionState(
    updateProfile,
    initialState,
  );
  const [passwordState, passwordAction, isPasswordPending] = useActionState(
    requestPasswordChange,
    initialState,
  );

  return (
    <div className="space-y-8">
      {/* Name change */}
      <div className="rounded-lg border bg-card">
        <div className="border-b px-6 py-4">
          <h3 className="text-sm font-medium">Personal Information</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Update your name and personal details
          </p>
        </div>
        <form action={profileAction} className="px-6 py-4">
          {profileState.message && (
            <div
              className={`mb-4 rounded-lg border p-3 text-sm ${
                profileState.success
                  ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300"
                  : "border-destructive/20 bg-destructive/5 text-destructive"
              }`}
            >
              {profileState.message}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                defaultValue={name}
                placeholder="Your name"
                required
                minLength={2}
                maxLength={100}
              />
              {profileState.errors?.name && (
                <p className="text-xs text-destructive">{profileState.errors.name[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button type="submit" size="sm" disabled={isProfilePending}>
              {isProfilePending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </div>

      {/* Password change */}
      <div className="rounded-lg border bg-card">
        <div className="border-b px-6 py-4">
          <h3 className="text-sm font-medium">Password</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Change your password via a secure email link
          </p>
        </div>
        <div className="px-6 py-4">
          {passwordState.message && (
            <div
              className={`mb-4 rounded-lg border p-3 text-sm ${
                passwordState.success
                  ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300"
                  : "border-destructive/20 bg-destructive/5 text-destructive"
              }`}
            >
              {passwordState.message}
            </div>
          )}

          <p className="mb-4 text-sm text-muted-foreground">
            For security, we&apos;ll send a link to your email address. Click the link to set a new
            password.
          </p>

          <form action={passwordAction}>
            <Button type="submit" variant="outline" size="sm" disabled={isPasswordPending}>
              {isPasswordPending ? "Sending..." : "Send password change link"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
