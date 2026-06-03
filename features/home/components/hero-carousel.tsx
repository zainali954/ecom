"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
}

interface HeroCarouselProps {
  slides: HeroSlide[];
}

const placeholderSlides: HeroSlide[] = [
  {
    id: "1",
    title: "New Arrivals",
    subtitle: "Discover the latest products at unbeatable prices",
    image: "",
    link: "/products",
  },
  {
    id: "2",
    title: "Summer Sale",
    subtitle: "Up to 50% off on selected items",
    image: "",
    link: "/products",
  },
  {
    id: "3",
    title: "Free Delivery",
    subtitle: "On orders above Rs. 2,000 across Pakistan",
    image: "",
    link: "/products",
  },
];

export function HeroCarousel({ slides }: HeroCarouselProps) {
  const items = slides.length > 0 ? slides : placeholderSlides;

  return (
    <Carousel className="w-full" opts={{ loop: true }}>
      <CarouselContent>
        {items.map((slide) => (
          <CarouselItem key={slide.id}>
            <div className="relative flex min-h-[320px] items-center justify-center overflow-hidden rounded-xl bg-muted sm:min-h-[400px] lg:min-h-[480px]">
              {slide.image && (
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="100vw"
                />
              )}
              <div className="relative z-10 flex flex-col items-center gap-4 px-6 text-center">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  {slide.title}
                </h2>
                <p className="max-w-md text-base text-muted-foreground sm:text-lg">
                  {slide.subtitle}
                </p>
                <Button asChild size="lg">
                  <Link href={slide.link}>Shop Now</Link>
                </Button>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-4" />
      <CarouselNext className="right-4" />
    </Carousel>
  );
}
