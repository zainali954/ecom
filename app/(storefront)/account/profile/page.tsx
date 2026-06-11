import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/features/account/components/profile-form";

export const metadata: Metadata = {
  title: "Profile Settings",
  description: "Manage your profile and account settings",
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div>
      <h2 className="text-lg font-semibold">Profile Settings</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage your personal information and password
      </p>

      <div className="mt-6">
        <ProfileForm name={session.user.name ?? ""} email={session.user.email ?? ""} />
      </div>
    </div>
  );
}
