import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { auth } from "@/auth";
import { getCartItemCount } from "@/features/cart/queries";
import { getWishlistItemCount } from "@/features/wishlist/queries";
import { NavLinks } from "./nav-links";
import { SearchBar } from "./search-bar";
import { NavActions } from "./nav-actions";
import { MobileMenu } from "./mobile-menu";

export async function Navbar() {
  await connection();
  const [session, cartCount, wishlistCount] = await Promise.all([
    auth(),
    getCartItemCount(),
    getWishlistItemCount(),
  ]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <MobileMenu />

        <Link href="/" className="mr-2 flex items-center gap-2 font-semibold tracking-tight">
          <Image src="/logo.svg" alt="ShopRehan" width={32} height={32} priority />
          ShopRehan
        </Link>

        <NavLinks className="hidden md:flex" />

        <div className="ml-auto flex items-center gap-3">
          <SearchBar />
          <NavActions session={session} cartCount={cartCount} wishlistCount={wishlistCount} />
        </div>
      </div>
    </header>
  );
}
