import type { Review } from '@/types/review';

interface Props {
  reviews: Review[];
}

export function ReviewsSection({ reviews }: Props) {
  if (reviews.length === 0) return null;

  const formatReview = (html: string) => {
    if (!html) return '';
    return html
      .replace(/(<p[^>]*>)/i, '$1„')
      .replace(/(<\/p>)(?![\s\S]*<\/p>)/i, '“$1');
  };

  const randomReview = reviews[Math.floor(Math.random() * reviews.length)];

  // "Lucie Marková, Kavárna u Lípy" → name + role
  const [namePart, ...roleParts] = (randomReview.reviewAuthor ?? '').split(',');
  const name = namePart.trim();
  const role = roleParts.join(',').trim();
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <div className="mt-12 md:mt-20 mb-12 md:mb-20">
      <h3 className="font-bold text-2xl md:text-4xl mb-6 md:mb-8">
        ŘÍKAJÍ PARTNEŘI
      </h3>

      <figure className="relative overflow-hidden rounded-3xl bg-coral/8 border border-coral/15 px-8 py-10 md:px-14 md:py-14">
        {/* Oversized decorative quotation mark */}
        <span
          aria-hidden
          className="pointer-events-none absolute -top-2 md:-top-4 right-2 md:right-8 select-none font-serif leading-none text-coral/10 text-[150px] md:text-[230px]"
        >
          ”
        </span>

        <blockquote
          className="relative z-10 max-w-3xl text-2xl md:text-3xl font-medium text-foreground leading-relaxed rich-content [&_p]:m-0"
          dangerouslySetInnerHTML={{ __html: formatReview(randomReview.review) }}
        />

        <figcaption className="relative z-10 mt-8 md:mt-10 flex items-center gap-4">
          <span className="flex h-12 w-12 md:h-14 md:w-14 shrink-0 items-center justify-center rounded-full bg-coral text-white font-black text-base md:text-lg">
            {initials || '“'}
          </span>
          <span className="flex flex-col">
            <span className="font-bold text-foreground text-base md:text-lg leading-tight">
              {name}
            </span>
            {role && (
              <span className="text-sm md:text-base text-muted-foreground mt-0.5">
                {role}
              </span>
            )}
          </span>
        </figcaption>
      </figure>
    </div>
  );
}
