'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { ProductsSliderSection } from '@/types/homepage';

function formatPrice(price: number) {
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK' }).format(price);
}

interface Props {
  section: ProductsSliderSection;
}

export function ProductsSlider({ section }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const products = section.products ?? [];

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
  };

  // Max variant price or base price
  const getPrice = (product: typeof products[number]) => {
    const prices = product.variants?.map((v) => v.price).filter((p): p is number => p != null) ?? [];
    return prices.length > 0 ? Math.max(...prices) : product.price;
  };

  return (
    <section className="py-20 px-4 bg-[#F2837A]/10 relative overflow-hidden">
      {/* Wave top */}
      <div className="absolute top-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0,40 C360,0 1080,80 1440,40 L1440,0 L0,0 Z" fill="white" />
        </svg>
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        {section.title && (
          <h2 className="text-3xl md:text-4xl font-black uppercase text-center mb-12">
            {section.title}
          </h2>
        )}

        <div className="relative">
          {/* Prev button */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition"
            aria-label="Předchozí"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Scrollable track */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scroll-smooth pb-4 scrollbar-hide snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {products.map((product) => {
              const price = getPrice(product);
              const imgUrl = product.thumbnail?.url ?? product.thumbnail?.formats?.medium?.url;

              return (
                <Link
                  key={product.documentId}
                  href={`/products/${product.slug}`}
                  className="flex-shrink-0 w-56 snap-start group"
                >
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-white mb-3">
                    {imgUrl ? (
                      <Image
                        src={imgUrl}
                        alt={product.name}
                        fill
                        sizes="224px"
                        className="object-contain p-4 transition group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                        No image
                      </div>
                    )}
                  </div>
                  <p className="font-bold text-center text-sm leading-tight mb-1">{product.name}</p>
                  {price > 0 && (
                    <p className="text-center text-sm font-semibold" style={{ color: '#C85A2A' }}>
                      {formatPrice(price)}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Next button */}
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition"
            aria-label="Další"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M8 4l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Dot indicators */}
        {products.length > 0 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: Math.min(products.length, 9) }).map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-gray-400" />
            ))}
          </div>
        )}

        {/* CTA button */}
        <div className="flex justify-center mt-8">
          <Link
            href="/products"
            className="px-10 py-4 rounded-full font-bold uppercase text-sm tracking-widest text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#F2837A' }}
          >
            Máme jich víc, koukni
          </Link>
        </div>
      </div>

      {/* Wave bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="white" />
        </svg>
      </div>
    </section>
  );
}
