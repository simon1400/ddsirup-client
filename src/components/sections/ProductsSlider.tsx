'use client';

import Link from 'next/link';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import AutoScroll from 'embla-carousel-auto-scroll';
import type { ProductsSliderSection } from '@/types/homepage';
import { formatPrice, formatPriceWithoutVat, getStrapiImageUrl, getProductUrl } from '@/lib/utils';
import { useVatRate } from '@/providers/vat-rate-provider';

interface Props {
  section: ProductsSliderSection;
}

export function ProductsSlider({ section }: Props) {
  const vatRate = useVatRate();
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

  function getMaxPrice(product: typeof products[number]): number {
    const prices = product.variants?.map((v) => v.price).filter((p): p is number => p != null) ?? [];
    return prices.length > 0 ? Math.max(...prices) : product.price;
  }

  if (products.length === 0) return null;

  return (
    <section className="py-20 overflow-hidden">
      {section.title && (
        <h2 className="text-3xl md:text-4xl font-black uppercase text-center mb-12 px-4">
          {section.title}
        </h2>
      )}

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-2 md:gap-6 cursor-grab select-none">
          {products.map((product) => {
            const price = getMaxPrice(product);
            const imgUrl = getStrapiImageUrl(product.images?.[0]?.url);

            return (
              <Link
                key={product.documentId}
                href={getProductUrl(product.slug, product.category?.slug)}
                className="shrink-0 w-56 md:w-80 group"
                draggable={false}
              >
                <div className="relative aspect-3/4 rounded-2xl overflow-hidden bg-white mb-3">
                  {imgUrl ? (
                    <Image
                      src={imgUrl}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 224px, 320px"
                      loading="eager"
                      className="object-contain p-4 transition group-hover:scale-105"
                      draggable={false}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                      Bez obrázku
                    </div>
                  )}
                </div>
                <p className="font-bold text-center text-2xl leading-tight mb-1">{product.name}</p>
                {price > 0 && (
                  <>
                    <p className="text-center text-xl font-bold text-coral">
                      {formatPrice(price)}
                    </p>
                    <p className="text-center text-sm text-muted-foreground">
                      {formatPriceWithoutVat(price, vatRate)} bez DPH
                    </p>
                  </>
                )}
              </Link>
            );
          })}
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
