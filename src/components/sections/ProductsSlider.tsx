'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { ProductsSliderSection } from '@/types/homepage';
import { formatPrice, formatPriceWithoutVat, getStrapiImageUrl } from '@/lib/utils';
import { useVatRate } from '@/providers/vat-rate-provider';

interface Props {
  section: ProductsSliderSection;
}

export function ProductsSlider({ section }: Props) {
  const vatRate = useVatRate();
  const trackRef = useRef<HTMLDivElement>(null);
  const products = section.products ?? [];
  const animationRef = useRef<number>(0);
  const isPaused = useRef(false);
  const offsetRef = useRef(0);
  const [ready, setReady] = useState(false);

  const visibleProducts = products.slice(0, 4);
  // 3 copies is enough for seamless infinite loop with transform
  const copies = 3;
  const items = visibleProducts.length > 0
    ? Array.from({ length: copies }, () => visibleProducts).flat()
    : [];

  function getMaxPrice(product: typeof products[number]): number {
    const prices = product.variants?.map((v) => v.price).filter((p): p is number => p != null) ?? [];
    return prices.length > 0 ? Math.max(...prices) : product.price;
  }

  useEffect(() => {
    const track = trackRef.current;
    if (!track || visibleProducts.length === 0) return;

    // Measure one set of cards width
    const isMobile = window.innerWidth < 768;
    const gap = isMobile ? 8 : 24;
    const firstCard = track.querySelector(':scope > a') as HTMLElement | null;
    const cardWidth = firstCard ? firstCard.offsetWidth + gap : 320 + gap;
    const singleSetWidth = visibleProducts.length * cardWidth;

    // Start in the middle copy
    offsetRef.current = singleSetWidth;
    track.style.transform = `translateX(-${offsetRef.current}px)`;
    setReady(true);

    const wrapOffset = () => {
      if (offsetRef.current >= singleSetWidth * 2) {
        offsetRef.current -= singleSetWidth;
      } else if (offsetRef.current <= 0) {
        offsetRef.current += singleSetWidth;
      }
    };

    const speed = isMobile ? 1 : 0.5;

    const animate = () => {
      if (!isPaused.current && track) {
        offsetRef.current += speed;
        wrapOffset();
        track.style.transform = `translateX(-${offsetRef.current}px)`;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    // Touch drag
    let touchStartX = 0;
    let touchOffset = 0;

    const onTouchStart = (e: TouchEvent) => {
      isPaused.current = true;
      touchStartX = e.touches[0].pageX;
      touchOffset = offsetRef.current;
    };

    const onTouchMove = (e: TouchEvent) => {
      const dx = e.touches[0].pageX - touchStartX;
      offsetRef.current = touchOffset - dx;
      wrapOffset();
      track.style.transform = `translateX(-${offsetRef.current}px)`;
      // Update origin so wrap doesn't cause a jump
      touchStartX = e.touches[0].pageX;
      touchOffset = offsetRef.current;
    };

    const onTouchEnd = () => {
      isPaused.current = false;
    };

    // Mouse drag
    let mouseDown = false;
    let mouseStartX = 0;
    let mouseOffset = 0;
    let hasDragged = false;

    const onMouseDown = (e: MouseEvent) => {
      mouseDown = true;
      hasDragged = false;
      mouseStartX = e.pageX;
      mouseOffset = offsetRef.current;
      isPaused.current = true;
      track.style.cursor = 'grabbing';
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!mouseDown) return;
      const dx = e.pageX - mouseStartX;
      if (Math.abs(dx) > 3) hasDragged = true;
      offsetRef.current = mouseOffset - dx;
      wrapOffset();
      track.style.transform = `translateX(-${offsetRef.current}px)`;
      mouseStartX = e.pageX;
      mouseOffset = offsetRef.current;
    };

    const onMouseUp = () => {
      if (!mouseDown) return;
      mouseDown = false;
      isPaused.current = false;
      track.style.cursor = 'grab';
    };

    const onClick = (e: MouseEvent) => {
      if (hasDragged) {
        e.preventDefault();
        e.stopPropagation();
        hasDragged = false;
      }
    };

    track.addEventListener('touchstart', onTouchStart, { passive: true });
    track.addEventListener('touchmove', onTouchMove, { passive: true });
    track.addEventListener('touchend', onTouchEnd);
    track.addEventListener('mousedown', onMouseDown);
    track.addEventListener('mousemove', onMouseMove);
    track.addEventListener('mouseup', onMouseUp);
    track.addEventListener('mouseleave', onMouseUp);
    track.addEventListener('click', onClick, true);

    return () => {
      cancelAnimationFrame(animationRef.current);
      track.removeEventListener('touchstart', onTouchStart);
      track.removeEventListener('touchmove', onTouchMove);
      track.removeEventListener('touchend', onTouchEnd);
      track.removeEventListener('mousedown', onMouseDown);
      track.removeEventListener('mousemove', onMouseMove);
      track.removeEventListener('mouseup', onMouseUp);
      track.removeEventListener('mouseleave', onMouseUp);
      track.removeEventListener('click', onClick, true);
    };
  }, [visibleProducts.length]);

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Wave top */}
      <div className="absolute top-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0,40 C360,0 1080,80 1440,40 L1440,0 L0,0 Z" fill="white" />
        </svg>
      </div>

      {section.title && (
        <h2 className="text-3xl md:text-4xl font-black uppercase text-center mb-12 px-4">
          {section.title}
        </h2>
      )}

      <div className="overflow-hidden">
        <div
          ref={trackRef}
          className={`flex gap-2 md:gap-6 cursor-grab select-none will-change-transform ${
            ready ? '' : 'invisible'
          }`}
        >
          {items.map((product, idx) => {
            const price = getMaxPrice(product);
            const imgUrl = getStrapiImageUrl(product.images?.[0]?.url);

            return (
              <Link
                key={`${product.documentId}-${idx}`}
                href={`/produkty/${product.slug}`}
                className="shrink-0 w-56 md:w-80 snap-start group"
                draggable={false}
              >
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-white mb-3">
                  {imgUrl ? (
                    <Image
                      src={imgUrl}
                      alt={product.name}
                      fill
                      sizes="224px"
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
          href="/produkty"
          className="px-10 py-4 rounded-full font-bold uppercase text-sm tracking-widest text-white transition-opacity hover:opacity-90 bg-coral"
        >
          Máme jich víc, koukni
        </Link>
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
