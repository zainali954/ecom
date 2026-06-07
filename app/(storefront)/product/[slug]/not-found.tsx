import Link from "next/link";

export default function ProductNotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="text-4xl font-bold">Product Not Found</h1>
      <p className="mt-3 text-muted-foreground">
        The product you&apos;re looking for doesn&apos;t exist or has been removed.
      </p>
      <Link
        href="/products"
        className="mt-6 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Browse Products
      </Link>
    </div>
  );
}
