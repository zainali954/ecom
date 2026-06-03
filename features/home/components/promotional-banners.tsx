import Image from "next/image";
import Link from "next/link";
import { connectDB } from "@/lib/db";
import { Banner } from "@/models/banner";

export async function PromotionalBanners() {
  await connectDB();

  const now = new Date();
  const banners = await Banner.find({
    isActive: true,
    position: "promotional",
    $or: [{ startsAt: null }, { startsAt: { $lte: now } }],
    $and: [{ $or: [{ endsAt: null }, { endsAt: { $gte: now } }] }],
  })
    .sort({ sortOrder: 1 })
    .limit(2)
    .lean();

  if (banners.length === 0) return null;

  return (
    <section className="grid gap-4 sm:grid-cols-2">
      {banners.map((banner) => {
        const content = (
          <div className="relative flex min-h-[180px] items-center overflow-hidden rounded-xl bg-muted p-6 sm:min-h-[220px]">
            {banner.image && (
              <Image
                src={banner.image}
                alt={banner.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
            )}
            <div className="relative z-10">
              <h3 className="text-lg font-semibold sm:text-xl">{banner.title}</h3>
              {banner.subtitle && (
                <p className="mt-1 text-sm text-muted-foreground">{banner.subtitle}</p>
              )}
            </div>
          </div>
        );

        return banner.link ? (
          <Link key={String(banner._id)} href={banner.link} className="block">
            {content}
          </Link>
        ) : (
          <div key={String(banner._id)}>{content}</div>
        );
      })}
    </section>
  );
}
