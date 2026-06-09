"use client";

import { useState, useEffect, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";
import type { Review } from "@/types/review";
import { Container } from "@/components/ui/Container";

interface Props {
  reviews: Review[];
  partnersNumber?: number;
}

export function ReviewsSection({ reviews, partnersNumber }: Props) {
  const targetNumber = partnersNumber ?? 51;
  const [displayNumber, setDisplayNumber] = useState(targetNumber);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          if (sectionRef.current) {
            observer.unobserve(sectionRef.current);
          }
        }
      },
      { threshold: 0.1 } 
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!isIntersecting) {
      setDisplayNumber(0);
      return;
    }

    let startTimestamp: number | null = null;
    const duration = 4000;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      const easedProgress = progress * (2 - progress);
      setDisplayNumber(Math.floor(easedProgress * targetNumber));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    const animationFrameId = window.requestAnimationFrame(step);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [isIntersecting, targetNumber]);

  const [emblaRef] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      slidesToScroll: 1,
      dragFree: true,
    },
    [
      AutoScroll({
        speed: 0.8,
        startDelay: 0,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      }),
    ],
  );

  if (reviews.length === 0) return null;

  const minSlides = Math.ceil(2000 / 200);
  const repeated =
    reviews.length >= minSlides
      ? reviews
      : Array.from(
          { length: Math.ceil(minSlides / reviews.length) },
          () => reviews,
        ).flat();

  const formatReview = (html: string) => {
    if (!html) return "";
    return html
      .replace(/(<p[^>]*>)/i, "$1„")
      .replace(/(<\/p>)(?![\s\S]*<\/p>)/i, "“$1");
  };

  return (
    <section ref={sectionRef} className="py-20 overflow-hidden">
      <Container size="xl">
        <p className="text-xl md:text-2xl text-muted-foreground font-light text-center mb-8">
          Kolik podniků už s námi spolupracuje?
        </p>
        <h1 
          className="text-6xl md:text-8xl font-bold uppercase text-center mb-8"
          style={{ letterSpacing: "-0.05em" }}
        >
          {displayNumber}
        </h1>
        <p className="text-xl md:text-2xl text-center mb-12">
          Barů, kaváren a restaurací po celé ČR.
        </p>
      </Container>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex cursor-grab select-none">
          {repeated.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="shrink-0 pr-4 md:pr-6"
              draggable={false}
            >
              <div className="rounded-3xl bg-green-soft/30 p-4 flex flex-col gap-3 overflow-hidden w-fit max-w-82">
                {/* Quote icon */}
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-coral shrink-0"
                  aria-hidden
                >
                  <path
                    d="M11 7.5H7a4 4 0 0 0-4 4v1a3 3 0 0 0 3 3h1a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2H5.5a2.5 2.5 0 0 1 2.5-2.5V7.5Zm10 0h-4a4 4 0 0 0-4 4v1a3 3 0 0 0 3 3h1a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2h-1.5a2.5 2.5 0 0 1 2.5-2.5V7.5Z"
                    fill="currentColor"
                  />
                </svg>

                <div
                  className="text-lg text-gray-800 leading-relaxed italic rich-content whitespace-normal wrap-break-word"
                  dangerouslySetInnerHTML={{
                    __html: formatReview(item.review),
                  }}
                />
                <p className="font-bold text-coral text-sm tracking-wide uppercase">
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
