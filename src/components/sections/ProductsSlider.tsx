'use client';

import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import AutoScroll from 'embla-carousel-auto-scroll';
import type { ProductsSliderSection } from '@/types/homepage';
import { ProductCard } from '@/components/shop/ProductCard';

interface Props {
  section: ProductsSliderSection;
}

export function ProductsSlider({ section }: Props) {
  const products = section.products ?? [];

  const [emblaRef] = useEmblaCarousel(
    {
      loop: true,
      align: 'start',
      slidesToScroll: 1,
      dragFree: true,
    },
    [AutoScroll({ speed: 1, stopOnInteraction: false, stopOnMouseEnter: true })]
  );

  if (products.length === 0) return null;

  return (
    <section className="py-20 overflow-hidden">
      <h2 className="text-3xl md:text-4xl font-black uppercase text-center mb-12 px-4">
        {section.title || 'Nejoblíbenější příchutě'}
      </h2>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-2 md:gap-6 cursor-grab select-none">
          {products.map((product) => (
            <div key={product.documentId} className="shrink-0 w-56 md:w-80">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center mt-20 px-4">
        <Link
          href="/pro-kazdeho"
          className="px-10 py-4 rounded-full font-bold uppercase text-sm tracking-widest text-white transition-opacity hover:opacity-90 bg-coral"
        >
          Máme jich víc, koukni
        </Link>
      </div>
    </section>
  );
}
