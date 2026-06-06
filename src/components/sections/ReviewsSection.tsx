'use client';

import useEmblaCarousel from 'embla-carousel-react';
import AutoScroll from 'embla-carousel-auto-scroll';
import type { Review } from '@/types/review';
import { Container } from '@/components/ui/Container';

interface Props {
  reviews: Review[];
  partnersNumber?: number;
}

export function ReviewsSection({ reviews, partnersNumber }: Props) {
  const [emblaRef] = useEmblaCarousel(
    {
      loop: true,
      align: 'start',
      slidesToScroll: 1,
      dragFree: true,
    },
    [AutoScroll({ speed: 0.8, startDelay: 0, stopOnInteraction: false, stopOnMouseEnter: true })]
  );

  if (reviews.length === 0) return null;

  const minSlides = Math.ceil(2000 / 200);
  const repeated = reviews.length >= minSlides ? reviews : Array.from({ length: Math.ceil(minSlides / reviews.length) }, () => reviews).flat();

  const formatReview = (html: string) => {
    if (!html) return "";
    return html
      .replace(/(<p[^>]*>)/i, '$1„') 
      .replace(/(<\/p>)(?![\s\S]*<\/p>)/i, '“$1');
  };

  return (
    <section className="py-20 overflow-hidden">
      <Container size="xl">
        <p className="text-xl md:text-2xl text-muted-foreground font-light text-center mb-10">
          Kolik podniků už s námi spolupracuje?
        </p>
        <h1 className="text-6xl md:text-9xl font-black uppercase text-center mb-10">
          {partnersNumber ?? 51}
        </h1>
        <p className="text-xl md:text-2xl text-center mb-12">Barů, kaváren a restaurací po celé ČR.</p>
      </Container>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4 md:gap-6 cursor-grab select-none">
          {repeated.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="shrink-0"
              style={{ width: 350 }}
              draggable={false}>
              <div className="rounded-3xl bg-green-soft/30 p-4 flex flex-col gap-3 h-full overflow-hidden">
                {/* Quote icon */}
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-coral shrink-0"
                  aria-hidden>
                  <path
                    d="M11 7.5H7a4 4 0 0 0-4 4v1a3 3 0 0 0 3 3h1a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2H5.5a2.5 2.5 0 0 1 2.5-2.5V7.5Zm10 0h-4a4 4 0 0 0-4 4v1a3 3 0 0 0 3 3h1a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2h-1.5a2.5 2.5 0 0 1 2.5-2.5V7.5Z"
                    fill="currentColor"/>
                </svg>

                <div
                  className="text-lg text-gray-800 leading-relaxed flex-1 italic rich-content wrap-break-word"
                  dangerouslySetInnerHTML={{ __html: formatReview(item.review) }}
                />
                <p className="font-bold text-coral text-sm tracking-wide uppercase mt-auto">
                  — {item.reviewAuthor}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
    );
}
