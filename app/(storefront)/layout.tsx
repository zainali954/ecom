import { Navbar } from "@/features/layout/components/navbar";
import { Footer } from "@/features/layout/components/footer";

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
