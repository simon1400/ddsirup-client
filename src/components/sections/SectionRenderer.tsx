import type { HomepageSection } from '@/types/homepage';
import type { Review } from '@/types/review';
// import { CategoriesSection } from './CategoriesSection'; // section disabled
// import { TextSection } from './TextSection'; // section disabled
import { ProductsSlider } from './ProductsSlider';
import { FeaturesSection } from './FeaturesSection';
import { ContactFormSection } from './ContactFormSection';
import { PartnersCounterSection } from '@/components/sections/PartnersCounterSection';
import { ReviewsSection } from '@/components/sections/ReviewsSection';
import { BottleUsageSection } from '@/components/sections/BottleUsageSection';

interface Props {
  sections: HomepageSection[];
  reviews?: Review[];
  partnersNumber?: number;
}

export function SectionRenderer({ sections, reviews, partnersNumber }: Props) {
  return (
    <>
      {/* Animated partner counter — independent of reviews, shows whenever
          a partnersNumber is configured. */}
      {partnersNumber != null && (
        <PartnersCounterSection partnersNumber={partnersNumber} />
      )}

      {/* Reviews carousel — independent of the counter, shows only when
          there are reviews. */}
      {reviews && reviews.length > 0 && <ReviewsSection reviews={reviews} />}

      {sections.map((section) => {
        switch (section.__component) {
          // case 'sections.categories-section': // section disabled
          //   return <CategoriesSection key={`categories-${section.id}`} section={section} />;
          // case 'sections.text-section': // section disabled
          //   return <TextSection key={`text-${section.id}`} section={section} />;
          case 'sections.products-slider':
            return <ProductsSlider key={`slider-${section.id}`} section={section} />;
          case 'sections.features':
            return <FeaturesSection key={`features-${section.id}`} section={section} />;
          case 'sections.contact-form':
            return <ContactFormSection key={`contact-${section.id}`} section={section} />;
          case 'sections.bottle-usage':
            return <BottleUsageSection key={`bottle-${section.id}`} section={section} />;
          default:
            return null;
        }
      })}
    </>
  );
}
