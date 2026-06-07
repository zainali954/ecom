import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const shopLinks = [
  { href: "/products", label: "All Products" },
  { href: "/categories", label: "Categories" },
];

const accountLinks = [
  { href: "/account", label: "My Account" },
  { href: "/account/orders", label: "Orders" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/cart", label: "Cart" },
];

const supportLinks = [
  { href: "#", label: "Contact Us" },
  { href: "#", label: "Shipping Policy" },
  { href: "#", label: "Return Policy" },
  { href: "#", label: "Privacy Policy" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              ShopRehan
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              Your one-stop shop for great deals. Quality products at the best prices in Pakistan.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium">Shop</h3>
            <ul className="mt-3 space-y-2">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-medium">Account</h3>
            <ul className="mt-3 space-y-2">
              {accountLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-medium">Support</h3>
            <ul className="mt-3 space-y-2">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <p className="text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} ShopRehan. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
