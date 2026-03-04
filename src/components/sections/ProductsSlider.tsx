'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { ProductsSliderSection } from '@/types/homepage';
import { formatPrice, getStrapiImageUrl } from '@/lib/utils';

interface Props {
  section: ProductsSliderSection;
}

export function ProductsSlider({ section }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const products = section.products ?? [];
  const animationRef = useRef<number>(0);
  const isPaused = useRef(false);

  // Show max 4 products, duplicate enough for seamless infinite loop
  const visibleProducts = products.slice(0, 4);
  const copies = 7;
  const items = visibleProducts.length > 0
    ? Array.from({ length: copies }, () => visibleProducts).flat()
    : [];

  function getMaxPrice(product: typeof products[number]): number {
    const prices = product.variants?.map((v) => v.price).filter((p): p is number => p != null) ?? [];
    return prices.length > 0 ? Math.max(...prices) : product.price;
  }

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || visibleProducts.length === 0) return;

    const cardWidth = 344; // 320px card + 24px gap
    const singleSetWidth = visibleProducts.length * cardWidth;
    // Start in the middle zone so we have room to scroll both directions
    const midPoint = Math.floor(copies / 2) * singleSetWidth;
    el.scrollLeft = midPoint;

    // Wrap scrollLeft to stay in the middle copies zone
    const wrapScroll = () => {
      if (el.scrollLeft >= midPoint + singleSetWidth) {
        el.scrollLeft -= singleSetWidth;
      } else if (el.scrollLeft <= midPoint - singleSetWidth) {
        el.scrollLeft += singleSetWidth;
      }
    };

    const speed = 0.5;

    const animate = () => {
      if (!isPaused.current && el) {
        el.scrollLeft += speed;
        wrapScroll();
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    // Touch drag
    let touchStartX = 0;
    let touchScrollLeft = 0;

    const onTouchStart = (e: TouchEvent) => {
      isPaused.current = true;
      touchStartX = e.touches[0].pageX;
      touchScrollLeft = el.scrollLeft;
    };

    const onTouchMove = (e: TouchEvent) => {
      const dx = e.touches[0].pageX - touchStartX;
      el.scrollLeft = touchScrollLeft - dx;
      wrapScroll();
      // Update origin so wrap doesn't cause a jump
      touchStartX = e.touches[0].pageX;
      touchScrollLeft = el.scrollLeft;
    };

    const onTouchEnd = () => {
      isPaused.current = false;
    };

    // Mouse drag (desktop touch-like behavior)
    let mouseDown = false;
    let mouseStartX = 0;
    let mouseScrollLeft = 0;
    let hasDragged = false;

    const onMouseDown = (e: MouseEvent) => {
      mouseDown = true;
      hasDragged = false;
      mouseStartX = e.pageX;
      mouseScrollLeft = el.scrollLeft;
      isPaused.current = true;
      el.style.cursor = 'grabbing';
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!mouseDown) return;
      const dx = e.pageX - mouseStartX;
      if (Math.abs(dx) > 3) hasDragged = true;
      el.scrollLeft = mouseScrollLeft - dx;
      wrapScroll();
      // Update origin so wrap doesn't cause a jump
      mouseStartX = e.pageX;
      mouseScrollLeft = el.scrollLeft;
    };

    const onMouseUp = () => {
      if (!mouseDown) return;
      mouseDown = false;
      isPaused.current = false;
      el.style.cursor = 'grab';
    };

    const onClick = (e: MouseEvent) => {
      if (hasDragged) {
        e.preventDefault();
        e.stopPropagation();
        hasDragged = false;
      }
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('touchend', onTouchEnd);
    el.addEventListener('mousedown', onMouseDown);
    el.addEventListener('mousemove', onMouseMove);
    el.addEventListener('mouseup', onMouseUp);
    el.addEventListener('mouseleave', onMouseUp);
    el.addEventListener('click', onClick, true);

    return () => {
      cancelAnimationFrame(animationRef.current);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('mousedown', onMouseDown);
      el.removeEventListener('mousemove', onMouseMove);
      el.removeEventListener('mouseup', onMouseUp);
      el.removeEventListener('mouseleave', onMouseUp);
      el.removeEventListener('click', onClick, true);
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

      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-hidden pb-4 cursor-grab select-none"
      >
        {items.map((product, idx) => {
          const price = getMaxPrice(product);
          const imgUrl = getStrapiImageUrl(product.images?.[0]?.url);

          return (
            <Link
              key={`${product.documentId}-${idx}`}
              href={`/produkty/${product.slug}`}
              className="shrink-0 w-80 snap-start group"
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
              <p className="font-bold text-center text-sm leading-tight mb-1">{product.name}</p>
              {price > 0 && (
                <p className="text-center text-sm font-semibold text-price">
                  {formatPrice(price)}
                </p>
              )}
            </Link>
          );
        })}
      </div>

      <div className="flex justify-center mt-8 px-4">
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
