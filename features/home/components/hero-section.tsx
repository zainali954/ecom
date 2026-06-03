import { connectDB } from "@/lib/db";
import { Banner } from "@/models/banner";
import { HeroCarousel } from "./hero-carousel";

export async function HeroSection() {
  await connectDB();

  const now = new Date();
  const banners = await Banner.find({
    isActive: true,
    position: "hero",
    $or: [{ startsAt: null }, { startsAt: { $lte: now } }],
    $and: [{ $or: [{ endsAt: null }, { endsAt: { $gte: now } }] }],
  })
    .sort({ sortOrder: 1 })
    .limit(5)
    .lean();

  const slides = banners.map((banner) => ({
    id: String(banner._id),
    title: banner.title,
    subtitle: banner.subtitle || "",
    image: banner.image,
    link: banner.link || "/products",
  }));

  return <HeroCarousel slides={slides} />;
}
