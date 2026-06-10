import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-6 sm:py-12">
      <div className="w-full max-w-md space-y-8 sm:max-w-sm sm:space-y-6">
        <Link href="/" className="flex items-center justify-center gap-2">
          <Image src="/logo.svg" alt="ShopRehan" width={36} height={36} priority />
          <h1 className="text-3xl font-semibold tracking-tight sm:text-2xl">ShopRehan</h1>
        </Link>
        {children}
      </div>
    </div>
  );
}
