"use client";

import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";
import type { Review } from "@/types/review";

interface Props {
  reviews: Review[];
}

export function ReviewsSection({ reviews }: Props) {
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
    <section className="pb-20 overflow-hidden">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex cursor-grab select-none">
          {repeated.map((item, idx) => {
            // "Lucie Marková, Kavárna u Lípy" → name + role
            const [namePart, ...roleParts] = (item.reviewAuthor ?? "").split(",");
            const name = namePart.trim();
            const role = roleParts.join(",").trim();
            const initials = name
              .split(/\s+/)
              .filter(Boolean)
              .slice(0, 2)
              .map((w) => w[0])
              .join("")
              .toUpperCase();

            return (
              <div
                key={`${item.id}-${idx}`}
                className="shrink-0 basis-full sm:basis-1/2 lg:basis-1/3 pr-4 md:pr-6"
                draggable={false}
              >
                <figure className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-coral/8 border border-coral/15 px-6 py-8 md:px-8 md:py-10">
                  {/* Oversized decorative quotation mark */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -top-2 md:-top-3 right-2 md:right-4 select-none font-serif leading-none text-coral/10 text-[120px] md:text-[160px]"
                  >
                    ”
                  </span>

                  <blockquote
                    className="relative z-10 text-lg md:text-xl font-medium text-foreground leading-relaxed rich-content whitespace-normal wrap-break-word [&_p]:m-0"
                    dangerouslySetInnerHTML={{
                      __html: formatReview(item.review),
                    }}
                  />

                  <figcaption className="relative z-10 mt-auto flex items-center gap-3 pt-6">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-coral text-white font-black text-base">
                      {initials || "“"}
                    </span>
                    <span className="flex flex-col">
                      <span className="font-bold text-foreground text-sm md:text-base leading-tight">
                        {name}
                      </span>
                      {role && (
                        <span className="text-xs md:text-sm text-muted-foreground mt-0.5">
                          {role}
                        </span>
                      )}
                    </span>
                  </figcaption>
                </figure>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
