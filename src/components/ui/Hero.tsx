// components/Hero.tsx
"use client";

import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useSiteConfigStore } from "@/store/siteConfigStore";;

export default function Hero() {
  const { heroImages, heroTitle, heroSubtitle, primaryColor } = useSiteConfigStore();

  const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })]);

  return (
    <section className="relative min-h-[650px] overflow-hidden">
      <div className="embla" ref={emblaRef}>
        <div className="embla__container flex">
          {heroImages.map((url, i) => (
            <div key={i} className="embla__slide flex-none w-full relative">
              <img 
                src={url} 
                alt={`Hero ${i}`} 
                className="w-full h-[650px] object-cover" 
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent" />
            </div>
          ))}
        </div>
      </div>

      {/* Contenido del texto */}
      <div className="absolute inset-0 flex items-center z-10">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-6xl font-bold leading-tight">
            {heroTitle}
          </h1>
          <p className="mt-6 text-xl max-w-lg">{heroSubtitle}</p>
        </div>
      </div>
    </section>
  );
}