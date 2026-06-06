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

  return (
    <div className="mt-12 md:mt-20 mb-12 md:mb-20">
      <h3 className="font-bold text-2xl md:text-4xl mb-6 md:mb-8">
        ŘÍKAJÍ PARTNEŘI
      </h3>
      <div className="space-y-10">
        {reviews.map((review) => (
          <div
          key={review.id}
          className="flex flex-col gap-4 overflow-hidden p-6"
          
        >
          <div style={{ borderLeft: '4px solid #d1d5db', paddingLeft: '1rem' }}>
            <div
              className="flex flex-col gap-4 overflow-hidden text-xl"
              dangerouslySetInnerHTML={{ __html: formatReview(review.review) }}
            />
            <p className="text-lg text-muted-foreground">
              {review.reviewAuthor}
            </p>
          </div>
            
          </div>
        ))}
      </div>
    </div>
  );
}
