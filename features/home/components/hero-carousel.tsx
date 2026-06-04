"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
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
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const onSelect = useCallback(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
  }, [api]);

  useEffect(() => {
    if (!api) return;
    api.on("reInit", onSelect);
    api.on("select", onSelect);

    const interval = setInterval(() => {
      api.scrollNext();
    }, 5000);

    return () => {
      api.off("reInit", onSelect);
      api.off("select", onSelect);
      clearInterval(interval);
    };
  }, [api, onSelect]);

  return (
    <Carousel className="w-full" opts={{ loop: true }} setApi={setApi}>
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
              <div className="absolute inset-0 bg-black/40" />
              <div className="relative z-10 flex flex-col items-center gap-4 px-6 text-center">
                <h2 className="text-3xl font-bold tracking-tight text-white drop-shadow-lg sm:text-4xl lg:text-5xl">
                  {slide.title}
                </h2>
                <p className="max-w-md text-base text-white/85 sm:text-lg">{slide.subtitle}</p>
                <Button asChild size="lg">
                  <Link href={slide.link}>Shop Now</Link>
                </Button>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-4 border-0 bg-white/20 text-white backdrop-blur-sm hover:bg-white/40" />
      <CarouselNext className="right-4 border-0 bg-white/20 text-white backdrop-blur-sm hover:bg-white/40" />
      {items.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => api?.scrollTo(i)}
              className={`h-2 rounded-full transition-all ${
                i === current ? "w-6 bg-white" : "w-2 bg-white/50"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </Carousel>
  );
}
