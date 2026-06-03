import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

const accountLinks = [
  { href: "/account", label: "Dashboard" },
  { href: "/account/addresses", label: "Addresses" },
];

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">My Account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Welcome back, {session.user.name}</p>
      </div>

      <div className="flex gap-8">
        <aside className="hidden w-48 shrink-0 lg:block">
          <nav className="space-y-1">
            {accountLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
