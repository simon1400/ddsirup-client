import type { Review } from '@/types/review';

interface Props {
  reviews: Review[];
}

export function ReviewsSection({ reviews }: Props) {
  if (reviews.length === 0) return null;

  const formatReview = (html: string) => {
    if (!html) return "";
    return html
      .replace(/(<p[^>]*>)/i, '$1„')
      .replace(/(<\/p>)(?![\s\S]*<\/p>)/i, '“$1');
  };

  const randomReview = reviews[Math.floor(Math.random() * reviews.length)];

  return (
    <div className="mt-12 md:mt-20 mb-12 md:mb-20">
      <h3 className="font-bold text-2xl md:text-4xl mb-6 md:mb-8">
        ŘÍKAJÍ PARTNEŘI
      </h3>
      <div className="relative overflow-hidden rounded-3xl bg-coral/10 p-8 md:p-12 border border-gray-300 shadow-lg w-fit max-w-4xl">
        <div className="relative z-10 flex flex-col md:flex-row gap-6">
          <div className="shrink-0 rounded-2xl bg-white/80 p-3.5 shadow-sm border border-coral/10">
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              className="text-coral"
              aria-hidden
            >
              <path
                d="M11 7.5H7a4 4 0 0 0-4 4v1a3 3 0 0 0 3 3h1a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2H5.5a2.5 2.5 0 0 1 2.5-2.5V7.5Zm10 0h-4a4 4 0 0 0-4 4v1a3 3 0 0 0 3 3h1a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2h-1.5a2.5 2.5 0 0 1 2.5-2.5V7.5Z"
                fill="currentColor"
              />
            </svg>
          </div>

          <div className="flex-1 space-y-4">
            <div
              className="text-xl md:text-2xl font-medium italic text-gray-800 leading-relaxed rich-content"
              dangerouslySetInnerHTML={{ __html: formatReview(randomReview.review) }}
            />
            <p className="font-black text-coral text-sm md:text-base tracking-widest uppercase mt-4">
              — {randomReview.reviewAuthor}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
